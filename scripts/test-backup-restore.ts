/**
 * End-to-end backup/restore verification (Task 182).
 * 1. Snapshot per-table row counts + user passwords hash.
 * 2. Create a backup via storage.createDatabaseBackup().
 * 3. Restore the same backup via storage.restoreDatabaseBackup().
 * 4. Compare row counts before/after, check for failed rows, verify passwords preserved.
 */
import { storage } from "../server/storage";
import { pool } from "../server/db";
import * as fs from "fs";

async function tableCounts(): Promise<Record<string, number>> {
  const t = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`,
  );
  const counts: Record<string, number> = {};
  for (const r of t.rows) {
    const name = r.tablename;
    if (["session", "sessions", "__drizzle_migrations"].includes(name)) continue;
    const c = await pool.query(`SELECT COUNT(*)::int AS n FROM "${name}"`);
    counts[name] = c.rows[0].n;
  }
  return counts;
}

async function main() {
  console.log("=== snapshot before ===");
  const before = await tableCounts();
  const pwBefore = await pool.query(
    `SELECT id, md5(coalesce(password,'')) AS h FROM users ORDER BY id`,
  );

  console.log("=== creating backup ===");
  const backup = await storage.createDatabaseBackup();
  fs.writeFileSync("/tmp/task182-backup.json", backup.data);
  const backupObj = JSON.parse(backup.data);
  const backupCounts: Record<string, number> = {};
  for (const [k, v] of Object.entries(backupObj)) {
    if (Array.isArray(v)) backupCounts[k] = v.length;
  }
  console.log(
    "backup tables:",
    Object.keys(backupCounts).length,
    "total rows:",
    Object.values(backupCounts).reduce((a, b) => a + b, 0),
  );

  console.log("=== restoring ===");
  const result = await storage.restoreDatabaseBackup(backupObj);
  console.log("restore message:", result.message);

  // Report failures
  const failures = (result.tables as any[]).filter(
    (t) => t.status !== "تم" && t.status !== "فارغ",
  );
  console.log("\n=== per-table failures ===");
  if (failures.length === 0) console.log("NONE - all tables restored cleanly");
  for (const f of failures) console.log(`  ${f.table}: ${f.status}`);

  console.log("\n=== count comparison (before vs after vs backup) ===");
  const after = await tableCounts();
  let mismatches = 0;
  for (const t of Object.keys(before).sort()) {
    const b = before[t];
    const a = after[t] ?? 0;
    const bk = backupCounts[t];
    if (b !== a || (bk !== undefined && bk !== a)) {
      mismatches++;
      console.log(`  MISMATCH ${t}: before=${b} backup=${bk ?? "-"} after=${a}`);
    }
  }
  if (mismatches === 0) console.log("ALL COUNTS MATCH");

  console.log("\n=== password preservation ===");
  const pwAfter = await pool.query(
    `SELECT id, md5(coalesce(password,'')) AS h FROM users ORDER BY id`,
  );
  const mapAfter = new Map(pwAfter.rows.map((r: any) => [r.id, r.h]));
  let pwLost = 0;
  for (const r of pwBefore.rows as any[]) {
    if (mapAfter.get(r.id) !== r.h) {
      pwLost++;
      console.log(`  PASSWORD CHANGED/LOST for user id=${r.id}`);
    }
  }
  if (pwLost === 0) console.log("ALL PASSWORDS PRESERVED");

  const ok = failures.length === 0 && mismatches === 0 && pwLost === 0;
  console.log(`\n=== RESULT: ${ok ? "PASS" : "FAIL"} ===`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(2);
});
