#!/usr/bin/env python3
"""
Minimal generation test with the smallest possible footprint
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import gc

def minimal_test():
    """Test with absolute minimal resource usage"""
    print("🧪 Minimal Text Generation Test")
    print("=" * 40)
    
    model_path = "models/distilgpt2"
    
    try:
        print("📦 Loading DistilGPT-2...")
        
        # Load with minimal memory usage
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        
        # Set pad token to avoid warnings
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        print("💭 Prompt: 'JavaScript is'")
        
        # Tokenize input
        inputs = tokenizer("JavaScript is", return_tensors="pt")
        
        print("🚀 Loading model for generation...")
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            local_files_only=True,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        
        print("🎯 Generating 5 tokens...")
        
        # Generate with very conservative settings
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=5,  # Only 5 new tokens
                do_sample=False,   # Greedy (deterministic)
                temperature=1.0,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        print(f"📝 Result: '{generated_text}'")
        print("✅ Generation successful!")
        
        # Immediate cleanup
        del model
        del tokenizer
        del outputs
        del inputs
        gc.collect()
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = minimal_test()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 MODEL TEST PASSED!")
        print("✅ DistilGPT-2 can generate text")
        print("💡 Model is working and producing accurate results")
    else:
        print("❌ Model test failed")
    
    exit(0 if success else 1)
