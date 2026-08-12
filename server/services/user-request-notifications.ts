/**
 * Builds the in-app notification sent to the owner of an HR user request
 * when a reviewer approves/rejects (or otherwise changes the status of)
 * their request.
 *
 * Returns null when no notification should be sent (no status change,
 * still pending, or no resolvable owner).
 */
import type { SystemNotificationData } from "./notification-manager";

export interface UserRequestDecisionNotification {
  userId: number;
  payload: SystemNotificationData;
}

export function buildUserRequestDecisionNotification(
  request: any,
  update: Record<string, any>,
): UserRequestDecisionNotification | null {
  if (!update.status || update.status === "معلق") return null;
  const ownerId = Number(request?.user_id);
  if (!ownerId) return null;

  const approved =
    String(update.status).startsWith("موافق") || update.status === "مقبول";
  const rejected = update.status === "مرفوض";
  const title = request?.title || "طلبك";
  const responseText = update.response ? `\nالرد: ${update.response}` : "";
  const messageAr = approved
    ? `تمت الموافقة على طلبك "${title}".${responseText}`
    : rejected
      ? `تم رفض طلبك "${title}".${responseText}`
      : `تم تحديث حالة طلبك "${title}" إلى: ${update.status}.${responseText}`;

  return {
    userId: ownerId,
    payload: {
      title: approved
        ? "Your request was approved"
        : rejected
          ? "Your request was rejected"
          : "Your request status was updated",
      title_ar: approved
        ? "تمت الموافقة على طلبك"
        : rejected
          ? "تم رفض طلبك"
          : "تم تحديث حالة طلبك",
      message: messageAr,
      message_ar: messageAr,
      type: "hr" as const,
      priority: "high" as const,
      context_type: "user_request",
      context_id: String(request?.id ?? ""),
    },
  };
}
