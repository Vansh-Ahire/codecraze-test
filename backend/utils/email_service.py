import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

class EmailService:
    @staticmethod
    def send_otp_email(recipient_email, otp):
        """Sends an OTP email. Falls back to console log if no credentials."""
        subject = "Your ParkMate OTP Verification Code"
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #7c3aed; text-align: center;">🛡️ ParkMate Security</h2>
                <p>Hello,</p>
                <p>To ensure the security of our platform and reduce unauthorized traffic, we require you to verify your booking with the following One-Time Password (OTP):</p>
                
                <div style="background: #f4f4f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">{otp}</span>
                </div>
                
                <p>This code will expire in 10 minutes. Please enter it on the booking page to proceed.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2024 ParkMate. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        # Check if we have credentials
        if not Config.MAIL_USERNAME or not Config.MAIL_PASSWORD:
            print("\n" + "="*50)
            print(f"DEBUG: EMAIL OTP TO {recipient_email}: {otp}")
            print("="*50 + "\n")
            return True

        try:
            msg = MIMEMultipart()
            msg['From'] = Config.MAIL_DEFAULT_SENDER
            msg['To'] = recipient_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))

            server = smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT, timeout=5)
            if Config.MAIL_USE_TLS:
                server.starttls()
            
            server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
            server.send_message(msg)
            server.quit()
            return True
        except smtplib.SMTPException as e:
            print(f"SMTP error: {str(e)}")
            print(f"FALLBACK DEBUG: EMAIL OTP TO {recipient_email}: {otp}")
            return False
        except Exception as e:
            print(f"General email error: {str(e)}")
            print(f"FALLBACK DEBUG: EMAIL OTP TO {recipient_email}: {otp}")
            return False
