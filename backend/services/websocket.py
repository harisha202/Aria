"""
ARIA WebSocket connection manager.
Tracks active connections and provides typed broadcast helpers.
"""

import asyncio
from typing import Optional

from fastapi import WebSocket

from utils.logger import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections per user / conversation."""

    def __init__(self):
        # {conversation_id: {user_id: WebSocket}}
        self._connections: dict[str, dict[str, WebSocket]] = {}

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def connect(self, websocket: WebSocket, conversation_id: str, user_id: str = "guest") -> None:
        await websocket.accept()
        if conversation_id not in self._connections:
            self._connections[conversation_id] = {}
        self._connections[conversation_id][user_id] = websocket
        logger.info("WS connected — user=%s conv=%s", user_id, conversation_id)

    def disconnect(self, conversation_id: str, user_id: str = "guest") -> None:
        conv = self._connections.get(conversation_id, {})
        conv.pop(user_id, None)
        if not conv:
            self._connections.pop(conversation_id, None)
        logger.info("WS disconnected — user=%s conv=%s", user_id, conversation_id)

    # ------------------------------------------------------------------
    # Sending helpers
    # ------------------------------------------------------------------

    async def send_personal(self, message: dict, conversation_id: str, user_id: str) -> bool:
        """Send a message to a single user in a conversation."""
        ws: Optional[WebSocket] = self._connections.get(conversation_id, {}).get(user_id)
        if ws is None:
            return False
        try:
            await ws.send_json(message)
            return True
        except Exception as exc:
            logger.warning("WS send failed for user=%s: %s", user_id, exc)
            self.disconnect(conversation_id, user_id)
            return False

    async def broadcast(self, message: dict, conversation_id: str) -> int:
        """Broadcast to all users watching a conversation. Returns send count."""
        connections = list(self._connections.get(conversation_id, {}).items())
        tasks = [self.send_personal(message, conversation_id, uid) for uid, _ in connections]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return sum(1 for r in results if r is True)

    async def send_typing(self, conversation_id: str, user_id: str) -> None:
        await self.broadcast({"type": "typing", "user_id": user_id, "conversation_id": conversation_id}, conversation_id)

    async def send_stream_chunk(self, conversation_id: str, user_id: str, chunk: str, model: str) -> None:
        await self.send_personal(
            {"type": "stream.chunk", "chunk": chunk, "model": model, "conversation_id": conversation_id},
            conversation_id,
            user_id,
        )

    async def send_stream_end(self, conversation_id: str, user_id: str, full_text: str, model: str) -> None:
        await self.send_personal(
            {"type": "stream.end", "text": full_text, "model": model, "conversation_id": conversation_id},
            conversation_id,
            user_id,
        )

    async def send_error(self, conversation_id: str, user_id: str, detail: str) -> None:
        await self.send_personal(
            {"type": "error", "detail": detail, "conversation_id": conversation_id},
            conversation_id,
            user_id,
        )

    # ------------------------------------------------------------------
    # Introspection
    # ------------------------------------------------------------------

    def active_count(self, conversation_id: str) -> int:
        return len(self._connections.get(conversation_id, {}))

    def is_connected(self, conversation_id: str, user_id: str) -> bool:
        return user_id in self._connections.get(conversation_id, {})


manager = ConnectionManager()
