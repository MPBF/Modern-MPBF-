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
  upload,
  mobileUpload,
  parseRouteParam,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerMobileRoutes(app: Express, ctx: any) {
  const {
    mobileLoginAttempts,
    MOBILE_RATE_LIMIT_WINDOW_MS,
    MOBILE_MAX_ATTEMPTS,
  } = ctx;


  app.post("/api/mobile/login", async (req, res) => {
    try {
      const {
        username,
        password,
        device_id,
        device_name,
        platform,
        app_version,
      } = req.body;
      if (!username?.trim() || !password?.trim()) {
        return res
          .status(400)
          .json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
      }

      const rateLimitKey = `${username.trim().toLowerCase()}`;
      const attempts = mobileLoginAttempts.get(rateLimitKey);
      if (attempts) {
        if (Date.now() - attempts.lastAttempt > MOBILE_RATE_LIMIT_WINDOW_MS) {
          mobileLoginAttempts.delete(rateLimitKey);
        } else if (attempts.count >= MOBILE_MAX_ATTEMPTS) {
          return res.status(429).json({
            message:
              "تم تجاوز عدد محاولات تسجيل الدخول المسموحة. حاول مرة أخرى بعد 15 دقيقة",
            retry_after_seconds: Math.ceil(
              (MOBILE_RATE_LIMIT_WINDOW_MS -
                (Date.now() - attempts.lastAttempt)) /
                1000,
            ),
          });
        }
      }

      const user = await storage.getUserByUsernameOrNationalId(
        username.trim(),
      );
      if (!user || !user.password) {
        const current = mobileLoginAttempts.get(rateLimitKey) || {
          count: 0,
          lastAttempt: 0,
        };
        mobileLoginAttempts.set(rateLimitKey, {
          count: current.count + 1,
          lastAttempt: Date.now(),
        });
        return res
          .status(401)
          .json({ message: "بيانات تسجيل الدخول غير صحيحة" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid || user.status !== "active") {
        const current = mobileLoginAttempts.get(rateLimitKey) || {
          count: 0,
          lastAttempt: 0,
        };
        mobileLoginAttempts.set(rateLimitKey, {
          count: current.count + 1,
          lastAttempt: Date.now(),
        });
        return res
          .status(401)
          .json({ message: "بيانات تسجيل الدخول غير صحيحة" });
      }

      mobileLoginAttempts.delete(rateLimitKey);

      let roleName = "user";
      let roleNameAr = "مستخدم";
      let permissions: string[] = [];

      if (user.role_id) {
        const roles = await getCachedRoles();
        const userRole = roles.find((r) => r.id === user.role_id);
        if (userRole) {
          roleName = userRole.name || "user";
          roleNameAr = userRole.name_ar || "مستخدم";
          if (userRole.permissions) {
            try {
              if (Array.isArray(userRole.permissions)) {
                permissions = userRole.permissions;
              } else if (typeof userRole.permissions === "string") {
                const parsed = JSON.parse(userRole.permissions);
                permissions = Array.isArray(parsed) ? parsed : [];
              }
            } catch {
              permissions = [];
            }
          }
        }
      }

      if (
        roleName.toLowerCase() === "admin" &&
        !permissions.includes("admin")
      ) {
        permissions.push("admin");
      }

      const ipAddress =
        req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "";
      const session = await createMobileSession(user.id, {
        device_id: device_id || undefined,
        device_name: device_name || undefined,
        platform: platform || undefined,
        app_version: app_version || undefined,
        ip_address: ipAddress,
      });

      res.json({
        token: session.token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at.toISOString(),
        refresh_expires_at: session.refresh_expires_at.toISOString(),
        user: {
          id: user.id,
          username: user.username ?? "",
          display_name: user.display_name ?? "",
          display_name_ar: user.display_name_ar ?? "",
          full_name: user.full_name ?? "",
          phone: user.phone ?? "",
          email: user.email ?? "",
          profile_image_url: user.profile_image_url ?? "",
          role_id: user.role_id ?? null,
          role_name: roleName,
          role_name_ar: roleNameAr,
          section_id: user.section_id ?? null,
          permissions,
        },
      });
    } catch (error) {
      logger.error("Mobile login error", error);
      res.status(500).json({ message: "خطأ في تسجيل الدخول" });
    }
  });

  app.post("/api/mobile/refresh-token", async (req, res) => {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        return res.status(400).json({ message: "Refresh token مطلوب" });
      }

      const newSession = await refreshMobileSession(refresh_token);
      if (!newSession) {
        return res
          .status(401)
          .json({ message: "الجلسة منتهية. يرجى تسجيل الدخول مرة أخرى" });
      }

      res.json({
        token: newSession.token,
        refresh_token: newSession.refresh_token,
        expires_at: newSession.expires_at.toISOString(),
        refresh_expires_at: newSession.refresh_expires_at.toISOString(),
      });
    } catch (error) {
      logger.error("Mobile refresh token error", error);
      res.status(500).json({ message: "خطأ في تجديد الجلسة" });
    }
  });

  app.post("/api/mobile/logout", requireAuth, async (req: AuthRequest, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        revokeMobileToken(token);
        await revokeMobileSession(token);
      }

      const { device_token } = req.body || {};
      if (device_token && req.user?.id) {
        await db
          .delete(mobile_device_tokens)
          .where(
            and(
              eq(mobile_device_tokens.user_id, req.user.id),
              eq(mobile_device_tokens.device_token, device_token),
            ),
          );
      }

      res.json({ message: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
      logger.error("Mobile logout error", error);
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    }
  });

  app.get(
    "/api/mobile/sessions",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "غير مصرح" });

        const sessions = await db
          .select({
            id: mobile_sessions.id,
            device_id: mobile_sessions.device_id,
            device_name: mobile_sessions.device_name,
            platform: mobile_sessions.platform,
            app_version: mobile_sessions.app_version,
            ip_address: mobile_sessions.ip_address,
            last_active_at: mobile_sessions.last_active_at,
            created_at: mobile_sessions.created_at,
            is_active: mobile_sessions.is_active,
          })
          .from(mobile_sessions)
          .where(
            and(
              eq(mobile_sessions.user_id, userId),
              eq(mobile_sessions.is_active, true),
              gt(mobile_sessions.expires_at, new Date()),
            ),
          );

        res.json({ data: sessions });
      } catch (error) {
        logger.error("Get mobile sessions error", error);
        res.status(500).json({ message: "خطأ في جلب الجلسات" });
      }
    },
  );

  app.delete(
    "/api/mobile/sessions/:id",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "غير مصرح" });

        const sessionId = parseRouteParam(req.params.id, "id");

        await db
          .update(mobile_sessions)
          .set({ is_active: false })
          .where(
            and(
              eq(mobile_sessions.id, sessionId),
              eq(mobile_sessions.user_id, userId),
            ),
          );

        res.json({ message: "تم إنهاء الجلسة بنجاح" });
      } catch (error) {
        logger.error("Delete mobile session error", error);
        res.status(500).json({ message: "خطأ في إنهاء الجلسة" });
      }
    },
  );

  app.post(
    "/api/mobile/device-token",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "غير مصرح" });

        const { device_token, platform, device_id, device_name, app_version } =
          req.body;
        if (!device_token || !platform) {
          return res
            .status(400)
            .json({ message: "device_token و platform مطلوبان" });
        }

        if (!["ios", "android", "web"].includes(platform)) {
          return res
            .status(400)
            .json({ message: "platform يجب أن يكون ios أو android أو web" });
        }

        const existing = await db
          .select()
          .from(mobile_device_tokens)
          .where(
            and(
              eq(mobile_device_tokens.user_id, userId),
              eq(mobile_device_tokens.device_token, device_token),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(mobile_device_tokens)
            .set({
              is_active: true,
              updated_at: new Date(),
              device_name: device_name || existing[0].device_name,
              app_version: app_version || existing[0].app_version,
            })
            .where(eq(mobile_device_tokens.id, existing[0].id));
        } else {
          await db.insert(mobile_device_tokens).values({
            user_id: userId,
            device_token,
            platform,
            device_id: device_id || null,
            device_name: device_name || null,
            app_version: app_version || null,
          });
        }

        res.json({ message: "تم تسجيل الجهاز بنجاح" });
      } catch (error) {
        logger.error("Register device token error", error);
        res.status(500).json({ message: "خطأ في تسجيل الجهاز" });
      }
    },
  );

  app.delete(
    "/api/mobile/device-token",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "غير مصرح" });

        const { device_token } = req.body;
        if (!device_token) {
          return res.status(400).json({ message: "device_token مطلوب" });
        }

        await db
          .delete(mobile_device_tokens)
          .where(
            and(
              eq(mobile_device_tokens.user_id, userId),
              eq(mobile_device_tokens.device_token, device_token),
            ),
          );

        res.json({ message: "تم إلغاء تسجيل الجهاز بنجاح" });
      } catch (error) {
        logger.error("Unregister device token error", error);
        res.status(500).json({ message: "خطأ في إلغاء تسجيل الجهاز" });
      }
    },
  );

  app.get(
    "/api/mobile/dashboard",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "غير مصرح" });

        const [
          ordersResult,
          productionResult,
          machinesResult,
          attendanceResult,
          notificationsResult,
        ] = await Promise.all([
          db.execute(sql`SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'waiting') as waiting,
          COUNT(*) FILTER (WHERE status = 'in_production') as in_production,
          COUNT(*) FILTER (WHERE status = 'completed') as completed
          FROM orders`),
          db.execute(sql`SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'completed') as completed
          FROM production_orders`),
          db.execute(sql`SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance,
          COUNT(*) FILTER (WHERE status = 'down') as down
          FROM machines`),
          db.execute(sql`SELECT status, check_in_time, check_out_time FROM attendance 
          WHERE user_id = ${userId} AND date = CURRENT_DATE LIMIT 1`),
          db.execute(sql`SELECT COUNT(*) as unread FROM notifications 
          WHERE (recipient_id = ${String(userId)} OR recipient_type = 'all') 
          AND status != 'read'`),
        ]);

        res.json({
          orders: ordersResult.rows[0] || {},
          production: productionResult.rows[0] || {},
          machines: machinesResult.rows[0] || {},
          today_attendance: attendanceResult.rows[0] || null,
          unread_notifications: parseInt(
            (notificationsResult.rows[0] as any)?.unread || "0",
          ),
        });
      } catch (error) {
        logger.error("Mobile dashboard error", error);
        res.status(500).json({ message: "خطأ في جلب بيانات لوحة التحكم" });
      }
    },
  );

  app.get(
    "/api/mobile/sync/metadata",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const tables = [
          "orders",
          "production_orders",
          "rolls",
          "customers",
          "machines",
          "attendance",
          "inventory",
          "maintenance_requests",
          "users",
        ];
        const metadata: Record<string, any> = {};

        for (const table of tables) {
          try {
            const result = await db.execute(sql`
            SELECT COUNT(*) as count, MAX(created_at) as last_updated 
            FROM ${sql.identifier(table)}
          `);
            metadata[table] = {
              count: parseInt((result.rows[0] as any)?.count || "0"),
              last_updated: (result.rows[0] as any)?.last_updated || null,
            };
          } catch {
            metadata[table] = { count: 0, last_updated: null };
          }
        }

        res.json({ data: metadata, server_time: new Date().toISOString() });
      } catch (error) {
        logger.error("Mobile sync metadata error", error);
        res.status(500).json({ message: "خطأ في جلب بيانات المزامنة" });
      }
    },
  );

  app.post(
    "/api/mobile/sync/attendance",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "غير مصرح" });

        const { records } = req.body;
        if (!Array.isArray(records) || records.length === 0) {
          return res.status(400).json({ message: "لا توجد سجلات للمزامنة" });
        }

        const results: {
          client_id: string;
          status: string;
          server_id?: number;
          error?: string;
        }[] = [];

        const isAdmin = req.user?.permissions?.includes("admin");

        for (const record of records) {
          try {
            if (!record.date) {
              results.push({
                client_id: record.client_id || "unknown",
                status: "error",
                error: "date is required",
              });
              continue;
            }

            const targetUserId =
              isAdmin && record.user_id ? record.user_id : userId;

            const existing = await db.execute(sql`
            SELECT id FROM attendance WHERE user_id = ${targetUserId} AND date = ${record.date} LIMIT 1
          `);

            if (existing.rows.length > 0) {
              const existingId = (existing.rows[0] as any).id;
              await db.execute(sql`
              UPDATE attendance SET
                status = COALESCE(${record.status}, status),
                check_in_time = COALESCE(${record.check_in_time}, check_in_time),
                check_out_time = COALESCE(${record.check_out_time}, check_out_time),
                location_accuracy = COALESCE(${record.location_accuracy}, location_accuracy),
                distance_from_factory = COALESCE(${record.distance_from_factory}, distance_from_factory),
                device_info = COALESCE(${record.device_info}, device_info),
                notes = COALESCE(${record.notes}, notes),
                updated_at = NOW(),
                updated_by = ${userId}
              WHERE id = ${existingId}
            `);
              results.push({
                client_id: record.client_id || record.date,
                status: "updated",
                server_id: existingId,
              });
            } else {
              const inserted = await db.execute(sql`
              INSERT INTO attendance (user_id, date, status, check_in_time, check_out_time, 
                location_accuracy, distance_from_factory, device_info, notes, shift_type, created_by)
              VALUES (${targetUserId}, ${record.date}, ${record.status || "حاضر"}, 
                ${record.check_in_time}, ${record.check_out_time},
                ${record.location_accuracy}, ${record.distance_from_factory}, 
                ${record.device_info}, ${record.notes}, ${record.shift_type || "صباحي"}, ${userId})
              RETURNING id
            `);
              results.push({
                client_id: record.client_id || record.date,
                status: "created",
                server_id: (inserted.rows[0] as any)?.id,
              });
            }
          } catch (err: any) {
            results.push({
              client_id: record.client_id || record.date,
              status: "error",
              error: err?.message,
            });
          }
        }

        res.json({
          data: results,
          synced: results.filter((r) => r.status !== "error").length,
          errors: results.filter((r) => r.status === "error").length,
        });
      } catch (error) {
        logger.error("Mobile sync attendance error", error);
        res.status(500).json({ message: "خطأ في مزامنة الحضور" });
      }
    },
  );

  app.post(
    "/api/mobile/sync/actions",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "غير مصرح" });

        const { actions } = req.body;
        if (!Array.isArray(actions) || actions.length === 0) {
          return res.status(400).json({ message: "لا توجد إجراءات للمزامنة" });
        }

        const results: { client_id: string; status: string; error?: string }[] =
          [];

        for (const action of actions) {
          try {
            await db.insert(mobile_sync_queue).values({
              user_id: userId,
              action_type: action.action_type,
              entity_type: action.entity_type,
              entity_data: action.entity_data,
              client_timestamp: new Date(action.client_timestamp),
              status: "pending",
            });
            results.push({ client_id: action.client_id, status: "queued" });
          } catch (err: any) {
            results.push({
              client_id: action.client_id,
              status: "error",
              error: err?.message,
            });
          }
        }

        res.json({
          data: results,
          queued: results.filter((r) => r.status === "queued").length,
          errors: results.filter((r) => r.status === "error").length,
        });
      } catch (error) {
        logger.error("Mobile sync actions error", error);
        res.status(500).json({ message: "خطأ في مزامنة الإجراءات" });
      }
    },
  );

  app.post(
    "/api/mobile/upload/image",
    requireAuth,
    mobileUpload.single("image"),
    async (req: AuthRequest, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "غير مصرح" });

        if (!req.file) {
          return res.status(400).json({ message: "لم يتم إرسال صورة" });
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/heic",
        ];
        if (!allowedTypes.includes(req.file.mimetype)) {
          return res.status(400).json({
            message:
              "نوع الملف غير مدعوم. الأنواع المدعومة: JPEG, PNG, WebP, HEIC",
          });
        }

        const { purpose, entity_type, entity_id } = req.body;
        const base64Data = req.file.buffer.toString("base64");
        const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

        res.json({
          success: true,
          image: {
            data_url: dataUrl,
            mimetype: req.file.mimetype,
            size: req.file.size,
            original_name: req.file.originalname,
            purpose: purpose || "general",
            entity_type: entity_type || null,
            entity_id: entity_id || null,
          },
        });
      } catch (error) {
        logger.error("Mobile upload image error", error);
        res.status(500).json({ message: "خطأ في رفع الصورة" });
      }
    },
  );

  app.get("/api/mobile/status", (_req, res) => {
    res.json({
      status: "online",
      version: "2.0.0",
      api_version: "v2",
      features: [
        "production_monitoring",
        "orders",
        "quality_control",
        "maintenance",
        "attendance",
        "notifications",
        "push_notifications",
        "offline_sync",
        "face_verification",
        "qr_scanner",
        "ai_agent",
        "refresh_tokens",
        "device_management",
      ],
      auth: {
        token_expiry_hours: 24,
        refresh_token_expiry_days: 90,
        rate_limit_max_attempts: MOBILE_MAX_ATTEMPTS,
        rate_limit_window_minutes: 15,
      },
    });
  });
}
