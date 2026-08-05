import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import { users } from "@shared/schema";
import { hasPermission, type PermissionKey } from "@shared/permissions";
import { calculateProductionQuantities } from "@shared/quantity-utils";
import {
  generateAgentPdf,
  generateAgentWord,
  type AgentDocSpec,
} from "./documents";
import { loadLetterhead } from "./letterhead";

export interface ToolContext {
  userId: number;
  userPermissions: string[];
  privateKnowledge?: string[];
}

export function normalizeForMatch(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
}

// Deterministic guardrail: detect verbatim/near-verbatim disclosure of private
// knowledge in any user-visible text (assistant replies or generated documents).
export function detectPrivateLeak(
  text: string,
  privateContents: string[],
): boolean {
  const norm = normalizeForMatch(text);
  if (!norm) return false;
  for (const raw of privateContents) {
    const content = normalizeForMatch(raw);
    if (!content) continue;
    const win = Math.min(60, content.length);
    const step = 20;
    for (let i = 0; i + win <= content.length; i += step) {
      if (norm.includes(content.slice(i, i + win))) return true;
    }
    // Always check the trailing window so the tail is never skipped by the step.
    if (norm.includes(content.slice(-win))) return true;
  }
  return false;
}

export interface GeneratedDocument {
  fileName: string;
  type: "pdf" | "word";
  title: string;
  downloadUrl: string;
}

export interface ToolDefinition {
  name: string;
  kind: "read" | "write";
  permission?: PermissionKey;
  description: string;
  parameters: Record<string, any>;
  handler: (
    args: any,
    ctx: ToolContext,
    sink: { documents: GeneratedDocument[] },
  ) => Promise<any>;
}

const LIMIT = 50;

function clampLimit(n: any): number {
  const v = parseInt(String(n ?? LIMIT), 10);
  if (isNaN(v) || v <= 0) return LIMIT;
  return Math.min(v, 200);
}

