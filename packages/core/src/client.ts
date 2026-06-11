/**
 * Float.js Client Entry (`@float.js/core/client`)
 *
 * Browser-safe surface: React hooks and utilities that run in the client
 * bundle. Import client hooks from here (not the main entry) so server-only
 * code (esbuild, node:http, etc.) never ends up in your browser bundle.
 *
 * @example
 * import { useFloatChat } from '@float.js/core/client';
 */

export {
  // Router / data / forms / async / store
  useFloatRouter,
  useFloatData,
  useFloatForm,
  useFloatAsync,
  useFloatDebounce,
  useFloatThrottle,
  createFloatStore,
  useFloatStore,
  combineFloatStores,
  floatMiddleware,
  validators,
  // AI chat / completion / agent
  useFloatChat,
  useFloatCompletion,
  useFloatAgent,
  readStream,
  readAgentEvents,
  type ChatMessage,
  type UseFloatChatOptions,
  type UseFloatChatResult,
  type UseFloatCompletionOptions,
  type UseFloatCompletionResult,
  type UseFloatAgentOptions,
  type UseFloatAgentResult,
  type AgentStreamEvent,
  type AgentTraceStep,
} from './hooks/index.js';
