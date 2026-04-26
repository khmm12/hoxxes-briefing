# AGENTS

This crate owns the WebAssembly and JavaScript-facing ABI for the Deep Dive
generator.

## Invariants

- JS-facing names and field shapes are public ABI for TypeScript consumers.
- ABI changes must be coordinated with API generator bridge consumers and tests.
- Keep generated `pkg/` output aligned with source when the WASM API changes.
- Mission generation stays server-side for the current product.

## Work Rules

- Keep naming and enum exposure predictable for TypeScript consumers.
- Use explicit conversion layers rather than exposing facade internals directly.
- Do not add product UI concerns to this crate.
- Do not update generated `pkg/` files without running the regeneration path.
