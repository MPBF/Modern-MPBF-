---
name: attendance shift-day boundary
description: Rules for carrying previous-day attendance into the current day without blocking a new day-shift check-in.
---

# Attendance shift boundary

**Rule:** Each assigned shift snapshot has its own Riyadh attendance-day cutoff
on the *following* calendar day. For a night shift, basic work runs 19:00–03:00,
optional overtime ends 07:00, and the 09:00 cutoff keeps the prior attendance
date through 08:59:59. Day work similarly runs 07:00–15:00 with optional
overtime through 19:00. Checkout is permitted continuously from one grace
period before basic end until one grace period after overtime end, without
paying hours past overtime end. A missed checkout at cutoff is withdrawn, with
zero paid hours and a full-day absence deduction. Flexible shifts retain
their special window behavior.

**Why:** The user clarified that the displayed shift end must mean the end of
eight basic hours (03:00/15:00), not the end of four optional overtime hours
(07:00/19:00). They distinguished attendance-day separation from both and
chose the withdrawn/full-deduction treatment. A
night-to-day change at a month boundary can put yesterday's 09:00 cutoff
checkout inside today's 07:00 day window, causing a duplicate payroll penalty
if actions are grouped by timestamp alone.

**How to apply:** Resolve the current day's check-in window before carrying
yesterday's shift to its cutoff; group fixed-shift actions by their persisted
attendance date, not just overlapping wall-time windows. Self-attendance
stores one row per action, so an open-session lookup must check for a later
checkout on the *same attendance date*. Keep automatic cutoff closure
idempotent under the same per-user lock as manual attendance edits.