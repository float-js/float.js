/**
 * Float.js Data Hook
 * SWR-like data fetching with caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface FloatDataOptions<T> {
  /** Initial data before fetching */
  fallbackData?: T;
  /** Revalidate on window focus */
  revalidateOnFocus?: boolean;
  /** Revalidate on network reconnect */
  revalidateOnReconnect?: boolean;
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
  /** Dedupe requests within this time window (ms) */
  dedupingInterval?: number;
  /** Keep previous data when revalidating */
  keepPreviousData?: boolean;
  /** Custom fetcher function */
  fetcher?: (url: string) => Promise<T>;
}

export interface FloatDataResult<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T | Promise<T> | ((current?: T) => T | Promise<T>)) => Promise<T | undefined>;
  refresh: () => Promise<void>;
}

// Global cache for data
const cache = new Map<string, { data: any; timestamp: number }>();
const listeners = new Map<string, Set<() => void>>();

/**
 * Fetch and cache data with automatic revalidation
 * @example
 * const { data, error, isLoading } = useFloatData('/api/users');
 */
export function useFloatData<T = any>(
  key: string | null,
  options: FloatDataOptions<T> = {}
): FloatDataResult<T> {
  const {
    fallbackData,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval,
    dedupingInterval = 2000,
    keepPreviousData = false,
    fetcher = defaultFetcher,
  } = options;

  const [state, setState] = useState<{
    data: T | undefined;
    error: Error | undefined;
    isLoading: boolean;
    isValidating: boolean;
  }>(() => {
    const cached = key ? cache.get(key) : null;
    return {
      data: cached?.data ?? fallbackData,
      error: undefined,
      isLoading: !cached && !!key,
      isValidating: false,
    };
  });

  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);

  const revalidate = useCallback(async () => {
    if (!key) return;

    // Dedupe requests
    const now = Date.now();
    if (now - lastFetchRef.current < dedupingInterval) {
      return;
    }
    lastFetchRef.current = now;

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const data = await fetcher(key);
      
      if (mountedRef.current) {
        cache.set(key, { data, timestamp: now });
        setState({
          data,
          error: undefined,
          isLoading: false,
          isValidating: false,
        });

        // Notify other listeners
        listeners.get(key)?.forEach(fn => fn());
      }
    } catch (error) {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: error as Error,
          isLoading: false,
          isValidating: false,
        }));
      }
    }
  }, [key, dedupingInterval, fetcher]);

  const mutate = useCallback(async (
    data?: T | Promise<T> | ((current?: T) => T | Promise<T>)
  ): Promise<T | undefined> => {
    if (!key) return undefined;

    let newData: T | undefined;

    if (typeof data === 'function') {
      const current = cache.get(key)?.data;
      newData = await (data as (current?: T) => T | Promise<T>)(current);
    } else if (data !== undefined) {
      newData = await data;
    }

    if (newData !== undefined) {
      cache.set(key, { data: newData, timestamp: Date.now() });
      setState(prev => ({ ...prev, data: newData }));
      listeners.get(key)?.forEach(fn => fn());
    } else {
      await revalidate();
      newData = cache.get(key)?.data;
    }

    return newData;
  }, [key, revalidate]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    revalidate();

    return () => {
      mountedRef.current = false;
    };
  }, [revalidate]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus || typeof window === 'undefined') return;

    const handleFocus = () => revalidate();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, revalidate]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect || typeof window === 'undefined') return;

    const handleOnline = () => revalidate();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidateOnReconnect, revalidate]);

  // Refresh interval
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(revalidate, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, revalidate]);

  // Register listener for cache updates
  useEffect(() => {
    if (!key) return;

    const update = () => {
      const cached = cache.get(key);
      if (cached && mountedRef.current) {
        setState(prev => ({ ...prev, data: cached.data }));
      }
    };

    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key)!.add(update);

    return () => {
      listeners.get(key)?.delete(update);
    };
  }, [key]);

  return {
    data: keepPreviousData && state.data === undefined ? fallbackData : state.data,
    error: state.error,
    isLoading: state.isLoading,
    isValidating: state.isValidating,
    mutate,
    refresh: revalidate,
  };
}

// Default fetcher
async function defaultFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch');
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}
