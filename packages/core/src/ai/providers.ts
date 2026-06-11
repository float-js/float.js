/**
 * Float.js AI Providers
 *
 * Provider abstraction with first-class tool-calling support. Ships real
 * OpenAI and Anthropic implementations plus a deterministic MockProvider that
 * makes the whole AI runtime unit-testable without network or API keys.
 */

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  /** For assistant turns that requested tools. */
  toolCalls?: ToolCall[];
  /** For tool-result turns, the id of the call being answered. */
  toolCallId?: string;
  /** Optional tool/function name (tool-result turns). */
  name?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** JSON-schema-ish parameter description for a tool. */
export interface ToolSpec {
  name: string;
  description: string;
  parameters: JSONSchema;
}

export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'integer' | 'array' | 'object';
  description?: string;
  enum?: unknown[];
  items?: JSONSchemaProperty;
}

export interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GenerateOptions {
  model?: string;
  system?: string;
  messages: Message[];
  tools?: ToolSpec[];
  temperature?: number;
  maxTokens?: number;
}

export type FinishReason = 'stop' | 'tool_calls' | 'length';

export interface GenerateResult {
  text: string;
  toolCalls: ToolCall[];
  finishReason: FinishReason;
  model: string;
  usage?: Usage;
  raw?: unknown;
}

export interface ChatOptions {
  model?: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: Usage;
}

/**
 * Unified provider interface. `generate` is the tool-aware primitive the agent
 * runtime builds on; `chat`/`stream` remain for simple text use cases.
 */
export interface AIProvider {
  name: string;
  generate(options: GenerateOptions): Promise<GenerateResult>;
  chat(options: ChatOptions): Promise<AIResponse>;
  stream(options: ChatOptions): AsyncIterable<string>;
}

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-6';

function toolSpecToOpenAI(tool: ToolSpec) {
  return {
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  };
}

function toolSpecToAnthropic(tool: ToolSpec) {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters,
  };
}

/**
 * OpenAI Provider (Chat Completions API, tool-calling aware).
 */
export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private baseUrl: string;

  constructor(options: { apiKey?: string; baseUrl?: string } = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = options.baseUrl || 'https://api.openai.com/v1';
  }

  private buildMessages(options: GenerateOptions | ChatOptions): unknown[] {
    const msgs: unknown[] = [];
    if (options.system) msgs.push({ role: 'system', content: options.system });
    for (const m of options.messages) {
      if (m.role === 'tool') {
        msgs.push({ role: 'tool', tool_call_id: m.toolCallId, content: m.content });
      } else if (m.role === 'assistant' && m.toolCalls?.length) {
        msgs.push({
          role: 'assistant',
          content: m.content || null,
          tool_calls: m.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
          })),
        });
      } else {
        msgs.push({ role: m.role, content: m.content });
      }
    }
    return msgs;
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const model = options.model || DEFAULT_OPENAI_MODEL;
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: this.buildMessages(options),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        tools: options.tools?.length ? options.tools.map(toolSpecToOpenAI) : undefined,
      }),
    });

    const data = await response.json();
    const choice = data.choices?.[0];
    const message = choice?.message ?? {};
    const toolCalls: ToolCall[] = (message.tool_calls || []).map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: safeJsonParse(tc.function.arguments),
    }));

    return {
      text: message.content || '',
      toolCalls,
      finishReason: toolCalls.length ? 'tool_calls' : mapFinish(choice?.finish_reason),
      model: data.model || model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      raw: data,
    };
  }

  async chat(options: ChatOptions): Promise<AIResponse> {
    const result = await this.generate(options);
    return { content: result.text, model: result.model, usage: result.usage };
  }

  async *stream(options: ChatOptions): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_OPENAI_MODEL,
        messages: this.buildMessages(options),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: true,
      }),
    });

    yield* parseSSE(response, (parsed) => parsed.choices?.[0]?.delta?.content);
  }
}

/**
 * Anthropic Provider (Messages API, tool-use aware).
 */
