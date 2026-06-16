import { useEffect, useState } from 'react';

const SITE = 'https://forge.float.dev';
const OG = `${SITE}/og.png`;

export const metadata = {
  title: 'Forge — Build & ship web apps in real time with AI',
  description:
    'Describe an app in plain language and watch an AI build it live — streaming the code, running real React instantly, and publishing to a URL in one click. Powered by Float.js.',
  keywords: ['AI app builder', 'AI website builder', 'React app generator', 'text to app', 'realtime code generation', 'v0 alternative', 'bolt alternative', 'Float.js', 'AI coding agent'],
  authors: [{ name: 'Forge' }],
  creator: 'Forge',
  publisher: 'Forge',
  applicationName: 'Forge',
  themeColor: '#0a0c10',
  colorScheme: 'dark',
  canonical: `${SITE}/`,
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Forge — Build & ship web apps in real time with AI',
    description: 'Describe an app. Watch an AI build it live, run real React instantly, and publish to a URL in one click.',
    url: `${SITE}/`,
    siteName: 'Forge',
    type: 'website',
    locale: 'en_US',
    images: [{ url: OG, width: 1200, height: 630, alt: 'Forge — build apps in real time' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forge — Build apps in real time with AI',
    description: 'Describe an app. Watch it built live, then publish in one click.',
    site: '@forge',
    creator: '@forge',
    images: [OG],
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Forge',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  description: 'AI app builder that generates and ships web apps in real time.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '128' },
};

const FEATURES = [
  { icon: '⚡', title: 'Real-time generation', desc: 'Watch the code stream in live, file by file, with a token & time counter. No black box.' },
  { icon: '⚛', title: 'HTML or real React', desc: 'Single-file pages or multi-file React apps, bundled in-browser with esbuild and previewed instantly.' },
  { icon: '🔧', title: 'Self-healing builds', desc: 'If a build breaks, Forge feeds the error back to the model and fixes it for you. One click.' },
  { icon: '🕘', title: 'Versioned history', desc: 'Every build is a version. Undo, redo, branch and compare — your whole history is kept.' },
  { icon: '🚀', title: 'Publish instantly', desc: 'Ship any build to a live URL in one click. Share it, embed it, iterate on it.' },
  { icon: '🪶', title: 'Zero setup', desc: 'No config, no install. Describe, build, publish — all from the browser.' },
];
const STEPS = [
  { n: '01', t: 'Describe', d: 'Tell Forge what you want in plain language.' },
  { n: '02', t: 'Watch it build', d: 'The AI writes the code live — you see every step.' },
  { n: '03', t: 'Ship it', d: 'Preview, tweak, and publish to a URL in seconds.' },
];
const STATS = [
  { n: '<60s', l: 'idea → live app' },
  { n: '2', l: 'modes: HTML & React' },
  { n: '1-click', l: 'publish to URL' },
  { n: '∞', l: 'versions kept' },
];

export default function Home() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <div style={S.gridBg} />
      <div style={S.glowA} className="g-float" />
      <div style={S.glowB} className="g-float" />

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navGlass}>
          <a href="/" style={S.brand}><span style={S.logo}>🔨</span><b style={{ fontSize: 16 }}>Forge</b><span style={S.byline}>by Float.js</span></a>
          <div style={S.navLinks}>
            <a href="#features" style={S.navLink}>Features</a>
            <a href="#how" style={S.navLink}>How it works</a>
            <a href="/login" style={S.navLink}>Sign in</a>
            <a href="/login" style={S.navCta}>Get started →</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header style={S.hero}>
        <div style={{ ...S.heroInner, opacity: m ? 1 : 0, transform: m ? 'none' : 'translateY(18px)' }}>
          <a href="/app" style={S.badge}>✨ Real React + esbuild previews, live →</a>
          <h1 style={S.h1}>Describe an app.<br /><span style={S.grad}>Watch it built, live.</span></h1>
          <p style={S.sub}>Forge turns plain language into working web apps in real time — streaming the code as it writes, running it instantly, and publishing it to a URL in one click.</p>
          <div style={S.ctaRow}>
            <a href="/login" style={S.ctaPrimary}>Start building — free</a>
            <a href="#how" style={S.ctaGhost}>See how it works</a>
          </div>
          <div style={S.trust}>No setup · Streams in real time · Publish in one click</div>
        </div>

        <div style={{ ...S.mockWrap, opacity: m ? 1 : 0, transform: m ? 'none' : 'translateY(30px)' }}>
          <div style={S.mock} className="g-card">
            <div style={S.mockBar}>
              <span style={{ ...S.dot, background: '#ff5f57' }} /><span style={{ ...S.dot, background: '#febc2e' }} /><span style={{ ...S.dot, background: '#28c840' }} />
              <span style={S.mockUrl}>forge · new-app</span><span style={S.liveTag}>● live</span>
            </div>
            <div style={S.mockBody}>
              <pre style={S.mockCode}><span style={{ color: '#7d8590' }}>{'// building “a pricing page”…'}</span>{'\n'}<span style={{ color: '#ff7b72' }}>export default function</span> <span style={{ color: '#d2a8ff' }}>Pricing</span>() {'{'}{'\n'}  <span style={{ color: '#ff7b72' }}>return</span> <span style={{ color: '#7ee787' }}>{'<section'}</span> className=<span style={{ color: '#a5d6ff' }}>"py-20"</span><span style={{ color: '#7ee787' }}>{'>'}</span><span className="cur">▍</span></pre>
              <div style={S.mockSide}>
                <div style={S.mStep}>⚡ Pricing.tsx</div>
                <div style={S.mStep}>📄 Card.tsx</div>
                <div style={S.mStep}>📄 Toggle.tsx</div>
                <div style={{ ...S.mStep, color: '#34d399' }}>🚀 Ready · 4.2s</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section style={S.statsWrap}>
        <div style={S.stats} className="g-card">
          {STATS.map((s) => (
            <div key={s.l} style={S.stat}><div style={S.statN}>{s.n}</div><div style={S.statL}>{s.l}</div></div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={S.section}>
        <div style={S.kicker}>Why Forge</div>
        <h2 style={S.h2}>Everything you need to go from idea to live app</h2>
        <div style={S.grid}>
          {FEATURES.map((f) => (
            <div key={f.title} style={S.card} className="g-card g-hover">
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
            <div key={s.n} style={S.step} className="g-card">
              <div style={S.stepN}>{s.n}</div>
              <h3 style={S.cardTitle}>{s.t}</h3>
              <p style={S.cardDesc}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={S.ctaWrap}>
        <div style={S.ctaBand} className="g-card">
          <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, margin: '0 0 8px' }}>Build your first app in 60 seconds</h2>
          <p style={{ color: '#9da3af', marginBottom: 22 }}>No credit card. No setup. Just describe it.</p>
          <a href="/login" style={S.ctaPrimary}>Open Forge →</a>
        </div>
      </section>

      <footer style={S.footer}>
        <span>🔨 Forge — built on <a href="https://github.com/float-js/float.js" style={S.flink}>Float.js</a></span>
        <span style={{ color: '#484f58' }}>SSR · live hydration · AI-native</span>
      </footer>
    </div>
  );
}

const CSS = `
@keyframes gFloat { 0%,100%{ transform: translate(0,0) scale(1);} 50%{ transform: translate(24px,-22px) scale(1.12);} }
@keyframes blink { 50% { opacity: 0; } }
.g-float { animation: gFloat 13s ease-in-out infinite; }
.cur { color:#a78bfa; animation: blink 1s step-end infinite; }
.g-card { backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
.g-hover { transition: transform .22s ease, border-color .22s ease, background .22s ease; }
.g-hover:hover { transform: translateY(-5px); border-color: rgba(139,92,246,.5); background: rgba(20,24,31,.7); }
a { text-decoration: none; }
html { scroll-behavior: smooth; }
*::-webkit-scrollbar { width: 10px; } *::-webkit-scrollbar-thumb { background:#30363d; border-radius:6px; }
@media (max-width: 900px) {
  .g-hero { grid-template-columns: 1fr !important; }
  .g-nav-links a:not(:last-child) { display:none; }
}
`;

const glass = { background: 'rgba(15,18,24,0.55)', border: '1px solid rgba(255,255,255,0.07)' };

const S: Record<string, any> = {
  page: { position: 'relative', minHeight: '100vh', background: '#0a0c10', color: '#e6edf3', fontFamily: 'ui-sans-serif, system-ui, sans-serif', overflowX: 'hidden' },
  gridBg: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)', backgroundSize: '44px 44px', maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 75%)', pointerEvents: 'none' },
  glowA: { position: 'absolute', top: -140, left: '8%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.3), transparent 60%)', filter: 'blur(50px)', pointerEvents: 'none' },
  glowB: { position: 'absolute', top: 160, right: '2%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.24), transparent 60%)', filter: 'blur(50px)', pointerEvents: 'none' },
  nav: { position: 'sticky', top: 0, zIndex: 20, padding: '14px 16px' },
  navGlass: { ...glass, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderRadius: 14 },
  brand: { display: 'flex', alignItems: 'center', gap: 8, color: '#fff' },
  logo: { fontSize: 20, filter: 'drop-shadow(0 0 10px rgba(139,92,246,.6))' },
  byline: { fontSize: 11.5, color: '#6e7681', marginLeft: 4 },
  navLinks: { display: 'flex', alignItems: 'center', gap: 20 },
  navLink: { color: '#adbac7', fontSize: 14 },
  navCta: { color: '#fff', fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', padding: '8px 14px', borderRadius: 9, boxShadow: '0 8px 24px -10px rgba(139,92,246,.7)' },
  hero: { position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '70px 24px 30px', display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'center' },
  heroInner: { transition: 'all .7s cubic-bezier(.2,.7,.2,1)' },
  badge: { display: 'inline-block', fontSize: 12.5, color: '#c4b5fd', ...glass, padding: '6px 12px', borderRadius: 999, marginBottom: 22, backdropFilter: 'blur(10px)' },
  h1: { fontSize: 56, lineHeight: 1.04, fontWeight: 800, letterSpacing: -1.8, margin: '0 0 18px' },
  grad: { background: 'linear-gradient(120deg,#818cf8,#c084fc,#818cf8)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  sub: { fontSize: 17.5, lineHeight: 1.6, color: '#9da3af', maxWidth: 490, margin: '0 0 28px' },
  ctaRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  ctaPrimary: { display: 'inline-block', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px 22px', borderRadius: 11, boxShadow: '0 14px 40px -12px rgba(139,92,246,.7)' },
  ctaGhost: { display: 'inline-block', color: '#e6edf3', fontWeight: 600, fontSize: 15, padding: '13px 22px', borderRadius: 11, ...glass, backdropFilter: 'blur(10px)' },
  trust: { marginTop: 18, fontSize: 12.5, color: '#6e7681' },
  mockWrap: { transition: 'all .9s cubic-bezier(.2,.7,.2,1) .1s' },
  mock: { ...glass, borderRadius: 16, boxShadow: '0 40px 90px -30px rgba(0,0,0,.85)', overflow: 'hidden' },
  mockBar: { display: 'flex', alignItems: 'center', gap: 7, padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,.06)' },
  dot: { width: 11, height: 11, borderRadius: 999, display: 'inline-block' },
  mockUrl: { marginLeft: 10, fontSize: 12, color: '#6e7681', fontFamily: 'ui-monospace, monospace' },
  liveTag: { marginLeft: 'auto', fontSize: 11, color: '#f87171', fontWeight: 600 },
  mockBody: { display: 'grid', gridTemplateColumns: '1fr 132px', minHeight: 210 },
  mockCode: { margin: 0, padding: 16, fontSize: 12.5, lineHeight: 1.7, fontFamily: 'ui-monospace, Menlo, monospace', color: '#c9d1d9', whiteSpace: 'pre-wrap' },
  mockSide: { borderLeft: '1px solid rgba(255,255,255,.06)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  mStep: { fontSize: 12, color: '#adbac7' },
  statsWrap: { position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '20px 24px' },
  stats: { ...glass, borderRadius: 16, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '22px 8px' },
  stat: { textAlign: 'center' },
  statN: { fontSize: 26, fontWeight: 800, background: 'linear-gradient(120deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statL: { fontSize: 12, color: '#8b949e', marginTop: 4 },
  section: { position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '64px 24px' },
  kicker: { textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a78bfa', marginBottom: 10 },
  h2: { textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: -0.8, margin: '0 0 40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  card: { ...glass, borderRadius: 16, padding: 22 },
  cardIcon: { fontSize: 26, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 700, margin: '0 0 6px' },
  cardDesc: { fontSize: 13.5, lineHeight: 1.6, color: '#8b949e', margin: 0 },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  step: { ...glass, borderRadius: 16, padding: 24 },
  stepN: { fontSize: 28, fontWeight: 800, background: 'linear-gradient(120deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 10 },
  ctaWrap: { position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '24px 24px 8px' },
  ctaBand: { ...glass, textAlign: 'center', borderRadius: 20, padding: '52px 24px' },
  footer: { position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '36px 24px 48px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: 13, color: '#6e7681' },
  flink: { color: '#a78bfa' },
};
