import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanRoutes, matchRoute, renderPage } from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.join(__dirname, 'fixtures');

async function render(urlPath: string) {
  const routes = await scanRoutes(fixtureRoot);
  const { route, params } = matchRoute(urlPath, routes);
  if (!route) throw new Error(`no route for ${urlPath}`);
  return renderPage(route, params, { pathname: urlPath });
}

describe('ssr: renderPage', () => {
  it('renders page content inside the #__float root', async () => {
    const html = await render('/');
    expect(html).toContain('<div id="__float">');
    expect(html).toContain('Home Page');
  });

  it('wraps the page in its layout', async () => {
    const html = await render('/');
    expect(html).toContain('class="root-layout"');
  });

  it('applies metadata from the layout (title)', async () => {
    const html = await render('/');
    expect(html).toContain('<title>Fixture App</title>');
  });

  it('renders dynamic route params into the markup', async () => {
    const html = await render('/blog/my-post');
    expect(html).toContain('my-post');
  });

  it('injects client hydration bootstrap (props + bundle script)', async () => {
    const html = await render('/blog/my-post');
    expect(html).toContain('window.__FLOAT_DATA__');
    expect(html).toContain('"slug":"my-post"');
    expect(html).toContain('/_float/client.js?path=');
    expect(html).toContain('type="module"');
  });

  it('can disable hydration', async () => {
    const routes = await scanRoutes(fixtureRoot);
    const { route, params } = matchRoute('/', routes);
    const html = await renderPage(route!, params, { hydrate: false });
    expect(html).not.toContain('window.__FLOAT_DATA__');
  });
});
