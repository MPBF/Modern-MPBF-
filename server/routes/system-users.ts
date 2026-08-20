// 🤖 مسارات إدارة مستخدمي النظام الآليين وإعدادات المحاكاة
import type { Express } from "express";
import { and, desc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  customer_service_knowledge,
  system_user_activity,
  system_user_data_access,
  system_user_message_queue,
  system_user_settings,
  systemUserKnowledgeSchema,
  updateSystemUserSettingsSchema,
  users,
} from "@shared/schema";
import { requireAuth, requirePermission, requireAdmin } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import {
  isSimulationEnabled,
  runSimulationCycle,
  setSimulationEnabled,
} from "../services/system-user-simulator";
import {
  ADVANCED_TABLES,
  DATA_SOURCES,
  isValidAdvancedSystemUserTable,
  isValidSystemUserSource,
  resetSystemUserDataContext,
} from "../services/system-user-data-access";

export { ADVANCED_TABLES, DATA_SOURCES };

const MANAGE = ["manage_users", "manage_settings", "manage_definitions"] as const;

function actorId(req: any): number {
  return (req as AuthRequest).user!.id;
}

function userPerms(req: any): string[] {
  return (req as AuthRequest).user?.permissions || [];
}

function isAdmin(req: any): boolean {
  return userPerms(req).includes("admin");
}

// دالة مساعدة لتسجيل النشاط ضمن معاملة أو خارجها
async function logActivity(
  txOrDb: any,
  opts: {
    system_user_id: number | null;
    actor_id: number | null;
    action: string;
    details: Record<string, any>;
  },
) {
  await txOrDb
    .insert(system_user_activity)
    .values({
      system_user_id: opts.system_user_id,
      actor_id: opts.actor_id,
      action: opts.action,
      details: opts.details,
    });
}

