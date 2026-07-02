import type { Context, Hono } from 'hono'
import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import { getBriefing } from '../../application/get-briefing.ts'
import type { BriefingProvider } from '../../ports/briefing-provider.ts'
import { MIN_SUPPORTED_REV } from '../contract/min-supported-rev.ts'
import { createContractNegotiation } from '../contract/negotiate.ts'
import { InvalidResponsePayloadError } from '../errors.ts'
import { createBriefingErrorCacheHeaders, createBriefingSuccessCacheHeaders } from './cache-headers.ts'
import { toBriefingErrorResponse } from './errors.ts'

export type BriefingRouteDependencies = {
  briefingProvider: BriefingProvider
  confidence: v1.BriefingConfidence
}

export function registerBriefingRoute(app: Hono, dependencies: BriefingRouteDependencies): void {
  const negotiateContract = createContractNegotiation({
    currentRev: v1.CONTRACT_REV,
    minSupportedRev: MIN_SUPPORTED_REV,
    // Empty until the first transform lands in `../contract/downgrades/`.
    downgrades: {},
  })

  app.get('/api/v1/briefing', negotiateContract, async (context) => {
    try {
      const briefing = await getBriefing(dependencies.briefingProvider)

      try {
        // Domain == wire: the Briefing model already matches the briefing
        // contract; serialization stamps `confidence` (an HTTP-boundary
        // concern, the generator is confidence-ignorant) and passes through.
        const responsePayload = v1.parseBriefingResponse({ ...briefing, confidence: dependencies.confidence })
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
