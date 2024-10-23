const CACHE_NAME = "static_cache";
const STATIC_ASSETS = [
    './index.html',               // Use relative paths
    './indexpaco.html',          // Ensure these paths are correct
    './images/Paco_background.png' // Ensure this image exists in the correct location
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
        return response;
    } catch (err) {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(event.request);
    }
}

self.addEventListener('fetch', event => {
    console.log("[SW] fetched");
    event.respondWith(fetchAssets(event));
});
