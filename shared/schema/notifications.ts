/**
 * 📢 الإشعارات والرسائل (Notifications & Messaging)
 * جداول تتعلق بالإشعارات والرسائل والمحادثات
 * 
 * الجداول المضمنة:
 * - notification_templates: قوالب الإشعارات
 * - notification_event_settings: إعدادات أحداث الإشعارات
 * - notification_event_logs: سجلات الأحداث
 * - notifications: الإشعارات المرسلة
 * - conversations: المحادثات بين المستخدمين
 * - messages: الرسائل والتبادلات
 * - quick_notes: الملاحظات السريعة
 * - note_attachments: مرفقات الملاحظات
 */

export {
  notificationTemplates,
  notificationEventSettings,
  notificationEventLogs,
  notifications,
  conversations,
  messages,
  quickNotes,
  noteAttachments,
} from "../../migrations/schema";
