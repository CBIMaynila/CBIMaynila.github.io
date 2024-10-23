const CACHE_NAME = "static_cache_v1";
const STATIC_ASSETS = [
    './index.html',
    './indexpaco.html',
    './images/Paco_background.png'
];

async function preCache() {
    const cache = await caches.open(CACHE_NAME);
    try {
        await cache.addAll(STATIC_ASSETS);
        console.log('Assets cached successfully');
    } catch (error) {
        console.error('Failed to cache:', error);
    }
}

self.addEventListener('install', event => {
    console.log("[SW] installed");
    self.skipWaiting();
    event.waitUntil(preCache());
});

async function cleanupCache() {
    const keys = await caches.keys();
    const keysToDelete = keys.map(key => {
        if (key !== CACHE_NAME) {
            return caches.delete(key);
        }
    });
    return Promise.all(keysToDelete);
}

self.addEventListener('activate', event => {
    console.log("[SW] activated");
    event.waitUntil(cleanupCache());
});

async function fetchAssets(event) {
    try {
        const response = await fetch(event.request);
        // If the response is valid, return it
        if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
        }
        return response;
    } catch (err) {
        console.error('Fetch failed; returning cached response:', err);
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        // Return the cached response if available
        return cachedResponse || new Response("Offline", {
            status: 404,
            statusText: "Not Found",
        });
    }
}

self.addEventListener('fetch', event => {
    console.log("[SW] fetched");
    event.respondWith(fetchAssets(event));
});
