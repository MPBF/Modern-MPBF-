import { ListFilter, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface OrdersSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string | string[];
  setStatusFilter: (status: any) => void;
  type?: "orders" | "production";
  salesReps?: any[];
  salesRepFilter?: string;
  setSalesRepFilter?: (repId: string) => void;
}

export default function OrdersSearch({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  type = "orders",
  salesReps = [],
  salesRepFilter = "all",
  setSalesRepFilter,
}: OrdersSearchProps) {
  const { t } = useTranslation();
  const isProduction = type === "production";

  // Order statuses available for the multi-select filter (orders tab only).
  const orderStatusOptions: { value: string; label: string }[] = [
    { value: "waiting", label: t("orders.statuses.waiting") },
    { value: "in_production", label: t("orders.statuses.in_production") },
    { value: "on_hold", label: t("orders.statuses.on_hold") },
    { value: "paused", label: t("orders.statuses.paused") },
    { value: "completed", label: t("orders.statuses.completed") },
    { value: "received", label: t("orders.statuses.received") },
    { value: "archived", label: t("orders.statuses.archived") },
  ];

  const selectedStatuses: string[] = Array.isArray(statusFilter)
    ? statusFilter
    : [];

  const toggleStatus = (value: string) => {
    if (selectedStatuses.includes(value)) {
      setStatusFilter(selectedStatuses.filter((s) => s !== value));
    } else {
      setStatusFilter([...selectedStatuses, value]);
    }
  };

  const triggerLabel =
    selectedStatuses.length === 0
      ? t("common.all")
      : selectedStatuses.length === 1
        ? orderStatusOptions.find((o) => o.value === selectedStatuses[0])
            ?.label || t("common.status")
        : t("orders.filters.statusesSelected", {
            count: selectedStatuses.length,
          });

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={
            isProduction
              ? "ابحث في أوامر الإنتاج أو رقم الطلب أو العميل"
              : "ابحث برقم الطلب أو العميل أو المندوب"
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full rounded-xl border-slate-200 bg-white pr-10 text-sm shadow-sm transition-all placeholder:text-slate-400 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-950"
          data-testid={
            isProduction ? "input-search-production" : "input-search-orders"
          }
        />
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:auto-cols-max lg:grid-flow-col">
        {!isProduction && setSalesRepFilter && salesReps.length > 0 && (
          <Select value={salesRepFilter || "all"} onValueChange={setSalesRepFilter}>
            <SelectTrigger
              className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm lg:w-48 dark:border-slate-800 dark:bg-slate-950"
              data-testid="select-sales-rep-filter"
            >
              <SelectValue placeholder="المندوب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المندوبين</SelectItem>
              <SelectItem value="none">بدون مندوب</SelectItem>
              {salesReps.map((rep: any) => (
                <SelectItem key={rep.id} value={String(rep.id)}>
                  {rep.display_name_ar || rep.display_name || rep.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      {isProduction ? (
        <Select
          value={(statusFilter as string) || ""}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger
            className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm lg:w-48 dark:border-slate-800 dark:bg-slate-950"
            data-testid="select-status-filter"
          >
            <SelectValue placeholder={t("common.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="pending">
              {t("orders.statuses.pending")}
            </SelectItem>
            <SelectItem value="in_progress">
              {t("production.statuses.in_progress")}
            </SelectItem>
            <SelectItem value="completed">
              {t("orders.statuses.completed")}
            </SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-full justify-between rounded-xl border-slate-200 bg-white text-sm font-medium shadow-sm lg:w-52 dark:border-slate-800 dark:bg-slate-950"
              data-testid="select-status-filter"
            >
              <span className="flex min-w-0 items-center gap-2 truncate">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="truncate">{triggerLabel}</span>
              </span>
              <ListFilter className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 rounded-xl p-2" align="end">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-xs font-medium text-muted-foreground">
                {t("common.status")}
              </span>
              {selectedStatuses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter([])}
                  className="text-xs text-primary hover:underline"
                  data-testid="clear-status-filter"
                >
                  {t("common.all")}
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {orderStatusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent cursor-pointer"
                  data-testid={`status-option-${opt.value}`}
                >
                  <Checkbox
                    checked={selectedStatuses.includes(opt.value)}
                    onCheckedChange={() => toggleStatus(opt.value)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
        {(searchTerm || selectedStatuses.length > 0 || salesRepFilter !== "all") && !isProduction && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-xl px-3 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter([]);
              setSalesRepFilter?.("all");
            }}
          >
            <X className="ml-2 h-4 w-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
}
