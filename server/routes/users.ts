import type { Express, Request, Response } from "express";

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
import { buildUserRequestDecisionNotification } from "../services/user-request-notifications";
import {
  notificationService,
  taqnyatSMS,
  notificationManagerHolder,
  getAuthUserId,
  parseRouteParam,
} from "./shared";

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
export async function registerUsersRoutes(app: Express, ctx: any) {
  const {
    webLoginAttempts,
    WEB_RATE_LIMIT_WINDOW_MS,
    WEB_MAX_ATTEMPTS,
    changePasswordAttempts,
    CHANGE_PW_WINDOW_MS,
    CHANGE_PW_MAX_ATTEMPTS,
  } = ctx;


  // Replit Auth user endpoint
  app.get("/api/auth/user", isAuthenticatedReplit, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      logger.error("Error fetching Replit auth user", error);
      console.error("[API Error]", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Authentication routes
  app.post(
    "/api/login",
    validateRequest({ body: commonSchemas.loginCredentials }),
    async (req, res) => {
      try {
        const { username, password } = req.body;

        // Enhanced validation
        if (!username?.trim() || !password?.trim()) {
          return res
            .status(400)
            .json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
        }

        const rateLimitKey = username.trim().toLowerCase();
        const attempts = webLoginAttempts.get(rateLimitKey);
        if (attempts) {
          if (Date.now() - attempts.lastAttempt > WEB_RATE_LIMIT_WINDOW_MS) {
            webLoginAttempts.delete(rateLimitKey);
          } else if (attempts.count >= WEB_MAX_ATTEMPTS) {
            return res.status(429).json({
              message: "تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً.",
              retry_after_seconds: Math.ceil(
                (WEB_RATE_LIMIT_WINDOW_MS -
                  (Date.now() - attempts.lastAttempt)) /
                  1000,
              ),
            });
          }
        }

        const user = await storage.getUserByUsernameOrNationalId(
          username.trim(),
        );
        if (!user) {
          const current = webLoginAttempts.get(rateLimitKey) || {
            count: 0,
            lastAttempt: 0,
          };
          webLoginAttempts.set(rateLimitKey, {
            count: current.count + 1,
            lastAttempt: Date.now(),
          });
          return res
            .status(401)
            .json({ message: "بيانات تسجيل الدخول غير صحيحة" });
        }

        // Enhanced null checks for user properties
        if (!user.password) {
          logger.error("User found but password is null or undefined");
          const current = webLoginAttempts.get(rateLimitKey) || {
            count: 0,
            lastAttempt: 0,
          };
          webLoginAttempts.set(rateLimitKey, {
            count: current.count + 1,
            lastAttempt: Date.now(),
          });
          return res
            .status(401)
            .json({ message: "بيانات تسجيل الدخول غير صحيحة" });
        }

        // Check password using bcrypt for security
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          const current = webLoginAttempts.get(rateLimitKey) || {
            count: 0,
            lastAttempt: 0,
          };
          webLoginAttempts.set(rateLimitKey, {
            count: current.count + 1,
            lastAttempt: Date.now(),
          });
          return res
            .status(401)
            .json({ message: "بيانات تسجيل الدخول غير صحيحة" });
        }

        if (user.status !== "active") {
          const current = webLoginAttempts.get(rateLimitKey) || {
            count: 0,
            lastAttempt: 0,
          };
          webLoginAttempts.set(rateLimitKey, {
            count: current.count + 1,
            lastAttempt: Date.now(),
          });
          return res
            .status(401)
            .json({ message: "بيانات تسجيل الدخول غير صحيحة" });
        }

        webLoginAttempts.delete(rateLimitKey);

        // Get role information before saving session
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
              } catch (e) {
                if (
                  typeof userRole.permissions === "string" &&
                  (userRole.permissions as string).trim()
                ) {
                  permissions = [(userRole.permissions as string).trim()];
                } else {
                  permissions = [];
                }
              }
            }
          }
        }

        // Save user session with explicit save callback
        req.session.userId = user.id;

        // Ensure session is saved before responding with additional reliability measures
        req.session.save((err: any) => {
          if (err) {
            logger.error("Session save error", err);
            return res.status(500).json({ message: "خطأ في حفظ الجلسة" });
          }

          // Force session persistence for MemoryStore reliability
          if (req.session?.touch) {
            req.session.touch();
          }

          logger.session("created and saved", user.id);

          // Session saved successfully - include role and permissions to match /api/me response
          res.json({
            user: {
              id: user.id ?? null,
              username: user.username ?? "",
              display_name: user.display_name ?? "",
              display_name_ar: user.display_name_ar ?? "",
              role_id: user.role_id ?? null,
              role_name: roleName,
              role_name_ar: roleNameAr,
              section_id: user.section_id ?? null,
              permissions: permissions,
              must_change_password: !!(user as any).must_change_password,
            },
          });
        });
      } catch (error) {
        logger.error("Login error", error);
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في الخادم" });
      }
    },
  );

  // Get current user - unified endpoint for both username/password and Replit Auth
  app.get("/api/me", async (req, res) => {
    try {
      // Use unified session resolver to handle both auth types
      const user = await resolveSessionUser(req);

      if (!user) {
        logger.debug("No authenticated session on /api/me");
        return res.status(401).json({
          message: "Unauthorized",
          success: false,
        });
      }

      // Extend session safely
      try {
        if (req.session?.touch) {
          req.session.touch();
        }

        // Save session to ensure it persists (non-blocking)
        if (req.session?.save) {
          req.session.save((err: any) => {
            if (err) {
              logger.error("Error saving session on /api/me", err);
              // Continue anyway, don't break the response
            }
          });
        }
      } catch (sessionError) {
        logger.error("Session management error", sessionError);
        // Don't fail the request for session issues
      }

      // Get role information
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
            } catch (e) {
              if (
                typeof userRole.permissions === "string" &&
                (userRole.permissions as string).trim()
              ) {
                permissions = [(userRole.permissions as string).trim()];
              } else {
                permissions = [];
              }
            }
          }
        }
      }

      // Return sanitized user data with role information
      const userData = {
        id: user.id ?? null,
        username: user.username ?? "",
        display_name: user.display_name ?? "",
        display_name_ar: user.display_name_ar ?? "",
        role_id: user.role_id ?? null,
        role_name: roleName,
        role_name_ar: roleNameAr,
        section_id: user.section_id ?? null,
        permissions: permissions,
        must_change_password: !!(user as any).must_change_password,
      };

      res.json({
        user: userData,
        success: true,
      });
    } catch (error) {
      logger.error("Get current user error", error);
      console.error("[API Error]", error);
      res.status(500).json({
        message: "خطأ في الخادم",
        success: false,
      });
    }
  });

  app.post("/api/change-password", async (req, res) => {
    try {
      const sessionUser = await resolveSessionUser(req);
      if (!sessionUser) {
        return res.status(401).json({ message: "غير مصرح" });
      }

      const attempts = changePasswordAttempts.get(sessionUser.id);
      if (attempts) {
        if (Date.now() - attempts.lastAttempt > CHANGE_PW_WINDOW_MS) {
          changePasswordAttempts.delete(sessionUser.id);
        } else if (attempts.count >= CHANGE_PW_MAX_ATTEMPTS) {
          return res.status(429).json({
            message: "تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً.",
          });
        }
      }

      const user = await storage.getUserById(sessionUser.id);
      if (!user) {
        return res.status(401).json({ message: "غير مصرح" });
      }

      const { current_password, new_password } = req.body || {};
      if (
        typeof current_password !== "string" ||
        typeof new_password !== "string" ||
        !current_password.trim() ||
        !new_password.trim()
      ) {
        return res
          .status(400)
          .json({ message: "كلمة المرور الحالية والجديدة مطلوبة" });
      }

      if (new_password.length < 8) {
        return res
          .status(400)
          .json({ message: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" });
      }

      if (new_password === current_password) {
        return res.status(400).json({
          message: "كلمة المرور الجديدة يجب أن تختلف عن الحالية",
        });
      }

      if (!user.password) {
        return res.status(400).json({ message: "لا توجد كلمة مرور حالية للحساب" });
      }

      const ok = await bcrypt.compare(current_password, user.password);
      if (!ok) {
        const current = changePasswordAttempts.get(user.id) || {
          count: 0,
          lastAttempt: 0,
        };
        changePasswordAttempts.set(user.id, {
          count: current.count + 1,
          lastAttempt: Date.now(),
        });
        return res
          .status(401)
          .json({ message: "كلمة المرور الحالية غير صحيحة" });
      }

      const newHash = await bcrypt.hash(new_password, 10);
      await db
        .update(users)
        .set({ password: newHash, must_change_password: false })
        .where(eq(users.id, user.id));

      changePasswordAttempts.delete(user.id);
      logger.info(`Password changed for user ${user.id}`);
      return res.json({ success: true });
    } catch (error) {
      logger.error("Change password error", error);
      return res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Logout - unified endpoint for both username/password and Replit Auth
  app.post("/api/logout", async (req, res) => {
    try {
      // Check if user is authenticated via Replit Auth
      const replitUser = req.user as any;
      const isReplitAuth = replitUser?.claims?.sub;

      // Destroy session
      if (req.session?.destroy) {
        req.session.destroy((err) => {
          if (err) {
            logger.error("Session destroy error", err);
            return res.status(500).json({ message: "خطأ في تسجيل الخروج" });
          }

          // Clear all possible session cookies
          res.clearCookie("connect.sid");
          res.clearCookie("plastic-bag-session");

          // For Replit Auth users, also call passport logout
          if (isReplitAuth && req.logout) {
            req.logout(() => {
              res.json({
                message: "تم تسجيل الخروج بنجاح",
                replitAuth: true,
              });
            });
          } else {
            res.json({ message: "تم تسجيل الخروج بنجاح" });
          }
        });
      } else {
        // Fallback session clearing
        req.session = {} as any;
        res.clearCookie("connect.sid");
        res.clearCookie("plastic-bag-session");

        if (isReplitAuth && req.logout) {
          req.logout(() => {
            res.json({
              message: "تم تسجيل الخروج بنجاح",
              replitAuth: true,
            });
          });
        } else {
          res.json({ message: "تم تسجيل الخروج بنجاح" });
        }
      }
    } catch (error) {
      logger.error("Logout error", error);
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في تسجيل الخروج" });
    }
  });

  // Sensitive employee-info fields: only visible to users who can manage users
  const SENSITIVE_USER_FIELDS = [
    "national_id",
    "nationality",
    "birth_date",
    "service_start_date",
    "profession",
  ] as const;
  const canViewEmployeeInfo = (req: Request): boolean => {
    const perms = (req as AuthRequest).user?.permissions || [];
    if (perms.includes("admin")) return true;
    return (
      ["view_users", "add_users", "edit_users", "manage_users", "manage_definitions"] as const
    ).some((p) => hasPermission(perms, p as any));
  };
  const stripEmployeeInfo = <T extends Record<string, any>>(u: T): T => {
    const copy: Record<string, any> = { ...u };
    for (const f of SENSITIVE_USER_FIELDS) delete copy[f];
    return copy as T;
  };

  // Users routes
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getSafeUsers();
      res.json(
        canViewEmployeeInfo(req) ? users : users.map(stripEmployeeInfo),
      );
    } catch (error) {
      console.error("Error fetching safe users:", error);
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  app.get("/api/users/sales-reps", requireAuth, async (req, res) => {
    try {
      // Sales section ID is 7 (SEC07)
      const salesReps = await storage.getSafeUsersBySection(7);
      res.json(salesReps);
    } catch (error) {
      console.error("Error fetching sales reps:", error);
      res.status(500).json({ message: "خطأ في جلب مندوبي المبيعات" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Enhanced parameter validation
      if (!req.params?.id) {
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
      }

      const user = await storage.getSafeUser(id);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      const isSelf = (req as AuthRequest).user?.id === id;
      res.json(
        canViewEmployeeInfo(req) || isSelf ? user : stripEmployeeInfo(user),
      );
    } catch (error) {
      console.error("Error fetching safe user by ID:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المستخدم" });
    }
  });

  // Users routes
  app.post(
    "/api/users",
    requireAuth,
    requirePermission("add_users", "manage_users", "manage_definitions"),
    async (req, res) => {
      try {
        // Resolve role_id (number, "ROLE0X", or role name) BEFORE Zod validation.
        let roleId: number | null = null;
        if (
          req.body?.role_id &&
          req.body.role_id !== "" &&
          req.body.role_id !== "none"
        ) {
          if (typeof req.body.role_id === "string") {
            const roleMatch = req.body.role_id.match(/^ROLE(\d+)$/);
            if (roleMatch) {
              roleId = parseInt(roleMatch[1], 10);
            } else {
              const roles = await getCachedRoles();
              const role = roles.find(
                (r) =>
                  r.name === req.body.role_id || r.name_ar === req.body.role_id,
              );
              if (role) {
                roleId = role.id;
              } else {
                const parsedNum = parseInt(req.body.role_id);
                if (!isNaN(parsedNum)) {
                  roleId = parsedNum;
                }
              }
            }
          } else if (typeof req.body.role_id === "number") {
            roleId = req.body.role_id;
          }
        }

        let sectionId: number | null = null;
        if (
          req.body?.section_id &&
          req.body.section_id !== "" &&
          req.body.section_id !== "none"
        ) {
          const sid = String(req.body.section_id);
          const sectionMatch = sid.match(/^SEC(\d+)$/);
          if (sectionMatch) {
            sectionId = parseInt(sectionMatch[1], 10);
          } else if (!isNaN(Number(sid))) {
            sectionId = Number(sid);
          }
        }

        const allowed = [
          "username",
          "password",
          "display_name",
          "display_name_ar",
          "full_name",
          "phone",
          "email",
          "status",
          "national_id",
          "nationality",
          "birth_date",
          "service_start_date",
          "profession",
        ];
        const candidate: Record<string, any> = {
          role_id: roleId,
          section_id: sectionId,
        };
        for (const f of allowed) {
          if (req.body?.[f] !== undefined) candidate[f] = req.body[f];
        }
        const parsed = createUserApiSchema.safeParse(candidate);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات المستخدم غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }

        const processedData = {
          ...parsed.data,
          password:
            parsed.data.password ||
            crypto.randomBytes(12).toString("base64url"),
          status: parsed.data.status || "active",
        };

        const user = await storage.createUser(processedData);
        const { password: _, ...safeUser } = user;
        res.status(201).json(safeUser);
      } catch (error) {
        console.error("User creation error:", error);
        res.status(500).json({
          message: "خطأ في إنشاء المستخدم",
          error: "خطأ داخلي",
        });
      }
    },
  );

  app.put(
    "/api/users/:id",
    requireAuth,
    requirePermission("edit_users", "manage_users", "manage_definitions"),
    async (req, res) => {
      try {
        // Enhanced parameter validation
        if (!req.params?.id) {
          return res.status(400).json({ message: "معرف المستخدم مطلوب" });
        }

        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }

        if (!req.body || typeof req.body !== "object") {
          return res.status(400).json({ message: "بيانات التحديث مطلوبة" });
        }

        // Process role_id and section_id to convert empty strings and "none" to null with enhanced null safety
        let roleId = null;
        if (
          req.body?.role_id &&
          req.body.role_id !== "" &&
          req.body.role_id !== "none"
        ) {
          const rid = String(req.body.role_id);
          const roleMatch = rid.match(/^ROLE(\d+)$/);
          if (roleMatch) {
            roleId = parseInt(roleMatch[1], 10);
          } else if (!isNaN(Number(rid))) {
            roleId = Number(rid);
          }
        }

        let sectionId = null;
        if (
          req.body?.section_id &&
          req.body.section_id !== "" &&
          req.body.section_id !== "none"
        ) {
          const sid = String(req.body.section_id);
          const sectionMatch = sid.match(/^SEC(\d+)$/);
          if (sectionMatch) {
            sectionId = parseInt(sectionMatch[1], 10);
          } else if (!isNaN(Number(sid))) {
            sectionId = Number(sid);
          }
        }

        const allowedFields = [
          "username",
          "display_name",
          "display_name_ar",
          "full_name",
          "phone",
          "email",
          "status",
          "password",
          "national_id",
          "nationality",
          "birth_date",
          "service_start_date",
          "profession",
        ];
        const candidate: Record<string, any> = {
          role_id: roleId,
          section_id: sectionId,
        };
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            candidate[field] = req.body[field];
          }
        }
        const parsed = updateUserSchema.safeParse(candidate);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات المستخدم غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const processedData = parsed.data;

        const user = await storage.updateUser(id, processedData);
        if (!user) {
          return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        invalidateUserCache(id);
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
      } catch (error) {
        console.error("User update error:", error);
        res.status(500).json({
          message: "خطأ في تحديث المستخدم",
          error: "خطأ داخلي",
        });
      }
    },
  );

  // Roles management routes
  app.get(
    "/api/roles",
    requireAuth,
    requirePermission("manage_roles"),
    async (req: AuthRequest, res) => {
      try {
        const roles = await storage.getRoles();
        res.json(roles);
      } catch (error) {
        console.error("Roles fetch error:", error);
        res.status(500).json({ message: "خطأ في جلب الأدوار" });
      }
    },
  );

  app.post(
    "/api/roles",
    requireAuth,
    requirePermission("manage_roles"),
    async (req: AuthRequest, res) => {
      try {
        const roleSchema = z.object({
          name: z.string().min(1).max(50),
          name_ar: z.string().max(100).optional().nullable(),
          permissions: z.array(z.string()).optional().nullable(),
        });
        const parseResult = roleSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات الدور غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const role = await storage.createRole(parseResult.data);
        invalidateRolesCache();
        invalidateUserCache();
        res.json(role);
      } catch (error) {
        console.error("Role creation error:", error);
        res.status(500).json({
          message: "خطأ في إنشاء الدور",
        });
      }
    },
  );

  app.put(
    "/api/roles/:id",
    requireAuth,
    requirePermission("manage_roles"),
    async (req: AuthRequest, res) => {
      try {
        // Enhanced parameter validation
        if (!req.params?.id) {
          return res.status(400).json({ message: "معرف الدور مطلوب" });
        }

        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ message: "معرف الدور غير صحيح" });
        }

        if (!req.body || typeof req.body !== "object") {
          return res.status(400).json({ message: "بيانات التحديث مطلوبة" });
        }

        const roleUpdateSchema = z.object({
          name: z.string().min(1).max(50).optional(),
          name_ar: z.string().max(100).optional().nullable(),
          permissions: z.array(z.string()).optional().nullable(),
        });
        const parseResult = roleUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: "بيانات الدور غير صحيحة",
            errors: parseResult.error.errors,
          });
        }
        const role = await storage.updateRole(id, parseResult.data);
        if (!role) {
          return res.status(404).json({ message: "الدور غير موجود" });
        }
        invalidateRolesCache();
        invalidateUserCache();
        res.json(role);
      } catch (error) {
        console.error("Role update error:", error);
        res.status(500).json({
          message: "خطأ في تحديث الدور",
        });
      }
    },
  );

  app.delete(
    "/api/roles/:id",
    requireAuth,
    requirePermission("manage_roles"),
    async (req: AuthRequest, res) => {
      try {
        // Enhanced parameter validation
        if (!req.params?.id) {
          return res.status(400).json({ message: "معرف الدور مطلوب" });
        }

        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ message: "معرف الدور غير صحيح" });
        }

        await storage.deleteRole(id);
        invalidateRolesCache();
        invalidateUserCache();
        res.json({ message: "تم حذف الدور بنجاح" });
      } catch (error) {
        console.error("Role deletion error:", error);
        res.status(500).json({
          message: "خطأ في حذف الدور",
        });
      }
    },
  );

  app.delete(
    "/api/users/:id",
    requireAuth,
    requirePermission("delete_users", "manage_users", "manage_definitions"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteUser(id);
        invalidateUserCache(id);
        res.json({ message: "تم حذف المستخدم بنجاح" });
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في حذف المستخدم" });
      }
    },
  );

  // ------------ User Requests Management API ------------

  app.get("/api/user-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getUserRequests();

      // HR reviewers see all requests; everyone else sees only their own
      const perms = (req as AuthRequest).user?.permissions || [];
      const canViewAll =
        perms.includes("admin") ||
        (["view_hr", "edit_hr", "manage_hr"] as const).some((p) =>
          hasPermission(perms, p as any),
        );
      if (canViewAll) {
        return res.json(requests);
      }
      const selfId = getAuthUserId(req);
      res.json(
        (requests || []).filter((r: any) => r.user_id === selfId),
      );
    } catch (error) {
      console.error("Error fetching user requests:", error);
      res.status(500).json({ message: "خطأ في جلب طلبات المستخدمين" });
    }
  });

  app.post("/api/user-requests", requireAuth, async (req, res) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "بيانات الطلب مطلوبة" });
      }
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "غير مصرح به" });
      }
      if (!req.body.type) {
        return res.status(400).json({ message: "نوع الطلب مطلوب" });
      }
      // Whitelist employee-editable fields; review fields are server-controlled
      const type = String(req.body.type).slice(0, 50);
      const ALLOWED_TYPES = ["إجازة", "استئذان", "عامة"];
      if (!ALLOWED_TYPES.includes(type)) {
        return res.status(400).json({ message: "نوع الطلب غير صحيح" });
      }
      const titleInput =
        typeof req.body.title === "string" ? req.body.title.trim() : "";
      const descriptionInput =
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : "";
      if (!titleInput) {
        return res.status(400).json({ message: "عنوان الطلب مطلوب" });
      }
      if (!descriptionInput) {
        return res.status(400).json({ message: "تفاصيل الطلب مطلوبة" });
      }
      // Type-specific fields: leave dates for إجازة, time range for استئذان
      const parseDate = (v: any): Date | null => {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
      };
      const parseTime = (v: any): string | null => {
        if (typeof v !== "string") return null;
        return /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null;
      };
      const isLeave = type === "إجازة";
      const isPermission = type === "استئذان";
      const leaveStart = isLeave ? parseDate(req.body.leave_start_date) : null;
      const leaveEnd = isLeave ? parseDate(req.body.leave_end_date) : null;
      const permStart = isPermission
        ? parseTime(req.body.permission_start_time)
        : null;
      const permEnd = isPermission
        ? parseTime(req.body.permission_end_time)
        : null;
      if (isLeave) {
        if (!leaveStart || !leaveEnd) {
          return res
            .status(400)
            .json({ message: "تاريخ بداية ونهاية الإجازة مطلوبان" });
        }
        if (leaveEnd.getTime() < leaveStart.getTime()) {
          return res.status(400).json({
            message: "تاريخ نهاية الإجازة يجب أن يكون بعد تاريخ البداية",
          });
        }
      }
      if (isPermission) {
        if (!permStart || !permEnd) {
          return res
            .status(400)
            .json({ message: "وقت بداية ونهاية الاستئذان مطلوبان (HH:MM)" });
        }
        if (permEnd <= permStart) {
          return res.status(400).json({
            message: "وقت نهاية الاستئذان يجب أن يكون بعد وقت البداية",
          });
        }
      }
      // Prevent overlapping pending/approved requests for the same period
      if (isLeave || isPermission) {
        const overlapping = await storage.getOverlappingUserRequests({
          userId,
          type,
          statuses: ["معلق", "موافق"],
          leaveStart,
          leaveEnd,
          permissionDate: new Date(),
          permissionStart: permStart,
          permissionEnd: permEnd,
        });
        if (overlapping.length > 0) {
          const existing = overlapping[0];
          const existingStatus = existing?.status === "موافق" ? "معتمد" : "معلق";
          return res.status(409).json({
            message: isLeave
              ? `لا يمكن إرسال الطلب: لديك طلب إجازة ${existingStatus} يتداخل مع نفس الفترة`
              : `لا يمكن إرسال الطلب: لديك طلب استئذان ${existingStatus} يتداخل مع نفس الوقت في هذا اليوم`,
          });
        }
      }
      const request = await storage.createUserRequest({
        type,
        title: titleInput.slice(0, 200),
        description: descriptionInput,
        priority: req.body.priority ?? "عادي",
        leave_start_date: leaveStart,
        leave_end_date: leaveEnd,
        permission_start_time: permStart,
        permission_end_time: permEnd,
        user_id: userId,
        status: "معلق",
        date: new Date(),
      });
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating user request:", error);
      res.status(500).json({ message: "خطأ في إنشاء الطلب" });
    }
  });

  // Whitelist review fields and stamp reviewer info when status changes
  const buildRequestReviewUpdate = (req: Request): Record<string, any> => {
    const allowed = ["status", "response", "priority", "title", "description", "type"];
    const data: Record<string, any> = {};
    for (const f of allowed) {
      if (req.body?.[f] !== undefined) data[f] = req.body[f];
    }
    if (data.status && data.status !== "معلق") {
      data.reviewed_by = (req as AuthRequest).user?.id ?? null;
      data.reviewed_date = new Date();
    }
    data.updated_at = new Date();
    return data;
  };

  // Notify the request owner in-app when their request is approved/rejected
  const notifyRequestOwner = async (
    request: any,
    update: Record<string, any>,
  ) => {
    try {
      const decision = buildUserRequestDecisionNotification(request, update);
      if (!decision) return;
      const nm =
        notificationManagerHolder.value || getNotificationManager(storage);
      await nm.sendToUser(decision.userId, decision.payload);
    } catch (e) {
      console.error("Failed to notify request owner of review decision:", e);
    }
  };

  // On approval, block if another APPROVED request overlaps the same period
  const checkApprovalOverlap = async (
    id: number,
    update: Record<string, any>,
  ): Promise<string | null> => {
    if (update.status !== "موافق") return null;
    const existing = await storage.getUserRequestById(id);
    if (!existing) return "الطلب غير موجود";
    if (existing.type !== "إجازة" && existing.type !== "استئذان") return null;
    const overlapping = await storage.getOverlappingUserRequests({
      userId: existing.user_id,
      type: existing.type,
      statuses: ["موافق"],
      excludeId: id,
      leaveStart: existing.leave_start_date,
      leaveEnd: existing.leave_end_date,
      permissionDate: existing.date,
      permissionStart: existing.permission_start_time,
      permissionEnd: existing.permission_end_time,
    });
    if (overlapping.length > 0) {
      return existing.type === "إجازة"
        ? "لا يمكن الموافقة: يوجد طلب إجازة معتمد سابقاً لنفس الموظف يتداخل مع نفس الفترة"
        : "لا يمكن الموافقة: يوجد طلب استئذان معتمد سابقاً لنفس الموظف يتداخل مع نفس الوقت في هذا اليوم";
    }
    return null;
  };

  // عند اعتماد طلب إجازة: انعكاس تلقائي على سجل الحضور (أيام "إجازة").
  // دقائق الاستئذان المعتمدة تُستثنى تلقائياً في محرك الحضور/الأجور.
  const applyApprovalSideEffects = async (request: any): Promise<void> => {
    try {
      if (
        request?.status === "موافق" &&
        request?.type === "إجازة" &&
        request?.leave_start_date &&
        request?.leave_end_date
      ) {
        await storage.applyApprovedLeaveToAttendance(request);
      }
    } catch (err) {
      console.error(
        "Error applying approved leave to attendance for request",
        request?.id,
        err,
      );
    }
  };

  const handleRequestReviewUpdate = async (req: Request, res: Response) => {
    try {
      const id = parseRouteParam(req.params.id, "id");
      const update = buildRequestReviewUpdate(req);
      const conflict = await checkApprovalOverlap(id, update);
      if (conflict) {
        return res.status(409).json({ message: conflict });
      }
      const request = await storage.updateUserRequest(id, update);
      await applyApprovalSideEffects(request);
      await notifyRequestOwner(request, update);
      res.json(request);
    } catch (error) {
      console.error("Error updating user request:", error);
      res.status(500).json({ message: "خطأ في تحديث الطلب" });
    }
  };

  app.put(
    "/api/user-requests/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr"),
    handleRequestReviewUpdate,
  );

  app.patch(
    "/api/user-requests/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr"),
    handleRequestReviewUpdate,
  );

  app.delete(
    "/api/user-requests/:id",
    requireAuth,
    requirePermission("delete_hr", "manage_hr"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteUserRequest(id);
        res.json({ message: "تم حذف الطلب بنجاح" });
      } catch (error) {
        console.error("Error deleting user request:", error);
        res.status(500).json({ message: "خطأ في حذف الطلب" });
      }
    },
  );
}
