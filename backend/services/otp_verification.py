"""ARIA OTP verification service with embedded Python templates."""

from html import escape

import config
from services.mailer import base_email, mail_service


class OTPEmailTemplates:
    """OTP email templates embedded as Python strings."""

    @staticmethod
    def otp_email(user_name: str, otp_code: str, app_url: str) -> str:
        safe_name = escape(user_name)
        safe_code = escape(otp_code)
        body = f"""
<div style="font-size:20px; font-weight:700; color:#f8fbff; margin-bottom:14px;">Hello, {safe_name}.</div>
<div style="font-size:15px; line-height:1.75; color:#c7d5e8; margin-bottom:26px;">
    Use this one-time code to verify your ARIA sign-in. The code is valid for 10 minutes.
</div>
<div style="background:#071426; border:2px solid #38b6ff; border-radius:10px; padding:28px 20px; text-align:center; margin:30px 0;">
    <div style="font-size:12px; color:#9fb3cc; text-transform:uppercase; letter-spacing:1.4px; margin-bottom:12px; font-weight:700;">Your One-Time Code</div>
    <div style="font-size:38px; font-weight:800; letter-spacing:6px; color:#38b6ff; font-family:'Courier New',Courier,monospace; line-height:1.2;">{safe_code}</div>
</div>
<div style="background:#0b2238; border-left:4px solid #38b6ff; padding:14px 16px; border-radius:6px; font-size:13px; line-height:1.6; color:#bfdbfe;">
    Security notice: never share this code. ARIA support will never ask for your OTP.
</div>
<div style="background:#071426; border:1px solid #213a5c; border-radius:8px; padding:16px; margin-top:24px;">
    <div style="font-size:13px; font-weight:700; color:#f8fbff; margin-bottom:10px;">How to use this code</div>
    <ol style="margin:0; padding-left:20px; color:#c7d5e8; font-size:13px; line-height:1.8;">
        <li>Return to the ARIA verification page.</li>
        <li>Enter the code shown above.</li>
        <li>Submit to complete sign-in.</li>
    </ol>
</div>
"""
        return base_email(
            "ARIA - Your OTP Code",
            "Your ARIA one-time verification code.",
            "#2563eb",
            body,
            app_url,
        )

    @staticmethod
    def otp_attempt_warning_email(
        user_name: str,
        remaining_attempts: int,
        app_url: str,
    ) -> str:
        safe_name = escape(user_name)
        body = f"""
<div style="font-size:20px; font-weight:700; color:#f8fbff; margin-bottom:14px;">Security alert for {safe_name}</div>
<div style="font-size:15px; line-height:1.75; color:#c7d5e8; margin-bottom:24px;">
    We detected multiple failed OTP verification attempts on your ARIA account.
</div>
<div style="background:#2a1f0a; border-left:4px solid #f59e0b; padding:15px 16px; border-radius:6px; font-size:14px; line-height:1.6; color:#fde68a;">
    Remaining attempts before temporary lock: <strong>{remaining_attempts}</strong>
</div>
<div style="background:#071426; border:1px solid #213a5c; border-radius:8px; padding:16px; margin-top:24px;">
    <div style="font-size:13px; font-weight:700; color:#f8fbff; margin-bottom:10px;">Recommended actions</div>
    <ul style="margin:0; padding-left:20px; color:#c7d5e8; font-size:13px; line-height:1.8;">
        <li>Use the latest OTP sent to your inbox.</li>
        <li>Request a new OTP if the previous code expired.</li>
        <li>Change your password if this was not you.</li>
    </ul>
</div>
"""
        return base_email(
            "ARIA - OTP Attempt Warning",
            "Security warning for your ARIA account.",
            "#d97706",
            body,
            app_url,
        )


class OTPVerificationService:
    """OTP verification email service."""

    def __init__(self):
        self.app_url = config.APP_URL

    async def send_otp_email(self, email: str, user_name: str, otp_code: str) -> bool:
        html_content = OTPEmailTemplates.otp_email(user_name, otp_code, self.app_url)
        return await mail_service.send_html(
            email,
            "Your ARIA OTP Code",
            html_content,
        )

    async def send_otp_warning_email(
        self,
        email: str,
        user_name: str,
        remaining_attempts: int,
    ) -> bool:
        html_content = OTPEmailTemplates.otp_attempt_warning_email(
            user_name,
            remaining_attempts,
            self.app_url,
        )
        return await mail_service.send_html(
            email,
            "ARIA - OTP Attempt Warning",
            html_content,
        )


otp_verification_service = OTPVerificationService()
