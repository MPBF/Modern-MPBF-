# server/storage — Data Access Layer | طبقة الوصول إلى البيانات

**English:** The original 15,000-line `server/storage.ts` was split mechanically with **zero behavior change** using a chain-of-inheritance pattern:

- `core.ts` — cache helpers, `DatabaseError`/`withDatabaseErrorHandling`, the full `IStorage` interface, and `StorageBase` (all class fields + protected helper methods). The declaration merge `interface StorageBase extends IStorage {}` lets protected helpers call public methods.
- Domain fragments, each `class XStorage extends <previous>`: `users` → `orders` → `production` → `machines` → `hr` → `maintenance` → `quality` → `warehouse` → `mixing` → `notifications` → `system` → `misc`.
- `index.ts` — `DatabaseStorage extends MiscStorage` and the exported `storage` singleton.
- `server/storage.ts` remains as a re-export shim so no call site changed.

**العربية:** قُسم ملف التخزين الأصلي إلى وحدات حسب المجال عبر سلسلة وراثة، دون أي تغيير في السلوك. يحوي `core.ts` الواجهة `IStorage` والفئة الأساسية، وكل ملف مجال يضيف دوال مجاله، ويُصدر `index.ts` الكائن `storage` المفرد. بقي `server/storage.ts` كواجهة إعادة تصدير فلا حاجة لتعديل أي مستهلك.

**Rules:**
- New methods: add the implementation to the matching domain class **and** the identical signature to `IStorage` in `core.ts` (signatures must match textually — TS requires identical declarations across the merged interfaces).
- Never re-declare a method name in two fragments — the later one in the chain silently overrides.
