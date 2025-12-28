"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                         UI CONFIG - CẤU HÌNH GIAO DIỆN                       ║
║                                                                               ║
║  Single source of truth cho tất cả cấu hình UI trong ứng dụng               ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""


class UIConfig:
    """Cấu hình giao diện - Tập trung tất cả các giá trị có thể thay đổi"""
    
    # === Kích thước Panel cấu hình ===
    CONFIG_PANEL_WIDTH = 450       # Chiều rộng panel bên phải (px)
    CONFIG_PANEL_MARGIN_RIGHT = 15  # Khoảng cách bên phải (px)
    PANEL_WIDTH = 400              # Chiều rộng panel settings (px)
    MARGIN = 12                    # Margin chung (px)
    
    # === Kích thước bảng video ===
    TABLE_ROW_HEIGHT = 50          # Chiều cao mỗi hàng trong bảng (px)
    TABLE_COLUMN_WIDTHS = {
        'checkbox': 28,
        'stt': 35,
        'image': 85,
        'status': 70,
        'video_buttons': 240       # 4 nút x 40px + spacing
    }
    
    # === Màu sắc chính (UNIFIED) ===
    COLORS = {
        # Background
        'background': '#1e1e1e',
        'background_dark': '#1a1a1a',
        'surface': '#252525',
        'border': '#333333',
        
        # Text
        'text': '#e0e0e0',
        'text_muted': '#888888',
        
        # Accent colors
        'accent_green': '#22c55e',
        'accent_blue': '#2563eb',
        'accent_orange': '#ea580c',
        'accent_yellow': '#ffcc00',
        'accent_red': '#ef4444',
        
        # Status colors
        'success': '#4CAF50',
        'warning': '#ff9800',
        'error': '#f44336',
    }
    
    # === Style nút bấm với hiệu ứng pressed ===
    @staticmethod
    def get_button_style(bg_color: str = "#2563eb", text_color: str = "white") -> str:
        """Trả về style cho nút với hiệu ứng hover và pressed"""
        return f"""
            QPushButton {{
                background: {bg_color}; 
                color: {text_color}; 
                border: none; 
                border-radius: 4px;
                padding: 6px 12px;
            }}
            QPushButton:hover {{
                background: {bg_color}; 
                filter: brightness(1.1);
            }}
            QPushButton:pressed {{
                background: #333;
                color: #888;
            }}
        """
