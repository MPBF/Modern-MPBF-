import { Worker } from "node:worker_threads";

import type { Express, Response } from "express";
import OpenAI from "openai";
import multer from "multer";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import {
  maintenance_engineer_knowledge,
  maintenance_engineer_conversations,
  maintenance_engineer_messages,
  machine_change_log,
  maintenance_requests,
  maintenance_actions,
  preventive_maintenance_actions,
  preventive_maintenance_items,
  users,
  insertMaintenanceEngineerKnowledgeSchema,
  insertMachineChangeLogSchema,
} from "@shared/schema";
import {
  requireAuth,
  requirePermission,
  type AuthRequest,
} from "./middleware/auth";

const openai = new OpenAI({
  apiKey:
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "not-configured",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  organization: null, // prevent SDK from auto-reading OPENAI_ORG_ID env var
});

const MODEL = "gpt-5";
const MAX_TOOL_ITERATIONS = 6;
const MAX_KNOWLEDGE_CHARS = 200000; // hard cap on extracted text stored per file

const PERSONA = `أنت "مهندس الصيانة الذكي" (Smart Maintenance Engineer)، مساعد هندسي متخصص في صيانة مكائن مصنع أكياس البلاستيك (MPBF).
You are the "Smart Maintenance Engineer", an engineering assistant specialized in maintaining a plastic-bag factory's machines.
- تخصصك العميق: مكائن النفخ/البثق (extruders / film blowing)، مكائن الطباعة الفلكسوغرافية (flexographic printers)، ومكائن تقطيع الأكياس (bag cutters).
- You have deep expertise in extruders (film blowing), flexographic printers, and bag-cutting machines: their mechanics, drives, heaters, screws, dies, anilox rollers, doctor blades, sealing/cutting knives, sensors, and common faults.
- مهمتك: تشخيص الأعطال واقتراح أسباب محتملة وخطوات فحص وإصلاح، بالاعتماد على سجل صيانة الماكينة وسجل التغييرات وقاعدة المعرفة.
- Your job: diagnose faults, propose likely root causes, inspection steps, and repair guidance — grounded in the machine's maintenance history, its change log, and the fed knowledge base.
- أنت للتشخيص فقط (قراءة فقط). لا تنشئ أو تعدّل أي سجلات صيانة إنتاجية. إذا طلب المستخدم تسجيل إجراء، وضّح أنك للتشخيص فقط وأن التسجيل يتم من صفحة الصيانة.
- You are READ-ONLY (diagnosis only). You never create or modify production maintenance records. If asked to log an action, explain you only diagnose and that recording is done from the Maintenance page.
- استخدم الأدوات المتاحة لقراءة بيانات الماكينة وسجلها وقاعدة المعرفة قبل التشخيص. لا تختلق معلومات.
- Use the available read tools to look up machine data, history, and knowledge before diagnosing. Never fabricate information.`;

// ── Machine type normalization (machines.type holds mixed legacy values) ──
function normalizeMachineCategory(type?: string | null): string {
  const t = (type || "").toLowerCase().trim();
  if (/extrud|film|blow|نفخ|بثق|فيلم/.test(t)) return "extruder";
  if (/print|flexo|طباع/.test(t)) return "printer";
  if (/cut|cutter|تقطيع|قطع/.test(t)) return "cutter";
  return "general";
}

function clampLimit(n: any, def = 50, max = 200): number {
  const v = parseInt(String(n ?? def), 10);
  if (isNaN(v) || v <= 0) return def;
  return Math.min(v, max);
}

// ════════════════════════════════════════════════════════════════════════
// Read-only diagnostic tools
// ════════════════════════════════════════════════════════════════════════
interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (args: any) => Promise<any>;
}

