/**
 * Float.js useFloatChat
 *
 * Client hook for building chat UIs against a Float.js AI API route. Manages
 * the message list, posts to your endpoint, and streams the assistant's reply
 * token-by-token into state. Works with both the plain-text stream
 * (`streamResponse`) and the SSE stream (`sseResponse`) helpers.
 */

import { useCallback, useRef, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UseFloatChatOptions {
  /** API route to POST to. Default: '/api/chat'. */
  api?: string;
  /** Seed messages. */
  initialMessages?: ChatMessage[];
  /** Extra fields merged into the request body. */
  body?: Record<string, unknown>;
  /** Extra request headers. */
  headers?: Record<string, string>;
  /** Stream format the endpoint produces. Default: 'text'. */
  streamProtocol?: 'text' | 'sse';
  onFinish?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export interface UseFloatChatResult {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  /** Send the current `input` as a user message and stream the reply. */
  handleSubmit: (event?: { preventDefault?: () => void }) => Promise<void>;
  /** Send an arbitrary message programmatically. */
  sendMessage: (content: string) => Promise<void>;
  setMessages: (messages: ChatMessage[]) => void;
  isLoading: boolean;
  error: Error | undefined;
  /** Abort the in-flight streaming request. */
  stop: () => void;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `msg_${Date.now()}_${idCounter}`;
}

export function useFloatChat(options: UseFloatChatOptions = {}): UseFloatChatResult {
  const {
    api = '/api/chat',
    initialMessages = [],
    body,
    headers,
    streamProtocol = 'text',
    onFinish,
    onError,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: ChatMessage = { id: nextId(), role: 'user', content };
      const assistantMessage: ChatMessage = { id: nextId(), role: 'assistant', content: '' };
      const history = [...messages, userMessage];

      setMessages([...history, assistantMessage]);
      setIsLoading(true);
      setError(undefined);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
            ...body,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Chat request failed: ${response.status}`);
        }

        let acc = '';
        for await (const chunk of readStream(response.body, streamProtocol)) {
          acc += chunk;
          setMessages((prev) => updateLast(prev, assistantMessage.id, acc));
        }

        const finalMessage: ChatMessage = { ...assistantMessage, content: acc };
        onFinish?.(finalMessage);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const e = err as Error;
        setError(e);
        onError?.(e);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [api, body, headers, messages, streamProtocol, onFinish, onError]
  );

  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();
      const content = input;
      setInput('');
      await sendMessage(content);
    },
    [input, sendMessage]
  );

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    sendMessage,
    setMessages,
    isLoading,
    error,
    stop,
  };
}

/** Read a streaming Response body as an async iterable of text chunks. */
export async function* readStream(
  body: ReadableStream<Uint8Array>,
  protocol: 'text' | 'sse'
): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });

    if (protocol === 'text') {
      yield text;
      continue;
    }

    // SSE: accumulate and emit completed `data:` events.
    buffer += text;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      if (payload === '[DONE]') return;
      try {
        yield JSON.parse(payload) as string;
      } catch {
        yield payload;
      }
    }
  }
}

function updateLast(messages: ChatMessage[], id: string, content: string): ChatMessage[] {
  return messages.map((m) => (m.id === id ? { ...m, content } : m));
}
