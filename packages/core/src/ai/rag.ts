/**
 * Float.js RAG primitives
 *
 * A tiny in-memory vector store with pluggable embedders. Ships a deterministic
 * MockEmbedder (hash-based, offline) for tests/dev and an OpenAIEmbedder for
 * production. Good enough for retrieval over hundreds/thousands of chunks; swap
 * in a real vector DB behind the same interface when you outgrow it.
 */

export interface Embedder {
  /** Embedding dimensionality. */
  readonly dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}

export interface VectorDocument {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
  embedding: number[];
}

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface AddInput {
  id?: string;
  text: string;
  metadata?: Record<string, unknown>;
}

/**
 * Deterministic, offline embedder. Hashes token n-grams into a fixed-size
 * vector — not semantically rich, but stable and dependency-free, which makes
 * RAG flows testable and dev usable without API keys.
 */
export class MockEmbedder implements Embedder {
  readonly dimensions: number;

  constructor(dimensions = 64) {
    this.dimensions = dimensions;
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.embedOne(t));
  }

  private embedOne(text: string): number[] {
    const vec = new Array(this.dimensions).fill(0);
    const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    for (const token of tokens) {
      const h = hashString(token);
      vec[h % this.dimensions] += 1;
    }
    return normalize(vec);
  }
}

/**
 * OpenAI embeddings (text-embedding-3-small by default).
 */
export class OpenAIEmbedder implements Embedder {
  readonly dimensions: number;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string; dimensions?: number } = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = options.baseUrl || 'https://api.openai.com/v1';
    this.model = options.model || 'text-embedding-3-small';
    this.dimensions = options.dimensions || 1536;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: texts }),
    });
    const data = await response.json();
    return (data.data || []).map((d: any) => d.embedding as number[]);
  }
}

export interface VectorStoreOptions {
  embedder?: Embedder;
}

/**
 * In-memory vector store.
 *
 * @example
 * const store = createVectorStore();
 * await store.add([{ text: 'Float.js supports realtime' }]);
 * const hits = await store.search('does it do websockets?', 3);
 */
export class VectorStore {
  private embedder: Embedder;
  private docs: VectorDocument[] = [];
  private autoId = 0;

  constructor(options: VectorStoreOptions = {}) {
    this.embedder = options.embedder ?? new MockEmbedder();
  }

  get size(): number {
    return this.docs.length;
  }

  async add(inputs: AddInput | AddInput[]): Promise<VectorDocument[]> {
    const items = Array.isArray(inputs) ? inputs : [inputs];
    if (items.length === 0) return [];
    const embeddings = await this.embedder.embed(items.map((i) => i.text));
    const added = items.map((item, i) => {
      const doc: VectorDocument = {
        id: item.id ?? `doc_${this.autoId++}`,
        text: item.text,
        metadata: item.metadata,
        embedding: embeddings[i],
      };
      this.docs.push(doc);
      return doc;
    });
    return added;
  }

  async search(query: string, k = 4): Promise<SearchResult[]> {
    if (this.docs.length === 0) return [];
    const [queryEmbedding] = await this.embedder.embed([query]);
    return this.docs
      .map((doc) => ({
        id: doc.id,
        text: doc.text,
        metadata: doc.metadata,
        score: cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  clear(): void {
    this.docs = [];
    this.autoId = 0;
  }
}

export function createVectorStore(options: VectorStoreOptions = {}): VectorStore {
  return new VectorStore(options);
}

// ----------------------- math helpers -----------------------

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}
