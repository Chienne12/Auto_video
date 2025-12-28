"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                         VIDEO TASK MODEL                                      ║
║                                                                               ║
║  Mô tả: Model đại diện cho một task tạo video                                ║
║  Chứa thông tin: prompt, ảnh đầu vào, trạng thái, kết quả                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
from datetime import datetime
import uuid


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 1: ENUM - TRẠNG THÁI VÀ MODEL
# ═══════════════════════════════════════════════════════════════════════════════

class TaskStatus(Enum):
    """Trạng thái của task video"""
    PENDING = "pending"         # Đang chờ xử lý
    PROCESSING = "processing"   # Đang xử lý
    COMPLETED = "completed"     # Hoàn thành
    ERROR = "error"             # Lỗi


class AIModel(Enum):
    """Các model AI hỗ trợ tạo video"""
    VEO3 = "veo3"               # Google Veo 3
    KLING = "kling"             # Kling AI
    GROK = "grok"               # Grok AI


# ═══════════════════════════════════════════════════════════════════════════════
# PHẦN 2: VIDEO TASK MODEL
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class VideoTask:
    """
    Model đại diện cho một task tạo video.
    
    Thuộc tính:
        id: ID duy nhất của task
        prompt: Nội dung prompt mô tả video
        image_path: Đường dẫn ảnh sản phẩm đầu vào
        ref_image_path: Đường dẫn ảnh tham chiếu (tùy chọn)
        status: Trạng thái hiện tại
        model: Model AI sử dụng
        output_path: Đường dẫn video đầu ra
        error_message: Thông báo lỗi (nếu có)
        created_at: Thời gian tạo
        progress: Tiến độ xử lý (0-100)
    """
    
    # === Thông tin cơ bản ===
    prompt: str                                         # Prompt mô tả video
    image_path: str                                     # Đường dẫn ảnh sản phẩm
    
    # === Thông tin tùy chọn ===
    ref_image_path: Optional[str] = None                # Ảnh tham chiếu
    model: AIModel = AIModel.VEO3                       # Model mặc định
    
    # === Trạng thái ===
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    status: TaskStatus = TaskStatus.PENDING
    progress: int = 0                                   # 0-100%
    
    # === Kết quả ===
    output_path: Optional[str] = None                   # Video đầu ra
    error_message: Optional[str] = None                 # Lỗi nếu có
    
    # === Metadata ===
    created_at: datetime = field(default_factory=datetime.now)
    
    # ─────────────────────────────────────────────────────────────────────────
    # Các phương thức tiện ích
    # ─────────────────────────────────────────────────────────────────────────
    
    def to_dict(self) -> dict:
        """Chuyển đổi thành dictionary để lưu trữ"""
        return {
            'id': self.id,
            'prompt': self.prompt,
            'image_path': self.image_path,
            'ref_image_path': self.ref_image_path,
            'model': self.model.value,
            'status': self.status.value,
            'progress': self.progress,
            'output_path': self.output_path,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'VideoTask':
        """Tạo VideoTask từ dictionary"""
        task = cls(
            prompt=data['prompt'],
            image_path=data['image_path'],
            ref_image_path=data.get('ref_image_path'),
            model=AIModel(data.get('model', 'veo3'))
        )
        task.id = data.get('id', task.id)
        task.status = TaskStatus(data.get('status', 'pending'))
        task.progress = data.get('progress', 0)
        task.output_path = data.get('output_path')
        task.error_message = data.get('error_message')
        return task
    
    def is_done(self) -> bool:
        """Kiểm tra task đã hoàn thành chưa"""
        return self.status in [TaskStatus.COMPLETED, TaskStatus.ERROR]
    
    def set_error(self, message: str):
        """Đặt trạng thái lỗi"""
        self.status = TaskStatus.ERROR
        self.error_message = message
        self.progress = 0
    
    def set_completed(self, output_path: str):
        """Đặt trạng thái hoàn thành"""
        self.status = TaskStatus.COMPLETED
        self.output_path = output_path
        self.progress = 100
