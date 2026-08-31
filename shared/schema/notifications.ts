/**
 * 📢 الإشعارات والرسائل (Notifications)
 * جداول تتعلق بالإشعارات والتنبيهات والرسائل
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
  json,
} from "drizzle-orm/pg-core";

// ==================== قوالب الإشعارات ====================
export const notificationTemplates = pgTable("notification_templates", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text(),
  descriptionAr: text("description_ar"),
  subject: varchar({ length: 255 }),
  subjectAr: varchar("subject_ar", { length: 255 }),
  body: text().notNull(),
  bodyAr: text("body_ar"),
  type: varchar({ length: 50 }).default("info"),
  variables: json(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: timestamp("updated_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// ==================== إعدادات أحداث الإشعارات ====================
export const notificationEventSettings = pgTable(
  "notification_event_settings",
  {
    id: serial().primaryKey().notNull(),
    eventKey: varchar("event_key", { length: 100 }).notNull(),
    eventName: varchar("event_name", { length: 200 }).notNull(),
    eventNameAr: varchar("event_name_ar", { length: 200 }).notNull(),
    eventDescription: text("event_description"),
    eventDescriptionAr: text("event_description_ar"),
    eventCategory: varchar("event_category", { length: 50 }).notNull(),
    isEnabled: boolean("is_enabled").default(true),
    whatsappEnabled: boolean("whatsapp_enabled").default(false),
    whatsappTemplateId: integer("whatsapp_template_id"),
    messageTemplate: text("message_template"),
    messageTemplateAr: text("message_template_ar"),
    recipientType: varchar("recipient_type", { length: 30 }).default(
      "specific_users",
    ),
    recipientUserIds: json("recipient_user_ids"),
    recipientRoleIds: json("recipient_role_ids"),
    notifyCustomer: boolean("notify_customer").default(false),
    conditionEnabled: boolean("condition_enabled").default(false),
    conditionField: varchar("condition_field", { length: 100 }),
    conditionOperator: varchar("condition_operator", { length: 20 }),
    conditionValue: varchar("condition_value", { length: 100 }),
    priority: varchar({ length: 20 }).default("normal"),
    delayMinutes: integer("delay_minutes").default(0),
    createdBy: integer("created_by"),
    updatedBy: integer("updated_by"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    recipientPhoneNumbers: json("recipient_phone_numbers"),
  },
  (table) => [
    unique("notification_event_settings_event_key_key").on(table.eventKey),
    foreignKey({
      columns: [table.whatsappTemplateId],
      foreignColumns: [notificationTemplates.id],
      name: "notification_event_settings_whatsapp_template_id_fkey",
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "notification_event_settings_created_by_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "notification_event_settings_updated_by_fkey",
    }),
  ],
);

// ==================== سجلات أحداث الإشعارات ====================
export const notificationEventLogs = pgTable(
  "notification_event_logs",
  {
    id: serial().primaryKey().notNull(),
    eventSettingId: integer("event_setting_id"),
    eventKey: varchar("event_key", { length: 100 }).notNull(),
    triggerContextType: varchar("trigger_context_type", { length: 50 }),
    triggerContextId: varchar("trigger_context_id", { length: 50 }),
    triggerData: json("trigger_data"),
    messageSent: text("message_sent"),
    messageSentAr: text("message_sent_ar"),
    recipientPhone: varchar("recipient_phone", { length: 30 }),
    recipientUserId: integer("recipient_user_id"),
    recipientName: varchar("recipient_name", { length: 200 }),
    status: varchar({ length: 30 }).default("pending"),
    errorMessage: text("error_message"),
    externalMessageId: varchar("external_message_id", { length: 100 }),
    triggeredAt: timestamp("triggered_at", { mode: "string" }).defaultNow(),
    sentAt: timestamp("sent_at", { mode: "string" }),
    deliveredAt: timestamp("delivered_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.eventSettingId],
      foreignColumns: [notificationEventSettings.id],
      name: "notification_event_logs_event_setting_id_fkey",
    }),
    foreignKey({
      columns: [table.recipientUserId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "notification_event_logs_recipient_user_id_fkey",
    }),
  ],
);

// ==================== الإشعارات ====================
export const notifications = pgTable(
  "notifications",
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 255 }),
    titleAr: varchar("title_ar", { length: 255 }),
    message: text().notNull(),
    messageAr: text("message_ar"),
    type: varchar({ length: 50 }).default("info"),
    priority: varchar({ length: 20 }).default("normal"),
    status: varchar({ length: 20 }).default("pending"),
    recipientId: varchar("recipient_id", { length: 50 }),
    phoneNumber: varchar("phone_number", { length: 20 }),
    twilioSid: varchar("twilio_sid", { length: 100 }),
    sentAt: timestamp("sent_at", { mode: "string" }),
    deliveredAt: timestamp("delivered_at", { mode: "string" }),
    errorMessage: text("error_message"),
    contextType: varchar("context_type", { length: 50 }),
    contextId: varchar("context_id", { length: 50 }),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    recipientType: varchar("recipient_type", { length: 20 })
      .default("user")
      .notNull(),
    readAt: timestamp("read_at", { mode: "string" }),
    externalStatus: varchar("external_status", { length: 30 }),
    scheduledFor: timestamp("scheduled_for", { mode: "string" }),
    createdBy: integer("created_by"),
  },
  (table) => [
    index("idx_notifications_recipient_created").using(
      "btree",
      table.recipientId.asc().nullsLast().op("text_ops"),
      table.createdAt.desc().nullsFirst().op("text_ops"),
    ),
    index("idx_notifications_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "notifications_created_by_fkey",
    }).onUpdate("cascade"),
  ],
);

// ==================== المحادثات ====================
export const conversations = pgTable("conversations", {
  id: serial().primaryKey().notNull(),
  title: text().notNull(),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// ==================== الرسائل ====================
export const messages = pgTable(
  "messages",
  {
    id: serial().primaryKey().notNull(),
    conversationId: integer("conversation_id").notNull(),
    role: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: "messages_conversation_id_fkey",
    }).onDelete("cascade"),
  ],
);

// ==================== الملاحظات السريعة ====================
export const quickNotes = pgTable(
  "quick_notes",
  {
    id: serial().primaryKey().notNull(),
    content: text().notNull(),
    noteType: varchar("note_type", { length: 50 }).notNull(),
    priority: varchar({ length: 20 }).default("normal"),
    createdBy: integer("created_by").notNull(),
    assignedTo: integer("assigned_to").notNull(),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_quick_notes_assigned_to").using(
      "btree",
      table.assignedTo.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_quick_notes_created_by").using(
      "btree",
      table.createdBy.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "quick_notes_created_by_fkey",
    }),
    foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "quick_notes_assigned_to_fkey",
    }),
  ],
);

// ==================== مرفقات الملاحظات ====================
export const noteAttachments = pgTable(
  "note_attachments",
  {
    id: serial().primaryKey().notNull(),
    noteId: integer("note_id").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull(),
    fileUrl: text("file_url").notNull(),
    uploadedAt: timestamp("uploaded_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_note_attachments_note_id").using(
      "btree",
      table.noteId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.noteId],
      foreignColumns: [quickNotes.id],
      name: "note_attachments_note_id_fkey",
    }).onDelete("cascade"),
  ],
);
