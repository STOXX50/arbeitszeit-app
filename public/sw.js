// Service Worker für Arbeitszeit App
// Version wird automatisch von Workbox gesetzt

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Deklariere __WB_MANIFEST für TypeScript
declare let self: ServiceWorkerGlobalScope
declare const __WB_MANIFEST: any

// Alte Caches automatisch löschen (SW-009)
cleanupOutdatedCaches()

// Precache-Manifest von Workbox verwenden (CACHE-001, CACHE-002, CACHE-005)
precacheAndRoute(__WB_MANIFEST)

// HTML-Seiten: Network First Strategie (CACHE-003, CACHE-010)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Tage (CACHE-008)
      }),
    ],
  })
)

// Statische Assets: Cache First (CACHE-004, CACHE-011)
registerRoute(
  ({ request }) => 
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Tage
      }),
    ],
  })
)

// Google Fonts: Stale While Revalidate (CACHE-012)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || 
              url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 Jahr
      }),
    ],
  })
)

// Fallback für Offline-Seiten (OFFLINE-011)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (params) => {
    try {
      return await new NetworkFirst({
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3,
      }).handle(params)
    } catch (error) {
      return caches.match('/offline') || 
             new Response('Offline - App funktioniert auch ohne Internet!', {
               headers: { 'Content-Type': 'text/html' }
             })
    }
  }
)

// Service Worker Update Handling (SW-006, SW-007, SW-008)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Aktivierung und Cleanup (SW-002)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Alte Caches löschen, die nicht mehr verwendet werden
          if (!cacheName.startsWith('workbox-')) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Error Handling für bessere Debugging (DEV-004)
self.addEventListener('error', (event) => {
  console.error('Service Worker Error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker Unhandled Rejection:', event.reason)
})