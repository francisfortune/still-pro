/**
 * STILL — Notification Manager
 * Handles Web Push Notifications + SW-scheduled reminders
 * Works on desktop Chrome, Android Chrome, iOS Safari 16.4+ (PWA mode)
 */

export type NotificationPermission = 'default' | 'granted' | 'denied';

/** Request notification permission from the user */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result as NotificationPermission;
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission as NotificationPermission;
}

/** Show an immediate notification (foreground or background) */
export async function showNotification(title: string, options: NotificationOptions = {}) {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') return false;

  const reg = await getSWRegistration();
  if (reg) {
    await reg.showNotification(title, {
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: 'still',
      renotify: true,
      ...options,
    });
  } else {
    new Notification(title, { icon: '/icon-192.png', ...options });
  }
  return true;
}

/**
 * Schedule a "Still [intention]?" reminder via the service worker.
 * The SW keeps the timer alive even when the tab is backgrounded.
 */
export async function scheduleReminder(params: {
  id: string;
  delayMs: number;
  intention: string;
}) {
  const reg = await getSWRegistration();
  if (!reg?.active) return false;
  reg.active.postMessage({
    type: 'SCHEDULE_REMINDER',
    id: params.id,
    delayMs: params.delayMs,
    intention: params.intention,
  });
  return true;
}

/** Cancel a previously scheduled SW reminder */
export async function cancelReminder(id: string) {
  const reg = await getSWRegistration();
  if (!reg?.active) return;
  reg.active.postMessage({ type: 'CANCEL_REMINDER', id });
}

/** Cancel all STILL reminders */
export async function cancelAllReminders() {
  await cancelReminder('session-check');
  await cancelReminder('break-end');
}

/** Listen for messages from the SW (e.g. user clicked "Go to break" on notification) */
export function onSWMessage(handler: (msg: { type: string; [k: string]: unknown }) => void) {
  if (!navigator.serviceWorker) return () => {};
  const listener = (event: MessageEvent) => {
    if (event.data?.type) handler(event.data);
  };
  navigator.serviceWorker.addEventListener('message', listener);
  return () => navigator.serviceWorker.removeEventListener('message', listener);
}

async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return (await navigator.serviceWorker.ready) ?? null;
  } catch {
    return null;
  }
}
