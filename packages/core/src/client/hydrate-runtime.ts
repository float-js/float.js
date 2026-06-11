/**
 * Float.js Client Hydration Runtime
 *
 * This is the piece that turns Float.js from a static-SSR renderer into a real
 * interactive framework: it bundles the page + its layouts for the browser with
 * esbuild and ships a `hydrateRoot` entry, so client hooks (useState, useChat,
 * realtime, etc.) actually run in the browser.
 */

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import type { Route } from '../router/index.js';

export interface ClientBundleOptions {
  /** App root directory (used as esbuild resolveDir, so node_modules resolve). */
  rootDir: string;
  /** Minify + drop sourcemaps for production. */
  production?: boolean;
}

interface CacheEntry {
  code: string;
  /** Combined mtime fingerprint of page + layouts. */
  fingerprint: number;
}

const bundleCache = new Map<string, CacheEntry>();

function fingerprintFiles(files: string[]): number {
  let sum = 0;
  for (const file of files) {
    try {
      sum += fs.statSync(file).mtimeMs;
    } catch {
      /* file may not exist yet */
    }
  }
  return sum;
}

/**
 * Generate the virtual browser entry source for a route. It rebuilds the exact
 * same Page/Layout tree the server rendered, then hydrates `#__float`.
 */
export function generateClientEntry(route: Route): string {
  const toUrl = (p: string) => JSON.stringify(p);

  const layoutImports = route.layouts
    .map((layoutPath, i) => `import Layout_${i} from ${toUrl(layoutPath)};`)
    .join('\n');

  // Layouts are stored root -> current. To wrap innermost-first we iterate in
  // reverse, matching server/ssr.ts.
  const wrap = route.layouts
    .map((_, i) => i)
    .reverse()
    .map(
      (i) =>
        `  element = React.createElement(Layout_${i}, { children: element });`
    )
    .join('\n');

  return `import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import Page from ${toUrl(route.absolutePath)};
${layoutImports}

const data = (window.__FLOAT_DATA__ || { params: {}, searchParams: {} });
let element = React.createElement(Page, { params: data.params, searchParams: data.searchParams });
${wrap}

const container = document.getElementById('__float');
if (container) {
  hydrateRoot(container, element);
}
`;
}

/**
 * Bundle a route's client entry into a single browser-ready ESM script.
 * Cached by the page + layouts mtime fingerprint so repeat requests are instant.
 */
export async function buildClientBundle(
  route: Route,
  options: ClientBundleOptions
): Promise<string> {
  const { rootDir, production = false } = options;
  const files = [route.absolutePath, ...route.layouts];
  const fingerprint = fingerprintFiles(files);

  const cached = bundleCache.get(route.absolutePath);
  if (cached && cached.fingerprint === fingerprint && !production) {
    return cached.code;
  }

  const entrySource = generateClientEntry(route);

  const result = await esbuild.build({
    stdin: {
      contents: entrySource,
      resolveDir: rootDir,
      loader: 'tsx',
      sourcefile: 'float-client-entry.tsx',
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    write: false,
    minify: production,
    sourcemap: production ? false : 'inline',
    define: {
      'process.env.NODE_ENV': production ? '"production"' : '"development"',
    },
    // CSS is handled separately by the server; ignore CSS imports in components.
    loader: { '.css': 'empty' },
    logLevel: 'silent',
  });

  const code = result.outputFiles?.[0]?.text ?? '';
  bundleCache.set(route.absolutePath, { code, fingerprint });
  return code;
}

/** Clear the client bundle cache (used by HMR on file change). */
export function clearClientBundleCache(absolutePath?: string): void {
  if (absolutePath) {
    bundleCache.delete(absolutePath);
  } else {
    bundleCache.clear();
  }
}

/** URL path the server serves client bundles from. */
export const CLIENT_BUNDLE_ROUTE = '/_float/client.js';

/** Directory (under the static output) where prebuilt client bundles live. */
export const CLIENT_BUNDLE_DIR = '_float/client';

/**
 * Stable on-disk filename for a route's prebuilt client bundle.
 * '/' -> 'index.js', '/blog/:slug' -> 'blog_slug.js'.
 */
export function clientBundleFileName(routePath: string): string {
  const base =
    routePath === '/' || routePath === ''
      ? 'index'
      : routePath.replace(/^\//, '').replace(/[/:*?.[\]]+/g, '_').replace(/_+$/g, '');
  return `${base || 'index'}.js`;
}

/**
 * Build the two <script> tags injected into the HTML document to bootstrap
 * hydration: one with serialized props, one loading the route's bundle.
 */
export function renderHydrationScripts(
  pathname: string,
  bootstrapData: { params: Record<string, string>; searchParams: Record<string, string> }
): string {
  const json = JSON.stringify(bootstrapData).replace(/</g, '\\u003c');
  const src = `${CLIENT_BUNDLE_ROUTE}?path=${encodeURIComponent(pathname)}`;
  return `<script>window.__FLOAT_DATA__ = ${json};</script>
  <script type="module" src="${src}"></script>`;
}
