"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    VIDEO WORKFLOW ORCHESTRATOR                               ║
║        Điều phối toàn bộ luồng tạo video quảng cáo                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

LUỒNG XỬ LÝ:
1. Phân tích ảnh nhân vật → JSON
2. Phân tích ảnh sản phẩm → JSON
3. Tạo kịch bản từ prompt người dùng
4. Chuyển kịch bản VN → prompt EN
5. Tạo video với Veo 3.1
"""

import os
from typing import List, Optional, Callable
from dataclasses import dataclass

from .image_analysis import ImageAnalysisService
from .script_generation import ScriptGenerationService, VideoScript
from .video_generation import (
    VeoVideoService, 
    VeoPromptConverter,
    VideoGenerationRequest,
    VideoGenerationResult
)


@dataclass
class WorkflowConfig:
    """Cấu hình cho workflow"""
    api_key: str                     # Gemini/Veo API key
    person_image_path: str           # Đường dẫn ảnh nhân vật
    product_image_path: str          # Đường dẫn ảnh sản phẩm
    user_prompt: str                 # Prompt từ người dùng
    output_dir: str                  # Thư mục lưu video
    video_mode: str = "short"        # "short" hoặc "extended"
    extended_duration: int = 30      # Thời lượng nếu mode = extended
    num_videos: int = 1              # Số video cần tạo (mode short)


@dataclass
class WorkflowResult:
    """Kết quả của workflow"""
    success: bool
    videos: List[str] = None        # Danh sách đường dẫn video
    script: VideoScript = None       # Kịch bản đã tạo
    error_message: str = None


class VideoWorkflowOrchestrator:
    """Điều phối toàn bộ luồng tạo video"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        
        # Khởi tạo các services
        self.image_analyzer = ImageAnalysisService(api_key)
        self.script_generator = ScriptGenerationService(api_key)
        self.prompt_converter = VeoPromptConverter(api_key)
        self.video_service = VeoVideoService(api_key)
    
    def run(
        self, 
        config: WorkflowConfig,
        on_progress: Callable[[str, int], None] = None
    ) -> WorkflowResult:
        """
        Chạy toàn bộ workflow
        
        Args:
            config: WorkflowConfig object
            on_progress: Callback(message, percent)
            
        Returns:
            WorkflowResult
        """
        try:
            # ========== BƯỚC 1: Phân tích ảnh (20%) ==========
            if on_progress:
                on_progress("Đang phân tích ảnh nhân vật...", 5)
            
            reference_json = self.image_analyzer.analyze_reference(
                config.person_image_path
            )
            
            if reference_json is None:
                return WorkflowResult(
                    success=False,
                    error_message="Lỗi phân tích ảnh nhân vật"
                )
            
            if on_progress:
                on_progress("Đang phân tích ảnh sản phẩm...", 15)
            
            product_json = self.image_analyzer.analyze_product(
                config.product_image_path
            )
            
            if product_json is None:
                return WorkflowResult(
                    success=False,
                    error_message="Lỗi phân tích ảnh sản phẩm"
                )
            
            # ========== BƯỚC 2: Tạo kịch bản (30%) ==========
            if on_progress:
                on_progress("Đang tạo kịch bản...", 25)
            
            script = self.script_generator.generate_script(
                reference_json=reference_json,
                product_json=product_json,
                user_prompt=config.user_prompt,
                so_video=config.num_videos,
                thoi_luong_moi_video=8
            )
            
            if script is None:
                return WorkflowResult(
                    success=False,
                    error_message="Lỗi tạo kịch bản"
                )
            
            # ========== BƯỚC 3: Tạo video (70%) ==========
            videos = []
            
            if config.video_mode == "short":
                # Tạo nhiều video short
                total_scenes = len(script.scenes)
                
                for i, scene in enumerate(script.scenes):
                    progress = 30 + int((i / total_scenes) * 60)
                    if on_progress:
                        on_progress(f"Đang tạo video {i+1}/{total_scenes}...", progress)
                    
                    # Chuyển kịch bản sang prompt EN
                    en_prompt = self.prompt_converter.convert(
                        hanh_dong=scene.hanh_dong,
                        boi_canh=scene.boi_canh
                    )
                    
                    # Tạo request
                    output_path = os.path.join(
                        config.output_dir,
                        f"video_{i+1:02d}.mp4"
                    )
                    
                    request = VideoGenerationRequest(
                        prompt=en_prompt,
                        person_image_path=config.person_image_path,
                        product_image_path=config.product_image_path,
                        output_path=output_path,
                        duration=8
                    )
                    
                    # Tạo video
                    result = self.video_service.generate_short_video(request)
                    
                    if result.success:
                        videos.append(result.video_path)
                    else:
                        print(f"[WARN] Video {i+1} thất bại: {result.error_message}")
                
            else:
                # Tạo 1 video extended
                if on_progress:
                    on_progress("Đang tạo video kéo dài...", 40)
                
                # Dùng cảnh đầu tiên làm prompt
                scene = script.scenes[0] if script.scenes else None
                if scene:
                    en_prompt = self.prompt_converter.convert(
                        hanh_dong=scene.hanh_dong,
                        boi_canh=scene.boi_canh
                    )
                else:
                    en_prompt = config.user_prompt
                
                output_path = os.path.join(config.output_dir, "video_extended.mp4")
                
                request = VideoGenerationRequest(
                    prompt=en_prompt,
                    person_image_path=config.person_image_path,
                    product_image_path=config.product_image_path,
                    output_path=output_path
                )
                
                result = self.video_service.generate_extended_video(
                    request=request,
                    target_duration=config.extended_duration
                )
                
                if result.success:
                    videos.append(result.video_path)
            
            # ========== HOÀN THÀNH (100%) ==========
            if on_progress:
                on_progress("Hoàn thành!", 100)
            
            return WorkflowResult(
                success=len(videos) > 0,
                videos=videos,
                script=script,
                error_message=None if videos else "Không tạo được video nào"
            )
            
        except Exception as e:
            return WorkflowResult(
                success=False,
                error_message=f"Lỗi workflow: {str(e)}"
            )
