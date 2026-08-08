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
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerAdminRoutes(app: Express, ctx: any) {
  const {
    ADMIN_DOC_TYPES,
    adminToolDocPayloadSchema,
    parseAdminDocId,
  } = ctx;


  app.get(
    "/api/admin-tool-docs",
    requireAuth,
    requirePermission("manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const typeRaw = typeof req.query.type === "string" ? req.query.type : undefined;
        if (typeRaw && !ADMIN_DOC_TYPES.includes(typeRaw as any)) {
          return res.status(400).json({ message: "نوع المستند غير صحيح" });
        }
        const list = await storage.getAdminToolDocuments(typeRaw);
        res.json({ data: list });
      } catch (error) {
        console.error("Error listing admin tool docs:", error);
        res.status(500).json({ message: "خطأ في جلب المستندات" });
      }
    },
  );

  app.get(
    "/api/admin-tool-docs/:id",
    requireAuth,
    requirePermission("manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseAdminDocId(req.params.id, res);
        if (id === null) return;
        const d = await storage.getAdminToolDocumentById(id);
        if (!d) return res.status(404).json({ message: "المستند غير موجود" });
        res.json(d);
      } catch (error) {
        console.error("Error fetching admin tool doc:", error);
        res.status(500).json({ message: "خطأ في جلب المستند" });
      }
    },
  );

  app.post(
    "/api/admin-tool-docs",
    requireAuth,
    requirePermission("add_production", "manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const parsed = adminToolDocPayloadSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parsed.error.errors,
          });
        }
        const userId = getAuthUserId(req);
        const created = await storage.createAdminToolDocument(
          parsed.data,
          userId as number,
        );
        res.json(created);
      } catch (error) {
        console.error("Error creating admin tool doc:", error);
        res.status(500).json({ message: "خطأ في حفظ المستند" });
      }
    },
  );

  app.put(
    "/api/admin-tool-docs/:id",
    requireAuth,
    requirePermission("edit_production", "manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseAdminDocId(req.params.id, res);
        if (id === null) return;
        const existing = await storage.getAdminToolDocumentById(id);
        if (!existing) return res.status(404).json({ message: "المستند غير موجود" });
        const parsed = adminToolDocPayloadSchema.partial().safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parsed.error.errors,
          });
        }
        const updated = await storage.updateAdminToolDocument(id, parsed.data);
        res.json(updated);
      } catch (error) {
        console.error("Error updating admin tool doc:", error);
        res.status(500).json({ message: "خطأ في تعديل المستند" });
      }
    },
  );

  app.delete(
    "/api/admin-tool-docs/:id",
    requireAuth,
    requirePermission("delete_production", "manage_production"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseAdminDocId(req.params.id, res);
        if (id === null) return;
        const existing = await storage.getAdminToolDocumentById(id);
        if (!existing) return res.status(404).json({ message: "المستند غير موجود" });
        await storage.deleteAdminToolDocument(id);
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting admin tool doc:", error);
        res.status(500).json({ message: "خطأ في حذف المستند" });
      }
    },
  );
}
