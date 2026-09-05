# Web Conventions

This document covers implementation rules for `apps/web`. Product intent lives
in [../../../docs/product.md](../../../docs/product.md). The visual language —
tokens, typography roles, component specs, motion — is owned by
[../../../designs/DESIGN.md](../../../designs/DESIGN.md) (the text companion to
`designs/hoxxes-briefing.pen`); this document does not restate it.

## Panda CSS

Panda CSS is the styling system for the web app.

- `panda.config.ts` defines tokens, semantic tokens, recipes, global styles, and
  generated output settings.
- `styled-system/` is generated output and must not be edited by hand.
- Use Panda primitives, recipes, and token references instead of ad hoc CSS.
- Keep global CSS thin. It should set document-level basics and import what
  Panda requires, not carry page styling.

## Tokens And Typography

The token set and the typography roles live in the design system; in code they
exist only as the Panda theme (`panda.config.ts`).

- Use existing semantic tokens and text roles before adding new values; a new
  value belongs in the design system first, then in the theme.
- Promote repeated raw colors, alpha fills, borders, or shadows into semantic
  tokens or shared recipes.
- Do not scale text directly with viewport width.
- Values, metadata, chips, timing labels, and repeated utility text should stay
  visually stable across board states.

## Components

Follow Feature-Sliced Design for placement.

- Briefing-specific composition belongs in `src/pages/briefing`.
- Shared primitives belong in `src/shared/ui` only when they are reusable beyond
  one page.
- Do not create empty or speculative FSD slices.
- Prefer function declarations for exported components.
- Shared UI primitives should accept caller styling through `class` and Panda
  `css` extension props when they are intended for reuse.
- Put exported APIs and test cases before non-trivial helpers. Prefix variables
  holding DOM elements with `$`, and keep geometry computation pure.
- Annotate pure module-level constructor calls assigned to constants with
  `/* @__PURE__ */` so the production build can tree-shake them.
- Route environment-dependent permissions through
  `shared/lib/app-capabilities`; consumers ask what is allowed, not where they
  run.

## SolidJS

Upgrade `solid-js`, `@solidjs/web`, and related Solid packages together.

## Icons And Assets

Generic inline icons should share one predictable pattern:

- fixed `viewBox`
- default `1em` size
- `currentColor` for meaningful strokes and fills
- caller styling through the shared UI styling contract

The Hoxxes Briefing brand mark is page-local product artwork, not a generic icon.

Regenerate the favicon, PWA install icons, in-app brand logo, iOS launch screens,
and OpenGraph image from their SVG/TS sources — never hand-edit the raster files.
PWA install icons are full-bleed square truecolor with no baked-in rounded
corners; platform masks own the visible shape. The full generation pipeline
(sources, `gen:icons`/`gen:og`, Vite cache-busting, and the service-worker
precache exclusions) lives in [assets.md](assets.md).

## Lingui

All user-facing copy should go through Lingui. Keep copy short, operational, and
specific to the board state. Avoid exposing implementation terms such as API,
payload, service worker, or cache in primary UI copy.

After changing user-facing strings, run:

```bash
pnpm --dir apps/web exec lingui extract --clean
```

## Verification

While iterating, use `pnpm --filter @hoxxes-briefing/web test` or `... build`.
They skip the repository gate.

Component tests use `renderWithProviders` from `~test/render`; there is no global
`screen`. `happy-dom` does not provide layout, so extract and test pure geometry
instead of mocking browser layout.

Browser regressions run with `pnpm --filter @hoxxes-briefing/web test:browser`
after installing Chromium once with
`pnpm --filter @hoxxes-briefing/web exec playwright install chromium`. CI runs
them after `pnpm check`. The suite builds two production shells and serves them
on a local test origin with a fixture API. It verifies update-wall recovery
through a deliberately slow service-worker installation, offline reopening,
and the mobile switch's real geometry across scroll restoration and reflow.
Service-worker and layout APIs remain real; lifecycle-only unit tests may
control frame scheduling and font events without inventing geometry.

Use `/__playground/:scenario` under `pnpm dev:web` to inspect briefing UI states.

When a change touches layout, state screens, offline behavior, or PWA update UI,
also inspect desktop and common mobile widths in a browser.

Safari-only rendering bugs may not reproduce in Chromium or Playwright WebKit;
verify them in real Safari.
