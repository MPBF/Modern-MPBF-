# ⚡ Quick Start - Modern UI System

## 🚀 البدء في 5 دقائق

### الخطوة 1: استيراد المكونات

```typescript
// في ملف صفحتك الجديدة
import {
  ResponsiveCard,
  ResponsiveGrid,
  ResponsiveButton,
  ResponsiveInput,
} from "@/components/ui/responsive-layout";

import { 
  MainLayout, 
  DashboardLayout 
} from "@/components/layouts/MainLayout";
```

### الخطوة 2: بناء الصفحة

```typescript
export function MyNewPage() {
  return (
    <MainLayout>
      <DashboardLayout
        title="عنوان الصفحة"
        subtitle="وصف الصفحة"
      >
        <ResponsiveGrid cols={2}>
          <ResponsiveCard>
            محتوى البطاقة
          </ResponsiveCard>
        </ResponsiveGrid>
      </DashboardLayout>
    </MainLayout>
  );
}
```

---

## 📋 المكونات الأساسية

### 1️⃣ البطاقة
```typescript
<ResponsiveCard hover>
  محتوى البطاقة
</ResponsiveCard>
```

### 2️⃣ الشبكة
```typescript
<ResponsiveGrid cols={3}>
  <div>العنصر 1</div>
  <div>العنصر 2</div>
  <div>العنصر 3</div>
</ResponsiveGrid>

{/* cols: 1, 2, 3, أو 4 */}
```

### 3️⃣ الزر
```typescript
<ResponsiveButton
  variant="primary"      // primary, secondary, danger, ghost
  size="md"             // sm, md, lg
  fullWidth={false}
  icon={<Plus />}
>
  انقر هنا
</ResponsiveButton>
```

### 4️⃣ الإدخال
```typescript
<ResponsiveInput
  label="البريد"
  placeholder="أدخل بريدك"
  icon={<Mail />}
  error={error}
  fullWidth
/>
```

### 5️⃣ الشارة
```typescript
<ResponsiveBadge variant="success">
  مكتمل
</ResponsiveBadge>

{/* success, danger, warning, primary */}
```

### 6️⃣ الجدول
```typescript
<ResponsiveTable>
  <thead>
    <tr>
      <th>الاسم</th>
      <th>البريد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>أحمد</td>
      <td>ahmed@example.com</td>
    </tr>
  </tbody>
</ResponsiveTable>
```

### 7️⃣ المرن (Flex)
```typescript
<ResponsiveFlex
  direction="row"      // row أو col
  justify="between"    // start, center, between, around
  align="center"       // start, center, end
  gap={4}              // 2, 3, 4, 6, 8
>
  <div>العنصر 1</div>
  <div>العنصر 2</div>
</ResponsiveFlex>
```

### 8️⃣ عنوان القسم
```typescript
<SectionHeader
  title="العنوان"
  subtitle="الوصف"
  action={<ResponsiveButton>إجراء</ResponsiveButton>}
/>
```

---

## 📱 عرض مختلف حسب الجهاز

### الطريقة 1: Tailwind Classes

```typescript
{/* إخفاء على الهاتف، عرض على الكمبيوتر */}
<div className="hidden md:block">
  سطح المكتب فقط
</div>

{/* عرض على الهاتف، إخفاء على الكمبيوتر */}
<div className="md:hidden">
  الهاتف فقط
</div>
```

### الطريقة 2: عرض بطاقات + جدول

```typescript
function MyList() {
  const items = [/* البيانات */];

  return (
    <>
      {/* الهاتف - بطاقات */}
      <div className="grid gap-4 md:hidden">
        {items.map(item => (
          <ResponsiveCard key={item.id}>
            {item.name}
          </ResponsiveCard>
        ))}
      </div>

      {/* الكمبيوتر - جدول */}
      <div className="hidden md:block">
        <ResponsiveTable>
          {/* جدول البيانات */}
        </ResponsiveTable>
      </div>
    </>
  );
}
```

---

## 🎨 الألوان والتنسيق

### الألوان

```typescript
// أساسي
bg-primary-600
text-primary-600
border-primary-600

// نجاح
bg-success-600 text-success-600

// تحذير
bg-warning-600 text-warning-600

// خطأ
bg-danger-600 text-danger-600

// محايد
bg-neutral-100 text-neutral-900
```

### الوضع الليلي

