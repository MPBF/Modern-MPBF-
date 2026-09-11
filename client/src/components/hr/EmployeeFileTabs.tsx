import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Calculator, Pencil } from "lucide-react";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";
import { userHasPermission } from "../../utils/roleUtils";
import { useLanguage } from "../../contexts/LanguageContext";

type L = (ar: string, en: string) => string;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function num(v: any): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function money(v: any, isRTL: boolean): string {
  return num(v).toLocaleString(isRTL ? "ar-SA" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function useHrPerms() {
  const { user } = useAuth();
  return {
    canAdd: userHasPermission(user, ["manage_hr", "add_hr"]),
    canEdit: userHasPermission(user, ["manage_hr", "edit_hr"]),
    canDelete: userHasPermission(user, ["manage_hr", "delete_hr"]),
    canManage: userHasPermission(user, ["manage_hr"]),
    // أذونات التدريب تطابق وسطاء المسارات في الخادم (تشمل أذونات التدريب المخصصة)
    canAddTraining: userHasPermission(user, [
      "manage_hr",
      "add_hr",
      "manage_training",
    ]),
    canDeleteTraining: userHasPermission(user, [
      "manage_hr",
      "delete_hr",
      "manage_training",
    ]),
  };
}

function EmptyState({ text }: { text: string }) {
  return <div className="py-8 text-center text-gray-500">{text}</div>;
}

function DeleteButton({
  label,
  message,
  onConfirm,
  isPending,
  testId,
}: {
  label: string;
  message: string;
  onConfirm: () => void;
  isPending: boolean;
  testId: string;
}) {
  const [open, setOpen] = useState(false);
  const { isRTL } = useLanguage();
  const L: L = (ar, en) => (isRTL ? ar : en);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700"
        onClick={() => setOpen(true)}
        data-testid={testId}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{label}</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{L("إلغاء", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              {L("حذف", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-500">{label}</Label>
      {children}
    </div>
  );
}

function useInvalidate(userId: number, segment: string) {
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["/api/hr/employees", userId, segment],
    });
}

// ============ المخالفات (للقراءة، تُدار من شاشة المخالفات) ============
export function ViolationsTab({ userId }: { userId: number }) {
  const { isRTL } = useLanguage();
  const L: L = (ar, en) => (isRTL ? ar : en);
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["/api/hr/employees", userId, "violations"],
  });
  const rows = data?.data ?? [];

  const statusBadge = (s: string) => {
    if (s === "cancelled")
      return <Badge variant="outline">{L("ملغاة", "Cancelled")}</Badge>;
    if (s === "resolved")
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {L("تمت المعالجة", "Resolved")}
        </Badge>
      );
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        {L("مفتوحة", "Open")}
      </Badge>
    );
  };

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!rows.length)
    return <EmptyState text={L("لا توجد مخالفات", "No violations")} />;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{L("التاريخ", "Date")}</TableHead>
            <TableHead>{L("النوع", "Type")}</TableHead>
            <TableHead>{L("الوصف", "Description")}</TableHead>
            <TableHead>{L("الجزاء", "Penalty")}</TableHead>
            <TableHead>{L("الحالة", "Status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((v) => (
            <TableRow key={v.id} data-testid={`row-violation-${v.id}`}>
              <TableCell className="whitespace-nowrap">{v.date}</TableCell>
              <TableCell>{v.violation_type || "—"}</TableCell>
              <TableCell className="max-w-xs truncate">
                {v.description || "—"}
              </TableCell>
              <TableCell>{money(v.penalty_amount, isRTL)}</TableCell>
              <TableCell>{statusBadge(v.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============ المكافآت ============
export function RewardsTab({ userId }: { userId: number }) {
  const { isRTL } = useLanguage();
  const L: L = (ar, en) => (isRTL ? ar : en);
  const { toast } = useToast();
  const { canAdd, canEdit, canDelete } = useHrPerms();
  const invalidate = useInvalidate(userId, "rewards");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyForm = {
    reward_type: "bonus",
    amount: "",
    reason: "",
    date: today(),
    status: "approved",
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setForm({
      reward_type: r.reward_type ?? "bonus",
      amount: r.amount != null ? String(r.amount) : "",
      reason: r.reason ?? "",
      date: r.date ?? today(),
      status: r.status ?? "approved",
    });
    setShowForm(true);
  };

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["/api/hr/employees", userId, "rewards"],
  });
  const rows = data?.data ?? [];

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/hr/employees/${userId}/rewards`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      resetForm();
      toast({ title: L("تمت إضافة المكافأة", "Reward added") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message || L("تعذر الحفظ", "Failed to save"),
      }),
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/hr/rewards/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      resetForm();
      toast({ title: L("تم تحديث المكافأة", "Reward updated") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message || L("تعذر الحفظ", "Failed to save"),
      }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/hr/rewards/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      invalidate();
      toast({ title: L("تم حذف المكافأة", "Reward deleted") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const typeLabel = (t: string) =>
    t === "incentive"
      ? L("حافز", "Incentive")
      : t === "appreciation"
        ? L("تقدير", "Appreciation")
        : L("مكافأة", "Bonus");

  return (
    <div className="space-y-4">
      {canAdd && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant={showForm ? "outline" : "default"}
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            data-testid="button-add-reward"
          >
            <Plus className="ml-1 h-4 w-4" />
            {showForm
              ? L("إغلاق", "Close")
              : L("إضافة مكافأة", "Add reward")}
          </Button>
        </div>
      )}

      {(canAdd || canEdit) && showForm && (
        <div className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={L("النوع", "Type")}>
            <Select
              value={form.reward_type}
              onValueChange={(v) => setForm({ ...form, reward_type: v })}
            >
              <SelectTrigger data-testid="select-reward-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bonus">{L("مكافأة", "Bonus")}</SelectItem>
                <SelectItem value="incentive">
                  {L("حافز", "Incentive")}
                </SelectItem>
                <SelectItem value="appreciation">
                  {L("تقدير", "Appreciation")}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={L("المبلغ", "Amount")}>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              data-testid="input-reward-amount"
            />
          </Field>
          <Field label={L("التاريخ", "Date")}>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              data-testid="input-reward-date"
            />
          </Field>
          <Field label={L("الحالة", "Status")}>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger data-testid="select-reward-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">
                  {L("معتمدة", "Approved")}
                </SelectItem>
                <SelectItem value="pending">
                  {L("قيد الاعتماد", "Pending")}
                </SelectItem>
                <SelectItem value="cancelled">
                  {L("ملغاة", "Cancelled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2 lg:col-span-2">
            <Field label={L("السبب", "Reason")}>
              <Textarea
                rows={2}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                data-testid="input-reward-reason"
              />
            </Field>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() =>
                editingId ? updateMut.mutate() : createMut.mutate()
              }
              disabled={
                createMut.isPending || updateMut.isPending || !form.amount
              }
              data-testid="button-save-reward"
            >
              {editingId ? L("تحديث", "Update") : L("حفظ", "Save")}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !rows.length ? (
        <EmptyState text={L("لا توجد مكافآت", "No rewards")} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{L("التاريخ", "Date")}</TableHead>
                <TableHead>{L("النوع", "Type")}</TableHead>
                <TableHead>{L("المبلغ", "Amount")}</TableHead>
                <TableHead>{L("السبب", "Reason")}</TableHead>
                <TableHead>{L("الحالة", "Status")}</TableHead>
                {(canEdit || canDelete) && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} data-testid={`row-reward-${r.id}`}>
                  <TableCell className="whitespace-nowrap">{r.date}</TableCell>
                  <TableCell>{typeLabel(r.reward_type)}</TableCell>
                  <TableCell>{money(r.amount, isRTL)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {r.reason || "—"}
                  </TableCell>
                  <TableCell>
                    {r.status === "cancelled"
                      ? L("ملغاة", "Cancelled")
                      : r.status === "pending"
                        ? L("قيد الاعتماد", "Pending")
                        : L("معتمدة", "Approved")}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEdit(r)}
                            data-testid={`button-edit-reward-${r.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <DeleteButton
                            testId={`button-delete-reward-${r.id}`}
                            label={L("حذف المكافأة", "Delete reward")}
                            message={L(
                              "هل أنت متأكد من حذف هذه المكافأة؟",
                              "Are you sure you want to delete this reward?",
                            )}
                            isPending={deleteMut.isPending}
                            onConfirm={() => deleteMut.mutate(r.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ============ العهد والأصول ============
export function CustodyTab({ userId }: { userId: number }) {
  const { isRTL } = useLanguage();
  const L: L = (ar, en) => (isRTL ? ar : en);
  const { toast } = useToast();
  const { canAdd, canEdit, canDelete } = useHrPerms();
  const invalidate = useInvalidate(userId, "custody");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyForm = {
    item_name: "",
    quantity: "1",
    handover_date: today(),
    status: "handed",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      item_name: c.item_name ?? "",
      quantity: c.quantity != null ? String(c.quantity) : "1",
      handover_date: c.handover_date ?? today(),
      status: c.status ?? "handed",
      notes: c.notes ?? "",
    });
    setShowForm(true);
  };

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["/api/hr/employees", userId, "custody"],
  });
  const rows = data?.data ?? [];

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/hr/employees/${userId}/custody`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      resetForm();
      toast({ title: L("تمت إضافة العهدة", "Custody added") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/hr/custody/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      resetForm();
      toast({ title: L("تم تحديث العهدة", "Custody updated") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/hr/custody/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      invalidate();
      toast({ title: L("تم حذف العهدة", "Custody deleted") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const statusLabel = (s: string) =>
    s === "returned"
      ? L("مُعادة", "Returned")
      : s === "lost"
        ? L("مفقودة", "Lost")
        : s === "damaged"
          ? L("تالفة", "Damaged")
          : L("مُسلّمة", "Handed");

  return (
    <div className="space-y-4">
      {canAdd && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant={showForm ? "outline" : "default"}
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            data-testid="button-add-custody"
          >
            <Plus className="ml-1 h-4 w-4" />
            {showForm ? L("إغلاق", "Close") : L("إضافة عهدة", "Add custody")}
          </Button>
        </div>
      )}

      {(canAdd || canEdit) && showForm && (
        <div className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={L("اسم الصنف", "Item")}>
            <Input
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              data-testid="input-custody-item"
            />
          </Field>
          <Field label={L("الكمية", "Quantity")}>
            <Input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              data-testid="input-custody-quantity"
            />
          </Field>
          <Field label={L("تاريخ التسليم", "Handover date")}>
            <Input
              type="date"
              value={form.handover_date}
              onChange={(e) =>
                setForm({ ...form, handover_date: e.target.value })
              }
              data-testid="input-custody-date"
            />
          </Field>
          <Field label={L("الحالة", "Status")}>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger data-testid="select-custody-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="handed">{L("مُسلّمة", "Handed")}</SelectItem>
                <SelectItem value="returned">
                  {L("مُعادة", "Returned")}
                </SelectItem>
                <SelectItem value="lost">{L("مفقودة", "Lost")}</SelectItem>
                <SelectItem value="damaged">{L("تالفة", "Damaged")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label={L("ملاحظات", "Notes")}>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                data-testid="input-custody-notes"
              />
            </Field>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() =>
                editingId ? updateMut.mutate() : createMut.mutate()
              }
              disabled={
                createMut.isPending || updateMut.isPending || !form.item_name
              }
              data-testid="button-save-custody"
            >
              {editingId ? L("تحديث", "Update") : L("حفظ", "Save")}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !rows.length ? (
        <EmptyState text={L("لا توجد عهد", "No custody items")} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{L("الصنف", "Item")}</TableHead>
                <TableHead>{L("الكمية", "Qty")}</TableHead>
                <TableHead>{L("تاريخ التسليم", "Handover")}</TableHead>
                <TableHead>{L("الحالة", "Status")}</TableHead>
                <TableHead>{L("ملاحظات", "Notes")}</TableHead>
                {(canEdit || canDelete) && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} data-testid={`row-custody-${c.id}`}>
                  <TableCell>{c.item_name}</TableCell>
                  <TableCell>{c.quantity}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {c.handover_date}
                  </TableCell>
                  <TableCell>{statusLabel(c.status)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {c.notes || "—"}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEdit(c)}
                            data-testid={`button-edit-custody-${c.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <DeleteButton
                            testId={`button-delete-custody-${c.id}`}
                            label={L("حذف العهدة", "Delete custody")}
                            message={L(
                              "هل أنت متأكد من حذف هذه العهدة؟",
                              "Are you sure you want to delete this item?",
                            )}
                            isPending={deleteMut.isPending}
                            onConfirm={() => deleteMut.mutate(c.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ============ التدريبات ============
export function TrainingTab({ userId }: { userId: number }) {
  const { isRTL } = useLanguage();
  const L: L = (ar, en) => (isRTL ? ar : en);
  const enrollmentStatusLabel = (s?: string | null) => {
    switch (s) {
      case "completed":
        return L("مكتمل", "Completed");
      case "failed":
        return L("غير مجتاز", "Failed");
      case "not_started":
        return L("لم يبدأ", "Not started");
      default:
        return s || "—";
    }
  };
  const { toast } = useToast();
  const { canAddTraining, canDeleteTraining } = useHrPerms();
  const invalidate = useInvalidate(userId, "training");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    training_name: "",
    training_type: "",
    instructor: "",
    date: today(),
    status: "completed",
    notes: "",
  });

  const { data, isLoading } = useQuery<{
    data: { enrollments: any[]; records: any[] };
  }>({
    queryKey: ["/api/hr/employees", userId, "training"],
  });
  const enrollments = data?.data?.enrollments ?? [];
  const records = data?.data?.records ?? [];

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/hr/employees/${userId}/training`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setForm({
        training_name: "",
        training_type: "",
        instructor: "",
        date: today(),
        status: "completed",
        notes: "",
      });
      toast({ title: L("تمت إضافة سجل التدريب", "Training record added") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/hr/training-records/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      invalidate();
      toast({ title: L("تم حذف سجل التدريب", "Training record deleted") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  return (
    <div className="space-y-6">
      {/* البرامج الميدانية المسجّل بها */}
      <div>
        <h4 className="mb-2 text-sm font-semibold">
          {L("البرامج التدريبية المسجّل بها", "Enrolled programs")}
        </h4>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !enrollments.length ? (
          <EmptyState text={L("لا توجد تسجيلات", "No enrollments")} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{L("البرنامج", "Program")}</TableHead>
                  <TableHead>{L("الحالة", "Status")}</TableHead>
                  <TableHead>{L("تاريخ التسجيل", "Enrolled")}</TableHead>
                  <TableHead>{L("تاريخ التدريب", "Training date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e.id} data-testid={`row-enrollment-${e.id}`}>
                    <TableCell>
                      {(isRTL ? e.program_title_ar : e.program_title) ||
                        e.program_title ||
                        "—"}
                    </TableCell>
                    <TableCell>{enrollmentStatusLabel(e.status)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {e.enrolled_date
                        ? String(e.enrolled_date).slice(0, 10)
                        : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {e.training_date || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* سجلات التدريب */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold">
            {L("سجلات التدريب", "Training records")}
          </h4>
          {canAddTraining && (
            <Button
              size="sm"
              variant={showForm ? "outline" : "default"}
              onClick={() => setShowForm((s) => !s)}
              data-testid="button-add-training"
            >
              <Plus className="ml-1 h-4 w-4" />
              {showForm ? L("إغلاق", "Close") : L("إضافة سجل", "Add record")}
            </Button>
          )}
        </div>

        {canAddTraining && showForm && (
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={L("اسم التدريب", "Training name")}>
              <Input
                value={form.training_name}
                onChange={(e) =>
                  setForm({ ...form, training_name: e.target.value })
                }
                data-testid="input-training-name"
              />
            </Field>
            <Field label={L("النوع", "Type")}>
              <Input
                value={form.training_type}
                onChange={(e) =>
                  setForm({ ...form, training_type: e.target.value })
                }
                data-testid="input-training-type"
              />
            </Field>
            <Field label={L("المدرّب", "Instructor")}>
              <Input
                value={form.instructor}
                onChange={(e) =>
                  setForm({ ...form, instructor: e.target.value })
                }
                data-testid="input-training-instructor"
              />
            </Field>
            <Field label={L("التاريخ", "Date")}>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                data-testid="input-training-date"
              />
            </Field>
            <Field label={L("الحالة", "Status")}>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger data-testid="select-training-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    {L("مكتمل", "Completed")}
                  </SelectItem>
                  <SelectItem value="pending">
                    {L("قيد التنفيذ", "Pending")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {L("ملغى", "Cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label={L("ملاحظات", "Notes")}>
                <Textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  data-testid="input-training-notes"
                />
              </Field>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => createMut.mutate()}
                disabled={createMut.isPending || !form.training_name}
                data-testid="button-save-training"
              >
                {L("حفظ", "Save")}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !records.length ? (
          <EmptyState text={L("لا توجد سجلات تدريب", "No training records")} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{L("التاريخ", "Date")}</TableHead>
                  <TableHead>{L("اسم التدريب", "Name")}</TableHead>
                  <TableHead>{L("النوع", "Type")}</TableHead>
                  <TableHead>{L("المدرّب", "Instructor")}</TableHead>
                  <TableHead>{L("الحالة", "Status")}</TableHead>
                  {canDeleteTraining && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id} data-testid={`row-training-${r.id}`}>
                    <TableCell className="whitespace-nowrap">
                      {r.date}
                    </TableCell>
                    <TableCell>{r.training_name || "—"}</TableCell>
                    <TableCell>{r.training_type || "—"}</TableCell>
                    <TableCell>{r.instructor || "—"}</TableCell>
                    <TableCell>{r.status || "—"}</TableCell>
                    {canDeleteTraining && (
                      <TableCell>
                        <DeleteButton
                          testId={`button-delete-training-${r.id}`}
                          label={L("حذف سجل التدريب", "Delete record")}
                          message={L(
                            "هل أنت متأكد من حذف هذا السجل؟",
                            "Are you sure you want to delete this record?",
                          )}
                          isPending={deleteMut.isPending}
                          onConfirm={() => deleteMut.mutate(r.id)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ السمات الشخصية ============
export function TraitsTab({ userId }: { userId: number }) {
  const { isRTL } = useLanguage();
  const L: L = (ar, en) => (isRTL ? ar : en);
  const { toast } = useToast();
  const { canAdd, canEdit, canDelete } = useHrPerms();
  const invalidate = useInvalidate(userId, "traits");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyForm = {
    trait: "",
    category: "skill",
    rating: "",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setForm({
      trait: t.trait ?? "",
      category: t.category ?? "skill",
      rating: t.rating != null ? String(t.rating) : "",
      notes: t.notes ?? "",
    });
    setShowForm(true);
  };

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["/api/hr/employees", userId, "traits"],
  });
  const rows = data?.data ?? [];

  const buildPayload = () => {
    const payload: any = { ...form };
    if (payload.rating === "") delete payload.rating;
    return payload;
  };

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/hr/employees/${userId}/traits`, {
        method: "POST",
        body: JSON.stringify(buildPayload()),
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      resetForm();
      toast({ title: L("تمت إضافة السمة", "Trait added") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/hr/traits/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(buildPayload()),
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      resetForm();
      toast({ title: L("تم تحديث السمة", "Trait updated") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/hr/traits/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      invalidate();
      toast({ title: L("تم حذف السمة", "Trait deleted") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const categoryLabel = (c: string | null) =>
    c === "behavior"
      ? L("سلوك", "Behavior")
      : c === "strength"
        ? L("نقطة قوة", "Strength")
        : c === "development"
          ? L("مجال تطوير", "Development")
          : c === "skill"
            ? L("مهارة", "Skill")
            : "—";

  return (
    <div className="space-y-4">
      {canAdd && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant={showForm ? "outline" : "default"}
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            data-testid="button-add-trait"
          >
            <Plus className="ml-1 h-4 w-4" />
            {showForm ? L("إغلاق", "Close") : L("إضافة سمة", "Add trait")}
          </Button>
        </div>
      )}

      {(canAdd || canEdit) && showForm && (
        <div className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={L("السمة", "Trait")}>
            <Input
              value={form.trait}
              onChange={(e) => setForm({ ...form, trait: e.target.value })}
              data-testid="input-trait-name"
            />
          </Field>
          <Field label={L("الفئة", "Category")}>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger data-testid="select-trait-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skill">{L("مهارة", "Skill")}</SelectItem>
                <SelectItem value="behavior">{L("سلوك", "Behavior")}</SelectItem>
                <SelectItem value="strength">
                  {L("نقطة قوة", "Strength")}
                </SelectItem>
                <SelectItem value="development">
                  {L("مجال تطوير", "Development")}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={L("التقييم (1-5)", "Rating (1-5)")}>
            <Input
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              data-testid="input-trait-rating"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label={L("ملاحظات", "Notes")}>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                data-testid="input-trait-notes"
              />
            </Field>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() =>
                editingId ? updateMut.mutate() : createMut.mutate()
              }
              disabled={
                createMut.isPending || updateMut.isPending || !form.trait
              }
              data-testid="button-save-trait"
            >
              {editingId ? L("تحديث", "Update") : L("حفظ", "Save")}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !rows.length ? (
        <EmptyState text={L("لا توجد سمات", "No traits")} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{L("السمة", "Trait")}</TableHead>
                <TableHead>{L("الفئة", "Category")}</TableHead>
                <TableHead>{L("التقييم", "Rating")}</TableHead>
                <TableHead>{L("ملاحظات", "Notes")}</TableHead>
                {(canEdit || canDelete) && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id} data-testid={`row-trait-${t.id}`}>
                  <TableCell>{t.trait}</TableCell>
                  <TableCell>{categoryLabel(t.category)}</TableCell>
                  <TableCell>{t.rating != null ? `${t.rating}/5` : "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {t.notes || "—"}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEdit(t)}
                            data-testid={`button-edit-trait-${t.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <DeleteButton
                            testId={`button-delete-trait-${t.id}`}
                            label={L("حذف السمة", "Delete trait")}
                            message={L(
                              "هل أنت متأكد من حذف هذه السمة؟",
                              "Are you sure you want to delete this trait?",
                            )}
                            isPending={deleteMut.isPending}
                            onConfirm={() => deleteMut.mutate(t.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ============ الأجور ============
function monthName(m: number, isRTL: boolean) {
  const arMonths = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const enMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return (isRTL ? arMonths : enMonths)[m - 1] ?? String(m);
}

export function WagesTab({ userId }: { userId: number }) {
  const { isRTL } = useLanguage();
  const L: L = (ar, en) => (isRTL ? ar : en);
  const { toast } = useToast();
  const { canManage, canDelete } = useHrPerms();
  const invalidate = useInvalidate(userId, "wages");
  const now = new Date();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
    base_hourly_rate: "",
    overtime_multiplier: "1.5",
    notes: "",
  });

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["/api/hr/employees", userId, "wages"],
  });
  const rows = data?.data ?? [];

  const computeMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        `/api/hr/employees/${userId}/wages/compute`,
        {
          method: "POST",
          body: JSON.stringify({
            year: Number(form.year),
            month: Number(form.month),
            base_hourly_rate: Number(form.base_hourly_rate),
            overtime_multiplier: Number(form.overtime_multiplier),
            notes: form.notes || null,
          }),
        },
      );
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      toast({ title: L("تم حساب الأجر وحفظه", "Wage computed and saved") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message || L("تعذر الحساب", "Failed to compute"),
      }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/hr/wages/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      invalidate();
      toast({ title: L("تم حذف سجل الأجر", "Wage record deleted") });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: L("خطأ", "Error"),
        description: e?.message,
      }),
  });

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant={showForm ? "outline" : "default"}
            onClick={() => setShowForm((s) => !s)}
            data-testid="button-compute-wage"
          >
            <Calculator className="ml-1 h-4 w-4" />
            {showForm ? L("إغلاق", "Close") : L("حساب أجر شهر", "Compute wage")}
          </Button>
        </div>
      )}

      {canManage && showForm && (
        <div className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={L("السنة", "Year")}>
            <Select
              value={form.year}
              onValueChange={(v) => setForm({ ...form, year: v })}
            >
              <SelectTrigger data-testid="select-wage-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={L("الشهر", "Month")}>
            <Select
              value={form.month}
              onValueChange={(v) => setForm({ ...form, month: v })}
            >
              <SelectTrigger data-testid="select-wage-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {monthName(m, isRTL)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={L("أجر الساعة الأساسي", "Base hourly rate")}>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.base_hourly_rate}
              onChange={(e) =>
                setForm({ ...form, base_hourly_rate: e.target.value })
              }
              data-testid="input-wage-rate"
            />
          </Field>
          <Field label={L("معامل الإضافي", "Overtime multiplier")}>
            <Input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={form.overtime_multiplier}
              onChange={(e) =>
                setForm({ ...form, overtime_multiplier: e.target.value })
              }
              data-testid="input-wage-multiplier"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label={L("ملاحظات", "Notes")}>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                data-testid="input-wage-notes"
              />
            </Field>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => computeMut.mutate()}
              disabled={computeMut.isPending || !form.base_hourly_rate}
              data-testid="button-save-wage"
            >
              {L("حساب وحفظ", "Compute & save")}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !rows.length ? (
        <EmptyState text={L("لا توجد سجلات أجور", "No wage records")} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{L("الشهر", "Month")}</TableHead>
                <TableHead>{L("الأجر الأساسي", "Basic")}</TableHead>
                <TableHead>{L("الإضافي", "Overtime")}</TableHead>
                <TableHead>{L("الخصومات", "Deductions")}</TableHead>
                <TableHead>{L("الجزاءات", "Penalties")}</TableHead>
                <TableHead>{L("المكافآت", "Rewards")}</TableHead>
                <TableHead>{L("الصافي", "Net")}</TableHead>
                {canDelete && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.id} data-testid={`row-wage-${w.id}`}>
                  <TableCell className="whitespace-nowrap">
                    {monthName(w.month, isRTL)} {w.year}
                  </TableCell>
                  <TableCell>{money(w.basic_pay, isRTL)}</TableCell>
                  <TableCell>{money(w.overtime_pay, isRTL)}</TableCell>
                  <TableCell className="text-red-600">
                    {money(w.deductions_amount, isRTL)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {money(w.penalties_amount, isRTL)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {money(w.rewards_amount, isRTL)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {money(w.net_pay, isRTL)}
                  </TableCell>
                  {canDelete && (
                    <TableCell>
                      <DeleteButton
                        testId={`button-delete-wage-${w.id}`}
                        label={L("حذف سجل الأجر", "Delete wage record")}
                        message={L(
                          "هل أنت متأكد من حذف سجل الأجر هذا؟",
                          "Are you sure you want to delete this wage record?",
                        )}
                        isPending={deleteMut.isPending}
                        onConfirm={() => deleteMut.mutate(w.id)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
