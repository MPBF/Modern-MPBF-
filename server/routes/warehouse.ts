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
  addJsonSheet,
  parseExcelBuffer,
  upload,
  getAuthUserId,
  parseRouteParam,
  insertLocationSchema,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerWarehouseRoutes(app: Express, ctx: any) {


  // Material Groups routes (Categories)
  app.get("/api/material-groups", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching material groups:", error);
      res.status(500).json({ message: "خطأ في جلب مجموعات المواد" });
    }
  });

  // Items routes
  app.get("/api/items", requireAuth, async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "خطأ في جلب الأصناف" });
    }
  });

  // ===== Packaging Units (per item) =====
  // Lookup is open to anyone authenticated (warehouse receipt needs it).
  // Mutations require manage_items / manage_definitions.
  app.get(
    "/api/items/:itemId/packaging-units",
    requireAuth,
    async (req, res) => {
      try {
        const itemId = String(req.params.itemId);
        const units = await storage.getPackagingUnitsByItem(itemId);
        res.json(units);
      } catch (error) {
        console.error("Error fetching packaging units:", error);
        res.status(500).json({ message: "خطأ في جلب وحدات التعبئة" });
      }
    },
  );

  app.post(
    "/api/items/:itemId/packaging-units",
    requireAuth,
    requirePermission("add_items", "manage_items", "manage_definitions"),
    async (req, res) => {
      try {
        const itemId = String(req.params.itemId);
        const parsed = insertPackagingUnitSchema.parse({
          ...req.body,
          item_id: itemId,
        });
        const unit = await storage.createPackagingUnit({ ...parsed, item_id: itemId });
        res.status(201).json(unit);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res.status(400).json({
            message: error.issues?.[0]?.message || "بيانات غير صحيحة",
            errors: error.issues,
          });
        }
        console.error("Error creating packaging unit:", error);
        res.status(500).json({
          message: error?.message || "خطأ في إنشاء وحدة التعبئة",
        });
      }
    },
  );

  app.patch(
    "/api/packaging-units/:id",
    requireAuth,
    requirePermission("edit_items", "manage_items", "manage_definitions"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const unit = await storage.updatePackagingUnit(id, req.body);
        res.json(unit);
      } catch (error: any) {
        console.error("Error updating packaging unit:", error);
        res.status(400).json({
          message: error?.message || "خطأ في تحديث وحدة التعبئة",
        });
      }
    },
  );

  app.delete(
    "/api/packaging-units/:id",
    requireAuth,
    requirePermission("delete_items", "manage_items", "manage_definitions"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deletePackagingUnit(id);
        res.json({ message: "تم حذف وحدة التعبئة" });
      } catch (error: any) {
        console.error("Error deleting packaging unit:", error);
        res.status(400).json({
          message: error?.message || "خطأ في حذف وحدة التعبئة",
        });
      }
    },
  );

  // Locations routes
  app.get("/api/locations", requireAuth, async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب المواقع" });
    }
  });

  app.post("/api/locations", requireAuth, async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocationExtended(validatedData);
      res.json(location);
    } catch (error) {
      console.error("Location creation error:", error);
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.put("/api/locations/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const validatedData = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocationExtended(id, validatedData);
      res.json(location);
    } catch (error) {
      console.error("Location update error:", error);
      res.status(400).json({ message: "فشل في تحديث الموقع" });
    }
  });

  // Inventory movements routes
  app.get("/api/inventory-movements", requireAuth, async (req, res) => {
    try {
      const movements = await storage.getInventoryMovements();
      res.json(movements);
    } catch (error) {
      console.error("Error fetching inventory movements:", error);
      res.status(500).json({ message: "خطأ في جلب حركات المخزون" });
    }
  });

  app.post(
    "/api/inventory-movements",
    requireAuth,
    requirePermission("add_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const validatedData = insertInventoryMovementSchema.parse(req.body);
        const movement = await storage.createInventoryMovement(validatedData);
        res.json(movement);
      } catch (error) {
        console.error("Inventory movement creation error:", error);
        res.status(400).json({ message: "بيانات غير صحيحة" });
      }
    },
  );

  app.delete(
    "/api/inventory-movements/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        // Enhanced parameter validation
        if (!req.params?.id) {
          return res.status(400).json({ message: "معرف الحركة مطلوب" });
        }

        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ message: "معرف الحركة غير صحيح" });
        }

        await storage.deleteInventoryMovement(id);
        res.json({ message: "تم حذف الحركة بنجاح" });
      } catch (error) {
        console.error("Inventory movement deletion error:", error);
        res.status(500).json({ message: "خطأ في حذف الحركة" });
      }
    },
  );

  // Categories routes (for material groups)
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب الفئات" });
    }
  });

  app.post(
    "/api/categories",
    requireAuth,
    requirePermission("add_categories", "manage_categories", "manage_definitions"),
    async (req, res) => {
      try {
        // Generate sequential ID if not provided with enhanced null safety
        let categoryId = req.body?.id;
        if (!categoryId) {
          const existingCategories = (await storage.getCategories()) || [];
          const categoryNumbers = existingCategories
            .map((cat) => cat?.id)
            .filter(
              (id) =>
                id &&
                typeof id === "string" &&
                id.startsWith("CAT") &&
                id.length <= 6,
            ) // Standard format only
            .map((id) => {
              const num = id.replace("CAT", "");
              const parsed = parseInt(num);
              return isNaN(parsed) ? 0 : parsed;
            })
            .filter((num) => num > 0)
            .sort((a, b) => b - a);

          const nextNumber =
            categoryNumbers.length > 0 ? categoryNumbers[0] + 1 : 1;
          categoryId =
            nextNumber < 10 ? `CAT0${nextNumber}` : `CAT${nextNumber}`;
        }

        // Enhanced null safety for request body processing
        const processedData = {
          ...req.body,
          id: categoryId,
          parent_id:
            !req.body?.parent_id ||
            req.body.parent_id === "none" ||
            req.body.parent_id === ""
              ? null
              : req.body.parent_id,
          code: !req.body?.code || req.body.code === "" ? null : req.body.code,
        };

        const category = await storage.createCategory(processedData);
        res.json(category);
      } catch (error) {
        console.error("Category creation error:", error);
        res.status(500).json({
          message: "خطأ في إنشاء الفئة",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.put(
    "/api/categories/:id",
    requireAuth,
    requirePermission("edit_categories", "manage_categories", "manage_definitions"),
    async (req, res) => {
      try {
        const id = req.params.id;

        const processedData = {
          ...req.body,
          parent_id:
            req.body.parent_id === "none" || req.body.parent_id === ""
              ? null
              : req.body.parent_id,
          code: req.body.code === "" || !req.body.code ? null : req.body.code,
        };

        const category = await storage.updateCategory(id, processedData);
        res.json(category);
      } catch (error) {
        console.error("Category update error:", error);
        res.status(500).json({
          message: "خطأ في تحديث الفئة",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.delete(
    "/api/categories/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        await storage.deleteCategory(id);
        res.json({ message: "تم حذف الفئة بنجاح" });
      } catch (error) {
        console.error("Category deletion error:", error);
        res.status(500).json({
          message: "خطأ في حذف الفئة",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.get("/api/warehouse-items", requireAuth, async (req, res) => {
    try {
      const inventoryData = await db
        .select({
          id: inventory.id,
          item_id: inventory.item_id,
          name: items.name,
          name_ar: items.name_ar,
          quantity: inventory.current_stock,
          unit: inventory.unit,
          min_quantity: inventory.min_stock,
          category: items.category_id,
        })
        .from(inventory)
        .leftJoin(items, eq(inventory.item_id, items.id));
      res.json(inventoryData);
    } catch (error) {
      console.error("[API Error] warehouse-items:", error);
      res.json([]);
    }
  });

  // Warehouse Transactions routes
  app.get("/api/warehouse-transactions", requireAuth, async (req, res) => {
    try {
      const warehouseTransactions = await storage.getWarehouseTransactions();
      res.json(warehouseTransactions);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب حركات المستودع" });
    }
  });

  app.post(
    "/api/warehouse-transactions",
    requireAuth,
    requirePermission("add_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        if (!req.body || typeof req.body !== "object") {
          return res.status(400).json({ message: "بيانات الحركة مطلوبة" });
        }
        if (!req.body.item_id || !req.body.transaction_type) {
          return res
            .status(400)
            .json({ message: "معرف الصنف ونوع الحركة مطلوبان" });
        }
        const warehouseTransaction = await storage.createWarehouseTransaction(
          req.body,
        );
        res.json(warehouseTransaction);
      } catch (error) {
        res.status(400).json({ message: "بيانات غير صحيحة" });
      }
    },
  );

  // Material Groups routes

  // Items routes
  app.post(
    "/api/items",
    requireAuth,
    requirePermission("add_items", "manage_items", "manage_definitions"),
    async (req, res) => {
      try {
        // Generate sequential ID if not provided with enhanced null safety
        let itemId = req.body?.id;
        if (!itemId) {
          // Get the latest item to determine the next sequential number
          const existingItems = (await storage.getItems()) || [];
          const itemNumbers = existingItems
            .map((item) => item?.id)
            .filter(
              (id) => id && typeof id === "string" && id.startsWith("ITEM"),
            )
            .map((id) => {
              const num = id.replace("ITEM", "");
              const parsed = parseInt(num);
              return isNaN(parsed) ? 0 : parsed;
            })
            .filter((num) => num > 0)
            .sort((a, b) => b - a);

          const nextNumber = itemNumbers.length > 0 ? itemNumbers[0] + 1 : 1;
          itemId = `ITEM${nextNumber.toString().padStart(3, "0")}`;
        }

        // Convert empty strings to null for optional fields with enhanced null safety
        const processedData = {
          ...req.body,
          id: itemId,
          category_id:
            !req.body?.category_id ||
            req.body.category_id === "" ||
            req.body.category_id === "none"
              ? null
              : req.body.category_id,
          code: !req.body?.code || req.body.code === "" ? null : req.body.code,
        };

        const item = await storage.createItem(processedData);
        res.json(item);
      } catch (error) {
        console.error("Item creation error:", error);
        console.error(
          "Error stack:",
          error instanceof Error ? error.stack : "No stack trace",
        );
        res.status(500).json({
          message: "خطأ في إنشاء الصنف",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.put(
    "/api/items/:id",
    requireAuth,
    requirePermission("edit_items", "manage_items", "manage_definitions"),
    async (req, res) => {
      try {
        // Enhanced parameter validation
        if (!req.params?.id?.trim()) {
          return res.status(400).json({ message: "معرف الصنف مطلوب" });
        }

        if (!req.body || typeof req.body !== "object") {
          return res.status(400).json({ message: "بيانات التحديث مطلوبة" });
        }

        const id = req.params.id.trim();

        // Convert empty strings to null for optional fields with enhanced null safety
        const processedData = {
          ...req.body,
          category_id:
            !req.body?.category_id ||
            req.body.category_id === "" ||
            req.body.category_id === "none"
              ? null
              : req.body.category_id,
          code: !req.body?.code || req.body.code === "" ? null : req.body.code,
        };

        const item = await storage.updateItem(id, processedData);
        if (!item) {
          return res.status(404).json({ message: "الصنف غير موجود" });
        }
        res.json(item);
      } catch (error) {
        console.error("Item update error:", error);
        res.status(500).json({
          message: "خطأ في تحديث الصنف",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.delete(
    "/api/items/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        await storage.deleteItem(req.params.id);
        res.json({ message: "تم حذف الصنف بنجاح" });
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في حذف الصنف" });
      }
    },
  );

  app.delete(
    "/api/locations/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse", "manage_definitions"),
    async (req, res) => {
      try {
        const id = req.params.id;
        await storage.deleteLocation(id);
        res.json({ message: "تم حذف الموقع بنجاح" });
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في حذف الموقع" });
      }
    },
  );

  // Inventory Management routes
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const inventory = await storage.getInventoryItems();
      res.json(inventory);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المخزون" });
    }
  });

  app.get("/api/inventory/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getInventoryStats();
      res.json(stats);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات المخزون" });
    }
  });

  app.post(
    "/api/inventory",
    requireAuth,
    requirePermission("add_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        // STEP 1: Zod schema validation
        const validatedData = insertInventorySchema.parse(req.body);

        // STEP 2: DataValidator integration for business rules
        const validationResult = await getDataValidator(storage).validateData(
          "inventory",
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

        // STEP 3: Create inventory item with validated data
        const item = await storage.createInventoryItem(validatedData);

        res.status(201).json({
          data: item,
          message: "تم إضافة صنف المخزون بنجاح",
          success: true,
        });
      } catch (error: any) {
        console.error("Inventory creation error:", error);

        res.status(500).json({
          message: "خطأ في إضافة صنف للمخزون",
          success: false,
        });
      }
    },
  );

  app.put(
    "/api/inventory/:id",
    requireAuth,
    requirePermission("edit_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        // STEP 1: Parameter validation
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({
            message: "معرف المخزون غير صحيح",
            success: false,
          });
        }

        // STEP 2: Zod schema validation (partial for updates)
        const validatedData = insertInventorySchema.partial().parse(req.body);

        // STEP 3: DataValidator integration for business rules
        const validationResult = await getDataValidator(storage).validateData(
          "inventory",
          validatedData,
          true,
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

        // STEP 4: Update inventory item with validated data
        const item = await storage.updateInventoryItem(id, validatedData);

        res.json({
          data: item,
          message: "تم تحديث صنف المخزون بنجاح",
          success: true,
        });
      } catch (error: any) {
        console.error("Inventory update error:", error);

        res.status(500).json({
          message: "خطأ في تحديث صنف المخزون",
          success: false,
        });
      }
    },
  );

  app.delete(
    "/api/inventory/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteInventoryItem(id);
        res.json({ message: "تم حذف صنف المخزون بنجاح" });
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في حذف صنف المخزون" });
      }
    },
  );

  // Warehouse Receipts
  app.post("/api/warehouse/receipts", requireAuth, async (req, res) => {
    try {
      const validationSchema = insertWarehouseReceiptSchema.extend({
        received_weight_kg: z.coerce
          .number()
          .gt(0, "الوزن يجب أن يكون أكبر من صفر")
          .max(50000, "الوزن يتجاوز 50 طن")
          .transform((v) => Number(v.toFixed(3))),
      });

      const validated = validationSchema.parse(req.body);
      if (!getAuthUserId(req)) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }
      const receipt = await storage.createWarehouseReceipt({
        ...validated,
        received_by: getAuthUserId(req),
      });
      res.status(201).json(receipt);
    } catch (error) {
      console.error("Error creating warehouse receipt:", error);
      res.status(500).json({ message: "خطأ في تسجيل استلام المستودع" });
    }
  });

  // Get warehouse receipts with detailed information grouped by order number
  app.get("/api/warehouse/receipts-detailed", requireAuth, async (req, res) => {
    try {
      const receipts = await storage.getWarehouseReceiptsDetailed();
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching detailed warehouse receipts:", error);
      res.status(500).json({ message: "خطأ في جلب تفاصيل إيصالات المستودع" });
    }
  });

  // Production hall - get production orders ready for warehouse receipt
  app.get(
    "/api/warehouse/production-hall",
    requireAuth,
    requirePermission("view_warehouse", "manage_warehouse"),
    async (req, res) => {
    try {
      const productionOrders = await storage.getProductionHallOrders();
      res.json(productionOrders);
    } catch (error) {
      console.error("Error fetching production hall data:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات صالة الإنتاج" });
    }
  });

  // Record material consumption from mixing batch
  app.post(
    "/api/inventory/consumption",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const { batchId, consumptions } = req.body;
        const userId = getAuthUserId(req);

        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        if (!batchId || !consumptions || !Array.isArray(consumptions)) {
          return res
            .status(400)
            .json({ message: "بيانات الاستهلاك غير مكتملة" });
        }

        // Get batch details
        const batch = await storage.getMixingBatchById(batchId);
        if (!batch) {
          return res.status(404).json({ message: "دفعة الخلط غير موجودة" });
        }

        // Record consumption for each ingredient
        const results = [];
        for (const consumption of consumptions) {
          const { item_id, quantity_consumed, cost_at_consumption } =
            consumption;

          // Get inventory item
          const inventoryItem = await storage.getInventoryByItemId(item_id);
          if (!inventoryItem) {
            throw new Error(`الصنف ${item_id} غير موجود في المخزون`);
          }

          // Create inventory movement (out)
          const movement = await storage.createInventoryMovement({
            inventory_id: inventoryItem.id,
            movement_type: "out",
            quantity: quantity_consumed.toString(),
            unit_cost: cost_at_consumption?.toString(),
            total_cost: cost_at_consumption
              ? (
                  parseFloat(quantity_consumed) *
                  parseFloat(cost_at_consumption)
                ).toString()
              : undefined,
            reference_number: `BATCH-${batch.batch_number}`,
            reference_type: "production",
            notes: `استهلاك من دفعة خلط ${batch.batch_number}`,
            created_by: userId,
          });

          results.push({
            item_id,
            quantity_consumed,
            movement_id: movement.id,
            new_quantity:
              parseFloat(inventoryItem.current_stock) -
              parseFloat(quantity_consumed),
          });
        }

        res.json({
          success: true,
          message: "تم تسجيل استهلاك المواد بنجاح",
          results,
        });
      } catch (error: any) {
        console.error("Error recording material consumption:", error);
        res.status(500).json({
          message: "خطأ في تسجيل استهلاك المواد",
        });
      }
    },
  );

  // ============ Warehouse Vouchers API Routes ============

  // سندات إدخال المواد الخام
  app.get(
    "/api/warehouse/vouchers/raw-material-in",
    requireAuth,
    async (req, res) => {
      try {
        const vouchers = await storage.getRawMaterialVouchersIn();
        res.json(vouchers);
      } catch (error) {
        console.error("Error fetching raw material in vouchers:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سندات إدخال المواد الخام" });
      }
    },
  );

  app.post(
    "/api/warehouse/vouchers/raw-material-in",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const voucherData = {
          ...req.body,
          received_by: userId,
        };

        const voucher = await storage.createRawMaterialVoucherIn(voucherData);
        res.status(201).json(voucher);
      } catch (error: any) {
        console.error("Error creating raw material in voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في إنشاء سند إدخال المواد الخام" });
      }
    },
  );

  app.get(
    "/api/warehouse/vouchers/raw-material-in/:id",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const voucher = await storage.getRawMaterialVoucherInById(id);
        if (!voucher) {
          return res.status(404).json({ message: "السند غير موجود" });
        }
        res.json(voucher);
      } catch (error) {
        console.error("Error fetching raw material in voucher:", error);
        res.status(500).json({ message: "خطأ في جلب سند إدخال المواد الخام" });
      }
    },
  );

  // سندات إخراج المواد الخام
  app.get(
    "/api/warehouse/vouchers/raw-material-out",
    requireAuth,
    async (req, res) => {
      try {
        const vouchers = await storage.getRawMaterialVouchersOut();
        res.json(vouchers);
      } catch (error) {
        console.error("Error fetching raw material out vouchers:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سندات إخراج المواد الخام" });
      }
    },
  );

  app.post(
    "/api/warehouse/vouchers/raw-material-out",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const voucherData = {
          ...req.body,
          issued_by: userId,
        };

        const voucher = await storage.createRawMaterialVoucherOut(voucherData);
        res.status(201).json(voucher);
      } catch (error: any) {
        console.error("Error creating raw material out voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في إنشاء سند إخراج المواد الخام" });
      }
    },
  );

  app.get(
    "/api/warehouse/vouchers/raw-material-out/:id",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const voucher = await storage.getRawMaterialVoucherOutById(id);
        if (!voucher) {
          return res.status(404).json({ message: "السند غير موجود" });
        }
        res.json(voucher);
      } catch (error) {
        console.error("Error fetching raw material out voucher:", error);
        res.status(500).json({ message: "خطأ في جلب سند إخراج المواد الخام" });
      }
    },
  );

  // حذف سند إدخال مواد خام
  app.delete(
    "/api/warehouse/vouchers/raw-material-in/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteRawMaterialVoucherIn(id);
        res.json({ message: "تم حذف السند وإرجاع الكميات بنجاح" });
      } catch (error: any) {
        console.error("Error deleting raw material in voucher:", error);
        res.status(400).json({ message: "خطأ في حذف سند إدخال المواد الخام" });
      }
    },
  );

  // حذف سند إخراج مواد خام
  app.delete(
    "/api/warehouse/vouchers/raw-material-out/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteRawMaterialVoucherOut(id);
        res.json({ message: "تم حذف السند وإرجاع الكميات بنجاح" });
      } catch (error: any) {
        console.error("Error deleting raw material out voucher:", error);
        res.status(400).json({ message: "خطأ في حذف سند إخراج المواد الخام" });
      }
    },
  );

  // ===== مستودع المخلفات الصناعية =====
  // سندات إدخال المخلفات الصناعية
  app.get(
    "/api/warehouse/vouchers/industrial-waste-in",
    requireAuth,
    requirePermission("view_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const vouchers = await storage.getIndustrialWasteVouchersIn();
        res.json(vouchers);
      } catch (error) {
        console.error("Error fetching industrial waste in vouchers:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سندات إدخال المخلفات الصناعية" });
      }
    },
  );

  app.post(
    "/api/warehouse/vouchers/industrial-waste-in",
    requireAuth,
    requirePermission("manage_warehouse"),
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        // Voucher number is always server-generated; ignore any client value.
        const voucher_number = await storage.getNextVoucherNumber("TM-Rec");

        const parsed = insertIndustrialWasteVoucherInSchema.parse({
          ...req.body,
          voucher_number,
          received_by: userId,
        });

        const voucher = await storage.createIndustrialWasteVoucherIn(parsed);
        res.status(201).json(voucher);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صحيحة", errors: error.errors });
        }
        console.error("Error creating industrial waste in voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في إنشاء سند إدخال المخلفات الصناعية" });
      }
    },
  );

  app.get(
    "/api/warehouse/vouchers/industrial-waste-in/:id",
    requireAuth,
    requirePermission("view_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const voucher = await storage.getIndustrialWasteVoucherInById(id);
        if (!voucher) {
          return res.status(404).json({ message: "السند غير موجود" });
        }
        res.json(voucher);
      } catch (error) {
        console.error("Error fetching industrial waste in voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سند إدخال المخلفات الصناعية" });
      }
    },
  );

  app.patch(
    "/api/warehouse/vouchers/industrial-waste-in/:id",
    requireAuth,
    requirePermission("manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const existing = await storage.getIndustrialWasteVoucherInById(id);
        if (!existing) {
          return res.status(404).json({ message: "السند غير موجود" });
        }
        const parsed = updateIndustrialWasteVoucherInSchema.parse(req.body);
        const voucher = await storage.updateIndustrialWasteVoucherIn(id, parsed);
        res.json(voucher);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صحيحة", errors: error.errors });
        }
        console.error("Error updating industrial waste in voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في تعديل سند إدخال المخلفات الصناعية" });
      }
    },
  );

  app.delete(
    "/api/warehouse/vouchers/industrial-waste-in/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteIndustrialWasteVoucherIn(id);
        res.json({ message: "تم حذف السند بنجاح" });
      } catch (error: any) {
        console.error("Error deleting industrial waste in voucher:", error);
        res
          .status(400)
          .json({ message: "خطأ في حذف سند إدخال المخلفات الصناعية" });
      }
    },
  );

  // سندات إخراج المخلفات الصناعية
  app.get(
    "/api/warehouse/vouchers/industrial-waste-out",
    requireAuth,
    requirePermission("view_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const vouchers = await storage.getIndustrialWasteVouchersOut();
        res.json(vouchers);
      } catch (error) {
        console.error("Error fetching industrial waste out vouchers:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سندات إخراج المخلفات الصناعية" });
      }
    },
  );

  app.post(
    "/api/warehouse/vouchers/industrial-waste-out",
    requireAuth,
    requirePermission("manage_warehouse"),
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        // Voucher number is always server-generated; ignore any client value.
        const voucher_number = await storage.getNextVoucherNumber("TM-Del");

        const parsed = insertIndustrialWasteVoucherOutSchema.parse({
          ...req.body,
          voucher_number,
          issued_by: userId,
        });

        const voucher = await storage.createIndustrialWasteVoucherOut(parsed);
        res.status(201).json(voucher);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صحيحة", errors: error.errors });
        }
        console.error("Error creating industrial waste out voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في إنشاء سند إخراج المخلفات الصناعية" });
      }
    },
  );

  app.get(
    "/api/warehouse/vouchers/industrial-waste-out/:id",
    requireAuth,
    requirePermission("view_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const voucher = await storage.getIndustrialWasteVoucherOutById(id);
        if (!voucher) {
          return res.status(404).json({ message: "السند غير موجود" });
        }
        res.json(voucher);
      } catch (error) {
        console.error("Error fetching industrial waste out voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سند إخراج المخلفات الصناعية" });
      }
    },
  );

  app.patch(
    "/api/warehouse/vouchers/industrial-waste-out/:id",
    requireAuth,
    requirePermission("manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const existing = await storage.getIndustrialWasteVoucherOutById(id);
        if (!existing) {
          return res.status(404).json({ message: "السند غير موجود" });
        }
        const parsed = updateIndustrialWasteVoucherOutSchema.parse(req.body);
        const voucher = await storage.updateIndustrialWasteVoucherOut(
          id,
          parsed,
        );
        res.json(voucher);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صحيحة", errors: error.errors });
        }
        console.error("Error updating industrial waste out voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في تعديل سند إخراج المخلفات الصناعية" });
      }
    },
  );

  app.delete(
    "/api/warehouse/vouchers/industrial-waste-out/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteIndustrialWasteVoucherOut(id);
        res.json({ message: "تم حذف السند بنجاح" });
      } catch (error: any) {
        console.error("Error deleting industrial waste out voucher:", error);
        res
          .status(400)
          .json({ message: "خطأ في حذف سند إخراج المخلفات الصناعية" });
      }
    },
  );

  // أوامر الإنتاج المتاحة للاستلام في المستودع
  app.get(
    "/api/warehouse/production-orders-for-receipt",
    requireAuth,
    async (req, res) => {
      try {
        const orders = await storage.getProductionOrdersForReceipt();
        res.json(orders);
      } catch (error) {
        console.error("Error fetching production orders for receipt:", error);
        res.status(500).json({ message: "خطأ في جلب أوامر الإنتاج" });
      }
    },
  );

  // سندات استلام المواد التامة
  app.get(
    "/api/warehouse/vouchers/finished-goods-in",
    requireAuth,
    async (req, res) => {
      try {
        const vouchers = await storage.getFinishedGoodsVouchersIn();
        res.json(vouchers);
      } catch (error) {
        console.error("Error fetching finished goods in vouchers:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سندات استلام المواد التامة" });
      }
    },
  );

  app.post(
    "/api/warehouse/vouchers/finished-goods-in",
    requireAuth,
    requirePermission("add_warehouse", "manage_warehouse"),
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const voucherData = {
          ...req.body,
          created_by: userId,
        };

        const voucher = await storage.createFinishedGoodsVoucherIn(voucherData);
        res.status(201).json(voucher);
      } catch (error: any) {
        console.error("Error creating finished goods in voucher:", error);
        const validationPatterns = [
          "تتجاوز",
          "تم استلام كامل",
          "غير موجود",
          "وحدة التعبئة",
          "عدد الوحدات",
        ];
        const isValidation =
          error.message &&
          validationPatterns.some((p: string) => error.message.includes(p));
        res.status(isValidation ? 400 : 500).json({
          message: isValidation
            ? error.message
            : "خطأ في إنشاء سند استلام المواد التامة",
        });
      }
    },
  );

  app.get(
    "/api/warehouse/vouchers/finished-goods-in/:id",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const voucher = await storage.getFinishedGoodsVoucherInById(id);
        if (!voucher) {
          return res.status(404).json({ message: "السند غير موجود" });
        }
        res.json(voucher);
      } catch (error) {
        console.error("Error fetching finished goods in voucher:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سند استلام المواد التامة" });
      }
    },
  );

  app.delete(
    "/api/warehouse/vouchers/finished-goods-in/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteFinishedGoodsVoucherIn(id);
        res.json({ message: "تم حذف السند وإرجاع الكميات بنجاح" });
      } catch (error: any) {
        console.error("Error deleting finished goods in voucher:", error);
        res.status(400).json({ message: "خطأ في حذف سند الاستلام" });
      }
    },
  );

  // سندات إخراج المواد التامة
  app.get(
    "/api/warehouse/delivery-hall",
    requireAuth,
    requirePermission("view_warehouse", "manage_warehouse"),
    async (req, res) => {
    try {
      const orders = await storage.getDeliveryHallOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching delivery hall data:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات التسليم" });
    }
  });

  app.get(
    "/api/warehouse/vouchers/finished-goods-out",
    requireAuth,
    async (req, res) => {
      try {
        const vouchers = await storage.getFinishedGoodsVouchersOut();
        res.json(vouchers);
      } catch (error) {
        console.error("Error fetching finished goods out vouchers:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سندات إخراج المواد التامة" });
      }
    },
  );

  app.post(
    "/api/warehouse/vouchers/finished-goods-out",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const voucherData = {
          ...req.body,
          created_by: userId,
        };

        const voucher =
          await storage.createFinishedGoodsVoucherOut(voucherData);
        res.status(201).json(voucher);
      } catch (error: any) {
        console.error("Error creating finished goods out voucher:", error);
        const isValidation = error.message?.includes("تتجاوز");
        res.status(isValidation ? 400 : 500).json({
          message: isValidation
            ? error.message
            : "خطأ في إنشاء سند إخراج المواد التامة",
        });
      }
    },
  );

  app.get(
    "/api/warehouse/vouchers/finished-goods-out/:id",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const voucher = await storage.getFinishedGoodsVoucherOutById(id);
        if (!voucher) {
          return res.status(404).json({ message: "السند غير موجود" });
        }
        res.json(voucher);
      } catch (error) {
        console.error("Error fetching finished goods out voucher:", error);
        res.status(500).json({ message: "خطأ في جلب سند إخراج المواد التامة" });
      }
    },
  );

  app.delete(
    "/api/warehouse/vouchers/finished-goods-out/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteFinishedGoodsVoucherOut(id);
        res.json({ message: "تم حذف السند بنجاح" });
      } catch (error: any) {
        console.error("Error deleting finished goods out voucher:", error);
        res.status(500).json({ message: "خطأ في حذف سند التسليم" });
      }
    },
  );

  // إحصائيات السندات
  app.get("/api/warehouse/vouchers/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getWarehouseVouchersStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching warehouse voucher stats:", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات السندات" });
    }
  });

  // ============ Inventory Count (الجرد) API Routes ============

  app.get("/api/warehouse/inventory-counts", requireAuth, async (req, res) => {
    try {
      const counts = await storage.getInventoryCounts();
      res.json(counts);
    } catch (error) {
      console.error("Error fetching inventory counts:", error);
      res.status(500).json({ message: "خطأ في جلب عمليات الجرد" });
    }
  });

  app.post(
    "/api/warehouse/inventory-counts",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const countData = {
          ...req.body,
          counted_by: userId,
        };

        const count = await storage.createInventoryCount(countData);
        res.status(201).json(count);
      } catch (error: any) {
        console.error("Error creating inventory count:", error);
        res.status(500).json({ message: "خطأ في إنشاء عملية الجرد" });
      }
    },
  );

  app.get(
    "/api/warehouse/inventory-counts/:id",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const count = await storage.getInventoryCountById(id);
        if (!count) {
          return res.status(404).json({ message: "عملية الجرد غير موجودة" });
        }
        res.json(count);
      } catch (error) {
        console.error("Error fetching inventory count:", error);
        res.status(500).json({ message: "خطأ في جلب عملية الجرد" });
      }
    },
  );

  app.post(
    "/api/warehouse/inventory-counts/:id/items",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const countId = parseRouteParam(req.params.id, "id");
        const itemData = {
          ...req.body,
          count_id: countId,
        };

        const item = await storage.createInventoryCountItem(itemData);
        res.status(201).json(item);
      } catch (error: any) {
        console.error("Error adding inventory count item:", error);
        res.status(500).json({ message: "خطأ في إضافة صنف للجرد" });
      }
    },
  );

  app.post(
    "/api/warehouse/inventory-counts/:id/complete",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح" });
        }

        const id = parseRouteParam(req.params.id, "id");
        const count = await storage.completeInventoryCount(id, userId);
        res.json(count);
      } catch (error: any) {
        console.error("Error completing inventory count:", error);
        res.status(500).json({ message: "خطأ في إتمام عملية الجرد" });
      }
    },
  );

  // البحث بالباركود
  app.get(
    "/api/warehouse/barcode-lookup/:barcode",
    requireAuth,
    async (req, res) => {
      try {
        const barcode = req.params.barcode;
        const result = await storage.lookupByBarcode(barcode);
        if (!result) {
          return res.status(404).json({ message: "الباركود غير موجود" });
        }
        res.json(result);
      } catch (error) {
        console.error("Error looking up barcode:", error);
        res.status(500).json({ message: "خطأ في البحث بالباركود" });
      }
    },
  );

  // توليد رقم سند جديد
  app.get(
    "/api/warehouse/vouchers/next-number/:type",
    requireAuth,
    async (req, res) => {
      try {
        const type = req.params.type as
          | "RM-Rec"
          | "RM-Del"
          | "FP-Rec"
          | "FP-Del"
          | "TM-Rec"
          | "TM-Del"
          | "RMI"
          | "RMO"
          | "FGI"
          | "FGO"
          | "IC";
        const nextNumber = await storage.getNextVoucherNumber(type);
        res.json({ next_number: nextNumber });
      } catch (error) {
        console.error("Error generating next voucher number:", error);
        res.status(500).json({ message: "خطأ في توليد رقم السند" });
      }
    },
  );

  // ============ Suppliers API Routes ============
  app.get("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const result = await db.execute(
        sql`SELECT * FROM suppliers WHERE is_active = true ORDER BY name_ar`,
      );
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "خطأ في جلب الموردين" });
    }
  });

  app.post(
    "/api/suppliers",
    requireAuth,
    requirePermission("add_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const { name, name_ar, phone, email, address, contact_person } =
          req.body;
        const trimmedName = typeof name === "string" ? name.trim() : "";
        const trimmedNameAr = typeof name_ar === "string" ? name_ar.trim() : "";
        if (!trimmedName || !trimmedNameAr) {
          return res
            .status(400)
            .json({ message: "اسم المورد بالعربية والإنجليزية مطلوب" });
        }
        const result = await db.execute(sql`
        INSERT INTO suppliers (name, name_ar, phone, email, address, contact_person)
        VALUES (${trimmedName}, ${trimmedNameAr}, ${phone || null}, ${email || null}, ${address || null}, ${contact_person || null})
        RETURNING *
      `);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error("Error creating supplier:", error);
        res.status(500).json({ message: "خطأ في إنشاء المورد" });
      }
    },
  );

  app.put(
    "/api/suppliers/:id",
    requireAuth,
    requirePermission("edit_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const { name, name_ar, phone, email, address, contact_person } =
          req.body;
        const trimmedName = typeof name === "string" ? name.trim() : "";
        const trimmedNameAr = typeof name_ar === "string" ? name_ar.trim() : "";
        if (!trimmedName || !trimmedNameAr) {
          return res
            .status(400)
            .json({ message: "اسم المورد بالعربية والإنجليزية مطلوب" });
        }
        const result = await db.execute(sql`
        UPDATE suppliers 
        SET name = ${trimmedName}, name_ar = ${trimmedNameAr}, phone = ${phone || null}, 
            email = ${email || null}, address = ${address || null}, contact_person = ${contact_person || null}
        WHERE id = ${id}
        RETURNING *
      `);
        if (!result.rows[0]) {
          return res.status(404).json({ message: "المورد غير موجود" });
        }
        res.json(result.rows[0]);
      } catch (error) {
        console.error("Error updating supplier:", error);
        res.status(500).json({ message: "خطأ في تحديث المورد" });
      }
    },
  );

  app.delete(
    "/api/suppliers/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await db.execute(
          sql`UPDATE suppliers SET is_active = false WHERE id = ${id}`,
        );
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting supplier:", error);
        res.status(500).json({ message: "خطأ في حذف المورد" });
      }
    },
  );

  // ============ Units API Routes ============
  app.get("/api/units", requireAuth, async (req, res) => {
    try {
      const result = await db.execute(
        sql`SELECT * FROM units WHERE is_active = true ORDER BY name_ar`,
      );
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching units:", error);
      res.json([]);
    }
  });

  app.post(
    "/api/units",
    requireAuth,
    requirePermission("add_warehouse", "manage_warehouse", "manage_definitions"),
    async (req, res) => {
      try {
        const { name, name_ar, symbol, conversion_factor } = req.body;
        const trimmedName = typeof name === "string" ? name.trim() : "";
        const trimmedNameAr = typeof name_ar === "string" ? name_ar.trim() : "";
        if (!trimmedName || !trimmedNameAr) {
          return res
            .status(400)
            .json({ message: "اسم الوحدة بالعربية والإنجليزية مطلوب" });
        }
        const parsedFactor = parseFloat(conversion_factor);
        if (
          conversion_factor !== undefined &&
          conversion_factor !== null &&
          (isNaN(parsedFactor) || parsedFactor <= 0)
        ) {
          return res
            .status(400)
            .json({ message: "معامل التحويل يجب أن يكون رقماً موجباً" });
        }
        const result = await db.execute(sql`
        INSERT INTO units (name, name_ar, symbol, conversion_factor)
        VALUES (${trimmedName}, ${trimmedNameAr}, ${symbol || null}, ${parsedFactor > 0 ? parsedFactor : 1})
        RETURNING *
      `);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error("Error creating unit:", error);
        res.status(500).json({ message: "خطأ في إنشاء الوحدة" });
      }
    },
  );

  app.put(
    "/api/units/:id",
    requireAuth,
    requirePermission("edit_warehouse", "manage_warehouse", "manage_definitions"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const { name, name_ar, symbol, conversion_factor } = req.body;
        const trimmedName = typeof name === "string" ? name.trim() : "";
        const trimmedNameAr = typeof name_ar === "string" ? name_ar.trim() : "";
        if (!trimmedName || !trimmedNameAr) {
          return res
            .status(400)
            .json({ message: "اسم الوحدة بالعربية والإنجليزية مطلوب" });
        }
        const parsedFactor = parseFloat(conversion_factor);
        if (
          conversion_factor !== undefined &&
          conversion_factor !== null &&
          (isNaN(parsedFactor) || parsedFactor <= 0)
        ) {
          return res
            .status(400)
            .json({ message: "معامل التحويل يجب أن يكون رقماً موجباً" });
        }
        const result = await db.execute(sql`
        UPDATE units 
        SET name = ${trimmedName}, name_ar = ${trimmedNameAr}, symbol = ${symbol || null}, 
            conversion_factor = ${parsedFactor > 0 ? parsedFactor : 1}
        WHERE id = ${id}
        RETURNING *
      `);
        if (!result.rows[0]) {
          return res.status(404).json({ message: "الوحدة غير موجودة" });
        }
        res.json(result.rows[0]);
      } catch (error) {
        console.error("Error updating unit:", error);
        res.status(500).json({ message: "خطأ في تحديث الوحدة" });
      }
    },
  );

  app.delete(
    "/api/units/:id",
    requireAuth,
    requirePermission("delete_warehouse", "manage_warehouse", "manage_definitions"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await db.execute(
          sql`UPDATE units SET is_active = false WHERE id = ${id}`,
        );
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting unit:", error);
        res.status(500).json({ message: "خطأ في حذف الوحدة" });
      }
    },
  );

  // ============ Excel Import/Export API Routes ============

  // تصدير الأصناف إلى Excel
  app.get("/api/warehouse/export/items", requireAuth, async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT inv.id, itm.name, itm.name_ar, itm.code, inv.unit, COALESCE(cat.name_ar, cat.name) as category, inv.current_stock, inv.min_stock, inv.max_stock
        FROM inventory inv
        JOIN items itm ON inv.item_id = itm.id
        LEFT JOIN categories cat ON itm.category_id = cat.id
        WHERE itm.status = 'active' ORDER BY itm.name_ar
      `);

      const wb = new ExcelJS.Workbook();
      addJsonSheet(wb, result.rows || [], "الأصناف");
      const buffer = Buffer.from(await wb.xlsx.writeBuffer());
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=inventory_items.xlsx",
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting items:", error);
      res.status(500).json({ message: "خطأ في تصدير الأصناف" });
    }
  });

  // تصدير الموردين إلى Excel
  app.get("/api/warehouse/export/suppliers", requireAuth, async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT id, name, name_ar, phone, email, address, contact_person
        FROM suppliers WHERE is_active = true ORDER BY name_ar
      `);

      const wb = new ExcelJS.Workbook();
      addJsonSheet(wb, result.rows || [], "الموردين");
      const buffer = Buffer.from(await wb.xlsx.writeBuffer());
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=suppliers.xlsx",
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting suppliers:", error);
      res.status(500).json({ message: "خطأ في تصدير الموردين" });
    }
  });

  // تصدير سندات الإدخال/الإخراج إلى Excel - باستخدام استعلامات آمنة
  app.get(
    "/api/warehouse/export/vouchers/:type",
    requireAuth,
    async (req, res) => {
      try {
        const type = req.params.type;
        let result;
        let sheetName = "";

        switch (type) {
          case "raw-material-in":
            result = await db.execute(
              sql`SELECT * FROM raw_material_vouchers_in ORDER BY created_at DESC`,
            );
            sheetName = "سندات إدخال مواد خام";
            break;
          case "raw-material-out":
            result = await db.execute(
              sql`SELECT * FROM raw_material_vouchers_out ORDER BY created_at DESC`,
            );
            sheetName = "سندات إخراج مواد خام";
            break;
          case "finished-goods-in":
            result = await db.execute(
              sql`SELECT * FROM finished_goods_vouchers_in ORDER BY created_at DESC`,
            );
            sheetName = "سندات استلام مواد تامة";
            break;
          case "finished-goods-out":
            result = await db.execute(
              sql`SELECT * FROM finished_goods_vouchers_out ORDER BY created_at DESC`,
            );
            sheetName = "سندات إخراج مواد تامة";
            break;
          default:
            return res.status(400).json({ message: "نوع السند غير صحيح" });
        }

        const wb = new ExcelJS.Workbook();
        addJsonSheet(wb, result.rows || [], sheetName);
        const buffer = Buffer.from(await wb.xlsx.writeBuffer());
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${type}_vouchers.xlsx`,
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.send(buffer);
      } catch (error) {
        console.error("Error exporting vouchers:", error);
        res.status(500).json({ message: "خطأ في تصدير السندات" });
      }
    },
  );

  // استيراد أرصدة افتتاحية من Excel
  app.post(
    "/api/warehouse/import/opening-balance",
    requireAuth,
    upload.single("file"),
    async (req: AuthRequest, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "لم يتم رفع ملف" });
        }

        const data = await parseExcelBuffer(req.file.buffer);

        let imported = 0;
        const errors: string[] = [];

        for (const row of data) {
          try {
            const code = row["الكود"] || row["code"] || row["Code"];
            const quantity = parseFloat(
              row["الكمية"] || row["quantity"] || row["Quantity"] || 0,
            );
            const unitCost = parseFloat(
              row["سعر_الوحدة"] || row["unit_cost"] || row["UnitCost"] || 0,
            );

            if (!code) {
              errors.push(`سطر بدون كود صنف`);
              continue;
            }

            await db.execute(sql`
            UPDATE inventory 
            SET current_stock = ${quantity}, cost_per_unit = ${unitCost}, last_updated = NOW()
            WHERE item_id = ${code}
          `);
            imported++;
          } catch (err: any) {
            errors.push(
              `خطأ في الصنف ${row["الكود"] || row["code"]}: ${err.message}`,
            );
          }
        }

        res.json({
          success: true,
          message: `تم استيراد ${imported} صنف بنجاح`,
          imported,
          errors: errors.length > 0 ? errors : undefined,
        });
      } catch (error: any) {
        console.error("Error importing opening balance:", error);
        res.status(500).json({ message: "خطأ في استيراد الأرصدة الافتتاحية" });
      }
    },
  );

  // استيراد موردين من Excel
  app.post(
    "/api/warehouse/import/suppliers",
    requireAuth,
    upload.single("file"),
    async (req: AuthRequest, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "لم يتم رفع ملف" });
        }

        const data = await parseExcelBuffer(req.file.buffer);

        let imported = 0;
        const errors: string[] = [];

        for (const row of data) {
          try {
            const name =
              row["الاسم_انجليزي"] || row["name"] || row["Name"] || "";
            const name_ar =
              row["الاسم_عربي"] || row["name_ar"] || row["NameAr"] || "";
            const phone = row["الهاتف"] || row["phone"] || row["Phone"] || null;
            const email = row["البريد"] || row["email"] || row["Email"] || null;
            const address =
              row["العنوان"] || row["address"] || row["Address"] || null;
            const contact_person =
              row["جهة_الاتصال"] ||
              row["contact_person"] ||
              row["ContactPerson"] ||
              null;

            if (!name_ar) {
              errors.push(`سطر بدون اسم مورد`);
              continue;
            }

            await db.execute(sql`
            INSERT INTO suppliers (name, name_ar, phone, email, address, contact_person)
            VALUES (${name}, ${name_ar}, ${phone}, ${email}, ${address}, ${contact_person})
          `);
            imported++;
          } catch (err: any) {
            errors.push(
              `خطأ في المورد ${row["الاسم_عربي"] || row["name_ar"]}: ${err.message}`,
            );
          }
        }

        res.json({
          success: true,
          message: `تم استيراد ${imported} مورد بنجاح`,
          imported,
          errors: errors.length > 0 ? errors : undefined,
        });
      } catch (error: any) {
        console.error("Error importing suppliers:", error);
        res.status(500).json({ message: "خطأ في استيراد الموردين" });
      }
    },
  );

  // تحميل قالب Excel فارغ
  app.get("/api/warehouse/template/:type", requireAuth, async (req, res) => {
    try {
      const type = req.params.type;
      let headers: string[] = [];
      let sheetName = "";

      switch (type) {
        case "opening-balance":
          headers = ["الكود", "الكمية", "سعر_الوحدة"];
          sheetName = "أرصدة افتتاحية";
          break;
        case "suppliers":
          headers = [
            "الاسم_عربي",
            "الاسم_انجليزي",
            "الهاتف",
            "البريد",
            "العنوان",
            "جهة_الاتصال",
          ];
          sheetName = "الموردين";
          break;
        case "items":
          headers = [
            "الكود",
            "الاسم_عربي",
            "الاسم_انجليزي",
            "الباركود",
            "الوحدة",
            "التصنيف",
            "الحد_الأدنى",
            "الحد_الأقصى",
          ];
          sheetName = "الأصناف";
          break;
        default:
          return res.status(400).json({ message: "نوع القالب غير صحيح" });
      }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(sheetName);
      ws.addRow(headers);
      const buffer = Buffer.from(await wb.xlsx.writeBuffer());
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${type}_template.xlsx`,
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "خطأ في إنشاء القالب" });
    }
  });

  // ============ Warehouse Reports API Routes ============

  // تقرير حركات المخزون - باستخدام استعلامات معلمة آمنة
  app.get("/api/warehouse/reports/movements", requireAuth, async (req, res) => {
    try {
      const startDate =
        typeof req.query.startDate === "string" ? req.query.startDate : null;
      const endDate =
        typeof req.query.endDate === "string" ? req.query.endDate : null;
      const itemIdRaw =
        typeof req.query.itemId === "string"
          ? parseInt(req.query.itemId)
          : NaN;
      const itemId = !isNaN(itemIdRaw) && itemIdRaw > 0 ? itemIdRaw : null;
      const movementType =
        typeof req.query.type === "string" &&
        ["in", "out"].includes(req.query.type)
          ? req.query.type
          : null;

      const result = await db.execute(sql`
        SELECT 
          im.id,
          im.inventory_id,
          im.movement_type,
          im.quantity,
          im.reference_type,
          im.reference_number,
          im.notes,
          im.created_at,
          itm.name_ar as item_name,
          itm.code as item_code
        FROM inventory_movements im
        LEFT JOIN inventory inv ON im.inventory_id = inv.id
        LEFT JOIN items itm ON inv.item_id = itm.id
        WHERE 1=1
          AND (${startDate}::date IS NULL OR im.created_at >= ${startDate}::date)
          AND (${endDate}::date IS NULL OR im.created_at <= ${endDate}::date)
          AND (${itemId}::int IS NULL OR im.inventory_id = ${itemId})
          AND (${movementType}::text IS NULL OR im.movement_type = ${movementType})
        ORDER BY im.created_at DESC
        LIMIT 500
      `);
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching movements report:", error);
      res.status(500).json({ message: "خطأ في جلب تقرير الحركات" });
    }
  });

  // تقرير الأرصدة الحالية - باستخدام استعلامات معلمة آمنة
  app.get(
    "/api/warehouse/reports/stock-levels",
    requireAuth,
    async (req, res) => {
      try {
        const category =
          typeof req.query.category === "string" ? req.query.category : null;
        const belowMinimum = req.query.belowMinimum === "true";

        const result = await db.execute(sql`
        SELECT 
          inv.id,
          itm.code,
          itm.name_ar,
          itm.name,
          itm.category_id as category,
          inv.unit,
          inv.current_stock,
          inv.min_stock,
          inv.max_stock,
          inv.cost_per_unit as unit_cost,
          (inv.current_stock * COALESCE(inv.cost_per_unit, 0)) as total_value,
          CASE 
            WHEN inv.current_stock <= inv.min_stock THEN 'low'
            WHEN inv.current_stock >= inv.max_stock THEN 'high'
            ELSE 'normal'
          END as stock_status
        FROM inventory inv
        JOIN items itm ON inv.item_id = itm.id
        WHERE itm.status = 'active'
          AND (${category}::text IS NULL OR itm.category_id = ${category})
          AND (${belowMinimum} = false OR inv.current_stock <= inv.min_stock)
        ORDER BY itm.name_ar
      `);
        res.json(result.rows || []);
      } catch (error) {
        console.error("Error fetching stock levels report:", error);
        res.status(500).json({ message: "خطأ في جلب تقرير الأرصدة" });
      }
    },
  );

  // تقرير التنبيهات (أصناف تحت الحد الأدنى)
  app.get("/api/warehouse/reports/alerts", requireAuth, async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          inv.id,
          itm.code,
          itm.name_ar,
          itm.name,
          itm.category_id as category,
          inv.unit,
          inv.current_stock,
          inv.min_stock,
          (inv.min_stock - inv.current_stock) as shortage
        FROM inventory inv
        JOIN items itm ON inv.item_id = itm.id
        WHERE itm.status = 'active' AND inv.current_stock < inv.min_stock
        ORDER BY (inv.min_stock - inv.current_stock) DESC
      `);
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "خطأ في جلب التنبيهات" });
    }
  });

  // ملخص إحصائيات المستودع
  app.get("/api/warehouse/reports/summary", requireAuth, async (req, res) => {
    try {
      const [itemsCount, suppliersCount, lowStockCount, totalValue] =
        await Promise.all([
          db.execute(
            sql`SELECT COUNT(*) as count FROM inventory inv JOIN items itm ON inv.item_id = itm.id WHERE itm.status = 'active'`,
          ),
          db.execute(
            sql`SELECT COUNT(*) as count FROM suppliers WHERE is_active = true`,
          ),
          db.execute(
            sql`SELECT COUNT(*) as count FROM inventory inv JOIN items itm ON inv.item_id = itm.id WHERE itm.status = 'active' AND inv.current_stock < inv.min_stock`,
          ),
          db.execute(
            sql`SELECT COALESCE(SUM(inv.current_stock * COALESCE(inv.cost_per_unit, 0)), 0) as total FROM inventory inv JOIN items itm ON inv.item_id = itm.id WHERE itm.status = 'active'`,
          ),
        ]);

      res.json({
        totalItems: (itemsCount.rows[0] as any)?.count || 0,
        totalSuppliers: (suppliersCount.rows[0] as any)?.count || 0,
        lowStockItems: (lowStockCount.rows[0] as any)?.count || 0,
        totalInventoryValue: (totalValue.rows[0] as any)?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching warehouse summary:", error);
      res.status(500).json({ message: "خطأ في جلب ملخص المستودع" });
    }
  });
}
