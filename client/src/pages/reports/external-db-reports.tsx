import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Printer,
  Download,
  Play,
  FileText,
  Receipt,
  FileSpreadsheet,
  Eye,
} from "lucide-react";
import { useState } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { useCompanyLogo } from "../../hooks/use-company-logo";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";

export interface ExternalConnection {
  id: number;
  name: string;
  database_name: string;
  is_active: boolean;
}

interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
}

type TemplateType = "table" | "account_statement" | "sales_invoice";

interface ReportDef {
  id: number;
  connection_id: number;
  name: string;
  template_type: TemplateType;
  title_ar: string | null;
  sql_text: string;
  column_mapping: Record<string, string> | null;
  header_info: Record<string, string> | null;
  created_at: string | null;
}

// Template field metadata: which mapped columns + header fields each layout uses.
const TEMPLATE_META: Record<
  TemplateType,
  {
    label: string;
    icon: typeof FileText;
    fields: { key: string; label: string; numeric?: boolean }[];
    header: { key: string; label: string }[];
  }
> = {
  table: {
    label: "جدول عام",
    icon: FileSpreadsheet,
    fields: [],
    header: [],
  },
  account_statement: {
    label: "كشف حساب",
    icon: FileText,
    fields: [
      { key: "date", label: "التاريخ" },
      { key: "reference", label: "المستند / المرجع" },
      { key: "description", label: "البيان" },
      { key: "debit", label: "مدين", numeric: true },
      { key: "credit", label: "دائن", numeric: true },
      { key: "balance", label: "الرصيد", numeric: true },
    ],
    header: [
      { key: "account_name", label: "اسم الحساب / العميل" },
      { key: "account_number", label: "رقم الحساب" },
      { key: "period_from", label: "من تاريخ" },
      { key: "period_to", label: "إلى تاريخ" },
    ],
  },
  sales_invoice: {
    label: "فاتورة مبيعات",
    icon: Receipt,
    fields: [
      { key: "description", label: "الصنف / البيان" },
      { key: "quantity", label: "الكمية", numeric: true },
      { key: "unit_price", label: "سعر الوحدة", numeric: true },
      { key: "total", label: "الإجمالي", numeric: true },
    ],
    header: [
      { key: "customer_name", label: "اسم العميل" },
      { key: "customer_tax", label: "الرقم الضريبي للعميل" },
      { key: "invoice_number", label: "رقم الفاتورة" },
      { key: "invoice_date", label: "تاريخ الفاتورة" },
      { key: "tax_rate", label: "نسبة الضريبة %" },
    ],
  },
};

const NO_COL = "__none__";

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cellText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

