"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    VEO 3.1 VIDEO GENERATION SERVICE                          ║
║        Tạo video quảng cáo sử dụng Google Veo 3.1 API                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

TÍNH NĂNG CHÍNH:
1. Tạo video short (8 giây) với reference images
2. Tạo video kéo dài (lên đến 141 giây) với extension
3. Sử dụng ảnh nhân vật + ảnh sản phẩm để đảm bảo đồng nhất
"""

import time
import os
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from functools import wraps
import random

# Google Generative AI
from google import genai
from google.genai import types


# ═══════════════════════════════════════════════════════════════════════════════
# RETRY UTILITY - Tự động retry khi API fail
# ═══════════════════════════════════════════════════════════════════════════════

def retry_with_backoff(max_retries: int = 3, base_delay: float = 2.0, max_delay: float = 60.0):
    """
    Decorator để retry function với exponential backoff.
    
    Args:
        max_retries: Số lần retry tối đa
        base_delay: Delay ban đầu (giây)
        max_delay: Delay tối đa (giây)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    error_msg = str(e).lower()
                    
                    # Kiểm tra nếu là lỗi có thể retry
                    retryable_errors = [
                        'resource_exhausted',
                        'rate limit',
                        'quota exceeded',
                        '429',
                        '503',
                        'temporarily unavailable',
                        'timeout',
                        'connection'
                    ]
                    
                    is_retryable = any(err in error_msg for err in retryable_errors)
                    
                    if attempt < max_retries and is_retryable:
                        # Exponential backoff với jitter
                        delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                        print(f"[RETRY] Attempt {attempt + 1}/{max_retries} failed: {e}")
                        print(f"[RETRY] Waiting {delay:.1f}s before retry...")
                        time.sleep(delay)
                    else:
                        # Không retry hoặc đã hết lần retry
                        raise last_exception
            
            raise last_exception
        return wrapper
    return decorator


# ═══════════════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class VideoGenerationResult:
    """Kết quả tạo video"""
    success: bool
    video_path: Optional[str] = None
    error_message: Optional[str] = None
    duration: int = 8


@dataclass
class VideoGenerationRequest:
    """Request tạo video"""
    prompt: str                      # Prompt tiếng Anh cho Veo
    person_image_path: str           # Đường dẫn ảnh nhân vật
    product_image_path: str          # Đường dẫn ảnh sản phẩm
    output_path: str                 # Đường dẫn lưu video
    duration: int = 8                # Thời lượng (4, 6, 8 giây)
    resolution: str = "720p"         # Độ phân giải
    aspect_ratio: str = "9:16"       # Tỉ lệ khung hình


# ═══════════════════════════════════════════════════════════════════════════════
# VEO VIDEO GENERATION SERVICE
# ═══════════════════════════════════════════════════════════════════════════════

