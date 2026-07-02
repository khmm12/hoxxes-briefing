import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import type { BriefingProviderFailureKind } from '../ports/briefing-provider.ts'
import { BriefingProviderError } from '../ports/briefing-provider.ts'

type PublicErrorCode = v1.ErrorResponse['code']
type PublicErrorStatus = 500 | 502 | 503

// App-level failure taxonomy: clean, endpoint-agnostic reasons. Each HTTP
// endpoint presents them as its own wire `code`/`message` (see presentations).
type AppFailureReason = BriefingProviderFailureKind | 'INVALID_RESPONSE_PAYLOAD' | 'INTERNAL_ERROR'

type WirePresentation = {
  code: PublicErrorCode
  message: string
}

const STATUS_BY_REASON: Record<AppFailureReason, PublicErrorStatus> = {
  UPSTREAM_UNAVAILABLE: 502,
  GENERATOR_UNAVAILABLE: 503,
  INVALID_RESPONSE_PAYLOAD: 500,
  INTERNAL_ERROR: 500,
}

// CLEANUP(stage-4): legacy `/api/v1/weekly` wire vocabulary. Disposable — delete
// with the endpoint at sunset (ADR 0001); also drop `toWeeklyErrorResponse` below.
const WEEKLY_PRESENTATION: Record<AppFailureReason, WirePresentation> = {
  UPSTREAM_UNAVAILABLE: { code: 'UPSTREAM_UNAVAILABLE', message: 'Upstream deep dive data is currently unavailable.' },
  GENERATOR_UNAVAILABLE: { code: 'WEEKLY_DATA_UNAVAILABLE', message: 'Weekly mission data is currently unavailable.' },
  INVALID_RESPONSE_PAYLOAD: { code: 'INVALID_RESPONSE_PAYLOAD', message: 'The weekly response payload is invalid.' },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
}

// Clean `/api/v1/briefing` wire vocabulary (domain == wire).
const BRIEFING_PRESENTATION: Record<AppFailureReason, WirePresentation> = {
  UPSTREAM_UNAVAILABLE: { code: 'UPSTREAM_UNAVAILABLE', message: 'Upstream deep dive data is currently unavailable.' },
  GENERATOR_UNAVAILABLE: { code: 'BRIEFING_DATA_UNAVAILABLE', message: 'Briefing data is currently unavailable.' },
  INVALID_RESPONSE_PAYLOAD: { code: 'INVALID_RESPONSE_PAYLOAD', message: 'The briefing response payload is invalid.' },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
}

export class InvalidResponsePayloadError extends Error {
  override readonly name = 'InvalidResponsePayloadError'
}

export type PublicErrorResponse = {
  status: PublicErrorStatus
  body: v1.ErrorResponse
}

export function toWeeklyErrorResponse(error: unknown, requestId?: string): PublicErrorResponse {
  return buildErrorResponse(resolveReason(error), WEEKLY_PRESENTATION, requestId)
}

export function toBriefingErrorResponse(error: unknown, requestId?: string): PublicErrorResponse {
  return buildErrorResponse(resolveReason(error), BRIEFING_PRESENTATION, requestId)
}

function resolveReason(error: unknown): AppFailureReason {
  if (error instanceof BriefingProviderError) return error.kind
  if (error instanceof InvalidResponsePayloadError) return 'INVALID_RESPONSE_PAYLOAD'
  return 'INTERNAL_ERROR'
}

function buildErrorResponse(
  reason: AppFailureReason,
  presentation: Record<AppFailureReason, WirePresentation>,
  requestId?: string,
): PublicErrorResponse {
  const { code, message } = presentation[reason]

  return {
    status: STATUS_BY_REASON[reason],
    body: v1.parseErrorResponse({
      code,
      message,
      ...(requestId === undefined ? {} : { requestId }),
    }),
  }
}
