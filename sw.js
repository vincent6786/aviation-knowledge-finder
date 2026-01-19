const CACHE_NAME = 'flight-bag-v2'; // Updated to v2 to force refresh
const ASSETS = [
    './',
    './index.html',
    './manifest.json', // Added manifest
    'https://raw.githubusercontent.com/vincent6786/aviation-knowledge-finder/main/Appicon.png'
];

// 1. INSTALL: Cache static assets
self.addEventListener('install', (event) => {
    // Force this SW to become active immediately
    self.skipWaiting(); 
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log(' caching assets...');
            return cache.addAll(ASSETS);
        })
    );
});

// 2. ACTIVATE: Clean up old caches (Crucial for updates)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    // Take control of all pages immediately
    return self.clients.claim(); 
});

// 3. FETCH: Dynamic Caching (Network First, then Cache)
self.addEventListener('fetch', (event) => {
    // Only cache GET requests (ignore POST/PUT etc)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Check for valid response
                if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                    return response;
                }

                // Clone and cache (This enables the Offline Toggles to work!)
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });

                return response;
            })
            .catch(() => {
                // If offline, try to find in cache
                return caches.match(event.request);
            })
    );
});
