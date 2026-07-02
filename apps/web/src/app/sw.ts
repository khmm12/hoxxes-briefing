/// <reference lib="webworker" />
/// <reference types="vite/client" />

declare const self: ServiceWorkerGlobalScope

import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { clearStaleDataCaches } from '~/shared/api'

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
  event.waitUntil(clearStaleDataCaches())
})

// redirect to index.html
if (import.meta.env.PROD || import.meta.env.MODE === 'test') {
  // to allow work offline
  const denylist = [/^\/api\//]
  registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist }))
}
