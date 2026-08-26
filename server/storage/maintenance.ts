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
  maintenance_schedules,
  maintenance_schedule_machines,
  maintenance_schedule_items,
  maintenance_schedule_runs,
  maintenance_schedule_run_items,
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
  type MaintenanceSchedule,
  type CreateMaintenanceSchedule,
  type UpdateMaintenanceSchedule,
  type UpdateMaintenanceScheduleRun,
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
} from "./core";
import { HrStorage } from "./hr";

export class MaintenanceStorage extends HrStorage {


  async getAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db
          .select()
          .from(maintenance_requests)
          .orderBy(desc(maintenance_requests.id));
      },
      "getAllMaintenanceRequests",
      "جلب طلبات الصيانة",
    );
  }


  async createMaintenanceRequest(
    req: InsertMaintenanceRequest,
  ): Promise<MaintenanceRequest> {
    return withDatabaseErrorHandling(
      async () => {
        const [newReq] = await db
          .insert(maintenance_requests)
          .values(req as any)
          .returning();
        return newReq;
      },
      "createMaintenanceRequest",
      "إنشاء طلب صيانة",
    );
  }


  async updateMaintenanceRequest(
    id: number,
    updates: Partial<MaintenanceRequest>,
  ): Promise<MaintenanceRequest> {
    return withDatabaseErrorHandling(
      async () => {
        const [updated] = await db
          .update(maintenance_requests)
          .set({ ...updates })
          .where(eq(maintenance_requests.id, id))
          .returning();
        return updated;
      },
      "updateMaintenanceRequest",
      `تحديث طلب الصيانة ${id}`,
    );
  }


  async deleteMaintenanceRequest(id: number): Promise<boolean> {
    return withDatabaseErrorHandling(
      async () => {
        return await db.transaction(async (tx) => {
          // Lock the request row first so concurrent inserts of new
          // actions/reports for this request serialize behind us. No
          // DB-level cascade exists (tables created via ensure-block).
          const [locked] = await tx
            .select({ id: maintenance_requests.id })
            .from(maintenance_requests)
            .where(eq(maintenance_requests.id, id))
            .for("update");

          if (!locked) {
            return false;
          }

          // Delete dependent reports via subqueries scoped to the current
          // request at delete time (avoids the select-then-delete race).
          const actionIdsSubquery = tx
            .select({ id: maintenance_actions.id })
            .from(maintenance_actions)
            .where(eq(maintenance_actions.maintenance_request_id, id));

          await tx
            .delete(maintenance_reports)
            .where(
              inArray(
                maintenance_reports.maintenance_action_id,
                actionIdsSubquery,
              ),
            );
          await tx
            .delete(operator_negligence_reports)
            .where(
              inArray(
                operator_negligence_reports.maintenance_action_id,
                actionIdsSubquery,
              ),
            );

          await tx
            .delete(maintenance_actions)
            .where(eq(maintenance_actions.maintenance_request_id, id));

          await tx
            .delete(maintenance_requests)
            .where(eq(maintenance_requests.id, id));

          return true;
        });
      },
      "deleteMaintenanceRequest",
      `حذف طلب الصيانة ${id}`,
    );
  }


  async getSpareParts(): Promise<SparePart[]> {
    return await db.select().from(spare_parts);
  }


  async createSparePart(data: InsertSparePart): Promise<SparePart> {
    const [p] = await db.insert(spare_parts).values(data).returning();
    return p;
  }


  async getConsumableParts(): Promise<ConsumablePart[]> {
    return await db.select().from(consumable_parts);
  }


  async createConsumablePart(
    data: InsertConsumablePart,
  ): Promise<ConsumablePart> {
    const [p] = await db
      .insert(consumable_parts)
      .values(data as any)
      .returning();
    return p;
  }


  async getConsumablePartTransactions(
    partId: number,
  ): Promise<ConsumablePartTransaction[]> {
    return await db
      .select()
      .from(consumable_parts_transactions)
      .where(eq(consumable_parts_transactions.consumable_part_id, partId));
  }


  async createConsumablePartTransaction(
    data: InsertConsumablePartTransaction,
  ): Promise<ConsumablePartTransaction> {
    const [t] = await db
      .insert(consumable_parts_transactions)
      .values(data as any)
      .returning();
    return t;
  }


  async getMaintenanceActions(requestId: number): Promise<MaintenanceAction[]> {
    return await db
      .select()
      .from(maintenance_actions)
      .where(eq(maintenance_actions.maintenance_request_id, requestId));
  }


  async createMaintenanceAction(
    data: InsertMaintenanceAction,
  ): Promise<MaintenanceAction> {
    const [maxResult] = await db
      .execute(
        sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM maintenance_actions`,
      )
      .then((r) => r.rows as any[]);
    const nextNum = maxResult?.next_id || 1;
    const action_number = `MA${String(nextNum).padStart(3, "0")}`;
    try {
      const [a] = await db
        .insert(maintenance_actions)
        .values({ ...data, action_number } as any)
        .returning();
      return a;
    } catch (e: any) {
      if (e.code === "23505") {
        const retryNum = Date.now() % 100000;
        const retryNumber = `MA${String(retryNum).padStart(5, "0")}`;
        const [a] = await db
          .insert(maintenance_actions)
          .values({ ...data, action_number: retryNumber } as any)
          .returning();
        return a;
      }
      throw e;
    }
  }


  async getMaintenanceReports(): Promise<MaintenanceReport[]> {
    return await db.select().from(maintenance_reports);
  }


  async createMaintenanceReport(
    data: InsertMaintenanceReport,
  ): Promise<MaintenanceReport> {
    const [maxResult] = await db
      .execute(
        sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM maintenance_reports`,
      )
      .then((r) => r.rows as any[]);
    const nextNum = maxResult?.next_id || 1;
    const report_number = `MR${String(nextNum).padStart(3, "0")}`;
    try {
      const [r] = await db
        .insert(maintenance_reports)
        .values({ ...data, report_number } as any)
        .returning();
      return r;
    } catch (e: any) {
      if (e.code === "23505") {
        const retryNum = Date.now() % 100000;
        const retryNumber = `MR${String(retryNum).padStart(5, "0")}`;
        const [r] = await db
          .insert(maintenance_reports)
          .values({ ...data, report_number: retryNumber } as any)
          .returning();
        return r;
      }
      throw e;
    }
  }


  async getAllSpareParts(): Promise<SparePart[]> {
    return this.getSpareParts();
  }


  async updateSparePart(
    id: number,
    data: Partial<InsertSparePart>,
  ): Promise<SparePart> {
    const [u] = await db
      .update(spare_parts)
      .set(data)
      .where(eq(spare_parts.id, id))
      .returning();
    return u;
  }


  async deleteSparePart(id: number): Promise<void> {
    await db.delete(spare_parts).where(eq(spare_parts.id, id));
  }


  async getAllConsumableParts(): Promise<ConsumablePart[]> {
    return this.getConsumableParts();
  }


  async updateConsumablePart(
    id: number,
    data: Partial<ConsumablePart>,
  ): Promise<ConsumablePart> {
    const [u] = await db
      .update(consumable_parts)
      .set(data)
      .where(eq(consumable_parts.id, id))
      .returning();
    return u;
  }


  async deleteConsumablePart(id: number): Promise<void> {
    await db.delete(consumable_parts).where(eq(consumable_parts.id, id));
  }


  async getConsumablePartByBarcode(
    barcode: string,
  ): Promise<ConsumablePart | undefined> {
    const [p] = await db
      .select()
      .from(consumable_parts)
      .where(eq(consumable_parts.barcode, barcode))
      .limit(1);
    return p;
  }


  async getConsumablePartTransactionsByPartId(
    partId: number,
  ): Promise<ConsumablePartTransaction[]> {
    return this.getConsumablePartTransactions(partId);
  }


  async processConsumablePartBarcodeTransaction(data: any): Promise<any> {
    return this.createConsumablePartTransaction(data);
  }


  async getAllMaintenanceActions(): Promise<MaintenanceAction[]> {
    return await db
      .select()
      .from(maintenance_actions)
      .orderBy(desc(maintenance_actions.id));
  }


  async updateMaintenanceAction(
    id: number,
    data: Partial<MaintenanceAction>,
  ): Promise<MaintenanceAction> {
    const [u] = await db
      .update(maintenance_actions)
      .set(data)
      .where(eq(maintenance_actions.id, id))
      .returning();
    return u;
  }


  async deleteMaintenanceAction(id: number): Promise<void> {
    await db.delete(maintenance_actions).where(eq(maintenance_actions.id, id));
  }


  // ===== Preventive Maintenance =====

  async getMaintenanceComponents(
    machineType?: string,
  ): Promise<MaintenanceComponent[]> {
    const where = machineType
      ? and(
          eq(maintenance_component_catalog.enabled, true),
          eq(
            maintenance_component_catalog.machine_type,
            machineType.toLowerCase(),
          ),
        )
      : eq(maintenance_component_catalog.enabled, true);
    return await db
      .select()
      .from(maintenance_component_catalog)
      .where(where)
      .orderBy(
        maintenance_component_catalog.machine_type,
        maintenance_component_catalog.sort_order,
      );
  }


  async getAllMaintenanceComponents(): Promise<MaintenanceComponent[]> {
    return await db
      .select()
      .from(maintenance_component_catalog)
      .orderBy(
        maintenance_component_catalog.machine_type,
        maintenance_component_catalog.sort_order,
      );
  }


  async createMaintenanceComponent(
    data: InsertMaintenanceComponent,
  ): Promise<MaintenanceComponent> {
    const [created] = await db
      .insert(maintenance_component_catalog)
      .values({
        ...data,
        machine_type: data.machine_type.toLowerCase(),
      })
      .returning();
    return created;
  }


  async updateMaintenanceComponent(
    id: number,
    data: UpdateMaintenanceComponent,
  ): Promise<MaintenanceComponent> {
    const updateData: Record<string, unknown> = { ...data };
    if (typeof updateData.machine_type === "string") {
      updateData.machine_type = updateData.machine_type.toLowerCase();
    }
    const [updated] = await db
      .update(maintenance_component_catalog)
      .set(updateData)
      .where(eq(maintenance_component_catalog.id, id))
      .returning();
    if (!updated) {
      throw new Error("Maintenance component not found");
    }
    return updated;
  }


  async deleteMaintenanceComponent(id: number): Promise<void> {
    await db
      .delete(maintenance_component_catalog)
      .where(eq(maintenance_component_catalog.id, id));
  }


  async getPreventiveMaintenanceActions(machineId?: string): Promise<any[]> {
    // When filtering by machine, include actions where the machine appears in
    // the junction table (not only as the primary machine_id).
    const filteredIds = machineId
      ? (
          await db
            .select({
              id: preventive_maintenance_action_machines.preventive_action_id,
            })
            .from(preventive_maintenance_action_machines)
            .where(
              eq(preventive_maintenance_action_machines.machine_id, machineId),
            )
        ).map((r) => r.id)
      : null;

    if (filteredIds && filteredIds.length === 0) return [];

    const actions = await db
      .select()
      .from(preventive_maintenance_actions)
      .where(
        filteredIds
          ? inArray(preventive_maintenance_actions.id, filteredIds)
          : (undefined as any),
      )
      .orderBy(desc(preventive_maintenance_actions.action_date));

    if (actions.length === 0) return [];

    const actionIds = actions.map((a) => a.id);
    const items = await db
      .select()
      .from(preventive_maintenance_items)
      .where(inArray(preventive_maintenance_items.preventive_action_id, actionIds));

    const itemsByAction = new Map<number, PreventiveMaintenanceItem[]>();
    for (const it of items) {
      const arr = itemsByAction.get(it.preventive_action_id) || [];
      arr.push(it);
      itemsByAction.set(it.preventive_action_id, arr);
    }

    const machineLinks = await db
      .select()
      .from(preventive_maintenance_action_machines)
      .where(
        inArray(
          preventive_maintenance_action_machines.preventive_action_id,
          actionIds,
        ),
      );

    const machinesByAction = new Map<number, string[]>();
    for (const link of machineLinks) {
      const arr = machinesByAction.get(link.preventive_action_id) || [];
      arr.push(link.machine_id);
      machinesByAction.set(link.preventive_action_id, arr);
    }

    return actions.map((a) => ({
      ...a,
      items: itemsByAction.get(a.id) || [],
      // Fall back to the primary machine_id for any legacy rows not yet linked.
      machine_ids: machinesByAction.get(a.id) || [a.machine_id],
    }));
  }


  async createPreventiveMaintenanceAction(
    payload: CreatePreventiveMaintenance,
  ): Promise<PreventiveMaintenanceAction> {
    return await db.transaction(async (tx) => {
      // Serialize action-number generation to avoid duplicates under concurrency.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(2089)`);
      const maxResult = await tx.execute(
        sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM preventive_maintenance_actions`,
      );
      const nextNum = (maxResult.rows?.[0] as any)?.next_id || 1;
      const action_number = `PM${String(nextNum).padStart(3, "0")}`;

      const totalCost = payload.items.reduce(
        (sum, it) => sum + Number(it.cost || 0) * Number(it.quantity || 1),
        0,
      );

      // Normalize the machine list; the first machine is the "primary" stored
      // on the action row, all of them are linked via the junction table.
      const machineIds =
        payload.machine_ids && payload.machine_ids.length > 0
          ? Array.from(new Set(payload.machine_ids))
          : payload.machine_id
            ? [payload.machine_id]
            : [];
      const primaryMachineId = machineIds[0];

      const [action] = await tx
        .insert(preventive_maintenance_actions)
        .values({
          action_number,
          section_id: payload.section_id ?? null,
          machine_id: primaryMachineId,
          performed_by: payload.performed_by,
          action_date: payload.action_date ?? new Date(),
          total_cost: totalCost.toFixed(2),
          notes: payload.notes ?? null,
          status: payload.status ?? "completed",
        } as any)
        .returning();

      const itemRows = payload.items.map((it) => ({
        preventive_action_id: action.id,
        component_id: it.component_id ?? null,
        component_name_ar: it.component_name_ar,
        component_name_en: it.component_name_en,
        action_type: it.action_type,
        quantity: it.quantity ?? 1,
        cost: Number(it.cost ?? 0).toFixed(2),
        condition: it.condition ?? null,
        notes: it.notes ?? null,
      }));
      await tx.insert(preventive_maintenance_items).values(itemRows as any);

      await tx.insert(preventive_maintenance_action_machines).values(
        machineIds.map((machine_id) => ({
          preventive_action_id: action.id,
          machine_id,
        })),
      );

      return action;
    });
  }


  async updatePreventiveMaintenanceAction(
    id: number,
    payload: UpdatePreventiveMaintenance,
  ): Promise<PreventiveMaintenanceAction> {
    return await db.transaction(async (tx) => {
      const totalCost = payload.items.reduce(
        (sum, it) => sum + Number(it.cost || 0) * Number(it.quantity || 1),
        0,
      );

      const machineIds =
        payload.machine_ids && payload.machine_ids.length > 0
          ? Array.from(new Set(payload.machine_ids))
          : payload.machine_id
            ? [payload.machine_id]
            : [];
      const primaryMachineId = machineIds[0];

      const [action] = await tx
        .update(preventive_maintenance_actions)
        .set({
          section_id: payload.section_id ?? null,
          machine_id: primaryMachineId,
          action_date: payload.action_date ?? new Date(),
          total_cost: totalCost.toFixed(2),
          notes: payload.notes ?? null,
          status: payload.status ?? "completed",
          updated_at: new Date(),
        } as any)
        .where(eq(preventive_maintenance_actions.id, id))
        .returning();

      if (!action) {
        throw new Error("Preventive action not found");
      }

      // Replace line items.
      await tx
        .delete(preventive_maintenance_items)
        .where(eq(preventive_maintenance_items.preventive_action_id, id));
      const itemRows = payload.items.map((it) => ({
        preventive_action_id: id,
        component_id: it.component_id ?? null,
        component_name_ar: it.component_name_ar,
        component_name_en: it.component_name_en,
        action_type: it.action_type,
        quantity: it.quantity ?? 1,
        cost: Number(it.cost ?? 0).toFixed(2),
        condition: it.condition ?? null,
        notes: it.notes ?? null,
      }));
      await tx.insert(preventive_maintenance_items).values(itemRows as any);

      // Replace machine links.
      await tx
        .delete(preventive_maintenance_action_machines)
        .where(
          eq(preventive_maintenance_action_machines.preventive_action_id, id),
        );
      await tx.insert(preventive_maintenance_action_machines).values(
        machineIds.map((machine_id) => ({
          preventive_action_id: id,
          machine_id,
        })),
      );

      return action;
    });
  }


  async deletePreventiveMaintenanceAction(id: number): Promise<void> {
    await db
      .delete(preventive_maintenance_actions)
      .where(eq(preventive_maintenance_actions.id, id));
  }

  async getMaintenanceSchedules(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT
        s.*,
        sec.name AS section_name,
        sec.name_ar AS section_name_ar,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', sm.machine_id,
            'name', m.name,
            'name_ar', m.name_ar
          )) FILTER (WHERE sm.machine_id IS NOT NULL),
          '[]'::json
        ) AS machines,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', si.id,
            'component_id', si.component_id,
            'component_name_ar', si.component_name_ar,
            'component_name_en', si.component_name_en,
            'action_type', si.action_type,
            'quantity', si.quantity,
            'notes', si.notes
          )) FILTER (WHERE si.id IS NOT NULL),
          '[]'::json
        ) AS items,
        (
          SELECT jsonb_build_object(
            'id', r.id,
            'scheduled_date', r.scheduled_date,
            'status', r.status,
            'created_action_ids', r.created_action_ids,
            'error_message', r.error_message,
            'completed_at', r.completed_at
          )
          FROM maintenance_schedule_runs r
          WHERE r.schedule_id = s.id
          ORDER BY r.scheduled_date DESC, r.id DESC
          LIMIT 1
        ) AS last_run
      FROM maintenance_schedules s
      LEFT JOIN sections sec ON sec.id = s.section_id
      LEFT JOIN maintenance_schedule_machines sm ON sm.schedule_id = s.id
      LEFT JOIN machines m ON m.id = sm.machine_id
      LEFT JOIN maintenance_schedule_items si ON si.schedule_id = s.id
      GROUP BY s.id, sec.name, sec.name_ar
      ORDER BY s.next_due_date ASC, s.id DESC
    `);
    return result.rows as any[];
  }

  async getMaintenanceScheduleById(id: number): Promise<any | undefined> {
    const schedules = await this.getMaintenanceSchedules();
    const schedule = schedules.find((item) => Number(item.id) === id);
    if (!schedule) return undefined;
    const runs = await db
      .select()
      .from(maintenance_schedule_runs)
      .where(eq(maintenance_schedule_runs.schedule_id, id))
      .orderBy(desc(maintenance_schedule_runs.scheduled_date), desc(maintenance_schedule_runs.id));
    return { ...schedule, runs };
  }

  private async assertScheduleTargets(
    tx: any,
    sectionId: string,
    machineIds: string[],
  ) {
    const uniqueMachineIds = Array.from(new Set(machineIds));
    if (uniqueMachineIds.length === 0) {
      throw new Error("At least one machine is required");
    }
    const rows = await tx
      .select({ id: machines.id })
      .from(machines)
      .where(
        and(
          eq(machines.section_id, sectionId),
          inArray(machines.id, uniqueMachineIds),
        ),
      );
    if (rows.length !== uniqueMachineIds.length) {
      throw new Error("All schedule machines must belong to the selected section");
    }
    return uniqueMachineIds;
  }

  private scheduleDate(value: string | Date): string {
    if (typeof value === "string") return value.slice(0, 10);
    return value.toISOString().slice(0, 10);
  }

  private async getScheduleItemSnapshots(tx: any, items: any[]) {
    type CatalogComponent = { id: number; name_ar: string; name_en: string };
    const componentIds = Array.from(
      new Set(items.map((item) => Number(item.component_id))),
    );
    const components: CatalogComponent[] = await tx
      .select()
      .from(maintenance_component_catalog)
      .where(inArray(maintenance_component_catalog.id, componentIds));
    if (components.length !== componentIds.length) {
      throw new Error("One or more selected maintenance components do not exist");
    }
    const componentsById = new Map<number, CatalogComponent>(
      components.map((component) => [component.id, component]),
    );
    return items.map((item) => {
      const component = componentsById.get(Number(item.component_id));
      if (!component) throw new Error("Selected maintenance component does not exist");
      return {
        component_id: component.id,
        component_name_ar: component.name_ar,
        component_name_en: component.name_en,
        action_type: item.action_type || "inspection",
        quantity: item.quantity || 1,
        notes: item.notes || null,
      };
    });
  }

  async createMaintenanceSchedule(
    payload: CreateMaintenanceSchedule & { created_by: number },
  ): Promise<MaintenanceSchedule> {
    return db.transaction(async (tx) => {
      const machineIds = await this.assertScheduleTargets(
        tx,
        payload.section_id,
        payload.machine_ids,
      );
      const [existingMachineSchedule] = await tx
        .select({ schedule_id: maintenance_schedule_machines.schedule_id })
        .from(maintenance_schedule_machines)
        .where(eq(maintenance_schedule_machines.machine_id, machineIds[0]));
      if (existingMachineSchedule) {
        throw new Error("This machine already has a periodic maintenance schedule");
      }
      const itemSnapshots = await this.getScheduleItemSnapshots(tx, payload.items);
      const [schedule] = await tx
        .insert(maintenance_schedules)
        .values({
          name: payload.name.trim(),
          section_id: payload.section_id,
          start_date: this.scheduleDate(payload.start_date),
          next_due_date: this.scheduleDate(payload.next_due_date),
          frequency_months: payload.frequency_months ?? 12,
          is_active: payload.is_active ?? true,
          description: payload.description || null,
          created_by: payload.created_by,
        })
        .returning();
      await tx.insert(maintenance_schedule_machines).values(
        machineIds.map((machine_id) => ({
          schedule_id: schedule.id,
          machine_id,
        })),
      );
      await tx.insert(maintenance_schedule_items).values(
        itemSnapshots.map((item) => ({
          schedule_id: schedule.id,
          component_id: item.component_id,
          component_name_ar: item.component_name_ar,
          component_name_en: item.component_name_en,
          action_type: item.action_type || "inspection",
          quantity: item.quantity || 1,
          notes: item.notes || null,
        })),
      );
      return schedule;
    });
  }

  async updateMaintenanceSchedule(
    id: number,
    payload: UpdateMaintenanceSchedule & { updated_by: number },
  ): Promise<MaintenanceSchedule> {
    return db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(maintenance_schedules)
        .where(eq(maintenance_schedules.id, id))
        .for("update");
      if (!existing) throw new Error("Maintenance schedule not found");

      const sectionId = payload.section_id ?? existing.section_id;
      const machineIds = await this.assertScheduleTargets(
        tx,
        sectionId,
        payload.machine_ids ?? (
          await tx
            .select({ machine_id: maintenance_schedule_machines.machine_id })
            .from(maintenance_schedule_machines)
            .where(eq(maintenance_schedule_machines.schedule_id, id))
        ).map((row: any) => row.machine_id),
      );
      const [conflictingSchedule] = await tx
        .select({ schedule_id: maintenance_schedule_machines.schedule_id })
        .from(maintenance_schedule_machines)
        .where(eq(maintenance_schedule_machines.machine_id, machineIds[0]));
      if (conflictingSchedule && conflictingSchedule.schedule_id !== id) {
        throw new Error("This machine already has a periodic maintenance schedule");
      }
      const [schedule] = await tx
        .update(maintenance_schedules)
        .set({
          name: payload.name?.trim() || existing.name,
          section_id: sectionId,
          start_date: payload.start_date
            ? this.scheduleDate(payload.start_date)
            : existing.start_date,
          next_due_date: payload.next_due_date
            ? this.scheduleDate(payload.next_due_date)
            : existing.next_due_date,
          frequency_months:
            payload.frequency_months ?? existing.frequency_months ?? 12,
          is_active: payload.is_active ?? existing.is_active,
          description:
            payload.description === undefined
              ? existing.description
              : payload.description || null,
          updated_by: payload.updated_by,
          updated_at: new Date(),
        })
        .where(eq(maintenance_schedules.id, id))
        .returning();

      if (payload.machine_ids) {
        await tx
          .delete(maintenance_schedule_machines)
          .where(eq(maintenance_schedule_machines.schedule_id, id));
        await tx.insert(maintenance_schedule_machines).values(
          machineIds.map((machine_id) => ({
            schedule_id: id,
            machine_id,
          })),
        );
      }
      if (payload.items) {
        const itemSnapshots = await this.getScheduleItemSnapshots(tx, payload.items);
        await tx
          .delete(maintenance_schedule_items)
          .where(eq(maintenance_schedule_items.schedule_id, id));
        await tx.insert(maintenance_schedule_items).values(
          itemSnapshots.map((item) => ({
            schedule_id: id,
            component_id: item.component_id,
            component_name_ar: item.component_name_ar,
            component_name_en: item.component_name_en,
            action_type: item.action_type || "inspection",
            quantity: item.quantity || 1,
            notes: item.notes || null,
          })),
        );
      }
      return schedule;
    });
  }

  async deleteMaintenanceSchedule(id: number): Promise<boolean> {
    const deleted = await db
      .delete(maintenance_schedules)
      .where(eq(maintenance_schedules.id, id))
      .returning({ id: maintenance_schedules.id });
    return deleted.length > 0;
  }

  private addAnnualDate(value: string | Date): string {
    const dateValue = new Date(value);
    const year = dateValue.getUTCFullYear() + 1;
    const month = dateValue.getUTCMonth();
    const day = dateValue.getUTCDate();
    const next = new Date(Date.UTC(year, month, day));
    if (next.getUTCMonth() !== month) {
      next.setUTCDate(0);
    }
    return next.toISOString().slice(0, 10);
  }

  private addMaintenanceMonths(value: string | Date, months: number): string {
    const dateValue = new Date(`${this.scheduleDate(value)}T00:00:00.000Z`);
    const originalDay = dateValue.getUTCDate();
    dateValue.setUTCDate(1);
    dateValue.setUTCMonth(dateValue.getUTCMonth() + Math.max(1, months));
    const lastDay = new Date(
      Date.UTC(dateValue.getUTCFullYear(), dateValue.getUTCMonth() + 1, 0),
    ).getUTCDate();
    dateValue.setUTCDate(Math.min(originalDay, lastDay));
    return dateValue.toISOString().slice(0, 10);
  }

  async runMaintenanceSchedule(
    id: number,
    options?: { force?: boolean; performedBy?: number },
  ): Promise<any> {
    const runOptions = options ?? {};
    return db.transaction(async (tx) => {
      const [schedule] = await tx
        .select()
        .from(maintenance_schedules)
        .where(eq(maintenance_schedules.id, id))
        .for("update");
      if (!schedule) throw new Error("Maintenance schedule not found");
      if (!schedule.is_active && !runOptions.force) {
        throw new Error("Maintenance schedule is inactive");
      }

      const scheduledDate = String(schedule.next_due_date).slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      if (!runOptions.force && scheduledDate > today) {
        throw new Error("Maintenance schedule is not due yet");
      }
      const runDate =
        scheduledDate <= today
          ? scheduledDate
          : runOptions.force
            ? today
            : scheduledDate;

      const [existingRun] = await tx
        .select()
        .from(maintenance_schedule_runs)
        .where(
          and(
            eq(maintenance_schedule_runs.schedule_id, id),
            eq(maintenance_schedule_runs.scheduled_date, runDate),
          ),
        )
        .for("update");
      if (existingRun) {
        const existingItems = await tx
          .select()
          .from(maintenance_schedule_run_items)
          .where(eq(maintenance_schedule_run_items.run_id, existingRun.id))
          .orderBy(maintenance_schedule_run_items.sort_order);
        return { ...existingRun, items: existingItems, already_exists: true };
      }

      const templateItems = await tx
        .select()
        .from(maintenance_schedule_items)
        .where(eq(maintenance_schedule_items.schedule_id, id))
        .orderBy(maintenance_schedule_items.id);
      if (templateItems.length === 0) {
        throw new Error("Maintenance schedule has no checklist items");
      }

      const [run] = await tx
        .insert(maintenance_schedule_runs)
        .values({
          schedule_id: id,
          scheduled_date: runDate,
          status: "pending",
          performed_by: runOptions.performedBy ?? schedule.created_by,
          started_at: new Date(),
        })
        .returning();
      const runItems = await tx
        .insert(maintenance_schedule_run_items)
        .values(
          templateItems.map((item, index) => ({
            run_id: run.id,
            component_id: item.component_id,
            component_name_ar: item.component_name_ar,
            component_name_en: item.component_name_en,
            required_action: item.action_type,
            notes: item.notes,
            sort_order: index,
          })),
        )
        .returning();
      return { ...run, items: runItems };
    });
  }

  async getMaintenanceScheduleRun(id: number): Promise<any | undefined> {
    const [run] = await db
      .select()
      .from(maintenance_schedule_runs)
      .where(eq(maintenance_schedule_runs.id, id));
    if (!run) return undefined;
    const runItems = await db
      .select()
      .from(maintenance_schedule_run_items)
      .where(eq(maintenance_schedule_run_items.run_id, id))
      .orderBy(maintenance_schedule_run_items.sort_order);
    const detailResult = await db.execute(sql`
      SELECT s.name AS schedule_name, s.description, s.frequency_months,
             m.id AS machine_id, m.name AS machine_name, m.name_ar AS machine_name_ar,
             sec.name AS section_name, sec.name_ar AS section_name_ar
      FROM maintenance_schedule_runs r
      JOIN maintenance_schedules s ON s.id = r.schedule_id
      JOIN maintenance_schedule_machines sm ON sm.schedule_id = s.id
      JOIN machines m ON m.id = sm.machine_id
      LEFT JOIN sections sec ON sec.id = m.section_id
      WHERE r.id = ${id}
      LIMIT 1
    `);
    return { ...run, ...((detailResult.rows[0] as any) || {}), items: runItems };
  }

  async updateMaintenanceScheduleRun(
    id: number,
    payload: UpdateMaintenanceScheduleRun & { completed_by: number },
  ): Promise<any> {
    return db.transaction(async (tx) => {
      const [run] = await tx
        .select()
        .from(maintenance_schedule_runs)
        .where(eq(maintenance_schedule_runs.id, id))
        .for("update");
      if (!run) throw new Error("Periodic maintenance run not found");
      const storedItems = await tx
        .select()
        .from(maintenance_schedule_run_items)
        .where(eq(maintenance_schedule_run_items.run_id, id));
      const storedIds = new Set(storedItems.map((item) => item.id));
      if (
        payload.items.length !== storedItems.length ||
        payload.items.some((item) => !storedIds.has(item.id))
      ) {
        throw new Error("Checklist items do not match this maintenance run");
      }
      if (
        payload.status === "completed" &&
        payload.items.some((item) => !item.checked)
      ) {
        throw new Error("All checklist items must be checked before completion");
      }
      for (const item of payload.items) {
        await tx
          .update(maintenance_schedule_run_items)
          .set({
            checked: item.checked,
            condition: item.condition || null,
            result: item.result || null,
            notes: item.notes || null,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(maintenance_schedule_run_items.id, item.id),
              eq(maintenance_schedule_run_items.run_id, id),
            ),
          );
      }
      const completed = payload.status === "completed";
      const [updated] = await tx
        .update(maintenance_schedule_runs)
        .set({
          status: payload.status,
          report_notes: payload.report_notes || null,
          completed_by: completed ? payload.completed_by : null,
          completed_at: completed ? new Date() : null,
        })
        .where(eq(maintenance_schedule_runs.id, id))
        .returning();
      if (completed) {
        const [schedule] = await tx
          .select()
          .from(maintenance_schedules)
          .where(eq(maintenance_schedules.id, run.schedule_id))
          .for("update");
        if (
          schedule &&
          String(run.scheduled_date).slice(0, 10) >=
            String(schedule.next_due_date).slice(0, 10)
        ) {
          await tx
            .update(maintenance_schedules)
            .set({
              next_due_date: this.addMaintenanceMonths(
                schedule.next_due_date,
                schedule.frequency_months || 12,
              ),
              updated_at: new Date(),
            })
            .where(eq(maintenance_schedules.id, schedule.id));
        }
      }
      return updated;
    });
  }

  async getMachineMaintenanceFile(machineId: string): Promise<any | undefined> {
    const [machine] = await db.select().from(machines).where(eq(machines.id, machineId));
    if (!machine) return undefined;
    const [section] = machine.section_id
      ? await db.select().from(sections).where(eq(sections.id, machine.section_id))
      : [undefined];
    const preventive = await this.getPreventiveMaintenanceActions(machineId);
    const correctiveRows = await db
      .select({ action: maintenance_actions, request: maintenance_requests })
      .from(maintenance_actions)
      .innerJoin(
        maintenance_requests,
        eq(maintenance_actions.maintenance_request_id, maintenance_requests.id),
      )
      .where(eq(maintenance_requests.machine_id, machineId));
    const periodicResult = await db.execute(sql`
      SELECT r.*, s.name AS schedule_name, s.description,
             COALESCE(
               json_agg(jsonb_build_object(
                 'id', ri.id,
                 'component_name_ar', ri.component_name_ar,
                 'component_name_en', ri.component_name_en,
                 'required_action', ri.required_action,
                 'checked', ri.checked,
                 'condition', ri.condition,
                 'result', ri.result,
                 'notes', ri.notes
               ) ORDER BY ri.sort_order) FILTER (WHERE ri.id IS NOT NULL),
               '[]'::json
             ) AS items
      FROM maintenance_schedule_runs r
      JOIN maintenance_schedules s ON s.id = r.schedule_id
      JOIN maintenance_schedule_machines sm ON sm.schedule_id = s.id
      LEFT JOIN maintenance_schedule_run_items ri ON ri.run_id = r.id
      WHERE sm.machine_id = ${machineId}
      GROUP BY r.id, s.name, s.description
    `);
    const history = [
      ...preventive.map((action: any) => ({
        id: `preventive-${action.id}`,
        source_id: action.id,
        type: "preventive",
        number: action.action_number,
        title: action.notes || "Preventive maintenance",
        description: action.notes,
        status: action.status,
        date: action.action_date || action.created_at,
        performed_by: action.performed_by,
        items: action.items || [],
      })),
      ...correctiveRows.map(({ action, request }) => ({
        id: `corrective-${action.id}`,
        source_id: action.id,
        type: "corrective",
        number: action.action_number,
        title: action.action_type,
        description: action.text_report || action.description || request.description,
        status: request.status,
        date: action.action_date || action.created_at,
        performed_by: action.performed_by,
        items: [],
      })),
      ...(periodicResult.rows as any[]).map((run) => ({
        id: `periodic-${run.id}`,
        source_id: run.id,
        type: "periodic",
        number: `PER-${String(run.id).padStart(4, "0")}`,
        title: run.schedule_name,
        description: run.report_notes || run.description,
        status: run.status,
        date: run.completed_at || run.scheduled_date || run.created_at,
        performed_by: run.completed_by || run.performed_by,
        items: run.items || [],
      })),
    ].sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    );
    return {
      machine: {
        ...machine,
        section_name: section?.name,
        section_name_ar: section?.name_ar,
      },
      summary: {
        total: history.length,
        preventive: history.filter((item) => item.type === "preventive").length,
        corrective: history.filter((item) => item.type === "corrective").length,
        periodic: history.filter((item) => item.type === "periodic").length,
      },
      history,
    };
  }

  async processDueMaintenanceSchedules(): Promise<any> {
    const today = new Date().toISOString().slice(0, 10);
    const due = await db
      .select({ id: maintenance_schedules.id })
      .from(maintenance_schedules)
      .where(
        and(
          eq(maintenance_schedules.is_active, true),
          lte(maintenance_schedules.next_due_date, today),
        ),
      );
    const results = [];
    for (const schedule of due) {
      try {
        results.push(await this.runMaintenanceSchedule(schedule.id));
      } catch (error: any) {
        results.push({
          schedule_id: schedule.id,
          status: "failed",
          error: error?.message || "Unknown schedule error",
        });
      }
    }
    return { processed: results.length, results };
  }


  async getAllMaintenanceReports(): Promise<MaintenanceReport[]> {
    return this.getMaintenanceReports();
  }


  async updateMaintenanceReport(
    id: number,
    data: Partial<MaintenanceReport>,
  ): Promise<MaintenanceReport> {
    const [u] = await db
      .update(maintenance_reports)
      .set(data)
      .where(eq(maintenance_reports.id, id))
      .returning();
    return u;
  }


  async deleteMaintenanceReport(id: number): Promise<void> {
    await db.delete(maintenance_reports).where(eq(maintenance_reports.id, id));
  }


  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return this.getAllMaintenanceRequests();
  }


  async getMaintenanceActionsByRequestId(
    requestId: number,
  ): Promise<MaintenanceAction[]> {
    return this.getMaintenanceActions(requestId);
  }


  async getMaintenanceReportsByType(
    type?: string,
  ): Promise<MaintenanceReport[]> {
    return this.getMaintenanceReports();
  }
}

export interface MaintenanceStorage extends IStorage {}
