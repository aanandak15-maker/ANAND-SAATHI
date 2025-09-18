# Google Earth Engine Integration Setup Guide

This guide explains how to set up real Google Earth Engine integration for the Soil Saathi platform.

## Prerequisites

1. Google Cloud Platform (GCP) account
2. Google Earth Engine account (https://earthengine.google.com/)
3. Supabase project with edge functions enabled

## Step 1: Create Google Earth Engine Service Account

### 1.1 Enable Earth Engine API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Earth Engine API:
   - Navigate to APIs & Services > Library
   - Search for "Earth Engine API"
   - Click "Enable"

### 1.2 Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Fill in details:
   - Name: `soil-saathi-gee-service`
   - Description: `Service account for Soil Saathi GEE analysis`
4. Grant roles:
   - `Earth Engine Resource Viewer`
   - `Earth Engine Resource Writer` (if needed for advanced features)
5. Click "Create and Continue"

### 1.3 Generate Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Download the key file (keep it secure!)

## Step 2: Register Earth Engine Service Account

### 2.1 Register with Earth Engine
1. Go to [Earth Engine Cloud Console](https://console.cloud.google.com/apis/api/earthengine.googleapis.com/)
2. Register your service account email with Earth Engine
3. Wait for approval (usually takes 1-2 business days)

### 2.2 Test Access
```bash
# Install Earth Engine CLI (optional, for testing)
pip install earthengine-api

# Authenticate with service account
earthengine authenticate --service_account_file path/to/service-account-key.json

# Test access
earthengine ls
```

## Step 3: Configure Supabase Environment Variables

### 3.1 Set Environment Variables
In your Supabase project settings, add these environment variables:

```bash
# Google Earth Engine Configuration
GEE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GEE_PROJECT_ID=your-gcp-project-id
GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content here...\n-----END PRIVATE KEY-----"
```

### 3.2 Extract Private Key from JSON
From your downloaded service account JSON file, extract:
- `client_email` → `GEE_SERVICE_ACCOUNT_EMAIL`
- `project_id` → `GEE_PROJECT_ID`
- `private_key` → `GEE_PRIVATE_KEY`

**Important**: The private key should include the full content with `\n` for line breaks.

## Step 4: Deploy Updated Function

### 4.1 Replace Current Function
```bash
# Navigate to your project
cd /path/to/soil-saathi-compass

# Replace the current implementation
cp supabase/functions/gee-analysis/real-gee-integration.ts supabase/functions/gee-analysis/index.ts

# Deploy the updated function
supabase functions deploy gee-analysis
```

### 4.2 Test the Integration
```bash
# Test the function locally first
supabase functions serve gee-analysis

# Or test with a curl request
curl -X POST 'https://your-project.supabase.co/functions/v1/gee-analysis' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "fieldId": "test-field-id",
    "boundary": {
      "coordinates": [[[77.5946, 12.9716], [77.5956, 12.9716], [77.5956, 12.9726], [77.5946, 12.9726], [77.5946, 12.9716]]]
    },
    "cropType": "rice"
  }'
```

## Step 5: Monitoring and Optimization

### 5.1 Set up Logging
Monitor your function logs in Supabase dashboard to ensure GEE calls are working.

### 5.2 Error Handling
The function will automatically fall back to simulation if GEE credentials are not available or if there's an API error.

### 5.3 Rate Limiting
Google Earth Engine has usage quotas. Monitor your usage in the GCP console.

## Security Best Practices

1. **Never commit service account keys to version control**
2. **Use environment variables for all sensitive data**
3. **Regularly rotate service account keys**
4. **Monitor API usage and set up billing alerts**
5. **Use least privilege principle for service account permissions**

## Troubleshooting

### Common Issues

1. **"Service account not registered"**
   - Ensure your service account is registered with Earth Engine
   - Wait for approval from Google

2. **"Authentication failed"**
   - Check that private key is correctly formatted in environment variables
   - Verify service account email is correct

3. **"Quota exceeded"**
   - Monitor your Earth Engine usage
   - Implement caching for repeated requests
   - Consider upgrading your GCP plan

4. **"Geometry invalid"**
   - Ensure field boundaries are valid GeoJSON polygons
   - Check coordinate order (longitude, latitude)

### Debug Mode
Set environment variable `GEE_DEBUG=true` to enable detailed logging.

## Advanced Features

### Custom Satellite Collections
Modify the `real-gee-integration.ts` to use different satellite collections:
- Landsat 8/9: `LANDSAT/LC08/C02/T1_L2`
- MODIS: `MODIS/061/MOD13Q1`
- Planet Labs: Contact Planet for API access

### Additional Indices
Add more vegetation indices:
- EVI (Enhanced Vegetation Index)
- SAVI (Soil Adjusted Vegetation Index)
- GNDVI (Green Normalized Difference Vegetation Index)

### Time Series Analysis
Implement historical trend analysis by modifying the date range and aggregation logic.

## Support

For issues with Google Earth Engine integration:
1. Check the [Earth Engine Documentation](https://developers.google.com/earth-engine/)
2. Visit the [Earth Engine Community Forum](https://groups.google.com/forum/#!forum/google-earth-engine-developers)
3. Contact support through the Supabase dashboard for function-related issues

## Cost Considerations

- Google Earth Engine: Free tier available, paid plans for commercial use
- Supabase Functions: Pay per invocation
- Data transfer costs may apply for large analysis areas

Monitor costs regularly and implement caching strategies to optimize usage.
