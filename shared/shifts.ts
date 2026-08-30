// نموذج الورديات ومحرك حساب الحضور (منطق نقي قابل للمشاركة بين الواجهة والخادم)
//
// المصنع يعمل بورديتين مدة كل منها 12 ساعة (8 ساعات أساسية + إضافي فعلي):
//   - وردية نهارية (day):  07:00 → 19:00 من نفس اليوم
//   - وردية ليلية (night): 19:00 → 07:00 من اليوم التالي (تعبر منتصف الليل)
//
// التوقيت مرجعي إلى توقيت المصنع (آسيا/الرياض = UTC+3 بدون توقيت صيفي)،
// لذلك نبني نوافذ الورديات كلحظات مطلقة باستخدام هذا الإزاحة الثابتة، ثم
// نقارنها مباشرة بطوابع الحضور (check_in/check_out) كلحظات. الفروق الزمنية
// بين اللحظات مستقلة عن المنطقة الزمنية، فالحساب صحيح بغض النظر عن منطقة الخادم.

export type ShiftType = "day" | "night";

export const FACTORY_UTC_OFFSET_HOURS = 3; // آسيا/الرياض

/** عدد ساعات العمل الأساسية قبل احتساب الإضافي. */
export const BASE_WORK_HOURS = 8;

/** فترة سماح افتراضية (بالدقائق) للتأخير/المغادرة المبكرة. 0 = حساب دقيق صارم. */
export const DEFAULT_GRACE_MINUTES = 0;

export interface ShiftDefinition {
  type: ShiftType;
  name_ar: string;
  name_en: string;
  /** ساعة البداية بتوقيت المصنع (0-23). */
  startHour: number;
  /** ساعة النهاية بتوقيت المصنع (0-23). */
  endHour: number;
  /** هل تعبر الوردية منتصف الليل (تنتهي في اليوم التالي). */
  crossesMidnight: boolean;
  /** إجمالي مدة الوردية بالساعات. */
  totalHours: number;
}

export const SHIFT_DEFINITIONS: Record<ShiftType, ShiftDefinition> = {
  day: {
    type: "day",
    name_ar: "نهارية",
    name_en: "Day",
    startHour: 7,
    endHour: 19,
    crossesMidnight: false,
    totalHours: 12,
  },
  night: {
    type: "night",
    name_ar: "ليلية",
    name_en: "Night",
    startHour: 19,
    endHour: 7,
    crossesMidnight: true,
    totalHours: 12,
  },
};

export function isShiftType(value: unknown): value is ShiftType {
  return value === "day" || value === "night";
}

export function getShiftName(shift: ShiftType, lang: "ar" | "en" = "ar"): string {
  const def = SHIFT_DEFINITIONS[shift];
  return lang === "ar" ? def.name_ar : def.name_en;
}

/**
 * يرجّع أجزاء التاريخ (سنة/شهر/يوم) بتوقيت المصنع (UTC+3) بدل UTC،
 * لتجنّب اختلاف "الشهر الحالي" حول منتصف الليل عند حدود الشهر.
 */
