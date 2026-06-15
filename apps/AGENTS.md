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
- UI system rules (Panda CSS, tokens, typography): `apps/web/docs/conventions.md`.
- Keep Rust/WASM generation code out of the client bundle.
- Do not hand-edit generated `apps/web/styled-system/`.
- Put reusable UI primitives in `shared/ui`.
- Upgrade solid-js related packages always together.
- solid-js 2.0 beta diverges from 1.x in many APIs — verify against the
  installed typings instead of assuming 1.x knowledge. Known traps:
  `createEffect(compute, effect)` takes two functions, `<For>` yields plain
  item values (`keyed={false}` for accessors), DOM attributes are lowercase
  (`tabindex`), JSX types renamed (e.g. `JSX.ClassValue`), `createSignal`
  with a generic `T` fails the `Exclude<T, Function>` value overload — seed
  via the compute-function overload `createSignal(() => initial)` instead.
- Annotate module-level constructor calls assigned to constants
  (`v.picklist(...)`, `createContext(...)`, `new Map()`, `new URL(...)`)
  with `/* @__PURE__ */` so they stay tree-shakeable.
- Vitest runs with `environment: 'node'` — no DOM or localStorage in tests.
  Extract pure logic from hooks and test that (see `create-local-storage`).
- Environment-dependent permissions (persistence, …) go through
  `shared/lib/app-capabilities` (`useAppCapabilities()`); consumers ask
  what is allowed, never where they run. The dev playground renders
  scenarios with `persistence: false`.
- `Portal` from @solidjs/web 2.0.0-beta.14 crashes on mount; `shared/ui/tooltip`
  appends its panel to `document.body` imperatively (hand-rolled portal) —
  recheck on solid upgrades and switch back to `Portal` once fixed.
- Safari-only rendering bugs may not reproduce in Chromium or Playwright
  WebKit — verify in real Safari via safaridriver (`sudo safaridriver --enable`
  once, then WebDriver on :4444). Focusing a tooltip trigger opens it without
  hover synthesis.
- Module layout: exported component first, private helpers below it. Variables
  holding DOM elements use a `$` prefix (`$trigger`, `$panel`); keep
  geometry/style computation pure and apply styles in a separate step.
- Panda style values resolve against the token category declared for each
  property (sizes, colors, radii, …); `[...]` is the raw as-is escape hatch.
  Styles are extracted statically — keep style objects literal, no computed
  values.
- After changing UI strings run `pnpm exec lingui extract --clean` from
  `apps/web`.
- The fastest way to inspect or screenshot weekly UI states (hazards, expired,
  errors, loading, crash) is the dev-only playground at
  `/__playground/:scenario` under `pnpm dev:web` — it renders from fixtures in
  `apps/web/src/pages/weekly/dev/weekly-scenarios.tsx`; add a scenario there
  when introducing a new state.

## API

- Keep contract mapping and validation at the HTTP boundary.
- Keep application logic behind explicit ports such as `DeepDivesProvider`.

## Verification

- Web and API changes: `pnpm check` from root.
- Cross-app contract changes: verify `packages/contracts`.
