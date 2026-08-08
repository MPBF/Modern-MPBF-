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
export async function registerMaintenanceRoutes(app: Express, ctx: any) {


  // Maintenance routes
  app.get("/api/maintenance", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب طلبات الصيانة" });
    }
  });

  app.post(
    "/api/maintenance",
    requireAuth,
    requirePermission("manage_maintenance", "create_maintenance_requests"),
    async (req, res) => {
      try {
        const validatedData = insertMaintenanceRequestSchema.parse(req.body);
        const request = await storage.createMaintenanceRequest(validatedData);
        res.json(request);
      } catch (error) {
        res.status(400).json({ message: "بيانات غير صحيحة" });
      }
    },
  );

  // Maintenance requests routes
  app.get("/api/maintenance-requests", requireAuth, async (req, res) => {
    try {
      const maintenanceRequests = await storage.getMaintenanceRequests();
      res.json(maintenanceRequests);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب طلبات الصيانة" });
    }
  });

  app.post(
    "/api/maintenance-requests",
    requireAuth,
    requirePermission("add_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        // Process the data to convert string values to appropriate types
        const processedData = { ...req.body };

        // machine_id stays as string (e.g., 'MAC12')
        // No conversion needed

        // Convert reported_by from string to number
        if (
          processedData.reported_by &&
          typeof processedData.reported_by === "string"
        ) {
          processedData.reported_by = parseInt(processedData.reported_by, 10);
        }

        // Convert assigned_to from empty string to null, or from string to number
        if (
          processedData.assigned_to === "" ||
          processedData.assigned_to === "none"
        ) {
          processedData.assigned_to = null;
        } else if (
          processedData.assigned_to &&
          typeof processedData.assigned_to === "string"
        ) {
          processedData.assigned_to = parseInt(processedData.assigned_to, 10);
        }

        const validatedData =
          insertMaintenanceRequestSchema.parse(processedData);
        const request = await storage.createMaintenanceRequest(validatedData);
        res.json(request);
      } catch (error) {
        console.error("Error creating maintenance request:", error);
        res.status(500).json({
          message: "خطأ في إنشاء طلب الصيانة",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.patch(
    "/api/maintenance-requests/:id",
    requireAuth,
    requirePermission("edit_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const processedData = { ...req.body };

        // Don't allow client to overwrite identity/audit fields
        delete processedData.id;
        delete processedData.request_number;
        delete processedData.reported_by;

        if (
          processedData.assigned_to === "" ||
          processedData.assigned_to === "none" ||
          processedData.assigned_to === null
        ) {
          processedData.assigned_to = null;
        } else if (
          processedData.assigned_to !== undefined &&
          typeof processedData.assigned_to === "string"
        ) {
          processedData.assigned_to = parseInt(processedData.assigned_to, 10);
        }

        const validatedData = insertMaintenanceRequestSchema
          .partial()
          .parse(processedData);
        const updated = await storage.updateMaintenanceRequest(
          id,
          validatedData as any,
        );
        if (!updated) {
          return res.status(404).json({ message: "طلب الصيانة غير موجود" });
        }
        res.json(updated);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صالحة", errors: error.errors });
        }
        console.error("Error updating maintenance request:", error);
        res.status(500).json({ message: "خطأ في تحديث طلب الصيانة" });
      }
    },
  );

  app.delete(
    "/api/maintenance-requests/:id",
    requireAuth,
    requirePermission("delete_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const deleted = await storage.deleteMaintenanceRequest(id);
        if (!deleted) {
          return res.status(404).json({ message: "طلب الصيانة غير موجود" });
        }
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting maintenance request:", error);
        res.status(500).json({ message: "خطأ في حذف طلب الصيانة" });
      }
    },
  );

  // Maintenance Actions routes
  app.get("/api/maintenance-actions", requireAuth, async (req, res) => {
    try {
      const actions = await storage.getAllMaintenanceActions();
      res.json(actions);
    } catch (error) {
      console.error("Error fetching maintenance actions:", error);
      res.status(500).json({ message: "خطأ في جلب إجراءات الصيانة" });
    }
  });

  app.get(
    "/api/maintenance-actions/request/:requestId",
    requireAuth,
    async (req, res) => {
      try {
        const requestId = parseRouteParam(req.params.requestId, "Request ID");
        const actions =
          await storage.getMaintenanceActionsByRequestId(requestId);
        res.json(actions);
      } catch (error) {
        console.error("Error fetching maintenance actions by request:", error);
        res.status(500).json({ message: "خطأ في جلب إجراءات الصيانة للطلب" });
      }
    },
  );

  app.post(
    "/api/maintenance-actions",
    requireAuth,
    requirePermission("add_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const data = insertMaintenanceActionSchema.parse(req.body);
        const action = await storage.createMaintenanceAction(data);
        res.json(action);
      } catch (error) {
        console.error("Error creating maintenance action:", error);
        res.status(500).json({
          message: "خطأ في إنشاء إجراء الصيانة",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.put(
    "/api/maintenance-actions/:id",
    requireAuth,
    requirePermission("edit_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const action = await storage.updateMaintenanceAction(id, req.body);
        res.json(action);
      } catch (error) {
        console.error("Error updating maintenance action:", error);
        res.status(500).json({ message: "خطأ في تحديث إجراء الصيانة" });
      }
    },
  );

  app.delete(
    "/api/maintenance-actions/:id",
    requireAuth,
    requirePermission("delete_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        await storage.deleteMaintenanceAction(id);
        res.json({ message: "تم حذف إجراء الصيانة بنجاح" });
      } catch (error) {
        console.error("Error deleting maintenance action:", error);
        res.status(500).json({ message: "خطأ في حذف إجراء الصيانة" });
      }
    },
  );

  // ===== Preventive Maintenance routes =====

  // Component catalog (optionally filtered by normalized machine type)
  app.get(
    "/api/maintenance-components",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const { machineType } = req.query;
        const components = await storage.getMaintenanceComponents(
          machineType ? String(machineType) : undefined,
        );
        res.json(components);
      } catch (error) {
        console.error("Error fetching maintenance components:", error);
        res.status(500).json({ message: "خطأ في جلب قائمة المكونات" });
      }
    },
  );

  // Full catalog (including disabled) for admin management
  app.get(
    "/api/maintenance-components/all",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (_req, res) => {
      try {
        const components = await storage.getAllMaintenanceComponents();
        res.json(components);
      } catch (error) {
        console.error("Error fetching all maintenance components:", error);
        res.status(500).json({ message: "خطأ في جلب قائمة المكونات" });
      }
    },
  );

  app.post(
    "/api/maintenance-components",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (req, res) => {
      try {
        const data = insertMaintenanceComponentSchema.parse(req.body);
        const component = await storage.createMaintenanceComponent(data);
        res.json(component);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صالحة", errors: error.errors });
        }
        if (error?.code === "23505") {
          return res
            .status(409)
            .json({ message: "هذا المكوّن موجود بالفعل لهذا النوع من الماكينات" });
        }
        console.error("Error creating maintenance component:", error);
        res.status(500).json({ message: "خطأ في إنشاء المكوّن" });
      }
    },
  );

  app.patch(
    "/api/maintenance-components/:id",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const data = updateMaintenanceComponentSchema.parse(req.body);
        const component = await storage.updateMaintenanceComponent(id, data);
        res.json(component);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صالحة", errors: error.errors });
        }
        if (error?.code === "23505") {
          return res
            .status(409)
            .json({ message: "هذا المكوّن موجود بالفعل لهذا النوع من الماكينات" });
        }
        console.error("Error updating maintenance component:", error);
        res.status(500).json({ message: "خطأ في تحديث المكوّن" });
      }
    },
  );

  app.delete(
    "/api/maintenance-components/:id",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        await storage.deleteMaintenanceComponent(id);
        res.json({ message: "تم حذف المكوّن بنجاح" });
      } catch (error: any) {
        if (error?.code === "23503") {
          return res.status(409).json({
            message:
              "لا يمكن حذف هذا المكوّن لأنه مستخدم في إجراءات وقائية سابقة. يمكنك تعطيله بدلاً من ذلك.",
          });
        }
        console.error("Error deleting maintenance component:", error);
        res.status(500).json({ message: "خطأ في حذف المكوّن" });
      }
    },
  );

  // List preventive actions (optionally filtered by machine)
  app.get(
    "/api/preventive-actions",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const { machineId } = req.query;
        const actions = await storage.getPreventiveMaintenanceActions(
          machineId ? String(machineId) : undefined,
        );
        res.json(actions);
      } catch (error) {
        console.error("Error fetching preventive actions:", error);
        res.status(500).json({ message: "خطأ في جلب الإجراءات الوقائية" });
      }
    },
  );

  // Last action performed per component on a machine (reference view)
  app.get(
    "/api/preventive-actions/last/:machineId",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        // machines.id is varchar (e.g. M001), so do NOT use the numeric parser.
        const machineId = String(req.params.machineId || "").trim();
        if (!machineId) {
          return res
            .status(400)
            .json({ message: "معرّف الماكينة غير صالح" });
        }
        const rows = await storage.getLastActionPerComponent(machineId);
        res.json(rows);
      } catch (error) {
        console.error("Error fetching last component actions:", error);
        res.status(500).json({ message: "خطأ في جلب آخر الإجراءات للمكونات" });
      }
    },
  );

  // Export the per-machine "last action per component" reference as an Excel
  // workbook (Arabic-first RTL) for record-keeping / audits.
  app.get(
    "/api/preventive-actions/last/:machineId/export",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const machineId = String(req.params.machineId || "").trim();
        if (!machineId) {
          return res.status(400).json({ message: "معرّف الماكينة غير صالح" });
        }

        const [rows, machine] = await Promise.all([
          storage.getLastActionPerComponent(machineId),
          storage.getMachineById(machineId).catch(() => null),
        ]);

        const machineName =
          (machine as any)?.name_ar ||
          (machine as any)?.name ||
          machineId;

        const actionTypeAr: Record<string, string> = {
          inspection: "فحص",
          cleaning: "تنظيف",
          lubrication: "تشحيم",
          adjustment: "ضبط",
          repair: "إصلاح",
          replacement: "استبدال",
        };

        const elapsedLabel = (dateStr: string | null) => {
          if (!dateStr) return "-";
          const then = new Date(dateStr).getTime();
          if (isNaN(then)) return "-";
          const days = Math.floor(
            (Date.now() - then) / (1000 * 60 * 60 * 24),
          );
          if (days <= 0) return "اليوم";
          return `منذ ${days} يوم`;
        };

        const ExcelJS = (await import("exceljs")).default;
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "MPBF Manufacturing System";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("الصيانة الوقائية", {
          views: [{ rightToLeft: true }],
        });

        sheet.mergeCells("A1:D1");
        const titleCell = sheet.getCell("A1");
        titleCell.value = `آخر إجراء صيانة وقائية لكل مكوّن - ${machineName}`;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: "center" };

        sheet.mergeCells("A2:D2");
        const dateCell = sheet.getCell("A2");
        dateCell.value = `تاريخ الإصدار: ${new Date().toLocaleDateString("ar")}`;
        dateCell.font = { size: 10, color: { argb: "FF666666" } };
        dateCell.alignment = { horizontal: "center" };

        const headers = ["المكوّن", "آخر إجراء", "آخر تاريخ", "المدة المنقضية"];
        const headerRow = sheet.getRow(4);
        headers.forEach((h, i) => {
          const cell = headerRow.getCell(i + 1);
          cell.value = h;
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2563EB" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          sheet.getColumn(i + 1).width = 24;
        });

        rows.forEach((r: any, idx: number) => {
          const row = sheet.getRow(idx + 5);
          row.getCell(1).value = r.component_name_ar || r.component_name_en || "-";
          row.getCell(2).value =
            actionTypeAr[r.action_type] || r.action_type || "-";
          row.getCell(3).value = r.action_date
            ? new Date(r.action_date).toLocaleDateString("ar")
            : "-";
          row.getCell(4).value = elapsedLabel(r.action_date);
          row.eachCell((cell) => {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill =
              idx % 2 === 0
                ? {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFF9FAFB" },
                  }
                : (undefined as any);
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="preventive-maintenance-${machineId}.xlsx"`,
        );
        res.send(Buffer.from(buffer));
      } catch (error) {
        console.error("Error exporting preventive reference:", error);
        res
          .status(500)
          .json({ message: "خطأ في تصدير مرجع الصيانة الوقائية" });
      }
    },
  );

  app.post(
    "/api/preventive-actions",
    requireAuth,
    requirePermission("add_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const data = createPreventiveMaintenanceSchema.parse(req.body);
        const performed_by = (req.user as any)?.id;
        if (!performed_by) {
          return res.status(401).json({ message: "غير مصرح" });
        }
        const action = await storage.createPreventiveMaintenanceAction({
          ...data,
          performed_by,
        });
        res.json(action);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صالحة", errors: error.errors });
        }
        console.error("Error creating preventive action:", error);
        res.status(500).json({ message: "خطأ في إنشاء الإجراء الوقائي" });
      }
    },
  );

  app.put(
    "/api/preventive-actions/:id",
    requireAuth,
    requirePermission("edit_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const data = updatePreventiveMaintenanceSchema.parse(req.body);
        const action = await storage.updatePreventiveMaintenanceAction(id, data);
        res.json(action);
      } catch (error: any) {
        if (error?.name === "ZodError") {
          return res
            .status(400)
            .json({ message: "بيانات غير صالحة", errors: error.errors });
        }
        console.error("Error updating preventive action:", error);
        res.status(500).json({ message: "خطأ في تعديل الإجراء الوقائي" });
      }
    },
  );

  app.delete(
    "/api/preventive-actions/:id",
    requireAuth,
    requirePermission("delete_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        await storage.deletePreventiveMaintenanceAction(id);
        res.json({ message: "تم حذف الإجراء الوقائي بنجاح" });
      } catch (error) {
        console.error("Error deleting preventive action:", error);
        res.status(500).json({ message: "خطأ في حذف الإجراء الوقائي" });
      }
    },
  );

  // Maintenance Reports routes
  app.get("/api/maintenance-reports", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const reports = type
        ? await storage.getMaintenanceReportsByType(type as string)
        : await storage.getAllMaintenanceReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching maintenance reports:", error);
      res.status(500).json({ message: "خطأ في جلب بلاغات الصيانة" });
    }
  });

  app.post(
    "/api/maintenance-reports",
    requireAuth,
    requirePermission("add_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const data = insertMaintenanceReportSchema.parse(req.body);
        const report = await storage.createMaintenanceReport(data);
        res.json(report);
      } catch (error) {
        console.error("Error creating maintenance report:", error);
        res.status(500).json({ message: "خطأ في إنشاء بلاغ الصيانة" });
      }
    },
  );

  app.put(
    "/api/maintenance-reports/:id",
    requireAuth,
    requirePermission("edit_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const report = await storage.updateMaintenanceReport(id, req.body);
        res.json(report);
      } catch (error) {
        console.error("Error updating maintenance report:", error);
        res.status(500).json({ message: "خطأ في تحديث بلاغ الصيانة" });
      }
    },
  );

  app.delete(
    "/api/maintenance-reports/:id",
    requireAuth,
    requirePermission("delete_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        await storage.deleteMaintenanceReport(id);
        res.json({ message: "تم حذف بلاغ الصيانة بنجاح" });
      } catch (error) {
        console.error("Error deleting maintenance report:", error);
        res.status(500).json({ message: "خطأ في حذف بلاغ الصيانة" });
      }
    },
  );

  // Operator Negligence Reports routes
  app.get("/api/operator-negligence-reports", requireAuth, async (req, res) => {
    try {
      const { operator_id } = req.query;
      const reports = operator_id
        ? await storage.getOperatorNegligenceReportsByOperator(
            parseInt(operator_id as string),
          )
        : await storage.getAllOperatorNegligenceReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching operator negligence reports:", error);
      res.status(500).json({ message: "خطأ في جلب بلاغات إهمال المشغلين" });
    }
  });

  app.post(
    "/api/operator-negligence-reports",
    requireAuth,
    async (req, res) => {
      try {
        const data = insertOperatorNegligenceReportSchema.parse(req.body);
        const report = await storage.createOperatorNegligenceReport(data);
        res.json(report);
      } catch (error) {
        console.error("Error creating operator negligence report:", error);
        res.status(500).json({ message: "خطأ في إنشاء بلاغ إهمال المشغل" });
      }
    },
  );

  app.put(
    "/api/operator-negligence-reports/:id",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const report = await storage.updateOperatorNegligenceReport(
          id,
          req.body,
        );
        res.json(report);
      } catch (error) {
        console.error("Error updating operator negligence report:", error);
        res.status(500).json({ message: "خطأ في تحديث بلاغ إهمال المشغل" });
      }
    },
  );

  app.delete(
    "/api/operator-negligence-reports/:id",
    requireAuth,
    requirePermission("delete_production", "manage_production", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        await storage.deleteOperatorNegligenceReport(id);
        res.json({ message: "تم حذف بلاغ إهمال المشغل بنجاح" });
      } catch (error) {
        console.error("Error deleting operator negligence report:", error);
        res.status(500).json({ message: "خطأ في حذف بلاغ إهمال المشغل" });
      }
    },
  );

  // Spare Parts routes
  app.get("/api/spare-parts", requireAuth, async (req, res) => {
    try {
      const spareParts = await storage.getAllSpareParts();
      res.json(spareParts);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
      res.status(500).json({ message: "خطأ في جلب قطع الغيار" });
    }
  });

  app.post(
    "/api/spare-parts",
    requireAuth,
    requirePermission("add_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const parsed = insertSparePartSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات قطعة الغيار غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const sparePart = await storage.createSparePart(parsed.data);
        res.status(201).json(sparePart);
      } catch (error: any) {
        console.error("Error creating spare part:", error);
        const isUnique =
          String(error?.code) === "23505" ||
          /unique/i.test(String(error?.message));
        res.status(isUnique ? 409 : 500).json({
          message: isUnique
            ? "رقم القطعة موجود مسبقاً"
            : "خطأ في إنشاء قطعة الغيار",
        });
      }
    },
  );

  app.put(
    "/api/spare-parts/:id",
    requireAuth,
    requirePermission("edit_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const parsed = updateSparePartSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات التحديث غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const sparePart = await storage.updateSparePart(id, parsed.data);
        res.json(sparePart);
      } catch (error) {
        console.error("Error updating spare part:", error);
        res.status(500).json({ message: "خطأ في تحديث قطعة الغيار" });
      }
    },
  );

  app.delete(
    "/api/spare-parts/:id",
    requireAuth,
    requirePermission("delete_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        await storage.deleteSparePart(id);
        res.json({ message: "تم حذف قطعة الغيار بنجاح" });
      } catch (error) {
        console.error("Error deleting spare part:", error);
        res.status(500).json({ message: "خطأ في حذف قطعة الغيار" });
      }
    },
  );

  // Consumable Parts routes
  app.get("/api/consumable-parts", requireAuth, async (req, res) => {
    try {
      const consumableParts = await storage.getAllConsumableParts();
      res.json(consumableParts);
    } catch (error) {
      console.error("Error fetching consumable parts:", error);
      res.status(500).json({ message: "خطأ في جلب قطع الغيار الاستهلاكية" });
    }
  });

  app.post(
    "/api/consumable-parts",
    requireAuth,
    requirePermission("add_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const parseResult = insertConsumablePartSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const consumablePart = await storage.createConsumablePart(
          parseResult.data,
        );
        res.json(consumablePart);
      } catch (error) {
        console.error("Error creating consumable part:", error);
        res
          .status(500)
          .json({ message: "خطأ في إنشاء قطعة الغيار الاستهلاكية" });
      }
    },
  );

  app.put(
    "/api/consumable-parts/:id",
    requireAuth,
    requirePermission("edit_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const consumablePart = await storage.updateConsumablePart(id, req.body);
        res.json(consumablePart);
      } catch (error) {
        console.error("Error updating consumable part:", error);
        res
          .status(500)
          .json({ message: "خطأ في تحديث قطعة الغيار الاستهلاكية" });
      }
    },
  );

  app.delete(
    "/api/consumable-parts/:id",
    requireAuth,
    requirePermission("delete_maintenance", "manage_maintenance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        await storage.deleteConsumablePart(id);
        res.json({ message: "تم حذف قطعة الغيار الاستهلاكية بنجاح" });
      } catch (error) {
        console.error("Error deleting consumable part:", error);
        res.status(500).json({ message: "خطأ في حذف قطعة الغيار الاستهلاكية" });
      }
    },
  );

  // Consumable Parts Transactions routes - list all
  app.get(
    "/api/consumable-parts-transactions",
    requireAuth,
    async (req, res) => {
      try {
        const allParts = await storage.getConsumableParts();
        const allTransactions = [];
        for (const part of allParts) {
          const transactions = await storage.getConsumablePartTransactions(
            part.id,
          );
          allTransactions.push(...transactions);
        }
        res.json(allTransactions);
      } catch (error) {
        console.error("Error fetching consumable parts transactions:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب حركات قطع الغيار الاستهلاكية" });
      }
    },
  );

  app.get(
    "/api/consumable-parts-transactions/part/:partId",
    requireAuth,
    async (req, res) => {
      try {
        const partId = parseRouteParam(req.params.partId, "Part ID");
        const transactions =
          await storage.getConsumablePartTransactionsByPartId(partId);
        res.json(transactions);
      } catch (error) {
        console.error(
          "Error fetching consumable parts transactions by part:",
          error,
        );
        res
          .status(500)
          .json({ message: "خطأ في جلب حركات قطعة الغيار الاستهلاكية" });
      }
    },
  );

  app.post(
    "/api/consumable-parts-transactions",
    requireAuth,
    async (req, res) => {
      try {
        const transaction = await storage.createConsumablePartTransaction(
          req.body,
        );
        res.json(transaction);
      } catch (error) {
        console.error("Error creating consumable parts transaction:", error);
        res
          .status(500)
          .json({ message: "خطأ في إنشاء حركة قطعة الغيار الاستهلاكية" });
      }
    },
  );

  // Barcode scanning endpoint for consumable parts
  app.post(
    "/api/consumable-parts/scan-barcode",
    requireAuth,
    async (req, res) => {
      try {
        const { barcode } = req.body;
        if (!barcode) {
          return res.status(400).json({ message: "الباركود مطلوب" });
        }

        const consumablePart =
          await storage.getConsumablePartByBarcode(barcode);
        if (!consumablePart) {
          return res
            .status(404)
            .json({ message: "لم يتم العثور على قطعة غيار بهذا الباركود" });
        }

        res.json(consumablePart);
      } catch (error) {
        console.error("Error scanning barcode:", error);
        res.status(500).json({ message: "خطأ في قراءة الباركود" });
      }
    },
  );

  // Process barcode transaction (in/out)
  app.post(
    "/api/consumable-parts/barcode-transaction",
    requireAuth,
    async (req, res) => {
      try {
        const {
          barcode,
          transaction_type,
          quantity,
          transaction_reason,
          notes,
          manual_entry,
        } = req.body;

        if (!getAuthUserId(req)) {
          return res
            .status(401)
            .json({ message: "يجب تسجيل الدخول لإجراء حركة مخزنية" });
        }

        if (!barcode || !transaction_type || !quantity) {
          return res
            .status(400)
            .json({ message: "الباركود ونوع الحركة والكمية مطلوبة" });
        }

        // Find consumable part by barcode
        const consumablePart =
          await storage.getConsumablePartByBarcode(barcode);
        if (!consumablePart) {
          return res
            .status(404)
            .json({ message: "لم يتم العثور على قطعة غيار بهذا الباركود" });
        }

        // Create transaction
        const transactionData = {
          consumable_part_id: consumablePart.id,
          transaction_type,
          quantity: parseInt(quantity),
          barcode_scanned: barcode,
          manual_entry: manual_entry || false,
          transaction_reason: transaction_reason || "",
          notes: notes || "",
          performed_by: getAuthUserId(req),
        };

        const transaction =
          await storage.processConsumablePartBarcodeTransaction(
            transactionData,
          );
        res.json(transaction);
      } catch (error) {
        console.error("Error processing barcode transaction:", error);
        res.status(500).json({ message: "خطأ في معالجة حركة الباركود" });
      }
    },
  );
}
