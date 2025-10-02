/**
 * Community Data Collection Service for Anand Saathi
 * Collects agricultural data from farmers, cooperatives, labs, and patwars
 * Alternative to government API - builds community-powered data ecosystem
 */

import { ApiResponse } from '../BaseService';
import { supabase } from '../../../integrations/supabase/client';

export interface DataCollectionPartner {
  id?: string;
  name: string;
  type: 'patwar' | 'soil_lab' | 'farm_coop' | 'gov_office' | 'university' | 'farmer_group';
  district: string;
  contact_info: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  capabilities: string[];
  data_types_provided: string[];
  verification_level: 'none' | 'basic' | 'verified' | 'certified';
  reliability_score: number; // 1-5 scale
  active: boolean;
  data_points_submitted: number;
  last_submission?: string;
  created_at?: string;
}

export interface CommunityFarmData {
  id?: string;
  farmer_id: string;
  field_id: string;
  data_type: 'yield' | 'soil_test' | 'land_record' | 'irrigation' | 'pest_report' | 'subsidy_info';
  data: any;
  submitted_by_partner_id?: string;
  verification_level: 'none' | 'basic' | 'verified' | 'certified';
  verification_status: 'pending' | 'verified' | 'rejected';
  submitted_at: string;
  verified_at?: string;
  verified_by?: string;
  quality_score: number; // 1-100 based on completeness and consistency
}

export class CommunityDataService {
  constructor() {}

