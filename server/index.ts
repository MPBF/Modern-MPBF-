import fs from "fs";
import http from "http";
import path from "path";

import { users } from "@shared/schema";
import bcrypt from "bcrypt";
import compression from "compression";
import connectPgSimple from "connect-pg-simple";
import { sql } from "drizzle-orm";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";

import { db, pool, sessionPool, isTransientDbError } from "./db";
import { MemoryMonitor } from "./middleware/memory-monitor";
import { performanceMonitor } from "./middleware/performance-monitor";
import { populateUserFromSession } from "./middleware/session-auth";
import monitoringRoutes from "./routes/monitoring";
import { setupVite, serveStatic, log } from "./vite";

function sanitizeErrorForLog(error: any): any {
  if (!error || typeof error !== "object") return error;
  try {
    const truncate = (v: any, n = 200): any => {
      if (v == null) return v;
      if (typeof v === "string")
        return v.length > n ? `${v.slice(0, n)}…(${v.length} chars)` : v;
      if (Array.isArray(v)) return v.map((x) => truncate(x, n));
      return v;
    };
    const safe: any = {
      name: error.name,
      message: error.message,
      code: error.code,
    };
    if (error.detail) safe.detail = truncate(error.detail, 300);
    if (error.query) safe.query = truncate(error.query, 500);
    if (Array.isArray(error.params)) safe.params = truncate(error.params, 120);
    else if (Array.isArray(error.parameters))
      safe.params = truncate(error.parameters, 120);
    if (error.stack)
      safe.stack = String(error.stack).split("\n").slice(0, 6).join("\n");
    return safe;
  } catch {
    return error;
  }
}

process.on("uncaughtException", (err) => {
  try {
    console.error("Uncaught exception:", err?.message || String(err));
  } catch {
    console.error("Uncaught exception (unformattable)");
  }
});

process.on("unhandledRejection", (reason) => {
  try {
    console.error(
      "Unhandled rejection:",
      reason instanceof Error ? reason.message : String(reason),
    );
  } catch {
    console.error("Unhandled rejection (unformattable)");
  }
});

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  if (!(app as any).__routesReady) {
    if (req.path === "/api/health") {
      return res.status(200).send("OK");
    }
    if (!req.path.startsWith("/api/")) {
      return res
        .status(200)
        .send(
          `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>body{font-family:Cairo,system-ui,sans-serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fafafa}.s{width:2rem;height:2rem;border:2px solid #f3f4f6;border-radius:50%;border-top-color:#3984f6;animation:r 1s ease-in-out infinite;margin:0 auto 1rem}@keyframes r{to{transform:rotate(360deg)}}</style></head><body><div style="text-align:center"><div class="s"></div><p style="font-size:.875rem;color:#6b7280">جاري تحميل النظام...</p></div><script>setTimeout(()=>location.reload(),2000)</script></body></html>`,
        );
    }
  }
  next();
});

if (process.env.NODE_ENV === "production") {
  const port = parseInt(process.env.PORT || "5000", 10);
  const earlyServer = http.createServer(app);
  earlyServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`early server listening on port ${port} for healthcheck`);
  });
  (app as any).__earlyServer = earlyServer;
}

// Enable gzip/br compression for all responses
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Carve-outs: heavy upload/import endpoints get a larger limit (10mb).
// Everything else is capped at 1mb to prevent payload-based DoS.
const HEAVY_UPLOAD_PREFIXES = [
  "/api/company/upload-logo",
  "/api/upload",
  "/api/customer-products", // base64 cliché design images
  "/api/factory-3d/snapshots",
  "/api/mobile/upload",
  "/webhook/",
];

// Database backup/restore can be very large (full DB dumps). These need
// a much higher limit. Admin-only routes — DoS risk is bounded by RBAC.
const HUGE_UPLOAD_PREFIXES = [
  "/api/database/import",
  "/api/database/restore",
];

// Webhook prefixes that need raw-body capture for signature verification.
// Both legacy "/webhook/..." and the actual "/api/notifications/webhook/..."
// routes (Meta/Taqnyat/Twilio) must capture req.rawBody so HMAC checks work.
const WEBHOOK_PREFIXES = ["/webhook/", "/api/notifications/webhook/"];

const isWebhookUrl = (url?: string): boolean =>
  !!url && WEBHOOK_PREFIXES.some((p) => url.includes(p));

const captureRawBody = (req: any, _res: any, buf: Buffer) => {
  if (isWebhookUrl(req.url)) {
    req.rawBody = buf;
  }
};

const hugeJson = express.json({ limit: "500mb", verify: captureRawBody });
const hugeUrlencoded = express.urlencoded({ extended: false, limit: "500mb" });
const heavyJson = express.json({ limit: "10mb", verify: captureRawBody });
const heavyUrlencoded = express.urlencoded({ extended: false, limit: "10mb" });
const standardJson = express.json({ limit: "1mb", verify: captureRawBody });
const standardUrlencoded = express.urlencoded({
  extended: false,
  limit: "1mb",
});

app.use((req, res, next) => {
  const isHuge = HUGE_UPLOAD_PREFIXES.some((p) => req.path.startsWith(p));
  if (isHuge) {
    hugeJson(req, res, (err) => {
      if (err) return next(err);
      hugeUrlencoded(req, res, next);
    });
    return;
  }
  const isHeavy = HEAVY_UPLOAD_PREFIXES.some((p) => req.path.startsWith(p));
  if (isHeavy) {
    heavyJson(req, res, (err) => {
      if (err) return next(err);
      heavyUrlencoded(req, res, next);
    });
  } else {
    standardJson(req, res, (err) => {
      if (err) return next(err);
      standardUrlencoded(req, res, next);
    });
  }
});

const publicRoot = path.resolve(import.meta.dirname, "..", "public");
const distPublic = path.resolve(import.meta.dirname, "public");

function resolvePublicFile(filename: string): string | null {
  const rootPath = path.resolve(publicRoot, filename);
  if (fs.existsSync(rootPath)) return rootPath;
  const distPath = path.resolve(distPublic, filename);
  if (fs.existsSync(distPath)) return distPath;
  return null;
}

app.get("/sw.js", (_req, res) => {
  const swPath = resolvePublicFile("sw.js");
  if (swPath) {
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Service-Worker-Allowed", "/");
    res.sendFile(swPath);
  } else {
    res.status(404).send("Not found");
  }
});
app.get("/manifest.json", (_req, res) => {
  const manifestPath = resolvePublicFile("manifest.json");
  if (manifestPath) {
    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(manifestPath);
  } else {
    res.status(404).send("Not found");
  }
});
const iconsRoot = path.resolve(publicRoot, "icons");
const iconsDist = path.resolve(distPublic, "icons");
app.use(
  "/icons",
  express.static(fs.existsSync(iconsRoot) ? iconsRoot : iconsDist),
);
app.get("/favicon-32x32.png", (_req, res) => {
  res.sendFile(
    path.resolve(import.meta.dirname, "..", "public", "favicon-32x32.png"),
  );
});
app.get("/favicon-16x16.png", (_req, res) => {
  res.sendFile(
    path.resolve(import.meta.dirname, "..", "public", "favicon-16x16.png"),
  );
});

