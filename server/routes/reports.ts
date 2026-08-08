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
  TRANSLATE_NAME_CACHE_TTL_MS,
  TRANSLATE_NAME_CACHE_MAX,
  translateNameCache,
  getTranslateOpenAIClient,
  parseExcelBuffer,
  getAuthUserId,
  safeJsonParse,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerReportsRoutes(app: Express, ctx: any) {
  const {
    excelUpload,
  } = ctx;


  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      logger.error("Dashboard stats error", error);
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  // Dashboard config - per-user widget configuration
  app.get("/api/dashboard/config", requireAuth, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const setting = await db
        .select()
        .from(user_settings)
        .where(
          and(
            eq(user_settings.user_id, Number(userId)),
            eq(user_settings.setting_key, "dashboard_config"),
          ),
        )
        .limit(1);

      const VALID_WIDGET_IDS = new Set([
        "dashboard_stats",
        "machine_status",
        "recent_rolls",
        "attendance_stats",
        "quick_notes",
        "shortcuts",
        "inventory_widget",
        "quotes_widget",
        "attendance_widget",
        "recent_orders_widget",
        "production_progress_widget",
        "maintenance_widget",
        "customer_production_orders_widget",
      ]);

      if (setting.length > 0 && setting[0].setting_value) {
        try {
          const config = JSON.parse(setting[0].setting_value);
          if (Array.isArray(config.widgets)) {
            config.widgets = config.widgets.filter((w: string) =>
              VALID_WIDGET_IDS.has(w),
            );
          }
          return res.json(config);
        } catch {
          // Invalid JSON, return default
        }
      }

      // Return default config based on user role
      const userResult = await db
        .select({ role_id: users.role_id, permissions: roles.permissions })
        .from(users)
        .leftJoin(roles, eq(users.role_id, roles.id))
        .where(eq(users.id, userId))
        .limit(1);

      const userPerms: string[] =
        (userResult[0]?.permissions as string[]) || [];
      const isAdmin = userPerms.includes("admin");

      let defaultWidgets: string[];

      if (isAdmin) {
        defaultWidgets = [
          "dashboard_stats",
          "recent_orders_widget",
          "customer_production_orders_widget",
          "production_progress_widget",
          "machine_status",
          "inventory_widget",
          "attendance_widget",
          "maintenance_widget",
          "shortcuts",
          "quick_notes",
        ];
      } else if (
        userPerms.includes("manage_production") ||
        userPerms.includes("view_production")
      ) {
        defaultWidgets = [
          "dashboard_stats",
          "recent_orders_widget",
          "customer_production_orders_widget",
          "production_progress_widget",
          "machine_status",
          "recent_rolls",
          "shortcuts",
        ];
      } else if (
        userPerms.includes("manage_hr") ||
        userPerms.includes("view_hr")
      ) {
        defaultWidgets = [
          "attendance_stats",
          "attendance_widget",
          "shortcuts",
          "quick_notes",
        ];
      } else if (
        userPerms.includes("manage_warehouse") ||
        userPerms.includes("view_warehouse")
      ) {
        defaultWidgets = [
          "inventory_widget",
          "recent_orders_widget",
          "shortcuts",
          "quick_notes",
        ];
      } else if (
        userPerms.includes("manage_orders") ||
        userPerms.includes("manage_customers")
      ) {
        defaultWidgets = [
          "recent_orders_widget",
          "customer_production_orders_widget",
          "quotes_widget",
          "dashboard_stats",
          "shortcuts",
        ];
      } else {
        defaultWidgets = ["dashboard_stats", "shortcuts", "quick_notes"];
      }

      res.json({ widgets: defaultWidgets });
    } catch (error) {
      logger.error("Dashboard config error", error);
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب إعدادات لوحة التحكم" });
    }
  });

  app.put("/api/dashboard/config", requireAuth, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { widgets } = req.body;
      if (!Array.isArray(widgets)) {
        return res.status(400).json({ message: "widgets must be an array" });
      }

      const VALID_WIDGET_IDS = new Set([
        "dashboard_stats",
        "machine_status",
        "recent_rolls",
        "attendance_stats",
        "quick_notes",
        "shortcuts",
        "inventory_widget",
        "quotes_widget",
        "attendance_widget",
        "recent_orders_widget",
        "production_progress_widget",
        "maintenance_widget",
        "customer_production_orders_widget",
      ]);
      const validWidgets = widgets.filter(
        (w: string) => typeof w === "string" && VALID_WIDGET_IDS.has(w),
      );

      const configJson = JSON.stringify({ widgets: validWidgets });

      // Serialize concurrent saves for the same user via a per-user advisory
      // lock. This prevents two simultaneous PUT requests from both seeing no
      // existing row and inserting duplicates (there is no unique constraint
      // on (user_id, setting_key) at the schema level).
      await db.transaction(async (tx) => {
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtext(${`dashboard_config:${userId}`}))`,
        );

        const existing = await tx
          .select()
          .from(user_settings)
          .where(
            and(
              eq(user_settings.user_id, Number(userId)),
              eq(user_settings.setting_key, "dashboard_config"),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          await tx
            .update(user_settings)
            .set({
              setting_value: configJson,
              setting_type: "json",
              updated_at: new Date(),
            })
            .where(eq(user_settings.id, existing[0].id));
        } else {
          await tx.insert(user_settings).values({
            user_id: Number(userId),
            setting_key: "dashboard_config",
            setting_value: configJson,
            setting_type: "json",
          });
        }
      });

      res.json({ success: true, widgets: validWidgets });
    } catch (error) {
      logger.error("Dashboard config save error", error);
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في حفظ إعدادات لوحة التحكم" });
    }
  });

  // ───────────────────────────────────────────────────────────────────────
  // Roll management (system admin / production manager only). Lists every roll
  // across all stages and lets managers correct a wrongly-entered roll's
  // machine and/or product (production order), keeping a full audit trail.
  // `requirePermission("manage_production")` also auto-passes the "admin" key.
  // ───────────────────────────────────────────────────────────────────────
  app.get(
    "/api/management/rolls",
    requireAuth,
    requirePermission("manage_production"),
    async (req, res) => {
      try {
        const stage =
          typeof req.query.stage === "string" && req.query.stage
            ? req.query.stage
            : undefined;
        const search =
          typeof req.query.search === "string" && req.query.search
            ? req.query.search
            : undefined;
        const limit = Math.max(
          1,
          Math.min(parseInt(String(req.query.limit ?? "")) || 200, 5000),
        );
        const offset = Math.max(
          0,
          parseInt(String(req.query.offset ?? "")) || 0,
        );
        const rows = await storage.getManagedRolls({
          stage,
          search,
          limit,
          offset,
        });
        res.json(rows);
      } catch (error) {
        console.error("[GET /api/management/rolls] Error:", error);
        res.status(500).json({ message: "خطأ في جلب الرولات" });
      }
    },
  );

  app.get(
    "/api/management/rolls/:id/history",
    requireAuth,
    requirePermission("manage_production"),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ message: "معرف الرول غير صالح" });
        }
        const logs = await storage.getRollEditLogs(id);
        res.json(logs);
      } catch (error) {
        console.error("[GET /api/management/rolls/:id/history] Error:", error);
        res.status(500).json({ message: "خطأ في جلب سجل التعديلات" });
      }
    },
  );

  app.patch(
    "/api/management/rolls/:id",
    requireAuth,
    requirePermission("manage_production"),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ message: "معرف الرول غير صالح" });
        }
        const body = req.body ?? {};
        const changes: {
          film_machine_id?: string | null;
          printing_machine_id?: string | null;
          cutting_machine_id?: string | null;
          production_order_id?: number;
          note?: string;
        } = {};

        if ("film_machine_id" in body)
          changes.film_machine_id = body.film_machine_id ?? null;
        if ("printing_machine_id" in body)
          changes.printing_machine_id = body.printing_machine_id ?? null;
        if ("cutting_machine_id" in body)
          changes.cutting_machine_id = body.cutting_machine_id ?? null;
        if (
          body.production_order_id !== undefined &&
          body.production_order_id !== null &&
          body.production_order_id !== ""
        ) {
          const poId = parseInt(String(body.production_order_id), 10);
          if (!Number.isFinite(poId)) {
            return res
              .status(400)
              .json({ message: "معرف أمر الإنتاج غير صالح" });
          }
          changes.production_order_id = poId;
        }
        if (typeof body.note === "string") changes.note = body.note;

        const userId = getAuthUserId(req);
        const updated = await storage.updateRollByManager(id, changes, userId);
        res.json(updated);
      } catch (error: any) {
        const status = error?.statusCode || 500;
        console.error("[PATCH /api/management/rolls/:id] Error:", error);
        res.status(status).json({
          message: error?.message || "خطأ في تعديل الرول",
        });
      }
    },
  );

  // ================ ADVANCED REPORTING API ROUTES ================

  // Order Reports
  app.get("/api/reports/orders", requireAuth, async (req, res) => {
    try {
      const { date_from, date_to } = req.query;
      const reports = await storage.getOrderReports({
        dateFrom: date_from as string,
        dateTo: date_to as string,
      });
      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      console.error("Order reports error:", error);
      res.status(500).json({
        message: "خطأ في جلب تقارير الطلبات",
        success: false,
      });
    }
  });

  // Advanced Metrics (OEE, Cycle Time, Quality)
  app.get("/api/reports/advanced-metrics", requireAuth, async (req, res) => {
    try {
      const { date_from, date_to } = req.query;
      const metrics = await storage.getAdvancedMetrics();
      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error("Advanced metrics error:", error);
      res.status(500).json({
        message: "خطأ في جلب المؤشرات المتقدمة",
        success: false,
      });
    }
  });

  // HR Reports
  app.get("/api/reports/hr", requireAuth, async (req, res) => {
    try {
      const { date_from, date_to } = req.query;
      const reports = await storage.getHRReports({
        dateFrom: date_from as string,
        dateTo: date_to as string,
      });
      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      console.error("HR reports error:", error);
      res.status(500).json({
        message: "خطأ في جلب تقارير الموارد البشرية",
        success: false,
      });
    }
  });

  // Maintenance Reports
  app.get("/api/reports/maintenance", requireAuth, async (req, res) => {
    try {
      const { date_from, date_to } = req.query;
      const reports = await storage.getMaintenanceReports();
      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      console.error("Maintenance reports error:", error);
      res.status(500).json({
        message: "خطأ في جلب تقارير الصيانة",
        success: false,
      });
    }
  });

  // Comprehensive Dashboard Report (All KPIs)
  app.get("/api/reports/dashboard", requireAuth, async (req, res) => {
    try {
      const { date_from, date_to } = req.query;

      // Fetch all reports in parallel for better performance
      const [
        orderReports,
        advancedMetrics,
        hrReports,
        maintenanceReports,
        realTimeStats,
        machineUtilization,
        productionEfficiency,
        productionAlerts,
      ] = await Promise.all([
        storage.getOrderReports({
          dateFrom: date_from as string,
          dateTo: date_to as string,
        }),
        storage.getAdvancedMetrics(),
        storage.getHRReports({
          dateFrom: date_from as string,
          dateTo: date_to as string,
        }),
        storage.getMaintenanceReports(),
        storage.getRealTimeProductionStats(),
        storage.getMachineUtilizationStats(),
        storage.getProductionEfficiencyMetrics(),
        storage.getProductionAlerts(),
      ]);

      res.json({
        success: true,
        data: {
          orders: orderReports,
          metrics: advancedMetrics,
          hr: hrReports,
          maintenance: maintenanceReports,
          realTime: realTimeStats,
          machineUtilization,
          productionEfficiency,
          alerts: productionAlerts,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Comprehensive dashboard error:", error);
      res.status(500).json({
        message: "خطأ في جلب التقرير الشامل",
        success: false,
      });
    }
  });

  // ============ PRODUCTION REPORTS API ROUTES ============

  // Production Summary Report
  app.get("/api/reports/production-summary", requireAuth, async (req, res) => {
    try {
      const filters = {
        dateFrom: req.query.date_from as string,
        dateTo: req.query.date_to as string,
        customerId: req.query.customer_id
          ? safeJsonParse(req.query.customer_id as string, "customer_id")
          : undefined,
        productId: req.query.product_id
          ? safeJsonParse(req.query.product_id as string, "product_id")
          : undefined,
        status: req.query.status
          ? safeJsonParse(req.query.status as string, "status")
          : undefined,
        sectionId: req.query.section_id as string,
        machineId: req.query.machine_id as string,
        operatorId: req.query.operator_id
          ? parseInt(req.query.operator_id as string)
          : undefined,
      };

      const summary = await storage.getProductionSummary(filters);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      if (error?.statusCode === 400) {
        return res.status(400).json({ message: error.message, success: false });
      }
      console.error("Production summary error:", error);
      res
        .status(500)
        .json({ message: "خطأ في جلب ملخص الإنتاج", success: false });
    }
  });

  // Production by Date
  app.get("/api/reports/production-by-date", requireAuth, async (req, res) => {
    try {
      const filters = {
        dateFrom: req.query.date_from as string,
        dateTo: req.query.date_to as string,
        customerId: req.query.customer_id
          ? safeJsonParse(req.query.customer_id as string, "customer_id")
          : undefined,
        productId: req.query.product_id
          ? safeJsonParse(req.query.product_id as string, "product_id")
          : undefined,
      };

      const data = await storage.getProductionByDate(filters);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error?.statusCode === 400) {
        return res.status(400).json({ message: error.message, success: false });
      }
      console.error("Production by date error:", error);
      res
        .status(500)
        .json({ message: "خطأ في جلب بيانات الإنتاج اليومية", success: false });
    }
  });

  // Production by Product
  app.get(
    "/api/reports/production-by-product",
    requireAuth,
    async (req, res) => {
      try {
        const filters = {
          dateFrom: req.query.date_from as string,
          dateTo: req.query.date_to as string,
          customerId: req.query.customer_id
            ? safeJsonParse(req.query.customer_id as string, "customer_id")
            : undefined,
        };

        const data = await storage.getProductionByProduct(filters);
        res.json({ success: true, data });
      } catch (error: any) {
        if (error?.statusCode === 400) {
          return res
            .status(400)
            .json({ message: error.message, success: false });
        }
        console.error("Production by product error:", error);
        res.status(500).json({
          message: "خطأ في جلب بيانات الإنتاج حسب المنتج",
          success: false,
        });
      }
    },
  );

  // Waste Analysis
  app.get("/api/reports/waste-analysis", requireAuth, async (req, res) => {
    try {
      const filters = {
        dateFrom: req.query.date_from as string,
        dateTo: req.query.date_to as string,
        sectionId: req.query.section_id as string,
      };

      const data = await storage.getWasteAnalysis(filters);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Waste analysis error:", error);
      res
        .status(500)
        .json({ message: "خطأ في جلب تحليل الهدر", success: false });
    }
  });

  // Machine Performance
  app.get("/api/reports/machine-performance", requireAuth, async (req, res) => {
    try {
      const filters = {
        dateFrom: req.query.date_from as string,
        dateTo: req.query.date_to as string,
      };

      const data = await storage.getMachinePerformance(filters);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Machine performance error:", error);
      res
        .status(500)
        .json({ message: "خطأ في جلب أداء المكائن", success: false });
    }
  });

  // Operator Performance
  app.get(
    "/api/reports/operator-performance",
    requireAuth,
    async (req, res) => {
      try {
        const filters = {
          dateFrom: req.query.date_from as string,
          dateTo: req.query.date_to as string,
          sectionId: req.query.section_id as string,
        };

        const data = await storage.getOperatorPerformance(filters);
        res.json({ success: true, data });
      } catch (error) {
        console.error("Operator performance error:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب أداء العمال", success: false });
      }
    },
  );

  app.post("/api/reports/production/export", requireAuth, async (req, res) => {
    try {
      const {
        format: exportFormat,
        dateFrom,
        dateTo,
        filters: reportFilters,
      } = req.body;

      if (!exportFormat || !["pdf", "excel"].includes(exportFormat)) {
        return res.status(400).json({
          message: "صيغة التصدير غير صالحة (pdf أو excel)",
          success: false,
        });
      }

      const baseFilters = {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        customerId: reportFilters?.customerId,
        productId: reportFilters?.productId,
        status: reportFilters?.status,
        sectionId: reportFilters?.sectionId,
        machineId: reportFilters?.machineId,
        operatorId: reportFilters?.operatorId
          ? parseInt(reportFilters.operatorId)
          : undefined,
      };

      const [
        summaryData,
        dateData,
        productData,
        wasteData,
        machineData,
        operatorData,
      ] = await Promise.all([
        storage.getProductionSummary(baseFilters).catch(() => null),
        storage.getProductionByDate(baseFilters).catch(() => []),
        storage.getProductionByProduct(baseFilters).catch(() => []),
        storage.getWasteAnalysis(baseFilters).catch(() => []),
        storage.getMachinePerformance(baseFilters).catch(() => []),
        storage.getOperatorPerformance(baseFilters).catch(() => []),
      ]);

      const periodText =
        dateFrom && dateTo
          ? `${dateFrom} — ${dateTo}`
          : new Date().toLocaleDateString("en-US");

      if (exportFormat === "excel") {
        const ExcelJS = (await import("exceljs")).default;
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "MPBF Manufacturing System";
        workbook.created = new Date();

        const headerStyle: Partial<ExcelJS.Style> = {
          font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2563EB" },
          },
          alignment: { horizontal: "center", vertical: "middle" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };

        const dataStyle: Partial<ExcelJS.Style> = {
          border: {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          },
          alignment: { vertical: "middle" },
        };

        const addSheetWithData = (
          name: string,
          headers: { key: string; label: string; width?: number }[],
          data: any[],
        ) => {
          const sheet = workbook.addWorksheet(name, {
            views: [{ rightToLeft: true }],
          });

          sheet.mergeCells(1, 1, 1, headers.length);
          const titleCell = sheet.getCell(1, 1);
          titleCell.value = `تقرير الإنتاج - ${name}`;
          titleCell.font = { bold: true, size: 14 };
          titleCell.alignment = { horizontal: "center" };

          sheet.mergeCells(2, 1, 2, headers.length);
          const periodCell = sheet.getCell(2, 1);
          periodCell.value = `الفترة: ${periodText}`;
          periodCell.font = { size: 10, color: { argb: "FF666666" } };
          periodCell.alignment = { horizontal: "center" };

          const headerRow = sheet.getRow(4);
          headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h.label;
            cell.style = headerStyle;
            sheet.getColumn(i + 1).width = h.width || 18;
          });

          data.forEach((item, rowIdx) => {
            const row = sheet.getRow(rowIdx + 5);
            headers.forEach((h, colIdx) => {
              const cell = row.getCell(colIdx + 1);
              let val = item[h.key];
              if (val === null || val === undefined) val = "";
              if (typeof val === "number") val = parseFloat(val.toFixed(2));
              cell.value = val;
              cell.style = {
                ...dataStyle,
                fill:
                  rowIdx % 2 === 0
                    ? {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFF9FAFB" },
                      }
                    : undefined,
              } as Partial<ExcelJS.Style>;
            });
          });

          return sheet;
        };

        if (summaryData) {
          const summarySheet = workbook.addWorksheet("الملخص", {
            views: [{ rightToLeft: true }],
          });
          summarySheet.mergeCells("A1:B1");
          const t = summarySheet.getCell("A1");
          t.value = "ملخص تقرير الإنتاج";
          t.font = { bold: true, size: 16 };
          t.alignment = { horizontal: "center" };

          summarySheet.mergeCells("A2:B2");
          const p = summarySheet.getCell("A2");
          p.value = `الفترة: ${periodText}`;
          p.font = { size: 10, color: { argb: "FF666666" } };
          p.alignment = { horizontal: "center" };

          const summaryRows = [
            ["إجمالي الطلبات", summaryData.totalOrders || 0],
            ["الطلبات النشطة", summaryData.activeOrders || 0],
            ["الطلبات المكتملة", summaryData.completedOrders || 0],
            ["إجمالي الرولات", summaryData.totalRolls || 0],
            [
              "إجمالي الوزن (كجم)",
              summaryData.totalWeight
                ? parseFloat(summaryData.totalWeight).toFixed(2)
                : "0",
            ],
            [
              "متوسط وقت الإنتاج (ساعة)",
              summaryData.avgProductionTime
                ? parseFloat(summaryData.avgProductionTime).toFixed(2)
                : "0",
            ],
            [
              "نسبة الهدر %",
              summaryData.wastePercentage
                ? parseFloat(summaryData.wastePercentage).toFixed(2)
                : "0",
            ],
            [
              "نسبة الإنجاز %",
              summaryData.completionRate
                ? parseFloat(summaryData.completionRate).toFixed(1)
                : "0",
            ],
          ];
          summaryRows.forEach(([label, value], i) => {
            const row = summarySheet.getRow(i + 4);
            const labelCell = row.getCell(1);
            labelCell.value = label;
            labelCell.font = { bold: true, size: 11 };
            if (dataStyle.border) labelCell.border = dataStyle.border;
            const valCell = row.getCell(2);
            valCell.value = value;
            valCell.font = { size: 11 };
            if (dataStyle.border) valCell.border = dataStyle.border;
            valCell.alignment = { horizontal: "center" };
            if (i % 2 === 0) {
              labelCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF0F9FF" },
              };
              valCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF0F9FF" },
              };
            }
          });
          summarySheet.getColumn(1).width = 30;
          summarySheet.getColumn(2).width = 20;
        }

        if (Array.isArray(dateData) && dateData.length > 0) {
          addSheetWithData(
            "الإنتاج اليومي",
            [
              { key: "date", label: "التاريخ", width: 15 },
              { key: "total_orders", label: "عدد الطلبات", width: 14 },
              { key: "total_rolls", label: "عدد الرولات", width: 14 },
              { key: "total_weight", label: "الوزن (كجم)", width: 14 },
              { key: "total_waste", label: "الهدر (كجم)", width: 14 },
              { key: "waste_percentage", label: "نسبة الهدر %", width: 14 },
            ],
            dateData,
          );
        }

        if (Array.isArray(productData) && productData.length > 0) {
          const productHeaders = Object.keys(productData[0]).map((k) => ({
            key: k,
            label: k,
            width: 18,
          }));
          addSheetWithData("حسب المنتج", productHeaders, productData);
        }

        if (Array.isArray(wasteData) && wasteData.length > 0) {
          const wasteHeaders = Object.keys(wasteData[0]).map((k) => ({
            key: k,
            label: k,
            width: 18,
          }));
          addSheetWithData("تحليل الهدر", wasteHeaders, wasteData);
        }

        if (Array.isArray(machineData) && machineData.length > 0) {
          const machineHeaders = Object.keys(machineData[0]).map((k) => ({
            key: k,
            label: k,
            width: 18,
          }));
          addSheetWithData("أداء المكائن", machineHeaders, machineData);
        }

        if (Array.isArray(operatorData) && operatorData.length > 0) {
          const operatorHeaders = Object.keys(operatorData[0]).map((k) => ({
            key: k,
            label: k,
            width: 18,
          }));
          addSheetWithData("أداء المشغلين", operatorHeaders, operatorData);
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `Production_Report_${dateFrom || "all"}_${dateTo || "all"}.xlsx`;
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        return res.send(Buffer.from(buffer as ArrayBuffer));
      }

      if (exportFormat === "pdf") {
        const PDFDocument = (await import("pdfkit")).default;
        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margin: 40,
        });
        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        const pdfReady = new Promise<Buffer>((resolve) => {
          doc.on("end", () => resolve(Buffer.concat(chunks)));
        });

        const drawTableHeader = (
          headers: string[],
          colWidths: number[],
          startX: number,
        ) => {
          const y = doc.y;
          doc
            .rect(
              startX,
              y,
              colWidths.reduce((a, b) => a + b, 0),
              18,
            )
            .fill("#2563EB");
          doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);
          let x = startX;
          headers.forEach((h, i) => {
            doc.text(h, x + 2, y + 4, {
              width: colWidths[i] - 4,
              align: "center",
              lineBreak: false,
            });
            x += colWidths[i];
          });
          doc.fillColor("#000000");
          doc.y = y + 20;
        };

        const drawTableRow = (
          values: string[],
          colWidths: number[],
          startX: number,
          isAlt: boolean,
        ) => {
          let y = doc.y;
          if (y > doc.page.height - 50) {
            doc.addPage();
            y = 40;
          }
          if (isAlt) {
            doc
              .rect(
                startX,
                y,
                colWidths.reduce((a, b) => a + b, 0),
                14,
              )
              .fill("#F3F4F6");
            doc.fillColor("#000000");
          }
          doc.font("Helvetica").fontSize(7);
          let x = startX;
          values.forEach((v, i) => {
            doc.text(String(v ?? ""), x + 2, y + 3, {
              width: colWidths[i] - 4,
              align: "center",
              lineBreak: false,
            });
            x += colWidths[i];
          });
          doc.y = y + 15;
        };

        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .text("Production Report", { align: "center" });
        doc.moveDown(0.3);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`Period: ${periodText}`, { align: "center" });
        doc
          .fontSize(8)
          .text(`Generated: ${new Date().toLocaleString("en-US")}`, {
            align: "center",
          });
        doc.moveDown(1);

        if (summaryData) {
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text("Summary", { align: "left" });
          doc.moveDown(0.3);
          const summaryItems = [
            ["Total Orders", String(summaryData.totalOrders || 0)],
            ["Active Orders", String(summaryData.activeOrders || 0)],
            ["Completed Orders", String(summaryData.completedOrders || 0)],
            ["Total Rolls", String(summaryData.totalRolls || 0)],
            [
              "Total Weight (kg)",
              summaryData.totalWeight
                ? parseFloat(summaryData.totalWeight).toFixed(2)
                : "0",
            ],
            [
              "Avg Production Time (hr)",
              summaryData.avgProductionTime
                ? parseFloat(summaryData.avgProductionTime).toFixed(2)
                : "0",
            ],
            [
              "Waste %",
              summaryData.wastePercentage
                ? parseFloat(summaryData.wastePercentage).toFixed(2) + "%"
                : "0%",
            ],
            [
              "Completion Rate",
              summaryData.completionRate
                ? parseFloat(summaryData.completionRate).toFixed(1) + "%"
                : "0%",
            ],
          ];
          doc.font("Helvetica").fontSize(9);
          summaryItems.forEach(([label, val]) => {
            doc.text(`${label}: ${val}`, 40, doc.y, { continued: false });
          });
          doc.moveDown(1);
        }

        const addDataTable = (title: string, data: any[]) => {
          if (!Array.isArray(data) || data.length === 0) return;
          if (doc.y > doc.page.height - 120) doc.addPage();
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(title, { align: "left" });
          doc.moveDown(0.3);
          const headers = Object.keys(data[0]);
          const tableWidth = doc.page.width - 80;
          const colWidths = headers.map(() => tableWidth / headers.length);
          drawTableHeader(headers, colWidths, 40);
          data.forEach((item, idx) => {
            const values = headers.map((h) => {
              const v = item[h];
              if (v === null || v === undefined) return "";
              if (typeof v === "number") return v.toFixed(2);
              return String(v);
            });
            drawTableRow(values, colWidths, 40, idx % 2 === 1);
          });
          doc.moveDown(0.5);
        };

        addDataTable("Daily Production", dateData as any[]);
        addDataTable("Production by Product", productData as any[]);
        addDataTable("Waste Analysis", wasteData as any[]);
        addDataTable("Machine Performance", machineData as any[]);
        addDataTable("Operator Performance", operatorData as any[]);

        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);
          doc.fontSize(7).font("Helvetica").fillColor("#999999");
          doc.text(
            `Page ${i + 1} of ${totalPages} | MPBF Manufacturing System`,
            40,
            doc.page.height - 25,
            { align: "center", width: doc.page.width - 80 },
          );
          doc.fillColor("#000000");
        }

        doc.end();
        const pdfBuffer = await pdfReady;
        const filename = `Production_Report_${dateFrom || "all"}_${dateTo || "all"}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        return res.send(pdfBuffer);
      }

      res.status(400).json({ message: "صيغة غير مدعومة", success: false });
    } catch (error: any) {
      console.error("Production report export error:", error);
      res
        .status(500)
        .json({ message: "خطأ في تصدير تقرير الإنتاج", success: false });
    }
  });

  // Export Report with real PDF/Excel generation
  app.post("/api/reports/export", requireAuth, async (req, res) => {
    try {
      const { format, date_from, date_to, filters } = req.body;
      const report_type =
        typeof req.body.report_type === "string"
          ? req.body.report_type.trim().toLowerCase()
          : req.body.report_type;

      if (!report_type || !format) {
        return res.status(400).json({
          message: "نوع التقرير والصيغة مطلوبان",
          success: false,
        });
      }

      let reportData;
      let reportTitle = "";
      switch (report_type) {
        case "orders":
        case "production":
          reportData = await storage.getOrderReports({
            dateFrom: date_from,
            dateTo: date_to,
          });
          reportTitle =
            report_type === "production" ? "تقرير الإنتاج" : "تقرير الطلبات";
          break;
        case "advanced-metrics":
        case "quality":
          reportData = await storage.getAdvancedMetrics();
          reportTitle =
            report_type === "quality"
              ? "تقرير الجودة"
              : "تقرير المقاييس المتقدمة";
          break;
        case "hr":
          reportData = await storage.getHRReports({
            dateFrom: date_from,
            dateTo: date_to,
          });
          reportTitle = "تقرير الموارد البشرية";
          break;
        case "maintenance":
          reportData = await storage.getMaintenanceReports();
          reportTitle = "تقرير الصيانة";
          break;
        case "financial": {
          const [finOrders, finMetrics] = await Promise.all([
            storage.getOrderReports({ dateFrom: date_from, dateTo: date_to }),
            storage.getAdvancedMetrics(),
          ]);
          reportData = { orders: finOrders, metrics: finMetrics };
          reportTitle = "التقرير المالي";
          break;
        }
        default:
          return res.status(400).json({
            message: "نوع التقرير غير صحيح",
            success: false,
          });
      }

      if (format === "json") {
        const exportData = {
          report_type,
          format,
          generated_at: new Date().toISOString(),
          date_range: { from: date_from, to: date_to },
          filters,
          data: reportData,
        };
        return res.json({ success: true, data: exportData });
      }

      if (format === "excel") {
        const ExcelJS = (await import("exceljs")).default;
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "نظام إدارة الطلبات";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet(reportTitle, {
          views: [{ rightToLeft: true }],
        });

        const flatData = Array.isArray(reportData)
          ? reportData
          : typeof reportData === "object" && reportData !== null
            ? Object.entries(reportData).map(([key, value]) => {
                if (
                  typeof value === "object" &&
                  value !== null &&
                  !Array.isArray(value)
                ) {
                  return {
                    المفتاح: key,
                    ...(value as Record<string, unknown>),
                  };
                }
                return { المفتاح: key, القيمة: value };
              })
            : [{ البيانات: reportData }];

        if (flatData.length > 0) {
          const headers = Object.keys(flatData[0] as Record<string, unknown>);
          const headerRow = sheet.addRow(headers);
          headerRow.font = { bold: true, size: 12 };
          headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4472C4" },
          };
          headerRow.font = {
            bold: true,
            color: { argb: "FFFFFFFF" },
            size: 12,
          };

          for (const item of flatData) {
            const row = item as Record<string, unknown>;
            sheet.addRow(
              headers.map((h) => {
                const val = row[h];
                if (val === null || val === undefined) return "";
                if (typeof val === "object") return JSON.stringify(val);
                return val;
              }),
            );
          }

          headers.forEach((_, i) => {
            const col = sheet.getColumn(i + 1);
            col.width = 20;
          });
        }

        sheet.addRow([]);
        sheet.addRow([
          `تاريخ التقرير: ${new Date().toLocaleDateString("en-US")}`,
        ]);
        if (date_from && date_to) {
          sheet.addRow([`الفترة: من ${date_from} إلى ${date_to}`]);
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `${report_type}-${Date.now()}.xlsx`;
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        return res.send(Buffer.from(buffer as ArrayBuffer));
      }

      if (format === "pdf") {
        const PDFDocument = (await import("pdfkit")).default;

        const flatData = Array.isArray(reportData)
          ? reportData
          : typeof reportData === "object" && reportData !== null
            ? Object.entries(reportData).map(([key, value]) => {
                if (
                  typeof value === "object" &&
                  value !== null &&
                  !Array.isArray(value)
                ) {
                  return { key, ...(value as Record<string, unknown>) };
                }
                return { key, value };
              })
            : [{ data: reportData }];

        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margin: 40,
        });
        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));

        const pdfReady = new Promise<Buffer>((resolve) => {
          doc.on("end", () => resolve(Buffer.concat(chunks)));
        });

        doc.fontSize(16).text(reportTitle, { align: "center" });
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .text(
            `Report Date: ${new Date().toLocaleDateString("en-US")}${date_from && date_to ? ` | Period: ${date_from} to ${date_to}` : ""}`,
            { align: "center" },
          );
        doc.moveDown(1);

        if (flatData.length > 0) {
          const headers = Object.keys(flatData[0] as Record<string, unknown>);
          const tableWidth = doc.page.width - 80;
          const colWidth = tableWidth / headers.length;
          const startX = 40;
          let y = doc.y;
          const fontSize = headers.length > 6 ? 6 : 8;

          doc.fontSize(fontSize).font("Helvetica-Bold");
          headers.forEach((header, i) => {
            doc.text(String(header), startX + i * colWidth, y, {
              width: colWidth - 2,
              align: "left",
              lineBreak: false,
            });
          });

          y += 16;
          doc
            .moveTo(startX, y)
            .lineTo(startX + tableWidth, y)
            .stroke();
          y += 4;
          doc.font("Helvetica").fontSize(fontSize > 6 ? 7 : 5.5);

          for (const item of flatData) {
            if (y > doc.page.height - 60) {
              doc.addPage();
              y = 40;
            }
            const row = item as Record<string, unknown>;
            headers.forEach((h, i) => {
              let val = row[h];
              if (val === null || val === undefined) val = "";
              if (typeof val === "object") val = JSON.stringify(val);
              doc.text(String(val), startX + i * colWidth, y, {
                width: colWidth - 2,
                align: "left",
                lineBreak: false,
              });
            });
            y += 12;
          }
        } else {
          doc.fontSize(12).text("No data available", { align: "center" });
        }

        doc.end();
        const pdfBuffer = await pdfReady;
        const filename = `${report_type}-${Date.now()}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        return res.send(pdfBuffer);
      }

      if (format === "csv") {
        const flatData = Array.isArray(reportData)
          ? reportData
          : typeof reportData === "object" && reportData !== null
            ? Object.entries(reportData).map(([key, value]) => {
                if (
                  typeof value === "object" &&
                  value !== null &&
                  !Array.isArray(value)
                ) {
                  return { key, ...(value as Record<string, unknown>) };
                }
                return { key, value };
              })
            : [{ data: reportData }];

        if (flatData.length === 0) {
          return res
            .status(404)
            .json({ message: "لا توجد بيانات للتصدير", success: false });
        }

        const headers = Object.keys(flatData[0] as Record<string, unknown>);
        const csvRows = [headers.join(",")];
        for (const item of flatData) {
          const row = item as Record<string, unknown>;
          csvRows.push(
            headers
              .map((h) => {
                const val = row[h];
                if (val === null || val === undefined) return "";
                const str =
                  typeof val === "object" ? JSON.stringify(val) : String(val);
                return str.includes(",") || str.includes('"')
                  ? `"${str.replace(/"/g, '""')}"`
                  : str;
              })
              .join(","),
          );
        }

        const csvContent = "\uFEFF" + csvRows.join("\n");
        const filename = `${report_type}-${Date.now()}.csv`;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        return res.send(csvContent);
      }

      return res.status(400).json({
        message: "صيغة التصدير غير مدعومة. الصيغ المتاحة: json, excel, csv",
        success: false,
      });
    } catch (error) {
      console.error("Export report error:", error);
      res.status(500).json({
        message: "خطأ في تصدير التقرير",
        success: false,
      });
    }
  });

  // Adobe PDF Generation API
  app.post("/api/pdf/generate", requireAuth, async (req, res) => {
    try {
      const {
        isAdobePDFConfigured,
        mergeDocumentToPDF,
        generatePDFFromTemplate,
      } = await import("../services/adobe-pdf/pdf-service");

      if (!isAdobePDFConfigured()) {
        return res
          .status(503)
          .json({ message: "خدمة Adobe PDF غير مهيأة", success: false });
      }

      const {
        templateName,
        templatePath,
        jsonData,
        outputFormat = "pdf",
      } = req.body;

      if (!jsonData || typeof jsonData !== "object") {
        return res
          .status(400)
          .json({ message: "بيانات JSON مطلوبة", success: false });
      }

      let pdfBuffer: Buffer;

      if (templateName) {
        pdfBuffer = await generatePDFFromTemplate(
          templateName,
          jsonData,
          outputFormat,
        );
      } else if (templatePath) {
        const path = await import("path");
        const templatesDir = path.resolve(
          process.cwd(),
          "server",
          "services",
          "adobe-pdf",
          "templates",
        );
        const resolvedTemplatePath = path.resolve(
          templatesDir,
          String(templatePath),
        );
        if (
          resolvedTemplatePath !== templatesDir &&
          !resolvedTemplatePath.startsWith(templatesDir + path.sep)
        ) {
          return res
            .status(400)
            .json({ message: "مسار القالب غير صالح", success: false });
        }
        pdfBuffer = await mergeDocumentToPDF({
          templatePath: resolvedTemplatePath,
          jsonData,
          outputFormat,
        });
      } else {
        return res
          .status(400)
          .json({ message: "اسم القالب أو مسار القالب مطلوب", success: false });
      }

      const contentType =
        outputFormat === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const ext = outputFormat === "pdf" ? "pdf" : "docx";

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="document.${ext}"`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({
        message: "خطأ في إنشاء ملف PDF",
        success: false,
      });
    }
  });

  app.get("/api/pdf/status", requireAuth, async (req, res) => {
    try {
      const { isAdobePDFConfigured } =
        await import("../services/adobe-pdf/pdf-service");
      res.json({
        configured: isAdobePDFConfigured(),
        service: "Adobe Document Generation API",
        success: true,
      });
    } catch (error) {
      res.json({ configured: false, success: false });
    }
  });

  app.get("/api/pdf/templates", requireAuth, async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const templatesDir = path.join(
        process.cwd(),
        "server",
        "services",
        "adobe-pdf",
        "templates",
      );

      try {
        await fs.access(templatesDir);
      } catch {
        return res.json({ templates: [], success: true });
      }

      const files = (await fs.readdir(templatesDir)).filter((f: string) =>
        f.endsWith(".docx"),
      );
      res.json({ templates: files, success: true });
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب القوالب", success: false });
    }
  });

  // Translation API for customer names
  app.post("/api/translate-name", requireAuth, async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text || !targetLanguage) {
        return res
          .status(400)
          .json({ message: "النص واللغة المستهدفة مطلوبان" });
      }

      const normalizedText =
        targetLanguage === "ar"
          ? String(text).trim().toLowerCase()
          : String(text).trim();
      const cacheKey = `${targetLanguage}:${normalizedText}`;
      const cached = translateNameCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        translateNameCache.delete(cacheKey);
        translateNameCache.set(cacheKey, cached);
        return res.json({ translatedText: cached.translatedText });
      }
      if (cached) translateNameCache.delete(cacheKey);

      // Shared OpenAI client (created once, reused across requests)
      const openai = await getTranslateOpenAIClient();

      const prompt =
        targetLanguage === "en"
          ? `Translate the meaning of the following Arabic name/word to English. Provide ONLY the English meaning translation, without quotes, parentheses, or any extra explanation.

Examples:
- "سيارة" → Car
- "بيت الأسعار" → Price House
- "شركة النور" → Al-Noor Company

If the input is a proper name with no clear meaning (e.g. a person's name), provide the closest English transliteration instead.

Input: ${text}`
          : `For the English name "${text}", provide both the Arabic transliteration AND the Arabic meaning, in this exact format:

"[transliteration]" [meaning]

- Put the transliteration (how it sounds in Arabic letters) inside double quotes first.
- Then a single space, then the Arabic meaning translation.
- No extra text, no explanations, no parentheses.

Examples:
- "Car" → "كار" سيارة
- "Price House" → "برايس هاوس" بيت الأسعار
- "Sun" → "سن" شمس

If the input is a proper name with no clear meaning (e.g. a person's name like "John"), provide only the Arabic transliteration in double quotes.

Input: ${text}`;

      const systemContent =
        targetLanguage === "en"
          ? "You are a professional Arabic-to-English translator. You translate the MEANING of Arabic words/names to English (not transliteration). Examples: سيارة = Car, بيت = House. Only provide the English translation directly, without quotes or extra text."
          : 'You are a professional English-to-Arabic translator for business names. You output the format: "<transliteration>" <meaning>. The transliteration goes inside double quotes, followed by a space, then the Arabic meaning. Example: Car → "كار" سيارة. Do not add any other text.';

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemContent,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        // Short translations need few tokens; lower cap reduces latency.
        max_tokens: 60,
      });

      let translatedText = response.choices[0]?.message?.content?.trim() || "";
      if (targetLanguage === "en") {
        // English output: strip any stray surrounding quotes
        translatedText = translatedText.replace(/^["']|["']$/g, "").trim();
      } else {
        // Arabic output uses the format: "<transliteration>" <meaning>.
        // The leading quote is intentional, so only strip a stray trailing
        // quote if it has no matching opening quote.
        translatedText = translatedText.trim();
        const dq = (translatedText.match(/"/g) || []).length;
        if (dq % 2 !== 0 && translatedText.endsWith('"')) {
          translatedText = translatedText.slice(0, -1).trim();
        }
      }

      if (translatedText) {
        if (translateNameCache.size >= TRANSLATE_NAME_CACHE_MAX) {
          const firstKey = translateNameCache.keys().next().value;
          if (firstKey !== undefined) translateNameCache.delete(firstKey);
        }
        translateNameCache.set(cacheKey, {
          translatedText,
          expiresAt: Date.now() + TRANSLATE_NAME_CACHE_TTL_MS,
        });
      }

      res.json({ translatedText });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({
        message: "خطأ في الترجمة",
        error: "خطأ داخلي",
      });
    }
  });

  // Reports endpoint
  app.get("/api/reports", requireAuth, async (req, res) => {
    try {
      const reports: any[] = []; // Placeholder for reports data
      res.json(reports);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب التقارير" });
    }
  });

  app.post(
    "/api/parse-excel",
    requireAdmin,
    excelUpload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "لم يتم رفع أي ملف" });
        }
        const ext = req.file.originalname.split(".").pop()?.toLowerCase();
        if (ext !== "xlsx") {
          return res.status(400).json({ message: "يُقبل فقط ملفات .xlsx" });
        }
        const rows = await parseExcelBuffer(req.file.buffer);
        if (rows.length === 0) {
          return res.status(400).json({ message: "الملف فارغ" });
        }
        const headers = Object.keys(rows[0]);
        return res.json({ headers, data: rows });
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        return res.status(500).json({ message: "فشل قراءة ملف Excel" });
      }
    },
  );
}
