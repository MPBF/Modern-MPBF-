import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  Play,
  Printer,
  Settings2,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Machine, MaintenanceComponent, Section } from "../../../../shared/schema";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { userHasPermission } from "../../utils/roleUtils";
import MachineMaintenanceFileDialog from "./MachineMaintenanceFileDialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

type ScheduleItem = {
  id?: number;
  component_id: number;
  component_name_ar?: string;
  component_name_en?: string;
  action_type: string;
  notes?: string | null;
};

type Schedule = {
  id: number;
  name: string;
  section_id: string;
  start_date: string;
  next_due_date: string;
  frequency_months: number;
  is_active: boolean;
  description?: string | null;
  machines: Array<{ id: string; name?: string; name_ar?: string }>;
  items: ScheduleItem[];
  last_run?: {
    id: number;
    scheduled_date: string;
    status: string;
    completed_at?: string | null;
  } | null;
};

type RunItem = {
  id: number;
  component_name_ar: string;
  component_name_en: string;
  required_action: string;
  checked: boolean;
  condition?: string | null;
  result?: string | null;
  notes?: string | null;
};

type MaintenanceRun = {
  id: number;
  schedule_id: number;
  schedule_name: string;
  scheduled_date: string;
  status: string;
  machine_id: string;
  machine_name: string;
  machine_name_ar?: string;
  section_name?: string;
  section_name_ar?: string;
  report_notes?: string | null;
  items: RunItem[];
};

type ScheduleForm = {
  id: number | null;
  name: string;
  section_id: string;
  start_date: string;
  next_due_date: string;
  frequency_months: number;
  is_active: boolean;
  description: string;
  machine_ids: string[];
  items: Array<{ component_id: number; action_type: string; notes?: string | null }>;
};

type MachineFamily = "film" | "printing" | "cutting";

const FAMILY_META: Record<
  MachineFamily,
  { ar: string; en: string; catalogType: string; accent: string }
> = {
  film: {
    ar: "قسم الفيلم",
    en: "Film Department",
    catalogType: "extruder",
    accent: "border-emerald-500",
  },
  printing: {
    ar: "قسم الطباعة",
    en: "Printing Department",
    catalogType: "printer",
    accent: "border-blue-500",
  },
  cutting: {
    ar: "قسم التقطيع",
    en: "Cutting Department",
    catalogType: "cutter",
    accent: "border-amber-500",
  },
};