export async function registerSystemUsersRoutes(app: Express, _ctx: any) {
  // قائمة المستخدمين الآليين مع إعداداتهم
  app.get(
    "/api/system-users",
    requireAuth,
    requirePermission(...MANAGE),
    async (_req, res) => {
      try {
        const rows = await db
          .select({
            id: users.id,
            username: users.username,
            display_name: users.display_name,
            display_name_ar: users.display_name_ar,
            role_id: users.role_id,
            status: users.status,
            settings: system_user_settings,
          })
          .from(users)
          .leftJoin(
            system_user_settings,
            eq(system_user_settings.user_id, users.id),
          )
          .where(eq(users.is_system_user, true));
        const enabled = await isSimulationEnabled();
        res.json({ simulation_enabled: enabled, users: rows });
      } catch (error) {
        console.error("Error fetching system users:", error);
        res.status(500).json({ message: "خطأ في جلب مستخدمي النظام" });
      }
    },
  );

  // تحديث إعدادات مستخدم آلي (upsert) – يكتب التغييرات وسجل النشاط في معاملة واحدة
  app.put(
    "/api/system-users/:userId/settings",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const [target] = await db
          .select({ id: users.id, is_system_user: users.is_system_user })
          .from(users)
          .where(eq(users.id, userId));
        if (!target || !target.is_system_user) {
          return res
            .status(404)
            .json({ message: "المستخدم غير موجود أو ليس مستخدم نظام" });
        }
        const parsed = updateSystemUserSettingsSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات الإعدادات غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data: Record<string, any> = { ...parsed.data };
        if (data.allowed_days !== undefined) {
          data.allowed_days = JSON.stringify(
            Array.from(new Set(data.allowed_days)).sort(),
          );
        }
        if (data.reply_allowed_days !== undefined && data.reply_allowed_days !== null) {
          data.reply_allowed_days = JSON.stringify(
            Array.from(new Set(data.reply_allowed_days)).sort(),
          );
        }
        if (data.allowed_message_categories !== undefined) {
          data.allowed_message_categories = JSON.stringify(data.allowed_message_categories);
        }
        // منع جعل المستلم مستخدماً غير موجود
        if (data.weekly_report_recipient_id) {
          const [rec] = await db
            .select({ id: users.id, status: users.status })
            .from(users)
            .where(eq(users.id, data.weekly_report_recipient_id));
          if (!rec || rec.status === "deleted") {
            return res
              .status(400)
              .json({ message: "مستلم التقرير الأسبوعي غير موجود" });
          }
        }
        data.updated_at = new Date();

        const saved = await db.transaction(async (tx) => {
          // تُقرأ القيمة السابقة تحت قفل الصف داخل نفس معاملة الكتابة والتدقيق
          // حتى لا يسجل تحديثان متزامنان قيمة "سابقة" قديمة.
          const [existing] = await tx
            .select()
            .from(system_user_settings)
            .where(eq(system_user_settings.user_id, userId))
            .for("update");
          let row;
          if (existing) {
            [row] = await tx
              .update(system_user_settings)
              .set(data)
              .where(eq(system_user_settings.user_id, userId))
              .returning();
          } else {
            [row] = await tx
              .insert(system_user_settings)
              .values({ user_id: userId, ...data })
              .returning();
          }
          await logActivity(tx, {
            system_user_id: userId,
            actor_id: actorId(req),
            action: "update_settings",
            details: {
              changed_fields: Object.keys(parsed.data),
              previous: existing
                ? Object.fromEntries(
                    Object.keys(parsed.data).map((k) => [k, (existing as any)[k]])
                  )
                : null,
              current: Object.fromEntries(
                Object.keys(parsed.data).map((k) => [k, (row as any)[k]]),
              ),
            },
          });
          return row;
        });
        res.json(saved);
      } catch (error) {
        console.error("Error updating system user settings:", error);
        res.status(500).json({ message: "خطأ في حفظ إعدادات مستخدم النظام" });
      }
    },
  );

  // تشغيل/إيقاف المحاكاة بالكامل
  app.put(
    "/api/system-users/simulation",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const enabled = req.body?.enabled;
        if (typeof enabled !== "boolean") {
          return res.status(400).json({ message: "قيمة التفعيل غير صحيحة" });
        }
        await setSimulationEnabled(enabled, (req as any).user?.id);
        res.json({ simulation_enabled: enabled });
      } catch (error) {
        console.error("Error toggling simulation:", error);
        res.status(500).json({ message: "خطأ في تغيير حالة المحاكاة" });
      }
    },
  );

  // تشغيل فوري للتجربة
  app.post(
    "/api/system-users/run-now",
    requireAuth,
    requirePermission(...MANAGE),
    async (_req, res) => {
      try {
        const result = await runSimulationCycle(true);
        if (!result.ran) {
          return res
            .status(409)
            .json({ message: "دورة محاكاة قيد التنفيذ حالياً، حاول بعد قليل" });
        }
        res.json({
          message: `تم تشغيل المحاكاة الآن على ${result.bots} مستخدم نظام`,
          bots: result.bots,
        });
      } catch (error) {
        console.error("Error running simulation now:", error);
        res.status(500).json({ message: "خطأ في تشغيل المحاكاة" });
      }
    },
  );

  // ============================================================
  // Knowledge Base (قاعدة المعرفة)
  // ============================================================

  // GET قائمة المقالات
  app.get(
    "/api/system-users/knowledge",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const systemUserIdRaw = req.query.system_user_id;
        const itemType = req.query.item_type ? String(req.query.item_type) : undefined;
        const search = String(req.query.search || "").trim();

        const conditions: any[] = [];
        if (systemUserIdRaw !== undefined) {
          const sid = systemUserIdRaw === "" || systemUserIdRaw === "null"
            ? null
            : parseInt(String(systemUserIdRaw));
          if (sid === null) {
            conditions.push(isNull(customer_service_knowledge.system_user_id));
          } else if (!isNaN(sid)) {
            conditions.push(eq(customer_service_knowledge.system_user_id, sid));
          }
        }
        if (itemType && ["knowledge", "instruction", "command"].includes(itemType)) {
          conditions.push(eq(customer_service_knowledge.item_type, itemType));
        }
        if (search) {
          const pattern = `%${search.replace(/[%_\\]/g, "\\$&")}%`;
          conditions.push(
            or(
              sql`${customer_service_knowledge.title} ILIKE ${pattern}`,
              sql`${customer_service_knowledge.content} ILIKE ${pattern}`,
            ),
          );
        }

        const q = db
          .select()
          .from(customer_service_knowledge)
          .orderBy(
            customer_service_knowledge.priority,
            desc(customer_service_knowledge.updated_at),
          );
        const rows = await (conditions.length > 0
          ? q.where(and(...conditions))
          : q);

        res.json({ data: rows, total: rows.length });
      } catch (error) {
        console.error("Error fetching system user knowledge:", error);
        res.status(500).json({ message: "خطأ في جلب قاعدة المعرفة" });
      }
    },
  );

  // POST إنشاء مقال
  app.post(
    "/api/system-users/knowledge",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const parsed = systemUserKnowledgeSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات المقال غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const d = parsed.data;
        // التحقق من أن system_user_id يخص مستخدم نظام فعلي
        if (d.system_user_id) {
          const [u] = await db
            .select({ id: users.id, is_system_user: users.is_system_user })
            .from(users)
            .where(eq(users.id, d.system_user_id));
          if (!u || !u.is_system_user) {
            return res.status(400).json({ message: "المستخدم الآلي المحدد غير موجود" });
          }
        }

        const row = await db.transaction(async (tx) => {
          const [newRow] = await tx
            .insert(customer_service_knowledge)
            .values({
              title: d.title,
              content: d.content,
              category: d.category ?? null,
              tags: d.tags ?? null,
              is_published: d.is_published ?? true,
              system_user_id: d.system_user_id ?? null,
              item_type: d.item_type ?? "knowledge",
              priority: d.priority ?? 100,
              created_by: actorId(req),
            })
            .returning();
          await logActivity(tx, {
            system_user_id: d.system_user_id ?? null,
            actor_id: actorId(req),
            action: "create_knowledge",
            details: { title: d.title, item_type: d.item_type },
          });
          return newRow;
        });
        res.status(201).json(row);
      } catch (error) {
        console.error("Error creating knowledge article:", error);
        res.status(500).json({ message: "خطأ في إنشاء المقال" });
      }
    },
  );

  // PUT تحديث مقال
  app.put(
    "/api/system-users/knowledge/:id",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ message: "معرف المقال غير صحيح" });
        }
        const parsed = systemUserKnowledgeSchema.partial().safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات المقال غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const d = parsed.data;
        if (Object.keys(d).length === 0) {
          return res.status(400).json({ message: "لا توجد تغييرات" });
        }
        if (
          Object.prototype.hasOwnProperty.call(d, "system_user_id") &&
          d.system_user_id !== null &&
          d.system_user_id !== undefined
        ) {
          const [targetUser] = await db
            .select({ id: users.id, is_system_user: users.is_system_user })
            .from(users)
            .where(eq(users.id, d.system_user_id));
          if (!targetUser?.is_system_user) {
            return res
              .status(400)
              .json({ message: "المستخدم الآلي المحدد غير موجود" });
          }
        }
        const updates: Record<string, any> = { ...d, updated_at: new Date() };

        const row = await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(customer_service_knowledge)
            .set(updates)
            .where(eq(customer_service_knowledge.id, id))
            .returning();
          if (!updated) return null;
          await logActivity(tx, {
            system_user_id: updated.system_user_id ?? null,
            actor_id: actorId(req),
            action: "update_knowledge",
            details: { id, changed_fields: Object.keys(d) },
          });
          return updated;
        });

        if (!row) {
          return res.status(404).json({ message: "المقال غير موجود" });
        }
        res.json(row);
      } catch (error) {
        console.error("Error updating knowledge article:", error);
        res.status(500).json({ message: "خطأ في تحديث المقال" });
      }
    },
  );

  // DELETE حذف مقال
  app.delete(
    "/api/system-users/knowledge/:id",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({ message: "معرف المقال غير صحيح" });
        }
        const row = await db.transaction(async (tx) => {
          const [deleted] = await tx
            .delete(customer_service_knowledge)
            .where(eq(customer_service_knowledge.id, id))
            .returning();
          if (!deleted) return null;
          await logActivity(tx, {
            system_user_id: deleted.system_user_id ?? null,
            actor_id: actorId(req),
            action: "delete_knowledge",
            details: { id, title: deleted.title },
          });
          return deleted;
        });
        if (!row) {
          return res.status(404).json({ message: "المقال غير موجود" });
        }
        res.json({ message: "تم حذف المقال" });
      } catch (error) {
        console.error("Error deleting knowledge article:", error);
        res.status(500).json({ message: "خطأ في حذف المقال" });
      }
    },
  );

  // ============================================================
  // Data Access (صلاحيات الوصول للبيانات)
  // ============================================================

  // GET قائمة صلاحيات المستخدم الآلي
  app.get(
    "/api/system-users/:userId/data-access",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const [target] = await db
          .select({ id: users.id, is_system_user: users.is_system_user })
          .from(users)
          .where(eq(users.id, userId));
        if (!target || !target.is_system_user) {
          return res.status(404).json({ message: "المستخدم غير موجود أو ليس مستخدم نظام" });
        }
        const rows = await db
          .select()
          .from(system_user_data_access)
          .where(eq(system_user_data_access.user_id, userId))
          .orderBy(system_user_data_access.access_kind, system_user_data_access.access_key);

        const sources = rows.filter((r) => r.access_kind === "source").map((r) => r.access_key);
        const tables = rows.filter((r) => r.access_kind === "table").map((r) => r.access_key);

        res.json({
          sources,
          tables,
          available_sources: Object.entries(DATA_SOURCES).map(([k, v]) => ({
            key: k,
            label: v.label,
          })),
          available_tables: isAdmin(req) ? ADVANCED_TABLES : [],
        });
      } catch (error) {
        console.error("Error fetching data access:", error);
        res.status(500).json({ message: "خطأ في جلب صلاحيات البيانات" });
      }
    },
  );

  // PUT استبدال صلاحيات المستخدم الآلي ذرياً
  app.put(
    "/api/system-users/:userId/data-access",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const [target] = await db
          .select({ id: users.id, is_system_user: users.is_system_user })
          .from(users)
          .where(eq(users.id, userId));
        if (!target || !target.is_system_user) {
          return res.status(404).json({ message: "المستخدم غير موجود أو ليس مستخدم نظام" });
        }

        const { sources = [], tables = [] } = req.body ?? {};
        if (!Array.isArray(sources) || !Array.isArray(tables)) {
          return res.status(400).json({ message: "sources وtables يجب أن تكون مصفوفات" });
        }

        // التحقق من صحة المصادر
        const invalidSources = sources.filter(
          (source: unknown) =>
            typeof source !== "string" ||
            !isValidSystemUserSource(source),
        );
        if (invalidSources.length > 0) {
          return res.status(400).json({
            message: "مصادر غير مصرح بها",
            invalid: invalidSources,
          });
        }

        const invalidTables = tables.filter(
          (table: unknown) =>
            typeof table !== "string" ||
            !isValidAdvancedSystemUserTable(table),
        );
        if (invalidTables.length > 0) {
          return res.status(400).json({
            message: "جداول غير مصرح بها",
            invalid: invalidTables,
          });
        }

        const actor = actorId(req);
        let effectiveTables: string[] = [];
        const uniqueSources = [...new Set(sources as string[])];
        await db.transaction(async (tx) => {
          const previousRows = await tx
            .select({
              access_kind: system_user_data_access.access_kind,
              access_key: system_user_data_access.access_key,
            })
            .from(system_user_data_access)
            .where(eq(system_user_data_access.user_id, userId));
          const previousSources = previousRows
            .filter((row) => row.access_kind === "source")
            .map((row) => row.access_key);
          const previousTables = previousRows
            .filter((row) => row.access_kind === "table")
            .map((row) => row.access_key);
          // المدير فقط يستطيع تغيير منح الجداول المتقدمة. بقية المدراء
          // يستطيعون تعديل المصادر مع إبقاء المنح المتقدمة كما هي.
          effectiveTables = isAdmin(req)
            ? [...new Set(tables as string[])]
            : previousTables;

          // حذف الصلاحيات القديمة
          await tx
            .delete(system_user_data_access)
            .where(eq(system_user_data_access.user_id, userId));

          // إدراج الصلاحيات الجديدة
          const rows = [
            ...uniqueSources.map((key) => ({
              user_id: userId,
              access_kind: "source" as const,
              access_key: key,
              created_by: actor,
            })),
            ...effectiveTables.map((key) => ({
              user_id: userId,
              access_kind: "table" as const,
              access_key: key,
              created_by: actor,
            })),
          ];
          if (rows.length > 0) {
            await tx
              .insert(system_user_data_access)
              .values(rows)
              .onConflictDoNothing();
          }
          await logActivity(tx, {
            system_user_id: userId,
            actor_id: actor,
            action: "update_data_access",
            details: {
              before: {
                sources: previousSources,
                tables: previousTables,
              },
              after: {
                sources: uniqueSources,
                tables: effectiveTables,
              },
            },
          });
        });
        resetSystemUserDataContext(userId);

        res.json({
          sources: uniqueSources,
          tables: effectiveTables,
          message: "تم تحديث صلاحيات البيانات",
        });
      } catch (error) {
        console.error("Error updating data access:", error);
        res.status(500).json({ message: "خطأ في تحديث صلاحيات البيانات" });
      }
    },
  );

  // ============================================================
  // Historical Attendance (الحضور التاريخي)
  // ============================================================

  const MAX_HISTORY_DAYS = 366;

  function parseHistoryDates(body: any): {
    start: string;
    end: string;
    error?: string;
  } {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const defaultEnd = yesterday.toISOString().slice(0, 10);

    const start = body?.start_date ? String(body.start_date) : null;
    const end = body?.end_date ? String(body.end_date) : defaultEnd;

    if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
      return { start: "", end: "", error: "start_date مطلوب بصيغة YYYY-MM-DD" };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return { start: "", end: "", error: "end_date يجب أن يكون بصيغة YYYY-MM-DD" };
    }
    const startD = new Date(`${start}T00:00:00Z`);
    const endD = new Date(`${end}T00:00:00Z`);
    if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
      return { start: "", end: "", error: "تواريخ غير صالحة" };
    }
    if (endD < startD) {
      return { start: "", end: "", error: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية" };
    }
    const diffDays = Math.round((endD.getTime() - startD.getTime()) / 86400000) + 1;
    if (diffDays > MAX_HISTORY_DAYS) {
      return {
        start: "",
        end: "",
        error: `النطاق يتجاوز ${MAX_HISTORY_DAYS} يوماً؛ استخدم نطاقات متتالية`,
      };
    }
    // لا يسمح بتواريخ مستقبلية
    const todayStr = today.toISOString().slice(0, 10);
    if (end > todayStr) {
      return { start: "", end: "", error: "تاريخ النهاية يجب أن يكون في الماضي" };
    }
    return { start, end };
  }

  // معاينة الحضور التاريخي (بدون كتابة)
  app.post(
    "/api/system-users/:userId/attendance/history/preview",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const [target] = await db
          .select({ id: users.id, is_system_user: users.is_system_user })
          .from(users)
          .where(eq(users.id, userId));
        if (!target || !target.is_system_user) {
          return res.status(404).json({ message: "المستخدم غير موجود أو ليس مستخدم نظام" });
        }

        const { start, end, error } = parseHistoryDates(req.body);
        if (error) return res.status(400).json({ message: error });

        const [settings] = await db
          .select()
          .from(system_user_settings)
          .where(eq(system_user_settings.user_id, userId));
        if (!settings) {
          return res.status(400).json({ message: "لم تُضبط إعدادات الوردية لهذا المستخدم الآلي" });
        }

        const { getShiftWindow } = await import("@shared/shifts");
        const preview = await computeHistoryPreview({
          userId,
          start,
          end,
          settings,
          getShiftWindow,
        });

        res.json(preview);
      } catch (error) {
        console.error("Error previewing attendance history:", error);
        res.status(500).json({ message: "خطأ في معاينة الحضور التاريخي" });
      }
    },
  );

  // إنشاء الحضور التاريخي (يتطلب admin)
  app.post(
    "/api/system-users/:userId/attendance/history/generate",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const [target] = await db
          .select({ id: users.id, is_system_user: users.is_system_user })
          .from(users)
          .where(eq(users.id, userId));
        if (!target || !target.is_system_user) {
          return res.status(404).json({ message: "المستخدم غير موجود أو ليس مستخدم نظام" });
        }

        const { start, end, error } = parseHistoryDates(req.body);
        if (error) return res.status(400).json({ message: error });

        const [settings] = await db
          .select()
          .from(system_user_settings)
          .where(eq(system_user_settings.user_id, userId));
        if (!settings) {
          return res.status(400).json({ message: "لم تُضبط إعدادات الوردية لهذا المستخدم الآلي" });
        }

        const { getShiftWindow, isShiftType } = await import("@shared/shifts");
        const { attendance } = await import("@shared/schema");

        // قفل عملية التوليد على المستخدم الآلي (advisory lock)
        const { pool } = await import("../db");
        const lockClient = await pool.connect();
        try {
          const lockKey = 30000 + userId; // مفتاح قفل خاص بكل مستخدم
          const lockRes = await lockClient.query(
            `SELECT pg_try_advisory_lock(${lockKey}) AS locked`,
          );
          if (!lockRes.rows?.[0]?.locked) {
            return res.status(409).json({
              message: "عملية توليد تاريخية جارية لهذا المستخدم، حاول بعد قليل",
            });
          }
          try {
            const result = await db.transaction(async (tx) => {
              const generated = await generateHistoricalAttendance({
                userId,
                start,
                end,
                settings,
                actorId: actorId(req),
                getShiftWindow,
                isShiftType,
                attendance,
                dbClient: tx,
              });
              await logActivity(tx, {
                system_user_id: userId,
                actor_id: actorId(req),
                action: "generate_history",
                details: {
                  start_date: start,
                  end_date: end,
                  created: generated.created,
                  skipped_existing: generated.skipped_existing,
                  absent: generated.absent,
                },
              });
              return generated;
            });

            res.json(result);
          } finally {
            await lockClient
              .query(`SELECT pg_advisory_unlock(${lockKey})`)
              .catch(() => {});
          }
        } finally {
          lockClient.release();
        }
      } catch (error) {
        console.error("Error generating attendance history:", error);
        res.status(500).json({ message: "خطأ في توليد الحضور التاريخي" });
      }
    },
  );

  // ============================================================
  // Activity Log (سجل النشاط)
  // ============================================================

  app.get(
    "/api/system-users/:userId/activity",
    requireAuth,
    requirePermission(...MANAGE),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        const limit = Math.min(parseInt(String(req.query.limit || "100")), 100);
        const cursor = req.query.cursor ? parseInt(String(req.query.cursor)) : null;

        const conditions: any[] = [eq(system_user_activity.system_user_id, userId)];
        if (cursor && !isNaN(cursor)) {
          conditions.push(lt(system_user_activity.id, cursor));
        }

        const rows = await db
          .select({
            id: system_user_activity.id,
            actor_id: system_user_activity.actor_id,
            action: system_user_activity.action,
            details: system_user_activity.details,
            created_at: system_user_activity.created_at,
            actor_name: sql<string | null>`(SELECT COALESCE(display_name_ar, display_name, username) FROM users WHERE users.id = ${system_user_activity.actor_id})`,
          })
          .from(system_user_activity)
          .where(and(...conditions))
          .orderBy(desc(system_user_activity.id))
          .limit(limit);

        const nextCursor = rows.length === limit ? rows[rows.length - 1]?.id : null;
        res.json({ data: rows, next_cursor: nextCursor });
      } catch (error) {
        console.error("Error fetching activity log:", error);
        res.status(500).json({ message: "خطأ في جلب سجل النشاط" });
      }
    },
  );
}

