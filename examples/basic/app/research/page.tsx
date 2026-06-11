import { useState } from 'react';
import { useFloatAgent, type AgentTraceStep } from '@float.js/core/client';

export const metadata = {
  title: 'Scout — autonomous research agent',
  description: 'Give it a question. It searches the web, reads sources, and writes a cited answer.',
};

const EXAMPLES = [
  'What are the most promising open-source AI agent frameworks in 2026?',
  'Summarize the latest news on EU AI regulation and what it means for startups.',
  'Compare Stripe vs Lemon Squeezy for selling a SaaS to a global audience.',
];

export default function Scout() {
  const { run, steps, finalText, isRunning, stoppedEarly, error } = useFloatAgent({ api: '/api/agent' });
  const [task, setTask] = useState('');

  const submit = (e: { preventDefault?: () => void }) => {
    e.preventDefault?.();
    if (task.trim()) run(task.trim());
  };

  return (
    <main style={S.main}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 30 }}>🔭</span>
          <h1 style={{ margin: 0, fontSize: 26 }}>Scout</h1>
          <span style={S.badge}>autonomous research agent</span>
        </div>
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Ask anything. Scout searches the web, reads the sources, and writes a cited answer — live.
        </p>
      </header>

      <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g. What are the best AI agent frameworks in 2026?"
          style={S.input}
        />
        <button type="submit" disabled={isRunning} style={{ ...S.btn, opacity: isRunning ? 0.6 : 1 }}>
          {isRunning ? 'Researching…' : 'Research'}
        </button>
      </form>

      {steps.length === 0 && !isRunning && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Try:</div>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => { setTask(ex); run(ex); }} style={S.example}>
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && <div style={S.error}>⚠ {error.message}</div>}

      {steps.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h3 style={S.h3}>Live trace</h3>
          {steps.map((s) => (
            <Step key={s.index} step={s} />
          ))}
        </section>
      )}

      {finalText && (
        <section style={{ marginTop: 24 }}>
          <h3 style={S.h3}>Answer {stoppedEarly && <span style={{ color: '#d97706' }}>(stopped early)</span>}</h3>
          <div style={S.report}>{finalText}</div>
        </section>
      )}
    </main>
  );
}

function Step({ step }: { step: AgentTraceStep }) {
  return (
    <div style={S.step}>
      <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600 }}>STEP {step.index + 1}</div>
      {step.text && <div style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>{step.text}</div>}
      {step.toolCalls.map((tc) => (
        <div key={tc.id} style={S.tool}>
          🔧 <strong>{tc.name}</strong>(
          {tc.name === 'web_search'
            ? String((tc.arguments as any).query)
            : String((tc.arguments as any).url)}
          )
        </div>
      ))}
      {step.invocations.map((inv, i) => (
        <div key={i} style={S.result}>{summarize(inv.call.name, inv.result, inv.error)}</div>
      ))}
    </div>
  );
}

function summarize(name: string, result: unknown, err?: string): string {
  if (err) return `✗ ${err}`;
  const r = result as any;
  if (name === 'web_search') {
    const list = r?.results ?? [];
    if (!list.length) return '✓ no results';
    return '✓ ' + list.map((x: any) => `• ${x.title}`).join('  ');
  }
  if (name === 'read_url') {
    if (r?.error) return `✗ ${r.error}`;
    const len = (r?.text ?? '').length;
    return `✓ read ${r?.url ?? ''} (${len} chars)`;
  }
  return '✓ ' + JSON.stringify(r).slice(0, 200);
}

const S: Record<string, any> = {
  main: { maxWidth: 760, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif', color: '#111827' },
  badge: { fontSize: 11, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '3px 8px', borderRadius: 999 },
  input: { flex: 1, padding: '12px 14px', fontSize: 15, border: '1px solid #e5e7eb', borderRadius: 10, outline: 'none' },
  btn: { padding: '12px 18px', fontSize: 15, fontWeight: 600, color: '#fff', background: '#111827', border: 'none', borderRadius: 10, cursor: 'pointer' },
  example: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', margin: '6px 0', background: '#f9fafb', border: '1px solid #eef2f7', borderRadius: 8, cursor: 'pointer', color: '#374151', fontSize: 14 },
  h3: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, color: '#9ca3af', margin: '0 0 8px' },
  step: { borderLeft: '3px solid #8b5cf6', paddingLeft: 14, marginBottom: 14 },
  tool: { color: '#4f46e5', fontSize: 14, margin: '2px 0' },
  result: { color: '#16a34a', fontSize: 13, margin: '2px 0', overflowWrap: 'anywhere' },
  report: { whiteSpace: 'pre-wrap', lineHeight: 1.6, background: '#fff', border: '1px solid #eef2f7', borderRadius: 12, padding: 18 },
  error: { marginTop: 16, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12 },
};
