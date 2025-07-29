#!/usr/bin/env node

/**
 * Simple test script to verify the AI service is working
 * Run with: node test-service.js
 */

import fetch from 'node-fetch';

const AI_SERVICE_URL = 'http://localhost:3001';

async function testService() {
  console.log('🧪 Testing AI Service...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${AI_SERVICE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.success ? 'PASS' : 'FAIL');
    console.log('   Status:', healthData.data?.status || 'unknown');

    // Test 2: Get available models
    console.log('\n2️⃣ Testing available models...');
    const modelsResponse = await fetch(`${AI_SERVICE_URL}/api/local/models`);
    const modelsData = await modelsResponse.json();
    console.log('✅ Models endpoint:', modelsData.success ? 'PASS' : 'FAIL');
    if (modelsData.success) {
      console.log('   Available models:', Object.keys(modelsData.data.models).join(', '));
    }

    // Test 3: Quick test
    console.log('\n3️⃣ Testing quick question generation...');
    const quickTestResponse = await fetch(`${AI_SERVICE_URL}/api/local/quick-test`);
    const quickTestData = await quickTestResponse.json();
    console.log('✅ Quick test:', quickTestData.success ? 'PASS' : 'FAIL');
    if (quickTestData.success) {
      console.log('   Generated:', quickTestData.data.questions?.length || 0, 'questions');
      console.log('   Topic:', quickTestData.metadata?.testTopic || 'unknown');
    } else {
      console.log('   Error:', quickTestData.message);
    }

    // Test 4: Custom question generation
    console.log('\n4️⃣ Testing custom question generation...');
    const customResponse = await fetch(`${AI_SERVICE_URL}/api/local/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'JavaScript fundamentals',
        count: 2,
        difficulty: 'medium',
        model: 'flan-t5-small'
      })
    });
    
    const customData = await customResponse.json();
    console.log('✅ Custom generation:', customData.success ? 'PASS' : 'FAIL');
    if (customData.success) {
      console.log('   Generated:', customData.data.questions?.length || 0, 'questions');
      console.log('   Sample question:', customData.data.questions?.[0]?.question?.substring(0, 80) + '...');
    } else {
      console.log('   Error:', customData.message);
      if (customData.instructions) {
        console.log('   Instructions:', customData.instructions);
      }
    }

    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the AI service is running:');
      console.log('   cd apps/mindoora-ai');
      console.log('   pnpm dev');
    }
  }
}

// Run the test
testService();
