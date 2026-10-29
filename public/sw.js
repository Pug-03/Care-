// CARE+ does not use a service worker. Another app served from the same origin earlier (for example
// a PWA on localhost:3000) may have left one behind that answers /_next/static/* from its cache, which
// serves CARE+ a stale stylesheet. When the browser checks that worker for updates it gets this file
// instead: it clears every cache, unregisters itself and reloads open pages so they load fresh.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
