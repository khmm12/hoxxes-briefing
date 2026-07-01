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

## Icons And Assets

Generic inline icons should share one predictable pattern:

- fixed `viewBox`
- default `1em` size
- `currentColor` for meaningful strokes and fills
- caller styling through the shared UI styling contract

The Hoxxes Briefing brand mark is page-local product artwork, not a generic icon.

Regenerate the favicon and every PWA icon from the SVG sources instead of editing
raster files by hand. The app icon, maskable icon, in-app brand logo, and iOS splash
all draw the same dwarf mark, so they share one source — `assets/icons/emblem.ts`
(the path, palette, and the `renderFullBleedIcon`/`renderBareLogo` renderers). The
favicon keeps its own hand-authored source at `assets/icons/favicon.svg`.

One script rasterizes everything and is the only thing that touches these files:

```bash
pnpm --filter @hoxxes-briefing/web gen:icons
```

`scripts/generate-icons.ts` rasterizes the install icons, the 38 iOS splash screens,
the in-app `brand-logo.svg`, and `favicon.ico` from those two sources; runs the
lossless pass; and rewrites the splash `<link>` block in `index.html`. The PNGs are
**committed** under `assets/icons/` and are NOT regenerated on every build —
rasterizing 38 splash screens costs ~8s, two-thirds of the build. Requires
[oxipng](https://github.com/oxipng/oxipng) (`brew install oxipng`); lossless only —
palette/lossy quantization bands the gold gradient.

PWA install icons should be full-bleed square truecolor assets. Do not bake in
rounded corners; platform masks own the visible icon shape.

**Cache-busting is Vite's job, not a manual version.** Every icon referenced by a
relative path gets a content hash for free, so there is no `ICON_VERSION` to keep in
sync — change `emblem.ts` (or `favicon.svg`), rerun `gen:icons`, and every hash moves
on its own:

- The favicon SVG and apple-touch icon are `<link href="./assets/icons/…">` in
  `index.html`; Vite rewrites them to hashed `/assets/…` paths at build.
- The manifest install icons (192/512/maskable) can't be reached that way — the OS
  reads the manifest as static JSON, which Vite never scans for assets. The
  `manifest-icons` plugin in `vite.config.ts` resolves each one through Vite's
  resolver (`this.resolve`) and routes it through the asset pipeline (`emitFile` →
  `getFileName`), then emits `manifest.webmanifest` with the hashed paths. It computes
  no hash itself; `assets/manifest.webmanifest` is the template — every non-icon field,
  icons by ordinary relative path like everywhere else.

The one exception is **`public/favicon.ico`**: crawlers hard-code `/favicon.ico`, so it
stays at the fixed root path, unhashed, as the fallback (and is the only icon a build
can't bust). After regenerating, confirm every icon href/src resolves to a file in
`dist/` — a stale reference is a silent 404 the build will not catch.

The OpenGraph preview image has its own scripted source (`gen:icons` does not touch it); it runs the
same lossless pass internally:

```bash
pnpm --filter @hoxxes-briefing/web gen:og
```

### iOS launch screens

iOS ignores the manifest `background_color` for the pre-WebView launch screen, so an
installed PWA flashes white on launch without per-device `apple-touch-startup-image`
images. `gen:icons` rasterizes 38 of them (the 53-device table dedupes to 19 unique
screen sizes — media queries match on size, not device name — × 2 orientations) into
`assets/icons/splash/` and writes the matching `<link>` block into `index.html` between
the `<!-- splash:start -->` / `<!-- splash:end -->` markers, so the PNG set and the tags
come from one source and cannot drift.

They are ordinary committed assets referenced relatively, so Vite content-hashes them
like every other icon — the launch screen renders before the service worker exists, so
iOS caches each image by URL and only refetches when the hashed filename changes. They
are kept **out of the precache** (see below): the SW can never serve them, so precaching
~1.8 MB would be dead weight.

### Service worker precache

The service worker precaches the **app shell only**: `index.html`, the JS/CSS/woff2
chunks Vite hashes into `assets/`, and the images the app actually renders as page
subresources — the favicon SVG (the brand logo is inlined into the JS bundle). An image
the app renders is offline by default.

The install artwork is **excluded**, even though it lands in `assets/` with the same Vite
hashes: the manifest install icons (`icon-*`), the home-screen apple-touch icon, and the
iOS launch screens (`apple-splash-*`) are all fetched by the OS/Safari out of SW scope at
install time — never as page subresources — so the SW can never serve them and precaching
~2 MB of them is dead weight. They drop out via
`globIgnores: ['**/icon-*', '**/apple-touch-icon-*', '**/apple-splash-*']`. The dist-root
files (`favicon.ico`, the generated `manifest.webmanifest`, `og-image.png`) stay out by
path, since the globs only reach `assets/`. The `globPatterns`/`globIgnores` comment in
`vite.config.ts` carries the full rationale.

## Lingui

All user-facing copy should go through Lingui. Keep copy short, operational, and
specific to the board state. Avoid exposing implementation terms such as API,
payload, service worker, or cache in primary UI copy.

## Verification

For web UI changes run the full gate from the repo root:

```bash
pnpm check
```

While iterating, the narrower `pnpm --filter @hoxxes-briefing/web test` and
`... build` runs are fine, but they skip biome and typecheck.

When a change touches layout, state screens, offline behavior, or PWA update UI,
also inspect desktop and common mobile widths in a browser.