class VeoVideoService:
    """Service tạo video sử dụng Veo 3.1 API"""
    
    MODEL_NAME = "veo-3.1-fast-generate-preview"  # Fast model hoạt động!
    MAX_POLL_ATTEMPTS = 60  # Tối đa 10 phút (60 * 10s)
    POLL_INTERVAL = 10      # 10 giây mỗi lần poll
    
    def __init__(self, api_key: str):
        """
        Khởi tạo service với API key
        
        Args:
            api_key: Google API key có quyền truy cập Veo
        """
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)
    
    def _upload_image(self, image_path: str) -> Any:
        """Upload ảnh lên Google Files API"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Không tìm thấy ảnh: {image_path}")
        
        return self.client.files.upload(file=image_path)
    
    def _create_reference_image(
        self, 
        image_file: Any, 
        reference_type: str = "asset"
    ) -> types.VideoGenerationReferenceImage:
        """
        Tạo reference image cho Veo
        
        Args:
            image_file: File đã upload
            reference_type: "asset" để giữ nguyên diện mạo
        """
        return types.VideoGenerationReferenceImage(
            image=image_file,
            reference_type=reference_type
        )
    
    def _poll_operation(self, operation) -> Any:
        """
        Poll cho đến khi video hoàn thành
        
        Returns:
            Video object hoặc None nếu timeout/error
        """
        for attempt in range(self.MAX_POLL_ATTEMPTS):
            if operation.done:
                return operation.response.generated_videos[0] if operation.response else None
            
            print(f"[VEO] Đang tạo video... ({attempt * self.POLL_INTERVAL}s)")
            time.sleep(self.POLL_INTERVAL)
            operation = self.client.operations.get(operation)
        
        print("[VEO] Timeout - Video generation took too long")
        return None
    
    @retry_with_backoff(max_retries=3, base_delay=5.0, max_delay=120.0)
    def _generate_videos_with_retry(self, prompt: str, config: types.GenerateVideosConfig):
        """
        Gọi Veo generate_videos API với retry logic.
        Tự động retry khi gặp rate limit hoặc lỗi tạm thời.
        """
        return self.client.models.generate_videos(
            model=self.MODEL_NAME,
            prompt=prompt,
            config=config
        )
    
    def generate_short_video(
        self,
        request: VideoGenerationRequest,
        on_progress: callable = None
    ) -> VideoGenerationResult:
        """
        Tạo video short (8 giây) chỉ dùng prompt
        
        Args:
            request: VideoGenerationRequest object
            on_progress: Callback function(message: str)
            
        Returns:
            VideoGenerationResult
        """
        try:
            # Gọi Veo API với retry logic
            if on_progress:
                on_progress("Đang tạo video với Veo 3.1 Fast...")
            
            config = types.GenerateVideosConfig(
                duration_seconds=request.duration,
                resolution=request.resolution,
                aspect_ratio=request.aspect_ratio,
                number_of_videos=1
            )
            operation = self._generate_videos_with_retry(request.prompt, config)
            
            # Poll cho đến khi hoàn thành
            video = self._poll_operation(operation)
            
            if video is None:
                return VideoGenerationResult(
                    success=False,
                    error_message="Timeout hoặc lỗi khi tạo video"
                )
            
            # Download video
            if on_progress:
                on_progress("Đang tải video...")
            
            self.client.files.download(file=video.video)
            video.video.save(request.output_path)
            
            return VideoGenerationResult(
                success=True,
                video_path=request.output_path,
                duration=request.duration
            )
            
        except FileNotFoundError as e:
            return VideoGenerationResult(
                success=False,
                error_message=str(e)
            )
        except Exception as e:
            return VideoGenerationResult(
                success=False,
                error_message=f"Lỗi Veo API: {str(e)}"
            )
    
    def generate_extended_video(
        self,
        request: VideoGenerationRequest,
        target_duration: int = 30,
        on_progress: callable = None
    ) -> VideoGenerationResult:
        """
        Tạo video kéo dài bằng cách extension
        
        Args:
            request: VideoGenerationRequest object
            target_duration: Thời lượng mong muốn (8-141 giây)
            on_progress: Callback function
            
        Returns:
            VideoGenerationResult
        """
        if target_duration < 8:
            target_duration = 8
        if target_duration > 141:
            target_duration = 141
        
        try:
            # 1. Tạo video đầu tiên (8 giây)
            if on_progress:
                on_progress("Đang tạo video gốc (8 giây)...")
            
            initial_result = self.generate_short_video(request, on_progress)
            
            if not initial_result.success:
                return initial_result
            
            current_duration = 8
            current_video = None  # Sẽ lấy từ operation trước
            
            # 2. Extension loop
            extension_count = 0
            while current_duration < target_duration:
                extension_count += 1
                if on_progress:
                    on_progress(f"Đang kéo dài video... ({current_duration}s → {current_duration + 7}s)")
                
                # Gọi extension API
                operation = self.client.models.generate_videos(
                    model=self.MODEL_NAME,
                    video=current_video,
                    prompt=request.prompt,
                    config=types.GenerateVideosConfig(
                        number_of_videos=1,
                        resolution="720p"
                    )
                )
                
                video = self._poll_operation(operation)
                
                if video is None:
                    return VideoGenerationResult(
                        success=False,
                        error_message=f"Lỗi khi kéo dài video (extension #{extension_count})"
                    )
                
                current_video = video.video
                current_duration += 7  # Mỗi extension thêm 7 giây
            
            # 3. Download video cuối cùng
            if on_progress:
                on_progress("Đang tải video hoàn chỉnh...")
            
            self.client.files.download(file=current_video)
            current_video.save(request.output_path)
            
            return VideoGenerationResult(
                success=True,
                video_path=request.output_path,
                duration=current_duration
            )
            
        except Exception as e:
            return VideoGenerationResult(
                success=False,
                error_message=f"Lỗi extension video: {str(e)}"
            )
    
    def generate_batch_videos(
        self,
        requests: List[VideoGenerationRequest],
        on_progress: callable = None
    ) -> List[VideoGenerationResult]:
        """
        Tạo nhiều video từ danh sách requests
        
        Args:
            requests: Danh sách VideoGenerationRequest
            on_progress: Callback function(message: str, current: int, total: int)
            
        Returns:
            Danh sách VideoGenerationResult
        """
        results = []
        total = len(requests)
        
        for i, request in enumerate(requests, 1):
            if on_progress:
                on_progress(f"Đang tạo video {i}/{total}...", i, total)
            
            result = self.generate_short_video(request, on_progress)
            results.append(result)
            
            # Log kết quả
            if result.success:
                print(f"[VEO] Video {i}/{total} thành công: {result.video_path}")
            else:
                print(f"[VEO] Video {i}/{total} thất bại: {result.error_message}")
        
        return results


# ═══════════════════════════════════════════════════════════════════════════════
# PROMPT CONVERTER - Chuyển kịch bản VN sang prompt EN cho Veo
# ═══════════════════════════════════════════════════════════════════════════════

class VeoPromptConverter:
    """Chuyển đổi kịch bản tiếng Việt sang prompt tiếng Anh tối ưu cho Veo"""
    
    CONVERSION_PROMPT = """You are a professional video prompt engineer for Veo 3.1.
