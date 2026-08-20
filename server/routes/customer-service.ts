// 🛎️ مسارات مركز خدمة العملاء والمهام (Customer Service Center)
import type { Express } from "express";

import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

import {
  customers,
  customer_service_activity,
  customer_service_cases,
  customer_service_comments,
  customer_service_knowledge,
  users,
} from "@shared/schema";
import { hasPermission } from "@shared/permissions";

import { db } from "../db";
import {
  requireAuth,
  requirePermission,
  type AuthRequest,
} from "../middleware/auth";
import { getNotificationManager } from "../services/notification-manager";
import { storage } from "../storage";
import { notificationManagerHolder } from "./shared";

// ============ Constants ============

const CASE_TYPES = ["request", "complaint", "note"] as const;
const CASE_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
const CASE_STATUSES = [
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const;

// Advisory-lock key for reference generation (arbitrary stable integer for this module)
const CS_REFERENCE_LOCK_KEY = 20099;

// ============ Permission helpers ============

function authUserId(req: any): number {
  return (req as AuthRequest).user!.id;
}

function userPerms(req: any): string[] {
  return (req as AuthRequest).user?.permissions || [];
}

/**
 * مدير خدمة العملاء:
 *  - admin  (عبر middleware)
 *  - service_manage
 *  - manage_users  (bootstrap: مسؤول المستخدمين)
 *  - manage_hr     (bootstrap: مسؤول الموارد البشرية)
 */
function isServiceManager(req: any): boolean {
  const perms = userPerms(req);
  if (perms.includes("admin")) return true;
  return (
    hasPermission(perms, "service_manage") ||
    hasPermission(perms, "manage_users") ||
    hasPermission(perms, "manage_hr")
  );
}

/** من يستطيع رؤية جميع الحالات (مدراء + service_view_all) */
function canViewAll(req: any): boolean {
  const perms = userPerms(req);
  return isServiceManager(req) || hasPermission(perms, "service_view_all");
}

/** هل يستطيع المستخدم الوصول لهذه الحالة؟ */
function canAccessCase(req: any, caseRow: { requester_id: number; assignee_id: number | null }): boolean {
  if (canViewAll(req)) return true;
  const uid = authUserId(req);
  return caseRow.requester_id === uid || caseRow.assignee_id === uid;
}

/** يمكنه إدارة قاعدة المعرفة: service_manage_knowledge أو مدير */
function canManageKnowledge(req: any): boolean {
  return (
    isServiceManager(req) ||
    hasPermission(userPerms(req), "service_manage_knowledge")
  );
}

/** يمكنه رؤية التقارير: service_view_reports أو service_manage أو مدير */
function canViewReports(req: any): boolean {
  const perms = userPerms(req);
  return (
    isServiceManager(req) ||
    hasPermission(perms, "service_view_reports")
  );
}

// ============ Middleware builders ============

/**
 * READ middleware: service_view_own | service_view_all | service_manage |
 *                  manage_users | manage_hr  (+ admin via requirePermission semantics)
 */
function makeReadMiddleware() {
  return requirePermission(
    "service_view_own",
    "service_view_all",
    "service_manage",
    "manage_users",
    "manage_hr",
  );
}

/**
 * CREATE middleware: service_create | service_manage | manage_users | manage_hr
 */
function makeCreateMiddleware() {
  return requirePermission(
    "service_create",
    "service_manage",
    "manage_users",
    "manage_hr",
  );
}

/**
 * KNOWLEDGE_READ middleware
 */
function makeKnowledgeReadMiddleware() {
  return requirePermission(
    "service_view_own",
    "service_view_all",
    "service_manage",
    "service_manage_knowledge",
    "manage_users",
    "manage_hr",
  );
}

/**
 * KNOWLEDGE_WRITE middleware: service_manage_knowledge | service_manage | manage_users | manage_hr
 */
function makeKnowledgeWriteMiddleware() {
  return requirePermission(
    "service_manage_knowledge",
    "service_manage",
    "manage_users",
    "manage_hr",
  );
}

/**
 * REPORTS middleware: service_view_reports | service_manage | manage_users | manage_hr
 */
function makeReportsMiddleware() {
  return requirePermission(
    "service_view_reports",
    "service_manage",
    "manage_users",
    "manage_hr",
  );
}

// ============ Utility helpers ============

function parseId(raw: any): number | null {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

/** Parse ISO date string from query (returns Date or null) */
function parseQueryDate(raw: any): Date | null {
  if (!raw) return null;
  const d = new Date(String(raw));
  return isNaN(d.getTime()) ? null : d;
}

/** التحقق من وجود مستخدم نشط */
async function isActiveUser(userId: number): Promise<boolean> {
  const [u] = await db
    .select({ id: users.id, status: users.status })
    .from(users)
    .where(eq(users.id, userId));
  return !!u && u.status === "active";
}

/** التحقق من وجود عميل نشط */
async function isActiveCustomer(customerId: string): Promise<boolean> {
  const [c] = await db
    .select({ id: customers.id, is_active: customers.is_active })
    .from(customers)
    .where(eq(customers.id, customerId));
  return !!c && c.is_active !== false;
}

/**
 * توليد مرجع فريد للحالة بشكل آمن للتزامن.
 * يستخدم advisory transaction lock داخل معاملة لمنع التعارض.
 * الحالة والمرجع يُنشآن معاً داخل نفس المعاملة.
 * يُرجع المرجع الجديد والدالة يجب أن تُستدعى من داخل معاملة.
 */
async function generateReferenceInTx(tx: any): Promise<string> {
  // Acquire session-level advisory lock so concurrent inserts serialize here
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${CS_REFERENCE_LOCK_KEY})`);
  // Now safe to read current max — no other transaction can pass this point
  const result = await tx.execute(
    sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM customer_service_cases`,
  );
  const maxId: number = Number(result.rows?.[0]?.max_id ?? 0);
  return `CS-${String(maxId + 1).padStart(6, "0")}`;
}

