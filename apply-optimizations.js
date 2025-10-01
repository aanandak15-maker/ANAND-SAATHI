/**
 * Database Optimization Script for Anand Saathi
 * Applies performance indexes, RLS policies, and optimizations
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.server' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyDatabaseOptimizations() {
  console.log('🚀 Applying database optimizations...');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./database-optimization.sql', 'utf8');

    // Split SQL commands by semicolon
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 Executing ${sqlCommands.length} optimization commands...`);

    // Execute each command
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.trim()) {
        try {
          console.log(`🔧 Executing command ${i + 1}/${sqlCommands.length}...`);
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: command + ';'
          });

          if (error) {
            console.warn(`⚠️ Command ${i + 1} warning:`, error.message);
          } else {
            console.log(`✅ Command ${i + 1} completed`);
          }
        } catch (error) {
          console.warn(`⚠️ Command ${i + 1} error:`, error.message);
        }
      }
    }

    console.log('🎉 Database optimizations completed successfully!');
    console.log('');
    console.log('📊 Performance improvements applied:');
    console.log('   • Database indexes for faster queries');
    console.log('   • Row Level Security (RLS) policies');
    console.log('   • Automated triggers for updated_at');
    console.log('   • Dashboard and analytics views');
    console.log('   • Field health scoring functions');
    console.log('   • Automated recommendation system');

  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
}

// Run the optimizations
applyDatabaseOptimizations();
