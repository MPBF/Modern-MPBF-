export type SystemUser = {
  id: number;
  username: string;
  display_name?: string | null;
  display_name_ar?: string | null;
  role_id?: number | null;
  status?: string | null;
  settings: Record<string, any>;
};

export type KnowledgeItem = {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  is_published?: boolean;
  system_user_id?: number | null;
  item_type?: "knowledge" | "instruction" | "command";
  priority?: number;
};

export type ActivityEvent = {
  id: number;
  actor?: string | null;
  actor_name?: string | null;
  action: string;
  details?: Record<string, any>;
  created_at: string;
};

export const WEEKDAYS = [
  ["0", "الأحد"], ["1", "الاثنين"], ["2", "الثلاثاء"], ["3", "الأربعاء"],
  ["4", "الخميس"], ["5", "الجمعة"], ["6", "السبت"],
] as const;

export const SOURCES = [
  ["customers", "العملاء", "ملفات العملاء النشطة"],
  ["products", "منتجات العملاء", "المواد والمقاسات والحالات"],
  ["orders", "الطلبات", "حالة الطلبات ومواعيد التسليم"],
  ["production", "الإنتاج", "أوامر الإنتاج وحالة الآلات"],
  ["attendance", "الحضور", "سجلات الحضور والانصراف"],
  ["messages", "المراسلات", "الرسائل الداخلية ذات الصلة"],
  ["reports", "الملخصات", "إجماليات تشغيلية مشتقة"],
] as const;

export const ADVANCED_TABLES = [
  ["customers", "العملاء"], ["customer_products", "منتجات العملاء"],
  ["orders", "الطلبات"], ["production_orders", "أوامر الإنتاج"],
  ["machines", "الآلات"], ["attendance", "الحضور"], ["internal_messages", "المراسلات"],
] as const;