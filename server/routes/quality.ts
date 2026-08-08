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
  parseRouteParam,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerQualityRoutes(app: Express, ctx: any) {


  // Quality checks routes
  app.get("/api/quality-checks", requireAuth, async (req, res) => {
    try {
      const qualityChecks = await storage.getQualityChecks();
      res.json(qualityChecks);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب فحوصات الجودة" });
    }
  });

  app.get("/api/quality-issues", requireAuth, async (req: AuthRequest, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.source) filters.source = req.query.source;
      if (req.query.severity) filters.severity = req.query.severity;
      if (req.query.customer_id) filters.customer_id = req.query.customer_id;
      if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
      if (req.query.dateTo) filters.dateTo = req.query.dateTo;
      const issues = await storage.getQualityIssues(filters);
      res.json({ success: true, data: issues });
    } catch (error: any) {
      console.error("Error fetching quality issues:", error);
      res.status(500).json({ message: "خطأ في جلب مشاكل الجودة" });
    }
  });

  app.get(
    "/api/quality-issues/stats",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const stats = await storage.getQualityIssueStats();
        res.json({ success: true, data: stats });
      } catch (error: any) {
        console.error("Error fetching quality stats:", error);
        res.status(500).json({ message: "خطأ في جلب إحصائيات الجودة" });
      }
    },
  );

  app.get(
    "/api/quality-issues/:id",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const issue = await storage.getQualityIssueById(id);
        if (!issue)
          return res.status(404).json({ message: "لم يتم العثور على المشكلة" });
        res.json({ success: true, data: issue });
      } catch (error: any) {
        console.error("Error fetching quality issue:", error);
        res.status(500).json({ message: "خطأ في جلب بيانات المشكلة" });
      }
    },
  );

  app.post(
    "/api/quality-issues",
    requireAuth,
    requirePermission("add_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const parseResult = insertQualityIssueSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const issue = await storage.createQualityIssue(parseResult.data);
        res.status(201).json({ success: true, data: issue });
      } catch (error: any) {
        console.error("Error creating quality issue:", error);
        res.status(500).json({ message: "خطأ في إنشاء مشكلة الجودة" });
      }
    },
  );

  app.patch(
    "/api/quality-issues/:id",
    requireAuth,
    requirePermission("edit_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const issue = await storage.updateQualityIssue(id, req.body);
        if (!issue)
          return res.status(404).json({ message: "لم يتم العثور على المشكلة" });
        res.json({ success: true, data: issue });
      } catch (error: any) {
        console.error("Error updating quality issue:", error);
        res.status(500).json({ message: "خطأ في تحديث مشكلة الجودة" });
      }
    },
  );

  app.delete(
    "/api/quality-issues/:id",
    requireAuth,
    requirePermission("delete_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const deleted = await storage.deleteQualityIssue(id);
        if (!deleted)
          return res.status(404).json({ message: "لم يتم العثور على المشكلة" });
        res.json({ success: true });
      } catch (error: any) {
        console.error("Error deleting quality issue:", error);
        res.status(500).json({ message: "خطأ في حذف مشكلة الجودة" });
      }
    },
  );

  app.post(
    "/api/quality-issues/:id/responsibles",
    requireAuth,
    requirePermission("add_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const issueId = parseRouteParam(req.params.id, "id");
        const resp = await storage.addQualityIssueResponsible({
          ...req.body,
          quality_issue_id: issueId,
        });
        res.status(201).json({ success: true, data: resp });
      } catch (error: any) {
        console.error("Error adding responsible:", error);
        res.status(500).json({ message: "خطأ في إضافة المتسبب" });
      }
    },
  );

  app.patch(
    "/api/quality-issues/responsibles/:id",
    requireAuth,
    requirePermission("edit_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const parsed = insertQualityIssueResponsibleSchema
          .partial()
          .safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const resp = await storage.updateQualityIssueResponsible(
          id,
          parsed.data,
        );
        if (!resp)
          return res.status(404).json({ message: "لم يتم العثور على السجل" });
        res.json({ success: true, data: resp });
      } catch (error: any) {
        console.error("Error updating responsible:", error);
        res.status(500).json({ message: "خطأ في تحديث بيانات المتسبب" });
      }
    },
  );

  app.delete(
    "/api/quality-issues/responsibles/:id",
    requireAuth,
    requirePermission("delete_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const deleted = await storage.deleteQualityIssueResponsible(id);
        if (!deleted)
          return res.status(404).json({ message: "لم يتم العثور على السجل" });
        res.json({ success: true });
      } catch (error: any) {
        console.error("Error deleting responsible:", error);
        res.status(500).json({ message: "خطأ في حذف المتسبب" });
      }
    },
  );

  app.post(
    "/api/quality-issues/:id/actions",
    requireAuth,
    requirePermission("add_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const issueId = parseRouteParam(req.params.id, "id");
        const action = await storage.addQualityIssueAction({
          ...req.body,
          quality_issue_id: issueId,
        });
        res.status(201).json({ success: true, data: action });
      } catch (error: any) {
        console.error("Error adding action:", error);
        res.status(500).json({ message: "خطأ في إضافة الإجراء" });
      }
    },
  );

  app.patch(
    "/api/quality-issues/actions/:id",
    requireAuth,
    requirePermission("edit_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const parsed = insertQualityIssueActionSchema
          .partial()
          .safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const action = await storage.updateQualityIssueAction(id, parsed.data);
        if (!action)
          return res.status(404).json({ message: "لم يتم العثور على الإجراء" });
        res.json({ success: true, data: action });
      } catch (error: any) {
        console.error("Error updating action:", error);
        res.status(500).json({ message: "خطأ في تحديث الإجراء" });
      }
    },
  );

  // Quality inspection forms (نماذج فحص الجودة)
  app.get(
    "/api/quality-inspection-forms",
    requireAuth,
    requirePermission(
      "view_quality",
      "manage_quality",
      "add_quality",
      "edit_quality",
    ),
    async (req: AuthRequest, res) => {
      try {
        const filters: any = {};
        if (req.query.template_type)
          filters.template_type = String(req.query.template_type);
        if (req.query.overall_result)
          filters.overall_result = String(req.query.overall_result);
        if (req.query.dateFrom) filters.dateFrom = String(req.query.dateFrom);
        if (req.query.dateTo) filters.dateTo = String(req.query.dateTo);
        const forms = await storage.getQualityInspectionForms(filters);
        res.json({ success: true, data: forms });
      } catch (error: any) {
        console.error("Error fetching inspection forms:", error);
        res.status(500).json({ message: "خطأ في جلب نماذج الفحص" });
      }
    },
  );

  app.get(
    "/api/quality-inspection-forms/:id",
    requireAuth,
    requirePermission(
      "view_quality",
      "manage_quality",
      "add_quality",
      "edit_quality",
    ),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const form = await storage.getQualityInspectionFormById(id);
        if (!form)
          return res.status(404).json({ message: "لم يتم العثور على النموذج" });
        res.json({ success: true, data: form });
      } catch (error: any) {
        console.error("Error fetching inspection form:", error);
        res.status(500).json({ message: "خطأ في جلب نموذج الفحص" });
      }
    },
  );

  app.post(
    "/api/quality-inspection-forms",
    requireAuth,
    requirePermission("add_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const parsed = insertQualityInspectionFormSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const form = await storage.createQualityInspectionForm(parsed.data);
        res.status(201).json({ success: true, data: form });
      } catch (error: any) {
        console.error("Error creating inspection form:", error);
        res.status(500).json({ message: "خطأ في حفظ نموذج الفحص" });
      }
    },
  );

  app.patch(
    "/api/quality-inspection-forms/:id",
    requireAuth,
    requirePermission("edit_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const parsed = insertQualityInspectionFormSchema
          .partial()
          .safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const form = await storage.updateQualityInspectionForm(id, parsed.data);
        if (!form)
          return res.status(404).json({ message: "لم يتم العثور على النموذج" });
        res.json({ success: true, data: form });
      } catch (error: any) {
        console.error("Error updating inspection form:", error);
        res.status(500).json({ message: "خطأ في تحديث نموذج الفحص" });
      }
    },
  );

  app.delete(
    "/api/quality-inspection-forms/:id",
    requireAuth,
    requirePermission("delete_quality", "manage_quality"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const deleted = await storage.deleteQualityInspectionForm(id);
        if (!deleted)
          return res.status(404).json({ message: "لم يتم العثور على النموذج" });
        res.json({ success: true });
      } catch (error: any) {
        console.error("Error deleting inspection form:", error);
        res.status(500).json({ message: "خطأ في حذف نموذج الفحص" });
      }
    },
  );
}
