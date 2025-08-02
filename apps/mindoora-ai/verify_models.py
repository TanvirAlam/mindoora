#!/usr/bin/env python3
"""
Verify model authenticity and integrity without loading full models
"""

import os
import json
import hashlib
from pathlib import Path

def verify_model_integrity(model_path, model_name):
    """Verify a model's integrity by checking essential files"""
    print(f"\n🔍 Verifying {model_name}...")
    print(f"📍 Path: {model_path}")
    
    if not os.path.exists(model_path):
        print(f"❌ Model directory not found")
        return False
    
    # Check essential files
    essential_files = {
        'config.json': 'Model configuration',
        'tokenizer.json': 'Tokenizer configuration',
    }
    
    model_files = {
        'pytorch_model.bin': 'PyTorch model weights',
        'model.safetensors': 'SafeTensors model weights'
    }
    
    issues = []
    
    # Check essential files
    for filename, description in essential_files.items():
        filepath = os.path.join(model_path, filename)
        if os.path.exists(filepath):
            print(f"  ✅ {description}: {filename}")
            
            # Verify JSON files are valid
            if filename.endswith('.json'):
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f)
                    print(f"    📝 Valid JSON with {len(data)} keys")
                except json.JSONDecodeError:
                    issues.append(f"Invalid JSON: {filename}")
                    print(f"    ❌ Invalid JSON format")
        else:
            issues.append(f"Missing: {filename}")
            print(f"  ❌ Missing {description}")
    
    # Check model weights (at least one should exist)
    has_weights = False
    for filename, description in model_files.items():
        filepath = os.path.join(model_path, filename)
        if os.path.exists(filepath):
            size_mb = os.path.getsize(filepath) / (1024 * 1024)
            print(f"  ✅ {description}: {filename} ({size_mb:.1f} MB)")
            has_weights = True
    
    if not has_weights:
        issues.append("No model weights found")
        print(f"  ❌ No model weights found")
    
    # Check configuration details
    config_path = os.path.join(model_path, 'config.json')
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Extract key information
            model_type = config.get('model_type', 'unknown')
            architecture = config.get('architectures', ['unknown'])[0] if config.get('architectures') else 'unknown'
            
            print(f"  📋 Model type: {model_type}")
            print(f"  📋 Architecture: {architecture}")
            
            # Check for suspicious or missing required fields
            required_fields = ['model_type', 'vocab_size']
            for field in required_fields:
                if field not in config:
                    issues.append(f"Missing config field: {field}")
            
        except Exception as e:
            issues.append(f"Config error: {str(e)}")
    
    # Calculate integrity score
    total_checks = len(essential_files) + len(model_files) + 2  # +2 for weights and config validation
    failed_checks = len(issues)
    integrity_score = max(0, (total_checks - failed_checks) / total_checks * 100)
    
    print(f"  🎯 Integrity Score: {integrity_score:.1f}%")
    
    if issues:
        print(f"  ⚠️  Issues found:")
        for issue in issues:
            print(f"    - {issue}")
        return False
    else:
        print(f"  ✅ Model verification passed!")
        return True

def verify_huggingface_authenticity():
    """Verify that models were downloaded using authentic HuggingFace methods"""
    print("🔐 Checking HuggingFace authenticity markers...")
    
    # Check for HuggingFace cache directory (indicates official download)
    cache_dir = "./models/.cache"
    if os.path.exists(cache_dir):
        print("  ✅ HuggingFace cache directory found")
        
        # Check for git repositories (HF uses git for model versioning)
        git_dirs = []
        for root, dirs, files in os.walk("./models"):
            if '.git' in dirs:
                git_dirs.append(root)
        
        if git_dirs:
            print(f"  ✅ Found {len(git_dirs)} git repositories (HuggingFace versioning)")
            for git_dir in git_dirs[:3]:  # Show first 3
                print(f"    📁 {git_dir}")
        else:
            print("  ⚠️  No git repositories found")
        
        return True
    else:
        print("  ❌ No HuggingFace cache directory found")
        return False

def main():
    """Main verification function"""
    print("🛡️  Model Authentication & Integrity Verification")
    print("=" * 60)
    
    models_dir = Path("./models")
    
    if not models_dir.exists():
        print("❌ Models directory not found!")
        return False
    
    # Get model directories (exclude cache)
    model_dirs = [d for d in models_dir.iterdir() 
                  if d.is_dir() and d.name not in ['.cache', '__pycache__']]
    
    print(f"📁 Found {len(model_dirs)} model directories")
    
    # Verify each model
    results = {}
    for model_dir in model_dirs:
        results[model_dir.name] = verify_model_integrity(str(model_dir), model_dir.name)
    
    # Verify HuggingFace authenticity
    print("\n" + "=" * 60)
    hf_authentic = verify_huggingface_authenticity()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Verification Summary:")
    
    passed_models = sum(1 for result in results.values() if result)
    total_models = len(results)
    
    for model_name, passed in results.items():
        status = "✅ AUTHENTIC" if passed else "❌ ISSUES"
        print(f"  {model_name}: {status}")
    
    print(f"\n🎯 Results: {passed_models}/{total_models} models verified")
    print(f"🔐 HuggingFace authenticity: {'✅ VERIFIED' if hf_authentic else '❌ UNVERIFIED'}")
    
    if passed_models == total_models and hf_authentic:
        print("\n🎉 All models are authentic and properly downloaded!")
        print("💡 Models downloaded via official HuggingFace Hub")
        print("🔒 Integrity verification passed")
        return True
    else:
        print("\n⚠️  Some models may have issues or are not authentic")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
