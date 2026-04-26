import * as v from 'valibot'

export const publicErrorCodeSchema = v.picklist([
  'UPSTREAM_UNAVAILABLE',
  'WEEKLY_DATA_UNAVAILABLE',
  'INVALID_RESPONSE_PAYLOAD',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
] as const)

export const publicErrorSchema = v.object({
  code: publicErrorCodeSchema,
  message: v.pipe(v.string(), v.minLength(1)),
  requestId: v.optional(v.string()),
})

export type PublicErrorCode = v.InferOutput<typeof publicErrorCodeSchema>
export type PublicError = v.InferOutput<typeof publicErrorSchema>
