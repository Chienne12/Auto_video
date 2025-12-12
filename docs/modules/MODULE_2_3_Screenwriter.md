# MODULE 2.3: SCREENWRITER

## 🎯 MỤC TIÊU

**Chức năng**: Generate script cho TikTok video theo intent (narrative/motion/montage)

**Input**: Product info + user requirement
**Output**: Structured VideoScript với scenes

---

##📝 IMPLEMENTATION

```python
# src/script_agent/screenwriter.py
"""Screenwriter - Generate TikTok scripts using Gemini"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from src.script_agent.gemini_client import GeminiClient


# Pydantic Models
class SceneScript(BaseModel):
    """Single scene trong video"""
    scene_id: int = Field(description="Scene number (1-indexed)")
    duration: int = Field(description="Duration in seconds (max 8)")
    visual_prompt: str = Field(description="Prompt for video AI")
    narration: str = Field(description="Voice-over text")
    product_features_shown: List[str] = Field(description="Features to highlight")


class VideoScript(BaseModel):
    """Complete video script"""
    intent: str = Field(description="narrative/motion/montage")
    hook: str = Field(description="Opening hook (3s)")
    body: str = Field(description="Main content (15s)")
    cta: str = Field(description="Call to action (3s)")
    total_duration: int = Field(description="Total seconds")
    scenes: List[SceneScript] = Field(description="Scene breakdown")


class Screenwriter:
    """Generate TikTok scripts"""
    
    NARRATIVE_TEMPLATE = """
You are a TikTok marketing expert.

Create a 21-second script for {product_name}.

Structure:
- HOOK (3s): Attention-grabbing question or statement
- BODY (15s): Product introduction with key features
- CTA (3s): Call to action

Tone: Casual, energetic, Vietnamese Gen-Z style

Product Info:
{product_info}

User Requirement: {user_requirement}

Break into 3 scenes (7s each), each with visual prompt for AI video generation.
"""
    
    def __init__(self, gemini_client: GeminiClient):
        self.client = gemini_client
    
    def generate_script(
        self,
        product_name: str,
        product_info: Dict,
        user_requirement: str = "Giới thiệu sản phẩm",
        intent: str = "narrative"
    ) -> VideoScript:
        """
        Generate complete script
        
        Args:
            product_name: Tên sản phẩm
            product_info: Product Bible data
            user_requirement: Yêu cầu của user
            intent: Script type
            
        Returns:
            VideoScript
        """
        # Format product info
        product_desc = self._format_product_info(product_info)
        
        # Build prompt
        prompt = self.NARRATIVE_TEMPLATE.format(
            product_name=product_name,
            product_info=product_desc,
            user_requirement=user_requirement
        )
        
        # Generate structured output
        script = self.client.generate_structured(
            prompt=prompt,
            schema=VideoScript,
            temperature=0.8
        )
        
        return script
    
    def _format_product_info(self, product_info: Dict) -> str:
        """Format Product Bible cho prompt"""
        features = product_info.get('features', {})
        
        desc = f"- Brand: {features.get('brand', 'Unknown')}\n"
        desc += f"- Color: {features.get('primary_color', 'N/A')}\n"
        desc += f"- Key Elements: {', '.join(features.get('key_elements', []))}\n"
        
        return desc


# Example usage
if __name__ == "__main__":
    client = GeminiClient()
    writer = Screenwriter(client)
    
    product_bible = {
        "features": {
            "brand": "Nike",
            "primary_color": "white",
            "key_elements": ["swoosh logo", "air cushion"]
        }
    }
    
    script = writer.generate_script(
        "Nike Air Max 90",
        product_bible,
        "Giới thiệu giày thể thao"
    )
    
    print(f"Hook: {script.hook}")
    print(f"Scenes: {len(script.scenes)}")
```

**Next**: MODULE 3.3 - Video Assembler
