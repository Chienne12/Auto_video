"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                           VIDEO SERVICE                                       ║
║                                                                               ║
║  Mô tả: Service xử lý tạo video từ ảnh + prompt                              ║
║  Hỗ trợ: Veo 3, Kling AI, Grok (qua API)                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import json
from pathlib import Path
from typing import Optional, Callable
from dataclasses import dataclass

from ..models import VideoTask, TaskStatus


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 1: CẤU HÌNH API
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class APIConfig:
    """Cấu hình API cho từng model"""
    api_key: str = ""
    model: str = "veo3"
    
    # Đường dẫn file lưu cấu hình
    CONFIG_FILE = Path.home() / ".auto_video_gen" / "config.json"
    
    def save(self):
        """Lưu cấu hình vào file"""
        self.CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(self.CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                'api_key': self.api_key,
                'model': self.model
            }, f, indent=2)
    
    @classmethod
    def load(cls) -> 'APIConfig':
        """Đọc cấu hình từ file"""
        config = cls()
        if cls.CONFIG_FILE.exists():
            try:
                with open(cls.CONFIG_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    config.api_key = data.get('api_key', '')
                    config.model = data.get('model', 'veo3')
            except Exception:
                pass
        return config


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 2: VIDEO SERVICE
# ═══════════════════════════════════════════════════════════════════════════════

class VideoService:
    """
    Service chính xử lý tạo video.
    
    Sử dụng:
        service = VideoService(api_key="...", model="veo3")
        result = service.generate(task, on_progress=callback)
    """
    
    def __init__(self, api_key: str = "", model: str = "veo3"):
        """
        Khởi tạo service.
        
        Args:
            api_key: API key của dịch vụ
            model: Model sử dụng (veo3, kling, grok)
        """
        self.api_key = api_key
        self.model = model
    
    # ─────────────────────────────────────────────────────────────────────────
    # 2.1: Phương thức chính - Tạo video
    # ─────────────────────────────────────────────────────────────────────────
    
    def generate(
        self, 
        task: VideoTask, 
        output_dir: str,
        on_progress: Optional[Callable[[int], None]] = None
    ) -> bool:
        """
        Tạo video từ task.
        
        Args:
            task: VideoTask chứa thông tin prompt và ảnh
            output_dir: Thư mục lưu video đầu ra
            on_progress: Callback cập nhật tiến độ (0-100)
        
        Returns:
            True nếu thành công, False nếu lỗi
        """
        try:
            # Cập nhật trạng thái
            task.status = TaskStatus.PROCESSING
            task.progress = 0
            
            # Kiểm tra API key
            if not self.api_key:
                task.set_error("Chưa nhập API Key")
                return False
            
            # Kiểm tra file ảnh tồn tại
            if not os.path.exists(task.image_path):
                task.set_error(f"Không tìm thấy ảnh: {task.image_path}")
                return False
            
            # Tạo thư mục output nếu chưa có
            os.makedirs(output_dir, exist_ok=True)
            
            # Gọi API tương ứng với model
            if on_progress:
                on_progress(10)
            
            output_path = self._call_api(task, output_dir, on_progress)
            
            if output_path:
                task.set_completed(output_path)
                return True
            else:
                task.set_error("Không thể tạo video")
                return False
                
        except Exception as e:
            task.set_error(str(e))
            return False
    
    # ─────────────────────────────────────────────────────────────────────────
    # 2.2: Gọi API theo model
    # ─────────────────────────────────────────────────────────────────────────
    
    def _call_api(
        self, 
        task: VideoTask, 
        output_dir: str,
        on_progress: Optional[Callable[[int], None]] = None
    ) -> Optional[str]:
        """
        Gọi API dựa trên model được chọn.
        
        Returns:
            Đường dẫn video nếu thành công, None nếu lỗi
        """
        if self.model == "veo3":
            return self._call_veo3(task, output_dir, on_progress)
        elif self.model == "kling":
            return self._call_kling(task, output_dir, on_progress)
        elif self.model == "grok":
            return self._call_grok(task, output_dir, on_progress)
        else:
            raise ValueError(f"Model không hỗ trợ: {self.model}")
    
    def _call_veo3(
        self, 
        task: VideoTask, 
        output_dir: str,
        on_progress: Optional[Callable[[int], None]] = None
    ) -> Optional[str]:
        """
        Gọi Veo 3 API.
        
        TODO: Implement khi có API documentation
        Hiện tại trả về stub để test UI
        """
        # === STUB - Sẽ thay bằng code thật ===
        import time
        
        # Giả lập tiến độ
        for i in range(10, 100, 10):
            if on_progress:
                on_progress(i)
            time.sleep(0.3)  # Giả lập thời gian xử lý
        
        # Tạo file output giả
        output_path = os.path.join(output_dir, f"{task.id}_output.mp4")
        
        # TODO: Thay bằng code gọi API thật
        # Hiện tại chỉ tạo file rỗng để test
        with open(output_path, 'w') as f:
            f.write("")
        
        if on_progress:
            on_progress(100)
        
        return output_path
    
    def _call_kling(
        self, 
        task: VideoTask, 
        output_dir: str,
        on_progress: Optional[Callable[[int], None]] = None
    ) -> Optional[str]:
        """
        Gọi Kling AI API.
        
        TODO: Implement khi có API documentation
        """
        # === STUB ===
        return self._call_veo3(task, output_dir, on_progress)
    
    def _call_grok(
        self, 
        task: VideoTask, 
        output_dir: str,
        on_progress: Optional[Callable[[int], None]] = None
    ) -> Optional[str]:
        """
        Gọi Grok API.
        
        TODO: Implement khi có API documentation
        """
        # === STUB ===
        return self._call_veo3(task, output_dir, on_progress)
    
    # ─────────────────────────────────────────────────────────────────────────
    # 2.3: Kiểm tra kết nối
    # ─────────────────────────────────────────────────────────────────────────
    
    def test_connection(self) -> tuple[bool, str]:
        """
        Kiểm tra kết nối API.
        
        Returns:
            Tuple (thành_công, thông_báo)
        """
        if not self.api_key:
            return False, "Chưa nhập API Key"
        
        # TODO: Thêm logic kiểm tra API thật
        if len(self.api_key) < 10:
            return False, "API Key không hợp lệ"
        
        return True, f"Kết nối {self.model.upper()} thành công!"
