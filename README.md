# 🎙️ ARIA — Advanced Real-time Interactive Assistant

> **Where Silence Finds Its Voice**

ARIA is a production-ready, full-stack AI voice assistant that bridges the gap between traditional text-based LLMs and natural, real-time conversations. Built with React, FastAPI, WebSockets, and modern AI integrations, ARIA enables users to speak directly to the assistant, stream responses in real time, and experience a responsive, accessible, and visually engaging interface.

---

# 🌟 Why ARIA?

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
WS /ws/{user_id}/{conversation_id}
```

---

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

If you found this project useful, consider giving it a ⭐ on GitHub.
