import { Hono } from 'hono'
import type { v1 } from '@hoxxes-briefing/contracts'
import { registerBriefingRoute } from './http/briefing/route.ts'
import { createDirectBriefingProvider } from './infrastructure/providers/direct-briefing-provider.ts'
import type { BriefingProvider } from './ports/briefing-provider.ts'

export type AppDependencies = {
  briefingProvider: BriefingProvider
  confidence: v1.BriefingConfidence
}

export function createApp(dependencies: AppDependencies) {
  const app = new Hono()

  const { briefingProvider, confidence } = dependencies

  registerBriefingRoute(app, { briefingProvider, confidence })

  return app
}

export function appDeps(): AppDependencies {
  return {
    briefingProvider: createDirectBriefingProvider(),
    confidence: readBriefingConfidence(process.env.BRIEFING_CONFIDENCE),
  }
}

// Ops flag for the season gap (see docs/contract-runbook.md): `unverified`
// puts every client behind an advisory banner. A typo must fail the deploy
// loudly, not silently read as `verified`.
export function readBriefingConfidence(value: string | undefined): v1.BriefingConfidence {
  if (value === undefined || value === 'verified') return 'verified'
  if (value === 'unverified') return 'unverified'
  throw new Error(`Invalid BRIEFING_CONFIDENCE value: ${JSON.stringify(value)}`)
}
