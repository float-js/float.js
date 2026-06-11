import { useFloatAgent } from '@float.js/core/client';

export const metadata = { title: 'Float.js Agent — live trace' };

export default function AgentPage() {
  const { run, steps, finalText, isRunning, stoppedEarly } = useFloatAgent({ api: '/api/agent' });
  return (
    <main style={{ maxWidth: 680, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>🤖 Float.js Agent (live tool trace)</h1>
      <button disabled={isRunning} onClick={() => run('What is the weather in Lima?')}>
        {isRunning ? 'Running…' : 'Run agent'}
      </button>
      {steps.map((s) => (
        <div key={s.index} style={{ borderLeft: '3px solid #8b5cf6', paddingLeft: 12, marginTop: 12 }}>
          <div><strong>Step {s.index}</strong> {s.text}</div>
          {s.toolCalls.map((tc) => (
            <div key={tc.id} style={{ color: '#6366f1' }}>→ tool {tc.name}({JSON.stringify(tc.arguments)})</div>
          ))}
          {s.invocations.map((inv, i) => (
            <div key={i} style={{ color: '#16a34a' }}>✓ {JSON.stringify(inv.result ?? inv.error)}</div>
          ))}
        </div>
      ))}
      {finalText && <p style={{ marginTop: 16 }}><strong>Final:</strong> {finalText} {stoppedEarly ? '(stopped early)' : ''}</p>}
    </main>
  );
}
