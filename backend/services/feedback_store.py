"""Feedback persistence for ARIA."""

import uuid

from database.db import execute, fetch_all, fetch_one, is_postgres, now_iso, placeholder


VALID_FEEDBACK_TYPES = {"bug", "feature", "improvement", "general"}


def _normalize_feedback(data):
    feedback_type = data.get("feedback_type") or data.get("feedbackType") or "general"
    if feedback_type not in VALID_FEEDBACK_TYPES:
        feedback_type = "general"

    message = (data.get("message") or "").strip()
    if not message:
        message = "No message provided."

    rating = int(data.get("rating") or 5)
    rating = min(5, max(1, rating))

    user_email = (data.get("user_email") or data.get("userEmail") or "").strip().lower()
    user_name = (data.get("user_name") or data.get("userName") or "User").strip()

    return {
        "user_email": user_email,
        "user_name": user_name,
        "rating": rating,
        "feedback_type": feedback_type,
        "message": message,
    }


def create_feedback(data):
    feedback = _normalize_feedback(data)
    if not feedback["user_email"]:
        raise ValueError("User email is required")

    mark = placeholder()
    now = now_iso()
    feedback_id = f"feedback-{uuid.uuid4().hex}"
    execute(
        f"""
        INSERT INTO feedback (
            id, user_email, user_name, rating, feedback_type, message,
            is_read, admin_note, created_at, updated_at
        )
        VALUES ({mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark})
        """,
        (
            feedback_id,
            feedback["user_email"],
            feedback["user_name"],
            feedback["rating"],
            feedback["feedback_type"],
            feedback["message"],
            False,
            None,
            now,
            now,
        ),
    )
    return get_feedback_by_id(feedback_id)


def get_all_feedback(limit=20, offset=0):
    mark = placeholder()
    return fetch_all(
        f"""
        SELECT * FROM feedback
        ORDER BY created_at DESC
        LIMIT {mark} OFFSET {mark}
        """,
        (limit, offset),
    )


def get_feedback_by_id(feedback_id):
    mark = placeholder()
    return fetch_one(f"SELECT * FROM feedback WHERE id = {mark}", (feedback_id,))


def get_feedback_by_email(email):
    mark = placeholder()
    return fetch_all(
        f"SELECT * FROM feedback WHERE user_email = {mark} ORDER BY created_at DESC",
        (email.lower(),),
    )


def delete_feedback(feedback_id):
    existing = get_feedback_by_id(feedback_id)
    if not existing:
        return False
    mark = placeholder()
    execute(f"DELETE FROM feedback WHERE id = {mark}", (feedback_id,))
    return True


def mark_as_read(feedback_id):
    if not get_feedback_by_id(feedback_id):
        return None
    mark = placeholder()
    execute(
        f"UPDATE feedback SET is_read = {mark}, updated_at = {mark} WHERE id = {mark}",
        (True, now_iso(), feedback_id),
    )
    return get_feedback_by_id(feedback_id)


def add_note(feedback_id, note):
    if not get_feedback_by_id(feedback_id):
        return None
    mark = placeholder()
    execute(
        f"UPDATE feedback SET admin_note = {mark}, updated_at = {mark} WHERE id = {mark}",
        ((note or "").strip(), now_iso(), feedback_id),
    )
    return get_feedback_by_id(feedback_id)


def get_feedback_stats():
    bool_true = "true" if is_postgres() else "1"
    total = fetch_one("SELECT COUNT(*) AS count FROM feedback")["count"]
    unread = fetch_one(f"SELECT COUNT(*) AS count FROM feedback WHERE is_read != {bool_true}")["count"]
    average = fetch_one("SELECT AVG(rating) AS average_rating FROM feedback")["average_rating"]
    by_type = fetch_all(
        """
        SELECT feedback_type, COUNT(*) AS count
        FROM feedback
        GROUP BY feedback_type
        ORDER BY feedback_type
        """
    )
    return {
        "total": total,
        "unread": unread,
        "average_rating": float(average) if average is not None else 0,
        "by_type": by_type,
    }
