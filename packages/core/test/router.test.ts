import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanRoutes, matchRoute } from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.join(__dirname, 'fixtures');

describe('router: scanRoutes', () => {
  it('discovers pages and api routes, skips layouts', async () => {
    const routes = await scanRoutes(fixtureRoot);
    const paths = routes.map((r) => `${r.type}:${r.path}`).sort();
    expect(paths).toContain('page:/');
    expect(paths).toContain('page:/about');
    expect(paths).toContain('page:/blog/:slug');
    expect(paths).toContain('api:/api/ping');
    // layouts are not matchable routes
    expect(paths.some((p) => p.includes('layout'))).toBe(false);
  });

  it('maps catch-all segments and records params', async () => {
    const routes = await scanRoutes(fixtureRoot);
    const docs = routes.find((r) => r.path.startsWith('/docs'));
    expect(docs).toBeTruthy();
    expect(docs!.isCatchAll).toBe(true);
    expect(docs!.params).toContain('slug');
  });

  it('attaches the root layout to pages', async () => {
    const routes = await scanRoutes(fixtureRoot);
    const home = routes.find((r) => r.path === '/');
    expect(home!.layouts.length).toBeGreaterThan(0);
  });
});

describe('router: matchRoute', () => {
  it('matches static routes exactly', async () => {
    const routes = await scanRoutes(fixtureRoot);
    const { route, params } = matchRoute('/about', routes);
    expect(route?.path).toBe('/about');
    expect(params).toEqual({});
  });

  it('matches dynamic segments and extracts params', async () => {
    const routes = await scanRoutes(fixtureRoot);
    const { route, params } = matchRoute('/blog/hello-world', routes);
    expect(route?.path).toBe('/blog/:slug');
    expect(params.slug).toBe('hello-world');
  });

  it('matches catch-all and joins the rest of the path', async () => {
    const routes = await scanRoutes(fixtureRoot);
    const { route, params } = matchRoute('/docs/a/b/c', routes);
    expect(route?.path.startsWith('/docs')).toBe(true);
    expect(params.slug).toBe('a/b/c');
  });

  it('returns null for unknown routes', async () => {
    const routes = await scanRoutes(fixtureRoot);
    const { route } = matchRoute('/this/does/not/exist-xyz', routes);
    expect(route).toBeNull();
  });

  it('prefers static routes over dynamic ones', async () => {
    const routes = await scanRoutes(fixtureRoot);
    // '/about' is static; it must win even though '/blog/:slug' is dynamic.
    const { route } = matchRoute('/about', routes);
    expect(route?.path).toBe('/about');
  });
});
