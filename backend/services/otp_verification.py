"""
ARIA OTP verification service.

All OTP email templates are embedded in Python.
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


class OTPEmailTemplates:
    """All OTP email templates embedded as Python strings."""

    @staticmethod
    def otp_email(user_name: str, otp_code: str, app_url: str) -> str:
        """OTP verification email template."""
        year = datetime.now().year
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARIA - Your OTP Code</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0;">
    <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 2px; color: white; margin-bottom: 8px;">🎙️ ARIA</div>
            <div style="font-size: 12px; color: #e0e7ff; letter-spacing: 1px; text-transform: uppercase;">Where Silence Finds Its Voice</div>
        </div>

        <div style="padding: 40px 30px;">
            <div style="font-size: 18px; margin-bottom: 20px; color: #f1f5f9;">Hello, {user_name}!</div>
            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; margin-bottom: 30px;">
                We received a request to sign in to your ARIA account. Use the one-time code below to verify your identity and secure your account.
            </div>

            <div style="background: #0f172a; border: 2px solid #3b82f6; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-weight: 600;">Your One-Time Code</div>
                <div style="font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #3b82f6; font-family: 'Courier New', monospace; margin-bottom: 15px;">{otp_code}</div>
                <div style="font-size: 12px; color: #f87171;">⏱️ Valid for 10 minutes</div>
            </div>

            <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px; font-size: 13px; color: #bfdbfe;">
                <strong>🔒 Security Notice:</strong> Never share this code with anyone. ARIA staff will never ask for your OTP. If you didn't request this code, please ignore this email and change your password immediately.
            </div>

            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; margin-bottom: 20px;">
                If you're having trouble, visit our help center or contact support.
            </div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-bottom: 10px;">How to use this code:</div>
                <ol style="margin: 0; padding: 0 0 0 20px; font-size: 13px; color: #cbd5e1;">
                    <li style="margin-bottom: 8px;">Go back to ARIA login page</li>
                    <li style="margin-bottom: 8px;">Paste or type this code: <strong>{otp_code}</strong></li>
                    <li>Click "Verify" to complete sign-in</li>
                </ol>
            </div>

            <div style="font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 20px;">
                This is an automated message from ARIA. Please do not reply to this email.
            </div>
        </div>

        <div style="background: #0f172a; padding: 20px 30px; text-align: center; border-top: 1px solid #334155;">
            <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                © {year} ARIA. All rights reserved.<br>
                Building the future of voice intelligence.
            </div>
            <div style="margin-top: 15px;">
                <a href="{app_url}/support" style="color: #3b82f6; text-decoration: none; margin: 0 10px; font-size: 12px;">Support</a>
                <a href="{app_url}/privacy" style="color: #3b82f6; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy</a>
                <a href="{app_url}/terms" style="color: #3b82f6; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms</a>
            </div>
        </div>
    </div>
</body>
</html>
        """

    @staticmethod
    def otp_attempt_warning_email(
        user_name: str,
        remaining_attempts: int,
        app_url: str,
    ) -> str:
        """Warning email for failed OTP attempts."""
        year = datetime.now().year
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARIA - OTP Attempt Warning</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0;">
    <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 2px; color: white; margin-bottom: 8px;">🎙️ ARIA</div>
            <div style="font-size: 12px; color: #fef3c7; letter-spacing: 1px; text-transform: uppercase;">Security Alert</div>
        </div>

        <div style="padding: 40px 30px;">
            <div style="font-size: 18px; margin-bottom: 20px; color: #f1f5f9;">Alert: Multiple Failed OTP Attempts</div>
            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; margin-bottom: 20px;">Hello {user_name},</div>

            <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #fcd34d;">
                <strong>⚠️ Security Warning:</strong> We detected multiple failed OTP verification attempts on your account. {remaining_attempts} attempt(s) remaining before your account is temporarily locked.
            </div>

            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; margin-bottom: 20px;"><strong>What to do:</strong></div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <ul style="list-style: none; margin: 0; padding: 0;">
                    <li style="margin-bottom: 10px; font-size: 13px; color: #cbd5e1;">✓ Check your email for the correct OTP code</li>
                    <li style="margin-bottom: 10px; font-size: 13px; color: #cbd5e1;">✓ Make sure you're using the most recent OTP sent</li>
                    <li style="margin-bottom: 10px; font-size: 13px; color: #cbd5e1;">✓ Request a new OTP if the code has expired</li>
                    <li style="font-size: 13px; color: #cbd5e1;">✓ If this wasn't you, change your password immediately</li>
                </ul>
            </div>

            <div style="font-size: 14px; line-height: 1.8; color: #cbd5e1; margin-bottom: 20px;">
                If you need help, <a href="{app_url}/support" style="color: #3b82f6; text-decoration: none;">contact support</a> or <a href="{app_url}/reset-password" style="color: #3b82f6; text-decoration: none;">reset your password</a>.
            </div>
        </div>

        <div style="background: #0f172a; padding: 20px 30px; text-align: center; border-top: 1px solid #334155;">
            <div style="font-size: 12px; color: #64748b; line-height: 1.6;">© {year} ARIA. All rights reserved.</div>
        </div>
    </div>
</body>
</html>
        """


class OTPVerificationService:
    """OTP verification email service."""

    def __init__(self):
        self.sender_email = os.getenv("SMTP_EMAIL", "noreply@aria.ai")
        self.sender_password = os.getenv("SMTP_PASSWORD")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.app_url = os.getenv("APP_URL", "http://localhost:5173")

    async def send_otp_email(self, email: str, user_name: str, otp_code: str) -> bool:
        """Send an OTP verification email."""
        try:
            html_content = OTPEmailTemplates.otp_email(user_name, otp_code, self.app_url)
            return await self._send_email(
                email,
                f"Your ARIA OTP Code: {otp_code}",
                html_content,
            )
        except Exception as exc:
            print(f"Error sending OTP email: {exc}")
            return False

    async def send_otp_warning_email(
        self,
        email: str,
        user_name: str,
        remaining_attempts: int,
    ) -> bool:
        """Send warning email for failed OTP attempts."""
        try:
            html_content = OTPEmailTemplates.otp_attempt_warning_email(
                user_name,
                remaining_attempts,
                self.app_url,
            )
            return await self._send_email(
                email,
                "ARIA - OTP Attempt Warning",
                html_content,
            )
        except Exception as exc:
            print(f"Error sending OTP warning email: {exc}")
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

            print(f"OTP email sent successfully to {to_email}")
            return True
        except Exception as exc:
            print(f"Failed to send OTP email: {exc}")
            return False


otp_verification_service = OTPVerificationService()
