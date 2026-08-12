/**
 * Central Permissions Registry
 * نظام الصلاحيات المركزي
 *
 * This file defines all permissions and their mappings to UI elements
 * هذا الملف يعرّف جميع الصلاحيات وربطها بعناصر الواجهة
 */

export type PermissionKey =
  | "view_home"
  | "view_dashboard"
  | "view_user_dashboard"
  | "manage_orders"
  | "update_order_status"
  | "manage_production"
  | "manage_maintenance"
  | "manage_quality"
  | "manage_inventory"
  | "manage_warehouse"
  | "manage_users"
  | "manage_hr"
  | "view_reports"
  | "manage_settings"
  | "manage_definitions"
  | "manage_roles"
  | "view_production"
  | "view_hr"
  | "view_quality"
  | "view_maintenance"
  | "view_inventory"
  | "view_warehouse"
  | "view_notifications"
  | "view_alerts"
  | "manage_alerts"
  | "view_system_health"
  | "manage_analytics"
  | "view_production_monitoring"
  | "manage_whatsapp"
  | "view_film_dashboard"
  | "view_printing_dashboard"
  | "view_cutting_dashboard"
  | "view_today_production"
  | "view_mixing"
  | "manage_mixing"
  | "view_system_monitoring"
  | "view_tools"
  | "view_production_reports"
  | "view_orders"
  | "view_attendance"
  | "manage_attendance"
  | "view_attendance_reports"
  | "manage_leaves"
  | "view_training"
  | "manage_training"
  | "record_work_violations"
  | "view_work_violations"
  | "manage_work_violations"
  | "view_factory_simulation"
  | "manage_factory_simulation"
  | "create_quality_inspections"
  | "view_quality_reports"
  | "manage_quality_settings"
  | "view_maintenance_requests"
  | "create_maintenance_requests"
  | "manage_maintenance_actions"
  | "view_maintenance_reports"
  | "manage_negligence"
  | "manage_spare_parts"
  | "manage_consumable_parts"
  | "view_financial_reports"
  | "view_hr_reports"
  | "view_quality_control_reports"
  | "view_maintenance_stats_reports"
  | "manage_customers"
  | "manage_items"
  | "manage_machines"
  | "manage_sections"
  | "manage_categories"
  | "manage_master_batch"
  | "add_customers"
  | "edit_customers"
  | "delete_customers"
  | "add_sections"
  | "edit_sections"
  | "delete_sections"
  | "add_categories"
  | "edit_categories"
  | "delete_categories"
  | "add_items"
  | "edit_items"
  | "delete_items"
  | "add_customer_products"
  | "edit_customer_products"
  | "delete_customer_products"
  | "add_machines"
  | "edit_machines"
  | "delete_machines"
  | "add_users"
  | "edit_users"
  | "delete_users"
  | "add_master_batch"
  | "edit_master_batch"
  | "delete_master_batch"
  | "add_warehouse"
  | "edit_warehouse"
  | "delete_warehouse"
  | "add_hr"
  | "edit_hr"
  | "delete_hr"
  | "add_maintenance"
  | "edit_maintenance"
  | "delete_maintenance"
  | "add_production"
  | "edit_production"
  | "delete_production"
  | "add_quality"
  | "edit_quality"
  | "delete_quality"
  | "add_settings"
  | "edit_settings"
  | "delete_settings"
  | "view_warehouse_vouchers"
  | "manage_warehouse_vouchers"
  | "view_warehouse_reports"
  | "manage_production_hall"
  | "view_display_screen"
  | "manage_display_screen"
  | "view_my_orders"
  | "view_bag_configurator"
  | "view_mcp_settings"
  | "view_system_monitoring_tab"
  | "view_legacy_database"
  | "manage_legacy_database"
  | "use_modern_agent"
  | "manage_modern_agent"
  | "admin"; // Super admin permission

export interface Permission {
  id: PermissionKey;
  name: string;
  name_ar: string;
  category: string;
  description?: string;
}

