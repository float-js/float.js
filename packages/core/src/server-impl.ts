import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ServerConfig {
  port: number;
  root: string;
}

export function createServer(config: ServerConfig): http.Server {
  return http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // Serve static files from dist
    if (url.pathname.startsWith('/public/') || url.pathname === '/client.js') {
      const filePath = path.join(config.root, 'dist', url.pathname);
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        const ext = path.extname(filePath);
        const contentType = getContentType(ext);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
      return;
    }

    // Serve HTML for all other routes
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
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
}

function getContentType(ext: string): string {
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
