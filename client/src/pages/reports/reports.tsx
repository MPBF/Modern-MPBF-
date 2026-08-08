import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  Users,
  Settings,
  Package,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Zap,
  Clock,
  Target,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  InteractiveBarChart,
  InteractiveLineChart,
  InteractivePieChart,
  InteractiveAreaChart,
  ComboChart,
  MetricsGrid,
} from "../../components/charts";
import PageLayout from "../../components/layout/PageLayout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Card,
  CardContent,
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
import type { PermissionKey } from "../../../../shared/permissions";
import {
  formatNumber,
  formatPercentage,
  formatNumberWithCommas,
} from "../../lib/formatNumber";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";

const reportsTabPermissions: { tab: string; permissions: PermissionKey[] }[] = [
  {
    tab: "production",
    permissions: ["view_production_reports", "view_reports"],
  },
  {
    tab: "quality",
    permissions: [
      "view_quality_control_reports",
      "view_quality",
      "view_reports",
    ],
  },
  {
    tab: "maintenance",
    permissions: [
      "view_maintenance_stats_reports",
      "view_maintenance",
      "view_reports",
    ],
  },
  { tab: "hr", permissions: ["view_hr_reports", "view_hr", "view_reports"] },
  { tab: "financial", permissions: ["view_financial_reports", "view_reports"] },
];

