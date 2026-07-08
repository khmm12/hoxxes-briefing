# AGENTS

Rules in this file apply under `packages/`. Keep packages framework-light,
tree-shakeable, and side-effect free, with an explicit and stable public surface —
prefer package-root or versioned exports such as `api/v1`, and avoid deep unstable
imports.

## Contracts

- `packages/contracts` (`@hoxxes-briefing/contracts`) is the shared client/server
  wire contract boundary; `valibot` is the schema source of truth.
- Wire changes go through the contract runbook — revision bumps,
  transform-or-retire, seasons:
  [../docs/contract-runbook.md](../docs/contract-runbook.md) (mechanism in
  [ADR 0002](../docs/adr/0002-contract-revision-negotiation.md)).

## Verification

- `pnpm check` from root.
- When changing exports, verify API and web consumers use supported surfaces.
