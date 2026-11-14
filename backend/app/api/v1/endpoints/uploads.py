import uuid
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.dependencies import get_current_admin
from app.models.auth import User
from app.schemas.common import ApiResponse

router = APIRouter()

# Only raster images are accepted. SVG is excluded on purpose because it can
# carry scripts when served as image/svg+xml.
_IMAGE_SIGNATURES: tuple[tuple[bytes, str, str], ...] = (
    (b"\xff\xd8\xff", "image/jpeg", ".jpg"),
    (b"\x89PNG\r\n\x1a\n", "image/png", ".png"),
    (b"GIF87a", "image/gif", ".gif"),
    (b"GIF89a", "image/gif", ".gif"),
)


def _upload_dir() -> Path:
    path = Path(settings.UPLOAD_DIR)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[4] / path
    path.mkdir(parents=True, exist_ok=True)
    return path


def _detect_image(contents: bytes) -> tuple[str, str] | None:
    for signature, media_type, extension in _IMAGE_SIGNATURES:
        if contents.startswith(signature):
            return media_type, extension
    if (
        len(contents) >= 12
        and contents[:4] == b"RIFF"
        and contents[8:12] == b"WEBP"
    ):
        return "image/webp", ".webp"
    return None


@router.post("", response_model=ApiResponse[Dict[str, Any]], status_code=status.HTTP_201_CREATED)
async def upload_content_image(
    file: UploadFile = File(...),
    admin_user: User = Depends(get_current_admin),
):
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    contents = await file.read(max_bytes + 1)

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The selected file is empty.",
        )
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Images must be {settings.MAX_UPLOAD_MB} MB or smaller.",
        )

    detected = _detect_image(contents)
    if not detected:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a PNG, JPG, WebP, or GIF image.",
        )

    _media_type, extension = detected
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = _upload_dir() / filename
    destination.write_bytes(contents)

    return ApiResponse(
        success=True,
        message="Image uploaded.",
        data={
            "url": f"{settings.API_V1_STR}/uploads/{filename}",
            "filename": filename,
            "size": len(contents),
        },
    )


@router.get("/{filename}")
async def serve_content_image(filename: str):
    safe_name = Path(filename).name
    if safe_name != filename or not safe_name:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    path = _upload_dir() / safe_name
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    return FileResponse(
        path,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
        },
    )
