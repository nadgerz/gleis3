// TranslatTannoy Service Worker
// Handles offline caching and (future) push notifications

const CACHE = 'translattannoy-v1';
const ASSETS = ['/', '/index.html', '/announcements.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Future: real push notifications from server
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification('TranslatTannoy', {
      body: data.message || 'New announcement',
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      tag: data.id || 'announcement',
      data: data,
    })
  );
});
