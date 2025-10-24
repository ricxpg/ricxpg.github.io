// Bump this on every deploy to bust old caches
const CACHE = 'checkin-v5';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icons/icon-128.png',   // optional, include only if you have it
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: precache and activate immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// Activate: purge old caches, take control, then refresh all open clients
self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      // delete old caches
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));

      // take control of existing pages
      await self.clients.claim();

      // hard-refresh every open window of this app
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        // This triggers a full navigation reload of the page
        client.navigate(client.url);
      }
    })()
  );
});

// Network: cache-first for precached assets, network fallback
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
