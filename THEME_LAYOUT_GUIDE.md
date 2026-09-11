# 🎨 Theme & Responsive Layout Documentation

## 📁 نظام الملفات

```
client/src/
├── styles/
│   ├── theme.ts                    # نظام التصميم الكامل
│   ├── layout.css                  # أنماط layout الأساسية
│   ├── dashboard.css               # أنماط لوحة التحكم
│   └── pages.css                   # أنماط الصفحات
├── components/
│   └── layout/
│       └── ResponsiveLayout.tsx    # مكونات layout القابلة لإعادة الاستخدام
└── pages/
    ├── dashboard/
    │   └── DashboardV2.tsx         # صفحة لوحة التحكم
    ├── orders/
    │   └── OrdersPageV2.tsx        # صفحة الطلبات
    └── production/
        └── ProductionPageV2.tsx    # صفحة الإنتاج
```

---

## 🎯 نظام التصميم (theme.ts)

### نقاط الفصل (Breakpoints)

```typescript
export const BREAKPOINTS = {
  xs: 0,      // الهواتف الصغيرة
  sm: 640,    // الهواتف
  md: 768,    // الأجهزة اللوحية
  lg: 1024,   // الأجهزة المحمولة
  xl: 1280,   // أجهزة الكمبيوتر
  "2xl": 1536, // الشاشات الكبيرة
};
```

### نظام الألوان (Color System)

كل لون يحتوي على 9 درجات:
- 50 - الأفتح
- 100, 200, 300 - فاتح
- 400, 500, 600 - متوسط
- 700, 800 - غامق
- 900 - الأغمق

```typescript
// الألوان الأساسية
PRIMARY: "#0ea5e9"      // أزرق سماوي
ACCENT: "#f97316"       // برتقالي
SUCCESS: "#22c55e"      // أخضر
WARNING: "#f59e0b"      // برتقالي فاتح
DANGER: "#ef4444"       // أحمر

// الألوان المحايدة
BACKGROUND: "#ffffff"   // الخلفية الرئيسية
SURFACE: "#f5f5f5"      // السطح الثانوي
BORDER: "#e5e5e5"       // الحدود
TEXT: "#171717"         // النص الأساسي
MUTED: "#737373"        // النص الخافت
```

### مقياس التباعد (Spacing Scale)

```typescript
xs: "0.25rem"  // 4px
sm: "0.5rem"   // 8px
md: "1rem"     // 16px
lg: "1.5rem"   // 24px
xl: "2rem"     // 32px
```

### أنماط الحدود (Border Radius)

```typescript
sm: "0.25rem"  // 4px
md: "0.5rem"   // 8px
lg: "0.75rem"  // 12px
xl: "1rem"     // 16px
```

### الظلال (Shadows)

```typescript
sm: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
md: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
2xl: "0 25px 50px -12px rgb(0 0 0 / 0.25)"
```

### الانتقالات (Transitions)

```typescript
fast: "150ms"    // سريع جداً (الـ hover)
base: "200ms"    // الافتراضي (الانتقالات)
slow: "300ms"    // بطيء (الرسوم المتحركة الكبيرة)
slower: "500ms"  // أبطأ (الرسوم المتحركة المعقدة)
```

---

## 🎨 layout.css - الأنماط الأساسية

### CSS Grid المتجاوب

```css
/* شبكة 1-4 أعمدة حسب الحجم */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 1024px) {
  grid-template-columns: repeat(3, 1fr);
}

@media (min-width: 1280px) {
  grid-template-columns: repeat(4, 1fr);
}
```

### Layout الرئيسي

```css
/* Header ثابت على الجوال */
.mobile-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  z-index: 1000;

  @media (min-width: 768px) {
    display: none;
  }
}

/* Sidebar متجاوب */
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 250px;
  height: 100vh;
  background: var(--color-surface);
  transform: translateX(100%);
  transition: transform var(--transition-base);

  @media (min-width: 768px) {
    position: relative;
    width: auto;
    transform: translateX(0);
  }

  &.open {
    transform: translateX(0);
  }
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: auto 1fr;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 200px 1fr;
  }
}
```

### الرسوم المتحركة

```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### دعم RTL

```css
/* للعربية (اليمين للليسار) */
[dir="rtl"] {
  direction: rtl;
  text-align: right;

  .sidebar {
    right: auto;
    left: 0;
    transform: translateX(-100%);
  }

  .element {
    margin-left: 0;
    margin-right: 1rem;
  }
}
```

---

## 📄 pages.css - أنماط الصفحات

### Search & Filter Bar

```css
.search-filter-bar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

### Order Cards (Mobile)

```css
.order-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-id-badge {
  display: inline-flex;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
}
```

### Progress Bar

```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-border);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-success)
  );
  transition: width 0.5s ease-out;
}
```

### Production Stages

```css
.stage-indicator {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stage-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;

  &.active {
    background: var(--color-success);
    color: white;
  }

  &.current {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.2);
  }
}
```

---

## 🎯 ResponsiveLayout.tsx - المكونات

### 1. ResponsiveLayout

العنصر الرئيسي لكل صفحة

```tsx
<ResponsiveLayout>
  {/* محتوى الصفحة */}
</ResponsiveLayout>
```

### 2. PageContainer

حاوية الصفحة مع العنوان والوصف

```tsx
<PageContainer
  title="عنوان الصفحة"
  description="وصف قصير للصفحة"
>
  {/* محتوى */}
</PageContainer>
```