export function factoryNowParts(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  dateStr: string;
} {
  const shifted = new Date(now.getTime() + FACTORY_UTC_OFFSET_HOURS * 3600000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
    day,
  ).padStart(2, "0")}`;
  return { year, month, day, dateStr };
}

/** يحوّل وقت الحائط بتوقيت المصنع إلى لحظة مطلقة (Date). */
function factoryWallToInstant(
  year: number,
  month1: number, // 1-12
  day: number,
  hour: number,
  minute = 0,
): Date {
  return new Date(
    Date.UTC(year, month1 - 1, day, hour - FACTORY_UTC_OFFSET_HOURS, minute),
  );
}

/** يفكك سلسلة تاريخ "YYYY-MM-DD" إلى أجزائها الرقمية. */
function parseDateStr(dateStr: string): { y: number; m: number; d: number } {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

export interface ShiftWindow {
  start: Date;
  end: Date;
}

export interface ActivePreviousNightShift extends ShiftWindow {
  dateStr: string;
}

/**
 * نافذة الوردية كلحظات مطلقة لتاريخ الجدولة المعطى (تاريخ بداية الوردية).
 * للوردية الليلية تبدأ مساء `dateStr` وتنتهي صباح اليوم التالي.
 */
export function getShiftWindow(shift: ShiftType, dateStr: string): ShiftWindow {
  const def = SHIFT_DEFINITIONS[shift];
  const { y, m, d } = parseDateStr(dateStr);
  const start = factoryWallToInstant(y, m, d, def.startHour, 0);
  let end: Date;
  if (def.crossesMidnight) {
    // النهاية في اليوم التالي
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    end = factoryWallToInstant(
      next.getUTCFullYear(),
      next.getUTCMonth() + 1,
      next.getUTCDate(),
      def.endHour,
      0,
    );
  } else {
    end = factoryWallToInstant(y, m, d, def.endHour, 0);
  }
  return { start, end };
}

/**
 * Returns the previous calendar day's night shift only while it is still
 * active after midnight. At exactly 07:00 Riyadh the carry-over ends and a
 * fresh day-shift attendance session may begin.
 */
export function getActivePreviousNightShift(
  now: Date = new Date(),
): ActivePreviousNightShift | null {
  const previousDate = factoryNowParts(
    new Date(now.getTime() - 24 * 60 * 60 * 1000),
  ).dateStr;
  const window = getShiftWindow("night", previousDate);
  const nowMs = now.getTime();

  if (nowMs < window.start.getTime() || nowMs >= window.end.getTime()) {
    return null;
  }

  return { dateStr: previousDate, ...window };
}

export interface AttendanceMetricsInput {
  shift: ShiftType;
  dateStr: string;
  /** لحظة الحضور الفعلية (أو null إذا لم يسجل حضور). */
  checkIn: Date | null;
  /** لحظة الانصراف الفعلية (أو null إذا لم يسجل انصراف). */
  checkOut: Date | null;
  /** مجموع دقائق الاستراحة. */
  breakMinutes?: number;
  /** مجموع دقائق الانسحاب من نطاق المصنع (تُخصم من العمل). */
  withdrawnMinutes?: number;
  /** فترة السماح بالدقائق. */
  graceMinutes?: number;
}

export interface AttendanceMetrics {
  /** هل حضر الموظف (سجل دخول). */
  present: boolean;
  /** هل اكتملت البيانات (دخول + خروج). */
  complete: boolean;
  /** دقائق التأخير عن بداية الوردية. */
  lateMinutes: number;
  /** دقائق المغادرة المبكرة قبل نهاية الوردية. */
  earlyLeaveMinutes: number;
  /** ساعات العمل الفعلية (بعد خصم الاستراحة والانسحاب). */
  workedHours: number;
  /** ساعات العمل الإضافي (الفعلي بعد 8 ساعات). */
  overtimeHours: number;
}

function roundHours(h: number): number {
  return Math.round(h * 100) / 100;
}

/**
 * يحسب نتيجة الحضور ليوم/موظف مقابل وردية محددة:
 * حاضر/غائب، دقائق التأخير، دقائق المغادرة المبكرة، ساعات العمل الفعلية،
 * وساعات الإضافي (الفعلي بعد 8 ساعات). يدعم الورديات الليلية العابرة لمنتصف الليل.
 */
export function computeShiftMetrics(
  input: AttendanceMetricsInput,
): AttendanceMetrics {
  const grace = input.graceMinutes ?? DEFAULT_GRACE_MINUTES;
  const breakMinutes = Math.max(0, input.breakMinutes ?? 0);
  const withdrawnMinutes = Math.max(0, input.withdrawnMinutes ?? 0);
  const { start, end } = getShiftWindow(input.shift, input.dateStr);

  const present = !!input.checkIn;
  const complete = !!input.checkIn && !!input.checkOut;

  let lateMinutes = 0;
  if (input.checkIn) {
    const diffMin = (input.checkIn.getTime() - start.getTime()) / 60000;
    lateMinutes = Math.max(0, Math.round(diffMin - grace));
  }

  let earlyLeaveMinutes = 0;
  if (input.checkOut) {
    const diffMin = (end.getTime() - input.checkOut.getTime()) / 60000;
    earlyLeaveMinutes = Math.max(0, Math.round(diffMin - grace));
  }

  let workedHours = 0;
  if (input.checkIn && input.checkOut) {
    const grossHours =
      (input.checkOut.getTime() - input.checkIn.getTime()) / 3600000;
    workedHours = Math.max(
      0,
      grossHours - breakMinutes / 60 - withdrawnMinutes / 60,
    );
  }

  const overtimeHours =
    complete && workedHours > BASE_WORK_HOURS
      ? workedHours - BASE_WORK_HOURS
      : 0;

  return {
    present,
    complete,
    lateMinutes,
    earlyLeaveMinutes,
    workedHours: roundHours(workedHours),
    overtimeHours: roundHours(overtimeHours),
  };
}
