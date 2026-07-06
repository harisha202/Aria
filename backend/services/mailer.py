import asyncio
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
from html import escape

import config
from utils.logger import get_logger

logger = get_logger(__name__)


def current_year() -> int:
    return datetime.now().year


def aria_logo(app_url: str) -> str:
    # Bulletproof text logo that renders perfectly in every email client on earth
    return f"""
<table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:15px;">
    <tr>
        <td style="background-color:#ffffff; padding:6px 14px; border-radius:8px;">
            <div style="font-size:24px; font-weight:900; color:#7c3aed; font-family:Arial, sans-serif; letter-spacing:1px; margin:0;">ARIA</div>
        </td>
    </tr>
</table>
"""


def base_email(title: str, subtitle: str, theme_color: str, body: str, app_url: str) -> str:
    """
    Light-themed, card-based email template modeled after the reference designs.
    The header is a bold colored rounded rectangle, and the body sits on a soft off-white background.
    """
    # Prevent localhost links in emails as they trigger Google spam filters
    if "localhost" in app_url or "127.0.0.1" in app_url:
        safe_app_url = "https://aria-app.dev"
    else:
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
                            {aria_logo(app_url)}
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
            msg = MIMEMultipart('alternative')
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email
            msg["Date"] = formatdate(localtime=True)
            msg["Message-ID"] = make_msgid()

            # Create plain text fallback (strip simple HTML tags)
            text_content = html_content.replace("<br>", "\n").replace("</div>", "\n").replace("</p>", "\n")
            import re
            text_content = re.sub(r'<[^>]+>', '', text_content)
            
            part1 = MIMEText(text_content, "plain", "utf-8")
            part2 = MIMEText(html_content, "html", "utf-8")
            
            msg.attach(part1)
            msg.attach(part2)

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
