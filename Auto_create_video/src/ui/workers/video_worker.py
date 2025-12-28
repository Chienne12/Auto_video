"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    VIDEO WORKER - Background Processing                       ║
║                    Xử lý tạo video trong thread riêng                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from PyQt6.QtCore import QThread, pyqtSignal
from dataclasses import dataclass
from typing import Optional
import json


@dataclass
class VideoWorkflowConfig:
    """Cấu hình cho video workflow"""
    api_key: str
    product_image: str
    ref_image: str
    prompt: str
    output_dir: str
    video_count: int = 2
    video_duration: int = 8
    aspect_ratio: str = "9:16"       # Tỉ lệ video: 9:16, 16:9, 1:1
    model: str = "veo-3.1-fast-generate-preview"  # Model Veo
    threads: int = 1                  # Số luồng (chưa implement multi-thread)
    is_extended: bool = False         # True = video dài (15s+), False = video short (8s)



class VideoWorker(QThread):
    """
    Worker thread để xử lý tạo video.
    Chạy trong thread riêng để không block UI.
    """
    
    # Signals để giao tiếp với UI
    progress = pyqtSignal(str, str)      # (message, level: INFO/SUCCESS/ERROR/WARNING)
    step_completed = pyqtSignal(str, dict)  # (step_name, result_data)
    finished_all = pyqtSignal(bool, str)  # (success, message)
    
    def __init__(self, config: VideoWorkflowConfig):
        super().__init__()
        self.config = config
        self._is_cancelled = False
    
    def cancel(self):
        """Hủy workflow"""
        self._is_cancelled = True
    
    def run(self):
        """Chạy workflow tạo video"""
        try:
            # Import services
            from src.app.services.image_analysis import ImageAnalysisService
            from src.app.services.script_generation import ScriptGenerationService
            from src.app.services.video_generation import (
                VeoVideoService, VeoPromptConverter, VideoGenerationRequest
            )
            
            # ═══════════════════════════════════════════════════════════════
            # BƯỚC 1: PHÂN TÍCH ẢNH
            # ═══════════════════════════════════════════════════════════════
            self.progress.emit("🔍 BƯỚC 1: Đang phân tích ảnh...", "INFO")
            
            if self._is_cancelled:
                self.finished_all.emit(False, "Đã hủy")
                return
            
            image_service = ImageAnalysisService(self.config.api_key)
            
            # Phân tích ảnh tham chiếu
            self.progress.emit("   Đang phân tích ảnh nhân vật...", "INFO")
            self.progress.emit(f"   File: {self.config.ref_image}", "INFO")
            
            try:
                reference_json = image_service.analyze_reference_image(self.config.ref_image)
                if not reference_json:
                    self.finished_all.emit(False, f"Lỗi phân tích ảnh nhân vật - Không nhận được kết quả. Kiểm tra:\n1. File tồn tại: {self.config.ref_image}\n2. API key hợp lệ")
                    return
            except Exception as e:
                self.finished_all.emit(False, f"Lỗi phân tích ảnh nhân vật: {str(e)}")
                return
            self.progress.emit("   ✓ Phân tích nhân vật thành công", "SUCCESS")
            
            # Phân tích ảnh sản phẩm
            self.progress.emit("   Đang phân tích ảnh sản phẩm...", "INFO")
            
            try:
                product_json = image_service.analyze_product_image(self.config.product_image)
                if not product_json:
                    self.finished_all.emit(False, f"Lỗi phân tích ảnh sản phẩm - Không nhận được kết quả")
                    return
            except Exception as e:
                self.finished_all.emit(False, f"Lỗi phân tích ảnh sản phẩm: {str(e)}")
                return
            self.progress.emit("   ✓ Phân tích sản phẩm thành công", "SUCCESS")
            
            self.step_completed.emit("image_analysis", {
                "reference": reference_json,
                "product": product_json
            })
            
            # ═══════════════════════════════════════════════════════════════
            # BƯỚC 2: TẠO KỊCH BẢN
            # ═══════════════════════════════════════════════════════════════
            if self.config.is_extended:
                self.progress.emit(f"📝 BƯỚC 2: Đang tạo kịch bản video dài ({self.config.video_duration}s)...", "INFO")
            else:
                self.progress.emit("📝 BƯỚC 2: Đang tạo kịch bản video short (8s)...", "INFO")
            
            if self._is_cancelled:
                self.finished_all.emit(False, "Đã hủy")
                return
            
            script_service = ScriptGenerationService(self.config.api_key)
            
            # ═══════════════════════════════════════════════════════════════
            # PHÂN NHÁNH: VIDEO NGẮN vs VIDEO DÀI
            # ═══════════════════════════════════════════════════════════════
            if self.config.is_extended:
                # VIDEO DÀI: Tạo nhiều segments liên tục
                extended_script = script_service.generate_extended_script(
                    reference_json=reference_json,
                    product_json=product_json,
                    user_prompt=self.config.prompt,
                    total_duration=self.config.video_duration,
                    segment_duration=8  # Mỗi segment 8s (max của Veo)
                )
                
                if not extended_script:
                    self.finished_all.emit(False, "Lỗi tạo kịch bản video dài")
                    return
                
                num_segments = len(extended_script.get("segments", []))
                self.progress.emit(f"   ✓ Đã tạo kịch bản với {num_segments} segments", "SUCCESS")
                self.step_completed.emit("script_generation", extended_script)
                
                # Chuyển extended_script thành các scenes để xử lý tiếp
                # Mỗi segment sẽ được convert sang Veo prompt riêng
                script_scenes = extended_script.get("segments", [])
                is_extended_mode = True
            else:
                # VIDEO NGẮN: Flow cũ
                script = script_service.generate_script(
                    reference_json=reference_json,
                    product_json=product_json,
                    user_prompt=self.config.prompt,
                    so_video=self.config.video_count,
                    thoi_luong_moi_video=self.config.video_duration
                )
                
                if not script:
                    self.finished_all.emit(False, "Lỗi tạo kịch bản")
                    return
                
                self.progress.emit(f"   ✓ Đã tạo kịch bản với {len(script.scenes)} cảnh", "SUCCESS")
                self.step_completed.emit("script_generation", script.to_dict())
                script_scenes = script.scenes
                is_extended_mode = False
            
            # ═══════════════════════════════════════════════════════════════
            # BƯỚC 3: CHUYỂN PROMPT TIẾNG ANH
            # ═══════════════════════════════════════════════════════════════
            self.progress.emit("🔄 BƯỚC 3: Đang chuyển prompt sang tiếng Anh...", "INFO")
            
            if self._is_cancelled:
                self.finished_all.emit(False, "Đã hủy")
                return
            
            converter = VeoPromptConverter(self.config.api_key)
            prompts = []
            
            for scene in script.scenes:
                en_prompt = converter.convert(
                    hanh_dong=scene.hanh_dong,
                    boi_canh=scene.boi_canh,
                    reference_json=reference_json,
                    product_json=product_json
                )
                prompts.append({
                    "scene": scene.so_thu_tu,
                    "en_prompt": en_prompt
                })
                self.progress.emit(f"   ✓ Chuyển xong cảnh {scene.so_thu_tu}", "SUCCESS")
            
            self.step_completed.emit("prompt_conversion", {"prompts": prompts})
            
            # ═══════════════════════════════════════════════════════════════
            # BƯỚC 4: TẠO VIDEO (SONG SONG THEO SỐ LUỒNG)
            # ═══════════════════════════════════════════════════════════════
            num_threads = self.config.threads
            self.progress.emit(f"🎬 BƯỚC 4: Đang tạo {len(prompts)} video với {num_threads} luồng...", "INFO")
            
            if self._is_cancelled:
                self.finished_all.emit(False, "Đã hủy")
                return
            
            video_service = VeoVideoService(self.config.api_key)
            video_paths = []
            
            import os
            from concurrent.futures import ThreadPoolExecutor, as_completed
            import threading
            
            os.makedirs(self.config.output_dir, exist_ok=True)
            
            # Lock để thread-safe khi emit signals
            results_lock = threading.Lock()
            completed_count = [0]  # Mutable để update trong closure
            
            def generate_single_video(prompt_data, index):
                """Hàm tạo 1 video - chạy trong thread riêng"""
                if self._is_cancelled:
                    return None
                
                output_path = os.path.join(
                    self.config.output_dir, 
                    f"video_{prompt_data['scene']:02d}.mp4"
                )
                
                request = VideoGenerationRequest(
                    prompt=prompt_data["en_prompt"],
                    person_image_path=self.config.ref_image,
                    product_image_path=self.config.product_image,
                    output_path=output_path,
                    duration=self.config.video_duration,
                    resolution="720p",
                    aspect_ratio=self.config.aspect_ratio
                )
                
                # Gọi API tạo video - phân nhánh theo loại video
                if self.config.is_extended:
                    result = video_service.generate_extended_video(
                        request=request,
                        target_duration=self.config.video_duration
                    )
                else:
                    result = video_service.generate_short_video(request)
                
                # DEBUG: In kết quả chi tiết
                print(f"[DEBUG] Video result: success={result.success}, path={result.video_path}, error={result.error_message}")
                
                # Update progress (thread-safe)
                with results_lock:
                    completed_count[0] += 1
                    if result.success:
                        self.progress.emit(f"   ✓ [{completed_count[0]}/{len(prompts)}] Video {prompt_data['scene']} hoàn thành", "SUCCESS")
                        print(f"[DEBUG] Returning video_path: {result.video_path}")
                        return result.video_path
                    else:
                        self.progress.emit(f"   ✗ [{completed_count[0]}/{len(prompts)}] Lỗi video {prompt_data['scene']}: {result.error_message}", "ERROR")
                        return None
            
            # Chạy song song với ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                # Submit tất cả tasks
                future_to_prompt = {
                    executor.submit(generate_single_video, p, i): p 
                    for i, p in enumerate(prompts)
                }
                
                # Thu thập kết quả khi hoàn thành
                for future in as_completed(future_to_prompt):
                    if self._is_cancelled:
                        executor.shutdown(wait=False, cancel_futures=True)
                        self.finished_all.emit(False, "Đã hủy")
                        return
                    
                    result_path = future.result()
                    if result_path:
                        video_paths.append(result_path)
            
            self.step_completed.emit("video_generation", {"videos": video_paths})
            
            # ═══════════════════════════════════════════════════════════════
            # HOÀN TẤT
            # ═══════════════════════════════════════════════════════════════
            success_count = len(video_paths)
            total_count = len(prompts)
            
            if success_count == total_count:
                self.finished_all.emit(True, f"Hoàn tất! Đã tạo {success_count} video")
            elif success_count > 0:
                self.finished_all.emit(True, f"Đã tạo {success_count}/{total_count} video")
            else:
                self.finished_all.emit(False, "Không tạo được video nào")
                
        except Exception as e:
            self.progress.emit(f"❌ Lỗi: {str(e)}", "ERROR")
            self.finished_all.emit(False, str(e))
