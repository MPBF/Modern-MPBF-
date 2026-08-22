import { useQuery } from "@tanstack/react-query";
import {
  Package,
  PackageCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Flag,
  Loader2,
  Info,
  Printer,
  User,
  Beaker,
  Target,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";
import PageLayout from "../../components/layout/PageLayout";
import RollCreationModalEnhanced from "../../components/modals/RollCreationModalEnhanced";
import BatchLabelDialog from "../../components/production/BatchLabelDialog";
import FilmMaterialMixingTab from "../../components/production/FilmMaterialMixingTab";
import {
  OrderGroupCard,
  BackToOrdersBar,
  OrdersListHeader,
  groupByOrderNumber,
} from "../../components/production/OrderGroupCard";
import { OperatorStatCard } from "../../components/production/OperatorStatCard";
import { printRollLabel } from "../../components/production/RollLabelPrint";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useSmartPolling } from "../../hooks/use-smart-polling";
import { useLocalizedName } from "../../hooks/use-localized-name";

// "الرول الأخير" (آخر رول) يظهر فقط عندما تكون الكمية المتبقية من مرحلة
// الفيلم 15% أو أقل من الكمية المطلوبة لأمر الإنتاج.
const FINAL_ROLL_MAX_REMAINING_PERCENT = 15;

interface ActiveProductionOrderDetails {
  id: number;
  production_order_number: string;
  order_id: number;
  customer_product_id: number;
  quantity_kg: string | number;
  final_quantity_kg: string | number;
  produced_quantity_kg?: string | number;
  status: string;
  created_at: string;
  order_number: string;
  order_date?: string;
  customer_name: string;
  customer_name_ar?: string;
  customer_name_en?: string;
  sales_rep_name?: string;
  sales_rep_name_ar?: string;
  sales_rep_name_en?: string;
  product_name: string;
  product_name_ar?: string;
  product_name_en?: string;
  rolls_count: number;
  total_weight_produced: string | number;
  remaining_quantity: string | number;
  is_final_roll_created: boolean;
  film_completed?: boolean;
  production_start_time?: string;
  production_end_time?: string;
  production_time_minutes?: number;
  category_id?: string;
  category_name?: string;
  size_caption?: string;
  raw_material?: string;
  thickness?: string;
  master_batch_id?: string;
  master_batch_name?: string;
  master_batch_name_ar?: string;
  master_batch_name_en?: string;
  master_batch_color_hex?: string;
  overrun_percentage?: string | number;
}

interface Roll {
  id: number;
  roll_number: string;
  roll_seq: number;
  weight_kg: number | string;
  status: string;
  created_by_name?: string;
  created_at?: string;
  production_order_id: number;
  production_order_number?: string;
  machine_id?: string;
  film_machine_id?: string;
  film_machine_name?: string;
  qr_code_text?: string;
  qr_png_base64?: string;
}

interface FilmOperatorDashboardProps {
  hideLayout?: boolean;
}

