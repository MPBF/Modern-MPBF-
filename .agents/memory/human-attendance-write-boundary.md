---
name: human attendance write boundary
description: Security and concurrency rules for human self-service attendance and geofence withdrawals.
---

# Human attendance write boundary

**Rule:** Human attendance actions must enter through the explicit, location-verified self-service endpoint. Never permit generic/offline entity sync to create or rewrite human attendance. Ignore client-supplied dates and timestamps, and enforce the action sequence from server state.

**Why:** A generic mobile sync path could create a default “present” row without an explicit user action, and concurrent requests could both validate stale state before inserting duplicate transitions.

**How to apply:** Serialize attendance transitions and withdrawal start creation with the same namespaced per-user transaction lock. Resolve later actions to the open shift-day (including night shifts), use server time, and keep automated simulator writes limited to system-user accounts.