/**
 * Integration test: concurrent warehouse deliveries must not over-deliver.
 *
 * Two concurrent delivery vouchers for the last 10 kg of the same production
 * order should result in exactly 10 kg being delivered, not 20 kg.  The fix
 * adds SELECT ... FOR UPDATE inside the delivery transaction so the second
 * writer sees the updated warehouse_delivered_kg under the row lock and
 * correctly throws.
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

// The neon serverless driver requires a WebSocket implementation in Node.js.
neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL or NEON_DATABASE_URL must be set to run this test");
}

// Use a fresh pool for test isolation.
const pool = new Pool({ connectionString: DATABASE_URL });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function runQuery(sql: string, values?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(sql, values);
  } finally {
    client.release();
  }
}

// Simulate the critical section of createFinishedGoodsVoucherOut for a single
// production order.  Runs entirely inside one transaction with FOR UPDATE.
async function simulateDelivery(
  poId: number,
  weightKg: number,
): Promise<"ok" | "rejected"> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the PO row (mirrors the fix in createFinishedGoodsVoucherOut).
    const lockRes = await client.query(
      "SELECT warehouse_received_kg, warehouse_delivered_kg, production_order_number FROM production_orders WHERE id = $1 FOR UPDATE",
      [poId],
    );
    const po = lockRes.rows[0];
    if (!po) throw new Error("PO not found");

    // Re-compute available quantity under the lock.
    const received = parseFloat(po.warehouse_received_kg ?? "0");
    const delivered = parseFloat(po.warehouse_delivered_kg ?? "0");
    const available = received - delivered;

    if (available <= 0 || weightKg > available + 0.01) {
      await client.query("ROLLBACK");
      return "rejected";
    }

    // Update warehouse_delivered_kg.
    await client.query(
      `UPDATE production_orders
          SET warehouse_delivered_kg = CAST(warehouse_delivered_kg AS NUMERIC) + $1
        WHERE id = $2`,
      [weightKg, poId],
    );

    await client.query("COMMIT");
    return "ok";
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return "rejected";
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let testCustomerProductId: number;
let testOrderId: number;
let testPoId: number;

const TEST_CUSTOMER_ID = "T-WDC-CUST01";

beforeAll(async () => {
  // customer – varchar PK, insert idempotently
  await runQuery(
    `INSERT INTO customers (id, name, name_ar, phone, address)
     VALUES ($1, 'Test Customer WDC', 'عميل اختبار التسليم', '0500000001', 'addr')
     ON CONFLICT (id) DO NOTHING`,
    [TEST_CUSTOMER_ID],
  );

  // customer_products
  const cpRes = await runQuery(
    `INSERT INTO customer_products (customer_id, item_id, width, thickness)
     VALUES ($1, NULL, 40, 30)
     RETURNING id`,
    [TEST_CUSTOMER_ID],
  );
  testCustomerProductId = cpRes.rows[0].id;

  // order
  const orderRes = await runQuery(
    `INSERT INTO orders (customer_id, order_number, status)
     VALUES ($1, 'TEST-WDC-ORD01', 'in_production')
     RETURNING id`,
    [TEST_CUSTOMER_ID],
  );
  testOrderId = orderRes.rows[0].id;

  // production_order – pre-set warehouse_received_kg = 10 to simulate goods
  // already received and ready to deliver.
  const poRes = await runQuery(
    `INSERT INTO production_orders
       (order_id, customer_product_id, production_order_number,
        quantity_kg, final_quantity_kg, warehouse_received_kg, warehouse_delivered_kg, status)
     VALUES ($1, $2, 'PO-WDC-001', 10, 10.5, 10, 0, 'active')
     RETURNING id`,
    [testOrderId, testCustomerProductId],
  );
  testPoId = poRes.rows[0].id;
}, 60_000);

afterAll(async () => {
  // Clean up in reverse-FK order.
  if (testPoId)    await runQuery("DELETE FROM production_orders WHERE id = $1", [testPoId]);
  if (testOrderId) await runQuery("DELETE FROM orders WHERE id = $1", [testOrderId]);
  if (testCustomerProductId)
    await runQuery("DELETE FROM customer_products WHERE id = $1", [testCustomerProductId]);
  await runQuery("DELETE FROM customers WHERE id = $1", [TEST_CUSTOMER_ID]);
  await pool.end();
}, 60_000);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("warehouse delivery concurrency", () => {
  it("two concurrent deliveries for 10 kg total exactly 10 kg, not 20 kg", async () => {
    // Fire both deliveries simultaneously without awaiting between them.
    const [r1, r2] = await Promise.all([
      simulateDelivery(testPoId, 10),
      simulateDelivery(testPoId, 10),
    ]);

    // Exactly one must succeed; the other must be rejected by the lock check.
    const successCount = [r1, r2].filter((r) => r === "ok").length;
    const rejectedCount = [r1, r2].filter((r) => r === "rejected").length;
    expect(successCount).toBe(1);
    expect(rejectedCount).toBe(1);

    // The PO must show exactly 10 kg delivered, not 20.
    const res = await runQuery(
      "SELECT warehouse_delivered_kg FROM production_orders WHERE id = $1",
      [testPoId],
    );
    const deliveredKg = parseFloat(res.rows[0].warehouse_delivered_kg);
    expect(deliveredKg).toBe(10);
  });

  it("partial delivery followed by a delivery for the remainder works", async () => {
    // Reset the PO to 0 delivered for this sub-test.
    await runQuery(
      "UPDATE production_orders SET warehouse_delivered_kg = 0 WHERE id = $1",
      [testPoId],
    );

    const first = await simulateDelivery(testPoId, 6);
    expect(first).toBe("ok");

    const second = await simulateDelivery(testPoId, 4);
    expect(second).toBe("ok");

    const res = await runQuery(
      "SELECT warehouse_delivered_kg FROM production_orders WHERE id = $1",
      [testPoId],
    );
    expect(parseFloat(res.rows[0].warehouse_delivered_kg)).toBe(10);
  });

  it("delivery that would exceed available quantity is rejected", async () => {
    // Reset to 8 kg already delivered.
    await runQuery(
      "UPDATE production_orders SET warehouse_delivered_kg = 8 WHERE id = $1",
      [testPoId],
    );

    const result = await simulateDelivery(testPoId, 5); // 8+5 > 10 received
    expect(result).toBe("rejected");

    // The PO must still show 8, unchanged.
    const res = await runQuery(
      "SELECT warehouse_delivered_kg FROM production_orders WHERE id = $1",
      [testPoId],
    );
    expect(parseFloat(res.rows[0].warehouse_delivered_kg)).toBe(8);
  });

  it("delivery is rejected when nothing has been received", async () => {
    // Set received to 0 to simulate an order with no received stock.
    await runQuery(
      "UPDATE production_orders SET warehouse_received_kg = 0, warehouse_delivered_kg = 0 WHERE id = $1",
      [testPoId],
    );

    const result = await simulateDelivery(testPoId, 5);
    expect(result).toBe("rejected");

    // Restore for any subsequent tests.
    await runQuery(
      "UPDATE production_orders SET warehouse_received_kg = 10, warehouse_delivered_kg = 0 WHERE id = $1",
      [testPoId],
    );
  });
});
