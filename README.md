<p align="center">
  <a href="https://floatjs.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/float-js/float-js/main/.github/logo-dark.svg">
      <img src="https://raw.githubusercontent.com/float-js/float-js/main/.github/logo-light.svg" height="128">
    </picture>
    <h1 align="center">Float.js</h1>
  </a>
</p>

<p align="center">
  <strong>The React Framework for the AI Era</strong>
</p>

<p align="center">
  Build blazingly fast web applications with intelligent SSR streaming, file-based routing,<br>
  50ms hot reload, zero-config TypeScript, and AI-ready architecture.
</p>

<p align="center">
  <a href="https://github.com/float-js/float-js/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square" alt="license"></a>
  <a href="https://github.com/float-js/float-js/stargazers"><img src="https://img.shields.io/github/stars/float-js/float-js?style=flat-square&color=8b5cf6" alt="stars"></a>
  <a href="https://github.com/float-js/float-js"><img src="https://img.shields.io/badge/PRs-welcome-8b5cf6?style=flat-square" alt="PRs welcome"></a>
  <a href="https://github.com/float-js/float-js"><img src="https://img.shields.io/badge/version-0.1.0-8b5cf6?style=flat-square" alt="version"></a>
</p>

<p align="center">
  <a href="https://floatjs.dev/docs">Documentation</a> •
  <a href="https://floatjs.dev/learn">Learn</a> •
  <a href="https://floatjs.dev/examples">Examples</a> •
  <a href="https://floatjs.dev/blog">Blog</a>
</p>

---

## ⚡ Quick Start

Get started with Float.js in seconds:

```bash
npx create-float@latest my-app
cd my-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 🚀 Why Float.js?

Float.js is built from the ground up for the modern web. It combines the best developer experience with cutting-edge performance.

| Feature | Float.js | Others |
|---------|----------|--------|
| Hot Reload | **~50ms** | ~500ms |
| Build Time | **~100ms** | ~3s |
| SSR Streaming | ✅ Native | Partial |
| Zero Config | ✅ | ❌ |
| AI-Ready | ✅ Built-in | Plugin |

## ✨ Features

### 🔥 Instant Development

```typescript
// That's it. No config needed.
// Edit your code, see changes in ~50ms.
```

- **Lightning-fast HMR** powered by esbuild
- **State preservation** across refreshes
- **Error overlay** with stack traces

### 📁 File-Based Routing

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

### 🌊 Streaming SSR

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

- React 18 streaming out of the box
- Progressive HTML delivery
- Suspense boundaries
- Fastest time-to-content

### 🔮 AI-Ready Architecture

```tsx
// Built-in patterns for AI integration
export async function generateResponse(prompt: string) {
  const stream = await ai.stream(prompt);
  return new StreamingResponse(stream);
}
```

- Server Actions
- Streaming responses
- LLM workflow optimization
- Edge-ready

### 📦 Zero Configuration

```bash
# Just works. TypeScript, ESLint, and more.
npx create-float@latest my-app
```

- TypeScript by default
- ESLint preconfigured
- Path aliases (`@/`)
- Optimal defaults

## 🏗️ Project Structure

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

- [Getting Started](https://floatjs.dev/docs/getting-started)
- [Routing](https://floatjs.dev/docs/routing)
- [Data Fetching](https://floatjs.dev/docs/data-fetching)
- [Styling](https://floatjs.dev/docs/styling)
- [Deployment](https://floatjs.dev/docs/deployment)
- [API Reference](https://floatjs.dev/docs/api)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/float-js/float-js.git

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## 📦 Packages

| Package | Description |
|---------|-------------|
| [@float/core](packages/core) | Core framework, CLI, router, SSR engine |
| [create-float](packages/create-float) | Project scaffolding CLI |

> 📦 **Coming soon to npm!** Packages will be published once v1.0 is ready.

## 🗺️ Roadmap

- [x] File-based routing
- [x] SSR with streaming
- [x] Hot module replacement
- [x] TypeScript support
- [ ] Static site generation (SSG)
- [ ] Incremental static regeneration (ISR)
- [ ] Image optimization
- [ ] Built-in analytics
- [ ] Edge middleware

## 💬 Community

- [Discord](https://discord.gg/floatjs) - Chat with the community
- [Twitter](https://twitter.com/floatjs) - Latest updates
- [GitHub Discussions](https://github.com/float-js/float-js/discussions) - Q&A

## 📄 License

Float.js is [MIT licensed](LICENSE).

---

<p align="center">
  <strong>Built with ⚡ for the modern web</strong>
</p>

<p align="center">
  <a href="https://floatjs.dev">Website</a> •
  <a href="https://floatjs.dev/docs">Docs</a> •
  <a href="https://github.com/float-js/float-js">GitHub</a>
</p> 
