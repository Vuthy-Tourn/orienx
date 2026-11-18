"""Small server-side Gemini client for the floating assistant.

The API key lives in backend environment variables and is sent only to Google
from the server. It is never returned to the browser.
"""

from __future__ import annotations

from typing import Optional

import httpx

from app.core.config import settings

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

# If the preferred model is overloaded or retired, try these before falling
# back to the deterministic verified-data answer.
GEMINI_FALLBACK_MODELS = ("gemini-flash-latest", "gemini-3.5-flash")


class GeminiUnavailable(RuntimeError):
    pass


class GeminiClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
        transport: Optional[httpx.AsyncBaseTransport] = None,
    ) -> None:
        self.api_key = (api_key if api_key is not None else settings.GEMINI_API_KEY).strip()
        self.model = model or settings.GEMINI_MODEL
        self.timeout = timeout or settings.GEMINI_TIMEOUT_SECONDS
        self.transport = transport
        self.last_model = self.model

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    async def generate(self, system_prompt: str, question: str) -> str:
        if not self.configured:
            raise GeminiUnavailable(
                "Gemini is not configured. Add GEMINI_API_KEY to backend/.env."
            )

        models = [self.model] + [
            model for model in GEMINI_FALLBACK_MODELS if model != self.model
        ]
        last_error: Optional[GeminiUnavailable] = None
        for model in models:
            try:
                text = await self._generate_once(model, system_prompt, question)
                self.last_model = model
                return text
            except GeminiUnavailable as exc:
                last_error = exc
                continue

        raise last_error or GeminiUnavailable("Gemini request failed.")

    async def _generate_once(
        self, model: str, system_prompt: str, question: str
    ) -> str:
        url = f"{GEMINI_API_BASE}/models/{model}:generateContent"
        payload = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [
                {"role": "user", "parts": [{"text": question}]}
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.9,
                "maxOutputTokens": settings.GEMINI_MAX_OUTPUT_TOKENS,
                "thinkingConfig": {"thinkingBudget": 0},
            },
        }

        try:
            async with httpx.AsyncClient(
                timeout=self.timeout, transport=self.transport
            ) as client:
                response = await client.post(
                    url,
                    headers={
                        "x-goog-api-key": self.api_key,
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
        except httpx.HTTPError as exc:
            raise GeminiUnavailable(f"Could not reach Gemini: {exc}") from exc

        if response.status_code >= 400:
            try:
                detail = response.json().get("error", {}).get("message")
            except ValueError:
                detail = None
            raise GeminiUnavailable(
                f"Gemini API error ({response.status_code}): "
                f"{detail or 'request failed'}"
            )

        try:
            data = response.json()
        except ValueError as exc:
            raise GeminiUnavailable("Gemini returned an invalid response.") from exc

        candidates = data.get("candidates") or []
        if not candidates:
            raise GeminiUnavailable("Gemini returned no answer candidate.")

        parts = (candidates[0].get("content") or {}).get("parts") or []
        text = "".join(
            part.get("text", "")
            for part in parts
            if isinstance(part, dict)
        ).strip()
        if not text:
            raise GeminiUnavailable("Gemini returned an empty answer.")
        return text
