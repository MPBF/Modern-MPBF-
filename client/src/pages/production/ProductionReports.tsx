import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  Search,
  RotateCcw,
  TrendingUp,
  Package,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Factory,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatNumberAr } from "../../../../shared/number-utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useToast } from "../../hooks/use-toast";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#db2777",
];

export default function ProductionReports() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
    customerId: [] as number[],
    productId: [] as number[],
    status: [] as string[],
    sectionId: "",
    machineId: "",
    operatorId: "",
  });

  const [activeFilters, setActiveFilters] = useState(filters);

  const { data: summary, isLoading: summaryLoading } = useQuery<any>({
    queryKey: ["/api/reports/production-summary", activeFilters],
    enabled: !!activeFilters.dateFrom && !!activeFilters.dateTo,
  });

  const { data: productionByDate, isLoading: dateLoading } = useQuery<any>({
    queryKey: ["/api/reports/production-by-date", activeFilters],
    enabled: !!activeFilters.dateFrom && !!activeFilters.dateTo,
  });

  const { data: productionByProduct, isLoading: productLoading } =
    useQuery<any>({
      queryKey: ["/api/reports/production-by-product", activeFilters],
      enabled: !!activeFilters.dateFrom && !!activeFilters.dateTo,
    });

  const { data: wasteAnalysis, isLoading: wasteLoading } = useQuery<any>({
    queryKey: ["/api/reports/waste-analysis", activeFilters],
    enabled: !!activeFilters.dateFrom && !!activeFilters.dateTo,
  });

  const { data: machinePerformance } = useQuery<any>({
    queryKey: ["/api/reports/machine-performance", activeFilters],
    enabled: !!activeFilters.dateFrom && !!activeFilters.dateTo,
  });

  const { data: operatorPerformance, isLoading: operatorLoading } =
    useQuery<any>({
      queryKey: ["/api/reports/operator-performance", activeFilters],
      enabled: !!activeFilters.dateFrom && !!activeFilters.dateTo,
    });

  const { data: machines } = useQuery<any>({ queryKey: ["/api/machines"] });
  const { data: sections } = useQuery<any>({ queryKey: ["/api/sections"] });

  const handleSearch = () => {
    setActiveFilters(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
      customerId: [] as number[],
      productId: [] as number[],
      status: [] as string[],
      sectionId: "",
      machineId: "",
      operatorId: "",
    };
    setFilters(defaultFilters);
    setActiveFilters(defaultFilters);
  };

  const [isExporting, setIsExporting] = useState<string | null>(null);

  const exportReport = async (exportFormat: "excel" | "pdf") => {
    setIsExporting(exportFormat);
    try {
      const response = await fetch("/api/reports/production/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          format: exportFormat,
          dateFrom: activeFilters.dateFrom,
          dateTo: activeFilters.dateTo,
          filters: activeFilters,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || t("production.reports.exportError"));
      }

      const blob = await response.blob();
      const ext = exportFormat === "excel" ? "xlsx" : "pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Production_Report_${format(new Date(), "yyyy-MM-dd")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: t("production.reports.exportSuccess"),
        description: t("production.reports.exportSuccessDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("production.reports.exportError"),
        description: error.message || t("production.reports.exportErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const getStatusColor = (value: number, metric: string) => {
    if (metric === "waste") {
      if (value < 3) return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200";
      if (value < 5) return "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200";
      return "text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200";
    }
    if (value >= 90) return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200";
    if (value >= 70) return "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200";
    return "text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200";
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* الترويسة وأزرار التصدير */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border shadow-xs">
        <div>
          <h1 className="text-xl font-black text-gray-950 dark:text-white" data-testid="text-page-title">
            {t("production.reports.title")}
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            {t("production.reports.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportReport("excel")}
            variant="outline"
            disabled={isExporting === "excel"}
            className="h-9 px-3.5 text-xs font-bold rounded-xl gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            data-testid="button-export-excel"
          >
            {isExporting === "excel" ? (
              <RotateCcw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5" />
            )}
            {t("production.reports.exportExcel")}
          </Button>

          <Button
            onClick={() => exportReport("pdf")}
            variant="outline"
            disabled={isExporting === "pdf"}
            className="h-9 px-3.5 text-xs font-bold rounded-xl gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50"
            data-testid="button-export-pdf"
          >
            {isExporting === "pdf" ? (
              <RotateCcw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            {t("production.reports.exportPdf")}
          </Button>
        </div>
      </div>

      {/* شريط الفلاتر السريع والقابل للطي */}
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="p-3.5 bg-gray-50/60 dark:bg-gray-800/40 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            {t("production.reports.filters")}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-7 text-xs font-bold"
          >
            {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر الإضافية"}
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="dateFrom" className="text-xs font-bold text-gray-500">
                {t("production.reports.dateFrom")}
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="h-9 text-xs font-bold rounded-xl"
                data-testid="input-date-from"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dateTo" className="text-xs font-bold text-gray-500">
                {t("production.reports.dateTo")}
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="h-9 text-xs font-bold rounded-xl"
                data-testid="input-date-to"
              />
            </div>

            {showFilters && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="section" className="text-xs font-bold text-gray-500">
                    {t("production.reports.section")}
                  </Label>
                  <Select
                    value={filters.sectionId || "all"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, sectionId: value === "all" ? "" : value })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs font-bold rounded-xl" data-testid="select-section">
                      <SelectValue placeholder={t("production.reports.selectSection")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("production.reports.allSections")}</SelectItem>
                      {sections?.map((section: any) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name_ar || section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="machine" className="text-xs font-bold text-gray-500">
                    {t("production.reports.machine")}
                  </Label>
                  <Select
                    value={filters.machineId || "all"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, machineId: value === "all" ? "" : value })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs font-bold rounded-xl" data-testid="select-machine">
                      <SelectValue placeholder={t("production.reports.selectMachine")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("production.reports.allMachines")}</SelectItem>
                      {machines?.map((machine: any) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name_ar || machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSearch}
              className="h-9 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
              data-testid="button-search"
            >
              <Search className="h-3.5 w-3.5" />
              تطبيق التقرير
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-9 px-3 text-xs font-bold rounded-xl gap-1.5"
              data-testid="button-reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* بطاقات مؤشرات الأداء السريعة (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block mb-1">
            {t("production.reports.totalOrders")}
          </span>
          {summaryLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-xl font-black text-gray-900 dark:text-white" data-testid="text-total-orders">
              {summary?.data?.totalOrders || 0}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block mb-1">
            {t("production.reports.activeOrders")}
          </span>
          {summaryLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-xl font-black text-blue-600 dark:text-blue-400" data-testid="text-active-orders">
              {summary?.data?.activeOrders || 0}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block mb-1">
            {t("production.reports.producedRolls")}
          </span>
          {summaryLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400" data-testid="text-total-rolls">
              {summary?.data?.totalRolls || 0}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block mb-1">
            {t("production.reports.avgProductionTime")}
          </span>
          {summaryLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-xl font-black text-amber-600 dark:text-amber-400" data-testid="text-avg-time">
              {summary?.data?.avgProductionTime?.toFixed(1) || "0"} <span className="text-xs font-normal">س</span>
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block mb-1">
            {t("production.reports.wastePercentage")}
          </span>
          {summaryLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p
              className={`text-xl font-black inline-block px-1.5 py-0.5 rounded-lg border ${getStatusColor(
                summary?.data?.wastePercentage || 0,
                "waste",
              )}`}
              data-testid="text-waste-percentage"
            >
              {summary?.data?.wastePercentage?.toFixed(2) || "0"}%
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 block mb-1">
            {t("production.reports.completionRate")}
          </span>
          {summaryLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p
              className={`text-xl font-black inline-block px-1.5 py-0.5 rounded-lg border ${getStatusColor(
                summary?.data?.completionRate || 0,
                "completion",
              )}`}
              data-testid="text-completion-rate"
            >
              {summary?.data?.completionRate?.toFixed(1) || "0"}%
            </p>
          )}
        </div>
      </div>

      {/* تبويبات التقارير التفصيلية */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl gap-1">
          <TabsTrigger value="daily" data-testid="tab-daily" className="py-2 text-xs font-bold rounded-xl">
            {t("production.reports.dailyProduction")}
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products" className="py-2 text-xs font-bold rounded-xl">
            {t("production.reports.byProduct")}
          </TabsTrigger>
          <TabsTrigger value="waste" data-testid="tab-waste" className="py-2 text-xs font-bold rounded-xl">
            {t("production.reports.wasteAnalysis")}
          </TabsTrigger>
          <TabsTrigger value="machines" data-testid="tab-machines" className="py-2 text-xs font-bold rounded-xl">
            {t("production.reports.machinePerformance")}
          </TabsTrigger>
          <TabsTrigger value="operators" data-testid="tab-operators" className="py-2 text-xs font-bold rounded-xl">
            {t("production.reports.operatorPerformance")}
          </TabsTrigger>
        </TabsList>

        {/* الإنتاج اليومي */}
        <TabsContent value="daily" className="space-y-4 mt-2">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                {t("production.reports.dailyProduction")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {dateLoading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={productionByDate?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="rollsCount"
                      stroke="#2563eb"
                      name={t("production.reports.rollsCount")}
                      strokeWidth={2.5}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalWeight"
                      stroke="#16a34a"
                      name={t("production.reports.weightKg")}
                      strokeWidth={2.5}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* حسب المنتجات */}
        <TabsContent value="products" className="space-y-4 mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-600" />
                  {t("production.reports.productionByProduct")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {productLoading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={productionByProduct?.data || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="productName" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalWeight" fill="#2563eb" name={t("production.reports.weightKg")} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="rollsCount" fill="#16a34a" name={t("production.reports.rollsCount")} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  {t("production.reports.productDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {productLoading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={productionByProduct?.data || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => entry.productName}
                        outerRadius={85}
                        dataKey="totalWeight"
                      >
                        {(productionByProduct?.data || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تحليل الهدر */}
        <TabsContent value="waste" className="space-y-4 mt-2">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                {t("production.reports.wasteTrend")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {wasteLoading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={wasteAnalysis?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="totalWaste"
                      stroke="#dc2626"
                      fill="#fee2e2"
                      name={t("production.reports.wasteAmount")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* أداء المكائن */}
        <TabsContent value="machines" className="space-y-4 mt-2">
          <Card className="rounded-2xl border shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/40">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Factory className="h-4 w-4 text-blue-600" />
                {t("production.reports.machinePerformanceTable")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                    <TableHead className="font-black text-xs">{t("production.reports.machineName")}</TableHead>
                    <TableHead className="font-black text-xs text-center">{t("production.reports.rollsCount")}</TableHead>
                    <TableHead className="font-black text-xs text-center">{t("production.reports.totalWeight")}</TableHead>
                    <TableHead className="font-black text-xs text-center">{t("production.reports.avgTime")}</TableHead>
                    <TableHead className="font-black text-xs text-center">{t("production.reports.efficiency")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machinePerformance?.data?.map((machine: any, index: number) => (
                    <TableRow key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <TableCell className="font-black text-xs">{machine.machineName}</TableCell>
                      <TableCell className="text-center font-bold text-xs">{machine.rollsCount}</TableCell>
                      <TableCell className="text-center font-bold text-xs text-blue-600">
                        {formatNumberAr(Number(machine.totalWeight), 2)} كجم
                      </TableCell>
                      <TableCell className="text-center text-xs text-gray-500 font-bold">
                        {machine.avgTime?.toFixed(2)} س
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`text-[10px] font-bold border ${getStatusColor(
                            machine.efficiency || 0,
                            "efficiency",
                          )}`}
                        >
                          {machine.efficiency?.toFixed(1) || 0}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* أداء المشغلين */}
        <TabsContent value="operators" className="space-y-4 mt-2">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-600" />
                {t("production.reports.operatorPerformance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {operatorLoading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={operatorPerformance?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="operatorName" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalWeight" fill="#2563eb" name={t("production.reports.weightKg")} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rollsCount" fill="#16a34a" name={t("production.reports.rollsCount")} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}