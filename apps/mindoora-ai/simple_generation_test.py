#!/usr/bin/env python3
"""
Simple text generation test with minimal memory usage
"""

import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

def test_generation(model_path, model_name):
    """Test basic text generation"""
    print(f"\n🧪 Testing generation with {model_name}...")
    print(f"📍 Path: {model_path}")
    
    try:
        # Load tokenizer and model
        print("📦 Loading model...")
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_path, 
            local_files_only=True,
            torch_dtype=torch.float32,  # Use float32 to reduce memory
            device_map="cpu"  # Force CPU usage
        )
        
        # Set pad token
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Simple prompt
        prompt = "JavaScript is"
        print(f"💭 Prompt: '{prompt}'")
        
        # Tokenize
        inputs = tokenizer.encode(prompt, return_tensors="pt")
        
        # Generate with very conservative settings
        print("🚀 Generating (small output)...")
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_new_tokens=10,  # Very small output
                do_sample=False,    # Greedy decoding (faster)
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id,
                temperature=1.0,
                num_return_sequences=1
            )
        
        # Decode output
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"📝 Generated: '{generated_text}'")
        print(f"  🎉 {model_name} generation test passed!")
        
        # Clean up
        del model
        del tokenizer
        torch.cuda.empty_cache() if torch.cuda.is_available() else None
        
        return True
        
    except Exception as e:
        print(f"  ❌ Generation test failed: {str(e)}")
        return False

def main():
    """Test generation for one model"""
    print("🚀 Simple Generation Test")
    print("=" * 50)
    
    # Test just one model to avoid memory issues
    model_path = "models/distilgpt2"
    model_name = "DistilGPT-2"
    
    if os.path.exists(model_path):
        success = test_generation(model_path, model_name)
        
        print("\n" + "=" * 50)
        if success:
            print("🎉 Model generation test PASSED!")
            print("✅ The model is working and can generate text")
        else:
            print("❌ Model generation test FAILED!")
        
        return success
    else:
        print(f"❌ Model not found at {model_path}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
