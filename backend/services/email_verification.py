"""ARIA email verification service with embedded Python templates."""

from html import escape

import config
from services.mailer import base_email, mail_service


class EmailTemplates:
    """Account email templates embedded as Python strings."""

    @staticmethod
    def verification_email(user_name: str, verification_link: str, app_url: str) -> str:
        safe_name = escape(user_name)
        safe_link = escape(verification_link)
        body = f"""
<div style="font-size:20px; font-weight:700; color:#f8fbff; margin-bottom:14px;">Hello, {safe_name}.</div>
<div style="font-size:15px; line-height:1.75; color:#c7d5e8; margin-bottom:26px;">
    Thank you for signing up to ARIA. Verify your email address to finish setting up your account and unlock chat, voice input, conversation history, and preferences.
</div>
<div style="text-align:center; margin:34px 0;">
    <a href="{safe_link}" style="display:inline-block; background:linear-gradient(135deg,#2563eb 0%,#06b6d4 100%); color:#ffffff; padding:14px 34px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">
        Verify Email Address
    </a>
</div>
<div style="background:#071426; border:1px solid #213a5c; border-radius:8px; padding:16px; margin:24px 0;">
    <div style="font-size:13px; color:#9fb3cc; margin-bottom:8px;">If the button does not work, copy this link:</div>
    <div style="font-size:12px; line-height:1.6; color:#38b6ff; word-break:break-all;">{safe_link}</div>
</div>
<div style="background:#0b2238; border-left:4px solid #38b6ff; padding:14px 16px; border-radius:6px; font-size:13px; line-height:1.6; color:#bfdbfe;">
    Security note: this verification link is intended for your account only. If you did not create an ARIA account, you can ignore this email.
</div>
"""
        return base_email(
            "ARIA - Verify Your Email",
            "Verify your ARIA account email address.",
            "#0ea5e9",
            body,
            app_url,
        )

    @staticmethod
    def verified_confirmation_email(user_name: str, app_url: str) -> str:
        safe_name = escape(user_name)
        body = f"""
<div style="text-align:center; margin-bottom:28px;">
    <div style="display:inline-block; border:1px solid #2f8f58; background:#0f2b21; color:#86efac; border-radius:999px; padding:8px 14px; font-size:13px; font-weight:700;">Email Verified</div>
</div>
<div style="font-size:22px; font-weight:800; color:#f8fbff; text-align:center; margin-bottom:14px;">Welcome to ARIA, {safe_name}.</div>
<div style="font-size:15px; line-height:1.75; color:#c7d5e8; text-align:center; margin-bottom:28px;">
    Your email has been verified and your account is active. You can now continue into ARIA's voice-first chat experience.
</div>
<div style="text-align:center; margin:32px 0;">
    <a href="{app_url}/dashboard" style="display:inline-block; background:linear-gradient(135deg,#2563eb 0%,#06b6d4 100%); color:#ffffff; padding:14px 34px; border-radius:8px; text-decoration:none; font-weight:700;">
        Go to Dashboard
    </a>
</div>
"""
        return base_email(
            "ARIA - Email Verified",
            "Your ARIA email address is verified.",
            "#16a34a",
            body,
            app_url,
        )


class EmailVerificationService:
    """Email verification service."""

    def __init__(self):
        self.app_url = config.APP_URL

    async def send_verification_email(
        self,
        email: str,
        user_name: str,
        verification_token: str,
    ) -> bool:
        verification_link = f"{self.app_url}/verify-email?token={verification_token}"
        html_content = EmailTemplates.verification_email(
            user_name,
            verification_link,
            self.app_url,
        )
        return await mail_service.send_html(
            email,
            "Verify Your ARIA Email Address",
            html_content,
        )

    async def send_verified_confirmation(self, email: str, user_name: str) -> bool:
        html_content = EmailTemplates.verified_confirmation_email(
            user_name,
            self.app_url,
        )
        return await mail_service.send_html(
            email,
            "Email Verified - Welcome to ARIA",
            html_content,
        )


email_verification_service = EmailVerificationService()
