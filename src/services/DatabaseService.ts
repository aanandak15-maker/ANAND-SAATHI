/**
 * Database Service
 * Centralized database schema and operations for all data types
 */

import { supabase } from '@/integrations/supabase/client';

// ===== DATABASE SCHEMA TYPES =====

export interface DatabaseField {
  id: string;
  user_id: string;
  name: string;
  crop_type: string;
  area_acres: number;
  latitude: number;
  longitude: number;
  boundary_coords?: any;
  soil_type?: string;
  soil_ph?: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSensor {
  id: string;
  field_id: string;
  sensor_type: string;
  device_id: string;
  status: 'active' | 'inactive' | 'error';
  last_reading: number;
  last_reading_time: string;
  battery_level?: number;
  created_at: string;
}

export interface DatabaseSensorReading {
  id: string;
  sensor_id: string;
  value: number;
  unit: string;
  timestamp: string;
  metadata?: any;
}

export interface DatabaseGovernmentRecord {
  id: string;
  user_id: string;
  farmer_id: string;
  record_type: string;
  document_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  record_data: any;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseForecast {
  id: string;
  field_id: string;
  forecast_type: 'yield' | 'market' | 'weather';
  predictions: number[];
  confidence_intervals?: number[][];
  confidence_score: number;
  model_version: string;
  generated_at: string;
  valid_until: string;
  metadata?: any;
}

export interface DatabaseVegetationAnalysis {
  id: string;
  field_id: string;
  analysis_date: string;
  ndvi: number;
  ndmi: number;
  msavi2: number;
  ndre: number;
  evi: number;
  health_status: string;
  satellite_image_url?: string;
  metadata?: any;
  created_at: string;
}

// ===== DATABASE SERVICE CLASS =====

export class DatabaseService {
  // ===== FIELD OPERATIONS =====
  
  static async createField(field: Omit<DatabaseField, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase
      .from('fields')
      .insert([field])
      .select()
      .single();
  }

  static async getFields(userId: string) {
    return await supabase
      .from('fields')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  static async getField(id: string) {
    return await supabase
      .from('fields')
      .select('*')
      .eq('id', id)
      .single();
  }

  static async updateField(id: string, updates: Partial<DatabaseField>) {
    return await supabase
      .from('fields')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }

  static async deleteField(id: string) {
    return await supabase
      .from('fields')
      .delete()
      .eq('id', id);
  }

  // ===== SENSOR OPERATIONS =====

  static async createSensor(sensor: Omit<DatabaseSensor, 'id' | 'created_at'>) {
    return await supabase
      .from('sensors')
      .insert([sensor])
      .select()
      .single();
  }

  static async getSensors(fieldId: string) {
    return await supabase
      .from('sensors')
      .select('*')
      .eq('field_id', fieldId);
  }

  static async updateSensor(id: string, updates: Partial<DatabaseSensor>) {
    return await supabase
      .from('sensors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  static async addSensorReading(reading: Omit<DatabaseSensorReading, 'id'>) {
    return await supabase
      .from('sensor_readings')
      .insert([reading])
      .select()
      .single();
  }

  static async getSensorReadings(sensorId: string, limit = 100) {
    return await supabase
      .from('sensor_readings')
      .select('*')
      .eq('sensor_id', sensorId)
      .order('timestamp', { ascending: false })
      .limit(limit);
  }

  // ===== GOVERNMENT RECORDS OPERATIONS =====

  static async createGovernmentRecord(record: Omit<DatabaseGovernmentRecord, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase
      .from('government_records')
      .insert([record])
      .select()
      .single();
  }

  static async getGovernmentRecords(userId: string) {
    return await supabase
      .from('government_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  static async updateGovernmentRecord(id: string, updates: Partial<DatabaseGovernmentRecord>) {
    return await supabase
      .from('government_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }

  // ===== FORECAST OPERATIONS =====

  static async createForecast(forecast: Omit<DatabaseForecast, 'id'>) {
    return await supabase
      .from('forecasts')
      .insert([forecast])
      .select()
      .single();
  }

  static async getForecasts(fieldId: string, type?: string) {
    let query = supabase
      .from('forecasts')
      .select('*')
      .eq('field_id', fieldId);
    
    if (type) {
      query = query.eq('forecast_type', type);
    }
    
    return await query.order('generated_at', { ascending: false });
  }

  static async getLatestForecast(fieldId: string, type: string) {
    return await supabase
      .from('forecasts')
      .select('*')
      .eq('field_id', fieldId)
      .eq('forecast_type', type)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();
  }

  // ===== VEGETATION ANALYSIS OPERATIONS =====

  static async createVegetationAnalysis(analysis: Omit<DatabaseVegetationAnalysis, 'id' | 'created_at'>) {
    return await supabase
      .from('vegetation_analysis')
      .insert([analysis])
      .select()
      .single();
  }

  static async getVegetationAnalysis(fieldId: string, limit = 30) {
    return await supabase
      .from('vegetation_analysis')
      .select('*')
      .eq('field_id', fieldId)
      .order('analysis_date', { ascending: false })
      .limit(limit);
  }

  static async getLatestVegetationAnalysis(fieldId: string) {
    return await supabase
      .from('vegetation_analysis')
      .select('*')
      .eq('field_id', fieldId)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();
  }
}
