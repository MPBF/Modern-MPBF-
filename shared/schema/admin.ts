/**
 * 👤 الإدارة والنظام (Admin & System)
 * جداول تتعلق بالمستخدمين والأدوار والإعدادات والجلسات
 * 
 * الجداول المضمنة:
 * - users: حسابات المستخدمين
 * - roles: الأدوار والصلاحيات
 * - user_settings: إعدادات المستخدم الشخصية
 * - user_requests: الطلبات من المستخدمين
 * - admin_decisions: قرارات الإدارة
 * - system_settings: إعدادات النظام العامة
 * - system_performance_metrics: مقاييس أداء النظام
 * - sessions: جلسات المستخدم (التقليدية)
 * - user_sessions: جلسات المستخدم (بديلة)
 * - company_profile: ملف تعريف الشركة
 * - ai_agent_knowledge: معرفة الوكيل الذكي
 * - ai_agent_settings: إعدادات الوكيل الذكي
 */

export {
  roles,
  users,
  userSettings,
  userRequests,
  adminDecisions,
  systemSettings,
  systemPerformanceMetrics,
  sessions,
  userSessions,
  companyProfile,
  aiAgentKnowledge,
  aiAgentSettings,
} from "../../migrations/schema";
