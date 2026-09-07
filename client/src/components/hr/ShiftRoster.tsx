import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, Pencil, Plus, Power, Save } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from "../../components/ui/skeleton";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { userHasPermission } from "../../utils/roleUtils";

interface ShiftTemplate {
  id: number;
  name_ar: string;
  name_en: string | null;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  base_work_hours: string | number;
  active: boolean;
}

interface Employee {
  id: number;
  username: string;
  display_name: string | null;
  display_name_ar: string | null;
  section_name: string | null;
  section_name_ar: string | null;
}

interface ShiftAssignment {
  user_id: number;
  shift_template_id: number | null;
  shift_snapshot: Partial<ShiftTemplate> | null;
}

interface ShiftRosterRow {
  employee: Employee;
  assignment: ShiftAssignment | null;
}

interface ShiftRosterResponse {
  data: ShiftRosterRow[];
  roster_revision: string;
}

interface TemplateForm {
  name_ar: string;
  name_en: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  base_work_hours: number;
  active: boolean;
}

const newTemplate = (): TemplateForm => ({
  name_ar: "",
  name_en: "",
  start_time: "07:00",
  end_time: "19:00",
  grace_minutes: 0,
  base_work_hours: 8,
  active: true,
});

function factoryMonthValue() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";
  return `${getPart("year")}-${getPart("month")}`;
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function getTemplateName(template: Partial<ShiftTemplate>, isRTL: boolean) {
  return (
    (isRTL ? template.name_ar : template.name_en) ||
    template.name_ar ||
    template.name_en ||
    "—"
  );
}

async function responseMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  if (!body || typeof body !== "object") return fallback;
  const fieldErrors =
    "errors" in body && body.errors && typeof body.errors === "object"
      ? Object.values(body.errors as Record<string, unknown>)
          .flatMap((value) => (Array.isArray(value) ? value : []))
          .filter((value): value is string => typeof value === "string")
      : [];
  if (fieldErrors.length) return fieldErrors.join("، ");
  return "message" in body && typeof body.message === "string"
    ? body.message
    : fallback;
}

