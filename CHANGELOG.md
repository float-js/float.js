# Changelog

All notable changes to Float.js will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2026-06-10

The **AI-native + hydration** release. Float.js pages are now genuinely
interactive in the browser, and the framework ships a first-class AI runtime.

### Added
- **Client hydration runtime** — pages are bundled for the browser with esbuild
  and hydrated via `hydrateRoot`, so `useState`, client hooks, realtime and AI
  streaming actually run client-side. Served at `/_float/client.js`, cached by
  page+layout mtime, with HMR cache invalidation. Works in **dev and
  production**: `float build` pre-builds minified per-route bundles, and the
  production server serves them and **executes API routes from source**
  (including AI streaming) instead of stubbing them.
- **AI runtime (`@float.js/core`)**:
  - Providers with first-class **tool-calling**: `OpenAIProvider`,
    `AnthropicProvider`, and a deterministic `MockProvider` for offline dev/tests.
  - `tool()` — typed tools with JSON-schema params and runtime arg validation.
  - `defineAgent()` — a provider-agnostic **agent loop** that calls tools,
    feeds results back, and iterates up to `maxSteps`. Returns a full step/tool
    trace, and `agent.stream()` emits `start`/`step`/`tool_result`/`final`
    events live as the loop runs.
  - `agentStreamHandler()` to expose an agent as a streaming **SSE** route, and
    the `useFloatAgent` client hook to render the tool trace in real time.
  - **RAG primitives**: `createVectorStore()` with cosine similarity, plus
    `MockEmbedder` (offline) and `OpenAIEmbedder`.
  - `agentHandler()` to expose an agent as an API route.
- **AI client hooks (`@float.js/core/client`)**: `useFloatChat`,
  `useFloatCompletion`, and `readStream` — streaming chat/completion UIs against
  your API routes (text or SSE).
- **Browser-safe client entry** `@float.js/core/client` so server-only code never
  leaks into the client bundle.
- **Test suite**: 53 Vitest tests covering router, SSR, hydration bundling, and
  the full AI runtime (previously zero tests).

### Fixed
- `version.ts` now auto-syncs from `package.json` (was hardcoded and stale);
  dev indicator/dashboard versions are no longer hardcoded.
- Package name mismatch: templates/scripts referenced `@float/core` instead of
  the published `@float.js/core`.
- The `examples/basic` app is now a complete, working AI chat demo.

## [2.2.2] - 2026-01-16

### Added
- Badges to package README files for npm version, downloads, license, and GitHub stats

### Changed
- Updated package documentation with visual badges

## [2.2.1] - 2026-01-16

### Added
- GitHub Actions workflow for automatic npm publishing
- CI/CD automation for package releases

### Changed
- Improved deployment workflow

## [2.2.0] - 2026-01-14

### Added
- Nested layouts with automatic hierarchy resolution
- Loading states with Suspense boundaries
- Persistent file-based cache for faster builds
- Cache statistics and management tools

### Changed
- Enhanced router to support loading and error boundary detection
- Improved build performance with persistent caching

## [2.1.0] - 2026-01-14

### Added
- Automatic Tailwind CSS setup and configuration
- PostCSS integration with Tailwind directives processing
- Auto-detection of Tailwind configuration
- CSS serving with Tailwind processing in dev server

### Changed
- Build configuration to externalize PostCSS dependencies

## [2.0.7] - 2026-01-14

### Added
- React 19 support with peer dependencies
- Comprehensive package documentation

### Changed
- Updated React peer dependencies to support versions 18.2.0 through 19.x

## [2.0.0] - 2026-01-12

### Added
- File-based routing system
- Server-side rendering
- Hot module replacement
- TypeScript support
- Development server with WebSocket-based HMR
- API routes
- Production build system

### Initial Release
- Core framework functionality
- CLI tools
- Project scaffolding
