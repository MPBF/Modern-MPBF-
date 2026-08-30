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
  Calendar,
  Ruler,
  Layers,
  Scale,
  Hash,
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

const STAGE_CONFIGS = {
  film: {
    icon: Film,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  printing: {
    icon: Printer,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  cutting: {
    icon: Scissors,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
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
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs font-bold text-gray-500">جاري تتبع بيانات الدفعة...</p>
        </div>
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
      <div className="container mx-auto max-w-xl p-4" dir="rtl">
        <Card className="rounded-2xl border-2 border-dashed border-rose-200 p-6">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-rose-500" />
            <h3 className="text-base font-black text-gray-900 dark:text-white">{msg}</h3>
            <p className="text-xs font-mono font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
              {batchNumber}
            </p>
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
    <div className="container mx-auto max-w-2xl space-y-4 p-4 pb-12" dir="rtl">
      {/* بطاقة رأس الدفعة */}
      <Card className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 shadow-sm overflow-hidden bg-white dark:bg-gray-900">
        <CardHeader className="text-center bg-emerald-50/70 dark:bg-emerald-950/30 p-5 pb-4 border-b border-emerald-100 dark:border-emerald-900/40">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <PackageCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-lg font-black text-gray-950 dark:text-white">
            {t("batch.title")}
          </CardTitle>
          <div className="inline-block mx-auto mt-2 px-4 py-1.5 rounded-xl bg-gray-950 text-white font-mono font-black text-sm tracking-wider shadow-xs">
            {data.batch_number}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {/* اسم العميل والمنتج البارز */}
          <div className="text-center space-y-1 pb-2 border-b">
            <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
              {ln(data.item_name_ar, data.item_name) || "منتج بدون اسم"}
            </h3>
            <p className="text-sm font-extrabold text-blue-700 dark:text-blue-400">
              {ln(data.customer_name_ar, data.customer_name) || "عميل غير محدد"}
            </p>
          </div>

          {/* شبكة البيانات والمواصفات الفنية */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-800/40 p-3 rounded-xl border text-xs">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">{t("batch.size")}</span>
                <span className="font-black text-gray-900 dark:text-gray-100">
                  {data.size_caption || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">{t("batch.netQuantity")}</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {data.net_quantity_kg != null
                    ? `${parseFloat(String(data.net_quantity_kg)).toFixed(2)} كجم`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">{t("batch.order")}</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  #{data.order_number || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">{t("batch.productionOrder")}</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {data.production_order_number || "—"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* مسار الإنتاج والمراحل */}
      <Card className="rounded-2xl border shadow-xs bg-white dark:bg-gray-900">
        <CardHeader className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/40">
          <CardTitle className="text-sm font-black flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            {t("batch.stagesTitle")}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {data.stages.map((stage, idx) => {
            const config = STAGE_CONFIGS[stage.stage] || STAGE_CONFIGS.film;
            const Icon = config.icon;

            return (
              <div
                key={stage.stage}
                className={`rounded-2xl border p-3.5 space-y-2 ${config.bg} transition-all`}
                data-testid={`batch-stage-${stage.stage}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 font-black text-xs flex items-center justify-center shadow-2xs border">
                      {idx + 1}
                    </span>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className="font-black text-sm text-gray-900 dark:text-white">
                      {stageLabels[stage.stage]}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {stage.date
                      ? format(new Date(stage.date), "dd/MM/yyyy")
                      : t("batch.noDate")}
                  </span>
                </div>

                {stage.operators.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-gray-400">المنفذين:</span>
                    {stage.operators.map((op, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs font-bold bg-white/90 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border shadow-2xs gap-1 py-0.5"
                      >
                        <User className="h-3 w-3 text-gray-400" />
                        {op}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-gray-400 pt-1">
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