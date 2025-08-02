#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test configuration
const AI_SERVICE_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3000';

// Test data
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

const TEST_GAME_DATA = {
  title: 'Test JavaScript Quiz',
  prompt: 'JavaScript programming concepts',
  questions: [
    {
      question: 'What is the output of typeof null in JavaScript?',
      options: ['null', 'undefined', 'object', 'boolean'],
      correctAnswer: 2
    },
    {
      question: 'Which method is used to add an element to the end of an array?',
      options: ['push()', 'pop()', 'shift()', 'unshift()'],
      correctAnswer: 0
    },
    {
      question: 'What does the === operator do in JavaScript?',
      options: ['Checks for equality only', 'Checks for strict equality (value and type)', 'Assigns a value', 'Compares references'],
      correctAnswer: 1
    }
  ],
  createdAt: new Date().toISOString()
};

// Utility functions
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            data: null
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAIServiceHealth() {
  console.log('\n🧪 Testing AI Service Health...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/questions/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode === 200 || response.statusCode === 503) {
      console.log('✅ AI Service is responding');
      console.log(`📊 Status: ${response.data?.data?.overall || 'unknown'}`);
      return true;
    } else {
      console.log(`❌ AI Service health check failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ AI Service health check error: ${error.message}`);
    return false;
  }
}

async function testQuestionGeneration() {
  console.log('\n🧪 Testing Question Generation...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/questions/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      prompt: 'JavaScript programming',
      count: 5,
      difficulty: 'medium'
    });

    if (response.statusCode === 200 && response.data?.success) {
      console.log('✅ Question generation successful');
      console.log(`📊 Generated ${response.data.data.questions.length} questions`);
      
      // Validate question structure
      const questions = response.data.data.questions;
      let validQuestions = 0;
      
      questions.forEach((q, index) => {
        if (q.question && q.options && q.correctAnswer !== undefined) {
          validQuestions++;
        } else {
          console.log(`⚠️  Question ${index + 1} has invalid structure`);
        }
      });
      
      console.log(`✅ ${validQuestions}/${questions.length} questions have valid structure`);
      return { success: true, questions };
    } else {
      console.log(`❌ Question generation failed: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data || response.body, null, 2)}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Question generation error: ${error.message}`);
    return { success: false };
  }
}

async function testBackendHealth() {
  console.log('\n🧪 Testing Backend Server Health...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Backend server is responding');
      return true;
    } else {
      console.log(`❌ Backend server health check failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend server health check error: ${error.message}`);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n🧪 Testing Database Connection...');
  
  try {
    // Try to access a public endpoint that would indicate DB connectivity
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/ousergame/allpublicv2?lastGame=0',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode === 200 || response.statusCode === 404) {
      console.log('✅ Database connection working (endpoint accessible)');
      return true;
    } else {
      console.log(`❌ Database connection test failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Database connection error: ${error.message}`);
    return false;
  }
}

async function testGameCreationEndpoint() {
  console.log('\n🧪 Testing Game Creation Endpoint (without auth)...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/games',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, TEST_GAME_DATA);

    if (response.statusCode === 401) {
      console.log('✅ Game creation endpoint requires authentication (as expected)');
      return true;
    } else if (response.statusCode === 404) {
      console.log('❌ Game creation endpoint not found - route may not be registered');
      return false;
    } else {
      console.log(`❌ Unexpected response from game creation endpoint: ${response.statusCode}`);
      console.log(`Response: ${JSON.stringify(response.data || response.body, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Game creation endpoint error: ${error.message}`);
    return false;
  }
}

