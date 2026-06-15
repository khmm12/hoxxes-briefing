# AGENTS

## Mission

Build and maintain the Hoxxes Briefing SPA + Hono monorepo. Favor correctness,
clarity, and launch readiness over speculative features.

## Sources Of Truth

- System shape: [docs/architecture.md](docs/architecture.md)
- Product and UX intent: [docs/product.md](docs/product.md)
- Design system (tokens, typography roles, components, motion):
  [designs/DESIGN.md](designs/DESIGN.md), text companion to
  `designs/hoxxes-briefing.pen`
- Deep Rock Galactic vocabulary: [docs/domain.md](docs/domain.md)
- Web UI implementation rules: [apps/web/docs/conventions.md](apps/web/docs/conventions.md)
- Deployment shape: [docs/deployment.md](docs/deployment.md)
- Behavioral specs: `openspec/specs/` (OpenSpec). Consult before changing
  covered behavior. The workflow is under evaluation — do not add new specs
  unless explicitly asked.

## Local Context

- Root `api/` is only the thin Vercel Function entrypoint; application code
  lives in `apps/api`. Do not add logic to root `api/`.
- Check nested `AGENTS.md` files before changing `apps/`, `packages/`, or
  `crates/`.
- Keep agent guidance short. Put human documentation in `README.md` or `docs/`.
- Do not create new LLM-specific planning docs under `docs/` unless explicitly requested.

## Tooling

- Use `mise` as the source of truth for local tool versions.
- Do not assume globally installed Rust, Node, pnpm, Vercel, or wasm tooling
  matches the project versions.

## Safe Commands

The following commands are safe to run when relevant:

- `pnpm check` (biome lint + typecheck + test + build)
- `pnpm test`
- `pnpm build`
- `cargo test --workspace`
- `cargo bench -p drg_mission_gen_wasm` when bench work is explicitly requested
- `./scripts/codegen-wasm.sh` when WASM ABI changes (requires `mise install`)

Long-running commands may be used only when needed for manual verification:

- `pnpm dev:web`
- `pnpm dev:api`

## Verification

- Before committing or declaring work done: `pnpm check`, regardless of
  change type. `pnpm test`/`pnpm build` alone run neither biome nor
  typecheck.
- While iterating, narrower runs (`pnpm test`, `pnpm build`) are fine.
- Rust boundary changes: also `cargo test --workspace`.

## Repo Rules

- Keep public docs and planning artifacts in English unless a task explicitly
  states otherwise.
- When docs and code disagree, prefer verified code and update docs in the same
  change when feasible.
- Prefer small, behavior-focused tests over broad snapshots.
- Use Conventional Commits for commit messages. The body leads with the product-facing essence (especially for `feat`); implementation rationale comes after.

## Upgrading packages

- Always use `pnpm dedupe` after upgrading packages.

## Engineering Standards

- YAGNI: build for current requirements; refactor when needs emerge. Delete
  dead code when it is proven unused and within task scope.
- KISS: flat control flow, early returns, named functions, boring technology.
- YAGNI/KISS are not a license for ad-hoc code or poor abstractions. A pattern
  or abstraction earns its place when it reduces cognitive load or gives a
  cheap way to reason about future change — judge by that, not by line count.
- Boy Scout Rule: leave code cleaner than you found it. If a feature requires a workaround because existing structure resists it — refactor first, then add.
- Principle of least surprise: default to the behavior a developer would reasonably
  expect, even when nothing exercises it yet. YAGNI justifies not building unused
  *features* — never a surprising *gap* in existing behavior (e.g. an app-rendered
  asset silently left out of the offline cache). Make the expected case work by
  default and call out any deliberate exception.
