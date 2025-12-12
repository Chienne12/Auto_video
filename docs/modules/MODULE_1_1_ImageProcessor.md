# MODULE 1.1: IMAGE PROCESSOR

## 🎯 MỤC TIÊU MODULE

**Chức năng chính**: Xử lý ảnh sản phẩm thô thành ảnh tối ưu cho TikTok (9:16, không background, enhanced).

**Input**: Ảnh sản phẩm bất kỳ (JPG/PNG, kích thước bất kỳ)
**Output**: Ảnh 1080x1920, không background, đã enhance, format PNG

---

## 📊 FLOW XỬ LÝ

```
Input Image (any size)
    ↓
[1] Load & Validate
    ↓
[2] Enhance (CLAHE)
    ↓
[3] Remove Background
    ↓
[4] Resize to 9:16 (1080x1920)
    ↓
Output Image (ready for video)
```

---

## 📝 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Tạo file `src/image_prep/processor.py`

```python
"""
Image Processor Module
Xử lý ảnh sản phẩm: enhance, remove background, resize to TikTok format
"""

import cv2
import numpy as np
from PIL import Image
from rembg import remove
from typing import Union, Tuple
import os


class ImageProcessor:
    """
    Processor để xử lý ảnh sản phẩm
    
    Attributes:
        target_size (tuple): Kích thước output (width, height)
        enhancement_enabled (bool): Bật/tắt enhancement
    """
    
    def __init__(
        self, 
        target_size: Tuple[int, int] = (1080, 1920),
        enhancement_enabled: bool = True
    ):
        """
        Khởi tạo ImageProcessor
        
        Args:
            target_size: Kích thước output (width, height), default 9:16
            enhancement_enabled: Có enhance ảnh không
        """
        self.target_size = target_size
        self.enhancement_enabled = enhancement_enabled
    
    def process_product_image(
        self, 
        input_path: str, 
        output_path: str
    ) -> str:
        """
        Hàm CHÍNH - Xử lý toàn bộ pipeline
        
        Args:
            input_path: Đường dẫn ảnh input
            output_path: Đường dẫn ảnh output
            
        Returns:
            str: Đường dẫn ảnh đã xử lý
            
        Raises:
            FileNotFoundError: Nếu input file không tồn tại
            ValueError: Nếu file không phải ảnh
        """
        # Validate input
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"File không tồn tại: {input_path}")
        
        # Step 1: Load image
        print(f"[1/4] Loading image: {input_path}")
        img_cv = self._load_image(input_path)
        
        # Step 2: Enhance (optional)
        if self.enhancement_enabled:
            print("[2/4] Enhancing image...")
            img_cv = self._enhance_image(img_cv)
        else:
            print("[2/4] Skipping enhancement")
        
        # Step 3: Remove background
        print("[3/4] Removing background...")
        img_pil = self._cv2_to_pil(img_cv)
        img_no_bg = self._remove_background(img_pil)
        
        # Step 4: Resize to TikTok format
        print("[4/4] Resizing to TikTok format (9:16)...")
        img_final = self._resize_to_tiktok(img_no_bg)
        
        # Save
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img_final.save(output_path, "PNG")
        
        print(f"✓ Saved to: {output_path}")
        return output_path
    
    def _load_image(self, path: str) -> np.ndarray:
        """
        Load ảnh từ file
        
        Args:
            path: Đường dẫn file
            
        Returns:
            np.ndarray: Ảnh dạng OpenCV (BGR)
        """
        img = cv2.imread(path)
        if img is None:
            raise ValueError(f"Không thể load ảnh: {path}")
        return img
    
    def _enhance_image(self, img: np.ndarray) -> np.ndarray:
        """
        Enhance ảnh bằng CLAHE (Contrast Limited Adaptive Histogram Equalization)
        
        Mục đích: Tăng độ tương phản, chi tiết rõ nét hơn
        
        Args:
            img: Ảnh OpenCV (BGR)
            
        Returns:
            np.ndarray: Ảnh đã enhance
        """
        # Convert BGR to LAB (L = Lightness, A & B = color)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        
        # Split channels
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(
            clipLimit=2.0,      # Giới hạn contrast
            tileGridSize=(8, 8) # Kích thước tile
        )
        l_eq = clahe.apply(l)
        
        # Merge back
        lab_eq = cv2.merge([l_eq, a, b])
        
        # Convert back to BGR
        img_enhanced = cv2.cvtColor(lab_eq, cv2.COLOR_LAB2BGR)
        
        return img_enhanced
    
    def _cv2_to_pil(self, img_cv: np.ndarray) -> Image.Image:
        """
        Convert OpenCV image (BGR) sang PIL Image (RGB)
        
        Args:
            img_cv: Ảnh OpenCV
            
        Returns:
            PIL.Image: Ảnh PIL
        """
        img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
        return Image.fromarray(img_rgb)
    
    def _remove_background(self, img_pil: Image.Image) -> Image.Image:
        """
        Xóa background bằng rembg
        
        Args:
            img_pil: Ảnh PIL (RGB hoặc RGBA)
            
        Returns:
            PIL.Image: Ảnh không background (RGBA)
        """
        # rembg tự động detect foreground và xóa background
        img_no_bg = remove(img_pil)
        
        # Ensure RGBA mode
        if img_no_bg.mode != 'RGBA':
            img_no_bg = img_no_bg.convert('RGBA')
        
        return img_no_bg
    
    def _resize_to_tiktok(self, img: Image.Image) -> Image.Image:
        """
        Resize ảnh về 9:16 (1080x1920) với padding
        
        Logic:
        1. Resize product để fit trong canvas (giữ tỷ lệ)
        2. Đặt product vào giữa canvas trong suốt
        
        Args:
            img: Ảnh RGBA
            
        Returns:
            PIL.Image: Ảnh 1080x1920 RGBA
        """
        target_w, target_h = self.target_size
        
        # Tạo canvas trong suốt
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        
        # Tính toán scale để product vừa canvas (giữ 80% chiều rộng)
        max_product_w = int(target_w * 0.8)
        max_product_h = int(target_h * 0.8)
        
        # Resize product (giữ tỷ lệ)
        img.thumbnail((max_product_w, max_product_h), Image.Resampling.LANCZOS)
        
        # Tính vị trí để center
        x = (target_w - img.width) // 2
        y = (target_h - img.height) // 2
        
        # Paste product lên canvas
        canvas.paste(img, (x, y), img)  # Dùng alpha channel làm mask
        
        return canvas


# Convenience function
def process_image(input_path: str, output_path: str) -> str:
    """
    Shortcut function để xử lý 1 ảnh
    
    Example:
        >>> process_image("raw_product.jpg", "output/product.png")
        '✓ Saved to: output/product.png'
    """
    processor = ImageProcessor()
    return processor.process_product_image(input_path, output_path)
```

