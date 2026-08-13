// ✉️ مسارات المراسلات الداخلية (بريد داخلي بين مستخدمي النظام)
import type { Express } from "express";
import { z } from "zod";
import { db } from "../db";
import { internal_messages, users } from "@shared/schema";
import { and, desc, eq, isNull, or, sql, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  requireAuth,
  requireAdmin,
  requirePermission,
  type AuthRequest,
} from "../middleware/auth";
import { hasPermission } from "@shared/permissions";
import { notificationManagerHolder } from "./shared";
import { getNotificationManager } from "../services/notification-manager";
import { storage } from "../storage";

// الفئات الإدارية تتطلب صلاحية إدارية؛ "عامة" متاحة للجميع
const OFFICIAL_CATEGORIES = [
  "تكليف عمل",
  "إشعار خصم",
  "إنذار",
  "توكيل مهام",
] as const;
const ALL_CATEGORIES = ["عامة", ...OFFICIAL_CATEGORIES] as const;

const createMessageSchema = z
  .object({
    recipient_id: z.number().int().positive().optional(),
    subject: z.string().min(1).max(200).optional(),
    body: z.string().max(10000).optional().nullable(),
    category: z.enum(ALL_CATEGORIES).optional(),
    parent_id: z.number().int().positive().optional().nullable(),
  })
  .strict();

function authUserId(req: any): number | null {
  return (req as AuthRequest).user?.id ?? null;
}

function canSendOfficial(req: any): boolean {
  const perms = (req as AuthRequest).user?.permissions || [];
  if (perms.includes("admin")) return true;
  return (["manage_hr", "edit_hr", "manage_users"] as const).some((p) =>
    hasPermission(perms, p as any),
  );
}

