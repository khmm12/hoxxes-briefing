import type { ApiV1WeeklyResponse } from '@hoxxes-briefing/contracts/api/v1'
import { parseApiV1WeeklyResponse } from '@hoxxes-briefing/contracts/api/v1'

export const weeklySnapshotCacheSchemaVersion = 1
export const weeklySnapshotCachePrefix = 'hoxxes-briefing-weekly-cache-v'
export const weeklySnapshotCacheName = `${weeklySnapshotCachePrefix}${weeklySnapshotCacheSchemaVersion}`
export const weeklySnapshotRequestUrl = '/api/v1/weekly'

type WeeklySnapshotCacheEnvelope = {
  schemaVersion: number
  payload: ApiV1WeeklyResponse
}

export type CachedWeeklySnapshot = ApiV1WeeklyResponse

export async function readCachedWeeklySnapshot(
  request: RequestInfo | URL = weeklySnapshotRequestUrl,
): Promise<CachedWeeklySnapshot | null> {
  const cache = await getWeeklySnapshotCache()

  if (cache == null) {
    return null
  }

  const cacheKey = getWeeklySnapshotCacheKey(request)
  const response = await cache.match(cacheKey)

  if (response == null) {
    return null
  }

  try {
    const payload = parseWeeklyCachePayload(await response.json())

    return payload
  } catch {
    await clearCachedWeeklySnapshot(request)
    return null
  }
}

export async function writeCachedWeeklySnapshot(
  snapshot: ApiV1WeeklyResponse,
  request: RequestInfo | URL = weeklySnapshotRequestUrl,
) {
  const cache = await getWeeklySnapshotCache()

  if (cache == null) {
    return
  }

  const cacheKey = getWeeklySnapshotCacheKey(request)
  const response = new Response(
    JSON.stringify({
      schemaVersion: weeklySnapshotCacheSchemaVersion,
      payload: snapshot,
    } satisfies WeeklySnapshotCacheEnvelope),
    { headers: { 'content-type': 'application/json' } },
  )

  await cache.put(cacheKey, response)
}

export async function clearCachedWeeklySnapshot(request: RequestInfo | URL = weeklySnapshotRequestUrl) {
  const cache = await getWeeklySnapshotCache()

  if (cache == null) {
    return
  }

  await cache.delete(getWeeklySnapshotCacheKey(request))
}

function getWeeklySnapshotCacheKey(request: RequestInfo | URL) {
  try {
    const url = new URL(String(request), 'https://local.dev')
    return `${url.pathname}${url.search}`
  } catch {
    return weeklySnapshotRequestUrl
  }
}

function parseWeeklyCachePayload(payload: unknown): ApiV1WeeklyResponse {
  if (typeof payload !== 'object' || payload == null) {
    throw new Error('Invalid weekly snapshot cache payload.')
  }

  const { schemaVersion, payload: responsePayload } = payload as {
    schemaVersion?: unknown
    payload?: unknown
  }

  if (schemaVersion !== weeklySnapshotCacheSchemaVersion || responsePayload == null) {
    throw new Error('Unsupported weekly snapshot cache schema.')
  }

  return parseApiV1WeeklyResponse(responsePayload)
}

async function getWeeklySnapshotCache() {
  if (!isCacheStorageAvailable()) {
    return null
  }

  return caches.open(weeklySnapshotCacheName)
}

function isCacheStorageAvailable() {
  return typeof caches !== 'undefined'
}
