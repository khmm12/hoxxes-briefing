# Hoxxes Briefing

Hoxxes Briefing is a small public Deep Rock Galactic app for the current weekly
Deep Dive and Elite Deep Dive rotation.

Project slug: `hoxxes-briefing`.

## Quickstart

Install the repo toolchain and dependencies:

```bash
mise install
corepack enable
pnpm install
```

Run the local app in two terminals:

```bash
pnpm dev:api
```

```bash
pnpm dev:web
```

The web dev server runs on `http://127.0.0.1:5173` and proxies `/api/*` to the
local API.

## Commands

```bash
pnpm build
pnpm test
pnpm check
```

Regenerate the committed WASM package after Rust generator changes:

```bash
./scripts/codegen-wasm.sh
```

## Repository

- `apps/web/` - Solid SPA, PWA shell, and public UI
- `apps/api/` - Hono API and server-side orchestration
- `packages/contracts/` - shared API schemas and parsing helpers
- `crates/` - Rust generator facade and WASM bridge
- `api/` - Vercel Function entrypoints

## Documentation

- [Architecture](docs/architecture.md) - system shape and data flow
- [Product](docs/product.md) - product and UX intent
- [Domain](docs/domain.md) - Deep Rock Galactic terms and contract values
- [Deployment](docs/deployment.md) - Vercel deployment runbook
- [Web App](apps/web/README.md) - web app ownership and local notes

## Credits

This project would not be here without the mission generation work started in
[trumank/drg-mission-gen](https://github.com/trumank/drg-mission-gen) and carried
forward through the [vioxynteris fork](https://github.com/vioxynteris/deepdives)
that Hoxxes Briefing currently depends on.

Rock and Stone to every miner who left a flare in the dark.

## License

MIT. See `LICENSE`.
