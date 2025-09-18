#!/usr/bin/env node

/**
 * Google Earth Engine Service Account Setup Script
 * This script helps you set up real GEE integration
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

async function setupGEE() {
  console.log('🌍 Google Earth Engine Real API Setup');
  console.log('=====================================\n');

  console.log('This script will help you set up real Google Earth Engine integration.');
  console.log('You will need:');
  console.log('1. A Google Cloud Platform account');
  console.log('2. Google Earth Engine access');
  console.log('3. A service account with GEE permissions\n');

  const hasGCP = await question('Do you have a Google Cloud Platform account? (y/n): ');
  if (hasGCP.toLowerCase() !== 'y') {
    console.log('\n❌ Please create a GCP account first:');
    console.log('   https://console.cloud.google.com/');
    console.log('\nThen run this script again.');
    rl.close();
    return;
  }

  const hasGEE = await question('Do you have Google Earth Engine access? (y/n): ');
  if (hasGEE.toLowerCase() !== 'y') {
    console.log('\n❌ Please request Earth Engine access first:');
    console.log('   https://earthengine.google.com/');
    console.log('\nThen run this script again.');
    rl.close();
    return;
  }

  console.log('\n📋 Next steps:');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Create a new project or select existing one');
  console.log('3. Enable Earth Engine API');
  console.log('4. Create a service account with Earth Engine permissions');
  console.log('5. Download the service account JSON key file');
  console.log('6. Register the service account with Earth Engine');

  const hasServiceAccount = await question('\nDo you have a service account JSON key file? (y/n): ');
  
  if (hasServiceAccount.toLowerCase() === 'y') {
    const keyPath = await question('Enter the path to your service account JSON file: ');
    
    try {
      const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      
      console.log('\n✅ Service account key loaded successfully!');
      console.log(`   Project ID: ${keyData.project_id}`);
      console.log(`   Service Account: ${keyData.client_email}`);
      
      // Create environment variables file
      const envContent = `# Google Earth Engine Configuration
GEE_SERVICE_ACCOUNT_EMAIL=${keyData.client_email}
GEE_PROJECT_ID=${keyData.project_id}
GEE_PRIVATE_KEY="${keyData.private_key.replace(/\n/g, '\\n')}"
`;

      const envPath = path.join(process.cwd(), '.env.local');
      fs.writeFileSync(envPath, envContent);
      
      console.log('\n✅ Environment variables saved to .env.local');
      console.log('   (This file should be added to .gitignore)');
      
      // Update the GEE client to use real API
      console.log('\n🔄 Updating GEE client to use real API...');
      updateGEEClient();
      
    } catch (error) {
      console.log('\n❌ Error reading service account file:', error.message);
      console.log('   Please check the file path and format.');
    }
  } else {
    console.log('\n📝 To create a service account:');
    console.log('1. Go to IAM & Admin > Service Accounts');
    console.log('2. Click "Create Service Account"');
    console.log('3. Name: "soil-saathi-gee-service"');
    console.log('4. Grant roles: "Earth Engine Resource Viewer"');
    console.log('5. Create and download JSON key');
    console.log('6. Run this script again with the key file');
  }

  console.log('\n🚀 After setup, run:');
  console.log('   npm run deploy-gee-function');
  console.log('   npm run test-gee-integration');

  rl.close();
}

function updateGEEClient() {
  const geeClientPath = path.join(process.cwd(), 'src/lib/geeClient.ts');
  
  if (fs.existsSync(geeClientPath)) {
    let content = fs.readFileSync(geeClientPath, 'utf8');
    
    // Update the analyzeFieldVegetation function to use real API
    const newFunction = `// Perform vegetation analysis using real GEE API
export async function analyzeFieldVegetation(
  boundary: FieldBoundary,
  cropType?: string,
  analysisDate?: Date
): Promise<GEEAnalysisResult> {
  try {
    console.log('Starting real GEE vegetation analysis...');
    
    const response = await fetch('/api/gee-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldId: \`field_\${Date.now()}\`,
        boundary,
        cropType,
        analysisDate: analysisDate?.toISOString() || new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(\`GEE API error: \${response.status} \${response.statusText}\`);
    }
    
    const result = await response.json();
    console.log('Real GEE API response:', result);
    
    // Return the processed results from the real API
    return {
      ndvi: result.results.ndvi || 0,
      msavi2: result.results.msavi2 || 0,
      ndre: result.results.ndre || 0,
      ndmi: result.results.ndmi || 0,
      rvi: result.results.rvi || 0,
      cloudCover: result.results.cloudCover || 0,
      cropStage: result.results.cropStage || 'vegetative',
      healthStatus: result.results.healthStatus || 'good',
      waterStressLevel: result.results.waterStressLevel || 'mild',
      qualityScore: result.results.qualityScore || 0.8,
      pixelCount: result.results.pixelCount || 1000,
      validPixels: result.results.validPixels || 1000,
      dataSource: result.isRealGEE ? 'gee_api' : 'simulation',
      apiKeyUsed: result.isRealGEE
    };
    
  } catch (error) {
    console.error('GEE API error:', error);
    console.log('Falling back to simulation...');
    return simulateVegetationAnalysis(boundary, cropType, analysisDate);
  }
}`;

    // Replace the function
    content = content.replace(
      /\/\/ Perform vegetation analysis with enhanced simulation[\s\S]*?return simulateVegetationAnalysis\(boundary, cropType, analysisDate\);\s*}/,
      newFunction
    );
    
    fs.writeFileSync(geeClientPath, content);
    console.log('✅ GEE client updated to use real API');
  }
}

// Run the setup
setupGEE().catch(console.error);
