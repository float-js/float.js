/**
 * Bundle a multi-file React app (in-memory) into a single ESM module and return
 * an HTML document that runs it in an iframe. React is loaded from esm.sh via an
 * import map, so we don't need to ship node_modules to the preview.
 *
 * POST { files: { "App.tsx": "...", "Button.tsx": "..." }, entry?: "App.tsx" }
 *  -> { html }  (full document ready for an iframe srcDoc)
 */
import * as esbuild from 'esbuild';

const EXTERNAL = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'];

const IMPORTMAP = {
  imports: {
    react: 'https://esm.sh/react@18.2.0',
    'react-dom': 'https://esm.sh/react-dom@18.2.0',
    'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
    'react/jsx-runtime': 'https://esm.sh/react@18.2.0/jsx-runtime',
    'react/jsx-dev-runtime': 'https://esm.sh/react@18.2.0/jsx-dev-runtime',
  },
};

export async function POST(request: Request): Promise<Response> {
  try {
    const { files, entry } = (await request.json()) as {
      files: Record<string, string>;
      entry?: string;
    };
    if (!files || typeof files !== 'object' || Object.keys(files).length === 0) {
      return json({ error: 'No files provided' }, 400);
    }

    const entryFile = entry && files[entry] ? entry : pickEntry(files);

    // Virtual entry that mounts the app's default export into #root.
    const ENTRY = '\0forge-entry';
    const bootstrap = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from ${JSON.stringify('/' + entryFile)};
createRoot(document.getElementById('root')).render(React.createElement(App));
`;

    const result = await esbuild.build({
      stdin: { contents: bootstrap, loader: 'tsx', resolveDir: '/', sourcefile: ENTRY },
      bundle: true,
      write: false,
      format: 'esm',
      jsx: 'automatic',
      target: 'es2020',
      logLevel: 'silent',
      external: EXTERNAL,
      plugins: [virtualFiles(files)],
    });

    const js = result.outputFiles?.[0]?.text ?? '';
    return json({ html: htmlShell(js), entry: entryFile });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    return json({ error: msg, html: errorShell(msg) }, 200);
  }
}

/** esbuild plugin that serves the provided files from memory. */
function virtualFiles(files: Record<string, string>) {
  const norm = (p: string) => p.replace(/^\.?\//, '');
  const find = (p: string): string | null => {
    const base = norm(p);
    const cands = [base, `${base}.tsx`, `${base}.ts`, `${base}.jsx`, `${base}.js`, `${base}/index.tsx`, `${base}/index.ts`];
    for (const c of cands) if (files[c] != null) return c;
    return null;
  };
  return {
    name: 'forge-virtual',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (EXTERNAL.includes(args.path)) return undefined; // let esbuild externalize
        const key = find(args.path);
        if (key) return { path: key, namespace: 'forge' };
        // Unknown bare import -> externalize so the bundle still builds.
        return { path: args.path, external: true };
      });
      build.onLoad({ filter: /.*/, namespace: 'forge' }, (args) => {
        const ext = args.path.split('.').pop() || 'tsx';
        const loader = (['tsx', 'ts', 'jsx', 'js', 'css'].includes(ext) ? ext : 'tsx') as esbuild.Loader;
        return { contents: files[args.path] ?? '', loader, resolveDir: '/' };
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
<script type="importmap">${JSON.stringify(IMPORTMAP)}</script>
<style>body{margin:0;font-family:system-ui,sans-serif}</style>
</head><body>
<div id="root"></div>
<script type="module">
window.onerror=(m)=>{document.getElementById('root').innerHTML='<pre style="color:#b91c1c;padding:16px;white-space:pre-wrap">'+m+'</pre>'};
${js}
</script>
</body></html>`;
}

function errorShell(msg: string): string {
  return `<!DOCTYPE html><html><body style="font-family:monospace;padding:20px;color:#b91c1c">
<h3>Build error</h3><pre style="white-space:pre-wrap">${msg.replace(/</g, '&lt;')}</pre></body></html>`;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
