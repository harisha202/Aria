# ARIA

ARIA is a full-stack voice-first AI assistant. The frontend is a React/Vite app, and the backend is a FastAPI API that connects chat, auth, AI providers, speech-to-text, text-to-speech, WebSocket routes, and database persistence.

Tagline: **Where Silence Finds Its Voice**

## Current Status

- Frontend and backend are connected through `VITE_API_URL=http://localhost:8000`.
- Backend routes use `/api/v1/...`.
- Chat messages are sent from React to FastAPI and stored in the database.
- Voice recording sends audio from the browser to the backend STT endpoint.
- AI responses use Claude/Gemini when keys are configured, otherwise the app uses a local fallback response.
- TTS uses Google Cloud Text-to-Speech when configured, otherwise it returns a local fallback audio payload.
- SQLite works by default. PostgreSQL is supported through `DATABASE_URL`.

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

## Frontend To Backend Flow

1. User opens `frontend/src/pages/chatpage.jsx`.
2. `ChatContainer.jsx` loads messages using `ChatService`.
3. Text input calls `POST /api/v1/chat/send-message`.
4. Voice input records audio in `voice.service.js`, sends it to `POST /api/v1/voice/transcribe`, then sends the transcript to chat.
5. Backend saves the user message in `services/chat.py`.
6. Backend calls `services/ai.py`, which routes to Claude or Gemini if keys exist.
7. Backend saves the AI response.
8. Backend optionally calls TTS through `services/voice.py`.
9. Frontend receives text/audio and renders it in `MessageItem.jsx`.

## API Endpoints

### Auth

```text
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/verify-otp
POST /api/v1/auth/resend-otp
```

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