// Define all available permissions
export const PERMISSIONS: Permission[] = [
  // General
  {
    id: "view_home",
    name: "View Home Page",
    name_ar: "عرض الصفحة الرئيسية",
    category: "عام",
    description: "Access to home page",
  },
  {
    id: "view_dashboard",
    name: "View Dashboard",
    name_ar: "عرض لوحة التحكم",
    category: "عام",
    description: "Access to main dashboard and statistics",
  },
  {
    id: "view_user_dashboard",
    name: "View User Dashboard",
    name_ar: "عرض لوحة تحكم المستخدم",
    category: "عام",
    description: "Access to personal user dashboard",
  },
  {
    id: "view_notifications",
    name: "View Notifications",
    name_ar: "عرض الإشعارات",
    category: "عام",
    description: "View system notifications",
  },

  // Orders
  {
    id: "manage_orders",
    name: "Manage Orders",
    name_ar: "إدارة الطلبات",
    category: "الطلبات",
    description: "Create, edit, delete orders",
  },
  {
    id: "update_order_status",
    name: "Update Order Status",
    name_ar: "تحديث حالة الطلب",
    category: "الطلبات",
    description:
      "Change order status (waiting, in_production, paused, completed, cancelled)",
  },

  // Production
  {
    id: "view_production",
    name: "View Production",
    name_ar: "عرض الإنتاج",
    category: "الإنتاج",
    description: "View production data and queues",
  },
  {
    id: "manage_production",
    name: "Manage Production",
    name_ar: "إدارة الإنتاج",
    category: "الإنتاج",
    description: "Create and manage production orders",
  },
  {
    id: "view_film_dashboard",
    name: "View Film Operator Dashboard",
    name_ar: "عرض لوحة عامل الفيلم",
    category: "الإنتاج",
    description: "Access to film production operator dashboard",
  },
  {
    id: "view_printing_dashboard",
    name: "View Printing Operator Dashboard",
    name_ar: "عرض لوحة عامل الطباعة",
    category: "الإنتاج",
    description: "Access to printing operator dashboard",
  },
  {
    id: "view_cutting_dashboard",
    name: "View Cutting Operator Dashboard",
    name_ar: "عرض لوحة عامل التقطيع",
    category: "الإنتاج",
    description: "Access to cutting operator dashboard",
  },
  {
    id: "view_today_production",
    name: "View Today's Production",
    name_ar: "عرض إنتاج اليوم",
    category: "الإنتاج",
    description:
      "Access to the Today's Production tab (own rolls for operators, all rolls grouped by employee for management)",
  },

  // Maintenance
  {
    id: "view_maintenance",
    name: "View Maintenance",
    name_ar: "عرض الصيانة",
    category: "الصيانة",
    description: "View maintenance reports",
  },
  {
    id: "manage_maintenance",
    name: "Manage Maintenance",
    name_ar: "إدارة الصيانة",
    category: "الصيانة",
    description: "Create and manage maintenance requests",
  },
  {
    id: "view_maintenance_requests",
    name: "View Maintenance Requests",
    name_ar: "عرض طلبات الصيانة",
    category: "الصيانة",
    description: "View maintenance request list",
  },
  {
    id: "create_maintenance_requests",
    name: "Create Maintenance Requests",
    name_ar: "إنشاء طلبات الصيانة",
    category: "الصيانة",
    description: "Submit new maintenance requests",
  },
  {
    id: "manage_maintenance_actions",
    name: "Manage Maintenance Actions",
    name_ar: "إدارة إجراءات الصيانة",
    category: "الصيانة",
    description: "Manage corrective and preventive maintenance actions",
  },
  {
    id: "view_maintenance_reports",
    name: "View Maintenance Reports",
    name_ar: "عرض تقارير الصيانة",
    category: "الصيانة",
    description: "View maintenance statistics and reports",
  },
  {
    id: "manage_negligence",
    name: "Manage Negligence Records",
    name_ar: "إدارة سجلات الإهمال",
    category: "الصيانة",
    description: "Record and manage operator negligence reports",
  },
  {
    id: "manage_spare_parts",
    name: "Manage Spare Parts",
    name_ar: "إدارة قطع الغيار",
    category: "الصيانة",
    description: "Manage spare parts inventory and requests",
  },
  {
    id: "manage_consumable_parts",
    name: "Manage Consumable Parts",
    name_ar: "إدارة المواد الاستهلاكية",
    category: "الصيانة",
    description: "Manage consumable parts and supplies",
  },

  // Quality
  {
    id: "view_quality",
    name: "View Quality",
    name_ar: "عرض الجودة",
    category: "الجودة",
    description: "View quality reports",
  },
  {
    id: "manage_quality",
    name: "Manage Quality",
    name_ar: "إدارة الجودة",
    category: "الجودة",
    description: "Manage quality control and reports",
  },
  {
    id: "create_quality_inspections",
    name: "Create Quality Inspections",
    name_ar: "إنشاء فحوصات الجودة",
    category: "الجودة",
    description: "Create new quality inspection records",
  },
  {
    id: "view_quality_reports",
    name: "View Quality Reports",
    name_ar: "عرض تقارير الجودة",
    category: "الجودة",
    description: "View quality statistics and analysis reports",
  },
  {
    id: "manage_quality_settings",
    name: "Manage Quality Settings",
    name_ar: "إدارة إعدادات الجودة",
    category: "الجودة",
    description: "Manage quality control parameters and thresholds",
  },

  // Inventory & Warehouse
  {
    id: "view_inventory",
    name: "View Inventory",
    name_ar: "عرض المخزون",
    category: "المخزون",
    description: "View inventory levels",
  },
  {
    id: "manage_inventory",
    name: "Manage Inventory",
    name_ar: "إدارة المخزون",
    category: "المخزون",
    description: "Manage inventory and warehouse",
  },
  {
    id: "view_warehouse",
    name: "View Warehouse",
    name_ar: "عرض المستودع",
    category: "المخزون",
    description: "View warehouse data",
  },
  {
    id: "manage_warehouse",
    name: "Manage Warehouse",
    name_ar: "إدارة المستودع",
    category: "المخزون",
    description: "Manage warehouse operations",
  },
  {
    id: "view_warehouse_vouchers",
    name: "View Warehouse Vouchers",
    name_ar: "عرض سندات المستودع",
    category: "المخزون",
    description: "View warehouse entry and exit vouchers",
  },
  {
    id: "manage_warehouse_vouchers",
    name: "Manage Warehouse Vouchers",
    name_ar: "إدارة سندات المستودع",
    category: "المخزون",
    description: "Create and manage warehouse vouchers",
  },
  {
    id: "view_warehouse_reports",
    name: "View Warehouse Reports",
    name_ar: "عرض تقارير المستودع",
    category: "المخزون",
    description: "View warehouse statistics and reports",
  },
  {
    id: "manage_production_hall",
    name: "Manage Production Hall",
    name_ar: "إدارة صالة الإنتاج",
    category: "المخزون",
    description: "Manage production hall inventory and receipts",
  },

  // Users
  {
    id: "manage_users",
    name: "Manage Users",
    name_ar: "إدارة المستخدمين",
    category: "المستخدمين",
    description: "Create, edit, delete users",
  },

  // HR
  {
    id: "view_hr",
    name: "View HR",
    name_ar: "عرض الموارد البشرية",
    category: "الموارد البشرية",
    description: "View HR data and employee information",
  },
  {
    id: "manage_hr",
    name: "Manage HR",
    name_ar: "إدارة الموارد البشرية",
    category: "الموارد البشرية",
    description: "Full HR management including all HR functions",
  },
  {
    id: "view_attendance",
    name: "View Attendance",
    name_ar: "عرض الحضور والانصراف",
    category: "الموارد البشرية",
    description: "View employee attendance records",
  },
  {
    id: "manage_attendance",
    name: "Manage Attendance",
    name_ar: "إدارة الحضور والانصراف",
    category: "الموارد البشرية",
    description: "Record and modify attendance, overtime, and breaks",
  },
  {
    id: "view_attendance_reports",
    name: "View Attendance Reports",
    name_ar: "عرض تقارير الحضور",
    category: "الموارد البشرية",
    description: "View attendance statistics and reports",
  },
  {
    id: "manage_leaves",
    name: "Manage Leaves",
    name_ar: "إدارة الإجازات",
    category: "الموارد البشرية",
    description: "Approve and manage employee leave requests",
  },
  {
    id: "record_work_violations",
    name: "Record Work Violations",
    name_ar: "تسجيل مخالفات العمل",
    category: "الموارد البشرية",
    description: "Record work violations for production workers",
  },
  {
    id: "view_work_violations",
    name: "View Work Violations",
    name_ar: "عرض مخالفات العمل",
    category: "الموارد البشرية",
    description: "View work violation records and reports",
  },
  {
    id: "manage_work_violations",
    name: "Manage Work Violations",
    name_ar: "إدارة مخالفات العمل",
    category: "الموارد البشرية",
    description:
      "Edit/delete/waive work violations and manage points and deduction settings",
  },
  {
    id: "view_training",
    name: "View Training",
    name_ar: "عرض التدريب",
    category: "الموارد البشرية",
    description: "View training programs and schedules",
  },
  {
    id: "manage_training",
    name: "Manage Training",
    name_ar: "إدارة التدريب",
    category: "الموارد البشرية",
    description: "Create and manage training programs",
  },

  // Reports & Analytics
  {
    id: "view_reports",
    name: "View Reports",
    name_ar: "عرض التقارير",
    category: "التقارير",
    description: "View system reports and analytics",
  },
  {
    id: "manage_analytics",
    name: "Manage Analytics",
    name_ar: "إدارة التحليلات",
    category: "التقارير",
    description: "Manage advanced analytics and ML features",
  },
  {
    id: "view_production_monitoring",
    name: "View Production Monitoring",
    name_ar: "عرض مراقبة الإنتاج",
    category: "التقارير",
    description: "View real-time production monitoring",
  },
  {
    id: "view_financial_reports",
    name: "View Financial Reports",
    name_ar: "عرض التقارير المالية",
    category: "التقارير",
    description: "View financial and cost analysis reports",
  },
  {
    id: "view_hr_reports",
    name: "View HR Reports",
    name_ar: "عرض تقارير الموارد البشرية",
    category: "التقارير",
    description: "View human resources statistics and reports",
  },
  {
    id: "view_quality_control_reports",
    name: "View Quality Control Reports",
    name_ar: "عرض تقارير مراقبة الجودة",
    category: "التقارير",
    description: "View quality control statistics in reports page",
  },
  {
    id: "view_maintenance_stats_reports",
    name: "View Maintenance Statistics Reports",
    name_ar: "عرض تقارير إحصائيات الصيانة",
    category: "التقارير",
    description: "View maintenance statistics in reports page",
  },

  // Alerts & Monitoring
  {
    id: "view_alerts",
    name: "View Alerts",
    name_ar: "عرض التنبيهات",
    category: "المراقبة",
    description: "View system alerts",
  },
  {
    id: "manage_alerts",
    name: "Manage Alerts",
    name_ar: "إدارة التنبيهات",
    category: "المراقبة",
    description: "Manage system alerts and rules",
  },
  {
    id: "view_system_health",
    name: "View System Health",
    name_ar: "عرض صحة النظام",
    category: "المراقبة",
    description: "View system health monitoring",
  },

  // System
  {
    id: "manage_settings",
    name: "Manage Settings",
    name_ar: "إدارة الإعدادات",
    category: "النظام",
    description: "Modify system settings",
  },
  {
    id: "manage_definitions",
    name: "Manage Definitions",
    name_ar: "إدارة التعريفات",
    category: "النظام",
    description: "Manage system definitions and master data",
  },
  {
    id: "manage_roles",
    name: "Manage Roles",
    name_ar: "إدارة الأدوار",
    category: "النظام",
    description: "Create and modify user roles",
  },

  // Definitions (sub-permissions)
  {
    id: "manage_customers",
    name: "Manage Customers",
    name_ar: "إدارة العملاء",
    category: "التعريفات",
    description: "Create, edit, and manage customer records",
  },
  {
    id: "manage_items",
    name: "Manage Items",
    name_ar: "إدارة الأصناف",
    category: "التعريفات",
    description: "Create, edit, and manage item definitions",
  },
  {
    id: "manage_machines",
    name: "Manage Machines",
    name_ar: "إدارة الماكينات",
    category: "التعريفات",
    description: "Create, edit, and manage machine definitions",
  },
  {
    id: "manage_sections",
    name: "Manage Sections",
    name_ar: "إدارة الأقسام",
    category: "التعريفات",
    description: "Create, edit, and manage department sections",
  },
  {
    id: "manage_categories",
    name: "Manage Categories",
    name_ar: "إدارة الفئات",
    category: "التعريفات",
    description: "Create, edit, and manage item categories",
  },
  {
    id: "manage_master_batch",
    name: "Manage Master Batch Colors",
    name_ar: "إدارة ألوان الماستر باتش",
    category: "التعريفات",
    description: "Create, edit, and manage master batch color definitions",
  },

  // Definitions — granular per-tab actions (add / edit / delete)
  {
    id: "add_customers",
    name: "Add Customers",
    name_ar: "إضافة العملاء",
    category: "التعريفات",
    description: "Create new customer records",
  },
  {
    id: "edit_customers",
    name: "Edit Customers",
    name_ar: "تعديل العملاء",
    category: "التعريفات",
    description: "Edit existing customer records",
  },
  {
    id: "delete_customers",
    name: "Delete Customers",
    name_ar: "حذف العملاء",
    category: "التعريفات",
    description: "Delete customer records",
  },
  {
    id: "add_sections",
    name: "Add Sections",
    name_ar: "إضافة الأقسام",
    category: "التعريفات",
    description: "Create new section records",
  },
  {
    id: "edit_sections",
    name: "Edit Sections",
    name_ar: "تعديل الأقسام",
    category: "التعريفات",
    description: "Edit existing section records",
  },
  {
    id: "delete_sections",
    name: "Delete Sections",
    name_ar: "حذف الأقسام",
    category: "التعريفات",
    description: "Delete section records",
  },
  {
    id: "add_categories",
    name: "Add Categories",
    name_ar: "إضافة الفئات",
    category: "التعريفات",
    description: "Create new category records",
  },
  {
    id: "edit_categories",
    name: "Edit Categories",
    name_ar: "تعديل الفئات",
    category: "التعريفات",
    description: "Edit existing category records",
  },
  {
    id: "delete_categories",
    name: "Delete Categories",
    name_ar: "حذف الفئات",
    category: "التعريفات",
    description: "Delete category records",
  },
  {
    id: "add_items",
    name: "Add Items",
    name_ar: "إضافة الأصناف",
    category: "التعريفات",
    description: "Create new item records",
  },
  {
    id: "edit_items",
    name: "Edit Items",
    name_ar: "تعديل الأصناف",
    category: "التعريفات",
    description: "Edit existing item records",
  },
  {
    id: "delete_items",
    name: "Delete Items",
    name_ar: "حذف الأصناف",
    category: "التعريفات",
    description: "Delete item records",
  },
  {
    id: "add_customer_products",
    name: "Add Customer Products",
    name_ar: "إضافة منتجات العملاء",
    category: "التعريفات",
    description: "Create new customer product records",
  },
  {
    id: "edit_customer_products",
    name: "Edit Customer Products",
    name_ar: "تعديل منتجات العملاء",
    category: "التعريفات",
    description: "Edit existing customer product records",
  },
  {
    id: "delete_customer_products",
    name: "Delete Customer Products",
    name_ar: "حذف منتجات العملاء",
    category: "التعريفات",
    description: "Delete customer product records",
  },
  {
    id: "add_machines",
    name: "Add Machines",
    name_ar: "إضافة الماكينات",
    category: "التعريفات",
    description: "Create new machine records",
  },
  {
    id: "edit_machines",
    name: "Edit Machines",
    name_ar: "تعديل الماكينات",
    category: "التعريفات",
    description: "Edit existing machine records",
  },
  {
    id: "delete_machines",
    name: "Delete Machines",
    name_ar: "حذف الماكينات",
    category: "التعريفات",
    description: "Delete machine records",
  },
  {
    id: "add_users",
    name: "Add Users",
    name_ar: "إضافة المستخدمين",
    category: "التعريفات",
    description: "Create new user records",
  },
  {
    id: "edit_users",
    name: "Edit Users",
    name_ar: "تعديل المستخدمين",
    category: "التعريفات",
    description: "Edit existing user records",
  },
  {
    id: "delete_users",
    name: "Delete Users",
    name_ar: "حذف المستخدمين",
    category: "التعريفات",
    description: "Delete user records",
  },
  {
    id: "add_master_batch",
    name: "Add Master Batch Colors",
    name_ar: "إضافة ألوان الماستر باتش",
    category: "التعريفات",
    description: "Create new master batch color records",
  },
  {
    id: "edit_master_batch",
    name: "Edit Master Batch Colors",
    name_ar: "تعديل ألوان الماستر باتش",
    category: "التعريفات",
    description: "Edit existing master batch color records",
  },
  {
    id: "delete_master_batch",
    name: "Delete Master Batch Colors",
    name_ar: "حذف ألوان الماستر باتش",
    category: "التعريفات",
    description: "Delete master batch color records",
  },

  // Admin areas — granular per-area actions (add / edit / delete)
  {
    id: "add_warehouse",
    name: "Add Warehouse Records",
    name_ar: "إضافة سجلات المستودع",
    category: "المخزون",
    description: "Create new warehouse records (movements, transactions, inventory)",
  },
  {
    id: "edit_warehouse",
    name: "Edit Warehouse Records",
    name_ar: "تعديل سجلات المستودع",
    category: "المخزون",
    description: "Edit existing warehouse records",
  },
  {
    id: "delete_warehouse",
    name: "Delete Warehouse Records",
    name_ar: "حذف سجلات المستودع",
    category: "المخزون",
    description: "Delete warehouse records",
  },
  {
    id: "add_hr",
    name: "Add HR Records",
    name_ar: "إضافة سجلات الموارد البشرية",
    category: "الموارد البشرية",
    description: "Create new HR records (training, performance, leaves)",
  },
  {
    id: "edit_hr",
    name: "Edit HR Records",
    name_ar: "تعديل سجلات الموارد البشرية",
    category: "الموارد البشرية",
    description: "Edit existing HR records",
  },
  {
    id: "delete_hr",
    name: "Delete HR Records",
    name_ar: "حذف سجلات الموارد البشرية",
    category: "الموارد البشرية",
    description: "Delete HR records",
  },
  {
    id: "add_maintenance",
    name: "Add Maintenance Records",
    name_ar: "إضافة سجلات الصيانة",
    category: "الصيانة",
    description: "Create new maintenance records (requests, actions, reports, parts)",
  },
  {
    id: "edit_maintenance",
    name: "Edit Maintenance Records",
    name_ar: "تعديل سجلات الصيانة",
    category: "الصيانة",
    description: "Edit existing maintenance records",
  },
  {
    id: "delete_maintenance",
    name: "Delete Maintenance Records",
    name_ar: "حذف سجلات الصيانة",
    category: "الصيانة",
    description: "Delete maintenance records",
  },
  {
    id: "add_production",
    name: "Add Production Records",
    name_ar: "إضافة سجلات الإنتاج",
    category: "الإنتاج",
    description: "Create new production orders and related records",
  },
  {
    id: "edit_production",
    name: "Edit Production Records",
    name_ar: "تعديل سجلات الإنتاج",
    category: "الإنتاج",
    description: "Edit existing production records",
  },
  {
    id: "delete_production",
    name: "Delete Production Records",
    name_ar: "حذف سجلات الإنتاج",
    category: "الإنتاج",
    description: "Delete production records",
  },
  {
    id: "add_quality",
    name: "Add Quality Records",
    name_ar: "إضافة سجلات الجودة",
    category: "الجودة",
    description: "Create new quality records (issues, actions, responsibles)",
  },
  {
    id: "edit_quality",
    name: "Edit Quality Records",
    name_ar: "تعديل سجلات الجودة",
    category: "الجودة",
    description: "Edit existing quality records",
  },
  {
    id: "delete_quality",
    name: "Delete Quality Records",
    name_ar: "حذف سجلات الجودة",
    category: "الجودة",
    description: "Delete quality records",
  },
  {
    id: "add_settings",
    name: "Add System Settings",
    name_ar: "إضافة إعدادات النظام",
    category: "النظام",
    description: "Create new system settings entries",
  },
  {
    id: "edit_settings",
    name: "Edit System Settings",
    name_ar: "تعديل إعدادات النظام",
    category: "النظام",
    description: "Edit existing system settings",
  },
  {
    id: "delete_settings",
    name: "Delete System Settings",
    name_ar: "حذف إعدادات النظام",
    category: "النظام",
    description: "Delete system settings entries",
  },

  // WhatsApp Integration
  {
    id: "manage_whatsapp",
    name: "Manage WhatsApp",
    name_ar: "إدارة الواتساب",
    category: "التكامل",
    description: "Manage WhatsApp integration and settings",
  },

  // Material Mixing
  {
    id: "view_mixing",
    name: "View Material Mixing",
    name_ar: "عرض خلط المواد",
    category: "الإنتاج",
    description: "View material mixing batches and formulas",
  },
  {
    id: "manage_mixing",
    name: "Manage Material Mixing",
    name_ar: "إدارة خلط المواد",
    category: "الإنتاج",
    description: "Create and manage material mixing batches",
  },

  // System Monitoring
  {
    id: "view_system_monitoring",
    name: "View System Monitoring",
    name_ar: "عرض مراقبة النظام",
    category: "المراقبة",
    description: "View system monitoring and performance",
  },

  // Tools
  {
    id: "view_tools",
    name: "View Tools",
    name_ar: "عرض الأدوات",
    category: "عام",
    description: "Access to production tools and utilities",
  },

  // Production Reports
  {
    id: "view_production_reports",
    name: "View Production Reports",
    name_ar: "عرض تقارير الإنتاج",
    category: "التقارير",
    description: "View production reports and statistics",
  },

  // Orders View
  {
    id: "view_orders",
    name: "View Orders",
    name_ar: "عرض الطلبات",
    category: "الطلبات",
    description: "View orders without editing permissions",
  },
  {
    id: "view_my_orders",
    name: "View My Orders",
    name_ar: "عرض طلباتي",
    category: "الطلبات",
    description: "View orders assigned to the sales representative",
  },


  // Factory Simulation
  {
    id: "view_factory_simulation",
    name: "View Factory Simulation",
    name_ar: "عرض محاكاة المصنع",
    category: "محاكاة المصنع",
    description: "View factory simulation and 3D layout",
  },
  {
    id: "manage_factory_simulation",
    name: "Manage Factory Simulation",
    name_ar: "إدارة محاكاة المصنع",
    category: "محاكاة المصنع",
    description: "Edit and configure factory simulation layout",
  },

  // Display Screen
  {
    id: "view_display_screen",
    name: "View Display Screen",
    name_ar: "عرض شاشة العرض",
    category: "شاشة العرض",
    description: "Access to view the production display screen",
  },
  {
    id: "manage_display_screen",
    name: "Manage Display Screen",
    name_ar: "إدارة شاشة العرض",
    category: "شاشة العرض",
    description: "Control and manage display screen slides and settings",
  },

  // Bag Configurator
  {
    id: "view_bag_configurator",
    name: "View Bag Configurator",
    name_ar: "عرض معالج تصميم الأكياس",
    category: "الإنتاج",
    description: "Access to bag configuration wizard",
  },

  // System (settings tabs)
  {
    id: "view_mcp_settings",
    name: "View MCP Settings",
    name_ar: "عرض إعدادات MCP",
    category: "النظام",
    description: "Access to MCP integration settings tab",
  },
  {
    id: "view_system_monitoring_tab",
    name: "View System Monitoring (Settings)",
    name_ar: "عرض مراقبة النظام (الإعدادات)",
    category: "النظام",
    description: "Access to system monitoring tab inside settings",
  },

  // Legacy Database (read-only reference)
  {
    id: "view_legacy_database",
    name: "View Legacy Database",
    name_ar: "عرض القاعدة القديمة",
    category: "التعريفات",
    description: "View the legacy (read-only) customer products database",
  },
  {
    id: "manage_legacy_database",
    name: "Manage Legacy Database Access",
    name_ar: "إدارة القاعدة القديمة",
    category: "التعريفات",
    description: "Manage access and configuration for the legacy database",
  },

  // Modern AI Agent
  {
    id: "use_modern_agent",
    name: "Use Modern AI Agent",
    name_ar: "استخدام الوكيل الذكي مودرن",
    category: "الذكاء الاصطناعي",
    description: "Chat with the Modern AI assistant",
  },
  {
    id: "manage_modern_agent",
    name: "Manage Modern AI Agent",
    name_ar: "إدارة الوكيل الذكي مودرن",
    category: "الذكاء الاصطناعي",
    description:
      "Configure Modern AI agent tasks, knowledge, access and settings",
  },

  // Admin
  {
    id: "admin",
    name: "Administrator",
    name_ar: "مدير النظام",
    category: "النظام",
    description: "Full system access",
  },
];