// Security function to check for plaintext passwords
async function performPasswordSecurityCheck(): Promise<void> {
  try {
    // Check for security bypass flag (emergency use only)
    if (process.env.SKIP_SECURITY_CHECK === "true") {
      console.warn("⚠️ SECURITY CHECK BYPASSED via environment variable");
      return;
    }

    // Fetch all users to check their passwords
    const allUsers = await db.select().from(users);

    let plaintextPasswordsFound = 0;
    const problematicUserIds: number[] = [];

    for (const user of allUsers) {
      if (!user.password) continue;

      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isHashedPassword =
        user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2y$");

      if (!isHashedPassword) {
        plaintextPasswordsFound++;
        problematicUserIds.push(user.id);
        console.error(
          `🚨 SECURITY ALERT: User ${user.id} (${user.username}) has plaintext password!`,
        );
      }
    }

    if (plaintextPasswordsFound > 0) {
      console.warn(
        `⚠️ SECURITY: Found ${plaintextPasswordsFound} user(s) with plaintext passwords. Auto-hashing...`,
      );
      console.warn(`⚠️ Affected user IDs: [${problematicUserIds.join(", ")}]`);

      for (const user of allUsers) {
        if (!user.password) continue;
        const isHashed =
          user.password.startsWith("$2a$") ||
          user.password.startsWith("$2b$") ||
          user.password.startsWith("$2y$");
        if (!isHashed) {
          try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await db
              .update(users)
              .set({ password: hashedPassword })
              .where(sql`${users.id} = ${user.id}`);
            console.log(
              `✅ Auto-hashed password for user ${user.id} (${user.username})`,
            );
          } catch (hashErr) {
            console.error(
              `❌ Failed to hash password for user ${user.id}:`,
              hashErr,
            );
          }
        }
      }
      console.log(`✅ Password auto-hashing completed`);
    } else {
      console.log(
        `✅ Password security check passed: All ${allUsers.length} user passwords are properly hashed`,
      );
    }
  } catch (error) {
    console.error("❌ Password security check failed:", error);

    if (app.get("env") === "production") {
      console.error(
        "🚨 Production security check failure - shutting down for safety",
      );
      process.exit(1);
    } else {
      console.warn(
        "⚠️ Development mode: continuing despite security check failure",
      );
    }
  }
}

// Configure CORS with strict allowlist - must be before session middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Strict allowlist of trusted origins
  const allowedOrigins = [
    "http://localhost:5000",
    "https://localhost:5000",
    "http://127.0.0.1:5000",
    "https://127.0.0.1:5000",
    "http://localhost:8081",
    "http://localhost:19006",
    "exp://localhost:8081",
  ];

  // Add current host for same-origin requests
  const currentHost = req.get("host");
  if (currentHost) {
    allowedOrigins.push(`http://${currentHost}`);
    allowedOrigins.push(`https://${currentHost}`);
  }

  // MCP endpoint: allow any origin (protected by API key auth)
  const isMcpRoute =
    req.path === "/mcp" ||
    req.path.startsWith("/oauth/") ||
    req.path === "/.well-known/oauth-authorization-server";

  if (isMcpRoute && origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "false");
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    res.header(
      "Access-Control-Allow-Origin",
      currentHost ? `https://${currentHost}` : "https://localhost:5000",
    );
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,OPTIONS,PATCH",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Cookie, Set-Cookie, Mcp-Session-Id",
  );
  res.header("Access-Control-Expose-Headers", "Set-Cookie, Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configure Express to trust proxy for correct session handling in production
app.set("trust proxy", 1);

// Configure session store with security validation
const isProduction = process.env.NODE_ENV === "production";

// Security validation: Require SESSION_SECRET in production
if (isProduction && !process.env.SESSION_SECRET) {
  console.error(
    "🚨 SECURITY ERROR: SESSION_SECRET environment variable is required in production",
  );
  console.error("🚨 Please set SESSION_SECRET to a secure random value");
  process.exit(1);
}

// Configure PostgreSQL session store for all environments to prevent session loss during restarts
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool: sessionPool,
  tableName: "user_sessions",
  createTableIfMissing: true,
  pruneSessionInterval: 60 * 60, // Clean expired sessions every 60 minutes (reduces Neon rate-limit pressure)
  errorLog: (...args: any[]) => {
    const msg = args.map((a) => (a instanceof Error ? a.message : String(a))).join(" ");
    if (
      msg.includes("rate limit") ||
      msg.includes("XX000") ||
      msg.includes("57P01") ||
      msg.includes("terminating connection")
    ) {
      console.warn(
        "⚠️ Session prune skipped (transient DB issue): ",
        msg.split("\n")[0],
      );
      return;
    }
    console.error("Session store error:", ...args);
  },
});
console.log(
  `✅ Using PostgreSQL session store for ${isProduction ? "production" : "development"} - sessions will persist across server restarts`,
);

app.use(
  session({
    store: sessionStore,
    secret:
      process.env.SESSION_SECRET ||
      (isProduction
        ? (() => {
            console.error("🚨 CRITICAL: SESSION_SECRET missing in production");
            process.exit(1);
          })()
        : "dev-secret-key-not-for-production"),
    resave: false, // Session extension middleware calls req.session.save() manually; resave:true causes needless writes
    saveUninitialized: false, // Don't create session until something stored
    rolling: true, // Reset expiry on activity - crucial for keeping session alive
    cookie: {
      secure: "auto", // Let Express determine security based on connection
      httpOnly: true, // ALWAYS prevent XSS - critical security fix
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days - extended session duration for better user experience
      sameSite: "lax", // Better balance for same-origin requests
    },
    name: "plastic-bag-session", // Custom session name
    unset: "keep", // Keep the session even if we unset properties
  }),
);

// Apply session authentication middleware - populate req.user from session
app.use(populateUserFromSession);

// 📊 Performance monitoring middleware - tracks API response times and resource usage
app.use(performanceMonitor);

