/**
 * 📦 Modern Orders Management Page - Responsive Design
 * Create, Edit, View and Manage Sales Orders
 */

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Save,
  X,
} from "lucide-react";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveButton,
  ResponsiveInput,
  ResponsiveBadge,
  SectionHeader,
  ResponsiveTable,
} from "@/components/ui/responsive-layout";
import { MainLayout, DashboardLayout, ResponsiveModal } from "@/components/layouts/MainLayout";

// ==================== Order Form Component ====================
function OrderForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}) {
  const [formData, setFormData] = useState(
    initialData || {
      orderNumber: "",
      customerName: "",
      product: "",
      quantity: "",
      dueDate: "",
      notes: "",
    }
  );

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault?.();
    onSubmit(formData);
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "تعديل الطلب" : "طلب جديد"}
      size="lg"
      footer={
      <div className="flex justify-end gap-3">
        <ResponsiveButton
          variant="secondary"
          onClick={onClose}
        >
          إلغاء
        </ResponsiveButton>
        <ResponsiveButton
          onClick={handleSubmit}
          icon={<Save className="w-4 h-4" />}
        >
          حفظ الطلب
        </ResponsiveButton>
      </div>
      }
    >
      <form className="space-y-6">
        <ResponsiveGrid cols={2}>
          <ResponsiveInput
            label="رقم الطلب"
            placeholder="ORD001"
            value={formData.orderNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, orderNumber: e.target.value })
            }
          />
          <ResponsiveInput
            label="اسم الزبون"
            placeholder="أدخل اسم الزبون"
            value={formData.customerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
          />
        </ResponsiveGrid>

        <ResponsiveInput
          label="المنتج"
          placeholder="اختر المنتج"
          value={formData.product}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, product: e.target.value })
          }
        />

        <ResponsiveGrid cols={2}>
          <ResponsiveInput
            label="الكمية"
            type="number"
            placeholder="0"
            value={formData.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
          />
          <ResponsiveInput
            label="موعد التسليم"
            type="date"
            value={formData.dueDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
          />
        </ResponsiveGrid>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            الملاحظات
          </label>
          <textarea
            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
            rows={4}
            placeholder="أي ملاحظات إضافية عن الطلب"
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>
      </form>
    </ResponsiveModal>
  );
}

// ==================== Orders List Component ====================
function OrdersList() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: "ORD001",
      customer: "الزبون الأول",
      product: "أكياس بلاستيكية 20سم",
      quantity: 1000,
      dueDate: "2026-09-05",
      status: "pending",
      createdAt: "2026-08-31",
    },
    {
      id: 2,
      orderNumber: "ORD002",
      customer: "الزبون الثاني",
      product: "أكياس بلاستيكية 30سم",
      quantity: 2000,
      dueDate: "2026-09-10",
      status: "approved",
      createdAt: "2026-08-30",
    },
    {
      id: 3,
      orderNumber: "ORD003",
      customer: "الزبون الثالث",
      product: "أكياس بلاستيكية 40سم",
      quantity: 1500,
      dueDate: "2026-09-02",
      status: "completed",
      createdAt: "2026-08-28",
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "قيد الانتظار", variant: "warning" as const },
      approved: { label: "موافق عليه", variant: "primary" as const },
      completed: { label: "مكتمل", variant: "success" as const },
      cancelled: { label: "ملغاة", variant: "danger" as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "primary" as const };
  };

  const filteredOrders = orders.filter(
    (order) =>
      (filterStatus === "all" || order.status === filterStatus) &&
      (order.orderNumber.includes(searchTerm) ||
        order.customer.includes(searchTerm) ||
        order.product.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
        <div className="flex-1">
          <ResponsiveInput
            placeholder="ابحث عن رقم الطلب أو الزبون..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="approved">موافق عليه</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="grid gap-4 md:hidden">
        {filteredOrders.map((order) => (
          <ResponsiveCard key={order.id} hover>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    رقم الطلب
                  </p>
                  <p className="font-bold text-lg">{order.orderNumber}</p>
                </div>
                <ResponsiveBadge variant={getStatusBadge(order.status).variant}>
                  {getStatusBadge(order.status).label}
                </ResponsiveBadge>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    الزبون
                  </p>
                  <p className="font-medium">{order.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    المنتج
                  </p>
                  <p className="font-medium text-sm">{order.product}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      الكمية
                    </p>
                    <p className="font-medium">{order.quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      موعد التسليم
                    </p>
                    <p className="font-medium text-sm">{order.dueDate}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-3 py-2 text-sm bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800">
                  <Eye className="w-4 h-4 inline mr-1" />
                  عرض
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700">
                  <Edit2 className="w-4 h-4 inline mr-1" />
                  تعديل
                </button>
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <ResponsiveTable>
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800">
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
                موعد التسليم
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
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <td className="py-4 px-4 font-medium">{order.orderNumber}</td>
                <td className="py-4 px-4">{order.customer}</td>
                <td className="py-4 px-4 text-sm">{order.product}</td>
                <td className="py-4 px-4 text-center">
                  {order.quantity.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center text-sm">{order.dueDate}</td>
                <td className="py-4 px-4 text-center">
                  <ResponsiveBadge variant={getStatusBadge(order.status).variant}>
                    {getStatusBadge(order.status).label}
                  </ResponsiveBadge>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-danger-600 hover:bg-danger-100 dark:hover:bg-danger-900 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      </div>

      {filteredOrders.length === 0 && (
        <ResponsiveCard className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">لم يتم العثور على طلبات</p>
        </ResponsiveCard>
      )}

      <OrderForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={() => {}} />
    </div>
  );
}

// ==================== Main Orders Page Component ====================
export function ModernOrdersPage() {
  const [formOpen, setFormOpen] = useState(false);

  const navigation = [
    { label: "لوحة التحكم", href: "#" },
    { label: "الطلبات", href: "#", active: true },
    { label: "الإنتاج", href: "#" },
    { label: "المستودع", href: "#" },
  ];

  const user = {
    name: "أحمد محمد",
    email: "ahmed@mpbf.com",
    role: "مدير الطلبات",
  };

  return (
    <MainLayout navigation={navigation} user={user}>
      <DashboardLayout
        title="إدارة الطلبات"
        subtitle="إنشاء وإدارة وتتبع طلبات المبيعات"
        actions={
          <ResponsiveButton
            onClick={() => setFormOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">طلب جديد</span>
          </ResponsiveButton>
        }
      >
        <OrdersList />
      </DashboardLayout>
    </MainLayout>
  );
}

export default ModernOrdersPage;
