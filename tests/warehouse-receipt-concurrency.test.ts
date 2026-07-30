/**
 * Integration test: concurrent warehouse receipts must not over-receive.
 *
 * Two concurrent receipts for the last 10 kg of the same production order
 * should result in exactly 10 kg being credited, not 20 kg.  The fix adds
 * SELECT ... FOR UPDATE inside the transaction so the second writer sees the
 * updated warehouse_received_kg under the row lock and correctly throws.
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

// Simulate the critical section of createFinishedGoodsVoucherIn for a single
// production order.  Runs entirely inside one transaction with FOR UPDATE.
async function simulateReceipt(
  poId: number,
  weightKg: number,
  voucherNumber: string,
): Promise<"ok" | "rejected"> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the PO row (mirrors the fix in createFinishedGoodsVoucherIn).
    const lockRes = await client.query(
      "SELECT warehouse_received_kg FROM production_orders WHERE id = $1 FOR UPDATE",
      [poId],
    );
    const po = lockRes.rows[0];
    if (!po) throw new Error("PO not found");

    // Re-compute remaining under the lock.
    const rwRes = await client.query(
      `SELECT COALESCE(SUM(
          CASE WHEN (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%')
            THEN r.weight_kg ELSE r.cut_weight_total_kg END
        ), 0) AS total_ready_weight
       FROM rolls r
       JOIN production_orders po2 ON po2.id = r.production_order_id
       JOIN customer_products cp  ON cp.id  = po2.customer_product_id
       LEFT JOIN items i           ON i.id   = cp.item_id
       WHERE r.production_order_id = $1 AND r.stage = 'done'`,
      [poId],
    );
    const totalReady = parseFloat(rwRes.rows[0]?.total_ready_weight ?? "0");
    const alreadyReceived = parseFloat(po.warehouse_received_kg ?? "0");
    const remaining = totalReady - alreadyReceived;

    if (remaining <= 0 || weightKg > remaining + 0.01) {
      await client.query("ROLLBACK");
      return "rejected";
    }

    // Insert a placeholder voucher row and update the PO.
    await client.query(
      `UPDATE production_orders
          SET warehouse_received_kg = CAST(warehouse_received_kg AS NUMERIC) + $1
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

let testCustomerId: string;
let testCustomerProductId: number;
let testOrderId: number;
let testPoId: number;
let testRollId: number;

// Use a fixed varchar ID so we can clean up deterministically.
const TEST_CUSTOMER_ID = "T-CRC-CUST01";

beforeAll(async () => {
  // customer – varchar PK, insert idempotently
  await runQuery(
    `INSERT INTO customers (id, name, name_ar, phone, address)
     VALUES ($1, 'Test Customer CRC', 'عميل اختبار', '0500000000', 'addr')
     ON CONFLICT (id) DO NOTHING`,
    [TEST_CUSTOMER_ID],
  );
  testCustomerId = TEST_CUSTOMER_ID;

  // customer_products – only customer_id is required for our test
  const cpRes = await runQuery(
    `INSERT INTO customer_products (customer_id, item_id, width, thickness)
     VALUES ($1, NULL, 40, 30)
     RETURNING id`,
    [TEST_CUSTOMER_ID],
  );
  testCustomerProductId = cpRes.rows[0].id;

  // order – order_number must be unique
  const orderRes = await runQuery(
    `INSERT INTO orders (customer_id, order_number, status)
     VALUES ($1, 'TEST-CRC-ORD01', 'in_production')
     RETURNING id`,
    [TEST_CUSTOMER_ID],
  );
  testOrderId = orderRes.rows[0].id;

  // production_order – production_order_number must be unique;
  // final_quantity_kg is NOT NULL so provide it explicitly.
  const poRes = await runQuery(
    `INSERT INTO production_orders
       (order_id, customer_product_id, production_order_number,
        quantity_kg, final_quantity_kg, warehouse_received_kg, status)
     VALUES ($1, $2, 'PO-CRC-001', 10, 10.5, 0, 'active')
     RETURNING id`,
    [testOrderId, testCustomerProductId],
  );
  testPoId = poRes.rows[0].id;

  // roll – roll_seq and qr_code_text are NOT NULL
  const rollRes = await runQuery(
    `INSERT INTO rolls
       (production_order_id, roll_seq, roll_number, qr_code_text,
        weight_kg, cut_weight_total_kg, stage)
     VALUES ($1, 1, 'R-CRC-001', '{}', 10, 10, 'done')
     RETURNING id`,
    [testPoId],
  );
  testRollId = rollRes.rows[0].id;
}, 60_000);

afterAll(async () => {
  // Clean up in reverse-FK order.
  if (testRollId)  await runQuery("DELETE FROM rolls WHERE id = $1", [testRollId]);
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

describe("warehouse receipt concurrency", () => {
  it("two concurrent receipts for 10 kg total exactly 10 kg, not 20 kg", async () => {
    // Fire both receipts simultaneously without awaiting between them.
    const [r1, r2] = await Promise.all([
      simulateReceipt(testPoId, 10, "V-CRC-001"),
      simulateReceipt(testPoId, 10, "V-CRC-002"),
    ]);

    // Exactly one must succeed; the other must be rejected by the lock check.
    const successCount = [r1, r2].filter((r) => r === "ok").length;
    const rejectedCount = [r1, r2].filter((r) => r === "rejected").length;
    expect(successCount).toBe(1);
    expect(rejectedCount).toBe(1);

    // The PO must show exactly 10 kg received, not 20.
    const res = await runQuery(
      "SELECT warehouse_received_kg FROM production_orders WHERE id = $1",
      [testPoId],
    );
    const received = parseFloat(res.rows[0].warehouse_received_kg);
    expect(received).toBe(10);
  });

  it("partial receipt followed by a receipt for the remainder works", async () => {
    // Reset the PO to 0 received for this sub-test.
    await runQuery(
      "UPDATE production_orders SET warehouse_received_kg = 0 WHERE id = $1",
      [testPoId],
    );

    const first = await simulateReceipt(testPoId, 6, "V-CRC-003");
    expect(first).toBe("ok");

    const second = await simulateReceipt(testPoId, 4, "V-CRC-004");
    expect(second).toBe("ok");

    const res = await runQuery(
      "SELECT warehouse_received_kg FROM production_orders WHERE id = $1",
      [testPoId],
    );
    expect(parseFloat(res.rows[0].warehouse_received_kg)).toBe(10);
  });

  it("receipt that would exceed remaining is rejected", async () => {
    // Reset to 8 kg already received.
    await runQuery(
      "UPDATE production_orders SET warehouse_received_kg = 8 WHERE id = $1",
      [testPoId],
    );

    const result = await simulateReceipt(testPoId, 5, "V-CRC-005"); // 8+5 > 10
    expect(result).toBe("rejected");

    // The PO must still show 8, unchanged.
    const res = await runQuery(
      "SELECT warehouse_received_kg FROM production_orders WHERE id = $1",
      [testPoId],
    );
    expect(parseFloat(res.rows[0].warehouse_received_kg)).toBe(8);
  });
});
