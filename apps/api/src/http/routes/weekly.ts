import type { Context, Hono } from 'hono'
import { getCurrentDeepDives } from '../../application/getCurrentDeepDives.ts'
import type { DeepDivesProvider } from '../../ports/deepDivesProvider.ts'
import { InvalidResponsePayloadError, toPublicErrorResponse } from '../errors.ts'
import { mapCurrentDeepDivesToWeeklyResponse } from '../mapWeeklyResponse.ts'
import { createWeeklyErrorCacheHeaders, createWeeklySuccessCacheHeaders } from '../weeklyCacheHeaders.ts'

export type WeeklyRouteDependencies = {
  deepDivesProvider: DeepDivesProvider
}

export function registerWeeklyRoute(app: Hono, dependencies: WeeklyRouteDependencies): void {
  app.get('/api/v1/weekly', async (context) => {
    try {
      const currentDeepDives = await getCurrentDeepDives(dependencies.deepDivesProvider)

      try {
        const responsePayload = mapCurrentDeepDivesToWeeklyResponse(currentDeepDives)
        applyHeaders(context, createWeeklySuccessCacheHeaders(responsePayload.week.expiration))

        return context.json(responsePayload)
      } catch (cause) {
        throw new InvalidResponsePayloadError('Failed to map current deep dives to API response', { cause })
      }
    } catch (error) {
      const { status, body } = toPublicErrorResponse(error, context.req.header('x-request-id'))
      applyHeaders(context, createWeeklyErrorCacheHeaders())

      return context.json(body, status)
    }
  })
}

function applyHeaders(context: Context, headers: Record<string, string>): void {
  for (const [name, value] of Object.entries(headers)) {
    context.header(name, value)
  }
}
