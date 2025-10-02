/**
 * Weather API Service for Anand Saathi
 * Real-time and historical weather data from OpenWeather API
 * Stored in Supabase database for caching and offline access
 */

import { ApiResponse } from '../BaseService';
import { supabase } from '../../../integrations/supabase/client';

export interface PunjabDistrict {
  name: string;
  cityId: number;
  latitude: number;
  longitude: number;
}

export interface WeatherReading {
  id?: string;
  station_id: string;
  reading_date: string;
  reading_time: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  rainfall_1h: number;
  rainfall_3h: number;
  cloud_cover: number;
  visibility: number;
  pressure: number;
  uv_index: number;
  dew_point: number;
}

export const punjabDistricts: PunjabDistrict[] = [
  { name: 'Ludhiana', cityId: 1264728, latitude: 30.9008, longitude: 75.8573 },
  { name: 'Amritsar', cityId: 1278607, latitude: 31.6339, longitude: 74.8723 },
  { name: 'Patiala', cityId: 1260107, latitude: 30.3398, longitude: 76.3869 },
  { name: 'Sangrur', cityId: 1257771, latitude: 30.2458, longitude: 75.8365 },
  { name: 'Bathinda', cityId: 1276070, latitude: 30.2102, longitude: 74.9455 },
  { name: 'Jalandhar', cityId: 1268771, latitude: 31.3256, longitude: 75.5792 },
  { name: 'Ferozepur', cityId: 1259749, latitude: 30.9331, longitude: 74.6131 },
  { name: 'Faridkot', cityId: 1271881, latitude: 30.6765, longitude: 74.7558 },
];

