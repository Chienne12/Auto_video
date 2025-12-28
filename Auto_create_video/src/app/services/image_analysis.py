"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    IMAGE ANALYSIS SERVICE - GEMINI VISION                     ║
║                    Phân tích ảnh sản phẩm và ảnh tham chiếu                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import json
import os
from typing import Optional, Dict, Any
import google.generativeai as genai

# ═══════════════════════════════════════════════════════════════════════════════
# PROMPT TEMPLATES
# ═══════════════════════════════════════════════════════════════════════════════

PROMPT_REFERENCE = """Bạn là chuyên gia phân tích hình ảnh chân dung. Hãy phân tích KHUÔN MẶT và DÁNG NGƯỜI trong bức ảnh này.

⚠️ QUAN TRỌNG: KHÔNG mô tả trang phục - chỉ phân tích khuôn mặt và dáng người!

**YÊU CẦU:**
- Phân tích chi tiết KHUÔN MẶT (mắt, mũi, môi, da, tóc...)
- Phân tích DÁNG NGƯỜI (cao, gầy, khỏe khoắn...)
- KHÔNG MÔ TẢ TRANG PHỤC (vì nhân vật sẽ mặc sản phẩm khác trong video)
- Sử dụng thuật ngữ chuyên môn (kèm tiếng Anh)
- CHỈ trả về JSON, không giải thích thêm

**CẤU TRÚC JSON:**
{
  "khuon_mat": {
    "gioi_tinh": "[Nam/Nữ]",
    "do_tuoi": "[Ước tính khoảng tuổi]",
    "chung_toc": "[Châu Á/Châu Âu/...]",
    "hinh_dang": "[Trái xoan/Tròn/Vuông/Dài...]",
    "lan_da": "[Màu da, tình trạng da]",
    "mat": "[Mô tả chi tiết mắt: hình dáng, màu, mi, lông mi]",
    "long_may": "[Màu, hình dáng lông mày]",
    "mui": "[Mô tả mũi: cao/thấp, sống mũi]",
    "moi": "[Mô tả môi: dày/mỏng, màu son nếu có]"
  },
  "toc": {
    "mau_sac": "[Màu tóc chi tiết]",
    "kieu_dang": "[Thẳng/Uốn/Xoăn]",
    "do_dai": "[Ngắn/Trung bình/Dài]",
    "chi_tiet": "[Cách để tóc, phụ kiện tóc...]"
  },
  "dang_nguoi": {
    "chieu_cao": "[Cao/Trung bình/Thấp - dựa vào ảnh]",
    "voc_dang": "[Mảnh khảnh/Trung bình/Khỏe khoắn/Đầy đặn]",
    "dac_diem": "[Đặc điểm nổi bật về dáng người]"
  },
  "bieu_cam": {
    "cam_xuc": "[Vui vẻ/Nghiêm túc/Tự tin/...]",
    "huong_nhin": "[Hướng nhìn của nhân vật]",
    "tu_the": "[Mô tả tư thế cơ bản]"
  }
}"""

PRODUCT_ANALYSIS_PROMPT_V2 = """Bạn là Chuyên gia Computer Vision & 3D Texture Artist.
Nhiệm vụ: Phân tích bức ảnh sản phẩm này để trích xuất dữ liệu "Product DNA" dùng cho AI Video Generation (Veo/Sora).

QUY TẮC CỐT LÕI (CRITICAL RULES):
1. CHÍNH XÁC TUYỆT ĐỐI: Không được đoán mò text.
2. TƯ DUY VẬT LÝ (PHYSICS MINDSET): Phân tách rõ phần Cứng (Rigid) và Mềm (Soft).
3. ÁNH SÁNG & CHẤT LIỆU: Mô tả cách bề mặt phản ứng với ánh sáng (Diffuse, Specular, Metallic).

OUTPUT JSON FORMAT (BẮT BUỘC):
{
  "product_dna": {
    "name": "Tên ngắn gọn",
    "primary_color_hex": ["#Color1", "#Color2"],
    
    "structure_physics": {
      "rigid_parts": "Liệt kê phần cứng, giữ nguyên hình dạng (VD: Thân chai, Đế giày)",
      "soft_parts": "Liệt kê phần mềm, chịu tác động gió/lực (VD: Tóc, Váy, Dây nơ)",
      "dynamic_behavior": "Mô tả cách di chuyển (VD: Scarf flows in wind, Liquid splashes inside)"
    },

    "macro_textures": [
      {
        "part_name": "Tên bộ phận",
        "material_type": "Chất liệu (Leather/Glass/Metal)",
        "surface_finish": "Độ hoàn thiện (Matte/Glossy/Satin)",
        "lighting_response": "Phản ứng ánh sáng (VD: High specular reflection, Subsurface scattering)",
        "detail_description": "Mô tả chi tiết vân/hạt"
      }
    ],

    "branding_identity": {
      "detected_text": "Text đọc được (hoặc 'N/A')",
      "logo_visual": "Mô tả hình dáng logo",
      "placement": "Vị trí"
    }
  },
  "cinematography_guide": {
    "best_angle": "Góc quay đẹp nhất",
    "lighting_setup": "Gợi ý ánh sáng"
  }
}"""


# ═══════════════════════════════════════════════════════════════════════════════
# IMAGE ANALYSIS SERVICE
# ═══════════════════════════════════════════════════════════════════════════════

class ImageAnalysisService:
    """Service phân tích ảnh sử dụng Gemini Vision API"""
    
    def __init__(self, api_key: str):
        """Khởi tạo service với API key"""
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def analyze_reference_image(self, image_path: str) -> Optional[Dict[str, Any]]:
        """
        Phân tích ảnh tham chiếu (nhân vật)
        
        Args:
            image_path: Đường dẫn đến file ảnh
            
        Returns:
            Dict chứa thông tin phân tích hoặc None nếu lỗi
        """
        return self._analyze_image(image_path, PROMPT_REFERENCE)
    
    def analyze_product_image(self, image_path: str) -> Optional[Dict[str, Any]]:
        """
        Phân tích ảnh sản phẩm
        
        Args:
            image_path: Đường dẫn đến file ảnh
            
        Returns:
            Dict chứa thông tin phân tích hoặc None nếu lỗi
        """
        return self._analyze_image(image_path, PRODUCT_ANALYSIS_PROMPT_V2)
    
    def _analyze_image(self, image_path: str, prompt: str) -> Optional[Dict[str, Any]]:
        """Phân tích ảnh với prompt cho trước"""
        
        # Kiểm tra file tồn tại
        if not os.path.exists(image_path):
            print(f"[ERROR] Không tìm thấy file: {image_path}")
            return None
        
        try:
            # Upload ảnh
            image = genai.upload_file(image_path)
            
            # Gọi API
            response = self.model.generate_content([prompt, image])
            
            # Parse JSON từ response
            result_text = response.text
            
            # Loại bỏ markdown code block nếu có
            if result_text.startswith("```"):
                lines = result_text.split("\n")
                # Bỏ dòng đầu (```json) và dòng cuối (```)
                result_text = "\n".join(lines[1:-1])
            
            return json.loads(result_text.strip())
            
        except json.JSONDecodeError as e:
            print(f"[ERROR] Lỗi parse JSON: {e}")
            print(f"Raw response: {response.text}")
            return None
        except Exception as e:
            print(f"[ERROR] Lỗi phân tích ảnh: {e}")
            return None
