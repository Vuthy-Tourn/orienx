import uuid

import pytest
from sqlalchemy import delete

from app.core.database import AsyncSessionLocal
from app.models.report import SharedReport


async def _login(client, email: str, password: str) -> str:
    response = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_shareable_parent_counselor_report(client):
    token = await _login(
        client, "student@futera.edu.kh", "StudentPass123!"
    )
    headers = {"Authorization": f"Bearer {token}"}
    share_id = None

    try:
        created = await client.post(
            "/api/v1/reports/shares",
            json={
                "audience": "PARENT",
                "language": "en",
                "expires_in_days": 30,
                "sections": [
                    "profile",
                    "assessments",
                    "recommendations",
                    "plans",
                    "eligibility",
                ],
                "note": "Please review my progress.",
            },
            headers=headers,
        )
        assert created.status_code == 200, created.text
        share = created.json()["data"]
        share_id = share["id"]
        assert share["token"]
        assert share["url"].startswith("/share/")
        assert share["audience"] == "PARENT"

        listed = await client.get("/api/v1/reports/shares", headers=headers)
        assert listed.status_code == 200, listed.text
        assert any(item["id"] == share_id for item in listed.json()["data"])

        public = await client.get(f"/api/v1/reports/shared/{share['token']}")
        assert public.status_code == 200, public.text
        report = public.json()["data"]
        assert report["student"]["name"]
        assert report["note"] == "Please review my progress."
        assert "assessments" in report
        assert "recommendations" in report
        assert "plans" in report
        assert "eligibility" in report

        refreshed = await client.get("/api/v1/reports/shares", headers=headers)
        matching = next(
            item for item in refreshed.json()["data"] if item["id"] == share_id
        )
        assert matching["view_count"] == 1
        assert matching["last_viewed_at"]

        revoked = await client.delete(
            f"/api/v1/reports/shares/{share_id}", headers=headers
        )
        assert revoked.status_code == 200, revoked.text
        assert revoked.json()["data"]["revoked_at"]

        gone = await client.get(f"/api/v1/reports/shared/{share['token']}")
        assert gone.status_code == 404
    finally:
        if share_id:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    delete(SharedReport).where(
                        SharedReport.id == uuid.UUID(share_id)
                    )
                )
                await db.commit()
