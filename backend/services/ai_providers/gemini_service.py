import asyncio
import json
import httpx
import config
from utils.ai_utils import build_prompt, get_system_prompt

class GeminiService:
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key if api_key is not None else config.GEMINI_API_KEY
        self.model_name = model or config.GEMINI_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def _build_payload(self, message: str, messages: list, max_tokens: int, persona: str, image_b64: str = None) -> dict:
        sys_prompt = get_system_prompt(persona)
        prompt_text = build_prompt(message, messages)
        
        parts = [{"text": prompt_text}]
        if image_b64:
            mime = "image/jpeg"
            data = image_b64
            if "," in image_b64:
                header, data = image_b64.split(",", 1)
                if "png" in header: mime = "image/png"
                elif "webp" in header: mime = "image/webp"
            parts.insert(0, {"inline_data": {"mime_type": mime, "data": data}})
            
        payload = {
            "contents": [{"role": "user", "parts": parts}],
            "system_instruction": {"parts": [{"text": sys_prompt}]},
            "generationConfig": {"maxOutputTokens": max_tokens}
        }
        return payload

    async def generate(self, message: str, messages=None, max_tokens: int = 800, persona: str = None, image: str = None) -> str:
        if not self.is_configured:
            raise RuntimeError("Gemini API key is not configured")
            
        payload = self._build_payload(message, messages or [], max_tokens, persona, image)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=60.0)
            resp.raise_for_status()
            data = resp.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                return ""

    async def stream_response(self, message: str, messages=None, max_tokens: int = 800, persona: str = None, image: str = None):
        if not self.is_configured:
            raise RuntimeError("Gemini API key is not configured")

        payload = self._build_payload(message, messages or [], max_tokens, persona, image)
        # Using alt=sse to force standard Server-Sent Events stream from Google
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:streamGenerateContent?alt=sse&key={self.api_key}"
        
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", url, json=payload, timeout=60.0) as response:
                response.raise_for_status()
                async for chunk in response.aiter_lines():
                    chunk = chunk.strip()
                    if chunk.startswith("data: "):
                        data_str = chunk[6:].strip()
                        if not data_str or data_str == "[DONE]": 
                            continue
                        try:
                            data = json.loads(data_str)
                            if "candidates" in data and len(data["candidates"]) > 0:
                                parts = data["candidates"][0].get("content", {}).get("parts", [])
                                if parts:
                                    text = parts[0].get("text", "")
                                    if text:
                                        yield text
                        except json.JSONDecodeError:
                            pass
