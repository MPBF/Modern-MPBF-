import { useState } from "react";

import { Users, CalendarDays, BarChart3, ClipboardList } from "lucide-react";

import PageLayout from "../components/layout/PageLayout";
import EmployeeDirectory from "../components/hr/EmployeeDirectory";
import EmployeeFile from "../components/hr/EmployeeFile";
import ShiftRoster from "../components/hr/ShiftRoster";
import AttendanceReport from "../components/hr/AttendanceReport";
import DailyAttendance from "../components/hr/DailyAttendance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useLanguage } from "../contexts/LanguageContext";

export default function HR() {
  const { isRTL } = useLanguage();
  const L = (ar: string, en: string) => (isRTL ? ar : en);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );

  return (
    <PageLayout
      title={L("الموارد البشرية", "Human Resources")}
      description={L(
        "ملفات الموظفين والحضور وجدولة الورديات",
        "Employee files, attendance and shift scheduling",
      )}
    >
      {selectedEmployeeId !== null ? (
        <EmployeeFile
          userId={selectedEmployeeId}
          onBack={() => setSelectedEmployeeId(null)}
        />
      ) : (
        <Tabs defaultValue="directory" dir={isRTL ? "rtl" : "ltr"}>
          <TabsList className="mb-4">
            <TabsTrigger value="directory" data-testid="tab-hr-directory">
              <Users className="h-4 w-4 ml-1" />
              {L("دليل الموظفين", "Employees")}
            </TabsTrigger>
            <TabsTrigger value="daily" data-testid="tab-hr-daily">
              <ClipboardList className="h-4 w-4 ml-1" />
              {L("الحضور اليومي", "Daily Attendance")}
            </TabsTrigger>
            <TabsTrigger value="roster" data-testid="tab-hr-roster">
              <CalendarDays className="h-4 w-4 ml-1" />
              {L("جدول الورديات", "Shift Roster")}
            </TabsTrigger>
            <TabsTrigger value="report" data-testid="tab-hr-report">
              <BarChart3 className="h-4 w-4 ml-1" />
              {L("تقرير الحضور", "Attendance Report")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory">
            <EmployeeDirectory onSelect={(id) => setSelectedEmployeeId(id)} />
          </TabsContent>
          <TabsContent value="daily">
            <DailyAttendance />
          </TabsContent>
          <TabsContent value="roster">
            <ShiftRoster />
          </TabsContent>
          <TabsContent value="report">
            <AttendanceReport />
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}
