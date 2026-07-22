import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ShieldAlert,
  Printer,
  Trash2,
  Pencil,
  Ban,
  RotateCcw,
  Settings2,
  FileText,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { hasPermission } from "../../../shared/permissions";
import { useAuth } from "../hooks/use-auth";

type Worker = {
  id: number;
  username: string | null;
  display_name: string | null;
  display_name_ar: string | null;
  section_id: number | null;
  section_name_ar: string | null;
};

type ViolationType = {
  id: number;
  name_ar: string;
  points: number;
  repeat_points: number;
  active: boolean;
  sort_order: number;
};

type WvSettings = {
  id: number;
  point_value: string;
  repeat_window_days: number;
};

type Machine = {
  id: string;
  name: string;
  name_ar: string | null;
  section_id: string;
};

type WvRow = {
  id: number;
  employee_id: number;
  employee_name: string;
  violation_type_id: number;
  violation_type_name: string;
  occurred_at: string;
  note: string | null;
  machine_id: string | null;
  machine_name: string | null;
  production_order_id: number | null;
  repeat_index: number;
  points: number;
  deduction_amount: string;
  waived: boolean;
  waived_by_name: string | null;
  waive_reason: string | null;
  reported_by_name: string | null;
  created_at: string;
};

const formSchema = z.object({
  employee_id: z.string().min(1, "اختر العامل"),
  violation_type_id: z.string().min(1, "اختر نوع المخالفة"),
  occurred_at: z.string().min(1, "حدد التاريخ والوقت"),
  note: z.string().optional(),
  machine_id: z.string().optional(),
  production_order_id: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

function nowLocalInput(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function fmtDateTime(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function openPrint(title: string, bodyHtml: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 15mm; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #111; margin: 0; }
  h1 { font-size: 20px; text-align: center; margin: 0 0 4px; }
  h2 { font-size: 14px; text-align: center; color: #555; margin: 0 0 16px; font-weight: normal; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #999; padding: 6px 8px; text-align: right; }
  th { background: #f3f4f6; }
  .meta { display: flex; justify-content: space-between; font-size: 12px; color: #444; margin-bottom: 12px; }
  .box { border: 1px solid #999; border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; font-size: 13px; }
  .row { display: flex; gap: 24px; margin-bottom: 6px; }
  .lbl { color: #555; min-width: 110px; }
  .sig { display: flex; justify-content: space-between; margin-top: 48px; font-size: 13px; }
  .sig div { text-align: center; width: 30%; border-top: 1px solid #333; padding-top: 6px; }
  .total { font-weight: bold; background: #f9fafb; }
  .waived { color: #b45309; }
  .footer { margin-top: 24px; text-align: center; color: #9ca3af; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 6px; }
</style></head><body>${bodyHtml}
<script>window.onload=function(){setTimeout(function(){window.print();},300);}</script></body></html>`);
  win.document.close();
}

function printHeader(title: string, subtitle: string): string {
  return `<h1>مصنع أكياس البلاستيك الحديث - MPBF</h1><h2>${esc(title)}${subtitle ? " — " + esc(subtitle) : ""}</h2>
  <div class="meta"><span>تاريخ الطباعة: ${esc(new Date().toLocaleString("ar-SA"))}</span></div>`;
}

const PRINT_FOOTER = `<div class="footer">تم إنشاء هذا المستند آلياً من نظام MPBF</div>`;

function printSingle(v: WvRow) {
  const body = `${printHeader("نموذج مخالفة عمل", `رقم ${v.id}`)}
  <div class="box">
    <div class="row"><span class="lbl">اسم العامل:</span><b>${esc(v.employee_name)}</b></div>
    <div class="row"><span class="lbl">نوع المخالفة:</span><b>${esc(v.violation_type_name)}</b></div>
    <div class="row"><span class="lbl">التاريخ والوقت:</span>${esc(fmtDateTime(v.occurred_at))}</div>
    <div class="row"><span class="lbl">الماكينة:</span>${esc(v.machine_name || "—")}</div>
    <div class="row"><span class="lbl">أمر الإنتاج:</span>${esc(v.production_order_id ?? "—")}</div>
    <div class="row"><span class="lbl">رقم التكرار:</span>${esc(v.repeat_index)}</div>
    <div class="row"><span class="lbl">النقاط:</span><b>${esc(v.points)}</b></div>
    <div class="row"><span class="lbl">قيمة الخصم:</span><b>${esc(Number(v.deduction_amount).toFixed(2))} ر.س</b></div>
    ${v.waived ? `<div class="row waived"><span class="lbl">الحالة:</span>مُتجاوز عنها (بواسطة: ${esc(v.waived_by_name || "—")})${v.waive_reason ? " — السبب: " + esc(v.waive_reason) : ""}</div>` : ""}
    <div class="row"><span class="lbl">ملاحظات:</span>${esc(v.note || "—")}</div>
    <div class="row"><span class="lbl">سجّلها:</span>${esc(v.reported_by_name || "—")}</div>
  </div>
  <div class="sig"><div>توقيع العامل</div><div>توقيع المشرف</div><div>توقيع المدير</div></div>
  ${PRINT_FOOTER}`;
  openPrint(`مخالفة عمل رقم ${v.id}`, body);
}

function rowsTable(rows: WvRow[], managerView: boolean): string {
  const totalPoints = rows
    .filter((r) => !r.waived)
    .reduce((s, r) => s + r.points, 0);
  const totalDeduction = rows
    .filter((r) => !r.waived)
    .reduce((s, r) => s + Number(r.deduction_amount), 0);
  return `<table><thead><tr>
    <th>#</th><th>العامل</th><th>النوع</th><th>التاريخ</th><th>التكرار</th><th>النقاط</th>
    ${managerView ? "<th>الخصم (ر.س)</th><th>الحالة</th><th>سجّلها</th>" : ""}
  </tr></thead><tbody>
  ${rows
    .map(
      (r, i) => `<tr>
      <td>${i + 1}</td><td>${esc(r.employee_name)}</td><td>${esc(r.violation_type_name)}</td>
      <td>${esc(fmtDateTime(r.occurred_at))}</td><td>${esc(r.repeat_index)}</td><td>${esc(r.points)}</td>
      ${
        managerView
          ? `<td>${esc(Number(r.deduction_amount).toFixed(2))}</td>
             <td>${r.waived ? `<span class="waived">مُتجاوز عنها${r.waived_by_name ? " (" + esc(r.waived_by_name) + ")" : ""}</span>` : "سارية"}</td>
             <td>${esc(r.reported_by_name || "—")}</td>`
          : ""
      }
    </tr>`,
    )
    .join("")}
  <tr class="total"><td colspan="5">الإجمالي (بدون المُتجاوز عنها)</td><td>${totalPoints}</td>
  ${managerView ? `<td>${totalDeduction.toFixed(2)}</td><td colspan="2"></td>` : ""}</tr>
  </tbody></table>`;
}

export default function WorkViolationsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canRecord = hasPermission(user?.permissions, [
    "record_work_violations",
    "manage_work_violations",
  ]);
  const canManage = hasPermission(user?.permissions, "manage_work_violations");

  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [editRow, setEditRow] = useState<WvRow | null>(null);
  const [waiveRow, setWaiveRow] = useState<WvRow | null>(null);
  const [waiveReason, setWaiveReason] = useState("");

  const { data: workers = [], isLoading: workersLoading } = useQuery<Worker[]>({
    queryKey: ["/api/work-violations/workers"],
  });
  const { data: types = [] } = useQuery<ViolationType[]>({
    queryKey: ["/api/work-violations/types"],
  });
  const { data: settings } = useQuery<WvSettings>({
    queryKey: ["/api/work-violations/settings"],
  });
  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ["/api/work-violations/machines"],
  });

  const listParams = new URLSearchParams();
  if (filterEmployee !== "all") listParams.set("employee_id", filterEmployee);
  if (filterFrom) listParams.set("from", filterFrom);
  if (filterTo) listParams.set("to", filterTo);
  const listQs = listParams.toString();
  const { data: rows = [], isLoading: rowsLoading } = useQuery<WvRow[]>({
    queryKey: ["/api/work-violations", listQs],
    queryFn: async () => {
      const res = await apiRequest(
        `/api/work-violations${listQs ? `?${listQs}` : ""}`,
      );
      return res.json();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      violation_type_id: "",
      occurred_at: nowLocalInput(),
      note: "",
      machine_id: "",
      production_order_id: "",
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/work-violations"] });
  };

  const onApiError = (error: any) => {
    toast({
      title: "خطأ",
      description: error?.message || "حدث خطأ غير متوقع",
      variant: "destructive",
    });
  };

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("/api/work-violations", {
        method: "POST",
        body: JSON.stringify({
          employee_id: values.employee_id,
          violation_type_id: values.violation_type_id,
          occurred_at: new Date(values.occurred_at).toISOString(),
          note: values.note || "",
          machine_id: values.machine_id || "",
          production_order_id: values.production_order_id || "",
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم", description: "تم تسجيل المخالفة بنجاح" });
      form.reset({
        employee_id: "",
        violation_type_id: "",
        occurred_at: nowLocalInput(),
        note: "",
        machine_id: "",
        production_order_id: "",
      });
      invalidate();
    },
    onError: onApiError,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; data: any }) => {
      const res = await apiRequest(`/api/work-violations/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload.data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم", description: "تم تحديث المخالفة" });
      setEditRow(null);
      invalidate();
    },
    onError: onApiError,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/work-violations/${id}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم", description: "تم حذف المخالفة" });
      invalidate();
    },
    onError: onApiError,
  });

  const waiveMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      waive: boolean;
      reason?: string;
    }) => {
      const res = await apiRequest(
        `/api/work-violations/${payload.id}/${payload.waive ? "waive" : "unwaive"}`,
        {
          method: "POST",
          body: JSON.stringify(
            payload.waive ? { waive_reason: payload.reason || "" } : {},
          ),
        },
      );
      return res.json();
    },
    onSuccess: (_d, vars) => {
      toast({
        title: "تم",
        description: vars.waive ? "تم التجاوز عن المخالفة" : "تم إلغاء التجاوز",
      });
      setWaiveRow(null);
      setWaiveReason("");
      invalidate();
    },
    onError: onApiError,
  });

  const typeMutation = useMutation({
    mutationFn: async (payload: { id: number; data: any }) => {
      const res = await apiRequest(
        `/api/work-violations/types/${payload.id}`,
        { method: "PUT", body: JSON.stringify(payload.data) },
      );
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم", description: "تم تحديث نوع المخالفة" });
      queryClient.invalidateQueries({
        queryKey: ["/api/work-violations/types"],
      });
      invalidate();
    },
    onError: onApiError,
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("/api/work-violations/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم", description: "تم حفظ الإعدادات" });
      queryClient.invalidateQueries({
        queryKey: ["/api/work-violations/settings"],
      });
      invalidate();
    },
    onError: onApiError,
  });

  const [pointValue, setPointValue] = useState<string | null>(null);
  const [windowDays, setWindowDays] = useState<string | null>(null);
  const effectivePointValue =
    pointValue ?? (settings ? String(Number(settings.point_value)) : "");
  const effectiveWindowDays =
    windowDays ?? (settings ? String(settings.repeat_window_days) : "");

  const workerName = (w: Worker) =>
    w.display_name_ar || w.display_name || w.username || `#${w.id}`;

  const filteredEmployeeName = useMemo(() => {
    if (filterEmployee === "all") return "";
    const w = workers.find((x) => String(x.id) === filterEmployee);
    return w ? workerName(w) : "";
  }, [filterEmployee, workers]);

  const periodLabel =
    filterFrom || filterTo
      ? `الفترة: ${filterFrom || "البداية"} إلى ${filterTo || "اليوم"}`
      : "كل الفترات";

  const printEmployeeReport = () => {
    const title = filteredEmployeeName
      ? `تقرير مخالفات العامل: ${filteredEmployeeName}`
      : "تقرير مخالفات العمل";
    openPrint(
      title,
      `${printHeader(title, periodLabel)}${rowsTable(rows, false)}${PRINT_FOOTER}`,
    );
  };

  const printManagerReport = () => {
    const title = "تقرير المدير — مخالفات العمل والخصومات";
    openPrint(
      title,
      `${printHeader(title, `${filteredEmployeeName ? filteredEmployeeName + " — " : ""}${periodLabel}`)}${rowsTable(rows, true)}${PRINT_FOOTER}`,
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4" dir="rtl">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold">مخالفات العمل</h1>
      </div>

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records" data-testid="tab-records">
            <FileText className="h-4 w-4 ml-1" /> السجل والتسجيل
          </TabsTrigger>
          {canManage && (
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings2 className="h-4 w-4 ml-1" /> إعدادات المدير
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {canRecord && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تسجيل مخالفة جديدة</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((v) =>
                      createMutation.mutate(v),
                    )}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <FormField
                      control={form.control}
                      name="employee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العامل *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-employee">
                                <SelectValue
                                  placeholder={
                                    workersLoading
                                      ? "جاري التحميل..."
                                      : "اختر العامل"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.map((w) => (
                                <SelectItem key={w.id} value={String(w.id)}>
                                  {workerName(w)}
                                  {w.section_name_ar
                                    ? ` — ${w.section_name_ar}`
                                    : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="violation_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع المخالفة *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue placeholder="اختر النوع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {types
                                .filter((t) => t.active)
                                .map((t) => (
                                  <SelectItem key={t.id} value={String(t.id)}>
                                    {t.name_ar} ({t.points} نقطة)
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="occurred_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>التاريخ والوقت *</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              data-testid="input-occurred-at"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="machine_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الماكينة (اختياري)</FormLabel>
                          <Select
                            value={field.value || "none"}
                            onValueChange={(v) =>
                              field.onChange(v === "none" ? "" : v)
                            }
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-machine">
                                <SelectValue placeholder="بدون" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">بدون</SelectItem>
                              {machines.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name_ar || m.name} ({m.id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="production_order_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم أمر الإنتاج (اختياري)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="مثال: 123"
                              data-testid="input-production-order"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>ملاحظات (اختياري)</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={2}
                              data-testid="input-note"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-3">
                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        data-testid="button-submit-violation"
                      >
                        {createMutation.isPending
                          ? "جاري التسجيل..."
                          : "تسجيل المخالفة"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">سجل المخالفات</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={printEmployeeReport}
                    disabled={rows.length === 0}
                    data-testid="button-print-employee"
                  >
                    <Printer className="h-4 w-4 ml-1" /> طباعة تقرير الموظف
                  </Button>
                  {canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={printManagerReport}
                      disabled={rows.length === 0}
                      data-testid="button-print-manager"
                    >
                      <Printer className="h-4 w-4 ml-1" /> طباعة تقرير المدير
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="w-56">
                  <Label className="text-xs">العامل</Label>
                  <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                    <SelectTrigger data-testid="filter-employee">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل العمال</SelectItem>
                      {workers.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {workerName(w)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">من تاريخ</Label>
                  <Input
                    type="date"
                    value={filterFrom}
                    onChange={(e) => setFilterFrom(e.target.value)}
                    data-testid="filter-from"
                  />
                </div>
                <div>
                  <Label className="text-xs">إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={filterTo}
                    onChange={(e) => setFilterTo(e.target.value)}
                    data-testid="filter-to"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rowsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : rows.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد مخالفات مسجلة
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">العامل</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">التكرار</TableHead>
                        <TableHead className="text-right">النقاط</TableHead>
                        {canManage && (
                          <TableHead className="text-right">
                            الخصم (ر.س)
                          </TableHead>
                        )}
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow
                          key={r.id}
                          data-testid={`row-violation-${r.id}`}
                        >
                          <TableCell className="font-medium">
                            {r.employee_name}
                          </TableCell>
                          <TableCell>{r.violation_type_name}</TableCell>
                          <TableCell dir="ltr" className="text-right">
                            {fmtDateTime(r.occurred_at)}
                          </TableCell>
                          <TableCell>{r.repeat_index}</TableCell>
                          <TableCell>{r.points}</TableCell>
                          {canManage && (
                            <TableCell>
                              {Number(r.deduction_amount).toFixed(2)}
                            </TableCell>
                          )}
                          <TableCell>
                            {r.waived ? (
                              <Badge
                                variant="outline"
                                className="text-amber-600 border-amber-400"
                              >
                                مُتجاوز عنها
                              </Badge>
                            ) : (
                              <Badge variant="destructive">سارية</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="طباعة النموذج"
                                onClick={() => printSingle(r)}
                                data-testid={`button-print-${r.id}`}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              {canManage && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="تعديل"
                                    onClick={() => setEditRow(r)}
                                    data-testid={`button-edit-${r.id}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  {r.waived ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="إلغاء التجاوز"
                                      onClick={() =>
                                        waiveMutation.mutate({
                                          id: r.id,
                                          waive: false,
                                        })
                                      }
                                      data-testid={`button-unwaive-${r.id}`}
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="تجاوز (إعفاء من الخصم)"
                                      onClick={() => setWaiveRow(r)}
                                      data-testid={`button-waive-${r.id}`}
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="حذف"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "هل أنت متأكد من حذف المخالفة؟",
                                        )
                                      ) {
                                        deleteMutation.mutate(r.id);
                                      }
                                    }}
                                    data-testid={`button-delete-${r.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManage && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إعدادات الخصم</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-4">
                <div>
                  <Label>قيمة النقطة الواحدة (ر.س)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-40"
                    value={effectivePointValue}
                    onChange={(e) => setPointValue(e.target.value)}
                    data-testid="input-point-value"
                  />
                </div>
                <div>
                  <Label>نافذة احتساب التكرار (أيام)</Label>
                  <Input
                    type="number"
                    min={1}
                    className="w-40"
                    value={effectiveWindowDays}
                    onChange={(e) => setWindowDays(e.target.value)}
                    data-testid="input-window-days"
                  />
                </div>
                <Button
                  onClick={() =>
                    settingsMutation.mutate({
                      point_value: Number(effectivePointValue || 0),
                      repeat_window_days: Number(effectiveWindowDays || 30),
                    })
                  }
                  disabled={settingsMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {settingsMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </Button>
                <p className="w-full text-sm text-muted-foreground">
                  الخصم = النقاط × قيمة النقطة. عند تكرار نفس المخالفة خلال
                  النافذة تُضاف نقاط التكرار لكل مرة إضافية. تنعكس الخصومات غير
                  المُتجاوز عنها تلقائياً في تقرير أجور الموظف الشهري.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أنواع المخالفات والنقاط</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">النقاط</TableHead>
                      <TableHead className="text-right">نقاط التكرار</TableHead>
                      <TableHead className="text-right">مفعّل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {types.map((t) => (
                      <TypeRow
                        key={t.id}
                        type={t}
                        onSave={(data) =>
                          typeMutation.mutate({ id: t.id, data })
                        }
                        saving={typeMutation.isPending}
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المخالفة</DialogTitle>
          </DialogHeader>
          {editRow && (
            <EditForm
              row={editRow}
              workers={workers}
              types={types}
              machines={machines}
              saving={updateMutation.isPending}
              onSave={(data) =>
                updateMutation.mutate({ id: editRow.id, data })
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!waiveRow} onOpenChange={(o) => !o && setWaiveRow(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>التجاوز عن المخالفة</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            سيتم إعفاء العامل من خصم هذه المخالفة ولن تُحتسب في التكرار، مع
            توثيق اسمك كمن قام بالتجاوز.
          </p>
          <div>
            <Label>سبب التجاوز (اختياري)</Label>
            <Textarea
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              rows={2}
              data-testid="input-waive-reason"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                waiveRow &&
                waiveMutation.mutate({
                  id: waiveRow.id,
                  waive: true,
                  reason: waiveReason,
                })
              }
              disabled={waiveMutation.isPending}
              data-testid="button-confirm-waive"
            >
              {waiveMutation.isPending ? "جاري الحفظ..." : "تأكيد التجاوز"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TypeRow({
  type,
  onSave,
  saving,
}: {
  type: ViolationType;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [points, setPoints] = useState(String(type.points));
  const [repeatPoints, setRepeatPoints] = useState(String(type.repeat_points));
  const dirty =
    points !== String(type.points) || repeatPoints !== String(type.repeat_points);
  return (
    <TableRow data-testid={`row-type-${type.id}`}>
      <TableCell className="font-medium">{type.name_ar}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          className="w-24"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          data-testid={`input-points-${type.id}`}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          className="w-24"
          value={repeatPoints}
          onChange={(e) => setRepeatPoints(e.target.value)}
          data-testid={`input-repeat-points-${type.id}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave({ active: !type.active })}
            disabled={saving}
            data-testid={`button-toggle-active-${type.id}`}
          >
            {type.active ? "مفعّل" : "معطّل"}
          </Button>
          {dirty && (
            <Button
              size="sm"
              onClick={() =>
                onSave({
                  points: Number(points),
                  repeat_points: Number(repeatPoints),
                })
              }
              disabled={saving}
              data-testid={`button-save-type-${type.id}`}
            >
              حفظ
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function EditForm({
  row,
  workers,
  types,
  machines,
  saving,
  onSave,
}: {
  row: WvRow;
  workers: Worker[];
  types: ViolationType[];
  machines: Machine[];
  saving: boolean;
  onSave: (data: any) => void;
}) {
  const toLocal = (iso: string) => {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [employeeId, setEmployeeId] = useState(String(row.employee_id));
  const [typeId, setTypeId] = useState(String(row.violation_type_id));
  const [occurredAt, setOccurredAt] = useState(toLocal(row.occurred_at));
  const [machineId, setMachineId] = useState(row.machine_id || "none");
  const [poId, setPoId] = useState(
    row.production_order_id ? String(row.production_order_id) : "",
  );
  const [note, setNote] = useState(row.note || "");
  return (
    <div className="space-y-3">
      <div>
        <Label>العامل</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger data-testid="edit-select-employee">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {workers.map((w) => (
              <SelectItem key={w.id} value={String(w.id)}>
                {w.display_name_ar || w.display_name || w.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>نوع المخالفة</Label>
        <Select value={typeId} onValueChange={setTypeId}>
          <SelectTrigger data-testid="edit-select-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>التاريخ والوقت</Label>
        <Input
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          data-testid="edit-input-occurred-at"
        />
      </div>
      <div>
        <Label>الماكينة</Label>
        <Select value={machineId} onValueChange={setMachineId}>
          <SelectTrigger data-testid="edit-select-machine">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون</SelectItem>
            {machines.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name_ar || m.name} ({m.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>رقم أمر الإنتاج</Label>
        <Input
          type="number"
          min={1}
          value={poId}
          onChange={(e) => setPoId(e.target.value)}
          data-testid="edit-input-po"
        />
      </div>
      <div>
        <Label>ملاحظات</Label>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          data-testid="edit-input-note"
        />
      </div>
      <DialogFooter>
        <Button
          onClick={() =>
            onSave({
              employee_id: employeeId,
              violation_type_id: typeId,
              occurred_at: new Date(occurredAt).toISOString(),
              machine_id: machineId === "none" ? "" : machineId,
              production_order_id: poId || "",
              note,
            })
          }
          disabled={saving}
          data-testid="edit-button-save"
        >
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </Button>
      </DialogFooter>
    </div>
  );
}
