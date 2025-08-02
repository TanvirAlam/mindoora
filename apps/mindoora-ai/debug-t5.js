import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

async function testT5Model() {
  console.log('🔍 Testing T5 Model...');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.error('❌ No Hugging Face API key found');
    return;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');
  
  const hf = new HfInference(apiKey);
  const modelName = 'Avinash250325/T5BaseQuestionGeneration';
  
  try {
    console.log('📡 Testing simple text generation with T5 model...');
    
    const testInput = 'context: JavaScript programming question: Generate a medium difficulty multiple choice question about JavaScript programming.';
    
    console.log('Input prompt:', testInput);
    
    const response = await hf.textGeneration({
      model: modelName,
      inputs: testInput,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.95,
        repetition_penalty: 1.1,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,
        use_cache: false,
      }
    });
    
    console.log('✅ Raw API Response:', JSON.stringify(response, null, 2));
    
    const generatedText = response.generated_text || response[0]?.generated_text || '';
    console.log('Generated text:', generatedText);
    
    if (!generatedText) {
      console.error('❌ No generated text received');
    } else {
      console.log('✅ Successfully generated text');
    }
    
  } catch (error) {
    console.error('❌ Error during API call:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    if (error.response) {
      console.error('HTTP Response Status:', error.response.status);
      console.error('HTTP Response Text:', await error.response.text().catch(() => 'Unable to read response'));
    }
  }
}

testT5Model().catch(console.error);
