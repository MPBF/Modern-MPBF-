/**
 * 📦 Modern Responsive Orders Page
 * Mobile-First, RTL-Ready, Dark Mode Support
 */

import React, { useState } from "react";
import {
  Plus,
  Filter,
  Search,
  ChevronRight,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import {
  ResponsiveLayout,
  PageContainer,
  Card,
  ResponsiveTable,
} from "@/components/layout/ResponsiveLayout";
import "../styles/pages.css";

// ==========================================
// 🔍 Search & Filter Section
// ==========================================
function SearchFilterBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="search-filter-bar">
      <div className="search-input-wrapper">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="بحث عن الطلبات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filterOpen ? "active" : ""}`}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <Filter size={20} />
          <span>تصفية</span>
        </button>

        <a href="/orders/new" className="btn-primary">
          <Plus size={20} />
          <span>طلب جديد</span>
        </a>
      </div>

      {filterOpen && (
        <div className="filter-dropdown">
          <div className="filter-group">
            <label>الحالة</label>
            <select className="filter-select">
              <option>جميع الحالات</option>
              <option>جديد</option>
              <option>قيد المعالجة</option>
              <option>معلق</option>
              <option>مكتمل</option>
            </select>
          </div>

          <div className="filter-group">
            <label>التاريخ</label>
            <input type="date" className="filter-date" />
          </div>

          <div className="filter-actions">
            <button className="btn-secondary">إعادة تعيين</button>
            <button className="btn-primary">تطبيق</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 📋 Order Item (Mobile Card View)
// ==========================================
function OrderCard({
  order,
}: {
  order: {
    id: string;
    customer: string;
    amount: string;
    date: string;
    status: string;
  };
}) {
  return (
    <Card className="order-card">
      <div className="order-card-header">
        <div className="order-id-badge">{order.id}</div>
        <span className={`status-badge status-${order.status}`}>
          {order.status}
        </span>
      </div>

      <div className="order-card-content">
        <div className="order-field">
          <User size={16} />
          <div>
            <p className="field-label">العميل</p>
            <p className="field-value">{order.customer}</p>
          </div>
        </div>

        <div className="order-field">
          <DollarSign size={16} />
          <div>
            <p className="field-label">المبلغ</p>
            <p className="field-value">{order.amount}</p>
          </div>
        </div>

        <div className="order-field">
          <Calendar size={16} />
          <div>
            <p className="field-label">التاريخ</p>
            <p className="field-value">{order.date}</p>
          </div>
        </div>
      </div>

      <a href={`/orders/${order.id}`} className="order-card-link">
        عرض التفاصيل
        <ChevronRight size={16} />
      </a>
    </Card>
  );
}

// ==========================================
// 📊 Orders List View
// ==========================================
function OrdersListView() {
  const orders = [
    {
      id: "ORD001",
      customer: "عميل 1",
      amount: "15,000 ر.س",
      date: "2026-08-31",
      status: "مكتمل",
    },
    {
      id: "ORD002",
      customer: "عميل 2",
      amount: "8,500 ر.س",
      date: "2026-08-30",
      status: "قيد المعالجة",
    },
    {
      id: "ORD003",
      customer: "عميل 3",
      amount: "12,200 ر.س",
      date: "2026-08-29",
      status: "معلق",
    },
    {
      id: "ORD004",
      customer: "عميل 4",
      amount: "9,800 ر.س",
      date: "2026-08-28",
      status: "جديد",
    },
  ];

  return (
    <>
      {/* Mobile Card View */}
      <div className="orders-list-mobile">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="orders-list-desktop">
        <ResponsiveTable scrollable>
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id-cell">{order.id}</td>
                <td>{order.customer}</td>
                <td className="amount-cell">{order.amount}</td>
                <td>{order.date}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <a href={`/orders/${order.id}`} className="action-link">
                    عرض
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      </div>
    </>
  );
}

// ==========================================
// 📊 Statistics Summary
// ==========================================
function OrdersStatistics() {
  return (
    <div className="stats-summary">
      <div className="stat-item">
        <p className="stat-label">إجمالي الطلبات</p>
        <p className="stat-value">42</p>
      </div>

      <div className="stat-item">
        <p className="stat-label">قيد المعالجة</p>
        <p className="stat-value">8</p>
      </div>

      <div className="stat-item">
        <p className="stat-label">إجمالي المبيعات</p>
        <p className="stat-value">450,000 ر.س</p>
      </div>

      <div className="stat-item">
        <p className="stat-label">متوسط الطلب</p>
        <p className="stat-value">10,714 ر.س</p>
      </div>
    </div>
  );
}

// ==========================================
// 📦 Main Orders Page
// ==========================================
export function OrdersPage() {
  return (
    <ResponsiveLayout>
      <PageContainer
        title="الطلبات"
        description="إدارة وتتبع جميع الطلبات والمبيعات"
      >
        {/* Statistics */}
        <OrdersStatistics />

        {/* Search & Filter */}
        <SearchFilterBar />

        {/* Orders List */}
        <Card>
          <OrdersListView />
        </Card>

        {/* Pagination */}
        <div className="pagination">
          <button className="pagination-btn" disabled>
            السابق
          </button>
          <div className="pagination-info">الصفحة 1 من 5</div>
          <button className="pagination-btn">التالي</button>
        </div>
      </PageContainer>
    </ResponsiveLayout>
  );
}

export default OrdersPage;
