-- Weather and Price Data Infrastructure Migration
-- Anand Saathi - Phase 1: Data Infrastructure Foundation

-- Weather and Price Data Infrastructure Migration
-- Anand Saathi - Phase 1: Data Infrastructure Foundation

-- Weather Stations Table
CREATE TABLE IF NOT EXISTS weather_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district VARCHAR(100) NOT NULL,
  station_name VARCHAR(200),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  provider VARCHAR(50) DEFAULT 'openweather',
  openweather_city_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  last_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Weather Readings Table
CREATE TABLE IF NOT EXISTS weather_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES weather_stations(id),
  reading_date DATE NOT NULL,
  reading_time TIME NOT NULL,
  temperature DECIMAL(5,2),    -- °C
  feels_like DECIMAL(5,2),     -- °C
  humidity DECIMAL(5,2),      -- 0-100%
  pressure DECIMAL(6,1),      -- hPa
  wind_speed DECIMAL(5,2),     -- m/s
  wind_direction DECIMAL(5,1), -- degrees
  rainfall_1h DECIMAL(8,2),    -- mm
  rainfall_3h DECIMAL(8,2),    -- mm
  cloud_cover DECIMAL(5,1),   -- 0-100%
  visibility DECIMAL(6,1),    -- meters
  uv_index DECIMAL(3,1),       -- UV index
  dew_point DECIMAL(5,2),      -- °C
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agricultural Prices Table
CREATE TABLE IF NOT EXISTS agricultural_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Punjab',
  district VARCHAR(100) NOT NULL,
  market VARCHAR(200),
  price_date DATE NOT NULL,
  min_price DECIMAL(10,2),     -- ₹/quintal
  max_price DECIMAL(10,2),     -- ₹/quintal
  modal_price DECIMAL(10,2),   -- ₹/quintal
  quantity_arrivals DECIMAL(10,1), -- quintals
  data_source VARCHAR(50) DEFAULT 'apeda',
  quality_grade VARCHAR(50),   -- FAQ, Grade-A, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Community Data Collection Tables
-- =====================================================

-- Data Collection Partners Table
CREATE TABLE IF NOT EXISTS data_collection_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('patwar', 'soil_lab', 'farm_coop', 'gov_office', 'university', 'farmer_group')),
  district VARCHAR(100) NOT NULL,
  contact_info JSONB NOT NULL, -- {name, phone, email, address}
  capabilities TEXT[], -- Array of capabilities
  data_types_provided TEXT[], -- Array of data types
  verification_level VARCHAR(20) DEFAULT 'basic' CHECK (verification_level IN ('none', 'basic', 'verified', 'certified')),
  reliability_score INTEGER DEFAULT 1 CHECK (reliability_score >= 1 AND reliability_score <= 5),
  active BOOLEAN DEFAULT TRUE,
  data_points_submitted INTEGER DEFAULT 0,
  last_submission TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community Farm Data Table
CREATE TABLE IF NOT EXISTS community_farm_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id VARCHAR(100) NOT NULL,
  field_id VARCHAR(100),
  data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('yield', 'soil_test', 'land_record', 'irrigation', 'pest_report', 'subsidy_info')),
  data JSONB NOT NULL, -- Flexible data storage
  submitted_by_partner_id UUID REFERENCES data_collection_partners(id),
  verification_level VARCHAR(20) DEFAULT 'none' CHECK (verification_level IN ('none', 'basic', 'verified', 'certified')),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by VARCHAR(100),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Weather and Price Data Infrastructure Migration
-- Anand Saathi - Phase 1: Data Infrastructure Foundation

-- Weather Stations Table
CREATE TABLE IF NOT EXISTS weather_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district VARCHAR(100) NOT NULL,
  station_name VARCHAR(200),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  provider VARCHAR(50) DEFAULT 'openweather',
  openweather_city_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  last_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Weather Readings Table
