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
  addJsonSheet,
  getAuthUserId,
  parseRouteParam,
} from "./shared";
import { registerHrTrainingRoutes } from "./hr-training";
import { registerHrAttendanceRoutes } from "./hr-attendance";
import { registerHrEmployeeRoutes } from "./hr-employees";
import { registerHrViolationRoutes } from "./hr-violations";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain, delegated to hr-* submodules). See server/routes/README.md.
export async function registerHrRoutes(app: Express, ctx: any) {
  const {
    WV_READ,
    WV_RECORD,
    WV_MANAGE,
    HR_VIEW,
    HR_CREATE,
    HR_EDIT,
    HR_DELETE,
    parseEmployeeId,
  } = ctx;

  await registerHrTrainingRoutes(app, ctx);
  await registerHrAttendanceRoutes(app, ctx);
  await registerHrEmployeeRoutes(app, ctx);
  await registerHrViolationRoutes(app, ctx);

  // ===============================
  // Face Verification API Endpoints
  // ===============================

  app.get(
    "/api/face-verification/status/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res
            .status(400)
            .json({ message: "معرف المستخدم غير صحيح", success: false });
        }
        const user = await storage.getUserById(userId);

        if (!user) {
          return res
            .status(404)
            .json({ message: "المستخدم غير موجود", success: false });
        }

        const [registration] = await db
          .select()
          .from(face_registrations)
          .where(eq(face_registrations.user_id, userId));

        res.json({
          hasRegisteredFace: !!registration,
          success: true,
        });
      } catch (error) {
        console.error("Error checking face status:", error);
        res
          .status(500)
          .json({ message: "خطأ في التحقق من حالة البصمة", success: false });
      }
    },
  );

  app.post(
    "/api/face-verification/register",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const { user_id, image } = req.body;

        if (!user_id || !image) {
          return res
            .status(400)
            .json({ message: "بيانات غير مكتملة", success: false });
        }

        const authUserId = getAuthUserId(req);
        const userPerms = req.user?.permissions || [];
        const isAdmin = userPerms.includes("admin");
        if (user_id !== authUserId && !isAdmin) {
          return res.status(403).json({
            message: "لا يمكنك تسجيل بصمة وجه لمستخدم آخر",
            success: false,
          });
        }

        const user = await storage.getUserById(user_id);
        if (!user) {
          return res
            .status(404)
            .json({ message: "المستخدم غير موجود", success: false });
        }

        const imageHash = crypto
          .createHash("sha256")
          .update(image)
          .digest("hex");

        const [existing] = await db
          .select()
          .from(face_registrations)
          .where(eq(face_registrations.user_id, user_id));

        if (existing) {
          await db
            .update(face_registrations)
            .set({ face_hash: imageHash, updated_at: new Date() })
            .where(eq(face_registrations.user_id, user_id));
        } else {
          await db.insert(face_registrations).values({
            user_id,
            face_hash: imageHash,
          });
        }

        logger.info(`Face registered for user ${user_id}`, {
          userId: user_id,
          action: "face_register",
          timestamp: new Date().toISOString(),
        });

        res.json({
          success: true,
          message: "تم تسجيل بصمة الوجه بنجاح",
          registered: true,
        });
      } catch (error) {
        console.error("Error registering face:", error);
        res
          .status(500)
          .json({ message: "خطأ في تسجيل بصمة الوجه", success: false });
      }
    },
  );

  app.post(
    "/api/face-verification/verify",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const { user_id, image, action_type, timestamp } = req.body;

        if (!user_id || !image) {
          return res.status(400).json({
            message: "بيانات غير مكتملة",
            success: false,
            verified: false,
          });
        }

        const authUserId = getAuthUserId(req);
        const userPerms = req.user?.permissions || [];
        const isAdmin = userPerms.includes("admin");
        if (user_id !== authUserId && !isAdmin) {
          return res.status(403).json({
            message: "لا يمكنك التحقق من بصمة وجه مستخدم آخر",
            success: false,
            verified: false,
          });
        }

        const user = await storage.getUserById(user_id);
        if (!user) {
          return res.status(404).json({
            message: "المستخدم غير موجود",
            success: false,
            verified: false,
          });
        }

        const [faceData] = await db
          .select()
          .from(face_registrations)
          .where(eq(face_registrations.user_id, user_id));
        if (!faceData) {
          return res.status(400).json({
            message: "لم يتم تسجيل بصمة الوجه مسبقاً",
            success: false,
            verified: false,
          });
        }

        const currentHash = crypto
          .createHash("sha256")
          .update(image)
          .digest("hex");
        const verified = crypto.timingSafeEqual(
          Buffer.from(faceData.face_hash),
          Buffer.from(currentHash),
        );

        logger.info(`Face verification attempt for user ${user_id}`, {
          userId: user_id,
          action: "face_verify",
          actionType: action_type,
          verified,
          timestamp,
        });

        if (verified) {
          res.json({
            success: true,
            verified: true,
            message: "تم التحقق من الهوية بنجاح",
          });
        } else {
          res.json({
            success: true,
            verified: false,
            message: "لم يتم التعرف على الوجه - يرجى المحاولة مرة أخرى",
          });
        }
      } catch (error) {
        console.error("Error verifying face:", error);
        res.status(500).json({
          message: "خطأ في التحقق من بصمة الوجه",
          success: false,
          verified: false,
        });
      }
    },
  );

  app.get(
    "/api/face-verification/logs/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res
            .status(400)
            .json({ message: "معرف المستخدم غير صحيح", success: false });
        }
        res.json({
          logs: [],
          success: true,
        });
      } catch (error) {
        console.error("Error fetching face logs:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب سجلات التحقق", success: false });
      }
    },
  );
}
