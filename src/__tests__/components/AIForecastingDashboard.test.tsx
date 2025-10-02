/**
 * Integration Tests for AI Forecasting Dashboard
 */

import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AIForecastingDashboard } from '@/components/AIForecastingDashboard';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AppStateProvider>
      {children}
    </AppStateProvider>
  </QueryClientProvider>
);

describe('AIForecastingDashboard', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should render dashboard header', () => {
    render(
      <TestWrapper>
        <AIForecastingDashboard />
      </TestWrapper>
    );

    expect(screen.getByText(/AI Forecasting/i)).toBeInTheDocument();
  });

  it('should display forecast summary cards', () => {
    render(
      <TestWrapper>
        <AIForecastingDashboard />
      </TestWrapper>
    );

    // Check that at least one "Yield Forecast" text element exists
    const yieldForecastElements = screen.getAllByText(/Yield Forecast/i);
    expect(yieldForecastElements.length).toBeGreaterThan(0);

    // Check that at least one "Market Forecast" text element exists
    const marketForecastElements = screen.getAllByText(/Market Forecast/i);
    expect(marketForecastElements.length).toBeGreaterThan(0);

    // Check that at least one "Weather Forecast" text element exists
    const weatherForecastElements = screen.getAllByText(/Weather Forecast/i);
    expect(weatherForecastElements.length).toBeGreaterThan(0);
  });

  it('should have tabs for different forecast types', () => {
    render(
      <TestWrapper>
        <AIForecastingDashboard />
      </TestWrapper>
    );

    expect(screen.getByRole('tab', { name: /yield/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /market/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /weather/i })).toBeInTheDocument();
  });

  it('should show generate forecasts button', () => {
    render(
      <TestWrapper>
        <AIForecastingDashboard />
      </TestWrapper>
    );

    const generateButton = screen.getByRole('button', { name: /Generate Forecasts/i });
    expect(generateButton).toBeInTheDocument();
  });
});