const TOOLS: ToolDef[] = [
  {
    name: "list_machines",
    description:
      "List factory machines with id, name, normalized category (extruder/printer/cutter), raw type, and status. Use to find the machine the user is asking about.",
    parameters: { type: "object", properties: {} },
    handler: async () => {
      const list = await storage.getMachines();
      return (list as any[]).map((m) => ({
        id: m.id,
        name: m.name,
        name_ar: m.name_ar,
        category: normalizeMachineCategory(m.type),
        type: m.type,
        status: m.status,
        section_id: m.section_id,
      }));
    },
  },
  {
    name: "get_machine",
    description:
      "Get a single machine by id with its full specifications (capacities, screw type, raw material type, thickness range, inline printer, status).",
    parameters: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    handler: async (args) => {
      const m = await storage.getMachineById(String(args.id));
      if (!m) return { error: "not_found" };
      return { ...m, category: normalizeMachineCategory((m as any).type) };
    },
  },
  {
    name: "get_machine_maintenance_history",
    description:
      "Get the maintenance request + action history for a machine (faults reported, issue type, urgency, status, and the actions taken). Use this to follow what has previously gone wrong and what was done.",
    parameters: {
      type: "object",
      properties: {
        machine_id: { type: "string" },
        limit: { type: "number" },
      },
      required: ["machine_id"],
    },
    handler: async (args) => {
      const machineId = String(args.machine_id);
      const reqs = await db
        .select()
        .from(maintenance_requests)
        .where(eq(maintenance_requests.machine_id, machineId))
        .orderBy(desc(maintenance_requests.date_reported))
        .limit(clampLimit(args?.limit, 30));
      if (reqs.length === 0) return { requests: [] };
      const reqIds = reqs.map((r) => r.id);
      const acts = await db
        .select()
        .from(maintenance_actions)
        .where(inArray(maintenance_actions.maintenance_request_id, reqIds))
        .orderBy(desc(maintenance_actions.action_date));
      return {
        requests: reqs.map((r) => ({
          id: r.id,
          request_number: r.request_number,
          issue_type: r.issue_type,
          description: r.description,
          urgency_level: r.urgency_level,
          status: r.status,
          action_taken: r.action_taken,
          date_reported: r.date_reported,
          date_resolved: r.date_resolved,
          actions: acts
            .filter((a) => a.maintenance_request_id === r.id)
            .map((a) => ({
              action_number: a.action_number,
              action_type: a.action_type,
              description: a.description,
              text_report: a.text_report,
              spare_parts_request: a.spare_parts_request,
              machining_request: a.machining_request,
              action_date: a.action_date,
            })),
        })),
      };
    },
  },
  {
    name: "get_machine_change_log",
    description:
      "Get the free-form change/modification notes recorded for a machine (e.g. a part swapped, a setting changed, an upgrade). Factor these into diagnosis.",
    parameters: {
      type: "object",
      properties: {
        machine_id: { type: "string" },
        limit: { type: "number" },
      },
      required: ["machine_id"],
    },
    handler: async (args) => {
      const rows = await db
        .select({
          id: machine_change_log.id,
          note: machine_change_log.note,
          created_at: machine_change_log.created_at,
        })
        .from(machine_change_log)
        .where(eq(machine_change_log.machine_id, String(args.machine_id)))
        .orderBy(desc(machine_change_log.created_at))
        .limit(clampLimit(args?.limit, 30));
      return { changes: rows };
    },
  },
  {
    name: "list_preventive_actions",
    description:
      "List preventive maintenance actions performed on a machine, including the per-component line items (component, action type, condition). Use to see what has recently been serviced.",
    parameters: {
      type: "object",
      properties: {
        machine_id: { type: "string" },
        limit: { type: "number" },
      },
      required: ["machine_id"],
    },
    handler: async (args) => {
      const actions = await db
        .select()
        .from(preventive_maintenance_actions)
        .where(
          eq(preventive_maintenance_actions.machine_id, String(args.machine_id)),
        )
        .orderBy(desc(preventive_maintenance_actions.action_date))
        .limit(clampLimit(args?.limit, 30));
      if (actions.length === 0) return { actions: [] };
      const ids = actions.map((a) => a.id);
      const items = await db
        .select()
        .from(preventive_maintenance_items)
        .where(inArray(preventive_maintenance_items.preventive_action_id, ids));
      return {
        actions: actions.map((a) => ({
          id: a.id,
          action_number: a.action_number,
          action_date: a.action_date,
          status: a.status,
          notes: a.notes,
          items: items
            .filter((it) => it.preventive_action_id === a.id)
            .map((it) => ({
              component_name_ar: it.component_name_ar,
              component_name_en: it.component_name_en,
              action_type: it.action_type,
              condition: it.condition,
              notes: it.notes,
            })),
        })),
      };
    },
  },
  {
    name: "list_recent_faults",
    description:
      "List the most recent maintenance faults/requests across ALL machines (not a single machine). Use this to spot recurring or fleet-wide issues, or when the user asks about recent breakdowns in general without naming a machine. Each item includes the machine and its category.",
    parameters: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
    handler: async (args) => {
      const rows = await db
        .select({
          id: maintenance_requests.id,
          request_number: maintenance_requests.request_number,
          machine_id: maintenance_requests.machine_id,
          issue_type: maintenance_requests.issue_type,
          description: maintenance_requests.description,
          urgency_level: maintenance_requests.urgency_level,
          status: maintenance_requests.status,
          action_taken: maintenance_requests.action_taken,
          date_reported: maintenance_requests.date_reported,
          date_resolved: maintenance_requests.date_resolved,
        })
        .from(maintenance_requests)
        .orderBy(desc(maintenance_requests.date_reported))
        .limit(clampLimit(args?.limit, 25, 60));
      const machines = (await storage.getMachines()) as any[];
      const byId = new Map(machines.map((m) => [String(m.id), m]));
      return {
        faults: rows.map((r) => {
          const m = r.machine_id ? byId.get(String(r.machine_id)) : undefined;
          return {
            ...r,
            machine_name: m?.name ?? null,
            machine_name_ar: m?.name_ar ?? null,
            machine_category: m ? normalizeMachineCategory(m.type) : null,
          };
        }),
      };
    },
  },
  {
    name: "search_maintenance_knowledge",
    description:
      "Search the fed knowledge base (uploaded catalogs/manuals and notes) for relevant content. Optionally filter by machine_category (extruder/printer/cutter/general). Returns matching titles and content excerpts.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        machine_category: {
          type: "string",
          enum: ["extruder", "printer", "cutter", "general"],
        },
        limit: { type: "number" },
      },
      required: ["query"],
    },
    handler: async (args) => {
      const q = (args?.query || "").toString().trim();
      const conds: any[] = [eq(maintenance_engineer_knowledge.enabled, true)];
      if (q) {
        conds.push(
          or(
            ilike(maintenance_engineer_knowledge.title, `%${q}%`),
            ilike(maintenance_engineer_knowledge.content, `%${q}%`),
          ),
        );
      }
      if (
        args?.machine_category &&
        args.machine_category !== "general" &&
        ["extruder", "printer", "cutter"].includes(args.machine_category)
      ) {
        conds.push(
          or(
            eq(
              maintenance_engineer_knowledge.machine_category,
              args.machine_category,
            ),
            eq(maintenance_engineer_knowledge.machine_category, "general"),
          ),
        );
      }
      const rows = await db
        .select()
        .from(maintenance_engineer_knowledge)
        .where(and(...conds))
        .orderBy(desc(maintenance_engineer_knowledge.id))
        .limit(clampLimit(args?.limit, 8, 20));
      return {
        results: rows.map((r) => ({
          title: r.title,
          machine_category: r.machine_category,
          // Cap excerpt so a single huge document can't blow the context window.
          excerpt: (r.content || "").slice(0, 6000),
        })),
      };
    },
  },
];

