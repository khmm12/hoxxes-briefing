import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import { DeepDivesProviderError } from '../ports/deep-dives-provider.ts'

type PublicErrorCode = v1.ErrorResponse['code']
type PublicErrorStatus = 429 | 500 | 502 | 503

const ERROR_STATUS_BY_CODE: Record<PublicErrorCode, PublicErrorStatus> = {
  UPSTREAM_UNAVAILABLE: 502,
  WEEKLY_DATA_UNAVAILABLE: 503,
  INVALID_RESPONSE_PAYLOAD: 500,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
}

const ERROR_MESSAGE_BY_CODE: Record<PublicErrorCode, string> = {
  UPSTREAM_UNAVAILABLE: 'Upstream deep dive data is currently unavailable.',
  WEEKLY_DATA_UNAVAILABLE: 'Weekly mission data is currently unavailable.',
  INVALID_RESPONSE_PAYLOAD: 'The weekly response payload is invalid.',
  RATE_LIMITED: 'Rate limit exceeded.',
  INTERNAL_ERROR: 'Internal server error.',
}

export class InvalidResponsePayloadError extends Error {
  override readonly name = 'InvalidResponsePayloadError'
}

export type PublicErrorResponse = {
  status: PublicErrorStatus
  body: v1.ErrorResponse
}

export function toPublicErrorResponse(error: unknown, requestId?: string): PublicErrorResponse {
  let code: PublicErrorCode = 'INTERNAL_ERROR'

  if (error instanceof DeepDivesProviderError) {
    code = error.kind
  } else if (error instanceof InvalidResponsePayloadError) {
    code = 'INVALID_RESPONSE_PAYLOAD'
  }

  return {
    status: ERROR_STATUS_BY_CODE[code],
    body: v1.parseErrorResponse({
      code,
      message: ERROR_MESSAGE_BY_CODE[code],
      ...(requestId === undefined ? {} : { requestId }),
    }),
  }
}
