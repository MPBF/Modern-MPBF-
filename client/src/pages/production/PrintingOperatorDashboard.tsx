import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Package,
  Printer,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Info,
  Clock,
  AlertCircle,
  Layers,
  Weight,
  Target,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";
import PageLayout from "../../components/layout/PageLayout";
import {
  OrderGroupCard,
  BackToOrdersBar,
  OrdersListHeader,
  groupByOrderNumber,
} from "../../components/production/OrderGroupCard";
import { OperatorStatCard } from "../../components/production/OperatorStatCard";
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
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {label} ({formatNumberAr(colors.length)})
      </span>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((color, i) => (
          <span
            key={`${color}-${i}`}
            className="h-6 w-6 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm"
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

  const stats = {
    totalOrders: productionOrders.length,
    totalRolls: productionOrders.reduce(
      (sum, order) => sum + order.total_rolls,
      0,
    ),
    totalWeight: productionOrders.reduce(
      (sum, order) => sum + order.total_weight,
      0,
    ),
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
          <p className="text-gray-600 text-lg">
            {t("operators.printing.loadingRolls")}
          </p>
        </div>
      </div>
    );

    if (hideLayout) {
      return loadingContent;
    }

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
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Printer className="h-5 w-5 text-purple-600" />
            {t("operators.printing.selectMachine")}
          </CardTitle>
          <CardDescription>
            {t("operators.printing.selectMachineDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={selectedMachineId}
              onValueChange={setSelectedMachineId}
              disabled={
                machinesLoading ||
                !machinePreferenceReady ||
                (!!selectedMachineId && !isEditingMachine)
              }
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-900 sm:max-w-xs">
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
            {selectedMachine && (
              <Button
                type="button"
                variant="outline"
                className="whitespace-nowrap"
                onClick={() => setIsEditingMachine((editing) => !editing)}
                disabled={!machinePreferenceReady}
                data-testid="button-edit-printing-machine"
              >
                {isEditingMachine
                  ? t("operators.common.doneEditing")
                  : t("operators.common.editMachine")}
              </Button>
            )}
            {selectedMachine && (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap"
              >
                <CheckCircle2 className="h-3 w-3 ml-1" />
                {ln(selectedMachine.name_ar, selectedMachine.name)}
              </Badge>
            )}
          </div>
          {!selectedMachineId && (
            <div className="flex items-center gap-2 mt-3 text-amber-600 dark:text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{t("operators.printing.mustSelectMachine")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
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
          icon={Layers}
          color="purple"
          value={stats.totalRolls}
          label={t("operators.common.totalRolls")}
          sublabel={t("operators.common.roll")}
          testId="card-total-rolls"
          valueTestId="stat-total-rolls"
        />

        <OperatorStatCard
          icon={Weight}
          color="teal"
          value={formatNumberAr(stats.totalWeight)}
          label={t("operators.common.totalWeight")}
          sublabel={t("operators.common.kilogram")}
          testId="card-total-weight"
          valueTestId="stat-total-weight"
        />
      </div>

      {productionOrders.length === 0 ? (
        <Card className="p-8" data-testid="card-no-rolls">
          <div className="text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("operators.printing.noRolls")}
            </h3>
            <p
              className="text-gray-600 dark:text-gray-400"
              data-testid="text-no-rolls"
            >
              {t("operators.printing.noRollsReady")}
            </p>
          </div>
        </Card>
      ) : !selectedGroup ? (
        <div className="space-y-4">
          <OrdersListHeader testId="printing" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              return (
                <OrderGroupCard
                  key={group.orderNumber}
                  orderNumber={group.orderNumber}
                  customerName={
                    ln(first.customer_name_ar, first.customer_name_en) ||
                    first.customer_name
                  }
                  salesRepName={
                    ln(first.sales_rep_name_ar, first.sales_rep_name_en) ||
                    first.sales_rep_name
                  }
                  orderDate={first.order_date}
                  productionOrderCount={group.items.length}
                  progressPercent={groupProgress}
                  metrics={[
                    {
                      label: t("operators.common.totalRolls"),
                      value: `${formatNumberAr(totalRolls)} ${t("operators.common.roll")}`,
                      icon: <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
                    },
                    {
                      label: t("operators.common.totalWeight"),
                      value: `${formatNumberAr(totalWeight)} ${t("operators.common.kg")}`,
                      icon: <Weight className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
                    },
                  ]}
                  accent="purple"
                  icon={<Printer className="h-3 w-3 ml-1" />}
                  onSelect={() => setSelectedOrderNumber(group.orderNumber)}
                  testId={`printing-${group.orderNumber}`}
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
            testId="printing"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                className="transition-all hover:shadow-lg"
                data-testid={`card-production-order-${order.production_order_id}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle
                        className="text-lg"
                        data-testid={`text-order-number-${order.production_order_id}`}
                      >
                        {order.production_order_number}
                      </CardTitle>
                      <CardDescription
                        data-testid={`text-order-ref-${order.production_order_id}`}
                      >
                        {t("operators.common.order")}: {order.order_number}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-800"
                    >
                      <Printer className="h-3 w-3 ml-1" />
                      {order.total_rolls} {t("operators.common.roll")}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        {t("operators.common.customer")}
                      </p>
                      <p
                        className="font-bold text-gray-900 dark:text-white"
                        data-testid={`text-customer-${order.production_order_id}`}
                      >
                        {ln(order.customer_name_ar, order.customer_name_en) ||
                          order.customer_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        {t("operators.common.product")}
                      </p>
                      <p
                        className="font-medium"
                        data-testid={`text-product-${order.production_order_id}`}
                      >
                        {ln(order.product_name_ar, order.product_name_en) ||
                          order.product_name}
                      </p>
                    </div>
                    {order.size_caption && (
                      <div>
                        <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          {t("production.size")}
                        </p>
                        <p
                          className="font-medium"
                          data-testid={`text-size-${order.production_order_id}`}
                        >
                          {order.size_caption}
                        </p>
                      </div>
                    )}
                  </div>

                  {((order.front_print_colors &&
                    order.front_print_colors.length > 0) ||
                    (order.back_print_colors &&
                      order.back_print_colors.length > 0)) && (
                    <div
                      className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-2"
                      data-testid={`print-colors-${order.production_order_id}`}
                    >
                      <PrintColorsRow
                        label={t("operators.printing.frontColors")}
                        colors={order.front_print_colors || []}
                        side="front"
                      />
                      <PrintColorsRow
                        label={t("operators.printing.backColors")}
                        colors={order.back_print_colors || []}
                        side="back"
                      />
                    </div>
                  )}

                  {(order.printing_cylinder || order.plate_drawer_code) && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm grid grid-cols-2 gap-3">
                      {order.printing_cylinder && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("operators.printing.cylinderSize")}
                          </p>
                          <p
                            className="font-medium"
                            data-testid={`text-printing-cylinder-${order.production_order_id}`}
                          >
                            {order.printing_cylinder}
                          </p>
                        </div>
                      )}
                      {order.plate_drawer_code && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("operators.printing.plateDrawerCode")}
                          </p>
                          <p
                            className="font-bold text-purple-900 dark:text-purple-200"
                            data-testid={`text-plate-drawer-code-${order.production_order_id}`}
                          >
                            {order.plate_drawer_code}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        {t("operators.common.progress")}
                      </span>
                      <span
                        className="font-medium"
                        data-testid={`text-progress-${order.production_order_id}`}
                      >
                        {completedRolls} / {order.total_rolls}{" "}
                        {t("operators.common.roll")}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2"
                      data-testid={`progress-bar-${order.production_order_id}`}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Weight className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("operators.common.totalWeight")}:
                    </span>
                    <span className="font-medium">
                      {formatNumberAr(order.total_weight)}{" "}
                      {t("operators.common.kg")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t("operators.common.availableRolls")}:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {order.rolls.map((roll) => (
                        <div
                          key={roll.roll_id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          data-testid={`roll-item-${roll.roll_id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-medium text-sm"
                                data-testid={`text-roll-number-${roll.roll_id}`}
                              >
                                {roll.roll_number}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {t("operators.common.weight")}:{" "}
                              {formatNumberAr(Number(roll.weight_kg))}{" "}
                              {t("operators.common.kg")}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleMoveToPrinting(roll.roll_id)}
                            disabled={
                              processingRollIds.has(roll.roll_id) ||
                              !selectedMachineId
                            }
                            size="sm"
                            data-testid={`button-move-to-printing-${roll.roll_id}`}
                            title={
                              !selectedMachineId
                                ? t("operators.printing.selectMachineFirst")
                                : ""
                            }
                          >
                            {processingRollIds.has(roll.roll_id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Printer className="h-4 w-4 ml-1" />
                                <span className="hidden sm:inline">
                                  {t("operators.printing.print")}
                                </span>
                              </>
                            )}
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
