import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  Pencil,
  Printer,
  Loader2,
  Hash,
  User,
  Calendar,
  Recycle,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { formatNumberAr } from "../../../../shared/number-utils";
import { useCompanyLogo } from "../../hooks/use-company-logo";

type WasteVoucherIn = {
  id: number;
  voucher_number: string;
  waste_type: string;
  quantity: string;
  unit: string;
  source: string | null;
  notes: string | null;
  voucher_date: string;
  received_by_name?: string | null;
  received_by_username?: string | null;
};

type WasteVoucherOut = {
  id: number;
  voucher_number: string;
  waste_type: string;
  quantity: string;
  unit: string;
  company_name: string;
  driver_name: string | null;
  vehicle_number: string | null;
  notes: string | null;
  voucher_date: string;
  issued_by_name?: string | null;
  issued_by_username?: string | null;
};

const IN_KEY = ["/api/warehouse/vouchers/industrial-waste-in"];
const OUT_KEY = ["/api/warehouse/vouchers/industrial-waste-out"];

const WASTE_TYPE_OPTIONS = [
  "براميل حبر فارغة",
  "كتل بلاستيكة",
  "مخلفات عامة",
];

const WASTE_SOURCE_OPTIONS = ["صالة الإنتاج", "المستودع"];

const UNIT_OPTIONS = ["كيلو", "قطعة"];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printWasteVoucher(opts: {
  voucherNumber: string;
  voucherType: string;
  voucherDate: string;
  warehouse: string;
  title: string;
  factoryName: string;
  logoUrl: string;
  logoAlt: string;
  infoLabels: {
    number: string;
    type: string;
    date: string;
    warehouse: string;
  };
  itemsTableLabel: string;
  itemColumns: { name: string; quantity: string; unit: string };
  items: { name: string; quantity: string; unit: string }[];
  detailRows: { label: string; value: string }[];
  notes: string | null;
  notesLabel: string;
  signatures: string[];
  rtl: boolean;
  lang: string;
}) {
  const dir = opts.rtl ? "rtl" : "ltr";
  const infoHtml = [
    { label: opts.infoLabels.number, value: opts.voucherNumber },
    { label: opts.infoLabels.type, value: opts.voucherType },
    { label: opts.infoLabels.date, value: opts.voucherDate },
    { label: opts.infoLabels.warehouse, value: opts.warehouse },
  ]
    .map(
      (r) =>
        `<tr><td class="lbl">${escapeHtml(r.label)}</td><td>${escapeHtml(
          r.value,
        )}</td></tr>`,
    )
    .join("");
  const itemsRowsHtml = opts.items
    .map(
      (it, i) =>
        `<tr><td>${i + 1}</td><td>${escapeHtml(it.name)}</td><td>${escapeHtml(
          it.quantity,
        )}</td><td>${escapeHtml(it.unit)}</td></tr>`,
    )
    .join("");
  const detailRowsHtml = opts.detailRows
    .filter((r) => r.value && r.value.trim().length > 0)
    .map(
      (r) =>
        `<tr><td class="lbl">${escapeHtml(r.label)}</td><td>${escapeHtml(
          r.value,
        )}</td></tr>`,
    )
    .join("");
  const detailHtml = detailRowsHtml
    ? `<table class="details-table"><tbody>${detailRowsHtml}</tbody></table>`
    : "";
  const notesHtml = opts.notes
    ? `<div class="notes-section"><div class="notes-label">${escapeHtml(
        opts.notesLabel,
      )}:</div><div>${escapeHtml(opts.notes)}</div></div>`
    : "";
  const sigHtml = opts.signatures
    .map(
      (s) => `<div class="sig-box"><div class="sig-line">${escapeHtml(s)}</div></div>`,
    )
    .join("");

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <html dir="${dir}" lang="${escapeHtml(opts.lang)}">
    <head>
      <title>${escapeHtml(opts.title)} - ${escapeHtml(opts.voucherNumber)}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 0; direction: ${dir}; color: #1a1a1a; }
        .voucher-print { width: 100%; max-width: 186mm; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1a56db; padding-bottom: 16px; margin-bottom: 20px; }
        .header img { width: 80px; height: 80px; object-fit: contain; }
        .header-center { text-align: center; flex: 1; }
        .header-center h1 { font-size: 20px; color: #1a56db; margin-bottom: 4px; }
        .header-center h2 { font-size: 16px; color: #555; }
        .section-title { font-size: 14px; font-weight: 700; color: #1a56db; margin: 16px 0 8px; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .details-table td { padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
        .details-table tr:nth-child(even) { background: #f8fafc; }
        .details-table .lbl { font-weight: 600; width: 35%; background-color: #f8fafc; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .items-table th, .items-table td { padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 14px; text-align: center; }
        .items-table th { background-color: #1a56db; color: #fff; font-weight: 700; }
        .items-table tr:nth-child(even) { background: #f8fafc; }
        .notes-section { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
        .notes-label { font-weight: 700; color: #92400e; margin-bottom: 4px; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .sig-box { text-align: center; min-width: 150px; }
        .sig-line { border-top: 1px solid #999; margin-top: 50px; padding-top: 4px; font-size: 13px; color: #666; }
        @media print { body { padding: 0; } .voucher-print { max-width: 100%; } }
      </style>
    </head>
    <body>
      <div class="voucher-print">
        <div class="header">
          <img src="${escapeHtml(opts.logoUrl)}" alt="${escapeHtml(opts.logoAlt)}" />
          <div class="header-center">
            <h1>${escapeHtml(opts.factoryName)}</h1>
            <h2>${escapeHtml(opts.title)}</h2>
          </div>
        </div>
        <table class="details-table"><tbody>${infoHtml}</tbody></table>
        <div class="section-title">${escapeHtml(opts.itemsTableLabel)}</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th>${escapeHtml(opts.itemColumns.name)}</th>
              <th>${escapeHtml(opts.itemColumns.quantity)}</th>
              <th>${escapeHtml(opts.itemColumns.unit)}</th>
            </tr>
          </thead>
          <tbody>${itemsRowsHtml}</tbody>
        </table>
        ${detailHtml}
        ${notesHtml}
        <div class="signatures">${sigHtml}</div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
}

export function IndustrialWasteSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Tabs defaultValue="iw-rec" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 sm:inline-flex sm:flex-nowrap sm:h-10">
          <TabsTrigger
            value="iw-rec"
            className="text-xs px-2 py-1.5 sm:text-sm sm:px-3"
          >
            <ArrowDownToLine className="h-4 w-4 ml-1 shrink-0" />
            {t("warehouse.industrialWaste.recVouchers")}
          </TabsTrigger>
          <TabsTrigger
            value="iw-del"
            className="text-xs px-2 py-1.5 sm:text-sm sm:px-3"
          >
            <ArrowUpFromLine className="h-4 w-4 ml-1 shrink-0" />
            {t("warehouse.industrialWaste.delVouchers")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iw-rec">
          <WasteInList />
        </TabsContent>

        <TabsContent value="iw-del">
          <WasteOutList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WasteInList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const { logoUrl } = useCompanyLogo();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVoucher, setEditVoucher] = useState<WasteVoucherIn | null>(null);

  const { data: vouchers = [], isLoading } = useQuery<WasteVoucherIn[]>({
    queryKey: IN_KEY,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/warehouse/vouchers/industrial-waste-in/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IN_KEY });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/warehouse/production-hall"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/warehouse/delivery-hall"],
      });
      toast({ title: t("warehouse.industrialWaste.deleteSuccess") });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({
        title: t("warehouse.industrialWaste.deleteError"),
        description: err?.message,
        variant: "destructive",
      });
    },
  });

  const handlePrint = (v: WasteVoucherIn) => {
    printWasteVoucher({
      voucherNumber: v.voucher_number,
      voucherType: t("warehouse.industrialWaste.recFormTitle"),
      voucherDate: v.voucher_date,
      warehouse: t("warehouse.tabs.industrialWaste"),
      title: t("warehouse.industrialWaste.recFormTitle"),
      factoryName: t("warehouse.print.factoryName"),
      logoUrl,
      logoAlt: t("warehouse.print.factoryLogo"),
      infoLabels: {
        number: t("warehouse.print.voucherNumberLabel"),
        type: t("warehouse.print.voucherTypeLabel"),
        date: t("warehouse.industrialWaste.date"),
        warehouse: t("warehouse.print.warehouseLabel"),
      },
      itemsTableLabel: t("warehouse.print.itemsTable"),
      itemColumns: {
        name: t("warehouse.industrialWaste.wasteType"),
        quantity: t("warehouse.industrialWaste.quantity"),
        unit: t("warehouse.industrialWaste.unit"),
      },
      items: [
        {
          name: v.waste_type,
          quantity: formatNumberAr(parseFloat(v.quantity), 2),
          unit: v.unit,
        },
      ],
      detailRows: [
        {
          label: t("warehouse.industrialWaste.source"),
          value: v.source || "",
        },
        {
          label: t("warehouse.industrialWaste.receivedBy", {
            defaultValue: t("warehouse.print.warehouseKeeper"),
          }),
          value: v.received_by_name || "",
        },
      ],
      notes: v.notes,
      notesLabel: t("warehouse.industrialWaste.notes"),
      signatures: [
        t("warehouse.print.signatureKeeper"),
        t("warehouse.print.signatureReceiver"),
      ],
      rtl: i18n.language === "ar",
      lang: i18n.language,
    });
  };

  const openCreate = () => {
    setEditVoucher(null);
    setDialogOpen(true);
  };

  const openEdit = (v: WasteVoucherIn) => {
    setEditVoucher(v);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="mb-3">
        <Button
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700"
          data-testid="button-create-waste-in"
        >
          <ArrowDownToLine className="h-4 w-4 ml-2" />
          {t("warehouse.industrialWaste.recReceiptBtn")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : vouchers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t("warehouse.industrialWaste.noVouchers")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((v) => (
            <Card key={v.id} data-testid={`card-waste-in-${v.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-1">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    {v.voucher_number}
                  </CardTitle>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePrint(v)}
                      title={t("warehouse.industrialWaste.printVoucher")}
                      data-testid={`button-print-waste-in-${v.id}`}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(v)}
                      title={t("warehouse.industrialWaste.editVoucher")}
                      data-testid={`button-edit-waste-in-${v.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 h-8 w-8"
                      onClick={() => setDeleteId(v.id)}
                      data-testid={`button-delete-waste-in-${v.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {v.voucher_date}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Recycle className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="font-medium">{v.waste_type}</span>
                </div>
                <div>
                  {t("warehouse.industrialWaste.quantity")}:{" "}
                  <Badge variant="secondary">
                    {formatNumberAr(parseFloat(v.quantity), 2)} {v.unit}
                  </Badge>
                </div>
                {v.source && (
                  <div className="text-muted-foreground">
                    {t("warehouse.industrialWaste.source")}: {v.source}
                  </div>
                )}
                {v.notes && (
                  <div className="text-muted-foreground">{v.notes}</div>
                )}
                {v.received_by_name && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    {v.received_by_name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WasteInDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editVoucher={editVoucher}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("warehouse.industrialWaste.confirmDeleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("warehouse.industrialWaste.confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function WasteOutList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const { logoUrl } = useCompanyLogo();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVoucher, setEditVoucher] = useState<WasteVoucherOut | null>(null);

  const { data: vouchers = [], isLoading } = useQuery<WasteVoucherOut[]>({
    queryKey: OUT_KEY,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/warehouse/vouchers/industrial-waste-out/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUT_KEY });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/warehouse/production-hall"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/warehouse/delivery-hall"],
      });
      toast({ title: t("warehouse.industrialWaste.deleteSuccess") });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({
        title: t("warehouse.industrialWaste.deleteError"),
        description: err?.message,
        variant: "destructive",
      });
    },
  });

  const handlePrint = (v: WasteVoucherOut) => {
    printWasteVoucher({
      voucherNumber: v.voucher_number,
      voucherType: t("warehouse.industrialWaste.delFormTitle"),
      voucherDate: v.voucher_date,
      warehouse: t("warehouse.tabs.industrialWaste"),
      title: t("warehouse.industrialWaste.delFormTitle"),
      factoryName: t("warehouse.print.factoryName"),
      logoUrl,
      logoAlt: t("warehouse.print.factoryLogo"),
      infoLabels: {
        number: t("warehouse.print.voucherNumberLabel"),
        type: t("warehouse.print.voucherTypeLabel"),
        date: t("warehouse.industrialWaste.date"),
        warehouse: t("warehouse.print.warehouseLabel"),
      },
      itemsTableLabel: t("warehouse.print.itemsTable"),
      itemColumns: {
        name: t("warehouse.industrialWaste.wasteType"),
        quantity: t("warehouse.industrialWaste.quantity"),
        unit: t("warehouse.industrialWaste.unit"),
      },
      items: [
        {
          name: v.waste_type,
          quantity: formatNumberAr(parseFloat(v.quantity), 2),
          unit: v.unit,
        },
      ],
      detailRows: [
        {
          label: t("warehouse.industrialWaste.company"),
          value: v.company_name,
        },
        {
          label: t("warehouse.industrialWaste.driver"),
          value: v.driver_name || "",
        },
        {
          label: t("warehouse.industrialWaste.vehicle"),
          value: v.vehicle_number || "",
        },
      ],
      notes: v.notes,
      notesLabel: t("warehouse.industrialWaste.notes"),
      signatures: [
        t("warehouse.print.signatureKeeper"),
        t("warehouse.print.signatureReceiver"),
      ],
      rtl: i18n.language === "ar",
      lang: i18n.language,
    });
  };

  const openCreate = () => {
    setEditVoucher(null);
    setDialogOpen(true);
  };

  const openEdit = (v: WasteVoucherOut) => {
    setEditVoucher(v);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="mb-3">
        <Button
          onClick={openCreate}
          className="bg-red-600 hover:bg-red-700"
          data-testid="button-create-waste-out"
        >
          <ArrowUpFromLine className="h-4 w-4 ml-2" />
          {t("warehouse.industrialWaste.delIssueBtn")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : vouchers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t("warehouse.industrialWaste.noVouchers")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((v) => (
            <Card key={v.id} data-testid={`card-waste-out-${v.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-1">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    {v.voucher_number}
                  </CardTitle>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePrint(v)}
                      title={t("warehouse.industrialWaste.printVoucher")}
                      data-testid={`button-print-waste-out-${v.id}`}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(v)}
                      title={t("warehouse.industrialWaste.editVoucher")}
                      data-testid={`button-edit-waste-out-${v.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 h-8 w-8"
                      onClick={() => setDeleteId(v.id)}
                      data-testid={`button-delete-waste-out-${v.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {v.voucher_date}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Recycle className="h-4 w-4 text-red-600 shrink-0" />
                  <span className="font-medium">{v.waste_type}</span>
                </div>
                <div>
                  {t("warehouse.industrialWaste.quantity")}:{" "}
                  <Badge variant="secondary">
                    {formatNumberAr(parseFloat(v.quantity), 2)} {v.unit}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  {t("warehouse.industrialWaste.company")}: {v.company_name}
                </div>
                {v.driver_name && (
                  <div className="text-muted-foreground">
                    {t("warehouse.industrialWaste.driver")}: {v.driver_name}
                  </div>
                )}
                {v.vehicle_number && (
                  <div className="text-muted-foreground">
                    {t("warehouse.industrialWaste.vehicle")}: {v.vehicle_number}
                  </div>
                )}
                {v.notes && (
                  <div className="text-muted-foreground">{v.notes}</div>
                )}
                {v.issued_by_name && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    {v.issued_by_name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WasteOutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editVoucher={editVoucher}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("warehouse.industrialWaste.confirmDeleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("warehouse.industrialWaste.confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function WasteInDialog({
  open,
  onOpenChange,
  editVoucher,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editVoucher?: WasteVoucherIn | null;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isEdit = !!editVoucher;
  const [wasteType, setWasteType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("كيلو");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [voucherDate, setVoucherDate] = useState(todayStr());

  const reset = () => {
    setWasteType("");
    setQuantity("");
    setUnit("كيلو");
    setSource("");
    setNotes("");
    setVoucherDate(todayStr());
  };

  useEffect(() => {
    if (!open) return;
    if (editVoucher) {
      setWasteType(editVoucher.waste_type || "");
      setQuantity(String(editVoucher.quantity ?? ""));
      setUnit(editVoucher.unit || "كيلو");
      setSource(editVoucher.source || "");
      setNotes(editVoucher.notes || "");
      setVoucherDate((editVoucher.voucher_date || todayStr()).slice(0, 10));
    } else {
      reset();
    }
  }, [open, editVoucher]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = JSON.stringify({
        waste_type: wasteType.trim(),
        quantity: quantity.trim(),
        unit: unit.trim() || "كيلو",
        source: source.trim() || null,
        notes: notes.trim() || null,
        voucher_date: voucherDate,
      });
      const res = await apiRequest(
        isEdit
          ? `/api/warehouse/vouchers/industrial-waste-in/${editVoucher!.id}`
          : "/api/warehouse/vouchers/industrial-waste-in",
        { method: isEdit ? "PATCH" : "POST", body },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IN_KEY });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/warehouse/production-hall"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/warehouse/delivery-hall"],
      });
      toast({
        title: isEdit
          ? t("warehouse.industrialWaste.updateSuccess")
          : t("warehouse.industrialWaste.createSuccess"),
      });
      reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: isEdit
          ? t("warehouse.industrialWaste.updateError")
          : t("warehouse.industrialWaste.createError"),
        description: err?.message,
        variant: "destructive",
      });
    },
  });

  const canSubmit = wasteType.trim().length > 0 && parseFloat(quantity) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("warehouse.industrialWaste.editRecFormTitle")
              : t("warehouse.industrialWaste.recFormTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("warehouse.industrialWaste.recFormDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{t("warehouse.industrialWaste.wasteType")} *</Label>
            <Select value={wasteType} onValueChange={setWasteType}>
              <SelectTrigger data-testid="select-waste-in-type">
                <SelectValue
                  placeholder={t("warehouse.industrialWaste.selectWasteType")}
                />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>{t("warehouse.industrialWaste.quantity")} *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                data-testid="input-waste-in-quantity"
              />
            </div>
            <div>
              <Label>{t("warehouse.industrialWaste.unit")}</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger data-testid="select-waste-in-unit">
                  <SelectValue
                    placeholder={t("warehouse.industrialWaste.selectUnit")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t("warehouse.industrialWaste.source")}</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger data-testid="select-waste-in-source">
                <SelectValue
                  placeholder={t("warehouse.industrialWaste.selectSource")}
                />
              </SelectTrigger>
              <SelectContent>
                {WASTE_SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("warehouse.industrialWaste.date")}</Label>
            <Input
              type="date"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              data-testid="input-waste-in-date"
            />
          </div>
          <div>
            <Label>{t("warehouse.industrialWaste.notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="input-waste-in-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={!canSubmit || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            data-testid="button-submit-waste-in"
          >
            {saveMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            )}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WasteOutDialog({
  open,
  onOpenChange,
  editVoucher,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editVoucher?: WasteVoucherOut | null;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isEdit = !!editVoucher;
  const [wasteType, setWasteType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("كيلو");
  const [companyName, setCompanyName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [voucherDate, setVoucherDate] = useState(todayStr());

  const reset = () => {
    setWasteType("");
    setQuantity("");
    setUnit("كيلو");
    setCompanyName("");
    setDriverName("");
    setVehicleNumber("");
    setNotes("");
    setVoucherDate(todayStr());
  };

  useEffect(() => {
    if (!open) return;
    if (editVoucher) {
      setWasteType(editVoucher.waste_type || "");
      setQuantity(String(editVoucher.quantity ?? ""));
      setUnit(editVoucher.unit || "كيلو");
      setCompanyName(editVoucher.company_name || "");
      setDriverName(editVoucher.driver_name || "");
      setVehicleNumber(editVoucher.vehicle_number || "");
      setNotes(editVoucher.notes || "");
      setVoucherDate((editVoucher.voucher_date || todayStr()).slice(0, 10));
    } else {
      reset();
    }
  }, [open, editVoucher]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = JSON.stringify({
        waste_type: wasteType.trim(),
        quantity: quantity.trim(),
        unit: unit.trim() || "كيلو",
        company_name: companyName.trim(),
        driver_name: driverName.trim() || null,
        vehicle_number: vehicleNumber.trim() || null,
        notes: notes.trim() || null,
        voucher_date: voucherDate,
      });
      const res = await apiRequest(
        isEdit
          ? `/api/warehouse/vouchers/industrial-waste-out/${editVoucher!.id}`
          : "/api/warehouse/vouchers/industrial-waste-out",
        { method: isEdit ? "PATCH" : "POST", body },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUT_KEY });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/warehouse/production-hall"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/warehouse/delivery-hall"],
      });
      toast({
        title: isEdit
          ? t("warehouse.industrialWaste.updateSuccess")
          : t("warehouse.industrialWaste.createSuccess"),
      });
      reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: isEdit
          ? t("warehouse.industrialWaste.updateError")
          : t("warehouse.industrialWaste.createError"),
        description: err?.message,
        variant: "destructive",
      });
    },
  });

  const canSubmit =
    wasteType.trim().length > 0 &&
    parseFloat(quantity) > 0 &&
    companyName.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("warehouse.industrialWaste.editDelFormTitle")
              : t("warehouse.industrialWaste.delFormTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("warehouse.industrialWaste.delFormDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{t("warehouse.industrialWaste.wasteType")} *</Label>
            <Select value={wasteType} onValueChange={setWasteType}>
              <SelectTrigger data-testid="select-waste-out-type">
                <SelectValue
                  placeholder={t("warehouse.industrialWaste.selectWasteType")}
                />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>{t("warehouse.industrialWaste.quantity")} *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                data-testid="input-waste-out-quantity"
              />
            </div>
            <div>
              <Label>{t("warehouse.industrialWaste.unit")}</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger data-testid="select-waste-out-unit">
                  <SelectValue
                    placeholder={t("warehouse.industrialWaste.selectUnit")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t("warehouse.industrialWaste.company")} *</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              data-testid="input-waste-out-company"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>{t("warehouse.industrialWaste.driver")}</Label>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                data-testid="input-waste-out-driver"
              />
            </div>
            <div>
              <Label>{t("warehouse.industrialWaste.vehicle")}</Label>
              <Input
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                data-testid="input-waste-out-vehicle"
              />
            </div>
          </div>
          <div>
            <Label>{t("warehouse.industrialWaste.date")}</Label>
            <Input
              type="date"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              data-testid="input-waste-out-date"
            />
          </div>
          <div>
            <Label>{t("warehouse.industrialWaste.notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="input-waste-out-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            disabled={!canSubmit || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            data-testid="button-submit-waste-out"
          >
            {saveMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            )}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
