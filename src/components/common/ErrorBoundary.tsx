import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorHandler, ErrorLogger } from '@/utils/errorHandling';
import { useAppStore } from '@/store';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'component' | 'feature';
  showDetails?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: crypto.randomUUID(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Log the error
    const appError = ErrorHandler.handleApiError(error);
    ErrorLogger.log(appError, {
      componentStack: errorInfo.componentStack,
      level,
      retryCount: this.state.retryCount,
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Auto-reset after 30 seconds for component-level errors
    if (level === 'component' && this.state.retryCount < 3) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleRetry();
      }, 30000);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    
    if (resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged && this.state.hasError) {
        this.handleRetry();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: this.state.retryCount + 1,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorId } = this.state;
    const bugReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
    
    // In a real app, you'd send this to your bug reporting service
    console.log('Bug Report:', bugReport);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2));
    alert('Bug report copied to clipboard');
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const { children, fallback, level = 'component', showDetails = false } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const isPageLevel = level === 'page';
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className={`${isPageLevel ? 'min-h-screen' : 'min-h-[400px]'} flex items-center justify-center p-4`}>
          <Card className={`w-full ${isPageLevel ? 'max-w-2xl' : 'max-w-md'}`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">
                {isPageLevel ? 'Something went wrong' : 'Component Error'}
              </CardTitle>
              <CardDescription className="text-lg">
                {isPageLevel 
                  ? 'We encountered an unexpected error. Please try again or contact support if the problem persists.'
                  : 'This component encountered an error and couldn\'t render properly.'
                }
              </CardDescription>
              {errorId && (
                <Badge variant="outline" className="mt-2">
                  Error ID: {errorId.slice(0, 8)}
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Details (Development Only) */}
              {isDevelopment && showDetails && error && (
                <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-4 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Error Details:
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => this.setState({ showDetails: false })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {error.message}
                  </p>
                  {errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 font-medium">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                  {retryCount > 0 && ` (${retryCount})`}
                </Button>
                
                {isPageLevel && (
                  <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleReportBug} className="flex-1">
                  <Bug className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </div>

              {/* Retry Information */}
              {retryCount > 0 && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  This error has occurred {retryCount} time{retryCount > 1 ? 's' : ''}.
                  {retryCount >= 3 && ' Please contact support if the problem persists.'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Hook for error boundary context
export const useErrorBoundary = () => {
  const setError = useAppStore((state) => state.setError);
  
  return {
    captureError: (error: Error, context?: any) => {
      const appError = ErrorHandler.handleApiError(error);
      ErrorLogger.log(appError, context);
      setError(ErrorHandler.toStoreError(appError));
    },
  };
};

// Higher-order component for error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
