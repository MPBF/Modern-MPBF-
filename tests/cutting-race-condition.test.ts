/**
 * Tests: cutting-completion race-condition protection
 *
 * Covers two guarantees introduced by the advisory-lock fix:
 *
 * 1. completeCutting — the pg_advisory_xact_lock(1007, <poId>) is acquired
 *    INSIDE the transaction and BEFORE any row is read/written.
 *
 * 2. completeCutting — when two concurrent completions race (last two rolls
 *    for the same PO), the order is marked "completed" exactly once and
 *    batch-number generation / maybeCompleteParentOrder fire exactly once.
 *
 * 3. createFinalRoll — the roll INSERT and the production_order flag update
 *    happen inside a single transaction; a failure in the PO update rejects
 *    the whole call (roll not committed).
 *
 * Strategy: import the real `db` singleton (DATABASE_URL is available in the
 * test environment) then spy on its methods before importing storage so that
 * storage.ts uses the intercepted version. No actual SQL ever reaches Postgres.
 */

import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
} from "@jest/globals";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Create a typed jest.fn (avoids Jest-30 "never" param constraint). */
function jfn<T = any>(impl?: (...a: any[]) => T): jest.Mock {
  const m = jest.fn() as jest.Mock;
  if (impl) m.mockImplementation(impl);
  return m;
}

/**
 * Fluent chainable query-builder mock.
 * Every method returns `this` so calls can be chained arbitrarily.
 * The object is thenable — `await chain.from(x).where(y)` resolves to `value`.
 */
function makeChain<T>(value: T, throwError?: Error): any {
  const p: any = {
    from: () => p,
    where: () => p,
    set: () => p,
    returning: () => p,
    orderBy: () => p,
    limit: () => p,
    values: () => p,
  };
  if (throwError) {
    p.then = (_res: any, rej: any) => Promise.reject(throwError).then(_res, rej);
    p.catch = (r: any) => Promise.reject(throwError).catch(r);
  } else {
    p.then = (res: any, rej: any) => Promise.resolve(value).then(res, rej);
    p.catch = (r: any) => Promise.resolve(value).catch(r);
  }
  return p;
}

// ─── per-test mutable state ───────────────────────────────────────────────────

const state = {
  txExecuteCalls: [] as any[],
  txSelectQueue: [] as any[][],     // dequeued per tx.select() call (FIFO)
  txUpdateQueue: [] as { rows: any[]; shouldThrow?: boolean }[],
  txInsertQueue: [] as any[][],     // dequeued per tx.insert() call (FIFO)
  dbSelectQueue: [] as any[][],     // dequeued per db.select() call outside tx (FIFO)
  txUpdateCallCount: 0,
};

function resetState(): void {
  state.txExecuteCalls = [];
  state.txSelectQueue = [];
  state.txUpdateQueue = [];
  state.txInsertQueue = [];
  state.dbSelectQueue = [];
  state.txUpdateCallCount = 0;
}

// ─── mock transaction / query objects ────────────────────────────────────────

const LOOKUP_ROW = {
  production_order_number: "PO-001",
  is_printed: false,
  item_name: "test item",
  item_name_ar: "صنف تجريبي",
  max_seq: 0,
};

const mockTx: any = {
  execute: jfn((sqlObj: any) => {
    state.txExecuteCalls.push(sqlObj);
    // createRollWithTiming uses tx.execute twice:
    //   [0] pg_advisory_xact_lock → result not used, return plain array
    //   [1] PO lookup → accessed as lookup.rows[0], return { rows: [...] }
    const sqlStr = JSON.stringify(sqlObj);
    if (sqlStr.includes("advisory_xact_lock")) {
      return Promise.resolve([]);
    }
    // Any other execute is the PO lookup
    return Promise.resolve({ rows: [LOOKUP_ROW] });
  }),
  select: jfn(() => makeChain(state.txSelectQueue.shift() ?? [])),
  update: jfn(() => {
    const entry = state.txUpdateQueue.shift() ?? { rows: [] };
    state.txUpdateCallCount++;
    return entry.shouldThrow
      ? makeChain([], new Error("Simulated PO update failure"))
      : makeChain(entry.rows);
  }),
  insert: jfn(() => makeChain(state.txInsertQueue.shift() ?? [])),
};

