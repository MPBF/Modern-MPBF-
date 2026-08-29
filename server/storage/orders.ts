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
import { UsersStorage } from "./users";

export class OrdersStorage extends UsersStorage {


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


  async deleteCustomer(id: string | any): Promise<{
    deleted: boolean;
    notFound?: boolean;
    related?: Record<string, number>;
  }> {
    const customerId = String(id).trim();
    return db.transaction(async (tx) => {
      const [customer] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, customerId))
        .for("update");
      if (!customer) return { deleted: false, notFound: true };

      // Check every customer-owned relation before deleting. This gives the
      // UI a useful explanation instead of relying on a generic FK error.
      const result = await tx.execute(sql`
        SELECT
          (SELECT COUNT(*) FROM orders WHERE customer_id = ${customerId})::int AS orders,
          (SELECT COUNT(*) FROM customer_products WHERE customer_id = ${customerId})::int AS customer_products,
          (SELECT COUNT(*) FROM finished_goods_vouchers_in WHERE customer_id = ${customerId})::int AS finished_goods_vouchers_in,
          (SELECT COUNT(*) FROM finished_goods_vouchers_out WHERE customer_id = ${customerId})::int AS finished_goods_vouchers_out,
          (SELECT COUNT(*) FROM quality_issues WHERE customer_id = ${customerId})::int AS quality_issues,
          (SELECT COUNT(*) FROM customer_service_cases WHERE customer_id = ${customerId})::int AS customer_service_cases
      `);
      const counts = (result.rows[0] || {}) as Record<string, unknown>;
      const related: Record<string, number> = {};
      for (const [key, value] of Object.entries(counts)) {
        const numericValue = Number(value) || 0;
        if (numericValue > 0) related[key] = numericValue;
      }
      if (Object.keys(related).length > 0) {
        return { deleted: false, related };
      }

      await tx.delete(customers).where(eq(customers.id, customerId));
      return { deleted: true, related: {} };
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


  async optimizeQueueOrder(
    machineId: string | number,
  ): Promise<MachineQueue[]> {
    return this.getMachineQueue(machineId as any);
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


  async getProductionOrdersByStatus(
    status: string,
  ): Promise<ProductionOrder[]> {
    return await db
      .select()
      .from(production_orders)
      .where(eq(production_orders.status, status))
      .orderBy(desc(production_orders.id));
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


  // Suggest a queue ordering for one machine.
  //
  // sortMethod controls the ordering strategy:
  //   "similarity"  (default) — Material → Color → Size/Width/Thickness.
  //                             Stage-specific sub-ordering within each group.
  //   "throughput"            — Material → quantity_kg desc → Color.
  //                             Run biggest batches first to maximise throughput.
  //   "color_first"           — Clear products first → Color cluster →
  //                             Material → Width.  Minimises ink/colour changes.
  async suggestQueueOrder(
    machineId: string,
    stage: string,
    sortMethod: string = "similarity",
  ): Promise<any[]> {
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

    // ── field-extraction helpers ──────────────────────────────────────────
    const matOf = (r: any) => String(r.raw_material ?? "").trim().toUpperCase();
    const colorOf = (r: any) => String(r.master_batch_id ?? "").trim();
    const widthOf = (r: any) => parseFloat(String(r.width ?? "")) || 0;
    const thickOf = (r: any) =>
      parseFloat(String(r.universal_thickness ?? r.thickness ?? "")) || 0;
    const kgOf = (r: any) =>
      parseFloat(String(r.final_quantity_kg ?? r.quantity_kg ?? "")) || 0;
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

    // ── sort strategies ───────────────────────────────────────────────────

    if (sortMethod === "throughput") {
      // Primary: material type (keeps machine mono-material).
      // Secondary: quantity desc — run the heaviest batches first to
      //            maximise machine throughput before setup changes.
      // Tertiary: colour cluster, then stable index.
      sorted = withIndex.sort((a, b) => {
        const aMat = matOf(a.it);
        const bMat = matOf(b.it);
        if (aMat !== bMat) return aMat.localeCompare(bMat);
        const aKg = kgOf(a.it);
        const bKg = kgOf(b.it);
        if (aKg !== bKg) return bKg - aKg; // descending
        const aC = colorOf(a.it);
        const bC = colorOf(b.it);
        if (aC !== bC) return aC.localeCompare(bC);
        return a.idx - b.idx;
      });
    } else if (sortMethod === "color_first") {
      // Primary: clear/transparent products first (no colour change needed).
      // Secondary: colour cluster — group identical colours regardless of size.
      // Tertiary: material, then width ascending, then stable index.
      sorted = withIndex.sort((a, b) => {
        const aClear = this.isClearProduct(a.it) ? 0 : 1;
        const bClear = this.isClearProduct(b.it) ? 0 : 1;
        if (aClear !== bClear) return aClear - bClear;
        const aC = colorOf(a.it);
        const bC = colorOf(b.it);
        if (aC !== bC) return aC.localeCompare(bC);
        const aMat = matOf(a.it);
        const bMat = matOf(b.it);
        if (aMat !== bMat) return aMat.localeCompare(bMat);
        return widthOf(a.it) - widthOf(b.it) || a.idx - b.idx;
      });
    } else {
      // ── similarity (default) — Material → Colour → Size ─────────────
      // Stage-specific sub-ordering within each material+colour group.
      if (stage === "film") {
        sorted = withIndex.sort((a, b) => {
          // 1. Raw material type (HDPE before LDPE etc.)
          const aMat = matOf(a.it);
          const bMat = matOf(b.it);
          if (aMat !== bMat) return aMat.localeCompare(bMat);
          // 2. Clear/transparent products first within the same material
          const aClear = this.isClearProduct(a.it) ? 0 : 1;
          const bClear = this.isClearProduct(b.it) ? 0 : 1;
          if (aClear !== bClear) return aClear - bClear;
          // 3. Colour cluster (master_batch_id)
          const aC = colorOf(a.it);
          const bC = colorOf(b.it);
          if (aC !== bC) return aC.localeCompare(bC);
          // 4. Width ascending (minimises die-head adjustment)
          const aW = widthOf(a.it);
          const bW = widthOf(b.it);
          if (aW !== bW) return aW - bW;
          // 5. Thickness ascending, then stable index
          return thickOf(a.it) - thickOf(b.it) || a.idx - b.idx;
        });
      } else if (stage === "printing") {
        sorted = withIndex.sort((a, b) => {
          // 1. Raw material
          const aMat = matOf(a.it);
          const bMat = matOf(b.it);
          if (aMat !== bMat) return aMat.localeCompare(bMat);
          // 2. Print colour count ascending (fewer → more minimises setup)
          const aPc = a.it.print_colors_count ?? 0;
          const bPc = b.it.print_colors_count ?? 0;
          if (aPc !== bPc) return aPc - bPc;
          // 3. Colour-signature cluster
          const aSig = colorSig(a.it);
          const bSig = colorSig(b.it);
          if (aSig !== bSig) return aSig.localeCompare(bSig);
          // 4. Width ascending, then stable index
          return widthOf(a.it) - widthOf(b.it) || a.idx - b.idx;
        });
      } else {
        // cutting / default
        sorted = withIndex.sort((a, b) => {
          // 1. Raw material
          const aMat = matOf(a.it);
          const bMat = matOf(b.it);
          if (aMat !== bMat) return aMat.localeCompare(bMat);
          // 2. Colour cluster
          const aC = colorOf(a.it);
          const bC = colorOf(b.it);
          if (aC !== bC) return aC.localeCompare(bC);
          // 3. Size caption cluster
          const aKey = String(a.it.size_caption ?? "");
          const bKey = String(b.it.size_caption ?? "");
          if (aKey !== bKey) return aKey.localeCompare(bKey);
          // 4. Width ascending, then stable index
          return widthOf(a.it) - widthOf(b.it) || a.idx - b.idx;
        });
      }
    }

    return sorted.map((s) => s.it);
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
}

export interface OrdersStorage extends IStorage {}
