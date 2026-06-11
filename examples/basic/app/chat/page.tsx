import { useEffect, useState } from 'react';
import { useFloatChat } from '@float.js/core/client';

export const metadata = { title: 'Float.js AI Chat' };

export default function ChatPage() {
  const { messages, input, setInput, handleSubmit, isLoading } = useFloatChat({ api: '/api/chat' });

  // Set after hydration via an effect so the server and first client render
  // match (avoids hydration mismatches).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>⚡ Float.js AI Chat {hydrated ? '(hydrated ✅)' : ''}</h1>
      <div>
        {messages.map((m) => (
          <p key={m.id}><strong>{m.role}:</strong> {m.content}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          style={{ width: '80%' }}
        />
        <button disabled={isLoading} type="submit">Send</button>
      </form>
    </main>
  );
}
