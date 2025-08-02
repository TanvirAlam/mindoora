#!/usr/bin/env python3
"""
Download ONNX-compatible models for @xenova/transformers
"""

import os
from huggingface_hub import snapshot_download
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ONNX-compatible models that work with @xenova/transformers
ONNX_MODELS = [
    {
        "name": "Xenova/distilgpt2",
        "repo_id": "Xenova/distilgpt2",
        "local_dir": "./models/xenova-distilgpt2",
        "description": "DistilGPT-2 with ONNX support"
    },
    {
        "name": "Xenova/gpt2",
        "repo_id": "Xenova/gpt2", 
        "local_dir": "./models/xenova-gpt2",
        "description": "GPT-2 with ONNX support"
    },
    {
        "name": "Xenova/t5-small",
        "repo_id": "Xenova/t5-small",
        "local_dir": "./models/xenova-t5-small", 
        "description": "T5-small with ONNX support"
    }
]

def download_onnx_models():
    """Download ONNX-compatible models"""
    logger.info("🚀 Downloading ONNX-compatible models for @xenova/transformers...")
    
    success_count = 0
    
    for model in ONNX_MODELS:
        try:
            logger.info(f"\n📦 Downloading {model['name']}...")
            logger.info(f"📝 Description: {model['description']}")
            logger.info(f"📍 Local directory: {model['local_dir']}")
            
            # Create directory
            os.makedirs(model['local_dir'], exist_ok=True)
            
            # Download model
            snapshot_download(
                repo_id=model['repo_id'],
                local_dir=model['local_dir'],
                local_dir_use_symlinks=False,
                cache_dir="./models/.cache"
            )
            
            logger.info(f"✅ Successfully downloaded {model['name']}")
            success_count += 1
            
        except Exception as e:
            logger.error(f"❌ Failed to download {model['name']}: {str(e)}")
            continue
    
    logger.info(f"\n🎯 Summary: {success_count}/{len(ONNX_MODELS)} models downloaded successfully")
    
    if success_count > 0:
        logger.info("✨ ONNX models are ready for @xenova/transformers!")
        return True
    else:
        logger.error("❌ No models were downloaded successfully")
        return False

def verify_onnx_files():
    """Verify that ONNX files exist"""
    logger.info("\n🔍 Verifying ONNX model files...")
    
    for model in ONNX_MODELS:
        model_dir = model['local_dir']
        if os.path.exists(model_dir):
            logger.info(f"\n📋 Checking {model['name']}:")
            
            # Look for ONNX files
            onnx_files = []
            for root, dirs, files in os.walk(model_dir):
                for file in files:
                    if file.endswith('.onnx'):
                        onnx_files.append(os.path.join(root, file))
            
            if onnx_files:
                logger.info(f"  ✅ Found {len(onnx_files)} ONNX file(s)")
                for onnx_file in onnx_files[:3]:  # Show first 3
                    logger.info(f"    📄 {os.path.relpath(onnx_file, model_dir)}")
                if len(onnx_files) > 3:
                    logger.info(f"    ... and {len(onnx_files) - 3} more")
            else:
                logger.warning(f"  ⚠️  No ONNX files found in {model_dir}")
                
            # Check for essential files
            essential_files = ['config.json', 'tokenizer.json']
            for file in essential_files:
                file_path = os.path.join(model_dir, file)
                if os.path.exists(file_path):
                    logger.info(f"  ✅ {file} found")
                else:
                    logger.warning(f"  ⚠️  {file} missing")

if __name__ == "__main__":
    success = download_onnx_models()
    
    if success:
        verify_onnx_files()
        logger.info("\n🎉 Ready to use with @xenova/transformers!")
        logger.info("💡 You can now run your Node.js generation script")
    else:
        logger.info("\n❌ Download failed. Check your internet connection and try again.")
        
    exit(0 if success else 1)
