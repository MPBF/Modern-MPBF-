import { z } from "zod";

import type { TFunction } from "i18next";

export const createMaintenanceActionSchema = (t: TFunction) =>
  z.object({
    maintenance_request_id: z.number(),
    action_type: z
      .string()
      .min(1, t("maintenance.validation.actionTypeRequired")),
    description: z
      .string()
      .min(1, t("maintenance.validation.descriptionRequired")),
    text_report: z.string().optional(),
    spare_parts_request: z.string().optional(),
    machining_request: z.string().optional(),
    operator_negligence_report: z.string().optional(),
    performed_by: z
      .string()
      .min(1, t("maintenance.validation.performerRequired")),
    requires_management_action: z.boolean().optional(),
    management_notified: z.boolean().optional(),
  });

export const createMaintenanceReportSchema = (t: TFunction) =>
  z.object({
    report_type: z
      .string()
      .min(1, t("maintenance.validation.reportTypeRequired")),
    title: z.string().min(1, t("maintenance.validation.titleRequired")),
    description: z
      .string()
      .min(1, t("maintenance.validation.descriptionRequired")),
    machine_id: z.string().optional(),
    severity: z.string().default("medium"),
    priority: z.string().default("medium"),
    spare_parts_needed: z.array(z.string()).optional(),
    estimated_repair_time: z.number().optional(),
  });

export const createOperatorNegligenceSchema = (t: TFunction) =>
  z.object({
    operator_id: z
      .string()
      .min(1, t("maintenance.validation.operatorIdRequired")),
    operator_name: z
      .string()
      .min(1, t("maintenance.validation.operatorNameRequired")),
    incident_date: z
      .string()
      .min(1, t("maintenance.validation.incidentDateRequired")),
    incident_type: z
      .string()
      .min(1, t("maintenance.validation.incidentTypeRequired")),
    description: z
      .string()
      .min(1, t("maintenance.validation.descriptionRequired")),
    severity: z.string().default("medium"),
    witnesses: z.array(z.string()).optional(),
    immediate_actions_taken: z.string().optional(),
  });

export const createMaintenanceRequestSchema = (t: TFunction) =>
  z.object({
    machine_id: z
      .string()
      .min(1, t("maintenance.validation.equipmentRequired")),
    issue_type: z
      .string()
      .min(1, t("maintenance.validation.issueTypeRequired")),
    urgency_level: z.string().default("normal"),
    description: z
      .string()
      .min(1, t("maintenance.validation.descriptionRequired")),
    assigned_to: z.string().optional(),
  });
