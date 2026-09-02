import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Weight,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  Package,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { formatNumberAr } from "../../../../shared/number-utils";

const MACHINE_STORAGE_KEY = "operator_focus_machine_id";
const ORDER_STORAGE_KEY = "operator_focus_order_id";
const CUSTOMER_STORAGE_KEY = "operator_focus_customer";

interface Machine {
  id: string;
  name_ar: string;
  type: string;
  status: string;
}

interface ActiveOrder {
  id: number;
  production_order_number: string;
  status: string;
  film_completed: boolean;
  quantity_kg: string;
  final_quantity_kg: string | null;
  overrun_percentage: string | null;
  size_caption: string | null;
  thickness: number | string | null;
  raw_material: string | null;
  master_batch_name_ar: string | null;
  master_batch_name_en: string | null;
  customer_name_ar: string | null;
  customer_name_en: string | null;
  product_name_ar: string | null;
  product_name_en: string | null;
  total_weight_produced: string | number;
  rolls_count: string | number;
}

export default function OperatorFocusView() {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const queryClient = useQueryClient();
  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    () => localStorage.getItem(MACHINE_STORAGE_KEY) || "",
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    () => localStorage.getItem(ORDER_STORAGE_KEY) || "",
  );
  const [selectedCustomerKey, setSelectedCustomerKey] = useState<string>(
    () => localStorage.getItem(CUSTOMER_STORAGE_KEY) || "",
  );
  const [weightInput, setWeightInput] = useState("");
  const [isLastRoll, setIsLastRoll] = useState(false);

  const handleMachineChange = (id: string) => {
    setSelectedMachineId(id);
    localStorage.setItem(MACHINE_STORAGE_KEY, id);
  };

  const handleOrderChange = (id: string) => {
    setSelectedOrderId(id);
    localStorage.setItem(ORDER_STORAGE_KEY, id);
  };

  const handleCustomerChange = (key: string) => {
    setSelectedCustomerKey(key);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, key);
    // Reset order selection when customer changes
    setSelectedOrderId("");
    localStorage.removeItem(ORDER_STORAGE_KEY);
  };

  // Fetch available film (extruder) machines for the picker
  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
    select: (data: any) => {
      const rows = Array.isArray(data) ? data : data?.data ?? [];
      return rows.filter(
        (m: Machine) =>
          (m.type === "extruder" || m.type === "film") &&
          m.status !== "retired",
      );
    },
  });

  // Active film production orders (operator chooses which one they're producing)
  const { data: orders = [], isLoading } = useQuery<ActiveOrder[]>({
    queryKey: ["/api/production-orders/active-for-operator"],
    refetchInterval: 30_000,
  });

  // Derive unique customers from active orders
  const uniqueCustomers = useMemo(() => {
    const seen = new Set<string>();
    const list: { key: string; label: string }[] = [];
    for (const o of orders) {
      const label = (isArabic ? o.customer_name_ar : o.customer_name_en) || o.customer_name_ar || "";
      if (label && !seen.has(label)) {
        seen.add(label);
        list.push({ key: label, label });
      }
    }
    return list;
  }, [orders, isArabic]);

  // Filter orders by selected customer
  const filteredOrders = useMemo(() => {
    if (!selectedCustomerKey) return orders;
    return orders.filter((o) => {
      const label = (isArabic ? o.customer_name_ar : o.customer_name_en) || o.customer_name_ar || "";
      return label === selectedCustomerKey;
    });
  }, [orders, selectedCustomerKey, isArabic]);

  // Resolve the currently selected order from the filtered list (fallback to first)
  const activeOrder = useMemo<ActiveOrder | null>(() => {
    if (filteredOrders.length === 0) return null;
    const found = filteredOrders.find((o) => String(o.id) === selectedOrderId);
    return found ?? filteredOrders[0];
  }, [filteredOrders, selectedOrderId]);

  // Keep persisted selection in sync when it falls back to the first order
  useEffect(() => {
    if (activeOrder && String(activeOrder.id) !== selectedOrderId) {
      setSelectedOrderId(String(activeOrder.id));
      localStorage.setItem(ORDER_STORAGE_KEY, String(activeOrder.id));
    }
  }, [activeOrder, selectedOrderId]);

  // Clear stale customer key if it no longer matches any order
  useEffect(() => {
    if (selectedCustomerKey && orders.length > 0 && uniqueCustomers.length > 0) {
      const stillExists = uniqueCustomers.some((c) => c.key === selectedCustomerKey);
      if (!stillExists) {
        setSelectedCustomerKey("");
        localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      }
    }
  }, [uniqueCustomers, selectedCustomerKey, orders.length]);

  // Clear a stale persisted machine ID if it no longer exists (e.g. retired)
  useEffect(() => {
    if (
      selectedMachineId &&
      machines.length > 0 &&
      !machines.some((m) => m.id === selectedMachineId)
    ) {
      setSelectedMachineId("");
      localStorage.removeItem(MACHINE_STORAGE_KEY);
    }
  }, [machines, selectedMachineId]);

  const createRollMutation = useMutation({
    mutationFn: async (payload: {
      weight_kg: number;
      is_last_roll: boolean;
    }) => {
      const endpoint = payload.is_last_roll
        ? "/api/rolls/create-final"
        : "/api/rolls/create-with-timing";
      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({
          production_order_id: activeOrder!.id,
          film_machine_id: selectedMachineId,
          machine_id: selectedMachineId,
          weight_kg: payload.weight_kg,
          is_last_roll: payload.is_last_roll,
          stage: "film",
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      const rollNum = data.roll_number ?? data.roll?.roll_number ?? "—";
      toast({
        title: isArabic ? "✅ تم تسجيل اللفة بنجاح" : "✅ Roll saved successfully",
        description: isArabic
          ? `رقم الرول: ${rollNum}`
          : `Roll number: ${rollNum}`,
      });
      setWeightInput("");
      setIsLastRoll(false);
      queryClient.invalidateQueries({
        queryKey: ["/api/production-orders/active-for-operator"],
      });
    },
    onError: (error: any) => {
      toast({
        title: isArabic ? "❌ فشل تسجيل اللفة" : "❌ Failed to save roll",
        description:
          error?.message ||
          (isArabic
            ? "تجاوزت الكمية المسموحة لأمر الإنتاج"
            : "Exceeded the allowed quantity for this production order"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachineId) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "يرجى اختيار الماكينة أولاً"
          : "Please select a machine first",
        variant: "destructive",
      });
      return;
    }
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "يرجى إدخال وزن صحيح أكبر من الصفر"
          : "Please enter a valid weight greater than zero",
        variant: "destructive",
      });
      return;
    }
    createRollMutation.mutate({ weight_kg: weight, is_last_roll: isLastRoll });
  };

  // ── Selectors (machine + customer + order) ───────────────────────────────
  const selectors = (
    <Card className="border border-slate-200 dark:border-slate-700">
      <CardContent className="flex flex-col gap-3 py-3">
        {/* Row 1: Machine */}
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium shrink-0 min-w-[80px]">
            {isArabic ? "الماكينة:" : "Machine:"}
          </span>
          <Select value={selectedMachineId} onValueChange={handleMachineChange}>
            <SelectTrigger className="h-9 flex-1">
              <SelectValue
                placeholder={isArabic ? "اختر الماكينة…" : "Select machine…"}
              />
            </SelectTrigger>
            <SelectContent>
              {machines.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Customer filter */}
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-red-500 shrink-0" />
          <span className="text-sm font-medium shrink-0 min-w-[80px]">
            {isArabic ? "العميل:" : "Customer:"}
          </span>
          <Select
            value={selectedCustomerKey}
            onValueChange={handleCustomerChange}
            disabled={uniqueCustomers.length === 0}
          >
            <SelectTrigger className="h-9 flex-1 border-red-200 focus:ring-red-400 pl-[13px] pr-[13px] pt-[8px] pb-[8px] mt-[0px] mb-[0px] ml-[-7px] mr-[-7px]">
              <SelectValue
                placeholder={
                  isArabic ? "اختر العميل أولاً…" : "Select customer first…"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {uniqueCustomers.map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 3: Production order (filtered by customer) */}
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium shrink-0 min-w-[80px]">
            {isArabic ? "أمر الإنتاج:" : "Prod. order:"}
          </span>
          <Select
            value={activeOrder ? String(activeOrder.id) : ""}
            onValueChange={handleOrderChange}
            disabled={filteredOrders.length === 0}
          >
            <SelectTrigger className="h-9 flex-1 pl-[4px] pr-[4px]">
              <SelectValue
                placeholder={
                  filteredOrders.length === 0
                    ? isArabic
                      ? selectedCustomerKey
                        ? "لا توجد أوامر لهذا العميل"
                        : "اختر العميل أولاً…"
                      : selectedCustomerKey
                        ? "No orders for this customer"
                        : "Select customer first…"
                    : isArabic
                      ? "اختر أمر الإنتاج…"
                      : "Select production order…"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredOrders.map((o) => {
                const productLabel =
                  (isArabic ? o.product_name_ar : o.product_name_en) ||
                  o.product_name_ar ||
                  "";
                return (
                  <SelectItem key={o.id} value={String(o.id)}>
                    <div className="flex flex-col leading-tight py-0.5">
                      <span className="font-semibold text-sm">{productLabel}{o.size_caption ? ` · ${o.size_caption}` : ""}</span>
                      <span className="text-xs text-gray-400">{o.production_order_number}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 p-4" dir={dir}>
        {selectors}
        <div className="p-8 text-center text-lg text-muted-foreground">
          {isArabic
            ? "جاري تحميل أوامر الإنتاج…"
            : "Loading production orders…"}
        </div>
      </div>
    );
  }

  // ── No active order anywhere ──────────────────────────────────────────────
  if (!activeOrder) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 p-4" dir={dir}>
        {selectors}
        <Card className="border-2 border-dashed border-yellow-400 bg-yellow-50/30 dark:bg-yellow-900/10 text-center p-8">
          <CardHeader className="flex items-center justify-center">
            <AlertTriangle className="h-14 w-14 text-yellow-500" />
            <CardTitle className="text-2xl mt-4 text-yellow-800 dark:text-yellow-400">
              {isArabic
                ? "لا توجد أوامر إنتاج نشطة"
                : "No active production orders"}
            </CardTitle>
            <CardDescription className="text-base text-yellow-700 dark:text-yellow-500">
              {isArabic
                ? "لا توجد حالياً أوامر إنتاج فيلم نشطة. يرجى مراجعة مشرف الصالة."
                : "There are currently no active film production orders. Please check with the hall supervisor."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ── Active order view ─────────────────────────────────────────────────────
  const targetQty = parseFloat(
    activeOrder.final_quantity_kg || activeOrder.quantity_kg || "0",
  );
  const producedQty = parseFloat(String(activeOrder.total_weight_produced || "0"));
  const progressPercent =
    targetQty > 0 ? Math.min(100, (producedQty / targetQty) * 100) : 0;
  const rollsCount = parseInt(String(activeOrder.rolls_count || "0"), 10);

  const productName = isArabic
    ? activeOrder.product_name_ar
    : activeOrder.product_name_en || activeOrder.product_name_ar;
  const colorName = isArabic
    ? activeOrder.master_batch_name_ar
    : activeOrder.master_batch_name_en || activeOrder.master_batch_name_ar;
  const customerName = isArabic
    ? activeOrder.customer_name_ar
    : activeOrder.customer_name_en || activeOrder.customer_name_ar;

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-2 md:p-4" dir={dir}>
      {selectors}

      {/* ── Order identity card ── */}
      <Card className="border-2 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardContent className="pt-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3">
            <div>
              <span className="text-xs text-slate-400 block">
                {isArabic ? "رقم أمر الإنتاج" : "Production order #"}
              </span>
              <span className="text-2xl font-black tracking-wider text-cyan-400">
                {activeOrder.production_order_number}
              </span>
            </div>
            <div className={isArabic ? "text-left" : "text-right"}>
              <span className="text-xs text-slate-400 block">
                {isArabic ? "المواصفات" : "Specs"}
              </span>
              <span className="text-base font-bold bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
                {activeOrder.size_caption || "—"}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-center">
            <span className="text-xs text-slate-400 block mb-1">
              {isArabic ? "اسم المنتج" : "Product name"}
            </span>
            <span className="text-base font-black text-white leading-tight">
              {productName || "—"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">
                {isArabic ? "السماكة" : "Thickness"}
              </span>
              <span className="text-sm font-bold text-amber-400">
                {activeOrder.thickness != null && activeOrder.thickness !== ""
                  ? `${Math.round(Number(activeOrder.thickness))} ${isArabic ? "ميكرون" : "micron"}`
                  : "—"}
              </span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">
                {isArabic ? "الخامة" : "Material"}
              </span>
              <span className="text-sm font-bold text-slate-200">
                {activeOrder.raw_material || "HDPE"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">
                {isArabic ? "اللون" : "Color"}
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {colorName || (isArabic ? "شفاف" : "Clear")}
              </span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">
                {isArabic ? "العميل" : "Customer"}
              </span>
              <span className="text-xs font-bold text-slate-300 leading-tight">
                {customerName || "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Progress counter ── */}
      <Card className="border-2 shadow-lg text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {isArabic
              ? "الوزن المنتج لأمر الإنتاج"
              : "Weight produced for this order"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-center items-baseline gap-2">
            <span className="text-5xl font-black text-primary tracking-tight">
              {formatNumberAr(producedQty, 1)}
            </span>
            <span className="text-lg text-muted-foreground font-bold">
              / {formatNumberAr(targetQty, 0)} {isArabic ? "كجم" : "kg"}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>
                {rollsCount} {isArabic ? "رول مسجل" : "rolls recorded"}
              </span>
              <span>{formatNumberAr(progressPercent, 1)}%</span>
            </div>
            <Progress
              value={progressPercent}
              className="h-4 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Roll entry form ── */}
      <Card className="border-2 border-primary/30 shadow-xl bg-slate-50 dark:bg-slate-900/20">
        <CardContent className="pt-6">
          {!selectedMachineId && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {isArabic
                ? "اختر الماكينة من الأعلى قبل تسجيل اللفة."
                : "Select a machine above before recording a roll."}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Weight className="h-5 w-5 text-primary" />
                {isArabic
                  ? "وزن الرول المنتج (كجم):"
                  : "Produced roll weight (kg):"}
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="0.0"
                className="text-4xl h-20 text-center font-black rounded-xl border-2 border-primary/40 focus-visible:ring-primary shadow-inner"
                autoFocus
                disabled={createRollMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-2 rounded-xl gap-4">
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle2
                  className={`h-6 w-6 shrink-0 ${isLastRoll ? "text-amber-500" : "text-slate-300"}`}
                />
                <div>
                  <span className="font-black text-sm block">
                    {isArabic
                      ? "هل هذا هو الرول النهائي؟"
                      : "Is this the final roll?"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isArabic
                      ? "سيغلق مرحلة الفيلم تلقائياً عند التأكيد."
                      : "This will automatically close the film stage when confirmed."}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isLastRoll}
                onChange={(e) => setIsLastRoll(e.target.checked)}
                className="w-6 h-6 rounded accent-primary cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-16 text-lg font-black rounded-xl shadow-lg transition-transform active:scale-95"
              disabled={createRollMutation.isPending || !selectedMachineId}
            >
              {createRollMutation.isPending
                ? isArabic
                  ? "جاري الحفظ…"
                  : "Saving…"
                : isArabic
                  ? "💾 حفظ اللفة وإصدار الملصق"
                  : "💾 Save roll & print label"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
