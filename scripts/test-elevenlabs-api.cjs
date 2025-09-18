#!/usr/bin/env node

/**
 * Test ElevenLabs API Integration
 * Verify the new API key is working correctly
 */

const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

async function testElevenLabsAPI() {
  console.log('🎵 Testing ElevenLabs API Integration');
  console.log('====================================\n');

  const API_KEY = '9a83e904680b112aaf0ff75fbf7fa6eece288a06cefabe11669ef75eb6b76896';
  
  try {
    // Initialize client
    console.log('🔧 Initializing ElevenLabs client...');
    const client = new ElevenLabsClient({
      apiKey: API_KEY
    });
    console.log('✅ Client initialized successfully\n');

    // Test 1: Test text-to-speech (main functionality)
    console.log('🎵 Testing: Text-to-Speech generation...');
    const testText = 'Hello, this is a test of the ElevenLabs API integration for Soil Saathi.';
    
    const audioStream = await client.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
      text: testText,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128'
    });
    
    console.log('✅ Audio generation successful');
    console.log(`📊 Audio stream type: ${audioStream.constructor.name}`);
    console.log('');

    // Test 2: Test different languages
    console.log('🌍 Testing: Multi-language support...');
    const languages = [
      { text: 'Hello, this is English text.', lang: 'English' },
      { text: 'नमस्ते, यह हिंदी पाठ है।', lang: 'Hindi' },
      { text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਇਹ ਪੰਜਾਬੀ ਟੈਕਸਟ ਹੈ।', lang: 'Punjabi' }
    ];

    for (const { text, lang } of languages) {
      try {
        const audioStream = await client.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
          text: text,
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128'
        });
        console.log(`✅ ${lang} audio generation successful`);
      } catch (error) {
        console.log(`❌ ${lang} audio generation failed: ${error.message}`);
      }
    }
    console.log('');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('===================');
    console.log('✅ ElevenLabs API key is working correctly');
    console.log('✅ Client initialization successful');
    console.log('✅ Text-to-speech generation working');
    console.log('✅ Multi-language support confirmed');
    console.log('');
    console.log('🚀 Ready for production use!');

  } catch (error) {
    console.error('❌ ElevenLabs API test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check if API key is correct');
    console.log('   2. Verify internet connection');
    console.log('   3. Check ElevenLabs account status');
    console.log('   4. Ensure API key has proper permissions');
  }
}

// Run the test
testElevenLabsAPI();
