// Test AI Service directly
const AIService = require('./src/services/ai');
const fs = require('fs');
const path = require('path');

async function testAIService() {
  console.log('Testing AI Service...\n');
  
  // Read a test image
  const testImagePath = 'C:/Users/kusha/OneDrive/Desktop/FarmHelp/model-service/data/PlantVillage/Tomato_Late_blight/0003faa8-4b27-4c65-bf42-6d9e352ca1a5___RS_Late.B 4946.JPG';
  
  if (!fs.existsSync(testImagePath)) {
    console.error('Test image not found!');
    return;
  }
  
  console.log('Reading test image:', testImagePath);
  const buffer = fs.readFileSync(testImagePath);
  console.log('Image buffer size:', buffer.length, 'bytes\n');
  
  console.log('Calling AIService.analyzePlant()...\n');
  const result = await AIService.analyzePlant(buffer);
  
  console.log('\n========================================');
  console.log('RESULT:');
  console.log('========================================');
  console.log(JSON.stringify(result, null, 2));
  console.log('========================================\n');
  
  if (result.error) {
    console.error('❌ Analysis failed with error:', result.error);
  } else if (result.crop !== 'Unknown') {
    console.log('✅ Analysis successful!');
    console.log('Crop:', result.crop);
    console.log('Disease:', result.disease);
    console.log('Confidence:', result.confidence_percentage);
  } else {
    console.error('⚠️  Got fallback response');
  }
}

testAIService().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
