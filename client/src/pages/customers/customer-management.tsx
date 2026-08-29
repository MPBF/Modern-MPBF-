import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Edit,
  FileText,
  Loader2,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import PageLayout from "../../components/layout/PageLayout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { canAddInTab, canDeleteInTab, canEditInTab } from "../../utils/roleUtils";

type CustomerForm = {
  name: string;
  name_ar: string;
  code: string;
  phone: string;
  tax_number: string;
  city: string;
  address: string;
  commercial_name: string;
  unified_number: string;
  plate_drawer_code: string;
};

type ProductForm = {
  category_id: string;
  item_id: string;
  size_caption: string;
  width: string;
  left_facing: string;
  right_facing: string;
  thickness: string;
  density: string;
  printing_cylinder: string;
  cutting_length_cm: string;
  raw_material: string;
  master_batch_id: string;
  is_printed: boolean;
  cutting_unit: string;
  punching: string;
  unit_weight_kg: string;
  unit_quantity: string;
  package_weight_kg: string;
  notes: string;
  status: string;
};

const emptyCustomerForm: CustomerForm = {
  name: "",
  name_ar: "",
  code: "",
  phone: "",
  tax_number: "",
  city: "",
  address: "",
  commercial_name: "",
  unified_number: "",
  plate_drawer_code: "",
};

const emptyProductForm: ProductForm = {
  category_id: "none",
  item_id: "none",
  size_caption: "",
  width: "",
  left_facing: "",
  right_facing: "",
  thickness: "",
  density: "0.95",
  printing_cylinder: "بدون طباعة",
  cutting_length_cm: "",
  raw_material: "",
  master_batch_id: "",
  is_printed: false,
  cutting_unit: "كيلو",
  punching: "",
  unit_weight_kg: "",
  unit_quantity: "",
  package_weight_kg: "",
  notes: "",
  status: "active",
};

function toText(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function customerFormFromRecord(customer: any): CustomerForm {
  return {
    name: toText(customer?.name),
    name_ar: toText(customer?.name_ar),
    code: toText(customer?.code),
    phone: toText(customer?.phone),
    tax_number: toText(customer?.tax_number),
    city: toText(customer?.city),
    address: toText(customer?.address),
    commercial_name: toText(customer?.commercial_name),
    unified_number: toText(customer?.unified_number),
    plate_drawer_code: toText(customer?.plate_drawer_code),
  };
}

function productFormFromRecord(product: any): ProductForm {
  return {
    category_id: product?.category_id || "none",
    item_id: product?.item_id || "none",
    size_caption: toText(product?.size_caption),
    width: toText(product?.width),
    left_facing: toText(product?.left_facing),
    right_facing: toText(product?.right_facing),
    thickness: toText(product?.thickness),
    density: toText(product?.density || "0.95"),
    printing_cylinder: toText(product?.printing_cylinder || "بدون طباعة"),
    cutting_length_cm: toText(product?.cutting_length_cm),
    raw_material: toText(product?.raw_material),
    master_batch_id: toText(product?.master_batch_id),
    is_printed: product?.is_printed === true,
    cutting_unit: toText(product?.cutting_unit || "كيلو"),
    punching: toText(product?.punching),
    unit_weight_kg: toText(product?.unit_weight_kg),
    unit_quantity: toText(product?.unit_quantity),
    package_weight_kg: toText(product?.package_weight_kg),
    notes: toText(product?.notes),
    status: toText(product?.status || "active"),
  };
}

async function requestJson(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || "تعذر تنفيذ العملية");
  }
  return body;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <Input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="bg-white"
      />
    </div>
  );
}

