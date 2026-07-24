/* ─────────────────────────────────────────────────────────────────────────────
   STILL — Service Worker
   Handles: caching, PWA offline support, push notifications, background reminders
───────────────────────────────────────────────────────────────────────────── */

const CACHE_NAME = 'still-v1';
const STATIC_ASSETS = ['/', '/index.html'];

// ─── Install: cache shell ─────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: network-first with cache fallback ────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ─── Push: show notification ──────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'STILL', body: 'Stay with it.' };
  try { data = event.data?.json() ?? data; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'STILL', {
      body: data.body || 'Stay with it.',
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: 'still-reminder',
      renotify: true,
      silent: false,
      data: data,
      actions: [
        { action: 'continue', title: 'Still here' },
        { action: 'break', title: 'Taking a break' },
      ],
    })
  );
});

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const stillClient = clients.find((c) => c.url.includes(self.location.origin));
      if (stillClient) {
        stillClient.focus();
        if (action === 'break') stillClient.postMessage({ type: 'GO_TO_BREAK' });
        return;
      }
      const path = action === 'break' ? '/break' : '/session';
      return self.clients.openWindow(path);
    })
  );
});

// ─── Message: schedule in-SW alarm (for devices without Push API) ─────────────
// The client sends { type: 'SCHEDULE_REMINDER', delayMs, intention }
// The SW uses a setTimeout equivalent via setInterval workaround.
const scheduledReminders = new Map();

self.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg) return;

  switch (msg.type) {
    case 'SCHEDULE_REMINDER': {
      const { id, delayMs, intention } = msg;
      if (scheduledReminders.has(id)) clearTimeout(scheduledReminders.get(id));
      const timer = setTimeout(() => {
        self.registration.showNotification('STILL', {
          body: `Still ${intention}?`,
          icon: '/icon-192.png',
          badge: '/icon-96.png',
          tag: `still-check-${id}`,
          renotify: true,
          silent: false,
          actions: [
            { action: 'continue', title: 'Yes, still here' },
            { action: 'distracted', title: 'I got distracted' },
          ],
        });
        scheduledReminders.delete(id);
      }, delayMs);
      scheduledReminders.set(id, timer);
      break;
    }
    case 'CANCEL_REMINDER': {
      if (scheduledReminders.has(msg.id)) {
        clearTimeout(scheduledReminders.get(msg.id));
        scheduledReminders.delete(msg.id);
      }
      break;
    }
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
  }
});
