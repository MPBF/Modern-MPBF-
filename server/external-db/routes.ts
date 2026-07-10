import {
  external_db_connections,
  external_db_saved_queries,
  external_db_reports,
  insertExternalDbConnectionSchema,
  type SavedQueryParam,
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import type { Express } from "express";
import { z } from "zod";

import { db } from "../db";
import { requireAuth, requirePermission, type AuthRequest } from "../middleware/auth";

import {
  encryptSecret,
  reencryptSecret,
  CURRENT_KEY_VERSION,
  CredentialDecryptionError,
} from "./crypto";
import {
  testConnection,
  listTables,
  listColumns,
  runQuery,
  validateSelectOnly,
  invalidatePool,
  type ExternalDbConfig,
  type QueryParamBinding,
} from "./service";

// Shape returned to the client — NEVER includes the password.
function toClientConnection(row: typeof external_db_connections.$inferSelect) {
  const { password_encrypted, ...safe } = row;
  return safe;
}

function toConfig(
  row: typeof external_db_connections.$inferSelect,
): ExternalDbConfig {
  return {
    id: row.id,
    host: row.host,
    port: row.port,
    database_name: row.database_name,
    username: row.username,
    password_encrypted: row.password_encrypted,
    key_version: row.key_version,
    encrypt: row.encrypt,
    trust_server_certificate: row.trust_server_certificate,
  };
}

const createSchema = insertExternalDbConnectionSchema.extend({
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const updateSchema = insertExternalDbConnectionSchema.partial().extend({
  password: z.string().min(1).optional(),
});

const testSchema = z.object({
  // Either test a saved connection by id, or test ad-hoc credentials.
  connectionId: z.number().int().positive().optional(),
  host: z.string().optional(),
  port: z.coerce.number().int().positive().optional(),
  database_name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  encrypt: z.boolean().optional(),
  trust_server_certificate: z.boolean().optional(),
});

// ---- Saved query validation ----
const paramDefSchema = z.object({
  name: z
    .string()
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "اسم المعامل غير صالح"),
  label: z.string().min(1, "وصف المعامل مطلوب").max(150),
  type: z.enum(["text", "number", "date"]),
  default: z.string().max(150).optional(),
});

const savedQueryCreateSchema = z.object({
  connection_id: z.number().int().positive(),
  name: z.string().min(1, "اسم الاستعلام مطلوب").max(200),
  sql_text: z.string().min(1, "نص الاستعلام مطلوب"),
  parameters: z.array(paramDefSchema).max(20).default([]),
});

const savedQueryUpdateSchema = savedQueryCreateSchema
  .omit({ connection_id: true })
  .partial();

const runSavedSchema = z.object({
  values: z
    .record(z.string(), z.union([z.string(), z.number(), z.null()]))
    .default({}),
});

// Reject duplicate parameter names within a single saved query.
function assertUniqueParamNames(params: SavedQueryParam[]): void {
  const seen = new Set<string>();
  for (const p of params) {
    const key = p.name.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`اسم معامل مكرر: ${p.name}`);
    }
    seen.add(key);
  }
}

async function getSavedQueryOr404(
  id: number,
): Promise<typeof external_db_saved_queries.$inferSelect | null> {
  const [row] = await db
    .select()
    .from(external_db_saved_queries)
    .where(eq(external_db_saved_queries.id, id))
    .limit(1);
  return row || null;
}

async function getConnectionOr404(
  id: number,
): Promise<typeof external_db_connections.$inferSelect | null> {
  const [row] = await db
    .select()
    .from(external_db_connections)
    .where(eq(external_db_connections.id, id))
    .limit(1);
  return row || null;
}

async function getReportOr404(
  id: number,
): Promise<typeof external_db_reports.$inferSelect | null> {
  const [row] = await db
    .select()
    .from(external_db_reports)
    .where(eq(external_db_reports.id, id))
    .limit(1);
  return row || null;
}

