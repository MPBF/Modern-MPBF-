import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import ExcelJS from "exceljs";
import {
  Search,
  ScanLine,
  Filter,
  CalendarIcon,
  Package,
  X,
  Film,
  Printer as PrinterIcon,
  Scissors,
  CheckCircle,
  Clock,
  QrCode,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronLeft,
  User,
  Layers,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../components/layout/PageLayout";
import RollDetailsCard from "../../components/production/RollDetailsCard";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useLocalizedName } from "../../hooks/use-localized-name";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Skeleton } from "../../components/ui/skeleton";
import { Calendar } from "../../components/ui/calendar";
import { Card, CardContent } from "../../components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useToast } from "../../hooks/use-toast";
import { cn } from "../../lib/utils";

interface RollSearchResult {
  roll_id: number;
  roll_number: string;
  roll_seq: number;
  qr_code_text: string;
  qr_png_base64?: string;
  stage: string;
  weight_kg: string;
  cut_weight_total_kg?: string;
  waste_kg?: string;
  created_at: string;
  printed_at?: string;
  cut_completed_at?: string;
  production_order_id: number;
  production_order_number: string;
  order_id: number;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_name_ar?: string;
  item_name?: string;
  item_name_ar?: string;
  size_caption?: string;
  raw_material?: string;
  color?: string;
  punching?: string;
  film_machine_name?: string;
  printing_machine_name?: string;
  cutting_machine_name?: string;
  created_by_name?: string;
  printed_by_name?: string;
  cut_by_name?: string;
}

interface SearchFilters {
  stage?: string;
  startDate?: Date;
  endDate?: Date;
  machineId?: string;
  operatorId?: number;
  minWeight?: number;
  maxWeight?: number;
  productionOrderId?: number;
  orderId?: number;
}

