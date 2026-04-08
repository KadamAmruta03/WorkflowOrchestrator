import { useEffect } from 'react';

export const APP_REFRESH_EVENT = 'app:refresh';

export function emitAppRefresh() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(APP_REFRESH_EVENT));
}

export function useAppRefresh(callback) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (typeof callback !== 'function') return undefined;

    const handler = () => {
      try {
        callback();
      } catch {
        // ignore
      }
    };

    window.addEventListener(APP_REFRESH_EVENT, handler);
    return () => window.removeEventListener(APP_REFRESH_EVENT, handler);
  }, [callback]);
}

