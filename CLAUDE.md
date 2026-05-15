# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Virtual Office

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

## Dev
```bash
cp .env.example .env.local   # einmalig
npm install
npm run dev        # Vite dev server
npm run build      # tsc + vite build
npm run lint       # eslint
npm run preview    # preview prod build
```

---

## Pipeline: Git → Vercel → Supabase

This project uses a three-layer pipeline that is fully automated once set up:

- **Git (GitHub)** is the single source of truth. `main` is protected — no direct pushes. All changes go through feature branches and pull requests.
- **Vercel** is connected to the GitHub repo via the Vercel GitHub integration. Every merge to `main` triggers an automatic production deploy within ~1 minute — no manual deploy step needed. Every open PR automatically gets its own Vercel **preview URL** for review before merging.
- **Supabase** provides auth, database, and realtime. Schema changes are versioned in `supabase/migrations/`. The MCP integration (`mcp__supabase__*` tools) lets Claude interact with the database directly without leaving the terminal.

---

## Colleague Onboarding

Everything a new teammate needs to get running.

### Prerequisites
- **Node.js ≥ 20** and **Git**
- **Claude Code CLI** (recommended): `npm install -g @anthropic-ai/claude-code`
- No Vercel CLI needed — CI/CD is fully automatic via GitHub

### First-time setup
```bash
git clone https://github.com/xvwConcept/virtual-office.git
cd virtual-office
cp .env.example .env.local   # then fill in Supabase keys (ask team lead)
npm install
npm run dev
```

### Supabase DB setup (once per environment)
1. Open the Supabase Dashboard → SQL Editor
2. Paste and run `supabase/migrations/0001_init.sql`
3. Realtime is enabled by the migration script — no manual step needed

### Key concepts to understand before contributing
| Concept | What it means |
|---|---|
| `main` is live | Merging a PR to `main` = production deploy. Always review before merging. |
| PR preview URLs | Every open PR gets a Vercel preview URL. Use it to review before approving. |
| `.env.local` is secret | This file is gitignored. Never commit it. Get values from team lead. |
| Realtime via Supabase | Status updates are pushed to all clients instantly — no polling. |
| Magic Link login | Auth uses Supabase email magic links, not passwords. |

---

## Git Push/Pull Flow

Standard daily workflow. Claude writes all commit messages.

```bash
# Start a new feature
git checkout main && git pull origin main
git checkout -b feature/<name>

# Work, then commit often
git add <files>
git commit -m "<Claude-authored message, see rules below>"

# Push and open a PR — Vercel creates a preview URL automatically
git push origin feature/<name>
# Open PR on GitHub

# After the PR is merged to main
git checkout main && git pull origin main
git branch -d feature/<name>
```

### Commit message rules (Claude writes these)
- **Imperative mood:** "Add avatar sprite" not "Added…"
- **≤ 60 words** — usually a single subject line
- **Format:** `<type>: <what changed>` — types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`
- No period at end of subject line
- Co-authorship line added automatically by Claude: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Claude Code — Efficiency Guide

### Model delegation — pick the right model per task
| Model | Use for |
|---|---|
| `Haiku` | Bulk mechanical work: renaming, formatting, boilerplate — no judgment needed |
| `Sonnet` | Scoped research, code exploration, synthesis — default for most tasks |
| `Opus` | Real planning, architecture decisions, complex tradeoffs — use sparingly |

Switch model with `/model <name>` in Claude Code.

### Context management commands
| Command | When to use |
|---|---|
| `/clear` | Between unrelated tasks — resets conversation, saves tokens |
| `/compact` | Long sessions — compresses history without losing critical facts |
| `/usage` | After complex iterations — check token spend |
| `/context` | See all files and instructions Claude currently has loaded |

### Best practices
- Reference files by path rather than pasting content: `"look at src/hooks/useAuth.ts"`
- Use **plan mode** (`Shift+Tab`) before large or risky changes — Claude describes every step before executing
- Break large features into sessions; commit at the end of each session as a checkpoint
- Run `/clear` between unrelated tasks to prevent context bleed

---

## Recommended Skills

Skills are invoked via `/skill-name` inside Claude Code — no separate installation needed.

### Vercel & deployment
- `/vercel:status` — check recent deployments and build health
- `/vercel:deploy` — trigger or inspect a deployment
- `/vercel:env` — manage Supabase env vars on Vercel

### Git & code quality
- `/gsd-pr-branch` — streamline feature branch and PR creation
- `/gsd-code-review` — automated code review before merge
- `/gsd-health` — overall codebase health check

### UI & design
- `/figma:figma-use` — **required prerequisite** before any Figma write operations
- `/figma:figma-generate-design` — push app views to Figma for design review
- `/gsd-ui-review` — review Tailwind UI against design spec

### Project management
- `/gsd-plan-phase` — plan a feature before coding
- `/gsd-manager` — central hub for phases and milestones
