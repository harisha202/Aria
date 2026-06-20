"""
ARIA email verification service.

All email templates are embedded in Python so no external template files are
required.
"""

import asyncio
import os
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

if load_dotenv:
    load_dotenv()


class EmailTemplates:
    """All email verification templates embedded as Python strings."""

    @staticmethod
    def verification_email(user_name: str, verification_link: str, app_url: str) -> str:
        """Email verification template."""
        year = datetime.now().year
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARIA - Verify Your Email</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0;">
    <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 40px 20px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 2px; color: white; margin-bottom: 8px;">🎙️ ARIA</div>
            <div style="font-size: 12px; color: #e0e7ff; letter-spacing: 1px; text-transform: uppercase;">Where Silence Finds Its Voice</div>
        </div>

        <div style="padding: 40px 30px;">
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 15px; color: #f1f5f9;">Hello, {user_name}! 👋</div>
            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; margin-bottom: 30px;">
                Thank you for signing up to ARIA! To complete your account setup and unlock all features, please verify your email address by clicking the button below.
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="{verification_link}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    ✓ Verify Email Address
                </a>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">Or copy this link if button doesn't work:</p>
                <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">{verification_link}</p>
            </div>

            <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px; font-size: 13px; color: #bfdbfe;">
                <strong>🔒 Security Note:</strong> This link expires in 24 hours. If you didn't create an ARIA account, please ignore this email.
            </div>

            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; margin-bottom: 20px;">Once verified, you can:</div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <ul style="list-style: none; margin: 0; padding: 0;">
                    <li style="margin-bottom: 8px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0;">✓</span>Start chatting with ARIA</li>
                    <li style="margin-bottom: 8px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0;">✓</span>Use voice input and commands</li>
                    <li style="margin-bottom: 8px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0;">✓</span>Access your conversation history</li>
                    <li style="padding-left: 20px; position: relative;"><span style="position: absolute; left: 0;">✓</span>Customize your preferences</li>
                </ul>
            </div>

            <div style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
                Questions? <a href="{app_url}/support" style="color: #3b82f6; text-decoration: none;">Contact support</a>
            </div>
        </div>

        <div style="background: #0f172a; padding: 20px 30px; text-align: center; border-top: 1px solid #334155;">
            <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                © {year} ARIA. All rights reserved.<br>
                <a href="{app_url}/privacy" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                <a href="{app_url}/terms" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>
        """

    @staticmethod
    def verified_confirmation_email(user_name: str, app_url: str) -> str:
        """Email verified confirmation template."""
        year = datetime.now().year
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARIA - Email Verified</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0;">
    <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 2px; color: white; margin-bottom: 8px;">🎙️ ARIA</div>
            <div style="font-size: 12px; color: #d1fae5; letter-spacing: 1px; text-transform: uppercase;">Email Verified!</div>
        </div>

        <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 50px; margin-bottom: 15px;">✓</div>
                <div style="font-size: 24px; font-weight: 600; color: #10b981; margin-bottom: 10px;">Email Verified Successfully!</div>
            </div>

            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; text-align: center; margin-bottom: 30px;">
                Welcome to ARIA, {user_name}! Your email has been verified and your account is fully activated.
            </div>

            <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <div style="font-size: 16px; font-weight: 600; color: #10b981; margin-bottom: 15px;">You're all set!</div>
                <ul style="list-style: none; margin: 0; padding: 0;">
                    <li style="margin-bottom: 10px; font-size: 13px; color: #cbd5e1;">✓ Account is fully activated</li>
                    <li style="margin-bottom: 10px; font-size: 13px; color: #cbd5e1;">✓ You can now start chatting</li>
                    <li style="font-size: 13px; color: #cbd5e1;">✓ All features are unlocked</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{app_url}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    Go to Dashboard
                </a>
            </div>

            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; text-align: center;">
                Start exploring ARIA's voice-first interface and unlock the power of AI conversations.
            </div>
        </div>

        <div style="background: #0f172a; padding: 20px 30px; text-align: center; border-top: 1px solid #334155;">
            <div style="font-size: 12px; color: #64748b; line-height: 1.6;">© {year} ARIA. All rights reserved.</div>
        </div>
    </div>
</body>
</html>
        """


class EmailVerificationService:
    """Email verification service."""

    def __init__(self):
        self.sender_email = os.getenv("SMTP_EMAIL", "noreply@aria.ai")
        self.sender_password = os.getenv("SMTP_PASSWORD")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.app_url = os.getenv("APP_URL", "http://localhost:5173")

    async def send_verification_email(
        self,
        email: str,
        user_name: str,
        verification_token: str,
    ) -> bool:
        """Send an email verification link."""
        try:
            verification_link = f"{self.app_url}/verify-email?token={verification_token}"
            html_content = EmailTemplates.verification_email(
                user_name,
                verification_link,
                self.app_url,
            )
            return await self._send_email(
                email,
                "Verify Your ARIA Email Address",
                html_content,
            )
        except Exception as exc:
            print(f"Error sending verification email: {exc}")
            return False

    async def send_verified_confirmation(self, email: str, user_name: str) -> bool:
        """Send confirmation that the user's email is verified."""
        try:
            html_content = EmailTemplates.verified_confirmation_email(
                user_name,
                self.app_url,
            )
            return await self._send_email(
                email,
                "Email Verified - Welcome to ARIA!",
                html_content,
            )
        except Exception as exc:
            print(f"Error sending verified confirmation: {exc}")
            return False

    async def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send an email via SMTP without blocking the event loop."""
        try:
            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(
                None,
                self._send_email_sync,
                to_email,
                subject,
                html_content,
            )
        except Exception as exc:
            print(f"Error in async email send: {exc}")
            return False

    def _send_email_sync(self, to_email: str, subject: str, html_content: str) -> bool:
        """Synchronous email sending."""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.sender_email
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)

            print(f"Email sent successfully to {to_email}")
            return True
        except Exception as exc:
            print(f"Failed to send email: {exc}")
            return False


email_verification_service = EmailVerificationService()