export const TOOL_REGISTRY: ToolDefinition[] = [
  // ---------------- READ TOOLS ----------------
  {
    name: "list_customers",
    kind: "read",
    permission: "view_orders",
    description:
      "List customers (id, name, name_ar, phone). Optional search by name.",
    parameters: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional name filter" },
        limit: { type: "number" },
      },
    },
    handler: async (args) => {
      const list = await storage.getCustomers();
      const search = (args?.search || "").toString().toLowerCase();
      const filtered = search
        ? list.filter((c: any) =>
            `${c.name || ""} ${c.name_ar || ""}`
              .toLowerCase()
              .includes(search),
          )
        : list;
      return filtered.slice(0, clampLimit(args?.limit)).map((c: any) => ({
        id: c.id,
        name: c.name,
        name_ar: c.name_ar,
        phone: c.phone,
        city: c.city,
      }));
    },
  },
  {
    name: "get_customer",
    kind: "read",
    permission: "view_orders",
    description: "Get a single customer by id.",
    parameters: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    handler: async (args) => {
      const c = await storage.getCustomerById(args.id);
      if (!c) return { error: "not_found" };
      return c;
    },
  },
  {
    name: "list_machines",
    kind: "read",
    permission: "view_production",
    description: "List machines with their section and type.",
    parameters: { type: "object", properties: {} },
    handler: async () => {
      const list = await storage.getMachines();
      return list.map((m: any) => ({
        id: m.id,
        name: m.name,
        name_ar: m.name_ar,
        type: m.type,
        section_id: m.section_id,
        status: m.status,
      }));
    },
  },
  {
    name: "get_machine",
    kind: "read",
    permission: "view_production",
    description:
      "Get a single machine by id with its full specifications and measurements (capacities by size, screw type, raw material type, supported thickness range, inline printer, status).",
    parameters: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    handler: async (args) => {
      const m = await storage.getMachineById(args.id);
      if (!m) return { error: "not_found" };
      return {
        id: m.id,
        name: m.name,
        name_ar: m.name_ar,
        type: m.type,
        section_id: m.section_id,
        status: m.status,
        capacity_small_kg_per_hour: m.capacity_small_kg_per_hour,
        capacity_medium_kg_per_hour: m.capacity_medium_kg_per_hour,
        capacity_large_kg_per_hour: m.capacity_large_kg_per_hour,
        screw_type: m.screw_type,
        raw_material_type: m.raw_material_type,
        min_thickness: m.min_thickness,
        max_thickness: m.max_thickness,
        inline_printer_id: m.inline_printer_id,
      };
    },
  },
  {
    name: "list_production_queues",
    kind: "read",
    permission: "view_production",
    description:
      "List the production queue across all machines (each item: machine_id, queue_position, production_order_id and related fields). Use to answer questions about what is queued and in what order.",
    parameters: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
    handler: async (args) => {
      const list = await storage.getMachineQueues();
      return (list as any[]).slice(0, clampLimit(args?.limit));
    },
  },
  {
    name: "list_customer_products",
    kind: "read",
    permission: "view_orders",
    description: "List customer product specifications. Optional customer_id.",
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "string" },
        limit: { type: "number" },
      },
    },
    handler: async (args) => {
      const list = await storage.getCustomerProducts(
        args?.customer_id ? { customer_id: args.customer_id } : undefined,
      );
      return (list as any[]).slice(0, clampLimit(args?.limit));
    },
  },
  {
    name: "list_orders",
    kind: "read",
    permission: "view_orders",
    description: "List recent orders (most recent first).",
    parameters: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
    handler: async (args) => {
      return await storage.getAllOrders({ limit: clampLimit(args?.limit) });
    },
  },
  {
    name: "get_order",
    kind: "read",
    permission: "view_orders",
    description: "Get a single order by numeric id.",
    parameters: {
      type: "object",
      properties: { id: { type: "number" } },
      required: ["id"],
    },
    handler: async (args) => {
      const o = await storage.getOrderById(Number(args.id));
      if (!o) return { error: "not_found" };
      return o;
    },
  },
  {
    name: "list_production_orders",
    kind: "read",
    permission: "view_production",
    description:
      "List production orders. Optional filters: order_id, customer_id, production_stage (film|printing|cutting|done).",
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "number" },
        customer_id: { type: "string" },
        production_stage: { type: "string" },
        limit: { type: "number" },
      },
    },
    handler: async (args) => {
      const list = await storage.getAllProductionOrders({
        order_id: args?.order_id ? Number(args.order_id) : undefined,
        customer_id: args?.customer_id,
        production_stage: args?.production_stage,
        limit: clampLimit(args?.limit),
      });
      return list;
    },
  },
  {
    name: "get_production_order",
    kind: "read",
    permission: "view_production",
    description: "Get a single production order by id.",
    parameters: {
      type: "object",
      properties: { id: { type: "number" } },
      required: ["id"],
    },
    handler: async (args) => {
      const po = await storage.getProductionOrderById(Number(args.id));
      if (!po) return { error: "not_found" };
      return po;
    },
  },
  {
    name: "list_rolls",
    kind: "read",
    permission: "view_production",
    description: "List production rolls (most recent).",
    parameters: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
    handler: async (args) => {
      const list = await storage.getRolls();
      return (list as any[]).slice(0, clampLimit(args?.limit));
    },
  },
  {
    name: "list_users",
    kind: "read",
    permission: "manage_users",
    description: "List system users (safe fields only, no credentials).",
    parameters: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
    handler: async (args) => {
      const rows = await db
        .select({
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          display_name_ar: users.display_name_ar,
          role_id: users.role_id,
          status: users.status,
        })
        .from(users)
        .limit(clampLimit(args?.limit));
      return rows;
    },
  },
  {
    name: "list_sections",
    kind: "read",
    permission: "view_production",
    description: "List factory sections.",
    parameters: { type: "object", properties: {} },
    handler: async () => await storage.getSections(),
  },
  {
    name: "list_items",
    kind: "read",
    permission: "view_orders",
    description: "List catalog items/products.",
    parameters: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
    handler: async (args) => {
      const list = await storage.getItems();
      return (list as any[]).slice(0, clampLimit(args?.limit));
    },
  },

  // ---------------- WRITE TOOLS ----------------
  {
    name: "create_customer",
    kind: "write",
    permission: "manage_customers",
    description:
      "Create a new customer. Provide at least name and/or name_ar. Optional: phone, city, address, sales_rep_id.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        name_ar: { type: "string" },
        phone: { type: "string" },
        city: { type: "string" },
        address: { type: "string" },
      },
    },
    handler: async (args) => {
      if (!args?.name && !args?.name_ar) {
        return { error: "name_required" };
      }
      const created = await storage.createCustomer({
        name: args.name,
        name_ar: args.name_ar,
        phone: args.phone,
        city: args.city,
        address: args.address,
      });
      return { ok: true, customer: created };
    },
  },
  {
    name: "update_customer",
    kind: "write",
    permission: "manage_customers",
    description:
      "Update an existing customer by id. Provide the fields to change.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        name_ar: { type: "string" },
        phone: { type: "string" },
        city: { type: "string" },
        address: { type: "string" },
      },
      required: ["id"],
    },
    handler: async (args) => {
      const { id, ...rest } = args || {};
      if (!id) return { error: "id_required" };
      const updates: Record<string, any> = {};
      for (const k of ["name", "name_ar", "phone", "city", "address"]) {
        if (rest[k] !== undefined) updates[k] = rest[k];
      }
      if (Object.keys(updates).length === 0) {
        return { error: "no_fields" };
      }
      const updated = await storage.updateCustomer(id, updates);
      return { ok: true, customer: updated };
    },
  },

  {
    name: "create_order",
    kind: "write",
    permission: "manage_orders",
    description:
      "Create a new customer order. Requires customer_id. Optional: delivery_days (>0), delivery_date (YYYY-MM-DD, today or later), notes. The order number is generated automatically.",
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "string" },
        delivery_days: { type: "number" },
        delivery_date: { type: "string" },
        notes: { type: "string" },
      },
      required: ["customer_id"],
    },
    handler: async (args, ctx) => {
      if (!args?.customer_id) return { error: "customer_id_required" };
      // Generate a unique order_number with retry-on-collision, mirroring the
      // /api/orders route so concurrent calls never produce duplicate numbers.
      let lastErr: any = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const result = await db.execute(
          sql`SELECT MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)) as max_num
              FROM orders WHERE order_number ~ '^ORD[0-9]+$'`,
        );
        const maxNum = (result as any).rows?.[0]?.max_num || 0;
        const order_number = `ORD${(maxNum + 1 + attempt)
          .toString()
          .padStart(3, "0")}`;
        try {
          const created = await storage.createOrder({
            order_number,
            customer_id: args.customer_id,
            delivery_days: args.delivery_days ?? undefined,
            delivery_date: args.delivery_date ?? undefined,
            notes: args.notes ?? undefined,
            created_by: ctx.userId,
          } as any);
          return { ok: true, order: created };
        } catch (e: any) {
          // 23505 = unique_violation (order_number collision); retry with next.
          const code = e?.code || e?.cause?.code;
          const dup =
            code === "23505" ||
            /duplicate key|unique/i.test(e?.message || "");
          if (!dup) throw e;
          lastErr = e;
        }
      }
      return { error: "order_number_conflict", detail: lastErr?.message };
    },
  },
  {
    name: "update_order",
    kind: "write",
    permission: "manage_orders",
    description:
      "Update an existing order by numeric id. Provide the fields to change: status, notes, delivery_days, delivery_date.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "number" },
        status: { type: "string" },
        notes: { type: "string" },
        delivery_days: { type: "number" },
        delivery_date: { type: "string" },
      },
      required: ["id"],
    },
    handler: async (args) => {
      const id = Number(args?.id);
      if (!id) return { error: "id_required" };
      const updates: Record<string, any> = {};
      for (const k of ["status", "notes", "delivery_days", "delivery_date"]) {
        if (args[k] !== undefined) updates[k] = args[k];
      }
      if (Object.keys(updates).length === 0) return { error: "no_fields" };
      const updated = await storage.updateOrder(id, updates);
      return { ok: true, order: updated };
    },
  },
  {
    name: "create_production_order",
    kind: "write",
    permission: "manage_production",
    description:
      "Create a production order under an existing order. Requires order_id, customer_product_id, quantity_kg. The final quantity and overrun percentage are calculated automatically from the product's punching type (factory standards) — do not provide them. The production order number is generated automatically.",
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "number" },
        customer_product_id: { type: "number" },
        quantity_kg: { type: "number" },
      },
      required: ["order_id", "customer_product_id", "quantity_kg"],
    },
    handler: async (args) => {
      if (!args?.order_id || !args?.customer_product_id) {
        return { error: "order_id_and_customer_product_id_required" };
      }
      const baseQuantityKg = Number(args.quantity_kg);
      if (!Number.isFinite(baseQuantityKg) || baseQuantityKg <= 0) {
        return { error: "quantity_kg_must_be_positive" };
      }
      // Mirror the standard /api/production-orders route: derive final quantity
      // and overrun from the product's punching type using factory standards.
      // Never trust an AI-provided final quantity or overrun.
      const customerProduct = await storage.getCustomerProductById(
        Number(args.customer_product_id),
      );
      if (!customerProduct) {
        return { error: "customer_product_not_found" };
      }
      const quantityCalculation = calculateProductionQuantities(
        baseQuantityKg,
        customerProduct.punching,
      );
      const created = await storage.createProductionOrder(
        {
          order_id: Number(args.order_id),
          customer_product_id: Number(args.customer_product_id),
          quantity_kg: String(baseQuantityKg),
          final_quantity_kg: String(quantityCalculation.finalQuantityKg),
          overrun_percentage: String(quantityCalculation.overrunPercentage),
        } as any,
        { final_quantity_kg: quantityCalculation.finalQuantityKg },
      );
      return { ok: true, production_order: created };
    },
  },
  {
    name: "update_production_order",
    kind: "write",
    permission: "manage_production",
    description:
      "Update a production order by numeric id. Provide the fields to change, e.g. quantity_kg, final_quantity_kg, overrun_percentage, assigned_machine_id, assigned_operator_id, status.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "number" },
        quantity_kg: { type: "number" },
        final_quantity_kg: { type: "number" },
        overrun_percentage: { type: "number" },
        assigned_machine_id: { type: "string" },
        assigned_operator_id: { type: "number" },
        status: { type: "string" },
      },
      required: ["id"],
    },
    handler: async (args) => {
      const id = Number(args?.id);
      if (!id) return { error: "id_required" };
      const updates: Record<string, any> = {};
      for (const k of ["quantity_kg", "final_quantity_kg", "overrun_percentage"]) {
        if (args[k] !== undefined) updates[k] = String(args[k]);
      }
      for (const k of ["assigned_machine_id", "assigned_operator_id", "status"]) {
        if (args[k] !== undefined) updates[k] = args[k];
      }
      if (Object.keys(updates).length === 0) return { error: "no_fields" };
      const updated = await storage.updateProductionOrder(id, updates);
      return { ok: true, production_order: updated };
    },
  },

  // ---------------- DOCUMENT TOOL ----------------
  {
    name: "generate_document",
    kind: "write",
    permission: "view_reports",
    description:
      "Generate a downloadable document (PDF and/or Word) in Arabic or English. Use 'language':'ar' for Arabic. IMPORTANT: All Arabic text content must be written in standard Unicode logical order (do NOT reverse or reorder characters — the PDF renderer handles that automatically).",
    parameters: {
      type: "object",
      properties: {
        format: {
          type: "string",
          enum: ["pdf", "word", "both"],
          description: "Output format",
        },
        language: { type: "string", enum: ["ar", "en"] },
        title: { type: "string" },
        intro: { type: "string" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              heading: { type: "string" },
              body: { type: "string" },
            },
          },
        },
        table: {
          type: "object",
          properties: {
            headers: { type: "array", items: { type: "string" } },
            rows: {
              type: "array",
              items: { type: "array", items: { type: "string" } },
            },
          },
        },
        footer: { type: "string" },
      },
      required: ["title", "format"],
    },
    handler: async (args, ctx, sink) => {
      const spec: AgentDocSpec = {
        title: args.title,
        language: args.language === "ar" ? "ar" : "en",
        intro: args.intro,
        sections: args.sections,
        table: args.table,
        footer: args.footer,
        ownerId: ctx.userId,
      };
      // Guardrail: never let private knowledge be exfiltrated via a document.
      if (ctx.privateKnowledge?.length) {
        const combined = [
          spec.title,
          spec.intro,
          ...(spec.sections || []).flatMap((s) => [s.heading, s.body]),
          ...(spec.table?.headers || []),
          ...(spec.table?.rows || []).flat(),
          spec.footer,
        ]
          .filter(Boolean)
          .join("\n");
        if (detectPrivateLeak(combined, ctx.privateKnowledge)) {
          return { error: "private_content_blocked" };
        }
      }
      const format = args.format || "pdf";
      // Attach the company letterhead (header/footer/logo/signatures)
      // configured in Settings → ترويسة الخطابات والمستندات.
      try {
        spec.letterhead = await loadLetterhead();
      } catch (err) {
        console.warn(
          "[ModernAgent] letterhead unavailable, generating plain document:",
          (err as Error)?.message,
        );
      }
      const out: GeneratedDocument[] = [];
      if (format === "pdf" || format === "both") {
        const { fileName } = await generateAgentPdf(spec);
        out.push({
          fileName,
          type: "pdf",
          title: spec.title,
          downloadUrl: `/api/modern-agent/documents/${fileName}`,
        });
      }
      if (format === "word" || format === "both") {
        const { fileName } = await generateAgentWord(spec);
        out.push({
          fileName,
          type: "word",
          title: spec.title,
          downloadUrl: `/api/modern-agent/documents/${fileName}`,
        });
      }
      sink.documents.push(...out);
      return {
        ok: true,
        documents: out.map((d) => ({
          title: d.title,
          type: d.type,
          downloadUrl: d.downloadUrl,
        })),
      };
    },
  },
];

export const TOOL_MAP: Record<string, ToolDefinition> = Object.fromEntries(
  TOOL_REGISTRY.map((t) => [t.name, t]),
);

export function userCanUseTool(
  tool: ToolDefinition,
  userPermissions: string[],
): boolean {
  if (!tool.permission) return true;
  return hasPermission(userPermissions, tool.permission);
}
