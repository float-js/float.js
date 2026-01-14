import { renderToString, renderToPipeableStream } from 'react-dom/server';
import type { ReactElement } from 'react';
import { Writable } from 'node:stream';

export interface SSROptions {
  onShellReady?: () => void;
  onShellError?: (error: Error) => void;
  onAllReady?: () => void;
  onError?: (error: Error) => void;
}

export function renderToStream(
  element: ReactElement,
  writable: Writable,
  options: SSROptions = {}
): void {
  const stream = renderToPipeableStream(element, {
    onShellReady() {
      options.onShellReady?.();
      stream.pipe(writable);
    },
    onShellError(error: unknown) {
      options.onShellError?.(error as Error);
    },
    onAllReady() {
      options.onAllReady?.();
    },
    onError(error: unknown) {
      options.onError?.(error as Error);
    },
  });
}

export function renderToHTML(element: ReactElement): string {
  return renderToString(element);
}
