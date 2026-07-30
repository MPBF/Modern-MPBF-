import fs from "fs";
import { type Server } from "http";
import path from "path";

import express, { type Express } from "express";
import { nanoid } from "nanoid";
import { createServer as createViteServer, createLogger } from "vite";

import viteConfig from "../vite.config";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  const pwaSnippet = `
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#3984F6" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="MPBF Next" />
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  `;

  const swSnippet = `
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker
            .register("/sw.js")
            .then(function (registration) {
              console.log("SW registered: ", registration);
            })
            .catch(function (registrationError) {
              console.log("SW registration failed: ", registrationError);
            });
        });
      }
    </script>
  `;

  // Pre-read and transform index.html ONCE at startup rather than on every
  // request. Synchronous readFileSync on the hot path is unnecessary and a
  // thrown error (e.g. file gone during a rolling deploy) would produce a 500.
  const indexPath = path.resolve(distPath, "index.html");
  let cachedHtml: string;
  try {
    let html = fs.readFileSync(indexPath, "utf-8");
    if (!html.includes('rel="manifest"')) {
      html = html.replace("</head>", `${pwaSnippet}\n</head>`);
    }
    if (
      !html.includes('register("/sw.js")') &&
      !html.includes("register('/sw.js')")
    ) {
      html = html.replace("</body>", `${swSnippet}\n</body>`);
    }
    cachedHtml = html;
  } catch (e) {
    log(`Warning: could not pre-read index.html: ${(e as Error).message}`);
    cachedHtml = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>MPBF</title></head><body><p style="font-family:system-ui;padding:2rem">جاري تحميل التطبيق… أعد تحميل الصفحة.</p></body></html>`;
  }

  app.use("*", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(cachedHtml);
  });
}
