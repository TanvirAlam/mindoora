#!/usr/bin/env node

import fetch from 'node-fetch';

async function testQuestionGeneration() {
  const testData = {
    prompt: "JavaScript programming basics",
    count: 2,
    difficulty: "medium",
    provider: "huggingface"
  };

  try {
    console.log('🧪 Testing question generation API...');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/questions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Success! Generated questions:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testHealthCheck() {
  try {
    console.log('🏥 Testing health check...');
    
    const response = await fetch('http://localhost:3001/health');
    const result = await response.json();
    
    console.log('✅ Health check result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting API tests...\n');
  
  await testHealthCheck();
  console.log('\n' + '='.repeat(50) + '\n');
  await testQuestionGeneration();
}

main().catch(console.error);
