# Architecture

Browser-rendered React SPA shipped as static files. No server. The "build" is a `<script type="text/babel">` chain in `design/index.html` that Babel Standalone transpiles at page load.

## Entry point

1. **`index.html`** at the repo root — a single `<meta http-equiv="refresh" content="0;url=design/index.html">`. Exists only because GitHub Pages needs `/index.html`.
2. **`design/index.html`** is the real entry. It loads, in order:
   - **CDN scripts (UMD with SRI):** React 18.3.1 dev, ReactDOM 18.3.1 dev, Babel Standalone 7.29.0.
   - **AG Grid 31.3.2 vanilla** (`ag-grid-community.min.noStyle.js`) + its CSS.
   - **11 local files** as `type="text/babel"`:
     `ui.jsx → layout.jsx → data.js → data-adapter.js → dashboard.jsx → calls.jsx → tasks.jsx → pages.jsx → ai-panel.jsx → tweaks.jsx → app.jsx`
3. **`app.jsx`** calls `ReactDOM.createRoot(document.getElementById('root')).render(<App/>)`.

**Script order is part of the contract.** Each file ends with `Object.assign(window, { … })` to publish its symbols. Earlier files cannot see later globals; later files depend on earlier ones. Reordering breaks the page.

## Layers

### 1. Data
- **`data.js`** — IIFE creates `window.COLVER_DATA`. Contents: `EMPLOYEES`, `QUEUE_URGENT`, `QUEUE_MANAGEMENT`, `QUEUE_PRACTICES`, `PROCESSED`, `CALLS` (140 generated), `DETAILED_CALL` (the rich `C-1841`), `LOSS_REASONS`, `TOP_OBJECTIONS`, `KPI_TREND`, `HOURLY_CONV`. Generation uses a seeded RNG `sr()` for determinism (one stray `Math.random()` — see OPEN_QUESTIONS).
- **`data-adapter.js`** — IIFE reads `COLVER_DATA`, builds `window.MOCK_DATA` with: `kpis`, `queue`, `queueManagement`, `queuePractices`, `managers`, `lossReasons`, `objections`, `callsToday`, `calls`, `callDetails`, `processed`, `ratings`. **All component code reads from `MOCK_DATA`; never from `COLVER_DATA` directly.**

### 2. UI primitives — `ui.jsx`
- Destructures hooks once at the top: `const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;` — they are treated as globals throughout the project.
- `cn(...c)` — class composer (filters falsy).
- `Icon` — object map of inline SVG components (lucide-style). Each takes `{size}`.
- Atoms: `Button`, `Badge`, `PriorityBadge` (1/2/3 chip), `Card` / `CardHeader` / `CardTitle` / `CardContent`, `Avatar`, `Progress`, `ScoreCell`, `PercentCell`, `Delta`, `Sparkline`, `Tooltip`, `Switch`, `Select`, `PeriodSelector`, `Pagination`, `EmptyState`, `Modal`, `Tabs`.

### 3. Layout — `layout.jsx`
- `Sidebar` — 50px wide, icon-only, hover-tooltips. `Topbar` — page title or breadcrumbs + AI toggle button. `NotificationsDrawer` — slides in next to the sidebar.
- `navItems` array drives the sidebar entries (`dashboard`, `calls`, `tasks`, `processed`).
- `initNotifications()` seeds 6 mock notifications used by `<App>`.

### 4. Pages
- **`dashboard.jsx`** (793 lines) — `Dashboard`, the queue (3-tab hero: «Требуют внимания» / «Управленческие решения» / «Лучшие практики»), `AttentionQueue`, `ManagementQueue`, `PracticesQueue`, KPI grid, `RatingTable` + `RatingCard` (medals 🥇🥈🥉), `ManagerModal`, `ManagersTable` (sticky-first-column sortable), `RedCell`, `QueuePager`.
- **`calls.jsx`** — `AgGridReactLite` (manual React wrapper around vanilla AG Grid; `useEffect` syncs `rowData` and `columnDefs` after mount); `CallsPage` — tabs «Целевые» / «Нецелевые» + manager filter + AG Grid.
- **`pages.jsx`** — `CallDetail` (full-page version, **unreachable** in current routing), `CallModal` (overlay — primary call drill-down), `ProcessedPage`, `AnalyticsPage` (defined and exported but **not routed** — see [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md)), `formatTime`, `KV` (label/value row).
- **`tasks.jsx`** — `KANBAN_COLS` (6 statuses: planned / queued / in_progress / paused / partial / done), `TASK_PRIO`, `initTasks()`, `TaskCreateModal`, `TaskDetailModal`, `TaskCard` (HTML5 `draggable` + a 4-px mouse-distance heuristic to distinguish click from drag), `KanbanColumn` (drop target), `TasksPage` (search + filters + board).
- **`ai-panel.jsx`** — right-side `AiPanel`. Hardcoded keyword-triggered fake responses; quick prompts disappear after the first reply. Local `messages` state with optional external `setMessages` so the parent (`<App>`) can persist the conversation across opens.
- **`tweaks.jsx`** — design-mode panel: queue full/empty toggle, AI open default, table density, body bg tone, default period. Toggled via `postMessage` from a parent window.

