import {
  generateRollNumber,
  generateUUID,
  generateCertificateNumber,
} from "@shared/id-generator";
import {
  users,
  orders,
  production_orders,
  rolls,
  roll_edit_logs,
  machines,
  customers,
  maintenance_requests,
  maintenance_actions,
  maintenance_reports,
  maintenance_component_catalog,
  preventive_maintenance_actions,
  preventive_maintenance_items,
  preventive_maintenance_action_machines,
  operator_negligence_reports,
  spare_parts,
  consumable_parts,
  consumable_parts_transactions,
  quality_checks,
  attendance,
  attendance_withdrawals,
  shift_assignments,
  waste,
  sections,
  cuts,
  warehouse_receipts,
  production_settings,
  items,
  packaging_units,
  customer_products,
  locations,
  categories,
  roles,
  inventory,
  inventory_movements,
  training_records,
  admin_decisions,
  warehouse_transactions,
  training_programs,
  training_materials,
  training_enrollments,
  training_evaluations,
  training_certificates,
  performance_reviews,
  performance_criteria,
  performance_ratings,
  leave_types,
  leave_requests,
  leave_balances,
  system_settings,
  user_settings,
  factory_locations,
  notifications,
  notification_templates,
  user_requests,
  machine_queues,

  // نظام التحذيرات الذكية
  system_alerts,
  alert_rules,
  system_health_checks,
  system_performance_metrics,
  corrective_actions,
  system_analytics,

  // الملاحظات السريعة
  quick_notes,
  note_attachments,
  type QuickNote,
  type InsertQuickNote,
  type NoteAttachment,
  type InsertNoteAttachment,
  type MachineQueue,
  type InsertMachineQueue,
  violations,
  work_violations,
  work_violation_types,
  work_violation_settings,
  type Violation,
  rewards,
  employee_custody,
  employee_traits,
  wage_records,
  quality_issues,
  quality_issue_responsibles,
  quality_issue_actions,
  type QualityIssue,
  type InsertQualityIssue,
  type QualityIssueResponsible,
  type InsertQualityIssueResponsible,
  type QualityIssueAction,
  type InsertQualityIssueAction,
  quality_inspection_forms,
  type QualityInspectionForm,
  type InsertQualityInspectionForm,

  // نظام الخلط المبسط
  mixing_batches,
  batch_ingredients,
  type MixingBatch,
  type InsertMixingBatch,
  type BatchIngredient,
  type InsertBatchIngredient,
  type User,
  type SafeUser,
  type InsertUser,
  type UpsertUser,
  type NewOrder,
  type InsertNewOrder,
  type ProductionOrder,
  type InsertProductionOrder,
  type Roll,
  type InsertRoll,
  type Machine,
  type Customer,
  type Role,
  type MaintenanceRequest,
  type InsertMaintenanceRequest,
  type QualityCheck,
  type Attendance,
  type InsertAttendance,
  type AttendanceWithdrawal,
  type InsertAttendanceWithdrawal,
  type ShiftAssignment,
  type InsertShiftAssignment,
  type Reward,
  type InsertReward,
  type EmployeeCustody,
  type InsertEmployeeCustody,
  type EmployeeTrait,
  type InsertEmployeeTrait,
  type WageRecord,
  type Section,
  type Cut,
  type InsertCut,
  type WarehouseReceipt,
  type InsertWarehouseReceipt,
  type ProductionSettings,
  type InsertProductionSettings,
  type Item,
  type CustomerProduct,
  type Location,
  type Inventory,
  type InsertInventory,
  type InventoryMovement,
  type InsertInventoryMovement,
  type TrainingRecord,
  type AdminDecision,
  type WarehouseTransaction,
  type TrainingProgram,
  type InsertTrainingProgram,
  type TrainingMaterial,
  type InsertTrainingMaterial,
  type TrainingEnrollment,
  type InsertTrainingEnrollment,
  type TrainingEvaluation,
  type InsertTrainingEvaluation,
  type TrainingCertificate,
  type InsertTrainingCertificate,
  type PerformanceReview,
  type InsertPerformanceReview,
  type PerformanceCriteria,
  type InsertPerformanceCriteria,
  type PerformanceRating,
  type InsertPerformanceRating,
  type LeaveType,
  type InsertLeaveType,
  type LeaveRequest,
  type InsertLeaveRequest,
  type SystemSetting,
  type InsertSystemSetting,
  type FactoryLocation,
  type InsertFactoryLocation,
  type UserSetting,
  type InsertUserSetting,
  type LeaveBalance,
  type InsertLeaveBalance,
  type Notification,
  type InsertNotification,
  type NotificationTemplate,
  type InsertNotificationTemplate,
  type SparePart,
  type InsertSparePart,
  type ConsumablePart,
  type InsertConsumablePart,
  type ConsumablePartTransaction,
  type InsertConsumablePartTransaction,
  type MaintenanceAction,
  type InsertMaintenanceAction,
  type MaintenanceReport,
  type InsertMaintenanceReport,
  type MaintenanceComponent,
  type InsertMaintenanceComponent,
  type UpdateMaintenanceComponent,
  type PreventiveMaintenanceAction,
  type PreventiveMaintenanceItem,
  type CreatePreventiveMaintenance,
  type UpdatePreventiveMaintenance,
  type OperatorNegligenceReport,
  type InsertOperatorNegligenceReport,

  // أنواع نظام التحذيرات الذكية
  type SystemAlert,
  type InsertSystemAlert,
  type AlertRule,
  type InsertAlertRule,
  type SystemHealthCheck,
  type InsertSystemHealthCheck,
  type SystemPerformanceMetric,
  type InsertSystemPerformanceMetric,
  type CorrectiveAction,
  type InsertCorrectiveAction,
  type SystemAnalytics,
  type InsertSystemAnalytics,

  // ألوان الماستر باتش
  master_batch_colors,
  type MasterBatchColor,
  type InsertMasterBatchColor,

  // سندات المستودع
  raw_material_vouchers_in,
  raw_material_vouchers_out,
  finished_goods_vouchers_in,
  finished_goods_vouchers_out,
  industrial_waste_vouchers_in,
  industrial_waste_vouchers_out,
  inventory_counts,
  inventory_count_items,
  type RawMaterialVoucherIn,
  type InsertRawMaterialVoucherIn,
  type RawMaterialVoucherOut,
  type InsertRawMaterialVoucherOut,
  type FinishedGoodsVoucherIn,
  type InsertFinishedGoodsVoucherIn,
  type FinishedGoodsVoucherOut,
  type InsertFinishedGoodsVoucherOut,
  type IndustrialWasteVoucherIn,
  type IndustrialWasteVoucherOut,
  type InventoryCount,
  type InsertInventoryCount,
  type InventoryCountItem,
  type InsertInventoryCountItem,
  suppliers,

  // Notification Event Settings
  notification_event_settings,
  notification_event_logs,
  type NotificationEventSetting,
  type InsertNotificationEventSetting,
  type NotificationEventLog,
  type InsertNotificationEventLog,

  // Factory Snapshots
  factory_snapshots,
  type FactorySnapshot,
  type InsertFactorySnapshot,

  // Display Slides
  display_slides,
  type DisplaySlide,
  type InsertDisplaySlide,

  // Experimental Blends
  experimental_blends,
  experimental_blend_items,
  type ExperimentalBlend,
  type InsertExperimentalBlend,
  type ExperimentalBlendItem,
  type InsertExperimentalBlendItem,

  // Bag Weight Records
  bag_weight_records,
  type BagWeightRecord,
  type InsertBagWeightRecord,

  // Delivery Manifests
  delivery_manifests,
  type DeliveryManifest,
  type InsertDeliveryManifest,
  admin_tool_documents,
  type AdminToolDocument,
  type InsertAdminToolDocument,
} from "@shared/schema";
import bcrypt from "bcrypt";
import {
  eq,
  desc,
  and,
  sql,
  count,
  inArray,
  or,
  isNull,
  isNotNull,
  gte,
  lte,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import ExcelJS from "exceljs";
import QRCode from "qrcode";

import { db, pool } from "../db";
import {
  computeEmployeeAttendance,
  type EmployeeAttendanceResult,
} from "../services/attendance-engine";
import { getDataValidator } from "../services/data-validator";
import {
  isShiftType,
  factoryNowParts,
  BASE_WORK_HOURS,
  type ShiftType,
} from "@shared/shifts";
import {
  StorageBase,
  withDatabaseErrorHandling,
  invalidateProductionCache,
  getCachedData,
  setCachedData,
  CACHE_TTL,
  DatabaseError,
  clampFloorRollsLimit,
  FLOOR_ROLLS_DEFAULT_LIMIT,
  FLOOR_ROLLS_MAX_LIMIT,
  type IStorage,
  type FloorRoll,
  type FloorRollsResult,
  type NotificationManager,
  isRollProductName,
} from "./core";
import { OrdersStorage } from "./orders";

export class ProductionStorage extends OrdersStorage {


  async getGroupedCuttingQueue(): Promise<any[]> {
    const cached = getCachedData("grouped_cutting_queue");
    if (cached) return cached;

    return withDatabaseErrorHandling(
      async () => {
        const results = await this.getProductionOrdersForCuttingQueue();
        // Grouping logic can be added here if needed
        setCachedData("grouped_cutting_queue", results, CACHE_TTL.REALTIME);
        return results;
      },
      "getGroupedCuttingQueue",
      "جلب طابور القص المجمع",
    );
  }


  async getAllRolls(opts?: {
    limit?: number;
    offset?: number;
    createdAfter?: Date;
  }): Promise<Roll[]> {
    return withDatabaseErrorHandling(
      async () => {
        if (!opts) {
          return await db.select().from(rolls).orderBy(desc(rolls.id));
        }
        const limit = Math.max(1, Math.min(opts.limit ?? 50, 500));
        const offset = Math.max(0, opts.offset ?? 0);
        const base = opts.createdAfter
          ? db
              .select()
              .from(rolls)
              .where(sql`${rolls.created_at} >= ${opts.createdAfter}`)
          : db.select().from(rolls);
        return await base
          .orderBy(desc(rolls.id))
          .limit(limit)
          .offset(offset);
      },
      "getAllRolls",
      "جلب جميع الرولات",
    );
  }


  async getRollById(id: number): Promise<Roll | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [roll] = await db.select().from(rolls).where(eq(rolls.id, id));
        return roll;
      },
      "getRollById",
      `جلب الرول ${id}`,
    );
  }


  async createRoll(insertRoll: InsertRoll): Promise<Roll> {
    // If the caller didn't pre-compute a roll_number (the common path for new
    // rolls), delegate to the locked, sequence-aware implementation so we
    // never produce duplicate roll numbers under concurrent inserts.
    const anyRoll = insertRoll as any;
    if (
      !anyRoll?.roll_number &&
      typeof anyRoll?.production_order_id === "number"
    ) {
      return this.createRollWithTiming(anyRoll);
    }

    return withDatabaseErrorHandling(
      async () => {
        return await db.transaction(async (tx) => {
          // Serialize inserts per production order so callers that pass an
          // explicit roll_number still can't race against another request
          // computing the same number.
          if (typeof anyRoll?.production_order_id === "number") {
            await tx.execute(
              sql`SELECT pg_advisory_xact_lock(1003, ${anyRoll.production_order_id})`,
            );
          }
          const [roll] = await tx
            .insert(rolls)
            .values(insertRoll as any)
            .returning();
          return roll;
        });
      },
      "createRoll",
      "إنشاء رول",
    );
  }


  async updateRoll(id: number, updates: Partial<Roll>): Promise<Roll> {
    return withDatabaseErrorHandling(
      async () => {
        const [updated] = await db
          .update(rolls)
          .set({ ...updates })
          .where(eq(rolls.id, id))
          .returning();
        if (!updated) {
          throw Object.assign(new Error(`Roll ${id} not found`), { statusCode: 404 });
        }
        return updated;
      },
      "updateRoll",
      `تحديث الرول ${id}`,
    );
  }


  async deleteRoll(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.delete(rolls).where(eq(rolls.id, id));
      },
      "deleteRoll",
      `حذف الرول ${id}`,
    );
  }


  // ───────────────────────────────────────────────────────────────────────
  // Manager roll-management panel (system admin / production manager only).
  // Lists ALL rolls across every stage with the joins managers need to spot a
  // wrongly-entered roll, and lets them correct the machine and/or the product
  // (production order) with a full audit trail of who changed what.
  // ───────────────────────────────────────────────────────────────────────
  async getManagedRolls(filters?: {
    stage?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const createdByUser = alias(users, "rm_created_by");
        const printedByUser = alias(users, "rm_printed_by");
        const cutByUser = alias(users, "rm_cut_by");
        const filmMachine = alias(machines, "rm_film_machine");
        const printMachine = alias(machines, "rm_print_machine");
        const cutMachine = alias(machines, "rm_cut_machine");

        const conditions: any[] = [];
        if (filters?.stage) {
          conditions.push(eq(rolls.stage, filters.stage));
        }
        if (filters?.search && filters.search.trim()) {
          const term = `%${filters.search.trim()}%`;
          conditions.push(
            or(
              sql`${rolls.roll_number} ILIKE ${term}`,
              sql`${production_orders.production_order_number} ILIKE ${term}`,
              sql`${customers.name} ILIKE ${term}`,
              sql`${customers.name_ar} ILIKE ${term}`,
              sql`${items.name} ILIKE ${term}`,
              sql`${items.name_ar} ILIKE ${term}`,
            ),
          );
        }
        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;

        const limit = Math.min(filters?.limit ?? 200, 5000);
        const offset = filters?.offset ?? 0;

        const rows = await db
          .select({
            id: rolls.id,
            roll_number: rolls.roll_number,
            roll_seq: rolls.roll_seq,
            stage: rolls.stage,
            weight_kg: rolls.weight_kg,
            cut_weight_total_kg: rolls.cut_weight_total_kg,
            waste_kg: rolls.waste_kg,
            created_at: rolls.created_at,
            printed_at: rolls.printed_at,
            cut_completed_at: rolls.cut_completed_at,
            completed_at: rolls.completed_at,
            production_order_id: rolls.production_order_id,
            production_order_number: production_orders.production_order_number,
            customer_name: customers.name,
            customer_name_ar: customers.name_ar,
            item_name: items.name,
            item_name_ar: items.name_ar,
            size_caption: customer_products.size_caption,
            film_machine_id: rolls.film_machine_id,
            film_machine_name: filmMachine.name,
            film_machine_name_ar: filmMachine.name_ar,
            printing_machine_id: rolls.printing_machine_id,
            printing_machine_name: printMachine.name,
            printing_machine_name_ar: printMachine.name_ar,
            cutting_machine_id: rolls.cutting_machine_id,
            cutting_machine_name: cutMachine.name,
            cutting_machine_name_ar: cutMachine.name_ar,
            created_by_name: createdByUser.display_name_ar,
            created_by_username: createdByUser.username,
            printed_by_name: printedByUser.display_name_ar,
            printed_by_username: printedByUser.username,
            cut_by_name: cutByUser.display_name_ar,
            cut_by_username: cutByUser.username,
          })
          .from(rolls)
          .innerJoin(
            production_orders,
            eq(rolls.production_order_id, production_orders.id),
          )
          .innerJoin(orders, eq(production_orders.order_id, orders.id))
          .leftJoin(customers, eq(orders.customer_id, customers.id))
          .leftJoin(
            customer_products,
            eq(production_orders.customer_product_id, customer_products.id),
          )
          .leftJoin(items, eq(customer_products.item_id, items.id))
          .leftJoin(createdByUser, eq(rolls.created_by, createdByUser.id))
          .leftJoin(printedByUser, eq(rolls.printed_by, printedByUser.id))
          .leftJoin(cutByUser, eq(rolls.cut_by, cutByUser.id))
          .leftJoin(filmMachine, eq(rolls.film_machine_id, filmMachine.id))
          .leftJoin(printMachine, eq(rolls.printing_machine_id, printMachine.id))
          .leftJoin(cutMachine, eq(rolls.cutting_machine_id, cutMachine.id))
          .where(whereClause)
          .orderBy(desc(rolls.created_at))
          .limit(limit)
          .offset(offset);

        return rows;
      },
      "getManagedRolls",
      "جلب جميع الرولات للإدارة",
    );
  }


  async updateRollByManager(
    rollId: number,
    changes: {
      film_machine_id?: string | null;
      printing_machine_id?: string | null;
      cutting_machine_id?: string | null;
      production_order_id?: number;
      note?: string;
    },
    userId?: number,
  ): Promise<Roll> {
    return withDatabaseErrorHandling(
      async () => {
        const affectedPOs = new Set<number>();
        const note = changes.note?.trim() || null;

        const updated = await db.transaction(async (tx) => {
          // Lock the roll row for the duration of the txn so two concurrent
          // manager edits of the same roll can't read a stale production_order_id
          // and recompute the wrong source PO's completion metrics.
          const [roll] = await tx
            .select()
            .from(rolls)
            .where(eq(rolls.id, rollId))
            .for("update");
          if (!roll) {
            throw Object.assign(new Error(`الرول ${rollId} غير موجود`), {
              statusCode: 404,
            });
          }

          const updates: any = {};
          const logRows: any[] = [];

          // Resolve a machine's display name (for a readable audit label).
          const machineLabel = async (
            id: string | null | undefined,
          ): Promise<string | null> => {
            if (!id) return null;
            const [m] = await tx
              .select({ name: machines.name, name_ar: machines.name_ar })
              .from(machines)
              .where(eq(machines.id, id));
            return m ? m.name_ar || m.name || id : id;
          };

          // ── Machine corrections (film / printing / cutting) ──
          const machineFields: Array<
            "film_machine_id" | "printing_machine_id" | "cutting_machine_id"
          > = ["film_machine_id", "printing_machine_id", "cutting_machine_id"];
          for (const field of machineFields) {
            const next = changes[field];
            if (next === undefined) continue; // not part of this edit
            const current = (roll as any)[field] ?? null;
            const normalized = next === "" ? null : next;
            if (normalized === current) continue;
            // film machine is NOT NULL — never allow clearing it
            if (field === "film_machine_id" && !normalized) {
              throw Object.assign(
                new Error("لا يمكن ترك ماكينة الفيلم فارغة"),
                { statusCode: 400 },
              );
            }
            if (normalized) {
              const [exists] = await tx
                .select({ id: machines.id })
                .from(machines)
                .where(eq(machines.id, normalized));
              if (!exists) {
                throw Object.assign(
                  new Error(`الماكينة ${normalized} غير موجودة`),
                  { statusCode: 400 },
                );
              }
            }
            updates[field] = normalized;
            logRows.push({
              roll_id: rollId,
              field,
              old_value: current,
              new_value: normalized,
              old_label: await machineLabel(current),
              new_label: await machineLabel(normalized),
              note,
              changed_by: userId ?? null,
            });
          }

          // ── Product / production-order reassignment ──
          if (
            typeof changes.production_order_id === "number" &&
            changes.production_order_id !== roll.production_order_id
          ) {
            const newPoId = changes.production_order_id;
            const oldPoId = roll.production_order_id;

            // Serialize roll-seq allocation for the destination PO, matching
            // the lock used by roll creation so we never duplicate roll numbers.
            await tx.execute(
              sql`SELECT pg_advisory_xact_lock(1003, ${newPoId})`,
            );

            const lookup = await tx.execute(sql`
              SELECT
                po.production_order_number,
                COALESCE((
                  SELECT MAX(r.roll_seq) FROM rolls r
                  WHERE r.production_order_id = ${newPoId}
                ), 0) AS max_seq
              FROM production_orders po
              WHERE po.id = ${newPoId}
            `);
            const newPo = (lookup.rows as any[])[0];
            if (!newPo) {
              throw Object.assign(
                new Error(`أمر الإنتاج ${newPoId} غير موجود`),
                { statusCode: 400 },
              );
            }

            const oldLookup = await tx.execute(sql`
              SELECT production_order_number FROM production_orders WHERE id = ${oldPoId}
            `);
            const oldPoNumber =
              (oldLookup.rows as any[])[0]?.production_order_number ??
              String(oldPoId);

            const nextSeq = parseInt(newPo.max_seq ?? "0", 10) + 1;
            const newRollNumber = `${newPo.production_order_number}-R${String(
              nextSeq,
            ).padStart(3, "0")}`;
            const oldRollNumber = roll.roll_number;

            const qrCodeText = JSON.stringify({
              roll_number: newRollNumber,
              production_order_number: newPo.production_order_number,
              roll_seq: nextSeq,
              weight_kg: roll.weight_kg,
              created_at: new Date().toISOString(),
            });

            updates.production_order_id = newPoId;
            updates.roll_seq = nextSeq;
            updates.roll_number = newRollNumber;
            updates.qr_code_text = qrCodeText;

            affectedPOs.add(oldPoId);
            affectedPOs.add(newPoId);

            logRows.push({
              roll_id: rollId,
              field: "production_order_id",
              old_value: String(oldPoId),
              new_value: String(newPoId),
              old_label: oldPoNumber,
              new_label: newPo.production_order_number,
              note,
              changed_by: userId ?? null,
            });
            logRows.push({
              roll_id: rollId,
              field: "roll_number",
              old_value: oldRollNumber,
              new_value: newRollNumber,
              old_label: oldRollNumber,
              new_label: newRollNumber,
              note,
              changed_by: userId ?? null,
            });
          }

          if (Object.keys(updates).length === 0) {
            // Nothing actually changed — return the roll untouched.
            return roll;
          }

          const [result] = await tx
            .update(rolls)
            .set(updates)
            .where(eq(rolls.id, rollId))
            .returning();

          if (logRows.length > 0) {
            await tx.insert(roll_edit_logs).values(logRows);
          }

          return result;
        });

        // Recompute aggregates/stage for both POs AFTER the transaction commits
        // (the helper opens its own transaction, so it must run outside).
        for (const poId of Array.from(affectedPOs)) {
          await this.updateProductionOrderCompletionPercentages(poId);
        }

        return updated;
      },
      "updateRollByManager",
      `تعديل الرول ${rollId}`,
    );
  }


  async getRollEditLogs(rollId: number): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const changer = alias(users, "rm_changer");
        return await db
          .select({
            id: roll_edit_logs.id,
            roll_id: roll_edit_logs.roll_id,
            field: roll_edit_logs.field,
            old_value: roll_edit_logs.old_value,
            new_value: roll_edit_logs.new_value,
            old_label: roll_edit_logs.old_label,
            new_label: roll_edit_logs.new_label,
            note: roll_edit_logs.note,
            created_at: roll_edit_logs.created_at,
            changed_by: roll_edit_logs.changed_by,
            changed_by_name: changer.display_name_ar,
            changed_by_username: changer.username,
          })
          .from(roll_edit_logs)
          .leftJoin(changer, eq(roll_edit_logs.changed_by, changer.id))
          .where(eq(roll_edit_logs.roll_id, rollId))
          .orderBy(desc(roll_edit_logs.created_at));
      },
      "getRollEditLogs",
      `جلب سجل تعديلات الرول ${rollId}`,
    );
  }


  async getRecentRolls(limit: number): Promise<Roll[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db
          .select()
          .from(rolls)
          .orderBy(desc(rolls.created_at))
          .limit(limit);
      },
      "getRecentRolls",
      "جلب الرولات الأخيرة",
    );
  }


  async getQualityChecksByRoll(rollId: number): Promise<QualityCheck[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db
          .select()
          .from(quality_checks)
          .where(eq(quality_checks.target_id, rollId));
      },
      "getQualityChecksByRoll",
      `جلب فحوصات جودة الرول ${rollId}`,
    );
  }


  async getProductionSettings(): Promise<ProductionSettings | undefined> {
    const [s] = await db.select().from(production_settings).limit(1);
    return s;
  }


  async updateProductionSettings(
    updates: Partial<ProductionSettings>,
  ): Promise<ProductionSettings> {
    const [updated] = await db
      .update(production_settings)
      .set(updates)
      .returning();
    return updated;
  }


  async getTrainingEnrollments(filters?: {
    programId?: number;
    employeeId?: number;
  }): Promise<any[]> {
    const conditions: any[] = [];
    if (filters?.programId)
      conditions.push(eq(training_enrollments.program_id, filters.programId));
    if (filters?.employeeId)
      conditions.push(eq(training_enrollments.employee_id, filters.employeeId));
    if (conditions.length > 0) {
      return await db
        .select()
        .from(training_enrollments)
        .where(and(...conditions));
    }
    return await db.select().from(training_enrollments);
  }


  async updateEnrollment(
    id: number,
    updates: Partial<TrainingEnrollment>,
  ): Promise<TrainingEnrollment> {
    const [u] = await db
      .update(training_enrollments)
      .set(updates)
      .where(eq(training_enrollments.id, id))
      .returning();
    return u;
  }


  async getMachineQueue(machineId: number): Promise<MachineQueue[]> {
    return await db
      .select()
      .from(machine_queues)
      .where(eq(machine_queues.machine_id, String(machineId)))
      .orderBy(machine_queues.queue_position);
  }


  async updateMachineQueue(
    machineId: number,
    items: InsertMachineQueue[],
  ): Promise<MachineQueue[]> {
    await db
      .delete(machine_queues)
      .where(eq(machine_queues.machine_id, String(machineId)));
    if (items.length === 0) return [];
    return await db.insert(machine_queues).values(items).returning();
  }


  async getRolls(): Promise<Roll[]> {
    return this.getAllRolls();
  }


  async getRollsBySection(stage: string, search?: string): Promise<Roll[]> {
    const query = db
      .select()
      .from(rolls)
      .where(eq(rolls.stage, stage))
      .orderBy(desc(rolls.created_at));
    return await query;
  }


  async getRollsByStage(stage: string): Promise<Roll[]> {
    return await db
      .select()
      .from(rolls)
      .where(eq(rolls.stage, stage))
      .orderBy(desc(rolls.created_at));
  }


  // Live "floor" view: every roll still physically present on the factory floor
  // (stage in film/printing/cutting, i.e. not yet fully cut/done). Each roll
  // carries a computed `last_updated_at` (the most recent of its creation /
  // printing / cutting timestamps) and the machine/employee bound to its CURRENT
  // stage, sorted newest-activity-first. Rolls drop off once they reach 'done'.
  //
  // The feed is bounded by a server-clamped page size so it stays fast even as
  // roll volume grows. The total count is returned alongside the page so callers
  // can show progress and page through every roll without any being hidden.
  async getFloorRolls(
    opts: { limit?: number; offset?: number } = {},
  ): Promise<FloorRollsResult> {
    return withDatabaseErrorHandling(
      async () => {
        const limit = clampFloorRollsLimit(opts.limit);
        const offset = Number.isFinite(opts.offset)
          ? Math.max(0, Math.floor(opts.offset as number))
          : 0;

        // Total still on the floor, computed independently of the page so it
        // stays accurate even when `offset` lands past the last row (an empty
        // page must still report the real total). Uses the same INNER JOINs as
        // the data query so the count matches exactly what is paginated.
        const countResult = await db.execute(sql`
          SELECT COUNT(*) AS total
          FROM rolls r
          JOIN production_orders po ON r.production_order_id = po.id
          JOIN orders o ON po.order_id = o.id
          JOIN customers c ON o.customer_id = c.id
          WHERE r.stage <> 'done'
        `);
        const total = Number((countResult.rows as any[])[0]?.total ?? 0);

        const result = await db.execute(sql`
          SELECT
            r.id,
            r.roll_number,
            r.roll_seq,
            r.stage,
            r.weight_kg,
            r.cut_weight_total_kg,
            r.created_at,
            r.printed_at,
            r.cut_completed_at,
            r.roll_created_at,
            GREATEST(
              r.created_at,
              r.roll_created_at,
              r.printed_at,
              r.cut_completed_at
            )::timestamptz AS last_updated_at,
            po.production_order_number,
            c.name AS customer_name,
            c.name_ar AS customer_name_ar,
            m.name AS machine_name,
            m.name_ar AS machine_name_ar,
            COALESCE(u.display_name_ar, u.display_name, u.full_name, u.username) AS employee_name
          FROM rolls r
          JOIN production_orders po ON r.production_order_id = po.id
          JOIN orders o ON po.order_id = o.id
          JOIN customers c ON o.customer_id = c.id
          LEFT JOIN machines m ON m.id = (
            CASE r.stage
              WHEN 'film' THEN r.film_machine_id
              WHEN 'printing' THEN r.printing_machine_id
              WHEN 'cutting' THEN r.cutting_machine_id
            END
          )
          LEFT JOIN users u ON u.id = (
            CASE r.stage
              WHEN 'film' THEN r.created_by
              WHEN 'printing' THEN r.printed_by
              WHEN 'cutting' THEN r.cut_by
            END
          )
          WHERE r.stage <> 'done'
          ORDER BY last_updated_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `);

        const rows = result.rows as any[];

        const floorRolls: FloorRoll[] = rows.map((row) => ({
          id: Number(row.id),
          roll_number: row.roll_number,
          roll_seq: row.roll_seq != null ? Number(row.roll_seq) : null,
          stage: row.stage,
          weight_kg: row.weight_kg,
          cut_weight_total_kg: row.cut_weight_total_kg,
          created_at: row.created_at,
          printed_at: row.printed_at,
          cut_completed_at: row.cut_completed_at,
          roll_created_at: row.roll_created_at,
          last_updated_at: row.last_updated_at,
          production_order_number: row.production_order_number,
          customer_name: row.customer_name,
          customer_name_ar: row.customer_name_ar,
          machine_name: row.machine_name,
          machine_name_ar: row.machine_name_ar,
          employee_name: row.employee_name,
        }));

        return {
          rolls: floorRolls,
          total,
          limit,
          offset,
          hasMore: offset + floorRolls.length < total,
        };
      },
      "getFloorRolls",
      "جلب رولات أرض المصنع",
    );
  }


  // Returns "production events" from the last 24 hours, one row per
  // roll-stage action (film create / printing / cutting). Operators only ever
  // see their own events, scoped to the stages they are allowed to view.
  // Management/admin see every event with the producing employee's name so
  // the client can group by employee. The management-vs-self distinction is
  // enforced here on the server, never trusted from the client.
  async getTodaysProduction(opts: {
    userId: number;
    isManagement: boolean;
    canFilm: boolean;
    canPrinting: boolean;
    canCutting: boolean;
    from?: Date;
    to?: Date;
    stage?: "film" | "printing" | "cutting";
  }): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const { userId, isManagement, canFilm, canPrinting, canCutting } = opts;
        // Default rolling window: last 24 hours. Callers (management) may pass an
        // explicit from/to range to review a specific day or span.
        const from = opts.from ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
        const to = opts.to ?? null;
        const stageFilter = opts.stage ?? null;

        // For operators, restrict each branch to rolls THEY produced. For
        // management this is empty so all employees' rolls are returned.
        const selfFilter = (col: any) =>
          isManagement ? sql`` : sql` AND ${col} = ${userId}`;

        const buildBranch = (
          stageLiteral: "film" | "printing" | "cutting",
          employeeCol: any,
          timestampCol: any,
        ) => sql`
          SELECT
            r.id AS roll_id,
            ${stageLiteral} AS stage,
            r.roll_number,
            r.roll_seq,
            r.weight_kg,
            r.cut_weight_total_kg,
            ${timestampCol} AS event_at,
            ${employeeCol} AS employee_id,
            COALESCE(u.display_name_ar, u.display_name, u.full_name, u.username) AS employee_name,
            po.id AS production_order_id,
            po.production_order_number,
            po.production_stage,
            po.status AS po_status,
            i.name AS item_name,
            i.name_ar AS item_name_ar,
            cp.size_caption,
            c.name AS customer_name,
            c.name_ar AS customer_name_ar
          FROM rolls r
          JOIN production_orders po ON r.production_order_id = po.id
          JOIN orders o ON po.order_id = o.id
          JOIN customers c ON o.customer_id = c.id
          JOIN customer_products cp ON po.customer_product_id = cp.id
          LEFT JOIN items i ON cp.item_id = i.id
          LEFT JOIN users u ON ${employeeCol} = u.id
          WHERE ${timestampCol} >= ${from}${to ? sql` AND ${timestampCol} <= ${to}` : sql``} AND ${employeeCol} IS NOT NULL${selfFilter(employeeCol)}
        `;

        const wantStage = (s: "film" | "printing" | "cutting") =>
          stageFilter === null || stageFilter === s;

        const branches: any[] = [];
        if ((isManagement || canFilm) && wantStage("film")) {
          branches.push(
            buildBranch("film", sql`r.created_by`, sql`r.created_at`),
          );
        }
        if ((isManagement || canPrinting) && wantStage("printing")) {
          branches.push(
            buildBranch("printing", sql`r.printed_by`, sql`r.printed_at`),
          );
        }
        if ((isManagement || canCutting) && wantStage("cutting")) {
          branches.push(
            buildBranch("cutting", sql`r.cut_by`, sql`r.cut_completed_at`),
          );
        }

        if (branches.length === 0) return [];

        const unioned = sql.join(branches, sql` UNION ALL `);
        const result = await db.execute(
          sql`${unioned} ORDER BY event_at DESC`,
        );

        return (result.rows as any[]).map((row) => ({
          id: Number(row.roll_id),
          stage: row.stage,
          roll_number: row.roll_number,
          roll_seq: row.roll_seq,
          weight_kg: row.weight_kg,
          cut_weight_total_kg: row.cut_weight_total_kg,
          event_at: row.event_at,
          employee_id: row.employee_id != null ? Number(row.employee_id) : null,
          employee_name: row.employee_name,
          production_order_id:
            row.production_order_id != null
              ? Number(row.production_order_id)
              : null,
          production_order_number: row.production_order_number,
          production_stage: row.production_stage,
          status: row.po_status,
          item_name: row.item_name,
          item_name_ar: row.item_name_ar,
          size_caption: row.size_caption,
          customer_name: row.customer_name,
          customer_name_ar: row.customer_name_ar,
        }));
      },
      "getTodaysProduction",
      "جلب إنتاج اليوم",
    );
  }


  async searchRolls(query: string, filters?: any): Promise<any[]> {
    const createdByUser = alias(users, "created_by_user");
    const printedByUser = alias(users, "printed_by_user");
    const cutByUser = alias(users, "cut_by_user");
    const filmMachine = alias(machines, "film_machine");
    const printingMachine = alias(machines, "printing_machine");
    const cuttingMachine = alias(machines, "cutting_machine");

    const conditions: any[] = [];
    if (query) {
      conditions.push(sql`${rolls.roll_number} ILIKE ${`%${query}%`}`);
    }
    if (filters?.stage) {
      conditions.push(eq(rolls.stage, filters.stage));
    }
    if (filters?.productionOrderId) {
      conditions.push(eq(rolls.production_order_id, filters.productionOrderId));
    }
    if (filters?.machineId) {
      conditions.push(eq(rolls.film_machine_id, filters.machineId));
    }
    if (filters?.operatorId) {
      conditions.push(eq(rolls.created_by, filters.operatorId));
    }
    if (filters?.orderId) {
      conditions.push(
        sql`${rolls.production_order_id} IN (SELECT id FROM production_orders WHERE order_id = ${filters.orderId})`,
      );
    }
    if (filters?.startDate) {
      conditions.push(
        sql`${rolls.created_at} >= ${filters.startDate}::timestamp`,
      );
    }
    if (filters?.endDate) {
      conditions.push(
        sql`${rolls.created_at} <= ${filters.endDate}::timestamp`,
      );
    }
    if (filters?.minWeight) {
      conditions.push(sql`${rolls.weight_kg} >= ${filters.minWeight}`);
    }
    if (filters?.maxWeight) {
      conditions.push(sql`${rolls.weight_kg} <= ${filters.maxWeight}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        id: rolls.id,
        roll_id: rolls.id,
        roll_seq: rolls.roll_seq,
        roll_number: rolls.roll_number,
        production_order_id: rolls.production_order_id,
        stage: rolls.stage,
        weight_kg: rolls.weight_kg,
        cut_weight_total_kg: rolls.cut_weight_total_kg,
        waste_kg: rolls.waste_kg,
        qr_code_text: rolls.qr_code_text,
        film_machine_id: rolls.film_machine_id,
        printing_machine_id: rolls.printing_machine_id,
        cutting_machine_id: rolls.cutting_machine_id,
        created_by: rolls.created_by,
        printed_by: rolls.printed_by,
        cut_by: rolls.cut_by,
        printed_at: rolls.printed_at,
        cut_completed_at: rolls.cut_completed_at,
        created_at: rolls.created_at,
        production_order_number: production_orders.production_order_number,
        order_id: orders.id,
        order_number: orders.order_number,
        customer_id: customers.id,
        customer_name: customers.name,
        customer_name_ar: customers.name_ar,
        size_caption: customer_products.size_caption,
        item_name: items.name,
        item_name_ar: items.name_ar,
        created_by_name: createdByUser.display_name_ar,
        printed_by_name: printedByUser.display_name_ar,
        cut_by_name: cutByUser.display_name_ar,
        film_machine_name: filmMachine.name_ar,
        printing_machine_name: printingMachine.name_ar,
        cutting_machine_name: cuttingMachine.name_ar,
      })
      .from(rolls)
      .innerJoin(
        production_orders,
        eq(rolls.production_order_id, production_orders.id),
      )
      .innerJoin(orders, eq(production_orders.order_id, orders.id))
      .innerJoin(customers, eq(orders.customer_id, customers.id))
      .leftJoin(
        customer_products,
        eq(production_orders.customer_product_id, customer_products.id),
      )
      .leftJoin(items, eq(customer_products.item_id, items.id))
      .leftJoin(createdByUser, eq(rolls.created_by, createdByUser.id))
      .leftJoin(printedByUser, eq(rolls.printed_by, printedByUser.id))
      .leftJoin(cutByUser, eq(rolls.cut_by, cutByUser.id))
      .leftJoin(filmMachine, eq(rolls.film_machine_id, filmMachine.id))
      .leftJoin(
        printingMachine,
        eq(rolls.printing_machine_id, printingMachine.id),
      )
      .leftJoin(cuttingMachine, eq(rolls.cutting_machine_id, cuttingMachine.id))
      .where(whereClause)
      .orderBy(desc(rolls.created_at))
      .limit(500);

    return results;
  }


  async getRollFullDetails(id: number): Promise<any> {
    const roll = await this.getRollById(id);
    if (!roll) return null;
    const qualityChecks = await this.getQualityChecksByRoll(id);
    return { ...roll, quality_checks: qualityChecks };
  }


  async getRollHistory(id: number): Promise<any[]> {
    const roll = await db.select().from(rolls).where(eq(rolls.id, id));
    if (roll.length === 0) return [];

    const rollData = roll[0];
    const history: any[] = [];

    if (rollData.created_at) {
      history.push({
        stage: "film",
        action: "created",
        date: rollData.created_at,
        details: { weight_kg: rollData.weight_kg },
      });
    }
    if (rollData.printed_at) {
      history.push({
        stage: "printing",
        action: "printed",
        date: rollData.printed_at,
      });
    }
    if (rollData.cut_completed_at) {
      history.push({
        stage: "cutting",
        action: "completed",
        date: rollData.cut_completed_at,
      });
    }

    const qualityChecks = await this.getQualityChecksByRoll(id);
    for (const qc of qualityChecks) {
      history.push({
        stage: "quality",
        action: "quality_check",
        date: qc.created_at,
        details: qc,
      });
    }

    const wasteRecords = await db
      .select()
      .from(waste)
      .where(eq(waste.roll_id, id));
    for (const w of wasteRecords) {
      history.push({
        stage: w.stage || "unknown",
        action: "waste_recorded",
        date: w.created_at,
        details: { quantity_kg: w.quantity_wasted },
      });
    }

    history.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return history;
  }


  async getRollByBarcode(barcode: string): Promise<Roll | undefined> {
    const [r] = await db
      .select()
      .from(rolls)
      .where(eq(rolls.roll_number, barcode))
      .limit(1);
    return r;
  }


  async getRollLabelData(id: number): Promise<any> {
    return withDatabaseErrorHandling(
      async () => {
        // The label component (RollLabelPrint) expects a structured payload of
        // { roll, productionOrder, order } with joined customer / product /
        // operator / machine names. A flat rolls row is NOT enough — returning
        // it makes the client throw "Invalid label data received".
        const result = await db.execute(sql`
          SELECT
            r.id AS roll_id,
            r.roll_number,
            r.roll_seq,
            r.weight_kg,
            r.machine_id,
            r.film_machine_id,
            r.printing_machine_id,
            r.cutting_machine_id,
            r.qr_code_text,
            r.qr_png_base64,
            r.created_at,
            r.printed_at,
            r.cut_completed_at,
            r.status,
            fm.name AS film_machine_name_en,
            fm.name_ar AS film_machine_name_ar,
            pm.name AS printing_machine_name_en,
            pm.name_ar AS printing_machine_name_ar,
            cm.name AS cutting_machine_name_en,
            cm.name_ar AS cutting_machine_name_ar,
            COALESCE(cbu.display_name_ar, cbu.display_name, cbu.full_name, cbu.username) AS created_by_name,
            COALESCE(pbu.display_name_ar, pbu.display_name, pbu.full_name, pbu.username) AS printed_by_name,
            COALESCE(cutu.display_name_ar, cutu.display_name, cutu.full_name, cutu.username) AS cut_by_name,
            po.production_order_number,
            cp.size_caption,
            cp.thickness,
            cp.raw_material,
            cp.punching,
            i.name AS item_name,
            i.name_ar AS item_name_ar,
            COALESCE(cat.name_ar, cat.name) AS category_name,
            o.order_number,
            c.name AS customer_name,
            c.name_ar AS customer_name_ar
          FROM rolls r
          JOIN production_orders po ON r.production_order_id = po.id
          JOIN orders o ON po.order_id = o.id
          JOIN customers c ON o.customer_id = c.id
          JOIN customer_products cp ON po.customer_product_id = cp.id
          LEFT JOIN items i ON cp.item_id = i.id
          LEFT JOIN categories cat ON cp.category_id = cat.id
          LEFT JOIN machines fm ON r.film_machine_id = fm.id
          LEFT JOIN machines pm ON r.printing_machine_id = pm.id
          LEFT JOIN machines cm ON r.cutting_machine_id = cm.id
          LEFT JOIN users cbu ON r.created_by = cbu.id
          LEFT JOIN users pbu ON r.printed_by = pbu.id
          LEFT JOIN users cutu ON r.cut_by = cutu.id
          WHERE r.id = ${id}
        `);

        const row = (result.rows as any[])[0];
        if (!row) {
          throw new Error("الرول غير موجود");
        }

        return {
          roll: {
            id: Number(row.roll_id),
            roll_number: row.roll_number,
            roll_seq: row.roll_seq,
            weight_kg: row.weight_kg,
            machine_id: row.machine_id,
            film_machine_id: row.film_machine_id,
            printing_machine_id: row.printing_machine_id,
            cutting_machine_id: row.cutting_machine_id,
            film_machine_name: row.film_machine_name_ar || row.film_machine_name_en,
            printing_machine_name: row.printing_machine_name_ar || row.printing_machine_name_en,
            cutting_machine_name: row.cutting_machine_name_ar || row.cutting_machine_name_en,
            qr_code_text: row.qr_code_text,
            qr_png_base64: row.qr_png_base64,
            created_at: row.created_at,
            printed_at: row.printed_at,
            cut_at: row.cut_completed_at,
            created_by_name: row.created_by_name,
            printed_by_name: row.printed_by_name,
            cut_by_name: row.cut_by_name,
            status: row.status,
          },
          productionOrder: {
            production_order_number: row.production_order_number,
            item_name: row.item_name,
            item_name_ar: row.item_name_ar,
            category_name: row.category_name,
            size_caption: row.size_caption,
            thickness: row.thickness,
            raw_material: row.raw_material,
            punching: row.punching,
          },
          order: {
            order_number: row.order_number,
            customer_name: row.customer_name,
            customer_name_ar: row.customer_name_ar,
          },
        };
      },
      "getRollLabelData",
      `جلب بيانات ليبل الرول ${id}`,
    );
  }


  async getRollQR(id: number): Promise<string> {
    const roll = await this.getRollById(id);
    if (!roll) throw new Error("Roll not found");
    return QRCode.toDataURL(String(roll.id));
  }


  async getRollsForCuttingBySection(sectionId: number): Promise<any[]> {
    return await db
      .select()
      .from(rolls)
      .where(eq(rolls.stage, "cutting"))
      .orderBy(desc(rolls.created_at));
  }


  async getRollsForPrintingBySection(sectionId: number): Promise<any[]> {
    return await db
      .select()
      .from(rolls)
      .where(eq(rolls.stage, "printing"))
      .orderBy(desc(rolls.created_at));
  }


  async createRollWithTiming(data: any, existingTx?: any): Promise<Roll> {
    return withDatabaseErrorHandling(
      async () => {
        // Performs the advisory lock + sequence lookup + insert on the given
        // transaction. Acquiring the advisory lock FIRST serializes concurrent
        // roll creations for this production order, so MAX(roll_seq) is read
        // without racing.
        const insertRoll = async (tx: any): Promise<Roll> => {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(1003, ${data.production_order_id})`,
          );

          // Combine PO lookup + max(roll_seq) into a single round-trip.
          const lookup = await tx.execute(sql`
            SELECT
              po.production_order_number,
              COALESCE(cp.is_printed, false) AS is_printed,
              i.name AS item_name,
              i.name_ar AS item_name_ar,
              COALESCE((
                SELECT MAX(r.roll_seq) FROM rolls r
                WHERE r.production_order_id = ${data.production_order_id}
              ), 0) AS max_seq
            FROM production_orders po
            LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
            LEFT JOIN items i ON i.id = cp.item_id
            WHERE po.id = ${data.production_order_id}
          `);
          const po = (lookup.rows as any[])[0];

          if (!po) throw new Error("أمر الإنتاج غير موجود");

          const nextSeq = parseInt(po.max_seq ?? "0", 10) + 1;
          const rollNumber = `${po.production_order_number}-R${String(nextSeq).padStart(3, "0")}`;

          const qrCodeText = JSON.stringify({
            roll_number: rollNumber,
            production_order_number: po.production_order_number,
            roll_seq: nextSeq,
            weight_kg: data.weight_kg,
            created_at: new Date().toISOString(),
          });

          const rollData: any = {
            ...data,
            roll_seq: nextSeq,
            roll_number: rollNumber,
            qr_code_text: qrCodeText,
          };

          // Plastic-roll products skip cutting entirely. A non-printed roll is a
          // finished product the moment the film is produced; a printed roll that
          // was inline-printed at creation (stage already 'printing') is finished
          // once printed. In both cases mark the roll 'done' so it flows straight
          // to the production hall. A printed roll on a normal (non-inline) film
          // machine stays at 'film' here and is closed later by markRollAsPrinted.
          if (isRollProductName(po.item_name, po.item_name_ar)) {
            const isPrintedProduct =
              po.is_printed === true || po.is_printed === "t";
            const inlinePrinted = rollData.stage === "printing";
            if (inlinePrinted || !isPrintedProduct) {
              rollData.stage = "done";
              // Stamp cut_completed_at while keeping the temporal CHECK chain
              // (created_at <= printed_at <= cut_completed_at) valid.
              // - Inline-printed rolls already have created_at == printed_at
              //   pinned to one server timestamp by the route; reuse it so
              //   cut_completed_at == printed_at and nothing is out of order.
              // - Non-printed rolls have no pre-set timestamp; created_at would
              //   default to DB now() a hair AFTER this JS instant, breaking
              //   cut_completed_at >= created_at, so pin created_at here too.
              const baseTs: Date =
                rollData.printed_at ?? rollData.created_at ?? new Date();
              if (!rollData.created_at) {
                rollData.created_at = baseTs;
                rollData.roll_created_at = baseTs;
              }
              rollData.cut_completed_at = baseTs;
              rollData.cut_weight_total_kg = rollData.weight_kg;
              rollData.waste_kg = rollData.waste_kg ?? "0";
            }
          }

          const [created] = await tx.insert(rolls).values(rollData).returning();
          return created;
        };

        // When the caller already owns a transaction (e.g. the route locks the
        // production_orders row FOR UPDATE before this call), reuse it so the
        // roll INSERT runs on the SAME connection. Opening a separate
        // transaction here would deadlock: the insert needs an FK lock on the
        // production_orders row the caller's transaction already holds.
        // In that case the caller is responsible for running the completion
        // recalculation AFTER its transaction commits.
        if (existingTx) {
          return await insertRoll(existingTx);
        }

        const roll = await db.transaction(insertRoll);
        await this.updateProductionOrderCompletionPercentages(
          data.production_order_id,
        );
        return roll;
      },
      "createRoll",
      "إنشاء رول",
    );
  }


  async markRollAsPrinted(id: number, data?: any): Promise<Roll> {
    // Determine whether this roll belongs to a plastic-roll product. Those
    // products skip cutting, so once printed the roll is a finished product and
    // must go straight to 'done' (production hall) instead of 'printing'.
    const info = await db.execute(sql`
      SELECT i.name AS item_name, i.name_ar AS item_name_ar, r.weight_kg
      FROM rolls r
      LEFT JOIN production_orders po ON po.id = r.production_order_id
      LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
      LEFT JOIN items i ON i.id = cp.item_id
      WHERE r.id = ${id}
    `);
    const row = (info.rows as any[])[0];
    const isRollProduct = row
      ? isRollProductName(row.item_name, row.item_name_ar)
      : false;

    let updateData: any = { stage: "printing", ...data };
    if (isRollProduct) {
      const finishedAt = new Date();
      updateData = {
        ...updateData,
        stage: "done",
        printed_at: finishedAt,
        cut_completed_at: finishedAt,
        cut_weight_total_kg: row?.weight_kg,
      };
    }

    const updated = await this.updateRoll(id, updateData);
    if (updated?.production_order_id) {
      await this.updateProductionOrderCompletionPercentages(
        updated.production_order_id,
      );
    }
    return updated;
  }


  async markRollPrinted(
    id: number,
    userId?: number,
    printingMachineId?: number,
  ): Promise<Roll> {
    const updateData: any = {};
    if (userId) updateData.printed_by = userId;
    if (printingMachineId) updateData.printing_machine_id = printingMachineId;
    return this.markRollAsPrinted(id, updateData);
  }


  async createFinalRoll(data: any): Promise<Roll> {
    // Run the roll insert and the production_order flag update in the same
    // transaction so a partial failure cannot leave the order without
    // film_completed=true while the roll already exists.
    // createRollWithTiming accepts an existingTx to reuse the connection;
    // when it does, the caller is responsible for running
    // updateProductionOrderCompletionPercentages after the commit.
    const roll = await db.transaction(async (tx) => {
      const r = await this.createRollWithTiming(
        { ...data, is_last_roll: true },
        tx,
      );
      await tx
        .update(production_orders)
        .set({
          is_final_roll_created: true,
          film_completed: true,
          production_end_time: new Date(),
        })
        .where(eq(production_orders.id, data.production_order_id));
      return r;
    });
    // Recalculate completion percentages now that the transaction has committed
    await this.updateProductionOrderCompletionPercentages(
      data.production_order_id,
    );
    return roll;
  }


  async getMachinesProductionBySection(
    section: any,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any[]> {
    let query = db.select().from(machines);
    if (section) {
      query = query.where(eq(machines.section_id, String(section))) as any;
    }
    return await query.orderBy(machines.name);
  }


  async createTrainingEnrollment(
    data: InsertTrainingEnrollment,
  ): Promise<TrainingEnrollment> {
    return this.enrollUserInProgram(data);
  }


  async updateTrainingEnrollment(
    id: number,
    data: Partial<TrainingEnrollment>,
  ): Promise<TrainingEnrollment> {
    return this.updateEnrollment(id, data);
  }


  async createCut(data: InsertCut): Promise<Cut> {
    const insertData: any = {
      ...data,
      cut_weight_kg:
        typeof data.cut_weight_kg === "number"
          ? data.cut_weight_kg.toString()
          : data.cut_weight_kg,
    };
    const [c] = await db.insert(cuts).values(insertData).returning();
    return c;
  }


  async completeCutting(
    rollId: number,
    netWeight: number,
    operatorId: number,
    cuttingMachineId?: string,
  ): Promise<any> {
    return withDatabaseErrorHandling(
      async () => {
        // Pre-read the production_order_id so we can acquire the advisory lock
        // before touching any rows (lock order must be consistent with other paths).
        const [rollPre] = await db
          .select({ id: rolls.id, production_order_id: rolls.production_order_id })
          .from(rolls)
          .where(eq(rolls.id, rollId));
        if (!rollPre) throw new Error(`الرول ${rollId} غير موجود`);

        // Run the roll update + completion check inside a single transaction
        // guarded by an advisory lock (key 1007 = cutting-completion path).
        // This prevents two concurrent completions from both seeing 0 remaining
        // rolls and each trying to close the order / generate a batch number.
        const { updatedRoll, poId, isOrderCompleted } = await db.transaction(
          async (tx) => {
            await tx.execute(
              sql`SELECT pg_advisory_xact_lock(1007, ${rollPre.production_order_id})`,
            );

            // Re-read inside the transaction for a consistent snapshot
            const [roll] = await tx
              .select()
              .from(rolls)
              .where(eq(rolls.id, rollId));
            if (!roll) throw new Error(`الرول ${rollId} غير موجود`);

            const grossWeight = parseFloat(roll.weight_kg?.toString() || "0");
            const wasteKg = Math.max(0, grossWeight - netWeight);

            const updates: any = {
              stage: "done",
              cut_completed_at: new Date(),
              cut_by: operatorId,
              cut_weight_total_kg: netWeight.toString(),
              waste_kg: wasteKg.toString(),
            };
            if (cuttingMachineId) updates.cutting_machine_id = cuttingMachineId;

            const [updatedRoll] = await tx
              .update(rolls)
              .set(updates)
              .where(eq(rolls.id, rollId))
              .returning();

            // Check remaining rolls inside the locked transaction — consistent read
            const remainingRolls = await tx
              .select({ id: rolls.id })
              .from(rolls)
              .where(
                and(
                  eq(rolls.production_order_id, roll.production_order_id),
                  inArray(rolls.stage as any, ["film", "printing"]),
                ),
              );

            const isOrderCompleted = remainingRolls.length === 0;

            if (isOrderCompleted) {
              await tx
                .update(production_orders)
                .set({ status: "completed" } as any)
                .where(eq(production_orders.id, roll.production_order_id));
              invalidateProductionCache();
            }

            return {
              updatedRoll,
              poId: roll.production_order_id,
              isOrderCompleted,
            };
          },
        );

        // These must run AFTER the transaction commits so they see the final state
        await this.updateProductionOrderCompletionPercentages(poId);
        if (isOrderCompleted) {
          await this.ensureBatchNumber(poId);
          await this.maybeCompleteParentOrder(poId);
        }

        return { ...updatedRoll, is_order_completed: isOrderCompleted };
      },
      "completeCutting",
      `إكمال تقطيع الرول ${rollId}`,
    );
  }


  async getCuttingQueue(): Promise<any[]> {
    return this.getProductionOrdersForCuttingQueue();
  }


  async checkCuttingCompletion(productionOrderId: number): Promise<any> {
    return { completed: false };
  }


  async checkPrintingCompletion(productionOrderId: number): Promise<any> {
    return { completed: false };
  }


  async getProductionStats(): Promise<any> {
    return { total: 0, completed: 0, inProgress: 0 };
  }


  async getActivePrintingRollsForOperator(userId: number): Promise<any[]> {
    const rows = await db.execute(sql`
      SELECT
        r.id AS roll_id,
        r.roll_number,
        r.roll_seq,
        r.weight_kg,
        r.waste_kg,
        r.stage,
        r.roll_created_at,
        r.printed_at,
        po.id AS production_order_id,
        po.production_order_number,
        po.quantity_kg,
        po.final_quantity_kg,
        o.order_number,
        o.created_at AS order_date,
        COALESCE(c.name_ar, c.name) AS customer_name,
        c.name_ar AS customer_name_ar,
        c.name AS customer_name_en,
        c.plate_drawer_code,
        COALESCE(sr.display_name_ar, sr.display_name, sr.full_name) AS sales_rep_name,
        sr.display_name_ar AS sales_rep_name_ar,
        COALESCE(sr.display_name, sr.full_name) AS sales_rep_name_en,
        COALESCE(i.name_ar, i.name, cp.id::text) AS product_name,
        i.name_ar AS product_name_ar,
        i.name AS product_name_en,
        cp.size_caption,
        cp.printing_cylinder,
        cp.front_print_colors,
        cp.back_print_colors
      FROM rolls r
      JOIN production_orders po ON r.production_order_id = po.id
      JOIN orders o ON po.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users sr ON sr.id = c.sales_rep_id
      JOIN customer_products cp ON po.customer_product_id = cp.id
      LEFT JOIN items i ON cp.item_id = i.id
      WHERE r.stage = 'film'
        AND COALESCE(cp.is_printed, false) = true
        AND po.status IN ('pending', 'active')
      ORDER BY po.id DESC, r.roll_seq
    `);

    const grouped = new Map<number, any>();
    for (const row of rows.rows as any[]) {
      const poId = Number(row.production_order_id);
      if (!grouped.has(poId)) {
        grouped.set(poId, {
          production_order_id: poId,
          production_order_number: row.production_order_number,
          order_number: row.order_number,
          order_date: row.order_date,
          customer_name: row.customer_name,
          customer_name_ar: row.customer_name_ar,
          customer_name_en: row.customer_name_en,
          sales_rep_name: row.sales_rep_name,
          sales_rep_name_ar: row.sales_rep_name_ar,
          sales_rep_name_en: row.sales_rep_name_en,
          plate_drawer_code: row.plate_drawer_code,
          product_name: row.product_name,
          product_name_ar: row.product_name_ar,
          product_name_en: row.product_name_en,
          size_caption: row.size_caption,
          printing_cylinder: row.printing_cylinder,
          front_print_colors: Array.isArray(row.front_print_colors)
            ? row.front_print_colors
                .map((c: any) => (typeof c === "string" ? c.trim() : ""))
                .filter((c: string) => c !== "")
            : [],
          back_print_colors: Array.isArray(row.back_print_colors)
            ? row.back_print_colors
                .map((c: any) => (typeof c === "string" ? c.trim() : ""))
                .filter((c: string) => c !== "")
            : [],
          rolls: [],
          total_rolls: 0,
          total_weight: 0,
        });
      }
      const po = grouped.get(poId)!;
      po.rolls.push({
        roll_id: Number(row.roll_id),
        roll_number: row.roll_number,
        roll_seq: row.roll_seq,
        weight_kg: row.weight_kg,
        waste_kg: row.waste_kg,
        stage: row.stage,
        roll_created_at: row.roll_created_at,
        printed_at: row.printed_at,
      });
      po.total_rolls++;
      po.total_weight += parseFloat(row.weight_kg || "0");
    }
    return Array.from(grouped.values());
  }


  async getActiveCuttingRollsForOperator(userId: number): Promise<any[]> {
    const rows = await db.execute(sql`
      SELECT
        r.id AS roll_id,
        r.roll_number,
        r.roll_seq,
        r.weight_kg,
        r.waste_kg,
        r.stage,
        r.roll_created_at,
        r.printed_at,
        r.cut_completed_at,
        po.id AS production_order_id,
        po.production_order_number,
        po.quantity_kg,
        po.final_quantity_kg,
        o.order_number,
        o.created_at AS order_date,
        COALESCE(c.name_ar, c.name) AS customer_name,
        c.name_ar AS customer_name_ar,
        c.name AS customer_name_en,
        COALESCE(sr.display_name_ar, sr.display_name, sr.full_name) AS sales_rep_name,
        sr.display_name_ar AS sales_rep_name_ar,
        COALESCE(sr.display_name, sr.full_name) AS sales_rep_name_en,
        COALESCE(i.name_ar, i.name, cp.id::text) AS product_name,
        i.name_ar AS product_name_ar,
        i.name AS product_name_en,
        COALESCE(cat.name_ar, cat.name) AS category_name,
        cat.name_ar AS category_name_ar,
        cat.name AS category_name_en,
        cp.size_caption,
        cp.cutting_length_cm,
        cp.punching
      FROM rolls r
      JOIN production_orders po ON r.production_order_id = po.id
      JOIN orders o ON po.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users sr ON sr.id = c.sales_rep_id
      JOIN customer_products cp ON po.customer_product_id = cp.id
      LEFT JOIN items i ON cp.item_id = i.id
      LEFT JOIN categories cat ON cp.category_id = cat.id
      WHERE (
              r.stage = 'printing'
              OR (r.stage = 'film' AND COALESCE(cp.is_printed, false) = false)
            )
        AND po.status IN ('pending', 'active')
        -- Plastic-roll products never enter the cutting board (null-safe LEFT JOIN)
        AND COALESCE(
              i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%',
              false
            ) = false
      ORDER BY po.id DESC, r.roll_seq
    `);

    const grouped = new Map<number, any>();
    for (const row of rows.rows as any[]) {
      const poId = Number(row.production_order_id);
      if (!grouped.has(poId)) {
        grouped.set(poId, {
          production_order_id: poId,
          production_order_number: row.production_order_number,
          order_number: row.order_number,
          order_date: row.order_date,
          customer_name: row.customer_name,
          customer_name_ar: row.customer_name_ar,
          customer_name_en: row.customer_name_en,
          sales_rep_name: row.sales_rep_name,
          sales_rep_name_ar: row.sales_rep_name_ar,
          sales_rep_name_en: row.sales_rep_name_en,
          product_name: row.product_name,
          product_name_ar: row.product_name_ar,
          product_name_en: row.product_name_en,
          category_name: row.category_name,
          category_name_ar: row.category_name_ar,
          category_name_en: row.category_name_en,
          size_caption: row.size_caption,
          cutting_length_cm: row.cutting_length_cm,
          punching: row.punching,
          rolls: [],
          total_rolls: 0,
          total_weight: 0,
        });
      }
      const po = grouped.get(poId)!;
      po.rolls.push({
        roll_id: Number(row.roll_id),
        roll_number: row.roll_number,
        roll_seq: row.roll_seq,
        weight_kg: row.weight_kg,
        waste_kg: row.waste_kg,
        stage: row.stage,
        roll_created_at: row.roll_created_at,
        printed_at: row.printed_at,
        cut_completed_at: row.cut_completed_at,
      });
      po.total_rolls++;
      po.total_weight += parseFloat(row.weight_kg || "0");
    }
    return Array.from(grouped.values());
  }


  async startProduction(
    productionOrderId: number,
    data?: any,
  ): Promise<ProductionOrder> {
    return this.updateProductionOrder(productionOrderId, {
      status: "active",
      ...data,
    });
  }


  async assignToMachineQueue(
    productionOrderId: number,
    machineId: string | number,
    position?: number,
    userId?: number,
  ): Promise<any> {
    const queueItems = await this.getMachineQueue(machineId as any);
    const newItem: InsertMachineQueue = {
      machine_id: String(machineId),
      production_order_id: productionOrderId,
      queue_position: position ?? queueItems.length + 1,
    };
    if (userId) {
      (newItem as any).assigned_by = userId;
    }
    const [created] = await db
      .insert(machine_queues)
      .values(newItem)
      .returning();
    return created;
  }


  async removeFromQueue(queueId: number): Promise<void> {
    await db.delete(machine_queues).where(eq(machine_queues.id, queueId));
  }


  // Cancel the distribution ("إلغاء الفرز") for an entire stage at once:
  // remove every machine_queues entry for all machines belonging to the stage,
  // returning the orders to the backlog. Runs inside a transaction holding the
  // same per-stage advisory lock as smartDistributeOrders so a clear cannot
  // interleave with an in-flight distribution apply for the same stage.
  async clearStageQueues(stage: string): Promise<{ removed: number }> {
    const info = this.getStageInfo(stage);
    if (!info) {
      throw new Error("مرحلة غير صالحة");
    }
    let removed = 0;
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtext(${"smart_distribute_" + stage}))`,
      );
      const result = await tx.execute(sql`
        DELETE FROM machine_queues
        WHERE machine_id IN (
          SELECT m.id FROM machines m WHERE ${this.machineTypeMatchSql(info.machineTypes)}
        )
        RETURNING id
      `);
      removed = (result.rows as any[]).length;
    });
    return { removed };
  }


  async updateQueuePosition(
    queueId: number,
    newPosition: number,
  ): Promise<any> {
    const [u] = await db
      .update(machine_queues)
      .set({ queue_position: newPosition })
      .where(eq(machine_queues.id, queueId))
      .returning();
    return u;
  }


  async suggestOptimalDistribution(data?: any): Promise<any> {
    return { suggestions: [] };
  }


  async getPrintingQueue(): Promise<any[]> {
    return this.getProductionOrdersForPrintingQueue();
  }


  async getFilmQueue(): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const result = await db
          .select({
            id: production_orders.id,
            production_order_number: production_orders.production_order_number,
            order_id: production_orders.order_id,
            customer_product_id: production_orders.customer_product_id,
            quantity_kg: production_orders.quantity_kg,
            produced_quantity_kg: production_orders.produced_quantity_kg,
            film_completion_percentage:
              production_orders.film_completion_percentage,
            assigned_machine_id: production_orders.assigned_machine_id,
            status: production_orders.status,
            overrun_percentage: production_orders.overrun_percentage,
            final_quantity_kg: production_orders.final_quantity_kg,
            customer_name: customers.name,
            customer_name_ar: customers.name_ar,
            size_caption: customer_products.size_caption,
            is_printed: customer_products.is_printed,
            item_name: items.name,
            item_name_ar: items.name_ar,
          })
          .from(production_orders)
          .leftJoin(orders, eq(production_orders.order_id, orders.id))
          .leftJoin(customers, eq(orders.customer_id, customers.id))
          .leftJoin(
            customer_products,
            eq(production_orders.customer_product_id, customer_products.id),
          )
          .leftJoin(items, eq(customer_products.item_id, items.id))
          .where(
            or(
              eq(production_orders.status, "waiting_for_film"),
              eq(production_orders.status, "in_film_production"),
            ),
          )
          .orderBy(production_orders.id);

        return result.map((row) => ({
          ...row,
          product_info:
            `${row.item_name_ar || row.item_name || ""} - ${row.size_caption || ""}`.trim(),
        }));
      },
      "getFilmQueue",
      "جلب طابور الأفلام",
    );
  }


  async getPrintingStats(): Promise<any> {
    const [printed] = await db
      .select({ count: count() })
      .from(production_orders)
      .where(eq(production_orders.status, "printed"));
    return { printed: printed?.count || 0 };
  }


  async getProductionAlerts(): Promise<any[]> {
    return [];
  }


  async getProductionByDate(filters?: any): Promise<any[]> {
    return [];
  }


  async getProductionByProduct(filters?: any): Promise<any[]> {
    return [];
  }


  async getProductionEfficiencyMetrics(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    return { efficiency: 0, target: 100 };
  }


  async getProductionStatsBySection(
    section?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    return { section, total: 0 };
  }


  async getProductionSummary(options?: any): Promise<any> {
    const stats = await this.getProductionStats();
    return stats;
  }


  async getRealTimeProductionStats(): Promise<any> {
    return { active: 0, completed: 0, pending: 0 };
  }


  async getDistributionPreview(algorithm: string, params?: any): Promise<any> {
    const stage = String(params?.stage || "");
    if (!this.getStageInfo(stage)) {
      throw new Error("مرحلة غير صالحة");
    }
    const dist = await this.computeStageDistribution(stage, algorithm, params);
    return {
      totalOrders: dist.totalOrders,
      machineCount: dist.machineCount,
      efficiency: dist.efficiency,
      preview: dist.preview,
    };
  }


  async getMachineDetailAllStages(
    machineId: number,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    const machine = await this.getMachineById(machineId);
    const queue = await this.getMachineQueue(machineId);
    return { machine, queue };
  }


  async getMachineQueues(): Promise<any[]> {
    // Single query for the full queue across all machines (avoids the
    // previous one-SELECT-per-machine pattern that would exhaust the pool).
    // Returns a flat list of queue items — the shape consumed by the
    // ProductionQueues page (item.machine_id, item.queue_position, ...).
    const result = await db.execute(sql`
      SELECT q.*
      FROM machine_queues q
      JOIN machines m ON m.id = q.machine_id
      ORDER BY q.machine_id, q.queue_position
    `);
    return result.rows as any[];
  }


  async getProductionQueueBoard(stage: string): Promise<any> {
    const info = this.getStageInfo(stage);
    if (!info) {
      throw new Error("مرحلة غير صالحة");
    }
    const { completedCol } = info;
    const completed = sql.raw(`po.${completedCol}`);
    const machineTypeMatch = this.machineTypeMatchSql(info.machineTypes);
    const printedFilter =
      stage === "printing" ? sql`AND cp.is_printed = true` : sql``;

    // Active machines for this department only (inactive/down machines are
    // hidden from the planning board).
    const machineRows = (
      await db.execute(sql`
        SELECT m.id, m.name, m.name_ar, m.type, m.status,
               m.capacity_small_kg_per_hour,
               m.capacity_medium_kg_per_hour,
               m.capacity_large_kg_per_hour
        FROM machines m
        WHERE ${machineTypeMatch}
          AND LOWER(m.status) = 'active'
        ORDER BY m.id
      `)
    ).rows as any[];

    // Queue items for those machines, excluding stage-completed / cancelled.
    const queueRows = (
      await db.execute(sql`
        SELECT q.id AS queue_id, q.machine_id, q.queue_position, q.assigned_at,
               u.display_name AS assigned_by_name,
               u.display_name_ar AS assigned_by_name_ar,
               ${this.enrichedPoColumns()}
        FROM machine_queues q
        JOIN machines m ON m.id = q.machine_id
        JOIN production_orders po ON po.id = q.production_order_id
        LEFT JOIN users u ON u.id = q.assigned_by
        ${this.enrichedPoJoins()}
        WHERE ${machineTypeMatch}
          AND po.status <> 'cancelled'
          AND ${completed} IS NOT TRUE
        ORDER BY q.machine_id, q.queue_position
      `)
    ).rows as any[];

    // Backlog: eligible orders for this stage not assigned to any machine of
    // this department's type.
    const backlogRows = (
      await db.execute(sql`
        SELECT ${this.enrichedPoColumns()}
        FROM production_orders po
        ${this.enrichedPoJoins()}
        WHERE po.status IN ('pending', 'active')
          AND ${completed} IS NOT TRUE
          ${printedFilter}
          AND po.id NOT IN (
            SELECT q.production_order_id
            FROM machine_queues q
            JOIN machines m ON m.id = q.machine_id
            WHERE ${machineTypeMatch}
          )
        ORDER BY po.id
      `)
    ).rows as any[];

    // Configured shift length (working hours per day). Falls back to 20 (the
    // previous fixed multi-shift assumption) when not configured.
    const profileRows = (
      await db.execute(sql`
        SELECT working_hours_per_day FROM company_profile LIMIT 1
      `)
    ).rows as any[];
    const configuredHours = profileRows[0]?.working_hours_per_day;
    const parsedHours =
      configuredHours == null ? NaN : parseFloat(String(configuredHours));
    const HOURS_PER_DAY = !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : 20;

    const queueByMachine = new Map<string, any[]>();
    for (const row of queueRows) {
      const list = queueByMachine.get(row.machine_id) || [];
      list.push(this.mapEnrichedRow(row));
      queueByMachine.set(row.machine_id, list);
    }

    const machines = machineRows.map((m) => {
      const queue = queueByMachine.get(m.id) || [];
      const totalKg = queue.reduce(
        (sum, q) => sum + (parseFloat(String(q.final_quantity_kg)) || 0),
        0,
      );
      // Sum work content using the size-appropriate rate for each order rather
      // than a single blended machine rate.
      const estimatedHours = queue.reduce((sum, q) => {
        const kg = parseFloat(String(q.final_quantity_kg)) || 0;
        const rate = this.machineRateForWidth(m, q.width);
        return sum + (rate > 0 ? kg / rate : 0);
      }, 0);
      // Effective average throughput for display (kg / total work hours).
      const rate =
        estimatedHours > 0 ? totalKg / estimatedHours : this.machineRateKgPerHour(m);
      const estimatedDays =
        estimatedHours > 0 ? Math.ceil(estimatedHours / HOURS_PER_DAY) : 0;
      // Only machines that are actively running can be given a projected finish
      // date. Machines in maintenance or down are not producing, so no finish
      // date is projected (the work content/days are still reported).
      const available = m.status === "active";
      const finishDate =
        available && estimatedDays > 0
          ? new Date(
              Date.now() + estimatedDays * 24 * 60 * 60 * 1000,
            ).toISOString()
          : null;
      return {
        ...m,
        queue,
        stats: {
          orderCount: queue.length,
          totalKg: Math.round(totalKg * 100) / 100,
          ratePerHour: Math.round(rate * 100) / 100,
          estimatedHours: Math.round(estimatedHours * 100) / 100,
          estimatedDays,
          hoursPerDay: HOURS_PER_DAY,
          available,
          projectedFinish: finishDate,
        },
      };
    });

    const backlog = backlogRows.map((r) => this.mapEnrichedRow(r));
    return { stage, machines, backlog };
  }


  // Validate that a machine can run an order for a stage, then append it to the
  // end of that machine's queue.
  async assignToProductionQueue(
    productionOrderId: number,
    machineId: string,
    stage: string,
    userId?: number,
  ): Promise<any> {
    const info = this.getStageInfo(stage);
    if (!info) throw new Error("مرحلة غير صالحة");

    const [machine] = await db
      .select()
      .from(machines)
      .where(eq(machines.id, machineId));
    if (!machine) throw new Error("الماكينة غير موجودة");
    if (!info.machineTypes.includes(String(machine.type).toLowerCase()))
      throw new Error("الماكينة لا تناسب هذه المرحلة");
    if (machine.status !== "active")
      throw new Error("الماكينة غير متاحة (ليست نشطة)");

    const [po] = await db
      .select()
      .from(production_orders)
      .where(eq(production_orders.id, productionOrderId));
    if (!po) throw new Error("أمر الإنتاج غير موجود");

    if (stage === "printing") {
      const [cp] = await db
        .select({ is_printed: customer_products.is_printed })
        .from(customer_products)
        .where(eq(customer_products.id, po.customer_product_id));
      if (!cp?.is_printed)
        throw new Error("هذا المنتج غير مطبوع - لا يمكن إضافته لطابور الطباعة");
    }

    // Prevent duplicate assignment to a machine of the same department type.
    const existing = (
      await db.execute(sql`
        SELECT q.id
        FROM machine_queues q
        JOIN machines m ON m.id = q.machine_id
        WHERE ${this.machineTypeMatchSql(info.machineTypes)}
          AND q.production_order_id = ${productionOrderId}
      `)
    ).rows as any[];
    if (existing.length > 0)
      throw new Error("أمر الإنتاج مخصص بالفعل لماكينة في هذه المرحلة");

    // Film machines must hold orders of a single raw-material type. Block
    // assigning an order whose material differs from what the machine already
    // holds (e.g. cannot mix HDPE with LDPE on the same film machine).
    if (stage === "film") {
      const [cp] = await db
        .select({
          raw_material: customer_products.raw_material,
          width: customer_products.width,
          universal_thickness: customer_products.universal_thickness,
        })
        .from(customer_products)
        .where(eq(customer_products.id, po.customer_product_id));
      const newMaterial = cp?.raw_material
        ? String(cp.raw_material).trim()
        : "";

      // HARD capability checks against the machine's specs. Color
      // (master_batch) is intentionally not enforced (soft preference only).
      if (!this.filmMaterialTypeMatch((machine as any).raw_material_type, newMaterial)) {
        const machineType = String((machine as any).raw_material_type || "").trim() || "غير محدد";
        const orderType = newMaterial || "غير محدد";
        throw new Error(
          `نوع المادة الخام للأمر (${orderType}) لا يطابق قدرة هذه الماكينة (${machineType}). يرجى اختيار ماكينة مناسبة.`,
        );
      }
      if (!this.numInRange(cp?.width, (machine as any).min_width_cm, (machine as any).max_width_cm)) {
        throw new Error(
          `عرض المنتج (${cp?.width ?? "غير محدد"} سم) خارج النطاق المدعوم لهذه الماكينة. يرجى اختيار ماكينة مناسبة.`,
        );
      }
      if (!this.numInRange(cp?.universal_thickness, (machine as any).min_thickness, (machine as any).max_thickness)) {
        throw new Error(
          `السماكة العالمية للمنتج (${cp?.universal_thickness ?? "غير محدد"}) خارج النطاق المدعوم لهذه الماكينة. يرجى اختيار ماكينة مناسبة.`,
        );
      }

      const matRows = (
        await db.execute(sql`
          SELECT DISTINCT TRIM(cp.raw_material) AS raw_material
          FROM machine_queues q
          JOIN production_orders po ON po.id = q.production_order_id
          JOIN customer_products cp ON cp.id = po.customer_product_id
          WHERE q.machine_id = ${machineId}
            AND cp.raw_material IS NOT NULL
            AND TRIM(cp.raw_material) <> ''
        `)
      ).rows as any[];
      const distinct = Array.from(
        new Set(
          matRows
            .map((r) => String(r.raw_material).trim())
            .filter((m) => m.length > 0),
        ),
      );
      // Empty machine accepts any order; otherwise the machine must already
      // hold exactly one material that equals this order's material.
      const eligible =
        distinct.length === 0 ||
        (distinct.length === 1 && distinct[0] === newMaterial);
      if (!eligible) {
        const machineMat = distinct[0] || "غير محدد";
        const orderMat = newMaterial || "غير محدد";
        throw new Error(
          `لا يمكن خلط أنواع المواد الخام في ماكينة الفيلم الواحدة. هذه الماكينة مخصصة للمادة (${machineMat})، ولا يمكن إضافة أمر بمادة (${orderMat}). يرجى اختيار ماكينة أخرى.`,
        );
      }
    }

    const queueItems = await this.getMachineQueue(machineId as any);
    const newItem: InsertMachineQueue = {
      machine_id: machineId,
      production_order_id: productionOrderId,
      queue_position: queueItems.length + 1,
    };
    if (userId) (newItem as any).assigned_by = userId;
    const [created] = await db
      .insert(machine_queues)
      .values(newItem)
      .returning();
    return created;
  }


  // Return historical production patterns for a machine based on completed
  // rolls. Used by the frontend "learning insight" badge to show operators
  // what the machine historically produces most (dominant material, width
  // range, top colours). Pure read — no mutations.
  async getQueueLearningInsights(
    machineId: string,
    stage: string,
  ): Promise<any> {
    const info = this.getStageInfo(stage);
    if (!info) return null;

    // Map stage → the roll column that records which machine was used.
    const machineCol =
      stage === "film"
        ? "film_machine_id"
        : stage === "printing"
          ? "printing_machine_id"
          : "cutting_machine_id";

    const rows = (
      await db.execute(sql`
        SELECT
          cp.raw_material,
          cp.master_batch_id,
          mb.name_ar   AS master_batch_name_ar,
          mb.name      AS master_batch_name,
          mb.color_hex AS master_batch_color_hex,
          cp.width,
          COUNT(r.id)  AS roll_count
        FROM rolls r
        JOIN production_orders po ON po.id = r.production_order_id
        JOIN customer_products  cp ON cp.id = po.customer_product_id
        LEFT JOIN master_batch_colors mb ON mb.id = cp.master_batch_id
        WHERE r.${sql.raw(machineCol)} = ${machineId}
        GROUP BY
          cp.raw_material, cp.master_batch_id,
          mb.name_ar, mb.name, mb.color_hex, cp.width
        ORDER BY roll_count DESC
      `)
    ).rows as any[];

    if (rows.length === 0) return null;

    const matCounts = new Map<string, number>();
    const colorMap = new Map<
      string,
      { name_ar: string; name: string; hex: string; count: number }
    >();
    const widths: number[] = [];

    for (const r of rows) {
      const mat = String(r.raw_material ?? "").trim();
      const cnt = Number(r.roll_count) || 0;
      if (mat) matCounts.set(mat, (matCounts.get(mat) || 0) + cnt);

      const colorId = String(r.master_batch_id ?? "").trim();
      if (colorId) {
        const ex = colorMap.get(colorId);
        if (ex) ex.count += cnt;
        else
          colorMap.set(colorId, {
            name_ar: r.master_batch_name_ar,
            name: r.master_batch_name,
            hex: r.master_batch_color_hex,
            count: cnt,
          });
      }

      const w = parseFloat(String(r.width ?? ""));
      if (!isNaN(w) && w > 0) {
        // Push one entry per roll to weight the average correctly.
        for (let i = 0; i < cnt; i++) widths.push(w);
      }
    }

    const dominantMaterial =
      [...matCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topColors = [...colorMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([id, v]) => ({ id, ...v }));
    const minWidth = widths.length > 0 ? Math.round(Math.min(...widths)) : null;
    const maxWidth = widths.length > 0 ? Math.round(Math.max(...widths)) : null;
    const totalRolls = [...matCounts.values()].reduce((a, b) => a + b, 0);

    return {
      dominantMaterial,
      topColors,
      widthRange:
        minWidth !== null ? { min: minWidth, max: maxWidth } : null,
      totalRolls,
    };
  }
}

export interface ProductionStorage extends IStorage {}