export async function registerMessagesRoutes(app: Express, _ctx: any) {
  // قائمة الرسائل الخاصة بالمستخدم (وارد + صادر)
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const uid = authUserId(req)!;
      const senderUsers = alias(users, "msg_sender");
      const recipientUsers = alias(users, "msg_recipient");
      const rows = await db
        .select({
          id: internal_messages.id,
          sender_id: internal_messages.sender_id,
          recipient_id: internal_messages.recipient_id,
          subject: internal_messages.subject,
          body: internal_messages.body,
          category: internal_messages.category,
          parent_id: internal_messages.parent_id,
          root_id: internal_messages.root_id,
          read_at: internal_messages.read_at,
          created_at: internal_messages.created_at,
          sender_name: senderUsers.display_name_ar,
          sender_name_en: senderUsers.display_name,
          recipient_name: recipientUsers.display_name_ar,
          recipient_name_en: recipientUsers.display_name,
        })
        .from(internal_messages)
        .leftJoin(senderUsers, eq(internal_messages.sender_id, senderUsers.id))
        .leftJoin(
          recipientUsers,
          eq(internal_messages.recipient_id, recipientUsers.id),
        )
        .where(
          or(
            and(
              eq(internal_messages.recipient_id, uid),
              eq(internal_messages.recipient_deleted, false),
            ),
            and(
              eq(internal_messages.sender_id, uid),
              eq(internal_messages.sender_deleted, false),
            ),
          ),
        )
        .orderBy(desc(internal_messages.created_at));
      res.json(rows);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "خطأ في جلب الرسائل" });
    }
  });

  // سجل المراسلات العام (للمدير فقط): جميع الرسائل بين كل المستخدمين
  app.get(
    "/api/messages/all",
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        const limit = Math.min(
          Math.max(parseInt(String(req.query.limit)) || 50, 1),
          200,
        );
        const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
        const search = String(req.query.search || "").trim();
        const senderId = parseInt(String(req.query.sender_id)) || 0;
        const recipientId = parseInt(String(req.query.recipient_id)) || 0;
        const category = String(req.query.category || "").trim();

        const conditions = [] as any[];
        if (search) {
          const pattern = `%${search.replace(/[%_\\]/g, "\\$&")}%`;
          conditions.push(
            or(
              sql`${internal_messages.subject} ILIKE ${pattern}`,
              sql`${internal_messages.body} ILIKE ${pattern}`,
            ),
          );
        }
        if (senderId > 0)
          conditions.push(eq(internal_messages.sender_id, senderId));
        if (recipientId > 0)
          conditions.push(eq(internal_messages.recipient_id, recipientId));
        if (category && (ALL_CATEGORIES as readonly string[]).includes(category))
          conditions.push(eq(internal_messages.category, category));
        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;

        const senderUsers = alias(users, "msg_sender");
        const recipientUsers = alias(users, "msg_recipient");
        const baseQuery = db
          .select({
            id: internal_messages.id,
            sender_id: internal_messages.sender_id,
            recipient_id: internal_messages.recipient_id,
            subject: internal_messages.subject,
            body: internal_messages.body,
            category: internal_messages.category,
            parent_id: internal_messages.parent_id,
            root_id: internal_messages.root_id,
            read_at: internal_messages.read_at,
            created_at: internal_messages.created_at,
            sender_deleted: internal_messages.sender_deleted,
            recipient_deleted: internal_messages.recipient_deleted,
            sender_name: senderUsers.display_name_ar,
            sender_name_en: senderUsers.display_name,
            recipient_name: recipientUsers.display_name_ar,
            recipient_name_en: recipientUsers.display_name,
          })
          .from(internal_messages)
          .leftJoin(
            senderUsers,
            eq(internal_messages.sender_id, senderUsers.id),
          )
          .leftJoin(
            recipientUsers,
            eq(internal_messages.recipient_id, recipientUsers.id),
          );
        const rows = await (whereClause
          ? baseQuery.where(whereClause)
          : baseQuery)
          .orderBy(desc(internal_messages.created_at), desc(internal_messages.id))
          .limit(limit)
          .offset(offset);

        const countQuery = db
          .select({ count: sql<number>`count(*)::int` })
          .from(internal_messages);
        const [totalRow] = await (whereClause
          ? countQuery.where(whereClause)
          : countQuery);

        res.json({
          messages: rows,
          total: totalRow?.count ?? 0,
          limit,
          offset,
        });
      } catch (error) {
        console.error("Error fetching all messages log:", error);
        res.status(500).json({ message: "خطأ في جلب سجل المراسلات العام" });
      }
    },
  );

  // عدد الرسائل غير المقروءة
  app.get("/api/messages/unread-count", requireAuth, async (req, res) => {
    try {
      const uid = authUserId(req)!;
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(internal_messages)
        .where(
          and(
            eq(internal_messages.recipient_id, uid),
            eq(internal_messages.recipient_deleted, false),
            isNull(internal_messages.read_at),
          ),
        );
      res.json({ count: row?.count ?? 0 });
    } catch (error) {
      console.error("Error counting unread messages:", error);
      res.status(500).json({ message: "خطأ في جلب عدد الرسائل" });
    }
  });

  // إرسال رسالة جديدة أو رد على رسالة
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const uid = authUserId(req)!;
      const parsed = createMessageSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({
          message: "بيانات الرسالة غير صحيحة",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const data = parsed.data;

      let recipientId: number;
      let category: string;
      let subject: string;
      let rootId: number | null = null;
      let parentId: number | null = null;

      if (data.parent_id) {
        // رد على رسالة: يجب أن يكون المستخدم طرفاً فيها
        const [parent] = await db
          .select()
          .from(internal_messages)
          .where(eq(internal_messages.id, data.parent_id));
        if (!parent) {
          return res.status(404).json({ message: "الرسالة الأصلية غير موجودة" });
        }
        if (parent.sender_id !== uid && parent.recipient_id !== uid) {
          return res.status(403).json({ message: "لا يمكنك الرد على هذه الرسالة" });
        }
        recipientId =
          parent.sender_id === uid ? parent.recipient_id : parent.sender_id;
        // الرد يرث التصنيف الإداري فقط إذا كان المرسل مخولاً؛ غير ذلك يُسجل كرد عام
        category =
          (OFFICIAL_CATEGORIES as readonly string[]).includes(
            parent.category,
          ) && !canSendOfficial(req)
            ? "عامة"
            : parent.category;
        subject =
          data.subject?.trim() ||
          (parent.subject.startsWith("رد:")
            ? parent.subject
            : `رد: ${parent.subject}`);
        parentId = parent.id;
        rootId = parent.root_id ?? parent.id;
        if (!data.body?.trim()) {
          return res.status(400).json({ message: "نص الرد مطلوب" });
        }
      } else {
        // رسالة جديدة
        if (!data.recipient_id) {
          return res.status(400).json({ message: "المستلم مطلوب" });
        }
        if (!data.subject?.trim()) {
          return res.status(400).json({ message: "موضوع الرسالة مطلوب" });
        }
        if (data.recipient_id === uid) {
          return res.status(400).json({ message: "لا يمكن إرسال رسالة لنفسك" });
        }
        const [recipient] = await db
          .select({ id: users.id, status: users.status })
          .from(users)
          .where(eq(users.id, data.recipient_id));
        if (!recipient || recipient.status === "deleted") {
          return res.status(404).json({ message: "المستلم غير موجود" });
        }
        category = data.category || "عامة";
        if (
          (OFFICIAL_CATEGORIES as readonly string[]).includes(category) &&
          !canSendOfficial(req)
        ) {
          return res.status(403).json({
            message: "ليس لديك صلاحية إرسال هذا النوع من الرسائل الإدارية",
          });
        }
        recipientId = data.recipient_id;
        subject = data.subject.trim();
      }

      const [message] = await db
        .insert(internal_messages)
        .values({
          sender_id: uid,
          recipient_id: recipientId,
          subject,
          body: data.body?.trim() || null,
          category,
          parent_id: parentId,
          root_id: rootId,
        })
        .returning();

      // إشعار المستلم داخل النظام (لا يوقف الإرسال عند الفشل)
      try {
        const senderName =
          (req as AuthRequest).user?.name || "مستخدم";
        if (!notificationManagerHolder.value) {
          notificationManagerHolder.value = getNotificationManager(storage);
        }
        await notificationManagerHolder.value.sendToUser(recipientId, {
          title: `New message: ${subject}`,
          title_ar: `رسالة جديدة: ${subject}`,
          message: `You received a "${category}" message from ${senderName}`,
          message_ar: `وصلتك رسالة "${category}" من ${senderName}`,
          type: "system",
          priority: "medium",
          context_type: "internal_message",
          context_id: String(message.id),
        } as any);
      } catch (notifyErr) {
        console.error("Message notification failed:", notifyErr);
      }

      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "خطأ في إرسال الرسالة" });
    }
  });

  // تحديد رسائل كمقروءة (للمستلم فقط)
  app.patch("/api/messages/mark-read", requireAuth, async (req, res) => {
    try {
      const uid = authUserId(req)!;
      const ids = Array.isArray(req.body?.ids)
        ? req.body.ids.filter((n: any) => Number.isInteger(n) && n > 0)
        : [];
      if (ids.length === 0) {
        return res.status(400).json({ message: "قائمة الرسائل مطلوبة" });
      }
      await db
        .update(internal_messages)
        .set({ read_at: new Date() })
        .where(
          and(
            inArray(internal_messages.id, ids),
            eq(internal_messages.recipient_id, uid),
            isNull(internal_messages.read_at),
          ),
        );
      res.json({ message: "تم التحديث" });
    } catch (error) {
      console.error("Error marking messages read:", error);
      res.status(500).json({ message: "خطأ في تحديث الرسائل" });
    }
  });

  // حذف رسالة (حذف ناعم من جهة المستخدم فقط)
  app.delete("/api/messages/:id", requireAuth, async (req, res) => {
    try {
      const uid = authUserId(req)!;
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "معرف الرسالة غير صحيح" });
      }
      const [msg] = await db
        .select()
        .from(internal_messages)
        .where(eq(internal_messages.id, id));
      if (!msg || (msg.sender_id !== uid && msg.recipient_id !== uid)) {
        return res.status(404).json({ message: "الرسالة غير موجودة" });
      }
      const updates: Record<string, boolean> = {};
      if (msg.sender_id === uid) updates.sender_deleted = true;
      if (msg.recipient_id === uid) updates.recipient_deleted = true;
      await db
        .update(internal_messages)
        .set(updates)
        .where(eq(internal_messages.id, id));
      res.json({ message: "تم حذف الرسالة" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "خطأ في حذف الرسالة" });
    }
  });
}