## Complete File Structure

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
|   |   |-- __init__.py
|   |   |-- auth.py
|   |   |-- error_handler.py
|   |   `-- websocket.py
|   |-- models/
|   |   |-- __init__.py
|   |   |-- conversation.py
|   |   |-- message.py
|   |   |-- settings.py
|   |   `-- user.py
|   |-- routes/
|   |   |-- __init__.py
|   |   |-- ai.py
|   |   |-- auth.py
|   |   |-- chat.py
|   |   |-- user.py
|   |   |-- verification.py
|   |   |-- voice.py
|   |   `-- websocket.py
|   |-- services/
|   |   |-- __init__.py
|   |   |-- ai.py
|   |   |-- auth.py
|   |   |-- chat.py
|   |   |-- email_verification.py
|   |   |-- otp_verification.py
|   |   |-- voice.py
|   |   |-- websocket.py
|   |   |-- ai_providers/
|   |   |   |-- __init__.py
|   |   |   |-- claude_service.py
|   |   |   `-- gemini_service.py
|   |   `-- voice_engines/
|   |       |-- __init__.py
|   |       |-- stt_service.py
|   |       `-- tts_service.py
|   `-- utils/
|       |-- __init__.py
|       |-- ai_utils.py
|       |-- helpers.py
|       |-- jwt.py
|       |-- validators.py
|       `-- voice_utils.py
|-- database/
|   `-- migrations/
|       |-- 001_create_users.sql
|       |-- 002_create_conversations.sql
|       |-- 003_create_messages.sql
|       `-- 004_create_settings.sql
`-- frontend/
    |-- .env.development
    |-- .env.example
    |-- README.md
    |-- eslint.config.js
    |-- index.html
    |-- package-lock.json
    |-- package.json
    |-- postcss.config.js
    |-- tailwind.config.js
    |-- vite.config.js
    |-- public/
    |   |-- favicon.svg
    |   |-- icons.svg
    |   |-- index.html
    |   `-- assets/
    |       `-- aria_icon_both_animated.html
    `-- src/
        |-- App.css
        |-- App.jsx
        |-- index.css
        |-- main.jsx
        |-- assets/
        |   |-- hero.png
        |   |-- react.svg
        |   `-- vite.svg
        |-- components/
        |   |-- AiraLogo.jsx
        |   |-- Auth/
        |   |   |-- LoginForm.jsx
        |   |   |-- OTPForm.jsx
        |   |   `-- SignUpForm.jsx
        |   |-- Backgrounds/
        |   |   |-- Ballpit.css
        |   |   |-- Ballpit.jsx
        |   |   |-- ElectricBorder.jsx
        |   |   |-- EvilEye.jsx
        |   |   |-- FloatingLines.css
        |   |   |-- FloatingLines.jsx
        |   |   |-- Hyperspeed.css
        |   |   |-- Hyperspeed.jsx
        |   |   |-- Iridescence.css
        |   |   |-- Iridescence.jsx
        |   |   |-- Lightfall.css
        |   |   |-- Lightfall.jsx
        |   |   |-- LiquidChrome.jsx
        |   |   |-- PixelSnow.css
        |   |   |-- PixelSnow.jsx
        |   |   |-- PrismaticBurst.css
        |   |   |-- PrismaticBurst.jsx
        |   |   |-- SoftAurora.css
        |   |   `-- SoftAurora.jsx
        |   |-- Chat/
        |   |   |-- ChatContainer.jsx
        |   |   |-- ConversationItem.jsx
        |   |   |-- ConversationList.jsx
        |   |   |-- InputBar.jsx
        |   |   |-- MessageItem.jsx
        |   |   |-- MessageList.jsx
        |   |   |-- VoiceButton.jsx
        |   |   `-- VoiceVisualizer.jsx
        |   |-- Common/
        |   |   |-- Button.jsx
        |   |   |-- Card.jsx
        |   |   |-- Input.jsx
        |   |   |-- Loading.jsx
        |   |   |-- Navbar.jsx
        |   |   |-- Sidebar.jsx
        |   |   `-- Toast.jsx
        |   |-- Dashboard/
        |   |   |-- QuickActions.jsx
        |   |   |-- RecentChats.jsx
        |   |   |-- StatCard.jsx
        |   |   `-- UsageChart.jsx
        |   `-- Settings/
        |       |-- NotificationSettings.jsx
        |       |-- PrivacySettings.jsx
        |       |-- ProfileSettings.jsx
        |       |-- SettingsLogo.jsx
        |       `-- VoiceSettings.jsx
        |-- context/
        |   |-- AuthContext.jsx
        |   |-- ChatContext.jsx
        |   |-- UIContext.jsx
        |   `-- VoiceContext.jsx
        |-- hooks/
        |   |-- useAI.js
        |   |-- useAuth.js
        |   |-- useChat.js
        |   |-- useLocalStorage.js
        |   |-- usePrevious.js
        |   |-- useVoice.js
        |   `-- useWebSocket.js
        |-- pages/
        |   |-- Login.jsx
        |   |-- LogoutConfirmation.jsx
        |   |-- OTPVerification.jsx
        |   |-- SignUp.jsx
        |   |-- Welcome.jsx
        |   |-- chatpage.jsx
        |   |-- dashboard.jsx
        |   |-- guest.jsx
        |   `-- settings.jsx
        |-- services/
        |   |-- ai.service.js
        |   |-- api.js
        |   |-- auth.service.js
        |   |-- chat.service.js
        |   |-- notification.service.js
        |   |-- storage.service.js
        |   |-- voice.service.js
        |   `-- websocket.service.js
        |-- styles/
        |   |-- animations.css
        |   |-- chat.css
        |   |-- forms.css
        |   |-- index.css
        |   |-- responsive.css
        |   `-- variables.css
        `-- utils/
            |-- constants.js
            |-- error-handler.js
            |-- formatters.js
            |-- storage-utils.js
            |-- validators.js
            `-- voice-utils.js
```

## Key Files

- `backend/main.py`: FastAPI app, CORS, route registration, database initialization.
- `backend/config.py`: Reads `.env` values for API keys, database, SMTP, JWT, and CORS.
- `backend/database/db.py`: SQLite/PostgreSQL connection helper and table initialization.
- `backend/routes/chat.py`: Conversation/message endpoints and full message workflow.
- `backend/services/chat.py`: Persistence for conversations and messages.
- `backend/services/ai.py`: Claude/Gemini orchestration with fallback.
- `backend/services/voice.py`: STT/TTS orchestration.
- `frontend/src/services/api.js`: Base HTTP client using `VITE_API_URL`.
- `frontend/src/services/chat.service.js`: Frontend chat API client.
- `frontend/src/services/voice.service.js`: Browser recording, STT upload, TTS playback.
- `frontend/src/components/Chat/ChatContainer.jsx`: Main connected chat experience.
- `frontend/src/context/AuthContext.jsx`: User/token state.
- `frontend/src/context/ChatContext.jsx`: Conversation state.
- `frontend/src/context/VoiceContext.jsx`: Voice state.
