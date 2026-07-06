# 🎙️ ARIA — Advanced Real-time Interactive Assistant

> **Where Silence Finds Its Voice**

ARIA is a production-ready, full-stack AI voice assistant that bridges the gap between traditional text-based LLMs and natural, real-time conversations. Built with React, FastAPI, WebSockets, and modern AI integrations, ARIA enables users to speak directly to the assistant, stream responses in real time, and experience a responsive, accessible, and visually engaging interface.

---

# 🌟 Why ARIA?

<<<<<<< HEAD
- Frontend and backend are connected through `VITE_API_URL=http://localhost:8000`.
- Backend routes use `/api/v1/...`.
- Chat messages are sent from React to FastAPI and stored in the database.
- Voice recording sends browser audio to the backend STT endpoint.
- Signup and resend flows send branded ARIA OTP emails through the backend mail service.
- AI responses use Claude/Gemini when keys are configured, otherwise the app uses a local fallback response.
- TTS uses Google Cloud Text-to-Speech when configured, otherwise it returns a local fallback audio payload.
- SQLite works by default. PostgreSQL is supported through `DATABASE_URL`.
- WebSocket connections are authenticated: the frontend sends the JWT as a `?token=` query param, and the backend verifies the signature plus conversation ownership before allowing a connection (guest sessions still connect without a token).
- Chat supports a `/wiki <topic>` command that looks up Wikipedia directly (no AI model call) and returns a sourced, plain-text extract capped at 9000 characters. No API key required.
- Dashboard stats (Total Messages / Total Conversations) load correctly on first visit, not just after opening Chat.
- Mobile: the chat sidebar toggle works correctly below 768px width.
- Landing page navigation (Sign In / Create Account / Try as Guest) is keyboard and screen-reader accessible.
- **Tone-Aware Emoji Reactions:** AI responses are dynamically analyzed for sentiment, automatically triggering interactive emoji badges that display a custom particle-burst animation when clicked.
- **3D Parallax "Thinking" Robot:** A custom CSS-only 3D robot animation provides visual feedback while the AI is generating a response, featuring a bounding-box scoped parallax effect that tracks mouse hover.
- **Global Error Boundaries:** Comprehensive fallback screens capture React crashes and maintain the application's dark-mode aesthetic to ensure a seamless UX even during errors.
- **Guest Mode Architecture:** Secure, isolated chat sessions allow unregistered users to experience the AI without polluting the core user database.
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
|-- Wikipedia API (no key required)
`-- SMTP email for OTP delivery
=======
Unlike simple AI chat wrappers, ARIA is designed as an enterprise-grade application focused on performance, accessibility, and user experience.

### 🎤 Voice-First Experience
- Speech-to-Text (STT) for voice input
- Text-to-Speech (TTS) for AI responses
- Completely hands-free interaction

### ⚡ Real-Time AI Streaming
- WebSocket-based token streaming
- Instant AI responses without waiting for complete generation
- Smooth conversational experience

### 📚 Smart Knowledge Plugin
- `/wiki <topic>` command fetches information directly from Wikipedia
- No AI tokens consumed
- No additional API costs

### 👤 Guest Mode
- Instant access without registration
- Temporary chat sessions
- Database remains clean from anonymous usage

### 😊 Emotion-Aware Interface
- Sentiment-aware emoji animations
- Interactive particle effects
- 3D Thinking Robot with parallax animation

---

# 🚀 Features

- Real-time WebSocket AI streaming
- Speech-to-Text voice input
- Text-to-Speech voice output
- Tone-aware emoji reactions
- Interactive Thinking Robot animation
- JWT Authentication
- Email OTP Verification
- Guest Mode
- Conversation History
- Multi-model AI support (Claude & Gemini)
- Wikipedia command support
- Responsive modern UI
- Dark mode interface

---

# 🛠️ Tech Stack

## Frontend

- React 19
- Vite
- React Context API
- Vanilla CSS
- Web Audio API
- Web Speech API

## Backend

- Python
- FastAPI
- WebSockets
- SQLAlchemy
- SQLite / PostgreSQL
- JWT Authentication
- bcrypt Password Hashing

## AI Services

- Anthropic Claude
- Google Gemini
- Wikipedia API
- Google Cloud STT/TTS (Optional)

---

# 🏗️ Architecture

```text
Frontend (React + Vite)
│
├── Authentication
├── Chat Interface
├── Voice Engine
├── WebSocket Client
├── Context Providers
└── API Services
        │
        ▼
