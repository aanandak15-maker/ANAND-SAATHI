#!/usr/bin/env node

/**
 * Field Creation and Analysis Workflow Test
 * This script tests the complete field creation and analysis workflow
 */

const fs = require('fs');

// Test field data
const testFields = [
  {
    name: "Bihar Rice Field",
    location: "Nalanda, Bihar",
    cropType: "rice",
    boundary: {
      coordinates: [[[85.1000, 25.2041], [85.1010, 25.2041], [85.1010, 25.2051], [85.1000, 25.2051], [85.1000, 25.2041]]]
    }
  },
  {
    name: "Punjab Wheat Field",
    location: "Ludhiana, Punjab", 
    cropType: "wheat",
    boundary: {
      coordinates: [[[75.8500, 30.9000], [75.8510, 30.9000], [75.8510, 30.9010], [75.8500, 30.9010], [75.8500, 30.9000]]]
    }
  },
  {
    name: "Karnataka Sugarcane Field",
    location: "Belgaum, Karnataka",
    cropType: "sugarcane", 
    boundary: {
      coordinates: [[[74.5000, 15.8500], [74.5010, 15.8500], [74.5010, 15.8510], [74.5000, 15.8510], [74.5000, 15.8500]]]
    }
  }
];

async function testFieldWorkflow() {
  console.log('🌾 Soil Saathi - Field Workflow Test');
  console.log('='.repeat(40));
  console.log();

  console.log('📋 Test Summary');
  console.log('-'.repeat(15));
  console.log(`Testing ${testFields.length} field scenarios:`);
  testFields.forEach((field, index) => {
    console.log(`${index + 1}. ${field.name} (${field.cropType})`);
  });
  console.log();

  // Test 1: Field Creation Data Validation
  console.log('✅ Test 1: Field Data Validation');
  console.log('-'.repeat(30));
  
  let validFields = 0;
  testFields.forEach((field, index) => {
    const isValid = validateFieldData(field);
    console.log(`Field ${index + 1}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    if (isValid) validFields++;
  });
  
  console.log(`Result: ${validFields}/${testFields.length} fields passed validation`);
  console.log();

  // Test 2: Boundary Area Calculation
  console.log('✅ Test 2: Boundary Area Calculation');
  console.log('-'.repeat(35));
  
  testFields.forEach((field, index) => {
    const area = calculatePolygonArea(field.boundary.coordinates[0]);
    console.log(`Field ${index + 1}: ${area.toFixed(2)} hectares`);
  });
  console.log();

  // Test 3: Analysis Payload Generation
  console.log('✅ Test 3: Analysis Payload Generation');
  console.log('-'.repeat(37));
  
  testFields.forEach((field, index) => {
    const payload = generateAnalysisPayload(field);
    console.log(`Field ${index + 1}: ${payload ? '✅ Generated' : '❌ Failed'}`);
  });
  console.log();

  // Test 4: Expected Recommendations Preview
  console.log('✅ Test 4: Expected Recommendations Preview');
  console.log('-'.repeat(42));
  
  testFields.forEach((field, index) => {
    const recommendations = simulateRecommendations(field);
    console.log(`Field ${index + 1} (${field.cropType}):`);
    recommendations.forEach((rec, recIndex) => {
      console.log(`  ${recIndex + 1}. ${rec.title} (${rec.priority})`);
    });
    console.log();
  });

  // Generate test files
  console.log('📁 Generating Test Files');
  console.log('-'.repeat(25));
  
  // Create test payloads directory
  if (!fs.existsSync('test-payloads')) {
    fs.mkdirSync('test-payloads');
  }

  testFields.forEach((field, index) => {
    const payload = generateAnalysisPayload(field);
    const filename = `test-payloads/field-${index + 1}-${field.cropType}.json`;
    fs.writeFileSync(filename, JSON.stringify(payload, null, 2));
    console.log(`✅ Created: ${filename}`);
  });

  console.log();
  console.log('🚀 Workflow Test Complete!');
  console.log('-'.repeat(25));
  console.log('Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Navigate to the application in your browser');
  console.log('3. Use the demo mode to test field creation');
  console.log('4. Test the GEE analysis with the generated payloads');
  console.log();
  console.log('Test payloads saved in ./test-payloads/ directory');
}

function validateFieldData(field) {
  // Check required fields
  if (!field.name || !field.location || !field.cropType || !field.boundary) {
    return false;
  }

  // Check boundary structure
  if (!field.boundary.coordinates || !Array.isArray(field.boundary.coordinates)) {
    return false;
  }

  // Check coordinate array
  const coords = field.boundary.coordinates[0];
  if (!coords || coords.length < 4) {
    return false;
  }

  // Check if polygon is closed
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return false;
  }

  return true;
}

function calculatePolygonArea(coordinates) {
  if (!coordinates || coordinates.length < 3) return 0;
  
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  
  area = Math.abs(area) / 2;
  // Convert to hectares (rough approximation)
  return Math.max(0.1, area * 111320 * 111320 / 10000);
}

function generateAnalysisPayload(field) {
  try {
    return {
      fieldId: `test-${field.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      boundary: field.boundary,
      cropType: field.cropType,
      analysisDate: new Date().toISOString().split('T')[0],
      metadata: {
        testField: true,
        location: field.location,
        name: field.name
      }
    };
  } catch (error) {
    console.error('Error generating payload for', field.name, ':', error.message);
    return null;
  }
}

function simulateRecommendations(field) {
  const recommendations = [];
  
  // Crop-specific recommendations
  switch (field.cropType) {
    case 'rice':
      recommendations.push({
        title: 'Water Management for Rice',
        priority: 'high',
        category: 'irrigation'
      });
      recommendations.push({
        title: 'Nitrogen Application',
        priority: 'medium', 
        category: 'fertilizer'
      });
      break;
      
    case 'wheat':
      recommendations.push({
        title: 'Rabi Season Fertilizer',
        priority: 'high',
        category: 'fertilizer'
      });
      recommendations.push({
        title: 'Pest Monitoring',
        priority: 'medium',
        category: 'pest_control'
      });
      break;
      
    case 'sugarcane':
      recommendations.push({
        title: 'Drip Irrigation Setup',
        priority: 'high',
        category: 'irrigation'
      });
      recommendations.push({
        title: 'Soil Health Assessment',
        priority: 'medium',
        category: 'soil_health'
      });
      break;
      
    default:
      recommendations.push({
        title: 'General Crop Monitoring',
        priority: 'medium',
        category: 'monitoring'
      });
  }
  
  return recommendations;
}

// Run the test
testFieldWorkflow().catch(console.error);