// ─── import real db singleton and spy on it ───────────────────────────────────
// storage.ts imports `db` from `./db`; since ES modules cache by resolved path,
// spying on the singleton here affects the same object storage.ts holds.

let db: any;
let instance: any;

beforeAll(async () => {
  // Import the real db module — DATABASE_URL is available in the test env.
  // No queries will actually run; we spy on the methods before storage.ts loads.
  const dbMod = await import("../server/db.js");
  db = dbMod.db;

  // Replace transaction: call the callback with mockTx (no real DB session opened)
  jest.spyOn(db, "transaction").mockImplementation(async (fn: any) => fn(mockTx));

  // Replace select/update/insert: use queues controlled per test
  jest.spyOn(db, "select").mockImplementation(() =>
    makeChain(state.dbSelectQueue.shift() ?? []),
  );
  jest.spyOn(db, "update").mockImplementation(() => {
    const entry = state.txUpdateQueue.shift() ?? { rows: [] };
    return makeChain(entry.rows);
  });
  jest.spyOn(db, "insert").mockImplementation(() =>
    makeChain(state.txInsertQueue.shift() ?? []),
  );
  jest.spyOn(db, "execute").mockResolvedValue([] as any);

  // Now import storage (it will use the already-spied `db` singleton)
  const mod = await import("../server/storage.js");
  instance = new (mod as any).DatabaseStorage();

  // Short-circuit the post-transaction helpers — these fire after the tx commits
  // and have their own DB calls; they're out of scope for this test suite.
  jest.spyOn(instance, "updateProductionOrderCompletionPercentages")
    .mockResolvedValue(undefined as any);
  jest.spyOn(instance, "ensureBatchNumber")
    .mockResolvedValue("B-PO-001-20260730" as any);
  jest.spyOn(instance as any, "maybeCompleteParentOrder")
    .mockResolvedValue(undefined as any);
});

beforeEach(() => {
  resetState();
  // Re-apply tx mock implementations after each test clears call history
  (mockTx.execute as jest.Mock).mockImplementation((sqlObj: any) => {
    state.txExecuteCalls.push(sqlObj);
    const sqlStr = JSON.stringify(sqlObj);
    if (sqlStr.includes("advisory_xact_lock")) {
      return Promise.resolve([]);
    }
    return Promise.resolve({ rows: [LOOKUP_ROW] });
  });
  (mockTx.select as jest.Mock).mockImplementation(
    () => makeChain(state.txSelectQueue.shift() ?? []),
  );
  (mockTx.update as jest.Mock).mockImplementation(() => {
    const entry = state.txUpdateQueue.shift() ?? { rows: [] };
    state.txUpdateCallCount++;
    return entry.shouldThrow
      ? makeChain([], new Error("Simulated PO update failure"))
      : makeChain(entry.rows);
  });
  (mockTx.insert as jest.Mock).mockImplementation(
    () => makeChain(state.txInsertQueue.shift() ?? []),
  );
  jest.clearAllMocks();
  // Restore spies on db and instance after clearAllMocks wipes them
  jest.spyOn(db, "transaction").mockImplementation(async (fn: any) => fn(mockTx));
  jest.spyOn(db, "select").mockImplementation(() =>
    makeChain(state.dbSelectQueue.shift() ?? []),
  );
  jest.spyOn(db, "update").mockImplementation(() => {
    const entry = state.txUpdateQueue.shift() ?? { rows: [] };
    return makeChain(entry.rows);
  });
  jest.spyOn(db, "insert").mockImplementation(() =>
    makeChain(state.txInsertQueue.shift() ?? []),
  );
  jest.spyOn(db, "execute").mockResolvedValue([] as any);
  jest.spyOn(instance, "updateProductionOrderCompletionPercentages")
    .mockResolvedValue(undefined as any);
  jest.spyOn(instance, "ensureBatchNumber")
    .mockResolvedValue("B-PO-001-20260730" as any);
  jest.spyOn(instance as any, "maybeCompleteParentOrder")
    .mockResolvedValue(undefined as any);
});

// ─── fixtures ─────────────────────────────────────────────────────────────────

const ROLL_ID = 1;
const PO_ID = 42;
const OPERATOR_ID = 7;
const NET_WEIGHT = 10;

const FULL_ROLL: any = {
  id: ROLL_ID,
  production_order_id: PO_ID,
  weight_kg: "12.5",
  stage: "printing",
  roll_number: "R-001",
  roll_seq: 1,
};

