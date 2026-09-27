import { and, eq, sql } from "drizzle-orm";
import { attendance } from "@shared/schema";
import { db } from "../db";
import { closeExpiredAttendanceSessionsInTransaction } from "../services/attendance-cutoff";
import { getAttendanceCutoffInstant } from "./attendance-session";

export interface DailyAttendancePatch {
  check_in_time?: Date | null;
  break_start_time?: Date | null;
  break_end_time?: Date | null;
  check_out_time?: Date | null;
  status?: string;
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
        status: patch.status ?? "حاضر",
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
    if (patch.status && last.notes !== "auto_withdrawn_at_cutoff") {
      lastSet.status = patch.status;
    }

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
  });
  return cutoffEditRejected;
}