import json
from pathlib import Path

import httpx
import pytest

from app.services.ai_knowledge import (
    KnowledgeDocument,
    _intent_types,
    _tokens,
    build_extractive_answer,
    retrieve_documents,
)
from app.services.ai_advisor_service import (
    AIAdvisorService,
    PreparedAnswer,
    contains_thai,
)
from app.services.advisor_tools import (
    check_eligibility,
    compare_universities,
    run_relevant_tools,
    search_universities,
)
from app.services.gemini_client import GeminiClient, GeminiUnavailable


def make_document(
    document_id: str,
    document_type: str,
    title_en: str,
    body_en: str,
    aliases: tuple[str, ...] = (),
) -> KnowledgeDocument:
    search_text = f"{title_en} {body_en}".lower()
    return KnowledgeDocument(
        id=document_id,
        type=document_type,
        slug=document_id,
        title_en=title_en,
        title_km=title_en,
        body_en=body_en,
        body_km=body_en,
        snippet_en=body_en[:120],
        snippet_km=body_en[:120],
        url=f"/{document_type}s/{document_id}",
        search_text=search_text,
        title_tokens=frozenset(_tokens(title_en)),
        search_tokens=frozenset(_tokens(search_text)),
        aliases=frozenset(aliases),
    )


def test_tokens_support_khmer_without_a_tokenizer():
    tokens = _tokens("តើថ្លៃសិក្សានៅ ITC ប៉ុន្មាន?")
    assert "itc" in tokens
    assert any(token.startswith("ថ្លៃ") for token in tokens)


def test_intent_detection_handles_plurals():
    assert _intent_types("Which universities offer software engineering?") == [
        "university",
        "major",
    ]
    assert _intent_types("What scholarships can I apply for?") == ["scholarship"]


def test_explicit_acronym_wins_even_inside_a_khmer_sentence():
    documents = [
        make_document(
            "rupp",
            "university",
            "Royal University of Phnom Penh (RUPP)",
            "Public university in Phnom Penh. Tuition $250-$1,000 per year.",
            aliases=("rupp",),
        ),
        make_document(
            "itc",
            "university",
            "Institute of Technology of Cambodia (ITC)",
            "Public university in Phnom Penh. Tuition $800-$2,500 per year.",
            aliases=("itc",),
        ),
        make_document(
            "major",
            "major",
            "Software Engineering & Application Development",
            "Information technology major. Offered at ITC and RUPP.",
        ),
    ]

    results = retrieve_documents(documents, "តើថ្លៃសិក្សានៅ ITC ប៉ុន្មាន?")
    assert results[0].id == "itc"


def test_extractive_answer_is_honest_when_nothing_matches():
    answer = build_extractive_answer([], "en")
    assert "could not find" in answer.lower()
    km_answer = build_extractive_answer([], "km")
    assert "រកឃើញ" in km_answer


def test_retrieval_rejects_out_of_scope_questions():
    documents = [
        make_document(
            "rupp",
            "university",
            "Royal University of Phnom Penh (RUPP)",
            "Public university in Phnom Penh.",
            aliases=("rupp",),
        )
    ]
    assert retrieve_documents(documents, "What is the weather in Phnom Penh?") == []
    assert retrieve_documents(documents, "Tell me a joke") == []


def test_thai_script_detection():
    assert contains_thai("សួស្តី! ខ្ញុំអាចជួយអ្វីបានบ้าง?") is True
    assert contains_thai("សួស្តី! ខ្ញុំអាចជួយអ្វីបានខ្លះ?") is False


@pytest.mark.asyncio
async def test_khmer_answer_retries_when_thai_leaks():
    class FakeClient:
        def __init__(self) -> None:
            self.calls = 0
            self.answers = [
                "សួស្តី! ខ្ញុំអាចជួយអ្វីបានบ้าง?",
                "សួស្តី! ខ្ញុំអាចជួយអ្វីបានខ្លះ?",
            ]

        async def chat(self, model, system_prompt, user_prompt):
            answer = self.answers[min(self.calls, len(self.answers) - 1)]
            self.calls += 1
            return answer

    client = FakeClient()
    prepared = PreparedAnswer(
        client=client,
        model_name="fake-model",
        system_prompt="system",
        sources=[],
        tools_used=[],
        fallback_answer="fallback",
    )
    answer, mode = await AIAdvisorService._local_answer(prepared, "hi", "km")
    assert client.calls == 2
    assert mode == "local_model"
    assert contains_thai(answer) is False
    assert "ខ្លះ" in answer


@pytest.mark.asyncio
async def test_khmer_answer_uses_fallback_when_thai_repeats():
    class FakeClient:
        def __init__(self) -> None:
            self.calls = 0

        async def chat(self, model, system_prompt, user_prompt):
            self.calls += 1
            return "ខ្ញុំអាចជួយបានบ้าง?"

    client = FakeClient()
    prepared = PreparedAnswer(
        client=client,
        model_name="fake-model",
        system_prompt="system",
        sources=[],
        tools_used=[],
        fallback_answer="ខ្ញុំមិនបានរកឃើញព័ត៌មានត្រូវគ្នាទេ។",
    )
    answer, mode = await AIAdvisorService._local_answer(prepared, "hi", "km")
    assert client.calls == 2
    assert mode == "retrieval_only"
    assert answer == prepared.fallback_answer


