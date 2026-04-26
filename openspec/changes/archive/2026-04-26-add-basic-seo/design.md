## Context

The web app is a static Solid SPA served from the root path at `https://hoxxes-briefing.vercel.app/`. The current app shell has PWA metadata and favicons, but the richer weekly page title and description are applied by `@solidjs/meta` after the SPA boots. Search and social crawlers should receive useful metadata from the initial HTML response.

The project already keeps PWA icons as repo-owned generated assets. The OG image should follow the same pattern: commit the generated public asset and keep a documented generator for future updates.

## Goals / Non-Goals

**Goals:**

- Provide useful static metadata in the app shell for search and social previews.
- Use `Hoxxes Briefing | DRG Deep Dive Board` as the primary static title.
- Use a description that includes the full `Deep Rock Galactic` phrase and the weekly board value.
- Provide `robots.txt` for crawler policy.
- Provide a static 1200x630 OG preview image that is reproducible from repo-owned script logic.
- Document OG image regeneration in `apps/web/docs/ui-system.md` without adding a package script alias.

**Non-Goals:**

- Do not add SSR or dynamic per-week OG images.
- Do not add sitemap generation while the public app has only the root supported route.
- Do not use external Deep Rock Galactic screenshots, official art, or scraped assets.
- Do not make OG image generation part of the default build, test, or typecheck path.

## Decisions

1. **Put crawler-critical metadata in `apps/web/index.html`.**

   The app may keep route-level runtime metadata for browser navigation, but the root HTML shell must include the canonical URL, description, OpenGraph tags, and Twitter card tags. This gives crawlers a useful preview before JavaScript executes.

2. **Use one static canonical root URL.**

   The production URL is `https://hoxxes-briefing.vercel.app/`. The static canonical URL, `og:url`, and image URL should use this absolute root URL because the current architecture supports root-path hosting only.

3. **Commit a static PNG OG image.**

   The shared preview should reference `https://hoxxes-briefing.vercel.app/og-image.png`. The image should be 1200x630, use the existing Hoxxes Briefing visual language, and avoid implying official Deep Rock Galactic affiliation.

4. **Generate the OG image with Satori and Resvg.**

   Use a Node script under `apps/web/scripts/` that loads Google Fonts for the exact OG text, renders an SVG with `satori`, and writes a PNG through `@resvg/resvg-js`. The script may fetch fonts during regeneration because the generated PNG is committed and served statically. This keeps runtime and normal build paths independent from Google Fonts availability.

   Alternatives considered:

   - Headless Chrome: strong CSS fidelity, but heavier and less portable without adding a browser dependency.
   - Sharp-only SVG rendering: smaller dependency surface, but weaker layout and typography ergonomics for a branded preview.
   - Manual PNG creation: fastest once, but not reproducible enough for maintained assets.

5. **Document the generator command only.**

   Do not add a `package.json` script. Add the direct command to `apps/web/docs/ui-system.md`, near the existing PWA asset regeneration commands.

## Risks / Trade-offs

- Google Fonts fetch can fail during regeneration -> the script should fail clearly; the committed `og-image.png` remains the served asset.
- Satori supports a subset of CSS -> keep the OG layout simple, using flex layout, explicit sizes, colors, and embedded SVG imagery.
- Static metadata cannot reflect the current weekly seed -> accept this for Basic SEO; dynamic weekly OG previews are a separate feature.
- Adding generator dependencies increases dev dependency surface -> keep them development-only and outside the normal build path.
