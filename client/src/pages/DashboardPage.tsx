/**
 * 📊 Modern Dashboard Page - Responsive Design
 * Production Orders Management with Real-time Updates
 */

import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Download,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveButton,
  ResponsiveBadge,
  SectionHeader,
} from "@/components/ui/responsive-layout";
import { MainLayout, DashboardLayout } from "@/components/layouts/MainLayout";

// ==================== Statistics Card ====================
function StatsCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
}) {
  return (
    <ResponsiveCard hover>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
          {Icon}
        </div>
        {trend && (
          <div
            className={`
              flex items-center gap-1
              text-sm font-medium
              ${
                trend === "up"
                  ? "text-success-600"
                  : "text-danger-600"
              }
            `}
          >
            <TrendingUp className="w-4 h-4" />
            {change}
          </div>
        )}
      </div>
      <h3 className="text-neutral-600 dark:text-neutral-400 text-sm font-medium mb-1">
        {label}
      </h3>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
    </ResponsiveCard>
  );
}

// ==================== Orders Table ====================
function OrdersTable() {
  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      customer: "الزبون الأول",
      product: "أكياس بلاستيكية 20سم",
      quantity: 1000,
      status: "in_progress",
      progress: 65,
      dueDate: "2026-09-05",
    },
    {
      id: "ORD002",
      customer: "الزبون الثاني",
      product: "أكياس بلاستيكية 30سم",
      quantity: 2000,
      status: "pending",
      progress: 0,
      dueDate: "2026-09-10",
    },
    {
      id: "ORD003",
      customer: "الزبون الثالث",
      product: "أكياس بلاستيكية 40سم",
      quantity: 1500,
      status: "completed",
      progress: 100,
      dueDate: "2026-09-02",
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "قيد الانتظار", variant: "warning" as const },
      in_progress: { label: "قيد الإنتاج", variant: "primary" as const },
      completed: { label: "مكتمل", variant: "success" as const },
    };
    const item = statusMap[status as keyof typeof statusMap];
    return item || { label: status, variant: "primary" as const };
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div
          className="
            grid
            gap-4
            sm:hidden
          "
        >
          {/* Mobile Card View */}
          {orders.map((order) => (
            <ResponsiveCard key={order.id} hover>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      رقم الطلب
                    </p>
                    <p className="font-bold text-lg">{order.id}</p>
                  </div>
                  <ResponsiveBadge
                    variant={getStatusBadge(order.status).variant}
                  >
                    {getStatusBadge(order.status).label}
                  </ResponsiveBadge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      الزبون
                    </p>
                    <p className="font-medium">{order.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      الكمية
                    </p>
                    <p className="font-medium">{order.quantity.toLocaleString()} وحدة</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      المنتج
                    </p>
                    <p className="font-medium text-sm">{order.product}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      موعد التسليم
                    </p>
                    <p className="font-medium text-sm">{order.dueDate}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium">التقدم</span>
                    <span className="text-xs font-bold text-primary-600">
                      {order.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </ResponsiveCard>
          ))}
        </div>

        {/* Desktop Table View */}
        <table className="hidden sm:table w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="text-right py-3 px-4 font-semibold text-sm">
                رقم الطلب
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm">
                الزبون
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm">
                المنتج
              </th>
              <th className="text-center py-3 px-4 font-semibold text-sm">
                الكمية
              </th>
              <th className="text-center py-3 px-4 font-semibold text-sm">
                التقدم
              </th>
              <th className="text-center py-3 px-4 font-semibold text-sm">
                الحالة
              </th>
              <th className="text-center py-3 px-4 font-semibold text-sm">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <td className="py-4 px-4 font-medium">{order.id}</td>
                <td className="py-4 px-4">{order.customer}</td>
                <td className="py-4 px-4 text-sm">{order.product}</td>
                <td className="py-4 px-4 text-center">
                  {order.quantity.toLocaleString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8 text-right">
                      {order.progress}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <ResponsiveBadge
                    variant={getStatusBadge(order.status).variant}
                  >
                    {getStatusBadge(order.status).label}
                  </ResponsiveBadge>
                </td>
                <td className="py-4 px-4 text-center">
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    التفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== Main Dashboard Component ====================
export function ModernDashboard() {
  const navigation = [
    { label: "لوحة التحكم", href: "#", icon: <TrendingUp className="w-5 h-5" />, active: true },
    { label: "الطلبات", href: "#", icon: <Package className="w-5 h-5" /> },
    { label: "الإنتاج", href: "#", icon: <Clock className="w-5 h-5" /> },
    { label: "المستودع", href: "#", icon: <AlertCircle className="w-5 h-5" /> },
  ];

  const user = {
    name: "أحمد محمد",
    email: "ahmed@mpbf.com",
    role: "مدير الإنتاج",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
  };

  return (
    <MainLayout navigation={navigation} user={user}>
      <DashboardLayout
        title="لوحة التحكم"
        subtitle="معاينة عامة لعمليات الإنتاج والطلبات"
        actions={
          <ResponsiveFlex gap={3}>
            <ResponsiveButton variant="secondary" size="md" icon={<Filter className="w-4 h-4" />}>
              <span className="hidden sm:inline">تصفية</span>
            </ResponsiveButton>
            <ResponsiveButton variant="secondary" size="md" icon={<Download className="w-4 h-4" />}>
              <span className="hidden sm:inline">تحميل</span>
            </ResponsiveButton>
            <ResponsiveButton size="md" icon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">طلب جديد</span>
            </ResponsiveButton>
          </ResponsiveFlex>
        }
      >
        {/* Statistics Row */}
        <ResponsiveGrid cols={2} className="mb-8">
          <StatsCard
            icon={<Package className="w-6 h-6 text-primary-600" />}
            label="إجمالي الطلبات"
            value="24"
            change="12%"
            trend="up"
          />
          <StatsCard
            icon={<CheckCircle className="w-6 h-6 text-success-600" />}
            label="طلبات مكتملة"
            value="18"
            change="8%"
            trend="up"
          />
          <StatsCard
            icon={<Clock className="w-6 h-6 text-warning-600" />}
            label="قيد الإنتاج"
            value="5"
            change="5%"
            trend="down"
          />
          <StatsCard
            icon={<AlertCircle className="w-6 h-6 text-danger-600" />}
            label="متأخرة"
            value="1"
            change="0%"
            trend="up"
          />
        </ResponsiveGrid>

        {/* Orders Section */}
        <SectionHeader
          title="الطلبات الأخيرة"
          subtitle="آخر 10 طلبات تم تحديثها مؤخراً"
          className="mb-6"
        />
        <ResponsiveCard>
          <OrdersTable />
        </ResponsiveCard>
      </DashboardLayout>
    </MainLayout>
  );
}

export default ModernDashboard;
