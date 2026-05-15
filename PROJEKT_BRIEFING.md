# Virtual Office — Projekt-Briefing

## Was wir bauen

Ein virtuelles Büro in Pixel-Art-Optik (Top-Down-Ansicht), in dem Teammitglieder ihren Anwesenheitsstatus in Echtzeit setzen und sehen können. Ersetzt die tägliche "Bin da"-Nachricht im Chat.

### Kernfeatures V1

- Ein Büroraum als Pixel-Art-Grid (ca. 20x15 Felder, je 32x32px)
- 7 feste Schreibtische mit Avatar und Name
- 4 Status-Optionen pro Person: Am Platz, Pause, Nicht stören, Abwesend
- Echtzeit-Synchronisation: Status-Änderungen erscheinen sofort bei allen
- Einfacher Login (Supabase Magic Link oder fester Username)
- Desktop-optimiert, läuft im Browser

## Tech Stack

| Komponente | Technologie |
|-----------|-------------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS (@tailwindcss/vite) |
| State Management | Zustand |
| Backend / Auth / Realtime | Supabase |
| Pixel Art | HTML Canvas oder CSS-basiert |

## Repository

```
git clone https://github.com/xvwConcept/virtual-office.git
cd virtual-office
npm install
npm run dev
```

## Supabase

- **Project URL:** `https://qobmsadoufrtlkuvxtsn.supabase.co`
- **Anon Key:** `sb_publishable_cNrLKj5jo8lGACfmgG05Qg_dFlUZjP0`
- **Direct DB Connection:** `postgresql://postgres:[YOUR-PASSWORD]@db.qobmsadoufrtlkuvxtsn.supabase.co:5432/postgres`

Zugangsdaten gehören in `.env.local`, nicht in den Code:

```
VITE_SUPABASE_URL=https://qobmsadoufrtlkuvxtsn.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_cNrLKj5jo8lGACfmgG05Qg_dFlUZjP0
```

## Datenbank-Schema

### Tabelle `users`
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| id | uuid (PK) | Supabase Auth ID |
| name | text | Anzeigename |
| avatar_id | int | Referenz auf Avatar-Sprite (1–7) |
| desk_position | int | Schreibtisch-Nummer (1–7) |
| created_at | timestamptz | Erstellungszeitpunkt |

### Tabelle `statuses`
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| id | uuid (PK) | Auto-generiert |
| user_id | uuid (FK → users.id) | Welcher User |
| status | text | `online`, `pause`, `dnd`, `offline` |
| custom_message | text (nullable) | Optionaler Freitext ("Bin um 14 Uhr zurück") |
| updated_at | timestamptz | Letzte Änderung |

Realtime aktivieren für `statuses`-Tabelle (Supabase Dashboard → Database → Replication → `statuses` einschalten).

## Projektstruktur

```
virtual-office/
├── public/
│   └── assets/           ← Pixel-Art-Sprites, Icons
├── src/
│   ├── components/
│   │   ├── Office/       ← OfficeView, OfficeGrid (Hauptansicht)
│   │   ├── Avatar/       ← AvatarSprite, AvatarStatus
│   │   ├── Desk/         ← DeskSlot (Schreibtisch + Avatar + Status)
│   │   ├── StatusBar/    ← StatusToggle, StatusDropdown
│   │   └── UI/           ← Shared: Button, Badge, Tooltip
│   ├── hooks/
│   │   ├── useUsers.ts        ← Alle User laden
│   │   ├── useRealtimeStatus.ts ← Realtime-Subscription auf statuses
│   │   └── useUpdateStatus.ts  ← Eigenen Status setzen
│   ├── lib/
│   │   └── supabase.ts   ← Supabase-Client-Instanz
│   ├── stores/
│   │   └── officeStore.ts ← Zustand Store (lokaler UI-State)
│   ├── types/
│   │   └── index.ts       ← TypeScript-Typen (User, Status, Desk)
│   ├── App.tsx
│   └── main.tsx
├── .env.local             ← Supabase-Zugangsdaten (nicht committen!)
├── .gitignore
├── package.json
└── CLAUDE.md
```

## Konventionen

- Komponenten: PascalCase, ein Ordner pro Komponente mit index.tsx
- Hooks: `useXxx`-Naming, je ein Hook pro Datei
- Styles: Tailwind Utilities, keine separaten CSS-Dateien
- Status-Enum: `online` | `pause` | `dnd` | `offline`
- Pixel-Art: 32x32px Basis-Grid, max. 16-Farben-Palette
- Farbpalette: Dunkel (#1a1a2e Hintergrund, #16213e Cards, #e94560 Akzent, #64ffda Online, #ffd166 Pause, #ef476f DND, #666 Offline)

## Realtime-Flow

1. User öffnet App → `useUsers` lädt alle User + aktuellen Status
2. `useRealtimeStatus` subscribt auf `statuses`-Tabelle (Supabase Realtime)
3. User klickt auf eigenen Avatar → StatusDropdown öffnet sich
4. User wählt neuen Status → `useUpdateStatus` schreibt in Supabase
5. Supabase broadcasted Änderung → alle Clients updaten sofort

## Git-Workflow

```bash
# Feature-Branch erstellen
git checkout -b feature/[feature-name]

# Arbeiten...

# Committen und pushen
git add .
git commit -m "Beschreibung"
git push origin feature/[feature-name]

# Merge zu main via Pull Request auf GitHub
```

Branch-Naming: `feature/office-grid`, `feature/avatar-system`, `feature/realtime-sync`, `feature/status-toggle`
