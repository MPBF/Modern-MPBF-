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
import { NotificationsStorage } from "./notifications";

export class SystemStorage extends NotificationsStorage {


  async exists(table: string, field: string, value: any): Promise<boolean> {
    try {
      if (!StorageBase.ALLOWED_TABLES.has(table)) {
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


  async getSystemHealthStatus(): Promise<any> {
    const checks = await this.getSystemHealthChecks(20);
    const healthyCount = checks.filter((c) => c.status === "healthy").length;
    const warningCount = checks.filter((c) => c.status === "warning").length;
    const criticalCount = checks.filter((c) => c.status === "critical").length;
    const checkTimes = checks
      .map((c) => c.last_check_time)
      .filter((value): value is Date => value instanceof Date);
    const lastCheck = checkTimes.sort(
      (a, b) => b.getTime() - a.getTime(),
    )[0];
    const overallStatus =
      criticalCount > 0
        ? "critical"
        : warningCount > 0
          ? "warning"
          : checks.length > 0 && healthyCount === checks.length
            ? "healthy"
            : "unknown";
    const uptimePercent =
      checks.length > 0 ? (healthyCount / checks.length) * 100 : 0;

    return {
      // Keep the original keys for existing consumers while exposing the
      // snake_case contract used by the SystemHealth page.
      status: overallStatus,
      checks,
      totalChecks: checks.length,
      healthyChecks: healthyCount,
      overall_status: overallStatus,
      healthy_checks: healthyCount,
      warning_checks: warningCount,
      critical_checks: criticalCount,
      last_check: lastCheck ?? null,
      uptime_percent: uptimePercent,
      total_checks: checks.length,
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


  async getAdvancedMetrics(): Promise<any> {
    return {};
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

      // النسخة الاحتياطية لا تتضمن كلمات مرور المستخدمين (تُحذف عند الإنشاء)،
      // لذا نحفظها قبل الحذف ونعيدها بعد الاستعادة حتى لا تُفقد صلاحيات الدخول
      const savedPasswords = new Map<number, string>();
      if (tablesToRestore.includes("users")) {
        const pwResult = await client.query(
          `SELECT id, password FROM "users" WHERE password IS NOT NULL`,
        );
        for (const r of pwResult.rows as any[]) {
          savedPasswords.set(r.id, r.password);
        }
      }

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

        // استبعاد الأعمدة المحسوبة تلقائياً (GENERATED) — لا يمكن إدراج قيم فيها
        // ومعرفة أعمدة المصفوفات لتمريرها كمصفوفة وليس نص JSON
        const colInfoResult = await client.query(
          `SELECT column_name, is_generated, data_type FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1`,
          [tableName],
        );
        const generatedCols = new Set(
          (colInfoResult.rows as any[])
            .filter((r) => r.is_generated === "ALWAYS")
            .map((r) => r.column_name),
        );
        const arrayCols = new Set(
          (colInfoResult.rows as any[])
            .filter((r) => r.data_type === "ARRAY")
            .map((r) => r.column_name),
        );

        try {
          let insertedCount = 0;
          let failedCount = 0;
          let firstError: string | null = null;
          for (const row of rows) {
            const columns = Object.keys(row).filter(
              (c) => !generatedCols.has(c),
            );
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
                // أعمدة المصفوفات الحقيقية: يمرر pg المصفوفة مباشرة؛
                // أعمدة jsonb: تحتاج نص JSON
                return arrayCols.has(c) ? val : JSON.stringify(val);
              }
              return val;
            });

            // SAVEPOINT per row: a failed INSERT inside a transaction aborts
            // the whole transaction in PostgreSQL ("current transaction is
            // aborted") — rolling back to the savepoint keeps the transaction
            // usable so one bad row doesn't kill the entire restore.
            try {
              await client.query("SAVEPOINT sp_row");
              await client.query(
                `INSERT INTO "${tableName}" (${quotedCols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                values,
              );
              await client.query("RELEASE SAVEPOINT sp_row");
              insertedCount++;
            } catch (rowErr: any) {
              await client.query("ROLLBACK TO SAVEPOINT sp_row");
              await client.query("RELEASE SAVEPOINT sp_row");
              failedCount++;
              if (!firstError) {
                firstError = rowErr.message;
                console.warn(
                  `تحذير: تعذر إدراج سجل في ${tableName}:`,
                  rowErr.message,
                );
              }
            }
          }

          if (failedCount > 1) {
            console.warn(
              `تحذير: فشل إدراج ${failedCount} سجل في ${tableName} (أول خطأ: ${firstError})`,
            );
          }

          totalRestored += insertedCount;
          results.push({
            table: tableName,
            records: insertedCount,
            status:
              failedCount > 0
                ? `تم (${insertedCount} نجح، ${failedCount} فشل: ${firstError})`
                : "تم",
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

      // إعادة كلمات المرور المحفوظة للمستخدمين بعد الاستعادة
      if (savedPasswords.size > 0) {
        let restoredPw = 0;
        for (const [userId, password] of Array.from(savedPasswords)) {
          try {
            await client.query("SAVEPOINT sp_pw");
            const upd = await client.query(
              `UPDATE "users" SET password = $1 WHERE id = $2 AND password IS NULL`,
              [password, userId],
            );
            await client.query("RELEASE SAVEPOINT sp_pw");
            restoredPw += upd.rowCount ?? 0;
          } catch {
            await client.query("ROLLBACK TO SAVEPOINT sp_pw");
          }
        }
        console.log(
          `تمت إعادة كلمات المرور لـ ${restoredPw} مستخدم بعد الاستعادة`,
        );
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


  async getBackupFile(backupId: string): Promise<any> {
    return null;
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
}

export interface SystemStorage extends IStorage {}
