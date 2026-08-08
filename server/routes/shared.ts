import type { Express, Request } from "express";

import crypto from "crypto";
import { createServer, type Server } from "http";

import bcrypt from "bcrypt";

export const TRANSLATE_NAME_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const TRANSLATE_NAME_CACHE_MAX = 1000;
export const translateNameCache = new Map<
  string,
  { translatedText: string; expiresAt: number }
>();

export let translateOpenAIClientPromise: Promise<any> | null = null;
export async function getTranslateOpenAIClient() {
  if (!translateOpenAIClientPromise) {
    translateOpenAIClientPromise = import("openai").then(
      (mod) => new mod.default({ timeout: 8000, maxRetries: 0 }),
    );
  }
  return translateOpenAIClientPromise;
}

// Helper: add a sheet from an array of objects to a workbook
export function addJsonSheet(
  workbook: ExcelJS.Workbook,
  data: any[],
  sheetName: string,
  colWidths?: number[],
) {
  const worksheet = workbook.addWorksheet(sheetName);
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    if (colWidths) {
      worksheet.columns = headers.map((h, i) => ({
        header: h,
        key: h,
        width: colWidths[i] ?? 15,
      }));
    } else {
      worksheet.addRow(headers);
    }
    for (const row of data) {
      worksheet.addRow(headers.map((h) => row[h] ?? ""));
    }
  }
  return worksheet;
}

// Helper: parse the first sheet of an Excel buffer into an array of objects
export async function parseExcelBuffer(
  buffer: Buffer,
): Promise<Record<string, any>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw Object.assign(new Error("الملف لا يحتوي على أوراق عمل"), {
      statusCode: 400,
    });
  }
  const rows: Record<string, any>[] = [];
  const headers: string[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      (row.values as any[]).forEach((val, idx) => {
        if (idx > 0) headers.push(String(val ?? ""));
      });
    } else {
      const obj: Record<string, any> = {};
      const vals = row.values as any[];
      headers.forEach((h, i) => {
        obj[h] = vals[i + 1] ?? null;
      });
      rows.push(obj);
    }
  });
  return rows;
}

export const upload = multer({ storage: multer.memoryStorage() });
export const mobileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

export type RequestWithAuth = {
  user?: { id?: number } | null;
  session?: { userId?: number } | null;
};

export function getAuthUserId(req: RequestWithAuth): number | undefined {
  return req.user?.id ?? req.session?.userId;
}

// Extend Express Request type to include session
declare module "express-serve-static-core" {
  interface Request {
    session: {
      userId?: number;
      [key: string]: any;
      destroy?: (callback: (err?: any) => void) => void;
    };
  }
}
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

export const safeJsonParse = (value: string, paramName: string): any => {
  try {
    return JSON.parse(value);
  } catch {
    throw Object.assign(new Error(`${paramName} يحتوي على بيانات غير صالحة`), {
      statusCode: 400,
    });
  }
};

// Helper functions for safe route parameter parsing
export const parseRouteParam = (
  param: string | undefined,
  paramName: string,
): number => {
  if (!param) {
    throw new Error(`${paramName} parameter is required`);
  }
  return parseIntSafe(param, paramName, { min: 1 });
};

export const parseOptionalQueryParam = (
  param: any,
  paramName: string,
  defaultValue: number,
): number => {
  if (!param) return defaultValue;
  try {
    return parseIntSafe(param, paramName, { min: 1 });
  } catch {
    return defaultValue;
  }
};

// Helper function to check if an order is paused and block production
export const checkOrderNotPaused = async (
  productionOrderId: number,
): Promise<{
  isPaused: boolean;
  notFound?: boolean;
  orderStatus?: string;
  message?: string;
}> => {
  try {
    const productionOrder =
      await storage.getProductionOrderById(productionOrderId);
    if (!productionOrder) {
      return {
        isPaused: true,
        notFound: true,
        message: "أمر الإنتاج غير موجود",
      };
    }

    const order = await storage.getOrderById(productionOrder.order_id);
    if (!order) {
      return {
        isPaused: true,
        notFound: true,
        message: "الطلب المرتبط بأمر الإنتاج غير موجود",
      };
    }

    if (order.status === "paused") {
      return {
        isPaused: true,
        orderStatus: order.status,
        message: "الطلب معلق مؤقتاً - لا يمكن إضافة إنتاج جديد",
      };
    }

    return { isPaused: false };
  } catch (error) {
    console.error("Error checking order status:", error);
    return { isPaused: true, message: "خطأ في التحقق من حالة الطلب" };
  }
};

export const insertCustomerSchema = createInsertSchema(customers)
  .omit({ id: true, created_at: true })
  .extend({
    sales_rep_id: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return null;
        if (typeof val === "number") return val;
        try {
          return parseIntSafe(val as string, "Sales Rep ID", { min: 1 });
        } catch {
          return null; // Return null for invalid values instead of NaN
        }
      }),
  });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
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

// Initialize notification service
export const notificationService = new NotificationService(storage);

// Initialize Taqnyat SMS service
export const taqnyatSMS = new TaqnyatSMSService(storage);

// Initialize notification manager (singleton)
export const notificationManagerHolder: {
  value: ReturnType<typeof getNotificationManager> | null;
} = { value: null };