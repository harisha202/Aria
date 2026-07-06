"""ARIA feedback email service."""

from html import escape
from typing import Optional

import config
from services.mailer import base_email, mail_service


class FeedbackEmailTemplates:
    """Feedback email templates embedded as Python strings."""

    @staticmethod
    def feedback_to_team(
        user_name: str,
        user_email: str,
        message: str,
        feedback_type: str,
        rating: Optional[int],
        app_url: str,
    ) -> str:
        safe_name = escape(user_name)
        safe_email = escape(user_email)
        safe_message = escape(message).replace("\n", "<br>")
        safe_type = escape(feedback_type)
        rating_line = (
            f"<div style=\"font-size:14px; color:#c7d5e8; margin-bottom:10px;\"><strong>Rating:</strong> {rating}/5</div>"
            if rating is not None
            else ""
        )
        body = f"""
<div style="font-size:20px; font-weight:700; color:#f8fbff; margin-bottom:14px;">New ARIA feedback</div>
<div style="background:#071426; border:1px solid #213a5c; border-radius:8px; padding:16px; margin:18px 0 22px;">
    <div style="font-size:14px; color:#c7d5e8; margin-bottom:10px;"><strong>Name:</strong> {safe_name}</div>
    <div style="font-size:14px; color:#c7d5e8; margin-bottom:10px;"><strong>Email:</strong> {safe_email}</div>
</div>
<div style="background:#071426; border:1px solid #213a5c; border-radius:8px; padding:18px; margin-top:22px;">
    <div style="font-size:15px; line-height:1.7; color:#f8fbff;">{safe_message}</div>
</div>
"""
        return base_email(
            "ARIA - New Feedback",
            "A user sent feedback to ARIA.",
            "#7c3aed",
            body,
            app_url,
        )

    @staticmethod
    def feedback_confirmation(
        user_name: str,
        message: str,
        feedback_type: str,
        rating: Optional[int],
        app_url: str,
    ) -> str:
        safe_name = escape(user_name)
        safe_message = escape(message).replace("\n", "<br>")
        safe_type = escape(feedback_type)
        rating_text = f"{rating}/5" if rating else "Not rated"
        body = f"""
<div style="font-size:20px; font-weight:700; color:#f8fbff; margin-bottom:14px;">Thanks, {safe_name}.</div>
<div style="font-size:15px; line-height:1.75; color:#c7d5e8; margin-bottom:24px;">
    Your feedback reached the ARIA team. We read every note because it helps shape a better voice-first assistant.
</div>
<div style="background:#071426; border:1px solid #213a5c; border-radius:8px; padding:18px;">
    <div style="font-size:14px; line-height:1.7; color:#c7d5e8;">{safe_message}</div>
</div>
"""
        return base_email(
            "ARIA - Feedback Received",
            "ARIA received your feedback.",
            "#0ea5e9",
            body,
            app_url,
        )


class FeedbackService:
    """Send feedback notifications and acknowledgements."""

    def __init__(self):
        self.app_url = config.APP_URL
        self.feedback_email = config.FEEDBACK_EMAIL

    async def send_feedback(
        self,
        user_name: str,
        user_email: str,
        message: str,
        feedback_type: str = "general",
        rating: Optional[int] = None,
        send_confirmation: bool = True,
    ) -> bool:
        team_html = FeedbackEmailTemplates.feedback_to_team(
            user_name,
            user_email,
            message,
            feedback_type,
            rating,
            self.app_url,
        )
        team_sent = await mail_service.send_html(
            self.feedback_email,
            "ARIA Feedback",
            team_html,
        )

        if send_confirmation:
            confirmation_html = FeedbackEmailTemplates.feedback_confirmation(
                user_name,
                message,
                feedback_type,
                rating,
                self.app_url,
            )
            await mail_service.send_html(
                user_email,
                "ARIA received your feedback",
                confirmation_html,
            )

        return team_sent


feedback_service = FeedbackService()
