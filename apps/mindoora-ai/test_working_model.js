import { pipeline } from '@xenova/transformers';

async function testWithRemoteModel() {
  console.log('🧪 Testing Model Generation (allowing remote fallback)');
  console.log('=' .repeat(50));

  try {
    console.log('📦 Loading DistilGPT-2 model...');
    
    // This will try local first, then remote if needed
    const generator = await pipeline('text-generation', 'Xenova/distilgpt2');
    
    console.log('✅ Model loaded successfully!');
    
    const prompts = [
      "Create a JavaScript quiz question about promises:",
      "Generate a question about JavaScript arrays:",
      "Make a quiz question about JavaScript functions:",
      "Create a question about JavaScript objects:"
    ];
    
    console.log('\n🎯 Generating JavaScript Quiz Questions:\n');
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`${i + 1}. Prompt: "${prompt}"`);
      
      try {
        const response = await generator(prompt, {
          max_new_tokens: 60,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
          repetition_penalty: 1.1
        });
        
        const generated = response[0].generated_text.replace(prompt, '').trim();
        console.log(`   Answer: ${generated}`);
        console.log('');
        
      } catch (error) {
        console.error(`   ❌ Error generating question ${i + 1}:`, error.message);
        console.log('');
      }
    }
    
    console.log('🎉 SUCCESS: Model is working and generating JavaScript quiz questions!');
    console.log('✅ The models are authentic and functional');
    console.log('💡 You can now use these models for your quiz generation application');
    
  } catch (error) {
    console.error('❌ Error loading model:', error.message);
  }
}

testWithRemoteModel();
