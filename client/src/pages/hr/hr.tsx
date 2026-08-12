import { useState } from "react";

import { Users, CalendarDays, BarChart3, ClipboardList, ShieldAlert, Inbox } from "lucide-react";

import PageLayout from "../../components/layout/PageLayout";
import EmployeeDirectory from "../../components/hr/EmployeeDirectory";
import EmployeeFile from "../../components/hr/EmployeeFile";
import ShiftRoster from "../../components/hr/ShiftRoster";
import AttendanceReport from "../../components/hr/AttendanceReport";
import DailyAttendance from "../../components/hr/DailyAttendance";
import WorkViolationsPage from "./work-violations";
import RequestsManagement from "./requests-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../hooks/use-auth";
import { userHasPermission } from "../../utils/roleUtils";

export default function HR() {
  const { isRTL } = useLanguage();
  const L = (ar: string, en: string) => (isRTL ? ar : en);
  const { user } = useAuth();
  // تبويب الطلبات يظهر فقط لمن يملك صلاحية مراجعة طلبات الموظفين
  const canManageRequests = userHasPermission(user, ["manage_hr", "edit_hr"]);
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
            <TabsTrigger value="violations" data-testid="tab-hr-violations">
              <ShieldAlert className="h-4 w-4 ml-1" />
              {L("مخالفات العمل", "Work Violations")}
            </TabsTrigger>
            {canManageRequests && (
              <TabsTrigger value="requests" data-testid="tab-hr-requests">
                <Inbox className="h-4 w-4 ml-1" />
                {L("طلبات", "Requests")}
              </TabsTrigger>
            )}
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
          <TabsContent value="violations">
            <WorkViolationsPage />
          </TabsContent>
          {canManageRequests && (
            <TabsContent value="requests">
              <RequestsManagement />
            </TabsContent>
          )}
        </Tabs>
      )}
    </PageLayout>
  );
}
