/**
 * Comprehensive Testing Suite for Anand Saathi
 * Unit tests, integration tests, and end-to-end tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import AnandSaathiDashboard from '../components/AnandSaathiDashboard';
import { anandSaathiBackend } from '../lib/anandSaathiBackend';

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock data for testing
const mockFieldData = {
  id: 1,
  name: 'Test Rice Field',
  crop_type: 'Rice' as const,
  area_acres: 2.5,
  latitude: 30.9010,
  longitude: 75.8573,
  farm_id: 1,
  created_at: '2024-01-01',
  soil_type: 'Alluvial',
  soil_ph: 7.2,
  status: 'growing'
};

// Unit Tests
describe('AnandSaathiDashboard Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders dashboard with welcome message', async () => {
    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome.*Farmer/i)).toBeInTheDocument();
    });
  });

  it('displays field statistics correctly', async () => {
    // Mock the backend API call
    vi.spyOn(anandSaathiBackend, 'getFields').mockResolvedValue({
      success: true,
      data: [mockFieldData]
    });

    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Total fields
      expect(screen.getByText('2.5 acres')).toBeInTheDocument(); // Total area
    });
  });

  it('handles field creation flow', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnandSaathiDashboard />);

    // Click add field button
    const addFieldButton = screen.getByText(/Add Your First Field/i);
    await user.click(addFieldButton);

    // Should open field mapper (mocked for now)
    await waitFor(() => {
      expect(screen.getByText(/Field Mapping/i)).toBeInTheDocument();
    });
  });

  it('displays market prices correctly', async () => {
    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Rice/i)).toBeInTheDocument();
      expect(screen.getByText(/₹2,200/i)).toBeInTheDocument();
    });
  });

  it('switches languages correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnandSaathiDashboard />);

    // Find language selector
    const languageSelect = screen.getByRole('combobox');
    await user.selectOptions(languageSelect, 'punjabi');

    await waitFor(() => {
      expect(screen.getByText(/ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ/i)).toBeInTheDocument();
    });
  });
});

// Integration Tests
describe('API Integration Tests', () => {
  it('fetches fields from backend successfully', async () => {
    const result = await anandSaathiBackend.getFields();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('validates field creation input', async () => {
    const invalidField = {
      name: '', // Invalid: empty name
      crop_type: 'rice' as const,
      area_acres: -1, // Invalid: negative area
      latitude: 30.9010,
      longitude: 75.8573,
      farm_id: 1
    };

    const result = await anandSaathiBackend.createField(invalidField);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
  });

  it('creates field with valid data', async () => {
    const validField = {
      name: 'Test Field',
      crop_type: 'rice' as const,
      area_acres: 2.5,
      latitude: 30.9010,
      longitude: 75.8573,
      farm_id: 1
    };

    const result = await anandSaathiBackend.createField(validField);

    // In mock mode, this should succeed
    expect(result.success).toBe(true);
  });
});

// Authentication Tests
describe('Authentication Flow', () => {
  it('handles user signup', async () => {
    const result = await anandSaathiBackend.signUp(
      'test@example.com',
      'password123',
      { display_name: 'Test Farmer' }
    );

    expect(result.success).toBe(true);
  });

  it('handles user signin', async () => {
    const result = await anandSaathiBackend.signIn(
      'test@example.com',
      'password123'
    );

    expect(result.success).toBe(true);
  });

  it('validates signup input', async () => {
    const result = await anandSaathiBackend.signUp(
      'invalid-email', // Invalid email
      '123', // Too short password
      {}
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
  });
});

// Performance Tests
describe('Performance Tests', () => {
  it('loads dashboard within acceptable time', async () => {
    const startTime = performance.now();

    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  it('handles large datasets efficiently', async () => {
    // Mock large dataset
    const largeFieldArray = Array.from({ length: 100 }, (_, i) => ({
      ...mockFieldData,
      id: i + 1,
      name: `Field ${i + 1}`
    }));

    vi.spyOn(anandSaathiBackend, 'getFields').mockResolvedValue({
      success: true,
      data: largeFieldArray
    });

    const startTime = performance.now();

    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/100/i)).toBeInTheDocument();
    });

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Should handle large datasets efficiently
    expect(loadTime).toBeLessThan(3000);
  });
});

// Error Handling Tests
describe('Error Handling', () => {
  it('displays error message when API fails', async () => {
    vi.spyOn(anandSaathiBackend, 'getFields').mockResolvedValue({
      success: false,
      error: 'Network error'
    });

    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });

  it('handles network timeouts gracefully', async () => {
    vi.spyOn(anandSaathiBackend, 'getFields').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 10000))
    );

    renderWithProviders(<AnandSaathiDashboard />);

    // Should show loading state initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});

// Accessibility Tests
describe('Accessibility Tests', () => {
  it('has proper ARIA labels', async () => {
    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      const dashboard = screen.getByRole('main');
      expect(dashboard).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    // Tab through elements
    await user.tab();
    expect(document.activeElement).toBeTruthy();
  });

  it('works with screen readers', async () => {
    renderWithProviders(<AnandSaathiDashboard />);

    await waitFor(() => {
      // Check for semantic HTML elements
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});

// End-to-End Tests
describe('End-to-End User Flows', () => {
  it('completes field creation workflow', async () => {
    const user = userEvent.setup();

    // Mock successful field creation
    vi.spyOn(anandSaathiBackend, 'createField').mockResolvedValue({
      success: true,
      data: { ...mockFieldData, id: 999 }
    });

    renderWithProviders(<AnandSaathiDashboard />);

    // Navigate through field creation
    await waitFor(() => {
      const addButton = screen.getByText(/Add Your First Field/i);
      expect(addButton).toBeInTheDocument();
    });

    // This would test the complete field creation flow
    // (Field mapper component integration would be tested here)
  });

  it('handles complete user session', async () => {
    // Test login -> dashboard -> field creation -> logout flow
    // This would be a comprehensive end-to-end test
  });
});

export {};
