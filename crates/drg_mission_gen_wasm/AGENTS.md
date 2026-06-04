# AGENTS

This crate owns the WebAssembly and JavaScript-facing ABI for the Deep Dive
generator.

## Invariants

- `pkg/` is committed and exposed in the pnpm workspace as
  `@hoxxes-briefing/wasm`, consumed by `apps/api` via `workspace:*`.
- JS-facing names and field shapes are public ABI for TypeScript consumers.
- ABI changes must be coordinated with API generator bridge consumers and tests.
- Keep generated `pkg/` output aligned with source when the WASM API changes.
- Mission generation stays server-side for the current product.

## Work Rules

- Keep naming and enum exposure predictable for TypeScript consumers.
- Use explicit conversion layers rather than exposing facade internals directly.
- Do not add product UI concerns to this crate.
- Do not update generated `pkg/` files without running the regeneration path.

## Regeneration

Run `./scripts/codegen-wasm.sh` to rebuild `pkg/` from source. Requires
`wasm-pack` and `wasm-bindgen-cli` from `mise install`.
