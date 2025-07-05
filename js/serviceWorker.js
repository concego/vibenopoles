const CACHE_NAME = 'vibenopoles-cache-v5'; // Nova versão
const FILES_TO_CACHE = [
    '/vibenopoles/',
    '/vibenopoles/index.html',
    '/vibenopoles/settings.html',
    '/vibenopoles/css/styles.css',
    '/vibenopoles/js/main.js',
    '/vibenopoles/js/character.js',
    '/vibenopoles/js/utils.js',
    '/vibenopoles/js/accessibility.js',
    '/vibenopoles/js/farm.js',
    '/vibenopoles/js/trade.js',
    '/vibenopoles/js/inventory.js',
    '/vibenopoles/js/calendar.js',
    '/vibenopoles/js/debugTools.js',
    '/vibenopoles/manifest.json',
    '/vibenopoles/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});