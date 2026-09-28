---
name: Film final roll policy
description: The operator may explicitly close film production before reaching the requested weight.
---

# Film final roll policy

The film operator is allowed to close a production order's film stage by creating the final roll even when the required quantity has not been reached. Do not impose a remaining-weight percentage threshold on the availability of that action.

**Why:** The user explicitly confirmed that early closure via "آخر رول" is intended business behavior. A UI threshold that hides this option above 15% remaining prevents the intended workflow, even if the final-roll API accepts it.

**How to apply:** When reviewing or changing the film board, keep the final-roll action available for eligible in-progress orders regardless of remaining quantity. Confirmation for a large remaining quantity may be retained as a warning, not a prohibition. Keep the normal-roll endpoint distinct from final-roll closure so the flag cannot be used only to bypass quota checks.