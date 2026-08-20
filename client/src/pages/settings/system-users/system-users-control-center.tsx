import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity, AlertCircle, Bot, CalendarDays, Check, Clock3, Database,
  FileText, History, MessageSquare, Play, Plus, RefreshCw, Save, ShieldCheck,
  SlidersHorizontal, Trash2, UserRound,
} from "lucide-react";
import { useAuth } from "../../../hooks/use-auth";
import { useToast } from "../../../hooks/use-toast";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../../components/ui/dialog";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { jsonFetch, parseArray, pickEditableSystemUserSettings } from "./api";
import { ADVANCED_TABLES, KnowledgeItem, SOURCES, SystemUser, WEEKDAYS } from "./types";

type BotForm = Record<string, any>;
type NormalUser = {
  id: number;
  username?: string;
  display_name?: string | null;
  display_name_ar?: string | null;
  is_active?: boolean;
  deleted_at?: string | null;
};

const defaults: BotForm = {
  enabled: true,
  allowed_days: [0, 1, 2, 3, 4],
  shift: "day",
  absence_pct: 10,
  late_pct: 20,
  late_max_minutes: 45,
  early_leave_pct: 20,
  early_leave_max_minutes: 60,
  persona: "",
  daily_message_target: 2,
  daily_message_cap: 10,
  weekly_report_enabled: false,
  weekly_report_recipient_id: null,
  attendance_start_date: "",
  reply_style: "professional",
  reply_instructions: "",
  reply_delay_min_minutes: 0,
  reply_delay_max_minutes: 0,
  reply_allowed_days: null,
  reply_window_start: "",
  reply_window_end: "",
  allowed_message_categories: ["عامة", "تكليف عمل", "إشعار خصم", "إنذار", "توكيل مهام"],
};

const styles = [
  ["professional", "مهني"],
  ["concise", "مختصر"],
  ["detailed", "تفصيلي"],
  ["custom", "مخصص"],
];
const categories = ["عامة", "تكليف عمل", "إشعار خصم", "إنذار", "توكيل مهام"];
const nameOf = (u: { display_name_ar?: string | null; display_name?: string | null; username?: string }) =>
  u.display_name_ar || u.display_name || u.username || "مستخدم";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="rounded-md bg-primary/10 p-1.5 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">{children}</CardContent>
    </Card>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
      <AlertCircle className="mx-auto mb-2 h-7 w-7 text-destructive" />
      <p className="text-sm">تعذر تحميل البيانات</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
        <RefreshCw className="ml-2 h-4 w-4" />
        إعادة المحاولة
      </Button>
    </div>
  );
}

