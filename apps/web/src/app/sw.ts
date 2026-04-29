/// <reference lib="webworker" />
/// <reference types="vite/client" />

declare const self: ServiceWorkerGlobalScope

import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { weeklySnapshotCacheName, weeklySnapshotCachePrefix } from '~/shared/api/weekly/weekly-client-cache'

// clean old assets
cleanupOutdatedCaches()

// precache assets
precacheAndRoute(self.__WB_MANIFEST ?? [])

// subscribe to update event
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// cleanup api cache
self.addEventListener('activate', (event) => {
  event.waitUntil(removeOldWeeklyDataCaches())
})

// redirect to index.html
if (import.meta.env.PROD || import.meta.env.MODE === 'test') {
  // to allow work offline
  const denylist = [/^\/api\//]
  registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist }))
}

// precache google fonts
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
        maxAgeSeconds: 60 * 60 * 24 * 365, // 30 days
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
