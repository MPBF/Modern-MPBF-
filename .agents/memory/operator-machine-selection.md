---
name: Operator machine selection
description: Confirmed interaction rules for machine pickers on worker production dashboards.
---

**Rule:** A machine selected from a worker dashboard is saved immediately. The
picker must leave edit mode, confirm the selected machine, and keep the
“Change” action available so the operator can select another machine later.
The selector itself must remain directly usable even when a saved machine is
shown; do not make a separate edit mode the only way to unlock it.
Machine names are the visible labels; IDs remain internal fallbacks.
The film selector belongs on the dashboard before an order is opened, with
the same selection reflected in the roll-creation form.

**Why:** The user confirmed immediate saving with continued ability to change.
Leaving the picker in edit mode made a successful local selection appear not
to work. Locking the picker behind edit mode made the saved printer appear
permanently fixed on machine A in the development dashboard.
The user later confirmed that a selector only inside the roll-creation dialog
does not satisfy the film operator's dashboard workflow.

**How to apply:** Use this behavior consistently for film, printing, and
cutting operator machine selectors. The selected ID remains the value sent to
production endpoints.