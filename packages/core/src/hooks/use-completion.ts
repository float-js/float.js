/**
 * Float.js useFloatCompletion
 *
 * Client hook for single-prompt streaming completions against a Float.js AI
 * API route. Simpler sibling of useFloatChat for non-conversational UIs
 * (autocomplete, rewrite, summarize, etc.).
 */

import { useCallback, useRef, useState } from 'react';
import { readStream } from './use-chat.js';

export interface UseFloatCompletionOptions {
  /** API route to POST to. Default: '/api/completion'. */
  api?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  streamProtocol?: 'text' | 'sse';
  onFinish?: (completion: string) => void;
  onError?: (error: Error) => void;
}

export interface UseFloatCompletionResult {
  completion: string;
  input: string;
  setInput: (value: string) => void;
  /** Send `input` (or an explicit prompt) and stream the completion. */
  complete: (prompt?: string) => Promise<string>;
  handleSubmit: (event?: { preventDefault?: () => void }) => Promise<void>;
  isLoading: boolean;
  error: Error | undefined;
  stop: () => void;
}

export function useFloatCompletion(
  options: UseFloatCompletionOptions = {}
): UseFloatCompletionResult {
  const {
    api = '/api/completion',
    body,
    headers,
    streamProtocol = 'text',
    onFinish,
    onError,
  } = options;

  const [completion, setCompletion] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const complete = useCallback(
    async (prompt?: string): Promise<string> => {
      const finalPrompt = prompt ?? input;
      if (!finalPrompt.trim()) return '';

      setCompletion('');
      setIsLoading(true);
      setError(undefined);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ prompt: finalPrompt, ...body }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Completion request failed: ${response.status}`);
        }

        let acc = '';
        for await (const chunk of readStream(response.body, streamProtocol)) {
          acc += chunk;
          setCompletion(acc);
        }

        onFinish?.(acc);
        return acc;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return '';
        const e = err as Error;
        setError(e);
        onError?.(e);
        return '';
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [api, body, headers, input, streamProtocol, onFinish, onError]
  );

  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();
      await complete(input);
    },
    [complete, input]
  );

  return {
    completion,
    input,
    setInput,
    complete,
    handleSubmit,
    isLoading,
    error,
    stop,
  };
}
