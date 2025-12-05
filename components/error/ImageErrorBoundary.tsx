"use client";

import React, { useState, useCallback, ReactNode, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";

interface ImageErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
}

// Modern functional error boundary using hooks
export const ImageErrorBoundary: React.FC<ImageErrorBoundaryProps> = ({
  children,
  fallback: FallbackComponent,
  onError,
}) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
  });

  const resetError = useCallback(() => {
    setErrorState({ hasError: false, error: undefined });
  }, []);

  // Error handler for catching errors in children
  const handleError = useCallback(
    (error: Error, errorInfo: ErrorInfo) => {
      console.error("Image operation error:", error, errorInfo);
      setErrorState({ hasError: true, error });
      onError?.(error, errorInfo);
    },
    [onError]
  );

  // If there's an error, show fallback or default error UI
  if (errorState.hasError) {
    if (FallbackComponent) {
      return (
        <FallbackComponent error={errorState.error} resetError={resetError} />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-3 text-center bg-zinc-900 border border-red-500/20 rounded-lg">
        <div className="text-red-400">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-white">
          Image Processing Error
        </h3>
        <p className="text-xs text-white/60 max-w-xs">
          Something went wrong while processing your image. Please try again.
        </p>
        <Button
          onClick={resetError}
          size="sm"
          variant="outline"
          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Wrap children in an error-catching component
  return <ErrorCatcher onError={handleError}>{children}</ErrorCatcher>;
};

// Internal component that catches errors from children
interface ErrorCatcherProps {
  children: ReactNode;
  onError: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorCatcher extends React.Component<ErrorCatcherProps> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

// Hook for using error handling in functional components
export const useImageErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback(
    (error: Error, errorInfo: React.ErrorInfo) => {
      console.error("Image operation error:", error, errorInfo);
      setError(error);
      // Could integrate with error reporting service here
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};

// Default export for the main component
export default ImageErrorBoundary;
