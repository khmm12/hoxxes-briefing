import type { BriefingProviderFailureKind } from '../ports/briefing-provider.ts'
import { BriefingProviderError } from '../ports/briefing-provider.ts'

// App-level failure taxonomy: clean, endpoint-agnostic reasons. Each HTTP
// endpoint presents them as its own wire `code`/`message` (see the
// presentation tables in `briefing/errors.ts` and `weekly/errors.ts`).
export type AppFailureReason = BriefingProviderFailureKind | 'INVALID_RESPONSE_PAYLOAD' | 'INTERNAL_ERROR'

export type PublicErrorStatus = 500 | 502 | 503

export type WirePresentation<Code extends string> = {
  code: Code
  message: string
}

export const STATUS_BY_REASON: Record<AppFailureReason, PublicErrorStatus> = {
  UPSTREAM_UNAVAILABLE: 502,
  GENERATOR_UNAVAILABLE: 503,
  INVALID_RESPONSE_PAYLOAD: 500,
  INTERNAL_ERROR: 500,
}

export class InvalidResponsePayloadError extends Error {
  override readonly name = 'InvalidResponsePayloadError'
}

export function resolveReason(error: unknown): AppFailureReason {
  if (error instanceof BriefingProviderError) return error.kind
  if (error instanceof InvalidResponsePayloadError) return 'INVALID_RESPONSE_PAYLOAD'
  return 'INTERNAL_ERROR'
}

export type ErrorBody<Code extends string> = {
  code: Code
  message: string
  requestId?: string
}

export function buildErrorBody<Code extends string>(code: Code, message: string, requestId?: string): ErrorBody<Code> {
  return {
    code,
    message,
    ...(requestId === undefined ? {} : { requestId }),
  }
}
