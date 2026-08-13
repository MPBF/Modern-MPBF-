// ⚙️ صفحة إعدادات مستخدمي النظام الآليين (داخل صفحة الإعدادات)
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Play, Save } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";

const WEEKDAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

interface BotSettingsForm {
  enabled: boolean;
  allowed_days: number[];
  shift: "day" | "night";
  absence_pct: number;
  late_pct: number;
  late_max_minutes: number;
  early_leave_pct: number;
  early_leave_max_minutes: number;
  persona: string;
  daily_message_target: number;
  daily_message_cap: number;
  weekly_report_enabled: boolean;
  weekly_report_recipient_id: number | null;
}

function toForm(settings: any): BotSettingsForm {
  let days: number[] = [0, 1, 2, 3, 4];
  try {
    const parsed = JSON.parse(settings?.allowed_days || "[0,1,2,3,4]");
    if (Array.isArray(parsed)) days = parsed;
  } catch {
    /* تجاهل */
  }
  return {
    enabled: settings?.enabled ?? true,
    allowed_days: days,
    shift: settings?.shift === "night" ? "night" : "day",
    absence_pct: settings?.absence_pct ?? 10,
    late_pct: settings?.late_pct ?? 20,
    late_max_minutes: settings?.late_max_minutes ?? 45,
    early_leave_pct: settings?.early_leave_pct ?? 20,
    early_leave_max_minutes: settings?.early_leave_max_minutes ?? 60,
    persona: settings?.persona || "",
    daily_message_target: settings?.daily_message_target ?? 2,
    daily_message_cap: settings?.daily_message_cap ?? 10,
    weekly_report_enabled: settings?.weekly_report_enabled ?? false,
    weekly_report_recipient_id: settings?.weekly_report_recipient_id ?? null,
  };
}

