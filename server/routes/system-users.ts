// 🤖 مسارات إدارة مستخدمي النظام الآليين وإعدادات المحاكاة
import type { Express } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  system_user_settings,
  updateSystemUserSettingsSchema,
  users,
} from "@shared/schema";
import { requireAuth, requirePermission } from "../middleware/auth";
import {
  isSimulationEnabled,
  runSimulationCycle,
  setSimulationEnabled,
} from "../services/system-user-simulator";

const MANAGE = ["manage_users", "manage_settings", "manage_definitions"] as const;

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

  // تحديث إعدادات مستخدم آلي (upsert)
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

        const [existing] = await db
          .select({ id: system_user_settings.id })
          .from(system_user_settings)
          .where(eq(system_user_settings.user_id, userId));
        let saved;
        if (existing) {
          [saved] = await db
            .update(system_user_settings)
            .set(data)
            .where(eq(system_user_settings.user_id, userId))
            .returning();
        } else {
          [saved] = await db
            .insert(system_user_settings)
            .values({ user_id: userId, ...data })
            .returning();
        }
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
}
