import { useEffect, useState } from 'react';

const getOffline = () => {
  return !navigator.onLine;
};

export function useOffline() {
  const [offline, setOffline] = useState(getOffline);

  function handleOfflineStatus() {
    setOffline(!navigator.onLine);
  }

  useEffect(() => {
    window.addEventListener('offline', handleOfflineStatus);
    window.addEventListener('online', handleOfflineStatus);

    return () => {
      window.removeEventListener('offline', handleOfflineStatus);
      window.removeEventListener('online', handleOfflineStatus);
    };
  }, []);

  return offline;
}
