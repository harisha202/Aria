import config
from services.ai_providers import ClaudeService, GeminiService
from utils.ai_utils import chunk_text, fallback_response, normalize_model


class AIService:
    def __init__(self):
        self.providers = {
            "claude": ClaudeService(),
            "gemini": GeminiService(),
        }
        self.default_model = normalize_model(config.AI_DEFAULT_MODEL)

    def available_models(self):
        return [
            {
                "id": key,
                "configured": provider.is_configured,
                "default": key == self.default_model,
            }
            for key, provider in self.providers.items()
        ]

    def select_model(self, user_id=None, model_name=None):
        self.default_model = normalize_model(model_name or self.default_model)
        return self.default_model

    async def process_message(self, user_message, **kwargs):
        return await self.generate_response(user_message, **kwargs)

    async def get_response(self, prompt, **kwargs):
        result = await self.generate_response(prompt, **kwargs)
        return result["response"]

    def handle_error(self, error):
        return {
            "response": fallback_response(str(error)),
            "model": "local-fallback",
            "fallback": True,
        }

    def cache_response(self, prompt, response):
        return {"prompt": prompt, "response": response, "cached": False}

    async def generate_response(
        self,
        message: str,
        messages=None,
        model: str = None,
        max_tokens: int = 800,
    ) -> dict:
        requested_model = normalize_model(model or self.default_model)
        model_order = [requested_model] + [
            key for key in self.providers.keys() if key != requested_model
        ]

        errors = []
        for model_key in model_order:
            provider = self.providers.get(model_key)
            if not provider or not provider.is_configured:
                continue
            try:
                response = await provider.generate(message, messages or [], max_tokens)
                if response:
                    return {
                        "response": response,
                        "model": model_key,
                        "fallback": False,
                    }
            except Exception as exc:
                errors.append(f"{model_key}: {exc}")

        return {
            "response": fallback_response(message),
            "model": "local-fallback",
            "fallback": True,
            "errors": errors,
        }

    async def stream_response(self, *args, **kwargs):
        result = await self.generate_response(*args, **kwargs)
        for chunk in chunk_text(result["response"]):
            yield {
                "chunk": chunk,
                "model": result["model"],
                "fallback": result.get("fallback", False),
            }


ai_service = AIService()


async def generate_response(message: str) -> str:
    result = await ai_service.generate_response(message)
    return result["response"]
