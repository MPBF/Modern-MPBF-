---
name: Production hall receipt visibility
description: User-confirmed rule for showing finished goods awaiting warehouse receipt.
---

Show an order in the production hall only while its finished, ready-to-receive weight exceeds its warehouse-received weight. A fully received order disappears, even if the produced weight is below the originally ordered quantity. If additional rolls finish later, the order should reappear for their unreceived weight.

**Why:** The user explicitly confirmed that the production hall is a queue of goods actually waiting for receipt, not a queue of orders still short of their planned quantity.

**How to apply:** Base hall visibility on the same done-roll ready-weight calculation used by warehouse receipt validation; partial receipts remain visible, and a fully received order is excluded until more ready stock exists.