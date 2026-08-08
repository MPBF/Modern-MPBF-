import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Loader2,
  PackageCheck,
  Film,
  Printer,
  Scissors,
  AlertTriangle,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRoute } from "wouter";

import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useLocalizedName } from "../../hooks/use-localized-name";

interface BatchStage {
  stage: "film" | "printing" | "cutting";
  date: string | null;
  operators: string[];
}

interface BatchTrace {
  batch_number: string;
  production_order_number?: string;
  order_number?: string;
  customer_name?: string;
  customer_name_ar?: string;
  item_name?: string;
  item_name_ar?: string;
  size_caption?: string;
  net_quantity_kg?: string | number;
  stages: BatchStage[];
}

const STAGE_ICONS = {
  film: Film,
  printing: Printer,
  cutting: Scissors,
} as const;

export default function BatchLookup() {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const [, params] = useRoute("/batch/:batchNumber");
  const batchNumber = params?.batchNumber
    ? decodeURIComponent(params.batchNumber)
    : "";

  const { data, isLoading, isError, error } = useQuery<BatchTrace>({
    queryKey: ["/api/batches", batchNumber],
    enabled: !!batchNumber,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    const msg =
      (error as any)?.message?.includes("404") ||
      String(error || "").includes("404")
        ? t("batch.notFound")
        : t("batch.loadError");
    return (
      <div className="container mx-auto max-w-2xl p-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <p className="text-lg font-medium">{msg}</p>
            <p className="text-sm text-muted-foreground">{batchNumber}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stageLabels: Record<string, string> = {
    film: t("batch.stageFilm"),
    printing: t("batch.stagePrinting"),
    cutting: t("batch.stageCutting"),
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <PackageCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl">{t("batch.title")}</CardTitle>
          <Badge variant="secondary" className="mx-auto mt-2 text-base">
            {data.batch_number}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data.customer_name && (
            <InfoRow
              label={t("batch.customer")}
              value={ln(data.customer_name_ar, data.customer_name)}
            />
          )}
          {data.item_name && (
            <InfoRow
              label={t("batch.product")}
              value={ln(data.item_name_ar, data.item_name)}
            />
          )}
          {data.size_caption && (
            <InfoRow label={t("batch.size")} value={data.size_caption} />
          )}
          {data.order_number && (
            <InfoRow label={t("batch.order")} value={data.order_number} />
          )}
          {data.production_order_number && (
            <InfoRow
              label={t("batch.productionOrder")}
              value={data.production_order_number}
            />
          )}
          {data.net_quantity_kg != null && (
            <InfoRow
              label={t("batch.netQuantity")}
              value={`${parseFloat(String(data.net_quantity_kg)).toFixed(2)} ${t(
                "batch.kg",
              )}`}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("batch.stagesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.stages.map((stage) => {
            const Icon = STAGE_ICONS[stage.stage];
            return (
              <div
                key={stage.stage}
                className="rounded-lg border p-3"
                data-testid={`batch-stage-${stage.stage}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {stageLabels[stage.stage]}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {stage.date
                      ? format(new Date(stage.date), "dd/MM/yyyy")
                      : t("batch.noDate")}
                  </span>
                </div>
                {stage.operators.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stage.operators.map((op, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <User className="h-3 w-3" />
                        {op}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("batch.noOperators")}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
