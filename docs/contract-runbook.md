# Contract evolution runbook

Operational playbook for changing the briefing wire contract. The mechanism is
defined in [ADR 0002](adr/0002-contract-revision-negotiation.md); this document
says what to do and when. It is written for both humans and agents.

Core invariant, worth restating before any change: **a stale client must never
render misinterpreted data.** It either keeps working correctly, or it fails
loudly into the update wall. If a change would make an old client *silently
wrong*, it must bump the revision.

## The two integers

| Constant | Lives in | Meaning |
| --- | --- | --- |
| `CONTRACT_REV` | `packages/contracts` (compiled into API **and** client) | Clients below this revision would misread or fail to parse the current wire shape |
| `MIN_SUPPORTED_REV` | `apps/api/src/http/contract/` (server only) | Revisions below this get **410 `CONTRACT_RETIRED`** → update wall |

## Decision tree for any wire change

Ask, in order:

1. **Does an old client still parse AND interpret this correctly?**
   (New field old clients ignore; new optional data; doc-only change.)
   → **Additive change.** Do not touch `CONTRACT_REV`. Ship it.
2. **Otherwise, the change is breaking — bump `CONTRACT_REV` and choose one:**
   - **Can the new payload be re-expressed in the previous revision's shape
     and semantics without lying?** (Field rename, restructure, error-code
     split, semantic shift that is recomputable.)
     → **Transform.** Write a `to-rev-{N−1}.ts` downgrade in
     `apps/api/src/http/contract/downgrades/`, freeze a snapshot of the old
     revision's schema next to it, and test that the downgrade output
     validates against the snapshot. Old clients keep working, served
     `no-store`.
   - **Is it inexpressible in the old vocabulary?** (New biome / warning /
     anomaly / objective kind — an old picklist cannot carry it. This is the
     canonical season case.)
     → **Retire.** Set `MIN_SUPPORTED_REV := CONTRACT_REV` and **delete the
     entire `downgrades/` directory** (transforms and schema snapshots). The
     stale tail hits the update wall; one reload fixes it, because the SPA and
     API deploy atomically.

There is no third option. "Bump and neither transform nor retire" must not
pass review.

### Breaking-change checklist

- [ ] Bump `CONTRACT_REV` in `packages/contracts`.
- [ ] Transform **or** retire (see above) — never neither.
- [ ] Update the current schema in `packages/contracts` (current-only: no
      legacy shapes stay behind in contracts).
- [ ] `pnpm check` from root; contract changes: verify `packages/contracts`.
- [ ] Nothing else: the client cache invalidates itself (envelope stores the
      revision it was written under), and the CDN resets on deploy (~60s stale
      window absorbed by the client's quiet retry).

## Scenario: a new DRG season drops

The generator is a deterministic re-implementation of the game's algorithm.
After a season it keeps producing schema-valid but **factually wrong**
briefings from the same seed — no error will fire. Detection is human.

1. **Immediately** (minutes, no code): set the `confidence` env flag to
   `unverified` on Vercel and redeploy. All clients — including the stale
   tail — show the advisory banner over otherwise-normal data.
2. **Port the season** into the Rust generator (reverse-engineering work;
   takes as long as it takes — clients live under the banner meanwhile, the
   wire vocabulary does not change yet).
3. **Ship the port** as a single deploy:
   - grow the vocabulary picklists/variants in `packages/contracts`,
   - bump `CONTRACT_REV`,
   - **retire**: `MIN_SUPPORTED_REV := CONTRACT_REV`, delete `downgrades/`
     wholesale (the season is the garbage collector — nothing older can be
     expressed in pre-season vocabulary anyway),
   - flip the `confidence` flag back to `verified`.
4. Stale clients hit the wall on their next fetch and are one reload away
   from the new bundle.

If the upstream seed source changes shape instead (e.g. `SeedV2` →
`SeedV3`), the API fails loudly with 502 and clients fall back to the cached
briefing — there is nothing to toggle; fixing the upstream parser is part of
the port.

## Scenario: retiring old revisions outside a season

If transforms have piled up and a season is far away, retirement is allowed on
its own: raise `MIN_SUPPORTED_REV` and delete the downgrades it strands.
Remember the cost — every client below the new floor gets walled — so check
the logged client-revision distribution first (the API logs each request's
`X-Briefing-Contract`).

## What does NOT go through this system

- **Wrong data under an unchanged schema** (generator bugfix): do nothing —
  briefings expire weekly and cache-first + network overwrite handles it.
- **Client cache storage format** (the envelope itself): bump the cache
  layer's private `schemaVersion` in `apps/web`; unrelated to `CONTRACT_REV`.
- **Legacy `/api/v1/weekly`**: pre-revision ACL, dies per ADR 0001
  (`CLEANUP(stage-4)` tags mark the delete list).
- **The `v1` path segment**: reserved for a break of the negotiation
  mechanism itself. Changing it is a new ADR, not a runbook entry.
