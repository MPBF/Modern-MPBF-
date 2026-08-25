import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  Key,
  LockKeyhole,
  PhoneCall,
  Plug,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../components/layout/PageLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
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
import { Switch } from "../../components/ui/switch";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  voice_access: boolean;
  voice_allowlist_bypass: boolean;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

type ToolKind = "read" | "write" | "twilio";
type ToolGroup = "discovery" | "factory-read" | "factory-write" | "twilio";

interface McpTool {
  name: string;
  description: string;
  descriptionEn: string;
  kind: ToolKind;
  group: ToolGroup;
}

const MCP_TOOLS: McpTool[] = [
  {
    name: "search",
    description: "بحث شامل في بيانات المصنع",
    descriptionEn: "Search across factory data",
    kind: "read",
    group: "discovery",
  },
  {
    name: "fetch",
    description: "استرجاع السجل الكامل من نتيجة البحث",
    descriptionEn: "Fetch a full record from search",
    kind: "read",
    group: "discovery",
  },
  {
    name: "get_dashboard_stats",
    description: "إحصائيات لوحة تحكم المصنع",
    descriptionEn: "Factory dashboard statistics",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_orders",
    description: "عرض وبحث طلبات العملاء",
    descriptionEn: "List and search customer orders",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_production_status",
    description: "حالة أوامر الإنتاج ونسب الإنجاز",
    descriptionEn: "Production status and completion",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_inventory",
    description: "مستويات المخزون والمواد منخفضة الكمية",
    descriptionEn: "Inventory levels and low stock",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_machines_status",
    description: "حالة الماكينات وأنواعها",
    descriptionEn: "Machine status and types",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_maintenance_requests",
    description: "طلبات صيانة الماكينات",
    descriptionEn: "Machine maintenance requests",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_attendance_summary",
    description: "ملخص حضور الموظفين",
    descriptionEn: "Employee attendance summary",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_customers",
    description: "قائمة العملاء وبيانات التواصل",
    descriptionEn: "Customer list and contact details",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_quality_issues",
    description: "مشاكل الجودة المسجلة في الإنتاج",
    descriptionEn: "Quality issues tracked in production",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "search_rolls",
    description: "البحث عن الرولات برقمها أو QR أو أمر الإنتاج",
    descriptionEn: "Search rolls by number, QR, or production order",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_categories",
    description: "عرض فئات المنتجات",
    descriptionEn: "List product categories",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "get_customer_products",
    description: "عرض مواصفات منتجات العميل",
    descriptionEn: "Get customer product specifications",
    kind: "read",
    group: "factory-read",
  },
  {
    name: "create_customer",
    description: "إنشاء عميل جديد",
    descriptionEn: "Create a customer",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "update_customer",
    description: "تعديل بيانات عميل",
    descriptionEn: "Update a customer",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "create_category",
    description: "إنشاء فئة منتجات",
    descriptionEn: "Create a product category",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "create_item",
    description: "إنشاء مادة أو صنف مخزون",
    descriptionEn: "Create an inventory item",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "create_customer_product",
    description: "إنشاء مواصفات منتج عميل",
    descriptionEn: "Create a customer product",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "update_customer_product",
    description: "تعديل مواصفات منتج عميل",
    descriptionEn: "Update a customer product",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "create_order",
    description: "إنشاء طلب عميل جديد",
    descriptionEn: "Create a customer order",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "update_order",
    description: "تعديل تفاصيل الطلب",
    descriptionEn: "Update order details",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "update_order_status",
    description: "تغيير حالة الطلب",
    descriptionEn: "Change order status",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "create_production_order",
    description: "إنشاء أمر إنتاج مرتبط بطلب",
    descriptionEn: "Create a production order",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "update_production_order_status",
    description: "تغيير حالة أمر الإنتاج",
    descriptionEn: "Change production order status",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "update_production_order",
    description: "تعديل تفاصيل أمر الإنتاج",
    descriptionEn: "Update production order details",
    kind: "write",
    group: "factory-write",
  },
  {
    name: "twilio_make_call",
    description: "إجراء مكالمة صادرة وقراءة رسالة عبر TTS",
    descriptionEn: "Make an outbound TTS phone call",
    kind: "twilio",
    group: "twilio",
  },
  {
    name: "twilio_get_call_status",
    description: "قراءة حالة مكالمة Twilio ومدتها",
    descriptionEn: "Get Twilio call status and duration",
    kind: "twilio",
    group: "twilio",
  },
  {
    name: "twilio_list_recent_calls",
    description: "عرض المكالمات الأخيرة وحالاتها",
    descriptionEn: "List recent calls and statuses",
    kind: "twilio",
    group: "twilio",
  },
];

