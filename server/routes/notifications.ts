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
  upload,
  getAuthUserId,
  parseRouteParam,
  parseOptionalQueryParam,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerNotificationsRoutes(app: Express, ctx: any) {


  // ==== NOTIFICATIONS API ROUTES ====

  // Send WhatsApp message (Meta API or Twilio)
  app.post(
    "/api/notifications/whatsapp",
    requireAuth,
    validateRequest({ body: commonSchemas.whatsappMessage }),
    async (req, res) => {
      try {
        const {
          phone_number,
          message,
          title,
          priority,
          context_type,
          context_id,
          template_name,
          variables,
          use_template,
        } = req.body;

        let result;
        try {
          result = await notificationService.sendWhatsAppMessage(
            phone_number,
            message,
            {
              title,
              priority,
              context_type,
              context_id,
              // الرسائل التي يبدأها النظام تُرسَل عبر قالب افتراضياً (لتصل خارج
              // نافذة الـ24 ساعة)؛ تمرير use_template:false صراحةً يُرسل نصاً حراً.
              useTemplate: use_template,
              templateName: template_name,
              templateVariables: Array.isArray(variables) ? variables : undefined,
            },
          );
        } catch (serviceError: any) {
          logger.error("Notification service error", serviceError);
          return res.status(503).json({
            message: "خدمة الإشعارات غير متوفرة مؤقتاً",
            success: false,
            error: "SERVICE_UNAVAILABLE",
          });
        }

        if (!result) {
          return res.status(500).json({
            message: "لم يتم الحصول على رد من خدمة الإشعارات",
            success: false,
          });
        }

        if (result.success) {
          res.json({
            data: {
              messageId: result.messageId,
              phone_number,
              message:
                message.substring(0, 100) + (message.length > 100 ? "..." : ""),
              timestamp: new Date().toISOString(),
            },
            message: "تم إرسال رسالة الواتس اب بنجاح",
            success: true,
          });
        } else {
          // Handle specific notification service errors
          let statusCode = 500;
          let errorMessage = "فشل في إرسال رسالة الواتس اب";

          if (result.error?.includes("Invalid phone number")) {
            statusCode = 400;
            errorMessage = "رقم الهاتف غير صحيح";
          } else if (result.error?.includes("Rate limit")) {
            statusCode = 429;
            errorMessage = "تم تجاوز حد عدد الرسائل المسموح";
          } else if (result.error?.includes("Template not found")) {
            statusCode = 404;
            errorMessage = "قالب الرسالة غير موجود";
          }

          res.status(statusCode).json({
            message: errorMessage,
            error: result.error,
            success: false,
          });
        }
      } catch (error: any) {
        logger.error("Error sending WhatsApp message", error);

        // Handle different types of errors gracefully
        if (error.name === "ValidationError") {
          return res.status(400).json({
            message: "بيانات الطلب غير صحيحة",
            success: false,
          });
        }

        if (error.message?.includes("timeout")) {
          return res.status(504).json({
            message: "انتهت مهلة الاتصال بخدمة الواتس اب",
            success: false,
          });
        }

        res.status(500).json({
          message: "خطأ غير متوقع في إرسال رسالة الواتس اب",
          success: false,
        });
      }
    },
  );

  // Send test message
  app.post("/api/notifications/test", requireAuth, async (req, res) => {
    try {
      const { phone_number } = req.body;

      if (!phone_number) {
        return res.status(400).json({ message: "رقم الهاتف مطلوب" });
      }

      const result = await notificationService.sendTestMessage(phone_number);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      logger.error("Error sending test message", error);
      res.status(500).json({ message: "خطأ في إرسال رسالة الاختبار" });
    }
  });

  // ==== TAQNYAT SMS API ROUTES ====

  app.post(
    "/api/sms/send",
    requireAuth,
    validateRequest({ body: commonSchemas.smsMessage }),
    async (req, res) => {
      try {
        const {
          phone_number,
          message,
          recipients,
          title,
          priority,
          context_type,
          context_id,
          scheduled,
          sender_name,
        } = req.body;

        const allRecipients =
          recipients && recipients.length > 0 ? recipients : [phone_number];

        const result = await taqnyatSMS.sendSMS(allRecipients, message, {
          title,
          priority,
          context_type,
          context_id,
          scheduled,
          senderName: sender_name,
        });

        if (result.success) {
          res.json({
            success: true,
            data: {
              messageId: result.messageId,
              recipients: allRecipients,
              message:
                message.substring(0, 100) + (message.length > 100 ? "..." : ""),
              timestamp: new Date().toISOString(),
            },
            message: "تم إرسال الرسالة النصية بنجاح",
          });
        } else {
          let statusCode = 500;
          let errorMessage = "فشل في إرسال الرسالة النصية";

          if (result.error?.includes("invalid credentials")) {
            statusCode = 401;
            errorMessage = "مفتاح API غير صحيح";
          } else if (result.statusCode === 422) {
            statusCode = 400;
            errorMessage = "بيانات الرسالة غير صحيحة";
          }

          res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: result.error,
          });
        }
      } catch (error: any) {
        logger.error("Error sending SMS", error);
        res.status(500).json({
          success: false,
          message: "خطأ غير متوقع في إرسال الرسالة النصية",
        });
      }
    },
  );

  app.post("/api/sms/test", requireAuth, async (req, res) => {
    try {
      const { phone_number } = req.body;
      if (!phone_number) {
        return res
          .status(400)
          .json({ success: false, message: "رقم الهاتف مطلوب" });
      }

      const result = await taqnyatSMS.sendSMS(
        phone_number,
        "رسالة اختبار من نظام MPBF - تم إرسالها بنجاح عبر خدمة تقنيات ✅",
        { title: "اختبار SMS" },
      );

      if (result.success) {
        res.json({
          success: true,
          message: "تم إرسال رسالة الاختبار بنجاح",
          messageId: result.messageId,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "فشل في إرسال رسالة الاختبار",
          error: result.error,
        });
      }
    } catch (error: any) {
      logger.error("Error sending SMS test", error);
      res
        .status(500)
        .json({ success: false, message: "خطأ في إرسال رسالة الاختبار" });
    }
  });

  app.get("/api/sms/balance", requireAuth, async (req, res) => {
    try {
      const result = await taqnyatSMS.getBalance();
      if (result.success) {
        res.json({
          success: true,
          balance: result.balance,
          currency: result.currency,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error || "فشل في جلب الرصيد",
        });
      }
    } catch (error: any) {
      logger.error("Error fetching SMS balance", error);
      res
        .status(500)
        .json({ success: false, message: "خطأ في جلب رصيد الرسائل" });
    }
  });

  app.get("/api/sms/senders", requireAuth, async (req, res) => {
    try {
      const result = await taqnyatSMS.getSenders();
      if (result.success) {
        res.json({
          success: true,
          senders: result.senders,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error || "فشل في جلب أسماء المرسلين",
        });
      }
    } catch (error: any) {
      logger.error("Error fetching SMS senders", error);
      res
        .status(500)
        .json({ success: false, message: "خطأ في جلب أسماء المرسلين" });
    }
  });

  app.get("/api/sms/status", requireAuth, async (req, res) => {
    try {
      const isConfigured = taqnyatSMS.isConfigured();
      const systemStatus = await taqnyatSMS.checkStatus();

      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const webhookUrl = `${protocol}://${host}/api/notifications/webhook/taqnyat`;

      res.json({
        success: true,
        configured: isConfigured,
        systemStatus: systemStatus.status || "unknown",
        provider: "taqnyat",
        webhookUrl,
      });
    } catch (error: any) {
      logger.error("Error checking SMS status", error);
      res
        .status(500)
        .json({ success: false, message: "خطأ في فحص حالة خدمة الرسائل" });
    }
  });

  // Taqnyat SMS Webhook - Delivery Report Callback (public endpoint - called by Taqnyat servers)
  app.post("/api/notifications/webhook/taqnyat", async (req, res) => {
    try {
      const webhookSecret = process.env.TAQNYAT_WEBHOOK_SECRET;
      if (webhookSecret) {
        const signature =
          req.headers["x-taqnyat-signature"] ||
          req.headers["x-webhook-signature"];
        if (!signature) {
          logger.warn("Taqnyat webhook received without signature header");
          return res.status(401).json({ error: "Missing webhook signature" });
        }
        const taqRawBody =
          (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
        const expectedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(taqRawBody)
          .digest("hex");
        try {
          if (
            !crypto.timingSafeEqual(
              Buffer.from(String(signature)),
              Buffer.from(expectedSignature),
            )
          ) {
            logger.warn("Taqnyat webhook signature mismatch");
            return res.status(403).json({ error: "Invalid webhook signature" });
          }
        } catch {
          logger.warn("Taqnyat webhook signature comparison failed");
          return res.status(403).json({ error: "Invalid webhook signature" });
        }
      }

      const {
        messageId,
        mobile,
        status,
        statusCode,
        errorCode,
        deliveredTime,
        sentTime,
      } = req.body;

      logger.info("Taqnyat SMS webhook received", {
        messageId,
        mobile,
        status,
        statusCode,
      });

      if (messageId) {
        const statusMap: Record<string, string> = {
          DELIVERED: "delivered",
          SENT: "sent",
          FAILED: "failed",
          PENDING: "pending",
          REJECTED: "failed",
          EXPIRED: "failed",
        };

        const mappedStatus =
          statusMap[String(status).toUpperCase()] || "unknown";

        try {
          const updates: any = {
            external_status: mappedStatus,
          };
          if (mappedStatus === "delivered") {
            updates.status = "delivered";
            updates.delivered_at = deliveredTime
              ? new Date(deliveredTime)
              : new Date();
          } else if (mappedStatus === "failed") {
            updates.status = "failed";
            updates.error_message = errorCode
              ? `Error code: ${errorCode}`
              : "Delivery failed";
          }

          await storage.updateNotificationStatus(String(messageId), updates);
          logger.info(
            `SMS delivery status updated: ${messageId} -> ${mappedStatus}`,
          );
        } catch (dbError) {
          logger.error(
            "Error updating SMS delivery status in database",
            dbError,
          );
        }
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error("Error processing Taqnyat webhook", error);
      res.status(200).json({ success: true });
    }
  });

  // Taqnyat webhook verification (GET - some providers verify with GET first)
  app.get("/api/notifications/webhook/taqnyat", (req, res) => {
    res.status(200).json({
      status: "active",
      service: "taqnyat-sms-webhook",
      message: "Taqnyat SMS delivery report webhook is active",
    });
  });

  // Get notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      // Enhanced parameter validation with safe parsing
      let userId: number | undefined;
      if (req.query.user_id) {
        try {
          userId = parseIntSafe(req.query.user_id as string, "User ID", {
            min: 1,
          });
        } catch {
          userId = undefined; // Invalid user ID parameter
        }
      }

      let limitParam = 50;
      if (req.query.limit) {
        try {
          limitParam = parseIntSafe(req.query.limit as string, "Limit", {
            min: 1,
            max: 500,
          });
        } catch {
          limitParam = 50; // Default to 50 for invalid limit
        }
      }

      let offsetParam = 0;
      if (req.query.offset) {
        try {
          offsetParam = parseIntSafe(req.query.offset as string, "Offset", {
            min: 0,
          });
        } catch {
          offsetParam = 0; // Default to 0 for invalid offset
        }
      }

      // Validate pagination parameters with enhanced null safety
      const validLimit = Math.min(
        Math.max(isNaN(limitParam) ? 50 : limitParam, 1),
        500,
      );
      const validOffset = Math.max(isNaN(offsetParam) ? 0 : offsetParam, 0);

      const notifications = await storage.getNotifications(
        userId,
        validLimit,
        validOffset,
      );
      res.json(notifications);
    } catch (error: any) {
      logger.error("Error fetching notifications", error);
      res.status(500).json({ message: "خطأ في جلب الإشعارات" });
    }
  });

  // Webhook endpoint for Meta WhatsApp
  app.get("/api/notifications/webhook/meta", (req, res) => {
    // Verify webhook (Meta requirement)
    const VERIFY_TOKEN =
      process.env.META_WEBHOOK_VERIFY_TOKEN || "mpbf_webhook_token";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      logger.info("✅ Meta Webhook verified successfully");
      res.status(200).send(challenge);
    } else {
      logger.info("❌ Meta Webhook verification failed");
      res.sendStatus(403);
    }
  });

  app.post("/api/notifications/webhook/meta", async (req, res) => {
    try {
      const appSecret = process.env.META_APP_SECRET;
      if (appSecret) {
        const signature = req.headers["x-hub-signature-256"] as string;
        if (!signature) {
          logger.warn("Meta webhook received without signature header");
          return res.status(401).send("Missing signature");
        }
        const rawBody =
          (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
        const expectedSignature =
          "sha256=" +
          crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
        try {
          if (
            !crypto.timingSafeEqual(
              Buffer.from(signature),
              Buffer.from(expectedSignature),
            )
          ) {
            logger.warn("Meta webhook signature mismatch");
            return res.status(403).send("Invalid signature");
          }
        } catch {
          logger.warn("Meta webhook signature comparison failed");
          return res.status(403).send("Invalid signature");
        }
      }

      logger.debug(
        "📨 Meta Webhook received",
        JSON.stringify(req.body, null, 2),
      );

      res.status(200).send("OK");

      if (notificationService.metaWhatsApp) {
        notificationService.metaWhatsApp
          .handleWebhook(req.body)
          .catch((err: any) => {
            logger.error("Error processing Meta webhook in background", err);
          });
      }
    } catch (error: any) {
      logger.error("Error processing Meta webhook", error);
      res.status(200).send("OK");
    }
  });

  // Update notification status (Twilio webhook)
  app.post("/api/notifications/webhook/twilio", async (req, res) => {
    try {
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      if (twilioAuthToken) {
        const twilioSignature = req.headers["x-twilio-signature"] as string;
        if (!twilioSignature) {
          logger.warn("Twilio webhook received without signature header");
          return res.status(401).send("Missing signature");
        }
        // Validate actual HMAC-SHA1 signature (Twilio spec)
        try {
          const protocol = req.headers["x-forwarded-proto"] || req.protocol;
          const host = req.headers["x-forwarded-host"] || req.headers.host;
          const fullUrl = `${protocol}://${host}${req.originalUrl}`;
          const params: Record<string, string> = req.body || {};
          const sortedKeys = Object.keys(params).sort();
          let hashInput = fullUrl;
          for (const key of sortedKeys) {
            hashInput += key + (params[key] ?? "");
          }
          const expectedSig = crypto
            .createHmac("sha1", twilioAuthToken)
            .update(hashInput, "utf8")
            .digest("base64");
          if (
            !crypto.timingSafeEqual(
              Buffer.from(twilioSignature),
              Buffer.from(expectedSig),
            )
          ) {
            logger.warn("Twilio webhook signature mismatch");
            return res.status(403).send("Invalid signature");
          }
        } catch {
          logger.warn("Twilio webhook signature validation failed");
          return res.status(403).send("Invalid signature");
        }
      } else {
        logger.warn(
          "[Security] TWILIO_AUTH_TOKEN not set — Twilio webhook signature validation is DISABLED",
        );
      }

      const { MessageSid, MessageStatus, ErrorMessage } = req.body;

      if (MessageSid) {
        await notificationService.updateMessageStatus(MessageSid);
      }

      res.status(200).send("OK");
    } catch (error: any) {
      logger.error("Error handling Twilio webhook", error);
      res.status(500).send("Error");
    }
  });

  // ============ SSE Real-time Notification System ============

  // SSE endpoint for real-time notifications
  app.get("/api/notifications/stream", requireAuth, async (req, res) => {
    try {
      // Initialize notification manager if not already done
      if (!notificationManagerHolder.value) {
        notificationManagerHolder.value = getNotificationManager(storage);
        // Set notification manager in storage for production updates
        setNotificationManager(notificationManagerHolder.value);

        // Apply database optimizations on first initialization
        logger.info("[System] Applying database optimizations...");
        createPerformanceIndexes().catch((err) =>
          logger.error("[System] Database optimization failed", err),
        );
        createTextSearchIndexes().catch((err) =>
          logger.error("[System] Text search optimization failed", err),
        );
      }

      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "غير مصرح به" });
      }

      // Generate unique connection ID
      const connectionId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add SSE connection
      notificationManagerHolder.value.addConnection(connectionId, userId, res);

      logger.info(
        `[SSE] New connection established for user ${userId}, connectionId: ${connectionId}`,
      );
    } catch (error) {
      logger.error("Error establishing SSE connection", error);
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في إنشاء الاتصال" });
    }
  });

  // Create system notification
  app.post(
    "/api/notifications/system",
    requireAuth,
    validateRequest({
      body: z.object({
        title: z.string().min(1, "العنوان مطلوب"),
        title_ar: z.string().optional(),
        message: z.string().min(1, "الرسالة مطلوبة"),
        message_ar: z.string().optional(),
        type: z
          .enum([
            "system",
            "order",
            "production",
            "maintenance",
            "quality",
            "hr",
          ])
          .default("system"),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
        recipient_type: z.enum(["user", "role", "all"]),
        recipient_id: z.string().optional(),
        context_type: z.string().optional(),
        context_id: z.string().optional(),
        sound: z.boolean().optional().default(false),
        icon: z.string().optional(),
      }),
    }),
    async (req, res) => {
      try {
        // Initialize notification manager if not already done
        if (!notificationManagerHolder.value) {
          notificationManagerHolder.value = getNotificationManager(storage);
          // Set notification manager in storage for production updates
          setNotificationManager(notificationManagerHolder.value);

          // Apply database optimizations on first initialization
          logger.info("[System] Applying database optimizations...");
          createPerformanceIndexes().catch((err) =>
            logger.error("[System] Database optimization failed", err),
          );
          createTextSearchIndexes().catch((err) =>
            logger.error("[System] Text search optimization failed", err),
          );
        }

        const notificationData: SystemNotificationData = req.body;

        // Send notification based on recipient type
        if (
          notificationData.recipient_type === "user" &&
          notificationData.recipient_id
        ) {
          const userId = parseInt(notificationData.recipient_id);
          if (isNaN(userId)) {
            return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
          }
          await notificationManagerHolder.value.sendToUser(userId, notificationData);
        } else if (
          notificationData.recipient_type === "role" &&
          notificationData.recipient_id
        ) {
          const roleId = parseInt(notificationData.recipient_id);
          if (isNaN(roleId)) {
            return res.status(400).json({ message: "معرف الدور غير صحيح" });
          }
          await notificationManagerHolder.value.sendToRole(roleId, notificationData);
        } else if (notificationData.recipient_type === "all") {
          await notificationManagerHolder.value.sendToAll(notificationData);
        } else {
          return res
            .status(400)
            .json({ message: "نوع المستلم أو معرف المستلم مطلوب" });
        }

        res.json({
          success: true,
          message: "تم إرسال الإشعار بنجاح",
          recipient_type: notificationData.recipient_type,
          recipient_id: notificationData.recipient_id,
        });
      } catch (error: any) {
        console.error("Error creating system notification:", error);
        res.status(500).json({
          success: false,
          message: "فشل في إرسال الإشعار",
        });
      }
    },
  );

  // Mark notification as read
  app.patch(
    "/api/notifications/mark-read/:id",
    requireAuth,
    async (req, res) => {
      try {
        const notificationId = parseRouteParam(req.params.id, "معرف الإشعار");

        const notification =
          await storage.markNotificationAsRead(notificationId);

        res.json({
          success: true,
          message: "تم تعليم الإشعار كمقروء",
          notification,
        });
      } catch (error: any) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
          success: false,
          message: "فشل في تعليم الإشعار كمقروء",
        });
      }
    },
  );

  // Mark all notifications as read for current user
  app.patch(
    "/api/notifications/mark-all-read",
    requireAuth,
    async (req, res) => {
      try {
        const userId = getAuthUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "غير مصرح به" });
        }

        await storage.markAllNotificationsAsRead(userId);

        res.json({
          success: true,
          message: "تم تعليم جميع الإشعارات كمقروءة",
        });
      } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({
          success: false,
          message: "فشل في تعليم الإشعارات كمقروءة",
        });
      }
    },
  );

  // Delete notification
  app.delete("/api/notifications/delete/:id", requireAuth, async (req, res) => {
    try {
      const notificationId = parseRouteParam(req.params.id, "معرف الإشعار");

      await storage.deleteNotification(notificationId);

      res.json({
        success: true,
        message: "تم حذف الإشعار",
      });
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      res.status(500).json({
        success: false,
        message: "فشل في حذف الإشعار",
      });
    }
  });

  // Get user notifications with real-time support
  app.get("/api/notifications/user", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "غير مصرح به" });
      }

      const unreadOnly = req.query.unread_only === "true";
      const limit = parseOptionalQueryParam(req.query.limit, "الحد الأقصى", 50);
      const offset = parseOptionalQueryParam(req.query.offset, "الإزاحة", 0);

      const notifications = await storage.getUserNotifications(userId, {
        unreadOnly,
        limit,
        offset,
      });

      // Count unread notifications efficiently using SQL COUNT
      const user = await storage.getSafeUser(userId);
      let unreadCount = 0;
      if (user) {
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(notificationsTable)
          .where(
            and(
              sql`${notificationsTable.read_at} IS NULL`,
              eq(notificationsTable.recipient_id, userId.toString()),
            ),
          );
        unreadCount = Number(countResult[0]?.count || 0);
      }

      res.json({
        success: true,
        notifications,
        unread_count: unreadCount,
        total_returned: notifications.length,
      });
    } catch (error: any) {
      console.error("Error fetching user notifications:", error);
      res.status(500).json({
        success: false,
        message: "فشل في جلب الإشعارات",
      });
    }
  });

  // Get SSE connection statistics (admin only)
  app.get(
    "/api/notifications/stats",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        if (!notificationManagerHolder.value) {
          return res.json({
            success: true,
            stats: { activeConnections: 0, connectionsByUser: {} },
          });
        }

        const stats = notificationManagerHolder.value.getStats();
        res.json({ success: true, stats });
      } catch (error: any) {
        console.error("Error getting notification stats:", error);
        res.status(500).json({
          success: false,
          message: "فشل في جلب إحصائيات الإشعارات",
        });
      }
    },
  );

  // Get notification templates
  app.get("/api/notification-templates", requireAuth, async (req, res) => {
    try {
      const templates = await storage.getNotificationTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Error fetching notification templates:", error);
      res.status(500).json({ message: "خطأ في جلب قوالب الإشعارات" });
    }
  });

  // Create notification template
  app.post("/api/notification-templates", requireAuth, requirePermission("manage_settings", "admin"), async (req, res) => {
    try {
      const validation = insertNotificationTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: validation.error.errors,
        });
      }
      const template = await storage.createNotificationTemplate(
        validation.data,
      );
      res.json(template);
    } catch (error: any) {
      console.error("Error creating notification template:", error);
      res.status(500).json({ message: "خطأ في إنشاء قالب الإشعار" });
    }
  });

  // console.log("[SmartAlerts] نظام التحذيرات الذكية مُفعل ✅");

  // ============ Quick Notes API ============

  // Get all notes (optionally filtered by user)
  app.get("/api/quick-notes", requireAuth, async (req, res) => {
    try {
      // Only managers can query other users' notes
      let userId = req.user!.id;
      if (req.query.user_id) {
        const requestedUserId = parseInt(req.query.user_id as string);
        if (isNaN(requestedUserId) || requestedUserId <= 0) {
          return res
            .status(400)
            .json({ message: "معرف المستخدم غير صحيح" });
        }
        if (
          requestedUserId !== req.user!.id &&
          !req.user!.permissions?.includes("admin")
        ) {
          return res
            .status(403)
            .json({ message: "غير مصرح لك بعرض ملاحظات مستخدمين آخرين" });
        }
        userId = requestedUserId;
      }

      const notes = await storage.getQuickNotes(userId);
      res.json(notes);
    } catch (error: any) {
      console.error("Error fetching quick notes:", error);
      res.status(500).json({ message: "خطأ في جلب الملاحظات" });
    }
  });

  // Get a single note by ID
  app.get("/api/quick-notes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");
      const note = await storage.getQuickNoteById(id);

      if (!note) {
        return res.status(404).json({ message: "الملاحظة غير موجودة" });
      }

      // Authorization check - only creator, assignee, or manager can view
      if (
        note.created_by !== req.user!.id &&
        note.assigned_to !== req.user!.id &&
        !req.user!.permissions?.includes("admin")
      ) {
        return res
          .status(403)
          .json({ message: "غير مصرح لك بعرض هذه الملاحظة" });
      }

      res.json(note);
    } catch (error: any) {
      console.error("Error fetching note:", error);
      res.status(500).json({ message: "خطأ في جلب الملاحظة" });
    }
  });

  // Create a new note
  app.post("/api/quick-notes", requireAuth, async (req, res) => {
    try {
      // Validate required fields
      if (
        !req.body.content ||
        typeof req.body.content !== "string" ||
        req.body.content.trim() === ""
      ) {
        return res
          .status(400)
          .json({ message: "المحتوى مطلوب ويجب أن يكون نصاً" });
      }

      if (!req.body.note_type) {
        return res.status(400).json({ message: "نوع الملاحظة مطلوب" });
      }

      if (!req.body.assigned_to) {
        return res.status(400).json({ message: "يجب تعيين المستخدم" });
      }

      // Validate assigned_to is a valid number
      const assignedToId = parseInt(req.body.assigned_to);
      if (isNaN(assignedToId) || assignedToId <= 0) {
        return res
          .status(400)
          .json({ message: "معرف المستخدم المعين غير صحيح" });
      }

      // Validate note_type
      const validNoteTypes = [
        "order",
        "design",
        "statement",
        "quote",
        "delivery",
        "call_customer",
        "other",
      ];
      if (!validNoteTypes.includes(req.body.note_type)) {
        return res.status(400).json({ message: "نوع الملاحظة غير صحيح" });
      }

      // Validate priority
      const validPriorities = ["low", "normal", "high", "urgent"];
      const priority = req.body.priority || "normal";
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ message: "الأولوية غير صحيحة" });
      }

      const noteData = {
        content: req.body.content.trim(),
        note_type: req.body.note_type,
        priority,
        created_by: req.user!.id,
        assigned_to: assignedToId,
        is_read: false,
      };

      const newNote = await storage.createQuickNote(noteData);
      res.status(201).json(newNote);
    } catch (error: any) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "خطأ في إنشاء الملاحظة" });
    }
  });

  // Update a note
  app.patch("/api/quick-notes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");

      // Get existing note to check authorization
      const existingNote = await storage.getQuickNoteById(id);
      if (!existingNote) {
        return res.status(404).json({ message: "الملاحظة غير موجودة" });
      }

      // Only creator or admin can update
      if (
        existingNote.created_by !== req.user!.id &&
        !req.user!.permissions?.includes("admin")
      ) {
        return res
          .status(403)
          .json({ message: "غير مصرح لك بتعديل هذه الملاحظة" });
      }

      // Only allow updating specific fields
      const allowedUpdates: any = {};
      if (req.body.content) allowedUpdates.content = req.body.content.trim();
      if (req.body.note_type) {
        const validNoteTypes = [
          "order",
          "design",
          "statement",
          "quote",
          "delivery",
          "call_customer",
          "other",
        ];
        if (!validNoteTypes.includes(req.body.note_type)) {
          return res.status(400).json({ message: "نوع الملاحظة غير صحيح" });
        }
        allowedUpdates.note_type = req.body.note_type;
      }
      if (req.body.priority) {
        const validPriorities = ["low", "normal", "high", "urgent"];
        if (!validPriorities.includes(req.body.priority)) {
          return res.status(400).json({ message: "الأولوية غير صحيحة" });
        }
        allowedUpdates.priority = req.body.priority;
      }
      if (req.body.assigned_to) {
        const assignedTo = parseInt(req.body.assigned_to);
        if (isNaN(assignedTo) || assignedTo <= 0) {
          return res
            .status(400)
            .json({ message: "معرف المستخدم المعين غير صحيح" });
        }
        allowedUpdates.assigned_to = assignedTo;
      }

      const updatedNote = await storage.updateQuickNote(id, allowedUpdates);
      res.json(updatedNote);
    } catch (error: any) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "خطأ في تحديث الملاحظة" });
    }
  });

  // Mark note as read
  app.patch("/api/quick-notes/:id/read", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");

      // Get existing note to check authorization
      const existingNote = await storage.getQuickNoteById(id);
      if (!existingNote) {
        return res.status(404).json({ message: "الملاحظة غير موجودة" });
      }

      // Only assignee can mark as read
      if (existingNote.assigned_to !== req.user!.id) {
        return res
          .status(403)
          .json({ message: "فقط المستخدم المعين يمكنه تحديث حالة القراءة" });
      }

      const updatedNote = await storage.markNoteAsRead(id);
      res.json(updatedNote);
    } catch (error: any) {
      console.error("Error marking note as read:", error);
      res.status(500).json({ message: "خطأ في تحديث حالة القراءة" });
    }
  });

  // Delete a note
  app.delete("/api/quick-notes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");

      // Get existing note to check authorization
      const existingNote = await storage.getQuickNoteById(id);
      if (!existingNote) {
        return res.status(404).json({ message: "الملاحظة غير موجودة" });
      }

      // Only creator or admin can delete
      if (
        existingNote.created_by !== req.user!.id &&
        !req.user!.permissions?.includes("admin")
      ) {
        return res
          .status(403)
          .json({ message: "غير مصرح لك بحذف هذه الملاحظة" });
      }

      await storage.deleteQuickNote(id);
      res.json({ message: "تم حذف الملاحظة بنجاح" });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "خطأ في حذف الملاحظة" });
    }
  });

  // Get attachments for a note
  app.get("/api/quick-notes/:id/attachments", requireAuth, async (req, res) => {
    try {
      const noteId = parseRouteParam(req.params.id, "id");

      // Get note to check authorization
      const note = await storage.getQuickNoteById(noteId);
      if (!note) {
        return res.status(404).json({ message: "الملاحظة غير موجودة" });
      }

      // Authorization check
      if (
        note.created_by !== req.user!.id &&
        note.assigned_to !== req.user!.id &&
        !req.user!.permissions?.includes("admin")
      ) {
        return res
          .status(403)
          .json({ message: "غير مصرح لك بعرض هذه المرفقات" });
      }

      const attachments = await storage.getNoteAttachments(noteId);
      res.json(attachments);
    } catch (error: any) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "خطأ في جلب المرفقات" });
    }
  });

  // Upload attachment (placeholder - will be implemented with actual file upload)
  app.post(
    "/api/quick-notes/:id/attachments",
    requireAuth,
    async (req, res) => {
      try {
        const noteId = parseRouteParam(req.params.id, "id");

        // Get note to check authorization
        const note = await storage.getQuickNoteById(noteId);
        if (!note) {
          return res.status(404).json({ message: "الملاحظة غير موجودة" });
        }

        // Only creator or assignee can add attachments
        if (
          note.created_by !== req.user!.id &&
          note.assigned_to !== req.user!.id
        ) {
          return res
            .status(403)
            .json({ message: "غير مصرح لك بإضافة مرفقات لهذه الملاحظة" });
        }

        // Validate required fields
        if (
          !req.body.file_name ||
          !req.body.file_type ||
          !req.body.file_size ||
          !req.body.file_url
        ) {
          return res.status(400).json({ message: "بيانات المرفق ناقصة" });
        }

        const parsedFileSize = parseInt(req.body.file_size);
        if (isNaN(parsedFileSize) || parsedFileSize < 0) {
          return res.status(400).json({ message: "حجم الملف غير صحيح" });
        }

        const attachmentData = {
          note_id: noteId,
          file_name: req.body.file_name,
          file_type: req.body.file_type,
          file_size: parsedFileSize,
          file_url: req.body.file_url,
        };

        const newAttachment =
          await storage.createNoteAttachment(attachmentData);
        res.status(201).json(newAttachment);
      } catch (error: any) {
        console.error("Error creating attachment:", error);
        res.status(500).json({ message: "خطأ في رفع المرفق" });
      }
    },
  );

  // Delete attachment
  app.delete("/api/note-attachments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");

      const attachment = await storage.getNoteAttachmentById(id);
      if (!attachment) {
        return res.status(404).json({ message: "المرفق غير موجود" });
      }

      const note = await storage.getQuickNoteById(attachment.note_id);
      if (!note) {
        return res.status(404).json({ message: "الملاحظة غير موجودة" });
      }

      if (
        note.created_by !== req.user!.id &&
        !req.user!.permissions?.includes("admin")
      ) {
        return res.status(403).json({ message: "غير مصرح لك بحذف هذا المرفق" });
      }

      await storage.deleteNoteAttachment(id);
      res.json({ message: "تم حذف المرفق بنجاح" });
    } catch (error: any) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "خطأ في حذف المرفق" });
    }
  });

  // ==========================================
  // Notification Event Settings API
  // ==========================================

  // Get all notification event settings
  app.get("/api/notification-event-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getAllNotificationEventSettings();
      res.json({ data: settings, success: true });
    } catch (error) {
      console.error("Error fetching notification event settings:", error);
      res.status(500).json({
        message: "خطأ في جلب إعدادات أحداث الإشعارات",
        success: false,
      });
    }
  });

  // Get notification event setting by ID
  app.get(
    "/api/notification-event-settings/:id",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const setting = await storage.getNotificationEventSettingById(id);
        if (!setting) {
          return res
            .status(404)
            .json({ message: "إعداد الحدث غير موجود", success: false });
        }
        res.json({ data: setting, success: true });
      } catch (error) {
        console.error("Error fetching notification event setting:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب إعداد الحدث", success: false });
      }
    },
  );

  // Create notification event setting
  app.post(
    "/api/notification-event-settings",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = req.user?.id;
        const settingData = { ...req.body, created_by: userId };
        const setting =
          await storage.createNotificationEventSetting(settingData);
        res.status(201).json({
          data: setting,
          message: "تم إنشاء إعداد الحدث بنجاح",
          success: true,
        });
      } catch (error) {
        console.error("Error creating notification event setting:", error);
        res
          .status(500)
          .json({ message: "خطأ في إنشاء إعداد الحدث", success: false });
      }
    },
  );

  // Update notification event setting
  app.patch(
    "/api/notification-event-settings/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const userId = req.user?.id;
        const updates = { ...req.body, updated_by: userId };
        const setting = await storage.updateNotificationEventSetting(
          id,
          updates,
        );
        res.json({
          data: setting,
          message: "تم تحديث إعداد الحدث بنجاح",
          success: true,
        });
      } catch (error) {
        console.error("Error updating notification event setting:", error);
        res
          .status(500)
          .json({ message: "خطأ في تحديث إعداد الحدث", success: false });
      }
    },
  );

  // Delete notification event setting
  app.delete(
    "/api/notification-event-settings/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteNotificationEventSetting(id);
        res.json({ message: "تم حذف إعداد الحدث بنجاح", success: true });
      } catch (error) {
        console.error("Error deleting notification event setting:", error);
        res
          .status(500)
          .json({ message: "خطأ في حذف إعداد الحدث", success: false });
      }
    },
  );

  // Get notification event logs
  app.get("/api/notification-event-logs", requireAuth, async (req, res) => {
    try {
      const { limit, offset, eventKey, status } = req.query;
      const logs = await storage.getNotificationEventLogs({
        limit: limit ? parseInt(limit as string) : 100,
        offset: offset ? parseInt(offset as string) : 0,
        eventKey: eventKey as string,
        status: status as string,
      });
      res.json({ data: logs, success: true });
    } catch (error) {
      console.error("Error fetching notification event logs:", error);
      res
        .status(500)
        .json({ message: "خطأ في جلب سجلات الإشعارات", success: false });
    }
  });

  // Test notification sending
  app.post(
    "/api/notification-event-settings/:id/test",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const setting = await storage.getNotificationEventSettingById(id);
        if (!setting) {
          return res
            .status(404)
            .json({ message: "إعداد الحدث غير موجود", success: false });
        }

        // Get test data from request body
        const { phone_number, test_variables } = req.body;

        if (!phone_number) {
          return res
            .status(400)
            .json({ message: "رقم الهاتف مطلوب للاختبار", success: false });
        }

        // Create log entry for the test
        const log = await storage.createNotificationEventLog({
          event_setting_id: id,
          event_key: setting.event_key,
          trigger_context_type: "test",
          trigger_context_id: "test-" + Date.now(),
          trigger_data: test_variables || {},
          message_sent_ar: setting.message_template_ar,
          recipient_phone: phone_number,
          recipient_user_id: req.user?.id,
          recipient_name: "Test User",
          status: "pending",
        });

        res.json({
          data: log,
          message: "تم إرسال إشعار اختباري بنجاح",
          success: true,
        });
      } catch (error) {
        console.error("Error testing notification:", error);
        res
          .status(500)
          .json({ message: "خطأ في إرسال الإشعار الاختباري", success: false });
      }
    },
  );
}
