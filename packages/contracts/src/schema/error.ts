import * as v from 'valibot'

export const publicErrorCodeSchema = /* @__PURE__ */ v.picklist([
  'UPSTREAM_UNAVAILABLE',
  'BRIEFING_DATA_UNAVAILABLE',
  'INVALID_RESPONSE_PAYLOAD',
  'CONTRACT_RETIRED',
  'INTERNAL_ERROR',
] as const)

export const publicErrorSchema = /* @__PURE__ */ v.pipe(
  v.object({
    code: publicErrorCodeSchema,
    message: v.pipe(v.string(), v.minLength(1)),
    requestId: v.optional(v.string()),
  }),
  v.readonly(),
)

export type PublicErrorCode = v.InferOutput<typeof publicErrorCodeSchema>
export type PublicError = v.InferOutput<typeof publicErrorSchema>
