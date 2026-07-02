// CLEANUP(stage-4): legacy `/api/v1/weekly` wire error vocabulary — delete with the endpoint (ADR 0001).
import {
  type AppFailureReason,
  buildErrorBody,
  type PublicErrorStatus,
  resolveReason,
  STATUS_BY_REASON,
  type WirePresentation,
} from '../errors.ts'
import type { WeeklyErrorResponse } from './wire.ts'

const WEEKLY_PRESENTATION: Record<AppFailureReason, WirePresentation<WeeklyErrorResponse['code']>> = {
  UPSTREAM_UNAVAILABLE: { code: 'UPSTREAM_UNAVAILABLE', message: 'Upstream deep dive data is currently unavailable.' },
  GENERATOR_UNAVAILABLE: { code: 'WEEKLY_DATA_UNAVAILABLE', message: 'Weekly mission data is currently unavailable.' },
  INVALID_RESPONSE_PAYLOAD: { code: 'INVALID_RESPONSE_PAYLOAD', message: 'The weekly response payload is invalid.' },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
}

export type WeeklyPublicErrorResponse = {
  status: PublicErrorStatus
  body: WeeklyErrorResponse
}

export function toWeeklyErrorResponse(error: unknown, requestId?: string): WeeklyPublicErrorResponse {
  const reason = resolveReason(error)
  const { code, message } = WEEKLY_PRESENTATION[reason]

  return {
    status: STATUS_BY_REASON[reason],
    body: buildErrorBody(code, message, requestId),
  }
}
