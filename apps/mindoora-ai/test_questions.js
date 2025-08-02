import localModelService from './src/services/localModelService.js';

async function testIntelligentQuestionGeneration() {
  console.log('Testing Intelligent Local Model-Aware Question Generation...\n');
  
  // Test different models with JavaScript
  console.log('=== GPT-2 Style Questions (Creative) ===');
  const gpt2Result = await localModelService.generateQuestions('JavaScript', { 
    model: 'gpt2', 
    count: 3, 
    difficulty: 'medium' 
  });
  
  gpt2Result.questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.question}`);
    console.log(`   A) ${q.options.A}`);
    console.log(`   B) ${q.options.B}`);
    console.log(`   C) ${q.options.C}`);
    console.log(`   D) ${q.options.D}`);
    console.log(`   Correct: ${q.correctAnswer}`);
    console.log(`   Explanation: ${q.explanation}\n`);
  });
  
  console.log('=== DistilGPT-2 Style Questions (Concise) ===');
  const distilResult = await localModelService.generateQuestions('JavaScript', { 
    model: 'distilgpt2', 
    count: 3, 
    difficulty: 'easy' 
  });
  
  distilResult.questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.question}`);
    console.log(`   Correct: ${q.correctAnswer}`);
    console.log(`   Explanation: ${q.explanation}\n`);
  });
  
  console.log('=== T5 Style Questions (Instructional) ===');
  const t5Result = await localModelService.generateQuestions('JavaScript', { 
    model: 'flan-t5-small', 
    count: 3, 
    difficulty: 'hard' 
  });
  
  t5Result.questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.question}`);
    console.log(`   Correct: ${q.correctAnswer}`);
    console.log(`   Explanation: ${q.explanation}\n`);
  });
  
  console.log('=== Python Questions with Different Models ===');
  const pythonGpt2 = await localModelService.generateQuestions('Python', { model: 'gpt2', count: 2 });
  const pythonT5 = await localModelService.generateQuestions('Python', { model: 'flan-t5-small', count: 2 });
  
  console.log('GPT-2 Python:', pythonGpt2.questions[0].question);
  console.log('T5 Python:', pythonT5.questions[0].question);
  
  console.log('\n=== Metadata Comparison ===');
  console.log('GPT-2 Metadata:', gpt2Result.metadata);
  console.log('DistilGPT-2 Metadata:', distilResult.metadata);
  console.log('T5 Metadata:', t5Result.metadata);
}

testIntelligentQuestionGeneration().catch(console.error);