// ── دوال مساعدة للحضور التاريخي ──

function parseAllowedDaysFromSettings(raw: string | null | undefined): number[] {
  try {
    const arr = JSON.parse(raw || "[]");
    if (Array.isArray(arr)) return arr.filter((n: any) => Number.isInteger(n));
  } catch {}
  return [0, 1, 2, 3, 4];
}

function weekdayOfDate(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function chance(pct: number): boolean {
  return Math.random() * 100 < Math.max(0, Math.min(100, pct));
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function addMinutes(d: Date, m: number): Date {
  return new Date(d.getTime() + m * 60000);
}

/** يُعدّد كل الأيام من start إلى end شاملاً */
function* eachDay(start: string, end: string): Generator<string> {
  let current = start;
  while (current <= end) {
    yield current;
    current = addDays(current, 1);
  }
}

async function computeHistoryPreview(opts: {
  userId: number;
  start: string;
  end: string;
  settings: any;
  getShiftWindow: any;
}): Promise<{
  eligible_days: number;
  would_create: number;
  existing_days: number;
  simulated_absent_days: number;
}> {
  const { userId, start, end, settings, getShiftWindow } = opts;
  const allowedDays = parseAllowedDaysFromSettings(settings.allowed_days);
  const startDate = settings.attendance_start_date
    ? String(settings.attendance_start_date)
    : null;

  let eligible_days = 0;
  let simulated_absent_days = 0;
  const eligibleDates: string[] = [];

  for (const day of eachDay(start, end)) {
    if (startDate && day < startDate) continue;
    const wd = weekdayOfDate(day);
    if (!allowedDays.includes(wd)) continue;
    eligible_days++;
    if (chance(settings.absence_pct)) {
      simulated_absent_days++;
    } else {
      eligibleDates.push(day);
    }
  }

  // جلب الأيام الموجودة
  let existing_days = 0;
  if (eligibleDates.length > 0) {
    const { attendance } = await import("@shared/schema");
    const { eq, and, inArray } = await import("drizzle-orm");
    const existingRows = await db
      .select({ date: attendance.date })
      .from(attendance)
      .where(
        and(
          eq(attendance.user_id, userId),
          inArray(attendance.date, eligibleDates),
        ),
      );
    existing_days = new Set(existingRows.map((r) => String(r.date))).size;
  }

  const would_create = Math.max(0, eligibleDates.length - existing_days);
  return { eligible_days, would_create, existing_days, simulated_absent_days };
}

async function generateHistoricalAttendance(opts: {
  userId: number;
  start: string;
  end: string;
  settings: any;
  actorId: number;
  getShiftWindow: any;
  isShiftType: any;
  attendance: any;
  dbClient?: any;
}): Promise<{
  created: number;
  skipped_existing: number;
  absent: number;
  start_date: string;
  end_date: string;
}> {
  const {
    userId,
    start,
    end,
    settings,
    actorId,
    getShiftWindow,
    isShiftType,
    attendance,
    dbClient = db,
  } = opts;
  const { eq, and, inArray } = await import("drizzle-orm");

  const allowedDays = parseAllowedDaysFromSettings(settings.allowed_days);
  const startDate = settings.attendance_start_date
    ? String(settings.attendance_start_date)
    : null;
  const shift = isShiftType(settings.shift) ? settings.shift : "day";
  const shiftTypeAr = shift === "day" ? "صباحي" : "ليلي";

  // جمع كل الأيام المؤهلة (قبل تحديد الغياب)
  const candidateDates: string[] = [];
  const absentDates = new Set<string>();

  for (const day of eachDay(start, end)) {
    if (startDate && day < startDate) continue;
    const wd = weekdayOfDate(day);
    if (!allowedDays.includes(wd)) continue;
    if (chance(settings.absence_pct)) {
      absentDates.add(day);
    } else {
      candidateDates.push(day);
    }
  }

  // جلب الأيام الموجودة
  let existingDates = new Set<string>();
  if (candidateDates.length > 0) {
    const existingRows = await dbClient
      .select({ date: attendance.date })
      .from(attendance)
      .where(
        and(
          eq(attendance.user_id, userId),
          inArray(attendance.date, candidateDates),
        ),
      );
    existingDates = new Set(existingRows.map((r: any) => String(r.date)));
  }

  const toCreate = candidateDates.filter((d) => !existingDates.has(d));
  let created = 0;

  // إدراج سجلات الحضور على دفعات
  for (const day of toCreate) {
    const { start: shiftStart, end: shiftEnd } = getShiftWindow(shift, day);
    const late = chance(settings.late_pct);
    const early = chance(settings.early_leave_pct);

      const checkInAt = late
        ? addMinutes(shiftStart, Math.round(rand(5, Math.max(6, settings.late_max_minutes))))
        : addMinutes(shiftStart, Math.round(rand(-12, 4)));
      const checkOutAt = early
        ? addMinutes(shiftEnd, -Math.round(rand(5, Math.max(6, settings.early_leave_max_minutes))))
        : addMinutes(shiftEnd, Math.round(rand(-2, 10)));

      const lateMinutes = Math.max(
        0,
        Math.round((checkInAt.getTime() - shiftStart.getTime()) / 60000),
      );
      const earlyLeaveMinutes = Math.max(
        0,
        Math.round((shiftEnd.getTime() - checkOutAt.getTime()) / 60000),
      );
      const workHours = Math.max(
        0,
        Math.round(((checkOutAt.getTime() - checkInAt.getTime()) / 3600000) * 10) / 10,
      );

    const inserted = await dbClient
      .insert(attendance)
      .values({
        user_id: userId,
        status: "حاضر",
        check_in_time: checkInAt,
        check_out_time: checkOutAt,
        shift_type: shiftTypeAr,
        late_minutes: lateMinutes,
        early_leave_minutes: earlyLeaveMinutes,
        work_hours: Math.min(workHours, 8),
        date: day,
        created_by: actorId,
        notes: "مستخدم نظام (محاكاة تاريخية)",
      })
      .onConflictDoNothing()
      .returning({ id: attendance.id });
    created += inserted.length;
  }

  return {
    created,
    skipped_existing: existingDates.size,
    absent: absentDates.size,
    start_date: start,
    end_date: end,
  };
}
