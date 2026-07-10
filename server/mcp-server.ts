import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  orders,
  production_orders,
  rolls,
  customers,
  customer_products,
  categories,
  machines,
  maintenance_requests,
  attendance,
  inventory,
  items,
  quality_issues,
} from "@shared/schema";
import { sql, eq, and, desc, gte, lte, type SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "./db";
import { storage } from "./storage";

function buildWhere(conditions: SQL[]): SQL | undefined {
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export function createMcpServer() {
  const server = new McpServer(
    {
      name: "MPBF Factory Management",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const appBaseUrl = (
    process.env.APP_BASE_URL ||
    (process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
      : "")
  ).replace(/\/$/, "");
  const link = (path: string) => `${appBaseUrl}${path}`;

  // ChatGPT connectors require two tools named exactly `search` and `fetch`.
  // `search` returns a list of { id, title, url }; `fetch` returns the full
  // record for a given id. Both are the standard retrieval contract used by
  // ChatGPT's MCP connector / deep-research flows.
  server.tool(
    "search",
    "Search across all factory data (orders, customers, products, production orders, rolls, machines, inventory items, categories, maintenance requests, and quality issues) using a free-text query. Returns a list of matching records, each with an id, title, and url. Use the `fetch` tool with a returned id to read the full record. This is the primary discovery tool for ChatGPT connectors.",
    {
      query: z
        .string()
        .describe("Free-text search query (Arabic or English)"),
    },
    async ({ query }) => {
      const q = (query ?? "").trim();
      const results: { id: string; title: string; url: string }[] = [];
      if (!q) {
        return {
          content: [
            { type: "text" as const, text: JSON.stringify({ results }) },
          ],
        };
      }
      const like = `%${q}%`;
      const PER = 8;
      try {
        const [
          orderRows,
          customerRows,
          productionRows,
          rollRows,
          machineRows,
          itemRows,
          categoryRows,
          maintenanceRows,
          qualityRows,
        ] = await Promise.all([
          db
            .select({
              id: orders.id,
              order_number: orders.order_number,
              status: orders.status,
            })
            .from(orders)
            .where(
              sql`${orders.order_number} ILIKE ${like} OR ${orders.customer_id} ILIKE ${like} OR ${orders.notes} ILIKE ${like}`,
            )
            .limit(PER),
          db
            .select({
              id: customers.id,
              name: customers.name,
              name_ar: customers.name_ar,
            })
            .from(customers)
            .where(
              sql`${customers.name} ILIKE ${like} OR ${customers.name_ar} ILIKE ${like} OR ${customers.phone} ILIKE ${like} OR ${customers.id} ILIKE ${like}`,
            )
            .limit(PER),
          db
            .select({
              id: production_orders.id,
              pon: production_orders.production_order_number,
              status: production_orders.status,
            })
            .from(production_orders)
            .where(
              sql`${production_orders.production_order_number} ILIKE ${like}`,
            )
            .limit(PER),
          db
            .select({
              id: rolls.id,
              roll_number: rolls.roll_number,
              stage: rolls.stage,
            })
            .from(rolls)
            .where(
              sql`${rolls.roll_number} ILIKE ${like} OR ${rolls.qr_code_text} ILIKE ${like}`,
            )
            .limit(PER),
          db
            .select({
              id: machines.id,
              name: machines.name,
              name_ar: machines.name_ar,
            })
            .from(machines)
            .where(
              sql`${machines.name} ILIKE ${like} OR ${machines.name_ar} ILIKE ${like} OR ${machines.id} ILIKE ${like}`,
            )
            .limit(PER),
          db
            .select({
              id: items.id,
              name: items.name,
              name_ar: items.name_ar,
            })
            .from(items)
            .where(
              sql`${items.name} ILIKE ${like} OR ${items.name_ar} ILIKE ${like} OR ${items.code} ILIKE ${like} OR ${items.id} ILIKE ${like}`,
            )
            .limit(PER),
          db
            .select({
              id: categories.id,
              name: categories.name,
              name_ar: categories.name_ar,
            })
            .from(categories)
            .where(
              sql`${categories.name} ILIKE ${like} OR ${categories.name_ar} ILIKE ${like} OR ${categories.id} ILIKE ${like}`,
            )
            .limit(PER),
          db
            .select({
              id: maintenance_requests.id,
              request_number: maintenance_requests.request_number,
              status: maintenance_requests.status,
            })
            .from(maintenance_requests)
            .where(
              sql`${maintenance_requests.request_number} ILIKE ${like} OR ${maintenance_requests.description} ILIKE ${like} OR ${maintenance_requests.machine_id} ILIKE ${like}`,
            )
            .limit(PER),
          db
            .select({
              id: quality_issues.id,
              issue_number: quality_issues.issue_number,
              severity: quality_issues.severity,
            })
            .from(quality_issues)
            .where(
              sql`${quality_issues.issue_number} ILIKE ${like} OR ${quality_issues.description} ILIKE ${like}`,
            )
            .limit(PER),
        ]);

        for (const r of orderRows)
          results.push({
            id: `order:${r.id}`,
            title: `طلب ${r.order_number} (${r.status})`,
            url: link("/orders"),
          });
        for (const r of customerRows)
          results.push({
            id: `customer:${r.id}`,
            title: `عميل: ${r.name_ar || r.name}`,
            url: link("/customers"),
          });
        for (const r of productionRows)
          results.push({
            id: `production_order:${r.id}`,
            title: `أمر إنتاج ${r.pon} (${r.status})`,
            url: link("/production"),
          });
        for (const r of rollRows)
          results.push({
            id: `roll:${r.id}`,
            title: `رول ${r.roll_number} (${r.stage})`,
            url: link("/production"),
          });
        for (const r of machineRows)
          results.push({
            id: `machine:${r.id}`,
            title: `ماكينة: ${r.name_ar || r.name}`,
            url: link("/machines"),
          });
        for (const r of itemRows)
          results.push({
            id: `item:${r.id}`,
            title: `صنف: ${r.name_ar || r.name}`,
            url: link("/inventory"),
          });
        for (const r of categoryRows)
          results.push({
            id: `category:${r.id}`,
            title: `فئة: ${r.name_ar || r.name}`,
            url: link("/definitions"),
          });
        for (const r of maintenanceRows)
          results.push({
            id: `maintenance_request:${r.id}`,
            title: `طلب صيانة ${r.request_number} (${r.status})`,
            url: link("/maintenance"),
          });
        for (const r of qualityRows)
          results.push({
            id: `quality_issue:${r.id}`,
            title: `مشكلة جودة ${r.issue_number} (${r.severity})`,
            url: link("/quality"),
          });
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ results, error: error.message }),
            },
          ],
        };
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ results }) },
        ],
      };
    },
  );

  server.tool(
    "fetch",
    "Fetch the full record for a single id returned by the `search` tool. The id must be in the form `type:id` (for example `order:123`, `customer:CID001`, `roll:456`). Returns the full record as JSON text. Required companion to `search` for ChatGPT connectors.",
    {
      id: z
        .string()
        .describe("Record id in the form `type:id`, as returned by `search`"),
    },
    async ({ id }) => {
      const sep = id.indexOf(":");
      const type = sep === -1 ? "" : id.slice(0, sep);
      const rawId = sep === -1 ? id : id.slice(sep + 1);
      const fail = (msg: string) => ({
        content: [
          { type: "text" as const, text: JSON.stringify({ error: msg }) },
        ],
        isError: true,
      });

      try {
        let record: any = null;
        let title = id;
        let url = link("/");

        switch (type) {
          case "order": {
            const [row] = await db
              .select()
              .from(orders)
              .where(eq(orders.id, Number(rawId)))
              .limit(1);
            record = row;
            if (row) {
              title = `طلب ${row.order_number}`;
              url = link("/orders");
            }
            break;
          }
          case "customer": {
            const [row] = await db
              .select()
              .from(customers)
              .where(eq(customers.id, rawId))
              .limit(1);
            record = row;
            if (row) {
              title = `عميل: ${row.name_ar || row.name}`;
              url = link("/customers");
            }
            break;
          }
          case "production_order": {
            const [row] = await db
              .select()
              .from(production_orders)
              .where(eq(production_orders.id, Number(rawId)))
              .limit(1);
            record = row;
            if (row) {
              title = `أمر إنتاج ${row.production_order_number}`;
              url = link("/production");
            }
            break;
          }
          case "roll": {
            const [row] = await db
              .select()
              .from(rolls)
              .where(eq(rolls.id, Number(rawId)))
              .limit(1);
            record = row;
            if (row) {
              title = `رول ${row.roll_number}`;
              url = link("/production");
            }
            break;
          }
          case "machine": {
            const [row] = await db
              .select()
              .from(machines)
              .where(eq(machines.id, rawId))
              .limit(1);
            record = row;
            if (row) {
              title = `ماكينة: ${row.name_ar || row.name}`;
              url = link("/machines");
            }
            break;
          }
          case "item": {
            const [row] = await db
              .select()
              .from(items)
              .where(eq(items.id, rawId))
              .limit(1);
            record = row;
            if (row) {
              title = `صنف: ${row.name_ar || row.name}`;
              url = link("/inventory");
            }
            break;
          }
          case "category": {
            const [row] = await db
              .select()
              .from(categories)
              .where(eq(categories.id, rawId))
              .limit(1);
            record = row;
            if (row) {
              title = `فئة: ${row.name_ar || row.name}`;
              url = link("/definitions");
            }
            break;
          }
          case "maintenance_request": {
            const [row] = await db
              .select()
              .from(maintenance_requests)
              .where(eq(maintenance_requests.id, Number(rawId)))
              .limit(1);
            record = row;
            if (row) {
              title = `طلب صيانة ${row.request_number}`;
              url = link("/maintenance");
            }
            break;
          }
          case "quality_issue": {
            const [row] = await db
              .select()
              .from(quality_issues)
              .where(eq(quality_issues.id, Number(rawId)))
              .limit(1);
            record = row;
            if (row) {
              title = `مشكلة جودة ${row.issue_number}`;
              url = link("/quality");
            }
            break;
          }
          default:
            return fail(
              `Unknown id type "${type}". Expected one of: order, customer, production_order, roll, machine, item, category, maintenance_request, quality_issue.`,
            );
        }

        if (!record) return fail(`No record found for id "${id}".`);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                id,
                title,
                url,
                text: JSON.stringify(record, null, 2),
                metadata: { type },
              }),
            },
          ],
        };
      } catch (error: any) {
        return fail(error.message);
      }
    },
  );

  server.tool(
    "get_dashboard_stats",
    "Get factory dashboard statistics including order counts, production stats, machine status, and inventory overview",
    {},
    async () => {
      const orderRows = await db
        .select({ count: sql<number>`count(*)`, status: orders.status })
        .from(orders)
        .groupBy(orders.status);
      const prodRows = await db
        .select({
          count: sql<number>`count(*)`,
          status: production_orders.status,
        })
        .from(production_orders)
        .groupBy(production_orders.status);
      const machineRows = await db
        .select({ count: sql<number>`count(*)`, status: machines.status })
        .from(machines)
        .groupBy(machines.status);
      const rollCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(rolls);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                orders_by_status: orderRows,
                production_orders_by_status: prodRows,
                machines_by_status: machineRows,
                total_rolls: rollCount[0]?.count ?? 0,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.tool(
    "get_orders",
    "Search and list customer orders with optional filters for status, customer, and date range",
    {
      status: z
        .string()
        .optional()
        .describe(
          "Filter by order status: waiting, in_production, completed, cancelled, paused, delivered",
        ),
      customer_id: z.string().optional().describe("Filter by customer ID"),
      limit: z
        .number()
        .optional()
        .default(50)
        .describe("Maximum number of orders to return (default 50)"),
      offset: z
        .number()
        .optional()
        .default(0)
        .describe("Offset for pagination"),
    },
    async ({ status, customer_id, limit, offset }) => {
      const conditions: SQL[] = [];
      if (status) conditions.push(eq(orders.status, status));
      if (customer_id) conditions.push(eq(orders.customer_id, customer_id));

      const where = buildWhere(conditions);

      const results = await db
        .select()
        .from(orders)
        .where(where)
        .orderBy(desc(orders.created_at))
        .limit(limit ?? 50)
        .offset(offset ?? 0);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(where);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { orders: results, total: total[0]?.count ?? 0 },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.tool(
    "get_production_status",
    "Get production orders status with completion percentages and stage details",
    {
      status: z
        .string()
        .optional()
        .describe("Filter by status: pending, active, completed, cancelled"),
      order_id: z.number().optional().describe("Filter by parent order ID"),
      limit: z.number().optional().default(50).describe("Maximum results"),
    },
    async ({ status, order_id, limit }) => {
      const conditions: SQL[] = [];
      if (status) conditions.push(eq(production_orders.status, status));
      if (order_id) conditions.push(eq(production_orders.order_id, order_id));

      const results = await db
        .select()
        .from(production_orders)
        .where(buildWhere(conditions))
        .orderBy(desc(production_orders.created_at))
        .limit(limit ?? 50);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ production_orders: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_inventory",
    "Get current inventory levels for raw materials and finished goods",
    {
      item_id: z.string().optional().describe("Filter by specific item ID"),
      low_stock: z
        .boolean()
        .optional()
        .describe("If true, only show items with stock below minimum level"),
      limit: z.number().optional().default(100).describe("Maximum results"),
    },
    async ({ item_id, low_stock, limit }) => {
      const conditions: SQL[] = [];
      if (item_id) conditions.push(eq(inventory.item_id, item_id));
      if (low_stock)
        conditions.push(
          sql`${inventory.current_stock} < ${inventory.min_stock}`,
        );

      const where = buildWhere(conditions);

      const query = db
        .select({
          inventory_id: inventory.id,
          item_id: inventory.item_id,
          item_name: items.name,
          item_name_ar: items.name_ar,
          current_stock: inventory.current_stock,
          min_stock: inventory.min_stock,
          max_stock: inventory.max_stock,
          location_id: inventory.location_id,
        })
        .from(inventory)
        .leftJoin(items, eq(inventory.item_id, items.id));

      const results = await (where ? query.where(where) : query).limit(
        limit ?? 100,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ inventory: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_machines_status",
    "Get all machines with their current status (active, maintenance, down)",
    {
      type: z
        .string()
        .optional()
        .describe(
          "Filter by machine type: extruder, printer, cutter, quality_check",
        ),
      status: z
        .string()
        .optional()
        .describe("Filter by status: active, maintenance, down"),
    },
    async ({ type, status }) => {
      const conditions: SQL[] = [];
      if (type) conditions.push(eq(machines.type, type));
      if (status) conditions.push(eq(machines.status, status));

      const results = await db
        .select()
        .from(machines)
        .where(buildWhere(conditions));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ machines: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_maintenance_requests",
    "Get maintenance requests for machines, optionally filtered by status or machine",
    {
      status: z
        .string()
        .optional()
        .describe(
          "Filter by status: pending, in_progress, completed, cancelled",
        ),
      machine_id: z.string().optional().describe("Filter by machine ID"),
      limit: z.number().optional().default(50).describe("Maximum results"),
    },
    async ({ status, machine_id, limit }) => {
      const conditions: SQL[] = [];
      if (status) conditions.push(eq(maintenance_requests.status, status));
      if (machine_id)
        conditions.push(eq(maintenance_requests.machine_id, machine_id));

      const results = await db
        .select()
        .from(maintenance_requests)
        .where(buildWhere(conditions))
        .orderBy(desc(maintenance_requests.date_reported))
        .limit(limit ?? 50);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ maintenance_requests: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_attendance_summary",
    "Get attendance summary for employees with optional date range",
    {
      user_id: z.number().optional().describe("Filter by specific user ID"),
      date_from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("End date (YYYY-MM-DD)"),
      limit: z.number().optional().default(100).describe("Maximum results"),
    },
    async ({ user_id, date_from, date_to, limit }) => {
      const conditions: SQL[] = [];
      if (user_id) conditions.push(eq(attendance.user_id, user_id));
      if (date_from) conditions.push(gte(attendance.date, date_from));
      if (date_to) conditions.push(lte(attendance.date, date_to));

      const results = await db
        .select({
          id: attendance.id,
          user_id: attendance.user_id,
          status: attendance.status,
          check_in_time: attendance.check_in_time,
          check_out_time: attendance.check_out_time,
          work_hours: attendance.work_hours,
          overtime_hours: attendance.overtime_hours,
          shift_type: attendance.shift_type,
          late_minutes: attendance.late_minutes,
          date: attendance.date,
        })
        .from(attendance)
        .where(buildWhere(conditions))
        .orderBy(desc(attendance.date))
        .limit(limit ?? 100);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ attendance: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_customers",
    "Get customer list with contact information",
    {
      search: z.string().optional().describe("Search by customer name"),
      is_active: z.boolean().optional().describe("Filter by active status"),
      limit: z.number().optional().default(50).describe("Maximum results"),
    },
    async ({ search, is_active, limit }) => {
      const conditions: SQL[] = [];
      if (search) {
        conditions.push(
          sql`(${customers.name} ILIKE ${"%" + search + "%"} OR ${customers.name_ar} ILIKE ${"%" + search + "%"})`,
        );
      }
      if (is_active !== undefined)
        conditions.push(eq(customers.is_active, is_active));

      const results = await db
        .select()
        .from(customers)
        .where(buildWhere(conditions))
        .limit(limit ?? 50);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ customers: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_quality_issues",
    "Get quality issues and problems tracked in production",
    {
      status: z
        .string()
        .optional()
        .describe("Filter by status: open, in_progress, resolved, closed"),
      severity: z
        .string()
        .optional()
        .describe("Filter by severity: low, medium, high, critical"),
      limit: z.number().optional().default(50).describe("Maximum results"),
    },
    async ({ status, severity, limit }) => {
      const conditions: SQL[] = [];
      if (status) conditions.push(eq(quality_issues.status, status));
      if (severity) conditions.push(eq(quality_issues.severity, severity));

      const results = await db
        .select()
        .from(quality_issues)
        .where(buildWhere(conditions))
        .orderBy(desc(quality_issues.created_at))
        .limit(limit ?? 50);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ quality_issues: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "search_rolls",
    "Search for production rolls by roll number, QR code, or production order",
    {
      roll_number: z.string().optional().describe("Search by roll number"),
      production_order_id: z
        .number()
        .optional()
        .describe("Filter by production order ID"),
      stage: z
        .string()
        .optional()
        .describe("Filter by current stage: film, printing, cutting, done"),
      limit: z.number().optional().default(50).describe("Maximum results"),
    },
    async ({ roll_number, production_order_id, stage, limit }) => {
      const conditions: SQL[] = [];
      if (roll_number) {
        conditions.push(
          sql`${rolls.roll_number} ILIKE ${"%" + roll_number + "%"}`,
        );
      }
      if (production_order_id)
        conditions.push(eq(rolls.production_order_id, production_order_id));
      if (stage) conditions.push(eq(rolls.stage, stage));

      const results = await db
        .select()
        .from(rolls)
        .where(buildWhere(conditions))
        .orderBy(desc(rolls.created_at))
        .limit(limit ?? 50);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ rolls: results }, null, 2),
          },
        ],
      };
    },
  );

  // ==================== WRITE TOOLS ====================

  server.tool(
    "create_customer",
    "Create a new customer in the system with contact information",
    {
      id: z.string().describe("Customer ID (e.g. 'CID001', 'CID002')"),
      name: z.string().describe("Customer name in English"),
      name_ar: z.string().optional().describe("Customer name in Arabic"),
      phone: z.string().optional().describe("Phone number"),
      city: z.string().optional().describe("City"),
      address: z.string().optional().describe("Full address"),
      tax_number: z
        .string()
        .optional()
        .describe("Tax number (must be exactly 14 characters)"),
      commercial_name: z.string().optional().describe("Commercial/trade name"),
      is_active: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether customer is active"),
    },
    async (params) => {
      try {
        const customer = await storage.createCustomer(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, customer }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "update_customer",
    "Update an existing customer's information",
    {
      id: z.string().describe("Customer ID to update (e.g. 'CID001')"),
      name: z.string().optional().describe("New customer name"),
      name_ar: z.string().optional().describe("New Arabic name"),
      phone: z.string().optional().describe("New phone number"),
      city: z.string().optional().describe("New city"),
      address: z.string().optional().describe("New address"),
      is_active: z.boolean().optional().describe("Active status"),
    },
    async ({ id, ...updates }) => {
      try {
        const customer = await storage.updateCustomer(id, updates);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, customer }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "create_category",
    "Create a new product category",
    {
      id: z.string().describe("Category ID (e.g. 'CAT001')"),
      name: z.string().describe("Category name in English"),
      name_ar: z.string().optional().describe("Category name in Arabic"),
      code: z.string().optional().describe("Category code"),
      parent_id: z
        .string()
        .optional()
        .describe("Parent category ID for subcategories"),
    },
    async (params) => {
      try {
        const category = await storage.createCategory(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, category }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_categories",
    "List all product categories",
    {
      parent_id: z.string().optional().describe("Filter by parent category ID"),
    },
    async ({ parent_id }) => {
      const conditions: SQL[] = [];
      if (parent_id) conditions.push(eq(categories.parent_id, parent_id));

      const results = await db
        .select()
        .from(categories)
        .where(buildWhere(conditions));
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ categories: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "create_item",
    "Create a new inventory item (raw material or product)",
    {
      id: z.string().describe("Item ID (e.g. 'ITM001')"),
      name: z.string().describe("Item name in English"),
      name_ar: z.string().optional().describe("Item name in Arabic"),
      category_id: z
        .string()
        .optional()
        .describe("Category ID this item belongs to"),
      code: z.string().optional().describe("Item code"),
      status: z
        .string()
        .optional()
        .default("active")
        .describe("Status: active or inactive"),
    },
    async (params) => {
      try {
        const item = await storage.createItem(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, item }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "create_customer_product",
    "Create a new customer product specification (bag type with dimensions and materials)",
    {
      customer_id: z.string().describe("Customer ID (e.g. 'CID001')"),
      category_id: z.string().optional().describe("Category ID"),
      item_id: z.string().optional().describe("Item ID"),
      size_caption: z
        .string()
        .optional()
        .describe("Size description (e.g. '30x40')"),
      width: z.number().optional().describe("Width in cm"),
      thickness: z.number().optional().describe("Thickness in microns"),
      cutting_length_cm: z.number().optional().describe("Cutting length in cm"),
      raw_material: z
        .string()
        .optional()
        .describe("Raw material type: HDPE, LDPE, LLDPE"),
      is_printed: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether product requires printing"),
      cutting_unit: z
        .string()
        .optional()
        .describe("Cutting unit: KG, ROLL, or PKT"),
      unit_weight_kg: z.number().optional().describe("Weight per unit in kg"),
      unit_quantity: z.number().optional().describe("Quantity per unit"),
      package_weight_kg: z.number().optional().describe("Package weight in kg"),
      notes: z.string().optional().describe("Additional notes"),
    },
    async (params) => {
      try {
        const { insertCustomerProductSchema } = await import("@shared/schema");
        const validated = insertCustomerProductSchema.parse(params);
        const product = await storage.createCustomerProduct(validated);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, product }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "update_customer_product",
    "Update an existing customer product specification",
    {
      id: z.number().describe("Customer product ID (integer)"),
      size_caption: z.string().optional().describe("New size description"),
      width: z.number().optional().describe("New width in cm"),
      thickness: z.number().optional().describe("New thickness"),
      cutting_length_cm: z.number().optional().describe("New cutting length"),
      raw_material: z.string().optional().describe("New raw material type"),
      is_printed: z
        .boolean()
        .optional()
        .describe("Whether product requires printing"),
      notes: z.string().optional().describe("Updated notes"),
      status: z.string().optional().describe("Status: active or inactive"),
    },
    async ({ id, ...updates }) => {
      try {
        const product = await storage.updateCustomerProduct(id, updates);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, product }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_customer_products",
    "Get products/specifications for a specific customer",
    {
      customer_id: z.string().optional().describe("Filter by customer ID"),
      status: z
        .string()
        .optional()
        .describe("Filter by status: active or inactive"),
      limit: z.number().optional().default(50).describe("Maximum results"),
    },
    async ({ customer_id, status, limit }) => {
      const conditions: SQL[] = [];
      if (customer_id)
        conditions.push(eq(customer_products.customer_id, customer_id));
      if (status) conditions.push(eq(customer_products.status, status));

      const results = await db
        .select()
        .from(customer_products)
        .where(buildWhere(conditions))
        .limit(limit ?? 50);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ customer_products: results }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "create_order",
    "Create a new customer order. Order number is auto-generated if not provided.",
    {
      customer_id: z.string().describe("Customer ID (e.g. 'CID001')"),
      order_number: z
        .string()
        .optional()
        .describe("Order number (auto-generated if empty, format: ORD001)"),
      delivery_days: z
        .number()
        .optional()
        .describe("Number of delivery days (1-365)"),
      delivery_date: z
        .string()
        .optional()
        .describe("Delivery date (YYYY-MM-DD)"),
      notes: z.string().optional().describe("Order notes"),
    },
    async (params) => {
      try {
        let orderNumber = params.order_number;
        if (!orderNumber) {
          const result = await db.execute(
            sql`SELECT MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)) as max_num 
                FROM orders WHERE order_number ~ '^ORD[0-9]+$'`,
          );
          const maxNum = (result as any).rows?.[0]?.max_num || 0;
          orderNumber = `ORD${(maxNum + 1).toString().padStart(3, "0")}`;
        }

        const orderData = {
          order_number: orderNumber,
          customer_id: params.customer_id,
          delivery_days: params.delivery_days ?? null,
          delivery_date: params.delivery_date ?? null,
          notes: params.notes ?? null,
          status: "waiting",
        };

        const order = await storage.createOrder(orderData as any);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, order }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "update_order",
    "Update an existing order's details (notes, delivery date, delivery days)",
    {
      id: z.number().describe("Order ID (integer)"),
      notes: z.string().optional().describe("Updated notes"),
      delivery_days: z.number().optional().describe("Updated delivery days"),
      delivery_date: z
        .string()
        .optional()
        .describe("Updated delivery date (YYYY-MM-DD)"),
    },
    async ({ id, ...updates }) => {
      try {
        const order = await storage.updateOrder(id, updates);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, order }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "update_order_status",
    "Change an order's status (e.g. waiting → in_production → completed → delivered)",
    {
      id: z.number().describe("Order ID (integer)"),
      status: z
        .string()
        .describe(
          "New status: waiting, in_production, completed, cancelled, paused, delivered",
        ),
    },
    async ({ id, status }) => {
      try {
        const [existing] = await db
          .select({ status: orders.status })
          .from(orders)
          .where(eq(orders.id, id))
          .limit(1);
        if (!existing) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  success: false,
                  error: "Order not found",
                }),
              },
            ],
            isError: true,
          };
        }
        const order = await storage.updateOrderStatusWithPrevious(
          id,
          status,
          existing.status,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { success: true, order, previous_status: existing.status },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "create_production_order",
    "Create a new production order linked to a customer order",
    {
      order_id: z.number().describe("Parent order ID (integer)"),
      customer_product_id: z
        .number()
        .describe("Customer product specification ID"),
      production_order_number: z
        .string()
        .describe("Production order number (e.g. 'PO001')"),
      quantity_kg: z.number().describe("Quantity in kg"),
      overrun_percentage: z
        .number()
        .optional()
        .default(5)
        .describe("Overrun percentage (0-50, default 5%)"),
      assigned_machine_id: z
        .string()
        .optional()
        .describe("Machine ID to assign"),
      notes: z.string().optional().describe("Production notes"),
    },
    async (params) => {
      try {
        const finalQty =
          params.quantity_kg * (1 + (params.overrun_percentage ?? 5) / 100);
        const poData = {
          ...params,
          final_quantity_kg: finalQty.toFixed(2),
          quantity_kg: params.quantity_kg.toString(),
          overrun_percentage: (params.overrun_percentage ?? 5).toString(),
          status: "pending",
        };

        const productionOrder = await storage.createProductionOrder(
          poData as any,
          { final_quantity_kg: finalQty },
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { success: true, production_order: productionOrder },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "update_production_order_status",
    "Change a production order's status",
    {
      id: z.number().describe("Production order ID (integer)"),
      status: z
        .string()
        .describe("New status: pending, active, completed, cancelled"),
    },
    async ({ id, status }) => {
      try {
        const [existing] = await db
          .select({ status: production_orders.status })
          .from(production_orders)
          .where(eq(production_orders.id, id))
          .limit(1);

        if (!existing) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  success: false,
                  error: "Production order not found",
                }),
              },
            ],
            isError: true,
          };
        }

        const [updated] = await db
          .update(production_orders)
          .set({ status, previous_status: existing.status })
          .where(eq(production_orders.id, id))
          .returning();

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  production_order: updated,
                  previous_status: existing.status,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "update_production_order",
    "Update production order details (machine assignment, quantities, notes)",
    {
      id: z.number().describe("Production order ID (integer)"),
      assigned_machine_id: z
        .string()
        .optional()
        .describe("New assigned machine ID"),
      assigned_operator_id: z
        .number()
        .optional()
        .describe("New assigned operator user ID"),
      quantity_kg: z.number().optional().describe("Updated quantity in kg"),
      notes: z.string().optional().describe("Updated notes"),
    },
    async ({ id, ...updates }) => {
      try {
        const updateData: Record<string, any> = {};
        if (updates.assigned_machine_id !== undefined)
          updateData.assigned_machine_id = updates.assigned_machine_id;
        if (updates.assigned_operator_id !== undefined)
          updateData.assigned_operator_id = updates.assigned_operator_id;
        if (updates.quantity_kg !== undefined)
          updateData.quantity_kg = updates.quantity_kg.toString();
        if (updates.notes !== undefined) updateData.notes = updates.notes;

        const [updated] = await db
          .update(production_orders)
          .set(updateData)
          .where(eq(production_orders.id, id))
          .returning();

        if (!updated) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  success: false,
                  error: "Production order not found",
                }),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { success: true, production_order: updated },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}