function machineFamily(machine: Machine): MachineFamily | null {
  const value = String(machine.type || "").toLowerCase();
  if (value.includes("extrud") || value.includes("film")) return "film";
  if (value.includes("print")) return "printing";
  if (value.includes("cut")) return "cutting";
  return null;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dateOnly(value?: string | null) {
  return value ? String(value).slice(0, 10) : today();
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printChecklist({
  machine,
  schedule,
  items,
  isAr,
  reportNotes,
  completed,
}: {
  machine: Machine;
  schedule: Schedule;
  items: Array<ScheduleItem | RunItem>;
  isAr: boolean;
  reportNotes?: string | null;
  completed?: boolean;
}) {
  const name = (isAr ? machine.name_ar : machine.name) || machine.name;
  const actionLabel = (action: string) =>
    ({
      inspection: isAr ? "فحص" : "Inspection",
      cleaning: isAr ? "تنظيف" : "Cleaning",
      lubrication: isAr ? "تشحيم" : "Lubrication",
      adjustment: isAr ? "ضبط" : "Adjustment",
      repair: isAr ? "إصلاح" : "Repair",
      replacement: isAr ? "استبدال" : "Replacement",
    })[action] || action;
  const rows = items
    .map((item, index) => {
      const runItem = item as RunItem;
      const component =
        (isAr ? item.component_name_ar : item.component_name_en) ||
        item.component_name_ar ||
        item.component_name_en ||
        "";
      return `<tr>
        <td>${index + 1}</td><td>${escapeHtml(component)}</td>
        <td>${escapeHtml(actionLabel(("required_action" in item ? item.required_action : item.action_type) || "inspection"))}</td>
        <td>${completed ? (runItem.checked ? "✓" : "—") : "□"}</td>
        <td>${escapeHtml(completed ? runItem.condition || "" : "")}</td>
        <td>${escapeHtml(completed ? runItem.result || "" : "")}</td>
        <td>${escapeHtml(completed ? runItem.notes || "" : "")}</td>
      </tr>`;
    })
    .join("");
  const win = window.open("", "_blank", "width=1050,height=780");
  if (!win) return;
  win.document.write(`<!doctype html><html dir="${isAr ? "rtl" : "ltr"}"><head>
    <meta charset="utf-8"><title>${isAr ? "تقرير الصيانة الدورية" : "Periodic Maintenance Report"}</title>
    <style>
      body{font-family:Tahoma,Arial,sans-serif;margin:28px;color:#172033}
      header{display:flex;justify-content:space-between;border-bottom:3px solid #1d4ed8;padding-bottom:14px}
      h1{font-size:23px;margin:0 0 7px}.meta{color:#64748b;font-size:13px}
      .info{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0}
      .info div{border:1px solid #cbd5e1;padding:10px;border-radius:6px}.info b{display:block;font-size:11px;color:#64748b}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #94a3b8;padding:8px;text-align:${isAr ? "right" : "left"}}
      th{background:#e2e8f0}.notes{margin-top:16px;border:1px solid #cbd5e1;min-height:60px;padding:10px}
      .signatures{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:45px}.line{border-top:1px solid #334155;padding-top:8px;text-align:center}
      @media print{body{margin:10mm}}
    </style></head><body>
    <header><div><h1>${isAr ? "تقرير الصيانة الدورية" : "Periodic Maintenance Report"}</h1><div class="meta">${escapeHtml(schedule.name)}</div></div>
    <div class="meta">${isAr ? "تاريخ الطباعة" : "Print date"}: ${new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US")}</div></header>
    <div class="info">
      <div><b>${isAr ? "الماكينة" : "Machine"}</b>${escapeHtml(name)}</div>
      <div><b>${isAr ? "رمز الماكينة" : "Machine ID"}</b>${escapeHtml(machine.id)}</div>
      <div><b>${isAr ? "موعد الصيانة" : "Due date"}</b>${new Date(schedule.next_due_date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}</div>
      <div><b>${isAr ? "التكرار" : "Frequency"}</b>${schedule.frequency_months} ${isAr ? "شهر" : "months"}</div>
    </div>
    <table><thead><tr><th>#</th><th>${isAr ? "المكون" : "Component"}</th><th>${isAr ? "المطلوب" : "Required action"}</th><th>${isAr ? "تم" : "Done"}</th><th>${isAr ? "الحالة" : "Condition"}</th><th>${isAr ? "النتيجة" : "Result"}</th><th>${isAr ? "ملاحظات" : "Notes"}</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="notes"><b>${isAr ? "ملاحظات التقرير:" : "Report notes:"}</b><br>${escapeHtml(reportNotes || "")}</div>
    <div class="signatures"><div class="line">${isAr ? "فني الصيانة" : "Maintenance technician"}</div><div class="line">${isAr ? "اعتماد المسؤول" : "Supervisor approval"}</div></div>
    <script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}

export default function PeriodicMaintenanceTab() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scheduleMachine, setScheduleMachine] = useState<Machine | null>(null);
  const [fileMachineId, setFileMachineId] = useState<string | null>(null);
  const [runId, setRunId] = useState<number | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm | null>(null);
  const [runItems, setRunItems] = useState<RunItem[]>([]);
  const [reportNotes, setReportNotes] = useState("");

  const canCreate = userHasPermission(user, [
    "add_maintenance",
    "manage_maintenance_actions",
    "manage_maintenance",
  ]);
  const canEdit = userHasPermission(user, [
    "edit_maintenance",
    "manage_maintenance_actions",
    "manage_maintenance",
  ]);

  const { data: machines = [], isLoading } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });
  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });
  const { data: components = [] } = useQuery<MaintenanceComponent[]>({
    queryKey: ["/api/maintenance-components"],
  });
  const { data: schedules = [] } = useQuery<Schedule[]>({
    queryKey: ["/api/maintenance-schedules"],
  });
  const { data: run } = useQuery<MaintenanceRun>({
    queryKey: ["/api/maintenance-schedule-runs", runId],
    queryFn: async () => {
      const response = await fetch(`/api/maintenance-schedule-runs/${runId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load checklist");
      return response.json();
    },
    enabled: Boolean(runId),
  });

  useEffect(() => {
    if (!run) return;
    setRunItems(run.items || []);
    setReportNotes(run.report_notes || "");
  }, [run]);

  const scheduleByMachine = useMemo(() => {
    const map = new Map<string, Schedule>();
    schedules.forEach((schedule) =>
      (schedule.machines || []).forEach((machine) => map.set(machine.id, schedule)),
    );
    return map;
  }, [schedules]);

  const groupedMachines = useMemo(
    () =>
      (["film", "printing", "cutting"] as MachineFamily[]).map((family) => ({
        family,
        machines: machines.filter((machine) => machineFamily(machine) === family),
      })),
    [machines],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/maintenance-schedules"] });
    queryClient.invalidateQueries({ queryKey: ["/api/maintenance-schedule-runs"] });
    queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
  };

  const saveSchedule = useMutation({
    mutationFn: (form: ScheduleForm) => {
      const { id, ...payload } = form;
      return apiRequest(id ? `/api/maintenance-schedules/${id}` : "/api/maintenance-schedules", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      invalidate();
      setScheduleMachine(null);
      setScheduleForm(null);
      toast({ title: isAr ? "تم حفظ خطة الصيانة الدورية" : "Periodic plan saved" });
    },
    onError: (error: any) =>
      toast({
        title: isAr ? "تعذر حفظ الخطة" : "Could not save the plan",
        description: error?.message,
        variant: "destructive",
      }),
  });

  const startRun = useMutation({
    mutationFn: (scheduleId: number) =>
      apiRequest(`/api/maintenance-schedules/${scheduleId}/run`, { method: "POST" }),
    onSuccess: (result: any) => {
      invalidate();
      setRunId(Number(result.id || result.run_id));
    },
    onError: () =>
      toast({ title: isAr ? "تعذر بدء دورة الصيانة" : "Could not start maintenance", variant: "destructive" }),
  });

  const saveRun = useMutation({
    mutationFn: (status: "in_progress" | "completed") =>
      apiRequest(`/api/maintenance-schedule-runs/${runId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          report_notes: reportNotes,
          items: runItems.map(({ id, checked, condition, result, notes }) => ({
            id,
            checked,
            condition: condition || null,
            result: result || null,
            notes: notes || null,
          })),
        }),
      }),
    onSuccess: (_result, status) => {
      invalidate();
      toast({
        title:
          status === "completed"
            ? isAr
              ? "تم إكمال الصيانة الدورية"
              : "Periodic maintenance completed"
            : isAr
              ? "تم حفظ قائمة الفحص"
              : "Checklist saved",
      });
      if (status === "completed") setRunId(null);
    },
    onError: (error: any) =>
      toast({
        title: isAr ? "تعذر حفظ التقرير" : "Could not save report",
        description: error?.message,
        variant: "destructive",
      }),
  });

  const openSchedule = (machine: Machine, schedule?: Schedule) => {
    setScheduleMachine(machine);
    setScheduleForm({
      id: schedule?.id || null,
      name:
        schedule?.name ||
        `${(isAr ? machine.name_ar : machine.name) || machine.name} - ${
          isAr ? "صيانة دورية" : "Periodic maintenance"
        }`,
      section_id: machine.section_id || "",
      start_date: dateOnly(schedule?.start_date),
      next_due_date: dateOnly(schedule?.next_due_date),
      frequency_months: Number(schedule?.frequency_months) || 12,
      is_active: schedule?.is_active ?? true,
      description: schedule?.description || "",
      machine_ids: [machine.id],
      items: (schedule?.items || []).map((item) => ({
        component_id: item.component_id,
        action_type: item.action_type,
        notes: item.notes,
      })),
    });
  };

  const selectedComponentIds = new Set(
    scheduleForm?.items.map((item) => item.component_id) || [],
  );
  const family = scheduleMachine ? machineFamily(scheduleMachine) : null;
  const availableComponents = components.filter(
    (component) =>
      family && component.machine_type.toLowerCase() === FAMILY_META[family].catalogType,
  );
  const allChecked = runItems.length > 0 && runItems.every((item) => item.checked);

  const sectionName = (machine: Machine) => {
    const section = sections.find((item) => item.id === machine.section_id);
    return (isAr ? section?.name_ar : section?.name) || section?.name || machine.section_id || "—";
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-300 bg-slate-950 text-white shadow-lg">
        <CardContent className="relative p-6">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(37,99,235,.35),transparent_70%)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-blue-300">
                <ClipboardCheck className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  {isAr ? "نظام الفحص الدوري" : "Periodic inspection system"}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{isAr ? "الصيانة الدورية للمكائن" : "Machine Periodic Maintenance"}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                {isAr
                  ? "جميع مكائن الفيلم والطباعة والتقطيع مع ملف صيانة تاريخي وخطة فحص قابلة للتعبئة والطباعة."
                  : "All film, printing, and cutting machines with maintenance history and printable inspection plans."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border border-white/15 bg-white/5 px-5 py-3">
                <p className="text-2xl font-bold">{groupedMachines.reduce((sum, group) => sum + group.machines.length, 0)}</p>
                <p className="text-xs text-slate-400">{isAr ? "ماكينة" : "Machines"}</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 px-5 py-3">
                <p className="text-2xl font-bold">{schedules.length}</p>
                <p className="text-xs text-slate-400">{isAr ? "خطة دورية" : "Plans"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">
          {isAr ? "جاري تحميل المكائن..." : "Loading machines..."}
        </div>
      ) : (
        groupedMachines.map(({ family, machines: familyMachines }) => {
          const meta = FAMILY_META[family];
          return (
            <section key={family} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`h-8 border-r-4 ${meta.accent}`} />
                <div>
                  <h3 className="text-lg font-bold">{isAr ? meta.ar : meta.en}</h3>
                  <p className="text-xs text-muted-foreground">
                    {familyMachines.length} {isAr ? "ماكينة معرفة" : "registered machines"}
                  </p>
                </div>
              </div>
              {familyMachines.length === 0 ? (
                <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                  {isAr ? "لا توجد مكائن معرفة في هذا القسم" : "No machines registered in this department"}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {familyMachines.map((machine) => {
                    const schedule = scheduleByMachine.get(machine.id);
                    const due = schedule?.next_due_date
                      ? new Date(schedule.next_due_date)
                      : null;
                    const overdue = due ? due.getTime() < new Date(today()).getTime() : false;
                    const activeRun =
                      schedule?.last_run &&
                      ["pending", "in_progress"].includes(schedule.last_run.status)
                        ? schedule.last_run
                        : null;
                    return (
                      <Card key={machine.id} className="group overflow-hidden border-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className={`border-t-4 ${meta.accent}`} />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">
                                {(isAr ? machine.name_ar : machine.name) || machine.name}
                              </CardTitle>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {machine.id} · {sectionName(machine)}
                              </p>
                            </div>
                            <Badge variant={schedule ? (overdue ? "destructive" : "default") : "secondary"}>
                              {schedule
                                ? overdue
                                  ? isAr
                                    ? "مستحقة"
                                    : "Due"
                                  : isAr
                                    ? "مجدولة"
                                    : "Scheduled"
                                : isAr
                                  ? "بدون خطة"
                                  : "No plan"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-lg bg-muted/60 p-3">
                              <p className="text-xs text-muted-foreground">{isAr ? "الموعد القادم" : "Next due"}</p>
                              <p className="mt-1 font-semibold">
                                {due ? due.toLocaleDateString(isAr ? "ar-SA" : "en-US") : "—"}
                              </p>
                            </div>
                            <div className="rounded-lg bg-muted/60 p-3">
                              <p className="text-xs text-muted-foreground">{isAr ? "عناصر الفحص" : "Checklist"}</p>
                              <p className="mt-1 font-semibold">{schedule?.items?.length || 0}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 border-t pt-3">
                            <Button size="sm" variant="outline" onClick={() => setFileMachineId(machine.id)}>
                              <FileClock className="ml-2 h-4 w-4" />
                              {isAr ? "ملف الصيانة" : "Maintenance file"}
                            </Button>
                            {(canCreate || canEdit) && (
                              <Button size="sm" variant="outline" onClick={() => openSchedule(machine, schedule)}>
                                <Settings2 className="ml-2 h-4 w-4" />
                                {schedule ? (isAr ? "تعديل الخطة" : "Edit plan") : isAr ? "إنشاء خطة" : "Create plan"}
                              </Button>
                            )}
                            {schedule && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  printChecklist({
                                    machine,
                                    schedule,
                                    items: schedule.items,
                                    isAr,
                                  })
                                }
                              >
                                <Printer className="ml-2 h-4 w-4" />
                                {isAr ? "طباعة فارغة" : "Blank report"}
                              </Button>
                            )}
                            {schedule && canCreate && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  activeRun
                                    ? setRunId(activeRun.id)
                                    : startRun.mutate(schedule.id)
                                }
                              >
                                <Play className="ml-2 h-4 w-4" />
                                {activeRun ? (isAr ? "متابعة الفحص" : "Resume") : isAr ? "بدء الفحص" : "Start"}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })
      )}

      <Dialog
        open={Boolean(scheduleMachine && scheduleForm)}
        onOpenChange={(open) => {
          if (!open) {
            setScheduleMachine(null);
            setScheduleForm(null);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAr ? "خطة الصيانة الدورية" : "Periodic Maintenance Plan"}</DialogTitle>
            <DialogDescription>
              {scheduleMachine
                ? `${(isAr ? scheduleMachine.name_ar : scheduleMachine.name) || scheduleMachine.name} · ${sectionName(scheduleMachine)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {scheduleForm && scheduleMachine && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">{isAr ? "اسم الخطة" : "Plan name"}</label>
                  <Input
                    value={scheduleForm.name}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, name: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{isAr ? "موعد الصيانة القادم" : "Next due date"}</label>
                  <Input
                    type="date"
                    value={scheduleForm.next_due_date}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, next_due_date: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{isAr ? "تاريخ بدء الخطة" : "Plan start date"}</label>
                  <Input
                    type="date"
                    value={scheduleForm.start_date}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, start_date: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{isAr ? "تكرار الصيانة" : "Maintenance frequency"}</label>
                  <Select
                    value={String(scheduleForm.frequency_months)}
                    onValueChange={(value) => setScheduleForm({ ...scheduleForm, frequency_months: Number(value) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 3, 6, 12, 24].map((months) => (
                        <SelectItem key={months} value={String(months)}>
                          {months} {isAr ? "شهر" : months === 1 ? "month" : "months"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">{isAr ? "قائمة مكونات الفحص" : "Component checklist"}</h3>
                  <Badge variant="secondary">{scheduleForm.items.length}</Badge>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {availableComponents.map((component) => {
                    const selected = selectedComponentIds.has(component.id);
                    const item = scheduleForm.items.find((entry) => entry.component_id === component.id);
                    return (
                      <div key={component.id} className="flex items-center gap-2 rounded-lg border p-3">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() =>
                            setScheduleForm({
                              ...scheduleForm,
                              items: selected
                                ? scheduleForm.items.filter((entry) => entry.component_id !== component.id)
                                : [...scheduleForm.items, { component_id: component.id, action_type: "inspection" }],
                            })
                          }
                        />
                        <span className="min-w-0 flex-1 text-sm">
                          {isAr ? component.name_ar : component.name_en}
                        </span>
                        {item && (
                          <Select
                            value={item.action_type}
                            onValueChange={(value) =>
                              setScheduleForm({
                                ...scheduleForm,
                                items: scheduleForm.items.map((entry) =>
                                  entry.component_id === component.id
                                    ? { ...entry, action_type: value }
                                    : entry,
                                ),
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["inspection", "cleaning", "lubrication", "adjustment", "repair", "replacement"].map((action) => (
                                <SelectItem key={action} value={action}>{action}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{isAr ? "تعليمات وملاحظات" : "Instructions and notes"}</label>
                <Textarea
                  value={scheduleForm.description}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, description: event.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/60 p-3">
                <span className="font-medium">{isAr ? "الخطة نشطة" : "Plan active"}</span>
                <Switch
                  checked={scheduleForm.is_active}
                  onCheckedChange={(is_active) => setScheduleForm({ ...scheduleForm, is_active })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={!scheduleForm?.items.length || saveSchedule.isPending}
              onClick={() => scheduleForm && saveSchedule.mutate(scheduleForm)}
            >
              <CheckCircle2 className="ml-2 h-4 w-4" />
              {isAr ? "حفظ الخطة" : "Save plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(runId)} onOpenChange={(open) => !open && setRunId(null)}>
        <DialogContent className="max-h-[94vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <DialogTitle>{isAr ? "تقرير الفحص الدوري الإلكتروني" : "Electronic Periodic Inspection"}</DialogTitle>
                <DialogDescription>
                  {run
                    ? `${(isAr ? run.machine_name_ar : run.machine_name) || run.machine_name} · ${new Date(run.scheduled_date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}`
                    : isAr
                      ? "جاري تحميل قائمة الفحص..."
                      : "Loading checklist..."}
                </DialogDescription>
              </div>
              {run && scheduleByMachine.get(run.machine_id) && (
                <Button
                  variant="outline"
                  onClick={() =>
                    printChecklist({
                      machine: machines.find((machine) => machine.id === run.machine_id)!,
                      schedule: scheduleByMachine.get(run.machine_id)!,
                      items: runItems,
                      isAr,
                      reportNotes,
                      completed: true,
                    })
                  }
                >
                  <Printer className="ml-2 h-4 w-4" />
                  {isAr ? "طباعة التقرير" : "Print report"}
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-3">
            {runItems.map((item, index) => (
              <div key={item.id} className={`rounded-xl border p-4 ${item.checked ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10" : ""}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <Checkbox
                    className="mt-1"
                    checked={item.checked}
                    onCheckedChange={(checked) =>
                      setRunItems((current) =>
                        current.map((entry) =>
                          entry.id === item.id ? { ...entry, checked: Boolean(checked) } : entry,
                        ),
                      )
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                      <p className="font-semibold">
                        {isAr ? item.component_name_ar : item.component_name_en}
                      </p>
                      <Badge variant="outline">{item.required_action}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <Select
                        value={item.condition || ""}
                        onValueChange={(condition) =>
                          setRunItems((current) =>
                            current.map((entry) => entry.id === item.id ? { ...entry, condition } : entry),
                          )
                        }
                      >
                        <SelectTrigger><SelectValue placeholder={isAr ? "حالة المكون" : "Condition"} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">{isAr ? "جيد" : "Good"}</SelectItem>
                          <SelectItem value="attention">{isAr ? "يحتاج متابعة" : "Needs attention"}</SelectItem>
                          <SelectItem value="repair">{isAr ? "يحتاج إصلاح" : "Needs repair"}</SelectItem>
                          <SelectItem value="replace">{isAr ? "يحتاج استبدال" : "Needs replacement"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={item.result || ""}
                        onValueChange={(result) =>
                          setRunItems((current) =>
                            current.map((entry) => entry.id === item.id ? { ...entry, result } : entry),
                          )
                        }
                      >
                        <SelectTrigger><SelectValue placeholder={isAr ? "نتيجة الفحص" : "Result"} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pass">{isAr ? "ناجح" : "Pass"}</SelectItem>
                          <SelectItem value="fail">{isAr ? "غير ناجح" : "Fail"}</SelectItem>
                          <SelectItem value="not_applicable">{isAr ? "لا ينطبق" : "N/A"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={item.notes || ""}
                        placeholder={isAr ? "ملاحظات العنصر" : "Item notes"}
                        onChange={(event) =>
                          setRunItems((current) =>
                            current.map((entry) =>
                              entry.id === item.id ? { ...entry, notes: event.target.value } : entry,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Textarea
              rows={3}
              value={reportNotes}
              placeholder={isAr ? "الملاحظات العامة والتوصيات" : "General notes and recommendations"}
              onChange={(event) => setReportNotes(event.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => saveRun.mutate("in_progress")} disabled={saveRun.isPending}>
              {isAr ? "حفظ كمسودة" : "Save draft"}
            </Button>
            <Button onClick={() => saveRun.mutate("completed")} disabled={!allChecked || saveRun.isPending}>
              <CheckCircle2 className="ml-2 h-4 w-4" />
              {isAr ? "إكمال واعتماد التقرير" : "Complete report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MachineMaintenanceFileDialog
        machineId={fileMachineId}
        onOpenChange={(open) => !open && setFileMachineId(null)}
      />
    </div>
  );
}