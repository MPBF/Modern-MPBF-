import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageLayout from "../../components/layout/PageLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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
import {
  Mail,
  MailOpen,
  Send,
  PenSquare,
  Trash2,
  Reply,
  Inbox,
} from "lucide-react";

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string;
  body?: string | null;
  category: string;
  parent_id?: number | null;
  root_id?: number | null;
  read_at?: string | null;
  created_at?: string | null;
  sender_name?: string | null;
  sender_name_en?: string | null;
  recipient_name?: string | null;
  recipient_name_en?: string | null;
}

const OFFICIAL_CATEGORIES = [
  "تكليف عمل",
  "إشعار خصم",
  "إنذار",
  "توكيل مهام",
] as const;

function categoryBadgeClass(category: string): string {
  switch (category) {
    case "إنذار":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
    case "إشعار خصم":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200";
    case "تكليف عمل":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
    case "توكيل مهام":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

export default function MessagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const myId = user?.id;
  const canSendOfficial = userHasPermission(user, [
    "manage_hr",
    "edit_hr",
    "manage_users",
  ]);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    recipient_id: "",
    category: "عامة",
    subject: "",
    body: "",
  });
  const [openThreadRoot, setOpenThreadRoot] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 30000,
  });
  const { data: usersList = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
  };

  const sendMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "فشل إرسال الرسالة");
      }
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setComposeOpen(false);
      setComposeForm({
        recipient_id: "",
        category: "عامة",
        subject: "",
        body: "",
      });
      setReplyText("");
      toast({ title: "تم إرسال الرسالة" });
    },
    onError: (e: any) =>
      toast({
        title: e?.message || "خطأ في إرسال الرسالة",
        variant: "destructive",
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await fetch("/api/messages/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل حذف الرسالة");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "تم حذف الرسالة" });
    },
    onError: () =>
      toast({ title: "خطأ في حذف الرسالة", variant: "destructive" }),
  });

  // تجميع الرسائل في محادثات حسب الجذر
  const threads = useMemo(() => {
    const byRoot = new Map<number, Message[]>();
    for (const m of messages) {
      const root = m.root_id ?? m.id;
      if (!byRoot.has(root)) byRoot.set(root, []);
      byRoot.get(root)!.push(m);
    }
    const list = Array.from(byRoot.entries()).map(([root, msgs]) => {
      const sorted = [...msgs].sort(
        (a, b) =>
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime(),
      );
      const rootMsg = sorted.find((m) => m.id === root) || sorted[0];
      const last = sorted[sorted.length - 1];
      const unread = sorted.filter(
        (m) => m.recipient_id === myId && !m.read_at,
      ).length;
      return { root, rootMsg, last, msgs: sorted, unread };
    });
    return list.sort(
      (a, b) =>
        new Date(b.last.created_at || 0).getTime() -
        new Date(a.last.created_at || 0).getTime(),
    );
  }, [messages, myId]);

  const inboxThreads = threads.filter((t) =>
    t.msgs.some((m) => m.recipient_id === myId),
  );
  const sentThreads = threads.filter((t) => t.rootMsg.sender_id === myId);
  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  const openThread = threads.find((t) => t.root === openThreadRoot) || null;

  const handleOpenThread = (root: number) => {
    setOpenThreadRoot(root);
    setReplyText("");
    const t = threads.find((x) => x.root === root);
    const unreadIds =
      t?.msgs
        .filter((m) => m.recipient_id === myId && !m.read_at)
        .map((m) => m.id) || [];
    if (unreadIds.length > 0) markReadMutation.mutate(unreadIds);
  };

  const fmt = (d?: string | null) =>
    d
      ? new Date(d).toLocaleString("ar-SA", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "-";

  const otherPartyName = (t: { rootMsg: Message }) =>
    t.rootMsg.sender_id === myId
      ? t.rootMsg.recipient_name || t.rootMsg.recipient_name_en || "-"
      : t.rootMsg.sender_name || t.rootMsg.sender_name_en || "-";

  const renderThreadList = (list: typeof threads, emptyText: string) =>
    isLoading ? (
      <div className="py-8 text-center text-gray-500">جارٍ التحميل...</div>
    ) : list.length === 0 ? (
      <div className="py-8 text-center text-gray-500">{emptyText}</div>
    ) : (
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {list.map((t) => (
          <button
            key={t.root}
            className={`w-full text-right px-3 py-3 flex items-center gap-3 hover:bg-blue-50/60 dark:hover:bg-gray-800/60 transition-colors ${
              t.unread > 0 ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
            }`}
            onClick={() => handleOpenThread(t.root)}
            data-testid={`thread-${t.root}`}
          >
            {t.unread > 0 ? (
              <Mail className="h-5 w-5 text-blue-600 shrink-0" />
            ) : (
              <MailOpen className="h-5 w-5 text-gray-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`truncate ${t.unread > 0 ? "font-bold" : "font-medium"}`}
                >
                  {otherPartyName(t)}
                </span>
                <Badge
                  className={`${categoryBadgeClass(t.rootMsg.category)} border-0`}
                >
                  {t.rootMsg.category}
                </Badge>
                {t.unread > 0 && (
                  <Badge variant="secondary">{t.unread}</Badge>
                )}
              </div>
              <div className="text-sm truncate">
                {t.rootMsg.subject}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {t.last.body || ""}
              </div>
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap shrink-0">
              {fmt(t.last.created_at)}
              {t.msgs.length > 1 && (
                <div className="text-left mt-1">({t.msgs.length})</div>
              )}
            </div>
          </button>
        ))}
      </div>
    );

  return (
    <PageLayout
      title="المراسلات"
      description="بريد داخلي بين مستخدمي النظام — تكليفات، إشعارات، إنذارات ورسائل عامة"
    >
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            صندوق المراسلات
            {totalUnread > 0 && (
              <Badge variant="destructive">{totalUnread} جديدة</Badge>
            )}
          </CardTitle>
          <Button
            onClick={() => setComposeOpen(true)}
            data-testid="button-compose"
          >
            <PenSquare className="h-4 w-4 ml-1" />
            رسالة جديدة
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="inbox" dir="rtl">
            <TabsList className="mx-3 mt-1 mb-2">
              <TabsTrigger value="inbox" data-testid="tab-inbox">
                الوارد
              </TabsTrigger>
              <TabsTrigger value="sent" data-testid="tab-sent">
                الصادر
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">
              {renderThreadList(inboxThreads, "لا توجد رسائل واردة")}
            </TabsContent>
            <TabsContent value="sent">
              {renderThreadList(sentThreads, "لا توجد رسائل صادرة")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* نافذة إنشاء رسالة */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>رسالة جديدة</DialogTitle>
            <DialogDescription>
              الرسالة تصل للمستلم داخل النظام فقط
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>المستلم *</Label>
              <Select
                value={composeForm.recipient_id}
                onValueChange={(v) =>
                  setComposeForm({ ...composeForm, recipient_id: v })
                }
              >
                <SelectTrigger className="mt-1" data-testid="select-recipient">
                  <SelectValue placeholder="اختر المستلم" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(usersList) ? usersList : [])
                    .filter((u: any) => u.id !== myId)
                    .map((u: any) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.display_name_ar || u.display_name || u.username}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع الرسالة</Label>
              <Select
                value={composeForm.category}
                onValueChange={(v) =>
                  setComposeForm({ ...composeForm, category: v })
                }
              >
                <SelectTrigger className="mt-1" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عامة">عامة</SelectItem>
                  {canSendOfficial &&
                    OFFICIAL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الموضوع *</Label>
              <Input
                className="mt-1"
                value={composeForm.subject}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, subject: e.target.value })
                }
                placeholder="موضوع الرسالة"
                data-testid="input-subject"
              />
            </div>
            <div>
              <Label>نص الرسالة</Label>
              <Textarea
                className="mt-1 min-h-28"
                value={composeForm.body}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, body: e.target.value })
                }
                placeholder="اكتب رسالتك هنا..."
                data-testid="input-body"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              إلغاء
            </Button>
            <Button
              disabled={sendMutation.isPending}
              data-testid="button-send"
              onClick={() => {
                if (!composeForm.recipient_id) {
                  toast({ title: "اختر المستلم", variant: "destructive" });
                  return;
                }
                if (!composeForm.subject.trim()) {
                  toast({ title: "اكتب الموضوع", variant: "destructive" });
                  return;
                }
                sendMutation.mutate({
                  recipient_id: Number(composeForm.recipient_id),
                  category: composeForm.category,
                  subject: composeForm.subject.trim(),
                  body: composeForm.body.trim() || null,
                });
              }}
            >
              <Send className="h-4 w-4 ml-1" />
              {sendMutation.isPending ? "جارٍ الإرسال..." : "إرسال"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة المحادثة */}
      <Dialog
        open={openThread !== null}
        onOpenChange={(open) => {
          if (!open) setOpenThreadRoot(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          {openThread && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {openThread.rootMsg.subject}
                  <Badge
                    className={`${categoryBadgeClass(openThread.rootMsg.category)} border-0`}
                  >
                    {openThread.rootMsg.category}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  محادثة مع {otherPartyName(openThread)}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-3 py-2">
                {openThread.msgs.map((m) => {
                  const mine = m.sender_id === myId;
                  return (
                    <div
                      key={m.id}
                      className={`rounded-lg p-3 text-sm border ${
                        mine
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40"
                          : "bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700"
                      }`}
                      data-testid={`message-${m.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold">
                          {mine
                            ? "أنا"
                            : m.sender_name || m.sender_name_en || "-"}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-2">
                          {fmt(m.created_at)}
                          {mine && m.read_at && (
                            <span className="text-green-600">مقروءة</span>
                          )}
                          <button
                            title="حذف"
                            className="text-red-400 hover:text-red-600"
                            onClick={() => {
                              if (confirm("حذف هذه الرسالة من صندوقك؟"))
                                deleteMutation.mutate(m.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">
                        {m.body || <span className="text-gray-400">—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-3 flex gap-2 items-end">
                <Textarea
                  className="min-h-16"
                  placeholder="اكتب ردك..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  data-testid="input-reply"
                />
                <Button
                  disabled={sendMutation.isPending || !replyText.trim()}
                  data-testid="button-reply"
                  onClick={() =>
                    sendMutation.mutate({
                      parent_id: openThread.last.id,
                      body: replyText.trim(),
                    })
                  }
                >
                  <Reply className="h-4 w-4 ml-1" />
                  رد
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
