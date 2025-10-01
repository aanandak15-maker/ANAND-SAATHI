import { supabase } from '../src/integrations/supabase/client.ts';

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');

    // Test basic connection by trying to list tables
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (error) {
      if (error.message.includes('JWT') || error.message.includes('permission')) {
        console.log('✅ Database connection works (authentication required for some operations)');
        console.log('📋 Expected tables should include: profiles, farms, fields, satellite_analyses, recommendations, marketplace_interactions');
      } else {
        console.log('❌ Database connection failed:', error.message);
        return false;
      }
    } else {
      console.log('✅ Database connection successful');
      const anandTables = tables?.filter(t =>
        ['profiles', 'farms', 'fields', 'satellite_analyses', 'recommendations', 'marketplace_interactions'].includes(t.table_name)
      ) || [];
      console.log('📊 Found tables:', anandTables.map(t => t.table_name));
    }

    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

testDatabaseConnection();
