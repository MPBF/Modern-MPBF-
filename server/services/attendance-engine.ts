// محرك حساب الحضور: يجمّع سجلات الحضور الخام (التي تنشئها لوحة الموظف عبر
// تسجيل الدخول/الخروج) ويحسبها مقابل وردية الموظف المُجدولة لكل يوم، مع دعم
// الورديات الليلية العابرة لمنتصف الليل. منطق الحساب الصرف موجود في
// `shared/shifts.ts`؛ هذا الملف مسؤول فقط عن تجميع الصفوف ومطابقتها بنوافذ الورديات.

import {
  computeShiftMetrics,
  getShiftName,
  getShiftWindow,
  getShiftWindowForSnapshot,
  isShiftType,
  getSnapshotShiftType,
  type ShiftType,
  type ShiftSnapshot,
} from "@shared/shifts";

export interface RawAttendanceRow {
  id: number;
  user_id: number;
  status: string;
  check_in_time: Date | string | null;
  check_out_time: Date | string | null;
  lunch_start_time: Date | string | null;
  lunch_end_time: Date | string | null;
  break_start_time: Date | string | null;
  break_end_time: Date | string | null;
  total_withdrawn_minutes: number | null;
  date: string;
  shift_snapshot?: ShiftSnapshot | null;
}

/** خريطة الوردية لكل شهر: المفتاح "YYYY-M" → نوع الوردية. */
export type MonthlyShiftMap = Map<string, ShiftType | ShiftSnapshot>;

export interface DailyAttendanceResult {
  date: string;
  scheduled: boolean;
  shift: ShiftType | null;
  shiftName: string;
  status: string; // عربي: غير مجدول / غائب / غير مكتمل / حاضر
  present: boolean;
  complete: boolean;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  withdrawnMinutes: number;
  workedHours: number;
  overtimeHours: number;
  /** يوم إجازة معتمدة (سجل حضور بحالة "إجازة") — لا يُحتسب غياباً. */
  onLeave: boolean;
}

export interface AttendanceTotals {
  rangeDays: number;
  scheduledDays: number;
  presentDays: number;
  absentDays: number;
  incompleteDays: number;
  /** أيام الإجازة المعتمدة (لا تُخصم كغياب). */
  leaveDays: number;
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
  totalWithdrawnMinutes: number;
  totalWorkedHours: number;
  totalOvertimeHours: number;
}

export interface EmployeeAttendanceResult {
  days: DailyAttendanceResult[];
  totals: AttendanceTotals;
}

function toDate(value: Date | string | null): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function pairMinutes(
  a: Date | string | null,
  b: Date | string | null,
): number {
  const da = toDate(a);
  const db = toDate(b);
  if (da && db) return Math.max(0, (db.getTime() - da.getTime()) / 60000);
  return 0;
}

function monthKey(year: number, month1: number): string {
  return `${year}-${month1}`;
}

/** يضيف عدد أيام إلى سلسلة "YYYY-MM-DD" بأمان (UTC) ويعيد سلسلة جديدة. */
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function overlapMinutes(
  start: Date,
  end: Date,
  windowStart: Date,
  windowEnd: Date,
): number {
  return Math.max(
    0,
    (Math.min(end.getTime(), windowEnd.getTime()) -
      Math.max(start.getTime(), windowStart.getTime())) /
      60000,
  );
}

function pairTimestampIntervals(
  starts: Date[],
  ends: Date[],
): Array<{ start: Date; end: Date | null; capAt: Date | null }> {
  const sortedStarts = [...starts].sort((a, b) => a.getTime() - b.getTime());
  const sortedEnds = [...ends].sort((a, b) => a.getTime() - b.getTime());
  const intervals: Array<{
    start: Date;
    end: Date | null;
    capAt: Date | null;
  }> = [];
  let endIndex = 0;
  for (let index = 0; index < sortedStarts.length; index++) {
    const start = sortedStarts[index];
    const nextStart = sortedStarts[index + 1];
    while (
      endIndex < sortedEnds.length &&
      sortedEnds[endIndex].getTime() < start.getTime()
    ) {
      endIndex++;
    }
    const candidate = sortedEnds[endIndex];
    const end =
      candidate &&
      (!nextStart || candidate.getTime() <= nextStart.getTime())
        ? candidate
        : null;
    if (end) endIndex++;
    intervals.push({ start, end, capAt: end ?? nextStart ?? null });
  }
  return intervals;
}

