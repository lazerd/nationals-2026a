'use client';

import { useEffect } from 'react';

/**
 * Registers the generated service worker. Everything the program needs is
 * precached on the first visit, so a garage with no signal still works.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support is a bonus; failing to register must not break the app.
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}
