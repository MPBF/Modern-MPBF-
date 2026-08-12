// محرك حساب الحضور: يجمّع سجلات الحضور الخام (التي تنشئها لوحة الموظف عبر
// تسجيل الدخول/الخروج) ويحسبها مقابل وردية الموظف المُجدولة لكل يوم، مع دعم
// الورديات الليلية العابرة لمنتصف الليل. منطق الحساب الصرف موجود في
// `shared/shifts.ts`؛ هذا الملف مسؤول فقط عن تجميع الصفوف ومطابقتها بنوافذ الورديات.

import {
  computeShiftMetrics,
  getShiftName,
  getShiftWindow,
  isShiftType,
  type ShiftType,
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
}

/** خريطة الوردية لكل شهر: المفتاح "YYYY-M" → نوع الوردية. */
export type MonthlyShiftMap = Map<string, ShiftType>;

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

  // طبّع صفوف الحضور إلى لحظاتها الخام مرة واحدة. ملاحظة مهمة: لوحة الموظف
  // تُنشئ صفاً منفصلاً لكل إجراء (حضور/استراحة/عودة/انصراف)، لذا قد توجد عدة
  // صفوف لنفس اليوم. لا نحسب دقائق الاستراحة/الانسحاب لكل صف على حدة (لتفادي
  // الاحتساب المزدوج)؛ بل نجمّع الأختام الزمنية عبر صفوف اليوم ثم نحسب مرة واحدة.
  const normalized = rows.map((r) => ({
    checkIn: toDate(r.check_in_time),
    checkOut: toDate(r.check_out_time),
    lunchStart: toDate(r.lunch_start_time),
    lunchEnd: toDate(r.lunch_end_time),
    breakStart: toDate(r.break_start_time),
    breakEnd: toDate(r.break_end_time),
    withdrawn: r.total_withdrawn_minutes || 0,
  }));

  const minD = (cur: Date | null, cand: Date | null): Date | null =>
    cand && (!cur || cand.getTime() < cur.getTime()) ? cand : cur;
  const maxD = (cur: Date | null, cand: Date | null): Date | null =>
    cand && (!cur || cand.getTime() > cur.getTime()) ? cand : cur;

  let cursor = from;
  let guard = 0;
  while (cursor <= to && guard < 400) {
    guard++;
    const [y, m] = cursor.split("-").map(Number);
    const shift = shiftByMonth.get(monthKey(y, m)) ?? null;

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

    const { start, end } = getShiftWindow(shift, cursor);
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

    for (const row of normalized) {
      // عضوية اليوم/الوردية: أي ختم زمني للصف يقع داخل النافذة يربطه بهذا اليوم.
      const rowInWindow =
        within(row.checkIn) ||
        within(row.checkOut) ||
        within(row.lunchStart) ||
        within(row.lunchEnd) ||
        within(row.breakStart) ||
        within(row.breakEnd);
      if (!rowInWindow) continue;

      if (within(row.checkIn)) earliestIn = minD(earliestIn, row.checkIn);
      if (within(row.checkOut)) latestOut = maxD(latestOut, row.checkOut);
      if (within(row.lunchStart)) lunchStart = minD(lunchStart, row.lunchStart);
      if (within(row.lunchEnd)) lunchEnd = maxD(lunchEnd, row.lunchEnd);
      if (within(row.breakStart)) breakStart = minD(breakStart, row.breakStart);
      if (within(row.breakEnd)) breakEnd = maxD(breakEnd, row.breakEnd);
      // total_withdrawn_minutes قيمة تراكمية إجمالية لليوم → نأخذ الأكبر لا المجموع.
      if (row.withdrawn > withdrawnMinutes) withdrawnMinutes = row.withdrawn;
    }

    // احسب دقائق الاستراحة مرة واحدة من القيم المجمّعة (يمنع الاحتساب المزدوج).
    const breakMinutes =
      pairMinutes(lunchStart, lunchEnd) + pairMinutes(breakStart, breakEnd);

    const metrics = computeShiftMetrics({
      shift,
      dateStr: cursor,
      checkIn: earliestIn,
      checkOut: latestOut,
      breakMinutes,
      withdrawnMinutes,
      graceMinutes,
    });

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
      shiftName: getShiftName(shift, "ar"),
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
