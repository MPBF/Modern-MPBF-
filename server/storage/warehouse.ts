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
import { QualityStorage } from "./quality";

export class WarehouseStorage extends QualityStorage {


  async getAllWaste(): Promise<any[]> {
    return await db.select().from(waste).orderBy(desc(waste.id));
  }


  async createWaste(data: any): Promise<any> {
    const [w] = await db.insert(waste).values(data).returning();
    return w;
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


  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(items.name);
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
      // ── Step 1: merge items by PO and pre-validate packaging units (read-only) ──
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

      if (mergedByPo.size === 0) {
        throw new Error("لم يتم إدخال أي كميات صالحة");
      }

      // Optional packaging unit per receipt line. When provided, validate that
      // (rolls_per_unit * roll_weight_g/1000) * units_count is within ±2% of
      // weight_kg. This is read-only so can safely run before the transaction.
      const packagingMeta = new Map<
        number,
        {
          packagingUnitId: number | null;
          unitsCount: number | null;
          packagingUnitName: string | null;
        }
      >();
      for (const [poId, { weight, item }] of Array.from(mergedByPo)) {
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
        packagingMeta.set(poId, { packagingUnitId, unitsCount, packagingUnitName });
      }

      // ── Step 2: transaction – lock each PO row, re-validate inside the lock,
      //    update warehouse_received_kg, detect completion ────────────────────
      const completedPoIds: number[] = [];

      const voucher = await db.transaction(async (tx) => {
        const validatedItems: any[] = [];
        let totalWeight = 0;
        // Store ready-weight per PO (computed inside lock) so we can reuse it
        // for the completion check without a second query.
        const readyWeightByPoId = new Map<number, number>();

        for (const [poId, { weight, item }] of Array.from(mergedByPo)) {
          // Lock the row – serialises concurrent receipts for the same PO.
          const lockedRows = await tx.execute(
            sql`SELECT * FROM production_orders WHERE id = ${poId} FOR UPDATE`,
          );
          const po: any = (lockedRows.rows as any[])[0];
          if (!po) {
            throw new Error(`أمر الإنتاج رقم ${poId} غير موجود`);
          }

          // "Ready to receive" basis: plastic-roll products are never cut, so
          // their ready weight is the produced (done) roll weight; everything
          // else uses the cut weight. Mirrors getProductionHallOrders so the
          // receipt math matches what the warehouse user sees.
          const rwResult = await tx.execute(sql`
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
            String((rwResult.rows[0] as any)?.total_ready_weight || "0"),
          );
          readyWeightByPoId.set(poId, totalReadyWeight);

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

          const meta = packagingMeta.get(poId)!;
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
            packaging_unit_id: meta.packagingUnitId,
            units_count: meta.unitsCount,
            packaging_unit_name: meta.packagingUnitName,
          });
        }

        if (validatedItems.length === 0) {
          throw new Error("لم يتم إدخال أي كميات صالحة");
        }

        // If a single line and it carries a packaging unit, surface those at the
        // top level too for easier listing/filtering. Multi-line vouchers keep the
        // per-item details inside the JSON `items` payload.
        const singlePackagingUnitId =
          validatedItems.length === 1
            ? validatedItems[0].packaging_unit_id
            : null;
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

        const [v] = await tx
          .insert(finished_goods_vouchers_in)
          .values(voucherData)
          .returning();

        for (const item of validatedItems) {
          const [updated] = await tx
            .update(production_orders)
            .set({
              warehouse_received_kg: sql`CAST(${production_orders.warehouse_received_kg} AS NUMERIC) + ${item.weight_kg}`,
            })
            .where(eq(production_orders.id, item.production_order_id))
            .returning({
              warehouse_received_kg:
                production_orders.warehouse_received_kg,
            });

          // Transition to 'completed' when the full produced quantity has been
          // received. Uses the ready-weight value captured under the lock to
          // avoid a second round-trip.
          const readyKg = readyWeightByPoId.get(item.production_order_id) ?? 0;
          const newReceived = parseFloat(
            String(updated?.warehouse_received_kg || "0"),
          );
          if (readyKg > 0 && newReceived >= readyKg - 0.01) {
            await tx
              .update(production_orders)
              .set({ status: "completed" })
              .where(
                and(
                  eq(production_orders.id, item.production_order_id),
                  sql`status <> 'completed'`,
                ),
              );
            completedPoIds.push(item.production_order_id);
          }
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

      // After the transaction commits, propagate completion to the parent order.
      for (const poId of completedPoIds) {
        await this.maybeCompleteParentOrder(poId);
      }

      return voucher;
    }

    // ── Single-PO path ──────────────────────────────────────────────────────
    const poId = data.production_order_id
      ? typeof data.production_order_id === "string"
        ? parseInt(data.production_order_id)
        : data.production_order_id
      : null;

    data.receipt_time = data.receipt_time || new Date();

    let singleCompletedPoId: number | null = null;

    const voucher = await db.transaction(async (tx) => {
      if (poId) {
        // Lock the PO row to serialise concurrent receipts.
        const lockedRows = await tx.execute(
          sql`SELECT * FROM production_orders WHERE id = ${poId} FOR UPDATE`,
        );
        const po: any = (lockedRows.rows as any[])[0];
        if (!po) {
          throw new Error("أمر الإنتاج غير موجود");
        }

        // Plastic-roll products are never cut: their ready weight is the
        // produced (done) roll weight; everything else uses cut weight.
        const readyWeightResult = await tx.execute(sql`
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
          String(
            (readyWeightResult.rows[0] as any)?.total_ready_weight || "0",
          ),
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

        const [v] = await tx
          .insert(finished_goods_vouchers_in)
          .values(data)
          .returning();

        const receiveQty2 = parseFloat(
          String(data.weight_kg || data.quantity || "0"),
        );
        const [updated] = await tx
          .update(production_orders)
          .set({
            warehouse_received_kg: sql`CAST(${production_orders.warehouse_received_kg} AS NUMERIC) + ${receiveQty2}`,
          })
          .where(eq(production_orders.id, poId))
          .returning({
            warehouse_received_kg: production_orders.warehouse_received_kg,
          });

        // Transition to 'completed' when the full produced quantity has been
        // received.
        const newReceived = parseFloat(
          String(updated?.warehouse_received_kg || "0"),
        );
        if (totalReadyWeight > 0 && newReceived >= totalReadyWeight - 0.01) {
          await tx
            .update(production_orders)
            .set({ status: "completed" })
            .where(
              and(
                eq(production_orders.id, poId),
                sql`status <> 'completed'`,
              ),
            );
          singleCompletedPoId = poId;
        }

        if (data.item_id) {
          const qty = parseFloat(
            String(data.weight_kg || data.quantity || "0"),
          );
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
      }

      // No production_order_id on this voucher – plain inventory movement.
      const [v] = await tx
        .insert(finished_goods_vouchers_in)
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

    // After the transaction commits, propagate completion to the parent order.
    if (singleCompletedPoId !== null) {
      await this.maybeCompleteParentOrder(singleCompletedPoId);
    }

    return voucher;
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
      // Collect affected production order IDs for post-subtraction status revert.
      const affectedPoIds: number[] = [];

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
            if (!affectedPoIds.includes(itemPoId)) {
              affectedPoIds.push(itemPoId);
            }
          }
        }
      } else if (poId && totalQty > 0) {
        await tx
          .update(production_orders)
          .set({
            warehouse_received_kg: sql`GREATEST(0, CAST(${production_orders.warehouse_received_kg} AS NUMERIC) - ${totalQty})`,
          })
          .where(eq(production_orders.id, poId));
        affectedPoIds.push(poId);
      }

      // Revert any PO that was 'completed' but is no longer fully received.
      for (const affectedPoId of affectedPoIds) {
        const [poRow] = await tx
          .select({
            warehouse_received_kg: production_orders.warehouse_received_kg,
            status: production_orders.status,
          })
          .from(production_orders)
          .where(eq(production_orders.id, affectedPoId));

        if (!poRow || poRow.status !== "completed") continue;

        const newReceived = parseFloat(
          String(poRow.warehouse_received_kg || "0"),
        );

        // Compute the total ready weight (rolls at stage='done') for this PO.
        const rwRes = await tx.execute(sql`
          SELECT COALESCE(SUM(
            CASE WHEN (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%')
              THEN r.weight_kg ELSE r.cut_weight_total_kg END
          ), 0) AS total_ready_weight
          FROM rolls r
          JOIN production_orders po2 ON po2.id = r.production_order_id
          JOIN customer_products cp  ON cp.id  = po2.customer_product_id
          LEFT JOIN items i           ON i.id   = cp.item_id
          WHERE r.production_order_id = ${affectedPoId} AND r.stage = 'done'
        `);
        const totalReady = parseFloat(
          String((rwRes as any).rows?.[0]?.total_ready_weight ?? "0"),
        );

        // If the warehouse has not yet received the full ready quantity, reopen.
        if (totalReady > 0 && newReceived < totalReady - 0.01) {
          await tx
            .update(production_orders)
            .set({ status: "active" })
            .where(
              and(
                eq(production_orders.id, affectedPoId),
                sql`status = 'completed'`,
              ),
            );
        }
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

      if (mergedByPo.size === 0) {
        throw new Error("لم يتم إدخال أي كميات صالحة");
      }

      // ── Transaction: lock each PO row, re-validate under the lock, then update ──
      return await db.transaction(async (tx) => {
        const validatedItems: any[] = [];
        let totalWeight = 0;

        for (const [poId, { weight, item }] of Array.from(mergedByPo)) {
          // Lock the row – serialises concurrent deliveries for the same PO.
          const lockedRows = await tx.execute(
            sql`SELECT * FROM production_orders WHERE id = ${poId} FOR UPDATE`,
          );
          const po: any = (lockedRows.rows as any[])[0];
          if (!po) {
            throw new Error(`أمر الإنتاج رقم ${poId} غير موجود`);
          }

          // Re-read available quantity under the lock so a concurrent delivery
          // that already committed will be visible here.
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


  async getFactoryLocation(id: number): Promise<FactoryLocation | undefined> {
    const [l] = await db
      .select()
      .from(factory_locations)
      .where(eq(factory_locations.id, id));
    return l;
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
}

export interface WarehouseStorage extends IStorage {}
