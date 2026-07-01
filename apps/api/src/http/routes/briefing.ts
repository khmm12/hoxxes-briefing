import type { Context, Hono } from 'hono'
import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import { getBriefing } from '../../application/get-briefing.ts'
import type { BriefingProvider } from '../../ports/briefing-provider.ts'
import { createBriefingErrorCacheHeaders, createBriefingSuccessCacheHeaders } from '../briefing-cache-headers.ts'
import { InvalidResponsePayloadError, toBriefingErrorResponse } from '../errors.ts'

export type BriefingRouteDependencies = {
  briefingProvider: BriefingProvider
}

export function registerBriefingRoute(app: Hono, dependencies: BriefingRouteDependencies): void {
  app.get('/api/v1/briefing', async (context) => {
    try {
      const briefing = await getBriefing(dependencies.briefingProvider)

      try {
        // Domain == wire: the Briefing model already matches the briefing
        // contract, so serialization is validate-and-pass-through.
        const responsePayload = v1.parseBriefingResponse(briefing)
        applyHeaders(context, createBriefingSuccessCacheHeaders(responsePayload.expiration))

        return context.json(responsePayload)
      } catch (cause) {
        throw new InvalidResponsePayloadError('Failed to serialize briefing response', { cause })
      }
    } catch (error) {
      const { status, body } = toBriefingErrorResponse(error, context.req.header('x-request-id'))
      applyHeaders(context, createBriefingErrorCacheHeaders())

      return context.json(body, status)
    }
  })
}

function applyHeaders(context: Context, headers: Record<string, string>): void {
  for (const [name, value] of Object.entries(headers)) context.header(name, value)
}
