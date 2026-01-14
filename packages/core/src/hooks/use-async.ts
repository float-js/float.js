/**
 * Float.js Async Hook
 * Handle async operations with loading and error states
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

export interface FloatAsyncResult<T, Args extends any[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | undefined>;
  reset: () => void;
  setData: (data: T) => void;
}

export interface FloatAsyncOptions<T> {
  /** Initial data */
  initialData?: T;
  /** Execute immediately on mount */
  immediate?: boolean;
  /** Retry count on error */
  retryCount?: number;
  /** Delay between retries (ms) */
  retryDelay?: number;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback on settle (success or error) */
  onSettled?: (data: T | undefined, error: Error | undefined) => void;
}

/**
 * Execute async functions with loading/error states
 * @example
 * const { data, isLoading, execute } = useFloatAsync(
 *   async (id) => await fetchUser(id),
 *   { immediate: false }
 * );
 */
export function useFloatAsync<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: FloatAsyncOptions<T> = {}
): FloatAsyncResult<T, Args> {
  const {
    initialData,
    immediate = false,
    retryCount = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
    onSettled,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    error: undefined,
    isLoading: immediate,
    isSuccess: false,
    isError: false,
    isIdle: !immediate,
  });

  const mountedRef = useRef(true);
  const attemptRef = useRef(0);

  const execute = useCallback(async (...args: Args): Promise<T | undefined> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      isIdle: false,
      error: undefined,
    }));

    attemptRef.current = 0;

    const attempt = async (): Promise<T | undefined> => {
      try {
        const data = await asyncFn(...args);
        
        if (mountedRef.current) {
          setState({
            data,
            error: undefined,
            isLoading: false,
            isSuccess: true,
            isError: false,
            isIdle: false,
          });
          onSuccess?.(data);
          onSettled?.(data, undefined);
        }
        
        return data;
      } catch (error) {
        attemptRef.current++;
        
        if (attemptRef.current <= retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attempt();
        }
        
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            error: error as Error,
            isLoading: false,
            isSuccess: false,
            isError: true,
          }));
          onError?.(error as Error);
          onSettled?.(undefined, error as Error);
        }
        
        return undefined;
      }
    };

    return attempt();
  }, [asyncFn, retryCount, retryDelay, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      error: undefined,
      isLoading: false,
      isSuccess: false,
      isError: false,
      isIdle: true,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      isSuccess: true,
    }));
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    mountedRef.current = true;
    
    if (immediate) {
      execute(...([] as unknown as Args));
    }

    return () => {
      mountedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Debounced async execution
 */
export function useFloatDebounce<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>,
  delay: number = 300,
  options: FloatAsyncOptions<T> = {}
): FloatAsyncResult<T, Args> {
  const timerRef = useRef<NodeJS.Timeout>();
  const result = useFloatAsync(asyncFn, options);

  const debouncedExecute = useCallback((...args: Args) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return new Promise<T | undefined>((resolve) => {
      timerRef.current = setTimeout(async () => {
        const data = await result.execute(...args);
        resolve(data);
      }, delay);
    });
  }, [result.execute, delay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    ...result,
    execute: debouncedExecute,
  };
}

/**
 * Throttled async execution
 */
export function useFloatThrottle<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>,
  limit: number = 1000,
  options: FloatAsyncOptions<T> = {}
): FloatAsyncResult<T, Args> {
  const lastRunRef = useRef<number>(0);
  const result = useFloatAsync(asyncFn, options);

  const throttledExecute = useCallback((...args: Args) => {
    const now = Date.now();
    
    if (now - lastRunRef.current >= limit) {
      lastRunRef.current = now;
      return result.execute(...args);
    }
    
    return Promise.resolve(result.data);
  }, [result.execute, result.data, limit]);

  return {
    ...result,
    execute: throttledExecute,
  };
}
