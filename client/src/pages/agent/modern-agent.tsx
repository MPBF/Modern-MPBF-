import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  FileText,
  FileType,
  Loader2,
  MessageSquare,
  Paperclip,
  X,
  Image as ImageIcon,
  FileSpreadsheet,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";

interface Conversation {
  id: number;
  title: string | null;
  updated_at: string;
}

interface AgentDoc {
  fileName: string;
  type: "pdf" | "word";
  title: string;
  downloadUrl: string;
}

interface AgentAttachment {
  fileName: string;
  mimeType: string;
  size: number;
  kind: "image" | "document" | "spreadsheet" | "text";
  savedToKnowledge?: boolean;
}

interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    documents?: AgentDoc[];
    toolsUsed?: string[];
    attachments?: AgentAttachment[];
  } | null;
  pending?: boolean;
}

interface ChatSubmission {
  message: string;
  attachments: File[];
  saveAttachmentsToKnowledge: boolean;
}

const ACCEPTED_ATTACHMENT_TYPES =
  ".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.json";
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 25 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentIcon(kind: AgentAttachment["kind"]) {
  if (kind === "image") return ImageIcon;
  if (kind === "spreadsheet") return FileSpreadsheet;
  return FileText;
}

export default function ModernAgent({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saveAttachmentsToKnowledge, setSaveAttachmentsToKnowledge] =
    useState(false);
  const canSaveAttachmentsToKnowledge =
    user?.permissions?.includes("admin") ||
    user?.permissions?.includes("manage_modern_agent");

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/modern-agent/conversations"],
  });

  const { data: loadedMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/modern-agent/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (loadedMessages && conversationId) {
      setMessages(loadedMessages);
    }
  }, [loadedMessages, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async ({
      message,
      attachments: files,
      saveAttachmentsToKnowledge: shouldSaveToKnowledge,
    }: ChatSubmission) => {
      if (files.length) {
        const formData = new FormData();
        formData.set("message", message);
        if (conversationId) formData.set("conversationId", String(conversationId));
        if (shouldSaveToKnowledge) {
          formData.set("saveAttachmentsToKnowledge", "true");
        }
        files.forEach((file) => formData.append("files", file));
        const response = await fetch("/api/modern-agent/chat", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(
            payload?.error || payload?.message || "تعذر إرسال المرفقات",
          );
        }
        return response.json();
      }
      const res = await apiRequest("/api/modern-agent/chat", {
        method: "POST",
        body: JSON.stringify({ conversationId, message }),
        timeout: 120000,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }
      setMessages((prev) => [
        ...prev.filter((m) => !m.pending),
        {
          role: "assistant",
          content: data.reply,
          metadata: { documents: data.documents, toolsUsed: data.toolsUsed },
        },
      ]);
      qc.invalidateQueries({
        queryKey: ["/api/modern-agent/conversations"],
      });
    },
    onError: (err: any, submission) => {
      setMessages((prev) => prev.filter((m) => !m.pending));
      if (submission.attachments.length) {
        setAttachments(submission.attachments);
        setSaveAttachmentsToKnowledge(submission.saveAttachmentsToKnowledge);
      }
      if (
        submission.message !== "اقرأ المرفقات المرفقة ونفّذ المطلوب منها."
      ) {
        setInput(submission.message);
      }
      toast({
        title: t("modernAgent.error"),
        description: err?.message || "",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/modern-agent/conversations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_d, id) => {
      if (id === conversationId) {
        setConversationId(null);
        setMessages([]);
      }
      queryClient.invalidateQueries({
        queryKey: ["/api/modern-agent/conversations"],
      });
    },
  });

  const addAttachments = (files: FileList | null) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;
    const oversized = incoming.find((file) => file.size > MAX_ATTACHMENT_BYTES);
    if (oversized) {
      toast({
        title: "حجم الملف كبير",
        description: `يجب ألا يتجاوز حجم كل ملف 5 ميجابايت (${oversized.name}).`,
        variant: "destructive",
      });
      return;
    }
    const oversizedImage = incoming.find(
      (file) => file.type.startsWith("image/") && file.size > MAX_IMAGE_BYTES,
    );
    if (oversizedImage) {
      toast({
        title: "حجم الصورة كبير",
        description: `يجب ألا يتجاوز حجم كل صورة 5 ميجابايت (${oversizedImage.name}).`,
        variant: "destructive",
      });
      return;
    }
    const totalSize =
      attachments.reduce((sum, file) => sum + file.size, 0) +
      incoming.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_ATTACHMENT_BYTES) {
      toast({
        title: "إجمالي حجم المرفقات كبير",
        description: "يجب ألا يتجاوز إجمالي المرفقات 25 ميجابايت في الرسالة الواحدة.",
        variant: "destructive",
      });
      return;
    }
    const available = MAX_ATTACHMENTS - attachments.length;
    if (available <= 0) {
      toast({
        title: "تم الوصول إلى الحد الأقصى",
        description: `يمكن إرفاق ${MAX_ATTACHMENTS} ملفات في الرسالة الواحدة.`,
        variant: "destructive",
      });
      return;
    }
    if (incoming.length > available) {
      toast({
        title: "تمت إضافة بعض الملفات",
        description: `يمكن إرفاق ${MAX_ATTACHMENTS} ملفات كحد أقصى في الرسالة الواحدة.`,
      });
    }
    setAttachments((current) => [...current, ...incoming.slice(0, available)]);
  };

  const send = () => {
    const text = input.trim();
    const files = attachments;
    if ((!text && !files.length) || chatMutation.isPending) return;
    const message =
      text || "اقرأ المرفقات المرفقة ونفّذ المطلوب منها.";
    const pendingAttachments: AgentAttachment[] = files.map((file) => ({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      kind: file.type.startsWith("image/")
        ? "image"
        : /\.(xlsx|xls|csv)$/i.test(file.name)
          ? "spreadsheet"
          : /\.(txt|md|json)$/i.test(file.name)
            ? "text"
            : "document",
      savedToKnowledge: saveAttachmentsToKnowledge,
    }));
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
        metadata: { attachments: pendingAttachments },
      },
      { role: "assistant", content: "", pending: true },
    ]);
    setInput("");
    setAttachments([]);
    setSaveAttachmentsToKnowledge(false);
    chatMutation.mutate({
      message,
      attachments: files,
      saveAttachmentsToKnowledge,
    });
  };

  const newChat = () => {
    setConversationId(null);
    setMessages([]);
  };

  const body = (
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Conversations sidebar */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col">
          <Card className="flex-1 flex flex-col p-3 overflow-hidden">
            <Button
              onClick={newChat}
              className="w-full mb-3 gap-2"
              data-testid="button-new-chat"
            >
              <Plus className="h-4 w-4" />
              {t("modernAgent.newChat")}
            </Button>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm ${
                      c.id === conversationId
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setConversationId(c.id)}
                    data-testid={`conversation-${c.id}`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">
                      {c.title || t("modernAgent.untitled")}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`delete-conversation-${c.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </aside>

        {/* Chat area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-3 text-primary" />
                <p className="text-lg font-medium">
                  {t("modernAgent.greeting")}
                </p>
                <p className="text-sm">{t("modernAgent.greetingHint")}</p>
              </div>
            )}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  data-testid={`message-${m.role}-${idx}`}
                >
                  {m.pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                      {m.content}
                    </div>
                  )}
                  {m.metadata?.documents && m.metadata.documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {m.metadata.documents.map((d) => (
                        <a
                          key={d.fileName}
                          href={d.downloadUrl}
                          className="flex items-center gap-2 text-sm underline"
                          data-testid={`document-${d.fileName}`}
                        >
                          {d.type === "pdf" ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <FileType className="h-4 w-4" />
                          )}
                          {d.title} ({d.type.toUpperCase()})
                        </a>
                      ))}
                    </div>
                  )}
                  {m.metadata?.attachments && m.metadata.attachments.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {m.metadata.attachments.map((attachment) => {
                        const AttachmentIcon = attachmentIcon(attachment.kind);
                        return (
                          <div
                            key={`${attachment.fileName}-${attachment.size}`}
                            className="flex items-center gap-2 rounded-lg border border-current/20 bg-background/20 px-2.5 py-2 text-xs"
                          >
                            <AttachmentIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="min-w-0 flex-1 truncate">
                              {attachment.fileName}
                            </span>
                            <span className="shrink-0 opacity-75">
                              {formatFileSize(attachment.size)}
                            </span>
                            {attachment.savedToKnowledge && (
                              <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                                معرفة الوكيل
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <input
              ref={attachmentInputRef}
              type="file"
              multiple
              accept={ACCEPTED_ATTACHMENT_TYPES}
              className="hidden"
              onChange={(event) => {
                addAttachments(event.target.files);
                event.currentTarget.value = "";
              }}
              data-testid="input-agent-attachments"
            />
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex max-w-full items-center gap-1.5 rounded-lg border bg-muted/50 px-2 py-1.5 text-xs"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="max-w-44 truncate">{file.name}</span>
                    <span className="text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                      className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-destructive"
                      aria-label={`حذف ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {canSaveAttachmentsToKnowledge && attachments.length > 0 && (
              <label className="mb-2 flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={saveAttachmentsToKnowledge}
                  onChange={(event) =>
                    setSaveAttachmentsToKnowledge(event.target.checked)
                  }
                  className="h-3.5 w-3.5 accent-primary"
                  data-testid="checkbox-save-agent-knowledge"
                />
                حفظ المرفقات ضمن مراجع الوكيل الدائمة الخاصة بك
              </label>
            )}
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={chatMutation.isPending}
                title="إرفاق ملف أو صورة"
                aria-label="إرفاق ملف أو صورة"
                data-testid="button-add-agent-attachment"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t("modernAgent.inputPlaceholder")}
                className="resize-none min-h-[44px] max-h-32"
                dir={isAr ? "rtl" : "ltr"}
                data-testid="input-message"
              />
              <Button
                onClick={send}
                disabled={
                  chatMutation.isPending ||
                  (!input.trim() && attachments.length === 0)
                }
                size="icon"
                className="shrink-0 h-11 w-11"
                data-testid="button-send"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
  );

  if (embedded) return body;

  return (
    <PageLayout
      title={t("modernAgent.title")}
      description={t("modernAgent.subtitle")}
    >
      {body}
    </PageLayout>
  );
}
