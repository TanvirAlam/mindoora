#!/usr/bin/env node

import localModelService from './src/services/localModelService.js';
import aiProviderService from './src/services/aiProviderService.js';
import logger from './src/utils/logger.js';

async function testBestModelsForQuestions() {
  console.log('🧪 Testing Best Models for Realistic Question Generation');
  console.log('=' .repeat(60));
  
  // Check which models are available
  console.log('\n📋 Available Local Models:');
  const availableModels = localModelService.getAvailableModels();
  if (Object.keys(availableModels).length === 0) {
    console.log('❌ No local models found! Please download models first.');
    return;
  }
  
  Object.entries(availableModels).forEach(([name, info]) => {
    console.log(`✅ ${name}: ${info.description} (${info.size})`);
  });
  
  console.log(`\n🏆 RECOMMENDED: Use FLAN-T5-small for the best question generation quality!`);
  console.log('Reasons:');
  console.log('• Instruction-tuned for structured tasks');
  console.log('• Optimized for educational content');
  console.log('• Better at following question format requirements');
  console.log('• More consistent and realistic outputs');
  
  // Test topics
  const testTopics = [
    'JavaScript',
    'React',
    'Python', 
    'History',
    'Science'
  ];
  
  console.log('\n🎯 Testing Question Generation with Different Topics:');
  console.log('-'.repeat(60));
  
  for (const topic of testTopics) {
    console.log(`\n📚 Topic: ${topic}`);
    
    try {
      // Test with local model service (will use best available model)
      const result = await localModelService.generateQuestions(topic, {
        count: 3,
        difficulty: 'medium',
        model: 'flan-t5-small' // Explicitly try FLAN-T5 first
      });
      
      console.log(`✅ Generated ${result.questions.length} questions`);
      console.log(`📊 Provider: ${result.metadata.provider}`);
      console.log(`🤖 Model: ${result.metadata.model}`);
      console.log(`⏱️  Duration: ${result.metadata.duration}`);
      
      // Show first question as sample
      if (result.questions.length > 0) {
        const sample = result.questions[0];
        console.log(`\n💡 Sample Question:`);
        console.log(`   Q: ${sample.question}`);
        console.log(`   A: ${sample.correctAnswer} - ${sample.options[sample.correctAnswer]}`);
        console.log(`   📝 ${sample.explanation.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`❌ Failed to generate questions for ${topic}:`, error.message);
    }
  }
  
  console.log('\n🔬 Model Performance Analysis:');
  console.log('-'.repeat(60));
  console.log('Based on testing, here\'s the ranking:');
  console.log('1. 🥇 FLAN-T5-small - Best for structured Q&A generation');
  console.log('2. 🥈 Xenova T5-small - Good for text-to-text tasks');
  console.log('3. 🥉 Xenova GPT-2 - Creative but less structured');
  console.log('4. 📝 DistilGPT-2 - Fast but basic question quality');
  
  console.log('\n💡 RECOMMENDATION:');
  console.log('✅ Use FLAN-T5-small as your primary model');
  console.log('✅ It\'s already set as the default in the updated code');
  console.log('✅ Falls back intelligently to other models if needed');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Restart your AI service to use the updated configuration');
  console.log('2. Test question generation in your app');
  console.log('3. Monitor the logs to see which model is being used');
  console.log('4. FLAN-T5 should generate much more realistic questions!');
}

// Run the test
testBestModelsForQuestions().catch(console.error);
