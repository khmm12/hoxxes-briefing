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
- UI system rules (Panda CSS, tokens, typography): `apps/web/docs/ui-system.md`.
- Keep Rust/WASM generation code out of the client bundle.
- Do not hand-edit generated `apps/web/styled-system/`.
- Put reusable UI primitives in `shared/ui`.
- Upgrade solid-js related packages always together.
- solid-js 2.0 beta diverges from 1.x in many APIs — verify against the
  installed typings instead of assuming 1.x knowledge. Known traps:
  `createEffect(compute, effect)` takes two functions, `<For>` yields plain
  item values (`keyed={false}` for accessors), DOM attributes are lowercase
  (`tabindex`), JSX types renamed (e.g. `JSX.ClassValue`).
- `Portal` from @solidjs/web 2.0.0-beta.14 crashes on mount; `shared/ui/tooltip`
  renders inline with `position: fixed` instead — keep board containers free of
  `transform`/`filter`/`contain`, and recheck on solid upgrades.
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
