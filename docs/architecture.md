# Hoxxes Briefing Architecture

Hoxxes Briefing is a same-origin web app for the current Deep Rock Galactic
Deep Dive and Elite Deep Dive rotation.

## System

- `apps/web` is a static Solid SPA. It owns routes, rendering, PWA behavior, and
  the offline-readable briefing.
- `apps/api` is a Hono app. It owns the HTTP boundary and server-side generation
  orchestration.
- `packages/contracts` is the shared wire contract between web and API.
- `crates/drg_mission_gen_facade` adapts upstream generator data into local Rust
  models.
- `crates/drg_mission_gen_wasm` exposes the generator to TypeScript through the
  committed WASM package.
- `api/v1/briefing.ts` is the Vercel Function entrypoint for the deployed API;
  `api/v1/weekly.ts` is the retained legacy entrypoint.

## Request Flow

1. The browser loads the static SPA shell.
2. The SPA requests `GET /api/v1/briefing`.
3. The Hono app fetches upstream Deep Rock Galactic event metadata.
4. The API derives the seed and runs generation server-side.
5. The API maps the result to `packages/contracts` and validates it.
6. The SPA parses the same contract before rendering the board.

## Deployment Shape

The live target is the Vercel project `hoxxes-briefing`.

The first supported deployment shape is root-path, same-origin hosting:

- app shell: `/`
- manifest: `/manifest.webmanifest`
- service worker: `/sw.js`
- briefing API: `/api/v1/briefing` (legacy `/api/v1/weekly` retained)

Subpath hosting, SSR, browser-side generation, archive pages, and admin surfaces
are not part of the current architecture.

## Offline Model

The web app may show the last successful briefing when the network is not
available. The cached briefing is app-managed client state; the service worker is
only the shell and asset delivery layer.

When a cached briefing is visible, the app should still try to refresh from the
network and replace the cached briefing after a successful newer response.

## Source Documents

- Product and UX intent: [product.md](product.md)
- Design system (tokens, typography, components, motion): [../designs/DESIGN.md](../designs/DESIGN.md)
- Deep Rock Galactic domain language: [domain.md](domain.md)
- Web UI implementation rules: [../apps/web/docs/conventions.md](../apps/web/docs/conventions.md)
- Deployment runbook: [deployment.md](deployment.md)
