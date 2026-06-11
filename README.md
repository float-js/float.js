<p align="center">
  <a href="https://github.com/float-js/float.js">
    <h1 align="center">Float.js</h1>
  </a>
</p>

<p align="center">
  <strong>Modern React Framework for Production</strong>
</p>

<p align="center">
  Build high-performance web applications with server-side rendering, file-based routing,<br>
  instant hot reload, and zero-config TypeScript support.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@float.js/core"><img src="https://img.shields.io/npm/v/@float.js/core?style=flat-square&color=8b5cf6&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@float.js/core"><img src="https://img.shields.io/npm/dm/@float.js/core?style=flat-square&color=6366f1&label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/float-js/float-js/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square" alt="license"></a>
  <a href="https://github.com/float-js/float-js/stargazers"><img src="https://img.shields.io/github/stars/float-js/float-js?style=flat-square&color=8b5cf6" alt="stars"></a>
  <a href="https://github.com/float-js/float-js"><img src="https://img.shields.io/badge/PRs-welcome-8b5cf6?style=flat-square" alt="PRs welcome"></a>
</p>

<p align="center">
  <a href="https://github.com/float-js/float.js#readme">Documentation</a> •
  <a href="https://github.com/float-js/float.js/tree/main/examples">Examples</a> •
  <a href="https://github.com/float-js/float.js/issues">Issues</a>
</p>

---

## Quick Start

Get started with Float.js in seconds:

```bash
npx create-float@latest my-app
cd my-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Why Float.js?

Float.js is built from the ground up for the modern web. It combines excellent developer experience with production-ready performance — and it's **AI-native**: agents, tools, RAG and streaming chat UIs are part of the framework, not an afterthought.

### AI-native, in the framework

```ts
// app/api/agent/route.ts — an agent with a typed tool, exposed as an API route
import { defineAgent, tool, agentHandler } from '@float.js/core';

const getWeather = tool({
  name: 'get_weather',
  description: 'Get the weather for a city',
  parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
  execute: async ({ city }) => ({ city, tempC: 21 }),
});

export const POST = agentHandler(
  defineAgent({ system: 'You are a helpful assistant.', tools: [getWeather] })
);
```

```tsx
// app/page.tsx — a streaming chat UI that actually hydrates and runs in the browser
import { useFloatChat } from '@float.js/core/client';

export default function Chat() {
  const { messages, input, setInput, handleSubmit, isLoading } = useFloatChat();
  return (
    <form onSubmit={handleSubmit}>
      {messages.map((m) => <p key={m.id}><b>{m.role}:</b> {m.content}</p>)}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button disabled={isLoading}>Send</button>
    </form>
  );
}
```

- **Providers with tool-calling**: OpenAI, Anthropic, and a deterministic `MockProvider` for offline dev/tests.
- **Agent loop** (`defineAgent`) that calls tools, feeds results back, and iterates — with a full step/tool trace.
- **RAG** out of the box: `createVectorStore()` + embedders.
- **Real client hydration** so hooks, realtime and AI streaming run in the browser.
- Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to use a real model; with no key the runtime falls back to a mock so dev keeps working.

### Key Features

**Performance**
- Hot reload in ~50ms powered by esbuild
- Fast builds with optimized bundling
- Server-side rendering with React 18 streaming
- Automatic code splitting

**Developer Experience**
- Zero configuration required
- TypeScript support out of the box
- File-based routing system
- Error overlay with stack traces

**Production Ready**
- Static site generation (SSG)
- Incremental static regeneration (ISR)
- Built-in caching system
- Edge middleware support

## Features

### Instant Development

```typescript
// No configuration needed
// Edit your code and see changes instantly
```

- Lightning-fast HMR powered by esbuild
- State preservation across refreshes
- Error overlay with stack traces

### File-Based Routing

```
app/
├── page.tsx           → /
├── about/page.tsx     → /about
├── blog/[slug]/page.tsx → /blog/:slug
├── api/users/route.ts → /api/users
└── layout.tsx         → Shared layout
```

- Automatic route generation
- Dynamic segments `[param]`
- Catch-all routes `[...slug]`
- API routes with `route.ts`
- Nested layouts

### Server-Side Rendering

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  );
}
```

- React 18 streaming support
- Progressive HTML delivery
- Suspense boundaries
- Optimized time-to-content

### Zero Configuration

```bash
# TypeScript, ESLint, and more work out of the box
npx create-float@latest my-app
```

- TypeScript by default
- ESLint preconfigured
- Path aliases (`@/`)
- Optimal defaults

## Project Structure

```
my-app/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── about/
│   │   └── page.tsx    # /about
│   └── api/
│       └── hello/
│           └── route.ts # /api/hello
├── public/             # Static assets
├── float.config.ts     # Configuration (optional)
└── package.json
```

## 📖 Documentation

Visit [floatjs.dev/docs](https://floatjs.dev/docs) for the full documentation.

## Documentation

For detailed documentation, visit the [GitHub repository](https://github.com/float-js/float.js).

- [Getting Started](https://github.com/float-js/float.js#quick-start)
- [File-Based Routing](https://github.com/float-js/float.js#file-based-routing)
- [Examples](https://github.com/float-js/float.js/tree/main/examples)
- [API Reference](https://github.com/float-js/float.js/tree/main/packages/core)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repository
git clone https://github.com/float-js/float-js.git

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Packages

| Package | Description |
|---------|-------------|
| [@float.js/core](https://www.npmjs.com/package/@float.js/core) | Core framework, CLI, router, SSR engine |
| [create-float](https://www.npmjs.com/package/create-float) | Project scaffolding CLI |

## Community

- [GitHub Discussions](https://github.com/float-js/float-js/discussions) - Ask questions and share ideas
- [GitHub Issues](https://github.com/float-js/float-js/issues) - Report bugs and request features

## License

Float.js is [MIT licensed](LICENSE).

---

<p align="center">
  <a href="https://github.com/float-js/float.js">GitHub</a> •
  <a href="https://www.npmjs.com/package/@float.js/core">npm</a>
</p> 
