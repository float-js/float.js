import { defineAgent, tool, agentHandler } from '@float.js/core';

const getWeather = tool({
  name: 'get_weather',
  description: 'Get the current weather for a city',
  parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
  execute: async ({ city }) => ({ city, tempC: 21, condition: 'sunny' }),
});

const agent = defineAgent({ system: 'You are a helpful weather assistant.', tools: [getWeather] });

export const POST = agentHandler(agent);
