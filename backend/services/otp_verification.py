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
<div style="background:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:20px; margin-bottom:25px;">
    <div style="font-size:20px; font-weight:700; color:#92400e; margin-bottom:12px;">Hello, {safe_name}.</div>
    <div style="font-size:15px; line-height:1.75; color:#92400e;">
        You are creating or signing into your ARIA account. Please use the verification code below to complete your sign-in securely.
    </div>
</div>
<div style="background:#f3f4f6; border:1px solid #e5e7eb; border-radius:8px; padding:25px 20px; text-align:center; margin-bottom:25px;">
    <div style="font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">
        USE THIS OTP TO COMPLETE SIGNUP
    </div>
    <div style="font-size:36px; font-weight:700; letter-spacing:8px; color:#2563eb; font-family:'Courier New',Courier,monospace;">
        {safe_code}
    </div>
</div>
<div style="background:#eff6ff; border-left:4px solid #3b82f6; padding:14px 16px; border-radius:6px; font-size:13px; line-height:1.6; color:#1e40af;">
    <strong>Verification notes:</strong><br>
    • This code expires in 10 minutes.<br>
    • Never share this code with anyone.<br>
    • ARIA support will never ask for your OTP.
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
<div style="background:#f3e8ff; border:1px solid #e9d5ff; border-radius:8px; padding:20px; margin-bottom:25px;">
    <div style="font-size:20px; font-weight:700; color:#6b21a8; margin-bottom:12px;">Hello, {safe_name}.</div>
    <div style="font-size:15px; line-height:1.75; color:#6b21a8;">
        Thank you for registering with <strong>ARIA</strong>. Your guest account is now active and ready to use. 
        You can explore our voice-first features instantly.
    </div>
</div>
<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:20px; margin-bottom:25px;">
    <div style="font-size:14px; font-weight:700; color:#166534; margin-bottom:15px;">Guest account details</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#374151; line-height:1.8;">
        <tr><td width="90"><strong>Name:</strong></td><td>{safe_name}</td></tr>
        <tr><td><strong>Company:</strong></td><td>{safe_company}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>{safe_phone}</td></tr>
        <tr><td><strong>Email:</strong></td><td><a href="mailto:{safe_email}" style="color:#166534; text-decoration:underline;">{safe_email}</a></td></tr>
    </table>
</div>
<div style="background:#eff6ff; border-left:4px solid #3b82f6; padding:14px 16px; border-radius:6px; font-size:13px; line-height:1.6; color:#1e40af;">
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
    def account_creation_email(user_name: str, app_url: str) -> str:
        safe_name = escape(user_name)
        body = f"""
<div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:20px; margin-bottom:25px;">
    <div style="font-size:20px; font-weight:700; color:#1e3a8a; margin-bottom:12px;">Welcome to ARIA, {safe_name}!</div>
    <div style="font-size:15px; line-height:1.75; color:#1e40af;">
        Your account has been successfully created and verified. You are now ready to explore the future of voice-first AI.
    </div>
</div>
<div style="background:#eff6ff; border-left:4px solid #3b82f6; padding:14px 16px; border-radius:6px; font-size:13px; line-height:1.6; color:#1e40af;">
    <strong>Next Steps:</strong><br>
    • Start a new voice conversation from your dashboard.<br>
    • Customize your voice preferences in the settings.<br>
    • Experience lightning-fast natural language interactions.
</div>
"""
        return base_email(
            title="Welcome to ARIA",
            subtitle="Your account is fully activated.",
            theme_color="linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            body=body,
            app_url=app_url,
        )

    @staticmethod
    def otp_warning_email(user_name: str, remaining_attempts: int, app_url: str) -> str:
        safe_name = escape(user_name)
        body = f"""
<div style="background:#fee2e2; border:1px solid #fecaca; border-radius:8px; padding:20px; margin-bottom:25px;">
    <div style="font-size:20px; font-weight:700; color:#991b1b; margin-bottom:12px;">Hello, {safe_name}.</div>
    <div style="font-size:15px; line-height:1.75; color:#991b1b;">
        We noticed multiple failed attempts to verify your email address. For your security, please be aware that you have {remaining_attempts} attempts remaining before your sign-in process is locked.
    </div>
</div>
<div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:16px; margin:24px 0;">
    <div style="font-size:13px; color:#991b1b; margin-bottom:8px;"><strong>Security Notice:</strong></div>
    <div style="font-size:12px; line-height:1.6; color:#7f1d1d;">If you did not initiate this sign-in request, please secure your email account immediately.</div>
</div>
"""
        return base_email(
            title="Unusual Sign-in Activity",
            subtitle="Multiple failed OTP verification attempts detected.",
            theme_color="linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
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

    async def send_otp_warning_email(self, email: str, user_name: str, remaining_attempts: int) -> bool:
        html_content = OTPEmailTemplates.otp_warning_email(user_name, remaining_attempts, self.app_url)
        return await mail_service.send_html(
            email,
            "ARIA - Unusual Sign-in Activity",
            html_content,
        )

    async def send_welcome_email(self, email: str, user_name: str) -> bool:
        html_content = OTPEmailTemplates.account_creation_email(user_name, self.app_url)
        return await mail_service.send_html(
            email,
            "Welcome to ARIA",
            html_content,
        )

otp_verification_service = OTPVerificationService()
