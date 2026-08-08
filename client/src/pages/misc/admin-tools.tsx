import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  Bot,
  CalendarDays,
  ChevronsUpDown,
  ClipboardList,
  Calculator,
  FileSignature,
  FileText,
  Plus,
  Printer,
  Trash2,
  Edit,
  FilePlus,
  FolderOpen,
  PenLine,
  RotateCcw,
  Save,
  Search,
  Truck,
  Upload,
  Users2,
  Package,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { Calendar } from "../../components/ui/calendar";
import { Checkbox } from "../../components/ui/checkbox";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "../../components/ui/searchable-select";
import { formatNumberAr } from "../../../../shared/number-utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
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
import { useAuth } from "../../hooks/use-auth";
import { useCompanyLogo } from "../../hooks/use-company-logo";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { userHasPermission } from "../../utils/roleUtils";
import ModernAgent from "../agent/modern-agent";

type Customer = {
  id: string;
  name: string;
  name_ar?: string | null;
  phone?: string | null;
  city?: string | null;
};

type RollRow = {
  id: string;
  description: string;
  quantity: string;
  weight: string;
  notes: string;
};

type ReportSection = { id: string; heading: string; body: string };
type ReportTableRow = { id: string; col1: string; col2: string; col3: string };
type AgendaItem = { id: string; topic: string; discussion: string };
type ActionItem = { id: string; task: string; owner: string; due: string };
type AssetItem = {
  id: string;
  name: string;
  serial: string;
  qty: string;
  condition: string;
};

type DeliveryStop = {
  id: string;
  customerId: string;
  customerName: string;
  contactPhone: string;
  inChargeName: string;
  notes: string;
  imageDataUrl: string;
  zone: number; // 1..TRUCK_ZONES
};

const TRUCK_ZONES = 8;
const ZONE_COLORS = [
  "#fca5a5",
  "#fcd34d",
  "#86efac",
  "#7dd3fc",
  "#c4b5fd",
  "#f9a8d4",
  "#fdba74",
  "#a3e635",
];

const uid = () => Math.random().toString(36).slice(2, 10);

type CustomerPick = { id: string; name: string };

