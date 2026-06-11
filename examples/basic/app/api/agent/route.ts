/**
 * Autonomous research agent — streams its work step by step over SSE.
 *
 * Given a task, it searches the web, reads the most promising sources, and
 * writes a thorough, cited answer. Self-contained (only imports @float.js/core)
 * so the dev/prod runtime can load it directly.
 */

import { defineAgent, tool, agentStreamHandler } from '@float.js/core';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

const webSearch = tool({
  name: 'web_search',
  description:
    'Search the web for up-to-date information. Returns results with title, url and snippet. Use this first, then read_url on the most promising results.',
  parameters: {
    type: 'object',
    properties: { query: { type: 'string', description: 'The search query' } },
    required: ['query'],
  },
  execute: async ({ query }) => {
    try {
      const res = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query as string), {
        headers: { 'User-Agent': UA, Accept: 'text/html' },
      });
      const html = await res.text();
      const linkRe = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
      const snippetRe = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
      const snippets: string[] = [];
      let sm: RegExpExecArray | null;
      while ((sm = snippetRe.exec(html))) snippets.push(stripTags(sm[1]));
      const results: Array<{ title: string; url: string; snippet: string }> = [];
      let m: RegExpExecArray | null;
      let i = 0;
      while ((m = linkRe.exec(html)) && results.length < 6) {
        let url = m[1];
        const uddg = url.match(/[?&]uddg=([^&]+)/);
        if (uddg) url = decodeURIComponent(uddg[1]);
        if (url.startsWith('//')) url = 'https:' + url;
        const title = stripTags(m[2]);
        if (title && url.startsWith('http')) results.push({ title, url, snippet: snippets[i] || '' });
        i++;
      }
      return results.length ? { results } : { results: [], note: 'No results found' };
    } catch (e) {
      return { error: `search failed: ${(e as Error).message}` };
    }
  },
});

const readUrl = tool({
  name: 'read_url',
  description: 'Fetch a web page and return its readable text (truncated). Use after web_search to read a source.',
  parameters: {
    type: 'object',
    properties: { url: { type: 'string', description: 'The full URL to read' } },
    required: ['url'],
  },
  execute: async ({ url }) => {
    try {
      const res = await fetch(url as string, { headers: { 'User-Agent': UA } });
      if (!res.ok) return { error: `HTTP ${res.status}` };
      const html = await res.text();
      const cleaned = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<head[\s\S]*?<\/head>/gi, ' ');
      return { url, text: stripTags(cleaned).slice(0, 5000) };
    } catch (e) {
      return { error: `fetch failed: ${(e as Error).message}` };
    }
  },
});

const agent = defineAgent({
  model: 'claude-sonnet-4-6',
  maxSteps: 12,
  temperature: 0.2,
  tools: [webSearch, readUrl],
  system: `You are an autonomous research agent.

Given a task, do real research before answering:
1. Use web_search to find relevant, recent sources.
2. Use read_url to read the most promising 2-4 results.
3. Synthesize a clear, well-structured answer in Markdown.
4. ALWAYS cite your sources inline as [n] and list the URLs at the end under "Sources".

Be thorough but efficient. Do not invent facts — base claims on what you read.
When you have enough information, give the final answer (no more tool calls).`,
});

export const POST = agentStreamHandler(agent);
