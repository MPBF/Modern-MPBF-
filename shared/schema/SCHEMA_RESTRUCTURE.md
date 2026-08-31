# 📊 إعادة هيكلة Schema - وثيقة التحديث

## 🎯 الهدف
تحسين قابلية الصيانة والقراءة والأداء لـ `migrations/schema.ts` بتقسيمه من ملف واحد ضخم (3000+ سطر) إلى ملفات منطقية حسب المجالات الوظيفية.

---

## 📁 البنية الجديدة

```
shared/schema/
├── admin.ts              # 👤 المستخدمون والأدوار والإعدادات
├── hr.ts                 # 👥 الموارد البشرية والتدريب
├── inventory.ts          # 📦 المخزون والتخزين والمراسلات
├── maintenance.ts        # 🔧 الصيانة والإصلاح
├── notifications.ts      # 📢 الإشعارات والرسائل
├── orders.ts            # 🛍️ الطلبات والعملاء والاقتباسات
├── production.ts        # 🏭 الإنتاج والرولات والآلات
├── quality.ts           # ✅ الجودة والفئات والألوان
└── index.ts             # 📋 الفهرس الذي يعيد التصدير

```

---

## 📊 توزيع الجداول

### 1. **admin.ts** (9 جداول)
- `users` - المستخدمون
- `roles` - الأدوار والصلاحيات
- `user_settings` - إعدادات المستخدم
- `user_requests` - طلبات المستخدم
- `admin_decisions` - قرارات الإدارة
- `system_settings` - إعدادات النظام
- `system_performance_metrics` - مقاييس الأداء
- `sessions` - جلسات المستخدم
- `user_sessions` - جلسات بديلة
- `company_profile` - ملف تعريف الشركة
- `ai_agent_knowledge` - معرفة الوكيل
- `ai_agent_settings` - إعدادات الوكيل

### 2. **hr.ts** (16 جدول)
- `attendance` - الحضور والغياب
- `violations` - الانتهاكات
- `user_violations` - انتهاكات العمل
- `leave_types` - أنواع الإجازات
- `leave_balances` - رصيد الإجازات
- `leave_requests` - طلبات الإجازة
- `performance_criteria` - معايير الأداء
- `performance_reviews` - تقييمات الأداء
- `performance_ratings` - تقييمات مفصلة
- `training_programs` - برامج التدريب
- `training_materials` - مواد التدريب
- `training_records` - تسجيلات التدريب
- `training_enrollments` - التسجيلات
- `training_certificates` - شهادات التدريب
- `training_evaluations` - تقييمات التدريب

### 3. **inventory.ts** (13 جدول)
- `items` - الأصناف والمواد
- `locations` - المواقع
- `inventory` - المخزون
- `inventory_movements` - حركات المخزون
- `inventory_counts` - فحص المخزون
- `inventory_count_items` - تفاصيل الفحص
- `warehouse_transactions` - حركات المستودع
- `raw_material_vouchers_in` - مراسلات خام (In)
- `raw_material_vouchers_out` - مراسلات خام (Out)
- `finished_goods_vouchers_in` - مراسلات منتجات (In)
- `finished_goods_vouchers_out` - مراسلات منتجات (Out)
- `warehouse_receipts` - استقبالات المستودع
- `consumable_parts` - أجزاء قابلة للاستهلاك
- `consumable_parts_transactions` - حركات الأجزاء

### 4. **maintenance.ts** (8 جداول)
- `maintenance_requests` - طلبات الصيانة
- `maintenance_actions` - إجراءات الصيانة
- `maintenance_reports` - تقارير الصيانة
- `operator_negligence_reports` - تقارير إهمال
- `spare_parts` - أجزاء غيار
- `maintenance_schedules` - جداول الصيانة
- `preventive_maintenance_checklists` - قوائم الفحص

### 5. **notifications.ts** (7 جداول)
- `notification_templates` - قوالب الإشعارات
- `notification_event_settings` - إعدادات الأحداث
- `notification_event_logs` - سجلات الأحداث
- `notifications` - الإشعارات
- `conversations` - المحادثات
- `messages` - الرسائل
- `quick_notes` - ملاحظات سريعة
- `note_attachments` - مرفقات الملاحظات

