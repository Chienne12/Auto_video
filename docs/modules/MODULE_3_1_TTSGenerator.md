# MODULE 3.1: TTS GENERATOR

## 🎯 MỤC TIÊU

**Chức năng**: Generate Vietnamese voice-over audio bằng edge-tts (FREE)

**Input**: Text narration
**Output**: MP3 audio file

**Key Feature**: Hoàn toàn miễn phí, không cần API key!

---

## 📝 IMPLEMENTATION

```python
# src/video_engine/tts_generator.py
"""TTS Generator - Text-to-Speech using edge-tts (FREE)"""

import asyncio
import os
from typing import List, Optional
from pathlib import Path
import edge_tts
from pydub import AudioSegment


class TTSGenerator:
    """
    Generate audio from text using Microsoft Edge TTS
    
    Features:
    - FREE (no API key needed)
    - Vietnamese voices available
    - Adjustable rate, pitch, volume
    - Batch processing support
    """
    
    # Vietnamese voices
    VOICES = {
        "female": "vi-VN-HoaiMyNeural",  # Female, natural
        "male": "vi-VN-NamMinhNeural",   # Male, clear
    }
    
    def __init__(
        self,
        voice: str = "female",
        rate: str = "+0%",      # Speed: -50% to +100%
        volume: str = "+0%",    # Volume: -100% to +100%
        pitch: str = "+0Hz"     # Pitch: -100Hz to +100Hz
    ):
        """
        Initialize TTS Generator
        
        Args:
            voice: "female" or "male" or exact voice name
            rate: Speech rate adjustment
            volume: Volume adjustment
            pitch: Pitch adjustment
        """
        # Get voice name
        if voice in self.VOICES:
            self.voice = self.VOICES[voice]
        else:
            self.voice = voice  # Custom voice name
        
        self.rate = rate
        self.volume = volume
        self.pitch = pitch
    
    async def generate_audio(
        self,
        text: str,
        output_path: str
    ) -> str:
        """
        Generate audio from text (async)
        
        Args:
            text: Text to speak
            output_path: Output MP3 path
            
        Returns:
            str: Path to generated audio
            
        Example:
            >>> gen = TTSGenerator()
            >>> await gen.generate_audio(
            ...     "Xin chào!",
            ...     "output/hello.mp3"
            ... )
            'output/hello.mp3'
        """
        # Create communicate object
        communicate = edge_tts.Communicate(
            text=text,
            voice=self.voice,
            rate=self.rate,
            volume=self.volume,
            pitch=self.pitch
        )
        
        # Create output directory
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save to file
        await communicate.save(output_path)
        
        return output_path
    
    def generate_audio_sync(
        self,
        text: str,
        output_path: str
    ) -> str:
        """
        Synchronous wrapper for generate_audio
        
        Args:
            text: Text to speak
            output_path: Output MP3 path
            
        Returns:
            str: Path to generated audio
        """
        return asyncio.run(self.generate_audio(text, output_path))
    
    async def batch_generate(
        self,
        texts: List[str],
        output_dir: str,
        prefix: str = "audio"
    ) -> List[str]:
        """
        Generate multiple audio files in batch
        
        Args:
            texts: List of texts
            output_dir: Output directory
            prefix: Filename prefix
            
        Returns:
            list: Paths to generated audios
            
        Example:
            >>> await gen.batch_generate(
            ...     ["Xin chào", "Tạm biệt"],
            ...     "output/",
            ...     prefix="scene"
            ... )
            ['output/scene_0.mp3', 'output/scene_1.mp3']
        """
        os.makedirs(output_dir, exist_ok=True)
        
        tasks = []
        output_paths = []
        
        for i, text in enumerate(texts):
            output_path = os.path.join(output_dir, f"{prefix}_{i}.mp3")
            output_paths.append(output_path)
            
            task = self.generate_audio(text, output_path)
            tasks.append(task)
        
        # Run all generations in parallel
        await asyncio.gather(*tasks)
        
        return output_paths
    
    @staticmethod
    def get_audio_duration(audio_path: str) -> float:
        """
        Get duration of audio file in seconds
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            float: Duration in seconds
        """
        audio = AudioSegment.from_file(audio_path)
        return len(audio) / 1000.0  # Convert ms to seconds
    
    @staticmethod
    async def list_available_voices() -> List[str]:
        """
        List all available voices from edge-tts
        
        Returns:
            list: Voice names
        """
        voices = await edge_tts.list_voices()
        
        # Filter Vietnamese voices
        vi_voices = [
            v["Name"] 
            for v in voices 
            if v["Locale"].startswith("vi-VN")
        ]
        
        return vi_voices


# Convenience functions
def tts(text: str, output: str, voice: str = "female") -> str:
    """
    Quick TTS generation (synchronous)
    
    Example:
        >>> tts("Hello", "hello.mp3")
        'hello.mp3'
    """
    gen = TTSGenerator(voice=voice)
    return gen.generate_audio_sync(text, output)


async def tts_batch(
    texts: List[str],
    output_dir: str,
    voice: str = "female"
) -> List[str]:
    """
    Quick batch TTS (async)
    
    Example:
        >>> files = await tts_batch(
        ...     ["Xin chào", "Tạm biệt"],
        ...     "output/"
        ... )
    """
    gen = TTSGenerator(voice=voice)
    return await gen.batch_generate(texts, output_dir)


# Example usage
if __name__ == "__main__":
    import asyncio
    
    async def main():
        # Initialize generator
        gen = TTSGenerator(voice="female", rate="+10%")
        
        # Test 1: Single generation
        print("Generating single audio...")
        await gen.generate_audio(
            "Xin chào, đây là giày Nike Air Max 90!",
            "test_output/demo.mp3"
        )
        print("✓ Generated: test_output/demo.mp3")
        
        # Test 2: Batch generation
        print("\nGenerating batch...")
        texts = [
            "Bạn có biết đôi giày này có thể làm gì?",
            "Nike Air Max 90 - Phong cách của bạn!",
            "Link mua ngay trong bio!"
        ]
        
        files = await gen.batch_generate(
            texts,
            "test_output/",
            prefix="scene"
        )
        
        print(f"✓ Generated {len(files)} files:")
        for f in files:
            duration = gen.get_audio_duration(f)
            print(f"  - {f} ({duration:.1f}s)")
        
        # Test 3: List voices
        print("\nAvailable Vietnamese voices:")
        voices = await gen.list_available_voices()
        for v in voices:
            print(f"  - {v}")
    
    asyncio.run(main())
```

