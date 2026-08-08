import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Save, Lock, Globe } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
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

interface ToolMeta {
  name: string;
  kind: "read" | "write";
  permission: string | null;
  description: string;
}
interface AgentTask {
  id: number;
  task_key: string;
  name_ar: string;
  name_en: string;
  description: string | null;
  response_guidance: string | null;
  language: string;
  allowed_tools: string[];
  is_write: boolean;
  required_permission: string | null;
  max_daily_interactions: number | null;
  sort_order: number;
  enabled: boolean;
}
interface KnowledgeEntry {
  id: number;
  title: string;
  content: string;
  category: string;
  is_private: boolean;
  enabled: boolean;
}
interface AgentSettings {
  id: number;
  model: string;
  default_language: string;
  base_persona: string | null;
  temperature: string;
  max_tool_iterations: number;
  enabled: boolean;
}

function invalidate(key: string) {
  queryClient.invalidateQueries({ queryKey: [key] });
}

export function ModernAgentSettingsContent() {
  return (
    <Tabs defaultValue="general" dir="rtl">
      <TabsList className="mb-4">
        <TabsTrigger value="general" data-testid="tab-general">
          عام
        </TabsTrigger>
        <TabsTrigger value="tasks" data-testid="tab-tasks">
          المهام
        </TabsTrigger>
        <TabsTrigger value="knowledge" data-testid="tab-knowledge">
          قاعدة المعرفة
        </TabsTrigger>
        <TabsTrigger value="access" data-testid="tab-access">
          الصلاحيات
        </TabsTrigger>
        <TabsTrigger value="profiles" data-testid="tab-profiles">
          ملفات المستخدمين
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <GeneralSettings />
      </TabsContent>
      <TabsContent value="tasks">
        <TasksManager />
      </TabsContent>
      <TabsContent value="knowledge">
        <KnowledgeManager />
      </TabsContent>
      <TabsContent value="access">
        <AccessManager />
      </TabsContent>
      <TabsContent value="profiles">
        <ProfilesManager />
      </TabsContent>
    </Tabs>
  );
}

function GeneralSettings() {
  const { toast } = useToast();
  const { data } = useQuery<AgentSettings>({
    queryKey: ["/api/modern-agent/settings"],
  });
  const [form, setForm] = useState<Partial<AgentSettings> | null>(null);
  const current = { ...(data || {}), ...(form || {}) } as AgentSettings;

  const save = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/modern-agent/settings", {
        method: "PUT",
        body: JSON.stringify({
          model: current.model,
          default_language: current.default_language,
          base_persona: current.base_persona,
          temperature: String(current.temperature),
          max_tool_iterations: Number(current.max_tool_iterations),
          enabled: current.enabled,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate("/api/modern-agent/settings");
      toast({ title: "تم حفظ الإعدادات" });
    },
    onError: (e: any) =>
      toast({ title: "خطأ", description: e?.message, variant: "destructive" }),
  });

  if (!data) return <div>جاري التحميل...</div>;

  return (
    <Card className="p-6 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <Label>تفعيل الوكيل الذكي</Label>
        <Switch
          checked={current.enabled}
          onCheckedChange={(v) => setForm({ ...form, enabled: v })}
          data-testid="switch-enabled"
        />
      </div>
      <div>
        <Label>النموذج (Model)</Label>
        <Input
          value={current.model || ""}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          data-testid="input-model"
        />
      </div>
      <div>
        <Label>اللغة الافتراضية</Label>
        <Select
          value={current.default_language}
          onValueChange={(v) => setForm({ ...form, default_language: v })}
        >
          <SelectTrigger data-testid="select-language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">تلقائي (حسب لغة المستخدم)</SelectItem>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>الشخصية الأساسية (Persona)</Label>
        <Textarea
          rows={5}
          value={current.base_persona || ""}
          onChange={(e) => setForm({ ...form, base_persona: e.target.value })}
          data-testid="input-persona"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>درجة الإبداع (Temperature)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={current.temperature ?? ""}
            onChange={(e) =>
              setForm({ ...form, temperature: e.target.value as any })
            }
            data-testid="input-temperature"
          />
        </div>
        <div>
          <Label>أقصى عدد لدورات الأدوات</Label>
          <Input
            type="number"
            min="1"
            max="20"
            value={current.max_tool_iterations ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                max_tool_iterations: Number(e.target.value),
              })
            }
            data-testid="input-iterations"
          />
        </div>
      </div>
      <Button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="gap-2"
        data-testid="button-save-settings"
      >
        <Save className="h-4 w-4" />
        حفظ
      </Button>
    </Card>
  );
}

