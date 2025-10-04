import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAppStore } from '@/store';
import { ErrorHandler, ErrorRecovery } from '@/utils/errorHandling';
import { BaseComponent } from '@/components/common/BaseComponent';
import { ForecastCard } from '@/components/forecasting/ForecastCard';
import { EnhancedDashboard } from '@/components/dashboard/EnhancedDashboard';
import { useMigratedAppState, migrateDataToNewStore } from '@/utils/migrationHelpers';

// Mock the store for testing
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}));

describe('Architecture Rebuild Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Zustand Store', () => {
    it('should initialize with correct default state', () => {
      const mockStore = {
        user: null,
        isAuthenticated: false,
        fields: [],
        selectedFieldId: null,
        sensors: [],
        sensorData: new Map(),
        governmentRecords: [],
        forecasts: {},
        vegetationData: [],
        isLoading: false,
        error: null,
        notifications: [],
        integrationStatus: {
          iot: 'disconnected',
          government: 'disconnected',
          timesfm: 'disconnected',
          satellite: 'disconnected',
        },
        sidebarCollapsed: false,
        activeTab: 'dashboard',
        theme: 'auto',
      };

      (useAppStore as any).mockReturnValue(mockStore);

      const { result } = renderHook(() => useAppStore());
      expect(result.current).toEqual(mockStore);
    });

    it('should handle user authentication', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'farmer' as const,
        preferences: {
          language: 'en',
          theme: 'light' as const,
          notifications: {
            email: true,
            push: true,
            sms: false,
            forecastAlerts: true,
            weatherAlerts: true,
            diseaseAlerts: true,
          },
          units: 'metric' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStore = {
        user: null,
        setUser: vi.fn(),
        logout: vi.fn(),
      };

      (useAppStore as any).mockReturnValue(mockStore);

      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.setUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors correctly', () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };

      const error = ErrorHandler.handleApiError(mockError);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('should handle network errors', () => {
      const mockError = {
        request: {},
        message: 'Network Error'
      };

      const error = ErrorHandler.handleApiError(mockError);
      
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(0);
    });

    it('should retry retryable errors', async () => {
      let attemptCount = 0;
      const mockOperation = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
        return 'success';
      });

      const result = await ErrorRecovery.retry(mockOperation, 3);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });
  });

  describe('Base Components', () => {
    it('should render loading state', () => {
      render(
        <BaseComponent loading={true} title="Test Component">
          <div>Content</div>
        </BaseComponent>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render error state', () => {
      const mockRetry = vi.fn();
      
      render(
        <BaseComponent 
          error="Test error" 
          onRetry={mockRetry}
          title="Test Component"
        >
          <div>Content</div>
        </BaseComponent>
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Try Again'));
      expect(mockRetry).toHaveBeenCalled();
    });

    it('should render content when no loading or error', () => {
      render(
        <BaseComponent title="Test Component">
          <div>Test Content</div>
        </BaseComponent>
      );

      expect(screen.getByText('Test Component')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Forecast Components', () => {
    const mockForecast = {
      id: '1',
      fieldId: 'field1',
      type: 'weather' as const,
      title: 'Weather Forecast',
      description: '7-day weather forecast',
      confidence: 85,
      data: { temperature: 25 },
      predictions: [
        {
          date: new Date('2024-01-01'),
          value: 25,
          unit: '°C',
          confidence: 85,
        }
      ],
      createdAt: new Date(),
      validUntil: new Date('2024-01-08'),
      source: 'timesfm' as const,
    };

    it('should render forecast card', () => {
      const mockStore = {
        forecasts: { field1: [mockForecast] },
        isLoading: false,
        error: null,
        setError: vi.fn(),
        clearError: vi.fn(),
      };

      (useAppStore as any).mockReturnValue(mockStore);

      render(
        <ForecastCard
          fieldId="field1"
          forecastId="1"
          title="Test Forecast"
        />
      );

      expect(screen.getByText('Test Forecast')).toBeInTheDocument();
      expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
      expect(screen.getByText('85% confidence')).toBeInTheDocument();
    });

    it('should handle missing forecast', () => {
      const mockStore = {
        forecasts: {},
        isLoading: false,
        error: null,
        setError: vi.fn(),
        clearError: vi.fn(),
      };

      (useAppStore as any).mockReturnValue(mockStore);

      render(
        <ForecastCard
          fieldId="field1"
          forecastId="1"
        />
      );

      expect(screen.getByText('Forecast not found')).toBeInTheDocument();
    });
  });

  describe('Migration Helpers', () => {
    it('should migrate old forecast data structure', () => {
      const oldForecasts = [
        { id: '1', fieldId: 'field1', title: 'Forecast 1' },
        { id: '2', fieldId: 'field1', title: 'Forecast 2' },
        { id: '3', fieldId: 'field2', title: 'Forecast 3' },
      ];

      const migrated = migrateDataToNewStore({ forecasts: oldForecasts });
      
      expect(migrated).toBe(true);
    });

    it('should provide backward compatibility', () => {
      const mockStore = {
        user: null,
        fields: [],
        forecasts: {},
        setUser: vi.fn(),
        addField: vi.fn(),
        addForecast: vi.fn(),
      };

      (useAppStore as any).mockReturnValue(mockStore);

      const { result } = renderHook(() => useMigratedAppState());
      
      expect(result.current.user).toBeNull();
      expect(result.current.fields).toEqual([]);
      expect(result.current.forecasts).toEqual({});
    });
  });

  describe('Dashboard Component', () => {
    it('should render dashboard with stats', async () => {
      const mockStore = {
        selectedFieldId: 'field1',
        isLoading: false,
        error: null,
        setError: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
        updateIntegrationStatus: vi.fn(),
      };

      (useAppStore as any).mockReturnValue(mockStore);

      render(<EnhancedDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Total Fields')).toBeInTheDocument();
        expect(screen.getByText('Active Sensors')).toBeInTheDocument();
      });
    });

    it('should handle loading state', () => {
      const mockStore = {
        selectedFieldId: null,
        isLoading: true,
        error: null,
        setError: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
        updateIntegrationStatus: vi.fn(),
      };

      (useAppStore as any).mockReturnValue(mockStore);

      render(<EnhancedDashboard />);

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should handle error state', () => {
      const mockStore = {
        selectedFieldId: null,
        isLoading: false,
        error: {
          id: '1',
          code: 'DASHBOARD_ERROR',
          message: 'Failed to load dashboard',
          timestamp: new Date(),
          resolved: false,
        },
        setError: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
        updateIntegrationStatus: vi.fn(),
      };

      (useAppStore as any).mockReturnValue(mockStore);

      render(<EnhancedDashboard />);

      expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user flow', async () => {
      const mockStore = {
        user: null,
        fields: [],
        forecasts: {},
        isLoading: false,
        error: null,
        setUser: vi.fn(),
        addField: vi.fn(),
        addForecast: vi.fn(),
        setError: vi.fn(),
        clearError: vi.fn(),
      };

      (useAppStore as any).mockReturnValue(mockStore);

      const { result } = renderHook(() => useAppStore());

      // Simulate user login
      act(() => {
        result.current.setUser({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'farmer',
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              sms: false,
              forecastAlerts: true,
              weatherAlerts: true,
              diseaseAlerts: true,
            },
            units: 'metric',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Simulate adding a field
      act(() => {
        result.current.addField({
          id: 'field1',
          name: 'Test Field',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'New York, NY',
          },
          area: 10,
          cropType: 'Rice',
          soilType: 'Loam',
          plantingDate: new Date(),
          expectedHarvestDate: new Date(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Simulate adding a forecast
      act(() => {
        result.current.addForecast('field1', {
          id: 'forecast1',
          fieldId: 'field1',
          type: 'weather',
          title: 'Weather Forecast',
          description: '7-day forecast',
          confidence: 85,
          data: {},
          predictions: [],
          createdAt: new Date(),
          validUntil: new Date(),
          source: 'timesfm',
        });
      });

      expect(result.current.setUser).toHaveBeenCalled();
      expect(result.current.addField).toHaveBeenCalled();
      expect(result.current.addForecast).toHaveBeenCalled();
    });
  });
});

// Helper function for rendering hooks
function renderHook(hook: () => any) {
  let result: any;
  
  function TestComponent() {
    result = hook();
    return null;
  }
  
  render(<TestComponent />);
  return { result };
}

// Helper function for act
function act(callback: () => void) {
  callback();
}
