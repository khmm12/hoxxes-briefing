import type { Hono } from 'hono'
import { getCurrentDeepDives } from '../../application/getCurrentDeepDives.ts'
import type { DeepDivesProvider } from '../../ports/deepDivesProvider.ts'
import { InvalidResponsePayloadError, toPublicErrorResponse } from '../errors.ts'
import { mapCurrentDeepDivesToWeeklyResponse } from '../mapWeeklyResponse.ts'

export type WeeklyRouteDependencies = {
  deepDivesProvider: DeepDivesProvider
}

export const registerWeeklyRoute = (app: Hono, dependencies: WeeklyRouteDependencies): void => {
  app.get('/api/v1/weekly', async (context) => {
    try {
      const currentDeepDives = await getCurrentDeepDives(dependencies.deepDivesProvider)

      try {
        return context.json(mapCurrentDeepDivesToWeeklyResponse(currentDeepDives))
      } catch (cause) {
        throw new InvalidResponsePayloadError('Failed to map current deep dives to API response', { cause })
      }
    } catch (error) {
      const { status, body } = toPublicErrorResponse(error, context.req.header('x-request-id'))
      return context.json(body, status)
    }
  })
}