const TOOL_MAP: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.map((t) => [t.name, t]),
);

function buildOpenAiTools() {
  return TOOLS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

async function buildSystemPrompt(): Promise<string> {
  const parts: string[] = [];
  parts.push(
    "# CRITICAL INSTRUCTIONS — MUST FOLLOW STRICTLY\n" +
      "1. LANGUAGE: Detect the user's language and ALWAYS reply in that exact same language — Arabic (العربية, right-to-left) if they wrote Arabic, English if they wrote English. Never mix languages.\n" +
      "2. SCOPE: You are READ-ONLY. You diagnose machine faults; you NEVER create or modify production maintenance records.\n" +
      "3. ACCURACY: Use the read tools to ground your answers in real machine data, history, change log, and the knowledge base. Never fabricate model numbers, specs, or history.\n" +
      "4. ARABIC TEXT FORMAT: Write Arabic in standard Unicode logical order (right-to-left). Never reverse or reorder characters.",
  );
  parts.push("\n# Identity & Persona\n" + PERSONA);
  parts.push(
    "\n# Diagnostic Method\n" +
      "When diagnosing: (1) identify the machine and its category, (2) review its maintenance history and change log, (3) consult the knowledge base for the relevant machine category, (4) present likely root causes ranked by probability with concrete inspection/repair steps, and (5) note any safety precautions. If information is missing, say what additional checks the technician should perform. When the user asks about recent breakdowns in general (without naming a machine) or you suspect a recurring/fleet-wide problem, use list_recent_faults to review faults across all machines.",
  );
  return parts.join("\n");
}

// ════════════════════════════════════════════════════════════════════════
// Text extraction from uploaded files
// ════════════════════════════════════════════════════════════════════════
// Hard cap on how long a single file is allowed to occupy parsing. CPU-heavy
// parsers (pdf-parse, mammoth) run on the main event loop, so a malformed or
// adversarial file must not be able to block the server indefinitely.
const EXTRACT_TIMEOUT_MS = 30_000;

class ExtractTimeoutError extends Error {
  constructor() {
    super("extract_timeout");
    this.name = "ExtractTimeoutError";
  }
}

// CPU-heavy parsing (pdf-parse, mammoth) runs on a dedicated worker thread so a
// large or adversarial file can't block the main event loop and stall every
// other request while it's being parsed. The worker is self-contained inline
// source (eval) so it ships correctly in both dev (tsx) and the bundled prod
// build without needing a separate worker file copied next to the entrypoint.
const EXTRACT_WORKER_SOURCE = `
(async () => {
  const { parentPort, workerData } = await import("node:worker_threads");
  try {
    const buffer = Buffer.from(workerData.buffer);
    const kind = workerData.kind;
    let text = "";
    if (kind === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        text = (result.text || "").trim();
      } finally {
        await parser.destroy().catch(() => {});
      }
    } else if (kind === "docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = (result.value || "").trim();
    } else {
      throw new Error("unsupported_file_type");
    }
    parentPort.postMessage({ ok: true, text });
  } catch (err) {
    parentPort.postMessage({
      ok: false,
      error: (err && err.message) || "extract_failed",
    });
  }
})();
`;

// Run a parse on a worker thread, bounded by EXTRACT_TIMEOUT_MS. On timeout the
// worker is terminated (freeing the parser and any native resources) and an
// ExtractTimeoutError is thrown so the caller returns the Arabic timeout error.
function extractInWorker(
  buffer: Buffer,
  kind: "pdf" | "docx",
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Copy into a standalone ArrayBuffer and transfer it to avoid a structured
    // clone copy of up to 15MB on the main thread.
    const ab = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );
    const worker = new Worker(EXTRACT_WORKER_SOURCE, {
      eval: true,
      workerData: { buffer: ab, kind },
      transferList: [ab],
    });

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate().catch(() => {});
      fn();
    };

    const timer = setTimeout(() => {
      finish(() => reject(new ExtractTimeoutError()));
    }, EXTRACT_TIMEOUT_MS);

    worker.on("message", (msg: { ok: boolean; text?: string; error?: string }) => {
      if (msg?.ok) {
        finish(() => resolve(msg.text || ""));
      } else {
        finish(() => reject(new Error(msg?.error || "extract_failed")));
      }
    });
    worker.on("error", (err) => {
      finish(() => reject(err));
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        finish(() => reject(new Error("extract_worker_exited")));
      }
    });
  });
}