// Parse a numeric value out of a possibly formatted cell (strip currency/commas).
function parseNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^\d.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Build the formatted report body HTML (shared by print + PDF).
function renderReportInner(
  report: ReportDef,
  result: QueryResult,
  logoUrl: string,
): string {
  const meta = TEMPLATE_META[report.template_type];
  const mapping = report.column_mapping || {};
  const header = report.header_info || {};
  const title =
    report.title_ar?.trim() ||
    (report.template_type === "account_statement"
      ? "كشف حساب"
      : report.template_type === "sales_invoice"
        ? "فاتورة مبيعات"
        : report.name);

  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="logo" style="height:64px;max-width:200px;object-fit:contain" crossorigin="anonymous" />`
    : "";

  const now = new Date().toLocaleString("ar");

  // Header info block (account/customer details)
  let headerInfoHtml = "";
  if (report.template_type !== "table") {
    const items = meta.header
      .filter((h) => h.key !== "tax_rate" && (header[h.key] || "").trim())
      .map(
        (h) =>
          `<div style="display:flex;gap:6px"><span style="color:#555;font-weight:600">${escapeHtml(
            h.label,
          )}:</span><span>${escapeHtml(header[h.key] || "")}</span></div>`,
      )
      .join("");
    if (items) {
      headerInfoHtml = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;font-size:13px">${items}</div>`;
    }
  }

  // Table + totals
  let tableHtml = "";
  let totalsHtml = "";

  if (report.template_type === "table") {
    const head = result.columns
      .map((c) => `<th>${escapeHtml(c)}</th>`)
      .join("");
    const body = result.rows
      .map(
        (r) =>
          `<tr>${result.columns
            .map((c) => `<td>${escapeHtml(cellText(r[c]))}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    tableHtml = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  } else {
    const cols = meta.fields.filter((f) => mapping[f.key] && mapping[f.key] !== NO_COL);
    const head = cols.map((f) => `<th>${escapeHtml(f.label)}</th>`).join("");
    const body = result.rows
      .map((r) => {
        const tds = cols
          .map((f) => {
            const raw = r[mapping[f.key]];
            const text = f.numeric ? fmtNum(parseNum(raw)) : cellText(raw);
            const align = f.numeric ? "left" : "right";
            return `<td style="text-align:${align}">${escapeHtml(text)}</td>`;
          })
          .join("");
        return `<tr>${tds}</tr>`;
      })
      .join("");
    tableHtml = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;

    // Totals
    const totalRows: { label: string; value: string; strong?: boolean }[] = [];
    if (report.template_type === "account_statement") {
      const debitCol = mapping.debit;
      const creditCol = mapping.credit;
      const balanceCol = mapping.balance;
      const totalDebit = debitCol
        ? result.rows.reduce((s, r) => s + parseNum(r[debitCol]), 0)
        : 0;
      const totalCredit = creditCol
        ? result.rows.reduce((s, r) => s + parseNum(r[creditCol]), 0)
        : 0;
      if (debitCol)
        totalRows.push({ label: "إجمالي المدين", value: fmtNum(totalDebit) });
      if (creditCol)
        totalRows.push({ label: "إجمالي الدائن", value: fmtNum(totalCredit) });
      let closing = totalDebit - totalCredit;
      if (balanceCol && result.rows.length > 0) {
        closing = parseNum(result.rows[result.rows.length - 1][balanceCol]);
      }
      totalRows.push({
        label: "الرصيد الختامي",
        value: fmtNum(closing),
        strong: true,
      });
    } else if (report.template_type === "sales_invoice") {
      const totalCol = mapping.total;
      const qtyCol = mapping.quantity;
      const priceCol = mapping.unit_price;
      let subtotal = 0;
      if (totalCol) {
        subtotal = result.rows.reduce((s, r) => s + parseNum(r[totalCol]), 0);
      } else if (qtyCol && priceCol) {
        subtotal = result.rows.reduce(
          (s, r) => s + parseNum(r[qtyCol]) * parseNum(r[priceCol]),
          0,
        );
      }
      const taxRate = parseNum(header.tax_rate) || 15;
      const tax = (subtotal * taxRate) / 100;
      const grand = subtotal + tax;
      totalRows.push({ label: "المجموع الفرعي", value: fmtNum(subtotal) });
      totalRows.push({
        label: `ضريبة القيمة المضافة (${taxRate}%)`,
        value: fmtNum(tax),
      });
      totalRows.push({
        label: "الإجمالي المستحق",
        value: fmtNum(grand),
        strong: true,
      });
    }

    if (totalRows.length) {
      const rows = totalRows
        .map(
          (t) =>
            `<tr style="${t.strong ? "font-weight:700;font-size:15px;background:#f0fdf4" : ""}"><td style="padding:6px 12px;text-align:right">${escapeHtml(
              t.label,
            )}</td><td style="padding:6px 12px;text-align:left;font-variant-numeric:tabular-nums">${escapeHtml(
              t.value,
            )}</td></tr>`,
        )
        .join("");
      totalsHtml = `<div style="display:flex;justify-content:flex-start;margin-top:16px"><table style="min-width:280px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">${rows}</table></div>`;
    }
  }

  return `
    <div style="font-family:Cairo,'Segoe UI',system-ui,sans-serif;color:#111;direction:rtl;padding:8px">
      <style>
        .rpt-table{border-collapse:collapse;width:100%;font-size:12px;margin-top:8px}
        .rpt-table th,.rpt-table td{border:1px solid #d1d5db;padding:6px 8px;text-align:right}
        .rpt-table th{background:#1e3a8a;color:#fff;font-weight:600}
        .rpt-table tbody tr:nth-child(even) td{background:#f8fafc}
      </style>
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1e3a8a;padding-bottom:12px;margin-bottom:8px">
        <div>
          <h1 style="margin:0;font-size:22px;color:#1e3a8a">${escapeHtml(title)}</h1>
          <div style="color:#666;font-size:12px;margin-top:4px">${escapeHtml(now)}</div>
        </div>
        <div>${logoBlock}</div>
      </div>
      ${headerInfoHtml}
      ${tableHtml.replace("<table>", '<table class="rpt-table">')}
      ${totalsHtml}
      <div style="margin-top:24px;color:#9ca3af;font-size:11px;text-align:center;border-top:1px solid #e5e7eb;padding-top:8px">
        تم إنشاء هذا التقرير آلياً من نظام MPBF — عدد الصفوف: ${result.rowCount}${
          result.truncated ? " (مقيّد بـ 1000)" : ""
        }
      </div>
    </div>`;
}

