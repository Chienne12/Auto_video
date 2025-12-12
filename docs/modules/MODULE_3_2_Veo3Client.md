# MODULE 3.2: VIDEO API CLIENT (VEO3)

## 🎯 MỤC TIÊU

**Chức năng**: Generate video clips sử dụng Veo3 API qua fal.ai

**Input**: Prompt + duration + aspect ratio
**Output**: Video URL → Downloaded MP4

**Why Veo3**: Tốt nhất cho consistency + giá $0.10/video (rẻ nhất)

---

## 📝 IMPLEMENTATION

```python
# src/video_engine/api_clients/veo3_client.py
"""Veo3 API Client via fal.ai"""

import os
import time
import requests
from typing import Optional, Dict
from pathlib import Path
import fal_client


class Veo3Client:
    """
    Client for Google Veo3 via fal.ai
    
    Pricing: ~$0.10 per video (8 seconds)
    Quality: Best for product consistency
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Veo3 client
        
        Args:
            api_key: fal.ai API key (or use FAL_KEY env var)
        """
        self.api_key = api_key or os.getenv("FAL_KEY")
        if not self.api_key:
            raise ValueError("FAL_KEY not found! Get one from https://fal.ai/")
        
        # Configure fal client
        os.environ["FAL_KEY"] = self.api_key
    
    def generate_video(
        self,
        prompt: str,
        image_url: Optional[str] = None,
        aspect_ratio: str = "16:9",
        duration: int = 8,
        timeout: int = 180
    ) -> Dict:
        """
        Generate video with Veo3
        
        Args:
            prompt: Visual description
            image_url: First frame image (optional)
            aspect_ratio: "16:9", "9:16", or "1:1"
            duration: Video duration (default 8s)
            timeout: Max wait time in seconds
            
        Returns:
            dict: {"video_url": "https://...", "duration": 8}
            
        Example:
            >>> client = Veo3Client()
            >>> result = client.generate_video(
            ...     "White Nike shoe rotating on table",
            ...     aspect_ratio="9:16"
            ... )
            >>> print(result["video_url"])
        """
        print(f"[Veo3] Generating video...")
        print(f"  Prompt: {prompt[:80]}...")
        
        # Build request
        handler_input = {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio
        }
        
        # Add image if provided
        if image_url:
            handler_input["image_url"] = image_url
        
        # Call fal.ai API
        start_time = time.time()
        
        try:
            result = fal_client.subscribe(
                "fal-ai/veo3",
                arguments=handler_input,
                with_logs=False,
                timeout=timeout
            )
            
            elapsed = time.time() - start_time
            print(f"  ✓ Generated in {elapsed:.1f}s")
            
            # Extract video URL
            video_url = result["data"]["video"]["url"]
            
            return {
                "video_url": video_url,
                "duration": duration,
                "elapsed_time": elapsed
            }
            
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            raise
    
    def generate_and_download(
        self,
        prompt: str,
        output_path: str,
        image_url: Optional[str] = None,
        aspect_ratio: str = "16:9"
    ) -> str:
        """
        Generate video AND download to file
        
        Args:
            prompt: Visual description
            output_path: Where to save video
            image_url: First frame (optional)
            aspect_ratio: Aspect ratio
            
        Returns:
            str: Path to downloaded video
        """
        # Generate
        result = self.generate_video(
            prompt=prompt,
            image_url=image_url,
            aspect_ratio=aspect_ratio
        )
        
        # Download
        print(f"[Veo3] Downloading video...")
        video_path = self.download_video(
            result["video_url"],
            output_path
        )
        
        print(f"  ✓ Saved to: {video_path}")
        return video_path
    
    @staticmethod
    def download_video(url: str, output_path: str) -> str:
        """
        Download video from URL
        
        Args:
            url: Video URL
            output_path: Save path
            
        Returns:
            str: Path to saved file
        """
        # Create directory
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Download
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Save
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return output_path
    
    def estimate_cost(self, num_videos: int) -> float:
        """
        Estimate cost for number of videos
        
        Args:
            num_videos: Number of videos to generate
            
        Returns:
            float: Estimated cost in USD
        """
        cost_per_video = 0.10  # ~$0.10 per video
        return num_videos * cost_per_video


# Example usage
if __name__ == "__main__":
    # Initialize
    client = Veo3Client()
    
    # Test prompt
    prompt = """
    Medium shot of a white Nike Air Max 90 sneaker rotating slowly
    on a clean white surface. Soft lighting from above highlights
    the red swoosh logo and visible air cushion in heel.
    Camera orbits 180 degrees around the shoe.
    Professional product photography style.
    8-second duration.
    """
    
    # Generate and download
    video_path = client.generate_and_download(
        prompt=prompt,
        output_path="test_output/nike_video.mp4",
        aspect_ratio="9:16"  # TikTok format
    )
    
    print(f"\n✓ Video saved: {video_path}")
    
    # Cost estimate
    cost = client.estimate_cost(3)  # 3 scenes
    print(f"💰 Cost for 3 videos: ${cost:.2f}")
```

