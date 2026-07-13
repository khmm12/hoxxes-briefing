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
  const denylist = [
    // Server-side concerns the SPA shell must never stand in for.
    /^\/api\//,
    // Public files served from the dist root (favicon.ico, robots.txt, sitemap.xml,
    // og-image.png, the search-console verification page). A direct navigation to one
    // must yield the file, not the app shell — so exclude any request whose last path
    // segment carries a file extension. App routes ("/", "/__playground/…") are
    // extensionless, so this never swallows a real navigation.
    /\/[^/?]+\.[^/]+$/,
  ]
  registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist }))
}
