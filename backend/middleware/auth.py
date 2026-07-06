from fastapi import Depends, HTTPException, Request, status

import config
from services import auth
from utils.jwt import decode_token


def is_guest_user_id(user_id: str = None) -> bool:
    return not user_id or user_id == "guest" or user_id.startswith("guest-")


def _bearer_token(request: Request):
    authorization = request.headers.get("Authorization", "")
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )
    return token


def get_optional_user(request: Request):
    token = _bearer_token(request)
    if not token:
        return None
    try:
        payload = decode_token(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

    user = auth.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def get_current_user(user=Depends(get_optional_user)):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user


def require_admin_user(user=Depends(get_current_user)):
    if user["email"].lower() not in config.ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


def resolve_chat_user_id(requested_user_id: str = None, user=None) -> str:
    if user:
        return user["id"]
    if is_guest_user_id(requested_user_id):
        return requested_user_id or "guest"
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
    )


def require_conversation_access(conversation: dict, user=None, requested_user_id: str = None):
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    owner_id = conversation["user_id"]
    if is_guest_user_id(owner_id):
        if requested_user_id and requested_user_id == owner_id:
            return conversation
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conversation access denied",
        )
    if user and owner_id == user["id"]:
        return conversation
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Conversation access denied",
    )
