import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Factory,
  Package,
  Sparkles,
  RefreshCw,
  Clock,
  CalendarDays,
  Scale,
  Layers,
  Ruler,
  Palette,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  MonitorPlay,
  Gauge,
  CheckCircle2,
  MoveHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../components/layout/PageLayout";
import SmartDistributionModal from "../../components/modals/SmartDistributionModal";
import QueueSlideshow from "../../components/production/QueueSlideshow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
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
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useLocalizedName } from "../../hooks/use-localized-name";
import { useToast } from "../../hooks/use-toast";
import { formatNumber } from "../../lib/formatNumber";
import { apiRequest, queryClient } from "../../lib/queryClient";

type Stage = "film" | "printing" | "cutting";
const STAGES: Stage[] = ["film", "printing", "cutting"];

interface BoardOrder {
  production_order_id: number;
  production_order_number: string;
  order_number?: string;
  quantity_kg: string;
  final_quantity_kg: string;
  status: string;
  customer_name?: string;
  customer_name_ar?: string;
  item_name?: string;
  item_name_ar?: string;
  size_caption?: string;
  width?: string;
  thickness?: string;
  raw_material?: string;
  is_printed?: boolean;
  printing_cylinder?: string;
  master_batch_id?: string;
  master_batch_name?: string;
  master_batch_name_ar?: string;
  master_batch_color_hex?: string;
  print_colors_count?: number;
}

interface QueueOrder extends BoardOrder {
  queue_id: number;
  machine_id: string;
  queue_position: number;
  assigned_by_name?: string;
  assigned_by_name_ar?: string;
}

interface MachineStats {
  orderCount: number;
  totalKg: number;
  ratePerHour: number;
  estimatedHours: number;
  estimatedDays: number;
  hoursPerDay: number;
  available: boolean;
  projectedFinish: string | null;
}

interface BoardMachine {
  id: string;
  name: string;
  name_ar: string;
  type: string;
  status: string;
  queue: QueueOrder[];
  stats: MachineStats;
}

interface Board {
  stage: Stage;
  machines: BoardMachine[];
  backlog: BoardOrder[];
}