function normalizeOptional(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

function SettingsForm({ bot, recipients }: { bot: SystemUser; recipients: NormalUser[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyDaysChanged, setReplyDaysChanged] = useState(false);
  const [form, setForm] = useState<BotForm>(() => ({
    ...defaults,
    ...bot.settings,
    allowed_days: parseArray(bot.settings?.allowed_days, defaults.allowed_days),
    reply_allowed_days:
      bot.settings?.reply_allowed_days == null
        ? null
        : parseArray(bot.settings.reply_allowed_days, []),
    allowed_message_categories: parseArray(
      bot.settings?.allowed_message_categories,
      defaults.allowed_message_categories,
    ),
  }));

  const set = (key: string, value: any) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = useMutation({
    mutationFn: async () => {
      const minDelay = Number(form.reply_delay_min_minutes || 0);
      const maxDelay = Number(form.reply_delay_max_minutes || 0);
      if (minDelay > maxDelay) {
        throw new Error("يجب ألا يتجاوز الحد الأدنى للتأخير الحد الأعلى");
      }
      const payload = pickEditableSystemUserSettings({
        ...form,
        persona: normalizeOptional(form.persona?.trim()),
        attendance_start_date: normalizeOptional(form.attendance_start_date),
        reply_instructions: normalizeOptional(form.reply_instructions?.trim()),
        reply_window_start: normalizeOptional(form.reply_window_start),
        reply_window_end: normalizeOptional(form.reply_window_end),
        reply_delay_min_minutes: minDelay,
        reply_delay_max_minutes: maxDelay,
      });
      if (!replyDaysChanged && form.reply_allowed_days === null) {
        delete payload.reply_allowed_days;
      }
      return jsonFetch(`/api/system-users/${bot.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-users"] });
      toast({ title: "تم حفظ إعدادات المستخدم" });
    },
    onError: (error: Error) => {
      toast({ title: "لم يتم الحفظ", description: error.message, variant: "destructive" });
    },
  });

  const toggleArray = (key: string, value: string | number) => {
    const values = Array.isArray(form[key]) ? form[key] : [];
    set(key, values.includes(value) ? values.filter((item: any) => item !== value) : [...values, value]);
  };

  const numericFields = [
    ["absence_pct", "احتمال الغياب", "%"],
    ["late_pct", "احتمال التأخير", "%"],
    ["early_leave_pct", "احتمال الانصراف المبكر", "%"],
    ["late_max_minutes", "أقصى تأخير", "دقيقة"],
    ["early_leave_max_minutes", "أقصى انصراف مبكر", "دقيقة"],
    ["daily_message_target", "الهدف اليومي", "رسالة"],
    ["daily_message_cap", "الحد اليومي", "رسالة"],
  ];

  return (
    <Tabs defaultValue="operation" dir="rtl" className="space-y-4">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-muted/60 p-1 sm:grid-cols-6">
        <TabsTrigger value="operation">التشغيل والهوية</TabsTrigger>
        <TabsTrigger value="guidance">التوجيهات والمعرفة</TabsTrigger>
        <TabsTrigger value="attendance">الحضور</TabsTrigger>
        <TabsTrigger value="messaging">المراسلات</TabsTrigger>
        <TabsTrigger value="access">مصادر البيانات</TabsTrigger>
        <TabsTrigger value="activity">النشاط</TabsTrigger>
      </TabsList>

      <TabsContent value="operation" className="space-y-4">
        <Section
          icon={SlidersHorizontal}
          title="حالة المستخدم الآلي"
          description="الإعدادات الأساسية الحالية محفوظة كما هي، مع تحكم واضح في التشغيل."
        >
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
            <div>
              <p className="font-semibold">{form.enabled ? "المستخدم مفعّل" : "المستخدم متوقف"}</p>
              <p className="text-xs text-muted-foreground">
                يؤثر ذلك على المحاكاة اليومية والمراسلات داخل النظام
              </p>
            </div>
            <Switch checked={!!form.enabled} onCheckedChange={(value) => set("enabled", value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="الوردية">
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.shift}
                onChange={(event) => set("shift", event.target.value)}
              >
                <option value="day">نهارية (07:00 — 19:00)</option>
                <option value="night">ليلية (19:00 — 07:00)</option>
              </select>
            </Field>
            <Field label="الدور / الشخصية">
              <Textarea
                value={form.persona}
                onChange={(event) => set("persona", event.target.value)}
                rows={3}
                placeholder="وصف مختصر للدور التشغيلي..."
              />
            </Field>
          </div>
          <Field label="أيام التشغيل">
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => toggleArray("allowed_days", Number(value))}
                  className={`rounded-md border px-3 py-2 text-xs transition-colors ${
                    form.allowed_days.includes(Number(value))
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {numericFields.map(([key, label, suffix]) => (
              <Field key={key} label={label}>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={form[key]}
                    onChange={(event) => set(key, Number(event.target.value))}
                  />
                  <span className="text-xs text-muted-foreground">{suffix}</span>
                </div>
              </Field>
            ))}
          </div>
        </Section>
        <Section
          icon={FileText}
          title="التقرير الأسبوعي"
          description="حافظ على إعدادات التقرير الحالية والمستلم المحدد."
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تفعيل التقرير الأسبوعي</p>
              <p className="text-xs text-muted-foreground">
                ينشئ ملخص يوم الجمعة حسب الإعدادات الحالية
              </p>
            </div>
            <Switch
              checked={!!form.weekly_report_enabled}
              onCheckedChange={(value) => set("weekly_report_enabled", value)}
            />
          </div>
          <Field label="مستلم التقرير">
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.weekly_report_recipient_id ?? ""}
              onChange={(event) =>
                set("weekly_report_recipient_id", event.target.value ? Number(event.target.value) : null)
              }
            >
              <option value="">غير محدد</option>
              {recipients
                .filter((recipient) => recipient.id !== bot.id && !recipient.deleted_at && recipient.is_active !== false)
                .map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {nameOf(recipient)}
                  </option>
                ))}
            </select>
          </Field>
        </Section>
      </TabsContent>

      <TabsContent value="guidance">
        <KnowledgeSection bot={bot} />
      </TabsContent>
      <TabsContent value="attendance">
        <AttendanceSection bot={bot} form={form} set={set} />
      </TabsContent>
      <TabsContent value="messaging">
        <Section
          icon={MessageSquare}
          title="قواعد المراسلات"
          description="يتعامل المستخدم الآلي مع الرسائل الداخلية فقط، وفق نافذة الرد والفئات المسموحة."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="أسلوب الرد">
              <select
                className="h-10 w-full rounded-md border bg-background px-3"
                value={form.reply_style}
                onChange={(event) => set("reply_style", event.target.value)}
              >
                {styles.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="تعليمات رد إضافية">
              <Textarea
                maxLength={4000}
                value={form.reply_instructions}
                onChange={(event) => set("reply_instructions", event.target.value)}
                rows={4}
              />
            </Field>
            <Field label="أدنى تأخير بالدقائق">
              <Input
                type="number"
                min={0}
                value={form.reply_delay_min_minutes}
                onChange={(event) => set("reply_delay_min_minutes", Number(event.target.value))}
              />
            </Field>
            <Field label="أقصى تأخير بالدقائق">
              <Input
                type="number"
                min={0}
                value={form.reply_delay_max_minutes}
                onChange={(event) => set("reply_delay_max_minutes", Number(event.target.value))}
              />
            </Field>
            <Field label="بداية نافذة الرد">
              <Input type="time" value={form.reply_window_start} onChange={(event) => set("reply_window_start", event.target.value)} />
            </Field>
            <Field label="نهاية نافذة الرد">
              <Input type="time" value={form.reply_window_end} onChange={(event) => set("reply_window_end", event.target.value)} />
            </Field>
          </div>
          <Field label="أيام الرد المسموحة">
            <div className="mb-3 flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">استخدام أيام التشغيل</p>
                <p className="text-xs text-muted-foreground">عند التفعيل يرث المستخدم أيام التشغيل الحالية تلقائياً</p>
              </div>
              <Switch
                checked={form.reply_allowed_days === null}
                onCheckedChange={(inherit) => {
                  setReplyDaysChanged(true);
                  set(
                    "reply_allowed_days",
                    inherit ? null : [...(form.allowed_days || [])],
                  );
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  disabled={form.reply_allowed_days === null}
                  onClick={() => {
                    setReplyDaysChanged(true);
                    toggleArray("reply_allowed_days", Number(value));
                  }}
                  className={`rounded-md border px-3 py-2 text-xs ${
                    (form.reply_allowed_days ?? form.allowed_days).includes(Number(value))
                      ? "border-primary bg-primary text-primary-foreground"
                      : ""
                  } ${form.reply_allowed_days === null ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="فئات الرسائل المسموحة">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => toggleArray("allowed_message_categories", category)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    form.allowed_message_categories.includes(category)
                      ? "border-primary bg-primary/10 text-primary"
                      : ""
                  }`}
                >
                  {form.allowed_message_categories.includes(category) && <Check className="ml-1 inline h-3 w-3" />}
                  {category}
                </button>
              ))}
            </div>
          </Field>
        </Section>
      </TabsContent>
      <TabsContent value="access"><DataAccessSection bot={bot} /></TabsContent>
      <TabsContent value="activity"><ActivitySection bot={bot} /></TabsContent>
      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="ml-2 h-4 w-4" />
          {save.isPending ? "جارٍ الحفظ..." : "حفظ إعدادات المستخدم"}
        </Button>
      </div>
    </Tabs>
  );
}

function KnowledgeSection({ bot }: { bot: SystemUser }) {
  const [scope, setScope] = useState<"global" | "bot">("bot");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scopeKey = scope === "global" ? "global" : bot.id;
  const queryUrl = scope === "global"
    ? "/api/system-users/knowledge?system_user_id="
    : `/api/system-users/knowledge?system_user_id=${bot.id}`;
  const knowledge = useQuery<KnowledgeItem[]>({
    queryKey: ["/api/system-users/knowledge", scopeKey],
    queryFn: () => jsonFetch<any>(queryUrl).then((body) => body.data || body),
  });
  const remove = useMutation({
    mutationFn: (id: number) => jsonFetch(`/api/system-users/knowledge/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-users/knowledge"] });
      setDeleteTarget(null);
      toast({ title: "تم حذف عنصر المعرفة" });
    },
    onError: (error: Error) => toast({ title: "تعذر حذف العنصر", description: error.message, variant: "destructive" }),
  });

  return (
    <Section
      icon={FileText}
      title="التوجيهات وقاعدة المعرفة"
      description="تُقرأ العناصر العامة المنشورة أولاً، ثم عناصر المستخدم الآلي المحدد."
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-lg border bg-muted/30 p-1">
          <button type="button" onClick={() => setScope("global")} className={`rounded-md px-3 py-2 text-xs ${scope === "global" ? "bg-background font-semibold shadow-sm" : ""}`}>مشترك لكل المستخدمين</button>
          <button type="button" onClick={() => setScope("bot")} className={`rounded-md px-3 py-2 text-xs ${scope === "bot" ? "bg-background font-semibold shadow-sm" : ""}`}>خاص بـ {nameOf(bot)}</button>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" />إضافة عنصر
        </Button>
      </div>
      {knowledge.isLoading ? (
        <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
      ) : knowledge.isError ? (
        <ErrorState retry={() => knowledge.refetch()} />
      ) : !knowledge.data?.length ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">لا توجد عناصر في هذا النطاق</div>
      ) : (
        <div className="space-y-2">
          {knowledge.data.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{item.title}</span>
                  <Badge variant="outline">{item.category || "غير مصنف"}</Badge>
                  <Badge variant="outline">{item.item_type || "knowledge"}</Badge>
                  <Badge variant={item.is_published ? "default" : "secondary"}>{item.is_published ? "منشور" : "مسودة"}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.content}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setDialogOpen(true); }}>تعديل</Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <KnowledgeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bot={bot}
        scope={scope}
        item={editing}
      />
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف عنصر المعرفة؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف «{deleteTarget?.title}» نهائياً من هذا المركز.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && remove.mutate(deleteTarget.id)} disabled={remove.isPending}>تأكيد الحذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

function KnowledgeDialog({
  open,
  onOpenChange,
  bot,
  scope,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: SystemUser;
  scope: "global" | "bot";
  item: KnowledgeItem | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>({});
  const initial = item || {
    title: "",
    content: "",
    category: "",
    item_type: "knowledge",
    priority: 100,
    is_published: true,
    tags: [],
  };

  useEffect(() => {
    if (open) setForm({ ...initial, tags: Array.isArray(initial.tags) ? initial.tags.join(", ") : initial.tags || "" });
  }, [open, item]);

  const save = useMutation({
    mutationFn: () => jsonFetch(item ? `/api/system-users/knowledge/${item.id}` : "/api/system-users/knowledge", {
      method: item ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        category: form.category?.trim() || null,
        priority: Number(form.priority || 100),
        tags: Array.isArray(form.tags)
          ? form.tags
          : String(form.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
        system_user_id: scope === "global" ? null : bot.id,
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-users/knowledge"] });
      onOpenChange(false);
      toast({ title: "تم حفظ عنصر المعرفة" });
    },
    onError: (error: Error) => toast({ title: "تعذر حفظ العنصر", description: error.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{item ? "تعديل عنصر" : scope === "global" ? "إضافة عنصر مشترك" : "إضافة عنصر خاص"}</DialogTitle>
          <DialogDescription>اكتب تعليمات آمنة ومحددة دون أسرار أو نصوص رسائل كاملة.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="العنوان"><Input value={form.title || ""} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
          <Field label="المحتوى"><Textarea rows={6} value={form.content || ""} onChange={(event) => setForm({ ...form, content: event.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الفئة"><Input value={form.category || ""} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="الإنتاج، الجودة..." /></Field>
            <Field label="الأولوية"><Input type="number" value={form.priority ?? 100} onChange={(event) => setForm({ ...form, priority: event.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="النوع">
              <select className="h-10 w-full rounded-md border bg-background px-2" value={form.item_type || "knowledge"} onChange={(event) => setForm({ ...form, item_type: event.target.value })}>
                <option value="knowledge">معرفة</option><option value="instruction">توجيه</option><option value="command">قاعدة ملزمة</option>
              </select>
            </Field>
            <Field label="الوسوم"><Input placeholder="إنتاج، جودة، وردية" value={form.tags || ""} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></Field>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm">منشور في سياق {scope === "global" ? "مشترك" : "المستخدم"}</span>
            <Switch checked={form.is_published !== false} onCheckedChange={(value) => setForm({ ...form, is_published: value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AttendanceSection({ bot, form, set }: { bot: SystemUser; form: BotForm; set: (key: string, value: any) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = !!user?.permissions?.includes("admin");
  const [start, setStart] = useState(form.attendance_start_date || "");
  const [end, setEnd] = useState(new Date(Date.now() - 86400000).toISOString().slice(0, 10));
  const [preview, setPreview] = useState<any>(null);
  const [confirm, setConfirm] = useState(false);
  const run = async (path: string) => {
    const desiredAttendanceStart = normalizeOptional(form.attendance_start_date);
    const persistedAttendanceStart = bot.settings?.attendance_start_date
      ? String(bot.settings.attendance_start_date).slice(0, 10)
      : null;
    if (desiredAttendanceStart !== persistedAttendanceStart) {
      await jsonFetch(`/api/system-users/${bot.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance_start_date: desiredAttendanceStart }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/system-users"] });
    }
    return jsonFetch<any>(`/api/system-users/${bot.id}/attendance/history/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_date: start, end_date: end }),
    });
  };
  const previewMutation = useMutation({
    mutationFn: () => run("preview"),
    onSuccess: setPreview,
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });
  const generate = useMutation({
    mutationFn: () => run("generate"),
    onSuccess: (result) => {
      setConfirm(false);
      setPreview(null);
      toast({ title: `تم إنشاء ${result.created} سجل حضور` });
    },
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });
  const counts = [
    ["eligible_days", "أيام مؤهلة"],
    ["would_create", "سينشأ"],
    ["existing_days", "موجودة"],
    ["simulated_absent_days", "غياب محاكى"],
  ];

  return (
    <Section icon={CalendarDays} title="الحضور والانصراف" description="تاريخ البداية يمنع إنشاء حضور محاكى قبل التاريخ المحدد.">
      <Field label="تاريخ بداية الحضور (اختياري)">
        <Input type="date" value={form.attendance_start_date || ""} onChange={(event) => { set("attendance_start_date", event.target.value); setStart(event.target.value); }} />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="بداية نطاق المعاينة"><Input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></Field>
        <Field label="نهاية نطاق المعاينة"><Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></Field>
      </div>
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-primary" />توليد السجلات التاريخية</div>
        <p className="mt-1 text-xs text-muted-foreground">يمكن لمديري الصفحة معاينة النطاق. يتطلب إنشاء السجلات صلاحية admin وتأكيداً صريحاً.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => previewMutation.mutate()} disabled={!start || !end || previewMutation.isPending}>
            <RefreshCw className="ml-2 h-4 w-4" />معاينة النطاق
          </Button>
          {preview && <Button onClick={() => setConfirm(true)} disabled={!isAdmin || !preview.would_create}>تأكيد الإنشاء</Button>}
        </div>
        {preview && <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">{counts.map(([key, label]) => <div key={key} className="rounded-md border bg-background p-3 text-center"><b className="block text-lg">{preview[key]}</b><span className="text-xs text-muted-foreground">{label}</span></div>)}</div>}
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader><AlertDialogTitle>تأكيد إنشاء الحضور التاريخي</AlertDialogTitle><AlertDialogDescription>سيتم إنشاء السجلات الجديدة فقط وتجاوز الأيام الموجودة. هذا الإجراء يكتب بيانات فعلية.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => generate.mutate()} disabled={generate.isPending}>أؤكد الإنشاء</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

function DataAccessSection({ bot }: { bot: SystemUser }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const admin = !!user?.permissions?.includes("admin");
  const access = useQuery<any>({
    queryKey: ["/api/system-users/data-access", bot.id],
    queryFn: () => jsonFetch(`/api/system-users/${bot.id}/data-access`),
  });
  const [sources, setSources] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    setSources(access.data?.sources || []);
    setTables(access.data?.tables || []);
  }, [bot.id, access.data]);

  const save = useMutation({
    mutationFn: () => jsonFetch(`/api/system-users/${bot.id}/data-access`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sources, tables }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-users/data-access", bot.id] });
      toast({ title: "تم تحديث صلاحيات مصادر البيانات" });
    },
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });

  return (
    <Section icon={Database} title="مصادر البيانات" description="وصول قراءة فقط من مصادر ثابتة؛ لا تقبل هذه الواجهة استعلامات SQL حرة.">
      {access.isLoading ? <Skeleton className="h-24" /> : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {SOURCES.map(([key, label, description]) => (
              <button type="button" key={key} onClick={() => setSources((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} className={`rounded-lg border p-3 text-right transition-colors ${sources.includes(key) ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}>
                <div className="flex items-center justify-between"><span className="font-semibold">{label}</span>{sources.includes(key) && <Check className="h-4 w-4 text-primary" />}</div>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            ))}
          </div>
          <div className={`border-t pt-4 ${!admin ? "opacity-60" : ""}`}>
            <div className="mb-2 flex items-center justify-between"><div><p className="font-semibold">الجداول المتقدمة</p><p className="text-xs text-muted-foreground">متاحة حصراً لصلاحية admin الصريحة</p></div><ShieldCheck className="h-5 w-5 text-muted-foreground" /></div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ADVANCED_TABLES.map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!admin} checked={tables.includes(key)} onChange={() => setTables((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} />{label}<code className="text-xs text-muted-foreground">{key}</code></label>)}
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="ml-2 h-4 w-4" />حفظ الوصول</Button></div>
        </>
      )}
    </Section>
  );
}

