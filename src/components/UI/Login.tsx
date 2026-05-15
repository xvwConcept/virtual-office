import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { C } from '../Office/officeTokens';

// Minimal pixel-art dot grid for the background
function DotGrid() {
  const dots = [];
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 20; c++) {
      dots.push(
        <rect key={`${r}-${c}`} x={c * 48 + 24} y={r * 48 + 24} width={2} height={2} fill={C.wallLight} opacity={0.35} />
      );
    }
  }
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      preserveAspectRatio="xMidYMid slice"
    >
      {dots}
    </svg>
  );
}

// Status indicator row — decorative only
function StatusRow() {
  const items = [
    { label: 'AM PLATZ',     color: C.statusActive },
    { label: 'PAUSE',        color: C.statusBreak  },
    { label: 'NICHT STÖREN', color: C.statusDND    },
    { label: 'ABWESEND',     color: C.statusAway   },
  ];
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
      {items.map(({ label, color }) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 9, letterSpacing: 1, color: C.inkDim,
        }}>
          <span style={{ width: 6, height: 6, background: color, boxShadow: `0 0 6px ${color}`, display: 'block' }} />
          {label}
        </div>
      ))}
    </div>
  );
}

export function Login() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', background: C.bgDeep,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      position: 'relative', overflow: 'hidden',
    }}>
      <DotGrid />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Wordmark */}
        <div style={{ marginBottom: 6, fontSize: 9, letterSpacing: 4, color: C.inkSoft }}>
          PPW TEAM
        </div>
        <div style={{ marginBottom: 4, fontSize: 22, letterSpacing: 6, color: C.ink, fontWeight: 'normal' }}>
          VIRTUAL OFFICE
        </div>
        <div style={{ marginBottom: 40, fontSize: 10, letterSpacing: 2, color: C.inkDim }}>
          Dein Team. Ein Blick.
        </div>

        <StatusRow />

        {/* Login card */}
        <form onSubmit={onSubmit} style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          width: 300,
          background: C.bgFrame,
          border: `1px solid ${C.wallLight}`,
          boxShadow: `0 6px 0 ${C.bgDeep}`,
          padding: '20px 24px 24px',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: C.inkDim, marginBottom: 4 }}>
            ANMELDEN
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@ppw.de"
            style={{
              background: C.bgDeep, border: `1px solid ${C.wallLight}`,
              color: C.ink, padding: '8px 12px', fontSize: 12,
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
              color: C.ink, padding: '8px 12px', fontSize: 12,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              background: loading ? C.wallMid : C.statusActive,
              border: 'none', color: C.bgDeep,
              padding: '9px 12px', fontSize: 11, fontFamily: 'inherit',
              letterSpacing: 2, cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'BITTE WARTEN …' : 'EINLOGGEN →'}
          </button>
          {error && (
            <div style={{ fontSize: 11, color: C.statusDND, letterSpacing: 0.5 }}>{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
