import t5QuestionService from './src/services/t5QuestionService.js';

async function testT5QuestionGeneration() {
  console.log('Testing T5 Question Generation with mrm8488/t5-base-finetuned-question-generation-ap\n');
  
  // Test model info
  console.log('=== Model Information ===');
  const modelInfo = t5QuestionService.getModelInfo();
  console.log('Model:', modelInfo.name);
  console.log('Description:', modelInfo.description);
  console.log('Author:', modelInfo.author);
  console.log('Size:', modelInfo.size);
  console.log('Optimized for:', modelInfo.optimized_for);
  console.log('Available:', modelInfo.available);
  console.log();
  
  // Test health check
  console.log('=== Health Check ===');
  try {
    const healthResult = await t5QuestionService.healthCheck();
    console.log('Status:', healthResult.status);
    console.log('Message:', healthResult.message);
    console.log('Available:', healthResult.available);
    console.log();
  } catch (error) {
    console.log('Health check failed:', error.message);
  }
  
  // Test question generation with different topics
  const topics = ['JavaScript', 'Python', 'Machine Learning', 'Data Structures'];
  
  for (const topic of topics) {
    console.log(`=== Testing ${topic} Questions ===`);
    try {
      const result = await t5QuestionService.generateQuestions(topic, {
        count: 2,
        difficulty: 'medium',
        useCache: false
      });
      
      console.log(`Generated ${result.questions.length} questions for ${topic}:`);
      console.log('Provider:', result.metadata.provider);
      console.log('Model:', result.metadata.model);
      console.log('Duration:', result.metadata.duration);
      console.log();
      
      result.questions.forEach((q, i) => {
        console.log(`${i + 1}. ${q.question}`);
        console.log(`   Source: ${q.source}`);
        console.log(`   Correct Answer: ${q.correctAnswer}`);
        console.log();
      });
      
    } catch (error) {
      console.log(`Failed to generate questions for ${topic}:`, error.message);
      console.log();
    }
  }
  
  // Test single model test
  console.log('=== Single Model Test ===');
  try {
    const testResult = await t5QuestionService.testModel();
    console.log('Test Success:', testResult.success);
    console.log('Questions Generated:', testResult.questionsGenerated);
    console.log('Sample Question:', testResult.sampleQuestion);
    if (!testResult.success) {
      console.log('Error:', testResult.error);
    }
  } catch (error) {
    console.log('Model test failed:', error.message);
  }
}

testT5QuestionGeneration().catch(console.error);