function OrderCard({
  order,
  stage,
  index,
  total,
  machines,
  onMove,
  onRemove,
  onReassign,
  isQueue = false,
  ln,
  isAr,
}: {
  order: QueueOrder | BoardOrder;
  stage: Stage;
  index?: number;
  total?: number;
  machines: BoardMachine[];
  onMove?: (dir: -1 | 1) => void;
  onRemove?: () => void;
  onReassign: (machineId: string) => void;
  isQueue?: boolean;
  ln: (a?: string | null, e?: string | null) => string;
  isAr: boolean;
}) {
  const customer = ln(order.customer_name_ar, order.customer_name);
  const productName = ln(order.item_name_ar, order.item_name);
  const colorName = isAr
    ? order.master_batch_name_ar || order.master_batch_name
    : order.master_batch_name || order.master_batch_name_ar;

  const activeMachines = machines.filter((m) => m.status === "active");

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 shadow-2xs space-y-3 transition-all hover:border-blue-400">
      {/* الترويسة ورقم الترتيب */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {isQueue && typeof index === "number" && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
            )}
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
              {order.production_order_number}
            </span>
            {order.order_number && (
              <span className="text-[11px] font-semibold text-gray-400">
                طلب: #{order.order_number}
              </span>
            )}
          </div>

          <h4 className="text-sm font-black text-gray-950 dark:text-white leading-tight">
            {productName || order.size_caption || "منتج بدون اسم"}
          </h4>

          {customer && (
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5 truncate">
              {customer}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
            {formatNumber(parseFloat(order.final_quantity_kg) || parseFloat(order.quantity_kg) || 0)} كجم
          </span>

          {isQueue && onMove && typeof index === "number" && typeof total === "number" && (
            <div className="flex items-center gap-1 pt-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md"
                disabled={index === 0}
                onClick={() => onMove(-1)}
                title="تقديم لأعلى"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md"
                disabled={index === total - 1}
                onClick={() => onMove(1)}
                title="تأخير لأسفل"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {onRemove && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-md"
                  onClick={onRemove}
                  title="إلغاء من الطابور"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* شبكة المواصفات الفنية المباشرة (Tech Specs) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-gray-800 text-xs">
        {/* المقاس */}
        <div className="flex items-start gap-1.5">
          <Ruler className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-gray-400 block text-[10px]">المقاس</span>
            <span className="font-black text-gray-900 dark:text-gray-100 truncate block">
              {order.size_caption || (order.width ? `${order.width} سم` : "—")}
            </span>
          </div>
        </div>

        {/* نوع الخام */}
        <div className="flex items-start gap-1.5">
          <Layers className="h-3.5 w-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-gray-400 block text-[10px]">نوع الخام</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 truncate block">
              {order.raw_material || "—"}
            </span>
          </div>
        </div>

        {/* السماكة */}
        <div className="flex items-start gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-gray-400 block text-[10px]">السماكة</span>
            <span className="font-bold text-gray-900 dark:text-gray-100 truncate block">
              {order.thickness ? `${parseFloat(String(order.thickness))} µm` : "—"}
            </span>
          </div>
        </div>

        {/* الماستر باتش */}
        <div className="flex items-start gap-1.5">
          <Palette className="h-3.5 w-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="text-gray-400 block text-[10px]">الماستر باتش</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {order.master_batch_color_hex && (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0"
                  style={{ backgroundColor: order.master_batch_color_hex }}
                />
              )}
              <span className="font-bold text-gray-900 dark:text-gray-100 text-[11px] truncate">
                {colorName || "بدون لون"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* اختيار ماكينة أخرى أو إسناد جديد */}
      <div className="pt-1 flex items-center gap-2">
        <Select onValueChange={(val) => onReassign(val)}>
          <SelectTrigger className="h-8 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200">
            <SelectValue placeholder={isQueue ? "نقل لماكينة أخرى..." : "إسناد لماكينة..."} />
          </SelectTrigger>
          <SelectContent>
            {activeMachines.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-xs font-bold">
                {ln(m.name_ar, m.name)} ({m.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function StageBoard({ stage }: { stage: Stage }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const ln = useLocalizedName();
  const { toast } = useToast();
  const [suggestMachine, setSuggestMachine] = useState<BoardMachine | null>(null);
  const [suggestion, setSuggestion] = useState<QueueOrder[] | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [sortMethod, setSortMethod] = useState("similarity");

  const boardKey = ["/api/production-queues/board", { stage }];
  const { data, isLoading, refetch, isFetching } = useQuery<{ data: Board }>({ queryKey: boardKey });
  const board = data?.data;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: boardKey });

  const assignMutation = useMutation({
    mutationFn: async ({ orderId, machineId }: any) =>
      apiRequest("/api/production-queues/assign", {
        method: "POST",
        body: JSON.stringify({ productionOrderId: orderId, machineId, stage }),
      }),
    onSuccess: () => {
      invalidate();
      toast({ title: "تم إسناد أمر الإنتاج للماكينة بنجاح" });
    },
    onError: (e: any) =>
      toast({
        title: "خطأ في الإسناد",
        description: e?.message || "تعذر إسناد الأمر",
        variant: "destructive",
      }),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ machineId, orderedQueueIds }: any) =>
      apiRequest("/api/production-queues/reorder", {
        method: "PUT",
        body: JSON.stringify({ machineId, orderedQueueIds }),
      }),
    onSuccess: () => invalidate(),
    onError: (e: any) =>
      toast({
        title: "خطأ في إعادة الترتيب",
        description: e?.message,
        variant: "destructive",
      }),
  });

  const removeMutation = useMutation({
    mutationFn: async (queueId: number) =>
      apiRequest(`/api/production-queues/${queueId}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast({ title: "تم إرجاع الأمر إلى قائمة الانتظار" });
    },
    onError: (e: any) =>
      toast({
        title: "خطأ",
        description: e?.message,
        variant: "destructive",
      }),
  });

  const clearMutation = useMutation({
    mutationFn: async () =>
      apiRequest("/api/production-queues/clear-all", {
        method: "POST",
        body: JSON.stringify({ stage }),
      }),
    onSuccess: () => {
      invalidate();
      setClearConfirmOpen(false);
      toast({ title: "تم تفريغ كافة الطوابير بنجاح" });
    },
  });

  const handleMove = (machine: BoardMachine, index: number, dir: -1 | 1) => {
    const ids = machine.queue.map((q) => q.queue_id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderMutation.mutate({ machineId: machine.id, orderedQueueIds: ids });
  };

  const handleReassign = (queueItem: QueueOrder, newMachineId: string) => {
    if (queueItem.machine_id === newMachineId) return;
    removeMutation.mutate(queueItem.queue_id, {
      onSuccess: () => {
        assignMutation.mutate({
          orderId: queueItem.production_order_id,
          machineId: newMachineId,
        });
      },
    });
  };

  const openSuggestion = async (machine: BoardMachine) => {
    setSuggestMachine(machine);
    setSuggestion(null);
    setSuggestLoading(true);
    try {
      const res = await apiRequest(
        `/api/production-queues/suggest?machineId=${encodeURIComponent(
          machine.id,
        )}&stage=${stage}&sortMethod=${encodeURIComponent(sortMethod)}`,
        { method: "GET" },
      );
      const json = await res.json();
      setSuggestion(json.data || []);
    } catch (e: any) {
      toast({
        title: "خطأ",
        description: e?.message,
        variant: "destructive",
      });
      setSuggestMachine(null);
    } finally {
      setSuggestLoading(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestMachine || !suggestion) return;
    reorderMutation.mutate({
      machineId: suggestMachine.id,
      orderedQueueIds: suggestion.map((s) => s.queue_id),
    });
    toast({ title: "تم تطبيق الترتيب الذكي بنجاح" });
    setSuggestMachine(null);
    setSuggestion(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="space-y-4">
      {/* شريط الإجراءات والتحكم */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-black px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
            {board.machines.reduce((acc, m) => acc + m.queue.length, 0)} أوامر مجدولة
          </Badge>
          <Badge variant="outline" className="text-xs font-black px-3 py-1 bg-amber-50 text-amber-700 border-amber-200">
            {board.backlog.length} قيد الانتظار
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setDistributeOpen(true)}
            className="h-9 px-3.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
          >
            <Sparkles className="h-4 w-4" />
            التوزيع الذكي
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setClearConfirmOpen(true)}
            className="h-9 px-3 text-xs font-bold rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <X className="h-4 w-4 ml-1" />
            تفريغ الطوابير
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 w-9 rounded-xl"
            title="تحديث"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* تخطيط الطوابير (الانتظار + المكائن) متناسق للكمبيوتر والجوال */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* عمود الأوامر قيد الانتظار (Backlog) */}
        <div className="lg:col-span-1 bg-slate-50/70 dark:bg-gray-900/60 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-xs font-black flex items-center gap-1.5 text-gray-900 dark:text-white">
              <Layers className="h-4 w-4 text-amber-600" />
              قيد الانتظار (Backlog)
            </span>
            <Badge variant="secondary" className="font-black text-xs">
              {board.backlog.length}
            </Badge>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-0.5">
            {board.backlog.length === 0 ? (
              <p className="text-center text-xs font-bold text-gray-400 py-12">
                لا توجد أوامر معلقة
              </p>
            ) : (
              board.backlog.map((order) => (
                <OrderCard
                  key={order.production_order_id}
                  order={order}
                  stage={stage}
                  machines={board.machines}
                  onReassign={(mId) =>
                    assignMutation.mutate({
                      orderId: order.production_order_id,
                      machineId: mId,
                    })
                  }
                  ln={ln}
                  isAr={!!isAr}
                />
              ))
            )}
          </div>
        </div>

        {/* شبكة المكائن وأوامرها المجدولة */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {board.machines.map((machine) => {
            const finish = machine.stats.projectedFinish
              ? new Date(machine.stats.projectedFinish).toLocaleDateString("en-US")
              : "—";

            return (
              <div
                key={machine.id}
                className="bg-gray-50/50 dark:bg-gray-900/40 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 space-y-3 flex flex-col"
              >
                {/* رأس كرت الماكينة */}
                <div className="pb-2.5 border-b space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-blue-600" />
                      <span className="font-black text-sm text-gray-950 dark:text-white">
                        {ln(machine.name_ar, machine.name)}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        machine.status === "active"
                          ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                          : "border-rose-300 text-rose-700 bg-rose-50"
                      }`}
                    >
                      {machine.status === "active" ? "يعمل" : "صيانة"}
                    </Badge>
                  </div>

                  {/* إحصائيات الماكينة */}
                  <div className="grid grid-cols-3 gap-1 bg-white dark:bg-gray-800 p-2 rounded-xl text-center text-[10px] font-bold">
                    <div>
                      <span className="text-gray-400 block text-[9px]">الأوامر</span>
                      <span className="text-blue-700 dark:text-blue-300">{machine.queue.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">الوزن</span>
                      <span className="text-emerald-700 dark:text-emerald-300">{formatNumber(machine.stats.totalKg)} كجم</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">الوقت المتوقع</span>
                      <span className="text-amber-700 dark:text-amber-300">{machine.stats.estimatedHours} س</span>
                    </div>
                  </div>

                  {/* أداة الترتيب الذكي */}
                  {machine.queue.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSuggestion(machine)}
                      className="w-full h-8 text-xs font-bold gap-1 rounded-xl text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      ترتيب الطابور ذكياً
                    </Button>
                  )}
                </div>

                {/* قائمة الأوامر المجدولة داخل الماكينة */}
                <div className="space-y-2.5 flex-1 min-h-[150px] max-h-[520px] overflow-y-auto pr-0.5">
                  {machine.queue.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="h-8 w-8 mx-auto mb-1 opacity-30" />
                      <p className="text-xs font-bold">الطابور فارغ</p>
                    </div>
                  ) : (
                    machine.queue.map((item, idx) => (
                      <OrderCard
                        key={item.queue_id}
                        order={item}
                        stage={stage}
                        index={idx}
                        total={machine.queue.length}
                        machines={board.machines}
                        isQueue={true}
                        onMove={(dir) => handleMove(machine, idx, dir)}
                        onRemove={() => removeMutation.mutate(item.queue_id)}
                        onReassign={(mId) => handleReassign(item, mId)}
                        ln={ln}
                        isAr={!!isAr}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* نافذة الاقتراح الذكي */}
      <Dialog
        open={!!suggestMachine}
        onOpenChange={(o) => {
          if (!o) {
            setSuggestMachine(null);
            setSuggestion(null);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <Sparkles className="h-4 w-4 text-blue-600" />
              الترتيب المقترح للطابور
            </DialogTitle>
            <DialogDescription className="text-xs">
              تم الترتيب لتقليل تبديل الخامات والمقاسات والألوان
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[50vh] p-1">
            {suggestLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-2">
                {(suggestion || []).map((item, idx) => (
                  <div
                    key={item.queue_id}
                    className="flex items-center gap-2 rounded-xl border p-2.5 bg-gray-50 dark:bg-gray-800/40"
                  >
                    <span className="text-xs font-black text-gray-400 w-4">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-gray-900 dark:text-white">
                        {item.production_order_number} — {ln(item.item_name_ar, item.item_name) || item.size_caption}
                      </div>
                      <div className="text-[11px] text-gray-500 font-semibold">
                        الخام: {item.raw_material} | {item.size_caption}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSuggestMachine(null);
                setSuggestion(null);
              }}
              className="rounded-xl text-xs font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={applySuggestion}
              disabled={suggestLoading || !suggestion?.length}
              className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              اعتماد الترتيب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة التوزيع الذكي */}
      <SmartDistributionModal
        isOpen={distributeOpen}
        stage={stage}
        onClose={() => setDistributeOpen(false)}
        onDistribute={() => invalidate()}
      />

      {/* تأكيد تفريغ الطوابير */}
      <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent className="rounded-2xl" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-base">
              تأكيد تفريغ كافة الطوابير
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500">
              سيتم إرجاع جميع الأوامر المجدولة على المكائن إلى قائمة الانتظار. هل أنت متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={clearMutation.isPending} className="rounded-xl text-xs font-bold">
              تراجع
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                clearMutation.mutate();
              }}
              disabled={clearMutation.isPending}
              className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold"
            >
              {clearMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-1.5" />}
              تأكيد التفريغ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ProductionQueues() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Stage>("film");
  const [slideshowOpen, setSlideshowOpen] = useState(false);

  useEffect(() => {
    STAGES.forEach((s) => {
      queryClient.prefetchQuery({
        queryKey: ["/api/production-queues/board", { stage: s }],
      });
    });
  }, []);

  return (
    <PageLayout
      title="طوابير الإنتاج والجدولة"
      description="توزيع وجدولة أوامر الإنتاج على المكائن بذكاء"
    >
      <div className="space-y-4" dir="rtl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Stage)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 h-11 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full sm:w-80">
              <TabsTrigger value="film" className="rounded-xl font-bold text-xs h-9">
                الفيلم
              </TabsTrigger>
              <TabsTrigger value="printing" className="rounded-xl font-bold text-xs h-9">
                الطباعة
              </TabsTrigger>
              <TabsTrigger value="cutting" className="rounded-xl font-bold text-xs h-9">
                التقطيع
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={() => setSlideshowOpen(true)}
            variant="outline"
            className="h-11 px-4 rounded-2xl text-xs font-bold gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 self-end sm:self-auto"
          >
            <MonitorPlay className="h-4 w-4" />
            شاشة العرض المباشر (Slideshow)
          </Button>
        </div>

        <QueueSlideshow
          isOpen={slideshowOpen}
          onClose={() => setSlideshowOpen(false)}
        />

        <div>
          {tab === "film" && <StageBoard stage="film" />}
          {tab === "printing" && <StageBoard stage="printing" />}
          {tab === "cutting" && <StageBoard stage="cutting" />}
        </div>
      </div>
    </PageLayout>
  );
}