import { and, eq, sql } from "drizzle-orm";
import { attendance } from "@shared/schema";
import { db } from "../db";
import { closeExpiredAttendanceSessionsInTransaction } from "../services/attendance-cutoff";
import { getAttendanceCutoffInstant } from "./attendance-session";
import { statusFromAttendanceTimes } from "@shared/attendance-admin-status";

export interface DailyAttendancePatch {
  check_in_time?: Date | null;
  break_start_time?: Date | null;
  break_end_time?: Date | null;
  check_out_time?: Date | null;
}

/**
 * Update a daily attendance record under the same lock as cutoff closure.
 * Returns true when a checkout edit was rejected because the session closed.
 */
export async function updateDailyAttendanceTransaction(
  userId: number,
  date: string,
  patch: DailyAttendancePatch,
  updatedBy?: number,
): Promise<boolean> {
  let cutoffEditRejected = false;
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(4107, ${userId})`,
    );
    await closeExpiredAttendanceSessionsInTransaction(
      tx,
      userId,
      new Date(),
    );
    const rows = await tx
      .select()
      .from(attendance)
      .where(
        and(eq(attendance.user_id, userId), eq(attendance.date, date)),
      )
      .orderBy(attendance.created_at);

    const timeValues = (key: "check_in_time" | "break_start_time" | "break_end_time" |
      "lunch_start_time" | "lunch_end_time" | "check_out_time") =>
      rows.map((row) => row[key]).filter((value): value is Date => value instanceof Date);
    const earliest = (values: Date[]) => values.length
      ? new Date(Math.min(...values.map((value) => value.getTime()))) : null;
    const latest = (values: Date[]) => values.length
      ? new Date(Math.max(...values.map((value) => value.getTime()))) : null;
    const checkIn = "check_in_time" in patch ? patch.check_in_time : earliest(timeValues("check_in_time"));
    const checkOut = "check_out_time" in patch ? patch.check_out_time : latest(timeValues("check_out_time"));
    const breakStart = "break_start_time" in patch ? patch.break_start_time :
      earliest([...timeValues("break_start_time"), ...timeValues("lunch_start_time")]);
    const breakEnd = "break_end_time" in patch ? patch.break_end_time :
      latest([...timeValues("break_end_time"), ...timeValues("lunch_end_time")]);
    if ((!checkIn && (checkOut || breakStart || breakEnd)) ||
        (breakEnd && !breakStart) ||
        (checkIn && checkOut && checkOut < checkIn) ||
        (breakStart && breakEnd && breakEnd < breakStart)) {
      const error = new Error("الأوقات غير متسقة: يلزم الحضور قبل الاستراحة والانصراف، وبداية الاستراحة قبل نهايتها");
      error.name = "OrderDomainError";
      throw error;
    }

    if (Object.prototype.hasOwnProperty.call(patch, "check_out_time")) {
      const sessionCheckIn = [...rows]
        .reverse()
        .find((row) => row.check_in_time);
      if (sessionCheckIn?.check_in_time) {
        const checkInTime = new Date(sessionCheckIn.check_in_time).getTime();
        const wasAutoClosed = rows.some((row) =>
          row.notes === "auto_withdrawn_at_cutoff" &&
          row.check_out_time &&
          new Date(row.check_out_time).getTime() >= checkInTime,
        );
        const cutoff = getAttendanceCutoffInstant({
          date: sessionCheckIn.date,
          shift_snapshot: sessionCheckIn.shift_snapshot,
        });
        const now = new Date();
        const proposedCheckOut = patch.check_out_time == null
          ? null
          : new Date(patch.check_out_time);
        if (
          wasAutoClosed ||
          (cutoff && now.getTime() >= cutoff.getTime()) ||
          (proposedCheckOut &&
            (!Number.isFinite(proposedCheckOut.getTime()) ||
              (cutoff &&
                proposedCheckOut.getTime() >= cutoff.getTime())))
        ) {
          cutoffEditRejected = true;
          return;
        }
      }
    }

    if (!rows.length) {
      // No attendance exists for this day yet; create one record.
      await tx.insert(attendance).values({
        user_id: userId,
        date,
        status: statusFromAttendanceTimes(
          patch.check_in_time ?? null,
          patch.break_start_time ?? null,
          patch.break_end_time ?? null,
          patch.check_out_time ?? null,
          null,
        ),
        check_in_time: patch.check_in_time ?? null,
        break_start_time: patch.break_start_time ?? null,
        break_end_time: patch.break_end_time ?? null,
        check_out_time: patch.check_out_time ?? null,
        created_by: updatedBy ?? null,
        updated_by: updatedBy ?? null,
      } as any);
      return;
    }

    const first = rows[0] as any;
    const lastNonCutoffAction =
      [...rows].reverse().find(
        (row) => row.notes !== "auto_withdrawn_at_cutoff",
      ) ?? rows[rows.length - 1];
    const last = lastNonCutoffAction as any;
    const now = new Date();

    // Keep modified values on one row so grouped attendance reads do not see
    // an older value on another action row.
    const clearAll: Record<string, any> = {};
    if ("check_in_time" in patch) clearAll.check_in_time = null;
    if ("break_start_time" in patch) {
      clearAll.break_start_time = null;
      clearAll.lunch_start_time = null;
    }
    if ("break_end_time" in patch) {
      clearAll.break_end_time = null;
      clearAll.lunch_end_time = null;
    }
    if ("check_out_time" in patch) clearAll.check_out_time = null;

    if (Object.keys(clearAll).length > 0) {
      await tx
        .update(attendance)
        .set({ ...clearAll, updated_by: updatedBy ?? null, updated_at: now })
        .where(
          and(eq(attendance.user_id, userId), eq(attendance.date, date)),
        );
    }

    const firstSet: Record<string, any> = {};
    if ("check_in_time" in patch && patch.check_in_time != null)
      firstSet.check_in_time = patch.check_in_time;
    if ("break_start_time" in patch && patch.break_start_time != null)
      firstSet.break_start_time = patch.break_start_time;

    const lastSet: Record<string, any> = {};
    if ("break_end_time" in patch && patch.break_end_time != null)
      lastSet.break_end_time = patch.break_end_time;
    if ("check_out_time" in patch && patch.check_out_time != null)
      lastSet.check_out_time = patch.check_out_time;
    if (Object.keys(firstSet).length > 0) {
      await tx
        .update(attendance)
        .set({ ...firstSet, updated_by: updatedBy ?? null, updated_at: now })
        .where(eq(attendance.id, first.id));
    }
    if (Object.keys(lastSet).length > 0) {
      await tx
        .update(attendance)
        .set({ ...lastSet, updated_by: updatedBy ?? null, updated_at: now })
        .where(eq(attendance.id, last.id));
    }
    // Re-read the grouped action rows after applying the stamp patch. This
    // keeps the stored current status in sync with the same timestamps shown
    // by the daily overview, without altering cutoff-generated actions.
    if (last.notes !== "auto_withdrawn_at_cutoff") {
      const updatedRows = await tx.select().from(attendance).where(
        and(eq(attendance.user_id, userId), eq(attendance.date, date)),
      );
      const times = (key: "check_in_time" | "break_start_time" | "break_end_time" |
        "lunch_start_time" | "lunch_end_time" | "check_out_time") =>
        updatedRows.map((row) => row[key]).filter((v): v is Date => v instanceof Date);
      const firstTime = (values: Date[]) => values.length
        ? new Date(Math.min(...values.map((d) => d.getTime()))) : null;
      const lastTime = (values: Date[]) => values.length
        ? new Date(Math.max(...values.map((d) => d.getTime()))) : null;
      const nextStatus = statusFromAttendanceTimes(
        firstTime(times("check_in_time")),
        firstTime([...times("break_start_time"), ...times("lunch_start_time")]),
        lastTime([...times("break_end_time"), ...times("lunch_end_time")]),
        lastTime(times("check_out_time")),
        last.status,
      );
      await tx.update(attendance).set({
        status: nextStatus, updated_by: updatedBy ?? null, updated_at: now,
      }).where(eq(attendance.id, last.id));
    }
  });
  return cutoffEditRejected;
}