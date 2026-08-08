import type { Express } from "express";


import { storage } from "../storage";

import {
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
} from "@shared/schema";

import { requireAuth, requirePermission } from "../middleware/auth";
import { parseRouteParam } from "./shared";

// Extracted from server/routes/hr.ts (registration order preserved; called
// from registerHrRoutes). See server/routes/README.md.
export async function registerHrTrainingRoutes(app: Express, ctx: any) {


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

}
