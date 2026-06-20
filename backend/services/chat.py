import uuid

from database.db import execute, fetch_all, fetch_one, now_iso, placeholder


def _message_from_row(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "conversationId": row["conversation_id"],
        "conversation_id": row["conversation_id"],
        "user_id": row["user_id"],
        "sender": row["sender"],
        "role": "assistant" if row["sender"] == "ai" else row["sender"],
        "text": row["content"],
        "content": row["content"],
        "audioUrl": row.get("audio_url"),
        "audio_url": row.get("audio_url"),
        "audioBase64": row.get("audio_base64"),
        "voiceTranscript": row.get("voice_transcript"),
        "voice_transcript": row.get("voice_transcript"),
        "ai_model": row.get("ai_model"),
        "status": row.get("status", "sent"),
        "timestamp": row["created_at"],
        "createdAt": row["created_at"],
        "created_at": row["created_at"],
    }


def _conversation_from_row(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "title": row["title"],
        "model": row.get("model") or "claude",
        "last_message_id": row.get("last_message_id"),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


class ChatService:
    def create_conversation(self, user_id: str, title: str = "New conversation", model: str = "claude"):
        mark = placeholder()
        now = now_iso()
        conversation = {
            "id": f"conversation-{uuid.uuid4().hex}",
            "user_id": user_id,
            "title": title or "New conversation",
            "model": model or "claude",
            "created_at": now,
            "updated_at": now,
        }
        execute(
            f"""
            INSERT INTO conversations (id, user_id, title, model, created_at, updated_at)
            VALUES ({mark}, {mark}, {mark}, {mark}, {mark}, {mark})
            """,
            (
                conversation["id"],
                conversation["user_id"],
                conversation["title"],
                conversation["model"],
                conversation["created_at"],
                conversation["updated_at"],
            ),
        )
        return conversation

    def get_conversations(self, user_id: str):
        mark = placeholder()
        rows = fetch_all(
            f"SELECT * FROM conversations WHERE user_id = {mark} ORDER BY updated_at DESC",
            (user_id,),
        )
        return [_conversation_from_row(row) for row in rows]

    def get_conversation(self, conversation_id: str):
        mark = placeholder()
        return _conversation_from_row(
            fetch_one(f"SELECT * FROM conversations WHERE id = {mark}", (conversation_id,))
        )

    def save_message(self, user_id: str, conversation_id: str, message_data: dict):
        mark = placeholder()
        now = now_iso()
        message = {
            "id": message_data.get("id") or f"message-{uuid.uuid4().hex}",
            "conversation_id": conversation_id,
            "user_id": user_id,
            "content": message_data.get("content") or message_data.get("text") or "",
            "audio_url": message_data.get("audio_url") or message_data.get("audioUrl"),
            "audio_base64": message_data.get("audio_base64") or message_data.get("audioBase64"),
            "voice_transcript": message_data.get("voice_transcript") or message_data.get("voiceTranscript"),
            "sender": message_data.get("sender") or message_data.get("role") or "user",
            "ai_model": message_data.get("ai_model") or message_data.get("model"),
            "status": message_data.get("status") or "sent",
            "created_at": now,
            "updated_at": now,
        }
        if message["sender"] == "assistant":
            message["sender"] = "ai"

        execute(
            f"""
            INSERT INTO messages (
                id, conversation_id, user_id, content, audio_url, audio_base64,
                voice_transcript, sender, ai_model, status, created_at, updated_at
            )
            VALUES ({mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark})
            """,
            (
                message["id"],
                message["conversation_id"],
                message["user_id"],
                message["content"],
                message["audio_url"],
                message["audio_base64"],
                message["voice_transcript"],
                message["sender"],
                message["ai_model"],
                message["status"],
                message["created_at"],
                message["updated_at"],
            ),
        )
        execute(
            f"UPDATE conversations SET updated_at = {mark}, last_message_id = {mark} WHERE id = {mark}",
            (now, message["id"], conversation_id),
        )
        return _message_from_row(message)

    def get_messages(self, conversation_id: str, limit: int = 50):
        mark = placeholder()
        rows = fetch_all(
            f"""
            SELECT * FROM messages
            WHERE conversation_id = {mark}
            ORDER BY created_at ASC
            LIMIT {mark}
            """,
            (conversation_id, limit),
        )
        return [_message_from_row(row) for row in rows]

    def delete_message(self, message_id: str):
        mark = placeholder()
        execute(f"DELETE FROM messages WHERE id = {mark}", (message_id,))
        return True

    def clear_conversation(self, conversation_id: str):
        mark = placeholder()
        execute(f"DELETE FROM messages WHERE conversation_id = {mark}", (conversation_id,))
        return True


chat_service = ChatService()


def create_ai_reply(message: str) -> str:
    return f"ARIA received: {message}"
