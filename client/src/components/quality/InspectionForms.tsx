import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Printer,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ClipboardCheck,
  Film,
  Paintbrush,
  Scissors,
  PackageCheck,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";

type ItemResult = "pass" | "fail" | "na";

interface TemplateItem {
  key: string;
  label: string;
}

interface Template {
  type: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  items: TemplateItem[];
}

export const INSPECTION_TEMPLATES: Template[] = [
  {
    type: "film",
    label: "فحص الفيلم",
    description: "جودة السحب والسماكة والمظهر",
    icon: Film,
    color: "border-blue-300 bg-blue-50 text-blue-700",
    items: [
      { key: "thickness", label: "سماكة الفيلم مطابقة للمواصفة" },
      { key: "width", label: "عرض الفيلم مطابق للمقاس المطلوب" },
      { key: "color", label: "اللون / الشفافية مطابقة للعينة" },
      { key: "cleanliness", label: "الفيلم خالٍ من الجل والشوائب والثقوب" },
      { key: "gusset", label: "السوفليه (الجوانب) مطابق ومنتظم" },
      { key: "winding", label: "لف الرول منتظم وحوافه مستقيمة" },
      { key: "meter_weight", label: "وزن المتر مطابق للحساب" },
      { key: "treatment", label: "معالجة السطح (كورونا) مناسبة للطباعة" },
    ],
  },
  {
    type: "printing",
    label: "فحص الطباعة",
    description: "الألوان والوضوح والمحاذاة",
    icon: Paintbrush,
    color: "border-purple-300 bg-purple-50 text-purple-700",
    items: [
      { key: "color_match", label: "الألوان مطابقة للعينة المعتمدة" },
      { key: "clarity", label: "الطباعة واضحة وغير مقطعة" },
      { key: "registration", label: "محاذاة الألوان (الترحيل) صحيحة" },
      { key: "ink_adhesion", label: "ثبات الحبر (اختبار الاحتكاك / اللاصق)" },
      { key: "completeness", label: "جميع عناصر التصميم مكتملة" },
      { key: "smudging", label: "خالية من التلطخ وآثار الحبر" },
      { key: "direction", label: "اتجاه وموضع الطباعة صحيح" },
    ],
  },
  {
    type: "cutting",
    label: "فحص التقطيع",
    description: "المقاس واللحام والتخريم",
    icon: Scissors,
    color: "border-orange-300 bg-orange-50 text-orange-700",
    items: [
      { key: "length", label: "طول الكيس مطابق للمقاس" },
      { key: "seal_quality", label: "اللحام سليم وغير محروق" },
      { key: "seal_strength", label: "قوة تحمل اللحام (اختبار الشد)" },
      { key: "punch_position", label: "موضع التخريم / العلاقي صحيح" },
      { key: "edges", label: "القص نظيف وخالٍ من الأهداب" },
      { key: "holes", label: "الكيس خالٍ من الثقوب والتمزق" },
      { key: "bundle_count", label: "عدد الأكياس في الحزمة صحيح" },
    ],
  },
  {
    type: "final_product",
    label: "فحص المنتج النهائي",
    description: "التغليف والوزن والمطابقة",
    icon: PackageCheck,
    color: "border-green-300 bg-green-50 text-green-700",
    items: [
      { key: "size", label: "المقاس النهائي مطابق لطلب العميل" },
      { key: "weight", label: "الوزن مطابق للمواصفة" },
      { key: "appearance", label: "المنتج خالٍ من العيوب الظاهرية" },
      { key: "packaging", label: "التغليف سليم ومحكم" },
      { key: "label", label: "بيانات الملصق صحيحة (العميل / المقاس / الوزن)" },
      { key: "carton_count", label: "العدد داخل الكرتونة صحيح" },
      { key: "carton_seal", label: "إغلاق وترتيب الكراتين سليم" },
      { key: "order_match", label: "مطابقة كاملة لمواصفات أمر التشغيل" },
    ],
  },
];

const SHIFT_OPTIONS = [
  { value: "morning", label: "صباحية" },
  { value: "evening", label: "مسائية" },
  { value: "night", label: "ليلية" },
];

const SAMPLE_OPTIONS = [3, 5, 10, 20, 30];

const RESULT_META: Record<
  ItemResult,
  { label: string; icon: any; active: string }
> = {
  pass: {
    label: "مطابق",
    icon: CheckCircle2,
    active: "bg-green-600 text-white border-green-600",
  },
  fail: {
    label: "غير مطابق",
    icon: XCircle,
    active: "bg-red-600 text-white border-red-600",
  },
  na: {
    label: "لا ينطبق",
    icon: MinusCircle,
    active: "bg-gray-500 text-white border-gray-500",
  },
};