async function extractText(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const lower = (fileName || "").toLowerCase();
  const isPdf = mimeType === "application/pdf" || lower.endsWith(".pdf");
  const isDocx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx");
  const isText =
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".csv");

  // Heavy parsers run off the main event loop on a worker thread.
  if (isPdf) {
    return extractInWorker(buffer, "pdf");
  }
  if (isDocx) {
    return extractInWorker(buffer, "docx");
  }
  // Plain text is a cheap synchronous decode; no worker needed.
  if (isText) {
    return buffer.toString("utf-8").trim();
  }
  throw new Error("unsupported_file_type");
}

const ALLOWED_UPLOAD_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
]);
const ALLOWED_UPLOAD_EXTS = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".csv",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 }, // 15MB, single file
  fileFilter: (_req, file, cb) => {
    const lower = (file.originalname || "").toLowerCase();
    const okExt = ALLOWED_UPLOAD_EXTS.some((e) => lower.endsWith(e));
    const okMime =
      ALLOWED_UPLOAD_MIMES.has(file.mimetype) ||
      file.mimetype.startsWith("text/");
    if (okExt && okMime) return cb(null, true);
    cb(new Error("unsupported_file_type"));
  },
});

// ── Per-user upload rate limiting ──
// Parsing manuals is CPU-heavy and runs on the main event loop. Even though the
// route is gated to manage_maintenance users, a privileged (or compromised)
// session must not be able to hammer the parser. Cap uploads per user per window.
const UPLOAD_RATE_WINDOW_MS = 60_000;
const MAX_UPLOADS_PER_WINDOW = 5;
const uploadAttempts = new Map<string, { count: number; windowStart: number }>();

