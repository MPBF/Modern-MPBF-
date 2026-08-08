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

// Extracted from server/routes/production.ts (registration order preserved;
// called from registerProductionRoutes). See server/routes/README.md.
export async function registerProductionOperatorRoutes(app: Express, ctx: any) {
  const {
    resolveInlinePrintedFields,
    sanitizeRollCreateInput,
    VALID_QUEUE_STAGES,
    dataValidator,
  } = ctx;

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

}
