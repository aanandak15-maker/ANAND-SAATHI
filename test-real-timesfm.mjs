/**
 * Test Real TimesFM Integration
 * Tests the actual TimesFM API running in Docker
 */

const TIMESFM_API_URL = 'http://localhost:8001';

console.log('🧪 Testing Real TimesFM Integration...\n');

// Test 1: Health Check
async function testHealthCheck() {
  console.log('🔍 Testing TimesFM API Health...');
  
  try {
    const response = await fetch(`${TIMESFM_API_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ TimesFM API Health:');
    console.log(`   Status: ${data.status}`);
    console.log(`   Model Loaded: ${data.model_loaded}`);
    console.log(`   Timestamp: ${data.timestamp}`);
    
    return data.model_loaded;
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return false;
  }
}

// Test 2: Weather Forecast
async function testWeatherForecast() {
  console.log('\n🌤️  Testing Weather Forecast...');
  
  try {
    const response = await fetch(`${TIMESFM_API_URL}/forecast/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: { lat: 30.9010, lng: 75.8573 },
        horizon: 14,
        parameters: ['temperature', 'humidity', 'rainfall']
      })
    });
    
    if (!response.ok) {
      throw new Error(`Weather forecast failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Weather forecast returned error');
    }
    
    console.log('✅ Weather Forecast:');
    console.log(`   Predictions: ${data.data.predictions.length} days`);
    console.log(`   First day: ${data.data.predictions[0].toFixed(1)}°C`);
    console.log(`   Last day: ${data.data.predictions[13].toFixed(1)}°C`);
    console.log(`   Confidence: ${(data.confidence_score * 100).toFixed(1)}%`);
    console.log(`   Model: ${data.model_version}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Weather forecast failed: ${error.message}`);
    return false;
  }
}

// Test 3: Yield Forecast
async function testYieldForecast() {
  console.log('\n🌾 Testing Yield Forecast...');
  
  try {
    const response = await fetch(`${TIMESFM_API_URL}/forecast/yield`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        field_id: 'test_field_123',
        crop_type: 'rice',
        historical_yield: [12, 13, 14, 15, 16],
        vegetation_indices: {
          ndvi: 0.7,
          ndmi: 0.4,
          msavi2: 0.5,
          rvi: 0.6,
          ndre: 0.4
        },
        location: { lat: 30.9010, lng: 75.8573 },
        horizon: 30
      })
    });
    
    if (!response.ok) {
      throw new Error(`Yield forecast failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Yield forecast returned error');
    }
    
    console.log('✅ Yield Forecast:');
    console.log(`   Predictions: ${data.data.predictions.length} days`);
    console.log(`   Expected Yield: ${data.data.expected_yield.toFixed(1)} quintals/acre`);
    console.log(`   Base Yield: ${data.data.base_yield.toFixed(1)} quintals/acre`);
    console.log(`   Confidence: ${(data.confidence_score * 100).toFixed(1)}%`);
    console.log(`   Model: ${data.model_version}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Yield forecast failed: ${error.message}`);
    return false;
  }
}

// Test 4: Market Forecast
async function testMarketForecast() {
  console.log('\n💰 Testing Market Forecast...');
  
  try {
    const response = await fetch(`${TIMESFM_API_URL}/forecast/market`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commodity: 'rice',
        historical_prices: [2000, 2100, 2200, 2300, 2400],
        horizon: 30
      })
    });
    
    if (!response.ok) {
      throw new Error(`Market forecast failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Market forecast returned error');
    }
    
    console.log('✅ Market Forecast:');
    console.log(`   Predictions: ${data.data.predictions.length} days`);
    console.log(`   First price: ₹${data.data.predictions[0].toFixed(0)}`);
    console.log(`   Last price: ₹${data.data.predictions[29].toFixed(0)}`);
    console.log(`   Volatility: ${(data.data.volatility * 100).toFixed(1)}%`);
    console.log(`   Trend: ${data.data.trend}`);
    console.log(`   Confidence: ${(data.confidence_score * 100).toFixed(1)}%`);
    
    return true;
  } catch (error) {
    console.log(`❌ Market forecast failed: ${error.message}`);
    return false;
  }
}

// Test 5: Comprehensive Forecast
async function testComprehensiveForecast() {
  console.log('\n🎯 Testing Comprehensive Forecast...');
  
  try {
    const response = await fetch(`${TIMESFM_API_URL}/forecast/comprehensive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        field_id: 'test_field_123',
        crop_type: 'rice',
        historical_data: [12, 13, 14, 15, 16],
        horizon: 14,
        location: { lat: 30.9010, lng: 75.8573 }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Comprehensive forecast failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Comprehensive forecast returned error');
    }
    
    console.log('✅ Comprehensive Forecast:');
    console.log(`   Weather: ${data.data.weather ? 'Success' : 'Failed'}`);
    console.log(`   Yield: ${data.data.yield ? 'Success' : 'Failed'}`);
    console.log(`   Market: ${data.data.market ? 'Success' : 'Failed'}`);
    console.log(`   Model: ${data.model_version}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Comprehensive forecast failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running Real TimesFM Integration Tests\n');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Weather Forecast', fn: testWeatherForecast },
    { name: 'Yield Forecast', fn: testYieldForecast },
    { name: 'Market Forecast', fn: testMarketForecast },
    { name: 'Comprehensive Forecast', fn: testComprehensiveForecast }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      console.log(`\n${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      results.push({ name: test.name, passed: false });
      console.log(`\n❌ ${test.name}: FAILED - ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Real TimesFM integration is working!');
    console.log('🌟 You now have REAL TimesFM models running in Docker!');
  } else {
    console.log('⚠️  Some tests failed. Check the TimesFM service logs.');
  }
  
  return results;
}

// Run tests
runAllTests().catch(console.error);

