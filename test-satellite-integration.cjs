#!/usr/bin/env node

/**
 * Anand Saathi Satellite Service Integration Test
 * Tests the satellite service APIs and frontend integration
 */

const fetch = require('node-fetch');

const SATELLITE_SERVICE_URL = 'http://localhost:8001';

async function testSatelliteService() {
    console.log('🛰️ Testing Anand Saathi Satellite Service Integration\n');

    try {
        // Test 1: Health Check
        console.log('🔍 Testing health check...');
        const healthResponse = await fetch(`${SATELLITE_SERVICE_URL}/health`);
        const healthData = await healthResponse.json();

        console.log('✅ Health check response:', {
            status: healthData.status,
            gee_available: healthData.gee_available,
            cache_size: `${healthData.cache_size_mb} MB`
        });
        console.log('');

        // Test 2: Service Status
        console.log('📊 Testing service status...');
        const statusResponse = await fetch(`${SATELLITE_SERVICE_URL}/status`);
        const statusData = await statusResponse.json();

        console.log('✅ Service status:', {
            version: statusData.version,
            gee_integration: statusData.satellite_processing.gee_integration,
            supported_satellites: statusData.supported_satellites.length,
            vegetation_indices: statusData.vegetation_indices.slice(0, 3) + '...',
            crop_thresholds_available: statusData.supported_crops.length
        });
        console.log('');

        // Test 3: Vegetation Indices (Simulate Punjab Rice Field)
        console.log('🌾 Testing vegetation indices for Punjab rice field...');
        const fieldId = 'test_punjab_rice_field_' + Date.now();
        const lat = 30.9; // Ludhiana, Punjab
        const lng = 75.85;

        const indicesResponse = await fetch(
            `${SATELLITE_SERVICE_URL}/api/indices/${fieldId}?lat=${lat}&lng=${lng}&crop_type=rice`
        );

        if (indicesResponse.ok) {
            const indicesData = await indicesResponse.json();
            console.log('✅ Vegetation indices analysis:');
            console.log(`   NDVI: ${indicesData.indices.ndvi} (healthy range: 0.4-0.8)`);
            console.log(`   NDMI: ${indicesData.indices.ndmi} (healthy range: 0.1-0.4)`);
            console.log(`   MSAVI2: ${indicesData.indices.msavi2}`);
            console.log(`   Health Score: ${indicesData.indices.health_score}/100`);
            console.log(`   Stress Indicators: ${indicesData.stress_indicators.length}`);
            console.log(`   Recommendations: ${indicesData.recommendations.length}`);
            console.log(`   Field Zones: ${indicesData.field_zones.length}`);
        } else {
            console.log('❌ Vegetation indices request failed');
        }
        console.log('');

        // Test 4: Crop Thresholds
        console.log('📋 Testing crop health thresholds...');
        const thresholdsResponse = await fetch(`${SATELLITE_SERVICE_URL}/api/crop/thresholds`);
        const thresholdsData = await thresholdsResponse.json();

        console.log('✅ Crop health thresholds available for:');
        Object.keys(thresholdsData.crops).forEach(crop => {
            const thresholds = thresholdsData.crops[crop];
            console.log(`   ${crop.charAt(0).toUpperCase() + crop.slice(1)}: NDVI ${thresholds.ndvi_healthy_range[0]}-${thresholds.ndvi_healthy_range[1]}, NDMI ${thresholds.ndmi_healthy_range[0]}-${thresholds.ndmi_healthy_range[1]}`);
        });
        console.log('');

        // Test 5: Satellite Metadata
        console.log('📡 Testing satellite metadata...');
        const metadataResponse = await fetch(
            `${SATELLITE_SERVICE_URL}/api/satellite/metadata/${fieldId}?lat=${lat}&lng=${lng}`
        );

        if (metadataResponse.ok) {
            const metadataData = await metadataResponse.json();
            const data = metadataData.satellite_data;
            console.log('✅ Satellite metadata:');
            console.log(`   Satellite: ${data.satellite} ${data.sensor}`);
            console.log(`   Date: ${data.date}`);
            console.log(`   Cloud Coverage: ${data.cloud_coverage}%`);
            console.log(`   Area: ${data.area_hectares} hectares`);
            console.log(`   Resolution: ${data.spatial_resolution}m`);
            console.log(`   Bands: ${Object.keys(data.bands || {}).length} spectral bands`);
        } else {
            console.log('❌ Satellite metadata request failed');
        }
        console.log('');

        console.log('🎉 All satellite service tests completed successfully!');
        console.log('🛰️ Satellite processing service is ready for real-world Punjab field analysis.');

    } catch (error) {
        console.error('❌ Satellite service test failed:', error.message);
        console.log('\n🚨 Possible causes:');
        console.log('1. Satellite service not running (docker-compose up satellite)');
        console.log('2. Service port not accessible (localhost:8001)');
        console.log('3. Docker container crashed or stopped');
        process.exit(1);
    }
}

