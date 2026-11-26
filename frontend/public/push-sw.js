self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const options = {
    body: payload.body,
    icon: payload.icon || '/favicon.ico',
    badge: payload.badge || '/favicon.ico',
    data: payload.data || {},
    vibrate: [100, 50, 100],
    tag: 'icons-' + Date.now(),
    renotify: true,
  };

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const focused = windowClients.find((c) => c.focused);
        if (focused) {
          focused.postMessage({ type: 'PUSH_NOTIFICATION', payload });
          return;
        }
        return self.registration.showNotification(payload.title, options);
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then((c) => c.navigate(url));
          }
        }
        return clients.openWindow(url);
      })
  );
});
