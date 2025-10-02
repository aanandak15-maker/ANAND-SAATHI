/**
 * Google Earth Engine Service
 * Real satellite imagery integration for vegetation analysis
 */

import { BaseService, ApiResponse } from './BaseService';

export interface GEEConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export interface FieldGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][];
}

export interface SatelliteImageRequest {
  fieldId: string;
  geometry: FieldGeometry;
  startDate: string;
  endDate: string;
  cloudCover?: number;
  satellite?: 'LANDSAT' | 'SENTINEL' | 'MODIS';
}

export interface SatelliteImage {
  id: string;
  fieldId: string;
  acquisitionDate: string;
  cloudCover: number;
  satellite: string;
  bands: {
    red: number;
    green: number;
    blue: number;
    nir: number;
    swir1?: number;
    swir2?: number;
  };
  vegetationIndices: {
    ndvi: number;
    ndmi: number;
    msavi2: number;
    evi: number;
    ndre?: number;
  };
  healthStatus: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  thumbnailUrl?: string;
  metadata: {
    resolution: number;
    provider: string;
    processingLevel: string;
  };
}

export class GEEService extends BaseService {
  private config: GEEConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    super('/api'); // Base URL for GEE API endpoints
    this.initializeConfig();
  }

  private initializeConfig() {
    const projectId = import.meta.env.VITE_GEE_PROJECT_ID;
    const privateKey = import.meta.env.VITE_GEE_PRIVATE_KEY;
    const clientEmail = import.meta.env.VITE_GEE_CLIENT_EMAIL;

    if (projectId && privateKey && clientEmail) {
      this.config = {
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail
      };
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    if (!this.config) {
      throw new Error('GEE configuration not available');
    }

    try {
      // In a real implementation, this would authenticate with Google Cloud
      // For now, we'll use a simplified approach
      const response = await fetch('/api/gee/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: this.config.projectId,
          privateKey: this.config.privateKey,
          clientEmail: this.config.clientEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData = await response.json();
      this.accessToken = authData.accessToken;
      this.tokenExpiry = new Date(Date.now() + authData.expiresIn * 1000);

      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSatelliteImages(request: SatelliteImageRequest): Promise<ApiResponse<SatelliteImage[]>> {
    try {
      if (!this.config) {
        return {
          success: false,
          error: 'Google Earth Engine configuration not available. Please check your API keys.',
        };
      }

      const token = await this.getAccessToken();

      const response = await fetch('/api/gee/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          geometry: request.geometry,
          startDate: request.startDate,
          endDate: request.endDate,
          cloudCover: request.cloudCover || 20,
          satellite: request.satellite || 'SENTINEL',
        }),
      });

      if (!response.ok) {
        throw new Error(`GEE API request failed: ${response.statusText}`);
      }

      const images = await response.json();

      return {
        success: true,
        data: images.map((img: any) => ({
          id: img.id,
          fieldId: request.fieldId,
          acquisitionDate: img.acquisitionDate,
          cloudCover: img.cloudCover,
          satellite: img.satellite,
          bands: img.bands,
          vegetationIndices: img.vegetationIndices,
          healthStatus: img.healthStatus,
          thumbnailUrl: img.thumbnailUrl,
          metadata: img.metadata,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch satellite images',
      };
    }
  }

  async calculateVegetationIndices(
    fieldId: string,
    imageId: string
  ): Promise<ApiResponse<{
    indices: {
      ndvi: number;
      ndmi: number;
      msavi2: number;
      evi: number;
      ndre?: number;
    };
    healthScore: number;
    recommendations: string[];
  }>> {
    try {
      if (!this.config) {
        return {
          success: false,
          error: 'Google Earth Engine configuration not available',
        };
      }

      const token = await this.getAccessToken();

      const response = await fetch(`/api/gee/indices/${imageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate vegetation indices: ${response.statusText}`);
      }

      const analysis = await response.json();

      return {
        success: true,
        data: {
          indices: analysis.indices,
          healthScore: analysis.healthScore,
          recommendations: analysis.recommendations,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate vegetation indices',
      };
    }
  }

  async getFieldTimeSeries(
    fieldId: string,
    geometry: FieldGeometry,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{
    dates: string[];
    ndvi: number[];
    ndmi: number[];
    healthStatus: string[];
  }>> {
    try {
      if (!this.config) {
        return {
          success: false,
          error: 'Google Earth Engine configuration not available',
        };
      }

      const token = await this.getAccessToken();

      const response = await fetch('/api/gee/timeseries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fieldId,
          geometry,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get time series: ${response.statusText}`);
      }

      const timeSeries = await response.json();

      return {
        success: true,
        data: timeSeries,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get field time series',
      };
    }
  }

  // Fallback method for when GEE is not available
  private getFallbackVegetationAnalysis(): {
    indices: {
      ndvi: number;
      ndmi: number;
      msavi2: number;
      evi: number;
    };
    healthScore: number;
    recommendations: string[];
  } {
    const baseNdvi = 0.6 + Math.random() * 0.3; // 0.6-0.9 range for healthy crops

    return {
      indices: {
        ndvi: baseNdvi,
        ndmi: 0.3 + Math.random() * 0.4,
        msavi2: baseNdvi * 0.8,
        evi: baseNdvi * 1.2,
      },
      healthScore: Math.round(baseNdvi * 100),
      recommendations: [
        'Monitor crop regularly',
        'Ensure adequate irrigation',
        'Check for pest infestations',
        'Consider soil testing',
      ],
    };
  }
}

export const geeService = new GEEService();
