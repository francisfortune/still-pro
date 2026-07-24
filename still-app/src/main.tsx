import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// ─── Service Worker Registration ──────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — could show a "Update available" toast
            console.log('[STILL] New version available');
          }
        });
      });

      console.log('[STILL] Service Worker registered:', reg.scope);
    } catch (err) {
      console.warn('[STILL] Service Worker registration failed:', err);
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
