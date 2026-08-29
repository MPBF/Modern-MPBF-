import type { Express, Request } from "express";

import crypto from "crypto";
import { createServer, type Server } from "http";

import bcrypt from "bcrypt";
import { storage } from "../storage";
import { db } from "../db";

import {
  insertUserSchema,
  insertNewOrderSchema,
  insertProductionOrderSchema,
  insertRollSchema,
  insertMaintenanceRequestSchema,
  insertMaintenanceActionSchema,
  insertMaintenanceReportSchema,
  insertMaintenanceComponentSchema,
  updateMaintenanceComponentSchema,
  createPreventiveMaintenanceSchema,
  updatePreventiveMaintenanceSchema,
  insertOperatorNegligenceReportSchema,
  insertConsumablePartSchema,
  insertConsumablePartTransactionSchema,
  insertInventoryMovementSchema,
  insertInventorySchema,
  insertCutSchema,
  insertWarehouseReceiptSchema,
  insertProductionSettingsSchema,
  insertCustomerProductSchema,
  insertMasterBatchColorSchema,
  insertQualityIssueSchema,
  insertQualityInspectionFormSchema,
  insertQualityIssueResponsibleSchema,
  insertQualityIssueActionSchema,
  insertQuickNoteSchema,
  insertNotificationTemplateSchema,
  insertTrainingRecordSchema,
  insertAdminDecisionSchema,
  insertTrainingProgramSchema,
  insertTrainingMaterialSchema,
  insertTrainingEnrollmentSchema,
  insertTrainingEvaluationSchema,
  insertTrainingCertificateSchema,
  insertPerformanceReviewSchema,
  insertPerformanceCriteriaSchema,
  insertLeaveTypeSchema,
  insertLeaveRequestSchema,
  insertLeaveBalanceSchema,
  insertSystemSettingSchema,
  orders,
  production_orders,
  rolls,
  customers,
  customer_products,
  locations,
  users,
  attendance,
  violations,
  factory_layouts,
  factory_snapshots,
  insertFactorySnapshotSchema,
  notifications as notificationsTable,
  insertDisplaySlideSchema,
  user_settings,
  roles,
  inventory,
  items,
  face_registrations,
  mobile_device_tokens,
  mobile_sessions,
  mobile_sync_queue,
  company_profile,
  insertSparePartSchema,
  updateSparePartSchema,
  insertViolationSchema,
  updateViolationSchema,
  insertWorkViolationSchema,
  updateWorkViolationSchema,
  updateWorkViolationTypeSchema,
  updateWorkViolationSettingsSchema,
  waiveWorkViolationSchema,
  insertAttendanceWithdrawalSchema,
  createUserApiSchema,
  updateUserSchema,
  insertMixingRecipeSchema,
  insertBagWeightRecordSchema,
  insertDeliveryManifestSchema,
  insertAdminToolDocumentSchema,
  insertPackagingUnitSchema,
  insertShiftAssignmentSchema,
  insertRewardSchema,
  updateRewardSchema,
  insertEmployeeCustodySchema,
  updateEmployeeCustodySchema,
  insertEmployeeTraitSchema,
  updateEmployeeTraitSchema,
  insertIndustrialWasteVoucherInSchema,
  insertIndustrialWasteVoucherOutSchema,
  updateIndustrialWasteVoucherInSchema,
  updateIndustrialWasteVoucherOutSchema,
} from "@shared/schema";
import { isShiftType, factoryNowParts } from "@shared/shifts";
import { invalidateLetterheadCache } from "../modern-agent/letterhead";
import { hasPermission } from "@shared/permissions";
import { eq, sql, and, gte, lte, gt, desc, inArray } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import {
  parseIntSafe,
  parseFloatSafe,
  coercePositiveInt,
  coerceNonNegativeInt,
  extractNumericId,
  generateNextId,
} from "@shared/validation-utils";
import {
  createAlertsRouter,
  createSystemHealthRouter,
  createPerformanceRouter,
  createCorrectiveActionsRouter,
  createDataValidationRouter,
} from "./alerts";
import { getSystemHealthMonitor } from "../services/system-health-monitor";
import { getAlertManager } from "../services/alert-manager";
import { getDataValidator } from "../services/data-validator";
import QRCode from "qrcode";
import { validateRequest, commonSchemas } from "../middleware/validation";
import { calculateProductionQuantities } from "@shared/quantity-utils";
import ExcelJS from "exceljs";
import multer from "multer";