/**
 * يحسب نتيجة الحضور لموظف واحد عبر مدى تواريخ.
 * @param rows سجلات الحضور الخام للموظف ضمن المدى (مع يوم هامش قبل/بعد).
 * @param shiftByMonth خريطة وردية الموظف لكل شهر.
 * @param from تاريخ البداية "YYYY-MM-DD".
 * @param to تاريخ النهاية "YYYY-MM-DD" (شامل).
 */
export interface AttendanceComputeOptions {
  /**
   * دقائق الاستئذان المعتمدة لكل يوم "YYYY-MM-DD" → دقائق. تُخصم من
   * التأخير ثم المغادرة المبكرة ثم الانسحاب لذلك اليوم (لا تُحتسب خصماً).
   */
  permissionMinutesByDate?: Map<string, number>;
  /** فترات الانسحاب الفعلية لتقسيمها بدقة عند عبور منتصف الليل. */
  withdrawalIntervals?: Array<{ start: Date; end: Date }>;
}

export function computeEmployeeAttendance(
  rows: RawAttendanceRow[],
  shiftByMonth: MonthlyShiftMap,
  from: string,
  to: string,
  graceMinutes = 0,
  options: AttendanceComputeOptions = {},
): EmployeeAttendanceResult {
  const days: DailyAttendanceResult[] = [];

  // أيام الإجازة المعتمدة: أي صف حضور بحالة "إجازة" يعلّم يومه كإجازة.
  const leaveDates = new Set<string>();
  for (const r of rows) {
    if (r.status === "إجازة" && r.date) {
      leaveDates.add(String(r.date).slice(0, 10));
    }
  }
  const permissionByDate = options.permissionMinutesByDate;
  const withdrawalIntervals = options.withdrawalIntervals ?? [];

  // طبّع صفوف الحضور إلى لحظاتها الخام مرة واحدة. ملاحظة مهمة: لوحة الموظف
  // تُنشئ صفاً منفصلاً لكل إجراء (حضور/استراحة/عودة/انصراف)، لذا قد توجد عدة
  // صفوف لنفس اليوم. لا نحسب دقائق الاستراحة/الانسحاب لكل صف على حدة (لتفادي
  // الاحتساب المزدوج)؛ بل نجمّع الأختام الزمنية عبر صفوف اليوم ثم نحسب مرة واحدة.
  const normalized = rows.map((r) => ({
    date: String(r.date).slice(0, 10),
    checkIn: toDate(r.check_in_time),
    checkOut: toDate(r.check_out_time),
    lunchStart: toDate(r.lunch_start_time),
    lunchEnd: toDate(r.lunch_end_time),
    breakStart: toDate(r.break_start_time),
    breakEnd: toDate(r.break_end_time),
    withdrawn: r.total_withdrawn_minutes || 0,
    snapshot: r.shift_snapshot ?? null,
  }));
  const workSessions = pairTimestampIntervals(
    normalized.flatMap((row) => (row.checkIn ? [row.checkIn] : [])),
    normalized.flatMap((row) => (row.checkOut ? [row.checkOut] : [])),
  ).map((session) => ({
    ...session,
    ...(() => {
      const source = normalized.find(
        (row) =>
          row.checkIn?.getTime() === session.start.getTime(),
      );
      return {
        snapshot: source?.snapshot ?? null,
        attendanceDate: source?.date ?? null,
        capAt:
          session.end ??
          (source?.date
            ? new Date(
                Math.min(
                  session.capAt?.getTime() ?? Number.POSITIVE_INFINITY,
                  getShiftWindow("flexible", source.date).end.getTime(),
                ),
              )
            : session.capAt),
      };
    })(),
  }));
  const breakIntervals = [
    ...pairTimestampIntervals(
      normalized.flatMap((row) => (row.lunchStart ? [row.lunchStart] : [])),
      normalized.flatMap((row) => (row.lunchEnd ? [row.lunchEnd] : [])),
    ),
    ...pairTimestampIntervals(
      normalized.flatMap((row) => (row.breakStart ? [row.breakStart] : [])),
      normalized.flatMap((row) => (row.breakEnd ? [row.breakEnd] : [])),
    ),
  ].filter(
    (
      interval,
    ): interval is { start: Date; end: Date; capAt: Date | null } =>
      interval.end != null,
  );

  const minD = (cur: Date | null, cand: Date | null): Date | null =>
    cand && (!cur || cand.getTime() < cur.getTime()) ? cand : cur;
  const maxD = (cur: Date | null, cand: Date | null): Date | null =>
    cand && (!cur || cand.getTime() > cur.getTime()) ? cand : cur;

  let cursor = from;
  let guard = 0;
  while (cursor <= to && guard < 400) {
    guard++;
    const [y, m] = cursor.split("-").map(Number);
    const configured = shiftByMonth.get(monthKey(y, m)) ?? null;
    const calendarWindow = getShiftWindow("flexible", cursor);
    const historicalFlexibleSnapshot =
      workSessions.find(
        (session) =>
          session.snapshot &&
          getSnapshotShiftType(session.snapshot) === "flexible" &&
          session.start.getTime() < calendarWindow.end.getTime() &&
          (session.end?.getTime() ??
            session.capAt?.getTime() ??
            (session.attendanceDate === cursor
              ? calendarWindow.end.getTime()
              : Number.NEGATIVE_INFINITY)) >
            calendarWindow.start.getTime(),
      )?.snapshot ?? null;
    const snapshot =
      historicalFlexibleSnapshot ??
      (configured && typeof configured === "object" ? configured : null);
    const shift = snapshot
      ? getSnapshotShiftType(snapshot)
      : configured;

    if (!shift || !isShiftType(shift)) {
      days.push({
        date: cursor,
        scheduled: false,
        shift: null,
        shiftName: "—",
        status: "غير مجدول",
        present: false,
        complete: false,
        checkIn: null,
        checkOut: null,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        withdrawnMinutes: 0,
        workedHours: 0,
        overtimeHours: 0,
        onLeave: false,
      });
      cursor = addDays(cursor, 1);
      continue;
    }

    const { start, end } = snapshot ? getShiftWindowForSnapshot(snapshot, cursor) : getShiftWindow(shift, cursor);
    // هامش ساعتين لاستيعاب الحضور المبكر/الانصراف المتأخر حول نافذة الوردية.
    const lo = start.getTime() - 2 * 3600000;
    const hi = end.getTime() + 2 * 3600000;
    const within = (d: Date | null): boolean =>
      !!d && d.getTime() >= lo && d.getTime() <= hi;

    // اجمع الأختام الزمنية عبر كل صفوف اليوم في سجل فعّال واحد بدل احتسابها لكل صف.
    let earliestIn: Date | null = null;
    let latestOut: Date | null = null;
    let lunchStart: Date | null = null;
    let lunchEnd: Date | null = null;
    let breakStart: Date | null = null;
    let breakEnd: Date | null = null;
    let withdrawnMinutes = 0;
    let metrics;
    if (shift === "flexible") {
      const configuredIsFlexible =
        configured === "flexible" ||
        (configured &&
          typeof configured === "object" &&
          getSnapshotShiftType(configured) === "flexible");
      const sessions = workSessions.filter(
        (session) =>
          (session.snapshot
            ? getSnapshotShiftType(session.snapshot) === "flexible"
            : configuredIsFlexible) &&
          session.start.getTime() < end.getTime() &&
          (session.end?.getTime() ??
            session.capAt?.getTime() ??
            (session.attendanceDate === cursor
              ? end.getTime()
              : Number.NEGATIVE_INFINITY)) >
            start.getTime(),
      );
      earliestIn = sessions.length
        ? new Date(
            Math.max(
              start.getTime(),
              Math.min(...sessions.map((session) => session.start.getTime())),
            ),
          )
        : null;
      const completed = sessions.filter(
        (session): session is typeof session & { end: Date } =>
          session.end != null,
      );
      latestOut = completed.length
        ? new Date(
            Math.min(
              end.getTime(),
              Math.max(...completed.map((session) => session.end.getTime())),
            ),
          )
        : null;
      const grossMinutes = completed.reduce(
        (sum, session) =>
          sum + overlapMinutes(session.start, session.end, start, end),
        0,
      );
      const breakMinutes = breakIntervals.reduce(
        (sum, interval) =>
          sum +
          completed.reduce(
            (sessionSum, session) =>
              sessionSum +
              overlapMinutes(
                interval.start,
                interval.end,
                new Date(Math.max(start.getTime(), session.start.getTime())),
                new Date(Math.min(end.getTime(), session.end.getTime())),
              ),
            0,
          ),
        0,
      );
      withdrawnMinutes = withdrawalIntervals.length
        ? withdrawalIntervals.reduce(
            (sum, interval) =>
              sum +
              completed.reduce(
                (sessionSum, session) =>
                  sessionSum +
                  overlapMinutes(
                    interval.start,
                    interval.end,
                    new Date(Math.max(start.getTime(), session.start.getTime())),
                    new Date(Math.min(end.getTime(), session.end.getTime())),
                  ),
                0,
              ),
            0,
          )
        : normalized
            .filter((row) => row.date === cursor)
            .reduce((max, row) => Math.max(max, row.withdrawn), 0);
      const workedHours = Math.max(
        0,
        (grossMinutes - breakMinutes - withdrawnMinutes) / 60,
      );
      const baseHours = snapshot?.base_work_hours ?? 8;
      metrics = {
        present: sessions.length > 0,
        complete:
          sessions.length > 0 &&
          sessions.every((session) => session.end != null),
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        workedHours: round2(workedHours),
        overtimeHours: round2(Math.max(0, workedHours - baseHours)),
      };
    } else {
      for (const row of normalized) {
        const belongsToSession = row.date === cursor;
        const rowInWindow =
          belongsToSession ||
          within(row.checkIn) ||
          within(row.checkOut) ||
          within(row.lunchStart) ||
          within(row.lunchEnd) ||
          within(row.breakStart) ||
          within(row.breakEnd);
        if (!rowInWindow) continue;

        const accept = (stamp: Date | null) => belongsToSession || within(stamp);
        if (accept(row.checkIn)) earliestIn = minD(earliestIn, row.checkIn);
        if (accept(row.checkOut)) latestOut = maxD(latestOut, row.checkOut);
        if (accept(row.lunchStart)) lunchStart = minD(lunchStart, row.lunchStart);
        if (accept(row.lunchEnd)) lunchEnd = maxD(lunchEnd, row.lunchEnd);
        if (accept(row.breakStart)) breakStart = minD(breakStart, row.breakStart);
        if (accept(row.breakEnd)) breakEnd = maxD(breakEnd, row.breakEnd);
        if (row.withdrawn > withdrawnMinutes) withdrawnMinutes = row.withdrawn;
      }

      const breakMinutes =
        pairMinutes(lunchStart, lunchEnd) + pairMinutes(breakStart, breakEnd);
      const baseEnd = new Date(
        start.getTime() + (snapshot?.base_work_hours ?? 8) * 3600000,
      );
      if (withdrawalIntervals.length) {
        withdrawnMinutes = withdrawalIntervals.reduce(
          (sum, interval) =>
            sum +
            overlapMinutes(
              interval.start,
              interval.end,
              earliestIn ?? start,
              latestOut ?? end,
            ),
          0,
        );
      }
      const overtimeBreakMinutes = breakIntervals.reduce(
        (sum, interval) =>
          sum +
          overlapMinutes(
            interval.start,
            interval.end,
            new Date(
              Math.max(baseEnd.getTime(), earliestIn?.getTime() ?? baseEnd.getTime()),
            ),
            new Date(
              Math.min(end.getTime(), latestOut?.getTime() ?? end.getTime()),
            ),
          ),
        0,
      );
      const overtimeWithdrawnMinutes = withdrawalIntervals.length
        ? withdrawalIntervals.reduce(
            (sum, interval) =>
              sum +
              overlapMinutes(
                interval.start,
                interval.end,
                new Date(
                  Math.max(
                    baseEnd.getTime(),
                    earliestIn?.getTime() ?? baseEnd.getTime(),
                  ),
                ),
                new Date(
                  Math.min(end.getTime(), latestOut?.getTime() ?? end.getTime()),
                ),
              ),
            0,
          )
        : Math.min(
            withdrawnMinutes,
            Math.max(
              0,
              (Math.min(
                latestOut?.getTime() ?? start.getTime(),
                end.getTime(),
              ) -
                Math.max(
                  earliestIn?.getTime() ?? end.getTime(),
                  baseEnd.getTime(),
                )) /
                60000 -
                overtimeBreakMinutes,
            ),
          );
      metrics = computeShiftMetrics({
        shift,
        dateStr: cursor,
        checkIn: earliestIn,
        checkOut: latestOut,
        breakMinutes,
        overtimeBreakMinutes,
        overtimeWithdrawnMinutes,
        withdrawnMinutes,
        graceMinutes,
        snapshot: snapshot ?? undefined,
      });
    }

    // خصم دقائق الاستئذان المعتمدة لهذا اليوم من التأخير ثم المغادرة
    // المبكرة ثم الانسحاب (الدقائق المعتمدة لا تُحتسب خصماً).
    let lateMinutes = metrics.lateMinutes;
    let earlyLeaveMinutes = metrics.earlyLeaveMinutes;
    let dayWithdrawn = withdrawnMinutes;
    let credit = permissionByDate?.get(cursor) ?? 0;
    if (credit > 0) {
      const useLate = Math.min(lateMinutes, credit);
      lateMinutes -= useLate;
      credit -= useLate;
      const useEarly = Math.min(earlyLeaveMinutes, credit);
      earlyLeaveMinutes -= useEarly;
      credit -= useEarly;
      const useWithdrawn = Math.min(dayWithdrawn, credit);
      dayWithdrawn -= useWithdrawn;
    }

    // يوم إجازة معتمدة بدون حضور فعلي: يُعلَّم "إجازة" ولا يُحتسب غياباً.
    const onLeave = !metrics.present && leaveDates.has(cursor);

    let status: string;
    if (onLeave) status = "إجازة";
    else if (!metrics.present) status = "غائب";
    else if (!metrics.complete) status = "غير مكتمل";
    else status = "حاضر";

    days.push({
      date: cursor,
      scheduled: true,
      shift,
      shiftName: snapshot?.name_ar ?? getShiftName(shift, "ar"),
      status,
      present: metrics.present,
      complete: metrics.complete,
      checkIn: earliestIn ? earliestIn.toISOString() : null,
      checkOut: latestOut ? latestOut.toISOString() : null,
      lateMinutes,
      earlyLeaveMinutes,
      withdrawnMinutes: dayWithdrawn,
      workedHours: metrics.workedHours,
      overtimeHours: metrics.overtimeHours,
      onLeave,
    });

    cursor = addDays(cursor, 1);
  }

  const totals: AttendanceTotals = {
    rangeDays: days.length,
    scheduledDays: 0,
    presentDays: 0,
    absentDays: 0,
    incompleteDays: 0,
    leaveDays: 0,
    totalLateMinutes: 0,
    totalEarlyLeaveMinutes: 0,
    totalWithdrawnMinutes: 0,
    totalWorkedHours: 0,
    totalOvertimeHours: 0,
  };

  for (const d of days) {
    if (!d.scheduled) continue;
    totals.scheduledDays++;
    if (d.present && d.complete) totals.presentDays++;
    else if (d.present && !d.complete) totals.incompleteDays++;
    else if (d.onLeave) totals.leaveDays++;
    else totals.absentDays++;
    totals.totalLateMinutes += d.lateMinutes;
    totals.totalEarlyLeaveMinutes += d.earlyLeaveMinutes;
    totals.totalWithdrawnMinutes += d.withdrawnMinutes;
    totals.totalWorkedHours += d.workedHours;
    totals.totalOvertimeHours += d.overtimeHours;
  }
  totals.totalWorkedHours = round2(totals.totalWorkedHours);
  totals.totalOvertimeHours = round2(totals.totalOvertimeHours);

  return { days, totals };
}
