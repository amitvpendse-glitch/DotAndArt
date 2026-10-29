const CACHE_NAME = 'dot-and-art-pwa-v5';
const RUNTIME_CACHE = 'dot-and-art-runtime-v5';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install stage: cache core static assets and skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate stage: clean up old caches immediately and claim clients
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[SW] Purging outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch stage:
// 1. Pass development / Vite / source code requests DIRECTLY to the network (never cache dev scripts)
// 2. Cache-first for physical artwork images and fonts
// 3. Network-first with fast timeout for API data
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL: NEVER intercept or cache Vite / development / code bundle files
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@fs/') ||
    url.pathname.startsWith('/@id/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.jsx') ||
    url.pathname.includes('?import') ||
    url.pathname.includes('?v=')
  ) {
    return; // Pass directly to network
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests unless Google Fonts
  if (url.origin !== location.origin && !url.origin.includes('fonts.googleapis.com') && !url.origin.includes('fonts.gstatic.com')) {
    return;
  }

  // API / JSON data requests: Network only
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Static artwork images & fonts: Cache first with network fallback
  const isImageOrFont =
    url.pathname.startsWith('/static/assets/images/') ||
    url.pathname.startsWith('/uploads/') ||
    /\.(png|jpg|jpeg|webp|svg|gif|ico|woff|woff2|ttf|eot)$/i.test(url.pathname);

  if (isImageOrFont) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.match(url.pathname).then((pathMatch) => {
          if (pathMatch) {
            return pathMatch;
          }
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache).catch(() => {});
                cache.put(url.pathname, responseToCache.clone()).catch(() => {});
              });
            }
            return response;
          }).catch(() => {
            return new Response('', { status: 404 });
          });
        });
      })
    );
    return;
  }

  // Navigation requests: Network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }
});
