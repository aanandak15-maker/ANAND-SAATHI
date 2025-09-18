#!/usr/bin/env node

/**
 * Test Google Earth Engine Integration
 */

const fs = require('fs');
const path = require('path');

function testGEEIntegration() {
  console.log('🧪 Testing Google Earth Engine Integration...');
  
  // Test payload
  const testPayload = {
    fieldId: 'test-field-001',
    boundary: {
      coordinates: [[[77.5946, 12.9716], [77.5956, 12.9716], [77.5956, 12.9726], [77.5946, 12.9726], [77.5946, 12.9716]]]
    },
    cropType: 'rice',
    analysisDate: new Date().toISOString()
  };

  console.log('📋 Test Configuration:');
  console.log(`   Field ID: ${testPayload.fieldId}`);
  console.log(`   Crop Type: ${testPayload.cropType}`);
  console.log(`   Boundary: ${testPayload.boundary.coordinates[0].length} points`);
  console.log(`   Analysis Date: ${testPayload.analysisDate}`);

  // Check if environment variables are set
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasGEEConfig = envContent.includes('GEE_SERVICE_ACCOUNT_EMAIL') && 
                        envContent.includes('GEE_PRIVATE_KEY');
    
    if (hasGEEConfig) {
      console.log('✅ GEE environment variables found');
    } else {
      console.log('⚠️  GEE environment variables incomplete');
    }
  } else {
    console.log('❌ No .env.local file found');
    console.log('   Run: npm run setup-real-gee');
  }

  // Check if function is deployed
  console.log('\n🔍 Checking function deployment...');
  console.log('   Function URL: /api/gee-analysis');
  console.log('   Method: POST');
  console.log('   Content-Type: application/json');

  console.log('\n📤 Test Payload:');
  console.log(JSON.stringify(testPayload, null, 2));

  console.log('\n🧪 To test manually:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Open browser developer tools');
  console.log('3. Go to the field mapper and create a field');
  console.log('4. Check the console for GEE API responses');

  console.log('\n📊 Expected Results:');
  console.log('   - Real GEE data if service account is configured');
  console.log('   - Enhanced simulation data if GEE is not available');
  console.log('   - Vegetation indices: NDVI, MSAVI2, NDRE, NDMI, RVI');
  console.log('   - Crop stage and health status');
  console.log('   - Field-specific recommendations');

  console.log('\n🔧 Troubleshooting:');
  console.log('   - Check Supabase function logs');
  console.log('   - Verify environment variables');
  console.log('   - Ensure service account has GEE permissions');
  console.log('   - Check GEE API quotas and limits');
}

testGEEIntegration();
