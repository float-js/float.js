export const metadata = {
  title: 'Users',
};

// Simulated user data
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Developer' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Designer' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Developer' },
];

export default function UsersPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Users</h1>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
        Click on a user to see their profile (dynamic route demo)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {users.map(user => (
          <a 
            key={user.id} 
            href={`/users/${user.id}`}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>{user.name}</h3>
              <p style={{ margin: '0.25rem 0 0', opacity: 0.6, fontSize: '0.9rem' }}>
                {user.email}
              </p>
            </div>
            <span style={{
              background: 'rgba(102, 126, 234, 0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
            }}>
              {user.role}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
