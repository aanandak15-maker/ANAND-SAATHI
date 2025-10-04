import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/store';

interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showCard?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const BaseComponent: React.FC<BaseComponentProps> = ({
  className,
  children,
  loading = false,
  error = null,
  onRetry,
  title,
  description,
  showCard = true,
  size = 'md',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardVariants = {
    default: 'border shadow-sm',
    outline: 'border-2 border-dashed',
    ghost: 'border-0 shadow-none',
  };

  if (loading) {
    const loadingContent = (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-sm font-medium">Loading...</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    );

    if (showCard) {
      return (
        <Card className={cn(cardVariants[variant], className)}>
          <CardContent className={cn(sizeClasses[size], 'flex items-center justify-center')}>
            {loadingContent}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
        {loadingContent}
      </div>
    );
  }

  if (error) {
    const errorContent = (
      <div className="flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">Error</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    );

    if (showCard) {
      return (
        <Card className={cn(cardVariants[variant], className)}>
          <CardContent className={cn(sizeClasses[size], 'flex items-center justify-center')}>
            {errorContent}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
        {errorContent}
      </div>
    );
  }

  const content = (
    <>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </>
  );

  if (showCard) {
    return (
      <Card className={cn(cardVariants[variant], className)}>
        <CardContent className={sizeClasses[size]}>
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(className)}>
      {content}
    </div>
  );
};

// Specialized base components
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

export const ErrorDisplay: React.FC<{
  error: string;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean;
}> = ({ error, onRetry, title = 'Error', showDetails = false }) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">{title}</p>
          <p className="text-sm">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Hook for component state management
export const useComponentState = () => {
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);

  return {
    isLoading,
    error: error?.message || null,
    setError: (error: string) => setError({
      id: crypto.randomUUID(),
      code: 'COMPONENT_ERROR',
      message: error,
      timestamp: new Date(),
      resolved: false,
    }),
    clearError,
  };
};
