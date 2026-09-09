import {
  ORDER_STATUS_GRAPH,
  CHILD_STATUS_BY_PARENT,
  CHILD_CREATION_REJECTED,
  OrderDomainError,
  planOrderChildTransition,
  orderDomainHttpStatus,
  sanitizeOrderAncillaryUpdates,
  assertExpectedOrderStatus,
} from "../server/services/order-status-policy";
import { describe, it, expect } from "@jest/globals";

describe("order status policy", () => {
  it("has exhaustive legacy-compatible graph and child policy", () => {
    expect(Object.keys(ORDER_STATUS_GRAPH).sort()).toEqual([
      "archived", "cancelled", "completed", "delivered", "for_production",
      "in_production", "on_hold", "paused", "waiting",
    ]);
    expect(CHILD_STATUS_BY_PARENT).toEqual({
      waiting: "pending", on_hold: "pending", for_production: "pending",
      in_production: "active", paused: "pending",
    });
    expect([...CHILD_CREATION_REJECTED].sort()).toEqual([
      "archived", "cancelled", "completed", "delivered",
    ]);
  });

  it("does not permit unsafe graph gaps", () => {
    for (const [from, next] of Object.entries(ORDER_STATUS_GRAPH)) {
      for (const to of next) expect(ORDER_STATUS_GRAPH).toHaveProperty(to);
      expect(from).not.toBe("production_stage");
    }
  });

  it("exposes typed domain error codes", () => {
    const e = new OrderDomainError("CONFLICT", "stale");
    expect(e.name).toBe("OrderDomainError");
    expect(e.code).toBe("CONFLICT");
  });

  it.each(["in_production", "paused", "cancelled", "completed"] as const)(
    "restores each archived child before parent target %s",
    (target) => {
      const patches = planOrderChildTransition("archived", target, [
        { id: 1, status: "archived", previous_status: "pending" },
        { id: 2, status: "archived", previous_status: "active" },
        { id: 3, status: "archived", previous_status: "cancelled" },
        { id: 4, status: "archived", previous_status: null },
      ]);
      expect(patches).toEqual([
        { id: 1, status: "pending", previous_status: null },
        { id: 2, status: "active", previous_status: null },
        { id: 3, status: "cancelled", previous_status: null },
        { id: 4, status: "completed", previous_status: null },
      ]);
    },
  );

  it("plans exact mappings without production_stage writes", () => {
    const patches = [
      ...planOrderChildTransition("waiting", "in_production", [
        { id: 1, status: "pending" }, { id: 2, status: "completed" },
      ]),
      ...planOrderChildTransition("in_production", "paused", [
        { id: 3, status: "active" },
      ]),
      ...planOrderChildTransition("paused", "cancelled", [
        { id: 4, status: "pending" }, { id: 5, status: "active" },
      ]),
    ];
    expect(patches.map((p) => p.status)).toEqual(["active", "pending", "cancelled", "cancelled"]);
    expect(patches.every((p) => !("production_stage" in p))).toBe(true);
  });

  it("same archived status is bookkeeping-neutral", () => {
    expect(planOrderChildTransition("archived", "archived", [
      { id: 1, status: "archived", previous_status: "active" },
    ])).toEqual([]);
  });

  it("guards normal completion but permits archived restoration", () => {
    expect(() => planOrderChildTransition("in_production", "completed", [
      { id: 1, status: "active" },
    ])).toThrow(expect.objectContaining({ code: "COMPLETION_GUARD" }));
    expect(planOrderChildTransition("archived", "completed", [
      { id: 1, status: "archived", previous_status: "active" },
    ])).toEqual([{ id: 1, status: "active", previous_status: null }]);
  });

  it("maps domain errors to HTTP status without hiding DB failures", () => {
    expect(orderDomainHttpStatus(new OrderDomainError("INVALID_STATUS", "bad"))).toBe(400);
    expect(orderDomainHttpStatus(new OrderDomainError("NOT_FOUND", "missing"))).toBe(404);
    expect(orderDomainHttpStatus(new OrderDomainError("CONFLICT", "stale"))).toBe(409);
    expect(orderDomainHttpStatus(new Error("db"))).toBe(500);
  });

  it("retains approved PUT fields without inventing a status transition", () => {
    expect(sanitizeOrderAncillaryUpdates({
      customer_id: "CID002", notes: "updated", status: "in_production",
      previous_status: "archived",
    })).toEqual({ customer_id: "CID002", notes: "updated" });
  });

  it("rejects a stale expected prior status", () => {
    expect(() => assertExpectedOrderStatus("paused", "in_production"))
      .toThrow(expect.objectContaining({ code: "CONFLICT" }));
    expect(() => assertExpectedOrderStatus("paused", "paused")).not.toThrow();
  });
});