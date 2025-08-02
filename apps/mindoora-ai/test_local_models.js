import { pipeline, env } from '@xenova/transformers';
import path from 'path';

// Configure environment for local models
env.localModelPath = path.join(process.cwd(), 'models');
env.allowRemoteModels = false;
env.allowLocalModels = true;

async function testLocalModels() {
  console.log('Testing local models with @xenova/transformers...\n');
  
  const modelPath = path.join(process.cwd(), 'models', 'gpt2');
  console.log('Model path:', modelPath);
  
  try {
    console.log('Loading GPT-2 model...');
    const generator = await pipeline('text-generation', modelPath, {
      local_files_only: true,
      cache_dir: path.join(process.cwd(), 'models'),
    });
    
    console.log('Model loaded successfully!');
    
    const prompt = "Create a JavaScript quiz question:";
    console.log(`\nGenerating text with prompt: "${prompt}"`);
    
    const response = await generator(prompt, {
      max_new_tokens: 100,
      temperature: 0.7,
      do_sample: true,
      top_p: 0.95,
    });
    
    console.log('\nGenerated text:');
    console.log(response[0].generated_text);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLocalModels();
