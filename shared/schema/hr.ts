/**
 * 👥 الموارد البشرية (HR)
 * جداول تتعلق بإدارة الموارد البشرية:
 * - الحضور والغياب
 * - الانتهاكات والعقوبات
 * - التدريب والشهادات
 * - الإجازات والرصيد
 * - تقييم الأداء
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
  date,
  index,
  foreignKey,
  numeric,
  doublePrecision,
  json,
  unique,
  check,
} from "drizzle-orm/pg-core";

// ==================== الدعم الخارجي ====================
// سيتم استيراد users من admin.ts لتجنب التكرار الدائري

// ==================== الحضور والغياب ====================
export const attendance = pgTable(
  "attendance",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    status: varchar({ length: 20 }).default("غائب").notNull(),
    checkInTime: timestamp("check_in_time", { mode: "string" }),
    checkOutTime: timestamp("check_out_time", { mode: "string" }),
    lunchStartTime: timestamp("lunch_start_time", { mode: "string" }),
    lunchEndTime: timestamp("lunch_end_time", { mode: "string" }),
    notes: text(),
    createdBy: integer("created_by"),
    updatedBy: integer("updated_by"),
    date: date()
      .default(sql`CURRENT_DATE`)
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    breakStartTime: timestamp("break_start_time", { mode: "string" }),
    breakEndTime: timestamp("break_end_time", { mode: "string" }),
    workHours: doublePrecision("work_hours"),
    overtimeHours: doublePrecision("overtime_hours"),
    shiftType: varchar("shift_type", { length: 20 }).default("صباحي"),
    lateMinutes: integer("late_minutes").default(0),
    earlyLeaveMinutes: integer("early_leave_minutes").default(0),
    locationAccuracy: doublePrecision("location_accuracy"),
    distanceFromFactory: doublePrecision("distance_from_factory"),
    deviceInfo: text("device_info"),
  },
  (table) => [
    index("idx_attendance_date").using(
      "btree",
      table.date.asc().nullsLast().op("date_ops"),
    ),
    index("idx_attendance_user_date").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.date.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_attendance_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
    ),
  ],
);

// ==================== الانتهاكات ====================
export const violations = pgTable(
  "violations",
  {
    id: serial().primaryKey().notNull(),
    employeeId: integer("employee_id"),
    violationType: varchar("violation_type", { length: 50 }),
    description: text(),
    date: date().notNull(),
    actionTaken: text("action_taken"),
    reportedBy: integer("reported_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "violations_employee_id_users_id_fk",
    }),
    foreignKey({
      columns: [table.reportedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "violations_reported_by_users_id_fk",
    }),
  ],
);

// ==================== انتهاكات العمل ====================
export const userViolations = pgTable(
  "user_violations",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    type: varchar({ length: 100 }).notNull(),
    description: text().notNull(),
    penalty: text().notNull(),
    status: varchar({ length: 20 }).default("معلق").notNull(),
    severity: varchar({ length: 20 }).default("متوسط"),
    createdBy: integer("created_by").notNull(),
    reviewedBy: integer("reviewed_by"),
    date: date()
      .default(sql`CURRENT_DATE`)
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "user_violations_user_id_fkey",
    }).onUpdate("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "user_violations_created_by_fkey",
    }).onUpdate("cascade"),
    foreignKey({
      columns: [table.reviewedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "user_violations_reviewed_by_fkey",
    }).onUpdate("cascade"),
  ],
);

// ==================== أنواع الإجازات ====================
export const leaveTypes = pgTable("leave_types", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text(),
  descriptionAr: text("description_ar"),
  daysPerYear: integer("days_per_year"),
  isPaid: boolean("is_paid").default(true),
  requiresMedicalCertificate: boolean("requires_medical_certificate").default(
    false,
  ),
  minNoticeDays: integer("min_notice_days").default(1),
  maxConsecutiveDays: integer("max_consecutive_days"),
  applicableAfterMonths: integer("applicable_after_months").default(0),
  color: varchar({ length: 20 }).default("#3b82f6"),
  isActive: boolean("is_active").default(true),
});

// ==================== رصيد الإجازات ====================
export const leaveBalances = pgTable(
  "leave_balances",
  {
    id: serial().primaryKey().notNull(),
    employeeId: integer("employee_id").notNull(),
    leaveTypeId: integer("leave_type_id").notNull(),
    year: integer().notNull(),
    allocatedDays: integer("allocated_days").notNull(),
    usedDays: integer("used_days").default(0),
    pendingDays: integer("pending_days").default(0),
    remainingDays: integer("remaining_days").notNull(),
    carriedForward: integer("carried_forward").default(0),
    expiresAt: date("expires_at"),
  },
  (table) => [
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "leave_balances_employee_id_users_id_fkey",
    }),
    foreignKey({
      columns: [table.leaveTypeId],
      foreignColumns: [leaveTypes.id],
      name: "leave_balances_leave_type_id_leave_types_id_fkey",
    }),
  ],
);

// ==================== طلبات الإجازات ====================
export const leaveRequests = pgTable(
  "leave_requests",
  {
    id: serial().primaryKey().notNull(),
    employeeId: integer("employee_id").notNull(),
    leaveTypeId: integer("leave_type_id").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    daysCount: integer("days_count").notNull(),
    reason: text(),
    medicalCertificateUrl: varchar("medical_certificate_url", { length: 500 }),
    emergencyContact: varchar("emergency_contact", { length: 100 }),
    workHandover: text("work_handover"),
    replacementEmployeeId: integer("replacement_employee_id"),
    directManagerId: integer("direct_manager_id"),
    directManagerStatus: varchar("direct_manager_status", {
      length: 20,
    }).default("pending"),
    directManagerComments: text("direct_manager_comments"),
    directManagerActionDate: timestamp("direct_manager_action_date", {
      mode: "string",
    }),
    hrStatus: varchar("hr_status", { length: 20 }).default("pending"),
    hrComments: text("hr_comments"),
    hrActionDate: timestamp("hr_action_date", { mode: "string" }),
    hrReviewedBy: integer("hr_reviewed_by"),
    finalStatus: varchar("final_status", { length: 20 }).default("pending"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "leave_requests_employee_id_users_id_fkey",
    }),
    foreignKey({
      columns: [table.leaveTypeId],
      foreignColumns: [leaveTypes.id],
      name: "leave_requests_leave_type_id_leave_types_id_fkey",
    }),
    foreignKey({
      columns: [table.directManagerId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "leave_requests_direct_manager_id_users_id_fkey",
    }),
    foreignKey({
      columns: [table.replacementEmployeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "leave_requests_replacement_employee_id_users_id_fkey",
    }),
    foreignKey({
      columns: [table.hrReviewedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "leave_requests_hr_reviewed_by_users_id_fkey",
    }),
  ],
);

// ==================== معايير الأداء ====================
export const performanceCriteria = pgTable("performance_criteria", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text(),
  descriptionAr: text("description_ar"),
  category: varchar({ length: 50 }),
  weightPercentage: integer("weight_percentage").default(20),
  applicableRoles: json("applicable_roles"),
  isActive: boolean("is_active").default(true),
});

// ==================== تقييمات الأداء ====================
export const performanceReviews = pgTable(
  "performance_reviews",
  {
    id: serial().primaryKey().notNull(),
    employeeId: integer("employee_id").notNull(),
    reviewerId: integer("reviewer_id").notNull(),
    reviewPeriodStart: date("review_period_start").notNull(),
    reviewPeriodEnd: date("review_period_end").notNull(),
    reviewType: varchar("review_type", { length: 20 }),
    overallRating: integer("overall_rating"),
    goalsAchievement: integer("goals_achievement"),
    skillsRating: integer("skills_rating"),
    behaviorRating: integer("behavior_rating"),
    strengths: text(),
    areasForImprovement: text("areas_for_improvement"),
    developmentPlan: text("development_plan"),
    goalsForNextPeriod: text("goals_for_next_period"),
    employeeComments: text("employee_comments"),
    reviewerComments: text("reviewer_comments"),
    hrComments: text("hr_comments"),
    status: varchar({ length: 20 }).default("draft"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    completedAt: timestamp("completed_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "performance_reviews_employee_id_users_id_fkey",
    }),
    foreignKey({
      columns: [table.reviewerId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "performance_reviews_reviewer_id_users_id_fkey",
    }),
  ],
);

// ==================== تقييمات الأداء التفصيلية ====================
export const performanceRatings = pgTable(
  "performance_ratings",
  {
    id: serial().primaryKey().notNull(),
    reviewId: integer("review_id").notNull(),
    criteriaId: integer("criteria_id").notNull(),
    rating: integer().notNull(),
    comments: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [performanceReviews.id],
      name: "performance_ratings_review_id_performance_reviews_id_fkey",
    }),
    foreignKey({
      columns: [table.criteriaId],
      foreignColumns: [performanceCriteria.id],
      name: "performance_ratings_criteria_id_performance_criteria_id_fkey",
    }),
  ],
);

// ==================== برامج التدريب ====================
export const trainingPrograms = pgTable(
  "training_programs",
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 200 }).notNull(),
    titleAr: varchar("title_ar", { length: 200 }),
    description: text(),
    descriptionAr: text("description_ar"),
    category: varchar({ length: 50 }),
    durationHours: integer("duration_hours"),
    maxParticipants: integer("max_participants"),
    prerequisites: text(),
    learningObjectives: json("learning_objectives"),
    materials: json(),
    instructorId: integer("instructor_id"),
    status: varchar({ length: 20 }).default("active"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    type: varchar({ length: 20 }).default("field"),
    trainingScope: varchar("training_scope", { length: 50 }),
    location: varchar({ length: 200 }),
    practicalRequirements: text("practical_requirements"),
    departmentId: varchar("department_id", { length: 20 }),
  },
  (table) => [
    foreignKey({
      columns: [table.instructorId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "training_programs_instructor_id_users_id_fkey",
    }),
  ],
);

// ==================== مواد التدريب ====================
export const trainingMaterials = pgTable(
  "training_materials",
  {
    id: serial().primaryKey().notNull(),
    programId: integer("program_id"),
    title: varchar({ length: 200 }).notNull(),
    titleAr: varchar("title_ar", { length: 200 }),
    type: varchar({ length: 20 }),
    content: text(),
    fileUrl: varchar("file_url", { length: 500 }),
    orderIndex: integer("order_index").default(0),
    durationMinutes: integer("duration_minutes"),
    isMandatory: boolean("is_mandatory").default(true),
  },
  (table) => [
    foreignKey({
      columns: [table.programId],
      foreignColumns: [trainingPrograms.id],
      name: "training_materials_program_id_training_programs_id_fkey",
    }),
  ],
);

// ==================== تسجيلات التدريب ====================
export const trainingRecords = pgTable(
  "training_records",
  {
    id: serial().primaryKey().notNull(),
    employeeId: integer("employee_id"),
    trainingType: varchar("training_type", { length: 100 }),
    trainingName: varchar("training_name", { length: 200 }),
    date: date().notNull(),
    status: varchar({ length: 20 }).default("completed"),
    instructor: varchar({ length: 100 }),
    notes: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "training_records_employee_id_users_id_fkey",
    }),
  ],
);

// ==================== التسجيلات التدريبية ====================
export const trainingEnrollments = pgTable(
  "training_enrollments",
  {
    id: serial().primaryKey().notNull(),
    programId: integer("program_id"),
    employeeId: integer("employee_id"),
    enrolledDate: timestamp("enrolled_date", { mode: "string" }).defaultNow(),
    startDate: date("start_date"),
    completionDate: date("completion_date"),
    status: varchar({ length: 20 }).default("enrolled"),
    progressPercentage: integer("progress_percentage").default(0),
    finalScore: integer("final_score"),
    certificateIssued: boolean("certificate_issued").default(false),
    trainingDate: date("training_date"),
    attendanceStatus: varchar("attendance_status", { length: 20 }).default(
      "enrolled",
    ),
    completionStatus: varchar("completion_status", { length: 20 }).default(
      "not_started",
    ),
    attendanceNotes: text("attendance_notes"),
    practicalPerformance: varchar("practical_performance", { length: 20 }),
    certificateNumber: varchar("certificate_number", { length: 50 }),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "training_enrollments_employee_id_users_id_fkey",
    }),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [trainingPrograms.id],
      name: "training_enrollments_program_id_training_programs_id_fkey",
    }),
  ],
);

// ==================== شهادات التدريب ====================
export const trainingCertificates = pgTable(
  "training_certificates",
  {
    id: serial().primaryKey().notNull(),
    enrollmentId: integer("enrollment_id"),
    employeeId: integer("employee_id"),
    programId: integer("program_id"),
    certificateNumber: varchar("certificate_number", { length: 50 }).notNull(),
    issueDate: date("issue_date").notNull(),
    expiryDate: date("expiry_date"),
    finalScore: integer("final_score"),
    certificateStatus: varchar("certificate_status", { length: 20 }).default(
      "active",
    ),
    issuedBy: integer("issued_by"),
    certificateFileUrl: varchar("certificate_file_url", { length: 500 }),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    unique("training_certificates_enrollment_id_key").on(table.enrollmentId),
    unique("training_certificates_certificate_number_key").on(
      table.certificateNumber,
    ),
    foreignKey({
      columns: [table.enrollmentId],
      foreignColumns: [trainingEnrollments.id],
      name: "training_certificates_enrollment_id_fkey",
    }),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "training_certificates_employee_id_fkey",
    }),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [trainingPrograms.id],
      name: "training_certificates_program_id_fkey",
    }),
    foreignKey({
      columns: [table.issuedBy],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "training_certificates_issued_by_fkey",
    }),
  ],
);

// ==================== تقييمات التدريب ====================
export const trainingEvaluations = pgTable(
  "training_evaluations",
  {
    id: serial().primaryKey().notNull(),
    enrollmentId: integer("enrollment_id"),
    programId: integer("program_id"),
    employeeId: integer("employee_id"),
    evaluatorId: integer("evaluator_id"),
    evaluationDate: date("evaluation_date").notNull(),
    theoreticalUnderstanding: integer("theoretical_understanding"),
    practicalSkills: integer("practical_skills"),
    safetyCompliance: integer("safety_compliance"),
    teamwork: integer(),
    communication: integer(),
    overallRating: integer("overall_rating"),
    strengths: text(),
    areasForImprovement: text("areas_for_improvement"),
    additionalNotes: text("additional_notes"),
    recommendation: varchar({ length: 20 }),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.enrollmentId],
      foreignColumns: [trainingEnrollments.id],
      name: "training_evaluations_enrollment_id_fkey",
    }),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [trainingPrograms.id],
      name: "training_evaluations_program_id_fkey",
    }),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "training_evaluations_employee_id_fkey",
    }),
    foreignKey({
      columns: [table.evaluatorId],
      foreignColumns: [{ name: "id", table: "users" }],
      name: "training_evaluations_evaluator_id_fkey",
    }),
  ],
);
