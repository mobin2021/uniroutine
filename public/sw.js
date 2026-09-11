// UniRoutine - Offline-First Service Worker Cache
const CACHE_NAME = 'uniroutine-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/api/routines'
];

// Install Event: Pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[UniRoutine SW] Caching app shell and routine data...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('Pre-cache error: ', err));
    })
  );
  self.skipWaiting();
});

// Activate Event: Clear old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Stale-While-Revalidate Strategy (Serves instant cache, updates in background)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached offline fallback if network is dead
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
