import pytest
from datetime import datetime, timedelta
import secrets

from services.otp_store import generate_otp, verify_otp, _otp_entries, MAX_OTP_ATTEMPTS

@pytest.fixture(autouse=True)
def clear_otp_store():
    _otp_entries.clear()

def test_generate_otp():
    email = "test@example.com"
    otp = generate_otp(email)
    assert len(otp) == 6
    assert otp.isdigit()
    assert email in _otp_entries
    assert _otp_entries[email]["code"] == otp

def test_verify_valid_otp():
    email = "valid@example.com"
    otp = generate_otp(email)
    assert verify_otp(email, otp) is True
    # Verify it was removed after successful verification
    assert email not in _otp_entries

def test_verify_invalid_otp():
    email = "invalid@example.com"
    generate_otp(email)
    assert verify_otp(email, "000000") is False
    # Verify it still exists since it was wrong
    assert email in _otp_entries

def test_verify_expired_otp():
    email = "expired@example.com"
    otp = generate_otp(email)
    # Manually expire
    _otp_entries[email]["expires_at"] = datetime.utcnow() - timedelta(minutes=1)
    assert verify_otp(email, otp) is False
    # Verify it was removed due to expiration
    assert email not in _otp_entries

def test_max_attempts():
    email = "max@example.com"
    generate_otp(email)
    # Try invalid OTPs up to MAX_OTP_ATTEMPTS
    for _ in range(MAX_OTP_ATTEMPTS):
        assert verify_otp(email, "000000") is False
    
    # After MAX_OTP_ATTEMPTS, it should still be in the dictionary but with max attempts used
    assert email in _otp_entries
    
    # The next (MAX_OTP_ATTEMPTS + 1) attempt should fail and remove it
    assert verify_otp(email, "000000") is False
    assert email not in _otp_entries
