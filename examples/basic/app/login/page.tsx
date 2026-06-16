import { useEffect, useState } from 'react';

export const metadata = {
  title: 'Sign in · Forge',
  description: 'Sign in to Forge to access your dashboard and build apps in real time.',
  robots: { index: false, follow: false },
};

type Tab = 'signin' | 'signup';

export default function Login() {
  const [tab, setTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const acc = localStorage.getItem('forge-account');
      setHasAccount(!!acc);
      setTab(acc ? 'signin' : 'signup');
      // already logged in -> go straight to the app
      if (localStorage.getItem('forge-session')) window.location.href = '/app';
    } catch {}
  }, []);

  const submit = (e: { preventDefault?: () => void }) => {
    e.preventDefault?.();
    setError('');
    const u = username.trim();
    if (!u || !password) { setError('Enter a username and password.'); return; }
    if (u.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }

    setLoading(true);
    try {
      if (tab === 'signup') {
        localStorage.setItem('forge-account', JSON.stringify({ username: u, password }));
        localStorage.setItem('forge-session', JSON.stringify({ username: u, at: Date.now() }));
      } else {
        const raw = localStorage.getItem('forge-account');
        if (!raw) { setLoading(false); setError('No account found. Create one first.'); setTab('signup'); return; }
        const acc = JSON.parse(raw);
        if (acc.username !== u || acc.password !== password) { setLoading(false); setError('Invalid username or password.'); return; }
        localStorage.setItem('forge-session', JSON.stringify({ username: u, at: Date.now() }));
      }
    } catch { setLoading(false); setError('Storage unavailable.'); return; }

    setTimeout(() => { window.location.href = '/app'; }, 500);
  };

  return (
    <div style={S.wrap}>
      <style>{CSS}</style>

      <div style={S.brandPanel} className="lg-brand">
        <div style={S.glow} className="lg-glow" />
        <a href="/" style={S.brand}><span style={S.logo}>🔨</span><b style={{ fontSize: 18 }}>Forge</b></a>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={S.bigTitle}>Build apps at the speed of thought.</h1>
          <p style={S.bigSub}>Describe what you want. Watch Forge write it live, run it instantly, and ship it to a URL.</p>
          <ul style={S.points}>
            <li style={S.point}><span style={S.check}>✓</span> Real-time, streaming code generation</li>
            <li style={S.point}><span style={S.check}>✓</span> Real React apps, previewed instantly</li>
            <li style={S.point}><span style={S.check}>✓</span> Publish to a live URL in one click</li>
          </ul>
        </div>
        <div style={S.quote}>“From idea to live app in under a minute.”</div>
      </div>

      <div style={S.formPanel}>
        <div style={{ ...S.glass, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)' }}>
          <a href="/" style={S.mobileBrand}><span style={{ fontSize: 22 }}>🔨</span><b>Forge</b></a>

          <div style={S.tabs}>
            <button onClick={() => { setTab('signin'); setError(''); }} style={tab === 'signin' ? S.tabOn : S.tab}>Sign in</button>
            <button onClick={() => { setTab('signup'); setError(''); }} style={tab === 'signup' ? S.tabOn : S.tab}>Create account</button>
          </div>

          <h2 style={S.formTitle}>{tab === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p style={S.formSub}>{tab === 'signin' ? 'Sign in to access your dashboard.' : 'Pick a username and password — stored locally on this device.'}</p>

          <form onSubmit={submit}>
            <Field label="Username">
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" autoComplete="username" style={S.input} />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={tab === 'signin' ? 'current-password' : 'new-password'} style={S.input} />
            </Field>

            {error && <div style={S.error}>⚠ {error}</div>}

            <button type="submit" disabled={loading} style={{ ...S.submit, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entering…' : tab === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p style={S.switch}>
            {tab === 'signin' ? "No account yet? " : 'Already have one? '}
            <button onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); }} style={S.switchBtn}>
              {tab === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
          <p style={S.legal}>Demo auth — your credentials are saved only in this browser's localStorage.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return (<label style={S.field}><span style={S.fieldLabel}>{label}</span>{children}</label>);
}

const CSS = `
@keyframes lgGlow { 0%,100%{ transform: translate(0,0) scale(1);} 50%{ transform: translate(-30px,20px) scale(1.15);} }
.lg-glow { animation: lgGlow 14s ease-in-out infinite; }
input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.2); }
a { text-decoration: none; }
@media (max-width: 880px) { .lg-brand { display:none !important; } }
`;

const S: Record<string, any> = {
  wrap: { display: 'grid', gridTemplateColumns: '1.05fr 1fr', minHeight: '100vh', background: '#0a0c10', color: '#e6edf3', fontFamily: 'ui-sans-serif, system-ui, sans-serif' },
  brandPanel: { position: 'relative', overflow: 'hidden', padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(160deg,#11091f 0%,#0a0c10 55%)', borderRight: '1px solid #21262d' },
  glow: { position: 'absolute', top: '20%', left: '10%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.35), transparent 60%)', filter: 'blur(50px)', pointerEvents: 'none' },
  brand: { position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 9, color: '#fff' },
  logo: { fontSize: 24, filter: 'drop-shadow(0 0 12px rgba(139,92,246,.7))' },
  bigTitle: { fontSize: 40, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.1, margin: '0 0 16px', maxWidth: 460 },
  bigSub: { fontSize: 16, lineHeight: 1.6, color: '#a3acb9', maxWidth: 420, margin: '0 0 28px' },
  points: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  point: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: '#c9d1d9' },
  check: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 999, background: 'rgba(139,92,246,.18)', color: '#c4b5fd', fontSize: 12, fontWeight: 700 },
  quote: { position: 'relative', zIndex: 2, fontSize: 14, color: '#6e7681', fontStyle: 'italic' },
  formPanel: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  glass: { width: '100%', maxWidth: 384, padding: 28, borderRadius: 18, background: 'rgba(22,27,34,0.6)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 80px -30px rgba(0,0,0,.7)', transition: 'all .6s cubic-bezier(.2,.7,.2,1)' },
  mobileBrand: { display: 'flex', alignItems: 'center', gap: 8, color: '#fff', marginBottom: 20, justifyContent: 'center' },
  tabs: { display: 'flex', gap: 4, background: 'rgba(13,17,23,0.6)', border: '1px solid #21262d', padding: 4, borderRadius: 11, marginBottom: 22 },
  tab: { flex: 1, padding: '9px', fontSize: 13.5, border: 'none', background: 'transparent', color: '#8b949e', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  tabOn: { flex: 1, padding: '9px', fontSize: 13.5, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  formTitle: { fontSize: 23, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 4px' },
  formSub: { fontSize: 13.5, color: '#8b949e', margin: '0 0 22px' },
  field: { display: 'block', marginBottom: 14 },
  fieldLabel: { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#adbac7', marginBottom: 6 },
  input: { width: '100%', padding: '11px 13px', fontSize: 14, color: '#e6edf3', background: 'rgba(15,18,24,0.8)', border: '1px solid #30363d', borderRadius: 10, boxSizing: 'border-box', transition: 'border-color .15s, box-shadow .15s' },
  error: { fontSize: 12.5, color: '#ff9b94', background: 'rgba(248,81,73,.1)', border: '1px solid rgba(248,81,73,.3)', borderRadius: 8, padding: '8px 11px', marginBottom: 14 },
  submit: { width: '100%', padding: '12px', fontSize: 15, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, cursor: 'pointer', marginTop: 4, boxShadow: '0 10px 30px -12px rgba(139,92,246,.7)' },
  switch: { textAlign: 'center', fontSize: 13.5, color: '#8b949e', marginTop: 18 },
  switchBtn: { background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, padding: 0 },
  legal: { textAlign: 'center', fontSize: 11, color: '#484f58', marginTop: 14, lineHeight: 1.5 },
};
