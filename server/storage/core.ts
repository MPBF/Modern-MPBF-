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
  type MaintenanceSchedule,
  type MaintenanceScheduleItem,
  type MaintenanceScheduleRun,
  type MaintenanceScheduleRunItem,
  type CreateMaintenanceSchedule,
  type UpdateMaintenanceSchedule,
  type UpdateMaintenanceScheduleRun,
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

// Enhanced cache system with memory optimization
class OptimizedCache {
  private cache = new Map<
    string,
    {
      data: any;
      timestamp: number;
      ttl: number;
      accessCount: number;
      lastAccess: number;
    }
  >();
  private maxSize = 1000; // Maximum cache entries
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup stale entries every 2 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 2 * 60 * 1000);
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      cached.accessCount++;
      cached.lastAccess = Date.now();
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  set(key: string, data: any, ttl: number): void {
    // If cache is full, remove least recently used entries
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccess: Date.now(),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Date.now();

    // Use Array.from to avoid iterator issues
    Array.from(this.cache.entries()).forEach(([key, value]) => {
      if (value.lastAccess < oldestAccess) {
        oldestAccess = value.lastAccess;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const staleKeys: string[] = [];

    // Use Array.from to avoid iterator issues
    Array.from(this.cache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > value.ttl) {
        staleKeys.push(key);
      }
    });

    staleKeys.forEach((key) => this.cache.delete(key));

    if (staleKeys.length > 0) {
      console.log(
        `[Cache] Cleaned up ${staleKeys.length} stale entries. Active: ${this.cache.size}`,
      );
    }
  }

  getStats(): { size: number; maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }

  shutdown(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

const cache = new OptimizedCache();
export const CACHE_TTL = {
  REALTIME: 5 * 1000, // 5 seconds for production queues
  SHORT: 30 * 1000, // 30 seconds for active data
  MEDIUM: 5 * 60 * 1000, // 5 minutes for relatively stable data
  LONG: 15 * 60 * 1000, // 15 minutes for rarely changing data
};

export function getCachedData(key: string): any | null {
  return cache.get(key);
}

export function setCachedData(key: string, data: any, ttl: number): void {
  cache.set(key, data, ttl);
}

// Import notification manager to broadcast production updates
export interface NotificationManager {
  broadcast?: (event: string, payload: unknown) => void;
  broadcastProductionUpdate?: (
    updateType?: "film" | "printing" | "cutting" | "all",
  ) => void;
  notify?: (channel: string, payload: unknown) => void;
}
let notificationManager: NotificationManager | null = null;
export function setNotificationManager(nm: NotificationManager): void {
  notificationManager = nm;
}

// إزالة cache للمفاتيح المتعلقة بالإنتاج عند التحديث
export function invalidateProductionCache(
  updateType: "film" | "printing" | "cutting" | "all" = "all",
): void {
  const productionKeys = [
    "printing_queue",
    "cutting_queue",
    "hierarchical_orders",
    "grouped_cutting_queue",
  ];
  productionKeys.forEach((key) => cache.delete(key));

  // Broadcast production update via SSE if notification manager is available
  if (notificationManager) {
    notificationManager.broadcastProductionUpdate?.(updateType);
  }
}

// Database error handling utilities
export class DatabaseError extends Error {
  public code?: string;
  public constraint?: string;
  public table?: string;

  constructor(message: string, originalError?: any) {
    super(message);
    this.name = "DatabaseError";

    if (originalError) {
      this.code = originalError.code;
      this.constraint = originalError.constraint;
      this.table = originalError.table;
    }
  }
}

export function truncateForLog(value: any, maxLen = 200): any {
  if (value == null) return value;
  if (typeof value === "string") {
    return value.length > maxLen
      ? `${value.slice(0, maxLen)}…(${value.length} chars)`
      : value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => truncateForLog(v, maxLen));
  }
  return value;
}

export function sanitizeDbError(error: any): any {
  if (!error || typeof error !== "object") return error;
  try {
    // Drizzle/Neon errors expose .query and .params (a long array including
    // base64 image fields like cliche_front_design). Clone and truncate so
    // logs don't grow into kilobytes per failure.
    const safe: any = {
      name: error.name,
      message: error.message,
      code: error.code,
    };
    if (error.detail) safe.detail = truncateForLog(error.detail, 300);
    if (error.query) safe.query = truncateForLog(error.query, 500);
    if (Array.isArray(error.params)) {
      safe.params = truncateForLog(error.params, 120);
    } else if (Array.isArray((error as any).parameters)) {
      safe.params = truncateForLog((error as any).parameters, 120);
    }
    if (error.stack) {
      safe.stack = String(error.stack).split("\n").slice(0, 6).join("\n");
    }
    return safe;
  } catch {
    return error;
  }
}

export function handleDatabaseError(
  error: any,
  operation: string,
  context?: string,
): never {
  console.error(`Database error during ${operation}:`, sanitizeDbError(error));

  // Handle specific database errors
  if (error.code === "23505") {
    // Unique constraint violation
    throw new DatabaseError(
      `البيانات مكررة - ${context || "العنصر موجود مسبقاً"}`,
      error,
    );
  }

  if (error.code === "23503") {
    // Foreign key constraint violation
    throw new DatabaseError(
      `خطأ في الربط - ${context || "البيانات المرجعية غير موجودة"}`,
      error,
    );
  }

  if (error.code === "23502") {
    // Not null constraint violation
    throw new DatabaseError(
      `بيانات مطلوبة مفقودة - ${context || "يرجى إدخال جميع البيانات المطلوبة"}`,
      error,
    );
  }

  if (error.code === "42P01") {
    // Table does not exist
    throw new DatabaseError("خطأ في النظام - جدول البيانات غير موجود", error);
  }

  if (error.code === "53300") {
    // Too many connections
    throw new DatabaseError("الخادم مشغول - يرجى المحاولة لاحقاً", error);
  }

  if (error.code === "08006" || error.code === "08003") {
    // Connection failure
    throw new DatabaseError(
      "خطأ في الاتصال بقاعدة البيانات - يرجى المحاولة لاحقاً",
      error,
    );
  }

  // Generic database error
  throw new DatabaseError(
    `خطأ في قاعدة البيانات أثناء ${operation} - ${context || "يرجى المحاولة لاحقاً"}`,
    error,
  );
}

export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleDatabaseError(error, operationName, context);
  }
}

// One roll on the live factory-floor feed (see getFloorRolls). Timestamps come
// straight from PostgreSQL via db.execute, so they may surface as Date objects
// server-side and as ISO strings once JSON-serialized to clients.
export interface FloorRoll {
  id: number;
  roll_number: string | null;
  roll_seq: number | null;
  stage: string;
  weight_kg: string | number | null;
  cut_weight_total_kg: string | number | null;
  created_at: Date | string | null;
  printed_at: Date | string | null;
  cut_completed_at: Date | string | null;
  roll_created_at: Date | string | null;
  last_updated_at: Date | string | null;
  production_order_number: string | null;
  customer_name: string | null;
  customer_name_ar: string | null;
  machine_name: string | null;
  machine_name_ar: string | null;
  employee_name: string | null;
}

