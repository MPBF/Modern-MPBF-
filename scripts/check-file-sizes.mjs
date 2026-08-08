#!/usr/bin/env node
// Fails when any file in server/routes/ or server/storage/ exceeds the line limit.
// Prevents routes.ts/storage.ts-style file bloat from returning after the restructure.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIRS = ["server/routes", "server/storage"];
const DEFAULT_LIMIT = 3000;

// Grandfathered files: already above the default limit when this check was added.
// Frozen at their size then — any growth fails. Shrink them over time, then remove entries.
const OVERRIDES = {};

const offenders = [];
for (const dir of DIRS) {
  for (const entry of readdirSync(dir)) {
    if (!/\.(ts|tsx|js|mjs)$/.test(entry)) continue;
    const path = join(dir, entry);
    const content = readFileSync(path, "utf8");
    const parts = content.split("\n");
    const lines = parts[parts.length - 1] === "" ? parts.length - 1 : parts.length;
    const limit = OVERRIDES[path] ?? DEFAULT_LIMIT;
    if (lines > limit) offenders.push({ path, lines, limit });
  }
}

if (offenders.length) {
  console.error("File size check FAILED — split these files into smaller modules:");
  for (const { path, lines, limit } of offenders) {
    console.error(`  ${path}: ${lines} lines (limit ${limit})`);
  }
  process.exit(1);
}
console.log(`File size check passed (limit ${DEFAULT_LIMIT} lines in ${DIRS.join(", ")}).`);
