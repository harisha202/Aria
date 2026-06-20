from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/{user_id}/{conversation_id}")
@router.websocket("/ws/chat/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: str, user_id: str = "guest"):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            await websocket.send_json(
                {
                    "type": "message.received",
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "received": data,
                }
            )
    except WebSocketDisconnect:
        return