/**
 * تسجيل نشاط على الحالة داخل معاملة موجودة (يُلقي الخطأ — لا يبتلعه).
 * استخدم هذه الدالة داخل db.transaction() حتى يُلغى الـ rollback بالكامل
 * عند الفشل.
 */
async function recordActivityTx(
  tx: any,
  caseId: number,
  actorId: number,
  action: "create" | "update" | "reassign" | "status" | "comment",
  details?: Record<string, any>,
): Promise<void> {
  await tx.insert(customer_service_activity).values({
    case_id: caseId,
    actor_id: actorId,
    action,
    details: details ?? null,
  });
}

/**
 * إرسال إشعار push داخل النظام لمستخدم.
 * النوع دائماً "push" وليس "system".
 */
async function notifyUser(
  userId: number,
  titleAr: string,
  messageAr: string,
  caseId: number,
  priority: "normal" | "high" = "normal",
): Promise<void> {
  try {
    if (!userId) return;
    if (!notificationManagerHolder.value) {
      notificationManagerHolder.value = getNotificationManager(storage);
    }
    await notificationManagerHolder.value.sendToUser(userId, {
      title: titleAr,
      title_ar: titleAr,
      message: messageAr,
      message_ar: messageAr,
      type: "push",
      priority,
      icon: "🛎️",
      context_type: "customer_service_case",
      context_id: String(caseId),
    } as any);
  } catch (err) {
    console.error("CS notification failed:", err);
  }
}

// ============ Shared join helper ============

/** صف حالة مُعزَّز مع أسماء المرتبطين */
interface EnrichedCaseRow {
  id: number;
  reference: string;
  type: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  requester_id: number;
  customer_id: string | null;
  assignee_id: number | null;
  due_date: Date | null;
  resolved_at: Date | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  requester_name: string | null;
  assignee_name: string | null;
  customer_name: string | null;
}

function buildCasesBaseQuery() {
  const requesterUsers = alias(users, "cs_requester");
  const assigneeUsers = alias(users, "cs_assignee");
  return {
    requesterUsers,
    assigneeUsers,
    query: db
      .select({
        id: customer_service_cases.id,
        reference: customer_service_cases.reference,
        type: customer_service_cases.type,
        title: customer_service_cases.title,
        description: customer_service_cases.description,
        priority: customer_service_cases.priority,
        status: customer_service_cases.status,
        requester_id: customer_service_cases.requester_id,
        customer_id: customer_service_cases.customer_id,
        assignee_id: customer_service_cases.assignee_id,
        due_date: customer_service_cases.due_date,
        resolved_at: customer_service_cases.resolved_at,
        closed_at: customer_service_cases.closed_at,
        created_at: customer_service_cases.created_at,
        updated_at: customer_service_cases.updated_at,
        requester_name: sql<string | null>`COALESCE(
          ${requesterUsers.display_name_ar},
          ${requesterUsers.display_name},
          ${requesterUsers.full_name},
          ${requesterUsers.username}
        )`,
        assignee_name: sql<string | null>`COALESCE(
          ${assigneeUsers.display_name_ar},
          ${assigneeUsers.display_name},
          ${assigneeUsers.full_name},
          ${assigneeUsers.username}
        )`,
        customer_name: sql<string | null>`COALESCE(
          ${customers.name_ar},
          ${customers.name}
        )`,
      })
      .from(customer_service_cases)
      .leftJoin(
        requesterUsers,
        eq(customer_service_cases.requester_id, requesterUsers.id),
      )
      .leftJoin(
        assigneeUsers,
        eq(customer_service_cases.assignee_id, assigneeUsers.id),
      )
      .leftJoin(
        customers,
        eq(customer_service_cases.customer_id, customers.id),
      ),
  };
}

// ============ Zod Schemas ============

const createCaseSchema = z
  .object({
    type: z.enum(CASE_TYPES).optional().default("request"),
    title: z.string().trim().min(1).max(200),
    description: z.string().max(10000).optional().nullable(),
    priority: z.enum(CASE_PRIORITIES).optional().default("normal"),
    customer_id: z.string().trim().min(1).max(20).optional().nullable(),
    // creators may propose an assignee — but only managers may actually set one
    assignee_id: z.number().int().positive().optional().nullable(),
    due_date: z.coerce.date().optional().nullable(),
  })
  .strict();

const updateCaseSchema = z
  .object({
    type: z.enum(CASE_TYPES).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(10000).optional().nullable(),
    priority: z.enum(CASE_PRIORITIES).optional(),
    status: z.enum(CASE_STATUSES).optional(),
    customer_id: z.string().trim().min(1).max(20).optional().nullable(),
    assignee_id: z.number().int().positive().optional().nullable(),
    due_date: z.coerce.date().optional().nullable(),
  })
  .strict();

const createCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(10000),
    is_internal: z.boolean().optional().default(false),
  })
  .strict();

const knowledgeSchema = z
  .object({
    title: z.string().trim().min(1).max(300),
    content: z.string().trim().min(1),
    category: z.string().trim().max(100).optional().nullable(),
    tags: z
      .array(z.string().trim().min(1).max(50))
      .max(20)
      .optional()
      .nullable(),
    is_published: z.boolean().optional().default(true),
  })
  .strict();

// ============ Route Registration ============

