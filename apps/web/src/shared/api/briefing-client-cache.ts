import * as v from 'valibot'
import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import { type Briefing, briefingUrl } from './briefing-client'

const briefingCacheSchemaVersion = 1
const briefingCachePrefix = 'hoxxes-briefing-data-cache-v'
const briefingCacheName = `${briefingCachePrefix}${briefingCacheSchemaVersion}`

// CLEANUP(stage-4): one-time eviction of retired `/api/v1/weekly` cache residue.
// This is cleanup, not migration — the payload is the incompatible legacy wire
// shape, so we evict it and never read it; a migrated client just refetches the
// briefing. The activation sweep drops it alongside stale briefing caches (see
// `clearStaleBriefingCache`); remove this once legacy clients have cycled.
const legacyWeeklyCachePrefix = 'hoxxes-briefing-weekly-cache-v'

const briefingCacheEnvelopeSchema = /* @__PURE__ */ v.object({
  schemaVersion: v.pipe(v.number(), v.literal(briefingCacheSchemaVersion)),
  payload: v1.briefingResponseSchema,
})

export async function readCachedBriefing(request: RequestInfo | URL = briefingUrl): Promise<Briefing | null> {
  const cache = await getBriefingCache()

  const cacheKey = getBriefingCacheKey(request)
  const response = await cache?.match(cacheKey)
  if (response == null) return null

  try {
    return parseBriefingCachePayload(await response.json())
  } catch {
    await clearCachedBriefing(request)
    return null
  }
}

export async function cacheBriefing(briefing: v1.BriefingResponse, request: RequestInfo | URL = briefingUrl) {
  const cache = await getBriefingCache()

  await cache?.put(
    getBriefingCacheKey(request),
    new Response(serializeBriefingCachePayload(briefing), { headers: { 'content-type': 'application/json' } }),
  )
}

export async function clearCachedBriefing(request: RequestInfo | URL = briefingUrl) {
  const cache = await getBriefingCache()
  await cache?.delete(getBriefingCacheKey(request))
}

export async function clearStaleBriefingCache(): Promise<void> {
  if (!isCacheStorageAvailable()) return

  const cacheKeys = await caches.keys()
  const staleCaches = cacheKeys.filter((cacheName) => {
    if (cacheName.startsWith(legacyWeeklyCachePrefix)) return true
    return cacheName.startsWith(briefingCachePrefix) && cacheName !== briefingCacheName
  })

  await Promise.all(staleCaches.map((cacheName) => caches.delete(cacheName)))
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
    schemaVersion: briefingCacheSchemaVersion,
    payload,
  } satisfies v.InferOutput<typeof briefingCacheEnvelopeSchema>)
}

async function getBriefingCache(): Promise<Cache | null> {
  return isCacheStorageAvailable() ? caches.open(briefingCacheName) : null
}

function isCacheStorageAvailable(): boolean {
  return typeof caches !== 'undefined'
}
