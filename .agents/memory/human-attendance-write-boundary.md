---
name: human attendance write boundary
description: Security and concurrency rules for human self-service attendance and geofence withdrawals.
---

# Human attendance write boundary

**Rule:** Human attendance actions must enter through the explicit, location-verified self-service endpoint. Never permit generic/offline entity sync to create or rewrite human attendance. Ignore client-supplied dates and timestamps, and enforce the action sequence from server state.

**Why:** A generic mobile sync path could create a default “present” row without an explicit user action, and concurrent requests could both validate stale state before inserting duplicate transitions.

**How to apply:** Serialize attendance transitions and withdrawal start creation with the same namespaced per-user transaction lock. Resolve later actions to the open shift-day (including night shifts), use server time, and keep automated simulator writes limited to system-user accounts.

**Checkout policy:** Keep valid device coordinates and anti-spoofing checks for checkout, but do not require the employee to still be inside a factory geofence. Expired sessions may be closed only by the explicitly approved attendance-day cutoff rule; the system-created checkout is a withdrawn marker, not evidence of paid work. Other historical corrections remain HR-owned.

**Why:** Workers may leave the premises before pressing checkout, and orphaned check-ins can otherwise block later shifts indefinitely. Treating automatic cutoff as worked checkout would fabricate payroll evidence.

**How to apply:** Treat current-day sessions and the previous night's legitimate checkout separately; only explicit employee actions or the cutoff reconciliation create a new attendance row. The cutoff marker always produces zero paid hours.