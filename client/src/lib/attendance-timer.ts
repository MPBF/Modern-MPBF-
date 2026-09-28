export interface AttendanceTimerRecord {
  id: number;
  status: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  lunch_start_time?: string | null;
  lunch_end_time?: string | null;
  created_at?: string | null;
}
export interface AttendanceWithdrawalTimer {
  started_at: string;
  ended_at?: string | null;
}

type TimeInterval = { start: number; end: number };

function toTimestamp(value?: string | null): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function sumMergedIntervals(
  intervals: TimeInterval[],
  windowStart: number,
  windowEnd: number,
): number {
  const normalized = intervals
    .map(({ start, end }) => ({
      start: Math.max(windowStart, start),
      end: Math.min(windowEnd, end),
    }))
    .filter(({ start, end }) => end > start)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  let total = 0;
  let current: TimeInterval | null = null;
  for (const interval of normalized) {
    if (!current) {
      current = { ...interval };
    } else if (interval.start <= current.end) {
      current.end = Math.max(current.end, interval.end);
    } else {
      total += current.end - current.start;
      current = { ...interval };
    }
  }
  if (current) total += current.end - current.start;
  return total;
}

export function calculateWorkedSeconds(
  records: AttendanceTimerRecord[],
  now: Date,
  withdrawals: AttendanceWithdrawalTimer[] = [],
): number {
  const ordered = [...records].sort((a, b) => {
    const ta = new Date(a.created_at || a.check_in_time || 0).getTime();
    const tb = new Date(b.created_at || b.check_in_time || 0).getTime();
    return ta - tb || a.id - b.id;
  });
  const eventTime = (
    value: string | null | undefined,
    record: AttendanceTimerRecord,
  ) => toTimestamp(value) ?? toTimestamp(record.created_at);
  const checkIn = ordered
    .filter((r) => r.check_in_time || r.status === "حاضر")
    .map((r) => eventTime(r.check_in_time, r))
    .filter((value): value is number => value != null)
    .sort((a, b) => a - b)[0];
  if (checkIn == null) return 0;
  const checkout = ordered
    .filter((r) => r.check_out_time || r.status === "مغادر")
    .map((r) => eventTime(r.check_out_time, r))
    .filter((value): value is number => value != null && value >= checkIn)
    .sort((a, b) => a - b)[0];
  const end = Math.max(checkIn, checkout ?? now.getTime());

  const breakEvents = ordered
    .flatMap((record) => {
      // Fall back to created_at only for the matching legacy action.
      // Other rows (including check-in) also have created_at, but they
      // must not manufacture a break that consumes the entire work session.
      const start =
        toTimestamp(record.lunch_start_time) ??
        (record.status === "في الاستراحة"
          ? toTimestamp(record.created_at)
          : null);
      const finish =
        toTimestamp(record.lunch_end_time) ??
        (record.status === "يعمل"
          ? toTimestamp(record.created_at)
          : null);
      return [
        ...(start == null ? [] : [{ type: "start" as const, at: start }]),
        ...(finish == null ? [] : [{ type: "end" as const, at: finish }]),
      ];
    })
    .sort((a, b) => a.at - b.at || (a.type === "end" ? -1 : 1));

  const excludedIntervals: TimeInterval[] = [];
  let openBreak: number | null = null;
  for (const event of breakEvents) {
    if (event.type === "start" && openBreak == null) {
      openBreak = event.at;
    } else if (event.type === "end" && openBreak != null) {
      excludedIntervals.push({ start: openBreak, end: event.at });
      openBreak = null;
    }
  }
  if (openBreak != null) {
    excludedIntervals.push({ start: openBreak, end });
  }

  for (const withdrawal of withdrawals) {
    const start = toTimestamp(withdrawal.started_at);
    if (start == null) continue;
    excludedIntervals.push({
      start,
      end: toTimestamp(withdrawal.ended_at) ?? end,
    });
  }

  const excludedMs = sumMergedIntervals(excludedIntervals, checkIn, end);
  return Math.max(
    0,
    (end - checkIn - excludedMs) / 1000,
  );
}