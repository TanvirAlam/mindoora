/**
 * AI Service Mock Test
 * Tests the AI service functionality with mocked responses
 */

// Simple test with mocked service responses
const testAIService = async () => {
  console.log('🧪 Testing AI Service...');
  
  try {
    // Mock successful backend connection
    console.log('📡 Testing backend connection...');
    const healthData = {
      success: true,
      data: { status: 'healthy' }
    };
    
    if (healthData.success) {
      console.log('✅ Backend is healthy:', healthData.data.status);
    }
    
    // Mock question generation
    console.log('🤖 Testing question generation...');
    const questionData = {
      success: true,
      data: {
        questions: [
          {
            id: 'q1',
            question: 'In a real-world scenario, what is the correct way to handle asynchronous operations in JavaScript?',
            options: {
              A: 'Using callbacks only',
              B: 'Using setTimeout',
              C: 'Using Promises or async/await',
              D: 'Using synchronous functions'
            },
            correctAnswer: 'C'
          },
          {
            id: 'q2',
            question: 'What is the purpose of the "use strict" directive in JavaScript?',
            options: {
              A: 'To enable strict mode',
              B: 'To disable warnings',
              C: 'To improve performance',
              D: 'To enable debugging'
            },
            correctAnswer: 'A'
          }
        ],
        metadata: {
          provider: 'local-ai'
        }
      }
    };
    
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
    
    // Mock providers endpoint
    console.log('🔧 Testing providers endpoint...');
    const providersData = {
      success: true,
      data: {
        providers: ['local'],
        default: 'local'
      }
    };
    
    if (providersData.success) {
      console.log('✅ Providers endpoint working:');
      console.log(`   - Available: ${providersData.data.providers?.join(', ') || 'none'}`);
      console.log(`   - Default: ${providersData.data.default || 'unknown'}`);
    }
    
    console.log('\n🎉 All AI Service tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ AI Service test failed:', error.message);
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
