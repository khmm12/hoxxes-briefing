# Web Assets And Icons

How the web app's icons, favicon, PWA install artwork, iOS launch screens, and
OpenGraph image are generated. Authoring rules for inline icons live in
[conventions.md](conventions.md#icons-and-assets); this document is the pipeline.

## Sources

The app icon, maskable icon, in-app brand logo, and iOS splash all draw the same
dwarf mark, so they share one source — `assets/icons/emblem.ts` (the path,
palette, and the `renderFullBleedIcon`/`renderBareLogo` renderers). The favicon
keeps its own hand-authored source at `assets/icons/favicon.svg`.

## One script rasterizes everything

```bash
pnpm --filter @hoxxes-briefing/web gen:icons
```

`scripts/generate-icons.ts` is the only thing that touches the generated icon
files. It rasterizes the install icons, the 38 iOS splash screens, the in-app
`brand-logo.svg`, and `favicon.ico` from the two sources; runs the lossless
pass; and rewrites the splash `<link>` block in `index.html`.

The PNGs are **committed** under `assets/icons/` and are NOT regenerated on every
build — rasterizing 38 splash screens costs ~8s, two-thirds of the build.
Requires [oxipng](https://github.com/oxipng/oxipng) (`brew install oxipng`);
lossless only — palette/lossy quantization bands the gold gradient.

## Cache-busting is Vite's job

There is no `ICON_VERSION` to keep in sync. Every icon referenced by a relative
path gets a content hash for free — change `emblem.ts` (or `favicon.svg`), rerun
`gen:icons`, and every hash moves on its own.

- The favicon SVG and apple-touch icon are `<link href="./assets/icons/…">` in
  `index.html`; Vite rewrites them to hashed `/assets/…` paths at build.
- The manifest install icons (192/512/maskable) can't be reached that way — the
  OS reads the manifest as static JSON, which Vite never scans for assets. The
  `manifest-icons` plugin in `vite.config.ts` resolves each one through Vite's
  resolver (`this.resolve`) and routes it through the asset pipeline (`emitFile`
  → `getFileName`), then emits `manifest.webmanifest` with the hashed paths. It
  computes no hash itself; `assets/manifest.webmanifest` is the template — every
  non-icon field, icons by ordinary relative path like everywhere else.

The one exception is **`public/favicon.ico`**: crawlers hard-code
`/favicon.ico`, so it stays at the fixed root path, unhashed, as the fallback
(and is the only icon a build can't bust). After regenerating, confirm every
icon href/src resolves to a file in `dist/` — a stale reference is a silent 404
the build will not catch.

## OpenGraph preview image

The OpenGraph preview image has its own scripted source (`gen:icons` does not
touch it); it runs the same lossless pass internally:

```bash
pnpm --filter @hoxxes-briefing/web gen:og
```

## iOS launch screens

iOS ignores the manifest `background_color` for the pre-WebView launch screen, so
an installed PWA flashes white on launch without per-device
`apple-touch-startup-image` images. `gen:icons` rasterizes 38 of them (the
53-device table dedupes to 19 unique screen sizes — media queries match on size,
not device name — × 2 orientations) into `assets/icons/splash/` and writes the
matching `<link>` block into `index.html` between the `<!-- splash:start -->` /
`<!-- splash:end -->` markers, so the PNG set and the tags come from one source
and cannot drift.

They are ordinary committed assets referenced relatively, so Vite content-hashes
them like every other icon — the launch screen renders before the service worker
exists, so iOS caches each image by URL and only refetches when the hashed
filename changes. They are kept out of the precache (below): the SW can never
serve them, so precaching ~1.8 MB would be dead weight.

## Service worker precache

The service worker precaches the **app shell only**: `index.html`, the JS/CSS/
woff2 chunks Vite hashes into `assets/`, and the images the app actually renders
as page subresources — the favicon SVG (the brand logo is inlined into the JS
bundle). An image the app renders is offline by default.

The install artwork is **excluded**, even though it lands in `assets/` with the
same Vite hashes: the manifest install icons (`icon-*`), the home-screen
apple-touch icon, and the iOS launch screens (`apple-splash-*`) are all fetched
by the OS/Safari out of SW scope at install time — never as page subresources —
so the SW can never serve them and precaching ~2 MB of them is dead weight. They
drop out via `globIgnores: ['**/icon-*', '**/apple-touch-icon-*',
'**/apple-splash-*']`. The dist-root files (`favicon.ico`, the generated
`manifest.webmanifest`, `og-image.png`) stay out by path, since the globs only
reach `assets/`. The `globPatterns`/`globIgnores` comment in `vite.config.ts`
carries the full rationale.
