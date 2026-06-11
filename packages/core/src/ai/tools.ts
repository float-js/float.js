/**
 * Float.js AI Tools
 *
 * Define typed tools an agent can call. A tool pairs a JSON-schema parameter
 * description (sent to the model) with an `execute` function (run on the
 * server), plus lightweight runtime validation of the model's arguments.
 */

import type { JSONSchema, JSONSchemaProperty, ToolSpec } from './providers.js';

export interface ToolDefinition<TArgs extends Record<string, unknown> = Record<string, unknown>> {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (args: TArgs) => Promise<unknown> | unknown;
}

export interface Tool<TArgs extends Record<string, unknown> = Record<string, unknown>>
  extends ToolDefinition<TArgs> {
  /** The model-facing spec (name, description, parameters). */
  spec: ToolSpec;
  /** Validate raw model arguments against the schema, then run `execute`. */
  call: (rawArgs: Record<string, unknown>) => Promise<unknown>;
}

export class ToolValidationError extends Error {
  constructor(public toolName: string, message: string) {
    super(`Tool "${toolName}": ${message}`);
    this.name = 'ToolValidationError';
  }
}

/**
 * Define a tool.
 *
 * @example
 * const getWeather = tool({
 *   name: 'get_weather',
 *   description: 'Get the current weather for a city',
 *   parameters: {
 *     type: 'object',
 *     properties: { city: { type: 'string', description: 'City name' } },
 *     required: ['city'],
 *   },
 *   execute: async ({ city }) => ({ city, tempC: 21 }),
 * });
 */
export function tool<TArgs extends Record<string, unknown> = Record<string, unknown>>(
  def: ToolDefinition<TArgs>
): Tool<TArgs> {
  const spec: ToolSpec = {
    name: def.name,
    description: def.description,
    parameters: def.parameters,
  };

  async function call(rawArgs: Record<string, unknown>): Promise<unknown> {
    const validated = validateArgs(def.name, def.parameters, rawArgs ?? {});
    return def.execute(validated as TArgs);
  }

  return { ...def, spec, call };
}

/**
 * Validate (and coerce where safe) raw arguments against a JSON schema.
 * Throws ToolValidationError on missing required fields or type mismatches.
 */
export function validateArgs(
  toolName: string,
  schema: JSONSchema,
  raw: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const required of schema.required ?? []) {
    if (raw[required] === undefined || raw[required] === null) {
      throw new ToolValidationError(toolName, `missing required argument "${required}"`);
    }
  }

  for (const [key, prop] of Object.entries(schema.properties)) {
    if (raw[key] === undefined) continue;
    out[key] = coerce(toolName, key, prop, raw[key]);
  }

  // Pass through any extra keys the model supplied but the schema didn't list.
  for (const [key, value] of Object.entries(raw)) {
    if (!(key in out)) out[key] = value;
  }

  return out;
}

function coerce(
  toolName: string,
  key: string,
  prop: JSONSchemaProperty,
  value: unknown
): unknown {
  switch (prop.type) {
    case 'string':
      if (typeof value !== 'string') return String(value);
      break;
    case 'number':
    case 'integer': {
      const n = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(n)) {
        throw new ToolValidationError(toolName, `argument "${key}" must be a number`);
      }
      return prop.type === 'integer' ? Math.trunc(n) : n;
    }
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      throw new ToolValidationError(toolName, `argument "${key}" must be a boolean`);
    case 'array':
      if (!Array.isArray(value)) {
        throw new ToolValidationError(toolName, `argument "${key}" must be an array`);
      }
      break;
    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new ToolValidationError(toolName, `argument "${key}" must be an object`);
      }
      break;
  }

  if (prop.enum && !prop.enum.includes(value)) {
    throw new ToolValidationError(
      toolName,
      `argument "${key}" must be one of ${JSON.stringify(prop.enum)}`
    );
  }

  return value;
}
