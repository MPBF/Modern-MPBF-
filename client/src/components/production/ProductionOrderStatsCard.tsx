import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

interface ProductionOrderStatsCardProps {
  productionOrderId: number;
}

export default function ProductionOrderStatsCard({
  productionOrderId,
}: ProductionOrderStatsCardProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const localize = (arabic: string, english: string) =>
    isArabic ? arabic : english;
  const kilogramUnit = localize("كجم", "kg");

  // جلب إحصائيات أمر الإنتاج
  const { data: stats, isLoading } = useQuery<{ data: any }>({
    queryKey: ["/api/production-orders", productionOrderId, "stats"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!stats?.data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          {localize("لا توجد إحصائيات متاحة", "No statistics available")}
        </CardContent>
      </Card>
    );
  }

  const data = stats.data;
  const completionPercentage = parseFloat(data.completion_percentage || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{localize("إحصائيات أمر الإنتاج", "Production order statistics")}</span>
          <Badge variant="outline">
            {data.production_order?.production_order_number}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* نسبة الإكمال */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">
                {localize("نسبة الإكمال", "Completion rate")}
              </span>
              <span className="font-medium">
                {formatNumberAr(completionPercentage, 1)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* الإحصائيات الأساسية */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">
                {localize("إجمالي الرولات", "Total rolls")}
              </div>
              <div className="text-xl font-bold">{data.total_rolls}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">
                {localize("الوزن الإجمالي", "Total weight")}
              </div>
              <div className="text-xl font-bold">
                {data.total_weight} <span className="text-sm">{kilogramUnit}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">
                {localize("الكمية المتبقية", "Remaining quantity")}
              </div>
              <div className="text-xl font-bold">
                {data.remaining_quantity} <span className="text-sm">{kilogramUnit}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">
                {localize("الهدر", "Waste")}
              </div>
              <div className="text-xl font-bold">
                {data.total_waste} <span className="text-sm">{kilogramUnit}</span>
              </div>
            </div>
          </div>

          {/* توزيع الرولات حسب المرحلة */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              {localize("توزيع الرولات حسب المرحلة", "Roll distribution by stage")}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 rounded-lg p-2">
                  <div className="text-lg font-bold">{data.film_rolls}</div>
                  <div className="text-xs">{localize("فيلم", "Film")}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 text-yellow-800 rounded-lg p-2">
                  <div className="text-lg font-bold">{data.printing_rolls}</div>
                  <div className="text-xs">{localize("طباعة", "Printing")}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 text-orange-800 rounded-lg p-2">
                  <div className="text-lg font-bold">{data.cutting_rolls}</div>
                  <div className="text-xs">{localize("تقطيع", "Cutting")}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-800 rounded-lg p-2">
                  <div className="text-lg font-bold">{data.done_rolls}</div>
                  <div className="text-xs">{localize("مكتمل", "Complete")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الوقت */}
          {data.production_order?.production_start_time && (
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {localize("وقت الإنتاج", "Production time")}
                </span>
                <span className="font-medium">
                  {data.production_time_hours} {localize("ساعة", "hours")}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">
                  {localize("تاريخ البدء", "Start date")}
                </span>
                <span className="font-medium">
                  {new Date(
                    data.production_order.production_start_time,
                  ).toLocaleString("en-US")}
                </span>
              </div>
              {data.production_order.production_end_time && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">
                    {localize("تاريخ الانتهاء", "End date")}
                  </span>
                  <span className="font-medium">
                    {new Date(
                      data.production_order.production_end_time,
                    ).toLocaleString("en-US")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* معلومات أمر الإنتاج */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {localize("الكمية المطلوبة", "Required quantity")}
              </span>
              <span className="font-medium">
                {data.production_order?.quantity_kg} {kilogramUnit}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {localize("الكمية النهائية", "Final quantity")}
              </span>
              <span className="font-medium">
                {data.production_order?.final_quantity_kg} {kilogramUnit}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {localize("نسبة الزيادة", "Overrun percentage")}
              </span>
              <span className="font-medium">
                {data.production_order?.overrun_percentage}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
