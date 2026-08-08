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
import { MaintenanceStorage } from "./maintenance";

export class QualityStorage extends MaintenanceStorage {


  async createQualityCheck(check: any): Promise<QualityCheck> {
    return withDatabaseErrorHandling(
      async () => {
        const [newCheck] = await db
          .insert(quality_checks)
          .values(check)
          .returning();
        return newCheck;
      },
      "createQualityCheck",
      "إنشاء فحص جودة",
    );
  }


  async getQualityChecks(rollId?: number): Promise<QualityCheck[]> {
    if (rollId) return this.getQualityChecksByRoll(rollId);
    return await db
      .select()
      .from(quality_checks)
      .orderBy(desc(quality_checks.id));
  }


  async getQualityIssues(filters?: {
    status?: string;
    source?: string;
    severity?: string;
    customer_id?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any[]> {
    const conditions: any[] = [];
    if (filters?.status)
      conditions.push(eq(quality_issues.status, filters.status));
    if (filters?.source)
      conditions.push(eq(quality_issues.source, filters.source));
    if (filters?.severity)
      conditions.push(eq(quality_issues.severity, filters.severity));
    if (filters?.customer_id)
      conditions.push(eq(quality_issues.customer_id, filters.customer_id));
    if (filters?.dateFrom)
      conditions.push(
        sql`${quality_issues.created_at} >= ${filters.dateFrom}::timestamp`,
      );
    if (filters?.dateTo)
      conditions.push(
        sql`${quality_issues.created_at} <= (${filters.dateTo}::date + interval '1 day')`,
      );

    const detectedByUser = alias(users, "detected_by_user");
    const resolvedByUser = alias(users, "resolved_by_user");

    const results = await db
      .select({
        id: quality_issues.id,
        issue_number: quality_issues.issue_number,
        source: quality_issues.source,
        severity: quality_issues.severity,
        status: quality_issues.status,
        category: quality_issues.category,
        stage: quality_issues.stage,
        production_order_id: quality_issues.production_order_id,
        order_id: quality_issues.order_id,
        roll_id: quality_issues.roll_id,
        customer_id: quality_issues.customer_id,
        description: quality_issues.description,
        customer_complaint_details: quality_issues.customer_complaint_details,
        customer_action_taken: quality_issues.customer_action_taken,
        root_cause: quality_issues.root_cause,
        corrective_action: quality_issues.corrective_action,
        preventive_action: quality_issues.preventive_action,
        estimated_loss: quality_issues.estimated_loss,
        loss_details: quality_issues.loss_details,
        detected_by: quality_issues.detected_by,
        resolved_by: quality_issues.resolved_by,
        detected_at: quality_issues.detected_at,
        resolved_at: quality_issues.resolved_at,
        created_at: quality_issues.created_at,
        updated_at: quality_issues.updated_at,
        customer_name: customers.name,
        customer_name_ar: customers.name_ar,
        detected_by_name: detectedByUser.display_name,
        detected_by_name_ar: detectedByUser.display_name_ar,
        resolved_by_name: resolvedByUser.display_name,
        resolved_by_name_ar: resolvedByUser.display_name_ar,
        production_order_number: production_orders.production_order_number,
        order_number: orders.order_number,
      })
      .from(quality_issues)
      .leftJoin(customers, eq(quality_issues.customer_id, customers.id))
      .leftJoin(
        detectedByUser,
        eq(quality_issues.detected_by, detectedByUser.id),
      )
      .leftJoin(
        resolvedByUser,
        eq(quality_issues.resolved_by, resolvedByUser.id),
      )
      .leftJoin(
        production_orders,
        eq(quality_issues.production_order_id, production_orders.id),
      )
      .leftJoin(orders, eq(quality_issues.order_id, orders.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(quality_issues.created_at));

    return results;
  }


  async getQualityIssueById(id: number): Promise<any> {
    const detectedByUser = alias(users, "detected_by_user");
    const resolvedByUser = alias(users, "resolved_by_user");

    const [issue] = await db
      .select({
        id: quality_issues.id,
        issue_number: quality_issues.issue_number,
        source: quality_issues.source,
        severity: quality_issues.severity,
        status: quality_issues.status,
        category: quality_issues.category,
        stage: quality_issues.stage,
        production_order_id: quality_issues.production_order_id,
        order_id: quality_issues.order_id,
        roll_id: quality_issues.roll_id,
        customer_id: quality_issues.customer_id,
        description: quality_issues.description,
        customer_complaint_details: quality_issues.customer_complaint_details,
        customer_action_taken: quality_issues.customer_action_taken,
        root_cause: quality_issues.root_cause,
        corrective_action: quality_issues.corrective_action,
        preventive_action: quality_issues.preventive_action,
        estimated_loss: quality_issues.estimated_loss,
        loss_details: quality_issues.loss_details,
        detected_by: quality_issues.detected_by,
        resolved_by: quality_issues.resolved_by,
        detected_at: quality_issues.detected_at,
        resolved_at: quality_issues.resolved_at,
        created_at: quality_issues.created_at,
        updated_at: quality_issues.updated_at,
        customer_name: customers.name,
        customer_name_ar: customers.name_ar,
        detected_by_name: detectedByUser.display_name,
        detected_by_name_ar: detectedByUser.display_name_ar,
        resolved_by_name: resolvedByUser.display_name,
        resolved_by_name_ar: resolvedByUser.display_name_ar,
        production_order_number: production_orders.production_order_number,
        order_number: orders.order_number,
      })
      .from(quality_issues)
      .leftJoin(customers, eq(quality_issues.customer_id, customers.id))
      .leftJoin(
        detectedByUser,
        eq(quality_issues.detected_by, detectedByUser.id),
      )
      .leftJoin(
        resolvedByUser,
        eq(quality_issues.resolved_by, resolvedByUser.id),
      )
      .leftJoin(
        production_orders,
        eq(quality_issues.production_order_id, production_orders.id),
      )
      .leftJoin(orders, eq(quality_issues.order_id, orders.id))
      .where(eq(quality_issues.id, id));

    if (!issue) return null;

    const responsibles = await db
      .select({
        id: quality_issue_responsibles.id,
        quality_issue_id: quality_issue_responsibles.quality_issue_id,
        user_id: quality_issue_responsibles.user_id,
        department: quality_issue_responsibles.department,
        responsibility_type: quality_issue_responsibles.responsibility_type,
        action_taken: quality_issue_responsibles.action_taken,
        penalty_type: quality_issue_responsibles.penalty_type,
        deduction_amount: quality_issue_responsibles.deduction_amount,
        notes: quality_issue_responsibles.notes,
        created_at: quality_issue_responsibles.created_at,
        user_name: users.display_name,
        user_name_ar: users.display_name_ar,
      })
      .from(quality_issue_responsibles)
      .leftJoin(users, eq(quality_issue_responsibles.user_id, users.id))
      .where(eq(quality_issue_responsibles.quality_issue_id, id));

    const actionPerformer = alias(users, "action_performer");
    const actions = await db
      .select({
        id: quality_issue_actions.id,
        quality_issue_id: quality_issue_actions.quality_issue_id,
        action_type: quality_issue_actions.action_type,
        description: quality_issue_actions.description,
        performed_by: quality_issue_actions.performed_by,
        status: quality_issue_actions.status,
        due_date: quality_issue_actions.due_date,
        completed_at: quality_issue_actions.completed_at,
        created_at: quality_issue_actions.created_at,
        performed_by_name: actionPerformer.display_name,
        performed_by_name_ar: actionPerformer.display_name_ar,
      })
      .from(quality_issue_actions)
      .leftJoin(
        actionPerformer,
        eq(quality_issue_actions.performed_by, actionPerformer.id),
      )
      .where(eq(quality_issue_actions.quality_issue_id, id))
      .orderBy(desc(quality_issue_actions.created_at));

    return { ...issue, responsibles, actions };
  }


  async createQualityIssue(data: InsertQualityIssue): Promise<QualityIssue> {
    const [maxId] = await db
      .select({ max: sql<number>`COALESCE(MAX(id), 0)` })
      .from(quality_issues);
    const nextNum = (maxId?.max || 0) + 1;
    const issueNumber = `QI-${String(nextNum).padStart(4, "0")}`;

    const [issue] = await db
      .insert(quality_issues)
      .values({
        ...data,
        issue_number: issueNumber,
      })
      .returning();
    return issue;
  }


  async updateQualityIssue(
    id: number,
    data: Partial<InsertQualityIssue>,
  ): Promise<QualityIssue | null> {
    const [issue] = await db
      .update(quality_issues)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(quality_issues.id, id))
      .returning();
    return issue || null;
  }


  async deleteQualityIssue(id: number): Promise<boolean> {
    const result = await db
      .delete(quality_issues)
      .where(eq(quality_issues.id, id))
      .returning();
    return result.length > 0;
  }


  async getQualityInspectionForms(filters?: {
    template_type?: string;
    overall_result?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any[]> {
    const conditions = [] as any[];
    if (filters?.template_type)
      conditions.push(
        eq(quality_inspection_forms.template_type, filters.template_type),
      );
    if (filters?.overall_result)
      conditions.push(
        eq(quality_inspection_forms.overall_result, filters.overall_result),
      );
    if (filters?.dateFrom)
      conditions.push(
        sql`${quality_inspection_forms.inspected_at} >= ${filters.dateFrom}`,
      );
    if (filters?.dateTo)
      conditions.push(
        sql`${quality_inspection_forms.inspected_at} <= ${filters.dateTo}::date + interval '1 day'`,
      );
    let query = this.qualityInspectionFormBaseQuery();
    const rows = conditions.length
      ? await query.where(and(...conditions)).orderBy(
          desc(quality_inspection_forms.id),
        )
      : await query.orderBy(desc(quality_inspection_forms.id));
    return rows;
  }


  async getQualityInspectionFormById(id: number): Promise<any | null> {
    const [row] = await this.qualityInspectionFormBaseQuery().where(
      eq(quality_inspection_forms.id, id),
    );
    return row || null;
  }


  async createQualityInspectionForm(
    data: InsertQualityInspectionForm,
  ): Promise<QualityInspectionForm> {
    // Retry on unique-violation to tolerate concurrent numbering races.
    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const [maxNum] = await db
        .select({
          max: sql<number>`COALESCE(MAX(CAST(SUBSTRING(form_number FROM 4) AS integer)), 0)`,
        })
        .from(quality_inspection_forms);
      const formNumber = `QF-${String((maxNum?.max || 0) + 1 + attempt).padStart(4, "0")}`;
      try {
        const [form] = await db
          .insert(quality_inspection_forms)
          .values({ ...data, form_number: formNumber })
          .returning();
        return form;
      } catch (e: any) {
        lastError = e;
        if (e?.code !== "23505") throw e;
      }
    }
    throw lastError;
  }


  async updateQualityInspectionForm(
    id: number,
    data: Partial<InsertQualityInspectionForm>,
  ): Promise<QualityInspectionForm | null> {
    const [form] = await db
      .update(quality_inspection_forms)
      .set({ ...data, updated_at: new Date() })
      .where(eq(quality_inspection_forms.id, id))
      .returning();
    return form || null;
  }


  async deleteQualityInspectionForm(id: number): Promise<boolean> {
    const result = await db
      .delete(quality_inspection_forms)
      .where(eq(quality_inspection_forms.id, id))
      .returning();
    return result.length > 0;
  }


  async addQualityIssueResponsible(
    data: InsertQualityIssueResponsible,
  ): Promise<QualityIssueResponsible> {
    const [resp] = await db
      .insert(quality_issue_responsibles)
      .values(data)
      .returning();
    return resp;
  }


  async updateQualityIssueResponsible(
    id: number,
    data: Partial<InsertQualityIssueResponsible>,
  ): Promise<QualityIssueResponsible | null> {
    const [resp] = await db
      .update(quality_issue_responsibles)
      .set(data)
      .where(eq(quality_issue_responsibles.id, id))
      .returning();
    return resp || null;
  }


  async deleteQualityIssueResponsible(id: number): Promise<boolean> {
    const result = await db
      .delete(quality_issue_responsibles)
      .where(eq(quality_issue_responsibles.id, id))
      .returning();
    return result.length > 0;
  }


  async addQualityIssueAction(
    data: InsertQualityIssueAction,
  ): Promise<QualityIssueAction> {
    const [action] = await db
      .insert(quality_issue_actions)
      .values(data)
      .returning();
    return action;
  }


  async updateQualityIssueAction(
    id: number,
    data: Partial<InsertQualityIssueAction>,
  ): Promise<QualityIssueAction | null> {
    const [action] = await db
      .update(quality_issue_actions)
      .set(data)
      .where(eq(quality_issue_actions.id, id))
      .returning();
    return action || null;
  }


  async getQualityIssueStats(): Promise<any> {
    const allIssues = await db
      .select({
        status: quality_issues.status,
        severity: quality_issues.severity,
        source: quality_issues.source,
        category: quality_issues.category,
      })
      .from(quality_issues);

    const total = allIssues.length;
    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    for (const i of allIssues) {
      byStatus[i.status || "unknown"] =
        (byStatus[i.status || "unknown"] || 0) + 1;
      bySeverity[i.severity || "unknown"] =
        (bySeverity[i.severity || "unknown"] || 0) + 1;
      bySource[i.source || "unknown"] =
        (bySource[i.source || "unknown"] || 0) + 1;
      byCategory[i.category || "unknown"] =
        (byCategory[i.category || "unknown"] || 0) + 1;
    }

    return { total, byStatus, bySeverity, bySource, byCategory };
  }
}

export interface QualityStorage extends IStorage {}
