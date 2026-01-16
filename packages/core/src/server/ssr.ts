/**
 * Float.js SSR Engine
 * Server-Side Rendering with React 18 Streaming
 */

import React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { Writable } from 'node:stream';
import type { Route } from '../router/index.js';
import { transformFile } from '../build/transform.js';

export interface RenderOptions {
  hmrScript?: string;
  isDev?: boolean;
  streaming?: boolean;
}

export interface PageProps {
  params: Record<string, string>;
  searchParams: Record<string, string>;
}

/**
 * Render a page to HTML string
 */
export async function renderPage(
  route: Route,
  params: Record<string, string>,
  options: RenderOptions = {}
): Promise<string> {
  const { hmrScript = '', isDev = false, streaming = false } = options;
  void streaming; // Reserved for future streaming implementation

  try {
    // Load the page component
    const pageModule = await transformFile(route.absolutePath);
    const PageComponent = pageModule.default;

    if (!PageComponent) {
      throw new Error(`No default export found in ${route.filePath}`);
    }

    // Load layouts (from root to current)
    const layouts = await Promise.all(
      route.layouts.map(async (layoutPath) => {
        const layoutModule = await transformFile(layoutPath);
        return layoutModule.default;
      })
    );

    // Get metadata if exported
    const metadata = pageModule.metadata || {};
    const generateMetadata = pageModule.generateMetadata;

    let pageMetadata = metadata;
    if (generateMetadata) {
      pageMetadata = await generateMetadata({ params });
    }

    // Create props
    const props: PageProps = {
      params,
      searchParams: {},
    };

    // Build component tree with layouts
    let element: React.ReactElement = React.createElement(PageComponent, props);

    // Wrap with layouts (innermost to outermost)
    for (let i = layouts.length - 1; i >= 0; i--) {
      const Layout = layouts[i];
      if (Layout) {
        element = React.createElement(Layout, { children: element }) as React.ReactElement;
      }
    }

    // Render to HTML
    const content = renderToString(element);

    // Generate full HTML document
    const html = generateHtmlDocument({
      content,
      metadata: pageMetadata,
      hmrScript: isDev ? hmrScript : '',
      isDev,
    });

    return html;

  } catch (error: any) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
      console.error(`[Float SSR] Module Resolution Failed: ${route.path}`);
    }
    throw error;
  }
}

/**
 * Render with streaming (React 18 Suspense)
 */
export async function renderPageStream(
  route: Route,
  params: Record<string, string>,
  _options: RenderOptions = {}
): Promise<NodeJS.ReadableStream> {
  const pageModule = await transformFile(route.absolutePath);
  const PageComponent = pageModule.default;

  const props: PageProps = { params, searchParams: {} };
  const element = React.createElement(PageComponent, props);

  return new Promise((resolve, reject) => {
    let html = '';

    const writable = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk.toString();
        callback();
      },
      final(callback) {
        callback();
      }
    });

    const { pipe, abort } = renderToPipeableStream(element, {
      onShellReady() {
        pipe(writable);
      },
      onShellError(error) {
        reject(error);
      },
      onAllReady() {
        resolve(writable as any);
      },
      onError(error) {
        console.error('Streaming error:', error);
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => abort(), 10000);
  });
}

interface HtmlDocumentOptions {
  content: string;
  metadata: Record<string, any>;
  hmrScript: string;
  isDev: boolean;
  styles?: string;
  scripts?: string[];
}

/**
 * Generate full HTML document
 */
function generateHtmlDocument(options: HtmlDocumentOptions): string {
  const { content, metadata, hmrScript, isDev, styles = '', scripts = [] } = options;

  // Handle title which can be string or object with default/template
  let title = 'Float.js App';
  if (metadata.title) {
    if (typeof metadata.title === 'string') {
      title = metadata.title;
    } else if (typeof metadata.title === 'object' && metadata.title.default) {
      title = metadata.title.default;
    }
  }

  const description = metadata.description || '';
  const charset = metadata.charset || 'utf-8';
  const viewport = metadata.viewport || 'width=device-width, initial-scale=1';

  // Generate meta tags
  const metaTags = generateMetaTags(metadata);

  return `<!DOCTYPE html>
<html lang="${metadata.lang || 'en'}">
<head>
  <meta charset="${charset}">
  <meta name="viewport" content="${viewport}">
  <title>${escapeHtml(title)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
  ${metaTags}
  <meta name="generator" content="Float.js">
  <style>
    /* Float.js Base Styles */
    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ${styles}
  </style>
  ${isDev ? `
  <style>
    /* Dev mode indicator */
    body::after {
      content: 'DEV';
      position: fixed;
      bottom: 8px;
      right: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
      z-index: 99999;
      font-family: monospace;
    }
  </style>
  ` : ''}
</head>
<body>
  <div id="__float">${content}</div>
  ${hmrScript}
  ${scripts.map(src => `<script src="${src}"></script>`).join('\n  ')}
</body>
</html>`;
}

/**
 * Generate meta tags from metadata object
 */
function generateMetaTags(metadata: Record<string, any>): string {
  const tags: string[] = [];

  // Open Graph
  if (metadata.openGraph) {
    const og = metadata.openGraph;
    if (og.title) tags.push(`<meta property="og:title" content="${escapeHtml(og.title)}">`);
    if (og.description) tags.push(`<meta property="og:description" content="${escapeHtml(og.description)}">`);
    if (og.image) tags.push(`<meta property="og:image" content="${escapeHtml(og.image)}">`);
    if (og.url) tags.push(`<meta property="og:url" content="${escapeHtml(og.url)}">`);
    if (og.type) tags.push(`<meta property="og:type" content="${escapeHtml(og.type)}">`);
  }

  // Twitter
  if (metadata.twitter) {
    const tw = metadata.twitter;
    if (tw.card) tags.push(`<meta name="twitter:card" content="${escapeHtml(tw.card)}">`);
    if (tw.title) tags.push(`<meta name="twitter:title" content="${escapeHtml(tw.title)}">`);
    if (tw.description) tags.push(`<meta name="twitter:description" content="${escapeHtml(tw.description)}">`);
    if (tw.image) tags.push(`<meta name="twitter:image" content="${escapeHtml(tw.image)}">`);
  }

  // Robots
  if (metadata.robots) {
    const robots = typeof metadata.robots === 'string'
      ? metadata.robots
      : Object.entries(metadata.robots).map(([k, v]) => v ? k : `no${k}`).join(', ');
    tags.push(`<meta name="robots" content="${escapeHtml(robots)}">`);
  }

  // Icons
  if (metadata.icons) {
    const icons = metadata.icons;
    if (icons.icon) tags.push(`<link rel="icon" href="${escapeHtml(icons.icon)}">`);
    if (icons.apple) tags.push(`<link rel="apple-touch-icon" href="${escapeHtml(icons.apple)}">`);
  }

  // Canonical
  if (metadata.canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(metadata.canonical)}">`);
  }

  return tags.join('\n  ');
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export type { PageProps as FloatPageProps };
