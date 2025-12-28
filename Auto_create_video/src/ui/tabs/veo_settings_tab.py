"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                        VEO SETTINGS TAB - TAB CÀI ĐẶT VEO                    ║
║                                                                               ║
║  Mô tả: Tab cấu hình Veo để tạo video với Playwright/Browser automation     ║
║  Tác giả: Auto Video Team                                                     ║
║  Ngày tạo: 2024                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
    QPushButton, QFrame, QLineEdit, QTextEdit,
    QComboBox, QCheckBox, QSpinBox, QScrollArea,
    QFileDialog, QMessageBox
)
from PyQt6.QtCore import Qt, pyqtSignal, QThread

# Import shared UI components
from src.ui.shared import UIConfig, BasePanelMixin

# Import table components từ video_table
from src.ui.tabs.video_table import VideoTable, BottomToolbar



import requests

# ═══════════════════════════════════════════════════════════════════════════════
# COOKIE CHECK WORKER
# ═══════════════════════════════════════════════════════════════════════════════
class CookieCheckWorker(QThread):
    """Worker thread để kiểm tra cookie mà không block UI"""
    finished = pyqtSignal(int)  # Emit số lượng cookie live
    
    def __init__(self, cookie_string: str):
        super().__init__()
        self.cookie_string = cookie_string
        
    def run(self):
        """Thực hiện check cookie"""
        try:
            if not self.cookie_string:
                self.finished.emit(0)
                return
                
            # Parse cookie string sang dict cho requests
            cookies = {}
            for pair in self.cookie_string.split(';'):
                if '=' in pair:
                    name, value = pair.strip().split('=', 1)
                    cookies[name] = value
            
            # Gửi request check
            url = "https://labs.google/fx/tools/flow"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            
            response = requests.get(url, cookies=cookies, headers=headers, timeout=10, allow_redirects=True)
            
            # Nếu không bị redirect đến login page → Live
            if "accounts.google.com" not in response.url:
                # Đếm số lượng cookie (tạm thời coi như tất cả live nếu vào được flow)
                count = len(cookies)
                self.finished.emit(count)
            else:
                self.finished.emit(0)
                
        except Exception as e:
            print(f"[COOKIE CHECK] Lỗi: {e}")
            self.finished.emit(-1)  # Lỗi kỹ thuật


