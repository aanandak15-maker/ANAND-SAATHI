#!/usr/bin/env node

/**
 * Test Google Earth Engine API Key
 */

const GEE_API_KEY = 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0';
const GEE_BASE_URL = 'https://earthengine.googleapis.com/v1';

async function testGEEAPIKey() {
  console.log('🧪 Testing Google Earth Engine API Key...');
  console.log(`API Key: ${GEE_API_KEY.substring(0, 20)}...`);
  
  try {
    // Test with a simple request to check if the API key works
    const testRequest = {
      expression: {
        "result": {
          "constantValue": "Hello from Earth Engine!"
        }
      },
      fileFormat: 'JSON'
    };

    console.log('📡 Making test request to GEE API...');
    
    const response = await fetch(`${GEE_BASE_URL}/value:compute?key=${GEE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ GEE API Key is working!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ GEE API Key test failed');
      console.log('Error:', errorText);
      
      if (response.status === 403) {
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if the API key is valid');
        console.log('2. Ensure Earth Engine API is enabled in your GCP project');
        console.log('3. Verify the API key has proper permissions');
      }
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify the API endpoint is accessible');
    console.log('3. Check for firewall or proxy issues');
  }
}

// Test with a real vegetation analysis request
async function testVegetationAnalysis() {
  console.log('\n🌱 Testing Vegetation Analysis...');
  
  try {
    const testBoundary = {
      type: 'Polygon',
      coordinates: [[[77.5946, 12.9716], [77.5956, 12.9716], [77.5956, 12.9726], [77.5946, 12.9726], [77.5946, 12.9716]]]
    };

    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const analysisRequest = {
      expression: {
        "result": {
          "functionName": "Image.reduceRegion",
          "functionInvocationValue": {
            "functionName": "ImageCollection.median",
            "functionInvocationValue": {
              "functionName": "ImageCollection.filterDate",
              "functionInvocationValue": {
                "functionName": "ImageCollection.filterBounds",
                "functionInvocationValue": {
                  "constantValue": "COPERNICUS/S2_SR"
                },
                "arguments": {
                  "geometry": {
                    "constantValue": testBoundary
                  }
                }
              },
              "arguments": {
                "start": {
                  "constantValue": startDate.toISOString().split('T')[0]
                },
                "end": {
                  "constantValue": endDate.toISOString().split('T')[0]
                }
              }
            }
          },
          "arguments": {
            "reducer": {
              "constantValue": "mean"
            },
            "geometry": {
              "constantValue": testBoundary
            },
            "scale": {
              "constantValue": 10
            }
          }
        }
      },
      fileFormat: 'JSON'
    };

    console.log('📡 Making vegetation analysis request...');
    
    const response = await fetch(`${GEE_BASE_URL}/value:compute?key=${GEE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisRequest)
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Vegetation analysis successful!');
      console.log('Results:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Vegetation analysis failed');
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.log('❌ Vegetation analysis error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testGEEAPIKey();
  await testVegetationAnalysis();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. If tests pass, your API key is working correctly');
  console.log('2. Start your development server: npm run dev');
  console.log('3. Test field mapping with real satellite data');
  console.log('4. Check browser console for GEE API responses');
}

runTests().catch(console.error);
