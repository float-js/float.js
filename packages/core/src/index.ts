/**
 * Float.js - Ultra Modern Web Framework
 * 
 * @packageDocumentation
 */

// Core exports
export { VERSION } from './version.js';

// Router
export { 
  scanRoutes, 
  matchRoute,
  type Route as FloatRoute,
  type RouterOptions as FloatRouterOptions,
} from './router/index.js';

// Server
export {
  createDevServer,
  startProductionServer,
  renderPage,
  renderPageStream,
  type DevServer,
  type DevServerOptions,
  type ProdServerOptions,
  type RenderOptions,
  type PageProps,
} from './server/index.js';

// Build
export { 
  build,
  type BuildOptions,
  type BuildResult,
} from './build/index.js';

export {
  transformFile,
  transformSource,
  clearModuleCache,
} from './build/transform.js';

// Types for user applications
export interface FloatConfig {
  /** App directory (default: 'app') */
  appDir?: string;
  /** Base path for all routes */
  basePath?: string;
  /** Enable React strict mode */
  reactStrictMode?: boolean;
  /** Internationalization config */
  i18n?: {
    locales: string[];
    defaultLocale: string;
  };
  /** Custom headers */
  headers?: () => Promise<Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>>;
  /** Redirects */
  redirects?: () => Promise<Array<{
    source: string;
    destination: string;
    permanent: boolean;
  }>>;
  /** Environment variables to expose to client */
  env?: Record<string, string>;
  /** Experimental features */
  experimental?: {
    serverActions?: boolean;
    ppr?: boolean; // Partial Pre-rendering
  };
}

// Metadata types
export interface Metadata {
  title?: string | { default: string; template?: string };
  description?: string;
  keywords?: string[];
  authors?: Array<{ name: string; url?: string }>;
  creator?: string;
  publisher?: string;
  robots?: string | {
    index?: boolean;
    follow?: boolean;
    googleBot?: {
      index?: boolean;
      follow?: boolean;
    };
  };
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
    locale?: string;
    type?: 'website' | 'article' | 'book' | 'profile';
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    title?: string;
    description?: string;
    images?: string[];
    creator?: string;
  };
  icons?: {
    icon?: string | Array<{ url: string; sizes?: string }>;
    apple?: string | Array<{ url: string; sizes?: string }>;
  };
  manifest?: string;
  canonical?: string;
}

// Re-export React types for convenience
export type { 
  ReactNode, 
  ReactElement, 
  FC, 
  ComponentType 
} from 'react';

// Float.js Hooks - Modern utilities for applications
export {
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
  // AI client hooks
  useFloatChat,
  useFloatCompletion,
  useFloatAgent,
  readStream,
  readAgentEvents,
  type ChatMessage,
  type UseFloatChatResult,
  type UseFloatCompletionResult,
  type UseFloatAgentResult,
  type AgentStreamEvent,
  type AgentTraceStep,
} from './hooks/index.js';

// AI Module - AI-native core (providers, tools, agents, RAG)
export {
  ai,
  streamResponse,
  sseResponse,
  aiAction,
  agentHandler,
  agentStreamHandler,
  // providers
  OpenAIProvider,
  AnthropicProvider,
  MockProvider,
  getDefaultProvider,
  // tools
  tool,
  validateArgs,
  ToolValidationError,
  // agent
  defineAgent,
  // rag
  createVectorStore,
  VectorStore,
  MockEmbedder,
  OpenAIEmbedder,
  cosineSimilarity,
  type AIProvider,
  type ChatOptions,
  type Message,
  type AIResponse,
  type GenerateOptions,
  type GenerateResult as AIGenerateResult,
  type ToolCall,
  type ToolSpec,
  type Tool,
  type ToolDefinition,
  type Agent,
  type AgentConfig,
  type AgentResult,
  type AgentStep,
  type AgentEvent,
  type ToolInvocation,
  type Embedder,
  type VectorDocument,
  type SearchResult,
} from './ai/index.js';

// Client hydration runtime
export {
  buildClientBundle,
  generateClientEntry,
  renderHydrationScripts,
  clearClientBundleCache,
  CLIENT_BUNDLE_ROUTE,
  type ClientBundleOptions,
} from './client/hydrate-runtime.js';

// Type-Safe API Module
export {
  f,
  typedRoute,
  json,
  error,
  redirect,
  FloatValidationError,
  type Infer,
} from './api/index.js';

// Real-time Module - Built-in WebSocket support
export {
  FloatRealtime,
  realtime,
  getRealtimeServer,
  createRealtimeClient,
  type RealtimeClient,
  type RealtimeMessage,
  type RealtimeRoom,
  type PresenceState,
  type RealtimeOptions,
} from './realtime/index.js';

// Dev Tools - Visual dashboard for development
export {
  devtools,
  dashboardState,
  createDevDashboard,
  createRequestLogger,
  type RouteInfo,
  type BuildInfo,
  type RequestLog,
  type PerformanceMetrics,
  type DevDashboardOptions,
} from './devtools/index.js';

// Image Optimization
export {
  image,
  configureImages,
  getImageConfig,
  createImageHandler,
  floatImageLoader,
  generateSrcSet,
  getImageProps,
  renderImageToString,
  type ImageConfig,
  type ImageProps,
  type OptimizedImage,
  type StaticImageData,
} from './image/index.js';

// Edge Middleware
export {
  middleware,
  middlewareHelpers,
  NextResponse,
  registerMiddleware,
  clearMiddleware,
  createMiddlewareHandler,
  type MiddlewareRequest,
  type MiddlewareHandler,
  type MiddlewareConfig,
  type NextURL,
  type GeoData,
} from './middleware/index.js';

// Static Site Generation (SSG) & ISR
export {
  ssg,
  SSGEngine,
  getSSGEngine,
  configureSSG,
  defineStaticPaths,
  defineStaticProps,
  createSSGHandler,
  createRevalidateHandler,
  type StaticPath,
  type GetStaticPathsResult,
  type GetStaticPropsContext,
  type GetStaticPropsResult,
  type CachedPage,
  type SSGConfig,
  type GenerateResult,
} from './ssg/index.js';

// Built-in Analytics
export {
  analytics,
  AnalyticsEngine,
  getAnalytics,
  configureAnalytics,
  createAnalyticsMiddleware,
  createAnalyticsHandler,
  analyticsClientScript,
  type PageView,
  type WebVitals,
  type CustomEvent,
  type AnalyticsData,
  type AnalyticsConfig,
  type AnalyticsSummary,
} from './analytics/index.js';

// Client utilities
export { generateWelcomePage } from './client/welcome-page.js';