// Session extension middleware - extends session on any API call with enhanced reliability
app.use((req, res, next) => {
  // Skip session extension for MCP/OAuth routes (uses API key auth)
  if (
    req.path === "/mcp" ||
    req.path.startsWith("/oauth/") ||
    req.path === "/.well-known/oauth-authorization-server"
  )
    return next();
  // For API requests, extend the session if it exists
  if (req.path.startsWith("/api") && req.session) {
    // Check if session has userId (authenticated session)
    if (req.session.userId) {
      // Touch the session to reset expiry with rolling sessions
      req.session.touch();

      // Force save session for PostgreSQL reliability (non-blocking)
      req.session.save((err: any) => {
        if (err && !isProduction) {
          console.warn(`Session save warning on ${req.path}:`, err);
        }
      });

      // Log session extension for debugging (only in development)
      if (!isProduction && req.path !== "/api/me") {
        console.log(
          `🔄 Session extended for user ${req.session.userId} on ${req.path}`,
        );
      }
    } else if (
      !req.user &&
      req.path !== "/api/login" &&
      req.path !== "/api/me" &&
      req.path !== "/api/health" &&
      !req.path.startsWith("/api/mobile/") &&
      !req.path.startsWith("/api/notifications/webhook/") &&
      !req.path.startsWith("/api/display/")
    ) {
      if (!isProduction) {
        console.log(`⚠️ Unauthenticated API request: ${req.path}`);
      }
    }
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Skip logging spam HEAD requests to /api (likely from browser extensions/dev tools)
    if (req.method === "HEAD" && path === "/api") {
      return;
    }

    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      // Security: Only log response metadata in production, never response bodies
      // Response bodies may contain sensitive data like passwords, tokens, PII
      if (!isProduction && capturedJsonResponse) {
        // In development, sanitize sensitive fields before logging
        const sanitizedResponse =
          sanitizeResponseForLogging(capturedJsonResponse);
        if (Object.keys(sanitizedResponse).length > 0) {
          logLine += ` :: ${JSON.stringify(sanitizedResponse)}`;
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Security function to sanitize response data for logging
function sanitizeResponseForLogging(response: any): any {
  if (!response || typeof response !== "object") {
    return {};
  }

  // Handle arrays at the top level
  if (Array.isArray(response)) {
    return { data: `[Array:${response.length}]` };
  }

  // List of sensitive field patterns to exclude from logs
  const sensitiveFields = [
    "password",
    "passwd",
    "pwd",
    "secret",
    "token",
    "key",
    "auth",
    "session",
    "cookie",
    "authorization",
    "credential",
    "private",
    "ssn",
    "social",
    "email",
    "phone",
    "address",
    "ip",
    "personal",
    "card",
    "payment",
    "billing",
    "account",
    "user_id",
    "userId",
  ];

  const sanitized: any = {};

  for (const [key, value] of Object.entries(response)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveFields.some((field) =>
      keyLower.includes(field),
    );

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (Array.isArray(value)) {
      sanitized[key] = `[Array:${value.length}]`;
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = "[Object]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

(async () => {
  const earlyServer = (app as any).__earlyServer || null;

  let devServer: import("http").Server | null = null;
  if (app.get("env") !== "production") {
    const http = await import("http");
    devServer = http.createServer(app);
    const port = parseInt(process.env.PORT || "5000", 10);
    await new Promise<void>((resolve) => {
      devServer!.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
        resolve();
      });
    });

    const altPort = 8000;
    const altServer = http.createServer(app);
    altServer.on("error", () => {});
    altServer.listen(altPort, "0.0.0.0", () => {
      log(`also serving on port ${altPort}`);
    });
  }

  // Auto-migration: ensure all schema tables exist (safe for existing data)
  // drizzle-kit push only adds missing tables/columns, never drops or modifies existing ones
  try {
    console.log("🔄 فحص قاعدة البيانات وتحديث الهيكل...");

    await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection verified");

    const tableCheck = await db.execute(sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const existingTables = tableCheck.rows.map((row: any) => row.table_name);
    const isNewDatabase = existingTables.length === 0;

    console.log(
      `📊 Database status: ${isNewDatabase ? "قاعدة بيانات جديدة" : `قاعدة بيانات موجودة (${existingTables.length} جدول)`}`,
    );

    if (!isNewDatabase) {
      console.log(
        "📋 الجداول الموجودة:",
        existingTables.slice(0, 10).join(", ") +
          (existingTables.length > 10
            ? ` ... و${existingTables.length - 10} جدول إضافي`
            : ""),
      );
    }

    if (isNewDatabase) {
      // Fresh database: create all tables using drizzle-kit push
      console.log("🆕 قاعدة بيانات جديدة - إنشاء جميع الجداول...");

      try {
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);

        const pushResult = await execAsync("npx drizzle-kit push --force", {
          env: { ...process.env },
          timeout: 120000,
        });

        console.log("✅ تم إنشاء هيكل قاعدة البيانات بنجاح");
        if (pushResult.stderr && pushResult.stderr.includes("error")) {
          console.warn(
            "⚠️ Push warnings:",
            pushResult.stderr.substring(0, 200),
          );
        }

        const verifyCheck = await db.execute(sql`
          SELECT COUNT(*) as table_count
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
        const tableCount = parseInt(String(verifyCheck.rows[0].table_count));
        console.log(`✅ عدد الجداول المُنشأة: ${tableCount}`);

        if (tableCount === 0) {
          console.error("❌ فشل إنشاء الجداول - لم يتم إنشاء أي جدول");
          if (isProduction) process.exit(1);
        }
      } catch (pushError: any) {
        console.error("❌ خطأ في إنشاء الجداول:", pushError?.message);
        if (isProduction) {
          console.error("🚨 لا يمكن بدء التطبيق بدون هيكل قاعدة البيانات");
          process.exit(1);
        }
      }
    } else {
      // Existing database: verify critical tables, skip push to preserve performance
      console.log("✅ قاعدة البيانات موجودة - التحقق من الجداول الأساسية...");

      const criticalTables = [
        "users",
        "system_settings",
        "roles",
        "face_registrations",
        "mobile_sessions",
        "mobile_device_tokens",
        "mobile_sync_queue",
        "mcp_api_keys",
        "mcp_oauth_tokens",
        "mcp_oauth_clients",
        "delivery_manifests",
        "admin_tool_documents",
      ];
      for (const tableName of criticalTables) {
        try {
          await db.execute(
            sql`SELECT 1 FROM ${sql.identifier(tableName)} LIMIT 1`,
          );
        } catch (tableError: any) {
          if (tableError?.message?.includes("does not exist")) {
            console.warn(
              `⚠️ جدول ${tableName} غير موجود - سيتم إنشاء الجداول الناقصة...`,
            );
            try {
              const { exec } = await import("child_process");
              const { promisify } = await import("util");
              const execAsync = promisify(exec);
              await execAsync("npx drizzle-kit push --force", {
                env: { ...process.env },
                timeout: 120000,
              });
              console.log("✅ تم إضافة الجداول الناقصة بنجاح");
            } catch (pushErr: any) {
              console.error("❌ فشل إضافة الجداول الناقصة:", pushErr?.message);
            }
            break;
          }
        }
      }

      console.log("✅ جميع الجداول الأساسية متوفرة");
    }

    // Ensure production_orders.production_stage column exists on existing
    // databases (drizzle-kit push only runs for fresh databases). Safe & idempotent.
    try {
      await db.execute(sql`
        ALTER TABLE production_orders
        ADD COLUMN IF NOT EXISTS production_stage varchar(20) NOT NULL DEFAULT 'film'
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_production_orders_production_stage
        ON production_orders (production_stage)
      `);
      // Ensure production_orders.batch_number column + unique index exist
      // (generated when an order reaches the 'done' stage). Safe & idempotent.
      await db.execute(sql`
        ALTER TABLE production_orders
        ADD COLUMN IF NOT EXISTS batch_number varchar(50)
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uniq_production_orders_batch_number
        ON production_orders (batch_number)
        WHERE batch_number IS NOT NULL
      `);
      // One-time migration: fix invalid roll stage 'printed' -> 'printing'
      try {
        const fixed = await db.execute(sql`
          UPDATE rolls SET stage = 'printing' WHERE stage = 'printed'
        `);
        const fixedCount = (fixed as any)?.rowCount ?? 0;
        if (fixedCount > 0) {
          console.log(
            `🔁 تم إصلاح ${fixedCount} رول بحالة 'printed' غير الصالحة إلى 'printing'`,
          );
        }
      } catch (rollFixErr: any) {
        console.warn(
          "⚠️ فشل إصلاح حالة الرولات 'printed':",
          rollFixErr?.message,
        );
      }

      // Reconcile existing plastic-roll products onto the cutting-skip workflow.
      // These products never pass through cutting: a non-printed film roll is a
      // finished product as soon as it is produced, and a printed roll is
      // finished once printed. Move any such rolls still sitting in 'film'
      // (non-printed) or 'printing' straight to 'done' so they appear in the
      // production hall. Idempotent: once a roll is 'done' it no longer matches.
      try {
        const rollSkip = await db.execute(sql`
          UPDATE rolls r
          SET stage = 'done',
              cut_completed_at = COALESCE(r.cut_completed_at, now()),
              cut_weight_total_kg = COALESCE(r.cut_weight_total_kg, r.weight_kg)
          FROM production_orders po
          LEFT JOIN customer_products cp ON cp.id = po.customer_product_id
          LEFT JOIN items i ON i.id = cp.item_id
          WHERE r.production_order_id = po.id
            AND (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%')
            AND (
                  r.stage = 'printing'
                  OR (r.stage = 'film' AND COALESCE(cp.is_printed, false) = false)
                )
        `);
        const rollSkipCount = (rollSkip as any).rowCount ?? 0;
        if (rollSkipCount > 0) {
          console.log(
            `🧻 تم تحويل ${rollSkipCount} رول لمنتجات الرولات البلاستيكية مباشرة إلى 'done' (تخطّي القص)`,
          );
        }
      } catch (rollSkipErr: any) {
        console.warn(
          "⚠️ فشل ترحيل رولات المنتجات البلاستيكية لتخطّي القص:",
          rollSkipErr?.message,
        );
      }

      // One-time backfill of production_stage from current rolls state
      const { storage: storageImpl } = await import("./storage");
      const updatedCount = await storageImpl.backfillProductionOrderStages();
      if (updatedCount > 0) {
        console.log(
          `🔁 تم ترحيل مرحلة ${updatedCount} أمر إنتاج بناءً على رولاتها الحالية`,
        );
      }

      // Roll products are completed by the percentage-recompute path (which sets
      // status='completed' on reaching 'done'); the one-time backfill only sets
      // production_stage. Reconcile historical roll orders that are now fully
      // 'done' so their status matches. Idempotent: re-runs match nothing once
      // status is already 'completed'.
      const rollStatus = await db.execute(sql`
        UPDATE production_orders po
        SET status = 'completed'
        FROM customer_products cp
        LEFT JOIN items i ON i.id = cp.item_id
        WHERE po.customer_product_id = cp.id
          AND (i.name ILIKE '%plastic roll%' OR i.name_ar LIKE '%رولات بلاستيك%')
          AND po.production_stage = 'done'
          AND po.status IS DISTINCT FROM 'completed'
      `);
      const rollStatusCount = (rollStatus as any).rowCount ?? 0;
      if (rollStatusCount > 0) {
        console.log(
          `✅ تم إكمال حالة ${rollStatusCount} أمر إنتاج لمنتجات الرولات البلاستيكية`,
        );
      }
    } catch (stageErr: any) {
      console.warn(
        "⚠️ فشل تهيئة عمود production_stage (سيتم المحاولة لاحقاً):",
        stageErr?.message,
      );
    }

    // Ensure the Modern AI agent tables exist on existing databases.
    // drizzle-kit push only runs for fresh databases, so create them here
    // idempotently (CREATE TABLE IF NOT EXISTS never drops or alters data).
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS modern_agent_settings (
          id serial PRIMARY KEY,
          model varchar(100) NOT NULL DEFAULT 'gpt-5',
          default_language varchar(10) NOT NULL DEFAULT 'auto',
          base_persona text,
          temperature numeric(3,2) NOT NULL DEFAULT '0.30',
          max_tool_iterations integer NOT NULL DEFAULT 6,
          enabled boolean NOT NULL DEFAULT true,
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS modern_agent_tasks (
          id serial PRIMARY KEY,
          task_key varchar(80) NOT NULL UNIQUE,
          name_ar varchar(200) NOT NULL,
          name_en varchar(200) NOT NULL,
          description text,
          response_guidance text,
          language varchar(10) NOT NULL DEFAULT 'auto',
          allowed_tools text[] NOT NULL DEFAULT '{}'::text[],
          is_write boolean NOT NULL DEFAULT false,
          required_permission varchar(80),
          max_daily_interactions integer,
          sort_order integer NOT NULL DEFAULT 0,
          enabled boolean NOT NULL DEFAULT true,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS modern_agent_knowledge (
          id serial PRIMARY KEY,
          title varchar(300) NOT NULL,
          content text NOT NULL,
          category varchar(40) NOT NULL DEFAULT 'general',
          is_private boolean NOT NULL DEFAULT false,
          enabled boolean NOT NULL DEFAULT true,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS modern_agent_profiles (
          id serial PRIMARY KEY,
          user_id integer NOT NULL UNIQUE REFERENCES users(id),
          display_name varchar(200),
          notes text,
          preferences jsonb,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS modern_agent_access (
          id serial PRIMARY KEY,
          user_id integer REFERENCES users(id),
          role_id integer REFERENCES roles(id),
          enabled boolean NOT NULL DEFAULT true,
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS modern_agent_conversations (
          id serial PRIMARY KEY,
          user_id integer NOT NULL REFERENCES users(id),
          title varchar(300),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_modern_agent_conv_user
        ON modern_agent_conversations (user_id)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS modern_agent_messages (
          id serial PRIMARY KEY,
          conversation_id integer NOT NULL REFERENCES modern_agent_conversations(id),
          role varchar(20) NOT NULL,
          content text NOT NULL DEFAULT '',
          metadata jsonb,
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_modern_agent_msg_conv
        ON modern_agent_messages (conversation_id)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS modern_agent_usage (
          id serial PRIMARY KEY,
          user_id integer NOT NULL REFERENCES users(id),
          task_key varchar(80) NOT NULL,
          usage_date date NOT NULL,
          count integer NOT NULL DEFAULT 0
        )
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_modern_agent_usage
        ON modern_agent_usage (user_id, task_key, usage_date)
      `);
    } catch (modernErr: any) {
      console.warn(
        "⚠️ فشل تهيئة جداول الوكيل الذكي مودرن (سيتم المحاولة لاحقاً):",
        modernErr?.message,
      );
    }

    // Ensure the External SQL Server connection table exists on existing
    // databases. drizzle-kit push only runs for fresh databases, so create it
    // here idempotently (CREATE TABLE IF NOT EXISTS never drops or alters data).
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS external_db_connections (
          id serial PRIMARY KEY,
          name varchar(150) NOT NULL,
          host varchar(255) NOT NULL,
          port integer NOT NULL DEFAULT 1433,
          database_name varchar(200) NOT NULL,
          username varchar(200) NOT NULL,
          password_encrypted text NOT NULL,
          encrypt boolean NOT NULL DEFAULT true,
          trust_server_certificate boolean NOT NULL DEFAULT false,
          is_active boolean NOT NULL DEFAULT true,
          created_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      // Records which key version encrypted password_encrypted, so a
      // SESSION_SECRET rotation can re-encrypt without losing credentials.
      await db.execute(sql`
        ALTER TABLE external_db_connections
        ADD COLUMN IF NOT EXISTS key_version integer NOT NULL DEFAULT 1
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS external_db_saved_queries (
          id serial PRIMARY KEY,
          connection_id integer NOT NULL REFERENCES external_db_connections(id) ON DELETE CASCADE,
          name varchar(200) NOT NULL,
          sql_text text NOT NULL,
          parameters jsonb NOT NULL DEFAULT '[]'::jsonb,
          created_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      // Saved formatted report definitions (account statement / sales invoice).
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS external_db_reports (
          id serial PRIMARY KEY,
          connection_id integer NOT NULL REFERENCES external_db_connections(id) ON DELETE CASCADE,
          name varchar(200) NOT NULL,
          template_type varchar(30) NOT NULL DEFAULT 'table',
          title_ar varchar(200),
          sql_text text NOT NULL,
          column_mapping jsonb,
          header_info jsonb,
          created_by integer REFERENCES users(id) ON DELETE SET NULL,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
    } catch (externalDbErr: any) {
      console.warn(
        "⚠️ فشل تهيئة جدول اتصالات قاعدة البيانات الخارجية (سيتم المحاولة لاحقاً):",
        externalDbErr?.message,
      );
    }

    // Ensure the Smart Maintenance Engineer tables exist on existing databases.
    // drizzle-kit push only runs for fresh databases, so create them here
    // idempotently (CREATE TABLE IF NOT EXISTS never drops or alters data).
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maintenance_engineer_knowledge (
          id serial PRIMARY KEY,
          title varchar(300) NOT NULL,
          content text NOT NULL,
          machine_category varchar(20) NOT NULL DEFAULT 'general',
          source_type varchar(20) NOT NULL DEFAULT 'manual',
          file_name varchar(300),
          enabled boolean NOT NULL DEFAULT true,
          created_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_maint_eng_knowledge_category
        ON maintenance_engineer_knowledge (machine_category)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maintenance_engineer_conversations (
          id serial PRIMARY KEY,
          user_id integer NOT NULL REFERENCES users(id),
          title varchar(300),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_maint_eng_conv_user
        ON maintenance_engineer_conversations (user_id)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maintenance_engineer_messages (
          id serial PRIMARY KEY,
          conversation_id integer NOT NULL REFERENCES maintenance_engineer_conversations(id) ON DELETE CASCADE,
          role varchar(20) NOT NULL,
          content text NOT NULL DEFAULT '',
          metadata jsonb,
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_maint_eng_msg_conv
        ON maintenance_engineer_messages (conversation_id)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS machine_change_log (
          id serial PRIMARY KEY,
          machine_id varchar(20) NOT NULL REFERENCES machines(id),
          note text NOT NULL,
          changed_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_machine_change_log_machine
        ON machine_change_log (machine_id)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS roll_edit_logs (
          id serial PRIMARY KEY,
          roll_id integer NOT NULL REFERENCES rolls(id) ON DELETE CASCADE,
          field varchar(40) NOT NULL,
          old_value text,
          new_value text,
          old_label text,
          new_label text,
          note text,
          changed_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_roll_edit_logs_roll
        ON roll_edit_logs (roll_id)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS quality_inspection_forms (
          id serial PRIMARY KEY,
          form_number varchar(50) NOT NULL UNIQUE,
          template_type varchar(30) NOT NULL,
          production_order_id integer REFERENCES production_orders(id),
          machine_id varchar(20) REFERENCES machines(id),
          operator_id integer REFERENCES users(id),
          inspector_id integer REFERENCES users(id),
          shift varchar(20),
          sample_size integer,
          items jsonb NOT NULL,
          overall_result varchar(10) NOT NULL DEFAULT 'pass',
          notes text,
          inspected_at timestamp DEFAULT now(),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_quality_inspection_forms_type
        ON quality_inspection_forms (template_type)
      `);

      // Idempotent baseline knowledge for each machine family (extruder / printer / cutter).
      // Inserted only when an entry with the same title does not already exist, so it is
      // safe to run on every startup and never duplicates or overwrites user edits.
      const maintEngSeeds: Array<{
        title: string;
        category: string;
        content: string;
      }> = [
        {
          title: "أساسيات صيانة طاردة الأفلام (Extruder) | Film Extruder Maintenance Basics",
          category: "extruder",
          content:
            "طاردة أفلام البولي إيثيلين (Blown Film Extruder):\n" +
            "- الأعطال الشائعة: تذبذب سماكة الفيلم (عيوب في حلقة الهواء أو درجات حرارة المناطق)، ثقوب/جل (Gels) بسبب تلوث المادة أو ارتفاع حرارة، رائحة احتراق (تحلل المادة من بقاء طويل أو حرارة زائدة)، أزيز/اهتزاز المحرك أو القلاووظ.\n" +
            "- نقاط الفحص: درجات حرارة المناطق (Zones) والـ Die، ضغط ذوبان البوليمر (Melt Pressure)، حالة المنخل (Screen Pack)، تبريد حلقة الهواء (Air Ring)، سرعة وشد السحب (Nip/Haul-off).\n" +
            "- صيانة وقائية: تنظيف الـ Die بانتظام، فحص السخانات والثرموكبلات، تشحيم محامل القلاووظ، فحص محاذاة بكرات السحب.\n\n" +
            "Blown film PE extruder — common faults: film thickness variation (air ring or zone temperature issues), gels/holes (contamination or overheating), burnt smell (polymer degradation), motor/screw vibration. Check: zone & die temperatures, melt pressure, screen pack, air ring cooling, nip/haul-off tension. Preventive: clean die, inspect heaters/thermocouples, lubricate screw bearings, check roller alignment.",
        },
        {
          title: "أساسيات صيانة طابعة الفلكسو (Flexographic Printer) | Flexo Printer Maintenance Basics",
          category: "printer",
          content:
            "طابعة فلكسوغرافية لأكياس البلاستيك:\n" +
            "- الأعطال الشائعة: تطبيق حبر غير منتظم/شحوب الطباعة (مشاكل أنيلوكس Anilox أو شفرة الدكتور Doctor Blade)، انحراف تطابق الألوان (Registration)، تلطخ/Ghosting، جفاف الحبر غير الكافي (مراوح/سخانات التجفيف).\n" +
            "- نقاط الفحص: نظافة وخلايا أسطوانة الأنيلوكس، ضغط وزاوية شفرة الدكتور، لزوجة الحبر (Viscosity)، ضغط الأسطوانات، محاذاة وتطابق المحطات اللونية، نظام التجفيف.\n" +
            "- صيانة وقائية: تنظيف الأنيلوكس بعد كل تشغيلة، فحص شفرات الدكتور للتآكل، معايرة التطابق، فحص محامل وأختام الأسطوانات.\n\n" +
            "Flexographic printer — common faults: uneven ink/light print (anilox or doctor blade), color registration drift, smearing/ghosting, insufficient ink drying. Check: anilox cleanliness & cell condition, doctor blade pressure/angle, ink viscosity, roller pressure, station registration, dryer system. Preventive: clean anilox after each run, inspect doctor blades for wear, calibrate registration, check roller bearings/seals.",
        },
        {
          title: "أساسيات صيانة قاطعة الأكياس (Bag Cutting Machine) | Bag Cutter Maintenance Basics",
          category: "cutter",
          content:
            "ماكينة قص ولحام الأكياس:\n" +
            "- الأعطال الشائعة: لحام ضعيف/مفتوح (حرارة أو ضغط أو زمن اللحام غير صحيح، تلف شريط التفلون/عنصر التسخين)، قص غير مستقيم أو متعرج (تآكل السكين أو خلل التغذية)، اختلاف أطوال الأكياس (مشاكل المستشعر الضوئي/Photocell أو الـ Encoder)، انحشار الفيلم.\n" +
            "- نقاط الفحص: درجة حرارة وعنصر اللحام (Sealing Element)، شريط التفلون والسيليكون، حدة السكين، شد ومحاذاة بكرات التغذية، حساس العلامة (Eye Mark/Photocell)، توقيت السيرفو/المحرك.\n" +
            "- صيانة وقائية: استبدال شريط التفلون دورياً، شحذ/تغيير السكين، تنظيف وضبط المستشعرات، فحص السيور والقوابض.\n\n" +
            "Bag cutting/sealing machine — common faults: weak/open seals (wrong heat/pressure/dwell time, worn PTFE tape or heating element), crooked cuts (blunt blade or feed misalignment), inconsistent bag length (photocell/encoder issues), film jams. Check: sealing element temperature, PTFE/silicone tape, blade sharpness, feed roller tension/alignment, eye-mark photocell, servo/motor timing. Preventive: replace PTFE tape regularly, sharpen/replace blade, clean & calibrate sensors, inspect belts/clutches.",
        },
      ];
      for (const seed of maintEngSeeds) {
        await db.execute(sql`
          INSERT INTO maintenance_engineer_knowledge (title, content, machine_category, source_type, enabled)
          SELECT ${seed.title}, ${seed.content}, ${seed.category}, 'manual', true
          WHERE NOT EXISTS (
            SELECT 1 FROM maintenance_engineer_knowledge WHERE title = ${seed.title}
          )
        `);
      }
    } catch (maintEngErr: any) {
      console.warn(
        "⚠️ فشل تهيئة جداول مهندس الصيانة الذكي (سيتم المحاولة لاحقاً):",
        maintEngErr?.message,
      );
    }

    // Ensure the Industrial Waste warehouse tables exist on existing databases.
    // drizzle-kit push only runs for fresh databases, so create them here
    // idempotently (CREATE TABLE IF NOT EXISTS never drops or alters data).
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS industrial_waste_vouchers_in (
          id serial PRIMARY KEY,
          voucher_number varchar(50) NOT NULL UNIQUE,
          waste_type varchar(200) NOT NULL,
          quantity decimal(12,3) NOT NULL,
          unit varchar(20) NOT NULL DEFAULT 'كيلو',
          source varchar(200),
          notes text,
          received_by integer NOT NULL REFERENCES users(id),
          voucher_date date NOT NULL DEFAULT CURRENT_DATE,
          status varchar(20) NOT NULL DEFAULT 'completed',
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS industrial_waste_vouchers_out (
          id serial PRIMARY KEY,
          voucher_number varchar(50) NOT NULL UNIQUE,
          waste_type varchar(200) NOT NULL,
          quantity decimal(12,3) NOT NULL,
          unit varchar(20) NOT NULL DEFAULT 'كيلو',
          company_name varchar(200) NOT NULL,
          driver_name varchar(200),
          vehicle_number varchar(100),
          notes text,
          issued_by integer NOT NULL REFERENCES users(id),
          voucher_date date NOT NULL DEFAULT CURRENT_DATE,
          status varchar(20) NOT NULL DEFAULT 'completed',
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
    } catch (wasteErr: any) {
      console.warn(
        "⚠️ فشل تهيئة جداول مستودع المخلفات الصناعية (سيتم المحاولة لاحقاً):",
        wasteErr?.message,
      );
    }

    // Ensure HR Phase 2 tables/columns exist on existing databases.
    // drizzle-kit push only runs for fresh databases, so create them here
    // idempotently (CREATE TABLE / ADD COLUMN IF NOT EXISTS never drops data).
    try {
      // Phase 1 monthly shift roster table (may be missing on older DBs).
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS shift_assignments (
          id serial PRIMARY KEY,
          user_id integer NOT NULL REFERENCES users(id),
          year integer NOT NULL,
          month integer NOT NULL,
          shift varchar(10) NOT NULL,
          notes text,
          created_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_shift_assignments_user
        ON shift_assignments (user_id)
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_shift_assignments_period
        ON shift_assignments (year, month)
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uniq_shift_assignment_user_month
        ON shift_assignments (user_id, year, month)
      `);
      // Extend violations with disciplinary penalty + status fields.
      await db.execute(sql`
        ALTER TABLE violations
        ADD COLUMN IF NOT EXISTS penalty_amount numeric(12,2) NOT NULL DEFAULT '0'
      `);
      await db.execute(sql`
        ALTER TABLE violations
        ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'open'
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rewards (
          id serial PRIMARY KEY,
          employee_id integer NOT NULL REFERENCES users(id),
          reward_type varchar(50) NOT NULL,
          reason text,
          amount numeric(12,2) NOT NULL DEFAULT '0',
          date date NOT NULL,
          status varchar(20) NOT NULL DEFAULT 'approved',
          granted_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS employee_custody (
          id serial PRIMARY KEY,
          employee_id integer NOT NULL REFERENCES users(id),
          item_name varchar(200) NOT NULL,
          description text,
          quantity integer NOT NULL DEFAULT 1,
          handover_date date NOT NULL,
          return_date date,
          status varchar(20) NOT NULL DEFAULT 'handed',
          notes text,
          recorded_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS employee_traits (
          id serial PRIMARY KEY,
          employee_id integer NOT NULL REFERENCES users(id),
          trait varchar(200) NOT NULL,
          category varchar(50),
          rating integer,
          notes text,
          recorded_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS wage_records (
          id serial PRIMARY KEY,
          employee_id integer NOT NULL REFERENCES users(id),
          year integer NOT NULL,
          month integer NOT NULL,
          base_hourly_rate numeric(10,2) NOT NULL DEFAULT '0',
          overtime_multiplier numeric(4,2) NOT NULL DEFAULT '1.50',
          base_hours numeric(10,2) NOT NULL DEFAULT '0',
          basic_pay numeric(12,2) NOT NULL DEFAULT '0',
          overtime_hours numeric(10,2) NOT NULL DEFAULT '0',
          overtime_pay numeric(12,2) NOT NULL DEFAULT '0',
          deductions_amount numeric(12,2) NOT NULL DEFAULT '0',
          rewards_amount numeric(12,2) NOT NULL DEFAULT '0',
          penalties_amount numeric(12,2) NOT NULL DEFAULT '0',
          net_pay numeric(12,2) NOT NULL DEFAULT '0',
          notes text,
          computed_by integer REFERENCES users(id),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS wage_records_employee_month_uniq
        ON wage_records (employee_id, year, month)
      `);
    } catch (hrErr: any) {
      console.warn(
        "⚠️ فشل تهيئة جداول الموارد البشرية المرحلة الثانية (سيتم المحاولة لاحقاً):",
        hrErr?.message,
      );
    }

    // Ensure customer_products bag-weight columns exist (density + computed metrics).
    // Safe & idempotent: columns added IF NOT EXISTS; density defaults to 0.95.
    try {
      await db.execute(sql`
        ALTER TABLE customer_products
          ADD COLUMN IF NOT EXISTS density numeric(6,3) DEFAULT 0.95,
          ADD COLUMN IF NOT EXISTS bag_weight_grams numeric(12,4),
          ADD COLUMN IF NOT EXISTS bags_per_kilo numeric(12,2)
      `);
      // One-time backfill for products created before this feature. Only fills
      // rows where the metric is still NULL and the required inputs exist, so it
      // is effectively idempotent (a no-op after the first run). Mirrors the
      // server formula: flat width(cm) * length(cm) * 2 layers
      // * universal_thickness(µm→cm) * density. Uses the generated
      // universal_thickness column (computed, hidden) — not the raw thickness.
      await db.execute(sql`
        UPDATE customer_products
        SET
          bag_weight_grams = CEIL(
            (COALESCE(width, 0) + COALESCE(left_facing, 0) + COALESCE(right_facing, 0))
            * COALESCE(cutting_length_cm, 0)
            * 2
            * (universal_thickness * 0.0001)
            * COALESCE(density, 0.95)),
          bags_per_kilo = CEIL(
            1000.0 / NULLIF(
              (COALESCE(width, 0) + COALESCE(left_facing, 0) + COALESCE(right_facing, 0))
              * COALESCE(cutting_length_cm, 0)
              * 2
              * (universal_thickness * 0.0001)
              * COALESCE(density, 0.95), 0))
        WHERE bag_weight_grams IS NULL
          AND universal_thickness IS NOT NULL
          AND width IS NOT NULL
          AND cutting_length_cm IS NOT NULL
          AND (COALESCE(width, 0) + COALESCE(left_facing, 0) + COALESCE(right_facing, 0))
              * COALESCE(cutting_length_cm, 0)
              * 2
              * (universal_thickness * 0.0001)
              * COALESCE(density, 0.95) > 0
      `);
    } catch (cpErr: any) {
      console.warn(
        "⚠️ فشل تهيئة أعمدة وزن الكيس في منتجات العملاء (سيتم المحاولة لاحقاً):",
        cpErr?.message,
      );
    }

    // Ensure machines.inline_printer_id column exists, then auto-link the three
    // physically-combined extruder+printer pairs by name. Safe & idempotent:
    // the column is added IF NOT EXISTS and the link is only set when currently
    // NULL, so re-running never overwrites a manually-changed pairing.
    try {
      await db.execute(sql`
        ALTER TABLE machines
        ADD COLUMN IF NOT EXISTS inline_printer_id varchar(20)
      `);
      const inlinePairs: Array<[string, string]> = [
        ["Extruder C", "Printer Inline C"],
        ["Extruder G", "Printer Inline G"],
        ["Extruder H", "Printer Inline H"],
      ];
      let linkedCount = 0;
      for (const [extruderName, printerName] of inlinePairs) {
        const linked = await db.execute(sql`
          UPDATE machines AS ext
          SET inline_printer_id = prn.id
          FROM machines AS prn
          WHERE LOWER(ext.type) = 'extruder'
            AND LOWER(prn.type) IN ('printing', 'printer')
            AND ext.inline_printer_id IS NULL
            AND LOWER(TRIM(ext.name)) = LOWER(${extruderName})
            AND LOWER(TRIM(prn.name)) = LOWER(${printerName})
        `);
        linkedCount += (linked as any)?.rowCount ?? 0;
      }
      if (linkedCount > 0) {
        console.log(
          `🔗 تم ربط ${linkedCount} ماكينة فيلم مدمجة بطابعتها الإنلاين`,
        );
      }
    } catch (inlineErr: any) {
      console.warn(
        "⚠️ فشل تهيئة ربط الطابعات الإنلاين (سيتم المحاولة لاحقاً):",
        inlineErr?.message,
      );
    }

    // Ensure Preventive Maintenance tables exist on existing databases.
    // drizzle-kit push only runs for fresh databases, so create them here
    // idempotently (CREATE TABLE IF NOT EXISTS never drops data). Then seed the
    // bilingual component catalog (idempotent: ON CONFLICT DO NOTHING).
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS maintenance_component_catalog (
          id serial PRIMARY KEY,
          machine_type varchar(30) NOT NULL,
          name_ar varchar(200) NOT NULL,
          name_en varchar(200) NOT NULL,
          sort_order integer NOT NULL DEFAULT 0,
          enabled boolean NOT NULL DEFAULT true,
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uniq_component_catalog_type_name
        ON maintenance_component_catalog (machine_type, name_en)
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_component_catalog_type
        ON maintenance_component_catalog (machine_type)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS preventive_maintenance_actions (
          id serial PRIMARY KEY,
          action_number varchar(50) NOT NULL UNIQUE,
          section_id varchar(20) REFERENCES sections(id),
          machine_id varchar(20) NOT NULL REFERENCES machines(id),
          performed_by integer NOT NULL REFERENCES users(id),
          action_date timestamp DEFAULT now(),
          total_cost numeric(12,2) NOT NULL DEFAULT '0',
          notes text,
          status varchar(20) NOT NULL DEFAULT 'completed',
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_preventive_actions_machine
        ON preventive_maintenance_actions (machine_id)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS preventive_maintenance_items (
          id serial PRIMARY KEY,
          preventive_action_id integer NOT NULL REFERENCES preventive_maintenance_actions(id) ON DELETE CASCADE,
          component_id integer REFERENCES maintenance_component_catalog(id),
          component_name_ar varchar(200) NOT NULL,
          component_name_en varchar(200) NOT NULL,
          action_type varchar(40) NOT NULL,
          quantity integer NOT NULL DEFAULT 1,
          cost numeric(12,2) NOT NULL DEFAULT '0',
          condition varchar(20),
          notes text,
          created_at timestamp DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_preventive_items_action
        ON preventive_maintenance_items (preventive_action_id)
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_preventive_items_component
        ON preventive_maintenance_items (component_id)
      `);
      // Junction: a preventive action can target multiple machines.
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS preventive_maintenance_action_machines (
          id serial PRIMARY KEY,
          preventive_action_id integer NOT NULL REFERENCES preventive_maintenance_actions(id) ON DELETE CASCADE,
          machine_id varchar(20) NOT NULL REFERENCES machines(id)
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_pm_action_machines_action
        ON preventive_maintenance_action_machines (preventive_action_id)
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_pm_action_machines_machine
        ON preventive_maintenance_action_machines (machine_id)
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uniq_pm_action_machine
        ON preventive_maintenance_action_machines (preventive_action_id, machine_id)
      `);
      // Backfill existing single-machine actions into the junction table.
      await db.execute(sql`
        INSERT INTO preventive_maintenance_action_machines (preventive_action_id, machine_id)
        SELECT a.id, a.machine_id
        FROM preventive_maintenance_actions a
        WHERE NOT EXISTS (
          SELECT 1 FROM preventive_maintenance_action_machines am
          WHERE am.preventive_action_id = a.id
        )
      `);

      // Idempotent seed of the bilingual component catalog.
      const componentCatalog: Array<[string, string, string]> = [
        // Film / الفيلم (extruder)
        ["extruder", "اللولب A (السكرو A)", "Screw A"],
        ["extruder", "اللولب B (السكرو B)", "Screw B"],
        ["extruder", "رول السحب المطاطي", "Rubber Pull (Nip) Roll"],
        ["extruder", "سير المحرك", "Motor Belt"],
        ["extruder", "مروحة التبريد", "Cooling Fan"],
        ["extruder", "السخانات (الهيترات)", "Heaters"],
        ["extruder", "الموصّلات (الكونتاكتورات)", "Contactors"],
        ["extruder", "المرحّلات (الريليهات)", "Relays"],
        ["extruder", "المفتاح (سويتش)", "Switch"],
        ["extruder", "القاطع (البريكر)", "Breaker"],
        ["extruder", "نظام معالجة السطح (كورونا)", "Corona Treatment System"],
        ["extruder", "الملفاف (الروايندر)", "Rewinder"],
        ["extruder", "الأسطوانة/البرميل (البارل)", "Barrel"],
        ["extruder", "العمود (الشفت)", "Shaft"],
        // Printing / الطباعة (printer)
        ["printer", "الأسطوانة المطاطية", "Rubber Roller"],
        ["printer", "أسطوانة الأنيلوكس", "Anilox Roller"],
        ["printer", "الرولمان (البيرنجات)", "Bearings"],
        ["printer", "التروس (الجير)", "Gear"],
        ["printer", "مضخة الزيت", "Oil Pump"],
        ["printer", "حساس الضبط/التوازن", "Registration/Balance Sensor"],
        ["printer", "المفتاح (سويتش)", "Switch"],
        ["printer", "بطانات السلندر النحاسية", "Cylinder Copper Sleeves"],
        // Cutting / التقطيع (cutter)
        ["cutter", "السكين (شفرة القطع)", "Blade/Knife"],
        ["cutter", "عنصر اللحام", "Sealing/Welding Element"],
        ["cutter", "المؤقّت (التايمر)", "Timer"],
        ["cutter", "العمود (الشفت)", "Shaft"],
        ["cutter", "الحساسات", "Sensors"],
        ["cutter", "الكاميرا", "Camera"],
        ["cutter", "الرولمان (البيرنجات)", "Bearings"],
        ["cutter", "الصمّام (البلف)", "Valve"],
        ["cutter", "الأسطوانة الهوائية (سلندر نيوماتيك)", "Pneumatic Cylinder"],
        ["cutter", "خرطوم الهواء", "Air Hose"],
        ["cutter", "وصلة الهواء (فِتنج)", "Air Fitting"],
      ];
      let seedOrder = 0;
      for (const [machineType, nameAr, nameEn] of componentCatalog) {
        seedOrder += 1;
        await db.execute(sql`
          INSERT INTO maintenance_component_catalog
            (machine_type, name_ar, name_en, sort_order)
          VALUES (${machineType}, ${nameAr}, ${nameEn}, ${seedOrder})
          ON CONFLICT (machine_type, name_en) DO NOTHING
        `);
      }
    } catch (pmErr: any) {
      console.warn(
        "⚠️ فشل تهيئة جداول الصيانة الوقائية (سيتم المحاولة لاحقاً):",
        pmErr?.message,
      );
    }
  } catch (error: any) {
    console.error("❌ فشل تهيئة قاعدة البيانات:", error?.message || error);
    if (isProduction) {
      console.error("🚨 فشل حرج في الإنتاج - إيقاف الخادم");
      process.exit(1);
    }
    console.warn("⚠️ متابعة التشغيل في وضع التطوير رغم فشل التهيئة");
  }

  // Security check: Verify no plaintext passwords remain
  await performPasswordSecurityCheck();

  // 📊 Start memory monitoring
  MemoryMonitor.startMonitoring(30000); // Every 30 seconds

  // 🔧 Register monitoring routes
  app.use(monitoringRoutes);

  const { registerRoutes } = await import("./routes");
  const server = await registerRoutes(
    app,
    devServer || earlyServer || undefined,
  );

  // 404 handler for unmatched API routes (MUST be after routes)
  app.use("/api/*", (req: Request, res: Response, next: NextFunction) => {
    // If no route matched, send 404 JSON response instead of falling through to HTML
    if (!res.headersSent) {
      return res.status(404).json({ message: "API endpoint not found" });
    }
    next();
  });

  // Error handling middleware for API routes (MUST be after routes)
  app.use(
    "/api/*",
    (err: any, req: Request, res: Response, next: NextFunction) => {
      const transient = isTransientDbError(err);
      const status = transient ? 503 : err.status || err.statusCode || 500;
      const message = transient
        ? "حدث خطأ مؤقت في الاتصال، يرجى المحاولة مرة أخرى"
        : err.message || "Internal Server Error";

      // Ensure we always return JSON for API routes
      if (!res.headersSent) {
        if (transient) res.setHeader("Retry-After", "1");
        res.status(status).json({ message });
      }
      if (transient) {
        console.warn(
          "⚠️ Transient connection error (non-fatal):",
          String(err?.message ?? "").split("\n")[0],
        );
      } else {
        console.error("API Error:", sanitizeErrorForLog(err));
      }
    },
  );

  // General error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const transient = isTransientDbError(err);
    const status = transient ? 503 : err.status || err.statusCode || 500;
    if (transient) {
      console.warn(
        "⚠️ Transient connection error (non-fatal):",
        String(err?.message ?? "").split("\n")[0],
      );
      if (!res.headersSent) res.setHeader("Retry-After", "1");
    } else {
      console.error("Unhandled error:", sanitizeErrorForLog(err));
    }
    res.status(status).json({ message: "حدث خطأ في الخادم" });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
    (app as any).__routesReady = true;
    log(`development server fully initialized`);
  } else if (app.get("env") === "production" && earlyServer) {
    serveStatic(app);
    (app as any).__routesReady = true;
    log(`production server fully initialized`);
  } else {
    serveStatic(app);
    (app as any).__routesReady = true;
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  }
})();
