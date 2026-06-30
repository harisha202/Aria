"""
ARIA WebSocket route — real-time AI streaming endpoint.

Supports two URL patterns:
  ws://.../ws/{user_id}/{conversation_id}
  ws://.../ws/chat/{conversation_id}

Message protocol (client → server):
  { "type": "message", "text": "...", "model": "claude" }
  { "type": "ping" }

Message protocol (server → client):
  { "type": "pong" }
  { "type": "typing",       "user_id": "..." }
  { "type": "stream.chunk", "chunk": "...", "model": "..." }
  { "type": "stream.end",   "text": "...",  "model": "..." }
  { "type": "message.saved", "message": {...} }
  { "type": "error",         "detail": "..." }
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.ai import ai_service
from services.chat import chat_service
from services.websocket import manager
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["websocket"])


async def _handle_session(websocket: WebSocket, conversation_id: str, user_id: str):
    await manager.connect(websocket, conversation_id, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "message")

            # ── Heartbeat ─────────────────────────────────────────────
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            # ── Chat message ──────────────────────────────────────────
            if msg_type == "message":
                text = (data.get("text") or data.get("content") or "").strip()
                if not text:
                    await manager.send_error(conversation_id, user_id, "Empty message")
                    continue

                model = data.get("model") or "claude"
                persona = data.get("persona") or "default"
                image = data.get("image")

                # Save user message (don't save base64 image in DB to save space, just note it)
                msg_content_to_save = text if not image else f"[Image attached]\n{text}"
                user_msg = chat_service.save_message(
                    user_id, conversation_id, {"content": msg_content_to_save, "sender": "user"}
                )
                await manager.broadcast(
                    {"type": "message.saved", "message": user_msg, "conversation_id": conversation_id},
                    conversation_id,
                )

                # Typing indicator
                await manager.send_typing(conversation_id, "aria")

                # Load conversation history
                history = [
                    {"role": m["role"], "content": m["content"]}
                    for m in chat_service.get_messages(conversation_id, 20)
                ]

                # Stream AI response token-by-token
                full_text = ""
                ai_model = model
                try:
                    async for chunk_data in ai_service.stream_response(
                        text, messages=history, model=model, persona=persona, image=image
                    ):
                        chunk = chunk_data.get("chunk", "")
                        ai_model = chunk_data.get("model", model)
                        full_text += chunk
                        await manager.send_stream_chunk(conversation_id, user_id, chunk, ai_model)
                except Exception as exc:
                    logger.error("Streaming error for conv=%s: %s", conversation_id, exc, exc_info=True)
                    await manager.send_error(conversation_id, user_id, "AI service error. Please retry.")
                    continue

                # Stream end signal
                await manager.send_stream_end(conversation_id, user_id, full_text, ai_model)

                # Persist AI reply
                ai_msg = chat_service.save_message(
                    user_id,
                    conversation_id,
                    {"content": full_text, "sender": "ai", "ai_model": ai_model},
                )
                await manager.broadcast(
                    {"type": "message.saved", "message": ai_msg, "conversation_id": conversation_id},
                    conversation_id,
                )

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.error("WebSocket session error — conv=%s user=%s: %s", conversation_id, user_id, exc, exc_info=True)
    finally:
        manager.disconnect(conversation_id, user_id)


@router.websocket("/ws/{user_id}/{conversation_id}")
async def websocket_with_user(websocket: WebSocket, user_id: str, conversation_id: str):
    await _handle_session(websocket, conversation_id, user_id)


@router.websocket("/ws/chat/{conversation_id}")
async def websocket_chat(websocket: WebSocket, conversation_id: str):
    await _handle_session(websocket, conversation_id, "guest")
