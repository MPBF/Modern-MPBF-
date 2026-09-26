import {
  factoryNowParts,
  getShiftWindowForSnapshot,
  getSnapshotShiftType,
  type ShiftSnapshot,
} from "@shared/shifts";

/** Old unmatched rows remain historical records, not an active session forever. */
export function isOpenSessionRelevant(
  session: {
    date: string | Date;
    check_in_time: Date | string | null;
    shift_snapshot?: unknown;
    shift_type?: string | null;
  },
  now: Date,
): boolean {
  const date = String(session.date).slice(0, 10);
  const today = factoryNowParts(now).dateStr;
  const checkedInAt = session.check_in_time
    ? new Date(session.check_in_time).getTime()
    : NaN;
  if (!Number.isFinite(checkedInAt) || checkedInAt > now.getTime()) return false;
  if (date === today) return true;
  const yesterday = factoryNowParts(new Date(now.getTime() - 86400000)).dateStr;
  if (date !== yesterday) return false;

  const snapshot = session.shift_snapshot as ShiftSnapshot | null;
  const kind = snapshot?.start_time && snapshot?.end_time
    ? getSnapshotShiftType(snapshot)
    : session.shift_type === "ليلي" ? "night"
      : session.shift_type === "حر" ? "flexible" : "day";
  if (kind === "night") {
    const window = snapshot?.start_time && snapshot?.end_time
      ? getShiftWindowForSnapshot(snapshot, date)
      : getShiftWindowForSnapshot({
          name_ar: "ليلية", start_time: "19:00", end_time: "07:00",
          grace_minutes: 0, base_work_hours: 8, kind: "night",
        }, date);
    // Checkout may finish the prior night's session after 07:00, but never
    // cross into the next 19:00 night shift.
    return checkedInAt >= window.start.getTime() &&
      checkedInAt < window.end.getTime() &&
      now.getTime() < window.start.getTime() + 24 * 60 * 60 * 1000;
  }
  // Flexible sessions may cross midnight, but cannot block a later day forever.
  return kind === "flexible" &&
    now.getTime() < checkedInAt + 24 * 60 * 60 * 1000;
}

type AttendanceActionRecord = {
  status?: string | null;
  notes?: string | null;
  check_in_time?: Date | string | null;
  check_out_time?: Date | string | null;
  lunch_start_time?: Date | string | null;
  lunch_end_time?: Date | string | null;
  created_at?: Date | string | null;
};

/** Rows arrive newest first. A later check-in starts a new session on that date. */
export function summarizeActionSession<T extends AttendanceActionRecord>(
  records: T[],
) {
  const latestCheckInIndex = records.findIndex((row) => row.check_in_time);
  const session = latestCheckInIndex < 0
    ? records : records.slice(0, latestCheckInIndex + 1);
  const hasCheckedIn = session.some((row) =>
    !!row.check_in_time ||
    (row.status === "حاضر" && row.notes !== "auto_restore_after_withdrawal"));
  const hasCheckedOut = session.some((row) =>
    !!row.check_out_time || row.status === "مغادر");
  return {
    session,
    hasCheckedIn,
    hasCheckedOut,
    hasStartedLunch: session.some((row) => row.status === "في الاستراحة"),
    hasEndedLunch: session.some((row) => row.status === "يعمل"),
  };
}

export function filterAttendanceRecordsByWindow<
  T extends AttendanceActionRecord,
>(
  records: T[],
  window?: { start: Date; end: Date; checkoutEnd?: Date },
): T[] {
  if (!window) return records;
  return records.filter((record) => {
    if (record.check_out_time) {
      const checkoutTimestamp = new Date(record.check_out_time).getTime();
      return (
        checkoutTimestamp >= window.start.getTime() &&
        checkoutTimestamp <
          (window.checkoutEnd?.getTime() ?? window.end.getTime() + 1)
      );
    }
    const actionTime =
      record.check_in_time ||
      record.lunch_start_time ||
      record.lunch_end_time ||
      record.created_at;
    if (!actionTime) return false;
    const timestamp = new Date(actionTime).getTime();
    return timestamp >= window.start.getTime() && timestamp < window.end.getTime();
  });
}