---

## 🧪 TESTING

```python
# tests/test_veo3_client.py
import pytest
import os
from src.video_engine.api_clients.veo3_client import Veo3Client


class TestVeo3Client:
    
    @pytest.fixture
    def client(self):
        """Create client (requires FAL_KEY)"""
        return Veo3Client()
    
    @pytest.mark.slow  # Annotate as slow test
    def test_video_generation(self, client, tmp_path):
        """Test video generation (SLOW - costs $0.10)"""
        prompt = "White sneaker rotating on table"
        output = tmp_path / "test.mp4"
        
        result = client.generate_and_download(
            prompt=prompt,
            output_path=str(output),
            aspect_ratio="16:9"
        )
        
        assert os.path.exists(result)
        assert os.path.getsize(result) > 1000  # At least 1KB
    
    def test_cost_estimation(self, client):
        """Test cost calculation"""
        cost = client.estimate_cost(10)
        
        assert cost == 1.0  # 10 × $0.10
    
    def test_download_video(self, tmp_path):
        """Test video download"""
        # Use sample video URL
        test_url = "https://example.com/sample.mp4"  # Mock
        output = tmp_path / "downloaded.mp4"
        
        # Note: This will fail without real URL
        # In real test, use pytest-vcr to mock responses
```

---

## 🎓 PROMPT ENGINEERING TIPS

### Best Practices for Veo3

**✅ DO**:
```python
prompt = """
Medium shot, eye-level angle.
White Nike Air Max 90 sneaker on white surface.
Soft natural lighting from left.
Camera static, 8-second duration.
"""
```

**❌ DON'T**:
```python
prompt = "Nike shoe"  # Too vague
prompt = "Amazing cool shoe flying through space..."  # Too fantasy
```

### Critical Elements

1. **Shot Type**: "Medium shot", "Close-up", "Wide angle"
2. **Camera**: "Static", "Slow pan left", "Orbit 180°"
3. **Lighting**: "Soft natural", "Studio lighting", "Golden hour"
4. **Duration**: Always mention "8-second duration"
5. **Product Details**: Colors, brand, key features

---

## 💰 COST BREAKDOWN

| Scenario | Videos | Total Cost |
|:---------|-------:|-----------:|
| 1 TikTok (3 scenes) | 3 | $0.30 |
| 10 TikToks/day | 30 | $3.00/day |
| 100 TikToks/day | 300 | $30/day |
| **Monthly (100/day)** | **9,000** | **$900/month** |

**Optimization**: Reuse clips → Save 30%

---

## ⚠️ COMMON ISSUES

### Issue 1: "Prompt too long"
```python
# ❌ BAD: 500+ characters
prompt = "..." # Very long

# ✅ GOOD: Keep under 300 chars
prompt = "Medium shot. White Nike shoe. Soft lighting. 8s."
```

### Issue 2: Timeout
```python
# Increase timeout for complex scenes
result = client.generate_video(
    prompt,
    timeout=300  # 5 minutes instead of 3
)
```

### Issue 3: Inconsistent results
```python
# Add product consistency keywords
prompt = f"""
{product_bible['consistency_prompts']['base_description']}
{scene_specific_action}
"""
```

---

## ✅ CHECKLIST

- [ ] `veo3_client.py` created
- [ ] FAL_KEY configured
- [ ] Video generation works
- [ ] Download works
- [ ] Cost estimation accurate
- [ ] Prompts optimized for Veo3

**Next**: MODULE_3_4_SubtitleGenerator
