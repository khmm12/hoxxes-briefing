import type { Context, Hono } from 'hono'
import { getBriefing } from '../../application/get-briefing.ts'
import type { BriefingProvider } from '../../ports/briefing-provider.ts'
import { InvalidResponsePayloadError, toPublicErrorResponse } from '../errors.ts'
import { mapBriefingToWeeklyResponse } from '../map-briefing-to-weekly-response.ts'
import { createWeeklyErrorCacheHeaders, createWeeklySuccessCacheHeaders } from '../weekly-cache-headers.ts'

export type WeeklyRouteDependencies = {
  briefingProvider: BriefingProvider
}

export function registerWeeklyRoute(app: Hono, dependencies: WeeklyRouteDependencies): void {
  app.get('/api/v1/weekly', async (context) => {
    try {
      const briefing = await getBriefing(dependencies.briefingProvider)

      try {
        const responsePayload = mapBriefingToWeeklyResponse(briefing)
        applyHeaders(context, createWeeklySuccessCacheHeaders(responsePayload.week.expiration))

        return context.json(responsePayload)
      } catch (cause) {
        throw new InvalidResponsePayloadError('Failed to map briefing to weekly response', { cause })
      }
    } catch (error) {
      const { status, body } = toPublicErrorResponse(error, context.req.header('x-request-id'))
      applyHeaders(context, createWeeklyErrorCacheHeaders())

      return context.json(body, status)
    }
  })
}

function applyHeaders(context: Context, headers: Record<string, string>): void {
  for (const [name, value] of Object.entries(headers)) context.header(name, value)
}
