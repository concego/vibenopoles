const CACHE_NAME = 'vibenopoles-cache-v1';
const FILES_TO_CACHE = [
    '/vibenopoles/',
    '/vibenopoles/index.html',
    '/vibenopoles/settings.html',
    '/vibenopoles/manifest.json',
    '/vibenopoles/css/styles.css',
    '/vibenopoles/js/main.js',
    '/vibenopoles/js/character.js',
    '/vibenopoles/js/family.js',
    '/vibenopoles/js/npcs.js',
    '/vibenopoles/js/locations.js',
    '/vibenopoles/js/calendar.js',
    '/vibenopoles/js/education.js',
    '/vibenopoles/js/relationships.js',
    '/vibenopoles/js/farm.js',
    '/vibenopoles/js/home.js',
    '/vibenopoles/js/events.js',
    '/vibenopoles/js/cutscenes.js',
    '/vibenopoles/js/dialogues.js',
    '/vibenopoles/js/missions.js',
    '/vibenopoles/js/trade.js',
    '/vibenopoles/js/achievements.js',
    '/vibenopoles/js/utils.js',
    '/vibenopoles/js/accessibility.js',
    '/vibenopoles/js/settings.js',
    '/vibenopoles/data/styles.json',
    '/vibenopoles/data/npcs.json',
    '/vibenopoles/data/locations.json',
    '/vibenopoles/data/events.json',
    '/vibenopoles/data/missions.json',
    '/vibenopoles/data/achievements.json',
    '/vibenopoles/icons/icon-192x192.png',
    '/vibenopoles/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});
