/**
 * Bundle a multi-file React app (in-memory) into a single self-contained script
 * and return an HTML document that runs it in an iframe.
 *
 * React/react-dom are bundled IN (resolved from the app's node_modules) and the
 * output is a classic IIFE — no import maps, no CDN, no module resolution in the
 * iframe — so the preview is reliable and works offline.
 *
 * POST { files: { "App.tsx": "...", ... }, entry?: "App.tsx" } -> { html }
 */
import * as esbuild from 'esbuild';

export async function POST(request: Request): Promise<Response> {
  try {
    const { files, entry } = (await request.json()) as { files: Record<string, string>; entry?: string };
    if (!files || typeof files !== 'object' || Object.keys(files).length === 0) {
      return json({ error: 'No files provided', html: errorShell('No files generated') }, 200);
    }

    const entryFile = entry && files[entry] ? entry : pickEntry(files);
    const root = process.cwd();

    const bootstrap = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from ${JSON.stringify('/' + entryFile)};
const el = document.getElementById('root');
createRoot(el).render(React.createElement(App));
`;

    const result = await esbuild.build({
      stdin: { contents: bootstrap, loader: 'tsx', resolveDir: root, sourcefile: 'forge-entry.tsx' },
      bundle: true,
      write: false,
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      target: 'es2020',
      absWorkingDir: root,
      logLevel: 'silent',
      define: { 'process.env.NODE_ENV': '"development"' },
      plugins: [virtualFiles(files, root)],
    });

    const js = result.outputFiles?.[0]?.text ?? '';
    return json({ html: htmlShell(js), entry: entryFile });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    return json({ error: msg, html: errorShell(msg) }, 200);
  }
}

/** esbuild plugin: serve the provided files from memory; everything else (react,
 *  etc.) falls through to normal node_modules resolution. */
function virtualFiles(files: Record<string, string>, root: string) {
  // Resolve `imp` (e.g. './CalcButton', '../lib/x', '/App.tsx') relative to the
  // importing file, posix-style.
  const resolveRel = (fromFile: string, imp: string): string => {
    const fromDir = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/')) : '';
    const parts = imp.startsWith('/') ? [] : fromDir ? fromDir.split('/') : [];
    for (const seg of imp.split('/')) {
      if (seg === '' || seg === '.') continue;
      if (seg === '..') parts.pop();
      else parts.push(seg);
    }
    return parts.join('/');
  };
  const find = (base: string): string | null => {
    const cands = [base, `${base}.tsx`, `${base}.ts`, `${base}.jsx`, `${base}.js`, `${base}/index.tsx`, `${base}/index.ts`];
    for (const c of cands) if (files[c] != null) return c;
    return null;
  };
  return {
    name: 'forge-virtual',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.path.startsWith('.') || args.path.startsWith('/')) {
          // Resolve relative to the importing virtual file.
          const importer = args.namespace === 'forge' ? args.importer : '';
          const key = find(resolveRel(importer, args.path));
          if (key) return { path: key, namespace: 'forge' };
          return undefined;
        }
        // Bare import (react, etc.): only intercept if it's actually a generated file.
        const key = find(args.path.replace(/^\.?\//, ''));
        if (key) return { path: key, namespace: 'forge' };
        return undefined; // let esbuild resolve react/react-dom from node_modules
      });
      build.onLoad({ filter: /.*/, namespace: 'forge' }, (args) => {
        const ext = args.path.split('.').pop() || 'tsx';
        const loader = (['tsx', 'ts', 'jsx', 'js', 'css'].includes(ext) ? ext : 'tsx') as esbuild.Loader;
        return { contents: files[args.path] ?? '', loader, resolveDir: root };
      });
    },
  };
}

function pickEntry(files: Record<string, string>): string {
  const keys = Object.keys(files);
  return (
    keys.find((k) => /(^|\/)App\.(tsx|jsx)$/.test(k)) ||
    keys.find((k) => /(^|\/)index\.(tsx|jsx)$/.test(k)) ||
    keys.find((k) => /\.(tsx|jsx)$/.test(k)) ||
    keys[0]
  );
}

function htmlShell(js: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.tailwindcss.com"></script>
<style>body{margin:0;font-family:system-ui,sans-serif}#root{min-height:100vh}</style>
</head><body>
<div id="root"></div>
<script>
window.onerror=function(m,s,l,c,err){document.getElementById('root').innerHTML='<pre style="color:#b91c1c;padding:16px;white-space:pre-wrap;font-family:monospace">'+(err&&err.stack||m)+'</pre>';};
</script>
<script>${js}</script>
</body></html>`;
}

function errorShell(msg: string): string {
  return `<!DOCTYPE html><html><body style="font-family:monospace;padding:20px;color:#b91c1c;background:#fff">
<h3>Build error</h3><pre style="white-space:pre-wrap">${msg.replace(/</g, '&lt;')}</pre></body></html>`;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
