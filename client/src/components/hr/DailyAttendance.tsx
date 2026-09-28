import { useEffect, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Pencil, RefreshCw, Send } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Skeleton } from "../../components/ui/skeleton";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useAuth } from "../../hooks/use-auth";
import { userHasPermission } from "../../utils/roleUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import SectionMultiSelect, {
  type AttendanceSection,
} from "./SectionMultiSelect";
import BulkAttendanceDialog, { type BulkTimes } from "./BulkAttendanceDialog";
import { shiftWallTimeToInstant } from "../../../../shared/attendance-admin-status";

function todayStr() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

type DailyRow = {
  user_id: number;
  username: string;
  display_name: string | null;
  display_name_ar: string | null;
  role_name: string | null;
  role_name_ar: string | null;
  section_name: string | null;
  section_name_ar: string | null;
  shift_kind: string | null;
  shift_name_ar: string | null;
  shift_name_en: string | null;
  current_status: string;
  check_in_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
  check_out_time: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  "حاضر": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "يعمل": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "في الاستراحة":
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "استراحة":
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "استراحة غداء":
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "منسحب":
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "مغادر": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "غائب": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "إجازة":
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "عطلة":
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

const STATUS_EN: Record<string, string> = {
  "حاضر": "Present",
  "يعمل": "Working",
  "في الاستراحة": "On Break",
  "استراحة": "On Break",
  "استراحة غداء": "Lunch Break",
  "منسحب": "Withdrawn",
  "مغادر": "Checked Out",
  "غائب": "Absent",
  "إجازة": "On Leave",
  "عطلة": "Holiday",
};

type EditForm = {
  check_in: string;
  break_start: string;
  break_end: string;
  check_out: string;
};

const DEFAULT_SECTION_NAMES = [
  ["الإنتاج - فيلم", "production-extruder"],
  ["الإنتاج - طباعة", "production-printing"],
  ["الإنتاج - قطع", "production-cutting"],
  ["المستودع", "warehouse"],
] as const;

function getDefaultSectionIds(sections: AttendanceSection[]): string[] {
  const sectionNumber = (id: string) => {
    const match = /^SEC(\d+)$/.exec(id);
    const value = match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    return Number.isSafeInteger(value) ? value : Number.POSITIVE_INFINITY;
  };
  const sortedSections = [...sections].sort(
    (a, b) =>
      sectionNumber(a.id) - sectionNumber(b.id) || a.id.localeCompare(b.id),
  );
  const normalize = (value: string | null | undefined) =>
    (value || "").trim().toLocaleLowerCase("en-US");

  return DEFAULT_SECTION_NAMES.flatMap(([arabicName, englishName]) => {
    const match = sortedSections.find(
      (section) =>
        normalize(section.name_ar) === normalize(arabicName) ||
        normalize(section.name) === englishName,
    );
    return match ? [match.id] : [];
  });
}

function toTimeInput(t: string | null): string {
  if (!t) return "";
  const d = new Date(t);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(d);
}

function timeToISO(date: string, hhmm: string, isNight = false): string | null {
  if (!hhmm) return null;
  return shiftWallTimeToInstant(date, hhmm, isNight ? "night" : "day").toISOString();
}

export default function DailyAttendance() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const L = (ar: string, en: string) => (isRTL ? ar : en);
  const [date, setDate] = useState(todayStr());
  const [shiftFilter, setShiftFilter] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[] | null>(
    null,
  );
  const isToday = date === todayStr();
  const canManage = userHasPermission(user, ["manage_attendance", "manage_hr"]);

  const sectionsQuery = useQuery<AttendanceSection[]>({
    queryKey: ["/api/sections"],
  });

  useEffect(() => {
    if (selectedSectionIds !== null) return;
    if (sectionsQuery.isSuccess) {
      setSelectedSectionIds(getDefaultSectionIds(sectionsQuery.data || []));
    } else if (sectionsQuery.isError) {
      setSelectedSectionIds([]);
    }
  }, [
    sectionsQuery.data,
    sectionsQuery.isError,
    sectionsQuery.isSuccess,
    selectedSectionIds,
  ]);

  const [editRow, setEditRow] = useState<DailyRow | null>(null);
  const [form, setForm] = useState<EditForm>({
    check_in: "",
    break_start: "",
    break_end: "",
    check_out: "",
  });

  const openEdit = (r: DailyRow) => {
    setForm({
      check_in: toTimeInput(r.check_in_time),
      break_start: toTimeInput(r.break_start_time),
      break_end: toTimeInput(r.break_end_time),
      check_out: toTimeInput(r.check_out_time),
    });
    setEditRow(r);
  };

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editRow) return;
      const body = {
        user_id: editRow.user_id,
        date,
        check_in_time: timeToISO(date, form.check_in, editRow.shift_kind === "night"),
        break_start_time: timeToISO(date, form.break_start, editRow.shift_kind === "night"),
        break_end_time: timeToISO(date, form.break_end, editRow.shift_kind === "night"),
        check_out_time: timeToISO(date, form.check_out, editRow.shift_kind === "night"),
      };
      await apiRequest("/api/hr/attendance/daily", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/hr/attendance/daily"],
      });
      setEditRow(null);
      toast({
        title: L("تم حفظ التعديل بنجاح", "Changes saved successfully"),
      });
    },
    onError: (err: any) => {
      toast({
        title: L("فشل حفظ التعديل", "Failed to save changes"),
        description: err?.message || "",
        variant: "destructive",
      });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (times: BulkTimes) => {
      const response = await apiRequest("/api/hr/attendance/daily/bulk", {
        method: "PATCH",
        body: JSON.stringify({ date, user_ids: selectedUserIds, times }),
      });
      return response.json() as Promise<{
        successes: number[];
        failures: { user_id: number; message: string }[];
      }>;
    },
    onSuccess: ({ successes, failures }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/attendance/daily"] });
      setSelectedUserIds(failures.map((failure) => failure.user_id));
      setBulkOpen(false);
      toast({
        title: L(`تم تعديل ${successes.length} سجل`, `${successes.length} records updated`),
        description: failures.length
          ? L(`تعذر تعديل ${failures.length} سجل: `, `${failures.length} failed: `) +
            failures.map((failure) => `${rows.find((r) => r.user_id === failure.user_id)?.display_name || failure.user_id}: ${failure.message}`).join("؛ ")
          : undefined,
        variant: failures.length ? "destructive" : "default",
      });
    },
    onError: (error: Error) => toast({
      title: L("فشل التعديل الجماعي", "Bulk edit failed"),
      description: error.message,
      variant: "destructive",
    }),
  });

  const [notifyingUserId, setNotifyingUserId] = useState<number | null>(null);

  const notifyMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("/api/hr/attendance/daily/notify", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, date }),
      });
    },
    onMutate: (userId: number) => {
      setNotifyingUserId(userId);
    },
    onSuccess: () => {
      toast({
        title: L(
          "تم إرسال إشعار الحضور عبر الواتس اب",
          "Attendance notification sent via WhatsApp",
        ),
      });
    },
    onError: (err: any) => {
      const msg = err?.message || "";
      toast({
        title: msg.includes("لا يملك رقم جوال")
          ? L("المستخدم لا يملك رقم جوال", "User has no phone number")
          : L("فشل إرسال الإشعار", "Failed to send notification"),
        description: msg.includes("لا يملك رقم جوال") ? "" : msg,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setNotifyingUserId(null);
    },
  });

  const {
    data,
    isLoading: attendanceLoading,
    isFetching,
    refetch,
  } = useQuery<{
    data: DailyRow[];
    date: string;
  }>({
    queryKey: [
      "/api/hr/attendance/daily",
      { date, sectionIds: selectedSectionIds },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({ date });
      params.set("sectionIds", (selectedSectionIds || []).join(","));
      const response = await apiRequest(
        `/api/hr/attendance/daily?${params.toString()}`,
      );
      return response.json();
    },
    enabled: !!date && selectedSectionIds !== null,
    refetchInterval: isToday ? 60_000 : false,
  });

  const rows = (data?.data ?? []).filter((row) =>
    shiftFilter === "all" || (shiftFilter === "unassigned"
      ? !row.shift_kind : row.shift_kind === shiftFilter));
  const isLoading = selectedSectionIds === null || attendanceLoading;
  const selectedVisibleIds = rows.filter((row) => selectedUserIds.includes(row.user_id));
  const allVisibleSelected = rows.length > 0 && selectedVisibleIds.length === rows.length;

  const empName = (r: DailyRow) =>
    (isRTL ? r.display_name_ar : r.display_name) ||
    r.display_name ||
    r.username;

  const fmtTime = (t: string | null) => {
    if (!t) return "—";
    const d = new Date(t);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString(isRTL ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Riyadh",
    });
  };

  const statusBadge = (status: string) => (
    <Badge
      variant="outline"
      className={`border-0 ${STATUS_STYLES[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
    >
      {isRTL ? status : STATUS_EN[status] || status}
    </Badge>
  );

  const counts = rows.reduce(
    (acc, r) => {
      if (
        r.current_status === "غائب" ||
        r.current_status === "إجازة" ||
        r.current_status === "عطلة"
      )
        acc.absent++;
      else if (r.current_status === "مغادر") acc.left++;
      else if (
        r.current_status === "في الاستراحة" ||
        r.current_status === "استراحة" ||
        r.current_status === "استراحة غداء" ||
        r.current_status === "منسحب"
      )
        acc.onBreak++;
      else acc.present++;
      return acc;
    },
    { present: 0, onBreak: 0, left: 0, absent: 0 },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span>{L("الحضور والانصراف اليومي", "Daily Attendance")}</span>
          <div className="flex flex-wrap items-center gap-2">
            <SectionMultiSelect
              sections={sectionsQuery.data || []}
              selectedIds={selectedSectionIds || []}
              isLoading={selectedSectionIds === null}
              isRTL={isRTL}
              onChange={(ids) => { setSelectedSectionIds(ids); setSelectedUserIds([]); }}
            />
            <Select value={shiftFilter} onValueChange={(value) => { setShiftFilter(value); setSelectedUserIds([]); }}>
              <SelectTrigger className="w-36" aria-label={L("تصفية حسب الوردية", "Filter by shift")} data-testid="select-daily-attendance-shift">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{L("كل الورديات", "All shifts")}</SelectItem>
                <SelectItem value="day">{L("نهارية", "Day")}</SelectItem>
                <SelectItem value="night">{L("ليلية", "Night")}</SelectItem>
                <SelectItem value="flexible">{L("حرة", "Flexible")}</SelectItem>
                <SelectItem value="unassigned">{L("غير مجدولة", "Unassigned")}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => { setDate(e.target.value); setSelectedUserIds([]); }}
              className="w-auto"
              data-testid="input-daily-attendance-date"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh-daily-attendance"
            >
              <RefreshCw
                className={`h-4 w-4 ml-1 ${isFetching ? "animate-spin" : ""}`}
              />
              {L("تحديث", "Refresh")}
            </Button>
          </div>
        </CardTitle>
        {!isLoading && rows.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 text-sm">
            <Badge variant="outline" className="border-0 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
              {L("حاضر", "Present")}: {counts.present}
            </Badge>
            <Badge variant="outline" className="border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {L("في الاستراحة", "On Break")}: {counts.onBreak}
            </Badge>
            <Badge variant="outline" className="border-0 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {L("مغادر", "Checked Out")}: {counts.left}
            </Badge>
            <Badge variant="outline" className="border-0 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
              {L("غائب", "Absent")}: {counts.absent}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {canManage && selectedUserIds.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm">
            <span>{L(`تم تحديد ${selectedUserIds.length} موظف`, `${selectedUserIds.length} selected`)}</span>
            <Button size="sm" onClick={() => setBulkOpen(true)}>
              {L("تعديل الأوقات جماعياً", "Bulk edit times")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedUserIds([])}>
              {L("إلغاء التحديد", "Clear selection")}
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {selectedSectionIds?.length === 0
              ? L(
                  "اختر قسماً واحداً على الأقل لعرض الحضور",
                  "Select at least one section to view attendance",
                )
              : L("لا توجد بيانات لهذا اليوم", "No data for this day")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {canManage && <TableHead className="w-10">
                    <Checkbox
                      aria-label={L("تحديد كل الموظفين الظاهرين", "Select all visible employees")}
                      checked={allVisibleSelected}
                      onCheckedChange={(checked) => setSelectedUserIds(checked ? rows.map((row) => row.user_id) : [])}
                    />
                  </TableHead>}
                  <TableHead className={isRTL ? "text-right" : "text-left"}>
                    {L("الموظف", "Employee")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-right" : "text-left"}>
                    {L("القسم", "Section")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-right" : "text-left"}>{L("الوردية", "Shift")}</TableHead>
                  <TableHead className="text-center">
                    {L("وقت الحضور", "Check-in")}
                  </TableHead>
                  <TableHead className="text-center">
                    {L("بداية الاستراحة", "Break Start")}
                  </TableHead>
                  <TableHead className="text-center">
                    {L("العودة من الاستراحة", "Break Return")}
                  </TableHead>
                  <TableHead className="text-center">
                    {L("وقت الانصراف", "Check-out")}
                  </TableHead>
                  <TableHead className="text-center">
                    {L("الحالة الحالية", "Current Status")}
                  </TableHead>
                  {canManage && (
                    <TableHead className="text-center">
                      {L("إجراءات", "Actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.user_id}
                    data-testid={`row-daily-attendance-${r.user_id}`}
                  >
                    {canManage && <TableCell>
                      <Checkbox
                        aria-label={L(`تحديد ${empName(r)}`, `Select ${empName(r)}`)}
                        checked={selectedUserIds.includes(r.user_id)}
                        onCheckedChange={(checked) => setSelectedUserIds((current) =>
                          checked ? [...current, r.user_id] : current.filter((id) => id !== r.user_id))}
                      />
                    </TableCell>}
                    <TableCell className="font-medium">
                      {empName(r)}
                      <span className="block text-xs text-muted-foreground">
                        {(isRTL ? r.role_name_ar : r.role_name) || ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(isRTL ? r.section_name_ar : r.section_name) || "—"}
                    </TableCell>
                    <TableCell>
                      {r.shift_kind
                        ? (isRTL ? r.shift_name_ar : r.shift_name_en) ||
                          ({ day: L("نهارية", "Day"), night: L("ليلية", "Night"), flexible: L("حرة", "Flexible") } as Record<string, string>)[r.shift_kind] || "—"
                        : L("غير مجدولة", "Unassigned")}
                    </TableCell>
                    <TableCell className="text-center" dir="ltr">
                      {fmtTime(r.check_in_time)}
                    </TableCell>
                    <TableCell className="text-center" dir="ltr">
                      {fmtTime(r.break_start_time)}
                    </TableCell>
                    <TableCell className="text-center" dir="ltr">
                      {fmtTime(r.break_end_time)}
                    </TableCell>
                    <TableCell className="text-center" dir="ltr">
                      {fmtTime(r.check_out_time)}
                    </TableCell>
                    <TableCell className="text-center">
                      {statusBadge(r.current_status)}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(r)}
                            title={L("تعديل السجل", "Edit record")}
                            data-testid={`button-edit-attendance-${r.user_id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => notifyMutation.mutate(r.user_id)}
                            disabled={notifyingUserId === r.user_id}
                            title={L(
                              "إرسال إشعار واتس اب",
                              "Send WhatsApp notification",
                            )}
                            data-testid={`button-notify-attendance-${r.user_id}`}
                          >
                            <Send
                              className={`h-4 w-4 ${
                                notifyingUserId === r.user_id
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!editRow}
        onOpenChange={(open) => {
          if (!open) setEditRow(null);
        }}
      >
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {L("تعديل سجل الحضور", "Edit Attendance Record")}
              {editRow ? ` — ${empName(editRow)}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>{L("وقت الحضور", "Check-in")}</Label>
              <Input
                type="time"
                value={form.check_in}
                onChange={(e) =>
                  setForm((f) => ({ ...f, check_in: e.target.value }))
                }
                data-testid="input-edit-check-in"
              />
            </div>
            <div className="space-y-1">
              <Label>{L("وقت الانصراف", "Check-out")}</Label>
              <Input
                type="time"
                value={form.check_out}
                onChange={(e) =>
                  setForm((f) => ({ ...f, check_out: e.target.value }))
                }
                data-testid="input-edit-check-out"
              />
            </div>
            <div className="space-y-1">
              <Label>{L("بداية الاستراحة", "Break Start")}</Label>
              <Input
                type="time"
                value={form.break_start}
                onChange={(e) =>
                  setForm((f) => ({ ...f, break_start: e.target.value }))
                }
                data-testid="input-edit-break-start"
              />
            </div>
            <div className="space-y-1">
              <Label>{L("العودة من الاستراحة", "Break Return")}</Label>
              <Input
                type="time"
                value={form.break_end}
                onChange={(e) =>
                  setForm((f) => ({ ...f, break_end: e.target.value }))
                }
                data-testid="input-edit-break-end"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {L(
              "اترك أي حقل وقت فارغاً لمسح قيمته من السجل.",
              "Leave any time field empty to clear its value.",
            )}
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditRow(null)}
              disabled={editMutation.isPending}
              data-testid="button-cancel-edit-attendance"
            >
              {L("إلغاء", "Cancel")}
            </Button>
            <Button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending}
              data-testid="button-save-edit-attendance"
            >
              {editMutation.isPending
                ? L("جاري الحفظ...", "Saving...")
                : L("حفظ", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <BulkAttendanceDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        count={selectedUserIds.length}
        isRTL={isRTL}
        isSaving={bulkMutation.isPending}
        onSave={(times) => bulkMutation.mutate(times)}
      />
    </Card>
  );
}
