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
  notificationManagerHolder,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerMachinesRoutes(app: Express, ctx: any) {
  const {
    cleanMachineDimensionFields,
    validateMachineDimensionRanges,
  } = ctx;


  // Machines routes
  app.get("/api/machines", requireAuth, requirePermission(
    "manage_machines",
    "add_machines",
    "edit_machines",
    "view_quality",
    "manage_quality",
    "add_quality",
    "view_production",
    "manage_production",
    "view_film_dashboard",
    "view_printing_dashboard",
    "view_cutting_dashboard",
    "view_maintenance",
    "manage_maintenance",
    "view_maintenance_requests",
    "create_maintenance_requests",
    "manage_definitions",
    "view_warehouse",
    "manage_warehouse",
    "view_mixing",
    "manage_mixing",
    "view_quality",
    "manage_quality",
  ), async (req, res) => {
    try {
      const machines = await storage.getMachines();
      res.json(machines);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب المكائن" });
    }
  });

  // Sections routes
  app.get("/api/sections", requireAuth, async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب الأقسام" });
    }
  });

  app.post(
    "/api/machines",
    requireAuth,
    requirePermission("add_machines", "manage_machines", "manage_definitions"),
    async (req, res) => {
      try {
        // Generate sequential ID if not provided with enhanced null safety
        let machineId = req.body?.id;
        if (!machineId) {
          // Get the latest machine to determine the next sequential number
          const existingMachines = (await storage.getMachines()) || [];
          const machineNumbers = existingMachines
            .map((machine) => machine?.id)
            .filter(
              (id) => id && typeof id === "string" && id.startsWith("MAC"),
            )
            .map((id) => {
              const num = id.replace("MAC", "");
              const parsed = parseInt(num);
              return isNaN(parsed) ? 0 : parsed;
            })
            .filter((num) => num > 0)
            .sort((a, b) => b - a);

          const nextNumber =
            machineNumbers.length > 0 ? machineNumbers[0] + 1 : 1;
          machineId = `MAC${nextNumber.toString().padStart(2, "0")}`;
        }

        const processedData = {
          ...req.body,
          id: machineId,
          ...cleanMachineDimensionFields(req.body),
        };

        const dimensionRangeError =
          validateMachineDimensionRanges(processedData);
        if (dimensionRangeError) {
          return res.status(400).json({
            message: dimensionRangeError,
            success: false,
          });
        }

        // STEP 1: DataValidator integration for business rules
        const validationResult = await getDataValidator(storage).validateData(
          "machines",
          processedData,
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

        const machine = await storage.createMachine(processedData);

        res.status(201).json({
          data: machine,
          message: "تم إنشاء الماكينة بنجاح",
          success: true,
        });
      } catch (error: any) {
        console.error("Machine creation error:", error);

        res.status(500).json({
          message: "خطأ في إنشاء الماكينة",
          success: false,
        });
      }
    },
  );

  app.put(
    "/api/machines/:id",
    requireAuth,
    requirePermission("edit_machines", "manage_machines", "manage_definitions"),
    async (req, res) => {
      try {
        const id = req.params.id; // Now using string ID

        // Clean up empty capacity fields - convert empty strings to null
        const cleanedData = {
          ...req.body,
          capacity_small_kg_per_hour:
            req.body.capacity_small_kg_per_hour === "" ||
            req.body.capacity_small_kg_per_hour === null
              ? null
              : req.body.capacity_small_kg_per_hour,
          capacity_medium_kg_per_hour:
            req.body.capacity_medium_kg_per_hour === "" ||
            req.body.capacity_medium_kg_per_hour === null
              ? null
              : req.body.capacity_medium_kg_per_hour,
          capacity_large_kg_per_hour:
            req.body.capacity_large_kg_per_hour === "" ||
            req.body.capacity_large_kg_per_hour === null
              ? null
              : req.body.capacity_large_kg_per_hour,
          ...cleanMachineDimensionFields(req.body),
        };

        const dimensionRangeError =
          validateMachineDimensionRanges(cleanedData);
        if (dimensionRangeError) {
          return res.status(400).json({
            message: dimensionRangeError,
            success: false,
          });
        }

        // Fetch current status before the update to detect transitions
        const prevResult = await db.execute(
          sql`SELECT status, name_ar, type FROM machines WHERE id = ${id} LIMIT 1`,
        );
        const prevStatus = (prevResult.rows[0] as any)?.status;
        const machineNameAr = (prevResult.rows[0] as any)?.name_ar || id;
        const machineType = (prevResult.rows[0] as any)?.type;

        const machine = await storage.updateMachine(id, cleanedData);

        // ── Dynamic Load Balancing ──────────────────────────────────────────
        // When a machine transitions from active → down/maintenance, suggest
        // redistributing its queued production orders to backup machines.
        const newStatus = cleanedData.status;
        if (
          (newStatus === "down" || newStatus === "maintenance") &&
          prevStatus === "active"
        ) {
          try {
            const queueResult = await db.execute(sql`
              SELECT mq.id, mq.production_order_id, po.production_order_number
              FROM machine_queues mq
              JOIN production_orders po ON mq.production_order_id = po.id
              WHERE mq.machine_id = ${id}
              ORDER BY mq.queue_position
            `);

            if (queueResult.rows.length > 0) {
              const backupResult = await db.execute(sql`
                SELECT id, name_ar FROM machines
                WHERE type = ${machineType}
                  AND status = 'active'
                  AND id != ${id}
              `);

              const suggestions = (queueResult.rows as any[]).map(
                (row, index) => {
                  const backup = (backupResult.rows as any[])[
                    index % Math.max(backupResult.rows.length, 1)
                  ];
                  return {
                    productionOrderId: row.production_order_id,
                    orderNumber: row.production_order_number,
                    fromMachine: id,
                    fromMachineName: machineNameAr,
                    toMachine: backup?.id || null,
                    toMachineName: backup?.name_ar || "لا توجد ماكينة بديلة نشطة",
                  };
                },
              );

              if (notificationManagerHolder.value) {
                const suggestionLines = suggestions
                  .slice(0, 3)
                  .map(
                    (s) =>
                      `• أمر ${s.orderNumber} → ${s.toMachineName}`,
                  )
                  .join("\n");
                const extra =
                  suggestions.length > 3
                    ? `\n...و${suggestions.length - 3} أوامر أخرى`
                    : "";

                await notificationManagerHolder.value.sendToAll({
                  title: "موازنة الأحمال الديناميكية",
                  title_ar: `⚠️ تعطل ماكينة — مقترح إعادة جدولة`,
                  message: `الماكينة ${machineNameAr} (${newStatus === "down" ? "معطلة" : "صيانة"}) — ${suggestions.length} أوامر تحتاج إعادة توزيع:\n${suggestionLines}${extra}`,
                  message_ar: `الماكينة ${machineNameAr} (${newStatus === "down" ? "معطلة" : "صيانة"}) — ${suggestions.length} أوامر تحتاج إعادة توزيع:\n${suggestionLines}${extra}`,
                  type: "production",
                  priority: "high",
                  context_type: "load_balancing_suggestion",
                  context_id: id,
                  sound: true,
                } as any);
              }
            }
          } catch (lbErr) {
            logger.error("[LoadBalancing] Failed to compute redistribution suggestions:", lbErr);
          }
        }
        // ───────────────────────────────────────────────────────────────────

        res.json(machine);
      } catch (error) {
        console.error("Machine update error:", error);
        res.status(500).json({
          message: "خطأ في تحديث الماكينة",
          error: "خطأ داخلي",
        });
      }
    },
  );

  // Sections routes
  app.post(
    "/api/sections",
    requireAuth,
    requirePermission("add_sections", "manage_sections", "manage_definitions"),
    async (req, res) => {
      try {
        // Generate sequential ID if not provided with enhanced null safety
        let sectionId = req.body?.id;
        if (!sectionId) {
          // Get the latest section to determine the next sequential number
          const existingSections = (await storage.getSections()) || [];
          const sectionNumbers = existingSections
            .map((section) => section?.id)
            .filter(
              (id) => id && typeof id === "string" && id.startsWith("SEC"),
            )
            .map((id) => {
              const num = id.replace("SEC", "");
              const parsed = parseInt(num);
              return isNaN(parsed) ? 0 : parsed;
            })
            .filter((num) => num > 0)
            .sort((a, b) => b - a);

          const nextNumber =
            sectionNumbers.length > 0 ? sectionNumbers[0] + 1 : 1;
          sectionId = `SEC${nextNumber.toString().padStart(2, "0")}`;
        }

        const processedData = {
          ...req.body,
          id: sectionId,
        };

        const section = await storage.createSection(processedData);
        res.json(section);
      } catch (error) {
        console.error("Section creation error:", error);
        res.status(500).json({
          message: "خطأ في إنشاء القسم",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.put(
    "/api/sections/:id",
    requireAuth,
    requirePermission("edit_sections", "manage_sections", "manage_definitions"),
    async (req, res) => {
      try {
        // Enhanced parameter validation
        if (!req.params?.id?.trim()) {
          return res.status(400).json({ message: "معرف القسم مطلوب" });
        }

        if (!req.body || typeof req.body !== "object") {
          return res.status(400).json({ message: "بيانات التحديث مطلوبة" });
        }

        const id = req.params.id.trim();
        const section = await storage.updateSection(id, req.body);
        if (!section) {
          return res.status(404).json({ message: "القسم غير موجود" });
        }
        res.json(section);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في تحديث القسم" });
      }
    },
  );

  app.delete(
    "/api/sections/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        await storage.deleteSection(id);
        res.json({ message: "تم حذف القسم بنجاح" });
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في حذف القسم" });
      }
    },
  );

  app.delete(
    "/api/machines/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        await storage.deleteMachine(id);
        res.json({ message: "تم حذف الماكينة بنجاح" });
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في حذف الماكينة" });
      }
    },
  );

  // Get machine capacity statistics
  app.get("/api/machines/capacity-stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getMachineCapacityStats(
        String(req.query.stage || ""),
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error getting machine capacity stats:", error);
      res.status(500).json({
        message: "خطأ في جلب إحصائيات السعة",
      });
    }
  });
}
