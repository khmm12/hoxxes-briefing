import { Hono } from 'hono'
import { registerWeeklyRoute } from './http/routes/weekly.ts'
import { createDirectDeepDivesProvider } from './infrastructure/providers/direct-deep-dives-provider.ts'
import type { DeepDivesProvider } from './ports/deep-dives-provider.ts'

export type AppDependencies = {
  deepDivesProvider?: DeepDivesProvider
}

export const createApp = (dependencies: AppDependencies = {}) => {
  const app = new Hono()
  const deepDivesProvider = dependencies.deepDivesProvider ?? createDirectDeepDivesProvider()

  registerWeeklyRoute(app, { deepDivesProvider })

  return app
}

export const app = createApp()
