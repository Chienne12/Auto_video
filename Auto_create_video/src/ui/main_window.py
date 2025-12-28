"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                     MAIN WINDOW - CỬA SỔ CHÍNH                                ║
║                                                                               ║
║  Mô tả: Cửa sổ chính của ứng dụng với giao diện Veo Auto                     ║
║  Bao gồm: Tabs, Status Bar, Log Panel                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from datetime import datetime
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QTabWidget, QLabel, QPushButton, QStatusBar,
    QFrame, QTextEdit, QSplitter
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont

from src.ui.tabs.video_table import VideoTableTab
from src.ui.tabs.veo_settings_tab import VeoSettingsTab
from src.ui.tabs.settings_tab import SettingsTab
from src.ui.styles import DARK_THEME


# ═══════════════════════════════════════════════════════════════════════════════
# LOG PANEL - Hiển thị log hoạt động
# ═══════════════════════════════════════════════════════════════════════════════

class LogPanel(QFrame):
    """Panel hiển thị log hoạt động - có thể mở/đóng"""
    
    def __init__(self):
        super().__init__()
        self._is_expanded = False
        self._init_ui()
    
    def _init_ui(self):
        """Khởi tạo giao diện"""
        self.setStyleSheet("""
            LogPanel {
                background: #1a1a1a;
                border-top: 1px solid #333;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Header với nút toggle
        header = QFrame()
        header.setFixedHeight(30)
        header.setStyleSheet("background: #222; border-bottom: 1px solid #333;")
        header_layout = QHBoxLayout(header)
        header_layout.setContentsMargins(10, 0, 10, 0)
        
        self.toggle_btn = QPushButton("📋 Log hoạt động ▼")
        self.toggle_btn.setStyleSheet("""
            QPushButton {
                background: transparent; 
                color: #888; 
                border: none;
                text-align: left;
                font-size: 11px;
            }
            QPushButton:hover { color: #fff; }
        """)
        self.toggle_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.toggle_btn.clicked.connect(self.toggle)
        header_layout.addWidget(self.toggle_btn)
        
        header_layout.addStretch()
        
        # Nút xóa log
        clear_btn = QPushButton("🗑 Xóa")
        clear_btn.setStyleSheet("""
            QPushButton {
                background: transparent; color: #666; border: none; font-size: 10px;
            }
            QPushButton:hover { color: #f00; }
        """)
        clear_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        clear_btn.clicked.connect(self.clear_log)
        header_layout.addWidget(clear_btn)
        
        layout.addWidget(header)
        
        # Text area chứa log
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        self.log_text.setStyleSheet("""
            QTextEdit {
                background: #1a1a1a;
                color: #888;
                border: none;
                font-family: 'Consolas', monospace;
                font-size: 11px;
                padding: 5px;
            }
        """)
        self.log_text.setVisible(False)  # Ẩn mặc định
        layout.addWidget(self.log_text)
        
        # Mặc định thu gọn
        self.setFixedHeight(30)
    
    def toggle(self):
        """Mở/đóng panel log"""
        self._is_expanded = not self._is_expanded
        
        if self._is_expanded:
            self.setFixedHeight(150)
            self.log_text.setVisible(True)
            self.toggle_btn.setText("📋 Log hoạt động ▲")
        else:
            self.setFixedHeight(30)
            self.log_text.setVisible(False)
            self.toggle_btn.setText("📋 Log hoạt động ▼")
    
    def log(self, message: str, level: str = "INFO"):
        """Thêm dòng log mới"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Màu theo level
        colors = {
            "INFO": "#888",
            "SUCCESS": "#22c55e",
            "WARNING": "#f59e0b", 
            "ERROR": "#ef4444"
        }
        color = colors.get(level, "#888")
        
        html = f'<span style="color:#555">[{timestamp}]</span> <span style="color:{color}">[{level}]</span> {message}'
        self.log_text.append(html)
        
        # Auto scroll xuống cuối
        scrollbar = self.log_text.verticalScrollBar()
        scrollbar.setValue(scrollbar.maximum())
    
    def clear_log(self):
        """Xóa toàn bộ log"""
        self.log_text.clear()
        self.log("Log đã được xóa", "INFO")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN WINDOW
# ═══════════════════════════════════════════════════════════════════════════════

class MainWindow(QMainWindow):
    """Cửa sổ chính của ứng dụng"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TikTok Video Automation - Veo Auto")
        self.setMinimumSize(1400, 800)
        self.setStyleSheet(DARK_THEME)
        
        self.setup_ui()
    
    def setup_ui(self):
        """Thiết lập giao diện chính"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Tab bar
        self.tabs = QTabWidget()
        self.tabs.setTabPosition(QTabWidget.TabPosition.North)
        self.tabs.setDocumentMode(True)
        self.tabs.setStyleSheet("""
            QTabBar::tab {
                background: #2a2a2a;
                color: #888;
                padding: 8px 20px;
                border: 1px solid #333;
                margin-right: 2px;
            }
            QTabBar::tab:selected {
                background: #3a3a3a;
                color: #ffcc00;
                border-bottom: 2px solid #ffcc00;
            }
        """)
        # Tab 1:  API Veo3 Google
        self.video_table_tab = VideoTableTab()
        self.tabs.addTab(self.video_table_tab, "API Veo3_google")
        # Tab 2: Tool Video Auto
        self.veo_settings_tab = VeoSettingsTab()
        self.tabs.addTab(self.veo_settings_tab, "Tool_Video_Auto")
        
        # Tab 3: Settings
        self.settings_tab = SettingsTab()
        self.tabs.addTab(self.settings_tab, "⚙️ Settings")
        
        # Kết nối cookie từ Settings tab sang VeoSettingsTab
        self.settings_tab.cookie_changed.connect(self._on_cookie_changed)
        
        # Đồng bộ cookie ban đầu (nếu đã có cookie lưu sẵn)
        initial_cookie = self.settings_tab.get_cookie()
        if initial_cookie:
            self._on_cookie_changed(initial_cookie)
        
        
        
        layout.addWidget(self.tabs, 1)  # stretch = 1
        
        # Log Panel ở dưới
        self.log_panel = LogPanel()
        layout.addWidget(self.log_panel)
        
        # Log message khởi tạo
        self.log_panel.log("Ứng dụng đã sẵn sàng!", "SUCCESS")
    
    # ─────────────────────────────────────────────────────────────────────────
    # API Public cho các component khác sử dụng
    # ─────────────────────────────────────────────────────────────────────────
    
    def log(self, message: str, level: str = "INFO"):
        """Thêm log - có thể gọi từ bất kỳ đâu"""
        self.log_panel.log(message, level)
    
    def _on_cookie_changed(self, cookie: str):
        """Đồng bộ cookie từ Settings tab sang VeoSettingsTab"""
        # Cập nhật vào VeoSettingsTab
        if hasattr(self.veo_settings_tab, 'veo_panel'):
            self.veo_settings_tab.veo_panel.cookie_input.setPlainText(cookie)
