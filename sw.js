const CACHE_NAME = "static_cache";
const STATIC_ASSETS = [
    '/index.html',               // Use relative paths
    '/indexpaco.html',          // Ensure these paths are correct
    '/images/Paco_background.png' // Ensure this image exists in the correct location
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
        
        // Check if the response is OK (status code 200)
        if (!response || !response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return response; // Return the valid response
    } catch (error) {
        console.error('Fetch failed; returning cached response:', error);
        
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        // Return the cached response if it exists; if not, return a default response
        if (cachedResponse) {
            return cachedResponse;
        } else {
            // Create a default response if no cached response is available
            return new Response('Offline', {
                status: 404,
                statusText: 'Not Found'
            });
        }
    }
}


self.addEventListener('fetch', event => {
    console.log("[SW] fetched");
    event.respondWith(fetchAssets(event));
});
