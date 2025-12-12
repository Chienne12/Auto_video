# MODULE 1.2: PRODUCT BIBLE GENERATOR

## 🎯 MỤC TIÊU MODULE

**Chức năng chính**: Tạo "Product Bible" - một profile JSON chứa thông tin về sản phẩm để đảm bảo consistency xuyên suốt video.

**Input**: Danh sách ảnh đã xử lý + tên sản phẩm
**Output**: File JSON chứa: features, colors, angles, descriptions

**Inspiration**: Character Consistency Pipeline từ ViMax

---

## 📊 PRODUCT BIBLE STRUCTURE

```json
{
  "product_id": "nike_air_max_90_white",
  "product_name": "Nike Air Max 90",
  "created_at": "2024-01-15T10:30:00Z",
  
  "angles": {
    "front": {
      "path": "processed/nike_front.png",
      "description": "White Nike Air Max 90, front view, red swoosh visible"
    },
    "side": {
      "path": "processed/nike_side.png",
      "description": "Side profile, air cushion visible in heel"
    },
    "detail": {
      "path": "processed/nike_detail.png",
      "description": "Close-up của swoosh logo và air cushion"
    }
  },
  
  "features": {
    "primary_color": "white",
    "secondary_colors": ["red", "black"],
    "brand": "Nike",
    "category": "Footwear",
    "key_elements": [
      "swoosh logo",
      "air cushion in heel",
      "white leather upper",
      "red accents"
    ],
    "visual_characteristics": "Clean, sporty design with visible air technology"
  },
  
  "consistency_prompts": {
    "base_description": "White Nike Air Max 90 sneaker with red swoosh logo and visible air cushion in heel",
    "must_include": ["white color", "swoosh logo", "air cushion"],
    "style_guide": "Modern, clean product photography style"
  }
}
```

---

## 📝 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Tạo file `src/image_prep/product_bible.py`