const EMPTY_TASK: Partial<AgentTask> = {
  task_key: "",
  name_ar: "",
  name_en: "",
  description: "",
  response_guidance: "",
  language: "auto",
  allowed_tools: [],
  is_write: false,
  required_permission: null,
  max_daily_interactions: null,
  sort_order: 0,
  enabled: true,
};

function TasksManager() {
  const { toast } = useToast();
  const { data: tasks = [] } = useQuery<AgentTask[]>({
    queryKey: ["/api/modern-agent/tasks"],
  });
  const { data: tools = [] } = useQuery<ToolMeta[]>({
    queryKey: ["/api/modern-agent/tools"],
  });
  const [editing, setEditing] = useState<Partial<AgentTask> | null>(null);

  const saveTask = useMutation({
    mutationFn: async (task: Partial<AgentTask>) => {
      const isNew = !task.id;
      const res = await apiRequest(
        isNew
          ? "/api/modern-agent/tasks"
          : `/api/modern-agent/tasks/${task.id}`,
        {
          method: isNew ? "POST" : "PUT",
          body: JSON.stringify({
            task_key: task.task_key,
            name_ar: task.name_ar,
            name_en: task.name_en,
            description: task.description,
            response_guidance: task.response_guidance,
            language: task.language,
            allowed_tools: task.allowed_tools,
            is_write: task.is_write,
            required_permission: task.required_permission || null,
            max_daily_interactions: task.max_daily_interactions
              ? Number(task.max_daily_interactions)
              : null,
            sort_order: Number(task.sort_order) || 0,
            enabled: task.enabled,
          }),
        },
      );
      return res.json();
    },
    onSuccess: () => {
      invalidate("/api/modern-agent/tasks");
      setEditing(null);
      toast({ title: "تم حفظ المهمة" });
    },
    onError: (e: any) =>
      toast({ title: "خطأ", description: e?.message, variant: "destructive" }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/modern-agent/tasks/${id}`, { method: "DELETE" });
    },
    onSuccess: () => invalidate("/api/modern-agent/tasks"),
  });

  const toggleTool = (name: string) => {
    if (!editing) return;
    const list = editing.allowed_tools || [];
    setEditing({
      ...editing,
      allowed_tools: list.includes(name)
        ? list.filter((x) => x !== name)
        : [...list, name],
    });
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setEditing({ ...EMPTY_TASK })}
        className="gap-2"
        data-testid="button-add-task"
      >
        <Plus className="h-4 w-4" /> مهمة جديدة
      </Button>

      {editing && (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>المعرّف (task_key)</Label>
              <Input
                value={editing.task_key || ""}
                onChange={(e) =>
                  setEditing({ ...editing, task_key: e.target.value })
                }
                disabled={!!editing.id}
                data-testid="input-task-key"
              />
            </div>
            <div>
              <Label>اللغة</Label>
              <Select
                value={editing.language || "auto"}
                onValueChange={(v) => setEditing({ ...editing, language: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">تلقائي</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الاسم بالعربية</Label>
              <Input
                value={editing.name_ar || ""}
                onChange={(e) =>
                  setEditing({ ...editing, name_ar: e.target.value })
                }
                data-testid="input-task-name-ar"
              />
            </div>
            <div>
              <Label>الاسم بالإنجليزية</Label>
              <Input
                value={editing.name_en || ""}
                onChange={(e) =>
                  setEditing({ ...editing, name_en: e.target.value })
                }
                data-testid="input-task-name-en"
              />
            </div>
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea
              rows={2}
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label>إرشادات الرد</Label>
            <Textarea
              rows={2}
              value={editing.response_guidance || ""}
              onChange={(e) =>
                setEditing({ ...editing, response_guidance: e.target.value })
              }
            />
          </div>
          <div>
            <Label>الأدوات المتاحة</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {tools.map((tool) => (
                <label
                  key={tool.name}
                  className="flex items-center gap-2 text-sm border rounded-md p-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(editing.allowed_tools || []).includes(tool.name)}
                    onChange={() => toggleTool(tool.name)}
                    data-testid={`tool-${tool.name}`}
                  />
                  <span className="flex-1">{tool.name}</span>
                  <Badge variant={tool.kind === "write" ? "destructive" : "secondary"}>
                    {tool.kind === "write" ? "كتابة" : "قراءة"}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>صلاحية مطلوبة</Label>
              <Input
                value={editing.required_permission || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    required_permission: e.target.value || null,
                  })
                }
                placeholder="مثال: manage_customers"
                data-testid="input-task-permission"
              />
            </div>
            <div>
              <Label>الحد اليومي</Label>
              <Input
                type="number"
                value={editing.max_daily_interactions ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    max_daily_interactions: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                data-testid="input-task-limit"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={editing.enabled ?? true}
                onCheckedChange={(v) => setEditing({ ...editing, enabled: v })}
                data-testid="switch-task-enabled"
              />
              <Label>مفعّلة</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => saveTask.mutate(editing)}
              disabled={saveTask.isPending}
              data-testid="button-save-task"
            >
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              إلغاء
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className="p-4 flex items-center gap-3"
            data-testid={`task-${task.task_key}`}
          >
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {task.name_ar}
                <span className="text-xs text-muted-foreground">
                  ({task.task_key})
                </span>
                {!task.enabled && <Badge variant="outline">معطّلة</Badge>}
                {task.is_write && <Badge variant="destructive">كتابة</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">
                {task.description}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                الأدوات: {task.allowed_tools.length} ·{" "}
                {task.required_permission || "بدون صلاحية"} ·{" "}
                {task.max_daily_interactions
                  ? `حد ${task.max_daily_interactions}/يوم`
                  : "بلا حد"}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(task)}
              data-testid={`edit-task-${task.task_key}`}
            >
              تعديل
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTask.mutate(task.id)}
              data-testid={`delete-task-${task.task_key}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

const EMPTY_KNOWLEDGE: Partial<KnowledgeEntry> = {
  title: "",
  content: "",
  category: "general",
  is_private: false,
  enabled: true,
};

function KnowledgeManager() {
  const { toast } = useToast();
  const { data: entries = [] } = useQuery<KnowledgeEntry[]>({
    queryKey: ["/api/modern-agent/knowledge"],
  });
  const [editing, setEditing] = useState<Partial<KnowledgeEntry> | null>(null);

  const save = useMutation({
    mutationFn: async (entry: Partial<KnowledgeEntry>) => {
      const isNew = !entry.id;
      const res = await apiRequest(
        isNew
          ? "/api/modern-agent/knowledge"
          : `/api/modern-agent/knowledge/${entry.id}`,
        {
          method: isNew ? "POST" : "PUT",
          body: JSON.stringify({
            title: entry.title,
            content: entry.content,
            category: entry.category,
            is_private: entry.is_private,
            enabled: entry.enabled,
          }),
        },
      );
      return res.json();
    },
    onSuccess: () => {
      invalidate("/api/modern-agent/knowledge");
      setEditing(null);
      toast({ title: "تم حفظ المعرفة" });
    },
    onError: (e: any) =>
      toast({ title: "خطأ", description: e?.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/modern-agent/knowledge/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => invalidate("/api/modern-agent/knowledge"),
  });

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setEditing({ ...EMPTY_KNOWLEDGE })}
        className="gap-2"
        data-testid="button-add-knowledge"
      >
        <Plus className="h-4 w-4" /> إضافة معرفة
      </Button>

      {editing && (
        <Card className="p-6 space-y-4">
          <div>
            <Label>العنوان</Label>
            <Input
              value={editing.title || ""}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              data-testid="input-knowledge-title"
            />
          </div>
          <div>
            <Label>المحتوى</Label>
            <Textarea
              rows={6}
              value={editing.content || ""}
              onChange={(e) =>
                setEditing({ ...editing, content: e.target.value })
              }
              data-testid="input-knowledge-content"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>التصنيف</Label>
              <Select
                value={editing.category || "general"}
                onValueChange={(v) => setEditing({ ...editing, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">عام</SelectItem>
                  <SelectItem value="factory_concept">مفهوم مصنعي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={editing.is_private ?? false}
                onCheckedChange={(v) =>
                  setEditing({ ...editing, is_private: v })
                }
                data-testid="switch-knowledge-private"
              />
              <Label>خاص (سري)</Label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={editing.enabled ?? true}
                onCheckedChange={(v) => setEditing({ ...editing, enabled: v })}
              />
              <Label>مفعّل</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => save.mutate(editing)}
              disabled={save.isPending}
              data-testid="button-save-knowledge"
            >
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              إلغاء
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className="p-4 flex items-center gap-3"
            data-testid={`knowledge-${entry.id}`}
          >
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {entry.is_private ? (
                  <Lock className="h-4 w-4 text-amber-600" />
                ) : (
                  <Globe className="h-4 w-4 text-emerald-600" />
                )}
                {entry.title}
                {entry.category === "factory_concept" && (
                  <Badge variant="secondary">مفهوم مصنعي</Badge>
                )}
                {!entry.enabled && <Badge variant="outline">معطّل</Badge>}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {entry.content}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(entry)}
              data-testid={`edit-knowledge-${entry.id}`}
            >
              تعديل
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => del.mutate(entry.id)}
              data-testid={`delete-knowledge-${entry.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface UserLite {
  id: number;
  username: string;
  display_name: string | null;
  display_name_ar: string | null;
}
interface RoleLite {
  id: number;
  name: string;
}
interface AccessEntry {
  id: number;
  user_id: number | null;
  role_id: number | null;
  enabled: boolean;
}

function AccessManager() {
  const { toast } = useToast();
  const { data: access = [] } = useQuery<AccessEntry[]>({
    queryKey: ["/api/modern-agent/access"],
  });
  const { data: users = [] } = useQuery<UserLite[]>({
    queryKey: ["/api/users"],
  });
  const { data: roles = [] } = useQuery<RoleLite[]>({
    queryKey: ["/api/modern-agent/roles"],
  });
  const [mode, setMode] = useState<"user" | "role">("user");
  const [selected, setSelected] = useState<string>("");

  const add = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      await apiRequest("/api/modern-agent/access", {
        method: "POST",
        body: JSON.stringify(
          mode === "user"
            ? { user_id: Number(selected) }
            : { role_id: Number(selected) },
        ),
      });
    },
    onSuccess: () => {
      setSelected("");
      invalidate("/api/modern-agent/access");
      toast({ title: "تمت الإضافة إلى قائمة المسموح لهم" });
    },
    onError: () => toast({ title: "فشل الحفظ", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: async (id: number) =>
      apiRequest(`/api/modern-agent/access/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidate("/api/modern-agent/access"),
  });

  const userName = (id: number) => {
    const u = users.find((x) => x.id === id);
    return u ? u.display_name_ar || u.display_name || u.username : `#${id}`;
  };
  const roleName = (id: number) => roles.find((x) => x.id === id)?.name || `#${id}`;

  return (
    <div className="space-y-4" dir="rtl">
      <p className="text-sm text-muted-foreground">
        إذا كانت القائمة فارغة، يمكن لكل من يملك صلاحية استخدام الوكيل الوصول
        إليه. عند إضافة مستخدمين أو أدوار، يقتصر الوصول عليهم فقط.
      </p>
      <Card className="p-4 flex flex-wrap items-end gap-3">
        <div>
          <Label>النوع</Label>
          <Select value={mode} onValueChange={(v) => { setMode(v as "user" | "role"); setSelected(""); }}>
            <SelectTrigger className="w-32" data-testid="select-access-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">مستخدم</SelectItem>
              <SelectItem value="role">دور</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-48">
          <Label>{mode === "user" ? "المستخدم" : "الدور"}</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger data-testid="select-access-target">
              <SelectValue placeholder="اختر..." />
            </SelectTrigger>
            <SelectContent>
              {mode === "user"
                ? users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.display_name_ar || u.display_name || u.username}
                    </SelectItem>
                  ))
                : roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => add.mutate()}
          disabled={!selected || add.isPending}
          data-testid="button-add-access"
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة
        </Button>
      </Card>
      <div className="space-y-2">
        {access.length === 0 && (
          <p className="text-sm text-muted-foreground">
            القائمة فارغة — الوصول مفتوح لكل من يملك الصلاحية.
          </p>
        )}
        {access.map((a) => (
          <Card
            key={a.id}
            className="p-3 flex items-center justify-between"
            data-testid={`access-${a.id}`}
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {a.user_id ? "مستخدم" : "دور"}
              </Badge>
              <span>
                {a.user_id ? userName(a.user_id) : roleName(a.role_id!)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => del.mutate(a.id)}
              data-testid={`delete-access-${a.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ProfileRow {
  user_id: number;
  username: string;
  user_display_name: string | null;
  user_display_name_ar: string | null;
  profile_id: number | null;
  display_name: string | null;
  notes: string | null;
}

function ProfilesManager() {
  const { toast } = useToast();
  const { data: profiles = [] } = useQuery<ProfileRow[]>({
    queryKey: ["/api/modern-agent/profiles"],
  });
  const [drafts, setDrafts] = useState<
    Record<number, { display_name: string; notes: string }>
  >({});

  const save = useMutation({
    mutationFn: async (userId: number) => {
      const d = drafts[userId];
      await apiRequest(`/api/modern-agent/profiles/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          display_name: d?.display_name ?? null,
          notes: d?.notes ?? null,
        }),
      });
    },
    onSuccess: () => {
      invalidate("/api/modern-agent/profiles");
      toast({ title: "تم حفظ الملف الشخصي" });
    },
    onError: () => toast({ title: "فشل الحفظ", variant: "destructive" }),
  });

  const valueFor = (p: ProfileRow, field: "display_name" | "notes") =>
    drafts[p.user_id]?.[field] ?? (p[field] || "");

  const setField = (
    userId: number,
    field: "display_name" | "notes",
    value: string,
  ) =>
    setDrafts((prev) => ({
      ...prev,
      [userId]: {
        display_name:
          field === "display_name"
            ? value
            : prev[userId]?.display_name ??
              profiles.find((x) => x.user_id === userId)?.display_name ??
              "",
        notes:
          field === "notes"
            ? value
            : prev[userId]?.notes ??
              profiles.find((x) => x.user_id === userId)?.notes ??
              "",
      },
    }));

  return (
    <div className="space-y-3" dir="rtl">
      <p className="text-sm text-muted-foreground">
        اضبط كيف يخاطب الوكيل كل مستخدم (الاسم المعروض) وأي ملاحظات توجيهية
        خاصة به.
      </p>
      {profiles.map((p) => (
        <Card key={p.user_id} className="p-4 space-y-3" data-testid={`profile-${p.user_id}`}>
          <div className="font-medium">
            {p.user_display_name_ar || p.user_display_name || p.username}{" "}
            <span className="text-xs text-muted-foreground">
              ({p.username})
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>الاسم المعروض للوكيل</Label>
              <Input
                value={valueFor(p, "display_name")}
                onChange={(e) =>
                  setField(p.user_id, "display_name", e.target.value)
                }
                data-testid={`input-profile-name-${p.user_id}`}
              />
            </div>
            <div>
              <Label>ملاحظات توجيهية</Label>
              <Input
                value={valueFor(p, "notes")}
                onChange={(e) => setField(p.user_id, "notes", e.target.value)}
                data-testid={`input-profile-notes-${p.user_id}`}
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => save.mutate(p.user_id)}
            disabled={save.isPending}
            data-testid={`button-save-profile-${p.user_id}`}
          >
            <Save className="h-4 w-4 ml-1" /> حفظ
          </Button>
        </Card>
      ))}
    </div>
  );
}
