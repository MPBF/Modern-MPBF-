import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Package,
  Printer,
  CheckCircle2,
  Loader2,
  Info,
  Layers,
  Ruler,
  Grid,
  Disc,
  ArrowLeftRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";
import PageLayout from "../../components/layout/PageLayout";
import {
  BackToOrdersBar,
  OrdersListHeader,
  groupByOrderNumber,
} from "../../components/production/OrderGroupCard";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useLocalizedName } from "../../hooks/use-localized-name";
import { useAuth } from "../../hooks/use-auth";
import { useOperatorMachinePreference } from "../../hooks/use-operator-machine-preference";
import { useSmartPolling } from "../../hooks/use-smart-polling";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";

interface RollDetails {
  roll_id: number;
  roll_number: string;
  roll_seq: number;
  weight_kg: string | number;
  waste_kg: string | number;
  stage: string;
  roll_created_at: string;
  printed_at: string | null;
}

interface ProductionOrderWithRolls {
  production_order_id: number;
  production_order_number: string;
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
  size_caption?: string;
  rolls: RollDetails[];
  total_rolls: number;
  total_weight: number;
  printing_cylinder?: string;
  plate_drawer_code?: string | null;
  front_print_colors?: string[];
  back_print_colors?: string[];
}

interface Machine {
  id: string;
  name: string;
  name_ar: string;
  section_id: string;
  status: string;
}

interface PrintingOperatorDashboardProps {
  hideLayout?: boolean;
}