function NumberField({
  label,
  value,
  onChange,
  max = 100,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  max?: number;
  suffix?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-1 mt-1">
        <Input
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(e) =>
            onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))
          }
          className="h-8"
        />
        {suffix && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function BotSettingsCard({
  bot,
  allUsers,
  usersLoading,
  usersError,
}: {
  bot: any;
  allUsers: any[];
  usersLoading: boolean;
  usersError: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BotSettingsForm>(() => toForm(bot.settings));
  const [dirty, setDirty] = useState(false);
  // رقم مراجعة التعديلات: لا نعتبر النموذج "نظيفاً" بعد الحفظ إلا إذا لم يعدّل المستخدم شيئاً أثناء الطلب
  const editRevision = useRef(0);
  const submittedRevision = useRef(0);

  // مزامنة النموذج مع البيانات المعاد جلبها ما لم توجد تعديلات غير محفوظة
  const settingsJson = JSON.stringify(bot.settings ?? null);
  const lastSynced = useRef(settingsJson);
  useEffect(() => {
    if (settingsJson !== lastSynced.current) {
      lastSynced.current = settingsJson;
      if (!dirty) setForm(toForm(bot.settings));
    }
  }, [settingsJson, dirty, bot.settings]);

  const setFormDirty: typeof setForm = (v) => {
    editRevision.current += 1;
    setDirty(true);
    setForm(v);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      submittedRevision.current = editRevision.current;
      const res = await fetch(`/api/system-users/${bot.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          persona: form.persona.trim() || null,
          weekly_report_recipient_id: form.weekly_report_enabled
            ? form.weekly_report_recipient_id
            : form.weekly_report_recipient_id,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}) as any);
        let msg = err.message || "فشل الحفظ";
        if (err.errors && typeof err.errors === "object") {
          const details = Object.values(err.errors).flat().filter(Boolean);
          if (details.length) msg += ": " + details.join("، ");
        }
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      // إذا عدّل المستخدم شيئاً بعد إرسال الحفظ، تبقى التعديلات غير المحفوظة محمية
      if (editRevision.current === submittedRevision.current) setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["/api/system-users"] });
      toast({ title: "تم حفظ إعدادات المستخدم بنجاح" });
    },
    onError: (e: any) => {
      toast({
        title: "لم يتم الحفظ",
        description: e?.message || "خطأ في حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  const name = bot.display_name_ar || bot.display_name || bot.username;
  const toggleDay = (d: number) => {
    setFormDirty((f) => ({
      ...f,
      allowed_days: f.allowed_days.includes(d)
        ? f.allowed_days.filter((x) => x !== d)
        : [...f.allowed_days, d].sort(),
    }));
  };

  return (
    <Card data-testid={`card-system-user-${bot.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-base">{name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {bot.username}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`enabled-${bot.id}`} className="text-sm">
              مفعّل
            </Label>
            <Switch
              id={`enabled-${bot.id}`}
              checked={form.enabled}
              onCheckedChange={(v) => setFormDirty((f) => ({ ...f, enabled: v }))}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* الأيام المسموحة والوردية */}
        <div>
          <Label className="text-xs">الأيام المسموحة لاستخدام النظام</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {WEEKDAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  form.allowed_days.includes(d.value)
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                }`}
                data-testid={`day-${bot.id}-${d.value}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">الوردية</Label>
            <Select
              value={form.shift}
              onValueChange={(v) =>
                setFormDirty((f) => ({ ...f, shift: v as "day" | "night" }))
              }
            >
              <SelectTrigger className="h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">نهارية (07:00 - 19:00)</SelectItem>
                <SelectItem value="night">ليلية (19:00 - 07:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <NumberField
            label="احتمال الغياب"
            value={form.absence_pct}
            onChange={(n) => setFormDirty((f) => ({ ...f, absence_pct: n }))}
            suffix="%"
          />
          <NumberField
            label="احتمال التأخير"
            value={form.late_pct}
            onChange={(n) => setFormDirty((f) => ({ ...f, late_pct: n }))}
            suffix="%"
          />
          <NumberField
            label="أقصى تأخير"
            value={form.late_max_minutes}
            onChange={(n) => setFormDirty((f) => ({ ...f, late_max_minutes: n }))}
            max={600}
            suffix="دقيقة"
          />
          <NumberField
            label="احتمال الانصراف المبكر"
            value={form.early_leave_pct}
            onChange={(n) => setFormDirty((f) => ({ ...f, early_leave_pct: n }))}
            suffix="%"
          />
          <NumberField
            label="أقصى انصراف مبكر"
            value={form.early_leave_max_minutes}
            onChange={(n) =>
              setFormDirty((f) => ({ ...f, early_leave_max_minutes: n }))
            }
            max={600}
            suffix="دقيقة"
          />
          <NumberField
            label="رسائل مبادَرة يومياً"
            value={form.daily_message_target}
            onChange={(n) =>
              setFormDirty((f) => ({ ...f, daily_message_target: n }))
            }
            max={20}
          />
          <NumberField
            label="حد الرسائل اليومي"
            value={form.daily_message_cap}
            onChange={(n) => setFormDirty((f) => ({ ...f, daily_message_cap: n }))}
            max={50}
          />
        </div>

        {/* الدور/الشخصية */}
        <div>
          <Label className="text-xs">الدور / الشخصية (لتوليد الرسائل والتقارير)</Label>
          <Textarea
            value={form.persona}
            onChange={(e) =>
              setFormDirty((f) => ({ ...f, persona: e.target.value }))
            }
            placeholder="مثال: مشرف وردية قسم الفيلم، يتابع الإنتاج اليومي والجودة ويهتم بتقليل الهالك…"
            rows={2}
            className="mt-1"
            data-testid={`persona-${bot.id}`}
          />
        </div>

        {/* التقرير الأسبوعي */}
        <div className="rounded-lg border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-sm">التقرير الأسبوعي</Label>
              <p className="text-xs text-gray-500 mt-0.5">
                يرفع تقريراً أسبوعياً (يوم الجمعة) بما تم عمله خلال الأسبوع
              </p>
            </div>
            <Switch
              checked={form.weekly_report_enabled}
              onCheckedChange={(v) =>
                setFormDirty((f) => ({ ...f, weekly_report_enabled: v }))
              }
              data-testid={`weekly-report-${bot.id}`}
            />
          </div>
          {form.weekly_report_enabled && (
            <div>
              <Label className="text-xs">مستلم التقرير</Label>
              <Select
                value={
                  form.weekly_report_recipient_id
                    ? String(form.weekly_report_recipient_id)
                    : "none"
                }
                onValueChange={(v) =>
                  setFormDirty((f) => ({
                    ...f,
                    weekly_report_recipient_id:
                      v === "none" ? null : Number(v),
                  }))
                }
              >
                <SelectTrigger
                  className="h-8 mt-1"
                  data-testid={`recipient-trigger-${bot.id}`}
                >
                  <SelectValue placeholder="اختر المستلم" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="none">غير محدد</SelectItem>
                  {usersLoading ? (
                    <div className="px-3 py-2 text-xs text-gray-500">
                      جارٍ تحميل المستخدمين…
                    </div>
                  ) : usersError ? (
                    <div className="px-3 py-2 text-xs text-red-600">
                      تعذر تحميل قائمة المستخدمين — أعد تحميل الصفحة
                    </div>
                  ) : (
                    allUsers
                      .filter((u) => u.id !== bot.id)
                      .map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.display_name_ar ||
                            u.display_name ||
                            u.username ||
                            `مستخدم ${u.id}`}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid={`save-system-user-${bot.id}`}
          >
            <Save className="h-4 w-4 ml-1.5" />
            {saveMutation.isPending ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemUsersSettingsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    simulation_enabled: boolean;
    users: any[];
  }>({
    queryKey: ["/api/system-users"],
  });

  const {
    data: allUsersRaw = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });
  // حماية من أي شكل استجابة غير متوقع
  const allUsers = Array.isArray(allUsersRaw)
    ? allUsersRaw
    : Array.isArray((allUsersRaw as any)?.data)
      ? (allUsersRaw as any).data
      : [];

  const toggleSimulation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await fetch("/api/system-users/simulation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("فشل تغيير حالة المحاكاة");
      return res.json();
    },
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-users"] });
      toast({
        title: d.simulation_enabled
          ? "تم تشغيل المحاكاة"
          : "تم إيقاف المحاكاة",
      });
    },
    onError: () =>
      toast({ title: "خطأ في تغيير حالة المحاكاة", variant: "destructive" }),
  });

  const runNow = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/system-users/run-now", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "فشل التشغيل الفوري");
      return body;
    },
    onSuccess: (d) => toast({ title: d.message || "تم تشغيل المحاكاة الآن" }),
    onError: (e: any) =>
      toast({ title: e?.message || "خطأ في التشغيل", variant: "destructive" }),
  });

  const bots = data?.users || [];

  return (
    <div className="space-y-4" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-violet-600" />
                مستخدمو النظام
              </CardTitle>
              <CardDescription className="mt-1">
                مستخدمون آليون يحاكون الحضور والانصراف والمراسلات والتقارير
                الأسبوعية تلقائياً. لإضافة مستخدم نظام فعّل خيار "مستخدم نظام"
                من نموذج إضافة/تعديل المستخدمين في صفحة التعريفات.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="sim-enabled" className="text-sm">
                  تشغيل المحاكاة
                </Label>
                <Switch
                  id="sim-enabled"
                  checked={data?.simulation_enabled ?? false}
                  onCheckedChange={(v) => toggleSimulation.mutate(v)}
                  disabled={toggleSimulation.isPending || isLoading}
                  data-testid="switch-simulation-enabled"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => runNow.mutate()}
                disabled={runNow.isPending || bots.length === 0}
                data-testid="button-run-now"
              >
                <Play className="h-4 w-4 ml-1.5" />
                {runNow.isPending ? "جارٍ التشغيل…" : "تشغيل الآن"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">جارٍ التحميل…</div>
      ) : bots.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            لا يوجد مستخدمو نظام بعد. فعّل خيار "مستخدم نظام" لأي مستخدم من
            صفحة التعريفات ← المستخدمون.
          </CardContent>
        </Card>
      ) : (
        bots.map((bot) => (
          <BotSettingsCard
            key={bot.id}
            bot={bot}
            allUsers={allUsers}
            usersLoading={usersLoading}
            usersError={usersError}
          />
        ))
      )}
    </div>
  );
}
