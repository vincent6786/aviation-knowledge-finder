const CACHE_NAME = 'flight-bag-v1';
const ASSETS = [
    './',
    './index.html',
    'https://raw.githubusercontent.com/vincent6786/aviation-knowledge-finder/main/Appicon.png'
];

// 1. INSTALL: Cache the static website files immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// 2. FETCH: Intercept every request (including Google Sheets)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If we are online and fetch succeeds:
                // 1. Clone the response (we need one for the browser, one for the cache)
                const resClone = response.clone();
                
                // 2. Open cache and save this new data for later
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });

                // 3. Give the data to the user
                return response;
            })
            .catch(() => {
                // If we are OFFLINE (fetch failed):
                // Return the cached version we saved earlier
                return caches.match(event.request);
            })
    );
});
