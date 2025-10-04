import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ErrorHandler, ErrorRecovery, AppError } from '@/utils/errorHandling';
import { useAppStore } from '@/store';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface RequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retryCount?: number;
  timeout?: number;
  showLoading?: boolean;
  showError?: boolean;
}

export abstract class EnhancedBaseService {
  protected api: AxiosInstance;
  protected baseUrl: string;
  protected retryCount: number = 3;
  protected timeout: number = 30000;

  constructor(baseUrl: string, config?: Partial<RequestConfig>) {
    this.baseUrl = baseUrl;
    this.retryCount = config?.retryCount || 3;
    this.timeout = config?.timeout || 30000;

    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const { showLoading = true } = config as RequestConfig;
        
        if (showLoading) {
          useAppStore.getState().setLoading(true);
        }

        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = crypto.randomUUID();

        return config;
      },
      (error) => {
        useAppStore.getState().setLoading(false);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        const { showLoading = true } = response.config as RequestConfig;
        
        if (showLoading) {
          useAppStore.getState().setLoading(false);
        }

        return response;
      },
      async (error) => {
        const { showLoading = true, showError = true } = error.config as RequestConfig || {};
        
        if (showLoading) {
          useAppStore.getState().setLoading(false);
        }

        // Handle error
        const appError = ErrorHandler.handleApiError(error);
        
        if (showError) {
          useAppStore.getState().setError(ErrorHandler.toStoreError(appError));
        }

        // Check if we should retry
        if (this.shouldRetry(error, appError)) {
          return this.retryRequest(error.config, appError);
        }

        return Promise.reject(appError);
      }
    );
  }

  private shouldRetry(error: any, appError: AppError): boolean {
    const { retry = true, retryCount = 0 } = error.config as RequestConfig || {};
    
    if (!retry || retryCount >= this.retryCount) {
      return false;
    }

    return ErrorHandler.isRetryable(appError);
  }

  private async retryRequest(config: any, appError: AppError): Promise<any> {
    const retryCount = (config.retryCount || 0) + 1;
    const delay = ErrorHandler.getRetryDelay(appError, retryCount);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Update retry count
    config.retryCount = retryCount;
    
    // Retry the request
    return this.api.request(config);
  }

  protected getAuthToken(): string | null {
    // Get token from store or localStorage
    const user = useAppStore.getState().user;
    return user ? 'mock-token' : null; // Replace with actual token logic
  }

  // Enhanced HTTP methods with error handling and retry logic
  protected async get<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<ApiResponse<T>>(endpoint, config);
      return this.handleResponse(response);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<ApiResponse<T>>(endpoint, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<ApiResponse<T>>(endpoint, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  protected async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch<ApiResponse<T>>(endpoint, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  protected async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(endpoint, config);
      return this.handleResponse(response);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
    const { data } = response;
    
    if (!data.success) {
      throw new AppError(
        data.message || 'Request failed',
        'API_ERROR',
        response.status,
        data,
        data.message || 'Something went wrong'
      );
    }

    return data;
  }

  // Utility methods for common patterns
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    return ErrorRecovery.retry(operation, maxAttempts);
  }

  protected async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    return ErrorRecovery.withFallback(primaryOperation, fallbackOperation);
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { 
        timeout: 5000,
        showLoading: false,
        showError: false 
      });
      return true;
    } catch {
      return false;
    }
  }

  // Batch request method
  async batchRequest<T>(
    requests: Array<() => Promise<T>>,
    concurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: AppError[] = [];

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(request => request())
        );
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            const error = ErrorHandler.handleApiError(result.reason);
            errors.push(error);
            results.push(null as any); // Placeholder for failed requests
          }
        });
      } catch (error) {
        const appError = ErrorHandler.handleApiError(error);
        errors.push(appError);
      }
    }

    if (errors.length > 0) {
      // Log errors but don't throw - let caller handle partial results
      console.warn('Batch request completed with errors:', errors);
    }

    return results;
  }
}
