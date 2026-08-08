import type { Express, Request } from "express";

import crypto from "crypto";
import { createServer, type Server } from "http";

import bcrypt from "bcrypt";
import { storage } from "./storage";
import { db } from "./db";

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
import { invalidateLetterheadCache } from "./modern-agent/letterhead";
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
} from "./routes/alerts";
import { getSystemHealthMonitor } from "./services/system-health-monitor";
import { getAlertManager } from "./services/alert-manager";
import { getDataValidator } from "./services/data-validator";
import QRCode from "qrcode";
import { validateRequest, commonSchemas } from "./middleware/validation";
import { calculateProductionQuantities } from "@shared/quantity-utils";
import ExcelJS from "exceljs";
import multer from "multer";

import { resolveSessionUser } from "./auth/sessionUser";
import {
  createPerformanceIndexes,
  createTextSearchIndexes,
} from "./database-optimizations";
import { logger } from "./lib/logger";
import {
  requireAuth,
  requirePermission,
  requireAdmin,
  type AuthRequest,
} from "./middleware/auth";
import {
  generateMobileToken,
  revokeMobileToken,
  invalidateRolesCache,
  invalidateUserCache,
  getCachedRoles,
  createMobileSession,
  refreshMobileSession,
  revokeMobileSession,
} from "./middleware/session-auth";
import {
  setupAuth,
  isAuthenticated as isAuthenticatedReplit,
} from "./replitAuth";
import {
  getNotificationManager,
  type SystemNotificationData,
} from "./services/notification-manager";
import { NotificationService } from "./services/notification-service";
import { TaqnyatSMSService } from "./services/taqnyat-sms";
import {
  translateAnnouncement,
  ensureAnnouncementTranslations,
} from "./services/announcement-translation";
import { setNotificationManager } from "./storage";
import {
  notificationService,
  taqnyatSMS,
  notificationManagerHolder,
} from "./routes/shared";
import { registerSystemRoutes } from "./routes/system";
import { registerUsersRoutes } from "./routes/users";
import { registerReportsRoutes } from "./routes/reports";
import { registerNotificationsRoutes } from "./routes/notifications";
import { registerOrdersRoutes } from "./routes/orders";
import { registerProductionRoutes } from "./routes/production";
import { registerMachinesRoutes } from "./routes/machines";
import { registerMiscRoutes } from "./routes/misc";
import { registerWarehouseRoutes } from "./routes/warehouse";
import { registerMixingRoutes } from "./routes/mixing";
import { registerHrRoutes } from "./routes/hr";
import { registerMaintenanceRoutes } from "./routes/maintenance";
import { registerQualityRoutes } from "./routes/quality";
import { registerMobileRoutes } from "./routes/mobile";
import { registerLegacyRoutes } from "./routes/legacy";
import { registerAdminRoutes } from "./routes/admin";

