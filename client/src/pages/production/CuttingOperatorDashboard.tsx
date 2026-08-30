import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Scissors,
  CheckCircle2,
  Loader2,
  Info,
  Layers,
  Ruler,
  PackageCheck,
  Disc,
  Weight,
  Sparkles,
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
import BatchLabelDialog from "../../components/production/BatchLabelDialog";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
  cut_completed_at: string | null;
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
  category_name?: string;
  category_name_ar?: string;
  category_name_en?: string;
  size_caption?: string;
  rolls: RollDetails[];
  total_rolls: number;
  total_weight: number;
  cutting_length_cm?: number;
  punching?: string;
}

interface Machine {
  id: string;
  name: string;
  name_ar: string;
  section_id: string;
  status: string;
}

interface CuttingOperatorDashboardProps {
  hideLayout?: boolean;
}

export default function CuttingOperatorDashboard({
  hideLayout = false,
}: CuttingOperatorDashboardProps) {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRoll, setSelectedRoll] = useState<RollDetails | null>(null);
  const [netWeight, setNetWeight] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [batchOrderId, setBatchOrderId] = useState<number | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(
    null,
  );
  const [isEditingMachine, setIsEditingMachine] = useState(false);
  const pollingInterval = useSmartPolling(45_000);

  const { data: productionOrders = [], isLoading } = useQuery<
    ProductionOrderWithRolls[]
  >({
    queryKey: ["/api/rolls/active-for-cutting"],
    refetchInterval: pollingInterval,
  });

  const {
    data: allMachines = [],
    isLoading: machinesLoading,
    isSuccess: machinesReady,
  } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const cuttingMachines = allMachines.filter(
    (m) => m.section_id === "SEC05" && m.status === "active",
  );
  const {
    selectedMachineId,
    setSelectedMachineId,
    isReady: machinePreferenceReady,
  } = useOperatorMachinePreference({
    stage: "cutting",
    userId: user?.id,
    availableMachineIds: cuttingMachines.map((machine) => machine.id),
    machinesReady,
  });

  const completeCuttingMutation = useMutation({
    mutationFn: async ({
      rollId,
      netWeight,
      machineId,
    }: {
      rollId: number;
      netWeight: number;
      machineId: string;
    }) => {
      return await apiRequest(`/api/rolls/${rollId}/complete-cutting`, {
        method: "POST",
        body: JSON.stringify({
          net_weight: netWeight,
          cutting_machine_id: machineId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/rolls/active-for-cutting"],
      });
      setIsDialogOpen(false);
      setSelectedRoll(null);
      setNetWeight("");
      toast({
        title: t("operators.common.success"),
        description: t("operators.cutting.cuttingCompleted"),
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("operators.common.error"),
        description: error.message || t("operators.cutting.cuttingFailed"),
        variant: "destructive",
      });
    },
  });

  const handleOpenCuttingDialog = (roll: RollDetails) => {
    if (!machinePreferenceReady || !selectedMachineId) {
      toast({
        title: t("operators.common.error"),
        description: t("operators.cutting.selectMachineFirst"),
        variant: "destructive",
      });
      return;
    }
    setSelectedRoll(roll);
    setNetWeight(roll.weight_kg.toString());
    setIsDialogOpen(true);
  };

  const handleCompleteCutting = () => {
    if (!selectedRoll) return;
    if (
      !machinePreferenceReady ||
      !selectedMachineId ||
      !cuttingMachines.some((machine) => machine.id === selectedMachineId)
    ) {
      toast({
        title: t("operators.common.error"),
        description: t("operators.cutting.selectMachineFirst"),
        variant: "destructive",
      });
      return;
    }

    const netWeightNum = parseFloat(netWeight);
    const grossWeight = parseFloat(selectedRoll.weight_kg.toString());

    if (isNaN(netWeightNum) || netWeightNum <= 0) {
      toast({
        title: t("operators.common.error"),
        description: t("operators.cutting.invalidNetWeight"),
        variant: "destructive",
      });
      return;
    }

    if (netWeightNum > grossWeight) {
      toast({
        title: t("operators.common.error"),
        description: t("operators.cutting.netWeightTooHigh"),
        variant: "destructive",
      });
      return;
    }

    completeCuttingMutation.mutate({
      rollId: selectedRoll.roll_id,
      netWeight: netWeightNum,
      machineId: selectedMachineId,
    });
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
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">
            {t("operators.cutting.loadingRolls")}
          </p>
        </div>
      </div>
    );

    if (hideLayout) return loadingContent;

    return (
      <PageLayout
        title={t("operators.cutting.title")}
        description={t("operators.cutting.description")}
      >
        {loadingContent}
      </PageLayout>
    );
  }

  const selectedMachine = cuttingMachines.find(
    (m) => m.id === selectedMachineId,
  );

  const mainContent = (
    <div className="space-y-4 pb-12">
      {/* شريط اختيار ماكينة التقطيع المدمج للجوال */}
      <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Scissors className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
              ماكينة التقطيع المحددة
            </span>
          </div>
          {selectedMachine && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-bold text-emerald-700 dark:text-emerald-300"
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
            <SelectTrigger className="w-full bg-white dark:bg-gray-900 text-xs font-bold h-10 rounded-xl border-emerald-200">
              <SelectValue
                placeholder={t("operators.cutting.selectMachinePlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {cuttingMachines.map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>
                  {ln(machine.name_ar, machine.name)} ({machine.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedMachine && !isEditingMachine && (
            <Badge className="bg-emerald-600 text-white whitespace-nowrap h-10 px-3 text-xs font-bold rounded-xl gap-1">
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
            {t("operators.cutting.noRolls")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("operators.cutting.noRollsReady")}
          </p>
        </Card>
      ) : !selectedGroup ? (
        <div className="space-y-3">
          <OrdersListHeader testId="cutting" />
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
                (sum, o) =>
                  sum + o.rolls.filter((r) => r.cut_completed_at).length,
                0,
              );
              const groupProgress =
                totalRolls > 0 ? (completedRolls / totalRolls) * 100 : 0;

              // استخراج أسماء المنتجات التابعة للطلب
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
                  className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:border-emerald-500 transition-all cursor-pointer space-y-3"
                  onClick={() => setSelectedOrderNumber(group.orderNumber)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                          طلب: #{group.orderNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({group.items.length} أوامر إنتاج)
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 leading-tight">
                        {ln(first.customer_name_ar, first.customer_name_en) ||
                          first.customer_name}
                      </h3>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
                      فتح الطلب ◀
                    </span>
                  </div>

                  {/* المنتجات التابعة للطلب */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-gray-800">
                    <span className="text-[11px] font-bold text-gray-400 block">
                      المنتجات المطلوبة للتقطيع:
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

                  {/* شريط الإنجاز للرولات المقصوصة */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-500">
                        الرولات المقصوصة ({completedRolls}/{totalRolls})
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
            testId="cutting"
          />

          <div className="space-y-4">
            {selectedGroup.items.map((order) => {
              const completedRolls = order.rolls.filter(
                (r) => r.cut_completed_at,
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
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
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
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                          {ln(order.customer_name_ar, order.customer_name_en) ||
                            order.customer_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {order.total_rolls > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setBatchOrderId(order.production_order_id)
                            }
                            className="h-8 px-2.5 text-xs rounded-xl border-emerald-300 text-emerald-800 dark:text-emerald-200"
                            title="طباعة ملصق الدفعة"
                          >
                            <PackageCheck className="h-4 w-4 ml-1" />
                            ملصق الدفعة
                          </Button>
                        )}
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold text-xs"
                        >
                          {order.total_rolls} رول
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* شبكة مواصفات التقطيع الفنية المباشرة (Tech Specs) */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-800/60 p-3 rounded-xl border border-slate-100 dark:border-gray-800 text-xs">
                      {/* المقاس */}
                      <div className="flex items-start gap-2">
                        <Ruler className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">المقاس</span>
                          <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                            {order.size_caption || "—"}
                          </span>
                        </div>
                      </div>

                      {/* طول التقطيع */}
                      <div className="flex items-start gap-2">
                        <Scissors className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">طول القطع</span>
                          <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                            {order.cutting_length_cm ? `${order.cutting_length_cm} سم` : "—"}
                          </span>
                        </div>
                      </div>

                      {/* نوع التخريم / القبضة */}
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">التخريم / اليد</span>
                          <span className="font-black text-amber-700 dark:text-amber-400 text-sm">
                            {order.punching || "بدون"}
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

                    {/* شريط الإنجاز */}
                    <div className="space-y-1.5 bg-gray-50/50 dark:bg-gray-800/30 p-2.5 rounded-xl">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-gray-500">
                          الرولات المنجزة ({completedRolls}/{order.total_rolls})
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2.5 rounded-full" />
                    </div>

                    {/* قائمة الرولات المتاحة للتقطيع */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block">
                        الرولات الجاهزة للقص ({order.rolls.length}):
                      </span>

                      <div className="space-y-2 max-h-56 overflow-y-auto p-0.5">
                        {order.rolls.map((roll) => (
                          <div
                            key={roll.roll_id}
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-black text-xs">
                                {roll.roll_seq}
                              </div>
                              <div>
                                <div className="font-black text-xs text-gray-900 dark:text-gray-100">
                                  {roll.roll_number}
                                </div>
                                <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                                  الوزن: {formatNumberAr(Number(roll.weight_kg))} كجم
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleOpenCuttingDialog(roll)}
                              disabled={!selectedMachineId}
                              className="h-10 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs active:scale-95 transition-all"
                            >
                              <Scissors className="h-4 w-4 ml-1.5" />
                              قص
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* نافذة إدخال الوزن الصافي وتأكيد التقطيع المحسّنة للجوال */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-5" data-testid="dialog-cutting">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900 dark:text-white">
              <Scissors className="h-5 w-5 text-emerald-600" />
              تأكيد قص الرول والوزن الصافي
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              أدخل الوزن الصافي للرول بعد التقطيع لحساب نسبة الهالك
            </DialogDescription>
          </DialogHeader>

          {selectedRoll && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">رقم الرول</span>
                  <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                    {selectedRoll.roll_number}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">الوزن القائم (قبل القص)</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatNumberAr(Number(selectedRoll.weight_kg))} كجم
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="netWeight" className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  الوزن الصافي (كجم):
                </Label>
                <Input
                  id="netWeight"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedRoll.weight_kg.toString()}
                  value={netWeight}
                  onChange={(e) => setNetWeight(e.target.value)}
                  placeholder="0.00"
                  className="h-12 text-center text-lg font-black rounded-xl border-2 border-emerald-300 focus-visible:ring-emerald-500"
                  data-testid="input-net-weight"
                  autoFocus
                />
              </div>

              {/* حساب الهالك المتوقع بشكل فوري */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  الهالك المتوقع (الفرق):
                </span>
                <span className="font-black text-amber-700 dark:text-amber-400 text-sm">
                  {formatNumberAr(
                    Math.max(
                      0,
                      Number(selectedRoll.weight_kg) - Number(netWeight || 0),
                    ),
                  )}{" "}
                  كجم
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-row gap-2 pt-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={completeCuttingMutation.isPending}
              className="flex-1 h-12 rounded-xl text-xs font-bold border-gray-300"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCompleteCutting}
              disabled={
                completeCuttingMutation.isPending ||
                !netWeight ||
                !machinePreferenceReady ||
                !selectedMachine
              }
              className="flex-1 h-12 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all"
            >
              {completeCuttingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 ml-1.5" />
                  تأكيد القص
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة ملصق الدفعة */}
      {batchOrderId && (
        <BatchLabelDialog
          productionOrderId={batchOrderId}
          onClose={() => setBatchOrderId(null)}
        />
      )}
    </div>
  );

  if (hideLayout) {
    return mainContent;
  }

  return (
    <PageLayout
      title={t("operators.cutting.title")}
      description={t("operators.cutting.description")}
    >
      {mainContent}
    </PageLayout>
  );
}