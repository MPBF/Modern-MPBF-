/**
 * Savepoint continuity test (Task 182): restore a crafted backup containing
 * good rows plus a deliberately bad row, and verify the bad row is skipped
 * while all good rows land. Then restore the table's original data.
 */
import { storage } from "../server/storage";
import { pool } from "../server/db";
import * as fs from "fs";

const TABLE = "master_batch_colors";

async function main() {
  const full = JSON.parse(fs.readFileSync("/tmp/task182-backup.json", "utf8"));
  const realRows: any[] = full[TABLE];
  if (!Array.isArray(realRows) || realRows.length === 0) {
    console.error(`no rows for ${TABLE} in backup`);
    process.exit(2);
  }
  console.log(`real rows in ${TABLE}: ${realRows.length}`);

  // Craft: all real rows + one bad row (invalid type for id)
  const badRow = { ...realRows[0], id: { not: "a valid scalar for id" } };
  const crafted = {
    metadata: { version: "2.0", created_at: new Date().toISOString() },
    [TABLE]: [...realRows, badRow],
  };

  const res = await storage.restoreDatabaseBackup(crafted);
  const entry = (res.tables as any[]).find((t) => t.table === TABLE);
  console.log("restore entry:", JSON.stringify(entry));

  const c1 = await pool.query(`SELECT COUNT(*)::int AS n FROM "${TABLE}"`);
  const goodLanded = c1.rows[0].n === realRows.length;
  const badSkipped = entry.records === realRows.length && /فشل/.test(entry.status);
  console.log(`after crafted restore: count=${c1.rows[0].n} (expected ${realRows.length})`);
  console.log(`good rows landed: ${goodLanded}, bad row skipped w/ savepoint: ${badSkipped}`);

  // Restore original data for the table
  const res2 = await storage.restoreDatabaseBackup({
    metadata: crafted.metadata,
    [TABLE]: realRows,
  });
  const entry2 = (res2.tables as any[]).find((t) => t.table === TABLE);
  const c2 = await pool.query(`SELECT COUNT(*)::int AS n FROM "${TABLE}"`);
  const restoredClean = entry2.status === "تم" && c2.rows[0].n === realRows.length;
  console.log(`re-restore clean: ${restoredClean} (count=${c2.rows[0].n})`);

  const ok = goodLanded && badSkipped && restoredClean;
  console.log(`\n=== RESULT: ${ok ? "PASS" : "FAIL"} ===`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(2);
});
