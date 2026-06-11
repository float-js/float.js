/**
 * Publish a generated app: save the HTML and return a public URL (/p/<id>).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export async function POST(request: Request): Promise<Response> {
  try {
    const { code } = (await request.json()) as { code: string };
    if (!code || typeof code !== 'string') {
      return json({ error: 'Missing code' }, 400);
    }
    const id = crypto.randomBytes(5).toString('hex');
    const dir = path.join(process.cwd(), '.forge');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${id}.html`), code, 'utf-8');
    return json({ id, url: `/p/${id}` });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
