# AGENTS

Rules in this file apply under `apps/api` — the Hono app, HTTP boundary, and
server-side orchestration. Cross-app boundaries live in the root `AGENTS.md`.

## Rules

- Keep contract mapping and validation at the HTTP boundary.
- Keep application logic behind explicit ports such as `BriefingProvider`.
- Wire-contract negotiation lives here (`src/http/contract/`: `MIN_SUPPORTED_REV`,
  revision negotiation, and the downgrade transforms when any are live). Changing
  the wire follows the contract runbook —
  [../../docs/contract-runbook.md](../../docs/contract-runbook.md) (mechanism in
  [ADR 0002](../../docs/adr/0002-contract-revision-negotiation.md)).
