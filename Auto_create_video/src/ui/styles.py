"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                              STYLES - GIAO DIỆN                               ║
║                                                                               ║
║  Mô tả: Tập trung tất cả styles, colors cho ứng dụng                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 1: BẢNG MÀU
# ═══════════════════════════════════════════════════════════════════════════════

class Colors:
    """Bảng màu chính của ứng dụng"""
    
    # Nền
    BG_DARK = "#121212"         # Nền chính
    BG_MEDIUM = "#1e1e1e"       # Nền panel
    BG_LIGHT = "#2a2a2a"        # Nền input
    
    # Viền
    BORDER = "#444"
    BORDER_LIGHT = "#555"
    
    # Text
    TEXT = "#e0e0e0"
    TEXT_MUTED = "#888"
    TEXT_DARK = "#666"
    
    # Accent
    PRIMARY = "#2563eb"         # Xanh dương
    SUCCESS = "#22c55e"         # Xanh lá
    WARNING = "#f59e0b"         # Vàng cam
    ERROR = "#ef4444"           # Đỏ
    ACCENT = "#ffcc00"          # Vàng (highlight)


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 2: DARK THEME STYLESHEET
# ═══════════════════════════════════════════════════════════════════════════════

DARK_THEME = f"""
/* ═══════════ NỀN CHÍNH ═══════════ */
QMainWindow, QWidget {{
    background-color: {Colors.BG_DARK};
    color: {Colors.TEXT};
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 12px;
}}

/* ═══════════ TAB BAR ═══════════ */
QTabWidget::pane {{
    border: none;
}}

QTabBar::tab {{
    background: {Colors.BG_LIGHT};
    color: {Colors.TEXT_MUTED};
    padding: 10px 25px;
    border: none;
    margin-right: 2px;
}}

QTabBar::tab:selected {{
    background: {Colors.BG_MEDIUM};
    color: {Colors.ACCENT};
    border-bottom: 2px solid {Colors.ACCENT};
}}

/* ═══════════ BẢNG (TABLE) ═══════════ */
QTableWidget {{
    background-color: {Colors.BG_DARK};
    border: none;
    gridline-color: #333;
}}

QTableWidget::item {{
    padding: 5px;
    border-bottom: 1px solid #2a2a2a;
}}

QTableWidget::item:selected {{
    background-color: #333;
}}

QHeaderView::section {{
    background-color: #222;
    color: {Colors.TEXT_MUTED};
    padding: 8px;
    border: none;
    border-bottom: 2px solid #333;
    font-size: 11px;
}}

/* ═══════════ INPUT FIELDS ═══════════ */
QLineEdit, QTextEdit {{
    background: {Colors.BG_LIGHT};
    border: 1px solid {Colors.BORDER};
    border-radius: 4px;
    padding: 8px;
    color: {Colors.TEXT};
}}

QLineEdit:focus, QTextEdit:focus {{
    border-color: {Colors.PRIMARY};
}}

/* ═══════════ COMBOBOX ═══════════ */
QComboBox {{
    background: {Colors.BG_LIGHT};
    border: 1px solid {Colors.BORDER};
    border-radius: 4px;
    padding: 8px;
    color: {Colors.TEXT};
}}

QComboBox::drop-down {{
    border: none;
    width: 20px;
}}

QComboBox QAbstractItemView {{
    background: {Colors.BG_LIGHT};
    color: {Colors.TEXT};
    selection-background-color: {Colors.PRIMARY};
}}

/* ═══════════ BUTTONS ═══════════ */
QPushButton {{
    background: {Colors.BG_LIGHT};
    color: {Colors.TEXT};
    border: 1px solid {Colors.BORDER};
    border-radius: 4px;
    padding: 8px 15px;
}}

QPushButton:hover {{
    background: #3a3a3a;
}}

QPushButton:pressed {{
    background: #2a2a2a;
}}

/* ═══════════ CHECKBOX ═══════════ */
QCheckBox {{
    color: {Colors.TEXT_MUTED};
    spacing: 6px;
}}

QCheckBox::indicator {{
    width: 16px;
    height: 16px;
    border: 1px solid {Colors.BORDER};
    border-radius: 3px;
    background: {Colors.BG_LIGHT};
}}

QCheckBox::indicator:checked {{
    background: {Colors.SUCCESS};
    border-color: {Colors.SUCCESS};
}}

/* ═══════════ SPINBOX ═══════════ */
QSpinBox {{
    background: {Colors.BG_LIGHT};
    border: 1px solid {Colors.BORDER};
    border-radius: 4px;
    padding: 6px;
    color: {Colors.TEXT};
}}

/* ═══════════ SCROLL BAR ═══════════ */
QScrollBar:vertical {{
    width: 8px;
    background: {Colors.BG_DARK};
}}

QScrollBar::handle:vertical {{
    background: {Colors.BORDER};
    border-radius: 4px;
    min-height: 30px;
}}

QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
    height: 0;
}}

/* ═══════════ STATUS BAR ═══════════ */
QStatusBar {{
    background: {Colors.BG_DARK};
    color: {Colors.TEXT_MUTED};
    border-top: 1px solid #333;
    padding: 5px;
}}
"""


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 3: BUTTON STYLES (Dùng cho các nút cụ thể)
# ═══════════════════════════════════════════════════════════════════════════════

class ButtonStyles:
    """Styles cho các loại button khác nhau"""
    
    PRIMARY = f"""
        QPushButton {{
            background: {Colors.PRIMARY};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
        }}
        QPushButton:hover {{ background: #1d4ed8; }}
    """
    
    SUCCESS = f"""
        QPushButton {{
            background: {Colors.SUCCESS};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
        }}
        QPushButton:hover {{ background: #16a34a; }}
    """
    
    WARNING = f"""
        QPushButton {{
            background: {Colors.WARNING};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
        }}
        QPushButton:hover {{ background: #d97706; }}
    """
    
    DANGER = f"""
        QPushButton {{
            background: {Colors.ERROR};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
        }}
        QPushButton:hover {{ background: #dc2626; }}
    """
