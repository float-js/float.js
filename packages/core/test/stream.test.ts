import { describe, it, expect } from 'vitest';
import { readStream, streamResponse, sseResponse, aiAction } from '../dist/index.js';

function streamOf(strings: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const s of strings) controller.enqueue(encoder.encode(s));
      controller.close();
    },
  });
}

async function* gen(items: string[]) {
  for (const i of items) yield i;
}

describe('readStream (client)', () => {
  it('reads a plain-text stream as raw chunks', async () => {
    const out: string[] = [];
    for await (const c of readStream(streamOf(['Hel', 'lo!']), 'text')) out.push(c);
    expect(out.join('')).toBe('Hello!');
  });

  it('parses SSE data frames and stops on [DONE]', async () => {
    const frames = streamOf([
      'data: "Hello"\n\n',
      'data: " world"\n\n',
      'data: [DONE]\n\n',
      'data: "ignored"\n\n',
    ]);
    const out: string[] = [];
    for await (const c of readStream(frames, 'sse')) out.push(c);
    expect(out.join('')).toBe('Hello world');
  });
});

describe('streamResponse / sseResponse (server)', () => {
  it('streamResponse emits raw text', async () => {
    const res = streamResponse(gen(['a', 'b', 'c']));
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(await res.text()).toBe('abc');
  });

  it('sseResponse frames chunks and appends [DONE]', async () => {
    const res = sseResponse(gen(['x', 'y']));
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');
    const body = await res.text();
    expect(body).toContain('data: "x"');
    expect(body).toContain('data: "y"');
    expect(body).toContain('data: [DONE]');
  });

  it('round-trips sseResponse through readStream', async () => {
    const res = sseResponse(gen(['one', ' two']));
    const out: string[] = [];
    for await (const c of readStream(res.body!, 'sse')) out.push(c);
    expect(out.join('')).toBe('one two');
  });
});

describe('aiAction', () => {
  it('returns JSON for a string-returning handler', async () => {
    const handler = aiAction<{ name: string }>(async ({ name }) => `hi ${name}`);
    const res = await handler(
      new Request('http://x/api', { method: 'POST', body: JSON.stringify({ name: 'Ana' }) })
    );
    expect(await res.json()).toEqual({ content: 'hi Ana' });
  });

  it('streams for an async-iterable-returning handler', async () => {
    const handler = aiAction<{ q: string }>(() => gen(['a', 'b']));
    const res = await handler(
      new Request('http://x/api', { method: 'POST', body: JSON.stringify({ q: 'x' }) })
    );
    expect(await res.text()).toBe('ab');
  });
});
