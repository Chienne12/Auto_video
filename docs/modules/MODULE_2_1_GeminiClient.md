# MODULE 2.1: GEMINI CLIENT

## 🎯 MỤC TIÊU MODULE

**Chức năng chính**: Wrapper cho Google Gemini API với retry logic, rate limiting, và structured output support.

**Input**: Prompt text hoặc Pydantic schema
**Output**: Text response hoặc structured JSON

**Key Features**:
- ✅ Retry với exponential backoff
- ✅ Rate limiting (15 RPM free tier)
- ✅ Structured output với Pydantic
- ✅ Token usage tracking

---

## 📝 IMPLEMENTATION

```python
# src/script_agent/gemini_client.py
"""
GeminiClient - Wrapper for Google Gemini API
Handles retries, rate limiting, and structured output
"""

import os
import time
import json
from typing import Any, Optional, Type, Dict
from pydantic import BaseModel
import google.generativeai as genai
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)


class GeminiClient:
    """
    Client wrapper cho Gemini API
    
    Features:
    - Auto retry on failures
    - Rate limiting
    - Structured output support
    - Token tracking
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-2.5-flash",
        max_retries: int = 3,
        rate_limit_rpm: int = 15  # Free tier: 15 requests/minute
    ):
        """
        Initialize Gemini Client
        
        Args:
            api_key: Gemini API key (or use GEMINI_API_KEY env var)
            model_name: Model to use
            max_retries: Max retry attempts
            rate_limit_rpm: Max requests per minute
        """
        # Get API key
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found! Set env var or pass api_key")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize model
        self.model_name = model_name
        self.model = genai.GenerativeModel(model_name)
        
        # Config
        self.max_retries = max_retries
        self.rate_limit_rpm = rate_limit_rpm
        
        # Rate limiting state
        self._request_times = []
        
        # Usage tracking
        self.total_input_tokens = 0
        self.total_output_tokens = 0
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type(Exception)
    )
    def generate_text(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> str:
        """
        Generate text response
        
        Args:
            prompt: Input prompt
            temperature: Creativity (0.0-1.0)
            max_tokens: Max output tokens
            **kwargs: Additional gen config
            
        Returns:
            str: Generated text
            
        Raises:
            Exception: If generation fails after retries
        """
        # Rate limit check
        self._enforce_rate_limit()
        
        # Generation config
        gen_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens,
            **kwargs
        }
        
        # Generate
        response = self.model.generate_content(
            prompt,
            generation_config=gen_config
        )
        
        # Track usage
        if hasattr(response, 'usage_metadata'):
            self.total_input_tokens += response.usage_metadata.prompt_token_count
            self.total_output_tokens += response.usage_metadata.candidates_token_count
        
        return response.text
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30)
    )
    def generate_structured(
        self,
        prompt: str,
        schema: Type[BaseModel],
        temperature: float = 0.7
    ) -> BaseModel:
        """
        Generate structured output với Pydantic validation
        
        Args:
            prompt: Input prompt
            schema: Pydantic model class
            temperature: Creativity
            
        Returns:
            BaseModel: Validated Pydantic instance
            
        Example:
            >>> class Person(BaseModel):
            ...     name: str
            ...     age: int
            >>> 
            >>> result = client.generate_structured(
            ...     "Generate a person",
            ...     schema=Person
            ... )
            >>> print(result.name, result.age)
        """
        # Add schema instruction to prompt
        schema_json = schema.model_json_schema()
        enhanced_prompt = f"""{prompt}

Return your response in valid JSON format matching this schema:
{json.dumps(schema_json, indent=2)}

IMPORTANT: Return ONLY the JSON object, no markdown code blocks or explanations.
"""
        
        # Generate text
        response_text = self.generate_text(
            enhanced_prompt,
            temperature=temperature
        )
        
        # Parse JSON
        try:
            # Try direct parsing
            json_data = json.loads(response_text)
        except json.JSONDecodeError:
            # Try extracting JSON from markdown
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
            if not json_match:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            
            if json_match:
                json_data = json.loads(json_match.group(1) if '```' in response_text else json_match.group())
            else:
                raise ValueError(f"No valid JSON found in response: {response_text[:200]}...")
        
        # Validate with Pydantic
        validated = schema(**json_data)
        
        return validated
    
    def _enforce_rate_limit(self):
        """
        Enforce rate limiting (RPM)
        
        Logic: Track request times, sleep if exceeding limit
        """
        now = time.time()
        
        # Remove requests older than 1 minute
        self._request_times = [t for t in self._request_times if now - t < 60]
        
        # Check if at limit
        if len(self._request_times) >= self.rate_limit_rpm:
            # Calculate wait time
            oldest = self._request_times[0]
            wait_seconds = 60 - (now - oldest) + 1  # +1 for safety
            
            if wait_seconds > 0:
                print(f"⏳ Rate limit reached. Waiting {wait_seconds:.1f}s...")
                time.sleep(wait_seconds)
        
        # Record this request
        self._request_times.append(time.time())
    
    def get_usage_stats(self) -> Dict:
        """
        Get token usage statistics
        
        Returns:
            dict: Usage stats with cost estimate
        """
        # Gemini 2.5 Flash pricing
        input_cost_per_1m = 0.075
        output_cost_per_1m = 0.30
        
        cost_input = (self.total_input_tokens / 1_000_000) * input_cost_per_1m
        cost_output = (self.total_output_tokens / 1_000_000) * output_cost_per_1m
        
        return {
            "input_tokens": self.total_input_tokens,
            "output_tokens": self.total_output_tokens,
            "total_tokens": self.total_input_tokens + self.total_output_tokens,
            "cost_input_usd": cost_input,
            "cost_output_usd": cost_output,
            "cost_total_usd": cost_input + cost_output
        }
    
    def reset_usage_stats(self):
        """Reset token counters"""
        self.total_input_tokens = 0
        self.total_output_tokens = 0


