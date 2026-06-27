# ARIA

ARIA is a full-stack, voice-first AI assistant.

Tagline: **Where Silence Finds Its Voice**

The frontend is a React/Vite app. The backend is a FastAPI API that connects authentication, chat history, AI providers, speech-to-text, text-to-speech, WebSocket streaming, and database persistence.

## Current Status

- Frontend and backend are connected through `VITE_API_URL=http://localhost:8000`.
- Backend routes use `/api/v1/...`.
- Chat messages are sent from React to FastAPI and stored in the database.
- Voice recording sends browser audio to the backend STT endpoint.
- Signup and resend flows send branded ARIA OTP emails through the backend mail service.
- AI responses use Claude/Gemini when keys are configured, otherwise the app uses a local fallback response.
- TTS uses Google Cloud Text-to-Speech when configured, otherwise it returns a local fallback audio payload.
- SQLite works by default. PostgreSQL is supported through `DATABASE_URL`.

## System Architecture

```text
ARIA Voice Assistant
"Where Silence Finds Its Voice"

Frontend: React + Vite
|
|-- Pages
|   |-- Welcome
|   |-- Login / Sign Up / OTP Verification
|   `-- ChatPage
|
|-- Chat UI
|   |-- ChatContainer
|   |-- MessageList
|   |-- MessageItem
|   |-- InputBar
|   |-- VoiceButton
|   `-- VoiceVisualizer
|
|-- Context Providers
|   |-- AuthContext
|   |-- ChatContext
|   |-- VoiceContext
|   `-- UIContext
|
|-- Hooks
|   |-- useAuth
|   |-- useChat
|   |-- useVoice
|   |-- useWebSocket
|   |-- useLocalStorage
|   `-- usePrevious
|
`-- Services
    |-- api.js
    |-- auth.service.js
    |-- chat.service.js
    |-- ai.service.js
    |-- voice.service.js
    `-- websocket.service.js

        HTTP, multipart audio uploads, and WebSocket streaming

Backend: FastAPI + Python
|
|-- API Routes
|   |-- /api/v1/auth
|   |-- /api/v1/chat
|   |-- /api/v1/ai
|   |-- /api/v1/voice
|   `-- /ws/{user_id}/{conversation_id}
|
|-- Services
|   |-- auth.py
|   |-- chat.py
|   |-- ai.py
|   |-- voice.py
|   |-- websocket.py
|   |-- ai_providers/
|   |   |-- claude_service.py
|   |   `-- gemini_service.py
|   `-- voice_engines/
|       |-- stt_service.py
|       `-- tts_service.py
|
|-- Models
|   |-- User
|   |-- Conversation
|   |-- Message
|   `-- Settings
|
`-- Database
    |-- SQLite by default
    `-- PostgreSQL through DATABASE_URL

External APIs
|
|-- Anthropic Claude API
|-- Google Gemini API
|-- Google Cloud Speech-to-Text
|-- Google Cloud Text-to-Speech
`-- SMTP email for OTP delivery
```

## Main User Journey

```text
User speaks
|
v
Frontend records audio with the Web Audio API
|
v
VoiceVisualizer shows the live waveform
|
v
Frontend sends audio blob as multipart/form-data
POST /api/v1/voice/transcribe
|
v
Backend calls the STT engine
|
v
Transcript returns to the frontend
|
v
Transcript is sent as a chat message
POST /api/v1/chat/send-message
|
v
Backend stores the user message
|
v
Backend routes the prompt through services/ai.py
|
v
Claude or Gemini generates the assistant response
|
v
Backend stores the AI message
|
v
Backend optionally synthesizes speech
POST /api/v1/voice/speak or /api/v1/voice/synthesize
|
v
Frontend renders text plus replayable audio controls
```

## Key Integration Points

### Frontend To Backend

- REST API: auth, conversations, messages, settings, AI, and voice actions.
- Multipart forms: audio upload for speech-to-text.
- Binary responses: generated audio for text-to-speech.
- WebSocket: real-time chat updates, streaming responses, and typing-style events.

### AI

- Claude is the primary reasoning model when `CLAUDE_API_KEY` is configured.
- Gemini is available as an alternate or fallback model when `GEMINI_API_KEY` is configured.
- `backend/services/ai.py` orchestrates provider selection and fallback behavior.
- Provider implementations live in `backend/services/ai_providers/`.

### Voice

- Browser recording and playback are handled by `frontend/src/services/voice.service.js`.
- Speech-to-text is routed through `backend/services/voice_engines/stt_service.py`.
- Text-to-speech is routed through `backend/services/voice_engines/tts_service.py`.
- The UI displays live recording state and audio playback controls.

### State And Persistence

