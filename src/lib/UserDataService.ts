/**
 * User Data Service
 * Handles data persistence for the complete user journey
 * Saves and loads user progress across all steps
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserJourneyData {
  language?: string;
  basicInfo?: {
    name: string;
    phone: string;
    email?: string;
    farmSize?: number;
    experience?: string;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  fieldData?: {
    fieldId: string;
    name: string;
    area: number;
    cropType: string;
    cropVariety?: string;
    plantingDate?: string;
    boundary: any;
    centerPoint: { lat: number; lng: number };
  };
  soilAnalysis?: {
    ph: number;
    organicCarbon: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    recommendations: any[];
    healthScore: number;
  };
  yieldPrediction?: {
    predictedYield: number;
    confidence: number;
    factors: string[];
    recommendations: any[];
    riskAssessment: any;
  };
  marketAnalysis?: {
    currentPrice: number;
    priceTrend: string;
    marketRecommendations: any[];
    sellingAdvice: any[];
  };
  iotData?: {
    devices: any[];
    sensorData: any[];
    alerts: any[];
  };
  governmentData?: {
    pmKisanSchemes: any[];
    punjabSchemes: any[];
    eligibility: any[];
  };
  finalAnalysis?: {
    comprehensiveReport: any;
    recommendations: any[];
    actionPlan: any[];
    nextSteps: any[];
  };
}

export class UserDataService {
  /**
   * Save user data for a specific step
   */
  static async saveUserData(userId: string, stepData: {
    step: string;
    data: any;
    completed_at: string;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_journey_data')
        .upsert({
          user_id: userId,
          step: stepData.step,
          data: stepData.data,
          completed_at: stepData.completed_at,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving user data:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in saveUserData:', error);
      throw error;
    }
  }

  /**
   * Load user progress for a specific user
   */
  static async loadUserProgress(userId: string): Promise<UserJourneyData | null> {
    try {
      const { data, error } = await supabase
        .from('user_journey_data')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('Error loading user progress:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Transform the data into the expected format
      const userData: UserJourneyData = {};
      
      data.forEach((item: any) => {
        switch (item.step) {
          case 'language':
            userData.language = item.data;
            break;
          case 'basicInfo':
            userData.basicInfo = item.data;
            break;
          case 'location':
            userData.location = item.data;
            break;
          case 'fieldData':
            userData.fieldData = item.data;
            break;
          case 'soilAnalysis':
            userData.soilAnalysis = item.data;
            break;
          case 'yieldPrediction':
            userData.yieldPrediction = item.data;
            break;
          case 'marketAnalysis':
            userData.marketAnalysis = item.data;
            break;
          case 'iotData':
            userData.iotData = item.data;
            break;
          case 'governmentData':
            userData.governmentData = item.data;
            break;
          case 'finalAnalysis':
            userData.finalAnalysis = item.data;
            break;
        }
      });

      return userData;
    } catch (error) {
      console.error('Error in loadUserProgress:', error);
      return null;
    }
  }

  /**
   * Save complete user journey data
   */
  static async saveCompleteJourney(userId: string, journeyData: UserJourneyData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_complete_journey')
        .upsert({
          user_id: userId,
          journey_data: journeyData,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving complete journey:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in saveCompleteJourney:', error);
      throw error;
    }
  }

  /**
   * Load complete user journey data
   */
  static async loadCompleteJourney(userId: string): Promise<UserJourneyData | null> {
    try {
      const { data, error } = await supabase
        .from('user_complete_journey')
        .select('journey_data')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading complete journey:', error);
        return null;
      }

      return data?.journey_data || null;
    } catch (error) {
      console.error('Error in loadCompleteJourney:', error);
      return null;
    }
  }

  /**
   * Get user journey statistics
   */
  static async getUserJourneyStats(userId: string): Promise<{
    totalSteps: number;
    completedSteps: number;
    completionPercentage: number;
    lastActivity: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('user_journey_data')
        .select('step, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error loading user journey stats:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return {
          totalSteps: 11,
          completedSteps: 0,
          completionPercentage: 0,
          lastActivity: 'Never'
        };
      }

      const completedSteps = data.length;
      const totalSteps = 11; // Total number of steps in the journey
      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
      const lastActivity = data[0]?.completed_at || 'Never';

      return {
        totalSteps,
        completedSteps,
        completionPercentage,
        lastActivity
      };
    } catch (error) {
      console.error('Error in getUserJourneyStats:', error);
      return null;
    }
  }

  /**
   * Delete user data (for testing or user request)
   */
  static async deleteUserData(userId: string): Promise<boolean> {
    try {
      // Delete journey data
      const { error: journeyError } = await supabase
        .from('user_journey_data')
        .delete()
        .eq('user_id', userId);

      if (journeyError) {
        console.error('Error deleting journey data:', journeyError);
        return false;
      }

      // Delete complete journey data
      const { error: completeError } = await supabase
        .from('user_complete_journey')
        .delete()
        .eq('user_id', userId);

      if (completeError) {
        console.error('Error deleting complete journey data:', completeError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUserData:', error);
      return false;
    }
  }

  /**
   * Export user data (for backup or analysis)
   */
  static async exportUserData(userId: string): Promise<UserJourneyData | null> {
    try {
      const journeyData = await this.loadUserProgress(userId);
      const completeJourneyData = await this.loadCompleteJourney(userId);
      
      // Merge both data sources
      const exportedData: UserJourneyData = {
        ...journeyData,
        ...completeJourneyData
      };

      return exportedData;
    } catch (error) {
      console.error('Error in exportUserData:', error);
      return null;
    }
  }

  /**
   * Get all users (for admin purposes)
   */
  static async getAllUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_journey_data')
        .select('user_id, step, completed_at')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error loading all users:', error);
        return [];
      }

      // Group by user_id
      const usersMap = new Map();
      data.forEach((item: any) => {
        if (!usersMap.has(item.user_id)) {
          usersMap.set(item.user_id, {
            user_id: item.user_id,
            steps: [],
            last_activity: item.completed_at
          });
        }
        usersMap.get(item.user_id).steps.push(item.step);
      });

      return Array.from(usersMap.values());
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }
}

