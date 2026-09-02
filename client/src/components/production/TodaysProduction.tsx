import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, endOfDay } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import {
  Package,
  PackageCheck,
  Printer,
  User,
  Film,
  Scissors,
  Tag,
  Clock,
  Layers,
  Calendar as CalendarIcon,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";

import { useToast } from "../../hooks/use-toast";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import BatchLabelDialog from "./BatchLabelDialog";
import { printRollLabel } from "./RollLabelPrint";

type ProductionStage = "film" | "printing" | "cutting";
type StageFilter = "all" | ProductionStage;

interface ProductionRecord {
  id: number;
  stage: ProductionStage;
  roll_number: string;
  roll_seq: number;
  weight_kg: string | number;
  cut_weight_total_kg: string | number;
  event_at: string;
  employee_id: number | null;
  employee_name: string | null;
  production_order_id: number | null;
  production_order_number: string;
  production_stage?: string;
  status?: string;
  item_name?: string;
  item_name_ar?: string;
  size_caption?: string;
  customer_name?: string;
  customer_name_ar?: string;
}

interface TodaysProductionResponse {
  isManagement: boolean;
  records: ProductionRecord[];
}

const stageIcon = (stage: ProductionStage) => {
  switch (stage) {
    case "film":
      return <Film className="h-3.5 w-3.5" />;
    case "printing":
      return <Printer className="h-3.5 w-3.5" />;
    case "cutting":
      return <Scissors className="h-3.5 w-3.5" />;
  }
};

const stageBadgeClass = (stage: ProductionStage) => {
  switch (stage) {
    case "film":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "printing":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "cutting":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  }
};

const toNum = (v: string | number | null | undefined) => {
  const n = parseFloat(String(v ?? "0"));
  return Number.isFinite(n) ? n : 0;
};

// Totals are roll-based: a roll can appear once per stage (film/printing/
// cutting), so count each distinct roll only once and add its weight once to
// avoid double-counting when the same person worked multiple stages on it.
const aggregate = (list: ProductionRecord[]) => {
  const seen = new Set<number>();
  let weight = 0;
  for (const r of list) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    weight += toNum(r.weight_kg);
  }
  return { count: seen.size, weight };
};

