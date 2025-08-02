#!/usr/bin/env node

/**
 * Test script for T5 question generation
 * Run with: node test-t5.js
 */

import dotenv from 'dotenv';
dotenv.config();

import t5QuestionService from './src/services/t5QuestionService.js';
import logger from './src/utils/logger.js';

async function testT5Model() {
  console.log('🚀 Testing T5BaseQuestionGeneration model...\n');

  const testCases = [
    {
      topic: 'JavaScript programming',
      difficulty: 'medium',
      count: 2
    },
    {
      topic: 'Machine learning',
      difficulty: 'easy',
      count: 2
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.topic} (${testCase.difficulty} difficulty, ${testCase.count} questions)`);
    
    try {
      const startTime = Date.now();
      const result = await t5QuestionService.generateQuestions(testCase.topic, {
        count: testCase.count,
        difficulty: testCase.difficulty,
        questionType: 'multiple choice question',
        useCache: false
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ Success! Generated ${result.questions.length} questions in ${duration}ms\n`);
      
      result.questions.forEach((question, index) => {
        console.log(`Question ${index + 1}: ${question.question}`);
        Object.entries(question.options).forEach(([key, value]) => {
          const marker = key === question.correctAnswer ? '✓' : ' ';
          console.log(`  ${marker} ${key}. ${value}`);
        });
        console.log(`  Answer: ${question.correctAnswer}`);
        console.log(`  Explanation: ${question.explanation}`);
        console.log('');
      });
      
    } catch (error) {
      console.error(`❌ Error testing ${testCase.topic}:`, error.message);
      console.log('');
    }
  }

  // Test model health check
  console.log('🏥 Testing T5 model health check...');
  try {
    const healthResult = await t5QuestionService.healthCheck();
    console.log('Health Status:', healthResult.status);
    console.log('Message:', healthResult.message);
    console.log('Available:', healthResult.available);
    console.log('Model:', healthResult.model);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  // Test model info
  console.log('\nℹ️  T5 Model Information:');
  const modelInfo = t5QuestionService.getModelInfo();
  console.log(JSON.stringify(modelInfo, null, 2));
}

// Run the test
testT5Model().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
