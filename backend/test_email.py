import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv(".env")

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
FROM_EMAIL = os.environ.get("FROM_EMAIL", SMTP_USER)

to_email = "harisha79041@gmail.com"

msg = MIMEText("This is a simple plain text test to see if emails arrive.", "plain", "utf-8")
msg["Subject"] = "ARIA - Test Delivery"
msg["From"] = FROM_EMAIL
msg["To"] = to_email

print("Sending test email...")
try:
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.set_debuglevel(1)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
    print("Sent successfully!")
except Exception as e:
    print(f"Error: {e}")
