/**
 * AI Service Integration Test
 * Tests the real AI service connection and question generation
 */

// Import fetch for real HTTP requests (bypassing mocks)
const { fetch: nodeFetch } = require('undici');

// Simple test without complex mocking - testing the actual service
const testAIService = async () => {
  console.log('🧪 Testing AI Service...');
  
  try {
    // Test backend connection
    console.log('📡 Testing backend connection...');
    const healthResponse = await nodeFetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    
    if (healthData.success) {
      console.log('✅ Backend is healthy:', healthData.data.status);
    } else {
      throw new Error('Backend health check failed');
    }
    
    // Test question generation
    console.log('🤖 Testing question generation...');
    const questionResponse = await nodeFetch('http://localhost:3001/api/questions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'JavaScript basics',
        count: 2,
        difficulty: 'easy'
      })
    });
    
    const questionData = await questionResponse.json();
    
    if (questionData.success && questionData.data.questions) {
      console.log('✅ Questions generated successfully:');
      console.log(`   - Count: ${questionData.data.questions.length}`);
      console.log(`   - Provider: ${questionData.data.metadata?.provider || 'unknown'}`);
      
      // Validate question structure
      const question = questionData.data.questions[0];
      if (question.id && question.question && question.options && question.correctAnswer) {
        console.log('✅ Question structure is valid');
        console.log(`   - Question: ${question.question.substring(0, 50)}...`);
        console.log(`   - Correct Answer: ${question.correctAnswer}`);
      } else {
        throw new Error('Invalid question structure');
      }
    } else {
      throw new Error('Failed to generate questions');
    }
    
    // Test providers endpoint
    console.log('🔧 Testing providers endpoint...');
    const providersResponse = await nodeFetch('http://localhost:3001/api/questions/providers');
    const providersData = await providersResponse.json();
    
    if (providersData.success) {
      console.log('✅ Providers endpoint working:');
      console.log(`   - Available: ${providersData.data.providers?.join(', ') || 'none'}`);
      console.log(`   - Default: ${providersData.data.default || 'unknown'}`);
    }
    
    console.log('\n🎉 All AI Service tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ AI Service test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('💡 Make sure the AI service is running on port 3001');
      console.error('   Run: cd ../mindoora-ai && npm start');
    }
    
    return false;
  }
};

// Jest test wrapper
describe('AI Service Integration', () => {
  test('should connect to backend and generate questions', async () => {
    const result = await testAIService();
    expect(result).toBe(true);
  }, 15000); // 15 second timeout
});

// Export for direct testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAIService };
}
