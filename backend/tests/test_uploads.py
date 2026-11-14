import base64
from pathlib import Path

import pytest

from app.core.config import settings

# 1x1 transparent PNG
TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z0YkAAAAASUVORK5CYII="
)


async def _token(client, email: str, password: str) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_admin_can_upload_and_fetch_image(client):
    token = await _token(client, "admin@futera.edu.kh", "AdminPass123!")
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post(
        "/api/v1/uploads",
        files={"file": ("campus.png", TINY_PNG, "image/png")},
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["url"].startswith("/api/v1/uploads/")
    assert data["size"] == len(TINY_PNG)

    image = await client.get(data["url"])
    assert image.status_code == 200
    assert image.headers["content-type"].startswith("image/png")

    (Path(settings.UPLOAD_DIR) / data["filename"]).unlink(missing_ok=True)


@pytest.mark.asyncio
async def test_upload_validates_file_type_and_role(client):
    admin_token = await _token(client, "admin@futera.edu.kh", "AdminPass123!")
    student_token = await _token(
        client, "student@futera.edu.kh", "StudentPass123!"
    )

    invalid = await client.post(
        "/api/v1/uploads",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert invalid.status_code == 415

    forbidden = await client.post(
        "/api/v1/uploads",
        files={"file": ("campus.png", TINY_PNG, "image/png")},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert forbidden.status_code == 403

    client.cookies.clear()
    anonymous = await client.post(
        "/api/v1/uploads",
        files={"file": ("campus.png", TINY_PNG, "image/png")},
    )
    assert anonymous.status_code == 401


@pytest.mark.asyncio
async def test_admin_rejects_invalid_image_urls(client):
    token = await _token(client, "admin@futera.edu.kh", "AdminPass123!")
    headers = {"Authorization": f"Bearer {token}"}

    majors = await client.get("/api/v1/admin/majors", headers=headers)
    assert majors.status_code == 200
    major = majors.json()["data"][0]
    major_id = major["id"]
    original_image_url = major.get("image_url") or ""

    invalid = await client.patch(
        f"/api/v1/admin/majors/{major_id}",
        json={"image_url": "javascript:alert(1)"},
        headers=headers,
    )
    assert invalid.status_code == 422

    valid = await client.patch(
        f"/api/v1/admin/majors/{major_id}",
        json={"image_url": "/images/majors/software-engineering.webp"},
        headers=headers,
    )
    assert valid.status_code == 200
    assert valid.json()["data"]["image_url"] == "/images/majors/software-engineering.webp"

    restored = await client.patch(
        f"/api/v1/admin/majors/{major_id}",
        json={"image_url": original_image_url},
        headers=headers,
    )
    assert restored.status_code == 200
