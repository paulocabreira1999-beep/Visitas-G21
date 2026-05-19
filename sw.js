const CACHE = 'g21-visitas-v2';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});

// Handle notification clicks — open the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for (const client of list) {
        if (client.url.includes('github.io') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});

// Allow showing notifications from the SW directly
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || '🐄 G21 Visitas', {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    })
  );
});
