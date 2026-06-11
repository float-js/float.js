import { describe, it, expect } from 'vitest';
import { tool, validateArgs, ToolValidationError } from '../dist/index.js';

const schema = {
  type: 'object' as const,
  properties: {
    name: { type: 'string' as const },
    age: { type: 'integer' as const },
    active: { type: 'boolean' as const },
    role: { type: 'string' as const, enum: ['admin', 'user'] },
  },
  required: ['name'],
};

describe('tools: validateArgs', () => {
  it('passes through valid args', () => {
    const out = validateArgs('t', schema, { name: 'Ana', age: 30, active: true, role: 'admin' });
    expect(out).toEqual({ name: 'Ana', age: 30, active: true, role: 'admin' });
  });

  it('throws on missing required field', () => {
    expect(() => validateArgs('t', schema, { age: 30 })).toThrow(ToolValidationError);
  });

  it('coerces numeric strings to numbers and truncates integers', () => {
    const out = validateArgs('t', schema, { name: 'x', age: '42' });
    expect(out.age).toBe(42);
  });

  it('coerces boolean strings', () => {
    const out = validateArgs('t', schema, { name: 'x', active: 'false' });
    expect(out.active).toBe(false);
  });

  it('rejects values outside an enum', () => {
    expect(() => validateArgs('t', schema, { name: 'x', role: 'superuser' })).toThrow(
      /one of/
    );
  });

  it('rejects non-numeric values for number fields', () => {
    expect(() => validateArgs('t', schema, { name: 'x', age: 'abc' })).toThrow(/number/);
  });
});

describe('tools: tool()', () => {
  it('exposes a model-facing spec', () => {
    const t = tool({
      name: 'add',
      description: 'add two numbers',
      parameters: {
        type: 'object',
        properties: { a: { type: 'number' }, b: { type: 'number' } },
        required: ['a', 'b'],
      },
      execute: ({ a, b }) => (a as number) + (b as number),
    });
    expect(t.spec.name).toBe('add');
    expect(t.spec.parameters.required).toEqual(['a', 'b']);
  });

  it('validates then executes via call()', async () => {
    const t = tool({
      name: 'add',
      description: 'add',
      parameters: {
        type: 'object',
        properties: { a: { type: 'number' }, b: { type: 'number' } },
        required: ['a', 'b'],
      },
      execute: ({ a, b }) => (a as number) + (b as number),
    });
    await expect(t.call({ a: '2', b: 3 })).resolves.toBe(5);
    await expect(t.call({ a: 1 })).rejects.toThrow(ToolValidationError);
  });
});