- Frontend state lives in React contexts: auth, chat, voice, and UI.
- Backend persistence stores users, conversations, messages, and settings.
- SQLite is the default local database.
- PostgreSQL is supported for production-like deployments.

## Run The App

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend health check:

```text
http://localhost:8000/health
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend dev URL:

```text
http://localhost:5173
```

## Environment Connection

### Backend

Create or edit `backend/.env`. A safe template is in `backend/.env.example`.

Important variables:

```env
DEBUG=True
CORS_ORIGINS=http://localhost:5173

DATABASE_URL=sqlite:///aria.db
# DATABASE_URL=postgresql://aria_user:aria_password@localhost:5432/aria_db

SECRET_KEY=change-this-secret-in-production
JWT_SECRET=change-this-secret-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

CLAUDE_API_KEY=
CLAUDE_MODEL=claude-3-5-sonnet-20241022

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
AI_DEFAULT_MODEL=claude

GOOGLE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_CREDENTIALS_FILE=
GOOGLE_CLOUD_STT_LANGUAGE=en-US
GOOGLE_CLOUD_TTS_VOICE=en-US-Neural2-C

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@aria.app
FEEDBACK_EMAIL=feedback@aria.app
```

### Frontend

Frontend env lives in `frontend/.env.development`.

```env
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_NAME=ARIA
VITE_APP_VERSION=1.0.0-dev
VITE_DEFAULT_AI_MODEL=claude
```

## API Endpoints

### Auth

```text
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/verify-otp
POST /api/v1/auth/resend-otp
```

`signup` creates a 6-digit OTP and sends it by email. `verify-otp` validates the code and marks the user email as verified.

### Chat

```text
GET    /api/v1/chat/conversations?user_id=guest
POST   /api/v1/chat/conversations
GET    /api/v1/chat/conversations/{conversation_id}
DELETE /api/v1/chat/conversations/{conversation_id}
GET    /api/v1/chat/conversations/{conversation_id}/messages
POST   /api/v1/chat/send-message
POST   /api/v1/chat/messages
POST   /api/v1/chat/conversations/{conversation_id}/clear
DELETE /api/v1/chat/messages/{message_id}
```

### AI

```text
POST /api/v1/ai/chat
POST /api/v1/ai/chat-stream
POST /api/v1/ai/chat/stream
POST /api/v1/ai/set-ai-model
POST /api/v1/ai/set-model
GET  /api/v1/ai/models
```

### Voice

```text
POST /api/v1/voice/transcribe
POST /api/v1/voice/transcribe-stream
POST /api/v1/voice/synthesize
POST /api/v1/voice/speak
POST /api/v1/voice/speak-stream
GET  /api/v1/voice/voices
```

### WebSocket

```text
WS /ws/{user_id}/{conversation_id}
WS /ws/chat/{conversation_id}
```

### Verification And Mail

```text
POST /api/verification/email
POST /api/verification/email/confirmed
POST /api/verification/otp
POST /api/verification/otp/warning
POST /api/verification/feedback
```

### Feedback

```text
POST   /api/v1/feedback/submit
GET    /api/v1/feedback/
GET    /api/v1/feedback/stats/summary
GET    /api/v1/feedback/user/{email}
GET    /api/v1/feedback/{feedback_id}
PATCH  /api/v1/feedback/{feedback_id}/read
POST   /api/v1/feedback/{feedback_id}/note
DELETE /api/v1/feedback/{feedback_id}
```

## Database

Default local mode:

```env
DATABASE_URL=sqlite:///aria.db
```

PostgreSQL mode:

```env
DATABASE_URL=postgresql://aria_user:aria_password@localhost:5432/aria_db
```

The backend initializes required tables at startup in `backend/database/db.py`. SQL migration files are also kept in `database/migrations/`.

Main tables:

- `users`
- `conversations`
- `messages`
- `user_settings`
- `feedback`

Useful PostgreSQL checks:

```sql
SELECT id, user_email, rating, feedback_type, is_read, created_at
FROM feedback
ORDER BY created_at DESC;

