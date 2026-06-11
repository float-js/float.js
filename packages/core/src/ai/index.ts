/**
 * Float.js AI Module — the AI-native core of the framework.
 *
 * Exposes:
 *  - Providers (OpenAI, Anthropic, Mock) with tool-calling support
 *  - `tool()` for typed, validated tools
 *  - `defineAgent()` — a provider-agnostic agent loop with tool execution
 *  - RAG primitives (vector store + embedders)
 *  - Streaming helpers for API routes (text + SSE)
 */

import {
  OpenAIProvider,
  AnthropicProvider,
  getDefaultProvider,
  type AIProvider,
  type ChatOptions,
  type Message,
  type AIResponse,
} from './providers.js';
import { defineAgent, type Agent, type AgentResult } from './agent.js';

// ---- Provider / type re-exports ----
export {
  OpenAIProvider,
  AnthropicProvider,
  MockProvider,
  getDefaultProvider,
  type AIProvider,
  type ChatOptions,
  type Message,
  type AIResponse,
  type GenerateOptions,
  type GenerateResult,
  type ToolCall,
  type ToolSpec,
  type JSONSchema,
  type JSONSchemaProperty,
  type Usage,
  type MockTurn,
  type MockResponder,
} from './providers.js';

// ---- Tools ----
export {
  tool,
  validateArgs,
  ToolValidationError,
  type Tool,
  type ToolDefinition,
} from './tools.js';

// ---- Agent runtime ----
export {
  defineAgent,
  type Agent,
  type AgentConfig,
  type AgentResult,
  type AgentStep,
  type ToolInvocation,
} from './agent.js';

// ---- RAG ----
export {
  createVectorStore,
  VectorStore,
  MockEmbedder,
  OpenAIEmbedder,
  cosineSimilarity,
  type Embedder,
  type VectorDocument,
  type SearchResult,
  type AddInput,
  type VectorStoreOptions,
} from './rag.js';

/**
 * High-level AI instance — convenience wrapper for simple text use cases.
 * Auto-registers a provider from env API keys (falls back to Mock offline).
 */
class FloatAI {
  private providers = new Map<string, AIProvider>();
  private defaultProvider: string;

  constructor() {
    const provider = getDefaultProvider();
    this.providers.set(provider.name, provider);
    this.defaultProvider = provider.name;
    // Register both real providers when their keys exist.
    if (process.env.OPENAI_API_KEY && !this.providers.has('openai')) {
      this.providers.set('openai', new OpenAIProvider());
    }
    if (process.env.ANTHROPIC_API_KEY && !this.providers.has('anthropic')) {
      this.providers.set('anthropic', new AnthropicProvider());
    }
  }

  register(provider: AIProvider): this {
    this.providers.set(provider.name, provider);
    return this;
  }

  use(name: string): this {
    if (!this.providers.has(name)) {
      throw new Error(`AI provider "${name}" not registered`);
    }
    this.defaultProvider = name;
    return this;
  }

  provider(): AIProvider {
    const provider = this.providers.get(this.defaultProvider);
    if (!provider) {
      throw new Error('No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
    }
    return provider;
  }

  /** Simple one-shot completion. */
  async chat(prompt: string, options: Partial<ChatOptions> = {}): Promise<string> {
    const response = await this.provider().chat({
      ...options,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content;
  }

  /** Completion with full message history. */
  async complete(options: ChatOptions): Promise<AIResponse> {
    return this.provider().chat(options);
  }

  /** Stream a one-shot completion token by token. */
  stream(prompt: string, options: Partial<ChatOptions> = {}): AsyncIterable<string> {
    return this.provider().stream({
      ...options,
      messages: [{ role: 'user', content: prompt }],
    });
  }

  /** Stream with full message history. */
  streamChat(options: ChatOptions): AsyncIterable<string> {
    return this.provider().stream(options);
  }

  /** Create an agent bound to this instance's default provider. */
  agent(config: Parameters<typeof defineAgent>[0] = {}): Agent {
    return defineAgent({ provider: this.provider(), ...config });
  }
}

/** Singleton AI instance. */
export const ai = new FloatAI();

/**
 * Create a plain-text streaming HTTP Response from an async iterable of chunks.
 */
export function streamResponse(
  iterable: AsyncIterable<string>,
  options: { headers?: Record<string, string> } = {}
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterable) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      ...options.headers,
    },
  });
}

/**
 * Create a Server-Sent Events streaming Response from an async iterable.
 */
export function sseResponse(
  iterable: AsyncIterable<string>,
  options: { headers?: Record<string, string> } = {}
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterable) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...options.headers,
    },
  });
}

/**
 * Wrap a handler as a JSON/stream-aware AI API endpoint.
 */
export function aiAction<T extends Record<string, unknown>>(
  handler: (input: T) => Promise<string> | AsyncIterable<string>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const input = (await request.json()) as T;
      const result = handler(input);

      if (result != null && typeof result === 'object' && Symbol.asyncIterator in (result as object)) {
        return streamResponse(result as AsyncIterable<string>);
      }

      const content = await (result as Promise<string>);
      return new Response(JSON.stringify({ content }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

/**
 * Expose an Agent as an HTTP API route. POST `{ "input": "..." }` (or a
 * `messages` array) and get the agent's result back as JSON, including the full
 * step/tool trace.
 *
 * @example
 * // app/api/agent/route.ts
 * export const POST = agentHandler(myAgent);
 */
export function agentHandler(agent: Agent) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = (await request.json()) as { input?: string; messages?: Message[] };
      const input = body.messages ?? body.input ?? '';
      const result: AgentResult = await agent.run(input);
      return new Response(
        JSON.stringify({
          text: result.text,
          steps: result.steps,
          invocations: result.invocations,
          usage: result.usage,
          stoppedEarly: result.stoppedEarly,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
