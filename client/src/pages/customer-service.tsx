import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import PageLayout from "../components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { SearchableSelect } from "../components/ui/searchable-select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { userHasPermission, isUserAdmin } from "../utils/roleUtils";
import {
  LayoutDashboard, Ticket, BookOpen, BarChart3, Plus, Search, Printer,
  ChevronRight, ChevronLeft, MessageSquare, History, Send, Pencil, Trash2,
  RefreshCw, User as UserIcon, Building2, Clock, AlertCircle, CheckCircle2,
  Loader2, Eye, EyeOff, CalendarClock,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface UserOption {
  id: number;
  username?: string;
  display_name?: string | null;
  display_name_ar?: string | null;
  full_name?: string | null;
}

interface CustomerOption {
  id: string | number;
  name?: string | null;
  name_ar?: string | null;
}

interface ServiceCase {
  id: number;
  reference?: string | null;
  title: string;
  type?: string | null;
  description?: string | null;
  status: string;
  priority: string;
  requester_id?: number | null;
  requester_name?: string | null;
  customer_id?: string | number | null;
  customer_name?: string | null;
  assignee_id?: number | null;
  assignee_name?: string | null;
  due_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  resolved_at?: string | null;
}

interface CaseComment {
  id: number;
  case_id?: number;
  body: string;
  author_id?: number | null;
  author_name?: string | null;
  is_internal?: boolean;
  created_at?: string | null;
}

interface CaseActivity {
  id: number;
  case_id?: number;
  action: string;
  details?: unknown;
  actor_id?: number | null;
  actor_name?: string | null;
  created_at?: string | null;
}

interface CaseDetail {
  case: ServiceCase;
  comments: CaseComment[];
  activity: CaseActivity[];
}

interface KnowledgeArticle {
  id: number;
  title: string;
  category?: string | null;
  content?: string | null;
  tags?: string[] | null;
  is_published?: boolean;
  created_by?: number | null;
  created_by_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DashboardData {
  totals?: {
    total?: number;
    open?: number;
    in_progress?: number;
    waiting?: number;
    resolved?: number;
    closed?: number;
    overdue?: number;
    unassigned?: number;
    my_assigned?: number;
  };
  by_status?: Array<{ status: string; count: number }>;
  by_priority?: Array<{ priority: string; count: number }>;
  by_type?: Array<{ type: string; count: number }>;
  recent?: ServiceCase[];
}

interface CasesResponse {
  data: ServiceCase[];
  total: number;
  limit?: number;
  offset?: number;
}

interface ReportsResponse {
  data: ServiceCase[];
  total: number;
  totals?: {
    total?: number;
    open?: number;
    resolved?: number;
    closed?: number;
    avg_resolution_hours?: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "open",        label: "مفتوحة" },
  { value: "in_progress", label: "قيد المعالجة" },
  { value: "waiting",     label: "بانتظار العميل" },
  { value: "resolved",    label: "تم الحل" },
  { value: "closed",      label: "مغلقة" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "low",    label: "منخفضة" },
  { value: "normal", label: "عادية" },
  { value: "high",   label: "عالية" },
  { value: "urgent", label: "عاجلة" },
] as const;

const TYPE_OPTIONS = [
  { value: "request",   label: "طلب" },
  { value: "complaint", label: "شكوى" },
  { value: "note",      label: "ملاحظة" },
] as const;

// ============================================================================
// Pure helpers
// ============================================================================

function optLabel(
  opts: readonly { value: string; label: string }[],
  v?: string | null,
): string {
  return opts.find((o) => o.value === v)?.label || v || "-";
}

const statusLabel   = (v?: string | null) => optLabel(STATUS_OPTIONS, v);
const priorityLabel = (v?: string | null) => optLabel(PRIORITY_OPTIONS, v);
const typeLabel     = (v?: string | null) => optLabel(TYPE_OPTIONS, v);

function statusBadgeClass(s?: string | null): string {
  switch (s) {
    case "open":        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-0";
    case "in_progress": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-0";
    case "waiting":     return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border-0";
    case "resolved":    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-0";
    case "closed":      return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-0";
    default:            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-0";
  }
}

function priorityBadgeClass(p?: string | null): string {
  switch (p) {
    case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-0";
    case "high":   return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border-0";
    case "normal": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border-0";
    case "low":    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0";
    default:       return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-0";
  }
}

function fmtDate(d?: string | null): string {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" });
  } catch { return "-"; }
}

function fmtDateOnly(d?: string | null): string {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("ar-SA", { dateStyle: "short" });
  } catch { return "-"; }
}

function isOverdue(dueDate?: string | null, status?: string | null): boolean {
  if (!dueDate || status === "resolved" || status === "closed") return false;
  return new Date(dueDate) < new Date();
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function activityDetailsText(details: unknown): string {
  if (!details) return "";
  if (typeof details === "string") return details;
  if (typeof details !== "object") return String(details);

  const labels: Record<string, string> = {
    from: "من",
    to: "إلى",
    reference: "المرجع",
    type: "النوع",
    priority: "الأولوية",
    status: "الحالة",
    assignee_id: "المسؤول",
    customer_id: "العميل",
    due_date: "الاستحقاق",
    comment_id: "التعليق",
    is_internal: "داخلي",
  };

  const valueText = (key: string, value: unknown): string => {
    if (value == null || value === "") return "-";
    if (key === "status" && typeof value === "string") return statusLabel(value);
    if (key === "priority" && typeof value === "string") return priorityLabel(value);
    if (key === "type" && typeof value === "string") return typeLabel(value);
    if (key === "is_internal" && typeof value === "boolean") {
      return value ? "نعم" : "لا";
    }
    if (key === "due_date" && typeof value === "string") return fmtDateOnly(value);
    return String(value);
  };

  return Object.entries(details as Record<string, unknown>)
    .map(([key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        ("from" in value || "to" in value)
      ) {
        const change = value as { from?: unknown; to?: unknown };
        return `${labels[key] || key}: من ${valueText(key, change.from)} إلى ${valueText(key, change.to)}`;
      }
      return `${labels[key] || key}: ${valueText(key, value)}`;
    })
    .join("، ");
}

function userDisplay(u?: UserOption | null): string {
  if (!u) return "-";
  return u.display_name_ar || u.display_name || u.full_name || u.username || "-";
}

function customerDisplay(c?: CustomerOption | null): string {
  if (!c) return "-";
  return c.name_ar || c.name || String(c.id);
}

async function jsonFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}) as any);
    throw new Error(err.message || err.error || `خطأ (${res.status})`);
  }
  return res.json();
}

// ============================================================================
// Shared micro-components
// ============================================================================

function OptionItems({ options }: { options: readonly { value: string; label: string }[] }) {
  return (
    <>
      {options.map((o) => (
        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
      ))}
    </>
  );
}

