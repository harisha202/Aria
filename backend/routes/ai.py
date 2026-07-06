from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional

from services.ai import ai_service

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


class AIChatRequest(BaseModel):
    message: Optional[str] = None
    prompt: Optional[str] = None
    messages: list = []
    model: str = None
    max_tokens: int = Field(800, ge=1, le=4096)


@router.post("/chat")
async def chat_with_ai(payload: AIChatRequest):
    message = payload.message or payload.prompt or ""
    return await ai_service.generate_response(
        message,
        payload.messages,
        payload.model,
        payload.max_tokens,
    )


@router.post("/chat-stream")
@router.post("/chat/stream")
async def chat_stream(payload: AIChatRequest):
    message = payload.message or payload.prompt or ""

    async def event_stream():
        async for item in ai_service.stream_response(
            message,
            payload.messages,
            payload.model,
            payload.max_tokens,
        ):
            yield f"data: {item['chunk']}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")





@router.get("/models")
async def get_models():
    return {"models": ai_service.available_models()}
