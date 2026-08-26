---
name: Maintenance schedule run idempotency
description: Rules for safely running annual preventive-maintenance schedules manually and automatically.
---

Annual schedules must use a unique run record keyed by the **actual run date**. An early manual run records today and leaves the upcoming annual due date unchanged; a due run records the due date and advances it by one year.

**Why:** Treating every manual click as a forced run of `next_due_date` allows a concurrent second click to consume the following annual cycle and produce duplicate preventive actions.

**How to apply:** Lock the schedule before choosing its run date, check for an existing completed run for that date, and keep action creation in a savepoint. Persist a failed run status outside the failed savepoint so the history remains auditable.