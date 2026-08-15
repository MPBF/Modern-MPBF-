import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

import { useAuth } from "../../hooks/use-auth";
import { useSSE, type SSENotification } from "../../hooks/use-sse";
import { useToast } from "../../hooks/use-toast";

/**
 * App-level real-time notification listener.
 *
 * Keeps a single SSE connection alive for the authenticated user on every
 * page, showing a toast the moment a notification arrives (e.g. when an HR
 * request is approved/rejected) instead of only inside NotificationCenter.
 *
 * The notifications page mounts NotificationCenter which has its own SSE
 * connection and toast handling, so we suppress our toast there to avoid
 * duplicates.
 */
export default function GlobalNotificationListener() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.must_change_password) return null;

  return <GlobalNotificationListenerInner />;
}

function GlobalNotificationListenerInner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  const onNotificationsPage = location.startsWith("/notifications");

  const handleNewNotification = useCallback(
    (notification: SSENotification) => {
      if (notification.type === "system") return;

      if (!onNotificationsPage) {
        toast({
          title:
            (notification.icon ? notification.icon + " " : "") +
            (notification.title_ar || notification.title),
          description: notification.message_ar || notification.message,
          duration:
            notification.priority === "urgent"
              ? 10000
              : notification.priority === "high"
                ? 7000
                : 5000,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });

      // رسالة داخلية جديدة: حدّث عداد غير المقروء وقائمة الرسائل فوراً
      if (notification.context_type === "internal_message") {
        queryClient.invalidateQueries({
          queryKey: ["/api/messages/unread-count"],
        });
        queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      }
    },
    [toast, queryClient, onNotificationsPage],
  );

  const handlers = useMemo(
    () => ({ onNotification: handleNewNotification }),
    [handleNewNotification],
  );

  useSSE(handlers);

  return null;
}
