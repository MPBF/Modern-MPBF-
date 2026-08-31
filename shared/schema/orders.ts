/**
 * 🛍️ الطلبات والزبائن (Orders & Customers)
 * جداول تتعلق بالطلبات والعملاء ومنتجاتهم
 */

import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  date,
  index,
  foreignKey,
  unique,
  check,
  json,
} from "drizzle-orm/pg-core";

// ==================== العملاء ====================
export const customers = pgTable(
  "customers",
  {
    id: varchar({ length: 20 }).primaryKey().notNull(),
    name: varchar({ length: 200 }).notNull(),
    nameAr: varchar("name_ar", { length: 200 }),
    city: varchar({ length: 50 }),
    address: text(),
    taxNumber: varchar("tax_number", { length: 14 }),
    phone: varchar({ length: 20 }),
    salesRepId: integer("sales_rep_id"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    code: varchar({ length: 20 }),
    userId: varchar("user_id", { length: 10 }),
    plateDrawerCode: varchar("plate_drawer_code", { length: 20 }),
    commercialName: varchar("commercial_name", { length: 200 }),
    unifiedNumber: varchar("unified_number", { length: 10 }),
    uniqueCustomerNumber: varchar("unique_customer_number", { length: 20 }),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("idx_customers_code").using(
      "btree",
      table.code.asc().nullsLast().op("text_ops"),
    ),
    index("idx_customers_id").using(
      "btree",
      table.id.asc().nullsLast().op("text_ops"),
    ),
    index("idx_customers_name_ar_text").using(
      "gin",
      table.nameAr.asc().nullsLast().op("gin_trgm_ops"),
    ),
    index("idx_customers_name_text").using(
      "gin",
      table.name.asc().nullsLast().op("gin_trgm_ops"),
    ),
    index("idx_customers_name_name_ar").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops"),
      table.nameAr.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.salesRepId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "customers_sales_rep_id_users_id_fkey",
    }).onUpdate("cascade"),
    check(
      "tax_number_length",
      sql`(tax_number IS NULL) OR (length((tax_number)::text) = 14)`,
    ),
    check(
      "unified_number_format",
      sql`(unified_number IS NULL) OR ((unified_number)::text ~ '^7[0-9]{9}$'::text)`,
    ),
  ],
);

