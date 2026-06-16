/**
 * Float.js SSR Engine
 * Server-Side Rendering with React 18 Streaming
 */

import React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { Writable } from 'node:stream';
import type { Route } from '../router/index.js';
import { transformFile } from '../build/transform.js';
import { renderHydrationScripts } from '../client/hydrate-runtime.js';

export interface RenderOptions {
  hmrScript?: string;
  isDev?: boolean;
  streaming?: boolean;
  /** Inject client hydration scripts so the page becomes interactive (default: true). */
  hydrate?: boolean;
  /** Request pathname, used to load the matching client bundle. */
  pathname?: string;
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
  const { hmrScript = '', isDev = false, streaming = false, hydrate = true, pathname } = options;
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

    // Build client hydration scripts so hooks/state run in the browser.
    const hydrationScripts =
      hydrate && route.type === 'page'
        ? renderHydrationScripts(pathname ?? route.path, { params, searchParams: {} })
        : '';

    // Generate full HTML document
    const html = generateHtmlDocument({
      content,
      metadata: pageMetadata,
      hmrScript: isDev ? hmrScript : '',
      isDev,
      hydrationScripts,
    });

    return html;

  } catch (error) {
    console.error('SSR Error:', error);
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
  hydrationScripts?: string;
}

/**
 * Generate full HTML document
 */
function generateHtmlDocument(options: HtmlDocumentOptions): string {
  const { content, metadata, hmrScript, isDev, styles = '', scripts = [], hydrationScripts = '' } = options;
  
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
  ${hydrationScripts}
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
  const meta = (name: string, content: any) => {
    if (content) tags.push(`<meta name="${name}" content="${escapeHtml(content)}">`);
  };
  const prop = (property: string, content: any) => {
    if (content) tags.push(`<meta property="${property}" content="${escapeHtml(content)}">`);
  };

  // Standard SEO
  if (Array.isArray(metadata.keywords)) meta('keywords', metadata.keywords.join(', '));
  else if (metadata.keywords) meta('keywords', metadata.keywords);
  if (Array.isArray(metadata.authors)) meta('author', metadata.authors.map((a: any) => a?.name || a).filter(Boolean).join(', '));
  meta('creator', metadata.creator);
  meta('publisher', metadata.publisher);
  meta('application-name', metadata.applicationName);
  meta('theme-color', metadata.themeColor);
  meta('color-scheme', metadata.colorScheme);

  // Open Graph
  if (metadata.openGraph) {
    const og = metadata.openGraph;
    prop('og:title', og.title || metadata.title);
    prop('og:description', og.description || metadata.description);
    prop('og:url', og.url);
    prop('og:type', og.type || 'website');
    prop('og:site_name', og.siteName);
    prop('og:locale', og.locale);
    const images = og.images || (og.image ? [og.image] : []);
    for (const img of images) {
      const url = typeof img === 'string' ? img : img?.url;
      if (!url) continue;
      prop('og:image', url);
      if (typeof img === 'object') {
        if (img.width) prop('og:image:width', img.width);
        if (img.height) prop('og:image:height', img.height);
        if (img.alt) prop('og:image:alt', img.alt);
      }
    }
  }

  // Twitter
  if (metadata.twitter) {
    const tw = metadata.twitter;
    meta('twitter:card', tw.card || 'summary_large_image');
    meta('twitter:title', tw.title || metadata.title);
    meta('twitter:description', tw.description || metadata.description);
    meta('twitter:site', tw.site);
    meta('twitter:creator', tw.creator);
    const tImages = tw.images || (tw.image ? [tw.image] : []);
    for (const img of tImages) meta('twitter:image', typeof img === 'string' ? img : img?.url);
  }

  // Robots
  if (metadata.robots) {
    const robots = typeof metadata.robots === 'string'
      ? metadata.robots
      : Object.entries(metadata.robots)
          .filter(([k]) => k === 'index' || k === 'follow')
          .map(([k, v]) => (v ? k : `no${k}`))
          .join(', ');
    meta('robots', robots);
  }

  // Icons
  if (metadata.icons) {
    const icons = metadata.icons;
    const iconUrl = typeof icons.icon === 'string' ? icons.icon : Array.isArray(icons.icon) ? icons.icon[0]?.url : undefined;
    if (iconUrl) tags.push(`<link rel="icon" href="${escapeHtml(iconUrl)}">`);
    const appleUrl = typeof icons.apple === 'string' ? icons.apple : Array.isArray(icons.apple) ? icons.apple[0]?.url : undefined;
    if (appleUrl) tags.push(`<link rel="apple-touch-icon" href="${escapeHtml(appleUrl)}">`);
  }
  if (metadata.manifest) tags.push(`<link rel="manifest" href="${escapeHtml(metadata.manifest)}">`);

  // Canonical
  if (metadata.canonical) tags.push(`<link rel="canonical" href="${escapeHtml(metadata.canonical)}">`);

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