const STAGE_VARIANTS: Record<string, string> = {
  film: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  printing: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  cutting: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function RollSearch() {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedRollId, setSelectedRollId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [collapsedOrders, setCollapsedOrders] = useState<Set<string>>(new Set());
  const [collapsedPOs, setCollapsedPOs] = useState<Set<string>>(new Set());

  const toggleOrder = (orderNumber: string) => {
    setCollapsedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) next.delete(orderNumber);
      else next.add(orderNumber);
      return next;
    });
  };

  const togglePO = (poNumber: string) => {
    setCollapsedPOs((prev) => {
      const next = new Set(prev);
      if (next.has(poNumber)) next.delete(poNumber);
      else next.add(poNumber);
      return next;
    });
  };

  useEffect(() => {
    const history = localStorage.getItem("rollSearchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history).slice(0, 10));
    }
  }, []);

  const saveToHistory = (query: string) => {
    if (query.trim()) {
      const newHistory = [
        query,
        ...searchHistory.filter((h) => h !== query),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem("rollSearchHistory", JSON.stringify(newHistory));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) saveToHistory(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.append("q", debouncedQuery);
    if (filters.stage) params.append("stage", filters.stage);
    if (filters.startDate)
      params.append("start_date", format(filters.startDate, "yyyy-MM-dd"));
    if (filters.endDate)
      params.append("end_date", format(filters.endDate, "yyyy-MM-dd"));
    if (filters.machineId) params.append("machine_id", filters.machineId);
    if (filters.operatorId)
      params.append("operator_id", filters.operatorId.toString());
    if (filters.minWeight)
      params.append("min_weight", filters.minWeight.toString());
    if (filters.maxWeight)
      params.append("max_weight", filters.maxWeight.toString());
    if (filters.productionOrderId)
      params.append(
        "production_order_id",
        filters.productionOrderId.toString(),
      );
    if (filters.orderId) params.append("order_id", filters.orderId.toString());
    return params.toString();
  };

  const { data: searchResults = [], isLoading: isSearching } = useQuery<
    RollSearchResult[]
  >({
    queryKey: ["/api/rolls/search", buildQueryParams()],
    enabled: debouncedQuery.length > 0 || Object.keys(filters).length > 0,
  });

  const groupedData = useMemo(() => {
    if (!searchResults.length) return [];

    const orderMap = new Map<
      string,
      {
        order_number: string;
        order_id: number;
        customer_name: string;
        productionOrders: Map<
          string,
          {
            production_order_number: string;
            production_order_id: number;
            item_name: string;
            size_caption: string;
            rolls: RollSearchResult[];
          }
        >;
      }
    >();

    searchResults.forEach((roll) => {
      if (!orderMap.has(roll.order_number)) {
        orderMap.set(roll.order_number, {
          order_number: roll.order_number,
          order_id: roll.order_id,
          customer_name: roll.customer_name_ar || roll.customer_name,
          productionOrders: new Map(),
        });
      }
      const order = orderMap.get(roll.order_number)!;

      if (!order.productionOrders.has(roll.production_order_number)) {
        order.productionOrders.set(roll.production_order_number, {
          production_order_number: roll.production_order_number,
          production_order_id: roll.production_order_id,
          item_name: roll.item_name_ar || roll.item_name || "-",
          size_caption: roll.size_caption || "-",
          rolls: [],
        });
      }
      order.productionOrders
        .get(roll.production_order_number)!
        .rolls.push(roll);
    });

    return Array.from(orderMap.values()).map((order) => ({
      ...order,
      productionOrders: Array.from(order.productionOrders.values()),
    }));
  }, [searchResults]);

  const searchByBarcodeMutation = useMutation({
    mutationFn: async (barcode: string) => {
      const response = await fetch(`/api/rolls/search-by-barcode/${barcode}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t("system.search.barcodeSearchError"));
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedRollId(data.roll_id);
      toast({
        title: t("system.search.rollFoundSuccess"),
        description: `${t("system.search.rollNumber")}: ${data.roll_number}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("system.search.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportToExcel = async () => {
    if (!searchResults || searchResults.length === 0) {
      toast({
        title: t("system.search.noDataToExport"),
        variant: "destructive",
      });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(t("system.search.searchResults"));

    worksheet.columns = [
      { header: t("system.search.rollNumber"), key: "rollNumber", width: 15 },
      { header: t("system.search.productionOrder"), key: "productionOrder", width: 20 },
      { header: t("system.search.orderNumber"), key: "orderNumber", width: 15 },
      { header: t("orders.customer"), key: "customer", width: 25 },
      { header: t("production.product"), key: "product", width: 20 },
      { header: t("production.specifications"), key: "specs", width: 15 },
      { header: t("system.search.stage"), key: "stage", width: 12 },
      { header: t("system.search.weight"), key: "weight", width: 10 },
    ];

    searchResults.forEach((roll: RollSearchResult) => {
      worksheet.addRow({
        rollNumber: roll.roll_number,
        productionOrder: roll.production_order_number,
        orderNumber: roll.order_number,
        customer: roll.customer_name_ar || roll.customer_name,
        product: roll.item_name_ar || roll.item_name || "-",
        specs: roll.size_caption || "-",
        stage: getStageLabel(roll.stage),
        weight: roll.weight_kg,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roll_search_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("system.search.exportSuccess"),
      description: t("system.search.exportSuccessDesc", {
        count: searchResults.length,
      }),
    });
  };

  const getStageLabel = (stage: string) => {
    const stageKey = stage as "film" | "printing" | "cutting" | "done";
    return t(`system.search.stages.${stageKey}`, stage);
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "film":
        return <Film className="h-3.5 w-3.5" />;
      case "printing":
        return <PrinterIcon className="h-3.5 w-3.5" />;
      case "cutting":
        return <Scissors className="h-3.5 w-3.5" />;
      case "done":
        return <CheckCircle className="h-3.5 w-3.5" />;
      default:
        return <Package className="h-3.5 w-3.5" />;
    }
  };

  const handleBarcodeScan = () => {
    if (barcodeInput.trim()) {
      searchByBarcodeMutation.mutate(barcodeInput.trim());
      setBarcodeInput("");
    }
  };

  return (
    <PageLayout
      title="البحث وتتبع الرولات"
      description="استعلام فوري وتتبع لحركة الرولات ومسار الإنتاج"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" dir="rtl">
        {/* قسم البحث والنتائج */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl border shadow-xs p-4 bg-white dark:bg-gray-900">
            <Tabs defaultValue="text" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <TabsTrigger value="text" className="rounded-lg font-bold text-xs">
                  <Search className="h-3.5 w-3.5 ml-1.5" />
                  البحث النصي
                </TabsTrigger>
                <TabsTrigger value="barcode" className="rounded-lg font-bold text-xs">
                  <ScanLine className="h-3.5 w-3.5 ml-1.5" />
                  مسح الباركود
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-3.5">
                <div className="relative">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ابحث برقم الرول، العميل، أمر الإنتاج، أو المنتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 pl-9 h-11 text-xs font-bold rounded-xl"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {searchHistory.length > 0 && !searchQuery && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-gray-400 ml-1">عمليات البحث الأخيرة:</span>
                    {searchHistory.slice(0, 5).map((query, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200 text-xs font-medium py-0.5 rounded-lg"
                        onClick={() => setSearchQuery(query)}
                      >
                        <Clock className="h-3 w-3 ml-1 text-gray-400" />
                        {query}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-8 text-xs font-bold rounded-xl gap-1.5"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    الفلاتر المتقدمة
                    {Object.keys(filters).length > 0 && (
                      <Badge className="mr-1 h-5 px-1.5 text-[10px]" variant="secondary">
                        {Object.keys(filters).length}
                      </Badge>
                    )}
                  </Button>

                  {Object.keys(filters).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({})}
                      className="h-8 text-xs font-bold text-rose-600"
                    >
                      مسح الفلاتر
                    </Button>
                  )}
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-500">مرحلة الإنتاج</Label>
                      <Select
                        value={filters.stage || "all"}
                        onValueChange={(val) =>
                          setFilters({ ...filters, stage: val === "all" ? undefined : val })
                        }
                      >
                        <SelectTrigger className="h-9 text-xs font-bold rounded-xl">
                          <SelectValue placeholder="كل المراحل" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل المراحل</SelectItem>
                          <SelectItem value="film">فيلم</SelectItem>
                          <SelectItem value="printing">طباعة</SelectItem>
                          <SelectItem value="cutting">تقطيع</SelectItem>
                          <SelectItem value="done">مكتمل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-500">من تاريخ</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-9 text-xs font-bold rounded-xl justify-start">
                            <CalendarIcon className="ml-2 h-3.5 w-3.5 text-gray-400" />
                            {filters.startDate ? format(filters.startDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.startDate}
                            onSelect={(d) => setFilters({ ...filters, startDate: d || undefined })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-500">إلى تاريخ</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-9 text-xs font-bold rounded-xl justify-start">
                            <CalendarIcon className="ml-2 h-3.5 w-3.5 text-gray-400" />
                            {filters.endDate ? format(filters.endDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(d) => setFilters({ ...filters, endDate: d || undefined })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-500">الوزن الأقصى (كجم)</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={filters.maxWeight || ""}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxWeight: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="h-9 text-xs font-bold rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="barcode" className="space-y-4 py-2">
                <div className="text-center space-y-3 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-dashed">
                  <QrCode className="h-10 w-10 mx-auto text-blue-600" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    أدخل أو امسح الباركود الخاص بالرول
                  </p>
                  <div className="flex gap-2 max-w-sm mx-auto">
                    <Input
                      type="text"
                      placeholder="امسح أو اكتب رقم الرول..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleBarcodeScan()}
                      className="h-10 text-xs font-black text-center rounded-xl"
                      autoFocus
                    />
                    <Button
                      onClick={handleBarcodeScan}
                      disabled={!barcodeInput.trim() || searchByBarcodeMutation.isPending}
                      className="h-10 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {searchByBarcodeMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ScanLine className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* قائمة النتائج */}
          <div>
            {isSearching ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-gray-700 dark:text-gray-200">
                    نتائج البحث: ({searchResults.length} رول)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToExcel}
                    className="h-8 text-xs font-bold gap-1 rounded-xl text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    تصدير إكسل
                  </Button>
                </div>

                <ScrollArea className="h-[550px]">
                  <div className="space-y-3 pr-0.5">
                    {groupedData.map((order) => (
                      <div
                        key={order.order_number}
                        className="border-2 border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xs"
                      >
                        {/* ترويسة الطلب الرئيسي */}
                        <div
                          className="flex items-center justify-between p-3.5 bg-gray-50/80 dark:bg-gray-800/60 cursor-pointer hover:bg-gray-100 transition-colors border-b"
                          onClick={() => toggleOrder(order.order_number)}
                        >
                          <div className="flex items-center gap-2">
                            {collapsedOrders.has(order.order_number) ? (
                              <ChevronLeft className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="font-black text-xs text-gray-900 dark:text-white">
                              طلب: #{order.order_number}
                            </span>
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                              - {order.customer_name}
                            </span>
                          </div>

                          <Badge variant="secondary" className="font-bold text-[10px]">
                            {order.productionOrders.reduce((sum, po) => sum + po.rolls.length, 0)} رول
                          </Badge>
                        </div>

                        {/* أوامر الإنتاج التابعة للطلب */}
                        {!collapsedOrders.has(order.order_number) && (
                          <div className="divide-y">
                            {order.productionOrders.map((po) => (
                              <div key={po.production_order_number} className="p-2 space-y-2">
                                <div
                                  className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 cursor-pointer"
                                  onClick={() => togglePO(po.production_order_number)}
                                >
                                  <div className="flex items-center gap-2 text-xs">
                                    {collapsedPOs.has(po.production_order_number) ? (
                                      <ChevronLeft className="h-3.5 w-3.5 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                    )}
                                    <span className="font-black text-blue-700 dark:text-blue-300">
                                      {po.production_order_number}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {po.item_name}
                                    </span>
                                    <span className="text-gray-400 text-[11px]">({po.size_caption})</span>
                                  </div>
                                  <Badge variant="outline" className="text-[10px] font-bold">
                                    {po.rolls.length} رول
                                  </Badge>
                                </div>

                                {/* جدول رولات أمر الإنتاج */}
                                {!collapsedPOs.has(po.production_order_number) && (
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/40">
                                          <TableHead className="font-black text-[11px]">رقم الرول</TableHead>
                                          <TableHead className="font-black text-[11px] text-center">المرحلة</TableHead>
                                          <TableHead className="font-black text-[11px] text-center">الوزن</TableHead>
                                          <TableHead className="font-black text-[11px]">فيلم بواسطة</TableHead>
                                          <TableHead className="font-black text-[11px]">طبع بواسطة</TableHead>
                                          <TableHead className="font-black text-[11px]">قطع بواسطة</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {po.rolls.map((roll) => (
                                          <TableRow
                                            key={roll.roll_id}
                                            className={cn(
                                              "cursor-pointer hover:bg-blue-50/50 transition-colors",
                                              selectedRollId === roll.roll_id && "bg-blue-100/70 dark:bg-blue-900/40 font-bold",
                                            )}
                                            onClick={() => setSelectedRollId(roll.roll_id)}
                                          >
                                            <TableCell className="font-black text-xs text-blue-700 dark:text-blue-400">
                                              {roll.roll_number}
                                            </TableCell>
                                            <TableCell className="text-center">
                                              <Badge className={`${STAGE_VARIANTS[roll.stage] || ""} border-0 text-[10px] font-bold`}>
                                                {getStageIcon(roll.stage)}
                                                <span className="mr-1">{getStageLabel(roll.stage)}</span>
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                              {roll.weight_kg} كجم
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                                              {roll.created_by_name || "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                                              {roll.printed_by_name || "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                                              {roll.cut_by_name || "—"}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : debouncedQuery ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border">
                <Package className="h-10 w-10 mx-auto text-gray-400 mb-2 opacity-30" />
                <p className="text-xs font-bold text-gray-500">لا توجد رولات مطابقة للبحث</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* قسم تفاصيل الرول المحدد */}
        <div className="lg:col-span-1">
          {selectedRollId ? (
            <div className="sticky top-4 space-y-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-600" />
                تفاصيل الرول المحدد:
              </h3>
              <RollDetailsCard rollId={selectedRollId} />
            </div>
          ) : (
            <Card className="rounded-2xl border border-dashed p-8 text-center text-gray-400">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">اضغط على أي رول من القائمة لعرض كامل تفاصيله ومساره هنا</p>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}