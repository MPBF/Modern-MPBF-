import {
  Film,
  Printer,
  Scissors,
  AlertCircle,
  Focus,
  CalendarClock,
  ClipboardList,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../components/layout/PageLayout";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useAuth } from "../../hooks/use-auth";
import { userHasPermission } from "../../utils/roleUtils";
import OperatorFocusView from "../../components/production/OperatorFocusView";
import TodaysProduction from "../../components/production/TodaysProduction";

import CuttingOperatorDashboard from "./CuttingOperatorDashboard";
import FilmOperatorDashboard from "./FilmOperatorDashboard";
import PrintingOperatorDashboard from "./PrintingOperatorDashboard";
import RollManagementDashboard from "./RollManagementDashboard";

export default function ProductionDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const canViewFilm = useMemo(
    () => userHasPermission(user, "view_film_dashboard"),
    [user],
  );

  const canViewPrinting = useMemo(
    () => userHasPermission(user, "view_printing_dashboard"),
    [user],
  );

  const canViewCutting = useMemo(
    () => userHasPermission(user, "view_cutting_dashboard"),
    [user],
  );

  // Anyone who can reach a production dashboard (or has the dedicated
  // permission) can see Today's Production. The server still enforces the
  // management-vs-self scoping, so this only controls tab visibility.
  const canViewToday = useMemo(
    () =>
      canViewFilm ||
      canViewPrinting ||
      canViewCutting ||
      userHasPermission(user, [
        "view_today_production",
        "view_production",
        "manage_production",
        "manage_production_hall",
      ]),
    [user, canViewFilm, canViewPrinting, canViewCutting],
  );

  // Roll Management is restricted to system administrators and production
  // managers. They can review every roll across all stages and correct a
  // wrongly-entered roll's machine or product, with a full audit trail.
  const canManageRolls = useMemo(
    () =>
      userHasPermission(user, "admin") ||
      userHasPermission(user, "manage_production"),
    [user],
  );

  // A film "line operator" can view the film dashboard but cannot manage
  // production overall. They get the simplified Operator Focus Mode (a film
  // roll-entry UI) instead of the full tabbed view. Printing/cutting-only
  // operators keep their own tabbed dashboards since Focus Mode is film-only.
  const isLineOperator = useMemo(
    () =>
      canViewFilm &&
      !canViewPrinting &&
      !canViewCutting &&
      !userHasPermission(user, "manage_production") &&
      !userHasPermission(user, "manage_production_hall") &&
      !userHasPermission(user, "admin"),
    [user, canViewFilm, canViewPrinting, canViewCutting],
  );

  const availableTabs = useMemo(() => {
    const tabs = [];
    if (canViewFilm) tabs.push("film");
    if (canViewPrinting) tabs.push("printing");
    if (canViewCutting) tabs.push("cutting");
    if (canViewToday) tabs.push("today");
    if (canManageRolls) tabs.push("rolls");
    return tabs;
  }, [canViewFilm, canViewPrinting, canViewCutting, canViewToday, canManageRolls]);

  const [activeTab, setActiveTab] = useState(availableTabs[0] || "film");

  const gridColsClass: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
  };

  // Line operators see a focused, distraction-free roll-entry interface, plus a
  // Today's Production tab scoped (server-side) to their own rolls.
  if (isLineOperator) {
    return (
      <PageLayout
        title={t("production.dashboard.title")}
        description={t("production.dashboard.description")}
      >
        <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
          <Focus className="h-4 w-4" />
          <span>وضع المشغل المبسط</span>
        </div>
        <Tabs defaultValue="focus" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 gap-2 h-auto bg-transparent">
            <TabsTrigger
              value="focus"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md p-4 h-auto"
              data-testid="tab-operator-focus"
            >
              <Focus className="h-5 w-5" />
              <div className="text-right">
                <div className="font-semibold">
                  {t("production.dashboard.filmOperator")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("production.dashboard.createRolls")}
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="today"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md p-4 h-auto"
              data-testid="tab-today-production"
            >
              <CalendarClock className="h-5 w-5" />
              <div className="text-right">
                <div className="font-semibold">
                  {t("production.dashboard.todayProduction")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("production.dashboard.todayProductionDesc")}
                </div>
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="focus" className="mt-0">
            <OperatorFocusView />
          </TabsContent>
          <TabsContent value="today" className="mt-0">
            <TodaysProduction />
          </TabsContent>
        </Tabs>
      </PageLayout>
    );
  }

  if (availableTabs.length === 0) {
    return (
      <PageLayout title={t("production.dashboard.title")}>
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <CardTitle>{t("production.dashboard.noPermissions")}</CardTitle>
                <CardDescription>
                  {t("production.dashboard.noPermissionsDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("production.dashboard.contactAdmin")}
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("production.dashboard.title")}
      description={t("production.dashboard.description")}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList
          className={`grid w-full grid-cols-1 ${gridColsClass[availableTabs.length] || "md:grid-cols-4"} gap-2 h-auto bg-transparent`}
        >
          {canViewFilm && (
            <TabsTrigger
              value="film"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md p-4 h-auto"
              data-testid="tab-film-operator"
            >
              <Film className="h-5 w-5" />
              <div className="text-right">
                <div className="font-semibold">
                  {t("production.dashboard.filmOperator")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("production.dashboard.createRolls")}
                </div>
              </div>
              {activeTab === "film" && (
                <Badge variant="default" className="mr-auto">
                  {t("production.dashboard.active")}
                </Badge>
              )}
            </TabsTrigger>
          )}

          {canViewPrinting && (
            <TabsTrigger
              value="printing"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md p-4 h-auto"
              data-testid="tab-printing-operator"
            >
              <Printer className="h-5 w-5" />
              <div className="text-right">
                <div className="font-semibold">
                  {t("production.dashboard.printingOperator")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("production.dashboard.printRolls")}
                </div>
              </div>
              {activeTab === "printing" && (
                <Badge variant="default" className="mr-auto">
                  {t("production.dashboard.active")}
                </Badge>
              )}
            </TabsTrigger>
          )}

          {canViewCutting && (
            <TabsTrigger
              value="cutting"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md p-4 h-auto"
              data-testid="tab-cutting-operator"
            >
              <Scissors className="h-5 w-5" />
              <div className="text-right">
                <div className="font-semibold">
                  {t("production.dashboard.cuttingOperator")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("production.dashboard.cutRolls")}
                </div>
              </div>
              {activeTab === "cutting" && (
                <Badge variant="default" className="mr-auto">
                  {t("production.dashboard.active")}
                </Badge>
              )}
            </TabsTrigger>
          )}

          {canViewToday && (
            <TabsTrigger
              value="today"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md p-4 h-auto"
              data-testid="tab-today-production"
            >
              <CalendarClock className="h-5 w-5" />
              <div className="text-right">
                <div className="font-semibold">
                  {t("production.dashboard.todayProduction")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("production.dashboard.todayProductionDesc")}
                </div>
              </div>
              {activeTab === "today" && (
                <Badge variant="default" className="mr-auto">
                  {t("production.dashboard.active")}
                </Badge>
              )}
            </TabsTrigger>
          )}

          {canManageRolls && (
            <TabsTrigger
              value="rolls"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md p-4 h-auto"
              data-testid="tab-roll-management"
            >
              <ClipboardList className="h-5 w-5" />
              <div className="text-right">
                <div className="font-semibold">{t("rollMgmt.tabTitle")}</div>
                <div className="text-xs text-muted-foreground">
                  {t("rollMgmt.tabDesc")}
                </div>
              </div>
              {activeTab === "rolls" && (
                <Badge variant="default" className="mr-auto">
                  {t("production.dashboard.active")}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {canViewFilm && (
          <TabsContent value="film" className="mt-0">
            <FilmOperatorDashboard hideLayout={true} />
          </TabsContent>
        )}

        {canViewPrinting && (
          <TabsContent value="printing" className="mt-0">
            <PrintingOperatorDashboard hideLayout={true} />
          </TabsContent>
        )}

        {canViewCutting && (
          <TabsContent value="cutting" className="mt-0">
            <CuttingOperatorDashboard hideLayout={true} />
          </TabsContent>
        )}

        {canViewToday && (
          <TabsContent value="today" className="mt-0">
            <TodaysProduction />
          </TabsContent>
        )}

        {canManageRolls && (
          <TabsContent value="rolls" className="mt-0">
            <RollManagementDashboard hideLayout={true} />
          </TabsContent>
        )}
      </Tabs>
    </PageLayout>
  );
}
