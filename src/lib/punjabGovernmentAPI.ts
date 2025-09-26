/**
 * Punjab Government API Integration Service
 * Connects with various Punjab government agricultural services
 * Includes agri.punjab.gov.in, crs-agripunjab, pestwarning-agripunjab, edistrictpb
 */

export interface PunjabGovernmentConfig {
  baseUrls: {
    agriculture: string;
    cropReporting: string;
    pestWarning: string;
    eDistrict: string;
  };
  apiKeys: {
    agriculture?: string;
    cropReporting?: string;
    pestWarning?: string;
    eDistrict?: string;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface CropAdvisory {
  id: string;
  title: string;
  localTitle: string; // Punjabi
  description: string;
  localDescription: string; // Punjabi
  category: 'general' | 'pest' | 'disease' | 'weather' | 'fertilizer' | 'irrigation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  district: string;
  crop: string;
  validFrom: Date;
  validUntil: Date;
  source: string;
  actionItems: string[];
  localActionItems: string[]; // Punjabi
  contactInfo: {
    phone: string;
    email: string;
    office: string;
  };
}

export interface YieldData {
  district: string;
  crop: string;
  variety: string;
  season: 'kharif' | 'rabi' | 'zaid';
  year: number;
  area: number; // hectares
  production: number; // tonnes
  yield: number; // tonnes per hectare
  avgYield: number; // quintals per acre
  price: number; // INR per quintal
  procurement: {
    total: number; // tonnes
    percentage: number;
    price: number; // INR per quintal
  };
}

export interface PestAlert {
  id: string;
  pestName: string;
  localPestName: string; // Punjabi
  crop: string;
  district: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: number; // hectares
  description: string;
  localDescription: string; // Punjabi
  symptoms: string[];
  localSymptoms: string[]; // Punjabi
  controlMeasures: string[];
  localControlMeasures: string[]; // Punjabi
  issuedDate: Date;
  validUntil: Date;
  contactInfo: {
    phone: string;
    email: string;
    office: string;
  };
}

export interface WeatherForecast {
  district: string;
  date: Date;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  conditions: string;
  localConditions: string; // Punjabi
  alerts: string[];
  localAlerts: string[]; // Punjabi
}

export interface GovernmentScheme {
  id: string;
  name: string;
  localName: string; // Punjabi
  description: string;
  localDescription: string; // Punjabi
  category: 'subsidy' | 'insurance' | 'loan' | 'training' | 'equipment';
  eligibility: string[];
  localEligibility: string[]; // Punjabi
  benefits: string[];
  localBenefits: string[]; // Punjabi
  applicationProcess: string[];
  localApplicationProcess: string[]; // Punjabi
  documentsRequired: string[];
  localDocumentsRequired: string[]; // Punjabi
  deadline: Date | null;
  contactInfo: {
    phone: string;
    email: string;
    office: string;
    website: string;
  };
  status: 'active' | 'inactive' | 'upcoming';
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: Date;
  source: string;
}

export class PunjabGovernmentAPIService {
  private config: PunjabGovernmentConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  constructor(config: PunjabGovernmentConfig) {
    this.config = config;
  }

  /**
   * Get crop advisories for a specific district and crop
   */
  async getCropAdvisories(
    district: string,
    crop: string = 'rice',
    limit: number = 10
  ): Promise<APIResponse<CropAdvisory[]>> {
    try {
      const url = `${this.config.baseUrls.agriculture}/api/crop-advisories`;
      const params = new URLSearchParams({
        district,
        crop,
        limit: limit.toString(),
        language: 'both' // English and Punjabi
      });

      const response = await this.makeRequest<CropAdvisory[]>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKeys.agriculture}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response,
        error: null,
        timestamp: new Date(),
        source: 'agri.punjab.gov.in'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        source: 'agri.punjab.gov.in'
      };
    }
  }

