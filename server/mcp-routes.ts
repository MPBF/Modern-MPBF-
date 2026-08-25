import { randomUUID } from "crypto";
import crypto from "crypto";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcp_api_keys } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

import { db } from "./db";
import { validateOAuthToken } from "./mcp-oauth";
import { createMcpServer } from "./mcp-server";
import type { McpAuthContext } from "./mcp-types";
import { getMcpUserPermissions } from "./mcp-user-permissions";
import { requireAuth, requireAdmin, type AuthRequest } from "./middleware/auth";

import type { Express, Request, Response } from "express";

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function generateApiKey(): string {
  return "mpbf_" + crypto.randomBytes(32).toString("hex");
}

async function validateApiKey(key: string): Promise<McpAuthContext | null> {
  try {
    const keyHash = hashApiKey(key);
    const result = await db
      .select()
      .from(mcp_api_keys)
      .where(
        and(
          eq(mcp_api_keys.key_hash, keyHash),
          eq(mcp_api_keys.is_active, true),
        ),
      )
      .limit(1);

    if (result.length > 0) {
      db.update(mcp_api_keys)
        .set({ last_used_at: new Date() })
        .where(eq(mcp_api_keys.id, result[0].id))
        .catch(() => {});
      return {
        apiKeyId: result[0].id,
        userId: result[0].created_by,
        scopes: ["mcp:read"],
        permissions: await getMcpUserPermissions(result[0].created_by),
        voiceAccess: result[0].voice_access,
        voiceAllowlistBypass: result[0].voice_allowlist_bypass,
      };
    }
    return null;
  } catch (error) {
    console.error("Error validating MCP API key:", error);
    return null;
  }
}

async function validateBearerToken(
  token: string,
): Promise<McpAuthContext | null> {
  if (token.startsWith("mpbf_")) {
    return validateApiKey(token);
  }
  return validateOAuthToken(token);
}

