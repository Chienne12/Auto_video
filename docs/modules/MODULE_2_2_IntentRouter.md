# MODULE 2.2: INTENT ROUTER

## 🎯 MỤC TIÊU

**Chức năng**: Phân loại yêu cầu của user thành 3 loại script: narrative, motion, hoặc montage

**Input**: User requirement text
**Output**: Intent classification với confidence score

**Pattern từ ViMax**: Intent-based routing để chọn đúng template

---

## 📊 INTENT TYPES

| Intent | Description | Example | Template Focus |
|:-------|:------------|:--------|:---------------|
| **narrative** | Giới thiệu có câu chuyện | "Giới thiệu giày Nike" | Hook → Features → CTA |
| **motion** | Action-driven, dynamic | "Unboxing nhanh iPhone" | Fast cuts, camera moves |
| **montage** | Emotional journey | "Ngày của coffee lover" | 5-7 short clips, music-driven |

---

## 📝 IMPLEMENTATION

```python
# src/script_agent/intent_router.py
"""Intent Router - Classify user requirements into script types"""

from typing import Tuple, Literal
from pydantic import BaseModel, Field
from src.script_agent.gemini_client import GeminiClient


IntentType = Literal["narrative", "motion", "montage"]


class IntentClassification(BaseModel):
    """Result of intent classification"""
    intent: IntentType = Field(description="Classified intent")
    confidence: float = Field(description="Confidence score 0.0-1.0")
    rationale: str = Field(description="Why this intent was chosen")


class IntentRouter:
    """
    Route user requirements to appropriate script template
    
    Uses Gemini to classify intent with context
    """
    
    CLASSIFICATION_PROMPT = """
You are an expert at understanding TikTok video requirements.

Classify this requirement into ONE of three intents:

1. **NARRATIVE**: Storytelling approach
   - Keywords: giới thiệu, story, journey, experience
   - Structure: Hook → Body (features) → CTA
   - Example: "Giới thiệu giày Nike Air Max"

2. **MOTION**: Action and movement focused
   - Keywords: unboxing, demo, nhanh, động, chuyển động
   - Structure: Fast cuts, camera movements, minimal dialogue
   - Example: "Unboxing nhanh iPhone 15"

3. **MONTAGE**: Emotional journey, lifestyle
   - Keywords: ngày của, cuộc sống, cảm xúc, vibe
   - Structure: 5-7 short clips, music-driven
   - Example: "Một ngày của người yêu sneakers"

User Requirement: "{requirement}"
Product: {product_name}

Analyze and return classification.
"""
    
    def __init__(self, gemini_client: GeminiClient):
        """
        Args:
            gemini_client: Initialized Gemini client
        """
        self.client = gemini_client
    
    def classify_intent(
        self,
        user_requirement: str,
        product_name: str = "Product"
    ) -> IntentClassification:
        """
        Classify user requirement into intent
        
        Args:
            user_requirement: What user wants
            product_name: Product name for context
            
        Returns:
            IntentClassification with intent, confidence, rationale
            
        Example:
            >>> router = IntentRouter(client)
            >>> result = router.classify_intent(
            ...     "Giới thiệu giày Nike",
            ...     "Nike Air Max 90"
            ... )
            >>> print(result.intent)  # "narrative"
            >>> print(result.confidence)  # 0.95
        """
        # Build prompt
        prompt = self.CLASSIFICATION_PROMPT.format(
            requirement=user_requirement,
            product_name=product_name
        )
        
        # Get structured output
        classification = self.client.generate_structured(
            prompt=prompt,
            schema=IntentClassification,
            temperature=0.3  # Low temp for consistency
        )
        
        return classification
    
    def classify_with_fallback(
        self,
        user_requirement: str,
        product_name: str = "Product"
    ) -> IntentClassification:
        """
        Classify với fallback to keyword matching nếu API fail
        
        Args:
            user_requirement: User's requirement
            product_name: Product name
            
        Returns:
            IntentClassification
        """
        try:
            # Try AI classification
            return self.classify_intent(user_requirement, product_name)
        
        except Exception as e:
            print(f"⚠️ AI classification failed: {e}")
            print("  Falling back to keyword matching...")
            
            # Fallback: Simple keyword matching
            return self._keyword_classify(user_requirement)
    
    def _keyword_classify(self, requirement: str) -> IntentClassification:
        """
        Simple keyword-based classification (fallback)
        
        Args:
            requirement: User requirement text
            
        Returns:
            IntentClassification
        """
        req_lower = requirement.lower()
        
        # Motion keywords
        motion_keywords = ['unbox', 'demo', 'nhanh', 'động', 'chuyển động', 'test']
        if any(kw in req_lower for kw in motion_keywords):
            return IntentClassification(
                intent="motion",
                confidence=0.7,
                rationale="Keyword match: motion-related terms found"
            )
        
        # Montage keywords
        montage_keywords = ['ngày', 'cuộc sống', 'journey', 'lifestyle', 'vibe']
        if any(kw in req_lower for kw in montage_keywords):
            return IntentClassification(
                intent="montage",
                confidence=0.7,
                rationale="Keyword match: lifestyle/journey terms found"
            )
        
        # Default: narrative
        return IntentClassification(
            intent="narrative",
            confidence=0.6,
            rationale="Default: no specific keywords matched"
        )


# Example usage
if __name__ == "__main__":
    from src.script_agent.gemini_client import GeminiClient
    
    client = GeminiClient()
    router = IntentRouter(client)
    
    # Test cases
    test_cases = [
        "Giới thiệu giày Nike Air Max 90",
        "Unboxing nhanh iPhone 15 Pro",
        "Một ngày với người yêu coffee",
        "Demo tính năng camera iPhone"
    ]
    
    for req in test_cases:
        result = router.classify_with_fallback(req, "Test Product")
        
        print(f"\nRequirement: {req}")
        print(f"  Intent: {result.intent}")
        print(f"  Confidence: {result.confidence:.2f}")
        print(f"  Rationale: {result.rationale}")
```

