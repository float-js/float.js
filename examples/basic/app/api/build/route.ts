/**
 * Forge — real-time app builder. Streams the model output so the client can
 * render it live as it's written.
 *
 * mode 'html'  -> a single self-contained HTML document (default)
 * mode 'react' -> a multi-file React app, files delimited by markers:
 *                 === FILE: App.tsx ===\n<content>\n=== FILE: Button.tsx ===...
 *                 (client parses these and POSTs them to /api/bundle)
 */

import { ai, streamResponse } from '@float.js/core';

const SYSTEM_HTML = `You are Forge, an elite web designer and front-end engineer.

You output a SINGLE, COMPLETE, self-contained HTML document and NOTHING else:
- Start at <!DOCTYPE html> and end at </html>.
- NO markdown code fences, NO explanations — only the HTML.
- Use Tailwind via <script src="https://cdn.tailwindcss.com"></script>.
- Make it modern, polished and responsive: gradients, spacing, rounded corners, good typography.
- Put interactivity in inline <script> with vanilla JS. Single file, no build step.
- Use real, sensible placeholder content.`;

const SYSTEM_REACT = `You are Forge, an elite React engineer.

You output a multi-file React app. Format EXACTLY like this, and NOTHING else:
=== FILE: App.tsx ===
<file content>
=== FILE: components/Button.tsx ===
<file content>

Rules:
- The entry file MUST be App.tsx with a default-exported component.
- Use React 18 + hooks. Use Tailwind utility classes (Tailwind is available globally).
- Split into a few sensible components/files. Use relative imports like './components/Button'.
- TypeScript (.tsx). No external npm packages beyond react/react-dom.
- NO markdown code fences, NO explanations — only the FILE blocks.`;

export async function POST(request: Request): Promise<Response> {
  const { prompt, current, mode } = (await request.json()) as {
    prompt: string;
    current?: string;
    mode?: 'html' | 'react';
  };

  const isReact = mode === 'react';
  const system = isReact ? SYSTEM_REACT : SYSTEM_HTML;

  const userContent = current
    ? `Here is the current ${isReact ? 'app' : 'HTML document'}:\n\n${current}\n\nApply this change and return the FULL updated ${isReact ? 'set of files' : 'HTML document'}:\n${prompt}`
    : `Build this: ${prompt}`;

  const stream = ai.streamChat({
    model: 'claude-sonnet-4-6',
    system,
    maxTokens: 8000,
    temperature: 0.4,
    messages: [{ role: 'user', content: userContent }],
  });

  return streamResponse(stream);
}
