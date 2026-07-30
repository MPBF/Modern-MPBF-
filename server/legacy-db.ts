import { Pool } from "@neondatabase/serverless";

let legacyPool: Pool | null = null;
let legacyPoolInitFailed = false;

export function getLegacyPool(): Pool | null {
  if (legacyPoolInitFailed) return null;
  if (legacyPool) return legacyPool;

  const url = process.env.LEGACY_DATABASE_URL;
  if (!url) return null;

  try {
    legacyPool = new Pool({
      connectionString: url,
      max: 5,
      // Keep connections alive much longer so the first query after an idle
      // period doesn't pay the full TCP + TLS handshake cost. 5 s was too
      // short — a quiet overnight period would drop all connections and the
      // next morning request would see 1–5 s latency on reconnect.
      idleTimeoutMillis: 120_000, // 2 minutes
      connectionTimeoutMillis: 10_000, // fail fast if DB unreachable
    });
    legacyPool.on("error", (err: Error) => {
      console.error("🟠 Legacy DB pool error (non-fatal):", err.message);
    });
    return legacyPool;
  } catch (err) {
    console.error("🟠 Failed to initialize legacy DB pool:", err);
    legacyPoolInitFailed = true;
    return null;
  }
}

export function isLegacyDbConfigured(): boolean {
  return Boolean(process.env.LEGACY_DATABASE_URL);
}
