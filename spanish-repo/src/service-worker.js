/* Habla Libre — offline cache.
   Bump VERSION on every deploy that changes the cached files. */
var VERSION = "fb-v11";
var ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "retention.js",
  "lessons-core.js",
  "lessons-extras.js",
  "lessons-travel.js",
  "lessons-conv.js",
  "reference-data.js",
  "manifest.webmanifest",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "chess.js",
  "chess-ui.js",
  "privacy.html"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // Firebase/CDN traffic stays on the network
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return caches.match("index.html"); });
    })
  );
});
