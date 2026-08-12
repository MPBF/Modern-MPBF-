// ربط طلبات الإجازة والاستئذان المعتمدة بسجل الحضور والأجور:
// - عند اعتماد إجازة تُنشأ/تُحدّث سجلات حضور بحالة "إجازة" لأيام الفترة.
// - دقائق الاستئذان المعتمدة تُجمع لكل يوم لتُخصم من التأخير/المغادرة
//   المبكرة/الانسحاب في محرك الحضور (وبالتالي من خصومات الأجور).

import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { attendance, user_requests } from "@shared/schema";

/** يضيف أياماً إلى سلسلة "YYYY-MM-DD" (UTC). */
function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

/**
 * عند اعتماد طلب إجازة: أنشئ/حدّث سجلات الحضور لأيام الفترة بحالة "إجازة"
 * حتى لا تُحتسب أيام غياب. لا يمس الأيام التي سُجّل فيها حضور فعلي.
 */
export async function applyApprovedLeaveToAttendance(request: {
  id: number;
  user_id: number | null;
  leave_start_date: Date | string | null;
  leave_end_date: Date | string | null;
  reviewed_by?: number | null;
}): Promise<void> {
  const userId = request.user_id;
  if (!userId || !request.leave_start_date || !request.leave_end_date) return;
  const toDateStr = (v: Date | string): string =>
    (v instanceof Date ? v.toISOString() : String(v)).slice(0, 10);
  const startStr = toDateStr(request.leave_start_date);
  const endStr = toDateStr(request.leave_end_date);
  if (endStr < startStr) return;

  let cursor = startStr;
  let guard = 0;
  while (cursor <= endStr && guard < 366) {
    guard++;
    const existing = await db
      .select({
        id: attendance.id,
        status: attendance.status,
        check_in_time: attendance.check_in_time,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.user_id, userId),
          sql`${attendance.date} = ${cursor}`,
        ),
      );
    if (!existing.length) {
      await db.insert(attendance).values({
        user_id: userId,
        status: "إجازة",
        date: cursor,
        notes: `إجازة معتمدة (طلب رقم ${request.id})`,
        created_by: request.reviewed_by ?? null,
      } as any);
    } else {
      // حدّث فقط الصفوف بلا حضور فعلي (غائب) إلى "إجازة".
      for (const row of existing) {
        if (!row.check_in_time && row.status !== "إجازة") {
          await db
            .update(attendance)
            .set({
              status: "إجازة",
              notes: `إجازة معتمدة (طلب رقم ${request.id})`,
              updated_by: request.reviewed_by ?? null,
              updated_at: new Date(),
            } as any)
            .where(eq(attendance.id, row.id));
        }
      }
    }
    cursor = addDaysStr(cursor, 1);
  }
}

/**
 * دقائق الاستئذان المعتمدة لكل مستخدم/يوم ضمن المدى:
 * user_id → ("YYYY-MM-DD" → دقائق).
 */
export async function getApprovedPermissionMinutes(
  userIds: number[],
  from: string,
  to: string,
): Promise<Map<number, Map<string, number>>> {
  const result = new Map<number, Map<string, number>>();
  if (!userIds.length) return result;
  const rows = await db
    .select({
      user_id: user_requests.user_id,
      date: sql<string>`${user_requests.date}::date`,
      start: user_requests.permission_start_time,
      end: user_requests.permission_end_time,
    })
    .from(user_requests)
    .where(
      and(
        inArray(user_requests.user_id, userIds),
        eq(user_requests.type, "استئذان"),
        eq(user_requests.status, "موافق"),
        sql`${user_requests.date}::date BETWEEN ${from} AND ${to}`,
      ),
    );
  const toMinutes = (t: string | null): number | null => {
    if (!t || !/^\d{2}:\d{2}$/.test(t)) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  for (const r of rows) {
    if (r.user_id == null) continue;
    const s = toMinutes(r.start);
    const e = toMinutes(r.end);
    if (s == null || e == null || e <= s) continue;
    const dateStr = String(r.date).slice(0, 10);
    const byDate = result.get(r.user_id) ?? new Map<string, number>();
    byDate.set(dateStr, (byDate.get(dateStr) ?? 0) + (e - s));
    result.set(r.user_id, byDate);
  }
  return result;
}