export class WeatherAPIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = '623822e31715b644264f0f606c4a9952'; // Provided OpenWeather API key
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  /**
   * Initialize Punjab district weather stations if they don't exist
   */
  async initializeWeatherStations(): Promise<ApiResponse<boolean>> {
    try {
      // Check if stations already exist
      const { count } = await supabase
        .from('weather_stations')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) {
        return {
          success: true,
          data: true,
          message: 'Weather stations already initialized'
        };
      }

      // Insert all Punjab districts
      const stationsToInsert = punjabDistricts.map(district => ({
        district: district.name.toLowerCase(),
        station_name: `${district.name} Weather Station`,
        latitude: district.latitude,
        longitude: district.longitude,
        provider: 'openweather',
        openweather_city_id: district.cityId,
        is_active: true
      }));

      const { error } = await supabase
        .from('weather_stations')
        .insert(stationsToInsert);

      if (error) {
        throw new Error(`Failed to initialize weather stations: ${error.message}`);
      }

      return {
        success: true,
        data: true,
        message: 'Weather stations initialized successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to initialize weather stations: ${error.message}`
      };
    }
  }

  /**
   * Get current weather for a Punjab district
   */
  async getCurrentWeather(district: string): Promise<ApiResponse<WeatherReading>> {
    try {
      // Get station info
      const { data: station, error: stationError } = await supabase
        .from('weather_stations')
        .select('*')
        .eq('district', district.toLowerCase())
        .eq('is_active', true)
        .single();

      if (stationError || !station) {
        throw new Error(`Weather station not found for district: ${district}`);
      }

      // Check if we have recent data (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const { data: recentReading } = await supabase
        .from('weather_readings')
        .select('*')
        .eq('station_id', station.id)
        .gte('created_at', thirtyMinutesAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentReading && recentReading.length > 0) {
        return {
          success: true,
          data: recentReading[0],
          message: 'Using cached weather data'
        };
      }

      // Fetch from OpenWeather API
      const response = await fetch(
        `${this.baseUrl}/weather?id=${station.openweather_city_id}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
      }

      const weatherData = await response.json();
      const weatherReading = this.transformWeatherData(weatherData, station.id);

      // Store in database
      await this.storeWeatherReading(weatherReading);

      return {
        success: true,
        data: weatherReading
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch weather data: ${error.message}`
      };
    }
  }

  /**
   * Get weather forecast for a district
   */
  async getWeatherForecast(district: string, days: number = 5): Promise<ApiResponse<WeatherReading[]>> {
    try {
      const { data: station, error: stationError } = await supabase
        .from('weather_stations')
        .select('*')
        .eq('district', district.toLowerCase())
        .single();

      if (stationError || !station) {
        throw new Error(`Weather station not found for district: ${district}`);
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?id=${station.openweather_city_id}&appid=${this.apiKey}&units=metric&cnt=${Math.min(days * 8, 40)}`
      );

      if (!response.ok) {
        throw new Error(`OpenWeather forecast API error: ${response.status} ${response.statusText}`);
      }

      const forecastData = await response.json();
      const forecasts = this.transformForecastData(forecastData.list, station.id);

      // Store forecast readings
      for (const forecast of forecasts) {
        await this.storeWeatherReading(forecast);
      }

      return {
        success: true,
        data: forecasts
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch weather forecast: ${error.message}`
      };
    }
  }

  /**
   * Get historical weather data from database
   */
  async getHistoricalWeather(
    district: string,
    days: number = 7
  ): Promise<ApiResponse<WeatherReading[]>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('weather_readings')
        .select(`
          weather_readings.*,
          weather_stations.district
        `)
        .eq('weather_stations.district', district.toLowerCase())
        .gte('reading_date', startDate.toISOString().split('T')[0])
        .join('weather_stations', 'weather_readings.station_id', 'weather_stations.id')
        .order('reading_date', { ascending: false })
        .order('reading_time', { ascending: false })
        .limit(500);

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch historical weather: ${error.message}`
      };
    }
  }

  /**
   * Get weather analytics for a district
   */
  async getWeatherAnalytics(district: string, days: number = 30): Promise<ApiResponse<any>> {
    try {
      const historicalData = await this.getHistoricalWeather(district, days);

      if (!historicalData.success || !historicalData.data || historicalData.data.length === 0) {
        return {
          success: false,
          error: 'No historical weather data available'
        };
      }

      const readings = historicalData.data;
      const temperatures = readings.map(r => r.temperature).filter(t => t != null);
      const humidityValues = readings.map(r => r.humidity).filter(h => h != null);
      const rainfallValues = readings.map(r => r.rainfall_1h || 0);

      return {
        success: true,
        data: {
          district: district,
          period_days: days,
          avg_temperature: temperatures.length > 0 ? Math.round((temperatures.reduce((a, b) => a + b, 0) / temperatures.length) * 10) / 10 : 0,
          min_temperature: temperatures.length > 0 ? Math.min(...temperatures) : 0,
          max_temperature: temperatures.length > 0 ? Math.max(...temperatures) : 0,
          avg_humidity: humidityValues.length > 0 ? Math.round(humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length) : 0,
          total_rainfall: Math.round(rainfallValues.reduce((a, b) => a + b, 0) * 10) / 10,
          data_points: readings.length,
          temperature_trend: this.calculateTrend(temperatures.slice(-7)), // Last 7 days
          rainfall_pattern: rainfallValues.filter(r => r > 0).length > 0 ? 'rainy' : 'dry'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to calculate weather analytics: ${error.message}`
      };
    }
  }

  /**
   * Transform OpenWeather API response
   */
  private transformWeatherData(weatherData: any, stationId: string): WeatherReading {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    return {
      station_id: stationId,
      reading_date: date,
      reading_time: time,
      temperature: Math.round(weatherData.main.temp * 10) / 10,
      feels_like: Math.round(weatherData.main.feels_like * 10) / 10,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      wind_speed: Math.round(weatherData.wind.speed * 10) / 10,
      wind_direction: weatherData.wind.deg,
      rainfall_1h: weatherData.rain?.['1h'] || 0,
      rainfall_3h: weatherData.rain?.['3h'] || 0,
      cloud_cover: weatherData.clouds.all,
      visibility: weatherData.visibility,
      uv_index: 0, // UV index requires separate API call
      dew_point: Math.round((weatherData.main.temp - ((100 - weatherData.main.humidity) / 5)) * 10) / 10,
    };
  }

  /**
   * Transform forecast data
   */
  private transformForecastData(forecastList: any[], stationId: string): WeatherReading[] {
    return forecastList.map(forecast => {
      const dateTime = new Date(forecast.dt * 1000);
      const date = dateTime.toISOString().split('T')[0];
      const time = dateTime.toTimeString().split(' ')[0];

      return {
        station_id: stationId,
        reading_date: date,
        reading_time: time,
        temperature: Math.round(forecast.main.temp * 10) / 10,
        feels_like: Math.round(forecast.main.feels_like * 10) / 10,
        humidity: forecast.main.humidity,
        pressure: forecast.main.pressure,
        wind_speed: Math.round(forecast.wind.speed * 10) / 10,
        wind_direction: forecast.wind.deg,
        rainfall_3h: forecast.rain?.['3h'] || 0,
        cloud_cover: forecast.clouds.all,
        visibility: 10000, // Default visibility for forecast
      };
    });
  }

  /**
   * Store weather reading in Supabase
   */
  private async storeWeatherReading(reading: WeatherReading): Promise<void> {
    try {
      const { error } = await supabase
        .from('weather_readings')
        .upsert(reading, {
          onConflict: 'station_id,reading_date,reading_time'
        });

      if (error) {
        console.error('Failed to store weather reading:', error);
        // Don't throw error here - it's not critical for the API to work
      }
    } catch (error) {
      console.error('Weather storage error:', error);
    }
  }

  /**
   * Calculate trend (simple linear regression slope)
   */
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 3) return 'stable';

    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (Math.abs(slope) < 0.1) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }
}

export const weatherService = new WeatherAPIService();
