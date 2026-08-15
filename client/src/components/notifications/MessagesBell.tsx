import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { Link } from "wouter";

import { useAuth } from "../../hooks/use-auth";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

/**
 * أيقونة المراسلات الداخلية في الشريط العلوي مع عدّاد الرسائل غير المقروءة.
 * تظهر في كل الصفحات وتُحدَّث دورياً وفورياً عند وصول إشعار رسالة جديدة
 * (يُبطل GlobalNotificationListener مفتاح الاستعلام عند وصول الإشعار).
 */
export function MessagesBell() {
  const { user } = useAuth();

  const { data } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const unreadCount = Number(data?.count ?? 0);

  return (
    <Link to="/messages">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        data-testid="button-messages-bell"
      >
        <Mail className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            data-testid="badge-unread-messages"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
