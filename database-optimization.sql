-- Database Performance Optimization for Anand Saathi
-- Add indexes for better query performance and RLS policies for security

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_fields_crop_type ON fields(crop_type);
CREATE INDEX IF NOT EXISTS idx_fields_planting_date ON fields(planting_date);
CREATE INDEX IF NOT EXISTS idx_fields_expected_harvest_date ON fields(expected_harvest_date);
CREATE INDEX IF NOT EXISTS idx_fields_status ON fields(status);

-- Create indexes for satellite analyses
CREATE INDEX IF NOT EXISTS idx_satellite_analyses_field_id ON satellite_analyses(field_id);
CREATE INDEX IF NOT EXISTS idx_satellite_analyses_user_id ON satellite_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_satellite_analyses_analysis_date ON satellite_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_satellite_analyses_health_status ON satellite_analyses(health_status);
CREATE INDEX IF NOT EXISTS idx_satellite_analyses_ndvi_value ON satellite_analyses(ndvi_value);

-- Create indexes for recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_field_id ON recommendations(field_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON recommendations(category);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Create indexes for farms
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_location ON farms(location);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for farms
CREATE POLICY "Users can view their own farms" ON farms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farms" ON farms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms" ON farms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms" ON farms
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for fields
CREATE POLICY "Users can view their own fields" ON fields
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fields" ON fields
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fields" ON fields
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fields" ON fields
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for satellite analyses
CREATE POLICY "Users can view their own analyses" ON satellite_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON satellite_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for recommendations
CREATE POLICY "Users can view their own recommendations" ON recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations" ON recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for user dashboard data (for performance)
CREATE OR REPLACE VIEW user_dashboard_data AS
SELECT
    p.user_id,
    COUNT(DISTINCT f.id) as total_fields,
    COUNT(DISTINCT farm.id) as total_farms,
    SUM(f.area_hectares) as total_area_hectares,
    COUNT(CASE WHEN sa.health_status = 'excellent' THEN 1 END) as excellent_fields,
    COUNT(CASE WHEN sa.health_status = 'good' THEN 1 END) as good_fields,
    COUNT(CASE WHEN r.priority = 'critical' THEN 1 END) as critical_recommendations,
    MAX(sa.analysis_date) as last_analysis_date
FROM profiles p
LEFT JOIN farms farm ON farm.user_id = p.user_id
LEFT JOIN fields f ON f.farm_id = farm.id
LEFT JOIN satellite_analyses sa ON sa.field_id = f.id AND sa.analysis_date >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN recommendations r ON r.field_id = f.id AND r.created_at >= CURRENT_DATE - INTERVAL '7 days'
WHERE p.user_id = auth.uid()
GROUP BY p.user_id;

-- Create a view for field analytics (for performance)
CREATE OR REPLACE VIEW field_analytics AS
SELECT
    f.id as field_id,
    f.name as field_name,
    f.crop_type,
    f.area_hectares,
    f.planting_date,
    f.expected_harvest_date,
    AVG(sa.ndvi_value) as avg_ndvi,
    AVG(sa.msavi2_value) as avg_msavi2,
    AVG(sa.ndmi_value) as avg_ndmi,
    MAX(sa.analysis_date) as last_analysis_date,
    COUNT(sa.id) as analysis_count,
    string_agg(DISTINCT sa.health_status, ', ') as health_trends,
    string_agg(DISTINCT sa.crop_stage, ', ') as crop_stages
FROM fields f
LEFT JOIN satellite_analyses sa ON sa.field_id = f.id
WHERE f.user_id = auth.uid()
GROUP BY f.id, f.name, f.crop_type, f.area_hectares, f.planting_date, f.expected_harvest_date;

-- Grant necessary permissions
GRANT SELECT ON user_dashboard_data TO authenticated;
GRANT SELECT ON field_analytics TO authenticated;

-- Create a function for field health scoring
CREATE OR REPLACE FUNCTION calculate_field_health_score(field_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    avg_ndvi DECIMAL(5,3);
    avg_ndmi DECIMAL(5,3);
    recent_analyses INTEGER;
    health_score DECIMAL(5,2);
BEGIN
    -- Get recent analysis data for the field
    SELECT
        AVG(ndvi_value),
        AVG(ndmi_value),
        COUNT(*)
    INTO avg_ndvi, avg_ndmi, recent_analyses
    FROM satellite_analyses
    WHERE field_id = field_uuid
    AND analysis_date >= CURRENT_DATE - INTERVAL '30 days';

    -- If no recent data, return neutral score
    IF recent_analyses = 0 THEN
        RETURN 0.50;
    END IF;

    -- Calculate health score based on NDVI and NDMI
    -- NDVI > 0.7 = excellent, 0.5-0.7 = good, 0.3-0.5 = fair, < 0.3 = poor
    -- NDMI > 0.3 = good moisture, 0.1-0.3 = moderate, < 0.1 = dry

    health_score := CASE
        WHEN avg_ndvi > 0.7 AND avg_ndmi > 0.3 THEN 0.95
        WHEN avg_ndvi > 0.5 AND avg_ndmi > 0.1 THEN 0.80
        WHEN avg_ndvi > 0.3 THEN 0.60
        ELSE 0.30
    END;

    RETURN health_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for automated recommendations
CREATE OR REPLACE FUNCTION generate_automated_recommendations(field_uuid UUID)
RETURNS TABLE (
    recommendation_type TEXT,
    priority TEXT,
    title TEXT,
    description TEXT,
    estimated_cost DECIMAL(10,2)
) AS $$
DECLARE
    field_record RECORD;
    health_score DECIMAL(5,2);
    current_month INTEGER;
BEGIN
    -- Get field information
    SELECT * INTO field_record FROM fields WHERE id = field_uuid;

    -- Get health score
    health_score := calculate_field_health_score(field_uuid);
    current_month := EXTRACT(MONTH FROM CURRENT_DATE);

    -- Generate recommendations based on health score and crop type
    RETURN QUERY
    SELECT
        'fertilizer'::TEXT as recommendation_type,
        'high'::TEXT as priority,
        'Nitrogen Application Needed'::TEXT as title,
        'Field shows signs of nitrogen deficiency. Apply urea fertilizer.'::TEXT as description,
        2500.00::DECIMAL(10,2) as estimated_cost
    WHERE health_score < 0.5 AND field_record.crop_type IN ('rice', 'wheat');

    RETURN QUERY
    SELECT
        'irrigation'::TEXT as recommendation_type,
        'medium'::TEXT as priority,
        'Irrigation Schedule'::TEXT as title,
        'Current moisture levels indicate irrigation needed within 3 days.'::TEXT as description,
        800.00::DECIMAL(10,2) as estimated_cost
    WHERE health_score < 0.6;

    RETURN QUERY
    SELECT
        'harvest'::TEXT as recommendation_type,
        'high'::TEXT as priority,
        'Harvest Preparation'::TEXT as title,
        'Crop has reached maturity stage. Prepare for harvest.'::TEXT as description,
        1500.00::DECIMAL(10,2) as estimated_cost
    WHERE field_record.crop_type = 'rice' AND current_month IN (10, 11);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
