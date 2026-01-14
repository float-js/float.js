export const metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>About Float.js</h1>
      
      <p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: '2rem' }}>
        Float.js is an ultra-modern web framework built from the ground up for the modern web.
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎯 Philosophy</h2>
        <ul style={{ lineHeight: '2', paddingLeft: '1.5rem' }}>
          <li>Developer Experience First</li>
          <li>Performance by Default</li>
          <li>Zero Configuration</li>
          <li>Edge-Ready Architecture</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🛠 Tech Stack</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['React 18', 'TypeScript', 'esbuild', 'Node.js 18+'].map(tech => (
            <span key={tech} style={{
              background: 'rgba(102, 126, 234, 0.2)',
              border: '1px solid rgba(102, 126, 234, 0.4)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
            }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📦 Features</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        }}>
          {[
            'File-based Routing',
            'SSR & SSG',
            'API Routes',
            'Hot Module Reload',
            'TypeScript Native',
            'Nested Layouts',
            'Metadata API',
            'Edge Runtime',
          ].map(feature => (
            <div key={feature} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{ color: '#667eea' }}>✓</span>
              {feature}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
