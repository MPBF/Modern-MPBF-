import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  History,
  PauseCircle,
  Play,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  MaintenanceComponent,
  Machine,
  Section,
} from "../../../../shared/schema";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { userHasPermission } from "../../utils/roleUtils";
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
  component_id: number | null;
  component_name_ar: string;
  component_name_en: string;
  action_type: string;
  quantity: number;
  notes?: string | null;
};

type Schedule = {
  id: number;
  name: string;
  section_id: string;
  section_name?: string | null;
  section_name_ar?: string | null;
  start_date: string;
  next_due_date: string;
  is_active: boolean;
  description?: string | null;
  machines: Array<{ id: string; name?: string | null; name_ar?: string | null }>;
  items: ScheduleItem[];
  last_run?: {
    id: number;
    scheduled_date: string;
    status: string;
    created_action_ids?: number[];
    error_message?: string | null;
    completed_at?: string | null;
  } | null;
  runs?: Schedule["last_run"][];
};

type FormState = {
  id: number | null;
  name: string;
  section_id: string;
  start_date: string;
  next_due_date: string;
  is_active: boolean;
  description: string;
  machine_ids: string[];
  items: ScheduleItem[];
};

const ACTION_TYPES = [
  "inspection",
  "cleaning",
  "lubrication",
  "adjustment",
  "repair",
  "replacement",
] as const;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dateValue(value?: string | null) {
  return value ? String(value).slice(0, 10) : today();
}

function emptyForm(): FormState {
  return {
    id: null,
    name: "",
    section_id: "",
    start_date: today(),
    next_due_date: today(),
    is_active: true,
    description: "",
    machine_ids: [],
    items: [],
  };
}

