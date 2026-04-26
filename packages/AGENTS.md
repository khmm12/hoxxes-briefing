# AGENTS

Rules in this file apply under `packages/`.

## Contracts

- `packages/contracts` is the shared client/server wire contract boundary.
- `valibot` is the schema source of truth.
- Keep public package surfaces explicit and stable.
- Prefer package-root or explicit versioned exports such as `api/v1`.
- Avoid deep unstable imports.
- Keep packages framework-light, tree-shakeable, and side-effect free.

## Verification

- Run package-local tests and type checks.
- When changing exports, verify API and web consumers use supported surfaces.
