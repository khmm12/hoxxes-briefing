# Hoxxes Briefing Web

This package owns the public Solid SPA, weekly board UI, PWA shell, and browser
data fetching.

## Commands

Run these commands from `apps/web`.

Run the web app:

```bash
pnpm dev
```

Run web tests and build:

```bash
pnpm test
pnpm build
```

The dev server binds to `http://127.0.0.1:5173` and proxies `/api/*` to the
local API.

## Ownership

- Weekly page code lives in `src/pages/weekly`.
- App-level PWA behavior lives in `src/app/pwa`.
- Shared UI primitives live in `src/shared/ui`.
- Generated Panda output lives in `styled-system` and must not be hand-edited.

For UI system rules, see [docs/ui-system.md](docs/ui-system.md).
