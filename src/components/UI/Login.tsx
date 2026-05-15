import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { C } from '../Office/officeTokens';

type View = 'login' | 'forgot' | 'reset';

const inputStyle: React.CSSProperties = {
  background: C.bgDeep,
  border: `1px solid ${C.wallLight}`,
  color: C.ink,
  padding: '8px 12px',
  fontSize: 12,
  fontFamily: 'inherit',
  outline: 'none',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  fontFamily: 'inherit',
  fontSize: 10,
  letterSpacing: 0.5,
  color: C.inkDim,
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
};

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
  const {
    signInWithPassword,
    resetPasswordForEmail,
    updatePassword,
    isPasswordRecovery,
  } = useAuth();

  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPasswordRecovery) setView('reset');
  }, [isPasswordRecovery]);

  const switchView = (next: View) => {
    setView(next);
    setError(null);
    setSuccess(null);
  };

  const onLogin = async (e: React.FormEvent) => {
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

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await resetPasswordForEmail(email);
      setSuccess('E-Mail gesendet. Prüfe dein Postfach und folge dem Link.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'E-Mail konnte nicht gesendet werden');
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccess('Passwort aktualisiert. Du kannst dich jetzt anmelden.');
      setNewPassword('');
      setConfirmPassword('');
      switchView('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passwort konnte nicht gesetzt werden');
    } finally {
      setLoading(false);
    }
  };

  const cardTitle =
    view === 'login' ? 'ANMELDEN' :
    view === 'forgot' ? 'PASSWORT VERGESSEN' :
    'NEUES PASSWORT';

  const submitLabel =
    view === 'login' ? (loading ? 'BITTE WARTEN …' : 'EINLOGGEN →') :
    view === 'forgot' ? (loading ? 'BITTE WARTEN …' : 'LINK SENDEN →') :
    (loading ? 'BITTE WARTEN …' : 'PASSWORT SPEICHERN →');

  const onSubmit =
    view === 'login' ? onLogin :
    view === 'forgot' ? onForgot :
    onReset;

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
            {cardTitle}
          </div>

          {(view === 'login' || view === 'forgot') && (
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ppw.de"
              style={inputStyle}
            />
          )}

          {view === 'login' && (
            <>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => switchView('forgot')}
                style={{ ...linkButtonStyle, alignSelf: 'flex-end', marginTop: -4 }}
              >
                Passwort vergessen?
              </button>
            </>
          )}

          {view === 'forgot' && (
            <p style={{ margin: 0, fontSize: 10, lineHeight: 1.5, color: C.inkDim, letterSpacing: 0.3 }}>
              Wir senden dir einen Link per E-Mail, mit dem du ein neues Passwort setzen kannst.
            </p>
          )}

          {view === 'reset' && (
            <>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Neues Passwort"
                style={inputStyle}
                autoComplete="new-password"
              />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort bestätigen"
                style={inputStyle}
                autoComplete="new-password"
              />
            </>
          )}

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
            {submitLabel}
          </button>

          {view !== 'login' && (
            <button
              type="button"
              onClick={() => switchView('login')}
              style={{ ...linkButtonStyle, alignSelf: 'center', marginTop: 2 }}
            >
              ← Zurück zur Anmeldung
            </button>
          )}

          {error && (
            <div style={{ fontSize: 11, color: C.statusDND, letterSpacing: 0.5 }}>{error}</div>
          )}
          {success && (
            <div style={{ fontSize: 11, color: C.statusActive, letterSpacing: 0.5 }}>{success}</div>
          )}
        </form>
      </div>
    </div>
  );
}
