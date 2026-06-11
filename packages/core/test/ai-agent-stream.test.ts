import { describe, it, expect } from 'vitest';
import { defineAgent, tool, MockProvider, agentStreamHandler } from '../dist/index.js';

const weather = tool({
  name: 'get_weather',
  description: 'weather',
  parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
  execute: async ({ city }) => ({ city, tempC: 21 }),
});

function scripted() {
  return new MockProvider([
    { toolCalls: [{ name: 'get_weather', arguments: { city: 'Lima' } }] },
    { text: 'It is 21°C in Lima.' },
  ]);
}

describe('agent.stream()', () => {
  it('emits start -> step -> tool_result -> step -> final in order', async () => {
    const agent = defineAgent({ provider: scripted(), tools: [weather] });
    const types: string[] = [];
    for await (const ev of agent.stream('weather in Lima?')) types.push(ev.type);
    expect(types[0]).toBe('start');
    expect(types).toContain('tool_result');
    expect(types[types.length - 1]).toBe('final');
  });

  it('carries the tool invocation result in the tool_result event', async () => {
    const agent = defineAgent({ provider: scripted(), tools: [weather] });
    const events = [] as any[];
    for await (const ev of agent.stream('x')) events.push(ev);
    const toolEvent = events.find((e) => e.type === 'tool_result');
    expect(toolEvent.invocation.result).toEqual({ city: 'Lima', tempC: 21 });
    const final = events.find((e) => e.type === 'final');
    expect(final.text).toBe('It is 21°C in Lima.');
    expect(final.stoppedEarly).toBe(false);
  });

  it('run() still returns the same aggregate result after the refactor', async () => {
    const agent = defineAgent({ provider: scripted(), tools: [weather] });
    const result = await agent.run('x');
    expect(result.text).toBe('It is 21°C in Lima.');
    expect(result.steps).toHaveLength(2);
    expect(result.invocations).toHaveLength(1);
    expect(result.invocations[0].result).toEqual({ city: 'Lima', tempC: 21 });
  });
});

describe('agentStreamHandler', () => {
  it('streams SSE agent events and terminates with [DONE]', async () => {
    const agent = defineAgent({ provider: scripted(), tools: [weather] });
    const handler = agentStreamHandler(agent);
    const res = await handler(
      new Request('http://x/api/agent', { method: 'POST', body: JSON.stringify({ input: 'go' }) })
    );
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');
    const body = await res.text();
    expect(body).toContain('"type":"start"');
    expect(body).toContain('"type":"tool_result"');
    expect(body).toContain('"type":"final"');
    expect(body.trimEnd().endsWith('data: [DONE]')).toBe(true);
  });
});