function CustomerCombobox({
  value,
  customers,
  onChange,
  placeholder = "اختر العميل",
  testId,
}: {
  value: CustomerPick;
  customers: Customer[];
  onChange: (v: CustomerPick) => void;
  placeholder?: string;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualText, setManualText] = useState("");

  const isManualValue = !!value.name && !value.id;
  const display = value.name
    ? value.id
      ? `${value.name} (${value.id})`
      : `${value.name} — اسم يدوي`
    : "";

  const commitManual = () => {
    const t = manualText.trim();
    if (!t) return;
    onChange({ id: "", name: t });
    setManual(false);
    setManualText("");
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setManual(isManualValue);
          setManualText(isManualValue ? value.name : "");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          data-testid={testId}
        >
          <span className={`truncate ${display ? "" : "text-muted-foreground"}`}>
            {display || placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0"
        align="start"
        onOpenAutoFocus={(e) => {
          if (manual) e.preventDefault();
        }}
      >
        {!manual ? (
          <Command
            filter={(itemValue, search) => {
              const s = search.trim().toLowerCase();
              if (!s) return 1;
              return itemValue.toLowerCase().includes(s) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="ابحث بالاسم أو الكود..." />
            <CommandList>
              <CommandEmpty>
                <div className="p-3 text-sm text-muted-foreground text-center">
                  لا يوجد عميل مطابق
                </div>
              </CommandEmpty>
              <CommandGroup>
                {customers.map((c) => {
                  const label = c.name_ar || c.name;
                  const filterText = `${c.name_ar || ""} ${c.name || ""} ${c.id}`;
                  const isSel = value.id === c.id;
                  return (
                    <CommandItem
                      key={c.id}
                      value={filterText}
                      onSelect={() => {
                        onChange({ id: c.id, name: label });
                        setOpen(false);
                      }}
                      className={isSel ? "bg-accent" : ""}
                    >
                      <span className="truncate">{label}</span>
                      <span className="ms-auto text-xs text-muted-foreground">
                        {c.id}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setManual(true);
                  setManualText(isManualValue ? value.name : "");
                }}
              >
                <PenLine className="h-4 w-4 me-2" />
                إدخال اسم يدوي (شخص أو مؤسسة)
              </Button>
            </div>
          </Command>
        ) : (
          <div className="p-3 space-y-2">
            <Label className="text-xs">اسم شخص أو مؤسسة</Label>
            <Input
              autoFocus
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="اكتب الاسم يدوياً"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitManual();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1"
                onClick={commitManual}
                disabled={!manualText.trim()}
              >
                حفظ
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setManual(false);
                  setManualText("");
                }}
              >
                <Search className="h-4 w-4 me-1" /> القائمة
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

const todayISO = () => new Date().toISOString().slice(0, 10);

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printRef(
  el: HTMLElement | null,
  title: string,
  dir: "rtl" | "ltr" = "rtl",
  lang: string = "ar",
) {
  if (!el) return;
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  const safeTitle = escapeHtml(title);
  const styles = `
    @page { size: A4; margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #111; margin: 0; padding: 16px; }
    .doc { max-width: 800px; margin: 0 auto; }
    .doc-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
    .doc-header img { max-height: 64px; }
    .doc-title { font-size: 20px; font-weight: 700; text-align: center; margin: 0 0 4px; }
    .doc-subtitle { font-size: 12px; color: #555; text-align: center; margin: 0; }
    .doc-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; font-size: 13px; margin-bottom: 16px; }
    .doc-meta div { display: flex; gap: 6px; }
    .doc-meta b { color: #333; }
    h2.section { font-size: 15px; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #999; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
    th, td { border: 1px solid #999; padding: 6px 8px; text-align: start; vertical-align: top; }
    th { background: #f3f4f6; font-weight: 600; }
    .body-text { white-space: pre-wrap; font-size: 13px; line-height: 1.7; }
    .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
    .sig { text-align: center; font-size: 12px; }
    .sig-line { margin: 36px 12px 6px; border-top: 1px solid #111; }
    .disclaimer { background: #fff7ed; border: 1px solid #fdba74; padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.7; white-space: pre-wrap; }
    .footer { margin-top: 32px; font-size: 11px; color: #666; text-align: center; border-top: 1px dashed #999; padding-top: 8px; }
    @media print { .no-print { display: none !important; } }
  `;
  w.document.write(`<!doctype html><html dir="${dir}" lang="${lang}"><head><meta charset="utf-8"><title>${safeTitle}</title><style>${styles}</style></head><body>${el.outerHTML}</body></html>`);
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 250);
}

function DocHeader({
  logoUrl,
  title,
  subtitle,
}: {
  logoUrl: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="doc-header">
      <img src={logoUrl} alt="logo" />
      <div style={{ flex: 1 }}>
        <h1 className="doc-title">{title}</h1>
        {subtitle && <p className="doc-subtitle">{subtitle}</p>}
      </div>
      <div style={{ width: 64 }} />
    </div>
  );
}

function SignatureBlock({
  labels,
}: {
  labels: { label: string; name?: string }[];
}) {
  return (
    <div className="signatures">
      {labels.map((l, i) => (
        <div key={i} className="sig">
          <div className="sig-line" />
          <div>{l.label}</div>
          {l.name && <div style={{ marginTop: 4, fontWeight: 600 }}>{l.name}</div>}
        </div>
      ))}
    </div>
  );
}

// ============== Shared Admin Tool Documents (save/list/edit/delete) ==============

type AdminDocType =
  | "delivery_disclaimer"
  | "admin_order"
  | "custom_report"
  | "meeting_minutes"
  | "asset_handover"
  | "salary_calc"
  | "violation_notice"
  | "cash_voucher";

type SavedAdminDoc<T = any> = {
  id: number;
  doc_type: AdminDocType;
  reference: string;
  title: string | null;
  data: T;
  created_at: string;
  updated_at: string;
};

function useAdminDocs<T>(opts: {
  docType: AdminDocType;
  getPayload: () => { reference: string; title: string; data: T };
  applyDoc: (data: T, reference: string, title: string) => void;
  resetForm: () => void;
}) {
  const { docType, getPayload, applyDoc, resetForm } = opts;
  const { toast } = useToast();
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const queryKey = ["/api/admin-tool-docs", { type: docType }];
  const {
    data: resp,
    isLoading,
    isError,
  } = useQuery<{ data: SavedAdminDoc<T>[] }>({
    queryKey,
    queryFn: async () => {
      const r = await fetch(
        `/api/admin-tool-docs?type=${encodeURIComponent(docType)}`,
        { credentials: "include" },
      );
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    staleTime: 30 * 1000,
  });
  const docs = resp?.data || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...getPayload(), doc_type: docType };
      const res = await apiRequest(
        currentId
          ? `/api/admin-tool-docs/${currentId}`
          : "/api/admin-tool-docs",
        {
          method: currentId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      return (await res.json()) as SavedAdminDoc<T>;
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey });
      if (saved && typeof saved.id === "number") setCurrentId(saved.id);
      toast({
        title: "تم الحفظ",
        description: currentId ? "تم تحديث المستند" : "تم حفظ المستند",
      });
    },
    onError: (err: any) => {
      toast({
        title: "خطأ",
        description: err?.message || "تعذر الحفظ",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin-tool-docs/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey });
      if (currentId === id) {
        setCurrentId(null);
        resetForm();
      }
      toast({ title: "تم الحذف" });
    },
    onError: (err: any) => {
      toast({
        title: "خطأ",
        description: err?.message || "تعذر الحذف",
        variant: "destructive",
      });
    },
  });

  const loadDoc = (d: SavedAdminDoc<T>) => {
    setCurrentId(d.id);
    applyDoc(d.data, d.reference, d.title || "");
    toast({ title: "تم التحميل", description: `تم تحميل ${d.reference}` });
  };

  const handleNew = () => {
    setCurrentId(null);
    resetForm();
  };

  return {
    docs,
    isLoading,
    isError,
    currentId,
    setCurrentId,
    saveMutation,
    deleteMutation,
    loadDoc,
    handleNew,
    pendingDeleteId,
    setPendingDeleteId,
  };
}

function AdminDocsPanel<T>({
  label,
  ctx,
}: {
  label: string;
  ctx: ReturnType<typeof useAdminDocs<T>>;
}) {
  const {
    docs,
    isLoading,
    isError,
    currentId,
    loadDoc,
    handleNew,
    setPendingDeleteId,
  } = ctx;
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            {label} ({docs.length})
          </Label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNew}
            data-testid={`btn-new-${label}`}
          >
            <FilePlus className="h-4 w-4 me-1" /> جديد
          </Button>
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            جاري التحميل...
          </p>
        ) : isError ? (
          <p className="text-sm text-red-600 text-center py-4">
            تعذر تحميل المستندات المحفوظة
          </p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد مستندات محفوظة بعد
          </p>
        ) : (
          <div className="border rounded-md overflow-x-auto max-h-56 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="p-2 text-start">المرجع</th>
                  <th className="p-2 text-start">العنوان</th>
                  <th className="p-2 text-start">آخر تحديث</th>
                  <th className="p-2 text-center w-28">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const isCurrent = currentId === d.id;
                  return (
                    <tr
                      key={d.id}
                      className={`border-t ${isCurrent ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                    >
                      <td className="p-2 font-medium">
                        {d.reference}
                        {isCurrent && (
                          <span className="ms-2 text-xs text-blue-600">
                            (قيد التعديل)
                          </span>
                        )}
                      </td>
                      <td className="p-2">{d.title || "-"}</td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {new Date(d.updated_at).toLocaleString("ar")}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => loadDoc(d)}
                            aria-label="تعديل"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setPendingDeleteId(d.id)}
                            aria-label="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminDocsActions<T>({
  ctx,
  onPrint,
  onPrintEn,
  onValidate,
}: {
  ctx: ReturnType<typeof useAdminDocs<T>>;
  onPrint: () => void;
  onPrintEn?: () => void;
  onValidate?: () => string | null;
}) {
  const { saveMutation, currentId, handleNew } = ctx;
  const handleSave = () => {
    if (onValidate) {
      const err = onValidate();
      if (err) {
        return;
      }
    }
    saveMutation.mutate();
  };
  return (
    <div className="flex justify-end gap-2 flex-wrap">
      <Button variant="outline" onClick={handleNew}>
        <FilePlus className="h-4 w-4 me-2" /> جديد
      </Button>
      <Button
        variant="default"
        onClick={handleSave}
        disabled={saveMutation.isPending}
      >
        <Save className="h-4 w-4 me-2" />
        {saveMutation.isPending
          ? "جاري الحفظ..."
          : currentId
            ? "حفظ التعديلات"
            : "حفظ"}
      </Button>
      <Button onClick={onPrint}>
        <Printer className="h-4 w-4 me-2" /> طباعة A4
      </Button>
      {onPrintEn && (
        <Button variant="secondary" onClick={onPrintEn}>
          <Printer className="h-4 w-4 me-2" /> Print A4 EN
        </Button>
      )}
    </div>
  );
}

function AdminDocsDeleteDialog<T>({
  ctx,
}: {
  ctx: ReturnType<typeof useAdminDocs<T>>;
}) {
  const { pendingDeleteId, setPendingDeleteId, deleteMutation } = ctx;
  return (
    <AlertDialog
      open={pendingDeleteId !== null}
      onOpenChange={(o) => !o && setPendingDeleteId(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (pendingDeleteId !== null) {
                deleteMutation.mutate(pendingDeleteId);
                setPendingDeleteId(null);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ------------------------------- Tab 1 ----------------------------------
function DeliveryDisclaimerTab({ logoUrl }: { logoUrl: string }) {
  const { toast } = useToast();
  const { data: customersResp } = useQuery<Customer[]>({
    queryKey: ["/api/customers", { all: true }],
    staleTime: 5 * 60 * 1000,
  });
  const customers = Array.isArray(customersResp) ? customersResp : [];

  const [customerId, setCustomerId] = useState("");
  const [manualCustomerName, setManualCustomerName] = useState("");
  const [date, setDate] = useState(todayISO());
  const [reference, setReference] = useState(`DLV-${Date.now().toString().slice(-6)}`);
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [rows, setRows] = useState<RollRow[]>([
    { id: uid(), description: "", quantity: "", weight: "", notes: "" },
  ]);
  const defaultDisclaimer = `أقر أنا الموقع أدناه باستلام الاصناف المذكورة أعلاه بحالتها وكميتها ومواصفاتها كما هي مبينة في هذا النموذج، وأخلي مسؤولية  (مصنع أكياس البلاستيك الحديث) من أي عيوب أو نواقص أو أضرار قد تظهر بعد توقيعي على هذا النموذج، حيث تم فحص البضاعة والتأكد من مطابقتها قبل التوقيع. كما أتحمل كامل المسؤولية عن نقل البضاعة وتخزينها بعد لحظة الاستلام.`;
  const [disclaimer, setDisclaimer] = useState(defaultDisclaimer);
  const printArea = useRef<HTMLDivElement>(null);

  const customer = customers.find((c) => c.id === customerId);
  const customerDisplayName =
    customer?.name_ar || customer?.name || manualCustomerName || "";

  const resetDeliveryForm = () => {
    setCustomerId("");
    setManualCustomerName("");
    setDate(todayISO());
    setReference(`DLV-${Date.now().toString().slice(-6)}`);
    setVehicle("");
    setDriver("");
    setRecipientName("");
    setRows([{ id: uid(), description: "", quantity: "", weight: "", notes: "" }]);
    setDisclaimer(defaultDisclaimer);
  };

  const docsCtx = useAdminDocs<any>({
    docType: "delivery_disclaimer",
    getPayload: () => ({
      reference,
      title: customerDisplayName || recipientName || "",
      data: {
        customerId,
        manualCustomerName,
        date,
        vehicle,
        driver,
        recipientName,
        rows,
        disclaimer,
      },
    }),
    applyDoc: (data, ref) => {
      setReference(ref);
      setCustomerId(data.customerId || "");
      setManualCustomerName(data.manualCustomerName || "");
      setDate(data.date || todayISO());
      setVehicle(data.vehicle || "");
      setDriver(data.driver || "");
      setRecipientName(data.recipientName || "");
      setRows(
        Array.isArray(data.rows) && data.rows.length
          ? data.rows.map((r: any) => ({ ...r, id: r.id || uid() }))
          : [{ id: uid(), description: "", quantity: "", weight: "", notes: "" }],
      );
      setDisclaimer(data.disclaimer || defaultDisclaimer);
    },
    resetForm: resetDeliveryForm,
  });

  const addRow = () =>
    setRows((r) => [
      ...r,
      { id: uid(), description: "", quantity: "", weight: "", notes: "" },
    ]);
  const removeRow = (id: string) =>
    setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));
  const updateRow = (id: string, k: keyof RollRow, v: string) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  const totals = useMemo(() => {
    const qty = rows.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0);
    const wt = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
    return { qty, wt };
  }, [rows]);

  const handlePrint = () => {
    if (!customer && !manualCustomerName.trim()) {
      toast({
        title: "تنبيه",
        description: "اختر العميل أو اكتب اسماً يدوياً أولاً",
        variant: "destructive",
      });
      return;
    }
    printRef(printArea.current, `Delivery-${reference}`);
  };

  return (
    <div className="space-y-4">
      <AdminDocsPanel label="إخلاء طرف توصيل" ctx={docsCtx} />
      <AdminDocsDeleteDialog ctx={docsCtx} />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>العميل *</Label>
              <CustomerCombobox
                value={{
                  id: customerId,
                  name: customer
                    ? customer.name_ar || customer.name
                    : manualCustomerName,
                }}
                customers={customers}
                testId="select-delivery-customer"
                onChange={(v) => {
                  setCustomerId(v.id);
                  setManualCustomerName(v.id ? "" : v.name);
                }}
              />
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>رقم النموذج</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div>
              <Label>رقم الجوال:</Label>
              <Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
            </div>
            <div>
              <Label>اسم المفوض</Label>
              <Input value={driver} onChange={(e) => setDriver(e.target.value)} />
            </div>
            <div>
              <Label>اسم المستلم</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">الأصناف المُسلَّمة</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addRow}
                data-testid="btn-add-delivery-row"
              >
                <Plus className="h-4 w-4 me-1" /> إضافة صف
              </Button>
            </div>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-start">الوصف</th>
                    <th className="p-2 text-start w-24">الكمية</th>
                    <th className="p-2 text-start w-28">الوحدة </th>
                    <th className="p-2 text-start">ملاحظات</th>
                    <th className="p-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-1">
                        <Input
                          value={r.description}
                          onChange={(e) => updateRow(r.id, "description", e.target.value)}
                          placeholder="نوع/مقاس "
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={r.quantity}
                          onChange={(e) => updateRow(r.id, "quantity", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={r.weight}
                          onChange={(e) => updateRow(r.id, "weight", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          value={r.notes}
                          onChange={(e) => updateRow(r.id, "notes", e.target.value)}
                        />
                      </td>
                      <td className="p-1 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeRow(r.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/60 font-semibold">
                  <tr>
                    <td className="p-2 text-end">الإجمالي</td>
                    <td className="p-2">{totals.qty.toFixed(0)}</td>
                    <td className="p-2">{totals.wt.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <Label>إخلاء المسؤولية</Label>
            <Textarea
              rows={4}
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
            />
          </div>

          <AdminDocsActions ctx={docsCtx} onPrint={handlePrint} />
        </CardContent>
      </Card>

      {/* Hidden printable area */}
      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <DocHeader
            logoUrl={logoUrl}
            title="نموذج تسليم وإخلاء مسؤولية"
            subtitle="Delivery & Disclaimer Form"
          />
          <div className="doc-meta">
            <div>
              <b>العميل:</b> {customerDisplayName || "-"}
            </div>
            <div>
              <b>كود العميل:</b> {customer?.id || "-"}
            </div>
            <div>
              <b>التاريخ:</b> {date}
            </div>
            <div>
              <b>رقم النموذج:</b> {reference}
            </div>
            <div>
              <b>الجوال:</b> {vehicle || "-"}
            </div>
            <div>
              <b>المفوض:</b> {driver || "-"}
            </div>
          </div>

          <h2 className="section">الأصناف المسلمة</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>الوحدة </th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.description}</td>
                  <td>{r.quantity}</td>
                  <td>{r.weight}</td>
                  <td>{r.notes}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ textAlign: "end", fontWeight: 600 }}>
                  الإجمالي
                </td>
                <td style={{ fontWeight: 600 }}>{totals.qty.toFixed(0)}</td>
                <td style={{ fontWeight: 600 }}>{totals.wt.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <h2 className="section">إخلاء المسؤولية</h2>
          <div className="disclaimer">{disclaimer}</div>

          <SignatureBlock
            labels={[
              { label: "توقيع المستلم", name: recipientName || customerDisplayName },
              { label: "توقيع المفوض", name: driver },
              { label: "توقيع المسؤول" },
            ]}
          />
          <div className="footer">
            تم إصدار هذا النموذج إلكترونياً بتاريخ {date} • نظام MPBF
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------- Tab 2 ----------------------------------
function AdminOrderTab({ logoUrl }: { logoUrl: string }) {
  const { user } = useAuth();
  const [number, setNumber] = useState(`AO-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(todayISO());
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [department, setDepartment] = useState("");
  const [body, setBody] = useState("");
  const [issuer, setIssuer] = useState((user as any)?.name || (user as any)?.username || "");
  const [issuerTitle, setIssuerTitle] = useState("الإدارة");
  const printArea = useRef<HTMLDivElement>(null);

  const handlePrint = () => printRef(printArea.current, `AdminOrder-${number}`);

  const docsCtx = useAdminDocs<any>({
    docType: "admin_order",
    getPayload: () => ({
      reference: number,
      title: subject,
      data: { number, date, subject, recipient, department, body, issuer, issuerTitle },
    }),
    applyDoc: (data, ref) => {
      setNumber(ref);
      setDate(data.date || todayISO());
      setSubject(data.subject || "");
      setRecipient(data.recipient || "");
      setDepartment(data.department || "");
      setBody(data.body || "");
      setIssuer(data.issuer || "");
      setIssuerTitle(data.issuerTitle || "الإدارة");
    },
    resetForm: () => {
      setNumber(`AO-${Date.now().toString().slice(-6)}`);
      setDate(todayISO());
      setSubject("");
      setRecipient("");
      setDepartment("");
      setBody("");
      setIssuer((user as any)?.name || (user as any)?.username || "");
      setIssuerTitle("الإدارة");
    },
  });

  return (
    <div className="space-y-4">
      <AdminDocsPanel label="الأوامر الإدارية" ctx={docsCtx} />
      <AdminDocsDeleteDialog ctx={docsCtx} />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>رقم القرار</Label>
              <Input value={number} onChange={(e) => setNumber(e.target.value)} />
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>الموضوع *</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label>إلى</Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="الاسم / الجهة"
              />
            </div>
            <div>
              <Label>الإدارة / القسم</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div>
              <Label>صادر عن</Label>
              <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} />
            </div>
            <div>
              <Label>المسمى الوظيفي</Label>
              <Input
                value={issuerTitle}
                onChange={(e) => setIssuerTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>نص الأمر الإداري *</Label>
            <Textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="اكتب نص الأمر الإداري بشكل واضح..."
            />
          </div>

          <AdminDocsActions ctx={docsCtx} onPrint={handlePrint} />
        </CardContent>
      </Card>

      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <DocHeader
            logoUrl={logoUrl}
            title="أمر إداري"
            subtitle="Administrative Order"
          />
          <div className="doc-meta">
            <div>
              <b>رقم القرار:</b> {number}
            </div>
            <div>
              <b>التاريخ:</b> {date}
            </div>
            <div>
              <b>إلى:</b> {recipient || "-"}
            </div>
            <div>
              <b>الإدارة:</b> {department || "-"}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <b>الموضوع:</b> {subject || "-"}
            </div>
          </div>
          <h2 className="section">نص الأمر</h2>
          <div className="body-text">{body}</div>
          <SignatureBlock
            labels={[
              { label: issuerTitle, name: issuer },
              { label: "الختم الرسمي" },
              { label: "تم الاطلاع", name: recipient },
            ]}
          />
          <div className="footer">صادر من نظام MPBF • {date}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------- Tab 3 ----------------------------------
function CustomReportTab({ logoUrl }: { logoUrl: string }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [period, setPeriod] = useState("");
  const [date, setDate] = useState(todayISO());
  const [sections, setSections] = useState<ReportSection[]>([
    { id: uid(), heading: "المقدمة", body: "" },
  ]);
  const [tableHeaders, setTableHeaders] = useState({
    col1: "البند",
    col2: "القيمة",
    col3: "ملاحظات",
  });
  const [tableRows, setTableRows] = useState<ReportTableRow[]>([
    { id: uid(), col1: "", col2: "", col3: "" },
  ]);
  const [conclusion, setConclusion] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const printArea = useRef<HTMLDivElement>(null);

  const addSection = () =>
    setSections((s) => [...s, { id: uid(), heading: "", body: "" }]);
  const removeSection = (id: string) =>
    setSections((s) => s.filter((x) => x.id !== id));
  const updateSection = (id: string, k: "heading" | "body", v: string) =>
    setSections((s) => s.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  const addTableRow = () =>
    setTableRows((r) => [...r, { id: uid(), col1: "", col2: "", col3: "" }]);
  const removeTableRow = (id: string) =>
    setTableRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));
  const updateTableRow = (id: string, k: keyof ReportTableRow, v: string) =>
    setTableRows((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  const handlePrint = () =>
    printRef(printArea.current, `Report-${title || date}`);

  const reportRef = `RPT-${date}`;
  const docsCtx = useAdminDocs<any>({
    docType: "custom_report",
    getPayload: () => ({
      reference: title ? `${reportRef}-${title.slice(0, 20)}` : reportRef,
      title,
      data: {
        title, subtitle, period, date, sections, tableHeaders, tableRows,
        conclusion, preparedBy,
      },
    }),
    applyDoc: (data) => {
      setTitle(data.title || "");
      setSubtitle(data.subtitle || "");
      setPeriod(data.period || "");
      setDate(data.date || todayISO());
      setSections(
        Array.isArray(data.sections) && data.sections.length
          ? data.sections.map((s: any) => ({ ...s, id: s.id || uid() }))
          : [{ id: uid(), heading: "المقدمة", body: "" }],
      );
      setTableHeaders(
        data.tableHeaders || { col1: "البند", col2: "القيمة", col3: "ملاحظات" },
      );
      setTableRows(
        Array.isArray(data.tableRows) && data.tableRows.length
          ? data.tableRows.map((r: any) => ({ ...r, id: r.id || uid() }))
          : [{ id: uid(), col1: "", col2: "", col3: "" }],
      );
      setConclusion(data.conclusion || "");
      setPreparedBy(data.preparedBy || "");
    },
    resetForm: () => {
      setTitle("");
      setSubtitle("");
      setPeriod("");
      setDate(todayISO());
      setSections([{ id: uid(), heading: "المقدمة", body: "" }]);
      setTableHeaders({ col1: "البند", col2: "القيمة", col3: "ملاحظات" });
      setTableRows([{ id: uid(), col1: "", col2: "", col3: "" }]);
      setConclusion("");
      setPreparedBy("");
    },
  });

  return (
    <div className="space-y-4">
      <AdminDocsPanel label="التقارير المخصصة" ctx={docsCtx} />
      <AdminDocsDeleteDialog ctx={docsCtx} />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>عنوان التقرير *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>العنوان الفرعي</Label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>
            <div>
              <Label>الفترة الزمنية</Label>
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="مثلاً: من 1/1 إلى 31/3"
              />
            </div>
            <div>
              <Label>تاريخ الإصدار</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>أُعدّ بواسطة</Label>
              <Input
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">أقسام التقرير</Label>
              <Button size="sm" variant="outline" onClick={addSection}>
                <Plus className="h-4 w-4 me-1" /> إضافة قسم
              </Button>
            </div>
            {sections.map((s, i) => (
              <Card key={s.id} className="border-dashed">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={s.heading}
                      onChange={(e) => updateSection(s.id, "heading", e.target.value)}
                      placeholder={`عنوان القسم ${i + 1}`}
                      className="font-semibold"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeSection(s.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <Textarea
                    rows={4}
                    value={s.body}
                    onChange={(e) => updateSection(s.id, "body", e.target.value)}
                    placeholder="محتوى القسم..."
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">جدول البيانات</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={tableHeaders.col1}
                onChange={(e) =>
                  setTableHeaders({ ...tableHeaders, col1: e.target.value })
                }
                placeholder="عنوان عمود 1"
              />
              <Input
                value={tableHeaders.col2}
                onChange={(e) =>
                  setTableHeaders({ ...tableHeaders, col2: e.target.value })
                }
                placeholder="عنوان عمود 2"
              />
              <Input
                value={tableHeaders.col3}
                onChange={(e) =>
                  setTableHeaders({ ...tableHeaders, col3: e.target.value })
                }
                placeholder="عنوان عمود 3"
              />
            </div>
            <div className="border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-start">{tableHeaders.col1}</th>
                    <th className="p-2 text-start">{tableHeaders.col2}</th>
                    <th className="p-2 text-start">{tableHeaders.col3}</th>
                    <th className="p-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-1">
                        <Input
                          value={r.col1}
                          onChange={(e) => updateTableRow(r.id, "col1", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          value={r.col2}
                          onChange={(e) => updateTableRow(r.id, "col2", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          value={r.col3}
                          onChange={(e) => updateTableRow(r.id, "col3", e.target.value)}
                        />
                      </td>
                      <td className="p-1 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeTableRow(r.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button size="sm" variant="outline" onClick={addTableRow}>
              <Plus className="h-4 w-4 me-1" /> إضافة صف
            </Button>
          </div>

          <div>
            <Label>الخلاصة / التوصيات</Label>
            <Textarea
              rows={4}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
            />
          </div>

          <AdminDocsActions ctx={docsCtx} onPrint={handlePrint} />
        </CardContent>
      </Card>

      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <DocHeader logoUrl={logoUrl} title={title || "تقرير"} subtitle={subtitle} />
          <div className="doc-meta">
            <div>
              <b>التاريخ:</b> {date}
            </div>
            <div>
              <b>الفترة:</b> {period || "-"}
            </div>
            <div>
              <b>أُعدّ بواسطة:</b> {preparedBy || "-"}
            </div>
          </div>
          {sections.map(
            (s) =>
              (s.heading || s.body) && (
                <div key={s.id}>
                  <h2 className="section">{s.heading}</h2>
                  <div className="body-text">{s.body}</div>
                </div>
              ),
          )}
          {tableRows.some((r) => r.col1 || r.col2 || r.col3) && (
            <>
              <h2 className="section">البيانات التفصيلية</h2>
              <table>
                <thead>
                  <tr>
                    <th>{tableHeaders.col1}</th>
                    <th>{tableHeaders.col2}</th>
                    <th>{tableHeaders.col3}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.col1}</td>
                      <td>{r.col2}</td>
                      <td>{r.col3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {conclusion && (
            <>
              <h2 className="section">الخلاصة والتوصيات</h2>
              <div className="body-text">{conclusion}</div>
            </>
          )}
          <SignatureBlock
            labels={[
              { label: "إعداد", name: preparedBy },
              { label: "مراجعة" },
              { label: "اعتماد" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ------------------------------- Tab 4 ----------------------------------
function MeetingMinutesTab({ logoUrl }: { logoUrl: string }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [chair, setChair] = useState("");
  const [attendees, setAttendees] = useState("");
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    { id: uid(), topic: "", discussion: "" },
  ]);
  const [actions, setActions] = useState<ActionItem[]>([
    { id: uid(), task: "", owner: "", due: "" },
  ]);
  const printArea = useRef<HTMLDivElement>(null);

  const handlePrint = () => printRef(printArea.current, `Minutes-${date}`);

  const docsCtx = useAdminDocs<any>({
    docType: "meeting_minutes",
    getPayload: () => ({
      reference: `MIN-${date}-${(title || "").slice(0, 20)}`,
      title,
      data: { title, date, time, location, chair, attendees, agenda, actions },
    }),
    applyDoc: (data) => {
      setTitle(data.title || "");
      setDate(data.date || todayISO());
      setTime(data.time || "10:00");
      setLocation(data.location || "");
      setChair(data.chair || "");
      setAttendees(data.attendees || "");
      setAgenda(
        Array.isArray(data.agenda) && data.agenda.length
          ? data.agenda.map((a: any) => ({ ...a, id: a.id || uid() }))
          : [{ id: uid(), topic: "", discussion: "" }],
      );
      setActions(
        Array.isArray(data.actions) && data.actions.length
          ? data.actions.map((a: any) => ({ ...a, id: a.id || uid() }))
          : [{ id: uid(), task: "", owner: "", due: "" }],
      );
    },
    resetForm: () => {
      setTitle("");
      setDate(todayISO());
      setTime("10:00");
      setLocation("");
      setChair("");
      setAttendees("");
      setAgenda([{ id: uid(), topic: "", discussion: "" }]);
      setActions([{ id: uid(), task: "", owner: "", due: "" }]);
    },
  });

  return (
    <div className="space-y-4">
      <AdminDocsPanel label="محاضر الاجتماعات" ctx={docsCtx} />
      <AdminDocsDeleteDialog ctx={docsCtx} />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>عنوان الاجتماع *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>الوقت</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div>
              <Label>المكان</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label>رئيس الاجتماع</Label>
              <Input value={chair} onChange={(e) => setChair(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>الحضور (اسم في كل سطر)</Label>
            <Textarea
              rows={3}
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">جدول الأعمال والمناقشات</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setAgenda((a) => [...a, { id: uid(), topic: "", discussion: "" }])
                }
              >
                <Plus className="h-4 w-4 me-1" /> إضافة بند
              </Button>
            </div>
            {agenda.map((a, i) => (
              <Card key={a.id} className="border-dashed">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={a.topic}
                      placeholder={`البند ${i + 1}`}
                      onChange={(e) =>
                        setAgenda((arr) =>
                          arr.map((x) =>
                            x.id === a.id ? { ...x, topic: e.target.value } : x,
                          ),
                        )
                      }
                      className="font-semibold"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setAgenda((arr) => arr.filter((x) => x.id !== a.id))}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <Textarea
                    rows={3}
                    value={a.discussion}
                    placeholder="ملخص المناقشة والقرار..."
                    onChange={(e) =>
                      setAgenda((arr) =>
                        arr.map((x) =>
                          x.id === a.id ? { ...x, discussion: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">الإجراءات والمسؤوليات</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setActions((a) => [
                    ...a,
                    { id: uid(), task: "", owner: "", due: "" },
                  ])
                }
              >
                <Plus className="h-4 w-4 me-1" /> إضافة إجراء
              </Button>
            </div>
            <div className="border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-start">المهمة</th>
                    <th className="p-2 text-start w-40">المسؤول</th>
                    <th className="p-2 text-start w-40">تاريخ التنفيذ</th>
                    <th className="p-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-1">
                        <Input
                          value={a.task}
                          onChange={(e) =>
                            setActions((arr) =>
                              arr.map((x) =>
                                x.id === a.id ? { ...x, task: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          value={a.owner}
                          onChange={(e) =>
                            setActions((arr) =>
                              arr.map((x) =>
                                x.id === a.id ? { ...x, owner: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="date"
                          value={a.due}
                          onChange={(e) =>
                            setActions((arr) =>
                              arr.map((x) =>
                                x.id === a.id ? { ...x, due: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="p-1 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setActions((arr) => arr.filter((x) => x.id !== a.id))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <AdminDocsActions ctx={docsCtx} onPrint={handlePrint} />
        </CardContent>
      </Card>

      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <DocHeader
            logoUrl={logoUrl}
            title={title || "محضر اجتماع"}
            subtitle="Meeting Minutes"
          />
          <div className="doc-meta">
            <div>
              <b>التاريخ:</b> {date}
            </div>
            <div>
              <b>الوقت:</b> {time}
            </div>
            <div>
              <b>المكان:</b> {location || "-"}
            </div>
            <div>
              <b>رئيس الاجتماع:</b> {chair || "-"}
            </div>
          </div>
          <h2 className="section">الحضور</h2>
          <div className="body-text">{attendees}</div>
          <h2 className="section">جدول الأعمال والمناقشات</h2>
          {agenda.map((a, i) => (
            <div key={a.id} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>
                {i + 1}. {a.topic}
              </div>
              <div className="body-text">{a.discussion}</div>
            </div>
          ))}
          <h2 className="section">الإجراءات والمسؤوليات</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>المهمة</th>
                <th>المسؤول</th>
                <th>تاريخ التنفيذ</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a, i) => (
                <tr key={a.id}>
                  <td>{i + 1}</td>
                  <td>{a.task}</td>
                  <td>{a.owner}</td>
                  <td>{a.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <SignatureBlock
            labels={[
              { label: "رئيس الاجتماع", name: chair },
              { label: "محرر المحضر" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ------------------------------- Tab 5 ----------------------------------
function AssetHandoverTab({ logoUrl }: { logoUrl: string }) {
  const [employee, setEmployee] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState<AssetItem[]>([
    { id: uid(), name: "", serial: "", qty: "1", condition: "جديد" },
  ]);
  const defaultTerms = `أقر أنا الموظف الموقع أدناه باستلام العهدة الموضحة أعلاه بحالتها المذكورة، وأتعهد بالمحافظة عليها واستخدامها للأغراض الوظيفية فقط، وإعادتها بنفس الحالة عند انتهاء العمل أو طلب الشركة لها. وفي حال أي تلف أو فقدان ناتج عن إهمال أتحمل قيمتها كاملة.`;
  const [terms, setTerms] = useState(defaultTerms);
  const printArea = useRef<HTMLDivElement>(null);

  const handlePrint = () => printRef(printArea.current, `Handover-${employee}`);

  const docsCtx = useAdminDocs<any>({
    docType: "asset_handover",
    getPayload: () => ({
      reference: `HND-${date}-${(employeeId || employee || "").slice(0, 20)}`,
      title: employee,
      data: { employee, employeeId, department, date, items, terms },
    }),
    applyDoc: (data) => {
      setEmployee(data.employee || "");
      setEmployeeId(data.employeeId || "");
      setDepartment(data.department || "");
      setDate(data.date || todayISO());
      setItems(
        Array.isArray(data.items) && data.items.length
          ? data.items.map((i: any) => ({ ...i, id: i.id || uid() }))
          : [{ id: uid(), name: "", serial: "", qty: "1", condition: "جديد" }],
      );
      setTerms(data.terms || defaultTerms);
    },
    resetForm: () => {
      setEmployee("");
      setEmployeeId("");
      setDepartment("");
      setDate(todayISO());
      setItems([{ id: uid(), name: "", serial: "", qty: "1", condition: "جديد" }]);
      setTerms(defaultTerms);
    },
  });

  return (
    <div className="space-y-4">
      <AdminDocsPanel label="نماذج تسليم العهد" ctx={docsCtx} />
      <AdminDocsDeleteDialog ctx={docsCtx} />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>اسم الموظف *</Label>
              <Input
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
              />
            </div>
            <div>
              <Label>رقم الموظف</Label>
              <Input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
            <div>
              <Label>القسم</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">قائمة العهدة</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setItems((a) => [
                    ...a,
                    { id: uid(), name: "", serial: "", qty: "1", condition: "جديد" },
                  ])
                }
              >
                <Plus className="h-4 w-4 me-1" /> إضافة عنصر
              </Button>
            </div>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-start">الصنف</th>
                    <th className="p-2 text-start w-40">الرقم التسلسلي</th>
                    <th className="p-2 text-start w-20">الكمية</th>
                    <th className="p-2 text-start w-32">الحالة</th>
                    <th className="p-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-1">
                        <Input
                          value={it.name}
                          onChange={(e) =>
                            setItems((arr) =>
                              arr.map((x) =>
                                x.id === it.id ? { ...x, name: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          value={it.serial}
                          onChange={(e) =>
                            setItems((arr) =>
                              arr.map((x) =>
                                x.id === it.id ? { ...x, serial: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.qty}
                          onChange={(e) =>
                            setItems((arr) =>
                              arr.map((x) =>
                                x.id === it.id ? { ...x, qty: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          value={it.condition}
                          onChange={(e) =>
                            setItems((arr) =>
                              arr.map((x) =>
                                x.id === it.id ? { ...x, condition: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="p-1 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setItems((arr) =>
                              arr.length > 1 ? arr.filter((x) => x.id !== it.id) : arr,
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <Label>تعهد الاستلام</Label>
            <Textarea
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>

          <AdminDocsActions ctx={docsCtx} onPrint={handlePrint} />
        </CardContent>
      </Card>

      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <DocHeader
            logoUrl={logoUrl}
            title="نموذج تسليم عهدة"
            subtitle="Asset Handover Form"
          />
          <div className="doc-meta">
            <div>
              <b>اسم الموظف:</b> {employee}
            </div>
            <div>
              <b>رقم الموظف:</b> {employeeId || "-"}
            </div>
            <div>
              <b>القسم:</b> {department || "-"}
            </div>
            <div>
              <b>التاريخ:</b> {date}
            </div>
          </div>
          <h2 className="section">قائمة العهدة</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الصنف</th>
                <th>الرقم التسلسلي</th>
                <th>الكمية</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.id}>
                  <td>{i + 1}</td>
                  <td>{it.name}</td>
                  <td>{it.serial || "-"}</td>
                  <td>{it.qty}</td>
                  <td>{it.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="section">تعهد الاستلام</h2>
          <div className="disclaimer">{terms}</div>
          <SignatureBlock
            labels={[
              { label: "توقيع الموظف", name: employee },
              { label: "المسلِّم" },
              { label: "اعتماد الإدارة" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ------------------------------- Truck SVG ------------------------------
function TruckDiagram({
  assignments,
  onZoneClick,
  selectedZone,
}: {
  assignments: Record<number, { name: string; color: string }>;
  onZoneClick?: (zone: number) => void;
  selectedZone?: number;
}) {
  // 8 cargo zones inside the trailer body. Trailer drawn side-view.
  const zoneW = 80;
  const zoneH = 110;
  const startX = 30;
  const startY = 30;
  const cols = 8;
  return (
    <svg
      viewBox="0 0 760 240"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxHeight: 260 }}
    >
      {/* Cab */}
      <rect x="660" y="60" width="80" height="80" rx="6" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
      <rect x="668" y="70" width="55" height="35" rx="3" fill="#bfdbfe" stroke="#0f172a" />
      <rect x="685" y="115" width="35" height="22" fill="#374151" />
      {/* Trailer body outline */}
      <rect
        x={startX - 10}
        y={startY - 10}
        width={cols * zoneW + 20}
        height={zoneH + 20}
        rx="4"
        fill="#f3f4f6"
        stroke="#0f172a"
        strokeWidth="2"
      />
      {/* Zones */}
      {Array.from({ length: cols }).map((_, i) => {
        const zone = i + 1;
        const a = assignments[zone];
        const x = startX + i * zoneW;
        const isSel = selectedZone === zone;
        return (
          <g
            key={zone}
            onClick={() => onZoneClick?.(zone)}
            style={{ cursor: onZoneClick ? "pointer" : "default" }}
          >
            <rect
              x={x}
              y={startY}
              width={zoneW - 4}
              height={zoneH}
              fill={a?.color || "#ffffff"}
              stroke={isSel ? "#dc2626" : "#475569"}
              strokeWidth={isSel ? 3 : 1}
            />
            <text
              x={x + (zoneW - 4) / 2}
              y={startY + 16}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#0f172a"
            >
              {zone}
            </text>
            {a?.name && (
              <foreignObject x={x + 2} y={startY + 22} width={zoneW - 8} height={zoneH - 26}>
                <div
                  style={{
                    fontSize: 10,
                    color: "#0f172a",
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.25,
                    overflow: "hidden",
                    wordBreak: "break-word",
                    direction: "rtl",
                    fontFamily: "Tahoma, Arial, sans-serif",
                  }}
                >
                  {a.name}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
      {/* Back door indicator */}
      <line x1={startX - 10} y1={startY - 10} x2={startX - 10} y2={startY + zoneH + 10} stroke="#dc2626" strokeWidth="3" />
      <text x={startX - 18} y={startY + zoneH / 2} textAnchor="middle" fontSize="10" fill="#dc2626" transform={`rotate(-90 ${startX - 18} ${startY + zoneH / 2})`}>الباب الخلفي</text>
      {/* Wheels */}
      <circle cx={startX + 30} cy={startY + zoneH + 18} r="14" fill="#111827" />
      <circle cx={startX + 30} cy={startY + zoneH + 18} r="6" fill="#9ca3af" />
      <circle cx={startX + 110} cy={startY + zoneH + 18} r="14" fill="#111827" />
      <circle cx={startX + 110} cy={startY + zoneH + 18} r="6" fill="#9ca3af" />
      <circle cx={startX + cols * zoneW - 30} cy={startY + zoneH + 18} r="14" fill="#111827" />
      <circle cx={startX + cols * zoneW - 30} cy={startY + zoneH + 18} r="6" fill="#9ca3af" />
      <circle cx={680} cy={startY + zoneH + 18} r="14" fill="#111827" />
      <circle cx={680} cy={startY + zoneH + 18} r="6" fill="#9ca3af" />
      <circle cx={720} cy={startY + zoneH + 18} r="14" fill="#111827" />
      <circle cx={720} cy={startY + zoneH + 18} r="6" fill="#9ca3af" />
      {/* Ground */}
      <line x1="0" y1={startY + zoneH + 35} x2="760" y2={startY + zoneH + 35} stroke="#9ca3af" strokeWidth="2" strokeDasharray="6 4" />
    </svg>
  );
}

// ------------------------------- Tab 6 ----------------------------------
function DeliveryRouteTab({ logoUrl }: { logoUrl: string }) {
  const { toast } = useToast();
  const { data: customersResp } = useQuery<Customer[]>({
    queryKey: ["/api/customers", { all: true }],
    staleTime: 5 * 60 * 1000,
  });
  const customers = Array.isArray(customersResp) ? customersResp : [];

  const [date, setDate] = useState(todayISO());
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [driver, setDriver] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [reference, setReference] = useState(`RT-${Date.now().toString().slice(-6)}`);
  const [stops, setStops] = useState<DeliveryStop[]>([
    {
      id: uid(),
      customerId: "",
      customerName: "",
      contactPhone: "",
      inChargeName: "",
      notes: "",
      imageDataUrl: "",
      zone: 1,
    },
  ]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const printArea = useRef<HTMLDivElement>(null);

  type SavedManifest = {
    id: number;
    reference: string;
    delivery_date: string | null;
    vehicle_plate: string | null;
    driver: string | null;
    driver_phone: string | null;
    stops: DeliveryStop[];
    created_at: string;
    updated_at: string;
  };

  const {
    data: manifestsResp,
    isLoading: isLoadingManifests,
    isError: isManifestsError,
  } = useQuery<{ data: SavedManifest[] }>({
    queryKey: ["/api/delivery-manifests"],
    staleTime: 30 * 1000,
  });
  const manifests = manifestsResp?.data || [];

  const resetForm = () => {
    setCurrentId(null);
    setReference(`RT-${Date.now().toString().slice(-6)}`);
    setDate(todayISO());
    setVehiclePlate("");
    setDriver("");
    setDriverPhone("");
    setStops([
      {
        id: uid(),
        customerId: "",
        customerName: "",
        contactPhone: "",
        inChargeName: "",
        notes: "",
        imageDataUrl: "",
        zone: 1,
      },
    ]);
  };

  const loadManifest = (m: SavedManifest) => {
    setCurrentId(m.id);
    setReference(m.reference);
    setDate(m.delivery_date || todayISO());
    setVehiclePlate(m.vehicle_plate || "");
    setDriver(m.driver || "");
    setDriverPhone(m.driver_phone || "");
    const loadedStops = Array.isArray(m.stops) && m.stops.length > 0
      ? m.stops.map((s) => ({ ...s, id: s.id || uid() }))
      : [
          {
            id: uid(),
            customerId: "",
            customerName: "",
            contactPhone: "",
            inChargeName: "",
            notes: "",
            imageDataUrl: "",
            zone: 1,
          },
        ];
    setStops(loadedStops);
    toast({
      title: "تم التحميل",
      description: `تم تحميل الكشف ${m.reference} للتعديل`,
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        reference,
        delivery_date: date,
        vehicle_plate: vehiclePlate,
        driver,
        driver_phone: driverPhone,
        stops,
      };
      const res = await apiRequest(
        currentId
          ? `/api/delivery-manifests/${currentId}`
          : "/api/delivery-manifests",
        {
          method: currentId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      return (await res.json()) as SavedManifest;
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-manifests"] });
      if (saved && typeof saved.id === "number") {
        setCurrentId(saved.id);
      }
      toast({
        title: "تم الحفظ",
        description: currentId
          ? "تم تحديث الكشف بنجاح"
          : "تم حفظ الكشف بنجاح",
      });
    },
    onError: (err: any) => {
      toast({
        title: "خطأ",
        description: err?.message || "تعذر حفظ الكشف",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/delivery-manifests/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-manifests"] });
      if (currentId === id) resetForm();
      toast({ title: "تم الحذف", description: "تم حذف الكشف" });
    },
    onError: (err: any) => {
      toast({
        title: "خطأ",
        description: err?.message || "تعذر حذف الكشف",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (stops.every((s) => !s.customerName)) {
      toast({
        title: "تنبيه",
        description: "أضف عميلاً واحداً على الأقل قبل الحفظ",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate();
  };

  const addStop = () => {
    if (stops.length >= TRUCK_ZONES) {
      toast({
        title: "تنبيه",
        description: `الحد الأقصى ${TRUCK_ZONES} عملاء (مواقع الشاحنة)`,
        variant: "destructive",
      });
      return;
    }
    const used = new Set(stops.map((s) => s.zone));
    let nextZone = 1;
    while (used.has(nextZone) && nextZone <= TRUCK_ZONES) nextZone++;
    setStops((s) => [
      ...s,
      {
        id: uid(),
        customerId: "",
        customerName: "",
        contactPhone: "",
        inChargeName: "",
        notes: "",
        imageDataUrl: "",
        zone: nextZone,
      },
    ]);
  };
  const removeStop = (id: string) =>
    setStops((s) => (s.length > 1 ? s.filter((x) => x.id !== id) : s));
  const updateStop = <K extends keyof DeliveryStop>(
    id: string,
    k: K,
    v: DeliveryStop[K],
  ) => setStops((s) => s.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  const handleImageUpload = (id: string, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "تنبيه",
        description: "الملف يجب أن يكون صورة فقط",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "تنبيه",
        description: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت",
        variant: "destructive",
      });
      return;
    }
    // Resize to max 600px width for memory + print stability
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 600;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          updateStop(id, "imageDataUrl", String(reader.result || ""));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        updateStop(id, "imageDataUrl", canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => {
        updateStop(id, "imageDataUrl", String(reader.result || ""));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const onCustomerChange = (id: string, pick: CustomerPick) => {
    const c = pick.id ? customers.find((x) => x.id === pick.id) : undefined;
    setStops((s) =>
      s.map((x) =>
        x.id === id
          ? {
              ...x,
              customerId: pick.id,
              customerName: pick.name,
              contactPhone: x.contactPhone || c?.phone || "",
            }
          : x,
      ),
    );
  };

  const assignments = useMemo(() => {
    const map: Record<number, { name: string; color: string }> = {};
    stops.forEach((s, i) => {
      if (s.customerName) {
        map[s.zone] = {
          name: s.customerName,
          color: ZONE_COLORS[i % ZONE_COLORS.length],
        };
      }
    });
    return map;
  }, [stops]);

  const handlePrint = () => {
    if (stops.every((s) => !s.customerName)) {
      toast({
        title: "تنبيه",
        description: "أضف عميلاً واحداً على الأقل قبل الطباعة",
        variant: "destructive",
      });
      return;
    }
    const filled = stops.filter((s) => s.customerName);
    const zonesUsed = filled.map((s) => s.zone);
    const dupZone = zonesUsed.find((z, i) => zonesUsed.indexOf(z) !== i);
    if (dupZone !== undefined) {
      toast({
        title: "تنبيه",
        description: `الموقع رقم ${dupZone} مستخدم لأكثر من عميل، يرجى تعديل المواقع`,
        variant: "destructive",
      });
      return;
    }
    printRef(printArea.current, `Route-${reference}`);
  };

  return (
    <div className="space-y-4">
      {/* Saved Manifests Panel */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              الكشوف المحفوظة ({manifests.length})
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={resetForm}
              data-testid="btn-new-manifest"
            >
              <FilePlus className="h-4 w-4 me-1" /> كشف جديد
            </Button>
          </div>
          {isLoadingManifests ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              جاري تحميل الكشوف...
            </p>
          ) : isManifestsError ? (
            <p className="text-sm text-red-600 text-center py-4">
              تعذر تحميل الكشوف المحفوظة
            </p>
          ) : manifests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              لا توجد كشوف محفوظة بعد — املأ النموذج أدناه واضغط "حفظ"
            </p>
          ) : (
            <div className="border rounded-md overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-start">رقم الكشف</th>
                    <th className="p-2 text-start">التاريخ</th>
                    <th className="p-2 text-start">السائق</th>
                    <th className="p-2 text-start">اللوحة</th>
                    <th className="p-2 text-center">عدد العملاء</th>
                    <th className="p-2 text-center w-32">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {manifests.map((m) => {
                    const stopsCount = Array.isArray(m.stops)
                      ? m.stops.filter((s: any) => s.customerName || s.customerId).length
                      : 0;
                    const isCurrent = currentId === m.id;
                    return (
                      <tr
                        key={m.id}
                        className={`border-t ${isCurrent ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                      >
                        <td className="p-2 font-medium">
                          {m.reference}
                          {isCurrent && (
                            <span className="ms-2 text-xs text-blue-600">
                              (قيد التعديل)
                            </span>
                          )}
                        </td>
                        <td className="p-2">{m.delivery_date || "-"}</td>
                        <td className="p-2">{m.driver || "-"}</td>
                        <td className="p-2">{m.vehicle_plate || "-"}</td>
                        <td className="p-2 text-center">{stopsCount}</td>
                        <td className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => loadManifest(m)}
                              aria-label="تعديل الكشف"
                              data-testid={`btn-load-manifest-${m.id}`}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setPendingDeleteId(m.id)}
                              aria-label="حذف الكشف"
                              data-testid={`btn-delete-manifest-${m.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {currentId && (
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-md text-sm text-blue-700 dark:text-blue-300 border border-blue-200">
              تقوم بتعديل كشف محفوظ. اضغط "كشف جديد" لإلغاء التعديل والبدء من جديد.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>رقم الكشف</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div>
              <Label>تاريخ التوصيل</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>رقم لوحة الشاحنة</Label>
              <Input
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
              />
            </div>
            <div>
              <Label>اسم السائق</Label>
              <Input value={driver} onChange={(e) => setDriver(e.target.value)} />
            </div>
            <div>
              <Label>جوال السائق</Label>
              <Input
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="05xxxxxxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">
              مخطط الشاحنة (تريلر) — الأرقام تمثل مواقع البضاعة
            </Label>
            <div className="border rounded-md p-3 bg-white dark:bg-gray-800">
              <TruckDiagram assignments={assignments} />
            </div>
            <p className="text-xs text-muted-foreground">
              لكل عميل يمكنك تحديد رقم الموقع (1-8) من القائمة في الجدول، وسيظهر
              اسمه على الرسم تلقائياً.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">قائمة العملاء والتوصيل</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addStop}
                data-testid="btn-add-stop"
              >
                <Plus className="h-4 w-4 me-1" /> إضافة عميل
              </Button>
            </div>
            <div className="space-y-3">
              {stops.map((s, i) => (
                <Card key={s.id} className="border-dashed">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-gray-900"
                          style={{
                            background:
                              ZONE_COLORS[i % ZONE_COLORS.length],
                          }}
                        >
                          {s.zone}
                        </span>
                        <span className="text-sm font-semibold">
                          محطة {i + 1}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeStop(s.id)}
                        aria-label="حذف العميل"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">العميل</Label>
                        <CustomerCombobox
                          value={{ id: s.customerId, name: s.customerName }}
                          customers={customers}
                          testId={`select-stop-customer-${i}`}
                          onChange={(v) => onCustomerChange(s.id, v)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">رقم التواصل</Label>
                        <Input
                          value={s.contactPhone}
                          onChange={(e) =>
                            updateStop(s.id, "contactPhone", e.target.value)
                          }
                          placeholder="05xxxxxxxx"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">اسم المسؤول</Label>
                        <Input
                          value={s.inChargeName}
                          onChange={(e) =>
                            updateStop(s.id, "inChargeName", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">موقع البضاعة على الشاحنة</Label>
                        <Select
                          value={String(s.zone)}
                          onValueChange={(v) =>
                            updateStop(s.id, "zone", parseInt(v, 10))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: TRUCK_ZONES }).map((_, z) => (
                              <SelectItem key={z + 1} value={String(z + 1)}>
                                موقع {z + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">ملاحظات</Label>
                        <Input
                          value={s.notes}
                          onChange={(e) => updateStop(s.id, "notes", e.target.value)}
                          placeholder="مثلاً: التوصيل بعد الظهر / يحتاج رافعة"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-xs">صورة الكيس / البضاعة</Label>
                        <div className="flex items-center gap-3 mt-1">
                          <label
                            className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-muted text-sm"
                          >
                            <Upload className="h-4 w-4" />
                            <span>{s.imageDataUrl ? "تغيير الصورة" : "رفع صورة"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(s.id, e.target.files?.[0])
                              }
                            />
                          </label>
                          {s.imageDataUrl && (
                            <div className="relative">
                              <img
                                src={s.imageDataUrl}
                                alt="bag"
                                className="h-16 w-16 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => updateStop(s.id, "imageDataUrl", "")}
                                aria-label="إزالة الصورة"
                                className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={resetForm}
              data-testid="btn-reset-route"
            >
              <FilePlus className="h-4 w-4 me-2" /> كشف جديد
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              data-testid="btn-save-route"
            >
              <Save className="h-4 w-4 me-2" />
              {saveMutation.isPending
                ? "جاري الحفظ..."
                : currentId
                  ? "حفظ التعديلات"
                  : "حفظ الكشف"}
            </Button>
            <Button onClick={handlePrint} data-testid="btn-print-route">
              <Printer className="h-4 w-4 me-2" /> طباعة كشف A4
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(o) => !o && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الكشف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الكشف؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteId !== null) {
                  deleteMutation.mutate(pendingDeleteId);
                  setPendingDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden printable area */}
      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <DocHeader
            logoUrl={logoUrl}
            title="كشف توصيل البضائع للعملاء"
            subtitle="Customer Delivery Route Sheet"
          />
          <div className="doc-meta">
            <div>
              <b>رقم الكشف:</b> {reference}
            </div>
            <div>
              <b>تاريخ التوصيل:</b> {date}
            </div>
            <div>
              <b>لوحة الشاحنة:</b> {vehiclePlate || "-"}
            </div>
            <div>
              <b>السائق:</b> {driver || "-"}
            </div>
            <div>
              <b>جوال السائق:</b> {driverPhone || "-"}
            </div>
            <div>
              <b>عدد العملاء:</b> {stops.filter((s) => s.customerName).length}
            </div>
          </div>

          <h2 className="section">مخطط توزيع البضاعة على الشاحنة</h2>
          <div style={{ border: "1px solid #999", padding: 8, borderRadius: 6, background: "#fafafa" }}>
            <TruckDiagram assignments={assignments} />
          </div>

          <h2 className="section">قائمة العملاء</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 30 }}>#</th>
                <th style={{ width: 40 }}>الموقع</th>
                <th>العميل</th>
                <th>رقم التواصل</th>
                <th>المسؤول</th>
                <th>صورة</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, background: ZONE_COLORS[i % ZONE_COLORS.length] }}>
                    {s.zone}
                  </td>
                  <td>{s.customerName || "-"}</td>
                  <td style={{ direction: "ltr", textAlign: "start" }}>{s.contactPhone || "-"}</td>
                  <td>{s.inChargeName || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    {s.imageDataUrl ? (
                      <img
                        src={s.imageDataUrl}
                        alt=""
                        style={{ width: 56, height: 56, objectFit: "cover", border: "1px solid #999" }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{s.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SignatureBlock
            labels={[
              { label: "السائق", name: driver },
              { label: "مسؤول التوصيل" },
              { label: "اعتماد الإدارة" },
            ]}
          />
          <div className="footer">
            صادر من نظام MPBF • {date} • هذا الكشف لتنظيم خط سير التوصيل فقط
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================== Page Root ===============================
// ------------------------------- Tab: Salary Calculator ----------------------------------
const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function SalaryRow({
  label,
  value,
  bold,
  positive,
  negative,
}: {
  label: string;
  value: string;
  bold?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 ${
        bold ? "bg-muted text-base font-bold" : ""
      }`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-medium ${positive ? "text-green-600" : ""} ${
          negative ? "text-red-600" : ""
        } ${bold ? "text-foreground" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function SalaryCalculatorTab({ logoUrl }: { logoUrl: string }) {
  const { toast } = useToast();
  const { data: usersResp } = useQuery<any>({
    queryKey: ["/api/users"],
    staleTime: 5 * 60 * 1000,
  });
  const usersList: any[] = Array.isArray(usersResp)
    ? usersResp
    : Array.isArray(usersResp?.data)
      ? usersResp.data
      : [];

  const { data: sysSettings } = useQuery<any>({
    queryKey: ["/api/settings/system"],
    staleTime: 5 * 60 * 1000,
  });
  const settingsObj: Record<string, any> = Array.isArray(sysSettings)
    ? sysSettings.reduce((acc: any, s: any) => {
        acc[s.setting_key] = s.setting_value;
        return acc;
      }, {})
    : {};
  const companyNameAr = settingsObj.companyName || "مصنع أكياس البلاستيك الحديث";
  const companyNameEn = "Modern Plastic Bag Factory";

  const now = new Date();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [manualName, setManualName] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [basicSalary, setBasicSalary] = useState("");
  const [foodAllowance, setFoodAllowance] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [absenceDays, setAbsenceDays] = useState("");
  const printArea = useRef<HTMLDivElement>(null);

  const userOptions: SearchableSelectOption[] = usersList.map((u) => ({
    value: String(u.id),
    label:
      u.display_name_ar ||
      u.display_name ||
      u.full_name ||
      u.username ||
      `#${u.id}`,
  }));

  const selectedUser = usersList.find((u) => String(u.id) === selectedUserId);
  const employeeName =
    manualName.trim() ||
    selectedUser?.display_name_ar ||
    selectedUser?.display_name ||
    selectedUser?.full_name ||
    selectedUser?.username ||
    "";

  const monthLabel = `${ARABIC_MONTHS[Number(month) - 1] || month} ${year}`;
  const monthLabelEn = `${ENGLISH_MONTHS[Number(month) - 1] || month} ${year}`;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  const toNonNeg = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const basic = toNonNeg(basicSalary);
  const food = toNonNeg(foodAllowance);
  const otHours = toNonNeg(overtimeHours);
  const absDays = toNonNeg(absenceDays);

  const overtimeAmount = basic > 0 ? (basic / 30 / 8) * 1.5 * otHours : 0;
  const dailyRate = (basic + food) / 30;
  const absenceDeduction = dailyRate * absDays;
  const netSalary = basic + food + overtimeAmount - absenceDeduction;

  const money = (n: number) => formatNumberAr(n, 2);

  const resetForm = () => {
    const d = new Date();
    setSelectedUserId("");
    setManualName("");
    setMonth(String(d.getMonth() + 1));
    setYear(String(d.getFullYear()));
    setBasicSalary("");
    setFoodAllowance("");
    setOvertimeHours("");
    setAbsenceDays("");
  };

  const docsCtx = useAdminDocs<any>({
    docType: "salary_calc",
    getPayload: () => ({
      reference: employeeName || "موظف",
      title: `${monthLabel} — صافي ${money(netSalary)}`,
      data: {
        selectedUserId,
        manualName,
        employeeName,
        month,
        year,
        basicSalary,
        foodAllowance,
        overtimeHours,
        absenceDays,
        computed: { overtimeAmount, absenceDeduction, netSalary },
      },
    }),
    applyDoc: (data) => {
      const d = new Date();
      setSelectedUserId(data?.selectedUserId || "");
      setManualName(data?.manualName || "");
      setMonth(data?.month || String(d.getMonth() + 1));
      setYear(data?.year || String(d.getFullYear()));
      setBasicSalary(data?.basicSalary || "");
      setFoodAllowance(data?.foodAllowance || "");
      setOvertimeHours(data?.overtimeHours || "");
      setAbsenceDays(data?.absenceDays || "");
    },
    resetForm,
  });

  const handlePrint = () =>
    printRef(printArea.current, `Salary-${employeeName}-${monthKey}`);

  const validate = (): string | null => {
    if (!employeeName) {
      toast({
        title: "تنبيه",
        description: "اختر اسم الموظف أو اكتبه",
        variant: "destructive",
      });
      return "no-name";
    }
    if (basic <= 0) {
      toast({
        title: "تنبيه",
        description: "أدخل الراتب الأساسي",
        variant: "destructive",
      });
      return "no-basic";
    }
    const numericFields: [string, string][] = [
      ["الراتب الأساسي", basicSalary],
      ["بدل الطعام", foodAllowance],
      ["عدد ساعات الإضافي", overtimeHours],
      ["عدد أيام الغياب", absenceDays],
    ];
    for (const [label, raw] of numericFields) {
      if (raw.trim() === "") continue;
      const n = parseFloat(raw);
      if (!Number.isFinite(n) || n < 0) {
        toast({
          title: "تنبيه",
          description: `${label} يجب أن يكون رقماً موجباً صحيحاً`,
          variant: "destructive",
        });
        return "invalid-number";
      }
    }
    return null;
  };

  const years: string[] = [];
  for (let y = now.getFullYear() - 3; y <= now.getFullYear() + 1; y++) {
    years.push(String(y));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>اسم الموظف</Label>
              <SearchableSelect
                options={userOptions}
                value={selectedUserId}
                onValueChange={(v) => {
                  setSelectedUserId(v);
                  if (v) setManualName("");
                }}
                placeholder="اختر من قائمة المستخدمين"
                searchPlaceholder="ابحث عن مستخدم..."
              />
              <Input
                value={manualName}
                onChange={(e) => {
                  setManualName(e.target.value);
                  if (e.target.value) setSelectedUserId("");
                }}
                placeholder="أو اكتب اسماً من خارج القائمة"
                data-testid="input-salary-manual-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>الشهر</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger data-testid="select-salary-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARABIC_MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>السنة</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger data-testid="select-salary-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>الراتب الأساسي</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  placeholder="0"
                  data-testid="input-salary-basic"
                />
              </div>
              <div className="space-y-2">
                <Label>بدل الطعام</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={foodAllowance}
                  onChange={(e) => setFoodAllowance(e.target.value)}
                  placeholder="0"
                  data-testid="input-salary-food"
                />
              </div>
              <div className="space-y-2">
                <Label>عدد ساعات الإضافي</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(e.target.value)}
                  placeholder="0"
                  data-testid="input-salary-overtime"
                />
              </div>
              <div className="space-y-2">
                <Label>عدد أيام الغياب</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={absenceDays}
                  onChange={(e) => setAbsenceDays(e.target.value)}
                  placeholder="0"
                  data-testid="input-salary-absence"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <AdminDocsActions
          ctx={docsCtx}
          onPrint={handlePrint}
          onValidate={validate}
        />
        <AdminDocsPanel label="رواتب محفوظة" ctx={docsCtx} />
        <AdminDocsDeleteDialog ctx={docsCtx} />
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Label className="text-base font-semibold">
              ملخص الراتب — {monthLabel}
            </Label>
            <div className="rounded-md border divide-y text-sm">
              <SalaryRow label="الموظف" value={employeeName || "-"} />
              <SalaryRow label="الراتب الأساسي" value={money(basic)} />
              <SalaryRow label="بدل الطعام" value={money(food)} />
              <SalaryRow
                label={`الإضافي (${money(otHours)} ساعة)`}
                value={`+ ${money(overtimeAmount)}`}
                positive
              />
              <SalaryRow
                label={`خصم الغياب (${money(absDays)} يوم)`}
                value={`- ${money(absenceDeduction)}`}
                negative
              />
              <SalaryRow
                label="صافي الراتب"
                value={money(netSalary)}
                bold
              />
            </div>
            <p className="text-xs text-muted-foreground leading-6">
              معادلة الإضافي: الراتب الأساسي ÷ 30 ÷ 8 × 1.5 × ساعات الإضافي
              <br />
              خصم الغياب: (الراتب الأساسي + بدل الطعام) ÷ 30 × أيام الغياب
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hidden printable area */}
      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <div className="doc-header">
            <img src={logoUrl} alt="logo" />
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1 className="doc-title">{companyNameAr}</h1>
              <p
                className="doc-subtitle"
                style={{ fontSize: 14, fontWeight: 600, color: "#333" }}
              >
                {companyNameEn}
              </p>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
                كشف راتب موظف
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                Employee Salary Slip
              </div>
            </div>
            <div style={{ width: 64 }} />
          </div>
          <div className="doc-meta">
            <div>
              <b>الموظف / Employee:</b> {employeeName || "-"}
            </div>
            <div>
              <b>الشهر / Month:</b> {monthLabel} — {monthLabelEn}
            </div>
          </div>
          <h2 className="section">تفاصيل الراتب / Salary Details</h2>
          <table>
            <thead>
              <tr>
                <th>البند / Item</th>
                <th>القيمة (ريال) / Amount (SAR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>الراتب الأساسي / Basic Salary</td>
                <td>{money(basic)}</td>
              </tr>
              <tr>
                <td>بدل الطعام / Food Allowance</td>
                <td>{money(food)}</td>
              </tr>
              <tr>
                <td>
                  الإضافي ({money(otHours)} ساعة) / Overtime ({money(otHours)} h)
                </td>
                <td>{money(overtimeAmount)}</td>
              </tr>
              <tr>
                <td>
                  خصم الغياب ({money(absDays)} يوم) / Absence Deduction (
                  {money(absDays)} d)
                </td>
                <td>- {money(absenceDeduction)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>صافي الراتب / Net Salary</td>
                <td style={{ fontWeight: 700 }}>{money(netSalary)}</td>
              </tr>
            </tbody>
          </table>
          <SignatureBlock
            labels={[
              { label: "توقيع الموظف / Employee Signature", name: employeeName },
              { label: "المحاسب / Accountant" },
              { label: "المدير / Manager" },
            ]}
          />
          <div className="footer">
            تم إصدار هذا الكشف إلكترونياً • نظام MPBF
            <br />
            This payslip was generated electronically • MPBF System
          </div>
        </div>
      </div>
    </div>
  );
}

const VIOLATION_TYPES: { key: string; label: string }[] = [
  { key: "absence", label: "غياب بدون عذر" },
  { key: "early_leave", label: "انسحاب قبل نهاية الدوام" },
  { key: "late", label: "تأخير حضور" },
  { key: "tasks", label: "عدم القيام بالمهام الموكلة" },
  { key: "negligence", label: "الإهمال الوظيفي" },
];

const PENALTY_TYPES: { key: string; label: string }[] = [
  { key: "warning1", label: "إنذار أول" },
  { key: "warning2", label: "إنذار ثانٍ" },
  { key: "warning_final", label: "إنذار نهائي" },
  { key: "deduction", label: "خصم مالي" },
  { key: "suspension", label: "إيقاف عن العمل" },
  { key: "dismissal", label: "فصل" },
];

const VIOLATION_LABELS_EN: Record<string, string> = {
  absence: "Unexcused Absence",
  early_leave: "Leaving Before End of Shift",
  late: "Late Attendance",
  tasks: "Failure to Perform Assigned Duties",
  negligence: "Job Negligence",
};

const PENALTY_LABELS_EN: Record<string, string> = {
  warning1: "First Warning",
  warning2: "Second Warning",
  warning_final: "Final Warning",
  deduction: "Financial Deduction",
  suspension: "Suspension from Work",
  dismissal: "Dismissal",
};

const violationLabel = (key: string) =>
  VIOLATION_TYPES.find((v) => v.key === key)?.label || key;
const penaltyLabel = (key: string) =>
  PENALTY_TYPES.find((p) => p.key === key)?.label || key;
const violationLabelEn = (key: string) => VIOLATION_LABELS_EN[key] || key;
const penaltyLabelEn = (key: string) => PENALTY_LABELS_EN[key] || key;

const fmtIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
const isoToDate = (iso: string) => new Date(`${iso}T00:00:00`);
const fmtAr = (iso: string) => {
  if (!iso) return "";
  try {
    return isoToDate(iso).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};
const fmtEn = (iso: string) => {
  if (!iso) return "";
  try {
    return isoToDate(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

function ViolationNoticeTab({ logoUrl }: { logoUrl: string }) {
  const { toast } = useToast();
  const { data: usersResp } = useQuery<any>({
    queryKey: ["/api/users"],
    staleTime: 5 * 60 * 1000,
  });
  const usersList: any[] = Array.isArray(usersResp)
    ? usersResp
    : Array.isArray(usersResp?.data)
      ? usersResp.data
      : [];

  const { data: sysSettings } = useQuery<any>({
    queryKey: ["/api/settings/system"],
    staleTime: 5 * 60 * 1000,
  });
  const settingsObj: Record<string, any> = Array.isArray(sysSettings)
    ? sysSettings.reduce((acc: any, s: any) => {
        acc[s.setting_key] = s.setting_value;
        return acc;
      }, {})
    : {};
  const companyNameAr = settingsObj.companyName || "مصنع أكياس البلاستيك الحديث";
  const companyNameEn = "Modern Plastic Bag Factory";

  const [selectedUserId, setSelectedUserId] = useState("");
  const [manualName, setManualName] = useState("");
  const [noticeDate, setNoticeDate] = useState(todayISO());
  const [violations, setViolations] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [penalties, setPenalties] = useState<string[]>([]);
  const [deductionAmount, setDeductionAmount] = useState("");
  const [ackOverride, setAckOverride] = useState<string | null>(null);
  const printArea = useRef<HTMLDivElement>(null);
  const printAreaEn = useRef<HTMLDivElement>(null);

  const upd = (k: string, v: any) =>
    setDetails((d) => ({ ...d, [k]: v }));

  const userOptions: SearchableSelectOption[] = usersList.map((u) => ({
    value: String(u.id),
    label:
      u.display_name_ar ||
      u.display_name ||
      u.full_name ||
      u.username ||
      `#${u.id}`,
  }));

  const selectedUser = usersList.find((u) => String(u.id) === selectedUserId);
  const employeeName =
    manualName.trim() ||
    selectedUser?.display_name_ar ||
    selectedUser?.display_name ||
    selectedUser?.full_name ||
    selectedUser?.username ||
    "";

  const toggleViolation = (key: string) => {
    setViolations((prev) => {
      const exists = prev.includes(key);
      const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
      if (!exists) {
        setDetails((d) => {
          const nd = { ...d };
          if (key === "early_leave" && !nd.earlyLeaveDate)
            nd.earlyLeaveDate = todayISO();
          if (key === "late" && !nd.lateDate) nd.lateDate = todayISO();
          if (key === "tasks") {
            if (!nd.tasksDate) nd.tasksDate = todayISO();
            if (!nd.tasksDesc)
              nd.tasksDesc =
                "لم يقم الموظف بإنجاز المهام الموكلة إليه على الوجه المطلوب وفي الوقت المحدد.";
          }
          if (key === "negligence") {
            if (!nd.negligenceDate) nd.negligenceDate = todayISO();
            if (!nd.negligenceDesc)
              nd.negligenceDesc =
                "أظهر الموظف إهمالاً في أداء واجباته الوظيفية مما أثر على سير العمل.";
          }
          if (key === "absence" && !nd.absenceMode) nd.absenceMode = "days";
          return nd;
        });
      }
      return next;
    });
  };

  const togglePenalty = (key: string) => {
    setPenalties((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const violationPhrase = (key: string): string => {
    switch (key) {
      case "absence": {
        if (details.absenceMode === "range") {
          if (details.absenceFrom && details.absenceTo)
            return `الغياب بدون عذر من ${fmtAr(details.absenceFrom)} إلى ${fmtAr(
              details.absenceTo,
            )}`;
          return "الغياب بدون عذر";
        }
        const days: string[] = details.absenceDays || [];
        if (days.length)
          return `الغياب بدون عذر بتاريخ: ${days
            .slice()
            .sort()
            .map(fmtAr)
            .join("، ")}`;
        return "الغياب بدون عذر";
      }
      case "early_leave":
        return `الانسحاب قبل نهاية الدوام${
          details.earlyLeaveDate ? ` بتاريخ ${fmtAr(details.earlyLeaveDate)}` : ""
        }${details.earlyLeaveTime ? ` الساعة ${details.earlyLeaveTime}` : ""}`;
      case "late":
        return `التأخر في الحضور${
          details.lateDate ? ` بتاريخ ${fmtAr(details.lateDate)}` : ""
        }${details.lateTime ? ` الساعة ${details.lateTime}` : ""}`;
      case "tasks":
        return `عدم القيام بالمهام الموكلة${
          details.tasksDate ? ` بتاريخ ${fmtAr(details.tasksDate)}` : ""
        }${details.tasksDesc ? ` — ${details.tasksDesc}` : ""}`;
      case "negligence":
        return `الإهمال الوظيفي${
          details.negligenceDate ? ` بتاريخ ${fmtAr(details.negligenceDate)}` : ""
        }${details.negligenceDesc ? ` — ${details.negligenceDesc}` : ""}`;
      default:
        return violationLabel(key);
    }
  };

  const violationPhrases = violations.map(violationPhrase);

  const dedAmt = (() => {
    const n = parseFloat(deductionAmount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();

  const penaltyPhrases = penalties.map((p) =>
    p === "deduction"
      ? `خصم مالي${dedAmt > 0 ? ` بمبلغ ${formatNumberAr(dedAmt, 2)} ريال` : ""}`
      : penaltyLabel(p),
  );

  const violationPhraseEn = (key: string): string => {
    switch (key) {
      case "absence": {
        if (details.absenceMode === "range") {
          if (details.absenceFrom && details.absenceTo)
            return `Unexcused absence from ${fmtEn(details.absenceFrom)} to ${fmtEn(
              details.absenceTo,
            )}`;
          return "Unexcused absence";
        }
        const days: string[] = details.absenceDays || [];
        if (days.length)
          return `Unexcused absence on: ${days
            .slice()
            .sort()
            .map(fmtEn)
            .join(", ")}`;
        return "Unexcused absence";
      }
      case "early_leave":
        return `Leaving before end of shift${
          details.earlyLeaveDate ? ` on ${fmtEn(details.earlyLeaveDate)}` : ""
        }${details.earlyLeaveTime ? ` at ${details.earlyLeaveTime}` : ""}`;
      case "late":
        return `Late attendance${
          details.lateDate ? ` on ${fmtEn(details.lateDate)}` : ""
        }${details.lateTime ? ` at ${details.lateTime}` : ""}`;
      case "tasks":
        return `Failure to perform assigned duties${
          details.tasksDate ? ` on ${fmtEn(details.tasksDate)}` : ""
        }${details.tasksDesc ? ` — ${details.tasksDesc}` : ""}`;
      case "negligence":
        return `Job negligence${
          details.negligenceDate ? ` on ${fmtEn(details.negligenceDate)}` : ""
        }${details.negligenceDesc ? ` — ${details.negligenceDesc}` : ""}`;
      default:
        return violationLabelEn(key);
    }
  };

  const violationPhrasesEn = violations.map(violationPhraseEn);

  const penaltyPhrasesEn = penalties.map((p) =>
    p === "deduction"
      ? `Financial Deduction${dedAmt > 0 ? ` of ${dedAmt.toFixed(2)} SAR` : ""}`
      : penaltyLabelEn(p),
  );

  const generatedAck = useMemo(() => {
    const name = employeeName || "..............";
    const list = violations.length
      ? violations.map((v) => `(${violationLabel(v)})`).join("، ")
      : "............";
    const pen = penalties.length
      ? ` كما أُحطت علماً بالجزاء المترتب: ${penaltyPhrases.join("، ")}.`
      : "";
    return `أقر أنا الموظف / ${name} بأنني اطّلعت على هذا الإشعار، وأقر بارتكابي المخالفة/المخالفات التالية: ${list}. وأتعهد بعدم تكرار ذلك مستقبلاً، وأتحمل المسؤولية الكاملة عن أي تكرار.${pen}`;
  }, [employeeName, violations, penalties, penaltyPhrases]);

  const ackText = ackOverride !== null ? ackOverride : generatedAck;

  const ackTextEn = useMemo(() => {
    const name = employeeName || "..............";
    const list = violationPhrasesEn.length
      ? violationPhrasesEn.join("; ")
      : "............";
    const pen = penaltyPhrasesEn.length
      ? ` I have also been informed of the resulting penalty: ${penaltyPhrasesEn.join(
          ", ",
        )}.`
      : "";
    return `I, the employee ${name}, acknowledge that I have reviewed this notice and admit committing the following violation(s): ${list}. I undertake not to repeat this in the future and accept full responsibility for any recurrence.${pen}`;
  }, [employeeName, violationPhrasesEn, penaltyPhrasesEn]);

  const employeeKey = selectedUserId
    ? `user:${selectedUserId}`
    : manualName.trim()
      ? `external:${manualName.trim().toLowerCase()}`
      : "";
  const priorCountKey = employeeKey;

  const resetForm = () => {
    setSelectedUserId("");
    setManualName("");
    setNoticeDate(todayISO());
    setViolations([]);
    setDetails({});
    setPenalties([]);
    setDeductionAmount("");
    setAckOverride(null);
  };

  const docsCtx = useAdminDocs<any>({
    docType: "violation_notice",
    getPayload: () => ({
      reference: employeeName || "موظف",
      title: `${fmtAr(noticeDate)} — ${violations.length} مخالفة`,
      data: {
        selectedUserId,
        manualName,
        employeeName,
        employeeKey,
        noticeDate,
        violations,
        details,
        penalties,
        deductionAmount,
        acknowledgment: ackText,
      },
    }),
    applyDoc: (data) => {
      setSelectedUserId(data?.selectedUserId || "");
      setManualName(data?.manualName || "");
      setNoticeDate(data?.noticeDate || todayISO());
      setViolations(Array.isArray(data?.violations) ? data.violations : []);
      setDetails(data?.details && typeof data.details === "object" ? data.details : {});
      setPenalties(Array.isArray(data?.penalties) ? data.penalties : []);
      setDeductionAmount(data?.deductionAmount || "");
      setAckOverride(typeof data?.acknowledgment === "string" ? data.acknowledgment : null);
    },
    resetForm,
  });

  const priorNotices = docsCtx.docs.filter((d) => {
    if (priorCountKey === "" || d.id === docsCtx.currentId) return false;
    const docKey =
      d.data?.employeeKey ||
      (d.data?.selectedUserId
        ? `user:${d.data.selectedUserId}`
        : d.reference?.trim()
          ? `external:${d.reference.trim().toLowerCase()}`
          : "");
    return docKey === priorCountKey;
  });

  const handlePrint = () =>
    printRef(printArea.current, `Violation-${employeeName}-${noticeDate}`);
  const handlePrintEn = () =>
    printRef(
      printAreaEn.current,
      `Violation-${employeeName}-${noticeDate}`,
      "ltr",
      "en",
    );

  const validate = (): string | null => {
    if (!employeeName) {
      toast({
        title: "تنبيه",
        description: "اختر اسم الموظف أو اكتبه",
        variant: "destructive",
      });
      return "no-name";
    }
    if (violations.length === 0) {
      toast({
        title: "تنبيه",
        description: "اختر نوع المخالفة (نوع واحد على الأقل)",
        variant: "destructive",
      });
      return "no-violation";
    }
    if (violations.includes("absence")) {
      const hasDays = (details.absenceDays || []).length > 0;
      const hasRange = details.absenceFrom && details.absenceTo;
      if (details.absenceMode === "range" ? !hasRange : !hasDays) {
        toast({
          title: "تنبيه",
          description: "حدد أيام الغياب أو نطاق التاريخ",
          variant: "destructive",
        });
        return "no-absence-dates";
      }
    }
    const requiredDates: [string, string, string][] = [
      ["early_leave", details.earlyLeaveDate, "حدد تاريخ الانسحاب قبل نهاية الدوام"],
      ["late", details.lateDate, "حدد تاريخ التأخير في الحضور"],
      ["tasks", details.tasksDate, "حدد تاريخ مخالفة عدم القيام بالمهام"],
      ["negligence", details.negligenceDate, "حدد تاريخ مخالفة الإهمال الوظيفي"],
    ];
    for (const [key, value, msg] of requiredDates) {
      if (violations.includes(key) && !value) {
        toast({ title: "تنبيه", description: msg, variant: "destructive" });
        return `no-date-${key}`;
      }
    }
    if (penalties.includes("deduction")) {
      const n = parseFloat(deductionAmount);
      if (!Number.isFinite(n) || n <= 0) {
        toast({
          title: "تنبيه",
          description: "أدخل مبلغ الخصم المالي (رقم موجب)",
          variant: "destructive",
        });
        return "no-deduction";
      }
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>اسم الموظف</Label>
              <SearchableSelect
                options={userOptions}
                value={selectedUserId}
                onValueChange={(v) => {
                  setSelectedUserId(v);
                  if (v) setManualName("");
                }}
                placeholder="اختر من قائمة المستخدمين"
                searchPlaceholder="ابحث عن مستخدم..."
              />
              <Input
                value={manualName}
                onChange={(e) => {
                  setManualName(e.target.value);
                  if (e.target.value) setSelectedUserId("");
                }}
                placeholder="أو اكتب اسماً من خارج القائمة"
                data-testid="input-violation-manual-name"
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الإشعار</Label>
              <Input
                type="date"
                value={noticeDate}
                onChange={(e) => setNoticeDate(e.target.value)}
                data-testid="input-violation-notice-date"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                نوع المخالفة (اختيار متعدد)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VIOLATION_TYPES.map((v) => (
                  <label
                    key={v.key}
                    className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={violations.includes(v.key)}
                      onCheckedChange={() => toggleViolation(v.key)}
                      data-testid={`check-violation-${v.key}`}
                    />
                    <span className="text-sm">{v.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {violations.length > 0 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                تفاصيل المخالفة
              </Label>

              {violations.includes("absence") && (
                <div className="rounded-md border p-3 space-y-3">
                  <div className="font-medium text-sm">غياب بدون عذر</div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        details.absenceMode !== "range" ? "default" : "outline"
                      }
                      onClick={() => upd("absenceMode", "days")}
                    >
                      أيام محددة
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        details.absenceMode === "range" ? "default" : "outline"
                      }
                      onClick={() => upd("absenceMode", "range")}
                    >
                      نطاق (من - إلى)
                    </Button>
                  </div>
                  {details.absenceMode === "range" ? (
                    <Calendar
                      mode="range"
                      selected={{
                        from: details.absenceFrom
                          ? isoToDate(details.absenceFrom)
                          : undefined,
                        to: details.absenceTo
                          ? isoToDate(details.absenceTo)
                          : undefined,
                      }}
                      onSelect={(range: any) => {
                        upd("absenceFrom", range?.from ? fmtIso(range.from) : "");
                        upd("absenceTo", range?.to ? fmtIso(range.to) : "");
                      }}
                      className="rounded-md border"
                    />
                  ) : (
                    <Calendar
                      mode="multiple"
                      selected={(details.absenceDays || []).map(isoToDate)}
                      onSelect={(days: any) =>
                        upd(
                          "absenceDays",
                          ((days as Date[]) || []).map(fmtIso),
                        )
                      }
                      className="rounded-md border"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {violationPhrase("absence")}
                  </p>
                </div>
              )}

              {violations.includes("early_leave") && (
                <div className="rounded-md border p-3 space-y-3">
                  <div className="font-medium text-sm">
                    انسحاب قبل نهاية الدوام
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">التاريخ</Label>
                      <Input
                        type="date"
                        value={details.earlyLeaveDate || ""}
                        onChange={(e) => upd("earlyLeaveDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">الوقت (اختياري)</Label>
                      <Input
                        type="time"
                        value={details.earlyLeaveTime || ""}
                        onChange={(e) => upd("earlyLeaveTime", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {violations.includes("late") && (
                <div className="rounded-md border p-3 space-y-3">
                  <div className="font-medium text-sm">تأخير حضور</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">التاريخ</Label>
                      <Input
                        type="date"
                        value={details.lateDate || ""}
                        onChange={(e) => upd("lateDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">الوقت (اختياري)</Label>
                      <Input
                        type="time"
                        value={details.lateTime || ""}
                        onChange={(e) => upd("lateTime", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {violations.includes("tasks") && (
                <div className="rounded-md border p-3 space-y-3">
                  <div className="font-medium text-sm">
                    عدم القيام بالمهام الموكلة
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">التاريخ</Label>
                    <Input
                      type="date"
                      value={details.tasksDate || ""}
                      onChange={(e) => upd("tasksDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">الوصف (قابل للتعديل)</Label>
                    <Textarea
                      rows={2}
                      value={details.tasksDesc || ""}
                      onChange={(e) => upd("tasksDesc", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {violations.includes("negligence") && (
                <div className="rounded-md border p-3 space-y-3">
                  <div className="font-medium text-sm">الإهمال الوظيفي</div>
                  <div className="space-y-1">
                    <Label className="text-xs">التاريخ</Label>
                    <Input
                      type="date"
                      value={details.negligenceDate || ""}
                      onChange={(e) => upd("negligenceDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">الوصف (قابل للتعديل)</Label>
                    <Textarea
                      rows={2}
                      value={details.negligenceDesc || ""}
                      onChange={(e) => upd("negligenceDesc", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-3">
            <Label className="text-base font-semibold">
              الجزاء (اختيار متعدد)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PENALTY_TYPES.map((p) => (
                <label
                  key={p.key}
                  className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox
                    checked={penalties.includes(p.key)}
                    onCheckedChange={() => togglePenalty(p.key)}
                    data-testid={`check-penalty-${p.key}`}
                  />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
            </div>
            {penalties.includes("deduction") && (
              <div className="space-y-1">
                <Label className="text-xs">مبلغ الخصم (ريال)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(e.target.value)}
                  placeholder="0"
                  data-testid="input-deduction-amount"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <AdminDocsActions
          ctx={docsCtx}
          onPrint={handlePrint}
          onPrintEn={handlePrintEn}
          onValidate={validate}
        />
        <AdminDocsPanel label="إشعارات محفوظة" ctx={docsCtx} />
        <AdminDocsDeleteDialog ctx={docsCtx} />
      </div>

      <div className="space-y-4">
        {priorCountKey !== "" && (
          <Card
            className={
              priorNotices.length > 0
                ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20"
                : ""
            }
          >
            <CardContent className="pt-6 space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                سجل المخالفات السابقة لـ {employeeName}
              </Label>
              {priorNotices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا توجد مخالفات سابقة مسجلة لهذا الموظف
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    عدد المخالفات السابقة: {priorNotices.length}
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc pe-4 space-y-1 max-h-32 overflow-y-auto">
                    {priorNotices.map((d) => (
                      <li key={d.id}>{d.title || d.reference}</li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-3">
            <Label className="text-base font-semibold">ملخص الإشعار</Label>
            <div className="rounded-md border p-3 space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">الموظف: </span>
                <span className="font-medium">{employeeName || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">التاريخ: </span>
                <span className="font-medium">{fmtAr(noticeDate)}</span>
              </div>
              <div className="pt-1">
                <span className="text-muted-foreground">المخالفات:</span>
                {violationPhrases.length === 0 ? (
                  <span className="ms-1">-</span>
                ) : (
                  <ul className="list-disc pe-5 mt-1 space-y-1">
                    {violationPhrases.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="pt-1">
                <span className="text-muted-foreground">الجزاء:</span>
                {penaltyPhrases.length === 0 ? (
                  <span className="ms-1">-</span>
                ) : (
                  <ul className="list-disc pe-5 mt-1 space-y-1">
                    {penaltyPhrases.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">إقرار الموظف</Label>
                {ackOverride !== null && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setAckOverride(null)}
                  >
                    <RotateCcw className="h-3 w-3 me-1" /> إعادة توليد
                  </Button>
                )}
              </div>
              <Textarea
                rows={4}
                value={ackText}
                onChange={(e) => setAckOverride(e.target.value)}
                data-testid="textarea-acknowledgment"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden printable area */}
      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <div className="doc-header">
            <img src={logoUrl} alt="logo" />
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1 className="doc-title">{companyNameAr}</h1>
              <p
                className="doc-subtitle"
                style={{ fontSize: 14, fontWeight: 600, color: "#333" }}
              >
                {companyNameEn}
              </p>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
                إشعار مخالفة
              </div>
            </div>
            <div style={{ width: 64 }} />
          </div>
          <div className="doc-meta">
            <div>
              <b>الموظف:</b> {employeeName || "-"}
            </div>
            <div>
              <b>التاريخ:</b> {fmtAr(noticeDate)}
            </div>
          </div>
          <h2 className="section">نوع المخالفة</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>المخالفة</th>
              </tr>
            </thead>
            <tbody>
              {violationPhrases.length === 0 ? (
                <tr>
                  <td colSpan={2}>-</td>
                </tr>
              ) : (
                violationPhrases.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{p}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <h2 className="section">الجزاء</h2>
          <table>
            <tbody>
              {penaltyPhrases.length === 0 ? (
                <tr>
                  <td>-</td>
                </tr>
              ) : (
                penaltyPhrases.map((p, i) => (
                  <tr key={i}>
                    <td>{p}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <h2 className="section">إقرار الموظف</h2>
          <div className="body-text">{ackText}</div>
          <SignatureBlock
            labels={[
              { label: "توقيع الموظف", name: employeeName },
              { label: "المدير المباشر" },
              { label: "المدير العام" },
            ]}
          />
          <div className="footer">
            تم إصدار هذا الإشعار إلكترونياً • نظام MPBF
          </div>
        </div>
      </div>

      {/* Hidden printable area — English (LTR) */}
      <div style={{ display: "none" }}>
        <div ref={printAreaEn} className="doc">
          <div className="doc-header">
            <img src={logoUrl} alt="logo" />
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1 className="doc-title">{companyNameEn}</h1>
              <p
                className="doc-subtitle"
                style={{ fontSize: 14, fontWeight: 600, color: "#333" }}
              >
                {companyNameAr}
              </p>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
                Violation Notice
              </div>
            </div>
            <div style={{ width: 64 }} />
          </div>
          <div className="doc-meta">
            <div>
              <b>Employee:</b> {employeeName || "-"}
            </div>
            <div>
              <b>Date:</b> {fmtEn(noticeDate)}
            </div>
          </div>
          <h2 className="section">Violation Type</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Violation</th>
              </tr>
            </thead>
            <tbody>
              {violationPhrasesEn.length === 0 ? (
                <tr>
                  <td colSpan={2}>-</td>
                </tr>
              ) : (
                violationPhrasesEn.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{p}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <h2 className="section">Penalty</h2>
          <table>
            <tbody>
              {penaltyPhrasesEn.length === 0 ? (
                <tr>
                  <td>-</td>
                </tr>
              ) : (
                penaltyPhrasesEn.map((p, i) => (
                  <tr key={i}>
                    <td>{p}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <h2 className="section">Employee Acknowledgment</h2>
          <div className="body-text">{ackTextEn}</div>
          <SignatureBlock
            labels={[
              { label: "Employee Signature", name: employeeName },
              { label: "Direct Manager" },
              { label: "General Manager" },
            ]}
          />
          <div className="footer">
            This notice was issued electronically • MPBF System
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------- Cash Disbursement Voucher ----------------------------------
type VoucherItem = {
  id: string;
  amount: string;
  description: string;
  signature: string;
};

const newVoucherItem = (): VoucherItem => ({
  id: Math.random().toString(36).slice(2),
  amount: "",
  description: "",
  signature: "",
});

function CashVoucherTab({ logoUrl }: { logoUrl: string }) {
  const { toast } = useToast();

  const { data: sysSettings } = useQuery<any>({
    queryKey: ["/api/settings/system"],
    staleTime: 5 * 60 * 1000,
  });
  const settingsObj: Record<string, any> = Array.isArray(sysSettings)
    ? sysSettings.reduce((acc: any, s: any) => {
        acc[s.setting_key] = s.setting_value;
        return acc;
      }, {})
    : {};
  const companyNameAr = settingsObj.companyName || "مصنع أكياس البلاستيك الحديث";
  const companyNameEn = "Modern Plastic Bag Factory";

  const [voucherDate, setVoucherDate] = useState(todayISO());
  const [reference, setReference] = useState(
    `CV-${Date.now().toString().slice(-6)}`,
  );
  const [accountName, setAccountName] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<VoucherItem[]>([newVoucherItem()]);
  const printArea = useRef<HTMLDivElement>(null);

  const updItem = (id: string, k: keyof VoucherItem, v: string) =>
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, [k]: v } : it)));

  const addItem = () => setItems((arr) => [...arr, newVoucherItem()]);

  const removeItem = (id: string) =>
    setItems((arr) =>
      arr.length > 1 ? arr.filter((it) => it.id !== id) : arr,
    );

  const total = useMemo(
    () =>
      items.reduce((sum, it) => {
        const n = parseFloat(it.amount);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0),
    [items],
  );

  const resetForm = () => {
    setVoucherDate(todayISO());
    setReference(`CV-${Date.now().toString().slice(-6)}`);
    setAccountName("");
    setNotes("");
    setItems([newVoucherItem()]);
  };

  const docsCtx = useAdminDocs<any>({
    docType: "cash_voucher",
    getPayload: () => ({
      reference,
      title: `${accountName || "سند صرف"} — ${formatNumberAr(total)}`,
      data: { voucherDate, reference, accountName, notes, items },
    }),
    applyDoc: (data, ref) => {
      setReference(ref || data?.reference || "");
      setVoucherDate(data?.voucherDate || todayISO());
      setAccountName(data?.accountName || "");
      setNotes(data?.notes || "");
      setItems(
        Array.isArray(data?.items) && data.items.length > 0
          ? data.items.map((it: any) => ({
              id: it.id || Math.random().toString(36).slice(2),
              amount: String(it.amount ?? ""),
              description: String(it.description ?? ""),
              signature: String(it.signature ?? ""),
            }))
          : [newVoucherItem()],
      );
    },
    resetForm,
  });

  const validate = (): string | null => {
    const filled = items.filter(
      (it) => it.amount.trim() !== "" || it.description.trim() !== "",
    );
    if (filled.length === 0) {
      toast({
        title: "تنبيه",
        description: "أضف بنداً واحداً على الأقل قبل الحفظ",
        variant: "destructive",
      });
      return "no-items";
    }
    return null;
  };

  const handlePrint = () => {
    if (validate()) return;
    printRef(printArea.current, `Voucher-${reference}`);
  };

  const printItems = items.filter(
    (it) => it.amount.trim() !== "" || it.description.trim() !== "",
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>رقم السند</Label>
                  <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    data-testid="input-voucher-reference"
                  />
                </div>
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    data-testid="input-voucher-date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>اسم الحساب المصروف له</Label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="مثال: المصروفات النثرية / اسم الموظف / المورد"
                  data-testid="input-voucher-account"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-green-600" />
                    بنود الصرف
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addItem}
                    data-testid="btn-add-voucher-item"
                  >
                    <Plus className="h-4 w-4 me-1" /> إضافة بند
                  </Button>
                </div>
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-center w-10">م</th>
                        <th className="p-2 text-start">البيان</th>
                        <th className="p-2 text-start w-28">المبلغ</th>
                        <th className="p-2 text-start w-32">توقيع</th>
                        <th className="p-2 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, i) => (
                        <tr key={it.id} className="border-t align-top">
                          <td className="p-2 text-center text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="p-2">
                            <Input
                              value={it.description}
                              onChange={(e) =>
                                updItem(it.id, "description", e.target.value)
                              }
                              placeholder="بيان الصرف"
                              data-testid={`input-voucher-desc-${i}`}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={it.amount}
                              onChange={(e) =>
                                updItem(it.id, "amount", e.target.value)
                              }
                              placeholder="0.00"
                              data-testid={`input-voucher-amount-${i}`}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={it.signature}
                              onChange={(e) =>
                                updItem(it.id, "signature", e.target.value)
                              }
                              placeholder="الاسم/التوقيع"
                              data-testid={`input-voucher-sign-${i}`}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeItem(it.id)}
                              disabled={items.length <= 1}
                              aria-label="حذف البند"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-muted/50 font-semibold">
                        <td className="p-2 text-center" colSpan={2}>
                          إجمالي المبالغ
                        </td>
                        <td className="p-2" colSpan={3}>
                          {formatNumberAr(total)} ريال
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="أي ملاحظات إضافية على السند"
                  data-testid="input-voucher-notes"
                />
              </div>
            </CardContent>
          </Card>

          <AdminDocsActions
            ctx={docsCtx}
            onPrint={handlePrint}
            onValidate={validate}
          />
          <AdminDocsPanel label="سندات محفوظة" ctx={docsCtx} />
          <AdminDocsDeleteDialog ctx={docsCtx} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border p-4 bg-white text-black text-sm space-y-3">
                <div className="text-center border-b pb-2">
                  <div className="font-bold text-base">{companyNameAr}</div>
                  <div className="text-xs text-gray-600">{companyNameEn}</div>
                  <div className="mt-1 font-semibold">سند صرف نقدي</div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>
                    <b>رقم السند:</b> {reference || "-"}
                  </span>
                  <span>
                    <b>التاريخ:</b> {fmtAr(voucherDate)}
                  </span>
                </div>
                <div className="text-xs">
                  <b>صُرف إلى:</b> {accountName || "-"}
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-1 w-8">م</th>
                      <th className="border p-1 text-start">البيان</th>
                      <th className="border p-1 w-20 text-start">المبلغ</th>
                      <th className="border p-1 w-24 text-start">توقيع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printItems.length === 0 ? (
                      <tr>
                        <td className="border p-1 text-center" colSpan={4}>
                          -
                        </td>
                      </tr>
                    ) : (
                      printItems.map((it, i) => (
                        <tr key={it.id}>
                          <td className="border p-1 text-center">{i + 1}</td>
                          <td className="border p-1">{it.description || "-"}</td>
                          <td className="border p-1">
                            {it.amount
                              ? formatNumberAr(parseFloat(it.amount) || 0)
                              : "-"}
                          </td>
                          <td className="border p-1">{it.signature || ""}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td className="border p-1 text-center" colSpan={2}>
                        الإجمالي
                      </td>
                      <td className="border p-1" colSpan={2}>
                        {formatNumberAr(total)} ريال
                      </td>
                    </tr>
                  </tfoot>
                </table>
                {notes && (
                  <div className="text-xs">
                    <b>ملاحظات:</b> {notes}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                هذه معاينة مبسطة. اضغط «طباعة A4» للحصول على النموذج الكامل.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden printable area */}
      <div style={{ display: "none" }}>
        <div ref={printArea} className="doc">
          <div className="doc-header">
            <img src={logoUrl} alt="logo" />
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1 className="doc-title">{companyNameAr}</h1>
              <p
                className="doc-subtitle"
                style={{ fontSize: 14, fontWeight: 600, color: "#333" }}
              >
                {companyNameEn}
              </p>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
                سند صرف نقدي
              </div>
            </div>
            <div style={{ width: 64 }} />
          </div>
          <div className="doc-meta">
            <div>
              <b>رقم السند:</b> {reference || "-"}
            </div>
            <div>
              <b>التاريخ:</b> {fmtAr(voucherDate)}
            </div>
            <div>
              <b>صُرف إلى:</b> {accountName || "-"}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>م</th>
                <th>البيان</th>
                <th style={{ width: 120 }}>المبلغ</th>
                <th style={{ width: 140 }}>توقيع</th>
              </tr>
            </thead>
            <tbody>
              {printItems.length === 0 ? (
                <tr>
                  <td colSpan={4}>-</td>
                </tr>
              ) : (
                printItems.map((it, i) => (
                  <tr key={it.id}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td>{it.description || "-"}</td>
                    <td>
                      {it.amount
                        ? formatNumberAr(parseFloat(it.amount) || 0)
                        : "-"}
                    </td>
                    <td>{it.signature || ""}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ fontWeight: 700, textAlign: "center" }}>
                  إجمالي المبالغ
                </td>
                <td colSpan={2} style={{ fontWeight: 700 }}>
                  {formatNumberAr(total)} ريال
                </td>
              </tr>
            </tfoot>
          </table>
          {notes && (
            <>
              <h2 className="section">ملاحظات</h2>
              <div className="body-text">{notes}</div>
            </>
          )}
          <SignatureBlock
            labels={[
              { label: "المستلم" },
              { label: "المحاسب" },
              { label: "المدير" },
            ]}
          />
          <div className="footer">
            تم إصدار هذا السند إلكترونياً • نظام MPBF
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminToolsPage() {
  const { t } = useTranslation();
  const { logoUrl } = useCompanyLogo();
  const { user } = useAuth();
  const [tab, setTab] = useState<string>("delivery");
  const canUseModernAgent = userHasPermission(user, [
    "use_modern_agent",
    "manage_modern_agent",
  ]);

  return (
    <PageLayout
      title={t("adminTools.title", "الأدوات الإدارية")}
      description={t(
        "adminTools.description",
        "نماذج وقوالب جاهزة لتسريع الأعمال الإدارية اليومية",
      )}
    >
      <Tabs value={tab} onValueChange={setTab} dir="rtl">
        <TabsList
          className={`grid grid-cols-2 ${canUseModernAgent ? "md:grid-cols-10" : "md:grid-cols-9"} h-auto w-full bg-muted p-1 gap-1`}
        >
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            <span className="hidden sm:inline">إخلاء مسؤولية</span>
            <span className="sm:hidden">تسليم</span>
          </TabsTrigger>
          <TabsTrigger value="order" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">أمر إداري</span>
            <span className="sm:hidden">أمر</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">تقرير مخصص</span>
            <span className="sm:hidden">تقرير</span>
          </TabsTrigger>
          <TabsTrigger value="meeting" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            <span className="hidden sm:inline">محضر اجتماع</span>
            <span className="sm:hidden">اجتماع</span>
          </TabsTrigger>
          <TabsTrigger value="handover" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">تسليم عهدة</span>
            <span className="sm:hidden">عهدة</span>
          </TabsTrigger>
          <TabsTrigger value="route" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">كشف توصيل</span>
            <span className="sm:hidden">توصيل</span>
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">حساب راتب موظف</span>
            <span className="sm:hidden">راتب</span>
          </TabsTrigger>
          <TabsTrigger value="violation" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">إشعار مخالفة</span>
            <span className="sm:hidden">مخالفة</span>
          </TabsTrigger>
          <TabsTrigger value="voucher" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">سند صرف</span>
            <span className="sm:hidden">سند صرف</span>
          </TabsTrigger>
          {canUseModernAgent && (
            <TabsTrigger value="modern-agent" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">{t("modernAgent.title")}</span>
              <span className="sm:hidden">{t("modernAgent.title")}</span>
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="delivery" className="border-0 mt-4">
          <DeliveryDisclaimerTab logoUrl={logoUrl} />
        </TabsContent>
        <TabsContent value="order" className="border-0 mt-4">
          <AdminOrderTab logoUrl={logoUrl} />
        </TabsContent>
        <TabsContent value="report" className="border-0 mt-4">
          <CustomReportTab logoUrl={logoUrl} />
        </TabsContent>
        <TabsContent value="meeting" className="border-0 mt-4">
          <MeetingMinutesTab logoUrl={logoUrl} />
        </TabsContent>
        <TabsContent value="handover" className="border-0 mt-4">
          <AssetHandoverTab logoUrl={logoUrl} />
        </TabsContent>
        <TabsContent value="route" className="border-0 mt-4">
          <DeliveryRouteTab logoUrl={logoUrl} />
        </TabsContent>
        <TabsContent value="salary" className="border-0 mt-4">
          <SalaryCalculatorTab logoUrl={logoUrl} />
        </TabsContent>
        <TabsContent value="violation" className="border-0 mt-4">
          <ViolationNoticeTab logoUrl={logoUrl} />
        </TabsContent>
        <TabsContent value="voucher" className="border-0 mt-4">
          <CashVoucherTab logoUrl={logoUrl} />
        </TabsContent>
        {canUseModernAgent && (
          <TabsContent value="modern-agent" className="border-0 mt-4">
            <ModernAgent embedded />
          </TabsContent>
        )}
      </Tabs>
    </PageLayout>
  );
}