function detailText(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(detailText).join("، ");
  return Object.entries(value as Record<string, unknown>).map(([key, nested]) => `${key}: ${detailText(nested)}`).join("، ");
}

function ActivitySection({ bot }: { bot: SystemUser }) {
  const [cursor, setCursor] = useState<string | undefined>();
  const activity = useQuery<any>({
    queryKey: ["/api/system-users/activity", bot.id, cursor],
    queryFn: () => jsonFetch(`/api/system-users/${bot.id}/activity?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`),
  });
  const events = activity.data?.events || activity.data?.data || [];
  return (
    <Section icon={Activity} title="سجل النشاط" description="آخر التغييرات ونتائج التشغيل، دون عرض محتوى الرسائل الكامل.">
      {activity.isLoading ? <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : activity.isError ? <ErrorState retry={() => activity.refetch()} /> : !events.length ? <div className="p-8 text-center text-sm text-muted-foreground">لا توجد أحداث مسجلة لهذا المستخدم</div> : (
        <div className="divide-y rounded-lg border">{events.map((event: any) => <div key={event.id} className="flex gap-3 p-3"><div className="mt-1 rounded-full bg-primary/10 p-2 text-primary"><Clock3 className="h-4 w-4" /></div><div className="min-w-0"><p className="font-medium">{event.action}</p><p className="text-xs text-muted-foreground">{event.actor_name || event.actor || "النظام"} · {new Date(event.created_at).toLocaleString("ar-SA")}</p><p className="mt-1 text-xs">{detailText(event.details)}</p></div></div>)}</div>
      )}
      {activity.data?.next_cursor && <Button variant="outline" className="mt-3" onClick={() => setCursor(activity.data.next_cursor)}>تحميل أحداث أقدم</Button>}
    </Section>
  );
}

