import base64
import hashlib
import hmac
import json
import time

import config


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _unb64(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_token(payload: dict) -> str:
    body = dict(payload)
    body.setdefault("exp", int(time.time()) + config.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    encoded_body = _b64(json.dumps(body, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(config.SECRET_KEY.encode("utf-8"), encoded_body.encode("utf-8"), hashlib.sha256)
    return f"{encoded_body}.{_b64(signature.digest())}"


def decode_token(token: str) -> dict:
    encoded_body, encoded_signature = token.split(".", 1)
    expected = hmac.new(config.SECRET_KEY.encode("utf-8"), encoded_body.encode("utf-8"), hashlib.sha256)
    if not hmac.compare_digest(_b64(expected.digest()), encoded_signature):
        raise ValueError("Invalid token signature")
    payload = json.loads(_unb64(encoded_body))
    if payload.get("exp", 0) < int(time.time()):
        raise ValueError("Token expired")
    return payload
