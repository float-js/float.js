/**
 * Float.js Router Hook
 * Modern client-side routing utilities
 */

import { useCallback, useMemo } from 'react';

export interface FloatRouterState {
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface FloatRouter extends FloatRouterState {
  push: (url: string, options?: NavigateOptions) => void;
  replace: (url: string, options?: NavigateOptions) => void;
  back: () => void;
  forward: () => void;
  prefetch: (url: string) => void;
  refresh: () => void;
}

export interface NavigateOptions {
  scroll?: boolean;
  shallow?: boolean;
}

/**
 * Access Float.js router for client-side navigation
 * @example
 * const router = useFloatRouter();
 * router.push('/dashboard');
 */
export function useFloatRouter(): FloatRouter {
  // Get current location
  const getLocation = useCallback((): FloatRouterState => {
    if (typeof window === 'undefined') {
      return {
        pathname: '/',
        search: '',
        hash: '',
        params: {},
        query: {},
      };
    }

    const url = new URL(window.location.href);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params: {}, // Populated by server
      query,
    };
  }, []);

  const state = useMemo(() => getLocation(), [getLocation]);

  const push = useCallback((url: string, options?: NavigateOptions) => {
    if (typeof window === 'undefined') return;
    
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    if (options?.scroll !== false) {
      window.scrollTo(0, 0);
    }
  }, []);

  const replace = useCallback((url: string, options?: NavigateOptions) => {
    if (typeof window === 'undefined') return;
    
    window.history.replaceState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    if (options?.scroll !== false) {
      window.scrollTo(0, 0);
    }
  }, []);

  const back = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.history.back();
  }, []);

  const forward = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.history.forward();
  }, []);

  const prefetch = useCallback((url: string) => {
    if (typeof window === 'undefined') return;
    
    // Create hidden link for prefetch
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }, []);

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.location.reload();
  }, []);

  return {
    ...state,
    push,
    replace,
    back,
    forward,
    prefetch,
    refresh,
  };
}