// Fallback to localStorage if Supabase is not available
export class LocalUserDataService {
  private static STORAGE_KEY = 'anand-saathi-user-data';

  static async saveUserData(userId: string, stepData: {
    step: string;
    data: any;
    completed_at: string;
  }): Promise<any> {
    try {
      const existingData = this.getStoredData();
      const userData = existingData[userId] || {};
      
      userData[stepData.step] = {
        data: stepData.data,
        completed_at: stepData.completed_at
      };

      existingData[userId] = userData;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  static async loadUserProgress(userId: string): Promise<UserJourneyData | null> {
    try {
      const existingData = this.getStoredData();
      const userData = existingData[userId];
      
      if (!userData) {
        return null;
      }

      // Transform the data into the expected format
      const journeyData: UserJourneyData = {};
      
      Object.keys(userData).forEach(step => {
        switch (step) {
          case 'language':
            journeyData.language = userData[step].data;
            break;
          case 'basicInfo':
            journeyData.basicInfo = userData[step].data;
            break;
          case 'location':
            journeyData.location = userData[step].data;
            break;
          case 'fieldData':
            journeyData.fieldData = userData[step].data;
            break;
          case 'soilAnalysis':
            journeyData.soilAnalysis = userData[step].data;
            break;
          case 'yieldPrediction':
            journeyData.yieldPrediction = userData[step].data;
            break;
          case 'marketAnalysis':
            journeyData.marketAnalysis = userData[step].data;
            break;
          case 'iotData':
            journeyData.iotData = userData[step].data;
            break;
          case 'governmentData':
            journeyData.governmentData = userData[step].data;
            break;
          case 'finalAnalysis':
            journeyData.finalAnalysis = userData[step].data;
            break;
        }
      });

      return journeyData;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  private static getStoredData(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error parsing stored data:', error);
      return {};
    }
  }
}

// Use LocalUserDataService as fallback
export default UserDataService;
