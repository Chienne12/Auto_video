"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                      AUTO VIDEO GENERATOR - ENTRY POINT                       ║
║                                                                               ║
║  Mô tả: Điểm khởi chạy chính của ứng dụng                                    ║
║  Sử dụng: python main.py                                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import sys
from PyQt6.QtWidgets import QApplication
from src.ui.main_window import MainWindow


def main():
    """Hàm chính khởi chạy ứng dụng"""
    
    # Tạo ứng dụng Qt
    app = QApplication(sys.argv)
    
    # Thiết lập metadata
    app.setApplicationName("TikTok Video Automation")
    app.setApplicationVersion("1.0.0")
    app.setOrganizationName("AutoVideo")
    
    # Tạo và hiển thị cửa sổ chính
    window = MainWindow()
    window.show()
    
    # Chạy event loop
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
