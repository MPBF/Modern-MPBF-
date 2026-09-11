import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Beaker,
  Plus,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Pencil,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";

import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Material = {
  id: string;
  item_id: string;
  item_name: string;
  item_name_ar: string;
  weight_kg: string;
  percentage: number;
};

type BatchDetail = {
  id: number;
  batch_number: string;
  production_order_id: number;
  production_order_number?: string;
  machine_id: string;
  machine_name?: string;
  machine_name_ar?: string;
  screw_assignment: string;
  operator_id: number;
  operator_name?: string;
  total_weight_kg: string;
  status: string;
  created_at: string;
  notes?: string;
  composition?: Array<{
    material_name?: string;
    material_name_ar?: string;
    actual_weight_kg?: string;
    percentage: string;
  }>;
  ingredients?: Array<{
    item_id: string;
    item_name?: string;
    item_name_ar?: string;
    actual_weight_kg: string;
    percentage: string;
  }>;
};

interface MasterBatchColor {
  id: string;
  name: string;
  name_ar: string;
  color_hex: string;
  aliases?: string;
}

export default function FilmMaterialMixingTab() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAr = i18n.language?.startsWith("ar");
  const ui = (ar: string, en: string) => (isAr ? ar : en);
  const formatNumber = (value: number, decimals = 2) =>
    isAr
      ? formatNumberAr(value, decimals)
      : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
  const localizedName = (
    nameAr?: string | null,
    nameEn?: string | null,
    fallback = "—",
  ) =>
    isAr
      ? nameAr || nameEn || fallback
      : nameEn && !/[\u0600-\u06FF]/.test(nameEn)
        ? nameEn
        : fallback;
  const safeBackendText = (value?: string | null, fallback = "—") =>
    value && (isAr || !/[\u0600-\u06FF]/.test(value)) ? value : fallback;

  const [productionOrderId, setProductionOrderId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [screw, setScrew] = useState("A");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchDetail | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchDetail | null>(null);
  const [editMachineId, setEditMachineId] = useState("");
  const [editScrew, setEditScrew] = useState("A");
  const [editMaterials, setEditMaterials] = useState<Material[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<BatchDetail | null>(null);

  const { data: masterBatchColors = [] } = useQuery<MasterBatchColor[]>({
    queryKey: ["/api/master-batch-colors"],
    queryFn: async () => {
      const response = await fetch("/api/master-batch-colors");
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || result || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const getMasterBatchText = (code: string | null | undefined): string => {
    if (!code) return "";
    const normalizedCode = code.toUpperCase().trim();
    const colorData = masterBatchColors.find((c) => {
      if (String(c.id).toUpperCase() === normalizedCode) return true;
      if (c.aliases) {
        const aliasArr = c.aliases
          .split(",")
          .map((a) => a.trim().toUpperCase());
        return aliasArr.includes(normalizedCode);
      }
      return false;
    });
    return colorData
      ? localizedName(colorData.name_ar, colorData.name, code)
      : safeBackendText(code, ui("غير معروف", "Unknown"));
  };

  const { data: productionOrdersData, isLoading: ordersLoading } =
    useQuery<any>({
      queryKey: ["/api/production-orders"],
    });

  const allProductionOrders = Array.isArray(productionOrdersData)
    ? productionOrdersData
    : productionOrdersData?.data || [];
  const productionOrders = allProductionOrders.filter(
    (po: any) => po.status === "in_production" || po.status === "pending",
  );

  const { data: machinesData, isLoading: machinesLoading } = useQuery<any>({
    queryKey: ["/api/machines"],
  });

  const allMachines = Array.isArray(machinesData)
    ? machinesData
    : machinesData?.data || [];
  const machines = allMachines.filter(
    (machine: any) => machine.type === "extruder",
  );

  const { data: itemsData, isLoading: itemsLoading } = useQuery<any>({
    queryKey: ["/api/items"],
  });
  const rawMaterials = (itemsData?.data || itemsData || []).filter(
    (item: any) => item.category_id === "CAT10",
  );

  const { data: batchesData, isLoading: batchesLoading } = useQuery<{
    data: BatchDetail[];
  }>({
    queryKey: ["/api/mixing-batches"],
  });
  const batches = batchesData?.data || [];

  const { data: usersData } = useQuery<any>({ queryKey: ["/api/users"] });
  const users = usersData?.data || usersData || [];

  const { data: poBatchesData } = useQuery<{
    data: any[];
    summary: { totalMixedA: number; totalMixedB: number; totalMixed: number };
  }>({
    queryKey: ["/api/mixing-batches/production-order", productionOrderId],
    queryFn: async () => {
      if (!productionOrderId)
        return {
          data: [],
          summary: { totalMixedA: 0, totalMixedB: 0, totalMixed: 0 },
        };
      const response = await fetch(
        `/api/mixing-batches/production-order/${productionOrderId}`,
        { credentials: "include" },
      );
      if (!response.ok)
        return {
          data: [],
          summary: { totalMixedA: 0, totalMixedB: 0, totalMixed: 0 },
        };
      return response.json();
    },
    enabled: !!productionOrderId,
  });

  const selectedOrder = useMemo(() => {
    if (!productionOrderId) return null;
    return (
      productionOrders.find(
        (po: any) => po.id.toString() === productionOrderId,
      ) || null
    );
  }, [productionOrderId, productionOrders]);

  const orderQuantity = useMemo(() => {
    if (!selectedOrder) return 0;
    return parseFloat(
      selectedOrder.final_quantity_kg || selectedOrder.quantity_kg || 0,
    );
  }, [selectedOrder]);

  const previouslyMixed = poBatchesData?.summary?.totalMixed || 0;
  const previouslyMixedA = poBatchesData?.summary?.totalMixedA || 0;
  const previouslyMixedB = poBatchesData?.summary?.totalMixedB || 0;

  const totalWeight = materials.reduce(
    (sum, m) => sum + (parseFloat(m.weight_kg) || 0),
    0,
  );

  const remainingQuantity = orderQuantity - previouslyMixed - totalWeight;
  const mixingProgress =
    orderQuantity > 0
      ? ((previouslyMixed + totalWeight) / orderQuantity) * 100
      : 0;
  const isOverLimit = remainingQuantity < 0;

  const batchesByPO = useMemo(() => {
    const groups = new Map<number, BatchDetail[]>();
    for (const b of batches) {
      const key = b.production_order_id;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(b);
    }
    return Array.from(groups.entries())
      .map(([poId, list]) => {
        const sorted = [...list].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        );
        const totalA = sorted
          .filter((x) => x.screw_assignment === "A")
          .reduce((s, x) => s + (parseFloat(x.total_weight_kg) || 0), 0);
        const totalB = sorted
          .filter((x) => x.screw_assignment === "B")
          .reduce((s, x) => s + (parseFloat(x.total_weight_kg) || 0), 0);
        const po = allProductionOrders.find((p: any) => p.id === poId);
        const orderQty = po
          ? parseFloat(po.final_quantity_kg || po.quantity_kg || "0") || 0
          : 0;

        // Aggregate materials per (item, screw)
        type MatAgg = {
          name?: string;
          name_ar?: string;
          qty: number;
        };
        const aggA = new Map<string, MatAgg>();
        const aggB = new Map<string, MatAgg>();
        for (const batch of sorted) {
          const target = batch.screw_assignment === "A" ? aggA : aggB;
          if (!batch.composition) continue;
          for (const comp of batch.composition) {
            const key =
              (comp as any).item_id ||
              comp.material_name ||
              comp.material_name_ar ||
              "";
            if (!key) continue;
            const qty = parseFloat(comp.actual_weight_kg || "0") || 0;
            const existing = target.get(key);
            if (existing) {
              existing.qty += qty;
            } else {
              target.set(key, {
                name: comp.material_name,
                name_ar: comp.material_name_ar,
                qty,
              });
            }
          }
        }
        const totalAB = totalA + totalB;
        const allKeys = new Set<string>([
          ...Array.from(aggA.keys()),
          ...Array.from(aggB.keys()),
        ]);
        const totalsByMaterial = new Map<string, number>();
        for (const k of Array.from(allKeys)) {
          const a = aggA.get(k)?.qty || 0;
          const b = aggB.get(k)?.qty || 0;
          totalsByMaterial.set(k, a + b);
        }
        const buildRows = (
          m: Map<string, MatAgg>,
          screw: "A" | "B",
          screwTotal: number,
        ) =>
          Array.from(m.entries())
            .map(([key, v]) => ({
              key,
              screw,
              name: v.name,
              name_ar: v.name_ar,
              qty: v.qty,
              pctInScrew:
                screwTotal > 0 ? (v.qty / screwTotal) * 100 : 0,
              pctInTotal:
                totalAB > 0 ? (v.qty / totalAB) * 100 : 0,
              materialTotalQty: totalsByMaterial.get(key) || 0,
              materialTotalPct:
                totalAB > 0
                  ? ((totalsByMaterial.get(key) || 0) / totalAB) * 100
                  : 0,
            }))
            .sort((a, b) => b.qty - a.qty);
        const materialRowsA = buildRows(aggA, "A", totalA);
        const materialRowsB = buildRows(aggB, "B", totalB);
        const pctA = totalAB > 0 ? (totalA / totalAB) * 100 : 0;
        const pctB = totalAB > 0 ? (totalB / totalAB) * 100 : 0;

        return {
          poId,
          poNumber:
            sorted[0].production_order_number || `PO-${poId}`,
          batches: sorted,
          totalA,
          totalB,
          total: totalA + totalB,
          orderQty,
          remaining: Math.max(0, orderQty - (totalA + totalB)),
          latestAt: new Date(sorted[0].created_at).getTime(),
          materialRowsA,
          materialRowsB,
          pctA,
          pctB,
        };
      })
      .sort((a, b) => b.latestAt - a.latestAt);
  }, [batches, allProductionOrders]);

  const updatePercentages = (mats: Material[]) => {
    const total = mats.reduce(
      (sum, m) => sum + (parseFloat(m.weight_kg) || 0),
      0,
    );
    return mats.map((m) => ({
      ...m,
      percentage: total > 0 ? (parseFloat(m.weight_kg) / total) * 100 : 0,
    }));
  };

  const addMaterial = () => {
    if (materials.length >= 10) {
      toast({
        title: t("production.mixing.warning"),
        description: t("production.mixing.maxMaterials"),
        variant: "destructive",
      });
      return;
    }
    const newMaterial: Material = {
      id: Math.random().toString(36).substr(2, 9),
      item_id: "",
      item_name: "",
      item_name_ar: "",
      weight_kg: "",
      percentage: 0,
    };
    setMaterials([...materials, newMaterial]);
  };

  const removeMaterial = (id: string) => {
    const updated = materials.filter((m) => m.id !== id);
    setMaterials(updatePercentages(updated));
  };

  const updateMaterialItem = (id: string, itemId: string) => {
    const item = rawMaterials.find((i: any) => i.id === itemId);
    const updated = materials.map((m) =>
      m.id === id
        ? {
            ...m,
            item_id: itemId,
            item_name: item?.name || "",
            item_name_ar: item?.name_ar || "",
          }
        : m,
    );
    setMaterials(updated);
  };

  const updateMaterialWeight = (id: string, weight: string) => {
    const updated = materials.map((m) =>
      m.id === id ? { ...m, weight_kg: weight } : m,
    );
    setMaterials(updatePercentages(updated));
  };

  const createBatchMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/mixing-batches", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("production.mixing.saveSuccess"),
        description: t("production.mixing.batchCreated"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mixing-batches"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/mixing-batches/production-order", productionOrderId],
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: t("production.mixing.error"),
        description: safeBackendText(
          error.message,
          ui("فشل إنشاء دفعة الخلط", "Failed to create mixing batch"),
        ),
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setProductionOrderId("");
    setMachineId("");
    setScrew("A");
    setMaterials([]);
  };

  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/mixing-batches/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("production.mixing.saveSuccess"),
        description: ui("تم تحديث عملية الخلط بنجاح", "Mixing batch updated successfully"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mixing-batches"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/mixing-batches/production-order"],
      });
      setEditDialogOpen(false);
      setEditingBatch(null);
      setEditMaterials([]);
    },
    onError: (error: any) => {
      toast({
        title: t("production.mixing.error"),
        description: safeBackendText(error.message, ui("فشل تحديث عملية الخلط", "Failed to update mixing batch")),
        variant: "destructive",
      });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/mixing-batches/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: t("production.mixing.saveSuccess"),
        description: ui("تم حذف عملية الخلط بنجاح", "Mixing batch deleted successfully"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mixing-batches"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/mixing-batches/production-order"],
      });
      setDeleteConfirmOpen(false);
      setBatchToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: t("production.mixing.error"),
        description: safeBackendText(error.message, ui("فشل حذف عملية الخلط", "Failed to delete mixing batch")),
        variant: "destructive",
      });
    },
  });

  const editTotalWeight = editMaterials.reduce(
    (sum, m) => sum + (parseFloat(m.weight_kg) || 0),
    0,
  );

  const openEditDialog = async (batch: BatchDetail) => {
    setEditDialogOpen(true);
    setEditLoading(true);
    setEditingBatch(batch);
    setEditMachineId(batch.machine_id);
    setEditScrew(batch.screw_assignment);
    setEditMaterials([]);
    try {
      const response = await fetch(`/api/mixing-batches/${batch.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(ui("فشل تحميل بيانات الخلطة", "Failed to load mixing batch data"));
      const fullBatch: BatchDetail = await response.json();
      setEditingBatch(fullBatch);
      setEditMachineId(fullBatch.machine_id);
      setEditScrew(fullBatch.screw_assignment);
      const mats: Material[] = (fullBatch.ingredients || []).map((ing, idx) => ({
        id: `${fullBatch.id}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        item_id: ing.item_id,
        item_name: ing.item_name || "",
        item_name_ar: ing.item_name_ar || "",
        weight_kg: ing.actual_weight_kg,
        percentage: parseFloat(ing.percentage) || 0,
      }));
      setEditMaterials(mats);
    } catch (e: any) {
      toast({
        title: t("production.mixing.error"),
        description: safeBackendText(e.message, ui("فشل تحميل بيانات الخلطة", "Failed to load mixing batch data")),
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const addEditMaterial = () => {
    if (editMaterials.length >= 10) {
      toast({
        title: t("production.mixing.warning"),
        description: t("production.mixing.maxMaterials"),
        variant: "destructive",
      });
      return;
    }
    setEditMaterials([
      ...editMaterials,
      {
        id: Math.random().toString(36).substr(2, 9),
        item_id: "",
        item_name: "",
        item_name_ar: "",
        weight_kg: "",
        percentage: 0,
      },
    ]);
  };

  const removeEditMaterial = (id: string) => {
    setEditMaterials(updatePercentages(editMaterials.filter((m) => m.id !== id)));
  };

  const updateEditMaterialItem = (id: string, itemId: string) => {
    const item = rawMaterials.find((i: any) => i.id === itemId);
    setEditMaterials(
      editMaterials.map((m) =>
        m.id === id
          ? {
              ...m,
              item_id: itemId,
              item_name: item?.name || "",
              item_name_ar: item?.name_ar || "",
            }
          : m,
      ),
    );
  };

  const updateEditMaterialWeight = (id: string, weight: string) => {
    setEditMaterials(
      updatePercentages(
        editMaterials.map((m) =>
          m.id === id ? { ...m, weight_kg: weight } : m,
        ),
      ),
    );
  };

  const handleUpdate = () => {
    if (!editingBatch) return;
    if (!editMachineId) {
      toast({
        title: t("production.mixing.error"),
        description: t("production.mixing.selectMachine"),
        variant: "destructive",
      });
      return;
    }
    if (editMaterials.length === 0) {
      toast({
        title: t("production.mixing.error"),
        description: t("production.mixing.addAtLeastOneMaterial"),
        variant: "destructive",
      });
      return;
    }
    if (
      editMaterials.some(
        (m) => !m.item_id || !m.weight_kg || parseFloat(m.weight_kg) <= 0,
      )
    ) {
      toast({
        title: t("production.mixing.error"),
        description: t("production.mixing.checkMaterialData"),
        variant: "destructive",
      });
      return;
    }

    const batchPayload = {
      production_order_id: editingBatch.production_order_id,
      machine_id: editMachineId,
      screw_assignment: editScrew,
      total_weight_kg: editTotalWeight.toString(),
    };
    const ingredientsPayload = editMaterials.map((m) => ({
      item_id: m.item_id,
      actual_weight_kg: m.weight_kg,
      percentage: m.percentage.toFixed(2),
    }));

    updateBatchMutation.mutate({
      id: editingBatch.id,
      data: { batch: batchPayload, ingredients: ingredientsPayload },
    });
  };

  const confirmDelete = (batch: BatchDetail) => {
    setBatchToDelete(batch);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!batchToDelete) return;
    deleteBatchMutation.mutate(batchToDelete.id);
  };

  const handleSave = () => {
    if (!productionOrderId) {
      toast({
        title: t("production.mixing.error"),
        description: t("production.mixing.selectProductionOrder"),
        variant: "destructive",
      });
      return;
    }
    if (!machineId) {
      toast({
        title: t("production.mixing.error"),
        description: t("production.mixing.selectMachine"),
        variant: "destructive",
      });
      return;
    }
    if (materials.length === 0) {
      toast({
        title: t("production.mixing.error"),
        description: t("production.mixing.addAtLeastOneMaterial"),
        variant: "destructive",
      });
      return;
    }
    if (
      materials.some(
        (m) => !m.item_id || !m.weight_kg || parseFloat(m.weight_kg) <= 0,
      )
    ) {
      toast({
        title: t("production.mixing.error"),
        description: t("production.mixing.checkMaterialData"),
        variant: "destructive",
      });
      return;
    }

    if (isOverLimit) {
      toast({
        title: t("production.mixing.error"),
        description: ui(
          "مجموع كميات الخلط يتجاوز الكمية المطلوبة في أمر الإنتاج",
          "The total mixed quantity exceeds the production order quantity",
        ),
        variant: "destructive",
      });
      return;
    }

    const batch = {
      production_order_id: parseInt(productionOrderId),
      machine_id: machineId,
      screw_assignment: screw,
      operator_id: user?.id || 1,
      total_weight_kg: totalWeight.toString(),
      status: "completed",
    };

    const ingredients = materials.map((m) => ({
      item_id: m.item_id,
      actual_weight_kg: m.weight_kg,
      percentage: m.percentage.toFixed(2),
    }));

    createBatchMutation.mutate({ batch, ingredients });
  };

  const viewBatchDetails = (batch: BatchDetail) => {
    setSelectedBatch(batch);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            {t("production.mixing.createNewBatch")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("production.mixing.productionOrder")}</Label>
              {ordersLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={productionOrderId}
                  onValueChange={(val) => {
                    setProductionOrderId(val);
                    setMaterials([]);
                  }}
                >
                  <SelectTrigger
                    data-testid="select-production-order"
                    className="min-w-[320px]"
                  >
                    <SelectValue
                      placeholder={t("production.mixing.selectProductionOrder")}
                    />
                  </SelectTrigger>
                  <SelectContent className="min-w-[480px] max-h-[400px]">
                    {productionOrders.map((order: any) => (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        <div className="flex flex-col gap-0.5 py-1">
                          <div className="font-bold text-sm">
                            {order.production_order_number}
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {localizedName(order.customer_name_ar, order.customer_name)}
                            {" | "}
                            {localizedName(order.item_name_ar, order.item_name)}
                            {order.raw_material && ` | ${safeBackendText(order.raw_material, "")}`}
                            {order.master_batch_id &&
                              ` | ${getMasterBatchText(order.master_batch_id)}`}
                            {" | "}
                            {formatNumber(parseFloat(
                              order.final_quantity_kg || order.quantity_kg || 0,
                            ), 1)}{" "}
                            {ui("كغ", "kg")}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("production.mixing.filmMachine")}</Label>
              {machinesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={machineId} onValueChange={setMachineId}>
                  <SelectTrigger data-testid="select-machine">
                    <SelectValue
                      placeholder={t("production.mixing.selectMachine")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine: any) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {localizedName(machine.name_ar, machine.name, machine.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("production.mixing.screw")}</Label>
              <RadioGroup value={screw} onValueChange={setScrew}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem
                      value="A"
                      id="screw-a"
                      data-testid="radio-screw-a"
                    />
                    <Label htmlFor="screw-a">A</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem
                      value="B"
                      id="screw-b"
                      data-testid="radio-screw-b"
                    />
                    <Label htmlFor="screw-b">B</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {selectedOrder && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
              <CardContent className="pt-4 pb-3 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">{ui("العميل:", "Customer:")}</span>
                    <p className="font-semibold">
                      {localizedName(
                        selectedOrder.customer_name_ar,
                        selectedOrder.customer_name,
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{ui("المنتج:", "Product:")}</span>
                    <p className="font-semibold">
                      {localizedName(
                        selectedOrder.item_name_ar,
                        selectedOrder.item_name,
                      ) || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{ui("المادة الخام:", "Raw material:")}</span>
                    <p className="font-semibold">
                      {safeBackendText(selectedOrder.raw_material, "-")}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {ui("لون الماستر باتش:", "Master batch color:")}
                    </span>
                    <p className="font-semibold">
                      {selectedOrder.master_batch_id
                        ? getMasterBatchText(selectedOrder.master_batch_id)
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {ui("الكمية الإجمالية:", "Total quantity:")}
                      </span>
                      <p className="font-bold text-base">
                        {formatNumber(orderQuantity, 2)} {ui("كغ", "kg")}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {ui("المخلوط سابقاً (A+B):", "Previously mixed (A+B):")}
                      </span>
                      <p className="font-semibold">
                        {formatNumber(previouslyMixed, 2)} {ui("كغ", "kg")}
                        <span className="text-xs text-muted-foreground mr-1">
                           (A: {formatNumber(previouslyMixedA, 1)} | B:{" "}
                           {formatNumber(previouslyMixedB, 1)})
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {ui("الخلطة الحالية:", "Current batch:")}
                      </span>
                      <p className="font-semibold">
                        {formatNumber(totalWeight, 2)} {ui("كغ", "kg")}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{ui("المتبقي:", "Remaining:")}</span>
                      <p
                        className={`font-bold text-base ${isOverLimit ? "text-red-600" : remainingQuantity <= 0 ? "text-green-600" : ""}`}
                      >
                        {formatNumber(remainingQuantity, 2)} {ui("كغ", "kg")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ui("نسبة اكتمال الخلط", "Mixing completion")}</span>
                      <span
                        className={isOverLimit ? "text-red-600 font-bold" : ""}
                      >
                        {formatNumber(Math.min(mixingProgress, 100), 1)}%
                        {isOverLimit && ui(" (تجاوز!)", " (Exceeded!)")}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(mixingProgress, 100)}
                      className={`h-3 ${isOverLimit ? "[&>div]:bg-red-500" : mixingProgress >= 100 ? "[&>div]:bg-green-500" : "[&>div]:bg-blue-500"}`}
                    />
                  </div>
                  {isOverLimit && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 dark:bg-red-950/50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        {ui("مجموع كميات الخلط يتجاوز الكمية المطلوبة بـ", "The total mixed quantity exceeds the required quantity by")}{" "}
                        {formatNumber(Math.abs(remainingQuantity), 2)} {ui("كغ", "kg")}
                      </span>
                    </div>
                  )}
                  {!isOverLimit &&
                    remainingQuantity <= 0 &&
                    previouslyMixed > 0 && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 dark:bg-green-950/50 p-2 rounded">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{ui("تم اكتمال خلط كامل الكمية المطلوبة", "Mixing of the full required quantity is complete")}</span>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">
                {t("production.mixing.rawMaterials")}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMaterial}
                data-testid="button-add-material"
              >
                <Plus className="h-4 w-4 ml-2" />
                {t("production.mixing.addMaterial")}
              </Button>
            </div>

            {materials.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {t("production.mixing.noMaterials")}
              </p>
            ) : (
              <div className="space-y-2">
                {materials.map((material, index) => (
                  <div
                    key={material.id}
                    className="grid grid-cols-12 gap-2 items-end"
                    data-testid={`material-row-${index}`}
                  >
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs">
                        {t("production.mixing.material")}
                      </Label>
                      {itemsLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select
                          value={material.item_id}
                          onValueChange={(val) =>
                            updateMaterialItem(material.id, val)
                          }
                        >
                          <SelectTrigger
                            data-testid={`select-material-${index}`}
                          >
                            <SelectValue
                              placeholder={t(
                                "production.mixing.selectMaterial",
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterials.map((item: any) => (
                              <SelectItem key={item.id} value={item.id}>
                                {localizedName(item.name_ar, item.name, item.id)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">
                        {t("production.mixing.weightKg")}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={material.weight_kg}
                        onChange={(e) =>
                          updateMaterialWeight(material.id, e.target.value)
                        }
                        placeholder="0.00"
                        data-testid={`input-weight-${index}`}
                      />
                    </div>

                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">
                        {t("production.mixing.percentage")}
                      </Label>
                      <Input
                        type="text"
                        value={formatNumber(material.percentage, 2) + "%"}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                        data-testid={`text-percentage-${index}`}
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMaterial(material.id)}
                        data-testid={`button-remove-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {materials.length > 0 && (
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>{t("production.mixing.totalWeight")}:</span>
                  <span data-testid="text-total-weight">
                    {formatNumber(totalWeight, 2)} {t("production.mixing.kg")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={createBatchMutation.isPending || isOverLimit}
            className="w-full"
            data-testid="button-save-batch"
          >
            {createBatchMutation.isPending
              ? t("production.mixing.saving")
              : t("production.mixing.saveBatch")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("production.mixing.batchesLog")}</CardTitle>
          {batches.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="print:hidden"
              onClick={() => {
                const printArea = document.getElementById(
                  "mixing-batches-print-area",
                );
                if (!printArea) return;
                const printWindow = window.open("", "_blank");
                if (!printWindow) return;
                printWindow.document
                  .write(`<!DOCTYPE html><html dir="${isAr ? "rtl" : "ltr"}" lang="${isAr ? "ar" : "en"}"><head><meta charset="utf-8"><title>${ui("سجل الخلطات", "Mixing batches log")}</title><style>
                  @page { size: A4 landscape; margin: 10mm; }
                  * { box-sizing: border-box; margin: 0; padding: 0; }
                  body { font-family: 'Cairo','Segoe UI',Tahoma,sans-serif; direction: ${isAr ? "rtl" : "ltr"}; font-size: 11px; color: #000; }
                  .print-container { width: 277mm; padding: 5mm; }
                  .print-title { text-align: center; font-size: 18px; font-weight: 900; margin-bottom: 8px; }
                  .print-date { text-align: center; font-size: 11px; color: #666; margin-bottom: 12px; }
                  .po-section { margin-bottom: 12px; border: 2px solid #b45309; border-radius: 6px; overflow: hidden; page-break-inside: avoid; }
                  .po-header { background: linear-gradient(to left, #fef3c7, #ffedd5); padding: 6px 10px; border-bottom: 2px solid #b45309; font-size: 12px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; align-items: center; }
                  .po-title { font-weight: 900; font-size: 14px; color: #78350f; }
                  .po-meta { font-size: 10px; color: #444; }
                  .tables-wrapper { display: flex; gap: 4mm; width: 100%; padding: 4px; }
                  .screw-section { flex: 1; min-width: 0; }
                  .screw-title { text-align: center; font-size: 12px; font-weight: 800; padding: 3px 0; margin-bottom: 3px; border: 1px solid #333; background: #f0f0f0; }
                  table { width: 100%; border-collapse: collapse; font-size: 10px; }
                  th { background: #e8e8e8; font-weight: 700; padding: 3px 4px; border: 1px solid #999; text-align: right; white-space: nowrap; }
                  td { padding: 2px 4px; border: 1px solid #ccc; text-align: right; vertical-align: top; }
                  tr:nth-child(even) { background: #f8f8f8; }
                  .comp-item { font-size: 9px; line-height: 1.3; }
                  .total-row { font-weight: 800; background: #e0e0e0 !important; font-size: 11px; }
                </style></head><body>`);
                printWindow.document.write(printArea.innerHTML);
                printWindow.document.write("</body></html>");
                printWindow.document.close();
                printWindow.onload = () => {
                  printWindow.print();
                };
              }}
            >
              <Printer className="h-4 w-4 ml-2" />
              {ui("طباعة", "Print")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {batchesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : batches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("production.mixing.noBatches")}
            </p>
          ) : (
            <>
              <div id="mixing-batches-print-area" style={{ display: "none" }}>
                <div className="print-container">
                  <div className="print-title">{ui("سجل الخلطات حسب أوامر الإنتاج", "Mixing batches by production order")}</div>
                  <div className="print-date">
                    {ui("تاريخ الطباعة:", "Print date:")}{" "}
                    {new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  {batchesByPO.map((group) => (
                    <div key={group.poId} className="po-section">
                      <div className="po-header">
                        <span className="po-title">
                          {ui("أمر الإنتاج:", "Production order:")} {group.poNumber}
                        </span>
                        {group.orderQty > 0 && (
                          <span className="po-meta">
                            {ui("كمية الأمر:", "Order quantity:")} {formatNumber(group.orderQty, 2)} {ui("كغ", "kg")} • {ui("المتبقي:", "Remaining:")}{" "}
                            {formatNumber(group.remaining, 2)} {ui("كغ", "kg")}
                          </span>
                        )}
                        <span className="po-meta">
                          {ui("سكرو A:", "Screw A:")} {formatNumber(group.totalA, 2)} {ui("كغ", "kg")} • {ui("سكرو B:", "Screw B:")}{" "}
                          {formatNumber(group.totalB, 2)} {ui("كغ", "kg")} • {ui("الإجمالي:", "Total:")}{" "}
                          {formatNumber(group.total, 2)} {ui("كغ", "kg")}
                        </span>
                      </div>
                      <div className="tables-wrapper">
                        {(["A", "B"] as const).map((screw) => {
                          const screwBatches = group.batches.filter(
                            (b) => b.screw_assignment === screw,
                          );
                          const screwTotal = screwBatches.reduce(
                            (s, b) => s + parseFloat(b.total_weight_kg),
                            0,
                          );
                          return (
                            <div key={screw} className="screw-section">
                              <div className="screw-title">
                                {ui(`سكرو ${screw} (${screwBatches.length} خلطة)`, `Screw ${screw} (${screwBatches.length} batches)`)}
                              </div>
                              <table>
                                <thead>
                                  <tr>
                                    <th>{ui("رقم الخلطة", "Batch number")}</th>
                                    <th>{ui("الماكينة", "Machine")}</th>
                                    <th>{ui("الوزن (كغ)", "Weight (kg)")}</th>
                                    <th>{ui("التاريخ", "Date")}</th>
                                    <th>{ui("المشغل", "Operator")}</th>
                                    <th>{ui("التركيبة", "Composition")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {screwBatches.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={6}
                                        style={{
                                          textAlign: "center",
                                          color: "#888",
                                        }}
                                      >
                                        {ui("لا توجد خلطات", "No batches")}
                                      </td>
                                    </tr>
                                  ) : (
                                    screwBatches.map((batch) => {
                                      const operator = users.find(
                                        (u: any) => u.id === batch.operator_id,
                                      );
                                      return (
                                        <tr key={batch.id}>
                                          <td>{batch.batch_number}</td>
                                          <td>
                                            {localizedName(batch.machine_name_ar, batch.machine_name, batch.machine_id)}
                                          </td>
                                          <td>
                                            {formatNumber(parseFloat(
                                              batch.total_weight_kg,
                                            ), 2)}
                                          </td>
                                          <td>
                                            {new Date(
                                              batch.created_at,
                                            ).toLocaleDateString("en-US")}
                                          </td>
                                          <td>
                                            {localizedName(operator?.display_name_ar, operator?.display_name, "-")}
                                          </td>
                                          <td>
                                            {batch.composition &&
                                            batch.composition.length > 0
                                              ? batch.composition.map(
                                                  (
                                                    comp: any,
                                                    idx: number,
                                                  ) => {
                                                    const qty = parseFloat(
                                                      comp.actual_weight_kg ||
                                                        "0",
                                                    );
                                                    const pct = parseFloat(
                                                      comp.percentage || "0",
                                                    );
                                                    return (
                                                      <div
                                                        key={idx}
                                                        className="comp-item"
                                                      >
                                                        {localizedName(comp.material_name_ar, comp.material_name)}{" "}
                                                        — {formatNumber(qty, 2)} {ui("كغ", "kg")} (
                                                        {formatNumber(pct, 1)}%)
                                                      </div>
                                                    );
                                                  },
                                                )
                                              : "-"}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                  {screwBatches.length > 0 && (
                                    <tr className="total-row">
                                      <td colSpan={2}>{ui("المجموع", "Total")}</td>
                                      <td>{formatNumber(screwTotal, 2)} {ui("كغ", "kg")}</td>
                                      <td colSpan={3}></td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {batchesByPO.map((group) => (
                  <div
                    key={group.poId}
                    className="border-2 border-amber-300 dark:border-amber-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-900"
                    data-testid={`po-group-${group.poId}`}
                  >
                    {/* PO Header */}
                    <div className="bg-gradient-to-l from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 border-b-2 border-amber-300 dark:border-amber-700 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                          {ui("أمر إنتاج", "Production order")}
                        </span>
                        <span className="font-bold text-base text-amber-900 dark:text-amber-100">
                          {group.poNumber}
                        </span>
                        {group.orderQty > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {ui("كمية الأمر:", "Order quantity:")} <span className="font-semibold text-foreground">{formatNumber(group.orderQty, 2)} {ui("كغ", "kg")}</span>
                            {" • "}{ui("المتبقي:", "Remaining:")} <span className="font-semibold text-foreground">{formatNumber(group.remaining, 2)} {ui("كغ", "kg")}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs font-semibold flex-wrap">
                        <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                          {ui("سكرو A:", "Screw A:")} {formatNumber(group.totalA, 2)} {ui("كغ", "kg")} ({formatNumber(group.pctA, 1)}%)
                        </span>
                        <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                          {ui("سكرو B:", "Screw B:")} {formatNumber(group.totalB, 2)} {ui("كغ", "kg")} ({formatNumber(group.pctB, 1)}%)
                        </span>
                        <span className="px-2 py-1 rounded bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100">
                          {ui("الإجمالي:", "Total:")} {formatNumber(group.total, 2)} {ui("كغ", "kg")}
                        </span>
                      </div>
                    </div>

                    {/* Aggregated materials breakdown table */}
                    {(group.materialRowsA.length > 0 || group.materialRowsB.length > 0) && (
                      <div className="border-b-2 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 p-3">
                        <div className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                          <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded">{ui("ملخص", "Summary")}</span>
                          {ui("المواد المخلوطة", "Mixed materials")}
                        </div>
                        <div className="overflow-x-auto rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-amber-100 dark:bg-amber-900/40">
                                <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2 w-16">{ui("السكرو", "Screw")}</TableHead>
                                <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">{ui("المادة", "Material")}</TableHead>
                                <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">{ui("الكمية (كغ)", "Quantity (kg)")}</TableHead>
                                <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">{ui("النسبة", "Percentage")}</TableHead>
                                <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">{ui("النسبة الكلية", "Total percentage")}</TableHead>
                                <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">{ui("الكمية الكلية (كغ)", "Total quantity (kg)")}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.materialRowsA.length === 0 && group.materialRowsB.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center text-muted-foreground py-3 text-xs">
                                     {ui("لا توجد مواد", "No materials")}
                                  </TableCell>
                                </TableRow>
                              ) : (
                                <>
                                  {group.materialRowsA.map((row) => (
                                    <TableRow key={`A-${row.key}`} className="text-xs hover:bg-blue-50/50 dark:hover:bg-blue-950/30">
                                      <TableCell className="px-2 py-1.5">
                                        <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">A</span>
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-medium">
                                        {localizedName(row.name_ar, row.name, row.key)}
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-semibold text-blue-700 dark:text-blue-300">
                                        {formatNumber(row.qty, 2)}
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5">
                                        {formatNumber(row.pctInScrew, 1)}%
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 text-amber-700 dark:text-amber-300 font-medium">
                                        {formatNumber(row.pctInTotal, 1)}%
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 text-amber-700 dark:text-amber-300 font-medium">
                                        {formatNumber(row.materialTotalQty, 2)} ({formatNumber(row.materialTotalPct, 1)}%)
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {group.materialRowsA.length > 0 && (
                                    <TableRow className="bg-blue-50 dark:bg-blue-950/40 border-t border-blue-200 dark:border-blue-800">
                                      <TableCell className="px-2 py-1.5"></TableCell>
                                      <TableCell className="px-2 py-1.5 font-bold text-blue-800 dark:text-blue-200">
                                        {ui("مجموع سكرو A", "Screw A total")}
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-bold text-blue-800 dark:text-blue-200">
                                        {formatNumber(group.totalA, 2)}
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-bold text-blue-800 dark:text-blue-200">
                                        100%
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-bold text-blue-800 dark:text-blue-200">
                                        {formatNumber(group.pctA, 1)}%
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5"></TableCell>
                                    </TableRow>
                                  )}
                                  {group.materialRowsB.map((row) => (
                                    <TableRow key={`B-${row.key}`} className="text-xs hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30">
                                      <TableCell className="px-2 py-1.5">
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">B</span>
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-medium">
                                        {localizedName(row.name_ar, row.name, row.key)}
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                                        {formatNumber(row.qty, 2)}
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5">
                                        {formatNumber(row.pctInScrew, 1)}%
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 text-amber-700 dark:text-amber-300 font-medium">
                                        {formatNumber(row.pctInTotal, 1)}%
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 text-amber-700 dark:text-amber-300 font-medium">
                                        {formatNumber(row.materialTotalQty, 2)} ({formatNumber(row.materialTotalPct, 1)}%)
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {group.materialRowsB.length > 0 && (
                                    <TableRow className="bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800">
                                      <TableCell className="px-2 py-1.5"></TableCell>
                                      <TableCell className="px-2 py-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                                        {ui("مجموع سكرو B", "Screw B total")}
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                                        {formatNumber(group.totalB, 2)}
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                                        100%
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                                        {formatNumber(group.pctB, 1)}%
                                      </TableCell>
                                      <TableCell className="px-2 py-1.5"></TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow className="bg-amber-100 dark:bg-amber-900/40 border-t-2 border-amber-300 dark:border-amber-700">
                                    <TableCell className="px-2 py-2"></TableCell>
                                    <TableCell className="px-2 py-2 font-bold text-amber-900 dark:text-amber-100">
                                      {ui("الإجمالي الكلي", "Grand total")}
                                    </TableCell>
                                    <TableCell className="px-2 py-2 font-bold text-amber-900 dark:text-amber-100">
                                      {formatNumber(group.total, 2)}
                                    </TableCell>
                                    <TableCell className="px-2 py-2"></TableCell>
                                    <TableCell className="px-2 py-2 font-bold text-amber-900 dark:text-amber-100">
                                      100%
                                    </TableCell>
                                    <TableCell className="px-2 py-2"></TableCell>
                                  </TableRow>
                                </>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Two screw tables side-by-side */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 p-3">
                      {(
                        [
                          {
                            screw: "A" as const,
                            label: ui("سكرو A", "Screw A"),
                            borderColor: "border-blue-400 dark:border-blue-600",
                            headerBg: "bg-blue-600 dark:bg-blue-700",
                            headerText: "text-white",
                            totalBg: "bg-blue-50 dark:bg-blue-950/50",
                            hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/30",
                          },
                          {
                            screw: "B" as const,
                            label: ui("سكرو B", "Screw B"),
                            borderColor: "border-emerald-400 dark:border-emerald-600",
                            headerBg: "bg-emerald-600 dark:bg-emerald-700",
                            headerText: "text-white",
                            totalBg: "bg-emerald-50 dark:bg-emerald-950/50",
                            hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30",
                          },
                        ]
                      ).map(({ screw, label, borderColor, headerBg, headerText, totalBg, hoverBg }) => {
                        const screwBatches = group.batches.filter(
                          (b) => b.screw_assignment === screw,
                        );
                        const screwTotal = screwBatches.reduce(
                          (s, b) => s + parseFloat(b.total_weight_kg),
                          0,
                        );
                        return (
                          <div
                            key={screw}
                            className={`border ${borderColor} rounded-md overflow-hidden`}
                          >
                            <div
                              className={`${headerBg} ${headerText} text-center py-1.5 font-bold text-sm`}
                            >
                              {label}
                              <span className="text-xs font-normal mr-2 opacity-90">
                                ({screwBatches.length} {ui("خلطة", "batches")} — {formatNumber(screwTotal, 2)} {ui("كغ", "kg")})
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                    <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">
                                      {ui("رقم الخلطة", "Batch number")}
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">
                                      {ui("الماكينة", "Machine")}
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">
                                      {ui("الوزن", "Weight")}
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">
                                      {ui("التاريخ", "Date")}
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">
                                      {ui("المشغل", "Operator")}
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold whitespace-nowrap px-2">
                                      {ui("التركيبة", "Composition")}
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold whitespace-nowrap px-1 w-10"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {screwBatches.length === 0 ? (
                                    <TableRow>
                                      <TableCell
                                        colSpan={7}
                                        className="text-center text-muted-foreground py-4 text-xs"
                                      >
                                        {ui(`لا توجد خلطات للـ ${label}`, `No batches for ${label}`)}
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    <>
                                      {screwBatches.map((batch, index) => {
                                        const operator = users.find(
                                          (u: any) => u.id === batch.operator_id,
                                        );
                                        return (
                                          <TableRow
                                            key={batch.id}
                                            className={`${hoverBg} cursor-pointer text-xs ${index % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/20"}`}
                                            data-testid={`row-batch-${batch.id}`}
                                          >
                                            <TableCell className="font-semibold px-2 py-1.5">
                                              {batch.batch_number}
                                            </TableCell>
                                            <TableCell className="px-2 py-1.5">
                                              {localizedName(batch.machine_name_ar, batch.machine_name, batch.machine_id)}
                                            </TableCell>
                                            <TableCell className="px-2 py-1.5 font-medium">
                                              {formatNumber(parseFloat(batch.total_weight_kg), 2)}
                                            </TableCell>
                                            <TableCell className="px-2 py-1.5" dir="ltr">
                                              {new Date(batch.created_at).toLocaleDateString("en-US")}
                                            </TableCell>
                                            <TableCell className="px-2 py-1.5">
                                              {localizedName(operator?.display_name_ar, operator?.display_name, "-")}
                                            </TableCell>
                                            <TableCell className="px-2 py-1.5">
                                              <div className="space-y-0.5">
                                                {batch.composition && batch.composition.length > 0 ? (
                                                  batch.composition.map((comp: any, idx: number) => {
                                                    const qty = parseFloat(comp.actual_weight_kg || "0");
                                                    const pct = parseFloat(comp.percentage || "0");
                                                    return (
                                                      <div key={idx} className="text-[10px] leading-tight flex items-center gap-1 flex-wrap">
                                                        <span className="font-medium">
                                                          {localizedName(comp.material_name_ar, comp.material_name)}
                                                        </span>
                                                        <span className="text-blue-700 dark:text-blue-300 font-semibold">
                                                          {formatNumber(qty, 2)} {ui("كغ", "kg")}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                          ({formatNumber(pct, 1)}%)
                                                        </span>
                                                      </div>
                                                    );
                                                  })
                                                ) : (
                                                  <span className="text-muted-foreground">-</span>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="px-1 py-1.5">
                                              <div className="flex items-center gap-0.5">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7"
                                                  onClick={() => viewBatchDetails(batch)}
                                                  data-testid={`button-view-${batch.id}`}
                                                >
                                                  <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                  onClick={() => openEditDialog(batch)}
                                                  data-testid={`button-edit-${batch.id}`}
                                                >
                                                  <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                  onClick={() => confirmDelete(batch)}
                                                  data-testid={`button-delete-${batch.id}`}
                                                >
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                      <TableRow className={`${totalBg} border-t-2`}>
                                        <TableCell
                                          colSpan={2}
                                          className="text-right font-bold px-2 py-2"
                                        >
                                          {ui("المجموع", "Total")}
                                        </TableCell>
                                        <TableCell className="font-bold px-2 py-2">
                                          {formatNumber(screwTotal, 2)} {ui("كغ", "kg")}
                                        </TableCell>
                                        <TableCell colSpan={4}></TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl" dir={isAr ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("production.mixing.batchDetails")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("production.mixing.batchDetailsDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    {t("production.mixing.batchNumber")}
                  </Label>
                  <p className="font-semibold">{selectedBatch.batch_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("production.mixing.productionOrder")}
                  </Label>
                  <p className="font-semibold">
                    {selectedBatch.production_order_number ||
                      `PO-${selectedBatch.production_order_id}`}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("production.mixing.machine")}
                  </Label>
                  <p className="font-semibold">
                    {localizedName(selectedBatch.machine_name_ar, selectedBatch.machine_name, selectedBatch.machine_id)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("production.mixing.screw")}
                  </Label>
                  <p className="font-semibold">
                    {selectedBatch.screw_assignment}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("production.mixing.totalWeightLabel")}
                  </Label>
                  <p className="font-semibold">
                    {formatNumber(parseFloat(selectedBatch.total_weight_kg), 2)}{" "}
                    {t("production.mixing.kg")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("production.mixing.date")}
                  </Label>
                  <p className="font-semibold">
                    {new Date(selectedBatch.created_at).toLocaleString("en-US")}
                  </p>
                </div>
              </div>

              {selectedBatch.ingredients &&
                selectedBatch.ingredients.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">
                      {t("production.mixing.ingredients")}
                    </Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t("production.mixing.material")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("production.mixing.weightKg")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("production.mixing.percentage")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedBatch.ingredients.map((ing, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {localizedName(ing.item_name_ar, ing.item_name, ing.item_id) ||
                                ing.item_id}
                            </TableCell>
                            <TableCell>
                              {formatNumber(parseFloat(ing.actual_weight_kg), 2)}
                            </TableCell>
                            <TableCell>
                              {formatNumber(parseFloat(ing.percentage), 2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

              {selectedBatch.notes && (
                <div>
                  <Label className="text-muted-foreground">
                    {t("production.mixing.notes")}
                  </Label>
                  <p className="font-medium">{selectedBatch.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          dir={isAr ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <DialogTitle>
              {ui("تعديل خلطة", "Edit batch")} {editingBatch?.batch_number || ""}
            </DialogTitle>
            <DialogDescription>
              {ui("يمكنك تعديل الماكينة، البريمة، المواد، والأوزان", "You can edit the machine, screw, materials, and weights")}
            </DialogDescription>
          </DialogHeader>
          {editLoading && (
            <div className="space-y-3 py-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}
          {!editLoading && editingBatch && (
            <div className="space-y-4">
              {/* Production Order (read-only) */}
              <div>
                <Label className="text-muted-foreground">
                  {t("production.mixing.productionOrder")}
                </Label>
                <p className="font-semibold mt-1">
                  {editingBatch.production_order_number ||
                    `PO-${editingBatch.production_order_id}`}
                </p>
              </div>

              {/* Machine */}
              <div>
                <Label>{t("production.mixing.machine")}</Label>
                <Select
                  value={editMachineId}
                  onValueChange={setEditMachineId}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-testid="select-edit-machine"
                  >
                    <SelectValue
                      placeholder={t("production.mixing.selectMachine")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
                        {localizedName(m.name_ar, m.name, m.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Screw */}
              <div>
                <Label>{t("production.mixing.screw")}</Label>
                <RadioGroup
                  value={editScrew}
                  onValueChange={setEditScrew}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="A"
                      id="edit-screw-a"
                      data-testid="radio-edit-screw-a"
                    />
                    <Label htmlFor="edit-screw-a" className="cursor-pointer">
                      A
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="B"
                      id="edit-screw-b"
                      data-testid="radio-edit-screw-b"
                    />
                    <Label htmlFor="edit-screw-b" className="cursor-pointer">
                      B
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Materials */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">
                    {t("production.mixing.ingredients")}
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addEditMaterial}
                    data-testid="button-add-edit-material"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    {t("production.mixing.addMaterial")}
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">
                        {t("production.mixing.material")}
                      </TableHead>
                      <TableHead className="text-right w-32">
                        {t("production.mixing.weightKg")}
                      </TableHead>
                      <TableHead className="text-right w-24">
                        {t("production.mixing.percentage")}
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editMaterials.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-4"
                        >
                          {ui("لا توجد مواد - أضف مادة للبدء", "No materials — add a material to begin")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      editMaterials.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <Select
                              value={m.item_id}
                              onValueChange={(v) =>
                                updateEditMaterialItem(m.id, v)
                              }
                            >
                              <SelectTrigger
                                data-testid={`select-edit-material-${m.id}`}
                              >
                                <SelectValue
                                  placeholder={t(
                                    "production.mixing.selectMaterial",
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {rawMaterials.map((item: any) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {localizedName(item.name_ar, item.name, item.id)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={m.weight_kg}
                              onChange={(e) =>
                                updateEditMaterialWeight(m.id, e.target.value)
                              }
                              data-testid={`input-edit-weight-${m.id}`}
                            />
                          </TableCell>
                          <TableCell>{formatNumber(m.percentage, 2)}%</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600"
                              onClick={() => removeEditMaterial(m.id)}
                              data-testid={`button-remove-edit-material-${m.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="mt-2 flex justify-end text-sm font-semibold">
                  {ui("المجموع:", "Total:")} {formatNumber(editTotalWeight, 2)}{" "}
                  {t("production.mixing.kg")}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              {t("common.cancel", { defaultValue: ui("إلغاء", "Cancel") })}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateBatchMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateBatchMutation.isPending
                ? ui("جارٍ الحفظ...", "Saving...")
                : ui("حفظ التعديلات", "Save changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
      >
        <AlertDialogContent dir={isAr ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{ui("تأكيد حذف عملية الخلط", "Confirm mixing batch deletion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {ui("هل أنت متأكد من حذف الخلطة", "Are you sure you want to delete batch")}{" "}
              <span className="font-bold">
                {batchToDelete?.batch_number}
              </span>
              {ui("؟ سيتم حذف الخلطة ومكوّناتها نهائيًا ولا يمكن التراجع عن هذه العملية.", "? The batch and its ingredients will be permanently deleted and this cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel data-testid="button-cancel-delete">
              {ui("إلغاء", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBatchMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteBatchMutation.isPending ? ui("جارٍ الحذف...", "Deleting...") : ui("حذف", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
