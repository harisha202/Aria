"""Small in-memory OTP store for local ARIA auth flows."""

import secrets
from datetime import datetime, timedelta


OTP_TTL_MINUTES = 10
MAX_OTP_ATTEMPTS = 5
_otp_entries = {}


def generate_otp(email: str) -> str:
    code = f"{secrets.randbelow(1000000):06d}"
    _otp_entries[email.lower()] = {
        "code": code,
        "expires_at": datetime.utcnow() + timedelta(minutes=OTP_TTL_MINUTES),
        "attempts": 0,
    }
    return code


def verify_otp(email: str, otp_code: str) -> bool:
    key = email.lower()
    entry = _otp_entries.get(key)
    if not entry:
        return False

    if datetime.utcnow() > entry["expires_at"]:
        _otp_entries.pop(key, None)
        return False

    entry["attempts"] += 1
    if entry["attempts"] > MAX_OTP_ATTEMPTS:
        _otp_entries.pop(key, None)
        return False

    if secrets.compare_digest(entry["code"], otp_code):
        _otp_entries.pop(key, None)
        return True

    return False
