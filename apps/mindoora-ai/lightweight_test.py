#!/usr/bin/env python3
"""
Lightweight test to verify models can be loaded
"""

import os
from transformers import AutoTokenizer, AutoConfig

def test_model_loading(model_path, model_name):
    """Test if model can be loaded without running inference"""
    print(f"\n🧪 Testing {model_name}...")
    print(f"📍 Path: {model_path}")
    
    try:
        # Test config loading
        print("📋 Loading model config...")
        config = AutoConfig.from_pretrained(model_path, local_files_only=True)
        print(f"  ✅ Config loaded: {config.model_type}")
        
        # Test tokenizer loading
        print("🔤 Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        print(f"  ✅ Tokenizer loaded: vocab_size={tokenizer.vocab_size}")
        
        # Test basic tokenization
        test_text = "Hello world"
        tokens = tokenizer.encode(test_text)
        decoded = tokenizer.decode(tokens)
        print(f"  ✅ Tokenization test: '{test_text}' -> {len(tokens)} tokens -> '{decoded}'")
        
        print(f"  🎉 {model_name} is working correctly!")
        return True
        
    except Exception as e:
        print(f"  ❌ Error testing {model_name}: {str(e)}")
        return False

def main():
    """Test all models"""
    print("🚀 Lightweight Model Testing")
    print("=" * 50)
    
    models_to_test = [
        ("models/distilgpt2", "DistilGPT-2"),
        ("models/gpt2", "GPT-2"),
        ("models/flan-t5-small", "FLAN-T5-Small"),
    ]
    
    results = {}
    for model_path, model_name in models_to_test:
        if os.path.exists(model_path):
            results[model_name] = test_model_loading(model_path, model_name)
        else:
            print(f"\n❌ {model_name} not found at {model_path}")
            results[model_name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for model_name, result in results.items():
        status = "✅ WORKING" if result else "❌ FAILED"
        print(f"  {model_name}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} models working")
    
    if passed == total:
        print("🎉 All models are functional!")
    else:
        print("⚠️  Some models have issues")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