---

## 🧪 TESTING

### Test Script: `tests/test_image_processor.py`

```python
import pytest
from PIL import Image
import os
from src.image_prep.processor import ImageProcessor, process_image


class TestImageProcessor:
    
    @pytest.fixture
    def processor(self):
        """Tạo processor instance"""
        return ImageProcessor()
    
    @pytest.fixture
    def sample_image(self, tmp_path):
        """Tạo ảnh test"""
        img = Image.new('RGB', (800, 600), color='red')
        img_path = tmp_path / "test.jpg"
        img.save(img_path)
        return str(img_path)
    
    def test_process_full_pipeline(self, processor, sample_image, tmp_path):
        """Test toàn bộ pipeline"""
        output_path = tmp_path / "output.png"
        
        result = processor.process_product_image(
            str(sample_image),
            str(output_path)
        )
        
        # Check file exists
        assert os.path.exists(result)
        
        # Check output properties
        img = Image.open(result)
        assert img.size == (1080, 1920)  # 9:16
        assert img.mode == 'RGBA'  # Has alpha channel
    
    def test_enhancement(self, processor):
        """Test enhancement function"""
        import numpy as np
        
        # Tạo ảnh test (opencv format)
        img_cv = np.zeros((100, 100, 3), dtype=np.uint8)
        img_cv[40:60, 40:60] = [255, 255, 255]  # White square
        
        enhanced = processor._enhance_image(img_cv)
        
        assert enhanced.shape == img_cv.shape
        assert enhanced.dtype == np.uint8
    
    def test_background_removal(self, processor):
        """Test background removal"""
        # Tạo ảnh có background rõ ràng
        img = Image.new('RGB', (200, 200), 'white')
        # Vẽ object ở giữa
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 150, 150], fill='red')
        
        img_no_bg = processor._remove_background(img)
        
        assert img_no_bg.mode == 'RGBA'
        # Alpha channel should have transparent areas
        alpha_data = img_no_bg.split()[-1].getdata()
        assert min(alpha_data) < 255  # Has transparency
    
    def test_convenience_function(self, sample_image, tmp_path):
        """Test shortcut function"""
        output = tmp_path / "quick.png"
        
        result = process_image(str(sample_image), str(output))
        
        assert os.path.exists(result)


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

### Manual Testing

```python
# test_manual.py
from src.image_prep.processor import process_image

