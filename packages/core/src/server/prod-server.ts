/**
 * Float.js Production Server
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import mime from 'mime-types';
import { matchRoute, type Route } from '../router/index.js';
import { renderPage } from './ssr.js';

export interface ProdServerOptions {
  port: number;
  host: string;
}

// Pre-built routes cache
let cachedRoutes: Route[] = [];
let pageCache = new Map<string, string>();

export async function startProductionServer(options: ProdServerOptions): Promise<void> {
  const { port, host } = options;
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, '.float');
  const publicDir = path.join(rootDir, 'public');

  // Load pre-built routes manifest
  const manifestPath = path.join(distDir, 'routes-manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    cachedRoutes = manifest.routes;
    console.log(pc.dim(`  📦 Loaded ${cachedRoutes.length} routes from manifest`));
  } else {
    console.error(pc.red('  ❌ No build manifest found. Run `float build` first.'));
    process.exit(1);
  }

  // Load pre-rendered pages
  const pagesDir = path.join(distDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    const prerenderedFiles = fs.readdirSync(pagesDir, { recursive: true }) as string[];
    for (const file of prerenderedFiles) {
      if (file.endsWith('.html')) {
        const routePath = '/' + file.replace(/\.html$/, '').replace(/index$/, '');
        const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
        pageCache.set(routePath, content);
      }
    }
    console.log(pc.dim(`  📄 Loaded ${pageCache.size} pre-rendered pages`));
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    const pathname = url.pathname;

    try {
      // Serve static assets from .float/static
      const staticPath = path.join(distDir, 'static', pathname);
      if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
        const content = fs.readFileSync(staticPath);
        const contentType = mime.lookup(staticPath) || 'application/octet-stream';
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        });
        res.end(content);
        return;
      }

      // Serve public files
      const publicFilePath = path.join(publicDir, pathname);
      if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
        const content = fs.readFileSync(publicFilePath);
        const contentType = mime.lookup(publicFilePath) || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }

      // Check pre-rendered cache
      const cachedPage = pageCache.get(pathname) || pageCache.get(pathname + '/');
      if (cachedPage) {
        res.writeHead(200, { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
        });
        res.end(cachedPage);
        return;
      }

      // Match and render route (SSR)
      const { route, params } = matchRoute(pathname, cachedRoutes);

      if (!route) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Not Found</h1>');
        return;
      }

      // Handle API routes
      if (route.type === 'api') {
        // API routes handled by edge functions in production
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'API route' }));
        return;
      }

      // SSR render
      const html = await renderPage(route, params, { isDev: false });
      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      });
      res.end(html);

    } catch (error) {
      console.error(pc.red('Request error:'), error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>500 - Internal Server Error</h1>');
    }
  });

  server.listen(port, host, () => {
    console.log(pc.green(`  ✅ Production server running at ${pc.cyan(`http://${host}:${port}`)}\n`));
  });
}
