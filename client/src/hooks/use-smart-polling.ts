import { useEffect, useState } from "react";

/**
 * Returns an active polling interval only when the tab is visible and online.
 * This reduces background traffic and CPU work across polling-heavy pages.
 */
export function useSmartPolling(intervalMs: number): number | false {
  const [isVisible, setIsVisible] = useState(() =>
    typeof document === "undefined" ? true : document.visibilityState !== "hidden",
  );
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState !== "hidden");
    };
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return isVisible && isOnline ? intervalMs : false;
}

