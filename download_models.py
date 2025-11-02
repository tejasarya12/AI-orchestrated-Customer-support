#!/usr/bin/env python
"""
Automated model downloader for AI Support Assistant
Downloads all required models from Hugging Face
"""

import os
import sys
from pathlib import Path
from huggingface_hub import snapshot_download
from tqdm import tqdm

def download_model(repo_id, local_dir, description):
    """Download a model from Hugging Face"""
    print(f"\n📥 Downloading {description}...")
    print(f"   Repository: {repo_id}")
    print(f"   Destination: {local_dir}")
    
    try:
        # Create directory if it doesn't exist
        Path(local_dir).mkdir(parents=True, exist_ok=True)
        
        # Download model
        snapshot_download(
            repo_id=repo_id,
            local_dir=local_dir,
            local_dir_use_symlinks=False,
            resume_download=True
        )
        
        print(f"   ✅ Successfully downloaded {description}")
        return True
        
    except Exception as e:
        print(f"   ❌ Failed to download {description}: {e}")
        return False

def main():
    print("=" * 70)
    print("🤖 AI Support Assistant - Model Downloader")
    print("=" * 70)
    
    # Check if huggingface_hub is installed
    try:
        import huggingface_hub
    except ImportError:
        print("❌ Error: huggingface_hub not installed")
        print("   Install with: pip install huggingface-hub")
        sys.exit(1)
    
    # Define models to download
    models = [
        {
            "repo_id": "deepseek-ai/deepseek-llm-7b-chat",
            "local_dir": "./models/deepseek-llm-7b-chat",
            "description": "DeepSeek LLM 7B Chat Model (~14GB)",
            "size": "~14GB",
            "optional": False
        },
        {
            "repo_id": "sentence-transformers/all-MiniLM-L6-v2",
            "local_dir": "./models/all-MiniLM-L6-v2",
            "description": "Embedding Model (~80MB)",
            "size": "~80MB",
            "optional": False
        },
        {
            "repo_id": "ucaslcl/GOT-OCR2_0",
            "local_dir": "./models/GOT-OCR2_0",
            "description": "GOT-OCR2.0 for DeepSeek OCR (~2GB)",
            "size": "~2GB",
            "optional": True
        }
    ]
    
    print("\nModels to download:")
    for i, model in enumerate(models, 1):
        optional = " (optional)" if model["optional"] else " (required)"
        print(f"{i}. {model['description']}{optional}")
        print(f"   Size: {model['size']}")
    
    total_size = sum([14000, 80, 2000])  # Approximate sizes in MB
    print(f"\nTotal download size: ~{total_size / 1000:.1f}GB")
    print(f"Required disk space: ~{total_size / 1000 * 1.2:.1f}GB (with overhead)")
    
    # Ask for confirmation
    print("\n⚠️  Large downloads ahead!")
    response = input("Do you want to proceed? (yes/no): ").lower().strip()
    
    if response not in ['yes', 'y']:
        print("Download cancelled.")
        sys.exit(0)
    
    # Ask about optional models
    download_optional = True
    if any(m["optional"] for m in models):
        response = input("\nDownload optional models (OCR)? (yes/no): ").lower().strip()
        download_optional = response in ['yes', 'y']
    
    # Download models
    print("\n" + "=" * 70)
    print("Starting downloads...")
    print("=" * 70)
    
    success_count = 0
    failed_models = []
    
    for model in models:
        if model["optional"] and not download_optional:
            print(f"\n⏭️  Skipping optional model: {model['description']}")
            continue
        
        success = download_model(
            model["repo_id"],
            model["local_dir"],
            model["description"]
        )
        
        if success:
            success_count += 1
        else:
            failed_models.append(model["description"])
    
    # Summary
    print("\n" + "=" * 70)
    print("Download Summary")
    print("=" * 70)
    print(f"✅ Successfully downloaded: {success_count} models")
    
    if failed_models:
        print(f"❌ Failed downloads: {len(failed_models)}")
        for model in failed_models:
            print(f"   - {model}")
    
    print("\n" + "=" * 70)
    
    if success_count == len([m for m in models if not m["optional"]]):
        print("✅ All required models downloaded successfully!")
        print("\nNext steps:")
        print("1. Copy .env.example to .env and configure")
        print("2. Run: python test_models.py (to verify)")
        print("3. Run: python app.py (to start the application)")
    else:
        print("⚠️  Some required models failed to download")
        print("Please check your internet connection and try again")
        print("Or download manually from Hugging Face:")
        for model in failed_models:
            matching = [m for m in models if m["description"] == model]
            if matching:
                print(f"   {matching[0]['repo_id']}")
    
    print("=" * 70)

if __name__ == "__main__":
    main()