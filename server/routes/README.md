# server/routes — API Route Modules | وحدات مسارات الواجهة البرمجية

**English:** The original 20,000-line `server/routes.ts` was split into domain modules. `server/routes.ts` is now a thin orchestrator: it declares shared per-request state, builds a `ctx` object, then calls each domain's `register<Domain>Routes(app, ctx)` in the original registration order (Express route precedence within a domain is preserved because routes were never reordered inside a domain).

- `shared.ts` — module-level helpers formerly at the top of routes.ts: upload middlewares, `getAuthUserId`, param parsers, notification service, SMS gateway, `notificationManagerHolder` (mutable holder replacing the old module-level `let`), Zod schemas, session type augmentation.
- Domain files: `users`, `orders`, `production`, `machines`, `hr`, `maintenance`, `quality`, `warehouse`, `mixing`, `notifications`, `reports`, `system`, `mobile`, `legacy`, `admin`, `misc` — grouped by the `/api/<segment>` prefix.
- `alerts.ts`, `monitoring.ts`, `index.ts` — pre-existing smart-alerts/monitoring routers (unchanged).
- Values created inside `registerRoutes` (rate-limit maps, permission constants, schemas…) are passed via `ctx`; mutable ones (`setupInProgress`, company-logo cache) are accessed as `ctx.<name>` so reassignment works across modules.

**العربية:** تم تقسيم ملف المسارات الأصلي (٢٠ ألف سطر) إلى وحدات حسب المجال. أصبح `server/routes.ts` منسقًا خفيفًا يبني كائن `ctx` المشترك ثم يستدعي دوال التسجيل لكل مجال بنفس ترتيب التسجيل الأصلي. الملف `shared.ts` يحوي المساعدات المشتركة (رفع الملفات، التحقق من الهوية، خدمة الإشعارات، الرسائل النصية…). القيم المتغيرة تمرر عبر `ctx` للحفاظ على السلوك دون أي تغيير.

**Rule:** when adding a new endpoint, put it in the matching domain file (or create a new one and register it in `server/routes.ts`). Do not reorder routes within a file — Express precedence (`/active` before `/:id`) depends on order.
