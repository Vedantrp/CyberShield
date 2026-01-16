const CACHE_NAME = "cybershield-cache-v4"; // Bump version to force update
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
    // Force new service worker to install immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching app shell...");
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener("activate", event => {
    // Claim clients immediately so the new SW controls the page without reload
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(keys => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
                );
            })
        ])
    );
});

self.addEventListener("fetch", event => {
    // 1. Network-First for HTML pages (Ensures fresh content on reload)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 2. Ignore Firebase/External APIs
    if (event.request.url.includes("firebase") || event.request.url.includes("googleapis")) {
        return;
    }

    // 3. Stale-While-Revalidate for other assets (CSS/JS)
    // Returns cache immediately, but updates it in background for next time
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                const responseToCache = networkResponse.clone(); // Clone immediately
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-reports') {
        console.log("Background Sync triggered: sync-reports");
    }
});

