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
  ne,
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

export class UsersStorage extends StorageBase {


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


  async getUserByUsernameOrNationalId(
    identifier: string,
  ): Promise<User | undefined> {
    return withDatabaseErrorHandling(
      async () => {
        // Prefer exact username match, then fall back to national_id
        const [byUsername] = await db
          .select()
          .from(users)
          .where(eq(users.username, identifier));
        if (byUsername) return byUsername;
        const [byNationalId] = await db
          .select()
          .from(users)
          .where(eq(users.national_id, identifier));
        return byNationalId;
      },
      "getUserByUsernameOrNationalId",
      `جلب المستخدم ${identifier}`,
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
            national_id: users.national_id,
            nationality: users.nationality,
            birth_date: users.birth_date,
            service_start_date: users.service_start_date,
            profession: users.profession,
            is_system_user: users.is_system_user,
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
            national_id: users.national_id,
            nationality: users.nationality,
            birth_date: users.birth_date,
            service_start_date: users.service_start_date,
            profession: users.profession,
            is_system_user: users.is_system_user,
          })
          .from(users)
          .where(or(isNull(users.status), ne(users.status, "deleted")))
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
            national_id: users.national_id,
            nationality: users.nationality,
            birth_date: users.birth_date,
            service_start_date: users.service_start_date,
            profession: users.profession,
            is_system_user: users.is_system_user,
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


  async enrollUserInProgram(
    data: InsertTrainingEnrollment,
  ): Promise<TrainingEnrollment> {
    const [e] = await db.insert(training_enrollments).values(data).returning();
    return e;
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


  async getAlertsByUser(userId: number): Promise<SystemAlert[]> {
    return await db
      .select()
      .from(system_alerts)
      .where(sql`${userId} = ANY(${system_alerts.target_users})`)
      .orderBy(desc(system_alerts.created_at));
  }


  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
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
    // Soft delete: mark as 'deleted' so historical references (orders,
    // attendance, ...) stay intact; deleted users are hidden from lists.
    await db.update(users).set({ status: "deleted" }).where(eq(users.id, id));
  }


  // Deliberately minimal projection (no employee PII) — used for public-ish
  // lists like sales reps; do not widen to full SafeUser.
  async getSafeUsersBySection(
    sectionId: number,
  ): Promise<
    Pick<
      SafeUser,
      | "id"
      | "username"
      | "display_name"
      | "display_name_ar"
      | "role_id"
      | "status"
      | "replit_user_id"
      | "created_at"
    >[]
  > {
    return await db
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
  }


  async getWarehouseReceiptsDetailed(): Promise<any[]> {
    return await db
      .select()
      .from(warehouse_receipts)
      .orderBy(desc(warehouse_receipts.id));
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


  async getUserRequestById(id: number): Promise<any | undefined> {
    const [r] = await db
      .select()
      .from(user_requests)
      .where(eq(user_requests.id, id));
    return r;
  }


  /**
   * Find leave/permission requests for the same user whose period overlaps
   * the given one. Leaves overlap on date ranges; permissions overlap when
   * on the same calendar day with intersecting time ranges.
   */
  async getOverlappingUserRequests(opts: {
    userId: number;
    type: string;
    statuses: string[];
    excludeId?: number;
    leaveStart?: Date | null;
    leaveEnd?: Date | null;
    permissionDate?: Date | null;
    permissionStart?: string | null;
    permissionEnd?: string | null;
  }): Promise<any[]> {
    const base = [
      eq(user_requests.user_id, opts.userId),
      eq(user_requests.type, opts.type),
      inArray(user_requests.status, opts.statuses),
    ];
    if (opts.excludeId) base.push(ne(user_requests.id, opts.excludeId));

    if (opts.type === "إجازة") {
      if (!opts.leaveStart || !opts.leaveEnd) return [];
      base.push(
        isNotNull(user_requests.leave_start_date),
        isNotNull(user_requests.leave_end_date),
        lte(user_requests.leave_start_date, opts.leaveEnd),
        gte(user_requests.leave_end_date, opts.leaveStart),
      );
    } else if (opts.type === "استئذان") {
      if (!opts.permissionStart || !opts.permissionEnd) return [];
      const day = opts.permissionDate ?? new Date();
      base.push(
        isNotNull(user_requests.permission_start_time),
        isNotNull(user_requests.permission_end_time),
        sql`DATE(${user_requests.date}) = DATE(${day})`,
        sql`${user_requests.permission_start_time} < ${opts.permissionEnd}`,
        sql`${user_requests.permission_end_time} > ${opts.permissionStart}`,
      );
    } else {
      return [];
    }
    return await db
      .select()
      .from(user_requests)
      .where(and(...base));
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


  // ==================== Bag Weight Records ====================
  async getBagWeightRecordsByUser(userId: number): Promise<BagWeightRecord[]> {
    return db
      .select()
      .from(bag_weight_records)
      .where(eq(bag_weight_records.user_id, userId))
      .orderBy(desc(bag_weight_records.created_at));
  }
}

export interface UsersStorage extends IStorage {}
