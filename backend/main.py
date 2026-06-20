from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
from database.db import init_db
from routes import ai, auth, chat, verification, voice, websocket

app = FastAPI(title="ARIA API")

origins = [origin.strip() for origin in config.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(voice.router)
app.include_router(ai.router)
app.include_router(verification.router)
app.include_router(websocket.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
