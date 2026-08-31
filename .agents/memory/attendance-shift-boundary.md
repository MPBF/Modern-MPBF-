---
name: attendance shift-day boundary
description: Rules for carrying previous-day attendance into the current day without blocking a new day-shift check-in.
---

# Attendance shift boundary

**Rule:** Previous-day attendance may carry into the current date only while
the previous night's 19:00–07:00 Riyadh shift is still active, and only when
the check-in itself belongs to that night-shift window. At exactly 07:00, the
carry-over ends and a fresh day-shift check-in must be available.

Night-shift attendance uses the shift-start date as its business date. A
checkout at or after 07:00 may close that finished session until (but not
including) the next 19:00 shift start; it must never affect the next evening
session. Before 07:00 at a month boundary, use the prior shift-start month's
assignment exclusively, not the new month's future roster.

**Why:** Self-attendance stores actions as separate rows, so a check-in row
retains a null checkout even after a later checkout row is inserted. Treating
any such row from the last 24 hours as open caused yesterday's day session to
block today's 07:00 check-in and could surface yesterday's final status.

**How to apply:** Use the factory's Riyadh date and formal shift windows rather
than UTC dates or a rolling 24-hour test. An open-session lookup must also
check for a later checkout action on the same attendance date. Filter
action-per-row status by action timestamp: check-ins stay inside `[19:00,
07:00)`, while late checkouts remain attached to the finished session only
until the next 19:00 boundary.