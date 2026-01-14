# @float/core

The core Float.js framework package providing CLI, dev server with HMR, file-based routing, and React 18 SSR streaming.

## Features

- ⚡ **Lightning Fast HMR** - 50ms hot reload with esbuild
- 🚀 **React 18 SSR Streaming** - Instant time-to-first-byte
- 📁 **File-based Router** - Convention over configuration
- 🛠️ **Zero Config TypeScript** - Works out of the box
- 🎯 **esbuild Bundler** - Ultra-fast builds

## Installation

```bash
npm install @float/core
# or
pnpm add @float/core
```

## Usage

### CLI Commands

```bash
# Start development server
float dev

# Build for production
float build

# Start production server
float start
```

### Programmatic API

```typescript
import { DevServer, build } from '@float/core';

// Start dev server
const server = new DevServer({ port: 3000, root: process.cwd() });
await server.start();

// Build for production
await build({ root: process.cwd() });
```

## License

MIT