// ==================== منتجات العملاء ====================
export const customerProducts = pgTable(
  "customer_products",
  {
    id: serial().primaryKey().notNull(),
    customerId: varchar("customer_id", { length: 20 }),
    itemId: varchar("item_id", { length: 20 }),
    sizeCaption: varchar("size_caption", { length: 50 }),
    width: numeric({ precision: 8, scale: 2 }),
    leftFacing: numeric("left_facing", { precision: 8, scale: 2 }),
    rightFacing: numeric("right_facing", { precision: 8, scale: 2 }),
    thickness: integer(),
    printingCylinder: varchar("printing_cylinder", { length: 10 }),
    cuttingLengthCm: integer("cutting_length_cm"),
    rawMaterial: varchar("raw_material", { length: 20 }),
    masterBatchId: varchar("master_batch_id", { length: 20 }),
    isPrinted: boolean("is_printed").default(false),
    cuttingUnit: varchar("cutting_unit", { length: 20 }),
    punching: varchar({ length: 20 }),
    unitWeightKg: numeric("unit_weight_kg", { precision: 8, scale: 3 }),
    unitQuantity: integer("unit_quantity"),
    packageWeightKg: numeric("package_weight_kg", { precision: 8, scale: 2 }),
    clicheFrontDesign: text("cliche_front_design"),
    clicheBackDesign: text("cliche_back_design"),
    notes: text(),
    status: varchar({ length: 20 }).default("active"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    categoryId: varchar("category_id", { length: 20 }),
  },
  (table) => [
    index("idx_customer_products_category_id").using(
      "btree",
      table.categoryId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_customer_products_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamp_ops"),
    ),
    index("idx_customer_products_customer_id").using(
      "btree",
      table.customerId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_customer_products_customer_status").using(
      "btree",
      table.customerId.asc().nullsLast().op("text_ops"),
      table.status.asc().nullsLast().op("text_ops"),
    ),
    index("idx_customer_products_id").using(
      "btree",
      table.id.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_customer_products_item_id").using(
      "btree",
      table.itemId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_customer_products_size_caption").using(
      "gin",
      table.sizeCaption.asc().nullsLast().op("gin_trgm_ops"),
    ),
    index("idx_customer_products_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "customer_products_customer_id_customers_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// ==================== الطلبات ====================
export const orders = pgTable(
  "orders",
  {
    id: serial().primaryKey().notNull(),
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    customerId: varchar("customer_id", { length: 20 }).notNull(),
    status: varchar({ length: 30 }).default("pending"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    deliveryDate: date("delivery_date"),
    notes: text(),
    deliveryDays: integer("delivery_days"),
    createdBy: integer("created_by"),
  },
  (table) => [
    unique("orders_order_number_unique").on(table.orderNumber),
    index("idx_orders_customer_status_date").using(
      "btree",
      table.customerId.asc().nullsLast().op("timestamp_ops"),
      table.status.asc().nullsLast().op("text_ops"),
      table.createdAt.desc().nullsFirst().op("text_ops"),
    ),
    index("idx_orders_order_number_gin").using(
      "gin",
      table.orderNumber.asc().nullsLast().op("gin_trgm_ops"),
    ),
    index("idx_orders_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "orders_customer_id_customers_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "orders_created_by_users_id_fkey",
    }).onUpdate("cascade"),
  ],
);

// ==================== الاقتباسات ====================
export const quotes = pgTable(
  "quotes",
  {
    id: serial().primaryKey().notNull(),
    documentNumber: varchar("document_number", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    taxNumber: varchar("tax_number", { length: 14 }).notNull(),
    quoteDate: date("quote_date")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    totalBeforeTax: numeric("total_before_tax", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    totalWithTax: numeric("total_with_tax", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    status: varchar({ length: 20 }).default("draft").notNull(),
    createdByName: varchar("created_by_name", { length: 255 }),
    createdByPhone: varchar("created_by_phone", { length: 20 }),
    notes: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [unique("quotes_document_number_key").on(table.documentNumber)],
);

// ==================== بنود الاقتباسات ====================
export const quoteItems = pgTable(
  "quote_items",
  {
    id: serial().primaryKey().notNull(),
    quoteId: integer("quote_id").notNull(),
    lineNumber: integer("line_number").notNull(),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    unit: varchar({ length: 20 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    quantity: numeric({ precision: 12, scale: 2 }).notNull(),
    lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.quoteId],
      foreignColumns: [quotes.id],
      name: "quote_items_quote_id_fkey",
    }).onDelete("cascade"),
  ],
);

// ==================== قوالب الاقتباسات ====================
export const quoteTemplates = pgTable(
  "quote_templates",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    productName: varchar("product_name", { length: 255 }).notNull(),
    productDescription: text("product_description"),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    unit: varchar({ length: 50 }).default("كجم").notNull(),
    minQuantity: numeric("min_quantity", { precision: 10, scale: 2 }),
    specifications: json(),
    isActive: boolean("is_active").default(true).notNull(),
    category: varchar({ length: 100 }),
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
      foreignColumns: [{ name: "id", table: "users" }],
      name: "quote_templates_created_by_fkey",
    }),
  ],
);

// ==================== الموردون ====================
export const suppliers = pgTable("suppliers", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  contact: varchar({ length: 100 }),
  phone: varchar({ length: 20 }),
  address: text(),
  materialsSupplied: json("materials_supplied"),
  contactPerson: varchar("contact_person", { length: 100 }),
  email: varchar({ length: 100 }),
  isActive: boolean("is_active").default(true),
});
