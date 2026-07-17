import re
import urllib.request
from urllib.parse import urlparse
import html as html_lib

def scrape_og_metadata(url):
    try:
        # Enforce basic http/https prefix validation
        if not url.lower().startswith(('http://', 'https://')):
            url = 'https://' + url

        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8', errors='ignore')
        
        # 1. Title extraction (OG title -> normal title tag)
        og_title = re.search(r'<meta\s+(?:property|name)=["\']og:title["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
        title = None
        if og_title:
            title = og_title.group(1)
        else:
            title_tag = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
            if title_tag:
                title = title_tag.group(1).strip()
        
        # 2. Description extraction (OG description -> standard description)
        og_desc = re.search(r'<meta\s+(?:property|name)=["\'](?:og:description|description)["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
        description = og_desc.group(1) if og_desc else None
        
        # 3. Image extraction (OG image)
        og_img = re.search(r'<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
        image = og_img.group(1) if og_img else None
        
        # Clean entities
        if title:
            title = html_lib.unescape(title).strip()
        if description:
            description = html_lib.unescape(description).strip()
        
        parsed_url = urlparse(url)
        site_name = parsed_url.netloc
        
        return {
            "title": title or site_name,
            "description": description or "External link preview content.",
            "image": image
        }
    except Exception as e:
        print("Failed to scrape OG metadata:", e)
        try:
            parsed_url = urlparse(url)
            return {
                "title": parsed_url.netloc,
                "description": "External Link",
                "image": None
            }
        except:
            return {
                "title": "External Website",
                "description": "External Link",
                "image": None
            }