const reportBodySchema = z.object({
  connection_id: z.coerce.number().int().positive(),
  name: z.string().min(1, "اسم التقرير مطلوب"),
  template_type: z
    .enum(["table", "account_statement", "sales_invoice"])
    .default("table"),
  title_ar: z.string().optional().nullable(),
  sql_text: z.string().min(1, "الاستعلام مطلوب"),
  column_mapping: z.record(z.string(), z.string()).optional().nullable(),
  header_info: z.record(z.string(), z.string()).optional().nullable(),
});

const reportUpdateSchema = reportBodySchema.partial();

export function registerExternalDbRoutes(app: Express): void {
  // List connections (no passwords)
  app.get(
    "/api/external-db/connections",
    requireAuth,
    requirePermission("manage_settings"),
    async (_req: AuthRequest, res) => {
      try {
        const rows = await db
          .select()
          .from(external_db_connections)
          .orderBy(desc(external_db_connections.created_at));
        res.json(rows.map(toClientConnection));
      } catch (error) {
        console.error("[external-db] list error:", error);
        res.status(500).json({ message: "خطأ في جلب الاتصالات" });
      }
    },
  );

  // Create connection
  app.post(
    "/api/external-db/connections",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const parsed = createSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صالحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const { password, ...rest } = parsed.data;
        const [row] = await db
          .insert(external_db_connections)
          .values({
            ...rest,
            password_encrypted: encryptSecret(password),
            key_version: CURRENT_KEY_VERSION,
            created_by: req.user?.id ?? null,
            updated_at: new Date(),
          })
          .returning();
        res.status(201).json(toClientConnection(row));
      } catch (error) {
        console.error("[external-db] create error:", error);
        res.status(500).json({ message: "خطأ في حفظ الاتصال" });
      }
    },
  );

  // Update connection
  app.patch(
    "/api/external-db/connections/:id",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ message: "معرّف غير صالح" });
        }
        const existing = await getConnectionOr404(id);
        if (!existing) {
          return res.status(404).json({ message: "الاتصال غير موجود" });
        }
        const parsed = updateSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صالحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const { password, ...rest } = parsed.data;
        const updateValues: Record<string, unknown> = {
          ...rest,
          updated_at: new Date(),
        };
        if (password) {
          updateValues.password_encrypted = encryptSecret(password);
          updateValues.key_version = CURRENT_KEY_VERSION;
        }
        const [row] = await db
          .update(external_db_connections)
          .set(updateValues)
          .where(eq(external_db_connections.id, id))
          .returning();
        invalidatePool(id);
        res.json(toClientConnection(row));
      } catch (error) {
        console.error("[external-db] update error:", error);
        res.status(500).json({ message: "خطأ في تحديث الاتصال" });
      }
    },
  );

  // Delete connection
  app.delete(
    "/api/external-db/connections/:id",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ message: "معرّف غير صالح" });
        }
        await db
          .delete(external_db_connections)
          .where(eq(external_db_connections.id, id));
        invalidatePool(id);
        res.json({ success: true });
      } catch (error) {
        console.error("[external-db] delete error:", error);
        res.status(500).json({ message: "خطأ في حذف الاتصال" });
      }
    },
  );

  // Re-encrypt all stored credentials with the current key version. Used after
  // a SESSION_SECRET rotation (see replit.md "Secrets rotation"). Idempotent:
  // credentials already on the current version are skipped.
  app.post(
    "/api/external-db/rotate-key",
    requireAuth,
    requirePermission("manage_settings"),
    async (_req: AuthRequest, res) => {
      try {
        const rows = await db.select().from(external_db_connections);
        let migrated = 0;
        let alreadyCurrent = 0;
        const failed: { id: number; name: string }[] = [];

        for (const row of rows) {
          try {
            const reencrypted = reencryptSecret(
              row.password_encrypted,
              row.key_version,
            );
            if (reencrypted === null) {
              alreadyCurrent += 1;
              continue;
            }
            await db
              .update(external_db_connections)
              .set({
                password_encrypted: reencrypted,
                key_version: CURRENT_KEY_VERSION,
                updated_at: new Date(),
              })
              .where(eq(external_db_connections.id, row.id));
            invalidatePool(row.id);
            migrated += 1;
          } catch (err) {
            if (err instanceof CredentialDecryptionError) {
              failed.push({ id: row.id, name: row.name });
            } else {
              throw err;
            }
          }
        }

        res.json({
          currentKeyVersion: CURRENT_KEY_VERSION,
          total: rows.length,
          migrated,
          alreadyCurrent,
          failed,
          message:
            failed.length === 0
              ? `تم إعادة تشفير ${migrated} اتصال بنجاح`
              : `تم إعادة تشفير ${migrated} اتصال، وتعذّر فك تشفير ${failed.length} (يجب إعادة إدخال كلمة المرور لها)`,
        });
      } catch (error) {
        console.error("[external-db] rotate-key error:", error);
        res.status(500).json({ message: "خطأ في إعادة تشفير بيانات الاتصال" });
      }
    },
  );

  // Test connection (saved by id, or ad-hoc credentials)
  app.post(
    "/api/external-db/test",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const parsed = testSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: "بيانات غير صالحة" });
        }
        let config: ExternalDbConfig;
        if (parsed.data.connectionId) {
          const row = await getConnectionOr404(parsed.data.connectionId);
          if (!row) {
            return res.status(404).json({ message: "الاتصال غير موجود" });
          }
          config = toConfig(row);
        } else {
          const d = parsed.data;
          if (!d.host || !d.database_name || !d.username || !d.password) {
            return res
              .status(400)
              .json({ message: "الحقول المطلوبة غير مكتملة" });
          }
          config = {
            host: d.host,
            port: d.port ?? 1433,
            database_name: d.database_name,
            username: d.username,
            password: d.password,
            encrypt: d.encrypt ?? true,
            trust_server_certificate: d.trust_server_certificate ?? false,
          };
        }
        await testConnection(config);
        res.json({ success: true, message: "تم الاتصال بنجاح" });
      } catch (error: any) {
        res
          .status(400)
          .json({ success: false, message: error?.message || "فشل الاتصال" });
      }
    },
  );

  // List tables for a saved connection
  app.get(
    "/api/external-db/connections/:id/tables",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        const row = await getConnectionOr404(id);
        if (!row) {
          return res.status(404).json({ message: "الاتصال غير موجود" });
        }
        const tables = await listTables(toConfig(row));
        res.json(tables);
      } catch (error: any) {
        res
          .status(400)
          .json({ message: error?.message || "خطأ في جلب الجداول" });
      }
    },
  );

  // List columns for a table
  app.get(
    "/api/external-db/connections/:id/columns",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        const schema = String(req.query.schema || "");
        const table = String(req.query.table || "");
        if (!schema || !table) {
          return res.status(400).json({ message: "اسم الجدول مطلوب" });
        }
        const row = await getConnectionOr404(id);
        if (!row) {
          return res.status(404).json({ message: "الاتصال غير موجود" });
        }
        const columns = await listColumns(toConfig(row), schema, table);
        res.json(columns);
      } catch (error: any) {
        res
          .status(400)
          .json({ message: error?.message || "خطأ في جلب الأعمدة" });
      }
    },
  );

  // Run a SELECT-only query
  app.post(
    "/api/external-db/connections/:id/query",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        const sqlText = String(req.body?.sql || "");
        const row = await getConnectionOr404(id);
        if (!row) {
          return res.status(404).json({ message: "الاتصال غير موجود" });
        }
        const result = await runQuery(toConfig(row), sqlText);
        res.json(result);
      } catch (error: any) {
        res
          .status(400)
          .json({ message: error?.message || "خطأ في تنفيذ الاستعلام" });
      }
    },
  );

  // ---- Saved queries ----

  // List saved queries (optionally filtered by connection)
  app.get(
    "/api/external-db/saved-queries",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const connectionId = Number(req.query.connectionId);
        const base = db.select().from(external_db_saved_queries);
        const rows =
          Number.isInteger(connectionId) && connectionId > 0
            ? await base
                .where(
                  eq(external_db_saved_queries.connection_id, connectionId),
                )
                .orderBy(asc(external_db_saved_queries.name))
            : await base.orderBy(asc(external_db_saved_queries.name));
        res.json(rows);
      } catch (error) {
        console.error("[external-db] saved-queries list error:", error);
        res.status(500).json({ message: "خطأ في جلب الاستعلامات المحفوظة" });
      }
    },
  );

  // Create a saved query
  app.post(
    "/api/external-db/saved-queries",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const parsed = savedQueryCreateSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صالحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = parsed.data;
        // Reject anything that isn't a read-only SELECT before storing it.
        validateSelectOnly(data.sql_text);
        assertUniqueParamNames(data.parameters);
        const conn = await getConnectionOr404(data.connection_id);
        if (!conn) {
          return res.status(404).json({ message: "الاتصال غير موجود" });
        }
        const [row] = await db
          .insert(external_db_saved_queries)
          .values({
            connection_id: data.connection_id,
            name: data.name,
            sql_text: data.sql_text,
            parameters: data.parameters,
            created_by: req.user?.id ?? null,
            updated_at: new Date(),
          })
          .returning();
        res.status(201).json(row);
      } catch (error: any) {
        res
          .status(400)
          .json({ message: error?.message || "خطأ في حفظ الاستعلام" });
      }
    },
  );

  // Update a saved query
  app.patch(
    "/api/external-db/saved-queries/:id",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ message: "معرّف غير صالح" });
        }
        const existing = await getSavedQueryOr404(id);
        if (!existing) {
          return res.status(404).json({ message: "الاستعلام غير موجود" });
        }
        const parsed = savedQueryUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صالحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const data = parsed.data;
        if (data.sql_text !== undefined) {
          validateSelectOnly(data.sql_text);
        }
        if (data.parameters !== undefined) {
          assertUniqueParamNames(data.parameters);
        }
        const [row] = await db
          .update(external_db_saved_queries)
          .set({ ...data, updated_at: new Date() })
          .where(eq(external_db_saved_queries.id, id))
          .returning();
        res.json(row);
      } catch (error: any) {
        res
          .status(400)
          .json({ message: error?.message || "خطأ في تحديث الاستعلام" });
      }
    },
  );

  // Delete a saved query
  app.delete(
    "/api/external-db/saved-queries/:id",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ message: "معرّف غير صالح" });
        }
        await db
          .delete(external_db_saved_queries)
          .where(eq(external_db_saved_queries.id, id));
        res.json({ success: true });
      } catch (error) {
        console.error("[external-db] saved-query delete error:", error);
        res.status(500).json({ message: "خطأ في حذف الاستعلام" });
      }
    },
  );

  // Run a saved query, binding any declared parameters to user-supplied values
  app.post(
    "/api/external-db/saved-queries/:id/run",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ message: "معرّف غير صالح" });
        }
        const parsed = runSavedSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: "بيانات غير صالحة" });
        }
        const saved = await getSavedQueryOr404(id);
        if (!saved) {
          return res.status(404).json({ message: "الاستعلام غير موجود" });
        }
        const conn = await getConnectionOr404(saved.connection_id);
        if (!conn) {
          return res.status(404).json({ message: "الاتصال غير موجود" });
        }
        const declared = (saved.parameters || []) as SavedQueryParam[];
        const bindings: QueryParamBinding[] = [];
        for (const p of declared) {
          const raw = parsed.data.values[p.name];
          if (raw === undefined || raw === null || raw === "") {
            return res
              .status(400)
              .json({ message: `قيمة المعامل مطلوبة: ${p.label || p.name}` });
          }
          bindings.push({ name: p.name, type: p.type, value: raw });
        }
        const result = await runQuery(toConfig(conn), saved.sql_text, bindings);
        res.json(result);
      } catch (error: any) {
        res
          .status(400)
          .json({ message: error?.message || "خطأ في تنفيذ الاستعلام" });
      }
    },
  );

  // ---- Saved report definitions (formatted Arabic templates) ----

  // List all saved reports
  app.get(
    "/api/external-db/reports",
    requireAuth,
    requirePermission("manage_settings"),
    async (_req: AuthRequest, res) => {
      try {
        const rows = await db
          .select()
          .from(external_db_reports)
          .orderBy(desc(external_db_reports.created_at));
        res.json(rows);
      } catch (error) {
        console.error("[external-db] reports list error:", error);
        res.status(500).json({ message: "خطأ في جلب التقارير" });
      }
    },
  );

  // Create a saved report
  app.post(
    "/api/external-db/reports",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const parsed = reportBodySchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صالحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        const conn = await getConnectionOr404(parsed.data.connection_id);
        if (!conn) {
          return res.status(404).json({ message: "الاتصال غير موجود" });
        }
        const [row] = await db
          .insert(external_db_reports)
          .values({
            ...parsed.data,
            created_by: req.user?.id ?? null,
            updated_at: new Date(),
          })
          .returning();
        res.status(201).json(row);
      } catch (error) {
        console.error("[external-db] report create error:", error);
        res.status(500).json({ message: "خطأ في حفظ التقرير" });
      }
    },
  );

  // Update a saved report
  app.patch(
    "/api/external-db/reports/:id",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ message: "معرّف غير صالح" });
        }
        const existing = await getReportOr404(id);
        if (!existing) {
          return res.status(404).json({ message: "التقرير غير موجود" });
        }
        const parsed = reportUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صالحة",
            errors: parsed.error.flatten().fieldErrors,
          });
        }
        if (parsed.data.connection_id) {
          const conn = await getConnectionOr404(parsed.data.connection_id);
          if (!conn) {
            return res.status(404).json({ message: "الاتصال غير موجود" });
          }
        }
        const [row] = await db
          .update(external_db_reports)
          .set({ ...parsed.data, updated_at: new Date() })
          .where(eq(external_db_reports.id, id))
          .returning();
        res.json(row);
      } catch (error) {
        console.error("[external-db] report update error:", error);
        res.status(500).json({ message: "خطأ في تحديث التقرير" });
      }
    },
  );

  // Delete a saved report
  app.delete(
    "/api/external-db/reports/:id",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ message: "معرّف غير صالح" });
        }
        await db
          .delete(external_db_reports)
          .where(eq(external_db_reports.id, id));
        res.json({ success: true });
      } catch (error) {
        console.error("[external-db] report delete error:", error);
        res.status(500).json({ message: "خطأ في حذف التقرير" });
      }
    },
  );

  // Run a saved report: execute its query and return the rows + definition.
  app.post(
    "/api/external-db/reports/:id/run",
    requireAuth,
    requirePermission("manage_settings"),
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({ message: "معرّف غير صالح" });
        }
        const report = await getReportOr404(id);
        if (!report) {
          return res.status(404).json({ message: "التقرير غير موجود" });
        }
        const conn = await getConnectionOr404(report.connection_id);
        if (!conn) {
          return res.status(404).json({ message: "الاتصال غير موجود" });
        }
        const result = await runQuery(toConfig(conn), report.sql_text);
        res.json({ report, result });
      } catch (error: any) {
        res
          .status(400)
          .json({ message: error?.message || "خطأ في تنفيذ التقرير" });
      }
    },
  );
}
