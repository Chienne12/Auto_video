"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                        CONFIG - Quản lý cấu hình                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
from pathlib import Path

# Try to load dotenv if available
try:
    from dotenv import load_dotenv
    # Find .env in project root (Auto_create_video folder)
    project_root = Path(__file__).parent.parent.parent
    env_path = project_root / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        print(f"[CONFIG] Loaded .env from {env_path}")
except ImportError:
    print("[CONFIG] python-dotenv not installed, using system env vars")


class Config:
    """Cấu hình ứng dụng từ environment variables"""
    
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    VEO_API_KEY = os.getenv('VEO_API_KEY', '')
    MEGALLM_API_KEY = os.getenv('MEGALLM_API_KEY', '')
    
    # Models
    DEFAULT_VISION_MODEL = os.getenv('DEFAULT_VISION_MODEL', 'gemini-2.0-flash')
    DEFAULT_TEXT_MODEL = os.getenv('DEFAULT_TEXT_MODEL', 'gemini-2.0-flash')
    DEFAULT_VEO_MODEL = os.getenv('DEFAULT_VEO_MODEL', 'veo-3.1-generate-preview')
    
    # Video Settings
    DEFAULT_OUTPUT_DIR = os.getenv('DEFAULT_OUTPUT_DIR', 'output_videos')
    DEFAULT_VIDEO_RESOLUTION = os.getenv('DEFAULT_VIDEO_RESOLUTION', '720p')
    DEFAULT_VIDEO_DURATION = int(os.getenv('DEFAULT_VIDEO_DURATION', '8'))
    
    @classmethod
    def get_api_key(cls, service: str = 'gemini') -> str:
        """
        Lấy API key theo service
        
        Args:
            service: 'gemini', 'veo', hoặc 'megallm'
            
        Returns:
            API key string
        """
        if service == 'veo':
            return cls.VEO_API_KEY or cls.GEMINI_API_KEY
        elif service == 'megallm':
            return cls.MEGALLM_API_KEY
        else:
            return cls.GEMINI_API_KEY
    
    @classmethod
    def validate(cls) -> bool:
        """Kiểm tra cấu hình hợp lệ"""
        if not cls.GEMINI_API_KEY:
            print("[CONFIG] Warning: GEMINI_API_KEY chưa được cấu hình")
            return False
        return True


# Singleton config instance
config = Config()
