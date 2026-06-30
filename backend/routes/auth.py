from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from middleware.rate_limit import login_limit, otp_resend_limit, signup_limit
from services import auth
from services.otp_store import generate_otp, verify_otp as verify_otp_code
from services.otp_verification import otp_verification_service
from utils.jwt import create_token
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    role: Optional[str] = None


class OTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4)


@router.post("/signup")
async def signup(payload: SignupRequest, request: Request, _=Depends(signup_limit)):
    try:
        result = auth.signup(payload.email, payload.password, payload.name)
        user = result["user"]
        otp_code = generate_otp(user["email"])
        logger.info("=== DEV MODE: OTP for %s is %s ===", user["email"], otp_code)
        
        sent = await otp_verification_service.send_otp_email(
            user["email"],
            user.get("name") or user["email"].split("@")[0],
            otp_code,
        )
        if not sent:
            logger.warning("OTP email failed for %s — SMTP may not be configured", user["email"])
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Account saved, but OTP email could not be sent. Check SMTP settings and try resend OTP.",
            )
        logger.info("Signup successful for %s", user["email"])
        return result
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/login")
async def login(payload: LoginRequest, request: Request, _=Depends(login_limit)):
    try:
        result = auth.login(payload.email, payload.password)
        logger.info("Login successful for %s", payload.email)
        return result
    except ValueError as exc:
        logger.warning("Failed login attempt for %s", payload.email)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.post("/verify-otp")
async def verify_otp(payload: OTPRequest):
    if not verify_otp_code(payload.email, payload.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )
    auth.mark_email_verified(payload.email)
    user = auth.get_user_by_email(payload.email)
    logger.info("Email verified for %s", payload.email)
    return {
        "verified": True,
        "email": payload.email,
        "user": auth.public_user(user) if user else None,
        "access_token": create_token({"sub": user["id"], "email": user["email"]}) if user else None,
    }


@router.post("/resend-otp")
async def resend_otp(payload: dict, request: Request, _=Depends(otp_resend_limit)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required")

    user = auth.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    otp_code = generate_otp(email)
    logger.info("=== DEV MODE: Resent OTP for %s is %s ===", email, otp_code)
    
    sent = await otp_verification_service.send_otp_email(
        email,
        user.get("name") or email.split("@")[0],
        otp_code,
    )
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send OTP email",
        )
    logger.info("OTP resent for %s", email)
    return {"sent": True, "email": email}
