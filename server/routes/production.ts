import type { Express } from "express";


import { storage } from "../storage";
import { db } from "../db";

import { insertProductionOrderSchema } from "@shared/schema";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { parseIntSafe, parseFloatSafe } from "@shared/validation-utils";
import QRCode from "qrcode";
import { calculateProductionQuantities } from "@shared/quantity-utils";

import { requireAuth, requirePermission, type AuthRequest } from "../middleware/auth";
import { getAuthUserId, parseRouteParam } from "./shared";
import { registerProductionOperatorRoutes } from "./production-operators";
import { registerProductionFlowRoutes } from "./production-flow";
import { registerProductionMonitoringRoutes } from "./production-monitoring";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain, delegated to production-* submodules). See server/routes/README.md.
export async function registerProductionRoutes(app: Express, ctx: any) {


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
        const { customer_product_id, quantity_kg } = req.body;

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
          const { customer_product_id, quantity_kg } = order;

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


  await registerProductionOperatorRoutes(app, ctx);
  await registerProductionFlowRoutes(app, ctx);
  await registerProductionMonitoringRoutes(app, ctx);
}
