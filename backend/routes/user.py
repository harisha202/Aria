from fastapi import APIRouter

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/{user_id}")
async def get_user(user_id: str):
    return {"id": user_id}