// Route to permission mapping
// NOTE: Routes that redirect immediately (like /production-queues -> /orders) are not included here
// because permission check happens on the target route, not the redirect source
export const ROUTE_PERMISSIONS: Record<string, PermissionKey[]> = {
  // Main pages
  "/": ["view_home", "view_dashboard"],
  "/dashboard": ["view_dashboard"],
  "/orders": ["view_orders", "manage_orders"],
  "/production": ["view_production", "manage_production"],
  "/production-dashboard": [
    "view_production",
    "manage_production",
    "view_film_dashboard",
    "view_printing_dashboard",
    "view_cutting_dashboard",
    "view_today_production",
  ],
  "/maintenance": ["view_maintenance", "manage_maintenance"],
  "/quality": ["view_quality", "manage_quality"],
  "/warehouse": ["view_warehouse", "manage_warehouse"],
  "/virtual-warehouse": ["view_warehouse", "manage_warehouse"],
  "/inventory": ["view_inventory", "manage_inventory"],
  "/hr": ["view_hr", "manage_hr", "edit_hr", "delete_hr"],
  // المراسلات الداخلية متاحة لعموم المستخدمين النشطين (أي صلاحية أساسية)
  "/messages": [
    "view_dashboard",
    "view_user_dashboard",
    "view_orders",
    "view_production",
    "view_hr",
    "manage_hr",
    "view_notifications",
    "view_reports",
    "view_maintenance",
    "view_quality",
    "view_warehouse",
  ],
  "/work-violations": [
    "record_work_violations",
    "view_work_violations",
    "manage_work_violations",
    "admin",
  ],
  "/reports": ["view_reports", "view_production_reports"],
  "/settings": ["manage_settings", "admin"],
  "/definitions": [
    "manage_definitions",
    "manage_customers",
    "manage_sections",
    "manage_categories",
    "manage_items",
    "manage_machines",
    "manage_users",
    "manage_master_batch",
    "admin",
  ],
  "/users": ["manage_users"],
  "/user-dashboard": ["view_user_dashboard"],
  "/notifications": ["view_notifications"],

  // Production sub-pages
  "/production-orders-management": ["view_production", "manage_production"],
  "/production-queues": [
    "view_production",
    "manage_production",
    "view_orders",
    "manage_orders",
  ],
  "/roll-search": ["view_production", "manage_production"],
  "/production-reports": [
    "view_production_reports",
    "view_reports",
    "view_production",
  ],

  // Operator dashboards
  "/film-operator": [
    "view_film_dashboard",
    "view_production",
    "manage_production",
  ],
  "/printing-operator": [
    "view_printing_dashboard",
    "view_production",
    "manage_production",
  ],
  "/cutting-operator": [
    "view_cutting_dashboard",
    "view_production",
    "manage_production",
  ],

  // Monitoring and alerts
  "/alerts": ["view_alerts", "manage_alerts"],
  "/system-health": ["view_system_health"],
  "/system-monitoring": [
    "view_system_monitoring",
    "view_system_health",
    "admin",
  ],
  "/production-monitoring": ["view_production_monitoring", "view_production"],

  // Tools and utilities
  "/tools": ["view_tools", "view_production", "manage_production"],
  "/admin-tools": ["view_tools", "view_production", "manage_production"],
  "/material-mixing": ["view_mixing", "manage_mixing", "view_production"],

  // Factory simulation
  "/factory-simulation": [
    "view_factory_simulation",
    "manage_factory_simulation",
    "view_production",
    "manage_production",
    "admin",
  ],

  // WhatsApp integration
  "/meta-whatsapp-setup": ["manage_whatsapp", "admin"],
  "/whatsapp-setup": ["manage_whatsapp", "admin"],
  "/whatsapp-test": ["manage_whatsapp", "admin"],
  "/whatsapp-troubleshoot": ["manage_whatsapp", "admin"],
  "/whatsapp-production-setup": ["manage_whatsapp", "admin"],
  "/whatsapp-final-setup": ["manage_whatsapp", "admin"],
  "/twilio-content": ["manage_whatsapp", "admin"],
  "/whatsapp-template-test": ["manage_whatsapp", "admin"],
  "/whatsapp-webhooks": ["manage_whatsapp", "admin"],


  // Display Screen
  "/display-screen": ["view_display_screen", "admin"],
  "/display-control": ["manage_display_screen", "admin"],

  // Display Tools hub (groups bag configurator, factory simulation, virtual warehouse, display screen)
  "/display-tools": [
    "view_bag_configurator",
    "manage_orders",
    "view_factory_simulation",
    "manage_factory_simulation",
    "view_production",
    "manage_production",
    "view_warehouse",
    "manage_warehouse",
    "view_display_screen",
    "manage_display_screen",
    "admin",
  ],

  // Factory Floor
  "/factory-floor": ["view_production", "manage_production", "admin"],

  // My Orders (sales reps)
  "/my-orders": ["view_my_orders", "manage_orders", "admin"],

  // Bag Configurator
  "/bag-configurator": ["view_bag_configurator", "manage_orders", "admin"],

  // Modern AI Agent
  "/modern-agent": ["use_modern_agent", "manage_modern_agent", "admin"],

  // Smart Maintenance Engineer (read-only AI agent)
  "/maintenance-engineer": ["view_maintenance", "manage_maintenance", "admin"],
};

