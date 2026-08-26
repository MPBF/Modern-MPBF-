import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FileClock, Printer, ShieldCheck, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

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

export type MaintenanceHistoryItem = {
  id: string;
  source_id: number;
  type: "preventive" | "corrective" | "periodic";
  number: string;
  title: string;
  description?: string | null;
  status?: string | null;
  date?: string | null;
  items?: Array<{
    component_name_ar?: string;
    component_name_en?: string;
    action_type?: string;
    required_action?: string;
    checked?: boolean;
    condition?: string | null;
    result?: string | null;
    notes?: string | null;
  }>;
};

type MaintenanceFile = {
  machine: {
    id: string;
    name: string;
    name_ar?: string | null;
    type?: string | null;
    section_name?: string | null;
    section_name_ar?: string | null;
  };
  summary: {
    total: number;
    preventive: number;
    corrective: number;
    periodic: number;
  };
  history: MaintenanceHistoryItem[];
};

function printMaintenanceFile(file: MaintenanceFile, isAr: boolean) {
  const machineName = (isAr ? file.machine.name_ar : file.machine.name) || file.machine.name;
  const rows = file.history
    .map(
      (item) => `
        <tr>
          <td>${new Date(item.date || "").toLocaleDateString(isAr ? "ar-SA" : "en-US")}</td>
          <td>${item.number || "—"}</td>
          <td>${item.type === "preventive" ? (isAr ? "وقائية" : "Preventive") : item.type === "corrective" ? (isAr ? "تصحيحية" : "Corrective") : (isAr ? "دورية" : "Periodic")}</td>
          <td>${item.title || "—"}</td>
          <td>${item.status || "—"}</td>
        </tr>`,
    )
    .join("");
  const win = window.open("", "_blank", "width=1000,height=760");
  if (!win) return;
  win.document.write(`<!doctype html><html dir="${isAr ? "rtl" : "ltr"}"><head>
    <meta charset="utf-8"><title>${isAr ? "ملف صيانة الماكينة" : "Machine Maintenance File"}</title>
    <style>
      body{font-family:Tahoma,Arial,sans-serif;margin:32px;color:#16243a}
      header{border-bottom:3px solid #0f766e;padding-bottom:16px;margin-bottom:24px}
      h1{margin:0 0 8px;font-size:24px} .muted{color:#64748b}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:20px 0}
      .stat{border:1px solid #cbd5e1;padding:12px;border-radius:8px;text-align:center}
      .stat b{display:block;font-size:22px;color:#0f766e}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #cbd5e1;padding:9px;text-align:${isAr ? "right" : "left"}}
      th{background:#f1f5f9}
      @media print{body{margin:12mm}.no-print{display:none}}
    </style></head><body>
    <header><h1>${isAr ? "ملف صيانة الماكينة" : "Machine Maintenance File"} — ${machineName}</h1>
    <div class="muted">${file.machine.id} · ${(isAr ? file.machine.section_name_ar : file.machine.section_name) || ""}</div></header>
    <div class="stats">
      <div class="stat"><b>${file.summary.total}</b>${isAr ? "إجمالي الإجراءات" : "Total"}</div>
      <div class="stat"><b>${file.summary.preventive}</b>${isAr ? "وقائية" : "Preventive"}</div>
      <div class="stat"><b>${file.summary.corrective}</b>${isAr ? "تصحيحية" : "Corrective"}</div>
      <div class="stat"><b>${file.summary.periodic}</b>${isAr ? "دورية" : "Periodic"}</div>
    </div>
    <table><thead><tr><th>${isAr ? "التاريخ" : "Date"}</th><th>${isAr ? "الرقم" : "Number"}</th><th>${isAr ? "النوع" : "Type"}</th><th>${isAr ? "الإجراء" : "Action"}</th><th>${isAr ? "الحالة" : "Status"}</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="5">${isAr ? "لا توجد سجلات" : "No records"}</td></tr>`}</tbody></table>
    <script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}

export default function MachineMaintenanceFileDialog({
  machineId,
  onOpenChange,
}: {
  machineId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { data: file, isLoading } = useQuery<MaintenanceFile>({
    queryKey: ["/api/machines", machineId, "maintenance-file"],
    queryFn: async () => {
      const response = await fetch(`/api/machines/${machineId}/maintenance-file`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load maintenance file");
      return response.json();
    },
    enabled: Boolean(machineId),
  });

  const typeLabel = (type: MaintenanceHistoryItem["type"]) =>
    type === "preventive"
      ? isAr
        ? "وقائية"
        : "Preventive"
      : type === "corrective"
        ? isAr
          ? "تصحيحية"
          : "Corrective"
        : isAr
          ? "دورية"
          : "Periodic";

  const typeIcon = (type: MaintenanceHistoryItem["type"]) =>
    type === "preventive" ? ShieldCheck : type === "corrective" ? Wrench : CalendarDays;

  return (
    <Dialog open={Boolean(machineId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileClock className="h-5 w-5 text-teal-700" />
                {isAr ? "ملف صيانة الماكينة" : "Machine Maintenance File"}
              </DialogTitle>
              <DialogDescription>
                {file
                  ? `${(isAr ? file.machine.name_ar : file.machine.name) || file.machine.name} · ${(isAr ? file.machine.section_name_ar : file.machine.section_name) || ""}`
                  : isAr
                    ? "السجل التاريخي الموحد لجميع أعمال الصيانة"
                    : "Unified history for all maintenance work"}
              </DialogDescription>
            </div>
            {file && (
              <Button variant="outline" onClick={() => printMaintenanceFile(file, isAr)}>
                <Printer className="ml-2 h-4 w-4" />
                {isAr ? "طباعة الملف" : "Print file"}
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading || !file ? (
          <div className="py-16 text-center text-muted-foreground">
            {isAr ? "جاري تحميل ملف الصيانة..." : "Loading maintenance file..."}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                [isAr ? "إجمالي الإجراءات" : "Total actions", file.summary.total],
                [isAr ? "صيانة وقائية" : "Preventive", file.summary.preventive],
                [isAr ? "صيانة تصحيحية" : "Corrective", file.summary.corrective],
                [isAr ? "صيانة دورية" : "Periodic", file.summary.periodic],
              ].map(([label, value]) => (
                <Card key={String(label)} className="border-slate-200 bg-slate-50/70">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {file.history.length === 0 ? (
              <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
                {isAr ? "لا توجد إجراءات صيانة مسجلة لهذه الماكينة" : "No maintenance actions recorded"}
              </div>
            ) : (
              <div className="space-y-3">
                {file.history.map((item) => {
                  const Icon = typeIcon(item.type);
                  return (
                    <div key={item.id} className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
                      <div className={`absolute inset-y-0 ${isAr ? "right-0" : "left-0"} w-1 ${item.type === "preventive" ? "bg-emerald-500" : item.type === "corrective" ? "bg-amber-500" : "bg-blue-500"}`} />
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-muted p-2"><Icon className="h-4 w-4" /></div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{item.title}</p>
                              <Badge variant="outline">{typeLabel(item.type)}</Badge>
                              <Badge variant="secondary">{item.status || "—"}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.number} · {item.date ? new Date(item.date).toLocaleDateString(isAr ? "ar-SA" : "en-US") : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {item.description && <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>}
                      {item.items?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.items.slice(0, 8).map((part, index) => (
                            <span key={index} className="rounded-md bg-muted px-2 py-1 text-xs">
                              {(isAr ? part.component_name_ar : part.component_name_en) ||
                                part.component_name_ar ||
                                part.component_name_en}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}