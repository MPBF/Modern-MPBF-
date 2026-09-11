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
  categories,
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
  upload,
  getAuthUserId,
  parseRouteParam,
  insertCustomerSchema,
  insertLocationSchema,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerSystemRoutes(app: Express, ctx: any) {
  const {
    bagQuoteIpHits,
    bagQuoteGlobalHits,
    IP_WINDOW_MS,
    IP_MAX,
    GLOBAL_WINDOW_MS,
    GLOBAL_MAX,
    normalizePhoneServer,
    setupAttempts,
    COMPANY_LOGO_CACHE_TTL_MS,
    loadCompanyLogo,
  } = ctx;


  app.post("/api/public/bag-design-quote", async (req, res) => {
    try {
      // Rate limiting — use Express req.ip (respects configured trust proxy)
      // rather than trusting raw x-forwarded-for, which can be spoofed.
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();

      // Global window
      while (
        bagQuoteGlobalHits.length &&
        now - bagQuoteGlobalHits[0] > GLOBAL_WINDOW_MS
      ) {
        bagQuoteGlobalHits.shift();
      }
      if (bagQuoteGlobalHits.length >= GLOBAL_MAX) {
        return res
          .status(429)
          .json({ success: false, error: "الخدمة مزدحمة، حاول بعد قليل" });
      }

      // Per-IP window
      const ipHits = (bagQuoteIpHits.get(ip) || []).filter(
        (t: any) => now - t < IP_WINDOW_MS,
      );
      if (ipHits.length >= IP_MAX) {
        return res.status(429).json({
          success: false,
          error: "تم تجاوز عدد الطلبات المسموح. يرجى المحاولة لاحقاً.",
        });
      }

      const schema = z.object({
        customer: z.object({
          name: z.string().trim().min(2, "الاسم قصير جداً").max(100),
          phone: z.string().trim().min(8, "رقم الجوال غير صحيح").max(20),
        }),
        configuration: z.record(z.any()),
        summary: z
          .array(z.object({ label: z.string(), value: z.string().max(500) }))
          .max(50)
          .optional(),
        validation: z
          .object({
            isValid: z.boolean(),
            errors: z
              .array(z.object({ message: z.string().max(500) }).passthrough())
              .max(50)
              .default([]),
            warnings: z
              .array(z.object({ message: z.string().max(500) }).passthrough())
              .max(50)
              .default([]),
          })
          .optional(),
      });

      const data = schema.parse(req.body);

      // Server-side phone normalization & validation
      const normalizedPhone = normalizePhoneServer(data.customer.phone);
      if (!normalizedPhone) {
        return res
          .status(400)
          .json({ success: false, error: "رقم الجوال غير صحيح" });
      }

      // Record the hit only after validation succeeds
      ipHits.push(now);
      bagQuoteIpHits.set(ip, ipHits);
      bagQuoteGlobalHits.push(now);

      // Periodic cleanup of stale IP entries (cheap)
      if (bagQuoteIpHits.size > 1000) {
        for (const [k, arr] of bagQuoteIpHits) {
          const fresh = arr.filter((t: any) => now - t < IP_WINDOW_MS);
          if (fresh.length === 0) bagQuoteIpHits.delete(k);
          else bagQuoteIpHits.set(k, fresh);
        }
      }

      const ref = `BQ-${Date.now().toString(36).toUpperCase().slice(-6)}`;

      // Sanitize untrusted text before inlining it into the WhatsApp message:
      // strip newlines and the WhatsApp formatting characters (* _ ~ `) so a
      // malicious customer name or summary value cannot spoof message
      // sections (e.g. inject a fake "*مواصفات الكيس:*" header) or break the
      // line-based parsing used downstream.
      const sanitizeForWhatsApp = (raw: unknown): string =>
        String(raw ?? "")
          .replace(/[\r\n]+/g, " ")
          .replace(/[*_~`]/g, "")
          .trim()
          .slice(0, 500);

      const safeName = sanitizeForWhatsApp(data.customer.name);

      const lines: string[] = [
        "🔔 *طلب تصميم كيس جديد*",
        `📋 المرجع: ${ref}`,
        "",
        `👤 الاسم: ${safeName}`,
        `📞 الجوال: ${normalizedPhone}`,
        "",
        "📦 *مواصفات الكيس:*",
        ...(data.summary || []).map(
          (s) =>
            `• ${sanitizeForWhatsApp(s.label)}: ${sanitizeForWhatsApp(s.value)}`,
        ),
      ];

      if (
        data.validation &&
        !data.validation.isValid &&
        data.validation.errors.length
      ) {
        lines.push("", "⚠️ *ملاحظات فنية:*");
        for (const e of data.validation.errors)
          lines.push(`- ${sanitizeForWhatsApp(e.message)}`);
      }

      lines.push(
        "",
        `🕒 ${new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })}`,
      );
      const message = lines.join("\n");

      // Resolve owner phone (env override → primary admin)
      let ownerPhone = (process.env.OWNER_WHATSAPP_PHONE || "").trim();
      if (!ownerPhone) {
        try {
          const admin = await storage.getUser(1);
          ownerPhone = (admin as any)?.phone || "";
        } catch {}
      }

      let whatsappSent = false;
      let whatsappError: string | undefined;
      if (ownerPhone) {
        try {
          const waResult = await notificationService.sendWhatsAppMessage(
            ownerPhone,
            message,
            {
              title: `طلب تصميم كيس — ${data.customer.name}`,
              priority: "high",
              context_type: "bag_quote",
              context_id: ref,
            },
          );
          whatsappSent = !!waResult.success;
          if (!waResult.success) whatsappError = waResult.error;
        } catch (err: any) {
          whatsappError = err?.message || String(err);
        }
      } else {
        whatsappError =
          "OWNER_WHATSAPP_PHONE غير مُعد ولا يوجد رقم لمسؤول النظام";
      }

      // Always create an internal notification so it shows in /notifications
      try {
        await storage.createNotification({
          title: `طلب تصميم كيس جديد من ${data.customer.name}`,
          title_ar: `طلب تصميم كيس جديد من ${data.customer.name}`,
          message,
          message_ar: message,
          type: "system",
          priority: "high",
          recipient_type: "user",
          recipient_id: "1",
          phone_number: normalizedPhone,
          status: "sent",
          context_type: "bag_quote",
          context_id: ref,
        } as any);
      } catch (err) {
        logger.warn("Failed to persist internal bag-quote notification", {
          err,
        });
      }

      return res.json({
        success: true,
        reference: ref,
        whatsappSent,
        ...(whatsappError ? { whatsappError } : {}),
      });
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({
          success: false,
          error: "بيانات غير صحيحة",
          details: error.issues.map((i: any) => i.message),
        });
      }
      logger.error("Public bag-quote endpoint failed", {
        error: error?.message,
      });
      return res
        .status(500)
        .json({ success: false, error: "تعذر إرسال الطلب، حاول مرة أخرى" });
    }
  });

  // ---- Bag configurator: email customer-request report to management ----
  app.post("/api/public/bag-configurator-report", async (req, res) => {
    try {
      // Rate limiting (shares the bag-quote window state)
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      while (
        bagQuoteGlobalHits.length &&
        now - bagQuoteGlobalHits[0] > GLOBAL_WINDOW_MS
      ) {
        bagQuoteGlobalHits.shift();
      }
      if (bagQuoteGlobalHits.length >= GLOBAL_MAX) {
        return res
          .status(429)
          .json({ success: false, error: "الخدمة مزدحمة، حاول بعد قليل" });
      }
      const ipHits = (bagQuoteIpHits.get(ip) || []).filter(
        (t: any) => now - t < IP_WINDOW_MS,
      );
      if (ipHits.length >= IP_MAX) {
        return res.status(429).json({
          success: false,
          error: "تم تجاوز عدد الطلبات المسموح. يرجى المحاولة لاحقاً.",
        });
      }

      // Recipient is server-configured only — never trust client-supplied addresses
      const recipients = (process.env.MANAGEMENT_EMAIL || "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
      if (recipients.length === 0) {
        return res.status(503).json({
          success: false,
          error:
            "لم يتم تكوين بريد الإدارة. يرجى إضافة MANAGEMENT_EMAIL في إعدادات الخادم.",
        });
      }

      const schema = z.object({
        customer: z
          .object({
            name: z.string().trim().max(100).optional().default(""),
            phone: z.string().trim().max(30).optional().default(""),
          })
          .default({ name: "", phone: "" }),
        configuration: z.object({
          bagType: z.string().max(50),
          bagTypeLabel: z.string().max(100),
          width: z.number().nonnegative().max(500),
          length: z.number().nonnegative().max(500),
          sideGusset: z.number().nonnegative().max(200),
          thicknessMicrons: z.number().nonnegative().max(500),
          bagColor: z.string().max(50),
          printColorsCount: z.number().int().min(0).max(8),
          printText: z.string().max(200).optional().default(""),
          bagsPerKg: z.number().nonnegative().max(1_000_000),
        }),
        imageDataUrl: z
          .string()
          .max(2 * 1024 * 1024)
          .optional()
          .nullable(),
      });

      const data = schema.parse(req.body);
      ipHits.push(now);
      bagQuoteIpHits.set(ip, ipHits);
      bagQuoteGlobalHits.push(now);

      const cfg = data.configuration;
      const ref = `BC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const safe = (s: string) =>
        String(s ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
          .slice(0, 500);

      const rows: Array<[string, string]> = [
        ["العميل", safe(data.customer.name) || "—"],
        ["الجوال", safe(data.customer.phone) || "—"],
        ["نوع الكيس", safe(cfg.bagTypeLabel)],
        ["العرض", `${cfg.width} سم`],
        ["الطول", `${cfg.length} سم`],
        ["الطية / العمق", cfg.sideGusset > 0 ? `${cfg.sideGusset} سم` : "بدون"],
        ["السماكة التقديرية", `${cfg.thicknessMicrons} ميكرون`],
        ["لون الكيس", safe(cfg.bagColor)],
        ["عدد ألوان الطباعة", `${cfg.printColorsCount}`],
        ["نص الطباعة", safe(cfg.printText) || "—"],
        [
          "عدد الأكياس / كجم (تقريبي)",
          `≈ ${cfg.bagsPerKg.toLocaleString("ar-EG")}`,
        ],
      ];
      const rowsHtml = rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 10px;font-weight:600;color:#374151;width:45%;border-bottom:1px solid #e5e7eb;">${k}</td><td style="padding:8px 10px;color:#111827;text-align:left;border-bottom:1px solid #e5e7eb;">${v}</td></tr>`,
        )
        .join("");

      const attachments: Array<{
        filename: string;
        content: Buffer;
        contentType: string;
        cid?: string;
      }> = [];
      let imageHtml = "";
      if (
        data.imageDataUrl &&
        typeof data.imageDataUrl === "string" &&
        data.imageDataUrl.startsWith("data:image/")
      ) {
        const match = data.imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          const ctype = match[1];
          const buf = Buffer.from(match[2], "base64");
          if (buf.length <= 2 * 1024 * 1024) {
            const ext = ctype.split("/")[1] || "png";
            attachments.push({
              filename: `bag-${ref}.${ext}`,
              content: buf,
              contentType: ctype,
              cid: "bagpreview",
            });
            imageHtml = `<div style="text-align:center;margin:12px 0;"><img src="cid:bagpreview" alt="معاينة الكيس" style="max-width:100%;max-height:380px;border:2px solid #2563eb;border-radius:10px;padding:8px;background:#f8fafc;" /></div>`;
          }
        }
      }

      const htmlBody = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Tajawal','Segoe UI',Tahoma,Arial,sans-serif;background:#f3f4f6;padding:20px;color:#1f2937;margin:0;">
  <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:18px 22px;">
      <h1 style="margin:0;font-size:20px;font-weight:700;">طلب تصميم كيس جديد من العميل</h1>
      <div style="font-size:12px;opacity:.85;margin-top:4px;">المرجع: ${ref} — ${new Date().toLocaleString("ar-SA")}</div>
    </div>
    <div style="padding:20px;">
      ${imageHtml}
      <h2 style="font-size:15px;color:#1e3a5f;margin:14px 0 8px;">المواصفات</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">${rowsHtml}</table>
      <div style="background:#dcfce7;color:#166534;padding:12px 14px;border-radius:8px;margin-top:14px;font-weight:700;text-align:center;font-size:14px;">
        عدد الأكياس في الكيلو تقريباً: ${cfg.bagsPerKg.toLocaleString("ar-EG")}
      </div>
    </div>
    <div style="background:#f8fafc;padding:12px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;">
      MPBF — معالج تصميم الأكياس
    </div>
  </div>
</body>
</html>`;

      const subject = `طلب تصميم كيس — ${safe(data.customer.name) || "عميل"} — ${ref}`;
      const fromEmail =
        process.env.SENDGRID_FROM_EMAIL ||
        process.env.SMTP_FROM ||
        "noreply@modplastic.com";
      const fromName = "MPBF — معالج تصميم الأكياس";

      const sendgridApiKey = process.env.SENDGRID_API_KEY;
      let sent = false;
      let method: string | undefined;
      let sendError: string | undefined;

      if (sendgridApiKey) {
        try {
          const sgMail = (await import("@sendgrid/mail")).default;
          sgMail.setApiKey(sendgridApiKey);
          await sgMail.send({
            to: recipients,
            from: { email: fromEmail, name: fromName },
            subject,
            html: htmlBody,
            attachments: attachments.map((a) => ({
              filename: a.filename,
              content: a.content.toString("base64"),
              type: a.contentType,
              disposition: "inline",
              content_id: a.cid,
            })),
          });
          sent = true;
          method = "sendgrid";
        } catch (e: any) {
          sendError = e?.response?.body?.errors?.[0]?.message || e?.message;
          logger.error("Bag report SendGrid error", { error: sendError });
        }
      }

      if (!sent) {
        const smtpHost = process.env.SMTP_HOST;
        const smtpUser =
          process.env.SMTP_USER || (sendgridApiKey ? "apikey" : undefined);
        const smtpPass = process.env.SMTP_PASS || sendgridApiKey;
        if (smtpHost || sendgridApiKey) {
          try {
            const nodemailer = (await import("nodemailer")).default;
            const transport = nodemailer.createTransport(
              smtpHost
                ? {
                    host: smtpHost,
                    port: parseInt(process.env.SMTP_PORT || "587"),
                    secure: process.env.SMTP_SECURE === "true",
                    auth: { user: smtpUser!, pass: smtpPass! },
                  }
                : {
                    host: "smtp.sendgrid.net",
                    port: 587,
                    secure: false,
                    auth: { user: "apikey", pass: sendgridApiKey! },
                  },
            );
            await transport.sendMail({
              from: `"${fromName}" <${fromEmail}>`,
              to: recipients.join(", "),
              subject,
              html: htmlBody,
              attachments: attachments.map((a) => ({
                filename: a.filename,
                content: a.content,
                contentType: a.contentType,
                cid: a.cid,
              })),
            });
            sent = true;
            method = "smtp";
          } catch (e: any) {
            sendError = e?.message;
            logger.error("Bag report SMTP error", { error: sendError });
          }
        }
      }

      if (!sent) {
        return res.status(503).json({
          success: false,
          error:
            "تعذر إرسال البريد الإلكتروني. يرجى التأكد من تكوين SENDGRID_API_KEY أو SMTP في الخادم.",
        });
      }

      return res.json({ success: true, reference: ref, method });
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({
          success: false,
          error: "بيانات غير صحيحة",
          details: error.issues.map((i: any) => i.message),
        });
      }
      logger.error("Bag configurator report endpoint failed", {
        error: error?.message,
      });
      return res
        .status(500)
        .json({ success: false, error: "تعذر إرسال التقرير" });
    }
  });

  // ==========================================================================
  // PUBLIC: Order view endpoint — no auth required (for QR code scanning)
  // ==========================================================================
  app.get("/api/public/orders/:token", async (req, res) => {
    try {
      const token = req.params.token;
      // Tokens are 64-char hex strings — reject anything that doesn't look right
      if (!token || !/^[0-9a-f]{64}$/i.test(token)) {
        return res.status(400).json({ success: false, message: "رابط الطلب غير صحيح" });
      }

      const order = await storage.getOrderByShareToken(token);
      if (!order) {
        return res.status(404).json({ success: false, message: "الطلب غير موجود" });
      }

      // Fetch related data
      const customer = order.customer_id
        ? await storage.getCustomerById(order.customer_id)
        : null;

      const productionOrdersList = await db
        .select()
        .from(production_orders)
        .where(eq(production_orders.order_id, order.id))
        .orderBy(production_orders.id);

      // Fetch customer products for each production order
      const productionOrdersWithProducts = await Promise.all(
        productionOrdersList.map(async (po: any) => {
          const cp = po.customer_product_id
            ? await storage.getCustomerProductById(Number(po.customer_product_id))
            : null;
          return { ...po, customerProduct: cp };
        }),
      );

      // Aggregate roll progress (film / printing / cutting) per production order
      const poIds = productionOrdersList.map((po: any) => po.id);
      const rollSummaryByPo: Record<
        number,
        {
          film_rolls: number;
          film_weight_kg: number;
          printed_rolls: number;
          printed_weight_kg: number;
          cut_rolls: number;
          cut_weight_kg: number;
        }
      > = {};
      if (poIds.length > 0) {
        const orderRolls = await db
          .select({
            production_order_id: rolls.production_order_id,
            weight_kg: rolls.weight_kg,
            cut_weight_total_kg: rolls.cut_weight_total_kg,
            printed_at: rolls.printed_at,
            cut_completed_at: rolls.cut_completed_at,
          })
          .from(rolls)
          .where(inArray(rolls.production_order_id, poIds));

        for (const r of orderRolls) {
          const poId = Number(r.production_order_id);
          if (!rollSummaryByPo[poId]) {
            rollSummaryByPo[poId] = {
              film_rolls: 0,
              film_weight_kg: 0,
              printed_rolls: 0,
              printed_weight_kg: 0,
              cut_rolls: 0,
              cut_weight_kg: 0,
            };
          }
          const agg = rollSummaryByPo[poId];
          const w = Number(r.weight_kg) || 0;
          agg.film_rolls += 1;
          agg.film_weight_kg += w;
          if (r.printed_at) {
            agg.printed_rolls += 1;
            agg.printed_weight_kg += w;
          }
          if (r.cut_completed_at) {
            agg.cut_rolls += 1;
            agg.cut_weight_kg += Number(r.cut_weight_total_kg) || 0;
          }
        }
      }

      res.set("Cache-Control", "no-cache");
      res.json({
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          created_at: order.created_at,
          delivery_days: order.delivery_days,
          notes: order.notes,
        },
        customer: customer
          ? {
              name_ar: customer.name_ar,
              name: customer.name,
              commercial_name: customer.commercial_name,
            }
          : null,
        production_orders: productionOrdersWithProducts.map((po: any) => ({
          id: po.id,
          production_order_number: po.production_order_number,
          status: po.status,
          quantity_kg: po.quantity_kg,
          produced_quantity_kg: po.produced_quantity_kg,
          notes: po.notes,
          roll_summary: rollSummaryByPo[po.id] || {
            film_rolls: 0,
            film_weight_kg: 0,
            printed_rolls: 0,
            printed_weight_kg: 0,
            cut_rolls: 0,
            cut_weight_kg: 0,
          },
          customer_product: po.customerProduct
            ? {
                size_caption: po.customerProduct.size_caption,
                width: po.customerProduct.width,
                cutting_length_cm: po.customerProduct.cutting_length_cm,
                thickness: po.customerProduct.thickness,
                raw_material: po.customerProduct.raw_material,
                print_colors: po.customerProduct.print_colors,
                is_printed: po.customerProduct.is_printed,
                handle_type: po.customerProduct.handle_type,
                unit_weight_gram: po.customerProduct.unit_weight_gram,
              }
            : null,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching public order:", error);
      res.status(500).json({ success: false, message: "خطأ في جلب بيانات الطلب" });
    }
  });

  // Health check endpoint for deployment
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // ============ Setup API ============

  app.get("/api/setup/status", async (_req, res) => {
    try {
      const setting = await storage.getSystemSettingByKey("setup_completed");
      const isCompleted = setting?.setting_value === "true";
      res.json({ setupCompleted: isCompleted });
    } catch (error) {
      res.json({ setupCompleted: false });
    }
  });

  app.post("/api/setup/initialize", async (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "unknown").split(",")[0].trim();
      const now = Date.now();
      const window = 15 * 60 * 1000;
      const entry = setupAttempts.get(ip);
      if (entry && now < entry.resetAt) {
        if (entry.count >= 5) {
          return res.status(429).json({ message: "محاولات كثيرة جداً. حاول مرة أخرى بعد 15 دقيقة." });
        }
        entry.count++;
      } else {
        setupAttempts.set(ip, { count: 1, resetAt: now + window });
      }

      if (ctx.setupInProgress) {
        return res
          .status(409)
          .json({ message: "عملية الإعداد قيد التنفيذ بالفعل" });
      }

      const existing = await storage.getSystemSettingByKey("setup_completed");
      if (existing?.setting_value === "true") {
        return res.status(400).json({ message: "تم إعداد النظام مسبقاً" });
      }

      // Hard safeguard: this endpoint is intentionally unauthenticated so a
      // brand-new instance can be configured. Once any user exists, refuse —
      // the operator must use the authenticated admin endpoints instead.
      try {
        const [{ c: userCount }] = await db
          .select({ c: sql<number>`count(*)::int` })
          .from(users);
        if ((userCount ?? 0) > 0) {
          return res.status(403).json({
            message: "النظام يحتوي على مستخدمين مسبقاً — لا يمكن إعادة الإعداد",
          });
        }
      } catch (_) {
        // Users table not queryable yet → treat as fresh install.
      }

      const { company, admin } = req.body;

      if (
        !company?.name ||
        !admin?.username ||
        !admin?.password ||
        !admin?.displayName
      ) {
        return res
          .status(400)
          .json({ message: "جميع الحقول المطلوبة يجب أن تكون مملوءة" });
      }

      if (admin.password.length < 6) {
        return res
          .status(400)
          .json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      ctx.setupInProgress = true;

      try {
        const doubleCheck =
          await storage.getSystemSettingByKey("setup_completed");
        if (doubleCheck?.setting_value === "true") {
          return res.status(400).json({ message: "تم إعداد النظام مسبقاً" });
        }

        const existingUser = await storage.getUserByUsername(admin.username);
        if (existingUser) {
          return res.status(400).json({
            message: "اسم المستخدم مستخدم بالفعل. اختر اسم مستخدم آخر.",
          });
        }

        const companySettings: Record<string, string> = {
          companyName: company.name,
          companyPhone: company.phone || "",
          companyAddress: company.address || "",
          companyTaxNumber: company.taxNumber || "",
          companyEmail: company.email || "",
          country: company.country || "المملكة العربية السعودية",
          region: company.region || "الرياض",
          currency: company.currency || "SAR",
          language: company.language || "ar",
          timezone: "Asia/Riyadh",
          workingHoursStart: company.workingHoursStart || "08:00",
          workingHoursEnd: company.workingHoursEnd || "17:00",
        };

        for (const [key, value] of Object.entries(companySettings)) {
          const existingSetting = await storage.getSystemSettingByKey(key);
          if (existingSetting) {
            await storage.updateSystemSetting(key, value);
          } else {
            await storage.createSystemSetting({
              setting_key: key,
              setting_value: value,
            });
          }
        }

        const hashedPassword = await bcrypt.hash(admin.password, 10);
        const adminUser = await storage.createUser({
          username: admin.username,
          password: hashedPassword,
          display_name: admin.displayName,
          display_name_ar: admin.displayNameAr || admin.displayName,
          phone: admin.phone || null,
          email: admin.email || null,
          role_id: 1,
          status: "active",
        });

        const setupSetting =
          await storage.getSystemSettingByKey("setup_completed");
        if (setupSetting) {
          await storage.updateSystemSetting("setup_completed", "true");
        } else {
          await storage.createSystemSetting({
            setting_key: "setup_completed",
            setting_value: "true",
          });
        }

        const setupDateSetting =
          await storage.getSystemSettingByKey("setup_date");
        if (setupDateSetting) {
          await storage.updateSystemSetting(
            "setup_date",
            new Date().toISOString(),
          );
        } else {
          await storage.createSystemSetting({
            setting_key: "setup_date",
            setting_value: new Date().toISOString(),
          });
        }

        res.json({
          success: true,
          message: "تم إعداد النظام بنجاح",
          adminUserId: adminUser.id,
        });
      } finally {
        ctx.setupInProgress = false;
      }
    } catch (error: any) {
      console.error("Error during setup:", error);
      ctx.setupInProgress = false;
      console.error("Setup error details:", error.message);
      res
        .status(500)
        .json({ message: "خطأ في إعداد النظام. يرجى المحاولة مرة أخرى." });
    }
  });

  // ============ Settings API ============

  // System Settings
  app.get(
    "/api/settings/system",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const settings = await storage.getSystemSettings();
        res.json(settings);
      } catch (error) {
        console.error("Error fetching system settings:", error);
        res.status(500).json({ message: "خطأ في جلب إعدادات النظام" });
      }
    },
  );

  app.post(
    "/api/settings/system",
    requireAuth,
    requirePermission("add_settings", "manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const { settings } = req.body;
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: "المستخدم غير مصرح له" });
        }

        const results = [];

        for (const [key, value] of Object.entries(settings)) {
          try {
            const existingSetting = await storage.getSystemSettingByKey(key);
            if (existingSetting) {
              const updated = await storage.updateSystemSetting(
                key,
                String(value),
                userId,
              );
              results.push(updated);
            } else {
              const created = await storage.createSystemSetting({
                setting_key: key,
                setting_value: String(value),
                updated_by: Number(userId),
              });
              results.push(created);
            }
          } catch (error) {
            console.error(`Error saving setting ${key}:`, error);
          }
        }

        res.json({ message: "تم حفظ إعدادات النظام بنجاح", settings: results });
      } catch (error) {
        console.error("Error saving system settings:", error);
        res.status(500).json({ message: "خطأ في حفظ إعدادات النظام" });
      }
    },
  );

  // User Settings
  app.get("/api/settings/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
      }
      const authUserId = getAuthUserId(req);
      if (authUserId !== userId) {
        return res
          .status(403)
          .json({ message: "لا يمكنك الوصول إلى إعدادات مستخدم آخر" });
      }
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "خطأ في جلب إعدادات المستخدم" });
    }
  });

  app.post("/api/settings/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
      }
      const authUserId = getAuthUserId(req);
      if (authUserId !== userId) {
        return res
          .status(403)
          .json({ message: "لا يمكنك تعديل إعدادات مستخدم آخر" });
      }
      const { settings } = req.body;
      const results = [];

      for (const [key, value] of Object.entries(settings)) {
        try {
          const updated = await storage.updateUserSetting(
            userId,
            key,
            String(value),
          );
          results.push(updated);
        } catch (error) {
          console.error(`Error saving user setting ${key}:`, error);
        }
      }

      res.json({ message: "تم حفظ إعداداتك الشخصية بنجاح", settings: results });
    } catch (error) {
      console.error("Error saving user settings:", error);
      res.status(500).json({ message: "خطأ في حفظ إعدادات المستخدم" });
    }
  });

  app.get("/api/company/logo", async (_req, res) => {
    try {
      const now = Date.now();
      // Serve from cache when fresh.
      if (ctx.companyLogoCache && ctx.companyLogoCache.expiresAt > now) {
        res.set(
          "Cache-Control",
          "public, max-age=3600, stale-while-revalidate=86400",
        );
        return res.json({ logo_url: ctx.companyLogoCache.logo_url });
      }
      // Stale-while-revalidate: if we have *any* cached value, serve it
      // immediately and refresh in the background. Only block when there is
      // truly nothing cached yet.
      if (ctx.companyLogoCache) {
        loadCompanyLogo().catch(() => {});
        res.set(
          "Cache-Control",
          "public, max-age=3600, stale-while-revalidate=86400",
        );
        return res.json({ logo_url: ctx.companyLogoCache.logo_url });
      }
      const logo_url = await loadCompanyLogo();
      res.set(
        "Cache-Control",
        "public, max-age=3600, stale-while-revalidate=86400",
      );
      res.json({ logo_url });
    } catch (error) {
      console.error("Error fetching company logo:", error);
      res.status(500).json({ message: "خطأ في جلب شعار الشركة" });
    }
  });

  app.post(
    "/api/company/logo",
    requireAuth,
    requirePermission("add_settings", "manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const { logo_url } = req.body;
        if (
          !logo_url ||
          typeof logo_url !== "string" ||
          !logo_url.startsWith("/objects/")
        ) {
          return res.status(400).json({ message: "رابط الشعار غير صالح" });
        }
        const [existing] = await db.select().from(company_profile).limit(1);
        if (existing) {
          await db
            .update(company_profile)
            .set({ logo_url })
            .where(eq(company_profile.id, existing.id));
        } else {
          await db
            .insert(company_profile)
            .values({ name: "Company", logo_url });
        }
        ctx.companyLogoVersion += 1;
        ctx.companyLogoCache = {
          logo_url,
          expiresAt: Date.now() + COMPANY_LOGO_CACHE_TTL_MS,
        };
        res.json({ message: "تم حفظ شعار الشركة بنجاح", logo_url });
      } catch (error) {
        console.error("Error saving company logo:", error);
        res.status(500).json({ message: "خطأ في حفظ شعار الشركة" });
      }
    },
  );

  // Letter template (header/footer for AI-generated documents)
  app.get("/api/company/letter-template", requireAuth, async (_req, res) => {
    try {
      const [profile] = await db
        .select({
          letter_header_image_url: company_profile.letter_header_image_url,
          letter_footer_image_url: company_profile.letter_footer_image_url,
          letter_footer_text: company_profile.letter_footer_text,
          letter_default_signatures: company_profile.letter_default_signatures,
        })
        .from(company_profile)
        .limit(1);
      res.json(
        profile || {
          letter_header_image_url: null,
          letter_footer_image_url: null,
          letter_footer_text: null,
          letter_default_signatures: null,
        },
      );
    } catch (error) {
      console.error("Error fetching letter template:", error);
      res.status(500).json({ message: "خطأ في جلب قالب الخطابات" });
    }
  });

  app.patch(
    "/api/company/letter-template",
    requireAuth,
    requirePermission("edit_settings", "manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const {
          letter_header_image_url,
          letter_footer_image_url,
          letter_footer_text,
          letter_default_signatures,
        } = req.body || {};

        const validateObjPath = (v: any) => {
          if (v === null || v === undefined || v === "") return null;
          if (typeof v !== "string" || !v.startsWith("/objects/")) {
            throw new Error("INVALID_OBJECT_PATH");
          }
          return v;
        };

        const updates: any = {};
        if (letter_header_image_url !== undefined) {
          updates.letter_header_image_url = validateObjPath(
            letter_header_image_url,
          );
        }
        if (letter_footer_image_url !== undefined) {
          updates.letter_footer_image_url = validateObjPath(
            letter_footer_image_url,
          );
        }
        if (letter_footer_text !== undefined) {
          updates.letter_footer_text =
            typeof letter_footer_text === "string"
              ? letter_footer_text.slice(0, 2000)
              : null;
        }
        if (letter_default_signatures !== undefined) {
          if (
            letter_default_signatures !== null &&
            !Array.isArray(letter_default_signatures)
          ) {
            return res
              .status(400)
              .json({ message: "قائمة التوقيعات يجب أن تكون مصفوفة" });
          }
          updates.letter_default_signatures = letter_default_signatures || null;
        }

        const [existing] = await db.select().from(company_profile).limit(1);
        if (existing) {
          await db
            .update(company_profile)
            .set(updates)
            .where(eq(company_profile.id, existing.id));
        } else {
          await db
            .insert(company_profile)
            .values({ name: "Company", ...updates });
        }
        invalidateLetterheadCache();
        res.json({ message: "تم حفظ قالب الخطابات بنجاح" });
      } catch (error: any) {
        if (error?.message === "INVALID_OBJECT_PATH") {
          return res
            .status(400)
            .json({ message: "مسار الصورة غير صالح" });
        }
        console.error("Error saving letter template:", error);
        res.status(500).json({ message: "خطأ في حفظ قالب الخطابات" });
      }
    },
  );

  // Database Management routes
  app.get("/api/database/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDatabaseStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching database stats:", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات قاعدة البيانات" });
    }
  });

  app.post("/api/database/backup", requireAdmin, async (req, res) => {
    try {
      const backup = await storage.createDatabaseBackup();

      // Set headers for file download
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${backup.filename}"`,
      );

      // Send the backup data directly for download
      res.send(backup.data);
    } catch (error) {
      console.error("Error creating database backup:", error);
      res.status(500).json({ message: "خطأ في إنشاء النسخة الاحتياطية" });
    }
  });

  app.get(
    "/api/database/backup/download/:backupId",
    requireAdmin,
    async (req, res) => {
      try {
        const backupId = req.params.backupId;
        const backupFile = await storage.getBackupFile(backupId);

        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="backup-${backupId}.sql"`,
        );
        res.send(backupFile);
      } catch (error) {
        console.error("Error downloading backup:", error);
        res.status(500).json({ message: "خطأ في تحميل النسخة الاحتياطية" });
      }
    },
  );

  app.post("/api/database/restore", requireAdmin, async (req, res) => {
    try {
      const { backupData } = req.body;
      if (!backupData || typeof backupData !== "object") {
        return res
          .status(400)
          .json({ message: "بيانات النسخة الاحتياطية مطلوبة" });
      }
      const result = await storage.restoreDatabaseBackup(backupData);
      res.json({
        message: result.message || "تم استعادة قاعدة البيانات بنجاح",
        ...result,
      });
    } catch (error: any) {
      console.error("Error restoring database:", error);
      res
        .status(500)
        .json({ message: error.message || "خطأ في استعادة قاعدة البيانات" });
    }
  });

  app.get("/api/database/export/:tableName", requireAdmin, async (req, res) => {
    try {
      const tableName = req.params.tableName;
      const format = (req.query.format as string) || "csv";

      const data = await storage.exportTableData(tableName, format);

      let contentType = "text/csv";
      let fileExtension = "csv";

      switch (format) {
        case "json":
          contentType = "application/json";
          fileExtension = "json";
          break;
        case "excel":
          contentType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          fileExtension = "xlsx";
          break;
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${tableName}.${fileExtension}"`,
      );

      // Set proper charset for CSV to ensure Arabic text encoding
      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
      }

      res.send(data);
    } catch (error) {
      console.error("Error exporting table data:", error);
      res.status(500).json({ message: "خطأ في تصدير بيانات الجدول" });
    }
  });

  app.get(
    "/api/database/table-schema/:tableName",
    requireAdmin,
    async (req, res) => {
      try {
        const tableName = req.params.tableName;
        const allowedTables = [
          "customers",
          "categories",
          "sections",
          "items",
          "customer_products",
          "users",
          "roles",
          "machines",
          "locations",
          "suppliers",
          "orders",
          "production_orders",
          "rolls",
          "cuts",
          "inventory",
          "inventory_movements",
          "warehouse_receipts",
          "warehouse_transactions",
          "maintenance_requests",
          "maintenance_actions",
          "spare_parts",
          "consumable_parts",
          "waste",
          "quality_checks",
          "attendance",
          "notifications",
        ];
        if (!allowedTables.includes(tableName)) {
          return res
            .status(404)
            .json({ message: `الجدول غير موجود: ${tableName}` });
        }

        const result = await db.execute(sql`
        SELECT
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END as is_primary
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu
          ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
        LEFT JOIN information_schema.table_constraints tc
          ON kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY'
        WHERE c.table_name = ${tableName}
        ORDER BY c.ordinal_position
      `);

        const columns = (result.rows || []).map((row: any) => ({
          name: row.column_name,
          dataType: row.data_type,
          notNull: row.is_nullable === "NO",
          hasDefault: !!row.column_default,
          isAutoGenerated:
            !!row.column_default &&
            (String(row.column_default).includes("nextval") ||
              String(row.column_default).includes("now()") ||
              String(row.column_default).includes("CURRENT_TIMESTAMP")),
          isPrimary: row.is_primary === true || row.is_primary === "t",
        }));

        res.json({ tableName, columns });
      } catch (error) {
        console.error("Error getting table schema:", error);
        res.status(500).json({ message: "خطأ في جلب بنية الجدول" });
      }
    },
  );

  app.post(
    "/api/database/import/:tableName",
    requireAdmin,
    async (req, res) => {
      try {
        const tableName = req.params.tableName;
        const { data, format } = req.body;

        const result = await storage.importTableData(tableName, data, format);
        res.json({
          message: "تم استيراد البيانات بنجاح",
          importedRecords: result.count,
        });
      } catch (error) {
        console.error("Error importing table data:", error);
        res.status(500).json({ message: "خطأ في استيراد البيانات" });
      }
    },
  );

  // Enhanced batch import endpoint
  app.post(
    "/api/database/import/:tableName/batch",
    requireAdmin,
    async (req, res) => {
      try {
        const tableName = req.params.tableName;
        const { data, options } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
          return res
            .status(400)
            .json({ message: "البيانات المرسلة غير صالحة" });
        }

        const results = {
          successful: 0,
          failed: 0,
          errors: [] as string[],
          warnings: [] as string[],
        };

        // Process each record in the batch
        for (let i = 0; i < data.length; i++) {
          const record = data[i];

          try {
            // Validate and process the record based on table type
            const processedRecord = { ...record };

            // Table-specific processing
            if (tableName === "customers") {
              // Generate ID if not provided
              if (!processedRecord.id) {
                const existingCustomers = await storage.getAllCustomers();
                const lastId =
                  existingCustomers.length > 0
                    ? Math.max(
                        ...existingCustomers.map((c) => {
                          const idNum = parseInt(c.id.replace("CID", ""));
                          return isNaN(idNum) ? 0 : idNum;
                        }),
                      )
                    : 0;
                processedRecord.id = `CID${String(lastId + 1).padStart(4, "0")}`;
              }

              // Validate using schema
              const validatedRecord =
                insertCustomerSchema.parse(processedRecord);
              await storage.createCustomer(validatedRecord);
            } else if (tableName === "categories") {
              // Generate ID if not provided
              if (!processedRecord.id) {
                const existingCategories = await storage.getCategories();
                const lastId =
                  existingCategories.length > 0
                    ? Math.max(
                        ...existingCategories.map((c) => {
                          const idNum = parseInt(c.id.replace("CAT", ""));
                          return isNaN(idNum) ? 0 : idNum;
                        }),
                      )
                    : 0;
                processedRecord.id = `CAT${String(lastId + 1).padStart(2, "0")}`;
              }

              await storage.createCategory(processedRecord);
            } else if (tableName === "sections") {
              // Generate ID if not provided
              if (!processedRecord.id) {
                const existingSections = await storage.getSections();
                const lastId =
                  existingSections.length > 0
                    ? Math.max(
                        ...existingSections.map((s) => {
                          const idNum = parseInt(s.id.replace("SEC", ""));
                          return isNaN(idNum) ? 0 : idNum;
                        }),
                      )
                    : 0;
                processedRecord.id = `SEC${String(lastId + 1).padStart(2, "0")}`;
              }

              await storage.createSection(processedRecord);
            } else if (tableName === "items") {
              // Generate ID if not provided
              if (!processedRecord.id) {
                const existingItems = await storage.getItems();
                const lastId =
                  existingItems.length > 0
                    ? Math.max(
                        ...existingItems.map((i) => {
                          const idNum = parseInt(i.id.replace("ITM", ""));
                          return isNaN(idNum) ? 0 : idNum;
                        }),
                      )
                    : 0;
                processedRecord.id = `ITM${String(lastId + 1).padStart(3, "0")}`;
              }

              await storage.createItem(processedRecord);
            } else if (tableName === "customer_products") {
              // Auto-increment numeric ID
              if (!processedRecord.id) {
                const existingProductsResult =
                  await storage.getCustomerProducts();
                const lastId =
                  existingProductsResult.data.length > 0
                    ? Math.max(
                        ...existingProductsResult.data
                          .map((p: any) => p.id)
                          .filter((id: any) => typeof id === "number"),
                      )
                    : 0;
                processedRecord.id = lastId + 1;
              }

              // Handle cutting_unit field specifically to ensure it's included
              if (
                processedRecord.cutting_unit !== undefined &&
                processedRecord.cutting_unit !== null
              ) {
                // Keep the cutting_unit value as is
              }

              // Convert numeric string fields to proper types
              const numericFields = [
                "width",
                "left_facing",
                "right_facing",
                "thickness",
                "unit_weight_kg",
                "package_weight_kg",
              ];
              numericFields.forEach((field) => {
                if (
                  processedRecord[field] &&
                  typeof processedRecord[field] === "string"
                ) {
                  const numValue = parseFloat(processedRecord[field]);
                  if (!isNaN(numValue)) {
                    processedRecord[field] = numValue;
                  }
                }
              });

              const integerFields = ["cutting_length_cm", "unit_quantity"];
              integerFields.forEach((field) => {
                if (
                  processedRecord[field] &&
                  typeof processedRecord[field] === "string"
                ) {
                  const intValue = parseInt(processedRecord[field]);
                  if (!isNaN(intValue)) {
                    processedRecord[field] = intValue;
                  }
                }
              });

              // Handle boolean fields
              if (processedRecord.is_printed !== undefined) {
                processedRecord.is_printed =
                  processedRecord.is_printed === "true" ||
                  processedRecord.is_printed === true;
              }

              // Validate using schema
              const validatedRecord =
                insertCustomerProductSchema.parse(processedRecord);
              await storage.createCustomerProduct(validatedRecord);
            } else if (tableName === "users") {
              // Auto-increment numeric ID
              if (!processedRecord.id) {
                const existingUsers = await storage.getSafeUsers();
                const lastId =
                  existingUsers.length > 0
                    ? Math.max(...existingUsers.map((u) => u.id))
                    : 0;
                processedRecord.id = lastId + 1;
              }

              // Set default role if not provided
              if (!processedRecord.role_id) {
                processedRecord.role_id = 2; // Default user role
              }

              // Set random temporary password if not provided (required for user creation)
              // Admin must reset password for imported users after import
              if (!processedRecord.password) {
                const tempPassword = crypto
                  .randomBytes(12)
                  .toString("base64url");
                processedRecord.password = tempPassword;
                logger.warn(
                  `Imported user "${processedRecord.username}" created with temporary random password - admin must reset`,
                );
              }

              // Ensure username is set (use id if not provided)
              if (!processedRecord.username) {
                processedRecord.username = String(processedRecord.id);
              }

              // Validate using schema
              const validatedRecord = insertUserSchema.parse(processedRecord);
              await storage.createUser(validatedRecord);
            } else if (tableName === "machines") {
              // Generate ID if not provided
              if (!processedRecord.id) {
                const existingMachines = await storage.getMachines();
                const lastId =
                  existingMachines.length > 0
                    ? Math.max(
                        ...existingMachines.map((m) => {
                          const idNum = parseInt(m.id.replace("MAC", ""));
                          return isNaN(idNum) ? 0 : idNum;
                        }),
                      )
                    : 0;
                processedRecord.id = `MAC${String(lastId + 1).padStart(2, "0")}`;
              }

              await storage.createMachine(processedRecord);
            } else if (tableName === "locations") {
              // Auto-increment numeric ID
              if (!processedRecord.id) {
                const existingLocations = await storage.getLocations();
                const lastId =
                  existingLocations.length > 0
                    ? Math.max(
                        ...existingLocations.map((l) =>
                          typeof l.id === "number" ? l.id : parseInt(l.id),
                        ),
                      )
                    : 0;
                processedRecord.id = lastId + 1;
              }

              // Validate using schema
              const validatedRecord =
                insertLocationSchema.parse(processedRecord);
              await storage.createLocation(validatedRecord);
            } else {
              return res.status(400).json({
                message: `الاستيراد غير مدعوم لجدول "${tableName}". الجداول المدعومة: customers, categories, sections, items, customer_products, users, machines, locations`,
                successful: results.successful,
                failed: data.length - results.successful,
                errors: [`جدول "${tableName}" غير مدعوم للاستيراد الدفعي`],
                warnings: [],
              });
            }

            results.successful++;
          } catch (error) {
            results.failed++;
            const errorMsg = `السجل ${i + 1}: ${error instanceof Error ? error.message : "خطأ غير معروف"}`;
            results.errors.push(errorMsg);

            if (!options?.continueOnError) {
              // Stop processing if not continuing on error
              break;
            }
          }
        }

        res.json({
          successful: results.successful,
          failed: results.failed,
          errors: results.errors,
          warnings: results.warnings,
          batchNumber: options?.batchNumber || 1,
          totalBatches: options?.totalBatches || 1,
        });
      } catch (error) {
        console.error("Error in batch import:", error);
        res.status(500).json({
          message: "خطأ في معالجة الدفعة",
        });
      }
    },
  );

  app.post("/api/database/optimize", requireAdmin, async (req, res) => {
    try {
      const result = await storage.optimizeTables();
      res.json({ message: "تم تحسين الجداول بنجاح", result });
    } catch (error) {
      console.error("Error optimizing tables:", error);
      res.status(500).json({ message: "خطأ في تحسين الجداول" });
    }
  });

  app.post("/api/database/integrity-check", requireAdmin, async (req, res) => {
    try {
      const result = await storage.checkDatabaseIntegrity();
      res.json({ message: "تم فحص تكامل قاعدة البيانات", result });
    } catch (error) {
      console.error("Error checking database integrity:", error);
      res.status(500).json({ message: "خطأ في فحص تكامل قاعدة البيانات" });
    }
  });

  app.post("/api/database/cleanup", requireAdmin, async (req, res) => {
    try {
      const { daysOld } = req.body;
      const result = await storage.cleanupOldData(daysOld || 90);
      res.json({
        message: "تم تنظيف البيانات القديمة بنجاح",
        deletedRecords: result.count,
      });
    } catch (error) {
      console.error("Error cleaning up old data:", error);
      res.status(500).json({ message: "خطأ في تنظيف البيانات القديمة" });
    }
  });

  // ============ System Settings API ============

  // Get all system settings
  app.get("/api/system-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "خطأ في جلب إعدادات النظام" });
    }
  });

  // Get specific system setting by key
  app.get("/api/system-settings/:key", requireAuth, async (req, res) => {
    try {
      const setting = await storage.getSystemSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "الإعداد غير موجود" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching system setting:", error);
      res.status(500).json({ message: "خطأ في جلب الإعداد" });
    }
  });

  // Update system setting
  app.put(
    "/api/system-settings/:key",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const { setting_value } = req.body;
        if (!getAuthUserId(req)) {
          return res
            .status(401)
            .json({ message: "يجب تسجيل الدخول لتحديث الإعدادات" });
        }
        const updated = await storage.updateSystemSetting(
          req.params.key,
          setting_value,
          getAuthUserId(req),
        );
        res.json(updated);
      } catch (error) {
        console.error("Error updating system setting:", error);
        res.status(500).json({ message: "خطأ في تحديث الإعداد" });
      }
    },
  );

  // Create system setting
  app.post(
    "/api/system-settings",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const validation = insertSystemSettingSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const setting = await storage.createSystemSetting(validation.data);
        res.status(201).json(setting);
      } catch (error) {
        console.error("Error creating system setting:", error);
        res.status(500).json({ message: "خطأ في إنشاء الإعداد" });
      }
    },
  );

  // ============ Factory Locations API ============

  // Get all factory locations
  app.get("/api/factory-locations", requireAuth, async (req, res) => {
    try {
      const locations = await storage.getFactoryLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching factory locations:", error);
      res.status(500).json({ message: "خطأ في جلب مواقع المصانع" });
    }
  });

  // Get active factory locations only
  app.get("/api/factory-locations/active", requireAuth, async (req, res) => {
    try {
      const locations = await storage.getActiveFactoryLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching active factory locations:", error);
      res.status(500).json({ message: "خطأ في جلب المواقع النشطة" });
    }
  });

  // Get single factory location
  app.get("/api/factory-locations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");
      const location = await storage.getFactoryLocation(id);
      if (!location) {
        return res.status(404).json({ message: "الموقع غير موجود" });
      }
      res.json(location);
    } catch (error) {
      console.error("Error fetching factory location:", error);
      res.status(500).json({ message: "خطأ في جلب الموقع" });
    }
  });

  // Create factory location
  app.post("/api/factory-locations", requireAuth, async (req, res) => {
    try {
      const location = await storage.createFactoryLocation({
        ...req.body,
        created_by: getAuthUserId(req),
      });
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating factory location:", error);
      res.status(500).json({ message: "خطأ في إنشاء الموقع" });
    }
  });

  // Update factory location
  app.put("/api/factory-locations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");
      const location = await storage.updateFactoryLocation(id, req.body);
      res.json(location);
    } catch (error) {
      console.error("Error updating factory location:", error);
      res.status(500).json({ message: "خطأ في تحديث الموقع" });
    }
  });

  // Delete factory location
  app.delete(
    "/api/factory-locations/:id",
    requireAuth,
    requirePermission("manage_definitions"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteFactoryLocation(id);
        res.json({ message: "تم حذف الموقع بنجاح" });
      } catch (error) {
        console.error("Error deleting factory location:", error);
        res.status(500).json({ message: "خطأ في حذف الموقع" });
      }
    },
  );

  // إعداد routes التحذيرات الذكية (مُعطّلة جزئياً)
  // app.use("/api/alerts", createAlertsRouter(storage));
  // app.use("/api/system/health", createSystemHealthRouter(storage));
  // app.use("/api/system/performance", createPerformanceRouter(storage));
  // app.use("/api/corrective-actions", createCorrectiveActionsRouter(storage));
  app.use("/api/data-validation", createDataValidationRouter(storage));

  // ============ Factory 3D Simulation API Routes ============

  // Get active rolls with master batch colors for 3D visualization
  app.get("/api/factory-3d/active-rolls", requireAuth, async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          r.id,
          r.roll_number,
          r.stage,
          r.weight_kg,
          r.cut_weight_total_kg,
          r.film_machine_id,
          r.printing_machine_id,
          r.cutting_machine_id,
          r.printed_at,
          r.cut_completed_at,
          r.created_at,
          r.production_order_id,
          po.production_order_number,
          cp.master_batch_id,
          COALESCE(mbc.color_hex, '#808080') as roll_color,
          COALESCE(mbc.name_ar, cp.master_batch_id) as color_name,
          c.name as customer_name
        FROM rolls r
        JOIN production_orders po ON r.production_order_id = po.id
        JOIN customer_products cp ON po.customer_product_id = cp.id
        LEFT JOIN master_batch_colors mbc ON cp.master_batch_id = mbc.id
        JOIN orders o ON po.order_id = o.id
        JOIN customers c ON o.customer_id = c.id
        WHERE r.stage IN ('film', 'printing', 'cutting')
        ORDER BY r.created_at DESC
        LIMIT 100
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching active rolls for 3D:", error);
      res.status(500).json({ message: "خطأ في جلب الرولات النشطة" });
    }
  });

  // Get machine production statistics for 3D visualization
  app.get(
    "/api/factory-3d/machine-stats/:machineId",
    requireAuth,
    async (req, res) => {
      try {
        const machineId = req.params.machineId;

        // Get machine info
        const machineResult = await db.execute(sql`
        SELECT * FROM machines WHERE id = ${machineId}
      `);

        if (machineResult.rows.length === 0) {
          return res.status(404).json({ message: "الماكينة غير موجودة" });
        }

        const machine = machineResult.rows[0];

        // Get today's statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const statsResult = await db.execute(sql`
        SELECT 
          COUNT(*) as rolls_count,
          COALESCE(SUM(weight_kg::numeric), 0) as total_weight_kg,
          COUNT(CASE WHEN stage = 'film' THEN 1 END) as film_rolls,
          COUNT(CASE WHEN stage = 'printing' THEN 1 END) as printing_rolls,
          COUNT(CASE WHEN stage = 'cutting' THEN 1 END) as cutting_rolls,
          COUNT(CASE WHEN stage = 'done' THEN 1 END) as completed_rolls
        FROM rolls 
        WHERE (film_machine_id = ${machineId} 
               OR printing_machine_id = ${machineId} 
               OR cutting_machine_id = ${machineId})
          AND created_at >= ${today}
      `);

        // Get recent rolls for this machine
        const recentRollsResult = await db.execute(sql`
        SELECT 
          r.id,
          r.roll_number,
          r.stage,
          r.weight_kg,
          r.created_at,
          r.printed_at,
          r.cut_completed_at,
          po.production_order_number,
          COALESCE(mbc.color_hex, '#808080') as roll_color,
          COALESCE(mbc.name_ar, 'بدون لون') as color_name
        FROM rolls r
        JOIN production_orders po ON r.production_order_id = po.id
        JOIN customer_products cp ON po.customer_product_id = cp.id
        LEFT JOIN master_batch_colors mbc ON cp.master_batch_id = mbc.id
        WHERE r.film_machine_id = ${machineId} 
           OR r.printing_machine_id = ${machineId} 
           OR r.cutting_machine_id = ${machineId}
        ORDER BY r.created_at DESC
        LIMIT 10
      `);

        res.json({
          machine,
          todayStats: statsResult.rows[0] || {},
          recentRolls: recentRollsResult.rows,
        });
      } catch (error) {
        console.error("Error fetching machine stats for 3D:", error);
        res.status(500).json({ message: "خطأ في جلب إحصائيات الماكينة" });
      }
    },
  );

  // ============ Factory Layout Save/Load API Routes ============

  app.get("/api/factory-3d/layout", requireAuth, async (req, res) => {
    try {
      const result = await db
        .select()
        .from(factory_layouts)
        .where(eq(factory_layouts.name, "default"))
        .limit(1);
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error loading factory layout:", error);
      res.status(500).json({ message: "خطأ في تحميل تخطيط المصنع" });
    }
  });

  app.post("/api/factory-3d/layout", requireAuth, async (req, res) => {
    try {
      const { machines } = req.body;
      if (!machines || !Array.isArray(machines)) {
        return res.status(400).json({ message: "بيانات غير صالحة" });
      }
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      const existing = await db
        .select()
        .from(factory_layouts)
        .where(eq(factory_layouts.name, "default"))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(factory_layouts)
          .set({
            layout_data: machines,
            updated_at: new Date(),
            updated_by: userId,
          })
          .where(eq(factory_layouts.id, existing[0].id));
      } else {
        await db.insert(factory_layouts).values({
          name: "default",
          layout_data: machines,
          updated_by: userId,
        });
      }

      res.json({ success: true, message: "تم حفظ التخطيط بنجاح" });
    } catch (error) {
      console.error("Error saving factory layout:", error);
      res.status(500).json({ message: "خطأ في حفظ تخطيط المصنع" });
    }
  });

  // ============ Factory Snapshots ============

  app.get("/api/factory-3d/snapshots", requireAuth, async (req, res) => {
    try {
      const snapshots = await storage.getFactorySnapshots();
      res.json(snapshots);
    } catch (error) {
      console.error("Error loading snapshots:", error);
      res.status(500).json({ message: "خطأ في تحميل اللقطات" });
    }
  });

  app.get("/api/factory-3d/snapshots/share/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token)
        return res.status(400).json({ message: "رمز المشاركة مطلوب" });
      const snapshot = await storage.getFactorySnapshotByToken(token);
      if (!snapshot)
        return res.status(404).json({ message: "اللقطة غير موجودة" });
      res.json(snapshot);
    } catch (error) {
      console.error("Error loading shared snapshot:", error);
      res.status(500).json({ message: "خطأ في تحميل اللقطة المشتركة" });
    }
  });

  app.get("/api/factory-3d/snapshots/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "معرف غير صالح" });
      const snapshot = await storage.getFactorySnapshot(id);
      if (!snapshot)
        return res.status(404).json({ message: "اللقطة غير موجودة" });
      res.json(snapshot);
    } catch (error) {
      console.error("Error loading snapshot:", error);
      res.status(500).json({ message: "خطأ في تحميل اللقطة" });
    }
  });

  app.post("/api/factory-3d/snapshots", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      const parsed = insertFactorySnapshotSchema.parse({
        ...req.body,
        created_by: userId,
        share_token: crypto.randomBytes(24).toString("hex"),
      });

      const snapshot = await storage.createFactorySnapshot(parsed);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating snapshot:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "بيانات غير صالحة", errors: error.errors });
      }
      res.status(500).json({ message: "خطأ في إنشاء اللقطة" });
    }
  });

  app.delete("/api/factory-3d/snapshots/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "معرف غير صالح" });
      await storage.deleteFactorySnapshot(id);
      res.json({ success: true, message: "تم حذف اللقطة بنجاح" });
    } catch (error) {
      console.error("Error deleting snapshot:", error);
      res.status(500).json({ message: "خطأ في حذف اللقطة" });
    }
  });

  // Get all active machines from database for 3D factory
  app.get("/api/factory-3d/machines", requireAuth, async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT id, name, name_ar, type, section_id, status,
               capacity_small_kg_per_hour, capacity_medium_kg_per_hour, capacity_large_kg_per_hour,
               screw_type
        FROM machines 
        ORDER BY section_id, id
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching machines for 3D:", error);
      res.status(500).json({ message: "خطأ في جلب المكائن" });
    }
  });

  // Get last 5 production orders for a specific machine
  app.get(
    "/api/factory-3d/machine-orders/:machineId",
    requireAuth,
    async (req, res) => {
      try {
        const machineId = req.params.machineId;
        const result = await db.execute(sql`
        SELECT 
          po.id,
          po.production_order_number,
          po.quantity_kg,
          po.produced_quantity_kg,
          po.status,
          po.film_completed,
          po.printing_completed,
          po.cutting_completed,
          po.created_at,
          po.production_start_time,
          po.production_end_time,
          o.order_number,
          c.name as customer_name,
          c.name_ar as customer_name_ar,
          cp.size_caption as product_name,
          cp.size_caption as product_name_ar,
          cp.master_batch_id,
          COALESCE(mbc.color_hex, '#808080') as color_hex,
          COALESCE(mbc.name_ar, '') as color_name_ar,
          (SELECT COUNT(*) FROM rolls r WHERE r.production_order_id = po.id) as rolls_count,
          (SELECT COALESCE(SUM(r.weight_kg::numeric), 0) FROM rolls r WHERE r.production_order_id = po.id) as total_rolls_weight
        FROM production_orders po
        JOIN orders o ON po.order_id = o.id
        JOIN customers c ON o.customer_id = c.id
        JOIN customer_products cp ON po.customer_product_id = cp.id
        LEFT JOIN master_batch_colors mbc ON cp.master_batch_id = mbc.id
        WHERE po.assigned_machine_id = ${machineId}
           OR po.id IN (
             SELECT DISTINCT r.production_order_id FROM rolls r 
             WHERE r.film_machine_id = ${machineId} 
                OR r.printing_machine_id = ${machineId} 
                OR r.cutting_machine_id = ${machineId}
           )
        ORDER BY po.created_at DESC
        LIMIT 5
      `);
        res.json(result.rows);
      } catch (error) {
        console.error("Error fetching machine orders for 3D:", error);
        res.status(500).json({ message: "خطأ في جلب أوامر الإنتاج" });
      }
    },
  );

  // Get production users with today's attendance status
  app.get("/api/factory-3d/production-users", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await db.execute(sql`
        SELECT 
          u.id,
          u.display_name,
          u.display_name_ar,
          u.full_name,
          u.role_id,
          u.section_id,
          r.name as role_name,
          r.name_ar as role_name_ar,
          a.status as attendance_status,
          a.check_in_time,
          a.break_start_time,
          a.break_end_time,
          a.lunch_start_time,
          a.lunch_end_time
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN attendance a ON a.user_id = u.id AND a.check_in_time >= ${today}
        WHERE u.role_id IN (2, 3, 4, 6) 
          AND u.status = 'active'
        ORDER BY u.role_id, u.id
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching production users for 3D:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات الموظفين" });
    }
  });

  // ============ Display Screen API Routes ============

  app.get(
    "/api/display/slides",
    requireAuth,
    requirePermission("manage_display_screen"),
    async (req, res) => {
      try {
        const slides = await storage.getDisplaySlides();
        res.json(slides);
      } catch (error) {
        console.error("Error fetching display slides:", error);
        res.status(500).json({ message: "خطأ في جلب شرائح العرض" });
      }
    },
  );

  app.get("/api/display/slides/active", requireAuth, async (req, res) => {
    try {
      const slides = await storage.getActiveDisplaySlides();
      res.json(slides);
    } catch (error) {
      console.error("Error fetching active display slides:", error);
      res.status(500).json({ message: "خطأ في جلب شرائح العرض النشطة" });
    }
  });

  app.post(
    "/api/display/slides",
    requireAuth,
    requirePermission("manage_display_screen"),
    async (req: AuthRequest, res) => {
      try {
        const parseResult = insertDisplaySlideSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const data = { ...parseResult.data };
        if (
          data.slide_type === "announcement" ||
          data.slide_type === "notification"
        ) {
          data.content = await ensureAnnouncementTranslations(data.content);
        }
        const slide = await storage.createDisplaySlide({
          ...data,
          created_by: getAuthUserId(req),
        });
        res.json(slide);
      } catch (error) {
        console.error("Error creating display slide:", error);
        res.status(500).json({ message: "خطأ في إنشاء شريحة العرض" });
      }
    },
  );

  app.post(
    "/api/display/translate",
    requireAuth,
    requirePermission("manage_display_screen"),
    async (req, res) => {
      try {
        const schema = z
          .object({
            title: z.string().max(2000).optional(),
            message: z.string().max(5000).optional(),
            footer: z.string().max(2000).optional(),
            languages: z
              .array(z.enum(["en", "ur", "hi", "fil", "ne"]))
              .min(1)
              .max(5),
          })
          .refine(
            (d) =>
              !!(d.title?.trim() || d.message?.trim() || d.footer?.trim()),
            { message: "لا يوجد نص للترجمة" },
          );
        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message:
              parseResult.error.errors[0]?.message || "بيانات الترجمة غير صحيحة",
          });
        }
        const { title, message, footer, languages } = parseResult.data;
        const translations = await translateAnnouncement(
          { title, message, footer },
          languages,
        );
        res.json({ translations });
      } catch (error: any) {
        console.error("Error translating announcement:", error);
        res
          .status(500)
          .json({ message: error?.message || "خطأ في ترجمة الإعلان" });
      }
    },
  );

  app.put(
    "/api/display/slides/reorder",
    requireAuth,
    requirePermission("manage_display_screen"),
    async (req, res) => {
      try {
        const slideOrderSchema = z.array(
          z.object({
            id: z.number().int().positive(),
            sort_order: z.number().int().min(0),
          }),
        );
        const parseResult = slideOrderSchema.safeParse(req.body?.slideOrders);
        if (!parseResult.success) {
          return res.status(400).json({ message: "بيانات الترتيب غير صحيحة" });
        }
        for (const item of parseResult.data) {
          await storage.updateDisplaySlide(item.id, {
            sort_order: item.sort_order,
          });
        }
        res.json({ success: true });
      } catch (error) {
        console.error("Error reordering display slides:", error);
        res.status(500).json({ message: "خطأ في إعادة ترتيب الشرائح" });
      }
    },
  );

  app.put(
    "/api/display/slides/:id",
    requireAuth,
    requirePermission("manage_display_screen"),
    async (req, res) => {
      try {
        const parseResult = insertDisplaySlideSchema
          .partial()
          .safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const data = { ...parseResult.data };
        if (data.content && (data.content as any).autoTranslate) {
          data.content = await ensureAnnouncementTranslations(data.content);
        }
        const slide = await storage.updateDisplaySlide(
          parseRouteParam(req.params.id, "id"),
          data,
        );
        res.json(slide);
      } catch (error) {
        console.error("Error updating display slide:", error);
        res.status(500).json({ message: "خطأ في تحديث شريحة العرض" });
      }
    },
  );

  app.delete(
    "/api/display/slides/:id",
    requireAuth,
    requirePermission("manage_display_screen"),
    async (req, res) => {
      try {
        await storage.deleteDisplaySlide(parseRouteParam(req.params.id, "id"));
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting display slide:", error);
        res.status(500).json({ message: "خطأ في حذف شريحة العرض" });
      }
    },
  );

  app.get(
    "/api/display/live/recent-production",
    requireAuth,
    async (req, res) => {
      try {
        const result = await db.execute(sql`
        SELECT po.id, po.production_order_number, po.status, po.quantity_kg, po.produced_quantity_kg,
               po.film_completion_percentage, COALESCE(cp.size_caption, '') as size_caption,
               o.order_number, c.name as customer_name, c.name_ar as customer_name_ar
        FROM production_orders po
        LEFT JOIN orders o ON po.order_id = o.id
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN customer_products cp ON po.customer_product_id = cp.id
        ORDER BY po.created_at DESC
        LIMIT 10
      `);
        res.json(result.rows);
      } catch (error) {
        console.error("Error fetching recent production:", error);
        res.status(500).json({ message: "خطأ في جلب بيانات الإنتاج" });
      }
    },
  );

  app.get("/api/display/live/latest-rolls", requireAuth, async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT r.id, r.roll_number, r.weight_kg, r.status, r.created_at,
               m.name as machine_name, m.name_ar as machine_name_ar,
               po.production_order_number, COALESCE(cp.size_caption, '') as size_caption
        FROM rolls r
        LEFT JOIN machines m ON r.machine_id = m.id
        LEFT JOIN production_orders po ON r.production_order_id = po.id
        LEFT JOIN customer_products cp ON po.customer_product_id = cp.id
        ORDER BY r.created_at DESC
        LIMIT 8
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching latest rolls:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات اللفات" });
    }
  });

  app.get(
    "/api/display/live/production-stats",
    requireAuth,
    async (req, res) => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = await db.execute(sql`
        SELECT 
          COUNT(DISTINCT po.id) FILTER (WHERE po.status = 'active') as active_orders,
          COUNT(r.id) FILTER (WHERE r.created_at >= ${today}) as rolls_today,
          COALESCE(SUM(r.weight_kg) FILTER (WHERE r.created_at >= ${today}), 0) as production_kg_today,
          COUNT(DISTINCT po.id) FILTER (WHERE po.status = 'completed' AND po.production_end_time >= ${today}) as completed_today
        FROM production_orders po
        LEFT JOIN rolls r ON r.production_order_id = po.id
      `);
        res.json(result.rows?.[0] || {});
      } catch (error) {
        console.error("Error fetching production stats:", error);
        res.status(500).json({ message: "خطأ في جلب إحصائيات الإنتاج" });
      }
    },
  );

  app.get("/api/display/live/attendance", requireAuth, async (req, res) => {
    try {
      const dateParam =
        (req.query.date as string) || new Date().toISOString().split("T")[0];
      const result = await db.execute(sql`
        SELECT a.id, a.user_id, a.status, a.check_in_time, a.check_out_time,
               a.work_hours, a.late_minutes, a.shift_type, a.date,
               u.full_name, u.username
        FROM attendance a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.date = ${dateParam}
        ORDER BY a.check_in_time ASC NULLS LAST
      `);
      const totalPresent = result.rows.filter(
        (r: any) => r.status === "حاضر" || r.status === "present",
      ).length;
      const totalAbsent = result.rows.filter(
        (r: any) => r.status === "غائب" || r.status === "absent",
      ).length;
      res.json({
        records: result.rows,
        totalPresent,
        totalAbsent,
        total: result.rows.length,
        date: dateParam,
      });
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات الحضور" });
    }
  });

  const getDisplayPeriodStart = (period: string): Date | null => {
    const now = new Date();
    if (period === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    if (period === "week") {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (period === "month") {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (period === "year") {
      return new Date(now.getFullYear(), 0, 1);
    }
    return null;
  };

  const displayStageRows = sql`
    SELECT 'film' as stage, r.id, r.weight_kg as quantity_kg, r.created_at as event_at,
           r.created_by as user_id, r.film_machine_id as machine_id
    FROM rolls r
    WHERE r.created_at IS NOT NULL
    UNION ALL
    SELECT 'printing' as stage, r.id, r.weight_kg as quantity_kg, r.printed_at as event_at,
           r.printed_by as user_id, r.printing_machine_id as machine_id
    FROM rolls r
    WHERE r.printed_at IS NOT NULL
    UNION ALL
    SELECT 'cutting' as stage, r.id, COALESCE(NULLIF(r.cut_weight_total_kg, 0), r.weight_kg) as quantity_kg,
           r.cut_completed_at as event_at, r.cut_by as user_id, r.cutting_machine_id as machine_id
    FROM rolls r
    WHERE r.cut_completed_at IS NOT NULL
  `;

  app.get("/api/display/live/orders-board", requireAuth, async (req, res) => {
    try {
      const status = String(req.query.status || "active");
      const stage = String(req.query.stage || "all");
      const limit = Math.min(Math.max(parseInt(String(req.query.limit || "8"), 10) || 8, 3), 20);
      const statusFilter =
        status === "all"
          ? sql``
          : status === "active"
            ? sql`AND o.status IN ('waiting', 'in_production', 'on_hold', 'paused')`
            : sql`AND o.status = ${status}`;
      const stageFilter = stage === "all" ? sql`` : sql`AND po.production_stage = ${stage}`;

      const orderResult = await db.execute(sql`
        SELECT o.id, o.order_number, o.status, o.created_at, o.delivery_date,
               c.name as customer_name, c.name_ar as customer_name_ar,
               COUNT(po.id) as production_order_count,
               AVG(po.film_completion_percentage) as film_completion_percentage,
               AVG(po.printing_completion_percentage) as printing_completion_percentage,
               AVG(po.cutting_completion_percentage) as cutting_completion_percentage
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN production_orders po ON po.order_id = o.id
        WHERE 1 = 1 ${statusFilter} ${stageFilter}
        GROUP BY o.id, c.name, c.name_ar
        ORDER BY o.created_at DESC
        LIMIT ${limit}
      `);

      const orderIds = orderResult.rows.map((row: any) => row.id);
      if (orderIds.length === 0) {
        return res.json({ orders: [], filters: { status, stage, limit } });
      }

      const productionResult = await db.execute(sql`
        SELECT po.id, po.order_id, po.production_order_number, po.status, po.production_stage,
               po.quantity_kg, po.produced_quantity_kg, po.printed_quantity_kg, po.net_quantity_kg,
               po.film_completion_percentage, po.printing_completion_percentage, po.cutting_completion_percentage,
               COALESCE(cp.size_caption, '') as size_caption,
               COALESCE(cat.name_ar, '') as category_name_ar,
               COALESCE(cat.name, '') as category_name,
               COALESCE(i.name_ar, '') as item_name_ar,
               COALESCE(i.name, '') as item_name,
               TRIM(BOTH ' - ' FROM CONCAT_WS(' - ', NULLIF(cat.name_ar, ''), NULLIF(i.name_ar, ''))) as customer_product_display_name
        FROM production_orders po
        LEFT JOIN customer_products cp ON po.customer_product_id = cp.id
          LEFT JOIN categories cat ON cp.category_id = cat.id
        LEFT JOIN items i ON cp.item_id = i.id
        WHERE po.order_id IN (${sql.join(orderIds, sql`,`)}) ${stageFilter}
        ORDER BY po.created_at DESC
      `);

      const productionByOrder = new Map<number, any[]>();
      for (const po of productionResult.rows as any[]) {
        const list = productionByOrder.get(po.order_id) || [];
        list.push(po);
        productionByOrder.set(po.order_id, list);
      }

      res.json({
        filters: { status, stage, limit },
        orders: orderResult.rows.map((order: any) => ({
          ...order,
          production_orders: productionByOrder.get(order.id) || [],
        })),
      });
    } catch (error) {
      console.error("Error fetching display orders board:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات طلبات شاشة العرض" });
    }
  });

  app.get("/api/display/live/section-stats", requireAuth, async (req, res) => {
    try {
      const period = String(req.query.period || "today");
      const start = getDisplayPeriodStart(period);
      const dateFilter = start ? sql`WHERE event_at >= ${start}` : sql``;
      const result = await db.execute(sql`
        WITH stage_events AS (${displayStageRows})
        SELECT stage,
               COUNT(id) as roll_count,
               COALESCE(SUM(quantity_kg), 0) as total_weight_kg,
               COALESCE(AVG(quantity_kg), 0) as average_weight_kg
        FROM stage_events
        ${dateFilter}
        GROUP BY stage
        ORDER BY stage
      `);
      res.json({ period, sections: result.rows });
    } catch (error) {
      console.error("Error fetching display section stats:", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات الأقسام" });
    }
  });

  app.get("/api/display/live/machine-stats", requireAuth, async (req, res) => {
    try {
      const period = String(req.query.period || "today");
      const stage = String(req.query.stage || "all");
      const limit = Math.min(Math.max(parseInt(String(req.query.limit || "5"), 10) || 5, 3), 10);
      const start = getDisplayPeriodStart(period);
      const dateFilter = start ? sql`AND se.event_at >= ${start}` : sql``;
      const stageFilter = stage === "all" ? sql`` : sql`AND se.stage = ${stage}`;
      const result = await db.execute(sql`
        WITH stage_events AS (${displayStageRows})
        SELECT se.stage, se.machine_id, m.name, m.name_ar, m.type,
               COUNT(se.id) as roll_count,
               COALESCE(SUM(se.quantity_kg), 0) as total_weight_kg
        FROM stage_events se
        LEFT JOIN machines m ON se.machine_id = m.id
        WHERE se.machine_id IS NOT NULL ${dateFilter} ${stageFilter}
        GROUP BY se.stage, se.machine_id, m.name, m.name_ar, m.type
        ORDER BY total_weight_kg DESC
        LIMIT ${limit}
      `);
      res.json({ period, stage, machines: result.rows });
    } catch (error) {
      console.error("Error fetching display machine stats:", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات الماكينات" });
    }
  });

  app.get("/api/display/live/user-stats", requireAuth, async (req, res) => {
    try {
      const period = String(req.query.period || "today");
      const stage = String(req.query.stage || "all");
      const limit = Math.min(Math.max(parseInt(String(req.query.limit || "5"), 10) || 5, 3), 10);
      const start = getDisplayPeriodStart(period);
      const dateFilter = start ? sql`AND se.event_at >= ${start}` : sql``;
      const stageFilter = stage === "all" ? sql`` : sql`AND se.stage = ${stage}`;
      const result = await db.execute(sql`
        WITH stage_events AS (${displayStageRows})
        SELECT se.stage, se.user_id, u.full_name, u.username,
               COUNT(se.id) as roll_count,
               COALESCE(SUM(se.quantity_kg), 0) as total_weight_kg
        FROM stage_events se
        LEFT JOIN users u ON se.user_id = u.id
        WHERE se.user_id IS NOT NULL ${dateFilter} ${stageFilter}
        GROUP BY se.stage, se.user_id, u.full_name, u.username
        ORDER BY total_weight_kg DESC
        LIMIT ${limit}
      `);
      res.json({ period, stage, users: result.rows });
    } catch (error) {
      console.error("Error fetching display user stats:", error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات المستخدمين" });
    }
  });

  app.get("/api/display/live/top-producers", requireAuth, async (req, res) => {
    try {
      const period = (req.query.period as string) || "today";
      const stage = (req.query.stage as string) || "all";

      const start = getDisplayPeriodStart(period);

      const sections =
        stage === "all" ? ["film", "printing", "cutting"] : [stage];
      const results: Record<string, any[]> = {};

      for (const sec of sections) {
        let userCol = sql`r.created_by`;
        let dateCol = sql`r.created_at`;
        let quantityCol = sql`r.weight_kg`;
        if (sec === "printing") {
          userCol = sql`r.printed_by`;
          dateCol = sql`r.printed_at`;
        } else if (sec === "cutting") {
          userCol = sql`r.cut_by`;
          dateCol = sql`r.cut_completed_at`;
          quantityCol = sql`COALESCE(NULLIF(r.cut_weight_total_kg, 0), r.weight_kg)`;
        }
        const dateFilter = start ? sql`AND ${dateCol} >= ${start}` : sql``;

        const query = sql`
          SELECT ${userCol} as user_id, u.full_name, u.username,
                 COUNT(r.id) as roll_count,
                 COALESCE(SUM(${quantityCol}), 0) as total_weight_kg
          FROM rolls r
          LEFT JOIN users u ON ${userCol} = u.id
          WHERE ${userCol} IS NOT NULL ${dateFilter}
          GROUP BY ${userCol}, u.full_name, u.username
          ORDER BY total_weight_kg DESC
          LIMIT 10
        `;
        const result = await db.execute(query);
        results[sec] = result.rows;
      }

      res.json({ period, stage, sections: results });
    } catch (error) {
      console.error("Error fetching top producers:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات أفضل المنتجين" });
    }
  });

  app.post(
    "/api/display/upload-image",
    requireAuth,
    requirePermission("manage_display_screen"),
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "لم يتم رفع صورة" });
        }
        const { ObjectStorageService, objectStorageClient } =
          await import("../replit_integrations/object_storage");
        const storageService = new ObjectStorageService();
        const ext = req.file.originalname.split(".").pop() || "jpg";
        const fileName = `display-slides/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const publicPaths = storageService.getPublicObjectSearchPaths();
        const basePath = publicPaths[0];
        const fullPath = `${basePath}/${fileName}`;

        const normalizedPath = fullPath.startsWith("/")
          ? fullPath
          : `/${fullPath}`;
        const pathParts = normalizedPath.split("/");
        const bucketName = pathParts[1];
        const objectPath = pathParts.slice(2).join("/");
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectPath);
        await file.save(req.file.buffer, { contentType: req.file.mimetype });

        const publicUrl = `/objects/${objectPath}`;
        res.json({ url: publicUrl, fileName });
      } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "خطأ في رفع الصورة" });
      }
    },
  );
}
