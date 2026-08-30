import { useQuery, useMutation } from "@tanstack/react-query";
import { History, Pencil, Search, RotateCw, AlertTriangle, Layers, User, Package, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../components/layout/PageLayout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { SearchableSelect } from "../../components/ui/searchable-select";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";

interface ManagedRoll {
  id: number;
  roll_number: string | null;
  roll_seq: number | null;
  stage: string;
  weight_kg: string | null;
  cut_weight_total_kg: string | null;
  waste_kg: string | null;
  created_at: string | null;
  printed_at: string | null;
  cut_completed_at: string | null;
  completed_at: string | null;
  production_order_id: number;
  production_order_number: string | null;
  customer_name: string | null;
  customer_name_ar: string | null;
  item_name: string | null;
  item_name_ar: string | null;
  size_caption: string | null;
  film_machine_id: string | null;
  film_machine_name: string | null;
  film_machine_name_ar: string | null;
  printing_machine_id: string | null;
  printing_machine_name: string | null;
  printing_machine_name_ar: string | null;
  cutting_machine_id: string | null;
  cutting_machine_name: string | null;
  cutting_machine_name_ar: string | null;
  created_by_name: string | null;
  created_by_username: string | null;
  printed_by_name: string | null;
  printed_by_username: string | null;
  cut_by_name: string | null;
  cut_by_username: string | null;
}

interface MachineLite {
  id: string;
  name: string;
  name_ar: string | null;
  type: string;
  status: string;
}

interface ProductionOrderLite {
  id: number;
  production_order_number: string;
  size_caption: string | null;
  customer_name: string | null;
  customer_name_ar: string | null;
}

interface RollEditLog {
  id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  old_label: string | null;
  new_label: string | null;
  note: string | null;
  created_at: string | null;
  changed_by_name: string | null;
  changed_by_username: string | null;
}

interface Props {
  hideLayout?: boolean;
}

const STAGE_VARIANTS: Record<string, string> = {
  film: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  printing: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  cutting: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function RollManagementDashboard({ hideLayout }: Props) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isAr = i18n.language?.startsWith("ar");

  const PAGE_SIZE = 200;

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [editRoll, setEditRoll] = useState<ManagedRoll | null>(null);
  const [historyRoll, setHistoryRoll] = useState<ManagedRoll | null>(null);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [stageFilter, search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (stageFilter !== "all") params.set("stage", stageFilter);
    if (search.trim()) params.set("search", search.trim());
    params.set("limit", String(limit));
    return `?${params.toString()}`;
  }, [stageFilter, search, limit]);

  const {
    data: rolls = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<ManagedRoll[]>({
    queryKey: ["/api/management/rolls", stageFilter, search, limit],
    queryFn: async () => {
      const res = await apiRequest(`/api/management/rolls${queryString}`);
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });

  const hasMore = rolls.length >= limit;

  const { data: machines = [] } = useQuery<MachineLite[]>({
    queryKey: ["/api/machines"],
  });

  const { data: productionOrders = [] } = useQuery<ProductionOrderLite[]>({
    queryKey: ["/api/production-orders"],
  });

  const machineName = (m: MachineLite) =>
    (isAr ? m.name_ar || m.name : m.name) || m.id;

  const machineOptionsFor = (keywords: string[]) => {
    const matches = machines.filter((m) => {
      const type = (m.type || "").toLowerCase();
      return keywords.some((k) => type.includes(k));
    });
    const list = matches.length > 0 ? matches : machines;
    return list.map((m) => ({ value: m.id, label: machineName(m) }));
  };

  const productOptions = useMemo(
    () =>
      productionOrders.map((po) => {
        const customer = isAr
          ? po.customer_name_ar || po.customer_name
          : po.customer_name;
        const parts = [po.production_order_number];
        if (po.size_caption) parts.push(po.size_caption);
        if (customer) parts.push(customer);
        return { value: String(po.id), label: parts.join(" — ") };
      }),
    [productionOrders, isAr],
  );

  const productName = (r: ManagedRoll) => {
    const item = isAr ? r.item_name_ar || r.item_name : r.item_name;
    return [item, r.size_caption].filter(Boolean).join(" - ") || "—";
  };

  const customerName = (r: ManagedRoll) =>
    (isAr ? r.customer_name_ar || r.customer_name : r.customer_name) || "—";

  const stageMachineName = (r: ManagedRoll) => {
    const pick = (ar: string | null, en: string | null) =>
      (isAr ? ar || en : en) || null;
    switch (r.stage) {
      case "printing":
        return (
          pick(r.printing_machine_name_ar, r.printing_machine_name) ||
          pick(r.film_machine_name_ar, r.film_machine_name) ||
          "—"
        );
      case "cutting":
      case "done":
        return (
          pick(r.cutting_machine_name_ar, r.cutting_machine_name) ||
          pick(r.printing_machine_name_ar, r.printing_machine_name) ||
          pick(r.film_machine_name_ar, r.film_machine_name) ||
          "—"
        );
      default:
        return pick(r.film_machine_name_ar, r.film_machine_name) || "—";
    }
  };

  const producerName = (r: ManagedRoll) => {
    switch (r.stage) {
      case "printing":
        return r.printed_by_name || r.printed_by_username || r.created_by_name || "—";
      case "cutting":
      case "done":
        return (
          r.cut_by_name ||
          r.cut_by_username ||
          r.printed_by_name ||
          r.created_by_name ||
          "—"
        );
      default:
        return r.created_by_name || r.created_by_username || "—";
    }
  };

  const stageDate = (r: ManagedRoll): string | null => {
    switch (r.stage) {
      case "printing":
        return r.printed_at || r.created_at;
      case "cutting":
        return r.cut_completed_at || r.printed_at || r.created_at;
      case "done":
        return r.completed_at || r.cut_completed_at || r.printed_at || r.created_at;
      default:
        return r.created_at;
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString(isAr ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const content = (
    <div className="space-y-4" dir="rtl">
      {/* شريط البحث والفلترة السريع */}
      <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border shadow-xs flex flex-col sm:flex-row gap-3 items-center">
        <form
          className="relative flex-1 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
          }}
        >
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث برقم الرول، العميل، أمر الإنتاج، أو المنتج..."
            className="pr-9 h-10 text-xs font-bold rounded-xl"
            data-testid="input-roll-search"
          />
        </form>

        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger
            className="w-full sm:w-48 h-10 text-xs font-bold rounded-xl"
            data-testid="select-stage-filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("rollMgmt.allStages")}</SelectItem>
            <SelectItem value="film">{t("rollMgmt.stages.film")}</SelectItem>
            <SelectItem value="printing">{t("rollMgmt.stages.printing")}</SelectItem>
            <SelectItem value="cutting">{t("rollMgmt.stages.cutting")}</SelectItem>
            <SelectItem value="done">{t("rollMgmt.stages.done")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 w-10 rounded-xl flex-shrink-0"
          data-testid="button-refresh-rolls"
          title="تحديث"
        >
          <RotateCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* العرض في الجوال (Card Mode) */}
      <div className="block lg:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 rounded-2xl border shadow-xs">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))
        ) : rolls.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl border-dashed">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold text-gray-500">{t("rollMgmt.noRolls")}</p>
          </Card>
        ) : (
          rolls.map((r) => (
            <Card key={r.id} className="rounded-2xl border shadow-xs p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {r.roll_number || "—"}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {r.production_order_number}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                    {productName(r)}
                  </h4>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                    {customerName(r)}
                  </p>
                </div>

                <Badge className={`${STAGE_VARIANTS[r.stage] || ""} border-0 text-[10px] font-bold`}>
                  {t(`rollMgmt.stages.${r.stage}`, r.stage)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">الماكينة</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {stageMachineName(r)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">الوزن الصافي</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {Number(r.weight_kg || 0).toFixed(2)} كجم
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">المنفذ</span>
                  <span className="font-bold text-gray-600 dark:text-gray-300 truncate block">
                    {producerName(r)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">التاريخ</span>
                  <span className="font-medium text-gray-500 text-[10px] block">
                    {formatDate(stageDate(r))}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditRoll(r)}
                  className="h-8 text-xs font-bold gap-1 rounded-xl"
                  data-testid={`button-edit-roll-${r.id}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  تعديل
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHistoryRoll(r)}
                  className="h-8 text-xs font-bold gap-1 rounded-xl text-purple-700 border-purple-200"
                  data-testid={`button-history-roll-${r.id}`}
                >
                  <History className="h-3.5 w-3.5" />
                  السجل
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* العرض في الكمبيوتر (Table Mode) */}
      <div className="hidden lg:block">
        <Card className="rounded-2xl border shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableHead className="font-black text-xs">{t("rollMgmt.rollNumber")}</TableHead>
                  <TableHead className="font-black text-xs">{t("rollMgmt.product")}</TableHead>
                  <TableHead className="font-black text-xs">{t("rollMgmt.customer")}</TableHead>
                  <TableHead className="font-black text-xs text-center">{t("rollMgmt.stage")}</TableHead>
                  <TableHead className="font-black text-xs">{t("rollMgmt.machine")}</TableHead>
                  <TableHead className="font-black text-xs">{t("rollMgmt.producedBy")}</TableHead>
                  <TableHead className="font-black text-xs text-center">{t("rollMgmt.weight")}</TableHead>
                  <TableHead className="font-black text-xs">{t("rollMgmt.createdAt")}</TableHead>
                  <TableHead className="font-black text-xs text-center">{t("rollMgmt.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : rolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-400 py-12 text-xs">
                      {t("rollMgmt.noRolls")}
                    </TableCell>
                  </TableRow>
                ) : (
                  rolls.map((r) => (
                    <TableRow key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40" data-testid={`row-roll-${r.id}`}>
                      <TableCell className="font-black text-xs text-blue-700 dark:text-blue-400">
                        {r.roll_number || "—"}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-gray-900 dark:text-white">
                        {productName(r)}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {customerName(r)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${STAGE_VARIANTS[r.stage] || ""} border-0 text-[10px] font-bold`} variant="secondary">
                          {t(`rollMgmt.stages.${r.stage}`, r.stage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold">{stageMachineName(r)}</TableCell>
                      <TableCell className="text-xs text-gray-500 font-medium">{producerName(r)}</TableCell>
                      <TableCell className="text-center font-black text-xs text-emerald-600 dark:text-emerald-400">
                        {Number(r.weight_kg || 0).toFixed(2)} كجم
                      </TableCell>
                      <TableCell className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                        {formatDate(stageDate(r))}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditRoll(r)}
                            className="h-8 w-8 p-0"
                            data-testid={`button-edit-roll-${r.id}`}
                            title={t("rollMgmt.edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHistoryRoll(r)}
                            className="h-8 w-8 p-0 text-purple-600"
                            data-testid={`button-history-roll-${r.id}`}
                            title={t("rollMgmt.history")}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {!isLoading && hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            disabled={isFetching}
            className="rounded-xl text-xs font-bold h-9 px-6"
            data-testid="button-load-more-rolls"
          >
            {t("rollMgmt.loadMore")}
          </Button>
        </div>
      )}

      {/* نافذة التعديل */}
      {editRoll && (
        <EditRollDialog
          roll={editRoll}
          machineOptionsFor={machineOptionsFor}
          productOptions={productOptions}
          onClose={() => setEditRoll(null)}
          onSaved={() => {
            setEditRoll(null);
            queryClient.invalidateQueries({
              queryKey: ["/api/management/rolls"],
            });
            toast({ title: t("rollMgmt.saved") });
          }}
        />
      )}

      {/* نافذة سجل التعديلات التاريخي */}
      {historyRoll && (
        <HistoryDialog
          roll={historyRoll}
          onClose={() => setHistoryRoll(null)}
          formatDate={formatDate}
        />
      )}
    </div>
  );

  if (hideLayout) return content;

  return (
    <PageLayout title={t("rollMgmt.title")} description={t("rollMgmt.description")}>
      {content}
    </PageLayout>
  );
}

function EditRollDialog({
  roll,
  machineOptionsFor,
  productOptions,
  onClose,
  onSaved,
}: {
  roll: ManagedRoll;
  machineOptionsFor: (keywords: string[]) => { value: string; label: string }[];
  productOptions: { value: string; label: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [filmMachine, setFilmMachine] = useState(roll.film_machine_id || "");
  const [printingMachine, setPrintingMachine] = useState(
    roll.printing_machine_id || "",
  );
  const [cuttingMachine, setCuttingMachine] = useState(
    roll.cutting_machine_id || "",
  );
  const [productionOrderId, setProductionOrderId] = useState(
    String(roll.production_order_id),
  );
  const [note, setNote] = useState("");

  const showPrinting = roll.printing_machine_id != null;
  const showCutting = roll.cutting_machine_id != null;
  const productChanged = productionOrderId !== String(roll.production_order_id);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      if (filmMachine !== (roll.film_machine_id || ""))
        payload.film_machine_id = filmMachine || null;
      if (showPrinting && printingMachine !== (roll.printing_machine_id || ""))
        payload.printing_machine_id = printingMachine || null;
      if (showCutting && cuttingMachine !== (roll.cutting_machine_id || ""))
        payload.cutting_machine_id = cuttingMachine || null;
      if (productChanged)
        payload.production_order_id = Number(productionOrderId);
      if (note.trim()) payload.note = note.trim();

      if (Object.keys(payload).filter((k) => k !== "note").length === 0) {
        throw new Error(t("rollMgmt.noChanges"));
      }

      const res = await apiRequest(`/api/management/rolls/${roll.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = t("rollMgmt.saveError");
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
        } catch {
          /* keep default */
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: onSaved,
    onError: (err: Error) => {
      toast({
        title: t("rollMgmt.saveError"),
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base font-black">
            {t("rollMgmt.editTitle")} — {roll.roll_number}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("rollMgmt.editDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200">
              {t("rollMgmt.filmMachine")}
            </label>
            <SearchableSelect
              options={machineOptionsFor(["extruder", "film"])}
              value={filmMachine}
              onValueChange={(v) => setFilmMachine(v)}
              placeholder={t("rollMgmt.selectMachine")}
            />
          </div>

          {showPrinting && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-200">
                {t("rollMgmt.printingMachine")}
              </label>
              <SearchableSelect
                options={machineOptionsFor(["print"])}
                value={printingMachine}
                onValueChange={(v) => setPrintingMachine(v)}
                placeholder={t("rollMgmt.selectMachine")}
              />
            </div>
          )}

          {showCutting && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-200">
                {t("rollMgmt.cuttingMachine")}
              </label>
              <SearchableSelect
                options={machineOptionsFor(["cut"])}
                value={cuttingMachine}
                onValueChange={(v) => setCuttingMachine(v)}
                placeholder={t("rollMgmt.selectMachine")}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200">
              {t("rollMgmt.productProductionOrder")}
            </label>
            <SearchableSelect
              options={productOptions}
              value={productionOrderId}
              onValueChange={(v) => v && setProductionOrderId(v)}
              placeholder={t("rollMgmt.selectProduct")}
            />
            {productChanged && (
              <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-xl p-2.5 mt-1 border border-amber-200">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{t("rollMgmt.moveWarning")}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200">
              {t("rollMgmt.note")}
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("rollMgmt.notePlaceholder")}
              rows={2}
              className="rounded-xl text-xs"
              data-testid="input-edit-note"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold">
            {t("rollMgmt.cancel")}
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-save-roll-edit"
          >
            {mutation.isPending && <RotateCw className="h-3.5 w-3.5 animate-spin ml-1" />}
            {t("rollMgmt.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HistoryDialog({
  roll,
  onClose,
  formatDate,
}: {
  roll: ManagedRoll;
  onClose: () => void;
  formatDate: (d: string | null) => string;
}) {
  const { t } = useTranslation();

  const { data: logs = [], isLoading } = useQuery<RollEditLog[]>({
    queryKey: ["/api/management/rolls", roll.id, "history"],
    queryFn: async () => {
      const res = await apiRequest(`/api/management/rolls/${roll.id}/history`);
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base font-black flex items-center gap-2">
            <History className="h-4 w-4 text-purple-600" />
            {t("rollMgmt.historyTitle")} — {roll.roll_number}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-xs font-bold">
              {t("rollMgmt.historyEmpty")}
            </p>
          ) : (
            <div className="space-y-2.5 py-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border p-3 text-xs space-y-1.5 bg-gray-50/50 dark:bg-gray-800/40"
                  data-testid={`log-entry-${log.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-gray-900 dark:text-white">
                      {t(`rollMgmt.fields.${log.field}`, log.field)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {formatDate(log.created_at)}
                    </span>
                  </div>

                  <div className="text-gray-500 font-medium">
                    {t("rollMgmt.from")}:{" "}
                    <span className="text-rose-600 line-through">
                      {log.old_label || log.old_value || t("rollMgmt.none")}
                    </span>{" "}
                    ← {t("rollMgmt.to")}:{" "}
                    <span className="text-emerald-600 font-bold">
                      {log.new_label || log.new_value || t("rollMgmt.none")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t">
                    <span>بواسطة: {log.changed_by_name || log.changed_by_username || "—"}</span>
                    {log.note && <span className="italic text-gray-500">“{log.note}”</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold">
            {t("rollMgmt.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}