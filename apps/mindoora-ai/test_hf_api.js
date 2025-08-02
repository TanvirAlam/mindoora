import { HfInference } from '@huggingface/inference';
import config from './src/config/index.js';

async function testHuggingFaceAPI() {
  console.log('Testing Hugging Face API Connectivity...\n');
  
  const hf = new HfInference(config.huggingface.apiKey);
  
  // List of models to test
  const modelsToTest = [
    'google/flan-t5-small',
    'mrm8488/t5-base-finetuned-question-generation-ap',
    'distilbert-base-uncased',
    'microsoft/DialoGPT-medium'
  ];
  
  console.log('API Key configured:', !!config.huggingface.apiKey);
  console.log('API Key preview:', config.huggingface.apiKey ? config.huggingface.apiKey.substring(0, 10) + '...' : 'Not set');
  console.log();
  
  for (const modelName of modelsToTest) {
    console.log(`Testing model: ${modelName}`);
    try {
      // Simple test with minimal parameters
      const result = await hf.textGeneration({
        model: modelName,
        inputs: 'Generate a question about JavaScript:',
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
          return_full_text: false
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      });
      
      console.log('✅ Success:', result.generated_text?.substring(0, 100) || 'No text generated');
      console.log();
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      console.log('Error type:', error.constructor.name);
      if (error.status) {
        console.log('HTTP Status:', error.status);
      }
      console.log();
    }
  }
  
  // Test a simple sentiment analysis to verify API connection
  console.log('Testing simple sentiment analysis (lighter model)...');
  try {
    const sentiment = await hf.textClassification({
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      inputs: 'I love programming!'
    });
    console.log('✅ Sentiment API works:', sentiment);
  } catch (error) {
    console.log('❌ Sentiment API failed:', error.message);
  }
  
  console.log();
  
  // Test model availability without generation
  console.log('Testing model availability (status check)...');
  try {
    // This is a lighter test that just checks if the model is accessible
    const modelInfo = await fetch(`https://huggingface.co/api/models/mrm8488/t5-base-finetuned-question-generation-ap`, {
      headers: {
        'Authorization': `Bearer ${config.huggingface.apiKey}`
      }
    });
    
    if (modelInfo.ok) {
      const info = await modelInfo.json();
      console.log('✅ Model info retrieved:', {
        modelId: info.modelId,
        downloads: info.downloads,
        likes: info.likes,
        pipeline_tag: info.pipeline_tag
      });
    } else {
      console.log('❌ Model info request failed:', modelInfo.status, modelInfo.statusText);
    }
  } catch (error) {
    console.log('❌ Model availability check failed:', error.message);
  }
}

testHuggingFaceAPI().catch(console.error);
