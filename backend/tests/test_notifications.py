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


@pytest.mark.asyncio
async def test_in_app_notification_center_flow(client):
    from datetime import date, timedelta

    admin_token = await _login(
        client, "admin@futera.edu.kh", "AdminPass123!"
    )
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    email = f"inapp-test-{uuid.uuid4().hex[:10]}@futera.edu.kh"
    password = "InAppPass123!"
    created = await client.post(
        "/api/v1/admin/users",
        json={
            "email": email,
            "password": password,
            "full_name_en": "In-App Notification Test",
            "roles": ["STUDENT"],
        },
        headers=admin_headers,
    )
    assert created.status_code == 200, created.text
    user_id = created.json()["data"]["id"]

    try:
        token = await _login(client, email, password)
        headers = {"Authorization": f"Bearer {token}"}

        universities = await client.get("/api/v1/universities?limit=1")
        assert universities.status_code == 200, universities.text
        university_id = universities.json()["data"][0]["id"]

        deadline = (date.today() + timedelta(days=2)).isoformat()
        plan = await client.post(
            "/api/v1/plans",
            json={
                "kind": "UNIVERSITY",
                "target_id": university_id,
                "deadline": deadline,
                "reminder_days": 7,
            },
            headers=headers,
        )
        assert plan.status_code == 200, plan.text

        summary = await client.get(
            "/api/v1/notifications/summary", headers=headers
        )
        assert summary.status_code == 200, summary.text
        summary_data = summary.json()["data"]
        assert summary_data["unread_count"] >= 1

        listing = await client.get(
            "/api/v1/notifications?status=all&page_size=50",
            headers=headers,
        )
        assert listing.status_code == 200, listing.text
        listing_data = listing.json()["data"]
        assert listing_data["total"] >= 1
        deadline_item = next(
            (
                item
                for item in listing_data["items"]
                if item["category"] in {"DEADLINE", "SCHOLARSHIP"}
            ),
            None,
        )
        assert deadline_item is not None

        marked = await client.patch(
            f"/api/v1/notifications/{deadline_item['id']}",
            json={"is_read": True},
            headers=headers,
        )
        assert marked.status_code == 200, marked.text
        assert marked.json()["data"]["is_read"] is True

        read_all = await client.post(
            "/api/v1/notifications/read-all", headers=headers
        )
        assert read_all.status_code == 200, read_all.text

        after = await client.get(
            "/api/v1/notifications/summary", headers=headers
        )
        assert after.json()["data"]["unread_count"] == 0
    finally:
        await client.delete(
            f"/api/v1/admin/users/{user_id}", headers=admin_headers
        )
