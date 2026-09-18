import { useEffect, useRef } from "react";

import { useToast } from "./use-toast";

/**
 * Geofence-based attendance watchdog.
 *
 * Behaviour
 *   - Polls the device GPS (via `navigator.geolocation.watchPosition`)
 *     while the user is checked in and actively working.
 *   - When the device is OUTSIDE *all* active factory geofences for a
 *     sustained grace period (default 60s, to absorb GPS jitter),
 *     POSTs `action: 'start'` to open a withdrawal. The server
 *     independently re-validates the coordinates against
 *     `factory_locations` and refuses the start if the user is still
 *     inside any allowed radius.
 *   - When the device returns INSIDE any factory radius, POSTs
 *     `action: 'end'` to close the open withdrawal.
 *
 * What this hook deliberately does NOT do
 *   - It does not react to `visibilitychange`, `pagehide`, `blur`, or
 *     network disconnect. Hiding the tab or losing connectivity are
 *     not, by themselves, evidence that the employee physically left
 *     the factory, so they must not flip the user to "منسحب".
 *   - If GPS permission is denied or unavailable, the hook stays
 *     silent — it never opens a withdrawal without a real coordinate.
 */
export interface FactoryGeofence {
  id: number;
  latitude: string | number;
  longitude: string | number;
  allowed_radius: number;
  name?: string;
  name_ar?: string;
}

interface UseAttendanceWatchdogParams {
  enabled: boolean;
  attendanceId: number | null | undefined;
  userId: number | null | undefined;
  factoryLocations?: FactoryGeofence[];
  isWithdrawalOpen?: boolean;
  onWithdrawalChanged?: () => void;
  /** Sustained out-of-range duration before opening a withdrawal. */
  outsideGraceMs?: number;
}

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useAttendanceWatchdog({
  enabled,
  attendanceId,
  userId,
  factoryLocations,
  isWithdrawalOpen = false,
  onWithdrawalChanged,
  outsideGraceMs = 60_000,
}: UseAttendanceWatchdogParams) {
  const { toast } = useToast();
  const isOpenRef = useRef(false);
  const inFlightRef = useRef<Promise<unknown> | null>(null);
  const outsideSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !attendanceId || !userId) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (!factoryLocations || factoryLocations.length === 0) return;

    const fences = factoryLocations
      .map((f) => ({
        lat: Number(f.latitude),
        lng: Number(f.longitude),
        radius: Number(f.allowed_radius) || 500,
      }))
      .filter(
        (f) =>
          Number.isFinite(f.lat) &&
          Number.isFinite(f.lng) &&
          Number.isFinite(f.radius),
      );
    if (fences.length === 0) return;

    let cancelled = false;
    isOpenRef.current = isWithdrawalOpen;

    const callAction = async (
      action: "start" | "end",
      coords?: { lat: number; lng: number; accuracy?: number },
    ): Promise<Response | null> => {
      try {
        const res = await fetch(`/api/attendance/${attendanceId}/withdraw`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action,
            reason: "left_factory_geofence",
            ...(coords
              ? {
                  lat: coords.lat,
                  lng: coords.lng,
                  accuracy: coords.accuracy,
                }
              : {}),
          }),
        });
        if (res.ok) onWithdrawalChanged?.();
        return res;
      } catch (err) {
        console.warn("[attendance-watchdog] action failed", action, err);
        return null;
      }
    };

    const enqueue = async (fn: () => Promise<unknown>) => {
      const prev = inFlightRef.current ?? Promise.resolve();
      const next = prev.then(fn, fn);
      inFlightRef.current = next;
      try {
        await next;
      } finally {
        if (inFlightRef.current === next) inFlightRef.current = null;
      }
    };

    const openWithdrawal = (coords: {
      lat: number;
      lng: number;
      accuracy?: number;
    }) =>
      enqueue(async () => {
        if (cancelled || isOpenRef.current) return;
        isOpenRef.current = true;
        const res = await callAction("start", coords);
        // 409 = server refused (still inside factory / wrong status).
        // Drop the optimistic flag so the next position-update can try again.
        if (!res || !res.ok) {
          isOpenRef.current = false;
        }
      });

    const closeWithdrawal = (coords?: {
      lat: number;
      lng: number;
      accuracy?: number;
    }) =>
      enqueue(async () => {
        if (cancelled || !isOpenRef.current) return;
        isOpenRef.current = false;
        const res = await callAction("end", coords);
        if (res?.ok) {
          try {
            const data = (await res.clone().json()) as {
              durationMinutes?: number;
            };
            if (data?.durationMinutes && data.durationMinutes > 0) {
              toast({
                title: "⚠️",
                description:
                  "تم رصد مغادرتك لنطاق المصنع، تم خصم الوقت تلقائياً • Out-of-geofence detected, time deducted",
                variant: "destructive",
              });
            }
          } catch {}
        }
      });

    const handlePosition = (pos: GeolocationPosition) => {
      if (cancelled) return;
      const { latitude, longitude, accuracy } = pos.coords;
      // Find the nearest fence and decide membership using the GPS
      // accuracy as slack on the allowed radius (same convention the
      // server-side check-in flow uses).
      let nearest = Infinity;
      let inside = false;
      for (const f of fences) {
        const d = haversineMeters(latitude, longitude, f.lat, f.lng);
        if (d < nearest) nearest = d;
        const slack = accuracy && accuracy < 200 ? accuracy : 0;
        if (d <= f.radius + slack) {
          inside = true;
          break;
        }
      }

      const coords = { lat: latitude, lng: longitude, accuracy };

      if (inside) {
        outsideSinceRef.current = null;
        if (isOpenRef.current) void closeWithdrawal(coords);
        return;
      }

      const nowTs = Date.now();
      if (outsideSinceRef.current == null) {
        outsideSinceRef.current = nowTs;
        return;
      }
      if (
        !isOpenRef.current &&
        nowTs - outsideSinceRef.current >= outsideGraceMs
      ) {
        void openWithdrawal(coords);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      // Permission denied / position unavailable / timeout. Reset the
      // outside-grace timer so a future fix doesn't immediately open a
      // withdrawal, and DO NOT change the user's status. A missing GPS
      // signal is not proof that the user left the factory.
      outsideSinceRef.current = null;
      console.warn(
        "[attendance-watchdog] geolocation error",
        err.code,
        err.message,
      );
    };

    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 30_000,
      },
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
      outsideSinceRef.current = null;
    };
  }, [
    enabled,
    attendanceId,
    userId,
    factoryLocations,
    isWithdrawalOpen,
    outsideGraceMs,
    toast,
    onWithdrawalChanged,
  ]);
}