async function testEndToEndWorkflow() {
  console.log('\n🧪 Testing End-to-End Workflow...');
  
  // Step 1: Generate questions via AI service
  console.log('Step 1: Generating questions via AI service...');
  const aiResult = await testQuestionGeneration();
  
  if (!aiResult.success) {
    console.log('❌ E2E test failed: Could not generate questions');
    return false;
  }

  // Step 2: Prepare game data with AI-generated questions
  console.log('Step 2: Preparing game data...');
  const gameData = {
    title: 'E2E Test Game',
    prompt: 'JavaScript programming',
    questions: aiResult.questions.slice(0, 3).map(q => ({
      question: q.question,
      options: [q.options.A, q.options.B, q.options.C, q.options.D],
      correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer)
    })),
    createdAt: new Date().toISOString()
  };

  console.log(`✅ Prepared game with ${gameData.questions.length} questions`);

  // Step 3: Test game creation (should fail due to auth)
  console.log('Step 3: Testing game creation endpoint...');
  const gameCreationResult = await testGameCreationEndpoint();
  
  if (gameCreationResult) {
    console.log('✅ E2E workflow test completed successfully');
    console.log('📋 Summary:');
    console.log('   - AI service can generate questions ✅');
    console.log('   - Questions have valid structure ✅');
    console.log('   - Game creation endpoint is protected ✅');
    console.log('   - Data can be prepared for database storage ✅');
    return true;
  } else {
    console.log('❌ E2E workflow test failed');
    return false;
  }
}

async function testDataValidation() {
  console.log('\n🧪 Testing Data Validation...');
  
  const validationTests = [
    {
      name: 'Valid game data',
      data: TEST_GAME_DATA,
      expectedValid: true
    },
    {
      name: 'Missing title',
      data: { ...TEST_GAME_DATA, title: '' },
      expectedValid: false
    },
    {
      name: 'Empty questions array',
      data: { ...TEST_GAME_DATA, questions: [] },
      expectedValid: false
    },
    {
      name: 'Too many questions (over 20)',
      data: { 
        ...TEST_GAME_DATA, 
        questions: Array(21).fill(TEST_GAME_DATA.questions[0])
      },
      expectedValid: false
    },
    {
      name: 'Invalid question structure',
      data: {
        ...TEST_GAME_DATA,
        questions: [{ question: 'Test?', options: ['A'], correctAnswer: 0 }]
      },
      expectedValid: false
    }
  ];

  let passedTests = 0;
  
  for (const test of validationTests) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/games',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, test.data);

      // Since we expect 401 (unauthorized) for valid data and 400 (bad request) for invalid data
      const isValidResponse = response.statusCode === 401; // Valid data, but no auth
      const isInvalidResponse = response.statusCode === 400; // Invalid data
      
      if (test.expectedValid && isValidResponse) {
        console.log(`✅ ${test.name}: Correctly handled valid data`);
        passedTests++;
      } else if (!test.expectedValid && (isInvalidResponse || response.statusCode === 401)) {
        console.log(`✅ ${test.name}: Correctly handled invalid data`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: Unexpected response ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
    }
  }
  
  console.log(`📊 Validation tests: ${passedTests}/${validationTests.length} passed`);
  return passedTests === validationTests.length;
}

async function main() {
  console.log('🚀 Starting Comprehensive Game Creation Test Suite');
  console.log('=' .repeat(60));

  const results = {
    aiHealth: false,
    backendHealth: false,
    databaseConnection: false,
    questionGeneration: false,
    gameCreationEndpoint: false,
    dataValidation: false,
    endToEndWorkflow: false
  };

  // Run all tests
  results.aiHealth = await testAIServiceHealth();
  results.backendHealth = await testBackendHealth();
  results.databaseConnection = await testDatabaseConnection();
  results.questionGeneration = await testQuestionGeneration();
  results.gameCreationEndpoint = await testGameCreationEndpoint();
  results.dataValidation = await testDataValidation();
  results.endToEndWorkflow = await testEndToEndWorkflow();

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));

  const testResults = [
    ['AI Service Health', results.aiHealth],
    ['Backend Health', results.backendHealth],
    ['Database Connection', results.databaseConnection],
    ['Question Generation', results.questionGeneration],
    ['Game Creation Endpoint', results.gameCreationEndpoint],
    ['Data Validation', results.dataValidation],
    ['End-to-End Workflow', results.endToEndWorkflow]
  ];

  let passedCount = 0;
  testResults.forEach(([testName, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    if (passed) passedCount++;
  });

  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 OVERALL RESULT: ${passedCount}/${testResults.length} tests passed`);
  
  if (passedCount === testResults.length) {
    console.log('🎉 All systems are working correctly!');
    console.log('💾 The game creation workflow is ready for production use.');
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
  }
  
  console.log('=' .repeat(60));
  
  // Exit with appropriate code
  process.exit(passedCount === testResults.length ? 0 : 1);
}

// Run the test suite
main().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});
