# Contributing

Danke fürs Mitmachen! Kurz und schmerzlos:

## Setup
```bash
git clone https://github.com/xvwConcept/virtual-office.git
cd virtual-office
cp .env.example .env.local   # Supabase-Keys fragen, falls du keine hast
npm install
npm run dev
```

## Branches
- `main` ist geschützt. Direktes Pushen ist tabu.
- Eigener Branch: `feature/<kurzbeschreibung>`, z. B. `feature/office-grid`, `feature/avatar-system`.
- Bugfixes: `fix/<kurzbeschreibung>`.

## Commits
- Imperativ ("add desk slot", nicht "added desk slot").
- Klein und fokussiert: ein Commit, ein Thema.

## Pull Requests
1. Push: `git push -u origin feature/<name>`.
2. PR gegen `main` öffnen.
3. Beschreibung: was, warum, Screenshot/GIF wenn UI.
4. Mindestens 1 Review, dann Squash-Merge.

## Code-Stil
- TypeScript strict — keine `any`.
- Tailwind Utilities statt eigener CSS-Dateien.
- Status-Enum-Werte: `online` | `pause` | `dnd` | `offline`.
- Komponentenordner mit `index.ts` re-export, falls sinnvoll.
- Keine Secrets committen. `.env.local` ist gitignored.

## Datenbankänderungen
Neue Migration als `supabase/migrations/000N_<beschreibung>.sql`. Forward-only.
