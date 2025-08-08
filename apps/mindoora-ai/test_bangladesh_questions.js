/**
 * Test script to verify Bangladesh questions and topic variation
 */

import finalWorkingModelService from './src/services/finalWorkingModelService.js';
import enhancedTemplateService from './src/services/enhancedTemplateService.js';

console.log('🇧🇩 TESTING BANGLADESH QUESTIONS AND VARIATION');
console.log('======================================================================');

async function testTopicVariation() {
  const topics = ['Bangladesh', 'javascript', 'history', 'science', 'mathematics', 'unknown topic'];
  
  for (const topic of topics) {
    console.log(`\n📚 Testing Topic: ${topic}`);
    console.log('----------------------------------------------------------------------');
    
    try {
      // Test with final working model service (which uses enhanced templates)
      const result = await finalWorkingModelService.generateQuestions(topic, { count: 3 });
      
      console.log(`✅ Questions Generated: ${result.questions.length}`);
      console.log(`📊 Provider: ${result.metadata.provider}`);
      console.log(`🤖 Model: ${result.metadata.model}`);
      
      // Display questions
      result.questions.forEach((q, index) => {
        console.log(`\n   ${index + 1}. ${q.question}`);
        console.log(`      A: ${q.options.A}`);
        console.log(`      B: ${q.options.B}`);
        console.log(`      C: ${q.options.C}`);
        console.log(`      D: ${q.options.D}`);
        console.log(`      ✓ Answer: ${q.correctAnswer} - ${q.options[q.correctAnswer]}`);
        console.log(`      💡 ${q.explanation}`);
        console.log(`      🏷️  Category: ${q.category}`);
        console.log(`      📊 Topic: ${q.topic}`);
      });
      
    } catch (error) {
      console.error(`❌ Error testing ${topic}:`, error.message);
    }
  }
}

async function testBangladeshSpecifically() {
  console.log('\n\n🇧🇩 TESTING BANGLADESH QUESTIONS SPECIFICALLY');
  console.log('======================================================================');
  
  // Test multiple generations to check for variation
  for (let i = 1; i <= 5; i++) {
    console.log(`\n🔄 Generation ${i}:`);
    
    try {
      const question = enhancedTemplateService.getQuestion('Bangladesh', i, 'medium', 'conceptual');
      
      console.log(`   Question: ${question.question}`);
      console.log(`   Category: ${question.category}`);
      console.log(`   Answer: ${question.correctAnswer} - ${question.options[question.correctAnswer]}`);
      console.log(`   Explanation: ${question.explanation}`);
      
    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
    }
  }
}

async function testHistoryAndScience() {
  console.log('\n\n📖 TESTING HISTORY AND SCIENCE VARIATION');
  console.log('======================================================================');
  
  const subjects = ['History', 'Science'];
  
  for (const subject of subjects) {
    console.log(`\n📚 ${subject} Questions:`);
    
    for (let i = 1; i <= 3; i++) {
      try {
        const question = enhancedTemplateService.getQuestion(subject, i, 'medium', 'conceptual');
        
        console.log(`   ${i}. ${question.question}`);
        console.log(`      ✓ ${question.correctAnswer}: ${question.options[question.correctAnswer]}`);
        console.log(`      🏷️ ${question.category}`);
        
      } catch (error) {
        console.error(`   ❌ Error:`, error.message);
      }
    }
  }
}

// Run all tests
async function runAllTests() {
  await testTopicVariation();
  await testBangladeshSpecifically();
  await testHistoryAndScience();
  
  console.log('\n\n🎉 SUMMARY');
  console.log('======================================================================');
  console.log('✅ Bangladesh questions should now show:');
  console.log('   - Real questions about Bangladesh history, culture, geography');
  console.log('   - Proper variation across different categories');
  console.log('   - Detailed explanations with Bangladesh-specific content');
  console.log('✅ Other topics (History, Science) should show variation too');
  console.log('✅ No more generic "key principle" questions for specific topics');
}

runAllTests().catch(console.error);
