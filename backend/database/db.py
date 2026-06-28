import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path

from config import DATABASE_URL

BACKEND_DIR = Path(__file__).resolve().parents[1]


def is_postgres():
    return DATABASE_URL.startswith(("postgresql://", "postgres://"))


def _sqlite_path():
    path = DATABASE_URL.replace("sqlite:///", "", 1)
    sqlite_path = Path(path)
    if sqlite_path.is_absolute():
        return str(sqlite_path)
    return str(BACKEND_DIR / sqlite_path)


def _connect():
    if is_postgres():
        try:
            import psycopg
            from psycopg.rows import dict_row
        except ImportError as exc:
            raise RuntimeError("Install psycopg[binary] to use PostgreSQL DATABASE_URL") from exc
        return psycopg.connect(DATABASE_URL, row_factory=dict_row)

    connection = sqlite3.connect(_sqlite_path())
    connection.row_factory = sqlite3.Row
    return connection


def placeholder():
    return "%s" if is_postgres() else "?"


def now_iso():
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


@contextmanager
def get_connection():
    connection = _connect()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def fetch_one(query, params=()):
    with get_connection() as connection:
        cursor = connection.execute(query, params)
        row = cursor.fetchone()
        return dict(row) if row else None


def fetch_all(query, params=()):
    with get_connection() as connection:
        cursor = connection.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def execute(query, params=()):
    with get_connection() as connection:
        connection.execute(query, params)


def init_db():
    statements = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            hashed_password TEXT NOT NULL,
            is_verified BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            model TEXT DEFAULT 'claude',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_message_id TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            audio_url TEXT,
            audio_base64 TEXT,
            voice_transcript TEXT,
            sender TEXT NOT NULL,
            ai_model TEXT,
            status TEXT DEFAULT 'sent',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_settings (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            voice_preference TEXT DEFAULT 'default',
            ai_model_preference TEXT DEFAULT 'claude',
            language_preference TEXT DEFAULT 'en-US',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            user_email TEXT NOT NULL,
            user_name TEXT,
            rating INTEGER NOT NULL,
            feedback_type TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            admin_note TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """,
    ]
    with get_connection() as connection:
        for statement in statements:
            connection.execute(statement)
        for statement in [
            "ALTER TABLE conversations ADD COLUMN model TEXT DEFAULT 'claude'",
            "ALTER TABLE conversations ADD COLUMN last_message_id TEXT",
            "ALTER TABLE messages ADD COLUMN audio_url TEXT",
            "ALTER TABLE messages ADD COLUMN audio_base64 TEXT",
            "ALTER TABLE messages ADD COLUMN voice_transcript TEXT",
            "ALTER TABLE messages ADD COLUMN sender TEXT DEFAULT 'user'",
            "ALTER TABLE messages ADD COLUMN ai_model TEXT",
            "ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent'",
        ]:
            try:
                connection.execute(statement)
            except Exception:
                pass
        now = now_iso()
        connection.execute(
            """
            INSERT INTO users (id, email, name, hashed_password, is_verified, created_at, updated_at)
            VALUES ('guest', 'guest@aria.local', 'Guest', 'guest', 1, ?, ?)
            ON CONFLICT(id) DO NOTHING
            """
            if not is_postgres()
            else """
            INSERT INTO users (id, email, name, hashed_password, is_verified, created_at, updated_at)
            VALUES ('guest', 'guest@aria.local', 'Guest', 'guest', true, %s, %s)
            ON CONFLICT(id) DO NOTHING
            """,
            (now, now),
        )
