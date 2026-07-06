from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional

from middleware.auth import (
    get_optional_user,
    require_conversation_access,
    resolve_chat_user_id,
)
from middleware.rate_limit import chat_minute_limit
from services.ai import ai_service
from services.chat import chat_service
from services.voice import voice_service
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


class ConversationRequest(BaseModel):
    user_id: str = "guest"
    title: str = "New conversation"
    model: str = "claude"


class SendMessageRequest(BaseModel):
    user_id: str = "guest"
    conversation_id: Optional[str] = None
    text: Optional[str] = None
    content: Optional[str] = None
    model: Optional[str] = None
    voice: bool = True
    options: dict = {}


@router.get("/conversations")
async def get_conversations(user_id: str = "guest", user=Depends(get_optional_user)):
    resolved_user_id = resolve_chat_user_id(user_id, user)
    return {
        "user_id": resolved_user_id,
        "conversations": chat_service.get_conversations(resolved_user_id),
    }


@router.get("/stats/weekly")
async def get_weekly_stats(user_id: str = "guest", user=Depends(get_optional_user)):
    resolved_user_id = resolve_chat_user_id(user_id, user)
    return {"stats": chat_service.get_weekly_stats(resolved_user_id)}


@router.post("/conversations")
async def create_conversation(data: ConversationRequest, user=Depends(get_optional_user)):
    resolved_user_id = resolve_chat_user_id(data.user_id, user)
    return {"conversation": chat_service.create_conversation(resolved_user_id, data.title, data.model)}


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, user_id: str = "guest", user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(conversation_id)
    require_conversation_access(conversation, user, user_id)
    return {"conversation": conversation, "messages": chat_service.get_messages(conversation_id)}


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user_id: str = "guest", user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(conversation_id)
    require_conversation_access(conversation, user, user_id)
    chat_service.clear_conversation(conversation_id)
    return {"deleted": conversation_id}


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, skip: int = 0, limit: int = 50, user_id: str = "guest", user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(conversation_id)
    require_conversation_access(conversation, user, user_id)
    messages = chat_service.get_messages(conversation_id, limit)
    return {"conversation_id": conversation_id, "skip": skip, "limit": limit, "messages": messages[skip:]}


@router.post("/send-message")
async def send_message(
    data: SendMessageRequest,
    request: Request,
    user=Depends(get_optional_user),
    _=Depends(chat_minute_limit),
):
    text = (data.text or data.content or "").strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message text is required")

    options = data.options or {}
    model = options.get("model") or data.model or "claude"
    persona = options.get("persona") or "default"
    image = options.get("image")
    voice_name = options.get("voiceName")
    language_code = options.get("languageCode") or "en-US"

    conversation_id = data.conversation_id
    if not conversation_id:
        resolved_user_id = resolve_chat_user_id(data.user_id, user)
        conversation = chat_service.create_conversation(resolved_user_id, text[:48], model)
        conversation_id = conversation["id"]
    else:
        conversation = chat_service.get_conversation(conversation_id)
        require_conversation_access(conversation, user, data.user_id)
        resolved_user_id = conversation["user_id"]

    msg_content_to_save = text if not image else f"[Image attached]\n{text}"
    user_message = chat_service.save_message(resolved_user_id, conversation_id, {"content": msg_content_to_save, "sender": "user"})
    history = [
        {"role": message["role"], "content": message["content"]}
        for message in chat_service.get_messages(conversation_id, 20)
    ]

    try:
        ai_result = await ai_service.generate_response(text, history, model=model, persona=persona, image=image)
    except Exception as exc:
        logger.error("AI generation error for conversation %s: %s", conversation_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service temporarily unavailable. Please try again.",
        ) from exc

    audio = None
    if data.voice:
        try:
            audio = await voice_service.synthesize_voice(
                ai_result["response"], 
                language_code=language_code, 
                voice_name=voice_name
            )
        except Exception as exc:
            logger.warning("TTS failed (non-critical): %s", exc)

    ai_message = chat_service.save_message(
        resolved_user_id,
        conversation_id,
        {
            "content": ai_result["response"],
            "sender": "ai",
            "ai_model": ai_result["model"],
            "audio_base64": audio.get("audio_base64") if audio else None,
        },
    )

    logger.info(
        "Message processed — model=%s fallback=%s conv=%s",
        ai_result["model"],
        ai_result.get("fallback"),
        conversation_id,
    )

    return {
        "conversation_id": conversation_id,
        "user_message": user_message,
        "ai_message": ai_message,
        "ai": ai_result,
        "audio": audio,
    }


@router.post("/messages")
async def save_message(data: dict, user=Depends(get_optional_user)):
    user_id = data.get("user_id", "guest")
    conversation = chat_service.get_conversation(data["conversation_id"])
    require_conversation_access(conversation, user, user_id)
    message = chat_service.save_message(conversation["user_id"], data["conversation_id"], data)
    return {"message": message}


@router.post("/conversations/{conversation_id}/clear")
async def clear_conversation(conversation_id: str, user_id: str = "guest", user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(conversation_id)
    require_conversation_access(conversation, user, user_id)
    chat_service.clear_conversation(conversation_id)
    return {"cleared": conversation_id}


@router.delete("/messages/{message_id}")
async def delete_message(message_id: str, user_id: str = "guest", user=Depends(get_optional_user)):
    message = chat_service.get_message(message_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    conversation = chat_service.get_conversation(message["conversation_id"])
    require_conversation_access(conversation, user, user_id)
    chat_service.delete_message(message_id)
    return {"deleted": message_id}
