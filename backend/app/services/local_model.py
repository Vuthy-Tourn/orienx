"""Async client for a local Ollama server.

Ollama is free and runs on the developer's own machine. The advisor treats it
as optional: when it is not installed or not running, the API falls back to
answers assembled from verified database records.
"""

from __future__ import annotations

import json
from typing import AsyncGenerator, List, Optional, Tuple

import httpx

from app.core.config import settings

# Small chat models that run on a normal laptop. Ordered by multilingual
# quality (Khmer support) first, then by size.
MODEL_PREFERENCES = (
    "gemma3",
    "gemma2",
    "qwen2.5",
    "qwen3",
    "qwen",
    "llama3.2",
    "llama3.1",
    "llama",
    "mistral",
    "phi",
)

EMBEDDING_MODEL_HINTS = ("embed", "bge", "mxbai", "nomic")


def _is_chat_model(name: str) -> bool:
    lowered = name.lower()
    return not any(hint in lowered for hint in EMBEDDING_MODEL_HINTS)


class LocalModelClient:
    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
    ) -> None:
        self.base_url = (base_url or settings.AI_OLLAMA_BASE_URL).rstrip("/")
        self.model = model if model is not None else settings.AI_OLLAMA_MODEL
        self.timeout = timeout or settings.AI_OLLAMA_TIMEOUT_SECONDS

    async def _installed_models(self) -> List[str]:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError):
            return []

        models: List[str] = []
        for entry in payload.get("models", []):
            name = entry.get("name") or entry.get("model")
            if isinstance(name, str) and _is_chat_model(name):
                models.append(name)
        return models

    async def detect_model(self) -> Tuple[bool, Optional[str]]:
        """Return (connected, model name) without blocking for long."""
        models = await self._installed_models()
        if not models:
            return False, None

        if self.model:
            wanted = self.model.lower()
            for name in models:
                lowered = name.lower()
                if lowered == wanted or lowered.startswith(f"{wanted}:"):
                    return True, name
            return False, None

        for preference in MODEL_PREFERENCES:
            for name in models:
                if name.lower().startswith(preference):
                    return True, name
        return True, models[0]

    async def chat(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> Optional[str]:
        payload = {
            "model": model,
            "stream": False,
            "keep_alive": settings.AI_OLLAMA_KEEP_ALIVE,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "options": {
                "temperature": 0.2,
                "top_p": 0.9,
                "num_predict": settings.AI_MAX_OUTPUT_TOKENS,
                "num_ctx": 4096,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat", json=payload
                )
                response.raise_for_status()
                data = response.json()
        except (httpx.HTTPError, ValueError):
            return None

        content = (data.get("message") or {}).get("content")
        if isinstance(content, str):
            content = content.strip()
            return content or None
        return None

    async def chat_stream(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> AsyncGenerator[str, None]:
        payload = {
            "model": model,
            "stream": True,
            "keep_alive": settings.AI_OLLAMA_KEEP_ALIVE,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "options": {
                "temperature": 0.2,
                "top_p": 0.9,
                "num_predict": settings.AI_MAX_OUTPUT_TOKENS,
                "num_ctx": 4096,
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST", f"{self.base_url}/api/chat", json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                    except ValueError:
                        continue
                    message = data.get("message") or {}
                    content = message.get("content")
                    if isinstance(content, str) and content:
                        yield content
                    if data.get("done"):
                        break
