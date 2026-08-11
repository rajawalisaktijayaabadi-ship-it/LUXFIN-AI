// LUXFIN AI — Production PWA Service Worker
const CACHE_NAME = 'luxfin-pwa-v1.0.4';
const OFFLINE_URL = '/index.html';

// Assets to cache immediately on SW install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install Event - Precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[LUXFIN SW] Precaching app shell & offline assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[LUXFIN SW] Precache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[LUXFIN SW] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for dynamic content, Cache First for static
self.addEventListener('fetch', (event) => {
  // Skip non-GET or cross-origin extension requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests (App Shell fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cached index.html
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/index.html', responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cached offline shell
          return caches.match('/index.html').then((response) => {
            if (response) return response;
            return new Response(
              '<html><body style="background:#0B0D10;color:#F7F6F2;font-family:sans-serif;padding:2rem;text-align:center;"><h2>LUXFIN AI — Mode Offline Active</h2><p>Aplikasi berjalan dalam mode offline. Seluruh data keuangan tersimpan aman secara lokal.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // Handle static assets & dynamic requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset and update cache in background (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            /* Offline ignore */
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback response for image/JSON requests
          if (event.request.headers.get('accept')?.includes('image')) {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#14171E"/><text x="50%" y="50%" fill="#E2B963" dominant-baseline="middle" text-anchor="middle" font-size="12">LUXFIN</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
    })
  );
});

// Listen for messages from client (e.g. Skip Waiting to update SW)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
