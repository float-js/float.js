/**
 * Float.js useFloatAgent
 *
 * Client hook for driving a streaming agent endpoint (`agentStreamHandler`).
 * It POSTs your input, reads the SSE event stream, and exposes the agent's
 * step/tool trace live so you can render it as it happens.
 */

import { useCallback, useRef, useState } from 'react';

export interface AgentToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AgentToolInvocation {
  call: AgentToolCall;
  result: unknown;
  error?: string;
}

export interface AgentTraceStep {
  index: number;
  text: string;
  toolCalls: AgentToolCall[];
  invocations: AgentToolInvocation[];
}

/** Mirrors the server `AgentEvent` union (plus a transport-level `error`). */
export type AgentStreamEvent =
  | { type: 'start'; input: unknown }
  | { type: 'step'; index: number; text: string; toolCalls: AgentToolCall[] }
  | { type: 'tool_result'; index: number; invocation: AgentToolInvocation }
  | { type: 'final'; text: string; usage: unknown; stoppedEarly: boolean }
  | { type: 'error'; message: string };

export interface UseFloatAgentOptions {
  /** Streaming agent API route. Default: '/api/agent'. */
  api?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  onEvent?: (event: AgentStreamEvent) => void;
  onFinish?: (finalText: string) => void;
  onError?: (error: Error) => void;
}

export interface UseFloatAgentResult {
  /** Run the agent with the given input and stream its trace. */
  run: (input: string) => Promise<void>;
  /** Steps taken so far, updated live (text + tool calls + results). */
  steps: AgentTraceStep[];
  /** The final answer once the agent stops. */
  finalText: string;
  isRunning: boolean;
  stoppedEarly: boolean;
  error: Error | undefined;
  /** Raw event log, in order. */
  events: AgentStreamEvent[];
  /** Abort the in-flight run. */
  stop: () => void;
  reset: () => void;
}

export function useFloatAgent(options: UseFloatAgentOptions = {}): UseFloatAgentResult {
  const { api = '/api/agent', body, headers, onEvent, onFinish, onError } = options;

  const [steps, setSteps] = useState<AgentTraceStep[]>([]);
  const [finalText, setFinalText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [stoppedEarly, setStoppedEarly] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [events, setEvents] = useState<AgentStreamEvent[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setSteps([]);
    setFinalText('');
    setStoppedEarly(false);
    setError(undefined);
    setEvents([]);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsRunning(false);
  }, []);

  const apply = useCallback((event: AgentStreamEvent) => {
    setEvents((prev) => [...prev, event]);
    if (event.type === 'step') {
      setSteps((prev) => [
        ...prev,
        { index: event.index, text: event.text, toolCalls: event.toolCalls, invocations: [] },
      ]);
    } else if (event.type === 'tool_result') {
      setSteps((prev) =>
        prev.map((s) =>
          s.index === event.index
            ? { ...s, invocations: [...s.invocations, event.invocation] }
            : s
        )
      );
    } else if (event.type === 'final') {
      setFinalText(event.text);
      setStoppedEarly(event.stoppedEarly);
    }
  }, []);

  const run = useCallback(
    async (input: string) => {
      reset();
      setIsRunning(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ input, ...body }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Agent request failed: ${response.status}`);
        }

        for await (const event of readAgentEvents(response.body)) {
          apply(event);
          onEvent?.(event);
          if (event.type === 'final') onFinish?.(event.text);
          if (event.type === 'error') throw new Error(event.message);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const e = err as Error;
        setError(e);
        onError?.(e);
      } finally {
        setIsRunning(false);
        abortRef.current = null;
      }
    },
    [api, body, headers, apply, reset, onEvent, onFinish, onError]
  );

  return { run, steps, finalText, isRunning, stoppedEarly, error, events, stop, reset };
}

/** Read an SSE stream of JSON agent events. */
export async function* readAgentEvents(
  body: ReadableStream<Uint8Array>
): AsyncIterable<AgentStreamEvent> {
  const reader = body.getReader();
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
        yield JSON.parse(payload) as AgentStreamEvent;
      } catch {
        /* skip malformed frame */
      }
    }
  }
}
