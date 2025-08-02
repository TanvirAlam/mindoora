#!/usr/bin/env node

import fetch from 'node-fetch';

async function testEggsPrompt() {
  const testData = {
    prompt: "Eggs", // This was failing before
    count: 3,
    difficulty: "medium",
    provider: "t5",
    questionTypes: ["multiple-choice"],
    useCache: true,
  };

  try {
    console.log('🥚 Testing "Eggs" prompt...');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/questions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Request failed!');
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

    console.log('✅ Success! Generated questions about eggs:');
    result.data.questions.forEach((q, index) => {
      console.log(`\n${index + 1}. ${q.question}`);
      console.log(`   A) ${q.options.A}`);
      console.log(`   B) ${q.options.B}`);
      console.log(`   C) ${q.options.C}`);
      console.log(`   D) ${q.options.D}`);
      console.log(`   Answer: ${q.correctAnswer}`);
    });

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testEggsPrompt();
