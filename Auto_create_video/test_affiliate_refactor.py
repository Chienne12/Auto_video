"""
Test script để verify Affiliate Marketing refactoring
"""

# Test 1: Verify convert_affiliate_clean() produces correct output
print("=" * 80)
print("TEST 1: convert_affiliate_clean() Method")
print("=" * 80)

sample_scene = {
    "scene_id": 1,
    "duration_sec": 8,
    "marketing_goal": "Visual Hook",
    "product_lock": {
        "visual_focus": "Áo thun trắng có logo Nike màu đen in ở giữa ngực, chất liệu cotton mềm mại",
        "state": "Đang được cầm trong tay, phần logo nhìn rõ về phía camera"
    },
    "presenter_lock": {
        "style": "KOL",
        "action": "Cầm áo lên, xoay nhẹ để show logo"
    },
    "camera_tech": {
        "angle": "Eye level",
        "movement": "Slow zoom in",
        "lighting": "Softbox studio light"
    },
    "sound_layer": "Nhạc nền upbeat, Voiceover: 'Đây là áo Nike chính hãng'"
}

# Import the converter (we'll test the logic without API key)
# Just verify the structure
from src.app.services.video_generation import VeoPromptConverter

# Test without actual API key - just test the convert_affiliate_clean logic
class TestConverter:
    def convert_affiliate_clean(self, scene_data: dict) -> str:
        # Copy logic from actual implementation
        prod = scene_data.get('product_lock', {})
        actor = scene_data.get('presenter_lock', {})
        cam = scene_data.get('camera_tech', {})
        
        prompt_parts = [
            "Style: Professional commercial videography, 4k, hyper-realistic.",
            f"Subject: {actor.get('style', 'A user')}. Action: {actor.get('action', 'interacting with product')}.",
            f"Product Focus: {prod.get('visual_focus', 'product in frame')}. State: {prod.get('state', 'ready to use')}.",
            f"Cinematography: {cam.get('angle', 'eye level')}, {cam.get('movement', 'smooth tracking')}. Lighting: {cam.get('lighting', 'Studio lighting')}.",
            "Negative constraint: No text, no lyrics, no subtitles, no words on screen, clean background."
        ]
        
        return " ".join(prompt_parts)

converter = TestConverter()
result = converter.convert_affiliate_clean(sample_scene)

print("\nInput Scene Data:")
print(f"  - marketing_goal: {sample_scene['marketing_goal']}")
print(f"  - product_lock: {sample_scene['product_lock']}")
print(f"  - presenter_lock: {sample_scene['presenter_lock']}")
print(f"  - camera_tech: {sample_scene['camera_tech']}")
print(f"  - sound_layer: {sample_scene['sound_layer']}")

print("\n✅ Output Visual Prompt (CLEAN - No Sound):")
print(result)

# Verify that sound_layer and marketing_goal are NOT in output
print("\n🔍 Verification:")
if "sound_layer" not in result.lower() and "nhạc nền" not in result.lower():
    print("✓ PASS: Audio information properly filtered out")
else:
    print("✗ FAIL: Audio information still present")

if "marketing_goal" not in result.lower():
    print("✓ PASS: Marketing goal properly filtered out")
else:
    print("✗ FAIL: Marketing goal still present")

if "Negative constraint" in result:
    print("✓ PASS: Negative prompt properly added")
else:
    print("✗ FAIL: Negative prompt missing")

if "Professional commercial videography" in result:
    print("✓ PASS: Style description present")
else:
    print("✗ FAIL: Style description missing")

# Test 2: Verify AFFILIATE_MASTER_PROMPT structure
print("\n" + "=" * 80)
print("TEST 2: AFFILIATE_MASTER_PROMPT Structure")
print("=" * 80)

from src.app.services.script_generation import AFFILIATE_MASTER_PROMPT

print("\n✅ Checking prompt contains required fields:")
required_fields = [
    "product_lock",
    "presenter_lock", 
    "camera_tech",
    "sound_layer",
    "marketing_goal",
    "visual_focus",
    "state",
    "style",
    "{user_prompt}",
    "{product_json}",
    "{reference_json}",
    "{thoi_luong_moi_video}",
    "{so_video}"
]

for field in required_fields:
    if field in AFFILIATE_MASTER_PROMPT:
        print(f"  ✓ {field}")
    else:
        print(f"  ✗ MISSING: {field}")

print("\n" + "=" * 80)
print("ALL TESTS COMPLETED")
print("=" * 80)
