import { useEffect, useState } from 'react';

export const metadata = {
  title: 'Forge — build & ship apps in real time',
  description: 'Describe an app in plain language. Watch an AI build it live, then publish it to a URL in one click. Powered by Float.js.',
};

const FEATURES = [
  { icon: '⚡', title: 'Real-time generation', desc: 'Watch the code stream in live, file by file, with a token & time counter — no black box.' },
  { icon: '⚛', title: 'HTML or real React', desc: 'Single-file pages or multi-file React apps, bundled in-browser with esbuild and previewed instantly.' },
  { icon: '🔧', title: 'Self-healing', desc: 'If a build breaks, Forge feeds the error back to the model and fixes it for you. One click.' },
  { icon: '🕘', title: 'Versioned', desc: 'Every build is a version. Undo, redo, branch and compare — your whole history is kept.' },
  { icon: '🚀', title: 'Publish instantly', desc: 'Ship any build to a live URL in one click. Share it, embed it, iterate on it.' },
  { icon: '🪶', title: 'Zero setup', desc: 'No config, no install. Describe, build, publish — all from the browser.' },
];

const STEPS = [
  { n: '01', t: 'Describe', d: 'Tell Forge what you want in plain language.' },
  { n: '02', t: 'Watch it build', d: 'The AI writes the code live, you see every step.' },
  { n: '03', t: 'Ship it', d: 'Preview, tweak, and publish to a URL in seconds.' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={S.glowA} className="float-glow" />
      <div style={S.glowB} className="float-glow" />

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.brand}><span style={S.logo}>🔨</span><b style={{ fontSize: 17 }}>Forge</b><span style={S.byline}>by Float.js</span></div>
        <div style={S.navLinks}>
          <a href="#features" style={S.navLink}>Features</a>
          <a href="#how" style={S.navLink}>How it works</a>
          <a href="/login" style={S.navLink}>Sign in</a>
          <a href="/login" style={S.navCta}>Get started →</a>
        </div>
      </nav>

      {/* Hero */}
      <header style={S.hero}>
        <div style={{ ...S.heroInner, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)' }}>
          <a href="/app" style={S.badge}>✨ Now with real React + esbuild previews →</a>
          <h1 style={S.h1}>
            Describe an app.<br />
            <span style={S.grad}>Watch it built, live.</span>
          </h1>
          <p style={S.sub}>
            Forge turns plain language into working web apps in real time — streaming the code as it writes,
            running it instantly, and publishing it to a URL in one click.
          </p>
          <div style={S.ctaRow}>
            <a href="/app" style={S.ctaPrimary}>Start building — free</a>
            <a href="/login" style={S.ctaGhost}>Create account</a>
          </div>
          <div style={S.trust}>No setup · Streams in real time · Publish in one click</div>
        </div>

        {/* Mock window */}
        <div style={{ ...S.mock, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(28px)' }}>
          <div style={S.mockBar}>
            <span style={{ ...S.dot, background: '#ff5f57' }} /><span style={{ ...S.dot, background: '#febc2e' }} /><span style={{ ...S.dot, background: '#28c840' }} />
            <span style={S.mockUrl}>forge / new-app</span>
          </div>
          <div style={S.mockBody}>
            <pre style={S.mockCode}><span style={{ color: '#7d8590' }}>// building “a pricing page”…</span>{'\n'}<span style={{ color: '#ff7b72' }}>export default function</span> <span style={{ color: '#d2a8ff' }}>Pricing</span>() {'{'}{'\n'}  <span style={{ color: '#ff7b72' }}>return</span> <span style={{ color: '#7ee787' }}>&lt;section</span> className=<span style={{ color: '#a5d6ff' }}>"py-20"</span><span style={{ color: '#7ee787' }}>&gt;</span><span className="cursor">▍</span></pre>
            <div style={S.mockSide}>
              <div style={S.mockStep}>⚡ Writing Pricing.tsx</div>
              <div style={S.mockStep}>📄 Card.tsx</div>
              <div style={S.mockStep}>🚀 Ready · 4.2s</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" style={S.section}>
        <div style={S.kicker}>Why Forge</div>
        <h2 style={S.h2}>Everything you need to go from idea to live app</h2>
        <div style={S.grid}>
          {FEATURES.map((f) => (
            <div key={f.title} style={S.card} className="float-card">
              <div style={S.cardIcon}>{f.icon}</div>
              <h3 style={S.cardTitle}>{f.title}</h3>
              <p style={S.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" style={S.section}>
        <div style={S.kicker}>How it works</div>
        <h2 style={S.h2}>Three steps. Seconds, not hours.</h2>
        <div style={S.steps}>
          {STEPS.map((s) => (
            <div key={s.n} style={S.step}>
              <div style={S.stepN}>{s.n}</div>
              <h3 style={S.cardTitle}>{s.t}</h3>
              <p style={S.cardDesc}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={S.ctaBand}>
        <h2 style={{ ...S.h2, marginBottom: 8 }}>Build your first app in 60 seconds</h2>
        <p style={{ color: '#8b949e', marginBottom: 22 }}>No credit card. No setup. Just describe it.</p>
        <a href="/app" style={S.ctaPrimary}>Open Forge →</a>
      </section>

      <footer style={S.footer}>
        <span>🔨 Forge — built on <a href="https://github.com/float-js/float.js" style={S.flink}>Float.js</a></span>
        <span style={{ color: '#484f58' }}>SSR · live hydration · AI-native</span>
      </footer>
    </div>
  );
}

const CSS = `
@keyframes floatGlow { 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(20px,-20px) scale(1.1); } }
@keyframes blink { 50% { opacity: 0; } }
.float-glow { animation: floatGlow 12s ease-in-out infinite; }
.cursor { color:#a78bfa; animation: blink 1s step-end infinite; }
.float-card { transition: transform .2s ease, border-color .2s ease, background .2s ease; }
.float-card:hover { transform: translateY(-4px); border-color: rgba(139,92,246,.5); background: #14181f; }
a { text-decoration: none; }
html { scroll-behavior: smooth; }
*::-webkit-scrollbar { width: 10px; } *::-webkit-scrollbar-thumb { background:#30363d; border-radius:6px; }
`;

const S: Record<string, any> = {
  page: { position: 'relative', minHeight: '100vh', background: '#0a0c10', color: '#e6edf3', fontFamily: 'ui-sans-serif, system-ui, sans-serif', overflowX: 'hidden' },
  glowA: { position: 'absolute', top: -120, left: '10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.28), transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' },
  glowB: { position: 'absolute', top: 200, right: '5%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.22), transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' },
  nav: { position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1120, margin: '0 auto', padding: '20px 24px' },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: { fontSize: 22, filter: 'drop-shadow(0 0 10px rgba(139,92,246,.6))' },
  byline: { fontSize: 12, color: '#6e7681', marginLeft: 4 },
  navLinks: { display: 'flex', alignItems: 'center', gap: 22 },
  navLink: { color: '#adbac7', fontSize: 14 },
  navCta: { color: '#fff', fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', padding: '8px 14px', borderRadius: 9 },
  hero: { position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '60px 24px 40px', display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'center' },
  heroInner: { transition: 'all .7s cubic-bezier(.2,.7,.2,1)' },
  badge: { display: 'inline-block', fontSize: 12.5, color: '#c4b5fd', background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)', padding: '6px 12px', borderRadius: 999, marginBottom: 22 },
  h1: { fontSize: 54, lineHeight: 1.05, fontWeight: 800, letterSpacing: -1.5, margin: '0 0 18px' },
  grad: { background: 'linear-gradient(120deg,#818cf8,#c084fc,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  sub: { fontSize: 17, lineHeight: 1.6, color: '#9da3af', maxWidth: 480, margin: '0 0 28px' },
  ctaRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  ctaPrimary: { display: 'inline-block', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px 22px', borderRadius: 11, boxShadow: '0 10px 30px -10px rgba(139,92,246,.6)' },
  ctaGhost: { display: 'inline-block', color: '#e6edf3', fontWeight: 600, fontSize: 15, padding: '13px 22px', borderRadius: 11, border: '1px solid #30363d', background: '#0f1218' },
  trust: { marginTop: 18, fontSize: 12.5, color: '#6e7681' },
  mock: { transition: 'all .9s cubic-bezier(.2,.7,.2,1) .1s', borderRadius: 16, border: '1px solid #21262d', background: '#0d1117', boxShadow: '0 30px 80px -30px rgba(0,0,0,.8)', overflow: 'hidden' },
  mockBar: { display: 'flex', alignItems: 'center', gap: 7, padding: '11px 14px', borderBottom: '1px solid #21262d', background: '#0a0d12' },
  dot: { width: 11, height: 11, borderRadius: 999, display: 'inline-block' },
  mockUrl: { marginLeft: 10, fontSize: 12, color: '#6e7681', fontFamily: 'ui-monospace, monospace' },
  mockBody: { display: 'grid', gridTemplateColumns: '1fr 150px', minHeight: 220 },
  mockCode: { margin: 0, padding: 16, fontSize: 12.5, lineHeight: 1.7, fontFamily: 'ui-monospace, Menlo, monospace', color: '#c9d1d9', whiteSpace: 'pre-wrap' },
  mockSide: { borderLeft: '1px solid #21262d', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: '#0b0e13' },
  mockStep: { fontSize: 12, color: '#adbac7' },
  section: { position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '64px 24px' },
  kicker: { textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a78bfa', marginBottom: 10 },
  h2: { textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: -0.8, margin: '0 0 40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  card: { background: '#0f1218', border: '1px solid #21262d', borderRadius: 14, padding: 22 },
  cardIcon: { fontSize: 26, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 700, margin: '0 0 6px' },
  cardDesc: { fontSize: 13.5, lineHeight: 1.6, color: '#8b949e', margin: 0 },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  step: { background: 'linear-gradient(180deg,#0f1218,#0c0f14)', border: '1px solid #21262d', borderRadius: 14, padding: 24 },
  stepN: { fontSize: 28, fontWeight: 800, background: 'linear-gradient(120deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 10 },
  ctaBand: { position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 1120, margin: '20px auto 0', padding: '56px 24px', borderTop: '1px solid #21262d' },
  footer: { position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '28px 24px 48px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: 13, color: '#6e7681', borderTop: '1px solid #21262d' },
  flink: { color: '#a78bfa' },
};
