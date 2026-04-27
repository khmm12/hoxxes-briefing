# Web UI System

This document covers implementation rules for `apps/web`. Product intent lives
in [../../../docs/product.md](../../../docs/product.md).

## Panda CSS

Panda CSS is the styling system for the web app.

- `panda.config.ts` defines tokens, semantic tokens, recipes, global styles, and
  generated output settings.
- `styled-system/` is generated output and must not be edited by hand.
- Use Panda primitives, recipes, and token references instead of ad hoc CSS.
- Keep global CSS thin. It should set document-level basics and import what
  Panda requires, not carry page styling.

## Tokens

Prefer existing design tokens before adding new values.

- Use spacing, radius, shadow, color, and typography roles from the Panda theme.
- Promote repeated raw colors, alpha fills, borders, or shadows into semantic
  tokens or shared recipes.
- Keep primitive palette tokens separate from semantic product roles.
- Use readable semantic names for product meaning, such as text, surface, border,
  accent, success, warning, and danger.

## Typography

The current type system uses Rajdhani for display roles and IBM Plex Sans for
body text.

- Use existing text roles and type tokens.
- Do not scale text directly with viewport width.
- Keep dense UI labels readable on mobile.
- Values, metadata, chips, timing labels, and repeated utility text should stay
  visually stable across board states.

## Components

Follow Feature-Sliced Design for placement.

- Weekly-specific composition belongs in `src/pages/weekly`.
- Shared primitives belong in `src/shared/ui` only when they are reusable beyond
  one page.
- Do not create empty or speculative FSD slices.
- Prefer function declarations for exported components.
- Shared UI primitives should accept caller styling through `class` and Panda
  `css` extension props when they are intended for reuse.

## Icons And Assets

Generic inline icons should share one predictable pattern:

- fixed `viewBox`
- default `1em` size
- `currentColor` for meaningful strokes and fills
- caller styling through the shared UI styling contract

The Hoxxes Briefing brand mark is page-local product artwork, not a generic icon.

Regenerate favicon and PWA install assets from the SVG sources instead of editing
raster files by hand:

```bash
pnpm --filter @hoxxes-briefing/web exec pwa-assets-generator --config pwa-favicon-assets.config.ts
pnpm --filter @hoxxes-briefing/web exec pwa-assets-generator --config pwa-assets.config.ts
```

PWA install icons should be full-bleed square truecolor assets. Do not bake in
rounded corners; platform masks own the visible icon shape.

Regenerate the OpenGraph preview image from the scripted source:

```bash
pnpm --filter @hoxxes-briefing/web exec node scripts/generate-og-image.ts
```

## Lingui

All user-facing copy should go through Lingui. Keep copy short, operational, and
specific to the board state. Avoid exposing implementation terms such as API,
payload, service worker, or cache in primary UI copy.

## Verification

For web UI changes:

```bash
pnpm --filter @hoxxes-briefing/web test
pnpm --filter @hoxxes-briefing/web build
```

When a change touches layout, state screens, offline behavior, or PWA update UI,
also inspect desktop and common mobile widths in a browser.
