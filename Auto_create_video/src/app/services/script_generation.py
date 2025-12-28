"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SCRIPT GENERATION SERVICE                                  ║
║        Tạo kịch bản video từ JSON mô tả ảnh + prompt người dùng              ║
╚══════════════════════════════════════════════════════════════════════════════╝

LUỒNG XỬ LÝ:
1. Input: JSON ảnh tham chiếu + JSON sản phẩm + Prompt người dùng
2. AI tạo kịch bản tổng thể phù hợp 8 giây
3. Chia kịch bản thành 2-3 cảnh (mỗi cảnh 3-4 giây)
4. Mỗi cảnh = prompt + reference JSON + product JSON
5. Gửi từng cảnh cho Veo 3 API
6. Ghép video + hiệu ứng chuyển cảnh
"""

import json
from typing import Dict, Any, List, Optional
import google.generativeai as genai


# ═══════════════════════════════════════════════════════════════════════════════
# PROMPT TEMPLATE CHO KỊch BẢN
# ═══════════════════════════════════════════════════════════════════════════════

AFFILIATE_MASTER_PROMPT = """Bạn là Chuyên gia Chiến lược Video Marketing & Tâm lý hành vi khách hàng.
Nhiệm vụ: Phân tích sâu sản phẩm và tạo kịch bản video bán hàng (Affiliate) có khả năng chuyển đổi cao nhất.

INPUT:
- Sản phẩm: {product_json}
- Yêu cầu/Pain point: {user_prompt}
- Style: {style}
- Nhân vật tham chiếu: {reference_json}

═══════════════════════════════════════════════════════════════
QUY TRÌNH SUY LUẬN (DEEP THINKING):
═══════════════════════════════════════════════════════════════
1. **Phân tích Hook**: Loại hook nào (ASMR, Visual Shock, Negative Hook) sẽ dừng ngón tay người xem trong 3s đầu?
2. **Phân tích Góc quay**: Tại sao dùng góc quay này? Nó tác động tâm lý gì (Tin tưởng, Thỏa mãn, Thèm muốn)?
3. **Phân tích Âm thanh**: Âm thanh vật lý nào (bóc seal, rót nước, tiếng giòn tan) tạo cảm giác ASMR chân thực?

YÊU CẦU OUTPUT (JSON Only):
{{
  "video_strategy": {{
    "hook_type": "Tên loại hook (VD: Negative Hook - Mụn đầu đen, ASMR Visual, Shock Value)",
    "pain_point": "Nỗi đau CỤ THỂ của khách hàng mục tiêu",
    "solution_mechanism": "Cơ chế giải quyết của sản phẩm (HOW it works)"
  }},
  "scenes": [
    {{
      "scene_id": 1,
      "duration_sec": {thoi_luong_moi_video},
      "marketing_goal": "Visual Hook/Product Demo/Trust Building/Call to Action",
      
      "visual_psychology": "GIẢI THÍCH lý do chọn góc máy này và tác động tâm lý (VD: Dùng góc Macro để gây shock thị giác, tạo cảm giác gần gụi và chân thực. Góc Top-down tạo cảm giác sạch sẽ, chuyên nghiệp)",

      "product_lock": {{
        "visual_focus": "Mô tả vật lý CỰC KỲ CHI TIẾT (Texture: vải hạt/bóng nhám, màu sắc chính xác, trạng thái bề mặt)",
        "state": "Trạng thái sản phẩm ĐANG LÀM GÌ (VD: Đang sủi bọt, đang bị nặn, đang tan chảy)"
      }},

      "presenter_lock": {{
        "style": "Invisible User / Expert / KOL / Hand Model",
        "action": "Hành động tay/cơ thể CỤ THỂ, CHI TIẾT (VD: Ngón tay từ từ bóc lớp seal, tay nắm chặt rồi thả lỏng)"
      }},

      "camera_tech": {{
        "angle": "Tên góc máy (Macro, Top-down, Eye level, Dutch angle)",
        "movement": "Chuyển động camera (Zoom in kịch tính, Static build tension, Slow pan reveal)",
        "lighting": "Ánh sáng (High contrast dramatic, Soft beauty light, Natural window light)"
      }},

      "sound_layer": {{
        "sfx": "Mô tả CHI TIẾT âm thanh ASMR vật lý (VD: Tiếng lột mụn 'rẹt' nhẹ, tiếng nước chảy róc rách, tiếng bóc giấy xé sột soạt)",
        "voiceover": "Lời thoại NGẮN GỌN, súc tích (hoặc để trống nếu ASMR thuần)",
        "music_vibe": "Mood nhạc nền (Kịch tính căng thẳng, Vui vẻ sôi động, Lo-fi thư giãn)"
      }}
    }}
  ],
  "improvement_suggestions": [
    "Gợi ý cải thiện 1 (VD: Thêm text overlay tiêu đề ở giây đầu tiên để tăng retention)",
    "Gợi ý cải thiện 2 (VD: Tăng độ sáng khi quay cận cảnh để highlight texture sản phẩm)"
  ]
}}

