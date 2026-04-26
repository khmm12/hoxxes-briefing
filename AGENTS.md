# AGENTS

## Mission

Build and maintain the Hoxxes Briefing SPA + Hono monorepo. Favor correctness,
clarity, and launch readiness over speculative features.

## Sources Of Truth

- System shape: [docs/architecture.md](docs/architecture.md)
- Product and UX intent: [docs/product.md](docs/product.md)
- Deep Rock Galactic vocabulary: [docs/domain.md](docs/domain.md)
- Web UI implementation rules: [apps/web/docs/ui-system.md](apps/web/docs/ui-system.md)

## Local Context

- Check nested `AGENTS.md` files before changing `apps/`, `packages/`, or
  `crates/`.
- Keep agent guidance short. Put human documentation in `README.md` or `docs/`.
- Do not recreate LLM-specific planning docs under `docs/`.

## Safe Commands

- `pnpm dev:web`
- `pnpm dev:api`
- `pnpm build`
- `pnpm check`
- `pnpm test`
- `cargo test --workspace`
- `cargo bench -p drg_mission_gen_wasm` when bench work is explicitly requested

## Verification

- UI/runtime changes: run `pnpm test` and `pnpm build`.
- Rust boundary changes: run `cargo test --workspace`.
- Cross-stack changes: run `pnpm check`.

## Repo Rules

- Keep public docs and planning artifacts in English unless a task explicitly
  states otherwise.
- When docs and code disagree, prefer verified code and update docs in the same
  change when feasible.
- Prefer small, behavior-focused tests over broad snapshots.
