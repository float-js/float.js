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

export interface Agent {
  config: AgentConfig;
  run(input: string | Message[]): Promise<AgentResult>;
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

  async function run(input: string | Message[]): Promise<AgentResult> {
    const messages: Message[] =
      typeof input === 'string' ? [{ role: 'user', content: input }] : [...input];

    const steps: AgentStep[] = [];
    const allInvocations: ToolInvocation[] = [];
    const usage: Usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let stoppedEarly = false;
    let finalText = '';

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

      // Record the assistant turn (with any tool calls) in the transcript.
      messages.push({
        role: 'assistant',
        content: result.text,
        toolCalls: result.toolCalls.length ? result.toolCalls : undefined,
      });

      // No tools requested -> this is the final answer.
      if (result.toolCalls.length === 0) {
        finalText = result.text;
        const step: AgentStep = {
          index: i,
          text: result.text,
          toolCalls: [],
          invocations: [],
          usage: result.usage,
        };
        steps.push(step);
        config.onStep?.(step);
        return { text: finalText, steps, invocations: allInvocations, messages, usage, stoppedEarly };
      }

      // Run each requested tool and feed results back.
      const invocations: ToolInvocation[] = [];
      for (const call of result.toolCalls) {
        const invocation = await runTool(toolMap, call);
        invocations.push(invocation);
        allInvocations.push(invocation);
        messages.push({
          role: 'tool',
          toolCallId: call.id,
          name: call.name,
          content: serializeToolResult(invocation),
        });
      }

      const step: AgentStep = {
        index: i,
        text: result.text,
        toolCalls: result.toolCalls,
        invocations,
        usage: result.usage,
      };
      steps.push(step);
      config.onStep?.(step);
      finalText = result.text;
    }

    stoppedEarly = true;
    return { text: finalText, steps, invocations: allInvocations, messages, usage, stoppedEarly };
  }

  return { config, run };
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
