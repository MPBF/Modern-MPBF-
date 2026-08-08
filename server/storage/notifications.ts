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
import { MixingStorage } from "./mixing";

export class NotificationsStorage extends MixingStorage {


  async createNotification(data: InsertNotification): Promise<Notification> {
    const [n] = await db.insert(notifications).values(data).returning();
    return n;
  }


  async getNotifications(
    userId?: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Notification[]> {
    if (userId)
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.recipient_id, userId.toString()))
        .orderBy(desc(notifications.created_at))
        .limit(limit)
        .offset(offset);
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset);
  }


  async updateNotificationStatus(
    twilioSid: string,
    updates: Partial<Notification>,
  ): Promise<Notification> {
    const [u] = await db
      .update(notifications)
      .set(updates)
      .where(eq(notifications.twilio_sid, twilioSid))
      .returning();
    return u;
  }


  async updateNotificationStatusByExternalId(
    externalId: string,
    updates: Partial<Notification>,
  ): Promise<Notification | undefined> {
    const rows = await db
      .update(notifications)
      .set(updates)
      .where(eq(notifications.external_id, externalId))
      .returning();
    return rows[0];
  }


  async markNotificationAsRead(id: number): Promise<Notification> {
    const [u] = await db
      .update(notifications)
      .set({ read_at: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return u;
  }


  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const [user] = await db
      .select({ role_id: users.role_id })
      .from(users)
      .where(eq(users.id, userId));
    const roleId = user?.role_id;
    await db
      .update(notifications)
      .set({ read_at: new Date() })
      .where(
        and(
          sql`${notifications.read_at} IS NULL`,
          roleId != null
            ? sql`(${notifications.recipient_id} = ${userId.toString()}
                   OR ${notifications.recipient_type} = 'all'
                   OR (${notifications.recipient_type} = 'role'
                       AND ${notifications.recipient_id} = ${roleId.toString()}))`
            : sql`(${notifications.recipient_id} = ${userId.toString()}
                   OR ${notifications.recipient_type} = 'all')`,
        ),
      );
  }


  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const [c] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipient_id, userId.toString()),
          sql`${notifications.read_at} IS NULL`,
        ),
      );
    return c?.count || 0;
  }


  async getAllAlerts(options?: any): Promise<SystemAlert[]> {
    return await db
      .select()
      .from(system_alerts)
      .orderBy(desc(system_alerts.created_at));
  }


  async getAlertById(id: number): Promise<SystemAlert | undefined> {
    const [a] = await db
      .select()
      .from(system_alerts)
      .where(eq(system_alerts.id, id));
    return a;
  }


  async createAlert(data: InsertSystemAlert): Promise<SystemAlert> {
    const [a] = await db.insert(system_alerts).values(data).returning();
    return a;
  }


  async updateAlertStatus(
    id: number,
    status: string,
    userId?: number,
  ): Promise<SystemAlert> {
    const [u] = await db
      .update(system_alerts)
      .set({ status })
      .where(eq(system_alerts.id, id))
      .returning();
    return u;
  }


  async getAlertRules(isEnabled?: boolean): Promise<AlertRule[]> {
    if (isEnabled !== undefined) {
      return await db
        .select()
        .from(alert_rules)
        .where(eq(alert_rules.is_enabled, isEnabled));
    }
    return await db.select().from(alert_rules);
  }


  async createAlertRule(data: InsertAlertRule): Promise<AlertRule> {
    const [r] = await db.insert(alert_rules).values(data).returning();
    return r;
  }


  async updateAlertRule(
    id: number,
    data: Partial<AlertRule>,
  ): Promise<AlertRule> {
    const [u] = await db
      .update(alert_rules)
      .set(data)
      .where(eq(alert_rules.id, id))
      .returning();
    return u;
  }


  async getSystemAlerts(options?: any): Promise<SystemAlert[]> {
    return this.getAllAlerts(options);
  }


  async getSystemAlertById(id: number): Promise<SystemAlert | undefined> {
    return this.getAlertById(id);
  }


  async createSystemAlert(data: InsertSystemAlert): Promise<SystemAlert> {
    return this.createAlert(data);
  }


  async resolveSystemAlert(
    id: number,
    userId: number,
    notes?: string,
  ): Promise<SystemAlert> {
    return this.updateAlertStatus(id, "resolved", userId);
  }


  async dismissSystemAlert(id: number, userId: number): Promise<SystemAlert> {
    return this.updateAlertStatus(id, "dismissed", userId);
  }


  async updateSystemAlert(
    id: number,
    data: Partial<SystemAlert>,
  ): Promise<SystemAlert> {
    const [u] = await db
      .update(system_alerts)
      .set(data)
      .where(eq(system_alerts.id, id))
      .returning();
    return u;
  }


  async getActiveAlertsCount(): Promise<number> {
    const [r] = await db
      .select({ count: count() })
      .from(system_alerts)
      .where(eq(system_alerts.status, "active"));
    return r?.count || 0;
  }


  async getCriticalAlertsCount(): Promise<number> {
    const [r] = await db
      .select({ count: count() })
      .from(system_alerts)
      .where(
        and(
          eq(system_alerts.severity, "critical"),
          eq(system_alerts.status, "active"),
        ),
      );
    return r?.count || 0;
  }


  async getAlertsByType(type: string): Promise<SystemAlert[]> {
    return await db
      .select()
      .from(system_alerts)
      .where(eq(system_alerts.type, type))
      .orderBy(desc(system_alerts.created_at));
  }


  async getQuickNotes(userId?: number): Promise<any[]> {
    if (userId)
      return await db
        .select()
        .from(quick_notes)
        .where(
          or(
            eq(quick_notes.created_by, userId),
            eq(quick_notes.assigned_to, userId),
          ),
        );
    return await db.select().from(quick_notes);
  }


  async createQuickNote(data: InsertQuickNote): Promise<QuickNote> {
    const [n] = await db.insert(quick_notes).values(data).returning();
    return n;
  }


  async updateQuickNote(
    id: number,
    updates: Partial<QuickNote>,
  ): Promise<QuickNote> {
    const [u] = await db
      .update(quick_notes)
      .set(updates)
      .where(eq(quick_notes.id, id))
      .returning();
    return u;
  }


  async deleteQuickNote(id: number): Promise<void> {
    await db.delete(quick_notes).where(eq(quick_notes.id, id));
  }


  async createNoteAttachment(
    data: InsertNoteAttachment,
  ): Promise<NoteAttachment> {
    const [a] = await db.insert(note_attachments).values(data).returning();
    return a;
  }


  async getNoteAttachments(noteId: number): Promise<NoteAttachment[]> {
    return await db
      .select()
      .from(note_attachments)
      .where(eq(note_attachments.note_id, noteId));
  }


  async getNoteAttachmentById(id: number): Promise<NoteAttachment | undefined> {
    const [attachment] = await db
      .select()
      .from(note_attachments)
      .where(eq(note_attachments.id, id));
    return attachment;
  }


  async getAllNotificationEventSettings(): Promise<NotificationEventSetting[]> {
    return await db.select().from(notification_event_settings);
  }


  async getNotificationEventSettingById(
    id: number,
  ): Promise<NotificationEventSetting | undefined> {
    const [s] = await db
      .select()
      .from(notification_event_settings)
      .where(eq(notification_event_settings.id, id));
    return s;
  }


  async getNotificationEventSettingByKey(
    key: string,
  ): Promise<NotificationEventSetting | undefined> {
    const [s] = await db
      .select()
      .from(notification_event_settings)
      .where(eq(notification_event_settings.event_key, key));
    return s;
  }


  async createNotificationEventSetting(
    data: InsertNotificationEventSetting,
  ): Promise<NotificationEventSetting> {
    const [s] = await db
      .insert(notification_event_settings)
      .values(data)
      .returning();
    return s;
  }


  async updateNotificationEventSetting(
    id: number,
    updates: Partial<NotificationEventSetting>,
  ): Promise<NotificationEventSetting> {
    const [u] = await db
      .update(notification_event_settings)
      .set(updates)
      .where(eq(notification_event_settings.id, id))
      .returning();
    return u;
  }


  async deleteNotificationEventSetting(id: number): Promise<void> {
    await db
      .delete(notification_event_settings)
      .where(eq(notification_event_settings.id, id));
  }


  async getNotificationEventLogs(
    options?: any,
  ): Promise<NotificationEventLog[]> {
    return await db
      .select()
      .from(notification_event_logs)
      .orderBy(desc(notification_event_logs.triggered_at));
  }


  async createNotificationEventLog(
    data: InsertNotificationEventLog,
  ): Promise<NotificationEventLog> {
    const [l] = await db
      .insert(notification_event_logs)
      .values(data)
      .returning();
    return l;
  }


  async updateNotificationEventLog(
    id: number,
    updates: Partial<NotificationEventLog>,
  ): Promise<NotificationEventLog> {
    const [u] = await db
      .update(notification_event_logs)
      .set(updates)
      .where(eq(notification_event_logs.id, id))
      .returning();
    return u;
  }


  async createNotificationTemplate(
    data: InsertNotificationTemplate,
  ): Promise<NotificationTemplate> {
    const [t] = await db
      .insert(notification_templates)
      .values(data)
      .returning();
    return t;
  }


  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return await db
      .select()
      .from(notification_templates)
      .orderBy(notification_templates.id);
  }


  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }


  async markNoteAsRead(id: number): Promise<QuickNote> {
    return this.updateQuickNote(id, { is_read: true } as any);
  }


  async deleteNoteAttachment(id: number): Promise<void> {
    await db.delete(note_attachments).where(eq(note_attachments.id, id));
  }


  async getQuickNoteById(id: number): Promise<QuickNote | undefined> {
    const [n] = await db
      .select()
      .from(quick_notes)
      .where(eq(quick_notes.id, id));
    return n;
  }
}

export interface NotificationsStorage extends IStorage {}
