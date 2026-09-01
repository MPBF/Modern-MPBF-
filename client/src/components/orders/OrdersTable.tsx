import { format } from "date-fns";
import {
  FileText,
  Clock,
  Percent,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  MoreHorizontal,
  Printer,
  Download,
  ExternalLink,
  Settings2,
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import ProductionProgress from "./ProductionProgress";

type PrintMode = "html" | "pdf" | "standalone";

interface OrdersTableProps {
  orders: any[];
  customers: any[];
  users: any[];
  productionOrders?: any[];
  customerProducts?: any[];
  items?: any[];
  onViewOrder: (order: any) => void;
  onPrintOrder: (order: any, mode?: PrintMode) => void;
  onEditOrder?: (order: any) => void;
  onDeleteOrder: (order: any) => void;
  onStatusChange: (order: any, status: string) => void;
  onArchiveOrder?: (order: any) => void;
  onUnarchiveOrder?: (order: any) => void;
  currentUser?: any;
  isAdmin?: boolean;
  selectedOrders?: number[];
  onOrderSelect?: (orderId: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export default function OrdersTable({
  orders,
  customers,
  users,
  productionOrders = [],
  customerProducts = [],
  items = [],
  onViewOrder,
  onPrintOrder,
  onEditOrder,
  onDeleteOrder,
  onStatusChange,
  onArchiveOrder,
  onUnarchiveOrder,
  currentUser,
  isAdmin = false,
  selectedOrders = [],
  onOrderSelect,
  onSelectAll,
}: OrdersTableProps) {
  const { t } = useTranslation();
  // Ensure arrays are valid
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeProductionOrders = Array.isArray(productionOrders)
    ? productionOrders
    : [];
  const safeCustomerProducts = Array.isArray(customerProducts)
    ? customerProducts
    : [];
  const safeItems = Array.isArray(items) ? items : [];

  // Per-order expand state for the inline production-orders dropdown.
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<number>>(
    new Set(),
  );
  const toggleExpand = (orderId: number) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const { data: masterBatchColors = [] } = useQuery<any[]>({
    queryKey: ["/api/master-batch-colors"],
    queryFn: async () => {
      const response = await fetch("/api/master-batch-colors");
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || result || [];
    },
  });

  const getMasterBatchName = (code?: string | null) => {
    if (!code) return "-";
    const normalized = String(code).toUpperCase().trim();
    const match = masterBatchColors.find((c: any) => {
      if (!c?.id) return false;
      if (String(c.id).toUpperCase() === normalized) return true;
      if (c.aliases) {
        return c.aliases
          .split(",")
          .map((a: string) => a.trim().toUpperCase())
          .includes(normalized);
      }
      return false;
    });
    return match?.name_ar || match?.name || code;
  };

  const formatThickness = (val: any) => {
    const n = parseFloat(val ?? "");
    if (!isFinite(n)) return "-";
    return Math.round(n).toString();
  };

  const getPoStatusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
      active: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
      in_production: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
      completed: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
      cancelled: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
      paused: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
    };
    return map[status] || "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";
  };

  // Check if all orders are selected
  const allOrdersSelected =
    safeOrders.length > 0 &&
    safeOrders.every((order: any) => selectedOrders.includes(order.id));
  const someOrdersSelected =
    selectedOrders.length > 0 && selectedOrders.length < safeOrders.length;

  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
    }
  };

  const handleOrderSelect = (orderId: number, checked: boolean) => {
    if (onOrderSelect) {
      onOrderSelect(orderId, checked);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: {
      [key: string]: { label: string; variant: any; color: string };
    } = {
      waiting: {
        label: t("orders.statuses.waiting"),
        variant: "secondary",
        color: "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
      },
      on_hold: {
        label: t("orders.statuses.on_hold"),
        variant: "secondary",
        color: "border border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",
      },
      in_production: {
        label: t("orders.statuses.in_production"),
        variant: "default",
        color: "border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
      },
      paused: {
        label: t("orders.statuses.paused"),
        variant: "destructive",
        color: "border border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
      },
      completed: {
        label: t("orders.statuses.completed"),
        variant: "default",
        color: "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
      },
      cancelled: {
        label: t("orders.statuses.cancelled"),
        variant: "destructive",
        color: "border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
      },
      archived: {
        label: t("orders.statuses.archived"),
        variant: "outline",
        color: "border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "outline",
      color: "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
    };

    return (
      <Badge className={`${statusInfo.color} rounded-full px-2.5 py-1 font-bold`} data-testid={`status-${status}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const calculateDaysSinceCreation = (order: any) => {
    if (!order.created_at) return null;
    const createdDate = new Date(order.created_at);
    if (Number.isNaN(createdDate.getTime())) return null;
    createdDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = today.getTime() - createdDate.getTime();
    return Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
  };

  const isAgingOpenOrder = (order: any, daysSinceCreation: number | null) =>
    daysSinceCreation !== null &&
    daysSinceCreation > 30 &&
    !["archived", "completed", "delivered", "cancelled", "rejected"].includes(
      String(order.status || "").toLowerCase(),
    );

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 md:block">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/80">
            <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
              {onOrderSelect && onSelectAll && (
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={
                      allOrdersSelected
                        ? true
                        : someOrdersSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
              )}
              <TableHead className="w-10" />
              <TableHead className="text-center font-bold text-slate-600 dark:text-slate-300">
                {t("orders.orderNumber")} / {t("orders.customer")}
              </TableHead>
              <TableHead className="text-center font-bold text-slate-600 dark:text-slate-300">
                {t("orders.createdDate")} / {t("orders.creator")}
              </TableHead>
              <TableHead className="text-center font-bold text-slate-600 dark:text-slate-300">
                <span
                  className="flex items-center justify-center gap-1"
                  title={t("orders.daysSinceCreation")}
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {t("orders.daysSinceCreation")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="text-center font-bold text-slate-600 dark:text-slate-300">
                <span
                  className="flex items-center justify-center gap-1"
                  title={t("orders.completionRate")}
                >
                  <Percent className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {t("orders.completionRate")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="text-center font-bold text-slate-600 dark:text-slate-300">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeOrders.map((order: any) => {
              const customer = safeCustomers.find(
                (c: any) => c.id === order.customer_id,
              );
              const user = safeUsers.find(
                (u: any) => u.id === parseInt(order.created_by),
              );
              const daysSinceCreation = calculateDaysSinceCreation(order);
              const shouldBlink = isAgingOpenOrder(order, daysSinceCreation);

              // حساب نسب الإكمال من أوامر الإنتاج المرتبطة بهذا الطلب
              const orderProductionOrders = safeProductionOrders.filter(
                (po: any) => po.order_id === order.id,
              );

              // حساب متوسط مرجح لنسبة الإكمال لكل مرحلة بناءً على الكمية الفعلية لكل مرحلة
              let avgFilmPercentage = 0;
              let avgPrintingPercentage = 0;
              let avgCuttingPercentage = 0;

              if (orderProductionOrders.length > 0) {
                const totalOrderedQuantity = orderProductionOrders.reduce(
                  (sum: number, po: any) =>
                    sum + parseFloat(po.quantity_kg || 0),
                  0,
                );

                if (totalOrderedQuantity > 0) {
                  const weightedFilm = orderProductionOrders.reduce(
                    (sum: number, po: any) => {
                      const orderedQty = parseFloat(po.quantity_kg || 0);
                      const pct = parseFloat(
                        po.film_completion_percentage || 0,
                      );
                      return sum + orderedQty * pct;
                    },
                    0,
                  );

                  const weightedPrinting = orderProductionOrders.reduce(
                    (sum: number, po: any) => {
                      const orderedQty = parseFloat(po.quantity_kg || 0);
                      const pct = parseFloat(
                        po.printing_completion_percentage || 0,
                      );
                      return sum + orderedQty * pct;
                    },
                    0,
                  );

                  const weightedCutting = orderProductionOrders.reduce(
                    (sum: number, po: any) => {
                      const orderedQty = parseFloat(po.quantity_kg || 0);
                      const pct = parseFloat(
                        po.cutting_completion_percentage || 0,
                      );
                      return sum + orderedQty * pct;
                    },
                    0,
                  );

                  avgFilmPercentage = weightedFilm / totalOrderedQuantity;
                  avgPrintingPercentage =
                    weightedPrinting / totalOrderedQuantity;
                  avgCuttingPercentage = weightedCutting / totalOrderedQuantity;
                }
              }

              return (
                <React.Fragment key={order.id}>
                  <TableRow
                    data-testid={`order-row-${order.id}`}
                    className={[
                      "border-slate-100 transition-colors hover:bg-blue-50/60 dark:border-slate-800 dark:hover:bg-blue-950/20",
                      selectedOrders.includes(order.id) ? "bg-blue-50 dark:bg-blue-950/30" : "",
                      shouldBlink ? "order-aging-alert" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {onOrderSelect && onSelectAll && (
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) =>
                            handleOrderSelect(order.id, !!checked)
                          }
                          data-testid={`checkbox-select-order-${order.id}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="w-10 p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleExpand(order.id)}
                        disabled={orderProductionOrders.length === 0}
                        title={
                          orderProductionOrders.length === 0
                            ? t("orders.noProductionOrders")
                            : t("orders.productionOrders")
                        }
                        data-testid={`button-expand-${order.id}`}
                      >
                        {expandedOrderIds.has(order.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell
                      className="text-center"
                      data-testid={`order-number-${order.id}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-black text-slate-900 dark:bg-slate-900 dark:text-white">
                          {order.order_number}
                        </span>
                        <span className="max-w-48 truncate text-sm font-bold text-blue-700 dark:text-blue-300">
                          {customer?.name_ar || customer?.name || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-center"
                      data-testid={`created-date-${order.id}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {order.created_at
                            ? format(new Date(order.created_at), "dd/MM/yyyy")
                            : "-"}
                        </span>
                        <span className="max-w-40 truncate text-sm text-muted-foreground">
                          {user?.display_name_ar ||
                            user?.display_name ||
                            user?.username ||
                            "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-center"
                      data-testid={`delivery-${order.id}`}
                    >
                      {daysSinceCreation !== null ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${shouldBlink ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"}`}>
                          {t("orders.daysSinceCreatedCount", {
                            count: daysSinceCreation,
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell
                      className="text-center"
                      data-testid={`production-progress-${order.id}`}
                    >
                      {orderProductionOrders.length > 0 ? (
                        <ProductionProgress
                          filmPercentage={avgFilmPercentage}
                          printingPercentage={avgPrintingPercentage}
                          cuttingPercentage={avgCuttingPercentage}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <div className="mb-1">
                          {getStatusBadge(order.status || "pending")}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => onViewOrder(order)}
                            title={t("orders.viewDetails")}
                            data-testid={`button-view-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => onPrintOrder(order, "standalone")}
                            title={t("common.print")}
                            data-testid={`button-print-${order.id}`}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                data-testid={`button-actions-${order.id}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56"
                              style={{ direction: "rtl" }}
                            >
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                {t("orders.printAndExport")}
                              </DropdownMenuLabel>

                              <DropdownMenuItem
                                onClick={() => onPrintOrder(order, "pdf")}
                                className="cursor-pointer"
                                data-testid={`button-print-pdf-${order.id}`}
                              >
                                <Download className="h-4 w-4 ml-2 text-blue-600" />
                                <span>{t("common.exportPdf")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onPrintOrder(order, "standalone")
                                }
                                className="cursor-pointer"
                                data-testid={`button-print-standalone-${order.id}`}
                              >
                                <ExternalLink className="h-4 w-4 ml-2 text-purple-600" />
                                <span>{t("common.print")}</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                {t("orders.changeStatus")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => onStatusChange(order, "on_hold")}
                                className="cursor-pointer"
                              >
                                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full ml-2"></div>
                                <span>{t("orders.statuses.on_hold")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onStatusChange(order, "in_production")
                                }
                                className="cursor-pointer"
                              >
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2"></div>
                                <span>
                                  {t("orders.statuses.in_production")}
                                </span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onStatusChange(order, "paused")}
                                className="cursor-pointer"
                              >
                                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full ml-2"></div>
                                <span>{t("orders.statuses.paused")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onStatusChange(order, "cancelled")
                                }
                                className="cursor-pointer"
                              >
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full ml-2"></div>
                                <span>{t("orders.statuses.cancelled")}</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {order.status !== "archived" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onArchiveOrder
                                      ? onArchiveOrder(order)
                                      : onStatusChange(order, "archived")
                                  }
                                  className="cursor-pointer"
                                >
                                  <Archive className="h-4 w-4 ml-2 text-gray-500" />
                                  <span>{t("orders.archiveOrder")}</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onUnarchiveOrder
                                      ? onUnarchiveOrder(order)
                                      : onStatusChange(order, "completed")
                                  }
                                  className="cursor-pointer"
                                >
                                  <ArchiveRestore className="h-4 w-4 ml-2 text-green-500" />
                                  <span>{t("orders.unarchiveOrder")}</span>
                                </DropdownMenuItem>
                              )}

                              {(isAdmin && onEditOrder) || isAdmin ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    {t("orders.manage")}
                                  </DropdownMenuLabel>
                                </>
                              ) : null}

                              {isAdmin && onEditOrder && (
                                <DropdownMenuItem
                                  onClick={() => onEditOrder(order)}
                                  className="cursor-pointer"
                                  data-testid={`button-edit-${order.id}`}
                                >
                                  <Edit className="h-4 w-4 ml-2 text-purple-600" />
                                  <span>{t("orders.editOrder")}</span>
                                </DropdownMenuItem>
                              )}

                              {isAdmin && (
                                <DropdownMenuItem
                                  onClick={() => onDeleteOrder(order)}
                                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                  data-testid={`button-delete-${order.id}`}
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  <span>{t("orders.deleteOrder")}</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  {order.notes && (
                    <TableRow
                      className={`border-b ${selectedOrders.includes(order.id) ? "bg-blue-50" : "bg-gray-50/50"}`}
                    >
                      <TableCell
                        colSpan={onOrderSelect && onSelectAll ? 8 : 7}
                        className="py-1.5 px-4 text-right"
                        data-testid={`notes-${order.id}`}
                      >
                        <span className="text-xs text-muted-foreground font-medium ml-2">
                          {t("common.notes")}:
                        </span>
                        <span className="text-sm text-gray-700">
                          {order.notes}
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                  {expandedOrderIds.has(order.id) &&
                    orderProductionOrders.length > 0 && (
                      <TableRow
                        className="border-b bg-slate-50/70 dark:bg-slate-900/40"
                        data-testid={`production-orders-row-${order.id}`}
                      >
                        <TableCell
                          colSpan={onOrderSelect && onSelectAll ? 8 : 7}
                          className="p-3 text-right"
                        >
                          <div className="text-xs font-semibold text-muted-foreground mb-2">
                            {t("orders.productionOrders")} (
                            {orderProductionOrders.length})
                          </div>
                          <div className="overflow-x-auto rounded border bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-right text-xs">
                                    رقم الإنتاج
                                  </TableHead>
                                  <TableHead className="text-right text-xs">
                                    رقم المنتج
                                  </TableHead>
                                  <TableHead className="text-right text-xs">
                                    المقاس / الطول (سم)
                                  </TableHead>
                                  <TableHead className="text-right text-xs">
                                    السماكة
                                  </TableHead>
                                  <TableHead className="text-right text-xs">
                                    المادة الخام
                                  </TableHead>
                                  <TableHead className="text-right text-xs">
                                    لون الماستر باتش
                                  </TableHead>
                                  <TableHead className="text-right text-xs">
                                    الكمية المطلوبة (كجم)
                                  </TableHead>
                                  <TableHead className="text-right text-xs min-w-[240px]">
                                    نسبة الإنجاز
                                  </TableHead>
                                  <TableHead className="text-right text-xs">
                                    الحالة
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orderProductionOrders.map((po: any) => {
                                  const cp = safeCustomerProducts.find(
                                    (c: any) =>
                                      c.id === po.customer_product_id,
                                  );
                                  const required =
                                    parseFloat(po.quantity_kg ?? 0) || 0;
                                  return (
                                    <TableRow
                                      key={po.id}
                                      data-testid={`production-order-${po.id}`}
                                    >
                                      <TableCell className="font-medium text-sm">
                                        {po.production_order_number ||
                                          `PO-${po.id}`}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {cp?.id ?? "-"}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {(cp?.size_caption || "-") +
                                          (cp?.cutting_length_cm != null
                                            ? ` / ${cp.cutting_length_cm}`
                                            : "")}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {formatThickness(cp?.thickness)}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {cp?.raw_material || "-"}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {getMasterBatchName(
                                          cp?.master_batch_id,
                                        )}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {required.toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        <ProductionProgress
                                          filmPercentage={parseFloat(
                                            po.film_completion_percentage || 0,
                                          )}
                                          printingPercentage={parseFloat(
                                            po.printing_completion_percentage ||
                                              0,
                                          )}
                                          cuttingPercentage={parseFloat(
                                            po.cutting_completion_percentage ||
                                              0,
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={getPoStatusBadgeClass(
                                            po.status,
                                          )}
                                        >
                                          {t(
                                            `orders.statuses.${po.status}`,
                                            { defaultValue: po.status },
                                          )}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {safeOrders.map((order: any) => {
          const customer = safeCustomers.find(
            (c: any) => c.id === order.customer_id,
          );
          const user = safeUsers.find(
            (u: any) => u.id === parseInt(order.created_by),
          );
          const daysSinceCreation = calculateDaysSinceCreation(order);
          const shouldBlink = isAgingOpenOrder(order, daysSinceCreation);
          const orderProductionOrders = safeProductionOrders.filter(
            (po: any) => po.order_id === order.id,
          );

          let avgFilmPercentage = 0;
          let avgPrintingPercentage = 0;
          let avgCuttingPercentage = 0;

          if (orderProductionOrders.length > 0) {
            const totalOrderedQuantity = orderProductionOrders.reduce(
              (sum: number, po: any) => sum + parseFloat(po.quantity_kg || 0),
              0,
            );

            if (totalOrderedQuantity > 0) {
              const weightedFilm = orderProductionOrders.reduce(
                (sum: number, po: any) => {
                  const orderedQty = parseFloat(po.quantity_kg || 0);
                  const pct = parseFloat(po.film_completion_percentage || 0);
                  return sum + orderedQty * pct;
                },
                0,
              );

              const weightedPrinting = orderProductionOrders.reduce(
                (sum: number, po: any) => {
                  const orderedQty = parseFloat(po.quantity_kg || 0);
                  const pct = parseFloat(
                    po.printing_completion_percentage || 0,
                  );
                  return sum + orderedQty * pct;
                },
                0,
              );

              const weightedCutting = orderProductionOrders.reduce(
                (sum: number, po: any) => {
                  const orderedQty = parseFloat(po.quantity_kg || 0);
                  const pct = parseFloat(po.cutting_completion_percentage || 0);
                  return sum + orderedQty * pct;
                },
                0,
              );

              avgFilmPercentage = weightedFilm / totalOrderedQuantity;
              avgPrintingPercentage = weightedPrinting / totalOrderedQuantity;
              avgCuttingPercentage = weightedCutting / totalOrderedQuantity;
            }
          }

          return (
            <div
              key={order.id}
              className={`bg-white rounded-lg border p-4 space-y-3 ${
                shouldBlink ? "order-aging-alert" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg">
                    {order.order_number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {customer?.name_ar || customer?.name}
                  </div>
                  {(() => {
                    const salesRep = customer?.sales_rep_id
                      ? safeUsers.find(
                          (u: any) => u.id === customer.sales_rep_id,
                        )
                      : null;
                    return salesRep ? (
                      <div className="text-xs text-gray-500 mt-0.5">
                        المندوب:{" "}
                        {salesRep.display_name_ar ||
                          salesRep.display_name ||
                          salesRep.username}
                      </div>
                    ) : null;
                  })()}
                </div>
                <div>{getStatusBadge(order.status || "pending")}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {t("orders.createdDate")}:
                  </span>
                  <div className="font-medium">
                    {order.created_at
                      ? format(new Date(order.created_at), "dd/MM")
                      : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("orders.daysSinceCreation")}:
                  </span>
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {daysSinceCreation !== null
                      ? t("orders.daysSinceCreatedCount", { count: daysSinceCreation })
                      : "-"}
                  </div>
                </div>
              </div>

              {orderProductionOrders.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {t("orders.progress")}:
                  </span>
                  <ProductionProgress
                    filmPercentage={avgFilmPercentage}
                    printingPercentage={avgPrintingPercentage}
                    cuttingPercentage={avgCuttingPercentage}
                  />
                </div>
              )}

              {orderProductionOrders.length > 0 && (
                <div className="border-t pt-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-medium text-blue-600"
                    onClick={() => toggleExpand(order.id)}
                    data-testid={`button-expand-mobile-${order.id}`}
                  >
                    {expandedOrderIds.has(order.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronLeft className="h-3 w-3" />
                    )}
                    <span>
                      {t("orders.productionOrders")} (
                      {orderProductionOrders.length})
                    </span>
                  </button>
                  {expandedOrderIds.has(order.id) && (
                    <div
                      className="mt-2 space-y-2"
                      data-testid={`production-orders-mobile-${order.id}`}
                    >
                      {orderProductionOrders.map((po: any) => {
                        const cp = safeCustomerProducts.find(
                          (c: any) => c.id === po.customer_product_id,
                        );
                        const required =
                          parseFloat(po.quantity_kg ?? 0) || 0;
                        return (
                          <div
                            key={po.id}
                            className="rounded border bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-2 text-xs"
                            data-testid={`production-order-mobile-${po.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {po.production_order_number || `PO-${po.id}`}
                              </span>
                              <Badge
                                className={getPoStatusBadgeClass(po.status)}
                              >
                                {t(`orders.statuses.${po.status}`, {
                                  defaultValue: po.status,
                                })}
                              </Badge>
                            </div>
                            <div className="mt-1 grid grid-cols-2 gap-1">
                              <span>
                                رقم المنتج:{" "}
                                <span className="font-medium">
                                  {cp?.id ?? "-"}
                                </span>
                              </span>
                              <span>
                                المقاس / الطول (سم):{" "}
                                <span className="font-medium">
                                  {(cp?.size_caption || "-") +
                                    (cp?.cutting_length_cm != null
                                      ? ` / ${cp.cutting_length_cm}`
                                      : "")}
                                </span>
                              </span>
                              <span>
                                السماكة:{" "}
                                <span className="font-medium">
                                  {formatThickness(cp?.thickness)}
                                </span>
                              </span>
                              <span>
                                المادة الخام:{" "}
                                <span className="font-medium">
                                  {cp?.raw_material || "-"}
                                </span>
                              </span>
                              <span>
                                لون الماستر باتش:{" "}
                                <span className="font-medium">
                                  {getMasterBatchName(cp?.master_batch_id)}
                                </span>
                              </span>
                              <span>
                                الكمية المطلوبة:{" "}
                                <span className="font-medium">
                                  {required.toFixed(2)}
                                </span>
                              </span>
                            </div>
                            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                              <div className="mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                نسبة إنجاز أمر الإنتاج
                              </div>
                              <ProductionProgress
                                filmPercentage={parseFloat(
                                  po.film_completion_percentage || 0,
                                )}
                                printingPercentage={parseFloat(
                                  po.printing_completion_percentage || 0,
                                )}
                                cuttingPercentage={parseFloat(
                                  po.cutting_completion_percentage || 0,
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-1 pt-2 max-w-[200px]">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-6 px-1 text-[10px] text-blue-600 pl-[3px] pr-[3px] ml-[-5px] mr-[-5px]"
                  onClick={() => onViewOrder(order)}
                  data-testid={`button-view-mobile-${order.id}`}
                >
                  <Eye className="h-2.5 w-2.5 ml-0.5" />
                  {t("common.view")}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-6 px-1 text-[10px] text-green-600 pl-[4px] pr-[4px]"
                      data-testid={`button-print-mobile-${order.id}`}
                    >
                      <Printer className="h-2.5 w-2.5 ml-0.5" />
                      {t("common.print")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" style={{ direction: "rtl" }}>
                    <DropdownMenuItem
                      onClick={() => onPrintOrder(order, "html")}
                    >
                      <Printer className="h-4 w-4 ml-2 text-green-600" />
                      {t("common.directPrint")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onPrintOrder(order, "pdf")}
                    >
                      <Download className="h-4 w-4 ml-2 text-blue-600" />
                      {t("common.exportPdf")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onPrintOrder(order, "standalone")}
                    >
                      <ExternalLink className="h-4 w-4 ml-2 text-purple-600" />
                      {t("common.standalonePage")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-6 px-1 text-[10px] text-orange-600 ml-[0px] mr-[0px] pl-[4px] pr-[4px]"
                      data-testid={`button-status-mobile-${order.id}`}
                    >
                      <RefreshCw className="h-2.5 w-2.5 ml-0.5" />
                      {t("orders.statusShort")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" style={{ direction: "rtl" }}>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {t("orders.changeStatus")}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(order, "on_hold")}
                      className="cursor-pointer"
                    >
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full ml-2"></div>
                      <span>{t("orders.statuses.on_hold")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(order, "in_production")}
                      className="cursor-pointer"
                    >
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2"></div>
                      <span>{t("orders.statuses.in_production")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(order, "paused")}
                      className="cursor-pointer"
                    >
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full ml-2"></div>
                      <span>{t("orders.statuses.paused")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(order, "cancelled")}
                      className="cursor-pointer"
                    >
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full ml-2"></div>
                      <span>{t("orders.statuses.cancelled")}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {order.status !== "archived" ? (
                      <DropdownMenuItem
                        onClick={() =>
                          onArchiveOrder
                            ? onArchiveOrder(order)
                            : onStatusChange(order, "archived")
                        }
                        className="cursor-pointer"
                      >
                        <Archive className="h-4 w-4 ml-2 text-gray-500" />
                        <span>{t("orders.archiveOrder")}</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          onUnarchiveOrder
                            ? onUnarchiveOrder(order)
                            : onStatusChange(order, "completed")
                        }
                        className="cursor-pointer"
                      >
                        <ArchiveRestore className="h-4 w-4 ml-2 text-green-500" />
                        <span>{t("orders.unarchiveOrder")}</span>
                      </DropdownMenuItem>
                    )}

                    {isAdmin && onEditOrder && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          {t("orders.manage")}
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onEditOrder(order)}
                          className="cursor-pointer"
                          data-testid={`button-edit-mobile-${order.id}`}
                        >
                          <Edit className="h-4 w-4 ml-2 text-purple-600" />
                          <span>{t("orders.editOrder")}</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => onDeleteOrder(order)}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        data-testid={`button-delete-mobile-${order.id}`}
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        <span>{t("orders.deleteOrder")}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
