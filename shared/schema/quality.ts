/**
 * ✅ الجودة والفئات (Quality & Categories)
 * جداول تتعلق بفحص الجودة والفئات والألوان الرئيسية
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
  index,
  foreignKey,
  unique,
  date,
} from "drizzle-orm/pg-core";

// ==================== الفئات ====================
export const categories = pgTable("categories", {
  id: varchar({ length: 20 }).primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  parentId: varchar("parent_id", { length: 20 }),
  code: varchar({ length: 20 }),
});

// ==================== الأقسام ====================
export const sections = pgTable("sections", {
  id: varchar({ length: 20 }).primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text(),
});

// ==================== الألوان الرئيسية ====================
export const masterBatchColors = pgTable("master_batch_colors", {
  id: varchar({ length: 20 }).primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  colorHex: varchar("color_hex", { length: 20 }).default("#FFFFFF").notNull(),
  textColor: varchar("text_color", { length: 20 }).default("#000000").notNull(),
  brand: varchar({ length: 100 }),
  aliases: text(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// ==================== الوحدات ====================
export const units = pgTable("units", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  symbol: varchar({ length: 20 }),
  conversionFactor: text().default("1"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// ==================== فحوصات الجودة ====================
export const qualityChecks = pgTable(
  "quality_checks",
  {
    id: serial().primaryKey().notNull(),
    targetType: varchar("target_type", { length: 20 }),
    targetId: integer("target_id"),
    result: varchar({ length: 10 }),
    score: integer(),
    notes: text(),
    checkedBy: integer("checked_by"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_quality_checks_checked_by").using(
      "btree",
      table.checkedBy.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_quality_checks_result").using(
      "btree",
      table.result.asc().nullsLast().op("text_ops"),
    ),
    index("idx_quality_checks_target_id").using(
      "btree",
      table.targetId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_quality_checks_target_type").using(
      "btree",
      table.targetType.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.checkedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "quality_checks_checked_by_users_id_fkey",
    }),
  ],
);

// ==================== ألوان المنتجات للعملاء ====================
export const customerProductPrintColors = pgTable(
  "customer_product_print_colors",
  {
    id: serial().primaryKey().notNull(),
    customerProductId: integer("customer_product_id").notNull(),
    colorName: varchar("color_name", { length: 100 }).notNull(),
    colorNameAr: varchar("color_name_ar", { length: 100 }),
    sequence: integer().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.customerProductId],
      foreignColumns: [{ name: "id", table: "customer_products" }],
      name: "customer_product_print_colors_customer_product_id_fkey",
    }).onDelete("cascade"),
  ],
);

// ==================== تسجيلات وزن الأكياس ====================
export const bagWeightRecords = pgTable(
  "bag_weight_records",
  {
    id: serial().primaryKey().notNull(),
    customerProductId: integer("customer_product_id"),
    rollId: integer("roll_id"),
    expectedWeightGrams: integer("expected_weight_grams"),
    actualWeightGrams: integer("actual_weight_grams"),
    variance: integer(),
    status: varchar({ length: 20 }).default("approved"),
    recordedBy: integer("recorded_by"),
    recordDate: date("record_date").default(sql`CURRENT_DATE`),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.customerProductId],
      foreignColumns: [{ name: "id", table: "customer_products" }],
      name: "bag_weight_records_customer_product_id_fkey",
    }),
    foreignKey({
      columns: [table.recordedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "bag_weight_records_recorded_by_fkey",
    }),
  ],
);

// ==================== الوحدات التغليف ====================
export const packagingUnits = pgTable(
  "packaging_units",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    nameAr: varchar("name_ar", { length: 100 }),
    quantityPerUnit: integer("quantity_per_unit"),
    unitWeightKg: text().notNull(),
    description: text(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    unique("packaging_units_name_key").on(table.name),
  ],
);
