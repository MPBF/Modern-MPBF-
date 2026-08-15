import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  Briefcase,
  CalendarClock,
  CalendarDays,
  Clock,
  Printer,
  BarChart3,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useLanguage } from "../../contexts/LanguageContext";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  ViolationsTab,
  RewardsTab,
  CustodyTab,
  TrainingTab,
  WagesTab,
  TraitsTab,
} from "./EmployeeFileTabs";

interface Props {
  userId: number;
  onBack: () => void;
}

function monthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const first = `${y}-${pad(m + 1)}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const last = `${y}-${pad(m + 1)}-${pad(lastDay)}`;
  return { first, last };
}

export default function EmployeeFile({ userId, onBack }: Props) {
  const { isRTL } = useLanguage();
  const L = (ar: string, en: string) => (isRTL ? ar : en);
  const Back = isRTL ? ArrowRight : ArrowLeft;
  const { first, last } = monthRange();
  const [from, setFrom] = useState(first);
  const [to, setTo] = useState(last);

  const { data: fileRes, isLoading: fileLoading } = useQuery<{ data: any }>({
    queryKey: ["/api/hr/employees", userId, "file"],
  });
  const { data: attRes, isLoading: attLoading } = useQuery<{ data: any }>({
    queryKey: ["/api/hr/attendance/summary", userId, { from, to }],
    enabled: !!from && !!to,
  });
  const { data: ovRes, isLoading: ovLoading } = useQuery<{ data: any }>({
    queryKey: [`/api/hr/employees/${userId}/overview?from=${from}&to=${to}`],
    enabled: !!from && !!to,
  });

  const file = fileRes?.data;
  const att = attRes?.data;
  const ov = ovRes?.data;

  const [printOpen, setPrintOpen] = useState(false);
  const [printSections, setPrintSections] = useState<Record<string, boolean>>({
    stats: true,
    attendance: true,
    violations: false,
    rewards: false,
    requests: false,
    production: false,
    productionDetail: false,
  });
  const [printing, setPrinting] = useState(false);

  const shiftName = (s: string | null) =>
    s === "day" ? L("نهارية", "Day") : s === "night" ? L("ليلية", "Night") : L("غير مجدول", "Unscheduled");

  const fmtTime = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleTimeString(isRTL ? "ar-SA" : "en-GB", {
        timeZone: "Asia/Riyadh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "—";
    }
  };

  const empName = file
    ? (isRTL ? file.display_name_ar : file.display_name) ||
      file.display_name ||
      file.username
    : "";

  const nf = (v: any) => Number(v ?? 0).toLocaleString("en-US");

  const buildPrintHtml = async () => {
    const esc = (s: any) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const sec = printSections;
    const parts: string[] = [];

    parts.push(`
      <div class="header">
        <h1>تقرير الموظف</h1>
        <div class="meta">
          <div><b>الموظف:</b> ${esc(file?.display_name_ar || file?.display_name || file?.username)}</div>
          <div><b>القسم:</b> ${esc(file?.section_name_ar || file?.section_name || "—")} &nbsp; <b>الدور:</b> ${esc(file?.role_name_ar || file?.role_name || "—")}</div>
          <div><b>الفترة:</b> من ${esc(from)} إلى ${esc(to)}</div>
          <div><b>تاريخ الطباعة:</b> ${new Date().toLocaleString("ar-SA")}</div>
        </div>
      </div>`);

    if (sec.stats && ov) {
      parts.push(`
        <h2>الإحصائيات الشاملة</h2>
        <table><tbody>
          <tr><th>حضور</th><td>${nf(att?.totals?.presentDays)}</td><th>غياب</th><td>${nf(att?.totals?.absentDays)}</td><th>ساعات العمل</th><td>${nf(att?.totals?.totalWorkedHours)}</td><th>ساعات إضافية</th><td>${nf(att?.totals?.totalOvertimeHours)}</td></tr>
          <tr><th>المخالفات</th><td>${nf(ov.violations?.count)}</td><th>خصومات المخالفات</th><td>${nf(ov.violations?.deductions)} ر.س</td><th>المكافآت</th><td>${nf(ov.rewards?.count)}</td><th>مبلغ المكافآت</th><td>${nf(ov.rewards?.amount)} ر.س</td></tr>
          <tr><th>إجازات معتمدة</th><td>${nf(ov.requests?.leaves_approved)} (${nf(ov.requests?.leave_days_approved)} يوم)</td><th>استئذانات معتمدة</th><td>${nf(ov.requests?.permissions_approved)}</td><th>دورات تدريبية</th><td>${nf(ov.training?.count)}</td><th>عهد بحوزته</th><td>${nf(ov.custody?.handed)}</td></tr>
          <tr><th>رولات فيلم</th><td>${nf(ov.production?.film_rolls)} (${nf(ov.production?.film_weight_kg)} كجم)</td><th>رولات طباعة</th><td>${nf(ov.production?.printed_rolls)}</td><th>رولات تقطيع</th><td>${nf(ov.production?.cut_rolls)} (${nf(ov.production?.cut_weight_kg)} كجم)</td><th>هدر</th><td>${nf(ov.production?.waste_kg)} كجم</td></tr>
        </tbody></table>`);
    }

    if (sec.attendance && att?.days?.length) {
      parts.push(`
        <h2>سجل الحضور اليومي</h2>
        <table>
          <thead><tr><th>التاريخ</th><th>الوردية</th><th>الحالة</th><th>دخول</th><th>خروج</th><th>تأخير(د)</th><th>مبكر(د)</th><th>عمل(س)</th><th>إضافي(س)</th></tr></thead>
          <tbody>${att.days
            .map(
              (d: any) =>
                `<tr><td>${esc(d.date)}</td><td>${esc(shiftName(d.shift))}</td><td>${esc(d.status)}</td><td>${esc(fmtTime(d.checkIn))}</td><td>${esc(fmtTime(d.checkOut))}</td><td>${nf(d.lateMinutes)}</td><td>${nf(d.earlyLeaveMinutes)}</td><td>${nf(d.workedHours)}</td><td>${nf(d.overtimeHours)}</td></tr>`,
            )
            .join("")}</tbody>
        </table>`);
    }

    const fetchJson = async (url: string) => {
      try {
        const r = await fetch(url, { credentials: "include" });
        if (!r.ok) return null;
        return await r.json();
      } catch {
        return null;
      }
    };
    const inRange = (d: any) => {
      if (!d) return false;
      const t = String(d).slice(0, 10);
      return t >= from && t <= to;
    };

    if (sec.violations) {
      const v = await fetchJson(`/api/work-violations?employee_id=${userId}&from=${from}&to=${to}`);
      const rows = (Array.isArray(v) ? v : v?.data || []).filter(Boolean);
      parts.push(`
        <h2>المخالفات</h2>
        ${
          rows.length
            ? `<table><thead><tr><th>التاريخ</th><th>النوع</th><th>النقاط</th><th>الخصم</th><th>الحالة</th><th>ملاحظة</th></tr></thead><tbody>${rows
                .map(
                  (r: any) =>
                    `<tr><td>${esc(String(r.occurred_at || r.date || "").slice(0, 10))}</td><td>${esc(r.type_name_ar || r.type_name || r.type || "—")}</td><td>${nf(r.points)}</td><td>${nf(r.deduction_amount)} ر.س</td><td>${r.waived ? "معفى" : "سارية"}</td><td>${esc(r.note || r.description || "")}</td></tr>`,
                )
                .join("")}</tbody></table>`
            : `<div class="empty">لا توجد مخالفات في الفترة</div>`
        }`);
    }

    if (sec.rewards) {
      const rw = await fetchJson(`/api/hr/employees/${userId}/rewards`);
      const rows = (rw?.data || []).filter((r: any) => inRange(r.date));
      parts.push(`
        <h2>المكافآت</h2>
        ${
          rows.length
            ? `<table><thead><tr><th>التاريخ</th><th>النوع</th><th>المبلغ</th><th>الحالة</th><th>السبب</th></tr></thead><tbody>${rows
                .map(
                  (r: any) =>
                    `<tr><td>${esc(String(r.date).slice(0, 10))}</td><td>${esc(r.reward_type)}</td><td>${nf(r.amount)} ر.س</td><td>${esc(r.status)}</td><td>${esc(r.reason || "")}</td></tr>`,
                )
                .join("")}</tbody></table>`
            : `<div class="empty">لا توجد مكافآت في الفترة</div>`
        }`);
    }

    if (sec.requests) {
      const rq = await fetchJson(`/api/user-requests`);
      const rows = (Array.isArray(rq) ? rq : rq?.data || []).filter(
        (r: any) => r.user_id === userId && inRange(r.date || r.created_at),
      );
      parts.push(`
        <h2>الطلبات والإجازات</h2>
        ${
          rows.length
            ? `<table><thead><tr><th>التاريخ</th><th>النوع</th><th>العنوان</th><th>الحالة</th><th>الفترة/الوقت</th><th>الرد</th></tr></thead><tbody>${rows
                .map((r: any) => {
                  const period = r.leave_start_date
                    ? `${String(r.leave_start_date).slice(0, 10)} ← ${String(r.leave_end_date || "").slice(0, 10)}`
                    : r.permission_start_time
                      ? `${r.permission_start_time} - ${r.permission_end_time || ""}`
                      : "—";
                  return `<tr><td>${esc(String(r.date || r.created_at || "").slice(0, 10))}</td><td>${esc(r.type)}</td><td>${esc(r.title)}</td><td>${esc(r.status)}</td><td>${esc(period)}</td><td>${esc(r.response || "")}</td></tr>`;
                })
                .join("")}</tbody></table>`
            : `<div class="empty">لا توجد طلبات في الفترة</div>`
        }`);
    }

    if (sec.production && ov) {
      parts.push(`
        <h2>الإنتاج</h2>
        <table><thead><tr><th>المرحلة</th><th>عدد الرولات</th><th>الوزن (كجم)</th></tr></thead>
        <tbody>
          <tr><td>فيلم (إنشاء رولات)</td><td>${nf(ov.production?.film_rolls)}</td><td>${nf(ov.production?.film_weight_kg)}</td></tr>
          <tr><td>طباعة</td><td>${nf(ov.production?.printed_rolls)}</td><td>—</td></tr>
          <tr><td>تقطيع</td><td>${nf(ov.production?.cut_rolls)}</td><td>${nf(ov.production?.cut_weight_kg)}</td></tr>
          <tr><td>الهدر (على رولاته)</td><td>—</td><td>${nf(ov.production?.waste_kg)}</td></tr>
        </tbody></table>`);
    }

    if (sec.productionDetail) {
      const PRINT_LIMIT = 200;
      const pd = await fetchJson(
        `/api/hr/employees/${userId}/production?from=${from}&to=${to}&limit=${PRINT_LIMIT}&offset=0`,
      );
      const records: any[] = pd?.data?.records || [];
      const totalRec: number = pd?.data?.total_records ?? records.length;
      const stageAr = (s: string) =>
        s === "film" ? "فيلم" : s === "printing" ? "طباعة" : s === "cutting" ? "تقطيع" : s;
      const fmtEvt = (iso: string | null) => {
        if (!iso) return "—";
        try {
          return new Date(iso).toLocaleString("ar-SA", {
            timeZone: "Asia/Riyadh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        } catch { return "—"; }
      };
      parts.push(`
        <h2>سجل الإنتاج التفصيلي${totalRec > PRINT_LIMIT ? ` (أول ${PRINT_LIMIT} سجل من ${totalRec})` : ""}</h2>
        ${
          records.length
            ? `<table>
                <thead><tr><th>التاريخ</th><th>المرحلة</th><th>رقم الرول</th><th>أمر الإنتاج</th><th>الطلب</th><th>العميل</th><th>الوزن (كجم)</th></tr></thead>
                <tbody>${records
                  .map(
                    (r: any) =>
                      `<tr>
                        <td>${esc(fmtEvt(r.event_at))}</td>
                        <td>${esc(stageAr(r.stage))}</td>
                        <td>${esc(r.roll_number)}</td>
                        <td>${esc(r.production_order_number)}</td>
                        <td>${esc(r.order_number)}</td>
                        <td>${esc(r.customer_name || "—")}</td>
                        <td>${nf(Number(r.weight_kg || 0).toFixed(1))}</td>
                      </tr>`,
                  )
                  .join("")}</tbody>
              </table>`
            : `<div class="empty">لا يوجد إنتاج في هذه الفترة</div>`
        }`);
    }

    return `<!DOCTYPE html>
      <html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>تقرير الموظف</title>
      <style>
        @page { size: A4; margin: 12mm; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; color: #111; font-size: 12px; }
        .header { border-bottom: 2px solid #333; margin-bottom: 12px; padding-bottom: 8px; }
        .header h1 { margin: 0 0 6px; font-size: 20px; }
        .meta div { margin: 2px 0; }
        h2 { font-size: 15px; margin: 16px 0 6px; border-right: 4px solid #2563eb; padding-right: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th, td { border: 1px solid #bbb; padding: 4px 6px; text-align: right; }
        th { background: #f3f4f6; }
        .empty { color: #777; padding: 6px; }
      </style></head><body>${parts.join("")}
      <script>window.onload = function(){ window.print(); };</script>
      </body></html>`;
  };

  const handlePrint = async () => {
    // فتح النافذة فوراً ضمن نقرة المستخدم لتفادي مانع النوافذ المنبثقة
    const w = window.open("", "_blank");
    if (!w) {
      alert(L("يرجى السماح بالنوافذ المنبثقة للطباعة", "Please allow popups to print"));
      return;
    }
    w.document.write(
      `<html dir="rtl"><body style="font-family:sans-serif;padding:20px">${L("جارٍ تجهيز التقرير...", "Preparing report...")}</body></html>`,
    );
    setPrinting(true);
    try {
      const html = await buildPrintHtml();
      w.document.open();
      w.document.write(html);
      w.document.close();
      setPrintOpen(false);
    } catch {
      w.close();
    } finally {
      setPrinting(false);
    }
  };

  const phase2Tabs: Array<{ key: string; ar: string; en: string }> = [
    { key: "production", ar: "الإنتاج", en: "Production" },
    { key: "violations", ar: "المخالفات", en: "Violations" },
    { key: "rewards", ar: "المكافآت", en: "Rewards" },
    { key: "custody", ar: "العهد", en: "Custody" },
    { key: "training", ar: "التدريب", en: "Training" },
    { key: "wages", ar: "الأجور", en: "Wages" },
    { key: "traits", ar: "السمات", en: "Traits" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-testid="button-back-to-directory"
        >
          <Back className="h-4 w-4 ml-1" />
          {L("رجوع للدليل", "Back to directory")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPrintOpen(true)}
          data-testid="button-print-report"
        >
          <Printer className="h-4 w-4 ml-1" />
          {L("معاينة وطباعة تقرير", "Preview & print report")}
        </Button>
      </div>

      {fileLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !file ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            {L("تعذر تحميل ملف الموظف", "Could not load employee file")}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{empName}</span>
              {file.is_active ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {L("نشط", "Active")}
                </Badge>
              ) : (
                <Badge variant="outline">{L("غير نشط", "Inactive")}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Info icon={<Briefcase className="h-4 w-4" />} label={L("القسم", "Section")} value={(isRTL ? file.section_name_ar : file.section_name) || file.section_name || "—"} />
            <Info icon={<Briefcase className="h-4 w-4" />} label={L("الدور", "Role")} value={(isRTL ? file.role_name_ar : file.role_name) || file.role_name || "—"} />
            <Info icon={<Phone className="h-4 w-4" />} label={L("الهاتف", "Phone")} value={file.phone || "—"} />
            <Info icon={<Mail className="h-4 w-4" />} label={L("البريد", "Email")} value={file.email || "—"} />
            <Info icon={<CalendarDays className="h-4 w-4" />} label={L("وردية الشهر", "This month shift")} value={shiftName(file.current_shift)} />
            <Info icon={<CalendarClock className="h-4 w-4" />} label={L("منذ الإضافة للنظام", "In system since")} value={file.service_days != null ? L(`${file.service_days} يوم`, `${file.service_days} days`) : "—"} />
            <Info icon={<CalendarClock className="h-4 w-4" />} label={L("الإجازة القادمة", "Next leave")} value={file.next_leave_date || L("لا يوجد", "None")} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            {L("الإحصائيات الشاملة", "Overall Statistics")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ovLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !ov ? (
            <div className="py-4 text-center text-gray-500">
              {L("لا توجد بيانات", "No data")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              <Stat label={L("المخالفات", "Violations")} value={ov.violations?.count} tone="red" />
              <Stat label={L("خصومات (ر.س)", "Deductions (SAR)")} value={Number(ov.violations?.deductions || 0).toLocaleString()} tone="red" />
              <Stat label={L("المكافآت", "Rewards")} value={ov.rewards?.count} tone="green" />
              <Stat label={L("مبلغ المكافآت (ر.س)", "Rewards (SAR)")} value={Number(ov.rewards?.amount || 0).toLocaleString()} tone="green" />
              <Stat label={L("إجازات معتمدة", "Approved leaves")} value={`${ov.requests?.leaves_approved ?? 0} (${ov.requests?.leave_days_approved ?? 0} ${L("يوم", "d")})`} tone="indigo" />
              <Stat label={L("استئذانات معتمدة", "Approved permissions")} value={ov.requests?.permissions_approved} tone="indigo" />
              <Stat label={L("طلبات معلقة", "Pending requests")} value={ov.requests?.pending} tone="amber" />
              <Stat label={L("دورات تدريبية", "Trainings")} value={ov.training?.count} />
              <Stat label={L("عهد بحوزته", "Custody items")} value={ov.custody?.handed} />
              <Stat label={L("رولات فيلم", "Film rolls")} value={`${ov.production?.film_rolls ?? 0} (${Number(ov.production?.film_weight_kg || 0).toLocaleString()} ${L("كجم", "kg")})`} />
              <Stat label={L("رولات طباعة", "Printed rolls")} value={ov.production?.printed_rolls} />
              <Stat label={L("رولات تقطيع", "Cut rolls")} value={`${ov.production?.cut_rolls ?? 0} (${Number(ov.production?.cut_weight_kg || 0).toLocaleString()} ${L("كجم", "kg")})`} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {L("ملخص الحضور", "Attendance Summary")}
          </CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-auto" data-testid="input-att-from" />
            <span className="text-gray-400">—</span>
            <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="w-auto" data-testid="input-att-to" />
          </div>
        </CardHeader>
        <CardContent>
          {attLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : !att ? (
            <div className="py-6 text-center text-gray-500">
              {L("لا توجد بيانات", "No data")}
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Stat label={L("أيام مجدولة", "Scheduled")} value={att.totals.scheduledDays} />
                <Stat label={L("حضور", "Present")} value={att.totals.presentDays} tone="green" />
                <Stat label={L("غياب", "Absent")} value={att.totals.absentDays} tone="red" />
                <Stat label={L("غير مكتمل", "Incomplete")} value={att.totals.incompleteDays} tone="amber" />
                <Stat label={L("ساعات العمل", "Worked (h)")} value={att.totals.totalWorkedHours} />
                <Stat label={L("ساعات إضافية", "Overtime (h)")} value={att.totals.totalOvertimeHours} tone="indigo" />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{L("التاريخ", "Date")}</TableHead>
                      <TableHead>{L("الوردية", "Shift")}</TableHead>
                      <TableHead>{L("الحالة", "Status")}</TableHead>
                      <TableHead>{L("دخول", "In")}</TableHead>
                      <TableHead>{L("خروج", "Out")}</TableHead>
                      <TableHead>{L("تأخير(د)", "Late(m)")}</TableHead>
                      <TableHead>{L("مغادرة مبكرة(د)", "Early(m)")}</TableHead>
                      <TableHead>{L("عمل(س)", "Worked(h)")}</TableHead>
                      <TableHead>{L("إضافي(س)", "OT(h)")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {att.days.map((d: any) => (
                      <TableRow key={d.date} data-testid={`row-att-${d.date}`}>
                        <TableCell className="whitespace-nowrap">{d.date}</TableCell>
                        <TableCell>{shiftName(d.shift)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {d.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{fmtTime(d.checkIn)}</TableCell>
                        <TableCell>{fmtTime(d.checkOut)}</TableCell>
                        <TableCell>{d.lateMinutes || 0}</TableCell>
                        <TableCell>{d.earlyLeaveMinutes || 0}</TableCell>
                        <TableCell>{d.workedHours || 0}</TableCell>
                        <TableCell>{d.overtimeHours || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {L("سجلات إضافية", "Additional Records")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={phase2Tabs[0].key} dir={isRTL ? "rtl" : "ltr"}>
            <TabsList className="flex flex-wrap">
              {phase2Tabs.map((t) => (
                <TabsTrigger key={t.key} value={t.key} data-testid={`tab-${t.key}`}>
                  {L(t.ar, t.en)}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="production">
              <ProductionTab userId={userId} isRTL={isRTL} />
            </TabsContent>
            <TabsContent value="violations">
              <ViolationsTab userId={userId} />
            </TabsContent>
            <TabsContent value="rewards">
              <RewardsTab userId={userId} />
            </TabsContent>
            <TabsContent value="custody">
              <CustodyTab userId={userId} />
            </TabsContent>
            <TabsContent value="training">
              <TrainingTab userId={userId} />
            </TabsContent>
            <TabsContent value="wages">
              <WagesTab userId={userId} />
            </TabsContent>
            <TabsContent value="traits">
              <TraitsTab userId={userId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{L("طباعة تقرير الموظف", "Print employee report")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm">{L("الفترة:", "Period:")}</Label>
              <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-auto" />
              <span className="text-gray-400">—</span>
              <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="w-auto" />
            </div>
            <div className="space-y-2">
              {[
                { key: "stats", ar: "الإحصائيات الشاملة", en: "Overall statistics" },
                { key: "attendance", ar: "سجل الحضور اليومي", en: "Daily attendance" },
                { key: "violations", ar: "المخالفات", en: "Violations" },
                { key: "rewards", ar: "المكافآت", en: "Rewards" },
                { key: "requests", ar: "الطلبات والإجازات", en: "Requests & leaves" },
                { key: "production", ar: "الإنتاج (إجماليات)", en: "Production (totals)" },
                { key: "productionDetail", ar: "سجل الإنتاج التفصيلي", en: "Detailed production log" },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`print-${s.key}`}
                    checked={!!printSections[s.key]}
                    onCheckedChange={(c) =>
                      setPrintSections((prev) => ({ ...prev, [s.key]: c === true }))
                    }
                  />
                  <Label htmlFor={`print-${s.key}`} className="text-sm font-normal">
                    {L(s.ar, s.en)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintOpen(false)}>
              {L("إلغاء", "Cancel")}
            </Button>
            <Button
              onClick={handlePrint}
              disabled={printing || !Object.values(printSections).some(Boolean)}
              data-testid="button-print-confirm"
            >
              <Printer className="h-4 w-4 ml-1" />
              {printing ? L("جارٍ التجهيز...", "Preparing...") : L("معاينة وطباعة", "Preview & print")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductionTab({ userId, isRTL }: { userId: number; isRTL: boolean }) {
  const L = (ar: string, en: string) => (isRTL ? ar : en);
  const { first, last } = monthRange();
  const [pFrom, setPFrom] = useState(first);
  const [pTo, setPTo] = useState(last);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const { data: prodRes, isLoading, isError } = useQuery<{ data: any }>({
    queryKey: [
      `/api/hr/employees/${userId}/production?from=${pFrom}&to=${pTo}&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
    ],
    enabled: !!pFrom && !!pTo && pFrom <= pTo,
  });
  const prod = prodRes?.data;
  const totalRecords = Number(prod?.total_records ?? 0);

  const stageLabel = (s: string) =>
    s === "film"
      ? L("فيلم", "Film")
      : s === "printing"
        ? L("طباعة", "Printing")
        : s === "cutting"
          ? L("تقطيع", "Cutting")
          : s;
  const stageClass = (s: string) =>
    s === "film"
      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
      : s === "printing"
        ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(isRTL ? "ar-SA" : "en-GB", {
        timeZone: "Asia/Riyadh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "—";
    }
  };
  const nf = (v: any) => Number(v ?? 0).toLocaleString("en-US");

  return (
    <div className="space-y-4 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Label className="text-sm">{L("الفترة:", "Period:")}</Label>
        <Input
          type="date"
          value={pFrom}
          max={pTo}
          onChange={(e) => {
            setPage(0);
            setPFrom(e.target.value);
          }}
          className="w-auto"
          data-testid="input-prod-from"
        />
        <span className="text-gray-400">—</span>
        <Input
          type="date"
          value={pTo}
          min={pFrom}
          onChange={(e) => {
            setPage(0);
            setPTo(e.target.value);
          }}
          className="w-auto"
          data-testid="input-prod-to"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : isError || !prod ? (
        <div className="py-6 text-center text-gray-500">
          {L("تعذر جلب بيانات الإنتاج", "Could not load production data")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label={L("رولات فيلم", "Film rolls")} value={nf(prod.totals?.film_rolls)} />
            <Stat label={L("وزن الفيلم (كجم)", "Film (kg)")} value={nf(prod.totals?.film_weight_kg?.toFixed?.(1) ?? prod.totals?.film_weight_kg)} />
            <Stat label={L("رولات طباعة", "Printed rolls")} value={nf(prod.totals?.printed_rolls)} tone="indigo" />
            <Stat label={L("وزن الطباعة (كجم)", "Printed (kg)")} value={nf(prod.totals?.printed_weight_kg?.toFixed?.(1) ?? prod.totals?.printed_weight_kg)} tone="indigo" />
            <Stat label={L("رولات تقطيع", "Cut rolls")} value={nf(prod.totals?.cut_rolls)} tone="green" />
            <Stat label={L("وزن التقطيع (كجم)", "Cut (kg)")} value={nf(prod.totals?.cut_weight_kg?.toFixed?.(1) ?? prod.totals?.cut_weight_kg)} tone="green" />
          </div>

          {!prod.records?.length ? (
            <div className="py-6 text-center text-gray-500">
              {L("لا يوجد إنتاج في هذه الفترة", "No production in this period")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{L("التاريخ", "Date")}</TableHead>
                    <TableHead>{L("المرحلة", "Stage")}</TableHead>
                    <TableHead>{L("رقم الرول", "Roll #")}</TableHead>
                    <TableHead>{L("أمر الإنتاج", "Prod. order")}</TableHead>
                    <TableHead>{L("الطلب", "Order")}</TableHead>
                    <TableHead>{L("العميل", "Customer")}</TableHead>
                    <TableHead>{L("الوزن (كجم)", "Weight (kg)")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prod.records.map((r: any, i: number) => (
                    <TableRow key={`${r.stage}-${r.roll_number}-${i}`} data-testid={`row-prod-${i}`}>
                      <TableCell className="whitespace-nowrap">{fmtDate(r.event_at)}</TableCell>
                      <TableCell>
                        <Badge className={`${stageClass(r.stage)} border-0 font-normal`}>
                          {stageLabel(r.stage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{r.roll_number}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.production_order_number}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.order_number}</TableCell>
                      <TableCell>{r.customer_name || "—"}</TableCell>
                      <TableCell>{nf(Number(r.weight_kg || 0).toFixed(1))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalRecords > PAGE_SIZE && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {L(
                      `عرض ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, totalRecords)} من ${totalRecords}`,
                      `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, totalRecords)} of ${totalRecords}`,
                    )}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      data-testid="button-prod-prev"
                    >
                      {L("السابق", "Previous")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(page + 1) * PAGE_SIZE >= totalRecords}
                      onClick={() => setPage((p) => p + 1)}
                      data-testid="button-prod-next"
                    >
                      {L("التالي", "Next")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border p-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "green" | "red" | "amber" | "indigo" }) {
  const toneClass =
    tone === "green"
      ? "text-green-700"
      : tone === "red"
        ? "text-red-700"
        : tone === "amber"
          ? "text-amber-700"
          : tone === "indigo"
            ? "text-indigo-700"
            : "text-gray-900 dark:text-gray-100";
  return (
    <div className="rounded-md border p-3 text-center">
      <div className={`text-xl font-bold ${toneClass}`}>{value ?? 0}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
