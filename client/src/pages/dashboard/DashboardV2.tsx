/**
 * 📊 Modern Responsive Dashboard
 * Mobile-First, RTL-Ready, Dark Mode Support
 */

import React, { useState } from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Package,
  Factory,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveLayout,
  PageContainer,
  DashboardGrid,
  Card,
  HeroSection,
} from "@/components/layout/ResponsiveLayout";

// ==========================================
// 📊 Dashboard Stats Card
// ==========================================
function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
}: {
  title: string;
  value: string;
  icon: React.ReactNode | React.ComponentType<any>;
  trend?: number;
  color?: "primary" | "success" | "warning" | "danger";
}) {
  const IconComponent = typeof Icon === "function" ? Icon : () => Icon;
  return (
    <Card className="stats-card">
      <div className="stats-card-content">
        <div className="stats-icon-wrapper" data-color={color}>
          {typeof Icon === "function" ? <Icon size={24} /> : Icon}
        </div>
        <div className="stats-info">
          <h3 className="stats-title">{title}</h3>
          <p className="stats-value">{value}</p>
          {trend !== undefined && (
            <p className={`stats-trend ${trend >= 0 ? "positive" : "negative"}`}>
              <TrendingUp size={16} />
              {trend > 0 ? "+" : ""}{trend}% from last month
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// 📈 Chart Card
// ==========================================
function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          {description && (
            <p className="chart-description">{description}</p>
          )}
        </div>
        <button className="chart-action" aria-label="تحديث">
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="chart-body">{children}</div>
    </Card>
  );
}

// ==========================================
// 📋 Recent Orders Table
// ==========================================
function RecentOrdersTable() {
  const orders = [
    { id: "ORD001", customer: "عميل 1", amount: "15,000 ر.س", status: "مكتمل" },
    { id: "ORD002", customer: "عميل 2", amount: "8,500 ر.س", status: "قيد المعالجة" },
    { id: "ORD003", customer: "عميل 3", amount: "12,200 ر.س", status: "معلق" },
    { id: "ORD004", customer: "عميل 4", amount: "9,800 ر.س", status: "مكتمل" },
  ];

  return (
    <Card>
      <div className="table-header">
        <h3 className="table-title">الطلبات الأخيرة</h3>
        <a href="/orders" className="view-all">
          عرض الكل →
        </a>
      </div>

      <div className="table-responsive">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td>{order.customer}</td>
                <td className="amount">{order.amount}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ==========================================
// 🚨 Alerts Section
// ==========================================
function AlertsSection() {
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "تنبيه: منخفضة المخزون",
      message: "الكيس البلاستيكي (100*150) انخفض إلى أقل من 500 وحدة",
    },
    {
      id: 2,
      type: "danger",
      title: "عطل آلة",
      message: "آلة الطباعة #2 متوقفة عن العمل منذ 2 ساعة",
    },
    {
      id: 3,
      type: "info",
      title: "صيانة مجدولة",
      message: "صيانة الآلة #1 مجدولة غداً الساعة 10:00 صباحاً",
    },
  ];

  return (
    <Card>
      <div className="alerts-header">
        <h3 className="alerts-title">التنبيهات</h3>
        <span className="alerts-count">{alerts.length}</span>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item alert-${alert.type}`}>
            <div className="alert-icon">
              <AlertCircle size={20} />
            </div>
            <div className="alert-content">
              <h4 className="alert-title">{alert.title}</h4>
              <p className="alert-message">{alert.message}</p>
            </div>
            <button className="alert-close" aria-label="إغلاق">
              ✕
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==========================================
// 🎯 Quick Actions
// ==========================================
function QuickActions() {
  const actions = [
    { icon: Package, label: "طلب جديد", href: "/orders/new" },
    { icon: Factory, label: "إنتاج جديد", href: "/production/new" },
    { icon: Users, label: "عميل جديد", href: "/customers/new" },
    { icon: BarChart, label: "تقارير", href: "/reports" },
  ];

  return (
    <div className="quick-actions">
      {actions.map((action) => (
        <a
          key={action.label}
          href={action.href}
          className="quick-action-btn"
          title={action.label}
        >
          <action.icon size={24} />
          <span>{action.label}</span>
        </a>
      ))}
    </div>
  );
}

// ==========================================
// 📊 Main Dashboard Component
// ==========================================
export function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <ResponsiveLayout
      header={
        <div className="dashboard-header-content">
          <div>
            <h1 className="dashboard-title">لوحة التحكم</h1>
            <p className="dashboard-subtitle">مرحباً بك في نظام إدارة الإنتاج MPBF</p>
          </div>
          <button
            className={`refresh-btn ${refreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="تحديث البيانات"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      }
    >
      <PageContainer>
        {/* Hero Section */}
        <HeroSection
          title="مرحباً بك في MPBF"
          description="نظام متكامل لإدارة إنتاج الأكياس البلاستيكية"
          background="gradient"
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Cards */}
        <DashboardGrid columns={2}>
          <StatsCard
            title="الطلبات اليومية"
            value="24"
            icon={Package}
            trend={12}
            color="primary"
          />
          <StatsCard
            title="الإنتاج"
            value="1,250 كغ"
            icon={Factory}
            trend={8}
            color="success"
          />
          <StatsCard
            title="الموظفون النشطون"
            value="42"
            icon={Users}
            trend={-3}
            color="warning"
          />
          <StatsCard
            title="التنبيهات"
            value="3"
            icon={AlertCircle}
            trend={1}
            color="danger"
          />
        </DashboardGrid>

        {/* Main Charts */}
        <DashboardGrid columns={2}>
          <ChartCard
            title="الإنتاج الأسبوعي"
            description="كمية الإنتاج بالكيلوجرام"
          >
            <div className="chart-placeholder">
              <BarChart size={32} />
              <p>رسم بياني - الإنتاج الأسبوعي</p>
            </div>
          </ChartCard>

          <ChartCard
            title="توزيع الطلبات"
            description="توزيع الطلبات حسب الحالة"
          >
            <div className="chart-placeholder">
              <PieChart size={32} />
              <p>رسم بياني - توزيع الطلبات</p>
            </div>
          </ChartCard>

          <ChartCard
            title="الاتجاهات"
            description="اتجاهات الإنتاج والمبيعات"
          >
            <div className="chart-placeholder">
              <LineChart size={32} />
              <p>رسم بياني - الاتجاهات</p>
            </div>
          </ChartCard>

          <AlertsSection />
        </DashboardGrid>

        {/* Recent Orders */}
        <RecentOrdersTable />
      </PageContainer>
    </ResponsiveLayout>
  );
}

export default DashboardPage;
