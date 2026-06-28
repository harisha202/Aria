from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
from database.db import init_db
from routes import ai, auth, chat, feedback, verification, voice, websocket

app = FastAPI(title="ARIA API")

if config.DEBUG:
    print("=== SMTP DEBUG ===")
    print(f"SMTP_HOST: {config.SMTP_HOST or 'EMPTY'}")
    print(f"SMTP_PORT: {config.SMTP_PORT}")
    print(f"SMTP_USER: {config.SMTP_USER or 'EMPTY'}")
    print(
        f"SMTP_PASSWORD: {config.SMTP_PASSWORD[:5]}***"
        if config.SMTP_PASSWORD
        else "SMTP_PASSWORD: EMPTY"
    )
    print(f"FROM_EMAIL: {config.FROM_EMAIL or 'EMPTY'}")
    print("==================")

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


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
