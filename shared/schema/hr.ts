/**
 * 👥 الموارد البشرية والتدريب (HR & Training)
 * جداول تتعلق بإدارة الموظفين والحضور والإجازات والتدريب والأداء
 * 
 * الجداول المضمنة:
 * - attendance: سجل الحضور والغياب
 * - violations: الانتهاكات والعقوبات
 * - user_violations: انتهاكات العمل
 * - leave_types: أنواع الإجازات
 * - leave_balances: أرصدة الإجازات
 * - leave_requests: طلبات الإجازات
 * - performance_criteria: معايير تقييم الأداء
 * - performance_reviews: تقييمات الأداء
 * - performance_ratings: تقييمات تفصيلية
 * - training_programs: برامج التدريب
 * - training_materials: مواد التدريب
 * - training_records: تسجيلات التدريب
 * - training_enrollments: التسجيلات التدريبية
 * - training_certificates: شهادات التدريب
 * - training_evaluations: تقييمات التدريب
 */

export {
  attendance,
  violations,
  userViolations,
  leaveTypes,
  leaveBalances,
  leaveRequests,
  performanceCriteria,
  performanceReviews,
  performanceRatings,
  trainingPrograms,
  trainingMaterials,
  trainingRecords,
  trainingEnrollments,
  trainingCertificates,
  trainingEvaluations,
} from "../../migrations/schema";
