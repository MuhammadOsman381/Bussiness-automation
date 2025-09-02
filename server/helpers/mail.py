import smtplib
from email.message import EmailMessage
import os


def send_result_email(to_email: str, company_name: str, status: str, booking_url: str):
    msg = EmailMessage()
    msg["From"] = "mosman257@gmail.com"
    msg["To"] = to_email

    if status.lower() == "pass":
        msg["Subject"] = f"🎉 Congratulations from {company_name}!"
        msg.set_content(
            f"Congratulations! {company_name} is excited to move forward with you."
        )
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #4CAF50;">Congratulations!</h2>
                <p>We're thrilled to inform you that you have successfully passed the interview at <strong>{company_name}</strong>.</p>
                <p>Our team will reach out to you with the next steps shortly.</p>
                
                <p>
                In the meantime, please book a slot for your next interview or onboarding by clicking the link below:
                </p>

                <p>
                👉 <a href="{booking_url}" style="color: #2196F3; font-weight: bold;" target="_blank">
                    Click here to book your slot
                </a>
                </p>
                
                <br>
                <p>Best regards,<br>{company_name} Team</p>
            </body>
            </html>
        """
    else:
        msg["Subject"] = f"Thank You – {company_name} Interview Update"
        msg.set_content(f"Thank you for interviewing with {company_name}.")
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #d9534f;">Thank You for Your Time</h2>
                <p>We appreciate you taking the time to interview with <strong>{company_name}</strong>.</p>
                <p>Unfortunately, we will not be moving forward at this time, but we truly value your interest and effort.</p>
                <p>We encourage you to apply again in the future and wish you the best in your job search.</p>
                <br>
                <p>Sincerely,<br>{company_name} Hiring Team</p>
            </body>
        </html>
        """

    msg.add_alternative(html, subtype="html")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login("mosman257@gmail.com", os.environ.get("STMP_APP_PASSWORD"))
        smtp.send_message(msg)