function PrintColorsRow({
  label,
  colors,
  side,
}: {
  label: string;
  colors: string[];
  side: string;
}) {
  if (!colors || colors.length === 0) return null;
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
        {label} ({formatNumberAr(colors.length)}):
      </span>
      <div className="flex flex-wrap gap-1.5 justify-end">
        {colors.map((color, i) => (
          <span
            key={`${color}-${i}`}
            className="h-6 w-6 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-xs inline-block"
            style={{ backgroundColor: color || "transparent" }}
            title={color}
            data-testid={`color-box-${side}-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function PrintingOperatorDashboard({
  hideLayout = false,
}: PrintingOperatorDashboardProps) {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingRollIds, setProcessingRollIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(
    null,
  );
  const [isEditingMachine, setIsEditingMachine] = useState(false);
  const pollingInterval = useSmartPolling(45_000);

  const { data: productionOrders = [], isLoading } = useQuery<
    ProductionOrderWithRolls[]
  >({
    queryKey: ["/api/rolls/active-for-printing"],
    refetchInterval: pollingInterval,
  });

  const {
    data: allMachines = [],
    isLoading: machinesLoading,
    isSuccess: machinesReady,
  } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const printingMachines = allMachines.filter(
    (m) => m.section_id === "SEC04" && m.status === "active",
  );
  const {
    selectedMachineId,
    setSelectedMachineId,
    isReady: machinePreferenceReady,
  } = useOperatorMachinePreference({
    stage: "printing",
    userId: user?.id,
    availableMachineIds: printingMachines.map((machine) => machine.id),
    machinesReady,
  });

  const moveToPrintingMutation = useMutation({
    mutationFn: async ({
      rollId,
      machineId,
    }: {
      rollId: number;
      machineId: string;
    }) => {
      return await apiRequest(`/api/rolls/${rollId}`, {
        method: "PATCH",
        body: JSON.stringify({
          stage: "printing",
          printing_machine_id: machineId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/rolls/active-for-printing"],
      });
      toast({
        title: t("operators.common.success"),
        description: t("operators.printing.rollMoved"),
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("operators.common.error"),
        description: error.message || t("operators.printing.moveRollFailed"),
        variant: "destructive",
      });
    },
  });

  const handleMoveToPrinting = async (rollId: number) => {
    if (!machinePreferenceReady || !selectedMachineId) {
      toast({
        title: t("operators.common.error"),
        description: t("operators.printing.selectMachineFirst"),
        variant: "destructive",
      });
      return;
    }
    setProcessingRollIds((prev) => new Set(prev).add(rollId));
    try {
      await moveToPrintingMutation.mutateAsync({
        rollId,
        machineId: selectedMachineId,
      });
    } finally {
      setProcessingRollIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rollId);
        return newSet;
      });
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
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">
            {t("operators.printing.loadingRolls")}
          </p>
        </div>
      </div>
    );

    if (hideLayout) return loadingContent;

    return (
      <PageLayout
        title={t("operators.printing.title")}
        description={t("operators.printing.description")}
      >
        {loadingContent}
      </PageLayout>
    );
  }

  const selectedMachine = printingMachines.find(
    (m) => m.id === selectedMachineId,
  );

  const mainContent = (
    <div className="space-y-4 pb-12">
      {/* شريط اختيار الماكينة المدمج الخفيف للجوال */}
      <div className="bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Printer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-black text-purple-900 dark:text-purple-200">
              ماكينة الطباعة المحددة
            </span>
          </div>
          {selectedMachine && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-bold text-purple-700 dark:text-purple-300"
              onClick={() => setIsEditingMachine((editing) => !editing)}
              disabled={!machinePreferenceReady}
            >
              {isEditingMachine ? "تم" : "تغيير"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedMachineId}
            onValueChange={setSelectedMachineId}
            disabled={
              machinesLoading ||
              !machinePreferenceReady ||
              (!!selectedMachineId && !isEditingMachine)
            }
          >
            <SelectTrigger className="w-full bg-white dark:bg-gray-900 text-xs font-bold h-10 rounded-xl border-purple-200">
              <SelectValue
                placeholder={t("operators.printing.selectMachinePlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {printingMachines.map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>
                  {ln(machine.name_ar, machine.name)} ({machine.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedMachine && !isEditingMachine && (
            <Badge className="bg-purple-600 text-white whitespace-nowrap h-10 px-3 text-xs font-bold rounded-xl gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              جاهز
            </Badge>
          )}
        </div>
      </div>

      {/* قائمة الطلبات الرئيسية أو تفاصيل الطلب المحدد */}
      {productionOrders.length === 0 ? (
        <Card className="p-8 text-center rounded-2xl border-dashed">
          <Info className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
            {t("operators.printing.noRolls")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("operators.printing.noRollsReady")}
          </p>
        </Card>
      ) : !selectedGroup ? (
        <div className="space-y-3">
          <OrdersListHeader testId="printing" />
          <div className="grid grid-cols-1 gap-3">
            {orderGroups.map((group) => {
              const first = group.items[0];
              const totalRolls = group.items.reduce(
                (sum, o) => sum + o.total_rolls,
                0,
              );
              const totalWeight = group.items.reduce(
                (sum, o) => sum + o.total_weight,
                0,
              );
              const completedRolls = group.items.reduce(
                (sum, o) => sum + o.rolls.filter((r) => r.printed_at).length,
                0,
              );
              const groupProgress =
                totalRolls > 0 ? (completedRolls / totalRolls) * 100 : 0;

              // استخراج أسماء المنتجات الموجودة في الطلب
              const uniqueProducts = Array.from(
                new Set(
                  group.items.map(
                    (item) =>
                      ln(item.product_name_ar, item.product_name_en) ||
                      item.product_name,
                  ),
                ),
              ).filter(Boolean);

              return (
                <div
                  key={group.orderNumber}
                  className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:border-purple-500 transition-all cursor-pointer space-y-3"
                  onClick={() => setSelectedOrderNumber(group.orderNumber)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                          طلب: #{group.orderNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({group.items.length} أوامر إنتاج)
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-purple-800 dark:text-purple-400 leading-tight">
                        {ln(first.customer_name_ar, first.customer_name_en) ||
                          first.customer_name}
                      </h3>
                    </div>

                    <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-xl">
                      فتح الطلب ◀
                    </span>
                  </div>

                  {/* المنتجات التابعة للطلب */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-gray-800">
                    <span className="text-[11px] font-bold text-gray-400 block">
                      المنتجات المطلوبة للطباعة:
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

                  {/* شريط الإنجاز للرولات */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">
                        الرولات المطبوعة ({completedRolls}/{totalRolls})
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">
                        {formatNumberAr(totalWeight)} كجم
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
            testId="printing"
          />

          <div className="space-y-4">
            {selectedGroup.items.map((order) => {
              const completedRolls = order.rolls.filter(
                (r) => r.printed_at,
              ).length;
              const progress =
                order.total_rolls > 0
                  ? (completedRolls / order.total_rolls) * 100
                  : 0;

              return (
                <Card
                  key={order.production_order_id}
                  className="overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                >
                  {/* رأس الكرت: رقم الطلب، العميل، واسم المنتج بشكل عريض جداً */}
                  <CardHeader className="p-4 pb-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                            {order.production_order_number}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            طلب: #{order.order_number}
                          </span>
                        </div>

                        {/* اسم المنتج بارز وكبير */}
                        <h2 className="text-xl font-black text-gray-950 dark:text-white leading-tight tracking-tight mt-1">
                          {ln(order.product_name_ar, order.product_name_en) ||
                            order.product_name}
                        </h2>

                        {/* اسم العميل */}
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-400 mt-1">
                          {ln(order.customer_name_ar, order.customer_name_en) ||
                            order.customer_name}
                        </p>
                      </div>

                      <Badge
                        variant="secondary"
                        className="bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-bold text-xs"
                      >
                        {order.total_rolls} رول
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* شبكة مواصفات الطباعة الفنية المباشرة (Tech Specs) */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-800/60 p-3 rounded-xl border border-slate-100 dark:border-gray-800 text-xs">
                      {/* المقاس */}
                      <div className="flex items-start gap-2">
                        <Ruler className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">المقاس</span>
                          <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                            {order.size_caption || "—"}
                          </span>
                        </div>
                      </div>

                      {/* مقاس السلندر */}
                      <div className="flex items-start gap-2">
                        <Disc className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">السلندر</span>
                          <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                            {order.printing_cylinder || "—"}
                          </span>
                        </div>
                      </div>

                      {/* درج الكليشات */}
                      <div className="flex items-start gap-2">
                        <Grid className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">درج الكليشة</span>
                          <span className="font-black text-amber-700 dark:text-amber-400 text-sm">
                            {order.plate_drawer_code || "—"}
                          </span>
                        </div>
                      </div>

                      {/* إجمالي الوزن */}
                      <div className="flex items-start gap-2">
                        <Layers className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">إجمالي الوزن</span>
                          <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                            {formatNumberAr(order.total_weight)} كجم
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ألوان الطباعة للوجهين */}
                    {((order.front_print_colors && order.front_print_colors.length > 0) ||
                      (order.back_print_colors && order.back_print_colors.length > 0)) && (
                      <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-1">
                        <span className="text-[11px] font-black text-purple-900 dark:text-purple-300 block mb-1">
                          ألوان الطباعة:
                        </span>
                        <PrintColorsRow
                          label="الوجه الأمامي"
                          colors={order.front_print_colors || []}
                          side="front"
                        />
                        <PrintColorsRow
                          label="الوجه الخلفي"
                          colors={order.back_print_colors || []}
                          side="back"
                        />
                      </div>
                    )}

                    {/* شريط الإنجاز */}
                    <div className="space-y-1.5 bg-gray-50/50 dark:bg-gray-800/30 p-2.5 rounded-xl">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-gray-500">
                          الرولات المكتملة ({completedRolls}/{order.total_rolls})
                        </span>
                        <span className="text-purple-700 dark:text-purple-300 font-bold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2.5 rounded-full" />
                    </div>

                    {/* قائمة الرولات المتاحة للطباعة */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block">
                        الرولات الجاهزة للطباعة ({order.rolls.length}):
                      </span>

                      <div className="space-y-2 max-h-56 overflow-y-auto p-0.5">
                        {order.rolls.map((roll) => {
                          const isProcessing = processingRollIds.has(roll.roll_id);
                          return (
                            <div
                              key={roll.roll_id}
                              className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 flex items-center justify-center font-black text-xs">
                                  {roll.roll_seq}
                                </div>
                                <div>
                                  <div className="font-black text-xs text-gray-900 dark:text-gray-100">
                                    {roll.roll_number}
                                  </div>
                                  <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                                    {formatNumberAr(Number(roll.weight_kg))} كجم
                                  </div>
                                </div>
                              </div>

                              <Button
                                onClick={() => handleMoveToPrinting(roll.roll_id)}
                                disabled={isProcessing || !selectedMachineId}
                                className="h-10 px-4 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs active:scale-95 transition-all"
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Printer className="h-4 w-4 ml-1.5" />
                                    طباعة
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (hideLayout) {
    return mainContent;
  }

  return (
    <PageLayout
      title={t("operators.printing.title")}
      description={t("operators.printing.description")}
    >
      {mainContent}
    </PageLayout>
  );
}