export async function registerCustomerServiceRoutes(app: Express, _ctx: any) {
  const READ = makeReadMiddleware();
  const CREATE = makeCreateMiddleware();
  const KNOWLEDGE_READ = makeKnowledgeReadMiddleware();
  const KNOWLEDGE_WRITE = makeKnowledgeWriteMiddleware();
  const REPORTS = makeReportsMiddleware();

  // ============================================================
  // GET /api/customer-service/cases
  // ============================================================
  app.get(
    "/api/customer-service/cases",
    requireAuth,
    READ,
    async (req, res) => {
      try {
        const uid = authUserId(req);
        const limit = Math.min(
          Math.max(parseInt(String(req.query.limit)) || 25, 1),
          100,
        );
        const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);

        const search = String(req.query.search || "").trim();
        const mineOnly = String(req.query.mine || "").trim() === "true";
        const statusFilter = String(req.query.status || "").trim();
        const typeFilter = String(req.query.type || "").trim();
        const priorityFilter = String(req.query.priority || "").trim();
        const assigneeFilter = parseId(req.query.assignee_id);
        const requesterFilter = parseId(req.query.requester_id);
        const customerFilter = String(req.query.customer_id || "").trim();
        const fromDate = parseQueryDate(req.query.from);
        const toDate = parseQueryDate(req.query.to);

        const conditions: any[] = [];

        // Ownership enforcement: non-managers see only their own cases
        if (!canViewAll(req) || mineOnly) {
          conditions.push(
            or(
              eq(customer_service_cases.requester_id, uid),
              eq(customer_service_cases.assignee_id, uid),
            ),
          );
        }

        if (statusFilter && (CASE_STATUSES as readonly string[]).includes(statusFilter)) {
          conditions.push(eq(customer_service_cases.status, statusFilter));
        }
        if (typeFilter && (CASE_TYPES as readonly string[]).includes(typeFilter)) {
          conditions.push(eq(customer_service_cases.type, typeFilter));
        }
        if (
          priorityFilter &&
          (CASE_PRIORITIES as readonly string[]).includes(priorityFilter)
        ) {
          conditions.push(eq(customer_service_cases.priority, priorityFilter));
        }
        if (assigneeFilter !== null) {
          conditions.push(eq(customer_service_cases.assignee_id, assigneeFilter));
        }
        if (requesterFilter !== null) {
          conditions.push(eq(customer_service_cases.requester_id, requesterFilter));
        }
        if (customerFilter) {
          conditions.push(eq(customer_service_cases.customer_id, customerFilter));
        }
        if (fromDate) {
          conditions.push(gte(customer_service_cases.created_at, fromDate));
        }
        if (toDate) {
          // toDate inclusive: end of that day
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          conditions.push(lte(customer_service_cases.created_at, end));
        }
        if (search) {
          const pattern = `%${search.replace(/[%_\\]/g, "\\$&")}%`;
          conditions.push(
            or(
              ilike(customer_service_cases.title, pattern),
              ilike(customer_service_cases.reference, pattern),
            ),
          );
        }

        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;

        const { query } = buildCasesBaseQuery();

        const rows = await (whereClause ? query.where(whereClause) : query)
          .orderBy(
            desc(customer_service_cases.created_at),
            desc(customer_service_cases.id),
          )
          .limit(limit)
          .offset(offset);

        const countQuery = db
          .select({ count: sql<number>`count(*)::int` })
          .from(customer_service_cases);
        const [totalRow] = await (whereClause
          ? countQuery.where(whereClause)
          : countQuery);

        const total = totalRow?.count ?? 0;

        res.json({
          data: rows,
          cases: rows, // alias for backwards compat
          total,
          limit,
          offset,
        });
      } catch (error) {
        console.error("Error fetching service cases:", error);
        res.status(500).json({ message: "خطأ في جلب حالات خدمة العملاء" });
      }
    },
  );

  // ============================================================
  // POST /api/customer-service/cases
  // ============================================================
  app.post(
    "/api/customer-service/cases",
    requireAuth,
    CREATE,
    async (req, res) => {
      try {
        const uid = authUserId(req);
        const parsed = createCaseSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات الحالة غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = parsed.data;

        // Verify customer if provided
        if (data.customer_id) {
          if (!(await isActiveCustomer(data.customer_id))) {
            return res
              .status(400)
              .json({ message: "العميل غير موجود أو غير نشط" });
          }
        }

        // Only managers may assign at creation
        let assigneeId: number | null = null;
        if (data.assignee_id != null) {
          if (!isServiceManager(req)) {
            return res
              .status(403)
              .json({ message: "لا يمكنك إسناد الحالة لمستخدم آخر" });
          }
          if (!(await isActiveUser(data.assignee_id))) {
            return res
              .status(400)
              .json({ message: "الموظف المسؤول غير موجود أو غير نشط" });
          }
          assigneeId = data.assignee_id;
        }

        // Concurrency-safe reference generation + insert + audit all in one transaction
        const created = await db.transaction(async (tx) => {
          const reference = await generateReferenceInTx(tx);
          const [row] = await tx
            .insert(customer_service_cases)
            .values({
              reference,
              type: data.type,
              title: data.title,
              description: data.description ?? null,
              priority: data.priority,
              status: "open",
              requester_id: uid, // never trust supplied actor id
              customer_id: data.customer_id ?? null,
              assignee_id: assigneeId,
              due_date: data.due_date ?? null,
            })
            .returning();

          // Audit: creation record
          await recordActivityTx(tx, row.id, uid, "create", {
            reference: row.reference,
            type: row.type,
            priority: row.priority,
          });

          // Audit: initial assignment if any
          if (assigneeId) {
            await recordActivityTx(tx, row.id, uid, "reassign", {
              from: null,
              to: assigneeId,
            });
          }

          return row;
        });

        // Notify assignee if set at creation (after commit — notifications are best-effort)
        if (assigneeId) {
          await notifyUser(
            assigneeId,
            `حالة جديدة مُسندة إليك: ${created.reference}`,
            `تم إسناد الحالة "${created.title}" إليك`,
            created.id,
            "high",
          );
        }

        res.status(201).json(created);
      } catch (error) {
        console.error("Error creating service case:", error);
        res.status(500).json({ message: "خطأ في إنشاء الحالة" });
      }
    },
  );

  // ============================================================
  // GET /api/customer-service/cases/:id
  // ============================================================
  app.get(
    "/api/customer-service/cases/:id",
    requireAuth,
    READ,
    async (req, res) => {
      try {
        const id = parseId(req.params.id);
        if (id === null) {
          return res.status(400).json({ message: "معرف الحالة غير صحيح" });
        }

        // Fetch enriched case row with names
        const { query } = buildCasesBaseQuery();
        const [caseRow] = await query.where(
          eq(customer_service_cases.id, id),
        );

        // Hide inaccessible cases entirely (404, not 403)
        if (!caseRow || !canAccessCase(req, caseRow)) {
          return res.status(404).json({ message: "الحالة غير موجودة" });
        }

        const isManager = isServiceManager(req);

        // Comments — hide internal comments from non-managers
        const commentConditions: any[] = [
          eq(customer_service_comments.case_id, id),
        ];
        if (!isManager) {
          commentConditions.push(
            eq(customer_service_comments.is_internal, false),
          );
        }
        const authorUsers = alias(users, "cs_comment_author");
        const comments = await db
          .select({
            id: customer_service_comments.id,
            case_id: customer_service_comments.case_id,
            author_id: customer_service_comments.author_id,
            body: customer_service_comments.body,
            is_internal: customer_service_comments.is_internal,
            created_at: customer_service_comments.created_at,
            author_name: sql<string | null>`COALESCE(
              ${authorUsers.display_name_ar},
              ${authorUsers.display_name},
              ${authorUsers.full_name},
              ${authorUsers.username}
            )`,
          })
          .from(customer_service_comments)
          .leftJoin(
            authorUsers,
            eq(customer_service_comments.author_id, authorUsers.id),
          )
          .where(and(...commentConditions))
          .orderBy(desc(customer_service_comments.created_at));

        // Activity — full log only for managers/view-all; hidden for plain users
        let activity: any[] = [];
        if (canViewAll(req)) {
          const actorUsers = alias(users, "cs_activity_actor");
          activity = await db
            .select({
              id: customer_service_activity.id,
              case_id: customer_service_activity.case_id,
              actor_id: customer_service_activity.actor_id,
              action: customer_service_activity.action,
              details: customer_service_activity.details,
              created_at: customer_service_activity.created_at,
              actor_name: sql<string | null>`COALESCE(
                ${actorUsers.display_name_ar},
                ${actorUsers.display_name},
                ${actorUsers.full_name},
                ${actorUsers.username}
              )`,
            })
            .from(customer_service_activity)
            .leftJoin(
              actorUsers,
              eq(customer_service_activity.actor_id, actorUsers.id),
            )
            .where(eq(customer_service_activity.case_id, id))
            .orderBy(desc(customer_service_activity.created_at));
        }

        res.json({ case: caseRow, comments, activity });
      } catch (error) {
        console.error("Error fetching service case:", error);
        res.status(500).json({ message: "خطأ في جلب الحالة" });
      }
    },
  );

  // ============================================================
  // PATCH /api/customer-service/cases/:id
  // ============================================================
  app.patch(
    "/api/customer-service/cases/:id",
    requireAuth,
    READ,
    async (req, res) => {
      // Tagged result type used to surface 4xx errors from inside the transaction
      // without swallowing them as 500s.
      type ErrResult = { ok: false; status: number; message: string; errors?: any };
      type OkResult = {
        ok: true;
        updated: typeof customer_service_cases.$inferSelect;
        reassignTo: number | null | undefined;
        statusChanged: boolean;
        changeDetails: Record<string, any>;
      };
      type TxResult = ErrResult | OkResult;

      try {
        const uid = authUserId(req);
        const id = parseId(req.params.id);
        if (id === null) {
          return res.status(400).json({ message: "معرف الحالة غير صحيح" });
        }

        const parsed = updateCaseSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات التحديث غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = parsed.data;

        // ── Critical section ──────────────────────────────────────────────
        // SELECT … FOR UPDATE serialises concurrent PATCH requests on the same
        // case so that every audit "from" value reflects the committed state
        // just before this edit.  All auth checks are re-evaluated against the
        // locked row so they cannot race with another concurrent PATCH.
        // ─────────────────────────────────────────────────────────────────
        const txResult: TxResult = await db.transaction(async (tx) => {
          // Lock the row for the duration of this transaction
          const locked = await tx.execute(
            sql`SELECT * FROM customer_service_cases WHERE id = ${id} FOR UPDATE`,
          );
          const caseRow = locked.rows?.[0] as (typeof customer_service_cases.$inferSelect) | undefined;

          if (!caseRow || !canAccessCase(req, caseRow)) {
            return { ok: false, status: 404, message: "الحالة غير موجودة" } satisfies ErrResult;
          }

          const isManager = isServiceManager(req);
          const updates: Record<string, any> = {};
          const changeDetails: Record<string, any> = {};
          let reassignTo: number | null | undefined;
          let statusChanged = false;

          // Reassignment — managers only
          if ("assignee_id" in data) {
            if (!isManager) {
              return { ok: false, status: 403, message: "لا يمكنك إعادة إسناد الحالة" } satisfies ErrResult;
            }
            if (data.assignee_id != null) {
              const [assignee] = await tx
                .select({ id: users.id, status: users.status })
                .from(users)
                .where(eq(users.id, data.assignee_id));
              if (!assignee || assignee.status !== "active") {
                return { ok: false, status: 400, message: "الموظف المسؤول غير موجود أو غير نشط" } satisfies ErrResult;
              }
            }
            if ((caseRow.assignee_id ?? null) !== (data.assignee_id ?? null)) {
              updates.assignee_id = data.assignee_id ?? null;
              reassignTo = data.assignee_id ?? null;
            }
          }

          // Customer link change
          if ("customer_id" in data) {
            if (!isManager && caseRow.requester_id !== uid) {
              return { ok: false, status: 403, message: "لا يمكنك تعديل بيانات هذه الحالة" } satisfies ErrResult;
            }
            if (data.customer_id) {
              const [customer] = await tx
                .select({ id: customers.id, is_active: customers.is_active })
                .from(customers)
                .where(eq(customers.id, data.customer_id));
              if (!customer || customer.is_active === false) {
                return { ok: false, status: 400, message: "العميل غير موجود أو غير نشط" } satisfies ErrResult;
              }
            }
            const nextCustomerId = data.customer_id ?? null;
            if ((caseRow.customer_id ?? null) !== nextCustomerId) {
              updates.customer_id = nextCustomerId;
              changeDetails.customer_id = {
                from: caseRow.customer_id ?? null,
                to: nextCustomerId,
              };
            }
          }

          // Content fields — requester or managers
          const contentEditable = isManager || caseRow.requester_id === uid;
          for (const field of [
            "type",
            "title",
            "description",
            "priority",
            "due_date",
          ] as const) {
            if (field in data) {
              if (!contentEditable) {
                return { ok: false, status: 403, message: "لا يمكنك تعديل بيانات هذه الحالة" } satisfies ErrResult;
              }
              const previousValue = (caseRow as any)[field] ?? null;
              const nextValue = (data as any)[field] ?? null;
              const changed =
                field === "due_date"
                  ? (previousValue ? new Date(previousValue).getTime() : null) !==
                    (nextValue ? new Date(nextValue).getTime() : null)
                  : previousValue !== nextValue;
              if (changed) {
                updates[field] = nextValue;
                changeDetails[field] = {
                  from:
                    field === "due_date" && previousValue
                      ? new Date(previousValue).toISOString()
                      : previousValue,
                  to:
                    field === "due_date" && nextValue
                      ? new Date(nextValue).toISOString()
                      : nextValue,
                };
              }
            }
          }

          // Status change
          if ("status" in data && data.status && data.status !== caseRow.status) {
            const isReopen =
              (caseRow.status === "resolved" || caseRow.status === "closed") &&
              (data.status === "open" ||
                data.status === "in_progress" ||
                data.status === "waiting");
            if (isReopen && !isManager) {
              return { ok: false, status: 403, message: "إعادة فتح الحالة متاحة للمدير فقط" } satisfies ErrResult;
            }
            if (
              !isManager &&
              !(caseRow.requester_id === uid || caseRow.assignee_id === uid)
            ) {
              return { ok: false, status: 403, message: "لا يمكنك تغيير حالة هذه الحالة" } satisfies ErrResult;
            }
            updates.status = data.status;
            statusChanged = true;
            if (data.status === "resolved") updates.resolved_at = new Date();
            if (data.status === "closed") updates.closed_at = new Date();
            if (
              data.status === "open" ||
              data.status === "in_progress" ||
              data.status === "waiting"
            ) {
              updates.resolved_at = null;
              updates.closed_at = null;
            }
          }

          if (Object.keys(updates).length === 0) {
            return { ok: false, status: 400, message: "لا توجد تغييرات صالحة" } satisfies ErrResult;
          }

          updates.updated_at = new Date();

          const [updated] = await tx
            .update(customer_service_cases)
            .set(updates)
            .where(eq(customer_service_cases.id, id))
            .returning();

          // ── Audit inserts — same transaction, errors propagate → rollback ──
          if (reassignTo !== undefined) {
            await recordActivityTx(tx, id, uid, "reassign", {
              from: caseRow.assignee_id ?? null,
              to: reassignTo,
            });
          }
          if (statusChanged) {
            await recordActivityTx(tx, id, uid, "status", {
              from: caseRow.status,
              to: updates.status,
            });
          }
          if (Object.keys(changeDetails).length > 0) {
            await recordActivityTx(tx, id, uid, "update", changeDetails);
          }

          return { ok: true, updated, reassignTo, statusChanged, changeDetails } satisfies OkResult;
        });

        // Surface 4xx errors that were returned from inside the transaction
        if (!txResult.ok) {
          return res.status(txResult.status).json({ message: txResult.message });
        }

        const { updated, reassignTo, statusChanged, changeDetails } = txResult;

        // ── Notifications fire after commit (best-effort) ──────────────────
        if (reassignTo) {
          await notifyUser(
            reassignTo,
            `حالة مُسندة إليك: ${updated.reference}`,
            `تم إسناد الحالة "${updated.title}" إليك`,
            id,
            "high",
          );
        }
        // Notify requester of external updates (change made by someone else)
        if (
          (statusChanged || Object.keys(changeDetails).length > 0) &&
          updated.requester_id !== uid
        ) {
          await notifyUser(
            updated.requester_id,
            `تحديث على حالتك: ${updated.reference}`,
            `تم تحديث الحالة "${updated.title}"`,
            id,
          );
        }
        // Notify assignee (if not the actor and not the one just reassigned to)
        if (
          updated.assignee_id &&
          updated.assignee_id !== uid &&
          updated.assignee_id !== reassignTo &&
          (statusChanged || Object.keys(changeDetails).length > 0)
        ) {
          await notifyUser(
            updated.assignee_id,
            `تحديث على حالة مُسندة إليك: ${updated.reference}`,
            `تم تحديث الحالة "${updated.title}"`,
            id,
          );
        }

        res.json(updated);
      } catch (error) {
        console.error("Error updating service case:", error);
        res.status(500).json({ message: "خطأ في تحديث الحالة" });
      }
    },
  );

  // ============================================================
  // POST /api/customer-service/cases/:id/comments
  // ============================================================
  app.post(
    "/api/customer-service/cases/:id/comments",
    requireAuth,
    READ,
    async (req, res) => {
      try {
        const uid = authUserId(req);
        const id = parseId(req.params.id);
        if (id === null) {
          return res.status(400).json({ message: "معرف الحالة غير صحيح" });
        }

        const parsed = createCommentSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات التعليق غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = parsed.data;

        // Lock and re-authorize the case in the same transaction as the
        // comment/audit insert so reassignment cannot race the access check.
        const txResult = await db.transaction(async (tx) => {
          const locked = await tx.execute(
            sql`SELECT * FROM customer_service_cases WHERE id = ${id} FOR UPDATE`,
          );
          const caseRow = locked.rows?.[0] as
            | typeof customer_service_cases.$inferSelect
            | undefined;
          if (!caseRow || !canAccessCase(req, caseRow)) {
            return null;
          }

          // Only managers may post internal comments.
          const isInternal = Boolean(data.is_internal && isServiceManager(req));
          const [row] = await tx
            .insert(customer_service_comments)
            .values({
              case_id: id,
              author_id: uid, // never trust supplied actor id
              body: data.body,
              is_internal: !!isInternal,
            })
            .returning();
          await recordActivityTx(tx, id, uid, "comment", {
            comment_id: row.id,
            is_internal: isInternal,
          });
          return { comment: row, caseRow, isInternal };
        });
        if (!txResult) {
          return res.status(404).json({ message: "الحالة غير موجودة" });
        }
        const { comment, caseRow, isInternal } = txResult;

        // Notify the other parties (requester + assignee), skipping actor
        const recipients = new Set<number>();
        if (!isInternal) {
          if (caseRow.requester_id !== uid) {
            recipients.add(caseRow.requester_id);
          }
          if (caseRow.assignee_id && caseRow.assignee_id !== uid) {
            recipients.add(caseRow.assignee_id);
          }
        }
        for (const rid of recipients) {
          await notifyUser(
            rid,
            `تعليق جديد على الحالة: ${caseRow.reference}`,
            `تمت إضافة تعليق على الحالة "${caseRow.title}"`,
            id,
          );
        }

        res.status(201).json(comment);
      } catch (error) {
        console.error("Error adding service comment:", error);
        res.status(500).json({ message: "خطأ في إضافة التعليق" });
      }
    },
  );

  // ============================================================
  // GET /api/customer-service/dashboard
  // ============================================================
  app.get(
    "/api/customer-service/dashboard",
    requireAuth,
    READ,
    async (req, res) => {
      try {
        const uid = authUserId(req);
        const scoped = !canViewAll(req);
        const now = new Date();

        const ownershipCond = scoped
          ? or(
              eq(customer_service_cases.requester_id, uid),
              eq(customer_service_cases.assignee_id, uid),
            )
          : undefined;

        // Helper to apply ownership filter to a count query
        const scopedCount = async (extraCond?: any): Promise<number> => {
          const conds: any[] = [];
          if (ownershipCond) conds.push(ownershipCond);
          if (extraCond) conds.push(extraCond);
          const [row] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(customer_service_cases)
            .where(conds.length > 0 ? and(...conds) : undefined);
          return row?.count ?? 0;
        };

        const [
          total,
          open,
          in_progress,
          waiting,
          resolved,
          closed,
          overdue,
          unassigned,
          my_assigned,
        ] = await Promise.all([
          scopedCount(),
          scopedCount(eq(customer_service_cases.status, "open")),
          scopedCount(eq(customer_service_cases.status, "in_progress")),
          scopedCount(eq(customer_service_cases.status, "waiting")),
          scopedCount(eq(customer_service_cases.status, "resolved")),
          scopedCount(eq(customer_service_cases.status, "closed")),
          // Overdue: has a due_date in the past AND not resolved/closed
          scopedCount(
            and(
              lte(customer_service_cases.due_date, now),
              sql`${customer_service_cases.due_date} IS NOT NULL`,
              inArray(customer_service_cases.status, ["open", "in_progress", "waiting"]),
            ),
          ),
          // Unassigned open cases
          scopedCount(
            and(
              isNull(customer_service_cases.assignee_id),
              inArray(customer_service_cases.status, ["open", "in_progress", "waiting"]),
            ),
          ),
          // Cases assigned to the current user (always own-scoped regardless of canViewAll)
          (async () => {
            const [row] = await db
              .select({ count: sql<number>`count(*)::int` })
              .from(customer_service_cases)
              .where(
                and(
                  eq(customer_service_cases.assignee_id, uid),
                  inArray(customer_service_cases.status, ["open", "in_progress", "waiting"]),
                ),
              );
            return row?.count ?? 0;
          })(),
        ]);

        // by_status aggregation
        const byStatusQ = db
          .select({
            status: customer_service_cases.status,
            count: sql<number>`count(*)::int`,
          })
          .from(customer_service_cases)
          .groupBy(customer_service_cases.status);
        const byStatus = await (ownershipCond
          ? byStatusQ.where(ownershipCond)
          : byStatusQ);

        // by_priority aggregation
        const byPriorityQ = db
          .select({
            priority: customer_service_cases.priority,
            count: sql<number>`count(*)::int`,
          })
          .from(customer_service_cases)
          .groupBy(customer_service_cases.priority);
        const byPriority = await (ownershipCond
          ? byPriorityQ.where(ownershipCond)
          : byPriorityQ);

        // by_type aggregation
        const byTypeQ = db
          .select({
            type: customer_service_cases.type,
            count: sql<number>`count(*)::int`,
          })
          .from(customer_service_cases)
          .groupBy(customer_service_cases.type);
        const byType = await (ownershipCond
          ? byTypeQ.where(ownershipCond)
          : byTypeQ);

        // recent: last 10 cases (scoped)
        const { query: recentBaseQ } = buildCasesBaseQuery();
        const recentQ = ownershipCond
          ? recentBaseQ.where(ownershipCond)
          : recentBaseQ;
        const recent = await recentQ
          .orderBy(
            desc(customer_service_cases.created_at),
            desc(customer_service_cases.id),
          )
          .limit(10);

        res.json({
          totals: {
            total,
            open,
            in_progress,
            waiting,
            resolved,
            closed,
            overdue,
            unassigned,
            my_assigned,
          },
          by_status: byStatus,
          by_priority: byPriority,
          by_type: byType,
          recent,
        });
      } catch (error) {
        console.error("Error building service dashboard:", error);
        res
          .status(500)
          .json({ message: "خطأ في جلب لوحة خدمة العملاء" });
      }
    },
  );

  // ============================================================
  // GET /api/customer-service/users/:userId/workload (managers only)
  // ============================================================
  app.get(
    "/api/customer-service/users/:userId/workload",
    requireAuth,
    async (req, res) => {
      try {
        if (!isServiceManager(req)) {
          return res
            .status(403)
            .json({ message: "هذا الإجراء متاح للمدراء فقط" });
        }
        const userId = parseId(req.params.userId);
        if (userId === null) {
          return res.status(400).json({ message: "معرف المستخدم غير صحيح" });
        }
        if (!(await isActiveUser(userId))) {
          return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        const now = new Date();

        // Status summary for this assignee
        const byStatusRows = await db
          .select({
            status: customer_service_cases.status,
            count: sql<number>`count(*)::int`,
          })
          .from(customer_service_cases)
          .where(eq(customer_service_cases.assignee_id, userId))
          .groupBy(customer_service_cases.status);

        const statusMap: Record<string, number> = {};
        for (const row of byStatusRows) {
          statusMap[row.status] = row.count;
        }

        const openStatuses = ["open", "in_progress", "waiting"] as const;

        const [overdueRow] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(customer_service_cases)
          .where(
            and(
              eq(customer_service_cases.assignee_id, userId),
              inArray(customer_service_cases.status, openStatuses as any),
              lte(customer_service_cases.due_date, now),
              sql`${customer_service_cases.due_date} IS NOT NULL`,
            ),
          );

        // Active assigned cases (open + in_progress + waiting) with enriched data
        const { query: casesQ } = buildCasesBaseQuery();
        const activeCases = await casesQ
          .where(
            and(
              eq(customer_service_cases.assignee_id, userId),
              inArray(
                customer_service_cases.status,
                openStatuses as unknown as string[],
              ),
            ),
          )
          .orderBy(
            desc(customer_service_cases.priority),
            desc(customer_service_cases.created_at),
          );

        res.json({
          data: {
            user_id: userId,
            summary: {
              total:
                Object.values(statusMap).reduce((a, b) => a + b, 0),
              open: statusMap["open"] ?? 0,
              in_progress: statusMap["in_progress"] ?? 0,
              waiting: statusMap["waiting"] ?? 0,
              resolved: statusMap["resolved"] ?? 0,
              closed: statusMap["closed"] ?? 0,
              overdue: overdueRow?.count ?? 0,
            },
            cases: activeCases.map((c) => ({
              id: c.id,
              reference: c.reference,
              title: c.title,
              status: c.status,
              priority: c.priority,
              due_date: c.due_date,
              customer_name: c.customer_name,
              requester_name: c.requester_name,
            })),
          },
        });
      } catch (error) {
        console.error("Error fetching user workload:", error);
        res.status(500).json({ message: "خطأ في جلب حمل العمل" });
      }
    },
  );

  // ============================================================
  // GET /api/customer-service/reports   (primary)
  // GET /api/customer-service/report    (alias)
  // ============================================================
  const reportsHandler = async (req: any, res: any) => {
    try {
      if (!canViewReports(req)) {
        return res.status(403).json({ message: "ليس لديك صلاحية عرض التقارير" });
      }

      const uid = authUserId(req);
      const limit = Math.min(
        Math.max(parseInt(String(req.query.limit)) || 100, 1),
        500,
      );
      const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);

      const fromDate = parseQueryDate(req.query.from);
      const toDate = parseQueryDate(req.query.to);
      const typeFilter = String(req.query.type || "").trim();
      const statusFilter = String(req.query.status || "").trim();
      const priorityFilter = String(req.query.priority || "").trim();
      const customerFilter = String(req.query.customer_id || "").trim();
      const assigneeFilter = parseId(req.query.assignee_id);
      const requesterFilter = parseId(req.query.requester_id);

      const conditions: any[] = [];

      // ── Ownership scoping ───────────────────────────────────────────────
      // service_view_all / managers see all rows.
      // service_view_reports alone is intentionally restricted to the user's
      // own cases (requester_id or assignee_id) so that a reports-only role
      // cannot enumerate the full dataset without explicit view-all grant.
      if (!canViewAll(req)) {
        conditions.push(
          or(
            eq(customer_service_cases.requester_id, uid),
            eq(customer_service_cases.assignee_id, uid),
          ),
        );
      }
      // ────────────────────────────────────────────────────────────────────

      if (fromDate) {
        conditions.push(gte(customer_service_cases.created_at, fromDate));
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        conditions.push(lte(customer_service_cases.created_at, end));
      }
      if (typeFilter && (CASE_TYPES as readonly string[]).includes(typeFilter)) {
        conditions.push(eq(customer_service_cases.type, typeFilter));
      }
      if (statusFilter && (CASE_STATUSES as readonly string[]).includes(statusFilter)) {
        conditions.push(eq(customer_service_cases.status, statusFilter));
      }
      if (
        priorityFilter &&
        (CASE_PRIORITIES as readonly string[]).includes(priorityFilter)
      ) {
        conditions.push(eq(customer_service_cases.priority, priorityFilter));
      }
      if (customerFilter) {
        conditions.push(eq(customer_service_cases.customer_id, customerFilter));
      }
      if (assigneeFilter !== null) {
        conditions.push(
          eq(customer_service_cases.assignee_id, assigneeFilter),
        );
      }
      if (requesterFilter !== null) {
        conditions.push(
          eq(customer_service_cases.requester_id, requesterFilter),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Enriched rows
      const { query } = buildCasesBaseQuery();
      const rows = await (whereClause ? query.where(whereClause) : query)
        .orderBy(
          desc(customer_service_cases.created_at),
          desc(customer_service_cases.id),
        )
        .limit(limit)
        .offset(offset);

      // Total for pagination (same scope)
      const countQ = db
        .select({ count: sql<number>`count(*)::int` })
        .from(customer_service_cases);
      const [totalRow] = await (whereClause
        ? countQ.where(whereClause)
        : countQ);
      const total = totalRow?.count ?? 0;

      // Status breakdown (same scope)
      const statusQ = db
        .select({
          status: customer_service_cases.status,
          count: sql<number>`count(*)::int`,
        })
        .from(customer_service_cases)
        .groupBy(customer_service_cases.status);
      const statusRows = await (whereClause
        ? statusQ.where(whereClause)
        : statusQ);
      const sm: Record<string, number> = {};
      for (const r of statusRows) sm[r.status] = r.count;

      // Average resolution hours (same scope, resolved cases only)
      const resConditions: any[] = [...(whereClause ? [whereClause] : [])];
      resConditions.push(
        sql`${customer_service_cases.resolved_at} IS NOT NULL`,
      );
      const [resRow] = await db
        .select({
          avg_hours: sql<number>`COALESCE(AVG(
            EXTRACT(EPOCH FROM (${customer_service_cases.resolved_at} - ${customer_service_cases.created_at})) / 3600.0
          ), 0)::float`,
        })
        .from(customer_service_cases)
        .where(and(...resConditions));

      res.json({
        data: rows,
        total,
        totals: {
          total,
          open: sm["open"] ?? 0,
          in_progress: sm["in_progress"] ?? 0,
          waiting: sm["waiting"] ?? 0,
          resolved: sm["resolved"] ?? 0,
          closed: sm["closed"] ?? 0,
          avg_resolution_hours: resRow?.avg_hours ?? 0,
        },
      });
    } catch (error) {
      console.error("Error building service report:", error);
      res.status(500).json({ message: "خطأ في جلب تقرير خدمة العملاء" });
    }
  };

  app.get("/api/customer-service/reports", requireAuth, REPORTS, reportsHandler);
  // Singular alias for backwards compat
  app.get("/api/customer-service/report", requireAuth, REPORTS, reportsHandler);

  // ============================================================
  // Knowledge Base CRUD
  // ============================================================

  // GET list
  app.get(
    "/api/customer-service/knowledge",
    requireAuth,
    KNOWLEDGE_READ,
    async (req, res) => {
      try {
        const search = String(req.query.search || "").trim();
        const canManage = canManageKnowledge(req);

        const conditions: any[] = [];
        // Non-managers only see published articles
        if (!canManage) {
          conditions.push(eq(customer_service_knowledge.is_published, true));
        }
        if (search) {
          const pattern = `%${search.replace(/[%_\\]/g, "\\$&")}%`;
          conditions.push(
            or(
              ilike(customer_service_knowledge.title, pattern),
              ilike(customer_service_knowledge.content, pattern),
            ),
          );
        }
        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;

        const q = db
          .select()
          .from(customer_service_knowledge)
          .orderBy(desc(customer_service_knowledge.updated_at));
        const rows = await (whereClause ? q.where(whereClause) : q);

        res.json({ data: rows, total: rows.length });
      } catch (error) {
        console.error("Error fetching knowledge:", error);
        res.status(500).json({ message: "خطأ في جلب قاعدة المعرفة" });
      }
    },
  );

  // GET single
  app.get(
    "/api/customer-service/knowledge/:id",
    requireAuth,
    KNOWLEDGE_READ,
    async (req, res) => {
      try {
        const id = parseId(req.params.id);
        if (id === null) {
          return res.status(400).json({ message: "معرف المقال غير صحيح" });
        }
        const [row] = await db
          .select()
          .from(customer_service_knowledge)
          .where(eq(customer_service_knowledge.id, id));
        const canManage = canManageKnowledge(req);
        if (!row || (!row.is_published && !canManage)) {
          return res.status(404).json({ message: "المقال غير موجود" });
        }
        res.json(row);
      } catch (error) {
        console.error("Error fetching knowledge article:", error);
        res.status(500).json({ message: "خطأ في جلب المقال" });
      }
    },
  );

  // POST create
  app.post(
    "/api/customer-service/knowledge",
    requireAuth,
    KNOWLEDGE_WRITE,
    async (req, res) => {
      try {
        const uid = authUserId(req);
        const parsed = knowledgeSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات المقال غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = parsed.data;
        const [row] = await db
          .insert(customer_service_knowledge)
          .values({
            title: data.title,
            content: data.content,
            category: data.category ?? null,
            tags: data.tags ?? null,
            is_published: data.is_published,
            created_by: uid,
          })
          .returning();
        res.status(201).json(row);
      } catch (error) {
        console.error("Error creating knowledge article:", error);
        res.status(500).json({ message: "خطأ في إنشاء المقال" });
      }
    },
  );

  // PATCH update
  app.patch(
    "/api/customer-service/knowledge/:id",
    requireAuth,
    KNOWLEDGE_WRITE,
    async (req, res) => {
      try {
        const id = parseId(req.params.id);
        if (id === null) {
          return res.status(400).json({ message: "معرف المقال غير صحيح" });
        }
        const parsed = knowledgeSchema.partial().safeParse(req.body ?? {});
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات المقال غير صحيحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = parsed.data;
        const updates: Record<string, any> = {};
        if ("title" in data) updates.title = data.title;
        if ("content" in data) updates.content = data.content;
        if ("category" in data) updates.category = data.category ?? null;
        if ("tags" in data) updates.tags = data.tags ?? null;
        if ("is_published" in data) updates.is_published = data.is_published;
        if (Object.keys(updates).length === 0) {
          return res.status(400).json({ message: "لا توجد تغييرات صالحة" });
        }
        updates.updated_at = new Date();

        const [row] = await db
          .update(customer_service_knowledge)
          .set(updates)
          .where(eq(customer_service_knowledge.id, id))
          .returning();
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

  // DELETE
  app.delete(
    "/api/customer-service/knowledge/:id",
    requireAuth,
    KNOWLEDGE_WRITE,
    async (req, res) => {
      try {
        const id = parseId(req.params.id);
        if (id === null) {
          return res.status(400).json({ message: "معرف المقال غير صحيح" });
        }
        const [row] = await db
          .delete(customer_service_knowledge)
          .where(eq(customer_service_knowledge.id, id))
          .returning();
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
}
