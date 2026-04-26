/// <reference lib="webworker" />
/// <reference types="vite/client" />

declare const self: ServiceWorkerGlobalScope

import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { weeklySnapshotCacheName, weeklySnapshotCachePrefix } from '~/shared/api/weekly/weekly-client-cache'

precacheAndRoute(self.__WB_MANIFEST ?? [])

// clean old assets
cleanupOutdatedCaches()

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(removeOldWeeklyDataCaches())
})

// in dev mode, we disable precaching to avoid caching issues
const denylist = import.meta.env.DEV ? [/.*/] : [/^\/api\//]

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist }))

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',

    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  }),
)

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',

    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  }),
)

async function removeOldWeeklyDataCaches(): Promise<void> {
  const cacheKeys = await caches.keys()
  const staleWeeklyDataCaches = cacheKeys.filter((cacheName) => {
    return cacheName.startsWith(weeklySnapshotCachePrefix) && cacheName !== weeklySnapshotCacheName
  })

  await Promise.all(staleWeeklyDataCaches.map((cacheName) => caches.delete(cacheName)))
}
