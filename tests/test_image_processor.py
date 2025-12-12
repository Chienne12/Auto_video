"""
TEST SCRIPT cho ImageProcessor
Test các chức năng chính của module image_prep
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.image_prep.processor import ImageProcessor, process_image
from PIL import Image
import numpy as np


def test_image_processor_init():
    """Test khởi tạo ImageProcessor"""
    print("\n=== TEST 1: Khởi tạo ImageProcessor ===")
    
    # Test with default params
    processor = ImageProcessor()
    assert processor.target_size ==  (1080, 1920), "Target size không đúng"
    assert processor.enhancement_enabled == True, "Enhancement should be enabled"
    
    # Test with custom params
    processor2 = ImageProcessor(target_size=(720, 1280), enhancement_enabled=False)
    assert processor2.target_size == (720, 1280), "Custom target size không đúng"
    assert processor2.enhancement_enabled == False, "Enhancement should be disabled"
    
    print("✓ Test khởi tạo PASS")


def test_load_image():
    """Test load ảnh"""
    print("\n=== TEST 2: Load Image ===")
    
    # Tạo ảnh test
    test_img_path = "test_data/test_image.jpg"
    os.makedirs("test_data", exist_ok=True)
    
    # Tạo ảnh đơn giản bằng PIL
    img = Image.new('RGB', (800, 600), color='red')
    img.save(test_img_path)
    
    processor = ImageProcessor()
    
    try:
        img_cv = processor._load_image(test_img_path)
        assert img_cv is not None, "Ảnh không load được"
        assert isinstance(img_cv, np.ndarray), "Ảnh không phải numpy array"
        print(f"✓ Load ảnh thành công: shape = {img_cv.shape}")
    finally:
        # Cleanup
        if os.path.exists(test_img_path):
            os.remove(test_img_path)
    
    print("✓ Test load image PASS")


def test_full_pipeline():
    """Test toàn bộ pipeline"""
    print("\n=== TEST 3: Full Pipeline ===")
    
    # Tạo ảnh test với object đơn giản
    test_input = "test_data/product_raw.jpg"
    test_output = "test_data/product_processed.png"
    
    os.makedirs("test_data", exist_ok=True)
    
    # Tạo ảnh có object ở giữa (để test background removal)
    from PIL import ImageDraw
    img = Image.new('RGB', (800, 800), color='white')
    draw = ImageDraw.Draw(img)
    draw.rectangle([300, 300, 500, 500], fill='red')  # Object đỏ
    img.save(test_input)
    
    processor = ImageProcessor()
    
    try:
        print(f"Xử lý: {test_input} → {test_output}")
        result_path = processor.process_product_image(test_input, test_output)
        
        # Validate output
        assert os.path.exists(result_path), "Output file không tồn tại"
        
        output_img = Image.open(result_path)
        assert output_img.size == (1080, 1920), f"Kích thước output sai: {output_img.size}"
        assert output_img.mode == 'RGBA', f"Mode sai: {output_img.mode}"
        
        print(f"✓ Pipeline hoàn tất:")
        print(f"  - Input: {test_input}")
        print(f"  - Output: {result_path}")
        print(f"  - Size: {output_img.size}")
        print(f"  - Mode: {output_img.mode}")
        
    finally:
        # Cleanup
        if os.path.exists(test_input):
            os.remove(test_input)
        # Giữ output để xem kết quả
        # if os.path.exists(test_output):
        #     os.remove(test_output)
    
    print("✓ Test full pipeline PASS")


def test_convenience_function():
    """Test convenience function"""
    print("\n=== TEST 4: Convenience Function ===")
    
    test_input = "test_data/quick_test.jpg"
    test_output = "test_data/quick_output.png"
    
    os.makedirs("test_data", exist_ok=True)
    
    # Tạo ảnh test
    img = Image.new('RGB', (500, 500), color='blue')
    img.save(test_input)
    
    try:
        result = process_image(test_input, test_output)
        assert os.path.exists(result), "Output không tồn tại"
        print(f"✓ Convenience function hoạt động: {result}")
    finally:
        if os.path.exists(test_input):
            os.remove(test_input)
    
    print("✓ Test convenience function PASS")


if __name__ == "__main__":
    print("="*60)
    print("BẮT ĐẦU TEST MODULE 1.1: ImageProcessor")
    print("="*60)
    
    try:
        test_image_processor_init()
        test_load_image()
        test_full_pipeline()
        test_convenience_function()
        
        print("\n" + "="*60)
        print("✅ TẤT CẢ TESTS PASS!")
        print("="*60)
        print("\nKiểm tra output tại: test_data/product_processed.png")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
