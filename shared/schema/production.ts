/**
 * 📦 الإنتاج (Production)
 * جداول تتعلق بعمليات الإنتاج الأساسية:
 * - الطلبات الإنتاجية
 * - الرولات (الأفلام المُنتجة)
 * - القص والتقطيع
 * - الآلات
 * - الأخطاء والفاقد
 */

import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  numeric,
  timestamp,
  integer,
  boolean,
  date,
  text,
  index,
  foreignKey,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { users } from "./admin";
import { customerProducts, orders } from "./orders";

// ==================== الآلات ====================
export const machines = pgTable(
  "machines",
  {
    id: varchar({ length: 20 }).primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    nameAr: varchar("name_ar", { length: 100 }),
    type: varchar({ length: 50 }),
    sectionId: varchar("section_id", { length: 20 }),
    status: varchar({ length: 20 }).default("active"),
    capacitySmallKgPerHour: numeric("capacity_small_kg_per_hour", {
      precision: 8,
      scale: 2,
    }),
    capacityMediumKgPerHour: numeric("capacity_medium_kg_per_hour", {
      precision: 8,
      scale: 2,
    }),
    capacityLargeKgPerHour: numeric("capacity_large_kg_per_hour", {
      precision: 8,
      scale: 2,
    }),
    screwType: varchar("screw_type", { length: 10 }).default("A"),
  },
  (table) => [
    index("idx_machines_section_id").using(
      "btree",
      table.sectionId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_machines_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    index("idx_machines_type").using(
      "btree",
      table.type.asc().nullsLast().op("text_ops"),
    ),
    check(
      "screw_type_valid",
      sql`(screw_type IS NULL) OR ((screw_type)::text = ANY (ARRAY[('A'::character varying)::text, ('ABA'::character varying)::text]))`,
    ),
  ],
);

// ==================== الطلبات الإنتاجية ====================
export const productionOrders = pgTable(
  "production_orders",
  {
    id: serial().primaryKey().notNull(),
    productionOrderNumber: varchar("production_order_number", {
      length: 50,
    }).notNull(),
    orderId: integer("order_id").notNull(),
    customerProductId: integer("customer_product_id"),
    quantityKg: numeric("quantity_kg", { precision: 10, scale: 2 }).notNull(),
    status: varchar({ length: 30 }).default("pending"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    overrunPercentage: numeric("overrun_percentage", { precision: 5, scale: 2 })
      .default("5.00")
      .notNull(),
    finalQuantityKg: numeric("final_quantity_kg", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    producedQuantityKg: numeric("produced_quantity_kg", {
      precision: 10,
      scale: 2,
    })
      .default("0")
      .notNull(),
    printedQuantityKg: numeric("printed_quantity_kg", {
      precision: 10,
      scale: 2,
    })
      .default("0")
      .notNull(),
    netQuantityKg: numeric("net_quantity_kg", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    wasteQuantityKg: numeric("waste_quantity_kg", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    filmCompletionPercentage: numeric("film_completion_percentage", {
      precision: 5,
      scale: 2,
    })
      .default("0")
      .notNull(),
    printingCompletionPercentage: numeric("printing_completion_percentage", {
      precision: 5,
      scale: 2,
    })
      .default("0")
      .notNull(),
    cuttingCompletionPercentage: numeric("cutting_completion_percentage", {
      precision: 5,
      scale: 2,
    })
      .default("0")
      .notNull(),
    assignedMachineId: varchar("assigned_machine_id", { length: 20 }),
    assignedOperatorId: integer("assigned_operator_id"),
    productionStartTime: timestamp("production_start_time", { mode: "string" }),
    productionEndTime: timestamp("production_end_time", { mode: "string" }),
    productionTimeMinutes: integer("production_time_minutes"),
    filmCompleted: boolean("film_completed").default(false),
    printingCompleted: boolean("printing_completed").default(false),
    isFinalRollCreated: boolean("is_final_roll_created").default(false),
    cuttingCompleted: boolean("cutting_completed").default(false),
  },
  (table) => [
    index("idx_production_orders_assigned_machine_id").using(
      "btree",
      table.assignedMachineId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_production_orders_assigned_operator_id").using(
      "btree",
      table.assignedOperatorId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_production_orders_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamp_ops"),
    ),
    index("idx_production_orders_order_id").using(
      "btree",
      table.orderId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_production_orders_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    index("idx_production_orders_status_order_id").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
      table.orderId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.assignedMachineId],
      foreignColumns: [machines.id],
      name: "production_orders_assigned_machine_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.assignedOperatorId],
      foreignColumns: [users.id],
      name: "production_orders_assigned_operator_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.customerProductId],
      foreignColumns: [customerProducts.id],
      name: "production_orders_customer_product_id_customer_products_id_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: "production_orders_order_id_orders_id_fk",
    }),
    unique("production_orders_production_order_number_unique").on(
      table.productionOrderNumber,
    ),
  ],
);

// ==================== الرولات (الأفلام) ====================
export const rolls = pgTable(
  "rolls",
  {
    id: serial().primaryKey().notNull(),
    rollNumber: varchar("roll_number", { length: 50 }).notNull(),
    weight: numeric({ precision: 8, scale: 2 }),
    status: varchar({ length: 30 }).default("for_printing"),
    currentStage: varchar("current_stage", { length: 30 }).default("film"),
    machineId: varchar("machine_id", { length: 20 }),
    employeeId: integer("employee_id"),
    qrCode: varchar("qr_code", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    completedAt: timestamp("completed_at", { mode: "string" }),
    rollSeq: integer("roll_seq"),
    qrCodeText: text("qr_code_text"),
    qrPngBase64: text("qr_png_base64"),
    weightKg: numeric("weight_kg", { precision: 12, scale: 3 }),
    cutWeightTotalKg: numeric("cut_weight_total_kg", {
      precision: 12,
      scale: 3,
    }).default("0"),
    wasteKg: numeric("waste_kg", { precision: 12, scale: 3 }).default("0"),
    printedAt: timestamp("printed_at", { mode: "string" }),
    cutCompletedAt: timestamp("cut_completed_at", { mode: "string" }),
    performedBy: integer("performed_by"),
    stage: varchar({ length: 20 }),
    productionOrderId: integer("production_order_id"),
    createdBy: integer("created_by"),
    printedBy: integer("printed_by"),
    cutBy: integer("cut_by"),
    filmMachineId: varchar("film_machine_id", { length: 20 }),
    printingMachineId: varchar("printing_machine_id", { length: 20 }),
    cuttingMachineId: varchar("cutting_machine_id", { length: 20 }),
    isLastRoll: boolean("is_last_roll").default(false),
    productionTimeMinutes: integer("production_time_minutes"),
    rollCreatedAt: timestamp("roll_created_at", {
      mode: "string",
    }).defaultNow(),
    rollDimensions: varchar("roll_dimensions", { length: 100 }),
    sideGussets: numeric("side_gussets", { precision: 8, scale: 2 }),
  },
  (table) => [
    index("idx_rolls_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamp_ops"),
    ),
    index("idx_rolls_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_rolls_cutting_machine_id").using(
      "btree",
      table.cuttingMachineId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_rolls_film_machine_id").using(
      "btree",
      table.filmMachineId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_rolls_printing_machine_id").using(
      "btree",
      table.printingMachineId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_rolls_production_order_id").using(
      "btree",
      table.productionOrderId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_rolls_stage").using(
      "btree",
      table.stage.asc().nullsLast().op("text_ops"),
    ),
    index("idx_rolls_stage_created_at").using(
      "btree",
      table.stage.asc().nullsLast().op("timestamp_ops"),
      table.createdAt.desc().nullsFirst().op("text_ops"),
    ),
    index("idx_rolls_stage_status").using(
      "btree",
      table.stage.asc().nullsLast().op("text_ops"),
      table.status.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "rolls_created_by_fkey",
    }),
    foreignKey({
      columns: [table.cutBy],
      foreignColumns: [users.id],
      name: "rolls_cut_by_fkey",
    }),
    foreignKey({
      columns: [table.cuttingMachineId],
      foreignColumns: [machines.id],
      name: "rolls_cutting_machine_id_machines_id_fk",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [users.id],
      name: "rolls_employee_id_users_id_fk",
    }),
    foreignKey({
      columns: [table.filmMachineId],
      foreignColumns: [machines.id],
      name: "rolls_film_machine_id_machines_id_fk",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.machineId],
      foreignColumns: [machines.id],
      name: "rolls_machine_id_machines_id_fk",
    }),
    foreignKey({
      columns: [table.printedBy],
      foreignColumns: [users.id],
      name: "rolls_printed_by_fkey",
    }),
    foreignKey({
      columns: [table.printingMachineId],
      foreignColumns: [machines.id],
      name: "rolls_printing_machine_id_machines_id_fk",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.productionOrderId],
      foreignColumns: [productionOrders.id],
      name: "rolls_production_order_id_production_orders_id_fk",
    }),
    unique("rolls_roll_number_unique").on(table.rollNumber),
  ],
);

