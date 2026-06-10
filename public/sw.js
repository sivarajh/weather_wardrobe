// Weather Wardrobe service worker: enables PWA install and notification
// display. Keeps caching minimal — network-first with an offline fallback
// for navigations so dev hot-reload and hashed bundles stay fresh.
const CACHE = "weather-wardrobe-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const open = clients.find((c) => "focus" in c);
        if (open) return open.focus();
        return self.clients.openWindow("./");
      })
  );
});
