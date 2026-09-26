---
name: human attendance write boundary
description: Security and concurrency rules for human self-service attendance and geofence withdrawals.
---

# Human attendance write boundary

**Rule:** Human attendance actions must enter through the explicit, location-verified self-service endpoint. Never permit generic/offline entity sync to create or rewrite human attendance. Ignore client-supplied dates and timestamps, and enforce the action sequence from server state.

**Why:** A generic mobile sync path could create a default “present” row without an explicit user action, and concurrent requests could both validate stale state before inserting duplicate transitions.

**How to apply:** Serialize attendance transitions and withdrawal start creation with the same namespaced per-user transaction lock. Resolve later actions to the open shift-day (including night shifts), use server time, and keep automated simulator writes limited to system-user accounts.

**Checkout policy:** Keep valid device coordinates and anti-spoofing checks for checkout, but do not require the employee to still be inside a factory geofence. Ignore old unmatched sessions for new-day actions without inventing a checkout time or changing historical records; HR must review corrections.

**Why:** Workers may leave the premises before pressing checkout, and orphaned check-ins can otherwise block later shifts indefinitely. Automatically backdating checkout would fabricate payroll evidence.

**How to apply:** Treat current-day sessions and the previous night's legitimate late checkout separately; only the explicit employee action creates the new attendance row.