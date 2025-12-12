"""
MODULE 1.1: IMAGE PROCESSOR
Xử lý ảnh sản phẩm thành format phù hợp cho TikTok (9:16)

Chức năng:
- Xóa background với rembg
- Enhance ảnh với CLAHE
- Resize về 1080x1920 (9:16)
- Export PNG với alpha channel
"""

import cv2
import numpy as np
from PIL import Image
from rembg import remove
from typing import Tuple, Optional
import os
from pathlib import Path


class ImageProcessor:
    """
    Processor để xử lý ảnh sản phẩm cho TikTok Video
    
    Attributes:
        target_size (Tuple[int, int]): Kích thước output mặc định (width, height)
        enhancement_enabled (bool): Bật/tắt enhancement
    """
    
    def __init__(
        self, 
        target_size: Tuple[int, int] = (1080, 1920),
        enhancement_enabled: bool = True
    ):
        """
        Khởi tạo ImageProcessor với cấu hình
        
        Args:
            target_size: Kích thước output (width, height), mặc định 9:16 cho TikTok
            enhancement_enabled: Có áp dụng enhancement không
        """
        self.target_size = target_size
        self.enhancement_enabled = enhancement_enabled
        
        # Validate target size
        if target_size[0] <= 0 or target_size[1] <= 0:
            raise ValueError(f"Invalid target_size: {target_size}. Must be positive integers.")
    
    def process_product_image(
        self, 
        input_path: str, 
        output_path: str
    ) -> str:
        """
        HÀM CHÍNH - Xử lý toàn bộ pipeline cho một ảnh
        
        Pipeline:
        1. Load ảnh từ file
        2. Enhance ảnh (nếu enabled)
        3. Remove background
        4. Resize về TikTok format (9:16)
        5. Save ảnh đã xử lý
        
        Args:
            input_path: Đường dẫn ảnh input
            output_path: Đường dẫn ảnh output
            
        Returns:
            str: Đường dẫn ảnh đã xử lý
            
        Raises:
            FileNotFoundError: Nếu input file không tồn tại
            ValueError: Nếu file không phải ảnh hợp lệ
        """
        # Validate input file exists
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"File không tồn tại: {input_path}")
        
        print(f"[ImageProcessor] Xử lý ảnh: {Path(input_path).name}")
        
        # BƯỚC 1: Load ảnh
        print("  [1/4] Loading image...")
        img_cv = self._load_image(input_path)
        
        # BƯỚC 2: Enhance (optional)
        if self.enhancement_enabled:
            print("  [2/4] Enhancing image...")
            img_cv = self._enhance_image(img_cv)
        else:
            print("  [2/4] Skipping enhancement")
        
        # BƯỚC 3: Remove background
        print("  [3/4] Removing background...")
        img_pil = self._cv2_to_pil(img_cv)
        img_no_bg = self._remove_background(img_pil)
        
        # BƯỚC 4: Resize to TikTok format
        print("  [4/4] Resizing to TikTok format (9:16)...")
        img_final = self._resize_to_tiktok(img_no_bg)
        
        # BƯỚC 5: Save output
        output_dir = os.path.dirname(output_path)
        if output_dir:  # Tạo thư mục nếu cần
            os.makedirs(output_dir, exist_ok=True)
        
        img_final.save(output_path, "PNG")
        print(f"  ✓ Đã lưu: {output_path}")
        
        return output_path
    
    def _load_image(self, path: str) -> np.ndarray:
        """
        Load ảnh từ file và validate
        
        Args:
            path: Đường dẫn file ảnh
            
        Returns:
            np.ndarray: Ảnh dạng OpenCV (BGR)
            
        Raises:
            ValueError: Nếu không load được ảnh
        """
        # Load ảnh bằng OpenCV
        img = cv2.imread(path)
        
        # Validate
        if img is None:
            raise ValueError(f"Không thể load ảnh từ: {path}")
        
        # Resize nếu ảnh quá lớn (tránh OOM)
        max_dimension = 2048
        height, width = img.shape[:2]
        
        if height > max_dimension or width > max_dimension:
            scale = max_dimension / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        return img
    
    def _enhance_image(self, img: np.ndarray) -> np.ndarray:
        """
        Tăng chất lượng ảnh bằng CLAHE
        
        CLAHE (Contrast Limited Adaptive Histogram Equalization):
        - Tăng contrast cục bộ thay vì toàn bộ
        - Tránh noise amplification
        - Làm chi tiết rõ nét hơn
        
        Args:
            img: Ảnh OpenCV (BGR)
            
        Returns:
            np.ndarray: Ảnh đã enhance
        """
        # Convert BGR to LAB (L=Lightness, A=green-red, B=blue-yellow)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        
        # Split channels
        l_channel, a_channel, b_channel = cv2.split(lab)
        
        # Apply CLAHE to L channel only (preserve color)
        clahe = cv2.createCLAHE(
            clipLimit=2.0,           # Giới hạn contrast
            tileGridSize=(8, 8)      # Kích thước tile
        )
        l_enhanced = clahe.apply(l_channel)
        
        # Merge back
        lab_enhanced = cv2.merge([l_enhanced, a_channel, b_channel])
        
        # Convert back to BGR
        img_enhanced = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)
        
        return img_enhanced
    
    def _cv2_to_pil(self, img_cv: np.ndarray) -> Image.Image:
        """
        Convert OpenCV image (BGR) sang PIL Image (RGB)
        
        Args:
            img_cv: Ảnh OpenCV (BGR)
            
        Returns:
            Image.Image: Ảnh PIL (RGB)
        """
        # OpenCV uses BGR, PIL uses RGB → Convert
        img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
        
        # Convert numpy array to PIL Image
        return Image.fromarray(img_rgb)
    
    def _remove_background(self, img_pil: Image.Image) -> Image.Image:
        """
        Xóa background bằng rembg (AI model U2-Net)
        
        Args:
            img_pil: Ảnh PIL (RGB hoặc RGBA)
            
        Returns:
            Image.Image: Ảnh không background (RGBA)
        """
        # rembg tự động detect foreground và remove background
        img_no_bg = remove(img_pil)
        
        # Ensure RGBA mode
        if img_no_bg.mode != 'RGBA':
            img_no_bg = img_no_bg.convert('RGBA')
        
        return img_no_bg
    
    def _resize_to_tiktok(self, img: Image.Image) -> Image.Image:
        """
        Resize ảnh về TikTok format (9:16) với padding
        
        Logic:
        1. Tạo canvas trong suốt 1080x1920
        2. Resize product để fit vào 80% canvas (giữ tỷ lệ)
        3. Đặt product vào giữa canvas
        
        Args:
            img: Ảnh RGBA (đã xóa background)
            
        Returns:
            Image.Image: Ảnh 1080x1920 RGBA
        """
        target_w, target_h = self.target_size
        
        # Tạo canvas trong suốt (alpha = 0)
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        
        # Tính toán kích thước tối đa cho product (80% canvas)
        max_product_w = int(target_w * 0.8)
        max_product_h = int(target_h * 0.8)
        
        # Resize product giữ tỷ lệ (thumbnail tự động giữ aspect ratio)
        img.thumbnail((max_product_w, max_product_h), Image.Resampling.LANCZOS)
        
        # Tính vị trí để center product
        x_offset = (target_w - img.width) // 2
        y_offset = (target_h - img.height) // 2
        
        # Paste product lên canvas (dùng alpha channel làm mask)
        canvas.paste(img, (x_offset, y_offset), img)
        
        return canvas


# ===== CONVENIENCE FUNCTIONS =====

def process_image(input_path: str, output_path: str) -> str:
    """
    Shortcut function để xử lý 1 ảnh nhanh
    
    Example:
        >>> process_image("raw_product.jpg", "output/product.png")
        'output/product.png'
    
    Args:
        input_path: Đường dẫn ảnh input
        output_path: Đường dẫn ảnh output
        
    Returns:
        str: Đường dẫn ảnh đã xử lý
    """
    processor = ImageProcessor()
    return processor.process_product_image(input_path, output_path)


if __name__ == "__main__":
    # Test code sẽ viết sau khi implement
    print("ImageProcessor module loaded")
