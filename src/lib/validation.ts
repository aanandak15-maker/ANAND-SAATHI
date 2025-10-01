/**
 * Zod Validation Schemas for Anand Saathi API
 * Input validation and type safety for all API endpoints
 */

import { z } from 'zod';

// Field validation schema
export const FieldSchema = z.object({
  name: z.string().min(1, 'Field name is required').max(100, 'Field name too long'),
  crop_type: z.enum(['wheat', 'rice', 'maize', 'sugarcane', 'soybean', 'cotton', 'potato', 'tomato', 'other']),
  area_acres: z.number().positive('Area must be positive').max(1000, 'Area too large'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  farm_id: z.number().positive('Farm ID must be positive'),
  soil_type: z.string().optional(),
  soil_ph: z.number().min(0).max(14).optional(),
  planting_date: z.string().optional(),
  expected_harvest: z.string().optional()
});

// Farm validation schema
export const FarmSchema = z.object({
  name: z.string().min(1, 'Farm name is required').max(100, 'Farm name too long'),
  location: z.string().optional(),
  total_area_hectares: z.number().positive('Area must be positive').optional(),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude')
});

// User signup schema
export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(1, 'Display name is required').max(50),
  phone_number: z.string().optional(),
  location: z.string().optional(),
  farm_size_hectares: z.number().positive().optional()
});

// User signin schema
export const SigninSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Field analysis request schema
export const FieldAnalysisSchema = z.object({
  fieldId: z.string().min(1, 'Field ID is required'),
  boundary: z.object({
    coordinates: z.array(z.array(z.array(z.number())))
  }),
  cropType: z.string().optional(),
  analysisDate: z.string().optional()
});

// Weather forecast schema
export const WeatherForecastSchema = z.object({
  fieldId: z.string().min(1, 'Field ID is required'),
  days: z.number().min(1).max(30).default(7)
});

// Market forecast schema
export const MarketForecastSchema = z.object({
  commodity: z.string().min(1, 'Commodity is required'),
  days: z.number().min(1).max(90).default(30)
});

// Type exports for TypeScript
export type FieldInput = z.infer<typeof FieldSchema>;
export type FarmInput = z.infer<typeof FarmSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
export type FieldAnalysisInput = z.infer<typeof FieldAnalysisSchema>;
export type WeatherForecastInput = z.infer<typeof WeatherForecastSchema>;
export type MarketForecastInput = z.infer<typeof MarketForecastSchema>;
