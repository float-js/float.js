import { describe, it, expect } from 'vitest';
import { MockProvider, ai, agentHandler, defineAgent } from '../dist/index.js';

describe('MockProvider', () => {
  it('echoes the last user message by default', async () => {
    const p = new MockProvider();
    const res = await p.generate({ messages: [{ role: 'user', content: 'ping' }] });
    expect(res.text).toBe('echo: ping');
    expect(res.finishReason).toBe('stop');
  });

  it('plays scripted turns in order and records calls', async () => {
    const p = new MockProvider([{ text: 'first' }, { text: 'second' }]);
    expect((await p.generate({ messages: [] })).text).toBe('first');
    expect((await p.generate({ messages: [] })).text).toBe('second');
    expect(p.calls).toHaveLength(2);
  });

  it('emits tool calls with stable ids', async () => {
    const p = new MockProvider([
      { toolCalls: [{ name: 'search', arguments: { q: 'x' } }] },
    ]);
    const res = await p.generate({ messages: [] });
    expect(res.finishReason).toBe('tool_calls');
    expect(res.toolCalls[0].name).toBe('search');
    expect(res.toolCalls[0].id).toBeTruthy();
  });

  it('streams text word by word', async () => {
    const p = new MockProvider([{ text: 'hello world' }]);
    const chunks: string[] = [];
    for await (const c of p.stream({ messages: [{ role: 'user', content: 'x' }] })) {
      chunks.push(c);
    }
    expect(chunks.join('')).toBe('hello world');
  });
});

describe('ai singleton', () => {
  it('can register and use a mock provider for chat', async () => {
    ai.register(new MockProvider([{ text: 'from mock' }])).use('mock');
    const out = await ai.chat('hello');
    expect(out).toBe('from mock');
  });
});

describe('agentHandler', () => {
  it('runs an agent from a POST body and returns JSON', async () => {
    const agent = defineAgent({ provider: new MockProvider([{ text: 'answer' }]) });
    const handler = agentHandler(agent);
    const res = await handler(
      new Request('http://x/api/agent', {
        method: 'POST',
        body: JSON.stringify({ input: 'question' }),
      })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.text).toBe('answer');
    expect(Array.isArray(data.steps)).toBe(true);
  });
});
