import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  FileText,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

import PageLayout from "../../components/layout/PageLayout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import { fetchAllCustomerProducts } from "../../lib/queryClient";
import { formatNumberAr } from "../../../../shared/number-utils";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { canDeleteInTab } from "../../utils/roleUtils";

const CLOSED_ORDER_STATUSES = [
  "completed",
  "delivered",
  "cancelled",
  "rejected",
  "archived",
];

function customerName(customer: any) {
  return customer?.name_ar || customer?.name || "عميل بدون اسم";
}

function orderStatusClass(status: string) {
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

function ProductRow({ product }: { product: any }) {
  const value = (item: any) =>
    item === null || item === undefined || item === "" ? "—" : String(item);

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/30"
      data-testid={`customer-product-${product.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">
              {product.size_caption || `منتج #${product.id}`}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              رقم المنتج: {product.id}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">
          {product.is_active === false ? "غير فعال" : "فعال"}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 sm:grid-cols-4">
        <div>
          <span className="block text-slate-400">الخامة</span>
          <strong className="text-slate-700">{value(product.raw_material)}</strong>
        </div>
        <div>
          <span className="block text-slate-400">العرض</span>
          <strong className="text-slate-700">{value(product.width)}</strong>
        </div>
        <div>
          <span className="block text-slate-400">السماكة</span>
          <strong className="text-slate-700">{value(product.thickness)}</strong>
        </div>
        <div>
          <span className="block text-slate-400">كيس/كجم</span>
          <strong className="text-slate-700">{value(product.bags_per_kilo)}</strong>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const canDeleteCustomers = canDeleteInTab(user, "customers");

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/customers/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(body.message || "تعذر حذف العميل");
        (error as Error & { status?: number; related?: Record<string, number> }).status =
          response.status;
        (error as Error & { status?: number; related?: Record<string, number> }).related =
          body.related;
        throw error;
      }
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setSelectedCustomerId("");
      setLocation("/customers");
      toast({ title: "تم حذف العميل بنجاح" });
    },
    onError: (error: Error & { status?: number; related?: Record<string, number> }) => {
      const relatedLabels: Record<string, string> = {
        orders: "طلبات",
        customer_products: "منتجات عملاء",
        finished_goods_vouchers_in: "سندات استلام",
        finished_goods_vouchers_out: "سندات تسليم",
        quality_issues: "بلاغات جودة",
        customer_service_cases: "حالات خدمة عملاء",
      };
      const details = Object.entries(error.related || {})
        .map(([key, value]) => `${value} ${relatedLabels[key] || key}`)
        .join("، ");
      toast({
        title:
          error.status === 409
            ? "لا يمكن حذف العميل"
            : error.status === 404
              ? "العميل غير موجود"
              : "فشل حذف العميل",
        description:
          error.status === 409
            ? `توجد سجلات مرتبطة: ${details}. احفظ السجلات التاريخية أو افصلها أولاً.`
            : error.message,
        variant: "destructive",
      });
    },
  });

  const customersQuery = useQuery<any[]>({
    queryKey: ["/api/customers", { all: true }],
    queryFn: async () => {
      const response = await fetch("/api/customers?all=true", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("تعذر تحميل العملاء");
      const result = await response.json();
      return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
    },
  });

  const productsQuery = useQuery({
    queryKey: ["/api/customer-products", "all"],
    queryFn: () => fetchAllCustomerProducts(),
  });

  const ordersQuery = useQuery<any[]>({
    queryKey: ["/api/orders", { limit: 500 }],
    queryFn: async () => {
      const response = await fetch("/api/orders?limit=500", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("تعذر تحميل سجل الطلبات");
      const result = await response.json();
      return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
    },
  });

  const customers = Array.isArray(customersQuery.data) ? customersQuery.data : [];
  const products = Array.isArray(productsQuery.data?.data)
    ? productsQuery.data.data
    : [];
  const orders = Array.isArray(ordersQuery.data) ? ordersQuery.data : [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCustomer = params.get("customer");
    if (queryCustomer && customers.some((customer) => String(customer.id) === queryCustomer)) {
      setSelectedCustomerId(queryCustomer);
    } else if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(String(customers[0].id));
    }
  }, [customers, selectedCustomerId]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      [
        customer.name,
        customer.name_ar,
        customer.code,
        customer.phone,
        customer.city,
        customer.tax_number,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [customers, searchTerm]);

  const selectedCustomer =
    customers.find((customer) => String(customer.id) === selectedCustomerId) ||
    filteredCustomers[0];
  const selectedCustomerKey = selectedCustomer ? String(selectedCustomer.id) : "";
  const customerProducts = products.filter(
    (product) => String(product.customer_id) === selectedCustomerKey,
  );
  const customerOrders = orders
    .filter((order) => String(order.customer_id) === selectedCustomerKey)
    .sort((a, b) => {
      const first = new Date(a.created_at || 0).getTime();
      const second = new Date(b.created_at || 0).getTime();
      return second - first;
    });
  const activeOrders = customerOrders.filter(
    (order) => !CLOSED_ORDER_STATUSES.includes(String(order.status || "").toLowerCase()),
  );

  const selectCustomer = (customer: any) => {
    const id = String(customer.id);
    setSelectedCustomerId(id);
    const params = new URLSearchParams(window.location.search);
    params.set("customer", id);
    setLocation(`/customers?${params.toString()}`);
  };

  const confirmCustomerDeletion = () => {
    if (!selectedCustomer || deleteCustomerMutation.isPending) return;
    const name = customerName(selectedCustomer);
    if (
      window.confirm(
        `هل أنت متأكد من حذف العميل «${name}»؟ سيتم الحذف فقط إذا لم توجد له سجلات مرتبطة.`,
      )
    ) {
      deleteCustomerMutation.mutate(String(selectedCustomer.id));
    }
  };

  const isLoading =
    customersQuery.isLoading || productsQuery.isLoading || ordersQuery.isLoading;
  const hasError =
    customersQuery.isError || productsQuery.isError || ordersQuery.isError;

  return (
    <PageLayout
      title="مركز العملاء"
      description="ملف موحّد يربط بيانات العميل بمنتجاته وسجل طلباته"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setLocation("/definitions?tab=customers")}
            data-testid="button-manage-customers"
          >
            <Pencil className="ml-2 h-4 w-4" />
            إدارة بيانات العملاء
          </Button>
          <Button
            onClick={() => setLocation("/orders?create=1")}
            data-testid="button-customer-new-order"
          >
            <Plus className="ml-2 h-4 w-4" />
            طلب جديد
          </Button>
          {canDeleteCustomers && selectedCustomer && (
            <Button
              variant="destructive"
              onClick={confirmCustomerDeletion}
              disabled={deleteCustomerMutation.isPending}
              data-testid="button-delete-customer-top"
            >
              <Trash2 className="ml-2 h-4 w-4" />
              {deleteCustomerMutation.isPending ? "جاري الحذف..." : "حذف العميل"}
            </Button>
          )}
        </div>
      }
    >
      {hasError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          تعذر تحميل بعض بيانات العملاء. يرجى تحديث الصفحة والمحاولة مرة أخرى.
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "إجمالي العملاء", value: customers.length, icon: UserRound, tone: "blue" },
          {
            label: "العملاء النشطون",
            value: customers.filter((customer) => customer.is_active !== false).length,
            icon: Building2,
            tone: "emerald",
          },
          { label: "منتجات العملاء", value: products.length, icon: Package, tone: "violet" },
          { label: "إجمالي الطلبات", value: orders.length, icon: FileText, tone: "amber" },
        ].map((stat) => {
          const Icon = stat.icon;
          const toneClasses: Record<string, string> = {
            blue: "bg-blue-100 text-blue-700",
            emerald: "bg-emerald-100 text-emerald-700",
            violet: "bg-violet-100 text-violet-700",
            amber: "bg-amber-100 text-amber-700",
          };
          return (
            <Card key={stat.label} className="border-slate-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-xl p-2.5 ${toneClasses[stat.tone]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900">
                    {isLoading ? "…" : formatNumberAr(stat.value)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="h-fit border-slate-200 xl:sticky xl:top-5">
          <CardHeader className="border-b border-slate-100 p-4">
            <CardTitle className="flex items-center justify-between text-base">
              <span>دليل العملاء</span>
              <span className="text-xs font-normal text-slate-500">
                {formatNumberAr(filteredCustomers.length)}
              </span>
            </CardTitle>
            <div className="relative mt-3">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ابحث بالاسم أو الجوال أو الكود"
                className="pr-9 text-sm"
                data-testid="input-customer-search"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-18rem)] space-y-2 overflow-y-auto p-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))
            ) : filteredCustomers.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                لا توجد نتائج مطابقة
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const isSelected = String(customer.id) === selectedCustomerKey;
                const count = orders.filter(
                  (order) => String(order.customer_id) === String(customer.id),
                ).length;
                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => selectCustomer(customer)}
                    className={`w-full rounded-xl border p-3 text-right transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-transparent bg-slate-50 hover:border-blue-200 hover:bg-white"
                    }`}
                    data-testid={`customer-directory-${customer.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-bold text-slate-900">
                        {customerName(customer)}
                      </span>
                      <ChevronLeft
                        className={`h-4 w-4 shrink-0 ${
                          isSelected ? "text-blue-600" : "text-slate-300"
                        }`}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{customer.phone || customer.code || `#${customer.id}`}</span>
                      <span>{count} طلب</span>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-5">
          {!selectedCustomer ? (
            <Card className="border-dashed border-slate-300">
              <CardContent className="py-20 text-center text-slate-500">
                اختر عميلاً لعرض ملفه الكامل
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="overflow-hidden border-0 bg-[#0f2341] text-white shadow-lg">
                <CardContent className="relative p-5 sm:p-7">
                  <div className="absolute -left-10 -top-16 h-44 w-44 rounded-full bg-blue-400/20 blur-2xl" />
                  <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-start">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-400/20 text-blue-200 ring-1 ring-blue-300/30">
                        <Building2 className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-blue-200">
                          ملف العميل • {selectedCustomer.code || selectedCustomer.id}
                        </p>
                        <h2 className="text-2xl font-black">
                          {customerName(selectedCustomer)}
                        </h2>
                        {selectedCustomer.name_ar &&
                          selectedCustomer.name &&
                          selectedCustomer.name_ar !== selectedCustomer.name && (
                            <p className="mt-1 text-sm text-blue-100">
                              {selectedCustomer.name}
                            </p>
                          )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border-white/20 bg-white/10 text-white">
                        {selectedCustomer.is_active === false ? "غير نشط" : "عميل نشط"}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setLocation("/definitions?tab=customers")}
                      >
                        <Pencil className="ml-2 h-4 w-4" />
                        تعديل البيانات
                      </Button>
                      {canDeleteCustomers && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteCustomerMutation.isPending}
                          onClick={confirmCustomerDeletion}
                          data-testid="button-delete-customer"
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          {deleteCustomerMutation.isPending ? "جاري الحذف..." : "حذف العميل"}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="relative mt-6 grid gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-blue-100">
                      <Phone className="h-4 w-4 text-blue-300" />
                      {selectedCustomer.phone ? (
                        <a href={`tel:${selectedCustomer.phone}`} className="hover:underline">
                          {selectedCustomer.phone}
                        </a>
                      ) : (
                        "لا يوجد جوال"
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <MapPin className="h-4 w-4 text-blue-300" />
                      {selectedCustomer.city || selectedCustomer.address || "لا يوجد عنوان"}
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <Tag className="h-4 w-4 text-blue-300" />
                      الرقم الضريبي: {selectedCustomer.tax_number || "غير مسجل"}
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <CalendarDays className="h-4 w-4 text-blue-300" />
                      {selectedCustomer.created_at
                        ? new Date(selectedCustomer.created_at).toLocaleDateString("ar-SA")
                        : "تاريخ التسجيل غير متوفر"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "الطلبات", value: customerOrders.length, icon: FileText },
                  { label: "الطلبات النشطة", value: activeOrders.length, icon: CalendarDays },
                  { label: "المنتجات المحفوظة", value: customerProducts.length, icon: Package },
                  {
                    label: "آخر طلب",
                    value: customerOrders[0]?.created_at
                      ? new Date(customerOrders[0].created_at).toLocaleDateString("ar-SA")
                      : "—",
                    icon: Tag,
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="border-slate-200">
                      <CardContent className="p-4">
                        <Icon className="mb-3 h-4 w-4 text-blue-600" />
                        <p className="text-xs text-slate-500">{stat.label}</p>
                        <p className="mt-1 truncate text-lg font-black text-slate-900">
                          {typeof stat.value === "number"
                            ? formatNumberAr(stat.value)
                            : stat.value}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between p-5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                      منتجات العميل
                    </CardTitle>
                    <Badge variant="secondary">{customerProducts.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 p-5 pt-0">
                    {customerProducts.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                        لا توجد منتجات محفوظة لهذا العميل
                      </div>
                    ) : (
                      customerProducts.slice(0, 6).map((product) => (
                        <ProductRow key={product.id} product={product} />
                      ))
                    )}
                    {customerProducts.length > 6 && (
                      <p className="pt-1 text-center text-xs text-slate-500">
                        يتم عرض أول 6 منتجات من أصل {customerProducts.length}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between p-5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      سجل الطلبات
                    </CardTitle>
                    <Badge variant="secondary">{customerOrders.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-1 p-5 pt-0">
                    {customerOrders.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                        لا يوجد سجل طلبات لهذا العميل
                      </div>
                    ) : (
                      customerOrders.slice(0, 8).map((order) => {
                        const status = String(order.status || "waiting").toLowerCase();
                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50"
                            data-testid={`customer-order-${order.id}`}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-800">
                                {order.order_number || `طلب #${order.id}`}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {order.created_at
                                  ? new Date(order.created_at).toLocaleDateString("ar-SA")
                                  : "بدون تاريخ"}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Badge className={`border text-[11px] ${orderStatusClass(status)}`}>
                                {t(`orders.statuses.${status}`, { defaultValue: status })}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setLocation(`/orders?search=${encodeURIComponent(order.order_number || order.id)}`)
                                }
                                title="فتح الطلب"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {customerOrders.length > 8 && (
                      <>
                        <Separator className="my-2" />
                        <Button
                          variant="ghost"
                          className="w-full text-blue-700"
                          onClick={() =>
                            setLocation(
                              `/orders?search=${encodeURIComponent(customerName(selectedCustomer))}`,
                            )
                          }
                        >
                          عرض كل طلبات العميل
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-lg">بيانات إضافية</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 p-5 pt-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <span className="block text-xs text-slate-400">الاسم التجاري</span>
                    <strong className="text-slate-700">
                      {selectedCustomer.commercial_name || "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">مندوب المبيعات</span>
                    <strong className="text-slate-700">
                      {selectedCustomer.sales_rep_name_ar ||
                        selectedCustomer.sales_rep_name ||
                        "غير محدد"}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">الرقم الموحد</span>
                    <strong className="text-slate-700">
                      {selectedCustomer.unified_number || "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">كود درج اللوحة</span>
                    <strong className="text-slate-700">
                      {selectedCustomer.plate_drawer_code || "—"}
                    </strong>
                  </div>
                  {selectedCustomer.address && (
                    <div className="sm:col-span-2 lg:col-span-4">
                      <span className="block text-xs text-slate-400">العنوان التفصيلي</span>
                      <strong className="text-slate-700">{selectedCustomer.address}</strong>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}