### 5. Root — `app.jsx`
Top-level state owned by `<App>`:
- `route` (in-memory routing object), `period`, `aiOpen`, `aiMessages`, `data`, `tasks`, `createTaskPrefill`, `notifications`, `tweaks`, `toast`, `callModalId`, `ratingsTab`.

In-memory routing:
- `route = { page: 'dashboard' | 'calls' | 'tasks' | 'processed' | 'manager' | 'settings' | 'analytics', … }`
- `if/else if` chain on `route.page` chooses the page component.

Manual modal layering via inline z-index. See [CONVENTIONS.md](CONVENTIONS.md) for the canonical ladder.

`callModalHidden`: when a `TaskCreateModal` opens over a `CallModal`, App hides (visibility:hidden) the call modal instead of unmounting it — the underlying state and audio position are preserved when the task modal closes.

## Routing inventory

| `route.page`  | Component       | Status                     |
|---------------|-----------------|----------------------------|
| `dashboard`   | `Dashboard`     | Default route, fully built |
| `calls`       | `CallsPage`     | Live                       |
| `tasks`       | `TasksPage`     | Live                       |
| `processed`   | `ProcessedPage` | Live                       |
| `manager`     | EmptyState      | Stub                       |
| `settings`    | EmptyState      | Stub                       |
| `analytics`   | EmptyState      | Stub (`AnalyticsPage` exists but is not wired) |

`Sidebar` only links to the four live routes plus the bell (which toggles the Notifications drawer, not a route).

## Edit-mode hooks (host integration)

The prototype expects to be embedded in an external "edit mode" host (probably an iframe in a design tool). On mount, `app.jsx`:

- Posts `{type:'__edit_mode_available'}` to `window.parent` (`app.jsx:68`).
- Listens for `__activate_edit_mode` / `__deactivate_edit_mode` to show/hide the **Tweaks** panel (`app.jsx:62-67`).
- On every tweak change, posts `{type:'__edit_mode_set_keys', edits: …}` (`app.jsx:50`).

The literal `/*EDITMODE-BEGIN*/{ … }/*EDITMODE-END*/` block at `app.jsx:39-45` is parsed/replaced by the host as a serialization boundary for default tweak values.

When opened standalone, those messages go nowhere — the app still works; the Tweaks panel just stays hidden until an `__activate_edit_mode` message arrives.

## Styling

- All CSS in `design/styles.css`. No preprocessor.
- Design tokens are CSS custom properties on `:root`: e.g., `--primary: #1D4ED8`, `--success-strong`, `--radius-lg`, `--row-h`, `--header-h`, `--sidebar-w` (50px), `--aipanel-w` (380px).
- Class names follow shadcn flavour (`bg-primary`, `text-primary-foreground`, `bg-secondary-soft`) but are bespoke CSS rules — there is no Tailwind compiler. They only do what `styles.css` defines.
- Score thresholds (always normalized to a 10-pt scale internally): `≥8 is-good`, `≥6 is-warn`, `≥4 is-default`, `<4 is-bad`. `ScoreCell` and `cd-criterion-bar` follow this scheme.
- Tweaks panel mutates `document.body.style.background` and CSS custom properties (`--row-h`, `--row-padding-y`) directly via `app.jsx:56-58` whenever tweaks change.

## External dependencies recap

| Dep                         | Source            | Where pinned                          |
|-----------------------------|-------------------|---------------------------------------|
| React 18.3.1 (UMD dev)      | unpkg + SRI hash  | `design/index.html:22`                |
| ReactDOM 18.3.1 (UMD dev)   | unpkg + SRI hash  | `design/index.html:23`                |
| Babel Standalone 7.29.0     | unpkg + SRI hash  | `design/index.html:24`                |
| AG Grid Community 31.3.2    | jsDelivr (no SRI) | `design/index.html:13-14, 27`         |
| Inter (font)                | Google Fonts      | `design/index.html:8-10`              |

The React/Babel scripts carry SRI hashes — bumping versions requires recomputing them.