// ==================== القص والتقطيع ====================
export const cuts = pgTable(
  "cuts",
  {
    id: serial().primaryKey().notNull(),
    rollId: integer("roll_id").notNull(),
    cutWeightKg: numeric("cut_weight_kg", {
      precision: 12,
      scale: 3,
    }).notNull(),
    piecesCount: integer("pieces_count"),
    performedBy: integer("performed_by"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("cuts_roll_created_idx").using(
      "btree",
      table.rollId.asc().nullsLast().op("int4_ops"),
      table.createdAt.desc().nullsFirst().op("int4_ops"),
    ),
    index("idx_cuts_performed_by").using(
      "btree",
      table.performedBy.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_cuts_roll_id").using(
      "btree",
      table.rollId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.performedBy],
      foreignColumns: [users.id],
      name: "cuts_performed_by_fkey",
    }),
    foreignKey({
      columns: [table.rollId],
      foreignColumns: [rolls.id],
      name: "cuts_roll_id_fkey",
    }).onDelete("cascade"),
  ],
);

// ==================== الفاقد والهدر ====================
export const waste = pgTable(
  "waste",
  {
    id: serial().primaryKey().notNull(),
    rollId: integer("roll_id"),
    jobOrderId: integer("job_order_id"),
    quantityWasted: numeric("quantity_wasted", {
      precision: 8,
      scale: 2,
    }).notNull(),
    reason: varchar({ length: 100 }),
    stage: varchar({ length: 50 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    productionOrderId: integer("production_order_id"),
  },
  (table) => [
    index("idx_waste_production_order_id").using(
      "btree",
      table.productionOrderId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_waste_roll_id").using(
      "btree",
      table.rollId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_waste_stage").using(
      "btree",
      table.stage.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.rollId],
      foreignColumns: [rolls.id],
      name: "waste_roll_id_rolls_id_fk",
    }),
  ],
);