```typescript
className="bg-white dark:bg-neutral-900"
className="text-neutral-900 dark:text-white"
className="border-neutral-200 dark:border-neutral-800"
```

### المسافات

```typescript
className="p-4"    // الحشو
className="m-4"    // الهامش
className="gap-4"  // المسافة بين الأطفال
className="mb-6"   // الهامش السفلي
```

---

## 🔥 أمثلة عملية

### مثال 1: صفحة بسيطة

```typescript
export function SimplePage() {
  return (
    <MainLayout>
      <DashboardLayout title="صفحتي">
        <ResponsiveGrid cols={2}>
          <ResponsiveCard>
            <h3 className="font-bold mb-2">العنوان</h3>
            <p>المحتوى هنا</p>
          </ResponsiveCard>
          <ResponsiveCard>
            <h3 className="font-bold mb-2">العنوان 2</h3>
            <p>المحتوى هنا</p>
          </ResponsiveCard>
        </ResponsiveGrid>
      </DashboardLayout>
    </MainLayout>
  );
}
```

### مثال 2: صفحة مع نموذج

```typescript
export function FormPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email });
  };

  return (
    <MainLayout>
      <DashboardLayout title="النموذج">
        <ResponsiveCard className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <ResponsiveInput
              label="الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <ResponsiveInput
              label="البريد"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <ResponsiveButton fullWidth>
              إرسال
            </ResponsiveButton>
          </form>
        </ResponsiveCard>
      </DashboardLayout>
    </MainLayout>
  );
}
```

### مثال 3: قائمة بيانات

```typescript
export function DataList() {
  const [data] = React.useState([
    { id: 1, name: "العنصر 1", status: "نشط" },
    { id: 2, name: "العنصر 2", status: "معطل" },
  ]);

  return (
    <MainLayout>
      <DashboardLayout title="القائمة">
        <ResponsiveCard>
          <ResponsiveTable>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <ResponsiveBadge 
                      variant={item.status === "نشط" ? "success" : "danger"}
                    >
                      {item.status}
                    </ResponsiveBadge>
                  </td>
                  <td>
                    <ResponsiveButton size="sm">تحرير</ResponsiveButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </ResponsiveCard>
      </DashboardLayout>
    </MainLayout>
  );
}
```

---

## ⚙️ التكوين

### استخدام مع React Query

```typescript
import { useQuery } from "@tanstack/react-query";

function DataPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["items"],
    queryFn: () => fetch("/api/items").then(r => r.json()),
  });

  if (isLoading) return <ResponsiveSkeleton count={3} />;
  if (error) return <div>خطأ</div>;

  return (
    <MainLayout>
      <DashboardLayout>
        <ResponsiveGrid>
          {data?.map(item => (
            <ResponsiveCard key={item.id}>
              {item.name}
            </ResponsiveCard>
          ))}
        </ResponsiveGrid>
      </DashboardLayout>
    </MainLayout>
  );
}
```

### استخدام مع React Hook Form

```typescript
import { useForm } from "react-hook-form";

function FormPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ResponsiveInput
        label="الاسم"
        {...register("name", { required: "مطلوب" })}
        error={errors.name?.message}
      />
      <ResponsiveButton>إرسال</ResponsiveButton>
    </form>
  );
}
```

---

## 🎯 نقاط مهمة

✅ **ابدأ بالهاتف أولاً**
- الفئات الأساسية للهاتف
- أضف `sm:`, `md:`, `lg:` حسب الحاجة

✅ **استخدم الـ Components**
- عدم الحاجة لـ className معقد
- تناسق تلقائي

✅ **اختبر على أجهزة حقيقية**
- لا تعتمد على محاكاة المتصفح فقط
- استخدم DevTools كثيراً

✅ **احفظ CSS المخصص قليل**
- استخدم Tailwind قدر الإمكان
- custom فقط عند الضرورة

---

## 📚 الموارد

- `UI_DESIGN_SYSTEM_AR.md` - شرح مفصل
- `MODERN_UI_CHECKLIST.md` - قائمة المهام
- `MODERN_UI_SUMMARY.md` - الملخص الشامل

---

## 🎉 جاهز!

```bash
npm run dev     # شغل التطوير
npm run check   # تحقق من الأخطاء
npm run build   # بناء الإنتاج
```

**ابدأ الآن وأنشئ صفحتك الأولى! 🚀**
