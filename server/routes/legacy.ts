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
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerLegacyRoutes(app: Express, ctx: any) {
  const {
    getLegacyPool,
    isLegacyDbConfigured,
    legacyCountCache,
  } = ctx;


  app.get(
    "/api/legacy/customer-products",
    requireAuth,
    requirePermission(
      "view_legacy_database",
      "manage_legacy_database",
      "manage_definitions",
      "admin",
    ),
    async (req, res) => {
    try {
      if (!isLegacyDbConfigured()) {
        return res.status(503).json({
          message: "legacy_not_configured",
          detail:
            "قاعدة البيانات القديمة غير مهيأة. أضف السر LEGACY_DATABASE_URL.",
        });
      }
      const pool = getLegacyPool();
      if (!pool) {
        return res.status(503).json({
          message: "legacy_not_configured",
          detail: "تعذر الاتصال بقاعدة البيانات القديمة.",
        });
      }

      const q = String(req.query.q || "").trim();
      const limitRaw = parseInt(String(req.query.limit || "50"), 10);
      const offsetRaw = parseInt(String(req.query.offset || "0"), 10);
      const limit =
        Number.isFinite(limitRaw) && limitRaw > 0
          ? Math.min(limitRaw, 200)
          : 50;
      const offset =
        Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

      const cols = `cp.id,
        cu.name AS customer_name, cu.name_ar AS customer_name_ar,
        cu.plate_drawer_code AS drawer_code,
        ca.name AS category_name, ca.name_ar AS category_name_ar,
        it.name AS item_name, it.full_name AS item_full_name,
        cp.size_caption, cp.width, cp.left_f, cp.right_f, cp.thickness,
        cp.thickness_one, cp.printing_cylinder, cp.length_cm, cp.cutting_length_cm,
        cp.raw_material,
        mb.name AS master_batch_name,
        cp.printed, cp.cutting_unit, cp.unit_weight_kg, cp.packing, cp.punching,
        cp.cover, cp.volum, cp.knife, cp.notes, cp.unit_qty, cp.package_kg`;

      const joins = `LEFT JOIN public.customers cu ON cu.id = cp.customer_id
        LEFT JOIN public.categories ca ON ca.id = cp.category_id
        LEFT JOIN public.items it ON it.id = cp.item_id
        LEFT JOIN public.master_batches mb ON mb.id = cp.master_batch_id`;

      const params: (string | number)[] = [];
      let where = "";
      if (q) {
        params.push(`%${q}%`);
        const p = `$${params.length}`;
        where = `WHERE
          COALESCE(cp.customer_id::text,'') ILIKE ${p}
          OR COALESCE(cu.name,'') ILIKE ${p}
          OR COALESCE(cu.name_ar,'') ILIKE ${p}
          OR COALESCE(cu.plate_drawer_code,'') ILIKE ${p}
          OR COALESCE(ca.name,'') ILIKE ${p}
          OR COALESCE(ca.name_ar,'') ILIKE ${p}
          OR COALESCE(it.name,'') ILIKE ${p}
          OR COALESCE(it.full_name,'') ILIKE ${p}
          OR COALESCE(mb.name,'') ILIKE ${p}
          OR COALESCE(cp.item_id::text,'') ILIKE ${p}
          OR COALESCE(cp.size_caption,'') ILIKE ${p}
          OR COALESCE(cp.raw_material,'') ILIKE ${p}
          OR COALESCE(cp.notes,'') ILIKE ${p}
          OR COALESCE(cp.printed,'') ILIKE ${p}
          OR COALESCE(cp.packing,'') ILIKE ${p}`;
      }

      // Optimization: combine data + count in a single query using COUNT(*) OVER()
      // to avoid running the 4-join + multi-ILIKE scan twice. For the unfiltered
      // case (initial page load), cache the total briefly to skip the window.
      let total: number | null = null;
      const cacheKey = "legacy_cp_total";
      const now = Date.now();
      if (!q) {
        const cached = legacyCountCache.get(cacheKey);
        if (cached && cached.expiresAt > now) total = cached.total;
      }

      const dataParams = [...params, limit, offset];
      const totalExpr = total === null ? "COUNT(*) OVER()::int" : "NULL::int";
      const dataSql = `SELECT ${cols}, ${totalExpr} AS __total
        FROM public.customer_products cp
        ${joins}
        ${where}
        ORDER BY cp.id DESC
        LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`;

      const dataRes = await pool.query(dataSql, dataParams);

      if (total === null) {
        if (dataRes.rows.length > 0) {
          total = dataRes.rows[0]?.__total ?? 0;
        } else {
          // Empty page (e.g. offset past the end): COUNT(*) OVER() returns
          // no row, so we must run a fallback count query to preserve the
          // correct total for pagination UIs.
          const countSql = `SELECT COUNT(*)::int AS total
            FROM public.customer_products cp
            ${joins}
            ${where}`;
          const countRes = await pool.query(countSql, params);
          total = countRes.rows[0]?.total ?? 0;
        }
        if (!q && typeof total === "number") {
          legacyCountCache.set(cacheKey, {
            total,
            expiresAt: now + 60_000, // 60s
          });
        }
      }

      // Strip the helper column from response rows
      const rows = dataRes.rows.map((r: any) => {
        const { __total, ...rest } = r;
        return rest;
      });

      res.json({ rows, total: total ?? 0, limit, offset });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : String(error);
      console.error("Error reading legacy customer_products:", detail);
      res.status(500).json({
        message: "legacy_query_failed",
        detail: "خطأ في قراءة بيانات القاعدة القديمة",
      });
    }
    },
  );

  app.get(
    "/api/legacy/customer-products/:id/cliches",
    requireAuth,
    requirePermission(
      "view_legacy_database",
      "manage_legacy_database",
      "manage_definitions",
      "admin",
    ),
    async (req, res) => {
      try {
        if (!isLegacyDbConfigured()) {
          return res.status(503).json({
            message: "legacy_not_configured",
            detail:
              "قاعدة البيانات القديمة غير مهيأة. أضف السر LEGACY_DATABASE_URL.",
          });
        }
        const pool = getLegacyPool();
        if (!pool) {
          return res.status(503).json({
            message: "legacy_not_configured",
            detail: "تعذر الاتصال بقاعدة البيانات القديمة.",
          });
        }

        const id = parseInt(String(req.params.id), 10);
        if (!Number.isFinite(id) || id <= 0) {
          return res.status(400).json({ message: "invalid_id" });
        }

        const result = await pool.query(
          `SELECT cliche_front_design AS front, cliche_back_design AS back
             FROM public.customer_products
            WHERE id = $1
            LIMIT 1`,
          [id],
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "not_found" });
        }
        const row = result.rows[0] as { front: string | null; back: string | null };
        res.json({
          front: row.front || null,
          back: row.back || null,
        });
      } catch (error) {
        const detail =
          error instanceof Error ? error.message : String(error);
        console.error("Error reading legacy clichés:", detail);
        res.status(500).json({
          message: "legacy_query_failed",
          detail: "خطأ في قراءة صور الكليشة",
        });
      }
    },
  );
}
