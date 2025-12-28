"""
Test Deep Marketing & ASMR Schema Integration
"""

print("=" * 80)
print("TEST: Deep Marketing Schema với Visual Psychology & ASMR")
print("=" * 80)

# Sample theo Deep Marketing Schema (giống example user cung cấp)
deep_marketing_scene = {
    "scene_id": 1,
    "duration_sec": 3,
    "marketing_goal": "Sensory Hook (Đánh thức giác quan)",
    
    "visual_psychology": "Góc quay Macro kết hợp Slow motion để kích thích cơn khát (Thirst Appeal), khiến người xem cảm nhận được độ lạnh buốt.",
    
    "product_lock": {
        "visual_focus": "Cận cảnh lon nước đọng đầy giọt nước ngưng tụ (Condensation)",
        "state": "Nắp lon đang được bật lên, bọt ga bắn ra li ti"
    },

    "presenter_lock": {
        "style": "Invisible User (Chỉ thấy ngón tay)",
        "action": "Ngón tay cái bật mạnh nắp lon dứt khoát"
    },

    "camera_tech": {
        "angle": "Macro Shot (Siêu cận cảnh nắp lon)",
        "movement": "Super Slow Motion (Quay cực chậm khoảnh khắc bật nắp)",
        "lighting": "Backlight (Ngược sáng) làm nổi bật hạt nước lấp lánh"
    },

    "sound_layer": {
        "sfx": "Tiếng 'Pssssht' đanh gọn cực lớn (Crisp opening sound) + Tiếng ga sủi bọt",
        "voiceover": "N/A",
        "music_vibe": "Energetic, Fresh beat"
    }
}

# Test converter với visual psychology
class TestConverter:
    def convert_affiliate_clean(self, scene_data: dict) -> str:
        # Copy exact logic from implementation
        prod = scene_data.get('product_lock', {})
        actor = scene_data.get('presenter_lock', {})
        cam = scene_data.get('camera_tech', {})
        
        # NEW: Visual Psychology
        psych = scene_data.get('visual_psychology', 'Professional commercial shot with focus on product details')
        
        prompt_parts = [
            "Style: Professional commercial videography, 4k, hyper-realistic.",
            
            # MOOD & ATMOSPHERE
            f"Atmosphere & Mood: {psych}. Intense focus on texture and details.",
            
            f"Subject: {actor.get('style', 'A user')}. Action: {actor.get('action', 'interacting with product')}.",
            
            f"Product Focus: {prod.get('visual_focus', 'product in frame')}. State: {prod.get('state', 'ready to use')}.",
            
            f"Cinematography: {cam.get('angle', 'eye level')}, {cam.get('movement', 'smooth tracking')}. Lighting: {cam.get('lighting', 'Studio lighting')}.",
            
            "Negative constraint: No text, no lyrics, no subtitles, no words on screen, clean background."
        ]
        
        return " ".join(prompt_parts)

converter = TestConverter()
result = converter.convert_affiliate_clean(deep_marketing_scene)

print("\n✅ Input Deep Marketing Scene:")
print(f"  - marketing_goal: {deep_marketing_scene['marketing_goal']}")
print(f"  - visual_psychology: {deep_marketing_scene['visual_psychology']}")
print(f"  - product_lock: {deep_marketing_scene['product_lock']}")
print(f"  - presenter_lock: {deep_marketing_scene['presenter_lock']}")
print(f"  - camera_tech: {deep_marketing_scene['camera_tech']}")
print(f"  - sound_layer: {deep_marketing_scene['sound_layer']}")

print("\n✅ Output Visual Prompt với Psychology Mood:")
print(result)

print("\n🔍 Deep Marketing Verification:")

# Check 1: Visual Psychology included as Mood
if "Thirst Appeal" in result or "Macro kết hợp Slow motion" in result or "kích thích cơn khát" in result:
    print("✓ PASS: Visual Psychology included in Mood & Atmosphere")
else:
    print("✗ FAIL: Visual Psychology missing")

# Check 2: ASMR Sound filtered (không trong visual prompt)
if "Pssssht" not in result and "sfx" not in result.lower() and "music_vibe" not in result.lower():
    print("✓ PASS: ASMR Sound (sfx, music_vibe) properly filtered from visual prompt")
else:
    print("✗ FAIL: Sound still present in visual prompt")

# Check 3: Marketing goal filtered
if "Sensory Hook" not in result and "marketing_goal" not in result.lower():
    print("✓ PASS: Marketing goal properly filtered")
else:
    print("✗ FAIL: Marketing goal present")

# Check 4: Product visual focus
if "Condensation" in result or "giọt nước ngưng tụ" in result:
    print("✓ PASS: Product visual focus included")
else:
    print("✗ FAIL: Product visual focus missing")

# Check 5: Product state
if "bật lên" in result or "bọt ga" in result:
    print("✓ PASS: Product state included")
else:
    print("✗ FAIL: Product state missing")

# Check 6: Camera angle
if "Macro Shot" in result or "Siêu cận" in result:
    print("✓ PASS: Camera angle included")
else:
    print("✗ FAIL: Camera angle missing")

# Check 7: Camera movement
if "Slow Motion" in result or "chậm" in result:
    print("✓ PASS: Camera movement included")
else:
    print("✗ FAIL: Camera movement missing")

# Check 8: Lighting
if "Backlight" in result or "Ngược sáng" in result:
    print("✓ PASS: Lighting included")
else:
    print("✗ FAIL: Lighting missing")

# Check 9: Mood & Atmosphere line present
if "Atmosphere & Mood:" in result:
    print("✓ PASS: Mood & Atmosphere section present")
else:
    print("✗ FAIL: Mood & Atmosphere section missing")

# Check 10: Negative constraint
if "Negative constraint" in result:
    print("✓ PASS: Negative constraint added")
else:
    print("✗ FAIL: Negative constraint missing")

print("\n" + "=" * 80)
print("✅ Deep Marketing & ASMR Schema Test COMPLETED")
print("=" * 80)

# Print full JSON structure expected
print("\n📋 EXPECTED JSON STRUCTURE từ Gemini:")
print("""
{
  "video_strategy": {
    "hook_type": "Sensory ASMR Hook",
    "pain_point": "Nỗi đau cụ thể",
    "solution_mechanism": "Cơ chế giải quyết"
  },
  "scenes": [
    {
      "scene_id": 1,
      "duration_sec": 3,
      "marketing_goal": "Sensory Hook",
      "visual_psychology": "GIẢI THÍCH tâm lý góc quay...",
      "product_lock": {...},
      "presenter_lock": {...},
      "camera_tech": {...},
      "sound_layer": {
        "sfx": "ASMR sound chi tiết",
        "voiceover": "Lời thoại ngắn gọn",
        "music_vibe": "Mood nhạc"
      }
    }
  ],
  "improvement_suggestions": [
    "Gợi ý cải thiện 1",
    "Gợi ý cải thiện 2"
  ]
}
""")
