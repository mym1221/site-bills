const CACHE = 'site-bills-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon.png', './logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return; // never intercept POSTs to Apps Script

  // For the app page itself: always try the network first, so updates show
  // immediately. Only fall back to the cached copy if there's no connection.
  if (e.request.mode === 'navigate' || e.request.url.includes('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // For other static files (icons, manifest): cache-first is fine.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => cached))
  );
});
