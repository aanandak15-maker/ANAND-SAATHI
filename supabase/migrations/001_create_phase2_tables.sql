-- =====================================================
-- Anand Saathi - Phase 2-4 Database Schema Migration
-- =====================================================
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. SENSORS TABLE (IoT Devices)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    sensor_type VARCHAR(50) NOT NULL CHECK (sensor_type IN ('soil_moisture', 'temperature', 'humidity', 'ph', 'npk', 'light')),
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    last_reading NUMERIC,
    last_reading_time TIMESTAMPTZ,
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_sensors_field_id ON public.sensors(field_id);
CREATE INDEX idx_sensors_status ON public.sensors(status);
CREATE INDEX idx_sensors_device_id ON public.sensors(device_id);

-- Enable Row Level Security
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sensors" ON public.sensors
    FOR SELECT USING (
        field_id IN (
            SELECT id FROM public.fields WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sensors for their fields" ON public.sensors
    FOR INSERT WITH CHECK (
        field_id IN (
            SELECT id FROM public.fields WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own sensors" ON public.sensors
    FOR UPDATE USING (
        field_id IN (
            SELECT id FROM public.fields WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 2. SENSOR_READINGS TABLE (Historical Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
    value NUMERIC NOT NULL,
    unit VARCHAR(20) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for time-series queries
CREATE INDEX idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON public.sensor_readings(timestamp DESC);
CREATE INDEX idx_sensor_readings_composite ON public.sensor_readings(sensor_id, timestamp DESC);

-- Enable RLS
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view readings from their sensors" ON public.sensor_readings
    FOR SELECT USING (
        sensor_id IN (
            SELECT id FROM public.sensors WHERE field_id IN (
                SELECT id FROM public.fields WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- 3. FORECASTS TABLE (AI Predictions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    forecast_type VARCHAR(20) NOT NULL CHECK (forecast_type IN ('yield', 'market', 'weather')),
    predictions NUMERIC[] NOT NULL,
    confidence_intervals NUMERIC[][],
    confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_version VARCHAR(50) NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forecasts_field_id ON public.forecasts(field_id);
CREATE INDEX idx_forecasts_type ON public.forecasts(forecast_type);
CREATE INDEX idx_forecasts_generated_at ON public.forecasts(generated_at DESC);

-- Enable RLS
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view forecasts for their fields" ON public.forecasts
    FOR SELECT USING (
        field_id IN (
            SELECT id FROM public.fields WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert forecasts for their fields" ON public.forecasts
    FOR INSERT WITH CHECK (
        field_id IN (
            SELECT id FROM public.fields WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 4. VEGETATION_ANALYSIS TABLE (Satellite Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vegetation_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    ndvi NUMERIC NOT NULL CHECK (ndvi >= -1 AND ndvi <= 1),
    ndmi NUMERIC NOT NULL CHECK (ndmi >= -1 AND ndmi <= 1),
    msavi2 NUMERIC NOT NULL CHECK (msavi2 >= -1 AND msavi2 <= 1),
    ndre NUMERIC NOT NULL CHECK (ndre >= -1 AND ndre <= 1),
    evi NUMERIC CHECK (evi >= -1 AND evi <= 1),
    savi NUMERIC CHECK (savi >= -1 AND savi <= 1),
    health_status VARCHAR(20) NOT NULL CHECK (health_status IN ('excellent', 'good', 'moderate', 'poor', 'critical')),
    satellite_image_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vegetation_field_id ON public.vegetation_analysis(field_id);
CREATE INDEX idx_vegetation_date ON public.vegetation_analysis(analysis_date DESC);
CREATE INDEX idx_vegetation_health ON public.vegetation_analysis(health_status);

-- Enable RLS
ALTER TABLE public.vegetation_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view vegetation analysis for their fields" ON public.vegetation_analysis
    FOR SELECT USING (
        field_id IN (
            SELECT id FROM public.fields WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert vegetation analysis" ON public.vegetation_analysis
    FOR INSERT WITH CHECK (
        field_id IN (
            SELECT id FROM public.fields WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 5. GOVERNMENT_RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.government_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farmer_id VARCHAR(100) NOT NULL,
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('land_ownership', 'subsidy', 'scheme', 'insurance')),
    document_url TEXT,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    record_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gov_records_user_id ON public.government_records(user_id);
CREATE INDEX idx_gov_records_farmer_id ON public.government_records(farmer_id);
CREATE INDEX idx_gov_records_type ON public.government_records(record_type);
CREATE INDEX idx_gov_records_status ON public.government_records(verification_status);

-- Enable RLS
ALTER TABLE public.government_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own government records" ON public.government_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own government records" ON public.government_records
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own government records" ON public.government_records
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- 6. UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON public.sensors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_records_updated_at BEFORE UPDATE ON public.government_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- Migration Complete!
-- =====================================================
COMMENT ON TABLE public.sensors IS 'IoT sensor devices for real-time monitoring';
COMMENT ON TABLE public.sensor_readings IS 'Historical sensor data readings';
COMMENT ON TABLE public.forecasts IS 'AI-powered predictions for yield, market, and weather';
COMMENT ON TABLE public.vegetation_analysis IS 'Satellite imagery vegetation health analysis';
COMMENT ON TABLE public.government_records IS 'Farmer verification and government integration data';
