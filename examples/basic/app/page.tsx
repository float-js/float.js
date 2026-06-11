import { useEffect, useRef, useState } from 'react';
import { readStream } from '@float.js/core/client';

export const metadata = {
  title: 'Forge — build web apps in real time',
  description: 'Describe an app. Watch the AI build it live. HTML or React, versioned, publishable.',
};

type Mode = 'html' | 'react';

interface Version {
  id: number;
  label: string;
  mode: Mode;
  source: string; // html doc (html mode) or FILE-delimited text (react mode)
  preview: string; // runnable HTML for the iframe
}

const EXAMPLES: Record<Mode, string[]> = {
  html: [
    'A landing page for a specialty coffee shop with hero, menu and contact form',
    'A neon synthwave calculator that actually works',
    'A pricing page with 3 tiers and a monthly/yearly toggle',
  ],
  react: [
    'A todo app with add, complete and filter (All/Active/Done)',
    'A pomodoro timer with start/pause/reset and a progress ring',
    'A tic-tac-toe game with score tracking',
  ],
};

const stripFences = (s: string) => s.replace(/^\s*```(?:html)?\s*/i, '').replace(/\s*```\s*$/i, '');

function parseFiles(raw: string): Record<string, string> {
  const files: Record<string, string> = {};
  const re = /===\s*FILE:\s*(.+?)\s*===\n?/g;
  const parts = raw.split(re);
  // parts: [pre, name1, body1, name2, body2, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].trim();
    const body = stripFences((parts[i + 1] ?? '').replace(/\n=+\s*$/,'')).trim();
    if (name) files[name] = body;
  }
  return files;
}

