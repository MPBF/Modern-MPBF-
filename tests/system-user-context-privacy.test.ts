/**
 * Task: bot messages must not leak sensitive customer data as the DB grows.
 *
 * Guards:
 *  1. Live check: getBusinessContext() output never contains the sensitive
 *     fields (phone, tax_number, address, unified_number, commercial_name,
 *     unique_customer_number, code) of a freshly inserted, guaranteed-sampled
 *     customer/order — and matches no phone-like or tax-like digit patterns.
 *  2. Static check: the source of the business-context section never selects
 *     a sensitive customers column, so future field additions fail loudly.
 *  3. The exported allowlist documents only non-sensitive fields.
 */
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { readFileSync } from "fs";
import path from "path";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "../server/db";
import { customers, customer_products, orders } from "../shared/schema";
import {
  getBusinessContext,
  resetBusinessContextCacheForTests,
  BUSINESS_CONTEXT_ALLOWED_FIELDS,
} from "../server/services/system-user-simulator";

const CUST_ID = "CIDT211X";
const SENTINELS = {
  phone: "0599887761",
  tax_number: "3009876543",
  address: "شارع الاختبار 211 حي السلامة",
  unified_number: "7009876543",
  commercial_name: "مؤسسة سرية للاختبار 211",
  unique_customer_number: "UQT211SECRET",
  code: "SECRT211",
};
const ORDER_NUMBER = "T211PRIV";
let orderId: number | null = null;
let productId: number | null = null;

beforeAll(async () => {
  await db
    .insert(customers)
    .values({
      id: CUST_ID,
      name: "Privacy Test Customer 211",
      name_ar: "عميل اختبار الخصوصية",
      city: "الرياض",
      is_active: true,
      ...SENTINELS,
    })
    .onConflictDoNothing();
  const [p] = await db
    .insert(customer_products)
    .values({
      customer_id: CUST_ID,
      size_caption: "30+10+10x60",
      raw_material: "HDPE",
    })
    .returning({ id: customer_products.id });
  productId = p?.id ?? null;
  // Most recent order → guaranteed to appear in the "آخر الطلبات" section.
  const [o] = await db
    .insert(orders)
    .values({ order_number: ORDER_NUMBER, customer_id: CUST_ID, status: "waiting" })
    .returning({ id: orders.id });
  orderId = o?.id ?? null;
});

afterAll(async () => {
  if (orderId) await db.delete(orders).where(eq(orders.id, orderId));
  if (productId)
    await db.delete(customer_products).where(eq(customer_products.id, productId));
  await db.delete(customers).where(inArray(customers.id, [CUST_ID]));
  await pool.end();
});

describe("business context privacy", () => {
  it("generated context text contains no sensitive customer fields or patterns", async () => {
    resetBusinessContextCacheForTests();
    const ctx = await getBusinessContext();
    // Sanity: our sentinel order/customer is actually represented in the text.
    expect(ctx.text).toContain(ORDER_NUMBER);
    expect(ctx.text).toContain("عميل اختبار الخصوصية");

    for (const [field, value] of Object.entries(SENTINELS)) {
      expect(ctx.text.includes(value)).toBe(false);
      void field;
    }
    // No phone-like numbers (Saudi local/intl) anywhere in the text.
    expect(ctx.text).not.toMatch(/(?:\+?966|0)5\d{8}/);
    // No long digit runs (tax numbers are 10-20 digits, unified numbers 10).
    expect(ctx.text).not.toMatch(/\d{9,}/);
  });

  it("context queries never select sensitive customers columns (static scan)", () => {
    const src = readFileSync(
      path.join(__dirname, "../server/services/system-user-simulator.ts"),
      "utf8",
    );
    const start = src.indexOf("سياق مرجعي للقراءة فقط");
    const end = src.indexOf("حارس الاختلاق");
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    // Skip the policy comment block; scan only executable context code.
    const codeStart = src.indexOf("async function getBusinessContext", start);
    expect(codeStart).toBeGreaterThan(-1);
    const section = src.slice(codeStart, end);
    const forbidden = [
      "phone",
      "tax_number",
      "address",
      "unified_number",
      "unique_customer_number",
      "commercial_name",
      "plate_drawer_code",
      "sales_rep_id",
    ];
    for (const f of forbidden) {
      expect(section.includes(f)).toBe(false);
    }
  });

  it("allowlist documents only non-sensitive fields", () => {
    const all = Object.values(BUSINESS_CONTEXT_ALLOWED_FIELDS).flat();
    const sensitive = [
      "phone",
      "tax_number",
      "address",
      "unified_number",
      "unique_customer_number",
      "commercial_name",
      "code",
      "user_id",
      "plate_drawer_code",
      "sales_rep_id",
    ];
    for (const f of all) expect(sensitive).not.toContain(f);
  });
});
