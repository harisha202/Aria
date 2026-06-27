from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field

from middleware.auth import require_admin_user
from services.feedback import feedback_service
from services import feedback_store

router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback_type: str = Field("general", min_length=1, max_length=40)
    message: str = Field("No message provided.", max_length=500)
    user_email: EmailStr
    user_name: str = Field("User", min_length=1, max_length=120)


class FeedbackResponse(BaseModel):
    id: str
    user_email: str
    user_name: Optional[str] = None
    rating: int
    feedback_type: str
    message: str
    is_read: bool = False
    admin_note: Optional[str] = None
    created_at: str
    updated_at: str


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(feedback_data: FeedbackCreate):
    try:
        feedback = feedback_store.create_feedback(feedback_data.dict())
        await feedback_service.send_feedback(
            feedback["user_name"],
            feedback["user_email"],
            feedback["message"],
            feedback["feedback_type"],
            feedback["rating"],
            True,
        )
        return feedback
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.get("/", response_model=List[FeedbackResponse])
async def get_all_feedback(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin=Depends(require_admin_user),
):
    return feedback_store.get_all_feedback(limit, offset)


@router.get("/stats/summary")
async def get_feedback_stats(admin=Depends(require_admin_user)):
    return feedback_store.get_feedback_stats()


@router.get("/user/{email}", response_model=List[FeedbackResponse])
async def get_user_feedback(email: EmailStr, admin=Depends(require_admin_user)):
    return feedback_store.get_feedback_by_email(email)


@router.get("/{feedback_id}", response_model=FeedbackResponse)
async def get_feedback(feedback_id: str, admin=Depends(require_admin_user)):
    feedback = feedback_store.get_feedback_by_id(feedback_id)
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )
    return feedback


@router.delete("/{feedback_id}")
async def delete_feedback(feedback_id: str, admin=Depends(require_admin_user)):
    deleted = feedback_store.delete_feedback(feedback_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )
    return {"message": "Feedback deleted successfully"}


@router.patch("/{feedback_id}/read", response_model=FeedbackResponse)
async def mark_as_read(feedback_id: str, admin=Depends(require_admin_user)):
    feedback = feedback_store.mark_as_read(feedback_id)
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )
    return feedback


@router.post("/{feedback_id}/note")
async def add_note(feedback_id: str, note_data: dict, admin=Depends(require_admin_user)):
    feedback = feedback_store.add_note(feedback_id, note_data.get("note"))
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found",
        )
    return {"message": "Note added successfully", "feedback": feedback}
