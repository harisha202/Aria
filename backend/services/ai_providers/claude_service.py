import asyncio
import json
import urllib.error
import urllib.request

import config
from utils.ai_utils import SYSTEM_PROMPT


class ClaudeService:
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key if api_key is not None else config.CLAUDE_API_KEY
        self.model = model or config.CLAUDE_MODEL
        self.endpoint = "https://api.anthropic.com/v1/messages"

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def generate(self, message: str, messages=None, max_tokens: int = 800) -> str:
        if not self.is_configured:
            raise RuntimeError("Claude API key is not configured")
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

    async def get_response(self, prompt):
        return await self.generate(prompt)

    async def stream_response(self, prompt, callback=None):
        response = await self.generate(prompt)
        for chunk in response.split(" "):
            piece = chunk + " "
            if callback:
                callback(piece)
            yield piece

    def set_system_prompt(self, role):
        return role

    def build_conversation_context(self, messages):
        return [{"role": item.get("role", "user"), "content": item.get("content", "")} for item in messages or []]

    def _generate_sync(self, message: str, messages, max_tokens: int) -> str:
        claude_messages = []
        for item in messages:
            role = "assistant" if item.get("role") == "assistant" else "user"
            content = str(item.get("content", "")).strip()
            if content:
                claude_messages.append({"role": role, "content": content})
        claude_messages.append({"role": "user", "content": message})

        payload = {
            "model": self.model,
            "max_tokens": max_tokens,
            "system": SYSTEM_PROMPT,
            "messages": claude_messages,
        }
        request = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Claude request failed: {exc}") from exc

        parts = data.get("content", [])
        text_parts = [part.get("text", "") for part in parts if part.get("type") == "text"]
        return "\n".join(part for part in text_parts if part).strip()
