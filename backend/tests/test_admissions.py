import pytest


async def _token(client, email: str, password: str) -> str:
    response = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_associate_programs_can_accept_grade_f(client):
    student_token = await _token(
        client, "student@futera.edu.kh", "StudentPass123!"
    )
    headers = {"Authorization": f"Bearer {student_token}"}

    failed = await client.get(
        "/api/v1/admissions/eligibility?grade=F", headers=headers
    )
    assert failed.status_code == 200, failed.text
    failed_data = failed.json()["data"]
    associate_f = [
        row
        for row in failed_data["eligible"]
        if row["degree_level"] == "ASSOCIATE" and row["min_bacii_grade"] == "F"
    ]
    if not associate_f:
        pytest.skip("No associate program with a published grade F minimum")

    assert all("grade F" in row["reason"] for row in associate_f)
    assert any(
        row["degree_level"] == "BACHELOR"
        and row["min_bacii_grade"] == "E"
        for row in failed_data["below_requirements"]
    )

    passed = await client.get(
        "/api/v1/admissions/eligibility?grade=E", headers=headers
    )
    assert passed.status_code == 200, passed.text
    passed_ids = {row["id"] for row in passed.json()["data"]["eligible"]}
    assert all(row["id"] in passed_ids for row in associate_f)


@pytest.mark.asyncio
async def test_admin_rejects_grade_f_for_bachelor(client):
    admin_token = await _token(
        client, "admin@futera.edu.kh", "AdminPass123!"
    )
    headers = {"Authorization": f"Bearer {admin_token}"}
    offerings = (
        await client.get("/api/v1/admin/offerings", headers=headers)
    ).json()["data"]
    bachelor = next(
        (row for row in offerings if row["degree_level"] == "BACHELOR"), None
    )
    if not bachelor:
        pytest.skip("No bachelor offering available")

    response = await client.patch(
        f"/api/v1/admin/offerings/{bachelor['id']}",
        json={"min_bacii_grade": "F"},
        headers=headers,
    )
    assert response.status_code == 400, response.text


@pytest.mark.asyncio
async def test_bacii_eligibility_checker(client):
    admin_token = await _token(
        client, "admin@futera.edu.kh", "AdminPass123!"
    )
    student_token = await _token(
        client, "student@futera.edu.kh", "StudentPass123!"
    )
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    profile_response = await client.get(
        "/api/v1/students/profile", headers=student_headers
    )
    assert profile_response.status_code == 200, profile_response.text
    original_grade = profile_response.json()["data"].get("bacii_grade")

    offerings = (
        await client.get("/api/v1/admin/offerings", headers=admin_headers)
    ).json()["data"]
    offering = offerings[0]
    offering_id = offering["id"]
    original = {
        "min_bacii_grade": offering.get("min_bacii_grade"),
        "required_subjects": offering.get("required_subjects"),
        "is_admission_verified": offering.get("is_admission_verified", False),
        "admission_source_url": offering.get("admission_source_url"),
    }

    try:
        updated = await client.patch(
            f"/api/v1/admin/offerings/{offering_id}",
            json={
                "min_bacii_grade": "C",
                "required_subjects": ["Mathematics", "English"],
                "is_admission_verified": True,
                "admission_source_url": "https://example.edu.kh/admissions",
            },
            headers=admin_headers,
        )
        assert updated.status_code == 200, updated.text
        updated_offering = updated.json()["data"]
        assert updated_offering["min_bacii_grade"] == "C"
        assert updated_offering["required_subjects"] == ["Mathematics", "English"]
        assert updated_offering["is_admission_verified"] is True

        eligible = await client.get(
            "/api/v1/admissions/eligibility?grade=B", headers=student_headers
        )
        assert eligible.status_code == 200, eligible.text
        eligible_data = eligible.json()["data"]
        assert eligible_data["grade"] == "B"
        assert any(
            row["id"] == offering_id for row in eligible_data["eligible"]
        )

        below = await client.get(
            "/api/v1/admissions/eligibility?grade=D", headers=student_headers
        )
        assert below.status_code == 200
        below_data = below.json()["data"]
        assert any(
            row["id"] == offering_id for row in below_data["below_requirements"]
        )

        unverified = await client.patch(
            f"/api/v1/admin/offerings/{offering_id}",
            json={"is_admission_verified": False},
            headers=admin_headers,
        )
        assert unverified.status_code == 200
        unverified_result = await client.get(
            "/api/v1/admissions/eligibility?grade=A", headers=student_headers
        )
        assert unverified_result.status_code == 200
        assert any(
            row["id"] == offering_id
            for row in unverified_result.json()["data"]["unverified_requirements"]
        )

        cleared_grade = await client.put(
            "/api/v1/students/profile",
            json={"bacii_grade": None},
            headers=student_headers,
        )
        assert cleared_grade.status_code == 200, cleared_grade.text

        missing_grade = await client.get(
            "/api/v1/admissions/eligibility", headers=student_headers
        )
        assert missing_grade.status_code == 400
    finally:
        if original_grade:
            restored_grade = await client.put(
                "/api/v1/students/profile",
                json={"bacii_grade": original_grade},
                headers=student_headers,
            )
            assert restored_grade.status_code == 200, restored_grade.text
        restored = await client.patch(
            f"/api/v1/admin/offerings/{offering_id}",
            json=original,
            headers=admin_headers,
        )
        assert restored.status_code == 200, restored.text
