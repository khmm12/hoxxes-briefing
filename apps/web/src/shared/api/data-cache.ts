// The app's CacheStorage-backed data cache (API payloads), as opposed to the
// workbox-managed asset precache. This module owns the storage itself —
// naming, versioning, opening, and the activation sweep; what goes inside an
// entry (envelopes, payload schemas) belongs to the consumers.

// Version of the cache store itself: bump when the storage layout changes in
// a way a sweep-and-refetch should handle (unrelated to the wire CONTRACT_REV
// and to any consumer's envelope format).
const dataCacheVersion = 1
const dataCachePrefix = 'hoxxes-briefing-data-cache-v'
const dataCacheName = `${dataCachePrefix}${dataCacheVersion}`

// CLEANUP(stage-4): one-time eviction of retired `/api/v1/weekly` cache residue.
// This is cleanup, not migration — the payload is the incompatible legacy wire
// shape, so we evict it and never read it; a migrated client just refetches the
// briefing. Remove this once legacy clients have cycled.
const legacyWeeklyCachePrefix = 'hoxxes-briefing-weekly-cache-v'

export async function openDataCache(): Promise<Cache | null> {
  return isCacheStorageAvailable() ? caches.open(dataCacheName) : null
}

// Activation sweep: drops superseded data-cache versions and the retired
// legacy weekly cache, keeping only the live store.
export async function clearStaleDataCaches(): Promise<void> {
  if (!isCacheStorageAvailable()) return

  const cacheKeys = await caches.keys()
  const staleCaches = cacheKeys.filter((cacheName) => {
    if (cacheName.startsWith(legacyWeeklyCachePrefix)) return true
    return cacheName.startsWith(dataCachePrefix) && cacheName !== dataCacheName
  })

  await Promise.all(staleCaches.map((cacheName) => caches.delete(cacheName)))
}

function isCacheStorageAvailable(): boolean {
  return typeof caches !== 'undefined'
}
