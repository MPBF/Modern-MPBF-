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
  PrinterIcon,
  Scissors,
  CheckCircle,
  Clock,
  QrCode,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronLeft,
  User,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

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
import { Card } from "../../components/ui/card";
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
import { queryClient } from "../../lib/queryClient";
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

export default function RollSearch() {
  const { t } = useTranslation();
  const ln = useLocalizedName();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedRollId, setSelectedRollId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [collapsedOrders, setCollapsedOrders] = useState<Set<string>>(
    new Set(),
  );
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
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      {
        header: t("system.search.productionOrder"),
        key: "productionOrder",
        width: 20,
      },
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
        return <Film className="h-4 w-4" />;
      case "printing":
        return <PrinterIcon className="h-4 w-4" />;
      case "cutting":
        return <Scissors className="h-4 w-4" />;
      case "done":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "film":
        return "default";
      case "printing":
        return "secondary";
      case "cutting":
        return "warning";
      case "done":
        return "success";
      default:
        return "default";
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
      title={t("system.search.title")}
      description={t("system.search.description")}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Tabs defaultValue="text" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" data-testid="tab-text-search">
                  <Search className="h-4 w-4 ml-2" />
                  {t("system.search.textSearch")}
                </TabsTrigger>
                <TabsTrigger value="barcode" data-testid="tab-barcode-search">
                  <ScanLine className="h-4 w-4 ml-2" />
                  {t("system.search.barcodeSearch")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="search-input"
                    type="text"
                    placeholder={t("system.search.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 text-lg h-12"
                    data-testid="input-search"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute left-2 top-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {searchHistory.length > 0 && !searchQuery && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      {t("system.search.recentSearches")}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((query, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => setSearchQuery(query)}
                        >
                          <Clock className="h-3 w-3 ml-1" />
                          {query}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    data-testid="button-toggle-filters"
                  >
                    <Filter className="h-4 w-4 ml-2" />
                    {t("system.search.advancedFilters")}
                    {Object.keys(filters).length > 0 && (
                      <Badge className="mr-2" variant="secondary">
                        {Object.keys(filters).length}
                      </Badge>
                    )}
                  </Button>

                  {Object.keys(filters).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({})}
                      data-testid="button-clear-filters"
                    >
                      {t("system.search.clearFilters")}
                    </Button>
                  )}
                </div>

                {showFilters && (
                  <Card className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("system.search.stage")}</Label>
                        <Select
                          value={filters.stage || "all"}
                          onValueChange={(value) =>
                            setFilters({
                              ...filters,
                              stage: value === "all" ? undefined : value,
                            })
                          }
                        >
                          <SelectTrigger data-testid="select-stage-filter">
                            <SelectValue
                              placeholder={t("system.search.allStages")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("system.search.allStages")}
                            </SelectItem>
                            <SelectItem value="film">
                              {t("system.search.stages.film")}
                            </SelectItem>
                            <SelectItem value="printing">
                              {t("system.search.stages.printing")}
                            </SelectItem>
                            <SelectItem value="cutting">
                              {t("system.search.stages.cutting")}
                            </SelectItem>
                            <SelectItem value="done">
                              {t("system.search.stages.done")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("system.search.fromDate")}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-right",
                                !filters.startDate && "text-muted-foreground",
                              )}
                              data-testid="button-start-date"
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {filters.startDate
                                ? format(filters.startDate, "PPP", {
                                    locale: ar,
                                  })
                                : t("system.search.selectDate")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={filters.startDate}
                              onSelect={(date) =>
                                setFilters({
                                  ...filters,
                                  startDate: date || undefined,
                                })
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("system.search.toDate")}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-right",
                                !filters.endDate && "text-muted-foreground",
                              )}
                              data-testid="button-end-date"
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {filters.endDate
                                ? format(filters.endDate, "PPP", { locale: ar })
                                : t("system.search.selectDate")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={filters.endDate}
                              onSelect={(date) =>
                                setFilters({
                                  ...filters,
                                  endDate: date || undefined,
                                })
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("system.search.minWeight")}</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.minWeight || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              minWeight: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                          data-testid="input-min-weight"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t("system.search.maxWeight")}</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={filters.maxWeight || ""}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              maxWeight: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                          data-testid="input-max-weight"
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="barcode" className="space-y-4">
                <div className="text-center space-y-4">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t("system.search.scanBarcodeDesc")}
                  </p>
                  <div className="flex gap-2 max-w-md mx-auto">
                    <Input
                      type="text"
                      placeholder={t("system.search.enterBarcodeNumber")}
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleBarcodeScan()
                      }
                      className="text-lg h-12"
                      data-testid="input-barcode"
                    />
                    <Button
                      onClick={handleBarcodeScan}
                      disabled={
                        !barcodeInput.trim() ||
                        searchByBarcodeMutation.isPending
                      }
                      data-testid="button-scan"
                    >
                      {searchByBarcodeMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ScanLine className="h-4 w-4" />
                      )}
                      {t("system.search.scan")}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              {isSearching ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {t("system.search.searchResults")} ({searchResults.length}{" "}
                      رول)
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToExcel}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4 ml-2" />
                      {t("system.search.exportExcel")}
                    </Button>
                  </div>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {groupedData.map((order) => (
                        <div
                          key={order.order_number}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => toggleOrder(order.order_number)}
                          >
                            <div className="flex items-center gap-3">
                              {collapsedOrders.has(order.order_number) ? (
                                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Package className="h-5 w-5 text-primary" />
                              <span className="font-bold text-base">
                                {order.order_number}
                              </span>
                              <span className="text-muted-foreground">-</span>
                              <span className="font-bold text-gray-900">
                                {order.customer_name}
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {order.productionOrders.reduce(
                                (sum, po) => sum + po.rolls.length,
                                0,
                              )}{" "}
                              رول
                            </Badge>
                          </div>

                          {!collapsedOrders.has(order.order_number) && (
                            <div className="divide-y">
                              {order.productionOrders.map((po) => (
                                <div key={po.production_order_number}>
                                  <div
                                    className="flex items-center justify-between px-6 py-2 bg-blue-50/50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                                    onClick={() =>
                                      togglePO(po.production_order_number)
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      {collapsedPOs.has(
                                        po.production_order_number,
                                      ) ? (
                                        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                      )}
                                      <span className="font-semibold text-sm text-blue-700 dark:text-blue-400">
                                        {po.production_order_number}
                                      </span>
                                      <span className="text-muted-foreground text-sm">
                                        |
                                      </span>
                                      <span className="text-sm">
                                        {po.item_name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ({po.size_caption})
                                      </span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {po.rolls.length} رول
                                    </Badge>
                                  </div>

                                  {!collapsedPOs.has(
                                    po.production_order_number,
                                  ) && (
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                                          <TableHead className="text-right text-xs font-semibold">
                                            رقم الرول
                                          </TableHead>
                                          <TableHead className="text-right text-xs font-semibold">
                                            المرحلة
                                          </TableHead>
                                          <TableHead className="text-right text-xs font-semibold">
                                            المنتج
                                          </TableHead>
                                          <TableHead className="text-right text-xs font-semibold">
                                            الوزن
                                          </TableHead>
                                          <TableHead className="text-right text-xs font-semibold">
                                            فيلم بواسطة
                                          </TableHead>
                                          <TableHead className="text-right text-xs font-semibold">
                                            طبع بواسطة
                                          </TableHead>
                                          <TableHead className="text-right text-xs font-semibold">
                                            قطع بواسطة
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {po.rolls.map((roll) => (
                                          <TableRow
                                            key={roll.roll_id}
                                            className={cn(
                                              "cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors",
                                              selectedRollId === roll.roll_id &&
                                                "bg-blue-100 dark:bg-blue-900/30",
                                            )}
                                            onClick={() =>
                                              setSelectedRollId(roll.roll_id)
                                            }
                                            data-testid={`row-roll-${roll.roll_id}`}
                                          >
                                            <TableCell className="font-medium text-sm">
                                              {roll.roll_number}
                                            </TableCell>
                                            <TableCell>
                                              <Badge
                                                variant={
                                                  getStageColor(
                                                    roll.stage,
                                                  ) as any
                                                }
                                                className="text-xs"
                                              >
                                                {getStageIcon(roll.stage)}
                                                <span className="mr-1">
                                                  {getStageLabel(roll.stage)}
                                                </span>
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                              {ln(
                                                roll.item_name_ar,
                                                roll.item_name,
                                              ) || "-"}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                              {roll.weight_kg} كجم
                                            </TableCell>
                                            <TableCell className="text-sm">
                                              <div className="flex items-center gap-1 text-muted-foreground">
                                                {roll.created_by_name ? (
                                                  <>
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                      {roll.created_by_name}
                                                    </span>
                                                  </>
                                                ) : (
                                                  "-"
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                              <div className="flex items-center gap-1 text-muted-foreground">
                                                {roll.printed_by_name ? (
                                                  <>
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                      {roll.printed_by_name}
                                                    </span>
                                                  </>
                                                ) : (
                                                  "-"
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                              <div className="flex items-center gap-1 text-muted-foreground">
                                                {roll.cut_by_name ? (
                                                  <>
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                      {roll.cut_by_name}
                                                    </span>
                                                  </>
                                                ) : (
                                                  "-"
                                                )}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
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
              ) : debouncedQuery || Object.keys(filters).length > 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    {t("system.search.noResults")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("system.search.noResultsDesc")}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {selectedRollId && (
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold mb-4">
                {t("system.search.rollDetails")}
              </h3>
              <RollDetailsCard rollId={selectedRollId} />
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
