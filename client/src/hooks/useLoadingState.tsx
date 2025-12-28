import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseLoadingStateOptions {
  minLoadingTime?: number;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { minLoadingTime = 300, onError, showErrorToast = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const startLoading = useCallback((text = 'Loading...') => {
    setIsLoading(true);
    setLoadingText(text);
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, minLoadingTime);
  }, [minLoadingTime]);

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  const executeWithLoading = useCallback(
    async <T,>(
      asyncFunction: () => Promise<T>,
      loadingMessage = 'Processing...'
    ): Promise<T | undefined> => {
      startLoading(loadingMessage);
      const startTime = Date.now();

      try {
        const result = await asyncFunction();
        const elapsed = Date.now() - startTime;
        
        if (elapsed < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
        }
        
        stopLoading();
        return result;
      } catch (error) {
        stopLoading();
        
        if (error instanceof Error) {
          if (onError) {
            onError(error);
          }
          
          if (showErrorToast) {
            toast({
              title: 'Error',
              description: error.message || 'An unexpected error occurred',
              variant: 'destructive',
            });
          }
        }
        
        throw error;
      }
    },
    [startLoading, stopLoading, minLoadingTime, onError, showErrorToast, toast]
  );

  return {
    isLoading,
    loadingText,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    executeWithLoading,
  };
}

export function useDelayedLoading(delay = 200) {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [isActuallyLoading, setIsActuallyLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActuallyLoading) {
      timer = setTimeout(() => {
        setShouldShowLoading(true);
      }, delay);
    } else {
      setShouldShowLoading(false);
    }

    return () => clearTimeout(timer);
  }, [isActuallyLoading, delay]);

  return {
    shouldShowLoading,
    setIsLoading: setIsActuallyLoading,
  };
}

// Hook for query loading states with MoloChain branding
export const useQueryLoadingState = () => {
  const [loadingQueries, setLoadingQueries] = useState<Set<string>>(new Set());

  const setQueryLoading = (queryKey: string, isLoading: boolean) => {
    setLoadingQueries(prev => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(queryKey);
      } else {
        newSet.delete(queryKey);
      }
      return newSet;
    });
  };

  const isAnyQueryLoading = loadingQueries.size > 0;

  return {
    isAnyQueryLoading,
    setQueryLoading,
    loadingQueries
  };
};