const steps = [
  { number: 1, title: "إنشاء المفتاح", titleEn: "Create key" },
  { number: 2, title: "ربط ChatGPT", titleEn: "Connect ChatGPT" },
  { number: 3, title: "الأدوات المتاحة", titleEn: "Available tools" },
  { number: 4, title: "الصلاحيات والدعم", titleEn: "Access & help" },
];

const toolGroupLabels: Record<ToolGroup, { ar: string; en: string }> = {
  discovery: { ar: "البحث والاسترجاع", en: "Discovery & retrieval" },
  "factory-read": { ar: "قراءة بيانات المصنع", en: "Factory read tools" },
  "factory-write": { ar: "الإنشاء والتعديل", en: "Create & update tools" },
  twilio: { ar: "المكالمات الصوتية", en: "Voice tools" },
};

function ToolBadge({ kind, isAr }: { kind: ToolKind; isAr: boolean }) {
  const labels = {
    read: isAr ? "قراءة" : "Read",
    write: isAr ? "تعديل" : "Write",
    twilio: "Twilio",
  };
  const classes = {
    read: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    write:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    twilio:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${classes[kind]}`}>
      {labels[kind]}
    </Badge>
  );
}

function StepIcon({ number, active, complete }: { number: number; active: boolean; complete: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
        complete
          ? "border-primary bg-primary text-primary-foreground"
          : active
            ? "border-primary bg-primary/10 text-primary"
            : "border-muted-foreground/30 text-muted-foreground"
      }`}
    >
      {complete ? <Check className="h-4 w-4" /> : number}
    </span>
  );
}

export default function McpSettings() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  return (
    <PageLayout title={isAr ? "إعدادات MCP" : "MCP Settings"}>
      <McpSettingsContent embedded={false} />
    </PageLayout>
  );
}