⚠️ LƯU Ý QUAN TRỌNG:
1. "visual_psychology" là TRỌNG TÂM - phải giải thích rõ TẠI SAO chọn góc quay/cách quay này
2. "product_lock" phải mô tả texture, màu sắc, trạng thái CỰC KỲ CHI TIẾT
3. "sound_layer.sfx" phải tập trung vào âm thanh ASMR vật lý chân thực (không phải nhạc)
4. "improvement_suggestions" phải CỤ THỂ, THỰC THI ĐƯỢC
5. Style "{style}":
   - Review: Chi tiết, test thực tế, xây dựng lòng tin
   - Viral: Hook mạnh, shock value, lan truyền nhanh
   - Tutorial: Hướng dẫn từng bước, dễ theo dõi
   - Cinematic: Nghệ thuật, cảm xúc, storytelling

Số video: {so_video} | Thời lượng mỗi video: {thoi_luong_moi_video}s | Tổng: {total_duration}s"""


# ═══════════════════════════════════════════════════════════════════════════════
# PROMPT CHO VIDEO DÀI (15s, 30s, 60s) - CHIA SEGMENTS LIÊN TỤC
# ═══════════════════════════════════════════════════════════════════════════════

PROMPT_EXTENDED_VIDEO = """Bạn là ĐẠO DIỄN VIDEO QUẢNG CÁO chuyên tạo video dài từ nhiều đoạn ngắn liền mạch.

═══════════════════════════════════════════════════════════════
🎯 YÊU CẦU:
═══════════════════════════════════════════════════════════════
- Tổng thời lượng video: {total_duration} giây
- Chia thành: {num_segments} đoạn (segments)
- Mỗi đoạn: {segment_duration} giây

═══════════════════════════════════════════════════════════════
📷 NHÂN VẬT (KHÔNG THAY ĐỔI XUYÊN SUỐT):
═══════════════════════════════════════════════════════════════
{reference_json}

═══════════════════════════════════════════════════════════════
🛍️ SẢN PHẨM (KHÔNG THAY ĐỔI XUYÊN SUỐT):
═══════════════════════════════════════════════════════════════
{product_json}

═══════════════════════════════════════════════════════════════
💡 Ý TƯỞNG KHÁCH HÀNG:
═══════════════════════════════════════════════════════════════
"{user_prompt}"

═══════════════════════════════════════════════════════════════
⚠️ QUY TẮC BẮT BUỘC - ĐẢM BẢO LIÊN TỤC GIỮA CÁC ĐOẠN:
═══════════════════════════════════════════════════════════════

1. **CUỐI mỗi đoạn** phải mô tả TƯ THẾ KẾT THÚC chi tiết
2. **ĐẦU đoạn tiếp** phải BẮT ĐẦU từ ĐÚNG tư thế đó
3. **Ánh sáng, bối cảnh, góc camera** phải NHẤT QUÁN
4. **Nhân vật + Sản phẩm** không thay đổi ngoại hình
5. **Mỗi segment** đính kèm lại reference_json và product_json

