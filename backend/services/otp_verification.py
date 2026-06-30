from html import escape
import config
from services.mailer import base_email, mail_service
from utils.logger import get_logger

logger = get_logger(__name__)


class OTPEmailTemplates:
    """Email templates for ARIA, modeled after reference designs."""

    @staticmethod
    def otp_email(user_name: str, otp_code: str, app_url: str) -> str:
        safe_name = escape(user_name)
        safe_code = escape(otp_code)
        body = f"""
<div style="font-size:16px; font-weight:600; margin-bottom:15px; color:#1a1a1a;">Hi {safe_name},</div>
<div style="font-size:15px; color:#4a4a4a; margin-bottom:25px; line-height:1.6;">
    You are creating or signing into your ARIA account. Please use the verification code below to complete your sign-in securely.
</div>

<div style="background:#f4f7fb; border:1px solid #dbeafe; border-radius:8px; padding:25px 20px; text-align:center; margin-bottom:25px;">
    <div style="font-size:11px; font-weight:700; color:#3b82f6; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">
        USE THIS OTP TO COMPLETE SIGNUP
    </div>
    <div style="font-size:36px; font-weight:700; letter-spacing:8px; color:#1e3a8a; font-family:'Courier New',Courier,monospace;">
        {safe_code}
    </div>
</div>

<div style="font-size:14px; color:#6b7280; line-height:1.6;">
    <strong>Verification notes:</strong>
    <ul style="margin-top:8px; padding-left:20px;">
        <li>This code expires in 10 minutes.</li>
        <li>Never share this code with anyone.</li>
        <li>ARIA support will never ask for your OTP.</li>
    </ul>
</div>
"""
        return base_email(
            title="Email verification",
            subtitle="Complete your signup using the OTP below.",
            theme_color="linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            body=body,
            app_url=app_url,
        )

    @staticmethod
    def guest_email(user_name: str, company: str, phone: str, email_addr: str, app_url: str) -> str:
        safe_name = escape(user_name)
        safe_company = escape(company or "N/A")
        safe_phone = escape(phone or "N/A")
        safe_email = escape(email_addr)
        body = f"""
<div style="font-size:16px; font-weight:600; margin-bottom:15px; color:#1a1a1a;">Hi {safe_name},</div>
<div style="font-size:15px; color:#4a4a4a; margin-bottom:25px; line-height:1.6;">
    Thank you for registering with <strong>ARIA</strong>. Your guest account is now active and ready to use. 
    You can explore our voice-first features instantly.
</div>

<div style="border:1px solid #10b981; border-radius:8px; padding:20px; margin-bottom:25px; background:#f0fdf4;">
    <div style="font-size:14px; font-weight:700; color:#065f46; margin-bottom:15px;">Guest account details</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#065f46; line-height:1.8;">
        <tr><td width="90"><strong>Name:</strong></td><td>{safe_name}</td></tr>
        <tr><td><strong>Company:</strong></td><td>{safe_company}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>{safe_phone}</td></tr>
        <tr><td><strong>Email:</strong></td><td><a href="mailto:{safe_email}" style="color:#059669; text-decoration:underline;">{safe_email}</a></td></tr>
    </table>
</div>

<div style="font-size:14px; color:#4a4a4a; line-height:1.6;">
    If you wish to unlock full features, you can convert this guest account into a permanent profile at any time from your dashboard.
</div>
"""
        return base_email(
            title="Guest account confirmation",
            subtitle="Your guest account for ARIA is successfully opened.",
            theme_color="linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
            body=body,
            app_url=app_url,
        )

    @staticmethod
    def feedback_email(user_name: str, email_addr: str, app_url: str) -> str:
        safe_name = escape(user_name)
        safe_email = escape(email_addr)
        body = f"""
<div style="font-size:16px; font-weight:600; margin-bottom:15px; color:#1a1a1a;">Hi {safe_name},</div>

<div style="border:1px solid #fca5a5; background:#fef2f2; border-radius:8px; padding:15px 20px; margin-bottom:20px;">
    <div style="font-size:15px; font-weight:700; color:#991b1b; margin-bottom:8px;">Thank you!</div>
    <div style="font-size:14px; color:#7f1d1d;">Your feedback has been recorded. Our team will use it to improve the platform.</div>
</div>

<div style="border:1px solid #fdba74; background:#fff7ed; border-radius:8px; padding:15px 20px; margin-bottom:25px;">
    <div style="font-size:14px; font-weight:700; color:#9a3412; margin-bottom:10px;">Submitted details</div>
    <div style="font-size:14px; color:#7c2d12; line-height:1.8;">
        <strong>Name:</strong> {safe_name}<br>
        <strong>Email:</strong> <a href="mailto:{safe_email}" style="color:#c2410c; text-decoration:underline;">{safe_email}</a>
    </div>
</div>

<div style="font-size:15px; font-weight:700; color:#1a1a1a; margin-bottom:10px;">What happens next</div>
<ul style="font-size:14px; color:#4a4a4a; line-height:1.6; margin-top:0; padding-left:20px; margin-bottom:25px;">
    <li style="margin-bottom:6px;">Our team reviews your notes and prioritizes improvements.</li>
    <li>If we need more context, we may contact you.</li>
</ul>

<div style="font-size:14px; color:#4a4a4a;">
    Thank you,<br>
    <strong>ARIA Team</strong>
</div>
"""
        return base_email(
            title="Feedback received",
            subtitle="We have received your feedback submission.",
            theme_color="linear-gradient(135deg, #7f1d1d 0%, #ea580c 100%)",
            body=body,
            app_url=app_url,
        )


class OTPVerificationService:
    """OTP verification email service."""

    def __init__(self):
        self.app_url = config.APP_URL

    async def send_otp_email(self, email: str, user_name: str, otp_code: str) -> bool:
        html_content = OTPEmailTemplates.otp_email(user_name, otp_code, self.app_url)
        return await mail_service.send_html(
            email,
            "ARIA - Email verification",
            html_content,
        )

    async def send_guest_email(self, email: str, user_name: str, company: str = "", phone: str = "") -> bool:
        html_content = OTPEmailTemplates.guest_email(user_name, company, phone, email, self.app_url)
        return await mail_service.send_html(
            email,
            "ARIA - Guest account confirmation",
            html_content,
        )


otp_verification_service = OTPVerificationService()
