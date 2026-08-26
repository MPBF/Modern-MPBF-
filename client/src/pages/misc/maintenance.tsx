import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../components/layout/PageLayout";
import ComponentCatalogTab from "../../components/maintenance/ComponentCatalogTab";
import ConsumablePartsTab from "../../components/maintenance/ConsumablePartsTab";
import MaintenanceActionsTab from "../../components/maintenance/MaintenanceActionsTab";
import { MAINTENANCE_GROUPS } from "../../components/maintenance/maintenanceGroups";
import MaintenanceReportsTab from "../../components/maintenance/MaintenanceReportsTab";
import MaintenanceRequestsTab from "../../components/maintenance/MaintenanceRequestsTab";
import MaintenanceScheduleTab from "../../components/maintenance/MaintenanceScheduleTab";
import MaintenanceSummaryCards from "../../components/maintenance/MaintenanceSummaryCards";
import OperatorNegligenceTab from "../../components/maintenance/OperatorNegligenceTab";
import PreventiveActionsTab from "../../components/maintenance/PreventiveActionsTab";
import SparePartsTab from "../../components/maintenance/SparePartsTab";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useAuth } from "../../hooks/use-auth";
import { userHasPermission } from "../../utils/roleUtils";

import MaintenanceEngineer from "./maintenance-engineer";

export default function Maintenance() {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Filter groups/sub-tabs down to what this user is allowed to see.
  const visibleGroups = MAINTENANCE_GROUPS.map((g) => ({
    ...g,
    subTabs: g.subTabs.filter((s) => userHasPermission(user, s.permissions)),
  })).filter((g) => g.subTabs.length > 0);
  const groupById = Object.fromEntries(visibleGroups.map((g) => [g.id, g]));
  const firstSubOf = (groupId: string) => groupById[groupId]?.subTabs[0]?.id;

  const [currentGroup, setCurrentGroup] = useState<string>(
    () => visibleGroups[0]?.id || "corrective",
  );
  const [correctiveSub, setCorrectiveSub] = useState<string>(
    () => firstSubOf("corrective") || "requests",
  );
  const [inventorySub, setInventorySub] = useState<string>(
    () => firstSubOf("inventory") || "spare-parts",
  );
  const [preventiveSub, setPreventiveSub] = useState<string>(
    () => firstSubOf("preventive") || "preventive-actions",
  );

  // Auth/permissions can resolve after the first render, which changes
  // `visibleGroups`. Reconcile the selected group/sub-tabs so a user never
  // lands on a group or sub-tab they are not allowed to see.
  const visibleGroupsKey = visibleGroups
    .map((g) => `${g.id}:${g.subTabs.map((s) => s.id).join(",")}`)
    .join("|");
  useEffect(() => {
    if (visibleGroups.length === 0) return;
    if (!groupById[currentGroup]) {
      setCurrentGroup(visibleGroups[0].id);
    }
    const correctiveSubs = groupById.corrective?.subTabs;
    if (correctiveSubs && !correctiveSubs.some((s) => s.id === correctiveSub)) {
      setCorrectiveSub(correctiveSubs[0].id);
    }
    const inventorySubs = groupById.inventory?.subTabs;
    if (inventorySubs && !inventorySubs.some((s) => s.id === inventorySub)) {
      setInventorySub(inventorySubs[0].id);
    }
    const preventiveSubs = groupById.preventive?.subTabs;
    if (preventiveSubs && !preventiveSubs.some((s) => s.id === preventiveSub)) {
      setPreventiveSub(preventiveSubs[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleGroupsKey]);

  const { data: spareParts } = useQuery({
    queryKey: ["/api/spare-parts"],
  });

  return (
    <PageLayout
      title={t("maintenance.title")}
      description={t("maintenance.maintenanceType")}
    >
      <MaintenanceSummaryCards />

      {visibleGroups.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("maintenance.noPermission")}
          </CardContent>
        </Card>
      )}

      {visibleGroups.length > 0 && (
        <Tabs
          value={currentGroup}
          onValueChange={setCurrentGroup}
          className="w-full"
        >
          <TabsList className="flex flex-wrap gap-2 h-auto p-1.5 bg-muted/60 rounded-xl mb-6">
            {visibleGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <TabsTrigger
                  key={group.id}
                  value={group.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                >
                  <GroupIcon className="h-4 w-4" />
                  {t(group.labelKey)}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* ═══ Group: Corrective (requests / actions / reports / negligence) ═══ */}
          {groupById.corrective && (
            <TabsContent value="corrective" className="mt-0">
              <Tabs
                value={correctiveSub}
                onValueChange={setCorrectiveSub}
                className="w-full"
              >
                <TabsList className="flex flex-wrap gap-1 h-auto mb-4 bg-transparent p-0 border-b w-full justify-start rounded-none">
                  {groupById.corrective.subTabs.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <TabsTrigger
                        key={sub.id}
                        value={sub.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                      >
                        <SubIcon className="h-4 w-4" />
                        {t(sub.labelKey)}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="requests">
                  <MaintenanceRequestsTab />
                </TabsContent>

                <TabsContent value="actions">
                  <MaintenanceActionsTab />
                </TabsContent>

                <TabsContent value="reports">
                  <MaintenanceReportsTab />
                </TabsContent>

                <TabsContent value="negligence">
                  <OperatorNegligenceTab />
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* ═══ Group: Inventory & Parts (spare / consumable / catalog) ═══ */}
          {groupById.inventory && (
            <TabsContent value="inventory" className="mt-0">
              <Tabs
                value={inventorySub}
                onValueChange={setInventorySub}
                className="w-full"
              >
                <TabsList className="flex flex-wrap gap-1 h-auto mb-4 bg-transparent p-0 border-b w-full justify-start rounded-none">
                  {groupById.inventory.subTabs.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <TabsTrigger
                        key={sub.id}
                        value={sub.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                      >
                        <SubIcon className="h-4 w-4" />
                        {t(sub.labelKey)}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="spare-parts">
                  <SparePartsTab
                    spareParts={Array.isArray(spareParts) ? spareParts : []}
                    isLoading={false}
                  />
                </TabsContent>

                <TabsContent value="consumable-parts">
                  <ConsumablePartsTab />
                </TabsContent>

                <TabsContent value="component-catalog">
                  <ComponentCatalogTab />
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* ═══ Group: Preventive ═══ */}
          {groupById.preventive && (
            <TabsContent value="preventive" className="mt-0">
              <Tabs value={preventiveSub} onValueChange={setPreventiveSub}>
                <TabsList className="flex h-auto w-full justify-start gap-1 rounded-none border-b bg-transparent p-0">
                  {groupById.preventive.subTabs.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <TabsTrigger
                        key={sub.id}
                        value={sub.id}
                        className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                      >
                        <SubIcon className="h-4 w-4" />
                        {t(sub.labelKey)}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                <TabsContent value="preventive-actions" className="pt-4">
                  <PreventiveActionsTab />
                </TabsContent>
                <TabsContent value="maintenance-schedules" className="pt-4">
                  <MaintenanceScheduleTab />
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* ═══ Group: Smart Engineer ═══ */}
          {groupById["smart-engineer"] && (
            <TabsContent value="smart-engineer" className="mt-0">
              <MaintenanceEngineer embedded />
            </TabsContent>
          )}
        </Tabs>
      )}
    </PageLayout>
  );
}
