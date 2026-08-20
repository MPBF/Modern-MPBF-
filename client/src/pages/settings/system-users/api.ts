export async function jsonFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "include", ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || `تعذر تنفيذ الطلب (${response.status})`);
  return body as T;
}

export function parseArray(value: unknown, fallback: any[] = []) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : fallback; } catch { return fallback; }
  }
  return fallback;
}

export const EDITABLE_SYSTEM_USER_SETTING_KEYS = [
  "enabled",
  "allowed_days",
  "shift",
  "absence_pct",
  "late_pct",
  "late_max_minutes",
  "early_leave_pct",
  "early_leave_max_minutes",
  "persona",
  "daily_message_target",
  "daily_message_cap",
  "weekly_report_enabled",
  "weekly_report_recipient_id",
  "attendance_start_date",
  "reply_style",
  "reply_instructions",
  "reply_delay_min_minutes",
  "reply_delay_max_minutes",
  "reply_allowed_days",
  "reply_window_start",
  "reply_window_end",
  "allowed_message_categories",
] as const;

export function pickEditableSystemUserSettings(
  input: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    EDITABLE_SYSTEM_USER_SETTING_KEYS.flatMap((key) =>
      input[key] === undefined ? [] : [[key, input[key]]],
    ),
  );
}