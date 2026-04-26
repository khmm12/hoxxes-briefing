## 1. Generator And Assets

- [x] 1.1 Add development-only `satori` and `@resvg/resvg-js` dependencies for OG image generation.
- [x] 1.2 Add `apps/web/scripts/generate-og-image.ts` to render a 1200x630 OG image using Google Fonts, existing Hoxxes Briefing visual assets, Satori, and Resvg.
- [x] 1.3 Run the generator and commit `apps/web/public/og-image.png`.
- [x] 1.4 Confirm the generated image dimensions are 1200x630 and the copy is legible.

## 2. Static Web Metadata

- [x] 2.1 Update `apps/web/index.html` with the title `Hoxxes Briefing | DRG Deep Dive Board`.
- [x] 2.2 Add static root description and canonical metadata for `https://hoxxes-briefing.vercel.app/`.
- [x] 2.3 Add OpenGraph metadata for title, description, type, site name, URL, image, image dimensions, and image alt text.
- [x] 2.4 Add Twitter summary large image metadata using the same title, description, and image.

## 3. Crawler Policy And Docs

- [x] 3.1 Add `apps/web/public/robots.txt` that allows the public app and disallows `/api/`.
- [x] 3.2 Document the direct OG image regeneration command in `apps/web/docs/ui-system.md` near the existing asset generation commands.
- [x] 3.3 Keep `apps/web/package.json` free of a `generate:og` script alias.

## 4. Verification

- [x] 4.1 Run `pnpm --filter @hoxxes-briefing/web build`.
- [x] 4.2 Inspect the production build output for `og-image.png`, `robots.txt`, and the expected static metadata.
- [x] 4.3 Run broader verification if dependency or lockfile changes require it.
