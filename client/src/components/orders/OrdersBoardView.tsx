import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  Edit,
  Eye,
  MoreHorizontal,
  Printer,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { formatNumberAr } from "../../../../shared/number-utils";

type PrintMode = "html" | "pdf" | "standalone";
export type OrdersBoardMode = "cards" | "kanban";

interface OrdersBoardViewProps {
  mode: OrdersBoardMode;
  orders: any[];
  customers: any[];
  selectedOrders: number[];
  onOrderSelect: (orderId: number, selected: boolean) => void;
  onViewOrder: (order: any) => void;
  onPrintOrder: (order: any, mode?: PrintMode) => void;
  onEditOrder?: (order: any) => void;
  onStatusChange: (order: any, status: string) => void;
  onArchiveOrder?: (order: any) => void;
  onUnarchiveOrder?: (order: any) => void;
  isAdmin?: boolean;
}

const BOARD_STATUSES = [
  "waiting",
  "in_production",
  "on_hold",
  "paused",
  "completed",
  "cancelled",
  "archived",
];

function daysSinceCreation(order: any): number | null {
  if (!order?.created_at) return null;
  const created = new Date(order.created_at);
  if (Number.isNaN(created.getTime())) return null;
  const today = new Date();
  created.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(
    0,
    Math.floor((today.getTime() - created.getTime()) / 86400000),
  );
}

function isAgingOrder(order: any, age: number | null) {
  return (
    age !== null &&
    age > 30 &&
    !["archived", "completed", "delivered", "cancelled", "rejected"].includes(
      String(order?.status || "").toLowerCase(),
    )
  );
}

function statusClasses(status: string) {
  const styles: Record<string, string> = {
    waiting: "bg-amber-100 text-amber-800 border-amber-200",
    in_production: "bg-blue-100 text-blue-800 border-blue-200",
    on_hold: "bg-violet-100 text-violet-800 border-violet-200",
    paused: "bg-orange-100 text-orange-800 border-orange-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    archived: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
}

function OrderBoardCard({
  order,
  customer,
  selected,
  onSelect,
  onViewOrder,
  onPrintOrder,
  onEditOrder,
  onStatusChange,
  onArchiveOrder,
  onUnarchiveOrder,
  isAdmin,
}: {
  order: any;
  customer: any;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onViewOrder: (order: any) => void;
  onPrintOrder: (order: any, mode?: PrintMode) => void;
  onEditOrder?: (order: any) => void;
  onStatusChange: (order: any, status: string) => void;
  onArchiveOrder?: (order: any) => void;
  onUnarchiveOrder?: (order: any) => void;
  isAdmin?: boolean;
}) {
  const { t } = useTranslation();
  const age = daysSinceCreation(order);
  const isAging = isAgingOrder(order, age);
  const status = String(order.status || "waiting");
  const customerName =
    customer?.name_ar || customer?.name || order.customer_name_ar || order.customer_name || "بدون عميل";

  return (
    <Card
      className={`group overflow-hidden border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg ${
        isAging ? "order-aging-alert" : ""
      } ${selected ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
      data-testid={`order-board-card-${order.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(!!checked)}
              aria-label={`تحديد الطلب ${order.order_number || order.id}`}
              className="mt-1"
            />
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-slate-900">
                {order.order_number || `#${order.id}`}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <UserRound className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <span className="truncate">{customerName}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              aria-label={t("common.print")}
              title={t("common.print")}
              data-testid={`button-board-print-${order.id}`}
              onClick={() => onPrintOrder(order, "standalone")}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="إجراءات الطلب"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewOrder(order)}>
                  <Eye className="ml-2 h-4 w-4" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPrintOrder(order, "html")}>
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة الطلب
                </DropdownMenuItem>
                {isAdmin && onEditOrder && (
                  <DropdownMenuItem onClick={() => onEditOrder(order)}>
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل الطلب
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {status !== "archived" ? (
                  <DropdownMenuItem
                    onClick={() =>
                      onArchiveOrder
                        ? onArchiveOrder(order)
                        : onStatusChange(order, "archived")
                    }
                  >
                    <Archive className="ml-2 h-4 w-4" />
                    أرشفة
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() =>
                      onUnarchiveOrder
                        ? onUnarchiveOrder(order)
                        : onStatusChange(order, "completed")
                    }
                  >
                    <ArchiveRestore className="ml-2 h-4 w-4" />
                    إلغاء الأرشفة
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Badge className={`border ${statusClasses(status)}`}>
            {t(`orders.statuses.${status}`, { defaultValue: status })}
          </Badge>
          {isAging && (
            <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">
              يحتاج متابعة
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("ar-SA")
                : "بدون تاريخ"}
            </span>
          </div>
          <div className="text-left text-slate-500">
            {age === null ? "—" : `${formatNumberAr(age)} يوم`}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => onViewOrder(order)}
        >
          <Eye className="ml-2 h-4 w-4" />
          عرض الملف الكامل
        </Button>
      </CardContent>
    </Card>
  );
}

export default function OrdersBoardView({
  mode,
  orders,
  customers,
  selectedOrders,
  onOrderSelect,
  onViewOrder,
  onPrintOrder,
  onEditOrder,
  onStatusChange,
  onArchiveOrder,
  onUnarchiveOrder,
  isAdmin,
}: OrdersBoardViewProps) {
  const { t } = useTranslation();
  const getCustomer = (order: any) =>
    customers.find((customer: any) => customer.id === order.customer_id);

  if (mode === "cards") {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {orders.map((order) => (
          <OrderBoardCard
            key={order.id}
            order={order}
            customer={getCustomer(order)}
            selected={selectedOrders.includes(order.id)}
            onSelect={(selected) => onOrderSelect(order.id, selected)}
            onViewOrder={onViewOrder}
            onPrintOrder={onPrintOrder}
            onEditOrder={onEditOrder}
            onStatusChange={onStatusChange}
            onArchiveOrder={onArchiveOrder}
            onUnarchiveOrder={onUnarchiveOrder}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    );
  }

  const grouped = BOARD_STATUSES.map((status) => ({
    status,
    orders: orders.filter(
      (order) => String(order.status || "waiting").toLowerCase() === status,
    ),
  })).filter((group) => group.orders.length > 0);

  return (
    <div className="flex gap-4 overflow-x-auto pb-3">
      {grouped.map((group) => (
        <section
          key={group.status}
          className="w-[min(86vw,20rem)] shrink-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
          data-testid={`kanban-column-${group.status}`}
        >
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <h3 className="font-bold text-slate-800">
              {t(`orders.statuses.${group.status}`, {
                defaultValue: group.status,
              })}
            </h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm">
              {group.orders.length}
            </span>
          </div>
          <div className="space-y-3">
            {group.orders.map((order) => (
              <OrderBoardCard
                key={order.id}
                order={order}
                customer={getCustomer(order)}
                selected={selectedOrders.includes(order.id)}
                onSelect={(selected) => onOrderSelect(order.id, selected)}
                onViewOrder={onViewOrder}
                onPrintOrder={onPrintOrder}
                onEditOrder={onEditOrder}
                onStatusChange={onStatusChange}
                onArchiveOrder={onArchiveOrder}
                onUnarchiveOrder={onUnarchiveOrder}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>
      ))}
      {grouped.length === 0 && (
        <div className="w-full rounded-xl border border-dashed border-slate-300 py-14 text-center text-slate-500">
          لا توجد طلبات مطابقة للفلاتر الحالية
        </div>
      )}
    </div>
  );
}