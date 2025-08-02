#!/usr/bin/env node

import fetch from 'node-fetch';

async function testValidationError() {
  // This mimics exactly what the mobile app sends
  const testData = {
    prompt: "JavaScript programming basics",
    count: 5,
    difficulty: "medium",
    provider: "t5",
    questionTypes: ["multiple-choice"], // This should be valid
    useCache: true,
  };

  try {
    console.log('🧪 Testing exact mobile app request...');
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

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Validation failed!');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(result, null, 2));
      
      if (result.details && Array.isArray(result.details)) {
        console.error('\n📋 Validation errors:');
        result.details.forEach((detail, index) => {
          console.error(`  ${index + 1}. ${detail}`);
        });
      }
      return;
    }

    console.log('✅ Success! Response:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function testMinimalRequest() {
  // Test with just the required field
  const minimalData = {
    prompt: "JavaScript basics"
  };

  try {
    console.log('\n🧪 Testing minimal request (just prompt)...');
    console.log('Request data:', JSON.stringify(minimalData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/questions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalData),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.error('❌ Minimal request failed:');
      console.error(JSON.stringify(result, null, 2));
    } else {
      console.log('✅ Minimal request succeeded!');
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting HTTP 400 debug tests...\n');
  
  await testValidationError();
  await testMinimalRequest();
}

main().catch(console.error);
