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

export async function openDataCache(): Promise<Cache | null> {
  return isCacheStorageAvailable() ? caches.open(dataCacheName) : null
}

// Activation sweep: drops superseded data-cache versions, keeping the live store.
export async function clearStaleDataCaches(): Promise<void> {
  if (!isCacheStorageAvailable()) return

  const cacheKeys = await caches.keys()
  const staleCaches = cacheKeys.filter(
    (cacheName) => cacheName.startsWith(dataCachePrefix) && cacheName !== dataCacheName,
  )

  await Promise.all(staleCaches.map((cacheName) => caches.delete(cacheName)))
}

function isCacheStorageAvailable(): boolean {
  return typeof caches !== 'undefined'
}
