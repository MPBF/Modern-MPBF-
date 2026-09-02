import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, LogIn, LogOut, Coffee, Play, AlertOctagon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useAttendanceWatchdog,
  type FactoryGeofence,
} from "../../hooks/use-attendance-watchdog";
import { useToday } from "../../hooks/use-today";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AttendanceRecord {
  id: number;
  user_id: number;
  status: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  lunch_start_time?: string | null;
  lunch_end_time?: string | null;
  date: string;
  created_at?: string | null;
}

interface DailyStatus {
  hasCheckedIn?: boolean;
  hasStartedLunch?: boolean;
  hasEndedLunch?: boolean;
  hasCheckedOut?: boolean;
  currentStatus?: string;
  shift_assigned?: boolean;
  assigned_shift?: {
    name_ar?: string | null;
    name_en?: string | null;
    start_time?: string | null;
    end_time?: string | null;
  } | null;
}

interface WithdrawalsResponse {
  withdrawals: Array<{
    id: number;
    started_at: string;
    ended_at?: string | null;
    duration_minutes: number;
    reason?: string;
  }>;
  totalMinutes: number;
  date: string;
}

interface Props {
  userId: number;
  attendanceRecords?: AttendanceRecord[];
  dailyStatus?: DailyStatus;
  isPending: boolean;
  onAction: (status: string, action?: string) => void;
}

