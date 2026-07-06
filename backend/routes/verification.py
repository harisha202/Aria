from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from middleware.auth import require_admin_user
from services.email_verification import email_verification_service
from services.feedback import feedback_service
from services.otp_verification import otp_verification_service

router = APIRouter(prefix="/api/v1/verification", tags=["verification"])


class VerificationEmailRequest(BaseModel):
    email: EmailStr
    user_name: str = Field(..., min_length=1)
    verification_token: str = Field(..., min_length=1)


class VerifiedConfirmationRequest(BaseModel):
    email: EmailStr
    user_name: str = Field(..., min_length=1)


class OTPEmailRequest(BaseModel):
    email: EmailStr
    user_name: str = Field(..., min_length=1)
    otp_code: str = Field(..., min_length=4, max_length=10)


class OTPWarningEmailRequest(BaseModel):
    email: EmailStr
    user_name: str = Field(..., min_length=1)
    remaining_attempts: int = Field(..., ge=0)


class FeedbackEmailRequest(BaseModel):
    email: EmailStr
    user_name: str = Field(..., min_length=1, max_length=120)
    message: str = Field(..., min_length=3, max_length=4000)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    send_confirmation: bool = True


@router.post("/email")
async def send_verification_email(payload: VerificationEmailRequest, admin=Depends(require_admin_user)):
    sent = await email_verification_service.send_verification_email(
        payload.email,
        payload.user_name,
        payload.verification_token,
    )
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send verification email",
        )
    return {"sent": True}


@router.post("/email/confirmed")
async def send_verified_confirmation(payload: VerifiedConfirmationRequest, admin=Depends(require_admin_user)):
    sent = await email_verification_service.send_verified_confirmation(
        payload.email,
        payload.user_name,
    )
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send verified confirmation email",
        )
    return {"sent": True}


@router.post("/otp")
async def send_otp_email(payload: OTPEmailRequest, admin=Depends(require_admin_user)):
    sent = await otp_verification_service.send_otp_email(
        payload.email,
        payload.user_name,
        payload.otp_code,
    )
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send OTP email",
        )
    return {"sent": True}


@router.post("/otp/warning")
async def send_otp_warning_email(payload: OTPWarningEmailRequest, admin=Depends(require_admin_user)):
    sent = await otp_verification_service.send_otp_warning_email(
        payload.email,
        payload.user_name,
        payload.remaining_attempts,
    )
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send OTP warning email",
        )
    return {"sent": True}


@router.post("/feedback")
async def send_feedback_email(payload: FeedbackEmailRequest, admin=Depends(require_admin_user)):
    sent = await feedback_service.send_feedback(
        payload.user_name,
        payload.email,
        payload.message,
        "general",
        payload.rating,
        payload.send_confirmation,
    )
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send feedback email",
        )
    return {"sent": True}
