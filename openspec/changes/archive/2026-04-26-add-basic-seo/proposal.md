## Why

Hoxxes Briefing currently has only minimal static document metadata, while the richer title and description are applied by the SPA at runtime. Search and social crawlers should receive useful metadata directly from the initial app shell so the public weekly board previews clearly before JavaScript runs.

## What Changes

- Add static SEO metadata for the root SPA shell, including a better title, description, canonical URL, OpenGraph tags, and Twitter card tags.
- Add a committed OpenGraph preview image for shared links.
- Add a reproducible OG image generator script that can regenerate the committed image on demand without becoming part of the normal build.
- Add `robots.txt` for crawler access rules.
- Document the OG image regeneration command in the web UI system documentation.

## Capabilities

### New Capabilities

- `web-discoverability`: Public crawler and social preview metadata for the web app shell.

### Modified Capabilities

None.

## Impact

- Affects `apps/web/index.html`, `apps/web/public/`, and `apps/web/docs/ui-system.md`.
- Adds development-only image generation dependencies for the OG image generator.
- Does not change runtime routes, API contracts, weekly board behavior, or PWA install semantics.
