#!/usr/bin/env python3
"""
Generate questions and answers using local models
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


def generate_qa(model_path, prompt):
    """Generate question and answer from the model"""
    print(f"\n🔍 Generating for model at {model_path}...")
    
    try:
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_path, 
            local_files_only=True,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )

        # Tokenize input
        inputs = tokenizer(prompt, return_tensors="pt")
        
        # Generate text
        print("🚀 Generating...")
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=50,  # Adjust for concise output
                do_sample=True,
                temperature=0.7,
                num_return_sequences=1
            )

        # Decode and print result
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"📝 Generated: '{generated_text}'")
        
        # Clean up
        del model
        torch.cuda.empty_cache() if torch.cuda.is_available() else None

    except Exception as e:
        print(f"❌ Error: {str(e)}")


def main():
    """Run QA generation on local models"""
    print("🚀 Local Model QA Generation")
    print("=" * 50)
    
    # Define models and prompt
    model_paths = [
        "models/distilgpt2",
        "models/gpt2",
        "models/flan-t5-small"
    ]
    prompt = "Create a JavaScript quiz question about promises"
    
    for model_path in model_paths:
        generate_qa(model_path, prompt)
        print("\n" + "-" * 50 + "\n")

if __name__ == "__main__":
    main()

