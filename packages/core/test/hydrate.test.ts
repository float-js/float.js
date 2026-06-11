import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  scanRoutes,
  matchRoute,
  generateClientEntry,
  buildClientBundle,
  renderHydrationScripts,
} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.join(__dirname, 'fixtures');

async function pageRoute(urlPath: string) {
  const routes = await scanRoutes(fixtureRoot);
  const { route } = matchRoute(urlPath, routes);
  if (!route) throw new Error(`no route for ${urlPath}`);
  return route;
}

describe('hydration: generateClientEntry', () => {
  it('emits a hydrateRoot entry importing the page and layouts', async () => {
    const route = await pageRoute('/');
    const entry = generateClientEntry(route);
    expect(entry).toContain("import { hydrateRoot } from 'react-dom/client'");
    expect(entry).toContain('import Page from');
    expect(entry).toContain('import Layout_0 from');
    expect(entry).toContain("getElementById('__float')");
  });
});

describe('hydration: buildClientBundle', () => {
  it('bundles a route into browser-ready JS containing the page output', async () => {
    const route = await pageRoute('/');
    const code = await buildClientBundle(route, { rootDir: fixtureRoot });
    expect(code.length).toBeGreaterThan(500);
    // The page text and hydration target survive bundling.
    expect(code).toContain('Home Page');
    expect(code).toContain('__float');
  });

  it('serves a cache hit (same code) on repeated builds', async () => {
    const route = await pageRoute('/about');
    const a = await buildClientBundle(route, { rootDir: fixtureRoot });
    const b = await buildClientBundle(route, { rootDir: fixtureRoot });
    expect(a).toBe(b);
    expect(a).toContain('About Page');
  });
});

describe('hydration: renderHydrationScripts', () => {
  it('serializes props and points to the route bundle', () => {
    const html = renderHydrationScripts('/blog/x', {
      params: { slug: 'x' },
      searchParams: {},
    });
    expect(html).toContain('window.__FLOAT_DATA__');
    expect(html).toContain('"slug":"x"');
    expect(html).toContain('/_float/client.js?path=%2Fblog%2Fx');
  });

  it('escapes </script> to prevent breaking out of the inline script', () => {
    const html = renderHydrationScripts('/', {
      params: { x: '</script>' },
      searchParams: {},
    });
    expect(html).not.toContain('</script><');
    expect(html).toContain('\\u003c');
  });
});