### 3. Card

مكون البطاقة المرن

```tsx
<Card className="custom-class">
  محتوى البطاقة
</Card>
```

### 4. DashboardGrid

شبكة لوحة التحكم (متجاوبة تلقائياً)

```tsx
<DashboardGrid columns={3}>
  <Card>البطاقة 1</Card>
  <Card>البطاقة 2</Card>
  <Card>البطاقة 3</Card>
</DashboardGrid>
```

### 5. ResponsiveTable

جدول متجاوب مع scroll أفقي على الجوال

```tsx
<ResponsiveTable scrollable>
  <thead>
    <tr>
      <th>الرقم</th>
      <th>الاسم</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>البيان</td>
    </tr>
  </tbody>
</ResponsiveTable>
```

### 6. HeroSection

قسم البطل (الرأس)

```tsx
<HeroSection
  title="مرحباً"
  subtitle="هذا النص الثانوي"
  image="url"
/>
```

### 7. FormLayout

تخطيط النموذج (1-3 أعمدة)

```tsx
<FormLayout columns={2}>
  <input type="text" />
  <input type="email" />
</FormLayout>
```

---

## 📱 المسافات

### من الكود

```tsx
// استخدام متغيرات CSS
style={{
  padding: "var(--spacing-md)",
  gap: "var(--spacing-lg)",
  marginBottom: "var(--spacing-xl)",
}}

// أو في CSS
.my-class {
  padding: var(--spacing-md);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}
```

### الأحجام

| المتغير | القيمة | الاستخدام |
|--------|--------|---------|
| `--spacing-xs` | 4px | هوامش صغيرة جداً |
| `--spacing-sm` | 8px | هوامش صغيرة |
| `--spacing-md` | 16px | الهوامش الافتراضية |
| `--spacing-lg` | 24px | هوامش كبيرة |
| `--spacing-xl` | 32px | هوامش كبيرة جداً |

---

## 🌙 Dark Mode

### آلية العمل

Dark Mode يتم تطبيقه تلقائياً بناءً على تفضيلات النظام:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-surface: #2d2d2d;
    --color-text: #f0f0f0;
    /* ... */
  }
}
```

### الاستخدام

لا تحتاج لعمل أي شيء! يتم التبديل تلقائياً:

```typescript
// التحقق من الوضع الحالي
const isDark = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;
```

---

## ♿ إمكانية الوصول (Accessibility)

### ARIA Labels

```tsx
<button aria-label="تحديث البيانات">
  <RefreshIcon />
</button>
```

### Keyboard Navigation

- TAB: الانتقال بين العناصر
- ENTER: تفعيل الزر
- ESC: إغلاق القائمة

### Color Contrast

- النص على الخلفية: > 4.5:1
- النص الكبير: > 3:1

---

## 🚀 أمثلة عملية

### 1. صفحة جديدة

```tsx
import {
  ResponsiveLayout,
  PageContainer,
  Card,
  DashboardGrid,
} from "@/components/layout/ResponsiveLayout";

export function MyPage() {
  return (
    <ResponsiveLayout>
      <PageContainer
        title="صفحتي"
        description="وصف الصفحة"
      >
        <DashboardGrid columns={2}>
          <Card>
            <h3>بطاقة 1</h3>
          </Card>
          <Card>
            <h3>بطاقة 2</h3>
          </Card>
        </DashboardGrid>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

### 2. بطاقة مخصصة

```tsx
<Card className="custom-card">
  <div className="card-header">
    <h3>العنوان</h3>
    <button>إجراء</button>
  </div>
  <p>المحتوى</p>
</Card>
```

### 3. جدول متجاوب

```tsx
<ResponsiveTable scrollable>
  <thead>
    <tr>
      <th>الرقم</th>
      <th>الاسم</th>
      <th>الحالة</th>
    </tr>
  </thead>
  <tbody>
    {data.map((item) => (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.name}</td>
        <td>
          <span className="status-badge">
            {item.status}
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</ResponsiveTable>
```

---

## 🧪 الاختبار

### على الجوال

```bash
# 1. افتح المتصفح
# 2. اضغط F12 (أدوات المطور)
# 3. اضغط Ctrl+Shift+M (محاكي الهاتف)
# 4. اختر جهازاً من القائمة
```

### على أجهزة فعلية

```bash
# إذا كنت على نفس الشبكة:
# 1. احصل على عنوان IP
ipconfig getifaddr en0  # على Mac
hostname -I             # على Linux

# 2. افتح في المتصفح
http://[IP]:[PORT]
```

---

## ✅ Checklist للصفحات الجديدة

- [ ] استخدام `ResponsiveLayout`
- [ ] إضافة `PageContainer` مع العنوان
- [ ] استخدام `DashboardGrid` للعناصر المتجاوبة
- [ ] استخدام `Card` للمحتوى
- [ ] اختبار على الجوال (640px وأقل)
- [ ] اختبار على الجهاز اللوحي (768px)
- [ ] اختبار على الكمبيوتر (1024px+)
- [ ] التحقق من الـ RTL
- [ ] التحقق من Dark Mode
- [ ] إضافة ARIA labels للأزرار

---

## 📚 المراجع

- [Responsive Design - MDN](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Mobile-First Design](https://www.uxpin.com/studio/blog/mobile-first-design/)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)

---

**حالة التوثيق**: ✅ كامل وشامل
