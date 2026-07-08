# AGENTS

Rules in this file apply under `apps/web` — the static SPA, briefing UI, PWA
shell, and browser data fetching. Cross-app boundaries live in the root `AGENTS.md`.

## Structure

- Follow Feature-Sliced Design; use the `feature-sliced-design` skill when working
  on structure. Put reusable UI primitives in `shared/ui`.
- Keep Rust/WASM generation code out of the client bundle.
- Do not hand-edit generated `styled-system/`.
- Module layout: the essence first, support below. Exported component/API up top,
  non-trivial private helpers under it — a reader must see what the module does
  before scrolling through helper definitions. Module-level constants and types
  may sit above (they are context, not toil); one-line helpers may too. The same
  order applies to tests: the `describe`/`it` cases come first, fixtures and
  helpers below. Variables holding DOM elements use a `$` prefix (`$trigger`,
  `$panel`); keep geometry/style computation pure and apply styles in a separate
  step.
- Annotate module-level constructor calls assigned to constants (`v.picklist(...)`,
  `createContext(...)`, `new Map()`, `new URL(...)`) with `/* @__PURE__ */` so they
  stay tree-shakeable.

## SolidJS

- Upgrade solid-js related packages always together.
- solid-js 2.0 beta diverges from 1.x in many APIs — use the `solidjs-v2` skill
  instead of assuming 1.x knowledge.

## Styling and copy

- UI system rules — Panda CSS, tokens, typography, and the icon/asset pipeline:
  `docs/conventions.md`.
- Panda style values resolve against the token category declared for each property
  (sizes, colors, radii, …); `[...]` is the raw as-is escape hatch. Styles are
  extracted statically — keep style objects literal, no computed values.
- After changing UI strings run `pnpm exec lingui extract --clean` from `apps/web`.

## Testing

- Vitest runs under `happy-dom` with `@solidjs/testing-library`. Render components
  via `renderWithProviders` from `~test/render` (wraps the tree in the i18n
  provider with the real en-US catalog); query through the returned helpers, not a
  global `screen` (there is none). Reactive primitives: drive them in
  `createRoot`/`renderHook` and `flush()` before asserting. The service-worker
  suite (`sw`) is the one node-only suite — it opts out with a
  `// @vitest-environment node` docblock. happy-dom has no real layout —
  embla/scroll/observer-driven code still needs its pure logic extracted and
  unit-tested (see `create-shrink-progress`, `create-swipe-deck`); don't fake
  layout geometry.
- The fastest way to inspect or screenshot briefing UI states (mutators, expired,
  errors, loading, crash) is the dev-only playground at `/__playground/:scenario`
  under `pnpm dev:web` — it renders from fixtures in
  `src/pages/briefing/dev/scenarios.tsx`; add a scenario there when introducing a
  new state.

## Runtime and platform

- Environment-dependent permissions (persistence, …) go through
  `shared/lib/app-capabilities` (`useAppCapabilities()`); consumers ask what is
  allowed, never where they run. The dev playground renders scenarios with
  `persistence: false`.
- Safari-only rendering bugs may not reproduce in Chromium or Playwright WebKit —
  verify in real Safari via safaridriver (`sudo safaridriver --enable` once, then
  WebDriver on :4444). Focusing a tooltip trigger opens it without hover synthesis.
