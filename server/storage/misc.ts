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
import { SystemStorage } from "./system";

export class MiscStorage extends SystemStorage {


  // يبحث عن آخر تسجيل دخول مفتوح (لم يُسجَّل خروجه بعد) خلال الـ 24 ساعة الماضية.
  // يُستخدم لدعم موظفي الوردية الليلية الذين يدخلون قبل منتصف الليل ويخرجون بعده.
  async findOpenCheckIn(userId: number): Promise<Attendance | null> {
    return withDatabaseErrorHandling(
      async () => {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [record] = await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.user_id, userId),
              isNotNull(attendance.check_in_time),
              isNull(attendance.check_out_time),
              sql`${attendance.check_in_time} >= ${cutoff.toISOString()}`,
            ),
          )
          .orderBy(desc(attendance.check_in_time))
          .limit(1);
        return record ?? null;
      },
      "findOpenCheckIn",
      `جلب تسجيل الدخول المفتوح للمستخدم ${userId}`,
    );
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


  async lookupByBarcode(barcode: string): Promise<any> {
    return null;
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

export interface MiscStorage extends IStorage {}
