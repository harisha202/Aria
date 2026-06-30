"""
ARIA user profile & account management routes.
Endpoints:
  GET    /api/v1/user/profile         — get current user profile
  PATCH  /api/v1/user/profile         — update display name
  POST   /api/v1/user/change-password — change password (requires old password)
"""

import hashlib
import secrets as _secrets

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

from middleware.auth import get_current_user
from services import auth as auth_service
from database.db import execute, now_iso, placeholder
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/user", tags=["user"])


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)


@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    return {"user": auth_service.public_user(user)}


@router.patch("/profile")
async def update_profile(data: UpdateProfileRequest, user=Depends(get_current_user)):
    if data.name is None:
        return {"user": auth_service.public_user(user)}

    mark = placeholder()
    execute(
        f"UPDATE users SET name = {mark}, updated_at = {mark} WHERE id = {mark}",
        (data.name.strip(), now_iso(), user["id"]),
    )
    updated = auth_service.get_user_by_id(user["id"])
    logger.info("Profile updated for user %s", user["id"])
    return {"user": auth_service.public_user(updated)}


@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, user=Depends(get_current_user)):
    full_user = auth_service.get_user_by_id(user["id"])
    if not full_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    stored_hash = full_user["hashed_password"]
    try:
        salt, _ = stored_hash.split("$", 1)
        digest = hashlib.pbkdf2_hmac("sha256", data.old_password.encode(), salt.encode(), 120000)
        candidate = f"{salt}${digest.hex()}"
        if not _secrets.compare_digest(candidate, stored_hash):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password data corrupted — contact support",
        )

    new_salt = _secrets.token_hex(16)
    new_digest = hashlib.pbkdf2_hmac("sha256", data.new_password.encode(), new_salt.encode(), 120000)
    new_hash = f"{new_salt}${new_digest.hex()}"

    mark = placeholder()
    execute(
        f"UPDATE users SET hashed_password = {mark}, updated_at = {mark} WHERE id = {mark}",
        (new_hash, now_iso(), user["id"]),
    )
    logger.info("Password changed for user %s", user["id"])
    return {"changed": True}
