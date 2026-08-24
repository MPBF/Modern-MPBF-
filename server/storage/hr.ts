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
import {
  applyApprovedLeaveToAttendance as applyApprovedLeaveToAttendanceImpl,
  getApprovedPermissionMinutes as getApprovedPermissionMinutesImpl,
} from "../services/leave-attendance";
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
import { MachinesStorage } from "./machines";

export class HrStorage extends MachinesStorage {


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
        .where(
          and(
            eq(users.status, "active"),
            eq(users.include_in_attendance, true),
          ),
        );

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
      eq(users.include_in_attendance, true),
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
      .where(
        and(
          eq(users.status, "active"),
          eq(users.include_in_attendance, true),
        ),
      );

    const total = totalUsers[0]?.count || 0;

    const attendanceRecords = await db
      .select({ record: attendance })
      .from(attendance)
      .innerJoin(users, eq(attendance.user_id, users.id))
      .where(
        and(
          eq(attendance.date, date),
          eq(users.include_in_attendance, true),
        ),
      );

    const present = attendanceRecords.filter(
      ({ record }) => record.status === "حاضر" || record.check_in_time !== null,
    ).length;
    const onLeave = attendanceRecords.filter(
      ({ record }) => record.status === "إجازة",
    ).length;
    const late = attendanceRecords.filter(
      ({ record }) => (record.late_minutes || 0) > 0,
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
      // لم توجد سجلات لهذا اليوم — تحقق من وجود وردية ليلية مفتوحة من اليوم السابق
      const openRecord = await this.findOpenCheckIn(userId);
      if (openRecord && String(openRecord.date) !== date) {
        // الموظف دخل قبل منتصف الليل ولم يخرج بعد — جلب كل سجلات ذلك اليوم
        const shiftRecords = await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.user_id, userId),
              eq(attendance.date, openRecord.date as string),
            ),
          )
          .orderBy(desc(attendance.created_at));
        const shiftLatest = shiftRecords[0];
        return {
          status: shiftLatest.status,
          currentStatus: shiftLatest.status,
          hasCheckedIn: shiftRecords.some((r) => r.status === "حاضر"),
          hasStartedLunch: shiftRecords.some(
            (r) => r.status === "في الاستراحة",
          ),
          hasEndedLunch: shiftRecords.some((r) => r.status === "يعمل"),
          hasCheckedOut: false,
          check_in_time:
            shiftRecords.find((r) => r.status === "حاضر")?.check_in_time ||
            shiftLatest.check_in_time,
          check_out_time: null,
          lunch_start_time:
            shiftRecords.find((r) => r.status === "في الاستراحة")
              ?.lunch_start_time || null,
          lunch_end_time:
            shiftRecords.find((r) => r.status === "يعمل")?.lunch_end_time ||
            null,
          work_hours: shiftLatest.work_hours,
          records: shiftRecords,
          crossesMidnight: true,        // علم: الوردية تعبر منتصف الليل
          openShiftDate: openRecord.date, // تاريخ تسجيل الدخول الأصلي
        };
      }
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
          .where(
            and(
              eq(users.status, "active"),
              eq(users.include_in_attendance, true),
            ),
          )
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
          .where(eq(users.include_in_attendance, true))
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
          .where(
            and(
              eq(users.id, userId),
              eq(users.include_in_attendance, true),
            ),
          )
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


  // عند اعتماد طلب إجازة: انعكاس تلقائي على سجل الحضور (أيام "إجازة").
  // التنفيذ في server/services/leave-attendance.ts.
  async applyApprovedLeaveToAttendance(request: {
    id: number;
    user_id: number | null;
    leave_start_date: Date | string | null;
    leave_end_date: Date | string | null;
    reviewed_by?: number | null;
  }): Promise<void> {
    return withDatabaseErrorHandling(
      async () => applyApprovedLeaveToAttendanceImpl(request),
      "applyApprovedLeaveToAttendance",
      "تسجيل أيام الإجازة المعتمدة في الحضور",
    );
  }

  // دقائق الاستئذان المعتمدة لكل مستخدم/يوم ضمن المدى: تُخصم من
  // التأخير/المغادرة المبكرة/الانسحاب في محرك الحضور (وبالتالي من الأجور).
  private async getApprovedPermissionMinutes(
    userIds: number[],
    from: string,
    to: string,
  ): Promise<Map<number, Map<string, number>>> {
    return getApprovedPermissionMinutesImpl(userIds, from, to);
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
        const permByUser = await this.getApprovedPermissionMinutes(
          [userId],
          from,
          to,
        );
        return computeEmployeeAttendance(rows as any, shiftMap, from, to, 0, {
          permissionMinutesByDate: permByUser.get(userId),
        });
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

        const employeeConditions = [eq(users.include_in_attendance, true)];
        if (sectionId) {
          employeeConditions.push(eq(users.section_id, sectionId));
        }
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
          .where(and(...employeeConditions))
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

        const permByUser = await this.getApprovedPermissionMinutes(
          userIds,
          from,
          to,
        );

        return empRows.map((emp) => {
          const shiftMap = this.buildShiftMap(assignByUser.get(emp.id) ?? []);
          const result = computeEmployeeAttendance(
            rowsByUser.get(emp.id) ?? [],
            shiftMap,
            from,
            to,
            0,
            { permissionMinutesByDate: permByUser.get(emp.id) },
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


  async getPerformanceSummary(timeRange: string): Promise<any> {
    const metrics = await this.getSystemPerformanceMetrics({ limit: 100 });
    return { timeRange, metrics, count: metrics.length };
  }


  async getAdminDecisions(): Promise<AdminDecision[]> {
    return this.getAllAdminDecisions();
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


  async getPendingLeaveRequests(): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leave_requests)
      .where(eq(leave_requests.final_status, "pending"))
      .orderBy(desc(leave_requests.created_at));
  }


  async getHRReports(options?: any): Promise<any> {
    return { reports: [] };
  }
}

export interface HrStorage extends IStorage {}
