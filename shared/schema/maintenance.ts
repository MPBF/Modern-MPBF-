/**
 * 🔧 الصيانة والإصلاح (Maintenance)
 * جداول تتعلق بصيانة الآلات والإصلاح والقطع الغيار
 * 
 * الجداول المضمنة:
 * - maintenance_requests: طلبات الصيانة
 * - maintenance_actions: إجراءات الصيانة المتخذة
 * - maintenance_reports: تقارير الصيانة
 * - operator_negligence_reports: تقارير إهمال المشغلين
 * - spare_parts: قائمة القطع الغيار
 */

export {
  maintenanceRequests,
  maintenanceActions,
  maintenanceReports,
  operatorNegligenceReports,
  spareParts,
} from "../../migrations/schema";
