import hashlib
import secrets
import uuid

from database.db import execute, fetch_one, now_iso, placeholder
from utils.jwt import create_token


def _hash_password(password: str, salt: str = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return f"{salt}${digest.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    salt, _ = stored_hash.split("$", 1)
    return secrets.compare_digest(_hash_password(password, salt), stored_hash)


def public_user(user):
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name"),
        "is_verified": bool(user.get("is_verified")),
    }


def signup(email: str, password: str, name: str = None):
    mark = placeholder()
    existing = fetch_one(f"SELECT * FROM users WHERE email = {mark}", (email.lower(),))
    if existing:
        raise ValueError("Email is already registered")

    now = now_iso()
    user = {
        "id": f"user-{uuid.uuid4().hex}",
        "email": email.lower(),
        "name": name or email.split("@")[0],
        "hashed_password": _hash_password(password),
        "is_verified": True,
        "created_at": now,
        "updated_at": now,
    }
    execute(
        f"""
        INSERT INTO users (id, email, name, hashed_password, is_verified, created_at, updated_at)
        VALUES ({mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark})
        """,
        (
            user["id"],
            user["email"],
            user["name"],
            user["hashed_password"],
            user["is_verified"],
            user["created_at"],
            user["updated_at"],
        ),
    )
    return {"user": public_user(user), "access_token": create_token({"sub": user["id"], "email": user["email"]})}


def login(email: str, password: str):
    mark = placeholder()
    user = fetch_one(f"SELECT * FROM users WHERE email = {mark}", (email.lower(),))
    if not user or not _verify_password(password, user["hashed_password"]):
        raise ValueError("Invalid email or password")
    return {"user": public_user(user), "access_token": create_token({"sub": user["id"], "email": user["email"]})}


def verify_user(user_id: str) -> bool:
    if not user_id:
        return False
    mark = placeholder()
    return bool(fetch_one(f"SELECT id FROM users WHERE id = {mark}", (user_id,)))
