import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, ChevronDown, ChevronRight, Printer } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";

import { useLocalizedName } from "../../hooks/use-localized-name";
import { useToast } from "../../hooks/use-toast";
import { formatWeight } from "../../lib/formatNumber";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { printRollLabel } from "./RollLabelPrint";

interface GroupedPrintingQueueProps {
  items: any[];
}

interface GroupedRoll {
  id: number;
  roll_seq: number;
  roll_number: string;
  weight_kg: number;
  machine_id: string;
  qr_code_text?: string;
  qr_png_base64?: string;
}

interface ProductionOrderGroup {
  production_order_id: number;
  production_order_number: string;
  rolls: GroupedRoll[];
  total_weight: number;
  rolls_count: number;
}

interface OrderGroup {
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_name_ar: string;
  item_name: string;
  item_name_ar: string;
  size_caption: string;
  production_orders: ProductionOrderGroup[];
  total_weight: number;
  total_rolls: number;
}

interface Machine {
  id: string;
  name: string;
  name_ar: string;
  type: string;
  section_id: number;
  status: string;
}

export default function GroupedPrintingQueue({
  items,
}: GroupedPrintingQueueProps) {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [expandedProductionOrders, setExpandedProductionOrders] = useState<
    Set<number>
  >(new Set());

  // State for machine selection dialog
  const [selectedRollForPrinting, setSelectedRollForPrinting] =
    useState<GroupedRoll | null>(null);
  const [selectedPrintingMachine, setSelectedPrintingMachine] =
    useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch machines
  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch sections to get printing section ID
  const { data: sections = [] } = useQuery<any[]>({
    queryKey: ["/api/sections"],
    staleTime: 10 * 60 * 1000,
  });

  // Filter printing machines (active only)
  const printingSection = sections.find(
    (s) =>
      s.name?.toLowerCase().includes("طباعة") ||
      s.name?.toLowerCase().includes("printing") ||
      s.name_ar?.includes("طباعة"),
  );

  const printingMachines = machines.filter(
    (m) =>
      m.status === "active" &&
      (m.type === "printing" || m.section_id === printingSection?.id),
  );

  // Helper function to calculate completion percentage
  const calculateOrderProgress = (orderGroup: OrderGroup) => {
    const totalRolls = orderGroup.total_rolls;
    if (totalRolls === 0) return 0;

    // In printing stage, assume all rolls are ready for printing
    // Progress is based on rolls that are successfully printed
    // For now, we'll show that all rolls in the queue are pending printing
    return 0; // All rolls in queue are pending printing
  };

  const calculateProductionOrderProgress = (
    productionOrderGroup: ProductionOrderGroup,
  ) => {
    const totalRolls = productionOrderGroup.rolls_count;
    if (totalRolls === 0) return 0;

    // Similar logic - all rolls in printing queue are pending
    return 0; // All rolls are pending printing
  };

  // Group items by order and production order
  const groupedData: OrderGroup[] = items.reduce((acc: OrderGroup[], item) => {
    let orderGroup = acc.find(
      (group: OrderGroup) => group.order_id === item.order_id,
    );

    if (!orderGroup) {
      orderGroup = {
        order_id: item.order_id,
        order_number: item.order_number || `ORD-${item.order_id}`,
        customer_name: item.customer_name || t("production.notSpecified"),
        customer_name_ar:
          item.customer_name_ar ||
          item.customer_name ||
          t("production.notSpecified"),
        item_name: item.item_name || t("production.notSpecified"),
        item_name_ar:
          item.item_name_ar || item.item_name || t("production.notSpecified"),
        size_caption: item.size_caption || "",
        production_orders: [],
        total_weight: 0,
        total_rolls: 0,
      };
      acc.push(orderGroup);
    }

    let productionOrderGroup = orderGroup.production_orders.find(
      (po: ProductionOrderGroup) =>
        po.production_order_id === item.production_order_id,
    );

    if (!productionOrderGroup) {
      productionOrderGroup = {
        production_order_id: item.production_order_id,
        production_order_number:
          item.production_order_number || `PO-${item.production_order_id}`,
        rolls: [],
        total_weight: 0,
        rolls_count: 0,
      };
      orderGroup.production_orders.push(productionOrderGroup);
    }

    const roll: GroupedRoll = {
      id: item.id,
      roll_seq: item.roll_seq,
      roll_number: item.roll_number,
      weight_kg: parseFloat(item.weight_kg) || 0,
      machine_id: item.machine_id,
      qr_code_text: item.qr_code_text,
      qr_png_base64: item.qr_png_base64,
    };

    productionOrderGroup.rolls.push(roll);
    productionOrderGroup.total_weight += roll.weight_kg;
    productionOrderGroup.rolls_count += 1;

    orderGroup.total_weight += roll.weight_kg;
    orderGroup.total_rolls += 1;

    return acc;
  }, [] as OrderGroup[]);

  const processRollMutation = useMutation({
    mutationFn: async ({
      rollId,
      printingMachineId,
    }: {
      rollId: number;
      printingMachineId: string;
    }) => {
      const response = await fetch(`/api/rolls/${rollId}/print`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printing_machine_id: printingMachineId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || t("production.printing.registrationFailed"),
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("messages.success"),
        description: t("production.printing.registeredSuccess"),
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/production/printing-queue"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rolls"] });
      setProcessingId(null);
      setIsDialogOpen(false);
      setSelectedRollForPrinting(null);
      setSelectedPrintingMachine("");
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
      setProcessingId(null);
    },
  });

  const handleOpenPrintDialog = (roll: GroupedRoll) => {
    setSelectedRollForPrinting(roll);
    setSelectedPrintingMachine("");
    setIsDialogOpen(true);
  };

  const handleConfirmPrint = () => {
    if (!selectedRollForPrinting || !selectedPrintingMachine) {
      toast({
        title: t("common.error"),
        description: t("production.printing.selectMachineRequired"),
        variant: "destructive",
      });
      return;
    }

    setProcessingId(selectedRollForPrinting.id);
    processRollMutation.mutate({
      rollId: selectedRollForPrinting.id,
      printingMachineId: selectedPrintingMachine,
    });
  };

  const toggleOrderExpanded = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const toggleProductionOrderExpanded = (productionOrderId: number) => {
    const newExpanded = new Set(expandedProductionOrders);
    if (newExpanded.has(productionOrderId)) {
      newExpanded.delete(productionOrderId);
    } else {
      newExpanded.add(productionOrderId);
    }
    setExpandedProductionOrders(newExpanded);
  };

  if (groupedData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t("production.printing.noRollsInQueue")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {groupedData.map((orderGroup) => (
          <Card
            key={`order-${orderGroup.order_id}`}
            className="border-l-4 border-l-blue-500"
          >
            <Collapsible
              open={expandedOrders.has(orderGroup.order_id)}
              onOpenChange={() => toggleOrderExpanded(orderGroup.order_id)}
            >
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      {expandedOrders.has(orderGroup.order_id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <div className="text-right">
                        <CardTitle className="text-lg">
                          {orderGroup.order_number} -{" "}
                          <span className="font-bold text-blue-700">
                            {ln(
                              orderGroup.customer_name_ar,
                              orderGroup.customer_name,
                            )}
                          </span>
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {ln(orderGroup.item_name_ar, orderGroup.item_name)}{" "}
                          {orderGroup.size_caption &&
                            `- ${orderGroup.size_caption}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-sm text-muted-foreground">
                        <div className="w-20">
                          <Progress
                            value={calculateOrderProgress(orderGroup)}
                            className="h-2"
                          />
                          <span className="text-xs">
                            {calculateOrderProgress(orderGroup)}%
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {orderGroup.total_rolls} {t("production.roll")}
                      </Badge>
                      <Badge variant="outline">
                        {formatNumberAr(orderGroup.total_weight, 2)}{" "}
                        {t("production.units.kg")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {orderGroup.production_orders.map(
                      (productionOrderGroup) => (
                        <Card
                          key={`production-${productionOrderGroup.production_order_id}`}
                          className="bg-gray-50 border-l-2 border-l-orange-400"
                        >
                          <Collapsible
                            open={expandedProductionOrders.has(
                              productionOrderGroup.production_order_id,
                            )}
                            onOpenChange={() =>
                              toggleProductionOrderExpanded(
                                productionOrderGroup.production_order_id,
                              )
                            }
                          >
                            <CollapsibleTrigger className="w-full">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    {expandedProductionOrders.has(
                                      productionOrderGroup.production_order_id,
                                    ) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                    <span className="font-medium">
                                      {
                                        productionOrderGroup.production_order_number
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className="text-sm text-muted-foreground">
                                      <div className="w-16">
                                        <Progress
                                          value={calculateProductionOrderProgress(
                                            productionOrderGroup,
                                          )}
                                          className="h-2"
                                        />
                                        <span className="text-xs">
                                          {calculateProductionOrderProgress(
                                            productionOrderGroup,
                                          )}
                                          %
                                        </span>
                                      </div>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {productionOrderGroup.rolls_count}{" "}
                                      {t("production.roll")}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {formatNumberAr(
                                        productionOrderGroup.total_weight,
                                        2,
                                      )}{" "}
                                      {t("production.units.kg")}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="mt-4 ml-6 space-y-2">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                                    {t("production.rolls")} (
                                    {productionOrderGroup.rolls_count})
                                  </h5>
                                  {productionOrderGroup.rolls.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                      {t("production.noRollsYet")}
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {productionOrderGroup.rolls.map(
                                        (roll) => (
                                          <div
                                            key={`roll-${roll.id}`}
                                            className="border rounded p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                            data-testid={`roll-item-${roll.id}`}
                                          >
                                            <div className="flex flex-col gap-2">
                                              <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                  <p className="font-medium text-sm">
                                                    {roll.roll_number}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {t("production.weight")}:{" "}
                                                    {formatWeight(
                                                      roll.weight_kg,
                                                    )}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {t("production.machine")}:{" "}
                                                    {roll.machine_id}
                                                  </p>
                                                </div>
                                                <Button
                                                  size="sm"
                                                  variant="default"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (processingId !== null)
                                                      return;
                                                    handleOpenPrintDialog(roll);
                                                  }}
                                                  disabled={
                                                    processingId !== null
                                                  }
                                                  data-testid={`button-print-roll-${roll.id}`}
                                                >
                                                  {processingId === roll.id ? (
                                                    <span className="text-xs">
                                                      {t("common.processing")}
                                                    </span>
                                                  ) : (
                                                    <Play className="h-3 w-3" />
                                                  )}
                                                </Button>
                                              </div>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  printRollLabel({
                                                    roll: roll,
                                                    productionOrder: {
                                                      production_order_number:
                                                        productionOrderGroup.production_order_number,
                                                      item_name_ar:
                                                        orderGroup.item_name_ar,
                                                      item_name:
                                                        orderGroup.item_name,
                                                      size_caption:
                                                        orderGroup.size_caption,
                                                    },
                                                    order: {
                                                      order_number:
                                                        orderGroup.order_number,
                                                      customer_name_ar:
                                                        orderGroup.customer_name_ar,
                                                      customer_name:
                                                        orderGroup.customer_name,
                                                    },
                                                  });
                                                }}
                                                data-testid={`button-print-label-${roll.id}`}
                                              >
                                                <Printer className="h-3 w-3 mr-1" />
                                                {t("production.printLabel")}
                                              </Button>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ),
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Machine Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {t("production.printing.selectMachineTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("production.printing.selectMachineDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedRollForPrinting && (
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-sm font-medium">
                  {t("production.printing.selectedRoll")}:
                </p>
                <p className="text-sm text-gray-600">
                  {selectedRollForPrinting.roll_number}
                </p>
                <p className="text-xs text-gray-500">
                  {t("production.weight")}:{" "}
                  {formatWeight(selectedRollForPrinting.weight_kg)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="printing-machine">
                {t("production.printing.printingMachine")} *
              </Label>
              {printingMachines.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    {t("production.printing.noActiveMachines")}
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedPrintingMachine}
                  onValueChange={setSelectedPrintingMachine}
                >
                  <SelectTrigger
                    id="printing-machine"
                    data-testid="select-printing-machine"
                  >
                    <SelectValue
                      placeholder={t(
                        "production.printing.selectPrintingMachine",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {printingMachines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.name_ar || machine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedRollForPrinting(null);
                setSelectedPrintingMachine("");
              }}
              data-testid="button-cancel-print"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleConfirmPrint}
              disabled={
                !selectedPrintingMachine || processRollMutation.isPending
              }
              data-testid="button-confirm-print"
            >
              {processRollMutation.isPending
                ? t("production.printing.registering")
                : t("production.printing.registerPrinting")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
