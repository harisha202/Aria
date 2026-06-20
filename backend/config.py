import os

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

if load_dotenv:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///aria.db")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
SECRET_KEY = os.getenv("SECRET_KEY", JWT_SECRET)
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

AI_DEFAULT_MODEL = os.getenv("AI_DEFAULT_MODEL", "gemini")

GOOGLE_PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID", "")
GOOGLE_CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_FILE", "")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS",
    GOOGLE_CREDENTIALS_FILE,
)
GOOGLE_CLOUD_STT_API_KEY = os.getenv("GOOGLE_CLOUD_STT_API_KEY", "")
GOOGLE_CLOUD_TTS_API_KEY = os.getenv("GOOGLE_CLOUD_TTS_API_KEY", "")
GOOGLE_CLOUD_STT_LANGUAGE = os.getenv("GOOGLE_CLOUD_STT_LANGUAGE", "en-US")
GOOGLE_CLOUD_TTS_VOICE = os.getenv("GOOGLE_CLOUD_TTS_VOICE", "en-US-Neural2-C")

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER or "noreply@aria.app")

APP_URL = os.getenv("APP_URL", "http://localhost:5173")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