function Field({
  label, className = "", labelClassName = "text-xs", children,
}: {
  label: string; className?: string; labelClassName?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className={labelClassName}>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-10 text-center text-gray-500 space-y-3">
      <AlertCircle className="h-8 w-8 mx-auto text-gray-400" />
      <div>{message}</div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 ml-1" />
        إعادة المحاولة
      </Button>
    </div>
  );
}

function LoadingRows({ count = 6, className = "h-12 w-full" }: { count?: number; className?: string }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}

function CompactTotal({
  label, value, tone = "default",
}: {
  label: string; value?: number | string; tone?: "default" | "blue" | "green" | "gray" | "amber" | "red";
}) {
  const cls: Record<string, string> = {
    default: "text-gray-800 dark:text-gray-100",
    blue:    "text-blue-600 dark:text-blue-300",
    green:   "text-green-600 dark:text-green-300",
    gray:    "text-gray-500 dark:text-gray-400",
    amber:   "text-amber-600 dark:text-amber-300",
    red:     "text-red-600 dark:text-red-300",
  };
  return (
    <div className="rounded-lg border p-2.5 text-center">
      <div className={`text-xl font-bold ${cls[tone]}`}>{value ?? "-"}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

// Shared case table header
function CasesTableHead({ withType = true }: { withType?: boolean }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>المرجع</TableHead>
        <TableHead>العنوان</TableHead>
        <TableHead>العميل</TableHead>
        {withType && <TableHead>النوع</TableHead>}
        <TableHead>الحالة</TableHead>
        <TableHead>الأولوية</TableHead>
        <TableHead>المُسند إليه</TableHead>
        <TableHead>الاستحقاق</TableHead>
        <TableHead>التاريخ</TableHead>
      </TableRow>
    </TableHeader>
  );
}

// Shared case table row cells
function CaseCells({ c, withType = true }: { c: ServiceCase; withType?: boolean }) {
  const overdue = isOverdue(c.due_date, c.status);
  return (
    <>
      <TableCell className="whitespace-nowrap font-mono text-xs">
        {c.reference || `#${c.id}`}
      </TableCell>
      <TableCell className="max-w-[200px] truncate font-medium">{c.title}</TableCell>
      <TableCell className="whitespace-nowrap text-sm">{c.customer_name || "-"}</TableCell>
      {withType && (
        <TableCell className="whitespace-nowrap text-sm">
          <Badge variant="outline" className="border-0 bg-gray-100 dark:bg-gray-800 text-xs">
            {typeLabel(c.type)}
          </Badge>
        </TableCell>
      )}
      <TableCell>
        <Badge className={statusBadgeClass(c.status)}>{statusLabel(c.status)}</Badge>
      </TableCell>
      <TableCell>
        <Badge className={priorityBadgeClass(c.priority)}>{priorityLabel(c.priority)}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm">{c.assignee_name || "غير مُسندة"}</TableCell>
      <TableCell className="whitespace-nowrap text-xs">
        {c.due_date ? (
          <span className={overdue ? "text-red-600 font-medium" : "text-gray-500"}>
            {overdue && <AlertCircle className="h-3 w-3 inline ml-1" />}
            {fmtDateOnly(c.due_date)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-gray-500">{fmtDate(c.created_at)}</TableCell>
    </>
  );
}

function BreakdownCard({
  title, rows,
}: {
  title: string;
  rows: Array<{ key: string; count: number; label: string; badgeClass?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="py-4 text-center text-gray-500 text-sm">لا توجد بيانات</div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.key} className="flex items-center justify-between">
                {r.badgeClass ? (
                  <Badge className={r.badgeClass}>{r.label}</Badge>
                ) : (
                  <span className="text-sm">{r.label}</span>
                )}
                <span className="font-medium">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Page root
// ============================================================================

export default function CustomerServicePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const perms = user?.permissions ?? [];
  const isAdmin = isUserAdmin(user);
  const hasAny = (keys: string[]) => isAdmin || keys.some((k) => perms.includes(k));

  // service_manage = managers who can PATCH cases
  const canManageCases = hasAny(["service_manage", "manage_users", "manage_hr", "admin"]);
  // service_create or any manager = can open new case
  const canCreateCase  = hasAny(["service_create", "service_manage", "manage_users", "manage_hr", "admin"]);
  // reports viewers
  const canViewReports = hasAny([
    "service_view_reports",
    "service_manage",
    "manage_users",
    "manage_hr",
    "admin",
  ]);

  const { data: usersRaw } = useQuery<any>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const result = await jsonFetch<any>("/api/users");
      const d = result?.data ?? result;
      return Array.isArray(d) ? d : [];
    },
  });
  const users: UserOption[] = Array.isArray(usersRaw) ? usersRaw : [];

  const { data: customersRaw } = useQuery<any>({
    queryKey: ["/api/customers", { all: true }],
    queryFn: async () => {
      const result = await jsonFetch<any>("/api/customers?all=true");
      const d = result?.data ?? result;
      return Array.isArray(d) ? d : [];
    },
  });
  const customers: CustomerOption[] = Array.isArray(customersRaw) ? customersRaw : [];

  const customerOptions = useMemo(
    () => customers.map((c) => ({ value: String(c.id), label: customerDisplay(c) })),
    [customers],
  );
  const userOptions = useMemo(
    () => users.map((u) => ({ value: String(u.id), label: userDisplay(u) })),
    [users],
  );

  return (
    <PageLayout title="مركز خدمة العملاء" description="متابعة الحالات، قاعدة المعرفة، والتقارير">
      <Tabs defaultValue="dashboard" dir="rtl" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto" data-testid="tabs-customer-service">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <LayoutDashboard className="h-4 w-4 ml-1.5" />لوحة المعلومات
          </TabsTrigger>
          <TabsTrigger value="cases" data-testid="tab-cases">
            <Ticket className="h-4 w-4 ml-1.5" />الحالات
          </TabsTrigger>
          {canViewReports && (
            <TabsTrigger value="reports" data-testid="tab-reports">
              <BarChart3 className="h-4 w-4 ml-1.5" />التقارير
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="cases">
          <CasesTab
            userOptions={userOptions}
            customerOptions={customerOptions}
            canManageCases={canManageCases}
            canCreateCase={canCreateCase}
            queryClient={queryClient}
            toast={toast}
          />
        </TabsContent>
        {canViewReports && (
          <TabsContent value="reports">
            <ReportsTab customerOptions={customerOptions} userOptions={userOptions} />
          </TabsContent>
        )}
      </Tabs>
    </PageLayout>
  );
}

// ============================================================================
// Dashboard tab
// ============================================================================

function StatCard({
  label, value, icon, tone = "default",
}: {
  label: string; value: number | string; icon: React.ReactNode;
  tone?: "default" | "blue" | "amber" | "green" | "red" | "gray" | "indigo";
}) {
  const cls: Record<string, string> = {
    default: "text-gray-700 dark:text-gray-200",
    blue:    "text-blue-600 dark:text-blue-300",
    amber:   "text-amber-600 dark:text-amber-300",
    green:   "text-green-600 dark:text-green-300",
    red:     "text-red-600 dark:text-red-300",
    gray:    "text-gray-500 dark:text-gray-400",
    indigo:  "text-indigo-600 dark:text-indigo-300",
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`shrink-0 ${cls[tone]}`}>{icon}</div>
        <div className="min-w-0">
          <div className={`text-2xl font-bold ${cls[tone]}`}>{value}</div>
          <div className="text-xs text-gray-500 truncate">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardTab() {
  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/customer-service/dashboard"],
    queryFn: () => jsonFetch<DashboardData>("/api/customer-service/dashboard"),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }
  if (isError || !data) {
    return (
      <Card><CardContent>
        <ErrorState message="تعذر تحميل لوحة المعلومات" onRetry={() => refetch()} />
      </CardContent></Card>
    );
  }

  const t = data.totals || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(
          [
            ["إجمالي الحالات",  t.total,       "default", Ticket],
            ["مفتوحة",          t.open,        "blue",    AlertCircle],
            ["قيد المعالجة",    t.in_progress, "amber",   Clock],
            ["بانتظار العميل",  t.waiting,     "indigo",  Clock],
            ["تم الحل",         t.resolved,    "green",   CheckCircle2],
            ["مغلقة",           t.closed,      "gray",    CheckCircle2],
            ["متأخرة",          t.overdue,     "red",     AlertCircle],
            ["غير مُسندة",     t.unassigned,  "amber",   UserIcon],
            ["مُسندة إليّ",    t.my_assigned, "indigo",  UserIcon],
          ] as const
        ).map(([label, value, tone, Icon]) => (
          <StatCard key={label} label={label} value={value ?? 0} tone={tone}
            icon={<Icon className="h-6 w-6" />} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BreakdownCard
          title="حسب الحالة"
          rows={(data.by_status || []).map((r) => ({
            key: r.status, count: r.count,
            label: statusLabel(r.status), badgeClass: statusBadgeClass(r.status),
          }))}
        />
        <BreakdownCard
          title="حسب الأولوية"
          rows={(data.by_priority || []).map((r) => ({
            key: r.priority, count: r.count,
            label: priorityLabel(r.priority), badgeClass: priorityBadgeClass(r.priority),
          }))}
        />
        <BreakdownCard
          title="حسب النوع"
          rows={(data.by_type || []).map((r) => ({
            key: r.type, count: r.count, label: typeLabel(r.type),
          }))}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />أحدث الحالات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(data.recent?.length ?? 0) === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">لا توجد حالات حديثة</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <CasesTableHead />
                <TableBody>
                  {data.recent!.map((c) => (
                    <TableRow key={c.id}><CaseCells c={c} /></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Cases tab
// ============================================================================

function CasesTab({
  userOptions, customerOptions, canManageCases, canCreateCase, queryClient, toast,
}: {
  userOptions: { value: string; label: string }[];
  customerOptions: { value: string; label: string }[];
  canManageCases: boolean;
  canCreateCase: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("all");
  const [priorityFilter, setPriority] = useState("all");
  const [typeFilter, setType]         = useState("all");
  const [mineOnly, setMineOnly]       = useState(false);
  const [page, setPage]               = useState(0);
  const [createOpen, setCreateOpen]   = useState(false);
  const [detailId, setDetailId]       = useState<number | null>(null);

  const qk = ["/api/customer-service/cases",
    { search, status: statusFilter, priority: priorityFilter, type: typeFilter, mine: mineOnly, page }];

  const { data, isLoading, isError, refetch } = useQuery<CasesResponse>({
    queryKey: qk,
    queryFn: () => {
      const p = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
      if (search) p.set("search", search);
      if (statusFilter !== "all") p.set("status", statusFilter);
      if (priorityFilter !== "all") p.set("priority", priorityFilter);
      if (typeFilter !== "all") p.set("type", typeFilter);
      if (mineOnly) p.set("mine", "true");
      return jsonFetch<CasesResponse>(`/api/customer-service/cases?${p}`);
    },
  });

  const cases = data?.data ?? [];
  const total = data?.total ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/customer-service/cases"] });
    queryClient.invalidateQueries({ queryKey: ["/api/customer-service/dashboard"] });
  };

  const reset = () => {
    setSearchInput(""); setSearch(""); setStatus("all");
    setPriority("all"); setType("all"); setMineOnly(false); setPage(0);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-5 w-5" />الحالات
            <span className="text-sm font-normal text-gray-500">({total})</span>
          </CardTitle>
          {canCreateCase && (
            <Button onClick={() => setCreateOpen(true)} data-testid="button-new-case">
              <Plus className="h-4 w-4 ml-1" />حالة جديدة
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search + filters */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <form
              className="flex-1 flex gap-2"
              onSubmit={(e) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); }}
            >
              <div className="relative flex-1">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pr-8" placeholder="بحث في المرجع/العنوان..."
                  value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  data-testid="input-case-search" />
              </div>
              <Button type="submit" variant="secondary">بحث</Button>
            </form>
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={statusFilter} onValueChange={(v) => { setPage(0); setStatus(v); }}>
                <SelectTrigger className="w-36" data-testid="select-filter-status">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <OptionItems options={STATUS_OPTIONS} />
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => { setPage(0); setPriority(v); }}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأولويات</SelectItem>
                  <OptionItems options={PRIORITY_OPTIONS} />
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => { setPage(0); setType(v); }}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  <OptionItems options={TYPE_OPTIONS} />
                </SelectContent>
              </Select>
              <Button
                variant={mineOnly ? "default" : "outline"}
                size="sm"
                onClick={() => { setPage(0); setMineOnly((v) => !v); }}
                data-testid="button-mine-only"
              >
                <UserIcon className="h-3.5 w-3.5 ml-1" />
                مهامي فقط
              </Button>
              <Button variant="ghost" size="icon" onClick={reset} title="إعادة تعيين">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <LoadingRows count={6} />
          ) : isError ? (
            <ErrorState message="تعذر تحميل الحالات" onRetry={() => refetch()} />
          ) : cases.length === 0 ? (
            <div className="py-10 text-center text-gray-500">لا توجد حالات مطابقة</div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <CasesTableHead />
                <TableBody>
                  {cases.map((c) => (
                    <TableRow key={c.id}
                      className="cursor-pointer hover:bg-blue-50/60 dark:hover:bg-gray-800/60"
                      onClick={() => setDetailId(c.id)}
                      data-testid={`row-case-${c.id}`}>
                      <CaseCells c={c} />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                عرض {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} من {total}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  data-testid="button-case-prev">
                  <ChevronRight className="h-4 w-4" />السابق
                </Button>
                <Button size="sm" variant="outline" disabled={(page + 1) * PAGE_SIZE >= total}
                  onClick={() => setPage((p) => p + 1)}
                  data-testid="button-case-next">
                  التالي<ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateCaseDialog
        open={createOpen} onOpenChange={setCreateOpen}
        customerOptions={customerOptions} userOptions={userOptions}
        canAssign={canManageCases}
        onCreated={() => { invalidate(); setCreateOpen(false); }}
        toast={toast}
      />
      <CaseDetailDialog
        caseId={detailId} onClose={() => setDetailId(null)}
        userOptions={userOptions} customerOptions={customerOptions}
        canManageCases={canManageCases}
        onChanged={invalidate} toast={toast} queryClient={queryClient}
      />
    </div>
  );
}

// ============================================================================
// Create case dialog
// ============================================================================

function CreateCaseDialog({
  open, onOpenChange, customerOptions, userOptions, canAssign, onCreated, toast,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  customerOptions: { value: string; label: string }[];
  userOptions: { value: string; label: string }[];
  canAssign: boolean;
  onCreated: () => void;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const empty = {
    title: "", description: "", customer_id: "", priority: "normal",
    type: "request", assignee_id: "", due_date: "",
  };
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const createMutation = useMutation({
    mutationFn: (payload: any) =>
      jsonFetch("/api/customer-service/cases", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => { toast({ title: "تم إنشاء الحالة" }); setForm(empty); onCreated(); },
    onError: (e: any) => toast({ title: e?.message || "تعذر إنشاء الحالة", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setForm(empty); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>حالة جديدة</DialogTitle>
          <DialogDescription>سجّل حالة خدمة عملاء جديدة</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="العنوان *" labelClassName="">
            <Input value={form.title} onChange={(e) => set("title")(e.target.value)}
              placeholder="عنوان الحالة" data-testid="input-case-subject" />
          </Field>
          <Field label="العميل" labelClassName="">
            <SearchableSelect options={customerOptions} value={form.customer_id}
              onValueChange={set("customer_id")} placeholder="اختر العميل"
              searchPlaceholder="ابحث عن عميل..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="النوع" labelClassName="">
              <Select value={form.type} onValueChange={set("type")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><OptionItems options={TYPE_OPTIONS} /></SelectContent>
              </Select>
            </Field>
            <Field label="الأولوية" labelClassName="">
              <Select value={form.priority} onValueChange={set("priority")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><OptionItems options={PRIORITY_OPTIONS} /></SelectContent>
              </Select>
            </Field>
          </div>
          {canAssign && (
            <Field label="إسناد إلى" labelClassName="">
              <SearchableSelect options={userOptions} value={form.assignee_id}
                onValueChange={set("assignee_id")} placeholder="اختر الموظف (اختياري)"
                searchPlaceholder="ابحث عن موظف..." />
            </Field>
          )}
          <Field label="تاريخ الاستحقاق" labelClassName="">
            <Input type="date" value={form.due_date} onChange={(e) => set("due_date")(e.target.value)}
              className="w-auto" data-testid="input-case-due-date" />
          </Field>
          <Field label="الوصف" labelClassName="">
            <Textarea className="min-h-28" value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="تفاصيل الحالة..." data-testid="input-case-description" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button
            disabled={createMutation.isPending}
            data-testid="button-create-case-submit"
            onClick={() => {
              if (!form.title.trim()) {
                toast({ title: "اكتب عنوان الحالة", variant: "destructive" }); return;
              }
              createMutation.mutate({
                title: form.title.trim(),
                description: form.description.trim() || null,
                customer_id: form.customer_id || null,
                priority: form.priority,
                type: form.type,
                assignee_id: canAssign && form.assignee_id ? Number(form.assignee_id) : null,
                due_date: form.due_date || null,
              });
            }}
          >
            {createMutation.isPending
              ? <><Loader2 className="h-4 w-4 ml-1 animate-spin" />جارٍ الحفظ...</>
              : <><Plus className="h-4 w-4 ml-1" />إنشاء</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Case detail dialog
// ============================================================================

function CaseDetailDialog({
  caseId, onClose, userOptions, customerOptions, canManageCases, onChanged, toast, queryClient,
}: {
  caseId: number | null; onClose: () => void;
  userOptions: { value: string; label: string }[];
  customerOptions: { value: string; label: string }[];
  canManageCases: boolean; onChanged: () => void;
  toast: ReturnType<typeof useToast>["toast"];
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const open = caseId !== null;
  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal]   = useState(false);
  const [editOpen, setEditOpen]       = useState(false);

  const detailKey = ["/api/customer-service/cases", caseId, "detail"];

  const { data, isLoading, isError, refetch } = useQuery<CaseDetail>({
    queryKey: detailKey,
    queryFn: () => jsonFetch<CaseDetail>(`/api/customer-service/cases/${caseId}`),
    enabled: open,
  });

  const invalidateDetail = () => {
    queryClient.invalidateQueries({ queryKey: detailKey });
    onChanged();
  };

  const patchMutation = useMutation({
    mutationFn: (payload: any) =>
      jsonFetch(`/api/customer-service/cases/${caseId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => { toast({ title: "تم تحديث الحالة" }); invalidateDetail(); },
    onError: (e: any) => toast({ title: e?.message || "تعذر تحديث الحالة", variant: "destructive" }),
  });

  const commentMutation = useMutation({
    mutationFn: (payload: { body: string; is_internal: boolean }) =>
      jsonFetch(`/api/customer-service/cases/${caseId}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => { setCommentText(""); setIsInternal(false); invalidateDetail(); },
    onError: (e: any) => toast({ title: e?.message || "تعذر إضافة التعليق", variant: "destructive" }),
  });

  const c = data?.case;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-case-detail">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {c ? c.title : "تفاصيل الحالة"}
          </DialogTitle>
          {c && (
            <DialogDescription className="font-mono">{c.reference || `#${c.id}`}</DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !c ? (
          <ErrorState message="تعذر تحميل تفاصيل الحالة" onRetry={() => refetch()} />
        ) : (
          <div className="space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusBadgeClass(c.status)}>{statusLabel(c.status)}</Badge>
              <Badge className={priorityBadgeClass(c.priority)}>{priorityLabel(c.priority)}</Badge>
              <Badge variant="outline">{typeLabel(c.type)}</Badge>
              {c.due_date && (
                <span className={`flex items-center gap-1 text-xs ${
                  isOverdue(c.due_date, c.status)
                    ? "text-red-600 font-semibold"
                    : "text-gray-500"
                }`}>
                  <CalendarClock className="h-3.5 w-3.5" />
                  استحقاق: {fmtDateOnly(c.due_date)}
                  {isOverdue(c.due_date, c.status) && " — متأخرة"}
                </span>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
              {(
                [
                  [Building2, "العميل",     c.customer_name || "-"],
                  [UserIcon,  "مقدّم الطلب", c.requester_name || "-"],
                  [UserIcon,  "المُسند إليه", c.assignee_name || "غير مُسندة"],
                  [Clock,     "أُنشئت",       fmtDate(c.created_at)],
                ] as const
              ).map(([Icon, label, value], i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">{label}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            {c.description && (
              <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/40">
                {c.description}
              </div>
            )}

            {/* Manager controls */}
            {canManageCases && (
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Pencil className="h-4 w-4" />إدارة سريعة
                  </div>
                  <Button size="sm" variant="outline"
                    onClick={() => setEditOpen(true)}
                    data-testid="button-edit-case">
                    <Pencil className="h-3.5 w-3.5 ml-1" />تعديل كامل
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="الحالة">
                    <Select value={c.status} onValueChange={(v) => patchMutation.mutate({ status: v })}>
                      <SelectTrigger data-testid="select-case-status"><SelectValue /></SelectTrigger>
                      <SelectContent><OptionItems options={STATUS_OPTIONS} /></SelectContent>
                    </Select>
                  </Field>
                  <Field label="الأولوية">
                    <Select value={c.priority} onValueChange={(v) => patchMutation.mutate({ priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><OptionItems options={PRIORITY_OPTIONS} /></SelectContent>
                    </Select>
                  </Field>
                  <Field label="إسناد إلى">
                    <SearchableSelect
                      options={[{ value: "", label: "غير مُسندة" }, ...userOptions]}
                      value={c.assignee_id ? String(c.assignee_id) : ""}
                      onValueChange={(v) =>
                        patchMutation.mutate({ assignee_id: v ? Number(v) : null })
                      }
                      placeholder="اختر الموظف" searchPlaceholder="ابحث..." />
                  </Field>
                  <Field label="تاريخ الاستحقاق">
                    <Input type="date"
                      defaultValue={c.due_date ? c.due_date.slice(0, 10) : ""}
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v !== (c.due_date ? c.due_date.slice(0, 10) : "")) {
                          patchMutation.mutate({ due_date: v || null });
                        }
                      }}
                      data-testid="input-detail-due-date" />
                  </Field>
                </div>
                {patchMutation.isPending && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />جارٍ الحفظ...
                  </div>
                )}
              </div>
            )}

            {/* Comments + Activity */}
            <Tabs defaultValue="comments" dir="rtl">
              <TabsList>
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 ml-1" />
                  التعليقات ({data?.comments.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <History className="h-4 w-4 ml-1" />
                  سجل النشاط ({data?.activity.length ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-3">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(data?.comments.length ?? 0) === 0 ? (
                    <div className="py-6 text-center text-gray-500 text-sm">لا توجد تعليقات بعد</div>
                  ) : (
                    data!.comments.map((cm, i) => (
                      <div key={cm.id ?? i}
                        className={`rounded-lg border p-2.5 ${
                          cm.is_internal
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                            : "bg-white dark:bg-gray-900"
                        }`}>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-200">
                            {cm.author_name || "-"}
                            {cm.is_internal && (
                              <Badge variant="outline" className="mr-2 text-xs border-amber-400 text-amber-700">
                                داخلي
                              </Badge>
                            )}
                          </span>
                          <span>{fmtDate(cm.created_at)}</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{cm.body}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Textarea className="min-h-16 flex-1" placeholder="أضف تعليقاً..."
                      value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      data-testid="input-case-comment" />
                    <Button className="self-end"
                      disabled={commentMutation.isPending || !commentText.trim()}
                      onClick={() => commentText.trim() && commentMutation.mutate({
                        body: commentText.trim(), is_internal: isInternal,
                      })}
                      data-testid="button-add-comment">
                      {commentMutation.isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  {canManageCases && (
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                      <input type="checkbox" checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)} />
                      تعليق داخلي (لا يُرسل للعميل)
                    </label>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {(data?.activity.length ?? 0) === 0 ? (
                    <div className="py-6 text-center text-gray-500 text-sm">لا يوجد نشاط مُسجّل</div>
                  ) : (
                    data!.activity.map((a, i) => (
                      <div key={a.id ?? i}
                        className="flex items-start gap-2 text-sm border-r-2 border-blue-200 dark:border-blue-800 pr-3 py-1">
                        <History className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <div>
                            <span className="font-medium">{a.actor_name || "النظام"}</span>{" "}
                            <span className="text-gray-600 dark:text-gray-300">{a.action}</span>
                            {a.details != null && (
                              <span className="text-gray-500">
                                {" "}— {activityDetailsText(a.details)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{fmtDate(a.created_at)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>

      {canManageCases && c && (
        <EditCaseDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          serviceCase={c}
          customerOptions={customerOptions}
          userOptions={userOptions}
          onSaved={() => setEditOpen(false)}
          patchMutation={patchMutation}
          toast={toast}
        />
      )}
    </Dialog>
  );
}

// ============================================================================
// Edit case dialog (full field edit — managers)
// ============================================================================

function EditCaseDialog({
  open, onOpenChange, serviceCase, customerOptions, userOptions, onSaved, patchMutation, toast,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  serviceCase: ServiceCase;
  customerOptions: { value: string; label: string }[];
  userOptions: { value: string; label: string }[];
  onSaved: () => void;
  patchMutation: ReturnType<typeof useMutation<any, any, any>>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [form, setForm] = useState({
    title: "", description: "", type: "request", customer_id: "",
    status: "open", priority: "normal", assignee_id: "", due_date: "",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Sync form from the case whenever the dialog opens (or target case changes)
  useEffect(() => {
    if (open) {
      setForm({
        title:       serviceCase.title ?? "",
        description: serviceCase.description ?? "",
        type:        serviceCase.type ?? "request",
        customer_id: serviceCase.customer_id != null ? String(serviceCase.customer_id) : "",
        status:      serviceCase.status ?? "open",
        priority:    serviceCase.priority ?? "normal",
        assignee_id: serviceCase.assignee_id != null ? String(serviceCase.assignee_id) : "",
        due_date:    serviceCase.due_date ? serviceCase.due_date.slice(0, 10) : "",
      });
    }
  }, [open, serviceCase]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-testid="dialog-edit-case"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />تعديل الحالة
          </DialogTitle>
          <DialogDescription className="font-mono">
            {serviceCase.reference || `#${serviceCase.id}`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="العنوان *" labelClassName="">
            <Input value={form.title} onChange={(e) => set("title")(e.target.value)}
              placeholder="عنوان الحالة" data-testid="input-edit-case-title" />
          </Field>
          <Field label="العميل" labelClassName="">
            <SearchableSelect
              options={[{ value: "", label: "بدون عميل" }, ...customerOptions]}
              value={form.customer_id} onValueChange={set("customer_id")}
              placeholder="اختر العميل (أو بدون)" searchPlaceholder="ابحث عن عميل..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="النوع" labelClassName="">
              <Select value={form.type} onValueChange={set("type")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><OptionItems options={TYPE_OPTIONS} /></SelectContent>
              </Select>
            </Field>
            <Field label="الأولوية" labelClassName="">
              <Select value={form.priority} onValueChange={set("priority")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><OptionItems options={PRIORITY_OPTIONS} /></SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الحالة" labelClassName="">
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger data-testid="select-edit-case-status"><SelectValue /></SelectTrigger>
                <SelectContent><OptionItems options={STATUS_OPTIONS} /></SelectContent>
              </Select>
            </Field>
            <Field label="تاريخ الاستحقاق" labelClassName="">
              <Input type="date" value={form.due_date}
                onChange={(e) => set("due_date")(e.target.value)}
                data-testid="input-edit-case-due-date" />
            </Field>
          </div>
          <Field label="إسناد إلى" labelClassName="">
            <SearchableSelect
              options={[{ value: "", label: "غير مُسندة" }, ...userOptions]}
              value={form.assignee_id} onValueChange={set("assignee_id")}
              placeholder="اختر الموظف" searchPlaceholder="ابحث عن موظف..." />
          </Field>
          <Field label="الوصف" labelClassName="">
            <Textarea className="min-h-28" value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="تفاصيل الحالة..." data-testid="input-edit-case-description" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button
            disabled={patchMutation.isPending}
            data-testid="button-save-case"
            onClick={() => {
              if (!form.title.trim()) {
                toast({ title: "اكتب عنوان الحالة", variant: "destructive" }); return;
              }
              patchMutation.mutate(
                {
                  title: form.title.trim(),
                  description: form.description.trim() || null,
                  type: form.type,
                  customer_id: form.customer_id || null,
                  status: form.status,
                  priority: form.priority,
                  assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
                  due_date: form.due_date || null,
                },
                { onSuccess: () => onSaved() },
              );
            }}
          >
            {patchMutation.isPending
              ? <><Loader2 className="h-4 w-4 ml-1 animate-spin" />جارٍ الحفظ...</>
              : <><CheckCircle2 className="h-4 w-4 ml-1" />حفظ التغييرات</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Knowledge tab
// ============================================================================

function KnowledgeTab({
  canManage, queryClient, toast,
}: {
  canManage: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<KnowledgeArticle | null>(null);
  const [editOpen, setEditOpen]       = useState(false);
  const [editArticle, setEditArticle] = useState<KnowledgeArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeArticle | null>(null);

  const listKey = ["/api/customer-service/knowledge", { search }];

  const { data, isLoading, isError, refetch } = useQuery<{ data: KnowledgeArticle[]; total?: number }>({
    queryKey: listKey,
    queryFn: () => {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      const qs = p.toString();
      return jsonFetch(`/api/customer-service/knowledge${qs ? `?${qs}` : ""}`);
    },
  });

  const articles = data?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/customer-service/knowledge"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      jsonFetch(`/api/customer-service/knowledge/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "تم حذف المقال" });
      if (selected && deleteTarget && selected.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: any) => toast({ title: e?.message || "تعذر حذف المقال", variant: "destructive" }),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }: { id: number; is_published: boolean }) =>
      jsonFetch(`/api/customer-service/knowledge/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published }),
      }),
    onSuccess: () => { toast({ title: "تم تحديث حالة النشر" }); invalidate(); },
    onError: (e: any) => toast({ title: e?.message || "تعذر تحديث النشر", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5" />قاعدة المعرفة
          </CardTitle>
          {canManage && (
            <Button onClick={() => { setEditArticle(null); setEditOpen(true); }}
              data-testid="button-new-knowledge">
              <Plus className="h-4 w-4 ml-1" />مقال جديد
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}>
            <div className="relative flex-1">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pr-8" placeholder="ابحث في المقالات..."
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                data-testid="input-knowledge-search" />
            </div>
            <Button type="submit" variant="secondary">بحث</Button>
          </form>

          {isLoading ? (
            <LoadingRows count={5} className="h-16 w-full" />
          ) : isError ? (
            <ErrorState message="تعذر تحميل قاعدة المعرفة" onRetry={() => refetch()} />
          ) : articles.length === 0 ? (
            <div className="py-10 text-center text-gray-500">لا توجد مقالات</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {articles.map((a) => (
                <div key={a.id}
                  className="rounded-lg border p-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                  onClick={() => setSelected(a)}
                  data-testid={`knowledge-article-${a.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium">{a.title}</div>
                    <div className="flex items-center gap-1 shrink-0">
                      {a.category && <Badge variant="outline">{a.category}</Badge>}
                      {canManage && (
                        <Badge
                          className={a.is_published
                            ? "bg-green-100 text-green-700 border-0 cursor-pointer"
                            : "bg-gray-100 text-gray-500 border-0 cursor-pointer"}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublishMutation.mutate({ id: a.id, is_published: !a.is_published });
                          }}
                        >
                          {a.is_published
                            ? <><Eye className="h-3 w-3 inline ml-0.5" />منشور</>
                            : <><EyeOff className="h-3 w-3 inline ml-0.5" />مسوّدة</>}
                        </Badge>
                      )}
                      {!canManage && a.is_published !== undefined && (
                        <Badge className={a.is_published
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-gray-100 text-gray-500 border-0"}>
                          {a.is_published ? "منشور" : "مسوّدة"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {a.content && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                  )}
                  {Array.isArray(a.tags) && a.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {a.tags.map((t, ti) => (
                        <Badge key={ti} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                  {canManage && (
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="ghost"
                        onClick={(e) => { e.stopPropagation(); setEditArticle(a); setEditOpen(true); }}
                        data-testid={`button-edit-knowledge-${a.id}`}>
                        <Pencil className="h-3.5 w-3.5 ml-1" />تعديل
                      </Button>
                      <Button size="sm" variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(a); }}
                        data-testid={`button-delete-knowledge-${a.id}`}>
                        <Trash2 className="h-3.5 w-3.5 ml-1" />حذف
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Article viewer */}
      <Dialog open={selected !== null} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />{selected.title}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2">
                  {selected.category && <Badge variant="outline">{selected.category}</Badge>}
                  <Badge className={selected.is_published
                    ? "bg-green-100 text-green-700 border-0"
                    : "bg-gray-100 text-gray-500 border-0"}>
                    {selected.is_published ? "منشور" : "مسوّدة"}
                  </Badge>
                  <span className="text-xs">
                    آخر تحديث: {fmtDate(selected.updated_at || selected.created_at)}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {selected.content || "لا يوجد محتوى"}
              </div>
              {Array.isArray(selected.tags) && selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selected.tags.map((t, i) => (
                    <Badge key={i} variant="secondary">{t}</Badge>
                  ))}
                </div>
              )}
              {canManage && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setEditArticle(selected); setEditOpen(true); }}>
                    <Pencil className="h-4 w-4 ml-1" />تعديل
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/create dialog — only rendered when canManage */}
      {canManage && (
        <KnowledgeEditDialog
          open={editOpen} onOpenChange={setEditOpen}
          article={editArticle}
          onSaved={() => { invalidate(); setEditOpen(false); }}
          toast={toast}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المقال</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف «{deleteTarget?.title}»؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// Knowledge edit dialog  — useEffect for safe form sync
// ============================================================================

function KnowledgeEditDialog({
  open, onOpenChange, article, onSaved, toast,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  article: KnowledgeArticle | null;
  onSaved: () => void;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [form, setForm] = useState({
    title: "", category: "", content: "", tags: "", is_published: false,
  });

  // Sync form from article whenever dialog opens or target article changes
  useEffect(() => {
    if (open) {
      setForm({
        title:        article?.title    ?? "",
        category:     article?.category ?? "",
        content:      article?.content  ?? "",
        tags:         Array.isArray(article?.tags) ? article.tags.join(", ") : "",
        is_published: article?.is_published ?? false,
      });
    }
  }, [open, article]);

  const isEdit = !!article;

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? jsonFetch(`/api/customer-service/knowledge/${article!.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : jsonFetch("/api/customer-service/knowledge", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
    onSuccess: () => { toast({ title: isEdit ? "تم تحديث المقال" : "تم إنشاء المقال" }); onSaved(); },
    onError: (e: any) => toast({ title: e?.message || "تعذر حفظ المقال", variant: "destructive" }),
  });

  const tagsArray = form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل المقال" : "مقال جديد"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="العنوان *" labelClassName="">
            <Input value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="عنوان المقال" data-testid="input-knowledge-title" />
          </Field>
          <Field label="التصنيف" labelClassName="">
            <Input value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="مثال: الفواتير، الشحن..." />
          </Field>
          <Field label="المحتوى" labelClassName="">
            <Textarea className="min-h-40" value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="اكتب محتوى المقال..." data-testid="input-knowledge-body" />
          </Field>
          <Field label="وسوم (مفصولة بفاصلة)" labelClassName="">
            <Input value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="وسم1, وسم2" />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={form.is_published}
              onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />
            نشر المقال (مرئي للمستخدمين)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button disabled={saveMutation.isPending} data-testid="button-save-knowledge"
            onClick={() => {
              if (!form.title.trim()) {
                toast({ title: "اكتب عنوان المقال", variant: "destructive" }); return;
              }
              if (!form.content.trim()) {
                toast({ title: "اكتب محتوى المقال", variant: "destructive" }); return;
              }
              saveMutation.mutate({
                title:        form.title.trim(),
                category:     form.category.trim() || null,
                content:      form.content.trim(),
                tags:         tagsArray.length ? tagsArray : null,
                is_published: form.is_published,
              });
            }}>
            {saveMutation.isPending
              ? <><Loader2 className="h-4 w-4 ml-1 animate-spin" />جارٍ الحفظ...</>
              : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Reports tab
// ============================================================================

function ReportsTab({
  customerOptions, userOptions,
}: {
  customerOptions: { value: string; label: string }[];
  userOptions: { value: string; label: string }[];
}) {
  const { toast } = useToast();
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const firstDay = `${y}-${m}-01`;
  const lastDay  = new Date(y, today.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [from, setFrom]               = useState(firstDay);
  const [to, setTo]                   = useState(lastDay);
  const [statusFilter, setStatus]     = useState("all");
  const [priorityFilter, setPriority] = useState("all");
  const [typeFilter, setType]         = useState("all");
  const [customerFilter, setCustomer] = useState("");
  const [assigneeFilter, setAssignee] = useState("");
  const [printing, setPrinting]       = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<ReportsResponse>({
    queryKey: ["/api/customer-service/reports",
      { from, to, status: statusFilter, priority: priorityFilter, type: typeFilter,
        customer: customerFilter, assignee: assigneeFilter }],
    queryFn: () => {
      const p = new URLSearchParams({ limit: "500" });
      if (from)   p.set("from", from);
      if (to)     p.set("to", to);
      if (statusFilter   !== "all") p.set("status",   statusFilter);
      if (priorityFilter !== "all") p.set("priority", priorityFilter);
      if (typeFilter     !== "all") p.set("type",     typeFilter);
      if (customerFilter) p.set("customer_id", customerFilter);
      if (assigneeFilter) p.set("assignee_id", assigneeFilter);
      return jsonFetch<ReportsResponse>(`/api/customer-service/reports?${p}`);
    },
    enabled: !!from && !!to && from <= to,
  });

  const rows   = data?.data ?? [];
  const totals = data?.totals || {};

  // Build a URLSearchParams object from the active filters (no limit/offset).
  const buildFilterParams = () => {
    const p = new URLSearchParams();
    if (from)   p.set("from", from);
    if (to)     p.set("to", to);
    if (statusFilter   !== "all") p.set("status",   statusFilter);
    if (priorityFilter !== "all") p.set("priority", priorityFilter);
    if (typeFilter     !== "all") p.set("type",     typeFilter);
    if (customerFilter) p.set("customer_id", customerFilter);
    if (assigneeFilter) p.set("assignee_id", assigneeFilter);
    return p;
  };

  // Build the final print HTML from all fetched rows + first-page totals.
  const buildPrintHtml = (
    allRows: ServiceCase[],
    printTotals: ReportsResponse["totals"],
  ): string => {
    const esc = escapeHtml;
    const filters: string[] = [];
    if (from) filters.push(`من: ${esc(from)}`);
    if (to)   filters.push(`إلى: ${esc(to)}`);
    if (statusFilter   !== "all") filters.push(`الحالة: ${esc(statusLabel(statusFilter))}`);
    if (priorityFilter !== "all") filters.push(`الأولوية: ${esc(priorityLabel(priorityFilter))}`);
    if (typeFilter     !== "all") filters.push(`النوع: ${esc(typeLabel(typeFilter))}`);
    if (customerFilter) {
      const cn = customerOptions.find((c) => c.value === customerFilter);
      filters.push(`العميل: ${esc(cn?.label || customerFilter)}`);
    }
    if (assigneeFilter) {
      const an = userOptions.find((u) => u.value === assigneeFilter);
      filters.push(`المُسند إليه: ${esc(an?.label || assigneeFilter)}`);
    }

    const rowsHtml = allRows.map((r) =>
      `<tr>
        <td>${esc(r.reference || `#${r.id}`)}</td>
        <td>${esc(r.title)}</td>
        <td>${esc(r.customer_name || "-")}</td>
        <td>${esc(typeLabel(r.type))}</td>
        <td>${esc(statusLabel(r.status))}</td>
        <td>${esc(priorityLabel(r.priority))}</td>
        <td>${esc(r.assignee_name || "غير مُسندة")}</td>
        <td>${esc(r.due_date ? fmtDateOnly(r.due_date) : "-")}</td>
        <td>${esc(fmtDate(r.created_at))}</td>
      </tr>`,
    ).join("");

    const pt = printTotals || {};
    const summaryHtml = `<div class="summary">
      <span><b>الإجمالي:</b> ${esc(pt.total ?? allRows.length)}</span>
      <span><b>مفتوحة:</b> ${esc(pt.open ?? "-")}</span>
      <span><b>تم الحل:</b> ${esc(pt.resolved ?? "-")}</span>
      <span><b>مغلقة:</b> ${esc(pt.closed ?? "-")}</span>
      ${pt.avg_resolution_hours != null
        ? `<span><b>متوسط زمن الحل:</b> ${esc(pt.avg_resolution_hours)} ساعة</span>`
        : ""}
    </div>`;

    return `<!DOCTYPE html>
      <html dir="rtl" lang="ar"><head><meta charset="utf-8">
      <title>تقرير حالات خدمة العملاء</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; color: #111; font-size: 11px; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        .meta { color: #555; margin-bottom: 8px; }
        .summary { display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0 12px; padding: 8px; background: #f3f4f6; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #bbb; padding: 3px 5px; text-align: right; vertical-align: top; }
        th { background: #f3f4f6; }
      </style></head><body>
      <h1>تقرير حالات خدمة العملاء</h1>
      <div class="meta">
        تاريخ الطباعة: ${esc(new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" }))}
        ${filters.length ? " | " + filters.join(" | ") : ""}
        | عدد السجلات: ${allRows.length}
      </div>
      ${summaryHtml}
      ${allRows.length === 0
        ? `<div>لا توجد حالات مطابقة</div>`
        : `<table><thead><tr>
            <th>المرجع</th><th>العنوان</th><th>العميل</th><th>النوع</th>
            <th>الحالة</th><th>الأولوية</th><th>المُسند إليه</th>
            <th>الاستحقاق</th><th>التاريخ</th>
          </tr></thead><tbody>${rowsHtml}</tbody></table>`}
      <script>window.onload = function(){ window.print(); };</script>
      </body></html>`;
  };

  // handlePrint: open the window synchronously (required to avoid popup blockers),
  // then fetch all pages asynchronously before writing the final HTML.
  const handlePrint = () => {
    // Must open synchronously within the click handler.
    const w = window.open("", "_blank");
    if (!w) {
      toast({
        title: "تعذر فتح نافذة الطباعة",
        description: "يُرجى السماح بالنوافذ المنبثقة وإعادة المحاولة.",
        variant: "destructive",
      });
      return;
    }
    w.document.write(
      `<html dir="rtl"><body style="font-family:sans-serif;padding:24px;direction:rtl">` +
      `<p>⏳ جارٍ تجميع البيانات، يُرجى الانتظار...</p></body></html>`,
    );

    setPrinting(true);

    const PRINT_PAGE_SIZE = 500;

    const fetchAllPages = async (): Promise<void> => {
      const allRows: ServiceCase[] = [];
      let firstPageTotals: ReportsResponse["totals"] = undefined;
      let offset = 0;
      let total: number | null = null;

      while (true) {
        const p = buildFilterParams();
        p.set("limit", String(PRINT_PAGE_SIZE));
        p.set("offset", String(offset));

        let page: ReportsResponse;
        try {
          page = await jsonFetch<ReportsResponse>(
            `/api/customer-service/reports?${p}`,
          );
        } catch (e: any) {
          w.close();
          toast({
            title: "فشل تحميل بيانات التقرير",
            description: e?.message || `تعذر تحميل الصفحة عند الإزاحة ${offset}. لم تُطبع أي بيانات.`,
            variant: "destructive",
          });
          return;
        }

        const pageRows = page.data ?? [];

        // Deduplicate: skip if a row with same id already exists (safeguard
        // against a server returning the same offset twice).
        const seenIds = new Set(allRows.map((r) => r.id));
        for (const r of pageRows) {
          if (!seenIds.has(r.id)) {
            allRows.push(r);
            seenIds.add(r.id);
          }
        }

        // Capture totals from the first page only (server-computed aggregate).
        if (offset === 0) {
          firstPageTotals = page.totals;
          total = page.total ?? null;
        }

        offset += PRINT_PAGE_SIZE;

        // Stop when we have collected all rows reported by the server, or
        // when this page was empty (no more data).
        const serverTotal = total ?? 0;
        if (pageRows.length === 0 || allRows.length >= serverTotal) {
          break;
        }
      }

      // All pages fetched successfully — build and inject the print HTML.
      const html = buildPrintHtml(allRows, firstPageTotals);
      w.document.open();
      w.document.write(html);
      w.document.close();
    };

    fetchAllPages().finally(() => setPrinting(false));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />تقارير الحالات
          </CardTitle>
          <Button variant="outline" onClick={handlePrint} disabled={printing || isLoading}
            data-testid="button-print-report">
            <Printer className="h-4 w-4 ml-1" />
            {printing ? "جارٍ التجهيز..." : "طباعة التقرير"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="من">
              <Input type="date" value={from} max={to}
                onChange={(e) => setFrom(e.target.value)} className="w-auto"
                data-testid="input-report-from" />
            </Field>
            <Field label="إلى">
              <Input type="date" value={to} min={from}
                onChange={(e) => setTo(e.target.value)} className="w-auto"
                data-testid="input-report-to" />
            </Field>
            <Field label="النوع">
              <Select value={typeFilter} onValueChange={setType}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  <OptionItems options={TYPE_OPTIONS} />
                </SelectContent>
              </Select>
            </Field>
            <Field label="الحالة">
              <Select value={statusFilter} onValueChange={setStatus}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <OptionItems options={STATUS_OPTIONS} />
                </SelectContent>
              </Select>
            </Field>
            <Field label="الأولوية">
              <Select value={priorityFilter} onValueChange={setPriority}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <OptionItems options={PRIORITY_OPTIONS} />
                </SelectContent>
              </Select>
            </Field>
            <Field label="العميل" className="min-w-[180px]">
              <SearchableSelect
                options={[{ value: "", label: "كل العملاء" }, ...customerOptions]}
                value={customerFilter} onValueChange={setCustomer}
                placeholder="كل العملاء" searchPlaceholder="ابحث..." />
            </Field>
            <Field label="المُسند إليه" className="min-w-[180px]">
              <SearchableSelect
                options={[{ value: "", label: "الكل" }, ...userOptions]}
                value={assigneeFilter} onValueChange={setAssignee}
                placeholder="الكل" searchPlaceholder="ابحث..." />
            </Field>
          </div>

          {/* Compact totals */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            <CompactTotal label="الإجمالي" value={totals.total ?? rows.length} />
            <CompactTotal label="مفتوحة"   value={totals.open}      tone="blue" />
            <CompactTotal label="تم الحل"  value={totals.resolved}  tone="green" />
            <CompactTotal label="مغلقة"    value={totals.closed}    tone="gray" />
            {totals.avg_resolution_hours != null && (
              <CompactTotal label="متوسط الحل (س)" value={totals.avg_resolution_hours} tone="amber" />
            )}
          </div>
          {(data?.total ?? 0) > rows.length && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              يعرض الجدول أول {rows.length} من {data?.total} حالة، بينما تجمع الطباعة جميع النتائج المطابقة.
            </p>
          )}

          {isLoading ? (
            <LoadingRows count={6} className="h-10 w-full" />
          ) : isError ? (
            <ErrorState message="تعذر تحميل التقرير" onRetry={() => refetch()} />
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-gray-500">لا توجد حالات مطابقة للفلاتر</div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <CasesTableHead />
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}><CaseCells c={r} /></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
