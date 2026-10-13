const CACHE_NAME = 'supercar-legends-v28'; // Bump this on every change so tablets pick up the new version
const CACHE_PREFIX = CACHE_NAME.replace(/\d+$/, ''); // Only delete this app's own old caches: every app on richardbrb9-coder.github.io shares the same cache storage

// The car list and picture credits, so every photo can be saved for offline use.
importScripts('cars.js', 'credits.js', 'people-credits.js');

// Everything is stored inside the app (no CDNs), and all addresses are relative so it works in a GitHub Pages subfolder.
const CORE_FILES = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './cars.js',
    './history.js',
    './people.js',
    './people-credits.js',
    './motorsport.js',
    './stories.js',
    './games.js',
    './builder.js',
    './carmodel.js',
    './race.js',
    './scenery.js',
    './effects.js',
    './credits.js',
    './manifest.json',
    './licences/fdl-1.2.txt',
    './icon-192.png',
    './icon-512.png',
    './fonts/orbitron-latin-700-normal.woff2',
    './fonts/orbitron-latin-900-normal.woff2',
    './fonts/russo-one-latin-400-normal.woff2',
    './fonts/exo-2-latin-400-normal.woff2',
    './fonts/exo-2-latin-600-normal.woff2',
    './fonts/exo-2-latin-700-normal.woff2',
    './fonts/exo-2-latin-800-normal.woff2'
];
// three.js for the 3D builder
const LIB_FILES = [
    './textures/asphalt_02_col.webp',
    './textures/asphalt_02_nor.webp',
    './textures/coast_sand_01_col.webp',
    './textures/coast_sand_01_nor.webp',
    './textures/concrete_pavement_col.webp',
    './textures/concrete_pavement_nor.webp',
    './textures/leafy_grass_col.webp',
    './textures/leafy_grass_nor.webp',
    './skies/day.webp',
    './skies/sunset.webp',
    './skies/night.webp',
    './trees/fir_a.webp',
    './trees/fir_b.webp',
    './trees/round.webp',
    './trees/slim.webp',
    './trees/bush_a.webp',
    './trees/bush_b.webp',
    './standdata.js',
    './stands/crowd_1.webp',
    './stands/crowd_2.webp',
    './stands/crowd_3.webp',

    './lib/three.module.min.js',
    './lib/three.core.min.js',
    './lib/addons/OrbitControls.js',
    './lib/addons/RoomEnvironment.js'
];
const CAR_PICTURES = Object.keys(IMAGE_CREDITS).map((id) => `./car-images/${id}.webp`)
    .concat(Object.keys(PEOPLE_CREDITS).map((id) => `./people-images/${id}.webp`));

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // cache: 'reload' skips the browser's own short-term cache, so a new version never saves an older file
            const fresh = (url) => new Request(url, { cache: 'reload' });
            await cache.addAll(CORE_FILES.map(fresh)); // the app can't work without these, so install fails if they fail
            // Pictures and libraries are saved one by one, so a single missing file doesn't stop the install.
            // Any that fail (for example on a patchy connection) get two more tries.
            let todo = [...LIB_FILES, ...CAR_PICTURES];
            for (let attempt = 0; attempt < 3 && todo.length; attempt++) {
                const results = await Promise.allSettled(todo.map((url) => cache.add(fresh(url))));
                todo = todo.filter((url, i) => results[i].status === 'rejected');
            }
        })
    );
});

// Delete old caches so the tablet actually updates
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME && n.startsWith(CACHE_PREFIX)).map((n) => caches.delete(n))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith('http') || event.request.method !== 'GET') return;
    event.respondWith(
        // Only this version's cache is used, so old and new files are never mixed
        caches.open(CACHE_NAME).then((cache) => cache.match(event.request, { ignoreSearch: true })).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response.ok && new URL(event.request.url).origin === self.location.origin) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                }
                return response;
            }).catch(() => (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
        })
    );
});