function ProductSelect({
  label,
  value,
  onChange,
  children,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

export default function CustomerManagement() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerForm, setCustomerForm] = useState<CustomerForm>(emptyCustomerForm);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const canEditCustomer = canEditInTab(user, "customers");
  const canAddProduct = canAddInTab(user, "customer-products");
  const canEditProduct = canEditInTab(user, "customer-products");
  const canDeleteProduct = canDeleteInTab(user, "customer-products");

  const customersQuery = useQuery<any[]>({
    queryKey: ["/api/customers", { all: true }],
    queryFn: async () => {
      const result = await requestJson("/api/customers?all=true", {
        headers: { "Content-Type": "application/json" },
      });
      return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
    },
  });

  const categoriesQuery = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const result = await requestJson("/api/categories");
      return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
    },
  });

  const itemsQuery = useQuery<any[]>({
    queryKey: ["/api/items"],
    queryFn: async () => {
      const result = await requestJson("/api/items");
      return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
    },
  });

  const customers = Array.isArray(customersQuery.data) ? customersQuery.data : [];
  const selectedCustomer =
    customers.find((customer) => String(customer.id) === selectedCustomerId) || null;

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.name_ar, customer.code, customer.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [customers, customerSearch]);

  const productsQuery = useQuery<any[]>({
    queryKey: ["/api/customer-products", selectedCustomerId],
    enabled: Boolean(selectedCustomerId),
    queryFn: async () => {
      const result = await requestJson(
        `/api/customer-products?customer_id=${encodeURIComponent(selectedCustomerId)}`,
      );
      return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
    },
  });

  useEffect(() => {
    const queryCustomer = new URLSearchParams(window.location.search).get("customer");
    if (queryCustomer && customers.some((customer) => String(customer.id) === queryCustomer)) {
      setSelectedCustomerId(queryCustomer);
    } else if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(String(customers[0].id));
    }
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerForm(customerFormFromRecord(selectedCustomer));
      setEditingProductId(null);
      setProductForm(emptyProductForm);
    }
  }, [selectedCustomer]);

  const chooseCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setLocation(`/customer-management?customer=${encodeURIComponent(id)}`);
  };

  const updateCustomerMutation = useMutation({
    mutationFn: (data: CustomerForm & { id: string }) =>
      requestJson(`/api/customers/${encodeURIComponent(data.id)}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          id: data.id,
          code: data.code || null,
          tax_number: data.tax_number || null,
          phone: data.phone || null,
          plate_drawer_code: data.plate_drawer_code || null,
          commercial_name: data.commercial_name || null,
          unified_number: data.unified_number || null,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "تم تحديث بيانات العميل بنجاح" });
    },
    onError: (error: Error) =>
      toast({ title: "تعذر تحديث بيانات العميل", description: error.message, variant: "destructive" }),
  });

  const saveProductMutation = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ProductForm & { customer_id: string } }) =>
      requestJson(id ? `/api/customer-products/${id}` : "/api/customer-products", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-products"] });
      setEditingProductId(null);
      setProductForm(emptyProductForm);
      toast({ title: editingProductId ? "تم تحديث المنتج بنجاح" : "تمت إضافة المنتج بنجاح" });
    },
    onError: (error: Error) =>
      toast({ title: "تعذر حفظ المنتج", description: error.message, variant: "destructive" }),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => requestJson(`/api/customer-products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-products"] });
      toast({ title: "تم حذف المنتج بنجاح" });
    },
    onError: (error: Error) =>
      toast({ title: "تعذر حذف المنتج", description: error.message, variant: "destructive" }),
  });

  const handleCustomerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer) return;
    updateCustomerMutation.mutate({ ...customerForm, id: String(selectedCustomer.id) });
  };

  const handleProductSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer) return;
    saveProductMutation.mutate({
      id: editingProductId || undefined,
      data: { ...productForm, customer_id: String(selectedCustomer.id) },
    });
  };

  const productName = (product: any) => {
    const category = (categoriesQuery.data || []).find(
      (entry) => String(entry.id) === String(product.category_id),
    );
    const item = (itemsQuery.data || []).find(
      (entry) => String(entry.id) === String(product.item_id),
    );
    return (
      product.size_caption ||
      item?.name_ar ||
      item?.name ||
      category?.name_ar ||
      category?.name ||
      `منتج #${product.id}`
    );
  };

  return (
    <PageLayout
      title="إدارة بيانات العملاء"
      description="ملف إداري متكامل لبيانات العميل ومنتجاته الخاصة"
      actions={
        <Button variant="outline" onClick={() => setLocation("/customers")}>
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى مركز العملاء
        </Button>
      }
    >
      <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-l from-[#0f2341] to-[#173d69] p-5 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Building2 className="h-6 w-6 text-blue-200" />
            </div>
            <div>
              <p className="text-sm text-blue-200">ملف الإدارة</p>
              <h2 className="text-xl font-black">
                {selectedCustomer
                  ? selectedCustomer.name_ar || selectedCustomer.name
                  : "اختر عميلاً للبدء"}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-blue-100">
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              {productsQuery.data?.length || 0} منتج محفوظ
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              {selectedCustomer?.code || "بدون كود"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <Card className="h-fit border-slate-200 xl:sticky xl:top-5">
          <CardHeader className="border-b border-slate-100 p-4">
            <CardTitle className="text-base">اختيار العميل</CardTitle>
            <div className="relative mt-3">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الكود"
                className="pr-9 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-16rem)] space-y-2 overflow-y-auto p-3">
            {customersQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">لا توجد نتائج</p>
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => chooseCustomer(String(customer.id))}
                  className={`w-full rounded-xl border p-3 text-right transition-all ${
                    String(customer.id) === selectedCustomerId
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-transparent bg-slate-50 hover:border-blue-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-bold text-slate-900">
                      {customer.name_ar || customer.name || "عميل بدون اسم"}
                    </span>
                    {String(customer.id) === selectedCustomerId && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {customer.code || customer.phone || `#${customer.id}`}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {!selectedCustomer ? (
          <Card className="border-dashed border-slate-300">
            <CardContent className="py-24 text-center text-slate-500">
              اختر عميلاً من القائمة لعرض بياناته ومنتجاته
            </CardContent>
          </Card>
        ) : (
          <div className="min-w-0 space-y-5">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between gap-3 p-5">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    بيانات العميل
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    رقم العميل: {selectedCustomer.id}
                  </p>
                </div>
                <Badge variant={selectedCustomer.is_active === false ? "secondary" : "default"}>
                  {selectedCustomer.is_active === false ? "غير نشط" : "نشط"}
                </Badge>
              </CardHeader>
              <Separator />
              <CardContent className="p-5">
                <form onSubmit={handleCustomerSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field
                      label="الاسم بالعربية"
                      value={customerForm.name_ar}
                      required
                      onChange={(value) => setCustomerForm((prev) => ({ ...prev, name_ar: value }))}
                    />
                    <Field
                      label="الاسم بالإنجليزية"
                      value={customerForm.name}
                      required
                      onChange={(value) => setCustomerForm((prev) => ({ ...prev, name: value }))}
                    />
                    <Field
                      label="كود العميل"
                      value={customerForm.code}
                      onChange={(value) => setCustomerForm((prev) => ({ ...prev, code: value }))}
                    />
                    <Field
                      label="الجوال"
                      value={customerForm.phone}
                      onChange={(value) => setCustomerForm((prev) => ({ ...prev, phone: value }))}
                    />
                    <Field
                      label="الرقم الضريبي"
                      value={customerForm.tax_number}
                      onChange={(value) =>
                        setCustomerForm((prev) => ({ ...prev, tax_number: value }))
                      }
                    />
                    <Field
                      label="الرقم الموحد"
                      value={customerForm.unified_number}
                      onChange={(value) =>
                        setCustomerForm((prev) => ({ ...prev, unified_number: value }))
                      }
                    />
                    <Field
                      label="الاسم التجاري"
                      value={customerForm.commercial_name}
                      onChange={(value) =>
                        setCustomerForm((prev) => ({ ...prev, commercial_name: value }))
                      }
                    />
                    <Field
                      label="المدينة"
                      value={customerForm.city}
                      onChange={(value) => setCustomerForm((prev) => ({ ...prev, city: value }))}
                    />
                    <Field
                      label="كود درج اللوحة"
                      value={customerForm.plate_drawer_code}
                      onChange={(value) =>
                        setCustomerForm((prev) => ({ ...prev, plate_drawer_code: value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">العنوان</Label>
                    <Textarea
                      value={customerForm.address}
                      onChange={(event) =>
                        setCustomerForm((prev) => ({ ...prev, address: event.target.value }))
                      }
                      className="min-h-20 bg-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!canEditCustomer || updateCustomerMutation.isPending}>
                      {updateCustomerMutation.isPending ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="ml-2 h-4 w-4" />
                      )}
                      حفظ بيانات العميل
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                    منتجات العميل
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    المنتجات الخاصة بهذا العميل فقط
                  </p>
                </div>
                {canAddProduct && (
                  <Button
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm(emptyProductForm);
                    }}
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة منتج
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4 p-5 pt-0">
                {productsQuery.isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                ) : (productsQuery.data || []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                    لا توجد منتجات محفوظة لهذا العميل
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {(productsQuery.data || []).map((product) => (
                      <div
                        key={product.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {productName(product)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">منتج #{product.id}</p>
                          </div>
                          <Badge variant="outline">
                            {product.status === "active" ? "فعال" : "غير فعال"}
                          </Badge>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                          <div>
                            <span className="block text-slate-400">العرض</span>
                            <strong>{product.width || "—"}</strong>
                          </div>
                          <div>
                            <span className="block text-slate-400">السماكة</span>
                            <strong>{product.thickness || "—"}</strong>
                          </div>
                          <div>
                            <span className="block text-slate-400">طول القطع</span>
                            <strong>{product.cutting_length_cm || "—"}</strong>
                          </div>
                          <div>
                            <span className="block text-slate-400">الأكياس/كجم</span>
                            <strong>{product.bags_per_kilo || "—"}</strong>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          {canEditProduct && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProductId(Number(product.id));
                                setProductForm(productFormFromRecord(product));
                              }}
                            >
                              <Edit className="ml-1.5 h-3.5 w-3.5" />
                              تعديل
                            </Button>
                          )}
                          {canDeleteProduct && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteProductMutation.isPending}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `هل أنت متأكد من حذف المنتج «${productName(product)}»؟`,
                                  )
                                ) {
                                  deleteProductMutation.mutate(Number(product.id));
                                }
                              }}
                            >
                              <Trash2 className="ml-1.5 h-3.5 w-3.5" />
                              حذف
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(canAddProduct || editingProductId !== null) && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {editingProductId ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          سيتم ربط المنتج تلقائياً بالعميل المحدد
                        </p>
                      </div>
                      {editingProductId !== null && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProductId(null);
                            setProductForm(emptyProductForm);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <form onSubmit={handleProductSubmit} className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                          label="وصف/مقاس المنتج"
                          value={productForm.size_caption}
                          required
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, size_caption: value }))
                          }
                        />
                        <ProductSelect
                          label="الفئة"
                          value={productForm.category_id}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, category_id: value }))
                          }
                          placeholder="اختر الفئة"
                        >
                          <SelectItem value="none">بدون فئة</SelectItem>
                          {(categoriesQuery.data || []).map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name_ar || category.name}
                            </SelectItem>
                          ))}
                        </ProductSelect>
                        <ProductSelect
                          label="الصنف"
                          value={productForm.item_id}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, item_id: value }))
                          }
                          placeholder="اختر الصنف"
                        >
                          <SelectItem value="none">بدون صنف</SelectItem>
                          {(itemsQuery.data || []).map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name_ar || item.name}
                            </SelectItem>
                          ))}
                        </ProductSelect>
                        <Field
                          label="العرض"
                          type="number"
                          value={productForm.width}
                          onChange={(value) => setProductForm((prev) => ({ ...prev, width: value }))}
                        />
                        <Field
                          label="ثنية يسار"
                          type="number"
                          value={productForm.left_facing}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, left_facing: value }))
                          }
                        />
                        <Field
                          label="ثنية يمين"
                          type="number"
                          value={productForm.right_facing}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, right_facing: value }))
                          }
                        />
                        <Field
                          label="السماكة"
                          type="number"
                          value={productForm.thickness}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, thickness: value }))
                          }
                        />
                        <Field
                          label="الكثافة"
                          type="number"
                          value={productForm.density}
                          onChange={(value) => setProductForm((prev) => ({ ...prev, density: value }))}
                        />
                        <Field
                          label="طول القطع (سم)"
                          type="number"
                          value={productForm.cutting_length_cm}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, cutting_length_cm: value }))
                          }
                        />
                        <Field
                          label="الخامة"
                          value={productForm.raw_material}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, raw_material: value }))
                          }
                        />
                        <Field
                          label="الماستر باتش"
                          value={productForm.master_batch_id}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, master_batch_id: value }))
                          }
                        />
                        <ProductSelect
                          label="أسطوانة الطباعة"
                          value={productForm.printing_cylinder}
                          onChange={(value) =>
                            setProductForm((prev) => ({
                              ...prev,
                              printing_cylinder: value,
                              is_printed: value !== "بدون طباعة",
                            }))
                          }
                          placeholder="اختر الأسطوانة"
                        >
                          <SelectItem value="بدون طباعة">بدون طباعة</SelectItem>
                          {Array.from({ length: 17 }, (_, index) => (index + 4) * 2).map(
                            (size) => (
                              <SelectItem key={size} value={`${size}"`}>
                                {size}"
                              </SelectItem>
                            ),
                          )}
                          <SelectItem value={'39"'}>39"</SelectItem>
                        </ProductSelect>
                        <ProductSelect
                          label="وحدة التقطيع"
                          value={productForm.cutting_unit}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, cutting_unit: value }))
                          }
                          placeholder="اختر الوحدة"
                        >
                          <SelectItem value="كيلو">كيلو</SelectItem>
                          <SelectItem value="رول">رول</SelectItem>
                          <SelectItem value="باكيت">باكيت</SelectItem>
                        </ProductSelect>
                        <Field
                          label="نوع التخريم"
                          value={productForm.punching}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, punching: value }))
                          }
                        />
                        <Field
                          label="وزن الوحدة (كجم)"
                          type="number"
                          value={productForm.unit_weight_kg}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, unit_weight_kg: value }))
                          }
                        />
                        <Field
                          label="عدد الوحدات"
                          type="number"
                          value={productForm.unit_quantity}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, unit_quantity: value }))
                          }
                        />
                        <Field
                          label="وزن العبوة (كجم)"
                          type="number"
                          value={productForm.package_weight_kg}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, package_weight_kg: value }))
                          }
                        />
                        <ProductSelect
                          label="الحالة"
                          value={productForm.status}
                          onChange={(value) =>
                            setProductForm((prev) => ({ ...prev, status: value }))
                          }
                          placeholder="اختر الحالة"
                        >
                          <SelectItem value="active">فعال</SelectItem>
                          <SelectItem value="inactive">غير فعال</SelectItem>
                        </ProductSelect>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={productForm.is_printed}
                          onChange={(event) =>
                            setProductForm((prev) => ({
                              ...prev,
                              is_printed: event.target.checked,
                              printing_cylinder: event.target.checked
                                ? prev.printing_cylinder === "بدون طباعة"
                                  ? '8"'
                                  : prev.printing_cylinder
                                : "بدون طباعة",
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        المنتج مطبوع
                      </label>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700">ملاحظات</Label>
                        <Textarea
                          value={productForm.notes}
                          onChange={(event) =>
                            setProductForm((prev) => ({ ...prev, notes: event.target.value }))
                          }
                          className="min-h-20 bg-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        {editingProductId !== null && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingProductId(null);
                              setProductForm(emptyProductForm);
                            }}
                          >
                            إلغاء
                          </Button>
                        )}
                        <Button
                          type="submit"
                          disabled={
                            saveProductMutation.isPending ||
                            (editingProductId !== null ? !canEditProduct : !canAddProduct)
                          }
                        >
                          {saveProductMutation.isPending ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="ml-2 h-4 w-4" />
                          )}
                          {editingProductId ? "حفظ التعديلات" : "حفظ المنتج"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}