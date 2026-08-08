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
export async function registerProductionMonitoringRoutes(app: Express, ctx: any) {
  const {
    resolveInlinePrintedFields,
    sanitizeRollCreateInput,
    VALID_QUEUE_STAGES,
    dataValidator,
  } = ctx;

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
