---
name: Workflow port detection
description: A workflow readiness timeout may disagree with the actual dev-server health in this workspace.
---

If the managed application workflow times out waiting for port 5000, do not immediately infer that the app crashed or that its port changed. Check its startup log, the listener, and both the local and proxied HTTP responses before changing code or port settings.

**Why:** The workflow reported repeated port-readiness timeouts even though the same dev command started successfully and both the local and proxied preview returned HTTP 200 when run independently. This can be a workflow detection issue rather than an application failure.

**How to apply:** Diagnose once using the workflow logs and a direct server health check; avoid repeated blind restarts or unrelated configuration changes. An independently started process proves app health, but it does not repair the managed workflow.