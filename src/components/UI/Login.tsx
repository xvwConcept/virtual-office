import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function Login() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithMagicLink(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-8">
      <form
        onSubmit={onSubmit}
        className="flex w-80 flex-col gap-3 rounded-lg border border-white/10 bg-[var(--color-card)] p-6"
      >
        <h2 className="text-lg font-semibold">Virtual Office Login</h2>
        {sent ? (
          <p className="text-sm text-[var(--color-status-online)]">
            Magic Link an {email} gesendet. Prüfe dein Postfach.
          </p>
        ) : (
          <>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@firma.de"
              className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded bg-[var(--color-accent)] px-3 py-2 text-sm font-medium"
            >
              Magic Link senden
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </>
        )}
      </form>
    </div>
  );
}