// Settings tabs permissions
export const DEFINITIONS_TAB_PERMISSIONS: Record<string, PermissionKey[]> = {
  customers: ["manage_customers", "manage_definitions", "admin"],
  sections: ["manage_sections", "manage_definitions", "admin"],
  categories: ["manage_categories", "manage_definitions", "admin"],
  items: ["manage_items", "manage_definitions", "admin"],
  "customer-products": ["manage_customers", "manage_definitions", "admin"],
  machines: ["manage_machines", "manage_definitions", "admin"],
  users: ["manage_users", "admin"],
  "master-batch-colors": ["manage_master_batch", "manage_definitions", "admin"],
  legacy: [
    "view_legacy_database",
    "manage_legacy_database",
    "manage_definitions",
    "admin",
  ],
};

export const SETTINGS_TAB_PERMISSIONS: Record<string, PermissionKey[]> = {
  roles: ["manage_roles", "admin"],
  notifications: ["manage_settings", "admin"],
  system: ["manage_settings", "admin"],
  database: ["admin"],
  location: ["manage_settings", "admin"],
  "notification-center": ["manage_settings", "admin"],
  "whatsapp-webhooks": ["manage_whatsapp", "admin"],
  "notification-events": ["manage_settings", "admin"],
  sms: ["manage_settings", "manage_whatsapp", "admin"],
  mcp: ["view_mcp_settings", "manage_settings", "admin"],
  "system-monitoring": [
    "view_system_monitoring_tab",
    "view_system_monitoring",
    "view_system_health",
    "admin",
  ],
  "letter-template": ["manage_settings", "admin"],
  "modern-agent": ["manage_modern_agent", "admin"],
  "external-db": ["manage_settings", "admin"],
  user: [],
};