SELECT feedback_type, COUNT(*) AS total, AVG(rating) AS average_rating
FROM feedback
GROUP BY feedback_type
ORDER BY feedback_type;
```

## File Structure

Generated folders such as `node_modules/`, `dist/`, `__pycache__/`, and local database files are intentionally omitted.

```text
Aira/
|-- .gitignore
|-- README.md
|-- backend/
|   |-- .env.example
|   |-- config.py
|   |-- main.py
|   |-- requirements.txt
|   |-- database/
|   |   |-- db.py
|   |   `-- schemas.py
|   |-- middleware/
|   |-- models/
|   |   |-- conversation.py
|   |   |-- message.py
|   |   |-- settings.py
|   |   `-- user.py
|   |-- routes/
|   |   |-- ai.py
|   |   |-- auth.py
|   |   |-- chat.py
|   |   |-- user.py
|   |   |-- verification.py
|   |   |-- voice.py
|   |   `-- websocket.py
|   |-- services/
|   |   |-- ai.py
|   |   |-- auth.py
|   |   |-- chat.py
|   |   |-- email_verification.py
|   |   |-- otp_verification.py
|   |   |-- voice.py
|   |   |-- websocket.py
|   |   |-- ai_providers/
|   |   |   |-- claude_service.py
|   |   |   `-- gemini_service.py
|   |   `-- voice_engines/
|   |       |-- stt_service.py
|   |       `-- tts_service.py
|   `-- utils/
|       |-- ai_utils.py
|       |-- helpers.py
|       |-- jwt.py
|       |-- validators.py
|       `-- voice_utils.py
|-- database/
|   `-- migrations/
`-- frontend/
    |-- .env.development
    |-- .env.example
    |-- package.json
    |-- vite.config.js
    |-- public/
    `-- src/
        |-- App.jsx
        |-- main.jsx
        |-- components/
        |   |-- Auth/
        |   |-- Backgrounds/
        |   |-- Chat/
        |   |-- Common/
        |   |-- Dashboard/
        |   `-- Settings/
        |-- context/
        |   |-- AuthContext.jsx
        |   |-- ChatContext.jsx
        |   |-- UIContext.jsx
        |   `-- VoiceContext.jsx
        |-- hooks/
        |-- pages/
        |   |-- Login.jsx
        |   |-- OTPVerification.jsx
        |   |-- SignUp.jsx
        |   |-- Welcome.jsx
        |   |-- chatpage.jsx
        |   |-- dashboard.jsx
        |   |-- guest.jsx
        |   `-- settings.jsx
        |-- services/
        `-- utils/
```

## Key Files

- `backend/main.py`: FastAPI app, CORS, route registration, and database initialization.
- `backend/config.py`: Reads `.env` values for API keys, database, SMTP, JWT, and CORS.
- `backend/database/db.py`: SQLite/PostgreSQL connection helper and table initialization.
- `backend/routes/chat.py`: Conversation/message endpoints and full message workflow.
- `backend/routes/ai.py`: AI endpoints for chat, streaming, model listing, and model switching.
- `backend/routes/voice.py`: STT/TTS endpoints.
- `backend/routes/verification.py`: Verification, OTP, and feedback email endpoints.
- `backend/services/chat.py`: Conversation and message persistence.
- `backend/services/ai.py`: Claude/Gemini orchestration with fallback behavior.
- `backend/services/voice.py`: STT/TTS orchestration.
- `backend/services/mailer.py`: Shared SMTP sender and ARIA-branded email shell with inline logo.
- `backend/services/email_verification.py`: Verification and welcome email templates.
- `backend/services/otp_verification.py`: OTP and OTP warning email templates.
- `backend/services/otp_store.py`: Local OTP generation, expiry, and verification state.
- `backend/services/feedback.py`: Feedback notification and confirmation email templates.
- `frontend/src/pages/chatpage.jsx`: Main chat page.
- `frontend/src/components/Chat/ChatContainer.jsx`: Main connected chat experience.
- `frontend/src/components/Chat/VoiceButton.jsx`: Recording control.
- `frontend/src/components/Chat/VoiceVisualizer.jsx`: Recording visualization.
- `frontend/src/services/api.js`: Base HTTP client using `VITE_API_URL`.
- `frontend/src/services/chat.service.js`: Frontend chat API client.
- `frontend/src/services/voice.service.js`: Browser recording, STT upload, and TTS playback.
- `frontend/src/context/AuthContext.jsx`: User/token state.
- `frontend/src/context/ChatContext.jsx`: Conversation state.
- `frontend/src/context/VoiceContext.jsx`: Voice state.

## Verification

Backend smoke check:

```powershell
cd backend
python -c "from fastapi.testclient import TestClient; import main; c=TestClient(main.app); print(c.get('/health').json())"
```

Frontend build:

```powershell
cd frontend
npm.cmd run -s build
```

## Summary

ARIA supports:

- Voice input through speech-to-text.
- Voice output through text-to-speech.
- AI responses through Claude and Gemini provider services.
- Real-time chat behavior through WebSocket routes.
- Persistent conversation history.
- JWT and OTP-based authentication.
- A responsive React interface with chat, voice, dashboard, and settings surfaces.

Core loop:

```text
Speak -> Transcribe -> Send to AI -> Stream response -> Synthesize voice -> Save history
```