// Orchestrator: the original 20,000-line registerRoutes was split into domain
// modules under server/routes/ (see server/routes/README.md). Shared
// module-level helpers live in server/routes/shared.ts; values created inside
// registerRoutes are passed to each domain module through `ctx`.
export async function registerRoutes(
  app: Express,
  existingServer?: Server,
): Promise<Server> {
  const ctx: any = {};

  // Setup Replit Auth (OpenID Connect)
  await setupAuth(app);

  // Register quote & quote-template routes
  const { registerQuoteRoutes } = await import("./quote-routes");
  registerQuoteRoutes(app);

  // Register MCP OAuth 2.1 routes (must be before MCP routes)
  const { registerMcpOAuthRoutes } = await import("./mcp-oauth");
  registerMcpOAuthRoutes(app);

  // Register MCP server routes
  const { registerMcpRoutes } = await import("./mcp-routes");
  registerMcpRoutes(app);

  // Register Modern AI Agent routes
  const { registerModernAgentRoutes } = await import("./modern-agent/routes");
  registerModernAgentRoutes(app);

  // Register External SQL Server connection routes (READ-ONLY browsing)
  const { registerExternalDbRoutes } = await import("./external-db/routes");
  registerExternalDbRoutes(app);

  const { registerMaintenanceEngineerRoutes } = await import(
    "./maintenance-engineer"
  );
  registerMaintenanceEngineerRoutes(app);

  // Register Object Storage routes (serves /objects/* for uploaded files)
  const { registerObjectStorageRoutes } =
    await import("./replit_integrations/object_storage");
  registerObjectStorageRoutes(app);

  // ==========================================================================
  // PUBLIC: Mobile bag-design quote endpoint (no auth required)
  // Used by /mpbf public mobile page on the company website.
  // ==========================================================================

  // Simple in-memory rate limiter for the public endpoint:
  // max 5 requests per IP per 10 minutes, max 30 requests globally per minute
  const bagQuoteIpHits = new Map<string, number[]>();
  const bagQuoteGlobalHits: number[] = [];
  const IP_WINDOW_MS = 10 * 60 * 1000;
  const IP_MAX = 5;
  const GLOBAL_WINDOW_MS = 60 * 1000;
  const GLOBAL_MAX = 30;

  // Normalize a Saudi/international phone number to E.164-ish form
  function normalizePhoneServer(raw: string): string {
    const trimmed = (raw || "").replace(/[\s\-()]/g, "");
    if (/^05\d{8}$/.test(trimmed)) return "+966" + trimmed.slice(1);
    if (/^5\d{8}$/.test(trimmed)) return "+966" + trimmed;
    if (/^00\d{8,15}$/.test(trimmed)) return "+" + trimmed.slice(2);
    if (/^\+\d{8,15}$/.test(trimmed)) return trimmed;
    if (/^\d{8,15}$/.test(trimmed)) return "+" + trimmed;
    return ""; // invalid
  }

  const webLoginAttempts = new Map<
    string,
    { count: number; lastAttempt: number }
  >();
  const WEB_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
  const WEB_MAX_ATTEMPTS = 10;
  const WEB_RATE_LIMIT_MAX_ENTRIES = 10000;

  setInterval(
    () => {
      const now = Date.now();
      for (const [key, value] of webLoginAttempts) {
        if (now - value.lastAttempt > WEB_RATE_LIMIT_WINDOW_MS) {
          webLoginAttempts.delete(key);
        }
      }
      if (webLoginAttempts.size > WEB_RATE_LIMIT_MAX_ENTRIES) {
        const entries = [...webLoginAttempts.entries()].sort(
          (a, b) => a[1].lastAttempt - b[1].lastAttempt,
        );
        const toRemove = entries.slice(
          0,
          entries.length - WEB_RATE_LIMIT_MAX_ENTRIES,
        );
        for (const [key] of toRemove) {
          webLoginAttempts.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );

  // Change password (used for forced first-login password change and self-service updates)
  const changePasswordAttempts = new Map<
    number,
    { count: number; lastAttempt: number }
  >();
  const CHANGE_PW_WINDOW_MS = 15 * 60 * 1000;
  const CHANGE_PW_MAX_ATTEMPTS = 10;

  // Resolve + validate inline-printing fields for a roll being created on a
  // combined extruder+printer machine. Returns the field overrides to merge
  // into the roll insert (stage/printed_at/printing_machine_id/printed_by), or
  // an empty object when inline printing was not requested. Throws a 400-style
  // error (status + userMessage) when the request is invalid; both roll-create
  // routes surface that message to the operator.
  const resolveInlinePrintedFields = async (
    enabled: boolean,
    filmMachineId: string,
    productionOrderId: number,
    userId: number,
  ): Promise<Record<string, any>> => {
    if (!enabled) return {};

    const [info] = (
      await db.execute(sql`
        SELECT
          m.inline_printer_id AS inline_printer_id,
          COALESCE(cp.is_printed, false) AS is_printed
        FROM machines m
        LEFT JOIN production_orders po ON po.id = ${productionOrderId}
        LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
        WHERE m.id = ${filmMachineId}
      `)
    ).rows as any[];

    if (!info || !info.inline_printer_id) {
      const err: any = new Error("INLINE_NOT_SUPPORTED");
      err.status = 400;
      err.userMessage = "هذه الماكينة غير مدمجة مع طابعة إنلاين";
      throw err;
    }
    if (!info.is_printed) {
      const err: any = new Error("INLINE_NOT_PRINTED_PRODUCT");
      err.status = 400;
      err.userMessage = "الطباعة الإنلاين متاحة فقط للمنتجات المطبوعة";
      throw err;
    }

    // Use one server-side timestamp for both created_at and printed_at so the
    // rolls temporal CHECK (printed_at >= created_at) can never be violated by a
    // JS time landing a few ms before the DB default now().
    const now = new Date();
    return {
      stage: "printing",
      printing_machine_id: info.inline_printer_id,
      printed_by: userId,
      created_at: now,
      printed_at: now,
    };
  };

  // Roll creation must always start at stage='film'. insertRollSchema still
  // accepts client-supplied stage-transition fields (stage, printing/cutting
  // machine, printed_at, cut_completed_at), so a caller could otherwise submit
  // stage='printing' directly and skip the printing queue WITHOUT going through
  // the server-side inline validation in resolveInlinePrintedFields. Strip those
  // fields here and force stage='film'; only resolveInlinePrintedFields may
  // legitimately advance a freshly-created roll to stage='printing'.
  const sanitizeRollCreateInput = <T extends Record<string, any>>(
    data: T,
  ): Record<string, any> => {
    const {
      stage: _stage,
      printing_machine_id: _printingMachineId,
      cutting_machine_id: _cuttingMachineId,
      printed_at: _printedAt,
      cut_completed_at: _cutCompletedAt,
      completed_at: _completedAt,
      ...rest
    } = data as any;
    return { ...rest, stage: "film" };
  };

  // Normalize machine type-specific dimensional fields:
  // empty/blank decimal fields -> null; max_print_colors -> integer or null.
  function cleanMachineDimensionFields(body: any): Record<string, any> {
    const toNullableDecimal = (v: any) =>
      v === "" || v === null || v === undefined ? null : v;
    const result: Record<string, any> = {};
    const decimalFields = [
      "min_width_cm",
      "max_width_cm",
      "min_thickness",
      "max_thickness",
      "min_cylinder_inch",
      "max_cylinder_inch",
      "min_length_cm",
      "max_length_cm",
      "width_cm",
      "length_cm",
      "height_cm",
      "weight_kg",
    ];
    for (const f of decimalFields) {
      if (f in body) result[f] = toNullableDecimal(body[f]);
    }
    if ("manufacture_date" in body) {
      result.manufacture_date = toNullableDecimal(body.manufacture_date);
    }
    if ("max_print_colors" in body) {
      const raw = body.max_print_colors;
      if (raw === "" || raw === null || raw === undefined) {
        result.max_print_colors = null;
      } else {
        const parsed = parseInt(String(raw), 10);
        result.max_print_colors = Number.isNaN(parsed) ? null : parsed;
      }
    }
    return result;
  }

  function validateMachineDimensionRanges(
    data: Record<string, any>,
  ): string | null {
    const ranges: Array<{ min: string; max: string; label: string }> = [
      { min: "min_width_cm", max: "max_width_cm", label: "العرض" },
      { min: "min_thickness", max: "max_thickness", label: "السماكة العالمية" },
      {
        min: "min_cylinder_inch",
        max: "max_cylinder_inch",
        label: "الأسطوانة",
      },
      { min: "min_length_cm", max: "max_length_cm", label: "الطول" },
    ];
    for (const { min, max, label } of ranges) {
      const minVal = data[min];
      const maxVal = data[max];
      if (
        minVal === null ||
        minVal === undefined ||
        minVal === "" ||
        maxVal === null ||
        maxVal === undefined ||
        maxVal === ""
      ) {
        continue;
      }
      const minNum = Number(minVal);
      const maxNum = Number(maxVal);
      if (Number.isNaN(minNum) || Number.isNaN(maxNum)) continue;
      if (minNum > maxNum) {
        return `الحد الأدنى لـ${label} لا يمكن أن يكون أكبر من الحد الأقصى`;
      }
    }
    return null;
  }

  // ============ Production Queues Planning API (department-based) ============

  const VALID_QUEUE_STAGES = ["film", "printing", "cutting"];

  ctx.setupInProgress = false;
  // Simple IP-rate-limiter for the setup endpoint — max 5 attempts per IP per 15 min.
  const setupAttempts = new Map<string, { count: number; resetAt: number }>();

  ctx.companyLogoCache = null as {
    logo_url: string | null;
    expiresAt: number;
  } | null;
  const COMPANY_LOGO_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (busted on POST)
  ctx.companyLogoInFlight = null;
  // Monotonically increasing version. Each authoritative write (POST) bumps
  // this; in-flight background reads capture the version at start and refuse
  // to overwrite the cache if it has advanced (i.e. a POST happened mid-read).
  ctx.companyLogoVersion = 0;

  async function loadCompanyLogo(): Promise<string | null> {
    if (ctx.companyLogoInFlight) return ctx.companyLogoInFlight;
    const startedVersion = ctx.companyLogoVersion;
    ctx.companyLogoInFlight = (async () => {
      try {
        const [profile] = await db
          .select({ logo_url: company_profile.logo_url })
          .from(company_profile)
          .limit(1);
        const logo_url = profile?.logo_url || null;
        // Only update the cache if no POST happened during this read.
        if (ctx.companyLogoVersion === startedVersion) {
          ctx.companyLogoCache = {
            logo_url,
            expiresAt: Date.now() + COMPANY_LOGO_CACHE_TTL_MS,
          };
        }
        return logo_url;
      } finally {
        ctx.companyLogoInFlight = null;
      }
    })();
    return ctx.companyLogoInFlight;
  }

  // Pre-warm the cache so the first request after a cold start doesn't pay
  // the DB round-trip on a user-facing path. Fire-and-forget.
  loadCompanyLogo().catch((err) =>
    console.warn("Company logo pre-warm failed:", err?.message || err),
  );

  const excelUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  });

  // ============ Work Violations API (مخالفات العمل) ============

  const WV_READ = requirePermission(
    "record_work_violations",
    "view_work_violations",
    "manage_work_violations",
  );
  const WV_RECORD = requirePermission(
    "record_work_violations",
    "manage_work_violations",
  );
  const WV_MANAGE = requirePermission("manage_work_violations");

  // ============ HR Module API (Phase 2) — per-employee file tabs ============

  const HR_VIEW = requirePermission("view_hr", "manage_hr");
  const HR_CREATE = requirePermission("manage_hr", "add_hr");
  const HR_EDIT = requirePermission("manage_hr", "edit_hr");
  const HR_DELETE = requirePermission("manage_hr", "delete_hr");

  function parseEmployeeId(req: any, res: any): number | null {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ message: "معرف الموظف غير صحيح" });
      return null;
    }
    return userId;
  }

  // ============ نظام التحذيرات الذكية ============

  // تم تعطيل خدمات المراقبة والتحذيرات التلقائية بناء على طلب المستخدم
  // الإشعارات من نوع system لن يتم إرسالها بعد الآن
  // const healthMonitor = getSystemHealthMonitor(storage);
  // const alertManager = getAlertManager(storage);
  const dataValidator = getDataValidator(storage);

  // ==========================================
  // Mobile API - Token-based Authentication
  // ==========================================

  const mobileLoginAttempts = new Map<
    string,
    { count: number; lastAttempt: number }
  >();
  const MOBILE_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
  const MOBILE_MAX_ATTEMPTS = 10;

  setInterval(
    () => {
      const now = Date.now();
      for (const [key, value] of mobileLoginAttempts) {
        if (now - value.lastAttempt > MOBILE_RATE_LIMIT_WINDOW_MS) {
          mobileLoginAttempts.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );

  // ===== Legacy database (read-only reference) =====
  // Reads from a separate, older PostgreSQL database for reference only.
  // No write/update/delete endpoints are exposed.
  const { getLegacyPool, isLegacyDbConfigured } = await import("./legacy-db");

  // Short-lived in-memory cache for unfiltered total counts on the legacy
  // customer_products endpoint. The base table is large and the count is
  // stable on the scale of seconds, so a 60s TTL avoids repeated scans.
  const legacyCountCache = new Map<
    string,
    { total: number; expiresAt: number }
  >();

  // ============ DELIVERY MANIFESTS (Admin Tools) ============
  const deliveryStopSchema = z.object({
    id: z.string().optional(),
    customerId: z.string().max(100).optional().default(""),
    customerName: z.string().max(200).optional().default(""),
    contactPhone: z.string().max(50).optional().default(""),
    inChargeName: z.string().max(200).optional().default(""),
    notes: z.string().max(2000).optional().default(""),
    imageDataUrl: z.string().max(2_000_000).optional().default(""),
    zone: z.number().int().min(1).max(20),
  });
  const deliveryManifestPayloadSchema = insertDeliveryManifestSchema.extend({
    reference: z.string().min(1).max(50),
    stops: z.array(deliveryStopSchema).max(50),
  });

  function parseManifestId(raw: string, res: any): number | null {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "معرف الكشف غير صحيح" });
      return null;
    }
    return id;
  }

  // ============ ADMIN TOOL DOCUMENTS (generic CRUD) ============
  const ADMIN_DOC_TYPES = [
    "delivery_disclaimer",
    "admin_order",
    "custom_report",
    "meeting_minutes",
    "asset_handover",
    "salary_calc",
    "violation_notice",
    "cash_voucher",
  ] as const;

  const adminToolDocPayloadSchema = insertAdminToolDocumentSchema.extend({
    doc_type: z.enum(ADMIN_DOC_TYPES),
    reference: z.string().min(1).max(100),
    title: z.string().max(300).nullable().optional(),
    data: z.record(z.any()),
  });

  function parseAdminDocId(raw: string, res: any): number | null {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "معرف المستند غير صحيح" });
      return null;
    }
    return id;
  }

  const httpServer = existingServer || createServer(app);
  Object.assign(ctx, { registerQuoteRoutes, registerMcpOAuthRoutes, registerMcpRoutes, registerModernAgentRoutes, registerExternalDbRoutes, registerMaintenanceEngineerRoutes, registerObjectStorageRoutes, bagQuoteIpHits, bagQuoteGlobalHits, IP_WINDOW_MS, IP_MAX, GLOBAL_WINDOW_MS, GLOBAL_MAX, normalizePhoneServer, webLoginAttempts, WEB_RATE_LIMIT_WINDOW_MS, WEB_MAX_ATTEMPTS, WEB_RATE_LIMIT_MAX_ENTRIES, changePasswordAttempts, CHANGE_PW_WINDOW_MS, CHANGE_PW_MAX_ATTEMPTS, resolveInlinePrintedFields, sanitizeRollCreateInput, cleanMachineDimensionFields, validateMachineDimensionRanges, VALID_QUEUE_STAGES, setupAttempts, COMPANY_LOGO_CACHE_TTL_MS, loadCompanyLogo, excelUpload, WV_READ, WV_RECORD, WV_MANAGE, HR_VIEW, HR_CREATE, HR_EDIT, HR_DELETE, parseEmployeeId, dataValidator, mobileLoginAttempts, MOBILE_RATE_LIMIT_WINDOW_MS, MOBILE_MAX_ATTEMPTS, getLegacyPool, isLegacyDbConfigured, legacyCountCache, deliveryStopSchema, deliveryManifestPayloadSchema, parseManifestId, ADMIN_DOC_TYPES, adminToolDocPayloadSchema, parseAdminDocId });

  await registerSystemRoutes(app, ctx);
  await registerUsersRoutes(app, ctx);
  await registerReportsRoutes(app, ctx);
  await registerNotificationsRoutes(app, ctx);
  await registerOrdersRoutes(app, ctx);
  await registerProductionRoutes(app, ctx);
  await registerMachinesRoutes(app, ctx);
  await registerMiscRoutes(app, ctx);
  await registerWarehouseRoutes(app, ctx);
  await registerMixingRoutes(app, ctx);
  await registerHrRoutes(app, ctx);
  await registerMaintenanceRoutes(app, ctx);
  await registerQualityRoutes(app, ctx);
  await registerMobileRoutes(app, ctx);
  await registerLegacyRoutes(app, ctx);
  await registerAdminRoutes(app, ctx);


  return httpServer;}
