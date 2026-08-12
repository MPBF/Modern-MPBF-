import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";
import { userHasPermission } from "../../utils/roleUtils";
import { CheckCircle2, XCircle, Trash2, Inbox } from "lucide-react";

interface UserRequest {
  id: number;
  user_id: number;
  type: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  response?: string | null;
  reviewed_by?: number | null;
  leave_start_date?: string | null;
  leave_end_date?: string | null;
  permission_start_time?: string | null;
  permission_end_time?: string | null;
  date?: string | null;
  reviewed_date?: string | null;
  created_at?: string | null;
}

function requestPeriod(r: UserRequest): string {
  if (r.leave_start_date && r.leave_end_date) {
    const fmt = (v: string) => new Date(v).toLocaleDateString("en-GB");
    return `${fmt(r.leave_start_date)} ← ${fmt(r.leave_end_date)}`;
  }
  if (r.permission_start_time && r.permission_end_time) {
    return `${r.permission_start_time} ← ${r.permission_end_time}`;
  }
  return "-";
}

const TYPE_FILTERS = ["الكل", "إجازة", "استئذان", "عامة"] as const;
const STATUS_FILTERS = ["الكل", "معلق", "موافق", "مرفوض"] as const;

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "موافق") return "default";
  if (status === "مرفوض") return "destructive";
  if (status === "معلق") return "secondary";
  return "outline";
}

// الأنواع القديمة (شكوى / طلب خاص) تُعرض ضمن "عامة"
function normalizeType(type: string): string {
  if (type === "إجازة" || type === "استئذان") return type;
  return "عامة";
}

export default function RequestsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canReview = userHasPermission(user, ["manage_hr", "edit_hr"]);
  const canDelete = userHasPermission(user, ["manage_hr", "delete_hr"]);

  const [typeFilter, setTypeFilter] = useState<string>("الكل");
  const [statusFilter, setStatusFilter] = useState<string>("معلق");
  const [reviewTarget, setReviewTarget] = useState<{
    request: UserRequest;
    decision: "موافق" | "مرفوض";
  } | null>(null);
  const [responseText, setResponseText] = useState("");

  const { data: requests = [], isLoading } = useQuery<UserRequest[]>({
    queryKey: ["/api/user-requests"],
  });
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/users"] });

  const userName = (id: number) => {
    const u = Array.isArray(users)
      ? users.find((x: any) => x.id === id)
      : null;
    return u ? u.display_name_ar || u.display_name || u.username : `#${id}`;
  };

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      response,
    }: {
      id: number;
      status: string;
      response: string;
    }) => {
      const res = await fetch(`/api/user-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, response }),
      });
      if (!res.ok) throw new Error("فشل تحديث الطلب");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-requests"] });
      setReviewTarget(null);
      setResponseText("");
      toast({ title: "تم تحديث الطلب بنجاح" });
    },
    onError: () =>
      toast({ title: "خطأ في تحديث الطلب", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/user-requests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل حذف الطلب");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-requests"] });
      toast({ title: "تم حذف الطلب" });
    },
    onError: () =>
      toast({ title: "خطأ في حذف الطلب", variant: "destructive" }),
  });

  const filtered = (Array.isArray(requests) ? requests : []).filter((r) => {
    if (typeFilter !== "الكل" && normalizeType(r.type) !== typeFilter)
      return false;
    if (statusFilter !== "الكل" && r.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = (Array.isArray(requests) ? requests : []).filter(
    (r) => r.status === "معلق",
  ).length;

  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("ar-SA") : "-";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          طلبات الموظفين
          {pendingCount > 0 && (
            <Badge variant="secondary">{pendingCount} معلق</Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32" data-testid="filter-request-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf === "الكل" ? "كل الأنواع" : tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32" data-testid="filter-request-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((sf) => (
                <SelectItem key={sf} value={sf}>
                  {sf === "الكل" ? "كل الحالات" : sf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">جارٍ التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            لا توجد طلبات مطابقة
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-blue-50 dark:bg-gray-800/80 text-blue-800 dark:text-blue-200">
                  <th className="px-3 py-2 text-center">الموظف</th>
                  <th className="px-3 py-2 text-center">النوع</th>
                  <th className="px-3 py-2 text-center">العنوان</th>
                  <th className="px-3 py-2 text-center">التفاصيل</th>
                  <th className="px-3 py-2 text-center">الفترة</th>
                  <th className="px-3 py-2 text-center">التاريخ</th>
                  <th className="px-3 py-2 text-center">الحالة</th>
                  <th className="px-3 py-2 text-center">الرد</th>
                  <th className="px-3 py-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b hover:bg-blue-50/60 dark:hover:bg-gray-800/60"
                    data-testid={`row-request-${r.id}`}
                  >
                    <td className="px-3 py-2 text-center font-medium">
                      {userName(r.user_id)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant="outline">{normalizeType(r.type)}</Badge>
                    </td>
                    <td className="px-3 py-2 text-center">{r.title}</td>
                    <td className="px-3 py-2 text-center max-w-56 truncate">
                      {r.description || "-"}
                    </td>
                    <td
                      className="px-3 py-2 text-center whitespace-nowrap"
                      data-testid={`text-request-period-${r.id}`}
                    >
                      {requestPeriod(r)}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {fmtDate(r.date || r.created_at)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={statusBadgeVariant(r.status)}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center max-w-48 truncate">
                      {r.response || "-"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canReview && r.status === "معلق" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="موافقة"
                              data-testid={`button-approve-${r.id}`}
                              onClick={() =>
                                setReviewTarget({ request: r, decision: "موافق" })
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="رفض"
                              data-testid={`button-reject-${r.id}`}
                              onClick={() =>
                                setReviewTarget({ request: r, decision: "مرفوض" })
                              }
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                            title="حذف"
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-request-${r.id}`}
                            onClick={() => {
                              if (confirm("حذف هذا الطلب؟"))
                                deleteMutation.mutate(r.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReviewTarget(null);
            setResponseText("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewTarget?.decision === "موافق"
                ? "الموافقة على الطلب"
                : "رفض الطلب"}
            </DialogTitle>
            <DialogDescription>
              {reviewTarget
                ? `${reviewTarget.request.title} — ${userName(reviewTarget.request.user_id)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="رد اختياري للموظف..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            data-testid="input-review-response"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewTarget(null);
                setResponseText("");
              }}
            >
              إلغاء
            </Button>
            <Button
              disabled={reviewMutation.isPending}
              variant={
                reviewTarget?.decision === "مرفوض" ? "destructive" : "default"
              }
              data-testid="button-confirm-review"
              onClick={() => {
                if (reviewTarget) {
                  reviewMutation.mutate({
                    id: reviewTarget.request.id,
                    status: reviewTarget.decision,
                    response: responseText.trim(),
                  });
                }
              }}
            >
              {reviewMutation.isPending
                ? "جارٍ الحفظ..."
                : reviewTarget?.decision === "موافق"
                  ? "تأكيد الموافقة"
                  : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