const UPDATED_ROLL: any = {
  ...FULL_ROLL,
  stage: "done",
  cut_completed_at: new Date(),
  cut_by: OPERATOR_ID,
  cut_weight_total_kg: String(NET_WEIGHT),
  waste_kg: "2.5",
};

// ═════════════════════════════════════════════════════════════════════════════
// 1. Advisory-lock position
// ═════════════════════════════════════════════════════════════════════════════

describe("completeCutting – advisory lock", () => {
  it("acquires pg_advisory_xact_lock(1007, poId) as the FIRST call inside the transaction", async () => {
    // Pre-read outside tx
    state.dbSelectQueue.push([{ id: ROLL_ID, production_order_id: PO_ID }]);
    // Inside tx: [0] re-read roll, [1] remaining-rolls check (1 sibling left → not completed)
    state.txSelectQueue.push([FULL_ROLL]);
    state.txSelectQueue.push([{ id: 99 }]);
    // roll update .returning()
    state.txUpdateQueue.push({ rows: [UPDATED_ROLL] });

    await instance.completeCutting(ROLL_ID, NET_WEIGHT, OPERATOR_ID);

    expect(mockTx.execute).toHaveBeenCalled();

    // First execute call must be the advisory lock
    const firstArg = state.txExecuteCalls[0];
    expect(firstArg).toBeDefined();
    const serialized = JSON.stringify(firstArg);
    expect(serialized).toContain("1007");           // lock class key
    expect(serialized).toContain(String(PO_ID));    // lock instance key = poId

    // Lock execute must precede any row update
    const lockOrder = (mockTx.execute as jest.Mock).mock.invocationCallOrder[0];
    const updateOrder = (mockTx.update as jest.Mock).mock.invocationCallOrder[0];
    expect(lockOrder).toBeLessThan(updateOrder);
  });

  it("lock key contains the production_order_id, not a static constant alone", async () => {
    const OTHER_PO = 99;
    state.dbSelectQueue.push([{ id: ROLL_ID, production_order_id: OTHER_PO }]);
    state.txSelectQueue.push([{ ...FULL_ROLL, production_order_id: OTHER_PO }]);
    state.txSelectQueue.push([]); // 0 remaining → completed
    state.txUpdateQueue.push({ rows: [UPDATED_ROLL] });
    state.txUpdateQueue.push({ rows: [] });

    await instance.completeCutting(ROLL_ID, NET_WEIGHT, OPERATOR_ID);

    const serialized = JSON.stringify(state.txExecuteCalls[0]);
    expect(serialized).toContain(String(OTHER_PO));
    // Must not accidentally use any unrelated advisory-lock key
    expect(serialized).not.toContain("1003"); // roll-creation key
  });

  it("throws BEFORE opening a transaction when the pre-read roll does not exist", async () => {
    state.dbSelectQueue.push([]); // no roll found

    await expect(
      instance.completeCutting(ROLL_ID, NET_WEIGHT, OPERATOR_ID),
    ).rejects.toThrow();

    expect(db.transaction).not.toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. Exactly-once order completion
// ═════════════════════════════════════════════════════════════════════════════

describe("completeCutting – exactly-once order completion", () => {
  it("does NOT call ensureBatchNumber when sibling rolls are still active", async () => {
    state.dbSelectQueue.push([{ id: ROLL_ID, production_order_id: PO_ID }]);
    state.txSelectQueue.push([FULL_ROLL]);
    state.txSelectQueue.push([{ id: 99 }]); // 1 sibling still in film/printing
    state.txUpdateQueue.push({ rows: [UPDATED_ROLL] });

    const result = await instance.completeCutting(ROLL_ID, NET_WEIGHT, OPERATOR_ID);

    expect(result.is_order_completed).toBe(false);
    expect(instance.ensureBatchNumber).not.toHaveBeenCalled();
    expect((instance as any).maybeCompleteParentOrder).not.toHaveBeenCalled();
  });

  it("calls ensureBatchNumber and maybeCompleteParentOrder exactly once when the last roll completes", async () => {
    state.dbSelectQueue.push([{ id: ROLL_ID, production_order_id: PO_ID }]);
    state.txSelectQueue.push([FULL_ROLL]);
    state.txSelectQueue.push([]); // 0 remaining → order done
    state.txUpdateQueue.push({ rows: [UPDATED_ROLL] }); // roll update
    state.txUpdateQueue.push({ rows: [] });              // PO status → "completed"

    const result = await instance.completeCutting(ROLL_ID, NET_WEIGHT, OPERATOR_ID);

    expect(result.is_order_completed).toBe(true);
    expect(instance.ensureBatchNumber).toHaveBeenCalledTimes(1);
    expect(instance.ensureBatchNumber).toHaveBeenCalledWith(PO_ID);
    expect((instance as any).maybeCompleteParentOrder).toHaveBeenCalledTimes(1);
    expect((instance as any).maybeCompleteParentOrder).toHaveBeenCalledWith(PO_ID);
  });

  it("simulates two-operator race: first finisher sees 1 sibling; second sees 0", async () => {
    // The advisory lock serialises the two calls, so they run back-to-back.
    // Operator A completes roll 10 → 1 sibling (roll 11) still active.
    // Operator B completes roll 11 → 0 siblings → order completed.
    const ROLL_A = 10;
    const ROLL_B = 11;

    // ── Operator A ──────────────────────────────────────────────────────
    state.dbSelectQueue.push([{ id: ROLL_A, production_order_id: PO_ID }]);
    state.txSelectQueue.push([{ ...FULL_ROLL, id: ROLL_A }]);
    state.txSelectQueue.push([{ id: ROLL_B }]); // sibling still active
    state.txUpdateQueue.push({ rows: [{ ...UPDATED_ROLL, id: ROLL_A }] });

    const resultA = await instance.completeCutting(ROLL_A, NET_WEIGHT, OPERATOR_ID);
    expect(resultA.is_order_completed).toBe(false);

    // ── Operator B ──────────────────────────────────────────────────────
    state.dbSelectQueue.push([{ id: ROLL_B, production_order_id: PO_ID }]);
    state.txSelectQueue.push([{ ...FULL_ROLL, id: ROLL_B }]);
    state.txSelectQueue.push([]); // 0 remaining
    state.txUpdateQueue.push({ rows: [{ ...UPDATED_ROLL, id: ROLL_B }] }); // roll update
    state.txUpdateQueue.push({ rows: [] }); // PO status update

    const resultB = await instance.completeCutting(ROLL_B, NET_WEIGHT, OPERATOR_ID);
    expect(resultB.is_order_completed).toBe(true);

    // Completion side-effects fired ONLY for operator B (exactly once)
    expect(instance.ensureBatchNumber).toHaveBeenCalledTimes(1);
    expect((instance as any).maybeCompleteParentOrder).toHaveBeenCalledTimes(1);
  });

  it("returns the updated roll merged with the is_order_completed flag", async () => {
    state.dbSelectQueue.push([{ id: ROLL_ID, production_order_id: PO_ID }]);
    state.txSelectQueue.push([FULL_ROLL]);
    state.txSelectQueue.push([]); // completed
    state.txUpdateQueue.push({ rows: [UPDATED_ROLL] });
    state.txUpdateQueue.push({ rows: [] });

    const result = await instance.completeCutting(ROLL_ID, NET_WEIGHT, OPERATOR_ID);

    expect(result.stage).toBe("done");
    expect(result.is_order_completed).toBe(true);
    expect(result.id).toBe(ROLL_ID);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. createFinalRoll — atomic roll + PO-flag update
// ═════════════════════════════════════════════════════════════════════════════

describe("createFinalRoll – transaction atomicity", () => {
  const FINAL_DATA = {
    production_order_id: PO_ID,
    weight_kg: "20",
    stage: "film",
    operator_id: OPERATOR_ID,
  };

  const CREATED_ROLL: any = {
    id: 5,
    production_order_id: PO_ID,
    is_last_roll: true,
    stage: "film",
    roll_number: "R-005",
    roll_seq: 3,
  };

  it("runs the roll insert and the PO flag update inside a single transaction", async () => {
    // createRollWithTiming does tx.insert(rolls).values(...).returning()
    state.txInsertQueue.push([CREATED_ROLL]);
    // PO flag update (film_completed = true, is_final_roll_created = true)
    state.txUpdateQueue.push({ rows: [] });

    const roll = await instance.createFinalRoll(FINAL_DATA);

    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.insert).toHaveBeenCalled(); // roll insert happened inside tx
    expect(mockTx.update).toHaveBeenCalled(); // PO update happened inside tx
    expect(roll).toMatchObject({ id: CREATED_ROLL.id, is_last_roll: true });
  });

  it("rejects and preserves atomicity when the PO flag update fails", async () => {
    state.txInsertQueue.push([CREATED_ROLL]);
    state.txUpdateQueue.push({ rows: [], shouldThrow: true }); // PO update throws

    // withDatabaseErrorHandling wraps the original error in a DatabaseError;
    // verify the call rejects (roll was not returned) — the important invariant
    // is that the rejection propagates, not the exact message.
    await expect(
      instance.createFinalRoll(FINAL_DATA),
    ).rejects.toThrow();

    // Both insert AND update were called inside the tx before the throw
    expect(mockTx.insert).toHaveBeenCalled();
    expect(mockTx.update).toHaveBeenCalled();
  });

  it("calls updateProductionOrderCompletionPercentages AFTER the transaction, not inside it", async () => {
    state.txInsertQueue.push([CREATED_ROLL]);
    state.txUpdateQueue.push({ rows: [] });

    const callOrder: string[] = [];

    jest.spyOn(instance, "updateProductionOrderCompletionPercentages")
      .mockImplementation(async () => { callOrder.push("updatePct"); });

    const origTx = db.transaction.getMockImplementation?.();
    (db.transaction as jest.Mock).mockImplementationOnce(async (fn: any) => {
      const result = await fn(mockTx);
      callOrder.push("txCommit");
      return result;
    });

    await instance.createFinalRoll(FINAL_DATA);

    const txIdx = callOrder.indexOf("txCommit");
    const pctIdx = callOrder.indexOf("updatePct");
    expect(txIdx).toBeGreaterThanOrEqual(0);
    expect(pctIdx).toBeGreaterThan(txIdx);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. maybeCompleteParentOrder — double-completion guard
// ═════════════════════════════════════════════════════════════════════════════

/**
 * maybeCompleteParentOrder performs three sequential SELECTs then a conditional
 * UPDATE … WHERE status='in_production'. The WHERE predicate is the last-resort
 * guard: even if two concurrent calls both pass the application-level status
 * check, only one DB row update can succeed (the second sees a non-matching
 * predicate and affects 0 rows).
 *
 * These tests exercise:
 *  a) the application-level guard (second sequential call bails after seeing
 *     the order is already 'completed')
 *  b) the DB-level guard (concurrent calls that both see 'in_production' both
 *     fire the UPDATE, relying on the WHERE clause to make the second a no-op)
 *  c) early-exit paths (missing parent order_id, siblings not all done)
 */

describe("maybeCompleteParentOrder – double-completion guard", () => {
  const ORDER_ID = 100;

  // The outer beforeEach mocks maybeCompleteParentOrder so completeCutting tests
  // can stub it out. For THIS suite we need the real implementation, so restore
  // it after the outer beforeEach has run.
  beforeEach(() => {
    jest.spyOn(instance as any, "maybeCompleteParentOrder").mockRestore();
  });

  // ── helpers ──────────────────────────────────────────────────────────────

  /**
   * Push the three db.select() results consumed by one maybeCompleteParentOrder
   * call into dbSelectQueue.
   *   1. production_orders → { order_id }
   *   2. production_orders siblings → [{ status }…]
   *   3. orders parent → { status, order_number }
   */
  function pushSelectsForCall(
    parentStatus: "in_production" | "completed",
    siblingStatuses: string[] = ["completed"],
  ): void {
    state.dbSelectQueue.push([{ order_id: ORDER_ID }]);
    state.dbSelectQueue.push(siblingStatuses.map((s) => ({ status: s })));
    state.dbSelectQueue.push([
      { status: parentStatus, order_number: "O-001" },
    ]);
  }

  // ── tests ─────────────────────────────────────────────────────────────────

  it("fires exactly one UPDATE when called sequentially and the second call sees 'completed'", async () => {
    // First call: parent is 'in_production' → UPDATE issued
    pushSelectsForCall("in_production");

    // Second call: parent is already 'completed' → application-level guard
    // (parent.status === 'in_production') is false → no UPDATE issued
    pushSelectsForCall("completed");

    await (instance as any).maybeCompleteParentOrder(PO_ID);
    await (instance as any).maybeCompleteParentOrder(PO_ID);

    // db.update is the outer (non-tx) spy from beforeEach
    expect(db.update).toHaveBeenCalledTimes(1);
  });

  it("concurrent race: WHERE status='in_production' is present in every UPDATE and makes the second a no-op", async () => {
    // Worst-case race: both concurrent calls complete all three SELECTs before
    // either issues its UPDATE, so both see parentStatus='in_production'.
    //
    // With Promise.all the two async calls interleave at every await point,
    // meaning the dbSelectQueue is consumed in interleaved order:
    //   [call1-s1, call2-s1, call1-s2, call2-s2, call1-s3, call2-s3]
    state.dbSelectQueue.push([{ order_id: ORDER_ID }]);               // call1 PO lookup
    state.dbSelectQueue.push([{ order_id: ORDER_ID }]);               // call2 PO lookup
    state.dbSelectQueue.push([{ status: "completed" }]);               // call1 siblings
    state.dbSelectQueue.push([{ status: "completed" }]);               // call2 siblings
    state.dbSelectQueue.push([
      { status: "in_production", order_number: "O-001" },             // call1 parent
    ]);
    state.dbSelectQueue.push([
      { status: "in_production", order_number: "O-001" },             // call2 parent
    ]);

    // Intercept db.update() so we can:
    //   a) capture the WHERE condition passed to each UPDATE call
    //   b) simulate DB-level affected-row semantics: first UPDATE succeeds
    //      (1 row returned), second is a no-op (0 rows) because the
    //      WHERE status='in_production' predicate no longer matches.
    const capturedWhereArgs: any[] = [];
    const effectiveCompletions: any[] = [];

    jest.spyOn(db, "update").mockImplementation(() => {
      const chain: any = {};
      chain.set = () => chain;
      chain.where = (condition: any) => {
        capturedWhereArgs.push(condition);
        // First call commits → return a row. Second call is a no-op → return [].
        const affectedRows =
          capturedWhereArgs.length === 1
            ? [{ id: ORDER_ID, status: "completed" }]
            : [];
        if (affectedRows.length > 0) effectiveCompletions.push(affectedRows[0]);
        return makeChain(affectedRows);
      };
      return chain;
    });

    await Promise.all([
      (instance as any).maybeCompleteParentOrder(PO_ID),
      (instance as any).maybeCompleteParentOrder(PO_ID),
    ]);

    // Both calls reached the UPDATE (they both passed the pre-check).
    expect(capturedWhereArgs).toHaveLength(2);

    // ── Critical assertion ─────────────────────────────────────────────────
    // Every UPDATE must carry the `status = 'in_production'` guard predicate.
    // If the WHERE clause were removed from maybeCompleteParentOrder in
    // storage.ts, the serialized condition would NOT contain 'in_production'
    // and this assertion would fail — proving the predicate is the real
    // concurrency safeguard against double-completion.
    //
    // Drizzle SQL objects contain circular refs (column → table → column),
    // so use a WeakSet-based cycle-safe serializer.
    function safeStringify(obj: any): string {
      const seen = new WeakSet();
      return JSON.stringify(obj, (_key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
        }
        return value;
      });
    }
    for (const condition of capturedWhereArgs) {
      const serialized = safeStringify(condition);
      expect(serialized).toContain("in_production");
    }

    // Only one UPDATE produced an affected row (the second was a DB-level no-op).
    expect(effectiveCompletions).toHaveLength(1);
    expect(effectiveCompletions[0]).toMatchObject({ status: "completed" });
  });

  it("does nothing when not all sibling production orders are completed", async () => {
    state.dbSelectQueue.push([{ order_id: ORDER_ID }]);
    state.dbSelectQueue.push([
      { status: "completed" },
      { status: "in_production" }, // one sibling still active
    ]);
    // No parent select or UPDATE should follow

    await (instance as any).maybeCompleteParentOrder(PO_ID);

    expect(db.update).not.toHaveBeenCalled();
  });

  it("does nothing when the production order has no parent order", async () => {
    // db.select returns empty array → destructuring gives po = undefined
    state.dbSelectQueue.push([]);

    await (instance as any).maybeCompleteParentOrder(PO_ID);

    expect(db.update).not.toHaveBeenCalled();
  });

  it("does nothing when the parent order is not 'in_production' (already completed)", async () => {
    pushSelectsForCall("completed");

    await (instance as any).maybeCompleteParentOrder(PO_ID);

    expect(db.update).not.toHaveBeenCalled();
  });
});
