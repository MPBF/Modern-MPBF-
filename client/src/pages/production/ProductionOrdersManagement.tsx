import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Loader2,
  Printer,
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Factory,
  TrendingUp,
  RefreshCw,
  Eye,
  Play,
  Tag,
  Ruler,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

import BatchLabelDialog from "../../components/production/BatchLabelDialog";
import ProductionOrderStatsCard from "../../components/production/ProductionOrderStatsCard";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { formatNumberAr } from "../../../../shared/number-utils";
import { useSmartPolling } from "../../hooks/use-smart-polling";
import { useAuth } from "../../hooks/use-auth";
import { useLocalizedName } from "../../hooks/use-localized-name";

const STAGE_KEYS = ["film", "printing", "cutting", "done"] as const;
type StageKey = (typeof STAGE_KEYS)[number];

const STAGE_BADGE_CLASSES: Record<StageKey, string> = {
  film: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0",
  printing: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-0",
  cutting: "bg-amber-100 text-amber-700 dark:bg-orange-950 dark:text-orange-300 border-0",
  done: "bg-emerald-100 text-emerald-700 dark:bg-green-950 dark:text-green-300 border-0",
};

const STAGE_CARD_BORDERS: Record<StageKey, string> = {
  film: "border-r-blue-600",
  printing: "border-r-purple-600",
  cutting: "border-r-amber-600",
  done: "border-r-emerald-600",
};

