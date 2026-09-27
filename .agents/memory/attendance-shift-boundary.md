---
name: attendance shift-day boundary
description: Rules for carrying previous-day attendance into the current day without blocking a new day-shift check-in.
---

# Attendance shift boundary

**Rule:** Each assigned shift snapshot has its own Riyadh attendance-day cutoff
on the *following* calendar day. For a night shift ending 07:00, a 09:00 cutoff
means the prior attendance date continues until 08:59:59; from 09:00 the new
attendance date applies. A shared grace value defines symmetric admission
windows around the official start (check-in) and end (checkout), without
extending paid work beyond the official shift window. A missed checkout at
cutoff is recorded as withdrawn, with zero paid hours and a full-day absence
deduction. The flexible shift keeps its special time-window behavior.

**Why:** The user explicitly distinguished attendance-day separation from the
official shift end and chose the withdrawn/full-deduction treatment. A
night-to-day change at a month boundary can put yesterday's 09:00 cutoff
checkout inside today's 07:00 day window, causing a duplicate payroll penalty
if actions are grouped by timestamp alone.

**How to apply:** Resolve the current day's check-in window before carrying
yesterday's shift to its cutoff; group fixed-shift actions by their persisted
attendance date, not just overlapping wall-time windows. Self-attendance
stores one row per action, so an open-session lookup must check for a later
checkout on the *same attendance date*. Keep automatic cutoff closure
idempotent under the same per-user lock as manual attendance edits.