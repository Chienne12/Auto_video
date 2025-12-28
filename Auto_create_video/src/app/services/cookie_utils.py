"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                         COOKIE UTILITIES                                     ║
║              Quản lý cookies cho Browser Veo Service                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import json
import os
from typing import List, Dict, Optional
from datetime import datetime


def parse_cookie_string(cookie_string: str) -> List[Dict]:
    """
    Parse cookie string thành list dict.
    
    Input format: "name1=value1; name2=value2; ..."
    Output: [{"name": "name1", "value": "value1", ...}, ...]
    """
    cookies = []
    
    for item in cookie_string.split(";"):
        item = item.strip()
        if "=" in item:
            name, value = item.split("=", 1)
            cookies.append({
                "name": name.strip(),
                "value": value.strip(),
                "domain": ".google.com",
                "path": "/"
            })
    
    return cookies


def load_cookies_from_json_file(filepath: str) -> str:
    """
    Load cookies từ file JSON (export từ EditThisCookie extension).
    
    Returns:
        Cookie string format: "name1=value1; name2=value2; ..."
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Cookie file not found: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        cookies = json.load(f)
    
    # Convert list of dicts → cookie string
    cookie_parts = []
    for c in cookies:
        name = c.get("name", "")
        value = c.get("value", "")
        if name and value:
            cookie_parts.append(f"{name}={value}")
    
    return "; ".join(cookie_parts)


def save_cookies_to_file(cookie_string: str, filepath: str):
    """Lưu cookie string ra file để dùng lại sau"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # Lưu dạng JSON để dễ đọc
    cookies = parse_cookie_string(cookie_string)
    
    data = {
        "saved_at": datetime.now().isoformat(),
        "cookie_string": cookie_string,
        "cookies": cookies
    }
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_saved_cookie(filepath: str) -> Optional[str]:
    """Load cookie đã lưu trước đó"""
    if not os.path.exists(filepath):
        return None
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get("cookie_string", "")
    except:
        return None


def validate_google_cookies(cookie_string: str) -> dict:
    """
    Validate xem cookie có đủ các trường cần thiết cho Google không.
    
    Returns:
        {
            "valid": True/False,
            "missing": ["cookie1", "cookie2"],  # Nếu thiếu
            "found": ["cookie1", "cookie2"]     # Các cookie tìm thấy
        }
    """
    # Các cookie quan trọng cho Google Auth
    REQUIRED_COOKIES = [
        "__Secure-1PSID",
        "__Secure-3PSID", 
    ]
    
    OPTIONAL_COOKIES = [
        "HSID",
        "SSID", 
        "APISID",
        "SAPISID",
        "__Secure-1PAPISID",
        "__Secure-3PAPISID",
    ]
    
    cookies = parse_cookie_string(cookie_string)
    cookie_names = [c["name"] for c in cookies]
    
    missing = []
    found = []
    
    for required in REQUIRED_COOKIES:
        if required in cookie_names:
            found.append(required)
        else:
            missing.append(required)
    
    for optional in OPTIONAL_COOKIES:
        if optional in cookie_names:
            found.append(optional)
    
    return {
        "valid": len(missing) == 0,
        "missing": missing,
        "found": found,
        "total_cookies": len(cookies)
    }


# ═══════════════════════════════════════════════════════════════════════════════
# HƯỚNG DẪN LẤY COOKIE
# ═══════════════════════════════════════════════════════════════════════════════

COOKIE_INSTRUCTIONS = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                     HƯỚNG DẪN LẤY COOKIE TỪ BROWSER                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

CÁCH 1: Lấy trực tiếp từ DevTools (Đơn giản)
══════════════════════════════════════════════════════════════════════════════
1. Mở Chrome, đăng nhập vào https://labs.google/fx/vi/tools/flow
2. Nhấn F12 để mở DevTools
3. Chọn tab "Network"
4. Refresh trang (F5)
5. Click vào request đầu tiên (thường là "flow" hoặc tên trang)
6. Trong phần "Headers", tìm "Cookie:"
7. Copy TOÀN BỘ giá trị sau "Cookie:" 
8. Paste vào ô nhập cookie trong ứng dụng

CÁCH 2: Dùng Extension EditThisCookie (Tiện hơn)
══════════════════════════════════════════════════════════════════════════════
1. Cài extension "EditThisCookie" từ Chrome Web Store
2. Đăng nhập vào https://labs.google/fx/vi/tools/flow
3. Click icon EditThisCookie trên toolbar
4. Click nút "Export" (biểu tượng dấu ngoặc vuông [])
5. Lưu file JSON
6. Load file vào ứng dụng

⚠️ LƯU Ý QUAN TRỌNG:
══════════════════════════════════════════════════════════════════════════════
- Cookie sẽ HẾT HẠN sau 1-24 giờ
- Khi thấy lỗi "Cookie hết hạn", cần lấy cookie mới
- KHÔNG chia sẻ cookie với ai (giống như chia sẻ mật khẩu!)
- Cookie được lưu LOCAL trên máy bạn, không gửi đi đâu
"""


def print_cookie_instructions():
    """In hướng dẫn lấy cookie"""
    print(COOKIE_INSTRUCTIONS)
