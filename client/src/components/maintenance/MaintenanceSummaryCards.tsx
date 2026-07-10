import { useQuery } from "@tanstack/react-query";
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "../ui/card";

import type { LucideIcon } from "lucide-react";

function SummaryCard({
  label,
  value,
  valueClassName,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: number;
  valueClassName: string;
  icon: LucideIcon;
  iconClassName: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${iconClassName}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MaintenanceSummaryCards() {
  const { t } = useTranslation();
  const { data: maintenanceRequests } = useQuery({
    queryKey: ["/api/maintenance-requests"],
  });

  const requests = Array.isArray(maintenanceRequests) ? maintenanceRequests : [];
  const countByStatus = (status: string) =>
    requests.filter((r: any) => r.status === status).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        label={t("maintenance.totalRequests")}
        value={requests.length}
        valueClassName="text-gray-900"
        icon={Wrench}
        iconClassName="text-blue-500"
      />
      <SummaryCard
        label={t("maintenance.status.pending")}
        value={countByStatus("pending")}
        valueClassName="text-yellow-600"
        icon={Clock}
        iconClassName="text-yellow-500"
      />
      <SummaryCard
        label={t("maintenance.status.inProgress")}
        value={countByStatus("in_progress")}
        valueClassName="text-blue-600"
        icon={AlertTriangle}
        iconClassName="text-blue-500"
      />
      <SummaryCard
        label={t("maintenance.status.completedFeminine")}
        value={countByStatus("completed")}
        valueClassName="text-green-600"
        icon={CheckCircle}
        iconClassName="text-green-500"
      />
    </div>
  );
}