export default function FilmOperatorDashboard({
  hideLayout = false,
}: FilmOperatorDashboardProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const ln = useLocalizedName();
  const [selectedProductionOrder, setSelectedProductionOrder] =
    useState<ActiveProductionOrderDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinalRoll, setIsFinalRoll] = useState(false);
  const [batchOrderId, setBatchOrderId] = useState<number | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(
    null,
  );
  const ordersPolling = useSmartPolling(45_000);
  const rollsPolling = useSmartPolling(60_000);

  const { data: productionOrders = [], isLoading } = useQuery<
    ActiveProductionOrderDetails[]
  >({
    queryKey: ["/api/production-orders/active-for-operator"],
    refetchInterval: ordersPolling,
  });

  const { data: allRolls = [] } = useQuery<Roll[]>({
    queryKey: ["/api/rolls", { limit: 500 }],
    refetchInterval: rollsPolling,
  });

  const handleCreateRoll = (
    order: ActiveProductionOrderDetails,
    final: boolean = false,
  ) => {
    setSelectedProductionOrder(order);
    setIsFinalRoll(final);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductionOrder(null);
    setIsFinalRoll(false);
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handlePrintLabel = async (roll: Roll) => {
    try {
      const response = await fetch(`/api/rolls/${roll.id}/label`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const labelData = await response.json();

      if (!labelData || !labelData.roll) {
        throw new Error("Invalid label data received");
      }

      printRollLabel({
        roll: labelData.roll,
        productionOrder: labelData.productionOrder,
        order: labelData.order,
      });
    } catch (error) {
      console.error("Error printing label:", error);
      alert(
        `${t("operators.common.printLabelError")}: ${error instanceof Error ? error.message : t("operators.common.unknownError")}`,
      );
    }
  };

  const stats = {
    totalOrders: productionOrders.length,
    totalRequired: productionOrders.reduce(
      (sum: number, order: ActiveProductionOrderDetails) =>
        sum + Number(order.final_quantity_kg || order.quantity_kg || 0),
      0,
    ),
    totalProduced: productionOrders.reduce(
      (sum: number, order: ActiveProductionOrderDetails) =>
        sum + Number(order.total_weight_produced || 0),
      0,
    ),
    ordersNearCompletion: productionOrders.filter(
      (order: ActiveProductionOrderDetails) => {
        const requiredQty =
          Number(order.final_quantity_kg) > 0
            ? Number(order.final_quantity_kg)
            : Number(order.quantity_kg || 0);
        if (requiredQty <= 0) return false;
        const progress =
          (Number(order.total_weight_produced || 0) / requiredQty) * 100;
        return progress >= 80 && !order.is_final_roll_created;
      },
    ).length,
  };

  const orderGroups = useMemo(
    () => groupByOrderNumber(productionOrders, (o) => o.order_number),
    [productionOrders],
  );
  const selectedGroup = selectedOrderNumber
    ? orderGroups.find((g) => g.orderNumber === selectedOrderNumber) ?? null
    : null;

  if (isLoading) {
    const loadingContent = (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">{t("operators.film.loadingOrders")}</p>
        </div>
      </div>
    );

    if (hideLayout) {
      return loadingContent;
    }

    return (
      <PageLayout
        title={t("operators.film.title")}
        description={t("operators.film.description")}
      >
        {loadingContent}
      </PageLayout>
    );
  }

  const mainContent = (
    <div className="space-y-6">
      <Tabs defaultValue="production" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger
            value="production"
            className="flex items-center gap-2"
            data-testid="tab-production"
          >
            <Package className="h-4 w-4" />
            {t("operators.film.productionOrdersTab")}
          </TabsTrigger>
          <TabsTrigger
            value="mixing"
            className="flex items-center gap-2"
            data-testid="tab-mixing"
          >
            <Beaker className="h-4 w-4" />
            {t("operators.film.materialMixingTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-6">
          <div className="hidden md:grid md:grid-cols-4 gap-4 mb-6">
            <OperatorStatCard
              icon={Package}
              color="blue"
              value={stats.totalOrders}
              label={t("operators.common.activeOrders")}
              sublabel={t("operators.common.productionOrder")}
              testId="card-active-orders"
              valueTestId="stat-active-orders"
            />

            <OperatorStatCard
              icon={Target}
              color="amber"
              value={formatNumberAr(stats.totalRequired)}
              label={t("operators.common.requiredQuantity")}
              sublabel={t("operators.common.kilogram")}
              testId="card-total-required"
              valueTestId="stat-total-required"
            />

            <OperatorStatCard
              icon={CheckCircle2}
              color="green"
              value={formatNumberAr(stats.totalProduced)}
              label={t("operators.common.producedQuantity")}
              sublabel={t("operators.common.kilogram")}
              testId="card-total-produced"
              valueTestId="stat-total-produced"
            />

            <OperatorStatCard
              icon={Flag}
              color="orange"
              value={stats.ordersNearCompletion}
              label={t("operators.common.nearCompletion")}
              sublabel={t("operators.common.productionOrder")}
              testId="card-near-completion"
              valueTestId="stat-near-completion"
            />
          </div>

          {productionOrders.length === 0 ? (
            <Card className="p-8" data-testid="card-no-orders">
              <div className="text-center">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t("operators.film.noActiveOrders")}
                </h3>
                <p
                  className="text-gray-600 dark:text-gray-400"
                  data-testid="text-no-orders"
                >
                  {t("operators.film.noActiveOrdersDesc")}
                </p>
              </div>
            </Card>
          ) : !selectedGroup ? (
            <div className="space-y-4">
              <OrdersListHeader testId="film" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {orderGroups.map((group) => {
                  const first = group.items[0];
                  const totalRequired = group.items.reduce(
                    (sum, o) =>
                      sum + Number(o.final_quantity_kg || o.quantity_kg || 0),
                    0,
                  );
                  const totalProduced = group.items.reduce(
                    (sum, o) => sum + Number(o.total_weight_produced || 0),
                    0,
                  );
                  const groupProgress =
                    totalRequired > 0 ? (totalProduced / totalRequired) * 100 : 0;
                  return (
                    <OrderGroupCard
                      key={group.orderNumber}
                      orderNumber={group.orderNumber}
                      customerName={
                        ln(first.customer_name_ar, first.customer_name_en) ||
                        first.customer_name
                      }
                      salesRepName={
                        ln(
                          first.sales_rep_name_ar,
                          first.sales_rep_name_en,
                        ) || first.sales_rep_name
                      }
                      orderDate={first.order_date}
                      productionOrderCount={group.items.length}
                      progressPercent={groupProgress}
                      metrics={[
                        {
                          label: t("operators.common.requiredQuantity"),
                          value: `${formatNumberAr(totalRequired)} ${t("operators.common.kg")}`,
                          icon: <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                        },
                        {
                          label: t("operators.common.producedQuantity"),
                          value: `${formatNumberAr(totalProduced)} ${t("operators.common.kg")}`,
                          icon: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
                        },
                      ]}
                      accent="blue"
                      icon={<Package className="h-3 w-3 ml-1" />}
                      onSelect={() => setSelectedOrderNumber(group.orderNumber)}
                      testId={`film-${group.orderNumber}`}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <BackToOrdersBar
                orderNumber={selectedGroup.orderNumber}
                onBack={() => setSelectedOrderNumber(null)}
                testId="film"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selectedGroup.items.map((order: ActiveProductionOrderDetails) => {
                // الكمية المطلوبة: نستخدم الكمية النهائية إن وُجدت وإلا الكمية
                // الأساسية (نفس منطق الخادم) لتجنّب قسمة خاطئة على 1.
                const requiredQty =
                  Number(order.final_quantity_kg) > 0
                    ? Number(order.final_quantity_kg)
                    : Number(order.quantity_kg || 0);
                const producedQty = Number(order.total_weight_produced || 0);
                const progress =
                  requiredQty > 0 ? (producedQty / requiredQty) * 100 : 0;
                const remainingPercent =
                  requiredQty > 0 ? Math.max(0, 100 - progress) : 100;
                const isNearCompletion = progress >= 80;
                // يظهر زر "آخر رول" فقط إذا كانت الكمية المتبقية 15% أو أقل.
                const canCreateFinalRoll =
                  requiredQty > 0 &&
                  remainingPercent <= FINAL_ROLL_MAX_REMAINING_PERCENT;
                const isComplete = order.is_final_roll_created;

                return (
                  <Card
                    key={order.id}
                    className={`${isComplete ? "opacity-60" : ""} transition-all hover:shadow-lg`}
                    data-testid={`card-production-order-${order.id}`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle
                            className="text-lg font-bold text-red-600 dark:text-red-400 leading-snug"
                            data-testid={`text-customer-${order.id}`}
                          >
                            {ln(
                              order.customer_name_ar,
                              order.customer_name_en,
                            ) || order.customer_name}
                          </CardTitle>
                          <CardDescription
                            className="font-semibold text-gray-800 dark:text-gray-200 text-sm mt-0.5"
                            data-testid={`text-product-${order.id}`}
                          >
                            {ln(order.product_name_ar, order.product_name_en) ||
                              order.product_name}
                          </CardDescription>
                          <p
                            className="text-xs text-gray-400 dark:text-gray-500 mt-1"
                            data-testid={`text-order-number-${order.id}`}
                          >
                            {order.production_order_number} ·{" "}
                            {t("operators.common.order")}: {order.order_number}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end flex-shrink-0">
                          {isComplete && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                              data-testid={`badge-complete-${order.id}`}
                            >
                              <CheckCircle2 className="h-3 w-3 ml-1" />
                              {t("operators.common.completed")}
                            </Badge>
                          )}
                          {isNearCompletion && !isComplete && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800"
                              data-testid={`badge-near-completion-${order.id}`}
                            >
                              <AlertTriangle className="h-3 w-3 ml-1" />
                              {t("operators.common.nearCompletionBadge")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        {order.category_name && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              {t("operators.common.category")}
                            </p>
                            <p
                              className="font-medium"
                              data-testid={`text-category-${order.id}`}
                            >
                              {order.category_name}
                            </p>
                          </div>
                        )}
                        {order.size_caption && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              {t("operators.common.size")}
                            </p>
                            <p
                              className="font-bold text-orange-600 dark:text-orange-400"
                              data-testid={`text-size-${order.id}`}
                            >
                              {order.size_caption}
                            </p>
                          </div>
                        )}
                        {order.raw_material && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              {t("operators.common.rawMaterialType")}
                            </p>
                            <p
                              className="font-bold text-red-600 dark:text-red-400"
                              data-testid={`text-raw-material-${order.id}`}
                            >
                              {order.raw_material}
                            </p>
                          </div>
                        )}
                        {order.thickness && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              {t("operators.common.thickness")}
                            </p>
                            <p
                              className="font-bold text-orange-600 dark:text-orange-400"
                              data-testid={`text-thickness-${order.id}`}
                            >
                              {parseFloat(String(order.thickness))} µm
                            </p>
                          </div>
                        )}
                        {order.master_batch_id && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              {isArabic
                                ? "لون الماستر باتش"
                                : "Masterbatch"}
                            </p>
                            <p
                              className="font-medium flex items-center gap-2"
                              data-testid={`text-masterbatch-${order.id}`}
                            >
                              {order.master_batch_color_hex && (() => {
                                const hex = order.master_batch_color_hex
                                  .trim()
                                  .toLowerCase();
                                const isBlack =
                                  hex === "#000" ||
                                  hex === "#000000" ||
                                  hex === "black" ||
                                  hex === "rgb(0,0,0)" ||
                                  hex === "rgb(0, 0, 0)";
                                return (
                                  <span
                                    className="inline-block w-6 h-6 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        order.master_batch_color_hex,
                                      border: `2px solid ${
                                        isBlack ? "#ffffff" : "#000000"
                                      }`,
                                    }}
                                  />
                                );
                              })()}
                              {(isArabic
                                ? order.master_batch_name_ar
                                : order.master_batch_name_en) ||
                                order.master_batch_name ||
                                order.master_batch_id}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            {t("operators.common.requiredQuantity")}
                          </span>
                          <span
                            className="font-medium"
                            data-testid={`text-required-qty-${order.id}`}
                          >
                            {formatNumberAr(Number(order.final_quantity_kg))}{" "}
                            {t("operators.common.kg")}
                            {order.overrun_percentage &&
                              Number(order.overrun_percentage) > 0 && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 mr-1 ml-1">
                                  ({isArabic ? "شامل" : "incl."}{" "}
                                  {formatNumberAr(
                                    Number(order.overrun_percentage),
                                  )}
                                  %)
                                </span>
                              )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            {t("operators.common.producedQuantity")}
                          </span>
                          <span
                            className="font-medium"
                            data-testid={`text-produced-qty-${order.id}`}
                          >
                            {formatNumberAr(
                              Number(order.total_weight_produced),
                            )}{" "}
                            {t("operators.common.kg")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            {t("operators.common.remainingQuantity")}
                          </span>
                          <span
                            className="font-medium text-orange-600"
                            data-testid={`text-remaining-qty-${order.id}`}
                          >
                            {formatNumberAr(Number(order.remaining_quantity))}{" "}
                            {t("operators.common.kg")}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("operators.common.progress")}
                          </span>
                          <span
                            className="font-medium"
                            data-testid={`text-progress-${order.id}`}
                          >
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-2"
                          data-testid={`progress-bar-${order.id}`}
                        />
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("operators.common.rollsCount")}:
                          </span>
                          <span
                            className="font-medium"
                            data-testid={`text-rolls-count-${order.id}`}
                          >
                            {order.rolls_count}
                          </span>
                        </div>
                        {order.production_start_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {t("operators.common.startedSince")}:
                            </span>
                            <span className="font-medium">
                              {(() => {
                                const startTime = new Date(
                                  order.production_start_time,
                                ).getTime();
                                const now = Date.now();
                                const diffMinutes = Math.floor(
                                  (now - startTime) / (1000 * 60),
                                );
                                if (diffMinutes < 60)
                                  return `${diffMinutes} ${t("operators.common.minute")}`;
                                const hours = Math.floor(diffMinutes / 60);
                                const minutes = diffMinutes % 60;
                                return `${hours}h ${minutes}m`;
                              })()}
                            </span>
                          </div>
                        )}
                      </div>

                      {order.rolls_count > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleOrderExpansion(order.id)}
                              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              data-testid={`button-toggle-rolls-${order.id}`}
                            >
                              {expandedOrders.has(order.id) ? "▼" : "◀"}{" "}
                              {t("operators.common.viewRolls")} (
                              {order.rolls_count})
                            </button>
                          </div>

                          {expandedOrders.has(order.id) && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                              {allRolls
                                .filter(
                                  (roll) =>
                                    roll.production_order_id === order.id,
                                )
                                .sort((a, b) => a.roll_seq - b.roll_seq)
                                .map((roll) => (
                                  <div
                                    key={roll.id}
                                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 hover:shadow-md transition-shadow"
                                    data-testid={`roll-card-${roll.id}`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div
                                          className="font-bold text-sm text-blue-900 dark:text-blue-100"
                                          data-testid={`roll-number-${roll.id}`}
                                        >
                                          {roll.roll_number}
                                        </div>
                                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                          {t("operators.common.rollSeq")}
                                          {roll.roll_seq}
                                        </div>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                                      >
                                        {roll.status}
                                      </Badge>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                      <div className="flex items-center gap-1 text-blue-800 dark:text-blue-200">
                                        <Package className="h-3 w-3" />
                                        <span className="font-medium">
                                          {formatNumberAr(
                                            Number(roll.weight_kg),
                                          )}{" "}
                                          {t("operators.common.kg")}
                                        </span>
                                      </div>

                                      {roll.created_by_name && (
                                        <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                          <User className="h-3 w-3" />
                                          <span>{roll.created_by_name}</span>
                                        </div>
                                      )}
                                    </div>

                                    <Button
                                      onClick={() => handlePrintLabel(roll)}
                                      size="sm"
                                      variant="outline"
                                      className="w-full mt-2 h-7 text-xs bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                      data-testid={`button-print-label-${roll.id}`}
                                    >
                                      <Printer className="h-3 w-3 ml-1" />
                                      {t("operators.common.printLabel")}
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {!isComplete && (
                          <>
                            <Button
                              onClick={() => handleCreateRoll(order, false)}
                              className="flex-1"
                              variant="default"
                              data-testid={`button-create-roll-${order.id}`}
                            >
                              <Plus className="h-4 w-4 ml-2" />
                              {t("operators.common.createNewRoll")}
                            </Button>

                            {order.rolls_count > 0 && canCreateFinalRoll && (
                              <Button
                                onClick={() => handleCreateRoll(order, true)}
                                variant="destructive"
                                data-testid={`button-final-roll-${order.id}`}
                              >
                                <Flag className="h-4 w-4 ml-2" />
                                {t("operators.common.finalRoll")}
                              </Button>
                            )}
                          </>
                        )}

                        {isComplete && (
                          <div className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <div className="text-sm">
                                <p className="font-medium text-green-900 dark:text-green-100">
                                  {t("operators.film.filmStageCompleted")}
                                </p>
                                {order.production_time_minutes && (
                                  <p className="text-xs text-green-700 dark:text-green-300">
                                    {t("operators.film.totalProductionTime")}:{" "}
                                    {order.production_time_minutes}{" "}
                                    {t("operators.common.minute")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {order.rolls_count > 0 && (
                          <Button
                            variant="outline"
                            onClick={() => setBatchOrderId(order.id)}
                            className="whitespace-nowrap"
                            data-testid={`button-batch-label-${order.id}`}
                          >
                            <PackageCheck className="h-4 w-4 ml-2" />
                            {t("batch.printLabelTitle")}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mixing" className="space-y-6">
          <FilmMaterialMixingTab />
        </TabsContent>
      </Tabs>

      {selectedProductionOrder && (
        <RollCreationModalEnhanced
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productionOrderId={selectedProductionOrder.id}
          productionOrderData={selectedProductionOrder}
          isFinalRoll={isFinalRoll}
        />
      )}
    </div>
  );

  const batchDialog = (
    <BatchLabelDialog
      productionOrderId={batchOrderId}
      onClose={() => setBatchOrderId(null)}
    />
  );

  if (hideLayout) {
    return (
      <>
        {mainContent}
        {batchDialog}
      </>
    );
  }

  return (
    <PageLayout
      title={t("operators.film.title")}
      description={t("operators.film.description")}
    >
      {mainContent}
      {batchDialog}
    </PageLayout>
  );
}
