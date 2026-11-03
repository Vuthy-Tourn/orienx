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

