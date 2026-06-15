import { useEffect, useState } from 'react';

export const metadata = {
  title: 'Sign in · Forge',
  description: 'Sign in to Forge and start building apps in real time.',
};

type Tab = 'signin' | 'signup';

export default function Login() {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const submit = (e: { preventDefault?: () => void }) => {
    e.preventDefault?.();
    if (!email.trim()) return;
    setLoading(true);
    // Demo auth: persist a lightweight session and enter the builder.
    try {
      localStorage.setItem('forge-user', JSON.stringify({ email, name: name || email.split('@')[0], at: Date.now() }));
    } catch {}
    setTimeout(() => { if (typeof window !== 'undefined') window.location.href = '/app'; }, 650);
  };

  return (
    <div style={S.wrap}>
      <style>{CSS}</style>

      {/* Brand panel */}
      <div style={S.brandPanel} className="lg-brand">
        <div style={S.glow} className="lg-glow" />
        <a href="/" style={S.brand}><span style={S.logo}>🔨</span><b style={{ fontSize: 18 }}>Forge</b></a>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={S.bigTitle}>Build apps at the speed of thought.</h1>
          <p style={S.bigSub}>Describe what you want. Watch Forge write it live, run it instantly, and ship it to a URL.</p>
          <ul style={S.points}>
            <li style={S.point}><span style={S.check}>✓</span> Real-time, streaming code generation</li>
            <li style={S.point}><span style={S.check}>✓</span> Real React apps, bundled & previewed instantly</li>
            <li style={S.point}><span style={S.check}>✓</span> Publish to a live URL in one click</li>
          </ul>
        </div>
        <div style={S.quote}>“From idea to live app in under a minute.”</div>
      </div>

      {/* Form panel */}
      <div style={S.formPanel}>
        <div style={{ ...S.formInner, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)' }}>
          <a href="/" style={S.mobileBrand}><span style={{ fontSize: 22 }}>🔨</span><b>Forge</b></a>

          <div style={S.tabs}>
            <button onClick={() => setTab('signin')} style={tab === 'signin' ? S.tabOn : S.tab}>Sign in</button>
            <button onClick={() => setTab('signup')} style={tab === 'signup' ? S.tabOn : S.tab}>Create account</button>
          </div>

          <h2 style={S.formTitle}>{tab === 'signin' ? 'Welcome back' : 'Create your workspace'}</h2>
          <p style={S.formSub}>{tab === 'signin' ? 'Sign in to keep building.' : 'Spin up a new Forge workspace to build and ship apps.'}</p>

          <div style={S.social}>
            <button style={S.socialBtn} onClick={submit}><span style={{ fontWeight: 700 }}>G</span> Continue with Google</button>
            <button style={S.socialBtn} onClick={submit}><span style={{ fontWeight: 700 }}>⌥</span> Continue with GitHub</button>
          </div>
          <div style={S.divider}><span style={S.dividerLine} /><span style={S.dividerTxt}>or</span><span style={S.dividerLine} /></div>

          <form onSubmit={submit}>
            {tab === 'signup' && (
              <Field label="Workspace name">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Studio" style={S.input} />
              </Field>
            )}
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" style={S.input} required />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={S.input} />
            </Field>

            {tab === 'signin' && <div style={S.forgot}><a href="/login" style={S.link}>Forgot password?</a></div>}

            <button type="submit" disabled={loading} style={{ ...S.submit, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entering…' : tab === 'signin' ? 'Sign in →' : 'Create workspace →'}
            </button>
          </form>

          <p style={S.switch}>
            {tab === 'signin' ? "Don't have a workspace? " : 'Already have one? '}
            <button onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')} style={S.switchBtn}>
              {tab === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
          <p style={S.legal}>By continuing you agree to the Terms & Privacy. Demo login — no real account is created.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <label style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      {children}
    </label>
  );
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
  formInner: { width: '100%', maxWidth: 380, transition: 'all .6s cubic-bezier(.2,.7,.2,1)' },
  mobileBrand: { display: 'flex', alignItems: 'center', gap: 8, color: '#fff', marginBottom: 22, justifyContent: 'center' },
  tabs: { display: 'flex', gap: 4, background: '#0f1218', border: '1px solid #21262d', padding: 4, borderRadius: 11, marginBottom: 24 },
  tab: { flex: 1, padding: '9px', fontSize: 13.5, border: 'none', background: 'transparent', color: '#8b949e', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  tabOn: { flex: 1, padding: '9px', fontSize: 13.5, border: 'none', background: '#1c2230', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  formTitle: { fontSize: 24, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 4px' },
  formSub: { fontSize: 14, color: '#8b949e', margin: '0 0 22px' },
  social: { display: 'flex', flexDirection: 'column', gap: 9 },
  socialBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '11px', fontSize: 14, fontWeight: 600, color: '#e6edf3', background: '#0f1218', border: '1px solid #30363d', borderRadius: 10, cursor: 'pointer' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' },
  dividerLine: { flex: 1, height: 1, background: '#21262d' },
  dividerTxt: { fontSize: 12, color: '#6e7681' },
  field: { display: 'block', marginBottom: 14 },
  fieldLabel: { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#adbac7', marginBottom: 6 },
  input: { width: '100%', padding: '11px 13px', fontSize: 14, color: '#e6edf3', background: '#0f1218', border: '1px solid #30363d', borderRadius: 10, boxSizing: 'border-box', transition: 'border-color .15s, box-shadow .15s' },
  forgot: { textAlign: 'right', marginBottom: 16, marginTop: -4 },
  link: { fontSize: 12.5, color: '#a78bfa' },
  submit: { width: '100%', padding: '12px', fontSize: 15, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, cursor: 'pointer', marginTop: 6, boxShadow: '0 10px 30px -12px rgba(139,92,246,.7)' },
  switch: { textAlign: 'center', fontSize: 13.5, color: '#8b949e', marginTop: 20 },
  switchBtn: { background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, padding: 0 },
  legal: { textAlign: 'center', fontSize: 11, color: '#484f58', marginTop: 16, lineHeight: 1.5 },
};
