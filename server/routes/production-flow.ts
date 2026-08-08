import type { Express } from "express";


import { storage } from "../storage";

import { insertRollSchema, insertCutSchema, insertProductionSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { parseIntSafe, parseFloatSafe } from "@shared/validation-utils";
import { getDataValidator } from "../services/data-validator";
import { validateRequest } from "../middleware/validation";

import { requireAuth, requirePermission, type AuthRequest } from "../middleware/auth";
import { getAuthUserId, parseRouteParam, checkOrderNotPaused } from "./shared";

// Extracted from server/routes/production.ts (registration order preserved;
// called from registerProductionRoutes). See server/routes/README.md.
export async function registerProductionFlowRoutes(app: Express, ctx: any) {

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

}
