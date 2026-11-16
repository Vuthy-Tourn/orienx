import pytest


@pytest.mark.asyncio
async def test_admin_rbac_and_rules(client):
    # 1. Login with regular student
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@futera.edu.kh", "password": "StudentPass123!"}
    )
    student_token = student_login.json()["data"]["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # Student trying to access admin analytics should be blocked with 403 Forbidden
    forbidden_res = await client.get("/api/v1/admin/analytics", headers=student_headers)
    assert forbidden_res.status_code == 403

    # 2. Login with Admin
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@futera.edu.kh", "password": "AdminPass123!"}
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["data"]["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin access should succeed
    analytics_res = await client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()["data"]
    assert analytics_data["total_universities"] >= 3
    assert analytics_data["total_majors"] >= 6

    # 3. View recommendation rules
    rules_res = await client.get("/api/v1/admin/rules", headers=admin_headers)
    assert rules_res.status_code == 200
    rules = rules_res.json()["data"]
    assert len(rules) >= 1
    rule_id = rules[0]["id"]

    # 4. Tune recommendation rule weights
    update_res = await client.put(
        f"/api/v1/admin/rules/{rule_id}",
        json={"weight_riasec": 0.40, "weight_personality": 0.15},
        headers=admin_headers
    )
    assert update_res.status_code == 200
    updated_rule = update_res.json()["data"]
    assert updated_rule["weight_riasec"] == 0.40
    assert updated_rule["weight_personality"] == 0.15



@pytest.mark.asyncio
async def test_admin_can_link_major_to_university(client):
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@futera.edu.kh", "password": "StudentPass123!"},
    )
    student_headers = {
        "Authorization": f"Bearer {student_login.json()['data']['access_token']}"
    }

    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@futera.edu.kh", "password": "AdminPass123!"},
    )
    admin_headers = {
        "Authorization": f"Bearer {admin_login.json()['data']['access_token']}"
    }

    universities = (
        await client.get("/api/v1/admin/universities", headers=admin_headers)
    ).json()["data"]
    majors = (await client.get("/api/v1/admin/majors", headers=admin_headers)).json()["data"]
    offerings = (
        await client.get("/api/v1/admin/offerings", headers=admin_headers)
    ).json()["data"]

    used = {
        (item["university_id"], item["major_id"], item["degree_level"], item["language_of_instruction"])
        for item in offerings
    }
    selected = None
    for university in universities:
        for major in majors:
            key = (university["id"], major["id"], "DOCTORATE", "FRENCH")
            if key not in used:
                selected = (university, major)
                break
        if selected:
            break
    assert selected, "No available university/major pair for the offering test"
    university, major = selected

    forbidden = await client.post(
        "/api/v1/admin/offerings",
        json={
            "university_id": university["id"],
            "major_id": major["id"],
            "degree_level": "DOCTORATE",
            "language_of_instruction": "FRENCH",
        },
        headers=student_headers,
    )
    assert forbidden.status_code == 403

    created = await client.post(
        "/api/v1/admin/offerings",
        json={
            "university_id": university["id"],
            "major_id": major["id"],
            "degree_level": "DOCTORATE",
            "duration_years": 3,
            "tuition_annual_usd": 1200,
            "is_tuition_verified": False,
            "language_of_instruction": "FRENCH",
            "official_curriculum_url": "https://example.edu.kh/program",
        },
        headers=admin_headers,
    )
    assert created.status_code == 200, created.text
    offering = created.json()["data"]
    assert offering["university_id"] == university["id"]
    assert offering["major_id"] == major["id"]
    assert offering["degree_level"] == "DOCTORATE"

    updated = await client.patch(
        f"/api/v1/admin/offerings/{offering['id']}",
        json={"tuition_annual_usd": 1400, "duration_years": 3.5},
        headers=admin_headers,
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["data"]["tuition_annual_usd"] == 1400

    deleted = await client.delete(
        f"/api/v1/admin/offerings/{offering['id']}", headers=admin_headers
    )
    assert deleted.status_code == 200
    assert deleted.json()["data"]["id"] == offering["id"]


@pytest.mark.asyncio
async def test_admin_can_manage_assessment_questions(client):
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@futera.edu.kh", "password": "AdminPass123!"},
    )
    admin_headers = {
        "Authorization": f"Bearer {admin_login.json()['data']['access_token']}"
    }
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@futera.edu.kh", "password": "StudentPass123!"},
    )
    student_headers = {
        "Authorization": f"Bearer {student_login.json()['data']['access_token']}"
    }

    personality_payload = {
        "dimension": "EI",
        "prompt_en": "Test question: I enjoy meeting new people at university events.",
        "prompt_km": "សំណួរសាកល្បង៖ ខ្ញុំចូលចិត្តជួបមនុស្សថ្មីនៅព្រឹត្តិការណ៍សាកលវិទ្យាល័យ។",
        "is_active": True,
        "options": [
            {
                "label_en": "Agree",
                "label_km": "យល់ស្រប",
                "target_trait": "E",
                "weight": 1,
                "order_index": 1,
            },
            {
                "label_en": "Disagree",
                "label_km": "មិនយល់ស្រប",
                "target_trait": "I",
                "weight": 1,
                "order_index": 2,
            },
        ],
    }
    forbidden = await client.post(
        "/api/v1/admin/questions/personality",
        json=personality_payload,
        headers=student_headers,
    )
    assert forbidden.status_code == 403

    created = await client.post(
        "/api/v1/admin/questions/personality",
        json=personality_payload,
        headers=admin_headers,
    )
    assert created.status_code == 200, created.text
    question = created.json()["data"]
    assert question["dimension"] == "EI"
    assert len(question["options"]) == 2

    updated = await client.patch(
        f"/api/v1/admin/questions/personality/{question['id']}",
        json={
            "prompt_en": "Updated test prompt",
            "is_active": False,
            "options": [
                {
                    "id": question["options"][0]["id"],
                    "label_en": "Strongly agree",
                    "label_km": "យល់ស្របខ្លាំង",
                    "target_trait": "E",
                    "weight": 1.5,
                    "order_index": 1,
                },
                {
                    "id": question["options"][1]["id"],
                    "label_en": "Disagree",
                    "label_km": "មិនយល់ស្រប",
                    "target_trait": "I",
                    "weight": 1,
                    "order_index": 2,
                },
            ],
        },
        headers=admin_headers,
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["data"]["is_active"] is False

    deleted = await client.delete(
        f"/api/v1/admin/questions/personality/{question['id']}",
        headers=admin_headers,
    )
    assert deleted.status_code == 200

    riasec_payload = {
        "category": "I",
        "prompt_en": "Test RIASEC: analysing data and solving research problems",
        "prompt_km": "សាកល្បង RIASEC៖ ការវិភាគទិន្នន័យ និងដោះស្រាយបញ្ហាស្រាវជ្រាវ",
        "is_active": True,
    }
    created_riasec = await client.post(
        "/api/v1/admin/questions/riasec",
        json=riasec_payload,
        headers=admin_headers,
    )
    assert created_riasec.status_code == 200, created_riasec.text
    riasec = created_riasec.json()["data"]
    assert riasec["category"] == "I"

    updated_riasec = await client.patch(
        f"/api/v1/admin/questions/riasec/{riasec['id']}",
        json={"category": "A", "is_active": False},
        headers=admin_headers,
    )
    assert updated_riasec.status_code == 200
    assert updated_riasec.json()["data"]["category"] == "A"

    deleted_riasec = await client.delete(
        f"/api/v1/admin/questions/riasec/{riasec['id']}",
        headers=admin_headers,
    )
    assert deleted_riasec.status_code == 200


@pytest.mark.asyncio
async def test_admin_can_create_update_and_delete_user(client):
    import uuid

    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@futera.edu.kh", "password": "AdminPass123!"},
    )
    assert admin_login.status_code == 200
    admin_data = admin_login.json()["data"]
    admin_headers = {"Authorization": f"Bearer {admin_data['access_token']}"}

    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@futera.edu.kh", "password": "StudentPass123!"},
    )
    student_headers = {
        "Authorization": f"Bearer {student_login.json()['data']['access_token']}"
    }

    email = f"crud-user-{uuid.uuid4().hex[:10]}@futera.edu.kh"
    payload = {
        "email": email,
        "password": "CrudPass123!",
        "full_name_en": "CRUD Test User",
        "full_name_km": "អ្នកសាកល្បង CRUD",
        "province": "Phnom Penh",
        "avatar_url": "https://example.com/avatar-one.png",
        "status": "ACTIVE",
        "roles": ["STUDENT"],
        "is_email_verified": True,
    }

    forbidden = await client.post(
        "/api/v1/admin/users", json=payload, headers=student_headers
    )
    assert forbidden.status_code == 403

    created = await client.post(
        "/api/v1/admin/users", json=payload, headers=admin_headers
    )
    assert created.status_code == 200, created.text
    user = created.json()["data"]
    user_id = user["id"]
    assert user["email"] == email
    assert user["roles"] == ["STUDENT"]
    assert user["full_name_en"] == "CRUD Test User"
    assert user["avatar_url"] == "https://example.com/avatar-one.png"

    # The new account can authenticate with the password set by the admin.
    new_login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "CrudPass123!"},
    )
    assert new_login.status_code == 200

    updated_email = f"crud-updated-{uuid.uuid4().hex[:8]}@futera.edu.kh"
    updated = await client.patch(
        f"/api/v1/admin/users/{user_id}",
        json={
            "email": updated_email,
            "full_name_en": "Updated CRUD User",
            "province": "Siem Reap",
            "avatar_url": "https://example.com/avatar-two.png",
            "password": "NewCrudPass123!",
        },
        headers=admin_headers,
    )
    assert updated.status_code == 200, updated.text
    updated_user = updated.json()["data"]
    assert updated_user["email"] == updated_email
    assert updated_user["full_name_en"] == "Updated CRUD User"
    assert updated_user["province"] == "Siem Reap"
    assert updated_user["avatar_url"] == "https://example.com/avatar-two.png"

    cleared_avatar = await client.patch(
        f"/api/v1/admin/users/{user_id}",
        json={"avatar_url": None},
        headers=admin_headers,
    )
    assert cleared_avatar.status_code == 200, cleared_avatar.text
    assert cleared_avatar.json()["data"]["avatar_url"] is None

    new_login = await client.post(
        "/api/v1/auth/login",
        json={"email": updated_email, "password": "NewCrudPass123!"},
    )
    assert new_login.status_code == 200

    self_delete = await client.delete(
        f"/api/v1/admin/users/{admin_data['user_id']}", headers=admin_headers
    )
    assert self_delete.status_code == 400

    deleted = await client.delete(
        f"/api/v1/admin/users/{user_id}", headers=admin_headers
    )
    assert deleted.status_code == 200, deleted.text
    assert deleted.json()["data"]["id"] == user_id

    listed = await client.get("/api/v1/admin/users?limit=500", headers=admin_headers)
    assert listed.status_code == 200
    assert all(row["id"] != user_id for row in listed.json()["data"])