Create an optimized English video prompt for a product advertisement video.

═══════════════════════════════════════════════════════════════
CHARACTER PHYSICAL APPEARANCE (from reference photo):
═══════════════════════════════════════════════════════════════
{reference_json}

⚠️ IMPORTANT: Only use PHYSICAL APPEARANCE from above (face, hair, body, skin).
DO NOT use the clothing from reference - the character will wear the PRODUCT below.

═══════════════════════════════════════════════════════════════
PRODUCT/CLOTHING (character will WEAR this):
═══════════════════════════════════════════════════════════════
{product_json}

═══════════════════════════════════════════════════════════════
SCENE SCRIPT:
═══════════════════════════════════════════════════════════════
- Action: {hanh_dong}
- Setting: {boi_canh}

═══════════════════════════════════════════════════════════════
🎥 SMOOTH CAMERA MOTION (CRITICAL):
═══════════════════════════════════════════════════════════════
- Use SMOOTH, FLUID camera movements: "steady tracking shot", "smooth dolly in"
- Camera should move NATURALLY: "gentle pan", "slow orbit around subject"
- Avoid jerky motion: "cinematic steadicam", "floating camera movement"
- Speed variation: "camera slowly approaches, then holds"

═══════════════════════════════════════════════════════════════
🎬 NATURAL MOTION (CRITICAL):
═══════════════════════════════════════════════════════════════
- Vary speed: "starts slowly, then moves faster", "sudden pause"
- Micro-movements: "slight head tilt", "gentle sway", "hair flowing"
- Breathing: "chest rises gently", "shoulders relax"
- Dynamic: "quick turn", "graceful pivot", "playful bounce"

═══════════════════════════════════════════════════════════════
✅ COMPLETE SCENE STRUCTURE (8 seconds):
═══════════════════════════════════════════════════════════════
Structure the scene with:
1. OPENING (0-2s): Character enters or is revealed
2. ACTION (2-6s): Main action with dynamic movement
3. ENDING (6-8s): Natural conclusion - hold pose, smile at camera, or moment of stillness

The scene MUST END NATURALLY so it can be easily edited/transitioned to next clip!

CRITICAL: Professional, cinematic quality. Character wears the PRODUCT, not original clothes!

