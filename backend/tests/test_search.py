import pytest


@pytest.mark.asyncio
async def test_global_search_returns_grouped_results(client):
    majors = await client.get("/api/v1/search", params={"q": "software"})
    assert majors.status_code == 200, majors.text
    data = majors.json()["data"]
    assert data["query"] == "software"
    assert data["total"] >= 1
    assert any(
        "software" in item["slug"] for item in data["majors"]
    )

    university = await client.get("/api/v1/search", params={"q": "RUPP"})
    assert university.status_code == 200, university.text
    university_data = university.json()["data"]
    assert any(item["slug"] == "rupp" for item in university_data["universities"])

    limited = await client.get(
        "/api/v1/search", params={"q": "health", "limit": 2}
    )
    assert limited.status_code == 200, limited.text
    limited_data = limited.json()["data"]
    for group in ("universities", "majors", "careers", "scholarships"):
        assert len(limited_data[group]) <= 2


@pytest.mark.asyncio
async def test_global_search_requires_a_query(client):
    response = await client.get("/api/v1/search", params={"q": ""})
    assert response.status_code == 422
