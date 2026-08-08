import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Factory,
  Users,
  AlertTriangle,
  Scale,
  Trash2,
  Trophy,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatNumber } from "../../lib/formatNumber";
import ErrorBoundary from "../shared/ErrorBoundary";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface TopWorker {
  id: number;
  name: string;
  production: number;
}

interface DashboardStatsData {
  waitingOrders: { count: number; totalKg: number };
  inProductionOrders: { count: number; totalKg: number };
  monthlyProduction: number;
  monthlyWaste: number;
  presentEmployees: number;
  totalEmployees: number;
  maintenanceAlerts: number;
  topWorkers: {
    film: TopWorker[];
    printing: TopWorker[];
    cutting: TopWorker[];
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  badge,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  badge?: { text: string; variant: "default" | "destructive" | "secondary" };
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`${color} opacity-20`}>{icon}</div>
        </div>
        {badge && (
          <div className="mt-2">
            <Badge variant={badge.variant} className="text-xs">
              {badge.text}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopWorkersCard({
  title,
  workers,
  unit,
}: {
  title: string;
  workers: TopWorker[];
  unit: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {workers.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-2">
            {t("dashboard.stats.noData")}
          </p>
        ) : (
          <div className="space-y-2">
            {workers.map((worker, index) => (
              <div
                key={worker.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {index === 0
                      ? "🥇"
                      : index === 1
                        ? "🥈"
                        : index === 2
                          ? "🥉"
                          : index + 1}
                  </span>
                  <span className="truncate max-w-[100px]">{worker.name}</span>
                </div>
                <span className="font-medium text-gray-700">
                  {formatNumber(worker.production)} {unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardStatsContent() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQuery<DashboardStatsData>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const waitingCount = stats?.waitingOrders?.count || 0;
  const waitingKg = stats?.waitingOrders?.totalKg || 0;
  const inProductionCount = stats?.inProductionOrders?.count || 0;
  const inProductionKg = stats?.inProductionOrders?.totalKg || 0;
  const monthlyProduction = stats?.monthlyProduction || 0;
  const monthlyWaste = stats?.monthlyWaste || 0;
  const presentEmployees = stats?.presentEmployees || 0;
  const totalEmployees = stats?.totalEmployees || 1;
  const maintenanceAlerts = stats?.maintenanceAlerts || 0;
  const attendanceRate = Math.round((presentEmployees / totalEmployees) * 100);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title={t("dashboard.stats.waitingOrders")}
          value={waitingCount}
          subtitle={`${formatNumber(waitingKg)} ${t("dashboard.stats.kg")}`}
          icon={<Clock className="w-6 h-6" />}
          color="text-orange-600"
          badge={
            waitingCount > 0
              ? { text: t("dashboard.stats.waiting"), variant: "secondary" }
              : undefined
          }
        />

        <StatCard
          title={t("dashboard.stats.activeOrders")}
          value={inProductionCount}
          subtitle={`${formatNumber(inProductionKg)} ${t("dashboard.stats.kg")}`}
          icon={<Factory className="w-6 h-6" />}
          color="text-blue-600"
          badge={
            inProductionCount > 0
              ? { text: t("dashboard.stats.inProduction"), variant: "default" }
              : undefined
          }
        />

        <StatCard
          title={t("dashboard.stats.monthlyProduction")}
          value={`${formatNumber(monthlyProduction)} ${t("dashboard.stats.kg")}`}
          subtitle={t("dashboard.stats.totalProduction")}
          icon={<Scale className="w-6 h-6" />}
          color="text-green-600"
        />

        <StatCard
          title={t("dashboard.stats.monthlyWaste")}
          value={`${formatNumber(monthlyWaste)} ${t("dashboard.stats.kg")}`}
          subtitle={t("dashboard.stats.totalWaste")}
          icon={<Trash2 className="w-6 h-6" />}
          color={monthlyWaste > 100 ? "text-red-600" : "text-gray-600"}
          badge={
            monthlyWaste > 100
              ? { text: t("dashboard.stats.high"), variant: "destructive" }
              : undefined
          }
        />

        <StatCard
          title={t("dashboard.stats.presentWorkers")}
          value={`${presentEmployees}/${totalEmployees}`}
          subtitle={`${attendanceRate}% ${t("dashboard.stats.attendanceRate")}`}
          icon={<UserCheck className="w-6 h-6" />}
          color="text-purple-600"
        />

        <StatCard
          title={t("dashboard.stats.maintenanceAlerts")}
          value={maintenanceAlerts}
          subtitle={
            maintenanceAlerts > 0
              ? t("dashboard.stats.requiresAttention")
              : t("dashboard.stats.noAlerts")
          }
          icon={<AlertTriangle className="w-6 h-6" />}
          color={maintenanceAlerts > 0 ? "text-red-600" : "text-green-600"}
          badge={
            maintenanceAlerts > 0
              ? { text: t("dashboard.stats.alert"), variant: "destructive" }
              : { text: t("dashboard.stats.normal"), variant: "default" }
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopWorkersCard
          title={t("dashboard.stats.topFilmWorkers")}
          workers={stats?.topWorkers?.film || []}
          unit={t("dashboard.stats.kg")}
        />
        <TopWorkersCard
          title={t("dashboard.stats.topPrintingWorkers")}
          workers={stats?.topWorkers?.printing || []}
          unit={t("dashboard.stats.kg")}
        />
        <TopWorkersCard
          title={t("dashboard.stats.topCuttingWorkers")}
          workers={stats?.topWorkers?.cutting || []}
          unit={t("dashboard.stats.kg")}
        />
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const { t } = useTranslation();
  return (
    <ErrorBoundary
      fallback="component"
      title={t("dashboard.stats.errorTitle")}
      description={t("dashboard.stats.errorDescription")}
      onError={(error, errorInfo) => {
        console.error("Dashboard stats error:", error, errorInfo);
      }}
    >
      <DashboardStatsContent />
    </ErrorBoundary>
  );
}
