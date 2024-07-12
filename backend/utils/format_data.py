
import re
import html
from bs4 import BeautifulSoup

def read_file(file_path):
    """Read the content from a file."""
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

def write_file(file_path, content):
    """Write the content to a file."""
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(content)
        

def escape_html(input_data):
    escaped_data = html.escape(input_data)
    escaped_data = re.sub(r'\s+', ' ', escaped_data).strip()
    return escaped_data

def unescape_html(input_data):
    unescaped_content = html.unescape(input_data)
    parsed_data = BeautifulSoup(unescaped_content, "html.parser")
    return parsed_data.prettify()


