#!/usr/bin/env python3
"""
Test script to verify that a specific model works
"""

import os
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM


def test_single_model(model_path):
    """Test a single model for text generation"""
    try:
        # Load tokenizer and model
        print(f"📦 Loading tokenizer and model from {model_path}...")
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        model = AutoModelForCausalLM.from_pretrained(model_path, local_files_only=True)

        # Use CPU to reduce memory usage
        print("🔧 Creating text generation pipeline using CPU...")
        generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device=-1,
        )

        # Test generation
        prompt = "Create a JavaScript quiz question about"
        print(f"💬 Generating text with prompt: '{prompt}'")

        output = generator(prompt, max_new_tokens=50, num_return_sequences=1)
        print("📝 Generated Text:")
        print(output[0]['generated_text'])
    except Exception as e:
        print(f"❌ Error during model test: {str(e)}")


if __name__ == "__main__":
    model_path = "models/distilgpt2"
    test_single_model(model_path)

