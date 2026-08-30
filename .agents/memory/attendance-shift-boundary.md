---
name: attendance shift-day boundary
description: Rules for carrying previous-day attendance into the current day without blocking a new day-shift check-in.
---

# Attendance shift boundary

**Rule:** Previous-day attendance may carry into the current date only while
the previous night's 19:00–07:00 Riyadh shift is still active, and only when
the check-in itself belongs to that night-shift window. At exactly 07:00, the
carry-over ends and a fresh day-shift check-in must be available.

**Why:** Self-attendance stores actions as separate rows, so a check-in row
retains a null checkout even after a later checkout row is inserted. Treating
any such row from the last 24 hours as open caused yesterday's day session to
block today's 07:00 check-in and could surface yesterday's final status.

**How to apply:** Use the factory's Riyadh date and formal shift windows rather
than UTC dates or a rolling 24-hour test. An open-session lookup must also
check for a later checkout action on the same attendance date.