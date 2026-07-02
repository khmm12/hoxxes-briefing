import type { MiddlewareHandler } from 'hono'
import { BRIEFING_CONTRACT_HEADER, parseContractRev, type v1 } from '@hoxxes-briefing/contracts'
import { stripCdnCacheHeaders } from '../cdn-cache.ts'
import { buildErrorBody } from '../errors.ts'

// Re-expresses a revision-N payload in revision N−1 vocabulary and semantics.
export type ContractDowngrade = (payload: unknown) => unknown

export type ContractNegotiationDependencies = {
  currentRev: number
  minSupportedRev: number
  // Keyed by source revision: `downgrades[N]` is the N → N−1 transform. The
  // transforms live in `./downgrades/` — the directory materialises with the
  // first one and is deleted wholesale on retire (see docs/contract-runbook.md).
  downgrades: Record<number, ContractDowngrade>
}

// X-Briefing-Contract negotiation for the briefing route (ADR 0002). The
// route handler stays revision-ignorant: a current-revision client's response
// body passes through untouched (headers are still stamped), window clients
// get their body downgraded here.
export function createContractNegotiation(deps: ContractNegotiationDependencies): MiddlewareHandler {
  assertWindowCovered(deps)

  return async (context, next) => {
    const clientRev = parseContractRev(context.req.header(BRIEFING_CONTRACT_HEADER))
    // Tail-distribution telemetry: retirement decisions read this log.
    console.info(`[contract] client revision: ${clientRev ?? 'none'}`)

    context.header(BRIEFING_CONTRACT_HEADER, String(deps.currentRev))
    // The response body varies by the client revision, so the CDN must key on
    // it (Vercel supports Vary with custom request headers) — otherwise a
    // warm current-shape cache entry would be served to window clients,
    // bypassing the downgrade path entirely.
    context.header('vary', BRIEFING_CONTRACT_HEADER, { append: true })

    // No header means a pre-revision client (legacy weekly) or curl/debugging;
    // both get the live schema. A future revision means a fresher client that
    // still parses the current shape — serve current as-is.
    if (clientRev === null || clientRev >= deps.currentRev) return next()

    if (clientRev < deps.minSupportedRev) {
      context.header('cache-control', 'no-store')
      return context.json(buildContractRetiredBody(context.req.header('x-request-id')), 410)
    }

    await next()

    // Downgraded shapes must never enter the CDN — Vary keys the lookup, but
    // storage stays forbidden as defense in depth: if a cache mishandles Vary,
    // a stale client sees the update wall instead of a downgrade, never the
    // other way around.
    context.res.headers.set('cache-control', 'no-store')
    stripCdnCacheHeaders(context.res.headers)
    if (!context.res.ok) return

    const payload: unknown = await context.res.json()
    context.res = new Response(JSON.stringify(applyDowngrades(payload, deps, clientRev)), context.res)
  }
}

// A hole in the support window is a deploy bug ("bump and neither transform
// nor retire" must not pass review) — surface it when the app boots, not when
// the first stale client hits it in production.
function assertWindowCovered(deps: ContractNegotiationDependencies): void {
  if (deps.minSupportedRev > deps.currentRev) {
    throw new Error(`MIN_SUPPORTED_REV ${deps.minSupportedRev} exceeds CONTRACT_REV ${deps.currentRev}`)
  }

  for (let rev = deps.currentRev; rev > deps.minSupportedRev; rev--) {
    if (deps.downgrades[rev] === undefined) throw new Error(`Missing contract downgrade for revision ${rev}`)
  }
}

// 410 Gone for clients below MIN_SUPPORTED_REV (ADR 0002) — the update wall.
function buildContractRetiredBody(requestId?: string): v1.ErrorResponse {
  return buildErrorBody('CONTRACT_RETIRED', 'This app version is no longer supported. Update the app.', requestId)
}

function applyDowngrades(payload: unknown, deps: ContractNegotiationDependencies, targetRev: number): unknown {
  let downgraded = payload

  for (let rev = deps.currentRev; rev > targetRev; rev--) {
    const downgrade = deps.downgrades[rev]
    // Unreachable once assertWindowCovered passed at boot; kept so a hole
    // could still never silently serve the current shape.
    if (downgrade === undefined) throw new Error(`Missing contract downgrade for revision ${rev}`)

    downgraded = downgrade(downgraded)
  }

  return downgraded
}
