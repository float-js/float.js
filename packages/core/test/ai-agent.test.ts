import { describe, it, expect } from 'vitest';
import { defineAgent, tool, MockProvider } from '../dist/index.js';

const weather = tool({
  name: 'get_weather',
  description: 'Get the weather for a city',
  parameters: {
    type: 'object',
    properties: { city: { type: 'string', description: 'City name' } },
    required: ['city'],
  },
  execute: async ({ city }) => ({ city, tempC: 21 }),
});

describe('agent: tool-calling loop', () => {
  it('returns the final answer when no tools are requested', async () => {
    const provider = new MockProvider([{ text: 'Hello there!' }]);
    const agent = defineAgent({ provider });
    const result = await agent.run('hi');
    expect(result.text).toBe('Hello there!');
    expect(result.steps).toHaveLength(1);
    expect(result.invocations).toHaveLength(0);
    expect(result.stoppedEarly).toBe(false);
  });

  it('executes a requested tool and feeds the result back to the model', async () => {
    const provider = new MockProvider([
      { toolCalls: [{ name: 'get_weather', arguments: { city: 'Lima' } }] },
      { text: 'It is 21°C in Lima.' },
    ]);
    const agent = defineAgent({ provider, tools: [weather] });
    const result = await agent.run('weather in Lima?');

    expect(result.invocations).toHaveLength(1);
    expect(result.invocations[0].call.name).toBe('get_weather');
    expect(result.invocations[0].result).toEqual({ city: 'Lima', tempC: 21 });
    expect(result.text).toBe('It is 21°C in Lima.');
    expect(result.steps).toHaveLength(2);

    // The tool result must be present in the transcript for the model.
    const toolMsg = result.messages.find((m) => m.role === 'tool');
    expect(toolMsg?.content).toContain('21');
  });

  it('passes tool specs to the provider only when tools are configured', async () => {
    const provider = new MockProvider([{ text: 'ok' }]);
    const agent = defineAgent({ provider, tools: [weather] });
    await agent.run('hi');
    expect(provider.calls[0].tools?.[0].name).toBe('get_weather');
  });

  it('records an error invocation for an unknown tool without crashing', async () => {
    const provider = new MockProvider([
      { toolCalls: [{ name: 'does_not_exist', arguments: {} }] },
      { text: 'recovered' },
    ]);
    const agent = defineAgent({ provider, tools: [weather] });
    const result = await agent.run('go');
    expect(result.invocations[0].error).toContain('Unknown tool');
    expect(result.text).toBe('recovered');
  });

  it('surfaces tool validation errors as invocation errors', async () => {
    const provider = new MockProvider([
      { toolCalls: [{ name: 'get_weather', arguments: {} }] }, // missing required `city`
      { text: 'handled' },
    ]);
    const agent = defineAgent({ provider, tools: [weather] });
    const result = await agent.run('go');
    expect(result.invocations[0].error).toContain('city');
  });

  it('stops early at maxSteps if the model keeps calling tools', async () => {
    // Always request a tool -> loop should be bounded by maxSteps.
    const provider = new MockProvider(() => ({
      toolCalls: [{ name: 'get_weather', arguments: { city: 'X' } }],
    }));
    const agent = defineAgent({ provider, tools: [weather], maxSteps: 3 });
    const result = await agent.run('go');
    expect(result.stoppedEarly).toBe(true);
    expect(result.steps).toHaveLength(3);
  });

  it('accepts a message array as input', async () => {
    const provider = new MockProvider([{ text: 'done' }]);
    const agent = defineAgent({ provider });
    const result = await agent.run([
      { role: 'system', content: 'be terse' },
      { role: 'user', content: 'hi' },
    ]);
    expect(result.text).toBe('done');
  });
});