// Helper function to check if user has permission
export function hasPermission(
  userPermissions: string[] | undefined | null,
  requiredPermissions: PermissionKey | PermissionKey[],
  requireAll: boolean = false,
): boolean {
  if (!userPermissions) return false;

  // Admin has all permissions
  if (userPermissions.includes("admin")) return true;

  const required = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  if (requireAll) {
    // User must have ALL required permissions
    return required.every((perm) => userPermissions.includes(perm));
  } else {
    // User needs at least ONE of the required permissions
    return required.some((perm) => userPermissions.includes(perm));
  }
}

// Helper function to filter permissions by category
export function getPermissionsByCategory(category: string): Permission[] {
  return PERMISSIONS.filter((p) => p.category === category);
}

// Helper function to get permission details
export function getPermission(id: PermissionKey): Permission | undefined {
  return PERMISSIONS.find((p) => p.id === id);
}

// Helper function to validate permissions array
export function validatePermissions(permissions: string[]): PermissionKey[] {
  const validKeys = PERMISSIONS.map((p) => p.id);
  return permissions.filter((p) =>
    validKeys.includes(p as PermissionKey),
  ) as PermissionKey[];
}

// Export permission groups for UI organization
export const PERMISSION_CATEGORIES = [
  "عام",
  "الطلبات",
  "الإنتاج",
  "الصيانة",
  "الجودة",
  "المخزون",
  "المستخدمين",
  "الموارد البشرية",
  "التقارير",
  "المراقبة",
  "التعريفات",
  "محاكاة المصنع",
  "شاشة العرض",
  "التكامل",
  "الذكاء الاصطناعي",
  "النظام",
];

