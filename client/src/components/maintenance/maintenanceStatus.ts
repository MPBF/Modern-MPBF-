import type { TFunction } from "i18next";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusText = (status: string, t: TFunction) => {
  switch (status) {
    case "pending":
      return t("maintenance.status.pending");
    case "in_progress":
      return t("maintenance.status.inProgress");
    case "completed":
      return t("maintenance.status.completed");
    case "cancelled":
      return t("maintenance.status.cancelled");
    default:
      return status;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPriorityText = (priority: string, t: TFunction) => {
  switch (priority) {
    case "high":
      return t("maintenance.priority.high");
    case "medium":
      return t("maintenance.priority.medium");
    case "low":
      return t("maintenance.priority.low");
    default:
      return priority;
  }
};