export function McpSettingsContent({
  embedded = true,
}: {
  embedded?: boolean;
}) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [newKeyName, setNewKeyName] = useState("");
  const [enableVoiceOnCreate, setEnableVoiceOnCreate] = useState(false);
  const [bypassOnCreate, setBypassOnCreate] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toolSearch, setToolSearch] = useState("");
  const [toolFilter, setToolFilter] = useState<"all" | ToolKind>("all");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const { data: apiKeys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/mcp/api-keys"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/mcp/api-keys", {
        method: "POST",
        body: JSON.stringify({
          name: newKeyName.trim(),
          voice_access: enableVoiceOnCreate,
          voice_allowlist_bypass: enableVoiceOnCreate && bypassOnCreate,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedKey(data.api_key);
      setNewKeyName("");
      setEnableVoiceOnCreate(false);
      setBypassOnCreate(false);
      queryClient.invalidateQueries({ queryKey: ["/api/mcp/api-keys"] });
      setCurrentStep(2);
      toast({
        title: isAr ? "تم إنشاء المفتاح" : "API Key Created",
        description: isAr
          ? "احفظ المفتاح الآن، فلن يظهر مرة أخرى."
          : "Save the key now; it will not be shown again.",
      });
    },
    onError: () => {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: isAr ? "فشل في إنشاء المفتاح" : "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/mcp/api-keys/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp/api-keys"] });
      setDeleteId(null);
      toast({
        title: isAr ? "تم الحذف" : "Deleted",
        description: isAr ? "تم حذف المفتاح بنجاح" : "API key deleted",
      });
    },
    onError: () => {
      toast({
        title: isAr ? "تعذر الحذف" : "Delete failed",
        description: isAr ? "تحقق من صلاحياتك وحاول مرة أخرى" : "Check your access and try again",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/mcp/api-keys/${id}/toggle`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp/api-keys"] });
    },
  });

  const voiceMutation = useMutation({
    mutationFn: async ({
      id,
      voiceAccess,
      bypass,
    }: {
      id: number;
      voiceAccess: boolean;
      bypass: boolean;
    }) => {
      await apiRequest(`/api/mcp/api-keys/${id}/voice-access`, {
        method: "PATCH",
        body: JSON.stringify({
          voice_access: voiceAccess,
          voice_allowlist_bypass: voiceAccess && bypass,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp/api-keys"] });
      toast({
        title: isAr ? "تم تحديث الصلاحيات" : "Access updated",
        description: isAr ? "تم حفظ إعدادات Twilio للمفتاح" : "Twilio key settings saved",
      });
    },
    onError: () => {
      toast({
        title: isAr ? "تعذر تحديث الصلاحيات" : "Access update failed",
        description: isAr ? "تحقق من الصلاحيات وحاول مرة أخرى" : "Check your access and try again",
        variant: "destructive",
      });
    },
  });

  const mcpUrl = `${window.location.origin}/mcp`;
  const filteredTools = useMemo(() => {
    const search = toolSearch.trim().toLowerCase();
    return MCP_TOOLS.filter((tool) => {
      const matchesFilter = toolFilter === "all" || tool.kind === toolFilter;
      const matchesSearch =
        !search ||
        tool.name.toLowerCase().includes(search) ||
        tool.description.toLowerCase().includes(search) ||
        tool.descriptionEn.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [toolFilter, toolSearch]);

  const toolsByGroup = useMemo(
    () =>
      (Object.keys(toolGroupLabels) as ToolGroup[])
        .map((group) => ({
          group,
          tools: filteredTools.filter((tool) => tool.group === group),
        }))
        .filter(({ tools }) => tools.length > 0),
    [filteredTools],
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: isAr ? "تم النسخ" : "Copied",
      description: isAr ? "تم نسخ النص إلى الحافظة" : "Copied to clipboard",
    });
  };

  const goToStep = (step: number) => {
    if (step === 1 || apiKeys.length > 0 || generatedKey) setCurrentStep(step);
  };

  const renderStepOne = () => (
    <div className="space-y-5">
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Key className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">
              {isAr ? "أنشئ مفتاحاً مخصصاً لهذا الاتصال" : "Create a key for this connection"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAr
                ? "المفتاح يحدد هوية اتصال ChatGPT ويمكن تعطيله أو حذفه في أي وقت."
                : "The key identifies the ChatGPT connection and can be disabled or deleted at any time."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Input
          placeholder={isAr ? "اسم المفتاح (مثال: ChatGPT الرئيسي)" : "Key name (e.g. Main ChatGPT)"}
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newKeyName.trim()) createMutation.mutate();
          }}
          aria-label={isAr ? "اسم مفتاح MCP" : "MCP key name"}
        />
        <Button
          onClick={() => createMutation.mutate()}
          disabled={!newKeyName.trim() || createMutation.isPending}
        >
          <Plus className="me-1 h-4 w-4" />
          {createMutation.isPending
            ? isAr
              ? "جاري الإنشاء..."
              : "Creating..."
            : isAr
              ? "إنشاء مفتاح"
              : "Create key"}
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <h4 className="font-medium">{isAr ? "صلاحيات اختيارية" : "Optional access"}</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr
              ? "فعّلها فقط إذا كان هذا الاتصال يحتاج إلى أدوات المكالمات الصوتية."
              : "Enable these only when this connection needs voice tools."}
          </p>
        </div>
        <label className="flex items-center justify-between gap-4 rounded-md bg-muted/40 p-3">
          <span className="text-sm">
            {isAr ? "السماح بأدوات Twilio الصوتية" : "Allow Twilio voice tools"}
          </span>
          <Switch
            checked={enableVoiceOnCreate}
            onCheckedChange={(checked) => {
              setEnableVoiceOnCreate(checked);
              if (!checked) setBypassOnCreate(false);
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-4 rounded-md bg-muted/40 p-3">
          <span className="text-sm">
            {isAr ? "تجاوز قائمة الأرقام المسموحة" : "Bypass allowed-number list"}
          </span>
          <Switch
            checked={bypassOnCreate}
            disabled={!enableVoiceOnCreate}
            onCheckedChange={setBypassOnCreate}
          />
        </label>
        {bypassOnCreate && (
          <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {isAr
              ? "تجاوز القائمة يتطلب صلاحية الإدارة، ولا يلغي شرط الصلاحيات الخاصة بـ Twilio."
              : "Bypass requires management access and does not bypass Twilio permissions."}
          </p>
        )}
      </div>

      {generatedKey && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
          <div className="mb-2 flex items-center gap-2 font-semibold text-green-800 dark:text-green-200">
            <CheckCircle2 className="h-5 w-5" />
            {isAr ? "تم إنشاء المفتاح — انسخه الآن" : "Key created — copy it now"}
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-green-100 p-2 text-xs text-green-900 dark:bg-green-900 dark:text-green-100">
              {generatedKey}
            </code>
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(generatedKey)}
              aria-label={isAr ? "نسخ المفتاح" : "Copy key"}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-green-700 dark:text-green-300">
            {isAr ? "لن يظهر هذا المفتاح مرة أخرى." : "This key will not be shown again."}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-dashed p-4 text-sm">
        <span className="text-muted-foreground">
          {isAr ? "لديك مفاتيح موجودة؟ انتقل إلى إدارة المفاتيح." : "Already have keys? Go to key management."}
        </span>
        <Button variant="outline" size="sm" onClick={() => setCurrentStep(4)}>
          {isAr ? "إدارة المفاتيح" : "Manage keys"}
          {isAr ? <ArrowLeft className="ms-1 h-4 w-4" /> : <ArrowRight className="ms-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <div className="flex items-start gap-3">
          <ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              {isAr ? "أضف الخادم إلى ChatGPT" : "Add the server to ChatGPT"}
            </h3>
            <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-200/80">
              {isAr
                ? "استخدم الرابط التالي عند إنشاء اتصال MCP جديد."
                : "Use this URL when creating a new MCP connection."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-background p-3 dark:border-blue-800">
          <code className="flex-1 break-all text-xs">{mcpUrl}</code>
          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(mcpUrl)} aria-label={isAr ? "نسخ الرابط" : "Copy URL"}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ol className="space-y-4">
        {[
          isAr ? "افتح ChatGPT وانتقل إلى Settings ثم Connected Apps أو MCP." : "Open ChatGPT and go to Settings, then Connected Apps or MCP.",
          isAr ? 'اضغط Add Connection وأدخل رابط خادم MCP أعلاه.' : "Click Add Connection and enter the MCP server URL above.",
          isAr ? "عند ظهور المصادقة، أدخل مفتاح API الذي أنشأته في الخطوة السابقة." : "When prompted, enter the API key created in the previous step.",
          isAr ? "وافق على الاتصال وانتظر حتى ينتهي ChatGPT من اكتشاف الأدوات." : "Approve the connection and wait for ChatGPT to discover the tools.",
        ].map((text, index) => (
          <li key={text} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {index + 1}
            </span>
            <span className="pt-1 text-sm">{text}</span>
          </li>
        ))}
      </ol>

      <div className="rounded-lg border p-4">
        <h4 className="flex items-center gap-2 font-medium">
          <LockKeyhole className="h-4 w-4 text-primary" />
          {isAr ? "طريقة المصادقة" : "Authentication"}
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAr
            ? "يستخدم الاتصال OAuth 2.1. إذا طلب ChatGPT تسجيل الدخول، أدخل مفتاح MCP في صفحة المصادقة الآمنة، ولا تضع المفتاح داخل رسالة عادية."
            : "The connection uses OAuth 2.1. If ChatGPT asks you to sign in, enter the MCP key on the secure authorization page instead of a regular chat message."}
        </p>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: isAr ? "الإجمالي" : "Total", value: MCP_TOOLS.length, className: "text-primary" },
          { label: isAr ? "قراءة" : "Read", value: MCP_TOOLS.filter((tool) => tool.kind === "read").length, className: "text-blue-600" },
          { label: isAr ? "تعديل" : "Write", value: MCP_TOOLS.filter((tool) => tool.kind === "write").length, className: "text-amber-600" },
          { label: "Twilio", value: MCP_TOOLS.filter((tool) => tool.kind === "twilio").length, className: "text-violet-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-3">
            <div className={`text-2xl font-bold ${stat.className}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={isAr ? "ابحث باسم الأداة أو وصفها..." : "Search by tool name or description..."}
            value={toolSearch}
            onChange={(e) => setToolSearch(e.target.value)}
            aria-label={isAr ? "بحث الأدوات" : "Search tools"}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "read", "write", "twilio"] as const).map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={toolFilter === filter ? "default" : "outline"}
              onClick={() => setToolFilter(filter)}
            >
              {filter === "all"
                ? isAr
                  ? "الكل"
                  : "All"
                : filter === "read"
                  ? isAr
                    ? "قراءة"
                    : "Read"
                  : filter === "write"
                    ? isAr
                      ? "تعديل"
                      : "Write"
                    : "Twilio"}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {toolsByGroup.map(({ group, tools }) => (
          <div key={group} className="rounded-lg border">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                {group === "twilio" ? <PhoneCall className="h-4 w-4" /> : group === "discovery" ? <Search className="h-4 w-4" /> : group === "factory-write" ? <Wrench className="h-4 w-4" /> : <Database className="h-4 w-4" />}
                {isAr ? toolGroupLabels[group].ar : toolGroupLabels[group].en}
              </h3>
              <Badge variant="secondary">{tools.length}</Badge>
            </div>
            <div className="divide-y">
              {tools.map((tool) => {
                const expanded = expandedTool === tool.name;
                return (
                  <div key={tool.name}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/30"
                      onClick={() => setExpandedTool(expanded ? null : tool.name)}
                      aria-expanded={expanded}
                    >
                      <code className="min-w-0 flex-1 truncate text-xs font-semibold text-primary">{tool.name}</code>
                      <ToolBadge kind={tool.kind} isAr={isAr} />
                      {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {expanded && (
                      <div className="border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                        {isAr ? tool.description : tool.descriptionEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filteredTools.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {isAr ? "لم يتم العثور على أدوات مطابقة." : "No matching tools found."}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div className="text-sm">
            <p className="font-semibold text-green-800 dark:text-green-200">
              {isAr ? "اختبار سريع بعد الربط" : "Quick check after connecting"}
            </p>
            <p className="mt-1 text-green-700 dark:text-green-300">
              {isAr
                ? 'اطلب من ChatGPT: «اعرض لي الأدوات المتاحة» ثم جرّب سؤالاً للقراءة مثل «ما حالة الإنتاج؟».'
                : 'Ask ChatGPT: “Show me the available tools”, then try a read question such as “What is the production status?”'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKey = (key: ApiKey) => (
    <div key={key.id} className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{key.name}</span>
            <Badge variant={key.is_active ? "default" : "secondary"}>
              {key.is_active ? (isAr ? "نشط" : "Active") : isAr ? "معطل" : "Inactive"}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono">{key.key_prefix}...</span>
            <span>
              {isAr ? "أُنشئ: " : "Created: "}
              {new Date(key.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
            </span>
            {key.last_used_at && (
              <span className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {isAr ? "آخر استخدام: " : "Last used: "}
                {new Date(key.last_used_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toggleMutation.mutate(key.id)}
            title={key.is_active ? (isAr ? "تعطيل" : "Disable") : isAr ? "تفعيل" : "Enable"}
            aria-label={key.is_active ? (isAr ? "تعطيل المفتاح" : "Disable key") : isAr ? "تفعيل المفتاح" : "Enable key"}
          >
            {key.is_active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(key.id)}
            aria-label={isAr ? "حذف المفتاح" : "Delete key"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex items-center justify-between gap-3 rounded-md bg-muted/40 p-2.5 text-xs">
          <span>{isAr ? "أدوات Twilio الصوتية" : "Twilio voice tools"}</span>
          <Switch
            checked={key.voice_access}
            onCheckedChange={(checked) =>
              voiceMutation.mutate({
                id: key.id,
                voiceAccess: checked,
                bypass: checked && key.voice_allowlist_bypass,
              })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-md bg-muted/40 p-2.5 text-xs">
          <span>{isAr ? "تجاوز قائمة الأرقام" : "Allowlist bypass"}</span>
          <Switch
            checked={key.voice_allowlist_bypass}
            disabled={!key.voice_access}
            onCheckedChange={(checked) =>
              voiceMutation.mutate({
                id: key.id,
                voiceAccess: key.voice_access,
                bypass: checked,
              })
            }
          />
        </label>
      </div>
    </div>
  );

  const renderStepFour = () => (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <ShieldCheck className="mb-2 h-5 w-5 text-green-600" />
          <h3 className="font-medium">{isAr ? "صلاحيات المصنع" : "Factory access"}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "أدوات القراءة والإنشاء والتعديل متاحة عبر اتصال MCP النشط." : "Read and write tools are available through an active MCP connection."}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <PhoneCall className="mb-2 h-5 w-5 text-violet-600" />
          <h3 className="font-medium">{isAr ? "صلاحيات Twilio" : "Twilio access"}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "تحتاج أدوات الصوت إلى صلاحية Twilio وقائمة أرقام مسموحة." : "Voice tools require Twilio permission and an allowed-number list."}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <LockKeyhole className="mb-2 h-5 w-5 text-blue-600" />
          <h3 className="font-medium">{isAr ? "أمان المفتاح" : "Key security"}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "لا تخزن المفتاح في المحادثات، وعطّله فوراً عند الاشتباه بتسريبه." : "Never store keys in chats; disable one immediately if exposed."}
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <Key className="h-4 w-4" />
            {isAr ? "إدارة مفاتيح MCP" : "MCP key management"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "التغيير هنا يؤثر مباشرة على الاتصالات التي تستخدم المفتاح." : "Changes here immediately affect connections using the key."}
          </p>
        </div>
        <div className="space-y-3 p-4">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">{isAr ? "جاري التحميل..." : "Loading..."}</div>
          ) : apiKeys.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {isAr ? "لا توجد مفاتيح بعد. ابدأ من الخطوة الأولى." : "No keys yet. Start from step one."}
            </div>
          ) : (
            apiKeys.map(renderKey)
          )}
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <h3 className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
          <CircleHelp className="h-5 w-5" />
          {isAr ? "حل المشاكل" : "Troubleshooting"}
        </h3>
        <div className="mt-3 space-y-3 text-sm text-amber-900 dark:text-amber-100">
          <div>
            <strong>{isAr ? "لا تظهر الأدوات؟" : "Tools do not appear?"}</strong>
            <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
              {isAr
                ? "حدّث اتصال MCP في ChatGPT، تأكد من أن الرابط ينتهي بـ /mcp وأن المفتاح نشط، ثم أعد طلب اكتشاف الأدوات."
                : "Refresh the MCP connection in ChatGPT, verify the URL ends with /mcp and the key is active, then request tool discovery again."}
            </p>
          </div>
          <div>
            <strong>{isAr ? "المصادقة ترفض المفتاح؟" : "Authentication rejects the key?"}</strong>
            <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
              {isAr
                ? "أنشئ مفتاحاً جديداً وانسخه كاملاً. المفتاح القديم قد يكون معطلاً أو محذوفاً."
                : "Create a new key and copy it in full. The old key may be disabled or deleted."}
            </p>
          </div>
          <div>
            <strong>{isAr ? "أداة Twilio لا تعمل؟" : "A Twilio tool is denied?"}</strong>
            <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
              {isAr
                ? "تحقق من صلاحيات مالك المفتاح: use_twilio_voice أو manage_twilio_voice أو admin، ومن إعدادات الوصول في بطاقة المفتاح."
                : "Check the key owner's permission: use_twilio_voice, manage_twilio_voice, or admin, plus the access toggles on the key card."}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setCurrentStep(2)}>
          <RefreshCw className="me-1 h-4 w-4" />
          {isAr ? "مراجعة خطوات الربط" : "Review connection steps"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div dir={isAr ? "rtl" : "ltr"} className={embedded ? "space-y-6" : "mx-auto max-w-5xl space-y-6 p-4"}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-l from-primary/10 via-background to-background">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary p-3 text-primary-foreground">
                <Plug className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{isAr ? "ربط MODERN مع ChatGPT" : "Connect MODERN with ChatGPT"}</CardTitle>
                <CardDescription className="mt-1 max-w-2xl">
                  {isAr
                    ? "معالج ربط آمن لإعداد MCP، مراجعة الصلاحيات، واستكشاف جميع الأدوات المتاحة."
                    : "A guided setup for MCP, access review, and all available tools."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {steps.map((step) => {
                const complete = currentStep > step.number;
                const active = currentStep === step.number;
                return (
                  <button
                    type="button"
                    key={step.number}
                    onClick={() => goToStep(step.number)}
                    className={`flex items-center gap-2 rounded-lg p-2 text-start transition-colors ${
                      active ? "bg-primary/10" : "hover:bg-muted/50"
                    }`}
                  >
                    <StepIcon number={step.number} active={active} complete={complete} />
                    <span className={`text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {isAr ? step.title : step.titleEn}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {isAr ? `الخطوة ${currentStep} من ${steps.length}` : `Step ${currentStep} of ${steps.length}`}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {isAr ? steps[currentStep - 1].title : steps[currentStep - 1].titleEn}
                </h2>
              </div>
              <Badge variant="outline">{MCP_TOOLS.length} {isAr ? "أداة مسجلة" : "registered tools"}</Badge>
            </div>

            {currentStep === 1 && renderStepOne()}
            {currentStep === 2 && renderStepTwo()}
            {currentStep === 3 && renderStepThree()}
            {currentStep === 4 && renderStepFour()}

            <div className="mt-8 flex items-center justify-between border-t pt-5">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                disabled={currentStep === 1}
              >
                {isAr ? <ArrowRight className="me-1 h-4 w-4" /> : <ArrowLeft className="me-1 h-4 w-4" />}
                {isAr ? "السابق" : "Back"}
              </Button>
              <Button
                onClick={() => setCurrentStep((step) => Math.min(4, step + 1))}
                disabled={currentStep === 4}
              >
                {isAr ? "التالي" : "Next"}
                {isAr ? <ArrowLeft className="ms-1 h-4 w-4" /> : <ArrowRight className="ms-1 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir={isAr ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? "حذف مفتاح MCP؟" : "Delete MCP key?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? "سيتوقف أي اتصال يستخدم هذا المفتاح عن العمل فوراً. لا يمكن التراجع عن الحذف."
                : "Any connection using this key will stop working immediately. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId !== null) deleteMutation.mutate(deleteId);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="me-1 h-4 w-4" />
              {isAr ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}