/**
 * ============================================================================
 * Hierarchical Permission Catalog (additive metadata only)
 * كتالوج الصلاحيات الهرمي (بيانات وصفية إضافية فقط)
 * ----------------------------------------------------------------------------
 * This tree organizes the EXISTING flat PermissionKey set into a navigable
 * hierarchy (Module → Page → Sub-page/Tab → Feature) for a friendlier roles
 * editor. It changes NOTHING about enforcement: backend `requirePermission`,
 * `ROUTE_PERMISSIONS`, `*_TAB_PERMISSIONS`, and `hasPermission` continue to
 * operate on the same flat keys. Every leaf references a real PermissionKey,
 * and each key appears exactly once (validated by `validatePermissionTree`).
 * ============================================================================
 */
export interface PermissionTreeNode {
  /** Stable identifier for tree UI state (expansion, search) */
  id: string;
  name: string;
  name_ar: string;
  /** Lucide icon name (resolved in the UI), only on top-level modules */
  icon?: string;
  /** Permission keys attached directly to this node */
  keys?: PermissionKey[];
  /** Nested sub-groups */
  children?: PermissionTreeNode[];
}

export const PERMISSION_TREE: PermissionTreeNode[] = [
  {
    id: "general",
    name: "General",
    name_ar: "عام",
    icon: "Home",
    children: [
      {
        id: "general.home",
        name: "Home & Dashboards",
        name_ar: "الرئيسية ولوحات التحكم",
        keys: ["view_home", "view_dashboard", "view_user_dashboard"],
      },
      {
        id: "general.notifications",
        name: "Notifications",
        name_ar: "الإشعارات",
        keys: ["view_notifications"],
      },
      {
        id: "general.tools",
        name: "Tools & Utilities",
        name_ar: "الأدوات والمرافق",
        keys: ["view_tools"],
      },
    ],
  },
  {
    id: "orders",
    name: "Orders",
    name_ar: "الطلبات",
    icon: "FileText",
    children: [
      {
        id: "orders.list",
        name: "Orders List",
        name_ar: "قائمة الطلبات",
        keys: ["view_orders", "manage_orders", "update_order_status"],
      },
      {
        id: "orders.my",
        name: "My Orders (Sales)",
        name_ar: "طلباتي (المبيعات)",
        keys: ["view_my_orders"],
      },
      {
        id: "orders.configurator",
        name: "Bag Configurator",
        name_ar: "معالج تصميم الأكياس",
        keys: ["view_bag_configurator"],
      },
    ],
  },
  {
    id: "production",
    name: "Production",
    name_ar: "الإنتاج",
    icon: "Activity",
    children: [
      {
        id: "production.general",
        name: "Production Board",
        name_ar: "لوحة الإنتاج",
        keys: ["view_production", "manage_production"],
      },
      {
        id: "production.actions",
        name: "Production Records",
        name_ar: "سجلات الإنتاج",
        keys: ["add_production", "edit_production", "delete_production"],
      },
      {
        id: "production.operators",
        name: "Operator Dashboards",
        name_ar: "لوحات المشغّلين",
        keys: [
          "view_film_dashboard",
          "view_printing_dashboard",
          "view_cutting_dashboard",
          "view_today_production",
        ],
      },
      {
        id: "production.mixing",
        name: "Material Mixing",
        name_ar: "خلط المواد",
        keys: ["view_mixing", "manage_mixing"],
      },
      {
        id: "production.monitoring",
        name: "Production Monitoring",
        name_ar: "مراقبة الإنتاج",
        keys: ["view_production_monitoring"],
      },
    ],
  },
  {
    id: "quality",
    name: "Quality",
    name_ar: "الجودة",
    icon: "ClipboardCheck",
    children: [
      {
        id: "quality.general",
        name: "Quality Control",
        name_ar: "مراقبة الجودة",
        keys: ["view_quality", "manage_quality", "create_quality_inspections"],
      },
      {
        id: "quality.actions",
        name: "Quality Records",
        name_ar: "سجلات الجودة",
        keys: ["add_quality", "edit_quality", "delete_quality"],
      },
      {
        id: "quality.reports",
        name: "Quality Reports",
        name_ar: "تقارير الجودة",
        keys: ["view_quality_reports"],
      },
      {
        id: "quality.settings",
        name: "Quality Settings",
        name_ar: "إعدادات الجودة",
        keys: ["manage_quality_settings"],
      },
    ],
  },
  {
    id: "maintenance",
    name: "Maintenance",
    name_ar: "الصيانة",
    icon: "Wrench",
    children: [
      {
        id: "maintenance.general",
        name: "Maintenance",
        name_ar: "الصيانة",
        keys: ["view_maintenance", "manage_maintenance"],
      },
      {
        id: "maintenance.requests",
        name: "Maintenance Requests",
        name_ar: "طلبات الصيانة",
        keys: [
          "view_maintenance_requests",
          "create_maintenance_requests",
          "manage_maintenance_actions",
        ],
      },
      {
        id: "maintenance.parts",
        name: "Spare & Consumable Parts",
        name_ar: "قطع الغيار والمستهلكات",
        keys: ["manage_spare_parts", "manage_consumable_parts"],
      },
      {
        id: "maintenance.negligence",
        name: "Negligence Records",
        name_ar: "سجلات الإهمال",
        keys: ["manage_negligence"],
      },
      {
        id: "maintenance.reports",
        name: "Maintenance Reports",
        name_ar: "تقارير الصيانة",
        keys: ["view_maintenance_reports"],
      },
      {
        id: "maintenance.actions",
        name: "Maintenance Records",
        name_ar: "سجلات الصيانة",
        keys: ["add_maintenance", "edit_maintenance", "delete_maintenance"],
      },
    ],
  },
  {
    id: "warehouse",
    name: "Inventory & Warehouse",
    name_ar: "المخزون والمستودع",
    icon: "Warehouse",
    children: [
      {
        id: "warehouse.inventory",
        name: "Inventory",
        name_ar: "المخزون",
        keys: ["view_inventory", "manage_inventory"],
      },
      {
        id: "warehouse.general",
        name: "Warehouse",
        name_ar: "المستودع",
        keys: ["view_warehouse", "manage_warehouse"],
      },
      {
        id: "warehouse.vouchers",
        name: "Warehouse Vouchers",
        name_ar: "سندات المستودع",
        keys: ["view_warehouse_vouchers", "manage_warehouse_vouchers"],
      },
      {
        id: "warehouse.hall",
        name: "Production Hall",
        name_ar: "صالة الإنتاج",
        keys: ["manage_production_hall"],
      },
      {
        id: "warehouse.reports",
        name: "Warehouse Reports",
        name_ar: "تقارير المستودع",
        keys: ["view_warehouse_reports"],
      },
      {
        id: "warehouse.actions",
        name: "Warehouse Records",
        name_ar: "سجلات المستودع",
        keys: ["add_warehouse", "edit_warehouse", "delete_warehouse"],
      },
    ],
  },
  {
    id: "hr",
    name: "Human Resources",
    name_ar: "الموارد البشرية",
    icon: "Users",
    children: [
      {
        id: "hr.general",
        name: "HR Overview",
        name_ar: "نظرة عامة على الموارد البشرية",
        keys: ["view_hr", "manage_hr"],
      },
      {
        id: "hr.attendance",
        name: "Attendance",
        name_ar: "الحضور والانصراف",
        keys: [
          "view_attendance",
          "manage_attendance",
          "view_attendance_reports",
        ],
      },
      {
        id: "hr.leaves",
        name: "Leaves",
        name_ar: "الإجازات",
        keys: ["manage_leaves"],
      },
      {
        id: "hr.work_violations",
        name: "Work Violations",
        name_ar: "مخالفات العمل",
        keys: [
          "record_work_violations",
          "view_work_violations",
          "manage_work_violations",
        ],
      },
      {
        id: "hr.training",
        name: "Training",
        name_ar: "التدريب",
        keys: ["view_training", "manage_training"],
      },
      {
        id: "hr.actions",
        name: "HR Records",
        name_ar: "سجلات الموارد البشرية",
        keys: ["add_hr", "edit_hr", "delete_hr"],
      },
    ],
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    name_ar: "التقارير والتحليلات",
    icon: "BarChart3",
    children: [
      {
        id: "reports.general",
        name: "Reports",
        name_ar: "التقارير",
        keys: ["view_reports", "view_production_reports", "manage_analytics"],
      },
      {
        id: "reports.specialized",
        name: "Specialized Reports",
        name_ar: "تقارير متخصصة",
        keys: [
          "view_financial_reports",
          "view_hr_reports",
          "view_quality_control_reports",
          "view_maintenance_stats_reports",
        ],
      },
    ],
  },
  {
    id: "monitoring",
    name: "Monitoring & Alerts",
    name_ar: "المراقبة والتنبيهات",
    icon: "Monitor",
    children: [
      {
        id: "monitoring.alerts",
        name: "Alerts",
        name_ar: "التنبيهات",
        keys: ["view_alerts", "manage_alerts"],
      },
      {
        id: "monitoring.health",
        name: "System Health",
        name_ar: "صحة النظام",
        keys: ["view_system_health", "view_system_monitoring"],
      },
    ],
  },
  {
    id: "definitions",
    name: "Definitions",
    name_ar: "التعريفات",
    icon: "Database",
    children: [
      {
        id: "definitions.customers",
        name: "Customers",
        name_ar: "العملاء",
        keys: [
          "manage_customers",
          "add_customers",
          "edit_customers",
          "delete_customers",
        ],
      },
      {
        id: "definitions.customer_products",
        name: "Customer Products",
        name_ar: "منتجات العملاء",
        keys: [
          "add_customer_products",
          "edit_customer_products",
          "delete_customer_products",
        ],
      },
      {
        id: "definitions.sections",
        name: "Sections",
        name_ar: "الأقسام",
        keys: [
          "manage_sections",
          "add_sections",
          "edit_sections",
          "delete_sections",
        ],
      },
      {
        id: "definitions.categories",
        name: "Categories",
        name_ar: "الفئات",
        keys: [
          "manage_categories",
          "add_categories",
          "edit_categories",
          "delete_categories",
        ],
      },
      {
        id: "definitions.items",
        name: "Items",
        name_ar: "الأصناف",
        keys: ["manage_items", "add_items", "edit_items", "delete_items"],
      },
      {
        id: "definitions.machines",
        name: "Machines",
        name_ar: "الماكينات",
        keys: [
          "manage_machines",
          "add_machines",
          "edit_machines",
          "delete_machines",
        ],
      },
      {
        id: "definitions.users",
        name: "Users",
        name_ar: "المستخدمين",
        keys: ["manage_users", "add_users", "edit_users", "delete_users"],
      },
      {
        id: "definitions.master_batch",
        name: "Master Batch Colors",
        name_ar: "ألوان الماستر باتش",
        keys: [
          "manage_master_batch",
          "add_master_batch",
          "edit_master_batch",
          "delete_master_batch",
        ],
      },
      {
        id: "definitions.legacy",
        name: "Legacy Database",
        name_ar: "القاعدة القديمة",
        keys: ["view_legacy_database", "manage_legacy_database"],
      },
    ],
  },
  {
    id: "factory_simulation",
    name: "Factory Simulation",
    name_ar: "محاكاة المصنع",
    icon: "Box",
    keys: ["view_factory_simulation", "manage_factory_simulation"],
  },
  {
    id: "display_screen",
    name: "Display Screen",
    name_ar: "شاشة العرض",
    icon: "Tv",
    keys: ["view_display_screen", "manage_display_screen"],
  },
  {
    id: "integration",
    name: "Integration & Messaging",
    name_ar: "التكامل والمراسلة",
    icon: "Plug",
    keys: ["manage_whatsapp"],
  },
  {
    id: "ai",
    name: "AI Assistant",
    name_ar: "الذكاء الاصطناعي",
    icon: "Bot",
    keys: ["use_modern_agent", "manage_modern_agent"],
  },
  {
    id: "system",
    name: "System & Settings",
    name_ar: "النظام والإعدادات",
    icon: "Settings",
    // `admin` lives directly on the module as a GUARDED key: it is excluded
    // from cascade toggles (see collectTreeKeys) so selecting the whole module
    // can never silently grant superuser access; it must be toggled explicitly.
    keys: ["admin"],
    children: [
      {
        id: "system.settings",
        name: "Settings",
        name_ar: "الإعدادات",
        keys: [
          "manage_settings",
          "add_settings",
          "edit_settings",
          "delete_settings",
        ],
      },
      {
        id: "system.definitions",
        name: "Definitions Management",
        name_ar: "إدارة التعريفات",
        keys: ["manage_definitions"],
      },
      {
        id: "system.roles",
        name: "Roles & Permissions",
        name_ar: "الأدوار والصلاحيات",
        keys: ["manage_roles"],
      },
      {
        id: "system.monitoring",
        name: "System Monitoring",
        name_ar: "مراقبة النظام",
        keys: ["view_system_monitoring_tab"],
      },
      {
        id: "system.mcp",
        name: "MCP Settings",
        name_ar: "إعدادات MCP",
        keys: ["view_mcp_settings"],
      },
    ],
  },
];

