import * as v from 'valibot'
import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import { type Briefing, briefingUrl } from './briefing-client'
import { openDataCache } from './data-cache'

// Private storage-format version of the briefing envelope below — bump on
// envelope shape changes. Not to be confused with the wire CONTRACT_REV.
const briefingEnvelopeVersion = 1

// `contractRev` is the wire revision the payload was written under (ADR 0002).
// A revision mismatch fails the parse, so the read path drops the entry
// instead of trusting a structural parse to catch semantic drift.
const briefingCacheEnvelopeSchema = /* @__PURE__ */ v.object({
  schemaVersion: v.literal(briefingEnvelopeVersion),
  contractRev: v.literal(v1.CONTRACT_REV),
  payload: v1.briefingResponseSchema,
})

export async function readCachedBriefing(request: RequestInfo | URL = briefingUrl): Promise<Briefing | null> {
  const cache = await openDataCache()

  const cacheKey = getBriefingCacheKey(request)
  const response = await cache?.match(cacheKey)
  if (response == null) return null

  try {
    return parseBriefingCachePayload(await response.json())
  } catch {
    // Best-effort eviction: if the delete itself fails (storage error), the
    // read must still report a miss — the stale entry dies on a later sweep.
    await clearCachedBriefing(request).catch(() => undefined)
    return null
  }
}

export async function cacheBriefing(briefing: v1.BriefingResponse, request: RequestInfo | URL = briefingUrl) {
  const cache = await openDataCache()

  await cache?.put(
    getBriefingCacheKey(request),
    new Response(serializeBriefingCachePayload(briefing), { headers: { 'content-type': 'application/json' } }),
  )
}

export async function clearCachedBriefing(request: RequestInfo | URL = briefingUrl) {
  const cache = await openDataCache()
  await cache?.delete(getBriefingCacheKey(request))
}

function getBriefingCacheKey(request: RequestInfo | URL) {
  try {
    const url = new URL(String(request), 'https://local.dev')
    return `${url.pathname}${url.search}`
  } catch {
    return briefingUrl
  }
}

function parseBriefingCachePayload(payload: unknown): v1.BriefingResponse {
  return v.parse(briefingCacheEnvelopeSchema, payload).payload
}

function serializeBriefingCachePayload(payload: v1.BriefingResponse): string {
  return JSON.stringify({
    schemaVersion: briefingEnvelopeVersion,
    contractRev: v1.CONTRACT_REV,
    payload,
  } satisfies v.InferOutput<typeof briefingCacheEnvelopeSchema>)
}
