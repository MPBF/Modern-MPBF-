import { and, eq, inArray, sql } from "drizzle-orm";

import {
  shift_assignments,
  shift_templates,
  users,
  type InsertShiftAssignment,
  type InsertShiftTemplate,
  type ShiftAssignment,
  type ShiftTemplate,
} from "@shared/schema";

import { db } from "../db";
import { withDatabaseErrorHandling } from "./core";

export async function getShiftAssignmentsByPeriod(
  year: number,
  month: number,
): Promise<ShiftAssignment[]> {
  return withDatabaseErrorHandling(
    async () =>
      db
        .select()
        .from(shift_assignments)
        .where(
          and(
            eq(shift_assignments.year, year),
            eq(shift_assignments.month, month),
          ),
        ),
    "getShiftAssignmentsByPeriod",
    "جلب جدول الورديات الشهري",
  );
}

export async function upsertShiftAssignments(
  entries: InsertShiftAssignment[],
  createdBy: number | null,
): Promise<ShiftAssignment[]> {
  if (!entries.length) return [];
  const values = entries.map((entry) => ({
    ...entry,
    notes: entry.notes ?? null,
    created_by: createdBy,
  }));
  return db
    .insert(shift_assignments)
    .values(values)
    .onConflictDoUpdate({
      target: [
        shift_assignments.user_id,
        shift_assignments.year,
        shift_assignments.month,
      ],
      set: {
        shift: sql`excluded.shift`,
        shift_template_id: sql`excluded.shift_template_id`,
        shift_snapshot: sql`excluded.shift_snapshot`,
        notes: sql`excluded.notes`,
        updated_at: sql`now()`,
      },
    })
    .returning();
}

export async function saveShiftRoster(
  year: number,
  month: number,
  upsertEntries: InsertShiftAssignment[],
  deleteUserIds: number[],
  createdBy: number | null,
  expectedRevision: string,
): Promise<ShiftAssignment[] | null> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(424242, ${year * 100 + month})`,
    );

    const [employees, currentAssignments] = await Promise.all([
      tx
        .select({ id: users.id })
        .from(users)
        .where(
          and(eq(users.include_in_attendance, true), eq(users.status, "active")),
        )
        .orderBy(users.id),
      tx
        .select()
        .from(shift_assignments)
        .where(
          and(
            eq(shift_assignments.year, year),
            eq(shift_assignments.month, month),
          ),
        ),
    ]);
    const byUser = new Map(
      currentAssignments.map((assignment) => [assignment.user_id, assignment]),
    );
    const currentRevision = JSON.stringify(
      employees.map((employee) => {
        const assignment = byUser.get(employee.id);
        return [
          employee.id,
          assignment?.id ?? null,
          assignment?.updated_at ?? null,
          assignment?.shift_template_id ?? null,
          assignment?.shift_snapshot ?? null,
        ];
      }),
    );
    if (currentRevision !== expectedRevision) return null;

    if (deleteUserIds.length) {
      await tx
        .delete(shift_assignments)
        .where(
          and(
            eq(shift_assignments.year, year),
            eq(shift_assignments.month, month),
            inArray(shift_assignments.user_id, deleteUserIds),
          ),
        );
    }
    if (upsertEntries.length) {
      await tx
        .insert(shift_assignments)
        .values(
          upsertEntries.map((entry) => ({
            ...entry,
            year,
            month,
            notes: entry.notes ?? null,
            created_by: createdBy,
          })),
        )
        .onConflictDoUpdate({
          target: [
            shift_assignments.user_id,
            shift_assignments.year,
            shift_assignments.month,
          ],
          set: {
            shift: sql`excluded.shift`,
            shift_template_id: sql`excluded.shift_template_id`,
            shift_snapshot: sql`excluded.shift_snapshot`,
            notes: sql`excluded.notes`,
            updated_at: sql`now()`,
          },
        });
    }
    return tx
      .select()
      .from(shift_assignments)
      .where(
        and(
          eq(shift_assignments.year, year),
          eq(shift_assignments.month, month),
        ),
      );
  });
}

export async function getShiftTemplates(active?: boolean): Promise<ShiftTemplate[]> {
  return withDatabaseErrorHandling(
    async () =>
      active === undefined
        ? db.select().from(shift_templates).orderBy(shift_templates.id)
        : db
            .select()
            .from(shift_templates)
            .where(eq(shift_templates.active, active))
            .orderBy(shift_templates.id),
    "getShiftTemplates",
    "جلب قوالب الورديات",
  );
}

export async function getShiftRoster(year: number, month: number) {
  const [employees, assignments] = await Promise.all([
    db
      .select({
        id: users.id,
        username: users.username,
        display_name: users.display_name,
        display_name_ar: users.display_name_ar,
        section_id: users.section_id,
      })
      .from(users)
      .where(
        and(eq(users.include_in_attendance, true), eq(users.status, "active")),
      )
      .orderBy(users.id),
    db
      .select()
      .from(shift_assignments)
      .where(
        and(
          eq(shift_assignments.year, year),
          eq(shift_assignments.month, month),
        ),
      ),
  ]);
  const byUser = new Map(assignments.map((assignment) => [assignment.user_id, assignment]));
  const rows = employees.map((employee) => ({
    employee,
    assignment: byUser.get(employee.id) ?? null,
  }));
  const roster_revision = JSON.stringify(
    rows.map((row) => [
      row.employee.id,
      row.assignment?.id ?? null,
      row.assignment?.updated_at ?? null,
      row.assignment?.shift_template_id ?? null,
      row.assignment?.shift_snapshot ?? null,
    ]),
  );
  return { rows, roster_revision };
}

export async function createShiftTemplate(
  data: InsertShiftTemplate,
  createdBy: number | null,
): Promise<ShiftTemplate> {
  const [created] = await db
    .insert(shift_templates)
    .values({ ...data, created_by: createdBy })
    .returning();
  return created;
}

export async function updateShiftTemplate(
  id: number,
  data: Partial<InsertShiftTemplate>,
): Promise<ShiftTemplate | null> {
  const [updated] = await db
    .update(shift_templates)
    .set({ ...data, updated_at: new Date() })
    .where(eq(shift_templates.id, id))
    .returning();
  return updated ?? null;
}

export async function disableShiftTemplate(
  id: number,
): Promise<ShiftTemplate | null> {
  const [updated] = await db
    .update(shift_templates)
    .set({ active: false, updated_at: new Date() })
    .where(eq(shift_templates.id, id))
    .returning();
  return updated ?? null;
}