---

## 🧪 TESTING

```python
# tests/test_intent_router.py
import pytest
from src.script_agent.gemini_client import GeminiClient
from src.script_agent.intent_router import IntentRouter


class TestIntentRouter:
    
    @pytest.fixture
    def router(self):
        client = GeminiClient()
        return IntentRouter(client)
    
    def test_narrative_classification(self, router):
        """Test narrative detection"""
        result = router.classify_intent(
            "Giới thiệu sản phẩm giày Nike",
            "Nike Air Max"
        )
        
        assert result.intent == "narrative"
        assert result.confidence > 0.7
    
    def test_motion_classification(self, router):
        """Test motion detection"""
        result = router.classify_intent(
            "Unboxing nhanh và demo tính năng",
            "iPhone 15"
        )
        
        assert result.intent == "motion"
        assert result.confidence > 0.7
    
    def test_montage_classification(self, router):
        """Test montage detection"""
        result = router.classify_intent(
            "Một ngày của người yêu sneakers",
            "Nike Collection"
        )
        
        assert result.intent == "montage"
        assert result.confidence > 0.7
    
    def test_fallback_keyword_matching(self, router):
        """Test fallback classification"""
        result = router._keyword_classify("Unboxing nhanh")
        
        assert result.intent == "motion"
        assert result.confidence == 0.7
```

---

## 🎓 KEY INSIGHTS

### Why Intent Routing?

**Problem**: One-size-fits-all scripts don't work
- "Unboxing" needs fast cuts, minimal talking
- "Giới thiệu" needs structured storytelling
- "Lifestyle" needs emotional arc

**Solution**: Route to specialized templates

### Confidence Thresholds

```python
if classification.confidence < 0.5:
    # Ask user to clarify
    print("⚠️ Low confidence. Please be more specific")
elif classification.confidence < 0.7:
    # Use but show warning
    print(f"⚠️ Using {intent} template (confidence: {conf})")
else:
    # High confidence, proceed
    print(f"✓ Classified as {intent}")
```

---

## ✅ CHECKLIST

- [ ] `intent_router.py` created
- [ ] AI classification works
- [ ] Fallback keyword matching works
- [ ] All 3 intents tested
- [ ] Confidence scores reasonable

**Next**: MODULE_3_1_TTSGenerator
