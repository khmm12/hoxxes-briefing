import type * as v1 from '@hoxxes-briefing/contracts/api/v1'
import {
  type AppFailureReason,
  buildErrorBody,
  type PublicErrorStatus,
  resolveReason,
  STATUS_BY_REASON,
  type WirePresentation,
} from '../errors.ts'

// Clean `/api/v1/briefing` wire vocabulary (domain == wire).
const BRIEFING_PRESENTATION: Record<AppFailureReason, WirePresentation<v1.ErrorResponse['code']>> = {
  UPSTREAM_UNAVAILABLE: { code: 'UPSTREAM_UNAVAILABLE', message: 'Upstream deep dive data is currently unavailable.' },
  GENERATOR_UNAVAILABLE: { code: 'BRIEFING_DATA_UNAVAILABLE', message: 'Briefing data is currently unavailable.' },
  INVALID_RESPONSE_PAYLOAD: { code: 'INVALID_RESPONSE_PAYLOAD', message: 'The briefing response payload is invalid.' },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
}

export type BriefingErrorResponse = {
  status: PublicErrorStatus
  body: v1.ErrorResponse
}

export function toBriefingErrorResponse(error: unknown, requestId?: string): BriefingErrorResponse {
  const reason = resolveReason(error)
  const { code, message } = BRIEFING_PRESENTATION[reason]

  return {
    status: STATUS_BY_REASON[reason],
    body: buildErrorBody(code, message, requestId),
  }
}
