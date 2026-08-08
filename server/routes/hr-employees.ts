import type { Express } from "express";


import { storage } from "../storage";

import { insertShiftAssignmentSchema } from "@shared/schema";
import { isShiftType, factoryNowParts } from "@shared/shifts";
import { z } from "zod";
import ExcelJS from "exceljs";

import { requireAuth, requirePermission } from "../middleware/auth";
import { notificationService, addJsonSheet, getAuthUserId } from "./shared";

// Extracted from server/routes/hr.ts (registration order preserved; called
// from registerHrRoutes). See server/routes/README.md.
export async function registerHrEmployeeRoutes(app: Express, ctx: any) {

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

}
