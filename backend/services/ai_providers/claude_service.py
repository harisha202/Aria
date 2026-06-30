import asyncio
import anthropic
import config
from utils.ai_utils import get_system_prompt


class ClaudeService:
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key if api_key is not None else config.CLAUDE_API_KEY
        self.model = model or config.CLAUDE_MODEL
        self.client = anthropic.AsyncAnthropic(api_key=self.api_key) if self.api_key else None

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def _build_messages(self, message: str, messages: list, image_b64: str = None) -> list:
        claude_messages = []
        for item in messages:
            role = "assistant" if item.get("role") == "assistant" else "user"
            content = str(item.get("content", "")).strip()
            if content:
                claude_messages.append({"role": role, "content": content})
        
        user_content = []
        if image_b64:
            # Strip the data:image/xxx;base64, prefix if present
            media_type = "image/jpeg"
            data = image_b64
            if "," in image_b64:
                header, data = image_b64.split(",", 1)
                if "png" in header: media_type = "image/png"
                elif "webp" in header: media_type = "image/webp"
            
            user_content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": data,
                }
            })
        
        if message:
            user_content.append({"type": "text", "text": message})
            
        if not user_content:
            user_content.append({"type": "text", "text": "Hello."})
            
        claude_messages.append({"role": "user", "content": user_content})
        return claude_messages

    async def generate(self, message: str, messages=None, max_tokens: int = 800, persona: str = None, image: str = None) -> str:
        if not self.is_configured:
            raise RuntimeError("Claude API key is not configured")
        
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=get_system_prompt(persona),
            messages=self._build_messages(message, messages or [], image)
        )
        return response.content[0].text

    async def stream_response(self, message: str, messages=None, max_tokens: int = 800, persona: str = None, image: str = None):
        if not self.is_configured:
            raise RuntimeError("Claude API key is not configured")

        async with self.client.messages.stream(
            model=self.model,
            max_tokens=max_tokens,
            system=get_system_prompt(persona),
            messages=self._build_messages(message, messages or [], image)
        ) as stream:
            async for text in stream.text_stream:
                yield text
