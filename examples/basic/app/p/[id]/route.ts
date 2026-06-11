/**
 * Serve a published Forge app at /p/<id>.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function GET(_request: Request, ctx: { params: { id: string } }): Promise<Response> {
  const id = (ctx?.params?.id || '').replace(/[^a-f0-9]/gi, '');
  const file = path.join(process.cwd(), '.forge', `${id}.html`);
  if (!id || !fs.existsSync(file)) {
    return new Response('<h1>404 — published app not found</h1>', {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
  }
  return new Response(fs.readFileSync(file, 'utf-8'), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
