import uuid

import pytest

from app.core.config import settings


async def _login(client, email: str, password: str) -> str:
    response = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_telegram_settings_and_link_flow(client, monkeypatch):
    monkeypatch.setattr(settings, "TELEGRAM_BOT_TOKEN", "test-token")
    monkeypatch.setattr(settings, "TELEGRAM_BOT_USERNAME", "OrienXTestBot")

    admin_token = await _login(
        client, "admin@futera.edu.kh", "AdminPass123!"
    )
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    email = f"notif-test-{uuid.uuid4().hex[:10]}@futera.edu.kh"
    password = "NotifPass123!"
    created = await client.post(
        "/api/v1/admin/users",
        json={
            "email": email,
            "password": password,
            "full_name_en": "Notification Test User",
            "roles": ["STUDENT"],
        },
        headers=admin_headers,
    )
    assert created.status_code == 200, created.text
    user_id = created.json()["data"]["id"]

    try:
        token = await _login(client, email, password)
        headers = {"Authorization": f"Bearer {token}"}

        settings_res = await client.get(
            "/api/v1/notifications/settings", headers=headers
        )
        assert settings_res.status_code == 200, settings_res.text
        data = settings_res.json()["data"]
        assert data["bot_username"] == "OrienXTestBot"
        assert data["telegram_connected"] is False

        link_res = await client.post(
            "/api/v1/notifications/telegram/link", headers=headers
        )
        assert link_res.status_code == 200, link_res.text
        link = link_res.json()["data"]
        assert link["deep_link"].startswith(
            "https://t.me/OrienXTestBot?start="
        )
        assert link["bot_username"] == "OrienXTestBot"

        pause = await client.patch(
            "/api/v1/notifications/settings",
            json={"reminders_enabled": False},
            headers=headers,
        )
        assert pause.status_code == 200
        assert pause.json()["data"]["reminders_enabled"] is False

        disconnect = await client.delete(
            "/api/v1/notifications/telegram", headers=headers
        )
        assert disconnect.status_code == 200
        assert disconnect.json()["data"]["telegram_connected"] is False
    finally:
        await client.delete(
            f"/api/v1/admin/users/{user_id}", headers=admin_headers
        )
