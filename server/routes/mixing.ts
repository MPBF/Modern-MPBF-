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
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerMixingRoutes(app: Express, ctx: any) {


  // ===== Master Batch Colors Routes =====
  app.get("/api/master-batch-colors", requireAuth, async (req, res) => {
    try {
      const colors = await storage.getMasterBatchColors();
      res.json(colors);
    } catch (error) {
      console.error("Error fetching master batch colors:", error);
      res.status(500).json({ message: "خطأ في جلب ألوان الماستر باتش" });
    }
  });

  app.get("/api/master-batch-colors/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id?.trim();
      if (!id) {
        return res.status(400).json({ message: "معرف اللون مطلوب" });
      }
      const color = await storage.getMasterBatchColorById(id);
      if (!color) {
        return res.status(404).json({ message: "اللون غير موجود" });
      }
      res.json(color);
    } catch (error) {
      console.error("Error fetching master batch color:", error);
      res.status(500).json({ message: "خطأ في جلب لون الماستر باتش" });
    }
  });

  app.post(
    "/api/master-batch-colors",
    requireAuth,
    requirePermission("add_master_batch", "manage_master_batch", "manage_definitions"),
    async (req, res) => {
      try {
        const parseResult = insertMasterBatchColorSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const color = await storage.createMasterBatchColor(parseResult.data);
        res.status(201).json(color);
      } catch (error) {
        console.error("Error creating master batch color:", error);
        res.status(500).json({
          message: "خطأ في إنشاء لون الماستر باتش",
        });
      }
    },
  );

  app.put(
    "/api/master-batch-colors/:id",
    requireAuth,
    requirePermission("edit_master_batch", "manage_master_batch", "manage_definitions"),
    async (req, res) => {
      try {
        const id = req.params.id?.trim();
        if (!id) {
          return res.status(400).json({ message: "معرف اللون مطلوب" });
        }
        const parseResult = insertMasterBatchColorSchema
          .partial()
          .safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const color = await storage.updateMasterBatchColor(
          id,
          parseResult.data,
        );
        res.json(color);
      } catch (error) {
        console.error("Error updating master batch color:", error);
        res.status(500).json({
          message: "خطأ في تحديث لون الماستر باتش",
        });
      }
    },
  );

  app.delete(
    "/api/master-batch-colors/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const id = req.params.id?.trim();
        if (!id) {
          return res.status(400).json({ message: "معرف اللون مطلوب" });
        }
        await storage.deleteMasterBatchColor(id);
        res.json({ message: "تم حذف اللون بنجاح" });
      } catch (error) {
        console.error("Error deleting master batch color:", error);
        res.status(500).json({
          message: "خطأ في حذف لون الماستر باتش",
        });
      }
    },
  );

  // Mixing Recipes routes
  app.get("/api/mixing-recipes", requireAuth, async (req, res) => {
    try {
      const mixingRecipes = await storage.getMixingRecipes();
      res.json(mixingRecipes);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب وصفات الخلط" });
    }
  });

  app.post(
    "/api/mixing-recipes",
    requireAuth,
    requirePermission("add_production", "manage_mixing", "manage_production"),
    async (req, res) => {
      try {
        const parsed = insertMixingRecipeSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات الوصفة غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const authUserId = getAuthUserId(req);
        const payload: Record<string, any> = { ...parsed.data };
        if (authUserId) payload.created_by = authUserId;
        const mixingRecipe = await storage.createMixingRecipe(payload);
        res.status(201).json(mixingRecipe);
      } catch (error) {
        console.error("Error creating mixing recipe:", error);
        res.status(500).json({ message: "خطأ في إنشاء الوصفة" });
      }
    },
  );

  // ============ Mixing Batches Routes ============

  // Get all mixing batches
  app.get("/api/mixing-batches", requireAuth, async (req, res) => {
    try {
      const batches = await storage.getAllMixingBatches();
      res.json({ data: batches });
    } catch (error: any) {
      console.error("Error getting mixing batches:", error);
      res.status(500).json({ message: "خطأ في جلب عمليات الخلط" });
    }
  });

  // Get mixing batch by ID
  app.get("/api/mixing-batches/:id", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");
      const batch = await storage.getMixingBatchById(id);

      if (!batch) {
        return res.status(404).json({ message: "عملية الخلط غير موجودة" });
      }

      res.json(batch);
    } catch (error: any) {
      console.error("Error getting mixing batch:", error);
      res.status(500).json({ message: "خطأ في جلب عملية الخلط" });
    }
  });

  // Get mixing batches by operator
  app.get(
    "/api/mixing-batches/operator/:operatorId",
    requireAuth,
    async (req, res) => {
      try {
        const operatorId = parseInt(req.params.operatorId);
        if (isNaN(operatorId) || operatorId <= 0) {
          return res.status(400).json({ message: "معرف العامل غير صحيح" });
        }
        const batches = await storage.getMixingBatchesByOperator(operatorId);
        res.json({ data: batches });
      } catch (error: any) {
        console.error("Error getting operator batches:", error);
        res.status(500).json({ message: "خطأ في جلب عمليات الخلط للعامل" });
      }
    },
  );

  // Get mixing batches by production order
  app.get(
    "/api/mixing-batches/production-order/:productionOrderId",
    requireAuth,
    async (req, res) => {
      try {
        const productionOrderId = parseInt(req.params.productionOrderId);
        if (isNaN(productionOrderId) || productionOrderId <= 0) {
          return res.status(400).json({ message: "معرف أمر الإنتاج غير صحيح" });
        }
        const batches =
          await storage.getMixingBatchesByProductionOrder(productionOrderId);
        let totalMixedA = 0;
        let totalMixedB = 0;
        for (const batch of batches) {
          const weight = parseFloat(batch.total_weight_kg as string) || 0;
          if (batch.screw_assignment === "A") {
            totalMixedA += weight;
          } else if (batch.screw_assignment === "B") {
            totalMixedB += weight;
          }
        }
        res.json({
          data: batches,
          summary: {
            totalMixedA,
            totalMixedB,
            totalMixed: totalMixedA + totalMixedB,
          },
        });
      } catch (error: any) {
        console.error("Error getting production order batches:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب عمليات الخلط لأمر الإنتاج" });
      }
    },
  );

  // Create mixing batch
  app.post(
    "/api/mixing-batches",
    requireAuth,
    requirePermission("add_production", "manage_mixing", "manage_production"),
    async (req, res) => {
      try {
        const { batch, ingredients } = req.body;

        if (
          !batch ||
          !ingredients ||
          !Array.isArray(ingredients) ||
          ingredients.length === 0
        ) {
          return res
            .status(400)
            .json({ message: "بيانات عملية الخلط أو المكونات ناقصة" });
        }

        // Validate screw_assignment
        if (
          !batch.screw_assignment ||
          !["A", "B"].includes(batch.screw_assignment)
        ) {
          return res
            .status(400)
            .json({ message: "يجب تحديد البريمة (A أو B)" });
        }

        // Validate machine_id is provided
        if (!batch.machine_id) {
          return res.status(400).json({ message: "يجب تحديد الماكينة" });
        }

        if (batch.production_order_id) {
          const poId = parseInt(batch.production_order_id);
          if (!isNaN(poId) && poId > 0) {
            const po = await storage.getProductionOrderById(poId);
            if (po) {
              const orderQty = parseFloat(
                (po as any).final_quantity_kg || (po as any).quantity_kg || "0",
              );
              const existingBatches =
                await storage.getMixingBatchesByProductionOrder(poId);
              let existingTotal = 0;
              for (const b of existingBatches) {
                existingTotal += parseFloat(b.total_weight_kg as string) || 0;
              }
              const newWeight = parseFloat(batch.total_weight_kg || "0");
              if (existingTotal + newWeight > orderQty) {
                return res.status(400).json({
                  message: `مجموع كميات الخلط (${(existingTotal + newWeight).toFixed(2)} كغ) يتجاوز الكمية المطلوبة في أمر الإنتاج (${orderQty.toFixed(2)} كغ). المتبقي: ${(orderQty - existingTotal).toFixed(2)} كغ`,
                });
              }
            }
          }
        }

        const {
          batch_number,
          formula_id,
          roll_id,
          started_at,
          ...cleanBatchData
        } = batch;

        const allBatches = await storage.getAllMixingBatches();
        let maxNum = 0;
        for (const b of allBatches) {
          const match = (b.batch_number || "").match(/MIX-(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
          }
        }
        const generatedBatchNumber = `MIX-${String(maxNum + 1).padStart(5, "0")}`;

        const batchData = {
          ...cleanBatchData,
          batch_number: generatedBatchNumber,
          operator_id: req.user!.id,
          status: "completed",
        };

        const newBatch = await storage.createMixingBatch(
          batchData,
          ingredients,
        );
        res.status(201).json(newBatch);
      } catch (error: any) {
        console.error("Error creating mixing batch:", error);
        res.status(500).json({ message: "خطأ في إنشاء عملية الخلط" });
      }
    },
  );

  // Update mixing batch (supports either metadata-only or full batch+ingredients edit)
  app.put(
    "/api/mixing-batches/:id",
    requireAuth,
    requirePermission("edit_production", "manage_mixing", "manage_production"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const { batch, ingredients, ...rest } = req.body || {};

        // Full edit (batch + ingredients)
        if (batch && Array.isArray(ingredients)) {
          // Existence check
          const existing = await storage.getMixingBatchById(id);
          if (!existing) {
            return res.status(404).json({ message: "دفعة الخلط غير موجودة" });
          }

          if (ingredients.length === 0) {
            return res
              .status(400)
              .json({ message: "بيانات عملية الخلط أو المكونات ناقصة" });
          }

          // Validate ingredients
          for (const ing of ingredients) {
            if (!ing || typeof ing !== "object") {
              return res
                .status(400)
                .json({ message: "بيانات المكونات غير صحيحة" });
            }
            if (!ing.item_id || typeof ing.item_id !== "string") {
              return res
                .status(400)
                .json({ message: "يجب تحديد المادة لكل مكوّن" });
            }
            const w = parseFloat(ing.actual_weight_kg);
            if (!isFinite(w) || w <= 0) {
              return res
                .status(400)
                .json({ message: "وزن المكوّن يجب أن يكون رقمًا موجبًا" });
            }
            if (ing.percentage !== undefined && ing.percentage !== null) {
              const p = parseFloat(ing.percentage);
              if (!isFinite(p) || p <= 0 || p > 100) {
                return res
                  .status(400)
                  .json({ message: "نسبة المكوّن غير صحيحة" });
              }
            }
          }

          if (
            batch.screw_assignment &&
            !["A", "B"].includes(batch.screw_assignment)
          ) {
            return res
              .status(400)
              .json({ message: "يجب تحديد البريمة (A أو B)" });
          }

          if (!batch.machine_id || typeof batch.machine_id !== "string") {
            return res.status(400).json({ message: "يجب تحديد الماكينة" });
          }

          const totalW = parseFloat(batch.total_weight_kg);
          if (!isFinite(totalW) || totalW <= 0) {
            return res
              .status(400)
              .json({ message: "الوزن الكلي يجب أن يكون رقمًا موجبًا" });
          }

          // Validate over-limit excluding this batch
          if (batch.production_order_id) {
            const poId = parseInt(batch.production_order_id);
            if (!isNaN(poId) && poId > 0) {
              const po = await storage.getProductionOrderById(poId);
              if (po) {
                const orderQty = parseFloat(
                  (po as any).final_quantity_kg ||
                    (po as any).quantity_kg ||
                    "0",
                );
                const existingBatches =
                  await storage.getMixingBatchesByProductionOrder(poId);
                let existingTotal = 0;
                for (const b of existingBatches) {
                  if (b.id === id) continue;
                  existingTotal += parseFloat(b.total_weight_kg as string) || 0;
                }
                const newWeight = parseFloat(batch.total_weight_kg || "0");
                if (existingTotal + newWeight > orderQty) {
                  return res.status(400).json({
                    message: `مجموع كميات الخلط (${(existingTotal + newWeight).toFixed(2)} كغ) يتجاوز الكمية المطلوبة في أمر الإنتاج (${orderQty.toFixed(2)} كغ). المتبقي: ${(orderQty - existingTotal).toFixed(2)} كغ`,
                  });
                }
              }
            }
          }

          // Strip immutable / auto-managed fields
          const {
            id: _ignoredId,
            batch_number,
            operator_id,
            created_at,
            ...cleanBatchData
          } = batch;

          const updatedBatch = await storage.updateMixingBatchWithIngredients(
            id,
            cleanBatchData,
            ingredients,
          );
          return res.json(updatedBatch);
        }

        // Backwards-compatible metadata-only update
        const updates = Object.keys(rest).length > 0 ? rest : req.body;
        const updatedBatch = await storage.updateMixingBatch(id, updates);
        res.json(updatedBatch);
      } catch (error: any) {
        console.error("Error updating mixing batch:", error);
        res.status(500).json({ message: "خطأ في تحديث عملية الخلط" });
      }
    },
  );

  // Delete mixing batch (cascades to ingredients)
  app.delete(
    "/api/mixing-batches/:id",
    requireAuth,
    requirePermission("delete_production", "manage_mixing", "manage_production"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const existing = await storage.getMixingBatchById(id);
        if (!existing) {
          return res.status(404).json({ message: "دفعة الخلط غير موجودة" });
        }
        await storage.deleteMixingBatch(id);
        res.json({ success: true });
      } catch (error: any) {
        console.error("Error deleting mixing batch:", error);
        res.status(500).json({ message: "خطأ في حذف عملية الخلط" });
      }
    },
  );

  // Update batch ingredient actuals
  app.put(
    "/api/mixing-batches/:id/ingredients",
    requireAuth,
    requirePermission("edit_production", "manage_mixing", "manage_production"),
    async (req, res) => {
      try {
        const batchId = parseRouteParam(req.params.id, "id");
        const { ingredientUpdates } = req.body;

        if (!ingredientUpdates || !Array.isArray(ingredientUpdates)) {
          return res.status(400).json({ message: "بيانات المكونات ناقصة" });
        }

        await storage.updateBatchIngredientActuals(batchId, ingredientUpdates);
        const updatedBatch = await storage.getMixingBatchById(batchId);
        res.json(updatedBatch);
      } catch (error: any) {
        console.error("Error updating batch ingredients:", error);
        res.status(500).json({ message: "خطأ في تحديث الكميات الفعلية" });
      }
    },
  );

  // Complete mixing batch
  app.post(
    "/api/mixing-batches/:id/complete",
    requireAuth,
    requirePermission("edit_production", "manage_mixing", "manage_production"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const completedBatch = await storage.completeMixingBatch(id);
        res.json(completedBatch);
      } catch (error: any) {
        console.error("Error completing mixing batch:", error);
        res.status(500).json({ message: "خطأ في إتمام عملية الخلط" });
      }
    },
  );

  // ==================== Experimental Blends ====================

  app.get("/api/experimental-blends", requireAuth, async (_req, res) => {
    try {
      const blends = await storage.getExperimentalBlends();
      const result = await Promise.all(
        blends.map(async (b) => {
          const items = await storage.getExperimentalBlendItems(b.id);
          return { ...b, items };
        }),
      );
      res.json(result);
    } catch (error) {
      console.error("Error fetching experimental blends:", error);
      res.status(500).json({ message: "خطأ في جلب الخلطات التجريبية" });
    }
  });

  app.get("/api/experimental-blends/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "معرف غير صالح" });
      const blend = await storage.getExperimentalBlendById(id);
      if (!blend) return res.status(404).json({ message: "الخلطة غير موجودة" });
      const items = await storage.getExperimentalBlendItems(id);
      res.json({ ...blend, items });
    } catch (error) {
      console.error("Error fetching experimental blend:", error);
      res.status(500).json({ message: "خطأ في جلب الخلطة" });
    }
  });

  app.post("/api/experimental-blends", requireAuth, async (req, res) => {
    try {
      const { items, ...blendData } = req.body;
      if (!blendData.blend_number || !blendData.machine_id) {
        return res
          .status(400)
          .json({ message: "بيانات ناقصة: رقم الخلطة والماكينة مطلوبان" });
      }
      const blend = await storage.createExperimentalBlend(blendData);
      let createdItems: any[] = [];
      if (items && items.length > 0) {
        const itemsWithBlendId = items.map((item: any) => ({
          ...item,
          blend_id: blend.id,
        }));
        createdItems =
          await storage.createExperimentalBlendItems(itemsWithBlendId);
      }
      res.json({ ...blend, items: createdItems });
    } catch (error) {
      console.error("Error creating experimental blend:", error);
      res.status(500).json({ message: "خطأ في إنشاء الخلطة التجريبية" });
    }
  });

  app.put("/api/experimental-blends/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "معرف غير صالح" });
      const existing = await storage.getExperimentalBlendById(id);
      if (!existing)
        return res.status(404).json({ message: "الخلطة غير موجودة" });
      const { items, ...blendData } = req.body;
      const itemsWithBlendId = items
        ? items.map((item: any) => ({ ...item, blend_id: id }))
        : undefined;
      const updated = await storage.updateExperimentalBlend(
        id,
        blendData,
        itemsWithBlendId,
      );
      const updatedItems = await storage.getExperimentalBlendItems(id);
      res.json({ ...updated, items: updatedItems });
    } catch (error) {
      console.error("Error updating experimental blend:", error);
      res.status(500).json({ message: "خطأ في تحديث الخلطة التجريبية" });
    }
  });

  app.delete("/api/experimental-blends/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "معرف غير صالح" });
      await storage.deleteExperimentalBlend(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting experimental blend:", error);
      res.status(500).json({ message: "خطأ في حذف الخلطة" });
    }
  });

  // ==================== Bag Weight Records (Tools page) ====================

  app.get("/api/bag-weight-records", requireAuth, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const records = await storage.getBagWeightRecordsByUser(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching bag weight records:", error);
      res.status(500).json({ message: "خطأ في جلب سجلات حاسبة وزن الكيس" });
    }
  });

  app.post("/api/bag-weight-records", requireAuth, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const parsed = insertBagWeightRecordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "بيانات غير صالحة", errors: parsed.error.errors });
      }
      const created = await storage.createBagWeightRecord(userId, parsed.data);
      res.json(created);
    } catch (error) {
      console.error("Error creating bag weight record:", error);
      res.status(500).json({ message: "خطأ في حفظ سجل حاسبة وزن الكيس" });
    }
  });

  app.delete(
    "/api/bag-weight-records/:id",
    requireAuth,
    async (req: any, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const id = parseInt(req.params.id);
        if (isNaN(id))
          return res.status(400).json({ message: "معرف غير صالح" });
        const deleted = await storage.deleteBagWeightRecord(id, userId);
        if (!deleted)
          return res.status(404).json({ message: "السجل غير موجود" });
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting bag weight record:", error);
        res.status(500).json({ message: "خطأ في حذف السجل" });
      }
    },
  );

  app.delete("/api/bag-weight-records", requireAuth, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      await storage.clearBagWeightRecords(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing bag weight records:", error);
      res.status(500).json({ message: "خطأ في مسح السجلات" });
    }
  });
}
