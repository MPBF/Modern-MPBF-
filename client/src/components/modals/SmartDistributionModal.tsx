import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Scale,
  Package,
  AlertTriangle,
  Layers,
  Zap,
  TrendingUp,
  Loader2,
  Info,
  CheckCircle,
  XCircle,
  Factory,
  BarChart3,
  Clock,
  Weight,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";

import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface SmartDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDistribute: () => void;
  stage: string;
}

interface DistributionAlgorithm {
  id: string;
  name: string;
  nameArKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
}

interface MachinePreview {
  machineId: number;
  machineName: string;
  machineNameAr: string;
  currentLoad: number;
  proposedLoad: number;
  proposedUtilization: number;
  newCapacityStatus: string;
  proposedOrders: any[];
  productionRate: number;
}

interface DistributionPreviewData {
  totalOrders: number;
  machineCount: number;
  efficiency: number;
  preview: MachinePreview[];
}

interface DistributionPreviewResponse {
  data: DistributionPreviewData;
}

interface MachineCapacityStat {
  machineId: number;
  machineName: string;
  machineNameAr: string;
  currentLoad: number;
  maxCapacity: number;
  utilizationPercentage: number;
  capacityStatus: string;
  orderCount: number;
  productionRate: number;
}

interface CapacityStatsResponse {
  data: MachineCapacityStat[];
}

interface DistributionResult {
  success: boolean;
  message: string;
}

