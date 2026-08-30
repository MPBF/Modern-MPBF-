import { useQuery } from "@tanstack/react-query";
import {
  Package,
  PackageCheck,
  CheckCircle2,
  Plus,
  Flag,
  Loader2,
  Info,
  Printer,
  Beaker,
  Ruler,
  Layers,
  Gauge,
  Palette,
  Disc,
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
import { printRollLabel } from "../../components/production/RollLabelPrint";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
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
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(
    null,
  );
  const [printingRollId, setPrintingRollId] = useState<number | null>(null);
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

  const handlePrintLabel = async (roll: Roll) => {
    try {
      setPrintingRollId(roll.id);
      const response = await fetch(`/api/rolls/${roll.id}/label`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const labelData = await response.json();
      if (!labelData || !labelData.roll) throw new Error("Invalid label data");
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
    } finally {
      setPrintingRollId(null);
    }
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
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">{t("operators.film.loadingOrders")}</p>
        </div>
      </div>
    );

    if (hideLayout) return loadingContent;
    return (
      <PageLayout
        title={t("operators.film.title")}
        description={t("operators.film.description")}
      >
        {loadingContent}
      </PageLayout>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <Tabs defaultValue="production" className="space-y-4">
        {/* شريط التبويب العلوي */}
        <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <TabsTrigger
            value="production"
            className="flex items-center justify-center gap-2 font-bold text-sm h-10 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-sm"
          >
            <Package className="h-4 w-4 text-blue-600" />
            {t("operators.film.productionOrdersTab")}
          </TabsTrigger>
          <TabsTrigger
            value="mixing"
            className="flex items-center justify-center gap-2 font-bold text-sm h-10 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-sm"
          >
            <Beaker className="h-4 w-4 text-amber-600" />
            {t("operators.film.materialMixingTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          {productionOrders.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl border-dashed">
              <Info className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                {t("operators.film.noActiveOrders")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("operators.film.noActiveOrdersDesc")}
              </p>
            </Card>
    ) : !selectedGroup ? (
      <div className="space-y-3">
        <OrdersListHeader testId="film" />
        <div className="grid grid-cols-1 gap-3">
          {orderGroups.map((group) => {
            const first = group.items[0];
            const totalRequired = group.items.reduce(
              (sum, o) => sum + Number(o.final_quantity_kg || o.quantity_kg || 0),
              0,
            );
            const totalProduced = group.items.reduce(
              (sum, o) => sum + Number(o.total_weight_produced || 0),
              0,
            );
            const groupProgress =
              totalRequired > 0 ? (totalProduced / totalRequired) * 100 : 0;

            // استخراج أسماء المنتجات الموجودة في هذا الطلب بدون تكرار
            const uniqueProducts = Array.from(
              new Set(
                group.items.map(
                  (item) =>
                    ln(item.product_name_ar, item.product_name_en) ||
                    item.product_name
                )
              )
            ).filter(Boolean);

            return (
              <div
                key={group.orderNumber}
                className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:border-blue-500 transition-all cursor-pointer space-y-3"
                onClick={() => setSelectedOrderNumber(group.orderNumber)}
              >
                {/* ترويسة الطلب: رقم الطلب + اسم العميل + زر الفتح */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                        طلب: #{group.orderNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({group.items.length} أوامر إنتاج)
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-blue-700 dark:text-blue-400 leading-tight">
                      {ln(first.customer_name_ar, first.customer_name_en) ||
                        first.customer_name}
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl">
                    فتح الطلب ◀
                  </span>
                </div>

                {/* قائمة أسماء المنتجات التابعة لأوامر الإنتاج */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-gray-800">
                  <span className="text-[11px] font-bold text-gray-400 block">
                    المنتجات المطلوبة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueProducts.map((prodName, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 shadow-2xs"
                      >
                        {prodName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* شريط الإنجاز والمقاييس */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-500">
                      الإنجاز الكلي ({Math.round(groupProgress)}%)
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-bold">
                      {formatNumberAr(totalProduced)} / {formatNumberAr(totalRequired)} كجم
                    </span>
                  </div>
                  <Progress value={groupProgress} className="h-2 rounded-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : (
            <div className="space-y-3">
              <BackToOrdersBar
                orderNumber={selectedGroup.orderNumber}
                onBack={() => setSelectedOrderNumber(null)}
                testId="film"
              />

              <div className="space-y-4">
                {selectedGroup.items.map((order: ActiveProductionOrderDetails) => {
                  const requiredQty =
                    Number(order.final_quantity_kg) > 0
                      ? Number(order.final_quantity_kg)
                      : Number(order.quantity_kg || 0);
                  const producedQty = Number(order.total_weight_produced || 0);
                  const remainingQty = Math.max(0, requiredQty - producedQty);
                  const progress = requiredQty > 0 ? (producedQty / requiredQty) * 100 : 0;
                  const remainingPercent = requiredQty > 0 ? Math.max(0, 100 - progress) : 100;
                  const canCreateFinalRoll =
                    requiredQty > 0 && remainingPercent <= FINAL_ROLL_MAX_REMAINING_PERCENT;
                  const isComplete = order.is_final_roll_created;
                  const orderRolls = allRolls
                    .filter((r) => r.production_order_id === order.id)
                    .sort((a, b) => a.roll_seq - b.roll_seq);

                  // تجهيز لون الماستر باتش الافتراضي في حال عدم وجوده
                  const masterBatchColor =
                    order.master_batch_color_hex?.trim() || "#3b82f6";

                  return (
                    <Card
                      key={order.id}
                      className={`overflow-hidden rounded-2xl border-2 transition-all ${
                        isComplete
                          ? "border-green-200 bg-green-50/20 dark:border-green-900"
                          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                      }`}
                    >
                      {/* رأس الكرت: رقم الطلب، العميل، واسم المنتج بشكل كبير وواضح */}
                      <CardHeader className="p-4 pb-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                                {order.production_order_number}
                              </span>
                              <span className="text-xs font-semibold text-gray-500">
                                طلب: #{order.order_number}
                              </span>
                            </div>

                            {/* اسم المنتج بخط عريض وواضح جداً */}
                            <h2 className="text-xl font-black text-gray-950 dark:text-white leading-tight tracking-tight mt-1">
                              {ln(order.product_name_ar, order.product_name_en) || order.product_name}
                            </h2>

                            {/* اسم العميل */}
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-1">
                              {ln(order.customer_name_ar, order.customer_name_en) || order.customer_name}
                            </p>
                          </div>

                          {isComplete ? (
                            <Badge className="bg-emerald-600 text-white gap-1 text-xs py-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              مكتمل
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs font-bold text-blue-700 dark:text-blue-300 border-blue-300">
                              {order.rolls_count} رول
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 space-y-4">
                        {/* شبكة المواصفات الفنية المباشرة (Tech Specs 2x2) */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-800/60 p-3 rounded-xl border border-slate-100 dark:border-gray-800 text-xs">
                          {/* المقاس */}
                          <div className="flex items-start gap-2">
                            <Ruler className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-gray-400 block text-[10px]">المقاس</span>
                              <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                                {order.size_caption || "—"}
                              </span>
                            </div>
                          </div>

                          {/* نوع الخام */}
                          <div className="flex items-start gap-2">
                            <Layers className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-gray-400 block text-[10px]">نوع الخام</span>
                              <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                                {order.raw_material || "—"}
                              </span>
                            </div>
                          </div>

                          {/* السماكة */}
                          <div className="flex items-start gap-2">
                            <Gauge className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-gray-400 block text-[10px]">السماكة</span>
                              <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                                {order.thickness ? `${parseFloat(String(order.thickness))} µm` : "—"}
                              </span>
                            </div>
                          </div>

                          {/* لون الماستر باتش */}
                          <div className="flex items-center gap-2.5">
                            <Palette className="h-4 w-4 text-rose-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-400 block text-[10px]">الماستر باتش</span>
                              <div className="flex items-center gap-2 mt-1">
                                {order.master_batch_color_hex ? (
                                  <span
                                    className="inline-block w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: order.master_batch_color_hex }}
                                  />
                                ) : (
                                  <span className="inline-block w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                )}
                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                                  {(isArabic
                                    ? order.master_batch_name_ar
                                    : order.master_batch_name_en) ||
                                    order.master_batch_name ||
                                    "بدون لون"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* شريط الإنجاز والكميات */}
                        <div className="space-y-1.5 bg-gray-50/50 dark:bg-gray-800/30 p-2.5 rounded-xl">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-gray-500">الإنجاز ({Math.round(progress)}%)</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              المطلوب: {formatNumberAr(requiredQty)} كجم
                            </span>
                          </div>

                          <Progress value={progress} className="h-2.5 rounded-full" />

                          <div className="flex justify-between items-center text-xs pt-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              المنتج: {formatNumberAr(producedQty)} كجم
                            </span>
                            <span className="text-orange-600 dark:text-orange-400 font-bold">
                              المتبقي: {formatNumberAr(remainingQty)} كجم
                            </span>
                          </div>
                        </div>

                        {/* الرولات المنتجة على شكل رولات ملوّنة مع إمكانية الضغط للطباعة */}
                        {orderRolls.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-200">
                              <span className="flex items-center gap-1">
                                <Disc className="h-4 w-4 text-blue-600 animate-spin-slow" />
                                الرولات المنتجة ({orderRolls.length})
                              </span>
                              <span className="text-[10px] text-gray-400">
                                اضغط على الرول لطباعة الملصق
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto p-1">
                              {orderRolls.map((roll) => {
                                const isPrinting = printingRollId === roll.id;
                                return (
                                  <button
                                    key={roll.id}
                                    type="button"
                                    onClick={() => handlePrintLabel(roll)}
                                    disabled={isPrinting}
                                    className="group relative flex items-center gap-2 p-2 pr-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs hover:border-blue-500 hover:shadow-md active:scale-95 transition-all text-right"
                                    title="اضغط لطباعة ملصق الرول"
                                  >
                                    {/* شكل أسطوانة الرول الملونة بلون الماسترباتش */}
                                    <div
                                      className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs border-2 border-white/80 dark:border-gray-900"
                                      style={{ backgroundColor: masterBatchColor }}
                                    >
                                      {isPrinting ? (
                                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                                      ) : (
                                        <Disc className="h-5 w-5 text-white/90" />
                                      )}
                                      <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-gray-800">
                                        {roll.roll_seq}
                                      </span>
                                    </div>

                                    {/* بيانات الرول: الرقم والوزن */}
                                    <div className="flex flex-col min-w-0 pr-0.5">
                                      <span className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">
                                        {roll.roll_number}
                                      </span>
                                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatNumberAr(Number(roll.weight_kg))} كجم
                                      </span>
                                    </div>

                                    {/* أيقونة الطباعة تظهر بالطرف */}
                                    <Printer className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600 transition-colors mr-1 flex-shrink-0" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* الأزرار الرئيسية لإنشاء الرول */}
                        {!isComplete ? (
                          <div className="flex gap-2 pt-1">
                            <Button
                              onClick={() => handleCreateRoll(order, false)}
                              className="flex-1 h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md active:scale-98 transition-all"
                            >
                              <Plus className="h-5 w-5 ml-1.5" />
                              {t("operators.common.createNewRoll")}
                            </Button>

                            {order.rolls_count > 0 && canCreateFinalRoll && (
                              <Button
                                onClick={() => handleCreateRoll(order, true)}
                                variant="destructive"
                                className="h-12 px-4 text-xs font-bold rounded-xl shadow-md active:scale-98"
                              >
                                <Flag className="h-4 w-4 ml-1" />
                                {t("operators.common.finalRoll")}
                              </Button>
                            )}

                            {order.rolls_count > 0 && (
                              <Button
                                variant="outline"
                                onClick={() => setBatchOrderId(order.id)}
                                className="h-12 px-3 rounded-xl border-gray-300 dark:border-gray-700"
                                title="طباعة ملصق الدفعة"
                              >
                                <PackageCheck className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                                تم إكمال مرحلة الفيلم بالكامل
                              </span>
                            </div>
                            {order.rolls_count > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setBatchOrderId(order.id)}
                                className="h-8 text-xs gap-1 border-emerald-300 text-emerald-800"
                              >
                                <PackageCheck className="h-3.5 w-3.5 ml-1" />
                                ملصق الدفعة
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mixing" className="space-y-4">
          <FilmMaterialMixingTab />
        </TabsContent>
      </Tabs>

      {/* نوافذ الحوار المنبثقة */}
      {selectedProductionOrder && (
        <RollCreationModalEnhanced
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productionOrderId={selectedProductionOrder.id}
          productionOrderData={selectedProductionOrder}
          isFinalRoll={isFinalRoll}
        />
      )}

      {batchOrderId && (
        <BatchLabelDialog
          productionOrderId={batchOrderId}
          onClose={() => setBatchOrderId(null)}
        />
      )}
    </div>
  );
}