# 🌍 Real Google Earth Engine API Setup Guide

This guide will help you switch from simulation to real Google Earth Engine API calls for accurate satellite analysis.

## 🚀 Quick Start

Run these commands to set up real GEE integration:

```bash
# 1. Set up GEE service account
npm run setup-real-gee

# 2. Deploy the function to Supabase
npm run deploy-gee-function

# 3. Test the integration
npm run test-gee-integration
```

## 📋 Prerequisites

### 1. Google Cloud Platform Account
- [Create GCP Account](https://console.cloud.google.com/)
- Enable billing (required for Earth Engine)

### 2. Google Earth Engine Access
- [Request Earth Engine Access](https://earthengine.google.com/)
- Wait for approval (1-2 business days)

### 3. Supabase Project
- [Create Supabase Project](https://supabase.com/)
- Enable Edge Functions

## 🔧 Detailed Setup Steps

### Step 1: Create GEE Service Account

1. **Go to Google Cloud Console**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Earth Engine API**
   - Go to APIs & Services > Library
   - Search for "Earth Engine API"
   - Click "Enable"

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name: `soil-saathi-gee-service`
   - Description: `Service account for Soil Saathi GEE analysis`

4. **Grant Permissions**
   - Role: `Earth Engine Resource Viewer`
   - Click "Create and Continue"

5. **Generate Key**
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" format
   - Download the key file

### Step 2: Register with Earth Engine

1. **Register Service Account**
   - Go to [Earth Engine Cloud Console](https://console.cloud.google.com/apis/api/earthengine.googleapis.com/)
   - Register your service account email with Earth Engine
   - Wait for approval

2. **Test Access** (Optional)
   ```bash
   pip install earthengine-api
   earthengine authenticate --service_account_file path/to/service-account-key.json
   earthengine ls
   ```

### Step 3: Configure Environment Variables

1. **Run Setup Script**
   ```bash
   npm run setup-real-gee
   ```

2. **Manual Configuration** (if needed)
   Create `.env.local` file:
   ```bash
   GEE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GEE_PROJECT_ID=your-gcp-project-id
   GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content here...\n-----END PRIVATE KEY-----"
   ```

3. **Set Supabase Environment Variables**
   In your Supabase project dashboard:
   - Go to Settings > Edge Functions
   - Add environment variables:
     - `GEE_SERVICE_ACCOUNT_EMAIL`
     - `GEE_PROJECT_ID`
     - `GEE_PRIVATE_KEY`

### Step 4: Deploy Function

```bash
npm run deploy-gee-function
```

This will:
- Replace the simulation function with real GEE integration
- Deploy to Supabase Edge Functions
- Set up proper error handling and fallbacks

### Step 5: Test Integration

```bash
npm run test-gee-integration
```

## 🧪 Testing Your Setup

### 1. Manual Testing
1. Start development server: `npm run dev`
2. Go to field mapper
3. Create a field boundary
4. Check browser console for GEE API responses

### 2. Expected Results
- **Real GEE Data**: If service account is properly configured
- **Enhanced Simulation**: If GEE is not available (fallback)
- **Vegetation Indices**: NDVI, MSAVI2, NDRE, NDMI, RVI
- **Crop Analysis**: Stage, health status, water stress
- **Recommendations**: Field-specific advice with costs

### 3. Verification
Look for these in the console:
```
✅ Real GEE API response: {...}
✅ Analysis completed with real satellite data
✅ Field-specific recommendations generated
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Service account not registered"
- Ensure service account is registered with Earth Engine
- Wait for Google's approval (1-2 business days)
- Check service account email is correct

#### 2. "Authentication failed"
- Verify private key format in environment variables
- Check that `\n` characters are preserved in private key
- Ensure service account email matches

#### 3. "Quota exceeded"
- Monitor Earth Engine usage in GCP console
- Implement caching for repeated requests
- Consider upgrading GCP plan

#### 4. "Function deployment failed"
- Check Supabase CLI is installed: `npm install -g supabase`
- Login to Supabase: `supabase login`
- Link your project: `supabase link`

### Debug Mode

Set environment variable for detailed logging:
```bash
GEE_DEBUG=true
```

## 📊 What You Get with Real GEE

### Real Satellite Data
- **Sentinel-2 imagery** at 10m resolution
- **Current vegetation indices** from actual satellite data
- **Cloud cover information** for data quality
- **Pixel-level analysis** of your field

### Enhanced Analysis
- **Field-specific recommendations** based on real data
- **Cost calculations** for fertilizers and irrigation
- **ROI estimates** for interventions
- **Timeline guidance** for optimal actions

### Professional Quality
- **High accuracy** satellite analysis
- **Real-time data** from current satellite passes
- **Scientific-grade** vegetation indices
- **Production-ready** recommendations

## 💰 Cost Considerations

### Google Earth Engine
- **Free tier**: 1 million pixels per month
- **Paid plans**: For commercial use
- **Monitoring**: Set up billing alerts

### Supabase Functions
- **Pay per invocation**: ~$0.0000025 per request
- **Optimization**: Implement caching for repeated calls

### Data Transfer
- **Minimal costs** for typical field sizes
- **Optimization**: Use appropriate analysis scales

## 🚀 Advanced Features

### Custom Satellite Collections
Modify the function to use different satellites:
- **Landsat 8/9**: `LANDSAT/LC08/C02/T1_L2`
- **MODIS**: `MODIS/061/MOD13Q1`
- **Planet Labs**: Contact Planet for API access

### Additional Indices
Add more vegetation indices:
- **EVI**: Enhanced Vegetation Index
- **SAVI**: Soil Adjusted Vegetation Index
- **GNDVI**: Green Normalized Difference Vegetation Index

### Time Series Analysis
Implement historical trend analysis by modifying date ranges and aggregation logic.

## 📞 Support

### Google Earth Engine
- [Earth Engine Documentation](https://developers.google.com/earth-engine/)
- [Community Forum](https://groups.google.com/forum/#!forum/google-earth-engine-developers)

### Supabase Functions
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Support](https://supabase.com/support)

### This Project
- Check function logs in Supabase dashboard
- Review browser console for errors
- Test with different field boundaries

## ✅ Success Checklist

- [ ] GCP account created and billing enabled
- [ ] Earth Engine access approved
- [ ] Service account created with GEE permissions
- [ ] Service account registered with Earth Engine
- [ ] Environment variables configured
- [ ] Supabase function deployed
- [ ] Integration tested successfully
- [ ] Real satellite data flowing
- [ ] Recommendations generated
- [ ] Cost monitoring set up

## 🎯 Next Steps

After successful setup:

1. **Monitor Usage**: Track GEE API calls and costs
2. **Optimize Performance**: Implement caching for repeated requests
3. **Scale Up**: Add more satellite collections and indices
4. **User Training**: Educate users on real vs simulated data
5. **Documentation**: Update user guides with real data features

---

**🎉 Congratulations!** You now have real Google Earth Engine integration providing accurate satellite analysis for your farmers!