```python
"""
Product Bible Generator
Tạo profile JSON cho sản phẩm để đảm bảo consistency
"""

import json
import os
from typing import List, Dict, Optional
from datetime import datetime
from pathlib import Path
from PIL import Image
import google.generativeai as genai


class ProductBibleGenerator:
    """
    Generator để tạo Product Bible từ ảnh sản phẩm
    
    Attributes:
        use_ai_analysis (bool): Có dùng Gemini Vision không
        gemini_client: Gemini API client (nếu enabled)
    """
    
    def __init__(
        self,
        gemini_api_key: Optional[str] = None,
        use_ai_analysis: bool = False
    ):
        """
        Khởi tạo ProductBibleGenerator
        
        Args:
            gemini_api_key: API key cho Gemini (optional)
            use_ai_analysis: Dùng AI để phân tích ảnh (nếu có key)
        """
        self.use_ai_analysis = use_ai_analysis and gemini_api_key
        
        if self.use_ai_analysis:
            genai.configure(api_key=gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    def create_product_bible(
        self,
        product_name: str,
        image_paths: List[str],
        output_path: str,
        category: Optional[str] = None
    ) -> Dict:
        """
        Hàm CHÍNH - Tạo Product Bible
        
        Args:
            product_name: Tên sản phẩm
            image_paths: List đường dẫn các ảnh (front, side, detail...)
            output_path: Đường dẫn lưu JSON
            category: Loại sản phẩm (optional)
            
        Returns:
            dict: Product Bible data
        """
        print(f"Creating Product Bible for: {product_name}")
        
        # Bước 1: Phân loại ảnh theo angle
        print("[1/4] Classifying image angles...")
        angles_data = self._classify_angles(image_paths)
        
        # Bước 2: Extract features
        print("[2/4] Extracting product features...")
        if self.use_ai_analysis:
            features = self._extract_features_ai(image_paths[0], product_name)
        else:
            features = self._extract_features_basic(image_paths, product_name, category)
        
        # Bước 3: Generate consistency prompts
        print("[3/4] Generating consistency prompts...")
        consistency = self._generate_consistency_prompts(
            product_name,
            features,
            angles_data
        )
        
        # Bước 4: Assemble Bible
        print("[4/4] Assembling Product Bible...")
        bible = {
            "product_id": self._create_product_id(product_name),
            "product_name": product_name,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "angles": angles_data,
            "features": features,
            "consistency_prompts": consistency
        }
        
        # Save to JSON
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(bible, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Product Bible saved to: {output_path}")
        return bible
    
    def _create_product_id(self, product_name: str) -> str:
        """
        Tạo product ID từ tên
        
        Example: "Nike Air Max 90" -> "nike_air_max_90"
        """
        return product_name.lower().replace(' ', '_').replace('-', '_')
    
    def _classify_angles(self, image_paths: List[str]) -> Dict:
        """
        Phân loại ảnh theo angle (front, side, detail, etc.)
        
        Logic đơn giản: Gán theo thứ tự
        - Ảnh 1: front
        - Ảnh 2: side (nếu có)
        - Ảnh 3+: detail (nếu có)
        
        Args:
            image_paths: List đường dẫn ảnh
            
        Returns:
            dict: Mapping angle -> data
        """
        angle_names = ['front', 'side', 'detail', 'back', 'top']
        angles = {}
        
        for i, img_path in enumerate(image_paths):
            angle_name = angle_names[i] if i < len(angle_names) else f'extra_{i-len(angle_names)+1}'
            
            # Generate description (basic)
            desc = self._generate_angle_description(img_path, angle_name)
            
            angles[angle_name] = {
                "path": img_path,
                "description": desc
            }
        
        return angles
    
    def _generate_angle_description(self, img_path: str, angle: str) -> str:
        """
        Generate description cho 1 angle
        
        Nếu có AI: Dùng Gemini Vision
        Nếu không: Template cơ bản
        """
        if self.use_ai_analysis:
            return self._describe_image_ai(img_path, f"{angle} view")
        else:
            # Basic template
            filename = Path(img_path).stem
            return f"Product {angle} view from {filename}"
    
    def _extract_features_basic(
        self,
        image_paths: List[str],
        product_name: str,
        category: Optional[str]
    ) -> Dict:
        """
        Extract features cơ bản KHÔNG dùng AI
        
        Method: Phân tích màu sắc từ ảnh + info từ product name
        """
        # Analyze dominant colors từ ảnh đầu tiên
        colors = self._extract_colors(image_paths[0])
        
        # Parse info từ product name
        name_lower = product_name.lower()
        
        # Detect brand (simple heuristic)
        brands = ['nike', 'adidas', 'samsung', 'apple', 'sony']
        brand = next((b for b in brands if b in name_lower), "Unknown")
        
        features = {
            "primary_color": colors[0] if colors else "unknown",
            "secondary_colors": colors[1:3] if len(colors) > 1 else [],
            "brand": brand.capitalize(),
            "category": category or "Product",
            "key_elements": [
                f"{colors[0]} color scheme" if colors else "color",
                "product branding",
                "distinctive design elements"
            ],
            "visual_characteristics": f"{product_name} with {colors[0] if colors else 'distinctive'} styling"
        }
        
        return features
    
    def _extract_colors(self, img_path: str, n_colors: int = 3) -> List[str]:
        """
        Extract dominant colors từ ảnh bằng k-means clustering
        
        Args:
            img_path: Đường dẫn ảnh
            n_colors: Số màu cần extract
            
        Returns:
            list: Tên màu (e.g., ['white', 'red', 'black'])
        """
        import numpy as np
        from sklearn.cluster import KMeans
        
        # Load image
        img = Image.open(img_path).convert('RGB')
        img = img.resize((100, 100))  # Resize nhỏ để nhanh
        
        # Convert to array
        pixels = np.array(img).reshape(-1, 3)
        
        # K-means clustering
        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        kmeans.fit(pixels)
        
        # Get dominant colors (RGB)
        colors_rgb = kmeans.cluster_centers_.astype(int)
        
        # Convert RGB to color names
        color_names = [self._rgb_to_name(rgb) for rgb in colors_rgb]
        
        return color_names
    
    def _rgb_to_name(self, rgb: np.ndarray) -> str:
        """
        Convert RGB sang tên màu gần nhất
        
        Simple mapping cho common colors
        """
        r, g, b = rgb
        
        # Grayscale check
        if abs(r - g) < 30 and abs(g - b) < 30:
            if r < 50:
                return "black"
            elif r > 200:
                return "white"
            else:
                return "gray"
        
        # Color mapping (simplified)
        if r > g and r > b:
            return "red" if r > 150 else "brown"
        elif g > r and g > b:
            return "green"
        elif b > r and b > g:
            return "blue"
        elif r > 150 and g > 150:
            return "yellow"
        else:
            return "multicolor"
    
    def _extract_features_ai(self, img_path: str, product_name: str) -> Dict:
        """
        Extract features bằng Gemini Vision API
        
        Args:
            img_path: Đường dẫn ảnh
            product_name: Tên sản phẩm
            
        Returns:
            dict: Extracted features
        """
        # Upload image to Gemini
        img_file = genai.upload_file(img_path)
        
        # Prompt for feature extraction
        prompt = f"""
Analyze this product image for "{product_name}".

Extract the following information in JSON format:
{{
  "primary_color": "main color",
  "secondary_colors": ["color1", "color2"],
  "brand": "brand name if visible",
  "category": "product category",
  "key_elements": ["element1", "element2", "element3"],
  "visual_characteristics": "brief description"
}}

Focus on visual details that should remain consistent across different video scenes.
        """
        
        response = self.model.generate_content([img_file, prompt])
        
        # Parse JSON response
        import re
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            features = json.loads(json_match.group())
        else:
            # Fallback to basic extraction
            features = self._extract_features_basic([img_path], product_name, None)
        
        return features
    
    def _describe_image_ai(self, img_path: str, context: str) -> str:
        """
        Generate description cho ảnh bằng Gemini Vision
        """
        img_file = genai.upload_file(img_path)
        
        prompt = f"Describe this product image ({context}) in one detailed sentence. Focus on visual details."
        
        response = self.model.generate_content([img_file, prompt])
        return response.text.strip()
    
    def _generate_consistency_prompts(
        self,
        product_name: str,
        features: Dict,
        angles: Dict
    ) -> Dict:
        """
        Generate prompts để maintain consistency
        
        Returns:
            dict: Consistency prompts for video generation
        """
        # Base description
        base_desc = f"{features['primary_color']} {product_name}"
        if features.get('brand') != 'Unknown':
            base_desc = f"{features['brand']} " + base_desc
        
        # Add key elements
        if features['key_elements']:
            base_desc += f" with {', '.join(features['key_elements'][:2])}"
        
        # Must-include elements
        must_include = [
            features['primary_color'] + " color",
            features['brand'] + " brand" if features.get('brand') != 'Unknown' else None,
        ]
        must_include = [x for x in must_include if x]
        must_include.extend(features['key_elements'][:2])
        
        return {
            "base_description": base_desc,
            "must_include": must_include,
            "style_guide": "Clean product photography, professional lighting",
            "angle_reference": angles.get('front', {}).get('description', '')
        }


# Convenience function
def create_bible(
    product_name: str,
    images: List[str],
    output_path: str,
    gemini_key: Optional[str] = None
) -> Dict:
    """
    Shortcut function tạo Product Bible
    
    Example:
        >>> create_bible(
        ...     "Nike Air Max 90",
        ...     ["front.png", "side.png"],
        ...     "output/bible.json"
        ... )
    """
    generator = ProductBibleGenerator(
        gemini_api_key=gemini_key,
        use_ai_analysis=gemini_key is not None
    )
    return generator.create_product_bible(product_name, images, output_path)
```

