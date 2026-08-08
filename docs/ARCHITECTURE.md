# MPBF System Architecture | بنية نظام مصنع الأكياس البلاستيكية

## Overview | نظرة عامة

**English:** Full-stack TypeScript factory-management system for a plastic bag factory. Express backend + React (Vite) frontend + PostgreSQL (Drizzle ORM). Single deployment bundle built from `server/index.ts` (esbuild) and `client/` (Vite).

**العربية:** نظام إدارة مصنع أكياس بلاستيكية متكامل: خادم Express، واجهة React، قاعدة بيانات PostgreSQL عبر Drizzle. يُبنى الخادم من `server/index.ts` والواجهة من `client/`.

## Directory Map | خريطة المجلدات

```
server/
  index.ts            ← entry point: env checks, DB ensure-block, Vite/static, ports 5000+8000
  routes.ts           ← orchestrator; real routes live in server/routes/<domain>.ts
  routes/             ← domain route modules + shared.ts helpers (see routes/README.md)
  storage.ts          ← re-export shim; real code in server/storage/
  storage/            ← data-access layer, inheritance chain (see storage/README.md)
  services/           ← business services (PDF, AI, notifications, …)
  modern-agent/       ← in-app AI agent (independent from MCP)
  mcp-*.ts            ← MCP server + OAuth (independent from the AI agent)
  external-db/        ← read-only legacy MSSQL reports
  replit_integrations/← object storage, chat, image integrations
shared/
  schema.ts           ← Drizzle schema + Zod insert schemas (single source of truth)
client/src/
  App.tsx             ← routing (lazy imports of all pages)
  pages/<feature>/    ← feature-grouped pages (see pages/README.md)
  components/         ← UI components (components/shared/ for cross-feature ones)
  lib/, hooks/        ← utilities and hooks
docs/                 ← this documentation
```

## Key Conventions | الاصطلاحات الأساسية

- **Zero-trust derived fields:** computed columns are recomputed server-side; never trust client values.
- **Permissions:** backend admin checks use the `admin` permission string, not role IDs; frontend gating mirrors each route's exact permission set.
- **Ensure-block:** new tables must be added to the ensure-block in `server/index.ts` — `drizzle-kit push` is not run against the live DB.
- **Route order matters:** within a domain file, keep specific routes (`/active`) before parameterized ones (`/:id`).
- **Imports in client code:** prefer relative imports over the `@/` alias (Vite re-optimization fragility).
- **Arabic-first UI:** i18n via `ar.json`/`en.json`; RTL layouts; pdfkit Arabic uses raw Unicode + `features: ["rtla"]`.

## Runtime | التشغيل

- Dev: `npm run dev` (tsx, TZ=Asia/Riyadh) — serves API + Vite client on port 5000 (also 8000).
- Build: `npm run build` → Vite client bundle + esbuild `dist/index.js`.
- Sessions in PostgreSQL; WebSocket notifications via `notificationManagerHolder`.
