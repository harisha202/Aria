import pytest
import time
import json
import base64
import hmac
import hashlib
from utils.jwt import create_token, decode_token, _b64

def test_create_and_decode_token():
    payload = {"sub": "user@example.com"}
    token = create_token(payload)
    
    assert isinstance(token, str)
    assert len(token.split(".")) == 2
    
    decoded = decode_token(token)
    assert decoded["sub"] == payload["sub"]
    assert "exp" in decoded

def test_decode_expired_token(monkeypatch):
    import config
    # Temporarily set expiration to -1 to ensure it expires immediately
    monkeypatch.setattr(config, "ACCESS_TOKEN_EXPIRE_MINUTES", -1)
    
    payload = {"sub": "expired@example.com"}
    token = create_token(payload)
    
    with pytest.raises(ValueError, match="Token expired"):
        decode_token(token)

def test_decode_invalid_signature():
    payload = {"sub": "spoofed@example.com"}
    token = create_token(payload)
    
    # Modify the signature part
    body, signature = token.split(".")
    spoofed_token = f"{body}.{signature}spoofed"
    
    with pytest.raises(ValueError, match="Invalid token signature"):
        decode_token(spoofed_token)

def test_decode_invalid_body():
    payload = {"sub": "hacked@example.com"}
    token = create_token(payload)
    
    body, signature = token.split(".")
    
    # Try to change the payload
    hacked_payload = {"sub": "admin@example.com", "exp": int(time.time()) + 3600}
    hacked_body = _b64(json.dumps(hacked_payload, separators=(",", ":")).encode("utf-8"))
    
    hacked_token = f"{hacked_body}.{signature}"
    
    with pytest.raises(ValueError, match="Invalid token signature"):
        decode_token(hacked_token)