function formatKg(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ProductionOrdersManagement() {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const { user } = useAuth();
  const [showStats, setShowStats] = useState<number | null>(null);
  const [printingProductionOrder, setPrintingProductionOrder] =
    useState<any>(null);
  const [batchLabelOrderId, setBatchLabelOrderId] = useState<number | null>(
    null,
  );
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const search = params.get("search");
      if (search) {
        setSearchTerm(search);
        setStatusFilter("all");
      }
      const poId = params.get("po");
      if (poId) {
        const parsed = parseInt(poId, 10);
        if (Number.isFinite(parsed)) {
          setShowStats(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [location]);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["/api/production-orders"],
    queryFn: async () => {
      const response = await fetch("/api/production-orders");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || t("production.ordersManagement.noProductionOrders"),
        );
      }
      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
    },
  });

  const filteredOrders = useMemo(() => {
    const orders = Array.isArray(ordersData)
      ? ordersData
      : ordersData?.data || [];
    return orders.filter((order: any) => {
      if (order.status === "archived") return false;
      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          order.production_order_number?.toLowerCase().includes(searchLower) ||
          order.order_number?.toLowerCase().includes(searchLower) ||
          order.customer_name?.toLowerCase().includes(searchLower) ||
          order.customer_name_ar?.toLowerCase().includes(searchLower) ||
          order.size_caption?.toLowerCase().includes(searchLower) ||
          order.item_name?.toLowerCase().includes(searchLower) ||
          order.item_name_ar?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [ordersData, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const allOrders = Array.isArray(ordersData)
      ? ordersData
      : ordersData?.data || [];
    const orders = allOrders.filter((o: any) => o.status !== "archived");
    const pending = orders.filter((o: any) => o.status === "pending").length;
    const active = orders.filter(
      (o: any) => o.status === "active" || o.status === "in_production",
    ).length;
    const completed = orders.filter((o: any) => o.status === "completed").length;
    const cancelled = orders.filter((o: any) => o.status === "cancelled").length;
    const total = orders.length;

    const totalQuantity = orders.reduce(
      (sum: number, o: any) => sum + parseFloat(o.quantity_kg || 0),
      0,
    );

    return {
      pending,
      active,
      completed,
      cancelled,
      total,
      totalQuantity,
    };
  }, [ordersData]);

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { icon: any; color: string; bg: string; label: string }
    > = {
      pending: {
        icon: Clock,
        color: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-100 dark:bg-amber-950/60",
        label: t("production.status.pending"),
      },
      active: {
        icon: Play,
        color: "text-emerald-700 dark:text-emerald-300",
        bg: "bg-emerald-100 dark:bg-emerald-950/60",
        label: t("production.status.active"),
      },
      in_production: {
        icon: Factory,
        color: "text-blue-700 dark:text-blue-300",
        bg: "bg-blue-100 dark:bg-blue-950/60",
        label: t("production.status.inProduction"),
      },
      completed: {
        icon: CheckCircle2,
        color: "text-slate-700 dark:text-slate-300",
        bg: "bg-slate-100 dark:bg-slate-800",
        label: t("production.status.completed"),
      },
      cancelled: {
        icon: XCircle,
        color: "text-rose-700 dark:text-rose-300",
        bg: "bg-rose-100 dark:bg-rose-950/60",
        label: t("production.status.cancelled"),
      },
    };
    return configs[status] || configs.pending;
  };

  const getProgressPercentage = (order: any) => {
    const quantity = parseFloat(
      order.final_quantity_kg || order.quantity_kg || 0,
    );
    const produced = parseFloat(
      order.produced_quantity_kg || order.produced_kg || 0,
    );
    if (quantity === 0) return 0;
    return Math.min(100, Math.round((produced / quantity) * 100));
  };

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-bold text-gray-500">
            {t("production.loadingOrders")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      <Tabs defaultValue="orders" className="space-y-5">
        <TabsList className="grid grid-cols-2 w-full md:w-auto h-12 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <TabsTrigger value="orders" data-testid="tab-orders" className="rounded-xl font-bold text-xs h-10">
            {t("production.productionStages.ordersTab")}
          </TabsTrigger>
          <TabsTrigger value="stages" data-testid="tab-production-stages" className="rounded-xl font-bold text-xs h-10">
            {t("production.productionStages.tabTitle")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-5 mt-0">
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-xs border-r-4 border-r-amber-500">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                {t("production.status.pending")}
              </span>
              <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-xs border-r-4 border-r-emerald-500">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                {t("production.status.inExecution")}
              </span>
              <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-xs border-r-4 border-r-blue-500">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                {t("production.status.completedFem")}
              </span>
              <p className="text-2xl font-black text-blue-600">{stats.completed}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/50 shadow-xs border-r-4 border-r-purple-500">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                {t("production.totalQuantity")}
              </span>
              <p className="text-xl font-black text-purple-600 truncate">
                {stats.totalQuantity.toLocaleString("en-US")} {t("production.kg")}
              </p>
            </div>
          </div>

          {/* شريط البحث والفلترة */}
          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث برقم أمر الإنتاج، الطلب، العميل، أو المقاس..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 h-10 text-xs font-bold rounded-xl"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-10 text-xs font-bold rounded-xl">
                <SelectValue placeholder={t("production.statusLabel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("production.allStatuses")}</SelectItem>
                <SelectItem value="pending">{t("production.status.pending")}</SelectItem>
                <SelectItem value="active">{t("production.status.active")}</SelectItem>
                <SelectItem value="in_production">{t("production.status.inProduction")}</SelectItem>
                <SelectItem value="completed">{t("production.status.completed")}</SelectItem>
                <SelectItem value="cancelled">{t("production.status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-10 w-10 rounded-xl flex-shrink-0"
              title="تحديث"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* العرض في الجوال (Cards List) */}
          <div className="block lg:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <Card className="p-8 text-center rounded-2xl border-dashed">
                <Package className="h-10 w-10 text-gray-400 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold text-gray-500">{t("production.noOrders")}</p>
              </Card>
            ) : (
              filteredOrders.map((order: any) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                const progress = getProgressPercentage(order);
                const stage = (order.production_stage || "film") as StageKey;

                return (
                  <Card key={order.id} className="rounded-2xl border shadow-xs overflow-hidden p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {order.production_order_number}
                          </span>
                          <span className="text-xs font-semibold text-gray-400">
                            #{order.order_number}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                          {ln(order.customer_name_ar, order.customer_name)}
                        </h3>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-0.5">
                          {ln(order.item_name_ar, order.item_name) || order.size_caption}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0 text-[10px] font-bold`}>
                          <StatusIcon className="h-3 w-3 ml-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge className={`${STAGE_BADGE_CLASSES[stage]} text-[10px] font-bold`}>
                          {t(`production.stages.${stage}`)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">الكمية المطلوبة</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {order.quantity_kg} كجم
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">النهائية</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {order.final_quantity_kg || order.quantity_kg} كجم
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">الإنجاز</span>
                        <span className="font-bold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 rounded-full" />
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowStats(showStats === order.id ? null : order.id)}
                        className="h-8 text-xs font-bold gap-1 rounded-xl"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        التفاصيل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrintingProductionOrder(order)}
                        className="h-8 text-xs font-bold gap-1 rounded-xl text-blue-600 border-blue-200"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        طباعة A4
                      </Button>
                      {(order.production_stage === "done" || order.status === "completed") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setBatchLabelOrderId(order.id)}
                          className="h-8 text-xs font-bold gap-1 rounded-xl text-emerald-600 border-emerald-200"
                        >
                          <Tag className="h-3.5 w-3.5" />
                          الملصق
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* العرض في الكمبيوتر (Table) */}
          <div className="hidden lg:block">
            <Card className="rounded-2xl border shadow-xs overflow-hidden">
              <CardHeader className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    {t("production.productionOrders")}
                  </CardTitle>
                  <Badge variant="secondary" className="font-bold">{filteredOrders.length} أمر</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                      <TableHead className="font-black text-xs">أمر الإنتاج</TableHead>
                      <TableHead className="font-black text-xs">الطلب</TableHead>
                      <TableHead className="font-black text-xs">العميل</TableHead>
                      <TableHead className="font-black text-xs">المنتج / المقاس</TableHead>
                      <TableHead className="font-black text-xs text-center">الكمية</TableHead>
                      <TableHead className="font-black text-xs text-center">الإنجاز</TableHead>
                      <TableHead className="font-black text-xs text-center">الحالة</TableHead>
                      <TableHead className="font-black text-xs text-center">المرحلة</TableHead>
                      <TableHead className="font-black text-xs text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-gray-400 text-xs">
                          {t("production.noOrders")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order: any) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;
                        const progress = getProgressPercentage(order);
                        const stage = (order.production_stage || "film") as StageKey;

                        return (
                          <TableRow key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                            <TableCell className="font-black text-xs text-blue-700 dark:text-blue-400">
                              {order.production_order_number}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 font-mono">
                              {order.order_number}
                            </TableCell>
                            <TableCell className="font-extrabold text-xs text-gray-900 dark:text-white">
                              {ln(order.customer_name_ar, order.customer_name)}
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className="font-bold block">
                                {ln(order.item_name_ar, order.item_name) || order.size_caption}
                              </span>
                              {order.size_caption && order.item_name && (
                                <span className="text-[11px] text-gray-400">{order.size_caption}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center text-xs">
                              <span className="font-black block">{order.quantity_kg} كجم</span>
                              <span className="text-[10px] text-gray-400">
                                نهائي: {order.final_quantity_kg || order.quantity_kg}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="w-20 mx-auto space-y-1">
                                <Progress value={progress} className="h-1.5" />
                                <span className="text-[10px] text-gray-400 block font-bold">{progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0 text-[10px] font-bold`}>
                                <StatusIcon className="h-3 w-3 ml-1" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${STAGE_BADGE_CLASSES[stage]} text-[10px] font-bold`}>
                                {t(`production.stages.${stage}`)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setShowStats(showStats === order.id ? null : order.id)}
                                  className="h-8 w-8 p-0"
                                  title={t("production.viewDetails")}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setPrintingProductionOrder(order)}
                                  className="h-8 w-8 p-0 text-blue-600"
                                  title={t("production.print")}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                {(order.production_stage === "done" || order.status === "completed") && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setBatchLabelOrderId(order.id)}
                                    className="h-8 w-8 p-0 text-emerald-600"
                                    title={t("batch.printLabelTitle")}
                                  >
                                    <Tag className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stages" className="space-y-5 mt-0">
          <ProductionStagesTab />
        </TabsContent>
      </Tabs>

      {/* لوحة التفاصيل السريعة */}
      {showStats && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <ProductionOrderStatsCard productionOrderId={showStats} />
        </div>
      )}

      {/* نافذة طباعة تقرير أمر الإنتاج A4 */}
      {printingProductionOrder && (
        <PrintProductionOrderWrapper
          productionOrder={printingProductionOrder}
          onClose={() => setPrintingProductionOrder(null)}
        />
      )}

      {/* نافذة ملصق الدفعة */}
      <BatchLabelDialog
        productionOrderId={batchLabelOrderId}
        onClose={() => setBatchLabelOrderId(null)}
      />
    </div>
  );
}

function PrintProductionOrderWrapper({
  productionOrder,
  onClose,
}: {
  productionOrder: any;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { data: rollsData, isLoading: rollsLoading } = useQuery({
    queryKey: ["/api/rolls/search"],
    queryFn: async () => {
      const response = await fetch("/api/rolls/search?q=");
      if (!response.ok) throw new Error("Failed to fetch rolls");
      return response.json();
    },
  });

  useEffect(() => {
    if (rollsLoading || !rollsData) return;

    const rolls = rollsData.filter(
      (r: any) => r.production_order_id === productionOrder.id,
    );

    const getStageLabel = (stage: string) => {
      const labels: Record<string, string> = {
        film: t("production.stages.film"),
        printing: t("production.stages.printing"),
        cutting: t("production.stages.cutting"),
        done: t("production.stages.done"),
        archived: t("production.stages.archived"),
      };
      return labels[stage] || stage;
    };

    const getStatusLabel = (status: string) => {
      const labels: Record<string, string> = {
        pending: t("production.status.pending"),
        active: t("production.status.active"),
        in_production: t("production.status.inProduction"),
        completed: t("production.status.completed"),
        cancelled: t("production.status.cancelled"),
      };
      return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        pending: "#f59e0b",
        active: "#22c55e",
        in_production: "#3b82f6",
        completed: "#6b7280",
        cancelled: "#ef4444",
        archived: "#9ca3af",
      };
      return colors[status] || "#6b7280";
    };

    const filmRolls = rolls.filter((r: any) => r.stage === "film");
    const printingRolls = rolls.filter((r: any) => r.stage === "printing");
    const cuttingRolls = rolls.filter((r: any) => r.stage === "cutting");
    const doneRolls = rolls.filter(
      (r: any) => r.stage === "done" || r.stage === "archived",
    );

    const totalWeight = rolls.reduce(
      (sum: number, r: any) => sum + parseFloat(r.weight_kg || 0),
      0,
    );
    const targetWeight = parseFloat(productionOrder.quantity_kg || 0);
    const progress =
      targetWeight > 0 ? Math.min(100, (totalWeight / targetWeight) * 100) : 0;

    const uniqueOperators = new Set<string>();
    rolls.forEach((r: any) => {
      if (r.created_by_name) uniqueOperators.add(r.created_by_name);
      if (r.printed_by_name) uniqueOperators.add(r.printed_by_name);
      if (r.cut_by_name) uniqueOperators.add(r.cut_by_name);
    });

    const uniqueMachines = new Set<string>();
    rolls.forEach((r: any) => {
      if (r.film_machine_name)
        uniqueMachines.add(
          `${t("production.stages.film")}: ${r.film_machine_name}`,
        );
      if (r.printing_machine_name)
        uniqueMachines.add(
          `${t("production.stages.printing")}: ${r.printing_machine_name}`,
        );
      if (r.cutting_machine_name)
        uniqueMachines.add(
          `${t("production.stages.cutting")}: ${r.cutting_machine_name}`,
        );
    });

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert(t("production.allowPopups"));
      onClose();
      return;
    }

    const printHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${t("production.printTemplate.productionOrder")} - ${productionOrder.production_order_number}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; background: #f5f5f5; padding: 20px; }
          .print-container { max-width: 210mm; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
          .header-right h1 { font-size: 24px; margin-bottom: 5px; }
          .header-right p { font-size: 12px; opacity: 0.8; }
          .order-number { background: white; color: #1e3a5f; padding: 10px 20px; border-radius: 8px; font-size: 18px; font-weight: bold; }
          .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; color: white; }
          .content { padding: 20px; }
          .info-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
          .info-box.highlight { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-color: #f59e0b; }
          .info-label { font-size: 11px; color: #64748b; margin-bottom: 5px; font-weight: 600; }
          .info-value { font-size: 16px; font-weight: bold; color: #1e293b; }
          .section-title { font-size: 16px; font-weight: bold; color: #1e3a5f; padding: 10px 15px; background: #f1f5f9; border-right: 4px solid #1e3a5f; margin: 20px 0 15px; border-radius: 0 8px 8px 0; }
          .workflow-container { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
          .workflow-stage { flex: 1; text-align: center; padding: 15px; border-radius: 10px; position: relative; }
          .workflow-stage.film { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; }
          .workflow-stage.printing { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border: 2px solid #a855f7; }
          .workflow-stage.cutting { background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%); border: 2px solid #f97316; }
          .workflow-stage.done { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 2px solid #22c55e; }
          .stage-icon { font-size: 28px; margin-bottom: 8px; }
          .stage-name { font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 5px; }
          .stage-count { font-size: 24px; font-weight: bold; }
          .stage-weight { font-size: 12px; color: #64748b; margin-top: 5px; }
          .progress-bar { height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 15px 0; position: relative; }
          .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); border-radius: 10px; transition: width 0.3s; }
          .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: bold; color: #1e293b; }
          .rolls-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .rolls-table th { background: #1e3a5f; color: white; padding: 10px 8px; text-align: right; }
          .rolls-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          .rolls-table tr:nth-child(even) { background: #f8fafc; }
          .rolls-table tr:hover { background: #f1f5f9; }
          .stage-film { color: #3b82f6; }
          .stage-printing { color: #a855f7; }
          .stage-cutting { color: #f97316; }
          .stage-done { color: #22c55e; }
          .team-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
          .team-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
          .team-box h4 { font-size: 14px; color: #1e3a5f; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
          .team-list { font-size: 13px; color: #475569; line-height: 1.8; }
          .footer { background: #f8fafc; padding: 15px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e5e7eb; }
          .print-btn { position: fixed; top: 20px; left: 20px; padding: 12px 24px; background: #1e3a5f; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
          .print-btn:hover { background: #2d5a87; }
          @media print {
            .print-btn { display: none; }
            body { background: white; padding: 0; }
            .print-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ ${t("production.print")}</button>
        <div class="print-container">
          <div class="header">
            <div class="header-right">
              <h1>${t("production.printTemplate.productionOrder")}</h1>
              <p>${t("production.printTemplate.factoryName")}</p>
            </div>
            <div class="order-number">${productionOrder.production_order_number}</div>
            <div>
              <div class="status-badge" style="background: ${getStatusColor(productionOrder.status)}">
                ${getStatusLabel(productionOrder.status)}
              </div>
            </div>
          </div>

          <div class="content">
            <div class="info-section">
              <div class="info-box">
                <div class="info-label">${t("production.table.orderNumber")}</div>
                <div class="info-value">${productionOrder.order_number || "-"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">${t("production.table.customer")}</div>
                <div class="info-value">${productionOrder.customer_name_ar || productionOrder.customer_name || "-"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">${t("production.table.product")}</div>
                <div class="info-value">${productionOrder.item_name_ar || productionOrder.item_name || "-"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">${t("production.printTemplate.size")}</div>
                <div class="info-value">${productionOrder.size_caption || "-"}</div>
              </div>
              <div class="info-box highlight">
                <div class="info-label">${t("production.printTemplate.requiredQuantity")}</div>
                <div class="info-value">${formatNumberAr(targetWeight, 2)} ${t("production.kg")}</div>
              </div>
              <div class="info-box">
                <div class="info-label">${t("production.printTemplate.creationDate")}</div>
                <div class="info-value">${productionOrder.created_at ? new Date(productionOrder.created_at).toLocaleDateString("en-US") : "-"}</div>
              </div>
            </div>

            <div class="section-title">📊 ${t("production.printTemplate.workflowAndStages")}</div>
            <div class="workflow-container">
              <div class="workflow-stage film">
                <div class="stage-icon">🎬</div>
                <div class="stage-name">${t("production.printTemplate.filmStage")}</div>
                <div class="stage-count stage-film">${filmRolls.length} ${t("production.printTemplate.roll")}</div>
                <div class="stage-weight">${formatNumberAr(filmRolls.reduce((s: number, r: any) => s + parseFloat(r.weight_kg || 0), 0), 2)} ${t("production.kg")}</div>
              </div>
              <div class="workflow-stage printing">
                <div class="stage-icon">🖨️</div>
                <div class="stage-name">${t("production.printTemplate.printingStage")}</div>
                <div class="stage-count stage-printing">${printingRolls.length} ${t("production.printTemplate.roll")}</div>
                <div class="stage-weight">${formatNumberAr(printingRolls.reduce((s: number, r: any) => s + parseFloat(r.weight_kg || 0), 0), 2)} ${t("production.kg")}</div>
              </div>
              <div class="workflow-stage cutting">
                <div class="stage-icon">✂️</div>
                <div class="stage-name">${t("production.printTemplate.cuttingStage")}</div>
                <div class="stage-count stage-cutting">${cuttingRolls.length} ${t("production.printTemplate.roll")}</div>
                <div class="stage-weight">${formatNumberAr(cuttingRolls.reduce((s: number, r: any) => s + parseFloat(r.weight_kg || 0), 0), 2)} ${t("production.kg")}</div>
              </div>
              <div class="workflow-stage done">
                <div class="stage-icon">✅</div>
                <div class="stage-name">${t("production.stages.done")}</div>
                <div class="stage-count stage-done">${doneRolls.length} ${t("production.printTemplate.roll")}</div>
                <div class="stage-weight">${formatNumberAr(doneRolls.reduce((s: number, r: any) => s + parseFloat(r.weight_kg || 0), 0), 2)} ${t("production.kg")}</div>
              </div>
            </div>

            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
              <div class="progress-text">${progress.toFixed(1)}% (${formatNumberAr(totalWeight, 2)} / ${formatNumberAr(targetWeight, 2)} ${t("production.kg")})</div>
            </div>

            ${
              rolls.length > 0
                ? `
              <div class="section-title">📦 ${t("production.printTemplate.rollsList")} (${rolls.length} ${t("production.printTemplate.roll")})</div>
              <table class="rolls-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>${t("production.printTemplate.rollNumber")}</th>
                    <th>${t("production.printTemplate.stage")}</th>
                    <th>${t("production.printTemplate.weight")}</th>
                    <th>${t("production.printTemplate.filmBy")}</th>
                    <th>${t("production.printTemplate.printedBy")}</th>
                    <th>${t("production.printTemplate.cutBy")}</th>
                    <th>${t("production.printTemplate.productionDate")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rolls
                    .map(
                      (roll: any, index: number) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td><strong>${roll.roll_number}</strong></td>
                      <td class="stage-${roll.stage}"><strong>${getStageLabel(roll.stage)}</strong></td>
                      <td>${formatNumberAr(parseFloat(roll.weight_kg || 0), 2)} ${t("production.kg")}</td>
                      <td>${roll.created_by_name || "-"}</td>
                      <td>${roll.printed_by_name || "-"}</td>
                      <td>${roll.cut_by_name || "-"}</td>
                      <td>${roll.created_at ? new Date(roll.created_at).toLocaleDateString("en-US") : "-"}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : `<p style="text-align:center;color:#64748b;padding:20px;">${t("production.printTemplate.noRollsYet")}</p>`
            }

            <div class="team-section">
              <div class="team-box">
                <h4>👷 ${t("production.printTemplate.participatingWorkers")}</h4>
                <div class="team-list">
                  ${uniqueOperators.size > 0 ? Array.from(uniqueOperators).join(" • ") : t("production.printTemplate.noRegisteredWorkers")}
                </div>
              </div>
              <div class="team-box">
                <h4>🏭 ${t("production.printTemplate.usedMachines")}</h4>
                <div class="team-list">
                  ${uniqueMachines.size > 0 ? Array.from(uniqueMachines).join(" • ") : t("production.printTemplate.noRegisteredMachines")}
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            ${t("production.printTemplate.printedAt")}: ${new Date().toLocaleString("en-US")} | ${t("production.printTemplate.productionManagementSystem")}
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

    onClose();
  }, [rollsData, rollsLoading, productionOrder, onClose]);

  if (rollsLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs font-bold text-gray-700">{t("production.loadingData")}</p>
        </div>
      </div>
    );
  }

  return null;
}

const STAGE_ICONS: Record<StageKey, any> = {
  film: Factory,
  printing: Printer,
  cutting: Package,
  done: CheckCircle2,
};

function ProductionStagesTab() {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const [selectedStage, setSelectedStage] = useState<"all" | StageKey>("all");
  const summaryPolling = useSmartPolling(60_000);

  const { data: summary, isLoading: summaryLoading } = useQuery<
    Array<{
      stage: string;
      count: number;
      remaining_kg: number;
      target_kg: number;
      produced_kg: number;
    }>
  >({
    queryKey: ["/api/production-orders/stages-summary"],
    refetchInterval: summaryPolling,
  });

  const stageFilter =
    selectedStage === "all" ? "" : `?production_stage=${selectedStage}`;

  const { data: ordersData, isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/production-orders", { production_stage: selectedStage }],
    queryFn: async () => {
      const res = await fetch(`/api/production-orders${stageFilter}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const r = await res.json();
      return Array.isArray(r) ? r : r.data || [];
    },
  });

  const summaryByStage = useMemo(() => {
    const map: Record<StageKey, { count: number; remaining_kg: number }> = {
      film: { count: 0, remaining_kg: 0 },
      printing: { count: 0, remaining_kg: 0 },
      cutting: { count: 0, remaining_kg: 0 },
      done: { count: 0, remaining_kg: 0 },
    };
    summary?.forEach((s) => {
      if ((STAGE_KEYS as readonly string[]).includes(s.stage)) {
        map[s.stage as StageKey] = {
          count: s.count,
          remaining_kg: s.remaining_kg,
        };
      }
    });
    return map;
  }, [summary]);

  return (
    <div className="space-y-5">
      {/* بطاقات ملخص المراحل */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAGE_KEYS.map((stage) => {
          const Icon = STAGE_ICONS[stage];
          const data = summaryByStage[stage];
          return (
            <div
              key={stage}
              className={`bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs border-r-4 ${STAGE_CARD_BORDERS[stage]}`}
              data-testid={`card-stage-${stage}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500">
                  {t(`production.stages.${stage}`)}
                </span>
                <Icon className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {summaryLoading ? "…" : data.count}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                {t("production.productionStages.remainingKg", {
                  kg: formatKg(data.remaining_kg),
                })}
              </p>
            </div>
          );
        })}
      </div>

      {/* فلاتر المرحلة */}
      <Tabs
        value={selectedStage}
        onValueChange={(v) => setSelectedStage(v as "all" | StageKey)}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-5 w-full md:w-auto h-10 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <TabsTrigger value="all" data-testid="stage-filter-all" className="text-xs font-bold rounded-lg">
            {t("production.productionStages.all")}
          </TabsTrigger>
          {STAGE_KEYS.map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              data-testid={`stage-filter-${s}`}
              className="text-xs font-bold rounded-lg"
            >
              {t(`production.stages.${s}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedStage} className="mt-0">
          <Card className="rounded-2xl border shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  {t("production.productionOrders")}
                </CardTitle>
                <Badge variant="secondary" className="font-bold">{ordersData?.length ?? 0} أمر</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                      <TableHead className="font-black text-xs">{t("production.table.productionOrderNumber")}</TableHead>
                      <TableHead className="font-black text-xs">{t("production.table.orderNumber")}</TableHead>
                      <TableHead className="font-black text-xs">{t("production.table.customer")}</TableHead>
                      <TableHead className="font-black text-xs">{t("production.table.product")}</TableHead>
                      <TableHead className="font-black text-xs text-center">{t("production.productionStages.currentStage")}</TableHead>
                      <TableHead className="font-black text-xs text-center">{t("production.productionStages.requestedQuantity")}</TableHead>
                      <TableHead className="font-black text-xs text-center">{t("production.productionStages.producedQuantity")}</TableHead>
                      <TableHead className="font-black text-xs text-center">{t("production.productionStages.remainingInStage")}</TableHead>
                      <TableHead className="font-black text-xs text-center">{t("production.productionStages.overallProgress")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                        </TableCell>
                      </TableRow>
                    ) : !ordersData || ordersData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-gray-400 text-xs">
                          {t("production.productionStages.noOrdersInStage")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      ordersData.map((order: any) => {
                        const stage = (order.production_stage || "film") as StageKey;
                        const requested = parseFloat(order.final_quantity_kg || order.quantity_kg || "0");
                        const produced = parseFloat(order.produced_quantity_kg || "0");
                        const remaining = Math.max(0, requested - produced);
                        const progress = requested > 0 ? Math.min(100, Math.round((produced / requested) * 100)) : 0;

                        return (
                          <TableRow key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                            <TableCell className="font-black text-xs text-blue-700 dark:text-blue-400">
                              {order.production_order_number}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-500">
                              {order.order_number}
                            </TableCell>
                            <TableCell className="font-extrabold text-xs text-gray-900 dark:text-white">
                              {ln(order.customer_name_ar, order.customer_name)}
                            </TableCell>
                            <TableCell className="text-xs font-bold">
                              {order.size_caption || ln(order.item_name_ar, order.item_name)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${STAGE_BADGE_CLASSES[stage]} text-[10px] font-bold`}>
                                {t(`production.stages.${stage}`)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold text-xs">
                              {formatKg(requested)} كجم
                            </TableCell>
                            <TableCell className="text-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
                              {formatKg(produced)} كجم
                            </TableCell>
                            <TableCell className="text-center font-bold text-xs text-amber-600 dark:text-amber-400">
                              {formatKg(remaining)} كجم
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="w-20 mx-auto space-y-1">
                                <Progress value={progress} className="h-1.5" />
                                <span className="text-[10px] text-gray-400 font-bold block">{progress}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}