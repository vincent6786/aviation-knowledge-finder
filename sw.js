const CACHE_NAME = 'flight-bag-v4'; // Bump to v3 to force update!
const ASSETS = [
    './',
    './index.html',      // Matches your new file name
    './manifest.json',   // Matches your new manifest
    'https://raw.githubusercontent.com/vincent6786/aviation-knowledge-finder/main/Appicon.png'
];

// 1. INSTALL: Cache static assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force active immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log(' caching assets...');
            return cache.addAll(ASSETS);
        })
    );
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    return self.clients.claim(); 
});

// 3. FETCH: Network First strategy
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Return if invalid
                if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                    return response;
                }

                // Cache the fresh copy
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });

                return response;
            })
            .catch(() => {
                // If offline, return cached
                return caches.match(event.request);
            })
    );
});