═══════════════════════════════════════════════════════════════
🎬 CẤU TRÚC VIDEO DÀI:
═══════════════════════════════════════════════════════════════

📍 SEGMENT 1 (0-{segment_duration}s): HOOK + INTRO
   - 0-2s: Thu hút ngay
   - Giới thiệu sản phẩm ấn tượng
   - KẾT THÚC: Mô tả tư thế cuối để segment 2 tiếp nối

📍 SEGMENT 2-{mid_segment} ({segment_duration}-{mid_time}s): MAIN CONTENT
   - Tiếp nối từ tư thế cuối segment trước
   - Demo sản phẩm, hành động chính
   - KẾT THÚC: Mô tả tư thế cuối

📍 SEGMENT CUỐI: HERO SHOT + CTA
   - Tiếp nối tự nhiên
   - Sản phẩm là tâm điểm
   - Kết thúc đẹp, call-to-action

═══════════════════════════════════════════════════════════════
📤 OUTPUT JSON (CHỈ trả về JSON):
═══════════════════════════════════════════════════════════════
{{
  "tong_quan": {{
    "chu_de": "[Chủ đề video]",
    "tong_thoi_luong": {total_duration},
    "so_segment": {num_segments}
  }},
  "segments": [
    {{
      "segment_id": 1,
      "start_time": 0,
      "end_time": {segment_duration},
      "hanh_dong": "0-2s: [HOOK]. 2-{segment_duration}s: [hành động chính]. Kết thúc: [MÔ TẢ TƯ THẾ CUỐI chi tiết để segment 2 tiếp nối]",
      "boi_canh": "[Không gian, ánh sáng, góc camera]",
      "tu_the_ket_thuc": "[Mô tả chính xác tư thế của nhân vật + vị trí sản phẩm khi kết thúc]",
      "reference_json": {reference_json},
      "product_json": {product_json}
    }},
    {{
      "segment_id": 2,
      "start_time": {segment_duration},
      "end_time": {segment_duration_2x},
      "hanh_dong": "Tiếp nối từ [tư thế cuối segment 1]. [hành động mới]. Kết thúc: [MÔ TẢ TƯ THẾ CUỐI]",
      "boi_canh": "[CÙNG bối cảnh, ánh sáng như segment 1]",
      "tu_the_ket_thuc": "[Mô tả tư thế cuối]",
      "reference_json": {reference_json},
      "product_json": {product_json}
    }}
  ]
}}"""

# ═══════════════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════════════

class VideoScene:
    """Đại diện cho một cảnh trong video - đơn giản: hành động + bối cảnh"""
    
    def __init__(self, data: Dict[str, Any]):
        self.so_thu_tu = data.get("so_thu_tu", 1)
        self.thoi_luong = data.get("thoi_luong", 4)
        self.hanh_dong = data.get("hanh_dong", "")
        self.boi_canh = data.get("boi_canh", "")
        
        # JSON mô tả sẽ được gắn sau
        self.reference_json = None  # JSON nhân vật
        self.product_json = None     # JSON sản phẩm
    
    def to_veo_request(self) -> Dict[str, Any]:
        """Tạo request để gửi cho Veo API - đảm bảo đồng nhất"""
        return {
            "nhan_vat": self.reference_json,   # Giữ nguyên JSON nhân vật
            "san_pham": self.product_json,     # Giữ nguyên JSON sản phẩm
            "kich_ban": {
                "hanh_dong": self.hanh_dong,
                "boi_canh": self.boi_canh,
                "thoi_luong": self.thoi_luong
            }
        }
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "so_thu_tu": self.so_thu_tu,
            "thoi_luong": self.thoi_luong,
            "hanh_dong": self.hanh_dong,
            "boi_canh": self.boi_canh,
            "reference_json": self.reference_json,
            "product_json": self.product_json
        }


class VideoScript:
    """Kịch bản video hoàn chỉnh"""
    
    def __init__(self, data: Dict[str, Any]):
        # Cấu trúc mới - không nested trong tong_quan
        self.phan_tich_y_tuong = data.get("phan_tich_y_tuong", "")
        self.boi_canh_chung = data.get("boi_canh_chung", "")
        self.so_video = data.get("so_video", 2)
        self.thoi_luong_moi_video = data.get("thoi_luong_moi_video", 8)
        
        self.scenes: List[VideoScene] = []
        for scene_data in data.get("canh", []):
            self.scenes.append(VideoScene(scene_data))
    
    def attach_json_to_scenes(self, reference_json: Dict, product_json: Dict):
        """Gắn JSON mô tả vào từng cảnh để đảm bảo đồng nhất"""
        for scene in self.scenes:
            scene.reference_json = reference_json
            scene.product_json = product_json
    
    def get_veo_requests(self) -> List[Dict[str, Any]]:
        """Lấy danh sách request để gửi cho Veo API"""
        return [scene.to_veo_request() for scene in self.scenes]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "phan_tich_y_tuong": self.phan_tich_y_tuong,
            "boi_canh_chung": self.boi_canh_chung,
            "so_video": self.so_video,
            "thoi_luong_moi_video": self.thoi_luong_moi_video,
            "tong_thoi_luong": self.so_video * self.thoi_luong_moi_video,
            "canh": [scene.to_dict() for scene in self.scenes]
        }

# ═══════════════════════════════════════════════════════════════════════════════
# SCRIPT GENERATION SERVICE
# ═══════════════════════════════════════════════════════════════════════════════

class ScriptGenerationService:
    """Service tạo kịch bản video từ JSON mô tả"""
    
    def __init__(self, api_key: str):
        """Khởi tạo service với Gemini API key"""
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def generate_script(
        self,
        reference_json: Dict[str, Any],
        product_json: Dict[str, Any],
        user_prompt: str,
        so_video: int = 2,
        thoi_luong_moi_video: int = 8,
        style: str = "Review"
    ) -> Optional[VideoScript]:
        """
        Tạo kịch bản video từ JSON mô tả + prompt người dùng
        
        Args:
            reference_json: JSON mô tả ảnh tham chiếu (nhân vật)
            product_json: JSON mô tả sản phẩm
            user_prompt: Prompt/yêu cầu từ người dùng
            so_video: Số lượng video cần tạo (default: 2)
            thoi_luong_moi_video: Thời lượng mỗi video tính bằng giây (default: 8)
            style: Style video (Review/Viral/Tutorial/Cinematic) (default: "Review")
            
        Returns:
            VideoScript object hoặc None nếu lỗi
        """
        tong_thoi_luong = so_video * thoi_luong_moi_video
        
        # Tính mid_time cho timeline (HOOK: 0-2s, MAIN: 2-mid, HERO: mid-end)
        mid_time = max(5, thoi_luong_moi_video - 3)  # VD: 8s -> mid=5, 15s -> mid=12
        
        try:
            # Tạo prompt đầy đủ
            full_prompt = AFFILIATE_MASTER_PROMPT.format(
                reference_json=json.dumps(reference_json, ensure_ascii=False, indent=2),
                product_json=json.dumps(product_json, ensure_ascii=False, indent=2),
                user_prompt=user_prompt,
                so_video=so_video,
                thoi_luong_moi_video=thoi_luong_moi_video,
                total_duration=so_video * thoi_luong_moi_video,
                style=style
            )
            
            # Gọi Gemini API
            response = self.model.generate_content(full_prompt)
            
            # Parse JSON từ response
            result_text = response.text.strip()
            
            # Loại bỏ markdown code block nếu có
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            # Tìm JSON object
            start_idx = result_text.find("{")
            end_idx = result_text.rfind("}") + 1
            if start_idx != -1 and end_idx > start_idx:
                result_text = result_text[start_idx:end_idx]
            
            script_data = json.loads(result_text.strip())
            
            # Tạo VideoScript object
            script = VideoScript(script_data)
            
            # Gắn JSON mô tả vào từng cảnh
            script.attach_json_to_scenes(reference_json, product_json)
            
            return script
            
        except json.JSONDecodeError as e:
            print(f"[ERROR] Lỗi parse JSON kịch bản: {e}")
            print(f"Raw response: {response.text[:500]}")
            return None
        except Exception as e:
            print(f"[ERROR] Lỗi tạo kịch bản: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def generate_extended_script(
        self,
        reference_json: Dict[str, Any],
        product_json: Dict[str, Any],
        user_prompt: str,
        total_duration: int = 30,
        segment_duration: int = 8
    ) -> Optional[Dict[str, Any]]:
        """
        Tạo kịch bản video DÀI từ nhiều segments liên tục.
        
        Args:
            reference_json: JSON mô tả nhân vật
            product_json: JSON mô tả sản phẩm
            user_prompt: Prompt/yêu cầu từ người dùng
            total_duration: Tổng thời lượng video (15, 30, 60 giây)
            segment_duration: Thời lượng mỗi segment (default: 8 giây, max của Veo)
            
        Returns:
            Dict chứa danh sách segments với continuation linking
        """
        # Tính số segments cần thiết
        num_segments = (total_duration + segment_duration - 1) // segment_duration
        mid_segment = num_segments // 2
        mid_time = mid_segment * segment_duration
        segment_duration_2x = segment_duration * 2
        
        try:
            # Tạo prompt đầy đủ
            full_prompt = PROMPT_EXTENDED_VIDEO.format(
                reference_json=json.dumps(reference_json, ensure_ascii=False, indent=2),
                product_json=json.dumps(product_json, ensure_ascii=False, indent=2),
                user_prompt=user_prompt,
                total_duration=total_duration,
                num_segments=num_segments,
                segment_duration=segment_duration,
                mid_segment=mid_segment,
                mid_time=mid_time,
                segment_duration_2x=segment_duration_2x
            )
            
            # Gọi Gemini API
            response = self.model.generate_content(full_prompt)
            
            # Parse JSON từ response
            result_text = response.text.strip()
            
            # Loại bỏ markdown code block nếu có
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            # Tìm JSON object
            start_idx = result_text.find("{")
            end_idx = result_text.rfind("}") + 1
            if start_idx != -1 and end_idx > start_idx:
                result_text = result_text[start_idx:end_idx]
            
            extended_script = json.loads(result_text.strip())
            
            # Đảm bảo mỗi segment có reference_json và product_json
            if "segments" in extended_script:
                for segment in extended_script["segments"]:
                    if "reference_json" not in segment:
                        segment["reference_json"] = reference_json
                    if "product_json" not in segment:
                        segment["product_json"] = product_json
            
            print(f"[SUCCESS] Đã tạo kịch bản video {total_duration}s với {num_segments} segments")
            return extended_script
            
        except json.JSONDecodeError as e:
            print(f"[ERROR] Lỗi parse JSON kịch bản extended: {e}")
            return None
        except Exception as e:
            print(f"[ERROR] Lỗi tạo kịch bản extended: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def get_veo_prompts(self, script: VideoScript) -> List[Dict[str, Any]]:
        """
        Lấy danh sách prompt để gửi cho Veo 3 API
        
        Mỗi prompt bao gồm:
        - prompt_veo: Prompt chính cho cảnh
        - reference_json: JSON nhân vật (giữ nguyên, không chỉnh sửa)
        - product_json: JSON sản phẩm (giữ nguyên, không chỉnh sửa)
        - thoi_luong: Thời lượng cảnh (giây)
        """
        prompts = []
        for scene in script.scenes:
            prompts.append({
                "scene_number": scene.so_thu_tu,
                "prompt_veo": scene.prompt_veo,
                "duration": scene.thoi_luong,
                "transition": scene.hieu_ung_chuyen,
                "reference_json": scene.reference_json,  # Giữ nguyên
                "product_json": scene.product_json       # Giữ nguyên
            })
        return prompts