  /**
   * Get historical yield data for a district and crop
   */
  async getYieldData(
    district: string,
    crop: string = 'rice',
    years: number = 5
  ): Promise<APIResponse<YieldData[]>> {
    try {
      const url = `${this.config.baseUrls.cropReporting}/api/yield-data`;
      const params = new URLSearchParams({
        district,
        crop,
        years: years.toString()
      });

      const response = await this.makeRequest<YieldData[]>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKeys.cropReporting}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response,
        error: null,
        timestamp: new Date(),
        source: 'crs-agripunjab.punjab.gov.pk'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        source: 'crs-agripunjab.punjab.gov.pk'
      };
    }
  }

  /**
   * Get pest alerts for a district and crop
   */
  async getPestAlerts(
    district: string,
    crop: string = 'rice',
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<APIResponse<PestAlert[]>> {
    try {
      const url = `${this.config.baseUrls.pestWarning}/api/pest-alerts`;
      const params = new URLSearchParams({
        district,
        crop,
        language: 'both'
      });

      if (severity) {
        params.append('severity', severity);
      }

      const response = await this.makeRequest<PestAlert[]>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKeys.pestWarning}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response,
        error: null,
        timestamp: new Date(),
        source: 'pestwarning-agripunjab.punjab.gov.pk'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        source: 'pestwarning-agripunjab.punjab.gov.pk'
      };
    }
  }

  /**
   * Get weather forecast for a district
   */
  async getWeatherForecast(
    district: string,
    days: number = 7
  ): Promise<APIResponse<WeatherForecast[]>> {
    try {
      const url = `${this.config.baseUrls.agriculture}/api/weather-forecast`;
      const params = new URLSearchParams({
        district,
        days: days.toString(),
        language: 'both'
      });

      const response = await this.makeRequest<WeatherForecast[]>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKeys.agriculture}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response,
        error: null,
        timestamp: new Date(),
        source: 'agri.punjab.gov.in'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        source: 'agri.punjab.gov.in'
      };
    }
  }

  /**
   * Get government schemes available for farmers
   */
  async getGovernmentSchemes(
    category?: 'subsidy' | 'insurance' | 'loan' | 'training' | 'equipment',
    status: 'active' | 'inactive' | 'upcoming' = 'active'
  ): Promise<APIResponse<GovernmentScheme[]>> {
    try {
      const url = `${this.config.baseUrls.eDistrict}/api/government-schemes`;
      const params = new URLSearchParams({
        status,
        language: 'both'
      });

      if (category) {
        params.append('category', category);
      }

      const response = await this.makeRequest<GovernmentScheme[]>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKeys.eDistrict}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response,
        error: null,
        timestamp: new Date(),
        source: 'edistrictpb'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        source: 'edistrictpb'
      };
    }
  }

  /**
   * Get PM Kisan status for a farmer
   */
  async getPMKisanStatus(
    aadhaarNumber: string,
    phoneNumber: string
  ): Promise<APIResponse<{
    status: 'registered' | 'not_registered' | 'pending' | 'rejected';
    installments: Array<{
      installment: number;
      amount: number;
      status: 'paid' | 'pending' | 'rejected';
      date: Date;
    }>;
    nextInstallment: Date | null;
  }>> {
    try {
      const url = `${this.config.baseUrls.eDistrict}/api/pm-kisan-status`;
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKeys.eDistrict}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aadhaarNumber,
          phoneNumber
        })
      });

      return {
        success: true,
        data: response,
        error: null,
        timestamp: new Date(),
        source: 'edistrictpb'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        source: 'edistrictpb'
      };
    }
  }

  /**
   * Get crop insurance information
   */
  async getCropInsurance(
    district: string,
    crop: string = 'rice',
    season: 'kharif' | 'rabi' = 'kharif'
  ): Promise<APIResponse<{
    premium: number; // INR per hectare
    sumInsured: number; // INR per hectare
    coverage: number; // percentage
    lastDate: Date;
    companies: Array<{
      name: string;
      premium: number;
      sumInsured: number;
      contactInfo: {
        phone: string;
        email: string;
        office: string;
      };
    }>;
  }>> {
    try {
      const url = `${this.config.baseUrls.agriculture}/api/crop-insurance`;
      const params = new URLSearchParams({
        district,
        crop,
        season
      });

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKeys.agriculture}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response,
        error: null,
        timestamp: new Date(),
        source: 'agri.punjab.gov.in'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        source: 'agri.punjab.gov.in'
      };
    }
  }

  /**
   * Make HTTP request with rate limiting and error handling
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const response = await fetch(url, options);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }

      // Rate limiting: wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000 / this.config.rateLimits.requestsPerMinute));
    }

    this.isProcessing = false;
  }

  /**
   * Get API health status
   */
  async getAPIHealth(): Promise<{
    agriculture: boolean;
    cropReporting: boolean;
    pestWarning: boolean;
    eDistrict: boolean;
  }> {
    const healthChecks = await Promise.allSettled([
      this.makeRequest(`${this.config.baseUrls.agriculture}/health`, { method: 'GET' }),
      this.makeRequest(`${this.config.baseUrls.cropReporting}/health`, { method: 'GET' }),
      this.makeRequest(`${this.config.baseUrls.pestWarning}/health`, { method: 'GET' }),
      this.makeRequest(`${this.config.baseUrls.eDistrict}/health`, { method: 'GET' })
    ]);

    return {
      agriculture: healthChecks[0].status === 'fulfilled',
      cropReporting: healthChecks[1].status === 'fulfilled',
      pestWarning: healthChecks[2].status === 'fulfilled',
      eDistrict: healthChecks[3].status === 'fulfilled'
    };
  }
}

// Default configuration
export const defaultPunjabGovernmentConfig: PunjabGovernmentConfig = {
  baseUrls: {
    agriculture: 'https://agri.punjab.gov.in/api/v1',
    cropReporting: 'https://crs-agripunjab.punjab.gov.pk/api/v1',
    pestWarning: 'https://pestwarning-agripunjab.punjab.gov.pk/api/v1',
    eDistrict: 'https://edistrictpb.gov.in/api/v1'
  },
  apiKeys: {
    agriculture: import.meta.env.VITE_PUNJAB_AGRI_API_KEY || '',
    cropReporting: import.meta.env.VITE_PUNJAB_CRS_API_KEY || '',
    pestWarning: import.meta.env.VITE_PUNJAB_PEST_API_KEY || '',
    eDistrict: import.meta.env.VITE_PUNJAB_EDISTRICT_API_KEY || ''
  },
  rateLimits: {
    requestsPerMinute: 30,
    requestsPerHour: 1000
  }
};

// Create singleton instance
export const punjabGovernmentAPI = new PunjabGovernmentAPIService(defaultPunjabGovernmentConfig);

export default PunjabGovernmentAPIService;
