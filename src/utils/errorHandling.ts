import { AppError } from '../store/types';

// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: any,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, context?: any) {
    super(message, 'VALIDATION_ERROR', 400, context, `Please check your input: ${message}`);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed', context?: any) {
    super(message, 'NETWORK_ERROR', 0, context, 'Please check your internet connection and try again');
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: any) {
    super(message, 'AUTH_ERROR', 401, context, 'Please log in again to continue');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: any) {
    super(message, 'AUTHZ_ERROR', 403, context, 'You do not have permission to perform this action');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: any) {
    super(`${resource} not found`, 'NOT_FOUND', 404, context, `The requested ${resource.toLowerCase()} could not be found`);
    this.name = 'NotFoundError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string, context?: any) {
    super(`${service} is currently unavailable`, 'SERVICE_UNAVAILABLE', 503, context, `${service} is temporarily unavailable. Please try again later`);
    this.name = 'ServiceUnavailableError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: any) {
    super(message, 'RATE_LIMIT', 429, context, 'Too many requests. Please wait a moment and try again');
    this.name = 'RateLimitError';
  }
}

// Error handler utility
export class ErrorHandler {
  // Convert various error types to AppError
  static handleApiError(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error.response) {
      // Axios error with response
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return new ValidationError(data?.message || 'Invalid request', undefined, data);
        case 401:
          return new AuthenticationError(data?.message || 'Authentication failed', data);
        case 403:
          return new AuthorizationError(data?.message || 'Access denied', data);
        case 404:
          return new NotFoundError(data?.resource || 'Resource', data);
        case 429:
          return new RateLimitError(data?.message || 'Rate limit exceeded', data);
        case 503:
          return new ServiceUnavailableError(data?.service || 'Service', data);
        default:
          return new AppError(
            data?.message || 'Server error',
            'API_ERROR',
            status,
            data,
            'Something went wrong. Please try again'
          );
      }
    } else if (error.request) {
      // Network error
      return new NetworkError('No response from server', error.request);
    } else {
      // Other error
      return new AppError(
        error.message || 'Unknown error',
        'UNKNOWN_ERROR',
        500,
        error,
        'An unexpected error occurred'
      );
    }
  }

  // Handle specific service errors
  static handleTimesFMError(error: any): AppError {
    if (error.code === 'TIMESFM_UNAVAILABLE') {
      return new ServiceUnavailableError('TimesFM AI Service', error);
    }
    if (error.code === 'INVALID_FORECAST_DATA') {
      return new ValidationError('Invalid forecast data provided', 'forecast', error);
    }
    return this.handleApiError(error);
  }

  static handleGEEError(error: any): AppError {
    if (error.code === 'GEE_QUOTA_EXCEEDED') {
      return new AppError(
        'Google Earth Engine quota exceeded',
        'GEE_QUOTA_EXCEEDED',
        429,
        error,
        'Satellite data service is temporarily unavailable due to high usage'
      );
    }
    if (error.code === 'GEE_INVALID_COORDINATES') {
      return new ValidationError('Invalid coordinates provided', 'coordinates', error);
    }
    return this.handleApiError(error);
  }

  static handleIoTSensorError(error: any): AppError {
    if (error.code === 'SENSOR_OFFLINE') {
      return new AppError(
        'IoT sensor is offline',
        'SENSOR_OFFLINE',
        503,
        error,
        'Sensor is currently offline. Data may be outdated'
      );
    }
    if (error.code === 'SENSOR_DATA_CORRUPTED') {
      return new AppError(
        'Sensor data is corrupted',
        'SENSOR_DATA_CORRUPTED',
        422,
        error,
        'Sensor data appears to be corrupted. Please check sensor status'
      );
    }
    return this.handleApiError(error);
  }

  // Convert AppError to store format
  static toStoreError(error: AppError): AppError {
    return {
      id: crypto.randomUUID(),
      code: error.code,
      message: error.userMessage || error.message,
      details: error.context,
      timestamp: new Date(),
      context: error.context?.url || 'unknown',
      resolved: false,
    };
  }

  // Get user-friendly error message
  static getUserMessage(error: AppError): string {
    return error.userMessage || error.message || 'An unexpected error occurred';
  }

  // Check if error is retryable
  static isRetryable(error: AppError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMIT',
      'SENSOR_OFFLINE',
    ];
    return retryableCodes.includes(error.code);
  }

  // Get retry delay in milliseconds
  static getRetryDelay(error: AppError, attempt: number = 1): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }
}

// Error logging utility
export class ErrorLogger {
  static log(error: AppError, context?: any) {
    const logData = {
      id: error.id || crypto.randomUUID(),
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      statusCode: error.statusCode,
      context: error.context,
      additionalContext: context,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('App Error:', logData);
    }

    // Send to external logging service in production
    if (import.meta.env.PROD) {
      this.sendToLoggingService(logData);
    }
  }

  private static async sendToLoggingService(logData: any) {
    try {
      await fetch('/api/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });
    } catch (error) {
      console.error('Failed to send error log:', error);
    }
  }
}

// Error recovery strategies
export class ErrorRecovery {
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    errorHandler?: (error: AppError) => boolean
  ): Promise<T> {
    let lastError: AppError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const appError = ErrorHandler.handleApiError(error);
        lastError = appError;
        
        // Check if we should retry
        if (!ErrorHandler.isRetryable(appError) || attempt === maxAttempts) {
          break;
        }
        
        // Check custom retry condition
        if (errorHandler && !errorHandler(appError)) {
          break;
        }
        
        // Wait before retry
        const delay = ErrorHandler.getRetryDelay(appError, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  static async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    errorHandler?: (error: AppError) => boolean
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      
      // Check if we should use fallback
      if (errorHandler && !errorHandler(appError)) {
        throw appError;
      }
      
      try {
        return await fallbackOperation();
      } catch (fallbackError) {
        // If fallback also fails, throw the original error
        throw appError;
      }
    }
  }
}
