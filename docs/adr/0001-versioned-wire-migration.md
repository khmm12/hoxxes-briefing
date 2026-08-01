---
status: accepted, amended by ADR-0002
---

# Migrate the wire contract behind a parallel endpoint, not an in-place break

The Deep Dive naming rework (see [CONTEXT.md](../../CONTEXT.md)) renames the wire
contract end-to-end: resource `weekly` → `briefing`, the legacy wire tags
`Dreadnought` / `HeavyExcavation` / `mutator` → their domain words `Classic` /
`HeavyExtraction` / `anomaly`, and the `week` wrapper flattened away. Because the
app is a live PWA, an installed service worker keeps running the old client until
the user accepts an update, so an in-place wire break would blank those clients.
We therefore shipped the clean contract as a **new** `/api/v1/briefing` endpoint
and kept the old `/api/v1/weekly` alive through a disposable anti-corruption
layer that mapped the clean internal `Briefing` model back to the legacy wire
shape. Stage 4 removed the old endpoint and its ACL after old service workers
had aged out.

## Considered options

- **In-place break** — change `/api/v1/weekly`'s shape, bump caches, deploy
  server and client together. Rejected: PWA clients on the old service worker
  don't get the new bundle until they tap update, and break until then.
- **Keep `domain != wire` forever** via serde renames on the wasm crate (the
  prior approach). Rejected: we're already paying for one wire migration;
  carrying legacy aliases indefinitely keeps the crates and schema dishonest for
  no benefit.

## Consequences

- The clean model crosses the wasm boundary and serializes directly on
  `/api/v1/briefing` (`domain == wire`); the temporary `/api/v1/weekly` ACL was
  removed in Stage 4.
- Client data caching moves onto the workbox convention (versioned cache name,
  old caches cleaned up like precache), replacing the bespoke hand-rolled weekly
  cache.
- `seed` stays on the wire and gains a client use — it deterministically seeds
  slogan selection, replacing the client's former hash of the now-removed
  `week.id`.
- The sunset was a commitment: the old endpoint and every temporary migration
  artifact were removed in Stage 4.

## Amended by ADR-0002

The decision itself stands — the weekly → briefing migration ran exactly as
described, and the sunset commitment remains. Two things changed after the
fact:

- The parallel-endpoint pattern is **not** the general policy for future wire
  breaks; those go through the contract revision header instead
  ([ADR 0002](0002-contract-revision-negotiation.md)). This ADR describes a
  one-off migration that predates the revision system.
- `schema/weekly` and the `WEEKLY_DATA_UNAVAILABLE` code moved out of
  `packages/contracts` into `apps/api` next to the ACL (contracts stays
  current-only), then were removed with the ACL in Stage 4.
