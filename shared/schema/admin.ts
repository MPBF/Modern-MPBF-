/**
 * 👤 الإدارة والنظام (Admin & System)
 * جداول تتعلق بالمستخدمين والأدوار والإعدادات
 */

import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
  index,
  foreignKey,
  unique,
  date,
} from "drizzle-orm/pg-core";

// ==================== الأدوار ====================
export const roles = pgTable("roles", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  permissions: json(),
});

// ==================== المستخدمون ====================
export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    username: varchar({ length: 50 }),
    password: varchar({ length: 100 }),
    displayName: varchar("display_name", { length: 100 }),
    displayNameAr: varchar("display_name_ar", { length: 100 }),
    roleId: integer("role_id"),
    sectionId: varchar("section_id", { length: 20 }),
    status: varchar({ length: 20 }).default("active"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    fullName: varchar("full_name", { length: 200 }),
    phone: varchar({ length: 20 }),
    email: varchar({ length: 100 }),
    replitUserId: varchar("replit_user_id", { length: 255 }),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    profileImageUrl: varchar("profile_image_url", { length: 500 }),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_users_role_id").using(
      "btree",
      table.roleId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_users_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    index("idx_users_username").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops"),
    ),
    unique("users_username_unique").on(table.username),
    unique("users_replit_user_id_key").on(table.replitUserId),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [roles.id],
      name: "users_role_id_roles_id_fkey",
    }),
  ],
);

// ==================== إعدادات المستخدم ====================
export const userSettings = pgTable(
  "user_settings",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    settingKey: varchar("setting_key", { length: 100 }).notNull(),
    settingValue: text("setting_value"),
    settingType: varchar("setting_type", { length: 20 }).default("string"),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_settings_user_id_users_id_fkey",
    }),
  ],
);

// ==================== طلبات المستخدم ====================
export const userRequests = pgTable(
  "user_requests",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    type: varchar({ length: 50 }).notNull(),
    title: varchar({ length: 200 }).notNull(),
    description: text().notNull(),
    status: varchar({ length: 20 }).default("معلق").notNull(),
    priority: varchar({ length: 20 }).default("عادي"),
    response: text(),
    reviewedBy: integer("reviewed_by"),
    date: timestamp({ mode: "string" }).defaultNow().notNull(),
    reviewedDate: timestamp("reviewed_date", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_user_requests_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamp_ops"),
    ),
    index("idx_user_requests_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    index("idx_user_requests_type").using(
      "btree",
      table.type.asc().nullsLast().op("text_ops"),
    ),
    index("idx_user_requests_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_requests_user_id_fkey",
    }).onUpdate("cascade"),
    foreignKey({
      columns: [table.reviewedBy],
      foreignColumns: [users.id],
      name: "user_requests_reviewed_by_fkey",
    }).onUpdate("cascade"),
  ],
);

// ==================== قرارات الإدارة ====================
export const adminDecisions = pgTable(
  "admin_decisions",
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 100 }).notNull(),
    titleAr: varchar("title_ar", { length: 100 }),
    description: text(),
    targetType: varchar("target_type", { length: 20 }),
    targetId: integer("target_id"),
    date: date().notNull(),
    issuedBy: integer("issued_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.issuedBy],
      foreignColumns: [users.id],
      name: "admin_decisions_issued_by_users_id_fkey",
    }),
  ],
);

// ==================== إعدادات النظام ====================
export const systemSettings = pgTable(
  "system_settings",
  {
    id: serial().primaryKey().notNull(),
    settingKey: varchar("setting_key", { length: 100 }).notNull(),
    settingValue: text("setting_value"),
    settingType: varchar("setting_type", { length: 20 }).default("string"),
    description: text(),
    isEditable: boolean("is_editable").default(true),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    updatedBy: integer("updated_by"),
  },
  (table) => [
    unique("system_settings_setting_key_unique").on(table.settingKey),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "system_settings_updated_by_users_id_fkey",
    }),
  ],
);

// ==================== مقاييس أداء النظام ====================
export const systemPerformanceMetrics = pgTable("system_performance_metrics", {
  id: serial().primaryKey().notNull(),
  metricName: varchar("metric_name", { length: 255 }).notNull(),
  metricCategory: varchar("metric_category", { length: 30 }).notNull(),
  value: text().notNull(),
  unit: varchar({ length: 20 }),
  timestamp: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  source: varchar({ length: 50 }),
  tags: json(),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// ==================== جلسات المستخدم ====================
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar().primaryKey().notNull(),
    sess: json().notNull(),
    expire: timestamp({ mode: "string" }).notNull(),
  },
  (table) => [
    index("idx_session_expire").using(
      "btree",
      table.expire.asc().nullsLast().op("timestamp_ops"),
    ),
  ],
);

// ==================== جلسات المستخدم البديلة ====================
export const userSessions = pgTable(
  "user_sessions",
  {
    sid: varchar().primaryKey().notNull(),
    sess: json().notNull(),
    expire: timestamp({ precision: 6, mode: "string" }).notNull(),
  },
  (table) => [
    index("IDX_session_expire").using(
      "btree",
      table.expire.asc().nullsLast().op("timestamp_ops"),
    ),
  ],
);

// ==================== ملف تعريف الشركة ====================
export const companyProfile = pgTable("company_profile", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  address: text(),
  taxNumber: varchar("tax_number", { length: 20 }),
  phone: varchar({ length: 20 }),
  email: varchar({ length: 100 }),
  logoUrl: varchar("logo_url", { length: 255 }),
  workingHoursPerDay: integer("working_hours_per_day").default(8),
  defaultLanguage: varchar("default_language", { length: 10 }).default("ar"),
});

// ==================== معرفة وكيل AI ====================
export const aiAgentKnowledge = pgTable(
  "ai_agent_knowledge",
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    category: varchar({ length: 50 }).default("general").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: integer("created_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "ai_agent_knowledge_created_by_fkey",
    }),
  ],
);

// ==================== إعدادات وكيل AI ====================
export const aiAgentSettings = pgTable(
  "ai_agent_settings",
  {
    id: serial().primaryKey().notNull(),
    key: varchar({ length: 100 }).notNull(),
    value: text().notNull(),
    description: text(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedBy: integer("updated_by"),
  },
  (table) => [
    unique("ai_agent_settings_key_key").on(table.key),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "ai_agent_settings_updated_by_fkey",
    }),
  ],
);
