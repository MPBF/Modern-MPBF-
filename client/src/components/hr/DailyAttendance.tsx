import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useLanguage } from "../../contexts/LanguageContext";

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

export default function DailyAttendance() {
  const { isRTL } = useLanguage();
  const L = (ar: string, en: string) => (isRTL ? ar : en);
  const [date, setDate] = useState(todayStr());
  const isToday = date === todayStr();

  const { data, isLoading, isFetching, refetch } = useQuery<{
    data: DailyRow[];
    date: string;
  }>({
    queryKey: ["/api/hr/attendance/daily", { date }],
    enabled: !!date,
    refetchInterval: isToday ? 60_000 : false,
  });

  const rows = data?.data ?? [];

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
            <Input
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
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
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {L("لا توجد بيانات لهذا اليوم", "No data for this day")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? "text-right" : "text-left"}>
                    {L("الموظف", "Employee")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-right" : "text-left"}>
                    {L("القسم", "Section")}
                  </TableHead>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.user_id}
                    data-testid={`row-daily-attendance-${r.user_id}`}
                  >
                    <TableCell className="font-medium">
                      {empName(r)}
                      <span className="block text-xs text-muted-foreground">
                        {(isRTL ? r.role_name_ar : r.role_name) || ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(isRTL ? r.section_name_ar : r.section_name) || "—"}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
