import type { Express } from "express";


import { storage } from "../storage";

import {
  insertTrainingRecordSchema,
  insertViolationSchema,
  updateViolationSchema,
  insertWorkViolationSchema,
  updateWorkViolationSchema,
  updateWorkViolationTypeSchema,
  updateWorkViolationSettingsSchema,
  waiveWorkViolationSchema,
  insertRewardSchema,
  updateRewardSchema,
  insertEmployeeCustodySchema,
  updateEmployeeCustodySchema,
  insertEmployeeTraitSchema,
  updateEmployeeTraitSchema,
} from "@shared/schema";

import { requireAuth, requirePermission } from "../middleware/auth";
import { getAuthUserId, parseRouteParam } from "./shared";

// Extracted from server/routes/hr.ts (registration order preserved; called
// from registerHrRoutes). See server/routes/README.md.
export async function registerHrViolationRoutes(app: Express, ctx: any) {
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

}
