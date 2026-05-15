# Virtual Office

Ein virtuelles Büro in Pixel-Art-Optik mit Echtzeit-Anwesenheitsstatus. Ersetzt die "Bin da"-Nachricht im Chat.

## Stack
React 19 · Vite · TypeScript · Tailwind v4 · Zustand · Supabase (Auth + Realtime + Postgres).

## Quick Start

```bash
git clone https://github.com/xvwConcept/virtual-office.git
cd virtual-office
cp .env.example .env.local
npm install
npm run dev
```

Öffnet `http://localhost:5173`.

## Supabase Setup

1. Projekt URL und Anon Key in `.env.local` eintragen (siehe `.env.example`).
2. Im Supabase Dashboard → SQL Editor `supabase/migrations/0001_init.sql` ausführen.
3. Realtime ist im SQL-Skript für `statuses` und `users` aktiviert. Im Dashboard unter Database → Replication ggf. prüfen.

## Mitarbeit

Siehe [CONTRIBUTING.md](CONTRIBUTING.md). Branches als `feature/<name>`, PRs gegen `main`.

## Struktur
- `src/lib/supabase.ts` — Supabase-Client
- `src/stores/officeStore.ts` — Zustand Store
- `src/hooks/` — Daten- und Auth-Hooks
- `src/components/` — UI
- `supabase/migrations/` — DB-Schema
