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

// Extracted from the original server/routes.ts (registration order preserved
// within this domain). See server/routes/README.md.
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


  // Training Records routes
  app.get("/api/training-records", requireAuth, async (req, res) => {
    try {
      const trainingRecords = await storage.getTrainingRecords();
      res.json(trainingRecords);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب سجلات التدريب" });
    }
  });

  app.post("/api/training-records", requireAuth, async (req, res) => {
    try {
      const validation = insertTrainingRecordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: validation.error.errors,
        });
      }
      const trainingRecord = await storage.createTrainingRecord(
        validation.data,
      );
      res.json(trainingRecord);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  // Admin Decisions routes
  app.get("/api/admin-decisions", requireAuth, async (req, res) => {
    try {
      const adminDecisions = await storage.getAdminDecisions();
      res.json(adminDecisions);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب القرارات الإدارية" });
    }
  });

  app.post("/api/admin-decisions", requireAuth, async (req, res) => {
    try {
      const validation = insertAdminDecisionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: validation.error.errors,
        });
      }
      const adminDecision = await storage.createAdminDecision(validation.data);
      res.json(adminDecision);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  // ============ HR System API Routes ============

  // Training Programs
  app.get("/api/hr/training-programs", requireAuth, async (req, res) => {
    try {
      const programs = await storage.getTrainingPrograms();
      res.json(programs);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب البرامج التدريبية" });
    }
  });

  app.post(
    "/api/hr/training-programs",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertTrainingProgramSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const program = await storage.createTrainingProgram(validation.data);
        res.json(program);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء البرنامج التدريبي" });
      }
    },
  );

  app.put(
    "/api/hr/training-programs/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr"),
    async (req, res) => {
      try {
        // Enhanced parameter validation
        if (!req.params?.id) {
          return res
            .status(400)
            .json({ message: "معرف البرنامج التدريبي مطلوب" });
        }

        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res
            .status(400)
            .json({ message: "معرف البرنامج التدريبي غير صحيح" });
        }

        if (!req.body || typeof req.body !== "object") {
          return res.status(400).json({ message: "بيانات التحديث مطلوبة" });
        }

        const program = await storage.updateTrainingProgram(id, req.body);
        if (!program) {
          return res
            .status(404)
            .json({ message: "البرنامج التدريبي غير موجود" });
        }
        res.json(program);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في تحديث البرنامج التدريبي" });
      }
    },
  );

  app.get("/api/hr/training-programs/:id", requireAuth, async (req, res) => {
    try {
      // Enhanced parameter validation
      if (!req.params?.id) {
        return res
          .status(400)
          .json({ message: "معرف البرنامج التدريبي مطلوب" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res
          .status(400)
          .json({ message: "معرف البرنامج التدريبي غير صحيح" });
      }

      const program = await storage.getTrainingProgramById(id);
      if (!program) {
        return res.status(404).json({ message: "البرنامج التدريبي غير موجود" });
      }
      res.json(program);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب البرنامج التدريبي" });
    }
  });

  // Training Materials
  app.get("/api/hr/training-materials", requireAuth, async (req, res) => {
    try {
      // Enhanced query parameter validation
      let programId: number | undefined;
      if (req.query?.program_id) {
        const programIdParam = parseInt(req.query.program_id as string);
        programId =
          !isNaN(programIdParam) && programIdParam > 0
            ? programIdParam
            : undefined;
      }

      const materials = await storage.getTrainingMaterials(programId);
      if (!materials) {
        return res.json([]); // Return empty array instead of null
      }
      res.json(materials);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب المواد التدريبية" });
    }
  });

  app.post(
    "/api/hr/training-materials",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertTrainingMaterialSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const material = await storage.createTrainingMaterial(validation.data);
        res.json(material);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء المادة التدريبية" });
      }
    },
  );

  // Training Enrollments
  app.get("/api/hr/training-enrollments", requireAuth, async (req, res) => {
    try {
      // Enhanced query parameter validation
      let employeeId: number | undefined;
      if (req.query?.employee_id) {
        const employeeIdParam = parseInt(req.query.employee_id as string);
        employeeId =
          !isNaN(employeeIdParam) && employeeIdParam > 0
            ? employeeIdParam
            : undefined;
      }

      const enrollments = await storage.getTrainingEnrollments(
        employeeId ? { employeeId } : undefined,
      );
      if (!enrollments) {
        return res.json([]); // Return empty array instead of null
      }
      res.json(enrollments);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب التسجيلات التدريبية" });
    }
  });

  app.post(
    "/api/hr/training-enrollments",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertTrainingEnrollmentSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const enrollment = await storage.createTrainingEnrollment(
          validation.data,
        );
        res.json(enrollment);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في تسجيل الموظف في البرنامج" });
      }
    },
  );

  app.put(
    "/api/hr/training-enrollments/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const enrollment = await storage.updateTrainingEnrollment(id, req.body);
        res.json(enrollment);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في تحديث التسجيل التدريبي" });
      }
    },
  );

  // Training Evaluations
  app.get("/api/hr/training-evaluations", requireAuth, async (req, res) => {
    try {
      let employeeId: number | undefined;
      if (req.query.employee_id) {
        const parsed = parseInt(req.query.employee_id as string);
        employeeId = !isNaN(parsed) && parsed > 0 ? parsed : undefined;
      }
      let programId: number | undefined;
      if (req.query.program_id) {
        const parsed = parseInt(req.query.program_id as string);
        programId = !isNaN(parsed) && parsed > 0 ? parsed : undefined;
      }
      const evaluations = await storage.getTrainingEvaluations(
        employeeId,
        programId,
      );
      res.json(evaluations);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب التقييمات التدريبية" });
    }
  });

  app.post(
    "/api/hr/training-evaluations",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertTrainingEvaluationSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const evaluation = await storage.createTrainingEvaluation(
          validation.data,
        );
        res.json(evaluation);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء التقييم التدريبي" });
      }
    },
  );

  app.put(
    "/api/hr/training-evaluations/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "ID");
        const evaluation = await storage.updateTrainingEvaluation(id, req.body);
        res.json(evaluation);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في تحديث التقييم التدريبي" });
      }
    },
  );

  app.get("/api/hr/training-evaluations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "ID");
      const evaluation = await storage.getTrainingEvaluationById(id);
      if (evaluation) {
        res.json(evaluation);
      } else {
        res.status(404).json({ message: "التقييم التدريبي غير موجود" });
      }
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب التقييم التدريبي" });
    }
  });

  // Training Certificates
  app.get("/api/hr/training-certificates", requireAuth, async (req, res) => {
    try {
      let employeeId: number | undefined;
      if (req.query.employee_id) {
        const parsed = parseInt(req.query.employee_id as string);
        employeeId = !isNaN(parsed) && parsed > 0 ? parsed : undefined;
      }
      const certificates = await storage.getTrainingCertificates(employeeId);
      res.json(certificates);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب الشهادات التدريبية" });
    }
  });

  app.post(
    "/api/hr/training-certificates",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertTrainingCertificateSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const certificate = await storage.createTrainingCertificate(
          validation.data,
        );
        res.json(certificate);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء الشهادة التدريبية" });
      }
    },
  );

  app.post(
    "/api/hr/training-certificates/generate/:enrollmentId",
    requireAuth,
    async (req, res) => {
      try {
        const enrollmentId = parseRouteParam(
          req.params.enrollmentId,
          "Enrollment ID",
        );
        const certificate =
          await storage.generateTrainingCertificate(enrollmentId);
        res.json(certificate);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إصدار الشهادة التدريبية" });
      }
    },
  );

  app.put(
    "/api/hr/training-certificates/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const certificate = await storage.updateTrainingCertificate(
          id,
          req.body,
        );
        res.json(certificate);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في تحديث الشهادة التدريبية" });
      }
    },
  );

  app.get(
    "/api/hr/training-certificates/:id/generate",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const certificate = await storage.generateTrainingCertificate(id);
        res.json(certificate);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في توليد شهادة التدريب" });
      }
    },
  );

  // Performance Reviews
  app.get("/api/hr/performance-reviews", requireAuth, async (req, res) => {
    try {
      const employeeId = req.query.employee_id
        ? (req.query.employee_id as string)
        : undefined;
      const reviews = await storage.getPerformanceReviews(employeeId);
      res.json(reviews);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب تقييمات الأداء" });
    }
  });

  app.post(
    "/api/hr/performance-reviews",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertPerformanceReviewSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const review = await storage.createPerformanceReview(validation.data);
        res.json(review);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء تقييم الأداء" });
      }
    },
  );

  app.put(
    "/api/hr/performance-reviews/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const review = await storage.updatePerformanceReview(id, req.body);
        res.json(review);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في تحديث تقييم الأداء" });
      }
    },
  );

  // Performance Criteria
  app.get("/api/hr/performance-criteria", requireAuth, async (req, res) => {
    try {
      const criteria = await storage.getPerformanceCriteria();
      res.json(criteria);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب معايير التقييم" });
    }
  });

  app.post(
    "/api/hr/performance-criteria",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertPerformanceCriteriaSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const criteria = await storage.createPerformanceCriteria(
          validation.data,
        );
        res.json(criteria);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء معيار التقييم" });
      }
    },
  );

  // Leave Types
  app.get("/api/hr/leave-types", requireAuth, async (req, res) => {
    try {
      const leaveTypes = await storage.getLeaveTypes();
      res.json(leaveTypes);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب أنواع الإجازات" });
    }
  });

  app.post(
    "/api/hr/leave-types",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertLeaveTypeSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const leaveType = await storage.createLeaveType(validation.data);
        res.json(leaveType);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء نوع الإجازة" });
      }
    },
  );

  // Leave Requests
  app.get("/api/hr/leave-requests", requireAuth, async (req, res) => {
    try {
      const employeeId = req.query.employee_id
        ? (req.query.employee_id as string)
        : undefined;
      const requests = await storage.getLeaveRequests(employeeId);
      res.json(requests);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب طلبات الإجازات" });
    }
  });

  app.post(
    "/api/hr/leave-requests",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertLeaveRequestSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const request = await storage.createLeaveRequest(validation.data);
        res.json(request);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء طلب الإجازة" });
      }
    },
  );

  app.put(
    "/api/hr/leave-requests/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const request = await storage.updateLeaveRequest(id, req.body);
        res.json(request);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في تحديث طلب الإجازة" });
      }
    },
  );

  app.get("/api/hr/leave-requests/pending", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getPendingLeaveRequests();
      res.json(requests);
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ message: "خطأ في جلب الطلبات المعلقة" });
    }
  });

  // Leave Balances
  app.get(
    "/api/hr/leave-balances/:employeeId",
    requireAuth,
    async (req, res) => {
      try {
        const employeeId = req.params.employeeId;
        let year: number | undefined;
        if (req.query.year) {
          const parsed = parseInt(req.query.year as string);
          year = !isNaN(parsed) && parsed > 0 ? parsed : undefined;
        }
        const balances = await storage.getLeaveBalances(employeeId, year);
        res.json(balances);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في جلب أرصدة الإجازات" });
      }
    },
  );

  app.post(
    "/api/hr/leave-balances",
    requireAuth,
    requirePermission("add_hr", "manage_hr"),
    async (req, res) => {
      try {
        const validation = insertLeaveBalanceSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            message: "بيانات غير صحيحة",
            errors: validation.error.errors,
          });
        }
        const balance = await storage.createLeaveBalance(validation.data);
        res.json(balance);
      } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ message: "خطأ في إنشاء رصيد الإجازة" });
      }
    },
  );

  // ============ HR Attendance Management API ============

  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const limit = Math.max(
        1,
        Math.min(parseInt(String(req.query.limit ?? "")) || 50, 500),
      );
      const offset = Math.max(0, parseInt(String(req.query.offset ?? "")) || 0);
      const attendance = await storage.getAttendance({ limit, offset });
      res.set("X-Pagination-Limit", String(limit));
      res.set("X-Pagination-Offset", String(offset));
      res.set("X-Pagination-Count", String(attendance.length));
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات الحضور" });
    }
  });

  // Get daily attendance status for a user
  app.get(
    "/api/attendance/daily-status/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const date =
          (req.query.date as string) || new Date().toISOString().split("T")[0];

        const status = await storage.getDailyAttendanceStatus(userId, date);
        res.json(status);
      } catch (error) {
        console.error("Error fetching daily attendance status:", error);
        res.status(500).json({ message: "خطأ في جلب حالة الحضور اليومية" });
      }
    },
  );

  // تسجيل الحضور مع تحقق الموقع الجغرافي المحسّن
  app.post(
    [
      "/api/attendance",
      "/api/attendance/check-in",
      "/api/attendance/check-out",
    ],
    requireAuth,
    async (req, res) => {
      try {
        const isDevMode = process.env.NODE_ENV === "development";

        // =============== ربط الهوية: منع تسجيل حضور باسم مستخدم آخر ===============
        // التسجيل الذاتي مربوط بالمستخدم المسجّل دخوله. يُسمح فقط لمن يملك
        // صلاحية إدارة الحضور بتسجيل الحضور نيابة عن موظف آخر.
        const authUserId = getAuthUserId(req);
        const canManageAttendance = hasPermission(
          (req as any).user?.permissions || [],
          "manage_attendance",
        );
        if (!canManageAttendance) {
          if (authUserId == null) {
            return res
              .status(401)
              .json({ message: "غير مصرح: يلزم تسجيل الدخول" });
          }
          req.body.user_id = authUserId;
        } else if (req.body.user_id == null) {
          req.body.user_id = authUserId;
        }

        // =============== إعدادات الحماية ===============
        const MAX_ACCURACY_METERS = 500; // الحد الأقصى للدقة المسموحة بالأمتار (مرن للمباني الداخلية)
        const MIN_ACCURACY_METERS = 3; // الحد الأدنى للدقة (أقل من ذلك يعني تزوير محتمل)

        // =============== جمع معلومات الجهاز للتدقيق ===============
        const deviceInfo = {
          ip: req.ip || req.connection?.remoteAddress || "unknown",
          userAgent: req.headers["user-agent"] || "unknown",
          timestamp: new Date().toISOString(),
          timezone:
            req.headers["timezone"] ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        // =============== التحقق من وجود بيانات الموقع ===============
        if (
          !req.body.location ||
          !req.body.location.lat ||
          !req.body.location.lng
        ) {
          return res.status(400).json({
            message: "يجب توفير الموقع الجغرافي لتسجيل الحضور",
            code: "LOCATION_REQUIRED",
          });
        }

        const { lat, lng, accuracy, isMocked, altitudeAccuracy } =
          req.body.location;

        // =============== التحقق من دقة الموقع ===============
        // نتعامل مع accuracy كرقم صالح أو نتجاهل التحقق إذا لم تتوفر
        const hasValidAccuracy =
          accuracy !== undefined && accuracy !== null && !isNaN(accuracy);

        if (hasValidAccuracy) {
          // دقة عالية جداً (أقل من 5 متر) قد تشير لتزوير
          if (accuracy < MIN_ACCURACY_METERS) {
            // نسجل التحذير لكن لا نرفض (قد يكون GPS حقيقي ممتاز)
          }

          // دقة منخفضة جداً
          if (accuracy > MAX_ACCURACY_METERS) {
            return res.status(400).json({
              message: `دقة الموقع منخفضة جداً (${Math.round(accuracy)} متر). يرجى الانتظار حتى تتحسن دقة GPS أو الخروج لمكان مفتوح.`,
              code: "LOW_ACCURACY",
              accuracy: Math.round(accuracy),
              maxAllowed: MAX_ACCURACY_METERS,
            });
          }
        } else {
          // تحذير في السجل إذا لم تتوفر معلومات الدقة
        }

        // =============== كشف تزوير الموقع (Mock Location) ===============
        if (isMocked === true) {
          // تسجيل محاولة التلاعب
          try {
            await storage.createViolation({
              user_id: req.body.user_id,
              type: "location_spoofing",
              description: `محاولة تسجيل حضور بموقع مزور`,
              details: JSON.stringify({
                location: { lat, lng },
                accuracy,
                deviceInfo,
                timestamp: new Date().toISOString(),
              }),
              severity: "high",
            });
          } catch (violationError) {
            console.error("خطأ في تسجيل المخالفة:", violationError);
          }

          return res.status(403).json({
            message:
              "تم اكتشاف محاولة تزوير الموقع! هذه المحاولة تم تسجيلها وسيتم إبلاغ الإدارة.",
            code: "MOCK_LOCATION_DETECTED",
          });
        }

        // =============== التحقق من صحة إحداثيات الموقع ===============
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return res.status(400).json({
            message: "إحداثيات الموقع غير صالحة",
            code: "INVALID_COORDINATES",
          });
        }

        // =============== التحقق من دور المستخدم (مندوب مبيعات) ===============
        const SALES_REP_ROLE_ID = 7; // دور مندوب المبيعات
        const user = await storage.getUserById(req.body.user_id);
        const isSalesRep = user?.role_id === SALES_REP_ROLE_ID;

        if (isSalesRep) {
        }

        // =============== جلب مواقع المصانع النشطة ===============
        const activeLocations = await storage.getActiveFactoryLocations();

        // مندوب المبيعات لا يحتاج لمواقع مصانع نشطة
        if (activeLocations.length === 0 && !isSalesRep) {
          return res.status(400).json({
            message: "لا توجد مواقع مصانع نشطة. يرجى التواصل مع الإدارة.",
            code: "NO_ACTIVE_LOCATIONS",
          });
        }

        // =============== دالة حساب المسافة (Haversine) ===============
        const calculateDistance = (
          lat1: number,
          lon1: number,
          lat2: number,
          lon2: number,
        ): number => {
          const R = 6371e3; // نصف قطر الأرض بالأمتار
          const φ1 = (lat1 * Math.PI) / 180;
          const φ2 = (lat2 * Math.PI) / 180;
          const Δφ = ((lat2 - lat1) * Math.PI) / 180;
          const Δλ = ((lon2 - lon1) * Math.PI) / 180;

          const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          return R * c;
        };

        // =============== التحقق من الموقع ===============
        let isWithinRange = false;
        let closestDistance = Infinity;
        let closestLocation: any = null;
        let matchedLocation: any = null;

        if (isDevMode) {
        }

        for (const factoryLocation of activeLocations) {
          const distance = calculateDistance(
            lat,
            lng,
            parseFloat(factoryLocation.latitude),
            parseFloat(factoryLocation.longitude),
          );

          // نأخذ دقة GPS بعين الاعتبار عند حساب المسافة الفعلية
          const effectiveDistance = accuracy
            ? Math.max(0, distance - accuracy)
            : distance;
          const effectiveRadius =
            factoryLocation.allowed_radius + (accuracy || 0);

          if (isDevMode) {
          }

          if (distance < closestDistance) {
            closestDistance = distance;
            closestLocation = factoryLocation;
          }

          if (distance <= factoryLocation.allowed_radius) {
            isWithinRange = true;
            matchedLocation = factoryLocation;
            break;
          }
        }

        if (!isWithinRange) {
          const errorMsg = `أنت خارج نطاق المصنع. المسافة: ${Math.round(closestDistance)} متر. النطاق المسموح: ${closestLocation?.allowed_radius} متر.`;

          return res.status(403).json({
            message: errorMsg,
            code: "OUT_OF_RANGE",
            distance: Math.round(closestDistance),
            allowedRadius: closestLocation?.allowed_radius,
            locationName: closestLocation?.name_ar,
            ...(isDevMode && {
              debug: {
                userLocation: { lat, lng, accuracy },
                closestLocation: {
                  name: closestLocation?.name_ar,
                  lat: closestLocation?.latitude,
                  lng: closestLocation?.longitude,
                },
              },
            }),
          });
        }

        // =============== إعداد بيانات الحضور مع معلومات التدقيق ===============
        // Derive the per-action timestamp from the status so the dashboard
        // can show real check-in / break / check-out times instead of
        // relying on `created_at` for everything.
        const nowTs = new Date();
        const status = String(req.body.status || "");
        const action = String(req.body.action || "");
        const stampOverrides: Record<string, Date | undefined> = {};
        if (status === "حاضر" && !req.body.check_in_time) {
          stampOverrides.check_in_time = nowTs;
        }
        if (status === "في الاستراحة" && !req.body.lunch_start_time) {
          stampOverrides.lunch_start_time = nowTs;
        }
        if (
          (status === "يعمل" || action === "end_lunch") &&
          !req.body.lunch_end_time
        ) {
          stampOverrides.lunch_end_time = nowTs;
        }
        if (status === "مغادر" && !req.body.check_out_time) {
          stampOverrides.check_out_time = nowTs;
        }

        const attendanceData = {
          ...req.body,
          ...stampOverrides,
          location_accuracy: accuracy,
          location_lat: lat,
          location_lng: lng,
          factory_location_id: matchedLocation?.id,
          device_info: JSON.stringify(deviceInfo),
          distance_from_factory: Math.round(closestDistance),
        };

        // =============== دعم الوردية الليلية ===============
        // عند تسجيل الخروج: إذا لم يكن هناك دخول مفتوح لتاريخ اليوم،
        // نبحث عن آخر دخول مفتوح خلال الـ 24 ساعة الماضية.
        // إذا وُجد في يوم سابق، نستخدم تاريخه لربط الخروج بنفس وردية الدخول.
        if (status === "مغادر") {
          const openRecord = await storage.findOpenCheckIn(req.body.user_id);
          if (
            openRecord &&
            String(openRecord.date) !== String(attendanceData.date)
          ) {
            attendanceData.date = openRecord.date;
          }
        }

        const attendance = await storage.createAttendance(attendanceData);

        // Send attendance notification asynchronously (fire-and-forget)
        const attendanceId = attendance.id;
        const attendanceUserId = req.body.user_id;
        const attendanceStatus = req.body.status;
        (async () => {
          try {
            const notifUser = await storage.getUserById(attendanceUserId);
            if (notifUser && notifUser.phone) {
              const displayName =
                notifUser.display_name_ar || notifUser.username || "";
              const timeStr = new Date().toLocaleTimeString("en-US");
              let statusPhrase = "";
              let priority = "normal";

              switch (attendanceStatus) {
                case "حاضر":
                  statusPhrase =
                    "تم تسجيل حضورك اليوم بنجاح. نتمنى لك يوم عمل مثمر!";
                  priority = "normal";
                  break;
                case "في الاستراحة":
                  statusPhrase =
                    "تم تسجيل بدء استراحة الغداء. استمتع بوقت راحتك!";
                  priority = "low";
                  break;
                case "يعمل":
                  statusPhrase =
                    "تم تسجيل انتهاء استراحة الغداء. مرحباً بعودتك للعمل!";
                  priority = "normal";
                  break;
                case "مغادر":
                  statusPhrase =
                    "تم تسجيل انصرافك. شكراً لجهودك اليوم، نراك غداً!";
                  priority = "normal";
                  break;
              }

              if (statusPhrase) {
                const fullMessage = `مرحباً ${displayName}، ${statusPhrase} (${timeStr})`;
                await notificationService.sendWhatsAppMessage(
                  notifUser.phone,
                  fullMessage,
                  {
                    title: "تنبيه الحضور",
                    priority,
                    context_type: "attendance",
                    context_id: attendanceId?.toString(),
                    useTemplate: true,
                    templateName: "attendance_update",
                    templateVariables: [displayName, statusPhrase, timeStr],
                  },
                );
              }
            }
          } catch (notificationError) {
            console.error(
              "Failed to send attendance notification:",
              notificationError,
            );
          }
        })();

        res.status(201).json(attendance);
      } catch (error) {
        console.error("Error creating attendance:", error);

        // Return the specific error message for validation errors
        if (error instanceof Error && error.message.includes("تم تسجيل")) {
          return res.status(400).json({ message: error.message });
        }

        if (error instanceof Error && error.message.includes("يجب")) {
          return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "خطأ في إنشاء سجل الحضور" });
      }
    },
  );

  app.put(
    "/api/attendance/:id",
    requireAuth,
    requirePermission("manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const attendance = await storage.updateAttendance(id, req.body);
        res.json(attendance);
      } catch (error) {
        console.error("Error updating attendance:", error);
        res.status(500).json({ message: "خطأ في تحديث سجل الحضور" });
      }
    },
  );

  app.delete(
    "/api/attendance/:id",
    requireAuth,
    requirePermission("manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteAttendance(id);
        res.json({ message: "تم حذف سجل الحضور بنجاح" });
      } catch (error) {
        console.error("Error deleting attendance:", error);
        res.status(500).json({ message: "خطأ في حذف سجل الحضور" });
      }
    },
  );

  // Calculate and update work hours for an attendance record
  app.put(
    "/api/attendance/:id/calculate-hours",
    requireAuth,
    requirePermission("manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const attendance = await storage.getAttendanceById(id);

        if (!attendance) {
          return res.status(404).json({ message: "سجل الحضور غير موجود" });
        }

        let workHours = 0;
        let overtimeHours = 0;
        const standardWorkHours = 8; // ساعات العمل الرسمية

        if (attendance.check_in_time && attendance.check_out_time) {
          const checkIn = new Date(attendance.check_in_time);
          const checkOut = new Date(attendance.check_out_time);
          let totalMinutes =
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);

          // Subtract lunch break if exists
          if (attendance.lunch_start_time && attendance.lunch_end_time) {
            const lunchStart = new Date(attendance.lunch_start_time);
            const lunchEnd = new Date(attendance.lunch_end_time);
            totalMinutes -=
              (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
          }

          // Subtract other break if exists
          if (attendance.break_start_time && attendance.break_end_time) {
            const breakStart = new Date(attendance.break_start_time);
            const breakEnd = new Date(attendance.break_end_time);
            totalMinutes -=
              (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
          }

          // Subtract any anti-fraud page-abandonment withdrawals
          const withdrawnMinutes = (attendance as any).total_withdrawn_minutes
            ? Number((attendance as any).total_withdrawn_minutes)
            : 0;
          if (withdrawnMinutes > 0) {
            totalMinutes -= withdrawnMinutes;
          }

          workHours = Math.max(0, totalMinutes / 60);

          // Calculate overtime
          if (workHours > standardWorkHours) {
            overtimeHours = workHours - standardWorkHours;
            workHours = standardWorkHours;
          }
        }

        const updated = await storage.updateAttendance(id, {
          work_hours: parseFloat(workHours.toFixed(2)),
          overtime_hours: parseFloat(overtimeHours.toFixed(2)),
        });

        res.json(updated);
      } catch (error) {
        console.error("Error calculating work hours:", error);
        res.status(500).json({ message: "خطأ في حساب ساعات العمل" });
      }
    },
  );

  // Get daily attendance statistics
  app.get(
    "/api/attendance/daily-stats",
    requireAuth,
    requirePermission("view_attendance"),
    async (req, res) => {
      try {
        const date =
          (req.query.date as string) || new Date().toISOString().split("T")[0];
        const stats = await storage.getDailyAttendanceStats(date);
        res.json({ data: stats, date });
      } catch (error) {
        console.error("Error fetching daily attendance stats:", error);
        res.status(500).json({ message: "خطأ في جلب إحصائيات الحضور اليومية" });
      }
    },
  );

  // Anti-fraud: open/close a page-abandonment withdrawal interval.
  //
  // Body: { action: 'start' | 'end', reason?: string }
  //   - 'start': opens a withdrawal row (ended_at=NULL), saves current
  //              attendance.status as previous_status, then switches the
  //              attendance row to "منسحب".
  //   - 'end':   finalizes the open withdrawal, computes duration on the
  //              server from started_at..now, adds it to the daily total,
  //              and restores attendance.status to previous_status (unless
  //              the user has since checked out or gone on break).
  // Timestamps are always server-authoritative — clients cannot forge them.
  app.post(
    "/api/attendance/:id/withdraw",
    requireAuth,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const att = await storage.getAttendanceById(id);
        if (!att) {
          return res.status(404).json({ message: "سجل الحضور غير موجود" });
        }
        const reqUserId = (req.user as any)?.id;
        if (!reqUserId || reqUserId !== att.user_id) {
          return res.status(403).json({ message: "غير مصرح" });
        }

        const parsed = z
          .object({
            action: z.enum(["start", "end"]),
            reason: z.string().max(50).optional().nullable(),
            lat: z.number().min(-90).max(90).optional(),
            lng: z.number().min(-180).max(180).optional(),
            accuracy: z.number().min(0).optional(),
          })
          .safeParse(req.body);
        if (!parsed.success) {
          return res
            .status(400)
            .json({
              message: "بيانات الانسحاب غير صحيحة",
              errors: parsed.error.issues,
            });
        }

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        if (att.date && String(att.date).slice(0, 10) !== today) {
          return res
            .status(400)
            .json({ message: "لا يمكن تسجيل انسحاب على سجل قديم" });
        }

        // Resolve the user's CURRENT daily state from the canonical
        // "latest attendance row" instead of trusting the `:id` row.
        // The action-per-row data model means newer rows reflect newer
        // state (lunch/check-out/etc.); the :id is only used for the
        // ownership check above.
        const dailyStatus = await storage.getDailyAttendanceStatus(
          att.user_id,
          today,
        );
        const currentStatus: string = dailyStatus?.currentStatus ?? "غائب";
        const hasCheckedIn: boolean = !!dailyStatus?.hasCheckedIn;
        const hasCheckedOut: boolean = !!dailyStatus?.hasCheckedOut;

        if (parsed.data.action === "start") {
          // Idempotent: if an open withdrawal already exists for this
          // user today, return it. We look up by user (not by attendance
          // id) because the row attached to the open withdrawal may
          // differ from the param `:id` after status transitions.
          const existing = await storage.getOpenAttendanceWithdrawalForUser(
            att.user_id,
            today,
          );
          if (existing) {
            return res.json({
              withdrawal: existing,
              status: "منسحب",
              alreadyOpen: true,
            });
          }
          // Hard rule: a withdrawal period can only be opened while the
          // user is actively working. Breaks, check-out, and absence are
          // not eligible for time deduction. We validate against the
          // user's CURRENT state, not the (possibly stale) :id row.
          if (!hasCheckedIn || hasCheckedOut) {
            return res.status(409).json({
              message: "لا يوجد جلسة عمل نشطة",
              currentStatus,
            });
          }
          if (currentStatus !== "حاضر" && currentStatus !== "يعمل") {
            return res.status(409).json({
              message: "لا يمكن فتح فترة انسحاب في الحالة الحالية",
              currentStatus,
            });
          }
          // Geofence enforcement: the only legitimate trigger for an
          // automatic withdrawal is the device physically leaving the
          // factory's allowed radius. Tab hide / network drop / window
          // blur must NOT flip status. We require client-supplied
          // coordinates and re-validate them server-side so a stale or
          // spoofed "I'm outside" claim still has to clear the same
          // Haversine check the check-in flow uses.
          const { lat, lng, accuracy } = parsed.data;
          if (
            typeof lat !== "number" ||
            typeof lng !== "number" ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {
            return res.status(400).json({
              message: "إحداثيات الموقع مطلوبة لتسجيل الانسحاب",
              code: "LOCATION_REQUIRED",
            });
          }
          const activeFactoryLocations =
            await storage.getActiveFactoryLocations();
          if (!activeFactoryLocations || activeFactoryLocations.length === 0) {
            return res.status(409).json({
              message: "لا توجد مواقع مصانع نشطة للتحقق من النطاق",
              code: "NO_ACTIVE_LOCATIONS",
            });
          }
          const haversine = (
            lat1: number,
            lon1: number,
            lat2: number,
            lon2: number,
          ): number => {
            const R = 6371e3;
            const toRad = (d: number) => (d * Math.PI) / 180;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
            return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          };
          let stillInside = false;
          let nearestDistance = Infinity;
          for (const loc of activeFactoryLocations) {
            const d = haversine(
              lat,
              lng,
              parseFloat(loc.latitude as any),
              parseFloat(loc.longitude as any),
            );
            if (d < nearestDistance) nearestDistance = d;
            const slack = accuracy && accuracy < 200 ? accuracy : 0;
            if (d <= (loc.allowed_radius || 500) + slack) {
              stillInside = true;
              break;
            }
          }
          if (stillInside) {
            return res.status(409).json({
              message: "لا يزال المستخدم داخل نطاق المصنع",
              code: "STILL_INSIDE_GEOFENCE",
              distance: Math.round(nearestDistance),
            });
          }
          // Insert a new attendance row with status "منسحب" so that
          // `getDailyAttendanceStatus` (which keys off the latest row by
          // created_at) reflects the withdrawal state on the UI.
          const withdrawnRow = await storage.createAttendance({
            user_id: att.user_id,
            date: today,
            status: "منسحب",
            notes: parsed.data.reason || "page_abandonment",
          } as any);
          const created = await storage.createAttendanceWithdrawal({
            attendance_id: withdrawnRow.id,
            user_id: att.user_id,
            date: today as any,
            started_at: now,
            ended_at: null,
            duration_minutes: 0,
            reason: parsed.data.reason || "page_abandonment",
            previous_status: currentStatus,
          });
          return res.json({
            withdrawal: created,
            status: "منسحب",
            attendanceId: withdrawnRow.id,
          });
        }

        // action === 'end'
        const open = await storage.getOpenAttendanceWithdrawalForUser(
          att.user_id,
          today,
        );
        if (!open) {
          // No open period — nothing to finalize.
          return res.json({ withdrawal: null, totalMinutes: 0 });
        }
        const restoreStatus = async () => {
          // Only restore if the user is still flagged as withdrawn. If
          // they manually went on break or checked out while the
          // watchdog was firing, respect that choice.
          if (!open.previous_status) return null;
          const after = await storage.getDailyAttendanceStatus(
            att.user_id,
            today,
          );
          if (after?.currentStatus !== "منسحب") return null;
          await storage.createAttendance({
            user_id: att.user_id,
            date: today,
            status: open.previous_status,
            notes: "auto_restore_after_withdrawal",
          } as any);
          return open.previous_status;
        };

        const startedMs = new Date(open.started_at as any).getTime();
        const rawDuration = Math.round((now.getTime() - startedMs) / 60_000);
        // Server-enforced threshold: brief flicker (< 1 min) shouldn't
        // count against the user.
        const MIN_DEDUCTIBLE_MINUTES = 1;
        if (rawDuration < MIN_DEDUCTIBLE_MINUTES) {
          const finalized = await storage.finalizeAttendanceWithdrawal(
            open.id,
            now,
            0,
          );
          const restoredStatus = await restoreStatus();
          const totals = await storage.getAttendanceWithdrawalsForDay(
            att.user_id,
            today,
          );
          return res.json({
            withdrawal: finalized,
            durationMinutes: 0,
            totalMinutes: totals.totalMinutes,
            restoredStatus,
            belowThreshold: true,
          });
        }
        const durationMinutes = Math.min(24 * 60, rawDuration);
        const finalized = await storage.finalizeAttendanceWithdrawal(
          open.id,
          now,
          durationMinutes,
        );
        if (!finalized) {
          // Concurrent end already won — restore status if needed and
          // return current totals so the client converges.
          const restoredStatus = await restoreStatus();
          const { totalMinutes } =
            await storage.getAttendanceWithdrawalsForDay(att.user_id, today);
          return res.json({
            withdrawal: null,
            durationMinutes: 0,
            totalMinutes,
            restoredStatus,
            alreadyClosed: true,
          });
        }
        const restoredStatus = await restoreStatus();

        const { totalMinutes } = await storage.getAttendanceWithdrawalsForDay(
          att.user_id,
          today,
        );
        let violationCreated = false;
        let createdViolationId: number | null = null;
        if (totalMinutes > 60) {
          try {
            const inserted = await db
              .insert(violations)
              .values({
                employee_id: att.user_id,
                violation_type: "page_abandonment",
                description: `انسحاب متكرر من صفحة الحضور (${totalMinutes} دقيقة)`,
                date: today as any,
                reported_by: null,
              })
              .onConflictDoNothing({
                target: [
                  violations.employee_id,
                  violations.violation_type,
                  violations.date,
                ],
              })
              .returning({ id: violations.id });
            violationCreated = inserted.length > 0;
            createdViolationId = inserted[0]?.id ?? null;
          } catch (vErr) {
            console.error("Failed to create page_abandonment violation", vErr);
          }
        }

        if (violationCreated && createdViolationId != null) {
          const violationId = createdViolationId;
          const offenderId = att.user_id;
          const minutesTotal = totalMinutes;
          // Fire-and-forget: alert managers without blocking the response.
          (async () => {
            try {
              const offender = await storage.getSafeUser(offenderId);
              const employeeName =
                offender?.display_name_ar ||
                offender?.display_name ||
                offender?.full_name ||
                offender?.username ||
                `موظف #${offenderId}`;

              const allRoles = await db.select().from(roles);
              const eligibleRoleIds = allRoles
                .filter((r) => {
                  const perms = Array.isArray(r.permissions)
                    ? r.permissions
                    : [];
                  return perms.some(
                    (p) => p === "manage_hr" || p === "view_attendance",
                  );
                })
                .map((r) => r.id);

              if (eligibleRoleIds.length === 0) return;

              const lists = await Promise.all(
                eligibleRoleIds.map((id) => storage.getSafeUsersByRole(id)),
              );
              const recipients = new Map<number, (typeof lists)[number][number]>();
              for (const list of lists) {
                for (const u of list) {
                  if (u.id === offenderId) continue;
                  if (u.status && u.status !== "active") continue;
                  recipients.set(u.id, u);
                }
              }
              if (recipients.size === 0) return;

              const titleAr = "تجاوز حد الانسحاب اليومي";
              const titleEn = "Page-abandonment threshold exceeded";
              const messageAr = `${employeeName} تجاوز حد الانسحاب اليومي بإجمالي ${minutesTotal} دقيقة اليوم`;
              const messageEn = `${employeeName} exceeded the daily page-abandonment limit with ${minutesTotal} minutes withdrawn today`;

              const nm =
                notificationManagerHolder.value || getNotificationManager(storage);

              for (const recipient of Array.from(recipients.values())) {
                try {
                  await nm.sendToUser(recipient.id, {
                    title: titleEn,
                    title_ar: titleAr,
                    message: messageEn,
                    message_ar: messageAr,
                    type: "hr",
                    priority: "high",
                    context_type: "violation",
                    context_id: String(violationId),
                  });
                } catch (e) {
                  console.error(
                    `Failed to send in-app page_abandonment alert to user ${recipient.id}`,
                    e,
                  );
                }
                // External-channel selection is centralized in
                // notificationService.deliverExternalAlert: it
                // resolves the recipient's available channels
                // (WhatsApp / SMS), tries WhatsApp first and
                // falls back to SMS if WhatsApp is unavailable
                // or fails. Each recipient is pinged on at most
                // one external channel.
                if (recipient.phone) {
                  notificationService
                    .deliverExternalAlert(recipient.phone, messageAr, {
                      title: titleAr,
                      priority: "high",
                      context_type: "violation",
                      context_id: String(violationId),
                    })
                    .catch((e) =>
                      console.error(
                        `Failed to send external page_abandonment alert to user ${recipient.id}`,
                        e,
                      ),
                    );
                }
              }
            } catch (notifyErr) {
              console.error(
                "Failed to dispatch page_abandonment manager alerts",
                notifyErr,
              );
            }
          })();
        }

        res.json({
          withdrawal: finalized,
          durationMinutes,
          totalMinutes,
          violationCreated,
          restoredStatus: open.previous_status ?? null,
        });
      } catch (error) {
        console.error("Error recording withdrawal:", error);
        res.status(500).json({ message: "خطأ في تسجيل الانسحاب" });
      }
    },
  );

  // Manager view: list page-abandonment withdrawals across employees in a date range
  app.get(
    "/api/attendance/withdrawals",
    requireAuth,
    requirePermission("view_attendance"),
    async (req, res) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const dateRe = /^\d{4}-\d{2}-\d{2}$/;
        const rawStart = (req.query.startDate as string) || today;
        const rawEnd = (req.query.endDate as string) || today;
        if (!dateRe.test(rawStart) || !dateRe.test(rawEnd)) {
          return res
            .status(400)
            .json({ message: "صيغة التاريخ غير صحيحة (YYYY-MM-DD)" });
        }
        let startDate = rawStart;
        let endDate = rawEnd;
        if (startDate > endDate) {
          [startDate, endDate] = [endDate, startDate];
        }
        let userId: number | undefined;
        if (req.query.userId) {
          try {
            userId = parseIntSafe(req.query.userId as string, "userId", {
              min: 1,
            });
          } catch {
            return res
              .status(400)
              .json({ message: "معرف المستخدم غير صحيح" });
          }
        }

        const result = await storage.getAttendanceWithdrawalsInRange(
          startDate,
          endDate,
          userId,
        );
        res.json({ ...result, startDate, endDate });
      } catch (error) {
        console.error("Error fetching withdrawals range:", error);
        res.status(500).json({ message: "خطأ في جلب فترات الانسحاب" });
      }
    },
  );

  // Get today's withdrawal summary for a user
  app.get(
    "/api/attendance/withdrawals/today/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const reqUserId = (req.user as any)?.id;
        if (reqUserId !== userId) {
          // Allow only self-access (others must use reports)
          return res.status(403).json({ message: "غير مصرح" });
        }
        const date =
          (req.query.date as string) || new Date().toISOString().split("T")[0];
        const result = await storage.getAttendanceWithdrawalsForDay(
          userId,
          date,
        );
        res.json({ ...result, date });
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
        res.status(500).json({ message: "خطأ في جلب فترات الانسحاب" });
      }
    },
  );

  // Record break time
  app.post(
    "/api/attendance/:id/break",
    requireAuth,
    requirePermission("manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const { action } = req.body; // 'start' or 'end'

        const attendance = await storage.getAttendanceById(id);
        if (!attendance) {
          return res.status(404).json({ message: "سجل الحضور غير موجود" });
        }

        const now = new Date();
        const updateData: any = {};

        if (action === "start") {
          updateData.break_start_time = now;
          updateData.status = "استراحة";
        } else if (action === "end") {
          updateData.break_end_time = now;
          updateData.status = "حاضر";
        }

        const updated = await storage.updateAttendance(id, updateData);
        res.json(updated);
      } catch (error) {
        console.error("Error recording break:", error);
        res.status(500).json({ message: "خطأ في تسجيل الاستراحة" });
      }
    },
  );

  // ============ HR Module API (Phase 1) ============

  // قائمة الموظفين (دليل الموارد البشرية) مع الوردية الحالية
  app.get(
    "/api/hr/employees",
    requireAuth,
    requirePermission("view_hr", "manage_hr", "view_attendance"),
    async (req, res) => {
      try {
        const employees = await storage.getHREmployees();
        res.json({ data: employees });
      } catch (error) {
        console.error("Error fetching HR employees:", error);
        res.status(500).json({ message: "خطأ في جلب قائمة الموظفين" });
      }
    },
  );

  // ملف الموظف الكامل (المرحلة الأولى)
  app.get(
    "/api/hr/employees/:userId/file",
    requireAuth,
    requirePermission("view_hr", "manage_hr", "view_attendance"),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف الموظف غير صحيح" });
        }
        const file = await storage.getEmployeeFile(userId);
        if (!file) {
          return res.status(404).json({ message: "الموظف غير موجود" });
        }
        res.json({ data: file });
      } catch (error) {
        console.error("Error fetching employee file:", error);
        res.status(500).json({ message: "خطأ في جلب ملف الموظف" });
      }
    },
  );

  // جدول الورديات الشهري لكل الموظفين
  app.get(
    "/api/hr/shifts",
    requireAuth,
    requirePermission("view_hr", "manage_hr", "view_attendance"),
    async (req, res) => {
      try {
        const fnow = factoryNowParts();
        const year = parseInt(
          (req.query.year as string) || String(fnow.year),
          10,
        );
        const month = parseInt(
          (req.query.month as string) || String(fnow.month),
          10,
        );
        if (
          isNaN(year) ||
          isNaN(month) ||
          month < 1 ||
          month > 12 ||
          year < 2000 ||
          year > 2100
        ) {
          return res.status(400).json({ message: "الشهر أو السنة غير صحيحة" });
        }
        const assignments = await storage.getShiftAssignmentsByPeriod(
          year,
          month,
        );
        res.json({ data: assignments, year, month });
      } catch (error) {
        console.error("Error fetching shift roster:", error);
        res.status(500).json({ message: "خطأ في جلب جدول الورديات" });
      }
    },
  );

  // حفظ/تحديث جدول الورديات الشهري (دفعة واحدة)
  app.post(
    "/api/hr/shifts",
    requireAuth,
    requirePermission("manage_attendance", "manage_hr"),
    async (req, res) => {
      try {
        const body = req.body ?? {};
        const year = parseInt(String(body.year), 10);
        const month = parseInt(String(body.month), 10);
        const rawEntries = Array.isArray(body.assignments)
          ? body.assignments
          : [];
        if (
          isNaN(year) ||
          isNaN(month) ||
          month < 1 ||
          month > 12 ||
          year < 2000 ||
          year > 2100
        ) {
          return res.status(400).json({ message: "الشهر أو السنة غير صحيحة" });
        }
        const entries = [];
        const deleteUserIds: number[] = [];
        for (const e of rawEntries) {
          const userId = parseInt(String(e.user_id), 10);
          if (isNaN(userId) || userId <= 0) {
            return res
              .status(400)
              .json({ message: "معرف الموظف غير صحيح في الجدول" });
          }
          // "none" / فارغ / null يعني إلغاء جدولة الموظف لهذا الشهر (حذف).
          if (e.shift === "none" || e.shift == null || e.shift === "") {
            deleteUserIds.push(userId);
            continue;
          }
          if (!isShiftType(e.shift)) {
            return res
              .status(400)
              .json({ message: "نوع الوردية غير صحيح (نهارية/ليلية فقط)" });
          }
          const parsed = insertShiftAssignmentSchema.safeParse({
            user_id: userId,
            year,
            month,
            shift: e.shift,
            notes: e.notes ?? null,
          });
          if (!parsed.success) {
            return res.status(400).json({
              message: "بيانات الوردية غير صحيحة",
              errors: parsed.error.flatten().fieldErrors,
            });
          }
          entries.push(parsed.data);
        }
        const createdBy = getAuthUserId(req) ?? null;
        const saved = await storage.saveShiftRoster(
          year,
          month,
          entries,
          deleteUserIds,
          createdBy,
        );
        res.json({ data: saved, year, month });
      } catch (error) {
        console.error("Error saving shift roster:", error);
        res.status(500).json({ message: "خطأ في حفظ جدول الورديات" });
      }
    },
  );

  // ملخص الحضور المحسوب لموظف خلال فترة (يومي + إجماليات)
  app.get(
    "/api/hr/attendance/summary/:userId",
    requireAuth,
    requirePermission("view_attendance", "view_attendance_reports", "manage_attendance", "view_hr", "manage_hr"),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف الموظف غير صحيح" });
        }
        const { from, to } = req.query as { from?: string; to?: string };
        if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
          return res
            .status(400)
            .json({ message: "يرجى تحديد فترة صحيحة (من/إلى)" });
        }
        if (from > to) {
          return res
            .status(400)
            .json({ message: "تاريخ البداية يجب أن يسبق تاريخ النهاية" });
        }
        const result = await storage.getComputedAttendance(userId, from, to);
        res.json({ data: result, from, to });
      } catch (error) {
        console.error("Error computing attendance summary:", error);
        res.status(500).json({ message: "خطأ في حساب ملخص الحضور" });
      }
    },
  );

  // تقرير الحضور لكل الموظفين خلال فترة
  app.get(
    "/api/hr/attendance/report",
    requireAuth,
    requirePermission("view_attendance_reports", "manage_attendance", "view_hr", "manage_hr"),
    async (req, res) => {
      try {
        const { from, to, sectionId } = req.query as {
          from?: string;
          to?: string;
          sectionId?: string;
        };
        if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
          return res
            .status(400)
            .json({ message: "يرجى تحديد فترة صحيحة (من/إلى)" });
        }
        if (from > to) {
          return res
            .status(400)
            .json({ message: "تاريخ البداية يجب أن يسبق تاريخ النهاية" });
        }
        const secId = sectionId ? parseInt(sectionId, 10) : undefined;
        const report = await storage.getAttendanceReportByRange(
          from,
          to,
          secId && !isNaN(secId) ? secId : undefined,
        );
        res.json({ data: report, from, to });
      } catch (error) {
        console.error("Error generating attendance report:", error);
        res.status(500).json({ message: "خطأ في إعداد تقرير الحضور" });
      }
    },
  );

  // الحضور والانصراف اليومي لكل الموظفين (سجل مجمّع لكل مستخدم)
  app.get(
    "/api/hr/attendance/daily",
    requireAuth,
    requirePermission("view_attendance_reports", "manage_attendance", "view_hr", "manage_hr"),
    async (req, res) => {
      try {
        const date =
          (req.query.date as string) || new Date().toISOString().split("T")[0];
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return res.status(400).json({ message: "تاريخ غير صحيح" });
        }
        const data = await storage.getDailyAttendanceOverview(date);
        res.json({ data, date });
      } catch (error) {
        console.error("Error fetching daily attendance overview:", error);
        res.status(500).json({ message: "خطأ في جلب الحضور اليومي" });
      }
    },
  );

  // تعديل سجل الحضور اليومي لموظف (للمدير فقط)
  app.patch(
    "/api/hr/attendance/daily",
    requireAuth,
    requirePermission("manage_attendance", "manage_hr"),
    async (req, res) => {
      try {
        const schema = z.object({
          user_id: z.number().int().positive(),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          check_in_time: z.string().nullable().optional(),
          break_start_time: z.string().nullable().optional(),
          break_end_time: z.string().nullable().optional(),
          check_out_time: z.string().nullable().optional(),
          status: z
            .enum([
              "حاضر",
              "يعمل",
              "في الاستراحة",
              "استراحة",
              "استراحة غداء",
              "منسحب",
              "مغادر",
              "غائب",
              "إجازة",
              "عطلة",
            ])
            .optional(),
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: "بيانات التعديل غير صحيحة" });
        }
        const body = parsed.data;

        const toDate = (
          v: string | null | undefined,
          label: string,
        ): Date | null | undefined => {
          if (v === undefined) return undefined;
          if (v === null) return null;
          const d = new Date(v);
          if (isNaN(d.getTime())) {
            throw new Error(`وقت غير صحيح: ${label}`);
          }
          return d;
        };

        let patch: {
          check_in_time?: Date | null;
          break_start_time?: Date | null;
          break_end_time?: Date | null;
          check_out_time?: Date | null;
          status?: string;
        };
        try {
          patch = {
            status: body.status,
          };
          const ci = toDate(body.check_in_time, "وقت الحضور");
          const bs = toDate(body.break_start_time, "بداية الاستراحة");
          const be = toDate(body.break_end_time, "نهاية الاستراحة");
          const co = toDate(body.check_out_time, "وقت الانصراف");
          if (ci !== undefined) patch.check_in_time = ci;
          if (bs !== undefined) patch.break_start_time = bs;
          if (be !== undefined) patch.break_end_time = be;
          if (co !== undefined) patch.check_out_time = co;
        } catch (e: any) {
          return res.status(400).json({ message: e.message });
        }

        // تحقق منطقي بسيط على القيم المرسلة معاً
        const t = (d: Date | null | undefined) =>
          d instanceof Date ? d.getTime() : null;
        const ciT = t(patch.check_in_time);
        const coT = t(patch.check_out_time);
        const bsT = t(patch.break_start_time);
        const beT = t(patch.break_end_time);
        if (ciT != null && coT != null && coT < ciT) {
          return res
            .status(400)
            .json({ message: "وقت الانصراف لا يمكن أن يسبق وقت الحضور" });
        }
        if (bsT != null && beT != null && beT < bsT) {
          return res.status(400).json({
            message: "نهاية الاستراحة لا يمكن أن تسبق بدايتها",
          });
        }

        const hasChange =
          "check_in_time" in patch ||
          "break_start_time" in patch ||
          "break_end_time" in patch ||
          "check_out_time" in patch ||
          !!patch.status;
        if (!hasChange) {
          return res.status(400).json({ message: "لا توجد تعديلات" });
        }

        const currentUserId = (req as any).user?.id;
        await storage.updateDailyAttendance(
          body.user_id,
          body.date,
          patch,
          typeof currentUserId === "number" ? currentUserId : undefined,
        );
        res.json({ success: true });
      } catch (error) {
        console.error("Error updating daily attendance:", error);
        res.status(500).json({ message: "خطأ في تعديل سجل الحضور" });
      }
    },
  );

  // إرسال إشعار واتس اب بحالة الحضور اليومي لموظف
  app.post(
    "/api/hr/attendance/daily/notify",
    requireAuth,
    requirePermission("manage_attendance", "manage_hr"),
    async (req, res) => {
      try {
        const schema = z.object({
          user_id: z.number().int().positive(),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: "بيانات غير صحيحة" });
        }
        const { user_id, date } = parsed.data;

        const notifUser = await storage.getUserById(user_id);
        if (!notifUser) {
          return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        if (!notifUser.phone || !String(notifUser.phone).trim()) {
          return res
            .status(400)
            .json({ message: "المستخدم لا يملك رقم جوال" });
        }

        const overview = await storage.getDailyAttendanceOverview(date);
        const row = (overview as any[]).find((r) => r.user_id === user_id);
        if (!row) {
          return res
            .status(404)
            .json({ message: "لا يوجد سجل حضور لهذا اليوم" });
        }

        const fmt = (t: Date | string | null) => {
          if (!t) return "—";
          const d = new Date(t);
          if (isNaN(d.getTime())) return "—";
          return d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Riyadh",
          });
        };

        const displayName =
          notifUser.display_name_ar ||
          notifUser.display_name ||
          notifUser.username ||
          "";
        const statusPhrase =
          `ملخص حضورك ليوم ${date}: الحالة: ${row.current_status}` +
          `، الحضور: ${fmt(row.check_in_time)}` +
          `، بداية الاستراحة: ${fmt(row.break_start_time)}` +
          `، العودة من الاستراحة: ${fmt(row.break_end_time)}` +
          `، الانصراف: ${fmt(row.check_out_time)}`;
        const timeStr = new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Riyadh",
        });

        const fullMessage = `مرحباً ${displayName}، ${statusPhrase} (${timeStr})`;
        const result = await notificationService.sendWhatsAppMessage(
          String(notifUser.phone),
          fullMessage,
          {
            title: "تنبيه الحضور",
            priority: "normal",
            context_type: "attendance",
            context_id: `daily-${date}-${user_id}`,
            useTemplate: true,
            templateName: "attendance_update",
            templateVariables: [displayName, statusPhrase, timeStr],
          },
        );

        if (!result.success) {
          return res.status(502).json({
            message: "تعذر إرسال الإشعار عبر الواتس اب",
            error: result.error,
          });
        }
        res.json({ success: true });
      } catch (error) {
        console.error("Error sending daily attendance notification:", error);
        res.status(500).json({ message: "خطأ في إرسال الإشعار" });
      }
    },
  );

  // تصدير تقرير الحضور إلى Excel
  app.get(
    "/api/hr/attendance/report/export",
    requireAuth,
    requirePermission("view_attendance_reports", "manage_attendance", "view_hr", "manage_hr"),
    async (req, res) => {
      try {
        const { from, to, sectionId } = req.query as {
          from?: string;
          to?: string;
          sectionId?: string;
        };
        if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
          return res
            .status(400)
            .json({ message: "يرجى تحديد فترة صحيحة (من/إلى)" });
        }
        const secId = sectionId ? parseInt(sectionId, 10) : undefined;
        const report = await storage.getAttendanceReportByRange(
          from,
          to,
          secId && !isNaN(secId) ? secId : undefined,
        );
        const rows = report.map((r: any) => ({
          "الموظف": r.employee.display_name_ar || r.employee.display_name || r.employee.username,
          "القسم": r.employee.section_name_ar || r.employee.section_name || "",
          "أيام مجدولة": r.totals.scheduledDays,
          "أيام حضور": r.totals.presentDays,
          "أيام غياب": r.totals.absentDays,
          "أيام غير مكتملة": r.totals.incompleteDays,
          "دقائق تأخير": r.totals.totalLateMinutes,
          "دقائق مغادرة مبكرة": r.totals.totalEarlyLeaveMinutes,
          "دقائق انسحاب": r.totals.totalWithdrawnMinutes,
          "ساعات العمل": r.totals.totalWorkedHours,
          "ساعات إضافية": r.totals.totalOvertimeHours,
        }));
        const workbook = new ExcelJS.Workbook();
        addJsonSheet(workbook, rows, "تقرير الحضور");
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="attendance-report-${from}_${to}.xlsx"`,
        );
        res.send(Buffer.from(buffer));
      } catch (error) {
        console.error("Error exporting attendance report:", error);
        res.status(500).json({ message: "خطأ في تصدير تقرير الحضور" });
      }
    },
  );

  // ============ User Violations Management API ============

  // Self-scoped endpoint: any authenticated employee can view only their own
  // violations. This must be registered before the parameterized routes so it
  // is not shadowed by "/api/violations/:id".
  app.get("/api/violations/my", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      const violations = await storage.getViolationsByEmployee(userId);
      res.json(violations);
    } catch (error) {
      console.error("Error fetching own violations:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المخالفات" });
    }
  });

  app.get(
    "/api/violations",
    requireAuth,
    requirePermission("view_hr", "manage_hr", "manage_attendance"),
    async (req, res) => {
      try {
        const violations = await storage.getViolations();
        res.json(violations);
      } catch (error) {
        console.error("Error fetching violations:", error);
        res.status(500).json({ message: "خطأ في جلب بيانات المخالفات" });
      }
    },
  );

  app.post(
    "/api/violations",
    requireAuth,
    requirePermission("add_hr", "manage_hr", "manage_attendance"),
    async (req, res) => {
    try {
      // Accept legacy field names from older clients (user_id, type) and map
      // them to the actual DB columns (employee_id, violation_type).
      const body: Record<string, any> = { ...(req.body ?? {}) };
      if (body.user_id !== undefined && body.employee_id === undefined) {
        body.employee_id = body.user_id;
      }
      if (body.type !== undefined && body.violation_type === undefined) {
        body.violation_type = body.type;
      }
      const reporterId = getAuthUserId(req);
      if (reporterId && body.reported_by === undefined) {
        body.reported_by = reporterId;
      }
      const parsed = insertViolationSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "بيانات المخالفة غير صحيحة",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const violation = await storage.createViolation(parsed.data);
      res.status(201).json(violation);
    } catch (error) {
      console.error("Error creating violation:", error);
      res.status(500).json({ message: "خطأ في إنشاء المخالفة" });
    }
    },
  );

  app.put(
    "/api/violations/:id",
    requireAuth,
    requirePermission("edit_hr", "manage_hr", "manage_attendance"),
    async (req, res) => {
    try {
      const id = parseRouteParam(req.params.id, "id");
      const body: Record<string, any> = { ...(req.body ?? {}) };
      if (body.type !== undefined && body.violation_type === undefined) {
        body.violation_type = body.type;
      }
      const parsed = updateViolationSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "بيانات التحديث غير صحيحة",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const violation = await storage.updateViolation(id, parsed.data);
      res.json(violation);
    } catch (error) {
      console.error("Error updating violation:", error);
      res.status(500).json({ message: "خطأ في تحديث المخالفة" });
    }
    },
  );

  app.delete(
    "/api/violations/:id",
    requireAuth,
    requirePermission("delete_hr", "manage_hr", "manage_attendance"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteViolation(id);
        res.json({ message: "تم حذف المخالفة بنجاح" });
      } catch (error) {
        console.error("Error deleting violation:", error);
        res.status(500).json({ message: "خطأ في حذف المخالفة" });
      }
    },
  );

  // العمال (أقسام الفيلم/الطباعة/التقطيع فقط)
  app.get("/api/work-violations/workers", requireAuth, WV_READ, async (_req, res) => {
    try {
      res.json(await storage.getWorkViolationWorkers());
    } catch (error) {
      console.error("Error fetching work violation workers:", error);
      res.status(500).json({ message: "خطأ في جلب قائمة العمال" });
    }
  });

  // ماكينات أقسام الإنتاج (للاختيار الاختياري عند التسجيل)
  app.get(
    "/api/work-violations/machines",
    requireAuth,
    WV_READ,
    async (_req, res) => {
      try {
        res.json(await storage.getWorkViolationMachines());
      } catch (error) {
        console.error("Error fetching work violation machines:", error);
        res.status(500).json({ message: "خطأ في جلب قائمة الماكينات" });
      }
    },
  );

  app.get("/api/work-violations/types", requireAuth, WV_READ, async (_req, res) => {
    try {
      res.json(await storage.getWorkViolationTypes());
    } catch (error) {
      console.error("Error fetching work violation types:", error);
      res.status(500).json({ message: "خطأ في جلب أنواع المخالفات" });
    }
  });

  app.put(
    "/api/work-violations/types/:id",
    requireAuth,
    WV_MANAGE,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const parsed = updateWorkViolationTypeSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات نوع المخالفة غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const row = await storage.updateWorkViolationType(id, parsed.data);
        if (!row) return res.status(404).json({ message: "نوع المخالفة غير موجود" });
        res.json(row);
      } catch (error) {
        console.error("Error updating work violation type:", error);
        res.status(500).json({ message: "خطأ في تحديث نوع المخالفة" });
      }
    },
  );

  app.get(
    "/api/work-violations/settings",
    requireAuth,
    WV_READ,
    async (_req, res) => {
      try {
        res.json(await storage.getWorkViolationSettings());
      } catch (error) {
        console.error("Error fetching work violation settings:", error);
        res.status(500).json({ message: "خطأ في جلب إعدادات المخالفات" });
      }
    },
  );

  app.put(
    "/api/work-violations/settings",
    requireAuth,
    WV_MANAGE,
    async (req, res) => {
      try {
        const parsed = updateWorkViolationSettingsSchema.safeParse(
          req.body ?? {},
        );
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات الإعدادات غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const row = await storage.updateWorkViolationSettings(
          parsed.data,
          getAuthUserId(req) ?? null,
        );
        res.json(row);
      } catch (error) {
        console.error("Error updating work violation settings:", error);
        res.status(500).json({ message: "خطأ في تحديث إعدادات المخالفات" });
      }
    },
  );

  app.get("/api/work-violations", requireAuth, WV_READ, async (req, res) => {
    try {
      const employeeId = req.query.employee_id
        ? parseInt(String(req.query.employee_id), 10)
        : undefined;
      const from = req.query.from ? new Date(String(req.query.from)) : undefined;
      const to = req.query.to ? new Date(String(req.query.to)) : undefined;
      if (
        (employeeId !== undefined && !Number.isFinite(employeeId)) ||
        (from && isNaN(from.getTime())) ||
        (to && isNaN(to.getTime()))
      ) {
        return res.status(400).json({ message: "معايير البحث غير صحيحة" });
      }
      // نهاية اليوم للتاريخ "إلى" حتى تشمل مخالفات اليوم نفسه
      if (to) to.setHours(23, 59, 59, 999);
      res.json(await storage.getWorkViolations({ employeeId, from, to }));
    } catch (error) {
      console.error("Error fetching work violations:", error);
      res.status(500).json({ message: "خطأ في جلب مخالفات العمل" });
    }
  });

  app.post("/api/work-violations", requireAuth, WV_RECORD, async (req, res) => {
    try {
      const reporterId = getAuthUserId(req);
      if (!reporterId) return res.status(401).json({ message: "غير مصرح" });
      const parsed = insertWorkViolationSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({
          message: "بيانات المخالفة غير صحيحة",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      // التأكد أن الموظف من أقسام الإنتاج المسموحة
      const workers = await storage.getWorkViolationWorkers();
      if (!workers.some((w: any) => w.id === parsed.data.employee_id)) {
        return res.status(400).json({
          message: "لا يمكن تسجيل مخالفة إلا لعمال أقسام الفيلم والطباعة والتقطيع",
        });
      }
      const row = await storage.createWorkViolation(parsed.data, reporterId);
      res.status(201).json(row);
    } catch (error) {
      console.error("Error creating work violation:", error);
      res.status(500).json({ message: "خطأ في تسجيل المخالفة" });
    }
  });

  app.put(
    "/api/work-violations/:id",
    requireAuth,
    WV_MANAGE,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const parsed = updateWorkViolationSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات التحديث غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        if (parsed.data.employee_id !== undefined) {
          const workers = await storage.getWorkViolationWorkers();
          if (!workers.some((w: any) => w.id === parsed.data.employee_id)) {
            return res.status(400).json({
              message:
                "لا يمكن تسجيل مخالفة إلا لعمال أقسام الفيلم والطباعة والتقطيع",
            });
          }
        }
        const row = await storage.updateWorkViolation(id, parsed.data);
        res.json(row);
      } catch (error: any) {
        console.error("Error updating work violation:", error);
        if (error?.message === "المخالفة غير موجودة") {
          return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "خطأ في تحديث المخالفة" });
      }
    },
  );

  app.delete(
    "/api/work-violations/:id",
    requireAuth,
    WV_MANAGE,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteWorkViolation(id);
        res.json({ message: "تم حذف المخالفة بنجاح" });
      } catch (error) {
        console.error("Error deleting work violation:", error);
        res.status(500).json({ message: "خطأ في حذف المخالفة" });
      }
    },
  );

  app.post(
    "/api/work-violations/:id/waive",
    requireAuth,
    WV_MANAGE,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const userId = getAuthUserId(req);
        if (!userId) return res.status(401).json({ message: "غير مصرح" });
        const parsed = waiveWorkViolationSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({ message: "بيانات غير صحيحة" });
        }
        const row = await storage.setWorkViolationWaived(
          id,
          true,
          userId,
          parsed.data.waive_reason ?? null,
        );
        if (!row) return res.status(404).json({ message: "المخالفة غير موجودة" });
        res.json(row);
      } catch (error) {
        console.error("Error waiving work violation:", error);
        res.status(500).json({ message: "خطأ في تجاوز المخالفة" });
      }
    },
  );

  app.post(
    "/api/work-violations/:id/unwaive",
    requireAuth,
    WV_MANAGE,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const userId = getAuthUserId(req);
        if (!userId) return res.status(401).json({ message: "غير مصرح" });
        const row = await storage.setWorkViolationWaived(id, false, userId);
        if (!row) return res.status(404).json({ message: "المخالفة غير موجودة" });
        res.json(row);
      } catch (error) {
        console.error("Error un-waiving work violation:", error);
        res.status(500).json({ message: "خطأ في إلغاء تجاوز المخالفة" });
      }
    },
  );

  // ----- المخالفات لكل موظف (قراءة) -----
  app.get(
    "/api/hr/employees/:userId/violations",
    requireAuth,
    HR_VIEW,
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const data = await storage.getViolationsByEmployee(userId);
        res.json({ data });
      } catch (error) {
        console.error("Error fetching employee violations:", error);
        res.status(500).json({ message: "خطأ في جلب مخالفات الموظف" });
      }
    },
  );

  // ----- المكافآت -----
  app.get(
    "/api/hr/employees/:userId/rewards",
    requireAuth,
    HR_VIEW,
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const data = await storage.getRewardsByEmployee(userId);
        res.json({ data });
      } catch (error) {
        console.error("Error fetching rewards:", error);
        res.status(500).json({ message: "خطأ في جلب المكافآت" });
      }
    },
  );

  app.post(
    "/api/hr/employees/:userId/rewards",
    requireAuth,
    HR_CREATE,
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const parsed = insertRewardSchema.safeParse({
          ...req.body,
          employee_id: userId,
          granted_by: getAuthUserId(req) ?? undefined,
        });
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات المكافأة غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = await storage.createReward(parsed.data);
        res.status(201).json({ data });
      } catch (error) {
        console.error("Error creating reward:", error);
        res.status(500).json({ message: "خطأ في إضافة المكافأة" });
      }
    },
  );

  app.put(
    "/api/hr/rewards/:id",
    requireAuth,
    HR_EDIT,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const parsed = updateRewardSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات التحديث غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = await storage.updateReward(id, parsed.data);
        res.json({ data });
      } catch (error) {
        console.error("Error updating reward:", error);
        res.status(500).json({ message: "خطأ في تحديث المكافأة" });
      }
    },
  );

  app.delete(
    "/api/hr/rewards/:id",
    requireAuth,
    HR_DELETE,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteReward(id);
        res.json({ message: "تم حذف المكافأة بنجاح" });
      } catch (error) {
        console.error("Error deleting reward:", error);
        res.status(500).json({ message: "خطأ في حذف المكافأة" });
      }
    },
  );

  // ----- العهد والأصول -----
  app.get(
    "/api/hr/employees/:userId/custody",
    requireAuth,
    HR_VIEW,
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const data = await storage.getCustodyByEmployee(userId);
        res.json({ data });
      } catch (error) {
        console.error("Error fetching custody:", error);
        res.status(500).json({ message: "خطأ في جلب العهد" });
      }
    },
  );

  app.post(
    "/api/hr/employees/:userId/custody",
    requireAuth,
    HR_CREATE,
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const parsed = insertEmployeeCustodySchema.safeParse({
          ...req.body,
          employee_id: userId,
          recorded_by: getAuthUserId(req) ?? undefined,
        });
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات العهدة غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = await storage.createCustody(parsed.data);
        res.status(201).json({ data });
      } catch (error) {
        console.error("Error creating custody:", error);
        res.status(500).json({ message: "خطأ في إضافة العهدة" });
      }
    },
  );

  app.put(
    "/api/hr/custody/:id",
    requireAuth,
    HR_EDIT,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const parsed = updateEmployeeCustodySchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات التحديث غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = await storage.updateCustody(id, parsed.data);
        res.json({ data });
      } catch (error) {
        console.error("Error updating custody:", error);
        res.status(500).json({ message: "خطأ في تحديث العهدة" });
      }
    },
  );

  app.delete(
    "/api/hr/custody/:id",
    requireAuth,
    HR_DELETE,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteCustody(id);
        res.json({ message: "تم حذف العهدة بنجاح" });
      } catch (error) {
        console.error("Error deleting custody:", error);
        res.status(500).json({ message: "خطأ في حذف العهدة" });
      }
    },
  );

  // ----- السمات الشخصية -----
  app.get(
    "/api/hr/employees/:userId/traits",
    requireAuth,
    HR_VIEW,
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const data = await storage.getTraitsByEmployee(userId);
        res.json({ data });
      } catch (error) {
        console.error("Error fetching traits:", error);
        res.status(500).json({ message: "خطأ في جلب السمات" });
      }
    },
  );

  app.post(
    "/api/hr/employees/:userId/traits",
    requireAuth,
    HR_CREATE,
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const parsed = insertEmployeeTraitSchema.safeParse({
          ...req.body,
          employee_id: userId,
          recorded_by: getAuthUserId(req) ?? undefined,
        });
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات السمة غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = await storage.createTrait(parsed.data);
        res.status(201).json({ data });
      } catch (error) {
        console.error("Error creating trait:", error);
        res.status(500).json({ message: "خطأ في إضافة السمة" });
      }
    },
  );

  app.put(
    "/api/hr/traits/:id",
    requireAuth,
    HR_EDIT,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        const parsed = updateEmployeeTraitSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات التحديث غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = await storage.updateTrait(id, parsed.data);
        res.json({ data });
      } catch (error) {
        console.error("Error updating trait:", error);
        res.status(500).json({ message: "خطأ في تحديث السمة" });
      }
    },
  );

  app.delete(
    "/api/hr/traits/:id",
    requireAuth,
    HR_DELETE,
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteTrait(id);
        res.json({ message: "تم حذف السمة بنجاح" });
      } catch (error) {
        console.error("Error deleting trait:", error);
        res.status(500).json({ message: "خطأ في حذف السمة" });
      }
    },
  );

  // ----- التدريبات لكل موظف -----
  app.get(
    "/api/hr/employees/:userId/training",
    requireAuth,
    requirePermission("view_hr", "manage_hr", "view_training", "manage_training"),
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const data = await storage.getTrainingByEmployee(userId);
        res.json({ data });
      } catch (error) {
        console.error("Error fetching employee training:", error);
        res.status(500).json({ message: "خطأ في جلب تدريبات الموظف" });
      }
    },
  );

  app.post(
    "/api/hr/employees/:userId/training",
    requireAuth,
    requirePermission("manage_hr", "add_hr", "manage_training"),
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const parsed = insertTrainingRecordSchema.safeParse({
          ...req.body,
          employee_id: userId,
        });
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات التدريب غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = await storage.createTrainingRecord(parsed.data);
        res.status(201).json({ data });
      } catch (error) {
        console.error("Error creating training record:", error);
        res.status(500).json({ message: "خطأ في إضافة سجل التدريب" });
      }
    },
  );

  app.delete(
    "/api/hr/training-records/:id",
    requireAuth,
    requirePermission("manage_hr", "delete_hr", "manage_training"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteTrainingRecord(id);
        res.json({ message: "تم حذف سجل التدريب بنجاح" });
      } catch (error) {
        console.error("Error deleting training record:", error);
        res.status(500).json({ message: "خطأ في حذف سجل التدريب" });
      }
    },
  );

  // ----- الأجور (محسوبة من محرك الحضور) -----
  app.get(
    "/api/hr/employees/:userId/wages",
    requireAuth,
    HR_VIEW,
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const data = await storage.getWageRecordsByEmployee(userId);
        res.json({ data });
      } catch (error) {
        console.error("Error fetching wages:", error);
        res.status(500).json({ message: "خطأ في جلب سجلات الأجور" });
      }
    },
  );

  app.post(
    "/api/hr/employees/:userId/wages/compute",
    requireAuth,
    requirePermission("manage_hr"),
    async (req, res) => {
      try {
        const userId = parseEmployeeId(req, res);
        if (userId === null) return;
        const body = req.body ?? {};
        const year = parseInt(String(body.year), 10);
        const month = parseInt(String(body.month), 10);
        const baseHourlyRate = Number(body.base_hourly_rate);
        const overtimeMultiplier =
          body.overtime_multiplier != null
            ? Number(body.overtime_multiplier)
            : 1.5;
        if (
          isNaN(year) ||
          isNaN(month) ||
          month < 1 ||
          month > 12 ||
          year < 2000 ||
          year > 2100
        ) {
          return res.status(400).json({ message: "الشهر أو السنة غير صحيحة" });
        }
        if (isNaN(baseHourlyRate) || baseHourlyRate < 0) {
          return res
            .status(400)
            .json({ message: "أجر الساعة الأساسي غير صحيح" });
        }
        if (
          isNaN(overtimeMultiplier) ||
          overtimeMultiplier < 1 ||
          overtimeMultiplier > 5
        ) {
          return res
            .status(400)
            .json({ message: "معامل الساعات الإضافية غير صحيح" });
        }
        const result = await storage.computeAndSaveWage({
          employeeId: userId,
          year,
          month,
          baseHourlyRate,
          overtimeMultiplier,
          notes: typeof body.notes === "string" ? body.notes : null,
          computedBy: getAuthUserId(req) ?? null,
        });
        res.json({ data: result.record, breakdown: result.breakdown });
      } catch (error) {
        console.error("Error computing wage:", error);
        res.status(500).json({ message: "خطأ في حساب الأجر" });
      }
    },
  );

  app.delete(
    "/api/hr/wages/:id",
    requireAuth,
    requirePermission("manage_hr", "delete_hr"),
    async (req, res) => {
      try {
        const id = parseRouteParam(req.params.id, "id");
        await storage.deleteWageRecord(id);
        res.json({ message: "تم حذف سجل الأجر بنجاح" });
      } catch (error) {
        console.error("Error deleting wage record:", error);
        res.status(500).json({ message: "خطأ في حذف سجل الأجر" });
      }
    },
  );

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