---

## 🧪 TESTING

```python
# tests/test_product_bible.py
import pytest
import json
from src.image_prep.product_bible import ProductBibleGenerator, create_bible


class TestProductBible:
    
    @pytest.fixture
    def sample_images(self, tmp_path):
        """Tạo sample images"""
        from PIL import Image
        
        images = []
        for i, color in enumerate(['red', 'blue', 'green']):
            img = Image.new('RGB', (200, 200), color)
            path = tmp_path / f"img_{i}.png"
            img.save(path)
            images.append(str(path))
        
        return images
    
    def test_create_bible_basic(self, sample_images, tmp_path):
        """Test tạo Bible không dùng AI"""
        generator = ProductBibleGenerator(use_ai_analysis=False)
        
        output = tmp_path / "bible.json"
        bible = generator.create_product_bible(
            product_name="Test Nike Shoe",
            image_paths=sample_images,
            output_path=str(output)
        )
        
        # Check structure
        assert "product_id" in bible
        assert "product_name" in bible
        assert "angles" in bible
        assert "features" in bible
        assert "consistency_prompts" in bible
        
        # Check angles
        assert "front" in bible["angles"]
        assert "side" in bible["angles"]
        
        # Check features
        assert "primary_color" in bible["features"]
        assert "brand" in bible["features"]
    
    def test_color_extraction(self, tmp_path):
        """Test color extraction"""
        generator = ProductBibleGenerator()
        
        # Create red image
        from PIL import Image
        img = Image.new('RGB', (100, 100), 'red')
        img_path = tmp_path / "red.png"
        img.save(img_path)
        
        colors = generator._extract_colors(str(img_path), n_colors=1)
        
        assert len(colors) > 0
        assert colors[0] == "red"
    
    def test_product_id_generation(self):
        """Test product ID generation"""
        generator = ProductBibleGenerator()
        
        assert generator._create_product_id("Nike Air Max 90") == "nike_air_max_90"
        assert generator._create_product_id("iPhone 15 Pro") == "iphone_15_pro"


# Manual test
if __name__ == "__main__":
    create_bible(
        "Nike Air Max 90",
        ["test_data/nike_front.png", "test_data/nike_side.png"],
        "output/nike_bible.json",
        gemini_key=None  # None = không dùng AI
    )
```

---

## 🎓 DESIGN DECISIONS

### Decision 1: Tại sao cần Product Bible?

**Problem**: Video AI models không consistency giữa các scenes
**Solution**: Product Bible cung cấp "ground truth" cho tất cả prompts

**Example**:
```
Scene 1 prompt: "White Nike Air Max 90 with red swoosh..."
Scene 2 prompt: "White Nike Air Max 90 with red swoosh..." ← Same!
Scene 3 prompt: "White Nike Air Max 90 with red swoosh..."
```

### Decision 2: AI Analysis vs Basic?

| Feature | Basic (FREE) | AI-Powered ($) |
|:--------|:-------------|:---------------|
| Color extraction | ✅ K-means | ✅ Gemini Vision |
| Object detection | ❌ | ✅ (logo, text...) |
| Description quality | 6/10 | 9/10 |
| Cost | $0 | ~$0.0025/image |
| Speed | Fast (~1s) | Slower (~3s) |

**Recommendation**: Bắt đầu với Basic, upgrade lên AI sau

---

## ✅ CHECKLIST

- [ ] File `product_bible.py` đã tạo
- [ ] Test color extraction chính xác
- [ ] Output JSON đúng structure
- [ ] Gemini integration works (nếu có key)
- [ ] Fallback to basic nếu AI fail

**Next**: MODULE 2.1 - Gemini Client
