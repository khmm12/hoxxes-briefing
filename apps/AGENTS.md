# AGENTS

Rules in this file apply under `apps/`.

## Boundaries

- `apps/web` owns the static SPA, browser data fetching, PWA behavior, and public
  UI.
- `apps/api` owns the Hono app, HTTP boundary, and server-side orchestration.
- Web and API communicate through `packages/contracts`.
- Do not leak generator internals or upstream API details into `apps/web`.

## Web

- Follow FSD; use the `feature-sliced-design` skill when working on structure.
- Keep Rust/WASM generation code out of the client bundle.
- Do not hand-edit generated `apps/web/styled-system/`.
- Put reusable UI primitives in `shared/ui`.
- Upgrade solid-js related packages always together.

## API

- Keep contract mapping and validation at the HTTP boundary.
- Keep application logic behind explicit ports such as `DeepDivesProvider`.

## Verification

- Web changes: run relevant web tests and build.
- API changes: run relevant API tests and type checks.
- Cross-app contract changes: verify `packages/contracts`.
