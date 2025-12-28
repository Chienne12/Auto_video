"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                        VIDEO TABLE TAB - GIAO DIỆN CHÍNH                      ║
║                                                                               ║
║  Mô tả: Tab chính chứa bảng danh sách video và panel cấu hình                ║
║  Tác giả: Auto Video Team                                                     ║
║  Ngày tạo: 2024                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 1: IMPORT THƯ VIỆN
# ═══════════════════════════════════════════════════════════════════════════════
import os
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
    QPushButton, QFrame, QLineEdit, QTextEdit,
    QComboBox, QCheckBox, QSpinBox, QTableWidget,
    QTableWidgetItem, QHeaderView, QScrollArea,
    QFileDialog, QMessageBox, QRadioButton
)
from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QFont, QColor, QPixmap, QIcon

# Import worker cho video generation
from src.ui.workers.video_worker import VideoWorker, VideoWorkflowConfig
from src.app.config import config as app_config

# Import shared components
from src.ui.shared import UIConfig, BasePanelMixin, browse_folder, browse_image, browse_media


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 3: PANEL CẤU HÌNH (Bên phải)
# ═══════════════════════════════════════════════════════════════════════════════
class ConfigPanel(QFrame, BasePanelMixin):
    """
    Panel cấu hình bên phải màn hình.
    
    Chứa các phần:
    - Xác thực (Cookie, Import)
    - Cài đặt Model (Model, Luồng, Video, Tỉ lệ, Delay)
    - Thư mục lưu trữ
    - Nhập Prompt
    - Nút Bắt đầu tạo video
    
    Signals:
        start_clicked: Phát ra khi nhấn nút "Bắt đầu tạo video"
        import_clicked: Phát ra khi nhấn nút "Import"
    """
    
    # === Định nghĩa signals để kết nối với logic bên ngoài ===
    start_clicked = pyqtSignal()      # Khi nhấn "Bắt đầu tạo video"
    import_clicked = pyqtSignal()     # Khi nhấn "Import"
    cookie_clicked = pyqtSignal()     # Khi nhấn "Cookie"
    
    def __init__(self):
        super().__init__()
        self._init_style()
        self._init_layout()
        self._create_sections()
        self._create_start_button()
    
    # ─────────────────────────────────────────────────────────────────────────
    # 3.1: Khởi tạo Style
    # ─────────────────────────────────────────────────────────────────────────
    def _init_style(self):
        """Thiết lập style cho panel"""
        self.setFixedWidth(UIConfig.CONFIG_PANEL_WIDTH)
        self.setStyleSheet(f"""
            ConfigPanel {{
                background-color: {UIConfig.COLORS['background']};
                border-left: 1px solid {UIConfig.COLORS['border']};
            }}
        """)
    
    # ─────────────────────────────────────────────────────────────────────────
    # 3.2: Khởi tạo Layout
    # ─────────────────────────────────────────────────────────────────────────
    def _init_layout(self):
        """Thiết lập layout chính với scroll area"""
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(0, 0, UIConfig.CONFIG_PANEL_MARGIN_RIGHT, 0)
        self.main_layout.setSpacing(0)
        
        # Tạo scroll area để cuộn nội dung khi cần
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setStyleSheet("""
            QScrollArea { border: none; background: #1e1e1e; }
            QScrollBar:vertical { width: 8px; background: #1e1e1e; }
            QScrollBar::handle:vertical { background: #444; border-radius: 4px; }
        """)
        
        # Widget chứa nội dung bên trong scroll
        self.content = QWidget()
        self.content.setStyleSheet("background: #1e1e1e;")
        self.content_layout = QVBoxLayout(self.content)
        self.content_layout.setContentsMargins(12, 10, 12, 10)
        self.content_layout.setSpacing(8)
        
        self.scroll.setWidget(self.content)
        self.main_layout.addWidget(self.scroll, 1)
    
    # ─────────────────────────────────────────────────────────────────────────
    # 3.3: Tạo các Section
    # ─────────────────────────────────────────────────────────────────────────
    def _create_sections(self):
        """Tạo tất cả các section trong panel"""
        # self._create_auth_section()  # Xóa - Xác thực chỉ cần ở tab Veo Settings
        self._create_model_section()
        self._create_folder_section()
        self._create_prompt_section()
        self.content_layout.addStretch()
    
    def _create_auth_section(self):
        """Tạo section XÁC THỰC - Có 2 cách: Cookie hoặc API Key"""
        self._add_section_header("🔐 XÁC THỰC")
        
        # === Cách 1: Cookie (Web Automation) ===
        self._add_label("Cách 1: Cookie (miễn phí)")
        row = QHBoxLayout()
        
        # Nút Cookie
        self.cookie_btn = QPushButton("🍪 Cookie: 0")
        self.cookie_btn.setStyleSheet("""
            QPushButton {
                background: #365314; color: #a3e635;
                border: 1px solid #4d7c0f; padding: 6px 10px; border-radius: 4px;
            }
            QPushButton:hover { background: #4d7c0f; }
        """)
        self.cookie_btn.clicked.connect(self.cookie_clicked.emit)
        row.addWidget(self.cookie_btn)
        
        # Nút Import Cookie
        self.import_btn = QPushButton("📥 Import")
        self.import_btn.setStyleSheet("""
            QPushButton {
                background: #2563eb; color: white;
                padding: 6px 10px; border-radius: 4px;
            }
            QPushButton:hover { background: #1d4ed8; }
        """)
        self.import_btn.clicked.connect(self.import_clicked.emit)
        row.addWidget(self.import_btn)
        
        self.content_layout.addLayout(row)
        
        # === Cách 2: API Key (Trả phí) ===
        self._add_label("Cách 2: API Key (trả phí)")
        
        api_row = QHBoxLayout()
        api_row.setSpacing(4)
        
        self.api_key_input = QLineEdit()
        self.api_key_input.setPlaceholderText("Nhập API Key...")
        self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.api_key_input.setStyleSheet("""
            QLineEdit {
                background: #252525; border: 1px solid #444;
                padding: 6px 10px; color: #e0e0e0; border-radius: 4px;
            }
            QLineEdit:focus { border-color: #2563eb; }
        """)
        
        # Tự động load API key từ .env
        if app_config.GEMINI_API_KEY:
            self.api_key_input.setText(app_config.GEMINI_API_KEY)
        
        # Tự động lưu khi thay đổi
        self.api_key_input.textChanged.connect(self._save_api_key)
        api_row.addWidget(self.api_key_input)
        
        # Nút hiện/ẩn API key
        self.show_key_btn = QPushButton("O")
        self.show_key_btn.setFixedSize(30, 30)
        self.show_key_btn.setStyleSheet(UIConfig.get_button_style("#444"))
        self.show_key_btn.clicked.connect(self._toggle_api_key_visibility)
        api_row.addWidget(self.show_key_btn)
        
        # Nút Save API key
        self.save_key_btn = QPushButton("Save")
        self.save_key_btn.setFixedSize(60, 30)
        self.save_key_btn.setStyleSheet(UIConfig.get_button_style("#2563eb"))
        self.save_key_btn.clicked.connect(lambda: self._save_api_key(self.api_key_input.text()))
        api_row.addWidget(self.save_key_btn)
        
        self.content_layout.addLayout(api_row)
    
    def _toggle_api_key_visibility(self):
        """Hiện/ẩn API key"""
        if self.api_key_input.echoMode() == QLineEdit.EchoMode.Password:
            self.api_key_input.setEchoMode(QLineEdit.EchoMode.Normal)
            self.show_key_btn.setText("🙈")
        else:
            self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password)
            self.show_key_btn.setText("👁")
    
    def _save_api_key(self, text: str):
        """Lưu API key vào .env file"""
        if not text.strip():
            return
        
        import os
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), '.env')
        
        try:
            # Đọc file .env hiện tại
            lines = []
            if os.path.exists(env_path):
                with open(env_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
            
            # Tìm và thay thế GEMINI_API_KEY
            key_found = False
            for i, line in enumerate(lines):
                if line.startswith('GEMINI_API_KEY='):
                    lines[i] = f'GEMINI_API_KEY={text.strip()}\n'
                    key_found = True
                    break
            
            # Nếu chưa có thì thêm mới
            if not key_found:
                lines.append(f'\nGEMINI_API_KEY={text.strip()}\n')
            
            # Ghi lại file
            with open(env_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
        except Exception as e:
            print(f"[WARNING] Không thể lưu API key: {e}")
    
    def _create_model_section(self):
        """Tạo section CÀI ĐẶT MODEL"""
        self._add_section_header("⚙️ CÀI ĐẶT")
        
        # ═══════════════════════════════════════════════════════════════
        # 1. VIDEO TYPE SELECTION (ĐẦU TIÊN)
        # ═══════════════════════════════════════════════════════════════
        mode_row = QHBoxLayout()
        
        self.video_short_rb = QRadioButton("Video short (8 giây)")
        self.video_extended_rb = QRadioButton("Video kéo dài")
        self.video_short_rb.setChecked(True)
        
        self.extended_duration_spin = QSpinBox()
        self.extended_duration_spin.setRange(8, 141)
        self.extended_duration_spin.setValue(30)
        self.extended_duration_spin.setSuffix(" giây")
        self.extended_duration_spin.setEnabled(False)
        self.extended_duration_spin.setFixedWidth(100)
        
        style = "color: #ccc; font-size: 11px;"
        self.video_short_rb.setStyleSheet(style)
        self.video_extended_rb.setStyleSheet(style)
        self.extended_duration_spin.setStyleSheet("""
            QSpinBox { background: #2a2a2a; color: #fff; border: 1px solid #555; border-radius: 3px; padding: 3px; }
            QSpinBox:disabled { background: #1a1a1a; color: #555; }
        """)
        
        mode_row.addWidget(self.video_short_rb)
        mode_row.addWidget(self.video_extended_rb)
        mode_row.addWidget(self.extended_duration_spin)
        mode_row.addStretch()
        self.content_layout.addLayout(mode_row)
        
        # ═══════════════════════════════════════════════════════════════
        # 2. MODEL DROPDOWN
        # ═══════════════════════════════════════════════════════════════
        self._add_label("Model:")
        self.model_combo = QComboBox()
        self.model_combo.addItems(["veo-3.1-fast-generate-preview"])
        self._style_combo(self.model_combo)
        self.content_layout.addWidget(self.model_combo)
        
        # ═══════════════════════════════════════════════════════════════
        # 3. LUỒNG + VIDEO (Chỉ hiện khi Video Short)
        # ═══════════════════════════════════════════════════════════════
        self.short_options_widget = QWidget()
        short_layout = QHBoxLayout(self.short_options_widget)
        short_layout.setContentsMargins(0, 5, 0, 5)
        short_layout.setSpacing(8)
        
        col1 = QVBoxLayout()
        col1.addWidget(QLabel("Luồng:", styleSheet="color: #888; font-size: 10px;"))
        self.thread_combo = QComboBox()
        self.thread_combo.addItems(["1", "2", "3", "4"])
        self._style_combo(self.thread_combo)
        col1.addWidget(self.thread_combo)
        short_layout.addLayout(col1)
        
        col2 = QVBoxLayout()
        col2.addWidget(QLabel("Video:", styleSheet="color: #888; font-size: 10px;"))
        self.video_combo = QComboBox()
        self.video_combo.addItems(["1", "2", "3", "4", "5"])
        self._style_combo(self.video_combo)
        col2.addWidget(self.video_combo)
        short_layout.addLayout(col2)
        
        self.content_layout.addWidget(self.short_options_widget)
        
        # ═══════════════════════════════════════════════════════════════
        # 4. TỈ LỆ + DELAY
        # ═══════════════════════════════════════════════════════════════
        row2 = QHBoxLayout()
        row2.setSpacing(8)
        
        col3 = QVBoxLayout()
        col3.addWidget(QLabel("Tỉ lệ:", styleSheet="color: #888; font-size: 10px;"))
        self.ratio_combo = QComboBox()
        self.ratio_combo.addItems(["9:16", "16:9", "1:1"])
        self._style_combo(self.ratio_combo)
        col3.addWidget(self.ratio_combo)
        row2.addLayout(col3)
        
        col4 = QVBoxLayout()
        col4.addWidget(QLabel("Delay:", styleSheet="color: #888; font-size: 10px;"))
        self.delay_spin = QSpinBox()
        self.delay_spin.setRange(0, 60)
        self.delay_spin.setSuffix("s")
        self.delay_spin.setStyleSheet("background: #2a2a2a; border: 1px solid #444; padding: 6px; color: white;")
        self.delay_spin.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.delay_spin.wheelEvent = lambda e: e.ignore()
        col4.addWidget(self.delay_spin)
        row2.addLayout(col4)
        
        self.content_layout.addLayout(row2)
        
        # ═══════════════════════════════════════════════════════════════
        # 5. CONNECT SIGNALS - ẩn/hiện options khi chuyển mode
        # ═══════════════════════════════════════════════════════════════
        def on_mode_changed(is_extended):
            self.extended_duration_spin.setEnabled(is_extended)
            self.short_options_widget.setVisible(not is_extended)
        
        self.video_extended_rb.toggled.connect(on_mode_changed)
    
    def _create_folder_section(self):
        """Tạo section INPUT - Ảnh sản phẩm và Ảnh/Video nhân vật"""
        
        # === SECTION 1: ẢNH SẢN PHẨM ===
        self._add_section_header("�️ SẢN PHẨM")
        
        # Ảnh sản phẩm (bắt buộc)
        self.product_image_path = self._add_path_field("Ảnh sản phẩm:", "", is_image=True)
        
        # === SECTION 2: NHÂN VẬT ===
        self._add_section_header("👤 NHÂN VẬT (Tham chiếu)")
        
        # Ảnh hoặc Video nhân vật
        self.ref_path = self._add_path_field("Ảnh/Video:", "", is_media=True)
        
        # === SECTION 3: THƯ MỤC LƯU ===
        self._add_section_header("📁 LƯU VIDEO")
        
        # Thư mục lưu video đầu ra
        self.output_path = self._add_path_field("Thư mục:", "./output/videos", is_image=False)
    
    def _create_prompt_section(self):
        """Tạo section PROMPT"""
        self._add_section_header("✏️ PROMPT")
        
        self.prompt_text = QTextEdit()
        self.prompt_text.setPlaceholderText("Nhập prompt hoặc import từ file...")
        self.prompt_text.setStyleSheet("""
            QTextEdit {
                background: #252525; border: 1px solid #444;
                color: #aaa; padding: 8px; border-radius: 4px;
            }
        """)
        self.prompt_text.setFixedHeight(70)
        self.content_layout.addWidget(self.prompt_text)
        
        import_txt = QPushButton("📄 Import từ file .txt")
        import_txt.setStyleSheet("""
            QPushButton {
                background: #333; color: #aaa;
                border: 1px solid #444; padding: 8px; border-radius: 4px;
            }
            QPushButton:hover { background: #444; color: white; }
        """)
        self.content_layout.addWidget(import_txt)
    
    # ─────────────────────────────────────────────────────────────────────────
    # 3.4: Nút Bắt đầu tạo video
    # ─────────────────────────────────────────────────────────────────────────
    def _create_start_button(self):
        """Tạo nút BẮT ĐẦU TẠO VIDEO (cố định ở cuối panel)"""
        btn_frame = QFrame()
        btn_frame.setFixedHeight(55)
        btn_frame.setStyleSheet("background: #1e1e1e; border-top: 1px solid #333;")
        
        btn_layout = QVBoxLayout(btn_frame)
        btn_layout.setContentsMargins(10, 8, 10, 8)
        
        self.start_btn = QPushButton("▶ BẮT ĐẦU TẠO VIDEO")
        self.start_btn.setFixedHeight(38)
        self.start_btn.setFont(QFont("Segoe UI", 10, QFont.Weight.Bold))
        self.start_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.start_btn.setStyleSheet("""
            QPushButton {
                background: #22c55e; color: white; border-radius: 5px;
            }
            QPushButton:hover { background: #16a34a; }
            QPushButton:pressed { background: #333; color: #888; }
            QPushButton:disabled { background: #444; color: #888; }
        """)
        self.start_btn.clicked.connect(self.start_clicked.emit)
        
        btn_layout.addWidget(self.start_btn)
        self.main_layout.addWidget(btn_frame)
    
    
    # ─────────────────────────────────────────────────────────────────────────
    # 3.5: Các hàm tiện ích (_add_section_header, _add_label, _style_combo 
    #      kế thừa từ BasePanelMixin)
    # ─────────────────────────────────────────────────────────────────────────
    
    def _add_path_field(self, label: str, default: str, is_image: bool = False, is_media: bool = False) -> QLineEdit:
        """Thêm trường đường dẫn với nút chọn folder/file"""
        row = QHBoxLayout()
        row.setSpacing(4)
        
        lbl = QLabel(label)
        lbl.setStyleSheet("color: #888; font-size: 10px;")
        lbl.setFixedWidth(80)
        row.addWidget(lbl)
        
        inp = QLineEdit(default)
        inp.setStyleSheet("""
            background: #252525; border: 1px solid #444;
            padding: 5px; color: #888; font-size: 10px; border-radius: 3px;
        """)
        inp.setPlaceholderText("Chưa chọn file...")
        row.addWidget(inp)
        
        # Tạo nút với icon từ Qt Style
        from PyQt6.QtWidgets import QStyle
        icon_btn = QPushButton()
        icon_btn.setFixedSize(28, 24)
        icon_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        
        if is_media:
            # Icon media cho ảnh/video nhân vật
            icon = self.style().standardIcon(QStyle.StandardPixmap.SP_MediaPlay)
            icon_btn.setIcon(icon)
            icon_btn.setStyleSheet("background: #f59e0b; border-radius: 3px;")
            icon_btn.setToolTip("Chọn ảnh hoặc video nhân vật")
            icon_btn.clicked.connect(lambda: self._browse_media(inp))
        elif is_image:
            # Icon file cho ảnh sản phẩm
            icon = self.style().standardIcon(QStyle.StandardPixmap.SP_FileIcon)
            icon_btn.setIcon(icon)
            icon_btn.setStyleSheet("background: #22c55e; border-radius: 3px;")
            icon_btn.setToolTip("Chọn file ảnh sản phẩm")
            icon_btn.clicked.connect(lambda: self._browse_image(inp))
        else:
            # Icon folder cho thư mục
            icon = self.style().standardIcon(QStyle.StandardPixmap.SP_DirIcon)
            icon_btn.setIcon(icon)
            icon_btn.setStyleSheet("background: #2563eb; border-radius: 3px;")
            icon_btn.setToolTip("Chọn thư mục lưu video")
            icon_btn.clicked.connect(lambda: self._browse_folder(inp))
        
        row.addWidget(icon_btn)
        
        self.content_layout.addLayout(row)
        return inp
    
    def _browse_media(self, line_edit: QLineEdit):
        """Mở dialog chọn file ảnh hoặc video"""
        browse_media(self, line_edit)
    
    def _browse_image(self, line_edit: QLineEdit):
        """Mở dialog chọn file ảnh"""
        browse_image(self, line_edit)
    
    def _browse_folder(self, line_edit: QLineEdit):
        """Mở dialog chọn thư mục và cập nhật vào ô nhập"""
        browse_folder(self, line_edit)
    
    # ─────────────────────────────────────────────────────────────────────────
    # 3.6: Các hàm public để lấy/set giá trị (API cho logic bên ngoài)
    # ─────────────────────────────────────────────────────────────────────────
    def get_config(self) -> dict:
        """Lấy toàn bộ cấu hình hiện tại"""
        from src.app.config import Config
        
        return {
            'api_key': Config.GEMINI_API_KEY,  # Lấy từ .env
            'model': self.model_combo.currentText(),
            'threads': int(self.thread_combo.currentText()),
            'videos_per_prompt': int(self.video_combo.currentText()),
            'ratio': self.ratio_combo.currentText(),
            'delay': self.delay_spin.value(),
            'product_image_path': self.product_image_path.text(),
            'output_path': self.output_path.text(),
            'ref_path': self.ref_path.text(),
            'prompt': self.prompt_text.toPlainText(),
            # Video mode: short (8s) hoặc extended (15-141s)
            'is_extended': self.video_extended_rb.isChecked(),
            'extended_duration': self.extended_duration_spin.value()
        }
    
    def set_cookie_count(self, count: int):
        """Cập nhật số lượng cookie"""
        self.cookie_btn.setText(f"🍪 Cookie: {count}")
    
    def set_enabled(self, enabled: bool):
        """Bật/tắt toàn bộ panel"""
        self.start_btn.setEnabled(enabled)
    
    def save_config(self, filepath: str = None):
        """
        Lưu cấu hình hiện tại ra file JSON.
        
        Args:
            filepath: Đường dẫn file (mặc định: ./config/user_settings.json)
        """
        import json
        
        if filepath is None:
            filepath = "./config/user_settings.json"
        
        config = self.get_config()
        # Không lưu API key vì đã có trong .env
        config.pop('api_key', None)
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            print(f"[CONFIG] Đã lưu cài đặt vào {filepath}")
        except Exception as e:
            print(f"[ERROR] Không thể lưu cài đặt: {e}")
    
    def load_config(self, filepath: str = None):
        """
        Tải cấu hình từ file JSON.
        
        Args:
            filepath: Đường dẫn file (mặc định: ./config/user_settings.json)
        """
        import json
        
        if filepath is None:
            filepath = "./config/user_settings.json"
        
        if not os.path.exists(filepath):
            print(f"[CONFIG] Không tìm thấy file cài đặt: {filepath}")
            return False
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Apply config to UI
            if 'model' in config:
                idx = self.model_combo.findText(config['model'])
                if idx >= 0:
                    self.model_combo.setCurrentIndex(idx)
            
            if 'threads' in config:
                idx = self.thread_combo.findText(str(config['threads']))
                if idx >= 0:
                    self.thread_combo.setCurrentIndex(idx)
            
            if 'videos_per_prompt' in config:
                idx = self.video_combo.findText(str(config['videos_per_prompt']))
                if idx >= 0:
                    self.video_combo.setCurrentIndex(idx)
            
            if 'ratio' in config:
                idx = self.ratio_combo.findText(config['ratio'])
                if idx >= 0:
                    self.ratio_combo.setCurrentIndex(idx)
            
            if 'delay' in config:
                self.delay_spin.setValue(config['delay'])
            
            if 'product_image_path' in config and config['product_image_path']:
                self.product_image_path.setText(config['product_image_path'])
            
            if 'output_path' in config and config['output_path']:
                self.output_path.setText(config['output_path'])
            
            if 'ref_path' in config and config['ref_path']:
                self.ref_path.setText(config['ref_path'])
            
            if 'is_extended' in config:
                if config['is_extended']:
                    self.video_extended_rb.setChecked(True)
                else:
                    self.video_short_rb.setChecked(True)
            
            if 'extended_duration' in config:
                self.extended_duration_spin.setValue(config['extended_duration'])
            
            print(f"[CONFIG] Đã tải cài đặt từ {filepath}")
            return True
            
        except Exception as e:
            print(f"[ERROR] Không thể tải cài đặt: {e}")
            return False


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 4: BẢNG VIDEO (Bên trái)
# ═══════════════════════════════════════════════════════════════════════════════
class VeoSettingsPanel(QFrame):
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
        self._create_auth_section()
        self._create_veo_settings_section()
        self._create_product_section()
        self._create_character_section()
        self._create_output_section()
        self._create_prompt_section()
        self.content_layout.addStretch()
    
    def _add_section_header(self, title: str):
        """Thêm tiêu đề section"""
        label = QLabel(title)
        label.setStyleSheet(f"color: {UIConfig.COLORS['accent_yellow']}; font-weight: bold; font-size: 13px; margin-top: 10px;")
        self.content_layout.addWidget(label)
    
    def _add_label(self, text: str):
        """Thêm label nhỏ"""
        label = QLabel(text)
        label.setStyleSheet(f"color: {UIConfig.COLORS['text_muted']}; font-size: 11px;")
        self.content_layout.addWidget(label)
    
    def _style_combo(self, combo: QComboBox):
        """Áp dụng style cho combobox + tắt scroll wheel"""
        # Tắt scroll wheel - chỉ cho phép thay đổi khi click
        combo.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        combo.wheelEvent = lambda e: e.ignore()
        
        combo.setStyleSheet("""
            QComboBox {
                background: #2d2d2d; color: #e0e0e0;
                border: 1px solid #444; padding: 6px;
                border-radius: 4px;
            }
            QComboBox::drop-down { border: none; width: 20px; }
            QComboBox::down-arrow { image: none; border-left: 5px solid transparent;
                border-right: 5px solid transparent; border-top: 5px solid #888; }
            QComboBox QAbstractItemView { background: #2d2d2d; color: #e0e0e0;
                selection-background-color: #444; }
        """)
    
    def _create_auth_section(self):
        """Tạo section XÁC THỰC"""
        self._add_section_header("🔐 XÁC THỰC")
        self._add_label("Cách 1: Cookie (miễn phí)")
        
        row = QHBoxLayout()
        self.cookie_btn = QPushButton("🍪 Cookie: 0")
        self.cookie_btn.setStyleSheet("""
            QPushButton { background: #365314; color: #a3e635;
                border: 1px solid #4d7c0f; padding: 6px 10px; border-radius: 4px; }
            QPushButton:hover { background: #4d7c0f; }
        """)
        self.cookie_btn.clicked.connect(self.cookie_clicked.emit)
        row.addWidget(self.cookie_btn)
        
        self.import_btn = QPushButton("📥 Import")
        self.import_btn.setStyleSheet("""
            QPushButton { background: #2563eb; color: white;
                padding: 6px 10px; border-radius: 4px; }
            QPushButton:hover { background: #1d4ed8; }
        """)
        self.import_btn.clicked.connect(self.import_clicked.emit)
        row.addWidget(self.import_btn)
        
        container = QWidget()
        container.setLayout(row)
        self.content_layout.addWidget(container)
    
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
        return {
            "model": self.model_combo.currentData(),
            "video_type": self.video_type_combo.currentData(),
            "aspect_ratio": self.aspect_ratio_combo.currentData(),
            "output_count": self.output_count_spin.value(),
            "product_image": self.product_path_input.text(),
            "character_ref": self.character_path_input.text(),
            "output_dir": self.output_path_input.text(),
            "prompt": self.prompt_input.toPlainText(),
        }
    
    def set_prompt(self, prompt: str):
        """Set prompt từ workflow trước"""
        self.prompt_input.setPlainText(prompt)
    
    def set_cookie_count(self, count: int):
        """Cập nhật số lượng cookie"""
        self.cookie_btn.setText(f"🍪 Cookie: {count}")


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 4: BẢNG VIDEO (Bên trái)
# ═══════════════════════════════════════════════════════════════════════════════
class VideoTable(QTableWidget):
    """
    Bảng hiển thị danh sách video.
    
    Cột:
    - Checkbox: Chọn video
    - STT: Số thứ tự
    - Image: Hình ảnh start/end
    - Prompt: Nội dung prompt
    - Tiến độ: Trạng thái xử lý
    - Video kết quả: Các nút phát video + Tạo lại
    """
    
    def __init__(self):
        super().__init__()
        self._init_columns()
        self._init_style()
    
    def _init_columns(self):
        """Thiết lập các cột của bảng"""
        self.setColumnCount(6)
        self.setHorizontalHeaderLabels(["", "STT", "Image", "Prompt", "Tiến độ", "Video kết quả"])
        
        self.verticalHeader().setVisible(False)
        header = self.horizontalHeader()
        
        # Thiết lập resize mode cho từng cột
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.Stretch)  # Prompt co giãn
        header.setSectionResizeMode(4, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(5, QHeaderView.ResizeMode.Fixed)
        
        # Thiết lập width cố định
        widths = UIConfig.TABLE_COLUMN_WIDTHS
        self.setColumnWidth(0, widths['checkbox'])
        self.setColumnWidth(1, widths['stt'])
        self.setColumnWidth(2, widths['image'])
        self.setColumnWidth(4, widths['status'])
        self.setColumnWidth(5, widths['video_buttons'])
    
    def _init_style(self):
        """Thiết lập style cho bảng"""
        self.setStyleSheet("""
            QTableWidget {
                background-color: #1a1a1a;
                border: none;
                gridline-color: #333;
                color: #e0e0e0;
            }
            QTableWidget::item {
                padding: 5px;
                border-bottom: 1px solid #2a2a2a;
            }
            QTableWidget::item:selected {
                background-color: #333;
            }
            QHeaderView::section {
                background-color: #222;
                color: #888;
                padding: 8px;
                border: none;
                border-bottom: 2px solid #333;
                font-size: 11px;
            }
        """)
    
    def add_video_row(self, stt: int, prompt: str = "...", status: str = "0%", 
                       product_path: str = "", ref_path: str = "", num_slots: int = 4):
        """
        Thêm một hàng video mới vào bảng.
        
        Args:
            stt: Số thứ tự
            prompt: Nội dung prompt (mặc định "..." khi chưa có)
            status: Trạng thái/tiến độ (0%, 25%, 50%, 75%, 100%)
            product_path: Đường dẫn ảnh sản phẩm
            ref_path: Đường dẫn ảnh nhân vật
            num_slots: Số ô video (4 cho Flow, 5 cho API)
        """
        row = self.rowCount()
        self.insertRow(row)
        self.setRowHeight(row, UIConfig.TABLE_ROW_HEIGHT)
        
        # Cột 0: Checkbox
        self._add_checkbox_cell(row, 0)
        
        # Cột 1: STT
        self._add_stt_cell(row, 1, stt)
        
        # Cột 2: Image (hiện cả 2 ảnh)
        self._add_image_cell(row, 2, product_path, ref_path)
        
        # Cột 3: Prompt
        self.setItem(row, 3, QTableWidgetItem(prompt))
        
        # Cột 4: Tiến độ
        self._add_progress_cell(row, 4, status)
        
        # Cột 5: Video buttons
        self._add_video_buttons_cell(row, 5, "Đang chờ", num_slots=num_slots)
        
        return row
    
    def update_row_progress(self, row: int, progress: str, prompt: str = None):
        """Cập nhật tiến độ và prompt của một hàng"""
        if row >= self.rowCount():
            return
        
        # Cập nhật progress cell
        progress_widget = self.cellWidget(row, 4)
        if progress_widget:
            label = progress_widget.findChild(QLabel)
            if label:
                label.setText(progress)
                # Đổi màu theo progress
                if progress == "100%":
                    label.setStyleSheet("color: #4CAF50; font-size: 11px; font-weight: bold;")
                elif "%" in progress:
                    label.setStyleSheet("color: #ffcc00; font-size: 11px;")
                else:
                    label.setStyleSheet("color: #888; font-size: 11px;")
        
        # Cập nhật prompt nếu có
        if prompt is not None:
            item = self.item(row, 3)
            if item:
                item.setText(prompt[:100] + "..." if len(prompt) > 100 else prompt)
    
    def _add_progress_cell(self, row: int, col: int, progress: str):
        """Thêm ô tiến độ với percentage"""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(4, 0, 4, 0)
        
        label = QLabel(progress)
        label.setStyleSheet("color: #888; font-size: 11px;")
        layout.addWidget(label)
        self.setCellWidget(row, col, widget)
    
    def _add_checkbox_cell(self, row: int, col: int):
        """Thêm ô checkbox"""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(QCheckBox(), alignment=Qt.AlignmentFlag.AlignCenter)
        self.setCellWidget(row, col, widget)
    
    def _add_stt_cell(self, row: int, col: int, stt: int):
        """Thêm ô số thứ tự"""
        item = QTableWidgetItem(str(stt))
        item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
        item.setForeground(QColor(UIConfig.COLORS['accent_yellow']))
        self.setItem(row, col, item)
    
    def _add_image_cell(self, row: int, col: int, product_path: str = "", ref_path: str = ""):
        """Thêm ô hình ảnh với thumbnail clickable để upload"""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(4, 4, 4, 4)
        layout.setSpacing(4)
        
        # Thumbnail sản phẩm (clickable)
        img1_btn = QPushButton()
        img1_btn.setFixedSize(32, 32)
        img1_btn.setProperty("row", row)
        img1_btn.setProperty("type", "product")
        img1_btn.setProperty("path", product_path)
        img1_btn.setToolTip("Click để chọn ảnh sản phẩm")
        
        if product_path and os.path.exists(product_path):
            icon = QIcon(QPixmap(product_path).scaled(32, 32, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation))
            img1_btn.setIcon(icon)
            img1_btn.setIconSize(QSize(28, 28))
            img1_btn.setStyleSheet("QPushButton { border: 1px solid #3d7a3d; border-radius: 3px; } QPushButton:hover { border: 2px solid #4d9a4d; }")
        else:
            img1_btn.setText("+")
            img1_btn.setStyleSheet("QPushButton { background: #3d7a3d; border-radius: 3px; color: white; font-size: 16px; font-weight: bold; } QPushButton:hover { background: #4d9a4d; }")
        
        img1_btn.clicked.connect(lambda: self._on_image_click(row, "product"))
        
        # Thumbnail nhân vật (clickable)
        img2_btn = QPushButton()
        img2_btn.setFixedSize(32, 32)
        img2_btn.setProperty("row", row)
        img2_btn.setProperty("type", "ref")
        img2_btn.setProperty("path", ref_path)
        img2_btn.setToolTip("Click để chọn ảnh nhân vật")
        
        if ref_path and os.path.exists(ref_path):
            icon = QIcon(QPixmap(ref_path).scaled(32, 32, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation))
            img2_btn.setIcon(icon)
            img2_btn.setIconSize(QSize(28, 28))
            img2_btn.setStyleSheet("QPushButton { border: 1px solid #2563eb; border-radius: 3px; } QPushButton:hover { border: 2px solid #3b82f6; }")
        else:
            img2_btn.setText("+")
            img2_btn.setStyleSheet("QPushButton { background: #2563eb; border-radius: 3px; color: white; font-size: 16px; font-weight: bold; } QPushButton:hover { background: #3b82f6; }")
        
        img2_btn.clicked.connect(lambda: self._on_image_click(row, "ref"))
        
        layout.addWidget(img1_btn)
        layout.addWidget(img2_btn)
        layout.addStretch()
        self.setCellWidget(row, col, widget)
    
    def _on_image_click(self, row: int, img_type: str):
        """Xử lý khi click vào thumbnail để chọn ảnh"""
        from PyQt6.QtWidgets import QFileDialog
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            f"Chọn ảnh {'sản phẩm' if img_type == 'product' else 'nhân vật'}",
            "",
            "Image Files (*.png *.jpg *.jpeg *.webp *.gif)"
        )
        if file_path:
            # Cập nhật lại cell với ảnh mới
            widget = self.cellWidget(row, 2)
            if widget:
                layout = widget.layout()
                if layout:
                    # Tìm nút tương ứng
                    btn_idx = 0 if img_type == "product" else 1
                    btn = layout.itemAt(btn_idx).widget()
                    if btn and isinstance(btn, QPushButton):
                        btn.setProperty("path", file_path)
                        icon = QIcon(QPixmap(file_path).scaled(36, 36, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation))
                        btn.setIcon(icon)
                        btn.setIconSize(QSize(32, 32))
                        btn.setText("")
                        if img_type == "product":
                            btn.setStyleSheet("QPushButton { border: 1px solid #3d7a3d; border-radius: 4px; } QPushButton:hover { border: 2px solid #4d9a4d; }")
                        else:
                            btn.setStyleSheet("QPushButton { border: 1px solid #2563eb; border-radius: 4px; } QPushButton:hover { border: 2px solid #3b82f6; }")
    
    def _add_status_cell(self, row: int, col: int, status: str):
        """Thêm ô trạng thái"""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(4, 0, 4, 0)
        
        label = QLabel(status)
        color = UIConfig.COLORS['success'] if status == "Hoàn thành" else "#666"
        label.setStyleSheet(f"color: {color}; font-size: 10px;")
        layout.addWidget(label)
        self.setCellWidget(row, col, widget)
    
    def _add_video_buttons_cell(self, row: int, col: int, status: str, num_slots: int = 4):
        """
        Thêm ô kết quả video với các ô placeholder.
        
        Args:
            row: Số hàng
            col: Số cột
            status: Trạng thái (Đang chờ, 100%...)
            num_slots: Số ô video (4 cho Flow, 5 cho API)
        """
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(4, 2, 4, 2)
        layout.setSpacing(4)
        
        # Tạo các ô video placeholder
        for i in range(num_slots):
            slot_btn = QPushButton(f"{i+1}")
            slot_btn.setFixedSize(36, 36)
            slot_btn.setObjectName(f"video_slot_{i}")
            slot_btn.setToolTip(f"Video {i+1}: Chưa có")
            slot_btn.setEnabled(False)  # Disable khi chưa có video
            slot_btn.setStyleSheet("""
                QPushButton { 
                    background: #333; 
                    color: #666; 
                    font-size: 12px; 
                    font-weight: bold;
                    border-radius: 4px;
                    border: 1px dashed #555;
                }
                QPushButton:disabled { 
                    background: #2a2a2a; 
                    color: #555;
                }
            """)
            layout.addWidget(slot_btn)
        
        layout.addStretch()
        
        # Nút Tạo lại (ẩn mặc định)
        retry_btn = QPushButton("Tạo lại")
        retry_btn.setObjectName("retry_btn")
        retry_btn.setVisible(False)
        retry_btn.setStyleSheet("""
            QPushButton { background: #444; color: #ccc; padding: 4px 8px; 
                border-radius: 3px; font-size: 10px; }
            QPushButton:hover { background: #555; }
        """)
        layout.addWidget(retry_btn)
        
        self.setCellWidget(row, col, widget)
    
    def update_video_results(self, row: int, video_paths: list, num_slots: int = 4):
        """
        Cập nhật cột Video kết quả với các nút play.
        
        Args:
            row: Số hàng
            video_paths: Danh sách đường dẫn video
            num_slots: Số ô video (4 cho Flow, 5 cho API)
        """
        if row >= self.rowCount():
            return
        
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(4, 2, 4, 2)
        layout.setSpacing(4)
        
        # Tạo các slot - có video thì hiện ▶ xanh, không có thì placeholder
        for i in range(num_slots):
            if i < len(video_paths) and video_paths[i]:
                # Có video - nút play màu xanh
                video_path = video_paths[i]
                play_btn = QPushButton("▶")
                play_btn.setFixedSize(32, 32)
                play_btn.setToolTip(f"Video {i+1}: {os.path.basename(video_path)}")
                play_btn.setProperty("video_path", video_path)
                play_btn.setStyleSheet("""
                    QPushButton { 
                        background: #22c55e; 
                        color: white; 
                        font-size: 14px; 
                        font-weight: bold;
                        border-radius: 4px;
                        border: none;
                    }
                    QPushButton:hover { background: #16a34a; }
                    QPushButton:pressed { background: #14532d; }
                """)
                play_btn.clicked.connect(lambda checked, path=video_path: self._open_video_file(path))
                layout.addWidget(play_btn)
            else:
                # Chưa có video - placeholder
                slot_btn = QPushButton(f"{i+1}")
                slot_btn.setFixedSize(36, 36)
                slot_btn.setToolTip(f"Video {i+1}: Chưa có")
                slot_btn.setEnabled(False)
                slot_btn.setStyleSheet("""
                    QPushButton { 
                        background: #333; 
                        color: #666; 
                        font-size: 12px; 
                        font-weight: bold;
                        border-radius: 4px;
                        border: 1px dashed #555;
                    }
                    QPushButton:disabled { 
                        background: #2a2a2a; 
                        color: #555;
                    }
                """)
                layout.addWidget(slot_btn)
        
        layout.addStretch()
        
        # Nút Tạo lại (hiện khi có ít nhất 1 video)
        if video_paths:
            retry_btn = QPushButton("Tạo lại")
            retry_btn.setStyleSheet("""
                QPushButton { background: #444; color: #ccc; padding: 4px 8px; 
                    border-radius: 3px; font-size: 10px; }
                QPushButton:hover { background: #555; }
            """)
            layout.addWidget(retry_btn)
        
        self.setCellWidget(row, 5, widget)
    
    def _open_video_file(self, video_path: str):
        """Mở file video với ứng dụng mặc định"""
        try:
            if os.path.exists(video_path):
                # Windows: dùng os.startfile
                if os.name == 'nt':
                    os.startfile(video_path)
                # Mac/Linux: dùng open/xdg-open
                else:
                    import subprocess
                    subprocess.run(['xdg-open' if os.name == 'posix' else 'open', video_path])
            else:
                from PyQt6.QtWidgets import QMessageBox
                QMessageBox.warning(self, "Lỗi", f"File không tồn tại:\n{video_path}")
        except Exception as e:
            print(f"[VIDEO] Lỗi mở video: {e}")

    def get_selected_rows_data(self) -> list:
        """
        Lấy thông tin của các hàng đang được chọn (checkbox ticked).
        
        Returns:
            list: Danh sách dict chứa data {row, stt, prompt, product_path, ref_path, status}
        """
        selected_data = []
        for row in range(self.rowCount()):
            # Kiểm tra checkbox ở cột 0
            cb_widget = self.cellWidget(row, 0)
            if cb_widget:
                cb = cb_widget.findChild(QCheckBox)
                if cb and cb.isChecked():
                    # Lấy STT
                    stt_item = self.item(row, 1)
                    stt = int(stt_item.text()) if stt_item else row + 1
                    
                    # Lấy Prompt
                    prompt_item = self.item(row, 3)
                    prompt = prompt_item.text() if prompt_item else ""
                    
                    # Lấy Image Paths từ widget ở cột 2
                    img_widget = self.cellWidget(row, 2)
                    product_path = ""
                    ref_path = ""
                    if img_widget:
                        btns = img_widget.findChildren(QPushButton)
                        for btn in btns:
                            if btn.property("type") == "product":
                                product_path = btn.property("path") or ""
                            elif btn.property("type") == "ref":
                                ref_path = btn.property("path") or ""
                    
                    # Lấy Status
                    status_item = self.item(row, 4)
                    status = status_item.text() if status_item else "Đang chờ"
                    
                    selected_data.append({
                        "row": row,
                        "stt": stt,
                        "prompt": prompt,
                        "product_path": product_path,
                        "ref_path": ref_path,
                        "status": status
                    })
        return selected_data


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 5: THANH CÔNG CỤ DƯỚI
# ═══════════════════════════════════════════════════════════════════════════════
class BottomToolbar(QFrame):
    """
    Thanh công cụ ở dưới bảng video.
    
    Chứa các nút:
    - Trái: Thêm, Xóa, Chọn, Chạy, Retry
    - Phải: Backup, Ảnh, Video
    """
    
    # Signals
    add_clicked = pyqtSignal()
    delete_clicked = pyqtSignal()
    select_all_clicked = pyqtSignal()
    run_selected_clicked = pyqtSignal()
    retry_clicked = pyqtSignal()
    import_images_clicked = pyqtSignal()  # Signal cho nút Ảnh
    open_video_clicked = pyqtSignal()     # Signal cho nút Video
    
    def __init__(self):
        super().__init__()
        self._init_style()
        self._create_buttons()
    
    def _init_style(self):
        """Thiết lập style cho toolbar"""
        self.setFixedHeight(40)
        self.setStyleSheet(f"""
            BottomToolbar {{
                background: {UIConfig.COLORS['background_dark']};
                border-top: 1px solid #333;
            }}
        """)
    
    def _create_buttons(self):
        """Tạo các nút trên toolbar"""
        layout = QHBoxLayout(self)
        layout.setContentsMargins(6, 4, 6, 4)
        layout.setSpacing(4)
        
        # Nhóm nút bên trái
        left_buttons = [
            ("+ Thêm", "#22c55e", self.add_clicked),
            ("- Xóa", "#ea580c", self.delete_clicked),
            ("☑ Chọn", "#444", self.select_all_clicked),
            ("▶ Chạy", "#2563eb", self.run_selected_clicked),
            ("↻ Retry", "#c2410c", self.retry_clicked)
        ]
        
        for text, color, signal in left_buttons:
            btn = self._create_button(text, color)
            btn.clicked.connect(signal.emit)
            layout.addWidget(btn)
        
        layout.addStretch()
        
        # Các nút Ảnh, Video đã có ở panel bên phải - không cần trùng lặp
    
    def _create_button(self, text: str, color: str) -> QPushButton:
        """Tạo một nút với style thống nhất"""
        btn = QPushButton(text)
        btn.setStyleSheet(f"""
            QPushButton {{
                background: {color};
                color: white;
                border-radius: 3px;
                padding: 5px 8px;
                font-size: 10px;
            }}
            QPushButton:hover {{ opacity: 0.8; }}
        """)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        return btn


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 6: TAB CHÍNH (Ghép tất cả lại)
# ═══════════════════════════════════════════════════════════════════════════════
class VideoTableTab(QWidget):
    """
    Tab chính chứa bảng video và panel cấu hình.
    
    Layout:
    ┌─────────────────────────────────┬──────────────┐
    │                                 │              │
    │        BẢNG VIDEO               │   PANEL      │
    │        (VideoTable)             │   CẤU HÌNH   │
    │                                 │  (ConfigPanel)│
    ├─────────────────────────────────┤              │
    │     THANH CÔNG CỤ               │              │
    │     (BottomToolbar)             │              │
    └─────────────────────────────────┴──────────────┘
    """
    
    def __init__(self):
        super().__init__()
        self._init_layout()
        self._connect_signals()
        # Bảng bắt đầu trống - người dùng sẽ thêm ảnh bằng nút "📷 Ảnh"
    
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
        
        # Phần phải: Panel cấu hình
        self.config_panel = ConfigPanel()
        
        # Ghép vào layout chính
        layout.addWidget(left_widget, 1)  # stretch = 1, chiếm hết không gian còn lại
        layout.addWidget(self.config_panel)
    
    def _connect_signals(self):
        """Kết nối các signals với slots"""
        # Kết nối signals từ config panel
        self.config_panel.start_clicked.connect(self._on_start_clicked)
        
        # Kết nối signals từ toolbar
        self.toolbar.add_clicked.connect(self._on_add_clicked)
        self.toolbar.delete_clicked.connect(self._on_delete_clicked)
        self.toolbar.select_all_clicked.connect(self._on_select_all)
        self.toolbar.import_images_clicked.connect(self._on_import_images)
        self.toolbar.open_video_clicked.connect(self._on_open_video_folder)
        
        # Double-click vào video cell để phát video
        self.table.cellDoubleClicked.connect(self._on_play_video)
        
        # Load lịch sử khi khởi động
        self._load_history()
    
    # ─────────────────────────────────────────────────────────────────────────
    # 6.0.1: Lưu/Load Lịch Sử Video
    # ─────────────────────────────────────────────────────────────────────────
    HISTORY_FILE = "./history/video_history.json"
    
    def _save_history(self):
        """Lưu lịch sử tất cả videos đã tạo ra file JSON"""
        import json
        from datetime import datetime
        
        history = []
        for row in range(self.table.rowCount()):
            # Lấy thông tin từ mỗi row
            stt_item = self.table.item(row, 1)
            prompt_item = self.table.item(row, 3)
            progress_item = self.table.item(row, 4)
            video_item = self.table.item(row, 5)
            
            entry = {
                "stt": stt_item.text() if stt_item else str(row + 1),
                "prompt": prompt_item.text() if prompt_item else "",
                "progress": progress_item.text() if progress_item else "0%",
                "video_path": video_item.data(Qt.ItemDataRole.UserRole) if video_item else None,
                "video_name": video_item.text() if video_item else "",
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            history.append(entry)
        
        # Tạo thư mục nếu chưa có
        os.makedirs(os.path.dirname(self.HISTORY_FILE), exist_ok=True)
        
        try:
            with open(self.HISTORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(history, f, ensure_ascii=False, indent=2)
            print(f"[HISTORY] Saved {len(history)} entries to {self.HISTORY_FILE}")
        except Exception as e:
            print(f"[HISTORY] Error saving: {e}")
    
    def _load_history(self):
        """Load lịch sử videos từ file JSON khi app khởi động"""
        import json
        
        if not os.path.exists(self.HISTORY_FILE):
            print("[HISTORY] No history file found, starting fresh")
            return
        
        try:
            with open(self.HISTORY_FILE, 'r', encoding='utf-8') as f:
                history = json.load(f)
            
            print(f"[HISTORY] Loading {len(history)} entries...")
            
            for entry in history:
                # Thêm row vào bảng
                row = self.table.rowCount()
                self.table.add_video_row(
                    stt=int(entry.get("stt", row + 1)),
                    prompt=entry.get("prompt", "..."),
                    status=entry.get("progress", "0%"),
                    product_path="",  # Không lưu ảnh trong history
                    ref_path=""
                )
                
                # Restore video path nếu có
                video_path = entry.get("video_path")
                if video_path:
                    video_item = self.table.item(row, 5)
                    if video_item:
                        video_item.setText(entry.get("video_name", ""))
                        video_item.setData(Qt.ItemDataRole.UserRole, video_path)
                        video_item.setToolTip(f"Double-click để xem: {video_path}")
            
            print(f"[HISTORY] Loaded {len(history)} entries successfully")
        except Exception as e:
            print(f"[HISTORY] Error loading: {e}")
    
    def _clear_history(self):
        """Xóa toàn bộ lịch sử"""
        self.table.setRowCount(0)
        if os.path.exists(self.HISTORY_FILE):
            os.remove(self.HISTORY_FILE)
            print("[HISTORY] History cleared")
    
    def _load_sample_data(self):
        """Tải dữ liệu mẫu (sẽ thay bằng dữ liệu thật sau)"""
        for i in range(12):
            status = "Hoàn thành" if i < 10 else "Đang chờ"
            self.table.add_video_row(i + 1, "animate", status)
    
    # ─────────────────────────────────────────────────────────────────────────
    # 6.1: Xử lý sự kiện (Slots)
    # ─────────────────────────────────────────────────────────────────────────
    def _on_start_clicked(self):
        """Xử lý khi nhấn nút BẮT ĐẦU TẠO VIDEO"""
        ui_config = self.config_panel.get_config()
        
        # DEBUG: In ra các đường dẫn để kiểm tra
        print(f"[DEBUG] product_image_path: '{ui_config['product_image_path']}'")
        print(f"[DEBUG] ref_path: '{ui_config['ref_path']}'")
        print(f"[DEBUG] Exists product: {os.path.exists(ui_config['product_image_path']) if ui_config['product_image_path'] else False}")
        print(f"[DEBUG] Exists ref: {os.path.exists(ui_config['ref_path']) if ui_config['ref_path'] else False}")
        
        # Kiểm tra prompt
        if not ui_config['prompt'].strip():
            QMessageBox.warning(self, "Thiếu thông tin", "Vui lòng nhập prompt!")
            return
        
        # Kiểm tra ảnh sản phẩm
        if not ui_config['product_image_path'] or not os.path.exists(ui_config['product_image_path']):
            QMessageBox.warning(self, "Thiếu thông tin", "Vui lòng chọn ảnh sản phẩm!")
            return
        
        # Kiểm tra ảnh nhân vật
        if not ui_config['ref_path'] or not os.path.exists(ui_config['ref_path']):
            QMessageBox.warning(self, "Thiếu thông tin", "Vui lòng chọn ảnh/video nhân vật!")
            return
        
        # Lấy API key
        api_key = ui_config.get('api_key', '') or app_config.GEMINI_API_KEY
        if not api_key:
            QMessageBox.warning(self, "Thiếu thông tin", "Vui lòng nhập API Key!")
            return
        
        # Tạo config cho worker
        # Xác định chế độ video (short 8s hoặc extended)
        is_extended = ui_config.get('is_extended', False)
        if is_extended:
            video_duration = ui_config.get('extended_duration', 30)  # Từ spinbox
        else:
            video_duration = 8  # Video short cố định 8s
        
        workflow_config = VideoWorkflowConfig(
            api_key=api_key,
            product_image=ui_config['product_image_path'],
            ref_image=ui_config['ref_path'],
            prompt=ui_config['prompt'],
            output_dir=ui_config['output_path'] or './output/videos',
            video_count=ui_config.get('videos_per_prompt', 2),
            video_duration=video_duration,
            aspect_ratio=ui_config.get('ratio', '9:16'),
            model=ui_config.get('model', 'veo-3.1-fast-generate-preview'),
            threads=ui_config.get('threads', 1),
            is_extended=is_extended
        )
        
        # Disable nút bắt đầu
        self.config_panel.start_btn.setEnabled(False)
        self.config_panel.start_btn.setText("⏳ Đang xử lý...")
        
        # GIỮ LẠI LỊCH SỬ - Không xóa bảng cũ, thêm rows mới vào cuối
        # Lấy STT tiếp theo từ số hàng hiện tại
        current_row_count = self.table.rowCount()
        video_count = ui_config.get('videos_per_prompt', 2)
        
        # Lưu paths để dùng trong progress updates
        self._current_product_path = ui_config['product_image_path']
        self._current_ref_path = ui_config['ref_path']
        
        # Lưu index của rows mới để update progress
        self._new_row_start = current_row_count
        
        # Tạo rows MỚI với ảnh và prompt "..." - thêm vào cuối
        for i in range(video_count):
            self.table.add_video_row(
                stt=current_row_count + i + 1,  # STT tiếp theo
                prompt="...",
                status="0%",
                product_path=self._current_product_path,
                ref_path=self._current_ref_path
            )
        
        # Tạo và chạy worker
        self.video_worker = VideoWorker(workflow_config)
        self.video_worker.progress.connect(self._on_worker_progress)
        self.video_worker.step_completed.connect(self._on_step_completed)
        self.video_worker.finished_all.connect(self._on_worker_finished)
        self.video_worker.start()
    
    def _on_worker_progress(self, message: str, level: str):
        """Xử lý log từ worker"""
        # Tìm MainWindow để log
        main_window = self.window()
        if hasattr(main_window, 'log'):
            main_window.log(message, level)
        else:
            print(f"[{level}] {message}")
    
    def _on_step_completed(self, step_name: str, result: dict):
        """Xử lý khi hoàn thành một bước - cập nhật tiến độ theo %"""
        print(f"[STEP COMPLETED] {step_name}")
        
        if step_name == "image_analysis":
            # 25% - Phân tích ảnh hoàn tất - chỉ update rows MỚI
            start_row = getattr(self, '_new_row_start', 0)
            for row in range(start_row, self.table.rowCount()):
                self.table.update_row_progress(row, "25%")
        
        elif step_name == "script_generation":
            # 50% - Kịch bản hoàn tất, cập nhật prompt tiếng Việt
            # Cấu trúc script: {"tong_quan": {...}, "canh": [...]}
            scenes = result.get("canh", [])
            print(f"[DEBUG] Found {len(scenes)} scenes in script")
            start_row = getattr(self, '_new_row_start', 0)
            for i, scene in enumerate(scenes):
                row_idx = start_row + i
                if row_idx < self.table.rowCount():
                    # Hiển thị mô tả tiếng Việt: hành động + bối cảnh
                    hanh_dong = scene.get("hanh_dong", "")
                    boi_canh = scene.get("boi_canh", "")
                    prompt_vn = f"{hanh_dong}"
                    self.table.update_row_progress(row=row_idx, progress="50%", prompt=prompt_vn)
        
        elif step_name == "prompt_conversion":
            # 75% - Prompt Veo hoàn tất - chỉ update rows MỚI
            start_row = getattr(self, '_new_row_start', 0)
            for row in range(start_row, self.table.rowCount()):
                self.table.update_row_progress(row, "75%")
        
        elif step_name == "video_generation":
            # 100% - Video hoàn tất - CẬP NHẬT VIDEO BUTTONS
            videos = result.get("videos", [])
            start_row = getattr(self, '_new_row_start', 0)
            
            print(f"[VIDEO] Got {len(videos)} videos, starting from row {start_row}")
            
            for i, video_path in enumerate(videos):
                row_idx = start_row + i
                if row_idx < self.table.rowCount():
                    # Update progress to 100%
                    self.table.update_row_progress(row=row_idx, progress="100%")
                    
                    # ✅ CẬP NHẬT VIDEO BUTTON trong slot
                    video_widget = self.table.cellWidget(row_idx, 5)
                    if video_widget and video_path:
                        # Tìm button slot đầu tiên (i=0 vì mỗi row có 1 video)
                        video_btn = video_widget.findChild(QPushButton, f"video_slot_0")
                        
                        if video_btn:
                            video_filename = os.path.basename(video_path)
                            
                            # Enable button
                            video_btn.setEnabled(True)
                            video_btn.setText("▶")
                            video_btn.setToolTip(f"Click để xem: {video_filename}")
                            
                            # Update style - video available
                            video_btn.setStyleSheet("""
                                QPushButton { 
                                    background: #4CAF50; 
                                    color: white; 
                                    font-size: 14px; 
                                    font-weight: bold;
                                    border-radius: 4px;
                                    border: none;
                                }
                                QPushButton:hover { 
                                    background: #45a049;
                                }
                                QPushButton:pressed {
                                    background: #3d8b40;
                                }
                            """)
                            
                            # Connect click handler to open video
                            video_btn.clicked.connect(lambda checked, path=video_path: self._open_video(path))
                            
                            print(f"[VIDEO] Updated button for row {row_idx}: {video_filename}")
    
    def _open_video(self, video_path: str):
        """Helper: Mở video với default player"""
        import subprocess
        import sys
        
        if not os.path.exists(video_path):
            QMessageBox.warning(self, "Lỗi", f"Video không tồn tại:\n{video_path}")
            return
        
        try:
            if sys.platform == 'win32':
                os.startfile(video_path)
            elif sys.platform == 'darwin':  # macOS
                subprocess.run(['open', video_path])
            else:  # Linux
                subprocess.run(['xdg-open', video_path])
            
            print(f"[VIDEO] Opened: {video_path}")
        except Exception as e:
            QMessageBox.warning(self, "Lỗi", f"Không thể mở video:\n{str(e)}")
    
    def _on_worker_finished(self, success: bool, message: str):
        """Xử lý khi worker hoàn thành"""
        # Enable lại nút
        self.config_panel.start_btn.setEnabled(True)
        self.config_panel.start_btn.setText("▶ BẮT ĐẦU TẠO VIDEO")
        
        # Lưu lịch sử sau khi hoàn tất
        self._save_history()
        
        if success:
            QMessageBox.information(self, "Hoàn tất", message)
        else:
            QMessageBox.warning(self, "Lỗi", message)
    
    def _on_add_clicked(self):
        """Xử lý khi nhấn nút Thêm"""
        row_count = self.table.rowCount()
        self.table.add_video_row(row_count + 1, "", "Đang chờ")
    
    def _on_play_video(self, row: int, column: int):
        """
        Xử lý khi double-click vào cell - mở video nếu cột Video kết quả
        """
        # Cột 5 là Video kết quả
        if column == 5:
            video_item = self.table.item(row, 5)
            if video_item:
                video_path = video_item.data(Qt.ItemDataRole.UserRole)
                if video_path and os.path.exists(video_path):
                    # Dùng shared helper
                    self._open_video(video_path)
                else:
                    QMessageBox.information(self, "Thông báo", "Video chưa được tạo hoặc không tồn tại!")
    
    
    def _on_delete_clicked(self):
        """Xử lý khi nhấn nút Xóa - Xóa các hàng được chọn"""
        rows_to_delete = []
        
        # Tìm các hàng được chọn (checkbox)
        for row in range(self.table.rowCount()):
            widget = self.table.cellWidget(row, 0)
            if widget:
                checkbox = widget.findChild(QCheckBox)
                if checkbox and checkbox.isChecked():
                    rows_to_delete.append(row)
        
        if not rows_to_delete:
            QMessageBox.information(self, "Thông báo", "Vui lòng chọn ít nhất một hàng để xóa!")
            return
        
        # Xóa từ cuối lên để không bị lỗi index
        for row in reversed(rows_to_delete):
            self.table.removeRow(row)
        
        # Cập nhật lại STT
        for row in range(self.table.rowCount()):
            stt_item = self.table.item(row, 1)
            if stt_item:
                stt_item.setText(str(row + 1))
    
    def _on_select_all(self):
        """Toggle chọn/bỏ chọn tất cả"""
        # Đếm số hàng đang được chọn
        selected_count = 0
        for row in range(self.table.rowCount()):
            widget = self.table.cellWidget(row, 0)
            if widget:
                checkbox = widget.findChild(QCheckBox)
                if checkbox and checkbox.isChecked():
                    selected_count += 1
        
        # Nếu tất cả đang chọn -> bỏ chọn, ngược lại -> chọn tất cả
        new_state = selected_count != self.table.rowCount()
        
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
            "Images (*.png *.jpg *.jpeg *.webp *.gif)"
        )
        
        if files:
            prompt = self.config_panel.prompt_text.toPlainText()
            for file_path in files:
                row_count = self.table.rowCount()
                # Thêm hàng mới với ảnh đã chọn
                self.table.add_video_row(row_count + 1, prompt or os.path.basename(file_path), "Đang chờ")
            
            QMessageBox.information(
                self, 
                "Thành công", 
                f"Đã import {len(files)} ảnh vào danh sách!"
            )
    
    def _on_open_video_folder(self):
        """Mở thư mục chứa video đầu ra"""
        output_path = self.config_panel.output_path.text()
        
        if os.path.exists(output_path):
            # Mở thư mục trong File Explorer
            os.startfile(output_path)
        else:
            # Tạo thư mục nếu chưa có
            reply = QMessageBox.question(
                self,
                "Thư mục không tồn tại",
                f"Thư mục '{output_path}' chưa tồn tại.\nBạn có muốn tạo không?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )
            if reply == QMessageBox.StandardButton.Yes:
                os.makedirs(output_path, exist_ok=True)
                os.startfile(output_path)


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 7: VEO SETTINGS TAB (Tab cài đặt Veo riêng)
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
        self.worker = None
    
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
        
        # Phần phải: VeoSettingsPanel (khác với ConfigPanel)
        self.veo_panel = VeoSettingsPanel()
        
        # Ghép vào layout chính
        layout.addWidget(left_widget, 1)  # stretch = 1
        layout.addWidget(self.veo_panel)
    
    def _connect_signals(self):
        """Kết nối các signals với slots"""
        # Kết nối signals từ veo panel
        self.veo_panel.start_clicked.connect(self._on_start_veo_clicked)
        
        # Kết nối signals từ toolbar
        self.toolbar.add_clicked.connect(self._on_add_clicked)
        self.toolbar.delete_clicked.connect(self._on_delete_clicked)
        self.toolbar.select_all_clicked.connect(self._on_select_all)
        self.toolbar.import_images_clicked.connect(self._on_import_images)
    
    def _on_start_veo_clicked(self):
        """Xử lý khi nhấn nút BẮT ĐẦU TẠO VIDEO VEO"""
        # Lấy cấu hình từ Veo panel
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
        
        # Kiểm tra prompt
        if not veo_config['prompt'].strip():
            QMessageBox.warning(
                self,
                "Thiếu Prompt",
                "Vui lòng nhập prompt hoặc load từ workflow trước!"
            )
            return
        
        # TODO: Tích hợp với PlaywrightVeoService
        # from src.app.services.browser_veo_service import PlaywrightVeoService
        # service = PlaywrightVeoService(cookie_string=..., download_dir=veo_config['output_dir'])
        # result = service.generate_video(
        #     prompt=veo_config['prompt'],
        #     aspect_ratio=veo_config['aspect_ratio'],
        #     output_count=veo_config['output_count'],
        #     model=veo_config['model']
        # )
        
        QMessageBox.information(
            self,
            "Đang phát triển",
            "Tính năng tạo video Veo đang được phát triển.\n\n"
            f"Cấu hình đã lưu:\n"
            f"- Model: {veo_config['model']}\n"
            f"- Aspect: {veo_config['aspect_ratio']}\n"
            f"- Videos: {veo_config['output_count']}"
        )
    
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
        
        for i, file_path in enumerate(files):
            row_count = self.table.rowCount()
            self.table.add_video_row(row_count + 1, product_path=file_path)
    
    def set_prompt_from_workflow(self, prompt: str):
        """Set prompt từ workflow trước (gọi từ bên ngoài)"""
        self.veo_panel.set_prompt(prompt)
    
    def set_cookie_count(self, count: int):
        """Cập nhật số lượng cookie"""
        self.veo_panel.set_cookie_count(count)
