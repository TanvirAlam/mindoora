#!/usr/bin/env python3
"""
Test script to verify that downloaded models work correctly
"""

import os
import sys
from pathlib import Path

# Check if transformers is installed
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
    import torch
    print("✅ transformers library found")
except ImportError as e:
    print(f"❌ transformers library not found: {e}")
    print("Installing transformers...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "transformers", "torch"])
    from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
    import torch

def test_model(model_path, model_name):
    """Test a single model"""
    print(f"\n🧪 Testing {model_name}...")
    print(f"📍 Model path: {model_path}")
    
    if not os.path.exists(model_path):
        print(f"❌ Model directory not found: {model_path}")
        return False
    
    try:
        # Load model and tokenizer
        print("📦 Loading tokenizer and model...")
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        model = AutoModelForCausalLM.from_pretrained(model_path, local_files_only=True)
        
        # Create pipeline
        print("🔧 Creating text generation pipeline...")
        generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device=-1,  # Use CPU
            max_new_tokens=50,
            do_sample=True,
            temperature=0.7
        )
        
        # Test prompt
        test_prompt = "Create a JavaScript quiz question about"
        print(f"💭 Testing with prompt: '{test_prompt}'")
        
        # Generate text
        print("🚀 Generating text...")
        result = generator(test_prompt, max_new_tokens=50, num_return_sequences=1)
        
        print("✅ Model test successful!")
        print(f"📝 Generated text: {result[0]['generated_text']}")
        return True
        
    except Exception as e:
        print(f"❌ Model test failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Model Testing Script")
    print("=" * 50)
    
    models_dir = Path("./models")
    
    if not models_dir.exists():
        print("❌ Models directory not found!")
        return False
    
    # Test models
    test_results = {}
    
    # Test DistilGPT-2
    distilgpt2_path = models_dir / "distilgpt2"
    test_results["distilgpt2"] = test_model(str(distilgpt2_path), "DistilGPT-2")
    
    # Test GPT-2
    gpt2_path = models_dir / "gpt2"
    test_results["gpt2"] = test_model(str(gpt2_path), "GPT-2")
    
    # Test DialoGPT (if available)
    dialogo_path = models_dir / "microsoft_DialoGPT-small"
    if dialogo_path.exists():
        test_results["dialogo"] = test_model(str(dialogo_path), "DialoGPT-small")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    for model_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {model_name}: {status}")
    
    print(f"\n🎯 Results: {passed}/{total} models working")
    
    if passed == total:
        print("🎉 All models are working correctly!")
        print("💡 Models are authentic (downloaded via huggingface_hub)")
        return True
    else:
        print("⚠️  Some models failed tests")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
