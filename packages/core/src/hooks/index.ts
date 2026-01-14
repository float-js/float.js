/**
 * Float.js Hooks
 * Modern React hooks for Float.js applications
 */

// Router
export { useFloatRouter, type FloatRouter, type FloatRouterState, type NavigateOptions } from './use-router.js';

// Data fetching
export { useFloatData, type FloatDataOptions, type FloatDataResult } from './use-data.js';

// Forms
export { useFloatForm, validators, type FloatFormOptions, type FloatFormResult, type FieldState, type ValidationRule } from './use-form.js';

// Async operations
export { useFloatAsync, useFloatDebounce, useFloatThrottle, type AsyncState, type FloatAsyncResult, type FloatAsyncOptions } from './use-async.js';

// Store
export { createFloatStore, useFloatStore, combineFloatStores, floatMiddleware, type FloatStore, type FloatStoreOptions } from './use-store.js';
