#!/usr/bin/env node

/**
 * Deploy Google Earth Engine Function to Supabase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function deployGEEFunction() {
  console.log('🚀 Deploying Google Earth Engine Function...');
  
  try {
    // Check if Supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ Supabase CLI not found. Please install it first:');
      console.log('   npm install -g supabase');
      return;
    }

    // Check if we're in a Supabase project
    if (!fs.existsSync('supabase/config.toml')) {
      console.log('❌ Not in a Supabase project directory.');
      console.log('   Please run: supabase init');
      return;
    }

    // Replace the current function with the real GEE integration
    const realGEEPath = path.join(process.cwd(), 'supabase/functions/gee-analysis/real-gee-integration.ts');
    const currentFunctionPath = path.join(process.cwd(), 'supabase/functions/gee-analysis/index.ts');
    
    if (fs.existsSync(realGEEPath)) {
      fs.copyFileSync(realGEEPath, currentFunctionPath);
      console.log('✅ Updated function with real GEE integration');
    } else {
      console.log('❌ Real GEE integration file not found');
      return;
    }

    // Deploy the function
    console.log('📤 Deploying to Supabase...');
    execSync('supabase functions deploy gee-analysis', { stdio: 'inherit' });
    
    console.log('✅ GEE function deployed successfully!');
    console.log('\n🔧 Next steps:');
    console.log('1. Set environment variables in Supabase dashboard');
    console.log('2. Test the function with: npm run test-gee-integration');
    
  } catch (error) {
    console.log('❌ Deployment failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you\'re logged in: supabase login');
    console.log('2. Link your project: supabase link');
    console.log('3. Check your Supabase project settings');
  }
}

deployGEEFunction();
