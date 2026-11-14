import uuid
from urllib.parse import parse_qs, urlparse

import pytest
from sqlalchemy import delete

from app.models.auth import User


@pytest.mark.asyncio
async def test_password_reset_flow(client, db_session):
    email = f"reset-{uuid.uuid4().hex[:10]}@futera.edu.kh"
    old_password = "OldPass123!"
    new_password = "NewPass456!"

    try:
        registered = await client.post(
            "/api/v1/auth/register?cookie_only=true",
            json={
                "email": email,
                "password": old_password,
                "full_name_en": "Reset Flow Student",
                "province": "Phnom Penh",
                "current_education_level": "GRADE_12",
            },
        )
        assert registered.status_code == 200

        unknown = await client.post(
            "/api/v1/auth/forgot-password",
            json={"email": f"unknown-{uuid.uuid4().hex[:8]}@futera.edu.kh"},
        )
        assert unknown.status_code == 200
        assert unknown.json()["data"]["sent"] is True
        assert not unknown.json()["data"].get("reset_url")

        forgot = await client.post(
            "/api/v1/auth/forgot-password",
            json={"email": email},
        )
        assert forgot.status_code == 200
        reset_url = forgot.json()["data"].get("reset_url")
        assert reset_url

        token = parse_qs(urlparse(reset_url).query)["token"][0]

        missing = await client.post(
            "/api/v1/auth/reset-password",
            json={"token": "not-a-real-token", "new_password": new_password},
        )
        assert missing.status_code == 400

        reset = await client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": new_password},
        )
        assert reset.status_code == 200
        assert reset.json()["data"] is True

        old_login = await client.post(
            "/api/v1/auth/login?cookie_only=true",
            json={"email": email, "password": old_password},
        )
        assert old_login.status_code == 401

        new_login = await client.post(
            "/api/v1/auth/login?cookie_only=true",
            json={"email": email, "password": new_password},
        )
        assert new_login.status_code == 200
    finally:
        await db_session.execute(delete(User).where(User.email == email))
        await db_session.commit()