# ═══════════════════════════════════════════════════════════════════════════════
# VEO WORKER THREAD (Background thread cho Playwright)
# ═══════════════════════════════════════════════════════════════════════════════
class VeoWorker(QThread):
    """
    Background worker thread để chạy PlaywrightVeoService.
    Hỗ trợ xử lý hàng loạt nhiều task.
    """
    progress = pyqtSignal(int, str)    # row_idx, message
    finished = pyqtSignal(int, object) # row_idx, VeoVideoResult
    error = pyqtSignal(int, str)       # row_idx, error_message
    all_finished = pyqtSignal()        # Khi xong toàn bộ batch
    
    def __init__(self, tasks: list, global_config: dict):
        """
        Args:
            tasks: List of dicts {row, prompt, product_path, ref_path}
            global_config: Cấu hình chung (model, video_type, cookie, output_dir, api_key)
        """
        super().__init__()
        self.tasks = tasks
        self.global_config = global_config
        self.is_running = True
    
    def run(self):
        """Chạy trong background thread"""
        try:
            import os
            from src.app.services.browser_veo_service import PlaywrightVeoService, PLAYWRIGHT_AVAILABLE
            from src.app.services.image_analysis import ImageAnalysisService
            from src.app.services.video_generation import VeoPromptConverter
            
            if not PLAYWRIGHT_AVAILABLE:
                self.error.emit(-1, "Playwright chưa cài! Vui lòng cài đặt để tiếp tục.")
                return

            api_key = self.global_config.get('api_key', '').strip()
            
            # ═══════════════════════════════════════════════════════════
            # BƯỚC 1: XỬ LÝ TẤT CẢ PROMPT TRƯỚC (KHÔNG CẦN BROWSER)
            # ═══════════════════════════════════════════════════════════
            processed_tasks = []
            
            for task in self.tasks:
                if not self.is_running:
                    break
                    
                row_idx = task['row']
                prompt = task['prompt']
                product_image = task.get('product_path') or self.global_config.get('product_image')
                character_ref = task.get('ref_path') or self.global_config.get('character_ref')
                
                self.progress.emit(row_idx, "🔄 Đang chuẩn bị...")
                
                # Xử lý ảnh và tối ưu prompt
                final_prompt = prompt
                if api_key and (product_image or character_ref):
                    try:
                        self.progress.emit(row_idx, "🔍 Đang phân tích ảnh...")
                        image_service = ImageAnalysisService(api_key)
                        ref_json = None
                        prod_json = None
                        
                        if character_ref and os.path.exists(character_ref):
                            ref_json = image_service.analyze_reference_image(character_ref)
                        if product_image and os.path.exists(product_image):
                            prod_json = image_service.analyze_product_image(product_image)
                        
                        if ref_json or prod_json:
                            self.progress.emit(row_idx, "✨ Đang tối ưu prompt...")
                            converter = VeoPromptConverter(api_key)
                            final_prompt = converter.convert(
                                hanh_dong=prompt,
                                boi_canh="Studio chuyên nghiệp",
                                reference_json=ref_json,
                                product_json=prod_json
                            )
                            print(f"[WORKER] Prompt đã tối ưu: {final_prompt[:100]}...")
                    except Exception as e:
                        print(f"[WORKER] Lỗi phân tích ảnh hàng {row_idx}: {e}")
                        # Dùng prompt gốc nếu lỗi
                
                # Lưu task đã xử lý
                processed_tasks.append({
                    'row': row_idx,
                    'final_prompt': final_prompt
                })
            
            # ═══════════════════════════════════════════════════════════
            # BƯỚC 2: MỞ BROWSER VÀ TẠO VIDEO
            # ═══════════════════════════════════════════════════════════
            print("[WORKER] ✅ Đã xử lý xong tất cả prompt, bắt đầu mở browser...")
            
            service = PlaywrightVeoService(
                cookie_string=self.global_config.get('cookie', ''),
                download_dir=self.global_config.get('output_dir') or './output/videos',
                headless=False,  # Tắt headless để debug
                timeout=300
            )
            
            # Khởi chạy browser
            service.start()
            
            # Kiểm tra đăng nhập
            if not service.is_logged_in():
                service.stop()
                for task in processed_tasks:
                    self.error.emit(task['row'], "Cookie hết hạn hoặc không hợp lệ!")
                return

            # Tạo video cho từng task
            for task in processed_tasks:
                if not self.is_running:
                    break
                
                row_idx = task['row']
                final_prompt = task['final_prompt']
                
                self.progress.emit(row_idx, "🎬 Đang tạo video...")
                
                result = service.generate_video(
                    prompt=final_prompt,
                    aspect_ratio=self.global_config.get('aspect_ratio', '16:9'),
                    output_count=self.global_config.get('output_count', 1),
                    model=self.global_config.get('model', 'veo_3_1_fast')
                )
                
                if result.success:
                    self.finished.emit(row_idx, result)
                else:
                    self.error.emit(row_idx, result.error_message)
            
            # Kết thúc
            service.stop()
            self.all_finished.emit()
            
        except Exception as e:
            print(f"[WORKER] Lỗi nghiêm trọng: {e}")
            self.all_finished.emit()
            
    def stop(self):
        """Dừng worker"""
        self.is_running = False