// Returns true if the upload is allowed; mutates the per-user counter as a side
// effect. Counts every accepted attempt within the rolling window.
function allowUpload(userIdRaw: string | number): boolean {
  const userId = String(userIdRaw);
  const now = Date.now();
  const entry = uploadAttempts.get(userId);
  if (!entry || now - entry.windowStart > UPLOAD_RATE_WINDOW_MS) {
    uploadAttempts.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_UPLOADS_PER_WINDOW) return false;
  entry.count++;
  return true;
}

// Periodically evict stale entries so the map can't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of uploadAttempts) {
    if (now - entry.windowStart > UPLOAD_RATE_WINDOW_MS) {
      uploadAttempts.delete(key);
    }
  }
}, UPLOAD_RATE_WINDOW_MS).unref?.();

export function registerMaintenanceEngineerRoutes(app: Express): void {
  // ───────────────────────── chat (diagnosis) ─────────────────────────
  app.post(
    "/api/maintenance-engineer/chat",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      try {
        const message = (req.body?.message || "").toString().trim();
        if (!message) return res.status(400).json({ error: "message required" });
        if (message.length > 8000)
          return res.status(400).json({ error: "الرسالة طويلة جداً" });

        const userId = req.user!.id;

        // conversation
        let conversationId = req.body?.conversationId
          ? Number(req.body.conversationId)
          : null;
        if (conversationId) {
          const conv = await db
            .select()
            .from(maintenance_engineer_conversations)
            .where(eq(maintenance_engineer_conversations.id, conversationId));
          if (!conv[0] || conv[0].user_id !== userId) {
            return res.status(404).json({ error: "conversation not found" });
          }
        } else {
          const created = await db
            .insert(maintenance_engineer_conversations)
            .values({ user_id: userId, title: message.slice(0, 60) })
            .returning();
          conversationId = created[0].id;
        }

        // history
        const history = await db
          .select()
          .from(maintenance_engineer_messages)
          .where(eq(maintenance_engineer_messages.conversation_id, conversationId))
          .orderBy(desc(maintenance_engineer_messages.id))
          .limit(20);
        history.reverse();

        const systemPrompt = await buildSystemPrompt();
        const messages: any[] = [{ role: "system", content: systemPrompt }];
        for (const m of history) {
          messages.push({ role: m.role, content: m.content });
        }
        messages.push({ role: "user", content: message });

        // persist user message
        await db.insert(maintenance_engineer_messages).values({
          conversation_id: conversationId,
          role: "user",
          content: message,
        });

        const tools = buildOpenAiTools();
        const toolsUsed: string[] = [];
        let finalText = "";

        for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
          const completion = await openai.chat.completions.create({
            model: MODEL,
            messages,
            tools,
          });
          const choice = completion.choices[0];
          const msg = choice.message;
          messages.push(msg as any);

          if (msg.tool_calls && msg.tool_calls.length) {
            for (const call of msg.tool_calls) {
              if (call.type !== "function") {
                messages.push({
                  role: "tool",
                  tool_call_id: call.id,
                  content: JSON.stringify({ error: "unsupported_tool_call" }),
                });
                continue;
              }
              const tool = TOOL_MAP[call.function.name];
              let result: any;
              if (!tool) {
                result = { error: "tool_not_available" };
              } else {
                try {
                  const args = call.function.arguments
                    ? JSON.parse(call.function.arguments)
                    : {};
                  result = await tool.handler(args);
                  toolsUsed.push(tool.name);
                } catch (err: any) {
                  result = { error: "tool_failed", detail: err?.message };
                }
              }
              messages.push({
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify(result),
              });
            }
            continue;
          }

          finalText = msg.content || "";
          break;
        }

        if (!finalText) {
          finalText = "عذراً، لم أتمكن من إكمال الطلب. يرجى المحاولة مرة أخرى.";
        }

        const metadata = { toolsUsed: Array.from(new Set(toolsUsed)) };
        await db.insert(maintenance_engineer_messages).values({
          conversation_id: conversationId,
          role: "assistant",
          content: finalText,
          metadata,
        });
        await db
          .update(maintenance_engineer_conversations)
          .set({ updated_at: new Date() })
          .where(eq(maintenance_engineer_conversations.id, conversationId));

        res.json({
          conversationId,
          reply: finalText,
          toolsUsed: metadata.toolsUsed,
        });
      } catch (err: any) {
        console.error("[maintenance-engineer] chat error:", err?.message);
        res.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب" });
      }
    },
  );

  // ───────────────────────── conversations ─────────────────────────
  app.get(
    "/api/maintenance-engineer/conversations",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const rows = await db
        .select()
        .from(maintenance_engineer_conversations)
        .where(eq(maintenance_engineer_conversations.user_id, req.user!.id))
        .orderBy(desc(maintenance_engineer_conversations.updated_at))
        .limit(100);
      res.json(rows);
    },
  );

  app.get(
    "/api/maintenance-engineer/conversations/:id/messages",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const id = Number(req.params.id);
      const conv = await db
        .select()
        .from(maintenance_engineer_conversations)
        .where(eq(maintenance_engineer_conversations.id, id));
      if (!conv[0] || conv[0].user_id !== req.user!.id) {
        return res.status(404).json({ error: "not found" });
      }
      const rows = await db
        .select()
        .from(maintenance_engineer_messages)
        .where(eq(maintenance_engineer_messages.conversation_id, id))
        .orderBy(maintenance_engineer_messages.id);
      res.json(rows);
    },
  );

  app.delete(
    "/api/maintenance-engineer/conversations/:id",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const id = Number(req.params.id);
      const conv = await db
        .select()
        .from(maintenance_engineer_conversations)
        .where(eq(maintenance_engineer_conversations.id, id));
      if (!conv[0] || conv[0].user_id !== req.user!.id) {
        return res.status(404).json({ error: "not found" });
      }
      await db
        .delete(maintenance_engineer_messages)
        .where(eq(maintenance_engineer_messages.conversation_id, id));
      await db
        .delete(maintenance_engineer_conversations)
        .where(eq(maintenance_engineer_conversations.id, id));
      res.json({ ok: true });
    },
  );

  // ───────────────────────── knowledge base ─────────────────────────
  app.get(
    "/api/maintenance-engineer/knowledge",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (_req: AuthRequest, res: Response) => {
      const rows = await db
        .select({
          id: maintenance_engineer_knowledge.id,
          title: maintenance_engineer_knowledge.title,
          machine_category: maintenance_engineer_knowledge.machine_category,
          source_type: maintenance_engineer_knowledge.source_type,
          file_name: maintenance_engineer_knowledge.file_name,
          enabled: maintenance_engineer_knowledge.enabled,
          content_length: sql<number>`length(${maintenance_engineer_knowledge.content})`,
          created_at: maintenance_engineer_knowledge.created_at,
        })
        .from(maintenance_engineer_knowledge)
        .orderBy(desc(maintenance_engineer_knowledge.id));
      res.json(rows);
    },
  );

  // Manual text knowledge entry
  app.post(
    "/api/maintenance-engineer/knowledge",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const parsed = insertMaintenanceEngineerKnowledgeSchema.safeParse({
        ...req.body,
        source_type: "manual",
        created_by: req.user!.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }
      const created = await db
        .insert(maintenance_engineer_knowledge)
        .values(parsed.data)
        .returning();
      res.json(created[0]);
    },
  );

  // File upload (PDF / Word / text) with extraction
  app.post(
    "/api/maintenance-engineer/knowledge/upload",
    requireAuth,
    requirePermission("manage_maintenance"),
    (req: AuthRequest, res: Response, next) => {
      // Rate-limit per user BEFORE buffering/parsing the file, so a flood of
      // large uploads can't even reach the CPU-heavy parser.
      if (!allowUpload(req.user!.id)) {
        return res.status(429).json({
          error:
            "لقد تجاوزت الحد المسموح من عمليات الرفع. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.",
        });
      }
      next();
    },
    (req: AuthRequest, res: Response, next) => {
      upload.single("file")(req as any, res as any, (err: any) => {
        if (err) {
          const msg =
            err?.message === "unsupported_file_type"
              ? "نوع الملف غير مدعوم. يُسمح بملفات PDF و Word و النصوص فقط."
              : err?.code === "LIMIT_FILE_SIZE"
                ? "حجم الملف كبير جداً (الحد الأقصى 15 ميجابايت)"
                : "تعذّر رفع الملف";
          return res.status(400).json({ error: msg });
        }
        next();
      });
    },
    async (req: AuthRequest, res: Response) => {
      try {
        const file = (req as any).file;
        if (!file) return res.status(400).json({ error: "file required" });
        const category = (req.body?.machine_category || "general").toString();
        const validCat = ["extruder", "printer", "cutter", "general"].includes(
          category,
        )
          ? category
          : "general";
        const title =
          (req.body?.title || "").toString().trim() ||
          file.originalname ||
          "ملف";

        let text: string;
        try {
          text = await extractText(
            file.buffer,
            file.originalname,
            file.mimetype,
          );
        } catch (e: any) {
          if (e?.message === "unsupported_file_type") {
            return res.status(400).json({
              error:
                "نوع الملف غير مدعوم. يُسمح بملفات PDF و Word و النصوص فقط.",
            });
          }
          if (e instanceof ExtractTimeoutError) {
            return res.status(422).json({
              error:
                "استغرق تحليل الملف وقتاً طويلاً جداً. قد يكون الملف كبيراً أو تالفاً. يرجى تجربة ملف أصغر أو أبسط.",
            });
          }
          return res
            .status(400)
            .json({ error: "تعذّر استخراج النص من الملف" });
        }

        if (!text || text.length < 2) {
          return res.status(400).json({
            error: "لم يتم العثور على نص قابل للاستخراج في الملف",
          });
        }

        const created = await db
          .insert(maintenance_engineer_knowledge)
          .values({
            title,
            content: text.slice(0, MAX_KNOWLEDGE_CHARS),
            machine_category: validCat,
            source_type: "upload",
            file_name: file.originalname,
            created_by: req.user!.id,
          })
          .returning();
        res.json({
          id: created[0].id,
          title: created[0].title,
          machine_category: created[0].machine_category,
          file_name: created[0].file_name,
          content_length: text.length,
        });
      } catch (err: any) {
        console.error("[maintenance-engineer] upload error:", err?.message);
        res.status(500).json({ error: "حدث خطأ أثناء رفع الملف" });
      }
    },
  );

  app.put(
    "/api/maintenance-engineer/knowledge/:id",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const id = Number(req.params.id);
      const parsed = insertMaintenanceEngineerKnowledgeSchema
        .partial()
        .safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }
      const updated = await db
        .update(maintenance_engineer_knowledge)
        .set({ ...parsed.data, updated_at: new Date() })
        .where(eq(maintenance_engineer_knowledge.id, id))
        .returning();
      if (!updated[0]) return res.status(404).json({ error: "not found" });
      res.json(updated[0]);
    },
  );

  app.delete(
    "/api/maintenance-engineer/knowledge/:id",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const id = Number(req.params.id);
      await db
        .delete(maintenance_engineer_knowledge)
        .where(eq(maintenance_engineer_knowledge.id, id));
      res.json({ ok: true });
    },
  );

  // ───────────────────────── machine change log ─────────────────────────
  app.get(
    "/api/maintenance-engineer/change-log",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const machineId = req.query.machine_id
        ? String(req.query.machine_id)
        : null;
      const rows = await db
        .select({
          id: machine_change_log.id,
          machine_id: machine_change_log.machine_id,
          note: machine_change_log.note,
          changed_by: machine_change_log.changed_by,
          changed_by_name: users.display_name_ar,
          created_at: machine_change_log.created_at,
        })
        .from(machine_change_log)
        .leftJoin(users, eq(users.id, machine_change_log.changed_by))
        .where(
          machineId
            ? eq(machine_change_log.machine_id, machineId)
            : sql`true`,
        )
        .orderBy(desc(machine_change_log.created_at))
        .limit(200);
      res.json(rows);
    },
  );

  app.post(
    "/api/maintenance-engineer/change-log",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const parsed = insertMachineChangeLogSchema.safeParse({
        machine_id: req.body?.machine_id,
        note: req.body?.note,
        changed_by: req.user!.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }
      if (!parsed.data.note || !parsed.data.note.trim()) {
        return res.status(400).json({ error: "note required" });
      }
      const created = await db
        .insert(machine_change_log)
        .values(parsed.data)
        .returning();
      res.json(created[0]);
    },
  );

  app.delete(
    "/api/maintenance-engineer/change-log/:id",
    requireAuth,
    requirePermission("manage_maintenance"),
    async (req: AuthRequest, res: Response) => {
      const id = Number(req.params.id);
      await db.delete(machine_change_log).where(eq(machine_change_log.id, id));
      res.json({ ok: true });
    },
  );

  // ───────────────────────── machines (selector helper) ─────────────────────────
  app.get(
    "/api/maintenance-engineer/machines",
    requireAuth,
    requirePermission("view_maintenance", "manage_maintenance"),
    async (_req: AuthRequest, res: Response) => {
      const list = await storage.getMachines();
      res.json(
        (list as any[]).map((m) => ({
          id: m.id,
          name: m.name,
          name_ar: m.name_ar,
          category: normalizeMachineCategory(m.type),
          status: m.status,
        })),
      );
    },
  );
}
