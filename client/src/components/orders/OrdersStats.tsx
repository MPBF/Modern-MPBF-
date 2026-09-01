import { AlertTriangle, CheckCircle2, Clock3, Factory, PackageCheck } from "lucide-react";

import { Card, CardContent } from "../ui/card";

interface OrdersStatsProps {
  orders: any[];
  productionOrders: any[];
}

export default function OrdersStats({
  orders,
  productionOrders,
}: OrdersStatsProps) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProdOrders = Array.isArray(productionOrders)
    ? productionOrders
    : [];

  const activeOrders = safeOrders.filter((order: any) =>
    ["waiting", "in_production", "on_hold", "paused"].includes(
      String(order.status || ""),
    ),
  ).length;
  const completedProductionOrders = safeProdOrders.filter(
    (po: any) => po.status === "completed",
  ).length;
  const inProgressProductionOrders = safeProdOrders.filter((po: any) =>
    ["active", "in_progress"].includes(String(po.status || "")),
  ).length;
  const agingOrders = safeOrders.filter((order: any) => {
    if (!order.created_at) return false;
    const created = new Date(order.created_at);
    if (Number.isNaN(created.getTime())) return false;
    const age = Math.floor((Date.now() - created.getTime()) / 86400000);
    return (
      age > 30 &&
      !["archived", "completed", "delivered", "cancelled", "rejected"].includes(
        String(order.status || "").toLowerCase(),
      )
    );
  }).length;

  const metrics = [
    {
      label: "إجمالي الطلبات",
      value: safeOrders.length,
      hint: `${activeOrders.toLocaleString("ar-SA")} طلب نشط`,
      icon: PackageCheck,
      className: "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900",
      accent: "from-blue-500 to-cyan-500",
    },
    {
      label: "أوامر الإنتاج",
      value: safeProdOrders.length,
      hint: `${inProgressProductionOrders.toLocaleString("ar-SA")} قيد التشغيل`,
      icon: Factory,
      className: "bg-slate-50 text-slate-700 ring-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800",
      accent: "from-slate-700 to-slate-500",
    },
    {
      label: "تحتاج متابعة",
      value: agingOrders,
      hint: "طلبات مفتوحة منذ أكثر من ٣٠ يوم",
      icon: AlertTriangle,
      className: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
      accent: "from-amber-500 to-orange-500",
    },
    {
      label: "إنتاج مكتمل",
      value: completedProductionOrders,
      hint: "أوامر جاهزة للمرحلة التالية",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
      accent: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card
            key={metric.label}
            className="group overflow-hidden border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
          >
            <CardContent className="relative p-5">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${metric.accent}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </p>
                  <div className="mt-3 text-3xl font-black tracking-normal text-slate-950 dark:text-white">
                    {metric.value.toLocaleString("ar-SA")}
                  </div>
                </div>
                <div className={`rounded-2xl p-3 ring-1 ${metric.className}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                <span>{metric.hint}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
