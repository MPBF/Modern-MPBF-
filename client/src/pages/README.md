# client/src/pages — Feature Folders | صفحات التطبيق حسب الميزة

**English:** Pages are grouped by feature. Routing lives in `client/src/App.tsx` (lazy imports). When adding a page: create it in the right folder and add the lazy import + route in `App.tsx`.

| Folder | Contents |
|---|---|
| `production/` | Production orders, queues, operator dashboards (film/printing/cutting), rolls, batch lookup, factory floor, material mixing |
| `orders/` | Orders, my-orders, order view, public bag-quote |
| `hr/` | HR suite, work violations |
| `warehouse/` | Warehouse/inventory |
| `whatsapp/` | WhatsApp/Twilio/Meta setup & testing pages |
| `dashboard/` | Main + user dashboards |
| `settings/` | Settings, definitions, MCP, company setup, system monitoring, external DB settings |
| `display/` | Display screens, 3D factory/warehouse, bag configurator, display tools |
| `reports/` | Reports, external-DB formatted reports |
| `agent/` | AI agent chat + settings |
| `misc/` | Login, notifications, quality, maintenance, admin tools, alerts, system health, not-found |

**العربية:** الصفحات منظمة في مجلدات حسب الميزة (إنتاج، طلبات، موارد بشرية، مستودع، واتساب، لوحات، إعدادات، شاشات العرض، تقارير، الوكيل الذكي، متفرقات). التوجيه في `App.tsx` عبر استيراد كسول؛ عند إضافة صفحة ضعها في المجلد المناسب وأضف الاستيراد والمسار هناك.

Shared root-level components (`ErrorBoundary`, `ProtectedRoute`, `LocationMapPicker`, `RoleManagementTab`) live in `client/src/components/shared/`.
