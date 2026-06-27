from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from middleware.auth import (
    get_optional_user,
    require_conversation_access,
    resolve_chat_user_id,
)
from services.ai import ai_service
from services.chat import chat_service
from services.voice import voice_service

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


@router.get("/conversations")
async def get_conversations(user_id: str = "guest", user=Depends(get_optional_user)):
    resolved_user_id = resolve_chat_user_id(user_id, user)
    return {
        "user_id": resolved_user_id,
        "conversations": chat_service.get_conversations(resolved_user_id),
    }


@router.post("/conversations")
async def create_conversation(data: ConversationRequest, user=Depends(get_optional_user)):
    resolved_user_id = resolve_chat_user_id(data.user_id, user)
    return {"conversation": chat_service.create_conversation(resolved_user_id, data.title, data.model)}


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(conversation_id)
    require_conversation_access(conversation, user)
    return {"conversation": conversation, "messages": chat_service.get_messages(conversation_id)}


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(conversation_id)
    require_conversation_access(conversation, user)
    chat_service.clear_conversation(conversation_id)
    return {"deleted": conversation_id}


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, skip: int = 0, limit: int = 50, user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(conversation_id)
    require_conversation_access(conversation, user)
    messages = chat_service.get_messages(conversation_id, limit)
    return {"conversation_id": conversation_id, "skip": skip, "limit": limit, "messages": messages[skip:]}


@router.post("/send-message")
async def send_message(data: SendMessageRequest, user=Depends(get_optional_user)):
    text = (data.text or data.content or "").strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message text is required")

    conversation_id = data.conversation_id
    if not conversation_id:
        resolved_user_id = resolve_chat_user_id(data.user_id, user)
        conversation = chat_service.create_conversation(resolved_user_id, text[:48], data.model or "claude")
        conversation_id = conversation["id"]
    else:
        conversation = chat_service.get_conversation(conversation_id)
        require_conversation_access(conversation, user)
        resolved_user_id = conversation["user_id"]

    user_message = chat_service.save_message(resolved_user_id, conversation_id, {"content": text, "sender": "user"})
    history = [
        {"role": message["role"], "content": message["content"]}
        for message in chat_service.get_messages(conversation_id, 20)
    ]
    ai_result = await ai_service.generate_response(text, history, data.model)
    audio = await voice_service.synthesize_voice(ai_result["response"]) if data.voice else None
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
    return {
        "conversation_id": conversation_id,
        "user_message": user_message,
        "ai_message": ai_message,
        "ai": ai_result,
        "audio": audio,
    }


@router.post("/messages")
async def save_message(data: dict, user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(data["conversation_id"])
    require_conversation_access(conversation, user)
    message = chat_service.save_message(conversation["user_id"], data["conversation_id"], data)
    return {"message": message}


@router.post("/conversations/{conversation_id}/clear")
async def clear_conversation(conversation_id: str, user=Depends(get_optional_user)):
    conversation = chat_service.get_conversation(conversation_id)
    require_conversation_access(conversation, user)
    chat_service.clear_conversation(conversation_id)
    return {"cleared": conversation_id}


@router.delete("/messages/{message_id}")
async def delete_message(message_id: str, user=Depends(get_optional_user)):
    message = chat_service.get_message(message_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    conversation = chat_service.get_conversation(message["conversation_id"])
    require_conversation_access(conversation, user)
    chat_service.delete_message(message_id)
    return {"deleted": message_id}
