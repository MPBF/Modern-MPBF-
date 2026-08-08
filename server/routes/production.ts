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
  checkOrderNotPaused,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerProductionRoutes(app: Express, ctx: any) {
  const {
    resolveInlinePrintedFields,
    sanitizeRollCreateInput,
    VALID_QUEUE_STAGES,
    dataValidator,
  } = ctx;


  // Get orders for production page
  app.get(
    "/api/production/orders-for-production",
    requireAuth,
    async (req, res) => {
      try {
        const orders = await storage.getOrdersForProduction();
        res.json(orders);
      } catch (error) {
        console.error("Error fetching orders for production:", error);
        res.status(500).json({ message: "خطأ في جلب طلبات الإنتاج" });
      }
    },
  );

  // Get hierarchical orders for production page
  app.get(
    "/api/production/hierarchical-orders",
    requireAuth,
    async (req, res) => {
      try {
        const orders = await storage.getHierarchicalOrdersForProduction();
        res.json(orders);
      } catch (error) {
        console.error(
          "Error fetching hierarchical orders for production:",
          error,
        );
        res.status(500).json({ message: "خطأ في جلب طلبات الإنتاج الهرمية" });
      }
    },
  );

  // Production Orders routes
  app.get("/api/production-orders", requireAuth, async (req, res) => {
    try {
      const orderId = req.query.order_id
        ? parseInt(String(req.query.order_id))
        : null;
      const customerId = req.query.customer_id
        ? String(req.query.customer_id).trim()
        : null;
      const productionStageRaw = req.query.production_stage
        ? String(req.query.production_stage).trim()
        : null;
      const limitRaw = req.query.limit
        ? parseInt(String(req.query.limit))
        : NaN;
      const offsetRaw = req.query.offset
        ? parseInt(String(req.query.offset))
        : NaN;

      const filters: {
        order_id?: number;
        customer_id?: string;
        production_stage?: string;
        limit?: number;
        offset?: number;
      } = {};
      if (orderId !== null && !isNaN(orderId)) {
        filters.order_id = orderId;
      }
      if (customerId) {
        filters.customer_id = customerId;
      }
      if (
        productionStageRaw &&
        ["film", "printing", "cutting", "done"].includes(productionStageRaw)
      ) {
        filters.production_stage = productionStageRaw;
      }
      if (!isNaN(limitRaw) && limitRaw > 0) {
        filters.limit = Math.min(limitRaw, 1000);
      }
      if (!isNaN(offsetRaw) && offsetRaw >= 0) {
        filters.offset = offsetRaw;
      }

      const result = await storage.getAllProductionOrders(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching production orders:", error);
      res.status(500).json({ message: "خطأ في جلب أوامر الإنتاج" });
    }
  });

  app.get(
    "/api/production-orders/stages-summary",
    requireAuth,
    async (_req, res) => {
      try {
        const summary = await storage.getProductionOrdersStagesSummary();
        res.json(summary);
      } catch (error) {
        console.error("Error fetching production stages summary:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب ملخص مراحل أوامر الإنتاج" });
      }
    },
  );

  app.get("/api/production-orders/:id", requireAuth, async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) {
      return next();
    }
    try {
      const id = parseRouteParam(req.params.id, "id");
      const productionOrder = await storage.getProductionOrderById(id);
      if (!productionOrder) {
        return res.status(404).json({ message: "أمر الإنتاج غير موجود" });
      }
      res.json(productionOrder);
    } catch (error) {
      console.error(
        "Error fetching production order:",
        error instanceof Error ? error.message : String(error),
      );
      res.status(500).json({ message: "خطأ في جلب أمر الإنتاج" });
    }
  });

  // Batch/packaging label data for a production order. Works for in-progress
  // orders too (operators print labels while packing), generating the batch
  // number on demand if it is missing.
  app.get(
    "/api/production-orders/:id/batch-label-data",
    requireAuth,
    requirePermission("view_production", "manage_production"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const data = await storage.getBatchLabelData(id);
        if (!data) {
          return res.status(404).json({ message: "أمر الإنتاج غير موجود" });
        }
        // QR encodes the authenticated in-app lookup URL for this batch.
        if (data.batch_number) {
          const origin = `${req.protocol}://${req.get("host")}`;
          const lookupUrl = `${origin}/batch/${encodeURIComponent(
            data.batch_number,
          )}`;
          try {
            const qrDataUrl = await QRCode.toDataURL(lookupUrl, {
              margin: 1,
              width: 256,
            });
            data.qr_png_base64 = qrDataUrl.replace(
              /^data:image\/png;base64,/,
              "",
            );
          } catch (qrErr) {
            console.error("Error generating batch QR:", qrErr);
          }
          data.lookup_url = lookupUrl;
        }
        res.json(data);
      } catch (error) {
        console.error("Error building batch label data:", error);
        res.status(500).json({ message: "خطأ في جلب بيانات ملصق الباتش" });
      }
    },
  );

  // Authenticated batch traceability lookup (opened by scanning the label QR).
  // Must NOT be public — guards commercial/operator data behind a permission.
  app.get(
    "/api/batches/:batchNumber",
    requireAuth,
    requirePermission("view_production", "manage_production"),
    async (req, res) => {
      try {
        const batchNumber = String(req.params.batchNumber || "").trim();
        if (!/^[A-Za-z0-9-]{1,50}$/.test(batchNumber)) {
          return res.status(400).json({ message: "رقم باتش غير صالح" });
        }
        const data = await storage.getBatchTraceability(batchNumber);
        if (!data) {
          return res.status(404).json({ message: "رقم الباتش غير موجود" });
        }
        res.json(data);
      } catch (error) {
        console.error("Error fetching batch traceability:", error);
        res.status(500).json({ message: "خطأ في جلب بيانات الباتش" });
      }
    },
  );

  app.post(
    "/api/production-orders",
    requireAuth,
    requirePermission("add_production", "manage_production"),
    async (req, res) => {
      try {
        // Extract and validate basic fields first
        const { customer_product_id, quantity_kg, overrun_percentage } =
          req.body;

        // Get customer product info for intelligent calculation
        const parsedCustomerProductId = parseIntSafe(
          String(customer_product_id),
          "customer_product_id",
          { min: 1 },
        );
        const parsedQuantityKg = parseFloatSafe(
          String(quantity_kg),
          "quantity_kg",
          { min: 0.01 },
        );

        const customerProduct = await storage.getCustomerProductById(
          parsedCustomerProductId,
        );

        if (!customerProduct) {
          return res.status(404).json({
            message: "المنتج غير موجود",
            success: false,
          });
        }

        // Calculate final quantity using server-side logic (ignore client-provided value)
        const quantityCalculation = calculateProductionQuantities(
          parsedQuantityKg,
          customerProduct.punching,
        );

        // Prepare production order data with server-calculated final quantity
        const productionOrderData = {
          ...req.body,
          // Override with server-calculated values for security
          final_quantity_kg: quantityCalculation.finalQuantityKg,
          overrun_percentage: quantityCalculation.overrunPercentage,
        };

        const validatedData =
          insertProductionOrderSchema.parse(productionOrderData);
        const productionOrder = await storage.createProductionOrder(
          validatedData,
          { final_quantity_kg: quantityCalculation.finalQuantityKg },
        );
        res.status(201).json(productionOrder);
      } catch (error) {
        console.error("Error creating production order:", error);
        if (error instanceof Error && "issues" in error) {
          res.status(400).json({ message: "بيانات غير صحيحة", errors: error });
        } else {
          res.status(500).json({ message: "خطأ في إنشاء أمر الإنتاج" });
        }
      }
    },
  );

  app.post(
    "/api/production-orders/batch",
    requireAuth,
    requirePermission("add_production", "manage_production"),
    async (req, res) => {
      try {
        const { orders } = req.body;

        if (!Array.isArray(orders) || orders.length === 0) {
          return res.status(400).json({
            message: "يجب توفير قائمة من الطلبات",
            success: false,
          });
        }

        // Pre-collect requested customer_product_ids and fetch them by id so the
        // lookup is not constrained to the default page window.
        const requestedCpIds: number[] = [];
        for (const order of orders) {
          const raw = order?.customer_product_id;
          if (raw !== undefined && raw !== null && raw !== "") {
            const n = parseInt(String(raw), 10);
            if (Number.isFinite(n) && n > 0) requestedCpIds.push(n);
          }
        }
        const uniqueCpIds = Array.from(new Set(requestedCpIds));
        const customerProductsResult = uniqueCpIds.length
          ? await storage.getCustomerProducts({
              ids: uniqueCpIds,
              limit: uniqueCpIds.length,
            })
          : { data: [] as any[] };
        const customerProductMap = new Map<number, any>(
          (customerProductsResult.data as any[]).map((cp: any) => [cp.id, cp]),
        );
        const processedOrders = [];

        for (const order of orders) {
          const { customer_product_id, quantity_kg, overrun_percentage } =
            order;

          let parsedCpId: number;
          let parsedQtyKg: number;
          try {
            parsedCpId = parseIntSafe(
              String(customer_product_id),
              "customer_product_id",
              { min: 1 },
            );
            parsedQtyKg = parseFloatSafe(String(quantity_kg), "quantity_kg", {
              min: 0.01,
            });
          } catch (e: any) {
            processedOrders.push({
              success: false,
              error: e.message || "بيانات غير صحيحة",
              order,
            });
            continue;
          }

          const customerProduct = customerProductMap.get(parsedCpId);

          if (!customerProduct) {
            processedOrders.push({
              success: false,
              error: `المنتج ${customer_product_id} غير موجود`,
              order,
            });
            continue;
          }

          const quantityCalculation = calculateProductionQuantities(
            parsedQtyKg,
            customerProduct.punching,
          );

          const productionOrderData = {
            ...order,
            final_quantity_kg: quantityCalculation.finalQuantityKg,
            overrun_percentage: quantityCalculation.overrunPercentage,
          };

          try {
            const validatedData =
              insertProductionOrderSchema.parse(productionOrderData);
            processedOrders.push({
              success: true,
              data: validatedData,
              finalQuantityKg: quantityCalculation.finalQuantityKg,
            });
          } catch (validationError) {
            processedOrders.push({
              success: false,
              error: "بيانات غير صحيحة",
              order,
              validationError,
            });
          }
        }

        const validOrders = processedOrders.filter((po) => po.success);

        if (validOrders.length === 0) {
          return res.status(400).json({
            message: "لا توجد طلبات صالحة للإنشاء",
            errors: processedOrders,
          });
        }

        const result = await storage.createProductionOrdersBatchWithFinalQty(
          validOrders.map((po) => ({
            data: po.data!,
            finalQuantityKg: po.finalQuantityKg!,
          })),
        );

        res.status(201).json({
          message: `تم إنشاء ${result.successful.length} من ${orders.length} طلب`,
          successful: result.successful,
          failed: result.failed,
          validationErrors: processedOrders.filter((po) => !po.success),
        });
      } catch (error) {
        console.error("Error creating batch production orders:", error);
        res.status(500).json({ message: "خطأ في إنشاء أوامر الإنتاج" });
      }
    },
  );

  app.put(
    "/api/production-orders/:id",
    requireAuth,
    requirePermission("edit_production", "manage_production"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");

        // If customer_product_id or quantity_kg is being updated, recalculate overrun_percentage
        if (req.body.customer_product_id || req.body.quantity_kg) {
          // Get the existing production order to fill in missing fields
          const existingOrder = await storage.getProductionOrderById(id);
          if (!existingOrder) {
            return res.status(404).json({ message: "أمر الإنتاج غير موجود" });
          }

          const customer_product_id =
            req.body.customer_product_id !== undefined
              ? req.body.customer_product_id
              : existingOrder.customer_product_id;
          const quantity_kg =
            req.body.quantity_kg !== undefined
              ? req.body.quantity_kg
              : existingOrder.quantity_kg;

          const parsedCpIdForUpdate = parseIntSafe(
            String(customer_product_id),
            "customer_product_id",
            { min: 1 },
          );
          const parsedQtyKgForUpdate = parseFloatSafe(
            String(quantity_kg),
            "quantity_kg",
            { min: 0.01 },
          );

          const customerProduct = await storage.getCustomerProductById(
            parsedCpIdForUpdate,
          );

          if (customerProduct) {
            const quantityCalculation = calculateProductionQuantities(
              parsedQtyKgForUpdate,
              customerProduct.punching,
            );

            req.body.overrun_percentage = quantityCalculation.overrunPercentage;
            req.body.final_quantity_kg = quantityCalculation.finalQuantityKg;
          }
        }

        const validatedData = insertProductionOrderSchema
          .partial()
          .parse(req.body);
        const productionOrder = await storage.updateProductionOrder(
          id,
          validatedData,
        );

        if (validatedData.status === "completed" && productionOrder?.id) {
          await storage.maybeCompleteParentOrder(productionOrder.id);
        }

        res.json(productionOrder);
      } catch (error) {
        console.error("Error updating production order:", error);
        res.status(500).json({ message: "خطأ في تحديث أمر الإنتاج" });
      }
    },
  );

  app.delete(
    "/api/production-orders/:id",
    requireAuth,
    requirePermission("delete_production", "manage_production"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        await storage.deleteProductionOrder(id);
        res.json({ message: "تم حذف أمر الإنتاج بنجاح" });
      } catch (error) {
        console.error("Error deleting production order:", error);
        res.status(500).json({ message: "خطأ في حذف أمر الإنتاج" });
      }
    },
  );

  // Preview quantity calculations for production orders
  app.post(
    "/api/production-orders/preview-quantities",
    requireAuth,
    async (req, res) => {
      try {
        const { customer_product_id, quantity_kg } = req.body;

        // Validate inputs
        const parsedCpId = parseInt(customer_product_id);
        if (!customer_product_id || isNaN(parsedCpId) || parsedCpId <= 0 || !quantity_kg || quantity_kg <= 0) {
          return res.status(400).json({
            message: "معرف المنتج والكمية الأساسية مطلوبان",
            success: false,
          });
        }

        // Get specific customer product info for intelligent calculation
        const customerProduct = await storage.getCustomerProductById(
          parsedCpId,
        );

        if (!customerProduct) {
          return res.status(404).json({
            message: "المنتج غير موجود",
            success: false,
          });
        }

        // Calculate quantities using intelligent system
        const quantityCalculation = calculateProductionQuantities(
          parseFloat(quantity_kg),
          customerProduct.punching,
        );

        res.json({
          success: true,
          data: {
            customer_product_id: parseInt(customer_product_id),
            quantity_kg: parseFloat(quantity_kg),
            overrun_percentage: quantityCalculation.overrunPercentage,
            final_quantity_kg: quantityCalculation.finalQuantityKg,
            overrun_reason: quantityCalculation.overrunReason,
            product_info: {
              punching: customerProduct.punching,
              size_caption: customerProduct.size_caption,
              raw_material: customerProduct.raw_material,
              master_batch_id: customerProduct.master_batch_id,
            },
          },
        });
      } catch (error) {
        console.error("Quantity preview error:", error);
        res.status(500).json({
          message: "خطأ في حساب الكمية",
          success: false,
        });
      }
    },
  );

  // Production Orders Management Routes
  app.get(
    "/api/production-orders/management",
    requireAuth,
    requirePermission("manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const productionOrders = await storage.getProductionOrdersWithDetails();
        res.json({
          success: true,
          data: productionOrders,
        });
      } catch (error) {
        console.error("Error fetching production orders with details:", error);
        res.status(500).json({
          success: false,
          message: "خطأ في جلب أوامر الإنتاج",
        });
      }
    },
  );

  app.patch(
    "/api/production-orders/:id/activate",
    requireAuth,
    requirePermission("manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "Production Order ID");
        const assignSchema = z.object({
          machineId: z.union([z.string(), z.number()]).optional(),
          operatorId: z.union([z.string(), z.number()]).optional(),
        });
        const { machineId, operatorId } = assignSchema.parse(req.body);

        const activatedOrder = await storage.activateProductionOrder(id, {
          machine_id: machineId,
          operator_id: operatorId,
        });

        res.json({
          success: true,
          data: activatedOrder,
          message: "تم تفعيل أمر الإنتاج بنجاح",
        });
      } catch (error: any) {
        console.error("Error activating production order:", error);
        res.status(400).json({
          success: false,
          message: "خطأ في تفعيل أمر الإنتاج",
        });
      }
    },
  );

  app.patch(
    "/api/production-orders/:id/assign",
    requireAuth,
    requirePermission("manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "Production Order ID");
        const assignSchema = z.object({
          machineId: z.union([z.string(), z.number()]).optional(),
          operatorId: z.union([z.string(), z.number()]).optional(),
        });
        const { machineId, operatorId } = assignSchema.parse(req.body);

        const updatedOrder = await storage.updateProductionOrderAssignment(id, {
          machine_id: machineId,
          operator_id: operatorId,
        });

        res.json({
          success: true,
          data: updatedOrder,
          message: "تم تحديث التخصيص بنجاح",
        });
      } catch (error: any) {
        console.error("Error assigning production order:", error);
        res.status(400).json({
          success: false,
          message: "خطأ في تخصيص أمر الإنتاج",
        });
      }
    },
  );

  app.get(
    "/api/production-orders/:id/stats",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "Production Order ID");
        const stats = await storage.getProductionOrderStats(id);

        res.json({
          success: true,
          data: stats,
        });
      } catch (error: any) {
        console.error("Error fetching production order stats:", error);
        res.status(400).json({
          success: false,
          message: "خطأ في جلب إحصائيات أمر الإنتاج",
        });
      }
    },
  );

  // Rolls routes with pagination support
  app.get("/api/rolls", requireAuth, requirePermission(
    "view_production",
    "manage_production",
    "add_production",
    "edit_production",
    "view_film_dashboard",
    "view_printing_dashboard",
    "view_cutting_dashboard",
    "view_production_monitoring",
    "view_production_reports",
    "view_quality",
    "manage_quality",
  ), async (req, res) => {
    try {
      const { stage } = req.query;
      if (stage) {
        const rolls = await storage.getRollsByStage(stage as string);
        return res.json(rolls);
      }
      const limit = Math.max(
        1,
        Math.min(parseInt(String(req.query.limit ?? "")) || 50, 500),
      );
      const offset = Math.max(0, parseInt(String(req.query.offset ?? "")) || 0);

      // Optional "today_only" filter, anchored to Asia/Riyadh (UTC+3, no DST).
      let createdAfter: Date | undefined;
      if (String(req.query.today_only ?? "") === "true") {
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Riyadh",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
        const [y, m, d] = parts.split("-").map(Number);
        createdAfter = new Date(Date.UTC(y, m - 1, d) - 3 * 60 * 60 * 1000);
      }

      const rolls = await storage.getAllRolls({ limit, offset, createdAfter });
      res.set("X-Pagination-Limit", String(limit));
      res.set("X-Pagination-Offset", String(offset));
      res.set("X-Pagination-Count", String(rolls.length));
      res.json(rolls);
    } catch (error) {
      console.error("[GET /api/rolls] Error fetching rolls:", error);
      res.status(500).json({ message: "خطأ في جلب الرولات" });
    }
  });

  // Today's Production: rolls produced in the last 24 hours. Operators see only
  // their own rolls (scoped to the stages they may view); management/admin see
  // every roll with the producing employee's name for per-employee grouping.
  app.get(
    "/api/production/today",
    requireAuth,
    requirePermission(
      "view_today_production",
      "view_film_dashboard",
      "view_printing_dashboard",
      "view_cutting_dashboard",
      "view_production",
      "manage_production",
      "manage_production_hall",
      "admin",
    ),
    async (req: any, res) => {
      try {
        const perms: string[] = req.user?.permissions || [];
        const has = (p: string) => perms.includes(p);
        const isManagement =
          has("admin") ||
          has("manage_production") ||
          has("manage_production_hall");
        const canFilm = isManagement || has("view_film_dashboard");
        const canPrinting = isManagement || has("view_printing_dashboard");
        const canCutting = isManagement || has("view_cutting_dashboard");

        // Optional management filters: from/to date range and a single stage.
        // Operators always get the default rolling 24h window for all their
        // permitted stages; only management may narrow by range or stage.
        let from: Date | undefined;
        let to: Date | undefined;
        let stage: "film" | "printing" | "cutting" | undefined;

        if (isManagement) {
          const parseDate = (raw: unknown): Date | undefined => {
            if (typeof raw !== "string" || raw.trim() === "") return undefined;
            const d = new Date(raw);
            return Number.isNaN(d.getTime()) ? undefined : d;
          };
          from = parseDate(req.query.from);
          to = parseDate(req.query.to);
          if (from && to && from > to) {
            const tmp = from;
            from = to;
            to = tmp;
          }
          const rawStage = req.query.stage;
          if (
            rawStage === "film" ||
            rawStage === "printing" ||
            rawStage === "cutting"
          ) {
            stage = rawStage;
          }
        }

        const records = await storage.getTodaysProduction({
          userId: req.user.id,
          isManagement,
          canFilm,
          canPrinting,
          canCutting,
          from,
          to,
          stage,
        });

        res.json({ isManagement, records });
      } catch (error) {
        console.error("[GET /api/production/today] Error:", error);
        res.status(500).json({ message: "خطأ في جلب إنتاج اليوم" });
      }
    },
  );

  app.get("/api/rolls/:id", requireAuth, async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) {
      return next();
    }
    try {
      const id = parseRouteParam(req.params.id, "ID");
      const roll = await storage.getRollById(id);
      if (!roll) {
        return res.status(404).json({ message: "الرول غير موجود" });
      }
      res.json(roll);
    } catch (error) {
      console.error(
        "Error fetching roll:",
        error instanceof Error ? error.message : String(error),
      );
      res.status(500).json({ message: "خطأ في جلب الرول" });
    }
  });

  app.patch(
    "/api/rolls/:id",
    requireAuth,
    requirePermission(
      "edit_production",
      "manage_production",
      "view_film_dashboard",
      "view_printing_dashboard",
      "view_cutting_dashboard",
    ),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const {
          stage,
          weight_kg,
          waste_kg,
          cut_weight_total_kg,
          printing_machine_id,
        } = req.body;

        // Prepare safe updates object
        const safeUpdates: any = {};

        // Handle stage transitions securely with employee tracking
        if (stage) {
          const validStages = ["film", "printing", "cutting", "done"];
          if (!validStages.includes(stage)) {
            return res.status(400).json({ message: "مرحلة غير صالحة" });
          }

          const currentRoll = await storage.getRollById(id);
          if (!currentRoll) {
            return res.status(404).json({ message: "الرول غير موجود" });
          }

          const allowedTransitions: Record<string, string[]> = {
            film: ["printing", "cutting"],
            printing: ["cutting"],
            cutting: ["done"],
            done: [],
          };

          const currentStage = currentRoll.stage || "film";
          if (!allowedTransitions[currentStage]?.includes(stage)) {
            return res.status(400).json({
              message: `لا يمكن الانتقال من مرحلة "${currentStage}" إلى مرحلة "${stage}"`,
            });
          }

          // الانتقال film → cutting مسموح فقط عندما لا تتطلب المنتج طباعة
          if (currentStage === "film" && stage === "cutting") {
            const skipPrinting = await db.execute(sql`
              SELECT COALESCE(cp.is_printed, false) = false AS skip
              FROM rolls r
              JOIN production_orders po ON r.production_order_id = po.id
              JOIN customer_products cp ON po.customer_product_id = cp.id
              WHERE r.id = ${id}
              LIMIT 1
            `);
            const canSkip = (skipPrinting.rows?.[0] as any)?.skip === true;
            if (!canSkip) {
              return res.status(400).json({
                message:
                  'لا يمكن تخطي مرحلة الطباعة لرول يحتاج إلى طباعة',
              });
            }
          }

          safeUpdates.stage = stage;
          const userId = getAuthUserId(req);

          if (userId) {
            if (stage === "printing") {
              safeUpdates.printed_by = userId;
              safeUpdates.printed_at = new Date();
              if (printing_machine_id) {
                const machineIdStr = String(printing_machine_id).trim();
                if (!machineIdStr) {
                  return res
                    .status(400)
                    .json({ message: "معرّف ماكينة الطباعة مطلوب" });
                }
                const machine = await storage.getMachineById(machineIdStr);
                if (!machine) {
                  return res
                    .status(400)
                    .json({ message: "ماكينة الطباعة غير موجودة" });
                }
                safeUpdates.printing_machine_id = machineIdStr;
              }
            } else if (stage === "cutting") {
              safeUpdates.cut_by = userId;
              // Note: cut_completed_at is set only when moving to 'done'
            } else if (stage === "done") {
              safeUpdates.cut_completed_at = new Date();
            }
          }
        }

        // Allow specific safe fields only (whitelist approach) with numeric validation
        if (weight_kg !== undefined) {
          const parsedWeight = parseFloat(String(weight_kg));
          if (isNaN(parsedWeight) || parsedWeight < 0) {
            return res
              .status(400)
              .json({ message: "وزن الرول يجب أن يكون رقماً غير سالب" });
          }
          safeUpdates.weight_kg = parsedWeight;
        }
        if (waste_kg !== undefined) {
          const parsedWaste = parseFloat(String(waste_kg));
          if (isNaN(parsedWaste) || parsedWaste < 0) {
            return res
              .status(400)
              .json({ message: "كمية الهدر يجب أن تكون رقماً غير سالب" });
          }
          safeUpdates.waste_kg = parsedWaste;
        }
        if (cut_weight_total_kg !== undefined) {
          const parsedCutWeight = parseFloat(String(cut_weight_total_kg));
          if (isNaN(parsedCutWeight) || parsedCutWeight < 0) {
            return res
              .status(400)
              .json({ message: "وزن القص يجب أن يكون رقماً غير سالب" });
          }
          safeUpdates.cut_weight_total_kg = parsedCutWeight;
        }

        if (Object.keys(safeUpdates).length === 0) {
          return res.status(400).json({ message: "لا توجد بيانات للتحديث" });
        }

        const roll = await storage.updateRoll(id, safeUpdates);

        // Update completion percentages when stage changes
        if (stage && roll) {
          await storage.updateProductionOrderCompletionPercentages(
            roll.production_order_id,
          );
        }

        res.json(roll);
      } catch (error) {
        console.error(
          "Error updating roll:",
          error instanceof Error ? error.message : String(error),
        );
        res.status(400).json({ message: "خطأ في تحديث الرول" });
      }
    },
  );

  // ================ PRINTING OPERATOR API ROUTES ================

  // Get rolls ready for printing by section
  app.get(
    "/api/rolls/printing-queue-by-section",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        // Get rolls ready for printing (in film stage)
        const printingQueue = await storage.getRollsForPrintingBySection(
          (user as any).section_id,
        );

        res.json(printingQueue);
      } catch (error) {
        console.error("Error fetching printing queue by section:", error);
        res.status(500).json({ message: "خطأ في جلب قائمة انتظار الطباعة" });
      }
    },
  );

  // Mark roll as printed
  app.post(
    "/api/rolls/:id/mark-printed",
    requireAuth,
    requirePermission("edit_production", "manage_production", "view_printing_dashboard"),
    async (req: AuthRequest, res) => {
      try {
        const rollId = parseRouteParam(req.params.id, "Roll ID");
        const user = req.user;

        if (!user) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        // Mark the roll as printed
        const updatedRoll = await storage.markRollAsPrinted(rollId, user.id);

        res.json({
          success: true,
          data: updatedRoll,
          message: "تم تسجيل طباعة الرول بنجاح",
        });
      } catch (error: any) {
        console.error("Error marking roll as printed:", error);
        res.status(400).json({
          success: false,
          message: "خطأ في تسجيل طباعة الرول",
        });
      }
    },
  );

  // Get printing progress for a production order
  app.get(
    "/api/production-orders/:id/printing-progress",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const productionOrderId = parseRouteParam(
          req.params.id,
          "Production Order ID",
        );

        // Get production order stats
        const stats = await storage.getProductionOrderStats(productionOrderId);

        // Check if printing is completed
        const isCompleted =
          await storage.checkPrintingCompletion(productionOrderId);

        res.json({
          success: true,
          data: {
            ...stats,
            printing_completed: isCompleted,
          },
        });
      } catch (error) {
        console.error("Error fetching printing progress:", error);
        res.status(500).json({
          success: false,
          message: "خطأ في جلب تقدم الطباعة",
        });
      }
    },
  );

  // Get printing statistics
  app.get("/api/printing/stats", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user;
      const stats = await storage.getPrintingStats();

      res.json(stats);
    } catch (error) {
      console.error("Error fetching printing stats:", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات الطباعة" });
    }
  });

  // ============ Film Operator Endpoints ============

  // Get active production orders for film operator
  app.get(
    "/api/production-orders/active-for-operator",
    requireAuth,
    requirePermission(
      "manage_production",
      "view_film_dashboard",
      "view_printing_dashboard",
      "view_cutting_dashboard",
    ),
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const orders =
          await storage.getActiveProductionOrdersForOperator(userId);
        res.json(orders);
      } catch (error) {
        console.error("Error fetching operator production orders:", error);
        res.status(500).json({ message: "خطأ في جلب أوامر الإنتاج" });
      }
    },
  );

  // Create roll with timing calculation
  app.post(
    "/api/rolls/create-with-timing",
    requireAuth,
    requirePermission("add_production", "manage_production", "view_film_dashboard"),
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);

        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const dataToValidate = {
          ...req.body,
          created_by: userId,
        };

        const validatedData = insertRollSchema.parse(dataToValidate);

        // Check if order is paused - block production entry
        const pauseCheck = await checkOrderNotPaused(
          validatedData.production_order_id,
        );
        if (pauseCheck.isPaused) {
          return res.status(403).json({
            success: false,
            message: pauseCheck.message,
            orderStatus: pauseCheck.orderStatus,
          });
        }

        const isLastRoll = req.body.is_last_roll || false;

        // Inline printing: if the operator marked the roll as printed inline,
        // resolve and validate the pairing server-side (never trust the client),
        // then create the roll already at stage='printing' so it bypasses the
        // printing queue and lands directly in the cutting queue.
        const inlineFields = await resolveInlinePrintedFields(
          req.body.inline_printed === true,
          validatedData.film_machine_id,
          validatedData.production_order_id,
          userId,
        );

        const rollData = {
          ...sanitizeRollCreateInput(validatedData),
          is_last_roll: isLastRoll,
          ...inlineFields,
        };

        // Race-safe: lock the production_orders row, re-check the quota under
        // the lock, then create the roll — all inside a single transaction.
        const newRoll = await db.transaction(async (tx) => {
          // Acquire the advisory lock FIRST (before the row lock) so every
          // roll-create path uses the same lock order (advisory -> row lock).
          // The final-roll path acquires the advisory lock first too; matching
          // the order here avoids cross-path deadlocks under concurrency.
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(1003, ${validatedData.production_order_id})`,
          );

          if (!isLastRoll) {
            const [check] = (await tx.execute(sql`
              SELECT
                po.final_quantity_kg,
                po.quantity_kg,
                po.overrun_percentage,
                COALESCE((
                  SELECT SUM(r.weight_kg) FROM rolls r
                  WHERE r.production_order_id = ${validatedData.production_order_id}
                ), 0) AS total_produced
              FROM production_orders po
              WHERE po.id = ${validatedData.production_order_id}
              FOR UPDATE
            `)).rows as any[];

            if (check) {
              const finalQty = parseFloat(check.final_quantity_kg?.toString() || "0");
              const targetKg =
                finalQty > 0
                  ? finalQty
                  : parseFloat(check.quantity_kg?.toString() || "0");
              const overrunPct = parseFloat(
                check.overrun_percentage?.toString() || "0",
              );
              const maxAllowed = targetKg * (1 + overrunPct / 100);
              const totalProduced = parseFloat(check.total_produced?.toString() || "0");
              const newRollWeight = parseFloat(
                req.body.weight_kg?.toString() || "0",
              );

              if (totalProduced + newRollWeight > maxAllowed) {
                const err: any = new Error("OVERRUN");
                err.userMessage = `سيتجاوز الإنتاج الكمية المسموحة (${maxAllowed.toFixed(1)} كجم). الكمية المنتجة حالياً: ${totalProduced.toFixed(1)} كجم + رول جديد: ${newRollWeight.toFixed(1)} كجم = ${(totalProduced + newRollWeight).toFixed(1)} كجم. استخدم "رول نهائي" لإغلاق الأمر.`;
                err.status = 400;
                throw err;
              }
            }
          }

          // Reuse THIS transaction for the insert so the roll INSERT runs on
          // the same connection that holds the FOR UPDATE lock above. Passing a
          // separate transaction would deadlock on the production_orders row.
          return await storage.createRollWithTiming(rollData, tx);
        });

        // Recalculate completion percentages AFTER the transaction commits, so
        // the UPDATE doesn't contend with the FOR UPDATE row lock held above.
        // The roll is already committed at this point, so a failure here must
        // not turn into a 500 — log it and still return success.
        try {
          await storage.updateProductionOrderCompletionPercentages(
            validatedData.production_order_id,
          );
        } catch (pctError) {
          console.error(
            "Roll created but completion recalculation failed:",
            pctError instanceof Error ? pctError.message : String(pctError),
          );
        }

        res.status(201).json({
          success: true,
          message: "تم إنشاء الرول بنجاح",
          roll: newRoll,
          roll_number: newRoll.roll_number,
        });
      } catch (error: any) {
        if (error?.status === 400 && error?.userMessage) {
          return res.status(400).json({
            success: false,
            message: error.userMessage,
          });
        }
        console.error(
          "Error creating roll with timing:",
          error instanceof Error ? error.message : String(error),
        );
        res.status(500).json({
          success: false,
          message: "خطأ في إنشاء الرول",
        });
      }
    },
  );

  // Create final roll and complete film production
  app.post(
    "/api/rolls/create-final",
    requireAuth,
    requirePermission("add_production", "manage_production", "view_film_dashboard"),
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);

        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const dataToValidate = {
          ...req.body,
          created_by: userId,
        };

        const validatedData = insertRollSchema.parse(dataToValidate);

        // Check if order is paused - block production entry
        const pauseCheck = await checkOrderNotPaused(
          validatedData.production_order_id,
        );
        if (pauseCheck.isPaused) {
          return res.status(403).json({
            success: false,
            message: pauseCheck.message,
            orderStatus: pauseCheck.orderStatus,
          });
        }

        const inlineFields = await resolveInlinePrintedFields(
          req.body.inline_printed === true,
          validatedData.film_machine_id,
          validatedData.production_order_id,
          userId,
        );

        const newRoll = await storage.createFinalRoll({
          ...sanitizeRollCreateInput(validatedData),
          ...inlineFields,
        });
        res.status(201).json({
          success: true,
          message: "تم إنشاء آخر رول وإغلاق مرحلة الفيلم بنجاح",
          roll: newRoll,
          roll_number: newRoll.roll_number,
        });
      } catch (error: any) {
        if (error?.status === 400 && error?.userMessage) {
          return res.status(400).json({
            success: false,
            message: error.userMessage,
          });
        }
        console.error("Error creating final roll:", error);
        res.status(500).json({
          success: false,
          message: "خطأ في إنشاء آخر رول",
        });
      }
    },
  );

  // ============ Printing Operator Endpoints ============

  // Get active rolls for printing operator
  app.get(
    "/api/rolls/active-for-printing",
    requireAuth,
    requirePermission("manage_production", "view_printing_dashboard"),
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const rolls = await storage.getActivePrintingRollsForOperator(userId);
        res.json(rolls);
      } catch (error) {
        console.error("Error fetching printing rolls:", error);
        res.status(500).json({ message: "خطأ في جلب رولات الطباعة" });
      }
    },
  );

  // ============ Cutting Operator Endpoints ============

  // Get active rolls for cutting operator
  app.get(
    "/api/rolls/active-for-cutting",
    requireAuth,
    requirePermission("manage_production", "view_cutting_dashboard"),
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const rolls = await storage.getActiveCuttingRollsForOperator(userId);
        res.json(rolls);
      } catch (error) {
        console.error("Error fetching cutting rolls:", error);
        res.status(500).json({ message: "خطأ في جلب رولات التقطيع" });
      }
    },
  );

  // Active production order for a specific machine (used by Operator Focus Mode)
  app.get(
    "/api/production/active-by-machine/:machineId",
    requireAuth,
    requirePermission(
      "view_film_dashboard",
      "view_printing_dashboard",
      "view_cutting_dashboard",
      "manage_production",
      "manage_production_hall",
    ),
    async (req, res) => {
      try {
        const { machineId } = req.params;
        const result = await db.execute(sql`
          SELECT
            po.id,
            po.production_order_number,
            po.status,
            po.film_completed,
            po.printing_completed,
            po.cutting_completed,
            po.quantity_kg,
            po.final_quantity_kg,
            po.overrun_percentage,
            po.assigned_machine_id,
            cp.size_caption,
            cp.raw_material,
            cp.master_batch_id,
            cp.width_cm,
            cp.thickness_micron,
            o.order_number,
            c.name_ar AS customer_name_ar,
            COALESCE((
              SELECT SUM(r.weight_kg::numeric)
              FROM rolls r
              WHERE r.production_order_id = po.id
            ), 0) AS produced_quantity_kg,
            (SELECT COUNT(*) FROM rolls r WHERE r.production_order_id = po.id) AS rolls_count
          FROM production_orders po
          JOIN customer_products cp ON po.customer_product_id = cp.id
          JOIN orders o ON po.order_id = o.id
          JOIN customers c ON o.customer_id = c.id
          WHERE po.assigned_machine_id = ${machineId}
            AND po.film_completed = false
            AND po.status NOT IN ('cancelled', 'done')
          ORDER BY po.created_at ASC
          LIMIT 1
        `);

        if (result.rows.length === 0) {
          return res.json(null);
        }
        res.json(result.rows[0]);
      } catch (error) {
        logger.error("Error fetching active-by-machine:", error);
        res.status(500).json({ message: "خطأ في جلب أمر الإنتاج النشط" });
      }
    },
  );

  // ============ Machine Queues Management API ============

  app.get("/api/machine-queues", requireAuth, async (req, res) => {
    try {
      const queues = await storage.getMachineQueues();
      res.json({ data: queues });
    } catch (error) {
      console.error("Error fetching machine queues:", error);
      res.status(500).json({ message: "خطأ في جلب طوابير الماكينات" });
    }
  });

  app.post("/api/machine-queues/assign", requireAuth, requirePermission("edit_production", "manage_production"), async (req, res) => {
    try {
      const assignSchema = z.object({
        productionOrderId: z.coerce.number().int().positive(),
        machineId: z.string().min(1),
        position: z.coerce.number().int().min(0),
      });
      const parsed = assignSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message:
            "بيانات غير كاملة - مطلوب معرف أمر الإنتاج والماكينة والموضع",
          errors: parsed.error.errors,
        });
      }
      const { productionOrderId, machineId, position } = parsed.data;

      const assignUserId = getAuthUserId(req);
      if (!assignUserId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول" });
      }
      const queueEntry = await storage.assignToMachineQueue(
        productionOrderId,
        machineId,
        position,
        assignUserId,
      );

      res.json({
        data: queueEntry,
        message: "تم تخصيص أمر الإنتاج للماكينة بنجاح",
      });
    } catch (error: any) {
      console.error("Error assigning to machine queue:", error);
      res.status(400).json({
        message: "خطأ في تخصيص أمر الإنتاج للماكينة",
      });
    }
  });

  app.put(
    "/api/machine-queues/reorder",
    requireAuth,
    requirePermission("edit_production", "manage_production"),
    async (req, res) => {
      try {
        const { queueId, newPosition } = req.body;

        if (!queueId || newPosition === undefined) {
          return res.status(400).json({
            message: "بيانات غير كاملة - مطلوب معرف الطابور والموضع الجديد",
          });
        }

        const updated = await storage.updateQueuePosition(queueId, newPosition);

        res.json({
          data: updated,
          message: "تم تحديث ترتيب الطابور بنجاح",
        });
      } catch (error: any) {
        console.error("Error reordering queue:", error);
        res.status(400).json({
          message: "خطأ في تحديث ترتيب الطابور",
        });
      }
    },
  );

  app.delete(
    "/api/machine-queues/:id",
    requireAuth,
    requirePermission("delete_production", "manage_production", "manage_definitions"),
    async (req, res) => {
      try {
        const queueId = parseInt(req.params.id);

        if (isNaN(queueId)) {
          return res.status(400).json({
            message: "معرف طابور غير صحيح",
          });
        }

        await storage.removeFromQueue(queueId);

        res.json({
          message: "تم إزالة أمر الإنتاج من الطابور بنجاح",
          success: true,
        });
      } catch (error: any) {
        console.error("Error removing from queue:", error);
        res.status(400).json({
          message: "خطأ في إزالة أمر الإنتاج من الطابور",
        });
      }
    },
  );

  app.get("/api/machine-queues/suggest", requireAuth, async (req, res) => {
    try {
      const suggestions = await storage.suggestOptimalDistribution();
      res.json({ data: suggestions });
    } catch (error) {
      console.error("Error getting distribution suggestions:", error);
      res.status(500).json({ message: "خطأ في الحصول على اقتراحات التوزيع" });
    }
  });

  // ============ Smart Distribution API ============

  // Apply smart distribution
  app.post(
    "/api/machine-queues/smart-distribute",
    requireAuth,
    requirePermission("edit_production", "manage_production", "manage_orders"),
    async (req, res) => {
      try {
        const { algorithm, params } = req.body;

        if (!algorithm) {
          return res.status(400).json({
            message: "خوارزمية التوزيع مطلوبة",
          });
        }

        const validAlgorithms = [
          "balanced",
          "load-based",
          "priority",
          "product-type",
          "hybrid",
        ];
        if (!validAlgorithms.includes(algorithm)) {
          return res.status(400).json({
            message: `خوارزمية غير صحيحة. الخيارات المتاحة: ${validAlgorithms.join(", ")}`,
          });
        }

        const distributeUserId = getAuthUserId(req);
        if (!distributeUserId) {
          return res.status(401).json({ message: "يجب تسجيل الدخول" });
        }
        const result = await storage.smartDistributeOrders(algorithm, {
          ...params,
          userId: distributeUserId,
        });

        res.json({
          success: result.success,
          message: result.message,
          data: result,
        });
      } catch (error: any) {
        console.error("Error applying smart distribution:", error);
        res.status(400).json({
          message: "خطأ في تطبيق التوزيع الذكي",
        });
      }
    },
  );

  // Get distribution preview
  app.get(
    "/api/machine-queues/distribution-preview",
    requireAuth,
    async (req, res) => {
      try {
        const { algorithm, ...params } = req.query;

        if (!algorithm) {
          return res.status(400).json({
            message: "خوارزمية التوزيع مطلوبة",
          });
        }

        const preview = await storage.getDistributionPreview(
          algorithm as string,
          params,
        );

        res.json({
          success: true,
          data: preview,
        });
      } catch (error: any) {
        console.error("Error getting distribution preview:", error);
        res.status(400).json({
          message: "خطأ في معاينة التوزيع",
        });
      }
    },
  );

  // Optimize machine queue order
  app.post(
    "/api/machine-queues/optimize/:machineId",
    requireAuth,
    async (req, res) => {
      try {
        const { machineId } = req.params;

        if (!machineId) {
          return res.status(400).json({
            message: "معرف الماكينة مطلوب",
          });
        }

        await storage.optimizeQueueOrder(machineId);

        res.json({
          success: true,
          message: "تم تحسين ترتيب طابور الماكينة بنجاح",
        });
      } catch (error: any) {
        console.error("Error optimizing queue order:", error);
        res.status(400).json({
          message: "خطأ في تحسين ترتيب الطابور",
        });
      }
    },
  );

  app.get(
    "/api/production-queues/board",
    requireAuth,
    requirePermission(
      "view_production",
      "manage_production",
      "view_orders",
      "manage_orders",
    ),
    async (req, res) => {
      try {
        const stage = String(req.query.stage || "");
        if (!VALID_QUEUE_STAGES.includes(stage)) {
          return res.status(400).json({ message: "مرحلة غير صالحة" });
        }
        const board = await storage.getProductionQueueBoard(stage);
        res.json({ data: board });
      } catch (error: any) {
        console.error("Error fetching production queue board:", error);
        res.status(500).json({ message: "خطأ في جلب طوابير الإنتاج" });
      }
    },
  );

  app.post(
    "/api/production-queues/assign",
    requireAuth,
    requirePermission("edit_production", "manage_production", "manage_orders"),
    async (req, res) => {
      try {
        const { productionOrderId, machineId, stage } = req.body;
        if (
          !productionOrderId ||
          !machineId ||
          !VALID_QUEUE_STAGES.includes(String(stage))
        ) {
          return res.status(400).json({
            message:
              "بيانات غير كاملة - مطلوب معرف أمر الإنتاج والماكينة والمرحلة",
          });
        }
        const assignUserId = getAuthUserId(req);
        if (!assignUserId) {
          return res.status(401).json({ message: "يجب تسجيل الدخول" });
        }
        const entry = await storage.assignToProductionQueue(
          Number(productionOrderId),
          String(machineId),
          String(stage),
          assignUserId,
        );
        res.json({
          data: entry,
          message: "تم تخصيص أمر الإنتاج للماكينة بنجاح",
        });
      } catch (error: any) {
        console.error("Error assigning to production queue:", error);
        res
          .status(400)
          .json({ message: error?.message || "خطأ في تخصيص أمر الإنتاج" });
      }
    },
  );

  app.put(
    "/api/production-queues/reorder",
    requireAuth,
    requirePermission("edit_production", "manage_production", "manage_orders"),
    async (req, res) => {
      try {
        const { machineId, orderedQueueIds } = req.body;
        if (!machineId || !Array.isArray(orderedQueueIds)) {
          return res.status(400).json({
            message: "بيانات غير كاملة - مطلوب معرف الماكينة وترتيب الطابور",
          });
        }
        await storage.reorderMachineQueue(
          String(machineId),
          orderedQueueIds.map((id: any) => Number(id)),
        );
        res.json({ message: "تم تحديث ترتيب الطابور بنجاح", success: true });
      } catch (error: any) {
        console.error("Error reordering production queue:", error);
        res
          .status(400)
          .json({ message: error?.message || "خطأ في تحديث ترتيب الطابور" });
      }
    },
  );

  app.delete(
    "/api/production-queues/:queueId",
    requireAuth,
    requirePermission("edit_production", "manage_production", "manage_orders"),
    async (req, res) => {
      try {
        const queueId = parseInt(req.params.queueId);
        if (isNaN(queueId)) {
          return res.status(400).json({ message: "معرف طابور غير صحيح" });
        }
        await storage.removeFromQueue(queueId);
        res.json({ message: "تم إزالة أمر الإنتاج من الطابور بنجاح", success: true });
      } catch (error: any) {
        console.error("Error removing from production queue:", error);
        res
          .status(400)
          .json({ message: error?.message || "خطأ في إزالة أمر الإنتاج" });
      }
    },
  );

  // Cancel distribution ("إلغاء الفرز") for all machines of a stage at once.
  app.post(
    "/api/production-queues/clear-all",
    requireAuth,
    requirePermission("edit_production", "manage_production", "manage_orders"),
    async (req, res) => {
      try {
        const stage = String(req.body?.stage || "");
        if (!VALID_QUEUE_STAGES.includes(stage)) {
          return res.status(400).json({ message: "مرحلة غير صالحة" });
        }
        const { removed } = await storage.clearStageQueues(stage);
        res.json({
          success: true,
          removed,
          message: "تم إلغاء الفرز لجميع المكائن بنجاح",
        });
      } catch (error: any) {
        console.error("Error clearing stage queues:", error);
        res
          .status(400)
          .json({ message: error?.message || "خطأ في إلغاء الفرز" });
      }
    },
  );

  app.get(
    "/api/production-queues/suggest",
    requireAuth,
    requirePermission(
      "view_production",
      "manage_production",
      "view_orders",
      "manage_orders",
    ),
    async (req, res) => {
      try {
        const stage = String(req.query.stage || "");
        const machineId = String(req.query.machineId || "");
        if (!VALID_QUEUE_STAGES.includes(stage) || !machineId) {
          return res
            .status(400)
            .json({ message: "مطلوب معرف الماكينة والمرحلة" });
        }
        const sortMethod = String(req.query.sortMethod || "similarity");
        const validSortMethods = ["similarity", "throughput", "color_first"];
        const safeSortMethod = validSortMethods.includes(sortMethod)
          ? sortMethod
          : "similarity";
        const suggestion = await storage.suggestQueueOrder(
          machineId,
          stage,
          safeSortMethod,
        );
        res.json({ data: suggestion });
      } catch (error: any) {
        console.error("Error suggesting queue order:", error);
        res
          .status(400)
          .json({ message: error?.message || "خطأ في اقتراح ترتيب الطابور" });
      }
    },
  );

  // Historical production patterns per machine — "learning insights" for the
  // operator board. Returns dominant material, top colours, and width range
  // derived from completed rolls on that machine.
  app.get(
    "/api/production-queues/machine-insights/:machineId",
    requireAuth,
    requirePermission(
      "view_production",
      "manage_production",
      "view_orders",
      "manage_orders",
    ),
    async (req, res) => {
      try {
        const stage = String(req.query.stage || "");
        const machineId = req.params.machineId;
        if (!VALID_QUEUE_STAGES.includes(stage) || !machineId) {
          return res
            .status(400)
            .json({ message: "مطلوب معرف الماكينة والمرحلة" });
        }
        const insights = await storage.getQueueLearningInsights(
          machineId,
          stage,
        );
        res.json({ data: insights });
      } catch (error: any) {
        console.error("Error getting machine insights:", error);
        res.status(500).json({ message: "خطأ في جلب بيانات التعلم" });
      }
    },
  );

  // ============ PRODUCTION FLOW API ENDPOINTS ============

  // Production Settings
  app.get("/api/production/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getProductionSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching production settings:", error);
      res.status(500).json({ message: "خطأ في جلب إعدادات الإنتاج" });
    }
  });

  app.patch("/api/production/settings", requireAuth, requirePermission("manage_settings"), async (req, res) => {
    try {
      const validationSchema = insertProductionSettingsSchema
        .pick({
          overrun_tolerance_percent: true,
          allow_last_roll_overrun: true,
          qr_prefix: true,
        })
        .extend({
          overrun_tolerance_percent: z
            .number()
            .min(0)
            .max(10)
            .transform((v) => Number(v.toFixed(2))),
          qr_prefix: z.string().min(1, "بادئة الـ QR مطلوبة"),
        });

      const validated = validationSchema.parse(req.body);
      const settingsData = {
        ...validated,
        overrun_tolerance_percent: String(validated.overrun_tolerance_percent),
      };
      const settings = await storage.updateProductionSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating production settings:", error);
      res.status(400).json({ message: "خطأ في تحديث إعدادات الإنتاج" });
    }
  });

  // Start Production
  app.patch(
    "/api/production-orders/:id/start-production",
    requireAuth,
    requirePermission("edit_production", "manage_production"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const productionOrder = await storage.startProduction(id);
        res.json(productionOrder);
      } catch (error) {
        console.error("Error starting production:", error);
        res.status(400).json({ message: "خطأ في بدء الإنتاج" });
      }
    },
  );

  // Create Roll with QR
  app.post(
    "/api/rolls",
    requireAuth,
    requirePermission("add_production", "manage_production"),
    validateRequest({ body: insertRollSchema.omit({ created_by: true }) }),
    async (req, res) => {
      try {
        // Ensure session userId is valid
        if (!getAuthUserId(req) || typeof getAuthUserId(req) !== "number") {
          return res.status(401).json({ message: "معرف المستخدم غير صحيح" });
        }

        // Get DataValidator for business rule enforcement
        const dataValidator = getDataValidator(storage);

        // Add created_by from session and validate the complete data
        const rollData = {
          ...req.body,
          created_by: Number(getAuthUserId(req)),
        };

        // Validate with insertRollSchema AFTER adding created_by
        let validatedRollData;
        try {
          validatedRollData = insertRollSchema.parse(rollData);
        } catch (validationError) {
          console.error("Roll schema validation failed:", validationError);
          if (validationError instanceof z.ZodError) {
            return res.status(400).json({
              message: "بيانات غير صحيحة",
              errors: validationError.errors,
            });
          }
          throw validationError;
        }

        // INVARIANT B: Validate roll weight against production order limits
        const productionOrder = await storage.getProductionOrderById(
          validatedRollData.production_order_id,
        );
        if (!productionOrder) {
          return res.status(400).json({
            message: "أمر الإنتاج غير موجود",
            field: "production_order_id",
          });
        }

        // Check if order is paused - block production entry
        const pauseCheck = await checkOrderNotPaused(
          validatedRollData.production_order_id,
        );
        if (pauseCheck.isPaused) {
          return res.status(403).json({
            success: false,
            message: pauseCheck.message,
            orderStatus: pauseCheck.orderStatus,
          });
        }

        // INVARIANT E: Validate film machine is active (printing and cutting machines assigned in later stages)
        const filmMachine = await storage.getMachineById(
          validatedRollData.film_machine_id,
        );
        if (!filmMachine) {
          return res.status(400).json({
            message: "ماكينة الفيلم غير موجودة",
            field: "film_machine_id",
          });
        }
        if (filmMachine.status !== "active") {
          return res.status(400).json({
            message: "ماكينة الفيلم غير نشطة - لا يمكن إنشاء رولات عليها",
            field: "film_machine_id",
          });
        }

        // Run synchronous business rule validation
        const validationResult =
          await dataValidator.validateRollCreation(validatedRollData);
        if (!validationResult.isValid) {
          return res.status(400).json({
            message: "فشل في التحقق من قواعد العمل",
            errors: validationResult.errors,
            warnings: validationResult.warnings,
          });
        }

        // Generate QR code and roll number with validation passed
        const roll = await storage.createRoll(validatedRollData);
        res.status(201).json(roll);
      } catch (error) {
        console.error("Error creating roll:", error);
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors);
          res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: error.errors,
          });
        } else if (
          error instanceof Error &&
          error.message.includes("تجاوزت الحد المسموح")
        ) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: "خطأ في إنشاء الرول" });
        }
      }
    },
  );

  // Printing Operations
  app.patch(
    "/api/rolls/:id/print",
    requireAuth,
    requirePermission("edit_production", "manage_production", "view_printing_dashboard"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        if (!getAuthUserId(req)) {
          return res.status(401).json({ message: "غير مسجل الدخول" });
        }

        // Get roll to check its production order
        const existingRoll = await storage.getRollFullDetails(id);
        if (!existingRoll) {
          return res.status(404).json({ message: "الرول غير موجود" });
        }

        // Check if order is paused - block production entry
        const pauseCheck = await checkOrderNotPaused(
          existingRoll.production_order_id,
        );
        if (pauseCheck.isPaused) {
          return res.status(403).json({
            success: false,
            message: pauseCheck.message,
            orderStatus: pauseCheck.orderStatus,
          });
        }

        const { printing_machine_id } = req.body;

        // Validate printing machine if provided
        if (printing_machine_id) {
          const machine = await storage.getMachineById(printing_machine_id);
          if (!machine) {
            return res
              .status(400)
              .json({ message: "ماكينة الطباعة غير موجودة" });
          }
          if (machine.status !== "active") {
            return res.status(400).json({ message: "ماكينة الطباعة غير نشطة" });
          }
        }

        const roll = await storage.markRollPrinted(
          id,
          getAuthUserId(req),
          printing_machine_id,
        );
        res.json(roll);
      } catch (error) {
        console.error("Error marking roll printed:", error);
        res.status(400).json({ message: "خطأ في تسجيل طباعة الرول" });
      }
    },
  );

  // Cutting Operations
  app.post("/api/cuts", requireAuth, requirePermission("add_production", "manage_production"), async (req, res) => {
    try {
      const validationSchema = insertCutSchema.extend({
        cut_weight_kg: z.coerce
          .number()
          .gt(0, "الوزن يجب أن يكون أكبر من صفر")
          .max(50000, "الوزن يتجاوز 50 طن")
          .transform((v) => Number(v.toFixed(3))),
        pieces_count: z.preprocess(
          (v) => (v === "" || v === null || v === undefined ? undefined : v),
          z.coerce.number().positive().optional(),
        ),
        cutting_machine_id: z.string().min(1, "يجب اختيار ماكينة القطع"),
      });

      const validated = validationSchema.parse(req.body);
      if (!getAuthUserId(req)) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      // Get roll to check its production order
      const existingRoll = await storage.getRollFullDetails(validated.roll_id);
      if (!existingRoll) {
        return res.status(404).json({ message: "الرول غير موجود" });
      }

      // Validate that requested cut weight does not exceed remaining roll weight
      const rollWeightKg = parseFloat(String(existingRoll.weight_kg || 0));
      const alreadyCutKg = parseFloat(String(existingRoll.cut_weight_total_kg || 0));
      const availableKg = rollWeightKg - alreadyCutKg;
      if (validated.cut_weight_kg > availableKg + 0.001) {
        return res.status(400).json({
          message: `الوزن المطلوب (${validated.cut_weight_kg} كجم) يتجاوز الكمية المتاحة في الرول (${availableKg.toFixed(3)} كجم)`,
        });
      }

      // Check if order is paused - block production entry
      const pauseCheck = await checkOrderNotPaused(
        existingRoll.production_order_id,
      );
      if (pauseCheck.isPaused) {
        return res.status(403).json({
          success: false,
          message: pauseCheck.message,
          orderStatus: pauseCheck.orderStatus,
        });
      }

      // Validate cutting machine
      const { cutting_machine_id } = validated;
      if (cutting_machine_id) {
        const machine = await storage.getMachineById(cutting_machine_id);
        if (!machine) {
          return res.status(400).json({ message: "ماكينة القطع غير موجودة" });
        }
        if (machine.status !== "active") {
          return res.status(400).json({ message: "ماكينة القطع غير نشطة" });
        }
      }

      const cut = await storage.createCut({
        ...validated,
        performed_by: getAuthUserId(req),
      });
      res.status(201).json(cut);
    } catch (error) {
      console.error("Error creating cut:", error);
      if (
        error instanceof Error &&
        error.message.includes("الوزن المطلوب أكبر من المتاح")
      ) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "خطأ في تسجيل القطع" });
      }
    }
  });

  // Production Queues
  app.get("/api/production/film-queue", requireAuth, async (req, res) => {
    try {
      const queue = await storage.getFilmQueue();
      res.json(queue);
    } catch (error) {
      console.error("Error fetching film queue:", error);
      res.status(500).json({ message: "خطأ في جلب قائمة الفيلم" });
    }
  });

  app.get("/api/production/printing-queue", requireAuth, async (req, res) => {
    try {
      const queue = await storage.getPrintingQueue();
      res.json(queue);
    } catch (error) {
      console.error("Error fetching printing queue:", error);
      res.status(500).json({ message: "خطأ في جلب قائمة الطباعة" });
    }
  });

  app.get("/api/production/cutting-queue", requireAuth, async (req, res) => {
    try {
      const queue = await storage.getCuttingQueue();
      res.json(queue);
    } catch (error) {
      console.error("Error fetching cutting queue:", error);
      res.status(500).json({ message: "خطأ في جلب قائمة التقطيع" });
    }
  });

  app.get(
    "/api/production/grouped-cutting-queue",
    requireAuth,
    async (req, res) => {
      try {
        const queue = await storage.getGroupedCuttingQueue();
        res.json(queue);
      } catch (error) {
        console.error("Error fetching grouped cutting queue:", error);
        res.status(500).json({ message: "خطأ في جلب قائمة التقطيع المجمعة" });
      }
    },
  );

  app.get(
    "/api/production/order-progress/:jobOrderId",
    requireAuth,
    async (req, res) => {
      try {
        const jobOrderId = parseInt(req.params.jobOrderId);
        if (isNaN(jobOrderId) || jobOrderId <= 0) {
          return res.status(400).json({ message: "معرف أمر العمل غير صحيح" });
        }
        const progress = await storage.getOrderProgress(jobOrderId);
        res.json(progress);
      } catch (error) {
        console.error("Error fetching order progress:", error);
        res.status(500).json({ message: "خطأ في جلب تقدم الطلب" });
      }
    },
  );

  app.get("/api/rolls/:id/qr", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");
      const qrData = await storage.getRollQR(id);
      res.json(qrData);
    } catch (error: any) {
      if (error?.message === "Roll not found") {
        return res.status(404).json({ message: "الرول غير موجود" });
      }
      console.error("Error fetching roll QR:", error);
      res.status(500).json({ message: "خطأ في جلب رمز QR للرول" });
    }
  });

  // Label printing endpoint - generates 4" x 5" label
  app.get("/api/rolls/:id/label", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");
      const labelData = await storage.getRollLabelData(id);
      res.json(labelData);
    } catch (error) {
      console.error("Error generating roll label:", error);
      res.status(500).json({ message: "خطأ في توليد ليبل الرول" });
    }
  });

  // ============ Roll Search API Routes ============

  // البحث الشامل عن الرولات
  app.get("/api/rolls/search", requireAuth, async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      const filters = {
        stage: req.query.stage as string,
        startDate: req.query.start_date as string,
        endDate: req.query.end_date as string,
        machineId: req.query.machine_id as string,
        operatorId: req.query.operator_id
          ? parseIntSafe(req.query.operator_id as string, "Operator ID", {
              min: 1,
            })
          : undefined,
        minWeight: req.query.min_weight
          ? parseFloatSafe(req.query.min_weight as string, "Min Weight", {
              min: 0,
            })
          : undefined,
        maxWeight: req.query.max_weight
          ? parseFloatSafe(req.query.max_weight as string, "Max Weight", {
              min: 0,
            })
          : undefined,
        productionOrderId: req.query.production_order_id
          ? parseIntSafe(
              req.query.production_order_id as string,
              "Production Order ID",
              { min: 1 },
            )
          : undefined,
        orderId: req.query.order_id
          ? parseIntSafe(req.query.order_id as string, "Order ID", { min: 1 })
          : undefined,
      };

      const results = await storage.searchRolls(query, filters);
      res.json(results);
    } catch (error) {
      console.error("Error searching rolls:", error);
      res.status(500).json({ message: "خطأ في البحث عن الرولات" });
    }
  });

  // البحث بالباركود
  app.get(
    "/api/rolls/search-by-barcode/:barcode",
    requireAuth,
    async (req, res) => {
      try {
        const barcode = req.params.barcode;

        if (!barcode || barcode.length < 3) {
          return res.status(400).json({ message: "الباركود غير صحيح" });
        }

        const roll = await storage.getRollByBarcode(barcode);

        if (!roll) {
          return res.status(404).json({ message: "الرول غير موجود" });
        }

        res.json(roll);
      } catch (error) {
        console.error("Error searching roll by barcode:", error);
        res.status(500).json({ message: "خطأ في البحث بالباركود" });
      }
    },
  );

  // جلب التفاصيل الكاملة للرول
  app.get("/api/rolls/:id/full-details", requireAuth, async (req, res) => {
    try {
      const id = parseIntSafe(req.params.id, "Roll ID", { min: 1 });
      const rollDetails = await storage.getRollFullDetails(id);

      if (!rollDetails) {
        return res.status(404).json({ message: "الرول غير موجود" });
      }

      res.json(rollDetails);
    } catch (error) {
      console.error("Error fetching roll full details:", error);
      res.status(500).json({ message: "خطأ في جلب تفاصيل الرول" });
    }
  });

  // جلب سجل تحركات الرول
  app.get("/api/rolls/:id/history", requireAuth, async (req, res) => {
    try {
      const id = parseIntSafe(req.params.id, "Roll ID", { min: 1 });
      const history = await storage.getRollHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching roll history:", error);
      res.status(500).json({ message: "خطأ في جلب سجل تحركات الرول" });
    }
  });

  // ============ Enhanced Cutting Operations API Routes ============

  // جلب رولات التقطيع مع الإحصائيات
  app.get(
    "/api/rolls/cutting-queue-by-section",
    requireAuth,
    async (req, res) => {
      try {
        const authReq = req as AuthRequest;
        const sectionId = (authReq.user as any)?.section_id;

        const result = await storage.getRollsForCuttingBySection(sectionId);
        res.json(result);
      } catch (error) {
        console.error("Error fetching cutting queue by section:", error);
        res.status(500).json({ message: "خطأ في جلب قائمة التقطيع" });
      }
    },
  );

  // إكمال عملية التقطيع
  app.post(
    "/api/rolls/:id/complete-cutting",
    requireAuth,
    requirePermission("edit_production", "manage_production", "view_cutting_dashboard"),
    async (req, res) => {
      try {
        const authReq = req as AuthRequest;
        const rollId = parseRouteParam(req.params.id, "id");
        const { net_weight, cutting_machine_id } = req.body;

        if (!net_weight || net_weight <= 0) {
          return res.status(400).json({
            message: "الوزن الصافي مطلوب ويجب أن يكون أكبر من صفر",
          });
        }

        const operatorId = authReq.user?.id;
        if (!operatorId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await storage.completeCutting(
          rollId,
          net_weight,
          operatorId,
          cutting_machine_id,
        );

        res.json({
          ...result,
          message: result.is_order_completed
            ? "تم إكمال جميع رولات أمر الإنتاج"
            : "تم تقطيع الرول بنجاح",
        });
      } catch (error: any) {
        console.error("Error completing cutting:", error);
        res.status(500).json({
          message: "خطأ في إكمال عملية التقطيع",
        });
      }
    },
  );

  // إحصائيات الهدر لأمر إنتاج
  app.get(
    "/api/production-orders/:id/waste-stats",
    requireAuth,
    async (req, res) => {
      try {
        const productionOrderId = parseInt(req.params.id);

        if (isNaN(productionOrderId)) {
          return res.status(400).json({
            message: "معرف أمر الإنتاج غير صحيح",
          });
        }

        const stats = await storage.calculateWasteStatistics(productionOrderId);
        res.json(stats);
      } catch (error) {
        console.error("Error fetching waste statistics:", error);
        res.status(500).json({
          message: "خطأ في جلب إحصائيات الهدر",
        });
      }
    },
  );

  // التحقق من اكتمال التقطيع
  app.get(
    "/api/production-orders/:id/cutting-status",
    requireAuth,
    async (req, res) => {
      try {
        const productionOrderId = parseInt(req.params.id);

        if (isNaN(productionOrderId)) {
          return res.status(400).json({
            message: "معرف أمر الإنتاج غير صحيح",
          });
        }

        const isCompleted =
          await storage.checkCuttingCompletion(productionOrderId);
        res.json({
          productionOrderId,
          cuttingCompleted: isCompleted,
          status: isCompleted ? "completed" : "active",
        });
      } catch (error) {
        console.error("Error checking cutting completion:", error);
        res.status(500).json({
          message: "خطأ في التحقق من حالة التقطيع",
        });
      }
    },
  );

  // ============ Production Monitoring Analytics API Routes ============

  // Get user performance statistics
  app.get("/api/production/user-performance", requireAuth, async (req, res) => {
    try {
      const userId = req.query.user_id
        ? parseIntSafe(req.query.user_id as string, "User ID", { min: 1 })
        : undefined;
      const dateFrom = (req.query.date_from as string) || undefined;
      const dateTo = (req.query.date_to as string) || undefined;

      // Validate date format if provided
      if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
        return res
          .status(400)
          .json({ message: "تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)" });
      }
      if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        return res
          .status(400)
          .json({ message: "تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)" });
      }

      const performance = await storage.getUserPerformanceStats(
        userId,
        dateFrom,
        dateTo,
      );

      res.json({
        data: performance,
        period: {
          from: dateFrom || "آخر 7 أيام",
          to: dateTo || "اليوم",
          user_filter: userId ? `المستخدم ${userId}` : "جميع المستخدمين",
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching user performance stats:", error);
      res.status(500).json({
        message: "خطأ في جلب إحصائيات أداء المستخدمين",
      });
    }
  });

  // Get role performance statistics
  app.get("/api/production/role-performance", requireAuth, async (req, res) => {
    try {
      const dateFrom = (req.query.date_from as string) || undefined;
      const dateTo = (req.query.date_to as string) || undefined;

      // Validate date format if provided
      if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
        return res
          .status(400)
          .json({ message: "تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)" });
      }
      if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        return res
          .status(400)
          .json({ message: "تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)" });
      }

      const performance = await storage.getRolePerformanceStats(
        dateFrom,
        dateTo,
      );

      res.json({
        data: performance,
        period: {
          from: dateFrom || "آخر 7 أيام",
          to: dateTo || "اليوم",
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching role performance stats:", error);
      res.status(500).json({
        message: "خطأ في جلب إحصائيات أداء الأقسام",
      });
    }
  });

  app.get(
    "/api/production/monitoring-dashboard",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;
        const data = await storage.getMonitoringDashboard(dateFrom, dateTo);
        res.json({ success: true, data });
      } catch (error: any) {
        console.error("Error fetching monitoring dashboard:", error);
        res.status(500).json({ message: "خطأ في جلب بيانات لوحة المراقبة" });
      }
    },
  );

  // Live floor-rolls feed: all rolls still on the factory floor (not 'done'),
  // sorted by most-recent activity. Used by the Production Monitoring "live
  // tracking" tab. Behind the same permission set as the rolls/monitoring views.
  app.get(
    "/api/production/floor-rolls",
    requireAuth,
    requirePermission(
      "view_production",
      "manage_production",
      "manage_production_hall",
      "view_production_monitoring",
      "view_production_reports",
      "admin",
    ),
    async (req, res) => {
      try {
        const parsedLimit = parseInt(String(req.query.limit ?? ""), 10);
        const parsedOffset = parseInt(String(req.query.offset ?? ""), 10);
        const floorRolls = await storage.getFloorRolls({
          limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
          offset: Number.isFinite(parsedOffset) ? parsedOffset : undefined,
        });
        res.json(floorRolls);
      } catch (error) {
        console.error("[GET /api/production/floor-rolls] Error:", error);
        res.status(500).json({ message: "خطأ في جلب رولات أرض المصنع" });
      }
    },
  );

  // Get real-time production statistics
  app.get("/api/production/real-time-stats", requireAuth, async (req, res) => {
    try {
      const realTimeStats = await storage.getRealTimeProductionStats();

      res.json({
        ...realTimeStats,
        updateInterval: 30000, // 30 seconds
      });
    } catch (error: any) {
      console.error("Error fetching real-time production stats:", error);
      res.status(500).json({
        message: "خطأ في جلب الإحصائيات الفورية",
      });
    }
  });

  // Get production efficiency metrics
  app.get(
    "/api/production/efficiency-metrics",
    requireAuth,
    async (req, res) => {
      try {
        const dateFrom = (req.query.date_from as string) || undefined;
        const dateTo = (req.query.date_to as string) || undefined;

        // Validate date format if provided
        if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
          return res
            .status(400)
            .json({ message: "تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)" });
        }
        if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
          return res
            .status(400)
            .json({ message: "تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)" });
        }

        const metrics = await storage.getProductionEfficiencyMetrics(
          dateFrom,
          dateTo,
        );

        res.json({
          ...metrics,
          period: {
            from: dateFrom || "آخر 30 يوم",
            to: dateTo || "اليوم",
          },
          lastUpdated: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error("Error fetching production efficiency metrics:", error);
        res.status(500).json({
          message: "خطأ في جلب مؤشرات الكفاءة",
        });
      }
    },
  );

  // Get production alerts
  app.get("/api/production/alerts", requireAuth, async (req, res) => {
    try {
      const alerts = await storage.getProductionAlerts();

      res.json({
        alerts,
        alertCount: alerts.length,
        criticalCount: alerts.filter((a: any) => a.priority === "critical")
          .length,
        warningCount: alerts.filter(
          (a: any) => a.priority === "high" || a.priority === "medium",
        ).length,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching production alerts:", error);
      res.status(500).json({
        message: "خطأ في جلب تنبيهات الإنتاج",
      });
    }
  });

  // Get machine utilization statistics
  app.get(
    "/api/production/machine-utilization",
    requireAuth,
    async (req, res) => {
      try {
        const dateFrom = (req.query.date_from as string) || undefined;
        const dateTo = (req.query.date_to as string) || undefined;

        // Validate date format if provided
        if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
          return res
            .status(400)
            .json({ message: "تنسيق تاريخ البداية غير صحيح (YYYY-MM-DD)" });
        }
        if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
          return res
            .status(400)
            .json({ message: "تنسيق تاريخ النهاية غير صحيح (YYYY-MM-DD)" });
        }

        const utilizationStats = await storage.getMachineUtilizationStats(
          dateFrom,
          dateTo,
        );

        res.json({
          data: utilizationStats,
          period: {
            from: dateFrom || "آخر 7 أيام",
            to: dateTo || "اليوم",
          },
          totalMachines: utilizationStats.length,
          activeMachines: utilizationStats.filter(
            (m: any) => m.status === "active",
          ).length,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error("Error fetching machine utilization stats:", error);
        res.status(500).json({
          message: "خطأ في جلب إحصائيات استخدام المكائن",
        });
      }
    },
  );

  // ============ لوحة مراقبة الإنتاج - APIs جديدة ============

  // Get production statistics by section
  app.get(
    "/api/production/stats-by-section/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get production statistics for the section
        const stats = await storage.getProductionStatsBySection(
          section,
          dateFrom,
          dateTo,
        );

        res.json(stats);
      } catch (error: any) {
        console.error("Error fetching section stats:", error);
        res.status(500).json({ message: "خطأ في جلب إحصائيات القسم" });
      }
    },
  );

  // Get users performance by section (production users only)
  app.get(
    "/api/production/users-performance/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get users performance for the section
        const users = await storage.getUsersPerformanceBySection(
          section,
          dateFrom,
          dateTo,
        );

        res.json({ data: users });
      } catch (error: any) {
        console.error("Error fetching users performance:", error);
        res.status(500).json({ message: "خطأ في جلب أداء المستخدمين" });
      }
    },
  );

  // Get machines production by section
  app.get(
    "/api/production/machines-production/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get machines production for the section
        const machines = await storage.getMachinesProductionBySection(
          section,
          dateFrom,
          dateTo,
        );

        res.json({ data: machines });
      } catch (error: any) {
        console.error("Error fetching machines production:", error);
        res.status(500).json({ message: "خطأ في جلب إنتاج المكائن" });
      }
    },
  );

  // Get machine detail across all stages
  app.get(
    "/api/production/machine-detail/:machineId",
    requireAuth,
    async (req, res) => {
      try {
        const machineId = parseInt(req.params.machineId);
        if (isNaN(machineId)) {
          return res.status(400).json({ message: "معرف الماكينة غير صحيح" });
        }
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;
        const detail = await storage.getMachineDetailAllStages(
          machineId,
          dateFrom,
          dateTo,
        );
        if (!detail) {
          return res.status(404).json({ message: "الماكينة غير موجودة" });
        }
        res.json({ data: detail });
      } catch (error: any) {
        console.error("Error fetching machine detail:", error);
        res.status(500).json({ message: "خطأ في جلب تفاصيل الماكينة" });
      }
    },
  );

  // Get rolls tracking by section
  app.get(
    "/api/production/rolls-tracking/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const search = req.query.search as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get rolls for the section
        const rolls = await storage.getRollsBySection(section, search);

        res.json({ data: rolls });
      } catch (error: any) {
        console.error("Error fetching rolls:", error);
        res.status(500).json({ message: "خطأ في جلب الرولات" });
      }
    },
  );

  // Get production orders tracking by section
  app.get(
    "/api/production/orders-tracking/:section",
    requireAuth,
    async (req, res) => {
      try {
        const { section } = req.params;
        const search = req.query.search as string;

        // Validate section
        if (!["film", "printing", "cutting"].includes(section)) {
          return res.status(400).json({ message: "قسم غير صحيح" });
        }

        // Get production orders for the section
        const orders = await storage.getProductionOrdersBySection(
          section,
          search,
        );

        res.json({ data: orders });
      } catch (error: any) {
        console.error("Error fetching production orders:", error);
        res.status(500).json({ message: "خطأ في جلب أوامر الإنتاج" });
      }
    },
  );
}
