import { pipeline, env } from '@xenova/transformers';

// Disable remote models
env.allowRemoteModels = false;

async function testModel() {
  console.log('🧪 Testing ONNX Model Generation');
  console.log('=' .repeat(40));

  try {
    console.log('📦 Loading model...');
    
    // Try different approaches to load the model
    const modelPath = './models/xenova-distilgpt2';
    
    const generator = await pipeline('text-generation', modelPath);
    
    console.log('✅ Model loaded successfully!');
    
    const prompt = "Create a JavaScript quiz question about arrays:";
    console.log(`\n💭 Prompt: "${prompt}"`);
    
    const response = await generator(prompt, {
      max_new_tokens: 50,
      temperature: 0.7,
      do_sample: true
    });
    
    console.log('\n📝 Generated:');
    console.log(response[0].generated_text);
    
    console.log('\n🎉 SUCCESS: Model is working and generating text!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 This indicates the model files may need to be in a different format');
    console.log('💡 or the @xenova/transformers version may need updating');
  }
}

testModel();