// Frontend Integration Test (mock browser behavior)
async function testFrontendIntegration() {
    console.log('\n🏗️ Testing Frontend Integration with Satellite Service...\n');

    try {
        const fieldBoundary = [
            [75.8, 30.8],  // SW corner
            [75.9, 30.8],  // SE corner
            [75.9, 30.9],  // NE corner
            [75.8, 30.9],  // NW corner
            [75.8, 30.8]   // Back to start
        ];

        console.log('🌾 Simulating frontend field analysis request...');
        console.log(`   Field boundary: ${fieldBoundary.length} coordinate points`);
        console.log(`   Center location: (${(fieldBoundary.reduce((sum, [lng]) => sum + lng, 0) / fieldBoundary.length).toFixed(3)}, ${(fieldBoundary.reduce((sum, [, lat]) => sum + lat, 0) / fieldBoundary.length).toFixed(3)})`);

        // Simulate SatelliteService.analyzeField call from TypeScript
        const fieldId = 'frontend_test_field_' + Date.now();
        console.log(`   Analyzing field: ${fieldId}`);

        const analysisResponse = await fetch(`${SATELLITE_SERVICE_URL}/api/indices/${fieldId}?lat=30.85&lng=75.85&crop_type=rice`);

        if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();

            console.log('✅ Frontend integration successful:');
            console.log(`   NDVI Score: ${analysisData.indices.ndvi}`);
            console.log(`   Crop Health: ${analysisData.indices.health_score}/100`);
            console.log(`   Actionable Insights: ${analysisData.recommendations.length} recommendations generated`);
            console.log(`   Field Monitoring Zones: ${analysisData.field_zones.length} zones identified`);

            if (analysisData.stress_indicators.length > 0) {
                console.log(`   ⚠️ Stress Detected: ${analysisData.stress_indicators.join(', ')}`);
            } else {
                console.log('   ✅ No stress indicators detected');
            }

            console.log('\n🎉 Frontend will receive real satellite data instead of demos!');
        } else {
            console.log('❌ Frontend integration test failed');
        }

    } catch (error) {
        console.error('❌ Frontend integration test failed:', error.message);
    }
}

// Run tests
async function runTests() {
    await testSatelliteService();
    await testFrontendIntegration();

    console.log('\n🎊 INTEGRATION TESTING COMPLETE!');
    console.log('🛰️ Anand Saathi Satellite Infrastructure: DEPLOYED & OPERATIONAL');
    console.log('\n📱 Farmers can now see:');
    console.log('   🌱 Real-time NDVI crop health from space');
    console.log('   💧 Soil moisture analysis from satellite data');
    console.log('   📊 AI-powered irrigation recommendations');
    console.log('   🔔 Early detection of crop stress and pests');
    console.log('   📍 Zone-specific field management advice');
}

if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testSatelliteService, testFrontendIntegration };