function getTemplate(type: string): Template {
  return (
    INSPECTION_TEMPLATES.find((tpl) => tpl.type === type) ||
    INSPECTION_TEMPLATES[0]
  );
}

function esc(v: string | number | null | undefined): string {
  if (v == null) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "-";
  }
}

interface FormRecord {
  id: number;
  form_number: string;
  template_type: string;
  production_order_id: number | null;
  machine_id: string | null;
  operator_id: number | null;
  inspector_id: number | null;
  shift: string | null;
  sample_size: number | null;
  items: { key: string; result: ItemResult; note?: string | null }[];
  overall_result: string;
  notes: string | null;
  inspected_at: string | null;
  production_order_number?: string | null;
  machine_name?: string | null;
  machine_name_ar?: string | null;
  operator_name?: string | null;
  operator_name_ar?: string | null;
  inspector_name?: string | null;
  inspector_name_ar?: string | null;
}

export default function InspectionForms({
  canAdd,
  canEdit,
  canDelete,
  usersList,
  prodOrders,
}: {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  usersList: any[];
  prodOrders: any[];
}) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [filterType, setFilterType] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [searchText, setSearchText] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // form state
  const [templateType, setTemplateType] = useState<string>("");
  const [productionOrderId, setProductionOrderId] = useState<string>("");
  const [machineId, setMachineId] = useState<string>("");
  const [operatorId, setOperatorId] = useState<string>("");
  const [inspectorId, setInspectorId] = useState<string>("");
  const [shift, setShift] = useState<string>("morning");
  const [sampleSize, setSampleSize] = useState<string>("5");
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const { data: formsData, isLoading } = useQuery<any>({
    queryKey: [
      "/api/quality-inspection-forms",
      { template_type: filterType, overall_result: filterResult },
    ],
  });
  const { data: machinesData } = useQuery<any>({
    queryKey: ["/api/machines"],
  });

  const forms: FormRecord[] = Array.isArray(formsData)
    ? formsData
    : formsData?.data || [];
  const machinesList: any[] = Array.isArray(machinesData)
    ? machinesData
    : machinesData?.data || [];

  const filteredForms = useMemo(() => {
    if (!searchText) return forms;
    const q = searchText.toLowerCase();
    return forms.filter(
      (f) =>
        f.form_number?.toLowerCase().includes(q) ||
        f.production_order_number?.toLowerCase().includes(q) ||
        f.machine_name_ar?.includes(q) ||
        f.machine_name?.toLowerCase().includes(q) ||
        f.inspector_name_ar?.includes(q),
    );
  }, [forms, searchText]);

  const template = templateType ? getTemplate(templateType) : null;

  const overallResult = useMemo(() => {
    if (!template) return "pass";
    return template.items.some((it) => results[it.key] === "fail")
      ? "fail"
      : "pass";
  }, [template, results]);

  const answeredCount = template
    ? template.items.filter((it) => results[it.key]).length
    : 0;
  const allAnswered = template ? answeredCount === template.items.length : false;

  const resetForm = () => {
    setEditId(null);
    setTemplateType("");
    setProductionOrderId("");
    setMachineId("");
    setOperatorId("");
    setInspectorId(user?.id ? String(user.id) : "");
    setShift("morning");
    setSampleSize("5");
    setResults({});
    setItemNotes({});
    setNotes("");
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (f: FormRecord) => {
    setEditId(f.id);
    setTemplateType(f.template_type);
    setProductionOrderId(f.production_order_id ? String(f.production_order_id) : "");
    setMachineId(f.machine_id || "");
    setOperatorId(f.operator_id ? String(f.operator_id) : "");
    setInspectorId(f.inspector_id ? String(f.inspector_id) : "");
    setShift(f.shift || "morning");
    setSampleSize(f.sample_size ? String(f.sample_size) : "5");
    const r: Record<string, ItemResult> = {};
    const n: Record<string, string> = {};
    (f.items || []).forEach((it) => {
      r[it.key] = it.result;
      if (it.note) n[it.key] = it.note;
    });
    setResults(r);
    setItemNotes(n);
    setNotes(f.notes || "");
    setDialogOpen(true);
  };

  const buildPayload = () => ({
    template_type: templateType,
    production_order_id: productionOrderId ? Number(productionOrderId) : null,
    machine_id: machineId || null,
    operator_id: operatorId ? Number(operatorId) : null,
    inspector_id: inspectorId ? Number(inspectorId) : null,
    shift,
    sample_size: sampleSize ? Number(sampleSize) : null,
    items: (template?.items || []).map((it) => ({
      key: it.key,
      result: results[it.key],
      note: itemNotes[it.key] || null,
    })),
    overall_result: overallResult,
    notes: notes || null,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["/api/quality-inspection-forms"],
    });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId
        ? `/api/quality-inspection-forms/${editId}`
        : "/api/quality-inspection-forms";
      const res = await apiRequest(url, {
        method: editId ? "PATCH" : "POST",
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "خطأ في حفظ النموذج");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editId ? "تم تحديث النموذج بنجاح" : "تم حفظ نموذج الفحص بنجاح" });
      invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (e: any) => {
      toast({
        title: e?.message || "خطأ في حفظ النموذج",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/quality-inspection-forms/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم حذف النموذج" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "خطأ في حذف النموذج", variant: "destructive" });
    },
  });

  const handlePrint = (f: FormRecord) => {
    const tpl = getTemplate(f.template_type);
    const labelOf = (key: string) =>
      tpl.items.find((it) => it.key === key)?.label || key;
    const resultCell = (r: ItemResult) =>
      r === "pass"
        ? '<span style="color:#16a34a;font-weight:bold">✔ مطابق</span>'
        : r === "fail"
          ? '<span style="color:#dc2626;font-weight:bold">✖ غير مطابق</span>'
          : '<span style="color:#6b7280">— لا ينطبق</span>';
    const rows = (f.items || [])
      .map(
        (it, i) => `<tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${esc(labelOf(it.key))}</td>
          <td style="text-align:center">${resultCell(it.result)}</td>
          <td>${esc(it.note || "")}</td>
        </tr>`,
      )
      .join("");
    const shiftLabel =
      SHIFT_OPTIONS.find((s) => s.value === f.shift)?.label || "-";
    const overall =
      f.overall_result === "pass"
        ? '<span style="color:#16a34a">مقبول ✔</span>'
        : '<span style="color:#dc2626">مرفوض ✖</span>';
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>${esc(f.form_number)}</title>
<style>
  body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;padding:24px;color:#1e293b}
  h1{font-size:20px;margin:0}
  .head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a365d;padding-bottom:12px;margin-bottom:16px}
  .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 24px;margin-bottom:16px;font-size:13px}
  .meta div span:first-child{color:#64748b}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{border:1px solid #cbd5e1;padding:7px 10px}
  th{background:#1a365d;color:#fff}
  tr:nth-child(even){background:#f8fafc}
  .overall{margin-top:16px;font-size:16px;font-weight:bold}
  .notes{margin-top:12px;font-size:13px;background:#f1f5f9;border-radius:8px;padding:10px}
  .sign{display:flex;justify-content:space-between;margin-top:48px;font-size:13px}
  .sign div{width:200px;text-align:center;border-top:1px solid #94a3b8;padding-top:6px}
  @media print{body{padding:8px}}
</style></head><body>
<div class="head">
  <div><h1>نموذج ${esc(tpl.label)}</h1><div style="color:#64748b;font-size:13px">مصنع أكياس البلاستيك الحديث - إدارة الجودة</div></div>
  <div style="text-align:left"><div style="font-weight:bold;font-size:15px">${esc(f.form_number)}</div><div style="font-size:12px;color:#64748b">${fmtDate(f.inspected_at)}</div></div>
</div>
<div class="meta">
  <div><span>أمر التشغيل: </span><b>${esc(f.production_order_number || "-")}</b></div>
  <div><span>المكينة: </span><b>${esc(f.machine_name_ar || f.machine_name || "-")}</b></div>
  <div><span>الوردية: </span><b>${esc(shiftLabel)}</b></div>
  <div><span>المشغل: </span><b>${esc(f.operator_name_ar || f.operator_name || "-")}</b></div>
  <div><span>المفتش: </span><b>${esc(f.inspector_name_ar || f.inspector_name || "-")}</b></div>
  <div><span>حجم العينة: </span><b>${esc(f.sample_size || "-")}</b></div>
</div>
<table>
  <thead><tr><th style="width:36px">#</th><th>بند الفحص</th><th style="width:110px">النتيجة</th><th style="width:220px">ملاحظات</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="overall">النتيجة النهائية: ${overall}</div>
${f.notes ? `<div class="notes"><b>ملاحظات عامة:</b> ${esc(f.notes)}</div>` : ""}
<div class="sign"><div>توقيع المفتش</div><div>توقيع مشرف الجودة</div><div>توقيع مدير الإنتاج</div></div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) {
      toast({ title: "يرجى السماح بالنوافذ المنبثقة للطباعة", variant: "destructive" });
      return;
    }
    w.document.write(html);
    w.document.close();
  };

  const userName = (u: any) => u.display_name_ar || u.display_name || u.username;

  return (
    <div className="space-y-4">
      {/* Template quick cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INSPECTION_TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          const count = forms.filter(
            (f) => f.template_type === tpl.type,
          ).length;
          return (
            <button
              key={tpl.type}
              type="button"
              disabled={!canAdd}
              onClick={() => {
                if (!canAdd) return;
                resetForm();
                setTemplateType(tpl.type);
                setDialogOpen(true);
              }}
              className={`rounded-xl border-2 p-4 text-right transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${tpl.color}`}
              data-testid={`button-new-inspection-${tpl.type}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-6 w-6" />
                <Badge variant="secondary">{count}</Badge>
              </div>
              <div className="font-bold text-sm">{tpl.label}</div>
              <div className="text-xs opacity-80 mt-1">{tpl.description}</div>
              {canAdd && (
                <div className="flex items-center gap-1 text-xs font-medium mt-2">
                  <Plus className="h-3.5 w-3.5" /> فحص جديد
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم النموذج، أمر التشغيل، المكينة..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pr-9"
            data-testid="input-search-inspections"
          />
        </div>
        <Select
          value={filterType || "all"}
          onValueChange={(v) => setFilterType(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[170px]" data-testid="select-filter-template">
            <SelectValue placeholder="نوع الفحص" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {INSPECTION_TEMPLATES.map((tpl) => (
              <SelectItem key={tpl.type} value={tpl.type}>
                {tpl.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterResult || "all"}
          onValueChange={(v) => setFilterResult(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[130px]" data-testid="select-filter-result">
            <SelectValue placeholder="النتيجة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل النتائج</SelectItem>
            <SelectItem value="pass">مقبول</SelectItem>
            <SelectItem value="fail">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              جارٍ التحميل...
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              لا توجد نماذج فحص بعد — اختر نوع الفحص من الأعلى لبدء نموذج جديد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم النموذج</TableHead>
                    <TableHead className="text-right">نوع الفحص</TableHead>
                    <TableHead className="text-right">أمر التشغيل</TableHead>
                    <TableHead className="text-right">المكينة</TableHead>
                    <TableHead className="text-right">المفتش</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">النتيجة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((f) => {
                    const tpl = getTemplate(f.template_type);
                    const failCount = (f.items || []).filter(
                      (it) => it.result === "fail",
                    ).length;
                    return (
                      <TableRow key={f.id} data-testid={`row-inspection-${f.id}`}>
                        <TableCell className="font-medium">
                          {f.form_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tpl.label}</Badge>
                        </TableCell>
                        <TableCell>{f.production_order_number || "-"}</TableCell>
                        <TableCell>
                          {f.machine_name_ar || f.machine_name || "-"}
                        </TableCell>
                        <TableCell>
                          {f.inspector_name_ar || f.inspector_name || "-"}
                        </TableCell>
                        <TableCell>{fmtDate(f.inspected_at)}</TableCell>
                        <TableCell>
                          {f.overall_result === "pass" ? (
                            <Badge className="bg-green-100 text-green-800">
                              مقبول
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              مرفوض ({failCount})
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handlePrint(f)}
                              data-testid={`button-print-inspection-${f.id}`}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(f)}
                                data-testid={`button-edit-inspection-${f.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => setDeleteId(f.id)}
                                data-testid={`button-delete-inspection-${f.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fill / edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editId ? "تعديل نموذج الفحص" : "نموذج فحص جديد"}
              {template ? ` — ${template.label}` : ""}
            </DialogTitle>
            <DialogDescription>
              عبّئ بيانات الفحص بالاختيار فقط — لا حاجة للكتابة إلا في الملاحظات
            </DialogDescription>
          </DialogHeader>

          {!template ? (
            <div className="grid grid-cols-2 gap-3 py-2">
              {INSPECTION_TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.type}
                    type="button"
                    onClick={() => setTemplateType(tpl.type)}
                    className={`rounded-xl border-2 p-4 text-right hover:shadow-md transition ${tpl.color}`}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <div className="font-bold text-sm">{tpl.label}</div>
                    <div className="text-xs opacity-80">{tpl.description}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-5">
              {/* header selections */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>أمر التشغيل (اختياري)</Label>
                  <SearchableSelect
                    value={productionOrderId}
                    onValueChange={setProductionOrderId}
                    options={prodOrders.map((po: any) => ({
                      value: String(po.id),
                      label: po.production_order_number || `PO-${po.id}`,
                    }))}
                    placeholder="اختر أمر التشغيل"
                    emptyText="لا توجد أوامر"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>المكينة</Label>
                  <SearchableSelect
                    value={machineId}
                    onValueChange={setMachineId}
                    options={machinesList.map((m: any) => ({
                      value: String(m.id),
                      label: m.name_ar || m.name || m.id,
                    }))}
                    placeholder="اختر المكينة"
                    emptyText="لا توجد مكائن"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>الوردية</Label>
                  <Select value={shift} onValueChange={setShift}>
                    <SelectTrigger data-testid="select-shift">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIFT_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>المشغل</Label>
                  <SearchableSelect
                    value={operatorId}
                    onValueChange={setOperatorId}
                    options={usersList.map((u: any) => ({
                      value: String(u.id),
                      label: userName(u),
                    }))}
                    placeholder="اختر المشغل"
                    emptyText="لا يوجد مستخدمون"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>المفتش</Label>
                  <SearchableSelect
                    value={inspectorId}
                    onValueChange={setInspectorId}
                    options={usersList.map((u: any) => ({
                      value: String(u.id),
                      label: userName(u),
                    }))}
                    placeholder="اختر المفتش"
                    emptyText="لا يوجد مستخدمون"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>حجم العينة</Label>
                  <Select value={sampleSize} onValueChange={setSampleSize}>
                    <SelectTrigger data-testid="select-sample-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} عينات
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base">بنود الفحص</Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {answeredCount}/{template.items.length}
                    </span>
                    <button
                      type="button"
                      className="text-green-700 font-medium hover:underline"
                      onClick={() => {
                        const all: Record<string, ItemResult> = {};
                        template.items.forEach((it) => {
                          all[it.key] = "pass";
                        });
                        setResults(all);
                      }}
                      data-testid="button-mark-all-pass"
                    >
                      تحديد الكل مطابق
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {template.items.map((it, idx) => {
                    const current = results[it.key];
                    return (
                      <div
                        key={it.key}
                        className={`rounded-lg border p-3 ${
                          current === "fail"
                            ? "border-red-300 bg-red-50/50"
                            : current === "pass"
                              ? "border-green-200 bg-green-50/40"
                              : "bg-muted/30"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-medium">
                            <span className="text-muted-foreground ml-1">
                              {idx + 1}.
                            </span>
                            {it.label}
                          </div>
                          <div className="flex gap-1.5">
                            {(Object.keys(RESULT_META) as ItemResult[]).map(
                              (r) => {
                                const meta = RESULT_META[r];
                                const Icon = meta.icon;
                                const active = current === r;
                                return (
                                  <button
                                    key={r}
                                    type="button"
                                    onClick={() =>
                                      setResults((prev) => ({
                                        ...prev,
                                        [it.key]: r,
                                      }))
                                    }
                                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                                      active
                                        ? meta.active
                                        : "bg-background hover:bg-muted"
                                    }`}
                                    data-testid={`button-item-${it.key}-${r}`}
                                  >
                                    <Icon className="h-3.5 w-3.5" />
                                    {meta.label}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                        {current === "fail" && (
                          <Input
                            className="mt-2 h-8 text-xs"
                            placeholder="وصف مختصر للمشكلة (اختياري)"
                            value={itemNotes[it.key] || ""}
                            onChange={(e) =>
                              setItemNotes((prev) => ({
                                ...prev,
                                [it.key]: e.target.value,
                              }))
                            }
                            data-testid={`input-note-${it.key}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>ملاحظات عامة (اختياري)</Label>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  data-testid="textarea-general-notes"
                />
              </div>

              {/* summary + actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    النتيجة النهائية:
                  </span>
                  {overallResult === "pass" ? (
                    <Badge className="bg-green-100 text-green-800 text-sm">
                      مقبول ✔
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 text-sm">
                      مرفوض ✖
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {!editId && (
                    <Button
                      variant="outline"
                      onClick={() => setTemplateType("")}
                    >
                      تغيير النوع
                    </Button>
                  )}
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={!allAnswered || saveMutation.isPending}
                    data-testid="button-save-inspection"
                  >
                    {saveMutation.isPending
                      ? "جارٍ الحفظ..."
                      : editId
                        ? "حفظ التعديلات"
                        : "حفظ النموذج"}
                  </Button>
                </div>
              </div>
              {!allAnswered && (
                <p className="text-xs text-amber-600">
                  يجب تحديد نتيجة لجميع البنود قبل الحفظ
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <Dialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف نموذج الفحص</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا النموذج؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-inspection"
            >
              {deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
