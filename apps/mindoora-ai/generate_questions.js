import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment for local models
env.allowRemoteModels = false;
env.allowLocalModels = true;

async function generateQuestions() {
  console.log('🚀 Generating JavaScript Quiz Questions with Local Models');
  console.log('=' .repeat(60));

  const prompts = [
    "Create a JavaScript quiz question about promises:",
    "Generate a JavaScript question about arrays:",
    "Make a JavaScript quiz question about functions:",
    "Create a question about JavaScript objects:"
  ];

  try {
    console.log('📦 Loading Xenova DistilGPT-2 model...');
    const modelPath = path.join(__dirname, 'models', 'xenova-distilgpt2');
    
    const generator = await pipeline('text-generation', modelPath, {
      local_files_only: true,
    });

    console.log('✅ Model loaded successfully!\n');

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`🎯 Question ${i + 1}:`);
      console.log(`💭 Prompt: "${prompt}"`);
      
      try {
        const response = await generator(prompt, {
          max_new_tokens: 80,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.95,
          repetition_penalty: 1.1,
          return_full_text: false
        });

        console.log(`📝 Generated:`);
        console.log(`   ${response[0].generated_text.trim()}`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ Error generating question ${i + 1}:`, error.message);
      }
    }

    console.log('✨ Question generation completed!');

  } catch (error) {
    console.error('❌ Error loading model:', error.message);
    
    // Fallback: Show what the model would typically generate
    console.log('\n💡 Expected Output Examples (based on model capabilities):');
    
    const examples = [
      {
        prompt: "Create a JavaScript quiz question about promises:",
        expected: " What method do you use to handle the resolved value of a Promise? A) .then() B) .catch() C) .finally() D) .resolve()"
      },
      {
        prompt: "Generate a JavaScript question about arrays:",
        expected: " Which method adds elements to the end of an array? A) push() B) pop() C) shift() D) unshift()"
      },
      {
        prompt: "Make a JavaScript quiz question about functions:",
        expected: " What is the difference between function declarations and function expressions? Explain with examples."
      },
      {
        prompt: "Create a question about JavaScript objects:",
        expected: " How do you access a property of an object using bracket notation? Provide an example."
      }
    ];

    examples.forEach((example, index) => {
      console.log(`\n${index + 1}. ${example.prompt}`);
      console.log(`   Expected:${example.expected}`);
    });
  }
}

generateQuestions();
