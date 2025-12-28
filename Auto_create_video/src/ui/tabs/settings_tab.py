"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                           SETTINGS TAB                                        ║
║         Tab chứa các cài đặt chung: Cookie, API Key                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import json
from pathlib import Path

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QFrame, QLabel,
    QPushButton, QLineEdit, QTextEdit, QScrollArea, QComboBox,
    QFileDialog, QMessageBox
)
from PyQt6.QtCore import Qt, pyqtSignal

from src.app.config import Config as app_config

# Import shared UI components
from src.ui.shared import UIConfig, BasePanelMixin


# ═══════════════════════════════════════════════════════════════════════════════
# SETTINGS FILE PATH
# ═══════════════════════════════════════════════════════════════════════════════
# Lưu settings vào src/resource/user_settings.json
SETTINGS_DIR = Path(__file__).parent.parent.parent / "resource"
SETTINGS_FILE = SETTINGS_DIR / "user_settings.json"


def load_user_settings() -> dict:
    """Load settings từ file JSON"""
    try:
        if SETTINGS_FILE.exists():
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"[SETTINGS] Lỗi load settings: {e}")
    return {}


def save_user_settings(settings: dict):
    """Lưu settings vào file JSON"""
    try:
        # Tạo thư mục nếu chưa có
        SETTINGS_DIR.mkdir(parents=True, exist_ok=True)
        
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=2, ensure_ascii=False)
        print(f"[SETTINGS] Saved settings to {SETTINGS_FILE}")
    except Exception as e:
        print(f"[SETTINGS] Error saving settings: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# SETTINGS PANEL
# ═══════════════════════════════════════════════════════════════════════════════
class SettingsPanel(QFrame, BasePanelMixin):
    """
    Panel cài đặt chung.
    
    Chứa:
    - Cookie (cho Web Automation)
    - API Key (cho Veo API)
    """
    
    # Signals
    cookie_changed = pyqtSignal(str)  # Khi cookie thay đổi
    api_key_changed = pyqtSignal(str)  # Khi API key thay đổi
    import_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self._init_style()
        self._init_layout()
        self._create_sections()
        self._load_saved_settings()  # Load settings đã lưu
    
    def _init_style(self):
        """Thiết lập style"""
        self.setStyleSheet(f"""
            SettingsPanel {{
                background-color: {UIConfig.COLORS['background']};
            }}
        """)
    
    def _init_layout(self):
        """Thiết lập layout"""
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(UIConfig.MARGIN, UIConfig.MARGIN, UIConfig.MARGIN, UIConfig.MARGIN)
        self.main_layout.setSpacing(10)
        
        # Scroll area
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
        self.content_layout.setContentsMargins(0, 0, 0, 0)
        self.content_layout.setSpacing(15)
        
        self.scroll.setWidget(self.content)
        self.main_layout.addWidget(self.scroll, 1)
    
    def _create_sections(self):
        """Tạo các section"""
        self._create_cookie_section()
        self._create_api_key_section()
        self.content_layout.addStretch()
    
    # _add_section_header, _add_label kế thừa từ BasePanelMixin
    
    def _create_cookie_section(self):
        """Section Cookie (Web Automation) - Đơn giản"""
        self._add_section_header("🍪 COOKIE (Web Automation)")
        
        # Ghi chú
        note = QLabel("Cookie dùng để đăng nhập vào Flow/Veo mà không cần browser thủ công.")
        note.setWordWrap(True)
        note.setStyleSheet(f"color: {UIConfig.COLORS['text_muted']}; font-size: 10px;")
        self.content_layout.addWidget(note)
        
        # Status row
        status_row = QHBoxLayout()
        
        self.cookie_btn = QPushButton("🍪 Cookie: Chưa nhập")
        self.cookie_btn.setStyleSheet(f"""
            QPushButton {{ 
                background: {UIConfig.COLORS['background_dark']}; 
                color: {UIConfig.COLORS['text_muted']};
                border: 1px solid #444; 
                padding: 8px 12px; 
                border-radius: 4px; 
                text-align: left;
            }}
        """)
        status_row.addWidget(self.cookie_btn)
        
        self.import_btn = QPushButton("� Import từ Browser")
        self.import_btn.setStyleSheet("""
            QPushButton { background: #2563eb; color: white;
                padding: 8px 12px; border-radius: 4px; }
            QPushButton:hover { background: #1d4ed8; }
        """)
        self.import_btn.clicked.connect(self.import_clicked.emit)
        status_row.addWidget(self.import_btn)
        
        status_container = QWidget()
        status_container.setLayout(status_row)
        self.content_layout.addWidget(status_container)
        
        # Cookie input
        self._add_label("Cookie string:")
        self.cookie_input = QTextEdit()
        self.cookie_input.setPlaceholderText("Paste cookie string ở đây...")
        self.cookie_input.setMinimumHeight(80)
        self.cookie_input.setMaximumHeight(120)
        self.cookie_input.setStyleSheet("""
            QTextEdit { background: #2d2d2d; color: #e0e0e0;
                border: 1px solid #444; padding: 8px; border-radius: 4px;
                font-family: 'Consolas', monospace; font-size: 11px; }
        """)
        self.cookie_input.textChanged.connect(self._on_cookie_changed)
        self.content_layout.addWidget(self.cookie_input)
    
    def _create_api_key_section(self):
        """Section API Key"""
        self._add_section_header("🔑 API KEY (Gemini/Veo)")
        
        # Ghi chú
        note = QLabel("API Key dùng để phân tích ảnh và gọi Veo API trực tiếp (không cần browser).")
        note.setWordWrap(True)
        note.setStyleSheet(f"color: {UIConfig.COLORS['text_muted']}; font-size: 10px;")
        self.content_layout.addWidget(note)
        
        # API Key input
        row = QHBoxLayout()
        
        self.api_key_input = QLineEdit()
        self.api_key_input.setPlaceholderText("Nhập API Key...")
        self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.api_key_input.setStyleSheet("""
            QLineEdit { background: #2d2d2d; color: #e0e0e0;
                border: 1px solid #444; padding: 8px; border-radius: 4px; }
            QLineEdit:focus { border-color: #2563eb; }
        """)
        
        # Load từ .env
        if app_config.GEMINI_API_KEY:
            self.api_key_input.setText(app_config.GEMINI_API_KEY)
        
        row.addWidget(self.api_key_input)
        
        # Nút hiện/ẩn
        self.show_key_btn = QPushButton("👁")
        self.show_key_btn.setFixedSize(35, 35)
        self.show_key_btn.setStyleSheet("QPushButton { background: #444; border-radius: 4px; }")
        self.show_key_btn.clicked.connect(self._toggle_api_key_visibility)
        row.addWidget(self.show_key_btn)
        
        container = QWidget()
        container.setLayout(row)
        self.content_layout.addWidget(container)
        
        # Nút Save
        self.save_key_btn = QPushButton("💾 Lưu API Key vào .env")
        self.save_key_btn.setStyleSheet("""
            QPushButton { background: #22c55e; color: white;
                padding: 10px; border-radius: 4px; font-weight: bold; }
            QPushButton:hover { background: #16a34a; }
        """)
        self.save_key_btn.clicked.connect(self._save_api_key)
        self.content_layout.addWidget(self.save_key_btn)
    
    def _on_cookie_changed(self):
        """Khi cookie thay đổi"""
        cookie = self.cookie_input.toPlainText().strip()
        
        # Hiển thị trạng thái đơn giản thay vì đếm số
        if cookie:
            self.cookie_btn.setText("🍪 Cookie: ✓ Đã nhập")
            self.cookie_btn.setStyleSheet(f"""
                QPushButton {{
                    background: {UIConfig.COLORS['background_dark']};
                    color: {UIConfig.COLORS['success']};
                    border: 1px solid {UIConfig.COLORS['success']};
                    padding: 8px;
                    border-radius: 4px;
                    text-align: left;
                }}
            """)
        else:
            self.cookie_btn.setText("🍪 Cookie: Chưa nhập")
            self.cookie_btn.setStyleSheet(f"""
                QPushButton {{
                    background: {UIConfig.COLORS['background_dark']};
                    color: {UIConfig.COLORS['text_muted']};
                    border: 1px solid #444;
                    padding: 8px;
                    border-radius: 4px;
                    text-align: left;
                }}
            """)
        
        self.cookie_changed.emit(cookie)
        
        # Auto-save khi thay đổi
        self._save_settings()
    
    def _toggle_api_key_visibility(self):
        """Hiện/ẩn API key"""
        if self.api_key_input.echoMode() == QLineEdit.EchoMode.Password:
            self.api_key_input.setEchoMode(QLineEdit.EchoMode.Normal)
            self.show_key_btn.setText("🙈")
        else:
            self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password)
            self.show_key_btn.setText("👁")
    
    def _save_api_key(self):
        """Lưu API key vào file settings và .env"""
        api_key = self.api_key_input.text().strip()
        if not api_key:
            QMessageBox.warning(self, "Lỗi", "Vui lòng nhập API Key!")
            return
        
        # Lưu vào settings file (local)
        self._save_settings()
        
        # Lưu vào .env
        env_path = os.path.join(os.getcwd(), '.env')
        
        try:
            lines = []
            if os.path.exists(env_path):
                with open(env_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
            
            # Tìm và thay thế
            found = False
            for i, line in enumerate(lines):
                if line.startswith('GEMINI_API_KEY='):
                    lines[i] = f'GEMINI_API_KEY={api_key}\n'
                    found = True
                    break
            
            if not found:
                lines.append(f'\nGEMINI_API_KEY={api_key}\n')
            
            with open(env_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            
            # Update runtime config immediately
            app_config.GEMINI_API_KEY = api_key
            
            QMessageBox.information(self, "✓ Thành công", "Đã lưu API Key!\n\nSettings được lưu tự động.")
            self.api_key_changed.emit(api_key)
            
        except Exception as e:
            QMessageBox.critical(self, "Lỗi", f"Không thể lưu: {e}")
    # === Public methods ===
    def get_cookie(self) -> str:
        """Lấy cookie string"""
        return self.cookie_input.toPlainText().strip()
    
    def get_api_key(self) -> str:
        """Lấy API key"""
        return self.api_key_input.text().strip() or app_config.GEMINI_API_KEY
    
    def set_cookie(self, cookie: str):
        """Set cookie"""
        self.cookie_input.setPlainText(cookie)
    
    def _load_saved_settings(self):
        """Load settings đã lưu từ file"""
        settings = load_user_settings()
        
        # Load cookie
        if 'cookie' in settings:
            self.cookie_input.blockSignals(True)  # Tạm tắt signal
            self.cookie_input.setPlainText(settings['cookie'])
            self.cookie_input.blockSignals(False)
            self._on_cookie_changed()  # Update UI
            print("[SETTINGS] Loaded cookie from file")
        
        # Load API key (ưu tiên file settings, sau đó .env)
        if 'api_key' in settings and settings['api_key']:
            self.api_key_input.setText(settings['api_key'])
            print("[SETTINGS] Loaded API key from file")
    
    def _save_settings(self):
        """Lưu settings hiện tại vào file"""
        settings = load_user_settings()  # Load settings cũ
        
        # Cập nhật (không lưu platform - đã chuyển sang VeoSettingsTab)
        settings['cookie'] = self.cookie_input.toPlainText()
        settings['api_key'] = self.api_key_input.text().strip()
        
        save_user_settings(settings)


# ═══════════════════════════════════════════════════════════════════════════════
# SETTINGS TAB
# ═══════════════════════════════════════════════════════════════════════════════
class SettingsTab(QWidget):
    """
    Tab Settings - Chứa các cài đặt chung cho toàn bộ ứng dụng.
    
    Layout đơn giản với SettingsPanel ở giữa.
    """
    
    # Forward signals từ panel
    cookie_changed = pyqtSignal(str)
    api_key_changed = pyqtSignal(str)
    import_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self._init_ui()
        self._connect_signals()
    
    def _init_ui(self):
        """Khởi tạo giao diện"""
        layout = QHBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)
        
        # Panel chính
        self.settings_panel = SettingsPanel()
        self.settings_panel.setMaximumWidth(500)
        
        # Căn giữa
        layout.addStretch()
        layout.addWidget(self.settings_panel)
        layout.addStretch()
        
        self.setStyleSheet(f"background: {UIConfig.COLORS['background']};")
    
    def _connect_signals(self):
        """Kết nối signals"""
        self.settings_panel.cookie_changed.connect(self.cookie_changed.emit)
        self.settings_panel.api_key_changed.connect(self.api_key_changed.emit)
        self.settings_panel.import_clicked.connect(self.import_clicked.emit)
    
    # === Public API ===
    def get_cookie(self) -> str:
        return self.settings_panel.get_cookie()
    
    def get_api_key(self) -> str:
        return self.settings_panel.get_api_key()
    
    def get_platform(self) -> str:
        return self.settings_panel.get_platform()
    
    def set_cookie(self, cookie: str):
        self.settings_panel.set_cookie(cookie)
