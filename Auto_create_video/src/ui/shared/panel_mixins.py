"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                      PANEL MIXINS - HELPER METHODS                           ║
║                                                                               ║
║  Mixin class cung cấp các phương thức tiện ích cho Panel                    ║
║  Usage: class MyPanel(QFrame, BasePanelMixin):                              ║
║  Requires: self.content_layout (QVBoxLayout)                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from PyQt6.QtWidgets import QLabel, QComboBox
from PyQt6.QtCore import Qt


class BasePanelMixin:
    """
    Mixin cung cấp các phương thức tiện ích cho Panel.
    
    Yêu cầu:
    - self.content_layout (QVBoxLayout) phải được định nghĩa trước khi sử dụng
    """
    
    def _add_section_header(self, title: str):
        """Thêm tiêu đề section với style chuẩn"""
        lbl = QLabel(title)
        lbl.setStyleSheet("""
            color: #3b82f6; font-size: 11px; font-weight: bold;
            padding: 8px 0 4px 0; border-bottom: 1px solid #333;
        """)
        self.content_layout.addWidget(lbl)
    
    def _add_label(self, text: str):
        """Thêm label nhỏ với style muted"""
        lbl = QLabel(text)
        lbl.setStyleSheet("color: #888; font-size: 10px;")
        self.content_layout.addWidget(lbl)
    
    def _style_combo(self, combo: QComboBox):
        """Áp dụng style chuẩn cho combobox + tắt scroll wheel"""
        # Tắt scroll wheel - chỉ cho phép thay đổi khi click
        combo.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        combo.wheelEvent = lambda e: e.ignore()
        
        combo.setStyleSheet("""
            QComboBox {
                background: #2a2a2a; border: 1px solid #444;
                padding: 8px; color: white; border-radius: 4px;
            }
            QComboBox::drop-down { border: none; }
            QComboBox QAbstractItemView { background: #2a2a2a; color: white; }
        """)