// ==================== قوائم انتظار الآلات ====================
export const machineQueues = pgTable(
  "machine_queues",
  {
    id: serial().primaryKey().notNull(),
    machineId: varchar("machine_id", { length: 20 }).notNull(),
    productionOrderId: integer("production_order_id").notNull(),
    queuePosition: integer("queue_position").notNull(),
    estimatedStartTime: timestamp("estimated_start_time", { mode: "string" }),
    assignedAt: timestamp("assigned_at", { mode: "string" }).defaultNow(),
    assignedBy: integer("assigned_by"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_machine_queues_machine_id").using(
      "btree",
      table.machineId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_machine_queues_production_order_id").using(
      "btree",
      table.productionOrderId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.assignedBy],
      foreignColumns: [users.id],
      name: "machine_queues_assigned_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.machineId],
      foreignColumns: [machines.id],
      name: "machine_queues_machine_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.productionOrderId],
      foreignColumns: [productionOrders.id],
      name: "machine_queues_production_order_id_fkey",
    }).onDelete("cascade"),
  ],
);

// ==================== دفعات المزج ====================
export const mixingBatches = pgTable(
  "mixing_batches",
  {
    id: serial().primaryKey().notNull(),
    batchNumber: varchar("batch_number", { length: 50 }).notNull(),
    productionOrderId: integer("production_order_id").notNull(),
    machineId: varchar("machine_id", { length: 20 }).notNull(),
    operatorId: integer("operator_id").notNull(),
    totalWeightKg: numeric("total_weight_kg", {
      precision: 10,
      scale: 2,
    }).notNull(),
    status: varchar({ length: 30 }).default("pending").notNull(),
    notes: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    screwAssignment: varchar("screw_assignment", { length: 10 })
      .default("A")
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.machineId],
      foreignColumns: [machines.id],
      name: "mixing_batches_machine_id_fkey",
    }),
    foreignKey({
      columns: [table.operatorId],
      foreignColumns: [users.id],
      name: "mixing_batches_operator_id_fkey",
    }),
    foreignKey({
      columns: [table.productionOrderId],
      foreignColumns: [productionOrders.id],
      name: "mixing_batches_production_order_id_fkey",
    }),
    unique("mixing_batches_batch_number_key").on(table.batchNumber),
    check(
      "screw_assignment_valid",
      sql`(screw_assignment)::text = ANY (ARRAY[('A'::character varying)::text, ('B'::character varying)::text])`,
    ),
    check("total_weight_positive", sql`total_weight_kg > (0)::numeric`),
  ],
);

// ==================== مكونات الدفعات ====================
export const batchIngredients = pgTable(
  "batch_ingredients",
  {
    id: serial().primaryKey().notNull(),
    batchId: integer("batch_id").notNull(),
    actualWeightKg: numeric("actual_weight_kg", {
      precision: 10,
      scale: 2,
    }).notNull(),
    notes: text(),
    itemId: varchar("item_id", { length: 20 }).notNull(),
    percentage: numeric({ precision: 5, scale: 2 }),
  },
  (table) => [
    foreignKey({
      columns: [table.batchId],
      foreignColumns: [mixingBatches.id],
      name: "batch_ingredients_batch_id_fkey",
    }).onDelete("cascade"),
    check(
      "actual_weight_positive",
      sql`(actual_weight_kg IS NULL) OR (actual_weight_kg > (0)::numeric)`,
    ),
    check(
      "percentage_valid",
      sql`(percentage IS NULL) OR ((percentage > (0)::numeric) AND (percentage <= (100)::numeric))`,
    ),
  ],
);

// ==================== إعدادات الإنتاج ====================
export const productionSettings = pgTable("production_settings", {
  id: serial().primaryKey().notNull(),
  overrunTolerancePercent: numeric("overrun_tolerance_percent", {
    precision: 5,
    scale: 2,
  })
    .default("3")
    .notNull(),
  allowLastRollOverrun: boolean("allow_last_roll_overrun")
    .default(true)
    .notNull(),
  qrPrefix: varchar("qr_prefix", { length: 32 }).default("ROLL").notNull(),
});
