/**
 * 🏭 Modern Responsive Production Page
 * Mobile-First, RTL-Ready, Dark Mode Support
 */

import React, { useState } from "react";
import {
  Play,
  Pause,
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  Plus,
} from "lucide-react";
import {
  ResponsiveLayout,
  PageContainer,
  Card,
  DashboardGrid,
} from "@/components/layout/ResponsiveLayout";

// ==========================================
// 🎯 Production Stage Indicator
// ==========================================
function StageIndicator({
  stages,
  current,
}: {
  stages: string[];
  current: number;
}) {
  return (
    <div className="stage-indicator">
      {stages.map((stage, index) => (
        <div key={stage} className="stage-wrapper">
          <div
            className={`stage-dot ${index <= current ? "active" : ""} ${
              index === current ? "current" : ""
            }`}
          >
            {index + 1}
          </div>
          {index < stages.length - 1 && (
            <div
              className={`stage-line ${index < current ? "completed" : ""}`}
            />
          )}
        </div>
      ))}

      <div className="stage-labels">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className={`stage-label ${index <= current ? "active" : ""}`}
          >
            {stage}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 🏗️ Production Order Card
// ==========================================
function ProductionOrderCard({
  order,
}: {
  order: {
    id: string;
    orderNumber: string;
    product: string;
    quantity: string;
    progress: number;
    status: string;
    currentStage: number;
  };
}) {
  const stages = ["إنتاج الأغشية", "الطباعة", "القص", "التغليف"];

  return (
    <Card className="production-card">
      <div className="production-header">
        <div>
          <h3 className="production-title">{order.orderNumber}</h3>
          <p className="production-product">{order.product}</p>
        </div>
        <div className={`status-badge status-${order.status}`}>
          {order.status}
        </div>
      </div>

      {/* Stage Indicator */}
      <StageIndicator stages={stages} current={order.currentStage} />

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span>التقدم الكلي</span>
          <span className="progress-value">{order.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${order.progress}%` }}
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="production-details">
        <div className="detail-item">
          <span className="detail-label">الكمية</span>
          <span className="detail-value">{order.quantity}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">الحالة</span>
          <span className="detail-value">{order.status}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="production-actions">
        <button className="btn-secondary">
          <Play size={16} />
          ابدأ
        </button>
        <button className="btn-secondary">
          <Pause size={16} />
          إيقاف
        </button>
        <a href={`/production/${order.id}`} className="btn-primary">
          عرض التفاصيل
        </a>
      </div>
    </Card>
  );
}

// ==========================================
// ⚡ Production Metrics
// ==========================================
function ProductionMetrics() {
  return (
    <DashboardGrid columns={2}>
      <Card className="metric-card">
        <div className="metric-header">
          <TrendingUp size={24} className="metric-icon success" />
          <span>الإنتاجية</span>
        </div>
        <p className="metric-value">1,250 كغ</p>
        <p className="metric-label">اليوم</p>
      </Card>

      <Card className="metric-card">
        <div className="metric-header">
          <Zap size={24} className="metric-icon warning" />
          <span>سرعة الإنتاج</span>
        </div>
        <p className="metric-value">95%</p>
        <p className="metric-label">من الكاملة</p>
      </Card>

      <Card className="metric-card">
        <div className="metric-header">
          <Clock size={24} className="metric-icon primary" />
          <span>الوقت المتوقع</span>
        </div>
        <p className="metric-value">2 ساعة</p>
        <p className="metric-label">للانتهاء</p>
      </Card>

      <Card className="metric-card">
        <div className="metric-header">
          <AlertCircle size={24} className="metric-icon danger" />
          <span>المشاكل</span>
        </div>
        <p className="metric-value">1</p>
        <p className="metric-label">تحتاج إلى تصحيح</p>
      </Card>
    </DashboardGrid>
  );
}

// ==========================================
// 🏭 Active Production List
// ==========================================
function ActiveProductionList() {
  const [activeTab, setActiveTab] = useState("active");

  const orders = [
    {
      id: "1",
      orderNumber: "ORD001",
      product: "أكياس 30x50",
      quantity: "500,000 كيس",
      progress: 75,
      status: "قيد المعالجة",
      currentStage: 2,
    },
    {
      id: "2",
      orderNumber: "ORD002",
      product: "أكياس 40x60",
      quantity: "300,000 كيس",
      progress: 40,
      status: "قيد المعالجة",
      currentStage: 1,
    },
    {
      id: "3",
      orderNumber: "ORD003",
      product: "أكياس 25x40",
      quantity: "200,000 كيس",
      progress: 90,
      status: "قريب من الانتهاء",
      currentStage: 3,
    },
  ];

  return (
    <div className="production-list-section">
      {/* Tabs */}
      <div className="production-tabs">
        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          قيد المعالجة
        </button>
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          في الانتظار
        </button>
        <button
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          مكتملة
        </button>
      </div>

      {/* Orders Grid */}
      <div className="production-grid">
        {orders.map((order) => (
          <ProductionOrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Add New Button */}
      <div className="production-add-new">
        <a href="/production/new" className="btn-primary btn-lg">
          <Plus size={20} />
          أضف أمر إنتاج جديد
        </a>
      </div>
    </div>
  );
}

// ==========================================
// 🏭 Main Production Page
// ==========================================
export function ProductionPage() {
  return (
    <ResponsiveLayout>
      <PageContainer
        title="الإنتاج"
        description="إدارة وتتبع عمليات الإنتاج"
      >
        {/* Metrics */}
        <ProductionMetrics />

        {/* Production List */}
        <ActiveProductionList />
      </PageContainer>
    </ResponsiveLayout>
  );
}

export default ProductionPage;