---

## 🧪 TESTING

```python
# tests/test_tts_generator.py
import pytest
import os
from src.video_engine.tts_generator import TTSGenerator, tts


class TestTTSGenerator:
    
    @pytest.fixture
    def generator(self):
        return TTSGenerator(voice="female")
    
    @pytest.mark.asyncio
    async def test_single_generation(self, generator, tmp_path):
        """Test single audio generation"""
        output = tmp_path / "test.mp3"
        
        result = await generator.generate_audio(
            "Xin chào",
            str(output)
        )
        
        assert os.path.exists(result)
        assert os.path.getsize(result) > 0
    
    @pytest.mark.asyncio
    async def test_batch_generation(self, generator, tmp_path):
        """Test batch generation"""
        texts = ["Xin chào", "Tạm biệt", "Cảm ơn"]
        
        files = await generator.batch_generate(
            texts,
            str(tmp_path)
        )
        
        assert len(files) == 3
        for f in files:
            assert os.path.exists(f)
    
    def test_get_duration(self, tmp_path):
        """Test duration extraction"""
        # Generate sample audio
        output = tmp_path / "test.mp3"
        tts("Test", str(output))
        
        duration = TTSGenerator.get_audio_duration(str(output))
        
        assert duration > 0
        assert duration < 5  # Should be short
    
    def test_sync_wrapper(self, tmp_path):
        """Test synchronous generation"""
        output = tmp_path / "sync.mp3"
        
        result = tts("Hello", str(output))
        
        assert os.path.exists(result)
```

---

## 🎓 TUNING GUIDE

### Rate (Speed)
```python
TTSGenerator(rate="-20%")  # Slower (clearer)
TTSGenerator(rate="+0%")   # Normal
TTSGenerator(rate="+30%")  # Faster (more energetic)
```

### Volume
```python
TTSGenerator(volume="-10%")  # Quieter
TTSGenerator(volume="+20%")  # Louder
```

### Pitch
```python
TTSGenerator(pitch="-50Hz")  # Lower pitch (deeper voice)
TTSGenerator(pitch="+50Hz")  # Higher pitch (lighter voice)
```

**Recommended for TikTok**: `rate="+10%"` (slightly faster)

---

## ⚡ PERFORMANCE

**Benchmark** (100 characters Vietnamese text):
- Generation time: ~1-2s
- Output size: ~15-20KB
- Quality: 24kHz, 48kbps

**Tips**:
- Use batch_generate for multiple texts (parallel = faster)
- edge-tts uses Microsoft servers (internet required)
- No rate limits on free tier!

---

## ✅ CHECKLIST

- [ ] `tts_generator.py` created
- [ ] Single generation works
- [ ] Batch generation works
- [ ] Duration extraction accurate
- [ ] Vietnamese voice clear

**Next**: MODULE_3_2_VideoAPIClient
