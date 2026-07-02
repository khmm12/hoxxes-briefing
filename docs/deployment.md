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

- root URL loads the briefing
- `GET /api/v1/briefing` returns `200` and matches `packages/contracts`
- `/sw.js` and `/manifest.webmanifest` are reachable
- a hard refresh on a non-root SPA path returns the app shell

## Production

Promote a verified preview:

```bash
vercel promote <preview-url>
```

Do not deploy directly to production unless the preview path is broken and the
production change has been verified locally.

## API CDN Cache

`GET /api/v1/briefing` is cached at the Vercel CDN edge until shortly before the
briefing's expiration. Browser HTTP cache is kept on revalidation mode so the web
app can use its own CacheStorage fallback for stale data.

`/api/v1/weekly` (tag `weekly-v1`) is the retained legacy endpoint with identical
caching; it is removed in Stage 4.

Check deployed cache behavior with:

```bash
curl -I https://hoxxes-briefing.vercel.app/api/v1/briefing
```

Use `x-vercel-cache` to confirm the expected `MISS`, then `HIT` or `STALE` behavior for repeated requests.

Do not purge the briefing API cache automatically after every deployment. If a
release changes the meaning of the existing `/api/v1/briefing` response and stale
data is still acceptable during background revalidation, invalidate the v1 tag
manually:

```bash
vercel cache invalidate --tag briefing-v1
```

If a bad response was cached and must stop being served immediately, use a hard
purge instead:

```bash
vercel cache dangerously-delete --tag briefing-v1
```