function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function formatTime(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AttendancePanel({
  userId,
  attendanceRecords,
  dailyStatus,
  isPending,
  onAction,
}: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [now, setNow] = useState<Date>(new Date());

  // 1-second live ticker drives the HH:MM:SS counter
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const todayStr = useToday(() => {
    // At local midnight rollover, drop yesterday's withdrawal totals and
    // refresh attendance state so live timers reset cleanly without a
    // page refresh.
    void queryClient.invalidateQueries({
      queryKey: ["/api/attendance/withdrawals/today", userId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["/api/attendance/daily-status", userId],
    });
    void queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
  });

  const todayRecords = useMemo(() => {
    return (attendanceRecords || []).filter((r) => {
      if (r.user_id !== userId || !r.date) return false;
      // Drizzle returns `date` columns as either "YYYY-MM-DD" or a full
      // ISO timestamp depending on the driver — normalize before compare.
      const d = String(r.date).slice(0, 10);
      return d === todayStr;
    });
  }, [attendanceRecords, userId, todayStr]);

  // Per-action records. Historic rows may not have the dedicated timestamp
  // columns populated (older bug), so fall back to `created_at` of the row
  // whose status matches the action.
  const pickByStatus = (statuses: string[]) =>
    todayRecords.find((r) => statuses.includes(r.status));

  const checkInRecord =
    todayRecords.find((r) => r.check_in_time) || pickByStatus(["حاضر"]);
  const lunchStartRecord =
    todayRecords.find((r) => r.lunch_start_time) ||
    pickByStatus(["في الاستراحة"]);
  const lunchEndRecord =
    todayRecords.find((r) => r.lunch_end_time) ||
    // "يعمل" is set after ending lunch
    [...todayRecords].reverse().find((r) => r.status === "يعمل");
  const checkOutRecord =
    todayRecords.find((r) => r.check_out_time) || pickByStatus(["مغادر"]);

  // Effective timestamps with `created_at` fallback for historic NULLs.
  const checkInAt =
    checkInRecord?.check_in_time || checkInRecord?.created_at || null;
  const lunchStartAt =
    lunchStartRecord?.lunch_start_time || lunchStartRecord?.created_at || null;
  const lunchEndAt =
    lunchEndRecord?.lunch_end_time || lunchEndRecord?.created_at || null;
  const checkOutAt =
    checkOutRecord?.check_out_time || checkOutRecord?.created_at || null;

  // Watchdog target: latest attendance row of the day by `created_at`.
  // Each user action inserts a new row in this codebase, so the latest
  // row reflects the user's current state. The server only uses this id
  // for the ownership check; it resolves the real current state from
  // the user's full day of rows.
  const activeAttendanceId =
    [...todayRecords].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    })[0]?.id ?? null;

  // Withdrawals query
  const { data: withdrawals, refetch: refetchWithdrawals } =
    useQuery<WithdrawalsResponse>({
      queryKey: ["/api/attendance/withdrawals/today", userId],
      enabled: !!userId && !!activeAttendanceId,
      refetchInterval: 60_000,
    });

  // Anti-fraud watchdog only runs while user is actively working (not on
  // break, not checked out, not absent).
  const watchdogEnabled =
    !!dailyStatus?.hasCheckedIn &&
    !dailyStatus?.hasCheckedOut &&
    dailyStatus?.currentStatus !== "في الاستراحة" &&
    dailyStatus?.currentStatus !== "مغادر" &&
    dailyStatus?.currentStatus !== "غائب" &&
    dailyStatus?.currentStatus !== "منسحب";

  // Active factory geofences for the GPS-based watchdog. Withdrawals
  // only fire when the device leaves all of these radii — tab hide /
  // network drop / window blur intentionally do nothing.
  const { data: factoryLocations } = useQuery<FactoryGeofence[]>({
    queryKey: ["/api/factory-locations/active"],
    enabled: watchdogEnabled,
    staleTime: 5 * 60_000,
  });

  useAttendanceWatchdog({
    enabled: watchdogEnabled,
    attendanceId: activeAttendanceId,
    userId,
    factoryLocations,
    onWithdrawalChanged: () => {
      void refetchWithdrawals();
      // Refresh daily status + attendance list so the restored "حاضر"
      // status (after returning) shows up immediately rather than waiting
      // for the next poll.
      void queryClient.invalidateQueries({
        queryKey: ["/api/attendance/daily-status", userId],
      });
      void queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    },
  });

  // ---- Live counters ----
  const onBreak = dailyStatus?.currentStatus === "في الاستراحة";
  const isCheckedOut = dailyStatus?.hasCheckedOut;

  const counterSeconds = useMemo(() => {
    if (onBreak && lunchStartAt) {
      return (now.getTime() - new Date(lunchStartAt).getTime()) / 1000;
    }
    if (checkInAt) {
      const end = isCheckedOut && checkOutAt ? new Date(checkOutAt) : now;
      return (end.getTime() - new Date(checkInAt).getTime()) / 1000;
    }
    return 0;
  }, [now, onBreak, isCheckedOut, lunchStartAt, checkInAt, checkOutAt]);

  const counterLabel = onBreak
    ? t("userDashboard.attendance.elapsedOnBreak")
    : t("userDashboard.attendance.elapsedSinceCheckIn");

  const counterColorClass = onBreak
    ? "from-yellow-500 to-amber-500"
    : isCheckedOut
      ? "from-gray-400 to-gray-500"
      : "from-emerald-500 to-teal-500";

  const statusBadgeClass = (() => {
    const s = dailyStatus?.currentStatus;
    if (s === "حاضر" || s === "يعمل")
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    if (s === "في الاستراحة")
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    if (s === "مغادر")
      return "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  })();

  const withdrawnMinutes = withdrawals?.totalMinutes ?? 0;
  const withdrawalCount = withdrawals?.withdrawals?.length ?? 0;
  const hasWithdrawals = withdrawnMinutes > 0 || withdrawalCount > 0;
  const assignedShift = dailyStatus?.assigned_shift;
  const assignedShiftName =
    assignedShift?.name_ar || assignedShift?.name_en || null;
  const assignedShiftTime =
    assignedShift?.start_time && assignedShift?.end_time
      ? `${assignedShift.start_time} – ${assignedShift.end_time}`
      : null;

  // ---- Buttons ----
  const buttons: Array<{
    key: string;
    label: string;
    icon: typeof LogIn;
    color: string;
    timestamp?: string | null;
    onClick: () => void;
    disabled: boolean;
    done: boolean;
    doneLabel: string;
  }> = [
    {
      key: "check-in",
      label: t("userDashboard.attendance.checkIn"),
      icon: LogIn,
      color: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800",
      timestamp: checkInAt,
      onClick: () => onAction("حاضر"),
      disabled: !!dailyStatus?.hasCheckedIn || isPending,
      done: !!dailyStatus?.hasCheckedIn,
      doneLabel: t("userDashboard.attendance.checkedIn"),
    },
    {
      key: "break-start",
      label: t("userDashboard.attendance.startBreak"),
      icon: Coffee,
      color: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700",
      timestamp: lunchStartAt,
      onClick: () => onAction("في الاستراحة"),
      disabled:
        !dailyStatus?.hasCheckedIn ||
        !!dailyStatus?.hasStartedLunch ||
        isPending,
      done: !!dailyStatus?.hasStartedLunch,
      doneLabel: t("userDashboard.attendance.breakTaken"),
    },
    {
      key: "break-end",
      label: t("userDashboard.attendance.endBreak"),
      icon: Play,
      color: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
      timestamp: lunchEndAt,
      onClick: () => onAction("يعمل", "end_lunch"),
      disabled:
        !dailyStatus?.hasStartedLunch ||
        !!dailyStatus?.hasEndedLunch ||
        isPending,
      done: !!dailyStatus?.hasEndedLunch,
      doneLabel: t("userDashboard.attendance.breakEnded"),
    },
    {
      key: "check-out",
      label: t("userDashboard.attendance.checkOut"),
      icon: LogOut,
      color: "bg-slate-600 hover:bg-slate-700 active:bg-slate-800",
      timestamp: checkOutAt,
      onClick: () => onAction("مغادر"),
      disabled:
        !dailyStatus?.hasCheckedIn || !!dailyStatus?.hasCheckedOut || isPending,
      done: !!dailyStatus?.hasCheckedOut,
      doneLabel: t("userDashboard.attendance.checkedOut"),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t("userDashboard.attendance.quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sticky live status card */}
        <div
          className={`sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b`}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {t("userDashboard.attendance.currentStatus")}:
              </span>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass}`}
                data-testid="badge-current-status"
              >
                {dailyStatus?.currentStatus ||
                  t("userDashboard.attendance.absent")}
              </span>
              {hasWithdrawals && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  data-testid="badge-withdrawal-count"
                >
                  <AlertOctagon className="h-3 w-3" />
                  {withdrawalCount}× • -{withdrawnMinutes}{" "}
                  {t("userDashboard.attendance.minute")}
                </span>
              )}
            </div>
            <div className="flex-1 flex justify-end">
              <div
                className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${counterColorClass} text-white font-mono text-base sm:text-lg tabular-nums shadow-sm`}
                data-testid="text-live-timer"
                title={counterLabel}
              >
                {formatHMS(counterSeconds)}
              </div>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            {counterLabel}
          </p>
          {dailyStatus?.shift_assigned !== undefined && (
            <p
              className="mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400"
              data-testid="text-assigned-shift"
            >
              {assignedShiftName
                ? `${assignedShiftName}${assignedShiftTime ? ` · ${assignedShiftTime}` : ""}`
                : t("userDashboard.attendance.unscheduled", {
                    defaultValue:
                      "غير مجدول — يرجى مراجعة مسؤول الموارد البشرية",
                  })}
            </p>
          )}
        </div>

        {/* Action grid: mobile-first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {buttons.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.key} className="flex flex-col">
                <Button
                  onClick={b.onClick}
                  disabled={b.disabled}
                  className={`${b.color} text-white w-full h-14 sm:h-16 text-sm sm:text-base font-semibold rounded-xl shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60`}
                  data-testid={`button-${b.key}`}
                >
                  <Icon className="h-5 w-5 me-2 shrink-0" />
                  <span className="truncate">
                    {b.done ? `✓ ${b.doneLabel}` : b.label}
                  </span>
                </Button>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-1 h-4 text-center font-mono">
                  {formatTime(b.timestamp)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Today log */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">
            {t("userDashboard.attendance.todayLog")}
          </h4>
          <ul className="space-y-1.5 text-sm">
            {checkInAt && (
              <li className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ {t("userDashboard.attendance.checkInRecord")}
                </span>
                <span className="text-gray-600 dark:text-gray-300 font-mono">
                  {formatTime(checkInAt)}
                </span>
              </li>
            )}
            {lunchStartAt && (
              <li className="flex items-center justify-between">
                <span className="text-amber-600 dark:text-amber-400">
                  ✓ {t("userDashboard.attendance.breakStart")}
                </span>
                <span className="text-gray-600 dark:text-gray-300 font-mono">
                  {formatTime(lunchStartAt)}
                </span>
              </li>
            )}
            {lunchEndAt && (
              <li className="flex items-center justify-between">
                <span className="text-blue-600 dark:text-blue-400">
                  ✓ {t("userDashboard.attendance.breakEnd")}
                </span>
                <span className="text-gray-600 dark:text-gray-300 font-mono">
                  {formatTime(lunchEndAt)}
                </span>
              </li>
            )}
            {checkOutAt && (
              <li className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-200">
                  ✓ {t("userDashboard.attendance.checkOutRecord")}
                </span>
                <span className="text-gray-600 dark:text-gray-300 font-mono">
                  {formatTime(checkOutAt)}
                </span>
              </li>
            )}
            {hasWithdrawals && (
              <li className="border-t pt-1.5 mt-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertOctagon className="h-3.5 w-3.5" />
                    {t("userDashboard.attendance.withdrawnTime")} (
                    {withdrawalCount}×)
                  </span>
                  <span className="text-red-700 dark:text-red-300 font-mono font-semibold">
                    -{withdrawnMinutes} {t("userDashboard.attendance.minute")}
                  </span>
                </div>
                {withdrawalCount > 0 && (
                  <ul className="mt-1 ms-4 text-[11px] text-red-600/80 dark:text-red-400/80 space-y-0.5">
                    {(withdrawals?.withdrawals || []).slice(0, 3).map((w) => (
                      <li
                        key={w.id}
                        className="flex items-center justify-between font-mono"
                      >
                        <span>{formatTime(w.started_at)}</span>
                        <span>−{w.duration_minutes}m</span>
                      </li>
                    ))}
                    {withdrawalCount > 3 && (
                      <li className="text-[10px]">+{withdrawalCount - 3}…</li>
                    )}
                  </ul>
                )}
              </li>
            )}
            {!checkInAt && (
              <li className="text-gray-400 text-center py-2">
                {t("userDashboard.attendance.notCheckedIn")}
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
