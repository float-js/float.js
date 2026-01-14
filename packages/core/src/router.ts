import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RouteModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader?: () => Promise<any>;
}

export interface RouteConfig {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader?: () => Promise<any>;
}

export class Router {
  private routes: Map<string, RouteConfig> = new Map();
  private root: string;

  constructor(root: string) {
    this.root = root;
  }

  async scanRoutes(): Promise<void> {
    const pagesDir = path.join(this.root, 'src', 'pages');

    try {
      await fs.access(pagesDir);
    } catch {
      // Pages directory doesn't exist yet
      return;
    }

    const files = await this.getFiles(pagesDir);

    for (const file of files) {
      const relativePath = path.relative(pagesDir, file);
      const routePath = this.filePathToRoute(relativePath);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const component = (async () => {
        const mod = await import(file);
        return mod.default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.routes.set(routePath, {
        path: routePath,
        component,
      } as any);
    }
  }

  private async getFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map((entry) => {
        const res = path.resolve(dir, entry.name);
        return entry.isDirectory() ? this.getFiles(res) : [res];
      })
    );
    return files.flat().filter((file) => /\.(tsx?|jsx?)$/.test(file));
  }

  private filePathToRoute(filePath: string): string {
    let route = filePath
      .replace(/\.(tsx?|jsx?)$/, '')
      .replace(/\\/g, '/')
      .replace(/index$/, '');

    // Handle dynamic routes: [id] -> :id
    route = route.replace(/\[([^\]]+)\]/g, ':$1');

    if (!route.startsWith('/')) {
      route = '/' + route;
    }

    if (route.endsWith('/') && route !== '/') {
      route = route.slice(0, -1);
    }

    return route || '/';
  }

  getRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  matchRoute(pathname: string): RouteConfig | null {
    // Exact match first
    if (this.routes.has(pathname)) {
      return this.routes.get(pathname)!;
    }

    // Try pattern matching for dynamic routes
    for (const [pattern, config] of this.routes) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
      if (regex.test(pathname)) {
        return config;
      }
    }

    return null;
  }
}
