import { Hono } from 'hono'
import { registerWeeklyRoute } from './http/routes/weekly.ts'
import { createDirectBriefingProvider } from './infrastructure/providers/direct-briefing-provider.ts'
import type { BriefingProvider } from './ports/briefing-provider.ts'

export type AppDependencies = {
  briefingProvider: BriefingProvider
}

export function createApp(dependencies: AppDependencies) {
  const app = new Hono()

  const { briefingProvider } = dependencies

  registerWeeklyRoute(app, { briefingProvider })

  return app
}

export function appDeps(): AppDependencies {
  return {
    briefingProvider: createDirectBriefingProvider(),
  }
}
