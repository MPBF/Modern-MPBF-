/**
 * 📦 المستودعات والمخزون (Inventory)
 * جداول تتعلق بإدارة المخزون والتخزين:
 * - المواد الخام والمنتجات النهائية
 * - عمليات الحركة والتحويل
 * - فحص المخزون
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
  index,
  foreignKey,
  unique,
  check,
  date,
} from "drizzle-orm/pg-core";

// ==================== الأصناف والمواد ====================
export const items = pgTable(
  "items",
  {
    id: varchar({ length: 20 }).primaryKey().notNull(),
    name: varchar({ length: 100 }),
    nameAr: varchar("name_ar", { length: 100 }),
    categoryId: varchar("category_id", { length: 20 }),
    status: varchar({ length: 20 }).default("active"),
    code: varchar({ length: 50 }),
  },
  (table) => [
    index("idx_items_category_id").using(
      "btree",
      table.categoryId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_items_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
  ],
);

// ==================== المواقع والأماكن ====================
export const locations = pgTable("locations", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  coordinates: varchar({ length: 100 }),
  toleranceRange: integer("tolerance_range"),
});

// ==================== المخزون ====================
export const inventory = pgTable(
  "inventory",
  {
    id: serial().primaryKey().notNull(),
    itemId: varchar("item_id", { length: 20 }).notNull(),
    locationId: integer("location_id"),
    currentStock: numeric("current_stock", { precision: 10, scale: 2 }).default(
      "0",
    ),
    minStock: numeric("min_stock", { precision: 10, scale: 2 }).default("0"),
    maxStock: numeric("max_stock", { precision: 10, scale: 2 }).default("0"),
    unit: varchar({ length: 20 }).default("كيلو"),
    costPerUnit: numeric("cost_per_unit", { precision: 10, scale: 4 }),
    lastUpdated: timestamp("last_updated", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_inventory_item_id").using(
      "btree",
      table.itemId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_inventory_location_id").using(
      "btree",
      table.locationId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [items.id],
      name: "inventory_item_id_items_id_fkey",
    }),
    foreignKey({
      columns: [table.locationId],
      foreignColumns: [locations.id],
      name: "inventory_location_id_locations_id_fkey",
    }),
  ],
);

// ==================== حركات المخزون ====================
export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: serial().primaryKey().notNull(),
    inventoryId: integer("inventory_id"),
    movementType: varchar("movement_type", { length: 20 }).notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).notNull(),
    unitCost: numeric("unit_cost", { precision: 10, scale: 4 }),
    totalCost: numeric("total_cost", { precision: 10, scale: 4 }),
    referenceNumber: varchar("reference_number", { length: 50 }),
    referenceType: varchar("reference_type", { length: 20 }),
    notes: text(),
    createdBy: integer("created_by"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_inventory_movements_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamp_ops"),
    ),
    index("idx_inventory_movements_inventory_id").using(
      "btree",
      table.inventoryId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_inventory_movements_movement_type").using(
      "btree",
      table.movementType.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.inventoryId],
      foreignColumns: [inventory.id],
      name: "inventory_movements_inventory_id_inventory_id_fkey",
    }),
  ],
);

// ==================== فحص المخزون ====================
export const inventoryCounts = pgTable(
  "inventory_counts",
  {
    id: serial().primaryKey().notNull(),
    countNumber: varchar("count_number", { length: 50 }).notNull(),
    countDate: timestamp("count_date", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    countType: varchar("count_type", { length: 50 }).default("periodic"),
    locationId: integer("location_id"),
    status: varchar({ length: 50 }).default("in_progress"),
    notes: text(),
    completedAt: timestamp("completed_at", { mode: "string" }),
    createdBy: integer("created_by"),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    unique("inventory_counts_count_number_key").on(table.countNumber),
  ],
);

// ==================== تفاصيل فحص المخزون ====================
export const inventoryCountItems = pgTable(
  "inventory_count_items",
  {
    id: serial().primaryKey().notNull(),
    countId: integer("count_id"),
    itemId: varchar("item_id", { length: 100 }),
    barcode: varchar({ length: 100 }),
    systemQuantity: numeric("system_quantity", {
      precision: 15,
      scale: 3,
    }).default("0"),
    countedQuantity: numeric("counted_quantity", {
      precision: 15,
      scale: 3,
    }).default("0"),
    difference: numeric({ precision: 15, scale: 3 }).default("0"),
    unit: varchar({ length: 50 }).default("كيلو"),
    notes: text(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.countId],
      foreignColumns: [inventoryCounts.id],
      name: "inventory_count_items_count_id_fkey",
    }),
  ],
);

// ==================== حركات المستودع ====================
export const warehouseTransactions = pgTable(
  "warehouse_transactions",
  {
    id: serial().primaryKey().notNull(),
    type: varchar({ length: 30 }),
    itemId: varchar("item_id", { length: 20 }),
    quantity: numeric({ precision: 10, scale: 2 }).notNull(),
    fromLocation: varchar("from_location", { length: 100 }),
    toLocation: varchar("to_location", { length: 100 }),
    date: timestamp({ mode: "string" }).defaultNow(),
    referenceId: integer("reference_id"),
    notes: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [items.id],
      name: "warehouse_transactions_item_id_items_id_fkey",
    }),
  ],
);

// ==================== عمليات المراسلات الخام (In) ====================
export const rawMaterialVouchersIn = pgTable(
  "raw_material_vouchers_in",
  {
    id: serial().primaryKey().notNull(),
    voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
    voucherDate: timestamp("voucher_date", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    voucherType: varchar("voucher_type", { length: 50 }).default("purchase"),
    itemId: varchar("item_id", { length: 100 }),
    quantity: numeric({ precision: 15, scale: 3 }).default("0"),
    unit: varchar({ length: 50 }).default("كيلو"),
    barcode: varchar({ length: 100 }),
    batchNumber: varchar("batch_number", { length: 100 }),
    supplierId: integer("supplier_id"),
    unitPrice: numeric("unit_price", { precision: 15, scale: 3 }),
    expiryDate: date("expiry_date"),
    locationId: integer("location_id"),
    notes: text(),
    status: varchar({ length: 50 }).default("completed"),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    totalPrice: numeric("total_price", { precision: 12, scale: 4 }),
    receivedBy: integer("received_by"),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    unique("raw_material_vouchers_in_voucher_number_key").on(
      table.voucherNumber,
    ),
    foreignKey({
      columns: [table.receivedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "raw_material_vouchers_in_received_by_fkey",
    }),
  ],
);

// ==================== عمليات المراسلات الخام (Out) ====================
export const rawMaterialVouchersOut = pgTable(
  "raw_material_vouchers_out",
  {
    id: serial().primaryKey().notNull(),
    voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
    voucherDate: timestamp("voucher_date", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    voucherType: varchar("voucher_type", { length: 50 }).default(
      "production_transfer",
    ),
    itemId: varchar("item_id", { length: 100 }),
    quantity: numeric({ precision: 15, scale: 3 }).default("0"),
    unit: varchar({ length: 50 }).default("كيلو"),
    barcode: varchar({ length: 100 }),
    batchNumber: varchar("batch_number", { length: 100 }),
    toDestination: varchar("to_destination", { length: 255 }),
    issuedTo: varchar("issued_to", { length: 255 }),
    productionOrderId: integer("production_order_id"),
    locationId: integer("location_id"),
    notes: text(),
    status: varchar({ length: 50 }).default("completed"),
    createdBy: integer("created_by"),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    unique("raw_material_vouchers_out_voucher_number_key").on(
      table.voucherNumber,
    ),
  ],
);

// ==================== عمليات المنتجات النهائية (In) ====================
export const finishedGoodsVouchersIn = pgTable(
  "finished_goods_vouchers_in",
  {
    id: serial().primaryKey().notNull(),
    voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
    voucherDate: timestamp("voucher_date", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    voucherType: varchar("voucher_type", { length: 50 }).default(
      "production_receipt",
    ),
    itemId: varchar("item_id", { length: 100 }),
    quantity: numeric({ precision: 15, scale: 3 }).default("0"),
    unit: varchar({ length: 50 }).default("كيلو"),
    barcode: varchar({ length: 100 }),
    batchNumber: varchar("batch_number", { length: 100 }),
    customerId: varchar("customer_id", { length: 100 }),
    productionOrderId: integer("production_order_id"),
    weightKg: numeric("weight_kg", { precision: 15, scale: 3 }),
    piecesCount: integer("pieces_count"),
    fromProductionLine: varchar("from_production_line", { length: 100 }),
    deliveredBy: varchar("delivered_by", { length: 255 }),
    locationId: integer("location_id"),
    notes: text(),
    status: varchar({ length: 50 }).default("completed"),
    createdBy: integer("created_by"),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    unique("finished_goods_vouchers_in_voucher_number_key").on(
      table.voucherNumber,
    ),
  ],
);

// ==================== عمليات المنتجات النهائية (Out) ====================
export const finishedGoodsVouchersOut = pgTable(
  "finished_goods_vouchers_out",
  {
    id: serial().primaryKey().notNull(),
    voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
    voucherDate: timestamp("voucher_date", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    voucherType: varchar("voucher_type", { length: 50 }).default(
      "customer_delivery",
    ),
    itemId: varchar("item_id", { length: 100 }),
    quantity: numeric({ precision: 15, scale: 3 }).default("0"),
    unit: varchar({ length: 50 }).default("كيلو"),
    barcode: varchar({ length: 100 }),
    batchNumber: varchar("batch_number", { length: 100 }),
    customerId: varchar("customer_id", { length: 100 }).notNull(),
    driverName: varchar("driver_name", { length: 255 }),
    driverPhone: varchar("driver_phone", { length: 50 }),
    vehicleNumber: varchar("vehicle_number", { length: 100 }),
    deliveryAddress: text("delivery_address"),
    weightKg: numeric("weight_kg", { precision: 15, scale: 3 }),
    piecesCount: integer("pieces_count"),
    locationId: integer("location_id"),
    notes: text(),
    status: varchar({ length: 50 }).default("completed"),
    createdBy: integer("created_by"),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    unique("finished_goods_vouchers_out_voucher_number_key").on(
      table.voucherNumber,
    ),
  ],
);

// ==================== استقبالات المستودع ====================
export const warehouseReceipts = pgTable(
  "warehouse_receipts",
  {
    id: serial().primaryKey().notNull(),
    cutId: integer("cut_id"),
    receivedWeightKg: numeric("received_weight_kg", {
      precision: 12,
      scale: 3,
    }).notNull(),
    receivedBy: integer("received_by"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    productionOrderId: integer("production_order_id"),
  },
  (table) => [
    index("idx_warehouse_receipts_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamp_ops"),
    ),
    index("idx_warehouse_receipts_cut_id").using(
      "btree",
      table.cutId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_warehouse_receipts_production_order_id").using(
      "btree",
      table.productionOrderId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_warehouse_receipts_received_by").using(
      "btree",
      table.receivedBy.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.receivedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "warehouse_receipts_received_by_fkey",
    }),
  ],
);

// ==================== الأجزاء القابلة للاستهلاك ====================
export const consumableParts = pgTable(
  "consumable_parts",
  {
    id: serial().primaryKey().notNull(),
    partId: varchar("part_id", { length: 50 }).notNull(),
    type: varchar({ length: 100 }).notNull(),
    code: varchar({ length: 50 }).notNull(),
    currentQuantity: integer("current_quantity").default(0).notNull(),
    minQuantity: integer("min_quantity").default(0),
    maxQuantity: integer("max_quantity").default(0),
    unit: varchar({ length: 20 }).default("قطعة"),
    barcode: varchar({ length: 100 }),
    location: varchar({ length: 100 }),
    notes: text(),
    status: varchar({ length: 20 }).default("active"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    unique("consumable_parts_part_id_key").on(table.partId),
    check("current_quantity_non_negative", sql`current_quantity >= 0`),
    check("max_quantity_non_negative", sql`max_quantity >= 0`),
    check("min_quantity_non_negative", sql`min_quantity >= 0`),
  ],
);

// ==================== حركات الأجزاء القابلة للاستهلاك ====================
export const consumablePartsTransactions = pgTable(
  "consumable_parts_transactions",
  {
    id: serial().primaryKey().notNull(),
    transactionId: varchar("transaction_id", { length: 50 }).notNull(),
    consumablePartId: integer("consumable_part_id").notNull(),
    transactionType: varchar("transaction_type", { length: 10 }).notNull(),
    quantity: integer().notNull(),
    barcodeScanned: varchar("barcode_scanned", { length: 100 }),
    manualEntry: boolean("manual_entry").default(false),
    transactionReason: varchar("transaction_reason", { length: 100 }),
    notes: text(),
    performedBy: integer("performed_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    unique("consumable_parts_transactions_transaction_id_key").on(
      table.transactionId,
    ),
    foreignKey({
      columns: [table.consumablePartId],
      foreignColumns: [consumableParts.id],
      name: "consumable_parts_transactions_consumable_part_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.performedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "consumable_parts_transactions_performed_by_fkey",
    }).onDelete("restrict"),
    check("quantity_positive", sql`quantity > 0`),
    check(
      "transaction_type_valid",
      sql`(transaction_type)::text = ANY (ARRAY[('in'::character varying)::text, ('out'::character varying)::text])`,
    ),
  ],
);
