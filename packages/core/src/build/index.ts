/**
 * Float.js Build System
 * Fast builds with esbuild
 */

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { scanRoutes, type Route } from '../router/index.js';
import { renderPage } from '../server/ssr.js';

export interface BuildOptions {
  analyze?: boolean;
  minify?: boolean;
  sourcemap?: boolean;
}

export interface BuildResult {
  routes: Route[];
  duration: number;
  outputDir: string;
  pages: string[];
  assets: string[];
}

const DEFAULT_BUILD_OPTIONS: Required<BuildOptions> = {
  analyze: false,
  minify: true,
  sourcemap: true,
};

export async function build(options: BuildOptions = {}): Promise<BuildResult> {
  const opts = { ...DEFAULT_BUILD_OPTIONS, ...options };
  const startTime = Date.now();
  const rootDir = process.cwd();
  const outputDir = path.join(rootDir, '.float');

  // Clean output directory
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'static'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'server'), { recursive: true });

  console.log(pc.dim('  Scanning routes...'));

  // Scan routes
  const routes = await scanRoutes(rootDir);
  const pageRoutes = routes.filter(r => r.type === 'page' && !r.params.length);
  const dynamicRoutes = routes.filter(r => r.type === 'page' && r.params.length > 0);
  const apiRoutes = routes.filter(r => r.type === 'api');

  console.log(pc.dim(`  Found ${pageRoutes.length} static pages, ${dynamicRoutes.length} dynamic routes, ${apiRoutes.length} API routes`));

  // Build client bundle
  console.log(pc.dim('  Building client bundle...'));
  
  const clientEntryPoints = routes
    .filter(r => r.type === 'page')
    .map(r => r.absolutePath);

  if (clientEntryPoints.length > 0) {
    await esbuild.build({
      entryPoints: clientEntryPoints,
      bundle: true,
      outdir: path.join(outputDir, 'static', '_float'),
      format: 'esm',
      splitting: true,
      minify: opts.minify,
      sourcemap: opts.sourcemap,
      target: ['es2020'],
      platform: 'browser',
      jsx: 'automatic',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
        '.css': 'css',
        '.svg': 'dataurl',
        '.png': 'dataurl',
        '.jpg': 'dataurl',
      },
      external: ['react', 'react-dom'],
      metafile: opts.analyze,
    });
  }

  // Build server bundle
  console.log(pc.dim('  Building server bundle...'));

  const serverEntryPoints = routes.map(r => r.absolutePath);

  if (serverEntryPoints.length > 0) {
    await esbuild.build({
      entryPoints: serverEntryPoints,
      bundle: true,
      outdir: path.join(outputDir, 'server'),
      format: 'esm',
      platform: 'node',
      target: ['node18'],
      jsx: 'automatic',
      minify: false, // Keep server code readable
      sourcemap: true,
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
      },
      external: ['react', 'react-dom', '@float/core'],
    });
  }

  // Pre-render static pages (SSG)
  console.log(pc.dim('  Pre-rendering static pages...'));
  const prerenderedPages: string[] = [];

  for (const route of pageRoutes) {
    try {
      const html = await renderPage(route, {}, { isDev: false });
      const outputPath = route.path === '/' 
        ? path.join(outputDir, 'pages', 'index.html')
        : path.join(outputDir, 'pages', route.path, 'index.html');
      
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, html);
      prerenderedPages.push(route.path);
      
      console.log(pc.dim(`    ✓ ${route.path}`));
    } catch (error) {
      console.log(pc.yellow(`    ⚠ ${route.path} (will render at runtime)`));
    }
  }

  // Build API routes for edge
  console.log(pc.dim('  Building API routes...'));

  for (const route of apiRoutes) {
    await esbuild.build({
      entryPoints: [route.absolutePath],
      bundle: true,
      outfile: path.join(outputDir, 'server', 'api', `${route.path.replace(/\//g, '_')}.js`),
      format: 'esm',
      platform: 'neutral', // Edge compatible
      target: ['es2020'],
      minify: true,
    });
  }

  // Copy public files
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    console.log(pc.dim('  Copying public assets...'));
    copyDir(publicDir, path.join(outputDir, 'static'));
  }

  // Generate routes manifest
  const manifest = {
    version: 1,
    buildTime: new Date().toISOString(),
    routes: routes.map(r => ({
      path: r.path,
      type: r.type,
      filePath: r.filePath,
      absolutePath: path.relative(rootDir, r.absolutePath),
      params: r.params,
      isCatchAll: r.isCatchAll,
      isOptionalCatchAll: r.isOptionalCatchAll,
      layouts: r.layouts.map(l => path.relative(rootDir, l)),
      prerendered: prerenderedPages.includes(r.path),
    })),
    staticPages: prerenderedPages,
    dynamicRoutes: dynamicRoutes.map(r => r.path),
    apiRoutes: apiRoutes.map(r => r.path),
  };

  fs.writeFileSync(
    path.join(outputDir, 'routes-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Generate build info
  const duration = Date.now() - startTime;
  
  const buildInfo = {
    duration,
    timestamp: new Date().toISOString(),
    routes: routes.length,
    pages: prerenderedPages.length,
  };

  fs.writeFileSync(
    path.join(outputDir, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );

  // Print summary
  console.log('');
  console.log(pc.bold('  Build Summary:'));
  console.log(pc.dim(`    Static Pages:   ${prerenderedPages.length}`));
  console.log(pc.dim(`    Dynamic Routes: ${dynamicRoutes.length}`));
  console.log(pc.dim(`    API Routes:     ${apiRoutes.length}`));
  console.log(pc.dim(`    Output:         .float/`));

  return {
    routes,
    duration,
    outputDir,
    pages: prerenderedPages,
    assets: [],
  };
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
