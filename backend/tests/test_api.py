import pytest
import uuid


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["platform"] == "OrienX"


@pytest.mark.asyncio
async def test_auth_and_assessments_flow(client):
    # 1. Login with seeded student
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "student@futera.edu.kh", "password": "StudentPass123!"}
    )
    assert login_res.status_code == 200
    login_data = login_res.json()["data"]
    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get current profile
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["data"]["email"] == "student@futera.edu.kh"

    # 3. List universities and test major filter
    uni_res = await client.get("/api/v1/universities")
    assert uni_res.status_code == 200
    unis = uni_res.json()["data"]
    assert len(unis) >= 3

    # Test filtering universities by major slug
    uni_filtered_res = await client.get("/api/v1/universities?major=software-engineering")
    assert uni_filtered_res.status_code == 200
    filtered_unis = uni_filtered_res.json()["data"]
    assert len(filtered_unis) >= 1
    assert all("rupp" in u["slug"] or "itc" in u["slug"] or "aupp" in u["slug"] or "paragoniu" in u["slug"] for u in filtered_unis)

    # Check RUPP detail
    rupp_res = await client.get("/api/v1/universities/rupp")
    assert rupp_res.status_code == 200
    rupp_data = rupp_res.json()["data"]
    assert rupp_data["slug"] == "rupp"
    assert rupp_data["is_tuition_verified"] is True

    # 4. Compare universities
    comp_res = await client.get("/api/v1/universities/compare?ids=rupp,itc")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()["data"]["universities"]
    assert len(comp_data) == 2

    # 5. Fetch Personality Questions & Submit
    pq_res = await client.get("/api/v1/assessments/personality/questions")
    assert pq_res.status_code == 200
    p_questions = pq_res.json()["data"]
    assert len(p_questions) == 12

    # Submit answers for personality (choosing option 1 for each)
    p_answers = [
        {"question_id": q["id"], "selected_option_id": q["options"][0]["id"]}
        for q in p_questions
    ]
    p_sub_res = await client.post(
        "/api/v1/assessments/personality/submit",
        json={"answers": p_answers},
        headers=headers
    )
    assert p_sub_res.status_code == 200
    p_result = p_sub_res.json()["data"]
    assert len(p_result["personality_type"]) == 4
    assert "role" in p_result["traits_summary_en"]
    assert "role_color" in p_result["traits_summary_en"]
    assert "role" in p_result["traits_summary_km"]

    # Verify recommendations are auto-generated immediately after MBTI submission
    auto_rec_res = await client.get("/api/v1/recommendations/majors", headers=headers)
    assert auto_rec_res.status_code == 200
    auto_recs = auto_rec_res.json()["data"]
    assert len(auto_recs) > 0
    assert "offering_universities" in auto_recs[0]["major"]
    assert len(auto_recs[0]["major"]["offering_universities"]) >= 1

    # 6. Fetch RIASEC Questions & Submit
    rq_res = await client.get("/api/v1/assessments/riasec/questions")
    assert rq_res.status_code == 200
    r_questions = rq_res.json()["data"]
    assert len(r_questions) == 18

    # Give high ratings for Investigative and Realistic items
    r_answers = []
    for q in r_questions:
        rating = 5 if q["category"] in ["I", "R"] else 3
        r_answers.append({"question_id": q["id"], "rating": rating})

    r_sub_res = await client.post(
        "/api/v1/assessments/riasec/submit",
        json={"answers": r_answers},
        headers=headers
    )
    assert r_sub_res.status_code == 200
    r_result = r_sub_res.json()["data"]
    assert len(r_result["holland_code"]) == 3
    assert "I" in r_result["holland_code"] or "R" in r_result["holland_code"]

    # 7. Save Academic Preferences
    pref_res = await client.put(
        "/api/v1/assessments/preferences",
        json={
            "favorite_subjects": ["Mathematics", "Informatics", "Physics"],
            "strongest_subjects": ["Mathematics", "Informatics"],
            "enjoyed_activities": ["Coding", "Robotics"],
            "preferred_work_environments": ["Tech Office", "Remote"],
            "career_interest_areas": ["Software", "Artificial Intelligence"],
            "preferred_locations": ["Phnom Penh"],
            "annual_tuition_budget_usd": 1000.0,
            "requires_scholarship": False
        },
        headers=headers
    )
    assert pref_res.status_code == 200

    # 8. Generate Major Recommendations
    rec_res = await client.post(
        "/api/v1/recommendations/generate",
        json={"recompute": True},
        headers=headers
    )
    assert rec_res.status_code == 200
    recs = rec_res.json()["data"]
    assert len(recs) > 0
    top_major = recs[0]
    # Software Engineering or Data Science should be top ranked for Math+Investigative+Coding
    assert top_major["rank_position"] == 1
    assert "software" in top_major["major"]["slug"] or "data" in top_major["major"]["slug"]
    assert top_major["match_score"] >= 75.0
    assert "riasec_reason_en" in top_major["explanation"]
    assert "riasec_reason_km" in top_major["explanation"]
    assert "offering_universities" in top_major["major"]
    assert len(top_major["major"]["offering_universities"]) >= 1

    # 9. Toggle Favorite for the top recommended major
    fav_res = await client.post(
        "/api/v1/favorites/toggle",
        json={"entity_type": "major", "entity_id": top_major["major_id"]},
        headers=headers
    )
    assert fav_res.status_code == 200
    assert "is_favorited" in fav_res.json()["data"]
    is_fav = fav_res.json()["data"]["is_favorited"]
    if not is_fav:
        # Toggle again to ensure it is favorited for dashboard count check
        fav_res2 = await client.post(
            "/api/v1/favorites/toggle",
            json={"entity_type": "major", "entity_id": top_major["major_id"]},
            headers=headers
        )
        assert fav_res2.json()["data"]["is_favorited"] is True

    # 10. Dashboard summary check
    dash_res = await client.get("/api/v1/students/dashboard-summary", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()["data"]
    assert dash_data["assessments_status"]["personality_completed"] is True
    assert dash_data["assessments_status"]["riasec_completed"] is True
    assert dash_data["assessments_status"]["preferences_completed"] is True
    assert dash_data["favorites_count"]["majors"] >= 1


@pytest.mark.asyncio
async def test_new_user_has_no_recommendations(client):
    """A fresh account must not receive fabricated major matches."""
    email = f"new-{uuid.uuid4().hex[:10]}@futera.edu.kh"
    register_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "NewStudentPass123!",
            "full_name_en": "Fresh Student",
            "province": "Phnom Penh",
            "current_education_level": "GRADE_12",
            "graduation_year": 2026,
            "preferred_language": "en",
        },
    )
    assert register_res.status_code == 200
    token = register_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    rec_res = await client.get("/api/v1/recommendations/majors", headers=headers)
    assert rec_res.status_code == 200
    assert rec_res.json()["data"] == []

    summary_res = await client.get("/api/v1/students/dashboard-summary", headers=headers)
    status = summary_res.json()["data"]["assessments_status"]
    assert status["personality_completed"] is False
    assert status["riasec_completed"] is False
    assert status["preferences_completed"] is False
