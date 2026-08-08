import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  GripVertical,
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
  Droplet,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  MonitorPlay,
  Brain,
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
  CardTitle,
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

function ColorSwatch({ order }: { order: BoardOrder }) {
  if (!order.master_batch_color_hex) return null;
  return (
    <span
      className="inline-block h-3 w-3 rounded-full border border-gray-300 align-middle"
      style={{ backgroundColor: order.master_batch_color_hex }}
      title={order.master_batch_name_ar || order.master_batch_name || ""}
    />
  );
}

function OrderDetails({
  order,
  t,
  ln,
  stage,
}: {
  order: BoardOrder;
  t: (k: string) => string;
  ln: (a?: string | null, e?: string | null) => string;
  stage: Stage;
}) {
  const customer = ln(order.customer_name_ar, order.customer_name);
  const colorName = ln(order.master_batch_name_ar, order.master_batch_name);
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm">
          {order.production_order_number}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatNumber(parseFloat(order.final_quantity_kg) || 0)}{" "}
          {t("common.kg")}
        </span>
      </div>
      {customer && (
        <div className="text-xs font-medium text-gray-800 dark:text-gray-100">
          {customer}
        </div>
      )}
      {(order.size_caption || order.width || order.thickness) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          {order.size_caption && (
            <span className="font-bold text-red-600 dark:text-red-400">
              {order.size_caption}
            </span>
          )}
          {order.width && (
            <span
              className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400"
              title="عرض الفيلم (سم)"
            >
              <Ruler className="h-3 w-3" />
              {formatNumber(parseFloat(order.width) || 0)} سم
            </span>
          )}
          {order.thickness && (
            <span
              className="flex items-center gap-1 font-semibold text-muted-foreground"
              title={t("production.queues.thickness")}
              aria-label={t("production.queues.thickness")}
            >
              <Layers className="h-3 w-3" />
              {formatNumber(parseFloat(order.thickness) || 0)}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {order.raw_material && (
          <span
            className="flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400"
            title={t("production.queues.material")}
            aria-label={t("production.queues.material")}
          >
            <Package className="h-3 w-3" />
            {order.raw_material}
          </span>
        )}
        {(colorName || order.master_batch_color_hex) && (
          <span
            className="inline-flex items-center gap-1"
            title={t("production.masterBatchColor")}
            aria-label={t("production.masterBatchColor")}
          >
            {order.master_batch_color_hex ? (
              <ColorSwatch order={order} />
            ) : (
              <Droplet className="h-3 w-3" />
            )}
            {colorName || order.master_batch_id}
          </span>
        )}
        {stage === "printing" &&
          typeof order.print_colors_count === "number" &&
          order.print_colors_count > 0 && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-1 py-0 text-[10px]"
              title={t("production.queues.printColors")}
              aria-label={t("production.queues.printColors")}
            >
              <Palette className="h-3 w-3" />
              {order.print_colors_count}
            </Badge>
          )}
      </div>
    </div>
  );
}

