import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import config
from database.db import init_db
from routes import ai, auth, chat, feedback, user, verification, voice, websocket, wikipedia
from utils.logger import get_logger

logger = get_logger("aria.main")

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
app.include_router(feedback.router)
app.include_router(verification.router)
app.include_router(websocket.router)
app.include_router(user.router)
app.include_router(wikipedia.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Our team has been notified."},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
