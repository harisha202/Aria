"""Shared ARIA email helpers."""

import asyncio
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape

import config


def current_year() -> int:
    return datetime.now().year


def aria_logo() -> str:
    """Small HTML/CSS logo that works without external image assets."""
    return """
<div style="display:inline-block; width:76px; height:76px; border-radius:22px; background:#071426; border:1px solid #245d82; box-shadow:0 0 28px #12334a; margin-bottom:18px;">
    <div style="height:76px; line-height:76px; text-align:center; font-size:26px; font-weight:800; letter-spacing:1px; color:#38b6ff;">A</div>
</div>
"""


def base_email(title: str, subtitle: str, accent: str, body: str, app_url: str) -> str:
    year = current_year()
    safe_app_url = escape(app_url.rstrip("/"))
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(title)}</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; background:#07111f; color:#e5edf7;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; line-height:1px; font-size:1px;">{escape(subtitle)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07111f; padding:28px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; max-width:620px; background:#0d1b2e; border:1px solid #1f3553; border-radius:14px; overflow:hidden;">
                    <tr>
                        <td align="center" style="padding:38px 26px; background:linear-gradient(135deg,#0b1d35 0%,{accent} 100%);">
                            {aria_logo()}
                            <div style="font-size:30px; font-weight:800; letter-spacing:3px; color:#ffffff;">ARIA</div>
                            <div style="margin-top:8px; font-size:12px; color:#dbeafe; letter-spacing:1.8px; text-transform:uppercase;">Where Silence Finds Its Voice</div>
                            <div style="margin:14px auto 0; max-width:360px; font-size:14px; line-height:1.6; color:#e5edf7;">
                                Your calm voice-first AI companion for secure conversations, thoughtful replies, and effortless follow-through.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 30px;">
                            {body}
                            <div style="margin-top:30px; padding-top:22px; border-top:1px solid #213a5c; font-size:14px; line-height:1.7; color:#c7d5e8;">
                                <div>Thank you,</div>
                                <div style="font-weight:700; color:#f8fbff;">With regards, ARIA</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="background:#081321; border-top:1px solid #1f3553; padding:20px 30px;">
                            <div style="font-size:12px; line-height:1.7; color:#91a4bd;">
                                Copyright {year} ARIA. All rights reserved.<br>
                                <a href="{safe_app_url}/support" style="color:#38b6ff; text-decoration:none; margin:0 8px;">Support</a>
                                <a href="{safe_app_url}/privacy" style="color:#38b6ff; text-decoration:none; margin:0 8px;">Privacy</a>
                                <a href="{safe_app_url}/terms" style="color:#38b6ff; text-decoration:none; margin:0 8px;">Terms</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""


class MailService:
    """SMTP mail sender used by ARIA notification services."""

    def __init__(self):
        self.smtp_host = config.SMTP_HOST
        self.smtp_port = config.SMTP_PORT
        self.smtp_user = config.SMTP_USER
        self.smtp_password = config.SMTP_PASSWORD
        self.from_email = config.FROM_EMAIL

    async def send_html(self, to_email: str, subject: str, html_content: str) -> bool:
        try:
            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(
                None,
                self._send_html_sync,
                to_email,
                subject,
                html_content,
            )
        except Exception as exc:
            print(f"Error sending email asynchronously: {exc}")
            return False

    def _send_html_sync(self, to_email: str, subject: str, html_content: str) -> bool:
        if not self.smtp_host or not self.smtp_password:
            print("SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and FROM_EMAIL.")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user:
                    server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            print(f"Email sent successfully to {to_email}")
            return True
        except Exception as exc:
            print(f"Failed to send email to {to_email}: {exc}")
            return False


mail_service = MailService()