export default function TodaysProduction() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isAr = i18n.language !== "en";

  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [batchOrderId, setBatchOrderId] = useState<number | null>(null);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(
    new Set(),
  );

  const toggleEmployee = (empId: string) => {
    setExpandedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
  };

  const queryParams: Record<string, string> = {};
  if (fromDate) queryParams.from = startOfDay(fromDate).toISOString();
  if (toDate) queryParams.to = endOfDay(toDate).toISOString();
  if (stageFilter !== "all") queryParams.stage = stageFilter;

  const hasActiveFilters =
    fromDate != null || toDate != null || stageFilter !== "all";

  const { data, isLoading, isFetching } = useQuery<TodaysProductionResponse>({
    queryKey: ["/api/production/today", queryParams],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const isManagement = data?.isManagement ?? false;
  const records = data?.records ?? [];

  const calendarLocale = isAr ? ar : undefined;

  const resetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setStageFilter("all");
  };

  const FilterBar = isManagement ? (
    <Card data-testid="todays-production-filters">
      <CardContent className="flex flex-wrap items-end gap-3 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("production.todayProduction.fromDate")}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-44 justify-start text-left font-normal"
                data-testid="button-filter-from"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate
                  ? format(fromDate, "PPP", { locale: calendarLocale })
                  : t("production.todayProduction.selectDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                locale={calendarLocale}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("production.todayProduction.toDate")}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-44 justify-start text-left font-normal"
                data-testid="button-filter-to"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate
                  ? format(toDate, "PPP", { locale: calendarLocale })
                  : t("production.todayProduction.selectDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                locale={calendarLocale}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("production.todayProduction.stage")}
          </label>
          <Select
            value={stageFilter}
            onValueChange={(v) => setStageFilter(v as StageFilter)}
          >
            <SelectTrigger
              className="w-40"
              data-testid="select-filter-stage"
            >
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("production.todayProduction.allStages")}
              </SelectItem>
              <SelectItem value="film">
                {t("production.stageNames.film")}
              </SelectItem>
              <SelectItem value="printing">
                {t("production.stageNames.printing")}
              </SelectItem>
              <SelectItem value="cutting">
                {t("production.stageNames.cutting")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="gap-1"
            data-testid="button-reset-filters"
          >
            <X className="h-4 w-4" />
            {t("production.todayProduction.reset")}
          </Button>
        )}

        {isFetching && (
          <span className="text-xs text-muted-foreground">
            {t("common.loading")}
          </span>
        )}
      </CardContent>
    </Card>
  ) : null;

  const stageLabel = (stage: ProductionStage) =>
    t(`production.stageNames.${stage}`);

  const productName = (r: ProductionRecord) =>
    (isAr ? r.item_name_ar || r.item_name : r.item_name || r.item_name_ar) ||
    t("common.notSpecified");

  const customerName = (r: ProductionRecord) =>
    isAr
      ? r.customer_name_ar || r.customer_name
      : r.customer_name || r.customer_name_ar;

  const handlePrint = async (rollId: number) => {
    try {
      const res = await fetch(`/api/rolls/${rollId}/label`);
      if (!res.ok) {
        throw new Error("label fetch failed");
      }
      const labelData = await res.json();
      printRollLabel(labelData);
      toast({
        title: t("production.rolls.labelSentToPrint"),
        description: `${t("production.rolls.rollLabel")} ${labelData?.roll?.roll_number ?? ""}`,
      });
    } catch (error) {
      console.error("Error printing today's-production label:", error);
      toast({
        title: t("production.rolls.labelPrintError"),
        description: t("production.rolls.labelGenerationError"),
        variant: "destructive",
      });
    }
  };

  const RollCard = ({
    record,
    showEmployee,
  }: {
    record: ProductionRecord;
    showEmployee?: boolean;
  }) => (
    <div
      className="flex flex-col gap-2 rounded-lg border bg-white p-3 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between"
      data-testid={`today-roll-${record.id}`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {record.roll_number}
          </span>
          <Badge
            variant="secondary"
            className={`flex items-center gap-1 ${stageBadgeClass(record.stage)}`}
          >
            {stageIcon(record.stage)}
            {stageLabel(record.stage)}
          </Badge>
        </div>
        <div className="truncate text-sm text-gray-600 dark:text-gray-300">
          {productName(record)}
          {record.size_caption ? ` • ${record.size_caption}` : ""}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {t("production.rolls.productionOrder")}:{" "}
            {record.production_order_number}
          </span>
          {customerName(record) && <span>• {customerName(record)}</span>}
          {showEmployee && record.employee_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {record.employee_name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {record.event_at
              ? format(new Date(record.event_at), "HH:mm")
              : ""}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="whitespace-nowrap font-semibold text-gray-900 dark:text-gray-100">
          {formatNumberAr(toNum(record.weight_kg), 2)} {t("common.kg")}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePrint(record.id)}
          className="gap-1"
          data-testid={`button-print-label-${record.id}`}
        >
          <Tag className="h-4 w-4" />
          {t("production.printLabel")}
        </Button>
        {(record.production_stage === "done" ||
          record.status === "completed") &&
          record.production_order_id != null && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBatchOrderId(record.production_order_id)}
              className="gap-1"
              data-testid={`button-batch-label-${record.id}`}
            >
              <PackageCheck className="h-4 w-4" />
              {t("batch.printLabelTitle")}
            </Button>
          )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {t("production.todayProduction.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = aggregate(records);

  if (records.length === 0) {
    return (
      <div className="space-y-4">
        {FilterBar}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t("production.todayProduction.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-10 text-center">
              <Package className="mx-auto mb-4 h-14 w-14 text-gray-400" />
              <p className="text-gray-500">
                {t("production.todayProduction.empty")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Management: group by employee id (so distinct employees who share a display
  // name are never merged), with the name used only as the display label.
  if (isManagement) {
    const groups = new Map<string, { label: string; list: ProductionRecord[] }>();
    for (const r of records) {
      const key = r.employee_id != null ? String(r.employee_id) : "unknown";
      const existing = groups.get(key);
      if (existing) {
        existing.list.push(r);
      } else {
        groups.set(key, {
          label: r.employee_name || t("common.notSpecified"),
          list: [r],
        });
      }
    }

    return (
      <div className="space-y-4">
        {FilterBar}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {t("production.todayProduction.title")}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {t("production.todayProduction.summary", {
                  count: totals.count,
                  weight: formatNumberAr(totals.weight, 2),
                })}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        {Array.from(groups.entries()).map(([empId, { label, list }]) => {
          const emp = aggregate(list);
          const isOpen = expandedEmployees.has(empId);
          return (
            <Card key={empId} data-testid={`employee-group-${empId}`}>
              <CardHeader className="pb-3">
                <button
                  type="button"
                  onClick={() => toggleEmployee(empId)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-2 text-right"
                  data-testid={`button-toggle-employee-${empId}`}
                >
                  <span className="flex items-center gap-2 text-base font-semibold">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <User className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                    <Badge variant="secondary">
                      {t("production.todayProduction.rollCount", {
                        count: emp.count,
                      })}
                    </Badge>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatNumberAr(emp.weight, 2)} {t("common.kg")}
                    </span>
                  </span>
                </button>
              </CardHeader>
              {isOpen && (
                <CardContent className="space-y-2">
                  {list.map((r) => (
                    <RollCard key={`${r.id}-${r.stage}`} record={r} />
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // Operator: own rolls, grouped by stage when more than one stage is present.
  const stageOrder: ProductionStage[] = ["film", "printing", "cutting"];
  const byStage = new Map<ProductionStage, ProductionRecord[]>();
  for (const r of records) {
    const list = byStage.get(r.stage) ?? [];
    list.push(r);
    byStage.set(r.stage, list);
  }
  const presentStages = stageOrder.filter((s) => byStage.has(s));
  const multiStage = presentStages.length > 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t("production.todayProduction.title")}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {t("production.todayProduction.summary", {
                count: totals.count,
                weight: formatNumberAr(totals.weight, 2),
              })}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {presentStages.map((stage) => {
        const list = byStage.get(stage)!;
        return (
          <Card key={stage} data-testid={`stage-group-${stage}`}>
            {multiStage && (
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {stageIcon(stage)}
                  {stageLabel(stage)}
                  <Badge variant="secondary">
                    {t("production.todayProduction.rollCount", {
                      count: list.length,
                    })}
                  </Badge>
                </CardTitle>
              </CardHeader>
            )}
            <CardContent className={`space-y-2 ${multiStage ? "" : "pt-6"}`}>
              {list.map((r) => (
                <RollCard key={`${r.id}-${r.stage}`} record={r} />
              ))}
            </CardContent>
          </Card>
        );
      })}

      <BatchLabelDialog
        productionOrderId={batchOrderId}
        onClose={() => setBatchOrderId(null)}
      />
    </div>
  );
}