/**
 * Guarded permission keys are never included in parent-node cascade selection
 * or "select all". They grant elevated/superuser access and must be toggled
 * individually and deliberately to avoid accidental privilege escalation.
 */
export const GUARDED_PERMISSION_KEYS: PermissionKey[] = ["admin"];

export function isGuardedPermission(key: string): boolean {
  return GUARDED_PERMISSION_KEYS.includes(key as PermissionKey);
}

// Collect every PermissionKey under a tree node (its own keys + descendants').
// Guarded keys (e.g. `admin`) are excluded by default so cascade toggles can
// never silently grant superuser access; pass includeGuarded=true to get the
// raw set (used only for validation/auditing, not for UI cascades).
export function collectTreeKeys(
  node: PermissionTreeNode,
  includeGuarded: boolean = false,
): PermissionKey[] {
  const result: PermissionKey[] = [...(node.keys || [])];
  for (const child of node.children || []) {
    result.push(...collectTreeKeys(child, includeGuarded));
  }
  // De-duplicate while preserving order
  const deduped = Array.from(new Set(result));
  return includeGuarded
    ? deduped
    : deduped.filter((k) => !GUARDED_PERMISSION_KEYS.includes(k));
}

export type TreeSelectionState = "none" | "some" | "all";

// Tri-state for a node given the currently-selected permission keys.
export function getNodeSelectionState(
  node: PermissionTreeNode,
  selected: string[],
): TreeSelectionState {
  const keys = collectTreeKeys(node);
  if (keys.length === 0) return "none";
  const selectedCount = keys.filter((k) => selected.includes(k)).length;
  if (selectedCount === 0) return "none";
  if (selectedCount === keys.length) return "all";
  return "some";
}

