import { useEffect, useRef, useState } from 'react';
import { readStream } from '@float.js/core/client';

export const metadata = {
  title: 'Forge — build apps in real time',
  description: 'Describe an app. Watch the AI build it live, file by file.',
};

type Mode = 'html' | 'react';
interface Action { id: number; icon: string; label: string; spin?: boolean }
interface Version { id: number; label: string; mode: Mode; source: string; preview: string }

const EXAMPLES: Record<Mode, string[]> = {
  html: [
    'A SaaS landing page with hero, features and pricing',
    'A neon synthwave calculator that actually works',
    'An animated 3D-ish product card with hover effects',
  ],
  react: [
    'A todo app with add, complete and filters',
    'A pomodoro timer with a circular progress ring',
    'A kanban board with draggable-looking columns',
  ],
};

const stripFences = (s: string) => s.replace(/^\s*```(?:html|tsx|jsx)?\s*/i, '').replace(/\s*```\s*$/i, '');

function parseFiles(raw: string): Record<string, string> {
  const files: Record<string, string> = {};
  const parts = raw.split(/===\s*FILE:\s*(.+?)\s*===\n?/g);
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].trim();
    const body = stripFences((parts[i + 1] ?? '').replace(/\n=+\s*$/, '')).trim();
    if (name) files[name] = body;
  }
  return files;
}

// Lightweight syntax highlighter -> HTML (escaped first).
function highlight(code: string): string {
  const esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const re =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`])*`|"(?:\\.|[^"])*"|'(?:\\.|[^'])*')|(&lt;\/?[A-Za-z][\w.-]*)|\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|await|async|true|false|null|undefined|type|interface|useState|useEffect|useRef)\b|\b(\d+(?:\.\d+)?)\b/g;
  return esc.replace(re, (m, comment, str, tag, kw, num) => {
    if (comment) return `<span style="color:#7d8590">${comment}</span>`;
    if (str) return `<span style="color:#a5d6ff">${str}</span>`;
    if (tag) return `<span style="color:#7ee787">${tag}</span>`;
    if (kw) return `<span style="color:#ff7b72">${kw}</span>`;
    if (num) return `<span style="color:#79c0ff">${num}</span>`;
    return m;
  });
}