CREATE TABLE IF NOT EXISTS weather_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES weather_stations(id),
  reading_date DATE NOT NULL,
  reading_time TIME NOT NULL,
  temperature DECIMAL(5,2),    -- °C
  feels_like DECIMAL(5,2),     -- °C
  humidity DECIMAL(5,2),      -- 0-100%
  pressure DECIMAL(6,1),      -- hPa
  wind_speed DECIMAL(5,2),     -- m/s
  wind_direction DECIMAL(5,1), -- degrees
  rainfall_1h DECIMAL(8,2),    -- mm
  rainfall_3h DECIMAL(8,2),    -- mm
  cloud_cover DECIMAL(5,1),   -- 0-100%
  visibility DECIMAL(6,1),    -- meters
  uv_index DECIMAL(3,1),       -- UV index
  dew_point DECIMAL(5,2),      -- °C
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agricultural Prices Table
CREATE TABLE IF NOT EXISTS agricultural_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Punjab',
  district VARCHAR(100) NOT NULL,
  market VARCHAR(200),
  price_date DATE NOT NULL,
  min_price DECIMAL(10,2),     -- ₹/quintal
  max_price DECIMAL(10,2),     -- ₹/quintal
  modal_price DECIMAL(10,2),   -- ₹/quintal
  quantity_arrivals DECIMAL(10,1), -- quintals
  data_source VARCHAR(50) DEFAULT 'apeda',
  quality_grade VARCHAR(50),   -- FAQ, Grade-A, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weather_readings_station_date ON weather_readings(station_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_weather_readings_district_date ON weather_readings USING btree(reading_date DESC);
CREATE INDEX IF NOT EXISTS idx_agri_prices_commodity_district_date ON agricultural_prices(commodity, district, price_date);
CREATE INDEX IF NOT EXISTS idx_agri_prices_date_commodity ON agricultural_prices(price_date DESC, commodity);

-- =====================================================
-- Historical Data Lake Tables
-- =====================================================

-- Historical Datasets Table
CREATE TABLE IF NOT EXISTS historical_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_name VARCHAR(255) NOT NULL,
  data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('yield_history', 'weather_history', 'price_history', 'soil_tests', 'land_records', 'irrigation_data')),
  source VARCHAR(50) NOT NULL CHECK (source IN ('community_submission', 'government_data', 'research_institution', 'market_feed')),
  time_range_start TIMESTAMP NOT NULL,
  time_range_end TIMESTAMP NOT NULL,
  district VARCHAR(100), -- Optional, for district-specific datasets
  record_count INTEGER NOT NULL,
  total_size_mb DECIMAL(10,2) NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW(),
  data_format VARCHAR(20) DEFAULT 'json' CHECK (data_format IN ('json', 'csv', 'parquet', 'compressed_json')),
  retention_policy VARCHAR(50) DEFAULT 'monthly_archive',
  access_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  compression_ratio DECIMAL(5,2), -- compression savings percentage
  storage_location TEXT, -- Cloud storage path/URL
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional dataset metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community data indexes
CREATE INDEX IF NOT EXISTS idx_community_data_farmer_type ON community_farm_data(farmer_id, data_type);
CREATE INDEX IF NOT EXISTS idx_community_data_partner ON community_farm_data(submitted_by_partner_id);
CREATE INDEX IF NOT EXISTS idx_community_data_status ON community_farm_data(verification_status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_partners_district_type ON data_collection_partners(district, type);

-- Historical data indexes
CREATE INDEX IF NOT EXISTS idx_historical_datasets_type ON historical_datasets(data_type);
CREATE INDEX IF NOT EXISTS idx_historical_datasets_time_range ON historical_datasets(time_range_start, time_range_end);
CREATE INDEX IF NOT EXISTS idx_historical_datasets_district ON historical_datasets(district);
CREATE INDEX IF NOT EXISTS idx_historical_datasets_source ON historical_datasets(source);
CREATE INDEX IF NOT EXISTS idx_historical_datasets_last_updated ON historical_datasets(last_updated DESC);

-- Insert Punjab district weather stations with OpenWeather city IDs (only if not exists)
INSERT INTO weather_stations (district, station_name, latitude, longitude, provider, openweather_city_id, is_active)
VALUES
('ludhiana', 'Ludhiana Weather Station', 30.9008, 75.8573, 'openweather', 1264728, TRUE),
('amritsar', 'Amritsar Weather Station', 31.6339, 74.8723, 'openweather', 1278607, TRUE),
('patiala', 'Patiala Weather Station', 30.3398, 76.3869, 'openweather', 1260107, TRUE),
('sangrur', 'Sangrur Weather Station', 30.2458, 75.8365, 'openweather', 1257771, TRUE),
('bathinda', 'Bathinda Weather Station', 30.2102, 74.9455, 'openweather', 1276070, TRUE),
('jalandhar', 'Jalandhar Weather Station', 31.3256, 75.5792, 'openweather', 1268771, TRUE),
('ferozepur', 'Ferozepur Weather Station', 30.9331, 74.6131, 'openweather', 1259749, TRUE),
('faridkot', 'Faridkot Weather Station', 30.6765, 74.7558, 'openweather', 1271881, TRUE)
ON CONFLICT (district) DO NOTHING;