function SortableQueueCard({
  item,
  machineId,
  index,
  total,
  t,
  ln,
  stage,
  onMove,
  onRemove,
}: {
  item: QueueOrder;
  machineId: string;
  index: number;
  total: number;
  t: (k: string) => string;
  ln: (a?: string | null, e?: string | null) => string;
  stage: Stage;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `queue-${item.queue_id}`,
    data: { item, machineId, type: "queue" },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card data-testid={`card-queue-${item.queue_id}`}>
        <CardContent className="p-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-xs font-bold text-muted-foreground w-4 text-center">
              {index + 1}
            </span>
            <div
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab hover:cursor-grabbing text-muted-foreground"
              data-testid={`drag-${item.queue_id}`}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <OrderDetails order={item} t={t} ln={ln} stage={stage} />
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                disabled={index === 0}
                onClick={() => onMove(-1)}
                data-testid={`up-${item.queue_id}`}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                disabled={index === total - 1}
                onClick={() => onMove(1)}
                data-testid={`down-${item.queue_id}`}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive"
                onClick={onRemove}
                data-testid={`remove-${item.queue_id}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {icon}
      <span className="font-medium text-gray-700 dark:text-gray-200">
        {value}
      </span>
      <span>{label}</span>
    </div>
  );
}

const SORT_METHOD_LABELS: Record<string, string> = {
  similarity: "تشابه",
  throughput: "إنتاجية",
  color_first: "لون أولاً",
};

function MachineColumn({
  machine,
  stage,
  t,
  ln,
  sortMethod,
  onSortMethodChange,
  onReorder,
  onRemove,
  onSuggest,
}: {
  machine: BoardMachine;
  stage: Stage;
  t: (k: string) => string;
  ln: (a?: string | null, e?: string | null) => string;
  sortMethod: string;
  onSortMethodChange: (m: string) => void;
  onReorder: (machineId: string, orderedQueueIds: number[]) => void;
  onRemove: (queueId: number) => void;
  onSuggest: (machine: BoardMachine) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: `machine-${machine.id}`,
    data: { machineId: machine.id, type: "machine" },
  });
  const items = machine.queue.map((q) => `queue-${q.queue_id}`);
  const statusIcon =
    machine.status === "active"
      ? "🟢"
      : machine.status === "maintenance"
        ? "🟠"
        : "🔴";

  const move = (index: number, dir: -1 | 1) => {
    const ids = machine.queue.map((q) => q.queue_id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onReorder(machine.id, ids);
  };

  const finish = machine.stats.projectedFinish
    ? new Date(machine.stats.projectedFinish).toLocaleDateString()
    : "—";

  // ── Queue summary (computed from current queue) ───────────────────────
  const queueMaterials = Array.from(
    new Set(
      machine.queue
        .map((q) => (q.raw_material || "").trim())
        .filter(Boolean),
    ),
  );
  const queueColors = Array.from(
    new Set(machine.queue.map((q) => q.master_batch_id).filter(Boolean)),
  );
  const queueWidths = machine.queue
    .map((q) => parseFloat(String(q.width || "")))
    .filter((v) => !isNaN(v) && v > 0);
  const widthRange =
    queueWidths.length > 0
      ? { min: Math.round(Math.min(...queueWidths)), max: Math.round(Math.max(...queueWidths)) }
      : null;
  const colorChanges = machine.queue.reduce((changes, item, idx, arr) => {
    if (idx === 0) return 0;
    return (
      changes +
      (item.master_batch_id !== arr[idx - 1].master_batch_id ? 1 : 0)
    );
  }, 0);

  // ── Historical learning insights ──────────────────────────────────────
  const { data: insightResp } = useQuery<{ data: any }>({
    queryKey: [
      "/api/production-queues/machine-insights",
      machine.id,
      stage,
    ],
    queryFn: async () => {
      const res = await apiRequest(
        `/api/production-queues/machine-insights/${encodeURIComponent(
          machine.id,
        )}?stage=${stage}`,
        { method: "GET" },
      );
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const insights = insightResp?.data;

  return (
    <Card className="w-full" data-testid={`column-machine-${machine.id}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            {ln(machine.name_ar, machine.name)}
          </span>
          <span className="text-sm">{statusIcon}</span>
        </CardTitle>

        {/* Production stats */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          <StatLine
            icon={<Package className="h-3 w-3" />}
            label={t("production.queues.ordersStat")}
            value={String(machine.stats.orderCount)}
          />
          <StatLine
            icon={<Scale className="h-3 w-3" />}
            label={t("common.kg")}
            value={formatNumber(machine.stats.totalKg)}
          />
          <StatLine
            icon={<Clock className="h-3 w-3" />}
            label={t("production.queues.hours")}
            value={formatNumber(machine.stats.estimatedHours)}
          />
          <StatLine
            icon={<CalendarDays className="h-3 w-3" />}
            label={t("production.queues.days")}
            value={
              machine.stats.estimatedDays > 0
                ? machine.stats.available
                  ? `${machine.stats.estimatedDays} · ${finish}`
                  : `${machine.stats.estimatedDays} · —`
                : "—"
            }
          />
        </div>

        {/* Queue summary bar — material / width range / colour changes */}
        {machine.queue.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs mt-1.5 pt-1.5 border-t">
            {queueMaterials.map((mat) => (
              <Badge
                key={mat}
                variant="outline"
                className="px-1.5 py-0 text-orange-700 border-orange-300 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/30"
              >
                {mat}
              </Badge>
            ))}
            {widthRange && (
              <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium">
                <Ruler className="h-3 w-3" />
                {widthRange.min === widthRange.max
                  ? `${widthRange.min}`
                  : `${widthRange.min}–${widthRange.max}`}{" "}
                سم
              </span>
            )}
            {queueColors.length > 0 && (
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <Palette className="h-3 w-3" />
                {queueColors.length}{" "}
                {queueColors.length === 1 ? "لون" : "ألوان"}
                {colorChanges > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 mr-1">
                    · {colorChanges} تغيير
                  </span>
                )}
              </span>
            )}
          </div>
        )}

        {/* Historical learning insight */}
        {insights && insights.totalRolls > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs mt-1 pt-1 border-t border-dashed text-muted-foreground">
            <Brain className="h-3 w-3 text-purple-500 flex-shrink-0" />
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              {insights.totalRolls} رول منجز
            </span>
            {insights.dominantMaterial && (
              <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                {insights.dominantMaterial}
              </Badge>
            )}
            {insights.topColors?.[0] && (
              <span className="flex items-center gap-1">
                {insights.topColors[0].hex && (
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: insights.topColors[0].hex }}
                  />
                )}
                <span>
                  {insights.topColors[0].name_ar ||
                    insights.topColors[0].name ||
                    insights.topColors[0].id}
                </span>
              </span>
            )}
            {insights.widthRange && (
              <span>
                {insights.widthRange.min === insights.widthRange.max
                  ? `${insights.widthRange.min} سم`
                  : `${insights.widthRange.min}–${insights.widthRange.max} سم`}
              </span>
            )}
          </div>
        )}

        {/* Sort method selector + Smart suggest button */}
        <div className="flex gap-1 mt-2">
          <Select value={sortMethod} onValueChange={onSortMethodChange}>
            <SelectTrigger
              className="h-7 text-xs flex-1"
              data-testid={`sort-method-${machine.id}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_METHOD_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-7 text-xs whitespace-nowrap"
            disabled={machine.queue.length < 2}
            onClick={() => onSuggest(machine)}
            data-testid={`suggest-${machine.id}`}
          >
            <Sparkles className="h-3 w-3" />
            ترتيب
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-[260px] pr-1">
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div
              ref={setNodeRef}
              className="min-h-[80px]"
              data-testid={`dropzone-machine-${machine.id}`}
            >
              {machine.queue.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">
                    {t("production.queues.noProductionOrders")}
                  </p>
                </div>
              ) : (
                machine.queue.map((item, idx) => (
                  <SortableQueueCard
                    key={item.queue_id}
                    item={item}
                    machineId={machine.id}
                    index={idx}
                    total={machine.queue.length}
                    t={t}
                    ln={ln}
                    stage={stage}
                    onMove={(dir) => move(idx, dir)}
                    onRemove={() => onRemove(item.queue_id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function SortableBacklogCard({
  order,
  machines,
  t,
  ln,
  stage,
  onAssign,
}: {
  order: BoardOrder;
  machines: BoardMachine[];
  t: (k: string) => string;
  ln: (a?: string | null, e?: string | null) => string;
  stage: Stage;
  onAssign: (orderId: number, machineId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `order-${order.production_order_id}`,
    data: { item: order, type: "backlog" },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const activeMachines = machines.filter((m) => m.status === "active");
  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card data-testid={`card-backlog-${order.production_order_id}`}>
        <CardContent className="p-2">
          <div className="flex items-start gap-2">
            <div
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab hover:cursor-grabbing text-muted-foreground"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <OrderDetails order={order} t={t} ln={ln} stage={stage} />
              {activeMachines.length > 0 && (
                <Select
                  onValueChange={(v) =>
                    onAssign(order.production_order_id, v)
                  }
                >
                  <SelectTrigger
                    className="mt-2 h-7 text-xs"
                    data-testid={`assign-select-${order.production_order_id}`}
                  >
                    <SelectValue
                      placeholder={t("production.queues.assignTo")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activeMachines.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {ln(m.name_ar, m.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BacklogColumn({
  backlog,
  machines,
  t,
  ln,
  stage,
  onAssign,
}: {
  backlog: BoardOrder[];
  machines: BoardMachine[];
  t: (k: string) => string;
  ln: (a?: string | null, e?: string | null) => string;
  stage: Stage;
  onAssign: (orderId: number, machineId: string) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: "backlog",
    data: { type: "backlog" },
  });
  const items = backlog.map((o) => `order-${o.production_order_id}`);
  return (
    <Card
      className="w-80 flex-shrink-0 bg-muted/40"
      data-testid="column-backlog"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4" />
          {t("production.queues.backlog")}
          <Badge variant="secondary" data-testid="badge-backlog-count">
            {backlog.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] pr-1">
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div
              ref={setNodeRef}
              className="min-h-[80px]"
              data-testid="dropzone-backlog"
            >
              {backlog.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">
                    {t("production.queues.noBacklog")}
                  </p>
                </div>
              ) : (
                backlog.map((order) => (
                  <SortableBacklogCard
                    key={order.production_order_id}
                    order={order}
                    machines={machines}
                    t={t}
                    ln={ln}
                    stage={stage}
                    onAssign={onAssign}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function StageBoard({ stage }: { stage: Stage }) {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const { toast } = useToast();
  const [, setActiveId] = useState<string | null>(null);
  const [suggestMachine, setSuggestMachine] = useState<BoardMachine | null>(
    null,
  );
  const [suggestion, setSuggestion] = useState<QueueOrder[] | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  // Shared sort method for all machine columns on this stage board.
  const [sortMethod, setSortMethod] = useState("similarity");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const boardKey = ["/api/production-queues/board", { stage }];
  const { data, isLoading } = useQuery<{ data: Board }>({ queryKey: boardKey });
  const board = data?.data;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: boardKey });

  const assignMutation = useMutation({
    mutationFn: async ({ orderId, machineId }: any) =>
      apiRequest("/api/production-queues/assign", {
        method: "POST",
        body: JSON.stringify({
          productionOrderId: orderId,
          machineId,
          stage,
        }),
      }),
    onSuccess: () => {
      invalidate();
      toast({ title: t("production.queues.assignSuccess") });
    },
    onError: (e: any) =>
      toast({
        title: t("production.queues.error"),
        description: e?.message || t("production.queues.assignError"),
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
        title: t("production.queues.error"),
        description: e?.message || t("production.queues.reorderError"),
        variant: "destructive",
      }),
  });

  const removeMutation = useMutation({
    mutationFn: async (queueId: number) =>
      apiRequest(`/api/production-queues/${queueId}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast({ title: t("production.queues.removeSuccess") });
    },
    onError: (e: any) =>
      toast({
        title: t("production.queues.error"),
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
    onSuccess: (res: any) => {
      invalidate();
      setClearConfirmOpen(false);
      toast({
        title: t("production.queues.clearAllSuccess"),
        description: t("production.queues.clearAllRemoved", {
          count: res?.removed ?? 0,
        }),
      });
    },
    onError: (e: any) =>
      toast({
        title: t("production.queues.error"),
        description: e?.message || t("production.queues.clearAllError"),
        variant: "destructive",
      }),
  });

  const handleAssign = (orderId: number, machineId: string) =>
    assignMutation.mutate({ orderId, machineId });
  const handleReorder = (machineId: string, orderedQueueIds: number[]) =>
    reorderMutation.mutate({ machineId, orderedQueueIds });
  const handleRemove = (queueId: number) => removeMutation.mutate(queueId);

  const handleDragStart = (e: DragStartEvent) =>
    setActiveId(e.active.id as string);

  // Film machines hold a single raw-material type. Returns true if placing an
  // order of `orderMaterial` onto the target machine would mix materials.
  const hasFilmMaterialConflict = (
    orderMaterial: string | undefined | null,
    targetMachineId: string,
  ): boolean => {
    if (stage !== "film" || !board) return false;
    const mat = (orderMaterial || "").trim();
    const machine = board.machines.find((m) => m.id === targetMachineId);
    if (!machine) return false;
    const distinct = Array.from(
      new Set(
        machine.queue
          .map((q) => (q.raw_material || "").trim())
          .filter((m) => m.length > 0),
      ),
    );
    // Empty machine accepts any order; otherwise it must already hold exactly
    // one material that equals this order's material.
    if (distinct.length === 0) return false;
    return !(distinct.length === 1 && distinct[0] === mat);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !board) return;

    const activeData = active.data.current as any;
    const overData = over.data.current as any;
    const item = activeData?.item as BoardOrder | QueueOrder;
    if (!item) return;

    const isQueueItem = activeData?.type === "queue";

    // Determine target container.
    let targetMachineId: string | null = null;
    let targetIsBacklog = false;
    if (overData?.type === "machine") targetMachineId = overData.machineId;
    else if (overData?.type === "queue") targetMachineId = overData.machineId;
    else if (overData?.type === "backlog" || over.id === "backlog")
      targetIsBacklog = true;

    if (isQueueItem) {
      const q = item as QueueOrder;
      if (targetIsBacklog) {
        handleRemove(q.queue_id);
        return;
      }
      if (!targetMachineId) return;
      if (targetMachineId === q.machine_id) {
        // Reorder within the same machine.
        const machine = board.machines.find((m) => m.id === q.machine_id);
        if (!machine) return;
        const ids = machine.queue.map((x) => x.queue_id);
        const from = ids.indexOf(q.queue_id);
        let to = ids.length - 1;
        if (overData?.type === "queue") {
          to = ids.indexOf((overData.item as QueueOrder).queue_id);
        }
        if (from === -1 || to === -1 || from === to) return;
        ids.splice(to, 0, ids.splice(from, 1)[0]);
        handleReorder(q.machine_id, ids);
      } else {
        // Move across machines: remove then assign.
        const target = targetMachineId;
        if (hasFilmMaterialConflict(q.raw_material, target)) {
          toast({
            title: t("production.queues.error"),
            description: t("production.queues.materialConflict"),
            variant: "destructive",
          });
          return;
        }
        removeMutation.mutate(q.queue_id, {
          onSuccess: () =>
            assignMutation.mutate({
              orderId: q.production_order_id,
              machineId: target,
            }),
        });
      }
    } else {
      // From backlog to a machine.
      if (targetMachineId) {
        if (
          hasFilmMaterialConflict(
            (item as BoardOrder).raw_material,
            targetMachineId,
          )
        ) {
          toast({
            title: t("production.queues.error"),
            description: t("production.queues.materialConflict"),
            variant: "destructive",
          });
          return;
        }
        handleAssign((item as BoardOrder).production_order_id, targetMachineId);
      }
    }
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
        title: t("production.queues.error"),
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
    handleReorder(
      suggestMachine.id,
      suggestion.map((s) => s.queue_id),
    );
    toast({ title: t("production.queues.suggestionApplied") });
    setSuggestMachine(null);
    setSuggestion(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!board) return null;

  return (
    <div>
      <div className="flex justify-end gap-2 mb-3">
        <Button
          size="sm"
          onClick={() => setDistributeOpen(true)}
          data-testid={`smart-distribute-${stage}`}
        >
          <Sparkles className="h-4 w-4" />
          {t("production.queues.smartDistribute")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setClearConfirmOpen(true)}
          data-testid={`clear-all-${stage}`}
        >
          <X className="h-4 w-4" />
          {t("production.queues.clearAll")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => invalidate()}
          data-testid={`refresh-${stage}`}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-wrap gap-3 pb-3">
          <div className="w-80 flex-shrink-0">
            <BacklogColumn
              backlog={board.backlog}
              machines={board.machines}
              t={t}
              ln={ln}
              stage={stage}
              onAssign={handleAssign}
            />
          </div>
          {board.machines.length === 0 ? (
            <Card className="flex-1 min-w-[20rem]">
              <CardContent className="text-center text-muted-foreground py-12">
                {t("production.queues.noMachines")}
              </CardContent>
            </Card>
          ) : (
            <div className="grid flex-1 min-w-[20rem] grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {board.machines.map((machine) => (
                <MachineColumn
                  key={machine.id}
                  machine={machine}
                  stage={stage}
                  t={t}
                  ln={ln}
                  sortMethod={sortMethod}
                  onSortMethodChange={setSortMethod}
                  onReorder={handleReorder}
                  onRemove={handleRemove}
                  onSuggest={openSuggestion}
                />
              ))}
            </div>
          )}
        </div>
      </DndContext>

      <Dialog
        open={!!suggestMachine}
        onOpenChange={(o) => {
          if (!o) {
            setSuggestMachine(null);
            setSuggestion(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {t("production.queues.suggestionTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("production.queues.suggestionDescription")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            {suggestLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {(suggestion || []).map((item, idx) => (
                  <div
                    key={item.queue_id}
                    className="flex items-center gap-2 rounded border p-2"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <OrderDetails
                        order={item}
                        t={t}
                        ln={ln}
                        stage={stage}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSuggestMachine(null);
                setSuggestion(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={applySuggestion}
              disabled={suggestLoading || !suggestion?.length}
              data-testid="apply-suggestion"
            >
              {t("production.queues.applySuggestion")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SmartDistributionModal
        isOpen={distributeOpen}
        stage={stage}
        onClose={() => setDistributeOpen(false)}
        onDistribute={() => invalidate()}
      />

      <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("production.queues.clearAllConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("production.queues.clearAllConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearMutation.isPending}>
              {t("production.queues.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                clearMutation.mutate();
              }}
              disabled={clearMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`confirm-clear-all-${stage}`}
            >
              {clearMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t("production.queues.clearAllConfirm")}
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
      title={t("production.queues.title")}
      description={t("production.queues.planningDescription")}
    >
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => setSlideshowOpen(true)}
          data-testid="open-slideshow"
        >
          <MonitorPlay className="h-4 w-4" />
          {t("production.queues.slideshow.button")}
        </Button>
      </div>
      <QueueSlideshow
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Stage)}>
        <TabsList className="mb-4">
          <TabsTrigger value="film" data-testid="tab-film">
            {t("production.queues.film")}
          </TabsTrigger>
          <TabsTrigger value="printing" data-testid="tab-printing">
            {t("production.queues.printing")}
          </TabsTrigger>
          <TabsTrigger value="cutting" data-testid="tab-cutting">
            {t("production.queues.cutting")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="film">
          <StageBoard stage="film" />
        </TabsContent>
        <TabsContent value="printing">
          <StageBoard stage="printing" />
        </TabsContent>
        <TabsContent value="cutting">
          <StageBoard stage="cutting" />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
