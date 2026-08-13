/**
 * Integration tests: GET /api/messages/all (admin-only global message log).
 *
 * Guards:
 *  - 401 for unauthenticated requests, 403 for non-admin users.
 *  - Search treats % and _ literally (escaped, no LIKE wildcard expansion).
 *  - Correct total count and limit/offset pagination bounds.
 */
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import express from "express";
import type { AddressInfo } from "net";

// server/routes/shared.ts has top-level code that runs before its own imports
// when transpiled to CJS under ts-jest, so it cannot be loaded in tests.
// The /api/messages routes only use notificationManagerHolder from it.
jest.mock("../server/routes/shared", () => ({
  notificationManagerHolder: { manager: null },
}));
// These are only used by the send/notify endpoints, not GET /api/messages/all.
// Mocking them keeps timers/monitors from holding the process open.
jest.mock("../server/services/notification-manager", () => ({
  getNotificationManager: () => null,
}));
jest.mock("../server/storage", () => ({ storage: {} }));

import { registerMessagesRoutes } from "../server/routes/messages";
import { db, pool } from "../server/db";
import { internal_messages, users } from "../shared/schema";
import { inArray } from "drizzle-orm";

const TAG = "TCASE208";

let server: import("http").Server;
let baseUrl: string;
let senderId: number;
let recipientId: number;
const insertedIds: number[] = [];

function get(path: string, user?: { id: number; permissions: string[] }) {
  return fetch(`${baseUrl}${path}`, {
    headers: user ? { "x-test-user": JSON.stringify(user) } : {},
  });
}

beforeAll(async () => {
  // Pick two existing users to satisfy FK constraints.
  const existing = await db.select({ id: users.id }).from(users).limit(2);
  if (existing.length === 0) throw new Error("No users in DB to run test");
  senderId = existing[0].id;
  recipientId = (existing[1] ?? existing[0]).id;

  // Fixtures: subjects with literal % and _, plus wildcard-decoy subjects
  // that WOULD match if % or _ were treated as LIKE wildcards.
  const subjects = [
    `${TAG} 100% literal`, // target for % search
    `${TAG} 100 anything literal`, // decoy: matches only if % expands
    `${TAG} under_score`, // target for _ search
    `${TAG} underXscore`, // decoy: matches only if _ is a wildcard
    `${TAG} plain one`,
    `${TAG} plain two`,
  ];
  for (const subject of subjects) {
    const [row] = await db
      .insert(internal_messages)
      .values({
        sender_id: senderId,
        recipient_id: recipientId,
        subject,
        body: `${TAG} body`,
        category: "عامة",
      } as any)
      .returning({ id: internal_messages.id });
    insertedIds.push(row.id);
  }

  // Minimal express app with header-injected auth, mirroring middleware/auth.
  const app = express();
  app.use((req: any, _res, next) => {
    const raw = req.headers["x-test-user"];
    if (typeof raw === "string") {
      const u = JSON.parse(raw);
      req.user = {
        id: u.id,
        email: "t@t",
        name: "t",
        role: "t",
        role_id: 99,
        status: "active",
        permissions: u.permissions,
      };
    }
    next();
  });
  await registerMessagesRoutes(app, {});
  server = app.listen(0);
  const addr = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

afterAll(async () => {
  if (insertedIds.length) {
    await db
      .delete(internal_messages)
      .where(inArray(internal_messages.id, insertedIds));
  }
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await pool.end();
});

const admin = () => ({ id: senderId, permissions: ["admin"] });
const nonAdmin = () => ({ id: senderId, permissions: ["view_hr", "manage_hr"] });

describe("GET /api/messages/all — authorization", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await get("/api/messages/all");
    expect(res.status).toBe(401);
  });

  it("returns 403 for authenticated non-admin users", async () => {
    const res = await get("/api/messages/all", nonAdmin());
    expect(res.status).toBe(403);
  });

  it("returns 200 for admin users", async () => {
    const res = await get("/api/messages/all", admin());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.messages)).toBe(true);
    expect(typeof body.total).toBe("number");
  });
});

describe("GET /api/messages/all — literal % and _ search", () => {
  it("treats % literally: matches only the subject containing a real %", async () => {
    const res = await get(
      `/api/messages/all?search=${encodeURIComponent(`${TAG} 100%`)}`,
      admin(),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const subjects = body.messages.map((m: any) => m.subject);
    expect(subjects).toContain(`${TAG} 100% literal`);
    // If % expanded as a wildcard, the decoy "100 anything literal" would match.
    expect(subjects).not.toContain(`${TAG} 100 anything literal`);
    expect(body.total).toBe(1);
  });

  it("treats _ literally: matches only the subject containing a real _", async () => {
    const res = await get(
      `/api/messages/all?search=${encodeURIComponent(`${TAG} under_`)}`,
      admin(),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const subjects = body.messages.map((m: any) => m.subject);
    expect(subjects).toContain(`${TAG} under_score`);
    // If _ were a single-char wildcard, "underXscore" would also match.
    expect(subjects).not.toContain(`${TAG} underXscore`);
    expect(body.total).toBe(1);
  });
});

describe("GET /api/messages/all — total count and pagination bounds", () => {
  it("reports the correct total for a scoped search regardless of limit", async () => {
    const res = await get(
      `/api/messages/all?search=${encodeURIComponent(TAG)}&limit=2`,
      admin(),
    );
    const body = await res.json();
    expect(body.total).toBe(6);
    expect(body.messages).toHaveLength(2);
    expect(body.limit).toBe(2);
    expect(body.offset).toBe(0);
  });

  it("pages through results with limit/offset without overlap or gaps", async () => {
    const pages: number[][] = [];
    for (const offset of [0, 2, 4]) {
      const res = await get(
        `/api/messages/all?search=${encodeURIComponent(TAG)}&limit=2&offset=${offset}`,
        admin(),
      );
      const body = await res.json();
      expect(body.messages.length).toBeLessThanOrEqual(2);
      pages.push(body.messages.map((m: any) => m.id));
    }
    const all = pages.flat();
    expect(all).toHaveLength(6);
    expect(new Set(all).size).toBe(6);
    expect(new Set(all)).toEqual(new Set(insertedIds));
  });

  it("returns an empty page past the end and clamps invalid params", async () => {
    const past = await get(
      `/api/messages/all?search=${encodeURIComponent(TAG)}&limit=2&offset=100`,
      admin(),
    );
    const pastBody = await past.json();
    expect(pastBody.messages).toHaveLength(0);
    expect(pastBody.total).toBe(6);

    // limit is clamped to [1, 200] and offset to >= 0.
    const clamped = await get(
      `/api/messages/all?search=${encodeURIComponent(TAG)}&limit=9999&offset=-5`,
      admin(),
    );
    const clampedBody = await clamped.json();
    expect(clampedBody.limit).toBe(200);
    expect(clampedBody.offset).toBe(0);
    expect(clampedBody.messages).toHaveLength(6);
  });
});
