#!/usr/bin/env node

/**
 * Google Earth Engine Setup Helper Script
 * This script helps set up GEE integration for Soil Saathi
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🌍 Soil Saathi - Google Earth Engine Setup Helper');
  console.log('='.repeat(50));
  console.log();

  console.log('This script will help you set up Google Earth Engine integration.');
  console.log('Make sure you have:');
  console.log('1. ✅ Google Cloud Platform account');
  console.log('2. ✅ Google Earth Engine account');
  console.log('3. ✅ Service account JSON key file');
  console.log();

  const proceed = await question('Do you want to continue? (y/N): ');
  if (proceed.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    process.exit(0);
  }

  console.log();
  console.log('📁 Service Account Configuration');
  console.log('-'.repeat(30));

  const keyFilePath = await question('Enter path to your service account JSON file: ');
  
  if (!fs.existsSync(keyFilePath)) {
    console.error('❌ File not found:', keyFilePath);
    process.exit(1);
  }

  let serviceAccountData;
  try {
    const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
    serviceAccountData = JSON.parse(keyFileContent);
  } catch (error) {
    console.error('❌ Error reading service account file:', error.message);
    process.exit(1);
  }

  // Validate required fields
  const requiredFields = ['client_email', 'private_key', 'project_id'];
  for (const field of requiredFields) {
    if (!serviceAccountData[field]) {
      console.error(`❌ Missing required field in service account JSON: ${field}`);
      process.exit(1);
    }
  }

  console.log('✅ Service account JSON is valid');
  console.log();

  // Generate environment variables
  console.log('🔧 Environment Variables');
  console.log('-'.repeat(25));
  console.log('Add these to your Supabase project settings:');
  console.log();

  console.log('GEE_SERVICE_ACCOUNT_EMAIL=' + serviceAccountData.client_email);
  console.log('GEE_PROJECT_ID=' + serviceAccountData.project_id);
  console.log('GEE_PRIVATE_KEY="' + serviceAccountData.private_key.replace(/\n/g, '\\n') + '"');
  console.log();

  // Save to .env.local for local development
  const envContent = `# Google Earth Engine Configuration
# Add these to your Supabase project environment variables
GEE_SERVICE_ACCOUNT_EMAIL=${serviceAccountData.client_email}
GEE_PROJECT_ID=${serviceAccountData.project_id}
GEE_PRIVATE_KEY="${serviceAccountData.private_key.replace(/\n/g, '\\n')}"
`;

  const saveToFile = await question('Save to .env.local file for local development? (y/N): ');
  if (saveToFile.toLowerCase() === 'y') {
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Saved to .env.local');
    console.log('⚠️  Make sure .env.local is in your .gitignore file!');
  }

  console.log();
  console.log('🚀 Next Steps');
  console.log('-'.repeat(15));
  console.log('1. Add the environment variables to your Supabase project');
  console.log('2. Register your service account with Earth Engine (if not done)');
  console.log('3. Deploy the updated GEE analysis function:');
  console.log('   supabase functions deploy gee-analysis');
  console.log('4. Test the integration with a sample field analysis');
  console.log();

  // Generate test payload
  console.log('🧪 Test Payload');
  console.log('-'.repeat(15));
  console.log('Use this payload to test your GEE integration:');
  console.log();
  console.log(JSON.stringify({
    fieldId: "test-field-" + Date.now(),
    boundary: {
      coordinates: [[[77.5946, 12.9716], [77.5956, 12.9716], [77.5956, 12.9726], [77.5946, 12.9726], [77.5946, 12.9716]]]
    },
    cropType: "rice",
    analysisDate: new Date().toISOString().split('T')[0]
  }, null, 2));

  console.log();
  console.log('✨ Setup complete! Check the docs/GEE_SETUP.md for detailed instructions.');
  
  rl.close();
}

main().catch(console.error);
