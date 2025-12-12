import sys
import os

# Add current directory to sys.path
sys.path.append(os.getcwd())

try:
    print("Attempting imports of restructured modules...")
    from agents import Screenwriter
    print("agents import successful!")
    from tools import ImageGeneratorDoubaoSeedreamYunwuAPI
    print("tools import successful!")
    
    print("Attempting pipeline imports (might fail due to dependencies)...")
    from pipelines.idea2video_pipeline import Idea2VideoPipeline
    from pipelines.script2video_pipeline import Script2VideoPipeline
    print("All imports successful!")
except ImportError as e:
    print(f"Import failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
