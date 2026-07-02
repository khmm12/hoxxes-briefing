import { Hono } from 'hono'
import { registerBriefingRoute } from './http/routes/briefing.ts'
import { registerWeeklyRoute } from './http/routes/weekly.ts'
import { createDirectBriefingProvider } from './infrastructure/providers/direct-briefing-provider.ts'
import type { BriefingProvider } from './ports/briefing-provider.ts'

export type AppDependencies = {
  briefingProvider: BriefingProvider
}

export function createApp(dependencies: AppDependencies) {
  const app = new Hono()

  const { briefingProvider } = dependencies

  registerBriefingRoute(app, { briefingProvider })
  // CLEANUP(stage-4): drop the legacy /api/v1/weekly route and its import above.
  registerWeeklyRoute(app, { briefingProvider })

  return app
}

export function appDeps(): AppDependencies {
  return {
    briefingProvider: createDirectBriefingProvider(),
  }
}
