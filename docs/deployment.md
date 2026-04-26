# Vercel Deployment

Hoxxes Briefing deploys to the Vercel project `hoxxes-briefing`.

## Preview

```bash
mise install
pnpm check
vercel link --yes --project hoxxes-briefing
vercel pull --yes --environment preview
vercel deploy --target=preview
```

Verify the preview before promotion:

- root URL loads the weekly board
- `GET /api/v1/weekly` returns `200` and matches `packages/contracts`
- `/sw.js` and `/manifest.webmanifest` are reachable
- a hard refresh on a non-root SPA path returns the app shell

## Production

Promote a verified preview:

```bash
vercel promote <preview-url>
```

Do not deploy directly to production unless the preview path is broken and the
production change has been verified locally.
