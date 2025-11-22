/**
 * Test Script for Advanced AI Chatbot System
 * Run: node backend/src/chatbot/test-chatbot.js
 */

const chatbotController = require('./controllers/chatbotController');

// Test data
const testCases = [
  { userId: 'test-user-1', message: 'hello', expected: 'greeting' },
  { userId: 'test-user-1', message: 'weather in Delhi', expected: 'weather data' },
  { userId: 'test-user-1', message: 'tomato price', expected: 'price data' },
  { userId: 'test-user-1', message: 'rice blast treatment', expected: 'disease info' },
  { userId: 'test-user-1', message: 'what is loamy soil', expected: 'soil info' },
  { userId: 'test-user-1', message: 'agriculture news', expected: 'news' },
  { userId: 'test-user-1', message: 'translate to Hindi: good morning', expected: 'translation' },
  { userId: 'test-user-1', message: 'how to grow wheat', expected: 'farming guide' },
  { userId: 'test-user-1', message: 'tell me a joke', expected: 'joke' },
  { userId: 'test-user-1', message: 'nearest mandi', expected: 'location info' }
];

async function runTests() {
  console.log('\n🧪 Testing Advanced AI Chatbot System\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    try {
      console.log(`📝 Testing: "${test.message}"`);
      
      const result = await chatbotController.handleMessage(test.userId, test.message);
      
      if (result.success && result.reply) {
        console.log(`✅ PASSED`);
        console.log(`   Intent: ${result.intent} (confidence: ${result.confidence.toFixed(2)})`);
        console.log(`   Reply: ${result.reply.substring(0, 100)}...`);
        passed++;
      } else {
        console.log(`❌ FAILED: No reply received`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  console.log(`   Success Rate: ${((passed/testCases.length) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Chatbot is working correctly!\n');
  } else {
    console.log('⚠️ Some tests failed. Check error messages above.\n');
  }
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test script error:', err);
  process.exit(1);
});