function extractAndValidateBearer(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

function getBaseUrl(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  return `${proto}://${host}`;
}

// Advertise the OAuth Protected Resource Metadata (RFC 9728) on 401 so MCP
// clients (e.g. ChatGPT) can discover the authorization server and perform
// Dynamic Client Registration. Without this header the client never learns
// where to register/authorize and connection setup fails.
function setWwwAuthenticate(req: Request, res: Response): void {
  const baseUrl = getBaseUrl(req);
  res.setHeader(
    "WWW-Authenticate",
    `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
  );
}

const authFailures = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_FAILURES = 10;

function isRateLimited(ip: string): boolean {
  const entry = authFailures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.lastAttempt > RATE_LIMIT_WINDOW_MS) {
    authFailures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordAuthFailure(ip: string): void {
  const entry = authFailures.get(ip);
  if (entry && Date.now() - entry.lastAttempt < RATE_LIMIT_WINDOW_MS) {
    entry.count++;
    entry.lastAttempt = Date.now();
  } else {
    authFailures.set(ip, { count: 1, lastAttempt: Date.now() });
  }
}

export function registerMcpRoutes(app: Express) {
  const transports = new Map<
    string,
    { transport: StreamableHTTPServerTransport; auth: McpAuthContext }
  >();

  app.post("/mcp", async (req: Request, res: Response) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      if (isRateLimited(clientIp)) {
        res.status(429).json({
          error: "Too many failed authentication attempts. Try again later.",
        });
        return;
      }

      const apiKey = extractAndValidateBearer(req);
      if (!apiKey) {
        recordAuthFailure(clientIp);
        setWwwAuthenticate(req, res);
        res.status(401).json({
          error:
            "Missing or invalid Authorization header. Use Bearer <API_KEY>",
        });
        return;
      }

      const auth = await validateBearerToken(apiKey);
      if (!auth) {
        recordAuthFailure(clientIp);
        res.status(403).json({ error: "Invalid or inactive API key" });
        return;
      }

      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      if (sessionId && transports.has(sessionId)) {
        const session = transports.get(sessionId)!;
        if (session.auth.apiKeyId !== auth.apiKeyId) {
          res.status(403).json({ error: "MCP session belongs to another API key" });
          return;
        }
        await session.transport.handleRequest(req, res, req.body);
        return;
      }

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });

      const mcpServer = createMcpServer(auth);

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };

      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);

      if (transport.sessionId) {
        transports.set(transport.sessionId, { transport, auth });
      }
    } catch (error) {
      console.error("MCP POST error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal MCP server error" });
      }
    }
  });

  app.get("/mcp", async (req: Request, res: Response) => {
    try {
      const apiKey = extractAndValidateBearer(req);
      if (!apiKey) {
        setWwwAuthenticate(req, res);
        res
          .status(401)
          .json({ error: "Missing or invalid Authorization header" });
        return;
      }

      const auth = await validateBearerToken(apiKey);
      if (!auth) {
        res.status(403).json({ error: "Invalid or inactive API key" });
        return;
      }

      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (sessionId && transports.has(sessionId)) {
        const session = transports.get(sessionId)!;
        if (session.auth.apiKeyId !== auth.apiKeyId) {
          res.status(403).json({ error: "MCP session belongs to another API key" });
          return;
        }
        await session.transport.handleRequest(req, res);
        return;
      }

      res.status(400).json({
        error:
          "No valid session. Send an initialization request first via POST.",
      });
    } catch (error) {
      console.error("MCP GET error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal MCP server error" });
      }
    }
  });

  app.delete("/mcp", async (req: Request, res: Response) => {
    try {
      const apiKey = extractAndValidateBearer(req);
      if (!apiKey) {
        setWwwAuthenticate(req, res);
        res
          .status(401)
          .json({ error: "Missing or invalid Authorization header" });
        return;
      }

      const auth = await validateBearerToken(apiKey);
      if (!auth) {
        res.status(403).json({ error: "Invalid or inactive API key" });
        return;
      }

      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (sessionId && transports.has(sessionId)) {
        const session = transports.get(sessionId)!;
        if (session.auth.apiKeyId !== auth.apiKeyId) {
          res.status(403).json({ error: "MCP session belongs to another API key" });
          return;
        }
        await session.transport.close();
        transports.delete(sessionId);
      }
      res.status(200).json({ message: "Session closed" });
    } catch (error) {
      console.error("MCP DELETE error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal MCP server error" });
      }
    }
  });

  app.post(
    "/api/mcp/api-keys",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { name } = req.body;
        if (!name || typeof name !== "string" || name.trim().length === 0) {
          return res.status(400).json({ error: "اسم المفتاح مطلوب" });
        }

        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);
        const keyPrefix = rawKey.slice(0, 12);
        const voiceAccess = req.body.voice_access === true;
        const voiceAllowlistBypass =
          req.body.voice_allowlist_bypass === true;
        if (voiceAllowlistBypass && !voiceAccess) {
          return res.status(400).json({
            error: "يتطلب تجاوز قائمة الأرقام تفعيل مكالمات Twilio للمفتاح",
          });
        }

        const userId = (req as AuthRequest).user?.id;
        if (!userId) {
          return res.status(401).json({ error: "Authentication required" });
        }

        const [created] = await db
          .insert(mcp_api_keys)
          .values({
            name: name.trim(),
            key_hash: keyHash,
            key_prefix: keyPrefix,
            created_by: userId,
            voice_access: voiceAccess,
            voice_allowlist_bypass: voiceAllowlistBypass,
            is_active: true,
          })
          .returning();

        res.json({
          id: created.id,
          name: created.name,
          key_prefix: created.key_prefix,
          voice_access: created.voice_access,
          voice_allowlist_bypass: created.voice_allowlist_bypass,
          api_key: rawKey,
          created_at: created.created_at,
          message:
            "تم إنشاء المفتاح بنجاح. احفظ المفتاح الآن - لن يظهر مرة أخرى!",
        });
      } catch (error: any) {
        console.error("Error creating MCP API key:", error);
        res.status(500).json({ error: "فشل في إنشاء المفتاح" });
      }
    },
  );

  app.get(
    "/api/mcp/api-keys",
    requireAuth,
    requireAdmin,
    async (_req: Request, res: Response) => {
      try {
        const keys = await db
          .select({
            id: mcp_api_keys.id,
            name: mcp_api_keys.name,
            key_prefix: mcp_api_keys.key_prefix,
            voice_access: mcp_api_keys.voice_access,
            voice_allowlist_bypass: mcp_api_keys.voice_allowlist_bypass,
            is_active: mcp_api_keys.is_active,
            last_used_at: mcp_api_keys.last_used_at,
            created_at: mcp_api_keys.created_at,
          })
          .from(mcp_api_keys)
          .orderBy(mcp_api_keys.created_at);

        res.json(keys);
      } catch (error: any) {
        console.error("Error listing MCP API keys:", error);
        res.status(500).json({ error: "فشل في جلب المفاتيح" });
      }
    },
  );

  app.patch(
    "/api/mcp/api-keys/:id/voice-access",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id, 10);
        const { voice_access, voice_allowlist_bypass } = req.body;
        if (
          Number.isNaN(id) ||
          typeof voice_access !== "boolean" ||
          typeof voice_allowlist_bypass !== "boolean"
        ) {
          return res.status(400).json({
            error: "بيانات صلاحيات المكالمات غير صالحة",
          });
        }
        if (voice_allowlist_bypass && !voice_access) {
          return res.status(400).json({
            error: "يتطلب تجاوز قائمة الأرقام تفعيل مكالمات Twilio للمفتاح",
          });
        }
        const [updated] = await db
          .update(mcp_api_keys)
          .set({
            voice_access,
            voice_allowlist_bypass,
          })
          .where(eq(mcp_api_keys.id, id))
          .returning({
            id: mcp_api_keys.id,
            voice_access: mcp_api_keys.voice_access,
            voice_allowlist_bypass: mcp_api_keys.voice_allowlist_bypass,
          });
        if (!updated) {
          return res.status(404).json({ error: "المفتاح غير موجود" });
        }
        res.json(updated);
      } catch (error) {
        console.error("Error updating MCP Voice access:", error);
        res.status(500).json({ error: "فشل تحديث صلاحيات المكالمات" });
      }
    },
  );

  app.delete(
    "/api/mcp/api-keys/:id",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ error: "معرف غير صالح" });
        }

        await db.delete(mcp_api_keys).where(eq(mcp_api_keys.id, id));
        res.json({ message: "تم حذف المفتاح بنجاح" });
      } catch (error: any) {
        console.error("Error deleting MCP API key:", error);
        res.status(500).json({ error: "فشل في حذف المفتاح" });
      }
    },
  );

  app.patch(
    "/api/mcp/api-keys/:id/toggle",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ error: "معرف غير صالح" });
        }

        const [existing] = await db
          .select()
          .from(mcp_api_keys)
          .where(eq(mcp_api_keys.id, id))
          .limit(1);

        if (!existing) {
          return res.status(404).json({ error: "المفتاح غير موجود" });
        }

        const [updated] = await db
          .update(mcp_api_keys)
          .set({ is_active: !existing.is_active })
          .where(eq(mcp_api_keys.id, id))
          .returning();

        res.json(updated);
      } catch (error: any) {
        console.error("Error toggling MCP API key:", error);
        res.status(500).json({ error: "فشل في تحديث المفتاح" });
      }
    },
  );

  console.log("✅ MCP server routes registered at /mcp");
}