export default function Forge() {
  const [mode, setMode] = useState<Mode>('react');
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [view, setView] = useState<'code' | 'preview'>('preview');
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState('');
  const [preview, setPreview] = useState('');
  const [actions, setActions] = useState<Action[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [vIndex, setVIndex] = useState(-1);
  const [publishedUrl, setPublishedUrl] = useState('');
  const idRef = useRef(0);
  const aidRef = useRef(0);
  const codeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('forge-v2');
      if (saved) {
        const v: Version[] = JSON.parse(saved);
        if (v.length) { setVersions(v); restore(v[v.length - 1], v.length - 1); idRef.current = v[v.length - 1].id; }
      }
    } catch {}
  }, []);

  // Auto-scroll the editor while streaming.
  useEffect(() => { if (codeRef.current) codeRef.current.scrollTop = codeRef.current.scrollHeight; });

  function restore(v: Version, i: number) {
    setMode(v.mode); setVIndex(i);
    const f = v.mode === 'react' ? parseFiles(v.source) : { 'index.html': v.source };
    setFiles(f); setActiveFile(Object.keys(f)[0] || ''); setPreview(v.preview); setActions([]);
  }

  function persist(v: Version[]) { try { localStorage.setItem('forge-v2', JSON.stringify(v.slice(-20))); } catch {} }
  function act(icon: string, label: string, spin = false) {
    const id = ++aidRef.current;
    setActions((a) => [...a, { id, icon, label, spin }]);
    return id;
  }
  function settle(id: number, icon: string) {
    setActions((a) => a.map((x) => (x.id === id ? { ...x, icon, spin: false } : x)));
  }

  const hasBuilt = preview !== '' || Object.keys(files).length > 0;
  const fileList = Object.keys(files);
  const currentSource = mode === 'html' ? (files['index.html'] || '') : Object.entries(files).map(([n, c]) => `=== FILE: ${n} ===\n${c}`).join('\n');

  async function build(task: string, isEdit: boolean) {
    if (!task.trim() || isBuilding) return;
    setIsBuilding(true); setView('code'); setPublishedUrl(''); setActions([]);
    if (!isEdit) { setFiles({}); setActiveFile(''); setPreview(''); }

    const think = act('◐', isEdit ? 'Applying your change…' : 'Designing the app…', true);
    try {
      const res = await fetch('/api/build', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: task, mode, current: isEdit ? currentSource : undefined }),
      });
      if (!res.ok || !res.body) throw new Error(`Build failed: ${res.status}`);
      settle(think, '✓');

      let acc = '';
      const seen = new Set<string>();
      let writing = 0;
      for await (const chunk of readStream(res.body, 'text')) {
        acc += chunk;
        if (mode === 'html') {
          const clean = stripFences(acc);
          setFiles({ 'index.html': clean }); setActiveFile('index.html');
          if (!writing) writing = act('▍', 'Writing index.html', true);
        } else {
          const f = parseFiles(acc);
          setFiles(f);
          const keys = Object.keys(f);
          for (const k of keys) if (!seen.has(k)) { seen.add(k); if (writing) settle(writing, '📄'); writing = act('▍', `Writing ${k}`, true); }
          if (keys.length) setActiveFile(keys[keys.length - 1]);
        }
      }
      if (writing) settle(writing, '📄');

      let finalPreview = '';
      if (mode === 'react') {
        const bundling = act('◐', 'Bundling with esbuild…', true);
        setView('preview');
        const b = await fetch('/api/bundle', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: parseFiles(acc) }),
        });
        const data = await b.json();
        finalPreview = data.html || '<!-- bundle failed -->';
        settle(bundling, data.error ? '✗' : '✓');
      } else {
        finalPreview = stripFences(acc); setView('preview');
      }
      setPreview(finalPreview);
      act('🚀', 'Ready — preview live');

      const ver: Version = { id: ++idRef.current, label: task.slice(0, 44), mode, source: stripFences(acc), preview: finalPreview };
      setVersions((cur) => { const next = [...cur.slice(0, vIndex + 1), ver]; persist(next); setVIndex(next.length - 1); return next; });
    } catch (e) {
      act('✗', (e as Error).message);
      setPreview(`<pre style="color:#f85149;padding:16px;font-family:monospace">${(e as Error).message}</pre>`);
    } finally {
      setIsBuilding(false);
    }
  }

  function download() {
    const single = mode === 'html';
    const blob = new Blob([single ? (files['index.html'] || '') : currentSource], { type: single ? 'text/html' : 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = single ? 'index.html' : 'forge-app.txt'; a.click();
  }
  async function publish() {
    const id = act('◐', 'Publishing…', true);
    const res = await fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: preview }) });
    const data = await res.json();
    if (data.url) { setPublishedUrl(data.url); settle(id, '🌐'); } else settle(id, '✗');
  }

  const submit = (e: { preventDefault?: () => void }) => { e.preventDefault?.(); build(prompt, hasBuilt); if (hasBuilt) setPrompt(''); };

  return (
    <div style={S.app}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <aside style={S.side}>
        <div style={S.brand}>
          <span style={S.logo}>🔨</span>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>Forge</span>
          <span style={S.pill}>live</span>
        </div>

        <div style={S.modeRow}>
          {(['react', 'html'] as Mode[]).map((m) => (
            <button key={m} disabled={isBuilding} onClick={() => setMode(m)} style={mode === m ? S.modeOn : S.modeOff}>
              {m === 'react' ? '⚛ React' : '⬡ HTML'}
            </button>
          ))}
        </div>

        {/* Activity feed */}
        <div style={S.feed}>
          {actions.length === 0 && !isBuilding && (
            <div style={S.feedEmpty}>What do you want to build?</div>
          )}
          {actions.map((a) => (
            <div key={a.id} style={S.action}>
              <span style={{ ...S.actionIcon, ...(a.spin ? { animation: 'spin 1s linear infinite' } : {}) }}>{a.icon}</span>
              <span style={a.spin ? S.actionLabelLive : S.actionLabel}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Versions */}
        {versions.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={S.miniHdr}>
              <span>History</span>
              <span style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => restore(versions[vIndex - 1], vIndex - 1)} disabled={vIndex <= 0} style={S.ghost}>↶</button>
                <button onClick={() => restore(versions[vIndex + 1], vIndex + 1)} disabled={vIndex >= versions.length - 1} style={S.ghost}>↷</button>
              </span>
            </div>
            <div style={{ maxHeight: 120, overflow: 'auto' }}>
              {versions.map((v, i) => (
                <button key={v.id} onClick={() => restore(v, i)} style={i === vIndex ? S.verOn : S.ver}>
                  <span style={{ opacity: 0.5, marginRight: 6 }}>{v.mode === 'react' ? '⚛' : '⬡'}</span>{v.label || `v${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {!hasBuilt && !isBuilding && (
          <div style={{ marginBottom: 10 }}>
            <div style={S.miniHdr}><span>Try one</span></div>
            {EXAMPLES[mode].map((ex) => (
              <button key={ex} onClick={() => { setPrompt(ex); build(ex, false); }} style={S.example}>{ex}</button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form onSubmit={submit} style={S.composer}>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e); }}
            placeholder={hasBuilt ? 'Describe a change…  (⌘↵)' : `Describe a ${mode} app…  (⌘↵)`} style={S.textarea} />
          <button type="submit" disabled={isBuilding} style={{ ...S.send, opacity: isBuilding ? 0.55 : 1 }}>
            {isBuilding ? 'Building…' : hasBuilt ? 'Apply change ↑' : 'Build it ↑'}
          </button>
        </form>
      </aside>

      {/* Workspace */}
      <main style={S.work}>
        <div style={S.topbar}>
          <div style={S.tabs}>
            <button onClick={() => setView('code')} style={view === 'code' ? S.tabOn : S.tab}>Code</button>
            <button onClick={() => setView('preview')} style={view === 'preview' ? S.tabOn : S.tab}>Preview</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isBuilding && <span style={S.genDot}><i style={S.dot} /> generating</span>}
            <button onClick={download} disabled={!hasBuilt} style={S.toolBtn}>⬇ Code</button>
            <button onClick={publish} disabled={!hasBuilt || isBuilding} style={S.publish}>🚀 Publish</button>
          </div>
        </div>

        {publishedUrl && (
          <a href={publishedUrl} target="_blank" rel="noreferrer" style={S.publishedBar}>
            🌐 Live at <b>{typeof location !== 'undefined' ? location.origin : ''}{publishedUrl}</b> — click to open
          </a>
        )}

        {/* File tabs */}
        {view === 'code' && fileList.length > 0 && (
          <div style={S.fileTabs}>
            {fileList.map((f) => (
              <button key={f} onClick={() => setActiveFile(f)} style={f === activeFile ? S.fileOn : S.fileTab}>
                {iconFor(f)} {f}
              </button>
            ))}
          </div>
        )}

        <div style={S.stage}>
          {!hasBuilt && (
            <div style={S.hero}>
              <div style={{ fontSize: 56 }}>🔨</div>
              <h2 style={{ margin: '8px 0 4px', fontWeight: 700 }}>Build anything, live.</h2>
              <p style={{ color: '#7d8590', maxWidth: 360, textAlign: 'center' }}>
                Describe an app on the left. Watch Forge write the code in real time, then run it instantly.
              </p>
            </div>
          )}

          {hasBuilt && view === 'code' && (
            <div ref={codeRef} style={S.editor}>
              <pre style={S.pre}>
                <code dangerouslySetInnerHTML={{ __html: highlight(files[activeFile] || '') + (isBuilding ? '<span class="caret">▍</span>' : '') }} />
              </pre>
            </div>
          )}

          {hasBuilt && view === 'preview' && (
            preview
              ? <iframe title="preview" srcDoc={preview} style={S.frame} sandbox="allow-scripts allow-forms allow-popups allow-modals" />
              : <div style={S.hero}><div className="pulse" style={{ fontSize: 40 }}>⚙️</div><p style={{ color: '#7d8590' }}>Assembling preview…</p></div>
          )}
        </div>
      </main>
    </div>
  );
}

function iconFor(f: string) {
  if (f.endsWith('.tsx') || f.endsWith('.jsx')) return '⚛';
  if (f.endsWith('.html')) return '⬡';
  if (f.endsWith('.css')) return '🎨';
  return '📄';
}

const CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
.caret { color:#58a6ff; animation: blink 1s step-end infinite; }
.pulse { animation: pulse 1.2s ease-in-out infinite; }
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-thumb { background: #30363d; border-radius: 6px; }
textarea:focus { outline: 2px solid #6366f1; }
`;

const S: Record<string, any> = {
  app: { display: 'flex', height: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'ui-sans-serif, system-ui, sans-serif' },
  side: { width: 360, minWidth: 360, background: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', padding: 16 },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: { fontSize: 22, filter: 'drop-shadow(0 0 8px rgba(139,92,246,.5))' },
  pill: { marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#a78bfa', background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)', padding: '2px 8px', borderRadius: 999 },
  modeRow: { display: 'flex', gap: 4, marginTop: 14, background: '#161b22', border: '1px solid #21262d', padding: 3, borderRadius: 10 },
  modeOn: { flex: 1, padding: '7px', fontSize: 13, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: 7, cursor: 'pointer', fontWeight: 600 },
  modeOff: { flex: 1, padding: '7px', fontSize: 13, border: 'none', background: 'transparent', color: '#8b949e', borderRadius: 7, cursor: 'pointer' },
  feed: { flex: 1, marginTop: 14, overflow: 'auto', minHeight: 60 },
  feedEmpty: { color: '#484f58', fontSize: 13, padding: '8px 2px' },
  action: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 2px', fontSize: 13 },
  actionIcon: { width: 18, textAlign: 'center', color: '#8b949e', display: 'inline-block' },
  actionLabel: { color: '#c9d1d9' },
  actionLabelLive: { color: '#fff', fontWeight: 500 },
  miniHdr: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: '#6e7681', margin: '6px 0' },
  ghost: { background: 'transparent', border: '1px solid #30363d', color: '#c9d1d9', borderRadius: 6, padding: '1px 7px', cursor: 'pointer', fontSize: 12 },
  ver: { display: 'block', width: '100%', textAlign: 'left', padding: '6px 9px', margin: '3px 0', background: '#161b22', border: '1px solid #21262d', borderRadius: 7, cursor: 'pointer', color: '#c9d1d9', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  verOn: { display: 'block', width: '100%', textAlign: 'left', padding: '6px 9px', margin: '3px 0', background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.4)', borderRadius: 7, cursor: 'pointer', color: '#d2c4ff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  example: { display: 'block', width: '100%', textAlign: 'left', padding: '9px 11px', margin: '5px 0', background: '#161b22', border: '1px solid #21262d', borderRadius: 8, cursor: 'pointer', color: '#adbac7', fontSize: 13 },
  composer: { marginTop: 'auto' },
  textarea: { width: '100%', padding: 12, fontSize: 14, color: '#e6edf3', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  send: { width: '100%', marginTop: 8, padding: '11px', fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, cursor: 'pointer' },
  work: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#010409' },
  topbar: { height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', borderBottom: '1px solid #21262d', background: '#0d1117' },
  tabs: { display: 'flex', gap: 3, background: '#161b22', border: '1px solid #21262d', padding: 3, borderRadius: 9 },
  tab: { padding: '5px 14px', fontSize: 13, border: 'none', background: 'transparent', color: '#8b949e', borderRadius: 6, cursor: 'pointer' },
  tabOn: { padding: '5px 14px', fontSize: 13, border: 'none', background: '#21262d', color: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  genDot: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#a78bfa' },
  dot: { width: 7, height: 7, borderRadius: 999, background: '#a78bfa', display: 'inline-block', animation: 'pulse 1s ease-in-out infinite' },
  toolBtn: { padding: '6px 10px', fontSize: 13, border: '1px solid #30363d', background: '#161b22', color: '#c9d1d9', borderRadius: 8, cursor: 'pointer' },
  publish: { padding: '6px 13px', fontSize: 13, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  publishedBar: { display: 'block', padding: '8px 14px', background: 'rgba(16,185,129,.1)', borderBottom: '1px solid rgba(16,185,129,.3)', fontSize: 13, color: '#34d399', textDecoration: 'none' },
  fileTabs: { display: 'flex', gap: 2, padding: '6px 8px 0', background: '#0d1117', borderBottom: '1px solid #21262d', overflowX: 'auto' },
  fileTab: { padding: '6px 11px', fontSize: 12, border: 'none', background: 'transparent', color: '#8b949e', borderRadius: '6px 6px 0 0', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace' },
  fileOn: { padding: '6px 11px', fontSize: 12, border: 'none', borderBottom: '2px solid #8b5cf6', background: '#161b22', color: '#fff', borderRadius: '6px 6px 0 0', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace' },
  stage: { flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' },
  hero: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 },
  editor: { flex: 1, overflow: 'auto', background: '#0d1117' },
  pre: { margin: 0, padding: '14px 16px', fontSize: 12.5, lineHeight: 1.6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: '#c9d1d9', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  frame: { flex: 1, width: '100%', height: '100%', border: 'none', background: '#fff' },
};
