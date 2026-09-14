// Minimal service worker — its main job right now is just to exist, since a registered
// service worker is one of the requirements browsers check before offering "Add to Home Screen."
// It also caches the app shell so the icon/name/basic shell survive a flaky connection.
// This is intentionally simple — replace with a real caching/update strategy once the app
// has a backend and data that needs proper offline queuing.

const CACHE_NAME = "scorecard-shell-v1";
const SHELL_FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Cache-first for the app shell; everything else (CDN scripts, etc.) just goes to the network.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
