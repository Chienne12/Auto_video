"""
Test Master Schema Integration
"""

print("=" * 80)
print("TEST: Master Schema - convert_affiliate_clean()")
print("=" * 80)

# Sample data theo Master Schema format (giống như ví dụ user cung cấp)
master_schema_scene = {
    "scene_id": 1,
    "duration_sec": 4,
    "marketing_goal": "Hook - Negative Emotion (Gây sốc/Lo lắng)",
    
    "product_lock": {
        "visual_focus": "Cận cảnh chất liệu vải hạt (Texture zoom)",
        "state": "Bị hắt nước mạnh vào bề mặt (Water splash test)",
        "color_consistency": "Màu Xám Chì (Matte Grey)"
    },

    "presenter_lock": {
        "visual_type": "Invisible User (Chỉ thấy bàn tay)",
        "action": "Tay cầm cốc nước hắt mạnh vào áo dứt khoát",
        "expression": "N/A"
    },

    "visual_environment": {
        "setting": "Ngoài trời nắng gắt (Outdoor harsh sunlight)",
        "props": "Cốc nước thủy tinh",
        "atmosphere": "High contrast, realistic shadows"
    },

    "camera_tech": {
        "angle": "Macro Shot (Quay siêu cận)",
        "movement": "Slow motion 60fps (Quay chậm lúc nước chạm vải)",
        "focus": "Sharp focus on water droplets (Lấy nét vào giọt nước)",
        "stabilization": "Hand-held (Rung nhẹ tạo cảm giác chân thực)",
        "lighting": "Outdoor harsh sunlight"
    },

    "sound_layer": {
        "sfx": "Tiếng nước tạt 'Rào' + Tiếng tim đập thình thịch",
        "voiceover": "Đừng mua áo chống nắng nếu chưa biết điều này!",
        "bg_music": "Dramatic tension music"
    }
}

# Test converter logic
class TestConverter:
    def convert_affiliate_clean(self, scene_data: dict) -> str:
        # Copy exact logic from implementation
        prod = scene_data.get('product_lock', {})
        actor = scene_data.get('presenter_lock', {})
        env = scene_data.get('visual_environment', {})
        cam = scene_data.get('camera_tech', {})
        
        prompt_parts = [
            "Style: Professional commercial videography, 4k, hyper-realistic.",
            f"Subject: {actor.get('visual_type', 'A user')}. Action: {actor.get('action', 'interacting with product')}.",
        ]
        
        if actor.get('expression') and actor.get('expression') != 'N/A':
            prompt_parts.append(f"Expression: {actor.get('expression')}.")
        
        product_detail = f"Product Focus: {prod.get('visual_focus', 'product in frame')}. State: {prod.get('state', 'ready to use')}."
        if prod.get('color_consistency'):
            product_detail += f" Color: {prod.get('color_consistency')}."
        prompt_parts.append(product_detail)
        
        if env.get('setting'):
            env_detail = f"Environment: {env.get('setting')}."
            if env.get('props'):
                env_detail += f" Props: {env.get('props')}."
            if env.get('atmosphere'):
                env_detail += f" Atmosphere: {env.get('atmosphere')}."
            prompt_parts.append(env_detail)
        
        cam_detail = f"Cinematography: {cam.get('angle', 'eye level')}, {cam.get('movement', 'smooth tracking')}."
        if cam.get('focus'):
            cam_detail += f" Focus: {cam.get('focus')}."
        if cam.get('stabilization'):
            cam_detail += f" Stabilization: {cam.get('stabilization')}."
        cam_detail += f" Lighting: {cam.get('lighting', 'Studio lighting')}."
        prompt_parts.append(cam_detail)
        
        prompt_parts.append("Negative constraint: No text, no lyrics, no subtitles, no words on screen, clean background.")
        
        return " ".join(prompt_parts)

converter = TestConverter()
result = converter.convert_affiliate_clean(master_schema_scene)

print("\n✅ Input Master Schema Scene:")
print(f"  - marketing_goal: {master_schema_scene['marketing_goal']}")
print(f"  - product_lock: {master_schema_scene['product_lock']}")
print(f"  - presenter_lock: {master_schema_scene['presenter_lock']}")
print(f"  - visual_environment: {master_schema_scene['visual_environment']}")
print(f"  - camera_tech: {master_schema_scene['camera_tech']}")
print(f"  - sound_layer: {master_schema_scene['sound_layer']}")

print("\n✅ Output Visual Prompt (Master Schema):")
print(result)

print("\n🔍 Verification Checks:")

# Check 1: Audio filtered out
if "sfx" not in result.lower() and "voiceover" not in result.lower() and "bg_music" not in result.lower():
    print("✓ PASS: Audio (sfx, voiceover, bg_music) properly filtered")
else:
    print("✗ FAIL: Audio still present")

# Check 2: Marketing goal filtered
if "marketing_goal" not in result.lower() and "Hook - Negative" not in result:
    print("✓ PASS: Marketing goal properly filtered")
else:
    print("✗ FAIL: Marketing goal still present")

# Check 3: Color consistency included
if "Xám Chì" in result or "Matte Grey" in result:
    print("✓ PASS: Color consistency included")
else:
    print("✗ FAIL: Color consistency missing")

# Check 4: Visual environment included
if "Outdoor harsh sunlight" in result or "Ngoài trời" in result:
    print("✓ PASS: Visual environment included")
else:
    print("✗ FAIL: Visual environment missing")

# Check 5: Props included
if "Cốc nước" in result or "glass" in result.lower():
    print("✓ PASS: Props included")
else:
    print("✗ FAIL: Props missing")

# Check 6: Camera focus included
if "Sharp focus" in result or "water droplets" in result:
    print("✓ PASS: Camera focus included")
else:
    print("✗ FAIL: Camera focus missing")

# Check 7: Stabilization included
if "Hand-held" in result:
    print("✓ PASS: Camera stabilization included")
else:
    print("✗ FAIL: Camera stabilization missing")

# Check 8: Expression handling (should be skipped for N/A)
if "Expression:" not in result:
    print("✓ PASS: Expression N/A properly skipped")
else:
    print("✗ FAIL: Expression N/A should be skipped")

# Check 9: Negative constraint
if "Negative constraint" in result:
    print("✓ PASS: Negative constraint added")
else:
    print("✗ FAIL: Negative constraint missing")

print("\n" + "=" * 80)
print("Master Schema Test COMPLETED")
print("=" * 80)
