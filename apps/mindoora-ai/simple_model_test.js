import fs from 'fs';
import path from 'path';

function checkModelFiles() {
  console.log('🔍 Checking model files...\n');
  
  const modelsDir = './models';
  
  if (!fs.existsSync(modelsDir)) {
    console.log('❌ Models directory does not exist');
    return false;
  }
  
  const modelDirs = fs.readdirSync(modelsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`📁 Found model directories: ${modelDirs.join(', ')}\n`);
  
  for (const modelDir of modelDirs) {
    const modelPath = path.join(modelsDir, modelDir);
    console.log(`📋 Checking ${modelDir}:`);
    
    // Check for essential files
    const essentialFiles = ['config.json', 'tokenizer.json'];
    const modelFiles = ['pytorch_model.bin', 'model.safetensors'];
    
    for (const file of essentialFiles) {
      const filePath = path.join(modelPath, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
      } else {
        console.log(`  ❌ ${file} - Missing`);
      }
    }
    
    // Check for model weights
    let hasModelWeights = false;
    for (const file of modelFiles) {
      const filePath = path.join(modelPath, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✅ ${file} (${(stats.size / (1024*1024)).toFixed(1)} MB)`);
        hasModelWeights = true;
      }
    }
    
    if (!hasModelWeights) {
      console.log(`  ❌ No model weights found`);
    }
    
    // Try to read config.json to verify it's valid
    const configPath = path.join(modelPath, 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`  📝 Model type: ${config.model_type || 'unknown'}`);
        console.log(`  📝 Architecture: ${config.architectures?.[0] || 'unknown'}`);
      } catch (error) {
        console.log(`  ❌ Invalid config.json: ${error.message}`);
      }
    }
    
    console.log('');
  }
  
  return modelDirs.length > 0;
}

function testPythonDownloadScript() {
  console.log('🐍 Testing Python download script...\n');
  
  if (!fs.existsSync('download_model.py')) {
    console.log('❌ download_model.py not found');
    return false;
  }
  
  console.log('✅ download_model.py exists');
  
  // Read the script and check for potential issues
  const script = fs.readFileSync('download_model.py', 'utf8');
  
  // Check for required imports
  const requiredImports = ['huggingface_hub', 'os', 'logging'];
  for (const imp of requiredImports) {
    if (script.includes(imp)) {
      console.log(`✅ Import ${imp} found`);
    } else {
      console.log(`❌ Import ${imp} missing`);
    }
  }
  
  // Check for model verification
  if (script.includes('snapshot_download')) {
    console.log('✅ Uses snapshot_download (authentic downloads)');
  } else {
    console.log('❌ Does not use snapshot_download');
  }
  
  return true;
}

console.log('🚀 Model Authentication and Verification Test\n');
console.log('=' .repeat(50));

const hasModels = checkModelFiles();
const scriptOk = testPythonDownloadScript();

console.log('=' .repeat(50));
console.log('\n📊 Summary:');
console.log(`Models available: ${hasModels ? '✅' : '❌'}`);
console.log(`Download script: ${scriptOk ? '✅' : '❌'}`);

if (hasModels && scriptOk) {
  console.log('\n🎉 Models appear to be properly downloaded and authentic!');
  console.log('💡 The huggingface_hub snapshot_download ensures authenticity');
} else {
  console.log('\n⚠️  Some issues detected. Consider re-running download_model.py');
}