OUTPUT: Only the English prompt, nothing else. Under 500 words."""

    def __init__(self, api_key: str):
        # Use google.generativeai for text generation (not google.genai which is for video)
        import google.generativeai as genai_text
        genai_text.configure(api_key=api_key)
        self.model = genai_text.GenerativeModel('gemini-2.0-flash')
    
    def _format_product_physics(self, product_json: dict) -> str:
        """Helper: Chuyển đổi JSON Product V2 sang Prompt Vật lý cho Veo"""
        dna = product_json.get('product_dna', {})
        
        # 1. Xử lý Vật lý (Rigid vs Soft)
        physics = dna.get('structure_physics', {})
        physics_desc = f"Physics & Dynamics: Rigid parts include {physics.get('rigid_parts', 'main structure')}. "
        if physics.get('soft_parts'):
            physics_desc += f"Soft parts include {physics.get('soft_parts')} which show {physics.get('dynamic_behavior', 'natural movement')}."
            
        # 2. Xử lý Chất liệu & Ánh sáng (Texture loop)
        textures = []
        for tex in dna.get('macro_textures', []):
            desc = f"{tex.get('part_name', 'part')} is {tex.get('surface_finish', 'smooth')} {tex.get('material_type', 'material')} with {tex.get('lighting_response', 'natural light response')}."
            textures.append(desc)
        texture_desc = "Materials: " + " ".join(textures) if textures else "Materials: Standard product materials."
        
        # 3. Branding
        brand = dna.get('branding_identity', {})
        brand_desc = f"Branding: Logo at {brand.get('placement', 'visible location')}."
        
        return f"{physics_desc} {texture_desc} {brand_desc}"
    
    def convert(
        self, 
        hanh_dong: str, 
        boi_canh: str,
        reference_json: dict = None,
        product_json: dict = None
    ) -> str:
        """
        Chuyển kịch bản VN sang prompt EN với đầy đủ thông tin nhân vật và sản phẩm
        
        Args:
            hanh_dong: Mô tả hành động (tiếng Việt)
            boi_canh: Mô tả bối cảnh (tiếng Việt)
            reference_json: JSON mô tả nhân vật từ ảnh tham chiếu
            product_json: JSON mô tả sản phẩm
            
        Returns:
            Prompt tiếng Anh đầy đủ cho Veo
        """
        import json
        
        ref_str = json.dumps(reference_json, ensure_ascii=False, indent=2) if reference_json else "{}"
        prod_str = json.dumps(product_json, ensure_ascii=False, indent=2) if product_json else "{}"
        
        prompt = self.CONVERSION_PROMPT.format(
            reference_json=ref_str,
            product_json=prod_str,
            hanh_dong=hanh_dong,
            boi_canh=boi_canh
        )
        
        response = self.model.generate_content(prompt)
        return response.text.strip()
    
    def convert_affiliate_clean(self, scene_data: dict) -> str:
        """
        Chuyển đổi JSON Affiliate sang Visual Prompt sạch cho Veo.
        Bao gồm cả yếu tố Tâm lý hình ảnh (Visual Psychology) để tạo Mood & Atmosphere.
        
        Args:
            scene_data: Dict chứa Deep Marketing Schema với:
                - visual_psychology: Giải thích tâm lý góc quay (NEW)
                - product_lock: Product DNA V2 JSON (NEW - với physics)
                - presenter_lock: {style, action}
                - camera_tech: {angle, movement, lighting}
                - sound_layer: (sẽ bị bỏ qua)
                - marketing_goal: (sẽ bị bỏ qua)
        
        Returns:
            Prompt tiếng Anh với Mood/Atmosphere từ Visual Psychology
        """
        # Extract thông tin visual
        actor = scene_data.get('presenter_lock', {})
        cam = scene_data.get('camera_tech', {})
        
        # NEW: Lấy visual psychology để tạo Mood & Atmosphere
        psych = scene_data.get('visual_psychology', 'Professional commercial shot with focus on product details')
        
        # NEW: Sử dụng helper để format physics từ Product DNA V2
        # Lưu ý: scene_data['product_lock'] bây giờ chính là JSON product_dna từ Image Analysis
        product_desc = self._format_product_physics(scene_data.get('product_lock', {}))
        
        # Xây dựng prompt tiếng Anh với MOOD từ psychology
        prompt_parts = [
            "Style: Professional commercial videography, 4k, hyper-realistic.",
            
            # MOOD & ATMOSPHERE (Từ Visual Psychology)
            f"Atmosphere & Mood: {psych}. Intense focus on texture and details.",
            
            f"Subject: {actor.get('style', 'A user')}. Action: {actor.get('action', 'interacting with product')}.",
            
            # NEW: Thay thế phần Product cũ bằng physics description
            f"Product High-Fidelity Details: {product_desc}",
            
            f"Cinematography: {cam.get('angle', 'eye level')}, {cam.get('movement', 'smooth tracking')}. Lighting: {cam.get('lighting', 'Studio lighting')}.",
            
            "Negative constraint: No text, no lyrics, no subtitles, no words on screen, clean background."
        ]
        
        return " ".join(prompt_parts)