// A single bounded page of the floor-rolls feed plus the total still on the
// floor, so callers can show progress and page through every roll.
export interface FloorRollsResult {
  rolls: FloorRoll[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export const FLOOR_ROLLS_DEFAULT_LIMIT = 100;
export const FLOOR_ROLLS_MAX_LIMIT = 500;

// Clamp a requested page size into a safe range so a single request can never
// pull the entire (unbounded) floor-rolls table.
export function clampFloorRollsLimit(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return FLOOR_ROLLS_DEFAULT_LIMIT;
  return Math.min(FLOOR_ROLLS_MAX_LIMIT, Math.floor(n));
}

export interface IStorage {
  // Check existence for validation
  exists(table: string, field: string, value: any): Promise<boolean>;

  // Users (with sensitive data)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByUsernameOrNationalId(
    identifier: string,
  ): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Replit Auth user operations
  getUserByReplitId(replitUserId: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;

  // Safe users (without sensitive data like passwords)
  getSafeUser(id: number): Promise<SafeUser | undefined>;
  getSafeUsers(): Promise<SafeUser[]>;
  getSafeUsersByRole(roleId: number): Promise<SafeUser[]>;

  // Roles
  getRoleById(id: number): Promise<Role | undefined>;

  // Orders
  getAllOrders(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<NewOrder[]>;
  createOrder(insertOrder: InsertNewOrder): Promise<NewOrder>;
  updateOrder(id: number, orderUpdates: Partial<NewOrder>): Promise<NewOrder>;
  updateOrderStatus(id: number, status: string): Promise<NewOrder>;
  updateOrderStatusWithPrevious(id: number, status: string, previousStatus: string | null): Promise<NewOrder>;
  getOrderById(id: number): Promise<NewOrder | undefined>;
  deleteOrder(id: number): Promise<void>;
  getOrdersForProduction(): Promise<any[]>;
  getHierarchicalOrdersForProduction(): Promise<any[]>;

  // Production Orders
  getAllProductionOrders(filters?: {
    id?: number;
    order_id?: number;
    customer_id?: string;
    production_stage?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  getProductionOrdersStagesSummary(): Promise<
    Array<{
      stage: string;
      count: number;
      remaining_kg: number;
      target_kg: number;
      produced_kg: number;
    }>
  >;
  backfillProductionOrderStages(): Promise<number>;
  getProductionOrderById(id: number): Promise<ProductionOrder | undefined>;
  createProductionOrder(po: InsertProductionOrder, extra?: { final_quantity_kg?: number }): Promise<ProductionOrder>;
  findOpenCheckIn(
    userId: number,
    window?: { dateStr: string; start: Date; end: Date },
  ): Promise<Attendance | null>;
  ensureBatchNumber(productionOrderId: number): Promise<string | null>;
  // Note: implementation returns Promise<any> (kept identical for the
  // fragment interface merge; the resolved shape is
  // { successful: ProductionOrder[]; failed: { order; error }[] }).
  createProductionOrdersBatch(batch: InsertProductionOrder[]): Promise<any>;
  updateProductionOrder(id: number, updates: Partial<ProductionOrder>): Promise<ProductionOrder>;
  updateProductionOrderStatusWithPrevious(id: number, status: string, previousStatus: string | null): Promise<void>;
  deleteProductionOrder(id: number): Promise<void>;
  maybeCompleteParentOrder(productionOrderId: number): Promise<void>;
  getProductionOrdersForPrintingQueue(): Promise<any[]>;
  getProductionOrdersForCuttingQueue(): Promise<any[]>;
  getGroupedCuttingQueue(): Promise<any[]>;

  // Rolls
  getAllRolls(opts?: {
    limit?: number;
    offset?: number;
    createdAfter?: Date;
  }): Promise<Roll[]>;
  getFloorRolls(opts?: { limit?: number; offset?: number }): Promise<FloorRollsResult>;
  getTodaysProduction(opts: {
    userId: number;
    isManagement: boolean;
    canFilm: boolean;
    canPrinting: boolean;
    canCutting: boolean;
    from?: Date;
    to?: Date;
    stage?: "film" | "printing" | "cutting";
  }): Promise<any[]>;
  getRollById(id: number): Promise<Roll | undefined>;
  getRollsByProductionOrder(poId: number): Promise<Roll[]>;
  createRoll(insertRoll: InsertRoll): Promise<Roll>;
  updateRoll(id: number, updates: Partial<Roll>): Promise<Roll>;
  deleteRoll(id: number): Promise<void>;
  getManagedRolls(filters?: {
    stage?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  updateRollByManager(rollId: number, changes: {
      film_machine_id?: string | null;
      printing_machine_id?: string | null;
      cutting_machine_id?: string | null;
      production_order_id?: number;
      note?: string;
    }, userId?: number): Promise<Roll>;
  getRollEditLogs(rollId: number): Promise<any[]>;
  getRecentRolls(limit: number): Promise<Roll[]>;

  // Machines
  getAllMachines(): Promise<Machine[]>;
  getMachineById(id: string | number): Promise<Machine | undefined>;

  // Customers
  getAllCustomers(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<Customer[]>;
  getCustomerById(id: string | number): Promise<Customer | undefined>;

  // Maintenance
  getAllMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(req: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest>;
  deleteMaintenanceRequest(id: number): Promise<boolean>;

  // Quality Control
  getQualityChecksByRoll(rollId: number): Promise<QualityCheck[]>;
  createQualityCheck(check: any): Promise<QualityCheck>;

  // Quality Inspection Forms (نماذج فحص الجودة)
  getQualityInspectionForms(filters?: {
    template_type?: string;
    overall_result?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any[]>;
  getQualityInspectionFormById(id: number): Promise<any | null>;
  createQualityInspectionForm(data: InsertQualityInspectionForm): Promise<QualityInspectionForm>;
  updateQualityInspectionForm(id: number, data: Partial<InsertQualityInspectionForm>): Promise<QualityInspectionForm | null>;
  deleteQualityInspectionForm(id: number): Promise<boolean>;

  // Attendance
  getAttendanceByDate(date: string): Promise<any[]>;
  createAttendance(data: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, updates: Partial<Attendance>): Promise<Attendance>;
  deleteAttendance(id: number): Promise<void>;
  getAttendanceById(id: number): Promise<Attendance | null>;
  getAttendanceByUserAndDateRange(userId: number, start: string, end: string): Promise<any[]>;
  getAttendanceSummary(userId: number, start: Date, end: Date): Promise<any>;
  getAttendanceReport(start: Date, end: Date, filters?: any): Promise<any[]>;
  getDailyAttendanceStats(date: string): Promise<any>;
  upsertManualAttendance(entries: any[]): Promise<any[]>;
  getDailyAttendanceStatus(
    userId: number,
    date: string,
    window?: { start: Date; end: Date; checkoutEnd?: Date },
  ): Promise<any>;
  getDailyAttendanceOverview(
    date: string,
    sectionIds?: string[],
  ): Promise<any[]>;
  updateDailyAttendance(userId: number, date: string, patch: {
      check_in_time?: Date | null;
      break_start_time?: Date | null;
      break_end_time?: Date | null;
      check_out_time?: Date | null;
      status?: string;
    }, updatedBy?: number): Promise<void>;
  getOpenAttendanceWithdrawal(attendanceId: number): Promise<AttendanceWithdrawal | null>;
  getOpenAttendanceWithdrawalForUser(userId: number, date: string): Promise<AttendanceWithdrawal | null>;
  finalizeAttendanceWithdrawal(withdrawalId: number, endedAt: Date, durationMinutes: number): Promise<AttendanceWithdrawal | null>;
  createAttendanceWithdrawal(data: InsertAttendanceWithdrawal): Promise<AttendanceWithdrawal>;
  getAttendanceWithdrawalsForDay(userId: number, date: string): Promise<{
    withdrawals: AttendanceWithdrawal[];
    totalMinutes: number;
  }>;
  getAttendanceWithdrawalsInRange(startDate: string, endDate: string, userId?: number): Promise<{
    withdrawals: (AttendanceWithdrawal & {
      username?: string | null;
      display_name?: string | null;
      display_name_ar?: string | null;
    })[];
    summary: {
      user_id: number;
      username: string | null;
      display_name: string | null;
      display_name_ar: string | null;
      total_minutes: number;
      incident_count: number;
      violation_days: number;
    }[];
  }>;

  // Shift assignments (monthly day/night scheduling)
  getShiftAssignmentsByPeriod(year: number, month: number): Promise<ShiftAssignment[]>;
  getShiftAssignmentForUserMonth(userId: number, year: number, month: number): Promise<ShiftAssignment | null>;
  getShiftAssignmentsForUser(userId: number): Promise<ShiftAssignment[]>;
  upsertShiftAssignments(entries: InsertShiftAssignment[], createdBy: number | null): Promise<ShiftAssignment[]>;
  saveShiftRoster(year: number, month: number, upsertEntries: InsertShiftAssignment[], deleteUserIds: number[], createdBy: number | null): Promise<ShiftAssignment[]>;

  // HR module (employee directory, file, computed attendance)
  getHREmployees(): Promise<any[]>;
  getEmployeeFile(userId: number): Promise<any | null>;
  getComputedAttendance(userId: number, from: string, to: string): Promise<EmployeeAttendanceResult>;
  getAttendanceReportByRange(from: string, to: string, sectionId?: number): Promise<any[]>;
  applyApprovedLeaveToAttendance(request: { id: number; user_id: number | null; leave_start_date: Date | string | null; leave_end_date: Date | string | null; reviewed_by?: number | null }): Promise<void>;

  // Waste
  getAllWaste(): Promise<any[]>;
  createWaste(data: any): Promise<any>;

  // Sections
  getAllSections(): Promise<Section[]>;

  // Production Settings
  getProductionSettings(): Promise<ProductionSettings | undefined>;
  updateProductionSettings(updates: Partial<ProductionSettings>): Promise<ProductionSettings>;

  // Inventory
  getAllInventory(): Promise<Inventory[]>;
  updateInventory(id: number, updates: Partial<Inventory>): Promise<Inventory>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getInventoryMovements(itemId?: number): Promise<any[]>;

  // Warehouse Receipts
  getAllWarehouseReceipts(): Promise<WarehouseReceipt[]>;
  createWarehouseReceipt(data: InsertWarehouseReceipt): Promise<WarehouseReceipt>;

  // Training
  getAllTrainingPrograms(): Promise<TrainingProgram[]>;
  createTrainingProgram(data: InsertTrainingProgram): Promise<TrainingProgram>;
  getTrainingProgramById(id: number): Promise<TrainingProgram | undefined>;
  getTrainingMaterials(programId?: number): Promise<TrainingMaterial[]>;
  createTrainingMaterial(data: InsertTrainingMaterial): Promise<TrainingMaterial>;
  getTrainingEnrollments(filters?: {
    programId?: number;
    employeeId?: number;
  }): Promise<any[]>;
  enrollUserInProgram(data: InsertTrainingEnrollment): Promise<TrainingEnrollment>;
  updateEnrollment(id: number, updates: Partial<TrainingEnrollment>): Promise<TrainingEnrollment>;
  createEvaluation(data: InsertTrainingEvaluation): Promise<TrainingEvaluation>;
  getCertificates(userId: number): Promise<TrainingCertificate[]>;
  createCertificate(data: InsertTrainingCertificate): Promise<TrainingCertificate>;

  // HR & Performance
  getPerformanceReviews(userId?: number | string): Promise<PerformanceReview[]>;
  createPerformanceReview(data: InsertPerformanceReview): Promise<PerformanceReview>;
  getPerformanceCriteria(): Promise<PerformanceCriteria[]>;
  getPerformanceRatings(reviewId: number): Promise<PerformanceRating[]>;
  createPerformanceRating(data: InsertPerformanceRating): Promise<PerformanceRating>;

  // Leave Management
  getLeaveTypes(): Promise<LeaveType[]>;
  getLeaveRequests(userId?: number | string): Promise<any[]>;
  createLeaveRequest(data: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: number, updates: Partial<LeaveRequest>): Promise<LeaveRequest>;
  getLeaveBalances(userId: number | string, year?: number): Promise<LeaveBalance[]>;

  // Admin Decisions
  getAllAdminDecisions(): Promise<AdminDecision[]>;
  createAdminDecision(data: any): Promise<AdminDecision>;

  // Items and Products
  getAllItems(): Promise<Item[]>;
  getAllCustomerProducts(): Promise<CustomerProduct[]>;
  getCustomerProductById(id: number): Promise<CustomerProduct | undefined>;

  // System Settings
  getSystemSettings(): Promise<SystemSetting[]>;
  updateSystemSetting(key: string, value: string, updatedBy?: number): Promise<SystemSetting>;

  // Factory Locations
  getFactoryLocations(): Promise<FactoryLocation[]>;
  createFactoryLocation(data: InsertFactoryLocation): Promise<FactoryLocation>;

  // User Settings
  getUserSettings(userId: number): Promise<UserSetting | undefined>;
  updateUserSetting(userId: number, key: string, value: string): Promise<UserSetting>;

  // System Notifications
  createNotification(data: InsertNotification): Promise<Notification>;
  getNotifications(userId?: number, limit?: number, offset?: number): Promise<Notification[]>;
  updateNotificationStatus(twilioSid: string, updates: Partial<Notification>): Promise<Notification>;
  updateNotificationStatusByExternalId(externalId: string, updates: Partial<Notification>): Promise<Notification | undefined>;
  getUserNotifications(userId: number, options?: any): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  getUnreadNotificationsCount(userId: number): Promise<number>;

  // Packaging Units (per item)
  getPackagingUnitsByItem(itemId: string): Promise<any[]>;
  getPackagingUnitById(id: number): Promise<any | undefined>;
  createPackagingUnit(data: any): Promise<any>;
  updatePackagingUnit(id: number, data: any): Promise<any>;
  deletePackagingUnit(id: number): Promise<void>;

  // Maintenance Components
  getSpareParts(): Promise<SparePart[]>;
  createSparePart(data: InsertSparePart): Promise<SparePart>;
  updateSparePart(id: number, data: Partial<InsertSparePart>): Promise<SparePart>;
  deleteSparePart(id: number): Promise<void>;
  getConsumableParts(): Promise<ConsumablePart[]>;
  createConsumablePart(data: InsertConsumablePart): Promise<ConsumablePart>;
  getConsumablePartTransactions(partId: number): Promise<ConsumablePartTransaction[]>;
  createConsumablePartTransaction(data: InsertConsumablePartTransaction): Promise<ConsumablePartTransaction>;
  getMaintenanceActions(requestId: number): Promise<MaintenanceAction[]>;
  createMaintenanceAction(data: InsertMaintenanceAction): Promise<MaintenanceAction>;
  // Preventive maintenance
  getMaintenanceComponents(machineType?: string): Promise<MaintenanceComponent[]>;
  getAllMaintenanceComponents(): Promise<MaintenanceComponent[]>;
  createMaintenanceComponent(data: InsertMaintenanceComponent): Promise<MaintenanceComponent>;
  updateMaintenanceComponent(id: number, data: UpdateMaintenanceComponent): Promise<MaintenanceComponent>;
  deleteMaintenanceComponent(id: number): Promise<void>;
  getPreventiveMaintenanceActions(machineId?: string): Promise<any[]>;
  createPreventiveMaintenanceAction(payload: CreatePreventiveMaintenance): Promise<PreventiveMaintenanceAction>;
  updatePreventiveMaintenanceAction(id: number, payload: UpdatePreventiveMaintenance): Promise<PreventiveMaintenanceAction>;
  deletePreventiveMaintenanceAction(id: number): Promise<void>;
  getLastActionPerComponent(machineId: string): Promise<any[]>;
  getMaintenanceSchedules(): Promise<any[]>;
  getMaintenanceScheduleById(id: number): Promise<any | undefined>;
  createMaintenanceSchedule(
    payload: CreateMaintenanceSchedule & { created_by: number },
  ): Promise<MaintenanceSchedule>;
  updateMaintenanceSchedule(
    id: number,
    payload: UpdateMaintenanceSchedule & { updated_by: number },
  ): Promise<MaintenanceSchedule>;
  deleteMaintenanceSchedule(id: number): Promise<boolean>;
  runMaintenanceSchedule(
    id: number,
    options?: { force?: boolean; performedBy?: number },
  ): Promise<any>;
  getMaintenanceScheduleRun(id: number): Promise<any | undefined>;
  updateMaintenanceScheduleRun(
    id: number,
    payload: UpdateMaintenanceScheduleRun & { completed_by: number },
  ): Promise<any>;
  getMachineMaintenanceFile(machineId: string): Promise<any | undefined>;
  processDueMaintenanceSchedules(): Promise<any>;
  getMaintenanceReports(): Promise<MaintenanceReport[]>;
  createMaintenanceReport(data: InsertMaintenanceReport): Promise<MaintenanceReport>;
  getOperatorNegligenceReports(): Promise<OperatorNegligenceReport[]>;
  createOperatorNegligenceReport(data: InsertOperatorNegligenceReport): Promise<OperatorNegligenceReport>;

  // Smart Alerts
  getAllAlerts(options?: any): Promise<SystemAlert[]>;
  getAlertById(id: number): Promise<SystemAlert | undefined>;
  createAlert(data: InsertSystemAlert): Promise<SystemAlert>;
  updateAlertStatus(id: number, status: string, userId?: number): Promise<SystemAlert>;
  getAlertRules(isEnabled?: boolean): Promise<AlertRule[]>;
  createAlertRule(data: InsertAlertRule): Promise<AlertRule>;
  updateAlertRule(id: number, data: Partial<AlertRule>): Promise<AlertRule>;
  getSystemHealthChecks(limit?: number): Promise<SystemHealthCheck[]>;
  createSystemHealthCheck(data: InsertSystemHealthCheck): Promise<SystemHealthCheck>;
  getSystemPerformanceMetrics(options?: any): Promise<SystemPerformanceMetric[]>;
  createSystemPerformanceMetric(data: InsertSystemPerformanceMetric): Promise<SystemPerformanceMetric>;
  getCorrectiveActions(alertId?: number): Promise<CorrectiveAction[]>;
  createCorrectiveAction(data: InsertCorrectiveAction): Promise<CorrectiveAction>;
  updateCorrectiveAction(id: number, updates: Partial<CorrectiveAction>): Promise<CorrectiveAction>;
  getSystemAnalytics(type?: string): Promise<SystemAnalytics[]>;
  createSystemAnalytics(data: InsertSystemAnalytics): Promise<SystemAnalytics>;

  // Alert Aliases (used by routes/alerts.ts and services/alert-manager.ts)
  getSystemAlerts(options?: any): Promise<SystemAlert[]>;
  getSystemAlertById(id: number): Promise<SystemAlert | undefined>;
  createSystemAlert(data: InsertSystemAlert): Promise<SystemAlert>;
  resolveSystemAlert(id: number, userId: number, notes?: string): Promise<SystemAlert>;
  dismissSystemAlert(id: number, userId: number): Promise<SystemAlert>;
  updateSystemAlert(id: number, data: Partial<SystemAlert>): Promise<SystemAlert>;
  getActiveAlertsCount(): Promise<number>;
  getCriticalAlertsCount(): Promise<number>;
  getAlertsByType(type: string): Promise<SystemAlert[]>;
  getAlertsByUser(userId: number): Promise<SystemAlert[]>;

  // System Health Aliases
  getSystemHealthStatus(): Promise<any>;
  getHealthChecksByType(type: string): Promise<SystemHealthCheck[]>;
  getCriticalHealthChecks(): Promise<SystemHealthCheck[]>;

  // Performance Aliases
  getPerformanceSummary(timeRange: string): Promise<any>;
  getMetricsByTimeRange(name: string, start: Date, end: Date): Promise<SystemPerformanceMetric[]>;
  getLatestMetricValue(name: string): Promise<SystemPerformanceMetric | undefined>;

  // Corrective Action Aliases
  getPendingActions(): Promise<CorrectiveAction[]>;
  getActionsByAssignee(userId: number): Promise<CorrectiveAction[]>;
  completeCorrectiveAction(id: number, userId: number, notes?: string): Promise<CorrectiveAction>;

  // User Aliases
  getUserById(id: number): Promise<User | undefined>;

  // Quick Notes
  getQuickNotes(userId?: number): Promise<any[]>;
  createQuickNote(data: InsertQuickNote): Promise<QuickNote>;
  updateQuickNote(id: number, updates: Partial<QuickNote>): Promise<QuickNote>;
  deleteQuickNote(id: number): Promise<void>;
  createNoteAttachment(data: InsertNoteAttachment): Promise<NoteAttachment>;
  getNoteAttachments(noteId: number): Promise<NoteAttachment[]>;
  getNoteAttachmentById(id: number): Promise<NoteAttachment | undefined>;

  // Machine Queues
  getMachineQueue(machineId: number): Promise<MachineQueue[]>;
  updateMachineQueue(machineId: number, items: InsertMachineQueue[]): Promise<MachineQueue[]>;

  // Mixing Batches
  getMixingBatches(options?: any): Promise<MixingBatch[]>;
  getMixingBatchById(id: number): Promise<any>;
  createMixingBatch(batch: InsertMixingBatch, ingredients: InsertBatchIngredient[]): Promise<MixingBatch>;
  updateMixingBatchStatus(id: number, status: string): Promise<MixingBatch>;

  // Master Batch Colors
  getMasterBatchColors(): Promise<MasterBatchColor[]>;
  createMasterBatchColor(data: InsertMasterBatchColor): Promise<MasterBatchColor>;

  // Raw Material Vouchers
  getRawMaterialVouchersIn(): Promise<any[]>;
  getRawMaterialVoucherInById(id: number): Promise<any | undefined>;
  createRawMaterialVoucherIn(data: any): Promise<RawMaterialVoucherIn>;
  deleteRawMaterialVoucherIn(id: number): Promise<void>;
  getRawMaterialVouchersOut(): Promise<any[]>;
  getRawMaterialVoucherOutById(id: number): Promise<any | undefined>;
  createRawMaterialVoucherOut(data: any): Promise<RawMaterialVoucherOut>;
  deleteRawMaterialVoucherOut(id: number): Promise<void>;

  // Industrial Waste Vouchers (مستودع المخلفات الصناعية)
  getIndustrialWasteVouchersIn(): Promise<any[]>;
  getIndustrialWasteVoucherInById(id: number): Promise<any | undefined>;
  createIndustrialWasteVoucherIn(data: any): Promise<IndustrialWasteVoucherIn>;
  updateIndustrialWasteVoucherIn(id: number, data: any): Promise<IndustrialWasteVoucherIn>;
  deleteIndustrialWasteVoucherIn(id: number): Promise<void>;
  getIndustrialWasteVouchersOut(): Promise<any[]>;
  getIndustrialWasteVoucherOutById(id: number): Promise<any | undefined>;
  createIndustrialWasteVoucherOut(data: any): Promise<IndustrialWasteVoucherOut>;
  updateIndustrialWasteVoucherOut(id: number, data: any): Promise<IndustrialWasteVoucherOut>;
  deleteIndustrialWasteVoucherOut(id: number): Promise<void>;

  // Finished Goods Vouchers
  getFinishedGoodsVouchersIn(): Promise<FinishedGoodsVoucherIn[]>;
  getFinishedGoodsVoucherInById(id: number): Promise<FinishedGoodsVoucherIn | undefined>;
  createFinishedGoodsVoucherIn(data: any): Promise<FinishedGoodsVoucherIn>;
  getFinishedGoodsVouchersOut(): Promise<FinishedGoodsVoucherOut[]>;
  getFinishedGoodsVoucherOutById(id: number): Promise<FinishedGoodsVoucherOut | undefined>;
  createFinishedGoodsVoucherOut(data: any): Promise<FinishedGoodsVoucherOut>;
  deleteFinishedGoodsVoucherIn(id: number): Promise<void>;
  deleteFinishedGoodsVoucherOut(id: number): Promise<void>;
  getDeliveryHallOrders(): Promise<any[]>;
  getProductionHallOrders(): Promise<any[]>;
  getProductionOrdersForReceipt(): Promise<any[]>;
  updateProductionOrderReceivedKg(id: number, additionalKg: number): Promise<void>;
  getFinishedGoodsStock(): Promise<any[]>;
  updateFinishedGoodsStock(itemId: string, quantityChange: number, locationId?: number): Promise<void>;

  // Warehouse Stats
  getWarehouseVouchersStats(): Promise<any>;

  // Inventory Counts
  getInventoryCounts(): Promise<InventoryCount[]>;
  getInventoryCountById(id: number): Promise<any>;
  createInventoryCount(data: InsertInventoryCount): Promise<InventoryCount>;
  createInventoryCountItem(data: InsertInventoryCountItem): Promise<InventoryCountItem>;
  completeInventoryCount(id: number, userId: number): Promise<InventoryCount>;

  // Barcode Lookup
  lookupByBarcode(barcode: string): Promise<any>;

  // Notification Event Settings
  getAllNotificationEventSettings(): Promise<NotificationEventSetting[]>;
  getNotificationEventSettingById(id: number): Promise<NotificationEventSetting | undefined>;
  getNotificationEventSettingByKey(key: string): Promise<NotificationEventSetting | undefined>;
  createNotificationEventSetting(data: InsertNotificationEventSetting): Promise<NotificationEventSetting>;
  updateNotificationEventSetting(id: number, updates: Partial<NotificationEventSetting>): Promise<NotificationEventSetting>;
  deleteNotificationEventSetting(id: number): Promise<void>;
  getNotificationEventLogs(options?: any): Promise<NotificationEventLog[]>;
  createNotificationEventLog(data: InsertNotificationEventLog): Promise<NotificationEventLog>;
  updateNotificationEventLog(id: number, updates: Partial<NotificationEventLog>): Promise<NotificationEventLog>;

  // Factory Snapshots
  getFactorySnapshots(userId?: number): Promise<FactorySnapshot[]>;
  getFactorySnapshot(id: number): Promise<FactorySnapshot | undefined>;
  getFactorySnapshotByToken(token: string): Promise<FactorySnapshot | undefined>;
  createFactorySnapshot(data: InsertFactorySnapshot): Promise<FactorySnapshot>;
  deleteFactorySnapshot(id: number): Promise<void>;

  // Display Slides
  getDisplaySlides(): Promise<DisplaySlide[]>;
  getActiveDisplaySlides(): Promise<DisplaySlide[]>;
  getDisplaySlideById(id: number): Promise<DisplaySlide | undefined>;
  createDisplaySlide(data: InsertDisplaySlide): Promise<DisplaySlide>;
  updateDisplaySlide(id: number, updates: Partial<DisplaySlide>): Promise<DisplaySlide>;
  deleteDisplaySlide(id: number): Promise<void>;

  // Delivery Manifests
  getDeliveryManifests(): Promise<DeliveryManifest[]>;
  getDeliveryManifestById(id: number): Promise<DeliveryManifest | undefined>;
  createDeliveryManifest(data: InsertDeliveryManifest, userId: number): Promise<DeliveryManifest>;
  updateDeliveryManifest(id: number, updates: Partial<InsertDeliveryManifest>): Promise<DeliveryManifest>;
  deleteDeliveryManifest(id: number): Promise<void>;

  // Admin Tool Documents (generic)
  getAdminToolDocuments(docType?: string): Promise<AdminToolDocument[]>;
  getAdminToolDocumentById(id: number): Promise<AdminToolDocument | undefined>;
  createAdminToolDocument(data: InsertAdminToolDocument, userId: number): Promise<AdminToolDocument>;
  updateAdminToolDocument(id: number, updates: Partial<InsertAdminToolDocument>): Promise<AdminToolDocument>;
  deleteAdminToolDocument(id: number): Promise<void>;

  // Experimental Blends
  getExperimentalBlends(): Promise<ExperimentalBlend[]>;
  getExperimentalBlendById(id: number): Promise<ExperimentalBlend | undefined>;
  createExperimentalBlend(blend: InsertExperimentalBlend): Promise<ExperimentalBlend>;
  updateExperimentalBlend(id: number, blend: Partial<InsertExperimentalBlend>, items?: InsertExperimentalBlendItem[]): Promise<ExperimentalBlend>;
  deleteExperimentalBlend(id: number): Promise<void>;
  getExperimentalBlendItems(blendId: number): Promise<ExperimentalBlendItem[]>;
  createExperimentalBlendItems(items: InsertExperimentalBlendItem[]): Promise<ExperimentalBlendItem[]>;

  // Bag Weight Records
  getBagWeightRecordsByUser(userId: number): Promise<BagWeightRecord[]>;
  createBagWeightRecord(userId: number, record: Omit<InsertBagWeightRecord, "id" | "user_id" | "created_at">): Promise<BagWeightRecord>;
  deleteBagWeightRecord(id: number, userId: number): Promise<boolean>;
  clearBagWeightRecords(userId: number): Promise<void>;
}

// Plastic-roll products (e.g. items "رولات بلاستيك HD"/"رولات بلاستيك LD")
// are produced as finished rolls and do NOT pass through the cutting stage.
// Detected by item name so future "رولات بلاستيك *" items are covered too.
// SQL equivalent used in queries:
//   (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%')
export function isRollProductName(
  nameEn?: string | null,
  nameAr?: string | null,
): boolean {
  const en = (nameEn || "").toLowerCase();
  const ar = nameAr || "";
  return en.includes("plastic roll") || ar.includes("رولات بلاستيك");
}
export class StorageBase {

  protected dataValidator = getDataValidator(this);

  // In-memory storage for alert rate limiting - persistent during server session
  protected alertTimesStorage: Map<string, Date> = new Map();


  protected static readonly ALLOWED_TABLES = new Set([
    "users",
    "orders",
    "production_orders",
    "rolls",
    "machines",
    "customers",
    "customer_products",
    "sections",
    "categories",
    "items",
    "inventory",
    "inventory_movements",
    "roles",
    "attendance",
    "violations",
    "waste",
    "quality_checks",
    "maintenance_requests",
    "leave_types",
    "leave_requests",
    "locations",
    "mixing_batches",
    "batch_ingredients",
    "spare_parts",
    "consumable_parts",
    "training_programs",
    "training_records",
    "performance_reviews",
    "warehouse_receipts",
    "warehouse_transactions",
    "system_settings",
    "user_settings",
    "notifications",
    "quick_notes",
    "master_batch_colors",
    "machine_queues",
    "cuts",
    "factory_locations",
    "system_alerts",
    "alert_rules",
    "company_profile",
  ]);


  protected addDaysStr(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + days));
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }


  protected buildShiftMap(assignments: ShiftAssignment[]): Map<string, ShiftType> {
    const map = new Map<string, ShiftType>();
    for (const a of assignments) {
      if (isShiftType(a.shift)) map.set(`${a.year}-${a.month}`, a.shift);
    }
    return map;
  }


  // users.section_id (integer) و sections.id (varchar مثل SEC03) غير متطابقين،
  // لذلك تدعم الخريطة كلاً من معرّف القسم النصي ورقمه المقابل.
  protected async getSectionsMap(): Promise<
    Map<string, { name: string; name_ar: string | null }>
  > {
    const all = await db
      .select({
        id: sections.id,
        name: sections.name,
        name_ar: sections.name_ar,
      })
      .from(sections);
    const map = new Map<string, { name: string; name_ar: string | null }>();
    for (const s of all) {
      const section = { name: s.name, name_ar: s.name_ar };
      map.set(String(s.id), section);
      const numericMatch = /^SEC0*(\d+)$/.exec(String(s.id));
      if (numericMatch) {
        map.set(String(Number(numericMatch[1])), section);
      }
    }
    return map;
  }


  // وزن الكيس (جم) ومعدّل الأكياس/كيلو — يُحسبان على الخادم دائماً ولا يُوثق بأي
  // قيمة محسوبة قادمة من العميل. المصدر الموثوق الوحيد لهذه الحقول.
  protected computeBagMetrics(data: any): {
    bag_weight_grams: string | null;
    bags_per_kilo: string | null;
  } {
    const num = (v: any) => {
      const x = typeof v === "string" ? parseFloat(v) : Number(v);
      return Number.isFinite(x) ? x : 0;
    };
    const width = num(data.width);
    const lf = num(data.left_facing);
    const rf = num(data.right_facing);
    const length = num(data.cutting_length_cm);
    const thickness = num(data.thickness);
    let density = num(data.density);
    if (!(density > 0)) density = 0.95;

    // وزن الكيس = العرض المسطّح × الطول × عدد الطبقات(2) × السماكة العالمية(سم) × الكثافة.
    // تُستخدم "السماكة العالمية" (universal_thickness) المحسوبة تلقائياً وغير الظاهرة
    // في الواجهة، وليست السماكة الخام. تطابق منطق العمود المحسوب universal_thickness:
    //   كيس بدخلتين (جانبان): thickness / 4 * 10، غير ذلك: thickness / 2 * 10 (ميكرون).
    // العرض المسطّح = العرض + الدخلة اليسرى + الدخلة اليمنى (يشمل الجانبين).
    const LAYERS = 2;
    // السماكة العالمية مقرّبة لأعلى لعدد صحيح (تطابق العمود المحسوب universal_thickness).
    const universalMicrons = Math.ceil(
      lf > 0 && rf > 0 ? (thickness / 4) * 10 : (thickness / 2) * 10,
    );
    const universalCm = universalMicrons * 1e-4; // ميكرون → سم
    const flatWidthCm = width + lf + rf;
    const grams = flatWidthCm * length * LAYERS * universalCm * density;

    if (!(grams > 0)) {
      return { bag_weight_grams: null, bags_per_kilo: null };
    }
    // أرقام صحيحة فقط: التقريب لأعلى لأقرب عدد صحيح (CEIL) بدون كسور عشرية.
    return {
      bag_weight_grams: String(Math.ceil(grams)),
      bags_per_kilo: String(Math.ceil(1000 / grams)),
    };
  }


  // يعيد احتساب سلسلة التكرار كاملة لموظف + نوع مخالفة داخل نفس المعاملة
  // (يُستدعى بعد أي إنشاء/تعديل/حذف/تجاوز حتى تبقى النقاط والخصومات صحيحة)
  protected async recomputeWorkViolationSeries(
    tx: any,
    employeeId: number,
    violationTypeId: number,
  ): Promise<void> {
    const [type] = await tx
      .select()
      .from(work_violation_types)
      .where(eq(work_violation_types.id, violationTypeId));
    if (!type) return;
    const [settings] = await tx
      .select()
      .from(work_violation_settings)
      .where(eq(work_violation_settings.id, 1));
    const windowDays = Number(settings?.repeat_window_days || 30);
    const pointValue = Number(settings?.point_value || 0);
    const windowMs = windowDays * 24 * 60 * 60 * 1000;

    const rows = await tx
      .select({
        id: work_violations.id,
        occurred_at: work_violations.occurred_at,
        waived: work_violations.waived,
        repeat_index: work_violations.repeat_index,
        points: work_violations.points,
        deduction_amount: work_violations.deduction_amount,
      })
      .from(work_violations)
      .where(
        and(
          eq(work_violations.employee_id, employeeId),
          eq(work_violations.violation_type_id, violationTypeId),
        ),
      )
      .orderBy(work_violations.occurred_at, work_violations.id);

    const countedTimes: number[] = [];
    for (const row of rows) {
      const t = new Date(row.occurred_at).getTime();
      const priorCount = countedTimes.filter((pt) => pt >= t - windowMs).length;
      const repeatIndex = priorCount + 1;
      const points =
        Number(type.points || 0) +
        (repeatIndex - 1) * Number(type.repeat_points || 0);
      const deduction = row.waived
        ? "0.00"
        : (Math.round(points * pointValue * 100) / 100).toFixed(2);
      if (
        row.repeat_index !== repeatIndex ||
        row.points !== points ||
        String(row.deduction_amount) !== deduction
      ) {
        await tx
          .update(work_violations)
          .set({
            repeat_index: repeatIndex,
            points,
            deduction_amount: deduction,
          })
          .where(eq(work_violations.id, row.id));
      }
      if (!row.waived) countedTimes.push(t);
    }
  }


  // Aggregate the distinct operator names + per-stage dates for a production
  // order. Shared by the batch-label payload and the batch-lookup page.
  protected async getBatchOperators(productionOrderId: number): Promise<{
    film: string[];
    printing: string[];
    cutting: string[];
    film_date: Date | null;
    printing_date: Date | null;
    cutting_date: Date | null;
  }> {
    const createdByUser = alias(users, "batch_created_by");
    const printedByUser = alias(users, "batch_printed_by");

    const rollRows = await db
      .select({
        created_at: rolls.created_at,
        printed_at: rolls.printed_at,
        cut_completed_at: rolls.cut_completed_at,
        created_by_name: createdByUser.display_name,
        created_by_name_ar: createdByUser.display_name_ar,
        printed_by_name: printedByUser.display_name,
        printed_by_name_ar: printedByUser.display_name_ar,
      })
      .from(rolls)
      .leftJoin(createdByUser, eq(rolls.created_by, createdByUser.id))
      .leftJoin(printedByUser, eq(rolls.printed_by, printedByUser.id))
      .where(eq(rolls.production_order_id, productionOrderId));

    const cutRows = await db
      .select({
        performed_at: cuts.created_at,
        performed_by_name: users.display_name,
        performed_by_name_ar: users.display_name_ar,
      })
      .from(cuts)
      .innerJoin(rolls, eq(cuts.roll_id, rolls.id))
      .leftJoin(users, eq(cuts.performed_by, users.id))
      .where(eq(rolls.production_order_id, productionOrderId));

    const currentLang = "ar";
    const pick = (nameAr?: string | null, nameEn?: string | null) =>
      (currentLang === "ar" ? nameAr || nameEn : nameEn || nameAr) || null;

    const filmSet = new Set<string>();
    const printSet = new Set<string>();
    const cutSet = new Set<string>();
    let filmDate: Date | null = null;
    let printDate: Date | null = null;
    let cutDate: Date | null = null;

    for (const r of rollRows) {
      const filmName = pick(r.created_by_name_ar, r.created_by_name);
      if (filmName) filmSet.add(filmName);
      const printName = pick(r.printed_by_name_ar, r.printed_by_name);
      if (printName) printSet.add(printName);
      if (r.created_at && (!filmDate || r.created_at < filmDate))
        filmDate = r.created_at;
      if (r.printed_at && (!printDate || r.printed_at < printDate))
        printDate = r.printed_at;
      if (
        r.cut_completed_at &&
        (!cutDate || r.cut_completed_at > cutDate)
      )
        cutDate = r.cut_completed_at;
    }
    for (const c of cutRows) {
      const cutName = pick(c.performed_by_name_ar, c.performed_by_name);
      if (cutName) cutSet.add(cutName);
      if (c.performed_at && (!cutDate || c.performed_at > cutDate))
        cutDate = c.performed_at;
    }

    return {
      film: Array.from(filmSet),
      printing: Array.from(printSet),
      cutting: Array.from(cutSet),
      film_date: filmDate,
      printing_date: printDate,
      cutting_date: cutDate,
    };
  }


  // Resolve the packageable weight for a production order. net_quantity_kg is
  // not reliably persisted, so prefer it only when positive and otherwise fall
  // back to the actual produced weight, then the final/required quantity.
  protected resolvePackageableKg(po: any): number {
    const candidates = [
      po?.net_quantity_kg,
      po?.produced_quantity_kg,
      po?.final_quantity_kg,
      po?.quantity_kg,
    ];
    for (const c of candidates) {
      const n = parseFloat(String(c ?? "0"));
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 0;
  }


  // Map a utilization percentage to a coarse capacity status label.
  protected capacityStatusFromUtilization(util: number): string {
    if (util < 40) return "low";
    if (util < 70) return "moderate";
    if (util < 90) return "high";
    return "overloaded";
  }


  // The kg weight of an order, preferring the final (produced) quantity and
  // falling back to the planned quantity.
  protected orderWeightKg(r: any): number {
    const fin = parseFloat(String(r.final_quantity_kg));
    if (!isNaN(fin) && fin > 0) return fin;
    const q = parseFloat(String(r.quantity_kg));
    return !isNaN(q) && q > 0 ? q : 0;
  }


  // Shared per-stage view of the active machines for a department together with
  // their current queue load (kg), work-content hours, and order count. Used by
  // both the capacity-stats endpoint and the smart-distribution engine.
  protected async getStageMachineStates(stage: string): Promise<{
    states: any[];
    hoursPerDay: number;
  }> {
    const info = this.getStageInfo(stage);
    if (!info) throw new Error("مرحلة غير صالحة");
    const { completedCol } = info;
    const completed = sql.raw(`po.${completedCol}`);
    const machineTypeMatch = this.machineTypeMatchSql(info.machineTypes);

    const machineRows = (
      await db.execute(sql`
        SELECT m.id, m.name, m.name_ar, m.type, m.status,
               m.capacity_small_kg_per_hour,
               m.capacity_medium_kg_per_hour,
               m.capacity_large_kg_per_hour,
               m.min_width_cm, m.max_width_cm,
               m.min_thickness, m.max_thickness,
               m.raw_material_type
        FROM machines m
        WHERE ${machineTypeMatch}
          AND LOWER(m.status) = 'active'
        ORDER BY m.id
      `)
    ).rows as any[];

    const queueRows = (
      await db.execute(sql`
        SELECT q.machine_id, po.final_quantity_kg, po.quantity_kg,
               cp.width, cp.raw_material, cp.master_batch_id
        FROM machine_queues q
        JOIN machines m ON m.id = q.machine_id
        JOIN production_orders po ON po.id = q.production_order_id
        LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
        WHERE ${machineTypeMatch}
          AND po.status <> 'cancelled'
          AND ${completed} IS NOT TRUE
      `)
    ).rows as any[];

    const profileRows = (
      await db.execute(sql`
        SELECT working_hours_per_day FROM company_profile LIMIT 1
      `)
    ).rows as any[];
    const parsedHours =
      profileRows[0]?.working_hours_per_day == null
        ? NaN
        : parseFloat(String(profileRows[0].working_hours_per_day));
    const hoursPerDay =
      !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : 20;

    const states = machineRows.map((m) => {
      const rate = this.machineRateKgPerHour(m);
      const maxCapacity = rate > 0 ? rate * hoursPerDay : 0;
      let currentLoad = 0;
      let currentHours = 0;
      let orderCount = 0;
      const materialSet = new Set<string>();
      const colorSet = new Set<string>();
      for (const q of queueRows) {
        if (q.machine_id !== m.id) continue;
        const kg = this.orderWeightKg(q);
        currentLoad += kg;
        const r = this.machineRateForWidth(m, q.width);
        currentHours += r > 0 ? kg / r : 0;
        orderCount += 1;
        const mat = q.raw_material ? String(q.raw_material).trim() : "";
        if (mat) materialSet.add(mat);
        const color = q.master_batch_id ? String(q.master_batch_id).trim() : "";
        if (color) colorSet.add(color);
      }
      return {
        machine: m,
        rate,
        maxCapacity,
        currentLoad,
        currentHours,
        orderCount,
        // Distinct raw materials already queued on this machine. Used by the
        // film-stage constraint; a machine with >1 distinct material (legacy
        // mixed data) becomes ineligible for new film assignments.
        materials: Array.from(materialSet),
        // Distinct raw-material colors (master_batch) already queued. Used as a
        // SOFT grouping preference in the film stage (prefer same color, but
        // mixing is allowed) — never an eligibility constraint.
        colors: Array.from(colorSet),
        addedKg: 0,
        addedHours: 0,
        assigned: [] as any[],
      };
    });

    return { states, hoursPerDay };
  }


  // Core smart-distribution engine. Distributes the unassigned eligible backlog
  // for a stage across that stage's active machines according to the chosen
  // algorithm. Pure computation — does not persist anything. Both the preview
  // and the apply paths use this.
  protected async computeStageDistribution(
    stage: string,
    algorithm: string,
    params: any = {},
  ): Promise<{
    totalOrders: number;
    machineCount: number;
    efficiency: number;
    preview: any[];
    states: any[];
  }> {
    const info = this.getStageInfo(stage);
    if (!info) throw new Error("مرحلة غير صالحة");
    const { completedCol } = info;
    const completed = sql.raw(`po.${completedCol}`);
    const machineTypeMatch = this.machineTypeMatchSql(info.machineTypes);
    const printedFilter =
      stage === "printing" ? sql`AND cp.is_printed = true` : sql``;

    const { states } = await this.getStageMachineStates(stage);
    // Excluded machines (by ID) are skipped for auto-distribution but remain
    // visible on the board. Accepts an array, a comma-separated string, or a
    // JSON-encoded array so the same param works from both GET (query string)
    // and POST (JSON body) callers.
    const rawExcluded = params?.excludedMachineIds;
    const excludedIds = new Set<string>(
      Array.isArray(rawExcluded)
        ? rawExcluded.map(String)
        : typeof rawExcluded === "string" && rawExcluded
          ? rawExcluded.startsWith("[")
            ? (JSON.parse(rawExcluded) as string[]).map(String)
            : rawExcluded.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
    );
    // Only machines with a usable production rate (and not excluded) can receive work.
    const usable = states.filter(
      (s) => s.rate > 0 && !excludedIds.has(String(s.machine.id)),
    );

    const backlog = (
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
    ).rows.map((r: any) => this.mapEnrichedRow(r)) as any[];

    const hybrid = {
      loadWeight: Number(params?.loadWeight) || 0,
      capacityWeight: Number(params?.capacityWeight) || 0,
      priorityWeight: Number(params?.priorityWeight) || 0,
      typeWeight: Number(params?.typeWeight) || 0,
    };

    // Lower score = more preferred machine for the next order.
    const scoreFor = (st: any, kg: number, width: any): number => {
      const r = this.machineRateForWidth(st.machine, width) || st.rate;
      const addHours = r > 0 ? kg / r : 0;
      const projHours = st.currentHours + st.addedHours + addHours;
      const projKg = st.currentLoad + st.addedKg + kg;
      if (algorithm === "load-based") return projKg;
      if (algorithm === "hybrid") {
        const util =
          st.maxCapacity > 0 ? (projKg / st.maxCapacity) * 100 : 100;
        const wSum =
          hybrid.loadWeight +
            hybrid.capacityWeight +
            hybrid.priorityWeight +
            hybrid.typeWeight || 1;
        return (
          (projHours * (hybrid.loadWeight + hybrid.priorityWeight) +
            util * (hybrid.capacityWeight + hybrid.typeWeight)) /
          wSum
        );
      }
      // balanced / priority / default → even out work-content hours.
      return projHours;
    };

    const isFilm = stage === "film";
    const matOf = (o: any) =>
      o?.raw_material ? String(o.raw_material).trim() : "";
    const colorOf = (o: any) =>
      o?.master_batch_id ? String(o.master_batch_id).trim() : "";

    const place = (st: any, order: any) => {
      const kg = this.orderWeightKg(order);
      const r = this.machineRateForWidth(st.machine, order.width) || st.rate;
      st.addedKg += kg;
      st.addedHours += r > 0 ? kg / r : 0;
      st.assigned.push(order);
      // Film machines hold a single raw-material type; record each material
      // placed so later orders can't mix (e.g. HDPE+LDPE) on one machine.
      // Also track colors for the soft same-color grouping preference.
      if (isFilm) {
        const mat = matOf(order);
        if (mat && !st.materials.includes(mat)) st.materials.push(mat);
        const color = colorOf(order);
        if (color && !st.colors.includes(color)) st.colors.push(color);
      }
    };

    // Film-stage HARD eligibility: an order can go on a machine only if the
    // machine's capability matches the order's specs and the single-material
    // runtime rule holds.
    //  - raw material type: machine capability (HDPE/LDPE/HDPE\LDPE/any) vs order
    //  - width within the machine's [min_width_cm, max_width_cm] range
    //  - universal thickness (السماكة العالمية) within [min_thickness, max_thickness]
    //  - single-material rule: an empty machine accepts any order; a machine
    //    already holding exactly one material accepts only that same material; a
    //    machine with >1 distinct material (legacy mixed data) is ineligible.
    // Color (master_batch) is intentionally NOT checked here — it is a soft
    // preference applied via scoring, never a hard constraint.
    const eligible = (st: any, order: any) => {
      if (!isFilm) return true;
      const m = st.machine;
      const material = matOf(order);
      if (!this.filmMaterialTypeMatch(m.raw_material_type, material))
        return false;
      if (!this.numInRange(order.width, m.min_width_cm, m.max_width_cm))
        return false;
      if (
        !this.numInRange(
          order.universal_thickness,
          m.min_thickness,
          m.max_thickness,
        )
      )
        return false;
      const mats: string[] = st.materials || [];
      if (mats.length === 0) return true;
      return mats.length === 1 && mats[0] === material;
    };

    // Soft same-color grouping: prefer a machine already running this order's
    // color, mildly avoid introducing a new color onto a machine that already
    // holds others, neutral for empty/colorless machines. Returns a multiplier
    // applied to the base score (lower = more preferred).
    const colorFactor = (st: any, order: any) => {
      if (!isFilm) return 1;
      const color = colorOf(order);
      if (!color) return 1;
      const colors: string[] = st.colors || [];
      if (colors.length === 0) return 1;
      if (colors.includes(color)) return 0.85;
      return 1.15;
    };

    const bestMachine = (kg: number, order: any) => {
      let best: any = null;
      let bestScore = Infinity;
      for (const st of usable) {
        if (!eligible(st, order)) continue;
        const s = scoreFor(st, kg, order.width) * colorFactor(st, order);
        if (s < bestScore) {
          bestScore = s;
          best = st;
        }
      }
      return best;
    };

    if (usable.length > 0 && backlog.length > 0) {
      let ordered = [...backlog];
      if (algorithm === "priority") {
        const rank = (s: string) =>
          s === "active" ? 0 : 1;
        ordered.sort(
          (a, b) =>
            rank(String(a.status)) - rank(String(b.status)) ||
            Number(a.production_order_id) - Number(b.production_order_id),
        );
      }

      if (algorithm === "product-type") {
        // Cluster similar products onto the same machine to minimize setup
        // changes. The group key includes thickness so a cluster stays
        // homogeneous on every film hard-eligibility dimension (size/width,
        // material, thickness) and the representative order is valid for all.
        const groups = new Map<string, any[]>();
        for (const o of ordered) {
          const key = `${o.size_caption ?? ""}|${o.raw_material ?? ""}|${o.universal_thickness ?? ""}`;
          const list = groups.get(key) || [];
          list.push(o);
          groups.set(key, list);
        }
        for (const list of Array.from(groups.values())) {
          const groupKg = list.reduce(
            (sum, o) => sum + this.orderWeightKg(o),
            0,
          );
          const best = bestMachine(groupKg, list[0]);
          if (!best) continue;
          for (const o of list) place(best, o);
        }
      } else {
        for (const o of ordered) {
          const best = bestMachine(this.orderWeightKg(o), o);
          if (best) place(best, o);
        }
      }
    }

    const preview = states.map((st) => {
      const proposedTotal = st.currentLoad + st.addedKg;
      const utilization =
        st.maxCapacity > 0 ? (proposedTotal / st.maxCapacity) * 100 : 0;
      return {
        machineId: st.machine.id,
        machineName: st.machine.name,
        machineNameAr: st.machine.name_ar,
        currentLoad: Math.round(st.currentLoad * 100) / 100,
        proposedLoad: Math.round(st.addedKg * 100) / 100,
        proposedUtilization: Math.round(utilization * 10) / 10,
        newCapacityStatus: this.capacityStatusFromUtilization(utilization),
        proposedOrders: st.assigned,
        productionRate: Math.round(st.rate * 100) / 100,
      };
    });

    const totalOrders = states.reduce((sum, st) => sum + st.assigned.length, 0);

    // Efficiency = how balanced the resulting utilizations are across machines
    // that hold or received work (100 = perfectly even).
    const utils = preview
      .filter((p) => p.proposedLoad > 0 || p.currentLoad > 0)
      .map((p) => p.proposedUtilization);
    let efficiency = 0;
    if (utils.length > 0) {
      const avg = utils.reduce((a, b) => a + b, 0) / utils.length;
      const variance =
        utils.reduce((a, b) => a + (b - avg) ** 2, 0) / utils.length;
      efficiency = Math.max(
        0,
        Math.min(100, Math.round(100 - Math.sqrt(variance))),
      );
    }

    return {
      totalOrders,
      machineCount: states.length,
      efficiency,
      preview,
      states,
    };
  }


  protected getInsertionOrder(tables: string[]): string[] {
    const priorityOrder = [
      "roles",
      "sections",
      "company_profile",
      "users",
      "categories",
      "items",
      "locations",
      "suppliers",
      "customers",
      "customer_products",
      "machines",
      "factory_locations",
      "orders",
      "production_orders",
      "rolls",
      "cuts",
      "mixing_batches",
      "batch_ingredients",
      "master_batch_colors",
      "inventory",
      "inventory_movements",
      "warehouse_receipts",
      "warehouse_transactions",
      "raw_material_vouchers_in",
      "raw_material_vouchers_out",
      "finished_goods_vouchers_in",
      "finished_goods_vouchers_out",
      "inventory_counts",
      "inventory_count_items",
      "maintenance_requests",
      "maintenance_actions",
      "maintenance_reports",
      "operator_negligence_reports",
      "spare_parts",
      "consumable_parts",
      "consumable_parts_transactions",
      "quality_checks",
      "quality_issues",
      "quality_issue_responsibles",
      "quality_issue_actions",
      "attendance",
      "waste",
      "violations",
      "training_programs",
      "training_materials",
      "training_records",
      "training_enrollments",
      "training_evaluations",
      "training_certificates",
      "performance_reviews",
      "performance_criteria",
      "performance_ratings",
      "leave_types",
      "leave_requests",
      "leave_balances",
      "notifications",
      "notification_templates",
      "notification_event_settings",
      "notification_event_logs",
      "admin_decisions",
      "user_requests",
      "quick_notes",
      "note_attachments",
      "system_settings",
      "user_settings",
      "machine_queues",
      "production_settings",
      "system_alerts",
      "alert_rules",
      "system_health_checks",
      "system_performance_metrics",
      "corrective_actions",
      "system_analytics",
      "quotes",
      "quote_items",
      "quote_templates",
      "display_slides",
      "factory_snapshots",
      "factory_layouts",
      "face_registrations",
      "mobile_device_tokens",
      "mobile_sessions",
      "mobile_sync_queue",
    ];

    const ordered: string[] = [];
    for (const t of priorityOrder) {
      if (tables.includes(t)) {
        ordered.push(t);
      }
    }
    for (const t of tables) {
      if (!ordered.includes(t)) {
        ordered.push(t);
      }
    }
    return ordered;
  }


  // ===== Production Queues planning (department-based) =====

  // Map a department/stage to its machine type, completion column, and
  // completion-percentage column. Stage is validated against this whitelist
  // by callers, so the resulting column names are safe to inline.
  protected getStageInfo(stage: string): {
    machineType: string;
    machineTypes: string[];
    completedCol: string;
    completionPctCol: string;
  } | null {
    switch (stage) {
      case "film":
        return {
          machineType: "extruder",
          machineTypes: ["extruder", "film"],
          completedCol: "film_completed",
          completionPctCol: "film_completion_percentage",
        };
      case "printing":
        return {
          machineType: "printer",
          machineTypes: ["printer", "printing"],
          completedCol: "printing_completed",
          completionPctCol: "printing_completion_percentage",
        };
      case "cutting":
        return {
          machineType: "cutter",
          machineTypes: ["cutter", "cutting"],
          completedCol: "cutting_completed",
          completionPctCol: "cutting_completion_percentage",
        };
      default:
        return null;
    }
  }


  // The machines table stores inconsistent department/type values (e.g.
  // "printer" vs "printing", "Cutter" vs "cutting"). Match all accepted
  // variants for a stage, case-insensitively, instead of one exact string.
  protected machineTypeMatchSql(machineTypes: string[]) {
    const list = sql.join(
      machineTypes.map((t) => sql`${t.toLowerCase()}`),
      sql`, `,
    );
    return sql`LOWER(m.type) IN (${list})`;
  }


  // Representative production rate (kg/hour) for a machine. Prefers the medium
  // capacity, otherwise averages whatever sizes are defined.
  protected machineRateKgPerHour(machine: any): number {
    const vals = [
      machine.capacity_small_kg_per_hour,
      machine.capacity_medium_kg_per_hour,
      machine.capacity_large_kg_per_hour,
    ]
      .map((v) => (v == null ? NaN : parseFloat(String(v))))
      .filter((v) => !isNaN(v) && v > 0);
    if (vals.length === 0) return 0;
    const medium =
      machine.capacity_medium_kg_per_hour != null
        ? parseFloat(String(machine.capacity_medium_kg_per_hour))
        : NaN;
    if (!isNaN(medium) && medium > 0) return medium;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }


  // Product width (cm) thresholds used to classify an order's size so the
  // size-appropriate machine capacity can be applied. Below SMALL_MAX uses the
  // small capacity, at/above LARGE_MIN uses the large capacity, otherwise medium.
  protected static SIZE_WIDTH_SMALL_MAX_CM = 30;

  protected static SIZE_WIDTH_LARGE_MIN_CM = 60;


  // Size-appropriate production rate (kg/hour) for a single order on a machine,
  // chosen from the product width. Falls back to the medium/average rate when
  // the width is unknown or the matching capacity is not configured.
  protected machineRateForWidth(machine: any, width: any): number {
    const small =
      machine.capacity_small_kg_per_hour != null
        ? parseFloat(String(machine.capacity_small_kg_per_hour))
        : NaN;
    const medium =
      machine.capacity_medium_kg_per_hour != null
        ? parseFloat(String(machine.capacity_medium_kg_per_hour))
        : NaN;
    const large =
      machine.capacity_large_kg_per_hour != null
        ? parseFloat(String(machine.capacity_large_kg_per_hour))
        : NaN;

    const w = width == null ? NaN : parseFloat(String(width));
    let preferred = NaN;
    if (!isNaN(w)) {
      if (w < StorageBase.SIZE_WIDTH_SMALL_MAX_CM) preferred = small;
      else if (w >= StorageBase.SIZE_WIDTH_LARGE_MIN_CM) preferred = large;
      else preferred = medium;
    }
    if (!isNaN(preferred) && preferred > 0) return preferred;
    // Fall back to the representative (medium/average) rate.
    return this.machineRateKgPerHour(machine);
  }


  // True when a numeric value lies within an optional [min, max] capability
  // range. Missing bounds impose no constraint; a missing/invalid value passes
  // (we never block on absent product data). Used for film width/thickness.
  protected numInRange(value: any, min: any, max: any): boolean {
    const v = value == null ? NaN : parseFloat(String(value));
    if (isNaN(v)) return true;
    const lo = min == null ? NaN : parseFloat(String(min));
    const hi = max == null ? NaN : parseFloat(String(max));
    if (!isNaN(lo) && v < lo) return false;
    if (!isNaN(hi) && v > hi) return false;
    return true;
  }


  // Whether a film machine whose raw-material capability is `capability`
  // (HDPE / LDPE / "HDPE\LDPE" / null) can run an order of `material`.
  // No capability set → accepts any. No order material → not blocked. A dual
  // "HDPE\LDPE" machine accepts either HDPE or LDPE; otherwise exact match.
  protected filmMaterialTypeMatch(capability: any, material: any): boolean {
    const cap = String(capability ?? "").trim().toUpperCase();
    const mat = String(material ?? "").trim().toUpperCase();
    // Unrestricted machine: no capability configured (stored as empty by the
    // UI's "none" option) or an explicit "ANY" sentinel.
    if (cap === "" || cap === "ANY") return true;
    if (mat === "") return true;
    const dual = cap === "HDPE\\LDPE" || cap === "HDPE/LDPE";
    if (dual) return mat === "HDPE" || mat === "LDPE";
    return cap === mat;
  }


  protected countPrintColors(front?: any, back?: any): number {
    const countSide = (arr: any) =>
      Array.isArray(arr)
        ? arr.filter((c) => typeof c === "string" && c.trim() !== "").length
        : 0;
    return countSide(front) + countSide(back);
  }


  protected isClearProduct(row: any): boolean {
    const tokens = [
      row.master_batch_id,
      row.master_batch_name,
      row.master_batch_name_ar,
    ]
      .map((v) => String(v ?? "").toLowerCase())
      .join(" ");
    return (
      tokens.includes("clear") ||
      tokens.includes("شفاف") ||
      tokens.includes("بدون") ||
      tokens.includes("transparent")
    );
  }


  // Shared enriched-PO column list + joins used by both the queue and backlog
  // queries. `po` is the production_orders alias.
  protected enrichedPoColumns() {
    return sql`
      po.id AS production_order_id,
      po.production_order_number,
      po.quantity_kg,
      po.final_quantity_kg,
      po.status,
      po.production_stage,
      po.film_completed,
      po.printing_completed,
      po.cutting_completed,
      po.film_completion_percentage,
      po.printing_completion_percentage,
      po.cutting_completion_percentage,
      c.name AS customer_name,
      c.name_ar AS customer_name_ar,
      it.name AS item_name,
      it.name_ar AS item_name_ar,
      cp.size_caption,
      cp.width,
      cp.thickness,
      cp.universal_thickness,
      cp.raw_material,
      cp.is_printed,
      cp.printing_cylinder,
      cp.master_batch_id,
      mb.name AS master_batch_name,
      mb.name_ar AS master_batch_name_ar,
      mb.color_hex AS master_batch_color_hex,
      cp.front_print_colors,
      cp.back_print_colors
    `;
  }


  protected enrichedPoJoins() {
    return sql`
      LEFT JOIN orders o ON o.id = po.order_id
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
      LEFT JOIN items it ON it.id = cp.item_id
      LEFT JOIN master_batch_colors mb ON mb.id = cp.master_batch_id
    `;
  }


  protected mapEnrichedRow(row: any): any {
    return {
      ...row,
      print_colors_count: this.countPrintColors(
        row.front_print_colors,
        row.back_print_colors,
      ),
    };
  }


  protected qualityInspectionFormBaseQuery() {
    const operatorUser = alias(users, "qif_operator");
    const inspectorUser = alias(users, "qif_inspector");
    return db
      .select({
        id: quality_inspection_forms.id,
        form_number: quality_inspection_forms.form_number,
        template_type: quality_inspection_forms.template_type,
        production_order_id: quality_inspection_forms.production_order_id,
        machine_id: quality_inspection_forms.machine_id,
        operator_id: quality_inspection_forms.operator_id,
        inspector_id: quality_inspection_forms.inspector_id,
        shift: quality_inspection_forms.shift,
        sample_size: quality_inspection_forms.sample_size,
        items: quality_inspection_forms.items,
        overall_result: quality_inspection_forms.overall_result,
        notes: quality_inspection_forms.notes,
        inspected_at: quality_inspection_forms.inspected_at,
        created_at: quality_inspection_forms.created_at,
        updated_at: quality_inspection_forms.updated_at,
        production_order_number: production_orders.production_order_number,
        machine_name: machines.name,
        machine_name_ar: machines.name_ar,
        operator_name: operatorUser.display_name,
        operator_name_ar: operatorUser.display_name_ar,
        inspector_name: inspectorUser.display_name,
        inspector_name_ar: inspectorUser.display_name_ar,
      })
      .from(quality_inspection_forms)
      .leftJoin(
        production_orders,
        eq(quality_inspection_forms.production_order_id, production_orders.id),
      )
      .leftJoin(machines, eq(quality_inspection_forms.machine_id, machines.id))
      .leftJoin(
        operatorUser,
        eq(quality_inspection_forms.operator_id, operatorUser.id),
      )
      .leftJoin(
        inspectorUser,
        eq(quality_inspection_forms.inspector_id, inspectorUser.id),
      );
  }
}

// Merge IStorage into StorageBase's type so protected helpers can call
// public storage methods implemented in later chain fragments.
export interface StorageBase extends IStorage {}
