#!/usr/bin/env node

async function testTransformersImport() {
  console.log('🔧 Testing @xenova/transformers import...');
  
  try {
    console.log('📦 Attempting to import @xenova/transformers...');
    const { pipeline, env } = await import('@xenova/transformers');
    
    console.log('✅ @xenova/transformers imported successfully!');
    console.log('📋 Available functions:', Object.keys({ pipeline, env }));
    
    // Configure environment
    if (env) {
      env.allowRemoteModels = false;
      env.allowLocalModels = true;
      env.useBrowserCache = false;
      console.log('⚙️ Environment configured for local models only');
    }
    
    // Test if we can create a pipeline
    console.log('🔍 Testing pipeline creation with a simple model...');
    
    // Check which models we actually have
    const fs = await import('fs');
    const path = await import('path');
    
    const modelsDir = './models';
    if (fs.existsSync(modelsDir)) {
      const modelDirs = fs.readdirSync(modelsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      console.log('📁 Available model directories:', modelDirs);
      
      // Try to load one of the available models
      for (const modelDir of modelDirs) {
        const modelPath = path.join(modelsDir, modelDir);
        const configPath = path.join(modelPath, 'config.json');
        
        if (fs.existsSync(configPath)) {
          console.log(`\n🧪 Testing model: ${modelDir}`);
          console.log(`📍 Model path: ${modelPath}`);
          
          try {
            // Read config to determine model type
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log(`🔧 Model type: ${config.model_type}`);
            console.log(`🏗️ Architecture: ${config.architectures?.[0] || 'unknown'}`);
            
            // Try to create a pipeline
            console.log('⏳ Creating pipeline...');
            
            const pipelineType = config.model_type === 't5' ? 'text2text-generation' : 'text-generation';
            console.log(`🎯 Pipeline type: ${pipelineType}`);
            
            const textGenerator = await pipeline(pipelineType, modelPath, {
              local_files_only: true,
              cache_dir: './.xenova_cache'
            });
            
            console.log('✅ Pipeline created successfully!');
            
            // Test generation with a simple prompt
            console.log('📝 Testing text generation...');
            const testPrompt = "What is JavaScript?";
            
            const result = await textGenerator(testPrompt, {
              max_new_tokens: 50,
              temperature: 0.7,
              do_sample: true
            });
            
            console.log('✅ Text generation successful!');
            console.log('📊 Result:', result);
            
            return true;
            
          } catch (modelError) {
            console.log(`❌ Error testing ${modelDir}:`, modelError.message);
            continue;
          }
        }
      }
      
      console.log('❌ No working models found');
      return false;
      
    } else {
      console.log('❌ Models directory not found');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to import @xenova/transformers:', error.message);
    console.error('📋 Full error:', error);
    return false;
  }
}

testTransformersImport().then(success => {
  console.log('\n🎯 Test Result:', success ? '✅ SUCCESS' : '❌ FAILED');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
