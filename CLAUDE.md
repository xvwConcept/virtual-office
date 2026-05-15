# CLAUDE.md — Virtual Office

## Projekt
Pixel-Art-Top-Down-Büro mit Echtzeit-Status. Stack: React 19 + Vite + TS + Tailwind v4 + Zustand + Supabase.

Briefing: siehe [PROJEKT_BRIEFING.md](PROJEKT_BRIEFING.md).

## Konventionen
- Komponenten: PascalCase, ein Ordner pro Komponentengruppe unter `src/components/`.
- Hooks: `useXxx`, eine Datei pro Hook unter `src/hooks/`.
- Styling: Tailwind Utilities. Farbtokens als CSS-Variablen in `src/index.css` (`@theme`).
- Status-Enum: `online` | `pause` | `dnd` | `offline` (siehe `src/types/index.ts`).
- Keine Secrets im Code. Supabase-Keys nur in `.env.local`.

## Architektur
- `src/lib/supabase.ts` — einzige Supabase-Client-Instanz.
- `src/stores/officeStore.ts` — lokaler UI-State via Zustand.
- `src/hooks/` — Datenzugriff & Auth:
  - `useUsers` lädt initial alle User + Statuses.
  - `useRealtimeStatus` abonniert `statuses`-Tabelle.
  - `useUpdateStatus` upsertet eigenen Status.
  - `useAuth` Magic-Link-Login.
- `src/components/Office/OfficeView.tsx` ist die Haupt-Ansicht.

## Datenbank
SQL-Migration in `supabase/migrations/0001_init.sql`. Im Supabase Dashboard → SQL Editor ausführen. Realtime ist im Skript aktiviert.

## Git-Workflow
- `main` ist geschützt — Änderungen nur via PR.
- Feature-Branches: `feature/<name>` (`feature/office-grid`, `feature/realtime-sync`, …).
- Kleine, fokussierte Commits. Imperative Commit-Messages.

## Dev
```bash
cp .env.example .env.local   # einmalig
npm install
npm run dev
```