# Example usage
if __name__ == "__main__":
    from pydantic import BaseModel, Field
    from typing import List
    
    # Define schema
    class ScriptIdea(BaseModel):
        hook: str = Field(description="Opening hook (3 seconds)")
        body: str = Field(description="Main content")
        cta: str = Field(description="Call to action")
    
    # Initialize client
    client = GeminiClient()
    
    # Test 1: Simple text generation
    response = client.generate_text("Write a TikTok hook về Nike shoes")
    print("Text response:", response)
    
    # Test 2: Structured output
    script = client.generate_structured(
        "Create a TikTok script for Nike Air Max 90",
        schema=ScriptIdea
    )
    print("\nStructured output:")
    print(f"Hook: {script.hook}")
    print(f"Body: {script.body}")
    print(f"CTA: {script.cta}")
    
    # Test 3: Usage stats
    stats = client.get_usage_stats()
    print(f"\nUsage: {stats['total_tokens']} tokens")
    print(f"Cost: ${stats['cost_total_usd']:.5f}")
```

---

## 🧪 TESTING

```python
# tests/test_gemini_client.py
import pytest
from pydantic import BaseModel
from src.script_agent.gemini_client import GeminiClient


class SimpleSchema(BaseModel):
    text: str


class TestGeminiClient:
    
    @pytest.fixture
    def client(self):
        """Create client (requires API key)"""
        return GeminiClient()
    
    def test_simple_generation(self, client):
        """Test basic text generation"""
        response = client.generate_text("Say hello")
        
        assert isinstance(response, str)
        assert len(response) > 0
    
    def test_structured_output(, client):
        """Test structured generation"""
        result = client.generate_structured(
            "Return a simple message",
            schema=SimpleSchema
        )
        
        assert isinstance(result, SimpleSchema)
        assert hasattr(result, 'text')
    
    def test_rate_limiting(self, client):
        """Test rate limit enforcement"""
        import time
        
        # Set low limit for testing
        client.rate_limit_rpm = 2
        
        start = time.time()
        
        # Make 3 requests (should trigger wait)
        for i in range(3):
            client.generate_text(f"Test {i}")
        
        elapsed = time.time() - start
        
        # Should take >= 60s for 3rd request
        assert elapsed > 30  # At least some delay
    
    def test_usage_tracking(self, client):
        """Test token usage tracking"""
        client.reset_usage_stats()
        
        client.generate_text("Hello world")
        
        stats = client.get_usage_stats()
        
        assert stats['total_tokens'] > 0
        assert stats['cost_total_usd'] > 0
```

---

## ✅ CHECKLIST

- [ ] `gemini_client.py` created
- [ ] Retry logic works
- [ ] Rate limiting prevents 429 errors
- [ ] Structured output validates correctly
- [ ] Usage tracking accurate

**Next**: MODULE 2.2 - Intent Router
