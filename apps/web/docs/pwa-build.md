# PWA service-worker build deprecation warning

## Status

`pnpm --filter @hoxxes-briefing/web build` succeeds, but Vite 8 emits:

```
inlineDynamicImports option is deprecated, please use codeSplitting: false instead.
```

This is a build-time warning only. It is emitted during the second Vite build
that `vite-plugin-pwa` runs for the custom service worker, not during the app
bundle or Workbox manifest injection.

## Owner and mechanism

The app deliberately uses `injectManifest` with `src/app/sw.ts` in
[`apps/web/vite.config.ts`](../vite.config.ts). In `vite-plugin-pwa` v1.3.0,
the plugin creates that service-worker build and hard-codes
`output.inlineDynamicImports: true` to produce one service-worker bundle:

- [v1.3.0 source: `src/vite-build.ts`](https://github.com/vite-pwa/vite-plugin-pwa/blob/v1.3.0/src/vite-build.ts#L140-L152)
- [Rolldown output types: `inlineDynamicImports` is deprecated](https://github.com/rolldown/rolldown/blob/v1.2.0/packages/rolldown/src/options/output-options.ts#L511-L520)

Vite 8 uses Rolldown 1.2.x. Rolldown defines `codeSplitting: false` as the
equivalent single-bundle behavior and emits this exact warning when the old
option is supplied:

- [equivalent behavior in the option definition](https://github.com/rolldown/rolldown/blob/v1.2.0/packages/rolldown/src/options/output-options.ts#L576-L608)
- [warning and normalization in the implementation](https://github.com/rolldown/rolldown/blob/v1.2.0/packages/rolldown/src/utils/bindingify-output-options.ts#L198-L247)

## No safe application-level workaround

The plugin's public `injectManifest.rollupOptions` type explicitly omits
`output`, and its implementation spreads that option before replacing `output`
with its own object. Therefore neither `vite.config.ts` nor an `as any` cast can
set `codeSplitting: false`; the plugin wins at runtime.

- [v1.3.0 public option type](https://github.com/vite-pwa/vite-plugin-pwa/blob/v1.3.0/src/types.ts#L84-L88)
- [v1.3.0 implementation that overwrites `output`](https://github.com/vite-pwa/vite-plugin-pwa/blob/v1.3.0/src/vite-build.ts#L140-L152)

Do not silence the warning, patch `node_modules`, or change the application to
`generateSW`: those actions either hide upstream drift or change the service
worker ownership model for no product benefit.

## Upstream and action

The upstream tracker is [issue #912](https://github.com/vite-pwa/vite-plugin-pwa/issues/912).
Its proposed one-line fix is [PR #939](https://github.com/vite-pwa/vite-plugin-pwa/pull/939),
which changes the plugin's internal option to `codeSplitting: false`. At the
time of this note (2026-08-01), that PR is open; [v1.3.0](https://github.com/vite-pwa/vite-plugin-pwa/releases/tag/v1.3.0)
is the latest release and still contains the deprecated option.

**Action:** accept the non-failing warning for now. When a release containing
PR #939 is published, upgrade `vite-plugin-pwa`, run `pnpm dedupe`, then run
`pnpm check` and confirm the production build no longer prints it.
