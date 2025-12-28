"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              TEST SCRIPT - HYBRID PHYSICS DATA STRUCTURE                     ║
║         Kiểm tra Image Analysis V2 và Video Generation Physics              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Mục đích:
1. Test PRODUCT_ANALYSIS_PROMPT_V2 với ảnh sản phẩm
2. Test _format_product_physics() helper method
3. Test convert_affiliate_clean() với Product DNA V2
"""

import json
import os
from src.app.services.image_analysis import ImageAnalysisService
from src.app.services.video_generation import VeoPromptConverter

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

# Thay bằng API key thực của bạn
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "YOUR_API_KEY_HERE")

# Đường dẫn ảnh test (thay bằng ảnh sản phẩm thực)
TEST_PRODUCT_IMAGE = "test_images/product_sample.jpg"


# ═══════════════════════════════════════════════════════════════════════════════
# TEST 1: IMAGE ANALYSIS V2 - Product DNA with Physics
# ═══════════════════════════════════════════════════════════════════════════════

def test_image_analysis_v2():
    """Test phân tích ảnh sản phẩm với Prompt V2"""
    print("=" * 80)
    print("TEST 1: IMAGE ANALYSIS V2 - Product DNA with Physics")
    print("=" * 80)
    
    if not os.path.exists(TEST_PRODUCT_IMAGE):
        print(f"⚠️  Không tìm thấy ảnh test: {TEST_PRODUCT_IMAGE}")
        print("👉 Tạo thư mục test_images/ và thêm ảnh sản phẩm để test")
        print()
        return None
    
    # Khởi tạo service
    service = ImageAnalysisService(api_key=GOOGLE_API_KEY)
    
    # Phân tích ảnh
    print(f"📸 Đang phân tích ảnh: {TEST_PRODUCT_IMAGE}")
    result = service.analyze_product_image(TEST_PRODUCT_IMAGE)
    
    if result:
        print("✅ Phân tích thành công!")
        print("\n📋 Product DNA V2 JSON:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # Kiểm tra các trường bắt buộc
        print("\n🔍 Kiểm tra cấu trúc JSON:")
        dna = result.get('product_dna', {})
        
        checks = {
            'structure_physics': dna.get('structure_physics'),
            'macro_textures': dna.get('macro_textures'),
            'branding_identity': dna.get('branding_identity')
        }
        
        for field, value in checks.items():
            status = "✅" if value else "❌"
            print(f"  {status} {field}: {type(value).__name__}")
        
        return result
    else:
        print("❌ Phân tích thất bại!")
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# TEST 2: PHYSICS HELPER METHOD
# ═══════════════════════════════════════════════════════════════════════════════

def test_physics_helper(product_dna_json):
    """Test helper method chuyển đổi Product DNA V2 sang physics prompt"""
    print("\n" + "=" * 80)
    print("TEST 2: PHYSICS HELPER METHOD - _format_product_physics()")
    print("=" * 80)
    
    if not product_dna_json:
        print("⚠️  Bỏ qua test vì không có Product DNA JSON")
        print()
        return
    
    # Khởi tạo converter
    converter = VeoPromptConverter(api_key=GOOGLE_API_KEY)
    
    # Format physics prompt
    print("🔄 Chuyển đổi JSON → Physics Prompt...")
    physics_prompt = converter._format_product_physics(product_dna_json)
    
    print("\n✅ Physics-Aware Prompt:")
    print("-" * 80)
    print(physics_prompt)
    print("-" * 80)
    
    return physics_prompt


# ═══════════════════════════════════════════════════════════════════════════════
# TEST 3: AFFILIATE CLEAN CONVERSION với Product DNA V2
# ═══════════════════════════════════════════════════════════════════════════════

def test_affiliate_conversion_v2(product_dna_json):
    """Test convert_affiliate_clean() với Product DNA V2"""
    print("\n" + "=" * 80)
    print("TEST 3: AFFILIATE CONVERSION V2 - convert_affiliate_clean()")
    print("=" * 80)
    
    if not product_dna_json:
        print("⚠️  Bỏ qua test vì không có Product DNA JSON")
        print()
        return
    
    # Mock scene data với Product DNA V2
    scene_data = {
        "visual_psychology": "Energetic and vibrant atmosphere with focus on product quality",
        "product_lock": product_dna_json,  # Sử dụng Product DNA V2 JSON
        "presenter_lock": {
            "style": "A young professional woman in business casual",
            "action": "Holding the product confidently while walking"
        },
        "camera_tech": {
            "angle": "Eye level tracking shot",
            "movement": "Smooth dolly follow",
            "lighting": "Natural daylight with soft fill"
        }
    }
    
    # Convert
    converter = VeoPromptConverter(api_key=GOOGLE_API_KEY)
    final_prompt = converter.convert_affiliate_clean(scene_data)
    
    print("\n✅ Final Veo Prompt với Physics:")
    print("-" * 80)
    print(final_prompt)
    print("-" * 80)
    
    # Kiểm tra xem có chứa physics keywords
    print("\n🔍 Kiểm tra Physics Keywords:")
    keywords = ["Physics & Dynamics", "Rigid parts", "Materials", "Branding"]
    for kw in keywords:
        if kw in final_prompt:
            print(f"  ✅ Có '{kw}'")
        else:
            print(f"  ⚠️  Thiếu '{kw}'")


# ═══════════════════════════════════════════════════════════════════════════════
# DEMO: Sử dụng Mock Data nếu không có ảnh thực
# ═══════════════════════════════════════════════════════════════════════════════

def demo_with_mock_data():
    """Demo với dữ liệu mock (không cần API key)"""
    print("\n" + "=" * 80)
    print("DEMO MODE: Sử dụng Mock Product DNA V2")
    print("=" * 80)
    
    # Mock Product DNA V2
    mock_product_dna = {
        "product_dna": {
            "name": "Nike Air Jordan 1 High",
            "primary_color_hex": ["#FFFFFF", "#000000", "#FF0000"],
            
            "structure_physics": {
                "rigid_parts": "Sole rubber base, toe box plastic cap, ankle support frame",
                "soft_parts": "Leather upper panels, fabric tongue, shoelaces",
                "dynamic_behavior": "Laces sway slightly when walking, leather panels flex naturally with foot movement"
            },
            
            "macro_textures": [
                {
                    "part_name": "Leather Upper Panels",
                    "material_type": "Leather",
                    "surface_finish": "Matte",
                    "lighting_response": "Low specular with subtle grain texture visible under direct light",
                    "detail_description": "Premium white leather with natural grain pattern"
                },
                {
                    "part_name": "Rubber Sole",
                    "material_type": "Rubber",
                    "surface_finish": "Satin",
                    "lighting_response": "Medium specular reflection with slight diffusion",
                    "detail_description": "Black rubber with Air cushioning visible in heel"
                }
            ],
            
            "branding_identity": {
                "detected_text": "Nike Swoosh, AIR JORDAN",
                "logo_visual": "Nike swoosh on side panels, Jumpman logo on tongue",
                "placement": "Side panels and tongue"
            }
        },
        "cinematography_guide": {
            "best_angle": "45-degree angle from front, slightly elevated",
            "lighting_setup": "Rim light from back to highlight shoe profile, soft key light from front"
        }
    }
    
    print("\n📦 Mock Product DNA:")
    print(json.dumps(mock_product_dna, indent=2, ensure_ascii=False))
    
    # Test physics helper
    if GOOGLE_API_KEY != "YOUR_API_KEY_HERE":
        test_physics_helper(mock_product_dna)
        test_affiliate_conversion_v2(mock_product_dna)
    else:
        print("\n⚠️  Thiết lập GOOGLE_API_KEY để test converter")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "HYBRID PHYSICS TEST SUITE" + " " * 33 + "║")
    print("╚" + "=" * 78 + "╝")
    print()
    
    # Kiểm tra API key
    if GOOGLE_API_KEY == "YOUR_API_KEY_HERE":
        print("⚠️  GOOGLE_API_KEY chưa được thiết lập!")
        print("👉 Set environment variable hoặc sửa trong code")
        print()
        print("Demo với Mock Data thay thế:")
        demo_with_mock_data()
    else:
        # Chạy test thực với ảnh
        product_dna = test_image_analysis_v2()
        
        if product_dna:
            test_physics_helper(product_dna)
            test_affiliate_conversion_v2(product_dna)
        else:
            # Fallback to mock
            print("\n⚠️  Sử dụng Mock Data thay thế:")
            demo_with_mock_data()
    
    print("\n" + "=" * 80)
    print("✅ Test hoàn tất!")
    print("=" * 80)
