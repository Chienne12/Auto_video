"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                      FILE UTILS - FILE DIALOG HELPERS                        ║
║                                                                               ║
║  Các hàm tiện ích để mở dialog chọn file/folder                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
from PyQt6.QtWidgets import QWidget, QLineEdit, QFileDialog


def browse_folder(parent: QWidget, line_edit: QLineEdit) -> None:
    """Mở dialog chọn thư mục và cập nhật vào ô nhập"""
    current_path = line_edit.text()
    folder = QFileDialog.getExistingDirectory(
        parent, 
        "Chọn thư mục",
        current_path if os.path.exists(current_path) else ""
    )
    if folder:
        line_edit.setText(folder)
        line_edit.setStyleSheet("""
            background: #252525; border: 1px solid #444;
            padding: 5px; color: #e0e0e0; font-size: 10px; border-radius: 3px;
        """)


def browse_image(parent: QWidget, line_edit: QLineEdit) -> None:
    """Mở dialog chọn file ảnh"""
    current_path = line_edit.text()
    file_path, _ = QFileDialog.getOpenFileName(
        parent,
        "Chọn ảnh",
        current_path if os.path.exists(current_path) else "",
        "Images (*.png *.jpg *.jpeg *.webp *.gif)"
    )
    if file_path:
        line_edit.setText(file_path)
        line_edit.setStyleSheet("""
            background: #252525; border: 1px solid #22c55e;
            padding: 5px; color: #e0e0e0; font-size: 10px; border-radius: 3px;
        """)


def browse_media(parent: QWidget, line_edit: QLineEdit) -> None:
    """Mở dialog chọn file ảnh hoặc video"""
    current_path = line_edit.text()
    file_path, _ = QFileDialog.getOpenFileName(
        parent,
        "Chọn ảnh hoặc video nhân vật",
        current_path if os.path.exists(current_path) else "",
        "Media Files (*.png *.jpg *.jpeg *.webp *.gif *.mp4 *.mov *.avi *.mkv)"
    )
    if file_path:
        line_edit.setText(file_path)
        line_edit.setStyleSheet("""
            background: #252525; border: 1px solid #f59e0b;
            padding: 5px; color: #e0e0e0; font-size: 10px; border-radius: 3px;
        """)
