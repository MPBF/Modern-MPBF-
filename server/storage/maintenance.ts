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
