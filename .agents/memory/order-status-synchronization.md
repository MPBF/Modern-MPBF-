---
name: Order status synchronization
description: Rules for keeping parent orders and production-order statuses consistent without corrupting production history.
---

Parent order status transitions and all related production-order status changes must run through one transaction that locks the parent before its children. Never derive or write `production_stage` from a parent status change; stages remain driven by actual roll execution.

**Why:** Separate parent/child writes left mismatched states. A client-side delete-and-recreate editor was also unsafe: a concurrent archive/cancel could delete production history before replacement creation failed.

**How to apply:** Use the shared transition policy for every status writer. Preserve each child's pre-archive status. New child status is server-authoritative from the locked parent. Do not permit structural child edits until a server-side atomic replacement operation exists.