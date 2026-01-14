import type { PageProps } from '@float/core';

// Dynamic metadata based on params
export function generateMetadata({ params }: PageProps) {
  return {
    title: `User ${params.id}`,
  };
}

// Simulated user data
const users: Record<string, { name: string; email: string; role: string; bio: string }> = {
  '1': { name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', bio: 'Platform administrator with 10 years of experience.' },
  '2': { name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', bio: 'Full-stack developer passionate about React and TypeScript.' },
  '3': { name: 'Carol Williams', email: 'carol@example.com', role: 'Designer', bio: 'UI/UX designer focused on creating beautiful, accessible interfaces.' },
  '4': { name: 'David Brown', email: 'david@example.com', role: 'Developer', bio: 'Backend specialist with expertise in Node.js and databases.' },
};

export default function UserPage({ params }: PageProps) {
  const user = users[params.id];

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <p>User not found</p>
        <a href="/users" style={{ marginTop: '1rem', display: 'inline-block' }}>
          ← Back to users
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <a href="/users" style={{ opacity: 0.6, display: 'block', marginBottom: '1rem' }}>
        ← Back to users
      </a>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1rem',
        }}>
          {user.name[0]}
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{user.name}</h1>
        
        <span style={{
          background: 'rgba(102, 126, 234, 0.2)',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.85rem',
        }}>
          {user.role}
        </span>

        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ opacity: 0.6, marginBottom: '0.5rem' }}>Email</p>
          <p>{user.email}</p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ opacity: 0.6, marginBottom: '0.5rem' }}>Bio</p>
          <p>{user.bio}</p>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.85rem',
          opacity: 0.6,
        }}>
          <p>User ID: {params.id}</p>
          <p style={{ marginTop: '0.25rem' }}>
            This is a dynamic route: <code>/users/[id]</code>
          </p>
        </div>
      </div>
    </div>
  );
}
