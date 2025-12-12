# MODULE 3.4: SUBTITLE GENERATOR

## 🎯 MỤC TIÊU

**Chức năng**: Generate SRT subtitle file từ audio + text, rồi render lên video

**Input**: Audio files + texts
**Output**: SRT file + Video with burned-in subtitles

**Pattern từ AVG**: Dynamic font sizing + auto-sync với audio

---

## 📝 IMPLEMENTATION

```python
# src/video_engine/subtitle_generator.py
"""Subtitle Generator - Create and render SRT subtitles"""

import os
import re
from typing import List, Tuple
from datetime import timedelta
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from pydub import AudioSegment
from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip


class SubtitleGenerator:
    """
    Generate and render subtitles
    
    Features:
    - Auto-generate SRT from audio durations
    - Dynamic font sizing based on text length
    - Burn subtitles into video
    """
    
    def __init__(
        self,
        font_path: str = "C:/Windows/Fonts/arial.ttf",
        font_color: Tuple[int, int, int] = (0, 0, 0),  # Black
        outline_color: Tuple[int, int, int] = (255, 255, 255),  # White
        position: Tuple[float, float] = (0.5, 0.85)  # Centered, near bottom
    ):
        """
        Initialize Subtitle Generator
        
        Args:
            font_path: Path to TTF font file
            font_color: RGB color for text
            outline_color: RGB color for outline
            position: (x, y) position as fraction of screen (0.0-1.0)
        """
        self.font_path = font_path
        self.font_color = font_color
        self.outline_color = outline_color
        self.position = position
    
    def generate_srt(
        self,
        audio_files: List[str],
        texts: List[str],
        output_path: str
    ) -> str:
        """
        Generate SRT file from audio durations + texts
        
        Logic (from AVG):
        1. Load each audio to get duration
        2. Calculate start/end times cumulatively
        3. Format as SRT
        
        Args:
            audio_files: List of audio file paths
            texts: Corresponding subtitle texts
            output_path: Output SRT file path
            
        Returns:
            str: Path to SRT file
            
        Example:
            >>> gen = SubtitleGenerator()
            >>> gen.generate_srt(
            ...     ["scene1.mp3", "scene2.mp3"],
            ...     ["Hello", "Goodbye"],
            ...     "output.srt"
            ... )
            'output.srt'
        """
        if len(audio_files) != len(texts):
            raise ValueError("audio_files and texts must have same length")
        
        total_duration = 0  # milliseconds
        srt_entries = []
        
        for i, (audio_path, text) in enumerate(zip(audio_files, texts)):
            # Load audio to get duration
            audio = AudioSegment.from_file(audio_path)
            duration_ms = len(audio)
            
            # Calculate times
            start_ms = total_duration
            end_ms = total_duration + duration_ms
            
            # Create SRT entry
            entry = self._format_srt_entry(
                index=i + 1,
                start_ms=start_ms,
                end_ms=end_ms,
                text=text
            )
            srt_entries.append(entry)
            
            # Update cumulative duration
            total_duration = end_ms
        
        # Write SRT file
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(srt_entries))
        
        return output_path
    
    def _format_srt_entry(
        self,
        index: int,
        start_ms: int,
        end_ms: int,
        text: str
    ) -> str:
        """
        Format single SRT entry
        
        SRT Format:
        1
        00:00:00,000 --> 00:00:05,000
        Subtitle text here
        
        Args:
            index: Subtitle number (1-indexed)
            start_ms: Start time in milliseconds
            end_ms: End time in milliseconds
            text: Subtitle text
            
        Returns:
            str: Formatted SRT entry
        """
        start_str = self._ms_to_srt_time(start_ms)
        end_str = self._ms_to_srt_time(end_ms)
        
        return f"{index}\n{start_str} --> {end_str}\n{text}\n"
    
    @staticmethod
    def _ms_to_srt_time(ms: int) -> str:
        """
        Convert milliseconds to SRT time format
        
        Format: HH:MM:SS,mmm
        
        Args:
            ms: Milliseconds
            
        Returns:
            str: SRT time string
        """
        hours = ms // 3600000
        ms %= 3600000
        minutes = ms // 60000
        ms %= 60000
        seconds = ms // 1000
        ms %= 1000
        
        return f"{hours:02d}:{minutes:02d}:{seconds:02d},{ms:03d}"
    
    def render_subtitles(
        self,
        video_path: str,
        srt_path: str,
        output_path: str
    ) -> str:
        """
        Burn subtitles into video
        
        Args:
            video_path: Input video path
            srt_path: SRT subtitle file
            output_path: Output video path
            
        Returns:
            str: Path to output video
        """
        # Load video
        video = VideoFileClip(video_path)
        video_size = video.size
        
        # Parse SRT
        subtitles = self._parse_srt(srt_path)
        
        # Create subtitle clips
        subtitle_clips = []
        
        for start_sec, end_sec, text in subtitles:
            # Calculate font size (dynamic from AVG)
            font_size = self._calculate_font_size(text, video_size[0])
            
            # Create subtitle image
            subtitle_img = self._create_subtitle_image(
                text=text,
                video_size=video_size,
                font_size=font_size
            )
            
            # Create clip
            duration = end_sec - start_sec
            clip = ImageClip(subtitle_img, duration=duration)
            
            # Position
            x_pos = 'center'
            y_pos = int(video_size[1] * self.position[1])
            
            clip = clip.set_position((x_pos, y_pos)).set_start(start_sec)
            
            subtitle_clips.append(clip)
        
        # Composite
        final_video = CompositeVideoClip([video] + subtitle_clips)
        
        # Write
        final_video.write_videofile(
            output_path,
            codec='libx264',
            audio_codec='aac',
            logger=None
        )
        
        # Cleanup
        video.close()
        final_video.close()
        
        return output_path
    
    def _parse_srt(self, srt_path: str) -> List[Tuple[float, float, str]]:
        """
        Parse SRT file
        
        Returns:
            list: [(start_seconds, end_seconds, text), ...]
        """
        with open(srt_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex pattern
        pattern = r'(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n(.*?)(?=\n\d+\n|\n*$)'
        matches = re.findall(pattern, content, re.DOTALL)
        
        subtitles = []
        for match in matches:
            index, start, end, text = match
            text = re.sub(r'\s+', ' ', text.strip())
            
            start_sec = self._srt_time_to_seconds(start)
            end_sec = self._srt_time_to_seconds(end)
            
            subtitles.append((start_sec, end_sec, text))
        
        return subtitles
    
    @staticmethod
    def _srt_time_to_seconds(time_str: str) -> float:
        """
        Convert SRT time to seconds
        
        Args:
            time_str: "HH:MM:SS,mmm"
            
        Returns:
            float: Seconds
        """
        h, m, s = time_str.split(':')
        s, ms = s.split(',')
        
        total_seconds = (
            int(h) * 3600 +
            int(m) * 60 +
            int(s) +
            int(ms) / 1000
        )
        
        return total_seconds
    
    def _calculate_font_size(self, text: str, video_width: int) -> int:
        """
        Calculate dynamic font size based on text length
        
        Logic from AVG: Longer text → smaller font
        
        Args:
            text: Subtitle text
            video_width: Video width in pixels
            
        Returns:
            int: Font size in pixels
        """
        text_len = len(text)
        
        if text_len < 32:
            return video_width // 32
        elif 32 <= text_len < 40:
            return video_width // 40
        elif 40 <= text_len < 48:
            return video_width // 48
        else:
            return video_width // 64
    
    def _create_subtitle_image(
        self,
        text: str,
        video_size: Tuple[int, int],
        font_size: int
    ) -> np.ndarray:
        """
        Create subtitle image with outline
        
        Args:
            text: Subtitle text
            video_size: (width, height)
            font_size: Font size in pixels
            
        Returns:
            np.ndarray: Image as numpy array
        """
        width, height = video_size
        
        # Create transparent image
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Load font
        try:
            font = ImageFont.truetype(self.font_path, font_size)
        except:
            font = ImageFont.load_default()
        
        # Get text bbox
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        # Calculate position (centered)
        x = (width - text_w) // 2
        y = height - text_h - 50  # 50px from bottom
        
        # Draw white outline (2px)
        outline_width = 2
        for dx in range(-outline_width, outline_width + 1):
            for dy in range(-outline_width, outline_width + 1):
                if dx == 0 and dy == 0:
                    continue
                draw.text(
                    (x + dx, y + dy),
                    text,
                    font=font,
                    fill=self.outline_color
                )
        
        # Draw black text
        draw.text((x, y), text, font=font, fill=self.font_color)
        
        return np.array(img)


# Example usage
if __name__ == "__main__":
    gen = SubtitleGenerator()
    
    # Generate SRT
    srt_file = gen.generate_srt(
        audio_files=["scene1.mp3", "scene2.mp3", "scene3.mp3"],
        texts=[
            "Bạn có biết đôi giày này có thể làm gì?",
            "Nike Air Max 90 - Phong cách của bạn!",
            "Link mua ngay trong bio!"
        ],
        output_path="output/subtitles.srt"
    )
    
    print(f"✓ SRT created: {srt_file}")
    
    # Render onto video
    final = gen.render_subtitles(
        video_path="output/video_no_subs.mp4",
        srt_path=srt_file,
        output_path="output/video_with_subs.mp4"
    )
    
    print(f"✓ Final video: {final}")
```

---

## ✅ CHECKLIST

- [ ] `subtitle_generator.py` created
- [ ] SRT generation from audio durations works
- [ ] Dynamic font sizing works
- [ ] Subtitle rendering works
- [ ] Outline visible

🎉 **ALL 10 MODULES COMPLETE!**
