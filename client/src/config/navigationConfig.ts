import {
  LucideIcon,
  FileText,
  Activity,
  Users,
  Database,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  name_ar: string;
  name_en: string;
  icon: LucideIcon;
  path: string;
  priority: number;
  group: "primary" | "support" | "admin";
}

export const navigationItems: NavigationItem[] = [
  {
    name: "الطلبات",
    name_ar: "الطلبات",
    name_en: "Orders",
    icon: FileText,
    path: "/orders",
    priority: 2,
    group: "primary",
  },
  {
    name: "العملاء",
    name_ar: "العملاء",
    name_en: "Customers",
    icon: Users,
    path: "/customers",
    priority: 2.5,
    group: "primary",
  },
  {
    name: "لوحة الإنتاج",
    name_ar: "لوحة الإنتاج",
    name_en: "Pro. Board",
    icon: Activity,
    path: "/production-dashboard",
    priority: 3,
    group: "primary",
  },
  {
    name: "التعريفات",
    name_ar: "التعريفات",
    name_en: "Definitions",
    icon: Database,
    path: "/definitions",
    priority: 10,
    group: "admin",
  },
];

export const getLocalizedName = (
  item: NavigationItem,
  language: "ar" | "en",
): string => {
  return language === "en" ? item.name_en : item.name_ar;
};

export const getQuickAccessItems = (
  items: NavigationItem[],
): NavigationItem[] => {
  return items
    .filter((item) => item.priority <= 4)
    .sort((a, b) => a.priority - b.priority);
};

export const groupNavigationItems = (items: NavigationItem[]) => {
  return {
    primary: items
      .filter((item) => item.group === "primary")
      .sort((a, b) => a.priority - b.priority),
    support: items
      .filter((item) => item.group === "support")
      .sort((a, b) => a.priority - b.priority),
    admin: items
      .filter((item) => item.group === "admin")
      .sort((a, b) => a.priority - b.priority),
  };
};