def test_eval_set_contains_100_questions():
    dataset = Path(__file__).resolve().parents[1] / "data" / "eval" / "advisor_eval.jsonl"
    rows = [
        json.loads(line)
        for line in dataset.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    assert len(rows) == 100
    assert sum(1 for row in rows if row["must_refuse"]) == 7
    assert {row["language"] for row in rows} == {"en", "km"}
    assert sum(1 for row in rows if row["expected_tools"]) >= 20


@pytest.mark.asyncio
async def test_advisor_tools_query_verified_database(db_session):
    search = await search_universities(
        db_session, major="software-engineering", limit=5
    )
    assert search["count"] >= 2
    slugs = {item["slug"] for item in search["results"]}
    assert {"itc", "rupp"}.issubset(slugs)

    comparison = await compare_universities(
        db_session,
        ["itc", "rupp"],
        major_slug="software-engineering",
    )
    assert len(comparison["universities"]) == 2
    assert comparison["cheapest_slug"] == "rupp"

    eligibility = await check_eligibility(
        db_session,
        university_slug="itc",
        major_slug="software-engineering",
        bacii_grade="C",
    )
    assert eligibility["found"] is True
    assert eligibility["minimum_bacii_grade"] == "E"
    assert eligibility["status"] == "eligible"


@pytest.mark.asyncio
async def test_relevant_tools_are_routed(db_session):
    from app.services.ai_knowledge import load_knowledge_documents

    documents = await load_knowledge_documents(db_session)

    search = await run_relevant_tools(
        db_session,
        "Which universities offer software engineering?",
        documents,
        "en",
    )
    assert "search_universities" in search.names
    assert search.answer

    compare = await run_relevant_tools(
        db_session,
        "Compare tuition at ITC and RUPP for software engineering.",
        documents,
        "en",
    )
    assert "compare_universities" in compare.names
    assert compare.answer

    eligibility = await run_relevant_tools(
        db_session,
        "Can I get into ITC software engineering with grade C?",
        documents,
        "en",
    )
    assert "check_eligibility" in eligibility.names
    assert "minimum grade" in eligibility.answer.lower()


@pytest.mark.asyncio
async def test_gemini_client_requires_a_key():
    client = GeminiClient(api_key="")
    with pytest.raises(GeminiUnavailable):
        await client.generate("system", "question")


@pytest.mark.asyncio
async def test_gemini_client_parses_candidate_text():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["x-goog-api-key"] == "test-key"
        assert "gemini-3.1-flash-lite" in str(request.url)
        return httpx.Response(
            200,
            json={
                "candidates": [
                    {"content": {"parts": [{"text": "Verified answer"}]}}
                ]
            },
        )

    client = GeminiClient(
        api_key="test-key",
        transport=httpx.MockTransport(handler),
    )
    answer = await client.generate("system", "question")
    assert answer == "Verified answer"


@pytest.mark.asyncio
async def test_assistant_falls_back_when_gemini_is_not_configured(
    client, monkeypatch
):
    from app.core.config import settings

    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")

    status_response = await client.get("/api/v1/ai/assistant/status")
    assert status_response.status_code == 200, status_response.text
    assert status_response.json()["data"]["configured"] is False

    login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@futera.edu.kh",
            "password": "StudentPass123!",
        },
    )
    assert login.status_code == 200, login.text
    token = login.json()["data"]["access_token"]

    response = await client.post(
        "/api/v1/ai/assistant",
        json={"question": "How much is ITC tuition?", "language": "en"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["mode"] == "retrieval_only"
    assert data["answer"]
    assert "not configured" in (data["warning"] or "").lower()


@pytest.mark.asyncio
async def test_ai_advisor_returns_grounded_sources(client):
    login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@futera.edu.kh",
            "password": "StudentPass123!",
        },
    )
    assert login.status_code == 200, login.text
    token = login.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    status_response = await client.get("/api/v1/ai/status")
    assert status_response.status_code == 200, status_response.text

    response = await client.post(
        "/api/v1/ai/advisor",
        json={"question": "How much does ITC cost per year?", "language": "en"},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    data = response.json()["data"]

    assert data["answer"]
    assert data["mode"] in {"local_model", "retrieval_only"}
    assert data["interaction_id"]
    assert any(
        source["type"] == "university" and source["url"] == "/universities/itc"
        for source in data["sources"]
    )

    feedback = await client.post(
        f"/api/v1/ai/interactions/{data['interaction_id']}/feedback",
        json={"is_helpful": True},
        headers=headers,
    )
    assert feedback.status_code == 200, feedback.text
    assert feedback.json()["data"]["is_helpful"] is True
