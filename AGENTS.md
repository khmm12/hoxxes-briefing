# AGENTS

## Map

Read only the owning docs relevant to the change:

- Architecture and data flow: [docs/architecture.md](docs/architecture.md)
- Product and UX: [docs/product.md](docs/product.md)
- Design system: [designs/DESIGN.md](designs/DESIGN.md)
- DRG reference: [docs/domain.md](docs/domain.md)
- Web implementation: [apps/web/docs/conventions.md](apps/web/docs/conventions.md)
- Deployment: [docs/deployment.md](docs/deployment.md)
- Wire revisions: [docs/contract-runbook.md](docs/contract-runbook.md)

## Rules

- Run `pnpm dedupe` after dependency upgrades.
- Keep public docs and plans in English. When docs and code disagree, verify the
  code and update the owning doc.
- Use Conventional Commits; put product impact before implementation detail.

## Verification

- For code changes, run the full `pnpm check` gate.
- After a WASM ABI change, run `./scripts/codegen-wasm.sh` before the full gate.

## Agent skills

### Issue tracker

Issues and specs live as private local Markdown files under `.scratch/`. See
[docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage labels

Use the default canonical labels: `needs-triage`, `needs-info`,
`ready-for-agent`, `ready-for-human`, and `wontfix`. See
[docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain docs

This is a single-context repo: read root `CONTEXT.md` and relevant ADRs before
exploring. See [docs/agents/domain.md](docs/agents/domain.md).