export default function Forge() {
  const [mode, setMode] = useState<Mode>('html');
  const [prompt, setPrompt] = useState('');
  const [source, setSource] = useState('');
  const [preview, setPreview] = useState('');
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [isBuilding, setIsBuilding] = useState(false);
  const [status, setStatus] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [vIndex, setVIndex] = useState(-1);
  const [publishedUrl, setPublishedUrl] = useState('');
  const idRef = useRef(0);

  // Load history after mount (client only) to avoid hydration mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('forge-history');
      if (saved) {
        const v: Version[] = JSON.parse(saved);
        if (v.length) {
          setVersions(v);
          setVIndex(v.length - 1);
          setMode(v[v.length - 1].mode);
          setSource(v[v.length - 1].source);
          setPreview(v[v.length - 1].preview);
          idRef.current = v[v.length - 1].id;
        }
      }
    } catch {}
  }, []);

  function persist(v: Version[]) {
    try { localStorage.setItem('forge-history', JSON.stringify(v.slice(-20))); } catch {}
  }

  function pushVersion(label: string, m: Mode, src: string, prev: string) {
    setVersions((cur) => {
      const truncated = cur.slice(0, vIndex + 1); // drop redo branch
      const next = [...truncated, { id: ++idRef.current, label, mode: m, source: src, preview: prev }];
      persist(next);
      setVIndex(next.length - 1);
      return next;
    });
  }

  const hasBuilt = preview !== '';
  const currentSource = mode === 'html' ? preview : source;

  async function build(task: string, isEdit: boolean) {
    if (!task.trim() || isBuilding) return;
    setIsBuilding(true);
    setView('code');
    setStatus('thinking…');
    setPublishedUrl('');
    if (!isEdit) { setSource(''); setPreview(''); }

    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: task, mode, current: isEdit ? currentSource : undefined }),
      });
      if (!res.ok || !res.body) throw new Error(`Build failed: ${res.status}`);

      let acc = '';
      for await (const chunk of readStream(res.body, 'text')) {
        acc += chunk;
        const clean = stripFences(acc);
        setSource(clean);
        if (mode === 'html') { setPreview(clean); } // live render for HTML
        setStatus(`generating… ${acc.length} chars`);
      }

      const finalSource = stripFences(acc);
      let finalPreview = finalSource;

      if (mode === 'react') {
        setStatus('bundling React…');
        setView('preview');
        const files = parseFiles(finalSource);
        const b = await fetch('/api/bundle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files }),
        });
        const data = await b.json();
        finalPreview = data.html || '<!-- bundle failed -->';
      } else {
        setView('preview');
      }

      setPreview(finalPreview);
      pushVersion(task.slice(0, 40), mode, finalSource, finalPreview);
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setPreview(`<pre style="color:#b91c1c;padding:16px">${(e as Error).message}</pre>`);
    } finally {
      setIsBuilding(false);
    }
  }

  function goTo(i: number) {
    const v = versions[i];
    if (!v) return;
    setVIndex(i);
    setMode(v.mode);
    setSource(v.source);
    setPreview(v.preview);
  }

  function download() {
    const blob = new Blob([mode === 'html' ? preview : source], {
      type: mode === 'html' ? 'text/html' : 'text/plain',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = mode === 'html' ? 'index.html' : 'forge-app.txt';
    a.click();
  }

  async function publish() {
    setStatus('publishing…');
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: preview }),
    });
    const data = await res.json();
    if (data.url) { setPublishedUrl(data.url); setStatus('published'); }
    else setStatus('publish failed');
  }

  const submit = (e: { preventDefault?: () => void }) => {
    e.preventDefault?.();
    build(prompt, hasBuilt);
    if (hasBuilt) setPrompt('');
  };

  return (
    <div style={S.app}>
      <aside style={S.side}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 26 }}>🔨</span>
          <h1 style={{ margin: 0, fontSize: 22 }}>Forge</h1>
        </div>
        <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 6 }}>Describe an app. Watch it built live.</p>

        <div style={S.modeRow}>
          {(['html', 'react'] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} disabled={isBuilding}
              style={mode === m ? S.modeActive : S.modeBtn}>{m === 'html' ? 'HTML' : 'React'}</button>
          ))}
        </div>

        <form onSubmit={submit} style={{ marginTop: 12 }}>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
            placeholder={hasBuilt ? 'Describe a change…' : `Describe a ${mode} app…`} style={S.textarea} />
          <button type="submit" disabled={isBuilding} style={{ ...S.btn, opacity: isBuilding ? 0.6 : 1 }}>
            {isBuilding ? 'Building…' : hasBuilt ? 'Apply change' : 'Build it'}
          </button>
        </form>

        {!hasBuilt && (
          <div style={{ marginTop: 14 }}>
            <div style={S.hint}>Try one:</div>
            {EXAMPLES[mode].map((ex) => (
              <button key={ex} onClick={() => { setPrompt(ex); build(ex, false); }} style={S.example}>{ex}</button>
            ))}
          </div>
        )}

        {versions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={S.hint}>History ({versions.length})</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button onClick={() => goTo(vIndex - 1)} disabled={vIndex <= 0} style={S.smallBtn}>↶ Undo</button>
              <button onClick={() => goTo(vIndex + 1)} disabled={vIndex >= versions.length - 1} style={S.smallBtn}>Redo ↷</button>
            </div>
            <div style={{ maxHeight: 140, overflow: 'auto' }}>
              {versions.map((v, i) => (
                <button key={v.id} onClick={() => goTo(i)}
                  style={i === vIndex ? S.verActive : S.ver}>
                  <span style={{ opacity: 0.5 }}>{v.mode}</span> {v.label || `v${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto', fontSize: 12, color: '#6b7280', paddingTop: 16 }}>
          Built with Float.js · {status || 'idle'}
        </div>
      </aside>

      <main style={S.canvas}>
        <div style={S.toolbar}>
          <div style={S.tabs}>
            <button onClick={() => setView('preview')} style={view === 'preview' ? S.tabActive : S.tab}>Preview</button>
            <button onClick={() => setView('code')} style={view === 'code' ? S.tabActive : S.tab}>Code</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isBuilding && <span style={S.live}>● live</span>}
            <button onClick={download} disabled={!hasBuilt} style={S.actionBtn}>⬇ Download</button>
            <button onClick={publish} disabled={!hasBuilt || isBuilding} style={S.publishBtn}>🚀 Publish</button>
          </div>
        </div>

        {publishedUrl && (
          <div style={S.published}>
            Published → <a href={publishedUrl} target="_blank" rel="noreferrer" style={{ color: '#065f46', fontWeight: 600 }}>{location.origin}{publishedUrl}</a>
          </div>
        )}

        <div style={S.frameWrap}>
          {!source && !preview && (
            <div style={S.empty}><div style={{ fontSize: 48 }}>🔨</div><p>Describe something on the left and watch Forge build it in real time.</p></div>
          )}
          {view === 'preview' && preview && (
            <iframe title="preview" srcDoc={preview} style={S.frame} sandbox="allow-scripts allow-forms allow-popups" />
          )}
          {view === 'code' && <pre style={S.code}>{source || '// generating…'}</pre>}
        </div>
      </main>
    </div>
  );
}

const S: Record<string, any> = {
  app: { display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' },
  side: { width: 340, minWidth: 340, borderRight: '1px solid #e5e7eb', padding: 20, display: 'flex', flexDirection: 'column', background: '#fafafa', overflow: 'auto' },
  modeRow: { display: 'flex', gap: 6, marginTop: 14, background: '#eef2f7', padding: 3, borderRadius: 8 },
  modeBtn: { flex: 1, padding: '7px', fontSize: 13, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: '#6b7280' },
  modeActive: { flex: 1, padding: '7px', fontSize: 13, border: 'none', background: '#fff', borderRadius: 6, cursor: 'pointer', color: '#111827', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' },
  textarea: { width: '100%', padding: 12, fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 10, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  btn: { width: '100%', marginTop: 10, padding: '12px', fontSize: 15, fontWeight: 600, color: '#fff', background: '#111827', border: 'none', borderRadius: 10, cursor: 'pointer' },
  hint: { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  example: { display: 'block', width: '100%', textAlign: 'left', padding: '9px 11px', margin: '6px 0', background: '#fff', border: '1px solid #eef2f7', borderRadius: 8, cursor: 'pointer', color: '#374151', fontSize: 13 },
  smallBtn: { flex: 1, padding: '6px', fontSize: 12, border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, cursor: 'pointer', color: '#374151' },
  ver: { display: 'block', width: '100%', textAlign: 'left', padding: '6px 9px', margin: '3px 0', background: '#fff', border: '1px solid #eef2f7', borderRadius: 6, cursor: 'pointer', color: '#374151', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  verActive: { display: 'block', width: '100%', textAlign: 'left', padding: '6px 9px', margin: '3px 0', background: '#ede9fe', border: '1px solid #ddd6fe', borderRadius: 6, cursor: 'pointer', color: '#5b21b6', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  canvas: { flex: 1, display: 'flex', flexDirection: 'column', background: '#f3f4f6', minWidth: 0 },
  toolbar: { height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #e5e7eb', background: '#fff' },
  tabs: { display: 'flex', gap: 4, background: '#f3f4f6', padding: 3, borderRadius: 8 },
  tab: { padding: '5px 12px', fontSize: 13, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: '#6b7280' },
  tabActive: { padding: '5px 12px', fontSize: 13, border: 'none', background: '#fff', borderRadius: 6, cursor: 'pointer', color: '#111827', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' },
  actionBtn: { padding: '6px 10px', fontSize: 13, border: '1px solid #e5e7eb', background: '#fff', borderRadius: 7, cursor: 'pointer', color: '#374151' },
  publishBtn: { padding: '6px 12px', fontSize: 13, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: 7, cursor: 'pointer', fontWeight: 600 },
  live: { color: '#ef4444', fontSize: 12, fontWeight: 600 },
  published: { padding: '8px 16px', background: '#ecfdf5', borderBottom: '1px solid #d1fae5', fontSize: 13, color: '#065f46' },
  frameWrap: { flex: 1, position: 'relative', overflow: 'auto' },
  frame: { width: '100%', height: '100%', border: 'none', background: '#fff' },
  code: { margin: 0, padding: 16, fontSize: 12, lineHeight: 1.5, fontFamily: 'Menlo, monospace', color: '#1f2937', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  empty: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textAlign: 'center', gap: 8, padding: 24 },
};
