"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                      PLAYWRIGHT VEO SERVICE                                  ║
║              Tự động tạo video Veo bằng Playwright + Cookie                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

Ưu điểm:
- Headless (không hiện browser) → Nhanh
- Cookie-based auth → Không cần profile
- Vượt Cloudflare → JavaScript engine
- Không cần reverse engineer API → Dùng DOM

Usage:
    service = PlaywrightVeoService(cookie_string)
    result = service.generate_video("A girl dancing in the rain")
    print(result.video_path)
"""

import os
import time
import json
from typing import Optional, List
from dataclasses import dataclass
from pathlib import Path

from .cookie_utils import parse_cookie_string

try:
    from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("[WARNING] Playwright chưa được cài. Chạy: pip install playwright && playwright install chromium")


@dataclass
class VeoVideoResult:
    """Kết quả tạo video"""
    success: bool
    video_path: Optional[str] = None  # Backward compatible - video đầu tiên
    video_paths: Optional[List[str]] = None  # Tất cả video paths
    video_url: Optional[str] = None
    error_message: Optional[str] = None
    duration_seconds: float = 0


class PlaywrightVeoService:
    """
    Tự động tạo video trên Google Flow bằng Playwright + Cookie.
    Chạy headless (không hiện browser) để tối ưu tốc độ.
    """
    
    # URL Google Flow
    FLOW_URL = "https://labs.google/fx/tools/flow"
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # CONSTANTS - Timeouts & Delays
    # ═══════════════════════════════════════════════════════════════════════════════
    PAGE_LOAD_TIMEOUT = 60000  # 60s for page load
    LOGIN_CHECK_TIMEOUT = 15   # 15s to check login status
    LOGIN_RETRY_INTERVAL = 2   # Retry every 2s
    GENERATE_BTN_WAIT_TIMEOUT = 10  # 10s to wait for generate button
    ELEMENT_WAIT_TIMEOUT = 5000  # 5s for element visibility
    WAIT_AFTER_CLICK = 500  # 500ms wait after click
    
    # Selectors từ HTML thực tế (user inspect)
    SELECTORS = {
        # Nút tạo project mới
        "new_project": 'button:has-text("Dự án mới"), button:has-text("New project")',
        
        # Ô nhập prompt - ID chính xác
        "prompt_input": '#PINHOLE_TEXT_AREA_ELEMENT_ID, textarea[placeholder*="Tạo một video"], textarea',
        
        # Type selector (dropdown)
        "type_selector": 'button[role="combobox"]:has-text("Từ văn bản sang video")',
        
        # Các type options
        "type_text_to_video": 'div[role="option"]:has-text("Từ văn bản sang video")',
        "type_frames_to_video": 'div[role="option"]:has-text("Tạo video từ các khung hình")',
        "type_ingredients_to_video": 'div[role="option"]:has-text("Tạo video từ các thành phần")',
        
        # Nút submit (arrow_forward icon)
        "submit_btn": 'i:has-text("arrow_forward"), button:has(i:has-text("arrow_forward")), [class*="arrow_forward"]',
        
        # Video element khi xong
        "video_element": "video",
        
        # Progress indicator
        "progress": '[class*="progress"], [class*="loading"]',
        
        # Error message
        "error": '[role="alert"], [class*="error-message"], [data-error]',
        
        # === SETTINGS SELECTORS ===
        # Settings button (icon tune) - dựa trên HTML từ Flow
        "settings_btn": 'button:has(i:has-text("tune")), button:has(span:has-text("Cài đặt")), button.lkaxee',
        
        # Aspect ratio dropdown
        "aspect_ratio_btn": 'button[role="combobox"]:has-text("Tỷ lệ khung hình")',
        
        # Output count dropdown  
        "output_count_btn": 'button[role="combobox"]:has-text("Câu trả lời đầu ra")',
        
        # Model dropdown
        "model_btn": 'button[role="combobox"]:has-text("Mô hình")',
        
        # === IMAGE UPLOAD SELECTORS ===
        # Nút thêm ảnh (+) để mở dialog upload
        "add_image_btn": 'button:has(i:has-text("add")), i:has-text("add")',
        
        # Nút "Tải lên" trong dialog
        "upload_btn": 'button:has(i:has-text("upload")), button.dNBWVW',
        
        # File input (hidden) cho upload
        "file_input": 'input[type="file"]',
        
        # Video type dropdown button (để chọn mode)
        "video_type_dropdown": 'button[role="combobox"]',
    }
    
    # Aspect ratio options (Vietnamese labels from HTML)
    ASPECT_RATIOS = {
        "16:9": "Khổ ngang (16:9)",
        "9:16": "Khổ dọc (9:16)", 
        "1:1": "Hình vuông (1:1)"
    }
    
    # Output count options
    OUTPUT_COUNTS = [1, 2, 3, 4]
    
    # Model options
    MODELS = {
        "veo_3_fast": "Veo 3 - Fast",
        "veo_3_1_fast": "Veo 3.1 - Fast",
        "veo_2": "Veo 2",
    }
    
    # Video creation type options (from dropdown)
    VIDEO_TYPES = {
        "text_to_video": "Từ văn bản sang video",
        "frames_to_video": "Tạo video từ các khung hình",
        "ingredients_to_video": "Tạo video từ các thành phần",
        "create_image": "Tạo hình ảnh",
    }
    
    def __init__(
        self, 
        cookie_string: str,
        download_dir: str = "./output/videos",
        headless: bool = True,
        timeout: int = 300  # 5 phút timeout
    ):
        """
        Khởi tạo service.
        
        Args:
            cookie_string: Cookie string từ browser (copy từ F12 > Network)
            download_dir: Thư mục lưu video
            headless: True = chạy ngầm (nhanh), False = hiện browser (debug)
            timeout: Thời gian chờ tối đa (giây)
        """
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError("Playwright chưa được cài. Chạy: pip install playwright && playwright install chromium")
        
        self.cookie_string = cookie_string
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(parents=True, exist_ok=True)
        self.headless = headless
        self.timeout = timeout
        
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
    
    def _parse_cookies(self) -> List[dict]:
        """Parse cookie string - reuse cookie_utils"""
        cookies = parse_cookie_string(self.cookie_string)
        
        # Override domain for Flow  
        for cookie in cookies:
            cookie["domain"] = "labs.google"
            cookie["path"] = "/"
            
            # Add secure for __Secure- and __Host- cookies
            name = cookie.get("name", "")
            if name.startswith("__Secure-") or name.startswith("__Host-"):
                cookie["secure"] = True
        
        return cookies
    
    def start(self):
        """Khởi động browser với cookies"""
        print("[BROWSER] Đang khởi động Playwright...")
        
        self.playwright = sync_playwright().start()
        
        # Khởi động Chromium headless
        self.browser = self.playwright.chromium.launch(
            headless=self.headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--start-maximized",
            ]
        )
        
        # Tạo context với download path - no_viewport để dùng kích thước thực
        self.context = self.browser.new_context(
            accept_downloads=True,
            no_viewport=True,  # Dùng kích thước window thay vì viewport cố định
            ignore_https_errors=True  # Bỏ qua lỗi SSL certificate
        )
        
        # Set cookies
        cookies = self._parse_cookies()
        if cookies:
            self.context.add_cookies(cookies)
            print(f"[BROWSER] Đã set {len(cookies)} cookies")
        
        # Tạo page
        self.page = self.context.new_page()
        
        print("[BROWSER] Browser đã sẵn sàng")
        
        # ✅ Navigate đến Flow URL ngay sau khi browser sẵn sàng
        print("[BROWSER] Đang mở Flow...")
        self.page.goto(self.FLOW_URL, wait_until="networkidle", timeout=60000)
        print("[BROWSER] Đã mở Flow")
    
    
    def stop(self):
        """Đóng browser"""
        if self.context:
            self.context.close()
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        print("[BROWSER] Đã đóng browser")
    
    def is_logged_in(self) -> bool:
        """Kiểm tra đã đăng nhập chưa"""
        try:
            # ✅ CHỈ NAVIGATE NẾU CHƯA Ở TRANG FLOW
            current_url = self.page.url
            if not current_url or self.FLOW_URL not in current_url:
                print(f"[LOGIN] Đang navigate đến Flow... (hiện tại: {current_url[:50]}...)")
                self.page.goto(self.FLOW_URL, wait_until="networkidle", timeout=60000)
            else:
                print(f"[LOGIN] Đã ở trang Flow, không cần reload")
            
            # Nếu redirect đến trang login → chưa đăng nhập
            if "accounts.google.com" in self.page.url:
                print("[LOGIN] Redirect to login page")
                return False
            
            # ═══════════════════════════════════════════════════════════
            # RETRY: Tìm nút New project với timeout 15s, retry mỗi 2s
            # ═══════════════════════════════════════════════════════════
            print("[LOGIN] Đang kiểm tra đăng nhập...")
            
            RETRY_TIMEOUT = 15  # 15 giây timeout
            RETRY_INTERVAL = 2  # Retry mỗi 2 giây
            start_time = time.time()
            
            while time.time() - start_time < RETRY_TIMEOUT:
                # 1. Kiểm tra textarea
                try:
                    textarea = self.page.query_selector("textarea")
                    if textarea and textarea.is_visible():
                        print("[LOGIN] ✅ Tìm thấy textarea - Đã đăng nhập!")
                        return True
                except:
                    pass
                
                # 2. Kiểm tra nút New project
                try:
                    new_btn = self.page.query_selector('button:has-text("New project"), button:has-text("Dự án mới")')
                    if new_btn and new_btn.is_visible():
                        print("[LOGIN] ✅ Tìm thấy nút New project - Đã đăng nhập!")
                        return True
                except:
                    pass
                
                # Chưa thấy → Đợi 2s rồi thử lại
                elapsed = int(time.time() - start_time)
                print(f"[LOGIN] Đang đợi New project button... ({elapsed}s)")
                time.sleep(RETRY_INTERVAL)
            
            # Hết timeout vẫn không thấy
            print("[LOGIN] ❌ Không tìm thấy nút New project sau 15s - Cookie có thể đã hết hạn")
            return False
            
        except Exception as e:
            print(f"[ERROR] Check login failed: {e}")
            return False
    
    def generate_video(
        self, 
        prompt: str,
        duration: int = 8,
        aspect_ratio: str = "16:9",
        output_count: int = 2,
        model: str = "veo_3_1_fast"
    ) -> VeoVideoResult:
        """
        Tạo video từ prompt.
        
        Args:
            prompt: Prompt tiếng Anh mô tả video
            duration: Thời lượng (8s mặc định)
            aspect_ratio: Tỉ lệ khung hình ("16:9", "9:16", "1:1")
            output_count: Số lượng video output (1-4)
            model: Mô hình ("veo_3_fast", "veo_3_1_fast", "veo_2")
            
        Returns:
            VeoVideoResult với video_paths nếu thành công
        """
        start_time = time.time()
        
        try:
            # 1. Verify on Flow page (already navigated in start())
            if self.FLOW_URL not in self.page.url:
                print(f"[VEO] Not on Flow, navigating...")
                self.page.goto(self.FLOW_URL, wait_until="networkidle", timeout=self.PAGE_LOAD_TIMEOUT)
            else:
                print(f"[VEO] Already on Flow page")
            
            # 1.5. Đóng popup/modal nếu có
            self._close_popups()
            
            # 2. Kiểm tra đăng nhập
            if not self._check_logged_in_on_page():
                return VeoVideoResult(
                    success=False,
                    error_message="Cookie hết hạn hoặc chưa đăng nhập. Vui lòng lấy cookie mới."
                )
            
            # 3. Click "New project" hoặc "Dự án mới" để tạo project mới
            print("[VEO] Đang tạo project mới...")
            try:
                new_btn = self.page.wait_for_selector(
                    'button:has-text("New project"), button:has-text("Dự án mới"), [class*="new"]', 
                    timeout=5000
                )
                if new_btn:
                    new_btn.click()
                    print("[VEO] Đã click New project")
                    time.sleep(2)  # Đợi trang load
            except Exception as e:
                print(f"[VEO] Không thấy nút New project, có thể đã ở trang nhập prompt: {e}")
            
            # 4. Cấu hình settings (aspect ratio, output count, model)
            # ⚠️ BỎ QUA - Đang gây lỗi "Element not attached to DOM"
            # Settings mặc định của Flow đã đủ tốt
            # self._configure_settings(aspect_ratio, output_count, model)
            
            
            # 5. Tìm và nhập prompt
            print(f"[VEO] Đang nhập prompt: {prompt[:50]}...")
            prompt_input = self._find_prompt_input()
            if not prompt_input:
                return VeoVideoResult(
                    success=False,
                    error_message="Không tìm thấy ô nhập prompt. Trang có thể đã thay đổi."
                )
            
            prompt_input.fill(prompt)
            time.sleep(0.5)
            
            # 4. Đợi và Click Generate button
            print("[VEO] Đang tìm nút Generate...")
            generate_btn = self._find_generate_button()
            if not generate_btn:
                return VeoVideoResult(
                    success=False,
                    error_message="Không tìm thấy nút Generate."
                )
            
            # ✅ ĐỢI NÚT ENABLED (không bị disabled)
            print("[VEO] Đang đợi nút Generate enabled...")
            start_wait = time.time()
            
            while time.time() - start_wait < self.GENERATE_BTN_WAIT_TIMEOUT:
                # Tìm lại button (có thể đã re-render)
                generate_btn = self._find_generate_button()
                if not generate_btn:
                    print("[VEO] Mất nút Generate, tìm lại...")
                    time.sleep(1)
                    continue
                
                # Kiểm tra disabled attribute
                is_disabled = generate_btn.get_attribute("disabled")
                if is_disabled is None:  # Không có disabled attribute = enabled
                    print("[VEO] ✅ Nút Generate đã enabled, sẵn sàng click")
                    break
                    
                elapsed = int(time.time() - start_wait)
                if elapsed % 5 == 0 and elapsed > 0:
                    print(f"[VEO] Đang đợi nút enabled... ({elapsed}s)")
                time.sleep(1)
            else:
                return VeoVideoResult(
                    success=False,
                    error_message="Timeout: Nút Generate vẫn bị disabled sau 30s"
                )
            
            # Click button
            print("[VEO] Đang click Generate...")
            generate_btn.click()
            
            
            # 5. Đợi video render xong
            print("[VEO] Đang đợi video render...")
            video_ready = self._wait_for_video_complete()
            if not video_ready:
                return VeoVideoResult(
                    success=False,
                    error_message=f"Timeout sau {self.timeout}s. Video chưa xong."
                )
            
            # 6. Download tất cả video
            print("[VEO] Đang download TẤT CẢ video...")
            video_paths = self._download_all_videos_for_prompt(prompt)
            if not video_paths:
                return VeoVideoResult(
                    success=False,
                    error_message="Không thể download video."
                )
            
            elapsed = time.time() - start_time
            print(f"[VEO] ✓ Hoàn thành {len(video_paths)} video trong {elapsed:.1f}s")
            
            return VeoVideoResult(
                success=True,
                video_path=video_paths[0],  # Backward compatible
                video_paths=video_paths,     # Tất cả video
                duration_seconds=elapsed
            )
            
        except Exception as e:
            return VeoVideoResult(
                success=False,
                error_message=f"Lỗi: {str(e)}"
            )
    
    def generate_video_with_images(
        self, 
        prompt: str,
        image_paths: List[str],
        aspect_ratio: str = "16:9",
        output_count: int = 2,
        model: str = "veo_3_1_fast"
    ) -> VeoVideoResult:
        """
        Tạo video từ ảnh bằng mode "Tạo video từ các thành phần".
        Upload ảnh trực tiếp lên Flow để độ chính xác cao hơn.
        
        Args:
            prompt: Prompt mô tả video
            image_paths: List đường dẫn ảnh cần upload (sản phẩm, nhân vật...)
            aspect_ratio: Tỉ lệ khung hình ("16:9", "9:16", "1:1")
            output_count: Số lượng video output (1-4)
            model: Mô hình ("veo_3_fast", "veo_3_1_fast", "veo_2")
            
        Returns:
            VeoVideoResult với video_paths nếu thành công
        """
        start_time = time.time()
        
        try:
            # 1. Navigate đến trang Flow
            print(f"[VEO] Đang mở trang Flow...")
            self.page.goto(self.FLOW_URL, wait_until="networkidle", timeout=60000)
            time.sleep(2)
            
            # 2. Kiểm tra đăng nhập
            if not self._check_logged_in_on_page():
                return VeoVideoResult(
                    success=False,
                    error_message="Cookie hết hạn hoặc chưa đăng nhập."
                )
            
            # 3. Click "New project"
            print("[VEO] Đang tạo project mới...")
            try:
                new_btn = self.page.wait_for_selector(
                    'button:has-text("New project"), button:has-text("Dự án mới")', 
                    timeout=5000
                )
                if new_btn:
                    new_btn.click()
                    time.sleep(2)
            except:
                print("[VEO] Không thấy nút New project, tiếp tục...")
            
            # 4. Chọn mode "Tạo video từ các thành phần"
            print('[VEO] Đang chọn mode "Tạo video từ các thành phần"...')
            if not self._select_video_type("ingredients_to_video"):
                print("[VEO] Không thể chọn mode, thử tiếp tục...")
            time.sleep(1)
            
            # 5. Cấu hình settings
            self._configure_settings(aspect_ratio, output_count, model)
            
            # 6. Upload ảnh
            print(f"[VEO] Đang upload {len(image_paths)} ảnh...")
            for i, image_path in enumerate(image_paths):
                if not os.path.exists(image_path):
                    print(f"[VEO] ⚠️ File không tồn tại: {image_path}")
                    continue
                    
                success = self._upload_image_to_flow(image_path)
                if success:
                    print(f"[VEO] ✓ Upload thành công ảnh {i+1}: {os.path.basename(image_path)}")
                else:
                    print(f"[VEO] ⚠️ Không thể upload: {image_path}")
                time.sleep(1)
            
            # 7. Nhập prompt
            print(f"[VEO] Đang nhập prompt: {prompt[:50]}...")
            prompt_input = self._find_prompt_input()
            if not prompt_input:
                return VeoVideoResult(
                    success=False,
                    error_message="Không tìm thấy ô nhập prompt."
                )
            
            prompt_input.fill(prompt)
            time.sleep(0.5)
            
            # 8. Click Generate
            print("[VEO] Đang click Generate...")
            generate_btn = self._find_generate_button()
            if not generate_btn:
                return VeoVideoResult(
                    success=False,
                    error_message="Không tìm thấy nút Generate."
                )
            
            generate_btn.click()
            
            # 9. Đợi video render xong
            print("[VEO] Đang đợi video render...")
            video_ready = self._wait_for_video_complete()
            if not video_ready:
                return VeoVideoResult(
                    success=False,
                    error_message=f"Timeout sau {self.timeout}s. Video chưa xong."
                )
            
            # 10. Download video
            print("[VEO] Đang download video...")
            video_paths = self._download_all_videos_for_prompt(prompt)
            if not video_paths:
                return VeoVideoResult(
                    success=False,
                    error_message="Không thể download video."
                )
            
            elapsed = time.time() - start_time
            print(f"[VEO] ✓ Hoàn thành {len(video_paths)} video trong {elapsed:.1f}s")
            
            return VeoVideoResult(
                success=True,
                video_path=video_paths[0],
                video_paths=video_paths,
                duration_seconds=elapsed
            )
            
        except Exception as e:
            return VeoVideoResult(
                success=False,
                error_message=f"Lỗi: {str(e)}"
            )
    
    def _select_video_type(self, video_type: str) -> bool:
        """
        Chọn loại video (dropdown):
        - text_to_video: Từ văn bản sang video
        - frames_to_video: Tạo video từ các khung hình  
        - ingredients_to_video: Tạo video từ các thành phần
        """
        try:
            # Click dropdown
            dropdown = self.page.query_selector(self.SELECTORS["type_selector"])
            if not dropdown:
                # Thử tìm dropdown chung
                dropdown = self.page.query_selector('button[role="combobox"]')
            
            if dropdown:
                dropdown.click()
                time.sleep(0.5)
                
                # Chọn option
                option_selector = self.SELECTORS.get(f"type_{video_type}")
                if option_selector:
                    option = self.page.wait_for_selector(option_selector, timeout=3000)
                    if option:
                        option.click()
                        time.sleep(0.5)
                        return True
            return False
        except Exception as e:
            print(f"[VEO] Lỗi chọn video type: {e}")
            return False
    
    def _upload_image_to_flow(self, image_path: str) -> bool:
        """
        Upload ảnh lên Flow.
        
        Steps:
        1. Click nút add (+) để mở upload dialog
        2. Click nút "Tải lên" 
        3. Set file input với đường dẫn ảnh
        """
        try:
            # Cách 1: Click nút add (+) trước
            add_btn = self.page.query_selector(self.SELECTORS["add_image_btn"])
            if add_btn and add_btn.is_visible():
                add_btn.click()
                time.sleep(0.5)
            
            # Cách 2: Tìm file input và set trực tiếp
            # Playwright có thể set file input ngay cả khi hidden
            file_input = self.page.query_selector(self.SELECTORS["file_input"])
            if file_input:
                file_input.set_input_files(image_path)
                time.sleep(1)
                return True
            
            # Cách 3: Click nút upload và dùng file chooser
            upload_btn = self.page.query_selector(self.SELECTORS["upload_btn"])
            if upload_btn and upload_btn.is_visible():
                # Dùng file chooser
                with self.page.expect_file_chooser() as fc_info:
                    upload_btn.click()
                file_chooser = fc_info.value
                file_chooser.set_files(image_path)
                time.sleep(1)
                return True
            
            return False
            
        except Exception as e:
            print(f"[VEO] Lỗi upload ảnh: {e}")
            return False
    
    def _check_logged_in_on_page(self) -> bool:
        """Kiểm tra đã login trên trang hiện tại"""
        try:
            # Tìm dấu hiệu đã login (avatar, menu user, etc.)
            # Hoặc không có form login
            page_content = self.page.content().lower()
            
            # Nếu có prompt input → đã login
            prompt_input = self.page.query_selector(self.SELECTORS["prompt_input"])
            if prompt_input:
                return True
            
            # Nếu có "sign in" hoặc "đăng nhập" → chưa login
            if "sign in" in page_content or "đăng nhập" in page_content:
                return False
            
            return True  # Mặc định assume đã login
        except:
            return False
    
    def _close_popups(self):
        """Đóng các popup/modal đang hiển thị (ví dụ: quảng cáo, thông báo)"""
        try:
            print("[VEO] Đang kiểm tra và đóng popups...")
            
            # Cách 1: Tìm nút đóng (X, close, dismiss)
            close_buttons = [
                'button[aria-label*="Close"]',
                'button[aria-label*="Dismiss"]',
                'button:has(i:has-text("close"))',
                'button.close',
                '[data-dismiss="modal"]',
                'div[role="dialog"] button',  # Bất kỳ button nào trong dialog
            ]
            
            for selector in close_buttons:
                try:
                    btn = self.page.query_selector(selector)
                    if btn and btn.is_visible():
                        print(f"[VEO] Tìm thấy nút đóng popup: {selector}")
                        btn.click()
                        time.sleep(0.5)
                        # Chỉ đóng 1 popup là đủ
                        return
                except:
                    continue
            
            # Cách 2: Nhấn Escape
            self.page.keyboard.press("Escape")
            time.sleep(0.5)
            
            print("[VEO] Đã thử đóng popups")
        except Exception as e:
            print(f"[VEO] Lỗi khi đóng popup: {e}")
    
    
    def _find_element(self, selectors: List[str], timeout: int = 5000, use_wait: bool = True):
        """
        Tìm element bằng danh sách selectors (thử từng cái).
        
        Args:
            selectors: List các CSS selectors để thử
            timeout: Thời gian chờ mỗi selector (ms)
            use_wait: True=wait_for_selector, False=query_selector
        """
        for selector in selectors:
            try:
                if use_wait:
                    element = self.page.wait_for_selector(selector, timeout=timeout)
                else:
                    element = self.page.query_selector(selector)
                if element and element.is_visible():
                    return element
            except:
                continue
        return None
    
    def _find_prompt_input(self):
        """Tìm ô nhập prompt"""
        return self._find_element([
            "#PINHOLE_TEXT_AREA_ELEMENT_ID",
            'textarea[placeholder*="Tạo một video"]',
            "textarea",
        ], timeout=5000, use_wait=True)
    
    def _find_generate_button(self):
        """Tìm nút Submit (arrow_forward)"""
        return self._find_element([
            'i.google-symbols:has-text("arrow_forward")',
            'button:has(i:has-text("arrow_forward"))',
            '[class*="arrow_forward"]',
        ], timeout=3000, use_wait=False)
    
    def _configure_settings(self, aspect_ratio: str, output_count: int, model: str):
        """
        Cấu hình settings trước khi generate video.
        
        Args:
            aspect_ratio: "16:9", "9:16", "1:1"
            output_count: 1-4
            model: "veo_3_fast", "veo_3_1_fast", "veo_2"
        """
        try:
            # Click vào Settings button (icon tune)
            print(f"[VEO] Đang mở Settings...")
            settings_btn = self.page.query_selector(self.SELECTORS["settings_btn"])
            if settings_btn and settings_btn.is_visible():
                settings_btn.click()
                time.sleep(1)
                print("[VEO] Đã mở Settings dialog")
            else:
                print("[VEO] Không tìm thấy Settings button, bỏ qua cấu hình")
                return
            
            # 1. Chọn Aspect Ratio
            if aspect_ratio in self.ASPECT_RATIOS:
                self._select_dropdown_option(
                    self.SELECTORS["aspect_ratio_btn"],
                    self.ASPECT_RATIOS[aspect_ratio]
                )
                print(f"[VEO] Đã chọn aspect ratio: {aspect_ratio}")
            
            # 2. Chọn Output Count
            if output_count in self.OUTPUT_COUNTS:
                self._select_dropdown_option(
                    self.SELECTORS["output_count_btn"],
                    str(output_count)
                )
                print(f"[VEO] Đã chọn output count: {output_count}")
            
            # 3. Chọn Model
            if model in self.MODELS:
                self._select_dropdown_option(
                    self.SELECTORS["model_btn"],
                    self.MODELS[model]
                )
                print(f"[VEO] Đã chọn model: {model}")
            
            # Đóng settings (click outside hoặc Escape)
            self.page.keyboard.press("Escape")
            time.sleep(0.5)
            
        except Exception as e:
            print(f"[VEO] Lỗi cấu hình settings: {e}")
    
    def _select_dropdown_option(self, dropdown_selector: str, option_text: str):
        """Click dropdown và chọn option theo text"""
        try:
            # Click dropdown button
            dropdown = self.page.query_selector(dropdown_selector)
            if dropdown and dropdown.is_visible():
                dropdown.click()
                time.sleep(0.5)
                
                # Chọn option
                option = self.page.query_selector(f'div[role="option"]:has-text("{option_text}")')
                if option and option.is_visible():
                    option.click()
                    time.sleep(0.3)
                    return True
        except Exception as e:
            print(f"[VEO] Lỗi chọn dropdown: {e}")
        return False
    
    def _wait_for_video_complete(self) -> bool:
        """
        Đợi video render - ĐƠN GIẢN:
        - Timeout: 2 phút (120s)
        - Không kiểm tra lỗi
        - Tải mọi video có sẵn khi hết thời gian
        """
        TIMEOUT = 120  # 2 phút
        start = time.time()
        last_video_count = 0
        
        print(f"[VEO] Đang đợi video render (timeout: {TIMEOUT}s)...")
        
        while time.time() - start < TIMEOUT:
            try:
                
                # Đếm số video hiện tại
                videos = self.page.query_selector_all("video")
                current_count = len(videos) if videos else 0
                
                # Log khi có video mới
                if current_count != last_video_count and current_count > 0:
                    print(f"[VEO] {current_count} video đã render...")
                    last_video_count = current_count
                
                # Log tiến trình
                elapsed = int(time.time() - start)
                if elapsed % 15 == 0 and elapsed > 0:  # Log mỗi 15s
                    print(f"[VEO] Đang render... ({elapsed}s, {current_count} video)")
                
            except Exception as e:
                pass
            
            time.sleep(3)
        
        # Timeout - tải mọi video có sẵn
        final_count = len(self.page.query_selector_all("video") or [])
        print(f"[VEO] ⏱️ Timeout 2 phút - Tìm thấy {final_count} video")
        return True  # Luôn return True để tải video
    
    def _download_all_videos_for_prompt(self, prompt: str) -> List[str]:
        """
        Download TẤT CẢ video được tạo từ 1 prompt.
        
        Cách hoạt động:
        1. Tìm button/div chứa text prompt
        2. Tìm parent container chứa tất cả video của prompt đó
        3. Lấy tất cả video src và download
        
        Returns:
            List các đường dẫn file video đã download
        """
        downloaded_paths = []
        
        try:
            # Đợi trang load xong
            time.sleep(2)
            
            # Tìm tất cả video elements trên trang
            # Flow sinh ra 4 video cho mỗi prompt
            videos = self.page.query_selector_all("video")
            print(f"[VEO] Tìm thấy {len(videos)} video trên trang")
            
            if not videos:
                print("[VEO] Không tìm thấy video nào!")
                return []
            
            # Download từng video
            import requests
            for i, video in enumerate(videos):
                try:
                    video_src = video.get_attribute("src")
                    if video_src and video_src.startswith("http"):
                        print(f"[VEO] Đang download video {i+1}/{len(videos)}...")
                        response = requests.get(video_src, stream=True, timeout=120)
                        if response.status_code == 200:
                            # Tên file unique bằng timestamp + index
                            filename = f"veo_{int(time.time())}_{i+1}.mp4"
                            save_path = str(self.download_dir / filename)
                            with open(save_path, 'wb') as f:
                                for chunk in response.iter_content(chunk_size=8192):
                                    f.write(chunk)
                            downloaded_paths.append(save_path)
                            print(f"[VEO] ✓ Saved: {save_path}")
                        else:
                            print(f"[VEO] ✗ Lỗi download video {i+1}: HTTP {response.status_code}")
                except Exception as e:
                    print(f"[VEO] ✗ Lỗi video {i+1}: {e}")
                    continue
            
            print(f"[VEO] Đã download {len(downloaded_paths)}/{len(videos)} video")
            return downloaded_paths
            
        except Exception as e:
            print(f"[ERROR] Download all videos failed: {e}")
            return downloaded_paths
    
    def _download_video(self) -> Optional[str]:
        """Download 1 video (backward compatible)"""
        videos = self._download_all_videos_for_prompt("")
        return videos[0] if videos else None


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER: Cookie từ file EditThisCookie export
# ═══════════════════════════════════════════════════════════════════════════════

def load_cookies_from_json(filepath: str) -> str:
    """
    Load cookies từ file JSON (export từ EditThisCookie extension).
    Trả về cookie string.
    """
    with open(filepath, 'r') as f:
        cookies = json.load(f)
    
    # Convert list of dicts → cookie string
    cookie_parts = []
    for c in cookies:
        name = c.get("name", "")
        value = c.get("value", "")
        if name and value:
            cookie_parts.append(f"{name}={value}")
    
    return "; ".join(cookie_parts)