# ═══════════════════════════════════════════════════════════════════════════════
# VEO SETTINGS PANEL (Panel cấu hình Veo bên phải)
# ═══════════════════════════════════════════════════════════════════════════════
class VeoSettingsPanel(QFrame, BasePanelMixin):
    """
    Panel cấu hình Veo bên phải màn hình.
    
    Chứa các phần:
    - Xác thực (Cookie, Import)
    - Cài đặt Veo (Model, Video Type, Aspect Ratio, Output Count)
    - Sản phẩm (ảnh sản phẩm)
    - Nhân vật tham chiếu (ảnh/video)
    - Lưu video (thư mục output)
    - Prompt (từ workflow trước)
    
    Signals:
        start_clicked: Phát ra khi nhấn nút "Bắt đầu tạo video"
        import_clicked: Phát ra khi nhấn nút "Import"
        cookie_clicked: Phát ra khi nhấn nút "Cookie"
    """
    
    start_clicked = pyqtSignal()
    import_clicked = pyqtSignal()
    cookie_clicked = pyqtSignal()
    platform_changed = pyqtSignal(int)  # 0: Flow (4 slots), 1: Veo Studio (5 slots)
    
    # === Cấu hình Veo ===
    MODELS = {
        "veo_3_fast": "Veo 3 - Fast",
        "veo_3_1_fast": "Veo 3.1 - Fast",
        "veo_2": "Veo 2",
    }
    
    VIDEO_TYPES = {
        "text_to_video": "Từ văn bản sang video",
        "frames_to_video": "Tạo video từ các khung hình",
        "ingredients_to_video": "Tạo video từ các thành phần",
        "create_image": "Tạo hình ảnh",
    }
    
    ASPECT_RATIOS = {
        "16:9": "Khổ ngang (16:9)",
        "9:16": "Khổ dọc (9:16)",
        "1:1": "Hình vuông (1:1)",
    }
    
    def __init__(self):
        super().__init__()
        self._init_style()
        self._init_layout()
        self._create_sections()
        self._create_start_button()
    
    def _init_style(self):
        """Thiết lập style cho panel"""
        self.setFixedWidth(UIConfig.CONFIG_PANEL_WIDTH)
        self.setStyleSheet(f"""
            VeoSettingsPanel {{
                background-color: {UIConfig.COLORS['background']};
                border-left: 1px solid {UIConfig.COLORS['border']};
            }}
        """)
    
    def _init_layout(self):
        """Thiết lập layout chính với scroll area"""
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(0, 0, UIConfig.CONFIG_PANEL_MARGIN_RIGHT, 0)
        self.main_layout.setSpacing(0)
        
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setStyleSheet("""
            QScrollArea { border: none; background: #1e1e1e; }
            QScrollBar:vertical { width: 8px; background: #1e1e1e; }
            QScrollBar::handle:vertical { background: #444; border-radius: 4px; }
        """)
        
        self.content = QWidget()
        self.content.setStyleSheet("background: #1e1e1e;")
        self.content_layout = QVBoxLayout(self.content)
        self.content_layout.setContentsMargins(12, 10, 12, 10)
        self.content_layout.setSpacing(8)
        
        self.scroll.setWidget(self.content)
        self.main_layout.addWidget(self.scroll, 1)
    
    def _create_sections(self):
        """Tạo tất cả các section trong panel"""
        # Auth section đã chuyển sang Settings tab
        # Chỉ tạo một mini section để sync cookie
        self._create_cookie_sync_section()
        self._create_veo_settings_section()
        self._create_product_section()
        self._create_character_section()
        self._create_output_section()
        self._create_prompt_section()
        self.content_layout.addStretch()
    
    # _add_section_header, _add_label, _style_combo kế thừa từ BasePanelMixin
    
    def _create_cookie_sync_section(self):
        """Section hiển thị trạng thái Cookie và chọn trang"""
        self._add_section_header("🔐 XÁC THỰC")
        
        # Ghi chú hướng dẫn
        note = QLabel("⚠️ Nhập Cookie và API Key ở tab Settings")
        note.setStyleSheet(f"color: {UIConfig.COLORS['accent_yellow']}; font-size: 11px;")
        self.content_layout.addWidget(note)
        
        # Chọn trang (platform)
        self._add_label("Chọn trang:")
        self.platform_combo = QComboBox()
        self.platform_combo.addItems(["Flow", "Veo Studio"])
        self._style_combo(self.platform_combo)
        self.platform_combo.currentIndexChanged.connect(self.platform_changed.emit)
        self.content_layout.addWidget(self.platform_combo)
        
        # Cookie Live Status - kiểm tra cookie còn sống
        cookie_row = QHBoxLayout()
        
        self.cookie_live_label = QLabel("🍪 Cookie Live: ---")
        self.cookie_live_label.setStyleSheet(f"color: {UIConfig.COLORS['text_muted']}; font-size: 11px;")
        cookie_row.addWidget(self.cookie_live_label)
        
        self.check_cookie_btn = QPushButton("🔄 Kiểm tra")
        self.check_cookie_btn.setFixedWidth(80)
        self.check_cookie_btn.setStyleSheet("""
            QPushButton { background: #444; color: #ccc; padding: 4px 8px; 
                border-radius: 3px; font-size: 10px; }
            QPushButton:hover { background: #555; }
        """)
        self.check_cookie_btn.clicked.connect(self._check_cookie_live)
        cookie_row.addWidget(self.check_cookie_btn)
        
        cookie_container = QWidget()
        cookie_container.setLayout(cookie_row)
        self.content_layout.addWidget(cookie_container)
        
        # Hiển thị trạng thái tổng số cookie
        self.cookie_status = QLabel("🍪 Cookie: Chưa nhập")
        self.cookie_status.setStyleSheet(f"color: {UIConfig.COLORS['text_muted']}; font-size: 11px;")
        self.content_layout.addWidget(self.cookie_status)
        
        # Hidden cookie input để lưu trữ (sync từ Settings tab)
        self.cookie_input = QTextEdit()
        self.cookie_input.setVisible(False)  # Ẩn đi
        self.cookie_input.textChanged.connect(self._update_cookie_status)
        self.content_layout.addWidget(self.cookie_input)
    
    def _check_cookie_live(self):
        """Kiểm tra xem cookie còn sống không"""
        cookie = self.cookie_input.toPlainText().strip()
        if not cookie:
            self.cookie_live_label.setText("🍪 Cookie Live: Chưa có cookie")
            self.cookie_live_label.setStyleSheet(f"color: {UIConfig.COLORS['error']}; font-size: 11px;")
            return
        
        # Đổi button sang trạng thái đang kiểm tra
        self.check_cookie_btn.setEnabled(False)
        self.check_cookie_btn.setText("⏳...")
        self.cookie_live_label.setText("🍪 Cookie Live: Đang kiểm tra...")
        self.cookie_live_label.setStyleSheet(f"color: {UIConfig.COLORS['accent_yellow']}; font-size: 11px;")
        
        # Sử dụng worker thread để check cookie không block UI
        self.cookie_worker = CookieCheckWorker(cookie)
        self.cookie_worker.finished.connect(self._finish_cookie_check)
        self.cookie_worker.start()
    
    def _finish_cookie_check(self, count: int):
        """Hoàn thành kiểm tra cookie thực tế"""
        # Reset button
        self.check_cookie_btn.setEnabled(True)
        self.check_cookie_btn.setText("🔄 Kiểm tra")
        
        if count > 0:
            self.cookie_live_label.setText(f"✅ Cookie Live: {count} cookies đang hoạt động")
            self.cookie_live_label.setStyleSheet(f"color: {UIConfig.COLORS['accent_green']}; font-size: 11px;")
        elif count == 0:
            self.cookie_live_label.setText("❌ Cookie Live: Cookie đã hết hạn hoặc không hợp lệ")
            self.cookie_live_label.setStyleSheet(f"color: {UIConfig.COLORS['error']}; font-size: 11px;")
        else:
            self.cookie_live_label.setText("⚠️ Cookie Live: Lỗi kết nối mạng")
            self.cookie_live_label.setStyleSheet(f"color: {UIConfig.COLORS['accent_orange']}; font-size: 11px;")
    
    def _update_cookie_status(self):
        """Cập nhật hiển thị trạng thái cookie"""
        cookie = self.cookie_input.toPlainText().strip()
        if cookie:
            count = len([c for c in cookie.split(';') if '=' in c])
            self.cookie_status.setText(f"🍪 Tổng: {count} cookies từ Settings")
            self.cookie_status.setStyleSheet(f"color: {UIConfig.COLORS['accent_green']}; font-size: 11px;")
        else:
            self.cookie_status.setText("🍪 Cookie: Chưa nhập")
            self.cookie_status.setStyleSheet(f"color: {UIConfig.COLORS['text_muted']}; font-size: 11px;")
    
    
    def _create_veo_settings_section(self):
        """Tạo section CÀI ĐẶT VEO"""
        self._add_section_header("⚙️ CÀI ĐẶT VEO")
        
        # Model dropdown
        self._add_label("Model:")
        self.model_combo = QComboBox()
        for key, label in self.MODELS.items():
            self.model_combo.addItem(label, key)
        self.model_combo.setCurrentIndex(1)  # Default: veo_3_1_fast
        self._style_combo(self.model_combo)
        self.content_layout.addWidget(self.model_combo)
        
        # Video Type dropdown
        self._add_label("Loại tạo video:")
        self.video_type_combo = QComboBox()
        for key, label in self.VIDEO_TYPES.items():
            self.video_type_combo.addItem(label, key)
        self._style_combo(self.video_type_combo)
        self.content_layout.addWidget(self.video_type_combo)
        
        # Aspect Ratio và Output Count trên cùng hàng
        row = QHBoxLayout()
        
        # Aspect Ratio
        col1 = QVBoxLayout()
        lbl1 = QLabel("Tỉ lệ:")
        lbl1.setStyleSheet(f"color: {UIConfig.COLORS['text_muted']}; font-size: 11px;")
        col1.addWidget(lbl1)
        self.aspect_ratio_combo = QComboBox()
        for key, label in self.ASPECT_RATIOS.items():
            self.aspect_ratio_combo.addItem(label, key)
        self._style_combo(self.aspect_ratio_combo)
        col1.addWidget(self.aspect_ratio_combo)
        row.addLayout(col1)
        
        # Output Count
        col2 = QVBoxLayout()
        lbl2 = QLabel("Số video:")
        lbl2.setStyleSheet(f"color: {UIConfig.COLORS['text_muted']}; font-size: 11px;")
        col2.addWidget(lbl2)
        self.output_count_spin = QSpinBox()
        self.output_count_spin.setRange(1, 4)
        self.output_count_spin.setValue(2)
        self.output_count_spin.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.output_count_spin.wheelEvent = lambda e: e.ignore()
        self.output_count_spin.setStyleSheet("""
            QSpinBox { background: #2d2d2d; color: #e0e0e0;
                border: 1px solid #444; padding: 6px; border-radius: 4px; }
        """)
        col2.addWidget(self.output_count_spin)
        row.addLayout(col2)
        
        container = QWidget()
        container.setLayout(row)
        self.content_layout.addWidget(container)
    
    def _create_product_section(self):
        """Tạo section SẢN PHẨM"""
        self._add_section_header("📦 SẢN PHẨM")
        self._add_label("Ảnh sản phẩm:")
        
        row = QHBoxLayout()
        self.product_path_input = QLineEdit()
        self.product_path_input.setPlaceholderText("Chọn file...")
        # Set default value cho test
        self.product_path_input.setText(r"c:\Users\Admin\Documents\du an thay dong\Auto_create_video\0021481_bo-quan-ao-bong-da-doi-tuyen-quoc-gia-duc-mau-xam_1000.png")
        self.product_path_input.setStyleSheet("""
            QLineEdit { background: #2d2d2d; color: #e0e0e0;
                border: 1px solid #444; padding: 6px; border-radius: 4px; }
        """)
        row.addWidget(self.product_path_input)
        
        browse_btn = QPushButton("📁")
        browse_btn.setFixedWidth(40)
        browse_btn.setStyleSheet("QPushButton { background: #f59e0b; border-radius: 4px; }")
        browse_btn.clicked.connect(lambda: self._browse_image(self.product_path_input))
        row.addWidget(browse_btn)
        
        container = QWidget()
        container.setLayout(row)
        self.content_layout.addWidget(container)
    
    def _create_character_section(self):
        """Tạo section NHÂN VẬT THAM CHIẾU"""
        self._add_section_header("👤 NHÂN VẬT (Tham chiếu)")
        self._add_label("Ảnh/Video:")
        
        row = QHBoxLayout()
        self.character_path_input = QLineEdit()
        self.character_path_input.setPlaceholderText("Chọn file...")
        # Set default value cho test
        self.character_path_input.setText(r"c:\Users\Admin\Documents\du an thay dong\Auto_create_video\anh_con_gai_xinh_han_quoc_76fd180b94.png")
        self.character_path_input.setStyleSheet("""
            QLineEdit { background: #2d2d2d; color: #e0e0e0;
                border: 1px solid #444; padding: 6px; border-radius: 4px; }
        """)
        row.addWidget(self.character_path_input)
        
        browse_btn = QPushButton("▶️")
        browse_btn.setFixedWidth(40)
        browse_btn.setStyleSheet("QPushButton { background: #ef4444; border-radius: 4px; }")
        browse_btn.clicked.connect(lambda: self._browse_media(self.character_path_input))
        row.addWidget(browse_btn)
        
        container = QWidget()
        container.setLayout(row)
        self.content_layout.addWidget(container)
    
    
    def _create_output_section(self):
        """Tạo section LƯU VIDEO"""
        self._add_section_header("📂 LƯU VIDEO")
        self._add_label("Thư mục:")
        
        row = QHBoxLayout()
        self.output_path_input = QLineEdit()
        self.output_path_input.setText("./output/videos")
        self.output_path_input.setStyleSheet("""
            QLineEdit { background: #2d2d2d; color: #e0e0e0;
                border: 1px solid #444; padding: 6px; border-radius: 4px; }
        """)
        row.addWidget(self.output_path_input)
        
        browse_btn = QPushButton("📁")
        browse_btn.setFixedWidth(40)
        browse_btn.setStyleSheet("QPushButton { background: #3b82f6; border-radius: 4px; }")
        browse_btn.clicked.connect(lambda: self._browse_folder(self.output_path_input))
        row.addWidget(browse_btn)
        
        container = QWidget()
        container.setLayout(row)
        self.content_layout.addWidget(container)
    
    def _create_prompt_section(self):
        """Tạo section PROMPT"""
        self._add_section_header("📝 PROMPT")
        self._add_label("Prompt từ workflow trước:")
        
        self.prompt_input = QTextEdit()
        self.prompt_input.setPlaceholderText("Prompt sẽ được điền tự động từ workflow trước hoặc nhập thủ công...")
        # Set default prompt cho test
        default_prompt = """Một cô gái Hàn Quốc xinh đẹp đang mặc bộ đồng phục bóng đá của đội tuyển Đức màu xám, cô ấy đang vui vẻ nhảy múa và giơ tay chào, nền là sân vận động hiện đại với ánh đèn lung linh, camera quay chậm theo chuyển động mượt mà của cô ấy"""
        self.prompt_input.setPlainText(default_prompt)
        self.prompt_input.setMaximumHeight(100)
        self.prompt_input.setStyleSheet("""
            QTextEdit { background: #2d2d2d; color: #e0e0e0;
                border: 1px solid #444; padding: 6px; border-radius: 4px; }
        """)
        self.content_layout.addWidget(self.prompt_input)
    
    def _create_start_button(self):
        """Tạo nút BẮT ĐẦU TẠO VIDEO"""
        self.start_btn = QPushButton("▶️ BẮT ĐẦU TẠO VIDEO VEO")
        self.start_btn.setMinimumHeight(45)
        self.start_btn.setStyleSheet("""
            QPushButton { background: #22c55e; color: white; font-weight: bold;
                font-size: 14px; border-radius: 6px; }
            QPushButton:hover { background: #16a34a; }
            QPushButton:pressed { background: #333; color: #888; }
        """)
        self.start_btn.clicked.connect(self.start_clicked.emit)
        self.main_layout.addWidget(self.start_btn)
    
    def _browse_image(self, line_edit: QLineEdit):
        """Mở dialog chọn file ảnh"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Chọn ảnh", "", "Image Files (*.png *.jpg *.jpeg *.webp)"
        )
        if file_path:
            line_edit.setText(file_path)
    
    def _browse_media(self, line_edit: QLineEdit):
        """Mở dialog chọn file ảnh hoặc video"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Chọn ảnh/video", "", "Media Files (*.png *.jpg *.jpeg *.webp *.mp4 *.mov *.avi)"
        )
        if file_path:
            line_edit.setText(file_path)
    
    def _browse_folder(self, line_edit: QLineEdit):
        """Mở dialog chọn thư mục"""
        folder = QFileDialog.getExistingDirectory(self, "Chọn thư mục")
        if folder:
            line_edit.setText(folder)
    
    def get_veo_config(self) -> dict:
        """Lấy toàn bộ cấu hình Veo hiện tại"""
        from src.app.config import Config
        
        return {
            "platform": self.platform_combo.currentText(),
            "model": self.model_combo.currentData(),
            "video_type": self.video_type_combo.currentData(),
            "aspect_ratio": self.aspect_ratio_combo.currentData(),
            "output_count": self.output_count_spin.value(),
            "product_image": self.product_path_input.text(),
            "character_ref": self.character_path_input.text(),
            "output_dir": self.output_path_input.text(),
            "prompt": self.prompt_input.toPlainText(),
            "cookie": self.cookie_input.toPlainText(),
            "api_key": Config.GEMINI_API_KEY,  # Dùng cho phân tích ảnh
        }
    
    def set_prompt(self, prompt: str):
        """Set prompt từ workflow trước"""
        self.prompt_input.setPlainText(prompt)
    
    def set_cookie_count(self, count: int):
        """Cập nhật số lượng cookie"""
        self.cookie_btn.setText(f"🍪 Cookie: {count}")


