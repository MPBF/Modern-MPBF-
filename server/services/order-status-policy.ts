export type ParentOrderStatus =
  | "waiting" | "on_hold" | "for_production" | "in_production"
  | "paused" | "completed" | "delivered" | "cancelled" | "archived";
export type ProductionOrderStatus = "pending" | "active" | "cancelled" | "archived";

export const ORDER_STATUS_GRAPH: Record<ParentOrderStatus, ParentOrderStatus[]> = {
  waiting: ["on_hold", "for_production", "in_production", "paused", "cancelled", "archived"],
  on_hold: ["waiting", "for_production", "in_production", "paused", "cancelled", "archived"],
  for_production: ["waiting", "in_production", "paused", "cancelled", "archived"],
  in_production: ["on_hold", "paused", "completed", "cancelled", "archived"],
  paused: ["waiting", "on_hold", "in_production", "cancelled", "archived"],
  completed: ["in_production", "delivered", "archived"],
  delivered: ["archived"],
  cancelled: ["waiting", "archived"],
  archived: ["waiting", "on_hold", "for_production", "in_production", "paused", "completed", "cancelled", "delivered"],
};

export const CHILD_STATUS_BY_PARENT: Partial<Record<ParentOrderStatus, ProductionOrderStatus>> = {
  waiting: "pending", on_hold: "pending", for_production: "pending",
  in_production: "active", paused: "pending",
};

export const CHILD_CREATION_REJECTED = new Set<ParentOrderStatus>([
  "completed", "delivered", "cancelled", "archived",
]);

export type OrderDomainErrorCode =
  | "INVALID_STATUS" | "INVALID_TRANSITION" | "NOT_FOUND" | "CONFLICT"
  | "COMPLETION_GUARD" | "TERMINAL_PARENT";
export class OrderDomainError extends Error {
  constructor(public readonly code: OrderDomainErrorCode, message: string) {
    super(message);
    this.name = "OrderDomainError";
  }
}

export function orderDomainHttpStatus(error: unknown): number {
  if (!(error instanceof OrderDomainError)) return 500;
  if (error.code === "NOT_FOUND") return 404;
  if (error.code === "CONFLICT") return 409;
  return 400;
}

export function sanitizeOrderAncillaryUpdates(
  updates: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of [
    "order_number", "customer_id", "delivery_days", "delivery_date",
    "notes", "created_by", "share_token",
  ]) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) result[key] = updates[key];
  }
  return result;
}

export function assertExpectedOrderStatus(
  current: string,
  expected?: string | null,
): void {
  if (expected != null && current !== expected) {
    throw new OrderDomainError("CONFLICT", "Order changed concurrently");
  }
}

export interface ChildStatusSnapshot {
  id: number;
  status: string;
  previous_status?: string | null;
}
export interface ChildStatusPatch {
  id: number;
  status: string;
  previous_status?: string | null;
}

export function planOrderChildTransition(
  current: ParentOrderStatus,
  target: ParentOrderStatus,
  children: ChildStatusSnapshot[],
): ChildStatusPatch[] {
  if (current === target) return [];
  if (target === "completed" && current !== "archived" &&
      children.some((child) => child.status !== "completed")) {
    throw new OrderDomainError("COMPLETION_GUARD", "Cannot complete order until every production order is completed");
  }
  if (current === "archived") {
    return children.filter((c) => c.status === "archived").map((c) => ({
      id: c.id, status: c.previous_status || "completed", previous_status: null,
    }));
  }
  if (target === "in_production")
    return children.filter((c) => c.status === "pending").map((c) => ({ id: c.id, status: "active" }));
  if (target === "paused")
    return children.filter((c) => c.status === "active").map((c) => ({ id: c.id, status: "pending" }));
  if (target === "cancelled")
    return children.filter((c) => c.status === "pending" || c.status === "active").map((c) => ({ id: c.id, status: "cancelled" }));
  if (target === "archived")
    return children.filter((c) => ["pending", "active", "completed", "cancelled"].includes(c.status))
      .map((c) => ({ id: c.id, status: "archived", previous_status: c.status }));
  return [];
}