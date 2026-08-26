import {
  Wrench,
  CheckCircle,
  Calendar,
  FileText,
  AlertCircle,
  Users,
  Cog,
  Boxes,
  ShieldCheck,
  Bot,
  ClipboardList,
} from "lucide-react";

import type { PermissionKey } from "../../../../shared/permissions";

export interface MaintenanceSubTab {
  id: string;
  labelKey: string;
  icon: typeof Wrench;
  permissions: PermissionKey[];
}

export interface MaintenanceGroup {
  id: string;
  labelKey: string;
  icon: typeof Wrench;
  subTabs: MaintenanceSubTab[];
}

// The maintenance module is organized into 4 top-level groups, each holding a
// set of sub-tabs. A group is shown only when the user can see at least one of
// its sub-tabs. Per-sub-tab permission sets are preserved exactly as before.
export const MAINTENANCE_GROUPS: MaintenanceGroup[] = [
  {
    id: "corrective",
    labelKey: "maintenance.groups.corrective",
    icon: ClipboardList,
    subTabs: [
      {
        id: "requests",
        labelKey: "maintenance.tabs.requests",
        icon: Wrench,
        permissions: [
          "view_maintenance_requests",
          "view_maintenance",
          "manage_maintenance",
        ],
      },
      {
        id: "actions",
        labelKey: "maintenance.tabs.actions",
        icon: CheckCircle,
        permissions: ["manage_maintenance_actions", "manage_maintenance"],
      },
      {
        id: "reports",
        labelKey: "maintenance.tabs.reports",
        icon: FileText,
        permissions: [
          "view_maintenance_reports",
          "view_maintenance",
          "manage_maintenance",
        ],
      },
      {
        id: "negligence",
        labelKey: "maintenance.tabs.negligence",
        icon: AlertCircle,
        permissions: ["manage_negligence", "manage_maintenance"],
      },
    ],
  },
  {
    id: "inventory",
    labelKey: "maintenance.groups.inventory",
    icon: Boxes,
    subTabs: [
      {
        id: "spare-parts",
        labelKey: "maintenance.tabs.spareParts",
        icon: Users,
        permissions: ["manage_spare_parts", "manage_maintenance"],
      },
      {
        id: "consumable-parts",
        labelKey: "maintenance.tabs.consumableParts",
        icon: Wrench,
        permissions: ["manage_consumable_parts", "manage_maintenance"],
      },
      {
        id: "component-catalog",
        labelKey: "maintenance.componentCatalog.tab",
        icon: Cog,
        permissions: ["manage_maintenance"],
      },
    ],
  },
  {
    id: "preventive",
    labelKey: "maintenance.groups.preventive",
    icon: ShieldCheck,
    subTabs: [
      {
        id: "preventive-actions",
        labelKey: "maintenance.preventiveActions.tab",
        icon: Calendar,
        permissions: ["view_maintenance", "manage_maintenance"],
      },
    ],
  },
  {
    id: "periodic",
    labelKey: "maintenance.groups.periodic",
    icon: Calendar,
    subTabs: [
      {
        id: "periodic-maintenance",
        labelKey: "maintenance.scheduleTab",
        icon: Calendar,
        permissions: [
          "view_maintenance",
          "add_maintenance",
          "manage_maintenance_actions",
          "manage_maintenance",
        ],
      },
    ],
  },
  {
    id: "smart-engineer",
    labelKey: "maintenance.groups.smartEngineer",
    icon: Bot,
    subTabs: [
      {
        id: "smart-engineer",
        labelKey: "maintenanceEngineer.title",
        icon: Cog,
        permissions: ["view_maintenance", "manage_maintenance"],
      },
    ],
  },
];
