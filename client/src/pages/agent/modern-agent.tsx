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
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

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

interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  metadata?: { documents?: AgentDoc[]; toolsUsed?: string[] } | null;
  pending?: boolean;
}

export default function ModernAgent({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { toast } = useToast();
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

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
    mutationFn: async (message: string) => {
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
    onError: (err: any) => {
      setMessages((prev) => prev.filter((m) => !m.pending));
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

  const send = () => {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", pending: true },
    ]);
    setInput("");
    chatMutation.mutate(text);
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
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-3 flex items-end gap-2">
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
              disabled={chatMutation.isPending || !input.trim()}
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
