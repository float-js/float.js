/**
 * Float.js AI Agent Runtime
 *
 * A provider-agnostic agent loop with tool-calling. The agent asks the model;
 * if the model requests tools, it runs them, feeds the results back, and loops
 * until the model produces a final answer or `maxSteps` is reached.
 *
 * Fully deterministic and testable with MockProvider — no network required.
 */

import {
  getDefaultProvider,
  type AIProvider,
  type GenerateResult,
  type Message,
  type ToolCall,
  type Usage,
} from './providers.js';
import type { Tool } from './tools.js';
import { ToolValidationError } from './tools.js';

export interface AgentConfig {
  /** Provider to use. Defaults to one resolved from env API keys. */
  provider?: AIProvider;
  /** Model id passed to the provider. */
  model?: string;
  /** System prompt. */
  system?: string;
  /** Tools the agent may call. */
  tools?: Tool[];
  /** Max model<->tool round trips before forcing a stop (default: 8). */
  maxSteps?: number;
  temperature?: number;
  maxTokens?: number;
  /** Optional hook fired after each step (useful for streaming UIs / logging). */
  onStep?: (step: AgentStep) => void;
}

export interface ToolInvocation {
  call: ToolCall;
  result: unknown;
  error?: string;
}

export interface AgentStep {
  /** 0-based step index. */
  index: number;
  /** Assistant text produced this step (may be empty when only calling tools). */
  text: string;
  /** Tool calls requested this step. */
  toolCalls: ToolCall[];
  /** Results of running those tool calls. */
  invocations: ToolInvocation[];
  usage?: Usage;
}

export interface AgentResult {
  /** Final assistant answer. */
  text: string;
  /** Every step taken, in order. */
  steps: AgentStep[];
  /** Flattened list of every tool invocation across all steps. */
  invocations: ToolInvocation[];
  /** Full message transcript (input + assistant + tool results). */
  messages: Message[];
  /** Summed token usage across steps. */
  usage: Usage;
  /** Whether the loop stopped because it hit maxSteps. */
  stoppedEarly: boolean;
}

/** Streaming agent events, emitted step-by-step as the loop runs. */
export type AgentEvent =
  | { type: 'start'; input: string | Message[] }
  | { type: 'step'; index: number; text: string; toolCalls: ToolCall[] }
  | { type: 'tool_result'; index: number; invocation: ToolInvocation }
  | { type: 'final'; text: string; usage: Usage; stoppedEarly: boolean };

export interface Agent {
  config: AgentConfig;
  run(input: string | Message[]): Promise<AgentResult>;
  /** Run the agent and stream events as each step / tool completes. */
  stream(input: string | Message[]): AsyncGenerator<AgentEvent>;
}

/**
 * Create an agent.
 *
 * @example
 * const agent = defineAgent({
 *   system: 'You are a helpful assistant.',
 *   tools: [getWeather],
 * });
 * const { text } = await agent.run('What is the weather in Lima?');
 */
export function defineAgent(config: AgentConfig = {}): Agent {
  const provider = config.provider ?? getDefaultProvider();
  const maxSteps = config.maxSteps ?? 8;
  const toolMap = new Map((config.tools ?? []).map((t) => [t.name, t]));
  const toolSpecs = (config.tools ?? []).map((t) => t.spec);

  // Single source of truth: the loop, emitting events. Both run() and stream()
  // are built on top of this generator.
  async function* runEvents(input: string | Message[]): AsyncGenerator<AgentEvent> {
    const messages: Message[] =
      typeof input === 'string' ? [{ role: 'user', content: input }] : [...input];

    const usage: Usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let finalText = '';

    yield { type: 'start', input };

    for (let i = 0; i < maxSteps; i++) {
      const result: GenerateResult = await provider.generate({
        model: config.model,
        system: config.system,
        messages,
        tools: toolSpecs.length ? toolSpecs : undefined,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });

      accumulateUsage(usage, result.usage);
      finalText = result.text;

      // Record the assistant turn (with any tool calls) in the transcript.
      messages.push({
        role: 'assistant',
        content: result.text,
        toolCalls: result.toolCalls.length ? result.toolCalls : undefined,
      });

      yield { type: 'step', index: i, text: result.text, toolCalls: result.toolCalls };

      const step: AgentStep = {
        index: i,
        text: result.text,
        toolCalls: result.toolCalls,
        invocations: [],
        usage: result.usage,
      };

      // No tools requested -> this is the final answer.
      if (result.toolCalls.length === 0) {
        config.onStep?.(step);
        yield { type: 'final', text: finalText, usage, stoppedEarly: false };
        return;
      }

      // Run each requested tool, emit its result, and feed it back.
      for (const call of result.toolCalls) {
        const invocation = await runTool(toolMap, call);
        step.invocations.push(invocation);
        messages.push({
          role: 'tool',
          toolCallId: call.id,
          name: call.name,
          content: serializeToolResult(invocation),
        });
        yield { type: 'tool_result', index: i, invocation };
      }

      config.onStep?.(step);
    }

    yield { type: 'final', text: finalText, usage, stoppedEarly: true };
  }

  async function run(input: string | Message[]): Promise<AgentResult> {
    const messages: Message[] =
      typeof input === 'string' ? [{ role: 'user', content: input }] : [...input];
    const steps: AgentStep[] = [];
    const allInvocations: ToolInvocation[] = [];
    let current: AgentStep | null = null;
    let text = '';
    let usage: Usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let stoppedEarly = false;

    for await (const event of runEvents(input)) {
      if (event.type === 'step') {
        current = { index: event.index, text: event.text, toolCalls: event.toolCalls, invocations: [] };
        steps.push(current);
        // Mirror the transcript that the generator builds internally.
        messages.push({
          role: 'assistant',
          content: event.text,
          toolCalls: event.toolCalls.length ? event.toolCalls : undefined,
        });
      } else if (event.type === 'tool_result' && current) {
        current.invocations.push(event.invocation);
        allInvocations.push(event.invocation);
        messages.push({
          role: 'tool',
          toolCallId: event.invocation.call.id,
          name: event.invocation.call.name,
          content: serializeToolResult(event.invocation),
        });
      } else if (event.type === 'final') {
        text = event.text;
        usage = event.usage;
        stoppedEarly = event.stoppedEarly;
      }
    }

    return { text, steps, invocations: allInvocations, messages, usage, stoppedEarly };
  }

  return { config, run, stream: runEvents };
}

async function runTool(
  toolMap: Map<string, Tool>,
  call: ToolCall
): Promise<ToolInvocation> {
  const tool = toolMap.get(call.name);
  if (!tool) {
    return { call, result: null, error: `Unknown tool "${call.name}"` };
  }
  try {
    const result = await tool.call(call.arguments);
    return { call, result };
  } catch (error) {
    const message =
      error instanceof ToolValidationError
        ? error.message
        : (error as Error).message || String(error);
    return { call, result: null, error: message };
  }
}

function serializeToolResult(invocation: ToolInvocation): string {
  if (invocation.error) return JSON.stringify({ error: invocation.error });
  if (typeof invocation.result === 'string') return invocation.result;
  try {
    return JSON.stringify(invocation.result);
  } catch {
    return String(invocation.result);
  }
}

function accumulateUsage(total: Usage, add?: Usage): void {
  if (!add) return;
  total.promptTokens += add.promptTokens;
  total.completionTokens += add.completionTokens;
  total.totalTokens += add.totalTokens;
}
