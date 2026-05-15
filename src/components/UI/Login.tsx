import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { C } from '../Office/officeTokens';

export function Login() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', background: C.bgDeep,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }}>
      <form onSubmit={onSubmit} style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        width: 320, padding: 24,
        background: C.bgFrame,
        border: `1px solid ${C.wallLight}`,
        boxShadow: `0 4px 0 ${C.bgDeep}`,
      }}>
        <div style={{ fontSize: 14, letterSpacing: 2, color: C.ink, marginBottom: 4 }}>
          VIRTUAL OFFICE · LOGIN
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@ppw.de"
          style={{
            background: C.bgDeep, border: `1px solid ${C.wallLight}`,
            color: C.ink, padding: '8px 12px', fontSize: 13,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          style={{
            background: C.bgDeep, border: `1px solid ${C.wallLight}`,
            color: C.ink, padding: '8px 12px', fontSize: 13,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: C.statusActive, border: 'none', color: C.bgDeep,
            padding: '9px 12px', fontSize: 13, fontFamily: 'inherit',
            letterSpacing: 1, cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'EINLOGGEN …' : 'EINLOGGEN'}
        </button>
        {error && (
          <div style={{ fontSize: 12, color: C.statusDND }}>{error}</div>
        )}
      </form>
    </div>
  );
}