export default function MaintenanceScheduleTab() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const canCreateOrRun = userHasPermission(user, [
    "add_maintenance",
    "manage_maintenance_actions",
    "manage_maintenance",
  ]);
  const canEdit = userHasPermission(user, [
    "edit_maintenance",
    "manage_maintenance_actions",
    "manage_maintenance",
  ]);
  const canDelete = userHasPermission(user, "manage_maintenance");

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/maintenance-schedules"],
  });
  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });
  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });
  const { data: components = [] } = useQuery<MaintenanceComponent[]>({
    queryKey: ["/api/maintenance-components"],
  });
  const { data: scheduleHistory } = useQuery<Schedule>({
    queryKey: ["/api/maintenance-schedules", historyId],
    queryFn: async () => {
      const response = await fetch(`/api/maintenance-schedules/${historyId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("history failed");
      return response.json();
    },
    enabled: historyId !== null,
  });

  const sectionMachines = useMemo(
    () => machines.filter((machine) => machine.section_id === form.section_id),
    [machines, form.section_id],
  );
  const selectedComponentIds = useMemo(
    () => new Set(form.items.map((item) => item.component_id).filter(Boolean)),
    [form.items],
  );

  const copy = isAr
    ? {
        title: "جدولة الصيانة",
        description:
          "قوالب سنوية للقسم تنشئ إجراءات وقائية تلقائياً عند الاستحقاق.",
        newSchedule: "جدول صيانة جديد",
        editSchedule: "تعديل جدول الصيانة",
        hint: "اختر تاريخ الاستحقاق السنوي والمكونات والماكينات المستهدفة.",
        name: "اسم الجدول",
        section: "القسم",
        selectSection: "اختر القسم",
        dueDate: "موعد الاستحقاق القادم",
        startDate: "تاريخ بداية الجدولة",
        machines: "ماكينات القسم",
        components: "مكونات الصيانة",
        notes: "وصف أو ملاحظات",
        active: "نشط",
        paused: "متوقف",
        nextDue: "الموعد القادم",
        machineCount: "عدد الماكينات",
        componentCount: "المكونات",
        lastRun: "آخر دورة",
        noRuns: "لم تُنفّذ دورة بعد",
        runNow: "تشغيل الآن",
        history: "السجل",
        save: "حفظ الجدول",
        delete: "حذف",
        empty: "لا توجد جداول صيانة بعد",
        selectAtLeastOne: "اختر ماكينة واحدة ومكوّناً واحداً على الأقل",
        nameRequired: "اسم الجدول مطلوب",
        created: "تم إنشاء جدول الصيانة",
        updated: "تم تحديث جدول الصيانة",
        failed: "تعذّر حفظ جدول الصيانة",
        runCreated: "تم إنشاء الإجراءات الوقائية للدورة",
        runFailed: "تعذّر تشغيل الجدول",
        deleted: "تم حذف جدول الصيانة",
        confirmDelete: "هل تريد حذف هذا الجدول وسجل دوراته نهائياً؟",
        enable: "تفعيل",
        disable: "إيقاف",
        statusCreated: "تم الإنشاء",
        statusFailed: "فشلت الدورة",
        statusPending: "قيد المعالجة",
        annual: "يتكرر سنوياً",
        action: "الإجراء",
        scheduleHistory: "سجل دورات الجدولة",
        noHistory: "لا توجد دورات مسجّلة بعد",
      }
    : {
        title: "Maintenance schedules",
        description:
          "Annual section templates that automatically create preventive actions when due.",
        newSchedule: "New schedule",
        editSchedule: "Edit schedule",
        hint: "Choose the annual due date, components, and target machines.",
        name: "Schedule name",
        section: "Section",
        selectSection: "Select section",
        dueDate: "Next due date",
        startDate: "Schedule start date",
        machines: "Section machines",
        components: "Maintenance components",
        notes: "Description or notes",
        active: "Active",
        paused: "Paused",
        nextDue: "Next due",
        machineCount: "Machines",
        componentCount: "Components",
        lastRun: "Last run",
        noRuns: "No run yet",
        runNow: "Run now",
        history: "History",
        save: "Save schedule",
        delete: "Delete",
        empty: "No maintenance schedules yet",
        selectAtLeastOne: "Select at least one machine and component",
        nameRequired: "Schedule name is required",
        created: "Maintenance schedule created",
        updated: "Maintenance schedule updated",
        failed: "Could not save the maintenance schedule",
        runCreated: "Preventive actions created for this run",
        runFailed: "Could not run the schedule",
        deleted: "Maintenance schedule deleted",
        confirmDelete: "Delete this schedule and its run history permanently?",
        enable: "Enable",
        disable: "Pause",
        statusCreated: "Created",
        statusFailed: "Failed",
        statusPending: "Processing",
        annual: "Repeats annually",
        action: "Action",
        scheduleHistory: "Schedule run history",
        noHistory: "No runs recorded yet",
      };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/maintenance-schedules"] });
    queryClient.invalidateQueries({ queryKey: ["/api/preventive-actions"] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: Omit<FormState, "id"> }) =>
      apiRequest(
        id
          ? `/api/maintenance-schedules/${id}`
          : "/api/maintenance-schedules",
        {
          method: id ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      ),
    onSuccess: (_data, variables) => {
      invalidate();
      setDialogOpen(false);
      setForm(emptyForm());
      toast({ title: variables.id ? copy.updated : copy.created });
    },
    onError: () => toast({ title: copy.failed, variant: "destructive" }),
  });

  const runMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/maintenance-schedules/${id}/run`, { method: "POST" }),
    onSuccess: () => {
      invalidate();
      toast({ title: copy.runCreated });
    },
    onError: () => toast({ title: copy.runFailed, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/maintenance-schedules/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast({ title: copy.deleted });
    },
    onError: () => toast({ title: copy.failed, variant: "destructive" }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiRequest(`/api/maintenance-schedules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active }),
      }),
    onSuccess: invalidate,
    onError: () => toast({ title: copy.failed, variant: "destructive" }),
  });

  const setSection = (sectionId: string) => {
    const machineIds = machines
      .filter((machine) => machine.section_id === sectionId)
      .map((machine) => machine.id);
    setForm((current) => ({
      ...current,
      section_id: sectionId,
      machine_ids: machineIds,
      items: [],
    }));
  };

  const toggleMachine = (machineId: string) => {
    setForm((current) => ({
      ...current,
      machine_ids: current.machine_ids.includes(machineId)
        ? current.machine_ids.filter((id) => id !== machineId)
        : [...current.machine_ids, machineId],
    }));
  };

  const toggleComponent = (component: MaintenanceComponent) => {
    setForm((current) => {
      const exists = current.items.some(
        (item) => item.component_id === component.id,
      );
      return {
        ...current,
        items: exists
          ? current.items.filter((item) => item.component_id !== component.id)
          : [
              ...current.items,
              {
                component_id: component.id,
                component_name_ar: component.name_ar,
                component_name_en: component.name_en,
                action_type: "inspection",
                quantity: 1,
              },
            ],
      };
    });
  };

  const updateItemAction = (componentId: number | null, actionType: string) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.component_id === componentId
          ? { ...item, action_type: actionType }
          : item,
      ),
    }));
  };

  const openCreate = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (schedule: Schedule) => {
    setForm({
      id: schedule.id,
      name: schedule.name,
      section_id: schedule.section_id,
      start_date: dateValue(schedule.start_date),
      next_due_date: dateValue(schedule.next_due_date),
      is_active: schedule.is_active,
      description: schedule.description || "",
      machine_ids: (schedule.machines || []).map((machine) => machine.id),
      items: (schedule.items || []).map((item) => ({
        ...item,
        component_id: item.component_id ?? null,
        quantity: Number(item.quantity) || 1,
      })),
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast({ title: copy.nameRequired, variant: "destructive" });
      return;
    }
    if (form.machine_ids.length === 0 || form.items.length === 0) {
      toast({ title: copy.selectAtLeastOne, variant: "destructive" });
      return;
    }
    const { id, ...payload } = form;
    saveMutation.mutate({ id, payload: { ...payload, name: payload.name.trim() } });
  };

  const formatDate = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString(isAr ? "ar-SA" : "en-US")
      : "—";
  const runLabel = (run?: Schedule["last_run"] | null) => {
    if (!run) return copy.noRuns;
    if (run.status === "completed") return copy.statusCreated;
    if (run.status === "failed") return copy.statusFailed;
    return copy.statusPending;
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              {copy.title}
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>
          </div>
          {canCreateOrRun && (
            <Button onClick={openCreate}>
              <Plus className="ml-2 h-4 w-4" />
              {copy.newSchedule}
            </Button>
          )}
        </CardHeader>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarClock className="mx-auto mb-3 h-9 w-9 opacity-40" />
            {copy.empty}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className={!schedule.is_active ? "opacity-70" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{schedule.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {(isAr ? schedule.section_name_ar : schedule.section_name) ||
                        schedule.section_name ||
                        schedule.section_id}
                    </p>
                  </div>
                  <Badge variant={schedule.is_active ? "default" : "secondary"}>
                    {schedule.is_active ? copy.active : copy.paused}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-muted-foreground">{copy.nextDue}</p>
                    <p className="mt-1 font-semibold">{formatDate(schedule.next_due_date)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-muted-foreground">{copy.machineCount}</p>
                    <p className="mt-1 font-semibold">{schedule.machines?.length || 0}</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-muted-foreground">{copy.componentCount}</p>
                    <p className="mt-1 font-semibold">{schedule.items?.length || 0}</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-muted-foreground">{copy.lastRun}</p>
                    <p className="mt-1 font-semibold">{runLabel(schedule.last_run)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{copy.annual}</span>
                  {schedule.last_run?.scheduled_date && (
                    <span className="text-muted-foreground">
                      {formatDate(schedule.last_run.scheduled_date)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryId(schedule.id)}
                  >
                    <History className="ml-2 h-4 w-4" />
                    {copy.history}
                  </Button>
                  {canCreateOrRun && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={runMutation.isPending}
                        onClick={() => runMutation.mutate(schedule.id)}
                      >
                        <Play className="ml-2 h-4 w-4" />
                        {copy.runNow}
                      </Button>
                    </>
                  )}
                  {canEdit && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: schedule.id,
                            is_active: !schedule.is_active,
                          })
                        }
                      >
                        {schedule.is_active ? (
                          <PauseCircle className="ml-2 h-4 w-4" />
                        ) : (
                          <Power className="ml-2 h-4 w-4" />
                        )}
                        {schedule.is_active ? copy.disable : copy.enable}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(schedule)}>
                        {copy.editSchedule}
                      </Button>
                    </>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (window.confirm(copy.confirmDelete)) {
                          deleteMutation.mutate(schedule.id);
                        }
                      }}
                    >
                      <Trash2 className="ml-2 h-4 w-4" />
                      {copy.delete}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? copy.editSchedule : copy.newSchedule}</DialogTitle>
            <DialogDescription>{copy.hint}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">{copy.name}</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{copy.section}</label>
                <Select value={form.section_id} onValueChange={setSection}>
                  <SelectTrigger><SelectValue placeholder={copy.selectSection} /></SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {(isAr ? section.name_ar : section.name) || section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{copy.startDate}</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{copy.dueDate}</label>
                <Input
                  type="date"
                  value={form.next_due_date}
                  onChange={(event) => setForm((current) => ({ ...current, next_due_date: event.target.value }))}
                />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{copy.machines}</h3>
                <span className="text-sm text-muted-foreground">{form.machine_ids.length}</span>
              </div>
              {!form.section_id ? (
                <p className="text-sm text-muted-foreground">{copy.selectSection}</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {sectionMachines.map((machine) => (
                    <label key={machine.id} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50">
                      <Checkbox
                        checked={form.machine_ids.includes(machine.id)}
                        onCheckedChange={() => toggleMachine(machine.id)}
                      />
                      <span>{(isAr ? machine.name_ar : machine.name) || machine.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{copy.components}</h3>
                <span className="text-sm text-muted-foreground">{form.items.length}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {components.map((component) => {
                  const item = form.items.find((entry) => entry.component_id === component.id);
                  return (
                    <div key={component.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Checkbox
                        checked={selectedComponentIds.has(component.id)}
                        onCheckedChange={() => toggleComponent(component)}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {isAr ? component.name_ar : component.name_en}
                      </span>
                      {item && (
                        <Select
                          value={item.action_type}
                          onValueChange={(value) => updateItemAction(component.id, value)}
                        >
                          <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ACTION_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {isAr
                                  ? { inspection: "فحص", cleaning: "تنظيف", lubrication: "تشحيم", adjustment: "ضبط", repair: "إصلاح", replacement: "استبدال" }[type]
                                  : type}
                              </SelectItem>
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
              <label className="mb-1 block text-sm font-medium">{copy.notes}</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="font-medium">{copy.active}</span>
              <Switch
                checked={form.is_active}
                onCheckedChange={(is_active) => setForm((current) => ({ ...current, is_active }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={saveMutation.isPending}>
              <CheckCircle2 className="ml-2 h-4 w-4" />
              {copy.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyId !== null} onOpenChange={(open) => !open && setHistoryId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{copy.scheduleHistory}</DialogTitle>
            <DialogDescription>{scheduleHistory?.name}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {!scheduleHistory?.runs?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{copy.noHistory}</p>
            ) : (
              scheduleHistory.runs.map((run) => (
                <div key={run?.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{formatDate(run?.scheduled_date)}</span>
                    <Badge variant={run?.status === "completed" ? "default" : run?.status === "failed" ? "destructive" : "secondary"}>
                      {runLabel(run)}
                    </Badge>
                  </div>
                  {run?.created_action_ids?.length ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isAr ? "الإجراءات الوقائية: " : "Preventive actions: "}
                      {run.created_action_ids.join(", ")}
                    </p>
                  ) : null}
                  {run?.error_message ? (
                    <p className="mt-2 text-sm text-destructive">{run.error_message}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}