export function SystemUsersSettingsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const systemUsers = useQuery<{ simulation_enabled: boolean; users: SystemUser[] }>({
    queryKey: ["/api/system-users"],
    queryFn: () => jsonFetch("/api/system-users"),
  });
  const recipientsQuery = useQuery<any>({
    queryKey: ["/api/users", "weekly-report-recipients"],
    queryFn: () => jsonFetch("/api/users"),
  });
  const users = systemUsers.data?.users || [];
  const rawRecipients =
    recipientsQuery.data?.data ||
    recipientsQuery.data?.users ||
    recipientsQuery.data ||
    [];
  const recipients: NormalUser[] = Array.isArray(rawRecipients) ? rawRecipients : [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const selected = users.find((user) => user.id === selectedId) || users[0];
  const filtered = useMemo(() => users.filter((user) => `${nameOf(user)} ${user.username}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const toggle = useMutation({
    mutationFn: (enabled: boolean) => jsonFetch("/api/system-users/simulation", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/system-users"] }),
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });
  const runNow = useMutation({
    mutationFn: () => jsonFetch("/api/system-users/run-now", { method: "POST" }),
    onSuccess: () => toast({ title: "تم تشغيل المحاكاة الآن" }),
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });

  return (
    <div dir="rtl" className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-xl border bg-gradient-to-l from-primary/10 via-background to-background p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2"><div className="rounded-lg bg-primary p-2 text-primary-foreground"><Bot className="h-5 w-5" /></div><div><h2 className="text-xl font-bold tracking-tight">مركز مستخدمي النظام</h2><p className="text-sm text-muted-foreground">ضبط سلوك المستخدمين الآليين بثقة غرفة تحكم تشغيلية</p></div></div>
        <div className="flex items-center gap-3"><div className="rounded-lg border bg-background/70 px-3 py-2 text-center"><span className="block text-[10px] text-muted-foreground">المستخدمون</span><strong>{users.length}</strong></div><div className="flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2"><span className="text-xs font-semibold">المحاكاة</span><Switch checked={!!systemUsers.data?.simulation_enabled} onCheckedChange={(value) => toggle.mutate(value)} disabled={toggle.isPending || systemUsers.isLoading} /></div><Button variant="outline" size="sm" onClick={() => runNow.mutate()} disabled={runNow.isPending || !users.length}><Play className="ml-2 h-4 w-4" />تشغيل الآن</Button></div>
      </div>
      {systemUsers.isLoading ? <div className="grid gap-4 lg:grid-cols-[280px_1fr]"><Skeleton className="h-[520px]" /><Skeleton className="h-[520px]" /></div> : systemUsers.isError ? <ErrorState retry={() => systemUsers.refetch()} /> : !users.length ? <Card><CardContent className="p-12 text-center"><UserRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="font-semibold">لا يوجد مستخدمو نظام</p><p className="mt-1 text-sm text-muted-foreground">فعّل خيار مستخدم نظام من صفحة التعريفات لإظهاره هنا.</p></CardContent></Card> : (
        <div className="grid items-start gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="lg:sticky lg:top-4"><CardHeader className="pb-3"><CardTitle className="text-sm">قائمة المستخدمين</CardTitle><Input placeholder="بحث سريع..." value={search} onChange={(event) => setSearch(event.target.value)} /></CardHeader><CardContent className="space-y-2 pt-0">{filtered.map((user) => <button type="button" key={user.id} onClick={() => setSelectedId(user.id)} className={`w-full rounded-lg border p-3 text-right transition-all ${selected?.id === user.id ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/50"}`}><div className="flex items-center justify-between gap-2"><span className="truncate font-semibold">{nameOf(user)}</span><span className={`h-2 w-2 shrink-0 rounded-full ${user.settings?.enabled === false ? "bg-muted-foreground" : "bg-emerald-500"}`} /></div><div className="mt-1 flex items-center justify-between text-xs text-muted-foreground"><span dir="ltr">@{user.username}</span><span>{user.settings?.enabled === false ? "متوقف" : "مفعّل"}</span></div></button>)}{!filtered.length && <p className="py-6 text-center text-xs text-muted-foreground">لا نتائج مطابقة</p>}</CardContent></Card>
          <div className="min-w-0">{selected && <><div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Bot className="h-5 w-5" /></div><div><h3 className="font-bold">{nameOf(selected)}</h3><p className="text-xs text-muted-foreground" dir="ltr">@{selected.username}</p></div></div><Badge variant={selected.settings?.enabled === false ? "secondary" : "default"}>{selected.settings?.enabled === false ? "متوقف" : "قيد التشغيل"}</Badge></div><SettingsForm key={selected.id} bot={selected} recipients={recipients} /></>}</div>
        </div>
      )}
    </div>
  );
}