# ═══════════════════════════════════════════════════════════════════════════════
# VEO SETTINGS TAB (Tab chính)
# ═══════════════════════════════════════════════════════════════════════════════
class VeoSettingsTab(QWidget):
    """
    Tab cấu hình Veo Settings - dùng để tạo video với Veo API/Playwright.
    
    Layout tương tự VideoTableTab nhưng sử dụng VeoSettingsPanel thay vì ConfigPanel.
    
    Layout:
    ┌─────────────────────────────────┬──────────────┐
    │                                 │              │
    │        BẢNG VIDEO               │     VEO     │
    │        (VideoTable)             │   SETTINGS  │
    │                                 │    PANEL    │
    ├─────────────────────────────────┤              │
    │     THANH CÔNG CỤ               │              │
    │     (BottomToolbar)             │              │
    └─────────────────────────────────┴──────────────┘
    """
    
    def __init__(self):
        super().__init__()
        self._init_layout()
        self._connect_signals()
        self.active_workers = []  # Lưu tất cả workers đang chạy để tránh garbage collection
    
    def _init_layout(self):
        """Khởi tạo layout chính"""
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Phần trái: Bảng + Toolbar
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        left_layout.setContentsMargins(0, 0, 0, 0)
        left_layout.setSpacing(0)
        
        self.table = VideoTable()
        self.toolbar = BottomToolbar()
        
        # Toolbar ở trên, Bảng ở dưới
        left_layout.addWidget(self.toolbar)
        left_layout.addWidget(self.table)
        
        # Phần phải: VeoSettingsPanel
        self.veo_panel = VeoSettingsPanel()
        
        # Ghép vào layout chính
        layout.addWidget(left_widget, 1)
        layout.addWidget(self.veo_panel)
    
    def _connect_signals(self):
        """Kết nối các signals với slots"""
        self.veo_panel.start_clicked.connect(self._on_start_veo_clicked)
        
        self.toolbar.add_clicked.connect(self._on_add_clicked)
        self.toolbar.delete_clicked.connect(self._on_delete_clicked)
        self.toolbar.select_all_clicked.connect(self._on_select_all)
        self.toolbar.run_selected_clicked.connect(self._on_run_selected)
        self.toolbar.retry_clicked.connect(self._on_retry_clicked)
        self.toolbar.import_images_clicked.connect(self._on_import_images)
        self.toolbar.open_video_clicked.connect(self._on_open_video_folder)
        
        # Sync num_slots dựa trên platform
        self.veo_panel.platform_changed.connect(self._on_platform_changed)
        self.current_num_slots = 4 # Default cho Flow
    
    def _on_platform_changed(self, index: int):
        """Xử lý khi đổi platform (0: Flow, 1: Veo Studio)"""
        self.current_num_slots = 4 if index == 0 else 5
        print(f"[UI] Đã đổi num_slots = {self.current_num_slots}")
    
    
    def _on_start_veo_clicked(self):
        """Xử lý khi nhấn nút BẮT ĐẦU TẠO VIDEO VEO"""
        veo_config = self.veo_panel.get_veo_config()
        
        print("=" * 60)
        print("🎬 BẮT ĐẦU TẠO VIDEO VEO")
        print("=" * 60)
        print(f"Model: {veo_config['model']}")
        print(f"Video Type: {veo_config['video_type']}")
        print(f"Aspect Ratio: {veo_config['aspect_ratio']}")
        print(f"Output Count: {veo_config['output_count']}")
        print(f"Prompt: {veo_config['prompt'][:50]}..." if veo_config['prompt'] else "Prompt: (trống)")
        print(f"Output Dir: {veo_config['output_dir']}")
        print("=" * 60)
        
        # ✅ BƯỚC 1: TẠO ROW NGAY LẬP TỨC (trước khi validate)
        # Điều này đảm bảo task luôn xuất hiện trong bảng
        row_num = self.table.rowCount() + 1
        new_row_idx = self.table.add_video_row(
            stt=row_num,
            prompt=veo_config['prompt'][:100] + "..." if len(veo_config['prompt']) > 100 else veo_config['prompt'],
            status="⏳ Đang xác thực...",
            product_path=veo_config.get('product_image', ''),
            ref_path=veo_config.get('character_ref', ''),
            num_slots=self.current_num_slots
        )
        
        # ✅ BƯỚC 2: VALIDATE sau khi đã tạo row
        # Nếu có lỗi, row vẫn hiển thị với trạng thái lỗi
        if not veo_config['prompt'].strip():
            self.table.update_row_progress(new_row_idx, "❌ Thiếu prompt")
            QMessageBox.warning(self, "Thiếu Prompt", "Vui lòng nhập prompt!")
            return
        
        if not veo_config['cookie'].strip():
            self.table.update_row_progress(new_row_idx, "❌ Thiếu cookie")
            QMessageBox.warning(
                self,
                "Thiếu Cookie",
                "Vui lòng paste cookie vào tab Settings!"
            )
            return
        
        # ✅ BƯỚC 3: TẠO VÀ CHẠY WORKER
        task = {
            "row": new_row_idx,
            "prompt": veo_config['prompt'],
            "product_path": veo_config.get('product_image'),
            "ref_path": veo_config.get('character_ref'),
            "num_slots": self.current_num_slots
        }
        
        # Tạo worker mới và thêm vào list để giữ reference
        worker = VeoWorker([task], veo_config)
        worker.progress.connect(self._on_veo_progress)
        worker.finished.connect(self._on_veo_finished)
        worker.error.connect(self._on_veo_error)
        worker.all_finished.connect(lambda w=worker: self._on_veo_all_finished(w))
        
        # Lưu worker vào list để tránh garbage collection
        self.active_workers.append(worker)
        worker.start()
    
    def _on_veo_progress(self, row_idx: int, message: str):
        """Cập nhật trạng thái tiến trình cho một hàng"""
        print(f"[VEO] Row {row_idx}: {message}")
        # Cập nhật trạng thái cho row tương ứng
        self.table.update_row_progress(row_idx, message)
    
    def _on_veo_finished(self, row_idx: int, result):
        """Xử lý khi một task hoàn thành"""
        # Cập nhật trạng thái hoàn thành
        self.table.update_row_progress(row_idx, "✅ 100%")
        
        # Cập nhật kết quả video
        if result.success and result.video_paths:
            self.table.update_video_results(row_idx, result.video_paths, num_slots=self.current_num_slots)
    
    def _on_veo_error(self, row_idx: int, error_message: str):
        """Xử lý khi một task có lỗi"""
        print(f"[VEO] Lỗi hàng {row_idx}: {error_message}")
        # Cập nhật trạng thái lỗi cho row
        self.table.update_row_progress(row_idx, f"❌ Lỗi: {error_message[:20]}...")
            
    def _on_veo_all_finished(self, worker):
        """Xử lý khi toàn bộ batch hoàn thành"""
        # Xóa worker khỏi list khi đã hoàn thành
        if worker in self.active_workers:
            self.active_workers.remove(worker)
        print(f"[VEO] Worker hoàn thành. Còn {len(self.active_workers)} workers đang chạy")
    
    def _on_add_clicked(self):
        """Thêm hàng mới vào bảng"""
        row_count = self.table.rowCount()
        self.table.add_video_row(row_count + 1)
    
    def _on_delete_clicked(self):
        """Xóa các hàng được chọn"""
        rows_to_delete = []
        for row in range(self.table.rowCount()):
            widget = self.table.cellWidget(row, 0)
            if widget:
                checkbox = widget.findChild(QCheckBox)
                if checkbox and checkbox.isChecked():
                    rows_to_delete.append(row)
        
        for row in sorted(rows_to_delete, reverse=True):
            self.table.removeRow(row)
    
    def _on_select_all(self):
        """Toggle chọn/bỏ chọn tất cả"""
        all_checked = True
        for row in range(self.table.rowCount()):
            widget = self.table.cellWidget(row, 0)
            if widget:
                checkbox = widget.findChild(QCheckBox)
                if checkbox and not checkbox.isChecked():
                    all_checked = False
                    break
        
        new_state = not all_checked
        for row in range(self.table.rowCount()):
            widget = self.table.cellWidget(row, 0)
            if widget:
                checkbox = widget.findChild(QCheckBox)
                if checkbox:
                    checkbox.setChecked(new_state)
    
    def _on_import_images(self):
        """Import ảnh sản phẩm từ file dialog"""
        files, _ = QFileDialog.getOpenFileNames(
            self,
            "Chọn ảnh sản phẩm",
            "",
            "Image Files (*.png *.jpg *.jpeg *.webp)"
        )
        
        for file_path in files:
            row_count = self.table.rowCount()
            self.table.add_video_row(row_count + 1, product_path=file_path, num_slots=self.current_num_slots)
    
    
    def _run_tasks(self, tasks_data: list, action_name: str = "Đang chạy"):
        """
        Helper function để chạy tasks - dùng chung cho run_selected và retry.
        
        Args:
            tasks_data: List of task data từ table
            action_name: Tên hành động để hiển thị (Đang chạy, Đang retry...)
        """
        if not tasks_data:
            QMessageBox.warning(self, "Thông báo", "Không có task nào để chạy!")
            return
        
        veo_config = self.veo_panel.get_veo_config()
        
        # Validate cookie
        if not veo_config['cookie'].strip():
            QMessageBox.warning(self, "Thiếu Cookie", "Vui lòng nhập cookie ở tab Settings!")
            return
        
        # Tạo tasks và cập nhật status
        tasks = []
        for data in tasks_data:
            row_idx = data['row']
            prompt = data.get('prompt', '')
            
            # Validate prompt
            if not prompt or not prompt.strip():
                self.table.update_row_progress(row_idx, "❌ Thiếu prompt")
                continue
            
            tasks.append({
                "row": row_idx,
                "prompt": prompt,
                "product_path": data.get('product_path'),
                "ref_path": data.get('ref_path'),
                "num_slots": self.current_num_slots
            })
            
            # Cập nhật status
            self.table.update_row_progress(row_idx, f"⏳ {action_name}...")
        
        if not tasks:
            QMessageBox.warning(self, "Thông báo", "Không có task hợp lệ để chạy!")
            return
        
        # Tạo worker mới cho batch này
        print(f"[BATCH] Bắt đầu {action_name.lower()} {len(tasks)} tasks")
        worker = VeoWorker(tasks, veo_config)
        worker.progress.connect(self._on_veo_progress)
        worker.finished.connect(self._on_veo_finished)
        worker.error.connect(self._on_veo_error)
        worker.all_finished.connect(lambda w=worker: self._on_veo_all_finished(w))
        
        # Lưu worker để tránh garbage collection
        self.active_workers.append(worker)
        worker.start()
    
    def _on_run_selected(self):
        """Chạy tạo video cho các row được chọn từ bảng"""
        selected_data = self.table.get_selected_rows_data()
        
        if not selected_data:
            QMessageBox.warning(self, "Thông báo", "Vui lòng chọn ít nhất 1 row để chạy!")
            return
        
        # Dùng shared helper
        self._run_tasks(selected_data, "Đang chạy")
     
    def _on_retry_clicked(self):
        """Retry/chạy lại các row được chọn (không cần kiểm tra lỗi)"""
        selected_data = self.table.get_selected_rows_data()
        
        if not selected_data:
            QMessageBox.warning(self, "Thông báo", "Vui lòng chọn ít nhất 1 row!")
            return
        
        
        # Chạy lại TẤT CẢ rows được chọn (không filter lỗi)
        self._run_tasks(selected_data, "Đang retry")
    
    
    def _on_open_video_folder(self):
        """Mở thư mục chứa video"""
        veo_config = self.veo_panel.get_veo_config()
        output_dir = veo_config.get('output_dir', './output/videos')
        
        # Tạo thư mục nếu chưa tồn tại
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            
        # Mở thư mục
        try:
            if os.name == 'nt':
                os.startfile(os.path.abspath(output_dir))
            else:
                import subprocess
                subprocess.run(['xdg-open' if os.name == 'posix' else 'open', os.path.abspath(output_dir)])
        except Exception as e:
            QMessageBox.warning(self, "Lỗi", f"Không thể mở thư mục: {e}")
            
    def set_prompt_from_workflow(self, prompt: str):
        """Set prompt từ workflow trước (gọi từ bên ngoài)"""
        self.veo_panel.set_prompt(prompt)
    
    def set_cookie_count(self, count: int):
        """Cập nhật số lượng cookie"""
        self.veo_panel.set_cookie_count(count)
