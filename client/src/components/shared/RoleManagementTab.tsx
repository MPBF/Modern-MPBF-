import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Home,
  FileText,
  Activity,
  ClipboardCheck,
  Wrench,
  Warehouse,
  Users,
  BarChart3,
  Monitor,
  Database,
  Box,
  Tv,
  Plug,
  Bot,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  PERMISSIONS,
  PERMISSION_TREE,
  ROLE_PRESETS,
  collectTreeKeys,
  getNodeSelectionState,
  getPermission,
  isGuardedPermission,
  type PermissionTreeNode,
  type RolePreset,
} from "../../../../shared/permissions";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { userHasPermission } from "../../utils/roleUtils";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const MODULE_ICONS: Record<string, LucideIcon> = {
  Home,
  FileText,
  Activity,
  ClipboardCheck,
  Wrench,
  Warehouse,
  Users,
  BarChart3,
  Monitor,
  Database,
  Box,
  Tv,
  Plug,
  Bot,
  Settings,
  Shield,
};

interface RoleData {
  id: number;
  name: string;
  name_ar: string;
  permissions: string[];
}

export default function RoleManagementTab() {
  const { i18n } = useTranslation();
  const isAr = i18n.language !== "en";
  // Local bilingual helper (Arabic-first), avoids touching locale files for
  // the newly added tree-editor strings.
  const L = (ar: string, en: string) => (isAr ? ar : en);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canAddRoles = userHasPermission(user, "manage_roles");
  const canEditRoles = userHasPermission(user, "manage_roles");
  const canDeleteRoles = userHasPermission(user, "manage_roles");

  const [newRole, setNewRole] = useState({
    name: "",
    name_ar: "",
    permissions: [] as string[],
  });

  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [viewingRole, setViewingRole] = useState<RoleData | null>(null);

  const allPermissionKeys = useMemo(() => PERMISSIONS.map((p) => p.id), []);

  // Fetch roles
  const { data: roles = [], isLoading } = useQuery<RoleData[]>({
    queryKey: ["/api/roles"],
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: typeof newRole) => {
      return await apiRequest("/api/roles", {
        method: "POST",
        body: JSON.stringify(roleData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setNewRole({ name: "", name_ar: "", permissions: [] });
      toast({
        title: L("تم إنشاء الدور", "Role created"),
        description: L(
          "تم إنشاء الدور الجديد بنجاح",
          "The new role was created successfully",
        ),
      });
    },
    onError: () => {
      toast({
        title: L("خطأ في الإنشاء", "Creation error"),
        description: L(
          "تعذّر إنشاء الدور، حاول مرة أخرى",
          "Could not create the role, please try again",
        ),
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, roleData }: { id: number; roleData: RoleData }) => {
      return await apiRequest(`/api/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(roleData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setEditingRole(null);
      toast({
        title: L("تم الحفظ", "Saved"),
        description: L(
          "تم تحديث صلاحيات الدور بنجاح",
          "Role permissions updated successfully",
        ),
      });
    },
    onError: () => {
      toast({
        title: L("خطأ في الحفظ", "Save error"),
        description: L(
          "تعذّر تحديث الدور، حاول مرة أخرى",
          "Could not update the role, please try again",
        ),
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/roles/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: L("تم الحذف", "Deleted"),
        description: L("تم حذف الدور بنجاح", "Role deleted successfully"),
      });
    },
    onError: () => {
      toast({
        title: L("خطأ في الحذف", "Delete error"),
        description: L("تعذّر حذف الدور", "Could not delete the role"),
        variant: "destructive",
      });
    },
  });

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.name_ar) {
      toast({
        title: L("بيانات ناقصة", "Missing data"),
        description: L(
          "يرجى إدخال اسم الدور بالعربية والإنجليزية",
          "Please enter the role name in both Arabic and English",
        ),
        variant: "destructive",
      });
      return;
    }
    createRoleMutation.mutate(newRole);
  };

  const handleUpdateRole = () => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, roleData: editingRole });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {L("جاري تحميل الأدوار...", "Loading roles...")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label={L("إجمالي الأدوار", "Total Roles")}
          value={roles.length}
        />
        <StatCard
          label={L("إجمالي الصلاحيات", "Total Permissions")}
          value={PERMISSIONS.length}
        />
        <StatCard
          label={L("وحدات النظام", "System Modules")}
          value={PERMISSION_TREE.length}
        />
      </div>

      {/* Add New Role Section */}
      {canAddRoles && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {L("إضافة دور جديد", "Add New Role")}
            </CardTitle>
            <CardDescription>
              {L(
                "أنشئ دورًا وحدد صلاحياته من الشجرة أدناه",
                "Create a role and choose its permissions from the tree below",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">
                  {L("اسم الدور (إنجليزي)", "Role Name (English)")}
                </Label>
                <Input
                  id="roleName"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  placeholder={L("مثال: Sales", "e.g. Sales")}
                  data-testid="input-role-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleNameAr">
                  {L("اسم الدور (عربي)", "Role Name (Arabic)")}
                </Label>
                <Input
                  id="roleNameAr"
                  value={newRole.name_ar}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name_ar: e.target.value })
                  }
                  placeholder={L("مثال: مبيعات", "e.g. Sales")}
                  data-testid="input-role-name-ar"
                />
              </div>
            </div>

            <PermissionTreeEditor
              selected={newRole.permissions}
              onChange={(permissions) => setNewRole({ ...newRole, permissions })}
              allPermissionKeys={allPermissionKeys}
              isAr={isAr}
              L={L}
              idPrefix="new"
            />

            <div className="flex justify-end">
              <Button
                onClick={handleCreateRole}
                disabled={createRoleMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-create-role"
              >
                {createRoleMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {L("جاري الإضافة...", "Adding...")}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {L("إضافة الدور", "Add Role")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {L("الأدوار الحالية", "Existing Roles")}
          </CardTitle>
          <CardDescription>
            {L(
              "إدارة الأدوار الموجودة وصلاحياتها",
              "Manage existing roles and their permissions",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{L("الرقم", "ID")}</TableHead>
                <TableHead>{L("الاسم (إنجليزي)", "Name (EN)")}</TableHead>
                <TableHead>{L("الاسم (عربي)", "Name (AR)")}</TableHead>
                <TableHead>{L("الصلاحيات", "Permissions")}</TableHead>
                <TableHead>{L("الإجراءات", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} data-testid={`row-role-${role.id}`}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{role.name_ar}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {role.permissions?.includes("admin")
                          ? L("الكل", "All")
                          : role.permissions?.length || 0}{" "}
                        {L("صلاحية", "perms")}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingRole(role)}
                            className="h-8 px-2 text-xs"
                            data-testid={`button-view-permissions-${role.id}`}
                          >
                            {L("عرض التفاصيل", "View details")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {L("صلاحيات الدور", "Role permissions")}:{" "}
                              {viewingRole?.name_ar}
                            </DialogTitle>
                            <DialogDescription>
                              {viewingRole?.permissions?.includes("admin")
                                ? L(
                                    "هذا الدور يملك صلاحية المدير الكاملة",
                                    "This role has full administrator access",
                                  )
                                : `${viewingRole?.permissions?.length || 0} ${L(
                                    "صلاحية مفعّلة",
                                    "permissions enabled",
                                  )}`}
                            </DialogDescription>
                          </DialogHeader>
                          {viewingRole && (
                            <RolePermissionSummary
                              permissions={viewingRole.permissions || []}
                              isAr={isAr}
                              L={L}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canEditRoles && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditingRole({
                              ...role,
                              permissions: [...(role.permissions || [])],
                            })
                          }
                          className="flex items-center gap-1"
                          data-testid={`button-edit-role-${role.id}`}
                        >
                          <Edit className="w-3 h-3" />
                          {L("تعديل", "Edit")}
                        </Button>
                      )}
                      {canDeleteRoles && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (
                              confirm(
                                `${L("هل تريد حذف الدور", "Delete role")} "${role.name_ar}"؟`,
                              )
                            ) {
                              deleteRoleMutation.mutate(role.id);
                            }
                          }}
                          disabled={deleteRoleMutation.isPending}
                          className="flex items-center gap-1"
                          data-testid={`button-delete-role-${role.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                          {L("حذف", "Delete")}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {roles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {L("لا توجد أدوار بعد", "No roles yet")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      {editingRole && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {L("تعديل الدور", "Edit Role")}: {editingRole.name_ar}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingRole(null)}
                data-testid="button-cancel-edit"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {L(
                "عدّل بيانات الدور وصلاحياته",
                "Edit the role details and permissions",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editRoleName">
                  {L("اسم الدور (إنجليزي)", "Role Name (English)")}
                </Label>
                <Input
                  id="editRoleName"
                  value={editingRole.name}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, name: e.target.value })
                  }
                  data-testid="input-edit-role-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoleNameAr">
                  {L("اسم الدور (عربي)", "Role Name (Arabic)")}
                </Label>
                <Input
                  id="editRoleNameAr"
                  value={editingRole.name_ar}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, name_ar: e.target.value })
                  }
                  data-testid="input-edit-role-name-ar"
                />
              </div>
            </div>

            <PermissionTreeEditor
              selected={editingRole.permissions || []}
              onChange={(permissions) =>
                setEditingRole({ ...editingRole, permissions })
              }
              allPermissionKeys={allPermissionKeys}
              isAr={isAr}
              L={L}
              idPrefix="edit"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingRole(null)}
                data-testid="button-cancel-edit-bottom"
              >
                {L("إلغاء", "Cancel")}
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={updateRoleMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-save-role"
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {L("جاري الحفظ...", "Saving...")}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {L("حفظ التغييرات", "Save Changes")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

type Localizer = (ar: string, en: string) => string;

interface PermissionTreeEditorProps {
  selected: string[];
  onChange: (next: string[]) => void;
  allPermissionKeys: string[];
  isAr: boolean;
  L: Localizer;
  idPrefix: string;
}

function PermissionTreeEditor({
  selected,
  onChange,
  allPermissionKeys,
  isAr,
  L,
  idPrefix,
}: PermissionTreeEditorProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const query = search.trim().toLowerCase();

  const matches = (text: string) => text.toLowerCase().includes(query);
  const keyMatches = (key: string) => {
    if (matches(key)) return true;
    const p = getPermission(key as never);
    return !!p && (matches(p.name) || matches(p.name_ar));
  };

  const toggleKeys = (keys: string[], checked: boolean) => {
    const set = new Set(selected);
    if (checked) {
      keys.forEach((k) => set.add(k));
    } else {
      keys.forEach((k) => set.delete(k));
    }
    onChange(Array.from(set));
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selected.includes("admin")
    ? allPermissionKeys.length
    : selected.filter((p) => allPermissionKeys.includes(p)).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="flex items-center gap-2">
          {L("الصلاحيات", "Permissions")}
          <Badge variant="secondary">
            {selectedCount} / {allPermissionKeys.length}
          </Badge>
        </Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange(allPermissionKeys.filter((k) => !isGuardedPermission(k)))
            }
            data-testid={`button-select-all-${idPrefix}`}
          >
            {L("تحديد الكل", "Select all")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange([])}
            data-testid={`button-clear-all-${idPrefix}`}
          >
            {L("مسح الكل", "Clear all")}
          </Button>
        </div>
      </div>

      {/* Role presets */}
      <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {L("قوالب جاهزة", "Quick presets")}
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLE_PRESETS.map((preset: RolePreset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant="outline"
              className="h-auto py-1.5"
              title={preset.description_ar}
              onClick={() => onChange([...preset.permissions])}
              data-testid={`button-preset-${idPrefix}-${preset.id}`}
            >
              {isAr ? preset.name_ar : preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={L("ابحث عن صلاحية...", "Search permissions...")}
          className="ps-9"
          data-testid={`input-search-permissions-${idPrefix}`}
        />
      </div>

      {/* Tree */}
      <div className="rounded-lg border divide-y max-h-[480px] overflow-y-auto">
        {PERMISSION_TREE.map((node) => (
          <TreeNodeRow
            key={node.id}
            node={node}
            depth={0}
            selected={selected}
            toggleKeys={toggleKeys}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            query={query}
            keyMatches={keyMatches}
            matches={matches}
            ancestorMatched={false}
            isAr={isAr}
            idPrefix={idPrefix}
          />
        ))}
      </div>
    </div>
  );
}

interface TreeNodeRowProps {
  node: PermissionTreeNode;
  depth: number;
  selected: string[];
  toggleKeys: (keys: string[], checked: boolean) => void;
  collapsed: Set<string>;
  toggleCollapse: (id: string) => void;
  query: string;
  keyMatches: (key: string) => boolean;
  matches: (text: string) => boolean;
  ancestorMatched: boolean;
  isAr: boolean;
  idPrefix: string;
}

function TreeNodeRow({
  node,
  depth,
  selected,
  toggleKeys,
  collapsed,
  toggleCollapse,
  query,
  keyMatches,
  matches,
  ancestorMatched,
  isAr,
  idPrefix,
}: TreeNodeRowProps) {
  const nodeLabelMatched = matches(node.name) || matches(node.name_ar);
  const effectiveMatched = ancestorMatched || nodeLabelMatched;

  const ownKeys = node.keys || [];
  const visibleOwnKeys =
    query.length === 0 || effectiveMatched
      ? ownKeys
      : ownKeys.filter(keyMatches);

  const children = node.children || [];
  const visibleChildren =
    query.length === 0
      ? children
      : children.filter((c) =>
          isNodeVisible(c, query, effectiveMatched, keyMatches, matches),
        );

  // Hide node entirely if nothing inside it matches the search.
  if (
    query.length > 0 &&
    !effectiveMatched &&
    visibleOwnKeys.length === 0 &&
    visibleChildren.length === 0
  ) {
    return null;
  }

  const state = getNodeSelectionState(node, selected);
  const allKeys = collectTreeKeys(node);
  const selectedHere = allKeys.filter((k) => selected.includes(k)).length;
  const isTopLevel = depth === 0;
  const hasChildren = children.length > 0;
  const isCollapsed = query.length === 0 && collapsed.has(node.id);
  const Icon = node.icon ? MODULE_ICONS[node.icon] : undefined;

  return (
    <div className={isTopLevel ? "" : ""}>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 ${
          isTopLevel ? "bg-muted/40" : "hover:bg-muted/30"
        }`}
        style={{ paddingInlineStart: `${12 + depth * 20}px` }}
      >
        <Checkbox
          checked={
            state === "all" ? true : state === "some" ? "indeterminate" : false
          }
          onCheckedChange={(checked) => toggleKeys(allKeys, checked === true)}
          data-testid={`checkbox-node-${idPrefix}-${node.id}`}
        />
        <button
          type="button"
          onClick={() => hasChildren && toggleCollapse(node.id)}
          className="flex items-center gap-2 flex-1 text-start"
        >
          {hasChildren ? (
            isCollapsed ? (
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0 rtl:rotate-180" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            )
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
          <span className={isTopLevel ? "font-semibold" : "font-medium"}>
            {isAr ? node.name_ar : node.name}
          </span>
          <Badge
            variant={selectedHere > 0 ? "default" : "outline"}
            className="ms-auto text-[10px]"
          >
            {selectedHere} / {allKeys.length}
          </Badge>
        </button>
      </div>

      {!isCollapsed && (
        <div>
          {/* Direct leaf permissions of this node */}
          {visibleOwnKeys.length > 0 && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-1.5 py-2"
              style={{ paddingInlineStart: `${12 + (depth + 1) * 20}px` }}
            >
              {visibleOwnKeys.map((key) => {
                const perm = getPermission(key as never);
                if (!perm) return null;
                const checked = selected.includes(key);
                const guarded = isGuardedPermission(key);
                const inputId = `${idPrefix}-${key}`;
                return (
                  <div
                    key={key}
                    className={`flex items-start gap-2 pe-3 py-1.5 rounded-md hover:bg-muted/40 ${
                      guarded
                        ? "border border-amber-400/60 bg-amber-50 dark:bg-amber-950/30"
                        : ""
                    }`}
                  >
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={(c) => {
                        if (c === true && guarded) {
                          const ok = window.confirm(
                            isAr
                              ? "سيمنح هذا الخيار صلاحية المدير الكاملة (وصول غير مقيّد لكل النظام). هل أنت متأكد؟"
                              : "This grants FULL administrator access (unrestricted, system-wide). Are you sure?",
                          );
                          if (!ok) return;
                        }
                        toggleKeys([key], c === true);
                      }}
                      data-testid={`checkbox-permission-${idPrefix}-${key}`}
                    />
                    <label
                      htmlFor={inputId}
                      className="text-sm leading-tight cursor-pointer flex-1"
                    >
                      <span className="font-medium">
                        {isAr ? perm.name_ar : perm.name}
                      </span>
                      {perm.description && (
                        <span className="block text-xs text-muted-foreground">
                          {perm.description}
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-groups */}
          {visibleChildren.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              toggleKeys={toggleKeys}
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              query={query}
              keyMatches={keyMatches}
              matches={matches}
              ancestorMatched={effectiveMatched}
              isAr={isAr}
              idPrefix={idPrefix}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function isNodeVisible(
  node: PermissionTreeNode,
  query: string,
  ancestorMatched: boolean,
  keyMatches: (key: string) => boolean,
  matches: (text: string) => boolean,
): boolean {
  if (query.length === 0) return true;
  const nodeLabelMatched = matches(node.name) || matches(node.name_ar);
  const effectiveMatched = ancestorMatched || nodeLabelMatched;
  if (effectiveMatched) return true;
  if ((node.keys || []).some(keyMatches)) return true;
  return (node.children || []).some((c) =>
    isNodeVisible(c, query, effectiveMatched, keyMatches, matches),
  );
}

function RolePermissionSummary({
  permissions,
  isAr,
  L,
}: {
  permissions: string[];
  isAr: boolean;
  L: Localizer;
}) {
  if (permissions.includes("admin")) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-4">
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-medium">
          {L(
            "وصول كامل لجميع الصلاحيات (مدير النظام)",
            "Full access to all permissions (Administrator)",
          )}
        </span>
      </div>
    );
  }

  const groups = PERMISSION_TREE.map((module) => {
    const keys = collectTreeKeys(module);
    const owned = keys.filter((k) => permissions.includes(k));
    return { module, owned };
  }).filter((g) => g.owned.length > 0);

  if (groups.length === 0) {
    return (
      <div className="mt-4 text-center text-muted-foreground py-6">
        {L("لا توجد صلاحيات مفعّلة", "No permissions enabled")}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {groups.map(({ module, owned }) => (
        <div key={module.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">
              {isAr ? module.name_ar : module.name}
            </h4>
            <Badge variant="outline">{owned.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {owned.map((key) => {
              const perm = getPermission(key as never);
              if (!perm) return null;
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                >
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{isAr ? perm.name_ar : perm.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
