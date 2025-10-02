console.log('=== Google Maps Debug Test ===');
console.log('Environment variables:');
console.log('VITE_GOOGLE_MAPS_API_KEY:', window.env?.VITE_GOOGLE_MAPS_API_KEY ? '***' + (window.env.VITE_GOOGLE_MAPS_API_KEY || '').slice(-4) : 'Not set');
console.log('VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT:', window.env?.VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT ? '***' + (window.env.VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT || '').slice(-4) : 'Not set');

console.log('\nTesting Google Maps API access...');

// Test 1: Check if we can create a script element
const testScript = document.createElement('script');
console.log('Script element created:', !!testScript);

// Test 2: Check if we can access googleapis.com
fetch('https://maps.googleapis.com/maps/api/js?key=test', { method: 'HEAD' })
  .then(() => console.log('✅ Google APIs accessible'))
  .catch(error => console.log('❌ Google APIs not accessible:', error.message));

// Test 3: Check for CSP or other blocking
console.log('Document security policy:', document.securityPolicy || 'None');
console.log('Document referrer:', document.referrer || 'None');

console.log('\n=== End Debug Test ===');
