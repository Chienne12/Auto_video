# MODULE 3.3: VIDEO ASSEMBLER

## 🎯 MỤC TIÊU

**Chức năng**: Ghép video clips + audio + subtitles thành TikTok video hoàn chỉnh

**Input**: Video clips, audio files, text
**Output**: Final MP4 (1080x1920, 30fps)

**Key Pattern từ AVG**: Auto-sync duration với audio

---

## 📝 IMPLEMENTATION

```python
# src/video_engine/video_assembler.py
"""VideoAssembler - Ghép video clips thành TikTok video"""

from typing import List, Tuple
from moviepy.editor import (
    VideoFileClip,
    AudioFileClip,
    ImageClip,
    concatenate_videoclips,
    CompositeVideoClip
)
import os


class VideoAssembler:
    """Assemble clips into final TikTok video"""
    
    def __init__(self, output_size: Tuple[int, int] = (1080, 1920)):
        """
        Args:
            output_size: Target resolution (width, height)
        """
        self.output_size = output_size
    
    def create_tiktok_video(
        self,
        video_clips: List[str],
        audio_files: List[str],
        output_path: str,
        add_subtitles: bool = False,
        subtitle_texts: List[str] = None
    ) -> str:
        """
        Main function - Create final video
        
        Args:
            video_clips: List of video file paths
            audio_files: List of audio file paths (same length as video_clips)
            output_path: Output video path
            add_subtitles: Add subtitles or not
            subtitle_texts: Subtitle texts (if add_subtitles=True)
            
        Returns:
            str: Path to final video
        """
        print(f"[VideoAssembler] Creating TikTok video with {len(video_clips)} clips")
        
        # Step 1: Sync each clip với audio
        synced_clips = []
        for i, (video_path, audio_path) in enumerate(zip(video_clips, audio_files)):
            print(f"  [{i+1}/{len(video_clips)}] Syncing clip {i+1}...")
            
            synced = self._sync_clip_with_audio(video_path, audio_path)
            synced_clips.append(synced)
        
        # Step 2: Validate clips
        print("[VideoAssembler] Validating clips...")
        validated_clips = []
        for i, clip in enumerate(synced_clips):
            is_valid, msg = self._validate_clip(clip)
            if is_valid:
                validated_clips.append(clip)
            else:
                print(f"  ⚠️ Clip {i+1} invalid: {msg}, skipping")
        
        # Step 3: Concatenate
        print("[VideoAssembler] Concatenating clips...")
        final_clip = concatenate_videoclips(validated_clips, method="compose")
        
        # Step 4: Resize to TikTok format
        print("[VideoAssembler] Resizing to TikTok format...")
        final_clip = self._resize_to_tiktok(final_clip)
        
        # Step 5: Add subtitles (optional)
        if add_subtitles and subtitle_texts:
            print("[VideoAssembler] Adding subtitles...")
            # TODO: Implement subtitle rendering
            pass
        
        # Step 6: Export
        print(f"[VideoAssembler] Exporting to {output_path}...")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        final_clip.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            fps=30,
            preset="medium",
            logger=None  # Suppress moviepy logs
        )
        
        # Cleanup
        for clip in validated_clips:
            clip.close()
        final_clip.close()
        
        print(f"✓ Video exported: {output_path}")
        return output_path
    
    def _sync_clip_with_audio(
        self,
        video_path: str,
        audio_path: str
    ) -> VideoFileClip:
        """
        Sync video duration với audio duration
        
        KEY PATTERN từ AVG:
        - Set video duration = audio duration
        - Nếu video ngắn hơn: loop/freeze last frame
        - Nếu video dài hơn: cut
        """
        video = VideoFileClip(video_path)
        audio = AudioFileClip(audio_path)
        
        audio_duration = audio.duration
        
        # If video shorter than audio: freeze last frame
        if video.duration < audio_duration:
            # Freeze last frame
            last_frame = video.get_frame(video.duration - 0.01)
            freeze_duration = audio_duration - video.duration
            
            freeze_clip = ImageClip(last_frame, duration=freeze_duration)
            video = concatenate_videoclips([video, freeze_clip])
        
        # Set duration exactly to audio
        video = video.set_duration(audio_duration)
        
        # Set audio
        video = video.set_audio(audio)
        
        return video
    
    def _validate_clip(self, clip: VideoFileClip) -> Tuple[bool, str]:
        """
        Validate clip (từ AVG)
        
        Returns:
            (is_valid, message)
        """
        try:
            # Check duration
            if clip.duration <= 0:
                return False, "Duration <= 0"
            
            # Check size
            if clip.w <= 0 or clip.h <= 0:
                return False, "Invalid dimensions"
            
            # Check FPS
            if clip.fps < 1:
                return False, "FPS < 1"
            
            # Check audio sync
            if clip.audio:
                diff = abs(clip.duration - clip.audio.duration)
                if diff > 0.1:  # Tolerance 100ms
                    return False, f"Audio desync: {diff:.2f}s"
            
            # Try render first frame
            clip.get_frame(0)
            
            return True, "OK"
            
        except Exception as e:
            return False, str(e)
    
    def _resize_to_tiktok(self, clip: VideoFileClip) -> VideoFileClip:
        """
        Resize clip to 9:16 (1080x1920)
        
        Logic:
        - If aspect ratio matches: resize
        - If too wide: crop width
        - If too tall: crop height
        """
        target_w, target_h = self.output_size
        target_aspect = target_w / target_h
        current_aspect = clip.w / clip.h
        
        if abs(current_aspect - target_aspect) < 0.01:
            # Already correct aspect ratio, just resize
            return clip.resize(self.output_size)
        
        elif current_aspect > target_aspect:
            # Too wide, crop width
            new_w = int(clip.h * target_aspect)
            clip = clip.crop(x_center=clip.w/2, width=new_w)
        
        else:
            # Too tall, crop height
            new_h = int(clip.w / target_aspect)
            clip = clip.crop(y_center=clip.h/2, height=new_h)
        
        # Resize to target
        return clip.resize(self.output_size)


# Example usage
if __name__ == "__main__":
    assembler = VideoAssembler()
    
    final_video = assembler.create_tiktok_video(
        video_clips=["scene1.mp4", "scene2.mp4", "scene3.mp4"],
        audio_files=["audio1.mp3", "audio2.mp3", "audio3.mp3"],
        output_path="output/final.mp4"
    )
    
    print(f"Done: {final_video}")
```

---

## 🎓 KEY PATTERNS

### Pattern 1: Auto-Sync với Audio (từ AVG)

```python
# ❌ BAD: Manual duration calculation
video.subclip(0, audio.duration)

# ✅ GOOD: Auto-sync
video.set_duration(audio.duration).set_audio(audio)
```

**Why**: Tự động, không cần tính toán

### Pattern 2: Validation Before Concat

```python
# ❌ BAD: Concat without checking
final = concatenate_videoclips(all_clips)  # Might crash!

# ✅ GOOD: Validate first
validated = [c for c in all_clips if validate(c)[0]]
final = concatenate_videoclips(validated)
```

**Why**: Một clip lỗi làm cả concat fail

---

## ✅ CHECKLIST

- [ ] `video_assembler.py` created
- [ ] Auto-sync works với nhiều clips
- [ ] Validation prevents crashes
- [ ] Output đúng 1080x1920
- [ ] Audio/video in sync

**Next**: MODULE 4.1 - Main Orchestrator
