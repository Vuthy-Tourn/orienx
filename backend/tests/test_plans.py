import pytest


async def _token(client, email: str, password: str) -> str:
    response = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_student_application_plan_crud(client):
    token = await _token(client, "student@futera.edu.kh", "StudentPass123!")
    headers = {"Authorization": f"Bearer {token}"}

    universities = (await client.get("/api/v1/universities")).json()["data"]
    scholarships = (await client.get("/api/v1/scholarships")).json()["data"]
    assert universities and scholarships

    university = universities[0]
    scholarship = scholarships[0]

    # Cleanup any plan left from an interrupted test run.
    existing = (await client.get("/api/v1/plans", headers=headers)).json()["data"]
    for plan in existing:
        if plan["target_id"] in {university["id"], scholarship["id"]}:
            await client.delete(f"/api/v1/plans/{plan['id']}", headers=headers)

    created = await client.post(
        "/api/v1/plans",
        json={
            "kind": "UNIVERSITY",
            "target_id": university["id"],
            "status": "RESEARCHING",
            "deadline": "2027-08-01",
            "reminder_days": 14,
            "next_action": "Check admission requirements",
        },
        headers=headers,
    )
    assert created.status_code == 200, created.text
    plan = created.json()["data"]
    assert plan["kind"] == "UNIVERSITY"
    assert plan["target_id"] == university["id"]
    assert plan["reminder_days"] == 14
    assert plan["target_title"]

    duplicate = await client.post(
        "/api/v1/plans",
        json={"kind": "UNIVERSITY", "target_id": university["id"]},
        headers=headers,
    )
    assert duplicate.status_code == 400

    updated = await client.patch(
        f"/api/v1/plans/{plan['id']}",
        json={
            "status": "SUBMITTED",
            "next_action": "Wait for interview",
            "notes": "Submitted online.",
        },
        headers=headers,
    )
    assert updated.status_code == 200, updated.text
    updated_plan = updated.json()["data"]
    assert updated_plan["status"] == "SUBMITTED"
    assert updated_plan["notes"] == "Submitted online."

    scholarship_plan = await client.post(
        "/api/v1/plans",
        json={"kind": "SCHOLARSHIP", "target_id": scholarship["id"]},
        headers=headers,
    )
    assert scholarship_plan.status_code == 200, scholarship_plan.text
    scholarship_data = scholarship_plan.json()["data"]
    assert scholarship_data["kind"] == "SCHOLARSHIP"
    if scholarship.get("application_deadline"):
        assert scholarship_data["deadline"] == scholarship["application_deadline"]

    missing = await client.post(
        "/api/v1/plans",
        json={"kind": "UNIVERSITY", "target_id": "00000000-0000-0000-0000-000000000000"},
        headers=headers,
    )
    assert missing.status_code == 404

    for target_id in (plan["id"], scholarship_data["id"]):
        deleted = await client.delete(
            f"/api/v1/plans/{target_id}", headers=headers
        )
        assert deleted.status_code == 200, deleted.text

    remaining = (await client.get("/api/v1/plans", headers=headers)).json()["data"]
    assert all(row["id"] not in {plan["id"], scholarship_data["id"]} for row in remaining)
