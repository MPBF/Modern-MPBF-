/**
 * 🔧 الصيانة (Maintenance)
 * جداول تتعلق بصيانة الآلات والعمليات الدورية
 */

import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  date,
  boolean,
  numeric,
  index,
  foreignKey,
  unique,
  check,
} from "drizzle-orm/pg-core";

// ==================== طلبات الصيانة ====================
export const maintenanceRequests = pgTable(
  "maintenance_requests",
  {
    id: serial().primaryKey().notNull(),
    machineId: varchar("machine_id", { length: 20 }),
    reportedBy: varchar("reported_by", { length: 20 }),
    issueType: varchar("issue_type", { length: 50 }),
    description: text(),
    urgencyLevel: varchar("urgency_level", { length: 20 }).default("normal"),
    status: varchar({ length: 20 }).default("open"),
    assignedTo: varchar("assigned_to", { length: 20 }),
    actionTaken: text("action_taken"),
    dateReported: timestamp("date_reported", { mode: "string" }).defaultNow(),
    dateResolved: timestamp("date_resolved", { mode: "string" }),
    requestNumber: varchar("request_number", { length: 50 }),
  },
  (table) => [
    unique("maintenance_requests_request_number_key").on(table.requestNumber),
    index("idx_maintenance_requests_date_reported").using(
      "btree",
      table.dateReported.desc().nullsFirst().op("timestamp_ops"),
    ),
    index("idx_maintenance_requests_machine_id").using(
      "btree",
      table.machineId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_maintenance_requests_reported_by").using(
      "btree",
      table.reportedBy.asc().nullsLast().op("text_ops"),
    ),
    index("idx_maintenance_requests_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
  ],
);

// ==================== إجراءات الصيانة ====================
export const maintenanceActions = pgTable(
  "maintenance_actions",
  {
    id: serial().primaryKey().notNull(),
    actionNumber: varchar("action_number", { length: 50 }).notNull(),
    maintenanceRequestId: integer("maintenance_request_id").notNull(),
    actionType: varchar("action_type", { length: 100 }).notNull(),
    actionDate: timestamp("action_date", { mode: "string" }).defaultNow(),
    description: text(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    textReport: text("text_report"),
    sparePartsRequest: text("spare_parts_request"),
    machiningRequest: text("machining_request"),
    operatorNegligenceReport: text("operator_negligence_report"),
    performedBy: varchar("performed_by", { length: 20 }),
    requestCreatedBy: varchar("request_created_by", { length: 20 }),
    requiresManagementAction: boolean("requires_management_action").default(
      false,
    ),
    managementNotified: boolean("management_notified").default(false),
  },
  (table) => [
    unique("maintenance_actions_action_number_key").on(table.actionNumber),
  ],
);

// ==================== تقارير الصيانة ====================
export const maintenanceReports = pgTable(
  "maintenance_reports",
  {
    id: serial().primaryKey().notNull(),
    reportNumber: varchar("report_number", { length: 50 }).notNull(),
    reportType: varchar("report_type", { length: 100 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    reportedByUserId: integer("reported_by_user_id").notNull(),
    machineId: varchar("machine_id", { length: 50 }),
    severity: varchar({ length: 50 }).default("medium"),
    status: varchar({ length: 50 }).default("open"),
    priority: varchar({ length: 50 }).default("medium"),
    attachments: text().array(),
    assignedToUserId: integer("assigned_to_user_id"),
    resolutionNotes: text("resolution_notes"),
    estimatedRepairTime: numeric("estimated_repair_time", {
      precision: 5,
      scale: 2,
    }),
    actualRepairTime: numeric("actual_repair_time", { precision: 5, scale: 2 }),
    sparePartsNeeded: text("spare_parts_needed").array(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    resolvedAt: timestamp("resolved_at", { mode: "string" }),
    maintenanceActionId: integer("maintenance_action_id"),
    reviewedBy: varchar("reviewed_by", { length: 20 }),
    reviewNotes: text("review_notes"),
    reviewDate: timestamp("review_date", { mode: "string" }),
    createdBy: varchar("created_by", { length: 20 }),
  },
  (table) => [
    unique("maintenance_reports_report_number_key").on(table.reportNumber),
  ],
);

// ==================== تقارير إهمال المشغلين ====================
export const operatorNegligenceReports = pgTable(
  "operator_negligence_reports",
  {
    id: serial().primaryKey().notNull(),
    reportNumber: varchar("report_number", { length: 50 }).notNull(),
    operatorId: varchar("operator_id", { length: 50 }).notNull(),
    operatorName: varchar("operator_name", { length: 255 }).notNull(),
    incidentDate: date("incident_date").notNull(),
    reportDate: date("report_date").default(sql`CURRENT_DATE`),
    incidentType: varchar("incident_type", { length: 100 }).notNull(),
    description: text().notNull(),
    severity: varchar({ length: 50 }).default("medium"),
    witnesses: text().array(),
    evidencePhotos: text("evidence_photos").array(),
    immediateActionsTaken: text("immediate_actions_taken"),
    reportedByUserId: integer("reported_by_user_id").notNull(),
    reviewedByUserId: integer("reviewed_by_user_id"),
    managementDecision: text("management_decision"),
    disciplinaryAction: text("disciplinary_action"),
    status: varchar({ length: 50 }).default("pending"),
    followUpRequired: boolean("follow_up_required").default(false),
    followUpNotes: text("follow_up_notes"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    maintenanceActionId: integer("maintenance_action_id"),
    negligenceType: varchar("negligence_type", { length: 50 }),
    evidence: text(),
    damageCost: numeric("damage_cost", { precision: 10, scale: 2 }),
    downtimeHours: integer("downtime_hours"),
    actionTaken: text("action_taken"),
    reportedBy: varchar("reported_by", { length: 20 }),
    investigatedBy: varchar("investigated_by", { length: 20 }),
    investigationDate: timestamp("investigation_date", { mode: "string" }),
    machineId: varchar("machine_id", { length: 20 }),
  },
  (table) => [
    unique("operator_negligence_reports_report_number_key").on(
      table.reportNumber,
    ),
  ],
);

// ==================== الأجزاء الغيار ====================
export const spareParts = pgTable(
  "spare_parts",
  {
    id: serial().primaryKey().notNull(),
    partId: varchar("part_id", { length: 50 }).notNull(),
    machineName: varchar("machine_name", { length: 100 }).notNull(),
    partName: varchar("part_name", { length: 100 }).notNull(),
    code: varchar({ length: 50 }).notNull(),
    serialNumber: varchar("serial_number", { length: 100 }).notNull(),
    specifications: text(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [unique("spare_parts_part_id_key").on(table.partId)],
);

// ==================== جداول الصيانة الدورية ====================
export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial().primaryKey().notNull(),
  machineId: varchar("machine_id", { length: 20 }).notNull(),
  maintenanceType: varchar("maintenance_type", { length: 50 }).notNull(),
  frequencyDays: integer("frequency_days").notNull(),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  description: text(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

// ==================== قوائم فحص الصيانة الدورية ====================
export const preventiveMaintenanceChecklists = pgTable(
  "preventive_maintenance_checklists",
  {
    id: serial().primaryKey().notNull(),
    machineId: varchar("machine_id", { length: 20 }).notNull(),
    checklistNumber: varchar("checklist_number", { length: 50 }).notNull(),
    inspectionDate: date("inspection_date").notNull(),
    performedBy: integer("performed_by"),
    status: varchar({ length: 20 }).default("pending"),
    items: text().array(),
    notes: text(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    unique("preventive_maintenance_checklists_checklist_number_key").on(
      table.checklistNumber,
    ),
  ],
);