  /**
   * Register a new data collection partner
   */
  async registerPartner(partner: Omit<DataCollectionPartner, 'id' | 'created_at'>): Promise<ApiResponse<DataCollectionPartner>> {
    try {
      const { data, error } = await supabase
        .from('data_collection_partners')
        .insert([partner])
        .select()
        .single();

      if (error) {
        // Handle unique constraint (trying to register same partner again)
        if (error.code === '23505') {
          return {
            success: false,
            error: 'Partner already registered in this district'
          };
        }
        throw new Error(`Failed to register partner: ${error.message}`);
      }

      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to register partner: ${error.message}`
      };
    }
  }

  /**
   * Get all active partners
   */
  async getPartners(district?: string): Promise<ApiResponse<DataCollectionPartner[]>> {
    try {
      let query = supabase
        .from('data_collection_partners')
        .select('*')
        .eq('active', true)
        .order('reliability_score', { ascending: false })
        .order('created_at', { ascending: false });

      if (district) {
        query = query.eq('district', district);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch partners: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch partners: ${error.message}`
      };
    }
  }

  /**
   * Submit farm data through community network
   */
  async submitFarmData(farmData: Omit<CommunityFarmData, 'id' | 'submitted_at'>): Promise<ApiResponse<CommunityFarmData>> {
    try {
      // Add quality scoring
      const qualityScore = this.calculateDataQualityScore(farmData);

      const dataToSubmit = {
        ...farmData,
        submitted_at: new Date().toISOString(),
        quality_score: qualityScore,
        verification_status: 'pending',
        verification_level: farmData.verification_level || 'none'
      };

      const { data, error } = await supabase
        .from('community_farm_data')
        .insert([dataToSubmit])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit farm data: ${error.message}`);
      }

      // Update partner submission count if submitted through partner
      if (farmData.submitted_by_partner_id) {
        await this.updatePartnerMetrics(farmData.submitted_by_partner_id);
      }

      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to submit farm data: ${error.message}`
      };
    }
  }

  /**
   * Get farmer's submitted data
   */
  async getFarmerData(farmerId: string, dataType?: string): Promise<ApiResponse<CommunityFarmData[]>> {
    try {
      let query = supabase
        .from('community_farm_data')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('submitted_at', { ascending: false });

      if (dataType) {
        query = query.eq('data_type', dataType);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        throw new Error(`Failed to fetch farmer data: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch farmer data: ${error.message}`
      };
    }
  }

  /**
   * Get unverified data for quality assurance review
   */
  async getDataNeedingVerification(district?: string, dataType?: string): Promise<ApiResponse<CommunityFarmData[]>> {
    try {
      let query = supabase
        .from('community_farm_data')
        .select(`
          *,
          data_collection_partners!inner(name, district)
        `)
        .eq('verification_status', 'pending')
        .eq('verification_level', 'basic')
        .order('submitted_at', { ascending: true })
        .limit(50);

      if (district) {
        query = query.eq('data_collection_partners.district', district);
      }

      if (dataType) {
        query = query.eq('data_type', dataType);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch data for verification: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch verification queue: ${error.message}`
      };
    }
  }

  /**
   * Verify and approve submitted data
   */
  async verifyFarmData(dataId: string, verifierId: string, approved: boolean, notes?: string): Promise<ApiResponse<CommunityFarmData>> {
    try {
      const updateData = {
        verification_status: approved ? 'verified' : 'rejected',
        verification_level: approved ? 'verified' : 'none',
        verified_at: new Date().toISOString(),
        verified_by: verifierId
      };

      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('community_farm_data')
        .update(updateData)
        .eq('id', dataId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to verify data: ${error.message}`);
      }

      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to verify data: ${error.message}`
      };
    }
  }

  /**
   * Get district data collection statistics
   */
  async getDistrictStatistics(district: string): Promise<ApiResponse<any>> {
    try {
      // Get partner count
      const { count: partnerCount } = await supabase
        .from('data_collection_partners')
        .select('*', { count: 'exact', head: true })
        .eq('district', district)
        .eq('active', true);

      // Get data submission stats
      const { data: submissions, error: submissionError } = await supabase
        .from('community_farm_data')
        .select('data_type, verification_status, quality_score')
        .eq('farmer_id', '') // We'll need to filter by district - this is simplified
        ;

      if (submissionError) {
        throw new Error(`Failed to fetch statistics: ${submissionError.message}`);
      }

      // Calculate statistics
      const stats = this.calculateSubmissionStats(submissions || []);

      return {
        success: true,
        data: {
          district: district,
          active_partners: partnerCount || 0,
          total_submissions: stats.total,
          verified_submissions: stats.verified,
          pending_verification: stats.pending,
          average_quality_score: stats.avgQuality,
          data_types_breakdown: stats.byType,
          recent_activity: stats.recentActivity
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch district statistics: ${error.message}`
      };
    }
  }

  /**
   * Bulk import historical data from CSV/excel
   */
  async importHistoricalData(file: File, dataType: string, district: string): Promise<ApiResponse<{ imported: number, errors: string[] }>> {
    try {
      const fileData = await file.text();
      const rows = this.parseCsvData(fileData);

      const importedRecords: any[] = [];
      const errors: string[] = [];
      let imported = 0;

      for (let i = 0; i < rows.length; i++) {
        try {
          const record = this.mapHistoricalRecord(rows[i], dataType, district);
          importedRecords.push(record);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      // Bulk insert in chunks
      for (let i = 0; i < importedRecords.length; i += 100) {
        const chunk = importedRecords.slice(i, i + 100);
        const { error } = await supabase
          .from('community_farm_data')
          .insert(chunk);

        if (error) {
          errors.push(`Bulk insert chunk failed: ${error.message}`);
        } else {
          imported += chunk.length;
        }
      }

      return {
        success: true,
        data: {
          imported: imported,
          errors: errors
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to import historical data: ${error.message}`
      };
    }
  }

  /**
   * Update partner metrics after data submission
   */
  private async updatePartnerMetrics(partnerId: string): Promise<void> {
    try {
      const { data: submissions } = await supabase
        .from('community_farm_data')
        .select('id', { count: 'exact' })
        .eq('submitted_by_partner_id', partnerId);

      const submissionCount = submissions?.length || 0;

      await supabase
        .from('data_collection_partners')
        .update({
          data_points_submitted: submissionCount,
          last_submission: new Date().toISOString()
        })
        .eq('id', partnerId);
    } catch (error) {
      console.error('Failed to update partner metrics:', error);
    }
  }

  /**
   * Calculate data quality score based on completeness and consistency
   */
  private calculateDataQualityScore(farmData: Omit<CommunityFarmData, 'id' | 'submitted_at'>): number {
    let score = 50; // Base score

    // Check data completeness
    const requiredFields = this.getRequiredFields(farmData.data_type);
    const providedFields = Object.keys(farmData.data || {});
    const completenessRatio = requiredFields.filter(field => providedFields.includes(field)).length / requiredFields.length;

    score += completenessRatio * 30; // 0-30 points for completeness

    // Check data consistency
    score += this.checkDataConsistency(farmData.data, farmData.data_type) * 20; // 0-20 points for consistency

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get required fields for different data types
   */
  private getRequiredFields(dataType: string): string[] {
    const fieldRequirements: Record<string, string[]> = {
      yield: ['crop_type', 'season', 'yield_kg', 'area_hectares', 'harvest_date'],
      soil_test: ['pH', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter'],
      land_record: ['village', 'khasra_number', 'owner_name', 'area_hectares'],
      irrigation: ['method', 'frequency', 'water_source', 'monthly_usage_volume'],
      pest_report: ['crop_affected', 'pest_type', 'severity', 'treatment_applied'],
      subsidy_info: ['scheme', 'amount_received', 'application_date', 'certificate_issued']
    };

    return fieldRequirements[dataType] || [];
  }

  /**
   * Check data consistency for quality scoring
   */
  private checkDataConsistency(data: any, dataType: string): number {
    if (!data) return 0;

    let consistencyRatio = 1.0;

    // Check value ranges
    if (dataType === 'soil_test') {
      if (data.pH && (data.pH < 0 || data.pH > 14)) consistencyRatio *= 0.5;
      if (data.nitrogen && data.nitrogen < 0) consistencyRatio *= 0.5;
    }

    if (dataType === 'yield') {
      if (data.yield_kg && data.yield_kg < 0) consistencyRatio *= 0.5;
      if (data.area_hectares && data.area_hectares < 0) consistencyRatio *= 0.5;
    }

    return consistencyRatio;
  }

  /**
   * Parse CSV data
   */
  private parseCsvData(csvText: string): any[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',');
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Map historical record from CSV to database format
   */
  private mapHistoricalRecord(row: any, dataType: string, district: string): Omit<CommunityFarmData, 'id' | 'submitted_at'> {
    // This would need to be customized for different data types
    // Simplified example for yield data
    return {
      farmer_id: 'historical_import',
      field_id: row.field_id || 'unknown',
      data_type: dataType as any,
      data: row,
      verification_level: 'basic',
      verification_status: 'verified',
      quality_score: 80 // Assumed quality for historical data
    };
  }

  /**
   * Calculate submission statistics
   */
  private calculateSubmissionStats(submissions: any[]): any {
    const stats = {
      total: submissions.length,
      verified: submissions.filter(s => s.verification_status === 'verified').length,
      pending: submissions.filter(s => s.verification_status === 'pending').length,
      avgQuality: submissions.reduce((sum, s) => sum + s.quality_score, 0) / submissions.length || 0,
      byType: {} as Record<string, number>,
      recentActivity: 0
    };

    // Group by data type
    submissions.forEach(s => {
      stats.byType[s.data_type] = (stats.byType[s.data_type] || 0) + 1;
    });

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    stats.recentActivity = submissions.filter(s =>
      new Date(s.submitted_at).getTime() > sevenDaysAgo
    ).length;

    return stats;
  }
}

export const communityDataService = new CommunityDataService();