import { resolveSessionUser } from "../auth/sessionUser";
import {
  createPerformanceIndexes,
  createTextSearchIndexes,
} from "../database-optimizations";
import { logger } from "../lib/logger";
import {
  requireAuth,
  requirePermission,
  requireAdmin,
  type AuthRequest,
} from "../middleware/auth";
import {
  generateMobileToken,
  revokeMobileToken,
  invalidateRolesCache,
  invalidateUserCache,
  getCachedRoles,
  createMobileSession,
  refreshMobileSession,
  revokeMobileSession,
} from "../middleware/session-auth";
import {
  setupAuth,
  isAuthenticated as isAuthenticatedReplit,
} from "../replitAuth";
import {
  getNotificationManager,
  type SystemNotificationData,
} from "../services/notification-manager";
import { NotificationService } from "../services/notification-service";
import { TaqnyatSMSService } from "../services/taqnyat-sms";
import {
  translateAnnouncement,
  ensureAnnouncementTranslations,
} from "../services/announcement-translation";
import { setNotificationManager } from "../storage";
import {
  notificationService,
  taqnyatSMS,
  getAuthUserId,
  parseRouteParam,
  insertCustomerSchema,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerOrdersRoutes(app: Express, ctx: any) {
  const {
    deliveryManifestPayloadSchema,
    parseManifestId,
  } = ctx;


  // Orders routes — pagination default-on (limit=50, max=500). Response is a
  // plain array (historical contract). Clients needing the full list pass an
  // explicit `?limit=500`. Pagination metadata is exposed via headers.
  app.get("/api/orders", requireAuth, requirePermission("view_orders", "manage_orders", "admin"), async (req, res) => {
    try {
      const limit = Math.max(
        1,
        Math.min(parseInt(String(req.query.limit ?? "")) || 50, 500),
      );
      const offset = Math.max(0, parseInt(String(req.query.offset ?? "")) || 0);
      const orders = await storage.getAllOrders({ limit, offset });

      if (!Array.isArray(orders)) {
        return res.status(500).json({
          message: "خطأ في تحميل الطلبات",
          success: false,
        });
      }

      res.set("X-Pagination-Limit", String(limit));
      res.set("X-Pagination-Offset", String(offset));
      res.set("X-Pagination-Count", String(orders.length));
      res.json(orders);
    } catch (error: any) {
      console.error("Orders fetch error:", error);

      res.status(500).json({
        message: "خطأ في جلب الطلبات",
        success: false,
      });
    }
  });

  // Generate next order number using SQL MAX for atomicity (preview only)
  app.get("/api/orders/next-number", requireAuth, async (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      const result = await db.execute(
        sql`SELECT MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)) as max_num 
            FROM orders 
            WHERE order_number ~ '^ORD[0-9]+$'`,
      );
      const maxNum = (result as any).rows?.[0]?.max_num || 0;
      const nextNumber = maxNum + 1;
      const orderNumber = `ORD${nextNumber.toString().padStart(3, "0")}`;

      res.json({ orderNumber });
    } catch (error) {
      console.error("Order number generation error:", error);
      res.status(500).json({ message: "خطأ في توليد رقم الطلب" });
    }
  });

  app.post(
    "/api/orders",
    requireAuth,
    validateRequest({ body: commonSchemas.createOrder }),
    async (req, res) => {
      try {
        // Session is already validated by requireAuth middleware
        const userId = getAuthUserId(req);
        if (!userId || typeof userId !== "number") {
          return res.status(401).json({
            message: "معرف المستخدم غير صحيح",
            success: false,
          });
        }

        // Validate required fields are present
        const { customer_id } = req.body;
        let { order_number } = req.body;
        if (!customer_id?.trim()) {
          return res.status(400).json({
            message: "معرف العميل مطلوب",
            success: false,
          });
        }

        // Prepare delivery days
        let deliveryDays: number | null = null;
        if (req.body.delivery_days) {
          try {
            deliveryDays = parseIntSafe(
              req.body.delivery_days,
              "Delivery days",
              { min: 1, max: 365 },
            );
          } catch (error) {
            return res.status(400).json({
              message: "قيمة أيام التسليم غير صحيحة",
              success: false,
            });
          }
        }

        // Auto-generate or validate order number, with retry on duplicate
        const MAX_RETRIES = 3;
        let order = null;
        let lastError: any = null;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            if (!order_number?.trim() || attempt > 0) {
              const result = await db.execute(
                sql`SELECT MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)) as max_num 
                    FROM orders 
                    WHERE order_number ~ '^ORD[0-9]+$'`,
              );
              const maxNum = (result as any).rows?.[0]?.max_num || 0;
              order_number = `ORD${(maxNum + 1 + attempt).toString().padStart(3, "0")}`;
            } else if (attempt === 0) {
              const existingResult = await db.execute(
                sql`SELECT id FROM orders WHERE order_number = ${order_number.trim()} LIMIT 1`,
              );
              if ((existingResult as any).rows?.length > 0) {
                return res.status(409).json({
                  message: "رقم الطلب موجود مسبقاً. يرجى المحاولة مرة أخرى.",
                  success: false,
                });
              }
            }

            const orderData = {
              ...req.body,
              created_by: userId,
              delivery_days: deliveryDays,
              customer_id: customer_id.trim(),
              order_number: order_number.trim(),
              notes: req.body.notes?.trim() || null,
            };

            const validatedData = insertNewOrderSchema.parse(orderData);
            order = await storage.createOrder(validatedData);
            break;
          } catch (retryError: any) {
            lastError = retryError;
            if (
              retryError?.message?.includes("unique") ||
              retryError?.message?.includes("duplicate") ||
              retryError?.code === "23505"
            ) {
              continue;
            }
            throw retryError;
          }
        }

        if (!order) {
          if (lastError?.code === "23505") {
            return res.status(409).json({
              message: "تعذر توليد رقم طلب فريد. يرجى المحاولة مرة أخرى.",
              success: false,
            });
          }
          return res.status(500).json({
            message: "فشل في إنشاء الطلب",
            success: false,
          });
        }

        res.status(201).json({
          data: order,
          message: "تم إنشاء الطلب بنجاح",
          success: true,
        });
      } catch (error: any) {
        console.error("Order creation error:", error);

        res.status(500).json({
          message: "خطأ في إنشاء الطلب",
          success: false,
        });
      }
    },
  );

  app.delete(
    "/api/orders/:id",
    requireAuth,
    requirePermission("manage_orders"),
    validateRequest({ params: commonSchemas.idParam }),
    async (req, res) => {
      try {
        const orderId = parseInt(req.params.id);

        if (!orderId || isNaN(orderId) || orderId <= 0) {
          return res.status(400).json({
            message: "معرف الطلب غير صحيح",
            success: false,
          });
        }

        // Check if order exists before deletion
        const existingOrder = await storage.getOrderById(orderId);
        if (!existingOrder) {
          return res.status(404).json({
            message: "الطلب غير موجود",
            success: false,
          });
        }

        await storage.deleteOrder(orderId);

        res.json({
          message: "تم حذف الطلب بنجاح",
          success: true,
        });
      } catch (error: any) {
        console.error("Order deletion error:", error);

        res.status(500).json({
          message: "خطأ في حذف الطلب",
          success: false,
        });
      }
    },
  );

  // Get all orders with enhanced search and filtering
  app.get("/api/orders/enhanced", requireAuth, requirePermission("view_orders", "manage_orders", "admin"), async (req, res) => {
    try {
      const {
        search,
        customer_id,
        status,
        date_from,
        date_to,
        page = 1,
        limit = 50,
      } = req.query;

      // Build dynamic query with filters (performance optimized)
      const orders = await storage.getOrdersEnhanced({
        search: search as string,
        customer_id: customer_id as string,
        status: status as string,
        date_from: date_from as string,
        date_to: date_to as string,
        page: Math.max(parseInt(page as string) || 1, 1),
        limit: Math.min(Math.max(parseInt(limit as string) || 50, 1), 500),
      });

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error("Enhanced orders fetch error:", error);
      res.status(500).json({
        message: "خطأ في جلب الطلبات",
        success: false,
      });
    }
  });

  app.get("/api/orders/:id/enhanced", requireAuth, requirePermission("view_orders", "manage_orders", "admin"), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (!orderId || isNaN(orderId) || orderId <= 0) {
        return res
          .status(400)
          .json({ message: "معرف الطلب غير صحيح", success: false });
      }

      const orderResult = await db
        .select({
          id: orders.id,
          order_number: orders.order_number,
          customer_id: orders.customer_id,
          customer_name: customers.name,
          customer_name_ar: customers.name_ar,
          customer_phone: customers.phone,
          delivery_days: orders.delivery_days,
          delivery_date: orders.delivery_date,
          status: orders.status,
          notes: orders.notes,
          created_by: orders.created_by,
          created_at: orders.created_at,
        })
        .from(orders)
        .leftJoin(customers, eq(orders.customer_id, customers.id))
        .where(eq(orders.id, orderId))
        .limit(1);

      if (orderResult.length === 0) {
        return res
          .status(404)
          .json({ message: "الطلب غير موجود", success: false });
      }

      const productionOrdersList = await db
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
        .where(eq(production_orders.order_id, orderId));

      res.json({
        success: true,
        data: {
          ...orderResult[0],
          production_orders_count: productionOrdersList.length,
          production_orders: productionOrdersList,
        },
      });
    } catch (error) {
      console.error("Enhanced order detail fetch error:", error);
      res
        .status(500)
        .json({ message: "خطأ في جلب تفاصيل الطلب", success: false });
    }
  });

  app.get(
    "/api/my-orders",
    requireAuth,
    requirePermission("view_my_orders", "manage_orders", "admin"),
    async (req, res) => {
      try {
        const userId = (req as any).user?.id;
        const userPerms: string[] = (req as any).user?.permissions || [];
        const isAdmin = userPerms.includes("admin");

        const baseQuery = db
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
            sales_rep_id: customers.sales_rep_id,
          })
          .from(orders)
          .leftJoin(customers, eq(orders.customer_id, customers.id));

        let filteredOrders;
        if (isAdmin) {
          filteredOrders = await baseQuery.orderBy(desc(orders.id));
        } else {
          filteredOrders = await baseQuery
            .where(eq(customers.sales_rep_id, userId))
            .orderBy(desc(orders.id));
        }

        if (filteredOrders.length === 0) {
          return res.json({ success: true, data: [] });
        }

        const orderIds = filteredOrders.map((o) => o.id);
        const allPOs = await db
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

        const poIds = allPOs.map((po) => po.id);
        let allRolls: any[] = [];
        if (poIds.length > 0) {
          allRolls = await db
            .select({
              id: rolls.id,
              roll_number: rolls.roll_number,
              production_order_id: rolls.production_order_id,
              stage: rolls.stage,
              weight_kg: rolls.weight_kg,
              waste_kg: rolls.waste_kg,
              created_at: rolls.created_at,
            })
            .from(rolls)
            .where(inArray(rolls.production_order_id, poIds));
        }

        const rollsByPoId = new Map<number, any[]>();
        for (const roll of allRolls) {
          if (roll.production_order_id != null) {
            if (!rollsByPoId.has(roll.production_order_id))
              rollsByPoId.set(roll.production_order_id, []);
            rollsByPoId.get(roll.production_order_id)!.push(roll);
          }
        }

        const poByOrderId = new Map<number, any[]>();
        for (const po of allPOs) {
          if (po.order_id != null) {
            const poWithRolls = { ...po, rolls: rollsByPoId.get(po.id) || [] };
            if (!poByOrderId.has(po.order_id)) poByOrderId.set(po.order_id, []);
            poByOrderId.get(po.order_id)!.push(poWithRolls);
          }
        }

        const salesRepIds = [
          ...new Set(filteredOrders.map((o) => o.sales_rep_id).filter(Boolean)),
        ] as number[];
        let salesReps: any[] = [];
        if (salesRepIds.length > 0) {
          salesReps = await db
            .select({
              id: users.id,
              display_name: users.display_name,
              display_name_ar: users.display_name_ar,
              username: users.username,
            })
            .from(users)
            .where(inArray(users.id, salesRepIds));
        }

        const salesRepMap = new Map<number, any>();
        for (const rep of salesReps) {
          salesRepMap.set(rep.id, rep);
        }

        const grouped: Record<string, { salesRep: any; orders: any[] }> = {};
        for (const order of filteredOrders) {
          const repId = order.sales_rep_id || 0;
          const key = String(repId);
          if (!grouped[key]) {
            grouped[key] = {
              salesRep: repId
                ? salesRepMap.get(repId) || {
                    id: repId,
                    display_name: "غير معروف",
                    display_name_ar: "غير معروف",
                  }
                : {
                    id: 0,
                    display_name: "بدون مندوب",
                    display_name_ar: "بدون مندوب",
                  },
              orders: [],
            };
          }
          grouped[key].orders.push({
            ...order,
            production_orders: poByOrderId.get(order.id) || [],
          });
        }

        res.json({ success: true, data: Object.values(grouped) });
      } catch (error) {
        console.error("My orders fetch error:", error);
        res.status(500).json({ message: "خطأ في جلب طلباتي", success: false });
      }
    },
  );

  // Customers routes
  app.get("/api/customers", requireAuth, requirePermission(
    "manage_customers",
    "add_customers",
    "edit_customers",
    "manage_orders",
    "view_orders",
    "view_my_orders",
    "manage_quality",
    "view_quality",
    "view_warehouse",
    "manage_warehouse",
    "view_maintenance",
    "manage_maintenance",
    "view_reports",
    "view_financial_reports",
    "view_bag_configurator",
    "manage_definitions",
  ), async (req, res) => {
    try {
      const { search, page, limit, offset, all } = req.query;

      // ?all=true → full list (dropdowns, bulk import).
      if (all === "true") {
        const allCustomers = await storage.getAllCustomers();
        return res.json(allCustomers);
      }

      const options: {
        search?: string;
        page?: number;
        limit?: number;
        offset?: number;
      } = {};
      if (search && typeof search === "string") options.search = search;
      if (page && typeof page === "string")
        options.page = Math.max(parseInt(page) || 1, 1);
      if (limit && typeof limit === "string") {
        options.limit = Math.min(Math.max(parseInt(limit) || 50, 1), 500);
      }
      if (offset && typeof offset === "string") {
        options.offset = Math.max(parseInt(offset) || 0, 0);
      }

      const result = await storage.getCustomers(options);
      res.json(result);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب العملاء" });
    }
  });

  // Customers routes
  app.post(
    "/api/customers",
    requireAuth,
    requirePermission("add_customers", "manage_customers", "manage_definitions"),
    async (req, res) => {
      try {
        const validatedData = insertCustomerSchema.parse(req.body);

        // Convert empty strings to null for fields with length constraints
        const cleanedData = {
          ...validatedData,
          code: validatedData.code || null,
          user_id: validatedData.user_id || null,
          tax_number: validatedData.tax_number || null,
          plate_drawer_code: validatedData.plate_drawer_code || null,
        };

        const customer = await storage.createCustomer(cleanedData);
        res.json(customer);
      } catch (error) {
        console.error("Customer creation error:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
        res.status(400).json({
          message: "بيانات غير صحيحة",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.put(
    "/api/customers/:id",
    requireAuth,
    requirePermission("edit_customers", "manage_customers", "manage_definitions"),
    async (req, res) => {
      try {
        const id = req.params.id?.trim();
        if (!id) {
          return res.status(400).json({ message: "معرف العميل غير صحيح" });
        }
        const validatedData = insertCustomerSchema.parse(req.body);

        // Convert empty strings to null for fields with length constraints
        const cleanedData = {
          ...validatedData,
          code: validatedData.code || null,
          user_id: validatedData.user_id || null,
          tax_number: validatedData.tax_number || null,
          plate_drawer_code: validatedData.plate_drawer_code || null,
        };

        const customer = await storage.updateCustomer(id, cleanedData);
        res.json(customer);
      } catch (error) {
        console.error("Customer update error:", error);
        res.status(400).json({
          message: "خطأ في تحديث العميل",
          error: "خطأ داخلي",
        });
      }
    },
  );

  // Customer Products routes
  app.get("/api/customer-products", requireAuth, async (req, res) => {
    try {
      const { customer_id, ids, page, limit, search } = req.query;

      const options: {
        customer_id?: string;
        ids?: number[];
        page?: number;
        limit?: number;
        search?: string;
      } = {};

      if (customer_id && typeof customer_id === "string") {
        options.customer_id = customer_id;
      }

      if (ids && typeof ids === "string") {
        options.ids = ids
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
      }

      if (page && typeof page === "string") {
        options.page = Math.max(parseInt(page) || 1, 1);
      }

      if (limit && typeof limit === "string") {
        options.limit = Math.min(Math.max(parseInt(limit) || 50, 1), 500);
      }

      if (search && typeof search === "string") {
        options.search = search;
      }

      const result = await storage.getCustomerProducts(options);
      res.json(result);
    } catch (error) {
      console.error("Customer products fetch error:", error);
      res.status(500).json({ message: "خطأ في جلب منتجات العملاء" });
    }
  });

  app.post(
    "/api/customer-products",
    requireAuth,
    requirePermission("add_customer_products", "manage_customers", "manage_definitions"),
    async (req, res) => {
      try {
        // STEP 1: Zod schema validation
        const validatedData = insertCustomerProductSchema.parse(req.body);

        // STEP 2: DataValidator integration for business rules
        const validationResult = await getDataValidator(storage).validateData(
          "customer_products",
          validatedData,
        );
        if (!validationResult.isValid) {
          const criticalErrors = validationResult.errors.filter(
            (e) => e.severity === "critical" || e.severity === "high",
          );
          if (criticalErrors.length > 0) {
            return res.status(400).json({
              message:
                criticalErrors[0].message_ar || criticalErrors[0].message,
              errors: validationResult.errors,
              success: false,
            });
          }
        }

        // STEP 3: Create customer product with validated data
        const customerProduct =
          await storage.createCustomerProduct(validatedData);

        res.status(201).json({
          data: customerProduct,
          message: "تم إنشاء منتج العميل بنجاح",
          success: true,
        });
      } catch (error: any) {
        console.error("Customer product creation error:", error);

        if (error?.name === "ZodError" || error instanceof z.ZodError) {
          return res.status(400).json({
            message: "بيانات منتج العميل غير صحيحة",
            errors: error.errors,
            success: false,
          });
        }

        const pgCode = error?.code ?? error?.cause?.code;
        if (pgCode === "23503") {
          return res.status(400).json({
            message:
              "قيمة مرجعية غير صحيحة (العميل أو الفئة أو الصنف غير موجود)",
            success: false,
          });
        }

        res.status(500).json({
          message: "خطأ في إنشاء منتج العميل",
          success: false,
        });
      }
    },
  );

  app.put(
    "/api/customer-products/:id",
    requireAuth,
    requirePermission("edit_customer_products", "manage_customers", "manage_definitions"),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);

        // Validate the ID parameter
        if (isNaN(id)) {
          return res.status(400).json({ message: "معرف المنتج غير صحيح" });
        }

        // Validate request body using Zod schema
        const validation = insertCustomerProductSchema.safeParse({
          ...req.body,
          category_id: req.body.material_group_id || req.body.category_id,
        });

        if (!validation.success) {
          console.error(
            "Customer product validation error:",
            validation.error.errors,
          );
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          });
        }

        // Remove material_group_id for backwards compatibility
        const processedData = { ...validation.data };
        delete (processedData as any).material_group_id;

        const customerProduct = await storage.updateCustomerProduct(
          id,
          processedData,
        );

        if (!customerProduct) {
          return res.status(404).json({ message: "منتج العميل غير موجود" });
        }

        res.json(customerProduct);
      } catch (error) {
        console.error("Customer product update error:", error);
        res.status(500).json({
          message: "خطأ في تحديث منتج العميل",
        });
      }
    },
  );

  // DELETE routes for definitions
  app.delete(
    "/api/customers/:id",
    requireAuth,
    requirePermission("delete_customers", "manage_customers", "manage_definitions"),
    async (req, res) => {
      try {
        const result = await storage.deleteCustomer(req.params.id);
        if (result.notFound) {
          return res.status(404).json({ message: "العميل غير موجود" });
        }
        if (!result.deleted) {
          return res.status(409).json({
            message: "لا يمكن حذف العميل لوجود سجلات مرتبطة به",
            related: result.related || {},
          });
        }
        res.json({ message: "تم حذف العميل بنجاح" });
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في حذف العميل، لم يتم حذف أي بيانات" });
      }
    },
  );

  app.delete(
    "/api/customer-products/:id",
    requireAuth,
    requirePermission(
      "delete_customer_products",
      "manage_customers",
      "manage_definitions",
    ),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteCustomerProduct(id);
        res.json({ message: "تم حذف منتج العميل بنجاح" });
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في حذف منتج العميل" });
      }
    },
  );

  // ============ Orders Management API ============

  app.post(
    "/api/orders",
    requireAuth,
    requirePermission("manage_orders"),
    async (req, res) => {
      try {
        const parseResult = insertNewOrderSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات الطلب غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const order = await storage.createOrder(parseResult.data);
        res.status(201).json(order);
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "خطأ في إنشاء الطلب" });
      }
    },
  );

  app.put(
    "/api/orders/:id",
    requireAuth,
    requirePermission("manage_orders"),
    async (req, res) => {
      try {
        const orderId = parseRouteParam(req.params.id, "id");
        const result = insertNewOrderSchema.safeParse(req.body);
        if (!result.success) {
          return res
            .status(400)
            .json({ message: "بيانات غير صحيحة", errors: result.error.errors });
        }

        // Convert Date objects to strings for database compatibility
        const dd: any = result.data.delivery_date;
        const normalizedDeliveryDate =
          dd instanceof Date
            ? dd.toISOString().split("T")[0]
            : typeof dd === "string" && dd.length > 0
              ? dd.split("T")[0]
              : dd ?? null;
        const updateData = {
          ...result.data,
          delivery_date: normalizedDeliveryDate,
        };
        const order = await storage.updateOrder(orderId, updateData);
        res.json(order);
      } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "خطأ في تحديث الطلب" });
      }
    },
  );

  app.patch(
    "/api/orders/:id/status",
    requireAuth,
    requirePermission(
      "manage_orders",
      "update_order_status",
      "manage_production",
    ),
    async (req, res) => {
      try {
        const orderId = parseRouteParam(req.params.id, "id");
        const { status } = req.body;

        if (!status) {
          return res
            .status(400)
            .json({ message: "الحالة مطلوبة", success: false });
        }

        const validStatuses = [
          "waiting",
          "on_hold",
          "in_production",
          "paused",
          "completed",
          "cancelled",
          "archived",
        ];
        if (!validStatuses.includes(status)) {
          return res
            .status(400)
            .json({ message: "حالة غير صحيحة", success: false });
        }

        // STEP 1: Get current order status for state transition validation
        const currentOrder = await storage.getOrderById(orderId);
        if (!currentOrder) {
          return res
            .status(404)
            .json({ message: "الطلب غير موجود", success: false });
        }

        // STEP 2: State transition validation
        const currentStatus = currentOrder.status;
        const newStatus = status;

        if (currentStatus === newStatus) {
          return res.json({
            data: currentOrder,
            message: "الطلب بالفعل في هذه الحالة",
            success: true,
            previousStatus: currentStatus,
            currentStatus: newStatus,
          });
        }

        // Define valid state transitions based on business logic
        const validTransitions: Record<string, string[]> = {
          waiting: [
            "on_hold",
            "in_production",
            "paused",
            "cancelled",
            "archived",
          ],
          on_hold: [
            "waiting",
            "in_production",
            "paused",
            "cancelled",
            "archived",
          ],
          in_production: [
            "on_hold",
            "paused",
            "completed",
            "cancelled",
            "archived",
          ],
          paused: [
            "waiting",
            "on_hold",
            "in_production",
            "cancelled",
            "archived",
          ],
          completed: ["in_production", "archived"],
          cancelled: ["waiting", "archived"],
          archived: [
            "waiting",
            "on_hold",
            "in_production",
            "paused",
            "completed",
            "cancelled",
          ],
        };

        // Check if transition is allowed
        const allowedNextStates = validTransitions[currentStatus] || [];
        if (
          currentStatus !== newStatus &&
          !allowedNextStates.includes(newStatus)
        ) {
          return res.status(400).json({
            message: `لا يمكن تغيير حالة الطلب من "${currentStatus}" إلى "${newStatus}". التحولات المسموحة: ${allowedNextStates.join(", ")}`,
            success: false,
            currentStatus,
            requestedStatus: newStatus,
            allowedTransitions: allowedNextStates,
          });
        }

        // STEP 3: Additional business rule validations
        if (newStatus === "completed") {
          // Check if all production orders are completed before marking order as completed
          const allProductionOrders = await storage.getAllProductionOrders();
          const productionOrders = allProductionOrders.filter(
            (po: any) => po.order_id === orderId,
          );
          const incompleteProdOrders = productionOrders.filter(
            (po: any) => po.status !== "completed",
          );

          if (incompleteProdOrders.length > 0) {
            return res.status(400).json({
              message: `لا يمكن إتمام الطلب - يوجد ${incompleteProdOrders.length} أوامر إنتاج غير مكتملة`,
              success: false,
              incompleteProdOrders: incompleteProdOrders.length,
            });
          }
        }

        if (newStatus === "cancelled") {
          // Check if there are production orders in progress
          const allProductionOrders = await storage.getAllProductionOrders();
          const productionOrders = allProductionOrders.filter(
            (po: any) => po.order_id === orderId,
          );
          const activeProdOrders = productionOrders.filter((po: any) =>
            po.status === "active",
          );

          if (activeProdOrders.length > 0) {
            return res.status(400).json({
              message: `لا يمكن إلغاء الطلب - يوجد ${activeProdOrders.length} أوامر إنتاج نشطة`,
              success: false,
              activeProdOrders: activeProdOrders.length,
            });
          }
        }

        // STEP 4: Perform atomic status update with validation
        if (newStatus === "archived") {
          await storage.updateOrderStatusWithPrevious(
            orderId,
            "archived",
            currentStatus,
          );
        } else if (currentStatus === "archived") {
          await storage.updateOrderStatusWithPrevious(orderId, newStatus, null);
        } else {
          await storage.updateOrderStatus(orderId, newStatus);
        }

        const order = await storage.getOrderById(orderId);

        // STEP 5: Sync production orders status based on the new order status
        if (newStatus === "in_production") {
          await storage.updateProductionOrdersStatusByOrder(
            orderId,
            ["pending"],
            "active",
          );
        } else if (newStatus === "paused") {
          await storage.updateProductionOrdersStatusByOrder(
            orderId,
            ["active"],
            "pending",
          );
        } else if (newStatus === "cancelled") {
          await storage.updateProductionOrdersStatusByOrder(
            orderId,
            ["pending", "active"],
            "cancelled",
          );
        } else if (newStatus === "archived") {
          const orderProdOrders = await storage.getAllProductionOrders({
            order_id: orderId,
          });
          for (const po of orderProdOrders) {
            if (
              ["pending", "active", "completed", "cancelled"].includes(
                po.status,
              )
            ) {
              await storage.updateProductionOrderStatusWithPrevious(
                po.id,
                "archived",
                po.status,
              );
            }
          }
        } else if (currentStatus === "archived") {
          const orderProdOrders = (
            await storage.getAllProductionOrders({ order_id: orderId })
          ).filter((po: any) => po.status === "archived");
          for (const po of orderProdOrders) {
            const poRestoreStatus = po.previous_status || "completed";
            await storage.updateProductionOrderStatusWithPrevious(
              po.id,
              poRestoreStatus,
              null,
            );
          }
        }

        res.json({
          data: order,
          message: `تم تغيير حالة الطلب إلى "${newStatus}" بنجاح`,
          success: true,
          previousStatus: currentStatus,
          currentStatus: newStatus,
        });
      } catch (error: any) {
        console.error("Error updating order status:", error);

        res.status(500).json({
          message: "خطأ في تحديث حالة الطلب",
          success: false,
        });
      }
    },
  );

  // ============ Archive Orders API ============

  app.post(
    "/api/orders/archive",
    requireAuth,
    requirePermission("manage_orders"),
    async (req, res) => {
      try {
        const { order_ids } = req.body;

        if (!Array.isArray(order_ids) || order_ids.length === 0) {
          return res.status(400).json({
            message: "يرجى تحديد طلب واحد على الأقل",
            success: false,
          });
        }

        const results: { orderId: number; success: boolean; error?: string }[] =
          [];

        // Fetch all production orders once and index by order_id instead of
        // re-querying inside the loop (previously O(N) full-table scans).
        const allProdOrders = await storage.getAllProductionOrders();
        const prodOrdersByOrderId = new Map<number, any[]>();
        for (const po of allProdOrders) {
          const list = prodOrdersByOrderId.get(po.order_id) || [];
          list.push(po);
          prodOrdersByOrderId.set(po.order_id, list);
        }

        for (const orderId of order_ids) {
          try {
            const order = await storage.getOrderById(orderId);
            if (!order) {
              results.push({
                orderId,
                success: false,
                error: "الطلب غير موجود",
              });
              continue;
            }

            if (order.status === "archived") {
              results.push({ orderId, success: true });
              continue;
            }

            await storage.updateOrderStatusWithPrevious(
              orderId,
              "archived",
              order.status,
            );

            const orderProdOrders = prodOrdersByOrderId.get(orderId) || [];
            await Promise.all(
              orderProdOrders
                .filter((po: any) =>
                  ["pending", "active", "completed", "cancelled"].includes(
                    po.status,
                  ),
                )
                .map((po: any) =>
                  storage.updateProductionOrderStatusWithPrevious(
                    po.id,
                    "archived",
                    po.status,
                  ),
                ),
            );

            results.push({ orderId, success: true });
          } catch (err: any) {
            results.push({ orderId, success: false, error: err.message });
          }
        }

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        res.json({
          success: true,
          message: `تم أرشفة ${successCount} طلب بنجاح${failCount > 0 ? ` (${failCount} فشل)` : ""}`,
          results,
          archivedCount: successCount,
          failedCount: failCount,
        });
      } catch (error: any) {
        console.error("Error archiving orders:", error);
        res.status(500).json({
          message: "خطأ في أرشفة الطلبات",
          success: false,
        });
      }
    },
  );

  app.post(
    "/api/orders/unarchive",
    requireAuth,
    requirePermission("manage_orders"),
    async (req, res) => {
      try {
        const { order_ids } = req.body;

        if (!Array.isArray(order_ids) || order_ids.length === 0) {
          return res.status(400).json({
            message: "يرجى تحديد طلب واحد على الأقل",
            success: false,
          });
        }

        const results: { orderId: number; success: boolean; error?: string }[] =
          [];

        for (const orderId of order_ids) {
          try {
            const order = await storage.getOrderById(orderId);
            if (!order) {
              results.push({
                orderId,
                success: false,
                error: "الطلب غير موجود",
              });
              continue;
            }

            if (order.status !== "archived") {
              results.push({
                orderId,
                success: false,
                error: "الطلب غير مؤرشف",
              });
              continue;
            }

            const restoreStatus = order.previous_status || "completed";
            await storage.updateOrderStatusWithPrevious(
              orderId,
              restoreStatus,
              null,
            );

            const allProdOrders = await storage.getAllProductionOrders();
            const orderProdOrders = allProdOrders.filter(
              (po: any) => po.order_id === orderId && po.status === "archived",
            );
            for (const po of orderProdOrders) {
              const poRestoreStatus = po.previous_status || "completed";
              await storage.updateProductionOrderStatusWithPrevious(
                po.id,
                poRestoreStatus,
                null,
              );
            }

            results.push({ orderId, success: true });
          } catch (err: any) {
            results.push({ orderId, success: false, error: err.message });
          }
        }

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        res.json({
          success: true,
          message: `تم إلغاء أرشفة ${successCount} طلب بنجاح${failCount > 0 ? ` (${failCount} فشل)` : ""}`,
          results,
          unarchivedCount: successCount,
          failedCount: failCount,
        });
      } catch (error: any) {
        console.error("Error unarchiving orders:", error);
        res.status(500).json({
          message: "خطأ في إلغاء أرشفة الطلبات",
          success: false,
        });
      }
    },
  );

  app.get(
    "/api/delivery-manifests",
    requireAuth,
    requirePermission("manage_production"),
    async (_req: AuthRequest, res) => {
      try {
        const list = await storage.getDeliveryManifests();
        res.json({ data: list });
      } catch (error) {
        console.error("Error listing delivery manifests:", error);
        res.status(500).json({ message: "خطأ في جلب كشوف التوصيل" });
      }
    },
  );

  app.get(
    "/api/delivery-manifests/:id",
    requireAuth,
    requirePermission("manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseManifestId(req.params.id, res);
        if (id === null) return;
        const m = await storage.getDeliveryManifestById(id);
        if (!m) {
          return res.status(404).json({ message: "الكشف غير موجود" });
        }
        res.json(m);
      } catch (error) {
        console.error("Error fetching delivery manifest:", error);
        res.status(500).json({ message: "خطأ في جلب الكشف" });
      }
    },
  );

  app.post(
    "/api/delivery-manifests",
    requireAuth,
    requirePermission("add_production", "manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const parsed = deliveryManifestPayloadSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parsed.error.errors,
          });
        }
        if (
          !parsed.data.stops.some(
            (s: any) => s.customerId || (s.customerName && s.customerName.trim()),
          )
        ) {
          return res
            .status(400)
            .json({ message: "أضف عميلاً أو اسماً يدوياً واحداً على الأقل" });
        }
        const userId = getAuthUserId(req);
        const created = await storage.createDeliveryManifest(
          parsed.data,
          userId as number,
        );
        res.json(created);
      } catch (error) {
        console.error("Error creating delivery manifest:", error);
        res.status(500).json({ message: "خطأ في حفظ الكشف" });
      }
    },
  );

  app.put(
    "/api/delivery-manifests/:id",
    requireAuth,
    requirePermission("edit_production", "manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseManifestId(req.params.id, res);
        if (id === null) return;
        const existing = await storage.getDeliveryManifestById(id);
        if (!existing) {
          return res.status(404).json({ message: "الكشف غير موجود" });
        }
        const parsed = deliveryManifestPayloadSchema
          .partial()
          .safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parsed.error.errors,
          });
        }
        const updated = await storage.updateDeliveryManifest(id, parsed.data);
        res.json(updated);
      } catch (error) {
        console.error("Error updating delivery manifest:", error);
        res.status(500).json({ message: "خطأ في تعديل الكشف" });
      }
    },
  );

  app.delete(
    "/api/delivery-manifests/:id",
    requireAuth,
    requirePermission("delete_production", "manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseManifestId(req.params.id, res);
        if (id === null) return;
        const existing = await storage.getDeliveryManifestById(id);
        if (!existing) {
          return res.status(404).json({ message: "الكشف غير موجود" });
        }
        await storage.deleteDeliveryManifest(id);
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting delivery manifest:", error);
        res.status(500).json({ message: "خطأ في حذف الكشف" });
      }
    },
  );
}
