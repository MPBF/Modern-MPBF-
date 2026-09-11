import { describe, expect, it } from "@jest/globals";
import {
  orderStructureEditDecision,
  productionOrderStructureChanged,
  validProductionOrderStructure,
} from "../shared/order-production-structure";

describe("order editor production structure", () => {
  const existing = [
    { customer_product_id: 10, quantity_kg: "25.00" },
    { customer_product_id: 20, quantity_kg: "5" },
  ];

  it("treats identical and reordered structures as detail-only edits", () => {
    expect(productionOrderStructureChanged(existing, [
      { customer_product_id: 20, quantity_kg: 5 },
      { customer_product_id: "10", quantity_kg: 25 },
    ])).toBe(false);
    expect(orderStructureEditDecision("in_production", existing, existing))
      .toEqual({ changed: false, blocked: false });
  });

  it("detects quantity and product changes", () => {
    expect(productionOrderStructureChanged(existing, [
      { customer_product_id: 10, quantity_kg: 26 },
      { customer_product_id: 20, quantity_kg: 5 },
    ])).toBe(true);
    expect(productionOrderStructureChanged(existing, [
      { customer_product_id: 11, quantity_kg: 25 },
      { customer_product_id: 20, quantity_kg: 5 },
    ])).toBe(true);
  });

  it.each(["waiting", "in_production", "paused", "completed", "delivered", "cancelled", "archived"])(
    "blocks %s structural changes before mutation",
    (status) => {
      expect(orderStructureEditDecision(status, existing, [
        { customer_product_id: 10, quantity_kg: 99 },
      ])).toEqual({ changed: true, blocked: true });
    },
  );

  it("normalizes quantities and removes invalid proposed rows", () => {
    expect(validProductionOrderStructure([
      { customer_product_id: 1, quantity_kg: "2.50" },
      { customer_product_id: "", quantity_kg: 3 },
      { customer_product_id: 2, quantity_kg: 0 },
    ])).toEqual([{ customer_product_id: 1, quantity_kg: 2.5 }]);
  });

  it("never authorizes destructive replacement", () => {
    const additions = [...existing, { customer_product_id: 30, quantity_kg: 1 }];
    const removals = existing.slice(0, 1);
    expect(orderStructureEditDecision("waiting", existing, additions).blocked).toBe(true);
    expect(orderStructureEditDecision("in_production", existing, removals).blocked).toBe(true);
  });
});