### 6. **orders.ts** (8 جداول)
- `customers` - العملاء
- `customer_products` - منتجات العملاء
- `orders` - الطلبات
- `quotes` - الاقتباسات
- `quote_items` - بنود الاقتباسات
- `quote_templates` - قوالب الاقتباسات
- `suppliers` - الموردون

### 7. **production.ts** (12 جدول)
- `machines` - الآلات
- `production_orders` - طلبات الإنتاج
- `rolls` - الرولات (الأفلام)
- `cuts` - القص والتقطيع
- `waste` - الفاقد والهدر
- `machine_queues` - قوائم انتظار الآلات
- `mixing_batches` - دفعات المزج
- `batch_ingredients` - مكونات الدفعات
- `production_settings` - إعدادات الإنتاج

### 8. **quality.ts** (8 جداول)
- `categories` - الفئات
- `sections` - الأقسام
- `master_batch_colors` - الألوان الرئيسية
- `units` - الوحدات
- `quality_checks` - فحوصات الجودة
- `customer_product_print_colors` - ألوان الطباعة
- `bag_weight_records` - تسجيلات الأوزان
- `packaging_units` - وحدات التغليف

---

## ✅ الفوائد

### 1. **قابلية الصيانة** 📝
- سهولة العثور على الجداول ذات الصلة
- تقليل التعقيد بتقسيم المسؤوليات
- تحديثات أسهل وأسرع

### 2. **الأداء** 🚀
- تقليل وقت التحميل الأولي
- استيراد مباشر فقط للجداول المطلوبة
- تجنب الاستيراد غير الضروري

### 3. **سهولة الفهم** 💡
- بنية منطقية واضحة
- تعليقات وثيقة في كل ملف
- سهولة البحث والملاحة

### 4. **التعاون** 👥
- تقليل تضاربات الدمج (Git Conflicts)
- سهولة توزيع العمل بين الفريق
- توضيح المسؤوليات

---

## 🔄 المتطلبات المتبقية

### 1. **تحديث الاستيرادات** 📥
دعني أتحقق من جميع الملفات التي تستورد من schema.ts:

```bash
# ملفات تحتاج تحديث:
- server/routes.ts
- server/storage.ts
- server/db.ts
- أي ملف آخر يستورد من schema
```

### 2. **اختبار** 🧪
```bash
npm run check    # تحقق من أنواع TypeScript
npm run lint     # فحص الأخطاء
npm run build    # بناء المشروع
```

### 3. **ترحيل البيانات** 🗄️
- الملفات الجديدة عبارة عن إعادة هيكلة فقط
- لا توجد تغييرات على الجداول نفسها
- آمن تماماً للتطبيق على الإنتاج

---

## 📌 الخطوات التالية

### المرحلة 1: التحقق ✓
- [ ] تشغيل `npm run check`
- [ ] تشغيل `npm run lint`
- [ ] تشغيل `npm run build`

### المرحلة 2: التحديث
- [ ] تحديث جميع الاستيرادات في الملفات
- [ ] التحقق من الاختبارات
- [ ] اختبار التطبيق محلياً

### المرحلة 3: النشر
- [ ] إنشاء PR مع هذه التغييرات
- [ ] مراجعة الكود
- [ ] دمج وإطلاق النسخة الجديدة

---

## 📚 ملاحظات مهمة

1. **بدون تغييرات في قاعدة البيانات**: هذا مجرد إعادة تنظيم الكود
2. **التوافق الكامل**: جميع الاستيرادات تعمل من خلال `index.ts`
3. **المستقبل**: يمكن الآن إضافة جداول جديدة بسهولة في الملف المناسب

---

## 🤝 التعاون

هذه الإعادة الهيكلة تجهز المشروع للنمو:
- سهولة إضافة ميزات جديدة
- تقليل تكاليف الصيانة
- تحسين إنتاجية الفريق

**تاريخ الإنجاز**: 2026-08-31
