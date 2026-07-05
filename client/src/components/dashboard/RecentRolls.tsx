import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  User,
  Settings,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

export default function RecentRolls() {
  const { t } = useTranslation();
  const {
    data: rolls = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/rolls"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return t("dashboard.rolls.completed");
      case "in_progress":
        return t("dashboard.rolls.inProgress");
      case "pending":
        return t("dashboard.rolls.pending");
      case "failed":
        return t("dashboard.rolls.failed");
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const recentRolls = Array.isArray(rolls) ? rolls.slice(0, 10) : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t("dashboard.rolls.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t("dashboard.rolls.title")}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          {recentRolls.length > 0 ? (
            <div className="p-4 space-y-4">
              {recentRolls.map((roll: any) => (
                <div
                  key={roll.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getStatusIcon(roll.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {roll.roll_number}
                          </h4>
                          <Badge className={getStatusColor(roll.status)}>
                            {getStatusText(roll.status)}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>
                              {t("dashboard.rolls.productionOrder")}:{" "}
                              {roll.production_order_id}
                            </span>
                          </div>

                          {roll.machine_id && (
                            <div className="flex items-center gap-1">
                              <Settings className="w-3 h-3" />
                              <span>
                                {t("dashboard.rolls.machine")}:{" "}
                                {roll.machine_id}
                              </span>
                            </div>
                          )}

                          {roll.employee_id && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>
                                {t("dashboard.rolls.worker")}:{" "}
                                {roll.employee_id}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(roll.created_at).toLocaleDateString(
                                "ar",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {Number(roll.length) > 0 && (
                        <div className="text-sm font-medium text-gray-900">
                          {roll.length} {t("dashboard.rolls.meter")}
                        </div>
                      )}
                      {Number(roll.weight) > 0 && (
                        <div className="text-xs text-gray-500">
                          {roll.weight} {t("dashboard.rolls.kg")}
                        </div>
                      )}
                    </div>
                  </div>

                  {roll.status === "in_progress" &&
                    Number(roll.length) > 0 &&
                    Number(roll.target_length) > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{t("dashboard.rolls.progress")}</span>
                          <span>
                            {Math.round(
                              (roll.length / roll.target_length) * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((roll.length / roll.target_length) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">
                {t("dashboard.rolls.noRolls")}
              </p>
              <p className="text-sm text-gray-500">
                {t("dashboard.rolls.newRollsAppear")}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