export default function SmartDistributionModal({
  isOpen,
  onClose,
  onDistribute,
  stage,
}: SmartDistributionModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("balanced");
  // Machines in this set are skipped by auto-distribution but remain visible.
  const [excludedMachineIds, setExcludedMachineIds] = useState<Set<string>>(
    new Set(),
  );
  const toggleMachineExclusion = (id: string) => {
    setExcludedMachineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const [hybridParams, setHybridParams] = useState({
    loadWeight: 30,
    capacityWeight: 30,
    priorityWeight: 20,
    typeWeight: 20,
  });

  const algorithms: DistributionAlgorithm[] = [
    {
      id: "balanced",
      name: "Balanced Distribution",
      nameArKey: "modals.smartDistribution.balancedName",
      descriptionKey: "modals.smartDistribution.balancedDesc",
      icon: <Scale className="h-5 w-5" />,
      color: "bg-blue-100 border-blue-300",
    },
    {
      id: "load-based",
      name: "Load-Based Distribution",
      nameArKey: "modals.smartDistribution.loadBasedName",
      descriptionKey: "modals.smartDistribution.loadBasedDesc",
      icon: <Weight className="h-5 w-5" />,
      color: "bg-green-100 border-green-300",
    },
    {
      id: "priority",
      name: "Priority Distribution",
      nameArKey: "modals.smartDistribution.priorityName",
      descriptionKey: "modals.smartDistribution.priorityDesc",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-red-100 border-red-300",
    },
    {
      id: "product-type",
      name: "Product Type Grouping",
      nameArKey: "modals.smartDistribution.productTypeName",
      descriptionKey: "modals.smartDistribution.productTypeDesc",
      icon: <Layers className="h-5 w-5" />,
      color: "bg-purple-100 border-purple-300",
    },
    {
      id: "hybrid",
      name: "Hybrid Optimization",
      nameArKey: "modals.smartDistribution.hybridName",
      descriptionKey: "modals.smartDistribution.hybridDesc",
      icon: <Zap className="h-5 w-5" />,
      color: "bg-orange-100 border-orange-300",
    },
  ];

  // Fetch distribution preview
  const { data: preview, isLoading: isPreviewLoading } =
    useQuery<DistributionPreviewResponse>({
      queryKey: [
        "/api/machine-queues/distribution-preview",
        stage,
        selectedAlgorithm,
        hybridParams,
        [...excludedMachineIds].sort().join(","),
      ],
      queryFn: async () => {
        const excluded = [...excludedMachineIds].join(",");
        const params = new URLSearchParams({
          stage,
          algorithm: selectedAlgorithm,
          ...(selectedAlgorithm === "hybrid"
            ? {
                loadWeight: String(hybridParams.loadWeight),
                capacityWeight: String(hybridParams.capacityWeight),
                priorityWeight: String(hybridParams.priorityWeight),
                typeWeight: String(hybridParams.typeWeight),
              }
            : {}),
          ...(excluded ? { excludedMachineIds: excluded } : {}),
        });
        const response = await fetch(
          `/api/machine-queues/distribution-preview?${params}`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Failed to fetch preview");
        return response.json();
      },
      enabled: isOpen,
    });

  // Fetch machine capacity stats
  const { data: capacityStats } = useQuery<CapacityStatsResponse>({
    queryKey: ["/api/machines/capacity-stats", { stage }],
    enabled: isOpen,
  });

  // Apply distribution mutation
  const distributeMutation = useMutation({
    mutationFn: async (): Promise<DistributionResult> => {
      const response = await apiRequest(
        "/api/machine-queues/smart-distribute",
        {
          method: "POST",
          body: JSON.stringify({
            algorithm: selectedAlgorithm,
            params: {
              stage,
              ...(selectedAlgorithm === "hybrid" ? hybridParams : {}),
              ...(excludedMachineIds.size > 0
                ? { excludedMachineIds: [...excludedMachineIds] }
                : {}),
            },
          }),
        },
      );
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: t("modals.smartDistribution.distributionSuccess"),
          description: result.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/machine-queues"] });
        queryClient.invalidateQueries({ queryKey: ["/api/production-orders"] });
        onDistribute();
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: t("modals.smartDistribution.distributionError"),
        description:
          error.message || t("modals.smartDistribution.distributionFailed"),
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    distributeMutation.mutate();
  };

  const getCapacityStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "text-green-600 bg-green-100";
      case "moderate":
        return "text-blue-600 bg-blue-100";
      case "high":
        return "text-yellow-600 bg-yellow-100";
      case "overloaded":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCapacityStatusLabel = (status: string) => {
    switch (status) {
      case "low":
        return t("modals.smartDistribution.statusLow");
      case "moderate":
        return t("modals.smartDistribution.statusModerate");
      case "high":
        return t("modals.smartDistribution.statusHigh");
      default:
        return t("modals.smartDistribution.statusOverloaded");
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return "bg-red-500";
    if (utilization > 70) return "bg-yellow-500";
    if (utilization > 40) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            {t("modals.smartDistribution.title")}
          </DialogTitle>
          <DialogDescription>
            {t("modals.smartDistribution.description")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="algorithm" className="flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="algorithm" data-testid="tab-algorithm">
              {t("modals.smartDistribution.tabAlgorithm")}
            </TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">
              {t("modals.smartDistribution.tabPreview")}
            </TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">
              {t("modals.smartDistribution.tabStats")}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 h-[500px] mt-4">
            <TabsContent value="algorithm" className="space-y-4">
              <RadioGroup
                value={selectedAlgorithm}
                onValueChange={setSelectedAlgorithm}
              >
                {algorithms.map((algo) => (
                  <Card
                    key={algo.id}
                    className={`cursor-pointer transition-all ${
                      selectedAlgorithm === algo.id
                        ? `${algo.color} border-2`
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedAlgorithm(algo.id)}
                    data-testid={`card-algorithm-${algo.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          value={algo.id}
                          id={algo.id}
                          data-testid={`radio-algorithm-${algo.id}`}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={algo.id}
                            className="flex items-center gap-2 text-base font-semibold cursor-pointer"
                          >
                            {algo.icon}
                            {t(algo.nameArKey)}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t(algo.descriptionKey)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>

              {selectedAlgorithm === "hybrid" && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {t("modals.smartDistribution.hybridCriteria")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>
                          {t("modals.smartDistribution.loadWeightLabel")}
                        </Label>
                        <span className="text-sm font-medium">
                          {hybridParams.loadWeight}%
                        </span>
                      </div>
                      <Slider
                        value={[hybridParams.loadWeight]}
                        onValueChange={([value]) =>
                          setHybridParams({
                            ...hybridParams,
                            loadWeight: value,
                          })
                        }
                        max={100}
                        step={10}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>
                          {t("modals.smartDistribution.capacityWeightLabel")}
                        </Label>
                        <span className="text-sm font-medium">
                          {hybridParams.capacityWeight}%
                        </span>
                      </div>
                      <Slider
                        value={[hybridParams.capacityWeight]}
                        onValueChange={([value]) =>
                          setHybridParams({
                            ...hybridParams,
                            capacityWeight: value,
                          })
                        }
                        max={100}
                        step={10}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>
                          {t("modals.smartDistribution.priorityWeightLabel")}
                        </Label>
                        <span className="text-sm font-medium">
                          {hybridParams.priorityWeight}%
                        </span>
                      </div>
                      <Slider
                        value={[hybridParams.priorityWeight]}
                        onValueChange={([value]) =>
                          setHybridParams({
                            ...hybridParams,
                            priorityWeight: value,
                          })
                        }
                        max={100}
                        step={10}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>
                          {t("modals.smartDistribution.productTypeWeightLabel")}
                        </Label>
                        <span className="text-sm font-medium">
                          {hybridParams.typeWeight}%
                        </span>
                      </div>
                      <Slider
                        value={[hybridParams.typeWeight]}
                        onValueChange={([value]) =>
                          setHybridParams({
                            ...hybridParams,
                            typeWeight: value,
                          })
                        }
                        max={100}
                        step={10}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Machine exclusion section */}
              {capacityStats?.data && capacityStats.data.length > 0 && (
                <Card className="mt-4 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                      استثناء ماكينات من التوزيع التلقائي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      الماكينات المستثناة تبقى مرئية في اللوحة لكنها لا تستقبل
                      طلبات جديدة من التوزيع الذكي.
                    </p>
                    {capacityStats.data.map((stat: MachineCapacityStat) => {
                      const id = String(stat.machineId);
                      const checked = excludedMachineIds.has(id);
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 py-1"
                          data-testid={`exclude-machine-${id}`}
                        >
                          <Checkbox
                            id={`excl-${id}`}
                            checked={checked}
                            onCheckedChange={() => toggleMachineExclusion(id)}
                          />
                          <label
                            htmlFor={`excl-${id}`}
                            className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                          >
                            <span>
                              {stat.machineNameAr || stat.machineName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {stat.orderCount} طلب · {Math.round(stat.utilizationPercentage)}%
                            </span>
                          </label>
                        </div>
                      );
                    })}
                    {excludedMachineIds.size > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {excludedMachineIds.size} ماكينة مستثناة من التوزيع
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {isPreviewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : preview?.data ? (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>
                          {t("modals.smartDistribution.willDistribute", {
                            orders: preview.data.totalOrders,
                            machines: preview.data.machineCount,
                          })}
                        </span>
                        <Badge variant="outline">
                          {t("modals.smartDistribution.distributionEfficiency")}
                          : {preview.data.efficiency}%
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {preview.data.preview?.map((machine: any) => (
                      <Card key={machine.machineId}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Factory className="h-4 w-4" />
                              {machine.machineNameAr || machine.machineName}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getCapacityStatusColor(
                                  machine.newCapacityStatus,
                                )}
                              >
                                {getCapacityStatusLabel(
                                  machine.newCapacityStatus,
                                )}
                              </Badge>
                              <Badge variant="outline">
                                {machine.proposedOrders?.length || 0}{" "}
                                {t("modals.smartDistribution.newOrder")}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>
                                {t("modals.smartDistribution.currentLoad")}:
                              </span>
                              <span className="font-medium">
                                {formatNumberAr(Number(machine.currentLoad), 2)}{" "}
                                {t("modals.smartDistribution.kg")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>
                                {t("modals.smartDistribution.proposedLoad")}:
                              </span>
                              <span className="font-medium">
                                {formatNumberAr(Number(machine.proposedLoad), 2)}{" "}
                                {t("modals.smartDistribution.kg")}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {t(
                                    "modals.smartDistribution.utilizationRate",
                                  )}
                                  :
                                </span>
                                <span>
                                  {machine.proposedUtilization?.toFixed(1)}%
                                </span>
                              </div>
                              <Progress
                                value={machine.proposedUtilization || 0}
                                className="h-2"
                                style={{
                                  backgroundColor: "#e5e5e5",
                                }}
                              >
                                <div
                                  className={`h-full transition-all ${getUtilizationColor(
                                    machine.proposedUtilization || 0,
                                  )}`}
                                  style={{
                                    width: `${machine.proposedUtilization || 0}%`,
                                  }}
                                />
                              </Progress>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {t(
                                  "modals.smartDistribution.expectedProductionTime",
                                )}
                                :{" "}
                                {(
                                  (machine.currentLoad + machine.proposedLoad) /
                                  machine.productionRate
                                ).toFixed(1)}{" "}
                                {t("modals.smartDistribution.hour")}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t("modals.smartDistribution.noUnassignedOrders")}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {capacityStats?.data ? (
                <div className="space-y-3">
                  {capacityStats.data.map((stat: any) => (
                    <Card key={stat.machineId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            {stat.machineNameAr || stat.machineName}
                          </CardTitle>
                          <Badge
                            className={getCapacityStatusColor(
                              stat.capacityStatus,
                            )}
                          >
                            {stat.utilizationPercentage?.toFixed(1)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              {t("modals.smartDistribution.currentLoad")}:
                            </span>
                            <p className="font-medium">
                              {formatNumberAr(Number(stat.currentLoad), 2)}{" "}
                              {t("modals.smartDistribution.kg")}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {t("modals.smartDistribution.maxCapacity")}:
                            </span>
                            <p className="font-medium">
                              {formatNumberAr(Number(stat.maxCapacity), 2)}{" "}
                              {t("modals.smartDistribution.kg")}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {t("modals.smartDistribution.orderCount")}:
                            </span>
                            <p className="font-medium">{stat.orderCount}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {t("modals.smartDistribution.productionRate")}:
                            </span>
                            <p className="font-medium">
                              {stat.productionRate}{" "}
                              {t("modals.smartDistribution.kgPerHour")}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <Progress
                            value={stat.utilizationPercentage || 0}
                            className="h-3"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">
                    {t("modals.smartDistribution.loadingCapacityStats")}
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={distributeMutation.isPending}
            data-testid="button-cancel-distribution"
          >
            {t("modals.smartDistribution.cancel")}
          </Button>
          <Button
            onClick={handleApply}
            disabled={
              distributeMutation.isPending || !preview?.data?.preview?.length
            }
            data-testid="button-apply-distribution"
          >
            {distributeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("modals.smartDistribution.applying")}
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t("modals.smartDistribution.applyDistribution")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
