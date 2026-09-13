// Self-unregistering service worker to cleanly handle leftover service workers on localhost
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister()
  );
});
