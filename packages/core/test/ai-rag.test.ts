import { describe, it, expect } from 'vitest';
import { createVectorStore, MockEmbedder, cosineSimilarity } from '../dist/index.js';

describe('rag: cosineSimilarity', () => {
  it('is 1 for identical vectors and 0 for orthogonal', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
});

describe('rag: MockEmbedder', () => {
  it('is deterministic and L2-normalized', async () => {
    const e = new MockEmbedder(32);
    const [a] = await e.embed(['float js realtime']);
    const [b] = await e.embed(['float js realtime']);
    expect(a).toEqual(b);
    const norm = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1, 5);
  });
});

describe('rag: VectorStore', () => {
  it('adds documents and assigns ids', async () => {
    const store = createVectorStore();
    const added = await store.add([{ text: 'one' }, { text: 'two' }]);
    expect(store.size).toBe(2);
    expect(added[0].id).toBeTruthy();
  });

  it('retrieves the most semantically-overlapping document first', async () => {
    const store = createVectorStore();
    await store.add([
      { id: 'rt', text: 'Float.js has built-in realtime websocket support' },
      { id: 'css', text: 'Tailwind and PostCSS styling pipeline' },
      { id: 'router', text: 'file based routing with dynamic segments' },
    ]);
    const results = await store.search('does it support websockets and realtime?', 2);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('rt');
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });

  it('returns empty results for an empty store', async () => {
    const store = createVectorStore();
    expect(await store.search('anything')).toEqual([]);
  });

  it('respects metadata and k', async () => {
    const store = createVectorStore();
    await store.add([
      { text: 'alpha beta', metadata: { tag: 'a' } },
      { text: 'gamma delta', metadata: { tag: 'b' } },
    ]);
    const results = await store.search('alpha', 1);
    expect(results).toHaveLength(1);
    expect(results[0].metadata).toBeDefined();
  });
});
