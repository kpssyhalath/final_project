import smtplib
import dns.resolver
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import requests

from utils.format_data import unescape_html
from utils.xlsx import edit_excel_file
from api.tracker import get_status_counts, get_result_by_target_id, update_status_counts
from api.models import db, Target

# path = "/home/souliyasavatdee/Phishing_Project/backend/result"
path = "/Users/souliya/Desktop/Project Phishing/backend/result/"

def verify_email_smtp(email, domain_mx_records):
    try:
        mx_record = domain_mx_records.get(email.split("@")[1])
        if not mx_record:
            return False
        
        server = smtplib.SMTP()
        server.set_debuglevel(0)
        server.connect(mx_record)
        server.helo(server.local_hostname)

        server.mail("some@gmail.com")
        code, message = server.rcpt(email)
        server.quit()

        return code == 250

    except Exception as e:
        print(f"SMTP verification failed for {email}: {e}")
        return False


def verify_email(email):
    url = f"https://api.getprospect.com/public/v1/email/verify?email={email}"

    headers = {
        "accept": "application/json",
        "apiKey": "d8132111-c22c-4b6b-8ab1-2d85c8c7e3c"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  
        data = response.json()
        
        if data.get("status") == "valid":
            return True
        else:
            return False
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return False

def read_file(file_path):
    """Read and return the content of the HTML template file."""
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

def create_email_message(subject, sender_email, receiver_email, html_content):
    """Create an email message with the provided HTML content."""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg.attach(MIMEText(html_content, 'html'))
    return msg

def send_email(sender_email, message, server):
    """Send an email using the specified SMTP server and credentials."""
    try:
        server.sendmail(sender_email, message['To'], message.as_string())
    except Exception as e:
        print(f"Error: {e}")

def get_domain_mx_records(target_list):
    domain_mx_records = {}
    for recipient in target_list:
        domain = recipient['email'].split('@')[1]
        if domain not in domain_mx_records:
            try:
                records = dns.resolver.resolve(domain, "MX")
                mx_records = records[0].exchange
                domain_mx_records[domain] = str(mx_records)
            except Exception as e:
                print(f"Could not find MX record for domain {domain}: {e}")
    return domain_mx_records

def send_emails(subject, sender_email, sender_password, SMTP_SERVER, SMTP_PORT, target_list, email_template, file_path):
    if not isinstance(target_list, list):
        return

    # email_template = unescape_html(email_template)

    domain_mx_records = get_domain_mx_records(target_list)
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(sender_email, sender_password)
    
    try:
        for recipient in target_list:
            receiver_email = recipient['email']
            user_id = recipient['user_id']


            db_result = get_result_by_target_id(user_id)
            
            if not verify_email_smtp(receiver_email, domain_mx_records):
            # if not verify_email(receiver_email):
                counts = get_status_counts(db_result.status)
                db_result.status = update_status_counts(counts, 5)

                db_target = db.session.query(Target).filter_by(id=user_id).first()
                db_target.status = "Error"
                db.session.commit()

                edit_excel_file(file_path, receiver_email, 8, char="✗")
            else:
                counts = get_status_counts(db_result.status)
                db_result.status = update_status_counts(counts, 1)
                db.session.commit()

                email_personalized_content = email_template.replace('[someone@example.com]', receiver_email).replace('[userid]', str(user_id))
                message = create_email_message(subject, sender_email, receiver_email, email_personalized_content)
                send_email(sender_email, message, server)
    finally:
        server.quit()