# Test với ảnh thật
process_image(
    "test_data/nike_shoe.jpg",
    "output/nike_processed.png"
)

print("Check output/nike_processed.png!")
```

---

## 🎓 GIẢI THÍCH KỸ THUẬT

### 1. Tại sao dùng CLAHE?

**CLAHE** (Contrast Limited Adaptive Histogram Equalization):
- Tăng contrast cục bộ thay vì toàn bộ ảnh
- Tránh noise amplification
- Làm chi tiết rõ nét hơn (quan trọng cho video AI)

**So sánh**:
```python
# Histogram Equalization thông thường (BAD)
img_eq = cv2.equalizeHist(gray)  # Quá sáng, nhiều noise

# CLAHE (GOOD)
clahe = cv2.createCLAHE(clipLimit=2.0)
img_clahe = clahe.apply(gray)  # Vừa đủ, ít noise
```

### 2. Tại sao convert BGR → LAB?

- **LAB**: L (Lightness), A (green-red), B (blue-yellow)
- Chỉ enhance L channel → Không ảnh hưởng màu sắc
- Màu sắc quan trọng cho product consistency

### 3. rembg hoạt động như thế nào?

- Dùng Deep Learning model (U2-Net)
- Tự động detect foreground/background
- Không cần manual selection
- Accuracy ~95% cho products

---

## ⚠️ COMMON PITFALLS

### Pitfall 1: Out of Memory với ảnh lớn

**Problem**: Ảnh 10MB+ gây crash
**Solution**:
```python
def _load_image(self, path: str) -> np.ndarray:
    img = cv2.imread(path)
    
    # Resize nếu quá lớn
    max_size = 2048
    if img.shape[0] > max_size or img.shape[1] > max_size:
        scale = max_size / max(img.shape[:2])
        new_size = (int(img.shape[1] * scale), int(img.shape[0] * scale))
        img = cv2.resize(img, new_size)
    
    return img
```

### Pitfall 2: Background không xóa sạch

**Problem**: rembg để lại viền xấu
**Solution**: Post-process alpha channel
```python
def _clean_alpha(self, img: Image.Image) -> Image.Image:
    alpha = img.split()[-1]
    # Erode để loại bỏ viền mỏng
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    img.putalpha(alpha)
    return img
```

### Pitfall 3: Ảnh bị mờ sau resize

**Problem**: Dùng sai resampling method
**Solution**: Dùng LANCZOS (best quality)
```python
img.thumbnail(size, Image.Resampling.LANCZOS)  # ✓ GOOD
img.thumbnail(size, Image.Resampling.BILINEAR) # ✗ BAD (blurry)
```

---

## 📈 PERFORMANCE

**Benchmark** (1 ảnh 1920x1080):
- Load: ~50ms
- Enhancement: ~200ms
- Background removal: ~2-3s (GPU) hoặc ~5-8s (CPU)
- Resize: ~100ms
- **Total**: ~3-8s/ảnh

**Optimization tips**:
- Batch processing: Xử lý nhiều ảnh cùng lúc
- GPU acceleration: `CUDA_VISIBLE_DEVICES=0` cho rembg
- Cache: Lưu processed images

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] File `processor.py` đã tạo với đầy đủ functions
- [ ] Test với >=5 ảnh khác nhau
- [ ] Output đúng 1080x1920
- [ ] Background đã xóa sạch
- [ ] Chất lượng ảnh tốt (không bị blur)
- [ ] Error handling hoạt động
- [ ] Tests pass 100%

**Next**: Chuyển sang MODULE 1.2 - Product Bible Generator
