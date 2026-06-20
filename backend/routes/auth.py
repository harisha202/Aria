from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from services import auth

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
async def signup(payload: SignupRequest):
    try:
        return auth.signup(payload.email, payload.password, payload.name)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/login")
async def login(payload: LoginRequest):
    try:
        return auth.login(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.post("/verify-otp")
async def verify_otp(payload: OTPRequest):
    return {"verified": True, "email": payload.email}


@router.post("/resend-otp")
async def resend_otp(payload: dict):
    return {"sent": True, "email": payload.get("email")}
