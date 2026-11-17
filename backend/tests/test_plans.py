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


@pytest.mark.asyncio
async def test_application_plan_document_checklist(client):
    token = await _token(client, "student@futera.edu.kh", "StudentPass123!")
    headers = {"Authorization": f"Bearer {token}"}

    universities = (await client.get("/api/v1/universities")).json()["data"]
    assert universities
    university = universities[1] if len(universities) > 1 else universities[0]

    existing = (await client.get("/api/v1/plans", headers=headers)).json()["data"]
    for plan in existing:
        if plan["target_id"] == university["id"]:
            await client.delete(f"/api/v1/plans/{plan['id']}", headers=headers)

    created = await client.post(
        "/api/v1/plans",
        json={
            "kind": "UNIVERSITY",
            "target_id": university["id"],
            "status": "PREPARING",
            "deadline": "2027-09-01",
            "reminder_days": 14,
        },
        headers=headers,
    )
    assert created.status_code == 200, created.text
    plan = created.json()["data"]
    plan_id = plan["id"]
    assert plan["documents_total"] == 5
    assert plan["required_documents_total"] == 5
    assert plan["documents_completed"] == 0
    assert {row["document_type"] for row in plan["documents"]} == {
        "TRANSCRIPT",
        "BACII_CERTIFICATE",
        "NATIONAL_ID",
        "PHOTOS",
        "APPLICATION_FORM",
    }

    duplicate = await client.post(
        f"/api/v1/plans/{plan_id}/documents",
        json={"document_type": "TRANSCRIPT"},
        headers=headers,
    )
    assert duplicate.status_code == 400

    custom = await client.post(
        f"/api/v1/plans/{plan_id}/documents",
        json={
            "document_type": "OTHER",
            "name_en": "Portfolio",
            "name_km": "Portfolio",
            "is_required": False,
            "due_date": "2027-07-01",
            "notes": "Three projects",
        },
        headers=headers,
    )
    assert custom.status_code == 200, custom.text
    custom_document = custom.json()["data"]
    assert custom_document["name_en"] == "Portfolio"
    assert custom_document["due_date"] == "2027-07-01"
    assert custom_document["is_completed"] is False

    completed = await client.patch(
        f"/api/v1/plans/{plan_id}/documents/{custom_document['id']}",
        json={"is_completed": True},
        headers=headers,
    )
    assert completed.status_code == 200, completed.text
    assert completed.json()["data"]["is_completed"] is True
    assert completed.json()["data"]["completed_at"]

    refreshed = (await client.get("/api/v1/plans", headers=headers)).json()["data"]
    plan_row = next(row for row in refreshed if row["id"] == plan_id)
    assert plan_row["documents_total"] == 6
    assert plan_row["documents_completed"] == 1

    reopened = await client.patch(
        f"/api/v1/plans/{plan_id}/documents/{custom_document['id']}",
        json={"is_completed": False},
        headers=headers,
    )
    assert reopened.status_code == 200, reopened.text
    assert reopened.json()["data"]["completed_at"] is None

    defaults = await client.post(
        f"/api/v1/plans/{plan_id}/documents/defaults", headers=headers
    )
    assert defaults.status_code == 200, defaults.text
    defaults_data = defaults.json()["data"]
    assert defaults_data["documents_total"] == 6

    deleted = await client.delete(
        f"/api/v1/plans/{plan_id}/documents/{custom_document['id']}",
        headers=headers,
    )
    assert deleted.status_code == 200, deleted.text

    deleted_plan = await client.delete(
        f"/api/v1/plans/{plan_id}", headers=headers
    )
    assert deleted_plan.status_code == 200, deleted_plan.text
