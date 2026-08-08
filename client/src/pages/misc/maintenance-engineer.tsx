import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Cog,
  Send,
  Plus,
  Trash2,
  Loader2,
  MessageSquare,
  Upload,
  BookOpen,
  ClipboardList,
  FileText,
  Pencil,
  X,
  Save,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { ScrollArea } from "../../components/ui/scroll-area";
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
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";

interface Conversation {
  id: number;
  title: string | null;
  updated_at: string;
}

interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  metadata?: { toolsUsed?: string[] } | null;
  pending?: boolean;
}

interface KnowledgeItem {
  id: number;
  title: string;
  machine_category: string;
  source_type: string;
  file_name: string | null;
  enabled: boolean;
  content_length: number;
  created_at: string;
}

interface MachineOption {
  id: string;
  name: string;
  name_ar: string | null;
  category: string;
  status: string;
}

interface ChangeLogItem {
  id: number;
  machine_id: string;
  note: string;
  changed_by_name: string | null;
  created_at: string;
}

const CATEGORIES = ["general", "extruder", "printer", "cutter"] as const;

export default function MaintenanceEngineer({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const perms: string[] = user?.permissions || [];
  const canManage =
    perms.includes("admin") || perms.includes("manage_maintenance");

  const categoryLabel = (c: string) => t(`maintenanceEngineer.categories.${c}`);

  // ───────────────────────── chat state ─────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/maintenance-engineer/conversations"],
  });

  const { data: loadedMessages } = useQuery<ChatMessage[]>({
    queryKey: [
      "/api/maintenance-engineer/conversations",
      conversationId,
      "messages",
    ],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (loadedMessages && conversationId) setMessages(loadedMessages);
  }, [loadedMessages, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("/api/maintenance-engineer/chat", {
        method: "POST",
        body: JSON.stringify({ conversationId, message }),
        timeout: 120000,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (!conversationId && data.conversationId)
        setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev.filter((m) => !m.pending),
        {
          role: "assistant",
          content: data.reply,
          metadata: { toolsUsed: data.toolsUsed },
        },
      ]);
      qc.invalidateQueries({
        queryKey: ["/api/maintenance-engineer/conversations"],
      });
    },
    onError: (err: any) => {
      setMessages((prev) => prev.filter((m) => !m.pending));
      toast({
        title: t("maintenanceEngineer.error"),
        description: err?.message || "",
        variant: "destructive",
      });
    },
  });

  const deleteConvMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/maintenance-engineer/conversations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_d, id) => {
      if (id === conversationId) {
        setConversationId(null);
        setMessages([]);
      }
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-engineer/conversations"],
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

  // ───────────────────────── knowledge base ─────────────────────────
  const { data: knowledge = [] } = useQuery<KnowledgeItem[]>({
    queryKey: ["/api/maintenance-engineer/knowledge"],
    enabled: canManage,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<string>("general");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Manual text note create / edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState<string>("general");
  const [noteContent, setNoteContent] = useState("");

  const resetNoteForm = () => {
    setEditingId(null);
    setNoteTitle("");
    setNoteCategory("general");
    setNoteContent("");
  };

  const startEdit = (k: KnowledgeItem & { content?: string }) => {
    setEditingId(k.id);
    setNoteTitle(k.title);
    setNoteCategory(k.machine_category);
    setNoteContent("");
  };

  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, any> = {
        title: noteTitle.trim(),
        machine_category: noteCategory,
      };
      if (noteContent.trim()) body.content = noteContent.trim();
      if (editingId) {
        const res = await apiRequest(
          `/api/maintenance-engineer/knowledge/${editingId}`,
          { method: "PUT", body: JSON.stringify(body) },
        );
        return res.json();
      }
      const res = await apiRequest("/api/maintenance-engineer/knowledge", {
        method: "POST",
        body: JSON.stringify({ ...body, content: noteContent.trim() }),
      });
      return res.json();
    },
    onSuccess: () => {
      resetNoteForm();
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-engineer/knowledge"],
      });
      toast({ title: t("maintenanceEngineer.kb.noteSaved") });
    },
    onError: (err: any) => {
      toast({
        title: t("maintenanceEngineer.error"),
        description: err?.message || "",
        variant: "destructive",
      });
    },
  });

  const toggleEnabledMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const res = await apiRequest(
        `/api/maintenance-engineer/knowledge/${id}`,
        { method: "PUT", body: JSON.stringify({ enabled }) },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-engineer/knowledge"],
      });
    },
    onError: (err: any) => {
      toast({
        title: t("maintenanceEngineer.error"),
        description: err?.message || "",
        variant: "destructive",
      });
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("machine_category", uploadCategory);
      if (uploadTitle.trim()) fd.append("title", uploadTitle.trim());
      const res = await fetch("/api/maintenance-engineer/knowledge/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || t("maintenanceEngineer.error"));
      }
      setUploadTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      qc.invalidateQueries({
        queryKey: ["/api/maintenance-engineer/knowledge"],
      });
      toast({ title: t("maintenanceEngineer.kb.uploadSuccess") });
    } catch (err: any) {
      toast({
        title: t("maintenanceEngineer.error"),
        description: err?.message || "",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteKnowledgeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/maintenance-engineer/knowledge/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-engineer/knowledge"],
      });
    },
  });

  // ───────────────────────── change log ─────────────────────────
  const { data: machines = [] } = useQuery<MachineOption[]>({
    queryKey: ["/api/maintenance-engineer/machines"],
    enabled: canManage,
  });

  const [logMachineId, setLogMachineId] = useState<string>("");
  const [logNote, setLogNote] = useState("");

  const { data: changeLog = [] } = useQuery<ChangeLogItem[]>({
    queryKey: [
      "/api/maintenance-engineer/change-log",
      { machine_id: logMachineId },
    ],
    enabled: canManage,
  });

  const addLogMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/maintenance-engineer/change-log", {
        method: "POST",
        body: JSON.stringify({ machine_id: logMachineId, note: logNote.trim() }),
      });
      return res.json();
    },
    onSuccess: () => {
      setLogNote("");
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-engineer/change-log"],
      });
      toast({ title: t("maintenanceEngineer.changeLog.saved") });
    },
    onError: (err: any) => {
      toast({
        title: t("maintenanceEngineer.error"),
        description: err?.message || "",
        variant: "destructive",
      });
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/maintenance-engineer/change-log/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-engineer/change-log"],
      });
    },
  });

  const machineName = (m: MachineOption) =>
    isAr && m.name_ar ? m.name_ar : m.name;

  const body = (
      <Tabs defaultValue="chat" className="w-full">
        <TabsList>
          <TabsTrigger value="chat" data-testid="tab-chat">
            <Cog className="h-4 w-4 ms-1 me-1" />
            {t("maintenanceEngineer.tabs.chat")}
          </TabsTrigger>
          {canManage && (
            <>
              <TabsTrigger value="knowledge" data-testid="tab-knowledge">
                <BookOpen className="h-4 w-4 ms-1 me-1" />
                {t("maintenanceEngineer.tabs.knowledge")}
              </TabsTrigger>
              <TabsTrigger value="changelog" data-testid="tab-changelog">
                <ClipboardList className="h-4 w-4 ms-1 me-1" />
                {t("maintenanceEngineer.tabs.changeLog")}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* ─────────── Chat ─────────── */}
        <TabsContent value="chat">
          <div className="flex gap-4 h-[calc(100vh-260px)]">
            <aside className="w-64 shrink-0 hidden md:flex flex-col">
              <Card className="flex-1 flex flex-col p-3 overflow-hidden">
                <Button
                  onClick={newChat}
                  className="w-full mb-3 gap-2"
                  data-testid="button-new-chat"
                >
                  <Plus className="h-4 w-4" />
                  {t("maintenanceEngineer.newChat")}
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
                          {c.title || t("maintenanceEngineer.untitled")}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConvMutation.mutate(c.id);
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

            <Card className="flex-1 flex flex-col overflow-hidden">
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Cog className="h-12 w-12 mb-3 text-primary" />
                    <p className="text-lg font-medium">
                      {t("maintenanceEngineer.greeting")}
                    </p>
                    <p className="text-sm max-w-md">
                      {t("maintenanceEngineer.greetingHint")}
                    </p>
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
                    </div>
                  </div>
                ))}
              </div>

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
                  placeholder={t("maintenanceEngineer.inputPlaceholder")}
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
        </TabsContent>

        {/* ─────────── Knowledge Base ─────────── */}
        {canManage && (
          <TabsContent value="knowledge">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 md:col-span-1 space-y-3 h-fit">
                <h3 className="font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {t("maintenanceEngineer.kb.uploadTitle")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("maintenanceEngineer.kb.uploadHint")}
                </p>
                <div className="space-y-1.5">
                  <Label>{t("maintenanceEngineer.kb.titleField")}</Label>
                  <Input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={t("maintenanceEngineer.kb.titlePlaceholder")}
                    data-testid="input-kb-title"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("maintenanceEngineer.kb.category")}</Label>
                  <Select
                    value={uploadCategory}
                    onValueChange={setUploadCategory}
                  >
                    <SelectTrigger data-testid="select-kb-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {categoryLabel(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                  data-testid="input-kb-file"
                />
                <Button
                  className="w-full gap-2"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-kb-upload"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {t("maintenanceEngineer.kb.chooseFile")}
                </Button>

                <div className="border-t pt-3 mt-3 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    {editingId
                      ? t("maintenanceEngineer.kb.editNoteTitle")
                      : t("maintenanceEngineer.kb.noteTitle")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("maintenanceEngineer.kb.noteHint")}
                  </p>
                  <div className="space-y-1.5">
                    <Label>{t("maintenanceEngineer.kb.titleField")}</Label>
                    <Input
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder={t("maintenanceEngineer.kb.titlePlaceholder")}
                      data-testid="input-note-title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("maintenanceEngineer.kb.category")}</Label>
                    <Select value={noteCategory} onValueChange={setNoteCategory}>
                      <SelectTrigger data-testid="select-note-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {categoryLabel(c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("maintenanceEngineer.kb.contentField")}</Label>
                    <Textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder={
                        editingId
                          ? t("maintenanceEngineer.kb.contentEditPlaceholder")
                          : t("maintenanceEngineer.kb.contentPlaceholder")
                      }
                      className="min-h-[120px]"
                      dir={isAr ? "rtl" : "ltr"}
                      data-testid="input-note-content"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      disabled={
                        !noteTitle.trim() ||
                        (!editingId && !noteContent.trim()) ||
                        saveNoteMutation.isPending
                      }
                      onClick={() => saveNoteMutation.mutate()}
                      data-testid="button-save-note"
                    >
                      {saveNoteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {t("maintenanceEngineer.kb.saveNote")}
                    </Button>
                    {editingId && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={resetNoteForm}
                        data-testid="button-cancel-note"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:col-span-2">
                <h3 className="font-medium mb-3">
                  {t("maintenanceEngineer.kb.listTitle")}
                </h3>
                {knowledge.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    {t("maintenanceEngineer.kb.empty")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {knowledge.map((k) => (
                      <div
                        key={k.id}
                        className={`flex items-center gap-3 p-3 rounded-md border ${
                          k.enabled ? "" : "opacity-60"
                        }`}
                        data-testid={`knowledge-${k.id}`}
                      >
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{k.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {categoryLabel(k.machine_category)} ·{" "}
                            {k.source_type === "upload"
                              ? t("maintenanceEngineer.kb.sourceUpload")
                              : t("maintenanceEngineer.kb.sourceManual")}{" "}
                            · {k.content_length}{" "}
                            {t("maintenanceEngineer.kb.chars")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={k.enabled}
                            onCheckedChange={(v) =>
                              toggleEnabledMutation.mutate({
                                id: k.id,
                                enabled: v,
                              })
                            }
                            title={
                              k.enabled
                                ? t("maintenanceEngineer.kb.enabled")
                                : t("maintenanceEngineer.kb.disabled")
                            }
                            data-testid={`toggle-knowledge-${k.id}`}
                          />
                          <button
                            onClick={() => startEdit(k)}
                            className="text-muted-foreground hover:text-foreground"
                            title={t("maintenanceEngineer.kb.edit")}
                            data-testid={`edit-knowledge-${k.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteKnowledgeMutation.mutate(k.id)}
                            className="text-destructive hover:opacity-70"
                            data-testid={`delete-knowledge-${k.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        )}

        {/* ─────────── Change Log ─────────── */}
        {canManage && (
          <TabsContent value="changelog">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 md:col-span-1 space-y-3 h-fit">
                <h3 className="font-medium">
                  {t("maintenanceEngineer.changeLog.addTitle")}
                </h3>
                <div className="space-y-1.5">
                  <Label>{t("maintenanceEngineer.changeLog.machine")}</Label>
                  <Select value={logMachineId} onValueChange={setLogMachineId}>
                    <SelectTrigger data-testid="select-log-machine">
                      <SelectValue
                        placeholder={t(
                          "maintenanceEngineer.changeLog.selectMachine",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {machineName(m)} ({m.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("maintenanceEngineer.changeLog.note")}</Label>
                  <Textarea
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder={t(
                      "maintenanceEngineer.changeLog.notePlaceholder",
                    )}
                    className="min-h-[100px]"
                    dir={isAr ? "rtl" : "ltr"}
                    data-testid="input-log-note"
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={
                    !logMachineId ||
                    !logNote.trim() ||
                    addLogMutation.isPending
                  }
                  onClick={() => addLogMutation.mutate()}
                  data-testid="button-add-log"
                >
                  {addLogMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("maintenanceEngineer.changeLog.save")
                  )}
                </Button>
              </Card>

              <Card className="p-4 md:col-span-2">
                <h3 className="font-medium mb-3">
                  {t("maintenanceEngineer.changeLog.listTitle")}
                </h3>
                {changeLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    {t("maintenanceEngineer.changeLog.empty")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {changeLog.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 p-3 rounded-md border"
                        data-testid={`changelog-${c.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="whitespace-pre-wrap break-words text-sm">
                            {c.note}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {c.machine_id}
                            {c.changed_by_name ? ` · ${c.changed_by_name}` : ""}
                            {c.created_at
                              ? ` · ${new Date(c.created_at).toLocaleString(
                                  isAr ? "ar" : "en",
                                )}`
                              : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteLogMutation.mutate(c.id)}
                          className="text-destructive hover:opacity-70 shrink-0"
                          data-testid={`delete-changelog-${c.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
  );

  if (embedded) return body;

  return (
    <PageLayout
      title={t("maintenanceEngineer.title")}
      description={t("maintenanceEngineer.subtitle")}
    >
      {body}
    </PageLayout>
  );
}
