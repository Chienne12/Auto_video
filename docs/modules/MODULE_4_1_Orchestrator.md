# MODULE 4.1: MAIN ORCHESTRATOR

## 🎯 MỤC TIÊU

**Chức năng**: Pipeline coordinator - Kết nối tất cả modules lại thành end-to-end workflow

**Input**: Product images + name + requirement
**Output**: Final TikTok video

---

## 📝 IMPLEMENTATION

```python
# src/pipeline/orchestrator.py
"""Main Orchestrator - End-to-end video generation pipeline"""

from typing import List, Dict
import asyncio
import os
from pathlib import Path

from src.image_prep.processor import ImageProcessor
from src.image_prep.product_bible import ProductBibleGenerator
from src.script_agent.gemini_client import GeminiClient
from src.script_agent.screenwriter import Screenwriter
from src.video_engine.tts_generator import TTSGenerator
from src.video_engine.video_assembler import VideoAssembler


class TikTokVideoOrchestrator:
    """
    Main orchestrator cho toàn bộ pipeline
    
    Flow:
    1. Process images (Part 1)
    2. Create Product Bible (Part 1)
    3. Generate script (Part 2)
    4. Generate TTS audio (Part 3)
    5. Generate video clips (Part 3)
    6. Assemble final video (Part 3)
    """
    
    def __init__(
        self,
        gemini_api_key: str,
        video_api_key: str = None,
        work_dir: str = "workspace"
    ):
        """
        Initialize orchestrator
        
        Args:
            gemini_api_key: Gemini API key
            video_api_key: Video API key (Runway/Luma/Veo3)
            work_dir: Working directory for temp files
        """
        self.work_dir = Path(work_dir)
        self.work_dir.mkdir(exist_ok=True)
        
        # Initialize modules
        print("[Orchestrator] Initializing modules...")
        
        # Part 1: Image Processing
        self.image_processor = ImageProcessor()
        self.bible_generator = ProductBibleGenerator(
            gemini_api_key=gemini_api_key,
            use_ai_analysis=True  # Use Gemini Vision
        )
        
        # Part 2: Script Generation
        self.gemini_client = GeminiClient(api_key=gemini_api_key)
        self.screenwriter = Screenwriter(self.gemini_client)
        
        # Part 3: Video Generation
        self.tts_generator = TTSGenerator()
        self.video_assembler = VideoAssembler()
        
        # TODO: Initialize video API client
        # self.video_api = Veo3Client(api_key=video_api_key)
        
        print("✓ All modules initialized")
    
    async def create_video(
        self,
        product_images: List[str],
        product_name: str,
        user_requirement: str = "Giới thiệu sản phẩm",
        output_path: str = "output/final_video.mp4"
    ) -> Dict:
        """
        Main function - Create video end-to-end
        
        Args:
            product_images: List of product image paths
            product_name: Product name
            user_requirement: User's requirement
            output_path: Output video path
            
        Returns:
            dict: Result with video path, duration, cost
        """
        print(f"\n{'='*60}")
        print(f"🎬 Creating TikTok Video for: {product_name}")
        print(f"{'='*60}\n")
        
        try:
            # ==== PART 1: Image Processing ====
            print("📸 PART 1: Image Processing")
            print("-" * 60)
            
            processed_images = []
            for i, img_path in enumerate(product_images):
                print(f"  Processing image {i+1}/{len(product_images)}...")
                
                output_img = self.work_dir / f"processed_{i}.png"
                self.image_processor.process_product_image(
                    str(img_path),
                    str(output_img)
                )
                processed_images.append(str(output_img))
            
            print(f"  ✓ Processed {len(processed_images)} images\n")
            
            # Create Product Bible
            print("  Creating Product Bible...")
            bible_path = self.work_dir / "product_bible.json"
            product_bible = self.bible_generator.create_product_bible(
                product_name=product_name,
                image_paths=processed_images,
                output_path=str(bible_path)
            )
            print(f"  ✓ Product Bible created\n")
            
            # ==== PART 2: Script Generation ====
            print("📝 PART 2: Script Generation")
            print("-" * 60)
            
            script = self.screenwriter.generate_script(
                product_name=product_name,
                product_info=product_bible,
                user_requirement=user_requirement
            )
            
            print(f"  ✓ Script generated:")
            print(f"    - Intent: {script.intent}")
            print(f"    - Scenes: {len(script.scenes)}")
            print(f"    - Duration: {script.total_duration}s\n")
            
            # ==== PART 3: Video Generation ====
            print("🎥 PART 3: Video Generation")
            print("-" * 60)
            
            # 3a. Generate TTS audio
            print("  [3.1] Generating audio...")
            audio_files = []
            for i, scene in enumerate(script.scenes):
                audio_path = self.work_dir / f"audio_{i}.mp3"
                
                await self.tts_generator.generate_audio(
                    text=scene.narration,
                    output_path=str(audio_path)
                )
                audio_files.append(str(audio_path))
            
            print(f"  ✓ Generated {len(audio_files)} audio files\n")
            
            # 3b. Generate video clips
            print("  [3.2] Generating video clips...")
            print("  ⚠️  WARNING: Video API not implemented yet!")
            print("  Using placeholder images instead...\n")
            
            # TODO: Implement video generation
            # For now, use processed images as placeholder
            video_clips = []
            for i, scene in enumerate(script.scenes):
                # Placeholder: Use processed image
                # In real implementation:
                # clip = await self.video_api.generate_video(
                #     prompt=scene.visual_prompt,
                #     duration=scene.duration
                # )
                print(f"    Clip {i+1}: Using image placeholder")
                video_clips.append(processed_images[0])  # Placeholder
            
            print(f"  ✓ Generated {len(video_clips)} clips (placeholder)\n")
            
            # 3c. Assemble final video
            print("  [3.3] Assembling final video...")
            final_video = self.video_assembler.create_tiktok_video(
                video_clips=video_clips,  # For now: images
                audio_files=audio_files,
                output_path=output_path
            )
            
            print(f"\n{'='*60}")
            print(f"✅ VIDEO CREATED SUCCESSFULLY!")
            print(f"{'='*60}")
            print(f"📁 Output: {final_video}")
            print(f"⏱️  Duration: {script.total_duration}s")
            print(f"💰 Cost: ${self._calculate_cost():.4f}")
            print(f"{'='*60}\n")
            
            return {
                "success": True,
                "video_path": final_video,
                "duration": script.total_duration,
                "scenes": len(script.scenes),
                "cost": self._calculate_cost()
            }
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            
            return {
                "success": False,
                "error": str(e)
            }
    
    def _calculate_cost(self) -> float:
        """Calculate total cost"""
        # Get Gemini usage
        stats = self.gemini_client.get_usage_stats()
        gemini_cost = stats['cost_total_usd']
        
        # TODO: Add video API cost
        video_cost = 0.30  # Placeholder: 3 clips × $0.10
        
        return gemini_cost + video_cost


# Main entry point
async def main():
    """Example usage"""
    
    # Setup
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        print("❌ GEMINI_API_KEY not found!")
        return
    
    orchestrator = TikTokVideoOrchestrator(
        gemini_api_key=gemini_key
    )
    
    # Create video
result = await orchestrator.create_video(
        product_images=["test_data/nike_shoe.jpg"],
        product_name="Nike Air Max 90",
        user_requirement="Giới thiệu giày thể thao năng động",
        output_path="output/nike_final.mp4"
    )
    
    if result['success']:
        print(f"\n🎉 Success! Video: {result['video_path']}")
    else:
        print(f"\n💥 Failed: {result['error']}")


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🎓 KEY CONCEPTS

### Concept 1: Error Handling

```python
# Wrap entire pipeline in try/except
# Return structured result dict
# Log errors for debugging
```

### Concept 2: Progress Reporting

```python
# Print clear progress indicators
# Use separators (====, ----)
# Show what's happening at each step
```

### Concept 3: Flexible Architecture

```python
# Each module is independent
# Can swap implementations
# Easy to add new features
```

---

## ✅ CHECKLIST

- [ ] `orchestrator.py` created
- [ ] All modules integrated
- [ ] Error handling works
- [ ] Progress reporting clear
- [ ] End-to-end test passes

**🎉 DONE! All 6 critical modules created!**
