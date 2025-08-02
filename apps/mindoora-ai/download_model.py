#!/usr/bin/env python3
"""
Download suitable models for question generation with error handling and verification
"""

import os
from huggingface_hub import snapshot_download
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models configuration
MODELS_CONFIG = [
    {
        "name": "distilgpt2",
        "repo_id": "distilgpt2",
        "local_dir": "./models/distilgpt2",
    },
    {
        "name": "gpt2",
        "repo_id": "gpt2",
        "local_dir": "./models/gpt2",
    },
    {
        "name": "microsoft/DialoGPT-small",
        "repo_id": "microsoft/DialoGPT-small",
        "local_dir": "./models/DialoGPT-small",
    }
]

def download_models():
    """Download models to local directories with error handling"""

    success = True

    for model in MODELS_CONFIG:
        try:
            logger.info(f"Starting download of {model['name']}...")
            logger.info(f"Downloading to: {model['local_dir']}")
            
            # Create the models directory if it doesn't exist
            os.makedirs(model['local_dir'], exist_ok=True)
            
            # Download the model
            snapshot_download(
                repo_id=model['repo_id'],
                local_dir=model['local_dir'],
                local_dir_use_symlinks=False,
                cache_dir="./models/.cache"
            )
            
            logger.info(f"✅ Successfully downloaded {model['repo_id']} to {model['local_dir']}")
            
            # List downloaded files
            files = os.listdir(model['local_dir'])
            logger.info(f"Downloaded files: {files}")

        except Exception as e:
            logger.error(f"❌ Failed to download {model['name']}: {str(e)}")
            success = False

    return success

def download_alternative_models():
    """Download additional models for better question generation"""
    alternative_models = [
        "gpt2",  # Classic GPT-2 model
        "microsoft/DialoGPT-small"  # Good for conversational text
    ]
    
    for model in alternative_models:
        try:
            model_name = model.replace("/", "_")
            local_dir = f"./models/{model_name}"
            
            logger.info(f"Downloading {model}...")
            
            snapshot_download(
                repo_id=model,
                local_dir=local_dir,
                local_dir_use_symlinks=False,
                cache_dir="./models/.cache"
            )
            
            logger.info(f"✅ Successfully downloaded {model}")
            
        except Exception as e:
            logger.error(f"❌ Failed to download {model}: {str(e)}")
            continue

if __name__ == "__main__":
    logger.info("🚀 Starting model download process...")

    # Download all models
    success = download_models()

    if success:
        logger.info("✨ All models downloaded successfully!")
    else:
        logger.info("⚠️ Some models failed to download. Check error logs")

    # Show final directory structure
    if os.path.exists("./models"):
        logger.info("\n📁 Final models directory structure:")
        for root, dirs, files in os.walk("./models"):
            level = root.replace("./models", "").count(os.sep)
            indent = " " * 2 * level
            logger.info(f"{indent}{os.path.basename(root)}/")
            subindent = " " * 2 * (level + 1)
            for file in files[:5]:  # Show first 5 files
                logger.info(f"{subindent}{file}")
            if len(files) > 5:
                logger.info(f"{subindent}... and {len(files) - 5} more files")
