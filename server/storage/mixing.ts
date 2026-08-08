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
import { WarehouseStorage } from "./warehouse";

export class MixingStorage extends WarehouseStorage {


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
}

export interface MixingStorage extends IStorage {}
