import { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight connectivity hook — pings a known fast URL.
 * Avoids adding @react-native-community/netinfo as a native dep.
 */
const useOnlineStatus = (checkInterval = 15000) => {
  const [isOnline, setIsOnline] = useState(true);

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, checkInterval);
    return () => clearInterval(interval);
  }, [checkConnectivity, checkInterval]);

  return { isOnline, recheckNow: checkConnectivity };
};

export default useOnlineStatus;
