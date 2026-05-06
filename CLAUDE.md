# Colver РОП prototype — Claude memory

## What this is
Static HTML/JS design prototype: dashboard for «РОП» (head of sales) tracking call quality. Russian UI. **Prototype only** — no backend, no auth, no real data, no build step. Hosted on GitHub Pages from this repo.

Origin upstream: `zamkofde-svg/colver-rop-prototype`. This is a fork at `Meatxboy/colver-rop-prototype`; remotes `origin` (fork) and `upstream` (original) are configured.

## Stack
- **Runtime:** React 18.3.1 + ReactDOM 18.3.1 (UMD **development** builds, loaded from unpkg with SRI hashes).
- **JSX:** Babel Standalone 7.29.0 — transpiles `.jsx` files in the browser at load time (`<script type="text/babel">`).
- **Grid:** AG Grid Community 31.3.2 (vanilla, wrapped manually in a React adapter).
- **CSS:** Hand-written `design/styles.css` (~840 lines), no preprocessor. Design tokens are CSS custom properties on `:root`.
- **Font:** Inter (Google Fonts).
- **None of:** package.json, node_modules, TypeScript, ESLint/Prettier, bundler, tests, CI, lockfile.

Editing a file and reloading the browser is the entire dev cycle. There is no build feedback — type errors only show at runtime.

## Folder structure
```
/
├── index.html            — 2-line meta-refresh redirect to design/index.html
├── CLAUDE.md             — this file
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   └── OPEN_QUESTIONS.md
└── design/               — the actual app
    ├── index.html        — entry: CDN scripts + 11 local files via type=text/babel
    ├── styles.css        — all styling
    ├── ui.jsx            — primitives (Icon map, Button, Card, Tabs, ScoreCell, …)
    ├── layout.jsx        — Sidebar, Topbar, NotificationsDrawer
    ├── data.js           — window.COLVER_DATA (raw mocks)
    ├── data-adapter.js   — window.MOCK_DATA (transformed, what components consume)
    ├── dashboard.jsx     — main page (793 lines)
    ├── calls.jsx         — Calls page on AG Grid
    ├── pages.jsx         — CallDetail, CallModal, ProcessedPage, AnalyticsPage
    ├── tasks.jsx         — Kanban TasksPage + Task modals
    ├── ai-panel.jsx      — right-side AI assistant panel
    ├── tweaks.jsx        — design-mode panel (toggled by parent postMessage)
    └── app.jsx           — root <App>; ReactDOM.createRoot here
```

## Commands
There are no npm scripts — there is no `package.json`.

| Action | How |
|---|---|
| Run locally | Open `design/index.html` in any modern browser. Or serve repo root with a static server (e.g. `python -m http.server 8000`, then visit `http://localhost:8000/`). |
| Deploy | `git push origin main` — GitHub Pages serves `/index.html`, which redirects to `design/index.html`. |
| Test | N/A — manual reload in browser. |
| Lint / typecheck | N/A. |
| Build | N/A. |

## Always
- **Test by reloading `design/index.html` in a browser.** No CLI feedback exists; mistakes surface as console errors at runtime.
- **Respect script order in `design/index.html`.** Files mutate `window` and depend on previously loaded globals: `ui → layout → data → data-adapter → dashboard → calls → tasks → pages → ai-panel → tweaks → app`.
- **Update both `data.js` and `data-adapter.js`** when changing the data shape — the adapter is the boundary. Components read from `window.MOCK_DATA`, never directly from `COLVER_DATA`.
- **Use existing classes from `styles.css`.** Names like `bg-primary`, `text-primary-foreground`, `bg-success-soft` look like Tailwind but are bespoke CSS — they only do what `styles.css` defines.
- **Use the `Icon` map** in `ui.jsx`. New icons go there, not inline. Use the lucide-style template (`viewBox="0 0 24 24"`, `stroke="currentColor"`, `strokeWidth="2"`).
- **Use `cn(...)`** from `ui.jsx` to compose conditional classes.
- **Expose new components on `window`** via the `Object.assign(window, { … })` block at the bottom of each file — otherwise later files can't see them.
- **Keep all React/Babel/AG Grid versions pinned** in `design/index.html`. The React/Babel `<script>` tags carry SRI hashes; changing the URL without updating the hash breaks loading.
- **Russian UI strings.** Mixed Russian/English in source comments is fine — match the surrounding file.

## Never
- **Don't introduce a build step, bundler, npm scripts, or `package.json`** without an explicit ask. The whole project's value is "open in browser, edit, reload."
- **Don't add ES modules, `import`/`export`, or npm imports.** All inter-file communication is via `window.*`.
- **Don't add TypeScript.** Leave existing `.jsx` extensions — Babel relies on them.
- **Don't refactor the data flow** (`data.js → data-adapter.js → components`) without updating both ends.
- **Don't delete `tweaks.jsx` or the `__edit_mode_*` postMessage handlers in `app.jsx:39-70`.** They're a contract with an external host that can embed this prototype (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) → "Edit-mode hooks").
- **Don't run `npm install`, `npm run …`, tests, or migrations** — there's nothing to install or run. Reload the browser instead.
- **Don't add real network calls (`fetch`, `XMLHttpRequest`).** The prototype is fully client-side and offline-only.
- **Don't bump React/Babel/AG Grid CDN URLs without recomputing the SRI hash** in `design/index.html`.

## Quick facts (don't forget)
- Mock "today" is split: `21.04.2026` is the data baseline (`data.js:77`); `2026-05-01` is the hardcoded "today" used by Tasks (`tasks.jsx:243`, `:429`). They will rot — see [OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md).
- 140 calls are generated deterministically with a seeded RNG in `data.js`. The single rich call is `C-1841` — every other call's drill-down reuses its transcript/criteria as a template via `data-adapter.js`.
- Routing is in-memory only (`route = { page }`). Pages: `dashboard | calls | tasks | processed`. Stubs that fall through to EmptyState: `manager | settings | analytics`. `AnalyticsPage` exists but isn't wired up — see OPEN_QUESTIONS.
- `CallModal` (overlay, z:300) is the primary call drill-down. The full-page `CallDetail` is exported but unreachable in normal flow.
- Z-index ladder is in [docs/CONVENTIONS.md](docs/CONVENTIONS.md). Don't invent intermediate values.

## Where to look
- Project map, layers, entry points, edit-mode protocol → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Code style, naming, recurring patterns, what NOT to add → [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- Suspicious code, ambiguities, things to verify before touching → [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md)
