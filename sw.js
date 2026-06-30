/* Service Worker — network-first(有網路抓最新,離線用快取) */
var CACHE = "taidong-v2";
var ASSETS = [
  ".",
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

/* network-first:先試網路(取得最新程式),成功就順便更新快取;
   失敗(離線)才回快取;連快取都沒有就回首頁。 */
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(event.request, copy);
        });
        return resp;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match("index.html");
        });
      })
  );
});
