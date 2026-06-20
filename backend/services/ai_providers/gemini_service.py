import asyncio
import json
import urllib.error
import urllib.parse
import urllib.request

import config
from utils.ai_utils import build_prompt


class GeminiService:
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key if api_key is not None else config.GEMINI_API_KEY
        self.model = model or config.GEMINI_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def generate(self, message: str, messages=None, max_tokens: int = 800) -> str:
        if not self.is_configured:
            raise RuntimeError("Gemini API key is not configured")
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None,
            self._generate_sync,
            message,
            messages or [],
            max_tokens,
        )

    async def send_message(self, user_id=None, message: str = "", conversation_id=None, messages=None):
        return await self.generate(message, messages or [])

    async def generate_response(self, prompt):
        return await self.generate(prompt)

    async def stream_response(self, prompt, callback=None):
        response = await self.generate(prompt)
        for chunk in response.split(" "):
            piece = chunk + " "
            if callback:
                callback(piece)
            yield piece

    def configure_safety(self, settings):
        self.safety_settings = settings
        return self.safety_settings

    def _generate_sync(self, message: str, messages, max_tokens: int) -> str:
        prompt = build_prompt(message, messages)
        query = urllib.parse.urlencode({"key": self.api_key})
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?{query}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"maxOutputTokens": max_tokens},
        }
        request = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Gemini request failed: {exc}") from exc

        candidates = data.get("candidates", [])
        if not candidates:
            return ""
        parts = candidates[0].get("content", {}).get("parts", [])
        return "\n".join(part.get("text", "") for part in parts).strip()