Backend (FastAPI)
│
├── Authentication
├── Chat API
├── AI Service
├── Voice Service
├── WebSocket Server
├── Database
└── Models
        │
        ▼
External Services
│
├── Claude API
├── Gemini API
├── Wikipedia API
├── Google STT/TTS
└── SMTP Server
>>>>>>> e2dfc489df1b21cc17f1d707b2a6594c4f7f9238
```

---

# 🚶 User Flow

```text
User Speaks
      │
      ▼
Speech-to-Text
      │
      ▼
Transcript Generated
      │
      ▼
AI Processing
      │
      ▼
WebSocket Streaming
      │
      ▼
Frontend Displays Tokens
      │
      ▼
Text-to-Speech Response
```

---

# 📡 API Endpoints

## Authentication

```http
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/verify-otp
POST /api/v1/auth/resend-otp
```

## Chat

```http
GET  /api/v1/chat/conversations
POST /api/v1/chat/conversations
GET  /api/v1/chat/messages
POST /api/v1/chat/send-message
```

## AI

```http
POST /api/v1/ai/chat
```

## Voice

```http
POST /api/v1/voice/transcribe
POST /api/v1/voice/synthesize
```

## WebSocket

```text
<<<<<<< HEAD
WS /ws/{user_id}/{conversation_id}?token=<jwt>
WS /ws/chat/{conversation_id}?token=<jwt>
WS /ws/notifications/{user_id}?token=<jwt>
```

`token` is required for authenticated users (validated against the JWT signature and, for `/ws/{user_id}/{conversation_id}`, checked against the conversation's owner). Guest sessions (`user_id` starting with `guest`) can connect without a token.

### Wikipedia

```text
GET /api/v1/wikipedia/search?q={query}
```

No API key required. Returns the best-matching article's plain-text extract, capped at 9000 characters (cut at a sentence boundary), plus the canonical article URL. Rate-limited to 20 requests/minute per IP. In the chat UI, this is triggered by typing `/wiki <topic>` instead of a normal message.

### Verification And Mail
=======
WS /ws/{user_id}/{conversation_id}
```

---
>>>>>>> e2dfc489df1b21cc17f1d707b2a6594c4f7f9238

# 🔒 Security

- JWT Authentication
- bcrypt password hashing
- Protected API routes
- OTP email verification
- Guest session isolation
- Secure WebSocket communication

---

# 📌 Future Improvements

- Voice cloning
- Multiple AI personalities
- File upload support
- Image generation
- Multilingual conversations
- Docker deployment
- Kubernetes support
- Redis caching

---

# 👨‍💻 Developer

**Harish A**

Full Stack Developer | MERN | FastAPI | AI Applications

---

## ⭐ Support

<<<<<<< HEAD
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
|   |   |-- websocket.py
|   |   `-- wikipedia.py
|   |-- services/
|   |   |-- ai.py
|   |   |-- auth.py
|   |   |-- chat.py
|   |   |-- email_verification.py
|   |   |-- otp_verification.py
|   |   |-- voice.py
|   |   |-- websocket.py
|   |   |-- wikipedia.py
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
- `backend/services/wikipedia.py`: Wikipedia search + extract lookup, capped at 9000 characters, no API key required.
- `backend/routes/wikipedia.py`: `GET /api/v1/wikipedia/search` endpoint, rate-limited.
- `frontend/src/services/wikipedia.service.js`: Frontend client for the Wikipedia lookup endpoint.
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
- Real-time chat behavior through authenticated WebSocket routes.
- Wikipedia lookups via `/wiki <topic>` — sourced, plain-text answers capped at 9000 characters, no API key needed.
- Persistent conversation history.
- JWT and OTP-based authentication.
- A responsive, keyboard-accessible React interface with chat, voice, dashboard, and settings surfaces.

Core loop:

```text
Speak -> Transcribe -> Send to AI -> Stream response -> Synthesize voice -> Save history
```
=======
If you found this project useful, consider giving it a ⭐ on GitHub.
>>>>>>> e2dfc489df1b21cc17f1d707b2a6594c4f7f9238
