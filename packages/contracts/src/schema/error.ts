import * as v from 'valibot'

export const publicErrorCodeSchema = /* @__PURE__ */ v.picklist([
  'UPSTREAM_UNAVAILABLE',
  // `WEEKLY_DATA_UNAVAILABLE` is the legacy `/api/v1/weekly` wire code; the clean
  // `/api/v1/briefing` endpoint emits `BRIEFING_DATA_UNAVAILABLE`. Both map from
  // the app-level `GENERATOR_UNAVAILABLE` failure. Drop the weekly code at sunset.
  'WEEKLY_DATA_UNAVAILABLE',
  'BRIEFING_DATA_UNAVAILABLE',
  'INVALID_RESPONSE_PAYLOAD',
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
