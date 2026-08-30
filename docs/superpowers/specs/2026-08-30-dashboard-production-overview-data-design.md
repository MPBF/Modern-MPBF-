# إصلاح بيانات نظرة عامة على الإنتاج

## المشكلة

تعرض بطاقات الصفحة الرئيسية أصفاراً لأن الواجهة تتوقع بنية إحصائيات تفصيلية، بينما يعيد مصدر البيانات الحالي إجماليات عامة بأسماء حقول مختلفة.

## التصميم المعتمد

- الإبقاء على المسار الحالي `GET /api/dashboard/stats` دون تغيير قاعدة البيانات.
- تحديث `getDashboardStats()` ليعيد العقد التالي حرفياً، وجميع القيم العددية فيه من نوع `number`:

```ts
{
  waitingOrders: {
    count: number;
    totalKg: number;
  }
  inProductionOrders: {
    count: number;
    totalKg: number;
  }
  monthlyProduction: number;
  monthlyWaste: number;
  presentEmployees: number;
  totalEmployees: number;
  maintenanceAlerts: number;
  topWorkers: {
    film: Array<{ id: number; name: string; production: number }>;
    printing: Array<{ id: number; name: string; production: number }>;
    cutting: Array<{ id: number; name: string; production: number }>;
  }
}
```

- بطاقتا الطلبات تقيسان **أوامر الإنتاج** لا الطلبات التجارية:
  - `waitingOrders`: صفوف `production_orders.status = 'pending'`.
  - `inProductionOrders`: صفوف `production_orders.status = 'active'`.
  - `count` هو عدد صفوف أوامر الإنتاج، و`totalKg` هو مجموع `quantity_kg`. لا تُجرى وصلة مع `orders`، لذلك لا يوجد تضاعف عند احتواء الطلب التجاري على عدة منتجات.
- `monthlyProduction` هو مجموع `rolls.weight_kg` للرولات التي يقع `rolls.created_at` في الشهر الحالي. يُحسب الرول مرة واحدة مهما كانت مرحلته الحالية، وتمثل البطاقة كمية الفيلم المنتجة خلال الشهر.
- `monthlyWaste` مصدره الوحيد `waste.quantity_wasted` حسب `waste.created_at` في الشهر الحالي. لا تُجمع معه قيم `rolls.waste_kg` أو `production_orders.waste_quantity_kg`.
- أفضل العاملين خلال الشهر الحالي:
  - الفيلم: `rolls.created_by` ووقت `rolls.created_at`.
  - الطباعة: `rolls.printed_by` ووقت `rolls.printed_at`.
  - التقطيع: `rolls.cut_by` ووقت `rolls.cut_completed_at`.
  - لا يعتمد أي تصنيف على `rolls.stage` الحالي؛ انتقال الرول لا يلغي إنجاز المرحلة السابقة.
  - تُجمع أوزان `rolls.weight_kg` لكل عامل، وتُوصل النتيجة بمستخدم نشط فقط، ثم يُعاد أعلى ثلاثة مرتبين حسب الإنتاج تنازلياً ثم `users.id` تصاعدياً عند التعادل.
  - الاسم يختار أول قيمة متاحة من `display_name_ar` ثم `display_name` ثم `full_name` ثم `username`، ويستخدم `#<id>` كقيمة نصية مضمونة إذا كانت جميعها فارغة.
- `totalEmployees` هو عدد المستخدمين الذين يحققون `status = 'active'` و`include_in_attendance = true`.
- `presentEmployees` هو `COUNT(DISTINCT attendance.user_id)` لليوم الحالي، لنفس مجموعة المستخدمين، بشرط وجود `check_in_time`. وبذلك يُعد من حضر اليوم مرة واحدة حتى لو تعددت سجلاته أو أصبح في استراحة أو غادر لاحقاً.
- `maintenanceAlerts` هو عدد طلبات الصيانة التي حالتها `open` أو `in_progress` فقط؛ القيم الفارغة أو المستقبلية لا تُعامل تلقائياً كتنبيه.
- تحويل القيم العشرية القادمة من PostgreSQL إلى أرقام قبل إرسال الاستجابة.
- تشغيل الاستعلامات المستقلة بالتوازي لتقليل زمن الاستجابة.

## حالات الحدود

- القيم الفارغة تُعاد كأصفار أو قوائم فارغة، مع الحفاظ على نفس بنية الاستجابة.
- الموظفون المحذوفون أو الموقوفون لا يدخلون في الإجمالي أو الحضور أو قوائم أفضل العاملين.
- سجلات الحضور المتعددة لليوم نفسه تُحسب كموظف حاضر واحد.
- تُستخدم بداية الشهر واليوم وفق تاريخ قاعدة البيانات لتفادي اختلاف المنطقة الزمنية بين التطبيق وقاعدة البيانات.

## التحقق

- اختبار شكل الاستجابة ومطابقته لواجهة `DashboardStats`.
- التحقق من طلب تجاري يحتوي عدة أوامر إنتاج، وتكرار حضور الموظف، ورول انتقل من مرحلته، وحدود تواريخ الشهر، وعدم ازدواج مصدر الهالك.
- تشغيل فحص TypeScript والبناء وفحص حجم الملفات.
- إعادة تشغيل التطبيق وفحص السجلات والمعاينة.
