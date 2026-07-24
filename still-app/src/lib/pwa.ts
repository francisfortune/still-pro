/**
 * STILL — PWA Install Manager
 * Captures beforeinstallprompt, exposes install() and isInstallable()
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(installable: boolean) => void>();

// Capture the install prompt early
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((fn) => fn(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn(false));
  });
}

/** Returns true if the browser has an install prompt ready */
export function isInstallable(): boolean {
  return deferredPrompt !== null;
}

/** Returns true if the app is already running in standalone (installed) mode */
export function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Subscribe to installability changes */
export function onInstallabilityChange(fn: (installable: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Trigger the native install prompt. Returns outcome or null if not available. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | null> {
  if (!deferredPrompt) return null;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  listeners.forEach((fn) => fn(false));
  return outcome;
}
