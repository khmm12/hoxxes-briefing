import * as v from 'valibot'
import * as v1 from '@hoxxes-briefing/contracts/api/v1'
import { type WeeklySnapshotResult, weeklySnapshotUrl } from './weekly-client'

const weeklySnapshotCacheSchemaVersion = 1
const weeklySnapshotCachePrefix = 'hoxxes-briefing-weekly-cache-v'
const weeklySnapshotCacheName = `${weeklySnapshotCachePrefix}${weeklySnapshotCacheSchemaVersion}`

const snapshotCacheEnvelopeSchema = /* @__PURE__ */ v.object({
  schemaVersion: v.pipe(v.number(), v.literal(weeklySnapshotCacheSchemaVersion)),
  payload: v1.weeklyResponseSchema,
})

export async function readCachedWeeklySnapshot(
  request: RequestInfo | URL = weeklySnapshotUrl,
): Promise<WeeklySnapshotResult | null> {
  const cache = await getWeeklySnapshotCache()

  const cacheKey = getWeeklySnapshotCacheKey(request)
  const response = await cache?.match(cacheKey)
  if (response == null) return null

  try {
    return parseWeeklyCachePayload(await response.json())
  } catch {
    await clearCachedWeeklySnapshot(request)
    return null
  }
}

export async function writeCachedWeeklySnapshot(
  snapshot: v1.WeeklyResponse,
  request: RequestInfo | URL = weeklySnapshotUrl,
) {
  const cache = await getWeeklySnapshotCache()

  await cache?.put(
    getWeeklySnapshotCacheKey(request),
    new Response(serializeWeeklyCachePayload(snapshot), { headers: { 'content-type': 'application/json' } }),
  )
}

export async function clearCachedWeeklySnapshot(request: RequestInfo | URL = weeklySnapshotUrl) {
  const cache = await getWeeklySnapshotCache()
  await cache?.delete(getWeeklySnapshotCacheKey(request))
}

export async function clearStaleWeeklySnapshotCache(): Promise<void> {
  if (!isCacheStorageAvailable()) return

  const cacheKeys = await caches.keys()
  const staleWeeklyDataCaches = cacheKeys.filter((cacheName) => {
    return cacheName.startsWith(weeklySnapshotCachePrefix) && cacheName !== weeklySnapshotCacheName
  })

  await Promise.all(staleWeeklyDataCaches.map((cacheName) => caches.delete(cacheName)))
}

function getWeeklySnapshotCacheKey(request: RequestInfo | URL) {
  try {
    const url = new URL(String(request), 'https://local.dev')
    return `${url.pathname}${url.search}`
  } catch {
    return weeklySnapshotUrl
  }
}

function parseWeeklyCachePayload(payload: unknown): v1.WeeklyResponse {
  return v.parse(snapshotCacheEnvelopeSchema, payload).payload
}

function serializeWeeklyCachePayload(payload: v1.WeeklyResponse): string {
  return JSON.stringify({
    schemaVersion: weeklySnapshotCacheSchemaVersion,
    payload,
  } satisfies v.InferOutput<typeof snapshotCacheEnvelopeSchema>)
}

async function getWeeklySnapshotCache(): Promise<Cache | null> {
  return isCacheStorageAvailable() ? caches.open(weeklySnapshotCacheName) : null
}

function isCacheStorageAvailable(): boolean {
  return typeof caches !== 'undefined'
}
