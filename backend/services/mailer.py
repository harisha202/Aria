import asyncio
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape

import config
from utils.logger import get_logger

logger = get_logger(__name__)


def current_year() -> int:
    return datetime.now().year


def aria_logo() -> str:
    return """
<div style="display:inline-block; width:44px; height:44px; border-radius:10px; background:#071426; border:1px solid #245d82; box-shadow:0 0 15px rgba(56,182,255,0.4); margin-bottom:12px;">
    <div style="height:44px; line-height:44px; text-align:center; font-size:20px; font-weight:800; color:#38b6ff; font-family:-apple-system,BlinkMacSystemFont,sans-serif;">A</div>
</div>
"""


def base_email(title: str, subtitle: str, theme_color: str, body: str, app_url: str) -> str:
    """
    Light-themed, card-based email template modeled after the reference designs.
    The header is a bold colored rounded rectangle, and the body sits on a soft off-white background.
    """
    safe_app_url = escape(app_url.rstrip("/"))
    year = current_year()
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(title)}</title>
</head>
<body style="margin:0; padding:0; font-family:system-ui, -apple-system, sans-serif; background:#f9f5f0; color:#1a1a1a;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; line-height:1px; font-size:1px;">{escape(subtitle)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9f5f0; padding:40px 15px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
                    <!-- Colored Header Banner -->
                    <tr>
                        <td style="background:{theme_color}; padding:35px 40px; color:#ffffff; border-top-left-radius:12px; border-top-right-radius:12px;">
                            {aria_logo()}
                            <div style="font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; opacity:0.9;">ARIA</div>
                            <div style="font-size:28px; font-weight:700; letter-spacing:0.5px;">{escape(title)}</div>
                            <div style="margin-top:8px; font-size:14px; opacity:0.9; line-height:1.5;">{escape(subtitle)}</div>
                        </td>
                    </tr>
                    <!-- Main Content Body -->
                    <tr>
                        <td style="padding:40px;">
                            {body}
                            
                            <div style="margin-top:40px; padding-top:20px; border-top:1px solid #eaeaea; font-size:14px; color:#666666; line-height:1.6;">
                                Thank you for exploring the future of voice AI with us.<br>
                                <strong style="color:#1a1a1a;">With regards, ARIA</strong>
                            </div>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding:30px 40px; background:#fafafa; border-top:1px solid #eeeeee;">
                            <div style="font-size:12px; color:#888888; line-height:1.6;">
                                Copyright {year} ARIA. All rights reserved.<br>
                                <a href="{safe_app_url}/support" style="color:#666666; text-decoration:underline; margin:0 5px;">Support</a>
                                <a href="{safe_app_url}/privacy" style="color:#666666; text-decoration:underline; margin:0 5px;">Privacy</a>
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
            logger.error("Async email dispatch error for %s: %s", to_email, exc, exc_info=True)
            return False

    def _send_html_sync(self, to_email: str, subject: str, html_content: str) -> bool:
        if not self.smtp_host or not self.smtp_password:
            logger.warning("SMTP is not configured. Skipped sending to %s", to_email)
            return False

        try:
            msg = MIMEText(html_content, "html", "utf-8")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user:
                    server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info("Email sent successfully to %s", to_email)
            return True
        except Exception as exc:
            logger.error("Failed to send email to %s: %s", to_email, exc, exc_info=True)
            return False


mail_service = MailService()
