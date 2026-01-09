const CACHE_NAME = "cybershield-cache-v2";
const ASSETS = [
    "./",
    "./index.html",
    "./dashboard.html",
    "./learn.html",
    "./report.html",
    "./alerts.html",
    "./css/styles.css",
    "./css/skeleton.css",
    "./js/firebase-config.js",
    "./js/data.js",
    "./js/scanner.js",
    "./js/report.js",
    "./js/monitor.js",
    "./js/learn.js",
    "./js/alerts.js",
    "./js/pwa.js",
    "./manifest.json",
    "https://cdn-icons-png.flaticon.com/512/2092/2092663.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching app shell...");
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});


self.addEventListener("fetch", event => {

    if (event.request.url.includes("firebase") || event.request.url.includes("googleapis")) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
self.addEventListener('sync', event => {
    if (event.tag === 'sync-reports') {
        console.log("Background Sync triggered: sync-reports");
    }
});