export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private apiKey: string;
  private baseUrl: string;

  constructor(options: { apiKey?: string; baseUrl?: string } = {}) {
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.baseUrl = options.baseUrl || 'https://api.anthropic.com/v1';
  }

  private buildMessages(options: GenerateOptions | ChatOptions): unknown[] {
    const msgs: unknown[] = [];
    for (const m of options.messages) {
      if (m.role === 'system') continue; // handled via top-level system
      if (m.role === 'tool') {
        msgs.push({
          role: 'user',
          content: [
            { type: 'tool_result', tool_use_id: m.toolCallId, content: m.content },
          ],
        });
      } else if (m.role === 'assistant' && m.toolCalls?.length) {
        const blocks: unknown[] = [];
        if (m.content) blocks.push({ type: 'text', text: m.content });
        for (const tc of m.toolCalls) {
          blocks.push({ type: 'tool_use', id: tc.id, name: tc.name, input: tc.arguments });
        }
        msgs.push({ role: 'assistant', content: blocks });
      } else {
        msgs.push({ role: m.role, content: m.content });
      }
    }
    return msgs;
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const model = options.model || DEFAULT_ANTHROPIC_MODEL;
    const system =
      options.system || options.messages.find((m) => m.role === 'system')?.content;

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        system,
        messages: this.buildMessages(options),
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        tools: options.tools?.length ? options.tools.map(toolSpecToAnthropic) : undefined,
      }),
    });

    const data = await response.json();
    const blocks: any[] = data.content || [];
    const text = blocks
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    const toolCalls: ToolCall[] = blocks
      .filter((b) => b.type === 'tool_use')
      .map((b) => ({ id: b.id, name: b.name, arguments: b.input || {} }));

    return {
      text,
      toolCalls,
      finishReason: toolCalls.length ? 'tool_calls' : mapFinish(data.stop_reason),
      model: data.model || model,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
      raw: data,
    };
  }

  async chat(options: ChatOptions): Promise<AIResponse> {
    const result = await this.generate(options);
    return { content: result.text, model: result.model, usage: result.usage };
  }

  async *stream(options: ChatOptions): AsyncIterable<string> {
    const system =
      options.system || options.messages.find((m) => m.role === 'system')?.content;
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_ANTHROPIC_MODEL,
        system,
        messages: this.buildMessages(options),
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        stream: true,
      }),
    });

    yield* parseSSE(response, (parsed) =>
      parsed.type === 'content_block_delta' ? parsed.delta?.text : undefined
    );
  }
}

/**
 * Deterministic, scriptable provider for tests and offline development.
 *
 * Drive it with a queue of scripted turns (text and/or tool calls), or pass a
 * function that computes the next turn from the conversation. With no script it
 * echoes the last user message — handy for smoke tests.
 */
export interface MockTurn {
  text?: string;
  toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }>;
}

export type MockResponder =
  | MockTurn[]
  | ((options: GenerateOptions, step: number) => MockTurn);

export class MockProvider implements AIProvider {
  name = 'mock';
  private responder: MockResponder;
  private step = 0;
  /** Records every generate() call for assertions in tests. */
  public calls: GenerateOptions[] = [];

  constructor(responder: MockResponder = []) {
    this.responder = responder;
  }

  reset(): void {
    this.step = 0;
    this.calls = [];
  }

  private nextTurn(options: GenerateOptions): MockTurn {
    if (typeof this.responder === 'function') {
      return this.responder(options, this.step);
    }
    if (this.step < this.responder.length) {
      return this.responder[this.step];
    }
    const lastUser = [...options.messages].reverse().find((m) => m.role === 'user');
    return { text: lastUser ? `echo: ${lastUser.content}` : '' };
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    this.calls.push(options);
    const turn = this.nextTurn(options);
    this.step++;

    const toolCalls: ToolCall[] = (turn.toolCalls || []).map((tc, i) => ({
      id: `mock_call_${this.step}_${i}`,
      name: tc.name,
      arguments: tc.arguments,
    }));

    return {
      text: turn.text || '',
      toolCalls,
      finishReason: toolCalls.length ? 'tool_calls' : 'stop',
      model: 'mock-model',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }

  async chat(options: ChatOptions): Promise<AIResponse> {
    const result = await this.generate(options);
    return { content: result.text, model: result.model, usage: result.usage };
  }

  async *stream(options: ChatOptions): AsyncIterable<string> {
    const result = await this.generate(options);
    for (const word of result.text.split(/(\s+)/)) {
      yield word;
    }
  }
}

/** Resolve a default provider from environment API keys. */
export function getDefaultProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return new AnthropicProvider();
  if (process.env.OPENAI_API_KEY) return new OpenAIProvider();
  // No keys configured: a mock keeps dev/test working instead of throwing.
  return new MockProvider();
}

// ----------------------- helpers -----------------------

function safeJsonParse(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function mapFinish(reason: string | undefined): FinishReason {
  if (reason === 'length' || reason === 'max_tokens') return 'length';
  if (reason === 'tool_calls' || reason === 'tool_use') return 'tool_calls';
  return 'stop';
}

async function* parseSSE(
  response: Response,
  extract: (parsed: any) => string | undefined
): AsyncIterable<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      if (payload === '[DONE]') return;
      try {
        const chunk = extract(JSON.parse(payload));
        if (chunk) yield chunk;
      } catch {
        /* skip malformed chunk */
      }
    }
  }
}
