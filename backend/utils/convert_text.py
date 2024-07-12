
import re
from bs4 import BeautifulSoup
# import html
# from utils.format_data import escape_html

def text_to_html(text_content):
    lines = text_content.strip().split('\n')
    first_line = f"<h1>{(lines[0])}</h1>"
    remaining_lines = "".join(f"<p>{(line)}</p>" for line in lines[1:])
    

    html_content = f"""
    <html><body>{first_line}{remaining_lines}<img src="http://127.0.0.1:5000/tracker/open?id=[userid]" alt="" /></body></html>
    """
    url = f"http://127.0.0.1:5000/tracker/click?id=[userid]"
    html_content = re.sub(r'Click Here', f'<a style="text-decoration:none" href="{url}">Click Here</a>', html_content, flags=re.IGNORECASE)
    
    # html_content = escape_html(html_content)
    
    return html_content


def html_to_text(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')

    # Find all text nodes and preserve their content
    lines = []
    for elem in soup.descendants:
        if isinstance(elem, str):
            text = elem.strip()
            if text:
                lines.append(text)

    # Join lines with newline characters
    text = "\n".join(lines).strip()

    return text
