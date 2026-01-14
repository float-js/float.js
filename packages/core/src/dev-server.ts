import * as http from 'node:http';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import chokidar from 'chokidar';
import * as esbuild from 'esbuild';
import pc from 'picocolors';
import { Router } from './router';

export interface DevServerConfig {
  port: number;
  root: string;
}

export class DevServer {
  private config: DevServerConfig;
  private server?: http.Server;
  private wss?: WebSocketServer;
  private router: Router;
  private clients: Set<WebSocket> = new Set();

  constructor(config: DevServerConfig) {
    this.config = config;
    this.router = new Router(config.root);
  }

  async start(): Promise<void> {
    await this.router.scanRoutes();

    // Create HTTP server
    this.server = http.createServer(async (req, res) => {
      await this.handleRequest(req, res);
    });

    // Create WebSocket server for HMR
    this.wss = new WebSocketServer({ server: this.server });
    this.setupHMR();

    // Watch for file changes
    this.setupFileWatcher();

    this.server.listen(this.config.port, () => {
      console.log(pc.green(`✓ Dev server running at http://localhost:${this.config.port}`));
      console.log(pc.dim(`  Ready in ${Date.now()} ms`));
    });
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // Serve static files
    if (url.pathname.startsWith('/public/')) {
      await this.serveStatic(url.pathname, res);
      return;
    }

    // HMR client script
    if (url.pathname === '/__float_hmr__') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(this.getHMRClientScript());
      return;
    }

    // Bundle and serve client-side code
    if (url.pathname === '/client.js') {
      await this.serveClientBundle(res);
      return;
    }

    // SSR for all other routes
    await this.serveSSR(url.pathname, res);
  }

  private async serveStatic(pathname: string, res: http.ServerResponse): Promise<void> {
    const filePath = path.join(this.config.root, pathname);
    try {
      const content = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      const contentType = this.getContentType(ext);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  private async serveClientBundle(res: http.ServerResponse): Promise<void> {
    try {
      const entryFile = path.join(this.config.root, 'src', 'entry-client.tsx');

      // Check if entry file exists, create default if not
      try {
        await fs.access(entryFile);
      } catch {
        await this.createDefaultEntry();
      }

      const result = await esbuild.build({
        entryPoints: [entryFile],
        bundle: true,
        format: 'esm',
        jsx: 'automatic',
        write: false,
        platform: 'browser',
        target: 'es2020',
        loader: {
          '.tsx': 'tsx',
          '.ts': 'ts',
          '.jsx': 'jsx',
          '.js': 'js',
        },
      });

      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(result.outputFiles[0].text);
    } catch (error) {
      console.error(pc.red('Error bundling client code:'), error);
      res.writeHead(500);
      res.end('Internal server error');
    }
  }

  private async serveSSR(_pathname: string, res: http.ServerResponse): Promise<void> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Float.js</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/client.js"></script>
  <script type="module" src="/__float_hmr__"></script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  private setupHMR(): void {
    this.wss?.on('connection', (ws) => {
      this.clients.add(ws);
      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  private setupFileWatcher(): void {
    const watcher = chokidar.watch(path.join(this.config.root, 'src'), {
      ignored: /(^|[/\\])\../,
      persistent: true,
    });

    watcher.on('change', (filePath) => {
      console.log(pc.cyan(`File changed: ${filePath}`));
      this.notifyClients('update');
    });
  }

  private notifyClients(type: string): void {
    const message = JSON.stringify({ type });
    this.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  private getHMRClientScript(): string {
    return `
const ws = new WebSocket('ws://localhost:${this.config.port}');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'update') {
    console.log('[Float HMR] Reloading...');
    location.reload();
  }
};
ws.onerror = () => console.error('[Float HMR] Connection error');
`;
  }

  private async createDefaultEntry(): Promise<void> {
    const srcDir = path.join(this.config.root, 'src');
    const entryFile = path.join(srcDir, 'entry-client.tsx');
    const appFile = path.join(srcDir, 'App.tsx');

    await fs.mkdir(srcDir, { recursive: true });

    if (!(await this.fileExists(appFile))) {
      await fs.writeFile(
        appFile,
        `export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Welcome to Float.js ⚡</h1>
      <p>Ultra-fast React framework for the AI era.</p>
    </div>
  );
}
`
      );
    }

    await fs.writeFile(
      entryFile,
      `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
`
    );
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    return types[ext] || 'application/octet-stream';
  }

  async stop(): Promise<void> {
    this.wss?.close();
    await new Promise<void>((resolve) => {
      this.server?.close(() => resolve());
    });
  }
}
