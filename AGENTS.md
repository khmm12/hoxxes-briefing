# AGENTS

## Mission

Build and maintain the Hoxxes Briefing SPA + Hono monorepo — a small public app
for the current Deep Rock Galactic Deep Dive and Elite Deep Dive. Favor
correctness, clarity, and launch readiness over speculative features.

## Where things live

Consult the owning document before changing behavior it covers:

- System shape and data flow: [docs/architecture.md](docs/architecture.md)
- Product and UX intent: [docs/product.md](docs/product.md)
- Design system (tokens, typography roles, components, motion):
  [designs/DESIGN.md](designs/DESIGN.md), text companion to
  `designs/hoxxes-briefing.pen`
- Ubiquitous language — canonical terms, deliberate deviations, terms to avoid:
  [CONTEXT.md](CONTEXT.md); Deep Rock Galactic reference catalogue:
  [docs/domain.md](docs/domain.md)
- Web UI implementation rules: [apps/web/docs/conventions.md](apps/web/docs/conventions.md)
- Deployment shape: [docs/deployment.md](docs/deployment.md)
- Wire contract changes (revision bumps, seasons, retirement):
  [docs/contract-runbook.md](docs/contract-runbook.md), mechanism in
  [ADR 0002](docs/adr/0002-contract-revision-negotiation.md)
- Behavioral specs: `openspec/specs/` (OpenSpec). Consult before changing
  covered behavior; do not add new specs unless explicitly asked (the workflow
  is under evaluation).

Layout rules:

- Root `api/` is only the thin Vercel Function entrypoint; application code lives
  in `apps/api`. Do not add logic to root `api/`.
- `apps/web` owns the SPA, PWA shell, and public UI; `apps/api` owns the Hono HTTP
  boundary and server-side orchestration. The two communicate only through
  `packages/contracts`, and generator internals or upstream API details must not
  leak into `apps/web`. Per-tree rules: `apps/web/AGENTS.md`, `apps/api/AGENTS.md`.
- Check the nested `AGENTS.md` under `apps/`, `packages/`, or `crates/` before
  changing that tree.
- Keep agent guidance short and in `AGENTS.md`; human documentation belongs in
  `README.md` or `docs/`. Do not create new LLM-specific planning docs under
  `docs/` unless explicitly requested.

## Working in this repo

- **Tooling:** `mise` is the source of truth for local tool versions. Do not
  assume globally installed Rust, Node, pnpm, Vercel, or wasm tooling matches.
  Run `pnpm dedupe` after upgrading packages.
- **Docs and language:** keep public docs and planning artifacts in English.
  When docs and code disagree, prefer verified code and update the docs in the
  same change. Use Conventional Commits — the body leads with the product-facing
  essence (especially `feat`), implementation rationale after.
- **Tests:** prefer small, behavior-focused tests over broad snapshots.
- **Standards anchor:** YAGNI and KISS (flat control flow, early returns, named
  functions, boring technology), the Boy Scout rule, and least surprise — but
  never as a license for an ad-hoc hack or a surprising *gap* in existing
  behavior. If structure resists a change, refactor it first, then add.
- **Strict contracts, strict types:** wire data crosses a closed valibot
  contract (`packages/contracts`) — closed enums/variants, no freeform `string`
  for a bounded domain. Both ends parse and reject the unknown, so the client
  only ever holds known members. Key logic on the contract's types exhaustively
  (`Record<Member, …>`, `switch` with a `never` check) and let the compiler
  force new members to be handled, rather than adding runtime fallbacks for
  states the contract makes impossible. New domain values are a contract change
  (picklist + revision bump, see
  [ADR 0002](docs/adr/0002-contract-revision-negotiation.md)), caught at build
  time.

## Commands & verification

Safe to run when relevant:

- `pnpm check` — the full gate: biome lint + typecheck + rustfmt + clippy + test
  + build. Run it before committing or declaring work done, regardless of change
  type; `pnpm test`/`pnpm build` alone skip biome, typecheck, rustfmt, and
  clippy.
- `pnpm test`, `pnpm build` — fine while iterating.
- `cargo test --workspace` — also run this for Rust boundary changes.
- Wire-contract changes: also verify `packages/contracts` and both consumers.
- `cargo bench -p drg_mission_gen_wasm` — only when bench work is explicitly
  requested.
- `./scripts/codegen-wasm.sh` — when the WASM ABI changes (requires
  `mise install`).

Long-running, for manual verification only: `pnpm dev:web`, `pnpm dev:api`.
