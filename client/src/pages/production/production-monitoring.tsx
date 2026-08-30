import { useQuery } from "@tanstack/react-query";
import {
  Film,
  Printer,
  Scissors,
  Users,
  TrendingUp,
  RefreshCw,
  Package,
  Activity,
  Target,
  Factory,
  Award,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Boxes,
  Calendar,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import PageLayout from "../../components/layout/PageLayout";
import FloorRollsTracker from "../../components/production/FloorRollsTracker";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useLocalizedName } from "../../hooks/use-localized-name";

const SECTION_COLORS = {
  film: "#2563eb",
  printing: "#7c3aed",
  cutting: "#d97706",
  done: "#16a34a",
};

export default function ProductionMonitoring() {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);
  const [expandedWorker, setExpandedWorker] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    setDateFrom(yearAgo.toISOString().split("T")[0]);
    setDateTo(now.toISOString().split("T")[0]);
  }, []);

  const {
    data: dashboardData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/production/monitoring-dashboard", { dateFrom, dateTo }],
    enabled: !!dateFrom && !!dateTo,
  });

  const dashboard = dashboardData?.data;
  const summary = dashboard?.summary || {};
  const machinesList = dashboard?.machines || [];
  const workersList = dashboard?.workers || [];
  const productsList = dashboard?.products || [];
  const materials = dashboard?.materials || {
    recipes: [],
    orders: [],
    facets: { raw_materials: [], colors: [], categories: [] },
  };
  const [matStatusFilter, setMatStatusFilter] = useState<string>("all");

  const COMPONENT_KEYS = ["HDPE", "LLDPE", "LDPE", "FILLER", "COLOR"] as const;
  const COMPONENT_COLORS: Record<string, string> = {
    HDPE: "bg-blue-50/80 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
    LLDPE: "bg-indigo-50/80 text-indigo-900 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800",
    LDPE: "bg-purple-50/80 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800",
    FILLER: "bg-amber-50/80 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
    COLOR: "bg-pink-50/80 text-pink-900 border-pink-200 dark:bg-pink-950/40 dark:text-pink-200 dark:border-pink-800",
  };

  const recipesMap = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const r of materials.recipes || []) m[r.key] = r.components || {};
    return m;
  }, [materials.recipes]);

  const materialAggregates = useMemo(() => {
    const totals: Record<string, number> = {
      HDPE: 0,
      LLDPE: 0,
      LDPE: 0,
      FILLER: 0,
      COLOR: 0,
    };
    let totalKg = 0;
    let orderCount = 0;
    const orders: any[] = materials.orders || [];

    for (const o of orders) {
      if (matStatusFilter !== "all" && o.status !== matStatusFilter) continue;
      const basis =
        o.status === "pending"
          ? o.final_quantity_kg || 0
          : o.status === "cancelled"
            ? 0
            : o.produced_quantity_kg || 0;
      if (basis <= 0 || !o.recipe_key) continue;
      const comps = recipesMap[o.recipe_key];
      if (!comps) continue;
      for (const k of COMPONENT_KEYS) {
        const pct = comps[k] || 0;
        totals[k] += (basis * pct) / 100;
      }
      totalKg += basis;
      orderCount += 1;
    }
    return { totals, totalKg, orderCount };
  }, [materials.orders, recipesMap, matStatusFilter]);

  const formatNum = (n: number = 0) =>
    new Intl.NumberFormat("en-US").format(Math.round(n));
  const formatKg = (n: number = 0) =>
    `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n)} كجم`;

  const sectionPieData = useMemo(
    () =>
      [
        {
          name: "فيلم",
          value: summary.film_kg || 0,
          color: SECTION_COLORS.film,
        },
        {
          name: "طباعة",
          value: summary.printing_kg || 0,
          color: SECTION_COLORS.printing,
        },
        {
          name: "تقطيع",
          value: summary.cutting_kg || 0,
          color: SECTION_COLORS.cutting,
        },
        {
          name: "مكتمل",
          value: summary.done_kg || 0,
          color: SECTION_COLORS.done,
        },
      ].filter((d) => d.value > 0),
    [summary],
  );

  const machineChartData = useMemo(
    () =>
      machinesList.slice(0, 10).map((m: any) => ({
        name: ln(m.name_ar, m.name),
        total: m.total_kg,
      })),
    [machinesList, ln],
  );

  const departmentWorkerCharts = useMemo(() => {
    const build = (kgKey: string) =>
      workersList
        .filter((w: any) => (w[kgKey] || 0) > 0)
        .sort((a: any, b: any) => (b[kgKey] || 0) - (a[kgKey] || 0))
        .slice(0, 10)
        .map((w: any) => ({ name: ln(w.name_ar, w.name), total: w[kgKey] }));
    return {
      film: build("film_kg"),
      printing: build("printing_kg"),
      cutting: build("cutting_kg"),
    };
  }, [workersList, ln]);

  if (isLoading && !dashboard) {
    return (
      <PageLayout
        title="مراقبة الإنتاج"
        description="إحصائيات ومراقبة عمليات الإنتاج"
      >
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-3">
            <Activity className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-500 font-medium">جاري تحميل بيانات المراقبة...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const wastePercent =
    summary.total_kg > 0
      ? ((summary.total_waste_kg / summary.total_kg) * 100).toFixed(1)
      : "0";

  return (
    <PageLayout
      title="مراقبة الإنتاج"
      description="إحصائيات شاملة ومراقبة حية للمكائن والعمال والمواد"
    >
      <div className="space-y-5" dir="rtl">
        {/* شريط الفلاتر والتاريخ */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>فترة المراقبة:</span>
            </div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36 h-9 text-xs font-bold rounded-xl"
            />
            <span className="text-xs text-gray-400">إلى</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36 h-9 text-xs font-bold rounded-xl"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-4 text-xs font-bold rounded-xl gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            تحديث البيانات
          </Button>
        </div>

        {/* بطاقات الإحصائيات الشاملة */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-xs border-r-4 border-r-indigo-600">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-500">إجمالي الإنتاج</span>
              <Target className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">
              {formatKg(summary.total_kg)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs border-r-4 border-r-slate-600">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-500">إجمالي الرولات</span>
              <Package className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {formatNum(summary.total_rolls)} <span className="text-xs font-normal text-gray-400">رول</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-xs border-r-4 border-r-blue-600">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-500">قسم الفيلم</span>
              <Film className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-lg font-black text-blue-700 dark:text-blue-400">
              {formatKg(summary.film_kg)}
            </p>
            <span className="text-[10px] text-gray-400 font-semibold">{summary.film_rolls} رول</span>
          </div>

          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/50 shadow-xs border-r-4 border-r-purple-600">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-500">قسم الطباعة</span>
              <Printer className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-lg font-black text-purple-700 dark:text-purple-400">
              {formatKg(summary.printing_kg)}
            </p>
            <span className="text-[10px] text-gray-400 font-semibold">{summary.printing_rolls} رول</span>
          </div>

          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-xs border-r-4 border-r-amber-600">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-500">قسم التقطيع</span>
              <Scissors className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-lg font-black text-amber-700 dark:text-amber-400">
              {formatKg(summary.cutting_kg)}
            </p>
            <span className="text-[10px] text-gray-400 font-semibold">{summary.cutting_rolls} رول</span>
          </div>

          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/50 shadow-xs border-r-4 border-r-rose-600">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-500">إجمالي الهدر</span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-lg font-black text-rose-600 dark:text-rose-400">
              {formatKg(summary.total_waste_kg)}
            </p>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">
              {wastePercent}% هدر
            </span>
          </div>
        </div>

        {/* تبويبات الشاشة */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl gap-1">
            <TabsTrigger value="overview" className="py-2 text-xs font-bold rounded-xl gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="live-tracking" className="py-2 text-xs font-bold rounded-xl gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-amber-600" />
              <span>تتبع حي</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="py-2 text-xs font-bold rounded-xl gap-1.5">
              <Factory className="w-3.5 h-3.5 text-purple-600" />
              <span>المكائن</span>
            </TabsTrigger>
            <TabsTrigger value="workers" className="py-2 text-xs font-bold rounded-xl gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>العمال</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="py-2 text-xs font-bold rounded-xl gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>المواد الخام</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="py-2 text-xs font-bold rounded-xl gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>المنتجات</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب: نظرة عامة */}
          <TabsContent value="overview" className="space-y-4 mt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="rounded-2xl border shadow-xs">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-900 dark:text-white">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    توزيع الإنتاج حسب المرحلة
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {sectionPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={sectionPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {sectionPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatKg(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-52 text-gray-400 text-xs">
                      لا توجد بيانات متاحة
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border shadow-xs">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-900 dark:text-white">
                    <Factory className="h-4 w-4 text-indigo-600" />
                    أعلى 10 مكائن إنتاجاً
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {machineChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={machineChartData}
                        layout="vertical"
                        margin={{ right: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => formatKg(v)} />
                        <Bar dataKey="total" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-52 text-gray-400 text-xs">
                      لا توجد بيانات متاحة
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* بطاقات العمال لكل قسم */}
              {(
                [
                  { key: "film" as const, label: "أعلى 10 عمال - قسم الفيلم", color: SECTION_COLORS.film },
                  { key: "printing" as const, label: "أعلى 10 عمال - قسم الطباعة", color: SECTION_COLORS.printing },
                  { key: "cutting" as const, label: "أعلى 10 عمال - قسم التقطيع", color: SECTION_COLORS.cutting },
                ]
              ).map((dept) => (
                <Card key={dept.key} className="rounded-2xl border shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-900 dark:text-white">
                      <Users className="h-4 w-4" style={{ color: dept.color }} />
                      {dept.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {departmentWorkerCharts[dept.key].length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                          data={departmentWorkerCharts[dept.key]}
                          layout="vertical"
                          margin={{ right: 20, left: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(v: number) => formatKg(v)} />
                          <Bar dataKey="total" fill={dept.color} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-48 text-gray-400 text-xs">
                        لا توجد بيانات
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* أكثر المنتجات إنتاجاً */}
              <Card className="rounded-2xl border shadow-xs">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-900 dark:text-white">
                    <Award className="h-4 w-4 text-amber-600" />
                    أكثر المنتجات طلباً وإنتاجاً
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {productsList.length > 0 ? (
                    <div className="space-y-3">
                      {productsList.slice(0, 7).map((p: any, i: number) => {
                        const maxKg = productsList[0]?.total_kg || 1;
                        const percent = (p.total_kg / maxKg) * 100;
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-black flex items-center justify-center">
                                  {i + 1}
                                </span>
                                <span className="font-extrabold text-gray-900 dark:text-gray-100">
                                  {ln(p.item_name_ar, p.item_name) || p.size_caption || "غير محدد"}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  ({ln(p.customer_name_ar, p.customer_name)})
                                </span>
                              </div>
                              <span className="font-black text-indigo-600 dark:text-indigo-400">
                                {formatKg(p.total_kg)}
                              </span>
                            </div>
                            <Progress value={percent} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-xs">
                      لا توجد بيانات
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب: التتبع الحي */}
          <TabsContent value="live-tracking" className="mt-2">
            <FloorRollsTracker />
          </TabsContent>

          {/* تبويب: المكائن */}
          <TabsContent value="machines" className="mt-2">
            <Card className="rounded-2xl border shadow-xs overflow-hidden">
              <CardHeader className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Factory className="h-4 w-4 text-purple-600" />
                    إنتاج المكائن التفصيلي
                  </CardTitle>
                  <Badge variant="secondary" className="font-bold">{machinesList.length} ماكينة</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                      <TableHead className="font-black text-xs">الماكينة</TableHead>
                      <TableHead className="font-black text-xs">النوع</TableHead>
                      <TableHead className="font-black text-xs text-center">إجمالي الإنتاج</TableHead>
                      <TableHead className="font-black text-xs text-center">عدد الرولات</TableHead>
                      <TableHead className="font-black text-xs text-center">آخر إنتاج</TableHead>
                      <TableHead className="font-black text-xs text-center">التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machinesList.map((m: any) => {
                      const isExpanded = expandedMachine === m.id;
                      const maxKg = machinesList[0]?.total_kg || 1;
                      return (
                        <MachineRow
                          key={m.id}
                          machine={m}
                          maxKg={maxKg}
                          isExpanded={isExpanded}
                          onToggle={() => setExpandedMachine(isExpanded ? null : m.id)}
                          ln={ln}
                          formatKg={formatKg}
                          formatNum={formatNum}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب: العمال */}
          <TabsContent value="workers" className="mt-2">
            <Card className="rounded-2xl border shadow-xs overflow-hidden">
              <CardHeader className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-600" />
                    إنتاج العمال التفصيلي
                  </CardTitle>
                  <Badge variant="secondary" className="font-bold">{workersList.length} عامل</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                      <TableHead className="font-black text-xs">العامل</TableHead>
                      <TableHead className="font-black text-xs text-center">إجمالي الإنتاج</TableHead>
                      <TableHead className="font-black text-xs text-center">عدد الرولات</TableHead>
                      <TableHead className="font-black text-xs text-center">التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workersList.map((w: any) => {
                      const isExpanded = expandedWorker === w.id;
                      const maxKg = workersList[0]?.total_kg || 1;
                      return (
                        <WorkerRow
                          key={w.id}
                          worker={w}
                          maxKg={maxKg}
                          isExpanded={isExpanded}
                          onToggle={() => setExpandedWorker(isExpanded ? null : w.id)}
                          ln={ln}
                          formatKg={formatKg}
                          formatNum={formatNum}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب: المواد الخام */}
          <TabsContent value="materials" className="mt-2">
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  حسابات المواد الخام المطلوبة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">فلترة الحالة:</span>
                    <Select value={matStatusFilter} onValueChange={setMatStatusFilter}>
                      <SelectTrigger className="w-36 h-9 text-xs font-bold rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="active">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="archived">مؤرشف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span className="text-indigo-600">{formatNum(materialAggregates.orderCount)}</span> أمر إنتاج |{" "}
                    <span className="text-indigo-600">{formatKg(materialAggregates.totalKg)}</span> إجمالي المطلوب
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {COMPONENT_KEYS.map((k) => (
                    <div
                      key={k}
                      className={`rounded-2xl border p-3.5 text-center ${COMPONENT_COLORS[k]} shadow-xs`}
                    >
                      <p className="text-xs font-black mb-1">{k}</p>
                      <p className="text-xl font-black">
                        {formatKg(materialAggregates.totals[k])}
                      </p>
                      <p className="text-[10px] font-bold opacity-75 mt-1">
                        {materialAggregates.totalKg > 0
                          ? ((materialAggregates.totals[k] / materialAggregates.totalKg) * 100).toFixed(1)
                          : 0}
                        % من الإجمالي
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب: المنتجات */}
          <TabsContent value="products" className="mt-2">
            <Card className="rounded-2xl border shadow-xs overflow-hidden">
              <CardHeader className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-600" />
                    ترتيب كافة المنتجات حسب الإنتاج
                  </CardTitle>
                  <Badge variant="secondary" className="font-bold">{productsList.length} منتج</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                      <TableHead className="w-12 text-center font-black text-xs">#</TableHead>
                      <TableHead className="font-black text-xs">المنتج</TableHead>
                      <TableHead className="font-black text-xs">العميل</TableHead>
                      <TableHead className="font-black text-xs">المقاس</TableHead>
                      <TableHead className="font-black text-xs text-center">الإنتاج (كجم)</TableHead>
                      <TableHead className="font-black text-xs text-center">الرولات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsList.map((p: any, i: number) => (
                      <TableRow key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <TableCell className="text-center font-bold text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-black text-xs text-gray-900 dark:text-white">
                          {ln(p.item_name_ar, p.item_name) || "غير محدد"}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-blue-700 dark:text-blue-400">
                          {ln(p.customer_name_ar, p.customer_name)}
                        </TableCell>
                        <TableCell className="text-xs font-bold">{p.size_caption || "-"}</TableCell>
                        <TableCell className="text-center font-black text-xs text-indigo-600 dark:text-indigo-400">
                          {formatKg(p.total_kg)}
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs">{formatNum(p.total_rolls)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

function MachineRow({ machine: m, maxKg, isExpanded, onToggle, ln, formatKg, formatNum }: any) {
  const percent = maxKg > 0 ? (m.total_kg / maxKg) * 100 : 0;
  return (
    <>
      <TableRow className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 cursor-pointer" onClick={onToggle}>
        <TableCell>
          <div className="font-black text-xs text-gray-900 dark:text-white">{ln(m.name_ar, m.name)}</div>
          <div className="text-[10px] text-gray-400 font-mono">{m.id}</div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-[11px] font-bold">{m.type}</Badge>
        </TableCell>
        <TableCell className="text-center">
          <div className="font-black text-xs text-indigo-600 dark:text-indigo-400">{formatKg(m.total_kg)}</div>
          <Progress value={percent} className="h-1 mt-1 w-16 mx-auto" />
        </TableCell>
        <TableCell className="text-center font-bold text-xs">{formatNum(m.total_rolls)}</TableCell>
        <TableCell className="text-center text-xs text-gray-400">
          {m.last_production ? new Date(m.last_production).toLocaleDateString("en-US") : "-"}
        </TableCell>
        <TableCell className="text-center">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-gray-50 dark:bg-gray-800/30 p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-xl text-center border border-blue-200 dark:border-blue-900">
                <span className="text-[11px] font-bold text-blue-700 block">فيلم</span>
                <span className="text-sm font-black text-blue-900 dark:text-blue-100">{formatKg(m.film_kg)}</span>
              </div>
              <div className="bg-purple-50/70 dark:bg-purple-950/40 p-2.5 rounded-xl text-center border border-purple-200 dark:border-purple-900">
                <span className="text-[11px] font-bold text-purple-700 block">طباعة</span>
                <span className="text-sm font-black text-purple-900 dark:text-purple-100">{formatKg(m.printing_kg)}</span>
              </div>
              <div className="bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded-xl text-center border border-amber-200 dark:border-amber-900">
                <span className="text-[11px] font-bold text-amber-700 block">تقطيع</span>
                <span className="text-sm font-black text-amber-900 dark:text-amber-100">{formatKg(m.cutting_kg)}</span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function WorkerRow({ worker: w, maxKg, isExpanded, onToggle, ln, formatKg, formatNum }: any) {
  const percent = maxKg > 0 ? (w.total_kg / maxKg) * 100 : 0;
  return (
    <>
      <TableRow className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 cursor-pointer" onClick={onToggle}>
        <TableCell>
          <div className="font-black text-xs text-gray-900 dark:text-white">{ln(w.name_ar, w.name)}</div>
        </TableCell>
        <TableCell className="text-center">
          <div className="font-black text-xs text-teal-600 dark:text-teal-400">{formatKg(w.total_kg)}</div>
          <Progress value={percent} className="h-1 mt-1 w-16 mx-auto" />
        </TableCell>
        <TableCell className="text-center font-bold text-xs">{formatNum(w.total_rolls)}</TableCell>
        <TableCell className="text-center">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={4} className="bg-gray-50 dark:bg-gray-800/30 p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-xl text-center border border-blue-200 dark:border-blue-900">
                <span className="text-[11px] font-bold text-blue-700 block">فيلم</span>
                <span className="text-sm font-black text-blue-900 dark:text-blue-100">{formatKg(w.film_kg)}</span>
              </div>
              <div className="bg-purple-50/70 dark:bg-purple-950/40 p-2.5 rounded-xl text-center border border-purple-200 dark:border-purple-900">
                <span className="text-[11px] font-bold text-purple-700 block">طباعة</span>
                <span className="text-sm font-black text-purple-900 dark:text-purple-100">{formatKg(w.printing_kg)}</span>
              </div>
              <div className="bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded-xl text-center border border-amber-200 dark:border-amber-900">
                <span className="text-[11px] font-bold text-amber-700 block">تقطيع</span>
                <span className="text-sm font-black text-amber-900 dark:text-amber-100">{formatKg(w.cutting_kg)}</span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}