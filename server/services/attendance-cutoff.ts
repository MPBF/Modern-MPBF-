import { and, asc, eq, gte, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { attendance, attendance_withdrawals } from "@shared/schema";
import { db } from "../db";
import {
  isAttendanceCutoffReached,
} from "../storage/attendance-session";

/**
 * Must run inside the caller's transaction after acquiring the attendance
 * advisory lock. Checkout action rows share the original attendance date.
 */
export async function closeExpiredAttendanceSessionsInTransaction(
  tx: any,
  userId: number,
  now: Date,
): Promise<number> {
  const openCheckIns = await tx
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.user_id, userId),
        isNotNull(attendance.check_in_time),
        isNull(attendance.check_out_time),
        isNotNull(attendance.shift_snapshot),
      ),
    )
    .orderBy(asc(attendance.check_in_time), asc(attendance.id));

  let closedCount = 0;
  for (const checkIn of openCheckIns) {
    if (!checkIn.check_in_time) continue;
    const cutoff = isAttendanceCutoffReached(checkIn, now);
    if (!cutoff) continue;

    // In self-attendance, each action is a separate row. Check for an existing
    // checkout while holding the same user lock, making repeated sweeps safe.
    const [laterCheckout] = await tx
      .select({ id: attendance.id })
      .from(attendance)
      .where(
        and(
          eq(attendance.user_id, userId),
          eq(attendance.date, checkIn.date),
          isNotNull(attendance.check_out_time),
          gte(attendance.check_out_time, checkIn.check_in_time),
        ),
      )
      .limit(1);
    if (laterCheckout) continue;

    const openWithdrawals = await tx
      .select()
      .from(attendance_withdrawals)
      .where(
        and(
          eq(attendance_withdrawals.user_id, userId),
          eq(attendance_withdrawals.date, checkIn.date),
          isNull(attendance_withdrawals.ended_at),
          lte(attendance_withdrawals.started_at, cutoff),
        ),
      );
    for (const withdrawal of openWithdrawals) {
      const duration = Math.min(
        1440,
        Math.max(
          0,
          Math.round(
            (cutoff.getTime() -
              new Date(withdrawal.started_at).getTime()) /
              60_000,
          ),
        ),
      );
      await tx
        .update(attendance_withdrawals)
        .set({ ended_at: cutoff, duration_minutes: duration })
        .where(
          and(
            eq(attendance_withdrawals.id, withdrawal.id),
            isNull(attendance_withdrawals.ended_at),
          ),
        );
    }

    const kind = (checkIn.shift_snapshot as any)?.kind;
    await tx.insert(attendance).values({
      user_id: userId,
      status: "منسحب",
      check_out_time: cutoff,
      work_hours: 0,
      overtime_hours: 0,
      date: checkIn.date,
      shift_type:
        kind === "night" ? "ليلي" : kind === "flexible" ? "حر" : "صباحي",
      shift_assignment_id: checkIn.shift_assignment_id,
      shift_template_id: checkIn.shift_template_id,
      shift_snapshot: checkIn.shift_snapshot,
      notes: "auto_withdrawn_at_cutoff",
    });
    closedCount++;
  }
  return closedCount;
}

/**
 * Persist expired sessions lazily at access points and from the periodic sweep.
 * Every writer uses the same advisory lock as self-attendance transitions.
 */
export async function closeExpiredAttendanceSessions(
  userId?: number,
  now: Date = new Date(),
): Promise<number> {
  const users = userId == null
    ? (await db.execute(
        // Scan only check-in rows; snapshots are needed to calculate cutoffs.
        sql`
          SELECT DISTINCT check_in.user_id
          FROM attendance AS check_in
          WHERE check_in.check_in_time IS NOT NULL
            AND check_in.check_out_time IS NULL
            AND check_in.shift_snapshot IS NOT NULL
            AND NOT EXISTS (
              SELECT 1
              FROM attendance AS checkout
              WHERE checkout.user_id = check_in.user_id
                AND checkout.date = check_in.date
                AND checkout.check_out_time >= check_in.check_in_time
            )
        `,
      )).rows.map((row: any) => Number(row.user_id))
    : [userId];

  let closedCount = 0;
  for (const id of users) {
    if (!Number.isInteger(id) || id <= 0) continue;
    closedCount += await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(4107, ${id})`);
      return closeExpiredAttendanceSessionsInTransaction(tx, id, now);
    });
  }
  return closedCount;
}