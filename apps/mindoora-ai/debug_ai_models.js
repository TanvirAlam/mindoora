#!/usr/bin/env node

// Debug script to identify and fix AI model loading issues
import fs from 'fs';
import path from 'path';

async function debugAIModels() {
  console.log('🔍 DEBUGGING AI MODEL LOADING ISSUES');
  console.log('=' .repeat(60));
  
  // Step 1: Check environment setup
  console.log('\n1️⃣ Environment Check:');
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Architecture:', process.arch);
  
  // Step 2: Check @xenova/transformers installation
  console.log('\n2️⃣ @xenova/transformers Check:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const transformersVersion = packageJson.dependencies?.['@xenova/transformers'];
    console.log('✅ @xenova/transformers version:', transformersVersion);
  } catch (error) {
    console.log('❌ Cannot read package.json:', error.message);
  }
  
  // Step 3: Test direct import
  console.log('\n3️⃣ Direct Import Test:');
  try {
    console.log('Attempting dynamic import...');
    const transformers = await import('@xenova/transformers');
    console.log('✅ Import successful!');
    console.log('Available exports:', Object.keys(transformers));
    
    const { pipeline, env } = transformers;
    
    // Configure environment
    if (env) {
      env.allowRemoteModels = false;
      env.allowLocalModels = true;
      env.useBrowserCache = false;
      console.log('✅ Environment configured');
    }
    
    // Step 4: Test simple pipeline creation
    console.log('\n4️⃣ Pipeline Creation Test:');
    try {
      // First, let's try with a simple Xenova model that should work
      console.log('Testing with xenova-distilgpt2...');
      
      const generator = await pipeline('text-generation', './models/xenova-distilgpt2', {
        local_files_only: true,
        cache_dir: './.xenova_cache'
      });
      
      console.log('✅ Pipeline created successfully!');
      
      // Step 5: Test actual text generation
      console.log('\n5️⃣ Text Generation Test:');
      const testPrompt = "Generate a JavaScript question: What is";
      console.log('Test prompt:', testPrompt);
      
      const result = await generator(testPrompt, {
        max_new_tokens: 50,
        temperature: 0.7,
        do_sample: true
      });
      
      console.log('✅ Generation successful!');
      console.log('Result:', result);
      
      return { success: true, model: 'xenova-distilgpt2', result };
      
    } catch (pipelineError) {
      console.log('❌ Pipeline creation failed:', pipelineError.message);
      
      // Try with FLAN-T5 instead
      console.log('\n🔄 Trying with flan-t5-small...');
      try {
        const t5Generator = await pipeline('text2text-generation', './models/flan-t5-small', {
          local_files_only: true,
          cache_dir: './.xenova_cache'
        });
        
        console.log('✅ T5 Pipeline created successfully!');
        
        const t5Prompt = "Generate a multiple choice question about JavaScript arrays";
        console.log('T5 Test prompt:', t5Prompt);
        
        const t5Result = await t5Generator(t5Prompt, {
          max_new_tokens: 100,
          temperature: 0.8
        });
        
        console.log('✅ T5 Generation successful!');
        console.log('T5 Result:', t5Result);
        
        return { success: true, model: 'flan-t5-small', result: t5Result };
        
      } catch (t5Error) {
        console.log('❌ T5 Pipeline also failed:', t5Error.message);
        throw pipelineError;
      }
    }
    
  } catch (importError) {
    console.log('❌ Import failed:', importError.message);
    console.log('Full error:', importError);
    
    // Step 6: Check if it's the sharp issue
    if (importError.message.includes('sharp')) {
      console.log('\n🚨 SHARP DEPENDENCY ISSUE DETECTED!');
      console.log('This is the root cause of the AI model failure.');
      
      return { 
        success: false, 
        issue: 'sharp-dependency',
        solution: 'Fix sharp installation or use alternative approach'
      };
    }
    
    return { success: false, issue: 'unknown', error: importError.message };
  }
}

// Step 7: Provide specific solution based on diagnosis
async function provideSolution(diagnosis) {
  console.log('\n🛠️ SOLUTION RECOMMENDATIONS:');
  console.log('=' .repeat(60));
  
  if (diagnosis.success) {
    console.log('✅ AI MODELS ARE WORKING!');
    console.log(`🎯 Working model: ${diagnosis.model}`);
    console.log('📝 Generated text:', diagnosis.result);
    console.log('\n✅ Your models can generate realistic questions!');
    console.log('✅ The issue is in the integration, not the models themselves.');
    
  } else if (diagnosis.issue === 'sharp-dependency') {
    console.log('🔧 SHARP DEPENDENCY FIX:');
    console.log('1. Run: export npm_config_sharp_binary_host="https://github.com"');
    console.log('2. Run: export npm_config_sharp_libvips_binary_host="https://github.com"'); 
    console.log('3. Run: pnpm rebuild sharp');
    console.log('4. Or try: pnpm add sharp --ignore-scripts');
    console.log('5. Alternative: Use ONNX Runtime directly instead of @xenova/transformers');
    
  } else {
    console.log('❌ UNKNOWN ISSUE');
    console.log('Error:', diagnosis.error);
    console.log('Recommendation: Use remote API services or manual question curation');
  }
}

debugAIModels()
  .then(provideSolution)
  .catch(error => {
    console.error('\n💥 DEBUG FAILED:', error.message);
    console.error('Full error:', error);
  });
