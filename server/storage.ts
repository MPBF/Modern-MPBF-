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
  gte,
  lte,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import ExcelJS from "exceljs";
import QRCode from "qrcode";

import { db, pool } from "./db";
import {
  computeEmployeeAttendance,
  type EmployeeAttendanceResult,
} from "./services/attendance-engine";
import { getDataValidator } from "./services/data-validator";
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
const CACHE_TTL = {
  REALTIME: 5 * 1000, // 5 seconds for production queues
  SHORT: 30 * 1000, // 30 seconds for active data
  MEDIUM: 5 * 60 * 1000, // 5 minutes for relatively stable data
  LONG: 15 * 60 * 1000, // 15 minutes for rarely changing data
};

function getCachedData(key: string): any | null {
  return cache.get(key);
}

function setCachedData(key: string, data: any, ttl: number): void {
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
function invalidateProductionCache(
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
class DatabaseError extends Error {
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

function truncateForLog(value: any, maxLen = 200): any {
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

function sanitizeDbError(error: any): any {
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

function handleDatabaseError(
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

async function withDatabaseErrorHandling<T>(
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
  createUser(user: InsertUser): Promise<User>;

  // Replit Auth user operations
  getUserByReplitId(replitUserId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Safe users (without sensitive data like passwords)
  getSafeUser(id: number): Promise<SafeUser | undefined>;
  getSafeUsers(): Promise<SafeUser[]>;
  getSafeUsersByRole(roleId: number): Promise<SafeUser[]>;

  // Roles
  getRoleById(id: number): Promise<Role | undefined>;

  // Orders
  getAllOrders(): Promise<NewOrder[]>;
  createOrder(order: InsertNewOrder): Promise<NewOrder>;
  updateOrder(id: number, order: Partial<NewOrder>): Promise<NewOrder>;
  updateOrderStatus(id: number, status: string): Promise<NewOrder>;
  updateOrderStatusWithPrevious(
    id: number,
    status: string,
    previousStatus: string | null,
  ): Promise<NewOrder>;
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
  }): Promise<ProductionOrder[]>;
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
  createProductionOrder(
    productionOrder: InsertProductionOrder,
  ): Promise<ProductionOrder>;
  createProductionOrdersBatch(
    productionOrders: InsertProductionOrder[],
  ): Promise<{
    successful: ProductionOrder[];
    failed: Array<{ order: InsertProductionOrder; error: string }>;
  }>;
  updateProductionOrder(
    id: number,
    productionOrder: Partial<ProductionOrder>,
  ): Promise<ProductionOrder>;
  updateProductionOrderStatusWithPrevious(
    id: number,
    status: string,
    previousStatus: string | null,
  ): Promise<void>;
  deleteProductionOrder(id: number): Promise<void>;
  maybeCompleteParentOrder(productionOrderId: number): Promise<void>;
  getProductionOrdersForPrintingQueue(): Promise<any[]>;
  getProductionOrdersForCuttingQueue(): Promise<any[]>;
  getGroupedCuttingQueue(): Promise<any[]>;

  // Rolls
  getAllRolls(): Promise<Roll[]>;
  getFloorRolls(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<FloorRollsResult>;
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
  getRollsByProductionOrder(productionOrderId: number): Promise<Roll[]>;
  createRoll(roll: InsertRoll): Promise<Roll>;
  updateRoll(id: number, roll: Partial<Roll>): Promise<Roll>;
  deleteRoll(id: number): Promise<void>;
  getManagedRolls(filters?: {
    stage?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  updateRollByManager(
    rollId: number,
    changes: {
      film_machine_id?: string | null;
      printing_machine_id?: string | null;
      cutting_machine_id?: string | null;
      production_order_id?: number;
      note?: string;
    },
    userId?: number,
  ): Promise<Roll>;
  getRollEditLogs(rollId: number): Promise<any[]>;
  getRecentRolls(limit: number): Promise<Roll[]>;

  // Machines
  getAllMachines(): Promise<Machine[]>;
  getMachineById(id: string | number): Promise<Machine | undefined>;

  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomerById(id: string | number): Promise<Customer | undefined>;

  // Maintenance
  getAllMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(
    request: InsertMaintenanceRequest,
  ): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(
    id: number,
    request: Partial<MaintenanceRequest>,
  ): Promise<MaintenanceRequest>;
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
  createQualityInspectionForm(
    data: InsertQualityInspectionForm,
  ): Promise<QualityInspectionForm>;
  updateQualityInspectionForm(
    id: number,
    data: Partial<InsertQualityInspectionForm>,
  ): Promise<QualityInspectionForm | null>;
  deleteQualityInspectionForm(id: number): Promise<boolean>;

  // Attendance
  getAttendanceByDate(date: string): Promise<any[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(
    id: number,
    attendance: Partial<Attendance>,
  ): Promise<Attendance>;
  deleteAttendance(id: number): Promise<void>;
  getAttendanceById(id: number): Promise<Attendance | null>;
  getAttendanceByUserAndDateRange(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<any[]>;
  getAttendanceSummary(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<any>;
  getAttendanceReport(
    startDate: Date,
    endDate: Date,
    filters?: any,
  ): Promise<any[]>;
  getDailyAttendanceStats(date: string): Promise<any>;
  upsertManualAttendance(entries: any[]): Promise<any[]>;
  getDailyAttendanceStatus(userId: number, date: string): Promise<any>;
  getDailyAttendanceOverview(date: string): Promise<any[]>;
  updateDailyAttendance(
    userId: number,
    date: string,
    patch: {
      check_in_time?: Date | null;
      break_start_time?: Date | null;
      break_end_time?: Date | null;
      check_out_time?: Date | null;
      status?: string;
    },
    updatedBy?: number,
  ): Promise<void>;
  getOpenAttendanceWithdrawal(
    attendanceId: number,
  ): Promise<AttendanceWithdrawal | null>;
  getOpenAttendanceWithdrawalForUser(
    userId: number,
    date: string,
  ): Promise<AttendanceWithdrawal | null>;
  finalizeAttendanceWithdrawal(
    withdrawalId: number,
    endedAt: Date,
    durationMinutes: number,
  ): Promise<AttendanceWithdrawal | null>;
  createAttendanceWithdrawal(
    data: InsertAttendanceWithdrawal,
  ): Promise<AttendanceWithdrawal>;
  getAttendanceWithdrawalsForDay(
    userId: number,
    date: string,
  ): Promise<{
    withdrawals: AttendanceWithdrawal[];
    totalMinutes: number;
  }>;
  getAttendanceWithdrawalsInRange(
    startDate: string,
    endDate: string,
    userId?: number,
  ): Promise<{
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
  getShiftAssignmentsByPeriod(
    year: number,
    month: number,
  ): Promise<ShiftAssignment[]>;
  getShiftAssignmentForUserMonth(
    userId: number,
    year: number,
    month: number,
  ): Promise<ShiftAssignment | null>;
  getShiftAssignmentsForUser(userId: number): Promise<ShiftAssignment[]>;
  upsertShiftAssignments(
    entries: InsertShiftAssignment[],
    createdBy: number | null,
  ): Promise<ShiftAssignment[]>;
  saveShiftRoster(
    year: number,
    month: number,
    upsertEntries: InsertShiftAssignment[],
    deleteUserIds: number[],
    createdBy: number | null,
  ): Promise<ShiftAssignment[]>;

  // HR module (employee directory, file, computed attendance)
  getHREmployees(): Promise<any[]>;
  getEmployeeFile(userId: number): Promise<any | null>;
  getComputedAttendance(
    userId: number,
    from: string,
    to: string,
  ): Promise<EmployeeAttendanceResult>;
  getAttendanceReportByRange(
    from: string,
    to: string,
    sectionId?: number,
  ): Promise<any[]>;

  // Waste
  getAllWaste(): Promise<any[]>;
  createWaste(wasteData: any): Promise<any>;

  // Sections
  getAllSections(): Promise<Section[]>;

  // Production Settings
  getProductionSettings(): Promise<ProductionSettings | undefined>;
  updateProductionSettings(
    settings: Partial<ProductionSettings>,
  ): Promise<ProductionSettings>;

  // Inventory
  getAllInventory(): Promise<Inventory[]>;
  updateInventory(
    id: number,
    inventory: Partial<Inventory>,
  ): Promise<Inventory>;
  createInventoryMovement(
    movement: InsertInventoryMovement,
  ): Promise<InventoryMovement>;
  getInventoryMovements(itemId?: number): Promise<any[]>;

  // Warehouse Receipts
  getAllWarehouseReceipts(): Promise<WarehouseReceipt[]>;
  createWarehouseReceipt(
    receipt: InsertWarehouseReceipt,
  ): Promise<WarehouseReceipt>;

  // Training
  getAllTrainingPrograms(): Promise<TrainingProgram[]>;
  createTrainingProgram(
    program: InsertTrainingProgram,
  ): Promise<TrainingProgram>;
  getTrainingProgramById(id: number): Promise<TrainingProgram | undefined>;
  getTrainingMaterials(programId?: number): Promise<TrainingMaterial[]>;
  createTrainingMaterial(
    material: InsertTrainingMaterial,
  ): Promise<TrainingMaterial>;
  getTrainingEnrollments(filters?: {
    programId?: number;
    employeeId?: number;
  }): Promise<any[]>;
  enrollUserInProgram(
    enrollment: InsertTrainingEnrollment,
  ): Promise<TrainingEnrollment>;
  updateEnrollment(
    id: number,
    updates: Partial<TrainingEnrollment>,
  ): Promise<TrainingEnrollment>;
  createEvaluation(
    evaluation: InsertTrainingEvaluation,
  ): Promise<TrainingEvaluation>;
  getCertificates(userId: number): Promise<TrainingCertificate[]>;
  createCertificate(
    certificate: InsertTrainingCertificate,
  ): Promise<TrainingCertificate>;

  // HR & Performance
  getPerformanceReviews(userId?: number | string): Promise<PerformanceReview[]>;
  createPerformanceReview(
    review: InsertPerformanceReview,
  ): Promise<PerformanceReview>;
  getPerformanceCriteria(): Promise<PerformanceCriteria[]>;
  getPerformanceRatings(reviewId: number): Promise<PerformanceRating[]>;
  createPerformanceRating(
    rating: InsertPerformanceRating,
  ): Promise<PerformanceRating>;

  // Leave Management
  getLeaveTypes(): Promise<LeaveType[]>;
  getLeaveRequests(userId?: number | string): Promise<any[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(
    id: number,
    updates: Partial<LeaveRequest>,
  ): Promise<LeaveRequest>;
  getLeaveBalances(
    userId: number | string,
    year?: number,
  ): Promise<LeaveBalance[]>;

  // Admin Decisions
  getAllAdminDecisions(): Promise<AdminDecision[]>;
  createAdminDecision(decision: any): Promise<AdminDecision>;

  // Items and Products
  getAllItems(): Promise<Item[]>;
  getAllCustomerProducts(): Promise<CustomerProduct[]>;
  getCustomerProductById(id: number): Promise<CustomerProduct | undefined>;

  // System Settings
  getSystemSettings(): Promise<SystemSetting[]>;
  updateSystemSetting(
    key: string,
    value: string,
    updatedBy?: number,
  ): Promise<SystemSetting>;

  // Factory Locations
  getFactoryLocations(): Promise<FactoryLocation[]>;
  createFactoryLocation(
    location: InsertFactoryLocation,
  ): Promise<FactoryLocation>;

  // User Settings
  getUserSettings(userId: number): Promise<UserSetting | undefined>;
  updateUserSetting(
    userId: number,
    key: string,
    value: string,
  ): Promise<UserSetting>;

  // System Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(
    userId?: number,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]>;
  updateNotificationStatus(
    twilioSid: string,
    updates: Partial<Notification>,
  ): Promise<Notification>;
  updateNotificationStatusByExternalId(
    externalId: string,
    updates: Partial<Notification>,
  ): Promise<Notification | undefined>;
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
  createSparePart(part: InsertSparePart): Promise<SparePart>;
  updateSparePart(
    id: number,
    data: Partial<InsertSparePart>,
  ): Promise<SparePart>;
  deleteSparePart(id: number): Promise<void>;
  getConsumableParts(): Promise<ConsumablePart[]>;
  createConsumablePart(part: InsertConsumablePart): Promise<ConsumablePart>;
  getConsumablePartTransactions(
    partId: number,
  ): Promise<ConsumablePartTransaction[]>;
  createConsumablePartTransaction(
    transaction: InsertConsumablePartTransaction,
  ): Promise<ConsumablePartTransaction>;
  getMaintenanceActions(requestId: number): Promise<MaintenanceAction[]>;
  createMaintenanceAction(
    action: InsertMaintenanceAction,
  ): Promise<MaintenanceAction>;
  // Preventive maintenance
  getMaintenanceComponents(
    machineType?: string,
  ): Promise<MaintenanceComponent[]>;
  getAllMaintenanceComponents(): Promise<MaintenanceComponent[]>;
  createMaintenanceComponent(
    data: InsertMaintenanceComponent,
  ): Promise<MaintenanceComponent>;
  updateMaintenanceComponent(
    id: number,
    data: UpdateMaintenanceComponent,
  ): Promise<MaintenanceComponent>;
  deleteMaintenanceComponent(id: number): Promise<void>;
  getPreventiveMaintenanceActions(machineId?: string): Promise<any[]>;
  createPreventiveMaintenanceAction(
    payload: CreatePreventiveMaintenance,
  ): Promise<PreventiveMaintenanceAction>;
  updatePreventiveMaintenanceAction(
    id: number,
    payload: UpdatePreventiveMaintenance,
  ): Promise<PreventiveMaintenanceAction>;
  deletePreventiveMaintenanceAction(id: number): Promise<void>;
  getLastActionPerComponent(machineId: string): Promise<any[]>;
  getMaintenanceReports(): Promise<MaintenanceReport[]>;
  createMaintenanceReport(
    report: InsertMaintenanceReport,
  ): Promise<MaintenanceReport>;
  getOperatorNegligenceReports(): Promise<OperatorNegligenceReport[]>;
  createOperatorNegligenceReport(
    report: InsertOperatorNegligenceReport,
  ): Promise<OperatorNegligenceReport>;

  // Smart Alerts
  getAllAlerts(options?: any): Promise<SystemAlert[]>;
  getAlertById(id: number): Promise<SystemAlert | undefined>;
  createAlert(alert: InsertSystemAlert): Promise<SystemAlert>;
  updateAlertStatus(
    id: number,
    status: string,
    userId?: number,
  ): Promise<SystemAlert>;
  getAlertRules(isEnabled?: boolean): Promise<AlertRule[]>;
  createAlertRule(rule: InsertAlertRule): Promise<AlertRule>;
  updateAlertRule(id: number, rule: Partial<AlertRule>): Promise<AlertRule>;
  getSystemHealthChecks(limit?: number): Promise<SystemHealthCheck[]>;
  createSystemHealthCheck(
    check: InsertSystemHealthCheck,
  ): Promise<SystemHealthCheck>;
  getSystemPerformanceMetrics(
    options?: any,
  ): Promise<SystemPerformanceMetric[]>;
  createSystemPerformanceMetric(
    metric: InsertSystemPerformanceMetric,
  ): Promise<SystemPerformanceMetric>;
  getCorrectiveActions(alertId?: number): Promise<CorrectiveAction[]>;
  createCorrectiveAction(
    action: InsertCorrectiveAction,
  ): Promise<CorrectiveAction>;
  updateCorrectiveAction(
    id: number,
    action: Partial<CorrectiveAction>,
  ): Promise<CorrectiveAction>;
  getSystemAnalytics(type?: string): Promise<SystemAnalytics[]>;
  createSystemAnalytics(
    analytics: InsertSystemAnalytics,
  ): Promise<SystemAnalytics>;

  // Alert Aliases (used by routes/alerts.ts and services/alert-manager.ts)
  getSystemAlerts(options?: any): Promise<SystemAlert[]>;
  getSystemAlertById(id: number): Promise<SystemAlert | undefined>;
  createSystemAlert(data: InsertSystemAlert): Promise<SystemAlert>;
  resolveSystemAlert(
    id: number,
    userId: number,
    notes?: string,
  ): Promise<SystemAlert>;
  dismissSystemAlert(id: number, userId: number): Promise<SystemAlert>;
  updateSystemAlert(
    id: number,
    data: Partial<SystemAlert>,
  ): Promise<SystemAlert>;
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
  getMetricsByTimeRange(
    name: string,
    start: Date,
    end: Date,
  ): Promise<SystemPerformanceMetric[]>;
  getLatestMetricValue(
    name: string,
  ): Promise<SystemPerformanceMetric | undefined>;

  // Corrective Action Aliases
  getPendingActions(): Promise<CorrectiveAction[]>;
  getActionsByAssignee(userId: number): Promise<CorrectiveAction[]>;
  completeCorrectiveAction(
    id: number,
    userId: number,
    notes?: string,
  ): Promise<CorrectiveAction>;

  // User Aliases
  getUserById(id: number): Promise<User | undefined>;

  // Quick Notes
  getQuickNotes(userId?: number): Promise<any[]>;
  createQuickNote(note: InsertQuickNote): Promise<QuickNote>;
  updateQuickNote(id: number, note: Partial<QuickNote>): Promise<QuickNote>;
  deleteQuickNote(id: number): Promise<void>;
  createNoteAttachment(
    attachment: InsertNoteAttachment,
  ): Promise<NoteAttachment>;
  getNoteAttachments(noteId: number): Promise<NoteAttachment[]>;
  getNoteAttachmentById(id: number): Promise<NoteAttachment | undefined>;

  // Machine Queues
  getMachineQueue(machineId: number): Promise<MachineQueue[]>;
  updateMachineQueue(
    machineId: number,
    queueItems: InsertMachineQueue[],
  ): Promise<MachineQueue[]>;

  // Mixing Batches
  getMixingBatches(options?: any): Promise<MixingBatch[]>;
  getMixingBatchById(id: number): Promise<any>;
  createMixingBatch(
    batch: InsertMixingBatch,
    ingredients: InsertBatchIngredient[],
  ): Promise<MixingBatch>;
  updateMixingBatchStatus(id: number, status: string): Promise<MixingBatch>;

  // Master Batch Colors
  getMasterBatchColors(): Promise<MasterBatchColor[]>;
  createMasterBatchColor(
    color: InsertMasterBatchColor,
  ): Promise<MasterBatchColor>;

  // Raw Material Vouchers
  getRawMaterialVouchersIn(): Promise<RawMaterialVoucherIn[]>;
  getRawMaterialVoucherInById(
    id: number,
  ): Promise<RawMaterialVoucherIn | undefined>;
  createRawMaterialVoucherIn(voucher: any): Promise<RawMaterialVoucherIn>;
  deleteRawMaterialVoucherIn(id: number): Promise<void>;
  getRawMaterialVouchersOut(): Promise<RawMaterialVoucherOut[]>;
  getRawMaterialVoucherOutById(
    id: number,
  ): Promise<RawMaterialVoucherOut | undefined>;
  createRawMaterialVoucherOut(voucher: any): Promise<RawMaterialVoucherOut>;
  deleteRawMaterialVoucherOut(id: number): Promise<void>;

  // Industrial Waste Vouchers (مستودع المخلفات الصناعية)
  getIndustrialWasteVouchersIn(): Promise<IndustrialWasteVoucherIn[]>;
  getIndustrialWasteVoucherInById(
    id: number,
  ): Promise<IndustrialWasteVoucherIn | undefined>;
  createIndustrialWasteVoucherIn(
    voucher: any,
  ): Promise<IndustrialWasteVoucherIn>;
  updateIndustrialWasteVoucherIn(
    id: number,
    voucher: any,
  ): Promise<IndustrialWasteVoucherIn>;
  deleteIndustrialWasteVoucherIn(id: number): Promise<void>;
  getIndustrialWasteVouchersOut(): Promise<IndustrialWasteVoucherOut[]>;
  getIndustrialWasteVoucherOutById(
    id: number,
  ): Promise<IndustrialWasteVoucherOut | undefined>;
  createIndustrialWasteVoucherOut(
    voucher: any,
  ): Promise<IndustrialWasteVoucherOut>;
  updateIndustrialWasteVoucherOut(
    id: number,
    voucher: any,
  ): Promise<IndustrialWasteVoucherOut>;
  deleteIndustrialWasteVoucherOut(id: number): Promise<void>;

  // Finished Goods Vouchers
  getFinishedGoodsVouchersIn(): Promise<FinishedGoodsVoucherIn[]>;
  getFinishedGoodsVoucherInById(
    id: number,
  ): Promise<FinishedGoodsVoucherIn | undefined>;
  createFinishedGoodsVoucherIn(voucher: any): Promise<FinishedGoodsVoucherIn>;
  getFinishedGoodsVouchersOut(): Promise<FinishedGoodsVoucherOut[]>;
  getFinishedGoodsVoucherOutById(
    id: number,
  ): Promise<FinishedGoodsVoucherOut | undefined>;
  createFinishedGoodsVoucherOut(voucher: any): Promise<FinishedGoodsVoucherOut>;
  deleteFinishedGoodsVoucherIn(id: number): Promise<void>;
  deleteFinishedGoodsVoucherOut(id: number): Promise<void>;
  getDeliveryHallOrders(): Promise<any[]>;
  getProductionHallOrders(): Promise<any[]>;
  getProductionOrdersForReceipt(): Promise<any[]>;
  updateProductionOrderReceivedKg(
    id: number,
    additionalKg: number,
  ): Promise<void>;
  getFinishedGoodsStock(): Promise<any[]>;
  updateFinishedGoodsStock(
    itemId: string,
    quantityChange: number,
    locationId?: number,
  ): Promise<void>;

  // Warehouse Stats
  getWarehouseVouchersStats(): Promise<any>;

  // Inventory Counts
  getInventoryCounts(): Promise<InventoryCount[]>;
  getInventoryCountById(id: number): Promise<any>;
  createInventoryCount(count: InsertInventoryCount): Promise<InventoryCount>;
  createInventoryCountItem(
    item: InsertInventoryCountItem,
  ): Promise<InventoryCountItem>;
  completeInventoryCount(id: number, userId: number): Promise<InventoryCount>;

  // Barcode Lookup
  lookupByBarcode(barcode: string): Promise<any>;

  // Notification Event Settings
  getAllNotificationEventSettings(): Promise<NotificationEventSetting[]>;
  getNotificationEventSettingById(
    id: number,
  ): Promise<NotificationEventSetting | undefined>;
  getNotificationEventSettingByKey(
    key: string,
  ): Promise<NotificationEventSetting | undefined>;
  createNotificationEventSetting(
    setting: InsertNotificationEventSetting,
  ): Promise<NotificationEventSetting>;
  updateNotificationEventSetting(
    id: number,
    setting: Partial<NotificationEventSetting>,
  ): Promise<NotificationEventSetting>;
  deleteNotificationEventSetting(id: number): Promise<void>;
  getNotificationEventLogs(options?: any): Promise<NotificationEventLog[]>;
  createNotificationEventLog(
    log: InsertNotificationEventLog,
  ): Promise<NotificationEventLog>;
  updateNotificationEventLog(
    id: number,
    updates: Partial<NotificationEventLog>,
  ): Promise<NotificationEventLog>;

  // Factory Snapshots
  getFactorySnapshots(userId?: number): Promise<FactorySnapshot[]>;
  getFactorySnapshot(id: number): Promise<FactorySnapshot | undefined>;
  getFactorySnapshotByToken(
    token: string,
  ): Promise<FactorySnapshot | undefined>;
  createFactorySnapshot(
    snapshot: InsertFactorySnapshot,
  ): Promise<FactorySnapshot>;
  deleteFactorySnapshot(id: number): Promise<void>;

  // Display Slides
  getDisplaySlides(): Promise<DisplaySlide[]>;
  getActiveDisplaySlides(): Promise<DisplaySlide[]>;
  getDisplaySlideById(id: number): Promise<DisplaySlide | undefined>;
  createDisplaySlide(slide: InsertDisplaySlide): Promise<DisplaySlide>;
  updateDisplaySlide(
    id: number,
    slide: Partial<DisplaySlide>,
  ): Promise<DisplaySlide>;
  deleteDisplaySlide(id: number): Promise<void>;

  // Delivery Manifests
  getDeliveryManifests(): Promise<DeliveryManifest[]>;
  getDeliveryManifestById(id: number): Promise<DeliveryManifest | undefined>;
  createDeliveryManifest(
    data: InsertDeliveryManifest,
    userId: number,
  ): Promise<DeliveryManifest>;
  updateDeliveryManifest(
    id: number,
    updates: Partial<InsertDeliveryManifest>,
  ): Promise<DeliveryManifest>;
  deleteDeliveryManifest(id: number): Promise<void>;

  // Admin Tool Documents (generic)
  getAdminToolDocuments(docType?: string): Promise<AdminToolDocument[]>;
  getAdminToolDocumentById(id: number): Promise<AdminToolDocument | undefined>;
  createAdminToolDocument(
    data: InsertAdminToolDocument,
    userId: number,
  ): Promise<AdminToolDocument>;
  updateAdminToolDocument(
    id: number,
    updates: Partial<InsertAdminToolDocument>,
  ): Promise<AdminToolDocument>;
  deleteAdminToolDocument(id: number): Promise<void>;

  // Experimental Blends
  getExperimentalBlends(): Promise<ExperimentalBlend[]>;
  getExperimentalBlendById(id: number): Promise<ExperimentalBlend | undefined>;
  createExperimentalBlend(
    blend: InsertExperimentalBlend,
  ): Promise<ExperimentalBlend>;
  updateExperimentalBlend(
    id: number,
    blend: Partial<InsertExperimentalBlend>,
    items?: InsertExperimentalBlendItem[],
  ): Promise<ExperimentalBlend>;
  deleteExperimentalBlend(id: number): Promise<void>;
  getExperimentalBlendItems(blendId: number): Promise<ExperimentalBlendItem[]>;
  createExperimentalBlendItems(
    items: InsertExperimentalBlendItem[],
  ): Promise<ExperimentalBlendItem[]>;

  // Bag Weight Records
  getBagWeightRecordsByUser(userId: number): Promise<BagWeightRecord[]>;
  createBagWeightRecord(
    userId: number,
    record: Omit<InsertBagWeightRecord, "id" | "user_id" | "created_at">,
  ): Promise<BagWeightRecord>;
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

export class DatabaseStorage implements IStorage {
  private dataValidator = getDataValidator(this);
  // In-memory storage for alert rate limiting - persistent during server session
  private alertTimesStorage: Map<string, Date> = new Map();

  private static readonly ALLOWED_TABLES = new Set([
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

  async exists(table: string, field: string, value: any): Promise<boolean> {
    try {
      if (!DatabaseStorage.ALLOWED_TABLES.has(table)) {
        console.error(`exists() called with disallowed table name: ${table}`);
        return false;
      }
      if (!/^[a-z_][a-z0-9_]*$/i.test(field)) {
        console.error(`exists() called with invalid field name: ${field}`);
        return false;
      }
      const result = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM "${table}" WHERE "${field}" = $1)`,
        [value],
      );
      return result.rows[0].exists;
    } catch (error) {
      console.error(`Error checking existence in ${table}.${field}:`, error);
      return false;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      },
      "getUser",
      `جلب المستخدم ${id}`,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username));
        return user;
      },
      "getUserByUsername",
      `جلب المستخدم ${username}`,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return withDatabaseErrorHandling(
      async () => {
        const validation = await this.dataValidator.validateData(
          "users",
          insertUser,
        );
        if (!validation.isValid) {
          throw new Error(
            `خطأ في البيانات: ${validation.errors.map((e) => e.message_ar).join(", ")}`,
          );
        }

        const dataToInsert = { ...insertUser };
        if (dataToInsert.password) {
          let isAlreadyHashed = false;
          try {
            bcrypt.getRounds(dataToInsert.password);
            isAlreadyHashed = true;
          } catch {
            isAlreadyHashed = false;
          }
          if (!isAlreadyHashed) {
            dataToInsert.password = await bcrypt.hash(
              dataToInsert.password,
              10,
            );
          }
        }

        const [user] = await db.insert(users).values(dataToInsert).returning();
        return user;
      },
      "createUser",
      "إنشاء مستخدم جديد",
    );
  }

  async getUserByReplitId(replitUserId: string): Promise<User | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.replit_user_id, replitUserId));
        return user;
      },
      "getUserByReplitId",
      `جلب مستخدم Replit ${replitUserId}`,
    );
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return withDatabaseErrorHandling(
      async () => {
        const existingUser = userData.replit_user_id
          ? await this.getUserByReplitId(userData.replit_user_id)
          : undefined;

        if (existingUser) {
          const [updatedUser] = await db
            .update(users)
            .set({
              display_name: userData.display_name,
              display_name_ar:
                userData.display_name_ar || userData.display_name,
              updated_at: new Date(),
            })
            .where(eq(users.id, existingUser.id))
            .returning();
          return updatedUser;
        }

        const [newUser] = await db
          .insert(users)
          .values({
            username: userData.username,
            replit_user_id: userData.replit_user_id,
            display_name: userData.display_name,
            display_name_ar: userData.display_name_ar || userData.display_name,
            role_id: 2, // الافتراضي هو موظف
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();
        return newUser;
      },
      "upsertUser",
      "تحديث أو إنشاء مستخدم Replit",
    );
  }

  async getSafeUser(id: number): Promise<SafeUser | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
            full_name: users.full_name,
            phone: users.phone,
            email: users.email,
            role_id: users.role_id,
            section_id: users.section_id,
            status: users.status,
            must_change_password: users.must_change_password,
            replit_user_id: users.replit_user_id,
            first_name: users.first_name,
            last_name: users.last_name,
            profile_image_url: users.profile_image_url,
            created_at: users.created_at,
            updated_at: users.updated_at,
          })
          .from(users)
          .where(eq(users.id, id));
        return user;
      },
      "getSafeUser",
      `جلب بيانات المستخدم الآمنة ${id}`,
    );
  }

  async getSafeUsers(): Promise<SafeUser[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db
          .select({
            id: users.id,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
            full_name: users.full_name,
            phone: users.phone,
            email: users.email,
            role_id: users.role_id,
            section_id: users.section_id,
            status: users.status,
            must_change_password: users.must_change_password,
            replit_user_id: users.replit_user_id,
            first_name: users.first_name,
            last_name: users.last_name,
            profile_image_url: users.profile_image_url,
            created_at: users.created_at,
            updated_at: users.updated_at,
          })
          .from(users)
          .orderBy(users.username);
      },
      "getSafeUsers",
      "جلب قائمة المستخدمين",
    );
  }

  async getSafeUsersByRole(roleId: number): Promise<SafeUser[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db
          .select({
            id: users.id,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
            full_name: users.full_name,
            phone: users.phone,
            email: users.email,
            role_id: users.role_id,
            section_id: users.section_id,
            status: users.status,
            must_change_password: users.must_change_password,
            replit_user_id: users.replit_user_id,
            first_name: users.first_name,
            last_name: users.last_name,
            profile_image_url: users.profile_image_url,
            created_at: users.created_at,
            updated_at: users.updated_at,
          })
          .from(users)
          .where(eq(users.role_id, roleId));
      },
      "getSafeUsersByRole",
      `جلب المستخدمين حسب الدور ${roleId}`,
    );
  }

  async getRoleById(id: number): Promise<Role | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [role] = await db.select().from(roles).where(eq(roles.id, id));
        return role;
      },
      "getRoleById",
      `جلب الدور ${id}`,
    );
  }

  async getAllOrders(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<NewOrder[]> {
    return withDatabaseErrorHandling(
      async () => {
        // Pagination is opt-in: legacy callers (no opts) still get the full list.
        if (!opts) {
          return await db.select().from(orders).orderBy(desc(orders.id));
        }
        const limit = Math.max(1, Math.min(opts.limit ?? 50, 500));
        const offset = Math.max(0, opts.offset ?? 0);
        return await db
          .select()
          .from(orders)
          .orderBy(desc(orders.id))
          .limit(limit)
          .offset(offset);
      },
      "getAllOrders",
      "جلب جميع الطلبات",
    );
  }

  async createOrder(insertOrder: InsertNewOrder): Promise<NewOrder> {
    return withDatabaseErrorHandling(
      async () => {
        // التحقق من صحة البيانات
        const validation = await this.dataValidator.validateData(
          "orders",
          insertOrder,
        );
        if (!validation.isValid) {
          throw new Error(
            `خطأ في البيانات: ${validation.errors.map((e) => e.message_ar).join(", ")}`,
          );
        }

        // Generate a cryptographically random share token for the public QR link
        const crypto = await import("crypto");
        const shareToken = crypto.randomBytes(32).toString("hex");

        const [order] = await db
          .insert(orders)
          .values({ ...insertOrder, share_token: shareToken } as any)
          .returning();
        return order;
      },
      "createOrder",
      "إنشاء طلب جديد",
    );
  }

  async getOrderByShareToken(token: string): Promise<NewOrder | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.share_token as any, token));
        return order;
      },
      "getOrderByShareToken",
      "جلب الطلب بالرمز المشترك",
    );
  }

  async updateOrder(
    id: number,
    orderUpdates: Partial<NewOrder>,
  ): Promise<NewOrder> {
    return withDatabaseErrorHandling(
      async () => {
        const [updatedOrder] = await db
          .update(orders)
          .set({ ...orderUpdates })
          .where(eq(orders.id, id))
          .returning();
        return updatedOrder;
      },
      "updateOrder",
      `تحديث الطلب ${id}`,
    );
  }

  async updateOrderStatus(id: number, status: string): Promise<NewOrder> {
    return withDatabaseErrorHandling(
      async () => {
        const [updatedOrder] = await db
          .update(orders)
          .set({ status })
          .where(eq(orders.id, id))
          .returning();
        return updatedOrder;
      },
      "updateOrderStatus",
      `تحديث حالة الطلب ${id}`,
    );
  }

  async updateOrderStatusWithPrevious(
    id: number,
    status: string,
    previousStatus: string | null,
  ): Promise<NewOrder> {
    return withDatabaseErrorHandling(
      async () => {
        const [updatedOrder] = await db
          .update(orders)
          .set({ status, previous_status: previousStatus })
          .where(eq(orders.id, id))
          .returning();
        return updatedOrder;
      },
      "updateOrderStatusWithPrevious",
      `تحديث حالة الطلب ${id} مع حفظ الحالة السابقة`,
    );
  }

  async getOrderById(id: number): Promise<NewOrder | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [order] = await db.select().from(orders).where(eq(orders.id, id));
        return order;
      },
      "getOrderById",
      `جلب الطلب ${id}`,
    );
  }

  async deleteOrder(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.transaction(async (tx) => {
          const relatedPOs = await tx
            .select({ id: production_orders.id })
            .from(production_orders)
            .where(eq(production_orders.order_id, id));
          const poIds = relatedPOs.map((po) => po.id);

          if (poIds.length > 0) {
            await tx
              .delete(waste)
              .where(inArray(waste.production_order_id, poIds));
            await tx
              .delete(machine_queues)
              .where(inArray(machine_queues.production_order_id, poIds));
            await tx
              .delete(mixing_batches)
              .where(inArray(mixing_batches.production_order_id, poIds));
            await tx
              .delete(warehouse_receipts)
              .where(inArray(warehouse_receipts.production_order_id, poIds));
            await tx
              .delete(finished_goods_vouchers_in)
              .where(
                inArray(finished_goods_vouchers_in.production_order_id, poIds),
              );
            await tx
              .delete(raw_material_vouchers_out)
              .where(
                inArray(raw_material_vouchers_out.production_order_id, poIds),
              );
            await tx
              .delete(rolls)
              .where(inArray(rolls.production_order_id, poIds));
          }

          await tx
            .delete(production_orders)
            .where(eq(production_orders.order_id, id));
          await tx.delete(orders).where(eq(orders.id, id));
        });
        invalidateProductionCache();
      },
      "deleteOrder",
      `حذف الطلب ${id}`,
    );
  }

  async getOrdersForProduction(): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const results = await db
          .select({
            id: orders.id,
            customer_name: customers.name,
            delivery_date: orders.delivery_date,
            status: orders.status,
          })
          .from(orders)
          .leftJoin(customers, eq(orders.customer_id, customers.id))
          .where(eq(orders.status, "in_production"))
          .orderBy(orders.delivery_date);
        return results;
      },
      "getOrdersForProduction",
      "جلب الطلبات للتخطيط",
    );
  }

  async getHierarchicalOrdersForProduction(): Promise<any[]> {
    const cached = getCachedData("hierarchical_orders");
    if (cached) return cached;

    return withDatabaseErrorHandling(
      async () => {
        const ordersList = await this.getOrdersForProduction();
        setCachedData("hierarchical_orders", ordersList, CACHE_TTL.SHORT);
        return ordersList;
      },
      "getHierarchicalOrdersForProduction",
      "جلب الطلبات الهيكلية",
    );
  }

  async getAllProductionOrders(filters?: {
    id?: number;
    order_id?: number;
    customer_id?: string;
    production_stage?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const operatorUser = alias(users, "operator_user");
        const productItem = alias(items, "product_item");

        const whereClauses: any[] = [];
        if (filters?.id !== undefined && !isNaN(filters.id)) {
          whereClauses.push(eq(production_orders.id, filters.id));
        }
        if (filters?.order_id !== undefined && !isNaN(filters.order_id)) {
          whereClauses.push(eq(production_orders.order_id, filters.order_id));
        }
        if (filters?.customer_id) {
          whereClauses.push(eq(orders.customer_id, filters.customer_id));
        }
        if (
          filters?.production_stage &&
          ["film", "printing", "cutting", "done"].includes(
            filters.production_stage,
          )
        ) {
          whereClauses.push(
            eq(production_orders.production_stage, filters.production_stage),
          );
        }

        let query = db
          .select({
            id: production_orders.id,
            production_order_number: production_orders.production_order_number,
            order_id: production_orders.order_id,
            customer_product_id: production_orders.customer_product_id,
            quantity_kg: production_orders.quantity_kg,
            overrun_percentage: production_orders.overrun_percentage,
            final_quantity_kg: production_orders.final_quantity_kg,
            produced_quantity_kg: production_orders.produced_quantity_kg,
            printed_quantity_kg: production_orders.printed_quantity_kg,
            net_quantity_kg: production_orders.net_quantity_kg,
            waste_quantity_kg: production_orders.waste_quantity_kg,
            film_completion_percentage:
              production_orders.film_completion_percentage,
            printing_completion_percentage:
              production_orders.printing_completion_percentage,
            cutting_completion_percentage:
              production_orders.cutting_completion_percentage,
            assigned_machine_id: production_orders.assigned_machine_id,
            assigned_operator_id: production_orders.assigned_operator_id,
            production_start_time: production_orders.production_start_time,
            production_end_time: production_orders.production_end_time,
            production_time_minutes: production_orders.production_time_minutes,
            film_completed: production_orders.film_completed,
            printing_completed: production_orders.printing_completed,
            cutting_completed: production_orders.cutting_completed,
            is_final_roll_created: production_orders.is_final_roll_created,
            warehouse_received_kg: production_orders.warehouse_received_kg,
            status: production_orders.status,
            previous_status: production_orders.previous_status,
            production_stage: production_orders.production_stage,
            order_number: orders.order_number,
            order_created_at: orders.created_at,
            customer_id: customers.id,
            customer_name: customers.name,
            customer_name_ar: customers.name_ar,
            size_caption: customer_products.size_caption,
            is_printed: customer_products.is_printed,
            item_id: customer_products.item_id,
            raw_material: customer_products.raw_material,
            master_batch_id: customer_products.master_batch_id,
            item_name: productItem.name,
            item_name_ar: productItem.name_ar,
            machine_name: machines.name,
            machine_name_ar: machines.name_ar,
            operator_name: operatorUser.display_name,
            operator_name_ar: operatorUser.display_name_ar,
          })
          .from(production_orders)
          .leftJoin(orders, eq(production_orders.order_id, orders.id))
          .leftJoin(customers, eq(orders.customer_id, customers.id))
          .leftJoin(
            customer_products,
            eq(production_orders.customer_product_id, customer_products.id),
          )
          .leftJoin(productItem, eq(customer_products.item_id, productItem.id))
          .leftJoin(
            machines,
            eq(production_orders.assigned_machine_id, machines.id),
          )
          .leftJoin(
            operatorUser,
            eq(production_orders.assigned_operator_id, operatorUser.id),
          )
          .$dynamic();

        if (whereClauses.length > 0) {
          query = query.where(
            whereClauses.length === 1 ? whereClauses[0] : and(...whereClauses),
          );
        }

        query = query.orderBy(desc(production_orders.id));

        if (filters?.limit !== undefined && filters.limit > 0) {
          query = query.limit(filters.limit);
        }
        if (filters?.offset !== undefined && filters.offset >= 0) {
          query = query.offset(filters.offset);
        }

        return await query;
      },
      "getAllProductionOrders",
      "جلب أوامر الإنتاج",
    );
  }

  async getProductionOrderById(
    id: number,
  ): Promise<ProductionOrder | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [po] = await db
          .select()
          .from(production_orders)
          .where(eq(production_orders.id, id));
        return po;
      },
      "getProductionOrderById",
      `جلب أمر الإنتاج ${id}`,
    );
  }

  async createProductionOrder(
    po: InsertProductionOrder,
    extra?: { final_quantity_kg?: number },
  ): Promise<ProductionOrder> {
    return withDatabaseErrorHandling(
      async () => {
        const validation = await this.dataValidator.validateData(
          "production_orders",
          po,
        );
        if (!validation.isValid) {
          throw new Error(
            `خطأ في البيانات: ${validation.errors.map((e) => e.message_ar).join(", ")}`,
          );
        }

        const newPo = await db.transaction(async (tx) => {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(1001)`);

          const result = await tx.execute(
            sql`SELECT MAX(CAST(SUBSTRING(production_order_number FROM 3) AS INTEGER)) as max_num
                FROM production_orders
                WHERE production_order_number ~ '^PO[0-9]+$'`,
          );
          const maxNum = (result as any).rows?.[0]?.max_num || 0;
          const nextNumber = maxNum + 1;
          const productionOrderNumber = `PO${nextNumber.toString().padStart(3, "0")}`;

          const insertValues: any = {
            ...po,
            production_order_number: productionOrderNumber,
          };
          if (extra?.final_quantity_kg !== undefined) {
            insertValues.final_quantity_kg = extra.final_quantity_kg.toString();
          }

          const [created] = await tx
            .insert(production_orders)
            .values(insertValues)
            .returning();
          return created;
        });

        invalidateProductionCache();
        return newPo;
      },
      "createProductionOrder",
      "إنشاء أمر إنتاج",
    );
  }

  async createProductionOrdersBatch(
    batch: InsertProductionOrder[],
  ): Promise<any> {
    return withDatabaseErrorHandling(
      async () => {
        const results: { successful: any[]; failed: any[] } = {
          successful: [],
          failed: [],
        };

        if (batch.length === 0) return results;

        try {
          const created = await db.transaction(async (tx) => {
            await tx.execute(sql`SELECT pg_advisory_xact_lock(1001)`);

            const maxResult = await tx.execute(
              sql`SELECT MAX(CAST(SUBSTRING(production_order_number FROM 3) AS INTEGER)) as max_num
                  FROM production_orders
                  WHERE production_order_number ~ '^PO[0-9]+$'`,
            );
            let nextNum = ((maxResult as any).rows?.[0]?.max_num || 0) + 1;

            const valuesToInsert = batch.map((po) => {
              const poNumber = `PO${(nextNum++).toString().padStart(3, "0")}`;
              return { ...po, production_order_number: poNumber };
            });

            return await tx
              .insert(production_orders)
              .values(valuesToInsert as any)
              .returning();
          });

          results.successful = created;
        } catch (e) {
          for (const po of batch) {
            try {
              const created = await this.createProductionOrder(po);
              results.successful.push(created);
            } catch (err) {
              results.failed.push({ order: po, error: (err as any).message });
            }
          }
        }

        invalidateProductionCache();
        return results;
      },
      "createProductionOrdersBatch",
      "إنشاء دفعة أوامر إنتاج",
    );
  }

  async createProductionOrdersBatchWithFinalQty(
    batch: Array<{ data: InsertProductionOrder; finalQuantityKg: number }>,
  ): Promise<any> {
    return withDatabaseErrorHandling(
      async () => {
        const results = {
          successful: [] as ProductionOrder[],
          failed: [] as Array<{ order: InsertProductionOrder; error: string }>,
        };

        if (batch.length === 0) return results;

        try {
          const created = await db.transaction(async (tx) => {
            await tx.execute(sql`SELECT pg_advisory_xact_lock(1001)`);

            const maxResult = await tx.execute(
              sql`SELECT MAX(CAST(SUBSTRING(production_order_number FROM 3) AS INTEGER)) as max_num
                  FROM production_orders
                  WHERE production_order_number ~ '^PO[0-9]+$'`,
            );
            let nextNum = ((maxResult as any).rows?.[0]?.max_num || 0) + 1;

            const valuesToInsert = batch.map(({ data, finalQuantityKg }) => {
              const poNumber = `PO${(nextNum++).toString().padStart(3, "0")}`;
              return {
                ...data,
                production_order_number: poNumber,
                final_quantity_kg: finalQuantityKg.toString(),
              };
            });

            return await tx
              .insert(production_orders)
              .values(valuesToInsert as any)
              .returning();
          });

          results.successful = created;
        } catch (e) {
          for (const { data, finalQuantityKg } of batch) {
            try {
              const created = await this.createProductionOrder(data, {
                final_quantity_kg: finalQuantityKg,
              });
              results.successful.push(created);
            } catch (err: any) {
              results.failed.push({ order: data, error: err.message });
            }
          }
        }

        invalidateProductionCache();
        return results;
      },
      "createProductionOrdersBatchWithFinalQty",
      "إنشاء دفعة أوامر إنتاج مع الكمية النهائية",
    );
  }

  async updateProductionOrder(
    id: number,
    updates: Partial<ProductionOrder>,
  ): Promise<ProductionOrder> {
    return withDatabaseErrorHandling(
      async () => {
        const [updated] = await db
          .update(production_orders)
          .set({ ...updates })
          .where(eq(production_orders.id, id))
          .returning();
        invalidateProductionCache();
        return updated;
      },
      "updateProductionOrder",
      `تحديث أمر الإنتاج ${id}`,
    );
  }

  async updateProductionOrdersStatusByOrder(
    orderId: number,
    fromStatuses: string[],
    toStatus: string,
  ): Promise<void> {
    await db
      .update(production_orders)
      .set({ status: toStatus, updated_at: new Date() } as any)
      .where(
        and(
          eq(production_orders.order_id, orderId),
          inArray(production_orders.status, fromStatuses),
        ),
      );
    invalidateProductionCache();
  }

  async updateProductionOrderStatusWithPrevious(
    id: number,
    status: string,
    previousStatus: string | null,
  ): Promise<void> {
    await db
      .update(production_orders)
      .set({ status, previous_status: previousStatus } as any)
      .where(eq(production_orders.id, id));
    invalidateProductionCache();
  }

  async deleteProductionOrder(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        // Clean up child rows in the same transaction so we don't fail with
        // foreign-key constraint errors and leave the database half-deleted.
        await db.transaction(async (tx) => {
          await tx.delete(waste).where(eq(waste.production_order_id, id));
          await tx
            .delete(machine_queues)
            .where(eq(machine_queues.production_order_id, id));
          await tx
            .delete(mixing_batches)
            .where(eq(mixing_batches.production_order_id, id));
          await tx
            .delete(warehouse_receipts)
            .where(eq(warehouse_receipts.production_order_id, id));
          await tx
            .delete(finished_goods_vouchers_in)
            .where(eq(finished_goods_vouchers_in.production_order_id, id));
          await tx
            .delete(raw_material_vouchers_out)
            .where(eq(raw_material_vouchers_out.production_order_id, id));
          await tx.delete(rolls).where(eq(rolls.production_order_id, id));
          await tx
            .delete(production_orders)
            .where(eq(production_orders.id, id));
        });
        invalidateProductionCache();
      },
      "deleteProductionOrder",
      `حذف أمر الإنتاج ${id}`,
    );
  }

  async getProductionOrdersForPrintingQueue(): Promise<any[]> {
    const cached = getCachedData("printing_queue");
    if (cached) return cached;

    return withDatabaseErrorHandling(
      async () => {
        const results = await db
          .select({
            id: production_orders.id,
            production_order_number: production_orders.production_order_number,
            order_id: production_orders.order_id,
            customer_product_id: production_orders.customer_product_id,
            quantity_kg: production_orders.quantity_kg,
            final_quantity_kg: production_orders.final_quantity_kg,
            status: production_orders.status,
            order_number: orders.order_number,
            customer_name: customers.name,
            customer_name_ar: customers.name_ar,
            item_name: items.name,
            item_name_ar: items.name_ar,
            size_caption: customer_products.size_caption,
            thickness: customer_products.thickness,
            raw_material: customer_products.raw_material,
            master_batch_id: customer_products.master_batch_id,
            is_printed: customer_products.is_printed,
          })
          .from(production_orders)
          .leftJoin(orders, eq(production_orders.order_id, orders.id))
          .leftJoin(customers, eq(orders.customer_id, customers.id))
          .leftJoin(
            customer_products,
            eq(production_orders.customer_product_id, customer_products.id),
          )
          .leftJoin(items, eq(customer_products.item_id, items.id))
          .where(eq(production_orders.status, "waiting_for_printing"))
          .orderBy(production_orders.id);
        setCachedData("printing_queue", results, CACHE_TTL.REALTIME);
        return results;
      },
      "getProductionOrdersForPrintingQueue",
      "جلب طابور الطباعة",
    );
  }

  async getProductionOrdersForCuttingQueue(): Promise<any[]> {
    const cached = getCachedData("cutting_queue");
    if (cached) return cached;

    return withDatabaseErrorHandling(
      async () => {
        const results = await db
          .select({
            id: production_orders.id,
            production_order_number: production_orders.production_order_number,
            order_id: production_orders.order_id,
            customer_product_id: production_orders.customer_product_id,
            quantity_kg: production_orders.quantity_kg,
            final_quantity_kg: production_orders.final_quantity_kg,
            status: production_orders.status,
            order_number: orders.order_number,
            customer_name: customers.name,
            customer_name_ar: customers.name_ar,
            item_name: items.name,
            item_name_ar: items.name_ar,
            size_caption: customer_products.size_caption,
            thickness: customer_products.thickness,
            raw_material: customer_products.raw_material,
            master_batch_id: customer_products.master_batch_id,
            is_printed: customer_products.is_printed,
          })
          .from(production_orders)
          .leftJoin(orders, eq(production_orders.order_id, orders.id))
          .leftJoin(customers, eq(orders.customer_id, customers.id))
          .leftJoin(
            customer_products,
            eq(production_orders.customer_product_id, customer_products.id),
          )
          .leftJoin(items, eq(customer_products.item_id, items.id))
          .where(eq(production_orders.status, "waiting_for_cutting"))
          .orderBy(production_orders.id);
        setCachedData("cutting_queue", results, CACHE_TTL.REALTIME);
        return results;
      },
      "getProductionOrdersForCuttingQueue",
      "جلب طابور القص",
    );
  }

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

  async getRollsByProductionOrder(poId: number): Promise<Roll[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db
          .select()
          .from(rolls)
          .where(eq(rolls.production_order_id, poId));
      },
      "getRollsByProductionOrder",
      `جلب رولات أمر الإنتاج ${poId}`,
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

  async getAllMachines(): Promise<Machine[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db.select().from(machines).orderBy(machines.name);
      },
      "getAllMachines",
      "جلب الماكينات",
    );
  }

  async getMachineById(id: string | number): Promise<Machine | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [m] = await db
          .select()
          .from(machines)
          .where(eq(machines.id, String(id)));
        return m;
      },
      "getMachineById",
      `جلب الماكينة ${id}`,
    );
  }

  async getAllCustomers(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<Customer[]> {
    return withDatabaseErrorHandling(
      async () => {
        // Pagination is opt-in. ?all=true and other legacy callers must still
        // receive the full list, so return everything when no opts is passed.
        if (!opts) {
          return await db.select().from(customers).orderBy(customers.name);
        }
        const limit = Math.max(1, Math.min(opts.limit ?? 50, 500));
        const offset = Math.max(0, opts.offset ?? 0);
        return await db
          .select()
          .from(customers)
          .orderBy(customers.name)
          .limit(limit)
          .offset(offset);
      },
      "getAllCustomers",
      "جلب العملاء",
    );
  }

  async getCustomerById(id: string | number): Promise<Customer | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        const [c] = await db
          .select()
          .from(customers)
          .where(eq(customers.id, String(id)));
        return c;
      },
      "getCustomerById",
      `جلب العميل ${id}`,
    );
  }

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

  async getAttendanceByDate(date: string): Promise<any[]> {
    try {
      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          display_name_ar: users.display_name_ar,
          role_id: users.role_id,
          role_name: roles.name,
          role_name_ar: roles.name_ar,
          status: users.status,
        })
        .from(users)
        .leftJoin(roles, eq(users.role_id, roles.id))
        .where(eq(users.status, "active"));

      const attendanceRecords = await db
        .select()
        .from(attendance)
        .where(eq(attendance.date, date));

      const attendanceMap = new Map();
      for (const record of attendanceRecords) {
        if (!attendanceMap.has(record.user_id)) {
          attendanceMap.set(record.user_id, record);
        } else {
          const existing = attendanceMap.get(record.user_id);
          if (record.check_in_time && !existing.check_in_time) {
            existing.check_in_time = record.check_in_time;
          }
          if (record.check_out_time && !existing.check_out_time) {
            existing.check_out_time = record.check_out_time;
          }
        }
      }

      return allUsers.map((user) => {
        const record = attendanceMap.get(user.id);
        return {
          user_id: user.id,
          username: user.username,
          display_name: user.display_name,
          display_name_ar: user.display_name_ar,
          role_name: user.role_name,
          role_name_ar: user.role_name_ar,
          attendance_id: record?.id || null,
          status: record?.status || "غائب",
          check_in_time: record?.check_in_time || null,
          check_out_time: record?.check_out_time || null,
          date: date,
        };
      });
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      throw new Error("فشل في جلب بيانات الحضور");
    }
  }

  async createAttendance(data: InsertAttendance): Promise<Attendance> {
    return withDatabaseErrorHandling(
      async () => {
        const [att] = await db.insert(attendance).values(data).returning();
        return att;
      },
      "createAttendance",
      "إنشاء سجل حضور",
    );
  }

  async updateAttendance(
    id: number,
    updates: Partial<Attendance>,
  ): Promise<Attendance> {
    return withDatabaseErrorHandling(
      async () => {
        const [updated] = await db
          .update(attendance)
          .set({ ...updates, updated_at: new Date() })
          .where(eq(attendance.id, id))
          .returning();
        return updated;
      },
      "updateAttendance",
      `تحديث سجل الحضور ${id}`,
    );
  }

  async deleteAttendance(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.delete(attendance).where(eq(attendance.id, id));
      },
      "deleteAttendance",
      `حذف سجل الحضور ${id}`,
    );
  }

  async getAttendanceById(id: number): Promise<Attendance | null> {
    return withDatabaseErrorHandling(
      async () => {
        const [att] = await db
          .select()
          .from(attendance)
          .where(eq(attendance.id, id));
        return att || null;
      },
      "getAttendanceById",
      `جلب سجل الحضور ${id}`,
    );
  }

  async getAttendanceByUserAndDateRange(
    userId: number,
    start: string,
    end: string,
  ): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.user_id, userId),
              sql`${attendance.date} BETWEEN ${start} AND ${end}`,
            ),
          )
          .orderBy(attendance.date);
      },
      "getAttendanceByUserAndDateRange",
      "جلب سجلات الحضور",
    );
  }

  async getAttendanceSummary(
    userId: number,
    start: Date,
    end: Date,
  ): Promise<any> {
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    const records = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.user_id, userId),
          sql`${attendance.date} BETWEEN ${startStr} AND ${endStr}`,
        ),
      );

    const presentDays = records.filter(
      (r) => r.status === "حاضر" || r.check_in_time !== null,
    ).length;
    const absentDays = records.filter(
      (r) => r.status === "غائب" && r.check_in_time === null,
    ).length;
    const lateMinutes = records.reduce(
      (sum, r) => sum + (r.late_minutes || 0),
      0,
    );
    const totalWorkHours = records.reduce(
      (sum, r) => sum + (r.work_hours || 0),
      0,
    );
    const overtimeHours = records.reduce(
      (sum, r) => sum + (r.overtime_hours || 0),
      0,
    );
    const earlyLeaveMinutes = records.reduce(
      (sum, r) => sum + (r.early_leave_minutes || 0),
      0,
    );

    return {
      presentDays,
      absentDays,
      lateMinutes,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      earlyLeaveMinutes,
      totalDays: records.length,
    };
  }

  async getAttendanceReport(
    start: Date,
    end: Date,
    filters?: any,
  ): Promise<any[]> {
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    const conditions = [
      sql`${attendance.date} BETWEEN ${startStr} AND ${endStr}`,
    ];

    if (filters?.sectionId) {
      conditions.push(eq(users.section_id, Number(filters.sectionId)));
    }
    if (filters?.roleId) {
      conditions.push(eq(users.role_id, filters.roleId));
    }

    const records = await db
      .select({
        id: attendance.id,
        user_id: attendance.user_id,
        username: users.username,
        display_name: users.display_name,
        display_name_ar: users.display_name_ar,
        role_name: roles.name,
        role_name_ar: roles.name_ar,
        status: attendance.status,
        check_in_time: attendance.check_in_time,
        check_out_time: attendance.check_out_time,
        work_hours: attendance.work_hours,
        overtime_hours: attendance.overtime_hours,
        late_minutes: attendance.late_minutes,
        early_leave_minutes: attendance.early_leave_minutes,
        date: attendance.date,
        notes: attendance.notes,
      })
      .from(attendance)
      .innerJoin(users, eq(attendance.user_id, users.id))
      .leftJoin(roles, eq(users.role_id, roles.id))
      .where(and(...conditions))
      .orderBy(desc(attendance.date));

    return records;
  }

  async getDailyAttendanceStats(date: string): Promise<any> {
    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, "active"));

    const total = totalUsers[0]?.count || 0;

    const attendanceRecords = await db
      .select()
      .from(attendance)
      .where(eq(attendance.date, date));

    const present = attendanceRecords.filter(
      (r) => r.status === "حاضر" || r.check_in_time !== null,
    ).length;
    const onLeave = attendanceRecords.filter(
      (r) => r.status === "إجازة",
    ).length;
    const late = attendanceRecords.filter(
      (r) => (r.late_minutes || 0) > 0,
    ).length;
    const absent = total - present - onLeave;

    return { total, present, absent: absent < 0 ? 0 : absent, onLeave, late };
  }

  async upsertManualAttendance(entries: any[]): Promise<any[]> {
    const results = [];
    for (const entry of entries) {
      const {
        user_id,
        date,
        status,
        check_in_time,
        check_out_time,
        notes,
        created_by,
      } = entry;

      const checkIn =
        check_in_time !== undefined
          ? check_in_time
            ? new Date(check_in_time)
            : null
          : undefined;
      const checkOut =
        check_out_time !== undefined
          ? check_out_time
            ? new Date(check_out_time)
            : null
          : undefined;

      let workHours: number | null = null;
      const lateMinutes = 0;
      const resolvedCheckIn = checkIn !== undefined ? checkIn : null;
      const resolvedCheckOut = checkOut !== undefined ? checkOut : null;
      if (resolvedCheckIn && resolvedCheckOut) {
        workHours =
          Math.round(
            ((resolvedCheckOut.getTime() - resolvedCheckIn.getTime()) /
              3600000) *
              100,
          ) / 100;
      }

      const existing = await db
        .select()
        .from(attendance)
        .where(and(eq(attendance.user_id, user_id), eq(attendance.date, date)))
        .limit(1);

      if (existing.length > 0) {
        const rec = existing[0];
        const finalCheckIn =
          checkIn !== undefined ? checkIn : rec.check_in_time;
        const finalCheckOut =
          checkOut !== undefined ? checkOut : rec.check_out_time;
        let computedWorkHours = rec.work_hours;
        if (finalCheckIn && finalCheckOut) {
          computedWorkHours =
            Math.round(
              ((new Date(finalCheckOut).getTime() -
                new Date(finalCheckIn).getTime()) /
                3600000) *
                100,
            ) / 100;
        }

        const updateData: any = {
          status: status !== undefined ? status : rec.status,
          notes: notes !== undefined ? notes : rec.notes,
          updated_by: created_by,
          updated_at: new Date(),
          work_hours: computedWorkHours,
        };
        if (checkIn !== undefined) updateData.check_in_time = checkIn;
        if (checkOut !== undefined) updateData.check_out_time = checkOut;

        const [updated] = await db
          .update(attendance)
          .set(updateData)
          .where(eq(attendance.id, rec.id))
          .returning();
        results.push(updated);
      } else {
        const [created] = await db
          .insert(attendance)
          .values({
            user_id,
            date,
            status: status || "حاضر",
            check_in_time: checkIn !== undefined ? checkIn : null,
            check_out_time: checkOut !== undefined ? checkOut : null,
            work_hours: workHours,
            late_minutes: lateMinutes,
            notes,
            created_by,
          })
          .returning();
        results.push(created);
      }
    }
    return results;
  }

  async getDailyAttendanceStatus(userId: number, date: string): Promise<any> {
    const records = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.user_id, userId), eq(attendance.date, date)))
      .orderBy(desc(attendance.created_at));

    if (records.length === 0) {
      return {
        status: "غائب",
        currentStatus: "غائب",
        hasCheckedIn: false,
        hasStartedLunch: false,
        hasEndedLunch: false,
        hasCheckedOut: false,
      };
    }

    const latest = records[0];
    const hasCheckedIn = records.some((r) => r.status === "حاضر");
    const hasStartedLunch = records.some((r) => r.status === "في الاستراحة");
    const hasEndedLunch = records.some((r) => r.status === "يعمل");
    const hasCheckedOut = records.some((r) => r.status === "مغادر");

    return {
      status: latest.status,
      currentStatus: latest.status,
      hasCheckedIn,
      hasStartedLunch,
      hasEndedLunch,
      hasCheckedOut,
      check_in_time:
        records.find((r) => r.status === "حاضر")?.check_in_time ||
        latest.check_in_time,
      check_out_time:
        records.find((r) => r.status === "مغادر")?.check_out_time ||
        latest.check_out_time,
      lunch_start_time:
        records.find((r) => r.status === "في الاستراحة")?.lunch_start_time ||
        latest.lunch_start_time,
      lunch_end_time:
        records.find((r) => r.status === "يعمل")?.lunch_end_time ||
        latest.lunch_end_time,
      work_hours: latest.work_hours,
      records: records,
    };
  }

  // نظرة يومية على حضور كل الموظفين: دمج كل صفوف اليوم في سجل واحد لكل مستخدم
  // (التسجيل الذاتي ينشئ صفاً منفصلاً لكل إجراء، لذا يجب التجميع وليس أخذ صف واحد)
  async getDailyAttendanceOverview(date: string): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const allUsers = await db
          .select({
            id: users.id,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
            section_id: users.section_id,
            role_name: roles.name,
            role_name_ar: roles.name_ar,
          })
          .from(users)
          .leftJoin(roles, eq(users.role_id, roles.id))
          .where(eq(users.status, "active"))
          .orderBy(users.display_name);

        const attRows = await db
          .select()
          .from(attendance)
          .where(eq(attendance.date, date));

        const rowsByUser = new Map<number, any[]>();
        for (const r of attRows as any[]) {
          const list = rowsByUser.get(r.user_id) ?? [];
          list.push(r);
          rowsByUser.set(r.user_id, list);
        }

        const sectionsMap = await this.getSectionsMap();

        const minTime = (vals: (Date | null)[]) => {
          const ts = vals.filter((v): v is Date => v != null);
          if (!ts.length) return null;
          return ts.reduce((a, b) => (a.getTime() <= b.getTime() ? a : b));
        };
        const maxTime = (vals: (Date | null)[]) => {
          const ts = vals.filter((v): v is Date => v != null);
          if (!ts.length) return null;
          return ts.reduce((a, b) => (a.getTime() >= b.getTime() ? a : b));
        };

        return allUsers.map((u) => {
          const rows = rowsByUser.get(u.id) ?? [];
          const sec =
            u.section_id != null
              ? sectionsMap.get(String(u.section_id))
              : undefined;
          const base = {
            user_id: u.id,
            username: u.username,
            display_name: u.display_name,
            display_name_ar: u.display_name_ar,
            role_name: u.role_name,
            role_name_ar: u.role_name_ar,
            section_name: sec?.name ?? null,
            section_name_ar: sec?.name_ar ?? null,
            date,
          };
          if (!rows.length) {
            return {
              ...base,
              current_status: "غائب",
              check_in_time: null,
              break_start_time: null,
              break_end_time: null,
              check_out_time: null,
            };
          }
          // آخر صف حسب وقت الإنشاء يمثل الحالة الحالية
          const latest = rows.reduce((a, b) => {
            const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tb >= ta ? b : a;
          });
          return {
            ...base,
            current_status: latest.status || "حاضر",
            check_in_time: minTime(rows.map((r) => r.check_in_time)),
            break_start_time: minTime(
              rows.flatMap((r) => [r.lunch_start_time, r.break_start_time]),
            ),
            break_end_time: maxTime(
              rows.flatMap((r) => [r.lunch_end_time, r.break_end_time]),
            ),
            check_out_time: maxTime(rows.map((r) => r.check_out_time)),
          };
        });
      },
      "getDailyAttendanceOverview",
      "جلب الحضور اليومي لكل الموظفين",
    );
  }

  async updateDailyAttendance(
    userId: number,
    date: string,
    patch: {
      check_in_time?: Date | null;
      break_start_time?: Date | null;
      break_end_time?: Date | null;
      check_out_time?: Date | null;
      status?: string;
    },
    updatedBy?: number,
  ): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.transaction(async (tx) => {
          const rows = await tx
            .select()
            .from(attendance)
            .where(
              and(eq(attendance.user_id, userId), eq(attendance.date, date)),
            )
            .orderBy(attendance.created_at);

          if (!rows.length) {
            // لا توجد سجلات لهذا اليوم — أنشئ سجلاً واحداً بالقيم المعدّلة
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
          const last = rows[rows.length - 1] as any;
          const now = new Date();

          // امسح الحقول المعدّلة من كل السجلات ثم ثبّت القيمة على سجل واحد
          // (العرض يجمع بـ min/max عبر الصفوف فيجب ألا تبقى قيمة قديمة منافسة)
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

          // القيم الجديدة: بداية اليوم على أول سجل، نهايته على آخر سجل
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
          if (patch.status) lastSet.status = patch.status;

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
      },
      "updateDailyAttendance",
      `تعديل حضور المستخدم ${userId} ليوم ${date}`,
    );
  }

  async createAttendanceWithdrawal(
    data: InsertAttendanceWithdrawal,
  ): Promise<AttendanceWithdrawal> {
    return withDatabaseErrorHandling(
      async () => {
        // Atomic dedupe: the unique partial index
        // `uniq_attendance_open_withdrawal` (attendance_id WHERE ended_at IS
        // NULL) prevents two open rows per attendance. ON CONFLICT DO
        // NOTHING + a follow-up SELECT lets concurrent `start` requests
        // race safely: only one row is inserted; the loser returns the
        // existing open row instead of crashing with a 500.
        // NOTE: drizzle's onConflictDoNothing uses `where` (not
        // `targetWhere`) for the partial-index predicate. Passing
        // `targetWhere` silently dropped the `WHERE ended_at IS NULL`
        // clause, so Postgres couldn't match the partial unique index
        // `uniq_attendance_open_withdrawal` and the insert blew up with
        // "no unique or exclusion constraint matching the ON CONFLICT
        // specification".
        const inserted = await db
          .insert(attendance_withdrawals)
          .values(data)
          .onConflictDoNothing({
            target: attendance_withdrawals.attendance_id,
            where: isNull(attendance_withdrawals.ended_at),
          })
          .returning();
        let created: AttendanceWithdrawal | undefined = inserted[0];
        if (!created) {
          const [existing] = await db
            .select()
            .from(attendance_withdrawals)
            .where(
              and(
                eq(attendance_withdrawals.attendance_id, data.attendance_id),
                isNull(attendance_withdrawals.ended_at),
              ),
            )
            .limit(1);
          if (!existing) {
            throw new Error("Failed to open withdrawal interval");
          }
          created = existing;
        }
        if (created.duration_minutes && created.duration_minutes > 0) {
          await db
            .update(attendance)
            .set({
              total_withdrawn_minutes: sql`COALESCE(${attendance.total_withdrawn_minutes}, 0) + ${created.duration_minutes}`,
              updated_at: new Date(),
            })
            .where(eq(attendance.id, created.attendance_id));
        }
        return created;
      },
      "createAttendanceWithdrawal",
      "تسجيل فترة انسحاب",
    );
  }

  async getOpenAttendanceWithdrawal(
    attendanceId: number,
  ): Promise<AttendanceWithdrawal | null> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db
          .select()
          .from(attendance_withdrawals)
          .where(
            and(
              eq(attendance_withdrawals.attendance_id, attendanceId),
              isNull(attendance_withdrawals.ended_at),
            ),
          )
          .limit(1);
        return row ?? null;
      },
      "getOpenAttendanceWithdrawal",
      "جلب فترة انسحاب مفتوحة",
    );
  }

  async getOpenAttendanceWithdrawalForUser(
    userId: number,
    date: string,
  ): Promise<AttendanceWithdrawal | null> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db
          .select()
          .from(attendance_withdrawals)
          .where(
            and(
              eq(attendance_withdrawals.user_id, userId),
              eq(attendance_withdrawals.date, date),
              isNull(attendance_withdrawals.ended_at),
            ),
          )
          .orderBy(desc(attendance_withdrawals.started_at))
          .limit(1);
        return row ?? null;
      },
      "getOpenAttendanceWithdrawalForUser",
      "جلب فترة انسحاب مفتوحة للمستخدم",
    );
  }

  async finalizeAttendanceWithdrawal(
    withdrawalId: number,
    endedAt: Date,
    durationMinutes: number,
  ): Promise<AttendanceWithdrawal | null> {
    return withDatabaseErrorHandling(
      async () => {
        // Atomic close: only one writer can flip `ended_at` from NULL.
        // The `ended_at IS NULL` predicate makes this a CAS — concurrent
        // `end` calls return null for losers, so we never double-count
        // minutes in `total_withdrawn_minutes`.
        const [updated] = await db
          .update(attendance_withdrawals)
          .set({
            ended_at: endedAt,
            duration_minutes: durationMinutes,
          })
          .where(
            and(
              eq(attendance_withdrawals.id, withdrawalId),
              isNull(attendance_withdrawals.ended_at),
            ),
          )
          .returning();
        if (!updated) return null;
        if (durationMinutes > 0) {
          await db
            .update(attendance)
            .set({
              total_withdrawn_minutes: sql`COALESCE(${attendance.total_withdrawn_minutes}, 0) + ${durationMinutes}`,
              updated_at: new Date(),
            })
            .where(eq(attendance.id, updated.attendance_id));
        }
        return updated;
      },
      "finalizeAttendanceWithdrawal",
      "إنهاء فترة انسحاب",
    );
  }

  async getAttendanceWithdrawalsForDay(
    userId: number,
    date: string,
  ): Promise<{
    withdrawals: AttendanceWithdrawal[];
    totalMinutes: number;
  }> {
    return withDatabaseErrorHandling(
      async () => {
        const withdrawals = await db
          .select()
          .from(attendance_withdrawals)
          .where(
            and(
              eq(attendance_withdrawals.user_id, userId),
              eq(attendance_withdrawals.date, date),
            ),
          )
          .orderBy(desc(attendance_withdrawals.started_at));
        const totalMinutes = withdrawals.reduce(
          (sum, w) => sum + (w.duration_minutes || 0),
          0,
        );
        return { withdrawals, totalMinutes };
      },
      "getAttendanceWithdrawalsForDay",
      "جلب فترات الانسحاب",
    );
  }

  async getAttendanceWithdrawalsInRange(
    startDate: string,
    endDate: string,
    userId?: number,
  ): Promise<{
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
  }> {
    return withDatabaseErrorHandling(
      async () => {
        const conditions = [
          sql`${attendance_withdrawals.date} >= ${startDate}`,
          sql`${attendance_withdrawals.date} <= ${endDate}`,
        ];
        if (userId !== undefined) {
          conditions.push(eq(attendance_withdrawals.user_id, userId));
        }

        const rows = await db
          .select({
            id: attendance_withdrawals.id,
            attendance_id: attendance_withdrawals.attendance_id,
            user_id: attendance_withdrawals.user_id,
            date: attendance_withdrawals.date,
            started_at: attendance_withdrawals.started_at,
            ended_at: attendance_withdrawals.ended_at,
            duration_minutes: attendance_withdrawals.duration_minutes,
            reason: attendance_withdrawals.reason,
            previous_status: attendance_withdrawals.previous_status,
            created_at: attendance_withdrawals.created_at,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
          })
          .from(attendance_withdrawals)
          .leftJoin(users, eq(users.id, attendance_withdrawals.user_id))
          .where(and(...conditions))
          .orderBy(desc(attendance_withdrawals.started_at));

        const map = new Map<
          number,
          {
            user_id: number;
            username: string | null;
            display_name: string | null;
            display_name_ar: string | null;
            total_minutes: number;
            incident_count: number;
            dailyMinutes: Map<string, number>;
          }
        >();
        for (const r of rows) {
          let entry = map.get(r.user_id);
          if (!entry) {
            entry = {
              user_id: r.user_id,
              username: r.username ?? null,
              display_name: r.display_name ?? null,
              display_name_ar: r.display_name_ar ?? null,
              total_minutes: 0,
              incident_count: 0,
              dailyMinutes: new Map<string, number>(),
            };
            map.set(r.user_id, entry);
          }
          const mins = r.duration_minutes || 0;
          entry.total_minutes += mins;
          entry.incident_count += 1;
          const dateKey = String(r.date);
          entry.dailyMinutes.set(
            dateKey,
            (entry.dailyMinutes.get(dateKey) || 0) + mins,
          );
        }

        const summary = Array.from(map.values())
          .map((e) => ({
            user_id: e.user_id,
            username: e.username,
            display_name: e.display_name,
            display_name_ar: e.display_name_ar,
            total_minutes: e.total_minutes,
            incident_count: e.incident_count,
            violation_days: Array.from(e.dailyMinutes.values()).filter(
              (m) => m > 60,
            ).length,
          }))
          .sort((a, b) => b.total_minutes - a.total_minutes);

        return { withdrawals: rows as any, summary };
      },
      "getAttendanceWithdrawalsInRange",
      "جلب فترات الانسحاب خلال الفترة",
    );
  }

  // ===== Shift assignments (monthly day/night scheduling) =====
  async getShiftAssignmentsByPeriod(
    year: number,
    month: number,
  ): Promise<ShiftAssignment[]> {
    return withDatabaseErrorHandling(
      async () =>
        await db
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

  async getShiftAssignmentForUserMonth(
    userId: number,
    year: number,
    month: number,
  ): Promise<ShiftAssignment | null> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db
          .select()
          .from(shift_assignments)
          .where(
            and(
              eq(shift_assignments.user_id, userId),
              eq(shift_assignments.year, year),
              eq(shift_assignments.month, month),
            ),
          )
          .limit(1);
        return row ?? null;
      },
      "getShiftAssignmentForUserMonth",
      "جلب وردية الموظف للشهر",
    );
  }

  async getShiftAssignmentsForUser(
    userId: number,
  ): Promise<ShiftAssignment[]> {
    return withDatabaseErrorHandling(
      async () =>
        await db
          .select()
          .from(shift_assignments)
          .where(eq(shift_assignments.user_id, userId)),
      "getShiftAssignmentsForUser",
      "جلب ورديات الموظف",
    );
  }

  async upsertShiftAssignments(
    entries: InsertShiftAssignment[],
    createdBy: number | null,
  ): Promise<ShiftAssignment[]> {
    return withDatabaseErrorHandling(
      async () => {
        if (!entries.length) return [];
        const values = entries.map((e) => ({
          user_id: e.user_id,
          year: e.year,
          month: e.month,
          shift: e.shift,
          notes: e.notes ?? null,
          created_by: createdBy,
        }));
        return await db
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
              notes: sql`excluded.notes`,
              updated_at: sql`now()`,
            },
          })
          .returning();
      },
      "upsertShiftAssignments",
      "حفظ جدول الورديات",
    );
  }

  // حفظ جدول الورديات لشهر محدد بشكل موثوق: حذف من أُلغيت جدولتهم
  // وإضافة/تحديث الباقين داخل معاملة واحدة مع قفل لمنع التعارض.
  async saveShiftRoster(
    year: number,
    month: number,
    upsertEntries: InsertShiftAssignment[],
    deleteUserIds: number[],
    createdBy: number | null,
  ): Promise<ShiftAssignment[]> {
    return withDatabaseErrorHandling(
      async () => {
        return await db.transaction(async (tx) => {
          // قفل استشاري على مستوى الفترة لمنع تعديلين متزامنين لنفس الشهر.
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(424242, ${year * 100 + month})`,
          );

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
            const values = upsertEntries.map((e) => ({
              user_id: e.user_id,
              year,
              month,
              shift: e.shift,
              notes: e.notes ?? null,
              created_by: createdBy,
            }));
            await tx
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
                  notes: sql`excluded.notes`,
                  updated_at: sql`now()`,
                },
              });
          }

          return await tx
            .select()
            .from(shift_assignments)
            .where(
              and(
                eq(shift_assignments.year, year),
                eq(shift_assignments.month, month),
              ),
            );
        });
      },
      "saveShiftRoster",
      "حفظ جدول الورديات",
    );
  }

  // ===== HR module: directory, employee file, computed attendance =====
  async getHREmployees(): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const { year, month } = factoryNowParts();

        const rows = await db
          .select({
            id: users.id,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
            full_name: users.full_name,
            phone: users.phone,
            email: users.email,
            status: users.status,
            role_id: users.role_id,
            section_id: users.section_id,
            created_at: users.created_at,
            role_name: roles.name,
            role_name_ar: roles.name_ar,
          })
          .from(users)
          .leftJoin(roles, eq(users.role_id, roles.id))
          .orderBy(users.display_name);

        const sectionsMap = await this.getSectionsMap();
        const assignments = await this.getShiftAssignmentsByPeriod(
          year,
          month,
        );
        const shiftByUser = new Map<number, string>();
        for (const a of assignments) shiftByUser.set(a.user_id, a.shift);

        return rows.map((r) => {
          const sec =
            r.section_id != null
              ? sectionsMap.get(String(r.section_id))
              : undefined;
          return {
            ...r,
            section_name: sec?.name ?? null,
            section_name_ar: sec?.name_ar ?? null,
            current_shift: shiftByUser.get(r.id) ?? null,
            is_active: r.status === "active",
          };
        });
      },
      "getHREmployees",
      "جلب قائمة الموظفين",
    );
  }

  async getEmployeeFile(userId: number): Promise<any | null> {
    return withDatabaseErrorHandling(
      async () => {
        const [profile] = await db
          .select({
            id: users.id,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
            full_name: users.full_name,
            phone: users.phone,
            email: users.email,
            status: users.status,
            role_id: users.role_id,
            section_id: users.section_id,
            profile_image_url: users.profile_image_url,
            created_at: users.created_at,
            role_name: roles.name,
            role_name_ar: roles.name_ar,
          })
          .from(users)
          .leftJoin(roles, eq(users.role_id, roles.id))
          .where(eq(users.id, userId))
          .limit(1);

        if (!profile) return null;

        const sectionsMap = await this.getSectionsMap();
        const sec =
          profile.section_id != null
            ? sectionsMap.get(String(profile.section_id))
            : undefined;
        const profileWithSection = {
          ...profile,
          section_name: sec?.name ?? null,
          section_name_ar: sec?.name_ar ?? null,
        };

        const now = new Date();
        const { year, month, dateStr: todayStr } = factoryNowParts(now);
        const current = await this.getShiftAssignmentForUserMonth(
          userId,
          year,
          month,
        );

        // مدة الخدمة محسوبة من تاريخ إضافة الموظف للنظام (لا يوجد حقل تاريخ تعيين منفصل).
        const serviceStart = profile.created_at
          ? new Date(profile.created_at)
          : null;
        const serviceDays = serviceStart
          ? Math.max(
              0,
              Math.floor(
                (now.getTime() - serviceStart.getTime()) / 86400000,
              ),
            )
          : null;

        // تاريخ الإجازة القادمة: أقرب إجازة معتمدة قادمة (إن وجدت).
        const [nextLeave] = await db
          .select({ start_date: leave_requests.start_date })
          .from(leave_requests)
          .where(
            and(
              eq(leave_requests.employee_id, Number(userId)),
              eq(leave_requests.hr_status, "approved"),
              sql`${leave_requests.start_date} >= ${todayStr}`,
            ),
          )
          .orderBy(leave_requests.start_date)
          .limit(1);

        return {
          ...profileWithSection,
          is_active: profileWithSection.status === "active",
          current_shift: current ? current.shift : null,
          service_start_date: serviceStart ? serviceStart.toISOString() : null,
          service_days: serviceDays,
          next_leave_date: nextLeave?.start_date ?? null,
        };
      },
      "getEmployeeFile",
      "جلب ملف الموظف",
    );
  }

  private addDaysStr(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + days));
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }

  private buildShiftMap(assignments: ShiftAssignment[]): Map<string, ShiftType> {
    const map = new Map<string, ShiftType>();
    for (const a of assignments) {
      if (isShiftType(a.shift)) map.set(`${a.year}-${a.month}`, a.shift);
    }
    return map;
  }

  // users.section_id (integer) و sections.id (varchar) غير متطابقين في النوع،
  // لذلك نحل اسم القسم عبر خريطة مفتاحها نص المعرّف بدل ربط SQL مباشر.
  private async getSectionsMap(): Promise<
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
      map.set(String(s.id), { name: s.name, name_ar: s.name_ar });
    }
    return map;
  }

  async getComputedAttendance(
    userId: number,
    from: string,
    to: string,
  ): Promise<EmployeeAttendanceResult> {
    return withDatabaseErrorHandling(
      async () => {
        const fetchFrom = this.addDaysStr(from, -1);
        const fetchTo = this.addDaysStr(to, 1);
        const rows = await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.user_id, userId),
              sql`${attendance.date} BETWEEN ${fetchFrom} AND ${fetchTo}`,
            ),
          );
        const assignments = await this.getShiftAssignmentsForUser(userId);
        const shiftMap = this.buildShiftMap(assignments);
        return computeEmployeeAttendance(rows as any, shiftMap, from, to);
      },
      "getComputedAttendance",
      "حساب حضور الموظف",
    );
  }

  async getAttendanceReportByRange(
    from: string,
    to: string,
    sectionId?: number,
  ): Promise<any[]> {
    return withDatabaseErrorHandling(
      async () => {
        const fetchFrom = this.addDaysStr(from, -1);
        const fetchTo = this.addDaysStr(to, 1);

        const empRows = await db
          .select({
            id: users.id,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
            full_name: users.full_name,
            section_id: users.section_id,
          })
          .from(users)
          .where(sectionId ? eq(users.section_id, sectionId) : sql`true`)
          .orderBy(users.display_name);

        const userIds = empRows.map((e) => e.id);
        if (!userIds.length) return [];

        const sectionsMap = await this.getSectionsMap();

        const attRows = await db
          .select()
          .from(attendance)
          .where(
            and(
              inArray(attendance.user_id, userIds),
              sql`${attendance.date} BETWEEN ${fetchFrom} AND ${fetchTo}`,
            ),
          );
        const rowsByUser = new Map<number, any[]>();
        for (const r of attRows as any[]) {
          const list = rowsByUser.get(r.user_id) ?? [];
          list.push(r);
          rowsByUser.set(r.user_id, list);
        }

        const allAssignments = await db
          .select()
          .from(shift_assignments)
          .where(inArray(shift_assignments.user_id, userIds));
        const assignByUser = new Map<number, ShiftAssignment[]>();
        for (const a of allAssignments) {
          const list = assignByUser.get(a.user_id) ?? [];
          list.push(a);
          assignByUser.set(a.user_id, list);
        }

        return empRows.map((emp) => {
          const shiftMap = this.buildShiftMap(assignByUser.get(emp.id) ?? []);
          const result = computeEmployeeAttendance(
            rowsByUser.get(emp.id) ?? [],
            shiftMap,
            from,
            to,
          );
          const sec =
            emp.section_id != null
              ? sectionsMap.get(String(emp.section_id))
              : undefined;
          return {
            employee: {
              ...emp,
              section_name: sec?.name ?? null,
              section_name_ar: sec?.name_ar ?? null,
            },
            totals: result.totals,
          };
        });
      },
      "getAttendanceReportByRange",
      "إعداد تقرير الحضور",
    );
  }

  // ===== HR Phase 2: violations / rewards / custody / traits / training / wages =====

  // المخالفات لكل موظف
  async getViolationsByEmployee(employeeId: number): Promise<Violation[]> {
    return withDatabaseErrorHandling(
      async () =>
        await db
          .select()
          .from(violations)
          .where(eq(violations.employee_id, employeeId))
          .orderBy(desc(violations.date)),
      "getViolationsByEmployee",
      "جلب مخالفات الموظف",
    );
  }

  // المكافآت
  async getRewardsByEmployee(employeeId: number): Promise<Reward[]> {
    return withDatabaseErrorHandling(
      async () =>
        await db
          .select()
          .from(rewards)
          .where(eq(rewards.employee_id, employeeId))
          .orderBy(desc(rewards.date)),
      "getRewardsByEmployee",
      "جلب مكافآت الموظف",
    );
  }

  async createReward(data: InsertReward): Promise<Reward> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db.insert(rewards).values(data as any).returning();
        return row;
      },
      "createReward",
      "إضافة مكافأة",
    );
  }

  async updateReward(
    id: number,
    data: Partial<InsertReward>,
  ): Promise<Reward> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db
          .update(rewards)
          .set(data as any)
          .where(eq(rewards.id, id))
          .returning();
        return row;
      },
      "updateReward",
      "تحديث مكافأة",
    );
  }

  async deleteReward(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.delete(rewards).where(eq(rewards.id, id));
      },
      "deleteReward",
      "حذف مكافأة",
    );
  }

  // العهد والأصول
  async getCustodyByEmployee(employeeId: number): Promise<EmployeeCustody[]> {
    return withDatabaseErrorHandling(
      async () =>
        await db
          .select()
          .from(employee_custody)
          .where(eq(employee_custody.employee_id, employeeId))
          .orderBy(desc(employee_custody.handover_date)),
      "getCustodyByEmployee",
      "جلب عهد الموظف",
    );
  }

  async createCustody(
    data: InsertEmployeeCustody,
  ): Promise<EmployeeCustody> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db
          .insert(employee_custody)
          .values(data as any)
          .returning();
        return row;
      },
      "createCustody",
      "إضافة عهدة",
    );
  }

  async updateCustody(
    id: number,
    data: Partial<InsertEmployeeCustody>,
  ): Promise<EmployeeCustody> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db
          .update(employee_custody)
          .set(data as any)
          .where(eq(employee_custody.id, id))
          .returning();
        return row;
      },
      "updateCustody",
      "تحديث عهدة",
    );
  }

  async deleteCustody(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.delete(employee_custody).where(eq(employee_custody.id, id));
      },
      "deleteCustody",
      "حذف عهدة",
    );
  }

  // السمات الشخصية
  async getTraitsByEmployee(employeeId: number): Promise<EmployeeTrait[]> {
    return withDatabaseErrorHandling(
      async () =>
        await db
          .select()
          .from(employee_traits)
          .where(eq(employee_traits.employee_id, employeeId))
          .orderBy(desc(employee_traits.id)),
      "getTraitsByEmployee",
      "جلب سمات الموظف",
    );
  }

  async createTrait(data: InsertEmployeeTrait): Promise<EmployeeTrait> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db
          .insert(employee_traits)
          .values(data as any)
          .returning();
        return row;
      },
      "createTrait",
      "إضافة سمة",
    );
  }

  async updateTrait(
    id: number,
    data: Partial<InsertEmployeeTrait>,
  ): Promise<EmployeeTrait> {
    return withDatabaseErrorHandling(
      async () => {
        const [row] = await db
          .update(employee_traits)
          .set(data as any)
          .where(eq(employee_traits.id, id))
          .returning();
        return row;
      },
      "updateTrait",
      "تحديث سمة",
    );
  }

  async deleteTrait(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.delete(employee_traits).where(eq(employee_traits.id, id));
      },
      "deleteTrait",
      "حذف سمة",
    );
  }

  // التدريبات لكل موظف: التحاقات (مع تفاصيل البرنامج) + سجلات تدريب ميدانية
  async getTrainingByEmployee(employeeId: number): Promise<{
    enrollments: any[];
    records: any[];
  }> {
    return withDatabaseErrorHandling(
      async () => {
        const enrollments = await db
          .select({
            id: training_enrollments.id,
            program_id: training_enrollments.program_id,
            status: training_enrollments.completion_status,
            attendance_status: training_enrollments.attendance_status,
            enrolled_date: training_enrollments.enrolled_date,
            training_date: training_enrollments.training_date,
            program_title: training_programs.title,
            program_title_ar: training_programs.title_ar,
          })
          .from(training_enrollments)
          .leftJoin(
            training_programs,
            eq(training_enrollments.program_id, training_programs.id),
          )
          .where(eq(training_enrollments.employee_id, employeeId))
          .orderBy(desc(training_enrollments.id));

        const records = await db
          .select()
          .from(training_records)
          .where(eq(training_records.employee_id, employeeId))
          .orderBy(desc(training_records.date));

        return { enrollments, records };
      },
      "getTrainingByEmployee",
      "جلب تدريبات الموظف",
    );
  }

  async deleteTrainingRecord(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.delete(training_records).where(eq(training_records.id, id));
      },
      "deleteTrainingRecord",
      "حذف سجل تدريب",
    );
  }

  // الأجور: سجلات شهرية محسوبة من محرك الحضور
  async getWageRecordsByEmployee(employeeId: number): Promise<WageRecord[]> {
    return withDatabaseErrorHandling(
      async () =>
        await db
          .select()
          .from(wage_records)
          .where(eq(wage_records.employee_id, employeeId))
          .orderBy(desc(wage_records.year), desc(wage_records.month)),
      "getWageRecordsByEmployee",
      "جلب سجلات الأجور",
    );
  }

  async deleteWageRecord(id: number): Promise<void> {
    return withDatabaseErrorHandling(
      async () => {
        await db.delete(wage_records).where(eq(wage_records.id, id));
      },
      "deleteWageRecord",
      "حذف سجل الأجر",
    );
  }

  // يحسب أجر موظف لشهر محدد من محرك الحضور + المكافآت + جزاءات المخالفات،
  // ثم يحفظ (upsert) السجل الناتج. الأجر يُبنى على الساعات المجدولة (8/يوم)
  // مع خصم الغياب/التأخير/المغادرة المبكرة/الانسحاب، وإضافة الإضافي الفعلي.
  async computeAndSaveWage(params: {
    employeeId: number;
    year: number;
    month: number;
    baseHourlyRate: number;
    overtimeMultiplier?: number;
    notes?: string | null;
    computedBy?: number | null;
  }): Promise<{ record: WageRecord; breakdown: any }> {
    return withDatabaseErrorHandling(
      async () => {
        const {
          employeeId,
          year,
          month,
          baseHourlyRate,
          overtimeMultiplier = 1.5,
          notes = null,
          computedBy = null,
        } = params;

        const from = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const to = `${year}-${String(month).padStart(2, "0")}-${String(
          lastDay,
        ).padStart(2, "0")}`;

        const attendanceResult = await this.getComputedAttendance(
          employeeId,
          from,
          to,
        );
        const t = attendanceResult.totals;

        const rate = baseHourlyRate;
        const baseHours = t.scheduledDays * BASE_WORK_HOURS;
        const basicPay = baseHours * rate;

        const overtimeHours = t.totalOvertimeHours;
        const overtimePay = overtimeHours * rate * overtimeMultiplier;

        const absenceDeduction = t.absentDays * BASE_WORK_HOURS * rate;
        // أيام الحضور بدون تسجيل انصراف (غير مكتملة): لا يمكن التحقق من ساعات
        // العمل الفعلية، لذا تُعامل كغير مدفوعة لتجنّب صرف أجر يوم كامل بالخطأ.
        // عند تصحيح وقت الانصراف وإعادة الحساب يُحتسب اليوم بشكل صحيح.
        const incompleteDeduction = t.incompleteDays * BASE_WORK_HOURS * rate;
        const lateDeduction = (t.totalLateMinutes / 60) * rate;
        const earlyLeaveDeduction = (t.totalEarlyLeaveMinutes / 60) * rate;
        const withdrawalDeduction = (t.totalWithdrawnMinutes / 60) * rate;
        const deductionsAmount =
          absenceDeduction +
          incompleteDeduction +
          lateDeduction +
          earlyLeaveDeduction +
          withdrawalDeduction;

        // المكافآت المعتمدة خلال الشهر
        const rewardRows = await db
          .select({ amount: rewards.amount })
          .from(rewards)
          .where(
            and(
              eq(rewards.employee_id, employeeId),
              eq(rewards.status, "approved"),
              sql`${rewards.date} BETWEEN ${from} AND ${to}`,
            ),
          );
        const rewardsAmount = rewardRows.reduce(
          (sum, r) => sum + Number(r.amount || 0),
          0,
        );

        // جزاءات المخالفات (غير الملغاة) خلال الشهر
        const penaltyRows = await db
          .select({ penalty_amount: violations.penalty_amount })
          .from(violations)
          .where(
            and(
              eq(violations.employee_id, employeeId),
              sql`${violations.status} <> 'cancelled'`,
              sql`${violations.date} BETWEEN ${from} AND ${to}`,
            ),
          );
        const disciplinaryPenalties = penaltyRows.reduce(
          (sum, r) => sum + Number(r.penalty_amount || 0),
          0,
        );

        // خصومات مخالفات العمل (غير المُعفاة) خلال الشهر
        const workViolationRows = await db
          .select({ deduction_amount: work_violations.deduction_amount })
          .from(work_violations)
          .where(
            and(
              eq(work_violations.employee_id, employeeId),
              eq(work_violations.waived, false),
              sql`${work_violations.occurred_at}::date BETWEEN ${from} AND ${to}`,
            ),
          );
        const workViolationPenalties = workViolationRows.reduce(
          (sum, r) => sum + Number(r.deduction_amount || 0),
          0,
        );
        const penaltiesAmount = disciplinaryPenalties + workViolationPenalties;

        const netPay =
          basicPay +
          overtimePay -
          deductionsAmount -
          penaltiesAmount +
          rewardsAmount;

        const round2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

        const values = {
          employee_id: employeeId,
          year,
          month,
          base_hourly_rate: round2(rate),
          overtime_multiplier: round2(overtimeMultiplier),
          base_hours: round2(baseHours),
          basic_pay: round2(basicPay),
          overtime_hours: round2(overtimeHours),
          overtime_pay: round2(overtimePay),
          deductions_amount: round2(deductionsAmount),
          rewards_amount: round2(rewardsAmount),
          penalties_amount: round2(penaltiesAmount),
          net_pay: round2(netPay),
          notes,
          computed_by: computedBy,
        };

        const [record] = await db
          .insert(wage_records)
          .values(values as any)
          .onConflictDoUpdate({
            target: [
              wage_records.employee_id,
              wage_records.year,
              wage_records.month,
            ],
            set: {
              base_hourly_rate: sql`excluded.base_hourly_rate`,
              overtime_multiplier: sql`excluded.overtime_multiplier`,
              base_hours: sql`excluded.base_hours`,
              basic_pay: sql`excluded.basic_pay`,
              overtime_hours: sql`excluded.overtime_hours`,
              overtime_pay: sql`excluded.overtime_pay`,
              deductions_amount: sql`excluded.deductions_amount`,
              rewards_amount: sql`excluded.rewards_amount`,
              penalties_amount: sql`excluded.penalties_amount`,
              net_pay: sql`excluded.net_pay`,
              notes: sql`excluded.notes`,
              computed_by: sql`excluded.computed_by`,
              updated_at: sql`now()`,
            },
          })
          .returning();

        const breakdown = {
          totals: t,
          absenceDeduction: Number(round2(absenceDeduction)),
          incompleteDeduction: Number(round2(incompleteDeduction)),
          lateDeduction: Number(round2(lateDeduction)),
          earlyLeaveDeduction: Number(round2(earlyLeaveDeduction)),
          withdrawalDeduction: Number(round2(withdrawalDeduction)),
        };

        return { record, breakdown };
      },
      "computeAndSaveWage",
      "حساب وحفظ أجر الموظف",
    );
  }

  async getAllWaste(): Promise<any[]> {
    return await db.select().from(waste).orderBy(desc(waste.id));
  }

  async createWaste(data: any): Promise<any> {
    const [w] = await db.insert(waste).values(data).returning();
    return w;
  }

  async getAllSections(): Promise<Section[]> {
    return await db.select().from(sections).orderBy(sections.name);
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

  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory).orderBy(inventory.id);
  }

  async updateInventory(
    id: number,
    updates: Partial<Inventory>,
  ): Promise<Inventory> {
    const [updated] = await db
      .update(inventory)
      .set(updates)
      .where(eq(inventory.id, id))
      .returning();
    return updated;
  }

  async createInventoryMovement(
    movement: InsertInventoryMovement,
  ): Promise<InventoryMovement> {
    const [m] = await db
      .insert(inventory_movements)
      .values(movement)
      .returning();
    return m;
  }

  async getInventoryMovements(itemId?: number): Promise<any[]> {
    const query = db
      .select({
        id: inventory_movements.id,
        inventory_id: inventory_movements.inventory_id,
        movement_type: inventory_movements.movement_type,
        quantity: inventory_movements.quantity,
        reference_number: inventory_movements.reference_number,
        reference_type: inventory_movements.reference_type,
        notes: inventory_movements.notes,
        created_by: inventory_movements.created_by,
        created_at: inventory_movements.created_at,
        item_name: items.name,
        item_name_ar: items.name_ar,
        item_code: items.id,
        user_name: users.display_name_ar,
      })
      .from(inventory_movements)
      .leftJoin(inventory, eq(inventory_movements.inventory_id, inventory.id))
      .leftJoin(items, eq(inventory.item_id, items.id))
      .leftJoin(users, eq(inventory_movements.created_by, users.id))
      .orderBy(desc(inventory_movements.created_at));

    if (itemId) {
      return await query.where(eq(inventory_movements.inventory_id, itemId));
    }
    return await query;
  }

  async getAllWarehouseReceipts(): Promise<WarehouseReceipt[]> {
    return await db
      .select()
      .from(warehouse_receipts)
      .orderBy(desc(warehouse_receipts.id));
  }

  async createWarehouseReceipt(
    data: InsertWarehouseReceipt,
  ): Promise<WarehouseReceipt> {
    const [r] = await db
      .insert(warehouse_receipts)
      .values(data as any)
      .returning();
    return r;
  }

  async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    return await db
      .select()
      .from(training_programs)
      .orderBy(desc(training_programs.id));
  }

  async createTrainingProgram(
    data: InsertTrainingProgram,
  ): Promise<TrainingProgram> {
    const [p] = await db.insert(training_programs).values(data).returning();
    return p;
  }

  async getTrainingProgramById(
    id: number,
  ): Promise<TrainingProgram | undefined> {
    const [p] = await db
      .select()
      .from(training_programs)
      .where(eq(training_programs.id, id));
    return p;
  }

  async getTrainingMaterials(programId?: number): Promise<TrainingMaterial[]> {
    if (programId) {
      return await db
        .select()
        .from(training_materials)
        .where(eq(training_materials.program_id, programId));
    }
    return await db.select().from(training_materials);
  }

  async createTrainingMaterial(
    data: InsertTrainingMaterial,
  ): Promise<TrainingMaterial> {
    const [m] = await db.insert(training_materials).values(data).returning();
    return m;
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

  async enrollUserInProgram(
    data: InsertTrainingEnrollment,
  ): Promise<TrainingEnrollment> {
    const [e] = await db.insert(training_enrollments).values(data).returning();
    return e;
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

  async createEvaluation(
    data: InsertTrainingEvaluation,
  ): Promise<TrainingEvaluation> {
    const [e] = await db.insert(training_evaluations).values(data).returning();
    return e;
  }

  async getCertificates(userId: number): Promise<TrainingCertificate[]> {
    return await db
      .select()
      .from(training_certificates)
      .where(eq(training_certificates.employee_id, userId));
  }

  async createCertificate(
    data: InsertTrainingCertificate,
  ): Promise<TrainingCertificate> {
    const [c] = await db.insert(training_certificates).values(data).returning();
    return c;
  }

  async getPerformanceReviews(
    userId?: number | string,
  ): Promise<PerformanceReview[]> {
    if (userId) {
      return await db
        .select()
        .from(performance_reviews)
        .where(eq(performance_reviews.employee_id, Number(userId)))
        .orderBy(desc(performance_reviews.review_period_end));
    }
    return await db
      .select()
      .from(performance_reviews)
      .orderBy(desc(performance_reviews.review_period_end));
  }

  async createPerformanceReview(
    data: InsertPerformanceReview,
  ): Promise<PerformanceReview> {
    const [r] = await db.insert(performance_reviews).values(data).returning();
    return r;
  }

  async getPerformanceCriteria(): Promise<PerformanceCriteria[]> {
    return await db.select().from(performance_criteria);
  }

  async getPerformanceRatings(reviewId: number): Promise<PerformanceRating[]> {
    return await db
      .select()
      .from(performance_ratings)
      .where(eq(performance_ratings.review_id, reviewId));
  }

  async createPerformanceRating(
    data: InsertPerformanceRating,
  ): Promise<PerformanceRating> {
    const [r] = await db.insert(performance_ratings).values(data).returning();
    return r;
  }

  async getLeaveTypes(): Promise<LeaveType[]> {
    return await db.select().from(leave_types);
  }

  async getLeaveRequests(userId?: number | string): Promise<any[]> {
    if (userId)
      return await db
        .select()
        .from(leave_requests)
        .where(eq(leave_requests.employee_id, Number(userId)));
    return await db
      .select()
      .from(leave_requests)
      .orderBy(desc(leave_requests.created_at));
  }

  async createLeaveRequest(data: InsertLeaveRequest): Promise<LeaveRequest> {
    const [r] = await db.insert(leave_requests).values(data).returning();
    return r;
  }

  async updateLeaveRequest(
    id: number,
    updates: Partial<LeaveRequest>,
  ): Promise<LeaveRequest> {
    const [u] = await db
      .update(leave_requests)
      .set(updates)
      .where(eq(leave_requests.id, id))
      .returning();
    return u;
  }

  async getLeaveBalances(
    userId: number | string,
    year?: number,
  ): Promise<LeaveBalance[]> {
    const conditions = [eq(leave_balances.employee_id, Number(userId))];
    if (year) {
      conditions.push(eq(leave_balances.year, year));
    }
    return await db
      .select()
      .from(leave_balances)
      .where(and(...conditions));
  }

  async getAllAdminDecisions(): Promise<AdminDecision[]> {
    return await db
      .select()
      .from(admin_decisions)
      .orderBy(desc(admin_decisions.id));
  }

  async createAdminDecision(data: any): Promise<AdminDecision> {
    const [d] = await db.insert(admin_decisions).values(data).returning();
    return d;
  }

  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(items.name);
  }

  async getAllCustomerProducts(): Promise<CustomerProduct[]> {
    return await db
      .select()
      .from(customer_products)
      .orderBy(customer_products.id);
  }

  async getCustomerProductById(
    id: number,
  ): Promise<CustomerProduct | undefined> {
    const [p] = await db
      .select()
      .from(customer_products)
      .where(eq(customer_products.id, id));
    return p;
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(system_settings);
  }

  async updateSystemSetting(
    key: string,
    value: string,
    updatedBy?: number,
  ): Promise<SystemSetting> {
    const updateData: any = { setting_value: value };
    if (updatedBy) {
      updateData.updated_by = Number(updatedBy);
    }
    const [u] = await db
      .update(system_settings)
      .set(updateData)
      .where(eq(system_settings.setting_key, key))
      .returning();
    return u;
  }

  async getFactoryLocations(): Promise<FactoryLocation[]> {
    return await db.select().from(factory_locations);
  }

  async createFactoryLocation(
    data: InsertFactoryLocation,
  ): Promise<FactoryLocation> {
    const [l] = await db.insert(factory_locations).values(data).returning();
    return l;
  }

  async getUserSettings(userId: number): Promise<UserSetting | undefined> {
    const [s] = await db
      .select()
      .from(user_settings)
      .where(eq(user_settings.user_id, Number(userId)));
    return s;
  }

  async updateUserSetting(
    userId: number,
    key: string,
    value: string,
  ): Promise<UserSetting> {
    const existing = await db
      .select()
      .from(user_settings)
      .where(
        and(
          eq(user_settings.user_id, Number(userId)),
          eq(user_settings.setting_key, key),
        ),
      );

    if (existing.length > 0) {
      const [u] = await db
        .update(user_settings)
        .set({ setting_value: value, updated_at: new Date() })
        .where(
          and(
            eq(user_settings.user_id, Number(userId)),
            eq(user_settings.setting_key, key),
          ),
        )
        .returning();
      return u;
    } else {
      const [u] = await db
        .insert(user_settings)
        .values({
          user_id: Number(userId),
          setting_key: key,
          setting_value: value,
        })
        .returning();
      return u;
    }
  }

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

  async getUserNotifications(
    userId: number,
    options?: any,
  ): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipient_id, userId.toString()))
      .orderBy(desc(notifications.created_at));
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

  async getOperatorNegligenceReports(): Promise<OperatorNegligenceReport[]> {
    return await db.select().from(operator_negligence_reports);
  }

  async createOperatorNegligenceReport(
    data: InsertOperatorNegligenceReport,
  ): Promise<OperatorNegligenceReport> {
    const [maxResult] = await db
      .execute(
        sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM operator_negligence_reports`,
      )
      .then((r) => r.rows as any[]);
    const nextNum = maxResult?.next_id || 1;
    const report_number = `ON${String(nextNum).padStart(3, "0")}`;
    try {
      const [r] = await db
        .insert(operator_negligence_reports)
        .values({ ...data, report_number } as any)
        .returning();
      return r;
    } catch (e: any) {
      if (e.code === "23505") {
        const retryNum = Date.now() % 100000;
        const retryNumber = `ON${String(retryNum).padStart(5, "0")}`;
        const [r] = await db
          .insert(operator_negligence_reports)
          .values({ ...data, report_number: retryNumber } as any)
          .returning();
        return r;
      }
      throw e;
    }
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

  async getSystemHealthChecks(
    limit: number = 50,
  ): Promise<SystemHealthCheck[]> {
    return await db
      .select()
      .from(system_health_checks)
      .orderBy(desc(system_health_checks.last_check_time))
      .limit(limit);
  }

  async createSystemHealthCheck(
    data: InsertSystemHealthCheck,
  ): Promise<SystemHealthCheck> {
    const [c] = await db.insert(system_health_checks).values(data).returning();
    return c;
  }

  async getSystemPerformanceMetrics(
    options?: any,
  ): Promise<SystemPerformanceMetric[]> {
    return await db
      .select()
      .from(system_performance_metrics)
      .orderBy(desc(system_performance_metrics.timestamp));
  }

  async createSystemPerformanceMetric(
    data: InsertSystemPerformanceMetric,
  ): Promise<SystemPerformanceMetric> {
    const [m] = await db
      .insert(system_performance_metrics)
      .values(data)
      .returning();
    return m;
  }

  async getCorrectiveActions(alertId?: number): Promise<CorrectiveAction[]> {
    if (alertId)
      return await db
        .select()
        .from(corrective_actions)
        .where(eq(corrective_actions.alert_id, alertId));
    return await db.select().from(corrective_actions);
  }

  async createCorrectiveAction(
    data: InsertCorrectiveAction,
  ): Promise<CorrectiveAction> {
    const [a] = await db.insert(corrective_actions).values(data).returning();
    return a;
  }

  async updateCorrectiveAction(
    id: number,
    updates: Partial<CorrectiveAction>,
  ): Promise<CorrectiveAction> {
    const [u] = await db
      .update(corrective_actions)
      .set(updates)
      .where(eq(corrective_actions.id, id))
      .returning();
    return u;
  }

  async getSystemAnalytics(type?: string): Promise<SystemAnalytics[]> {
    if (type)
      return await db
        .select()
        .from(system_analytics)
        .where(eq(system_analytics.metric_type, type));
    return await db.select().from(system_analytics);
  }

  async createSystemAnalytics(
    data: InsertSystemAnalytics,
  ): Promise<SystemAnalytics> {
    const [a] = await db.insert(system_analytics).values(data).returning();
    return a;
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

  async getAlertsByUser(userId: number): Promise<SystemAlert[]> {
    return await db
      .select()
      .from(system_alerts)
      .where(sql`${userId} = ANY(${system_alerts.target_users})`)
      .orderBy(desc(system_alerts.created_at));
  }

  async getSystemHealthStatus(): Promise<any> {
    const checks = await this.getSystemHealthChecks(20);
    const healthyCount = checks.filter((c) => c.status === "healthy").length;
    return {
      status: healthyCount === checks.length ? "healthy" : "degraded",
      checks,
      totalChecks: checks.length,
      healthyChecks: healthyCount,
    };
  }

  async getHealthChecksByType(type: string): Promise<SystemHealthCheck[]> {
    return await db
      .select()
      .from(system_health_checks)
      .where(eq(system_health_checks.check_type, type))
      .orderBy(desc(system_health_checks.last_check_time));
  }

  async getCriticalHealthChecks(): Promise<SystemHealthCheck[]> {
    return await db
      .select()
      .from(system_health_checks)
      .where(eq(system_health_checks.status, "critical"))
      .orderBy(desc(system_health_checks.last_check_time));
  }

  async getPerformanceSummary(timeRange: string): Promise<any> {
    const metrics = await this.getSystemPerformanceMetrics({ limit: 100 });
    return { timeRange, metrics, count: metrics.length };
  }

  async getMetricsByTimeRange(
    name: string,
    start: Date,
    end: Date,
  ): Promise<SystemPerformanceMetric[]> {
    return await db
      .select()
      .from(system_performance_metrics)
      .where(
        and(
          eq(system_performance_metrics.metric_name, name),
          sql`${system_performance_metrics.timestamp} BETWEEN ${start} AND ${end}`,
        ),
      )
      .orderBy(system_performance_metrics.timestamp);
  }

  async getLatestMetricValue(
    name: string,
  ): Promise<SystemPerformanceMetric | undefined> {
    const [m] = await db
      .select()
      .from(system_performance_metrics)
      .where(eq(system_performance_metrics.metric_name, name))
      .orderBy(desc(system_performance_metrics.timestamp))
      .limit(1);
    return m;
  }

  async getPendingActions(): Promise<CorrectiveAction[]> {
    return await db
      .select()
      .from(corrective_actions)
      .where(eq(corrective_actions.status, "pending"))
      .orderBy(desc(corrective_actions.created_at));
  }

  async getActionsByAssignee(userId: number): Promise<CorrectiveAction[]> {
    return await db
      .select()
      .from(corrective_actions)
      .where(eq(corrective_actions.assigned_to, userId))
      .orderBy(desc(corrective_actions.created_at));
  }

  async completeCorrectiveAction(
    id: number,
    userId: number,
    notes?: string,
  ): Promise<CorrectiveAction> {
    return this.updateCorrectiveAction(id, {
      status: "completed",
      completed_by: userId,
      completed_at: new Date(),
      completion_notes: notes,
    } as any);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
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

  async getMixingBatches(options?: any): Promise<MixingBatch[]> {
    const result = await db.execute(sql`
      SELECT
        mb.*,
        m.name AS machine_name,
        m.name_ar AS machine_name_ar,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'item_id', bi.item_id,
                'material_name', i.name,
                'material_name_ar', i.name_ar,
                'actual_weight_kg', bi.actual_weight_kg,
                'percentage', bi.percentage
              )
              ORDER BY bi.id
            )
            FROM batch_ingredients bi
            LEFT JOIN items i ON bi.item_id = i.id
            WHERE bi.batch_id = mb.id
          ),
          '[]'::json
        ) AS composition
      FROM mixing_batches mb
      LEFT JOIN machines m ON mb.machine_id = m.id
      ORDER BY mb.created_at DESC
    `);
    return result.rows as any;
  }

  async getMixingBatchById(id: number): Promise<any> {
    const [b] = await db
      .select()
      .from(mixing_batches)
      .where(eq(mixing_batches.id, id));
    if (!b) return undefined;
    const ingredients = await db
      .select()
      .from(batch_ingredients)
      .where(eq(batch_ingredients.batch_id, id));
    return { ...b, ingredients };
  }

  async createMixingBatch(
    batch: InsertMixingBatch,
    ingredients: InsertBatchIngredient[],
  ): Promise<MixingBatch> {
    return await db.transaction(async (tx) => {
      const [createdBatch] = await tx
        .insert(mixing_batches)
        .values(batch)
        .returning();
      if (ingredients.length > 0) {
        const ingredientsToInsert = ingredients.map((i) => ({
          ...i,
          batch_id: createdBatch.id,
        }));
        await tx.insert(batch_ingredients).values(ingredientsToInsert);
      }
      return createdBatch;
    });
  }

  async updateMixingBatchStatus(
    id: number,
    status: string,
  ): Promise<MixingBatch> {
    const [u] = await db
      .update(mixing_batches)
      .set({ status })
      .where(eq(mixing_batches.id, id))
      .returning();
    return u;
  }

  async getMasterBatchColors(): Promise<MasterBatchColor[]> {
    return await db.select().from(master_batch_colors);
  }

  async createMasterBatchColor(
    data: InsertMasterBatchColor,
  ): Promise<MasterBatchColor> {
    const [c] = await db.insert(master_batch_colors).values(data).returning();
    return c;
  }

  async getRawMaterialVouchersIn(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT v.*, 
        s.name AS supplier_name, s.name_ar AS supplier_name_ar,
        i.name AS item_name, i.name_ar AS item_name_ar, i.code AS item_code,
        l.name AS location_name, l.name_ar AS location_name_ar
      FROM raw_material_vouchers_in v
      LEFT JOIN suppliers s ON v.supplier_id = s.id
      LEFT JOIN items i ON v.item_id = i.id
      LEFT JOIN locations l ON v.location_id = l.id
      ORDER BY v.id DESC
    `);
    return result.rows as any[];
  }

  async getRawMaterialVoucherInById(id: number): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT v.*, 
        s.name AS supplier_name, s.name_ar AS supplier_name_ar,
        i.name AS item_name, i.name_ar AS item_name_ar, i.code AS item_code,
        l.name AS location_name, l.name_ar AS location_name_ar
      FROM raw_material_vouchers_in v
      LEFT JOIN suppliers s ON v.supplier_id = s.id
      LEFT JOIN items i ON v.item_id = i.id
      LEFT JOIN locations l ON v.location_id = l.id
      WHERE v.id = ${id}
    `);
    return (result.rows as any[])[0];
  }

  async createRawMaterialVoucherIn(data: any): Promise<RawMaterialVoucherIn> {
    return await db.transaction(async (tx) => {
      const [v] = await tx
        .insert(raw_material_vouchers_in)
        .values(data)
        .returning();
      if (v.item_id && v.quantity) {
        const qty = parseFloat(String(v.quantity));
        const locId = v.location_id || null;
        const existingInv = await tx.execute(sql`
          SELECT id FROM inventory WHERE item_id = ${v.item_id} AND (location_id = ${locId} OR (location_id IS NULL AND ${locId} IS NULL)) LIMIT 1
        `);
        if ((existingInv.rows as any[]).length > 0) {
          await tx.execute(sql`
            UPDATE inventory SET current_stock = current_stock + ${qty}, last_updated = NOW()
            WHERE item_id = ${v.item_id} AND (location_id = ${locId} OR (location_id IS NULL AND ${locId} IS NULL))
          `);
        } else {
          await tx.execute(sql`
            INSERT INTO inventory (item_id, current_stock, location_id, unit, last_updated)
            VALUES (${v.item_id}, ${qty}, ${locId}, ${v.unit || "كيلو"}, NOW())
          `);
        }
      }
      return v;
    });
  }

  async deleteRawMaterialVoucherIn(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [v] = await tx
        .select()
        .from(raw_material_vouchers_in)
        .where(eq(raw_material_vouchers_in.id, id));
      if (!v) throw new Error("السند غير موجود");
      if (v.item_id && v.quantity) {
        const qty = parseFloat(String(v.quantity));
        const locId = v.location_id || null;
        const stockCheck = await tx.execute(sql`
          SELECT current_stock FROM inventory
          WHERE item_id = ${v.item_id} AND (location_id = ${locId} OR (location_id IS NULL AND ${locId} IS NULL))
          LIMIT 1
        `);
        const currentStock = parseFloat(
          String((stockCheck.rows as any[])[0]?.current_stock || "0"),
        );
        if (currentStock < qty) {
          throw new Error(
            `لا يمكن حذف سند الاستلام: المخزون الحالي (${currentStock}) أقل من الكمية المسجلة (${qty}) للصنف ${v.item_id}`,
          );
        }
        await tx.execute(sql`
          UPDATE inventory SET current_stock = current_stock - ${qty}, last_updated = NOW()
          WHERE item_id = ${v.item_id} AND (location_id = ${locId} OR (location_id IS NULL AND ${locId} IS NULL))
        `);
      }
      await tx
        .delete(raw_material_vouchers_in)
        .where(eq(raw_material_vouchers_in.id, id));
    });
  }

  async getRawMaterialVouchersOut(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT v.*,
        i.name AS item_name, i.name_ar AS item_name_ar, i.code AS item_code,
        l.name AS location_name, l.name_ar AS location_name_ar,
        po.production_order_number
      FROM raw_material_vouchers_out v
      LEFT JOIN items i ON v.item_id = i.id
      LEFT JOIN locations l ON v.location_id::varchar = l.id
      LEFT JOIN production_orders po ON v.production_order_id = po.id
      ORDER BY v.id DESC
    `);
    return result.rows as any[];
  }

  async getRawMaterialVoucherOutById(id: number): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT v.*,
        i.name AS item_name, i.name_ar AS item_name_ar, i.code AS item_code,
        l.name AS location_name, l.name_ar AS location_name_ar,
        po.production_order_number
      FROM raw_material_vouchers_out v
      LEFT JOIN items i ON v.item_id = i.id
      LEFT JOIN locations l ON v.location_id::varchar = l.id
      LEFT JOIN production_orders po ON v.production_order_id = po.id
      WHERE v.id = ${id}
    `);
    return (result.rows as any[])[0];
  }

  async createRawMaterialVoucherOut(data: any): Promise<RawMaterialVoucherOut> {
    return await db.transaction(async (tx) => {
      const [v] = await tx
        .insert(raw_material_vouchers_out)
        .values(data)
        .returning();
      if (v.item_id && v.quantity) {
        const qty = parseFloat(String(v.quantity));
        const locId = (v as any).location_id || null;
        const stockCheck = await tx.execute(sql`
          SELECT current_stock FROM inventory
          WHERE item_id = ${v.item_id} AND (location_id = ${locId} OR (location_id IS NULL AND ${locId} IS NULL))
          LIMIT 1
        `);
        const currentStock = parseFloat(
          String((stockCheck.rows as any[])[0]?.current_stock || "0"),
        );
        if (currentStock < qty) {
          throw new Error(
            `الكمية المطلوبة (${qty}) تتجاوز المخزون المتاح (${currentStock}) للصنف ${v.item_id}`,
          );
        }
        await tx.execute(sql`
          UPDATE inventory SET current_stock = current_stock - ${qty}, last_updated = NOW()
          WHERE item_id = ${v.item_id} AND (location_id = ${locId} OR (location_id IS NULL AND ${locId} IS NULL))
        `);
      }
      return v;
    });
  }

  async deleteRawMaterialVoucherOut(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [v] = await tx
        .select()
        .from(raw_material_vouchers_out)
        .where(eq(raw_material_vouchers_out.id, id));
      if (!v) throw new Error("السند غير موجود");
      if (v.item_id && v.quantity) {
        const qty = parseFloat(String(v.quantity));
        const locId = (v as any).location_id || null;
        await tx.execute(sql`
          UPDATE inventory SET current_stock = current_stock + ${qty}, last_updated = NOW()
          WHERE item_id = ${v.item_id} AND (location_id = ${locId} OR (location_id IS NULL AND ${locId} IS NULL))
        `);
      }
      await tx
        .delete(raw_material_vouchers_out)
        .where(eq(raw_material_vouchers_out.id, id));
    });
  }

  // ===== Industrial Waste Vouchers (مستودع المخلفات الصناعية) =====

  async getIndustrialWasteVouchersIn(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT v.*, u.display_name AS received_by_name, u.username AS received_by_username
      FROM industrial_waste_vouchers_in v
      LEFT JOIN users u ON v.received_by = u.id
      ORDER BY v.id DESC
    `);
    return result.rows as any[];
  }

  async getIndustrialWasteVoucherInById(
    id: number,
  ): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT v.*, u.display_name AS received_by_name, u.username AS received_by_username
      FROM industrial_waste_vouchers_in v
      LEFT JOIN users u ON v.received_by = u.id
      WHERE v.id = ${id}
    `);
    return (result.rows as any[])[0];
  }

  async createIndustrialWasteVoucherIn(
    data: any,
  ): Promise<IndustrialWasteVoucherIn> {
    const [v] = await db
      .insert(industrial_waste_vouchers_in)
      .values(data)
      .returning();
    return v;
  }

  async updateIndustrialWasteVoucherIn(
    id: number,
    data: any,
  ): Promise<IndustrialWasteVoucherIn> {
    const [v] = await db
      .update(industrial_waste_vouchers_in)
      .set({ ...data, updated_at: new Date() })
      .where(eq(industrial_waste_vouchers_in.id, id))
      .returning();
    if (!v) throw new Error("السند غير موجود");
    return v;
  }

  async deleteIndustrialWasteVoucherIn(id: number): Promise<void> {
    const [v] = await db
      .select()
      .from(industrial_waste_vouchers_in)
      .where(eq(industrial_waste_vouchers_in.id, id));
    if (!v) throw new Error("السند غير موجود");
    await db
      .delete(industrial_waste_vouchers_in)
      .where(eq(industrial_waste_vouchers_in.id, id));
  }

  async getIndustrialWasteVouchersOut(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT v.*, u.display_name AS issued_by_name, u.username AS issued_by_username
      FROM industrial_waste_vouchers_out v
      LEFT JOIN users u ON v.issued_by = u.id
      ORDER BY v.id DESC
    `);
    return result.rows as any[];
  }

  async getIndustrialWasteVoucherOutById(
    id: number,
  ): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT v.*, u.display_name AS issued_by_name, u.username AS issued_by_username
      FROM industrial_waste_vouchers_out v
      LEFT JOIN users u ON v.issued_by = u.id
      WHERE v.id = ${id}
    `);
    return (result.rows as any[])[0];
  }

  async createIndustrialWasteVoucherOut(
    data: any,
  ): Promise<IndustrialWasteVoucherOut> {
    const [v] = await db
      .insert(industrial_waste_vouchers_out)
      .values(data)
      .returning();
    return v;
  }

  async updateIndustrialWasteVoucherOut(
    id: number,
    data: any,
  ): Promise<IndustrialWasteVoucherOut> {
    const [v] = await db
      .update(industrial_waste_vouchers_out)
      .set({ ...data, updated_at: new Date() })
      .where(eq(industrial_waste_vouchers_out.id, id))
      .returning();
    if (!v) throw new Error("السند غير موجود");
    return v;
  }

  async deleteIndustrialWasteVoucherOut(id: number): Promise<void> {
    const [v] = await db
      .select()
      .from(industrial_waste_vouchers_out)
      .where(eq(industrial_waste_vouchers_out.id, id));
    if (!v) throw new Error("السند غير موجود");
    await db
      .delete(industrial_waste_vouchers_out)
      .where(eq(industrial_waste_vouchers_out.id, id));
  }

  async getFinishedGoodsVouchersIn(): Promise<FinishedGoodsVoucherIn[]> {
    return await db
      .select()
      .from(finished_goods_vouchers_in)
      .orderBy(desc(finished_goods_vouchers_in.id));
  }

  async getFinishedGoodsVoucherInById(
    id: number,
  ): Promise<FinishedGoodsVoucherIn | undefined> {
    const [v] = await db
      .select()
      .from(finished_goods_vouchers_in)
      .where(eq(finished_goods_vouchers_in.id, id));
    return v;
  }

  async createFinishedGoodsVoucherIn(
    data: any,
  ): Promise<FinishedGoodsVoucherIn> {
    const receiptItems: any[] = data.items || [];
    const now = new Date();

    if (receiptItems.length > 0) {
      let totalWeight = 0;
      const validatedItems: any[] = [];

      const mergedByPo = new Map<number, { weight: number; item: any }>();
      for (const item of receiptItems) {
        const poId =
          typeof item.production_order_id === "string"
            ? parseInt(item.production_order_id)
            : item.production_order_id;
        const weight = parseFloat(String(item.weight_kg || "0"));
        if (weight <= 0) continue;
        const existing = mergedByPo.get(poId);
        if (existing) {
          existing.weight += weight;
        } else {
          mergedByPo.set(poId, { weight, item });
        }
      }

      for (const [poId, { weight, item }] of Array.from(mergedByPo)) {
        const [po] = await db
          .select()
          .from(production_orders)
          .where(eq(production_orders.id, poId));
        if (!po) {
          throw new Error(`أمر الإنتاج رقم ${poId} غير موجود`);
        }

        // "Ready to receive" basis: plastic-roll products are never cut, so their
        // ready weight is the produced (done) roll weight; everything else uses
        // the cut weight. Mirrors getProductionHallOrders so the receipt math
        // matches what the warehouse user sees in the production hall.
        const readyWeightResult = await db.execute(sql`
          SELECT COALESCE(SUM(
            CASE WHEN (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%')
              THEN r.weight_kg ELSE r.cut_weight_total_kg END
          ), 0) AS total_ready_weight
          FROM rolls r
          JOIN production_orders po2 ON po2.id = r.production_order_id
          JOIN customer_products cp ON cp.id = po2.customer_product_id
          LEFT JOIN items i ON i.id = cp.item_id
          WHERE r.production_order_id = ${poId} AND r.stage = 'done'
        `);
        const totalReadyWeight = parseFloat(
          String((readyWeightResult.rows[0] as any)?.total_ready_weight || "0"),
        );
        const alreadyReceived = parseFloat(
          String(po.warehouse_received_kg || "0"),
        );
        const remaining = totalReadyWeight - alreadyReceived;

        if (remaining <= 0) {
          throw new Error(
            `تم استلام كامل الكمية لأمر الإنتاج ${po.production_order_number} مسبقاً`,
          );
        }
        if (weight > remaining + 0.01) {
          throw new Error(
            `الكمية المطلوبة (${weight} كجم) تتجاوز الكمية المتبقية (${remaining.toFixed(3)} كجم) لأمر الإنتاج ${po.production_order_number}`,
          );
        }

        // Optional packaging unit per receipt line. When provided, validate that
        // (rolls_per_unit * roll_weight_g/1000) * units_count is within ±2% of weight_kg.
        let packagingUnitId: number | null = null;
        let unitsCount: number | null = null;
        let packagingUnitName: string | null = null;
        if (item.packaging_unit_id) {
          const puId =
            typeof item.packaging_unit_id === "string"
              ? parseInt(item.packaging_unit_id)
              : item.packaging_unit_id;
          const [pu] = await db
            .select()
            .from(packaging_units)
            .where(eq(packaging_units.id, puId));
          if (!pu) {
            throw new Error("وحدة التعبئة المختارة غير موجودة");
          }
          if (pu.item_id !== (item.item_id || data.item_id)) {
            throw new Error("وحدة التعبئة لا تطابق الصنف المختار");
          }
          const rawCount = parseFloat(String(item.units_count || 0));
          if (!(rawCount > 0)) {
            throw new Error("عدد الوحدات يجب أن يكون أكبر من صفر");
          }
          const expectedKg =
            (parseFloat(String(pu.roll_weight_g)) *
              Number(pu.rolls_per_unit) *
              rawCount) /
            1000;
          const tolerance = expectedKg * 0.02; // ±2%
          if (Math.abs(expectedKg - weight) > tolerance + 0.01) {
            throw new Error(
              `الوزن المدخل (${weight} كجم) لا يطابق وحدة التعبئة المختارة (${expectedKg.toFixed(3)} كجم) ضمن نسبة ±2%`,
            );
          }
          packagingUnitId = puId;
          unitsCount = rawCount;
          packagingUnitName = pu.name;
        }

        totalWeight += weight;
        validatedItems.push({
          production_order_id: poId,
          production_order_number: po.production_order_number,
          weight_kg: weight,
          product_description: item.product_description || "",
          customer_id: item.customer_id || data.customer_id,
          customer_name: item.customer_name || "",
          order_number: item.order_number || "",
          item_id: item.item_id || data.item_id,
          packaging_unit_id: packagingUnitId,
          units_count: unitsCount,
          packaging_unit_name: packagingUnitName,
        });
      }

      if (validatedItems.length === 0) {
        throw new Error("لم يتم إدخال أي كميات صالحة");
      }

      // If a single line and it carries a packaging unit, surface those at the
      // top level too for easier listing/filtering. Multi-line vouchers keep the
      // per-item details inside the JSON `items` payload.
      const singlePackagingUnitId =
        validatedItems.length === 1 ? validatedItems[0].packaging_unit_id : null;
      const singleUnitsCount =
        validatedItems.length === 1 ? validatedItems[0].units_count : null;

      const voucherData: any = {
        voucher_number: data.voucher_number,
        voucher_type: data.voucher_type || "production_receipt",
        voucher_date: now,
        receipt_time: now,
        quantity: totalWeight.toString(),
        weight_kg: totalWeight.toString(),
        unit: data.unit || "kg",
        notes: data.notes || null,
        items: JSON.stringify(validatedItems),
        production_order_id:
          validatedItems.length === 1
            ? validatedItems[0].production_order_id
            : null,
        customer_id: data.customer_id || validatedItems[0].customer_id || null,
        item_id: data.item_id || validatedItems[0].item_id || null,
        packaging_unit_id: singlePackagingUnitId,
        units_count:
          singleUnitsCount != null ? String(singleUnitsCount) : null,
        created_by: data.created_by,
        status: "completed",
      };

      return await db.transaction(async (tx) => {
        const [v] = await tx
          .insert(finished_goods_vouchers_in)
          .values(voucherData)
          .returning();

        for (const item of validatedItems) {
          await tx
            .update(production_orders)
            .set({
              warehouse_received_kg: sql`CAST(${production_orders.warehouse_received_kg} AS NUMERIC) + ${item.weight_kg}`,
            })
            .where(eq(production_orders.id, item.production_order_id));
        }

        if (data.item_id) {
          const locId = data.location_id
            ? typeof data.location_id === "string"
              ? parseInt(data.location_id)
              : data.location_id
            : null;
          const conditions = locId
            ? and(
                eq(inventory.item_id, data.item_id),
                eq(inventory.location_id, locId),
              )
            : eq(inventory.item_id, data.item_id);
          const existing = await tx
            .select()
            .from(inventory)
            .where(conditions as any);

          if (existing.length > 0) {
            await tx
              .update(inventory)
              .set({
                current_stock: sql`CAST(${inventory.current_stock} AS NUMERIC) + ${totalWeight}`,
                last_updated: new Date(),
              })
              .where(eq(inventory.id, existing[0].id));
          } else {
            await tx.insert(inventory).values({
              item_id: data.item_id,
              location_id: locId,
              current_stock: String(totalWeight),
              unit: "كيلو",
            } as any);
          }
        }

        return v;
      });
    }

    const poId = data.production_order_id
      ? typeof data.production_order_id === "string"
        ? parseInt(data.production_order_id)
        : data.production_order_id
      : null;

    if (poId) {
      const [po] = await db
        .select()
        .from(production_orders)
        .where(eq(production_orders.id, poId));
      if (!po) {
        throw new Error("أمر الإنتاج غير موجود");
      }

      // Plastic-roll products are never cut: their ready weight is the produced
      // (done) roll weight; everything else uses cut weight. Mirrors
      // getProductionHallOrders so receipt math matches the production hall view.
      const readyWeightResult = await db.execute(sql`
        SELECT COALESCE(SUM(
          CASE WHEN (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%')
            THEN r.weight_kg ELSE r.cut_weight_total_kg END
        ), 0) AS total_ready_weight
        FROM rolls r
        JOIN production_orders po2 ON po2.id = r.production_order_id
        JOIN customer_products cp ON cp.id = po2.customer_product_id
        LEFT JOIN items i ON i.id = cp.item_id
        WHERE r.production_order_id = ${poId} AND r.stage = 'done'
      `);
      const totalReadyWeight = parseFloat(
        String((readyWeightResult.rows[0] as any)?.total_ready_weight || "0"),
      );
      const alreadyReceived = parseFloat(
        String(po.warehouse_received_kg || "0"),
      );
      const remaining = totalReadyWeight - alreadyReceived;
      const receiveQty = parseFloat(
        String(data.weight_kg || data.quantity || "0"),
      );

      if (remaining <= 0) {
        throw new Error("تم استلام كامل الكمية لهذا الأمر مسبقاً");
      }
      if (receiveQty > remaining) {
        throw new Error(
          `الكمية المطلوبة (${receiveQty} كجم) تتجاوز الكمية المتبقية (${remaining} كجم)`,
        );
      }

      data.production_order_id = poId;
    }

    data.receipt_time = data.receipt_time || new Date();

    return await db.transaction(async (tx) => {
      const [v] = await tx
        .insert(finished_goods_vouchers_in)
        .values(data)
        .returning();

      if (poId) {
        const receiveQty = parseFloat(
          String(data.weight_kg || data.quantity || "0"),
        );
        await tx
          .update(production_orders)
          .set({
            warehouse_received_kg: sql`CAST(${production_orders.warehouse_received_kg} AS NUMERIC) + ${receiveQty}`,
          })
          .where(eq(production_orders.id, poId));
      }

      if (data.item_id) {
        const qty = parseFloat(String(data.weight_kg || data.quantity || "0"));
        const locId = data.location_id
          ? typeof data.location_id === "string"
            ? parseInt(data.location_id)
            : data.location_id
          : null;
        const conditions = locId
          ? and(
              eq(inventory.item_id, data.item_id),
              eq(inventory.location_id, locId),
            )
          : eq(inventory.item_id, data.item_id);
        const existing = await tx
          .select()
          .from(inventory)
          .where(conditions as any);

        if (existing.length > 0) {
          await tx
            .update(inventory)
            .set({
              current_stock: sql`CAST(${inventory.current_stock} AS NUMERIC) + ${qty}`,
              last_updated: new Date(),
            })
            .where(eq(inventory.id, existing[0].id));
        } else {
          await tx.insert(inventory).values({
            item_id: data.item_id,
            location_id: locId,
            current_stock: String(qty),
            unit: "كيلو",
          } as any);
        }
      }

      return v;
    });
  }

  async deleteFinishedGoodsVoucherIn(id: number): Promise<void> {
    const [voucher] = await db
      .select()
      .from(finished_goods_vouchers_in)
      .where(eq(finished_goods_vouchers_in.id, id));
    if (!voucher) {
      throw new Error("السند غير موجود");
    }

    const totalQty = parseFloat(
      String(voucher.weight_kg || voucher.quantity || "0"),
    );
    const poId = voucher.production_order_id;

    let parsedItems: any[] = [];
    try {
      if (voucher.items) {
        parsedItems = JSON.parse(voucher.items);
      }
    } catch {}

    await db.transaction(async (tx) => {
      if (parsedItems.length > 0) {
        for (const item of parsedItems) {
          const itemPoId = item.production_order_id;
          const itemWeight = parseFloat(String(item.weight_kg || "0"));
          if (itemPoId && itemWeight > 0) {
            await tx
              .update(production_orders)
              .set({
                warehouse_received_kg: sql`GREATEST(0, CAST(${production_orders.warehouse_received_kg} AS NUMERIC) - ${itemWeight})`,
              })
              .where(eq(production_orders.id, itemPoId));
          }
        }
      } else if (poId && totalQty > 0) {
        await tx
          .update(production_orders)
          .set({
            warehouse_received_kg: sql`GREATEST(0, CAST(${production_orders.warehouse_received_kg} AS NUMERIC) - ${totalQty})`,
          })
          .where(eq(production_orders.id, poId));
      }

      if (voucher.item_id && totalQty > 0) {
        const locId = (voucher as any).location_id;
        const conditions = locId
          ? and(
              eq(inventory.item_id, voucher.item_id),
              eq(inventory.location_id, String(locId)),
            )
          : eq(inventory.item_id, voucher.item_id);
        const existing = await tx
          .select()
          .from(inventory)
          .where(conditions as any);

        if (existing.length > 0) {
          await tx
            .update(inventory)
            .set({
              current_stock: sql`GREATEST(0, CAST(${inventory.current_stock} AS NUMERIC) - ${totalQty})`,
              last_updated: new Date(),
            })
            .where(eq(inventory.id, existing[0].id));
        }
      }

      await tx
        .delete(finished_goods_vouchers_in)
        .where(eq(finished_goods_vouchers_in.id, id));
    });
  }

  async getProductionOrdersForReceipt(): Promise<any[]> {
    const orders = await db
      .select({
        id: production_orders.id,
        production_order_number: production_orders.production_order_number,
        order_id: production_orders.order_id,
        quantity_kg: production_orders.quantity_kg,
        warehouse_received_kg: production_orders.warehouse_received_kg,
        net_quantity_kg: production_orders.net_quantity_kg,
        status: production_orders.status,
        customer_product_id: production_orders.customer_product_id,
      })
      .from(production_orders)
      .where(
        and(
          or(
            eq(production_orders.status, "completed"),
            eq(production_orders.status, "active"),
            eq(production_orders.status, "cutting"),
          ),
          sql`CAST(${production_orders.warehouse_received_kg} AS NUMERIC) < CAST(${production_orders.quantity_kg} AS NUMERIC)`,
        ),
      )
      .orderBy(desc(production_orders.id));

    return orders.map((o) => ({
      ...o,
      remaining_kg:
        parseFloat(String(o.quantity_kg)) -
        parseFloat(String(o.warehouse_received_kg || "0")),
    }));
  }

  async updateProductionOrderReceivedKg(
    id: number,
    additionalKg: number,
  ): Promise<void> {
    await db
      .update(production_orders)
      .set({
        warehouse_received_kg: sql`CAST(${production_orders.warehouse_received_kg} AS NUMERIC) + ${additionalKg}`,
      })
      .where(eq(production_orders.id, id));
  }

  async getFinishedGoodsStock(): Promise<any[]> {
    return await db.select().from(inventory).orderBy(desc(inventory.id));
  }

  async updateFinishedGoodsStock(
    itemId: string,
    quantityChange: number,
    locationId?: number,
  ): Promise<void> {
    const locId = locationId
      ? typeof locationId === "string"
        ? parseInt(locationId)
        : locationId
      : null;
    const conditions = locId
      ? and(
          eq(inventory.item_id, itemId),
          eq(inventory.location_id, String(locId)),
        )
      : eq(inventory.item_id, itemId);

    const existing = await db
      .select()
      .from(inventory)
      .where(conditions as any);

    if (existing.length > 0) {
      await db
        .update(inventory)
        .set({
          current_stock: sql`CAST(${inventory.current_stock} AS NUMERIC) + ${quantityChange}`,
          last_updated: new Date(),
        })
        .where(eq(inventory.id, existing[0].id));
    } else {
      await db.insert(inventory).values({
        item_id: itemId,
        location_id: locId,
        current_stock: String(quantityChange),
        unit: "كيلو",
      } as any);
    }
  }

  async getFinishedGoodsVouchersOut(): Promise<FinishedGoodsVoucherOut[]> {
    return await db
      .select()
      .from(finished_goods_vouchers_out)
      .orderBy(desc(finished_goods_vouchers_out.id));
  }

  async getFinishedGoodsVoucherOutById(
    id: number,
  ): Promise<FinishedGoodsVoucherOut | undefined> {
    const [v] = await db
      .select()
      .from(finished_goods_vouchers_out)
      .where(eq(finished_goods_vouchers_out.id, id));
    return v;
  }

  async getDeliveryHallOrders(): Promise<any[]> {
    const rows = await db.execute(sql`
      SELECT
        po.id AS production_order_id,
        po.production_order_number,
        po.order_id,
        po.quantity_kg AS quantity_required,
        po.warehouse_received_kg,
        po.warehouse_delivered_kg,
        po.status AS po_status,
        o.order_number,
        c.id AS customer_id,
        c.name AS customer_name,
        c.name_ar AS customer_name_ar,
        COALESCE(i.name, cp.id::text) AS product_name,
        i.name_ar AS product_name_ar,
        cp.unit_weight_kg AS unit_weight_kg
      FROM production_orders po
      JOIN orders o ON po.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      JOIN customer_products cp ON po.customer_product_id = cp.id
      LEFT JOIN items i ON cp.item_id = i.id
      WHERE CAST(po.warehouse_received_kg AS NUMERIC) > 0
        AND CAST(po.warehouse_delivered_kg AS NUMERIC) < CAST(po.warehouse_received_kg AS NUMERIC)
        AND po.status IS DISTINCT FROM 'archived'
        AND o.status IS DISTINCT FROM 'archived'
      ORDER BY po.id
    `);
    return (rows.rows as any[]).map((row) => ({
      ...row,
      production_order_id: Number(row.production_order_id),
      order_id: Number(row.order_id),
    }));
  }

  async createFinishedGoodsVoucherOut(
    data: any,
  ): Promise<FinishedGoodsVoucherOut> {
    const deliveryItems: any[] = data.items || [];
    const now = new Date();

    if (deliveryItems.length > 0) {
      let totalWeight = 0;
      const validatedItems: any[] = [];

      const mergedByPo = new Map<number, { weight: number; item: any }>();
      for (const item of deliveryItems) {
        const poId =
          typeof item.production_order_id === "string"
            ? parseInt(item.production_order_id)
            : item.production_order_id;
        const weight = parseFloat(String(item.weight_kg || "0"));
        if (weight <= 0) continue;
        const existing = mergedByPo.get(poId);
        if (existing) {
          existing.weight += weight;
        } else {
          mergedByPo.set(poId, { weight, item });
        }
      }

      for (const [poId, { weight, item }] of Array.from(mergedByPo)) {
        const [po] = await db
          .select()
          .from(production_orders)
          .where(eq(production_orders.id, poId));
        if (!po) {
          throw new Error(`أمر الإنتاج رقم ${poId} غير موجود`);
        }

        const received = parseFloat(String(po.warehouse_received_kg || "0"));
        const delivered = parseFloat(String(po.warehouse_delivered_kg || "0"));
        const available = received - delivered;

        if (available <= 0) {
          throw new Error(
            `لا توجد كمية متاحة للتسليم لأمر الإنتاج ${po.production_order_number}`,
          );
        }
        if (weight > available + 0.01) {
          throw new Error(
            `الكمية المطلوبة (${weight} كجم) تتجاوز الكمية المتاحة (${available.toFixed(3)} كجم) لأمر الإنتاج ${po.production_order_number}`,
          );
        }

        totalWeight += weight;
        validatedItems.push({
          production_order_id: poId,
          production_order_number: po.production_order_number,
          weight_kg: weight,
          product_description: item.product_description || "",
          customer_id: item.customer_id || data.customer_id,
          customer_name: item.customer_name || "",
          order_number: item.order_number || "",
        });
      }

      if (validatedItems.length === 0) {
        throw new Error("لم يتم إدخال أي كميات صالحة");
      }

      const voucherData: any = {
        voucher_number: data.voucher_number,
        voucher_type: data.voucher_type || "customer_delivery",
        voucher_date: now,
        delivery_time: now,
        quantity: totalWeight.toString(),
        weight_kg: totalWeight.toString(),
        unit: data.unit || "kg",
        notes: data.notes || null,
        items: JSON.stringify(validatedItems),
        production_order_id:
          validatedItems.length === 1
            ? validatedItems[0].production_order_id
            : null,
        customer_id: data.customer_id || validatedItems[0].customer_id || null,
        driver_name: data.driver_name || null,
        driver_phone: data.driver_phone || null,
        vehicle_number: data.vehicle_number || null,
        delivery_address: data.delivery_address || null,
        created_by: data.created_by,
        status: "completed",
      };

      return await db.transaction(async (tx) => {
        const [v] = await tx
          .insert(finished_goods_vouchers_out)
          .values(voucherData)
          .returning();

        for (const item of validatedItems) {
          await tx
            .update(production_orders)
            .set({
              warehouse_delivered_kg: sql`CAST(${production_orders.warehouse_delivered_kg} AS NUMERIC) + ${item.weight_kg}`,
            })
            .where(eq(production_orders.id, item.production_order_id));
        }

        return v;
      });
    }

    return await db.transaction(async (tx) => {
      if (data.item_id) {
        const qty = parseFloat(String(data.weight_kg || data.quantity || "0"));
        const locId = data.location_id
          ? typeof data.location_id === "string"
            ? parseInt(data.location_id)
            : data.location_id
          : null;
        const conditions = locId
          ? and(
              eq(inventory.item_id, data.item_id),
              eq(inventory.location_id, locId),
            )
          : eq(inventory.item_id, data.item_id);
        const existing = await tx
          .select()
          .from(inventory)
          .where(conditions as any);
        const currentStock =
          existing.length > 0
            ? parseFloat(String(existing[0].current_stock || "0"))
            : 0;

        if (qty > currentStock) {
          throw new Error(
            `الكمية المطلوبة (${qty} كجم) تتجاوز المخزون المتاح (${currentStock} كجم)`,
          );
        }
      }

      data.delivery_time = data.delivery_time || new Date();
      const [v] = await tx
        .insert(finished_goods_vouchers_out)
        .values(data)
        .returning();

      if (data.item_id) {
        const qty = parseFloat(String(data.weight_kg || data.quantity || "0"));
        const locId = data.location_id
          ? typeof data.location_id === "string"
            ? parseInt(data.location_id)
            : data.location_id
          : null;
        const conditions = locId
          ? and(
              eq(inventory.item_id, data.item_id),
              eq(inventory.location_id, locId),
            )
          : eq(inventory.item_id, data.item_id);
        const existing = await tx
          .select()
          .from(inventory)
          .where(conditions as any);

        if (existing.length > 0) {
          await tx
            .update(inventory)
            .set({
              current_stock: sql`CAST(${inventory.current_stock} AS NUMERIC) - ${qty}`,
              last_updated: new Date(),
            })
            .where(eq(inventory.id, existing[0].id));
        }
      }

      return v;
    });
  }

  async deleteFinishedGoodsVoucherOut(id: number): Promise<void> {
    const [voucher] = await db
      .select()
      .from(finished_goods_vouchers_out)
      .where(eq(finished_goods_vouchers_out.id, id));
    if (!voucher) {
      throw new Error("السند غير موجود");
    }

    let parsedItems: any[] = [];
    try {
      if (voucher.items) {
        parsedItems = JSON.parse(voucher.items);
      }
    } catch {}

    await db.transaction(async (tx) => {
      if (parsedItems.length > 0) {
        for (const item of parsedItems) {
          const itemPoId = item.production_order_id;
          const itemWeight = parseFloat(String(item.weight_kg || "0"));
          if (itemPoId && itemWeight > 0) {
            await tx
              .update(production_orders)
              .set({
                warehouse_delivered_kg: sql`GREATEST(0, CAST(${production_orders.warehouse_delivered_kg} AS NUMERIC) - ${itemWeight})`,
              })
              .where(eq(production_orders.id, itemPoId));
          }
        }
      }

      await tx
        .delete(finished_goods_vouchers_out)
        .where(eq(finished_goods_vouchers_out.id, id));
    });
  }

  async getWarehouseVouchersStats(): Promise<any> {
    try {
      const [rmIn] = await db
        .select({ count: count() })
        .from(raw_material_vouchers_in);
      const [rmOut] = await db
        .select({ count: count() })
        .from(raw_material_vouchers_out);
      const [fpIn] = await db
        .select({ count: count() })
        .from(finished_goods_vouchers_in);
      const [fpOut] = await db
        .select({ count: count() })
        .from(finished_goods_vouchers_out);
      return {
        rm_in: rmIn?.count || 0,
        rm_out: rmOut?.count || 0,
        fp_in: fpIn?.count || 0,
        fp_out: fpOut?.count || 0,
        total:
          (rmIn?.count || 0) +
          (rmOut?.count || 0) +
          (fpIn?.count || 0) +
          (fpOut?.count || 0),
      };
    } catch {
      return { rm_in: 0, rm_out: 0, fp_in: 0, fp_out: 0, total: 0 };
    }
  }

  async getInventoryCounts(): Promise<InventoryCount[]> {
    return await db
      .select()
      .from(inventory_counts)
      .orderBy(desc(inventory_counts.id));
  }

  async getInventoryCountById(id: number): Promise<any> {
    const [c] = await db
      .select()
      .from(inventory_counts)
      .where(eq(inventory_counts.id, id));
    return c;
  }

  async createInventoryCount(
    data: InsertInventoryCount,
  ): Promise<InventoryCount> {
    const [c] = await db.insert(inventory_counts).values(data).returning();
    return c;
  }

  async createInventoryCountItem(
    data: InsertInventoryCountItem,
  ): Promise<InventoryCountItem> {
    const [i] = await db.insert(inventory_count_items).values(data).returning();
    return i;
  }

  async completeInventoryCount(
    id: number,
    userId: number,
  ): Promise<InventoryCount> {
    const [u] = await db
      .update(inventory_counts)
      .set({
        status: "completed",
        approved_by: userId,
        approved_at: new Date(),
      })
      .where(eq(inventory_counts.id, id))
      .returning();
    return u;
  }

  async lookupByBarcode(barcode: string): Promise<any> {
    return null;
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

  async getFactorySnapshots(userId?: number): Promise<FactorySnapshot[]> {
    if (userId)
      return await db
        .select()
        .from(factory_snapshots)
        .where(eq(factory_snapshots.created_by, userId))
        .orderBy(desc(factory_snapshots.created_at));
    return await db
      .select()
      .from(factory_snapshots)
      .orderBy(desc(factory_snapshots.created_at));
  }

  async getFactorySnapshot(id: number): Promise<FactorySnapshot | undefined> {
    const [s] = await db
      .select()
      .from(factory_snapshots)
      .where(eq(factory_snapshots.id, id));
    return s;
  }

  async getFactorySnapshotByToken(
    token: string,
  ): Promise<FactorySnapshot | undefined> {
    const [s] = await db
      .select()
      .from(factory_snapshots)
      .where(eq(factory_snapshots.share_token, token));
    return s;
  }

  async createFactorySnapshot(
    data: InsertFactorySnapshot,
  ): Promise<FactorySnapshot> {
    const [s] = await db.insert(factory_snapshots).values(data).returning();
    return s;
  }

  async deleteFactorySnapshot(id: number): Promise<void> {
    await db.delete(factory_snapshots).where(eq(factory_snapshots.id, id));
  }

  async getDisplaySlides(): Promise<DisplaySlide[]> {
    return await db
      .select()
      .from(display_slides)
      .orderBy(display_slides.sort_order);
  }

  async getActiveDisplaySlides(): Promise<DisplaySlide[]> {
    return await db
      .select()
      .from(display_slides)
      .where(eq(display_slides.is_active, true))
      .orderBy(display_slides.sort_order);
  }

  async getDisplaySlideById(id: number): Promise<DisplaySlide | undefined> {
    const [s] = await db
      .select()
      .from(display_slides)
      .where(eq(display_slides.id, id));
    return s;
  }

  async createDisplaySlide(data: InsertDisplaySlide): Promise<DisplaySlide> {
    const [s] = await db.insert(display_slides).values(data).returning();
    return s;
  }

  async updateDisplaySlide(
    id: number,
    updates: Partial<DisplaySlide>,
  ): Promise<DisplaySlide> {
    const [u] = await db
      .update(display_slides)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(display_slides.id, id))
      .returning();
    return u;
  }

  async deleteDisplaySlide(id: number): Promise<void> {
    await db.delete(display_slides).where(eq(display_slides.id, id));
  }

  // ============ ALIASES & MISSING METHODS ============

  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(roles.name);
  }

  async createRole(data: any): Promise<Role> {
    const [r] = await db.insert(roles).values(data).returning();
    return r;
  }

  async updateRole(id: number, data: any): Promise<Role> {
    const [u] = await db
      .update(roles)
      .set(data)
      .where(eq(roles.id, id))
      .returning();
    return u;
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  async updateUser(id: number, data: any): Promise<User> {
    const processedData = { ...data, updated_at: new Date() };
    if (processedData.password) {
      let isAlreadyHashed = false;
      try {
        bcrypt.getRounds(processedData.password);
        isAlreadyHashed = true;
      } catch {
        isAlreadyHashed = false;
      }
      if (!isAlreadyHashed) {
        processedData.password = await bcrypt.hash(processedData.password, 10);
      }
    } else {
      delete processedData.password;
    }
    const [u] = await db
      .update(users)
      .set(processedData)
      .where(eq(users.id, id))
      .returning();
    return u;
  }

  async deleteUser(id: number): Promise<void> {
    await db.update(users).set({ status: "inactive" }).where(eq(users.id, id));
  }

  async getSafeUsersBySection(sectionId: number): Promise<SafeUser[]> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        display_name: users.display_name,
        display_name_ar: users.display_name_ar,
        role_id: users.role_id,
        status: users.status,
        replit_user_id: users.replit_user_id,
        created_at: users.created_at,
      })
      .from(users)
      .where(and(eq(users.section_id, sectionId), eq(users.status, "active")));
    return result as unknown as SafeUser[];
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

  async getSections(): Promise<Section[]> {
    return this.getAllSections();
  }

  async createSection(data: any): Promise<Section> {
    const [s] = await db.insert(sections).values(data).returning();
    return s;
  }

  async updateSection(id: string | number, data: any): Promise<Section> {
    const [u] = await db
      .update(sections)
      .set(data)
      .where(eq(sections.id, String(id)))
      .returning();
    return u;
  }

  async deleteSection(id: string | number): Promise<void> {
    await db.delete(sections).where(eq(sections.id, String(id)));
  }

  async getCustomers(options?: {
    search?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const pageLimit = Math.min(Math.max(options?.limit ?? 50, 1), 500);
    // Prefer explicit offset; fall back to page-based pagination for callers
    // that still pass `page`. Both contracts coexist.
    const pageNum = options?.page || 1;
    const offset =
      options?.offset !== undefined
        ? Math.max(options.offset, 0)
        : (pageNum - 1) * pageLimit;

    let query = db.select().from(customers);

    if (options?.search) {
      const s = `%${options.search}%`;
      query = query.where(
        or(
          sql`${customers.name} ILIKE ${s}`,
          sql`${customers.name_ar} ILIKE ${s}`,
          sql`${customers.id} ILIKE ${s}`,
        ),
      ) as any;
    }

    const total = await db
      .select({ count: count() })
      .from(customers)
      .then((r) => r[0]?.count || 0);
    const data = await query
      .orderBy(customers.name)
      .limit(pageLimit)
      .offset(offset);

    return { data, total, page: pageNum, limit: pageLimit };
  }

  async createCustomer(data: any): Promise<Customer> {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(1002)`);

      let id = data.id;
      if (!id) {
        const [last] = await tx
          .select({ id: customers.id })
          .from(customers)
          .orderBy(desc(customers.id))
          .limit(1);
        const lastNum = last
          ? parseInt((last.id || "").replace(/\D/g, "") || "0")
          : 0;
        id = `CID${String(lastNum + 1).padStart(3, "0")}`;
      }
      const [c] = await tx
        .insert(customers)
        .values({ ...data, id })
        .returning();
      return c;
    });
  }

  async updateCustomer(id: string | any, data: any): Promise<Customer> {
    const [u] = await db
      .update(customers)
      .set(data)
      .where(eq(customers.id, String(id)))
      .returning();
    return u;
  }

  async deleteCustomer(id: string | any): Promise<void> {
    await db.delete(customers).where(eq(customers.id, String(id)));
  }

  async getMachines(): Promise<Machine[]> {
    return this.getAllMachines();
  }

  async createMachine(data: any): Promise<Machine> {
    const [m] = await db.insert(machines).values(data).returning();
    return m;
  }

  async updateMachine(id: string | number, data: any): Promise<Machine> {
    const [u] = await db
      .update(machines)
      .set(data)
      .where(eq(machines.id, String(id)))
      .returning();
    return u;
  }

  async deleteMachine(id: string | number): Promise<void> {
    await db.delete(machines).where(eq(machines.id, String(id)));
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

  async createItem(data: any): Promise<Item> {
    const [i] = await db.insert(items).values(data).returning();
    return i;
  }

  async updateItem(id: string | number, data: any): Promise<Item> {
    const [u] = await db
      .update(items)
      .set(data)
      .where(eq(items.id, String(id)))
      .returning();
    return u;
  }

  async deleteItem(id: string | number): Promise<void> {
    await db.delete(items).where(eq(items.id, String(id)));
  }

  // ===== Packaging Units (per item) =====
  // Each item can have multiple packaging configurations used at warehouse
  // receipt time only. Production flow remains unaffected.
  async getPackagingUnitsByItem(itemId: string): Promise<any[]> {
    return await db
      .select()
      .from(packaging_units)
      .where(eq(packaging_units.item_id, itemId))
      .orderBy(
        desc(packaging_units.is_default),
        desc(packaging_units.is_active),
        packaging_units.id,
      );
  }

  async getPackagingUnitById(id: number): Promise<any | undefined> {
    const [pu] = await db
      .select()
      .from(packaging_units)
      .where(eq(packaging_units.id, id));
    return pu;
  }

  async createPackagingUnit(data: any): Promise<any> {
    const rollWeightG = parseFloat(String(data.roll_weight_g || 0));
    const rollsPerUnit = parseInt(String(data.rolls_per_unit || 0));
    if (!(rollWeightG > 0) || !(rollsPerUnit > 0)) {
      throw new Error("بيانات وحدة التعبئة غير صحيحة");
    }
    const unitWeightKg = (rollWeightG * rollsPerUnit) / 1000;

    try {
      return await db.transaction(async (tx) => {
        // Enforce single default per item
        if (data.is_default) {
          await tx
            .update(packaging_units)
            .set({ is_default: false })
            .where(eq(packaging_units.item_id, data.item_id));
        }
        const [pu] = await tx
          .insert(packaging_units)
          .values({
            item_id: data.item_id,
            name: String(data.name).trim(),
            roll_weight_g: rollWeightG.toFixed(2),
            rolls_per_unit: rollsPerUnit,
            unit_weight_kg: unitWeightKg.toFixed(3),
            is_default: !!data.is_default,
            is_active: data.is_active !== undefined ? !!data.is_active : true,
          } as any)
          .returning();
        return pu;
      });
    } catch (err: any) {
      if (
        err?.code === "23505" &&
        typeof err?.constraint === "string" &&
        err.constraint.includes("uniq_packaging_units_default_per_item")
      ) {
        throw new Error(
          "لا يمكن تعيين أكثر من وحدة تعبئة افتراضية للصنف نفسه",
        );
      }
      throw err;
    }
  }

  async updatePackagingUnit(id: number, data: any): Promise<any> {
    try {
      return await db.transaction(async (tx) => {
        const [existing] = await tx
          .select()
          .from(packaging_units)
          .where(eq(packaging_units.id, id));
        if (!existing) throw new Error("وحدة التعبئة غير موجودة");

        const rollWeightG =
          data.roll_weight_g !== undefined
            ? parseFloat(String(data.roll_weight_g))
            : parseFloat(String(existing.roll_weight_g));
        const rollsPerUnit =
          data.rolls_per_unit !== undefined
            ? parseInt(String(data.rolls_per_unit))
            : existing.rolls_per_unit;
        if (!(rollWeightG > 0) || !(rollsPerUnit > 0)) {
          throw new Error("بيانات وحدة التعبئة غير صحيحة");
        }
        const unitWeightKg = (rollWeightG * rollsPerUnit) / 1000;

        if (data.is_default) {
          await tx
            .update(packaging_units)
            .set({ is_default: false })
            .where(eq(packaging_units.item_id, existing.item_id));
        }

        const updates: any = {
          roll_weight_g: rollWeightG.toFixed(2),
          rolls_per_unit: rollsPerUnit,
          unit_weight_kg: unitWeightKg.toFixed(3),
        };
        if (data.name !== undefined) updates.name = String(data.name).trim();
        if (data.is_default !== undefined)
          updates.is_default = !!data.is_default;
        if (data.is_active !== undefined) updates.is_active = !!data.is_active;

        const [pu] = await tx
          .update(packaging_units)
          .set(updates)
          .where(eq(packaging_units.id, id))
          .returning();
        return pu;
      });
    } catch (err: any) {
      if (
        err?.code === "23505" &&
        typeof err?.constraint === "string" &&
        err.constraint.includes("uniq_packaging_units_default_per_item")
      ) {
        throw new Error(
          "لا يمكن تعيين أكثر من وحدة تعبئة افتراضية للصنف نفسه",
        );
      }
      throw err;
    }
  }

  async deletePackagingUnit(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(packaging_units)
        .where(eq(packaging_units.id, id));
      if (!existing) return;

      await tx.delete(packaging_units).where(eq(packaging_units.id, id));

      if (existing.is_default) {
        const [replacement] = await tx
          .select()
          .from(packaging_units)
          .where(
            and(
              eq(packaging_units.item_id, existing.item_id),
              eq(packaging_units.is_active, true),
            ),
          )
          .orderBy(desc(packaging_units.id))
          .limit(1);
        if (replacement) {
          await tx
            .update(packaging_units)
            .set({ is_default: true })
            .where(eq(packaging_units.id, replacement.id));
        }
      }
    });
  }

  async getCustomerProducts(options?: {
    customer_id?: string;
    ids?: number[];
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<any> {
    const pageNum = options?.page || 1;
    const pageLimit = options?.limit || 500;
    const offset = (pageNum - 1) * pageLimit;

    const conditions: any[] = [];
    if (options?.customer_id) {
      conditions.push(eq(customer_products.customer_id, options.customer_id));
    }
    if (options?.ids && options.ids.length > 0) {
      conditions.push(inArray(customer_products.id, options.ids));
    }
    if (options?.search) {
      const s = `%${options.search}%`;
      conditions.push(sql`${customer_products.size_caption} ILIKE ${s}`);
    }

    const whereClause =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : and(...conditions)
        : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(customer_products)
      .where(whereClause);
    const total = totalResult?.count || 0;

    const data = await db
      .select()
      .from(customer_products)
      .where(whereClause)
      .orderBy(desc(customer_products.id))
      .limit(pageLimit)
      .offset(offset);

    return { data, total, page: pageNum, limit: pageLimit };
  }

  // وزن الكيس (جم) ومعدّل الأكياس/كيلو — يُحسبان على الخادم دائماً ولا يُوثق بأي
  // قيمة محسوبة قادمة من العميل. المصدر الموثوق الوحيد لهذه الحقول.
  private computeBagMetrics(data: any): {
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

  async createCustomerProduct(data: any): Promise<CustomerProduct> {
    const metrics = this.computeBagMetrics(data);
    const [p] = await db
      .insert(customer_products)
      .values({ ...data, ...metrics })
      .returning();
    return p;
  }

  async updateCustomerProduct(id: number, data: any): Promise<CustomerProduct> {
    const [existing] = await db
      .select()
      .from(customer_products)
      .where(eq(customer_products.id, id));
    // Recompute from the merged record so partial updates stay authoritative.
    const metrics = this.computeBagMetrics({ ...(existing || {}), ...data });
    const [u] = await db
      .update(customer_products)
      .set({ ...data, ...metrics })
      .where(eq(customer_products.id, id))
      .returning();
    return u;
  }

  async deleteCustomerProduct(id: number): Promise<void> {
    await db.delete(customer_products).where(eq(customer_products.id, id));
  }

  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(locations.name);
  }

  async createLocation(data: any): Promise<Location> {
    const [l] = await db.insert(locations).values(data).returning();
    return l;
  }

  async createLocationExtended(data: any): Promise<Location> {
    return this.createLocation(data);
  }

  async updateLocationExtended(
    id: string | number,
    data: any,
  ): Promise<Location> {
    const [u] = await db
      .update(locations)
      .set(data)
      .where(eq(locations.id, String(id)))
      .returning();
    return u;
  }

  async deleteLocation(id: string | number): Promise<void> {
    await db.delete(locations).where(eq(locations.id, String(id)));
  }

  async getCategories(): Promise<any[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(data: any): Promise<any> {
    const [c] = await db.insert(categories).values(data).returning();
    return c;
  }

  async updateCategory(id: string | number, data: any): Promise<any> {
    const [u] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, String(id)))
      .returning();
    return u;
  }

  async deleteCategory(id: string | number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, String(id)));
  }

  async getWarehouseTransactions(): Promise<WarehouseTransaction[]> {
    return await db
      .select()
      .from(warehouse_transactions)
      .orderBy(desc(warehouse_transactions.id));
  }

  async createWarehouseTransaction(data: any): Promise<WarehouseTransaction> {
    const [t] = await db
      .insert(warehouse_transactions)
      .values(data)
      .returning();
    return t;
  }

  async getWarehouseReceiptsDetailed(): Promise<any[]> {
    return await db
      .select()
      .from(warehouse_receipts)
      .orderBy(desc(warehouse_receipts.id));
  }

  async getAdminDecisions(): Promise<AdminDecision[]> {
    return this.getAllAdminDecisions();
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

  async getLastActionPerComponent(machineId: string): Promise<any[]> {
    // For each component touched on this machine, return the most recent
    // action's date, action type and cost so the UI can show "last done /
    // elapsed since" as a preventive-maintenance reference.
    const result = await db.execute(sql`
      SELECT DISTINCT ON (
          COALESCE(i.component_id::text, i.component_name_en)
        )
        i.component_id,
        i.component_name_ar,
        i.component_name_en,
        i.action_type,
        i.cost,
        a.action_date,
        a.action_number
      FROM preventive_maintenance_items i
      JOIN preventive_maintenance_actions a
        ON a.id = i.preventive_action_id
      JOIN preventive_maintenance_action_machines am
        ON am.preventive_action_id = a.id
      WHERE am.machine_id = ${machineId}
      ORDER BY
        COALESCE(i.component_id::text, i.component_name_en),
        a.action_date DESC
    `);
    return (result.rows as any[]) || [];
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

  async getAllOperatorNegligenceReports(): Promise<OperatorNegligenceReport[]> {
    return this.getOperatorNegligenceReports();
  }

  async updateOperatorNegligenceReport(
    id: number,
    data: Partial<OperatorNegligenceReport>,
  ): Promise<OperatorNegligenceReport> {
    const [u] = await db
      .update(operator_negligence_reports)
      .set(data)
      .where(eq(operator_negligence_reports.id, id))
      .returning();
    return u;
  }

  async deleteOperatorNegligenceReport(id: number): Promise<void> {
    await db
      .delete(operator_negligence_reports)
      .where(eq(operator_negligence_reports.id, id));
  }

  async getTrainingPrograms(): Promise<TrainingProgram[]> {
    return this.getAllTrainingPrograms();
  }

  async updateTrainingProgram(
    id: number,
    data: Partial<TrainingProgram>,
  ): Promise<TrainingProgram> {
    const [u] = await db
      .update(training_programs)
      .set({ ...data, updated_at: new Date() })
      .where(eq(training_programs.id, id))
      .returning();
    return u;
  }

  async getTrainingRecords(): Promise<TrainingRecord[]> {
    return await db
      .select()
      .from(training_records)
      .orderBy(desc(training_records.id));
  }

  async createTrainingRecord(data: any): Promise<TrainingRecord> {
    const [r] = await db.insert(training_records).values(data).returning();
    return r;
  }

  async getTrainingCertificates(
    userId?: number,
  ): Promise<TrainingCertificate[]> {
    if (userId) return this.getCertificates(userId);
    return await db.select().from(training_certificates);
  }

  async updateTrainingCertificate(
    id: number,
    data: Partial<TrainingCertificate>,
  ): Promise<TrainingCertificate> {
    const [u] = await db
      .update(training_certificates)
      .set(data)
      .where(eq(training_certificates.id, id))
      .returning();
    return u;
  }

  async generateTrainingCertificate(enrollmentId: number): Promise<any> {
    return { enrollmentId, generated: true };
  }

  async getTrainingEvaluations(
    employeeId?: number,
    programId?: number,
  ): Promise<TrainingEvaluation[]> {
    const conditions: any[] = [];
    if (employeeId)
      conditions.push(eq(training_evaluations.employee_id, employeeId));
    if (programId)
      conditions.push(eq(training_evaluations.program_id, programId));
    if (conditions.length > 0) {
      return await db
        .select()
        .from(training_evaluations)
        .where(and(...conditions));
    }
    return await db.select().from(training_evaluations);
  }

  async getTrainingEvaluationById(
    id: number,
  ): Promise<TrainingEvaluation | undefined> {
    const [e] = await db
      .select()
      .from(training_evaluations)
      .where(eq(training_evaluations.id, id));
    return e;
  }

  async updateTrainingEvaluation(
    id: number,
    data: Partial<TrainingEvaluation>,
  ): Promise<TrainingEvaluation> {
    const [u] = await db
      .update(training_evaluations)
      .set(data)
      .where(eq(training_evaluations.id, id))
      .returning();
    return u;
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

  async createTrainingEvaluation(
    data: InsertTrainingEvaluation,
  ): Promise<TrainingEvaluation> {
    return this.createEvaluation(data);
  }

  async createTrainingCertificate(
    data: InsertTrainingCertificate,
  ): Promise<TrainingCertificate> {
    return this.createCertificate(data);
  }

  async getViolations(): Promise<any[]> {
    return await db.select().from(violations).orderBy(desc(violations.date));
  }

  async createViolation(data: any): Promise<any> {
    const [v] = await db.insert(violations).values(data).returning();
    return v;
  }

  async updateViolation(id: number, data: any): Promise<any> {
    const [v] = await db
      .update(violations)
      .set(data)
      .where(eq(violations.id, id))
      .returning();
    return v;
  }

  async deleteViolation(id: number): Promise<void> {
    await db.delete(violations).where(eq(violations.id, id));
  }

  // ===== مخالفات العمل (Work Violations) =====

  async getWorkViolationTypes(): Promise<any[]> {
    return await db
      .select()
      .from(work_violation_types)
      .orderBy(work_violation_types.sort_order, work_violation_types.id);
  }

  async updateWorkViolationType(id: number, data: any): Promise<any> {
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .update(work_violation_types)
        .set(data)
        .where(eq(work_violation_types.id, id))
        .returning();
      if (
        row &&
        (data.points !== undefined || data.repeat_points !== undefined)
      ) {
        // إعادة احتساب كل سلاسل هذا النوع بعد تغيير النقاط
        const employees = await tx
          .selectDistinct({ employee_id: work_violations.employee_id })
          .from(work_violations)
          .where(eq(work_violations.violation_type_id, id));
        for (const e of employees) {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(1006, ${e.employee_id})`,
          );
          await this.recomputeWorkViolationSeries(tx, e.employee_id, id);
        }
      }
      return row;
    });
  }

  async getWorkViolationSettings(): Promise<any> {
    const [row] = await db
      .select()
      .from(work_violation_settings)
      .where(eq(work_violation_settings.id, 1));
    if (row) return row;
    const [created] = await db
      .insert(work_violation_settings)
      .values({ id: 1 })
      .onConflictDoNothing()
      .returning();
    return (
      created ||
      (
        await db
          .select()
          .from(work_violation_settings)
          .where(eq(work_violation_settings.id, 1))
      )[0]
    );
  }

  async updateWorkViolationSettings(
    data: { point_value?: number; repeat_window_days?: number },
    updatedBy: number | null,
  ): Promise<any> {
    await this.getWorkViolationSettings();
    const set: any = { updated_by: updatedBy, updated_at: new Date() };
    if (data.point_value !== undefined)
      set.point_value = data.point_value.toFixed(2);
    if (data.repeat_window_days !== undefined)
      set.repeat_window_days = data.repeat_window_days;
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .update(work_violation_settings)
        .set(set)
        .where(eq(work_violation_settings.id, 1))
        .returning();
      // إعادة احتساب كل السلاسل بعد تغيير قيمة النقطة أو نافذة التكرار
      const pairs = await tx
        .selectDistinct({
          employee_id: work_violations.employee_id,
          violation_type_id: work_violations.violation_type_id,
        })
        .from(work_violations);
      const lockedEmployees = new Set<number>();
      for (const p of pairs) {
        if (!lockedEmployees.has(p.employee_id)) {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(1006, ${p.employee_id})`,
          );
          lockedEmployees.add(p.employee_id);
        }
        await this.recomputeWorkViolationSeries(
          tx,
          p.employee_id,
          p.violation_type_id,
        );
      }
      return row;
    });
  }

  // العمال المسموح تسجيل مخالفات عليهم: أقسام الفيلم/الطباعة/التقطيع فقط.
  // users.section_id عدد صحيح يطابق الجزء الرقمي من sections.id (SEC03 → 3).
  async getWorkViolationWorkers(): Promise<any[]> {
    const productionSections = ["SEC03", "SEC04", "SEC05"];
    const sectionRows = await db
      .select()
      .from(sections)
      .where(inArray(sections.id, productionSections));
    const numericIds = sectionRows
      .map((s) => parseInt(String(s.id).replace(/\D/g, ""), 10))
      .filter((n) => Number.isFinite(n));
    if (numericIds.length === 0) return [];
    const sectionNameById = new Map(
      sectionRows.map((s) => [
        parseInt(String(s.id).replace(/\D/g, ""), 10),
        s.name_ar || s.name,
      ]),
    );
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        display_name: users.display_name,
        display_name_ar: users.display_name_ar,
        section_id: users.section_id,
      })
      .from(users)
      .where(
        and(eq(users.status, "active"), inArray(users.section_id, numericIds)),
      )
      .orderBy(users.section_id, users.display_name_ar);
    return rows.map((u) => ({
      ...u,
      section_name_ar: sectionNameById.get(u.section_id as number) || null,
    }));
  }

  // ماكينات أقسام الإنتاج الثلاثة (للربط الاختياري بالمخالفة)
  async getWorkViolationMachines(): Promise<any[]> {
    return await db
      .select({
        id: machines.id,
        name: machines.name,
        name_ar: machines.name_ar,
        section_id: machines.section_id,
      })
      .from(machines)
      .where(inArray(machines.section_id, ["SEC03", "SEC04", "SEC05"]))
      .orderBy(machines.section_id, machines.id);
  }

  async getWorkViolations(filters: {
    employeeId?: number;
    from?: Date;
    to?: Date;
  }): Promise<any[]> {
    const employeeUser = alias(users, "wv_employee");
    const reporterUser = alias(users, "wv_reporter");
    const waiverUser = alias(users, "wv_waiver");
    const conditions = [] as any[];
    if (filters.employeeId)
      conditions.push(eq(work_violations.employee_id, filters.employeeId));
    if (filters.from)
      conditions.push(gte(work_violations.occurred_at, filters.from));
    if (filters.to)
      conditions.push(lte(work_violations.occurred_at, filters.to));
    return await db
      .select({
        id: work_violations.id,
        employee_id: work_violations.employee_id,
        employee_name: sql<string>`COALESCE(${employeeUser.display_name_ar}, ${employeeUser.display_name}, ${employeeUser.username})`,
        employee_section_id: employeeUser.section_id,
        violation_type_id: work_violations.violation_type_id,
        violation_type_name: work_violation_types.name_ar,
        occurred_at: work_violations.occurred_at,
        note: work_violations.note,
        machine_id: work_violations.machine_id,
        machine_name: sql<
          string | null
        >`COALESCE(${machines.name_ar}, ${machines.name})`,
        production_order_id: work_violations.production_order_id,
        repeat_index: work_violations.repeat_index,
        points: work_violations.points,
        deduction_amount: work_violations.deduction_amount,
        waived: work_violations.waived,
        waived_by: work_violations.waived_by,
        waived_at: work_violations.waived_at,
        waive_reason: work_violations.waive_reason,
        waived_by_name: sql<
          string | null
        >`COALESCE(${waiverUser.display_name_ar}, ${waiverUser.display_name}, ${waiverUser.username})`,
        reported_by: work_violations.reported_by,
        reported_by_name: sql<
          string | null
        >`COALESCE(${reporterUser.display_name_ar}, ${reporterUser.display_name}, ${reporterUser.username})`,
        created_at: work_violations.created_at,
      })
      .from(work_violations)
      .innerJoin(
        work_violation_types,
        eq(work_violations.violation_type_id, work_violation_types.id),
      )
      .innerJoin(employeeUser, eq(work_violations.employee_id, employeeUser.id))
      .leftJoin(reporterUser, eq(work_violations.reported_by, reporterUser.id))
      .leftJoin(waiverUser, eq(work_violations.waived_by, waiverUser.id))
      .leftJoin(machines, eq(work_violations.machine_id, machines.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(work_violations.occurred_at), desc(work_violations.id));
  }

  // يعيد احتساب سلسلة التكرار كاملة لموظف + نوع مخالفة داخل نفس المعاملة
  // (يُستدعى بعد أي إنشاء/تعديل/حذف/تجاوز حتى تبقى النقاط والخصومات صحيحة)
  private async recomputeWorkViolationSeries(
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

  async createWorkViolation(
    data: {
      employee_id: number;
      violation_type_id: number;
      occurred_at: Date;
      note?: string | null;
      machine_id?: string | null;
      production_order_id?: number | null;
    },
    reportedBy: number,
  ): Promise<any> {
    return await db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(1006, ${data.employee_id})`,
      );
      const [inserted] = await tx
        .insert(work_violations)
        .values({
          employee_id: data.employee_id,
          violation_type_id: data.violation_type_id,
          occurred_at: data.occurred_at,
          note: data.note ?? null,
          machine_id: data.machine_id ?? null,
          production_order_id: data.production_order_id ?? null,
          reported_by: reportedBy,
        })
        .returning();
      await this.recomputeWorkViolationSeries(
        tx,
        data.employee_id,
        data.violation_type_id,
      );
      const [row] = await tx
        .select()
        .from(work_violations)
        .where(eq(work_violations.id, inserted.id));
      return row;
    });
  }

  async updateWorkViolation(id: number, data: any): Promise<any> {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(work_violations)
        .where(eq(work_violations.id, id));
      if (!existing) throw new Error("المخالفة غير موجودة");
      const employeeId = data.employee_id ?? existing.employee_id;
      const typeId = data.violation_type_id ?? existing.violation_type_id;
      const occurredAt = data.occurred_at
        ? new Date(data.occurred_at)
        : existing.occurred_at;
      const lockIds = Array.from(
        new Set([existing.employee_id, employeeId]),
      ).sort((a, b) => a - b);
      for (const lockId of lockIds) {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(1006, ${lockId})`);
      }
      await tx
        .update(work_violations)
        .set({
          employee_id: employeeId,
          violation_type_id: typeId,
          occurred_at: occurredAt,
          note: data.note !== undefined ? data.note : existing.note,
          machine_id:
            data.machine_id !== undefined
              ? data.machine_id
              : existing.machine_id,
          production_order_id:
            data.production_order_id !== undefined
              ? data.production_order_id
              : existing.production_order_id,
        })
        .where(eq(work_violations.id, id));
      // إعادة احتساب السلسلة القديمة والجديدة إن اختلف الموظف أو النوع
      const pairs = new Set<string>([
        `${existing.employee_id}:${existing.violation_type_id}`,
        `${employeeId}:${typeId}`,
      ]);
      for (const pair of Array.from(pairs)) {
        const [empId, vtId] = pair.split(":").map(Number);
        await this.recomputeWorkViolationSeries(tx, empId, vtId);
      }
      const [row] = await tx
        .select()
        .from(work_violations)
        .where(eq(work_violations.id, id));
      return row;
    });
  }

  async deleteWorkViolation(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(work_violations)
        .where(eq(work_violations.id, id));
      if (!existing) return;
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(1006, ${existing.employee_id})`,
      );
      await tx.delete(work_violations).where(eq(work_violations.id, id));
      await this.recomputeWorkViolationSeries(
        tx,
        existing.employee_id,
        existing.violation_type_id,
      );
    });
  }

  async setWorkViolationWaived(
    id: number,
    waived: boolean,
    byUserId: number,
    reason?: string | null,
  ): Promise<any> {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(work_violations)
        .where(eq(work_violations.id, id));
      if (!existing) throw new Error("المخالفة غير موجودة");
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(1006, ${existing.employee_id})`,
      );
      await tx
        .update(work_violations)
        .set(
          waived
            ? {
                waived: true,
                waived_by: byUserId,
                waived_at: new Date(),
                waive_reason: reason ?? null,
              }
            : {
                waived: false,
                waived_by: null,
                waived_at: null,
                waive_reason: null,
              },
        )
        .where(eq(work_violations.id, id));
      await this.recomputeWorkViolationSeries(
        tx,
        existing.employee_id,
        existing.violation_type_id,
      );
      const [row] = await tx
        .select()
        .from(work_violations)
        .where(eq(work_violations.id, id));
      return row;
    });
  }

  async getUserRequests(): Promise<any[]> {
    return await db
      .select()
      .from(user_requests)
      .orderBy(desc(user_requests.created_at));
  }

  async createUserRequest(data: any): Promise<any> {
    const [r] = await db.insert(user_requests).values(data).returning();
    return r;
  }

  async updateUserRequest(id: number, data: any): Promise<any> {
    const [u] = await db
      .update(user_requests)
      .set(data)
      .where(eq(user_requests.id, id))
      .returning();
    return u;
  }

  async deleteUserRequest(id: number): Promise<void> {
    await db.delete(user_requests).where(eq(user_requests.id, id));
  }

  async updatePerformanceReview(
    id: number,
    data: Partial<PerformanceReview>,
  ): Promise<PerformanceReview> {
    const [u] = await db
      .update(performance_reviews)
      .set(data)
      .where(eq(performance_reviews.id, id))
      .returning();
    return u;
  }

  async createPerformanceCriteria(
    data: InsertPerformanceCriteria,
  ): Promise<PerformanceCriteria> {
    const [c] = await db.insert(performance_criteria).values(data).returning();
    return c;
  }

  async getUserPerformanceStats(
    userId?: number,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    if (userId) {
      const reviews = await this.getPerformanceReviews(userId);
      return { userId, reviewCount: reviews.length, averageScore: 0 };
    }
    return { reviewCount: 0, averageScore: 0 };
  }

  async getRolePerformanceStats(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    return { count: 0, averageScore: 0, roles: [] };
  }

  async getUsersPerformanceBySection(
    section: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any[]> {
    return [];
  }

  async getSystemSettingByKey(key: string): Promise<SystemSetting | undefined> {
    const [s] = await db
      .select()
      .from(system_settings)
      .where(eq(system_settings.setting_key, key));
    return s;
  }

  async createSystemSetting(data: InsertSystemSetting): Promise<SystemSetting> {
    const [s] = await db.insert(system_settings).values(data).returning();
    return s;
  }

  async createInventoryItem(data: InsertInventory): Promise<Inventory> {
    const [i] = await db.insert(inventory).values(data).returning();
    return i;
  }

  async updateInventoryItem(
    id: number,
    data: Partial<Inventory>,
  ): Promise<Inventory> {
    return this.updateInventory(id, data);
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async deleteInventoryMovement(id: number): Promise<void> {
    await db.delete(inventory_movements).where(eq(inventory_movements.id, id));
  }

  async createLeaveType(data: InsertLeaveType): Promise<LeaveType> {
    const [t] = await db.insert(leave_types).values(data).returning();
    return t;
  }

  async createLeaveBalance(data: InsertLeaveBalance): Promise<LeaveBalance> {
    const [b] = await db.insert(leave_balances).values(data).returning();
    return b;
  }

  async updateLeaveBalance(
    id: number,
    data: Partial<LeaveBalance>,
  ): Promise<LeaveBalance> {
    const [u] = await db
      .update(leave_balances)
      .set(data)
      .where(eq(leave_balances.id, id))
      .returning();
    return u;
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

  // Auto-complete the parent order once all of its production orders are
  // completed. Centralizes the rule so every path that completes a production
  // order (cutting completion, roll products that skip cutting, etc.) keeps the
  // order status in sync — not just the production-order PATCH route.
  async maybeCompleteParentOrder(
    productionOrderId: number,
  ): Promise<void> {
    try {
      const [po] = await db
        .select({ order_id: production_orders.order_id })
        .from(production_orders)
        .where(eq(production_orders.id, productionOrderId));
      if (!po?.order_id) return;

      const siblings = await db
        .select({ status: production_orders.status })
        .from(production_orders)
        .where(eq(production_orders.order_id, po.order_id));
      const allCompleted =
        siblings.length > 0 &&
        siblings.every((s: any) => s.status === "completed");
      if (!allCompleted) return;

      const [parent] = await db
        .select({
          status: orders.status,
          order_number: orders.order_number,
        })
        .from(orders)
        .where(eq(orders.id, po.order_id));
      if (parent && parent.status === "in_production") {
        await db
          .update(orders)
          .set({ status: "completed", previous_status: parent.status })
          .where(
            and(
              eq(orders.id, po.order_id),
              eq(orders.status, "in_production"),
            ),
          );
        console.log(
          `✅ تم إكمال الطلب ${parent.order_number} تلقائياً - جميع أوامر الإنتاج مكتملة`,
        );
      }
    } catch (e) {
      console.error("خطأ في الإكمال التلقائي للطلب:", e);
    }
  }

  // Generate (idempotently) the per-order batch number when a production order
  // reaches its final stage. Format: B-<production_order_number>-<YYYYMMDD>.
  // Concurrency-safe: the conditional UPDATE + unique index guarantee a single
  // value even if two completion paths race.
  async ensureBatchNumber(
    productionOrderId: number,
  ): Promise<string | null> {
    try {
      const [po] = await db
        .select({
          batch_number: production_orders.batch_number,
          production_order_number:
            production_orders.production_order_number,
        })
        .from(production_orders)
        .where(eq(production_orders.id, productionOrderId));
      if (!po) return null;
      if (po.batch_number) return po.batch_number;

      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      // Column is varchar(50). Keep the date suffix intact (uniqueness-relevant)
      // and trim only the PO-number segment if the candidate would overflow.
      const datePart = `${y}${m}${d}`;
      const maxLen = 50;
      const fixedLen = 3 + datePart.length; // "B-" + "-" + date
      const pon = String(po.production_order_number ?? "").slice(
        0,
        Math.max(1, maxLen - fixedLen),
      );
      const candidate = `B-${pon}-${datePart}`;

      const [updated] = await db
        .update(production_orders)
        .set({ batch_number: candidate } as any)
        .where(
          and(
            eq(production_orders.id, productionOrderId),
            isNull(production_orders.batch_number),
          ),
        )
        .returning({ batch_number: production_orders.batch_number });
      if (updated?.batch_number) {
        console.log(
          `🏷️ تم توليد رقم الباتش ${updated.batch_number} لأمر الإنتاج ${productionOrderId}`,
        );
        return updated.batch_number;
      }

      // Another path set it concurrently — re-read the persisted value.
      const [again] = await db
        .select({ batch_number: production_orders.batch_number })
        .from(production_orders)
        .where(eq(production_orders.id, productionOrderId));
      return again?.batch_number ?? null;
    } catch (e) {
      console.error("خطأ في توليد رقم الباتش:", e);
      return null;
    }
  }

  // Aggregate the distinct operator names + per-stage dates for a production
  // order. Shared by the batch-label payload and the batch-lookup page.
  private async getBatchOperators(productionOrderId: number): Promise<{
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
  private resolvePackageableKg(po: any): number {
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

  // Build the full payload the batch label needs: batch number (generated if
  // missing for a completed order), product/customer info, net quantity,
  // packaging units for the item, operator names + production date.
  async getBatchLabelData(productionOrderId: number): Promise<any> {
    const [po] = await this.getAllProductionOrders({ id: productionOrderId });
    if (!po) return null;

    // Batch/packaging labels can be printed while an order is still in
    // progress (operators stick labels on packages as they pack), so we no
    // longer gate on completion. The packageable quantity falls back to the
    // produced-so-far weight via resolvePackageableKg, and the batch number is
    // generated on first print (idempotent). Completed-only surfaces still gate
    // the *button* on completion; only operator boards print mid-production.
    const batchNumber = await this.ensureBatchNumber(productionOrderId);
    const operators = await this.getBatchOperators(productionOrderId);
    const packagingUnits = po.item_id
      ? await this.getPackagingUnitsByItem(po.item_id)
      : [];

    // net_quantity_kg is not always persisted, so fall back to the actual
    // produced weight (then final/required) to derive the packageable amount.
    const packageableKg = this.resolvePackageableKg(po);

    return {
      ready: true,
      batch_number: batchNumber,
      production_order_id: po.id,
      production_order_number: po.production_order_number,
      order_number: po.order_number,
      customer_name: po.customer_name,
      customer_name_ar: po.customer_name_ar,
      item_id: po.item_id,
      item_name: po.item_name,
      item_name_ar: po.item_name_ar,
      size_caption: po.size_caption,
      net_quantity_kg: packageableKg,
      final_quantity_kg: po.final_quantity_kg,
      production_date:
        operators.cutting_date ||
        operators.printing_date ||
        operators.film_date,
      packaging_units: packagingUnits,
      operators,
    };
  }

  // Traceability lookup for the authenticated batch-scan page: resolve a batch
  // number to its production order and return per-stage dates + operator names.
  async getBatchTraceability(batchNumber: string): Promise<any> {
    const [po] = await db
      .select({
        id: production_orders.id,
        production_order_number:
          production_orders.production_order_number,
        batch_number: production_orders.batch_number,
        net_quantity_kg: production_orders.net_quantity_kg,
        produced_quantity_kg: production_orders.produced_quantity_kg,
        final_quantity_kg: production_orders.final_quantity_kg,
        quantity_kg: production_orders.quantity_kg,
        order_number: orders.order_number,
        customer_name: customers.name,
        customer_name_ar: customers.name_ar,
        size_caption: customer_products.size_caption,
      })
      .from(production_orders)
      .leftJoin(orders, eq(production_orders.order_id, orders.id))
      .leftJoin(customers, eq(orders.customer_id, customers.id))
      .leftJoin(
        customer_products,
        eq(production_orders.customer_product_id, customer_products.id),
      )
      .where(eq(production_orders.batch_number, batchNumber));
    if (!po) return null;

    const productItem = alias(items, "trace_item");
    const [itemRow] = await db
      .select({
        item_name: productItem.name,
        item_name_ar: productItem.name_ar,
      })
      .from(customer_products)
      .leftJoin(productItem, eq(customer_products.item_id, productItem.id))
      .innerJoin(
        production_orders,
        eq(production_orders.customer_product_id, customer_products.id),
      )
      .where(eq(production_orders.id, po.id));

    const operators = await this.getBatchOperators(po.id);

    return {
      batch_number: po.batch_number,
      production_order_number: po.production_order_number,
      order_number: po.order_number,
      customer_name: po.customer_name,
      customer_name_ar: po.customer_name_ar,
      item_name: itemRow?.item_name,
      item_name_ar: itemRow?.item_name_ar,
      size_caption: po.size_caption,
      net_quantity_kg: this.resolvePackageableKg(po),
      stages: [
        {
          stage: "film",
          date: operators.film_date,
          operators: operators.film,
        },
        {
          stage: "printing",
          date: operators.printing_date,
          operators: operators.printing,
        },
        {
          stage: "cutting",
          date: operators.cutting_date,
          operators: operators.cutting,
        },
      ],
    };
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

  async getAttendance(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<Attendance[]> {
    if (!opts) {
      return await db.select().from(attendance).orderBy(desc(attendance.date));
    }
    const limit = Math.max(1, Math.min(opts.limit ?? 50, 500));
    const offset = Math.max(0, opts.offset ?? 0);
    return await db
      .select()
      .from(attendance)
      .orderBy(desc(attendance.date))
      .limit(limit)
      .offset(offset);
  }

  async getDashboardStats(): Promise<any> {
    const [orderCount] = await db.select({ count: count() }).from(orders);
    const [productionCount] = await db
      .select({ count: count() })
      .from(production_orders);
    const [rollCount] = await db.select({ count: count() }).from(rolls);
    return {
      totalOrders: orderCount?.count || 0,
      totalProductionOrders: productionCount?.count || 0,
      totalRolls: rollCount?.count || 0,
    };
  }

  async getProductionStats(): Promise<any> {
    return { total: 0, completed: 0, inProgress: 0 };
  }

  async getAdvancedMetrics(): Promise<any> {
    return {};
  }

  async getWasteAnalysis(filters?: any): Promise<any> {
    return { totalWaste: 0, byType: {} };
  }

  async calculateWasteStatistics(productionOrderId?: number): Promise<any> {
    if (productionOrderId) {
      const wasteRecords = await db
        .select()
        .from(waste)
        .where(eq(waste.production_order_id, productionOrderId));
      const totalWaste = wasteRecords.reduce(
        (sum: number, w: any) => sum + parseFloat(w.weight_kg || "0"),
        0,
      );
      return {
        productionOrderId,
        total: totalWaste,
        percentage: 0,
        records: wasteRecords,
      };
    }
    return { total: 0, percentage: 0 };
  }

  async getActiveProductionOrdersForOperator(userId: number): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT
        po.id,
        po.production_order_number,
        po.order_id,
        po.customer_product_id,
        po.quantity_kg,
        CASE WHEN po.final_quantity_kg IS NOT NULL AND po.final_quantity_kg > 0 THEN po.final_quantity_kg ELSE po.quantity_kg END AS final_quantity_kg,
        po.produced_quantity_kg,
        po.overrun_percentage,
        po.status,
        po.assigned_operator_id,
        po.assigned_machine_id,
        po.film_completed,
        po.printing_completed,
        po.cutting_completed,
        po.is_final_roll_created,
        po.production_start_time,
        po.production_end_time,
        po.production_time_minutes,
        po.film_completion_percentage,
        po.created_at,
        o.order_number,
        o.status AS order_status,
        o.created_at AS order_date,
        c.id AS customer_id,
        COALESCE(c.name_ar, c.name) AS customer_name,
        c.name_ar AS customer_name_ar,
        c.name AS customer_name_en,
        COALESCE(sr.display_name_ar, sr.display_name, sr.full_name) AS sales_rep_name,
        sr.display_name_ar AS sales_rep_name_ar,
        COALESCE(sr.display_name, sr.full_name) AS sales_rep_name_en,
        COALESCE(i.name_ar, i.name) AS product_name,
        i.name_ar AS product_name_ar,
        i.name AS product_name_en,
        cp.category_id,
        cp.size_caption,
        cp.raw_material,
        cp.thickness,
        cp.master_batch_id,
        COALESCE(cp.is_printed, false) AS is_printed,
        COALESCE(mb.name_ar, mb.name, cp.master_batch_id) AS master_batch_name,
        COALESCE(mb.name_ar, mb.name, cp.master_batch_id) AS master_batch_name_ar,
        COALESCE(mb.name, mb.name_ar, cp.master_batch_id) AS master_batch_name_en,
        mb.color_hex AS master_batch_color_hex,
        COUNT(r.id) AS rolls_count,
        COALESCE(SUM(r.weight_kg), 0) AS total_weight_produced,
        GREATEST(0, (CASE WHEN po.final_quantity_kg IS NOT NULL AND po.final_quantity_kg > 0 THEN po.final_quantity_kg ELSE po.quantity_kg END)::numeric - COALESCE(SUM(r.weight_kg), 0)) AS remaining_quantity
      FROM production_orders po
      JOIN orders o ON o.id = po.order_id
      JOIN customers c ON c.id = o.customer_id
      LEFT JOIN users sr ON sr.id = c.sales_rep_id
      LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
      LEFT JOIN items i ON i.id = cp.item_id
      LEFT JOIN master_batch_colors mb ON mb.id = cp.master_batch_id
      LEFT JOIN rolls r ON r.production_order_id = po.id
      WHERE po.film_completed = false
        AND po.is_final_roll_created = false
        AND po.production_stage = 'film'
        AND (
          po.status = 'active'
          OR (po.status = 'pending' AND o.status = 'in_production')
        )
      GROUP BY po.id, o.id, c.id, sr.id, cp.id, i.id, mb.id
      ORDER BY po.id DESC
    `);
    return result.rows as any[];
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

  async getActiveFactoryLocations(): Promise<FactoryLocation[]> {
    return await db
      .select()
      .from(factory_locations)
      .where(eq(factory_locations.is_active, true));
  }

  async updateFactoryLocation(
    id: number,
    data: Partial<FactoryLocation>,
  ): Promise<FactoryLocation> {
    const [u] = await db
      .update(factory_locations)
      .set(data)
      .where(eq(factory_locations.id, id))
      .returning();
    return u;
  }

  async deleteFactoryLocation(id: number): Promise<void> {
    await db.delete(factory_locations).where(eq(factory_locations.id, id));
  }

  async getAllMixingBatches(): Promise<MixingBatch[]> {
    return this.getMixingBatches();
  }

  async updateMixingBatch(id: number, data: any): Promise<MixingBatch> {
    const [u] = await db
      .update(mixing_batches)
      .set(data)
      .where(eq(mixing_batches.id, id))
      .returning();
    return u;
  }

  async updateMixingBatchWithIngredients(
    id: number,
    batchData: any,
    ingredients: InsertBatchIngredient[],
  ): Promise<MixingBatch> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(mixing_batches)
        .set(batchData)
        .where(eq(mixing_batches.id, id))
        .returning();
      await tx
        .delete(batch_ingredients)
        .where(eq(batch_ingredients.batch_id, id));
      if (ingredients.length > 0) {
        const ingredientsToInsert = ingredients.map((i) => ({
          ...i,
          batch_id: id,
        }));
        await tx.insert(batch_ingredients).values(ingredientsToInsert);
      }
      return updated;
    });
  }

  async deleteMixingBatch(id: number): Promise<void> {
    await db.delete(mixing_batches).where(eq(mixing_batches.id, id));
  }

  async updateBatchIngredientActuals(
    batchId: number,
    ingredients: any[],
  ): Promise<void> {
    for (const ingredient of ingredients) {
      if (ingredient.id) {
        await db
          .update(batch_ingredients)
          .set(ingredient)
          .where(eq(batch_ingredients.id, ingredient.id));
      }
    }
  }

  async completeMixingBatch(id: number, data?: any): Promise<MixingBatch> {
    return this.updateMixingBatchStatus(id, "completed");
  }

  async getMixingRecipes(): Promise<any[]> {
    return [];
  }

  async createMixingRecipe(data: any): Promise<any> {
    return data;
  }

  async deleteMasterBatchColor(id: string | number): Promise<void> {
    await db
      .delete(master_batch_colors)
      .where(eq(master_batch_colors.id, String(id)));
  }

  async updateMasterBatchColor(
    id: string | number,
    data: Partial<MasterBatchColor>,
  ): Promise<MasterBatchColor> {
    const [u] = await db
      .update(master_batch_colors)
      .set(data)
      .where(eq(master_batch_colors.id, String(id)))
      .returning();
    return u;
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

  async activateProductionOrder(
    id: number,
    data?: any,
  ): Promise<ProductionOrder> {
    return this.updateProductionOrder(id, { status: "active", ...data });
  }

  async updateProductionOrderAssignment(
    id: number,
    data: any,
  ): Promise<ProductionOrder> {
    return this.updateProductionOrder(id, data);
  }

  async updateProductionOrderCompletionPercentages(
    id: number,
    data?: any,
  ): Promise<ProductionOrder> {
    return withDatabaseErrorHandling(
      async () => {
        // Combine PO lookup + rolls aggregate into a single round-trip.
        const [stats] = await db
          .execute(
            sql`
          SELECT
            po.final_quantity_kg,
            po.quantity_kg,
            po.film_completed,
            (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%') AS is_roll_order,
            agg.total_rolls,
            agg.total_weight,
            agg.printing_weight,
            agg.cutting_weight,
            agg.film_rolls,
            agg.printing_rolls,
            agg.cutting_rolls,
            agg.done_rolls
          FROM production_orders po
          LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
          LEFT JOIN items i ON i.id = cp.item_id
          LEFT JOIN LATERAL (
            SELECT
              COUNT(*) AS total_rolls,
              COALESCE(SUM(weight_kg), 0) AS total_weight,
              COALESCE(SUM(CASE WHEN stage IN ('printing', 'done') THEN weight_kg ELSE 0 END), 0) AS printing_weight,
              COALESCE(SUM(CASE WHEN stage = 'done' THEN COALESCE(cut_weight_total_kg, weight_kg) + COALESCE(waste_kg, 0) ELSE 0 END), 0) AS cutting_weight,
              COALESCE(SUM(CASE WHEN stage = 'film' THEN 1 ELSE 0 END), 0) AS film_rolls,
              COALESCE(SUM(CASE WHEN stage = 'printing' THEN 1 ELSE 0 END), 0) AS printing_rolls,
              COALESCE(SUM(CASE WHEN stage = 'cutting' THEN 1 ELSE 0 END), 0) AS cutting_rolls,
              COALESCE(SUM(CASE WHEN stage = 'done' THEN 1 ELSE 0 END), 0) AS done_rolls
            FROM rolls
            WHERE production_order_id = po.id
          ) agg ON TRUE
          WHERE po.id = ${id}
        `,
          )
          .then((r) => r.rows as any[]);

        if (!stats) throw new Error(`أمر الإنتاج ${id} غير موجود`);

        const finalQty = parseFloat(stats.final_quantity_kg?.toString() || "0");
        const targetKg =
          finalQty > 0
            ? finalQty
            : parseFloat(stats.quantity_kg?.toString() || "0");

        const totalRolls = parseInt(stats?.total_rolls || "0");
        const totalWeight = parseFloat(stats?.total_weight || "0");
        const printingWeight = parseFloat(stats?.printing_weight || "0");
        const cuttingWeight = parseFloat(stats?.cutting_weight || "0");
        const filmRolls = parseInt(stats?.film_rolls || "0");
        const printingRolls = parseInt(stats?.printing_rolls || "0");
        const cuttingRolls = parseInt(stats?.cutting_rolls || "0");
        const doneRolls = parseInt(stats?.done_rolls || "0");

        const filmPct =
          targetKg > 0 ? Math.min(100, (totalWeight / targetKg) * 100) : 0;
        const printPct =
          targetKg > 0 ? Math.min(100, (printingWeight / targetKg) * 100) : 0;
        const cutPct =
          targetKg > 0 ? Math.min(100, (cuttingWeight / targetKg) * 100) : 0;

        // مرحلة أمر الإنتاج التلقائية (مستقلة عن status) - تتبع حرفياً قواعد المهمة:
        // - done    : عندما تكون جميع الرولات في 'done'
        // - cutting : عندما لا يوجد أي رول في مرحلة 'film' (وليست كل الرولات منتهية)
        // - printing: عندما يصل produced_quantity_kg إلى final_quantity_kg ولا يزال هناك رول في 'film'
        // - film    : افتراضياً (لم يكتمل إنتاج الفيلم بعد)
        // Suppress unused-variable warnings (kept for SQL aggregation clarity)
        void printingRolls;
        void cuttingRolls;
        // Film is "done" only when the operator explicitly closed it (final roll
        // -> film_completed) OR the produced weight reached the target. This must
        // gate the move past 'film': inline-printed rolls are created directly at
        // stage='printing', so `filmRolls === 0` is NOT a reliable signal that
        // film production finished — without this guard a single inline roll would
        // push an unfinished order straight to 'cutting' and drop it off the film
        // board before the required quantity is produced.
        const filmCompleted =
          stats?.film_completed === true || stats?.film_completed === "t";
        const filmDone =
          filmCompleted || (targetKg > 0 && totalWeight >= targetKg - 0.001);
        const isRollOrder =
          stats?.is_roll_order === true || stats?.is_roll_order === "t";
        let computedStage: "film" | "printing" | "cutting" | "done" = "film";
        if (totalRolls > 0) {
          if (isRollOrder) {
            // Plastic-roll products never enter cutting. Production of the
            // film roll (non-printed) or the printed roll ends straight at
            // 'done'. The order finishes once film production is closed AND all
            // its rolls have reached 'done'. While film is still being produced
            // it stays on the film board; once the target is reached but some
            // printed rolls are still awaiting printing it shows on printing.
            if (filmDone && doneRolls === totalRolls) {
              computedStage = "done";
            } else if (filmDone) {
              computedStage = "printing";
            } else {
              computedStage = "film";
            }
          } else if (doneRolls === totalRolls) {
            computedStage = "done";
          } else if (filmRolls === 0 && filmDone) {
            computedStage = "cutting";
          } else if (targetKg > 0 && totalWeight >= targetKg - 0.001) {
            computedStage = "printing";
          } else {
            computedStage = "film";
          }
        }

        const setValues: any = {
          produced_quantity_kg: totalWeight.toFixed(3),
          film_completion_percentage: filmPct.toFixed(2),
          printing_completion_percentage: printPct.toFixed(2),
          cutting_completion_percentage: cutPct.toFixed(2),
          production_stage: computedStage,
        };
        // Roll products skip cutting, so completion is decided here rather than
        // by completeCutting. Mark the order completed when it reaches 'done'.
        if (isRollOrder && computedStage === "done") {
          setValues.status = "completed";
        }

        const [updated] = await db
          .update(production_orders)
          .set(setValues)
          .where(eq(production_orders.id, id))
          .returning();
        invalidateProductionCache();
        // Generate the batch number once the order reaches its final stage,
        // for every workflow (roll products and standard cut orders alike).
        if (computedStage === "done") {
          await this.ensureBatchNumber(id);
        }
        if (setValues.status === "completed") {
          await this.maybeCompleteParentOrder(id);
        }
        return updated;
      },
      "updateProductionOrderCompletionPercentages",
      `تحديث نسبة اكتمال أمر الإنتاج ${id}`,
    );
  }

  async getProductionOrdersStagesSummary(): Promise<
    Array<{
      stage: string;
      count: number;
      remaining_kg: number;
      target_kg: number;
      produced_kg: number;
    }>
  > {
    return withDatabaseErrorHandling(
      async () => {
        const result = await db.execute(sql`
          SELECT
            production_stage AS stage,
            COUNT(*)::int AS count,
            COALESCE(SUM(
              CASE
                WHEN final_quantity_kg::numeric > produced_quantity_kg::numeric
                THEN final_quantity_kg::numeric - produced_quantity_kg::numeric
                ELSE 0
              END
            ), 0) AS remaining_kg,
            COALESCE(SUM(final_quantity_kg::numeric), 0) AS target_kg,
            COALESCE(SUM(produced_quantity_kg::numeric), 0) AS produced_kg
          FROM production_orders
          GROUP BY production_stage
        `);
        const rows = result.rows as any[];
        const stages = ["film", "printing", "cutting", "done"];
        return stages.map((stage) => {
          const r = rows.find((x: any) => x.stage === stage);
          return {
            stage,
            count: r ? parseInt(String(r.count)) : 0,
            remaining_kg: r ? parseFloat(String(r.remaining_kg)) : 0,
            target_kg: r ? parseFloat(String(r.target_kg)) : 0,
            produced_kg: r ? parseFloat(String(r.produced_kg)) : 0,
          };
        });
      },
      "getProductionOrdersStagesSummary",
      "جلب ملخص مراحل أوامر الإنتاج",
    );
  }

  async backfillProductionOrderStages(): Promise<number> {
    return withDatabaseErrorHandling(
      async () => {
        // سكربت ترحيل لمرة واحدة: يحسب المرحلة الصحيحة لكل أمر إنتاج
        // من واقع الرولات الحالية، باستخدام نفس قواعد الانتقال التلقائي.
        const result = await db.execute(sql`
          WITH stats AS (
            SELECT
              po.id,
              CASE
                WHEN po.final_quantity_kg::numeric > 0 THEN po.final_quantity_kg::numeric
                ELSE COALESCE(po.quantity_kg::numeric, 0)
              END AS target_kg,
              COALESCE(po.film_completed, false) AS film_completed,
              COALESCE(
                (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%'),
                false
              ) AS is_roll_order,
              COALESCE(SUM(r.weight_kg::numeric), 0) AS total_weight,
              COUNT(r.id)::int AS total_rolls,
              COALESCE(SUM(CASE WHEN r.stage = 'film' THEN 1 ELSE 0 END), 0)::int AS film_rolls,
              COALESCE(SUM(CASE WHEN r.stage = 'printing' THEN 1 ELSE 0 END), 0)::int AS printing_rolls,
              COALESCE(SUM(CASE WHEN r.stage = 'done' THEN 1 ELSE 0 END), 0)::int AS done_rolls
            FROM production_orders po
            LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
            LEFT JOIN items i ON i.id = cp.item_id
            LEFT JOIN rolls r ON r.production_order_id = po.id
            GROUP BY po.id, i.name, i.name_ar
          )
          UPDATE production_orders po
          SET production_stage = CASE
            WHEN s.total_rolls = 0 THEN 'film'
            -- Plastic-roll products skip cutting: done only when film is closed
            -- AND every roll reached 'done'; otherwise printing (target reached,
            -- printed rolls still pending) or film (still producing).
            WHEN s.is_roll_order THEN (
              CASE
                WHEN (s.film_completed
                      OR (s.target_kg > 0 AND s.total_weight >= s.target_kg - 0.001))
                     AND s.done_rolls = s.total_rolls THEN 'done'
                WHEN (s.film_completed
                      OR (s.target_kg > 0 AND s.total_weight >= s.target_kg - 0.001))
                     THEN 'printing'
                ELSE 'film'
              END
            )
            WHEN s.done_rolls = s.total_rolls THEN 'done'
            WHEN s.film_rolls = 0
              AND (s.film_completed
                   OR (s.target_kg > 0 AND s.total_weight >= s.target_kg - 0.001))
              THEN 'cutting'
            WHEN s.target_kg > 0
              AND s.total_weight >= s.target_kg - 0.001 THEN 'printing'
            ELSE 'film'
          END
          FROM stats s
          WHERE po.id = s.id
            AND po.production_stage IS DISTINCT FROM (
              CASE
                WHEN s.total_rolls = 0 THEN 'film'
                WHEN s.is_roll_order THEN (
                  CASE
                    WHEN (s.film_completed
                          OR (s.target_kg > 0 AND s.total_weight >= s.target_kg - 0.001))
                         AND s.done_rolls = s.total_rolls THEN 'done'
                    WHEN (s.film_completed
                          OR (s.target_kg > 0 AND s.total_weight >= s.target_kg - 0.001))
                         THEN 'printing'
                    ELSE 'film'
                  END
                )
                WHEN s.done_rolls = s.total_rolls THEN 'done'
                WHEN s.film_rolls = 0
                  AND (s.film_completed
                       OR (s.target_kg > 0 AND s.total_weight >= s.target_kg - 0.001))
                  THEN 'cutting'
                WHEN s.target_kg > 0
                  AND s.total_weight >= s.target_kg - 0.001 THEN 'printing'
                ELSE 'film'
              END
            )
        `);
        return (result as any).rowCount ?? 0;
      },
      "backfillProductionOrderStages",
      "ترحيل مراحل أوامر الإنتاج",
    );
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

  async optimizeQueueOrder(
    machineId: string | number,
  ): Promise<MachineQueue[]> {
    return this.getMachineQueue(machineId as any);
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

  // Map a utilization percentage to a coarse capacity status label.
  private capacityStatusFromUtilization(util: number): string {
    if (util < 40) return "low";
    if (util < 70) return "moderate";
    if (util < 90) return "high";
    return "overloaded";
  }

  // The kg weight of an order, preferring the final (produced) quantity and
  // falling back to the planned quantity.
  private orderWeightKg(r: any): number {
    const fin = parseFloat(String(r.final_quantity_kg));
    if (!isNaN(fin) && fin > 0) return fin;
    const q = parseFloat(String(r.quantity_kg));
    return !isNaN(q) && q > 0 ? q : 0;
  }

  // Shared per-stage view of the active machines for a department together with
  // their current queue load (kg), work-content hours, and order count. Used by
  // both the capacity-stats endpoint and the smart-distribution engine.
  private async getStageMachineStates(stage: string): Promise<{
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
  private async computeStageDistribution(
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
    // Only machines with a usable production rate can receive work.
    const usable = states.filter((s) => s.rate > 0);

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

  async smartDistributeOrders(algorithm: string, params?: any): Promise<any> {
    const stage = String(params?.stage || "");
    if (!this.getStageInfo(stage)) {
      throw new Error("مرحلة غير صالحة");
    }
    const userId = params?.userId;

    let distributed = 0;
    await db.transaction(async (tx) => {
      // Serialize concurrent distribution applies for the same stage. Without
      // this, two callers could each read the same unassigned backlog and the
      // same MAX(queue_position) and then both insert — producing duplicate
      // order assignments and colliding queue positions. The xact-scoped
      // advisory lock blocks other appliers until this transaction commits, so
      // the compute + position reads below always see fresh committed state.
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtext(${"smart_distribute_" + stage}))`,
      );

      const dist = await this.computeStageDistribution(
        stage,
        algorithm,
        params,
      );
      if (dist.totalOrders === 0) return;

      // Append positions continue after each machine's current maximum.
      const posRows = (
        await tx.execute(sql`
          SELECT machine_id, COALESCE(MAX(queue_position), 0) AS maxpos
          FROM machine_queues
          GROUP BY machine_id
        `)
      ).rows as any[];
      const posMap = new Map<string, number>(
        posRows.map((r) => [String(r.machine_id), Number(r.maxpos) || 0]),
      );

      for (const st of dist.states) {
        if (!st.assigned.length) continue;
        let pos = posMap.get(String(st.machine.id)) || 0;
        for (const o of st.assigned) {
          pos += 1;
          await tx.insert(machine_queues).values({
            machine_id: st.machine.id,
            production_order_id: o.production_order_id,
            queue_position: pos,
            ...(userId ? { assigned_by: userId } : {}),
          } as InsertMachineQueue);
          distributed += 1;
        }
      }
    });

    if (distributed === 0) {
      return {
        success: true,
        distributed: 0,
        message: "لا توجد أوامر غير موزّعة لهذه المرحلة",
      };
    }

    return {
      success: true,
      distributed,
      message: `تم توزيع ${distributed} أمر إنتاج على المكائن`,
    };
  }

  async suggestOptimalDistribution(data?: any): Promise<any> {
    return { suggestions: [] };
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

  async createDatabaseBackup(): Promise<any> {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);

    const tablesResult = await db.execute(sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    const allTableNames = (tablesResult.rows as any[]).map((r) => r.tablename);
    const skipTables = ["session", "sessions", "__drizzle_migrations"];

    const backupData: Record<string, any> = {
      metadata: {
        version: "2.0",
        created_at: now.toISOString(),
        system: "MPBF Manufacturing System",
        table_count: 0,
      },
    };

    for (const tableName of allTableNames) {
      if (skipTables.includes(tableName)) continue;
      try {
        const result = await db.execute(
          sql.raw(`SELECT * FROM "${tableName}"`),
        );
        const rows = result.rows as any[];
        if (tableName === "users") {
          backupData[tableName] = rows.map(({ password, ...rest }) => rest);
        } else {
          backupData[tableName] = rows;
        }
      } catch (err) {
        console.error(`خطأ في نسخ جدول ${tableName}:`, err);
        backupData[tableName] = [];
      }
    }

    backupData.metadata.table_count = allTableNames.filter(
      (t) => !skipTables.includes(t),
    ).length;

    const tableStats: Record<string, number> = {};
    for (const [key, value] of Object.entries(backupData)) {
      if (Array.isArray(value)) {
        tableStats[key] = value.length;
      }
    }

    return {
      filename: `mpbf-backup-${dateStr}.json`,
      data: JSON.stringify(backupData, null, 2),
      stats: tableStats,
    };
  }

  async restoreDatabaseBackup(backupDataInput: any): Promise<any> {
    let backupData: Record<string, any>;
    try {
      backupData =
        typeof backupDataInput === "string"
          ? JSON.parse(backupDataInput)
          : backupDataInput;
    } catch {
      throw new Error(
        "بيانات النسخة الاحتياطية غير صالحة - تنسيق JSON غير صحيح",
      );
    }

    if (!backupData.metadata) {
      throw new Error(
        "بيانات النسخة الاحتياطية غير صالحة - لا توجد بيانات وصفية",
      );
    }

    const skipTables = [
      "session",
      "sessions",
      "__drizzle_migrations",
      "metadata",
    ];

    const tablesResult = await db.execute(sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    const existingTables = new Set(
      (tablesResult.rows as any[]).map((r) => r.tablename),
    );

    const tablesToRestore = Object.keys(backupData).filter(
      (key) =>
        !skipTables.includes(key) &&
        Array.isArray(backupData[key]) &&
        existingTables.has(key),
    );

    const results: { table: string; records: number; status: string }[] = [];
    let totalRestored = 0;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SET session_replication_role = replica");

      for (const tableName of tablesToRestore) {
        try {
          await client.query(`DELETE FROM "${tableName}"`);
        } catch (err: any) {
          console.warn(`تحذير: تعذر حذف بيانات ${tableName}:`, err.message);
        }
      }

      const orderedTables = this.getInsertionOrder(tablesToRestore);

      for (const tableName of orderedTables) {
        const rows = backupData[tableName];
        if (!rows || rows.length === 0) {
          results.push({ table: tableName, records: 0, status: "فارغ" });
          continue;
        }

        try {
          let insertedCount = 0;
          for (const row of rows) {
            const columns = Object.keys(row);
            if (columns.length === 0) continue;

            const quotedCols = columns.map((c) => `"${c}"`).join(", ");
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
            const values = columns.map((c) => {
              const val = row[c];
              if (val === null || val === undefined) return null;
              if (
                typeof val === "object" &&
                !Array.isArray(val) &&
                !(val instanceof Date)
              ) {
                return JSON.stringify(val);
              }
              if (Array.isArray(val)) {
                return JSON.stringify(val);
              }
              return val;
            });

            try {
              await client.query(
                `INSERT INTO "${tableName}" (${quotedCols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                values,
              );
              insertedCount++;
            } catch (rowErr: any) {
              console.warn(
                `تحذير: تعذر إدراج سجل في ${tableName}:`,
                rowErr.message,
              );
            }
          }

          totalRestored += insertedCount;
          results.push({
            table: tableName,
            records: insertedCount,
            status: "تم",
          });
        } catch (tableErr: any) {
          console.error(`خطأ في استعادة جدول ${tableName}:`, tableErr.message);
          results.push({
            table: tableName,
            records: 0,
            status: `خطأ: ${tableErr.message}`,
          });
        }
      }

      for (const tableName of orderedTables) {
        try {
          const seqResult = await client.query(
            `
            SELECT column_name, column_default 
            FROM information_schema.columns 
            WHERE table_name = $1 
            AND table_schema = 'public'
            AND column_default LIKE 'nextval%'
          `,
            [tableName],
          );

          for (const seq of seqResult.rows) {
            const seqMatch = seq.column_default.match(/nextval\('([^']+)'/);
            if (seqMatch) {
              await client.query(`
                SELECT setval('${seqMatch[1]}', COALESCE((SELECT MAX("${seq.column_name}") FROM "${tableName}"), 0) + 1, false)
              `);
            }
          }
        } catch {}
      }

      await client.query("SET session_replication_role = DEFAULT");
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      client.release();
      throw err;
    }
    client.release();

    return {
      restored: true,
      totalRecords: totalRestored,
      tables: results,
      message: `تم استعادة ${totalRestored} سجل في ${results.filter((r) => r.records > 0).length} جدول بنجاح`,
    };
  }

  private getInsertionOrder(tables: string[]): string[] {
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

  async checkDatabaseIntegrity(): Promise<any> {
    return { status: "ok", issues: [] };
  }

  async optimizeTables(): Promise<any> {
    return { optimized: true };
  }

  async cleanupOldData(options?: any): Promise<any> {
    return { cleaned: 0 };
  }

  async exportTableData(
    tableName: string,
    format: string = "csv",
  ): Promise<any> {
    const tableMap: Record<string, any> = {
      customers,
      categories,
      sections,
      items,
      customer_products,
      users,
      roles,
      machines,
      locations,
      suppliers,
      orders,
      production_orders,
      rolls,
      cuts,
      inventory,
      inventory_movements,
      warehouse_receipts,
      warehouse_transactions,
      maintenance_requests,
      maintenance_actions,
      spare_parts,
      consumable_parts,
      waste,
      quality_checks,
      attendance,
      notifications,
    };

    const table = tableMap[tableName];
    if (!table) {
      throw new Error(`الجدول غير موجود: ${tableName}`);
    }

    const rows = await db.select().from(table);

    if (rows.length === 0) {
      if (format === "json") return JSON.stringify([], null, 2);
      if (format === "csv") return "\uFEFF";
      if (format === "excel") {
        const workbook = new ExcelJS.Workbook();
        workbook.addWorksheet(tableName);
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer as ArrayBuffer);
      }
      return "[]";
    }

    const safeRows =
      tableName === "users"
        ? rows.map((r: any) => {
            const { password, ...rest } = r;
            return rest;
          })
        : rows;

    if (format === "json") {
      return JSON.stringify(safeRows, null, 2);
    }

    if (format === "csv") {
      const headers = Object.keys(safeRows[0] as Record<string, unknown>);
      const csvRows = [headers.join(",")];
      for (const row of safeRows) {
        const r = row as Record<string, unknown>;
        csvRows.push(
          headers
            .map((h) => {
              const val = r[h];
              if (val === null || val === undefined) return "";
              const str =
                typeof val === "object" ? JSON.stringify(val) : String(val);
              return str.includes(",") ||
                str.includes('"') ||
                str.includes("\n")
                ? `"${str.replace(/"/g, '""')}"`
                : str;
            })
            .join(","),
        );
      }
      return "\uFEFF" + csvRows.join("\n");
    }

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "نظام إدارة الطلبات";
      workbook.created = new Date();
      const sheet = workbook.addWorksheet(tableName, {
        views: [{ rightToLeft: true }],
      });

      const headers = Object.keys(safeRows[0] as Record<string, unknown>);
      const headerRow = sheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };

      for (const row of safeRows) {
        const r = row as Record<string, unknown>;
        sheet.addRow(
          headers.map((h) => {
            const val = r[h];
            if (val === null || val === undefined) return "";
            if (typeof val === "object") return JSON.stringify(val);
            return val;
          }),
        );
      }

      headers.forEach((_, i) => {
        sheet.getColumn(i + 1).width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer as ArrayBuffer);
    }

    return JSON.stringify(safeRows, null, 2);
  }

  async importTableData(
    tableName: string,
    data: any[],
    format?: string,
  ): Promise<any> {
    const allowedTables = [
      "customers",
      "categories",
      "sections",
      "items",
      "machines",
      "orders",
      "production_orders",
      "rolls",
      "inventory",
      "inventory_movements",
      "warehouse_receipts",
      "warehouse_transactions",
      "maintenance_requests",
      "maintenance_actions",
      "spare_parts",
      "consumable_parts",
      "waste",
      "quality_checks",
      "attendance",
      "notifications",
    ];
    if (!allowedTables.includes(tableName)) {
      throw new Error(`الجدول غير مسموح باستيراد البيانات إليه: ${tableName}`);
    }

    if (!Array.isArray(data) || data.length === 0) {
      return { imported: 0, count: 0 };
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      try {
        const columns = Object.keys(record).filter(
          (k) => record[k] !== undefined,
        );
        if (columns.length === 0) continue;

        const colNamesSql = sql.raw(
          columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(", "),
        );
        const valuesSql = sql.join(
          columns.map((k) => sql`${record[k]}`),
          sql.raw(", "),
        );

        await db.execute(
          sql`INSERT INTO ${sql.raw(`"${tableName}"`)} (${colNamesSql}) VALUES (${valuesSql})`,
        );
        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return {
      imported,
      count: imported,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async getBackupFile(backupId: string): Promise<any> {
    return null;
  }

  async getProductionOrdersByStatus(
    status: string,
  ): Promise<ProductionOrder[]> {
    return await db
      .select()
      .from(production_orders)
      .where(eq(production_orders.status, status))
      .orderBy(desc(production_orders.id));
  }

  async getItems(): Promise<Item[]> {
    return this.getAllItems();
  }

  async getInventoryItems(): Promise<Inventory[]> {
    return this.getAllInventory();
  }

  async getInventoryByItemId(
    itemId: string | number,
  ): Promise<Inventory | undefined> {
    const [i] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.item_id, String(itemId)));
    return i;
  }

  async getInventoryStats(): Promise<any> {
    const [total] = await db.select({ count: count() }).from(inventory);
    return { totalItems: total?.count || 0, lowStock: 0 };
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

  async getMasterBatchColorById(
    id: string | number,
  ): Promise<MasterBatchColor | undefined> {
    const [c] = await db
      .select()
      .from(master_batch_colors)
      .where(eq(master_batch_colors.id, String(id)));
    return c;
  }

  async getMixingBatchesByOperator(operatorId: number): Promise<MixingBatch[]> {
    return await db
      .select()
      .from(mixing_batches)
      .where(eq(mixing_batches.operator_id, operatorId))
      .orderBy(desc(mixing_batches.created_at));
  }

  async getMixingBatchesByProductionOrder(
    poId: number,
  ): Promise<MixingBatch[]> {
    return await db
      .select()
      .from(mixing_batches)
      .where(eq(mixing_batches.production_order_id, poId))
      .orderBy(desc(mixing_batches.created_at));
  }

  async getNextVoucherNumber(prefix: string): Promise<string> {
    const prefixMap: Record<string, { table: string; prefix: string }> = {
      "RM-Rec": { table: "raw_material_vouchers_in", prefix: "RM-Rec." },
      "RM-Del": { table: "raw_material_vouchers_out", prefix: "RM-Del." },
      "FP-Rec": { table: "finished_goods_vouchers_in", prefix: "FP-Rec." },
      "FP-Del": { table: "finished_goods_vouchers_out", prefix: "FP-Del." },
      "TM-Rec": { table: "industrial_waste_vouchers_in", prefix: "TM-Rec." },
      "TM-Del": { table: "industrial_waste_vouchers_out", prefix: "TM-Del." },
      RMI: { table: "raw_material_vouchers_in", prefix: "RM-Rec." },
      RMO: { table: "raw_material_vouchers_out", prefix: "RM-Del." },
      FGI: { table: "finished_goods_vouchers_in", prefix: "FP-Rec." },
      FGO: { table: "finished_goods_vouchers_out", prefix: "FP-Del." },
    };

    const mapping = prefixMap[prefix];
    if (mapping) {
      const result = await pool.query(
        `SELECT COUNT(*) + 1 AS next FROM ${mapping.table}`,
      );
      const num = parseInt(result.rows[0]?.next || "1");
      return `${mapping.prefix}${String(num).padStart(4, "0")}`;
    }

    const result = await pool.query(
      `SELECT COUNT(*) + 1 AS next FROM (
        SELECT voucher_number FROM raw_material_vouchers_in WHERE voucher_number LIKE $1
        UNION ALL
        SELECT voucher_number FROM raw_material_vouchers_out WHERE voucher_number LIKE $1
        UNION ALL
        SELECT voucher_number FROM finished_goods_vouchers_in WHERE voucher_number LIKE $1
        UNION ALL
        SELECT voucher_number FROM finished_goods_vouchers_out WHERE voucher_number LIKE $1
      ) t`,
      [`${prefix}%`],
    );
    const num = parseInt(result.rows[0]?.next || "1");
    return `${prefix}${String(num).padStart(4, "0")}`;
  }

  async getOperatorNegligenceReportsByOperator(
    operatorId: number,
  ): Promise<OperatorNegligenceReport[]> {
    return await db
      .select()
      .from(operator_negligence_reports)
      .where(eq(operator_negligence_reports.operator_id, operatorId));
  }

  async getOperatorPerformance(filters?: any): Promise<any> {
    return { performance: 0 };
  }

  async getOrderProgress(orderId: number): Promise<any> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    const pos = await db
      .select()
      .from(production_orders)
      .where(eq(production_orders.order_id, orderId));
    return { order, productionOrders: pos, progress: pos.length > 0 ? 50 : 0 };
  }

  async getOrderReports(options?: any): Promise<any> {
    const allOrders = await this.getAllOrders();
    return { orders: allOrders, total: allOrders.length };
  }

  async getOrdersEnhanced(options?: any): Promise<any> {
    return withDatabaseErrorHandling(
      async () => {
        const query = db
          .select({
            id: orders.id,
            order_number: orders.order_number,
            customer_id: orders.customer_id,
            customer_name: customers.name,
            customer_name_ar: customers.name_ar,
            delivery_days: orders.delivery_days,
            delivery_date: orders.delivery_date,
            status: orders.status,
            notes: orders.notes,
            created_by: orders.created_by,
            created_at: orders.created_at,
          })
          .from(orders)
          .leftJoin(customers, eq(orders.customer_id, customers.id))
          .orderBy(desc(orders.id));

        const results = await query;

        if (results.length === 0) return [];

        const orderIds = results.map((o) => o.id);
        const allProductionOrders = await db
          .select({
            id: production_orders.id,
            order_id: production_orders.order_id,
            production_order_number: production_orders.production_order_number,
            quantity_kg: production_orders.quantity_kg,
            final_quantity_kg: production_orders.final_quantity_kg,
            produced_quantity_kg: production_orders.produced_quantity_kg,
            film_completion_percentage:
              production_orders.film_completion_percentage,
            printing_completion_percentage:
              production_orders.printing_completion_percentage,
            cutting_completion_percentage:
              production_orders.cutting_completion_percentage,
            status: production_orders.status,
          })
          .from(production_orders)
          .where(inArray(production_orders.order_id, orderIds));

        const poByOrderId = new Map<number, typeof allProductionOrders>();
        for (const po of allProductionOrders) {
          if (po.order_id != null) {
            if (!poByOrderId.has(po.order_id)) poByOrderId.set(po.order_id, []);
            poByOrderId.get(po.order_id)!.push(po);
          }
        }

        const enhancedOrders = results.map((order) => {
          const pos = poByOrderId.get(order.id) || [];
          return {
            ...order,
            production_orders_count: pos.length,
            production_orders: pos,
          };
        });

        return enhancedOrders;
      },
      "getOrdersEnhanced",
      "جلب الطلبات المحسّنة",
    );
  }

  async getPendingLeaveRequests(): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leave_requests)
      .where(eq(leave_requests.final_status, "pending"))
      .orderBy(desc(leave_requests.created_at));
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

  async getProductionOrdersBySection(
    section: string,
    search?: string,
  ): Promise<ProductionOrder[]> {
    return await db
      .select()
      .from(production_orders)
      .orderBy(desc(production_orders.id));
  }

  async getProductionHallOrders(): Promise<any[]> {
    const rows = await db.execute(sql`
      SELECT
        po.id AS production_order_id,
        po.production_order_number,
        po.order_id,
        po.quantity_kg AS quantity_required,
        po.final_quantity_kg,
        po.warehouse_received_kg,
        po.status AS po_status,
        o.order_number,
        c.name AS customer_name,
        c.name_ar AS customer_name_ar,
        cp.item_id AS item_id,
        cp.unit_weight_kg AS unit_weight_kg,
        COALESCE(i.name, cp.id::text) AS product_name,
        i.name_ar AS product_name_ar,
        COALESCE(SUM(r.weight_kg), 0) AS total_film_weight,
        COALESCE(SUM(
          CASE
            WHEN (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%')
              THEN CASE WHEN r.printed_at IS NOT NULL THEN r.weight_kg ELSE 0 END
            ELSE CASE WHEN r.stage IN ('printing','done') THEN r.weight_kg ELSE 0 END
          END
        ), 0) AS total_print_weight,
        COALESCE(SUM(
          CASE
            WHEN (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%') THEN 0
            WHEN r.stage = 'done' THEN r.cut_weight_total_kg
            ELSE 0
          END
        ), 0) AS total_cut_weight,
        COALESCE(SUM(
          CASE
            WHEN r.stage = 'done' THEN
              CASE
                WHEN (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%') THEN r.weight_kg
                ELSE r.cut_weight_total_kg
              END
            ELSE 0
          END
        ), 0) AS total_ready_weight,
        COALESCE(SUM(CASE WHEN r.stage = 'done' THEN r.waste_kg ELSE 0 END), 0) AS waste_weight,
        (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%') AS is_roll_product,
        COALESCE(po.warehouse_received_kg, 0) AS total_received_weight
      FROM production_orders po
      JOIN orders o ON po.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      JOIN customer_products cp ON po.customer_product_id = cp.id
      LEFT JOIN items i ON cp.item_id = i.id
      LEFT JOIN rolls r ON r.production_order_id = po.id
      WHERE EXISTS (SELECT 1 FROM rolls r2 WHERE r2.production_order_id = po.id AND r2.stage = 'done')
        AND CAST(po.warehouse_received_kg AS NUMERIC) < CAST(po.quantity_kg AS NUMERIC)
        AND po.status IS DISTINCT FROM 'archived'
        AND o.status IS DISTINCT FROM 'archived'
      GROUP BY po.id, po.production_order_number, po.order_id, po.quantity_kg, po.final_quantity_kg,
               po.warehouse_received_kg, po.status, o.order_number, c.name, c.name_ar, i.name, i.name_ar, cp.id, cp.item_id, cp.unit_weight_kg
      ORDER BY po.id
    `);
    return (rows.rows as any[]).map((row) => ({
      ...row,
      production_order_id: Number(row.production_order_id),
      order_id: Number(row.order_id),
      item_id: row.item_id || null,
    }));
  }

  async getProductionOrderStats(productionOrderId?: number): Promise<any> {
    if (!productionOrderId) {
      const [total] = await db
        .select({ count: count() })
        .from(production_orders);
      const [active] = await db
        .select({ count: count() })
        .from(production_orders)
        .where(eq(production_orders.status, "active"));
      return { total: total?.count || 0, active: active?.count || 0 };
    }

    const [po] = await db
      .select()
      .from(production_orders)
      .where(eq(production_orders.id, productionOrderId));
    if (!po) throw new Error("أمر الإنتاج غير موجود");

    const orderRolls = await db
      .select()
      .from(rolls)
      .where(eq(rolls.production_order_id, productionOrderId));

    const totalRolls = orderRolls.length;
    const totalWeight = orderRolls.reduce(
      (sum, r) => sum + parseFloat(String(r.weight_kg || 0)),
      0,
    );
    const filmRolls = orderRolls.filter((r) => r.stage === "film").length;
    const printingRolls = orderRolls.filter(
      (r) => r.stage === "printing",
    ).length;
    const cuttingRolls = orderRolls.filter((r) => r.stage === "cutting").length;
    const doneRolls = orderRolls.filter(
      (r) => r.stage === "done" || r.stage === "archived",
    ).length;

    const targetQuantity = parseFloat(String(po.quantity_kg || 0));
    const completionPercentage =
      targetQuantity > 0
        ? Math.min(100, (totalWeight / targetQuantity) * 100)
        : 0;
    const remainingQuantity = Math.max(0, targetQuantity - totalWeight);

    const wasteRecords = await db
      .select({ total: sql<string>`COALESCE(SUM(quantity_wasted), 0)` })
      .from(waste)
      .where(eq(waste.production_order_id, productionOrderId));
    const totalWaste = parseFloat(wasteRecords[0]?.total || "0");

    const productionStartTime = po.production_start_time || po.created_at;
    const productionEndTime = po.production_end_time || null;
    let productionTimeHours = 0;
    if (productionStartTime && productionEndTime) {
      productionTimeHours =
        Math.round(
          ((new Date(productionEndTime).getTime() -
            new Date(productionStartTime).getTime()) /
            3600000) *
            10,
        ) / 10;
    }

    return {
      production_order: po,
      total_rolls: totalRolls,
      total_weight: totalWeight.toFixed(2),
      film_rolls: filmRolls,
      printing_rolls: printingRolls,
      cutting_rolls: cuttingRolls,
      done_rolls: doneRolls,
      completion_percentage: completionPercentage.toFixed(1),
      remaining_quantity: remainingQuantity.toFixed(2),
      total_waste: totalWaste.toFixed(2),
      production_time_hours: productionTimeHours,
    };
  }

  async getProductionOrdersWithDetails(): Promise<any[]> {
    const results = await db
      .select({
        id: production_orders.id,
        production_order_number: production_orders.production_order_number,
        order_id: production_orders.order_id,
        customer_product_id: production_orders.customer_product_id,
        quantity_kg: production_orders.quantity_kg,
        final_quantity_kg: production_orders.final_quantity_kg,
        produced_kg: production_orders.produced_quantity_kg,
        status: production_orders.status,
        assigned_machine_id: production_orders.assigned_machine_id,
        assigned_operator_id: production_orders.assigned_operator_id,
        warehouse_received_kg: production_orders.warehouse_received_kg,
        overrun_percentage: production_orders.overrun_percentage,
        created_at: production_orders.created_at,
        order_number: orders.order_number,
        customer_name: customers.name,
        customer_name_ar: customers.name_ar,
        size_caption: customer_products.size_caption,
        is_printed: customer_products.is_printed,
        item_name: items.name,
        item_name_ar: items.name_ar,
        machine_name: machines.name,
        machine_name_ar: machines.name_ar,
        operator_name: users.display_name,
        operator_name_ar: users.display_name_ar,
      })
      .from(production_orders)
      .innerJoin(orders, eq(production_orders.order_id, orders.id))
      .innerJoin(customers, eq(orders.customer_id, customers.id))
      .leftJoin(
        customer_products,
        eq(production_orders.customer_product_id, customer_products.id),
      )
      .leftJoin(items, eq(customer_products.item_id, items.id))
      .leftJoin(
        machines,
        eq(production_orders.assigned_machine_id, machines.id),
      )
      .leftJoin(users, eq(production_orders.assigned_operator_id, users.id))
      .orderBy(desc(production_orders.id));
    return results;
  }

  async getProductionStatsBySection(
    section?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    return { section, total: 0 };
  }

  async getMonitoringDashboard(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    const dateCondition = (dateField: any) => {
      const conditions: any[] = [];
      if (dateFrom)
        conditions.push(sql`${dateField} >= ${dateFrom}::timestamp`);
      if (dateTo)
        conditions.push(
          sql`${dateField} <= (${dateTo}::date + interval '1 day')`,
        );
      return conditions.length > 0 ? and(...conditions) : undefined;
    };

    const allRolls = await db
      .select({
        id: rolls.id,
        weight_kg: rolls.weight_kg,
        stage: rolls.stage,
        created_at: rolls.created_at,
        printed_at: rolls.printed_at,
        cut_completed_at: rolls.cut_completed_at,
        film_machine_id: rolls.film_machine_id,
        printing_machine_id: rolls.printing_machine_id,
        cutting_machine_id: rolls.cutting_machine_id,
        created_by: rolls.created_by,
        printed_by: rolls.printed_by,
        cut_by: rolls.cut_by,
        production_order_id: rolls.production_order_id,
        waste_kg: rolls.waste_kg,
        cut_weight_total_kg: rolls.cut_weight_total_kg,
      })
      .from(rolls)
      .where(dateCondition(rolls.created_at));

    const machineRows = await db
      .select({
        id: machines.id,
        name: machines.name,
        name_ar: machines.name_ar,
        type: machines.type,
      })
      .from(machines);
    const machineMap = new Map(machineRows.map((m) => [m.id, m]));

    const userRows = await db
      .select({
        id: users.id,
        display_name: users.display_name,
        display_name_ar: users.display_name_ar,
      })
      .from(users);
    const userMap = new Map(userRows.map((u) => [u.id, u]));

    const poRows = await db
      .select({
        po_id: production_orders.id,
        po_number: production_orders.production_order_number,
        cp_id: production_orders.customer_product_id,
        order_id: production_orders.order_id,
        quantity_kg: production_orders.quantity_kg,
        status: production_orders.status,
        size_caption: customer_products.size_caption,
        item_name: items.name,
        item_name_ar: items.name_ar,
        customer_name: customers.name,
        customer_name_ar: customers.name_ar,
      })
      .from(production_orders)
      .innerJoin(orders, eq(production_orders.order_id, orders.id))
      .innerJoin(customers, eq(orders.customer_id, customers.id))
      .leftJoin(
        customer_products,
        eq(production_orders.customer_product_id, customer_products.id),
      )
      .leftJoin(items, eq(customer_products.item_id, items.id));
    const poMap = new Map(poRows.map((p) => [p.po_id, p]));

    let filmKg = 0,
      printingKg = 0,
      cuttingKg = 0,
      doneKg = 0;
    let filmRolls = 0,
      printingRolls = 0,
      cuttingRolls = 0,
      doneRolls = 0;
    let totalWaste = 0;

    const machineStats: Record<
      string,
      {
        film_kg: number;
        film_rolls: number;
        printing_kg: number;
        printing_rolls: number;
        cutting_kg: number;
        cutting_rolls: number;
        last_production: string | null;
      }
    > = {};
    const workerStats: Record<
      number,
      {
        film_kg: number;
        film_rolls: number;
        printing_kg: number;
        printing_rolls: number;
        cutting_kg: number;
        cutting_rolls: number;
      }
    > = {};
    const productStats: Record<
      number,
      { total_kg: number; total_rolls: number }
    > = {};

    for (const r of allRolls) {
      const w = parseFloat(String(r.weight_kg || 0));
      const wasteW = parseFloat(String(r.waste_kg || 0));
      totalWaste += wasteW;

      if (r.stage === "film") {
        filmKg += w;
        filmRolls++;
      } else if (r.stage === "printing") {
        printingKg += w;
        printingRolls++;
      } else if (r.stage === "cutting") {
        cuttingKg += w;
        cuttingRolls++;
      } else if (r.stage === "done" || r.stage === "archived") {
        doneKg += w;
        doneRolls++;
      }

      if (r.film_machine_id) {
        if (!machineStats[r.film_machine_id])
          machineStats[r.film_machine_id] = {
            film_kg: 0,
            film_rolls: 0,
            printing_kg: 0,
            printing_rolls: 0,
            cutting_kg: 0,
            cutting_rolls: 0,
            last_production: null,
          };
        machineStats[r.film_machine_id].film_kg += w;
        machineStats[r.film_machine_id].film_rolls++;
        const ts = r.created_at ? new Date(r.created_at).toISOString() : null;
        if (
          ts &&
          (!machineStats[r.film_machine_id].last_production ||
            ts > machineStats[r.film_machine_id].last_production!)
        )
          machineStats[r.film_machine_id].last_production = ts;
      }
      if (r.printing_machine_id && r.printed_at) {
        if (!machineStats[r.printing_machine_id])
          machineStats[r.printing_machine_id] = {
            film_kg: 0,
            film_rolls: 0,
            printing_kg: 0,
            printing_rolls: 0,
            cutting_kg: 0,
            cutting_rolls: 0,
            last_production: null,
          };
        machineStats[r.printing_machine_id].printing_kg += w;
        machineStats[r.printing_machine_id].printing_rolls++;
        const pts = new Date(r.printed_at).toISOString();
        if (
          !machineStats[r.printing_machine_id].last_production ||
          pts > machineStats[r.printing_machine_id].last_production!
        )
          machineStats[r.printing_machine_id].last_production = pts;
      }
      if (r.cutting_machine_id && r.cut_completed_at) {
        if (!machineStats[r.cutting_machine_id])
          machineStats[r.cutting_machine_id] = {
            film_kg: 0,
            film_rolls: 0,
            printing_kg: 0,
            printing_rolls: 0,
            cutting_kg: 0,
            cutting_rolls: 0,
            last_production: null,
          };
        machineStats[r.cutting_machine_id].cutting_kg += w;
        machineStats[r.cutting_machine_id].cutting_rolls++;
        const cts = new Date(r.cut_completed_at).toISOString();
        if (
          !machineStats[r.cutting_machine_id].last_production ||
          cts > machineStats[r.cutting_machine_id].last_production!
        )
          machineStats[r.cutting_machine_id].last_production = cts;
      }

      if (r.created_by) {
        if (!workerStats[r.created_by])
          workerStats[r.created_by] = {
            film_kg: 0,
            film_rolls: 0,
            printing_kg: 0,
            printing_rolls: 0,
            cutting_kg: 0,
            cutting_rolls: 0,
          };
        workerStats[r.created_by].film_kg += w;
        workerStats[r.created_by].film_rolls++;
      }
      if (r.printed_by && r.printed_at) {
        if (!workerStats[r.printed_by])
          workerStats[r.printed_by] = {
            film_kg: 0,
            film_rolls: 0,
            printing_kg: 0,
            printing_rolls: 0,
            cutting_kg: 0,
            cutting_rolls: 0,
          };
        workerStats[r.printed_by].printing_kg += w;
        workerStats[r.printed_by].printing_rolls++;
      }
      if (r.cut_by && r.cut_completed_at) {
        if (!workerStats[r.cut_by])
          workerStats[r.cut_by] = {
            film_kg: 0,
            film_rolls: 0,
            printing_kg: 0,
            printing_rolls: 0,
            cutting_kg: 0,
            cutting_rolls: 0,
          };
        workerStats[r.cut_by].cutting_kg += w;
        workerStats[r.cut_by].cutting_rolls++;
      }

      if (r.production_order_id) {
        if (!productStats[r.production_order_id])
          productStats[r.production_order_id] = { total_kg: 0, total_rolls: 0 };
        productStats[r.production_order_id].total_kg += w;
        productStats[r.production_order_id].total_rolls++;
      }
    }

    const totalKg = filmKg + printingKg + cuttingKg + doneKg;
    const totalRolls = allRolls.length;

    const machinesResult = Object.entries(machineStats)
      .map(([id, s]) => {
        const m = machineMap.get(id);
        const totalMachineKg = s.film_kg + s.printing_kg + s.cutting_kg;
        const totalMachineRolls =
          s.film_rolls + s.printing_rolls + s.cutting_rolls;
        return {
          id,
          name: m?.name || id,
          name_ar: m?.name_ar || m?.name || id,
          type: m?.type || "",
          film_kg: +s.film_kg.toFixed(2),
          film_rolls: s.film_rolls,
          printing_kg: +s.printing_kg.toFixed(2),
          printing_rolls: s.printing_rolls,
          cutting_kg: +s.cutting_kg.toFixed(2),
          cutting_rolls: s.cutting_rolls,
          total_kg: +totalMachineKg.toFixed(2),
          total_rolls: totalMachineRolls,
          last_production: s.last_production,
        };
      })
      .sort((a, b) => b.total_kg - a.total_kg);

    const workersResult = Object.entries(workerStats)
      .map(([id, s]) => {
        const u = userMap.get(Number(id));
        const totalWorkerKg = s.film_kg + s.printing_kg + s.cutting_kg;
        const totalWorkerRolls =
          s.film_rolls + s.printing_rolls + s.cutting_rolls;
        return {
          id: Number(id),
          name: u?.display_name || `User ${id}`,
          name_ar: u?.display_name_ar || u?.display_name || `عامل ${id}`,
          film_kg: +s.film_kg.toFixed(2),
          film_rolls: s.film_rolls,
          printing_kg: +s.printing_kg.toFixed(2),
          printing_rolls: s.printing_rolls,
          cutting_kg: +s.cutting_kg.toFixed(2),
          cutting_rolls: s.cutting_rolls,
          total_kg: +totalWorkerKg.toFixed(2),
          total_rolls: totalWorkerRolls,
        };
      })
      .sort((a, b) => b.total_kg - a.total_kg);

    const productAgg: Record<
      string,
      {
        item_name: string;
        item_name_ar: string;
        customer_name: string;
        customer_name_ar: string;
        size_caption: string;
        total_kg: number;
        total_rolls: number;
      }
    > = {};
    for (const [poId, s] of Object.entries(productStats)) {
      const po = poMap.get(Number(poId));
      if (!po) continue;
      const key = `${po.cp_id || "unknown"}`;
      if (!productAgg[key]) {
        productAgg[key] = {
          item_name: po.item_name || "",
          item_name_ar: po.item_name_ar || po.item_name || "",
          customer_name: po.customer_name || "",
          customer_name_ar: po.customer_name_ar || po.customer_name || "",
          size_caption: po.size_caption || "",
          total_kg: 0,
          total_rolls: 0,
        };
      }
      productAgg[key].total_kg += s.total_kg;
      productAgg[key].total_rolls += s.total_rolls;
    }
    const productsResult = Object.values(productAgg)
      .map((p) => ({ ...p, total_kg: +p.total_kg.toFixed(2) }))
      .sort((a, b) => b.total_kg - a.total_kg)
      .slice(0, 20);

    // ============ Recipe-based material requirements & consumption ============
    // For each production order, we classify the product into one of 4 recipes
    // based on raw_material (HDPE/LDPE) and color (clear vs colored, where
    // CLEAR = master_batch empty or containing "CLEAR"/"شفاف"), then break the
    // production quantity into its raw component kilograms.
    //   - REQUIRED (basis for "what to buy"): final_quantity_kg of pending POs.
    //   - CONSUMED (basis for "what was used"): produced_quantity_kg of
    //     active + completed POs.
    // We send per-PO rows + the recipe definitions and facet lists to the
    // client so it can apply filters (color/material/category) without an
    // extra round-trip.
    const materialRows = await db
      .select({
        po_id: production_orders.id,
        order_id: production_orders.order_id,
        status: production_orders.status,
        final_quantity_kg: production_orders.final_quantity_kg,
        produced_quantity_kg: production_orders.produced_quantity_kg,
        raw_material: customer_products.raw_material,
        master_batch_id: customer_products.master_batch_id,
        color_name: master_batch_colors.name,
        color_name_ar: master_batch_colors.name_ar,
        color_hex: master_batch_colors.color_hex,
        category_id: customer_products.category_id,
        category_name: categories.name,
        category_name_ar: categories.name_ar,
        customer_id: customers.id,
        customer_name: customers.name,
        customer_name_ar: customers.name_ar,
        item_name: items.name,
        item_name_ar: items.name_ar,
        size_caption: customer_products.size_caption,
      })
      .from(production_orders)
      .leftJoin(
        customer_products,
        eq(production_orders.customer_product_id, customer_products.id),
      )
      .leftJoin(categories, eq(customer_products.category_id, categories.id))
      .leftJoin(customers, eq(customer_products.customer_id, customers.id))
      .leftJoin(items, eq(customer_products.item_id, items.id))
      .leftJoin(
        master_batch_colors,
        eq(customer_products.master_batch_id, master_batch_colors.id),
      )
      .where(dateCondition(production_orders.created_at));

    // Recipe definitions (in percent). Components: HDPE / LLDPE / LDPE / FILLER / COLOR
    const RECIPES: Record<
      string,
      { label: string; label_ar: string; components: Record<string, number> }
    > = {
      hdpe_colored: {
        label: "HDPE Colored",
        label_ar: "HDPE ملون",
        components: { HDPE: 35, LLDPE: 35, FILLER: 25, COLOR: 5 },
      },
      hdpe_clear: {
        label: "HDPE Clear",
        label_ar: "HDPE شفاف",
        components: { HDPE: 50, LLDPE: 50 },
      },
      ldpe_colored: {
        label: "LDPE Colored",
        label_ar: "LDPE ملون",
        components: { LLDPE: 60, LDPE: 10, FILLER: 25, COLOR: 5 },
      },
      ldpe_clear: {
        label: "LDPE Clear",
        label_ar: "LDPE شفاف",
        components: { LLDPE: 80, LDPE: 20 },
      },
    };

    const classifyClear = (mb: string | null | undefined): boolean => {
      if (!mb || !mb.trim()) return true;
      const u = mb.trim().toUpperCase();
      return (
        u === "CLEAR" ||
        u.includes("CLEAR") ||
        mb.includes("شفاف") ||
        u === "NONE"
      );
    };

    const classifyRecipe = (
      rawMaterial: string | null | undefined,
      mb: string | null | undefined,
    ): string | null => {
      const rm = (rawMaterial || "").toUpperCase().trim();
      const isClear = classifyClear(mb);
      if (rm.startsWith("HDPE")) return isClear ? "hdpe_clear" : "hdpe_colored";
      if (rm.startsWith("LDPE")) return isClear ? "ldpe_clear" : "ldpe_colored";
      return null;
    };

    const colorFacetsMap = new Map<
      string,
      { id: string; name: string; name_ar: string; hex: string }
    >();
    const rawMaterialFacets = new Set<string>();
    const categoryFacetsMap = new Map<
      string,
      { id: string; name: string; name_ar: string }
    >();

    const ordersOut: any[] = [];
    for (const row of materialRows) {
      const status = row.status || "pending";
      const rawMaterial = row.raw_material || "غير محدد";
      const masterBatch = (row.master_batch_id || "").trim() || "CLEAR";
      const isClear = classifyClear(row.master_batch_id);
      const recipeKey = classifyRecipe(row.raw_material, row.master_batch_id);
      const recipe = recipeKey ? RECIPES[recipeKey] : null;

      const finalKg =
        parseFloat(String(row.final_quantity_kg || 0)) || 0;
      const producedKg =
        parseFloat(String(row.produced_quantity_kg || 0)) || 0;

      // Basis for required = pending POs (final_quantity_kg)
      // Basis for consumed = active + completed POs (produced_quantity_kg)
      const basisRequiredKg = status === "pending" ? finalKg : 0;
      const basisConsumedKg =
        status === "active" || status === "completed" ? producedKg : 0;

      const splitComponents = (basis: number) => {
        const out: Record<string, number> = {
          HDPE: 0,
          LLDPE: 0,
          LDPE: 0,
          FILLER: 0,
          COLOR: 0,
        };
        if (!recipe || basis <= 0) return out;
        for (const [comp, pct] of Object.entries(recipe.components)) {
          out[comp] = (basis * pct) / 100;
        }
        return out;
      };

      const colorNameAr = isClear
        ? "شفاف"
        : row.color_name_ar || row.color_name || masterBatch;
      const colorName = isClear
        ? "CLEAR"
        : row.color_name || row.color_name_ar || masterBatch;
      const colorHex = isClear
        ? "transparent"
        : row.color_hex || "#CCCCCC";

      colorFacetsMap.set(masterBatch, {
        id: masterBatch,
        name: colorName,
        name_ar: colorNameAr,
        hex: colorHex,
      });
      rawMaterialFacets.add(rawMaterial);
      if (row.category_id) {
        categoryFacetsMap.set(row.category_id, {
          id: row.category_id,
          name: row.category_name || row.category_id,
          name_ar: row.category_name_ar || row.category_name || row.category_id,
        });
      }

      ordersOut.push({
        po_id: row.po_id,
        order_id: row.order_id,
        status,
        customer_name: row.customer_name || "",
        customer_name_ar: row.customer_name_ar || row.customer_name || "",
        item_name: row.item_name || "",
        item_name_ar: row.item_name_ar || row.item_name || "",
        size_caption: row.size_caption || "",
        raw_material: rawMaterial,
        master_batch: masterBatch,
        color_name: colorName,
        color_name_ar: colorNameAr,
        color_hex: colorHex,
        is_clear: isClear,
        category_id: row.category_id || null,
        category_name: row.category_name || null,
        category_name_ar: row.category_name_ar || row.category_name || null,
        recipe_key: recipeKey,
        recipe_label_ar: recipe ? recipe.label_ar : "غير مصنف",
        final_quantity_kg: +finalKg.toFixed(2),
        produced_quantity_kg: +producedKg.toFixed(2),
        basis_required_kg: +basisRequiredKg.toFixed(2),
        basis_consumed_kg: +basisConsumedKg.toFixed(2),
        required_components: splitComponents(basisRequiredKg),
        consumed_components: splitComponents(basisConsumedKg),
      });
    }

    return {
      summary: {
        total_kg: +totalKg.toFixed(2),
        total_rolls: totalRolls,
        film_kg: +filmKg.toFixed(2),
        film_rolls: filmRolls,
        printing_kg: +printingKg.toFixed(2),
        printing_rolls: printingRolls,
        cutting_kg: +cuttingKg.toFixed(2),
        cutting_rolls: cuttingRolls,
        done_kg: +doneKg.toFixed(2),
        done_rolls: doneRolls,
        total_waste_kg: +totalWaste.toFixed(2),
      },
      machines: machinesResult,
      workers: workersResult,
      products: productsResult,
      materials: {
        recipes: Object.entries(RECIPES).map(([key, r]) => ({
          key,
          label: r.label,
          label_ar: r.label_ar,
          components: r.components,
        })),
        orders: ordersOut,
        facets: {
          raw_materials: Array.from(rawMaterialFacets).sort(),
          colors: Array.from(colorFacetsMap.values()).sort((a, b) =>
            (a.name_ar || a.name).localeCompare(b.name_ar || b.name, "ar"),
          ),
          categories: Array.from(categoryFacetsMap.values()).sort((a, b) =>
            (a.name_ar || a.name).localeCompare(b.name_ar || b.name, "ar"),
          ),
        },
      },
    };
  }

  async getProductionSummary(options?: any): Promise<any> {
    const stats = await this.getProductionStats();
    return stats;
  }

  async getQualityChecks(rollId?: number): Promise<QualityCheck[]> {
    if (rollId) return this.getQualityChecksByRoll(rollId);
    return await db
      .select()
      .from(quality_checks)
      .orderBy(desc(quality_checks.id));
  }

  async getQuickNoteById(id: number): Promise<QuickNote | undefined> {
    const [n] = await db
      .select()
      .from(quick_notes)
      .where(eq(quick_notes.id, id));
    return n;
  }

  async getRealTimeProductionStats(): Promise<any> {
    return { active: 0, completed: 0, pending: 0 };
  }

  async getDatabaseStats(): Promise<any> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [orderCount] = await db.select({ count: count() }).from(orders);
    const [rollCount] = await db.select({ count: count() }).from(rolls);

    let tableCount = 0;
    let totalRecords = 0;
    let databaseSize = "---";
    try {
      const tableResult = await db.execute(
        sql.raw(
          `SELECT count(*) as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
        ),
      );
      tableCount = Number(tableResult.rows[0]?.cnt) || 0;
    } catch {}

    try {
      const recordResult = await db.execute(
        sql.raw(`SELECT SUM(n_live_tup) as cnt FROM pg_stat_user_tables`),
      );
      totalRecords = Number(recordResult.rows[0]?.cnt) || 0;
    } catch {}

    try {
      const sizeResult = await db.execute(
        sql.raw(
          `SELECT pg_size_pretty(pg_database_size(current_database())) as size`,
        ),
      );
      databaseSize = (sizeResult.rows[0]?.size as string) || "---";
    } catch {}

    return {
      users: userCount?.count || 0,
      orders: orderCount?.count || 0,
      rolls: rollCount?.count || 0,
      tableCount,
      totalRecords,
      databaseSize,
      lastBackup: "---",
    };
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

  async getFactoryLocation(id: number): Promise<FactoryLocation | undefined> {
    const [l] = await db
      .select()
      .from(factory_locations)
      .where(eq(factory_locations.id, id));
    return l;
  }

  async getHRReports(options?: any): Promise<any> {
    return { reports: [] };
  }

  async getMachineCapacityStats(stage?: string): Promise<any> {
    const s = String(stage || "");
    if (!this.getStageInfo(s)) {
      throw new Error("مرحلة غير صالحة");
    }
    const { states } = await this.getStageMachineStates(s);
    return states.map((st) => {
      const utilization =
        st.maxCapacity > 0 ? (st.currentLoad / st.maxCapacity) * 100 : 0;
      return {
        machineId: st.machine.id,
        machineName: st.machine.name,
        machineNameAr: st.machine.name_ar,
        currentLoad: Math.round(st.currentLoad * 100) / 100,
        maxCapacity: Math.round(st.maxCapacity * 100) / 100,
        utilizationPercentage: Math.round(utilization * 10) / 10,
        capacityStatus: this.capacityStatusFromUtilization(utilization),
        orderCount: st.orderCount,
        productionRate: Math.round(st.rate * 100) / 100,
      };
    });
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

  async getMachinePerformance(filters?: any): Promise<any> {
    return { performance: 0, uptime: 0 };
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

  // ===== Production Queues planning (department-based) =====

  // Map a department/stage to its machine type, completion column, and
  // completion-percentage column. Stage is validated against this whitelist
  // by callers, so the resulting column names are safe to inline.
  private getStageInfo(stage: string): {
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
  private machineTypeMatchSql(machineTypes: string[]) {
    const list = sql.join(
      machineTypes.map((t) => sql`${t.toLowerCase()}`),
      sql`, `,
    );
    return sql`LOWER(m.type) IN (${list})`;
  }

  // Representative production rate (kg/hour) for a machine. Prefers the medium
  // capacity, otherwise averages whatever sizes are defined.
  private machineRateKgPerHour(machine: any): number {
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
  private static SIZE_WIDTH_SMALL_MAX_CM = 30;
  private static SIZE_WIDTH_LARGE_MIN_CM = 60;

  // Size-appropriate production rate (kg/hour) for a single order on a machine,
  // chosen from the product width. Falls back to the medium/average rate when
  // the width is unknown or the matching capacity is not configured.
  private machineRateForWidth(machine: any, width: any): number {
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
      if (w < DatabaseStorage.SIZE_WIDTH_SMALL_MAX_CM) preferred = small;
      else if (w >= DatabaseStorage.SIZE_WIDTH_LARGE_MIN_CM) preferred = large;
      else preferred = medium;
    }
    if (!isNaN(preferred) && preferred > 0) return preferred;
    // Fall back to the representative (medium/average) rate.
    return this.machineRateKgPerHour(machine);
  }

  // True when a numeric value lies within an optional [min, max] capability
  // range. Missing bounds impose no constraint; a missing/invalid value passes
  // (we never block on absent product data). Used for film width/thickness.
  private numInRange(value: any, min: any, max: any): boolean {
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
  private filmMaterialTypeMatch(capability: any, material: any): boolean {
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

  private countPrintColors(front?: any, back?: any): number {
    const countSide = (arr: any) =>
      Array.isArray(arr)
        ? arr.filter((c) => typeof c === "string" && c.trim() !== "").length
        : 0;
    return countSide(front) + countSide(back);
  }

  private isClearProduct(row: any): boolean {
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
  private enrichedPoColumns() {
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

  private enrichedPoJoins() {
    return sql`
      LEFT JOIN orders o ON o.id = po.order_id
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
      LEFT JOIN items it ON it.id = cp.item_id
      LEFT JOIN master_batch_colors mb ON mb.id = cp.master_batch_id
    `;
  }

  private mapEnrichedRow(row: any): any {
    return {
      ...row,
      print_colors_count: this.countPrintColors(
        row.front_print_colors,
        row.back_print_colors,
      ),
    };
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

  // Persist a full ordering for one machine's queue.
  async reorderMachineQueue(
    machineId: string,
    orderedQueueIds: number[],
  ): Promise<void> {
    const current = await this.getMachineQueue(machineId as any);
    const validIds = new Set(current.map((q) => q.id));
    for (const id of orderedQueueIds) {
      if (!validIds.has(id))
        throw new Error("عنصر طابور غير صالح لهذه الماكينة");
    }
    for (let i = 0; i < orderedQueueIds.length; i++) {
      await db
        .update(machine_queues)
        .set({ queue_position: i + 1 })
        .where(eq(machine_queues.id, orderedQueueIds[i]));
    }
  }

  // Suggest a queue ordering for one machine that minimizes color/setup
  // changes. Returns the queue items in the recommended order.
  async suggestQueueOrder(machineId: string, stage: string): Promise<any[]> {
    const info = this.getStageInfo(stage);
    if (!info) throw new Error("مرحلة غير صالحة");
    const { completedCol } = info;
    const completed = sql.raw(`po.${completedCol}`);

    const rows = (
      await db.execute(sql`
        SELECT q.id AS queue_id, q.machine_id, q.queue_position,
               ${this.enrichedPoColumns()}
        FROM machine_queues q
        JOIN production_orders po ON po.id = q.production_order_id
        ${this.enrichedPoJoins()}
        WHERE q.machine_id = ${machineId}
          AND po.status <> 'cancelled'
          AND ${completed} IS NOT TRUE
        ORDER BY q.queue_position
      `)
    ).rows as any[];

    const items = rows.map((r) => this.mapEnrichedRow(r));

    const colorSig = (r: any) =>
      [
        ...(Array.isArray(r.front_print_colors) ? r.front_print_colors : []),
        "|",
        ...(Array.isArray(r.back_print_colors) ? r.back_print_colors : []),
      ]
        .map((c) => String(c ?? "").toLowerCase())
        .join(",");

    const withIndex = items.map((it, idx) => ({ it, idx }));
    let sorted: typeof withIndex;

    if (stage === "film") {
      sorted = withIndex.sort((a, b) => {
        const aClear = this.isClearProduct(a.it) ? 0 : 1;
        const bClear = this.isClearProduct(b.it) ? 0 : 1;
        if (aClear !== bClear) return aClear - bClear;
        const aKey = String(a.it.master_batch_id ?? "");
        const bKey = String(b.it.master_batch_id ?? "");
        if (aKey !== bKey) return aKey.localeCompare(bKey);
        return a.idx - b.idx;
      });
    } else if (stage === "printing") {
      sorted = withIndex.sort((a, b) => {
        if (a.it.print_colors_count !== b.it.print_colors_count)
          return a.it.print_colors_count - b.it.print_colors_count;
        const aSig = colorSig(a.it);
        const bSig = colorSig(b.it);
        if (aSig !== bSig) return aSig.localeCompare(bSig);
        return a.idx - b.idx;
      });
    } else {
      // cutting / default: cluster by size then material.
      sorted = withIndex.sort((a, b) => {
        const aKey = String(a.it.size_caption ?? "");
        const bKey = String(b.it.size_caption ?? "");
        if (aKey !== bKey) return aKey.localeCompare(bKey);
        const aMat = String(a.it.raw_material ?? "");
        const bMat = String(b.it.raw_material ?? "");
        if (aMat !== bMat) return aMat.localeCompare(bMat);
        return a.idx - b.idx;
      });
    }

    return sorted.map((s) => s.it);
  }

  async getMachineUtilizationStats(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<any> {
    return { utilization: 0, machines: [] };
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

  private qualityInspectionFormBaseQuery() {
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

  async getExperimentalBlends(): Promise<ExperimentalBlend[]> {
    return db
      .select()
      .from(experimental_blends)
      .orderBy(desc(experimental_blends.created_at));
  }

  async getExperimentalBlendById(
    id: number,
  ): Promise<ExperimentalBlend | undefined> {
    const [blend] = await db
      .select()
      .from(experimental_blends)
      .where(eq(experimental_blends.id, id));
    return blend;
  }

  async createExperimentalBlend(
    blend: InsertExperimentalBlend,
  ): Promise<ExperimentalBlend> {
    const [created] = await db
      .insert(experimental_blends)
      .values(blend)
      .returning();
    return created;
  }

  async updateExperimentalBlend(
    id: number,
    blend: Partial<InsertExperimentalBlend>,
    items?: InsertExperimentalBlendItem[],
  ): Promise<ExperimentalBlend> {
    const [updated] = await db
      .update(experimental_blends)
      .set(blend)
      .where(eq(experimental_blends.id, id))
      .returning();
    if (items) {
      await db
        .delete(experimental_blend_items)
        .where(eq(experimental_blend_items.blend_id, id));
      if (items.length > 0) {
        await db.insert(experimental_blend_items).values(items).returning();
      }
    }
    return updated;
  }

  async deleteExperimentalBlend(id: number): Promise<void> {
    await db.delete(experimental_blends).where(eq(experimental_blends.id, id));
  }

  async getExperimentalBlendItems(
    blendId: number,
  ): Promise<ExperimentalBlendItem[]> {
    return db
      .select()
      .from(experimental_blend_items)
      .where(eq(experimental_blend_items.blend_id, blendId));
  }

  async createExperimentalBlendItems(
    items: InsertExperimentalBlendItem[],
  ): Promise<ExperimentalBlendItem[]> {
    if (items.length === 0) return [];
    return db.insert(experimental_blend_items).values(items).returning();
  }

  // ==================== Bag Weight Records ====================
  async getBagWeightRecordsByUser(userId: number): Promise<BagWeightRecord[]> {
    return db
      .select()
      .from(bag_weight_records)
      .where(eq(bag_weight_records.user_id, userId))
      .orderBy(desc(bag_weight_records.created_at));
  }

  async createBagWeightRecord(
    userId: number,
    record: Omit<InsertBagWeightRecord, "id" | "user_id" | "created_at">,
  ): Promise<BagWeightRecord> {
    const [created] = await db
      .insert(bag_weight_records)
      .values({ ...record, user_id: userId })
      .returning();
    return created;
  }

  async deleteBagWeightRecord(id: number, userId: number): Promise<boolean> {
    const deleted = await db
      .delete(bag_weight_records)
      .where(
        and(
          eq(bag_weight_records.id, id),
          eq(bag_weight_records.user_id, userId),
        ),
      )
      .returning({ id: bag_weight_records.id });
    return deleted.length > 0;
  }

  async clearBagWeightRecords(userId: number): Promise<void> {
    await db
      .delete(bag_weight_records)
      .where(eq(bag_weight_records.user_id, userId));
  }

  // ============ DELIVERY MANIFESTS ============

  async getDeliveryManifests(): Promise<DeliveryManifest[]> {
    return await db
      .select()
      .from(delivery_manifests)
      .orderBy(desc(delivery_manifests.created_at));
  }

  async getDeliveryManifestById(
    id: number,
  ): Promise<DeliveryManifest | undefined> {
    const [m] = await db
      .select()
      .from(delivery_manifests)
      .where(eq(delivery_manifests.id, id));
    return m;
  }

  async createDeliveryManifest(
    data: InsertDeliveryManifest,
    userId: number,
  ): Promise<DeliveryManifest> {
    const [m] = await db
      .insert(delivery_manifests)
      .values({ ...data, created_by: userId })
      .returning();
    return m;
  }

  async updateDeliveryManifest(
    id: number,
    updates: Partial<InsertDeliveryManifest>,
  ): Promise<DeliveryManifest> {
    const [u] = await db
      .update(delivery_manifests)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(delivery_manifests.id, id))
      .returning();
    return u;
  }

  async deleteDeliveryManifest(id: number): Promise<void> {
    await db.delete(delivery_manifests).where(eq(delivery_manifests.id, id));
  }

  // ============ ADMIN TOOL DOCUMENTS (generic) ============

  async getAdminToolDocuments(
    docType?: string,
  ): Promise<AdminToolDocument[]> {
    if (docType) {
      return await db
        .select()
        .from(admin_tool_documents)
        .where(eq(admin_tool_documents.doc_type, docType))
        .orderBy(desc(admin_tool_documents.created_at));
    }
    return await db
      .select()
      .from(admin_tool_documents)
      .orderBy(desc(admin_tool_documents.created_at));
  }

  async getAdminToolDocumentById(
    id: number,
  ): Promise<AdminToolDocument | undefined> {
    const [d] = await db
      .select()
      .from(admin_tool_documents)
      .where(eq(admin_tool_documents.id, id));
    return d;
  }

  async createAdminToolDocument(
    data: InsertAdminToolDocument,
    userId: number,
  ): Promise<AdminToolDocument> {
    const [d] = await db
      .insert(admin_tool_documents)
      .values({ ...data, created_by: userId })
      .returning();
    return d;
  }

  async updateAdminToolDocument(
    id: number,
    updates: Partial<InsertAdminToolDocument>,
  ): Promise<AdminToolDocument> {
    const [u] = await db
      .update(admin_tool_documents)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(admin_tool_documents.id, id))
      .returning();
    return u;
  }

  async deleteAdminToolDocument(id: number): Promise<void> {
    await db
      .delete(admin_tool_documents)
      .where(eq(admin_tool_documents.id, id));
  }
}

export const storage = new DatabaseStorage();