export default function Reports() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [reportType, setReportType] = useState(
    reportsTabPermissions.find((tp) => userHasPermission(user, tp.permissions))
      ?.tab || "production",
  );

  // Get date range for API calls
  const getDateRange = () => {
    const now = new Date();
    let from: string, to: string;

    switch (selectedPeriod) {
      case "week":
        from = format(
          new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd",
        );
        to = format(now, "yyyy-MM-dd");
        break;
      case "quarter":
        from = format(
          new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
          "yyyy-MM-dd",
        );
        to = format(now, "yyyy-MM-dd");
        break;
      case "year":
        from = format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd");
        to = format(now, "yyyy-MM-dd");
        break;
      case "custom":
        from = dateRange.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : format(
              new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              "yyyy-MM-dd",
            );
        to = dateRange.to
          ? format(dateRange.to, "yyyy-MM-dd")
          : format(now, "yyyy-MM-dd");
        break;
      default: // month
        from = format(
          new Date(now.getFullYear(), now.getMonth(), 1),
          "yyyy-MM-dd",
        );
        to = format(now, "yyyy-MM-dd");
    }

    return { from, to };
  };

  const { from, to } = getDateRange();

  // Fetch comprehensive dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/reports/dashboard", from, to],
    queryFn: () =>
      fetch(`/api/reports/dashboard?date_from=${from}&date_to=${to}`).then(
        (res) => res.json(),
      ),
  });

  // Fetch order reports
  const { data: orderReports, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["/api/reports/orders", from, to],
    queryFn: () =>
      fetch(`/api/reports/orders?date_from=${from}&date_to=${to}`).then((res) =>
        res.json(),
      ),
  });

  // Fetch advanced metrics
  const { data: advancedMetrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["/api/reports/advanced-metrics", from, to],
    queryFn: () =>
      fetch(
        `/api/reports/advanced-metrics?date_from=${from}&date_to=${to}`,
      ).then((res) => res.json()),
  });

  // Fetch HR reports
  const { data: hrReports, isLoading: isHRLoading } = useQuery({
    queryKey: ["/api/reports/hr", from, to],
    queryFn: () =>
      fetch(`/api/reports/hr?date_from=${from}&date_to=${to}`).then((res) =>
        res.json(),
      ),
  });

  // Fetch maintenance reports
  const { data: maintenanceReports, isLoading: isMaintenanceLoading } =
    useQuery({
      queryKey: ["/api/reports/maintenance", from, to],
      queryFn: () =>
        fetch(`/api/reports/maintenance?date_from=${from}&date_to=${to}`).then(
          (res) => res.json(),
        ),
    });

  const isLoading =
    isDashboardLoading ||
    isOrdersLoading ||
    isMetricsLoading ||
    isHRLoading ||
    isMaintenanceLoading;

  const reportTypes = [
    {
      value: "production",
      labelKey: "reports.types.production",
      icon: <Package className="w-4 h-4" />,
    },
    {
      value: "quality",
      labelKey: "reports.types.quality",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      value: "maintenance",
      labelKey: "reports.types.maintenance",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      value: "hr",
      labelKey: "reports.types.hr",
      icon: <Users className="w-4 h-4" />,
    },
    {
      value: "financial",
      labelKey: "reports.types.financial",
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const exportReport = async (format: string) => {
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_type: reportType,
          format,
          date_from: from,
          date_to: to,
          filters: { period: selectedPeriod },
        }),
      });

      if (response.ok) {
        if (format === "json") {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data.data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${reportType}-${from}-${to}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const blob = await response.blob();
          const ext = format === "excel" ? "xlsx" : format;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${reportType}-${from}-${to}.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  // Format chart data helpers
  const safeToFixed = (value: any, decimals: number = 1): string => {
    const numValue =
      typeof value === "number" && !isNaN(value)
        ? value
        : typeof value === "string"
          ? parseFloat(value)
          : 0;
    const safeValue = isNaN(numValue) ? 0 : numValue;
    return safeValue.toFixed(decimals);
  };

  const formatChartValue = (
    value: any,
    type: "number" | "percentage" | "currency" = "number",
  ) => {
    // Ensure value is a valid number
    const numValue =
      typeof value === "number" && !isNaN(value)
        ? value
        : typeof value === "string"
          ? parseFloat(value)
          : 0;

    const safeValue = isNaN(numValue) ? 0 : numValue;

    switch (type) {
      case "percentage":
        return `${safeValue.toFixed(1)}%`;
      case "currency":
        return `${formatNumberWithCommas(safeValue)} ${t("common.sar")}`;
      default:
        return formatNumberWithCommas(safeValue);
    }
  };

  return (
    <PageLayout
      title={t("reports.title")}
      description={t("reports.description")}
    >
      {/* Report Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t("reports.reportOptions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t("reports.reportType")}
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value || "unknown"}
                    >
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {t(type.labelKey)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t("reports.timePeriod")}
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">
                    {t("reports.periods.week")}
                  </SelectItem>
                  <SelectItem value="month">
                    {t("reports.periods.month")}
                  </SelectItem>
                  <SelectItem value="quarter">
                    {t("reports.periods.quarter")}
                  </SelectItem>
                  <SelectItem value="year">
                    {t("reports.periods.year")}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t("reports.periods.custom")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t("reports.fromDate")}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from
                      ? format(dateRange.from, "PPP", { locale: ar })
                      : t("reports.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) =>
                      setDateRange({ ...dateRange, from: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={() => exportReport("excel")} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                {t("reports.exportExcel")}
              </Button>
              <Button variant="outline" onClick={() => exportReport("pdf")}>
                PDF
              </Button>
              <Button variant="outline" onClick={() => exportReport("csv")}>
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          {reportTypes.map((type) => {
            const tabPerm = reportsTabPermissions.find(
              (t) => t.tab === type.value,
            );
            if (tabPerm && !userHasPermission(user, tabPerm.permissions))
              return null;
            return (
              <TabsTrigger
                key={type.value}
                value={type.value}
                className="text-xs"
              >
                <div className="flex items-center gap-1">
                  {type.icon}
                  <span className="hidden sm:inline">{t(type.labelKey)}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Production Reports */}
        <TabsContent value="production">
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-production">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("reports.loading")}</p>
            </div>
          ) : (
            <>
              {/* Production KPI Metrics */}
              {dashboardData?.success && (
                <MetricsGrid
                  columns={4}
                  className="mb-6"
                  metrics={[
                    {
                      title: t("reports.production.totalProduction"),
                      value: formatNumberWithCommas(
                        dashboardData.data.realTime?.currentStats
                          ?.daily_weight || 0,
                      ),
                      description: t("reports.production.kilograms"),
                      icon: <Package className="w-5 h-5" />,
                      trend: {
                        value: 5.2,
                        isPositive: true,
                        label: t("reports.production.fromLastWeek"),
                      },
                    },
                    {
                      title: t("reports.production.efficiency"),
                      value: `${safeToFixed(dashboardData.data.realTime?.currentStats?.avg_efficiency || 90)}%`,
                      description: t("reports.production.avgEfficiency"),
                      icon: <Target className="w-5 h-5" />,
                      trend: {
                        value: 3.1,
                        isPositive: true,
                        label: t("reports.production.improved"),
                      },
                    },
                    {
                      title: t("reports.production.activeOrders"),
                      value: formatNumber(
                        dashboardData.data.realTime?.currentStats
                          ?.active_orders || 0,
                      ),
                      description: t("reports.production.ordersInProgress"),
                      icon: <Activity className="w-5 h-5" />,
                      trend: {
                        value: 0,
                        isPositive: true,
                        label: t("reports.production.stable"),
                      },
                    },
                    {
                      title: t("reports.production.wasteRate"),
                      value: `${safeToFixed(((dashboardData.data.realTime?.currentStats?.current_waste || 0) / Math.max(dashboardData.data.realTime?.currentStats?.daily_weight || 1, 1)) * 100)}%`,
                      description: t("reports.production.wastePercentage"),
                      icon: <AlertTriangle className="w-5 h-5" />,
                      trend: {
                        value: 1.8,
                        isPositive: false,
                        label: t("reports.production.needsImprovement"),
                      },
                    },
                  ]}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Machine Utilization Chart */}
                {dashboardData?.success &&
                  dashboardData.data.machineUtilization && (
                    <InteractiveBarChart
                      data={dashboardData.data.machineUtilization}
                      title={t("reports.production.machineProductivity")}
                      description={t(
                        "reports.production.totalProductionPerMachine",
                      )}
                      xAxisKey="machine_name"
                      yAxisKey="total_weight"
                      barColor="#3b82f6"
                      height={350}
                      formatValue={(value) =>
                        formatChartValue(value, "number") + " " + t("common.kg")
                      }
                      className="h-full"
                    />
                  )}

                {/* Production Efficiency Trends */}
                {dashboardData?.success &&
                  dashboardData.data.productionEfficiency?.trends && (
                    <InteractiveLineChart
                      data={dashboardData.data.productionEfficiency.trends}
                      title={t("reports.production.dailyEfficiencyTrends")}
                      description={t(
                        "reports.production.trackEfficiencyOverDays",
                      )}
                      xAxisKey="date"
                      lines={[
                        {
                          key: "daily_efficiency",
                          name: t("reports.production.dailyEfficiency"),
                          color: "#10b981",
                        },
                      ]}
                      height={350}
                      formatValue={(value) =>
                        formatChartValue(value, "percentage")
                      }
                      className="h-full"
                    />
                  )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Machine Status Distribution */}
                {dashboardData?.success &&
                  dashboardData.data.realTime?.machineStatus && (
                    <InteractivePieChart
                      data={dashboardData.data.realTime.machineStatus.reduce(
                        (acc: any[], machine: any) => {
                          const existing = acc.find(
                            (item) => item.status === machine.status,
                          );
                          if (existing) {
                            existing.count += 1;
                          } else {
                            acc.push({
                              status:
                                machine.status === "active"
                                  ? t("reports.production.statuses.active")
                                  : machine.status === "idle"
                                    ? t("reports.production.statuses.idle")
                                    : t(
                                        "reports.production.statuses.maintenance",
                                      ),
                              count: 1,
                            });
                          }
                          return acc;
                        },
                        [],
                      )}
                      title={t("reports.production.machineStatus")}
                      description={t("reports.production.machineStatusDist")}
                      nameKey="status"
                      valueKey="count"
                      height={300}
                      colors={["#10b981", "#f59e0b", "#ef4444"]}
                    />
                  )}

                {/* Production Queue Status */}
                {dashboardData?.success &&
                  dashboardData.data.realTime?.queueStats && (
                    <InteractiveBarChart
                      data={[
                        {
                          stage: t("reports.production.stages.extrusion"),
                          count:
                            dashboardData.data.realTime.queueStats.film_queue,
                        },
                        {
                          stage: t("reports.production.stages.printing"),
                          count:
                            dashboardData.data.realTime.queueStats
                              .printing_queue,
                        },
                        {
                          stage: t("reports.production.stages.cutting"),
                          count:
                            dashboardData.data.realTime.queueStats
                              .cutting_queue,
                        },
                        {
                          stage: t("reports.production.stages.pending"),
                          count:
                            dashboardData.data.realTime.queueStats
                              .pending_orders,
                        },
                      ]}
                      title={t("reports.production.productionQueues")}
                      description={t("reports.production.ordersPerStage")}
                      xAxisKey="stage"
                      yAxisKey="count"
                      barColor="#8b5cf6"
                      height={300}
                      formatValue={(value) => formatNumber(value)}
                    />
                  )}

                {/* Advanced Metrics - OEE */}
                {advancedMetrics?.success &&
                  advancedMetrics.data.oeeMetrics &&
                  advancedMetrics.data.oeeMetrics.length > 0 && (
                    <ComboChart
                      data={advancedMetrics.data.oeeMetrics}
                      title={t("reports.production.oeeTitle")}
                      description={t("reports.production.oeeDescription")}
                      xAxisKey="machine_name"
                      elements={[
                        {
                          type: "bar",
                          key: "availability",
                          name: t("reports.production.availability"),
                          color: "#3b82f6",
                          yAxisId: "left",
                        },
                        {
                          type: "bar",
                          key: "performance",
                          name: t("reports.production.performance"),
                          color: "#10b981",
                          yAxisId: "left",
                        },
                        {
                          type: "line",
                          key: "oee",
                          name: t("reports.production.totalOEE"),
                          color: "#f59e0b",
                          yAxisId: "right",
                        },
                      ]}
                      height={300}
                      formatValue={(value) =>
                        formatChartValue(value, "percentage")
                      }
                      leftAxisLabel={t("reports.production.percentageLabel")}
                      rightAxisLabel="OEE %"
                    />
                  )}
              </div>

              {/* Production Alerts */}
              {dashboardData?.success &&
                dashboardData.data.alerts &&
                dashboardData.data.alerts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        {t("reports.production.alerts")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardData.data.alerts
                          .slice(0, 5)
                          .map((alert: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    alert.priority === "critical"
                                      ? "bg-red-500"
                                      : alert.priority === "high"
                                        ? "bg-amber-500"
                                        : "bg-blue-500"
                                  }`}
                                ></div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {alert.title}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {alert.message}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  alert.priority === "critical"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {alert.priority === "critical"
                                  ? t("reports.priorities.critical")
                                  : alert.priority === "high"
                                    ? t("reports.priorities.high")
                                    : t("reports.priorities.medium")}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>

        {/* Quality Reports - Advanced Metrics */}
        <TabsContent value="quality">
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-quality">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("reports.loading")}</p>
            </div>
          ) : (
            <>
              {/* Quality KPI Metrics */}
              {advancedMetrics?.success && (
                <MetricsGrid
                  columns={4}
                  className="mb-6"
                  metrics={[
                    {
                      title: t("reports.quality.qualityRate"),
                      value: `${safeToFixed(advancedMetrics.data.qualityMetrics?.quality_rate || 95)}%`,
                      description: t("reports.quality.goodProductionRate"),
                      icon: <CheckCircle2 className="w-5 h-5" />,
                      trend: {
                        value: 2.1,
                        isPositive: true,
                        label: t("reports.production.improved"),
                      },
                    },
                    {
                      title: t("reports.quality.totalRolls"),
                      value: formatNumber(
                        advancedMetrics.data.qualityMetrics?.total_rolls || 0,
                      ),
                      description: t("reports.quality.inspectedRolls"),
                      icon: <Package className="w-5 h-5" />,
                      trend: {
                        value: 15.3,
                        isPositive: true,
                        label: t("reports.quality.increase"),
                      },
                    },
                    {
                      title: t("reports.quality.defectiveRolls"),
                      value: formatNumber(
                        advancedMetrics.data.qualityMetrics?.defective_rolls ||
                          0,
                      ),
                      description: t("reports.quality.needsRework"),
                      icon: <AlertTriangle className="w-5 h-5" />,
                      trend: {
                        value: 3.2,
                        isPositive: false,
                        label: t("reports.quality.decrease"),
                      },
                    },
                    {
                      title: t("reports.quality.avgWaste"),
                      value: `${safeToFixed(advancedMetrics.data.qualityMetrics?.avg_waste_percentage || 0)}%`,
                      description: t("reports.production.wastePercentage"),
                      icon: <Activity className="w-5 h-5" />,
                      trend: {
                        value: 1.5,
                        isPositive: false,
                        label: t("reports.production.needsImprovement"),
                      },
                    },
                  ]}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Quality Rate vs Defect Rate */}
                {advancedMetrics?.success && (
                  <ComboChart
                    data={[
                      {
                        period: t("reports.periods.month"),
                        quality_rate:
                          advancedMetrics.data.qualityMetrics?.quality_rate ||
                          95,
                        defect_rate:
                          100 -
                          (advancedMetrics.data.qualityMetrics?.quality_rate ||
                            95),
                        rework_rate:
                          advancedMetrics.data.qualityMetrics?.rework_rate || 2,
                      },
                    ]}
                    title={t("reports.quality.comprehensiveIndicators")}
                    description={t("reports.quality.qualityVsDefects")}
                    xAxisKey="period"
                    elements={[
                      {
                        type: "bar",
                        key: "quality_rate",
                        name: t("reports.quality.qualityRate"),
                        color: "#10b981",
                      },
                      {
                        type: "bar",
                        key: "defect_rate",
                        name: t("reports.quality.defectRate"),
                        color: "#ef4444",
                      },
                      {
                        type: "line",
                        key: "rework_rate",
                        name: t("reports.quality.reworkRate"),
                        color: "#f59e0b",
                      },
                    ]}
                    height={350}
                    formatValue={(value) =>
                      formatChartValue(value, "percentage")
                    }
                    leftAxisLabel={t("reports.production.percentageLabel")}
                  />
                )}

                {/* Cycle Time Analysis */}
                {advancedMetrics?.success &&
                  advancedMetrics.data.cycleTimeStats && (
                    <InteractiveBarChart
                      data={[
                        {
                          stage: t("reports.quality.extrusionToPrinting"),
                          time: advancedMetrics.data.cycleTimeStats
                            .avg_film_to_printing,
                        },
                        {
                          stage: t("reports.quality.printingToCutting"),
                          time: advancedMetrics.data.cycleTimeStats
                            .avg_printing_to_cutting,
                        },
                        {
                          stage: t("reports.quality.totalCycle"),
                          time: advancedMetrics.data.cycleTimeStats
                            .avg_total_cycle_time,
                        },
                      ]}
                      title={t("reports.quality.cycleTimeAnalysis")}
                      description={t("reports.quality.avgTimePerStage")}
                      xAxisKey="stage"
                      yAxisKey="time"
                      barColor="#6366f1"
                      height={350}
                      formatValue={(value) =>
                        `${safeToFixed(value)} ${t("common.hour")}`
                      }
                    />
                  )}
              </div>

              {/* Machine OEE Performance */}
              {advancedMetrics?.success &&
                advancedMetrics.data.oeeMetrics &&
                advancedMetrics.data.oeeMetrics.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>
                        {t("reports.quality.machineOEEPerformance")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InteractiveBarChart
                        data={advancedMetrics.data.oeeMetrics}
                        title=""
                        xAxisKey="machine_name"
                        yAxisKey="oee"
                        barColor="#10b981"
                        height={300}
                        formatValue={(value) =>
                          formatChartValue(value, "percentage")
                        }
                      />
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>

        {/* Maintenance Reports */}
        <TabsContent value="maintenance">
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-maintenance">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("reports.loading")}</p>
            </div>
          ) : (
            <>
              {/* Maintenance KPI Metrics */}
              {maintenanceReports?.success && (
                <MetricsGrid
                  columns={4}
                  className="mb-6"
                  metrics={[
                    {
                      title: t("reports.maintenance.requests"),
                      value: formatNumber(
                        maintenanceReports.data.maintenanceStats
                          ?.total_requests || 0,
                      ),
                      description: t("reports.maintenance.totalRequests"),
                      icon: <Settings className="w-5 h-5" />,
                      trend: {
                        value: 8.3,
                        isPositive: false,
                        label: t("reports.quality.decrease"),
                      },
                    },
                    {
                      title: t("reports.maintenance.completedRequests"),
                      value: formatNumber(
                        maintenanceReports.data.maintenanceStats
                          ?.completed_requests || 0,
                      ),
                      description: t("reports.maintenance.completed"),
                      icon: <CheckCircle2 className="w-5 h-5" />,
                      trend: {
                        value: 12.5,
                        isPositive: true,
                        label: t("reports.production.improved"),
                      },
                    },
                    {
                      title: t("reports.maintenance.avgRepairTime"),
                      value: `${safeToFixed(maintenanceReports.data.maintenanceStats?.avg_resolution_time || 0)}`,
                      description: t("common.hour"),
                      icon: <Clock className="w-5 h-5" />,
                      trend: {
                        value: 5.7,
                        isPositive: false,
                        label: t("reports.maintenance.reducedTime"),
                      },
                    },
                    {
                      title: t("reports.maintenance.criticalRequests"),
                      value: formatNumber(
                        maintenanceReports.data.maintenanceStats
                          ?.critical_requests || 0,
                      ),
                      description: t("reports.maintenance.needsAttention"),
                      icon: <AlertTriangle className="w-5 h-5" />,
                      trend: {
                        value: 15.2,
                        isPositive: false,
                        label: t("reports.quality.decrease"),
                      },
                    },
                  ]}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Maintenance Cost Analysis */}
                {maintenanceReports?.success &&
                  maintenanceReports.data.costAnalysis && (
                    <InteractiveBarChart
                      data={maintenanceReports.data.costAnalysis}
                      title={t("reports.maintenance.costAnalysis")}
                      description={t(
                        "reports.maintenance.estimatedCostPerMachine",
                      )}
                      xAxisKey="machine_name"
                      yAxisKey="estimated_cost"
                      barColor="#f59e0b"
                      height={350}
                      formatValue={(value) =>
                        formatChartValue(value, "currency")
                      }
                    />
                  )}

                {/* Downtime Analysis */}
                {maintenanceReports?.success &&
                  maintenanceReports.data.downtimeAnalysis && (
                    <InteractiveAreaChart
                      data={[
                        {
                          type: t("reports.maintenance.plannedDowntime"),
                          hours:
                            maintenanceReports.data.downtimeAnalysis
                              .planned_downtime,
                        },
                        {
                          type: t("reports.maintenance.unplannedDowntime"),
                          hours:
                            maintenanceReports.data.downtimeAnalysis
                              .unplanned_downtime,
                        },
                        {
                          type: t("reports.maintenance.total"),
                          hours:
                            maintenanceReports.data.downtimeAnalysis
                              .total_downtime,
                        },
                      ]}
                      title={t("reports.maintenance.downtimeAnalysis")}
                      description={t("reports.maintenance.downtimeByType")}
                      xAxisKey="type"
                      areas={[
                        {
                          key: "hours",
                          name: t("common.hours"),
                          color: "#ef4444",
                        },
                      ]}
                      height={350}
                      formatValue={(value) =>
                        `${safeToFixed(value)} ${t("common.hour")}`
                      }
                    />
                  )}
              </div>

              {/* MTBF (Mean Time Between Failures) */}
              {maintenanceReports?.success && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reports.maintenance.mtbf")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {safeToFixed(
                            maintenanceReports.data.downtimeAnalysis?.mtbf ||
                              168,
                            0,
                          )}
                        </div>
                        <div className="text-lg text-gray-600">
                          {t("common.hour")}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          {t("reports.maintenance.mtbfDescription")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* HR Reports */}
        <TabsContent value="hr">
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-hr">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("reports.loading")}</p>
            </div>
          ) : (
            <>
              {/* HR KPI Metrics */}
              {hrReports?.success && (
                <MetricsGrid
                  columns={4}
                  className="mb-6"
                  metrics={[
                    {
                      title: t("reports.hr.attendanceRate"),
                      value: "94.5%",
                      description: t("reports.hr.overallAttendance"),
                      icon: <Users className="w-5 h-5" />,
                      trend: {
                        value: 2.1,
                        isPositive: true,
                        label: t("reports.production.improved"),
                      },
                    },
                    {
                      title: t("reports.hr.trainingPrograms"),
                      value: formatNumber(
                        hrReports.data.trainingStats?.total_programs || 0,
                      ),
                      description: t("reports.hr.activePrograms"),
                      icon: <Package className="w-5 h-5" />,
                      trend: {
                        value: 15.3,
                        isPositive: true,
                        label: t("reports.quality.increase"),
                      },
                    },
                    {
                      title: t("reports.hr.completionRate"),
                      value: `${safeToFixed(hrReports.data.trainingStats?.completion_rate || 0)}%`,
                      description: t("reports.hr.trainingCompletion"),
                      icon: <Target className="w-5 h-5" />,
                      trend: {
                        value: 8.7,
                        isPositive: true,
                        label: t("reports.hr.excellent"),
                      },
                    },
                    {
                      title: t("reports.hr.teamEfficiency"),
                      value: "91.2%",
                      description: t("reports.hr.avgPerformance"),
                      icon: <Zap className="w-5 h-5" />,
                      trend: {
                        value: 4.3,
                        isPositive: true,
                        label: t("reports.hr.continuousImprovement"),
                      },
                    },
                  ]}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Attendance Analysis */}
                {hrReports?.success && hrReports.data.attendanceStats && (
                  <InteractiveBarChart
                    data={hrReports.data.attendanceStats.slice(0, 10)}
                    title={t("reports.hr.attendanceAnalysis")}
                    description={t("reports.hr.attendancePerEmployee")}
                    xAxisKey="display_name_ar"
                    yAxisKey="attendance_rate"
                    barColor="#10b981"
                    height={350}
                    formatValue={(value) =>
                      formatChartValue(value, "percentage")
                    }
                  />
                )}

                {/* Performance vs Training */}
                {hrReports?.success && hrReports.data.performanceStats && (
                  <ComboChart
                    data={hrReports.data.performanceStats.slice(0, 8)}
                    title={t("reports.hr.performanceVsTraining")}
                    description={t("reports.hr.efficiencyAndErrors")}
                    xAxisKey="display_name_ar"
                    elements={[
                      {
                        type: "bar",
                        key: "production_efficiency",
                        name: t("reports.hr.productionEfficiency"),
                        color: "#3b82f6",
                        yAxisId: "left",
                      },
                      {
                        type: "line",
                        key: "error_rate",
                        name: t("reports.hr.errorRate"),
                        color: "#ef4444",
                        yAxisId: "right",
                      },
                    ]}
                    height={350}
                    formatValue={(value) =>
                      formatChartValue(value, "percentage")
                    }
                    formatRightAxis={(value) =>
                      formatChartValue(value, "percentage")
                    }
                    leftAxisLabel={t("reports.hr.efficiencyLabel")}
                    rightAxisLabel={t("reports.hr.errorsLabel")}
                  />
                )}
              </div>

              {/* Training Program Progress */}
              {hrReports?.success && hrReports.data.trainingStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reports.hr.trainingProgress")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {hrReports.data.trainingStats.total_programs}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("reports.hr.totalPrograms")}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {hrReports.data.trainingStats.completed_trainings}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("reports.hr.completedTrainings")}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          {hrReports.data.trainingStats.total_enrollments -
                            hrReports.data.trainingStats.completed_trainings}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("reports.hr.inProgress")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Financial/Orders Reports */}
        <TabsContent value="financial">
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-financial">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("reports.loading")}</p>
            </div>
          ) : (
            <>
              {/* Financial KPI Metrics */}
              {orderReports?.success && (
                <MetricsGrid
                  columns={4}
                  className="mb-6"
                  metrics={[
                    {
                      title: t("reports.financial.totalOrders"),
                      value: formatNumber(
                        orderReports.data.revenueStats?.total_orders || 0,
                      ),
                      description: t("reports.financial.completedOrder"),
                      icon: <Package className="w-5 h-5" />,
                      trend: {
                        value: 12.5,
                        isPositive: true,
                        label: t("reports.financial.growth"),
                      },
                    },
                    {
                      title: t("reports.financial.estimatedRevenue"),
                      value: formatChartValue(
                        orderReports.data.revenueStats?.estimated_revenue || 0,
                        "currency",
                      ),
                      description: t("reports.financial.saudiRiyal"),
                      icon: <BarChart3 className="w-5 h-5" />,
                      trend: {
                        value: 18.3,
                        isPositive: true,
                        label: t("reports.quality.increase"),
                      },
                    },
                    {
                      title: t("reports.financial.avgOrderValue"),
                      value: formatChartValue(
                        orderReports.data.revenueStats?.avg_order_value || 0,
                        "currency",
                      ),
                      description: t("reports.financial.riyalPerOrder"),
                      icon: <Target className="w-5 h-5" />,
                      trend: {
                        value: 5.7,
                        isPositive: true,
                        label: t("reports.financial.growth"),
                      },
                    },
                    {
                      title: t("reports.financial.onTimeOrders"),
                      value: `${safeToFixed(((orderReports.data.deliveryPerformance?.on_time_orders || 0) / Math.max(orderReports.data.revenueStats?.total_orders || 1, 1)) * 100)}%`,
                      description: t("reports.financial.deliveryPerformance"),
                      icon: <CheckCircle2 className="w-5 h-5" />,
                      trend: {
                        value: 8.9,
                        isPositive: true,
                        label: t("reports.production.improved"),
                      },
                    },
                  ]}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Order Status Distribution */}
                {orderReports?.success &&
                  orderReports.data.orderStatusStats && (
                    <InteractivePieChart
                      data={orderReports.data.orderStatusStats.map(
                        (status: any) => ({
                          status:
                            status.status === "completed"
                              ? t("reports.financial.statuses.completed")
                              : status.status === "in_production"
                                ? t("reports.financial.statuses.inProduction")
                                : status.status === "pending"
                                  ? t("reports.financial.statuses.pending")
                                  : status.status === "cancelled"
                                    ? t("reports.financial.statuses.cancelled")
                                    : status.status,
                          count: status.count,
                        }),
                      )}
                      title={t("reports.financial.orderStatusDist")}
                      description={t("reports.financial.statusPercentage")}
                      nameKey="status"
                      valueKey="count"
                      height={350}
                      colors={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]}
                    />
                  )}

                {/* Top Customers */}
                {orderReports?.success && orderReports.data.topCustomers && (
                  <InteractiveBarChart
                    data={orderReports.data.topCustomers.slice(0, 8)}
                    title={t("reports.financial.topCustomers")}
                    description={t("reports.financial.mostActiveCustomers")}
                    xAxisKey="customer_name"
                    yAxisKey="order_count"
                    barColor="#8b5cf6"
                    height={350}
                    formatValue={(value) =>
                      formatNumber(value) + " " + t("reports.financial.order")
                    }
                  />
                )}
              </div>

              {/* Revenue vs Quantity Trend */}
              {orderReports?.success && orderReports.data.topCustomers && (
                <ComboChart
                  data={orderReports.data.topCustomers.slice(0, 6)}
                  title={t("reports.financial.revenueVsQuantity")}
                  description={t("reports.financial.revenueQuantityAnalysis")}
                  xAxisKey="customer_name"
                  elements={[
                    {
                      type: "bar",
                      key: "total_quantity",
                      name: t("reports.financial.quantityKg"),
                      color: "#3b82f6",
                      yAxisId: "left",
                    },
                    {
                      type: "line",
                      key: "total_value",
                      name: t("reports.financial.valueRiyal"),
                      color: "#10b981",
                      yAxisId: "right",
                    },
                  ]}
                  height={350}
                  formatValue={(value) =>
                    formatChartValue(value, "number") + " " + t("common.kg")
                  }
                  formatRightAxis={(value) =>
                    formatChartValue(value, "currency")
                  }
                  leftAxisLabel={t("reports.financial.quantity")}
                  rightAxisLabel={t("reports.financial.value")}
                />
              )}

              {/* Delivery Performance */}
              {orderReports?.success &&
                orderReports.data.deliveryPerformance && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>
                        {t("reports.financial.deliveryPerformanceTitle")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {
                              orderReports.data.deliveryPerformance
                                .on_time_orders
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("reports.financial.onTimeOrders")}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {orderReports.data.deliveryPerformance.late_orders}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("reports.financial.lateOrders")}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {safeToFixed(
                              orderReports.data.deliveryPerformance
                                .avg_delivery_days || 0,
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("reports.financial.avgDeliveryDays")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
