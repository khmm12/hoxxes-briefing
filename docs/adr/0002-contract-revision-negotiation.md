---
status: accepted
---

# Evolve the wire contract through a revision header, transform-or-retire

The briefing wire contract will keep changing after launch: DRG seasons grow the
domain vocabulary (new biomes, warnings, objective kinds), refactors reshape the
payload, and meanings of existing fields may shift. The app is a live PWA whose
installed service worker keeps serving an old bundle for weeks or months, so the
deployed API and the client bundle in the field are never guaranteed to match.
We version the contract with a single integer revision negotiated through the
`X-Briefing-Contract` header on the stable `/api/v1/briefing` path, under one
invariant: **a stale client must never render misinterpreted data (no fail
open) — it either keeps working correctly, or it fails loudly into an explicit
update wall.**

## Mechanism

- `packages/contracts` exports `CONTRACT_REV`, a monotonically increasing
  integer compiled into both the API and the client. It means "clients below
  this revision would misread or fail to parse the current wire shape" — it is
  **not** bumped for additive changes old clients handle correctly.
- The client sends `X-Briefing-Contract: <its rev>` on every request; the API
  echoes its own current revision in the response header.
- The API keeps a second integer, `MIN_SUPPORTED_REV` (server-side only), and
  routes each request by the client's revision:
  - `>= CONTRACT_REV` → serve the current shape as-is (CDN-cacheable).
  - `MIN_SUPPORTED_REV <= rev < CONTRACT_REV` → run the response through a
    chain of per-revision downgrade transforms (`N → N−1`, composed) and mark
    it `Cache-Control: no-store`, so downgraded shapes never enter the CDN and
    no `Vary` behavior needs to be trusted.
  - `< MIN_SUPPORTED_REV` → **410 Gone** with error code `CONTRACT_RETIRED`.
  - No header → serve current (curl/debugging sees the live schema; the only
    header-less clients are pre-revision ones on the legacy `/api/v1/weekly`).
- **Every `CONTRACT_REV` bump must choose exactly one of two options:**
  - **transform** — the change is expressible in the previous revision's
    vocabulary and semantics; write the `N → N−1` downgrade, keep the tail
    working seamlessly; or
  - **retire** — it is not expressible (vocabulary growth is the canonical
    case: an old picklist cannot carry a new biome); set
    `MIN_SUPPORTED_REV := CONTRACT_REV`, delete all accumulated downgrades,
    and let stale clients hit the update wall.
  This rule is what closes fail-open mechanically: a semantic change either
  gets re-expressed for old clients or walls them — silently serving them
  reinterpreted data is not a reachable state.
- Client obligations (shipped in this generation, before first release):
  - 410 → a dedicated update wall ("a new version is available") that triggers
    a service-worker update check and reload. The wall only ever appears when
    the fixed bundle is already deployed (SPA and API deploy atomically from
    one Vercel project), so tapping it always resolves in seconds.
  - `invalid-payload` → compare revisions from the response header: server
    ahead → honest "update the app" nudge; server behind (rollback, or the
    ~60s post-deploy CDN stale window) → quiet single retry, then an "on our
    end" error, never an update prompt.
  - The data-cache envelope stores the `CONTRACT_REV` it was written under; a
    mismatch on read drops the entry instead of trusting a structural parse to
    catch semantic drift.
- `confidence: 'verified' | 'unverified'` is a required response field,
  toggled by a server env flag read at the composition root and stamped at the
  HTTP boundary. It covers the season gap where the generator still runs the
  old algorithm and produces plausible-but-untrusted briefings; clients render
  an advisory banner while it is `unverified`.

## Considered options

- **Path versioning per break** (`/api/briefing/v2`, tombstone the old path
  with 410) — rejected: vocabulary growth would mint a new path every season
  while its old path is unmappable anyway, and semantic breaks on an unchanged
  path stay detectable only by review discipline. The header makes the same
  410/tombstone semantics addressable by revision instead of URL. The `v1`
  path segment stays reserved as the *protocol generation* — it changes only
  if this negotiation mechanism itself has to break.
- **Unknown-tolerant client schemas** (unknown enum → `'Unknown'` fallback,
  degraded render) — rejected: strict picklists are what convert vocabulary
  growth from fail-open into fail-closed, and the wall they lead to is cheap
  (one PWA reload) and only appears once the fix is live. Tolerance would buy
  a degraded render for the minutes before the user taps reload, at the cost
  of permanent Unknown-entity UX and weaker validation.
- **Always-on dual-serve (Stripe model)** — deferred, not rejected: the client
  already introduces itself via the request header, so per-revision transforms
  can be added later without touching any shipped client. We do not pay for
  transform upkeep until a break where the wall is unacceptable actually
  happens; seasons periodically garbage-collect whatever transforms have
  accumulated by then.

## Consequences

- One eternal endpoint, two integers, one bump rule. No URL churn, no parallel
  endpoint mappers as a routine cost, and stale downgrade code cannot
  accumulate: every season's retire deletes the whole `downgrades/` directory.
- Revision plumbing is adapter-layer only: negotiation middleware, downgrades
  and `MIN_SUPPORTED_REV` live in `apps/api/src/http/`, frozen old-revision
  schema snapshots live next to their transform (used only by transform
  tests), and `packages/contracts` carries nothing but the current contract
  plus `CONTRACT_REV` and the header name. The generator, providers and wasm
  boundary know nothing about revisions.
- The legacy `/api/v1/weekly` ACL stays outside the revision system and dies
  on its own schedule (ADR 0001); its wire schema and the
  `WEEKLY_DATA_UNAVAILABLE` error code move out of `packages/contracts` into
  the API next to the ACL, making contracts current-only.
- Retiring a revision is a real decision with a real cost (the tail hits the
  wall), so bumps must be deliberate. The operational side — when to bump,
  when to transform, when to retire, how to run a season — is documented in
  the [contract runbook](../contract-runbook.md).
- Known window: Vercel's edge cache serves stale responses for up to ~60s
  after a deploy, so a fresh client can briefly receive a pre-bump payload;
  the revision comparison classifies this as "server behind" and a quiet
  retry absorbs it.