function printReport(report: ReportDef, result: QueryResult, logoUrl: string) {
  const inner = renderReportInner(report, result, logoUrl);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(
    report.title_ar || report.name,
  )}</title></head><body style="margin:24px">${inner}<script>window.onload=function(){setTimeout(function(){window.print();},300);}</script></body></html>`);
  win.document.close();
}

async function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

async function exportReportPdf(
  report: ReportDef,
  result: QueryResult,
  logoUrl: string,
) {
  const [{ default: jsPDF }, html2canvasMod] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const html2canvas = html2canvasMod.default;
  const inner = renderReportInner(report, result, logoUrl);
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.background = "#fff";
  container.setAttribute("dir", "rtl");
  container.innerHTML = inner;
  document.body.appendChild(container);
  try {
    await waitForImages(container);
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const img = canvas.toDataURL("image/png");
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(img, "PNG", 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(img, "PNG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    const safeName = (report.title_ar || report.name || "report").replace(
      /[\\/:*?"<>|]/g,
      "_",
    );
    pdf.save(`${safeName}-${Date.now()}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

export function ExternalDbReportsTab({
  connections,
}: {
  connections: ExternalConnection[];
}) {
  const { toast } = useToast();
  const { logoUrl } = useCompanyLogo();

  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<ReportDef | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [exportingId, setExportingId] = useState<number | null>(null);

  const { data: reports = [], isLoading } = useQuery<ReportDef[]>({
    queryKey: ["/api/external-db/reports"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/external-db/reports/${id}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-db/reports"] });
      toast({ title: "تم حذف التقرير" });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({
        title: "خطأ",
        description: err?.message || "تعذر حذف التقرير",
        variant: "destructive",
      });
    },
  });

  const runReport = async (
    report: ReportDef,
    action: "print" | "pdf",
  ) => {
    const setBusy = action === "pdf" ? setExportingId : setRunningId;
    setBusy(report.id);
    try {
      const res = await apiRequest(
        `/api/external-db/reports/${report.id}/run`,
        { method: "POST", timeout: 60000 },
      );
      const data = (await res.json()) as {
        report: ReportDef;
        result: QueryResult;
      };
      if (!data.result || data.result.rows.length === 0) {
        toast({
          title: "لا توجد بيانات",
          description: "لم يُرجع الاستعلام أي صفوف لطباعتها",
          variant: "destructive",
        });
        return;
      }
      if (action === "print") {
        printReport(report, data.result, logoUrl);
      } else {
        await exportReportPdf(report, data.result, logoUrl);
        toast({ title: "تم تصدير ملف PDF" });
      }
    } catch (err: any) {
      toast({
        title: "تعذر تشغيل التقرير",
        description: err?.message || "حدث خطأ أثناء تنفيذ الاستعلام",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const connName = (id: number) =>
    connections.find((c) => c.id === id)?.name || `#${id}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          احفظ استعلامات بصيغة قوالب جاهزة للطباعة (كشف حساب / فاتورة مبيعات)
          بترويسة الشركة والشعار والإجماليات.
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setBuilderOpen(true);
          }}
          disabled={connections.filter((c) => c.is_active).length === 0}
        >
          <Plus className="h-4 w-4 ml-2" /> تقرير جديد
        </Button>
      </div>

      {connections.filter((c) => c.is_active).length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            أضف اتصالاً نشطاً أولاً من تبويب «الاتصالات» لإنشاء التقارير.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            لا توجد تقارير محفوظة بعد. أنشئ تقريراً للبدء.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((r) => {
            const meta = TEMPLATE_META[r.template_type];
            const Icon = meta.icon;
            return (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="h-4 w-4 text-indigo-600" />
                      {r.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(r);
                          setBuilderOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(r.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{meta.label}</Badge>
                    <span>{connName(r.connection_id)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre
                    dir="ltr"
                    className="text-[11px] bg-muted/50 rounded p-2 max-h-20 overflow-auto whitespace-pre-wrap"
                  >
                    {r.sql_text}
                  </pre>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => runReport(r, "print")}
                      disabled={runningId === r.id}
                    >
                      {runningId === r.id ? (
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4 ml-2" />
                      )}
                      طباعة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runReport(r, "pdf")}
                      disabled={exportingId === r.id}
                    >
                      {exportingId === r.id ? (
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 ml-2" />
                      )}
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {builderOpen && (
        <ReportBuilderDialog
          open={builderOpen}
          onOpenChange={setBuilderOpen}
          connections={connections}
          editing={editing}
          logoUrl={logoUrl}
        />
      )}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التقرير؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف تعريف هذا التقرير نهائياً. لا يؤثر ذلك على قاعدة البيانات
              الخارجية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReportBuilderDialog({
  open,
  onOpenChange,
  connections,
  editing,
  logoUrl,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  connections: ExternalConnection[];
  editing: ReportDef | null;
  logoUrl: string;
}) {
  const { toast } = useToast();

  const [name, setName] = useState(editing?.name || "");
  const [connectionId, setConnectionId] = useState<number | null>(
    editing?.connection_id ?? null,
  );
  const [templateType, setTemplateType] = useState<TemplateType>(
    editing?.template_type || "account_statement",
  );
  const [titleAr, setTitleAr] = useState(editing?.title_ar || "");
  const [sqlText, setSqlText] = useState(editing?.sql_text || "");
  const [mapping, setMapping] = useState<Record<string, string>>(
    editing?.column_mapping || {},
  );
  const [headerInfo, setHeaderInfo] = useState<Record<string, string>>(
    editing?.header_info || {},
  );
  const [preview, setPreview] = useState<QueryResult | null>(null);

  const meta = TEMPLATE_META[templateType];

  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!connectionId) throw new Error("اختر اتصالاً أولاً");
      const res = await apiRequest(
        `/api/external-db/connections/${connectionId}/query`,
        { method: "POST", body: JSON.stringify({ sql: sqlText }), timeout: 60000 },
      );
      return res.json() as Promise<QueryResult>;
    },
    onSuccess: (data) => {
      setPreview(data);
      toast({
        title: "تم جلب الأعمدة",
        description: `${data.columns.length} عمود — ${data.rowCount} صف`,
      });
    },
    onError: (err: any) => {
      setPreview(null);
      toast({
        title: "خطأ في الاستعلام",
        description: err?.message || "تعذر تنفيذ الاستعلام",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        connection_id: connectionId,
        name,
        template_type: templateType,
        title_ar: titleAr || null,
        sql_text: sqlText,
        column_mapping: templateType === "table" ? null : mapping,
        header_info: templateType === "table" ? null : headerInfo,
      };
      const url = editing
        ? `/api/external-db/reports/${editing.id}`
        : "/api/external-db/reports";
      const res = await apiRequest(url, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-db/reports"] });
      toast({ title: editing ? "تم تحديث التقرير" : "تم حفظ التقرير" });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "خطأ",
        description: err?.message || "تعذر حفظ التقرير",
        variant: "destructive",
      });
    },
  });

  const previewColumns = preview?.columns || [];
  const canPreviewReport =
    !!preview && preview.rows.length > 0;

  const doPreviewReport = (action: "print" | "pdf") => {
    if (!preview) return;
    const reportDef: ReportDef = {
      id: editing?.id ?? -1,
      connection_id: connectionId ?? 0,
      name: name || "تقرير",
      template_type: templateType,
      title_ar: titleAr || null,
      sql_text: sqlText,
      column_mapping: templateType === "table" ? null : mapping,
      header_info: templateType === "table" ? null : headerInfo,
      created_at: null,
    };
    if (action === "print") printReport(reportDef, preview, logoUrl);
    else exportReportPdf(reportDef, preview, logoUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>
            {editing ? "تعديل التقرير" : "تقرير جديد"}
          </DialogTitle>
          <DialogDescription>
            عرّف الاستعلام واربط أعمدته بحقول القالب، ثم احفظه للطباعة لاحقاً.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>اسم التقرير</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="كشف حساب العملاء"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>الاتصال</Label>
              <Select
                value={connectionId ? String(connectionId) : undefined}
                onValueChange={(v) => setConnectionId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر اتصالاً" />
                </SelectTrigger>
                <SelectContent>
                  {connections
                    .filter((c) => c.is_active)
                    .map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>نوع القالب</Label>
              <Select
                value={templateType}
                onValueChange={(v) => {
                  setTemplateType(v as TemplateType);
                  setMapping({});
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(TEMPLATE_META) as TemplateType[]
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TEMPLATE_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>عنوان التقرير (يظهر في الترويسة)</Label>
              <Input
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={meta.label}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>استعلام SELECT (للقراءة فقط)</Label>
            <Textarea
              dir="ltr"
              className="font-mono text-sm min-h-[120px]"
              placeholder="SELECT TOP 100 * FROM [dbo].[Ledger]"
              value={sqlText}
              onChange={(e) => setSqlText(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => previewMutation.mutate()}
              disabled={
                !connectionId || !sqlText.trim() || previewMutation.isPending
              }
            >
              {previewMutation.isPending ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 ml-2" />
              )}
              تشغيل لجلب الأعمدة
            </Button>
          </div>

          {templateType !== "table" && (
            <div className="space-y-4 rounded-lg border p-3">
              <div>
                <Label className="text-sm font-semibold">
                  ربط الأعمدة بحقول القالب
                </Label>
                {previewColumns.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    شغّل الاستعلام أولاً لعرض أعمدة النتيجة.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {meta.fields.map((f) => (
                    <div key={f.key} className="grid gap-1.5">
                      <Label className="text-xs">
                        {f.label}
                        {f.numeric && (
                          <span className="text-muted-foreground"> (رقمي)</span>
                        )}
                      </Label>
                      <Select
                        value={mapping[f.key] || NO_COL}
                        onValueChange={(v) =>
                          setMapping((m) => ({
                            ...m,
                            [f.key]: v === NO_COL ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="— بدون —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_COL}>— بدون —</SelectItem>
                          {previewColumns.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">
                  معلومات الترويسة
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {meta.header.map((h) => (
                    <div key={h.key} className="grid gap-1.5">
                      <Label className="text-xs">{h.label}</Label>
                      <Input
                        className="h-8 text-xs"
                        value={headerInfo[h.key] || ""}
                        onChange={(e) =>
                          setHeaderInfo((hi) => ({
                            ...hi,
                            [h.key]: e.target.value,
                          }))
                        }
                        placeholder={
                          h.key === "tax_rate" ? "15" : ""
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {preview && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4" /> معاينة ({preview.rowCount} صف)
                </Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => doPreviewReport("print")}
                    disabled={!canPreviewReport}
                  >
                    <Printer className="h-4 w-4 ml-2" /> طباعة المعاينة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => doPreviewReport("pdf")}
                    disabled={!canPreviewReport}
                  >
                    <Download className="h-4 w-4 ml-2" /> PDF
                  </Button>
                </div>
              </div>
              <div className="max-h-40 overflow-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      {preview.columns.map((c) => (
                        <th
                          key={c}
                          className="text-right p-1 border whitespace-nowrap"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="even:bg-muted/30">
                        {preview.columns.map((c) => (
                          <td
                            key={c}
                            className="p-1 border whitespace-nowrap max-w-[200px] truncate"
                          >
                            {cellText(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={
              saveMutation.isPending ||
              !name.trim() ||
              !connectionId ||
              !sqlText.trim()
            }
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            ) : null}
            حفظ التقرير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