/**
 * Development-time sanity check: ensures every PermissionKey appears exactly
 * once across the tree (no orphans, no duplicates). Returns the list of
 * problems; an empty array means the tree is consistent.
 */
export function validatePermissionTree(): string[] {
  const problems: string[] = [];
  const seen = new Map<string, number>();
  const walk = (node: PermissionTreeNode) => {
    for (const key of node.keys || []) {
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    for (const child of node.children || []) walk(child);
  };
  PERMISSION_TREE.forEach(walk);

  const allKeys = PERMISSIONS.map((p) => p.id);
  for (const key of allKeys) {
    const count = seen.get(key) || 0;
    if (count === 0) problems.push(`Missing from tree: ${key}`);
    if (count > 1) problems.push(`Duplicated in tree (${count}x): ${key}`);
  }
  for (const key of Array.from(seen.keys())) {
    if (!allKeys.includes(key as PermissionKey)) {
      problems.push(`Unknown key in tree: ${key}`);
    }
  }
  return problems;
}

/**
 * Ready-made role templates (presets). Selecting a preset replaces the role's
 * permission set with the listed flat keys. These are convenience starting
 * points only — admins can fine-tune afterwards.
 */
export interface RolePreset {
  id: string;
  name: string;
  name_ar: string;
  description_ar: string;
  permissions: PermissionKey[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "administrator",
    name: "Administrator",
    name_ar: "مدير النظام",
    description_ar: "وصول كامل لجميع أجزاء النظام",
    permissions: ["admin"],
  },
  {
    id: "sales",
    name: "Sales Representative",
    name_ar: "مندوب مبيعات",
    description_ar: "إدارة الطلبات والعملاء ومتابعة المبيعات",
    permissions: [
      "view_home",
      "view_dashboard",
      "view_user_dashboard",
      "view_notifications",
      "view_orders",
      "manage_orders",
      "update_order_status",
      "view_my_orders",
      "view_bag_configurator",
      "manage_customers",
      "add_customers",
      "edit_customers",
      "view_reports",
    ],
  },
  {
    id: "production_operator",
    name: "Production Operator",
    name_ar: "عامل إنتاج",
    description_ar: "لوحات المشغّلين ومتابعة الإنتاج اليومي",
    permissions: [
      "view_home",
      "view_notifications",
      "view_production",
      "view_film_dashboard",
      "view_printing_dashboard",
      "view_cutting_dashboard",
      "view_today_production",
    ],
  },
  {
    id: "quality",
    name: "Quality Inspector",
    name_ar: "مراقب جودة",
    description_ar: "مراقبة الجودة وإنشاء الفحوصات والتقارير",
    permissions: [
      "view_home",
      "view_notifications",
      "view_quality",
      "manage_quality",
      "create_quality_inspections",
      "view_quality_reports",
      "manage_quality_settings",
      "add_quality",
      "edit_quality",
      "delete_quality",
    ],
  },
  {
    id: "maintenance",
    name: "Maintenance Technician",
    name_ar: "فني صيانة",
    description_ar: "إدارة طلبات وإجراءات الصيانة وقطع الغيار",
    permissions: [
      "view_home",
      "view_notifications",
      "view_maintenance",
      "manage_maintenance",
      "view_maintenance_requests",
      "create_maintenance_requests",
      "manage_maintenance_actions",
      "view_maintenance_reports",
      "manage_spare_parts",
      "manage_consumable_parts",
      "add_maintenance",
      "edit_maintenance",
      "delete_maintenance",
    ],
  },
  {
    id: "hr",
    name: "HR Officer",
    name_ar: "موظف موارد بشرية",
    description_ar: "إدارة الحضور والإجازات والتدريب وسجلات الموظفين",
    permissions: [
      "view_home",
      "view_notifications",
      "view_hr",
      "manage_hr",
      "view_attendance",
      "manage_attendance",
      "view_attendance_reports",
      "manage_leaves",
      "view_training",
      "manage_training",
      "view_hr_reports",
      "add_hr",
      "edit_hr",
      "delete_hr",
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse Keeper",
    name_ar: "أمين مستودع",
    description_ar: "إدارة المخزون والمستودع والسندات",
    permissions: [
      "view_home",
      "view_notifications",
      "view_warehouse",
      "manage_warehouse",
      "view_inventory",
      "manage_inventory",
      "view_warehouse_vouchers",
      "manage_warehouse_vouchers",
      "view_warehouse_reports",
      "manage_production_hall",
      "add_warehouse",
      "edit_warehouse",
      "delete_warehouse",
    ],
  },
  {
    id: "viewer",
    name: "Viewer",
    name_ar: "مشاهد",
    description_ar: "عرض فقط دون أي صلاحيات تعديل",
    permissions: [
      "view_home",
      "view_dashboard",
      "view_user_dashboard",
      "view_notifications",
      "view_orders",
      "view_production",
      "view_quality",
      "view_maintenance",
      "view_warehouse",
      "view_inventory",
      "view_reports",
    ],
  },
];