export default function ShiftRoster() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const L = (ar: string, en: string) => (isRTL ? ar : en);
  const canManage = userHasPermission(user, ["manage_attendance", "manage_hr"]);
  const [monthValue, setMonthValue] = useState(factoryMonthValue);
  const [assignments, setAssignments] = useState<Record<number, number | null>>(
    {},
  );
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(
    null,
  );
  const [templateForm, setTemplateForm] = useState<TemplateForm>(newTemplate);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [confirmCurrentMonth, setConfirmCurrentMonth] = useState(false);
  const [year, month] = monthValue.split("-").map(Number) as [number, number];
  const isPastMonth = monthValue < factoryMonthValue();

  const templatesQuery = useQuery<{ data: ShiftTemplate[] }>({
    queryKey: ["/api/hr/shift-templates"],
  });
  const rosterQuery = useQuery<ShiftRosterResponse>({
    queryKey: ["/api/hr/shifts", { year, month }],
    enabled: Number.isInteger(year) && Number.isInteger(month),
  });

  const templates = templatesQuery.data?.data ?? [];
  const rosterRows = useMemo(
    () => rosterQuery.data?.data ?? [],
    [rosterQuery.data?.data],
  );
  const employees = useMemo(
    () => rosterRows.map((row) => row.employee),
    [rosterRows],
  );
  const existingAssignments = useMemo(
    () =>
      rosterRows
        .map((row) => row.assignment)
        .filter((assignment): assignment is ShiftAssignment => !!assignment),
    [rosterRows],
  );
  const assignmentByUser = useMemo(
    () =>
      new Map(
        existingAssignments.map((assignment) => [
          assignment.user_id,
          assignment,
        ]),
      ),
    [existingAssignments],
  );

  useEffect(() => {
    setAssignments(
      Object.fromEntries(
        employees.map((employee) => [
          employee.id,
          assignmentByUser.get(employee.id)?.shift_template_id ?? null,
        ]),
      ),
    );
  }, [employees, assignmentByUser]);

  const invalidateShiftData = () => {
    void queryClient.invalidateQueries({
      queryKey: ["/api/hr/shift-templates"],
    });
    void queryClient.invalidateQueries({ queryKey: ["/api/hr/shifts"] });
  };

  const templateMutation = useMutation({
    mutationFn: async () => {
      const duration =
        (timeToMinutes(templateForm.end_time) -
          timeToMinutes(templateForm.start_time) +
          1440) %
        1440;

      if (!templateForm.name_ar.trim()) {
        throw new Error(L("الاسم العربي مطلوب", "Arabic name is required"));
      }
      if (
        !/^\d{2}:\d{2}$/.test(templateForm.start_time) ||
        !/^\d{2}:\d{2}$/.test(templateForm.end_time)
      ) {
        throw new Error(L("وقت الوردية غير صالح", "Shift time is invalid"));
      }
      if (!duration) {
        throw new Error(
          L(
            "لا يمكن أن يتطابق وقت البداية والنهاية",
            "Start and end times cannot match",
          ),
        );
      }
      if (
        !Number.isInteger(templateForm.grace_minutes) ||
        templateForm.grace_minutes < 0 ||
        templateForm.grace_minutes > 180
      ) {
        throw new Error(
          L(
            "فترة السماح يجب أن تكون بين 0 و180 دقيقة",
            "Grace must be between 0 and 180 minutes",
          ),
        );
      }
      if (
        templateForm.base_work_hours <= 0 ||
        templateForm.base_work_hours > duration / 60 ||
        Math.round(templateForm.base_work_hours * 4) !==
          templateForm.base_work_hours * 4
      ) {
        throw new Error(
          L(
            "الساعات الأساسية غير صالحة لمدة الوردية",
            "Base hours are invalid for this shift duration",
          ),
        );
      }

      const endpoint = editingTemplate
        ? `/api/hr/shift-templates/${editingTemplate.id}`
        : "/api/hr/shift-templates";
      const response = await apiRequest(endpoint, {
        method: editingTemplate ? "PATCH" : "POST",
        body: JSON.stringify({
          ...templateForm,
          name_en: templateForm.name_en.trim() || null,
          grace_minutes: Number(templateForm.grace_minutes),
          base_work_hours: String(templateForm.base_work_hours),
        }),
      });
      if (!response.ok) {
        throw new Error(
          await responseMessage(
            response,
            L("فشل حفظ القالب", "Could not save template"),
          ),
        );
      }
      return response.json() as Promise<ShiftTemplate>;
    },
    onSuccess: () => {
      invalidateShiftData();
      setTemplateDialogOpen(false);
      toast({ title: L("تم حفظ قالب الوردية", "Shift template saved") });
    },
    onError: (error: Error) => setTemplateError(error.message),
  });

  const disableMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(
        `/api/hr/shift-templates/${id}/disable`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        throw new Error(
          await responseMessage(
            response,
            L("فشل تعطيل القالب", "Could not disable template"),
          ),
        );
      }
    },
    onSuccess: () => {
      invalidateShiftData();
      toast({ title: L("تم تعطيل القالب", "Template disabled") });
    },
    onError: (error: Error) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: error.message,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/hr/shifts", {
        method: "POST",
        body: JSON.stringify({
          year,
          month,
          roster_revision: rosterQuery.data?.roster_revision,
          assignments: employees.map((employee) => ({
            user_id: employee.id,
            shift_template_id: assignments[employee.id] ?? null,
          })),
        }),
      });
      if (!response.ok) {
        throw new Error(
          await responseMessage(response, L("فشل الحفظ", "Save failed")),
        );
      }
      return response.json();
    },
    onSuccess: () => {
      invalidateShiftData();
      toast({
        title: L("تم الحفظ", "Saved"),
        description: L("تم حفظ جدول الورديات", "Shift roster saved"),
      });
    },
    onError: (error: Error) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: error.message,
      }),
  });

  const openTemplateDialog = (template?: ShiftTemplate) => {
    setEditingTemplate(template ?? null);
    setTemplateForm(
      template
        ? {
            name_ar: template.name_ar,
            name_en: template.name_en ?? "",
            start_time: template.start_time,
            end_time: template.end_time,
            grace_minutes: template.grace_minutes,
            base_work_hours: Number(template.base_work_hours),
            active: template.active,
          }
        : newTemplate(),
    );
    setTemplateError("");
    setTemplateDialogOpen(true);
  };

  const employeeName = (employee: Employee) =>
    (isRTL ? employee.display_name_ar : employee.display_name) ||
    employee.display_name ||
    employee.username;
  const isLoading =
    templatesQuery.isLoading ||
    rosterQuery.isLoading;

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">
              {L("قوالب الورديات", "Shift Templates")}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {L(
                "أنشئ القوالب وعدّلها أو عطّلها دون التأثير على السجلات السابقة.",
                "Create, edit, or disable templates without changing historical records.",
              )}
            </p>
          </div>
          {canManage && (
            <Button size="sm" onClick={() => openTemplateDialog()}>
              <Plus className="me-1 h-4 w-4" />
              {L("قالب جديد", "New template")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {templatesQuery.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : templatesQuery.isError ? (
            <p className="py-4 text-sm text-destructive">
              {L(
                "تعذر تحميل قوالب الورديات. حاول مرة أخرى.",
                "Unable to load shift templates. Please try again.",
              )}
            </p>
          ) : templates.length === 0 ? (
            <p className="py-5 text-center text-sm text-muted-foreground">
              {L("لا توجد قوالب ورديات", "No shift templates yet")}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {getTemplateName(template, isRTL)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {template.start_time} — {template.end_time}
                      </p>
                    </div>
                    <Badge variant={template.active ? "default" : "secondary"}>
                      {template.active
                        ? L("نشط", "Active")
                        : L("معطل", "Disabled")}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {L("سماح", "Grace")}: {template.grace_minutes}{" "}
                    {L("دقيقة", "min")}
                    {" · "}
                    {template.base_work_hours} {L("ساعة أساسية", "base hrs")}
                  </p>
                  {canManage && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTemplateDialog(template)}
                      >
                        <Pencil className="me-1 h-3.5 w-3.5" />
                        {L("تعديل", "Edit")}
                      </Button>
                      {template.active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => disableMutation.mutate(template.id)}
                          disabled={disableMutation.isPending}
                        >
                          <Power className="me-1 h-3.5 w-3.5" />
                          {L("تعطيل", "Disable")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" />
              {L("جدول الورديات الشهري", "Monthly Shift Roster")}
            </CardTitle>
            {isPastMonth && (
              <p className="mt-1 text-sm text-muted-foreground">
                {L(
                  "الأشهر المنتهية للقراءة فقط.",
                  "Completed months are read-only.",
                )}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="month"
              value={monthValue}
              onChange={(event) => setMonthValue(event.target.value)}
              className="w-auto"
              data-testid="input-roster-month"
            />
            {canManage && !isPastMonth && (
              <Button
                size="sm"
                onClick={() =>
                  monthValue === factoryMonthValue()
                    ? setConfirmCurrentMonth(true)
                    : saveMutation.mutate()
                }
                disabled={saveMutation.isPending || isLoading}
              >
                <Save className="me-1 h-4 w-4" />
                {saveMutation.isPending
                  ? L("جارٍ الحفظ...", "Saving...")
                  : L("حفظ", "Save")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : rosterQuery.isError ? (
            <p className="py-6 text-center text-sm text-destructive">
              {L(
                "تعذر تحميل جدول الموظفين. حاول مرة أخرى.",
                "Unable to load the employee roster. Please try again.",
              )}
            </p>
          ) : employees.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {L("لا يوجد موظفون", "No employees")}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {employees.map((employee) => {
                const selectedId = assignments[employee.id];
                const assignment = assignmentByUser.get(employee.id);
                const selectedTemplate =
                  templates.find((template) => template.id === selectedId) ??
                  assignment?.shift_snapshot;
                const selectableTemplates = templates.filter(
                  (template) => template.active || template.id === selectedId,
                );
                return (
                  <div
                    key={employee.id}
                    className="rounded-lg border p-3"
                    data-testid={`row-roster-${employee.id}`}
                  >
                    <p className="font-medium">{employeeName(employee)}</p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {(isRTL
                        ? employee.section_name_ar
                        : employee.section_name) ||
                        employee.section_name ||
                        "—"}
                    </p>
                    <Select
                      value={selectedId == null ? "none" : String(selectedId)}
                      onValueChange={(value) =>
                        setAssignments((current) => ({
                          ...current,
                          [employee.id]:
                            value === "none" ? null : Number(value),
                        }))
                      }
                      disabled={!canManage || isPastMonth}
                    >
                      <SelectTrigger
                        className="w-full"
                        data-testid={`select-shift-${employee.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {L("غير مجدول", "Unscheduled")}
                        </SelectItem>
                        {selectableTemplates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={String(template.id)}
                          >
                            {getTemplateName(template, isRTL)} (
                            {template.start_time}–{template.end_time})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedId != null && selectedTemplate && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {getTemplateName(selectedTemplate, isRTL)} ·{" "}
                        {selectedTemplate.start_time}–
                        {selectedTemplate.end_time}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate
                ? L("تعديل قالب الوردية", "Edit Shift Template")
                : L("قالب وردية جديد", "New Shift Template")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{L("الاسم العربي", "Arabic name")}</Label>
              <Input
                value={templateForm.name_ar}
                maxLength={100}
                onChange={(event) =>
                  setTemplateForm((form) => ({
                    ...form,
                    name_ar: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{L("الاسم الإنجليزي", "English name")}</Label>
              <Input
                value={templateForm.name_en}
                maxLength={100}
                onChange={(event) =>
                  setTemplateForm((form) => ({
                    ...form,
                    name_en: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{L("وقت البداية", "Start time")}</Label>
              <Input
                type="time"
                value={templateForm.start_time}
                onChange={(event) =>
                  setTemplateForm((form) => ({
                    ...form,
                    start_time: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{L("وقت النهاية", "End time")}</Label>
              <Input
                type="time"
                value={templateForm.end_time}
                onChange={(event) =>
                  setTemplateForm((form) => ({
                    ...form,
                    end_time: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {L("فترة السماح (دقيقة)", "Grace period (minutes)")}
              </Label>
              <Input
                type="number"
                min="0"
                max="180"
                value={templateForm.grace_minutes}
                onChange={(event) =>
                  setTemplateForm((form) => ({
                    ...form,
                    grace_minutes: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{L("الساعات الأساسية", "Base work hours")}</Label>
              <Input
                type="number"
                min="0.25"
                step="0.25"
                value={templateForm.base_work_hours}
                onChange={(event) =>
                  setTemplateForm((form) => ({
                    ...form,
                    base_work_hours: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
          {templateError && (
            <p className="text-sm text-destructive">{templateError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateDialogOpen(false)}
            >
              {L("إلغاء", "Cancel")}
            </Button>
            <Button
              onClick={() => templateMutation.mutate()}
              disabled={templateMutation.isPending}
            >
              {templateMutation.isPending
                ? L("جارٍ الحفظ...", "Saving...")
                : L("حفظ", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmCurrentMonth} onOpenChange={setConfirmCurrentMonth}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {L("تأكيد تعديل الشهر الحالي", "Confirm current-month change")}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {L(
                "قد يؤدي تغيير التخصيصات إلى إعادة حساب نتائج الحضور للشهر الحالي.",
                "Changing assignments can recalculate attendance results for the current month.",
              )}
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmCurrentMonth(false)}
            >
              {L("إلغاء", "Cancel")}
            </Button>
            <Button
              onClick={() => {
                setConfirmCurrentMonth(false);
                saveMutation.mutate();
              }}
            >
              {L("تأكيد الحفظ", "Confirm save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
